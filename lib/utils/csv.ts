import { format } from "date-fns";

// BOM UTF-8 para que Excel es-AR abra el archivo con acentos correctos
const BOM = String.fromCharCode(0xfeff);

/**
 * Exporta filas a CSV y dispara la descarga.
 * UTF-8 con BOM, separador coma.
 */
export function exportCsv(
  entidad: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  const escape = (value: string | number | null | undefined) => {
    if (value == null) return "";
    const s = String(value);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines = [
    headers.map(escape).join(","),
    ...rows.map((row) => row.map(escape).join(",")),
  ];

  const blob = new Blob([BOM + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const fileName = `voolkia-crm-${entidad}-${format(new Date(), "yyyy-MM-dd")}.csv`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
