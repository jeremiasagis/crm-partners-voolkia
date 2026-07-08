import type { Metadata } from "next";
import { PortalView } from "@/components/portal/portal-view";

export const metadata: Metadata = {
  title: "Portal de Partners",
};

export default function PortalPage() {
  return <PortalView />;
}
