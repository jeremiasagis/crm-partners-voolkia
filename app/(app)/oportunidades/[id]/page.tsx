import type { Metadata } from "next";
import { OppDetail } from "@/components/oportunidades/opp-detail";

export const metadata: Metadata = {
  title: "Oportunidad",
};

export default async function OportunidadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OppDetail id={id} />;
}
