"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  DollarSign,
  Send,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import {
  useMisSolicitudes,
  usePortalHistorial,
  usePortalOportunidades,
  usePortalPartner,
} from "@/hooks/use-portal";
import type { Etapa, PortalOportunidad } from "@/lib/types";
import {
  COMPONENTE_COLORS,
  COMPONENTE_LABELS,
  ETAPAS_PIPELINE,
  ETAPA_COLORS,
  ETAPA_LABELS,
  MOTIVO_PERDIDA_LABELS,
  partnerDisplayName,
} from "@/lib/utils/labels";
import { countryFlag } from "@/lib/utils/countries";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EmptyState } from "@/components/shared/empty-state";
import { ReferirLeadDialog } from "./referir-lead-dialog";
import { cn } from "@/lib/utils";

export function PortalView() {
  const { data: partner, isLoading: loadingPartner } = usePortalPartner();
  const { data: oportunidades = [], isLoading: loadingOpps } =
    usePortalOportunidades();
  const { data: historial = [] } = usePortalHistorial();
  const { data: solicitudes = [] } = useMisSolicitudes();
  const [referirOpen, setReferirOpen] = useState(false);

  const stats = useMemo(() => {
    const abiertas = oportunidades.filter(
      (o) => o.etapa && ETAPAS_PIPELINE.includes(o.etapa)
    );
    const ganadas = oportunidades.filter((o) => o.etapa === "ganada");
    return {
      abiertas: abiertas.length,
      pipeline: abiertas.reduce(
        (acc, o) => acc + Number(o.monto_estimado_usd),
        0
      ),
      comisionesAbiertas: abiertas.reduce(
        (acc, o) => acc + Number(o.comision_estimada_usd ?? 0),
        0
      ),
      ganadas: ganadas.length,
      comisionesGanadas: ganadas.reduce(
        (acc, o) => acc + Number(o.comision_estimada_usd ?? 0),
        0
      ),
    };
  }, [oportunidades]);

  const historialPorOpp = useMemo(() => {
    const map = new Map<string, typeof historial>();
    for (const h of historial) {
      const list = map.get(h.oportunidad_id) ?? [];
      list.push(h);
      map.set(h.oportunidad_id, list);
    }
    return map;
  }, [historial]);

  if (loadingPartner || loadingOpps) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bienvenida + CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">
            {partner ? partnerDisplayName(partner) : "Portal"}
          </h1>
          <p className="text-sm text-muted-warm">
            Seguimiento en tiempo real de las oportunidades que referiste a
            Voolkia.
          </p>
        </div>
        <Button
          onClick={() => setReferirOpen(true)}
          className="font-semibold"
        >
          <Send className="size-4" />
          Referir un lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Target}
          label="Oportunidades abiertas"
          value={String(stats.abiertas)}
          detail={`${formatMoney(stats.pipeline)} en juego`}
        />
        <StatCard
          icon={DollarSign}
          label="Comisiones potenciales"
          value={formatMoney(stats.comisionesAbiertas)}
          detail="Si se ganan las abiertas"
        />
        <StatCard
          icon={Trophy}
          label="Ganadas"
          value={String(stats.ganadas)}
          detail={`${formatMoney(stats.comisionesGanadas)} en comisiones`}
        />
      </div>

      {/* Oportunidades */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-warm">
          Tus oportunidades ({oportunidades.length})
        </h2>
        {oportunidades.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Todavía no hay oportunidades"
            description="Cuando Voolkia registre un negocio referido por vos, lo vas a ver acá con su avance en vivo."
          />
        ) : (
          oportunidades.map((o) => (
            <OppCard
              key={o.id}
              opp={o}
              historial={historialPorOpp.get(o.id) ?? []}
            />
          ))
        )}
      </section>

      {/* Mis solicitudes */}
      {solicitudes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-warm">
            Leads que referiste ({solicitudes.length})
          </h2>
          <div className="space-y-2">
            {solicitudes.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white px-4 py-3"
              >
                {s.estado === "pendiente" && (
                  <Clock className="size-4 shrink-0 text-amber-500" />
                )}
                {s.estado === "aprobada" && (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                )}
                {s.estado === "rechazada" && (
                  <XCircle className="size-4 shrink-0 text-red-500" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">
                    {s.cliente_final_name}
                  </p>
                  <p className="text-xs text-muted-warm">
                    Enviado {formatDate(s.created_at)}
                    {s.estado === "rechazada" && s.motivo_rechazo
                      ? ` · Motivo: ${s.motivo_rechazo}`
                      : ""}
                    {s.estado === "aprobada"
                      ? " · Convertido en oportunidad, seguilo arriba 👆"
                      : ""}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    s.estado === "pendiente" &&
                      "border-amber-200 bg-amber-100 text-amber-800",
                    s.estado === "aprobada" &&
                      "border-emerald-200 bg-emerald-100 text-emerald-800",
                    s.estado === "rechazada" &&
                      "border-red-200 bg-red-100 text-red-700"
                  )}
                >
                  {s.estado === "pendiente"
                    ? "En revisión"
                    : s.estado === "aprobada"
                      ? "Aprobado"
                      : "Rechazado"}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {partner && (
        <ReferirLeadDialog
          open={referirOpen}
          onOpenChange={setReferirOpen}
          partnerId={partner.id}
        />
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-orange-soft p-2">
          <Icon className="size-4 text-orange-deep" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-warm">
          {label}
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold tabular-nums text-ink">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-warm">{detail}</p>
    </div>
  );
}

function OppCard({
  opp,
  historial,
}: {
  opp: PortalOportunidad;
  historial: { etapa_anterior: string | null; etapa_nueva: string; changed_at: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-xl border border-line bg-white"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-ink">{opp.cliente_final_name}</h3>
            {opp.cliente_final_country && (
              <span className="text-sm">
                {countryFlag(opp.cliente_final_country)}
              </span>
            )}
            <Badge
              variant="outline"
              className={COMPONENTE_COLORS[opp.componente]}
            >
              {COMPONENTE_LABELS[opp.componente]}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-warm">
            Cargada el {formatDate(opp.created_at)}
            {opp.fecha_estimada_cierre &&
              ` · Cierre estimado ${formatDate(opp.fecha_estimada_cierre)}`}
            {opp.etapa === "ganada" &&
              opp.fecha_real_cierre &&
              ` · Ganada el ${formatDate(opp.fecha_real_cierre)}`}
            {opp.etapa === "perdida" &&
              opp.motivo_perdida &&
              ` · Motivo: ${MOTIVO_PERDIDA_LABELS[opp.motivo_perdida]}`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-extrabold tabular-nums text-ink">
            {formatMoney(Number(opp.monto_estimado_usd))}
          </p>
          <p className="text-xs font-semibold tabular-nums text-orange-deep">
            Tu comisión: {formatMoney(Number(opp.comision_estimada_usd ?? 0))}
          </p>
        </div>
        {opp.etapa && (
          <Badge variant="outline" className={ETAPA_COLORS[opp.etapa]}>
            {ETAPA_LABELS[opp.etapa]}
          </Badge>
        )}
        <CollapsibleTrigger asChild>
          <button
            className="rounded-lg border border-line p-1.5 text-muted-warm transition-transform hover:text-ink"
            aria-label="Ver historial"
          >
            <ChevronDown
              className={cn("size-4 transition-transform", open && "rotate-180")}
            />
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="border-t border-line bg-cream/40 px-4 py-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-warm">
            Historial de avance
          </p>
          {historial.length === 0 ? (
            <p className="text-sm text-muted-warm">Sin movimientos todavía.</p>
          ) : (
            <ul className="space-y-1.5">
              {[...historial].reverse().map((h, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-center gap-2 text-sm"
                >
                  {h.etapa_anterior ? (
                    <>
                      <Badge
                        variant="outline"
                        className={cn(
                          "bg-white",
                          ETAPA_COLORS[h.etapa_anterior as Etapa] ?? ""
                        )}
                      >
                        {ETAPA_LABELS[h.etapa_anterior as Etapa] ??
                          h.etapa_anterior}
                      </Badge>
                      <ArrowRight className="size-3.5 text-muted-warm" />
                    </>
                  ) : (
                    <span className="text-xs font-semibold uppercase text-muted-warm">
                      Ingresó como
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={ETAPA_COLORS[h.etapa_nueva as Etapa] ?? ""}
                  >
                    {ETAPA_LABELS[h.etapa_nueva as Etapa] ?? h.etapa_nueva}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-warm">
                    {formatDateTime(h.changed_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
