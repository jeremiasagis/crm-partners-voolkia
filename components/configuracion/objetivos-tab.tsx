"use client";

import { useState } from "react";
import { getQuarter, getYear } from "date-fns";
import { Loader2, Target } from "lucide-react";
import { useObjetivos, useUpsertObjetivo } from "@/hooks/use-objetivos";
import { formatMoney } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Field } from "@/components/shared/field";

export function ObjetivosTab() {
  const now = new Date();
  const [anio, setAnio] = useState(getYear(now));
  const [trimestre, setTrimestre] = useState(getQuarter(now));
  const [facturacion, setFacturacion] = useState("");
  const [deals, setDeals] = useState("");

  const { data: objetivos = [] } = useObjetivos();
  const upsert = useUpsertObjetivo();

  const anios = [getYear(now) - 1, getYear(now), getYear(now) + 1];

  async function handleSave() {
    if (facturacion !== "") {
      await upsert.mutateAsync({
        anio,
        trimestre,
        tipo: "facturacion_usd",
        valor: Number(facturacion),
      });
    }
    if (deals !== "") {
      await upsert.mutateAsync({
        anio,
        trimestre,
        tipo: "deals_ganados",
        valor: Number(deals),
      });
    }
    setFacturacion("");
    setDeals("");
  }

  const porPeriodo = new Map<
    string,
    { anio: number; trimestre: number; facturacion?: number; deals?: number }
  >();
  for (const o of objetivos) {
    const key = `${o.anio}-Q${o.trimestre}`;
    const entry =
      porPeriodo.get(key) ?? { anio: o.anio, trimestre: o.trimestre };
    if (o.tipo === "facturacion_usd") entry.facturacion = Number(o.valor);
    if (o.tipo === "deals_ganados") entry.deals = Number(o.valor);
    porPeriodo.set(key, entry);
  }
  const periodos = [...porPeriodo.values()].sort(
    (a, b) => b.anio - a.anio || b.trimestre - a.trimestre
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-line bg-white p-6">
        <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-ink">
          <Target className="size-4 text-orange-deep" />
          Definir objetivo trimestral
        </h3>
        <p className="mb-4 text-xs text-muted-warm">
          El avance contra estos objetivos se muestra en el Dashboard.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Año">
            <Select
              value={String(anio)}
              onValueChange={(v) => setAnio(Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anios.map((a) => (
                  <SelectItem key={a} value={String(a)}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Trimestre">
            <Select
              value={String(trimestre)}
              onValueChange={(v) => setTrimestre(Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((q) => (
                  <SelectItem key={q} value={String(q)}>
                    Q{q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Meta de facturación (USD)">
            <Input
              type="number"
              min="0"
              placeholder="ej: 400000"
              value={facturacion}
              onChange={(e) => setFacturacion(e.target.value)}
            />
          </Field>
          <Field label="Meta de deals ganados">
            <Input
              type="number"
              min="0"
              placeholder="ej: 5"
              value={deals}
              onChange={(e) => setDeals(e.target.value)}
            />
          </Field>
        </div>
        <Button
          className="mt-4"
          onClick={handleSave}
          disabled={upsert.isPending || (facturacion === "" && deals === "")}
        >
          {upsert.isPending && <Loader2 className="size-4 animate-spin" />}
          Guardar objetivo
        </Button>
      </div>

      <div className="rounded-xl border border-line bg-white p-6">
        <h3 className="mb-4 text-sm font-bold text-ink">Objetivos cargados</h3>
        {periodos.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-warm">
            Sin objetivos todavía.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Facturación</TableHead>
                <TableHead className="text-right">Deals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periodos.map((p) => (
                <TableRow key={`${p.anio}-${p.trimestre}`}>
                  <TableCell className="font-medium">
                    Q{p.trimestre} {p.anio}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.facturacion != null ? formatMoney(p.facturacion) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.deals ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
