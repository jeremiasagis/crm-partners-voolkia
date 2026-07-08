"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  oportunidadSchema,
  type OportunidadFormValues,
} from "@/lib/schemas/oportunidad";
import {
  useCreateOportunidad,
  useUpdateOportunidad,
} from "@/hooks/use-oportunidades";
import { useProfiles } from "@/hooks/use-profiles";
import type { Componente, Oportunidad } from "@/lib/types";
import {
  COMPONENTE_DESCRIPTIONS,
  COMPONENTE_LABELS,
  ETAPA_LABELS,
  MOTIVO_PERDIDA_LABELS,
} from "@/lib/utils/labels";
import { COUNTRIES } from "@/lib/utils/countries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FormSection } from "@/components/shared/field";
import { PartnerSelect } from "@/components/shared/partner-select";
import { cn } from "@/lib/utils";

const NONE = "__none__";

export function OppForm({
  oportunidad,
  defaultPartnerId,
}: {
  oportunidad?: Oportunidad;
  defaultPartnerId?: string;
}) {
  const router = useRouter();
  const { data: profiles = [] } = useProfiles();
  const createOpp = useCreateOportunidad();
  const updateOpp = useUpdateOportunidad();
  const isEdit = !!oportunidad;
  const pending = createOpp.isPending || updateOpp.isPending;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<OportunidadFormValues>({
    resolver: zodResolver(oportunidadSchema),
    defaultValues: oportunidad
      ? {
          partner_id: oportunidad.partner_id,
          cliente_final_name: oportunidad.cliente_final_name,
          cliente_final_country: oportunidad.cliente_final_country,
          componente: oportunidad.componente,
          monto_estimado_usd: Number(oportunidad.monto_estimado_usd),
          comision_estimada_usd: Number(oportunidad.comision_estimada_usd ?? 0),
          probabilidad: oportunidad.probabilidad ?? 50,
          etapa: oportunidad.etapa ?? "lead",
          fecha_estimada_cierre: oportunidad.fecha_estimada_cierre ?? "",
          fecha_real_cierre: oportunidad.fecha_real_cierre ?? "",
          proxima_accion: oportunidad.proxima_accion ?? "",
          proxima_accion_fecha: oportunidad.proxima_accion_fecha ?? "",
          motivo_perdida: oportunidad.motivo_perdida,
          notes: oportunidad.notes ?? "",
          owner_id: oportunidad.owner_id,
        }
      : {
          partner_id: defaultPartnerId ?? "",
          cliente_final_name: "",
          probabilidad: 50,
          etapa: "lead",
          monto_estimado_usd: 0,
          comision_estimada_usd: 0,
        },
  });

  const probabilidad = watch("probabilidad") ?? 50;
  const etapaActual = watch("etapa");

  function onSubmit(raw: OportunidadFormValues) {
    const parsed = oportunidadSchema.parse(raw);
    // Sin motivo no mandamos la key: mantiene compatibilidad si la
    // migración 002 (columna motivo_perdida) todavía no corrió.
    const { motivo_perdida, ...rest } = parsed;
    const values = motivo_perdida ? { ...rest, motivo_perdida } : rest;
    if (isEdit) {
      updateOpp.mutate(
        { id: oportunidad.id, values },
        { onSuccess: () => router.push("/oportunidades") }
      );
    } else {
      createOpp.mutate(values, {
        onSuccess: () => router.push("/oportunidades"),
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      <FormSection title="Origen">
        <Field
          label="Partner que refiere"
          required
          error={errors.partner_id?.message}
        >
          <Controller
            control={control}
            name="partner_id"
            render={({ field }) => (
              <PartnerSelect
                value={field.value || null}
                onChange={field.onChange}
              />
            )}
          />
        </Field>
        <Field label="Owner" error={errors.owner_id?.message}>
          <Controller
            control={control}
            name="owner_id"
            render={({ field }) => (
              <Select
                value={field.value ?? NONE}
                onValueChange={(v) => field.onChange(v === NONE ? null : v)}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Sin owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Sin owner</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name ?? p.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field
          label="Cliente final"
          required
          error={errors.cliente_final_name?.message}
        >
          <Input
            {...register("cliente_final_name")}
            placeholder="Banco Ejemplo"
            className="bg-white"
          />
        </Field>
        <Field
          label="País del cliente"
          error={errors.cliente_final_country?.message}
        >
          <Controller
            control={control}
            name="cliente_final_country"
            render={({ field }) => (
              <Select
                value={field.value ?? NONE}
                onValueChange={(v) => field.onChange(v === NONE ? null : v)}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Sin definir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Sin definir</SelectItem>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field
          label="Componente"
          required
          error={errors.componente?.message}
          className="sm:col-span-2"
        >
          <Controller
            control={control}
            name="componente"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid gap-2 sm:grid-cols-2"
              >
                {(Object.keys(COMPONENTE_LABELS) as Componente[]).map((c) => (
                  <label
                    key={c}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                      field.value === c
                        ? "border-orange-vk bg-orange-soft/40"
                        : "border-line bg-white hover:border-orange-vk/40"
                    )}
                  >
                    <RadioGroupItem value={c} className="mt-0.5" />
                    <span>
                      <span className="block text-sm font-semibold text-ink">
                        {COMPONENTE_LABELS[c]}
                      </span>
                      <span className="block text-xs text-muted-warm">
                        {COMPONENTE_DESCRIPTIONS[c]}
                      </span>
                    </span>
                  </label>
                ))}
              </RadioGroup>
            )}
          />
        </Field>
      </FormSection>

      <FormSection title="Negocio">
        <Field
          label="Monto estimado (USD)"
          required
          error={errors.monto_estimado_usd?.message}
        >
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register("monto_estimado_usd")}
            className="bg-white"
          />
        </Field>
        <Field
          label="Comisión estimada (USD)"
          error={errors.comision_estimada_usd?.message}
        >
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register("comision_estimada_usd")}
            className="bg-white"
          />
        </Field>
        <Field
          label={`Probabilidad: ${probabilidad}%`}
          error={errors.probabilidad?.message}
          className="sm:col-span-2"
        >
          <Controller
            control={control}
            name="probabilidad"
            render={({ field }) => (
              <Slider
                value={[Number(field.value ?? 50)]}
                onValueChange={([v]) => field.onChange(v)}
                min={0}
                max={100}
                step={5}
                className="py-2"
              />
            )}
          />
        </Field>
        <Field label="Etapa" error={errors.etapa?.message}>
          <Controller
            control={control}
            name="etapa"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ETAPA_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field
          label="Cierre estimado"
          error={errors.fecha_estimada_cierre?.message}
        >
          <Input
            type="date"
            {...register("fecha_estimada_cierre")}
            className="bg-white"
          />
        </Field>
        <Field label="Cierre real" error={errors.fecha_real_cierre?.message}>
          <Input
            type="date"
            {...register("fecha_real_cierre")}
            className="bg-white"
          />
        </Field>
        {etapaActual === "perdida" && (
          <Field
            label="Motivo de pérdida"
            required
            error={errors.motivo_perdida?.message}
          >
            <Controller
              control={control}
              name="motivo_perdida"
              render={({ field }) => (
                <Select
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Elegí un motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MOTIVO_PERDIDA_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        )}
      </FormSection>

      <FormSection title="Seguimiento">
        <Field label="Próxima acción" error={errors.proxima_accion?.message}>
          <Input
            {...register("proxima_accion")}
            placeholder="Enviar propuesta, agendar demo…"
            className="bg-white"
          />
        </Field>
        <Field
          label="Fecha próxima acción"
          error={errors.proxima_accion_fecha?.message}
        >
          <Input
            type="date"
            {...register("proxima_accion_fecha")}
            className="bg-white"
          />
        </Field>
        <Field
          label="Notas"
          className="sm:col-span-2"
          error={errors.notes?.message}
        >
          <Textarea {...register("notes")} rows={3} className="bg-white" />
        </Field>
      </FormSection>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="font-semibold">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? "Guardar cambios" : "Crear oportunidad"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
