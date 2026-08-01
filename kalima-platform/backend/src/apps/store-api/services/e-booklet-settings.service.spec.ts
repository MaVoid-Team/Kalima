import { EBookletSettingsService } from "./e-booklet-settings.service";

describe("EBookletSettingsService", () => {
  it("persists and returns the configured preview page limit", async () => {
    const db = {
      e_booklet_global_settings: {
        upsert: jest.fn().mockResolvedValue({
          id: 1,
          preview_page_limit: 12,
          default_reward_expiry_days: 120,
        }),
      },
    };
    const service = new EBookletSettingsService(db);

    const result = await service.updateSettings({ previewPageLimit: 12 }, 1);

    expect(db.e_booklet_global_settings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ preview_page_limit: 12 }),
      }),
    );
    expect(result.preview_page_limit).toBe(12);
  });
});
