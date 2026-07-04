jest.mock("../src/libs/db/prisma", () => ({
  prisma: {},
}));

import { SampleService } from "../src/apps/store-api/services/sample.service";
import { sample_media_type_enum } from "../src/apps/store-api/generated/prisma/client";

describe("SampleService", () => {
  test("keeps high-quality preview metadata when replacing only the low-quality file", async () => {
    const db: any = {
      samples: {
        findFirst: jest.fn().mockResolvedValue({
          id: 12,
          section_id: 3,
          high_quality_url: "/uploads/samples/high.pdf",
          low_quality_url: "/uploads/samples/low.pdf",
          thumbnail_url: null,
          original_name: "high.pdf",
          mime_type: "application/pdf",
          size: 10,
        }),
        update: jest.fn(async ({ data }) => ({ id: 12, ...data })),
      },
    };
    const service = new SampleService(db);
    jest.spyOn(service, "saveFileToDisk").mockResolvedValue("/uploads/samples/new-low.png");

    await service.updateSample(
      12,
      3,
      undefined,
      {
        buffer: Buffer.from("low"),
        mimetype: "image/png",
        originalname: "low.png",
      } as Express.Multer.File,
    );

    expect(db.samples.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        high_quality_url: "/uploads/samples/high.pdf",
        low_quality_url: "/uploads/samples/new-low.png",
        original_name: "high.pdf",
        mime_type: "application/pdf",
        size: 10,
      }),
    }));
  });

  test("uses low-quality metadata when no high-quality preview exists", async () => {
    const db: any = {
      samples: {
        findFirst: jest.fn().mockResolvedValue({
          id: 12,
          section_id: 3,
          high_quality_url: null,
          low_quality_url: "/uploads/samples/low.pdf",
          thumbnail_url: null,
          original_name: "old.pdf",
          mime_type: "application/pdf",
          size: 10,
        }),
        update: jest.fn(async ({ data }) => ({ id: 12, ...data })),
      },
    };
    const service = new SampleService(db);
    jest.spyOn(service, "saveFileToDisk").mockResolvedValue("/uploads/samples/new-low.png");

    await service.updateSample(
      12,
      3,
      undefined,
      {
        buffer: Buffer.from("low"),
        mimetype: "image/png",
        originalname: "low.png",
      } as Express.Multer.File,
    );

    expect(db.samples.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        high_quality_url: null,
        low_quality_url: "/uploads/samples/new-low.png",
        original_name: "low.png",
        mime_type: "image/png",
        size: 3,
      }),
    }));
  });

  test("still updates high-quality metadata when replacing the preview file", async () => {
    const db: any = {
      samples: {
        findFirst: jest.fn().mockResolvedValue({
          id: 12,
          section_id: 3,
          media_type: sample_media_type_enum.pdf,
          high_quality_url: "/uploads/samples/high.pdf",
          low_quality_url: "/uploads/samples/low.pdf",
          thumbnail_url: null,
          original_name: "old.pdf",
          mime_type: "application/pdf",
          size: 10,
        }),
        update: jest.fn(async ({ data }) => ({ id: 12, ...data })),
      },
    };
    const service = new SampleService(db);
    jest.spyOn(service, "saveFileToDisk").mockResolvedValue("/uploads/samples/new-high.png");

    await service.updateSample(
      12,
      3,
      {
        buffer: Buffer.from("high"),
        mimetype: "image/png",
        originalname: "high.png",
      } as Express.Multer.File,
    );

    expect(db.samples.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        high_quality_url: "/uploads/samples/new-high.png",
        low_quality_url: "/uploads/samples/low.pdf",
        original_name: "high.png",
        mime_type: "image/png",
        size: 4,
      }),
    }));
  });
});
