"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, Settings } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_ITEMS } from "./sidebar";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("No se pudo cerrar sesión");
      return;
    }
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  const items = [
    ...NAV_ITEMS,
    { href: "/configuracion", label: "Configuración", icon: Settings },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="rounded-lg border border-line bg-white p-2 text-muted-warm md:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="size-4" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-64 border-none bg-[#2A0E04] p-0 text-white [&>button]:text-white"
      >
        <SheetHeader className="border-b border-white/[0.08] p-4">
          <SheetTitle className="text-left">
            <Image
              src="/voolkia.svg"
              alt="Voolkia"
              width={120}
              height={28}
              className="h-6 w-auto"
            />
          </SheetTitle>
        </SheetHeader>
        <nav className="space-y-1 px-3 py-2">
          {items.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "text-[#FFF6EE]/70 hover:bg-white/[0.06] hover:text-white",
                  active &&
                    "bg-[#FF6B1A]/15 text-white before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-[#FF6B1A]"
                )}
              >
                <Icon className="size-5 shrink-0" />
                {label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#FFF6EE]/70 transition-colors hover:bg-white/[0.06] hover:text-red-400"
          >
            <LogOut className="size-5 shrink-0" />
            Cerrar sesión
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
