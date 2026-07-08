import type { Metadata } from "next";
import { PartnerList } from "@/components/partners/partner-list";

export const metadata: Metadata = {
  title: "Partners",
};

export default function PartnersPage() {
  return <PartnerList />;
}
