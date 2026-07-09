"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type {
  Componente,
  Etapa,
  LeadSubmissionWithRels,
} from "@/lib/types";

const LIST_SELECT =
  "*, partner:partners(id, legal_name, commercial_name, country_code), submitter:profiles!lead_submissions_submitted_by_fkey(id, full_name, email)";

/** Bandeja interna de leads referidos */
export function useLeadSubmissions() {
  return useQuery({
    queryKey: ["lead-submissions"],
    queryFn: async (): Promise<LeadSubmissionWithRels[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("lead_submissions")
        .select(LIST_SELECT)
        .order("created_at", { ascending: false })
        .returns<LeadSubmissionWithRels[]>();
      if (error) {
        if (error.code === "PGRST205") return []; // migración 003 pendiente
        throw error;
      }
      return data;
    },
  });
}

/** Contador liviano para el badge del sidebar (HEAD + count, sin traer filas) */
export function usePendingLeadsCount() {
  const { data } = useQuery({
    queryKey: ["lead-submissions", "pending-count"],
    queryFn: async (): Promise<number> => {
      const supabase = createClient();
      const { count, error } = await supabase
        .from("lead_submissions")
        .select("id", { count: "exact", head: true })
        .eq("estado", "pendiente");
      if (error) return 0;
      return count ?? 0;
    },
  });
  return data ?? 0;
}

export function useApproveLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lead,
      componente,
      monto,
      comision,
      probabilidad,
      etapa,
    }: {
      lead: LeadSubmissionWithRels;
      componente: Componente;
      monto: number;
      comision: number;
      probabilidad: number;
      etapa: Etapa;
    }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const contacto = [
        lead.contacto_nombre,
        lead.contacto_email,
        lead.contacto_phone,
      ]
        .filter(Boolean)
        .join(" · ");

      const { data: opp, error: oppError } = await supabase
        .from("oportunidades")
        .insert({
          partner_id: lead.partner_id,
          cliente_final_name: lead.cliente_final_name,
          cliente_final_country: lead.cliente_final_country,
          componente,
          monto_estimado_usd: monto,
          comision_estimada_usd: comision,
          probabilidad,
          etapa,
          owner_id: user?.id ?? null,
          notes: [
            "Lead referido por el partner vía portal.",
            contacto ? `Contacto: ${contacto}` : null,
            lead.descripcion ? `Contexto: ${lead.descripcion}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        })
        .select()
        .single();
      if (oppError) throw oppError;

      const { error: updError } = await supabase
        .from("lead_submissions")
        .update({
          estado: "aprobada",
          oportunidad_id: opp.id,
          reviewed_by: user?.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", lead.id);
      if (updError) throw updError;
      return opp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["oportunidades"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Lead aprobado — oportunidad creada");
    },
    onError: (e) => toast.error(`No se pudo aprobar: ${e.message}`),
  });
}

export function useRejectLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      leadId,
      motivo,
    }: {
      leadId: string;
      motivo: string;
    }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("lead_submissions")
        .update({
          estado: "rechazada",
          motivo_rechazo: motivo,
          reviewed_by: user?.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-submissions"] });
      toast.success("Lead rechazado");
    },
    onError: (e) => toast.error(`No se pudo rechazar: ${e.message}`),
  });
}
