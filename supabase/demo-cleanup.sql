-- ═══════════════════════════════════════════════════════════════
-- Voolkia CRM — Limpieza del dataset DEMO
-- Todos los registros demo tienen IDs que empiezan con dd000000-.
-- Borra partners demo (cascade elimina sus contactos, oportunidades,
-- actividades e historial) y los objetivos demo.
-- Los datos reales NO se tocan.
-- ═══════════════════════════════════════════════════════════════

delete from public.partners  where id::text like 'dd000000-%';
delete from public.objetivos where id::text like 'dd000000-%';

-- Nota: si durante la demo subiste archivos adjuntos a un partner demo,
-- borralos antes desde la UI (o vaciá el bucket "adjuntos" en Storage).
