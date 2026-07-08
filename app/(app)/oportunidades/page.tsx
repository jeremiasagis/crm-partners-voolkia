import type { Metadata } from "next";
import { Target } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Oportunidades",
};

export default function OportunidadesPage() {
  return (
    <EmptyState
      icon={Target}
      title="Oportunidades"
      description="La tabla y el Kanban de oportunidades llegan en las Fases 2 y 3."
    />
  );
}
