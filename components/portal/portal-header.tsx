"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { usePortalPartner } from "@/hooks/use-portal";
import { partnerDisplayName } from "@/lib/utils/labels";
import { countryFlag } from "@/lib/utils/countries";
import { Button } from "@/components/ui/button";

export function PortalHeader({ userName }: { userName: string }) {
  const router = useRouter();
  const { data: partner } = usePortalPartner();

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

  return (
    <header className="border-b border-white/[0.08] bg-[#2A0E04]">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-4 px-4 md:px-8">
        <Image
          src="/voolkia.svg"
          alt="Voolkia"
          width={120}
          height={28}
          priority
          className="h-6 w-auto"
        />
        <span className="hidden text-sm font-medium text-[#FFF6EE]/60 sm:block">
          Portal de Partners
        </span>
        <div className="flex-1" />
        {partner && (
          <span className="truncate text-sm font-semibold text-white">
            {countryFlag(partner.country_code)} {partnerDisplayName(partner)}
          </span>
        )}
        <span className="hidden truncate text-xs text-[#FFF6EE]/50 md:block">
          {userName}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-[#FFF6EE]/70 hover:bg-white/[0.06] hover:text-white"
        >
          <LogOut className="size-4" />
          Salir
        </Button>
      </div>
    </header>
  );
}
