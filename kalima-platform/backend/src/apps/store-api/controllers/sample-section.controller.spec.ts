import "reflect-metadata";
import fs from "fs";
import { sampleSectionController } from "./sample-section.controller";
import { sampleService } from "../services/sample.service";

jest.mock("../services/sample.service", () => ({
  sampleService: {
    getDownloadPath: jest.fn(),
  },
}));

describe("sampleSectionController.serveDownload", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("serves low-quality PDF samples as attachments", async () => {
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    (sampleService.getDownloadPath as jest.Mock).mockResolvedValue({
      path: "/uploads/samples/low-quality.pdf",
      mimeType: "application/pdf",
      originalName: "Sample.pdf",
    });

    const req = {
      params: { sectionId: "2", sampleId: "7" },
    } as any;
    const res = {
      setHeader: jest.fn(),
      sendFile: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    await sampleSectionController.serveDownload(req, res, next);

    expect(sampleService.getDownloadPath).toHaveBeenCalledWith(7, 2);
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/pdf");
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      "attachment; filename=\"Sample.pdf\"; filename*=UTF-8''Sample.pdf",
    );
    expect(res.sendFile).toHaveBeenCalledWith("/uploads/samples/low-quality.pdf");
    expect(next).not.toHaveBeenCalled();
  });
});
