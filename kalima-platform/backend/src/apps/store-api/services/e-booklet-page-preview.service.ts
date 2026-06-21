import crypto from "crypto";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import { promises as fsPromises } from "fs";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

type EBookletDb = any;

const DEFAULT_MAX_PREVIEW_WIDTH = 1600;

const E_BOOKLET_UPLOAD_DIR = path.resolve(
  process.env.E_BOOKLET_UPLOAD_DIR || process.cwd(),
  process.env.E_BOOKLET_UPLOAD_DIR ? "" : "uploads/e-booklets/private",
);

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
    });
  });
}

async function removeIfExists(filePath: string): Promise<void> {
  try {
    await fsPromises.unlink(filePath);
  } catch (error: any) {
    if (error?.code !== "ENOENT") throw error;
  }
}

export class EBookletPagePreviewService {
  constructor(private readonly db: EBookletDb) {}

  async renderPageBuffer(input: {
    absolutePdfPath: string;
    pageNumber: number;
  }): Promise<{ buffer: Buffer; width: number; height: number; mimeType: string }> {
    const rendererBin = process.env.E_BOOKLET_PDF_RENDERER_BIN || "pdftoppm";
    const maxWidth = Number(process.env.E_BOOKLET_PAGE_PREVIEW_MAX_WIDTH || DEFAULT_MAX_PREVIEW_WIDTH);
    const tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "kalima-ebooklet-page-preview-"));

    try {
      const outputPrefix = path.join(tmpDir, `page-${input.pageNumber}`);
      await runCommand(rendererBin, [
        "-f",
        String(input.pageNumber),
        "-l",
        String(input.pageNumber),
        "-singlefile",
        "-r",
        "144",
        "-png",
        input.absolutePdfPath,
        outputPrefix,
      ]);

      const pngPath = `${outputPrefix}.png`;
      const image = sharp(pngPath).rotate();
      const metadata = await image.metadata();
      const resizeWidth = metadata.width && metadata.width > maxWidth ? maxWidth : undefined;
      const buffer = await image
        .resize(resizeWidth ? { width: resizeWidth, withoutEnlargement: true } : undefined)
        .webp({ quality: 88 })
        .toBuffer();
      const previewMetadata = await sharp(buffer).metadata();
      return {
        buffer,
        width: Number(previewMetadata.width || 0),
        height: Number(previewMetadata.height || 0),
        mimeType: "image/webp",
      };
    } finally {
      await fsPromises.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  async generateForDocument(input: {
    documentAsset: any;
    absolutePdfPath: string;
    templateVersionId?: number | null;
    force?: boolean;
  }): Promise<{ generated: number; skipped: boolean; error?: string }> {
    const rendererBin = process.env.E_BOOKLET_PDF_RENDERER_BIN || "pdftoppm";
    const maxWidth = Number(process.env.E_BOOKLET_PAGE_PREVIEW_MAX_WIDTH || DEFAULT_MAX_PREVIEW_WIDTH);
    const documentAssetId = Number(input.documentAsset?.id);
    if (!documentAssetId || input.documentAsset?.mime_type !== "application/pdf") {
      return { generated: 0, skipped: true };
    }

    const existingCount = await this.db.e_booklet_page_previews?.count?.({
      where: { document_file_id: documentAssetId, size_key: "default" },
    });
    if (!input.force && Number(existingCount || 0) > 0) {
      return { generated: 0, skipped: true };
    }

    const sourceBytes = await fsPromises.readFile(input.absolutePdfPath);
    const pdf = await PDFDocument.load(sourceBytes, { ignoreEncryption: true, updateMetadata: false });
    const pageCount = pdf.getPageCount();
    const tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "kalima-ebooklet-preview-"));
    const createdFiles: string[] = [];
    const createdAssetIds: number[] = [];

    try {
      const stalePreviews = await this.db.e_booklet_page_previews?.findMany?.({
        where: { document_file_id: documentAssetId, size_key: "default" },
        include: { image_file: true },
      }) || [];
      await this.db.e_booklet_page_previews?.deleteMany?.({
        where: { document_file_id: documentAssetId, size_key: "default" },
      });
      for (const preview of stalePreviews) {
        const staleFilename = path.basename(preview.image_file?.storage_key || "");
        if (staleFilename) await removeIfExists(path.join(E_BOOKLET_UPLOAD_DIR, staleFilename));
        if (preview.image_file_id) {
          await this.db.e_booklet_file_assets?.delete?.({ where: { id: preview.image_file_id } }).catch(() => undefined);
        }
      }

      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        const outputPrefix = path.join(tmpDir, `page-${pageNumber}`);
        await runCommand(rendererBin, [
          "-f",
          String(pageNumber),
          "-l",
          String(pageNumber),
          "-singlefile",
          "-r",
          "144",
          "-png",
          input.absolutePdfPath,
          outputPrefix,
        ]);

        const pngPath = `${outputPrefix}.png`;
        const uniqueId = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
        const filename = `${uniqueId}-page-${pageNumber}.webp`;
        const absolutePreviewPath = path.join(E_BOOKLET_UPLOAD_DIR, filename);
        await fsPromises.mkdir(E_BOOKLET_UPLOAD_DIR, { recursive: true });

        const image = sharp(pngPath).rotate();
        const metadata = await image.metadata();
        const resizeWidth = metadata.width && metadata.width > maxWidth ? maxWidth : undefined;
        await image.resize(resizeWidth ? { width: resizeWidth, withoutEnlargement: true } : undefined).webp({ quality: 88 }).toFile(absolutePreviewPath);
        createdFiles.push(absolutePreviewPath);

        const previewMetadata = await sharp(absolutePreviewPath).metadata();
        const asset = await this.db.e_booklet_file_assets.create({
          data: {
            owner_type: "page_preview",
            owner_id: documentAssetId,
            file_type: "image",
            storage_key: `e-booklets/private/${filename}`,
            original_filename: `${path.basename(input.documentAsset.original_filename || "e-booklet", ".pdf")}-page-${pageNumber}.webp`,
            mime_type: "image/webp",
            size_bytes: (await fsPromises.stat(absolutePreviewPath)).size,
            visibility: "private",
          },
        });
        createdAssetIds.push(asset.id);

        await this.db.e_booklet_page_previews.create({
          data: {
            document_file_id: documentAssetId,
            template_version_id: input.templateVersionId || null,
            page_number: pageNumber,
            image_file_id: asset.id,
            width_px: Number(previewMetadata.width || 0),
            height_px: Number(previewMetadata.height || 0),
            format: "webp",
            size_key: "default",
            updated_at: new Date(),
          },
        });
      }

      return { generated: pageCount, skipped: false };
    } catch (error: any) {
      for (const filePath of createdFiles) await removeIfExists(filePath).catch(() => undefined);
      for (const assetId of createdAssetIds) {
        await this.db.e_booklet_file_assets?.delete?.({ where: { id: assetId } }).catch(() => undefined);
      }
      return { generated: 0, skipped: true, error: error?.message || "PDF page previews could not be generated." };
    } finally {
      await fsPromises.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}
