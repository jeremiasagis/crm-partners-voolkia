-- ═══════════════════════════════════════════════════════════════
-- Voolkia CRM — Migración 002: métricas comerciales
-- Motivo de pérdida · Historial de etapas · Objetivos · Realtime
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1. Motivo de pérdida en oportunidades
-- ─────────────────────────────────────────────
alter table public.oportunidades
  add column if not exists motivo_perdida text
  check (motivo_perdida in ('precio', 'timing', 'competidor', 'sin_presupuesto', 'otro'));

-- Seed de dev: la oportunidad perdida de ejemplo recibe un motivo
update public.oportunidades
  set motivo_perdida = 'timing'
  where id = 'c0000000-0000-4000-8000-000000000006' and motivo_perdida is null;

-- ─────────────────────────────────────────────
-- 2. Historial de cambios de etapa
-- ─────────────────────────────────────────────
create table public.oportunidad_etapa_historial (
  id uuid primary key default gen_random_uuid(),
  oportunidad_id uuid references public.oportunidades (id) on delete cascade not null,
  etapa_anterior text,
  etapa_nueva text not null,
  changed_by uuid references public.profiles (id),
  changed_at timestamptz not null default now()
);

create index on public.oportunidad_etapa_historial (oportunidad_id, changed_at);

create or replace function public.log_etapa_change()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.oportunidad_etapa_historial
      (oportunidad_id, etapa_anterior, etapa_nueva, changed_by)
    values (new.id, null, coalesce(new.etapa, 'lead'), auth.uid());
  elsif tg_op = 'UPDATE' and old.etapa is distinct from new.etapa then
    insert into public.oportunidad_etapa_historial
      (oportunidad_id, etapa_anterior, etapa_nueva, changed_by)
    values (new.id, old.etapa, coalesce(new.etapa, 'lead'), auth.uid());
  end if;
  return new;
end;
$$;

create trigger oportunidades_log_etapa
  after insert or update on public.oportunidades
  for each row execute function public.log_etapa_change();

-- Backfill: cada oportunidad existente arranca su historial en su etapa actual
insert into public.oportunidad_etapa_historial (oportunidad_id, etapa_anterior, etapa_nueva, changed_at)
select id, null, coalesce(etapa, 'lead'), coalesce(created_at, now())
from public.oportunidades;

alter table public.oportunidad_etapa_historial enable row level security;
create policy "historial_select" on public.oportunidad_etapa_historial
  for select to authenticated using (true);
create policy "historial_insert" on public.oportunidad_etapa_historial
  for insert to authenticated with check (true);

-- ─────────────────────────────────────────────
-- 3. Objetivos trimestrales
-- ─────────────────────────────────────────────
create table public.objetivos (
  id uuid primary key default gen_random_uuid(),
  anio int not null,
  trimestre int not null check (trimestre between 1 and 4),
  tipo text not null check (tipo in ('comisiones_usd', 'deals_ganados')),
  valor numeric(12,2) not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (anio, trimestre, tipo)
);

create trigger objetivos_updated_at
  before update on public.objetivos
  for each row execute function public.set_updated_at();

alter table public.objetivos enable row level security;
create policy "objetivos_all" on public.objetivos
  for all to authenticated using (true) with check (true);

-- ─────────────────────────────────────────────
-- 4. Realtime: publicar cambios de las tablas del CRM
-- ─────────────────────────────────────────────
do $$
begin
  begin
    alter publication supabase_realtime add table public.oportunidades;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.partners;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.contactos;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.actividades;
  exception when duplicate_object then null;
  end;
end;
$$;
