"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { usePartner } from "@/hooks/use-partners";
import { useContactos } from "@/hooks/use-contactos";
import { useOportunidades } from "@/hooks/use-oportunidades";
import { useActividades } from "@/hooks/use-actividades";
import {
  COMPONENTE_LABELS,
  ETAPAS_PIPELINE,
  ETAPA_LABELS,
  FUNNEL_STAGE_LABELS,
  PARTNER_SIZE_LABELS,
  PARTNER_STATUS_LABELS,
  PARTNER_TYPE_LABELS,
  SOURCE_LABELS,
  TIPO_ACTIVIDAD_LABELS,
  partnerDisplayName,
} from "@/lib/utils/labels";
import { countryFlag, countryName } from "@/lib/utils/countries";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function PartnerBrief({ id }: { id: string }) {
  const { data: partner, isLoading } = usePartner(id);
  const { data: contactos = [] } = useContactos(id);
  const { data: oportunidades = [] } = useOportunidades(id);
  const { data: actividades = [] } = useActividades({ partnerId: id });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-10">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="mx-auto max-w-3xl p-10 text-center text-muted-warm">
        Partner no encontrado.
      </div>
    );
  }

  const abiertas = oportunidades.filter(
    (o) => o.etapa && ETAPAS_PIPELINE.includes(o.etapa)
  );
  const pipelinePonderado = abiertas.reduce(
    (acc, o) =>
      acc + Number(o.monto_estimado_usd) * ((o.probabilidad ?? 0) / 100),
    0
  );
  const ganadas = oportunidades.filter((o) => o.etapa === "ganada");
  const ultimasActividades = actividades.slice(0, 5);

  return (
    <div className="mx-auto max-w-3xl px-10 py-8 text-ink print:px-0 print:py-0">
      {/* Barra de acciones — no se imprime */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Button asChild variant="outline" size="sm">
          <Link href={`/partners/${partner.id}`}>
            <ArrowLeft className="size-4" /> Volver
          </Link>
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="size-4" /> Imprimir / Guardar PDF
        </Button>
      </div>

      {/* Encabezado */}
      <header className="flex items-start justify-between border-b-2 border-[#2A0E04] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold">
            {partnerDisplayName(partner)}
          </h1>
          <p className="text-sm text-muted-warm">
            {partner.legal_name} · {countryFlag(partner.country_code)}{" "}
            {countryName(partner.country_code)}
          </p>
        </div>
        <div className="text-right">
          <Image
            src="/voolkia.svg"
            alt="Voolkia"
            width={110}
            height={25}
            className="ml-auto h-6 w-auto"
          />
          <p className="mt-1 text-[11px] text-muted-warm">
            Brief de Partner · {formatDate(new Date())}
          </p>
        </div>
      </header>

      {/* Datos clave */}
      <section className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
        <BriefItem label="Tier" value={partner.tier ? `Tier ${partner.tier}` : "—"} />
        <BriefItem
          label="Status"
          value={partner.status ? PARTNER_STATUS_LABELS[partner.status] : "—"}
        />
        <BriefItem
          label="Etapa funnel"
          value={
            partner.funnel_stage
              ? FUNNEL_STAGE_LABELS[partner.funnel_stage]
              : "—"
          }
        />
        <BriefItem
          label="Tipo"
          value={
            partner.partner_type
              ? PARTNER_TYPE_LABELS[partner.partner_type]
              : "—"
          }
        />
        <BriefItem
          label="Tamaño"
          value={partner.size ? PARTNER_SIZE_LABELS[partner.size] : "—"}
        />
        <BriefItem
          label="Source"
          value={partner.source ? SOURCE_LABELS[partner.source] : "—"}
        />
        <BriefItem label="Owner" value={partner.owner?.full_name ?? "—"} />
        <BriefItem label="Firmado" value={formatDate(partner.signed_at)} />
        <BriefItem label="Website" value={partner.website ?? "—"} />
        {partner.industries && partner.industries.length > 0 && (
          <BriefItem
            label="Industrias"
            value={partner.industries.join(", ")}
            className="col-span-2 sm:col-span-3"
          />
        )}
        {partner.notes && (
          <BriefItem
            label="Notas"
            value={partner.notes}
            className="col-span-2 sm:col-span-3"
          />
        )}
      </section>

      {/* Resumen comercial */}
      <section className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-line bg-cream/60 p-3 text-center">
          <p className="text-[11px] font-semibold uppercase text-muted-warm">
            Pipeline ponderado
          </p>
          <p className="text-lg font-extrabold tabular-nums">
            {formatMoney(pipelinePonderado)}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-cream/60 p-3 text-center">
          <p className="text-[11px] font-semibold uppercase text-muted-warm">
            Opps abiertas
          </p>
          <p className="text-lg font-extrabold tabular-nums">
            {abiertas.length}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-cream/60 p-3 text-center">
          <p className="text-[11px] font-semibold uppercase text-muted-warm">
            Ganadas
          </p>
          <p className="text-lg font-extrabold tabular-nums">
            {ganadas.length}
          </p>
        </div>
      </section>

      {/* Contactos */}
      <BriefSection title={`Contactos (${contactos.length})`}>
        {contactos.length === 0 ? (
          <p className="text-sm text-muted-warm">Sin contactos cargados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] font-semibold uppercase text-muted-warm">
                <th className="py-1.5 pr-2">Nombre</th>
                <th className="py-1.5 pr-2">Cargo</th>
                <th className="py-1.5 pr-2">Email</th>
                <th className="py-1.5">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {contactos.map((c) => (
                <tr key={c.id} className="border-b border-line/60">
                  <td className="py-1.5 pr-2 font-medium">
                    {c.first_name} {c.last_name}
                    {c.is_decision_maker && (
                      <span className="ml-1 text-[10px] font-bold text-orange-deep">
                        ★ DECISOR
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 pr-2">{c.role ?? "—"}</td>
                  <td className="py-1.5 pr-2">{c.email ?? "—"}</td>
                  <td className="py-1.5">{c.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </BriefSection>

      {/* Oportunidades */}
      <BriefSection title={`Oportunidades (${oportunidades.length})`}>
        {oportunidades.length === 0 ? (
          <p className="text-sm text-muted-warm">Sin oportunidades.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] font-semibold uppercase text-muted-warm">
                <th className="py-1.5 pr-2">Cliente final</th>
                <th className="py-1.5 pr-2">Comp.</th>
                <th className="py-1.5 pr-2">Etapa</th>
                <th className="py-1.5 pr-2 text-right">Monto</th>
                <th className="py-1.5 pr-2 text-right">Prob.</th>
                <th className="py-1.5">Cierre est.</th>
              </tr>
            </thead>
            <tbody>
              {oportunidades.map((o) => (
                <tr key={o.id} className="border-b border-line/60">
                  <td className="py-1.5 pr-2 font-medium">
                    {o.cliente_final_name}
                  </td>
                  <td className="py-1.5 pr-2">
                    {COMPONENTE_LABELS[o.componente]}
                  </td>
                  <td className="py-1.5 pr-2">
                    {o.etapa ? ETAPA_LABELS[o.etapa] : "—"}
                  </td>
                  <td className="py-1.5 pr-2 text-right tabular-nums">
                    {formatMoney(Number(o.monto_estimado_usd))}
                  </td>
                  <td className="py-1.5 pr-2 text-right tabular-nums">
                    {o.probabilidad ?? 0}%
                  </td>
                  <td className="py-1.5">
                    {formatDate(o.fecha_estimada_cierre)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </BriefSection>

      {/* Últimas actividades */}
      <BriefSection title="Últimas actividades">
        {ultimasActividades.length === 0 ? (
          <p className="text-sm text-muted-warm">Sin actividades.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {ultimasActividades.map((a) => (
              <li key={a.id} className="flex gap-2">
                <span className="shrink-0 text-[11px] font-semibold uppercase text-muted-warm">
                  {formatDateTime(a.fecha)} · {TIPO_ACTIVIDAD_LABELS[a.tipo]}
                </span>
                <span className="font-medium">{a.titulo}</span>
              </li>
            ))}
          </ul>
        )}
      </BriefSection>

      <footer className="mt-8 border-t border-line pt-3 text-center text-[10px] text-muted-warm">
        Voolkia S.A. — Programa de Partners Estratégicos · Documento interno y
        confidencial
      </footer>
    </div>
  );
}

function BriefItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-[11px] font-semibold uppercase text-muted-warm">
        {label}:{" "}
      </span>
      <span>{value}</span>
    </div>
  );
}

function BriefSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 border-b border-[#2A0E04]/20 pb-1 text-sm font-bold uppercase tracking-wide text-[#2A0E04]">
        {title}
      </h2>
      {children}
    </section>
  );
}
