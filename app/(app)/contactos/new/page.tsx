import type { Metadata } from "next";
import { ContactoForm } from "@/components/contactos/contacto-form";

export const metadata: Metadata = {
  title: "Nuevo Contacto",
};

export default async function NewContactoPage({
  searchParams,
}: {
  searchParams: Promise<{ partner?: string }>;
}) {
  const { partner } = await searchParams;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-ink">Nuevo Contacto</h2>
      <ContactoForm defaultPartnerId={partner} />
    </div>
  );
}
