import { readFileSync } from "fs";
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
  align?: "left" | "center" | "right";
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

const CAIRO_ARABIC_FONT_DATA_URI = `data:font/woff2;base64,${readFileSync(
  require.resolve("@fontsource/cairo/files/cairo-arabic-400-normal.woff2"),
).toString("base64")}`;

function escapeXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textAnchor(align: FieldBox["align"]): "start" | "middle" | "end" {
  if (align === "center") return "middle";
  if (align === "right") return "end";
  return "start";
}

function textX(field: FieldBox): number {
  if (field.align === "center") return field.x + field.width / 2;
  if (field.align === "right") return field.x + field.width;
  return field.x;
}

function svgText(field: FieldBox, value: unknown, fallback: Partial<FieldBox> = {}) {
  if (value === undefined || value === null || value === "") return "";
  const merged = { ...fallback, ...field };
  const fontSize = merged.fontSize || 24;
  const direction = merged.direction || "rtl";
  const anchor = textAnchor(merged.align);
  const x = textX(merged);
  const y = merged.y + Math.min(merged.height, fontSize * 1.35);
  return `<text x="${x}" y="${y}" direction="${direction}" unicode-bidi="isolate" text-anchor="${anchor}" font-family="KalimaArabic, Arial, sans-serif" font-size="${fontSize}" fill="${escapeXml(merged.color || "#111827")}">${escapeXml(value)}</text>`;
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
    const textSvg = `<svg width="${E_BOOKLET_PRINT_CARD_WIDTH_PX}" height="${E_BOOKLET_PRINT_CARD_HEIGHT_PX}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face {
            font-family: "KalimaArabic";
            src: url("${CAIRO_ARABIC_FONT_DATA_URI}") format("woff2");
            font-weight: 400;
            font-style: normal;
          }
        </style>
      </defs>
      ${svgText(fields.codeNumber, input.card.code, { direction: "ltr", align: "center", fontSize: 22 })}
      ${svgText(fields.gradeClass || fields.grade_class || fields.className, input.card.batchValues?.gradeClassText, { direction: "rtl", align: "center", fontSize: 22 })}
      ${svgText(fields.registrationMethod || fields.registration_method, input.card.batchValues?.registrationMethodText, { direction: "rtl", align: "center", fontSize: 18 })}
      ${svgText(fields.price, input.card.batchValues?.priceText, { direction: "rtl", align: "center", fontSize: 18 })}
      ${svgText(fields.redCustomText || fields.red_custom_text, input.card.batchValues?.redCustomText, { direction: "rtl", align: "center", fontSize: 18, color: "#dc2626" })}
    </svg>`;
    overlays.push({ input: Buffer.from(textSvg), left: 0, top: 0 });
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
