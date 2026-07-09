-- ═══════════════════════════════════════════════════════════════
-- Voolkia CRM — Migración 004: objetivos por facturación
-- El objetivo trimestral mide facturación de Voolkia (monto de deals
-- ganados), no comisiones de partners.
-- ═══════════════════════════════════════════════════════════════

alter table public.objetivos drop constraint if exists objetivos_tipo_check;

update public.objetivos
  set tipo = 'facturacion_usd'
  where tipo = 'comisiones_usd';

alter table public.objetivos
  add constraint objetivos_tipo_check
  check (tipo in ('facturacion_usd', 'deals_ganados'));

-- Demo: la meta Q3 2026 pasa a ser de facturación (número acorde)
update public.objetivos
  set valor = 450000
  where id = 'dd000000-0000-4000-8000-000000000601';
