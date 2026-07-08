"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CalendarClock } from "lucide-react";
import { useActividades, useMisPendientes } from "@/hooks/use-actividades";
import { usePartners } from "@/hooks/use-partners";
import { useProfiles } from "@/hooks/use-profiles";
import { TIPO_ACTIVIDAD_LABELS, partnerDisplayName } from "@/lib/utils/labels";
import { formatDate } from "@/lib/utils/format";
import { FilterSelect } from "@/components/shared/filter-select";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { ActividadTimeline } from "./actividad-timeline";

export function ActividadList() {
  const { data: actividades, isLoading } = useActividades({ sinceDays: 90 });
  const { data: pendientes = [] } = useMisPendientes();
  const { data: partners = [] } = usePartners();
  const { data: profiles = [] } = useProfiles();

  const [fTipo, setFTipo] = useState("");
  const [fPartner, setFPartner] = useState("");
  const [fOwner, setFOwner] = useState("");
  const [fDesde, setFDesde] = useState("");
  const [fHasta, setFHasta] = useState("");

  const filtered = useMemo(() => {
    let rows = actividades ?? [];
    if (fTipo) rows = rows.filter((a) => a.tipo === fTipo);
    if (fPartner) rows = rows.filter((a) => a.partner_id === fPartner);
    if (fOwner) rows = rows.filter((a) => a.owner_id === fOwner);
    if (fDesde) rows = rows.filter((a) => a.fecha >= fDesde);
    if (fHasta) rows = rows.filter((a) => a.fecha.slice(0, 10) <= fHasta);
    return rows;
  }, [actividades, fTipo, fPartner, fOwner, fDesde, fHasta]);

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Mis pendientes */}
      {pendientes.length > 0 && (
        <div className="rounded-xl border border-orange-vk/30 bg-orange-soft/40 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-orange-deep">
            <AlertCircle className="size-4" />
            Mis pendientes ({pendientes.length})
          </h3>
          <ul className="space-y-2">
            {pendientes.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm"
              >
                <CalendarClock className="size-4 shrink-0 text-orange-deep" />
                <span className="font-medium">{a.proxima_accion}</span>
                {a.partner && (
                  <Link
                    href={`/partners/${a.partner.id}`}
                    className="text-orange-deep hover:underline"
                  >
                    {partnerDisplayName(a.partner)}
                  </Link>
                )}
                <span className="ml-auto font-semibold text-red-600">
                  {formatDate(a.proxima_accion_fecha)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          value={fTipo}
          onChange={setFTipo}
          placeholder="Tipo"
          options={Object.entries(TIPO_ACTIVIDAD_LABELS).map(([value, label]) => ({ value, label }))}
          className="h-9 w-[140px] bg-white"
        />
        <FilterSelect
          value={fPartner}
          onChange={setFPartner}
          placeholder="Partner"
          options={partners.map((p) => ({ value: p.id, label: partnerDisplayName(p) }))}
          className="h-9 w-[180px] bg-white"
        />
        <FilterSelect
          value={fOwner}
          onChange={setFOwner}
          placeholder="Owner"
          options={profiles.map((p) => ({ value: p.id, label: p.full_name ?? p.email ?? "—" }))}
          className="h-9 w-[140px] bg-white"
        />
        <input
          type="date"
          value={fDesde}
          onChange={(e) => setFDesde(e.target.value)}
          className="h-9 rounded-md border border-line bg-white px-2 text-sm"
          title="Desde"
        />
        <span className="text-muted-warm">–</span>
        <input
          type="date"
          value={fHasta}
          onChange={(e) => setFHasta(e.target.value)}
          className="h-9 rounded-md border border-line bg-white px-2 text-sm"
          title="Hasta"
        />
        <span className="ml-auto text-xs text-muted-warm">
          Últimos 90 días · {filtered.length} actividades
        </span>
      </div>

      <ActividadTimeline items={filtered} />
    </div>
  );
}
