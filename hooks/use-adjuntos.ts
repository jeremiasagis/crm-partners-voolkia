"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Adjunto, EntityType } from "@/lib/types";

const BUCKET = "adjuntos";

export function useAdjuntos(entityType: EntityType, entityId: string) {
  return useQuery({
    queryKey: ["adjuntos", entityType, entityId],
    queryFn: async (): Promise<Adjunto[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("adjuntos")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!entityId,
  });
}

export function useUploadAdjuntos(entityType: EntityType, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      for (const file of files) {
        if (file.size > 20 * 1024 * 1024) {
          throw new Error(`${file.name} supera los 20 MB`);
        }
        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${entityType}/${entityId}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file);
        if (uploadError) throw new Error(`${file.name}: ${uploadError.message}`);

        const { error: insertError } = await supabase.from("adjuntos").insert({
          entity_type: entityType,
          entity_id: entityId,
          file_name: file.name,
          file_path: path,
          file_size: file.size,
          file_type: file.type || null,
          uploaded_by: user?.id ?? null,
        });
        if (insertError) {
          // Rollback del archivo subido si falla el registro
          await supabase.storage.from(BUCKET).remove([path]);
          throw new Error(`${file.name}: ${insertError.message}`);
        }
      }
    },
    onSuccess: (_d, files) => {
      queryClient.invalidateQueries({
        queryKey: ["adjuntos", entityType, entityId],
      });
      toast.success(
        files.length === 1
          ? "Archivo subido"
          : `${files.length} archivos subidos`
      );
    },
    onError: (e) => toast.error(`Error al subir: ${e.message}`),
  });
}

export function useDeleteAdjunto(entityType: EntityType, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (adjunto: Adjunto) => {
      const supabase = createClient();
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([adjunto.file_path]);
      if (storageError) throw storageError;
      const { error } = await supabase
        .from("adjuntos")
        .delete()
        .eq("id", adjunto.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["adjuntos", entityType, entityId],
      });
      toast.success("Adjunto eliminado");
    },
    onError: (e) => toast.error(`No se pudo eliminar: ${e.message}`),
  });
}

/** Abre el archivo en una pestaña nueva con URL firmada (bucket privado) */
export async function openAdjunto(adjunto: Adjunto) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(adjunto.file_path, 60 * 10);
  if (error || !data?.signedUrl) {
    toast.error("No se pudo generar el link de descarga");
    return;
  }
  window.open(data.signedUrl, "_blank");
}
