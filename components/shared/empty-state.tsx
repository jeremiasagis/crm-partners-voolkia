import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-white/60 px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-4 rounded-full bg-orange-soft p-3.5">
        <Icon className="size-6 text-orange-deep" />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-warm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
