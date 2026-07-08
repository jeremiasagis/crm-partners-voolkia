"use server";

import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";

const createUserSchema = z.object({
  full_name: z.string().min(2, "Ingresá el nombre completo"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/** Crea un usuario vía Supabase Admin API. Solo admins. */
export async function createUserAction(
  input: CreateUserInput
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return { error: "Solo un admin puede crear usuarios" };
  }

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name },
  });

  if (error) {
    return {
      error: error.message.includes("already been registered")
        ? "Ya existe un usuario con ese email"
        : error.message,
    };
  }
  return { success: true };
}
