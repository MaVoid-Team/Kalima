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
    registrationMethod: { x: 80, y: 200, width: 180, height: 50 },
    gradeClass: { x: 80, y: 280, width: 180, height: 60 },
    price: { x: 280, y: 280, width: 100, height: 50 },
    redCustomText: { x: 400, y: 280, width: 120, height: 50 },
  },
};

async function countDarkPixels(buffer: Buffer, width: number, height: number) {
  const raw = await sharp(buffer)
    .raw()
    .toBuffer();
  let darkPixels = 0;
  for (let index = 0; index < width * height; index += 1) {
    const offset = index * 4;
    if (raw[offset] < 120 && raw[offset + 1] < 120 && raw[offset + 2] < 120 && raw[offset + 3] > 0) {
      darkPixels += 1;
    }
  }
  return darkPixels;
}

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

  test("renders Arabic printable text inside the selected field box", async () => {
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
    const fieldCrop = await sharp(png)
      .extract({ left: 80, top: 280, width: 180, height: 60 })
      .toBuffer();
    const belowFieldCrop = await sharp(png)
      .extract({ left: 80, top: 340, width: 180, height: 30 })
      .toBuffer();

    expect(await countDarkPixels(fieldCrop, 180, 60)).toBeGreaterThan(150);
    expect(await countDarkPixels(belowFieldCrop, 180, 30)).toBe(0);
  });

  test("omits every optional printable field when its print visibility is turned off", async () => {
    const renderer = new EBookletAccessCodePrintRendererService();
    const png = await renderer.renderCardPng({
      backgroundImage: await background(),
      layout,
      card: {
        code: "KLM AAAA BBBB CCCC",
        qrRedeemUrl: "https://kalima.test/e-booklet-code/qr/test",
        teacherImage: await teacherImage(),
        batchValues: {
          gradeClassText: "الصف الثالث",
          registrationMethodText: "كود أو منصة",
          priceText: "100 جنيه",
          redCustomText: "نص أحمر",
        },
        visibleFields: {
          gradeClass: false,
          registrationMethod: false,
          price: false,
          redCustomText: false,
          teacherImage: false,
        },
      },
    });
    const hiddenFieldBoxes = [
      layout.fields.teacherImage,
      layout.fields.registrationMethod,
      layout.fields.gradeClass,
      layout.fields.price,
      layout.fields.redCustomText,
    ];

    for (const field of hiddenFieldBoxes) {
      const fieldCrop = await sharp(png)
        .extract({ left: field.x, top: field.y, width: field.width, height: field.height })
        .toBuffer();
      expect(await countDarkPixels(fieldCrop, field.width, field.height)).toBe(0);
    }
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

  test("packs 24 established-size cards into a marginless three-column A4 grid", async () => {
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

    const fullPagePdfBytes = await renderer.renderBatchPdf(Array.from({ length: 24 }, () => ({ png })));
    const fullPagePdf = await PDFDocument.load(fullPagePdfBytes);
    const pdfBytes = await renderer.renderBatchPdf(Array.from({ length: 25 }, () => ({ png })));
    const pdf = await PDFDocument.load(pdfBytes);
    const firstPage = pdf.getPage(0);
    const { width, height } = firstPage.getSize();

    expect(Buffer.from(pdfBytes).subarray(0, 5).toString("utf8")).toBe("%PDF-");
    expect(width).toBeCloseTo(595.28, 1);
    expect(height).toBeCloseTo(841.89, 1);
    expect(width / 72 * 25.4).toBeCloseTo(210, 0);
    expect(height / 72 * 25.4).toBeCloseTo(297, 0);
    expect(fullPagePdf.getPageCount()).toBe(1);
    expect(pdf.getPageCount()).toBe(2);
    expect(pdfBytes.length).toBeGreaterThan(5000);
  });
});
