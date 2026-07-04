const ARABIC_RE = /[\u0600-\u06FF]/;
const MOJIBAKE_HINT_RE = /[ÃÂØÙ]/;

function cleanFilename(value: unknown, fallback = "file"): string {
  const raw = String(value || "").replace(/[\0\r\n]/g, "").trim();
  const basename = raw.split(/[\\/]/).filter(Boolean).pop() || fallback;
  return basename || fallback;
}

export function normalizeOriginalFilename(value: unknown, fallback = "file"): string {
  const filename = cleanFilename(value, fallback);
  if (ARABIC_RE.test(filename) || !MOJIBAKE_HINT_RE.test(filename)) {
    return filename.normalize("NFC");
  }

  const decoded = Buffer.from(filename, "latin1").toString("utf8");
  if (ARABIC_RE.test(decoded) && !decoded.includes("�")) {
    return cleanFilename(decoded, fallback).normalize("NFC");
  }

  return filename.normalize("NFC");
}

export function buildContentDisposition(
  disposition: "inline" | "attachment",
  filename: unknown,
  fallback = "file",
): string {
  const normalized = normalizeOriginalFilename(filename, fallback);
  const asciiFallback =
    normalized
      .replace(/["\\;]/g, "_")
      .replace(/[^\x20-\x7E]+/g, "_")
      .replace(/\s+/g, " ")
      .trim() || fallback;

  return `${disposition}; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(normalized)}`;
}
