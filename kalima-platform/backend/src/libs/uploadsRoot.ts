import path from "path";

export function resolveUploadsRoot(): string {
  return process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.resolve(process.cwd(), "uploads");
}

export function resolveEBookletUploadRoot(): string {
  return process.env.E_BOOKLET_UPLOAD_DIR
    ? path.resolve(process.env.E_BOOKLET_UPLOAD_DIR)
    : path.join(resolveUploadsRoot(), "e-booklets/private");
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

export function resolveEBookletStoragePath(storageKey: string): string {
  if (storageKey.startsWith("e-booklets/private/")) {
    return path.join(resolveUploadsRoot(), storageKey);
  }

  return path.join(resolveEBookletUploadRoot(), storageKey);
}
