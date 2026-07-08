import type { Metadata } from "next";
import { ConfigTabs } from "@/components/configuracion/config-tabs";

export const metadata: Metadata = {
  title: "Configuración",
};

export default function ConfiguracionPage() {
  return <ConfigTabs />;
}
