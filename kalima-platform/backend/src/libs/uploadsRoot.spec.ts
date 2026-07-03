import path from "path";
import {
  resolveEBookletStoragePath,
  resolveEBookletUploadRoot,
  resolveUploadedUrlPath,
  resolveUploadPath,
  resolveUploadsRoot,
} from "./uploadsRoot";

describe("uploadsRoot", () => {
  const originalUploadsDir = process.env.UPLOADS_DIR;
  const originalEBookletUploadDir = process.env.E_BOOKLET_UPLOAD_DIR;

  afterEach(() => {
    if (originalUploadsDir === undefined) {
      delete process.env.UPLOADS_DIR;
    } else {
      process.env.UPLOADS_DIR = originalUploadsDir;
    }
    if (originalEBookletUploadDir === undefined) {
      delete process.env.E_BOOKLET_UPLOAD_DIR;
    } else {
      process.env.E_BOOKLET_UPLOAD_DIR = originalEBookletUploadDir;
    }
  });

  it("defaults to the process working directory uploads folder", () => {
    delete process.env.UPLOADS_DIR;

    expect(resolveUploadsRoot()).toBe(path.resolve(process.cwd(), "uploads"));
  });

  it("uses an explicit UPLOADS_DIR when configured", () => {
    process.env.UPLOADS_DIR = "custom-uploads";

    expect(resolveUploadsRoot()).toBe(path.resolve("custom-uploads"));
  });

  it("resolves upload child paths under the upload root", () => {
    process.env.UPLOADS_DIR = "custom-uploads";

    expect(resolveUploadPath("images")).toBe(path.resolve("custom-uploads/images"));
  });

  it("maps public upload URLs back to the upload root", () => {
    process.env.UPLOADS_DIR = "custom-uploads";

    expect(resolveUploadedUrlPath("/uploads/images/example.webp")).toBe(
      path.resolve("custom-uploads/images/example.webp"),
    );
  });

  it("defaults private e-booklet uploads under the upload root", () => {
    process.env.UPLOADS_DIR = "custom-uploads";
    delete process.env.E_BOOKLET_UPLOAD_DIR;

    expect(resolveEBookletUploadRoot()).toBe(
      path.resolve("custom-uploads/e-booklets/private"),
    );
  });

  it("uses an explicit private e-booklet upload root when configured", () => {
    process.env.E_BOOKLET_UPLOAD_DIR = "private-ebooks";

    expect(resolveEBookletUploadRoot()).toBe(path.resolve("private-ebooks"));
  });

  it("resolves private e-booklet storage keys with and without legacy prefixes", () => {
    process.env.UPLOADS_DIR = "custom-uploads";

    expect(resolveEBookletStoragePath("asset.pdf")).toBe(
      path.resolve("custom-uploads/e-booklets/private/asset.pdf"),
    );
    expect(resolveEBookletStoragePath("e-booklets/private/asset.pdf")).toBe(
      path.resolve("custom-uploads/e-booklets/private/asset.pdf"),
    );
  });
});
