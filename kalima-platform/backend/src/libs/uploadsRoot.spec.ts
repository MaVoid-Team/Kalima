import path from "path";
import {
  resolveUploadedUrlPath,
  resolveUploadPath,
  resolveUploadsRoot,
} from "./uploadsRoot";

describe("uploadsRoot", () => {
  const originalUploadsDir = process.env.UPLOADS_DIR;

  afterEach(() => {
    if (originalUploadsDir === undefined) {
      delete process.env.UPLOADS_DIR;
    } else {
      process.env.UPLOADS_DIR = originalUploadsDir;
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
});
