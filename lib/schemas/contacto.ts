import { z } from "zod";
import { optionalString, optionalStringWith } from "./helpers";

export const contactoSchema = z.object({
  partner_id: z.string().min(1, "Elegí un partner"),
  first_name: z.string().min(1, "Ingresá el nombre"),
  last_name: z.string().min(1, "Ingresá el apellido"),
  role: optionalString(),
  email: optionalStringWith(z.string().email("Email inválido")),
  phone: optionalString(),
  linkedin: optionalStringWith(
    z.string().url("URL inválida (incluí https://)")
  ),
  is_decision_maker: z.boolean().default(false),
  notes: optionalString(),
});

export type ContactoFormValues = z.input<typeof contactoSchema>;
export type ContactoFormOutput = z.output<typeof contactoSchema>;
