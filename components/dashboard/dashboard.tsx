"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarClock,
  DollarSign,
  Trophy,
} from "lucide-react";
import {
  differenceInCalendarDays,
  format,
  parseISO,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePartners } from "@/hooks/use-partners";
import { useOportunidades } from "@/hooks/use-oportunidades";
import { usePendientesHoy, useProximasActividades } from "@/hooks/use-dashboard";
import type { PartnerWithStats } from "@/lib/types";
import {
  ETAPAS_PIPELINE,
  ETAPA_LABELS,
  TIPO_ACTIVIDAD_LABELS,
  partnerDisplayName,
} from "@/lib/utils/labels";
import { countryFlag, countryName } from "@/lib/utils/countries";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// #E55A0E: única tonalidad de marca con contraste ≥3:1 sobre blanco
const MARK = "#E55A0E";
const GRID = "#E8E0D2";
const MUTED = "#6E6258";

function ChartTooltip({
  active,
  payload,
  label,
  money = true,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  money?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-ink">{label}</p>
      <p className="tabular-nums text-muted-warm">
        {money ? formatMoney(payload[0].value) : payload[0].value}
      </p>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  detail,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail?: React.ReactNode;
  delay: number;
}) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-line bg-white p-5 duration-500 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-orange-soft p-2">
          <Icon className="size-4 text-orange-deep" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-warm">
          {label}
        </span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tabular-nums text-ink">
        {value}
      </p>
      {detail && <div className="mt-1 text-xs text-muted-warm">{detail}</div>}
    </div>
  );
}

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-white p-5",
        className
      )}
    >
      <h3 className="mb-4 text-sm font-bold text-ink">{title}</h3>
      {children}
    </div>
  );
}

export function Dashboard() {
  const { data: partners, isLoading: loadingPartners } = usePartners();
  const { data: oportunidades, isLoading: loadingOpps } = useOportunidades();
  const { data: pendientesHoy = [] } = usePendientesHoy();
  const { data: proximas = [] } = useProximasActividades(7);

  const stats = useMemo(() => {
    const ps = partners ?? [];
    const opps = oportunidades ?? [];
    const now = new Date();
    const hace30 = subDays(now, 30);

    const activos = ps.filter((p) => p.status === "activo");
    const activosHace30 = activos.filter(
      (p) => p.created_at && parseISO(p.created_at) <= hace30
    );
    const deltaActivos = activos.length - activosHace30.length;

    const abiertas = opps.filter(
      (o) => o.etapa && ETAPAS_PIPELINE.includes(o.etapa)
    );
    const pipeline = abiertas.reduce(
      (acc, o) =>
        acc + Number(o.monto_estimado_usd) * ((o.probabilidad ?? 0) / 100),
      0
    );

    const ganadasMes = opps.filter((o) => {
      if (o.etapa !== "ganada") return false;
      const fecha = o.fecha_real_cierre ?? o.updated_at;
      return fecha ? parseISO(fecha) >= hace30 : false;
    });
    const ganadasMonto = ganadasMes.reduce(
      (acc, o) => acc + Number(o.monto_estimado_usd),
      0
    );

    // Partners activos por país
    const porPais = new Map<string, number>();
    for (const p of activos)
      porPais.set(p.country_code, (porPais.get(p.country_code) ?? 0) + 1);
    const dataPais = [...porPais.entries()]
      .map(([code, count]) => ({
        pais: `${countryFlag(code)} ${code}`,
        cantidad: count,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Pipeline por etapa (ponderado)
    const dataEtapa = ETAPAS_PIPELINE.map((etapa) => ({
      etapa: ETAPA_LABELS[etapa],
      valor: Math.round(
        opps
          .filter((o) => o.etapa === etapa)
          .reduce(
            (acc, o) =>
              acc +
              Number(o.monto_estimado_usd) * ((o.probabilidad ?? 0) / 100),
            0
          )
      ),
    }));

    // Ganadas últimos 6 meses (monto por mes)
    const meses: { mes: string; monto: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const inicio = startOfMonth(subMonths(now, i));
      const fin = startOfMonth(subMonths(now, i - 1));
      const monto = opps
        .filter((o) => {
          if (o.etapa !== "ganada") return false;
          const f = o.fecha_real_cierre ?? o.updated_at;
          if (!f) return false;
          const d = parseISO(f);
          return d >= inicio && d < fin;
        })
        .reduce((acc, o) => acc + Number(o.monto_estimado_usd), 0);
      meses.push({
        mes: format(inicio, "MMM", { locale: es }),
        monto: Math.round(monto),
      });
    }

    // Top 5 partners por pipeline
    const topPartners = [...ps]
      .map((p) => ({
        partner: p,
        pipeline: p.oportunidades
          .filter((o) => o.etapa && ETAPAS_PIPELINE.includes(o.etapa))
          .reduce(
            (acc, o) =>
              acc +
              Number(o.monto_estimado_usd) * ((o.probabilidad ?? 0) / 100),
            0
          ),
        etapas: [
          ...new Set(
            p.oportunidades
              .filter((o) => o.etapa && ETAPAS_PIPELINE.includes(o.etapa))
              .map((o) => ETAPA_LABELS[o.etapa!])
          ),
        ],
      }))
      .filter((t) => t.pipeline > 0)
      .sort((a, b) => b.pipeline - a.pipeline)
      .slice(0, 5);

    // Comisiones esperadas 30/60/90
    const comisiones = [30, 60, 90].map((dias) => ({
      dias,
      monto: abiertas
        .filter((o) => {
          if (!o.fecha_estimada_cierre) return false;
          const diff = differenceInCalendarDays(
            parseISO(o.fecha_estimada_cierre),
            now
          );
          return diff >= 0 && diff <= dias;
        })
        .reduce(
          (acc, o) =>
            acc +
            Number(o.comision_estimada_usd ?? 0) *
              ((o.probabilidad ?? 0) / 100),
          0
        ),
    }));

    return {
      activos: activos.length,
      deltaActivos,
      pipeline,
      ganadasMes: ganadasMes.length,
      ganadasMonto,
      dataPais,
      dataEtapa,
      meses,
      topPartners,
      comisiones,
    };
  }, [partners, oportunidades]);

  if (loadingPartners || loadingOpps) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Row 1 — KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Building2}
          label="Partners activos"
          value={String(stats.activos)}
          detail={
            <span
              className={cn(
                "font-semibold",
                stats.deltaActivos > 0
                  ? "text-emerald-600"
                  : stats.deltaActivos < 0
                    ? "text-red-600"
                    : ""
              )}
            >
              {stats.deltaActivos > 0 ? "+" : ""}
              {stats.deltaActivos} vs mes pasado
            </span>
          }
          delay={0}
        />
        <KpiCard
          icon={DollarSign}
          label="Pipeline (ponderado)"
          value={formatMoney(stats.pipeline)}
          detail="Oportunidades abiertas × probabilidad"
          delay={80}
        />
        <KpiCard
          icon={Trophy}
          label="Ganadas último mes"
          value={String(stats.ganadasMes)}
          detail={<>por {formatMoney(stats.ganadasMonto)}</>}
          delay={160}
        />
        <KpiCard
          icon={CalendarClock}
          label="Pendientes hoy"
          value={String(pendientesHoy.length)}
          detail="Acciones con fecha de hoy"
          delay={240}
        />
      </div>

      {/* Row 2 — Gráficos */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Partners activos por país">
          {stats.dataPais.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-warm">
              Sin partners activos todavía.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.dataPais} barSize={28}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="pais"
                  tick={{ fontSize: 12, fill: MUTED }}
                  axisLine={{ stroke: GRID }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: MUTED }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  content={<ChartTooltip money={false} />}
                  cursor={{ fill: "#FFF6EE" }}
                />
                <Bar dataKey="cantidad" fill={MARK} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Pipeline ponderado por etapa">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.dataEtapa} barSize={28}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="etapa"
                tick={{ fontSize: 12, fill: MUTED }}
                axisLine={{ stroke: GRID }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: MUTED }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                }
                width={40}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#FFF6EE" }} />
              <Bar dataKey="valor" fill={MARK} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Monto ganado — últimos 6 meses">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.meses}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 12, fill: MUTED }}
                axisLine={{ stroke: GRID }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: MUTED }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                }
                width={40}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="monto"
                stroke={MARK}
                strokeWidth={2}
                dot={{ r: 4, fill: MARK, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Row 3 — Listas */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Próximas actividades (7 días)">
          {proximas.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-warm">
              Nada agendado para los próximos 7 días.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Tipo</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead className="text-right">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proximas.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm text-muted-warm">
                      {TIPO_ACTIVIDAD_LABELS[a.tipo]}
                    </TableCell>
                    <TableCell className="max-w-52 truncate text-sm font-medium">
                      {a.proxima_accion ?? a.titulo}
                    </TableCell>
                    <TableCell>
                      {a.partner ? (
                        <Link
                          href={`/partners/${a.partner.id}`}
                          className="text-sm text-orange-deep hover:underline"
                        >
                          {partnerDisplayName(a.partner)}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {formatDate(a.proxima_accion_fecha)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>

        <Panel title="Top 5 partners por pipeline">
          {stats.topPartners.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-warm">
              Sin pipeline abierto todavía.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {stats.topPartners.map(({ partner, pipeline, etapas }, i) => (
                <TopPartnerRow
                  key={partner.id}
                  rank={i + 1}
                  partner={partner}
                  pipeline={pipeline}
                  etapas={etapas}
                />
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Row 4 — Comisiones esperadas */}
      <Panel title="Comisiones esperadas (ponderadas por probabilidad)">
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.comisiones.map(({ dias, monto }) => (
            <div
              key={dias}
              className="rounded-lg border border-line bg-cream/60 p-4 text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-warm">
                Próximos {dias} días
              </p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums text-orange-deep">
                {formatMoney(monto)}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function TopPartnerRow({
  rank,
  partner,
  pipeline,
  etapas,
}: {
  rank: number;
  partner: PartnerWithStats;
  pipeline: number;
  etapas: string[];
}) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-orange-soft text-xs font-bold text-orange-deep">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <Link
          href={`/partners/${partner.id}`}
          className="block truncate text-sm font-semibold text-ink hover:text-orange-deep"
        >
          {countryFlag(partner.country_code)} {partnerDisplayName(partner)}
        </Link>
        <p className="truncate text-xs text-muted-warm">
          {etapas.join(" · ") || countryName(partner.country_code)}
        </p>
      </div>
      <span className="shrink-0 text-sm font-bold tabular-nums text-ink">
        {formatMoney(pipeline)}
      </span>
    </li>
  );
}
