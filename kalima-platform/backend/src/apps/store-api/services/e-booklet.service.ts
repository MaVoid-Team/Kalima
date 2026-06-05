import path from "path";
import { promises as fsPromises } from "fs";
import crypto from "crypto";
import { PDFDocument } from "pdf-lib";
import type { PrismaClient } from "../../../libs/db/prisma";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../../libs/errors";
import { hashInviteToken } from "../utils/e-booklet-token";

type EBookletDb = PrismaClient | any;

const E_BOOKLET_UPLOAD_DIR = path.resolve(
  __dirname,
  "../../../../uploads/e-booklets/private",
);
const PASSCODE_BLOCK_MESSAGE = "Invalid e-booklet invite passcode.";
const PASSCODE_MAX_FAILURES = 5;
const PASSCODE_WINDOW_MS = 10 * 60 * 1000;
const PASSCODE_BLOCK_MS = 15 * 60 * 1000;
const passcodeFailures = new Map<string, { count: number; firstFailureAt: number; blockedUntil?: number }>();

const MIME_TO_FILE_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "file",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "file",
  "application/vnd.ms-excel": "file",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "file",
  "application/vnd.ms-powerpoint": "file",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "file",
  "text/plain": "file",
  "text/csv": "file",
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "image/avif": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
  "audio/mpeg": "audio",
  "audio/mp3": "audio",
  "audio/wav": "audio",
  "audio/webm": "audio",
  "audio/ogg": "audio",
  "audio/mp4": "audio",
};

const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  "text/plain": ".txt",
  "text/csv": ".csv",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/webm": ".webm",
  "audio/ogg": ".ogg",
  "audio/mp4": ".m4a",
};

const MIME_ALLOWED_EXTS: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "text/plain": [".txt"],
  "text/csv": [".csv"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "image/avif": [".avif"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
  "video/quicktime": [".mov", ".qt"],
  "audio/mpeg": [".mp3"],
  "audio/mp3": [".mp3"],
  "audio/wav": [".wav"],
  "audio/webm": [".webm"],
  "audio/ogg": [".ogg"],
  "audio/mp4": [".m4a", ".mp4"],
};

export interface PageDimensions {
  width: number;
  height: number;
}

export interface PdfMetadata {
  page_count: number;
  page_dimensions: PageDimensions[];
}

export interface ValidateTeacherDocumentInput {
  templateVersionId: number;
  uploadedPageCount: number;
  uploadedPageDimensions?: PageDimensions[];
}

export interface AcceptInviteMeta {
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
}

type HotspotContentInput = {
  type: string;
  asset_file_id?: number | null;
  text_content?: string | null;
  content_json?: any;
};

type NormalizedHotspotContent = {
  version: 2;
  blocks: any[];
};

type TermsInput = {
  termsAccepted?: boolean;
  termsVersion?: string;
  purchaseId?: number;
  paymentProofFileId?: number;
  passcode?: string;
};

function resolveDefaultPrisma(): PrismaClient {
  // Lazy require keeps service unit tests from needing DATABASE_URL.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("../../../libs/db/prisma").prisma;
}

function dimensionsDiffer(
  expected?: PageDimensions[] | null,
  uploaded?: PageDimensions[],
): boolean {
  if (!expected?.length || !uploaded?.length) return false;
  if (expected.length !== uploaded.length) return true;

  return expected.some((dimension, index) => {
    const uploadedDimension = uploaded[index];
    if (!uploadedDimension) return true;
    return (
      Number(dimension.width) !== Number(uploadedDimension.width) ||
      Number(dimension.height) !== Number(uploadedDimension.height)
    );
  });
}

async function extractPdfMetadata(
  file: Express.Multer.File,
): Promise<PdfMetadata | null> {
  if (file.mimetype !== "application/pdf") return null;

  try {
    const document = await PDFDocument.load(file.buffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    });
    const pages = document.getPages();
    return {
      page_count: pages.length,
      page_dimensions: pages.map((page) => {
        const size = page.getSize();
        return {
          width: Number(size.width.toFixed(2)),
          height: Number(size.height.toFixed(2)),
        };
      }),
    };
  } catch {
    throw new BadRequestError(
      "The uploaded PDF could not be read. Please upload a valid PDF file.",
    );
  }
}

const VIEWER_PAGE_TOKEN_TTL_MS = 5 * 60 * 1000;

function base64UrlEncode(value: string): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function viewerTokenSecret(): string {
  return (
    process.env.E_BOOKLET_PAGE_TOKEN_SECRET ||
    process.env.JWT_SECRET ||
    "dev-e-booklet-page-token-secret"
  );
}

function inviteShareTokenSecret(): string {
  return (
    process.env.E_BOOKLET_INVITE_TOKEN_SECRET ||
    process.env.JWT_SECRET ||
    "dev-e-booklet-invite-token-secret"
  );
}

function encryptInviteShareToken(token: string): string {
  const key = crypto.createHash("sha256").update(inviteShareTokenSecret()).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((part) => part.toString("base64url")).join(".");
}

function decryptInviteShareToken(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return null;
  const parts = ciphertext.split(".");
  if (parts.length !== 3) return null;
  try {
    const [iv, tag, encrypted] = parts.map((part) => Buffer.from(part, "base64url"));
    const key = crypto.createHash("sha256").update(inviteShareTokenSecret()).digest();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

function createViewerPageToken(input: {
  instanceId: number;
  pageNumber: number;
  userId: number;
  expiresAt: Date;
}): string {
  const body = base64UrlEncode(
    JSON.stringify({
      instanceId: input.instanceId,
      pageNumber: input.pageNumber,
      userId: input.userId,
      expiresAt: input.expiresAt.toISOString(),
    }),
  );
  const signature = crypto
    .createHmac("sha256", viewerTokenSecret())
    .update(body)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `${body}.${signature}`;
}

export class EBookletService {
  private fileStorageInitPromise: Promise<unknown> | null = null;

  constructor(private readonly db: EBookletDb = resolveDefaultPrisma()) {}

  private async transaction<T>(
    callback: (tx: EBookletDb) => Promise<T>,
    options?: Record<string, unknown>,
  ): Promise<T> {
    if (typeof this.db.$transaction === "function") {
      return this.db.$transaction(callback, options);
    }
    return callback(this.db);
  }

  private async serializableTransaction<T>(callback: (tx: EBookletDb) => Promise<T>): Promise<T> {
    // Device binding makes a count-then-insert decision. Serializable isolation
    // forces competing transactions for different fingerprints to collide instead
    // of both observing the same free allowance; P2034 is retried below.
    const options = { isolationLevel: "Serializable" };
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await this.transaction(callback, options);
      } catch (error: any) {
        if (error?.code === "P2034" && attempt === 0) continue;
        throw error;
      }
    }
    throw new ForbiddenError("Unable to bind viewer device safely.");
  }

  private async auditSafely(db: EBookletDb, data: Record<string, unknown>) {
    try {
      await db.e_booklet_audit_logs.create({ data });
    } catch {
      // Audit failures must not mask the primary e-booklet action/error.
    }
  }

  private async ensureFileStorageDir(): Promise<void> {
    if (!this.fileStorageInitPromise) {
      this.fileStorageInitPromise = fsPromises.mkdir(E_BOOKLET_UPLOAD_DIR, {
        recursive: true,
      });
    }
    await this.fileStorageInitPromise;
  }

  private buildSlug(title: string): string {
    const base = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return base || `e-booklet-${Date.now()}`;
  }

  async createFileAsset(
    file: Express.Multer.File | undefined,
    input: {
      ownerType?: string;
      ownerId?: number | null;
      fileType?: string;
    } = {},
  ): Promise<unknown> {
    if (!file) {
      throw new BadRequestError("No e-booklet file was uploaded.");
    }

    const inferredFileType = MIME_TO_FILE_TYPE[file.mimetype];
    if (input.fileType === "document" && file.mimetype !== "application/pdf") {
      throw new BadRequestError(
        `Invalid document type: ${file.mimetype}. Allowed: PDF only`,
      );
    }
    if (!inferredFileType) {
      throw new BadRequestError(`Unsupported e-booklet file type: ${file.mimetype}`);
    }
    const requestedFileType = input.fileType === "document" ? "pdf" : input.fileType;
    const requestedSafeAttachment = requestedFileType === "file";
    const inferredStorageType =
      requestedSafeAttachment &&
      (file.mimetype === "application/pdf" || file.mimetype.startsWith("application/") || file.mimetype.startsWith("text/"))
        ? "file"
        : inferredFileType;
    const fileType = requestedFileType || inferredStorageType;
    if (fileType !== inferredStorageType) {
      throw new BadRequestError(
        `Uploaded MIME type ${file.mimetype} must be stored as e-booklet file_type=${inferredStorageType}.`,
      );
    }

    const originalExt = path.extname(file.originalname).toLowerCase();
    const allowedExts = MIME_ALLOWED_EXTS[file.mimetype];
    if (allowedExts && originalExt && !allowedExts.includes(originalExt)) {
      throw new BadRequestError(
        `File extension ${originalExt} does not match uploaded MIME type ${file.mimetype}.`,
      );
    }

    const ext =
      MIME_TO_EXT[file.mimetype] ||
      path.extname(file.originalname).toLowerCase() ||
      ".bin";
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .slice(0, 80);
    const uniqueId = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    const filename = `${uniqueId}-${safeBase || "ebooklet"}${ext}`;
    const storageKey = `e-booklets/private/${filename}`;

    await this.ensureFileStorageDir();
    const metadata = await extractPdfMetadata(file);
    await fsPromises.writeFile(path.join(E_BOOKLET_UPLOAD_DIR, filename), file.buffer);

    const asset = await this.db.e_booklet_file_assets.create({
      data: {
        owner_type: input.ownerType || "admin",
        owner_id: input.ownerId ?? null,
        file_type: fileType,
        storage_key: storageKey,
        original_filename: file.originalname,
        mime_type: file.mimetype,
        size_bytes: file.size,
        visibility: "private",
      },
    });
    return metadata ? { ...asset, metadata } : asset;
  }

  async getPrivateFileAssetForAdmin(
    assetId: number,
  ): Promise<{ asset: any; absolutePath: string }> {
    const asset = await this.db.e_booklet_file_assets.findUnique({
      where: { id: assetId },
    });
    if (!asset) throw new NotFoundError("E-booklet file asset not found");

    const filename = path.basename(asset.storage_key || "");
    const absolutePath = path.join(E_BOOKLET_UPLOAD_DIR, filename);
    await fsPromises.access(absolutePath);
    return { asset, absolutePath };
  }

  async listPublishedTemplates(filters: {
    search?: string;
    categoryId?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: unknown[]; total: number; page: number; limit: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { status: "published" };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters.categoryId) {
      where.category_id = filters.categoryId;
    }

    const [data, total] = await Promise.all([
      this.db.e_booklet_templates.findMany({
        where,
        include: {
          cover_file: true,
          category: { select: { id: true, title: true } },
          versions: {
            where: { status: "active" },
            orderBy: { version_number: "desc" },
            take: 1,
            include: { _count: { select: { hotspots: true } } },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      this.db.e_booklet_templates.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getPublishedTemplateBySlug(slug: string): Promise<unknown> {
    const template = await this.db.e_booklet_templates.findFirst({
      where: { slug, status: "published" },
      include: {
        cover_file: true,
        category: { select: { id: true, title: true } },
        versions: {
          where: { status: "active" },
          orderBy: { version_number: "desc" },
          take: 1,
          include: { _count: { select: { hotspots: true } } },
        },
      },
    });
    if (!template) throw new NotFoundError("E-booklet template not found");
    return template;
  }

  async listAdminTemplates(filters: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: unknown[]; total: number; page: number; limit: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.db.e_booklet_templates.findMany({
        where,
        include: {
          cover_file: true,
          category: { select: { id: true, title: true } },
          versions: { orderBy: { version_number: "desc" }, take: 1 },
          _count: { select: { purchases: true } },
        },
        orderBy: { updated_at: "desc" },
        skip,
        take: limit,
      }),
      this.db.e_booklet_templates.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async createTemplate(dto: any, adminUserId: number): Promise<unknown> {
    const slug = dto.slug || this.buildSlug(dto.title);
    return this.db.e_booklet_templates.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        cover_file_id: dto.cover_file_id,
        price: dto.price,
        marketing_price: dto.marketing_price ?? 0,
        currency: dto.currency || "EGP",
        category_id: dto.category_id,
        status: dto.status || "draft",
        created_by: adminUserId,
      },
      include: {
        cover_file: true,
        category: { select: { id: true, title: true } },
      },
    });
  }

  async getTemplateById(id: number): Promise<unknown> {
    const template = await this.db.e_booklet_templates.findUnique({
      where: { id },
      include: {
        cover_file: true,
        versions: { orderBy: { version_number: "desc" } },
      },
    });
    if (!template) throw new NotFoundError("E-booklet template not found");
    return template;
  }

  async listTemplateVersions(templateId: number): Promise<unknown[]> {
    const template = await this.db.e_booklet_templates.findUnique({
      where: { id: templateId },
      select: { id: true },
    });
    if (!template) throw new NotFoundError("E-booklet template not found");

    return this.db.e_booklet_template_versions.findMany({
      where: { template_id: templateId },
      include: {
        base_document_file: true,
        rendered_document_file: true,
        _count: { select: { hotspots: true, instances: true, purchases: true } },
      },
      orderBy: { version_number: "desc" },
    });
  }

  async updateTemplate(id: number, dto: any): Promise<unknown> {
    return this.db.e_booklet_templates.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        cover_file_id: dto.cover_file_id,
        price: dto.price,
        marketing_price: dto.marketing_price,
        currency: dto.currency,
        category_id: dto.category_id,
        status: dto.status,
        updated_at: new Date(),
      },
    });
  }

  async updateTemplateVersion(versionId: number, dto: any): Promise<unknown> {
    return this.db.e_booklet_template_versions.update({
      where: { id: versionId },
      data: {
        base_document_file_id: dto.base_document_file_id,
        rendered_document_file_id: dto.rendered_document_file_id,
        page_count: dto.page_count,
        page_dimensions_json: dto.page_dimensions_json,
        status: dto.status,
      },
    });
  }

  async createTemplateVersion(
    templateId: number,
    dto: any,
    adminUserId: number,
  ): Promise<unknown> {
    const latest = await this.db.e_booklet_template_versions.findFirst({
      where: { template_id: templateId },
      orderBy: { version_number: "desc" },
      select: { version_number: true },
    });

    return this.db.e_booklet_template_versions.create({
      data: {
        template_id: templateId,
        version_number: (latest?.version_number ?? 0) + 1,
        base_document_file_id: dto.base_document_file_id,
        rendered_document_file_id: dto.rendered_document_file_id,
        page_count: dto.page_count,
        page_dimensions_json: dto.page_dimensions_json,
        status: "draft",
        created_by: adminUserId,
      },
    });
  }

  async listVersionHotspots(
    templateVersionId: number,
    pageNumber?: number,
  ): Promise<unknown[]> {
    const where: Record<string, unknown> = {
      template_version_id: templateVersionId,
      is_active: true,
    };
    if (pageNumber) where.page_number = pageNumber;

    const hotspots = await this.db.e_booklet_hotspots.findMany({
      where,
      orderBy: [
        { page_number: "asc" },
        { sort_order: "asc" },
        { created_at: "asc" },
      ],
    });
    return hotspots.map((hotspot: any) => this.normalizeHotspotRecord(hotspot));
  }

  async publishTemplateVersion(versionId: number): Promise<unknown> {
    const version = await this.db.e_booklet_template_versions.findUnique({
      where: { id: versionId },
      select: { id: true, template_id: true },
    });
    if (!version) throw new NotFoundError("E-booklet template version not found");

    return this.db.$transaction(async (tx: EBookletDb) => {
      await tx.e_booklet_template_versions.updateMany({
        where: { template_id: version.template_id, status: "active" },
        data: { status: "archived" },
      });
      const published = await tx.e_booklet_template_versions.update({
        where: { id: versionId },
        data: { status: "active", published_at: new Date() },
      });
      await tx.e_booklet_templates.update({
        where: { id: version.template_id },
        data: { status: "published", updated_at: new Date() },
      });
      return published;
    });
  }

  async createHotspot(dto: any, adminUserId: number): Promise<unknown> {
    this.validateHotspotContent(dto);
    const normalizedContent = this.normalizeLegacyHotspotContent(dto);
    const lastReference = dto.reference_number
      ? null
      : await this.db.e_booklet_hotspots.findFirst({
          where: { template_version_id: dto.template_version_id },
          orderBy: { reference_number: "desc" },
          select: { reference_number: true },
        });
    const referenceNumber =
      dto.reference_number ?? Number(lastReference?.reference_number ?? 0) + 1;

    return this.db.e_booklet_hotspots.create({
      data: {
        template_version_id: dto.template_version_id,
        page_number: dto.page_number,
        x_percent: dto.x_percent,
        y_percent: dto.y_percent,
        radius_percent: dto.radius_percent,
        reference_number: referenceNumber,
        shape: dto.shape || "circle",
        width_percent: dto.width_percent,
        height_percent: dto.height_percent,
        type: dto.type,
        title: dto.title,
        text_content: dto.text_content,
        asset_file_id: dto.asset_file_id,
        trigger_type: dto.trigger_type || "click",
        display_behavior: dto.display_behavior,
        content_json: normalizedContent,
        interaction_json: dto.interaction_json,
        created_by: adminUserId,
      },
    });
  }

  normalizeLegacyHotspotContent(input: HotspotContentInput): NormalizedHotspotContent {
    const existingBlocks = Array.isArray(input.content_json?.blocks)
      ? input.content_json.blocks
      : null;
    if (existingBlocks) {
      return {
        ...(input.content_json || {}),
        version: 2,
        blocks: existingBlocks.map((block: any) => ({ ...block })),
      };
    }

    const block: any = { type: input.type };
    if (input.asset_file_id !== undefined && input.asset_file_id !== null) {
      block.asset_file_id = input.asset_file_id;
    }
    if (input.type === "text" && input.text_content) {
      block.text_content = input.text_content;
    } else if (input.text_content) {
      block.supplementary_text = input.text_content;
    }
    if (input.content_json?.url) block.url = input.content_json.url;
    if (input.content_json?.youtube_url) block.youtube_url = input.content_json.youtube_url;
    if (input.content_json?.source) block.source = input.content_json.source;
    if (input.content_json?.answers) block.answers = input.content_json.answers;

    return { version: 2, blocks: [block] };
  }

  private normalizeHotspotRecord(hotspot: any): any {
    if (!hotspot || typeof hotspot !== "object") return hotspot;
    return {
      ...hotspot,
      content_json: this.normalizeLegacyHotspotContent(hotspot),
    };
  }

  validateHotspotContent(input: HotspotContentInput): void {
    const normalized = this.normalizeLegacyHotspotContent(input);
    const blocks = normalized.blocks;
    const primaryBlock = blocks[0] || {};
    const url = primaryBlock.url || input.content_json?.url;
    const youtubeUrl = primaryBlock.youtube_url || input.content_json?.youtube_url;

    blocks.forEach((block: any) => {
      const blockType = block?.type;
      if (["image", "audio", "file"].includes(blockType) && !block.asset_file_id) {
        const label = blockType === "file" ? "File" : `${blockType[0].toUpperCase()}${blockType.slice(1)}`;
        throw new BadRequestError(`${label} hotspots require an attached file asset.`);
      }
      if (blockType === "link" && !this.isHttpUrl(block.url)) {
        throw new BadRequestError("Link hotspots require a valid HTTP/HTTPS URL.");
      }
      if (blockType === "video") {
        if (block.source === "youtube") {
          if (!this.isYoutubeUrl(block.youtube_url)) {
            throw new BadRequestError("YouTube video hotspots require a valid YouTube HTTP/HTTPS URL.");
          }
        } else if (!block.asset_file_id) {
          throw new BadRequestError("Video hotspots require an attached file asset or YouTube URL.");
        }
      }
      if (blockType === "question_answer") {
        const answers = Array.isArray(block.answers) ? block.answers : [];
        const correctCount = answers.filter(
          (answer: any) => answer?.isCorrect === true || answer?.is_correct === true,
        ).length;
        if (correctCount !== 1) {
          throw new BadRequestError("Q&A hotspots require exactly one correct answer.");
        }
      }
    });

    if (
      ["image", "audio", "file"].includes(input.type) &&
      !input.asset_file_id &&
      !blocks.some((block: any) => block?.type === input.type && block?.asset_file_id)
    ) {
      const label =
        input.type === "file"
          ? "File"
          : `${input.type[0].toUpperCase()}${input.type.slice(1)}`;
      throw new BadRequestError(
        `${label} hotspots require an attached file asset.`,
      );
    }
    if (input.type === "video") {
      if (primaryBlock.source === "youtube") {
        if (!this.isYoutubeUrl(youtubeUrl)) {
          throw new BadRequestError(
            "YouTube video hotspots require a valid YouTube HTTP/HTTPS URL.",
          );
        }
      } else if (!input.asset_file_id && !blocks.some((block: any) => block?.type === "video" && block?.asset_file_id)) {
        throw new BadRequestError(
          "Video hotspots require an attached file asset or YouTube URL.",
        );
      }
    }
    if (input.type === "link" && !this.isHttpUrl(url)) {
      throw new BadRequestError("Link hotspots require a valid HTTP/HTTPS URL.");
    }
    if (input.type === "question_answer") {
      const answers = Array.isArray(primaryBlock.answers)
        ? primaryBlock.answers
        : [];
      const correctCount = answers.filter(
        (answer: any) => answer?.isCorrect === true || answer?.is_correct === true,
      ).length;
      if (correctCount !== 1) {
        throw new BadRequestError(
          "Q&A hotspots require exactly one correct answer.",
        );
      }
    }
  }

  private isHttpUrl(value?: string): boolean {
    if (!value || typeof value !== "string") return false;
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  private isYoutubeUrl(value?: string): boolean {
    if (!this.isHttpUrl(value)) return false;
    const host = new URL(value as string).hostname.toLowerCase();
    return ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(host);
  }

  private sanitizeViewerAccess<T>(value: T): T {
    if (!value || typeof value !== "object") return value;
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeViewerAccess(item)) as T;
    }
    const copy: Record<string, unknown> = { ...(value as Record<string, unknown>) };
    delete copy.internal_price;
    Object.keys(copy).forEach((key) => {
      copy[key] = this.sanitizeViewerAccess(copy[key]);
    });
    return copy as T;
  }

  validateInstancePricing(input: {
    template_marketing_price?: number;
    marketing_price?: number;
    student_marketing_price?: number;
    internal_price?: number;
  }): { marketingPrice: number; internalPrice: number } {
    const marketingPrice = Number(
      input.student_marketing_price ??
        input.marketing_price ??
        input.template_marketing_price ??
        0,
    );
    const internalPrice = Number(input.internal_price ?? 0);
    if (internalPrice > marketingPrice) {
      throw new BadRequestError("Internal price cannot exceed marketing price.");
    }
    return { marketingPrice, internalPrice };
  }

  async updateHotspot(
    hotspotId: number,
    dto: any,
    adminUserId: number,
  ): Promise<unknown> {
    let normalizedContent = dto.content_json;
    if (dto.content_json !== undefined || dto.type !== undefined || dto.asset_file_id !== undefined || dto.text_content !== undefined) {
      const existing = await this.db.e_booklet_hotspots.findUnique({ where: { id: hotspotId } });
      if (!existing) throw new NotFoundError("E-booklet hotspot not found");
      const validationInput = { ...existing, ...dto };
      this.validateHotspotContent(validationInput);
      normalizedContent = this.normalizeLegacyHotspotContent(validationInput);
    }
    return this.db.e_booklet_hotspots.update({
      where: { id: hotspotId },
      data: {
        ...dto,
        ...(normalizedContent !== undefined ? { content_json: normalizedContent } : {}),
        updated_by: adminUserId,
        updated_at: new Date(),
      },
    });
  }

  async deleteHotspot(hotspotId: number, adminUserId: number): Promise<unknown> {
    return this.db.e_booklet_hotspots.update({
      where: { id: hotspotId },
      data: {
        is_active: false,
        updated_by: adminUserId,
        updated_at: new Date(),
      },
    });
  }

  async createPurchaseRequest(teacherId: number, dto: any, adminUserId?: number): Promise<unknown> {
    const price = Number(dto.price ?? 0);
    const { marketingPrice, internalPrice } = this.validateInstancePricing({
      marketing_price: dto.marketing_price ?? price,
      internal_price: dto.internal_price ?? 0,
    });

    const purchase = await this.db.e_booklet_purchases.create({
      data: {
        teacher_id: teacherId,
        template_id: dto.template_id,
        template_version_id: dto.template_version_id,
        price,
        marketing_price: marketingPrice,
        internal_price: internalPrice,
        currency: dto.currency || "EGP",
        branding_json: dto.branding_json,
        admin_notes: dto.notes,
        status: "pending",
      },
    });

    await this.auditSafely(this.db, {
      actor_user_id: adminUserId,
      action: "teacher_e_booklet_deal_created",
      entity_type: "e_booklet_purchase",
      entity_id: (purchase as any).id,
      metadata_json: {
        teacher_id: teacherId,
        template_id: dto.template_id,
        template_version_id: dto.template_version_id,
      },
    });

    return purchase;
  }

  async listPurchases(filters: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: unknown[]; total: number; page: number; limit: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = filters.status ? { status: filters.status } : {};
    const [data, total] = await Promise.all([
      this.db.e_booklet_purchases.findMany({
        where,
        include: {
          teacher: { select: { id: true, name: true, email: true, phone: true } },
          template: true,
          template_version: true,
          instances: true,
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      this.db.e_booklet_purchases.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async getPurchase(id: number): Promise<unknown> {
    const purchase = await this.db.e_booklet_purchases.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, name: true, email: true, phone: true } },
        template: true,
        template_version: true,
        instances: true,
      },
    });
    if (!purchase) throw new NotFoundError("E-booklet purchase not found");
    return purchase;
  }

  async updatePurchaseStatus(id: number, status: string, adminNotes?: string) {
    return this.db.e_booklet_purchases.update({
      where: { id },
      data: {
        status,
        admin_notes: adminNotes,
        updated_at: new Date(),
      },
    });
  }

  async deliverPurchase(purchaseId: number, dto: any, adminUserId: number) {
    const purchase = await this.db.e_booklet_purchases.findUnique({
      where: { id: purchaseId },
    });
    if (!purchase) throw new NotFoundError("E-booklet purchase not found");
    if (!dto.access_expires_at) {
      throw new BadRequestError("Access expiry is required for delivered e-booklets.");
    }

    const { marketingPrice, internalPrice } = this.validateInstancePricing({
      marketing_price: dto.student_marketing_price ?? purchase.marketing_price ?? purchase.price ?? 0,
      internal_price: dto.internal_price ?? purchase.internal_price ?? 0,
    });

    await this.validateTeacherDocumentForDelivery({
      templateVersionId: purchase.template_version_id,
      uploadedPageCount: dto.page_count,
      uploadedPageDimensions: dto.page_dimensions,
    });

    return this.transaction(async (tx: EBookletDb) => {
      const instance = await tx.e_booklet_instances.create({
        data: {
          purchase_id: purchase.id,
          teacher_id: purchase.teacher_id,
          template_id: purchase.template_id,
          template_version_id: purchase.template_version_id,
          custom_document_file_id: dto.custom_document_file_id,
          display_title: dto.display_title,
          branding_json: purchase.branding_json,
          invite_quota: dto.invite_quota,
          access_expires_at: dto.access_expires_at ? new Date(dto.access_expires_at) : undefined,
          student_marketing_price: marketingPrice,
          internal_price: internalPrice,
          status: "active",
        },
      });

      await tx.e_booklet_access.create({
        data: {
          booklet_instance_id: instance.id,
          user_id: purchase.teacher_id,
          role: "teacher",
          status: "active",
        },
      });

      await tx.e_booklet_purchases.update({
        where: { id: purchase.id },
        data: { status: "ready", updated_at: new Date() },
      });

      await tx.e_booklet_audit_logs.create({
        data: {
          actor_user_id: adminUserId,
          action: "booklet_delivered",
          entity_type: "e_booklet_instance",
          entity_id: instance.id,
          metadata_json: { purchase_id: purchase.id },
        },
      });

      return instance;
    });
  }

  async listInstances(filters: {
    teacherId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.teacherId) where.teacher_id = filters.teacherId;
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      this.db.e_booklet_instances.findMany({
        where,
        include: {
          template: true,
          template_version: true,
          teacher: { select: { id: true, name: true, email: true } },
          devices: { select: { id: true, status: true } },
          _count: { select: { access_records: true, invites: true } },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      this.db.e_booklet_instances.count({ where }),
    ]);
    return {
      data: data.map(({ devices = [], ...instance }: any) => ({
        ...instance,
        used_devices_count: devices.filter((device: any) => device.status === "active").length,
      })),
      total,
      page,
      limit,
    };
  }

  async updateQuota(instanceId: number, inviteQuota: number): Promise<unknown> {
    return this.db.e_booklet_instances.update({
      where: { id: instanceId },
      data: { invite_quota: inviteQuota, updated_at: new Date() },
    });
  }

  async archiveExpiredInstances(now = new Date(), options: { dryRun?: boolean } = {}) {
    const where = { status: "active", access_expires_at: { lte: now } };
    if (options.dryRun) {
      const count = await this.db.e_booklet_instances.count({ where });
      return { count, dryRun: true };
    }
    return this.db.e_booklet_instances.updateMany({
      where,
      data: {
        status: "archived",
        archived_at: now,
        archive_reason: "expired",
        updated_at: now,
      },
    });
  }

  async createInvite(instanceId: number, teacherId: number, dto: any) {
    const instance = await this.db.e_booklet_instances.findFirst({
      where: { id: instanceId, teacher_id: teacherId, status: "active" },
    });
    if (!instance) throw new NotFoundError("Teacher e-booklet not found");

    const { generateInviteToken } = await import("../utils/e-booklet-token");
    const token = generateInviteToken();
    const generatedPasscode = dto.require_passcode && !dto.passcode
      ? String(crypto.randomInt(0, 1_000_000)).padStart(6, "0")
      : undefined;
    const passcode = dto.passcode ?? generatedPasscode;
    const invite = await this.db.e_booklet_invites.create({
      data: {
        booklet_instance_id: instanceId,
        teacher_id: teacherId,
        token_hash: hashInviteToken(token),
        share_token_ciphertext: encryptInviteShareToken(token),
        passcode_hash: passcode ? this.hashPasscode(passcode) : undefined,
        passcode_hint: dto.passcode_hint,
        max_uses: dto.max_uses,
        expires_at: dto.expires_at ? new Date(dto.expires_at) : undefined,
        status: "active",
      },
      select: {
        id: true,
        booklet_instance_id: true,
        teacher_id: true,
        passcode_hash: true,
        passcode_hint: true,
        max_uses: true,
        used_count: true,
        expires_at: true,
        status: true,
        created_at: true,
      },
    });
    const safeInvite = {
      id: invite.id,
      booklet_instance_id: invite.booklet_instance_id,
      teacher_id: invite.teacher_id,
      passcode_hint: invite.passcode_hint,
      max_uses: invite.max_uses,
      used_count: invite.used_count,
      expires_at: invite.expires_at,
      status: invite.status,
      created_at: invite.created_at,
      has_passcode: Boolean(invite.passcode_hash),
    };
    return generatedPasscode
      ? { invite: safeInvite, token, passcode: generatedPasscode }
      : { invite: safeInvite, token };
  }

  async listInvites(instanceId: number, teacherId: number): Promise<unknown[]> {
    const invites = await this.db.e_booklet_invites.findMany({
      where: { booklet_instance_id: instanceId, teacher_id: teacherId },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        booklet_instance_id: true,
        teacher_id: true,
        share_token_ciphertext: true,
        passcode_hash: true,
        passcode_hint: true,
        max_uses: true,
        used_count: true,
        expires_at: true,
        status: true,
        created_at: true,
      },
    });
    return invites.map(({ share_token_ciphertext: shareTokenCiphertext, passcode_hash: passcodeHash, ...invite }) => ({
      ...invite,
      token: decryptInviteShareToken(shareTokenCiphertext),
      has_passcode: Boolean(passcodeHash),
    }));
  }

  async disableInvite(inviteId: number, teacherId: number): Promise<unknown> {
    return this.db.e_booklet_invites.updateMany({
      where: { id: inviteId, teacher_id: teacherId },
      data: { status: "disabled" },
    });
  }

  async listInstanceStudents(instanceId: number, teacherId?: number) {
    const instanceWhere: Record<string, unknown> = { id: instanceId };
    if (teacherId) instanceWhere.teacher_id = teacherId;
    const instance = await this.db.e_booklet_instances.findFirst({
      where: instanceWhere,
      select: { id: true },
    });
    if (!instance) throw new NotFoundError("Teacher e-booklet not found");

    return this.db.e_booklet_access.findMany({
      where: {
        booklet_instance_id: instanceId,
        role: "student",
      },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { granted_at: "desc" },
    });
  }

  async revokeStudentAccess(
    instanceId: number,
    studentId: number,
    actorUserId: number,
  ): Promise<unknown> {
    const instance = await this.db.e_booklet_instances.findFirst({
      where: { id: instanceId, teacher_id: actorUserId },
      select: { id: true },
    });
    if (!instance) throw new NotFoundError("Teacher e-booklet not found");

    const revokedAt = new Date();
    await this.db.e_booklet_audit_logs.create({
      data: {
        actor_user_id: actorUserId,
        action: "student_access_revoked",
        entity_type: "e_booklet_instance",
        entity_id: instanceId,
        metadata_json: { student_id: studentId },
      },
    });
    return this.db.e_booklet_access.updateMany({
      where: {
        booklet_instance_id: instanceId,
        user_id: studentId,
        role: "student",
        status: "active",
      },
      data: { status: "revoked", revoked_at: revokedAt },
    });
  }

  async listUserEBooklets(userId: number, role: "teacher" | "student") {
    const access = await this.db.e_booklet_access.findMany({
      where: {
        user_id: userId,
        role,
        status: "active",
      },
      include: {
        booklet_instance: {
          include: {
            template: true,
            template_version: true,
            teacher: { select: { id: true, name: true } },
            devices: { select: { id: true, status: true } },
          },
        },
      },
      orderBy: { granted_at: "desc" },
    });
    const withDeviceCounts = access.map(({ booklet_instance: bookletInstance, ...record }: any) => {
      const { devices = [], ...safeInstance } = bookletInstance ?? {};
      return {
        ...record,
        booklet_instance: {
          ...safeInstance,
          used_devices_count: devices.filter((device: any) => device.status === "active").length,
        },
      };
    });
    return this.sanitizeViewerAccess(withDeviceCounts);
  }

  async assertViewerAccess(instanceId: number, userId: number, now = new Date()) {
    const access = await this.db.e_booklet_access.findFirst({
      where: {
        booklet_instance_id: instanceId,
        user_id: userId,
        status: "active",
      },
      include: {
        booklet_instance: {
          include: {
            template: true,
            template_version: true,
            teacher: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!access || access.booklet_instance?.status !== "active") {
      throw new ForbiddenError("You do not have access to this e-booklet.");
    }
    const expiresAt = access.booklet_instance?.access_expires_at
      ? new Date(access.booklet_instance.access_expires_at)
      : null;
    if (expiresAt && expiresAt <= now) {
      await this.db.e_booklet_instances.update({
        where: { id: access.booklet_instance.id },
        data: {
          status: "archived",
          archived_at: now,
          archive_reason: "expired",
          updated_at: now,
        },
      });
      throw new ForbiddenError("This e-booklet has expired.");
    }
    return this.sanitizeViewerAccess(access);
  }

  async listViewerDevices(instanceId: number, userId: number) {
    return this.db.e_booklet_devices.findMany({
      where: { booklet_instance_id: instanceId, user_id: userId, status: "active" },
      orderBy: { last_seen_at: "desc" },
    });
  }

  async bindViewerDevice(
    instanceId: number,
    userId: number,
    input: {
      deviceFingerprint: string;
      deviceLabel?: string;
      userAgent?: string;
      ipAddress?: string;
    },
  ) {
    await this.assertViewerAccess(instanceId, userId);
    return this.serializableTransaction(async (tx: EBookletDb) => {
      const existing = await tx.e_booklet_devices.findFirst({
        where: {
          booklet_instance_id: instanceId,
          user_id: userId,
          device_fingerprint: input.deviceFingerprint,
          status: "active",
        },
      });
      if (existing) {
        return tx.e_booklet_devices.update({
          where: { id: existing.id },
          data: {
            last_seen_at: new Date(),
            user_agent: input.userAgent,
            ip_address: input.ipAddress,
          },
        });
      }

      const allowance = await tx.e_booklet_device_allowances.findUnique({
        where: {
          booklet_instance_id_user_id: {
            booklet_instance_id: instanceId,
            user_id: userId,
          },
        },
      });
      const allowedDevices = Number(allowance?.allowed_devices ?? 1);
      const activeCount = await tx.e_booklet_devices.count({
        where: { booklet_instance_id: instanceId, user_id: userId, status: "active" },
      });
      if (activeCount >= allowedDevices) {
        throw new ForbiddenError(
          "This e-booklet is already bound to another device.",
        );
      }
      const reusableDevice = await tx.e_booklet_devices.findFirst({
        where: {
          booklet_instance_id: instanceId,
          user_id: userId,
          device_fingerprint: input.deviceFingerprint,
          status: { not: "active" },
        },
      });
      if (reusableDevice) {
        return tx.e_booklet_devices.update({
          where: { id: reusableDevice.id },
          data: {
            status: "active",
            device_label: input.deviceLabel,
            user_agent: input.userAgent,
            ip_address: input.ipAddress,
            last_seen_at: new Date(),
          },
        });
      }
      try {
        return await tx.e_booklet_devices.create({
          data: {
            booklet_instance_id: instanceId,
            user_id: userId,
            device_fingerprint: input.deviceFingerprint,
            device_label: input.deviceLabel,
            user_agent: input.userAgent,
            ip_address: input.ipAddress,
            last_seen_at: new Date(),
            status: "active",
          },
        });
      } catch (error: any) {
        if (error?.code === "P2002") {
          throw new ForbiddenError(
            "This e-booklet is already bound to another device.",
          );
        }
        throw error;
      }
    });
  }

  async resetViewerDevices(
    instanceId: number,
    userId: number,
    adminUserId: number,
    reason?: string,
  ) {
    const result = await this.db.e_booklet_devices.updateMany({
      where: { booklet_instance_id: instanceId, user_id: userId, status: "active" },
      data: {
        status: "reset",
        reset_by_admin_id: adminUserId,
        reset_reason: reason,
        last_seen_at: new Date(),
      },
    });
    await this.auditSafely(this.db, {
      actor_user_id: adminUserId,
      action: "viewer_devices_reset",
      entity_type: "e_booklet_instance",
      entity_id: instanceId,
      metadata_json: { user_id: userId, reason, reset_count: result?.count ?? 0 },
    });
    return result;
  }

  async addDeviceAllowance(
    instanceId: number,
    userId: number,
    adminUserId: number,
    allowedDevices: number,
    reason?: string,
  ) {
    if (!Number.isInteger(allowedDevices) || allowedDevices < 1) {
      throw new BadRequestError("Allowed devices must be at least 1.");
    }
    const allowance = await this.db.e_booklet_device_allowances.upsert({
      where: {
        booklet_instance_id_user_id: {
          booklet_instance_id: instanceId,
          user_id: userId,
        },
      },
      create: {
        booklet_instance_id: instanceId,
        user_id: userId,
        allowed_devices: allowedDevices,
        updated_by_admin_id: adminUserId,
        reason,
        updated_at: new Date(),
      },
      update: {
        allowed_devices: allowedDevices,
        updated_by_admin_id: adminUserId,
        reason,
        updated_at: new Date(),
      },
    });
    await this.auditSafely(this.db, {
      actor_user_id: adminUserId,
      action: "viewer_device_allowance_updated",
      entity_type: "e_booklet_instance",
      entity_id: instanceId,
      metadata_json: { user_id: userId, allowed_devices: allowedDevices, reason },
    });
    return allowance;
  }

  async getViewerMetadata(instanceId: number, userId: number) {
    const access = await this.assertViewerAccess(instanceId, userId);
    await this.db.e_booklet_audit_logs.create({
      data: {
        actor_user_id: userId,
        action: "booklet_opened",
        entity_type: "e_booklet_instance",
        entity_id: instanceId,
      },
    });
    await this.recordAnalyticsEvent(this.db, {
      event_type: "viewer_opened",
      teacher_id: (access as any).booklet_instance?.teacher_id,
      student_id: userId,
      template_id: (access as any).booklet_instance?.template_id,
      booklet_instance_id: instanceId,
      access_id: (access as any).id,
      source: (access as any).access_source,
    });
    return access;
  }

  async getViewerPage(instanceId: number, pageNumber: number, userId: number) {
    const access: any = await this.assertViewerAccess(instanceId, userId);
    const pageCount = Number(
      access.booklet_instance?.template_version?.page_count || 0,
    );
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > pageCount) {
      throw new BadRequestError("Invalid e-booklet page number.");
    }

    const expiresAt = new Date(Date.now() + VIEWER_PAGE_TOKEN_TTL_MS);
    await this.db.e_booklet_audit_logs.create({
      data: {
        actor_user_id: userId,
        action: "page_viewed",
        entity_type: "e_booklet_instance",
        entity_id: instanceId,
        metadata_json: { page_number: pageNumber },
      },
    });
    return {
      pageNumber,
      renderMode: "server-page",
      pageAccessToken: createViewerPageToken({
        instanceId,
        pageNumber,
        userId,
        expiresAt,
      }),
      expiresAt,
      cacheControl: "private, no-store",
      watermark: {
        teacherName: access.booklet_instance?.teacher?.name || null,
        templateTitle: access.booklet_instance?.template?.title || null,
      },
      message: "Page rendering pipeline is pending document renderer integration.",
    };
  }

  async getViewerPageHotspots(
    instanceId: number,
    pageNumber: number,
    userId: number,
  ) {
    const access: any = await this.assertViewerAccess(instanceId, userId);
    const hotspots = await this.db.e_booklet_hotspots.findMany({
      where: {
        template_version_id: access.booklet_instance.template_version_id,
        page_number: pageNumber,
        is_active: true,
      },
      orderBy: { sort_order: "asc" },
    });
    return hotspots.map((hotspot: any) => this.normalizeHotspotRecord(hotspot));
  }

  async getAuthorizedHotspotAsset(hotspotId: number, assetId: number, userId: number) {
    const hotspot = await this.db.e_booklet_hotspots.findUnique({
      where: { id: hotspotId },
      include: {
        template_version: {
          include: {
            instances: {
              where: {
                access_records: {
                  some: { user_id: userId, status: "active" },
                },
              },
              take: 1,
            },
          },
        },
      },
    });
    const referencedAssetIds = new Set<number>();
    if (hotspot?.asset_file_id) referencedAssetIds.add(Number(hotspot.asset_file_id));
    const blocks = Array.isArray(hotspot?.content_json?.blocks)
      ? hotspot.content_json.blocks
      : [];
    blocks.forEach((block: any) => {
      if (block?.asset_file_id) referencedAssetIds.add(Number(block.asset_file_id));
    });

    if (!hotspot || !referencedAssetIds.has(assetId) || !hotspot.template_version?.instances?.length) {
      throw new ForbiddenError("You do not have access to this hotspot asset.");
    }

    const instanceId = hotspot.template_version.instances[0].id;
    await this.assertViewerAccess(instanceId, userId);

    const asset = await this.db.e_booklet_file_assets.findUnique({
      where: { id: assetId },
    });
    if (!asset) throw new NotFoundError("E-booklet file asset not found");

    await this.db.e_booklet_audit_logs.create({
      data: {
        actor_user_id: userId,
        action: "hotspot_file_downloaded",
        entity_type: "e_booklet_hotspot",
        entity_id: hotspotId,
        metadata_json: { asset_id: assetId, booklet_instance_id: instanceId },
      },
    });

    const filename = path.basename(asset.storage_key || "");
    return {
      asset: {
        id: asset.id,
        file_type: asset.file_type,
        original_filename: asset.original_filename,
        mime_type: asset.mime_type,
        size_bytes: asset.size_bytes,
        visibility: asset.visibility,
      },
      absolutePath: path.join(E_BOOKLET_UPLOAD_DIR, filename),
      cacheControl: "private, no-store",
    };
  }

  async getHotspotContent(hotspotId: number, userId: number) {
    const hotspot = await this.db.e_booklet_hotspots.findUnique({
      where: { id: hotspotId },
      include: {
        asset_file: true,
        template_version: {
          include: {
            instances: {
              where: {
                access_records: {
                  some: { user_id: userId, status: "active" },
                },
              },
              take: 1,
            },
          },
        },
      },
    });
    if (!hotspot || !hotspot.template_version.instances.length) {
      throw new ForbiddenError("You do not have access to this hotspot.");
    }
    await this.assertViewerAccess(hotspot.template_version.instances[0].id, userId);
    return {
      id: hotspot.id,
      template_version_id: hotspot.template_version_id,
      page_number: hotspot.page_number,
      x_percent: hotspot.x_percent,
      y_percent: hotspot.y_percent,
      radius_percent: hotspot.radius_percent,
      type: hotspot.type,
      title: hotspot.title,
      text_content: hotspot.text_content,
      asset_file_id: hotspot.asset_file_id,
      trigger_type: hotspot.trigger_type,
      display_behavior: hotspot.display_behavior,
      content_json: this.normalizeLegacyHotspotContent(hotspot),
      asset_file: hotspot.asset_file
        ? {
            id: hotspot.asset_file.id,
            file_type: hotspot.asset_file.file_type,
            original_filename: hotspot.asset_file.original_filename,
            mime_type: hotspot.asset_file.mime_type,
            size_bytes: hotspot.asset_file.size_bytes,
            visibility: hotspot.asset_file.visibility,
          }
        : null,
    };
  }

  async validateTeacherDocumentForDelivery(
    input: ValidateTeacherDocumentInput,
  ): Promise<{ valid: true; warnings: string[] }> {
    const templateVersion = await this.db.e_booklet_template_versions.findUnique({
      where: { id: input.templateVersionId },
      select: {
        id: true,
        page_count: true,
        page_dimensions_json: true,
      },
    });

    if (!templateVersion) {
      throw new NotFoundError("E-booklet template version not found");
    }

    if (templateVersion.page_count !== input.uploadedPageCount) {
      throw new BadRequestError(
        `This file does not match the selected e-booklet template. Expected: ${templateVersion.page_count} pages. Uploaded file: ${input.uploadedPageCount} pages. Please upload a file with the same number of pages.`,
      );
    }

    const expectedDimensions =
      templateVersion.page_dimensions_json as PageDimensions[] | null;
    const warnings: string[] = [];

    if (dimensionsDiffer(expectedDimensions, input.uploadedPageDimensions)) {
      warnings.push(
        "This file has the same page count, but some page dimensions differ from the template. Hotspot positions may not align correctly.",
      );
    }

    return { valid: true, warnings };
  }

  private requireStudentTerms(input: TermsInput): void {
    if (!input.termsAccepted) {
      throw new BadRequestError("Student terms acceptance is required.");
    }
  }

  private async recordAnalyticsEvent(db: EBookletDb, input: Record<string, any>) {
    if (!db?.e_booklet_analytics_events?.create) return;
    const { ip_address, ipAddress, user_agent, userAgent, raw_passcode, passcode, ...safe } = input;
    try {
      await db.e_booklet_analytics_events.create({
        data: {
          ...safe,
          metadata: this.redactAnalyticsMetadata({
            ...(safe.metadata || {}),
            ip_redacted: ip_address || ipAddress ? "captured_for_security" : undefined,
            user_agent_family: this.userAgentFamily(user_agent || userAgent),
          }),
        },
      });
    } catch {
      // Analytics must never block access operations.
    }
  }

  private redactAnalyticsMetadata(metadata: Record<string, any>) {
    const { ip_address, ipAddress, user_agent, userAgent, raw_passcode, passcode, wrong_passcode, ...safe } = metadata || {};
    return safe;
  }

  private userAgentFamily(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;
    if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) return "mobile";
    if (/Windows|Macintosh|Linux/i.test(userAgent)) return "desktop";
    return "unknown";
  }

  private analyticsWhere(filters: { teacherId?: number; instanceId?: number; studentId?: number; startDate?: string; endDate?: string; source?: string }) {
    const where: Record<string, any> = {};
    if (filters.teacherId) where.teacher_id = filters.teacherId;
    if (filters.instanceId) where.booklet_instance_id = filters.instanceId;
    if (filters.studentId) where.student_id = filters.studentId;
    if (filters.source) where.source = filters.source;
    if (filters.startDate || filters.endDate) {
      where.created_at = {};
      if (filters.startDate) where.created_at.gte = new Date(filters.startDate);
      if (filters.endDate) where.created_at.lte = new Date(filters.endDate);
    }
    return where;
  }

  async getTeacherAnalytics(teacherId: number, filters: { instanceId?: number; startDate?: string; endDate?: string } = {}) {
    const where = this.analyticsWhere({ teacherId, ...filters });
    const [events, sources, offlineRevenue, onlineRevenue, openAgg, uniqueAnon, failedPasscodes, seatUsage] = await Promise.all([
      this.db.e_booklet_analytics_events.groupBy({ by: ["event_type"], where, _count: { _all: true } }),
      this.db.e_booklet_analytics_events.groupBy({ by: ["source"], where, _count: { _all: true } }),
      this.db.e_booklet_analytics_events.aggregate({ where: { ...where, event_type: "access_created", source: "offline_passcode" }, _sum: { marketing_price_snapshot: true } }),
      this.db.e_booklet_analytics_events.aggregate({ where: { ...where, event_type: "access_created", source: "online_purchase" }, _sum: { marketing_price_snapshot: true } }),
      this.db.e_booklet_analytics_events.aggregate({ where: { ...where, event_type: "invite_opened" }, _count: { _all: true }, _min: { created_at: true }, _max: { created_at: true } }),
      this.db.e_booklet_analytics_events.groupBy({ by: ["anonymous_session_id"], where: { ...where, event_type: "invite_opened", anonymous_session_id: { not: null } }, _count: { _all: true } }),
      this.db.e_booklet_analytics_events.aggregate({ where: { ...where, event_type: { in: ["passcode_failed", "passcode_blocked"] } }, _count: { _all: true } }),
      this.db.e_booklet_instances.findMany ? this.db.e_booklet_instances.findMany({ where: { teacher_id: teacherId, ...(filters.instanceId ? { id: filters.instanceId } : {}) }, select: { id: true, invite_quota: true, used_invites_count: true, status: true, access_expires_at: true } }) : Promise.resolve([]),
    ]);
    return {
      events: Object.fromEntries((events || []).map((row: any) => [row.event_type, row._count?._all ?? 0])),
      inviteOpens: { total: openAgg?._count?._all ?? 0, first: openAgg?._min?.created_at ?? null, last: openAgg?._max?.created_at ?? null, approximateUniqueAnonymousVisitors: (uniqueAnon || []).length },
      sourceBreakdown: Object.fromEntries((sources || []).filter((row: any) => row.source).map((row: any) => [row.source, row._count?._all ?? 0])),
      access: { failedPasscodes: failedPasscodes?._count?._all ?? 0, status: "sanitized_teacher_scope" },
      seatUsage: seatUsage || [],
      devices: { accessStatus: "aggregated", securityDetails: "hidden_from_teacher" },
      revenue: {
        offlineEstimated: Number(offlineRevenue?._sum?.marketing_price_snapshot ?? 0),
        onlineApproved: Number(onlineRevenue?._sum?.marketing_price_snapshot ?? 0),
        purchaseFunnelPending: 0,
      },
    };
  }

  async getAdminAnalytics(filters: { teacherId?: number; instanceId?: number; studentId?: number; startDate?: string; endDate?: string; source?: string } = {}) {
    const where = this.analyticsWhere(filters);
    const [events, sources, revenue, offline, online, failures, instances] = await Promise.all([
      this.db.e_booklet_analytics_events.groupBy({ by: ["event_type"], where, _count: { _all: true } }),
      this.db.e_booklet_analytics_events.groupBy({ by: ["source"], where, _count: { _all: true } }),
      this.db.e_booklet_analytics_events.aggregate({ where: { ...where, event_type: "access_created" }, _sum: { marketing_price_snapshot: true, internal_price_snapshot: true } }),
      this.db.e_booklet_analytics_events.aggregate({ where: { ...where, event_type: "access_created", source: "offline_passcode" }, _sum: { marketing_price_snapshot: true } }),
      this.db.e_booklet_analytics_events.aggregate({ where: { ...where, event_type: "access_created", source: "online_purchase" }, _sum: { marketing_price_snapshot: true } }),
      this.db.e_booklet_analytics_events.aggregate({ where: { ...where, event_type: { in: ["passcode_failed", "passcode_blocked"] } }, _count: { _all: true } }),
      this.db.e_booklet_instances.groupBy ? this.db.e_booklet_instances.groupBy({ by: ["status"], _count: { _all: true } }) : Promise.resolve([]),
    ]);
    const marketing = Number(revenue?._sum?.marketing_price_snapshot ?? 0);
    const internal = Number(revenue?._sum?.internal_price_snapshot ?? 0);
    return {
      events: Object.fromEntries((events || []).map((row: any) => [row.event_type, row._count?._all ?? 0])),
      launchMetrics: { teacher: {}, template: {}, instance: { byStatus: instances || [] }, studentAccess: {}, operationalHealth: { analyticsRetention: "Sanitized security metadata only; purge/export analytics rows per retention policy via database maintenance job." } },
      sourceBreakdown: Object.fromEntries((sources || []).filter((row: any) => row.source).map((row: any) => [row.source, row._count?._all ?? 0])),
      deviceSecurity: { failedPasscodes: failures?._count?._all ?? 0 },
      expiryArchive: { byStatus: instances || [] },
      revenue: {
        marketing,
        internal,
        margin: marketing - internal,
        offlineEstimated: Number(offline?._sum?.marketing_price_snapshot ?? 0),
        onlineApproved: Number(online?._sum?.marketing_price_snapshot ?? 0),
        purchaseFunnelPending: 0,
      },
    };
  }

  async exportAdminAnalyticsCsv(filters: { teacherId?: number; instanceId?: number; studentId?: number; startDate?: string; endDate?: string; source?: string; limit?: number } = {}) {
    const rows = await this.db.e_booklet_analytics_events.findMany({ where: this.analyticsWhere(filters), orderBy: { created_at: "desc" }, take: Math.min(Math.max(filters.limit || 10000, 1), 10000) });
    const header = ["id", "event_type", "teacher_id", "student_id", "anonymous_session_id", "template_id", "booklet_instance_id", "invite_id", "access_id", "purchase_id", "source", "marketing_price_snapshot", "internal_price_snapshot", "created_at"];
    const csv = [header.join(","), ...(rows || []).map((row: any) => header.map((key) => JSON.stringify(row[key] ?? "")).join(","))].join("\n");
    return csv;
  }

  async recordInviteOpen(rawToken: string, input: { anonymousSessionId?: string; studentId?: number; source?: string; ipAddress?: string; userAgent?: string } = {}) {
    const invite = await this.findInviteByToken(rawToken);
    if (!invite) throw new NotFoundError("E-booklet invite not found");
    const instance = invite.booklet_instance ?? invite.e_booklet_instances;
    await this.recordAnalyticsEvent(this.db, {
      event_type: "invite_opened",
      teacher_id: invite.teacher_id ?? instance?.teacher_id,
      student_id: input.studentId,
      anonymous_session_id: input.studentId ? undefined : input.anonymousSessionId,
      template_id: instance?.template_id,
      booklet_instance_id: invite.booklet_instance_id,
      invite_id: invite.id,
      source: input.source,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: { security_context: "ip_user_agent_captured_sanitized" },
    });
    return { invite_id: invite.id, has_passcode: Boolean(invite.passcode_hash), passcode_hint: invite.passcode_hint, anonymous_session_id: input.anonymousSessionId };
  }

  private assertPasscodeNotBlocked(key: string) {
    const now = Date.now();
    const current = passcodeFailures.get(key);
    if (current?.blockedUntil && current.blockedUntil > now) throw new ForbiddenError(PASSCODE_BLOCK_MESSAGE);
  }

  private registerPasscodeFailure(key: string) {
    const now = Date.now();
    const current = passcodeFailures.get(key);
    const next = !current || now - current.firstFailureAt > PASSCODE_WINDOW_MS
      ? { count: 1, firstFailureAt: now }
      : { ...current, count: current.count + 1 };
    if (next.count >= PASSCODE_MAX_FAILURES) next.blockedUntil = now + PASSCODE_BLOCK_MS;
    passcodeFailures.set(key, next);
  }

  private clearPasscodeFailures(key: string) {
    passcodeFailures.delete(key);
  }

  private passcodeRateLimitKeys(tokenHash: string, studentId: number, meta: AcceptInviteMeta = {}) {
    return [
      `invite:${tokenHash}:student:${studentId}`,
      meta.ipAddress ? `invite:${tokenHash}:ip:${crypto.createHash("sha256").update(meta.ipAddress).digest("hex").slice(0, 16)}` : undefined,
      meta.deviceFingerprint ? `invite:${tokenHash}:device:${crypto.createHash("sha256").update(meta.deviceFingerprint).digest("hex").slice(0, 16)}` : undefined,
    ].filter(Boolean) as string[];
  }

  private hashPasscode(passcode: string): string {
    const pepper =
      process.env.E_BOOKLET_PASSCODE_PEPPER ||
      process.env.APP_SECRET ||
      process.env.JWT_SECRET ||
      process.env.E_BOOKLET_PAGE_TOKEN_SECRET ||
      "dev-e-booklet-passcode-pepper";
    // Six-digit passcodes have tiny entropy; HMAC with a server-only pepper
    // prevents useful offline cracking if invite rows are exposed.
    return crypto.createHmac("sha256", pepper).update(passcode).digest("hex");
  }

  private async findInviteByToken(rawToken: string) {
    return this.db.e_booklet_invites.findFirst({
      where: { token_hash: hashInviteToken(rawToken) },
      include: {
        booklet_instance: {
          select: {
            id: true,
            invite_quota: true,
            status: true,
            teacher_id: true,
            template_id: true,
            student_marketing_price: true,
            internal_price: true,
          },
        },
      },
    });
  }

  private ensureInviteUsable(invite: any): any {
    if (!invite) throw new NotFoundError("E-booklet invite not found");
    if (invite.status && invite.status !== "active") {
      throw new ForbiddenError("This e-booklet invite is not active.");
    }
    if (invite.expires_at && new Date(invite.expires_at) <= new Date()) {
      throw new ForbiddenError("This e-booklet invite has expired.");
    }
    const instance = invite.booklet_instance ?? invite.e_booklet_instances;
    if (!instance || instance.status !== "active") {
      throw new ForbiddenError("This e-booklet is not currently active.");
    }
    return instance;
  }

  async approveStudentPurchaseLink(purchaseId: number, adminUserId: number) {
    try {
      return await this.serializableTransaction(async (tx: EBookletDb) => {
      const link = await tx.e_booklet_student_purchase_links.findUnique({
        where: { purchase_id: purchaseId },
        include: { invite: true, booklet_instance: true },
      });
      if (!link) throw new NotFoundError("E-booklet student purchase link not found");
      if (link.access_id) return link;
      const instance = this.ensureInviteUsable({ ...link.invite, booklet_instance: link.booklet_instance });
      const existingAccess = await tx.e_booklet_access.findFirst({
        where: {
          booklet_instance_id: link.booklet_instance_id,
          user_id: link.student_id,
          role: "student",
          status: "active",
        },
      });
      let access = existingAccess;
      if (!access) {
        if (link.invite?.max_uses !== null && link.invite?.max_uses !== undefined && link.invite.used_count >= link.invite.max_uses) {
          throw new ForbiddenError("This e-booklet invite has reached its access limit.");
        }
        const activeStudentAccessCount = await tx.e_booklet_access.count({
          where: { booklet_instance_id: link.booklet_instance_id, role: "student", status: "active" },
        });
        if (activeStudentAccessCount >= instance.invite_quota) {
          throw new ForbiddenError("This e-booklet invite has reached its access limit.");
        }
        access = await tx.e_booklet_access.create({
          data: {
            booklet_instance_id: link.booklet_instance_id,
            user_id: link.student_id,
            role: "student",
            source_invite_id: link.invite_id,
            access_source: "online_purchase",
            terms_accepted_at: link.terms_accepted_at,
            terms_version: link.terms_version,
            status: "active",
          },
        });
        await this.recordAnalyticsEvent(tx, {
          event_type: "access_created",
          teacher_id: (link as any).booklet_instance?.teacher_id ?? (link as any).invite?.teacher_id,
          student_id: link.student_id,
          template_id: (link as any).booklet_instance?.template_id,
          booklet_instance_id: link.booklet_instance_id,
          invite_id: link.invite_id,
          access_id: access.id,
          purchase_id: purchaseId,
          source: "online_purchase",
          marketing_price_snapshot: Number((link as any).marketing_price_snapshot ?? (link as any).booklet_instance?.student_marketing_price ?? 0),
          internal_price_snapshot: Number((link as any).booklet_instance?.internal_price ?? 0),
          metadata: { terms_version: link.terms_version },
        });
        await tx.e_booklet_invites.update({
          where: { id: link.invite_id },
          data: { used_count: { increment: 1 } },
        });
        await tx.e_booklet_instances.update({
          where: { id: link.booklet_instance_id },
          data: { used_invites_count: { increment: 1 } },
        });
      }
      const approved = await tx.e_booklet_student_purchase_links.update({
        where: { purchase_id: purchaseId },
        data: { access_id: access.id, approved_at: new Date() },
      });
      await tx.e_booklet_audit_logs.create({
        data: {
          actor_user_id: adminUserId,
          action: "student_purchase_approved",
          entity_type: "e_booklet_instance",
          entity_id: link.booklet_instance_id,
          metadata_json: { purchase_id: purchaseId, access_id: access.id },
        },
      });
      return approved;
      });
    } catch (error: any) {
      await this.auditSafely(this.db, {
        actor_user_id: adminUserId,
        action: "student_purchase_approval_failed",
        entity_type: "purchase",
        entity_id: purchaseId,
        metadata_json: { reason: error?.message },
      });
      throw error;
    }
  }

  async createStudentPurchaseLink(
    rawToken: string,
    studentId: number,
    input: TermsInput,
  ) {
    try {
      this.requireStudentTerms(input);
      if (!input.purchaseId) {
        throw new BadRequestError("Student purchase ID is required.");
      }
      const invite = await this.findInviteByToken(rawToken);
      const instance = this.ensureInviteUsable(invite);
      const purchase = await this.db.purchases.findFirst({
        where: {
          id: input.purchaseId,
          user_id: studentId,
        },
      });
      if (!purchase) {
        throw new ForbiddenError("Purchase does not belong to this student.");
      }
      const existingProofFileId = Number((purchase as any).payment_screenshot_id || 0) || undefined;
      const proofFileId = input.paymentProofFileId ?? existingProofFileId;
      if (!proofFileId) {
        throw new BadRequestError("Payment proof is required for online e-booklet invite purchases.");
      }
      if (input.paymentProofFileId && existingProofFileId && input.paymentProofFileId !== existingProofFileId) {
        throw new BadRequestError("Payment proof file does not match the generic purchase proof.");
      }
      if (input.paymentProofFileId && !existingProofFileId) {
        const proofAsset = await this.db.e_booklet_file_assets.findUnique({
          where: { id: input.paymentProofFileId },
        });
        const proofOwnerType = String(proofAsset?.owner_type || "");
        const proofOwnerId = Number(proofAsset?.owner_id || 0);
        const allowedProofOwner =
          proofOwnerType === "student" && proofOwnerId === studentId ||
          proofOwnerType === "purchase" && proofOwnerId === input.purchaseId ||
          proofOwnerType === "student_purchase_proof" && (proofOwnerId === studentId || proofOwnerId === input.purchaseId);
        if (!proofAsset || !allowedProofOwner) {
          throw new ForbiddenError("Payment proof file does not belong to this purchase.");
        }
      }
      const link = await this.db.e_booklet_student_purchase_links.create({
        data: {
          purchase_id: input.purchaseId,
          invite_id: invite.id,
          booklet_instance_id: invite.booklet_instance_id,
          student_id: studentId,
          marketing_price_snapshot: Number(instance.student_marketing_price ?? 0),
          terms_accepted_at: new Date(),
          terms_version: input.termsVersion,
        },
      });
      await this.recordAnalyticsEvent(this.db, {
        event_type: "online_purchase_selected",
        teacher_id: invite.teacher_id ?? (instance as any).teacher_id,
        student_id: studentId,
        template_id: (instance as any).template_id,
        booklet_instance_id: invite.booklet_instance_id,
        invite_id: invite.id,
        purchase_id: input.purchaseId,
        source: "online_purchase",
        marketing_price_snapshot: Number(instance.student_marketing_price ?? 0),
        metadata: { terms_version: input.termsVersion, payment_proof_uploaded: Boolean(proofFileId) },
      });
      await this.auditSafely(this.db, {
        actor_user_id: studentId,
        action: "student_purchase_link_created",
        entity_type: "e_booklet_instance",
        entity_id: invite.booklet_instance_id,
        metadata_json: {
          invite_id: invite.id,
          purchase_id: input.purchaseId,
          payment_proof_file_id: proofFileId,
          marketing_price_snapshot: Number(instance.student_marketing_price ?? 0),
          terms_version: input.termsVersion,
        },
      });
      return link;
    } catch (error: any) {
      await this.auditSafely(this.db, {
        actor_user_id: studentId,
        action: "student_purchase_link_failed",
        entity_type: "purchase",
        entity_id: input.purchaseId ?? 0,
        metadata_json: { reason: error?.message, invite_token_hash: hashInviteToken(rawToken) },
      });
      throw error;
    }
  }

  async acceptInvitePasscode(
    rawToken: string,
    studentId: number,
    input: TermsInput,
    meta: AcceptInviteMeta = {},
  ) {
    const tokenHash = hashInviteToken(rawToken);
    const rateLimitKeys = this.passcodeRateLimitKeys(tokenHash, studentId, meta);
    try {
      this.requireStudentTerms(input);
      for (const key of rateLimitKeys) this.assertPasscodeNotBlocked(key);
      return await this.transaction(async (tx: EBookletDb) => {
      const invite = await tx.e_booklet_invites.findFirst({
        where: { token_hash: tokenHash },
        include: { booklet_instance: { select: { id: true, invite_quota: true, status: true, student_marketing_price: true, internal_price: true } } },
      });
      const instance = this.ensureInviteUsable(invite);
      if (!invite.passcode_hash) {
        throw new ForbiddenError("This e-booklet invite does not allow passcode access.");
      }
      if (this.hashPasscode(String(input.passcode || "")) !== invite.passcode_hash) {
        for (const key of rateLimitKeys) this.registerPasscodeFailure(key);
        await this.recordAnalyticsEvent(tx, {
          event_type: rateLimitKeys.some((key) => passcodeFailures.get(key)?.blockedUntil) ? "passcode_blocked" : "passcode_failed",
          teacher_id: invite.teacher_id ?? (instance as any).teacher_id,
          student_id: studentId,
          template_id: (instance as any).template_id,
          booklet_instance_id: invite.booklet_instance_id,
          invite_id: invite.id,
          source: "offline_passcode",
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          metadata: { reason: "invalid_or_blocked", dimensions: { student: true, invite: true, ip: Boolean(meta.ipAddress), device: Boolean(meta.deviceFingerprint) } },
        });
        throw new ForbiddenError(PASSCODE_BLOCK_MESSAGE);
      }
      for (const key of rateLimitKeys) this.clearPasscodeFailures(key);
      if (invite.max_uses !== null && invite.max_uses !== undefined && invite.used_count >= invite.max_uses) {
        throw new ForbiddenError("This e-booklet invite has reached its access limit.");
      }
      const existingAccess = await tx.e_booklet_access.findFirst({
        where: {
          booklet_instance_id: invite.booklet_instance_id,
          user_id: studentId,
          role: "student",
          status: "active",
        },
      });
      if (existingAccess) {
        await tx.e_booklet_audit_logs.create({
          data: {
            actor_user_id: studentId,
            action: "invite_passcode_accepted",
            entity_type: "e_booklet_instance",
            entity_id: invite.booklet_instance_id,
            metadata_json: {
              invite_id: invite.id,
              access_id: existingAccess.id,
              already_had_access: true,
              marketing_price_snapshot: Number((instance as any).student_marketing_price ?? 0),
              terms_version: input.termsVersion,
            },
          },
        });
        return existingAccess;
      }
      const activeStudentAccessCount = await tx.e_booklet_access.count({
        where: {
          booklet_instance_id: invite.booklet_instance_id,
          role: "student",
          status: "active",
        },
      });
      if (activeStudentAccessCount >= instance.invite_quota) {
        throw new ForbiddenError("This e-booklet invite has reached its access limit.");
      }
      const access = await tx.e_booklet_access.create({
        data: {
          booklet_instance_id: invite.booklet_instance_id,
          user_id: studentId,
          role: "student",
          source_invite_id: invite.id,
          access_source: "offline_passcode",
          terms_accepted_at: new Date(),
          terms_version: input.termsVersion,
          status: "active",
        },
      });
      await this.recordAnalyticsEvent(tx, {
        event_type: "access_created",
        teacher_id: invite.teacher_id ?? (instance as any).teacher_id,
        student_id: studentId,
        template_id: (instance as any).template_id,
        booklet_instance_id: invite.booklet_instance_id,
        invite_id: invite.id,
        access_id: access.id,
        source: "offline_passcode",
        marketing_price_snapshot: Number((instance as any).student_marketing_price ?? 0),
        internal_price_snapshot: Number((instance as any).internal_price ?? 0),
        metadata: { terms_version: input.termsVersion },
      });
      await tx.e_booklet_invites.update({
        where: { id: invite.id },
        data: { used_count: { increment: 1 } },
      });
      await tx.e_booklet_instances.update({
        where: { id: invite.booklet_instance_id },
        data: { used_invites_count: { increment: 1 } },
      });
      await tx.e_booklet_audit_logs.create({
        data: {
          actor_user_id: studentId,
          action: "invite_passcode_accepted",
          entity_type: "e_booklet_instance",
          entity_id: invite.booklet_instance_id,
          metadata_json: {
            invite_id: invite.id,
            access_id: access.id,
            marketing_price_snapshot: Number((instance as any).student_marketing_price ?? 0),
            terms_version: input.termsVersion,
          },
        },
      });
      return access;
      });
    } catch (error: any) {
      await this.auditSafely(this.db, {
        actor_user_id: studentId,
        action: "invite_passcode_failed",
        entity_type: "e_booklet_invite",
        entity_id: 0,
        metadata_json: { reason: error?.message, invite_token_hash: tokenHash },
      });
      throw error;
    }
  }

  async acceptFreeInvite(rawToken: string, studentId: number, input: TermsInput) {
    const tokenHash = hashInviteToken(rawToken);
    try {
      this.requireStudentTerms(input);
      return await this.transaction(async (tx: EBookletDb) => {
      const invite = await tx.e_booklet_invites.findFirst({
        where: { token_hash: tokenHash },
        include: {
          booklet_instance: {
            select: { id: true, invite_quota: true, status: true, student_marketing_price: true, internal_price: true },
          },
        },
      });
      const instance = this.ensureInviteUsable(invite);
      if (Number(instance.student_marketing_price ?? 0) !== 0 || Number(instance.internal_price ?? 0) !== 0) {
        throw new ForbiddenError("This e-booklet invite requires purchase.");
      }
      if (invite.max_uses !== null && invite.max_uses !== undefined && invite.used_count >= invite.max_uses) {
        throw new ForbiddenError("This e-booklet invite has reached its access limit.");
      }
      const existingAccess = await tx.e_booklet_access.findFirst({
        where: {
          booklet_instance_id: invite.booklet_instance_id,
          user_id: studentId,
          role: "student",
          status: "active",
        },
      });
      if (existingAccess) {
        await tx.e_booklet_audit_logs.create({
          data: {
            actor_user_id: studentId,
            action: "free_invite_accepted",
            entity_type: "e_booklet_instance",
            entity_id: invite.booklet_instance_id,
            metadata_json: {
              invite_id: invite.id,
              access_id: existingAccess.id,
              already_had_access: true,
              terms_version: input.termsVersion,
            },
          },
        });
        return existingAccess;
      }
      const activeStudentAccessCount = await tx.e_booklet_access.count({
        where: {
          booklet_instance_id: invite.booklet_instance_id,
          role: "student",
          status: "active",
        },
      });
      if (activeStudentAccessCount >= instance.invite_quota) {
        throw new ForbiddenError("This e-booklet invite has reached its access limit.");
      }
      const access = await tx.e_booklet_access.create({
        data: {
          booklet_instance_id: invite.booklet_instance_id,
          user_id: studentId,
          role: "student",
          source_invite_id: invite.id,
          access_source: "free_invite",
          terms_accepted_at: new Date(),
          terms_version: input.termsVersion,
          status: "active",
        },
      });
      await this.recordAnalyticsEvent(tx, {
        event_type: "access_created",
        teacher_id: invite.teacher_id ?? (instance as any).teacher_id,
        student_id: studentId,
        template_id: (instance as any).template_id,
        booklet_instance_id: invite.booklet_instance_id,
        invite_id: invite.id,
        access_id: access.id,
        source: "free_invite",
        marketing_price_snapshot: Number((instance as any).student_marketing_price ?? 0),
        internal_price_snapshot: Number((instance as any).internal_price ?? 0),
        metadata: { terms_version: input.termsVersion },
      });
      await tx.e_booklet_invites.update({
        where: { id: invite.id },
        data: { used_count: { increment: 1 } },
      });
      await tx.e_booklet_instances.update({
        where: { id: invite.booklet_instance_id },
        data: { used_invites_count: { increment: 1 } },
      });
      await tx.e_booklet_audit_logs.create({
        data: {
          actor_user_id: studentId,
          action: "free_invite_accepted",
          entity_type: "e_booklet_instance",
          entity_id: invite.booklet_instance_id,
          metadata_json: {
            invite_id: invite.id,
            access_id: access.id,
            terms_version: input.termsVersion,
          },
        },
      });
      return access;
      });
    } catch (error: any) {
      await this.auditSafely(this.db, {
        actor_user_id: studentId,
        action: "free_invite_failed",
        entity_type: "e_booklet_invite",
        entity_id: 0,
        metadata_json: { reason: error?.message, invite_token_hash: tokenHash },
      });
      throw error;
    }
  }

  async acceptInvite(
    rawToken: string,
    studentId: number,
    meta: AcceptInviteMeta = {},
  ): Promise<{
    alreadyHadAccess: boolean;
    access: unknown;
    bookletInstanceId: number;
  }> {
    const tokenHash = hashInviteToken(rawToken);

    return this.db.$transaction(async (tx: EBookletDb) => {
      const invite = await tx.e_booklet_invites.findFirst({
        where: { token_hash: tokenHash },
        include: {
          booklet_instance: {
            select: {
              id: true,
              invite_quota: true,
              status: true,
            },
          },
        },
      });

      if (!invite) {
        throw new NotFoundError("E-booklet invite not found");
      }
      if (invite.status !== "active") {
        throw new ForbiddenError("This e-booklet invite is not active.");
      }
      if (invite.expires_at && new Date(invite.expires_at) <= new Date()) {
        throw new ForbiddenError("This e-booklet invite has expired.");
      }
      if (
        invite.max_uses !== null &&
        invite.max_uses !== undefined &&
        invite.used_count >= invite.max_uses
      ) {
        throw new ForbiddenError(
          "This e-booklet invite has reached its access limit.",
        );
      }

      const bookletInstance =
        invite.booklet_instance ?? invite.e_booklet_instances;
      if (!bookletInstance || bookletInstance.status !== "active") {
        throw new ForbiddenError("This e-booklet is not currently active.");
      }

      const existingAccess = await tx.e_booklet_access.findFirst({
        where: {
          booklet_instance_id: invite.booklet_instance_id,
          user_id: studentId,
          role: "student",
          status: "active",
        },
      });

      if (existingAccess) {
        return {
          alreadyHadAccess: true,
          access: existingAccess,
          bookletInstanceId: invite.booklet_instance_id,
        };
      }

      const activeStudentAccessCount = await tx.e_booklet_access.count({
        where: {
          booklet_instance_id: invite.booklet_instance_id,
          role: "student",
          status: "active",
        },
      });

      if (activeStudentAccessCount >= bookletInstance.invite_quota) {
        throw new ForbiddenError(
          "This e-booklet invite has reached its access limit.",
        );
      }

      const access = await tx.e_booklet_access.create({
        data: {
          booklet_instance_id: invite.booklet_instance_id,
          user_id: studentId,
          role: "student",
          source_invite_id: invite.id,
          status: "active",
        },
      });

      await tx.e_booklet_invite_redemptions.create({
        data: {
          invite_id: invite.id,
          booklet_instance_id: invite.booklet_instance_id,
          student_id: studentId,
          ip_address: meta.ipAddress,
          user_agent: meta.userAgent,
        },
      });

      await tx.e_booklet_invites.update({
        where: { id: invite.id },
        data: { used_count: { increment: 1 } },
      });

      await tx.e_booklet_instances.update({
        where: { id: invite.booklet_instance_id },
        data: { used_invites_count: { increment: 1 } },
      });

      await tx.e_booklet_audit_logs.create({
        data: {
          actor_user_id: studentId,
          action: "invite_redeemed",
          entity_type: "e_booklet_instance",
          entity_id: invite.booklet_instance_id,
          metadata_json: {
            invite_id: invite.id,
          },
          ip_address: meta.ipAddress,
          user_agent: meta.userAgent,
        },
      });

      return {
        alreadyHadAccess: false,
        access,
        bookletInstanceId: invite.booklet_instance_id,
      };
    });
  }

  async revokeTeacherAccess(
    bookletInstanceId: number,
    actorUserId: number,
    revokedAt = new Date(),
  ): Promise<void> {
    await this.db.e_booklet_instances.update({
      where: { id: bookletInstanceId },
      data: {
        status: "suspended",
        updated_at: revokedAt,
      },
    });

    await this.db.e_booklet_access.updateMany({
      where: {
        booklet_instance_id: bookletInstanceId,
        status: "active",
      },
      data: {
        status: "revoked",
        revoked_at: revokedAt,
      },
    });

    await this.db.e_booklet_audit_logs.create({
      data: {
        actor_user_id: actorUserId,
        action: "teacher_access_revoked",
        entity_type: "e_booklet_instance",
        entity_id: bookletInstanceId,
        metadata_json: {
          cascaded_student_access: true,
        },
      },
    });
  }
}

let serviceSingleton: EBookletService | null = null;

export function getEBookletService(): EBookletService {
  if (!serviceSingleton) {
    serviceSingleton = new EBookletService();
  }
  return serviceSingleton;
}