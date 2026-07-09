"use client";

import { useQuery } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import type { ActividadWithRels } from "@/lib/types";

const ACT_SELECT =
  "*, partner:partners(id, legal_name, commercial_name), contacto:contactos(id, first_name, last_name), oportunidad:oportunidades(id, cliente_final_name), owner:profiles!actividades_owner_id_fkey(id, full_name)";

/** Actividades con próxima acción hoy (todos los usuarios) — KPI */
export function usePendientesHoy() {
  return useQuery({
    queryKey: ["actividades", "pendientes-hoy-global"],
    queryFn: async (): Promise<ActividadWithRels[]> => {
      const supabase = createClient();
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("actividades")
        .select(ACT_SELECT)
        .eq("proxima_accion_fecha", today)
        .not("proxima_accion", "is", null)
        .returns<ActividadWithRels[]>();
      if (error) throw error;
      return data;
    },
  });
}

/** Actividades con próxima acción en los próximos N días */
export function useProximasActividades(days = 7) {
  return useQuery({
    queryKey: ["actividades", "proximas", days],
    queryFn: async (): Promise<ActividadWithRels[]> => {
      const supabase = createClient();
      const today = format(new Date(), "yyyy-MM-dd");
      const limit = format(addDays(new Date(), days), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("actividades")
        .select(ACT_SELECT)
        .gte("proxima_accion_fecha", today)
        .lte("proxima_accion_fecha", limit)
        .not("proxima_accion", "is", null)
        .order("proxima_accion_fecha")
        .returns<ActividadWithRels[]>();
      if (error) throw error;
      return data;
    },
  });
}
