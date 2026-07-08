"use client";

import { useRef, useState } from "react";
import {
  Download,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  openAdjunto,
  useAdjuntos,
  useDeleteAdjunto,
  useUploadAdjuntos,
} from "@/hooks/use-adjuntos";
import type { Adjunto, EntityType } from "@/lib/types";
import { formatRelative } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "@/lib/utils";

function fileIcon(type: string | null) {
  if (!type) return File;
  if (type.startsWith("image/")) return FileImage;
  if (type.includes("pdf") || type.startsWith("text/")) return FileText;
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv"))
    return FileSpreadsheet;
  return File;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdjuntosPanel({
  entityType,
  entityId,
}: {
  entityType: EntityType;
  entityId: string;
}) {
  const { data: adjuntos, isLoading } = useAdjuntos(entityType, entityId);
  const upload = useUploadAdjuntos(entityType, entityId);
  const deleteAdjunto = useDeleteAdjunto(entityType, entityId);
  const [dragOver, setDragOver] = useState(false);
  const [toDelete, setToDelete] = useState<Adjunto | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(list: FileList | null) {
    if (!list?.length) return;
    upload.mutate(Array.from(list));
  }

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragOver
            ? "border-orange-vk bg-orange-soft/50"
            : "border-line bg-white/60 hover:border-orange-vk/50"
        )}
      >
        {upload.isPending ? (
          <Loader2 className="size-6 animate-spin text-orange-deep" />
        ) : (
          <UploadCloud className="size-6 text-orange-deep" />
        )}
        <p className="text-sm font-medium text-ink">
          Arrastrá archivos acá o hacé clic para elegir
        </p>
        <p className="text-xs text-muted-warm">Máximo 20 MB por archivo</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Grid de archivos */}
      {adjuntos && adjuntos.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {adjuntos.map((a) => {
            const Icon = fileIcon(a.file_type);
            return (
              <div
                key={a.id}
                className="group flex items-center gap-3 rounded-xl border border-line bg-white p-3"
              >
                <div className="rounded-lg bg-cream p-2.5">
                  <Icon className="size-5 text-orange-deep" />
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => openAdjunto(a)}
                    className="block w-full truncate text-left text-sm font-medium text-ink hover:text-orange-deep"
                    title={a.file_name}
                  >
                    {a.file_name}
                  </button>
                  <p className="text-xs text-muted-warm">
                    {formatSize(a.file_size)}
                    {a.uploaded_at && ` · ${formatRelative(a.uploaded_at)}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => openAdjunto(a)}
                    title="Descargar"
                  >
                    <Download className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive"
                    onClick={() => setToDelete(a)}
                    title="Eliminar"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`¿Eliminar ${toDelete?.file_name}?`}
        description="El archivo se borra definitivamente del storage."
        onConfirm={() => {
          if (toDelete) deleteAdjunto.mutate(toDelete);
          setToDelete(null);
        }}
      />
    </div>
  );
}
