"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Objetivo, TipoObjetivo } from "@/lib/types";

export function useObjetivos(anio?: number) {
  return useQuery({
    queryKey: ["objetivos", { anio: anio ?? null }],
    queryFn: async (): Promise<Objetivo[]> => {
      const supabase = createClient();
      let query = supabase
        .from("objetivos")
        .select("*")
        .order("anio")
        .order("trimestre");
      if (anio) query = query.eq("anio", anio);
      const { data, error } = await query;
      if (error) {
        if (error.code === "PGRST205") return []; // tabla aún no migrada
        throw error;
      }
      return data;
    },
  });
}

/** Elimina todos los objetivos de un período (facturación + deals) */
export function useDeleteObjetivosPeriodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      anio,
      trimestre,
    }: {
      anio: number;
      trimestre: number;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("objetivos")
        .delete()
        .eq("anio", anio)
        .eq("trimestre", trimestre);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objetivos"] });
      toast.success("Objetivo eliminado");
    },
    onError: (e) => toast.error(`No se pudo eliminar: ${e.message}`),
  });
}

export function useUpsertObjetivo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      anio: number;
      trimestre: number;
      tipo: TipoObjetivo;
      valor: number;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("objetivos")
        .upsert(values, { onConflict: "anio,trimestre,tipo" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objetivos"] });
      toast.success("Objetivo guardado");
    },
    onError: (e) => toast.error(`No se pudo guardar: ${e.message}`),
  });
}
