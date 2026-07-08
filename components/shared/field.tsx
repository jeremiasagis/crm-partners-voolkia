"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Wrapper de campo de formulario: label + control + error */
export function Field({
  label,
  error,
  required,
  children,
  className,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-[13px] font-medium text-ink">
        {label}
        {required && <span className="text-orange-deep"> *</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/** Título de sección dentro de un form */
export function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-white p-6">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-warm">
        {title}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
