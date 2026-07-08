import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid, Table2 } from "lucide-react";
import { OppTable } from "@/components/oportunidades/opp-table";

export const metadata: Metadata = {
  title: "Oportunidades",
};

export default function OportunidadesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 rounded-lg border border-line bg-white p-1 w-fit">
        <span className="flex items-center gap-1.5 rounded-md bg-orange-soft px-3 py-1.5 text-sm font-semibold text-orange-deep">
          <Table2 className="size-4" /> Tabla
        </span>
        <Link
          href="/oportunidades/kanban"
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-warm transition-colors hover:text-ink"
        >
          <LayoutGrid className="size-4" /> Kanban
        </Link>
      </div>
      <OppTable />
    </div>
  );
}
