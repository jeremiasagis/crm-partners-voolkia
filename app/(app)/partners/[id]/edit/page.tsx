import type { Metadata } from "next";
import { PartnerEdit } from "@/components/partners/partner-edit";

export const metadata: Metadata = {
  title: "Editar Partner",
};

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PartnerEdit id={id} />;
}
