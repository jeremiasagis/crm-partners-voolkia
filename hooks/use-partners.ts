"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Partner, PartnerInsert, PartnerWithStats } from "@/lib/types";

const LIST_SELECT =
  "*, oportunidades(id, etapa, monto_estimado_usd, probabilidad), owner:profiles(id, full_name)";

export function usePartners() {
  return useQuery({
    queryKey: ["partners"],
    queryFn: async (): Promise<PartnerWithStats[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("partners")
        .select(LIST_SELECT)
        .order("created_at", { ascending: false })
        .returns<PartnerWithStats[]>();
      if (error) throw error;
      return data;
    },
  });
}

export function usePartner(id: string) {
  return useQuery({
    queryKey: ["partners", id],
    queryFn: async (): Promise<PartnerWithStats | null> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("partners")
        .select(LIST_SELECT)
        .eq("id", id)
        .maybeSingle<PartnerWithStats>();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: PartnerInsert): Promise<Partner> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("partners")
        .insert(values)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner creado");
    },
    onError: (e) => toast.error(`No se pudo crear el partner: ${e.message}`),
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: Partial<PartnerInsert>;
    }): Promise<Partner> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("partners")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner actualizado");
    },
    onError: (e) =>
      toast.error(`No se pudo actualizar el partner: ${e.message}`),
  });
}

export function useDeletePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("partners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["contactos"] });
      queryClient.invalidateQueries({ queryKey: ["oportunidades"] });
      queryClient.invalidateQueries({ queryKey: ["actividades"] });
      toast.success("Partner eliminado");
    },
    onError: (e) =>
      toast.error(`No se pudo eliminar el partner: ${e.message}`),
  });
}
