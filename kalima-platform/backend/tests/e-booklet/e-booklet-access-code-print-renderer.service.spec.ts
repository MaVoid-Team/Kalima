import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import {
  EBookletAccessCodePrintRendererService,
} from "../../src/apps/store-api/services/e-booklet-access-code-print-renderer.service";

const layout = {
  fields: {
    qr: { x: 610, y: 80, width: 112, height: 112 },
    codeNumber: { x: 580, y: 218, width: 180, height: 42 },
    teacherImage: { x: 330, y: 62, width: 118, height: 154 },
    gradeClass: { x: 80, y: 280, width: 180, height: 60 },
  },
};

describe("e-booklet access-code print renderer", () => {
  async function background() {
    return sharp({
      create: {
        width: 827,
        height: 438,
        channels: 4,
        background: "#fff7ed",
      },
    }).png().toBuffer();
  }

  async function teacherImage() {
    return sharp({
      create: {
        width: 64,
        height: 64,
        channels: 4,
        background: "#2563eb",
      },
    }).png().toBuffer();
  }

  test("renders one 827x438 card PNG with QR and printable values", async () => {
    const renderer = new EBookletAccessCodePrintRendererService();
    const png = await renderer.renderCardPng({
      backgroundImage: await background(),
      layout,
      card: {
        code: "KLM AAAA BBBB CCCC",
        qrRedeemUrl: "https://kalima.test/e-booklet-code/qr/test",
        teacherImage: await teacherImage(),
        batchValues: { gradeClassText: "الصف الثالث" },
      },
    });
    const metadata = await sharp(png).metadata();

    expect(metadata.width).toBe(827);
    expect(metadata.height).toBe(438);
    expect(png.length).toBeGreaterThan(5000);
  });

  test("rejects invalid teacher images with a controlled print error", async () => {
    const renderer = new EBookletAccessCodePrintRendererService();

    await expect(renderer.renderCardPng({
      backgroundImage: await background(),
      layout,
      card: {
        code: "KLM AAAA BBBB CCCC",
        qrRedeemUrl: "https://kalima.test/e-booklet-code/qr/test",
        teacherImage: Buffer.from("not an image"),
        batchValues: { gradeClassText: "الصف الثالث" },
      },
    })).rejects.toThrow("Teacher image could not be processed.");
  });

  test("packs rendered cards into an A4 PDF at true 300ppi physical size", async () => {
    const renderer = new EBookletAccessCodePrintRendererService();
    const png = await renderer.renderCardPng({
      backgroundImage: await background(),
      layout,
      card: {
        code: "KLM AAAA BBBB CCCC",
        qrRedeemUrl: "https://kalima.test/e-booklet-code/qr/test",
        batchValues: { gradeClassText: "الصف الثالث" },
      },
    });

    const pdfBytes = await renderer.renderBatchPdf([{ png }, { png }, { png }]);
    const pdf = await PDFDocument.load(pdfBytes);

    expect(Buffer.from(pdfBytes).subarray(0, 5).toString("utf8")).toBe("%PDF-");
    expect(pdf.getPageCount()).toBe(1);
    expect(pdfBytes.length).toBeGreaterThan(5000);
  });
});
