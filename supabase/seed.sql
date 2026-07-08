-- ═══════════════════════════════════════════════════════════════
-- Voolkia CRM — Seed de desarrollo
-- 3 partners (AR, MX, US) × 2 contactos × 2 oportunidades + actividades.
-- Solo para desarrollo. Para limpiar: select public.clean_seed_data();
-- ═══════════════════════════════════════════════════════════════

-- IDs fijos para poder limpiar después
-- Partners
insert into public.partners (id, legal_name, commercial_name, country_code, partner_type, size, website, industries, tier, status, funnel_stage, source, notes, signed_at) values
  ('a0000000-0000-4000-8000-000000000001', 'Nexo Talento S.R.L.', 'Nexo Talento', 'AR', 'agencia_rys_it', 'boutique_2_10', 'https://nexotalento.com.ar', array['Tech','Banca'], 'A', 'activo', 'activo', 'referido', 'Partner fundador del programa. Muy activos en fintech.', now() - interval '90 days'),
  ('a0000000-0000-4000-8000-000000000002', 'Consultoría Ágil de México S.A. de C.V.', 'CAM Consulting', 'MX', 'consultora_boutique', 'empresa_10_50', 'https://camconsulting.mx', array['Retail','Consumo Masivo'], 'B', 'en_proceso_firma', 'firma_pendiente', 'evento', 'Contactados en Nerdearla MX. Esperando firma del acuerdo.', null),
  ('a0000000-0000-4000-8000-000000000003', 'TalentBridge LLC', 'TalentBridge', 'US', 'headhunter', 'unipersonal', 'https://talentbridge.io', array['Tech','Salud'], 'C', 'prospect', 'reunion_inicial', 'outbound', 'Primer contacto por LinkedIn. Interesados en staffing nearshore.', null);

-- Contactos
insert into public.contactos (id, partner_id, first_name, last_name, role, email, phone, linkedin, is_decision_maker) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Mariana', 'Suárez', 'CEO', 'mariana@nexotalento.com.ar', '+54 9 11 5555-1001', 'https://linkedin.com/in/marianasuarez', true),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Diego', 'Ferreyra', 'Head of Sales', 'diego@nexotalento.com.ar', '+54 9 11 5555-1002', null, false),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'Alejandro', 'Ruiz', 'Director General', 'aruiz@camconsulting.mx', '+52 55 5555 2001', 'https://linkedin.com/in/alejandroruizmx', true),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'Sofía', 'Mendoza', 'Gerente Comercial', 'smendoza@camconsulting.mx', '+52 55 5555 2002', null, false),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000003', 'Kevin', 'Miller', 'Founder', 'kevin@talentbridge.io', '+1 305 555 3001', 'https://linkedin.com/in/kevinmillertb', true),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000003', 'Laura', 'Chen', 'Recruiting Lead', 'laura@talentbridge.io', '+1 305 555 3002', null, false);

-- Oportunidades
insert into public.oportunidades (id, partner_id, cliente_final_name, cliente_final_country, componente, monto_estimado_usd, comision_estimada_usd, probabilidad, etapa, fecha_estimada_cierre, proxima_accion, proxima_accion_fecha, notes) values
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Banco Meridional', 'AR', 'T', 180000, 14400, 70, 'negociacion', current_date + interval '20 days', 'Enviar propuesta ajustada de takeover', current_date + interval '2 days', 'Squad de 6 devs. Cliente quiere arrancar en agosto.'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Fintech Aurora', 'AR', 'R-A', 45000, 3600, 90, 'ganada', current_date - interval '15 days', null, null, 'Cerrada. 2 perfiles SSR ya onboardeados.'),
  ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'Grupo Retail Azteca', 'MX', 'P', 250000, 25000, 40, 'propuesta', current_date + interval '45 days', 'Demo técnica con equipo de arquitectura', current_date + interval '7 days', 'Proyecto de migración a cloud. Compite con local.'),
  ('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'Alimentos del Valle', 'MX', 'R-B', 60000, 4800, 55, 'calificada', current_date + interval '60 days', 'Agendar call de descubrimiento', current_date - interval '1 day', 'Necesitan 3 data engineers.'),
  ('c0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000003', 'HealthTech Partners', 'US', 'R-A', 95000, 7600, 30, 'lead', current_date + interval '90 days', 'Primer intro call con CTO', current_date + interval '5 days', 'Referido por Kevin. Aún sin presupuesto confirmado.'),
  ('c0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000003', 'Miami Logistics Co', 'US', 'T', 120000, 9600, 15, 'perdida', current_date - interval '10 days', null, null, 'Eligieron proveedor local por timezone. Recontactar en Q4.');

-- Actividades
insert into public.actividades (id, tipo, fecha, partner_id, contacto_id, oportunidad_id, titulo, descripcion, proxima_accion, proxima_accion_fecha) values
  ('d0000000-0000-4000-8000-000000000001', 'reunion', now() - interval '3 days', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Reunión de negociación — Banco Meridional', 'Revisamos alcance del takeover. Piden descuento por volumen.', 'Enviar propuesta ajustada', current_date + interval '2 days'),
  ('d0000000-0000-4000-8000-000000000002', 'email', now() - interval '7 days', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', null, 'Seguimiento firma de acuerdo', 'Alejandro confirma que legal está revisando el contrato.', 'Llamar si no responde', current_date + interval '3 days'),
  ('d0000000-0000-4000-8000-000000000003', 'llamada', now() - interval '1 day', 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000005', 'Intro call con Kevin', 'Presentamos el programa de partners. Interesado en el modelo R-A.', 'Agendar call con CTO de HealthTech', current_date + interval '5 days'),
  ('d0000000-0000-4000-8000-000000000004', 'whatsapp', now() - interval '2 days', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000004', 'Ping por call de descubrimiento', 'Sofía propone la semana que viene.', 'Agendar call de descubrimiento', current_date);

-- ─────────────────────────────────────────────
-- Función de limpieza del seed
-- ─────────────────────────────────────────────
create or replace function public.clean_seed_data()
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  -- El cascade de partners borra contactos/oportunidades/actividades asociadas
  delete from public.partners where id in (
    'a0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000003'
  );
end;
$$;
