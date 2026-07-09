"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Plus } from "lucide-react";
import { useMisPendientes } from "@/hooks/use-actividades";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/utils/format";
import { partnerDisplayName } from "@/lib/utils/labels";
import { GlobalSearch } from "./global-search";
import { MobileNav } from "./mobile-nav";

const SECTION_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/partners": "Partners",
  "/contactos": "Contactos",
  "/oportunidades": "Oportunidades",
  "/leads": "Leads referidos",
  "/actividades": "Actividades",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
};

const NEW_BUTTONS: Record<string, { label: string; href: string }> = {
  "/partners": { label: "Nuevo Partner", href: "/partners/new" },
  "/contactos": { label: "Nuevo Contacto", href: "/contactos/new" },
  "/oportunidades": {
    label: "Nueva Oportunidad",
    href: "/oportunidades/new",
  },
  "/actividades": { label: "Nueva Actividad", href: "/actividades/new" },
};

function sectionOf(pathname: string) {
  const base = "/" + (pathname.split("/")[1] ?? "");
  return base === "/" ? "/dashboard" : base;
}

export function Header() {
  const pathname = usePathname();
  const section = sectionOf(pathname);
  const title = SECTION_TITLES[section] ?? "Voolkia CRM";
  const newButton = NEW_BUTTONS[section];
  const { data: pendientes = [] } = useMisPendientes();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/80 px-4 backdrop-blur-md md:gap-4 md:px-8">
      <MobileNav />
      <h1 className="text-lg font-bold tracking-tight text-ink">{title}</h1>

      <div className="flex-1" />

      <GlobalSearch />

      {/* Notificaciones */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="relative rounded-lg border border-line bg-white p-2 text-muted-warm transition-colors hover:text-ink"
            aria-label="Notificaciones"
          >
            <Bell className="size-4" />
            {pendientes.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-orange-vk" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="border-b border-line px-4 py-3 text-sm font-bold text-ink">
            Pendientes de hoy ({pendientes.length})
          </div>
          {pendientes.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-warm">
              Nada pendiente. 🎉
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {pendientes.map((a) => (
                <li key={a.id}>
                  <Link
                    href={
                      a.partner
                        ? `/partners/${a.partner.id}?tab=actividades`
                        : "/actividades"
                    }
                    className="block px-4 py-2.5 transition-colors hover:bg-cream"
                  >
                    <p className="text-sm font-medium text-ink">
                      {a.proxima_accion}
                    </p>
                    <p className="text-xs text-muted-warm">
                      {a.partner ? partnerDisplayName(a.partner) : a.titulo} ·{" "}
                      <span className="font-semibold text-red-600">
                        {formatDate(a.proxima_accion_fecha)}
                      </span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>

      {newButton && (
        <Button asChild className="font-semibold">
          <Link href={newButton.href}>
            <Plus className="size-4" />
            {newButton.label}
          </Link>
        </Button>
      )}
    </header>
  );
}
