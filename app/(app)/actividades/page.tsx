import type { Metadata } from "next";
import { ActividadList } from "@/components/actividades/actividad-list";

export const metadata: Metadata = {
  title: "Actividades",
};

export default function ActividadesPage() {
  return <ActividadList />;
}
