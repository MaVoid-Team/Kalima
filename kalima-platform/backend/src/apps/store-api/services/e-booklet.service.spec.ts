jest.mock("../../../libs/db/prisma", () => ({
  prisma: {},
}));

import { EBookletService } from "./e-booklet.service";

describe("EBookletService public preview pagination", () => {
  it("propagates the configured preview count to metadata and page access", async () => {
    const db = {
      e_booklet_global_settings: {
        upsert: jest.fn().mockResolvedValue({ preview_page_limit: 12 }),
      },
      e_booklet_templates: {
        findFirst: jest.fn().mockResolvedValue({
          id: 7,
          title: "Pagination fixture",
          status: "published",
          release_at: null,
          cover_file: null,
          category: null,
          versions: [{
            id: 9,
            version_number: 1,
            status: "active",
            page_count: 24,
            page_dimensions_json: [],
            hotspots: [],
            _count: { hotspots: 0 },
          }],
        }),
      },
    };
    const service = new EBookletService(db as any);

    const metadata = await service.getPublicPreviewMetadata(7);
    const page = await service.getPublicPreviewPage(7, 11);

    expect(metadata.preview_page_limit).toBe(12);
    expect(metadata.preview_page_count).toBe(12);
    expect((metadata.booklet_instance as any).template_version.page_count).toBe(12);
    expect(page.previewPageLimit).toBe(12);
    expect(page.previewPageCount).toBe(12);
  });
});
