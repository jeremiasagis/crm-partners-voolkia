"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CalendarClock, ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { isPast, isToday, parseISO } from "date-fns";
import {
  useOportunidades,
  useMoveOportunidad,
} from "@/hooks/use-oportunidades";
import type { Etapa, OportunidadWithRels } from "@/lib/types";
import {
  COMPONENTE_COLORS,
  ETAPAS_ORDEN,
  ETAPAS_PIPELINE,
  ETAPA_LABELS,
  partnerDisplayName,
} from "@/lib/utils/labels";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Confetti } from "@/components/shared/confetti";
import { LoseDialog, WinDialog } from "./etapa-dialogs";
import { cn } from "@/lib/utils";

const COLUMN_ACCENT: Record<Etapa, string> = {
  lead: "border-t-gray-300",
  calificada: "border-t-blue-400",
  propuesta: "border-t-amber-400",
  negociacion: "border-t-orange-500",
  ganada: "border-t-emerald-500",
  perdida: "border-t-red-400",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function KanbanCard({
  opp,
  overlay = false,
}: {
  opp: OportunidadWithRels;
  overlay?: boolean;
}) {
  const overdue =
    opp.proxima_accion_fecha &&
    (isPast(parseISO(opp.proxima_accion_fecha)) ||
      isToday(parseISO(opp.proxima_accion_fecha)));

  return (
    <div
      className={cn(
        "group rounded-lg border border-line bg-white p-3 shadow-sm",
        overlay && "rotate-2 shadow-xl ring-2 ring-orange-vk/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-tight text-ink">
          {opp.cliente_final_name}
        </p>
        <Link
          href={`/oportunidades/${opp.id}`}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="rounded p-1 text-muted-warm opacity-0 transition-opacity hover:text-orange-deep group-hover:opacity-100"
          title="Ver detalle"
        >
          <Pencil className="size-3.5" />
        </Link>
      </div>
      {opp.partner && (
        <p className="mt-0.5 text-xs text-muted-warm">
          {partnerDisplayName(opp.partner)}
        </p>
      )}
      <p className="mt-2 text-lg font-extrabold tabular-nums text-ink">
        {formatMoney(Number(opp.monto_estimado_usd))}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <Badge variant="outline" className={COMPONENTE_COLORS[opp.componente]}>
          {opp.componente}
        </Badge>
        <span className="text-xs font-medium text-muted-warm">
          {opp.probabilidad ?? 0}%
        </span>
        {opp.owner?.full_name && (
          <Avatar className="ml-auto size-6">
            <AvatarFallback className="bg-brand text-[9px] font-bold text-white">
              {initials(opp.owner.full_name)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      {opp.proxima_accion && (
        <div
          className={cn(
            "mt-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs",
            overdue
              ? "bg-red-50 text-red-700"
              : "bg-cream text-muted-warm"
          )}
        >
          <CalendarClock className="size-3 shrink-0" />
          <span className="truncate">{opp.proxima_accion}</span>
          {opp.proxima_accion_fecha && (
            <span className="ml-auto shrink-0 font-semibold">
              {formatDate(opp.proxima_accion_fecha)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function DraggableCard({ opp }: { opp: OportunidadWithRels }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: opp.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab touch-none active:cursor-grabbing",
        isDragging && "opacity-30"
      )}
    >
      <KanbanCard opp={opp} />
    </div>
  );
}

function Column({
  etapa,
  opps,
  collapsed,
  onToggle,
}: {
  etapa: Etapa;
  opps: OportunidadWithRels[];
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa });
  const total = opps.reduce((acc, o) => acc + Number(o.monto_estimado_usd), 0);

  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        className="flex w-10 shrink-0 flex-col items-center gap-2 rounded-xl border border-line bg-white/60 py-3 text-muted-warm transition-colors hover:bg-white"
        title={`Mostrar ${ETAPA_LABELS[etapa]}`}
      >
        <ChevronRight className="size-4" />
        <span className="text-xs font-semibold [writing-mode:vertical-rl]">
          {ETAPA_LABELS[etapa]} ({opps.length})
        </span>
      </button>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border border-line border-t-4 bg-background/60 transition-colors",
        COLUMN_ACCENT[etapa],
        isOver && "bg-orange-soft/40 ring-2 ring-orange-vk/40"
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <h3 className="text-sm font-bold text-ink">{ETAPA_LABELS[etapa]}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-muted-warm">
          {opps.length}
        </span>
        <span className="ml-auto text-xs font-semibold tabular-nums text-muted-warm">
          {formatMoney(total)}
        </span>
        {onToggle && (
          <button
            onClick={onToggle}
            className="rounded p-0.5 text-muted-warm hover:text-ink"
            title="Colapsar columna"
          >
            <ChevronDown className="size-4" />
          </button>
        )}
      </div>
      <div className="flex min-h-32 flex-1 flex-col gap-2 overflow-y-auto p-2 pt-0">
        {opps.map((o) => (
          <DraggableCard key={o.id} opp={o} />
        ))}
        {opps.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted-warm">
            Arrastrá una tarjeta acá
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { data: oportunidades, isLoading } = useOportunidades();
  const moveOpp = useMoveOportunidad();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [perdidaCollapsed, setPerdidaCollapsed] = useState(true);
  const [winTarget, setWinTarget] = useState<OportunidadWithRels | null>(null);
  const [loseTarget, setLoseTarget] = useState<OportunidadWithRels | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const byEtapa = useMemo(() => {
    const map = new Map<Etapa, OportunidadWithRels[]>();
    for (const e of ETAPAS_ORDEN) map.set(e, []);
    for (const o of oportunidades ?? []) {
      map.get(o.etapa ?? "lead")?.push(o);
    }
    return map;
  }, [oportunidades]);

  const pipelinePonderado = (oportunidades ?? [])
    .filter((o) => o.etapa && ETAPAS_PIPELINE.includes(o.etapa))
    .reduce(
      (acc, o) =>
        acc + Number(o.monto_estimado_usd) * ((o.probabilidad ?? 0) / 100),
      0
    );
  const pipelineBruto = (oportunidades ?? [])
    .filter((o) => o.etapa && ETAPAS_PIPELINE.includes(o.etapa))
    .reduce((acc, o) => acc + Number(o.monto_estimado_usd), 0);

  const active = (oportunidades ?? []).find((o) => o.id === activeId) ?? null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const oppId = String(e.active.id);
    const target = e.over?.id as Etapa | undefined;
    if (!target || !ETAPAS_ORDEN.includes(target)) return;
    const opp = (oportunidades ?? []).find((o) => o.id === oppId);
    if (!opp || opp.etapa === target) return;

    // Ganada y perdida piden datos extra antes de confirmar el movimiento
    if (target === "ganada") {
      setWinTarget(opp);
      return;
    }
    if (target === "perdida") {
      setLoseTarget(opp);
      return;
    }
    moveOpp.mutate({ id: oppId, etapa: target });
  }

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      {/* Total pipeline */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-1 rounded-xl border border-line bg-white px-5 py-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-warm">
            Pipeline ponderado
          </span>
          <p className="text-xl font-extrabold tabular-nums text-ink">
            {formatMoney(pipelinePonderado)}
          </p>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-warm">
            Pipeline bruto
          </span>
          <p className="text-xl font-bold tabular-nums text-muted-warm">
            {formatMoney(pipelineBruto)}
          </p>
        </div>
        <p className="ml-auto text-xs text-muted-warm">
          Arrastrá las tarjetas entre columnas para cambiar la etapa
        </p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4">
          {ETAPAS_ORDEN.map((etapa) => (
            <Column
              key={etapa}
              etapa={etapa}
              opps={byEtapa.get(etapa) ?? []}
              collapsed={etapa === "perdida" ? perdidaCollapsed : false}
              onToggle={
                etapa === "perdida"
                  ? () => setPerdidaCollapsed((c) => !c)
                  : undefined
              }
            />
          ))}
        </div>
        <DragOverlay>
          {active && <KanbanCard opp={active} overlay />}
        </DragOverlay>
      </DndContext>

      <WinDialog
        opp={winTarget}
        onCancel={() => setWinTarget(null)}
        onConfirm={({ fecha_real_cierre, comision }) => {
          if (winTarget) {
            moveOpp.mutate({
              id: winTarget.id,
              etapa: "ganada",
              extra: {
                fecha_real_cierre,
                comision_estimada_usd: comision,
                probabilidad: 100,
              },
            });
            setCelebrating(true);
          }
          setWinTarget(null);
        }}
      />

      <LoseDialog
        opp={loseTarget}
        onCancel={() => setLoseTarget(null)}
        onConfirm={(motivo) => {
          if (loseTarget) {
            moveOpp.mutate({
              id: loseTarget.id,
              etapa: "perdida",
              extra: { motivo_perdida: motivo, probabilidad: 0 },
            });
          }
          setLoseTarget(null);
        }}
      />

      {celebrating && <Confetti onDone={() => setCelebrating(false)} />}
    </div>
  );
}
