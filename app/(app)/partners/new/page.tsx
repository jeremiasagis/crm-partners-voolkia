import type { Metadata } from "next";
import { PartnerForm } from "@/components/partners/partner-form";

export const metadata: Metadata = {
  title: "Nuevo Partner",
};

export default function NewPartnerPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-ink">Nuevo Partner</h2>
      <PartnerForm />
    </div>
  );
}
