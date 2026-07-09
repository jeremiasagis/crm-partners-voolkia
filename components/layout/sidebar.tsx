"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Building2,
  CalendarClock,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
  Target,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { usePendingLeadsCount } from "@/hooks/use-leads";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/partners", label: "Partners", icon: Building2 },
  { href: "/contactos", label: "Contactos", icon: Users },
  { href: "/oportunidades", label: "Oportunidades", icon: Target },
  { href: "/leads", label: "Leads referidos", icon: Inbox },
  { href: "/actividades", label: "Actividades", icon: CalendarClock },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
];

type SidebarProps = {
  userName: string;
  userEmail: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const pendingLeads = usePendingLeadsCount();

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("No se pudo cerrar sesión");
      return;
    }
    router.push("/login");
    router.refresh();
  }

  function NavLink({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ElementType;
  }) {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    const link = (
      <Link
        href={href}
        className={cn(
          "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          "text-[#FFF6EE]/70 hover:bg-white/[0.06] hover:text-white",
          active &&
            "bg-[#FF6B1A]/15 text-white before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-[#FF6B1A]",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon className="size-5 shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
        {href === "/leads" && pendingLeads > 0 && (
          <span
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FF6B1A] text-[10px] font-bold text-white",
              collapsed ? "absolute -right-1 -top-1" : "ml-auto"
            )}
          >
            {pendingLeads}
          </span>
        )}
      </Link>
    );

    if (!collapsed) return link;
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col bg-[#2A0E04] transition-[width] duration-200 md:flex",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/[0.08]",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        <Link href="/dashboard" className="flex items-center">
          {collapsed ? (
            <Image
              src="/icon.svg"
              alt="Voolkia"
              width={32}
              height={32}
              className="size-8 rounded-lg"
            />
          ) : (
            <Image
              src="/voolkia.svg"
              alt="Voolkia"
              width={130}
              height={30}
              priority
              className="h-7 w-auto"
            />
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="rounded-md p-1.5 text-[#FFF6EE]/50 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Colapsar sidebar"
          >
            <ChevronsLeft className="size-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 rounded-md p-1.5 text-[#FFF6EE]/50 transition-colors hover:bg-white/[0.06] hover:text-white"
          aria-label="Expandir sidebar"
        >
          <ChevronsRight className="size-4" />
        </button>
      )}

      {/* Nav principal */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      {/* Configuración al fondo */}
      <div className="space-y-1 px-3 pb-2">
        <NavLink href="/configuracion" label="Configuración" icon={Settings} />
      </div>

      {/* Usuario */}
      <div
        className={cn(
          "border-t border-white/[0.08] p-3",
          collapsed && "flex justify-center"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "flex-col gap-2"
          )}
        >
          <Avatar className="size-9 border border-white/10">
            <AvatarFallback className="bg-[#FF6B1A] text-xs font-bold text-white">
              {initials(userName || userEmail)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {userName || "Usuario"}
              </p>
              <p className="truncate text-xs text-[#FFF6EE]/50">{userEmail}</p>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="rounded-md p-1.5 text-[#FFF6EE]/50 transition-colors hover:bg-white/[0.06] hover:text-red-400"
                aria-label="Cerrar sesión"
              >
                <LogOut className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Cerrar sesión</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
