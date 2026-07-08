import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Actividades",
};

export default function ActividadesPage() {
  return (
    <EmptyState
      icon={CalendarClock}
      title="Actividades"
      description="El timeline de actividades llega en la Fase 2."
    />
  );
}
