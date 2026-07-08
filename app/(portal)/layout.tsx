import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortalHeader } from "@/components/portal/portal-header";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, partner_id")
    .eq("id", user.id)
    .maybeSingle();

  // Los usuarios internos usan el CRM completo
  if (profile?.role !== "partner") redirect("/dashboard");
  // Un partner sin empresa asignada no tiene nada que ver acá
  if (!profile.partner_id) redirect("/login");

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PortalHeader
        userName={profile.full_name ?? user.email ?? ""}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8">
        {children}
      </main>
      <footer className="border-t border-line py-4 text-center text-xs text-muted-warm">
        Voolkia S.A. — Programa de Partners Estratégicos
      </footer>
    </div>
  );
}
