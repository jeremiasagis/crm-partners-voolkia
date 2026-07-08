"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  MoreHorizontal,
  Pencil,
  Search,
  Target,
  Trash2,
} from "lucide-react";
import { isBefore, parseISO, startOfToday } from "date-fns";
import {
  useOportunidades,
  useDeleteOportunidad,
} from "@/hooks/use-oportunidades";
import { usePartners } from "@/hooks/use-partners";
import { useProfiles } from "@/hooks/use-profiles";
import type { OportunidadWithRels } from "@/lib/types";
import {
  COMPONENTE_COLORS,
  COMPONENTE_LABELS,
  ETAPA_COLORS,
  ETAPA_LABELS,
  partnerDisplayName,
} from "@/lib/utils/labels";
import { COUNTRIES, countryFlag } from "@/lib/utils/countries";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { exportCsv } from "@/lib/utils/csv";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FilterSelect } from "@/components/shared/filter-select";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { cn } from "@/lib/utils";

export function OppTable() {
  const router = useRouter();
  const { data: oportunidades, isLoading } = useOportunidades();
  const { data: partners = [] } = usePartners();
  const { data: profiles = [] } = useProfiles();
  const deleteOpp = useDeleteOportunidad();

  const [search, setSearch] = useState("");
  const [fEtapa, setFEtapa] = useState("");
  const [fComponente, setFComponente] = useState("");
  const [fPartner, setFPartner] = useState("");
  const [fCountry, setFCountry] = useState("");
  const [fOwner, setFOwner] = useState("");
  const [fDesde, setFDesde] = useState("");
  const [fHasta, setFHasta] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [toDelete, setToDelete] = useState<OportunidadWithRels | null>(null);

  const filtered = useMemo(() => {
    let rows = oportunidades ?? [];
    const q = search.trim().toLowerCase();
    if (q)
      rows = rows.filter((o) =>
        o.cliente_final_name.toLowerCase().includes(q)
      );
    if (fEtapa) rows = rows.filter((o) => o.etapa === fEtapa);
    if (fComponente) rows = rows.filter((o) => o.componente === fComponente);
    if (fPartner) rows = rows.filter((o) => o.partner_id === fPartner);
    if (fCountry)
      rows = rows.filter((o) => o.cliente_final_country === fCountry);
    if (fOwner) rows = rows.filter((o) => o.owner_id === fOwner);
    if (fDesde)
      rows = rows.filter(
        (o) => o.fecha_estimada_cierre && o.fecha_estimada_cierre >= fDesde
      );
    if (fHasta)
      rows = rows.filter(
        (o) => o.fecha_estimada_cierre && o.fecha_estimada_cierre <= fHasta
      );
    return rows;
  }, [oportunidades, search, fEtapa, fComponente, fPartner, fCountry, fOwner, fDesde, fHasta]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const today = startOfToday();

  function handleExport() {
    exportCsv(
      "oportunidades",
      [
        "Cliente final",
        "Partner",
        "País",
        "Componente",
        "Monto USD",
        "Comisión USD",
        "Probabilidad %",
        "Etapa",
        "Cierre estimado",
        "Próxima acción",
        "Fecha próx. acción",
        "Owner",
      ],
      filtered.map((o) => [
        o.cliente_final_name,
        o.partner ? partnerDisplayName(o.partner) : "",
        o.cliente_final_country ?? "",
        COMPONENTE_LABELS[o.componente],
        Number(o.monto_estimado_usd),
        Number(o.comision_estimada_usd ?? 0),
        o.probabilidad ?? "",
        o.etapa ? ETAPA_LABELS[o.etapa] : "",
        o.fecha_estimada_cierre ?? "",
        o.proxima_accion ?? "",
        o.proxima_accion_fecha ?? "",
        o.owner?.full_name ?? "",
      ])
    );
  }

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-warm" />
          <Input
            placeholder="Buscar cliente final…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="h-9 w-52 bg-white pl-9"
          />
        </div>
        <FilterSelect
          value={fEtapa}
          onChange={(v) => { setFEtapa(v); setPage(0); }}
          placeholder="Etapa"
          options={Object.entries(ETAPA_LABELS).map(([value, label]) => ({ value, label }))}
          className="h-9 w-[140px] bg-white"
        />
        <FilterSelect
          value={fComponente}
          onChange={(v) => { setFComponente(v); setPage(0); }}
          placeholder="Componente"
          options={Object.entries(COMPONENTE_LABELS).map(([value, label]) => ({ value, label }))}
          className="h-9 w-[160px] bg-white"
        />
        <FilterSelect
          value={fPartner}
          onChange={(v) => { setFPartner(v); setPage(0); }}
          placeholder="Partner"
          options={partners.map((p) => ({ value: p.id, label: partnerDisplayName(p) }))}
          className="h-9 w-[170px] bg-white"
        />
        <FilterSelect
          value={fCountry}
          onChange={(v) => { setFCountry(v); setPage(0); }}
          placeholder="País"
          options={COUNTRIES.map((c) => ({ value: c.code, label: `${c.flag} ${c.name}` }))}
          className="h-9 w-[130px] bg-white"
        />
        <FilterSelect
          value={fOwner}
          onChange={(v) => { setFOwner(v); setPage(0); }}
          placeholder="Owner"
          options={profiles.map((p) => ({ value: p.id, label: p.full_name ?? p.email ?? "—" }))}
          className="h-9 w-[130px] bg-white"
        />
        <div className="flex items-center gap-1.5 text-sm text-muted-warm">
          <Input
            type="date"
            value={fDesde}
            onChange={(e) => { setFDesde(e.target.value); setPage(0); }}
            className="h-9 w-[140px] bg-white"
            title="Cierre estimado desde"
          />
          –
          <Input
            type="date"
            value={fHasta}
            onChange={(e) => { setFHasta(e.target.value); setPage(0); }}
            className="h-9 w-[140px] bg-white"
            title="Cierre estimado hasta"
          />
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Sin oportunidades"
          description={
            oportunidades?.length
              ? "Ninguna oportunidad coincide con los filtros."
              : "Todavía no cargaste oportunidades."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Cliente final</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Comp.</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Comisión</TableHead>
                <TableHead className="text-right">Prob.</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Cierre est.</TableHead>
                <TableHead>Próxima acción</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((o) => {
                const overdue =
                  o.proxima_accion_fecha &&
                  isBefore(parseISO(o.proxima_accion_fecha), today);
                return (
                  <TableRow
                    key={o.id}
                    className={cn(
                      "cursor-pointer",
                      overdue && "bg-red-50/70 hover:bg-red-50"
                    )}
                    onClick={() => router.push(`/oportunidades/${o.id}/edit`)}
                  >
                    <TableCell className="font-semibold text-ink">
                      {o.cliente_final_name}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {o.partner ? (
                        <Link
                          href={`/partners/${o.partner.id}`}
                          className="text-orange-deep hover:underline"
                        >
                          {partnerDisplayName(o.partner)}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {o.cliente_final_country
                        ? `${countryFlag(o.cliente_final_country)} ${o.cliente_final_country}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={COMPONENTE_COLORS[o.componente]}
                      >
                        {o.componente}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatMoney(Number(o.monto_estimado_usd))}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(Number(o.comision_estimada_usd ?? 0))}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {o.probabilidad ?? 0}%
                    </TableCell>
                    <TableCell>
                      {o.etapa && (
                        <Badge
                          variant="outline"
                          className={ETAPA_COLORS[o.etapa]}
                        >
                          {ETAPA_LABELS[o.etapa]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(o.fecha_estimada_cierre)}
                    </TableCell>
                    <TableCell className="max-w-44">
                      <div className="truncate text-sm">
                        {o.proxima_accion ?? "—"}
                      </div>
                      {o.proxima_accion_fecha && (
                        <div
                          className={cn(
                            "text-xs",
                            overdue
                              ? "font-semibold text-red-600"
                              : "text-muted-warm"
                          )}
                        >
                          {formatDate(o.proxima_accion_fecha)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {o.owner?.full_name ?? "—"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/oportunidades/${o.id}/edit`}>
                              <Pencil className="size-4" /> Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setToDelete(o)}
                          >
                            <Trash2 className="size-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {filtered.length > 0 && (
        <TablePagination
          total={filtered.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`¿Eliminar la oportunidad de ${toDelete?.cliente_final_name}?`}
        description="Esta acción no se puede deshacer."
        onConfirm={() => {
          if (toDelete) deleteOpp.mutate(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
