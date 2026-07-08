import type { Metadata } from "next";
import { OppForm } from "@/components/oportunidades/opp-form";

export const metadata: Metadata = {
  title: "Nueva Oportunidad",
};

export default async function NewOportunidadPage({
  searchParams,
}: {
  searchParams: Promise<{ partner?: string }>;
}) {
  const { partner } = await searchParams;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-ink">Nueva Oportunidad</h2>
      <OppForm defaultPartnerId={partner} />
    </div>
  );
}
