import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Protege todo excepto:
     * - _next/static, _next/image
     * - favicon / íconos / assets estáticos
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|voolkia.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
