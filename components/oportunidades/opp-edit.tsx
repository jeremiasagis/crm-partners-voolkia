"use client";

import { Target } from "lucide-react";
import { useOportunidad } from "@/hooks/use-oportunidades";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { OppForm } from "./opp-form";

export function OppEdit({ id }: { id: string }) {
  const { data: oportunidad, isLoading } = useOportunidad(id);

  if (isLoading) return <Skeleton className="h-96 w-full max-w-3xl" />;
  if (!oportunidad) {
    return (
      <EmptyState
        icon={Target}
        title="Oportunidad no encontrada"
        description="Puede que haya sido eliminada."
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-ink">
        Editar oportunidad — {oportunidad.cliente_final_name}
      </h2>
      <OppForm oportunidad={oportunidad} />
    </div>
  );
}
