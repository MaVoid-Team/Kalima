import sharp from "sharp";
import QRCode from "qrcode";
import { PDFDocument, rgb } from "pdf-lib";
import { BadRequestError } from "../../../libs/errors";
import {
  E_BOOKLET_PRINT_CARD_HEIGHT_PX,
  E_BOOKLET_PRINT_CARD_PPI,
  E_BOOKLET_PRINT_CARD_WIDTH_PX,
} from "./e-booklet-access-code-print.service";

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const PRINT_MARGIN_PT = 18;
const PRINT_GAP_PT = 10;

type FieldBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  direction?: "rtl" | "ltr" | "auto";
  align?: "left" | "center" | "right" | "start" | "end";
  fontSize?: number;
  color?: string;
};

type PrintLayout = {
  fields?: Record<string, FieldBox | undefined>;
};

type PrintCardRenderInput = {
  code: string;
  qrRedeemUrl: string;
  teacherImage?: Buffer | null;
  batchValues?: Record<string, any>;
};

const CAIRO_ARABIC_FONT_FILE = require.resolve("@fontsource/cairo/files/cairo-arabic-400-normal.woff2");
const RTL_TEXT_RE = /[\u0590-\u08ff\ufb1d-\ufdff\ufe70-\ufefc]/;

function escapeXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolveDirection(field: FieldBox, value: unknown): "rtl" | "ltr" {
  if (field.direction === "rtl" || field.direction === "ltr") return field.direction;
  return RTL_TEXT_RE.test(String(value ?? "")) ? "rtl" : "ltr";
}

function resolveTextAlign(field: FieldBox, direction: "rtl" | "ltr"): "left" | "center" | "right" {
  if (field.align === "center") return "center";
  if (field.align === "left" || field.align === "right") return field.align;
  if (field.align === "end") return direction === "rtl" ? "left" : "right";
  return direction === "rtl" ? "right" : "left";
}

function isolateText(value: unknown, direction: "rtl" | "ltr"): string {
  const text = String(value ?? "");
  return direction === "rtl" ? `\u202b${text}\u202c` : `\u202a${text}\u202c`;
}

export class EBookletAccessCodePrintRendererService {
  private async renderTeacherImage(input: Buffer, field: FieldBox): Promise<Buffer> {
    try {
      return await sharp(input)
        .resize(Math.round(field.width), Math.round(field.height), { fit: "cover" })
        .png()
        .toBuffer();
    } catch {
      throw new BadRequestError("Teacher image could not be processed. Upload a valid PNG, JPEG, WebP, GIF, or AVIF image.");
    }
  }

  private async renderTextOverlay(field: FieldBox | undefined, value: unknown, fallback: Partial<FieldBox> = {}): Promise<sharp.OverlayOptions | null> {
    if (value === undefined || value === null || value === "") return null;
    if (!field) return null;
    const merged = { ...fallback, ...field };
    const width = Math.max(1, Math.round(merged.width));
    const height = Math.max(1, Math.round(merged.height));
    const fontSize = Math.max(1, Math.round(merged.fontSize || 24));
    const direction = resolveDirection(merged, value);
    const align = resolveTextAlign(merged, direction);
    const text = `<span foreground="${escapeXml(merged.color || "#111827")}">${escapeXml(isolateText(value, direction))}</span>`;
    return {
      input: await sharp({
        text: {
          text,
          font: `Cairo ${fontSize}`,
          fontfile: CAIRO_ARABIC_FONT_FILE,
          width,
          height,
          align,
          rgba: true,
        },
      }).png().toBuffer(),
      left: Math.round(merged.x),
      top: Math.round(merged.y),
    };
  }

  async renderCardPng(input: {
    backgroundImage: Buffer;
    layout: PrintLayout;
    card: PrintCardRenderInput;
  }): Promise<Buffer> {
    const fields = input.layout.fields || {};
    if (!fields.qr || !fields.codeNumber) {
      throw new Error("Print layout requires QR and code number fields.");
    }
    const qrBuffer = await QRCode.toBuffer(input.card.qrRedeemUrl, {
      type: "png",
      errorCorrectionLevel: "M",
      margin: 1,
      width: Math.round(fields.qr.width),
    });
    const overlays: sharp.OverlayOptions[] = [
      {
        input: qrBuffer,
        left: Math.round(fields.qr.x),
        top: Math.round(fields.qr.y),
      },
    ];
    const teacherImageField = fields.teacherImage || fields.teacher_image;
    if (teacherImageField && input.card.teacherImage) {
      overlays.push({
        input: await this.renderTeacherImage(input.card.teacherImage, teacherImageField),
        left: Math.round(teacherImageField.x),
        top: Math.round(teacherImageField.y),
      });
    }
    const textOverlays = await Promise.all([
      this.renderTextOverlay(fields.codeNumber, input.card.code, { direction: "ltr", align: "center", fontSize: 22 }),
      this.renderTextOverlay(fields.gradeClass || fields.grade_class || fields.className, input.card.batchValues?.gradeClassText, { direction: "rtl", align: "center", fontSize: 22 }),
      this.renderTextOverlay(fields.registrationMethod || fields.registration_method, input.card.batchValues?.registrationMethodText, { direction: "rtl", align: "center", fontSize: 18 }),
      this.renderTextOverlay(fields.price, input.card.batchValues?.priceText, { direction: "rtl", align: "center", fontSize: 18 }),
      this.renderTextOverlay(fields.redCustomText || fields.red_custom_text, input.card.batchValues?.redCustomText, { direction: "rtl", align: "center", fontSize: 18, color: "#dc2626" }),
    ]);
    overlays.push(...textOverlays.filter((overlay): overlay is sharp.OverlayOptions => Boolean(overlay)));
    return sharp(input.backgroundImage)
      .resize(E_BOOKLET_PRINT_CARD_WIDTH_PX, E_BOOKLET_PRINT_CARD_HEIGHT_PX, { fit: "fill" })
      .composite(overlays)
      .png()
      .toBuffer();
  }

  async renderBatchPdf(cards: Array<{ png: Buffer }>): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    const cardWidthPt = (E_BOOKLET_PRINT_CARD_WIDTH_PX / E_BOOKLET_PRINT_CARD_PPI) * 72;
    const cardHeightPt = (E_BOOKLET_PRINT_CARD_HEIGHT_PX / E_BOOKLET_PRINT_CARD_PPI) * 72;
    const columns = Math.max(1, Math.floor((A4_WIDTH_PT - PRINT_MARGIN_PT * 2 + PRINT_GAP_PT) / (cardWidthPt + PRINT_GAP_PT)));
    const rows = Math.max(1, Math.floor((A4_HEIGHT_PT - PRINT_MARGIN_PT * 2 + PRINT_GAP_PT) / (cardHeightPt + PRINT_GAP_PT)));
    const perPage = columns * rows;
    const gridWidthPt = columns * cardWidthPt + (columns - 1) * PRINT_GAP_PT;
    const gridHeightPt = rows * cardHeightPt + (rows - 1) * PRINT_GAP_PT;
    const offsetXPt = (A4_WIDTH_PT - gridWidthPt) / 2;
    const offsetYPt = (A4_HEIGHT_PT - gridHeightPt) / 2;

    for (let index = 0; index < cards.length; index += 1) {
      if (index % perPage === 0) {
        pdf.addPage([A4_WIDTH_PT, A4_HEIGHT_PT]);
      }
      const page = pdf.getPage(pdf.getPageCount() - 1);
      const pageIndex = index % perPage;
      const col = pageIndex % columns;
      const row = Math.floor(pageIndex / columns);
      const image = await pdf.embedPng(cards[index].png);
      const x = offsetXPt + col * (cardWidthPt + PRINT_GAP_PT);
      const y = A4_HEIGHT_PT - offsetYPt - cardHeightPt - row * (cardHeightPt + PRINT_GAP_PT);
      page.drawRectangle({ x, y, width: cardWidthPt, height: cardHeightPt, color: rgb(1, 1, 1) });
      page.drawImage(image, { x, y, width: cardWidthPt, height: cardHeightPt });
    }
    return pdf.save();
  }
}
