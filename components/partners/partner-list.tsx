"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  Building2,
  Download,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { usePartners, useDeletePartner } from "@/hooks/use-partners";
import { useProfiles } from "@/hooks/use-profiles";
import type { PartnerWithStats } from "@/lib/types";
import {
  ETAPAS_PIPELINE,
  FUNNEL_STAGE_LABELS,
  PARTNER_STATUS_COLORS,
  PARTNER_STATUS_LABELS,
  PARTNER_TYPE_LABELS,
  SOURCE_LABELS,
  TIER_COLORS,
  partnerDisplayName,
} from "@/lib/utils/labels";
import { COUNTRIES, countryFlag, countryName } from "@/lib/utils/countries";
import { formatMoney } from "@/lib/utils/format";
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

function pipelineValue(p: PartnerWithStats) {
  return p.oportunidades
    .filter((o) => o.etapa && ETAPAS_PIPELINE.includes(o.etapa))
    .reduce(
      (acc, o) => acc + Number(o.monto_estimado_usd) * ((o.probabilidad ?? 0) / 100),
      0
    );
}

function activeOpps(p: PartnerWithStats) {
  return p.oportunidades.filter(
    (o) => o.etapa && ETAPAS_PIPELINE.includes(o.etapa)
  ).length;
}

type SortKey = "nombre" | "pais" | "tier" | "status" | "pipeline" | "opps";

export function PartnerList() {
  const router = useRouter();
  const { data: partners, isLoading } = usePartners();
  const { data: profiles = [] } = useProfiles();
  const deletePartner = useDeletePartner();

  const [search, setSearch] = useState("");
  const [fCountry, setFCountry] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fFunnel, setFFunnel] = useState("");
  const [fTier, setFTier] = useState("");
  const [fSource, setFSource] = useState("");
  const [fOwner, setFOwner] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({
    key: "nombre",
    dir: 1,
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [toDelete, setToDelete] = useState<PartnerWithStats | null>(null);

  const filtered = useMemo(() => {
    let rows = partners ?? [];
    const q = search.trim().toLowerCase();
    if (q)
      rows = rows.filter(
        (p) =>
          p.legal_name.toLowerCase().includes(q) ||
          (p.commercial_name ?? "").toLowerCase().includes(q)
      );
    if (fCountry) rows = rows.filter((p) => p.country_code === fCountry);
    if (fStatus) rows = rows.filter((p) => p.status === fStatus);
    if (fFunnel) rows = rows.filter((p) => p.funnel_stage === fFunnel);
    if (fTier) rows = rows.filter((p) => p.tier === fTier);
    if (fSource) rows = rows.filter((p) => p.source === fSource);
    if (fOwner) rows = rows.filter((p) => p.owner_id === fOwner);

    const dir = sort.dir;
    rows = [...rows].sort((a, b) => {
      switch (sort.key) {
        case "nombre":
          return dir * partnerDisplayName(a).localeCompare(partnerDisplayName(b));
        case "pais":
          return dir * a.country_code.localeCompare(b.country_code);
        case "tier":
          return dir * (a.tier ?? "Z").localeCompare(b.tier ?? "Z");
        case "status":
          return dir * (a.status ?? "").localeCompare(b.status ?? "");
        case "pipeline":
          return dir * (pipelineValue(a) - pipelineValue(b));
        case "opps":
          return dir * (activeOpps(a) - activeOpps(b));
      }
    });
    return rows;
  }, [partners, search, fCountry, fStatus, fFunnel, fTier, fSource, fOwner, sort]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }
    );
  }

  function handleExport() {
    exportCsv(
      "partners",
      [
        "Nombre comercial",
        "Razón social",
        "País",
        "Tipo",
        "Tier",
        "Status",
        "Etapa funnel",
        "Source",
        "Oportunidades activas",
        "Pipeline USD",
        "Owner",
        "Website",
      ],
      filtered.map((p) => [
        partnerDisplayName(p),
        p.legal_name,
        countryName(p.country_code),
        p.partner_type ? PARTNER_TYPE_LABELS[p.partner_type] : "",
        p.tier ?? "",
        p.status ? PARTNER_STATUS_LABELS[p.status] : "",
        p.funnel_stage ? FUNNEL_STAGE_LABELS[p.funnel_stage] : "",
        p.source ? SOURCE_LABELS[p.source] : "",
        activeOpps(p),
        Math.round(pipelineValue(p)),
        p.owner?.full_name ?? "",
        p.website ?? "",
      ])
    );
  }

  if (isLoading) return <TableSkeleton />;

  const SortableHead = ({
    label,
    sortKey,
    className,
  }: {
    label: string;
    sortKey: SortKey;
    className?: string;
  }) => (
    <TableHead className={className}>
      <button
        className="inline-flex items-center gap-1 font-semibold hover:text-ink"
        onClick={() => toggleSort(sortKey)}
      >
        {label}
        <ArrowUpDown className="size-3.5 opacity-50" />
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-warm" />
          <Input
            placeholder="Buscar por nombre…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="h-9 w-56 bg-white pl-9"
          />
        </div>
        <FilterSelect
          value={fCountry}
          onChange={(v) => { setFCountry(v); setPage(0); }}
          placeholder="País"
          options={COUNTRIES.map((c) => ({ value: c.code, label: `${c.flag} ${c.name}` }))}
        />
        <FilterSelect
          value={fStatus}
          onChange={(v) => { setFStatus(v); setPage(0); }}
          placeholder="Status"
          options={Object.entries(PARTNER_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <FilterSelect
          value={fFunnel}
          onChange={(v) => { setFFunnel(v); setPage(0); }}
          placeholder="Funnel"
          options={Object.entries(FUNNEL_STAGE_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <FilterSelect
          value={fTier}
          onChange={(v) => { setFTier(v); setPage(0); }}
          placeholder="Tier"
          options={["A", "B", "C"].map((t) => ({ value: t, label: `Tier ${t}` }))}
          className="h-9 w-[110px] bg-white"
        />
        <FilterSelect
          value={fSource}
          onChange={(v) => { setFSource(v); setPage(0); }}
          placeholder="Source"
          options={Object.entries(SOURCE_LABELS).map(([value, label]) => ({ value, label }))}
          className="h-9 w-[130px] bg-white"
        />
        <FilterSelect
          value={fOwner}
          onChange={(v) => { setFOwner(v); setPage(0); }}
          placeholder="Owner"
          options={profiles.map((p) => ({ value: p.id, label: p.full_name ?? p.email ?? "—" }))}
          className="h-9 w-[140px] bg-white"
        />
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Sin partners"
          description={
            partners?.length
              ? "Ningún partner coincide con los filtros aplicados."
              : "Todavía no cargaste ningún partner. Empezá creando el primero."
          }
          action={
            !partners?.length && (
              <Button asChild>
                <Link href="/partners/new">
                  <Plus className="size-4" />
                  Nuevo Partner
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <SortableHead label="Partner" sortKey="nombre" />
                <SortableHead label="País" sortKey="pais" />
                <TableHead>Tipo</TableHead>
                <SortableHead label="Tier" sortKey="tier" />
                <SortableHead label="Status" sortKey="status" />
                <TableHead>Funnel</TableHead>
                <SortableHead label="Opps" sortKey="opps" className="text-right" />
                <SortableHead label="Pipeline" sortKey="pipeline" className="text-right" />
                <TableHead>Owner</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/partners/${p.id}`)}
                >
                  <TableCell>
                    <div className="font-semibold text-ink">
                      {partnerDisplayName(p)}
                    </div>
                    <div className="text-xs text-muted-warm">{p.legal_name}</div>
                  </TableCell>
                  <TableCell>
                    {countryFlag(p.country_code)} {p.country_code}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.partner_type ? PARTNER_TYPE_LABELS[p.partner_type] : "—"}
                  </TableCell>
                  <TableCell>
                    {p.tier ? (
                      <Badge variant="outline" className={TIER_COLORS[p.tier]}>
                        {p.tier}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {p.status ? (
                      <Badge variant="outline" className={PARTNER_STATUS_COLORS[p.status]}>
                        {PARTNER_STATUS_LABELS[p.status]}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.funnel_stage ? FUNNEL_STAGE_LABELS[p.funnel_stage] : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {activeOpps(p)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatMoney(pipelineValue(p))}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.owner?.full_name ?? "—"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/partners/${p.id}/edit`}>
                            <Pencil className="size-4" /> Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setToDelete(p)}
                        >
                          <Trash2 className="size-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
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
        title={`¿Eliminar ${toDelete ? partnerDisplayName(toDelete) : ""}?`}
        description="Se eliminan también sus contactos, oportunidades y actividades. Esta acción no se puede deshacer."
        onConfirm={() => {
          if (toDelete) deletePartner.mutate(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
