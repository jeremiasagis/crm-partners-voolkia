"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { EtapaHistorial } from "@/lib/types";

/**
 * Historial de cambios de etapa. Si la migración 002 todavía no corrió
 * (tabla inexistente), devuelve vacío en lugar de romper la UI.
 */
export function useEtapaHistorial(oportunidadId?: string) {
  return useQuery({
    queryKey: ["etapa-historial", { oportunidadId: oportunidadId ?? null }],
    queryFn: async (): Promise<EtapaHistorial[]> => {
      const supabase = createClient();
      let query = supabase
        .from("oportunidad_etapa_historial")
        .select("*")
        .order("changed_at", { ascending: true });
      if (oportunidadId) query = query.eq("oportunidad_id", oportunidadId);
      const { data, error } = await query;
      if (error) {
        if (error.code === "PGRST205") return []; // tabla aún no migrada
        throw error;
      }
      return data;
    },
  });
}
