import type { Metadata } from "next";
import { ContactoEdit } from "@/components/contactos/contacto-edit";

export const metadata: Metadata = {
  title: "Editar Contacto",
};

export default async function EditContactoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContactoEdit id={id} />;
}
