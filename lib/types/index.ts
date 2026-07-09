import type { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Partner = Database["public"]["Tables"]["partners"]["Row"];
export type Contacto = Database["public"]["Tables"]["contactos"]["Row"];
export type Oportunidad = Database["public"]["Tables"]["oportunidades"]["Row"];
export type Actividad = Database["public"]["Tables"]["actividades"]["Row"];
export type Adjunto = Database["public"]["Tables"]["adjuntos"]["Row"];
export type EtapaHistorial =
  Database["public"]["Tables"]["oportunidad_etapa_historial"]["Row"];
export type Objetivo = Database["public"]["Tables"]["objetivos"]["Row"];
export type SnapshotMensual =
  Database["public"]["Tables"]["snapshots_mensuales"]["Row"];
export type LeadSubmission =
  Database["public"]["Tables"]["lead_submissions"]["Row"];
export type LeadSubmissionInsert =
  Database["public"]["Tables"]["lead_submissions"]["Insert"];
export type PortalPartner =
  Database["public"]["Views"]["portal_partner"]["Row"];
export type PortalOportunidad =
  Database["public"]["Views"]["portal_oportunidades"]["Row"];
export type PortalEtapaHistorial =
  Database["public"]["Views"]["portal_etapa_historial"]["Row"];

export type LeadSubmissionWithRels = LeadSubmission & {
  partner: Pick<Partner, "id" | "legal_name" | "commercial_name" | "country_code"> | null;
  submitter: Pick<Profile, "id" | "full_name" | "email"> | null;
};

export type PartnerInsert = Database["public"]["Tables"]["partners"]["Insert"];
export type ContactoInsert = Database["public"]["Tables"]["contactos"]["Insert"];
export type OportunidadInsert =
  Database["public"]["Tables"]["oportunidades"]["Insert"];
export type ActividadInsert =
  Database["public"]["Tables"]["actividades"]["Insert"];

/** Partner con datos agregados para la lista */
export type PartnerWithStats = Partner & {
  oportunidades: Pick<
    Oportunidad,
    "id" | "etapa" | "monto_estimado_usd" | "probabilidad"
  >[];
  owner: Pick<Profile, "id" | "full_name"> | null;
};

export type ContactoWithPartner = Contacto & {
  partner: Pick<
    Partner,
    "id" | "legal_name" | "commercial_name" | "country_code"
  > | null;
};

export type OportunidadWithRels = Oportunidad & {
  partner: Pick<
    Partner,
    "id" | "legal_name" | "commercial_name" | "country_code"
  > | null;
  owner: Pick<Profile, "id" | "full_name"> | null;
};

export type ActividadWithRels = Actividad & {
  partner: Pick<Partner, "id" | "legal_name" | "commercial_name"> | null;
  contacto: Pick<Contacto, "id" | "first_name" | "last_name"> | null;
  oportunidad: Pick<Oportunidad, "id" | "cliente_final_name"> | null;
  owner: Pick<Profile, "id" | "full_name"> | null;
};

export * from "./database.types";
