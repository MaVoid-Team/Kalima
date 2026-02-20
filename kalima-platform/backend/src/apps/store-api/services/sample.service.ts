import path from "path";
import fs from "fs";
import crypto from "crypto";
import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import { samples } from "../generated/prisma/client";
import { NotFoundError, BadRequestError } from "../../../libs/errors";

// ============================================
// CONSTANTS
// ============================================

const UPLOAD_DIR = path.resolve(__dirname, "../../../../uploads/samples");

const SAMPLE_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
};

// ============================================
// SAMPLE SERVICE
// ============================================

class SampleService {
  constructor(private db: PrismaClient = prisma) {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  async uploadSample(
    file: Express.Multer.File,
    productId: number,
  ): Promise<samples> {
    if (!file.buffer) {
      throw new BadRequestError("Sample file buffer is required");
    }

    if (!SAMPLE_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestError(
        `Invalid sample type: ${file.mimetype}. Allowed: PDF, Word docs`,
      );
    }

    const ext =
      MIME_TO_EXT[file.mimetype] || path.extname(file.originalname) || ".bin";
    const uniqueId = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    const filename = `${uniqueId}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filePath, file.buffer);

    const url = `/uploads/samples/${filename}`;

    const sample = await this.db.samples.create({
      data: {
        product_id: productId,
        url,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.buffer.length,
      },
    });

    return sample;
  }

  async getAllSamples(): Promise<samples[]> {
    return this.db.samples.findMany({
      include: { products: true },
      orderBy: { created_at: "desc" },
    });
  }

  async getSampleById(id: number): Promise<samples> {
    const sample = await this.db.samples.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!sample) {
      throw new NotFoundError("Sample not found");
    }

    return sample;
  }

  async deleteSample(id: number): Promise<void> {
    const sample = await this.db.samples.findUnique({ where: { id } });
    if (!sample) {
      throw new NotFoundError("Sample not found");
    }

    const absolutePath = path.resolve(
      __dirname,
      "../../../..",
      sample.url.startsWith("/") ? sample.url.slice(1) : sample.url,
    );

    try {
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    } catch {
      // Silently ignore if file already gone
    }

    await this.db.samples.delete({ where: { id } });
  }
}

export const sampleService = new SampleService();
