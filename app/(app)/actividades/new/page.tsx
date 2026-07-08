import type { Metadata } from "next";
import { ActividadForm } from "@/components/actividades/actividad-form";

export const metadata: Metadata = {
  title: "Nueva Actividad",
};

export default async function NewActividadPage({
  searchParams,
}: {
  searchParams: Promise<{ partner?: string }>;
}) {
  const { partner } = await searchParams;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-ink">Nueva Actividad</h2>
      <ActividadForm defaultPartnerId={partner} />
    </div>
  );
}
