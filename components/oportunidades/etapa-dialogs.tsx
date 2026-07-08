"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { PartyPopper, ThumbsDown } from "lucide-react";
import type { MotivoPerdida, OportunidadWithRels } from "@/lib/types";
import { MOTIVO_PERDIDA_LABELS } from "@/lib/utils/labels";
import { formatMoney } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/shared/field";

export function WinDialog({
  opp,
  onConfirm,
  onCancel,
}: {
  opp: OportunidadWithRels | null;
  onConfirm: (data: { fecha_real_cierre: string; comision: number }) => void;
  onCancel: () => void;
}) {
  const [fecha, setFecha] = useState("");
  const [comision, setComision] = useState("");

  useEffect(() => {
    if (opp) {
      setFecha(format(new Date(), "yyyy-MM-dd"));
      setComision(String(Number(opp.comision_estimada_usd ?? 0)));
    }
  }, [opp]);

  return (
    <Dialog open={!!opp} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PartyPopper className="size-5 text-orange-deep" />
            ¡Deal ganado!
          </DialogTitle>
          <DialogDescription>
            {opp?.cliente_final_name} ·{" "}
            {formatMoney(Number(opp?.monto_estimado_usd ?? 0))}. Confirmá los
            datos de cierre.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Fecha real de cierre" required>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </Field>
          <Field label="Comisión final (USD)" required>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={comision}
              onChange={(e) => setComision(e.target.value)}
            />
          </Field>
          <div className="flex gap-2 pt-1">
            <Button
              className="flex-1 font-semibold"
              disabled={!fecha}
              onClick={() =>
                onConfirm({
                  fecha_real_cierre: fecha,
                  comision: Number(comision) || 0,
                })
              }
            >
              Confirmar cierre 🎉
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LoseDialog({
  opp,
  onConfirm,
  onCancel,
}: {
  opp: OportunidadWithRels | null;
  onConfirm: (motivo: MotivoPerdida) => void;
  onCancel: () => void;
}) {
  const [motivo, setMotivo] = useState<MotivoPerdida | "">("");

  useEffect(() => {
    if (opp) setMotivo("");
  }, [opp]);

  return (
    <Dialog open={!!opp} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ThumbsDown className="size-5 text-red-600" />
            Marcar como perdida
          </DialogTitle>
          <DialogDescription>
            {opp?.cliente_final_name} — registrar el motivo nos permite medir
            por qué perdemos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Motivo de pérdida" required>
            <Select
              value={motivo || undefined}
              onValueChange={(v) => setMotivo(v as MotivoPerdida)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elegí un motivo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MOTIVO_PERDIDA_LABELS).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex gap-2 pt-1">
            <Button
              variant="destructive"
              className="flex-1 font-semibold"
              disabled={!motivo}
              onClick={() => motivo && onConfirm(motivo)}
            >
              Confirmar pérdida
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
