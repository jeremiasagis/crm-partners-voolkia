import { z } from "zod";
import { numberInput, optionalEnum, optionalString } from "./helpers";

const baseSchema = z.object({
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
  motivo_perdida: optionalEnum([
    "precio",
    "timing",
    "competidor",
    "sin_presupuesto",
    "otro",
  ]),
  notes: optionalString(),
  owner_id: optionalString(),
});

export const oportunidadSchema = baseSchema.superRefine((data, ctx) => {
  if (data.etapa === "perdida" && !data.motivo_perdida) {
    ctx.addIssue({
      code: "custom",
      path: ["motivo_perdida"],
      message: "Indicá el motivo de la pérdida",
    });
  }
});

export type OportunidadFormValues = z.input<typeof oportunidadSchema>;
export type OportunidadFormOutput = z.output<typeof oportunidadSchema>;
