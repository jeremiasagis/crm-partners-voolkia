import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <EmptyState
      icon={LayoutDashboard}
      title="Dashboard en construcción"
      description="Los KPIs, gráficos y rankings llegan en la Fase 3, una vez que el schema esté corriendo en Supabase."
    />
  );
}
