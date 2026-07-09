"use client";

import { useMemo, useState } from "react";
import {
  differenceInCalendarDays,
  eachMonthOfInterval,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  getQuarter,
  getYear,
  parseISO,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subQuarters,
  subYears,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  Download,
  TrendingDown,
  TrendingUp,
  Minus,
  History,
} from "lucide-react";
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
import { useOportunidades } from "@/hooks/use-oportunidades";
import { usePartners } from "@/hooks/use-partners";
import { useSnapshots } from "@/hooks/use-snapshots";
import type { OportunidadWithRels, PartnerWithStats } from "@/lib/types";
import {
  COMPONENTE_LABELS,
  ETAPA_LABELS,
  partnerDisplayName,
} from "@/lib/utils/labels";
import { countryFlag, countryName } from "@/lib/utils/countries";
import { formatMoney } from "@/lib/utils/format";
import { exportXlsx } from "@/lib/utils/excel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { cn } from "@/lib/utils";

const MARK = "#E55A0E";
const GRID = "#E8E0D2";
const MUTED = "#6E6258";

type Mode = "anio" | "trimestre" | "custom";

type Metrics = {
  facturacion: number;
  comisiones: number;
  ganados: number;
  perdidos: number;
  winRate: number | null;
  ticketPromedio: number | null;
  nuevasOpps: number;
  partnersFirmados: number;
  cicloDias: number | null;
  ganadas: OportunidadWithRels[];
  perdidas: OportunidadWithRels[];
};

function fechaCierre(o: OportunidadWithRels): Date | null {
  const f = o.fecha_real_cierre ?? o.updated_at;
  return f ? parseISO(f) : null;
}

function computeMetrics(
  opps: OportunidadWithRels[],
  partners: PartnerWithStats[],
  desde: Date,
  hasta: Date
): Metrics {
  const enRango = (d: Date | null) => d != null && d >= desde && d <= hasta;

  const ganadas = opps.filter(
    (o) => o.etapa === "ganada" && enRango(fechaCierre(o))
  );
  const perdidas = opps.filter(
    (o) =>
      o.etapa === "perdida" &&
      enRango(o.updated_at ? parseISO(o.updated_at) : null)
  );
  const facturacion = ganadas.reduce(
    (acc, o) => acc + Number(o.monto_estimado_usd),
    0
  );
  const comisiones = ganadas.reduce(
    (acc, o) => acc + Number(o.comision_estimada_usd ?? 0),
    0
  );
  const cerradas = ganadas.length + perdidas.length;

  const ciclos = ganadas
    .filter((o) => o.created_at && o.fecha_real_cierre)
    .map((o) =>
      differenceInCalendarDays(
        parseISO(o.fecha_real_cierre!),
        parseISO(o.created_at!)
      )
    )
    .filter((d) => d >= 0);

  return {
    facturacion,
    comisiones,
    ganados: ganadas.length,
    perdidos: perdidas.length,
    winRate:
      cerradas > 0 ? Math.round((ganadas.length / cerradas) * 100) : null,
    ticketPromedio: ganadas.length > 0 ? facturacion / ganadas.length : null,
    nuevasOpps: opps.filter(
      (o) => o.created_at && enRango(parseISO(o.created_at))
    ).length,
    partnersFirmados: partners.filter(
      (p) => p.signed_at && enRango(parseISO(p.signed_at))
    ).length,
    cicloDias:
      ciclos.length > 0
        ? Math.round(ciclos.reduce((a, b) => a + b, 0) / ciclos.length)
        : null,
    ganadas,
    perdidas,
  };
}

function Delta({ actual, anterior, invert = false }: { actual: number; anterior: number; invert?: boolean }) {
  if (anterior === 0 && actual === 0)
    return <span className="text-xs text-muted-warm">— sin datos previos</span>;
  const diff = actual - anterior;
  const pct = anterior !== 0 ? Math.round((diff / anterior) * 100) : null;
  const positive = invert ? diff < 0 : diff > 0;
  const Icon = diff === 0 ? Minus : diff > 0 ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold",
        diff === 0
          ? "text-muted-warm"
          : positive
            ? "text-emerald-600"
            : "text-red-600"
      )}
    >
      <Icon className="size-3.5" />
      {pct != null ? `${pct > 0 ? "+" : ""}${pct}%` : diff > 0 ? "nuevo" : "—"}
      <span className="font-normal text-muted-warm">vs período anterior</span>
    </span>
  );
}

export function ReportesView() {
  const now = new Date();
  const [mode, setMode] = useState<Mode>("trimestre");
  const [anio, setAnio] = useState(getYear(now));
  const [trimestre, setTrimestre] = useState(getQuarter(now));
  const [desdeCustom, setDesdeCustom] = useState("");
  const [hastaCustom, setHastaCustom] = useState("");

  const { data: oportunidades, isLoading: loadingOpps } = useOportunidades();
  const { data: partners = [], isLoading: loadingPartners } = usePartners();
  const { data: snapshots = [] } = useSnapshots();

  const rango = useMemo(() => {
    if (mode === "anio") {
      const base = new Date(anio, 6, 1);
      return {
        label: String(anio),
        desde: startOfYear(base),
        hasta: endOfYear(base),
        prevLabel: String(anio - 1),
        prevDesde: startOfYear(subYears(base, 1)),
        prevHasta: endOfYear(subYears(base, 1)),
      };
    }
    if (mode === "trimestre") {
      const base = new Date(anio, (trimestre - 1) * 3 + 1, 1);
      const prev = subQuarters(base, 1);
      return {
        label: `Q${trimestre} ${anio}`,
        desde: startOfQuarter(base),
        hasta: endOfQuarter(base),
        prevLabel: `Q${getQuarter(prev)} ${getYear(prev)}`,
        prevDesde: startOfQuarter(prev),
        prevHasta: endOfQuarter(prev),
      };
    }
    // custom
    const d = desdeCustom ? parseISO(desdeCustom) : startOfYear(now);
    const h = hastaCustom ? parseISO(hastaCustom) : now;
    const dias = Math.max(1, differenceInCalendarDays(h, d) + 1);
    const prevH = new Date(d.getTime() - 86_400_000);
    const prevD = new Date(prevH.getTime() - (dias - 1) * 86_400_000);
    return {
      label: `${format(d, "dd/MM/yyyy")} – ${format(h, "dd/MM/yyyy")}`,
      desde: d,
      hasta: h,
      prevLabel: `${format(prevD, "dd/MM/yyyy")} – ${format(prevH, "dd/MM/yyyy")}`,
      prevDesde: prevD,
      prevHasta: prevH,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, anio, trimestre, desdeCustom, hastaCustom]);

  const opps = useMemo(() => oportunidades ?? [], [oportunidades]);

  const actual = useMemo(
    () => computeMetrics(opps, partners, rango.desde, rango.hasta),
    [opps, partners, rango]
  );
  const anterior = useMemo(
    () => computeMetrics(opps, partners, rango.prevDesde, rango.prevHasta),
    [opps, partners, rango]
  );

  // Facturación ganada por mes dentro del período
  const porMes = useMemo(() => {
    const meses = eachMonthOfInterval({
      start: startOfMonth(rango.desde),
      end: startOfMonth(rango.hasta),
    }).slice(0, 24);
    return meses.map((m) => {
      const fin = endOfMonth(m);
      const monto = actual.ganadas
        .filter((o) => {
          const d = fechaCierre(o);
          return d != null && d >= m && d <= fin;
        })
        .reduce((acc, o) => acc + Number(o.monto_estimado_usd), 0);
      return {
        mes: format(m, "MMM yy", { locale: es }),
        monto: Math.round(monto),
      };
    });
  }, [actual.ganadas, rango]);

  // Desglose por partner
  const porPartner = useMemo(() => {
    const map = new Map<
      string,
      { nombre: string; ganados: number; perdidos: number; facturacion: number; comisiones: number }
    >();
    const touch = (o: OportunidadWithRels) => {
      const key = o.partner_id;
      if (!map.has(key)) {
        map.set(key, {
          nombre: o.partner ? partnerDisplayName(o.partner) : "—",
          ganados: 0,
          perdidos: 0,
          facturacion: 0,
          comisiones: 0,
        });
      }
      return map.get(key)!;
    };
    for (const o of actual.ganadas) {
      const e = touch(o);
      e.ganados++;
      e.facturacion += Number(o.monto_estimado_usd);
      e.comisiones += Number(o.comision_estimada_usd ?? 0);
    }
    for (const o of actual.perdidas) {
      touch(o).perdidos++;
    }
    return [...map.values()].sort((a, b) => b.facturacion - a.facturacion);
  }, [actual]);

  // Por país y por componente (sobre ganadas del período)
  const porPais = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of actual.ganadas) {
      const k = o.cliente_final_country ?? "—";
      map.set(k, (map.get(k) ?? 0) + Number(o.monto_estimado_usd));
    }
    return [...map.entries()]
      .map(([code, monto]) => ({ code, monto }))
      .sort((a, b) => b.monto - a.monto);
  }, [actual.ganadas]);

  const porComponente = useMemo(() => {
    const map = new Map<string, { count: number; monto: number }>();
    for (const o of actual.ganadas) {
      const e = map.get(o.componente) ?? { count: 0, monto: 0 };
      e.count++;
      e.monto += Number(o.monto_estimado_usd);
      map.set(o.componente, e);
    }
    return [...map.entries()]
      .map(([comp, v]) => ({ comp, ...v }))
      .sort((a, b) => b.monto - a.monto);
  }, [actual.ganadas]);

  function handleExport() {
    const num = (v: number) => Math.round(v * 100) / 100;
    exportXlsx(`reporte-${rango.label.replace(/[/\s–]+/g, "-")}`, [
      {
        name: "Resumen",
        rows: [
          { Métrica: "Período", Valor: rango.label, "Período anterior": rango.prevLabel },
          { Métrica: "Facturación ganada (USD)", Valor: num(actual.facturacion), "Período anterior": num(anterior.facturacion) },
          { Métrica: "Comisiones a partners (USD)", Valor: num(actual.comisiones), "Período anterior": num(anterior.comisiones) },
          { Métrica: "Deals ganados", Valor: actual.ganados, "Período anterior": anterior.ganados },
          { Métrica: "Deals perdidos", Valor: actual.perdidos, "Período anterior": anterior.perdidos },
          { Métrica: "Win rate (%)", Valor: actual.winRate ?? "s/d", "Período anterior": anterior.winRate ?? "s/d" },
          { Métrica: "Ticket promedio (USD)", Valor: actual.ticketPromedio != null ? num(actual.ticketPromedio) : "s/d", "Período anterior": anterior.ticketPromedio != null ? num(anterior.ticketPromedio) : "s/d" },
          { Métrica: "Ciclo de venta promedio (días)", Valor: actual.cicloDias ?? "s/d", "Período anterior": anterior.cicloDias ?? "s/d" },
          { Métrica: "Oportunidades nuevas", Valor: actual.nuevasOpps, "Período anterior": anterior.nuevasOpps },
          { Métrica: "Partners firmados", Valor: actual.partnersFirmados, "Período anterior": anterior.partnersFirmados },
        ],
      },
      {
        name: "Por partner",
        rows: porPartner.map((p) => ({
          Partner: p.nombre,
          Ganados: p.ganados,
          Perdidos: p.perdidos,
          "Facturación (USD)": num(p.facturacion),
          "Comisiones (USD)": num(p.comisiones),
        })),
      },
      {
        name: "Por país",
        rows: porPais.map((p) => ({
          País: countryName(p.code),
          "Facturación (USD)": num(p.monto),
        })),
      },
      {
        name: "Por componente",
        rows: porComponente.map((c) => ({
          Componente: COMPONENTE_LABELS[c.comp as keyof typeof COMPONENTE_LABELS] ?? c.comp,
          Deals: c.count,
          "Facturación (USD)": num(c.monto),
        })),
      },
      {
        name: "Deals del período",
        rows: [...actual.ganadas, ...actual.perdidas].map((o) => ({
          "Cliente final": o.cliente_final_name,
          Partner: o.partner ? partnerDisplayName(o.partner) : "",
          País: o.cliente_final_country ?? "",
          Componente: COMPONENTE_LABELS[o.componente],
          Etapa: o.etapa ? ETAPA_LABELS[o.etapa] : "",
          "Monto (USD)": num(Number(o.monto_estimado_usd)),
          "Comisión (USD)": num(Number(o.comision_estimada_usd ?? 0)),
          "Cierre real": o.fecha_real_cierre ?? "",
          "Motivo pérdida": o.motivo_perdida ?? "",
        })),
      },
      {
        name: "Snapshots mensuales",
        rows: snapshots.map((s) => ({
          Período: s.periodo,
          "Partners activos": s.partners_activos,
          "Pipeline ponderado (USD)": num(Number(s.pipeline_ponderado)),
          "Pipeline bruto (USD)": num(Number(s.pipeline_bruto)),
          "Opps abiertas": s.opps_abiertas,
          "Facturación del mes (USD)": num(Number(s.facturacion_ganada_mes)),
          "Deals ganados": s.deals_ganados_mes,
          "Deals perdidos": s.deals_perdidos_mes,
        })),
      },
    ]);
  }

  if (loadingOpps || loadingPartners) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Selector de período */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-4">
        <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trimestre">Trimestre</SelectItem>
            <SelectItem value="anio">Año</SelectItem>
            <SelectItem value="custom">Rango custom</SelectItem>
          </SelectContent>
        </Select>
        {mode !== "custom" && (
          <Select value={String(anio)} onValueChange={(v) => setAnio(Number(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 6 }, (_, i) => getYear(now) - 4 + i).map(
                (a) => (
                  <SelectItem key={a} value={String(a)}>
                    {a}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        )}
        {mode === "trimestre" && (
          <Select
            value={String(trimestre)}
            onValueChange={(v) => setTrimestre(Number(v))}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((q) => (
                <SelectItem key={q} value={String(q)}>
                  Q{q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {mode === "custom" && (
          <>
            <Input
              type="date"
              value={desdeCustom}
              onChange={(e) => setDesdeCustom(e.target.value)}
              className="w-[150px]"
            />
            <span className="text-muted-warm">–</span>
            <Input
              type="date"
              value={hastaCustom}
              onChange={(e) => setHastaCustom(e.target.value)}
              className="w-[150px]"
            />
          </>
        )}
        <span className="ml-2 text-sm text-muted-warm">
          Comparando <strong className="text-ink">{rango.label}</strong> vs{" "}
          {rango.prevLabel}
        </span>
        <div className="flex-1" />
        <Button onClick={handleExport} className="font-semibold">
          <Download className="size-4" />
          Exportar Excel
        </Button>
      </div>

      {/* KPIs con comparación */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportKpi
          label="Facturación ganada"
          value={formatMoney(actual.facturacion)}
          delta={<Delta actual={actual.facturacion} anterior={anterior.facturacion} />}
        />
        <ReportKpi
          label="Comisiones a partners"
          value={formatMoney(actual.comisiones)}
          delta={<Delta actual={actual.comisiones} anterior={anterior.comisiones} />}
        />
        <ReportKpi
          label="Deals ganados"
          value={`${actual.ganados}`}
          detail={`${actual.perdidos} perdidos · win rate ${actual.winRate ?? "—"}%`}
          delta={<Delta actual={actual.ganados} anterior={anterior.ganados} />}
        />
        <ReportKpi
          label="Ticket promedio"
          value={
            actual.ticketPromedio != null
              ? formatMoney(actual.ticketPromedio)
              : "—"
          }
          detail={
            actual.cicloDias != null
              ? `Ciclo de venta: ${actual.cicloDias} días`
              : undefined
          }
          delta={
            <Delta
              actual={actual.ticketPromedio ?? 0}
              anterior={anterior.ticketPromedio ?? 0}
            />
          }
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-ink">
            Facturación ganada por mes — {rango.label}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={porMes} barSize={26}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: MUTED }} axisLine={{ stroke: GRID }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: MUTED }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                width={42}
              />
              <Tooltip
                cursor={{ fill: "#FFF6EE" }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-md">
                      <p className="font-semibold text-ink">{label}</p>
                      <p className="tabular-nums text-muted-warm">
                        {formatMoney(Number(payload[0].value))}
                      </p>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="monto" fill={MARK} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-line bg-white p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-ink">
            <History className="size-4 text-orange-deep" />
            Evolución del pipeline (foto a fin de mes)
          </h3>
          {snapshots.length < 2 ? (
            <p className="py-14 text-center text-sm text-muted-warm">
              {snapshots.length === 0
                ? "Todavía no hay snapshots. El primero se toma al correr la migración 005."
                : "Hay 1 snapshot. Este gráfico toma forma mes a mes: el día 1 de cada mes se guarda la foto automáticamente."}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart
                data={snapshots.map((s) => ({
                  mes: format(parseISO(s.periodo), "MMM yy", { locale: es }),
                  pipeline: Math.round(Number(s.pipeline_ponderado)),
                }))}
              >
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: MUTED }} axisLine={{ stroke: GRID }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: MUTED }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                  width={42}
                />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-md">
                        <p className="font-semibold text-ink">{label}</p>
                        <p className="tabular-nums text-muted-warm">
                          {formatMoney(Number(payload[0].value))}
                        </p>
                      </div>
                    ) : null
                  }
                />
                <Line type="monotone" dataKey="pipeline" stroke={MARK} strokeWidth={2} dot={{ r: 4, fill: MARK, strokeWidth: 2, stroke: "#fff" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Desglose por partner */}
      <div className="rounded-xl border border-line bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-ink">
          Desglose por partner — {rango.label}
        </h3>
        {porPartner.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-warm">
            Sin deals cerrados en este período.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Partner</TableHead>
                <TableHead className="text-right">Ganados</TableHead>
                <TableHead className="text-right">Perdidos</TableHead>
                <TableHead className="text-right">Facturación</TableHead>
                <TableHead className="text-right">Comisiones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {porPartner.map((p) => (
                <TableRow key={p.nombre}>
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.ganados}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.perdidos}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatMoney(p.facturacion)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-orange-deep">
                    {formatMoney(p.comisiones)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Por país y componente */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-ink">
            Facturación por país
          </h3>
          {porPais.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-warm">Sin datos.</p>
          ) : (
            <ul className="space-y-2">
              {porPais.map((p) => (
                <li key={p.code} className="flex items-center gap-3 text-sm">
                  <span className="w-40 shrink-0 truncate">
                    {countryFlag(p.code)} {countryName(p.code)}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream">
                    <div
                      className="h-full rounded-full bg-[#E55A0E]"
                      style={{
                        width: `${(p.monto / (porPais[0]?.monto || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-24 shrink-0 text-right font-semibold tabular-nums">
                    {formatMoney(p.monto)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-line bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-ink">
            Facturación por componente
          </h3>
          {porComponente.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-warm">Sin datos.</p>
          ) : (
            <ul className="space-y-2">
              {porComponente.map((c) => (
                <li key={c.comp} className="flex items-center gap-3 text-sm">
                  <span className="w-40 shrink-0 truncate">
                    {COMPONENTE_LABELS[c.comp as keyof typeof COMPONENTE_LABELS] ?? c.comp}{" "}
                    <span className="text-muted-warm">({c.count})</span>
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream">
                    <div
                      className="h-full rounded-full bg-[#E55A0E]"
                      style={{
                        width: `${(c.monto / (porComponente[0]?.monto || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-24 shrink-0 text-right font-semibold tabular-nums">
                    {formatMoney(c.monto)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportKpi({
  label,
  value,
  detail,
  delta,
}: {
  label: string;
  value: string;
  detail?: string;
  delta: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-warm">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold tabular-nums text-ink">
        {value}
      </p>
      {detail && <p className="mt-0.5 text-xs text-muted-warm">{detail}</p>}
      <div className="mt-1.5">{delta}</div>
    </div>
  );
}
