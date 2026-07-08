import type {
  Componente,
  Etapa,
  FunnelStage,
  MotivoPerdida,
  PartnerSize,
  PartnerSource,
  PartnerStatus,
  PartnerType,
  TipoActividad,
} from "@/lib/types";

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  agencia_rys_it: "Agencia RyS IT",
  consultora_boutique: "Consultora boutique",
  headhunter: "Headhunter",
  otro: "Otro",
};

export const PARTNER_SIZE_LABELS: Record<PartnerSize, string> = {
  unipersonal: "Unipersonal",
  boutique_2_10: "Boutique (2-10)",
  empresa_10_50: "Empresa (10-50)",
  empresa_50_plus: "Empresa (50+)",
};

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  prospect: "Prospect",
  en_proceso_firma: "En proceso de firma",
  activo: "Activo",
  pausado: "Pausado",
  baja: "Baja",
};

export const PARTNER_STATUS_COLORS: Record<PartnerStatus, string> = {
  prospect: "bg-gray-100 text-gray-700 border-gray-200",
  en_proceso_firma: "bg-amber-100 text-amber-800 border-amber-200",
  activo: "bg-emerald-100 text-emerald-800 border-emerald-200",
  pausado: "bg-orange-100 text-orange-800 border-orange-200",
  baja: "bg-red-100 text-red-700 border-red-200",
};

export const FUNNEL_STAGE_LABELS: Record<FunnelStage, string> = {
  prospect: "Prospect",
  primer_contacto: "Primer contacto",
  reunion_inicial: "Reunión inicial",
  propuesta_enviada: "Propuesta enviada",
  negociacion: "Negociación",
  firma_pendiente: "Firma pendiente",
  activo: "Activo",
};

export const SOURCE_LABELS: Record<PartnerSource, string> = {
  referido: "Referido",
  outbound: "Outbound",
  inbound: "Inbound",
  evento: "Evento",
  otro: "Otro",
};

export const TIER_COLORS: Record<string, string> = {
  A: "bg-orange-soft text-orange-deep border-orange-vk/30",
  B: "bg-cream text-muted-warm border-line",
  C: "bg-gray-100 text-gray-600 border-gray-200",
};

export const ETAPA_LABELS: Record<Etapa, string> = {
  lead: "Lead",
  calificada: "Calificada",
  propuesta: "Propuesta",
  negociacion: "Negociación",
  ganada: "Ganada",
  perdida: "Perdida",
};

export const ETAPA_COLORS: Record<Etapa, string> = {
  lead: "bg-gray-100 text-gray-700 border-gray-200",
  calificada: "bg-blue-100 text-blue-800 border-blue-200",
  propuesta: "bg-amber-100 text-amber-800 border-amber-200",
  negociacion: "bg-orange-100 text-orange-800 border-orange-200",
  ganada: "bg-emerald-100 text-emerald-800 border-emerald-200",
  perdida: "bg-red-100 text-red-700 border-red-200",
};

export const ETAPAS_ORDEN: Etapa[] = [
  "lead",
  "calificada",
  "propuesta",
  "negociacion",
  "ganada",
  "perdida",
];

/** Etapas que suman al pipeline (abiertas) */
export const ETAPAS_PIPELINE: Etapa[] = [
  "lead",
  "calificada",
  "propuesta",
  "negociacion",
];

export const COMPONENTE_LABELS: Record<Componente, string> = {
  "R-A": "R · Opción A",
  "R-B": "R · Opción B",
  T: "T · Takeover",
  P: "P · Proyecto",
};

export const COMPONENTE_DESCRIPTIONS: Record<Componente, string> = {
  "R-A": "Referral con comisión sobre facturación",
  "R-B": "Referral con fee fijo por colocación",
  T: "Takeover de equipo o servicio existente",
  P: "Proyecto llave en mano",
};

export const COMPONENTE_COLORS: Record<Componente, string> = {
  "R-A": "bg-violet-100 text-violet-800 border-violet-200",
  "R-B": "bg-blue-100 text-blue-800 border-blue-200",
  T: "bg-orange-100 text-orange-800 border-orange-200",
  P: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export const MOTIVO_PERDIDA_LABELS: Record<MotivoPerdida, string> = {
  precio: "Precio",
  timing: "Timing",
  competidor: "Competidor",
  sin_presupuesto: "Sin presupuesto",
  otro: "Otro",
};

/** Etapas del funnel de conversión (sin perdida) en orden */
export const FUNNEL_ETAPAS: Etapa[] = [
  "lead",
  "calificada",
  "propuesta",
  "negociacion",
  "ganada",
];

export const TIPO_ACTIVIDAD_LABELS: Record<TipoActividad, string> = {
  llamada: "Llamada",
  reunion: "Reunión",
  email: "Email",
  whatsapp: "WhatsApp",
  nota: "Nota",
  otro: "Otro",
};

export function partnerDisplayName(p: {
  commercial_name?: string | null;
  legal_name: string;
}): string {
  return p.commercial_name || p.legal_name;
}
