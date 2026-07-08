import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Configuración",
};

export default function ConfiguracionPage() {
  return (
    <EmptyState
      icon={Settings}
      title="Configuración"
      description="Usuarios, perfil y datos maestros llegan en la Fase 3."
    />
  );
}
