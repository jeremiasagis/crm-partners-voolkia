"use client";

import { useForm } from "react-hook-form";
import { Loader2, Send } from "lucide-react";
import { useCreateSolicitud } from "@/hooks/use-portal";
import { COUNTRIES } from "@/lib/utils/countries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/shared/field";

type FormValues = {
  cliente_final_name: string;
  cliente_final_country: string;
  contacto_nombre: string;
  contacto_email: string;
  contacto_phone: string;
  descripcion: string;
  monto_estimado_usd: string;
};

export function ReferirLeadDialog({
  open,
  onOpenChange,
  partnerId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string;
}) {
  const createSolicitud = useCreateSolicitud();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      cliente_final_name: "",
      cliente_final_country: "",
      contacto_nombre: "",
      contacto_email: "",
      contacto_phone: "",
      descripcion: "",
      monto_estimado_usd: "",
    },
  });

  const country = watch("cliente_final_country");

  function onSubmit(values: FormValues) {
    createSolicitud.mutate(
      {
        partner_id: partnerId,
        cliente_final_name: values.cliente_final_name,
        cliente_final_country: values.cliente_final_country || null,
        contacto_nombre: values.contacto_nombre || null,
        contacto_email: values.contacto_email || null,
        contacto_phone: values.contacto_phone || null,
        descripcion: values.descripcion || null,
        monto_estimado_usd: values.monto_estimado_usd
          ? Number(values.monto_estimado_usd)
          : null,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-4 text-orange-deep" />
            Referir un lead a Voolkia
          </DialogTitle>
          <DialogDescription>
            Contanos lo esencial. El equipo de Voolkia lo revisa y te
            confirmamos por acá.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Empresa / cliente final"
              required
              error={errors.cliente_final_name?.message}
            >
              <Input
                {...register("cliente_final_name", {
                  required: "Contanos qué empresa es",
                  minLength: { value: 2, message: "Muy corto" },
                })}
                placeholder="Banco Ejemplo"
              />
            </Field>
            <Field label="País">
              <Select
                value={country || undefined}
                onValueChange={(v) => setValue("cliente_final_country", v)}
              >
                <SelectTrigger className="w-full">
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
            </Field>
            <Field label="Contacto en la empresa">
              <Input
                {...register("contacto_nombre")}
                placeholder="Nombre y apellido"
              />
            </Field>
            <Field label="Email del contacto">
              <Input
                type="email"
                {...register("contacto_email")}
                placeholder="nombre@empresa.com"
              />
            </Field>
            <Field label="Teléfono del contacto">
              <Input {...register("contacto_phone")} placeholder="+54 9 …" />
            </Field>
            <Field label="Monto estimado (USD, opcional)">
              <Input
                type="number"
                min="0"
                {...register("monto_estimado_usd")}
                placeholder="50000"
              />
            </Field>
          </div>
          <Field label="Contexto" error={errors.descripcion?.message}>
            <Textarea
              {...register("descripcion")}
              rows={3}
              placeholder="Qué necesitan, tiempos, con quién hablamos…"
            />
          </Field>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={createSolicitud.isPending}
              className="flex-1 font-semibold"
            >
              {createSolicitud.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Enviar lead
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
