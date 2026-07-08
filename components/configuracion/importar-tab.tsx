"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Download,
  FileUp,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { usePartners } from "@/hooks/use-partners";
import { parseCsv, csvToObjects } from "@/lib/utils/csv-parse";
import { COUNTRIES } from "@/lib/utils/countries";
import type { ContactoInsert, PartnerInsert } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

type Entity = "partners" | "contactos";

const TEMPLATES: Record<Entity, { headers: string[]; example: string[] }> = {
  partners: {
    headers: [
      "legal_name",
      "commercial_name",
      "country_code",
      "partner_type",
      "size",
      "tier",
      "status",
      "source",
      "website",
      "industries",
      "notes",
    ],
    example: [
      "Acme Consulting S.R.L.",
      "Acme",
      "AR",
      "consultora_boutique",
      "boutique_2_10",
      "B",
      "prospect",
      "referido",
      "https://acme.com",
      "Tech|Banca",
      "Nota opcional",
    ],
  },
  contactos: {
    headers: [
      "partner_legal_name",
      "first_name",
      "last_name",
      "role",
      "email",
      "phone",
      "linkedin",
      "is_decision_maker",
      "notes",
    ],
    example: [
      "Acme Consulting S.R.L.",
      "Juan",
      "Pérez",
      "CEO",
      "juan@acme.com",
      "+54 9 11 5555-0000",
      "https://linkedin.com/in/juanperez",
      "si",
      "",
    ],
  },
};

const PARTNER_TYPES = ["agencia_rys_it", "consultora_boutique", "headhunter", "otro"];
const SIZES = ["unipersonal", "boutique_2_10", "empresa_10_50", "empresa_50_plus"];
const STATUSES = ["prospect", "en_proceso_firma", "activo", "pausado", "baja"];
const SOURCES = ["referido", "outbound", "inbound", "evento", "otro"];

type PreviewRow = {
  data: Record<string, string>;
  errors: string[];
};

export function ImportarTab() {
  const queryClient = useQueryClient();
  const { data: partners = [] } = usePartners();
  const [entity, setEntity] = useState<Entity>("partners");
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function downloadTemplate() {
    const t = TEMPLATES[entity];
    const csv = [t.headers.join(","), t.example.join(",")].join("\r\n");
    const blob = new Blob([String.fromCharCode(0xfeff) + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `plantilla-${entity}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function validateRow(data: Record<string, string>): string[] {
    const errors: string[] = [];
    if (entity === "partners") {
      if (!data.legal_name) errors.push("legal_name vacío");
      if (!data.country_code) errors.push("country_code vacío");
      else if (!COUNTRIES.some((c) => c.code === data.country_code.toUpperCase()))
        errors.push(`país inválido: ${data.country_code}`);
      if (data.partner_type && !PARTNER_TYPES.includes(data.partner_type))
        errors.push(`partner_type inválido`);
      if (data.size && !SIZES.includes(data.size)) errors.push("size inválido");
      if (data.tier && !["A", "B", "C"].includes(data.tier.toUpperCase()))
        errors.push("tier inválido (A/B/C)");
      if (data.status && !STATUSES.includes(data.status))
        errors.push("status inválido");
      if (data.source && !SOURCES.includes(data.source))
        errors.push("source inválido");
    } else {
      if (!data.partner_legal_name) errors.push("partner_legal_name vacío");
      else {
        const found = partners.some(
          (p) =>
            p.legal_name.toLowerCase() ===
              data.partner_legal_name.toLowerCase() ||
            (p.commercial_name ?? "").toLowerCase() ===
              data.partner_legal_name.toLowerCase()
        );
        if (!found)
          errors.push(`partner no encontrado: "${data.partner_legal_name}"`);
      }
      if (!data.first_name) errors.push("first_name vacío");
      if (!data.last_name) errors.push("last_name vacío");
      if (data.email && !/^\S+@\S+\.\S+$/.test(data.email))
        errors.push("email inválido");
    }
    return errors;
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    setDone(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = csvToObjects(parseCsv(String(reader.result)));
      if (parsed.length === 0) {
        toast.error("El archivo no tiene filas de datos");
        return;
      }
      setRows(parsed.map((data) => ({ data, errors: validateRow(data) })));
    };
    reader.readAsText(file, "utf-8");
  }

  async function handleImport() {
    const valid = rows.filter((r) => r.errors.length === 0);
    if (valid.length === 0) return;
    setImporting(true);
    const supabase = createClient();

    try {
      if (entity === "partners") {
        const payload: PartnerInsert[] = valid.map(({ data }) => ({
          legal_name: data.legal_name,
          commercial_name: data.commercial_name || null,
          country_code: data.country_code.toUpperCase(),
          partner_type: (data.partner_type || null) as PartnerInsert["partner_type"],
          size: (data.size || null) as PartnerInsert["size"],
          tier: (data.tier?.toUpperCase() || null) as PartnerInsert["tier"],
          status: (data.status || "prospect") as PartnerInsert["status"],
          funnel_stage: "prospect",
          source: (data.source || null) as PartnerInsert["source"],
          website: data.website || null,
          industries: data.industries
            ? data.industries.split("|").map((s) => s.trim()).filter(Boolean)
            : [],
          notes: data.notes || null,
        }));
        const { error } = await supabase.from("partners").insert(payload);
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ["partners"] });
      } else {
        const payload: ContactoInsert[] = valid.map(({ data }) => {
          const partner = partners.find(
            (p) =>
              p.legal_name.toLowerCase() ===
                data.partner_legal_name.toLowerCase() ||
              (p.commercial_name ?? "").toLowerCase() ===
                data.partner_legal_name.toLowerCase()
          )!;
          return {
            partner_id: partner.id,
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role || null,
            email: data.email || null,
            phone: data.phone || null,
            linkedin: data.linkedin || null,
            is_decision_maker: ["si", "sí", "true", "1", "yes"].includes(
              data.is_decision_maker?.toLowerCase() ?? ""
            ),
            notes: data.notes || null,
          };
        });
        const { error } = await supabase.from("contactos").insert(payload);
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ["contactos"] });
      }
      setDone(valid.length);
      setRows([]);
      setFileName("");
      toast.success(`${valid.length} registros importados`);
    } catch (e) {
      toast.error(`Error al importar: ${(e as Error).message}`);
    } finally {
      setImporting(false);
    }
  }

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const headers = TEMPLATES[entity].headers;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-white p-5">
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-ink">Qué importar</p>
          <Select
            value={entity}
            onValueChange={(v) => {
              setEntity(v as Entity);
              setRows([]);
              setFileName("");
              setDone(null);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="partners">Partners</SelectItem>
              <SelectItem value="contactos">Contactos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="size-4" />
          Descargar plantilla
        </Button>
        <Button onClick={() => inputRef.current?.click()}>
          <FileUp className="size-4" />
          Elegir archivo CSV
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {fileName && (
          <span className="text-sm text-muted-warm">{fileName}</span>
        )}
      </div>

      {done != null && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="size-4" />
          {done} registros importados correctamente.
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-warm">
              <span className="font-semibold text-emerald-700">
                {validCount} válidas
              </span>
              {rows.length - validCount > 0 && (
                <>
                  {" · "}
                  <span className="font-semibold text-red-600">
                    {rows.length - validCount} con errores (se omiten)
                  </span>
                </>
              )}
            </p>
            <Button
              onClick={handleImport}
              disabled={validCount === 0 || importing}
              className="font-semibold"
            >
              {importing && <Loader2 className="size-4 animate-spin" />}
              Importar {validCount} registros
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-8" />
                  {headers.slice(0, 6).map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                  <TableHead>Errores</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow
                    key={i}
                    className={cn(r.errors.length > 0 && "bg-red-50/60")}
                  >
                    <TableCell>
                      {r.errors.length === 0 ? (
                        <CheckCircle2 className="size-4 text-emerald-600" />
                      ) : (
                        <XCircle className="size-4 text-red-500" />
                      )}
                    </TableCell>
                    {headers.slice(0, 6).map((h) => (
                      <TableCell key={h} className="max-w-40 truncate text-sm">
                        {r.data[h] || "—"}
                      </TableCell>
                    ))}
                    <TableCell className="text-xs text-red-600">
                      {r.errors.join("; ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <div className="rounded-xl border border-line bg-cream/50 p-4 text-xs text-muted-warm">
        <p className="font-semibold text-ink">Cómo funciona</p>
        <ol className="mt-1 list-inside list-decimal space-y-0.5">
          <li>Descargá la plantilla y completala en Excel o Google Sheets.</li>
          <li>Guardala como CSV y subila acá.</li>
          <li>Revisá la vista previa: las filas con errores se omiten.</li>
          <li>
            Para contactos, el partner se busca por razón social o nombre
            comercial exacto (importá primero los partners).
          </li>
        </ol>
      </div>
    </div>
  );
}
