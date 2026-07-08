"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser, useProfiles } from "@/hooks/use-profiles";
import { usePartners } from "@/hooks/use-partners";
import { partnerDisplayName } from "@/lib/utils/labels";
import { createUserAction } from "@/app/(app)/configuracion/actions";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES, INDUSTRIES } from "@/lib/utils/countries";
import {
  COMPONENTE_DESCRIPTIONS,
  COMPONENTE_LABELS,
} from "@/lib/utils/labels";
import type { Componente } from "@/lib/types";
import { formatDate } from "@/lib/utils/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Field } from "@/components/shared/field";
import { ObjetivosTab } from "./objetivos-tab";
import { ImportarTab } from "./importar-tab";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ── Tab Usuarios ─────────────────────────────── */

type NewUserValues = {
  full_name: string;
  email: string;
  password: string;
  role: "admin" | "partner";
  partner_id: string;
};

function UsuariosTab() {
  const { data: profiles = [], isLoading } = useProfiles();
  const { data: partners = [] } = usePartners();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NewUserValues>({
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      role: "admin",
      partner_id: "",
    },
  });

  const role = watch("role");
  const partnerId = watch("partner_id");

  async function onSubmit(values: NewUserValues) {
    if (values.role === "partner" && !values.partner_id) {
      toast.error("Elegí a qué partner pertenece el usuario");
      return;
    }
    setPending(true);
    const result = await createUserAction({
      ...values,
      partner_id: values.role === "partner" ? values.partner_id : null,
    });
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(
      values.role === "partner"
        ? `Usuario del portal creado: ${values.email}`
        : `Usuario ${values.email} creado`
    );
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
    reset();
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-warm">
          Los usuarios nuevos entran con la contraseña que definas acá y ya
          quedan confirmados.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" /> Nuevo usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear usuario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field
                label="Nombre completo"
                required
                error={errors.full_name?.message}
              >
                <Input
                  {...register("full_name", {
                    required: "Ingresá el nombre",
                    minLength: { value: 2, message: "Muy corto" },
                  })}
                  placeholder="Nombre Apellido"
                />
              </Field>
              <Field label="Email" required error={errors.email?.message}>
                <Input
                  type="email"
                  {...register("email", { required: "Ingresá el email" })}
                  placeholder="nombre@voolkia.com"
                />
              </Field>
              <Field
                label="Contraseña inicial"
                required
                error={errors.password?.message}
              >
                <Input
                  type="password"
                  {...register("password", {
                    required: "Ingresá una contraseña",
                    minLength: { value: 8, message: "Mínimo 8 caracteres" },
                  })}
                  placeholder="Mínimo 8 caracteres"
                />
              </Field>
              <Field label="Tipo de usuario" required>
                <Select
                  value={role}
                  onValueChange={(v) =>
                    setValue("role", v as "admin" | "partner")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      Interno (Voolkia — acceso total)
                    </SelectItem>
                    <SelectItem value="partner">
                      Partner (solo su portal)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {role === "partner" && (
                <Field label="Partner al que pertenece" required>
                  <Select
                    value={partnerId || undefined}
                    onValueChange={(v) => setValue("partner_id", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Elegí el partner" />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {partnerDisplayName(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
              <Button type="submit" disabled={pending} className="w-full">
                {pending && <Loader2 className="size-4 animate-spin" />}
                Crear usuario
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Alta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  Cargando…
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-brand text-[10px] font-bold text-white">
                          {initials(p.full_name ?? p.email ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {p.full_name ?? "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{p.email}</TableCell>
                  <TableCell>
                    {p.role === "partner" ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        Portal Partner
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-soft text-orange-deep">
                        <ShieldCheck className="size-3" />
                        Interno
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.country_code ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(p.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ── Tab Mi perfil ────────────────────────────── */

type PerfilValues = { full_name: string; phone: string; country_code: string };

function PerfilTab() {
  const { data: current } = useCurrentUser();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const profile = current?.profile;

  const { register, handleSubmit, setValue, watch } = useForm<PerfilValues>({
    values: {
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      country_code: profile?.country_code ?? "",
    },
  });

  const country = watch("country_code");

  async function onSubmit(values: PerfilValues) {
    if (!current?.user) return;
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.full_name || null,
        phone: values.phone || null,
        country_code: values.country_code || null,
      })
      .eq("id", current.user.id);
    setPending(false);
    if (error) {
      toast.error(`No se pudo guardar: ${error.message}`);
      return;
    }
    toast.success("Perfil actualizado");
    queryClient.invalidateQueries({ queryKey: ["current-user"] });
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md space-y-4 rounded-xl border border-line bg-white p-6"
    >
      <Field label="Email">
        <Input value={current?.user.email ?? ""} disabled className="bg-cream" />
      </Field>
      <Field label="Nombre completo">
        <Input {...register("full_name")} placeholder="Nombre Apellido" />
      </Field>
      <Field label="Teléfono">
        <Input {...register("phone")} placeholder="+54 9 11 …" />
      </Field>
      <Field label="País">
        <Select
          value={country || undefined}
          onValueChange={(v) => setValue("country_code", v)}
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
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Guardar cambios
      </Button>
    </form>
  );
}

/* ── Tab Datos maestros ───────────────────────── */

function DatosTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-line bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-ink">
          Países ({COUNTRIES.length})
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {COUNTRIES.map((c) => (
            <Badge
              key={c.code}
              variant="outline"
              className="border-line bg-cream text-muted-warm"
            >
              {c.flag} {c.name}
            </Badge>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-line bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-ink">Componentes</h3>
        <ul className="space-y-2">
          {(Object.keys(COMPONENTE_LABELS) as Componente[]).map((c) => (
            <li key={c} className="text-sm">
              <span className="font-semibold text-ink">
                {COMPONENTE_LABELS[c]}
              </span>
              <p className="text-xs text-muted-warm">
                {COMPONENTE_DESCRIPTIONS[c]}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-line bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-ink">
          Industrias ({INDUSTRIES.length})
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {INDUSTRIES.map((ind) => (
            <Badge
              key={ind}
              variant="outline"
              className="border-line bg-cream text-muted-warm"
            >
              {ind}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Tabs raíz ────────────────────────────────── */

export function ConfigTabs() {
  const { data: current } = useCurrentUser();
  const isAdmin = current?.profile?.role === "admin";

  return (
    <Tabs defaultValue={isAdmin ? "usuarios" : "perfil"}>
      <TabsList>
        {isAdmin && <TabsTrigger value="usuarios">Usuarios</TabsTrigger>}
        <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
        <TabsTrigger value="importar">Importar</TabsTrigger>
        <TabsTrigger value="perfil">Mi perfil</TabsTrigger>
        <TabsTrigger value="datos">Datos maestros</TabsTrigger>
      </TabsList>
      {isAdmin && (
        <TabsContent value="usuarios" className="mt-4">
          <UsuariosTab />
        </TabsContent>
      )}
      <TabsContent value="objetivos" className="mt-4">
        <ObjetivosTab />
      </TabsContent>
      <TabsContent value="importar" className="mt-4">
        <ImportarTab />
      </TabsContent>
      <TabsContent value="perfil" className="mt-4">
        <PerfilTab />
      </TabsContent>
      <TabsContent value="datos" className="mt-4">
        <DatosTab />
      </TabsContent>
    </Tabs>
  );
}
