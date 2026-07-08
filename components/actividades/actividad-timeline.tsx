"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Phone,
  StickyNote,
  Trash2,
  Users,
} from "lucide-react";
import { isPast, isToday, parseISO } from "date-fns";
import type { ActividadWithRels, TipoActividad } from "@/lib/types";
import { useDeleteActividad } from "@/hooks/use-actividades";
import { TIPO_ACTIVIDAD_LABELS, partnerDisplayName } from "@/lib/utils/labels";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export const TIPO_ICONS: Record<TipoActividad, React.ElementType> = {
  llamada: Phone,
  reunion: Users,
  email: Mail,
  whatsapp: MessageCircle,
  nota: StickyNote,
  otro: MoreHorizontal,
};

export function ActividadTimeline({
  items,
  showPartner = true,
}: {
  items: ActividadWithRels[];
  showPartner?: boolean;
}) {
  const deleteActividad = useDeleteActividad();
  const [toDelete, setToDelete] = useState<ActividadWithRels | null>(null);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Sin actividades"
        description="Todavía no hay actividades registradas acá."
      />
    );
  }

  return (
    <div className="relative space-y-0">
      {items.map((a, i) => {
        const Icon = TIPO_ICONS[a.tipo];
        const overdue =
          a.proxima_accion_fecha &&
          (isPast(parseISO(a.proxima_accion_fecha)) ||
            isToday(parseISO(a.proxima_accion_fecha)));
        return (
          <div key={a.id} className="relative flex gap-4 pb-6">
            {/* Línea vertical */}
            {i < items.length - 1 && (
              <div className="absolute left-[19px] top-10 h-full w-px bg-line" />
            )}
            <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-white">
              <Icon className="size-4 text-orange-deep" />
            </div>
            <div className="min-w-0 flex-1 rounded-xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-warm">
                      {TIPO_ACTIVIDAD_LABELS[a.tipo]}
                    </span>
                    <span className="text-xs text-muted-warm">
                      {formatDateTime(a.fecha)}
                    </span>
                    {a.owner?.full_name && (
                      <span className="text-xs text-muted-warm">
                        · {a.owner.full_name}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-0.5 font-semibold text-ink">{a.titulo}</h4>
                  {showPartner && a.partner && (
                    <Link
                      href={`/partners/${a.partner.id}`}
                      className="text-sm text-orange-deep hover:underline"
                    >
                      {partnerDisplayName(a.partner)}
                    </Link>
                  )}
                  {a.contacto && (
                    <span className="text-sm text-muted-warm">
                      {showPartner && a.partner ? " · " : ""}
                      {a.contacto.first_name} {a.contacto.last_name}
                    </span>
                  )}
                  {a.oportunidad && (
                    <span className="text-sm text-muted-warm">
                      {" · "}
                      {a.oportunidad.cliente_final_name}
                    </span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setToDelete(a)}
                    >
                      <Trash2 className="size-4" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {a.descripcion && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">
                  {a.descripcion}
                </p>
              )}
              {a.proxima_accion && (
                <div
                  className={cn(
                    "mt-3 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                    overdue
                      ? "border-red-200 bg-red-50 text-red-800"
                      : "border-orange-vk/30 bg-orange-soft/50 text-orange-deep"
                  )}
                >
                  <CalendarClock className="size-4 shrink-0" />
                  <span className="font-medium">Próxima acción:</span>
                  <span>{a.proxima_accion}</span>
                  {a.proxima_accion_fecha && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-auto",
                        overdue
                          ? "border-red-300 bg-white text-red-700"
                          : "border-orange-vk/30 bg-white text-orange-deep"
                      )}
                    >
                      {formatDate(a.proxima_accion_fecha)}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="¿Eliminar esta actividad?"
        description="Esta acción no se puede deshacer."
        onConfirm={() => {
          if (toDelete) deleteActividad.mutate(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
