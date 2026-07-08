"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { partnerSchema, type PartnerFormValues } from "@/lib/schemas/partner";
import { useCreatePartner, useUpdatePartner } from "@/hooks/use-partners";
import { useProfiles } from "@/hooks/use-profiles";
import type { Partner } from "@/lib/types";
import {
  FUNNEL_STAGE_LABELS,
  PARTNER_SIZE_LABELS,
  PARTNER_STATUS_LABELS,
  PARTNER_TYPE_LABELS,
  SOURCE_LABELS,
} from "@/lib/utils/labels";
import { COUNTRIES, INDUSTRIES } from "@/lib/utils/countries";
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
import { cn } from "@/lib/utils";

const NONE = "__none__";

function SelectField({
  value,
  onChange,
  options,
  placeholder = "Sin definir",
}: {
  value: string | null | undefined;
  onChange: (v: string | null) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <Select
      value={value ?? NONE}
      onValueChange={(v) => onChange(v === NONE ? null : v)}
    >
      <SelectTrigger className="w-full bg-white">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PartnerForm({ partner }: { partner?: Partner }) {
  const router = useRouter();
  const { data: profiles = [] } = useProfiles();
  const createPartner = useCreatePartner();
  const updatePartner = useUpdatePartner();
  const isEdit = !!partner;
  const pending = createPartner.isPending || updatePartner.isPending;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: partner
      ? {
          legal_name: partner.legal_name,
          commercial_name: partner.commercial_name ?? "",
          country_code: partner.country_code,
          partner_type: partner.partner_type,
          size: partner.size,
          website: partner.website ?? "",
          industries: partner.industries ?? [],
          tier: partner.tier,
          status: partner.status,
          funnel_stage: partner.funnel_stage,
          source: partner.source,
          owner_id: partner.owner_id,
          notes: partner.notes ?? "",
          signed_at: partner.signed_at?.slice(0, 10) ?? "",
        }
      : {
          legal_name: "",
          commercial_name: "",
          country_code: "",
          industries: [],
          status: "prospect",
          funnel_stage: "prospect",
        },
  });

  function onSubmit(raw: PartnerFormValues) {
    const values = partnerSchema.parse(raw);
    const payload = {
      ...values,
      signed_at: values.signed_at
        ? new Date(values.signed_at + "T00:00:00").toISOString()
        : null,
    };
    if (isEdit) {
      updatePartner.mutate(
        { id: partner.id, values: payload },
        { onSuccess: () => router.push(`/partners/${partner.id}`) }
      );
    } else {
      createPartner.mutate(payload, {
        onSuccess: (created) => router.push(`/partners/${created.id}`),
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      <FormSection title="Identidad">
        <Field label="Razón social" required error={errors.legal_name?.message}>
          <Input {...register("legal_name")} placeholder="Acme Consulting S.R.L." className="bg-white" />
        </Field>
        <Field label="Nombre comercial" error={errors.commercial_name?.message}>
          <Input {...register("commercial_name")} placeholder="Acme" className="bg-white" />
        </Field>
        <Field label="País" required error={errors.country_code?.message}>
          <Controller
            control={control}
            name="country_code"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Elegí un país" />
                </SelectTrigger>
                <SelectContent>
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
        <Field label="Website" error={errors.website?.message}>
          <Input {...register("website")} placeholder="https://…" className="bg-white" />
        </Field>
      </FormSection>

      <FormSection title="Clasificación">
        <Field label="Tipo de partner" error={errors.partner_type?.message}>
          <Controller
            control={control}
            name="partner_type"
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={field.onChange}
                options={Object.entries(PARTNER_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
              />
            )}
          />
        </Field>
        <Field label="Tamaño" error={errors.size?.message}>
          <Controller
            control={control}
            name="size"
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={field.onChange}
                options={Object.entries(PARTNER_SIZE_LABELS).map(([value, label]) => ({ value, label }))}
              />
            )}
          />
        </Field>
        <Field label="Tier" error={errors.tier?.message}>
          <Controller
            control={control}
            name="tier"
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={field.onChange}
                options={["A", "B", "C"].map((t) => ({ value: t, label: `Tier ${t}` }))}
              />
            )}
          />
        </Field>
        <Field label="Source" error={errors.source?.message}>
          <Controller
            control={control}
            name="source"
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={field.onChange}
                options={Object.entries(SOURCE_LABELS).map(([value, label]) => ({ value, label }))}
              />
            )}
          />
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={field.onChange}
                options={Object.entries(PARTNER_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
              />
            )}
          />
        </Field>
        <Field label="Etapa del funnel" error={errors.funnel_stage?.message}>
          <Controller
            control={control}
            name="funnel_stage"
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={field.onChange}
                options={Object.entries(FUNNEL_STAGE_LABELS).map(([value, label]) => ({ value, label }))}
              />
            )}
          />
        </Field>
        <Field label="Industrias de foco" className="sm:col-span-2">
          <Controller
            control={control}
            name="industries"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((ind) => {
                  const selected = (field.value ?? []).includes(ind);
                  return (
                    <button
                      key={ind}
                      type="button"
                      onClick={() =>
                        field.onChange(
                          selected
                            ? (field.value ?? []).filter((i) => i !== ind)
                            : [...(field.value ?? []), ind]
                        )
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 text-sm transition-colors",
                        selected
                          ? "border-orange-vk bg-orange-soft font-medium text-orange-deep"
                          : "border-line bg-white text-muted-warm hover:border-orange-vk/40"
                      )}
                    >
                      {ind}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </Field>
      </FormSection>

      <FormSection title="Ownership">
        <Field label="Owner" error={errors.owner_id?.message}>
          <Controller
            control={control}
            name="owner_id"
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={field.onChange}
                placeholder="Sin owner"
                options={profiles.map((p) => ({
                  value: p.id,
                  label: p.full_name ?? p.email ?? "—",
                }))}
              />
            )}
          />
        </Field>
        <Field label="Fecha de firma" error={errors.signed_at?.message}>
          <Input type="date" {...register("signed_at")} className="bg-white" />
        </Field>
        <Field label="Notas" className="sm:col-span-2" error={errors.notes?.message}>
          <Textarea
            {...register("notes")}
            rows={4}
            placeholder="Contexto, acuerdos, particularidades…"
            className="bg-white"
          />
        </Field>
      </FormSection>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="font-semibold">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? "Guardar cambios" : "Crear partner"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
