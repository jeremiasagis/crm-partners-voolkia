import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

export const E2E_EMAIL = "e2e-test@voolkia.com";
export const E2E_PASSWORD = "E2eVoolkia!2026";

/** Crea (una sola vez) el usuario de prueba vía Supabase Admin API */
export default async function globalSetup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local"
    );
  }

  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: E2E_EMAIL,
      password: E2E_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Usuario E2E" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    // Si ya existe, seguimos
    if (!body.includes("already been registered")) {
      throw new Error(`No se pudo crear el usuario e2e: ${res.status} ${body}`);
    }
  }
}
