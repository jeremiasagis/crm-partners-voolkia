import type { Metadata } from "next";
import { LeadsInbox } from "@/components/leads/leads-inbox";

export const metadata: Metadata = {
  title: "Leads referidos",
};

export default function LeadsPage() {
  return <LeadsInbox />;
}
