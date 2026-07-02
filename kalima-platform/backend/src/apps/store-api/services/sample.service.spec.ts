jest.mock("../../../libs/db/prisma", () => ({
  prisma: {},
}));

import { SampleService } from "./sample.service";

function createMockDb() {
  return {
    samples: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    sample_sections: {
      findUnique: jest.fn(),
    },
  };
}

describe("SampleService", () => {
  it("includes product pricing fields for the sample details page", async () => {
    const db = createMockDb();
    const sampleService = new SampleService(db as any);

    db.samples.findFirst.mockResolvedValue({
      id: 10,
      section_id: 2,
      product_id: 7,
      products: {
        id: 7,
        title: "Exam Review Poster",
        type: "Product",
        price: "125.00",
        price_after_discount: null,
        serial: "POSTER-125",
        thumbnail_image: { id: 3, url: "/uploads/images/poster.webp" },
      },
      sample_sections: { id: 2, title: "Posters" },
    });

    const sample = await sampleService.getSampleById(10);

    expect(db.samples.findFirst).toHaveBeenCalledWith({
      where: { id: 10 },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            type: true,
            price: true,
            price_after_discount: true,
            serial: true,
            thumbnail_image: true,
          },
        },
        sample_sections: { select: { id: true, title: true } },
      },
    });
    expect((sample as any).products.price).toBe("125.00");
    expect((sample as any).products.type).toBe("Product");
  });

  it("includes product pricing fields for samples listed by section", async () => {
    const db = createMockDb();
    const sampleService = new SampleService(db as any);

    db.sample_sections.findUnique.mockResolvedValue({ id: 2 });
    db.samples.findMany.mockResolvedValue([]);

    await sampleService.getSamplesBySection(2);

    expect(db.samples.findMany).toHaveBeenCalledWith({
      where: { section_id: 2 },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            type: true,
            price: true,
            price_after_discount: true,
            serial: true,
            thumbnail_image: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });
  });

  it("uses the low-quality file metadata for downloads", async () => {
    const db = createMockDb();
    const sampleService = new SampleService(db as any);

    db.samples.findFirst.mockResolvedValue({
      id: 7,
      section_id: 2,
      product_id: 12,
      title: "Teacher sample",
      is_archived: false,
      media_type: "pdf",
      thumbnail_url: null,
      high_quality_url: "/uploads/samples/123-high_quality.pdf",
      low_quality_url: "/uploads/samples/456-low_quality.docx",
      original_name: "Teacher sample.pdf",
      mime_type: "application/pdf",
      size: 2048,
      created_at: new Date(),
      updated_at: null,
      products: null,
      sample_sections: { id: 2, title: "Samples" },
    });

    const result = await sampleService.getDownloadPath(7, 2);

    expect(db.samples.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 7, section_id: 2 },
      }),
    );
    expect(result.path).toContain("/uploads/samples/456-low_quality.docx");
    expect(result.mimeType).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(result.originalName).toBe("Teacher sample-low-quality.docx");
  });

  it("labels same-extension low-quality downloads without preserving high-quality names", async () => {
    const db = createMockDb();
    const sampleService = new SampleService(db as any);

    db.samples.findFirst.mockResolvedValue({
      id: 8,
      section_id: 2,
      product_id: 12,
      title: "Teacher sample",
      is_archived: false,
      media_type: "pdf",
      thumbnail_url: null,
      high_quality_url: "/uploads/samples/123-high_quality.pdf",
      low_quality_url: "/uploads/samples/456-low_quality.pdf",
      original_name: "Teacher sample high quality.pdf",
      mime_type: "application/pdf",
      size: 2048,
      created_at: new Date(),
      updated_at: null,
      products: null,
      sample_sections: { id: 2, title: "Samples" },
    });

    const result = await sampleService.getDownloadPath(8, 2);

    expect(result.path).toContain("/uploads/samples/456-low_quality.pdf");
    expect(result.mimeType).toBe("application/pdf");
    expect(result.originalName).toBe("Teacher sample-low-quality.pdf");
  });
});
