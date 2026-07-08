"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CalendarPlus,
  Pencil,
  Target,
  Trash2,
} from "lucide-react";
import { isPast, isToday, parseISO } from "date-fns";
import {
  useOportunidad,
  useDeleteOportunidad,
} from "@/hooks/use-oportunidades";
import { useActividades } from "@/hooks/use-actividades";
import { useEtapaHistorial } from "@/hooks/use-historial";
import { useProfiles } from "@/hooks/use-profiles";
import type { Etapa } from "@/lib/types";
import {
  COMPONENTE_COLORS,
  COMPONENTE_LABELS,
  ETAPA_COLORS,
  ETAPA_LABELS,
  MOTIVO_PERDIDA_LABELS,
  partnerDisplayName,
} from "@/lib/utils/labels";
import { countryFlag, countryName } from "@/lib/utils/countries";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AdjuntosPanel } from "@/components/shared/adjuntos-panel";
import { ActividadTimeline } from "@/components/actividades/actividad-timeline";
import { cn } from "@/lib/utils";

export function OppDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: opp, isLoading } = useOportunidad(id);
  const { data: actividades = [] } = useActividades({ oportunidadId: id });
  const { data: historial = [] } = useEtapaHistorial(id);
  const { data: profiles = [] } = useProfiles();
  const deleteOpp = useDeleteOportunidad();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!opp) {
    return (
      <EmptyState
        icon={Target}
        title="Oportunidad no encontrada"
        description="Puede que haya sido eliminada."
        action={
          <Button asChild variant="outline">
            <Link href="/oportunidades">Volver a Oportunidades</Link>
          </Button>
        }
      />
    );
  }

  const overdue =
    opp.proxima_accion_fecha &&
    (isPast(parseISO(opp.proxima_accion_fecha)) ||
      isToday(parseISO(opp.proxima_accion_fecha)));

  const profileName = (userId: string | null) =>
    profiles.find((p) => p.id === userId)?.full_name ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-line bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-extrabold text-ink">
                {opp.cliente_final_name}
              </h2>
              {opp.etapa && (
                <Badge variant="outline" className={ETAPA_COLORS[opp.etapa]}>
                  {ETAPA_LABELS[opp.etapa]}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={COMPONENTE_COLORS[opp.componente]}
              >
                {COMPONENTE_LABELS[opp.componente]}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-warm">
              Referida por{" "}
              {opp.partner ? (
                <Link
                  href={`/partners/${opp.partner.id}`}
                  className="font-medium text-orange-deep hover:underline"
                >
                  {partnerDisplayName(opp.partner)}
                </Link>
              ) : (
                "—"
              )}
              {opp.cliente_final_country &&
                ` · Cliente en ${countryFlag(opp.cliente_final_country)} ${countryName(opp.cliente_final_country)}`}
              {opp.owner?.full_name && ` · Owner: ${opp.owner.full_name}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/actividades/new?partner=${opp.partner_id}`}>
                <CalendarPlus className="size-4" /> Nueva actividad
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/oportunidades/${opp.id}/edit`}>
                <Pencil className="size-4" /> Editar
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:bg-red-50 hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        {/* Métricas del deal */}
        <div className="mt-5 grid gap-4 rounded-lg bg-cream/60 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Monto estimado">
            <span className="text-xl font-extrabold tabular-nums">
              {formatMoney(Number(opp.monto_estimado_usd))}
            </span>
          </Metric>
          <Metric label="Comisión estimada">
            <span className="text-xl font-bold tabular-nums text-orange-deep">
              {formatMoney(Number(opp.comision_estimada_usd ?? 0))}
            </span>
          </Metric>
          <Metric label="Probabilidad">{opp.probabilidad ?? 0}%</Metric>
          <Metric label="Cierre estimado">
            {formatDate(opp.fecha_estimada_cierre)}
          </Metric>
          <Metric label={opp.etapa === "ganada" ? "Cierre real" : "Estado"}>
            {opp.etapa === "ganada"
              ? formatDate(opp.fecha_real_cierre)
              : opp.etapa === "perdida" && opp.motivo_perdida
                ? `Perdida: ${MOTIVO_PERDIDA_LABELS[opp.motivo_perdida]}`
                : "En curso"}
          </Metric>
        </div>

        {/* Próxima acción */}
        {opp.proxima_accion && (
          <div
            className={cn(
              "mt-4 flex flex-wrap items-center gap-2 rounded-lg border px-4 py-3 text-sm",
              overdue
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-orange-vk/30 bg-orange-soft/50 text-orange-deep"
            )}
          >
            <CalendarClock className="size-4 shrink-0" />
            <span className="font-semibold">Próxima acción:</span>
            <span>{opp.proxima_accion}</span>
            {opp.proxima_accion_fecha && (
              <Badge
                variant="outline"
                className={cn(
                  "ml-auto bg-white",
                  overdue
                    ? "border-red-300 text-red-700"
                    : "border-orange-vk/30 text-orange-deep"
                )}
              >
                {formatDate(opp.proxima_accion_fecha)}
              </Badge>
            )}
          </div>
        )}

        {opp.notes && (
          <p className="mt-4 whitespace-pre-wrap rounded-lg border border-line bg-white p-3 text-sm text-ink/80">
            {opp.notes}
          </p>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="actividades">
        <TabsList>
          <TabsTrigger value="actividades">
            Actividades ({actividades.length})
          </TabsTrigger>
          <TabsTrigger value="historial">
            Historial de etapas ({historial.length})
          </TabsTrigger>
          <TabsTrigger value="adjuntos">Adjuntos</TabsTrigger>
        </TabsList>

        <TabsContent value="actividades" className="mt-4">
          <ActividadTimeline items={actividades} showPartner={false} />
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          {historial.length === 0 ? (
            <EmptyState
              icon={ArrowRight}
              title="Sin historial"
              description="Los cambios de etapa se registran automáticamente desde que corriste la migración 002."
            />
          ) : (
            <div className="rounded-xl border border-line bg-white p-5">
              <ul className="space-y-3">
                {[...historial].reverse().map((h) => (
                  <li key={h.id} className="flex flex-wrap items-center gap-2 text-sm">
                    {h.etapa_anterior ? (
                      <>
                        <Badge
                          variant="outline"
                          className={ETAPA_COLORS[h.etapa_anterior as Etapa] ?? ""}
                        >
                          {ETAPA_LABELS[h.etapa_anterior as Etapa] ?? h.etapa_anterior}
                        </Badge>
                        <ArrowRight className="size-3.5 text-muted-warm" />
                      </>
                    ) : (
                      <span className="text-xs font-semibold uppercase text-muted-warm">
                        Creada en
                      </span>
                    )}
                    <Badge
                      variant="outline"
                      className={ETAPA_COLORS[h.etapa_nueva as Etapa] ?? ""}
                    >
                      {ETAPA_LABELS[h.etapa_nueva as Etapa] ?? h.etapa_nueva}
                    </Badge>
                    <span className="ml-auto text-xs text-muted-warm">
                      {profileName(h.changed_by)
                        ? `${profileName(h.changed_by)} · `
                        : ""}
                      {formatDateTime(h.changed_at)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="adjuntos" className="mt-4">
          <AdjuntosPanel entityType="oportunidad" entityId={opp.id} />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`¿Eliminar la oportunidad de ${opp.cliente_final_name}?`}
        description="Esta acción no se puede deshacer."
        onConfirm={() => {
          deleteOpp.mutate(opp.id, {
            onSuccess: () => router.push("/oportunidades"),
          });
        }}
      />
    </div>
  );
}

function Metric({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-warm">
        {label}
      </p>
      <div className="mt-0.5 text-sm font-medium text-ink">{children}</div>
    </div>
  );
}
