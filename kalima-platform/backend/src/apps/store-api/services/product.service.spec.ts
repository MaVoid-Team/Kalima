import "reflect-metadata";

jest.mock("../../../libs/db/prisma", () => ({
  prisma: {},
}));

jest.mock("./image.service", () => ({
  imageService: {},
}));

jest.mock("./review.service", () => ({
  reviewService: {
    getAggregatedRating: jest.fn().mockResolvedValue({
      averageRating: 0,
      reviewCount: 0,
    }),
  },
}));

jest.mock("./sample.service", () => ({
  sampleService: {},
}));

import { ProductService } from "./product.service";
import fsPromises from "fs/promises";
import os from "os";
import path from "path";

describe("ProductService category filtering", () => {
  it("includes products attached to a selected category's descendants", async () => {
    const db = {
      categories: {
        findMany: jest
          .fn()
          .mockResolvedValueOnce([{ id: 2 }])
          .mockResolvedValueOnce([{ id: 3 }])
          .mockResolvedValueOnce([]),
      },
      products: {
        findMany: jest.fn().mockResolvedValue([{ id: 101 }]),
        count: jest.fn().mockResolvedValue(1),
      },
    } as any;
    const service = new ProductService(db);

    const result = await service.getAllProducts(undefined, {
      category_id: 1,
      page: 1,
      limit: 8,
    });

    expect(result.data).toEqual([
      expect.objectContaining({
        id: 101,
        isPurchased: false,
        averageRating: 0,
        reviewCount: 0,
      }),
    ]);
    expect(db.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          product_categories: {
            some: { category_id: { in: [1, 2, 3] } },
          },
        }),
      }),
    );
    expect(db.products.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        product_categories: {
          some: { category_id: { in: [1, 2, 3] } },
        },
      }),
    });
  });

  it("searches products by serial number", async () => {
    const db = {
      products: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    } as any;
    const service = new ProductService(db);

    await service.getAllProducts(undefined, { search: "TEST001" });

    const expectedWhere = expect.objectContaining({
      OR: expect.arrayContaining([
        { serial: { contains: "TEST001", mode: "insensitive" } },
      ]),
    });
    expect(db.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(db.products.count).toHaveBeenCalledWith({ where: expectedWhere });
  });
});

describe("ProductService gallery video uploads", () => {
  it("stores uploaded videos inside the configured uploads directory", async () => {
    const uploadsDir = await fsPromises.mkdtemp(
      path.join(os.tmpdir(), "kalima-gallery-video-"),
    );
    const originalUploadsDir = process.env.UPLOADS_DIR;
    process.env.UPLOADS_DIR = uploadsDir;

    const create = jest.fn(async ({ data }) => ({ id: 1, ...data }));
    const db = {
      products: {
        findFirst: jest.fn().mockResolvedValue({ id: 101 }),
      },
      product_gallery_videos: {
        findFirst: jest.fn().mockResolvedValue(null),
        create,
      },
    } as any;
    const service = new ProductService(db);

    try {
      const result = await service.addVideoToGallery(101, {
        buffer: Buffer.from("test-video"),
        mimetype: "video/mp4",
        originalname: "lesson.mp4",
      } as Express.Multer.File);

      const storedPath = path.join(
        uploadsDir,
        result.url.replace(/^\/uploads\//, ""),
      );
      await expect(fsPromises.readFile(storedPath, "utf8")).resolves.toBe(
        "test-video",
      );
    } finally {
      if (originalUploadsDir === undefined) {
        delete process.env.UPLOADS_DIR;
      } else {
        process.env.UPLOADS_DIR = originalUploadsDir;
      }
      await fsPromises.rm(uploadsDir, { recursive: true, force: true });

      const createdUrl = create.mock.calls[0]?.[0]?.data?.url;
      if (createdUrl) {
        const legacyPath = path.resolve(
          __dirname,
          "../../../..",
          createdUrl.replace(/^\//, ""),
        );
        await fsPromises.rm(legacyPath, { force: true });
      }
    }
  });
});
