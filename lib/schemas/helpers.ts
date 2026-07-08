import { z } from "zod";

/** String opcional: "" / undefined → null */
export function optionalString() {
  return z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v : null));
}

/** String opcional validado (email, url, etc.) una vez normalizado */
export function optionalStringWith(inner: z.ZodType<string, string>) {
  return optionalString().pipe(z.union([inner, z.null()]));
}

/** Enum opcional: "" / undefined → null */
export function optionalEnum<const T extends readonly [string, ...string[]]>(
  values: T
) {
  return z
    .union([z.enum(values), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v ? v : null));
}

/** Número desde input de texto (react-hook-form entrega strings) */
export function numberInput(opts?: { min?: number; max?: number; int?: boolean }) {
  return z
    .union([z.number(), z.string()])
    .transform((v, ctx) => {
      const n = typeof v === "string" ? Number(v) : v;
      if (Number.isNaN(n)) {
        ctx.addIssue({ code: "custom", message: "Ingresá un número válido" });
        return z.NEVER;
      }
      if (opts?.int && !Number.isInteger(n)) {
        ctx.addIssue({ code: "custom", message: "Debe ser un número entero" });
        return z.NEVER;
      }
      if (opts?.min != null && n < opts.min) {
        ctx.addIssue({ code: "custom", message: `Mínimo ${opts.min}` });
        return z.NEVER;
      }
      if (opts?.max != null && n > opts.max) {
        ctx.addIssue({ code: "custom", message: `Máximo ${opts.max}` });
        return z.NEVER;
      }
      return n;
    });
}
