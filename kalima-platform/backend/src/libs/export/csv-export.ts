/**
 * Lightweight CSV serializer.
 *
 * Handles escaping per RFC 4180: values containing commas, double-quotes,
 * or newlines are wrapped in double-quotes, with inner double-quotes doubled.
 */

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export interface CsvOptions {
  /** Column keys in desired order. Defaults to keys of the first row. */
  columns?: string[];
  /** Human-readable header labels (same order as `columns`). Defaults to column keys. */
  headers?: string[];
}

/**
 * Converts an array of flat objects to a CSV string.
 *
 * @param rows  Array of flat key-value records.
 * @param opts  Optional column ordering and header labels.
 * @returns     UTF-8 CSV string including a BOM for Excel compatibility.
 */
export function toCSV(
  rows: Record<string, unknown>[],
  opts?: CsvOptions,
): string {
  if (rows.length === 0) return "";

  const columns = opts?.columns ?? Object.keys(rows[0]);
  const headers = opts?.headers ?? columns;

  const headerLine = headers.map(escapeCell).join(",");
  const dataLines = rows.map((row) =>
    columns.map((col) => escapeCell(row[col])).join(","),
  );

  // BOM for proper UTF-8 detection in Excel
  return `\uFEFF${[headerLine, ...dataLines].join("\r\n")}\r\n`;
}
