import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Partners",
};

export default function PartnersPage() {
  return (
    <EmptyState
      icon={Building2}
      title="Partners"
      description="El CRUD de partners llega en la Fase 2, después de correr la migración en Supabase."
    />
  );
}
