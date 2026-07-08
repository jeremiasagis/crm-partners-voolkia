import type { Metadata } from "next";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Contactos",
};

export default function ContactosPage() {
  return (
    <EmptyState
      icon={Users}
      title="Contactos"
      description="El CRUD de contactos llega en la Fase 2, después de correr la migración en Supabase."
    />
  );
}
