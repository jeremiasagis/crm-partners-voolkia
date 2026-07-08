-- ═══════════════════════════════════════════════════════════════
-- Voolkia CRM — Migración 003: Portal de Partners
-- Roles (admin/partner) · RLS por rol · Vistas del portal ·
-- Leads referidos (buzón de solicitudes)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1. Vincular usuarios a partners
-- ─────────────────────────────────────────────
alter table public.profiles
  add column if not exists partner_id uuid references public.partners (id) on delete set null;

-- ─────────────────────────────────────────────
-- 2. Helpers de rol (security definer: evitan recursión de RLS)
-- ─────────────────────────────────────────────
create or replace function public.is_internal()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_partner_id()
returns uuid
language sql stable security definer set search_path = ''
as $$
  select partner_id from public.profiles where id = auth.uid();
$$;

-- ─────────────────────────────────────────────
-- 3. Leads referidos por partners (buzón de solicitudes)
-- ─────────────────────────────────────────────
create table public.lead_submissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners (id) on delete cascade not null,
  submitted_by uuid references public.profiles (id),
  cliente_final_name text not null,
  cliente_final_country text,
  contacto_nombre text,
  contacto_email text,
  contacto_phone text,
  descripcion text,
  monto_estimado_usd numeric(12,2),
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'aprobada', 'rechazada')),
  motivo_rechazo text,
  oportunidad_id uuid references public.oportunidades (id) on delete set null,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create index on public.lead_submissions (partner_id, created_at desc);
create index on public.lead_submissions (estado);

-- ─────────────────────────────────────────────
-- 4. RLS por rol — reemplaza las policies "todos ven todo"
-- ─────────────────────────────────────────────

-- profiles: cada uno ve el suyo; los internos ven todos
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_internal());

-- partners: internos todo; el partner puede leer SOLO su propia ficha
drop policy if exists "partners_all" on public.partners;
create policy "partners_internal_all" on public.partners
  for all to authenticated
  using (public.is_internal()) with check (public.is_internal());
create policy "partners_own_read" on public.partners
  for select to authenticated
  using (id = public.current_partner_id());

-- contactos / oportunidades / actividades / adjuntos / objetivos:
-- SOLO internos (el partner accede vía vistas del portal)
drop policy if exists "contactos_all" on public.contactos;
create policy "contactos_internal_all" on public.contactos
  for all to authenticated
  using (public.is_internal()) with check (public.is_internal());

drop policy if exists "oportunidades_all" on public.oportunidades;
create policy "oportunidades_internal_all" on public.oportunidades
  for all to authenticated
  using (public.is_internal()) with check (public.is_internal());

drop policy if exists "actividades_all" on public.actividades;
create policy "actividades_internal_all" on public.actividades
  for all to authenticated
  using (public.is_internal()) with check (public.is_internal());

drop policy if exists "adjuntos_all" on public.adjuntos;
create policy "adjuntos_internal_all" on public.adjuntos
  for all to authenticated
  using (public.is_internal()) with check (public.is_internal());

drop policy if exists "objetivos_all" on public.objetivos;
create policy "objetivos_internal_all" on public.objetivos
  for all to authenticated
  using (public.is_internal()) with check (public.is_internal());

-- historial de etapas: internos (el partner lo ve vía vista)
drop policy if exists "historial_select" on public.oportunidad_etapa_historial;
drop policy if exists "historial_insert" on public.oportunidad_etapa_historial;
create policy "historial_internal_select" on public.oportunidad_etapa_historial
  for select to authenticated using (public.is_internal());
create policy "historial_internal_insert" on public.oportunidad_etapa_historial
  for insert to authenticated with check (public.is_internal());

-- lead_submissions: internos todo; el partner crea y ve las suyas
alter table public.lead_submissions enable row level security;
create policy "leads_internal_all" on public.lead_submissions
  for all to authenticated
  using (public.is_internal()) with check (public.is_internal());
create policy "leads_partner_select" on public.lead_submissions
  for select to authenticated
  using (partner_id = public.current_partner_id());
create policy "leads_partner_insert" on public.lead_submissions
  for insert to authenticated
  with check (
    partner_id = public.current_partner_id()
    and estado = 'pendiente'
    and submitted_by = auth.uid()
  );

-- storage: solo internos
drop policy if exists "adjuntos_storage_select" on storage.objects;
drop policy if exists "adjuntos_storage_insert" on storage.objects;
drop policy if exists "adjuntos_storage_update" on storage.objects;
drop policy if exists "adjuntos_storage_delete" on storage.objects;
create policy "adjuntos_storage_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'adjuntos' and public.is_internal());
create policy "adjuntos_storage_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'adjuntos' and public.is_internal());
create policy "adjuntos_storage_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'adjuntos' and public.is_internal());
create policy "adjuntos_storage_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'adjuntos' and public.is_internal());

-- ─────────────────────────────────────────────
-- 5. Vistas del portal (security definer + filtro por partner)
--    Exponen SOLO columnas aptas para el partner:
--    sin notas internas, sin próximas acciones, sin owners.
-- ─────────────────────────────────────────────
create or replace view public.portal_partner as
select id, legal_name, commercial_name, country_code, tier, status, signed_at
from public.partners
where id = public.current_partner_id();

create or replace view public.portal_oportunidades as
select id, partner_id, cliente_final_name, cliente_final_country, componente,
       monto_estimado_usd, comision_estimada_usd, probabilidad, etapa,
       fecha_estimada_cierre, fecha_real_cierre, motivo_perdida,
       created_at, updated_at
from public.oportunidades
where partner_id = public.current_partner_id();

create or replace view public.portal_etapa_historial as
select h.id, h.oportunidad_id, h.etapa_anterior, h.etapa_nueva, h.changed_at
from public.oportunidad_etapa_historial h
join public.oportunidades o on o.id = h.oportunidad_id
where o.partner_id = public.current_partner_id();

grant select on public.portal_partner to authenticated;
grant select on public.portal_oportunidades to authenticated;
grant select on public.portal_etapa_historial to authenticated;
revoke all on public.portal_partner from anon;
revoke all on public.portal_oportunidades from anon;
revoke all on public.portal_etapa_historial from anon;

-- ─────────────────────────────────────────────
-- 6. Realtime para el buzón de leads
-- ─────────────────────────────────────────────
do $$
begin
  begin
    alter publication supabase_realtime add table public.lead_submissions;
  exception when duplicate_object then null;
  end;
end;
$$;
