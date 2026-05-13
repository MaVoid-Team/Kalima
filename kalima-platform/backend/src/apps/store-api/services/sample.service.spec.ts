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
});
