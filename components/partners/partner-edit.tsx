"use client";

import { Building2 } from "lucide-react";
import { usePartner } from "@/hooks/use-partners";
import { partnerDisplayName } from "@/lib/utils/labels";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PartnerForm } from "./partner-form";

export function PartnerEdit({ id }: { id: string }) {
  const { data: partner, isLoading } = usePartner(id);

  if (isLoading) return <Skeleton className="h-96 w-full max-w-3xl" />;
  if (!partner) {
    return (
      <EmptyState
        icon={Building2}
        title="Partner no encontrado"
        description="Puede que haya sido eliminado."
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-ink">
        Editar {partnerDisplayName(partner)}
      </h2>
      <PartnerForm partner={partner} />
    </div>
  );
}
