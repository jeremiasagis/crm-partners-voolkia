"use client";

import { Users } from "lucide-react";
import { useContacto } from "@/hooks/use-contactos";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ContactoForm } from "./contacto-form";

export function ContactoEdit({ id }: { id: string }) {
  const { data: contacto, isLoading } = useContacto(id);

  if (isLoading) return <Skeleton className="h-96 w-full max-w-3xl" />;
  if (!contacto) {
    return (
      <EmptyState
        icon={Users}
        title="Contacto no encontrado"
        description="Puede que haya sido eliminado."
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-ink">
        Editar {contacto.first_name} {contacto.last_name}
      </h2>
      <ContactoForm contacto={contacto} />
    </div>
  );
}
