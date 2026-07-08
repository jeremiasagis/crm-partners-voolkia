"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  ExternalLink,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useContactos, useDeleteContacto } from "@/hooks/use-contactos";
import { usePartners } from "@/hooks/use-partners";
import type { ContactoWithPartner } from "@/lib/types";
import { partnerDisplayName } from "@/lib/utils/labels";
import { COUNTRIES, countryFlag } from "@/lib/utils/countries";
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

export function ContactoList() {
  const { data: contactos, isLoading } = useContactos();
  const { data: partners = [] } = usePartners();
  const deleteContacto = useDeleteContacto();

  const [search, setSearch] = useState("");
  const [fPartner, setFPartner] = useState("");
  const [fDecisor, setFDecisor] = useState("");
  const [fCountry, setFCountry] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [toDelete, setToDelete] = useState<ContactoWithPartner | null>(null);

  const filtered = useMemo(() => {
    let rows = contactos ?? [];
    const q = search.trim().toLowerCase();
    if (q)
      rows = rows.filter((c) =>
        `${c.first_name} ${c.last_name} ${c.email ?? ""} ${c.role ?? ""}`
          .toLowerCase()
          .includes(q)
      );
    if (fPartner) rows = rows.filter((c) => c.partner_id === fPartner);
    if (fDecisor)
      rows = rows.filter((c) =>
        fDecisor === "si" ? c.is_decision_maker : !c.is_decision_maker
      );
    if (fCountry)
      rows = rows.filter((c) => c.partner?.country_code === fCountry);
    return rows;
  }, [contactos, search, fPartner, fDecisor, fCountry]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  function handleExport() {
    exportCsv(
      "contactos",
      [
        "Nombre",
        "Apellido",
        "Cargo",
        "Partner",
        "País partner",
        "Email",
        "Teléfono",
        "LinkedIn",
        "Decisor",
      ],
      filtered.map((c) => [
        c.first_name,
        c.last_name,
        c.role ?? "",
        c.partner ? partnerDisplayName(c.partner) : "",
        c.partner?.country_code ?? "",
        c.email ?? "",
        c.phone ?? "",
        c.linkedin ?? "",
        c.is_decision_maker ? "Sí" : "No",
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
            placeholder="Buscar contacto…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="h-9 w-56 bg-white pl-9"
          />
        </div>
        <FilterSelect
          value={fPartner}
          onChange={(v) => { setFPartner(v); setPage(0); }}
          placeholder="Partner"
          options={partners.map((p) => ({
            value: p.id,
            label: partnerDisplayName(p),
          }))}
          className="h-9 w-[190px] bg-white"
        />
        <FilterSelect
          value={fDecisor}
          onChange={(v) => { setFDecisor(v); setPage(0); }}
          placeholder="Decisor"
          options={[
            { value: "si", label: "Solo decisores" },
            { value: "no", label: "No decisores" },
          ]}
          className="h-9 w-[150px] bg-white"
        />
        <FilterSelect
          value={fCountry}
          onChange={(v) => { setFCountry(v); setPage(0); }}
          placeholder="País"
          options={COUNTRIES.map((c) => ({
            value: c.code,
            label: `${c.flag} ${c.name}`,
          }))}
        />
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin contactos"
          description={
            contactos?.length
              ? "Ningún contacto coincide con los filtros."
              : "Todavía no cargaste contactos."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Decisor</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      {c.first_name} {c.last_name}
                      {c.linkedin && (
                        <a
                          href={c.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-warm hover:text-orange-deep"
                          title="LinkedIn"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.role ?? "—"}</TableCell>
                  <TableCell>
                    {c.partner ? (
                      <Link
                        href={`/partners/${c.partner.id}`}
                        className="text-orange-deep hover:underline"
                      >
                        {countryFlag(c.partner.country_code)}{" "}
                        {partnerDisplayName(c.partner)}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {c.email ? (
                      <a
                        href={`mailto:${c.email}`}
                        className="inline-flex items-center gap-1 text-sm hover:text-orange-deep"
                      >
                        <Mail className="size-3.5 text-muted-warm" /> {c.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.phone ? (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="size-3.5 text-muted-warm" /> {c.phone}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {c.is_decision_maker && (
                      <Badge className="bg-orange-soft text-orange-deep">
                        Decisor
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/contactos/${c.id}/edit`}>
                            <Pencil className="size-4" /> Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setToDelete(c)}
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
        title={`¿Eliminar a ${toDelete?.first_name} ${toDelete?.last_name}?`}
        description="Esta acción no se puede deshacer."
        onConfirm={() => {
          if (toDelete) deleteContacto.mutate(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
