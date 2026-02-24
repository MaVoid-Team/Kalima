import path from "path";
import { promises as fsPromises } from "fs";
import crypto from "crypto";
import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import {
  samples,
  sample_sections,
  sample_media_type_enum,
} from "../generated/prisma/client";
import { NotFoundError, BadRequestError } from "../../../libs/errors";

// ============================================
// CONSTANTS
// ============================================

const UPLOAD_DIR = path.resolve(__dirname, "../../../../uploads/samples");

const SAMPLE_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const MIME_TO_MEDIA_TYPE: Record<string, sample_media_type_enum> = {
  "application/pdf": sample_media_type_enum.pdf,
  "image/jpeg": sample_media_type_enum.image,
  "image/png": sample_media_type_enum.image,
  "image/webp": sample_media_type_enum.image,
  "image/gif": sample_media_type_enum.image,
  "video/mp4": sample_media_type_enum.video,
  "video/webm": sample_media_type_enum.video,
  "video/quicktime": sample_media_type_enum.video,
  "application/msword": sample_media_type_enum.word,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    sample_media_type_enum.word,
  "application/vnd.ms-powerpoint": sample_media_type_enum.powerpoint,
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    sample_media_type_enum.powerpoint,
};

const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
};

const DISPLAYABLE_MEDIA_TYPES = new Set<sample_media_type_enum>([
  sample_media_type_enum.pdf,
  sample_media_type_enum.image,
  sample_media_type_enum.video,
]);

// ============================================
// TYPES
// ============================================

export interface CreateSampleSectionInput {
  title: string;
  description?: string;
  thumbnail_url?: string;
  sort_order?: number;
  active?: boolean;
}

export interface UpdateSampleSectionInput {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  sort_order?: number;
  active?: boolean;
}

export interface CreateSampleInput {
  product_id: number;
  media_type: sample_media_type_enum;
  original_name: string;
  mime_type: string;
  size: number;
  high_quality_url?: string;
  low_quality_url?: string;
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

  /** Derive is_displayable from media_type (not stored in DB) */
  isDisplayable(mediaType: sample_media_type_enum): boolean {
    return DISPLAYABLE_MEDIA_TYPES.has(mediaType);
  }

  /** Save file buffer to disk and return the URL path */
  async saveFileToDisk(
    buffer: Buffer,
    mimeType: string,
    fieldName: string,
  ): Promise<string> {
    const ext =
      MIME_TO_EXT[mimeType] || path.extname(fieldName) || ".bin";
    const uniqueId = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    const filename = `${uniqueId}-${fieldName}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    await this.ensureUploadDir();
    await fsPromises.writeFile(filePath, buffer);

    return `/uploads/samples/${filename}`;
  }

  /** Resolve URL to absolute filesystem path */
  urlToAbsolutePath(url: string): string {
    return path.resolve(
      __dirname,
      "../../../..",
      url.startsWith("/") ? url.slice(1) : url,
    );
  }

  // ============================================
  // SAMPLE SECTIONS — CRUD
  // ============================================

  async getAllSections(activeOnly = false): Promise<sample_sections[]> {
    const where = activeOnly ? { active: true } : {};
    return this.db.sample_sections.findMany({
      where,
      include: { samples: { include: { products: { select: { id: true, title: true } } } } },
      orderBy: [{ sort_order: "asc" }, { id: "asc" }],
    });
  }

  async getSectionById(id: number): Promise<sample_sections> {
    const section = await this.db.sample_sections.findUnique({
      where: { id },
      include: {
        samples: {
          include: { products: { select: { id: true, title: true } } },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!section) {
      throw new NotFoundError("Sample section not found");
    }

    return section;
  }

  async createSection(data: CreateSampleSectionInput): Promise<sample_sections> {
    return this.db.sample_sections.create({
      data: {
        title: data.title,
        description: data.description,
        thumbnail_url: data.thumbnail_url,
        sort_order: data.sort_order ?? 0,
        active: data.active ?? true,
      },
    });
  }

  async updateSection(
    id: number,
    data: UpdateSampleSectionInput,
  ): Promise<sample_sections> {
    const section = await this.db.sample_sections.findUnique({ where: { id } });
    if (!section) {
      throw new NotFoundError("Sample section not found");
    }

    return this.db.sample_sections.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.thumbnail_url !== undefined && { thumbnail_url: data.thumbnail_url }),
        ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
        ...(data.active !== undefined && { active: data.active }),
        updated_at: new Date(),
      },
    });
  }

  async deleteSection(id: number): Promise<void> {
    const section = await this.db.sample_sections.findUnique({
      where: { id },
      include: { samples: true },
    });

    if (!section) {
      throw new NotFoundError("Sample section not found");
    }

    // Delete file assets for all samples
    for (const sample of section.samples) {
      if (sample.high_quality_url) {
        void fsPromises
          .unlink(this.urlToAbsolutePath(sample.high_quality_url))
          .catch(() => {});
      }
      if (sample.low_quality_url) {
        void fsPromises
          .unlink(this.urlToAbsolutePath(sample.low_quality_url))
          .catch(() => {});
      }
    }

    await this.db.sample_sections.delete({ where: { id } });
  }

  // ============================================
  // SAMPLES — CRUD
  // ============================================

  async getSamplesBySection(sectionId: number): Promise<samples[]> {
    const section = await this.db.sample_sections.findUnique({
      where: { id: sectionId },
      select: { id: true },
    });

    if (!section) {
      throw new NotFoundError("Sample section not found");
    }

    return this.db.samples.findMany({
      where: { section_id: sectionId },
      include: { products: { select: { id: true, title: true } } },
      orderBy: { id: "asc" },
    });
  }

  async getSampleById(sampleId: number, sectionId?: number): Promise<samples> {
    const where: { id: number; section_id?: number } = { id: sampleId };
    if (sectionId !== undefined) {
      where.section_id = sectionId;
    }

    const sample = await this.db.samples.findFirst({
      where,
      include: {
        products: { select: { id: true, title: true } },
        sample_sections: { select: { id: true, title: true } },
      },
    });

    if (!sample) {
      throw new NotFoundError("Sample not found");
    }

    return sample;
  }

  async createSample(
    sectionId: number,
    productId: number,
    highQualityFile?: Express.Multer.File,
    lowQualityFile?: Express.Multer.File,
  ): Promise<samples> {
    if (!highQualityFile && !lowQualityFile) {
      throw new BadRequestError(
        "At least one of high_quality or low_quality file must be provided",
      );
    }

    // Validate mime types eagerly before any I/O
    if (highQualityFile?.buffer && !SAMPLE_MIME_TYPES.has(highQualityFile.mimetype)) {
      throw new BadRequestError(
        `Invalid high_quality file type: ${highQualityFile.mimetype}. Allowed: PDF, images, video, Word, PowerPoint`,
      );
    }
    if (lowQualityFile?.buffer && !SAMPLE_MIME_TYPES.has(lowQualityFile.mimetype)) {
      throw new BadRequestError(
        `Invalid low_quality file type: ${lowQualityFile.mimetype}. Allowed: PDF, images, video, Word, PowerPoint`,
      );
    }

    // Verify section + product exist in parallel
    const [section, product] = await Promise.all([
      this.db.sample_sections.findUnique({ where: { id: sectionId } }),
      this.db.products.findFirst({ where: { id: productId, deleted_at: null } }),
    ]);
    if (!section) throw new NotFoundError("Sample section not found");
    if (!product) throw new NotFoundError("Product not found");

    // Determine metadata from primary file
    const primaryFile = highQualityFile?.buffer ? highQualityFile : lowQualityFile!;
    const mediaType = MIME_TO_MEDIA_TYPE[primaryFile.mimetype] ?? sample_media_type_enum.pdf;
    const originalName = primaryFile.originalname;
    const mimeType = primaryFile.mimetype;
    const size = primaryFile.buffer!.length;

    // Write files to disk in parallel when both are provided
    const fileWrites: Promise<string | null>[] = [
      highQualityFile?.buffer
        ? this.saveFileToDisk(highQualityFile.buffer, highQualityFile.mimetype, "high_quality")
        : Promise.resolve(null),
      lowQualityFile?.buffer
        ? this.saveFileToDisk(lowQualityFile.buffer, lowQualityFile.mimetype, "low_quality")
        : Promise.resolve(null),
    ];
    const [highQualityUrl, lowQualityUrl] = await Promise.all(fileWrites);

    return this.db.samples.create({
      data: {
        section_id: sectionId,
        product_id: productId,
        media_type: mediaType,
        original_name: originalName,
        mime_type: mimeType,
        size,
        high_quality_url: highQualityUrl,
        low_quality_url: lowQualityUrl,
      },
      include: {
        products: { select: { id: true, title: true } },
        sample_sections: { select: { id: true, title: true } },
      },
    });
  }

  async updateSample(
    sampleId: number,
    sectionId: number,
    highQualityFile?: Express.Multer.File,
    lowQualityFile?: Express.Multer.File,
  ): Promise<samples> {
    const sample = await this.db.samples.findFirst({
      where: { id: sampleId, section_id: sectionId },
    });

    if (!sample) {
      throw new NotFoundError("Sample not found");
    }

    let highQualityUrl = sample.high_quality_url;
    let lowQualityUrl = sample.low_quality_url;
    let originalName = sample.original_name;
    let mimeType = sample.mime_type;
    let size = sample.size;

    if (highQualityFile?.buffer) {
      if (!SAMPLE_MIME_TYPES.has(highQualityFile.mimetype)) {
        throw new BadRequestError(
          `Invalid high_quality file type: ${highQualityFile.mimetype}`,
        );
      }
      if (sample.high_quality_url) {
        void fsPromises
          .unlink(this.urlToAbsolutePath(sample.high_quality_url))
          .catch(() => {});
      }
      highQualityUrl = await this.saveFileToDisk(
        highQualityFile.buffer,
        highQualityFile.mimetype,
        "high_quality",
      );
      originalName = highQualityFile.originalname;
      mimeType = highQualityFile.mimetype;
      size = highQualityFile.buffer.length;
    }

    if (lowQualityFile?.buffer) {
      if (!SAMPLE_MIME_TYPES.has(lowQualityFile.mimetype)) {
        throw new BadRequestError(
          `Invalid low_quality file type: ${lowQualityFile.mimetype}`,
        );
      }
      if (sample.low_quality_url) {
        void fsPromises
          .unlink(this.urlToAbsolutePath(sample.low_quality_url))
          .catch(() => {});
      }
      lowQualityUrl = await this.saveFileToDisk(
        lowQualityFile.buffer,
        lowQualityFile.mimetype,
        "low_quality",
      );
    }

    return this.db.samples.update({
      where: { id: sampleId },
      data: {
        high_quality_url: highQualityUrl,
        low_quality_url: lowQualityUrl,
        original_name: originalName,
        mime_type: mimeType,
        size,
        updated_at: new Date(),
      },
      include: {
        products: { select: { id: true, title: true } },
        sample_sections: { select: { id: true, title: true } },
      },
    });
  }

  async deleteSample(sampleId: number, sectionId?: number): Promise<void> {
    const where: { id: number; section_id?: number } = { id: sampleId };
    if (sectionId !== undefined) {
      where.section_id = sectionId;
    }

    const sample = await this.db.samples.findFirst({ where });

    if (!sample) {
      throw new NotFoundError("Sample not found");
    }

    if (sample.high_quality_url) {
      void fsPromises
        .unlink(this.urlToAbsolutePath(sample.high_quality_url))
        .catch(() => {});
    }
    if (sample.low_quality_url) {
      void fsPromises
        .unlink(this.urlToAbsolutePath(sample.low_quality_url))
        .catch(() => {});
    }

    await this.db.samples.delete({ where: { id: sampleId } });
  }

  /** Get the file path for preview (high quality - protected, no download) */
  async getPreviewPath(sampleId: number, sectionId?: number): Promise<{
    path: string;
    mimeType: string;
    originalName: string;
  }> {
    const sample = await this.getSampleById(sampleId, sectionId) as samples & { high_quality_url?: string | null };

    if (!sample.high_quality_url) {
      throw new NotFoundError("No preview available for this sample");
    }

    const absolutePath = this.urlToAbsolutePath(sample.high_quality_url);

    return {
      path: absolutePath,
      mimeType: sample.mime_type,
      originalName: sample.original_name,
    };
  }

  /** Get the file path for download (low quality) */
  async getDownloadPath(sampleId: number, sectionId?: number): Promise<{
    path: string;
    mimeType: string;
    originalName: string;
  }> {
    const sample = await this.getSampleById(sampleId, sectionId) as samples & { low_quality_url?: string | null };

    if (!sample.low_quality_url) {
      throw new NotFoundError("No download available for this sample");
    }

    const absolutePath = this.urlToAbsolutePath(sample.low_quality_url);

    return {
      path: absolutePath,
      mimeType: sample.mime_type,
      originalName: sample.original_name,
    };
  }

  /** Enrich sample with computed is_displayable (for API responses) */
  enrichSample<T extends { media_type: sample_media_type_enum }>(
    sample: T,
  ): T & { is_displayable: boolean } {
    return {
      ...sample,
      is_displayable: this.isDisplayable(sample.media_type),
    };
  }
}

export const sampleService = new SampleService();
