import { z } from "zod";
import { optionalEnum, optionalString, optionalStringWith } from "./helpers";

export const partnerSchema = z.object({
  legal_name: z.string().min(2, "Ingresá la razón social"),
  commercial_name: optionalString(),
  country_code: z.string().min(2, "Elegí un país"),
  partner_type: optionalEnum([
    "agencia_rys_it",
    "consultora_boutique",
    "headhunter",
    "otro",
  ]),
  size: optionalEnum([
    "unipersonal",
    "boutique_2_10",
    "empresa_10_50",
    "empresa_50_plus",
  ]),
  website: optionalStringWith(z.string().url("URL inválida (incluí https://)")),
  industries: z.array(z.string()).default([]),
  tier: optionalEnum(["A", "B", "C"]),
  status: optionalEnum([
    "prospect",
    "en_proceso_firma",
    "activo",
    "pausado",
    "baja",
  ]),
  funnel_stage: optionalEnum([
    "prospect",
    "primer_contacto",
    "reunion_inicial",
    "propuesta_enviada",
    "negociacion",
    "firma_pendiente",
    "activo",
  ]),
  source: optionalEnum(["referido", "outbound", "inbound", "evento", "otro"]),
  owner_id: optionalString(),
  notes: optionalString(),
  signed_at: optionalString(),
});

export type PartnerFormValues = z.input<typeof partnerSchema>;
export type PartnerFormOutput = z.output<typeof partnerSchema>;
