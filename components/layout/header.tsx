"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTION_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/partners": "Partners",
  "/contactos": "Contactos",
  "/oportunidades": "Oportunidades",
  "/actividades": "Actividades",
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

export function Header({ pendingToday = 0 }: { pendingToday?: number }) {
  const pathname = usePathname();
  const section = sectionOf(pathname);
  const title = SECTION_TITLES[section] ?? "Voolkia CRM";
  const newButton = NEW_BUTTONS[section];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-line bg-white/80 px-8 backdrop-blur-md">
      <h1 className="text-lg font-bold tracking-tight text-ink">{title}</h1>

      <div className="flex-1" />

      {/* Búsqueda global — modal Cmd+K llega en Fase 2 */}
      <button
        className="hidden h-9 w-72 items-center gap-2 rounded-lg border border-line bg-background px-3 text-sm text-muted-warm transition-colors hover:border-orange-vk/40 md:flex"
        title="Búsqueda global (disponible en Fase 2)"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Buscar…</span>
        <kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-mono text-[10px] text-muted-warm">
          Ctrl K
        </kbd>
      </button>

      {/* Notificaciones */}
      <button
        className="relative rounded-lg border border-line bg-white p-2 text-muted-warm transition-colors hover:text-ink"
        aria-label="Notificaciones"
      >
        <Bell className="size-4" />
        {pendingToday > 0 && (
          <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-orange-vk" />
        )}
      </button>

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
