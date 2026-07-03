/**
 * Excel (XLSX) export using the `xlsx` package already present in the project.
 */
import * as XLSX from "xlsx";

export interface ExcelOptions {
  /** Worksheet name. Defaults to "Sheet1". */
  sheetName?: string;
  /** Column keys in desired order. Defaults to keys of the first row. */
  columns?: string[];
  /** Human-readable header labels (same order as `columns`). Defaults to column keys. */
  headers?: string[];
  /** Hint spreadsheet apps to open the workbook in right-to-left mode. */
  rtl?: boolean;
}

/**
 * Converts an array of flat objects to an XLSX buffer.
 *
 * @param rows  Array of flat key-value records.
 * @param opts  Optional sheet name, column ordering and header labels.
 * @returns     Node.js Buffer containing the XLSX workbook.
 */
export function toExcel(
  rows: Record<string, unknown>[],
  opts?: ExcelOptions,
): Buffer {
  const sheetName = opts?.sheetName ?? "Sheet1";
  const columns = opts?.columns ?? (rows.length > 0 ? Object.keys(rows[0]) : []);
  const headers = opts?.headers ?? columns;

  const orderedRows = rows.map((row) => {
    const ordered: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      ordered[headers[i]] = row[col] ?? "";
    });
    return ordered;
  });

  const ws = XLSX.utils.json_to_sheet(orderedRows);

  // Auto-size columns based on header + data width
  ws["!cols"] = headers.map((h, i) => {
    const colKey = columns[i];
    let maxLen = h.length;
    for (const row of rows) {
      const val = row[colKey];
      const len = val !== null && val !== undefined ? String(val).length : 0;
      if (len > maxLen) maxLen = len;
    }
    return { wch: Math.min(maxLen + 2, 60) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  if (opts?.rtl) {
    ws["!dir"] = "rtl";
    wb.Workbook = {
      ...(wb.Workbook || {}),
      Views: [{ RTL: true }],
    };
  }

  return Buffer.from(
    XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as ArrayBuffer,
  );
}
