-- ═══════════════════════════════════════════════════════════════
-- Voolkia CRM — Migración 005: histórico y snapshots mensuales
-- Congela la foto del pipeline a fin de cada mes (pg_cron) para
-- poder comparar períodos en el tiempo.
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1. Tabla de snapshots mensuales
-- ─────────────────────────────────────────────
create table public.snapshots_mensuales (
  id uuid primary key default gen_random_uuid(),
  -- Primer día del mes al que corresponde la foto (ej: 2026-07-01 = cierre de julio)
  periodo date not null unique,
  partners_activos int not null default 0,
  partners_total int not null default 0,
  pipeline_ponderado numeric(14,2) not null default 0,
  pipeline_bruto numeric(14,2) not null default 0,
  opps_abiertas int not null default 0,
  facturacion_ganada_mes numeric(14,2) not null default 0,
  comisiones_ganadas_mes numeric(14,2) not null default 0,
  deals_ganados_mes int not null default 0,
  deals_perdidos_mes int not null default 0,
  created_at timestamptz default now()
);

alter table public.snapshots_mensuales enable row level security;
create policy "snapshots_internal_select" on public.snapshots_mensuales
  for select to authenticated using (public.is_internal());

-- ─────────────────────────────────────────────
-- 2. Función que toma el snapshot
--    Ejecutada el día 1: congela el estado actual del pipeline y
--    los cierres del mes que acaba de terminar.
-- ─────────────────────────────────────────────
create or replace function public.tomar_snapshot_mensual()
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  mes_cerrado date := date_trunc('month', now() - interval '1 month')::date;
begin
  insert into public.snapshots_mensuales (
    periodo, partners_activos, partners_total,
    pipeline_ponderado, pipeline_bruto, opps_abiertas,
    facturacion_ganada_mes, comisiones_ganadas_mes,
    deals_ganados_mes, deals_perdidos_mes
  )
  select
    mes_cerrado,
    (select count(*) from public.partners where status = 'activo'),
    (select count(*) from public.partners),
    coalesce((select sum(monto_estimado_usd * coalesce(probabilidad, 0) / 100.0)
      from public.oportunidades
      where etapa in ('lead', 'calificada', 'propuesta', 'negociacion')), 0),
    coalesce((select sum(monto_estimado_usd)
      from public.oportunidades
      where etapa in ('lead', 'calificada', 'propuesta', 'negociacion')), 0),
    (select count(*) from public.oportunidades
      where etapa in ('lead', 'calificada', 'propuesta', 'negociacion')),
    coalesce((select sum(monto_estimado_usd) from public.oportunidades
      where etapa = 'ganada'
        and fecha_real_cierre >= mes_cerrado
        and fecha_real_cierre < mes_cerrado + interval '1 month'), 0),
    coalesce((select sum(comision_estimada_usd) from public.oportunidades
      where etapa = 'ganada'
        and fecha_real_cierre >= mes_cerrado
        and fecha_real_cierre < mes_cerrado + interval '1 month'), 0),
    (select count(*) from public.oportunidades
      where etapa = 'ganada'
        and fecha_real_cierre >= mes_cerrado
        and fecha_real_cierre < mes_cerrado + interval '1 month'),
    (select count(*) from public.oportunidades
      where etapa = 'perdida'
        and updated_at >= mes_cerrado
        and updated_at < mes_cerrado + interval '1 month')
  on conflict (periodo) do update set
    partners_activos = excluded.partners_activos,
    partners_total = excluded.partners_total,
    pipeline_ponderado = excluded.pipeline_ponderado,
    pipeline_bruto = excluded.pipeline_bruto,
    opps_abiertas = excluded.opps_abiertas,
    facturacion_ganada_mes = excluded.facturacion_ganada_mes,
    comisiones_ganadas_mes = excluded.comisiones_ganadas_mes,
    deals_ganados_mes = excluded.deals_ganados_mes,
    deals_perdidos_mes = excluded.deals_perdidos_mes;
end;
$$;

-- ─────────────────────────────────────────────
-- 3. Cron: corre a las 06:00 UTC del día 1 de cada mes
-- ─────────────────────────────────────────────
create extension if not exists pg_cron;

do $$
begin
  perform cron.unschedule('snapshot-mensual');
exception when others then null;
end;
$$;

select cron.schedule(
  'snapshot-mensual',
  '0 6 1 * *',
  $$select public.tomar_snapshot_mensual()$$
);

-- ─────────────────────────────────────────────
-- 4. Primer snapshot ahora (cierre de junio 2026)
-- ─────────────────────────────────────────────
select public.tomar_snapshot_mensual();
