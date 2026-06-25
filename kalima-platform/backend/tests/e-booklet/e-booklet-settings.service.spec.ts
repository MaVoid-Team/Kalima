import { EBookletSettingsService } from "../../src/apps/store-api/services/e-booklet-settings.service";

function createDb(overrides: Record<string, unknown> = {}) {
  return {
    e_booklet_global_settings: {
      upsert: jest.fn().mockResolvedValue({ id: 1 }),
    },
    ...overrides,
  } as any;
}

describe("EBookletSettingsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns configured preview page limit when the column is readable", async () => {
    const db = createDb({
      $queryRawUnsafe: jest.fn().mockResolvedValue([{ preview_page_limit: 25 }]),
    });
    const service = new EBookletSettingsService(db);

    const settings = await service.getSettings();

    expect(settings.preview_page_limit).toBe(25);
  });

  test("falls back to default preview page limit when the column is missing", async () => {
    const db = createDb({
      $queryRawUnsafe: jest.fn().mockRejectedValue(new Error("column preview_page_limit does not exist")),
    });
    const service = new EBookletSettingsService(db);

    const settings = await service.getSettings();

    expect(settings.preview_page_limit).toBe(10);
  });

  test("persists preview page limit through the settings upsert", async () => {
    const upsert = jest.fn().mockResolvedValue({ id: 1, preview_page_limit: 25 });
    const db = createDb({ e_booklet_global_settings: { upsert } });
    const service = new EBookletSettingsService(db);

    const settings = await service.updateSettings({ previewPageLimit: 25 }, 1);

    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: expect.objectContaining({ preview_page_limit: 25 }),
      update: expect.objectContaining({ preview_page_limit: 25 }),
    }));
    expect(settings.preview_page_limit).toBe(25);
  });
});
