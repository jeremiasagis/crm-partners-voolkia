"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import {
  actividadSchema,
  type ActividadFormValues,
} from "@/lib/schemas/actividad";
import { useCreateActividad } from "@/hooks/use-actividades";
import { useContactos } from "@/hooks/use-contactos";
import { useOportunidades } from "@/hooks/use-oportunidades";
import { useCurrentUser } from "@/hooks/use-profiles";
import type { TipoActividad } from "@/lib/types";
import { TIPO_ACTIVIDAD_LABELS } from "@/lib/utils/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FormSection } from "@/components/shared/field";
import { PartnerSelect } from "@/components/shared/partner-select";
import { TIPO_ICONS } from "./actividad-timeline";
import { cn } from "@/lib/utils";

const NONE = "__none__";

export function ActividadForm({
  defaultPartnerId,
}: {
  defaultPartnerId?: string;
}) {
  const router = useRouter();
  const createActividad = useCreateActividad();
  const { data: currentUser } = useCurrentUser();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ActividadFormValues>({
    resolver: zodResolver(actividadSchema),
    defaultValues: {
      tipo: "llamada",
      fecha: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      partner_id: defaultPartnerId ?? "",
      titulo: "",
    },
  });

  const partnerId = watch("partner_id");
  const { data: contactos = [] } = useContactos(partnerId || undefined);
  const { data: oportunidades = [] } = useOportunidades(partnerId || undefined);

  function onSubmit(raw: ActividadFormValues) {
    const values = actividadSchema.parse(raw);
    createActividad.mutate(
      {
        ...values,
        fecha: new Date(values.fecha).toISOString(),
        owner_id: currentUser?.user.id ?? null,
      },
      {
        onSuccess: () =>
          router.push(`/partners/${values.partner_id}?tab=actividades`),
      }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      <FormSection title="Actividad">
        <Field
          label="Tipo"
          required
          error={errors.tipo?.message}
          className="sm:col-span-2"
        >
          <Controller
            control={control}
            name="tipo"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {(
                  Object.keys(TIPO_ACTIVIDAD_LABELS) as TipoActividad[]
                ).map((tipo) => {
                  const Icon = TIPO_ICONS[tipo];
                  const selected = field.value === tipo;
                  return (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => field.onChange(tipo)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                        selected
                          ? "border-orange-vk bg-orange-soft font-semibold text-orange-deep"
                          : "border-line bg-white text-muted-warm hover:border-orange-vk/40"
                      )}
                    >
                      <Icon className="size-4" />
                      {TIPO_ACTIVIDAD_LABELS[tipo]}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </Field>
        <Field label="Fecha" required error={errors.fecha?.message}>
          <Input
            type="datetime-local"
            {...register("fecha")}
            className="bg-white"
          />
        </Field>
        <Field label="Partner" required error={errors.partner_id?.message}>
          <Controller
            control={control}
            name="partner_id"
            render={({ field }) => (
              <PartnerSelect
                value={field.value || null}
                onChange={(id) => {
                  field.onChange(id);
                  setValue("contacto_id", null);
                  setValue("oportunidad_id", null);
                }}
              />
            )}
          />
        </Field>
        <Field label="Contacto (opcional)" error={errors.contacto_id?.message}>
          <Controller
            control={control}
            name="contacto_id"
            render={({ field }) => (
              <Select
                value={field.value ?? NONE}
                onValueChange={(v) => field.onChange(v === NONE ? null : v)}
                disabled={!partnerId}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue
                    placeholder={partnerId ? "Sin contacto" : "Elegí un partner primero"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Sin contacto</SelectItem>
                  {contactos.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field
          label="Oportunidad (opcional)"
          error={errors.oportunidad_id?.message}
        >
          <Controller
            control={control}
            name="oportunidad_id"
            render={({ field }) => (
              <Select
                value={field.value ?? NONE}
                onValueChange={(v) => field.onChange(v === NONE ? null : v)}
                disabled={!partnerId}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue
                    placeholder={partnerId ? "Sin oportunidad" : "Elegí un partner primero"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Sin oportunidad</SelectItem>
                  {oportunidades.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.cliente_final_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field
          label="Título"
          required
          error={errors.titulo?.message}
          className="sm:col-span-2"
        >
          <Input
            {...register("titulo")}
            placeholder="Reunión de seguimiento con…"
            className="bg-white"
          />
        </Field>
        <Field
          label="Descripción"
          className="sm:col-span-2"
          error={errors.descripcion?.message}
        >
          <Textarea
            {...register("descripcion")}
            rows={4}
            placeholder="Qué se habló, acuerdos, contexto…"
            className="bg-white"
          />
        </Field>
      </FormSection>

      <FormSection title="Próxima acción (opcional)">
        <Field label="Próxima acción" error={errors.proxima_accion?.message}>
          <Input
            {...register("proxima_accion")}
            placeholder="Enviar propuesta…"
            className="bg-white"
          />
        </Field>
        <Field label="Fecha" error={errors.proxima_accion_fecha?.message}>
          <Input
            type="date"
            {...register("proxima_accion_fecha")}
            className="bg-white"
          />
        </Field>
      </FormSection>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={createActividad.isPending}
          className="font-semibold"
        >
          {createActividad.isPending && (
            <Loader2 className="size-4 animate-spin" />
          )}
          Registrar actividad
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
