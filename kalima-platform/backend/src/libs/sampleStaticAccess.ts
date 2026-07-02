import path from "path";

export function isProtectedSampleStaticPath(requestPath: string): boolean {
  const fileName = path.posix.basename(requestPath).toLowerCase();

  return fileName.includes("-high_quality") || fileName.endsWith(".pdf");
}
