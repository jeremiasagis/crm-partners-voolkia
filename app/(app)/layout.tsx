import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { RealtimeSync } from "@/components/layout/realtime-sync";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // El profile puede no existir todavía (antes de correr la migración):
  // degradamos al email del usuario sin romper el layout.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex min-h-svh">
      <Sidebar
        userName={profile?.full_name ?? ""}
        userEmail={user.email ?? ""}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
      <RealtimeSync />
    </div>
  );
}
