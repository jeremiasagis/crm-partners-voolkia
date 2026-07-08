import type { Metadata } from "next";
import { ContactoList } from "@/components/contactos/contacto-list";

export const metadata: Metadata = {
  title: "Contactos",
};

export default function ContactosPage() {
  return <ContactoList />;
}
