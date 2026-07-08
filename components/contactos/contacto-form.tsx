"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  contactoSchema,
  type ContactoFormValues,
} from "@/lib/schemas/contacto";
import { useCreateContacto, useUpdateContacto } from "@/hooks/use-contactos";
import type { Contacto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormSection } from "@/components/shared/field";
import { PartnerSelect } from "@/components/shared/partner-select";

export function ContactoForm({
  contacto,
  defaultPartnerId,
}: {
  contacto?: Contacto;
  defaultPartnerId?: string;
}) {
  const router = useRouter();
  const createContacto = useCreateContacto();
  const updateContacto = useUpdateContacto();
  const isEdit = !!contacto;
  const pending = createContacto.isPending || updateContacto.isPending;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ContactoFormValues>({
    resolver: zodResolver(contactoSchema),
    defaultValues: contacto
      ? {
          partner_id: contacto.partner_id,
          first_name: contacto.first_name,
          last_name: contacto.last_name,
          role: contacto.role ?? "",
          email: contacto.email ?? "",
          phone: contacto.phone ?? "",
          linkedin: contacto.linkedin ?? "",
          is_decision_maker: contacto.is_decision_maker ?? false,
          notes: contacto.notes ?? "",
        }
      : {
          partner_id: defaultPartnerId ?? "",
          first_name: "",
          last_name: "",
          is_decision_maker: false,
        },
  });

  function onSubmit(raw: ContactoFormValues) {
    const values = contactoSchema.parse(raw);
    if (isEdit) {
      updateContacto.mutate(
        { id: contacto.id, values },
        {
          onSuccess: () =>
            router.push(`/partners/${values.partner_id}?tab=contactos`),
        }
      );
    } else {
      createContacto.mutate(values, {
        onSuccess: () =>
          router.push(`/partners/${values.partner_id}?tab=contactos`),
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      <FormSection title="Datos del contacto">
        <Field
          label="Partner"
          required
          error={errors.partner_id?.message}
          className="sm:col-span-2"
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
        <Field label="Nombre" required error={errors.first_name?.message}>
          <Input {...register("first_name")} className="bg-white" />
        </Field>
        <Field label="Apellido" required error={errors.last_name?.message}>
          <Input {...register("last_name")} className="bg-white" />
        </Field>
        <Field label="Cargo" error={errors.role?.message}>
          <Input
            {...register("role")}
            placeholder="CEO, Head of Sales…"
            className="bg-white"
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input
            {...register("email")}
            type="email"
            placeholder="nombre@empresa.com"
            className="bg-white"
          />
        </Field>
        <Field label="Teléfono" error={errors.phone?.message}>
          <Input
            {...register("phone")}
            placeholder="+54 9 11 …"
            className="bg-white"
          />
        </Field>
        <Field label="LinkedIn" error={errors.linkedin?.message}>
          <Input
            {...register("linkedin")}
            placeholder="https://linkedin.com/in/…"
            className="bg-white"
          />
        </Field>
        <Field label="" className="sm:col-span-2">
          <Controller
            control={control}
            name="is_decision_maker"
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
                Es decisor de compra
              </label>
            )}
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
          {isEdit ? "Guardar cambios" : "Crear contacto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
