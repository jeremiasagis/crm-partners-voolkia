import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid, Table2 } from "lucide-react";
import { KanbanBoard } from "@/components/oportunidades/kanban-board";

export const metadata: Metadata = {
  title: "Kanban",
};

export default function KanbanPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 rounded-lg border border-line bg-white p-1 w-fit">
        <Link
          href="/oportunidades"
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-warm transition-colors hover:text-ink"
        >
          <Table2 className="size-4" /> Tabla
        </Link>
        <span className="flex items-center gap-1.5 rounded-md bg-orange-soft px-3 py-1.5 text-sm font-semibold text-orange-deep">
          <LayoutGrid className="size-4" /> Kanban
        </span>
      </div>
      <KanbanBoard />
    </div>
  );
}
