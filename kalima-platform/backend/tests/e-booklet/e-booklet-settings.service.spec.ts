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

  test("returns and persists the default reward expiry days", async () => {
    const upsert = jest.fn().mockResolvedValue({ id: 1, default_reward_expiry_days: 45, preview_page_limit: 10 });
    const db = createDb({ e_booklet_global_settings: { upsert } });
    const service = new EBookletSettingsService(db);

    const settings = await service.updateSettings({ defaultRewardExpiryDays: 45 }, 1);

    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: expect.objectContaining({ default_reward_expiry_days: 45 }),
      update: expect.objectContaining({ default_reward_expiry_days: 45 }),
    }));
    expect(settings.default_reward_expiry_days).toBe(45);
  });

  test("rejects invalid default reward expiry days", async () => {
    const service = new EBookletSettingsService(createDb());

    await expect(service.updateSettings({ defaultRewardExpiryDays: 0 }, 1)).rejects.toThrow("default reward expiry days");
    await expect(service.updateSettings({ default_reward_expiry_days: 0 }, 1)).rejects.toThrow("default reward expiry days");
    await expect(service.updateSettings({ defaultRewardExpiryDays: -1 }, 1)).rejects.toThrow("default reward expiry days");
    await expect(service.updateSettings({ defaultRewardExpiryDays: 1.5 }, 1)).rejects.toThrow("default reward expiry days");
    await expect(service.updateSettings({ defaultRewardExpiryDays: "abc" }, 1)).rejects.toThrow("default reward expiry days");
  });
});
