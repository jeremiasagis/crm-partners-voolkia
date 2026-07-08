import { z } from "zod";
import { optionalString } from "./helpers";

export const actividadSchema = z.object({
  tipo: z.enum(["llamada", "reunion", "email", "whatsapp", "nota", "otro"], {
    message: "Elegí un tipo",
  }),
  fecha: z.string().min(1, "Ingresá la fecha"),
  partner_id: z.string().min(1, "Elegí un partner"),
  contacto_id: optionalString(),
  oportunidad_id: optionalString(),
  titulo: z.string().min(2, "Ingresá un título"),
  descripcion: optionalString(),
  proxima_accion: optionalString(),
  proxima_accion_fecha: optionalString(),
});

export type ActividadFormValues = z.input<typeof actividadSchema>;
export type ActividadFormOutput = z.output<typeof actividadSchema>;
