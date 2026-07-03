import path from "path";

export function resolveUploadsRoot(): string {
  return process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.resolve(process.cwd(), "uploads");
}

export function resolveUploadPath(...segments: string[]): string {
  return path.join(resolveUploadsRoot(), ...segments);
}

export function resolveUploadedUrlPath(url: string): string {
  const normalizedUrl = url.startsWith("/") ? url.slice(1) : url;
  const uploadRelativePath = normalizedUrl.startsWith("uploads/")
    ? normalizedUrl.slice("uploads/".length)
    : normalizedUrl;

  return path.resolve(resolveUploadsRoot(), uploadRelativePath);
}
