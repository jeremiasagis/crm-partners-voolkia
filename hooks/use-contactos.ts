"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Contacto, ContactoInsert, ContactoWithPartner } from "@/lib/types";

const LIST_SELECT =
  "*, partner:partners(id, legal_name, commercial_name, country_code)";

export function useContactos(partnerId?: string) {
  return useQuery({
    queryKey: ["contactos", { partnerId: partnerId ?? null }],
    queryFn: async (): Promise<ContactoWithPartner[]> => {
      const supabase = createClient();
      let query = supabase
        .from("contactos")
        .select(LIST_SELECT)
        .order("created_at", { ascending: false });
      if (partnerId) query = query.eq("partner_id", partnerId);
      const { data, error } = await query.returns<ContactoWithPartner[]>();
      if (error) throw error;
      return data;
    },
  });
}

export function useContacto(id: string) {
  return useQuery({
    queryKey: ["contactos", "detail", id],
    queryFn: async (): Promise<ContactoWithPartner | null> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("contactos")
        .select(LIST_SELECT)
        .eq("id", id)
        .maybeSingle<ContactoWithPartner>();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateContacto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: ContactoInsert): Promise<Contacto> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("contactos")
        .insert(values)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactos"] });
      toast.success("Contacto creado");
    },
    onError: (e) => toast.error(`No se pudo crear el contacto: ${e.message}`),
  });
}

export function useUpdateContacto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: Partial<ContactoInsert>;
    }): Promise<Contacto> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("contactos")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactos"] });
      toast.success("Contacto actualizado");
    },
    onError: (e) =>
      toast.error(`No se pudo actualizar el contacto: ${e.message}`),
  });
}

export function useDeleteContacto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("contactos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactos"] });
      toast.success("Contacto eliminado");
    },
    onError: (e) =>
      toast.error(`No se pudo eliminar el contacto: ${e.message}`),
  });
}
