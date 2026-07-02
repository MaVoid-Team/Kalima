import { isProtectedSampleStaticPath } from "./sampleStaticAccess";

describe("isProtectedSampleStaticPath", () => {
  it("blocks direct high-quality sample assets for every media type", () => {
    expect(
      isProtectedSampleStaticPath(
        "/1778644889968-b515cf99c32a-high_quality.png",
      ),
    ).toBe(true);
    expect(
      isProtectedSampleStaticPath(
        "/1778644889968-b515cf99c32a-high_quality.mp4",
      ),
    ).toBe(true);
  });

  it("keeps direct PDF sample access blocked", () => {
    expect(
      isProtectedSampleStaticPath(
        "/1778071107305-c1e7cee60639-low_quality.pdf",
      ),
    ).toBe(true);
  });

  it("allows low-quality non-PDF sample assets and thumbnails", () => {
    expect(
      isProtectedSampleStaticPath(
        "/1778644889968-9ad98b8f10e0-low_quality.png",
      ),
    ).toBe(false);
    expect(
      isProtectedSampleStaticPath(
        "/1778644889968-9ad98b8f10e0-thumbnail.png",
      ),
    ).toBe(false);
  });
});
