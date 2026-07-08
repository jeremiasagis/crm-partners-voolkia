"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  CalendarPlus,
  ExternalLink,
  Globe,
  Mail,
  Paperclip,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import { usePartner, useDeletePartner } from "@/hooks/use-partners";
import { useContactos, useDeleteContacto } from "@/hooks/use-contactos";
import { useOportunidades } from "@/hooks/use-oportunidades";
import { useActividades } from "@/hooks/use-actividades";
import type { ContactoWithPartner } from "@/lib/types";
import {
  ETAPA_COLORS,
  ETAPA_LABELS,
  FUNNEL_STAGE_LABELS,
  PARTNER_SIZE_LABELS,
  PARTNER_STATUS_COLORS,
  PARTNER_STATUS_LABELS,
  PARTNER_TYPE_LABELS,
  SOURCE_LABELS,
  TIER_COLORS,
  partnerDisplayName,
} from "@/lib/utils/labels";
import { countryFlag, countryName } from "@/lib/utils/countries";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ActividadTimeline } from "@/components/actividades/actividad-timeline";

export function PartnerDetail({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: partner, isLoading } = usePartner(id);
  const { data: contactos = [] } = useContactos(id);
  const { data: oportunidades = [] } = useOportunidades(id);
  const { data: actividades = [] } = useActividades({ partnerId: id });
  const deletePartner = useDeletePartner();
  const deleteContacto = useDeleteContacto();
  const [confirmPartner, setConfirmPartner] = useState(false);
  const [contactoToDelete, setContactoToDelete] =
    useState<ContactoWithPartner | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!partner) {
    return (
      <EmptyState
        icon={Building2}
        title="Partner no encontrado"
        description="Puede que haya sido eliminado."
        action={
          <Button asChild variant="outline">
            <Link href="/partners">Volver a Partners</Link>
          </Button>
        }
      />
    );
  }

  const defaultTab = searchParams.get("tab") ?? "contactos";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-white p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-extrabold text-ink">
              {partnerDisplayName(partner)}
            </h2>
            {partner.tier && (
              <Badge variant="outline" className={TIER_COLORS[partner.tier]}>
                Tier {partner.tier}
              </Badge>
            )}
            {partner.status && (
              <Badge
                variant="outline"
                className={PARTNER_STATUS_COLORS[partner.status]}
              >
                {PARTNER_STATUS_LABELS[partner.status]}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-warm">
            {partner.legal_name} · {countryFlag(partner.country_code)}{" "}
            {countryName(partner.country_code)}
            {partner.funnel_stage &&
              ` · Funnel: ${FUNNEL_STAGE_LABELS[partner.funnel_stage]}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/actividades/new?partner=${partner.id}`}>
              <CalendarPlus className="size-4" />
              Nueva actividad
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/partners/${partner.id}/edit`}>
              <Pencil className="size-4" />
              Editar
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-destructive hover:bg-red-50 hover:text-destructive"
            onClick={() => setConfirmPartner(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Info general */}
      <div className="grid gap-4 rounded-xl border border-line bg-white p-6 sm:grid-cols-2 lg:grid-cols-4">
        <InfoItem label="Tipo">
          {partner.partner_type
            ? PARTNER_TYPE_LABELS[partner.partner_type]
            : "—"}
        </InfoItem>
        <InfoItem label="Tamaño">
          {partner.size ? PARTNER_SIZE_LABELS[partner.size] : "—"}
        </InfoItem>
        <InfoItem label="Source">
          {partner.source ? SOURCE_LABELS[partner.source] : "—"}
        </InfoItem>
        <InfoItem label="Owner">{partner.owner?.full_name ?? "—"}</InfoItem>
        <InfoItem label="Website">
          {partner.website ? (
            <a
              href={partner.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-orange-deep hover:underline"
            >
              <Globe className="size-3.5" />
              {partner.website.replace(/^https?:\/\//, "")}
              <ExternalLink className="size-3" />
            </a>
          ) : (
            "—"
          )}
        </InfoItem>
        <InfoItem label="Firmado">{formatDate(partner.signed_at)}</InfoItem>
        <InfoItem label="Industrias" className="sm:col-span-2">
          {partner.industries?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {partner.industries.map((ind) => (
                <Badge
                  key={ind}
                  variant="outline"
                  className="border-line bg-cream text-muted-warm"
                >
                  {ind}
                </Badge>
              ))}
            </div>
          ) : (
            "—"
          )}
        </InfoItem>
        {partner.notes && (
          <InfoItem label="Notas" className="sm:col-span-2 lg:col-span-4">
            <p className="whitespace-pre-wrap text-sm">{partner.notes}</p>
          </InfoItem>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="contactos">
            Contactos ({contactos.length})
          </TabsTrigger>
          <TabsTrigger value="oportunidades">
            Oportunidades ({oportunidades.length})
          </TabsTrigger>
          <TabsTrigger value="actividades">
            Actividades ({actividades.length})
          </TabsTrigger>
          <TabsTrigger value="adjuntos">Adjuntos</TabsTrigger>
        </TabsList>

        <TabsContent value="contactos" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button asChild size="sm" variant="outline">
              <Link href={`/contactos/new?partner=${partner.id}`}>
                <Plus className="size-4" /> Nuevo contacto
              </Link>
            </Button>
          </div>
          {contactos.length === 0 ? (
            <EmptyState
              icon={UserRound}
              title="Sin contactos"
              description="Cargá el primer contacto de este partner."
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Decisor</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contactos.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.first_name} {c.last_name}
                      </TableCell>
                      <TableCell>{c.role ?? "—"}</TableCell>
                      <TableCell>
                        {c.email ? (
                          <a
                            href={`mailto:${c.email}`}
                            className="inline-flex items-center gap-1 text-orange-deep hover:underline"
                          >
                            <Mail className="size-3.5" /> {c.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {c.phone ? (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="size-3.5 text-muted-warm" />
                            {c.phone}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {c.is_decision_maker && (
                          <Badge className="bg-orange-soft text-orange-deep">
                            Decisor
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="size-7"
                          >
                            <Link href={`/contactos/${c.id}/edit`}>
                              <Pencil className="size-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive"
                            onClick={() => setContactoToDelete(c)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="oportunidades" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button asChild size="sm" variant="outline">
              <Link href={`/oportunidades/new?partner=${partner.id}`}>
                <Plus className="size-4" /> Nueva oportunidad
              </Link>
            </Button>
          </div>
          {oportunidades.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Sin oportunidades"
              description="Este partner todavía no refirió oportunidades."
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Cliente final</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Comisión</TableHead>
                    <TableHead>Próxima acción</TableHead>
                    <TableHead>Cierre est.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {oportunidades.map((o) => (
                    <TableRow
                      key={o.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/oportunidades/${o.id}/edit`)}
                    >
                      <TableCell className="font-medium">
                        {o.cliente_final_name}
                      </TableCell>
                      <TableCell>
                        {o.etapa && (
                          <Badge
                            variant="outline"
                            className={ETAPA_COLORS[o.etapa]}
                          >
                            {ETAPA_LABELS[o.etapa]}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatMoney(Number(o.monto_estimado_usd))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(Number(o.comision_estimada_usd ?? 0))}
                      </TableCell>
                      <TableCell className="max-w-48 truncate text-sm">
                        {o.proxima_accion ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(o.fecha_estimada_cierre)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="actividades" className="mt-4">
          <ActividadTimeline items={actividades} showPartner={false} />
        </TabsContent>

        <TabsContent value="adjuntos" className="mt-4">
          <EmptyState
            icon={Paperclip}
            title="Adjuntos"
            description="La carga de archivos llega en la Fase 3 con Supabase Storage."
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmPartner}
        onOpenChange={setConfirmPartner}
        title={`¿Eliminar ${partnerDisplayName(partner)}?`}
        description="Se eliminan también sus contactos, oportunidades y actividades. Esta acción no se puede deshacer."
        onConfirm={() => {
          deletePartner.mutate(partner.id, {
            onSuccess: () => router.push("/partners"),
          });
        }}
      />

      <ConfirmDialog
        open={!!contactoToDelete}
        onOpenChange={(o) => !o && setContactoToDelete(null)}
        title={`¿Eliminar a ${contactoToDelete?.first_name} ${contactoToDelete?.last_name}?`}
        description="Esta acción no se puede deshacer."
        onConfirm={() => {
          if (contactoToDelete) deleteContacto.mutate(contactoToDelete.id);
          setContactoToDelete(null);
        }}
      />
    </div>
  );
}

function InfoItem({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-warm">
        {label}
      </p>
      <div className="mt-1 text-sm text-ink">{children}</div>
    </div>
  );
}
