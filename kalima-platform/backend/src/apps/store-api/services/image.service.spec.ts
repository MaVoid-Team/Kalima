jest.mock("../../../libs/db/prisma", () => ({
  prisma: {},
}));

import { promises as fsPromises } from "fs";
import sharp from "sharp";
import { image_mime_type_enum } from "../generated/prisma/client";
import { ImageService } from "./image.service";

const PNG_FIXTURE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADUlEQVR4nGNgYGD4DwABBAEAX+XDSwAAAABJRU5ErkJggg==",
  "base64",
);

function createMockDb() {
  return {
    images: {
      create: jest.fn(),
    },
  };
}

describe("ImageService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    {
      name: "PNG",
      inputMime: "image/png",
      inputExtension: ".png",
      expectedMime: image_mime_type_enum.png,
      expectedFormat: "png",
      buffer: PNG_FIXTURE,
    },
    {
      name: "JPEG",
      inputMime: "image/jpeg",
      inputExtension: ".jpg",
      expectedMime: image_mime_type_enum.jpeg,
      expectedFormat: "jpeg",
      buffer: null,
    },
  ])("preserves $name when compression is requested", async (fixture) => {
    const db = createMockDb();
    db.images.create.mockImplementation(async ({ data }: any) => ({
      id: 42,
      ...data,
    }));
    const service = new ImageService(db as any);
    const inputBuffer = fixture.buffer || (await sharp(PNG_FIXTURE).jpeg().toBuffer());
    const writeFile = jest.spyOn(fsPromises, "writeFile").mockResolvedValue(undefined);
    jest.spyOn(fsPromises, "mkdir").mockResolvedValue(undefined);

    const result = await service.uploadImage(
      {
        buffer: inputBuffer,
        mimetype: fixture.inputMime,
        originalname: `teacher${fixture.inputExtension}`,
        size: inputBuffer.length,
      } as Express.Multer.File,
      { compress: true, quality: 75 },
    );

    expect(result.mime_type).toBe(fixture.expectedMime);
    expect(result.url).toMatch(new RegExp(`${fixture.inputExtension.replace(".", "\\.")}$`));
    expect(db.images.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        mime_type: fixture.expectedMime,
        original_name: `teacher${fixture.inputExtension}`,
      }),
    });

    const storedBuffer = writeFile.mock.calls[0]?.[1];
    expect(Buffer.isBuffer(storedBuffer)).toBe(true);
    await expect(sharp(storedBuffer as Buffer).metadata()).resolves.toEqual(
      expect.objectContaining({ format: fixture.expectedFormat }),
    );
  });
});
