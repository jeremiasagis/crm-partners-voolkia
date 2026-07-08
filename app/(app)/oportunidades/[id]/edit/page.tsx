import type { Metadata } from "next";
import { OppEdit } from "@/components/oportunidades/opp-edit";

export const metadata: Metadata = {
  title: "Editar Oportunidad",
};

export default async function EditOportunidadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OppEdit id={id} />;
}
