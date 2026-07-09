"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  X,
  XCircle,
} from "lucide-react";
import {
  useLeadSubmissions,
  useApproveLead,
  useRejectLead,
} from "@/hooks/use-leads";
import type {
  Componente,
  Etapa,
  LeadSubmissionWithRels,
} from "@/lib/types";
import {
  COMPONENTE_LABELS,
  ETAPA_LABELS,
  partnerDisplayName,
} from "@/lib/utils/labels";
import { countryFlag, countryName } from "@/lib/utils/countries";
import { COMISION_CONFIG, calcComision } from "@/lib/utils/comisiones";
import { formatDateTime, formatMoney } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Field } from "@/components/shared/field";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { cn } from "@/lib/utils";

export function LeadsInbox() {
  const { data: leads, isLoading } = useLeadSubmissions();
  const [toApprove, setToApprove] = useState<LeadSubmissionWithRels | null>(
    null
  );
  const [toReject, setToReject] = useState<LeadSubmissionWithRels | null>(
    null
  );

  const { pendientes, procesadas } = useMemo(() => {
    const all = leads ?? [];
    return {
      pendientes: all.filter((l) => l.estado === "pendiente"),
      procesadas: all.filter((l) => l.estado !== "pendiente"),
    };
  }, [leads]);

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-warm">
          <Clock className="size-4 text-amber-500" />
          Pendientes de revisión ({pendientes.length})
        </h2>
        {pendientes.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Sin leads pendientes"
            description="Cuando un partner refiera un lead desde su portal, aparece acá para que lo apruebes o rechaces."
          />
        ) : (
          pendientes.map((lead) => (
            <div
              key={lead.id}
              className="rounded-xl border border-amber-200 bg-amber-50/40 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-ink">
                      {lead.cliente_final_name}
                    </h3>
                    {lead.cliente_final_country && (
                      <span className="text-sm text-muted-warm">
                        {countryFlag(lead.cliente_final_country)}{" "}
                        {countryName(lead.cliente_final_country)}
                      </span>
                    )}
                    {lead.monto_estimado_usd != null && (
                      <Badge variant="outline" className="bg-white">
                        ~{formatMoney(Number(lead.monto_estimado_usd))}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-warm">
                    Referido por{" "}
                    {lead.partner ? (
                      <Link
                        href={`/partners/${lead.partner.id}`}
                        className="font-medium text-orange-deep hover:underline"
                      >
                        {partnerDisplayName(lead.partner)}
                      </Link>
                    ) : (
                      "—"
                    )}
                    {" · "}
                    {formatDateTime(lead.created_at)}
                  </p>
                  {(lead.contacto_nombre ||
                    lead.contacto_email ||
                    lead.contacto_phone) && (
                    <p className="mt-1 text-sm text-ink/80">
                      Contacto:{" "}
                      {[
                        lead.contacto_nombre,
                        lead.contacto_email,
                        lead.contacto_phone,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {lead.descripcion && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-ink/80">
                      {lead.descripcion}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" onClick={() => setToApprove(lead)}>
                    <Check className="size-4" /> Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-red-50"
                    onClick={() => setToReject(lead)}
                  >
                    <X className="size-4" /> Rechazar
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {procesadas.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-warm">
            Procesados ({procesadas.length})
          </h2>
          <div className="space-y-2">
            {procesadas.map((lead) => (
              <div
                key={lead.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white px-4 py-3"
              >
                {lead.estado === "aprobada" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="size-4 shrink-0 text-red-500" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">
                    {lead.cliente_final_name}
                    <span className="font-normal text-muted-warm">
                      {" — "}
                      {lead.partner ? partnerDisplayName(lead.partner) : ""}
                    </span>
                  </p>
                  <p className="text-xs text-muted-warm">
                    {lead.estado === "aprobada"
                      ? "Aprobado"
                      : `Rechazado${lead.motivo_rechazo ? `: ${lead.motivo_rechazo}` : ""}`}
                    {lead.reviewed_at &&
                      ` · ${formatDateTime(lead.reviewed_at)}`}
                  </p>
                </div>
                {lead.estado === "aprobada" && lead.oportunidad_id && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/oportunidades/${lead.oportunidad_id}`}>
                      Ver oportunidad
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <ApproveDialog lead={toApprove} onClose={() => setToApprove(null)} />
      <RejectDialog lead={toReject} onClose={() => setToReject(null)} />
    </div>
  );
}

function ApproveDialog({
  lead,
  onClose,
}: {
  lead: LeadSubmissionWithRels | null;
  onClose: () => void;
}) {
  const approveLead = useApproveLead();
  const [componente, setComponente] = useState<Componente>("R-A");
  const [etapa, setEtapa] = useState<Etapa>("lead");
  const [monto, setMonto] = useState("");
  const [comision, setComision] = useState("0");
  const [probabilidad, setProbabilidad] = useState(50);

  // Prefill al abrir
  const leadId = lead?.id;
  useMemo(() => {
    if (lead) {
      setMonto(
        lead.monto_estimado_usd != null
          ? String(Number(lead.monto_estimado_usd))
          : ""
      );
      setComision("0");
      setComponente("R-A");
      setEtapa("lead");
      setProbabilidad(50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  // Comisión automática según componente y monto (ajustable a mano)
  useEffect(() => {
    setComision(String(calcComision(componente, Number(monto) || 0)));
  }, [componente, monto]);

  const comisionInfo = COMISION_CONFIG[componente];

  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aprobar lead — {lead?.cliente_final_name}</DialogTitle>
          <DialogDescription>
            Se crea la oportunidad en el pipeline y el partner ve el avance en
            su portal.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Componente" required>
            <Select
              value={componente}
              onValueChange={(v) => setComponente(v as Componente)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COMPONENTE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={comisionInfo.montoLabel} required>
              <Input
                type="number"
                min="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </Field>
            <Field label="Comisión estimada (USD)">
              <Input
                type="number"
                min="0"
                value={comision}
                onChange={(e) => setComision(e.target.value)}
              />
            </Field>
          </div>
          <p className="text-xs text-muted-warm">
            Comisión calculada: {comisionInfo.formula} · {comisionInfo.pago}.
            Podés ajustarla a mano.
          </p>
          <Field label={`Probabilidad: ${probabilidad}%`}>
            <Slider
              value={[probabilidad]}
              onValueChange={([v]) => setProbabilidad(v)}
              min={0}
              max={100}
              step={5}
              className="py-2"
            />
          </Field>
          <Field label="Etapa inicial">
            <Select value={etapa} onValueChange={(v) => setEtapa(v as Etapa)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["lead", "calificada"] as Etapa[]).map((e) => (
                  <SelectItem key={e} value={e}>
                    {ETAPA_LABELS[e]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Button
            className="w-full font-semibold"
            disabled={approveLead.isPending || monto === ""}
            onClick={() => {
              if (!lead) return;
              approveLead.mutate(
                {
                  lead,
                  componente,
                  monto: Number(monto) || 0,
                  comision: Number(comision) || 0,
                  probabilidad,
                  etapa,
                },
                { onSuccess: onClose }
              );
            }}
          >
            {approveLead.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Crear oportunidad
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RejectDialog({
  lead,
  onClose,
}: {
  lead: LeadSubmissionWithRels | null;
  onClose: () => void;
}) {
  const rejectLead = useRejectLead();
  const [motivo, setMotivo] = useState("");

  const leadId = lead?.id;
  useMemo(() => {
    setMotivo("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rechazar lead — {lead?.cliente_final_name}</DialogTitle>
          <DialogDescription>
            El partner va a ver este motivo en su portal.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Motivo" required>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              placeholder="Ej: ya estamos en conversación directa con este cliente…"
            />
          </Field>
          <Button
            variant="destructive"
            className={cn("w-full font-semibold")}
            disabled={rejectLead.isPending || motivo.trim().length < 3}
            onClick={() => {
              if (!lead) return;
              rejectLead.mutate(
                { leadId: lead.id, motivo: motivo.trim() },
                { onSuccess: onClose }
              );
            }}
          >
            {rejectLead.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Confirmar rechazo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
