import path from "path";
import { promises as fsPromises } from "fs";
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

const SAMPLE_LIST_SELECT = {
  id: true,
  url: true,
  original_name: true,
  mime_type: true,
  size: true,
  created_at: true,
  products: {
    select: {
      id: true,
      title: true,
    },
  },
};

interface SampleListFilters {
  search?: string;
  page?: number;
  limit?: number;
}

interface SampleResponse {
  id: number;
  url: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: Date;
  products: {
    id: number;
    title: string;
  };
}

interface SampleListResponse {
  data: SampleResponse[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// SAMPLE SERVICE
// ============================================

class SampleService {
  private initPromise: Promise<unknown> | null = null;

  constructor(private db: PrismaClient = prisma) {}

  private async ensureUploadDir(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = fsPromises.mkdir(UPLOAD_DIR, { recursive: true });
    }
    await this.initPromise;
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

    await this.ensureUploadDir();
    await fsPromises.writeFile(filePath, file.buffer);

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

  async getAllSamples(
    filters?: SampleListFilters,
  ): Promise<SampleListResponse> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.db.samples.findMany({
        where,
        select: SAMPLE_LIST_SELECT,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      this.db.samples.count({ where }),
    ]);

    return {
      data: data,
      total: total,
      page,
      limit,
    };
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

    await fsPromises.unlink(absolutePath).catch(() => {});

    await this.db.samples.delete({ where: { id } });
  }
}

export const sampleService = new SampleService();
