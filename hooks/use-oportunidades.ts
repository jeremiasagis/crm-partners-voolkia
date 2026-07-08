"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type {
  Oportunidad,
  OportunidadInsert,
  OportunidadWithRels,
} from "@/lib/types";

const LIST_SELECT =
  "*, partner:partners(id, legal_name, commercial_name, country_code), owner:profiles(id, full_name)";

export function useOportunidades(partnerId?: string) {
  return useQuery({
    queryKey: ["oportunidades", { partnerId: partnerId ?? null }],
    queryFn: async (): Promise<OportunidadWithRels[]> => {
      const supabase = createClient();
      let query = supabase
        .from("oportunidades")
        .select(LIST_SELECT)
        .order("created_at", { ascending: false });
      if (partnerId) query = query.eq("partner_id", partnerId);
      const { data, error } = await query.returns<OportunidadWithRels[]>();
      if (error) throw error;
      return data;
    },
  });
}

export function useOportunidad(id: string) {
  return useQuery({
    queryKey: ["oportunidades", "detail", id],
    queryFn: async (): Promise<OportunidadWithRels | null> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("oportunidades")
        .select(LIST_SELECT)
        .eq("id", id)
        .maybeSingle<OportunidadWithRels>();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["oportunidades"] });
  queryClient.invalidateQueries({ queryKey: ["partners"] });
}

export function useCreateOportunidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: OportunidadInsert): Promise<Oportunidad> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("oportunidades")
        .insert(values)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("Oportunidad creada");
    },
    onError: (e) =>
      toast.error(`No se pudo crear la oportunidad: ${e.message}`),
  });
}

export function useUpdateOportunidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: Partial<OportunidadInsert>;
    }): Promise<Oportunidad> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("oportunidades")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("Oportunidad actualizada");
    },
    onError: (e) =>
      toast.error(`No se pudo actualizar la oportunidad: ${e.message}`),
  });
}

/** Cambio de etapa desde el Kanban, con update optimista para drag fluido */
export function useMoveOportunidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      etapa,
    }: {
      id: string;
      etapa: NonNullable<Oportunidad["etapa"]>;
    }): Promise<void> => {
      const supabase = createClient();
      const { error } = await supabase
        .from("oportunidades")
        .update({ etapa })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, etapa }) => {
      const key = ["oportunidades", { partnerId: null }];
      await queryClient.cancelQueries({ queryKey: key });
      const previous =
        queryClient.getQueryData<OportunidadWithRels[]>(key);
      queryClient.setQueryData<OportunidadWithRels[]>(key, (old) =>
        old?.map((o) => (o.id === id ? { ...o, etapa } : o))
      );
      return { previous };
    },
    onError: (e, _vars, context) => {
      const key = ["oportunidades", { partnerId: null }];
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(`No se pudo mover la oportunidad: ${e.message}`);
    },
    onSettled: () => invalidate(queryClient),
  });
}

export function useDeleteOportunidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("oportunidades")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("Oportunidad eliminada");
    },
    onError: (e) =>
      toast.error(`No se pudo eliminar la oportunidad: ${e.message}`),
  });
}
