import { z } from "zod";
import { numberInput, optionalString } from "./helpers";

export const oportunidadSchema = z.object({
  partner_id: z.string().min(1, "Elegí un partner"),
  cliente_final_name: z.string().min(2, "Ingresá el cliente final"),
  cliente_final_country: optionalString(),
  componente: z.enum(["R-A", "R-B", "T", "P"], {
    message: "Elegí un componente",
  }),
  monto_estimado_usd: numberInput({ min: 0 }),
  comision_estimada_usd: numberInput({ min: 0 }).default(0),
  probabilidad: numberInput({ min: 0, max: 100, int: true }).default(50),
  etapa: z
    .enum(["lead", "calificada", "propuesta", "negociacion", "ganada", "perdida"])
    .default("lead"),
  fecha_estimada_cierre: optionalString(),
  fecha_real_cierre: optionalString(),
  proxima_accion: optionalString(),
  proxima_accion_fecha: optionalString(),
  notes: optionalString(),
  owner_id: optionalString(),
});

export type OportunidadFormValues = z.input<typeof oportunidadSchema>;
export type OportunidadFormOutput = z.output<typeof oportunidadSchema>;
