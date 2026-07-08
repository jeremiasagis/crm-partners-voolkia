-- ═══════════════════════════════════════════════════════════════
-- Voolkia CRM — Migración inicial
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → pegar y Run
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1. PROFILES (extiende auth.users)
-- ─────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text unique,
  role text default 'admin',
  country_code text,
  phone text,
  created_at timestamptz default now()
);

-- Auto-crear profile cuando se da de alta un usuario en auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
-- 2. PARTNERS
-- ─────────────────────────────────────────────
create table public.partners (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  commercial_name text,
  country_code text not null,
  partner_type text check (partner_type in ('agencia_rys_it', 'consultora_boutique', 'headhunter', 'otro')),
  size text check (size in ('unipersonal', 'boutique_2_10', 'empresa_10_50', 'empresa_50_plus')),
  website text,
  industries text[],
  tier text check (tier in ('A', 'B', 'C')),
  status text check (status in ('prospect', 'en_proceso_firma', 'activo', 'pausado', 'baja')),
  funnel_stage text check (funnel_stage in ('prospect', 'primer_contacto', 'reunion_inicial', 'propuesta_enviada', 'negociacion', 'firma_pendiente', 'activo')),
  source text check (source in ('referido', 'outbound', 'inbound', 'evento', 'otro')),
  owner_id uuid references public.profiles (id),
  notes text,
  signed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 3. CONTACTOS
-- ─────────────────────────────────────────────
create table public.contactos (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners (id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  role text,
  email text,
  phone text,
  linkedin text,
  is_decision_maker boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 4. OPORTUNIDADES
-- ─────────────────────────────────────────────
create table public.oportunidades (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners (id) on delete cascade not null,
  cliente_final_name text not null,
  cliente_final_country text,
  componente text check (componente in ('R-A', 'R-B', 'T', 'P')) not null,
  monto_estimado_usd numeric(12,2) not null default 0,
  comision_estimada_usd numeric(12,2) default 0,
  probabilidad int check (probabilidad between 0 and 100) default 50,
  etapa text check (etapa in ('lead', 'calificada', 'propuesta', 'negociacion', 'ganada', 'perdida')) default 'lead',
  fecha_estimada_cierre date,
  fecha_real_cierre date,
  proxima_accion text,
  proxima_accion_fecha date,
  notes text,
  owner_id uuid references public.profiles (id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 5. ACTIVIDADES
-- ─────────────────────────────────────────────
create table public.actividades (
  id uuid primary key default gen_random_uuid(),
  tipo text check (tipo in ('llamada', 'reunion', 'email', 'whatsapp', 'nota', 'otro')) not null,
  fecha timestamptz not null default now(),
  partner_id uuid references public.partners (id) on delete cascade,
  contacto_id uuid references public.contactos (id) on delete set null,
  oportunidad_id uuid references public.oportunidades (id) on delete set null,
  titulo text not null,
  descripcion text,
  proxima_accion text,
  proxima_accion_fecha date,
  owner_id uuid references public.profiles (id),
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 6. ADJUNTOS
-- ─────────────────────────────────────────────
create table public.adjuntos (
  id uuid primary key default gen_random_uuid(),
  entity_type text check (entity_type in ('partner', 'oportunidad')) not null,
  entity_id uuid not null,
  file_name text not null,
  file_path text not null,
  file_size int,
  file_type text,
  uploaded_by uuid references public.profiles (id),
  uploaded_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 7. ÍNDICES
-- ─────────────────────────────────────────────
create index on public.partners (country_code, status);
create index on public.partners (funnel_stage);
create index on public.partners (owner_id);
create index on public.contactos (partner_id);
create index on public.oportunidades (partner_id, etapa);
create index on public.oportunidades (owner_id);
create index on public.oportunidades (fecha_estimada_cierre);
create index on public.actividades (partner_id, fecha desc);
create index on public.actividades (oportunidad_id);
create index on public.actividades (owner_id, proxima_accion_fecha);
create index on public.adjuntos (entity_type, entity_id);

-- Full-text search (búsqueda global, config 'simple' para nombres propios)
create index partners_search_idx on public.partners
  using gin (to_tsvector('simple', legal_name || ' ' || coalesce(commercial_name, '')));
create index contactos_search_idx on public.contactos
  using gin (to_tsvector('simple', first_name || ' ' || last_name || ' ' || coalesce(email, '')));
create index oportunidades_search_idx on public.oportunidades
  using gin (to_tsvector('simple', cliente_final_name));

-- ─────────────────────────────────────────────
-- 8. TRIGGER updated_at
-- ─────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger partners_updated_at
  before update on public.partners
  for each row execute function public.set_updated_at();

create trigger contactos_updated_at
  before update on public.contactos
  for each row execute function public.set_updated_at();

create trigger oportunidades_updated_at
  before update on public.oportunidades
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────
-- 9. RLS — v1: todo usuario autenticado puede todo
--    (excepto profiles: solo el propio)
-- ─────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.partners enable row level security;
alter table public.contactos enable row level security;
alter table public.oportunidades enable row level security;
alter table public.actividades enable row level security;
alter table public.adjuntos enable row level security;

-- profiles: cada uno lee todos (para selects de owner) pero solo edita el suyo
create policy "profiles_select_all" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- resto de tablas: acceso total para authenticated
create policy "partners_all" on public.partners
  for all to authenticated using (true) with check (true);
create policy "contactos_all" on public.contactos
  for all to authenticated using (true) with check (true);
create policy "oportunidades_all" on public.oportunidades
  for all to authenticated using (true) with check (true);
create policy "actividades_all" on public.actividades
  for all to authenticated using (true) with check (true);
create policy "adjuntos_all" on public.adjuntos
  for all to authenticated using (true) with check (true);

-- ─────────────────────────────────────────────
-- 10. STORAGE — bucket privado "adjuntos"
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('adjuntos', 'adjuntos', false)
on conflict (id) do nothing;

create policy "adjuntos_storage_select" on storage.objects
  for select to authenticated using (bucket_id = 'adjuntos');
create policy "adjuntos_storage_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'adjuntos');
create policy "adjuntos_storage_update" on storage.objects
  for update to authenticated using (bucket_id = 'adjuntos');
create policy "adjuntos_storage_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'adjuntos');
