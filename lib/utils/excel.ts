import { format } from "date-fns";

export type ExcelSheet = {
  name: string; // máx 31 caracteres (límite de Excel)
  rows: Record<string, string | number | null | undefined>[];
};

/** Genera y descarga un .xlsx con múltiples hojas (SheetJS cargado on-demand) */
export async function exportXlsx(nombre: string, sheets: ExcelSheet[]) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const ws = XLSX.utils.json_to_sheet(
      sheet.rows.length > 0 ? sheet.rows : [{ Info: "Sin datos" }]
    );

    // Ancho de columnas según contenido
    const headers = Object.keys(sheet.rows[0] ?? { Info: "" });
    ws["!cols"] = headers.map((h) => ({
      wch: Math.min(
        40,
        Math.max(
          h.length + 2,
          ...sheet.rows.map((r) => String(r[h] ?? "").length + 2)
        )
      ),
    }));

    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
  }

  XLSX.writeFile(
    wb,
    `voolkia-crm-${nombre}-${format(new Date(), "yyyy-MM-dd")}.xlsx`
  );
}
