import {
  EBookletAccessCodePrintService,
  getPrintQrRedeemBaseUrl,
  generatePrintQrRef,
  hashPrintQrRef,
  verifyPrintQrRef,
} from "../../src/apps/store-api/services/e-booklet-access-code-print.service";
import { EBookletAccessCodePrintRendererService } from "../../src/apps/store-api/services/e-booklet-access-code-print-renderer.service";

function createDb(overrides: Record<string, unknown> = {}) {
  const db: any = {
    e_booklet_access_code_print_templates: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    e_booklet_access_code_print_batches: {
      count: jest.fn(),
      create: jest.fn(),
    },
    e_booklet_access_code_print_batch_codes: {
      createMany: jest.fn(),
      findFirst: jest.fn(),
    },
    e_booklet_instances: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    e_booklet_access_code_redemptions: {
      count: jest.fn().mockResolvedValue(0),
    },
    e_booklet_access_codes: {
      count: jest.fn().mockResolvedValue(0),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    e_booklet_file_assets: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    ...overrides,
  };
  db.$transaction = jest.fn(async (callback: (tx: any) => Promise<unknown>) => callback(db));
  return db;
}

const validLayout = {
  fields: {
    qr: { x: 604, y: 86, width: 96, height: 96 },
    codeNumber: { x: 610, y: 220, width: 140, height: 50 },
    teacherImage: { x: 330, y: 62, width: 118, height: 154 },
  },
};

function tamperQrRef(ref: string): string {
  const replacement = ref.endsWith("0") ? "1" : "0";
  return `${ref.slice(0, -1)}${replacement}`;
}

describe("e-booklet access-code print service", () => {
  beforeAll(() => {
    process.env.E_BOOKLET_ACCESS_CODE_PRINT_SECRET = "test-print-secret";
  });

  test("creates opaque signed QR references and rejects tampering", () => {
    const ref = generatePrintQrRef();

    expect(ref).toMatch(/^[A-Za-z0-9_-]+\.[a-f0-9]{64}$/);
    expect(hashPrintQrRef(ref)).toMatch(/^[a-f0-9]{64}$/);
    expect(verifyPrintQrRef(ref)).toBe(true);
    expect(verifyPrintQrRef(tamperQrRef(ref))).toBe(false);
  });

  test("uses the public frontend URL and rejects an API URL", () => {
    const originalFrontendUrl = process.env.FRONTEND_URL;
    const originalAppUrl = process.env.APP_URL;
    process.env.FRONTEND_URL = "https://kalima-edu.example/store";
    process.env.APP_URL = "https://api.kalima-edu.example/api/v2";
    expect(getPrintQrRedeemBaseUrl()).toBe("https://kalima-edu.example/store");

    delete process.env.FRONTEND_URL;
    expect(() => getPrintQrRedeemBaseUrl()).toThrow("must point to the frontend, not the API");

    if (originalFrontendUrl === undefined) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = originalFrontendUrl;
    if (originalAppUrl === undefined) delete process.env.APP_URL;
    else process.env.APP_URL = originalAppUrl;
  });

  test("creates only 827x438 300ppi templates with QR and code fields", async () => {
    const db = createDb();
    db.e_booklet_access_code_print_templates.create.mockImplementation(async ({ data }: any) => ({ id: 1, ...data }));
    const service = new EBookletAccessCodePrintService(db);

    await expect(service.createTemplate({
      name: "Card",
      backgroundFileAssetId: 100,
      widthPx: 826,
      heightPx: 438,
      ppi: 300,
      layout: validLayout,
      createdBy: 5,
    })).rejects.toThrow("Template image must be 827 x 438 px at 300 PPI.");

    await expect(service.createTemplate({
      name: "Card",
      backgroundFileAssetId: 100,
      widthPx: 827,
      heightPx: 438,
      ppi: 300,
      layout: { fields: { qr: validLayout.fields.qr } },
      createdBy: 5,
    })).rejects.toThrow("Template layout must include QR and code number fields.");

    await expect(service.createTemplate({
      name: "Card",
      backgroundFileAssetId: 100,
      widthPx: 827,
      heightPx: 438,
      ppi: 300,
      layout: validLayout,
      defaultRequiredFields: { qr: true, codeNumber: true },
      createdBy: 5,
    })).resolves.toMatchObject({ id: 1, name: "Card", width_px: 827, height_px: 438, ppi: 300 });

    expect(db.e_booklet_access_code_print_templates.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Card",
        background_file_asset_id: 100,
        width_px: 827,
        height_px: 438,
        ppi: 300,
        status: "active",
        layout_json: validLayout,
        default_required_fields_json: { qr: true, codeNumber: true },
        created_by: 5,
      }),
    });
  });

  test("blocks deleting a template after any batch has used it", async () => {
    const db = createDb();
    db.e_booklet_access_code_print_batches.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    db.e_booklet_access_code_print_templates.delete.mockResolvedValue({ id: 9 });
    const service = new EBookletAccessCodePrintService(db);

    await expect(service.deleteTemplate(9)).rejects.toThrow("Used print templates cannot be deleted.");
    await expect(service.deleteTemplate(9)).resolves.toEqual({ id: 9 });

    expect(db.e_booklet_access_code_print_templates.delete).toHaveBeenCalledTimes(1);
    expect(db.e_booklet_access_code_print_templates.delete).toHaveBeenCalledWith({ where: { id: 9 } });
  });

  test("updates existing templates without duplicating them", async () => {
    const db = createDb();
    db.e_booklet_access_code_print_templates.findUnique.mockResolvedValue({ id: 9, name: "Old card" });
    db.e_booklet_access_code_print_templates.update.mockImplementation(async ({ data }: any) => ({ id: 9, ...data }));
    const service = new EBookletAccessCodePrintService(db);

    await expect(service.updateTemplate(9, {
      name: "Updated card",
      backgroundFileAssetId: 200,
      layout: validLayout,
      defaultRequiredFields: { qr: true, codeNumber: true },
    })).resolves.toMatchObject({
      id: 9,
      name: "Updated card",
      background_file_asset_id: 200,
      layout_json: validLayout,
    });

    expect(db.e_booklet_access_code_print_templates.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: expect.objectContaining({
        name: "Updated card",
        background_file_asset_id: 200,
        layout_json: validLayout,
        default_required_fields_json: { qr: true, codeNumber: true },
      }),
    });
  });

  test("creates immutable batch snapshots and links generated access codes in card order", async () => {
    const db = createDb();
    const template = {
      id: 3,
      name: "Arabic card",
      background_file_asset_id: 100,
      width_px: 827,
      height_px: 438,
      ppi: 300,
      layout_json: validLayout,
      default_required_fields_json: { qr: true, codeNumber: true, gradeClass: true },
      status: "active",
    };
    db.e_booklet_access_code_print_templates.findUnique.mockResolvedValue(template);
    db.e_booklet_access_code_print_batches.create.mockResolvedValue({ id: 77, label: "July batch" });
    const service = new EBookletAccessCodePrintService(db);

    await expect(service.createBatchSnapshot({
      label: "July batch",
      templateId: 3,
      teacherId: 9,
      bookletInstanceId: 10,
      termId: 1,
      kind: "paid",
      count: 2,
      createdBy: 5,
      batchValues: {
        priceText: "اختياري",
        registrationMethodText: "طريقة التسجيل",
        gradeClassText: "الصف الثالث",
      },
      requiredFields: { redCustomText: false },
      visibleFields: { price: false, redCustomText: false },
      accessCodes: [{ id: 21 }, { id: 22 }],
    })).resolves.toEqual({ id: 77, label: "July batch" });

    expect(db.e_booklet_access_code_print_batches.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        label: "July batch",
        template_id: 3,
        teacher_id: 9,
        booklet_instance_id: 10,
        term_id: 1,
        kind: "paid",
        count: 2,
        status: "generated",
        created_by: 5,
        snapshot_json: expect.objectContaining({
          template: expect.objectContaining({ id: 3, widthPx: 827, heightPx: 438, ppi: 300 }),
          requiredFields: expect.objectContaining({ qr: true, codeNumber: true, gradeClass: true, redCustomText: false }),
          visibleFields: { price: false, redCustomText: false },
          batchValues: expect.objectContaining({ gradeClassText: "الصف الثالث" }),
        }),
      }),
    });
    expect(db.e_booklet_access_code_print_batch_codes.createMany).toHaveBeenCalledWith({
      data: [
        { batch_id: 77, access_code_id: 21, card_index: 0, qr_ref_hash: null, access_code_ciphertext: null },
        { batch_id: 77, access_code_id: 22, card_index: 1, qr_ref_hash: null, access_code_ciphertext: null },
      ],
    });
  });

  test("blocks printable batches when required batch fields are empty", async () => {
    const db = createDb();
    const template = {
      id: 3,
      name: "Arabic card",
      background_file_asset_id: 100,
      width_px: 827,
      height_px: 438,
      ppi: 300,
      layout_json: validLayout,
      default_required_fields_json: { qr: true, codeNumber: true, gradeClass: true },
      status: "active",
    };
    db.e_booklet_access_code_print_templates.findUnique.mockResolvedValue(template);
    const service = new EBookletAccessCodePrintService(db);

    await expect(service.createBatchSnapshot({
      label: "Missing field",
      templateId: 3,
      teacherId: 9,
      bookletInstanceId: 10,
      termId: 1,
      kind: "paid",
      count: 1,
      createdBy: 5,
      batchValues: {},
      accessCodes: [{ id: 21 }],
    })).rejects.toThrow("Required print field is empty: gradeClass.");
  });

  test("generates printable batches by composing access-code generation and QR refs", async () => {
    const db = createDb();
    const template = {
      id: 3,
      name: "Arabic card",
      background_file_asset_id: 100,
      width_px: 827,
      height_px: 438,
      ppi: 300,
      layout_json: validLayout,
      default_required_fields_json: { qr: true, codeNumber: true },
      status: "active",
    };
    db.e_booklet_access_code_print_templates.findUnique.mockResolvedValue(template);
    db.e_booklet_file_assets.findUnique.mockImplementation(async ({ where }: any) => {
      if (where.id === 100) return { id: 100, storage_key: "background.png" };
      if (where.id === 200) return { id: 200, storage_key: "teacher.png" };
      return null;
    });
    db.e_booklet_file_assets.create.mockResolvedValue({ id: 700, storage_key: "e-booklets/private/print-batches/batch.pdf" });
    db.e_booklet_access_code_print_batches.create.mockResolvedValue({ id: 88, label: "Generated batch" });
    const accessCodeService = {
      generateCodes: jest.fn().mockResolvedValue({
        count: 2,
        codes: [
          { code: "KLM-AAAABBBBCCCC", record: { id: 31 } },
          { code: "KLM-DDDDEEEEFFFF", record: { id: 32 } },
        ],
      }),
    };
    const renderer = {
      renderCardPng: jest.fn().mockResolvedValue(Buffer.from("png")),
      renderBatchPdf: jest.fn().mockResolvedValue(Uint8Array.from(Buffer.from("%PDF-test"))),
    };
    const storage = {
      readPrivateAsset: jest.fn()
        .mockResolvedValueOnce(Buffer.from("background"))
        .mockResolvedValueOnce(Buffer.from("teacher-image")),
      writePrivateFile: jest.fn().mockResolvedValue({ storageKey: "e-booklets/private/print-batches/batch.pdf", sizeBytes: 9 }),
    };
    const service = new EBookletAccessCodePrintService(db, accessCodeService as any, renderer as any, storage);

    const result: any = await service.generatePrintableBatch({
      label: "Generated batch",
      templateId: 3,
      teacherId: 9,
      bookletInstanceId: 10,
      termId: 1,
      kind: "paid",
      count: 2,
      createdBy: 5,
      teacherImageFileAssetId: 200,
      batchValues: { gradeClassText: "الصف الثالث" },
      visibleFields: { gradeClass: false, teacherImage: true },
    });

    expect(accessCodeService.generateCodes).toHaveBeenCalledWith({
      bookletInstanceId: 10,
      teacherId: 9,
      kind: "paid",
      termId: 1,
      count: 2,
      expiresAt: undefined,
      maxRedemptions: 1,
      adminActorId: 5,
      ipAddress: undefined,
      userAgent: undefined,
    });
    expect(result.batch).toEqual({ id: 88, label: "Generated batch" });
    expect(result.pdfFileAssetId).toBe(700);
    expect(result.cards).toHaveLength(2);
    expect(storage.readPrivateAsset).toHaveBeenCalledTimes(2);
    expect(renderer.renderCardPng).toHaveBeenCalledTimes(2);
    expect(renderer.renderCardPng).toHaveBeenCalledWith(expect.objectContaining({
      card: expect.objectContaining({
        teacherImage: Buffer.from("teacher-image"),
        visibleFields: { gradeClass: false, teacherImage: true },
      }),
    }));
    expect(renderer.renderBatchPdf).toHaveBeenCalledTimes(1);
    expect(result.cards[0]).toEqual(expect.objectContaining({ accessCodeId: 31, code: "KLM-AAAABBBBCCCC", cardIndex: 0 }));
    expect(result.cards[0].qrRef).toMatch(/^[A-Za-z0-9_-]+\.[a-f0-9]{64}$/);
    expect(result.cards[0].qrRedeemUrl).toContain(encodeURIComponent(result.cards[0].qrRef));
    expect(db.e_booklet_access_code_print_batch_codes.createMany).toHaveBeenCalledWith({
      data: [
        { batch_id: 88, access_code_id: 31, card_index: 0, qr_ref_hash: hashPrintQrRef(result.cards[0].qrRef), access_code_ciphertext: expect.any(String) },
        { batch_id: 88, access_code_id: 32, card_index: 1, qr_ref_hash: hashPrintQrRef(result.cards[1].qrRef), access_code_ciphertext: expect.any(String) },
      ],
    });
  });

  test("removes just-created access codes when printable PDF rendering fails", async () => {
    const db = createDb();
    const template = {
      id: 3,
      name: "Arabic card",
      background_file_asset_id: 100,
      width_px: 827,
      height_px: 438,
      ppi: 300,
      layout_json: validLayout,
      default_required_fields_json: { qr: true, codeNumber: true },
      status: "active",
    };
    db.e_booklet_access_codes.deleteMany.mockResolvedValue({ count: 1 });
    db.e_booklet_access_code_print_templates.findUnique.mockResolvedValue(template);
    db.e_booklet_file_assets.findUnique.mockResolvedValue({ id: 100, storage_key: "background.png" });
    const accessCodeService = {
      generateCodes: jest.fn().mockResolvedValue({
        count: 1,
        codes: [
          { code: "KLM-AAAABBBBCCCC", record: { id: 31 } },
        ],
      }),
    };
    const renderer = {
      renderCardPng: jest.fn().mockRejectedValue(new Error("bad teacher image")),
      renderBatchPdf: jest.fn(),
    };
    const storage = {
      readPrivateAsset: jest.fn().mockResolvedValue(Buffer.from("background")),
      writePrivateFile: jest.fn(),
    };
    const service = new EBookletAccessCodePrintService(db, accessCodeService as any, renderer as any, storage);

    await expect(service.generatePrintableBatch({
      label: "Broken batch",
      templateId: 3,
      teacherId: 9,
      bookletInstanceId: 10,
      termId: 1,
      kind: "paid",
      count: 1,
      createdBy: 5,
      batchValues: { gradeClassText: "الصف الثالث" },
    })).rejects.toThrow("bad teacher image");

    expect(db.e_booklet_access_codes.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: [31] },
        redeemed_count: 0,
      },
    });
    expect(db.e_booklet_access_code_print_batches.create).not.toHaveBeenCalled();
  });

  test("renders a backend preview card with the selected template", async () => {
    const db = createDb();
    const template = {
      id: 3,
      name: "Arabic card",
      background_file_asset_id: 100,
      width_px: 827,
      height_px: 438,
      ppi: 300,
      layout_json: validLayout,
      default_required_fields_json: { qr: true, codeNumber: true },
      status: "active",
    };
    db.e_booklet_access_code_print_templates.findUnique.mockResolvedValue(template);
    db.e_booklet_file_assets.findUnique.mockResolvedValue({ id: 100, storage_key: "background.png" });
    const renderer = { renderCardPng: jest.fn().mockResolvedValue(Buffer.from("preview")) };
    const storage = {
      readPrivateAsset: jest.fn().mockResolvedValue(Buffer.from("background")),
      writePrivateFile: jest.fn(),
    };
    const service = new EBookletAccessCodePrintService(db, undefined as any, renderer as any, storage);

    await expect(service.renderPreviewCard({
      templateId: 3,
      code: "KLM PREV IEW",
      qrRedeemUrl: "https://kalima.test/e-booklet-code/qr/preview",
      batchValues: { gradeClassText: "الصف الثالث" },
      visibleFields: { gradeClass: false },
    })).resolves.toEqual(Buffer.from("preview"));

    expect(renderer.renderCardPng).toHaveBeenCalledWith(expect.objectContaining({
      backgroundImage: Buffer.from("background"),
      layout: validLayout,
      card: expect.objectContaining({ code: "KLM PREV IEW", visibleFields: { gradeClass: false } }),
    }));
  });

  test("shrinks narrow access-code text instead of failing card rendering", async () => {
    const renderer = new EBookletAccessCodePrintRendererService();
    const backgroundImage = Buffer.from(
      '<svg width="827" height="438" xmlns="http://www.w3.org/2000/svg"><rect width="827" height="438" fill="white"/></svg>',
    );

    await expect(renderer.renderCardPng({
      backgroundImage,
      layout: {
        fields: {
          qr: { x: 604, y: 88, width: 96, height: 96 },
          codeNumber: { x: 601, y: 309, width: 125, height: 34, fontSize: 18, align: "center", direction: "ltr" },
        },
      },
      card: {
        code: "KLM PREVIEW 001",
        qrRedeemUrl: "https://kalima.test/e-booklet-code/qr/preview",
      },
    })).resolves.toEqual(expect.any(Buffer));
  });

  test("bounds oversized print fields before compositing cards", async () => {
    const renderer = new EBookletAccessCodePrintRendererService();
    const backgroundImage = Buffer.from(
      '<svg width="827" height="438" xmlns="http://www.w3.org/2000/svg"><rect width="827" height="438" fill="white"/></svg>',
    );

    await expect(renderer.renderCardPng({
      backgroundImage,
      layout: {
        fields: {
          qr: { x: 740, y: 320, width: 220, height: 220 },
          codeNumber: { x: 760, y: 420, width: 160, height: 80, fontSize: 18, align: "center", direction: "ltr" },
          gradeClass: { x: 700, y: 390, width: 240, height: 80, fontSize: 18, align: "center", direction: "rtl" },
        },
      },
      card: {
        code: "KLM PREVIEW 002",
        qrRedeemUrl: "https://kalima.test/e-booklet-code/qr/preview",
        batchValues: { gradeClassText: "E2E production group" },
      },
    })).resolves.toEqual(expect.any(Buffer));
  });

  test("renders the production print template with all optional text fields", async () => {
    const renderer = new EBookletAccessCodePrintRendererService();
    const backgroundImage = Buffer.from(
      '<svg width="827" height="438" xmlns="http://www.w3.org/2000/svg"><rect width="827" height="438" fill="white"/></svg>',
    );

    await expect(renderer.renderCardPng({
      backgroundImage,
      layout: {
        fields: {
          qr: { x: 604, y: 88, width: 96, height: 96 },
          price: { x: 0, y: 36, align: "center", color: "#111827", width: 205, height: 48, fontSize: 16, direction: "rtl" },
          codeNumber: { x: 601, y: 309, align: "center", color: "#111827", width: 125, height: 34, fontSize: 18, direction: "ltr" },
          gradeClass: { x: 43, y: 296, align: "center", color: "#111827", width: 124, height: 48, fontSize: 17, direction: "rtl" },
          teacherImage: { x: 345, y: 70, width: 118, height: 178 },
          redCustomText: { x: 57, y: 95, align: "center", color: "#dc2626", width: 102, height: 75, fontSize: 16, direction: "rtl" },
          registrationMethod: { x: 590, y: 74, align: "center", color: "#111827", width: 120, height: 28, fontSize: 15, direction: "rtl" },
        },
      },
      card: {
        code: "KLM PREVIEW 003",
        qrRedeemUrl: "https://kalima.test/e-booklet-code/qr/preview",
        batchValues: {
          gradeClassText: "E2E production group",
          registrationMethodText: "Code or platform",
          priceText: "100 EGP",
          redCustomText: "Read before redeeming",
        },
      },
    })).resolves.toEqual(expect.any(Buffer));
  });

  test("loads QR prefill data from a signed reference without exposing price text", async () => {
    const db = createDb();
    const accessCodeService = { generateCodes: jest.fn() };
    const service = new EBookletAccessCodePrintService(db, accessCodeService as any);
    const ref = generatePrintQrRef();
    const encryptedCode = service.encryptPrintedAccessCode("KLM-AAAABBBBCCCC");
    db.e_booklet_access_code_print_batch_codes.findFirst.mockResolvedValue({
      id: 9,
      batch_id: 88,
    access_code_id: 31,
    card_index: 0,
    access_code_ciphertext: encryptedCode,
    access_code: {
      status: "active",
      redeemed_count: 0,
      max_redemptions: 1,
      expires_at: null,
    },
      batch: {
        id: 88,
        label: "Generated batch",
        teacher_id: 9,
        booklet_instance_id: 10,
        teacher_image_file_asset_id: 200,
        snapshot_json: {
          batchValues: {
            priceText: "لا يظهر",
            gradeClassText: "الصف الثالث",
            registrationMethodText: "امسح الكود",
          },
        },
        teacher: { id: 9, name: "أستاذ أحمد" },
        booklet_instance: { id: 10, display_title: "مذكرة النحو" },
      },
    });

    await expect(service.getQrPrefill(ref)).resolves.toEqual({
      batchId: 88,
      accessCodeId: 31,
      cardIndex: 0,
      code: "KLM-AAAABBBBCCCC",
      teacher: { id: 9, name: "أستاذ أحمد" },
      eBooklet: { id: 10, title: "مذكرة النحو" },
      gradeClassText: "الصف الثالث",
      registrationMethodText: "امسح الكود",
      teacherImageFileAssetId: 200,
      teacherImageUrl: expect.stringContaining(`/e-booklet-access-code-print/qr/${encodeURIComponent(ref)}/teacher-image`),
    });
    expect(db.e_booklet_access_code_print_batch_codes.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { qr_ref_hash: hashPrintQrRef(ref) },
    }));
    await expect(service.getQrPrefill(tamperQrRef(ref))).rejects.toThrow("Invalid printed access-code QR reference.");
  });

  test("does not prefill a QR reference for a redeemed access code", async () => {
    const db = createDb();
    const service = new EBookletAccessCodePrintService(db, {} as any);
    const ref = generatePrintQrRef();
    db.e_booklet_access_code_print_batch_codes.findFirst.mockResolvedValue({
      access_code_ciphertext: service.encryptPrintedAccessCode("KLM-REDEEMED"),
      access_code: { status: "redeemed", redeemed_count: 1, max_redemptions: 1, expires_at: null },
      batch: {
        teacher: { id: 9, name: "أستاذ أحمد" },
        booklet_instance: { id: 10, display_title: "مذكرة النحو" },
        snapshot_json: { batchValues: {} },
      },
    });

    await expect(service.getQrPrefill(ref)).rejects.toThrow("This e-booklet access code is no longer active.");
  });
});
