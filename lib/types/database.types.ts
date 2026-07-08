// Types de la base — espejo de supabase/migrations/001_init.sql
// (escritos a mano; regenerables con `npx supabase gen types typescript`)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PartnerType =
  | "agencia_rys_it"
  | "consultora_boutique"
  | "headhunter"
  | "otro";
export type PartnerSize =
  | "unipersonal"
  | "boutique_2_10"
  | "empresa_10_50"
  | "empresa_50_plus";
export type PartnerTier = "A" | "B" | "C";
export type PartnerStatus =
  | "prospect"
  | "en_proceso_firma"
  | "activo"
  | "pausado"
  | "baja";
export type FunnelStage =
  | "prospect"
  | "primer_contacto"
  | "reunion_inicial"
  | "propuesta_enviada"
  | "negociacion"
  | "firma_pendiente"
  | "activo";
export type PartnerSource =
  | "referido"
  | "outbound"
  | "inbound"
  | "evento"
  | "otro";
export type Componente = "R-A" | "R-B" | "T" | "P";
export type Etapa =
  | "lead"
  | "calificada"
  | "propuesta"
  | "negociacion"
  | "ganada"
  | "perdida";
export type EstadoLead = "pendiente" | "aprobada" | "rechazada";
export type UserRole = "admin" | "partner";
export type MotivoPerdida =
  | "precio"
  | "timing"
  | "competidor"
  | "sin_presupuesto"
  | "otro";
export type TipoObjetivo = "comisiones_usd" | "deals_ganados";
export type TipoActividad =
  | "llamada"
  | "reunion"
  | "email"
  | "whatsapp"
  | "nota"
  | "otro";
export type EntityType = "partner" | "oportunidad";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          role: string | null;
          country_code: string | null;
          phone: string | null;
          partner_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          role?: string | null;
          country_code?: string | null;
          phone?: string | null;
          partner_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          role?: string | null;
          country_code?: string | null;
          phone?: string | null;
          partner_id?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      lead_submissions: {
        Row: {
          id: string;
          partner_id: string;
          submitted_by: string | null;
          cliente_final_name: string;
          cliente_final_country: string | null;
          contacto_nombre: string | null;
          contacto_email: string | null;
          contacto_phone: string | null;
          descripcion: string | null;
          monto_estimado_usd: number | null;
          estado: EstadoLead;
          motivo_rechazo: string | null;
          oportunidad_id: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          partner_id: string;
          submitted_by?: string | null;
          cliente_final_name: string;
          cliente_final_country?: string | null;
          contacto_nombre?: string | null;
          contacto_email?: string | null;
          contacto_phone?: string | null;
          descripcion?: string | null;
          monto_estimado_usd?: number | null;
          estado?: EstadoLead;
          motivo_rechazo?: string | null;
          oportunidad_id?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          partner_id?: string;
          submitted_by?: string | null;
          cliente_final_name?: string;
          cliente_final_country?: string | null;
          contacto_nombre?: string | null;
          contacto_email?: string | null;
          contacto_phone?: string | null;
          descripcion?: string | null;
          monto_estimado_usd?: number | null;
          estado?: EstadoLead;
          motivo_rechazo?: string | null;
          oportunidad_id?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      partners: {
        Row: {
          id: string;
          legal_name: string;
          commercial_name: string | null;
          country_code: string;
          partner_type: PartnerType | null;
          size: PartnerSize | null;
          website: string | null;
          industries: string[] | null;
          tier: PartnerTier | null;
          status: PartnerStatus | null;
          funnel_stage: FunnelStage | null;
          source: PartnerSource | null;
          owner_id: string | null;
          notes: string | null;
          signed_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          legal_name: string;
          commercial_name?: string | null;
          country_code: string;
          partner_type?: PartnerType | null;
          size?: PartnerSize | null;
          website?: string | null;
          industries?: string[] | null;
          tier?: PartnerTier | null;
          status?: PartnerStatus | null;
          funnel_stage?: FunnelStage | null;
          source?: PartnerSource | null;
          owner_id?: string | null;
          notes?: string | null;
          signed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          legal_name?: string;
          commercial_name?: string | null;
          country_code?: string;
          partner_type?: PartnerType | null;
          size?: PartnerSize | null;
          website?: string | null;
          industries?: string[] | null;
          tier?: PartnerTier | null;
          status?: PartnerStatus | null;
          funnel_stage?: FunnelStage | null;
          source?: PartnerSource | null;
          owner_id?: string | null;
          notes?: string | null;
          signed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      contactos: {
        Row: {
          id: string;
          partner_id: string;
          first_name: string;
          last_name: string;
          role: string | null;
          email: string | null;
          phone: string | null;
          linkedin: string | null;
          is_decision_maker: boolean | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          partner_id: string;
          first_name: string;
          last_name: string;
          role?: string | null;
          email?: string | null;
          phone?: string | null;
          linkedin?: string | null;
          is_decision_maker?: boolean | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          partner_id?: string;
          first_name?: string;
          last_name?: string;
          role?: string | null;
          email?: string | null;
          phone?: string | null;
          linkedin?: string | null;
          is_decision_maker?: boolean | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      oportunidades: {
        Row: {
          id: string;
          partner_id: string;
          cliente_final_name: string;
          cliente_final_country: string | null;
          componente: Componente;
          monto_estimado_usd: number;
          comision_estimada_usd: number | null;
          probabilidad: number | null;
          etapa: Etapa | null;
          fecha_estimada_cierre: string | null;
          fecha_real_cierre: string | null;
          proxima_accion: string | null;
          proxima_accion_fecha: string | null;
          motivo_perdida: MotivoPerdida | null;
          notes: string | null;
          owner_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          partner_id: string;
          cliente_final_name: string;
          cliente_final_country?: string | null;
          componente: Componente;
          monto_estimado_usd?: number;
          comision_estimada_usd?: number | null;
          probabilidad?: number | null;
          etapa?: Etapa | null;
          fecha_estimada_cierre?: string | null;
          fecha_real_cierre?: string | null;
          proxima_accion?: string | null;
          proxima_accion_fecha?: string | null;
          motivo_perdida?: MotivoPerdida | null;
          notes?: string | null;
          owner_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          partner_id?: string;
          cliente_final_name?: string;
          cliente_final_country?: string | null;
          componente?: Componente;
          monto_estimado_usd?: number;
          comision_estimada_usd?: number | null;
          probabilidad?: number | null;
          etapa?: Etapa | null;
          fecha_estimada_cierre?: string | null;
          fecha_real_cierre?: string | null;
          proxima_accion?: string | null;
          proxima_accion_fecha?: string | null;
          motivo_perdida?: MotivoPerdida | null;
          notes?: string | null;
          owner_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      oportunidad_etapa_historial: {
        Row: {
          id: string;
          oportunidad_id: string;
          etapa_anterior: string | null;
          etapa_nueva: string;
          changed_by: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          oportunidad_id: string;
          etapa_anterior?: string | null;
          etapa_nueva: string;
          changed_by?: string | null;
          changed_at?: string;
        };
        Update: {
          id?: string;
          oportunidad_id?: string;
          etapa_anterior?: string | null;
          etapa_nueva?: string;
          changed_by?: string | null;
          changed_at?: string;
        };
        Relationships: [];
      };
      objetivos: {
        Row: {
          id: string;
          anio: number;
          trimestre: number;
          tipo: TipoObjetivo;
          valor: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          anio: number;
          trimestre: number;
          tipo: TipoObjetivo;
          valor?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          anio?: number;
          trimestre?: number;
          tipo?: TipoObjetivo;
          valor?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      actividades: {
        Row: {
          id: string;
          tipo: TipoActividad;
          fecha: string;
          partner_id: string | null;
          contacto_id: string | null;
          oportunidad_id: string | null;
          titulo: string;
          descripcion: string | null;
          proxima_accion: string | null;
          proxima_accion_fecha: string | null;
          owner_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          tipo: TipoActividad;
          fecha?: string;
          partner_id?: string | null;
          contacto_id?: string | null;
          oportunidad_id?: string | null;
          titulo: string;
          descripcion?: string | null;
          proxima_accion?: string | null;
          proxima_accion_fecha?: string | null;
          owner_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          tipo?: TipoActividad;
          fecha?: string;
          partner_id?: string | null;
          contacto_id?: string | null;
          oportunidad_id?: string | null;
          titulo?: string;
          descripcion?: string | null;
          proxima_accion?: string | null;
          proxima_accion_fecha?: string | null;
          owner_id?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      adjuntos: {
        Row: {
          id: string;
          entity_type: EntityType;
          entity_id: string;
          file_name: string;
          file_path: string;
          file_size: number | null;
          file_type: string | null;
          uploaded_by: string | null;
          uploaded_at: string | null;
        };
        Insert: {
          id?: string;
          entity_type: EntityType;
          entity_id: string;
          file_name: string;
          file_path: string;
          file_size?: number | null;
          file_type?: string | null;
          uploaded_by?: string | null;
          uploaded_at?: string | null;
        };
        Update: {
          id?: string;
          entity_type?: EntityType;
          entity_id?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number | null;
          file_type?: string | null;
          uploaded_by?: string | null;
          uploaded_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      portal_partner: {
        Row: {
          id: string;
          legal_name: string;
          commercial_name: string | null;
          country_code: string;
          tier: PartnerTier | null;
          status: PartnerStatus | null;
          signed_at: string | null;
        };
        Relationships: [];
      };
      portal_oportunidades: {
        Row: {
          id: string;
          partner_id: string;
          cliente_final_name: string;
          cliente_final_country: string | null;
          componente: Componente;
          monto_estimado_usd: number;
          comision_estimada_usd: number | null;
          probabilidad: number | null;
          etapa: Etapa | null;
          fecha_estimada_cierre: string | null;
          fecha_real_cierre: string | null;
          motivo_perdida: MotivoPerdida | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Relationships: [];
      };
      portal_etapa_historial: {
        Row: {
          id: string;
          oportunidad_id: string;
          etapa_anterior: string | null;
          etapa_nueva: string;
          changed_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      clean_seed_data: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
