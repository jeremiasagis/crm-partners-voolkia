"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Actividad, ActividadInsert, ActividadWithRels } from "@/lib/types";

const LIST_SELECT =
  "*, partner:partners(id, legal_name, commercial_name), contacto:contactos(id, first_name, last_name), oportunidad:oportunidades(id, cliente_final_name), owner:profiles!actividades_owner_id_fkey(id, full_name)";

type ActividadesFilter = {
  partnerId?: string;
  oportunidadId?: string;
  /** Limitar a los últimos N días (default 90 en el timeline general) */
  sinceDays?: number;
};

export function useActividades(filter: ActividadesFilter = {}) {
  return useQuery({
    queryKey: ["actividades", filter],
    queryFn: async (): Promise<ActividadWithRels[]> => {
      const supabase = createClient();
      let query = supabase
        .from("actividades")
        .select(LIST_SELECT)
        .order("fecha", { ascending: false });
      if (filter.partnerId) query = query.eq("partner_id", filter.partnerId);
      if (filter.oportunidadId)
        query = query.eq("oportunidad_id", filter.oportunidadId);
      if (filter.sinceDays)
        query = query.gte(
          "fecha",
          subDays(new Date(), filter.sinceDays).toISOString()
        );
      const { data, error } = await query.returns<ActividadWithRels[]>();
      if (error) throw error;
      return data;
    },
  });
}

/** Actividades pendientes (próxima acción vencida o de hoy) del usuario actual */
export function useMisPendientes() {
  return useQuery({
    queryKey: ["actividades", "pendientes"],
    queryFn: async (): Promise<ActividadWithRels[]> => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("actividades")
        .select(LIST_SELECT)
        .eq("owner_id", user.id)
        .lte("proxima_accion_fecha", today)
        .not("proxima_accion", "is", null)
        .order("proxima_accion_fecha")
        .returns<ActividadWithRels[]>();
      if (error) throw error;
      return data;
    },
    refetchInterval: 60_000,
  });
}

export function useCreateActividad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: ActividadInsert): Promise<Actividad> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("actividades")
        .insert(values)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actividades"] });
      toast.success("Actividad registrada");
    },
    onError: (e) =>
      toast.error(`No se pudo registrar la actividad: ${e.message}`),
  });
}

export function useUpdateActividad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: Partial<ActividadInsert>;
    }): Promise<Actividad> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("actividades")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actividades"] });
      toast.success("Actividad actualizada");
    },
    onError: (e) =>
      toast.error(`No se pudo actualizar la actividad: ${e.message}`),
  });
}

export function useDeleteActividad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("actividades")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actividades"] });
      toast.success("Actividad eliminada");
    },
    onError: (e) =>
      toast.error(`No se pudo eliminar la actividad: ${e.message}`),
  });
}
