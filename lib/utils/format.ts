import { format as formatDateFns, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

/** Formatea montos USD con separadores es-AR: US$ 12.500,00 */
export function formatMoney(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

/** 07/07/2026 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return formatDateFns(new Date(date), "dd/MM/yyyy", { locale: es });
}

/** 07 jul 2026, 14:30 */
export function formatDateTime(
  date: string | Date | null | undefined
): string {
  if (!date) return "—";
  return formatDateFns(new Date(date), "dd MMM yyyy, HH:mm", { locale: es });
}

/** hace 3 días */
export function formatRelative(
  date: string | Date | null | undefined
): string {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { locale: es, addSuffix: true });
}
