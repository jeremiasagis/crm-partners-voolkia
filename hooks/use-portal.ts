"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type {
  LeadSubmission,
  PortalEtapaHistorial,
  PortalOportunidad,
  PortalPartner,
} from "@/lib/types";

/** Ficha del partner del usuario logueado (vista filtrada por RLS) */
export function usePortalPartner() {
  return useQuery({
    queryKey: ["portal", "partner"],
    queryFn: async (): Promise<PortalPartner | null> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("portal_partner")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function usePortalOportunidades() {
  return useQuery({
    queryKey: ["portal", "oportunidades"],
    queryFn: async (): Promise<PortalOportunidad[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("portal_oportunidades")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30_000, // el portal se mantiene fresco sin realtime
  });
}

export function usePortalHistorial() {
  return useQuery({
    queryKey: ["portal", "historial"],
    queryFn: async (): Promise<PortalEtapaHistorial[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("portal_etapa_historial")
        .select("*")
        .order("changed_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30_000,
  });
}

/** Solicitudes de leads enviadas por el partner logueado */
export function useMisSolicitudes() {
  return useQuery({
    queryKey: ["portal", "solicitudes"],
    queryFn: async (): Promise<LeadSubmission[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("lead_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30_000,
  });
}

export function useCreateSolicitud() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      partner_id: string;
      cliente_final_name: string;
      cliente_final_country: string | null;
      contacto_nombre: string | null;
      contacto_email: string | null;
      contacto_phone: string | null;
      descripcion: string | null;
      monto_estimado_usd: number | null;
    }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      const { error } = await supabase.from("lead_submissions").insert({
        ...values,
        submitted_by: user.id,
        estado: "pendiente",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal", "solicitudes"] });
      toast.success("Lead enviado a Voolkia para revisión");
    },
    onError: (e) => toast.error(`No se pudo enviar el lead: ${e.message}`),
  });
}
