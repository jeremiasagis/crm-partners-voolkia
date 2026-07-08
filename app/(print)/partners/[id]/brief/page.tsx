import type { Metadata } from "next";
import { PartnerBrief } from "@/components/partners/partner-brief";

export const metadata: Metadata = {
  title: "Brief de Partner",
};

export default async function PartnerBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PartnerBrief id={id} />;
}
