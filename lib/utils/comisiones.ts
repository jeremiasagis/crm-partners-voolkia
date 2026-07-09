import type { Componente } from "@/lib/types";

/**
 * Modelo de comisiones Voolkia Partners.
 * El significado de monto_estimado_usd cambia según el componente.
 */
export const COMISION_CONFIG: Record<
  Componente,
  {
    rate: number;
    montoLabel: string;
    formula: string;
    pago: string;
  }
> = {
  "R-A": {
    rate: 1.2,
    montoLabel: "Sueldo bruto mensual del perfil (USD)",
    formula: "120% del sueldo bruto mensual",
    pago: "12 cuotas mensuales, contra cobro efectivo del cliente",
  },
  "R-B": {
    rate: 0.03,
    montoLabel: "Facturación anual al cliente (USD)",
    formula: "3% de la facturación anual",
    pago: "pago único al primer cobro efectivo",
  },
  T: {
    rate: 0.03,
    montoLabel: "Facturación anual al cliente (USD)",
    formula: "3% de la facturación anual",
    pago: "pago único al primer cobro efectivo",
  },
  P: {
    rate: 0.05,
    montoLabel: "Valor total del proyecto (USD)",
    formula: "5% del valor total del proyecto",
    pago: "por hito, contra cobro efectivo de cada hito",
  },
};

export function calcComision(
  componente: Componente,
  monto: number
): number {
  if (!Number.isFinite(monto) || monto < 0) return 0;
  return Math.round(monto * COMISION_CONFIG[componente].rate * 100) / 100;
}
