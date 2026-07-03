/**
 * Export row mappers.
 *
 * Each mapper defines:
 *  - `columns`  – ordered DB field keys for the export
 *  - `headers`  – human-readable column labels (same order)
 *  - `toRow()`  – transforms a DB record into a flat key-value object
 *
 * Adding a new resource is a single object addition — no other file changes.
 */

// ─── Shared helpers ────────────────────────────────────────────────────

function iso(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString();
}

function joinList(items: { title?: string; name?: string }[]): string {
  if (!items || items.length === 0) return "";
  return items.map((i) => i.title ?? i.name ?? "").join("; ");
}

// ─── Mapper interface ──────────────────────────────────────────────────

export interface ExportMapper<T = any> {
  columns: string[];
  headers: string[];
  headersByLocale?: Record<string, string[]>;
  toRow: (record: T) => Record<string, unknown>;
  localizeRow?: (
    row: Record<string, unknown>,
    locale?: string,
  ) => Record<string, unknown>;
}

// ─── Products ──────────────────────────────────────────────────────────

export const productMapper: ExportMapper = {
  columns: [
    "id", "title", "serial", "type", "price", "price_after_discount",
    "categories", "is_archived", "sample_url", "created_at",
  ],
  headers: [
    "ID", "Title", "Serial", "Type", "Price", "Price After Discount",
    "Categories", "Archived", "Sample URL", "Created At",
  ],
  toRow(r: any) {
    const cats = (r.product_categories ?? [])
      .map((pc: any) => pc.categories?.title ?? "")
      .filter(Boolean);
    return {
      id: r.id,
      title: r.title ?? "",
      serial: r.serial ?? "",
      type: r.type ?? "",
      price: r.price != null ? Number(r.price) : "",
      price_after_discount: r.price_after_discount != null ? Number(r.price_after_discount) : "",
      categories: cats.join("; "),
      is_archived: r.is_archived ? "Yes" : "No",
      sample_url: r.sample_url ?? "",
      created_at: iso(r.created_at),
    };
  },
};

// ─── Categories ────────────────────────────────────────────────────────

export const categoryMapper: ExportMapper = {
  columns: ["id", "title", "description", "parent_id", "active", "created_at"],
  headers: ["ID", "Title", "Description", "Parent ID", "Active", "Created At"],
  toRow(r: any) {
    return {
      id: r.id,
      title: r.title ?? "",
      description: r.description ?? "",
      parent_id: r.parent_id ?? "",
      active: r.active ? "Yes" : "No",
      created_at: iso(r.created_at),
    };
  },
};

// ─── Coupons ───────────────────────────────────────────────────────────

export const couponMapper: ExportMapper = {
  columns: [
    "id", "code", "applicability_scope", "product_id", "product_title", "category_id", "category_title", "discount_amount",
    "discount_percentage", "active", "starts_at", "expires_at", "created_at",
  ],
  headers: [
    "ID", "Code", "Applies To", "Product ID", "Product Title", "Category ID", "Category Title", "Discount Amount",
    "Discount %", "Active", "Starts At", "Expires At", "Created At",
  ],
  toRow(r: any) {
    return {
      id: r.id,
      code: r.code ?? "",
      applicability_scope: r.applicability_scope ?? (r.category_id ? "category" : "product"),
      product_id: r.product_id ?? "",
      product_title: r.product?.title ?? "",
      category_id: r.category_id ?? "",
      category_title: r.category?.title ?? "",
      discount_amount: r.discount_amount != null ? Number(r.discount_amount) : "",
      discount_percentage: r.discount_percentage ?? "",
      active: r.active ? "Yes" : "No",
      starts_at: iso(r.starts_at),
      expires_at: iso(r.expires_at),
      created_at: iso(r.created_at),
    };
  },
};

// ─── Purchases ─────────────────────────────────────────────────────────

export const purchaseMapper: ExportMapper = {
  columns: [
    "id", "purchase_serial", "user_name", "user_email", "user_phone",
    "items", "subtotal", "discount", "total", "status",
    "payment_method", "number_transferred_from",
    "received_by", "received_at", "confirmed_by", "confirmed_at",
    "returned_by", "returned_at", "notes", "admin_notes", "created_at",
  ],
  headers: [
    "ID", "Serial", "User Name", "User Email", "User Phone",
    "Items", "Subtotal", "Discount", "Total", "Status",
    "Payment Method", "Number Transferred From",
    "Received By", "Received At", "Confirmed By", "Confirmed At",
    "Returned By", "Returned At", "Notes", "Admin Notes", "Created At",
  ],
  toRow(r: any) {
    const items = (r.purchase_items ?? [])
      .map((pi: any) => {
        const title = pi.products?.title ?? "Unknown";
        const qty = pi.quantity ?? 1;
        return `${title} x${qty}`;
      })
      .join("; ");
    return {
      id: r.id,
      purchase_serial: r.purchase_serial ?? "",
      user_name: r.users?.name ?? "",
      user_email: r.users?.email ?? "",
      user_phone: r.users?.phone ?? "",
      items,
      subtotal: r.subtotal != null ? Number(r.subtotal) : "",
      discount: r.discount != null ? Number(r.discount) : "",
      total: r.total != null ? Number(r.total) : "",
      status: r.status ?? "",
      payment_method: r.payment_methods?.name ?? "",
      number_transferred_from: r.number_transferred_from ?? "",
      received_by: r.received_by_user?.name ?? "",
      received_at: iso(r.received_at),
      confirmed_by: r.confirmed_by_user?.name ?? "",
      confirmed_at: iso(r.confirmed_at),
      returned_by: r.returned_by_user?.name ?? "",
      returned_at: iso(r.returned_at),
      notes: r.notes ?? "",
      admin_notes: r.admin_notes ?? "",
      created_at: iso(r.created_at),
    };
  },
};

// ─── E-booklet Purchases ───────────────────────────────────────────────

export const eBookletPurchaseMapper: ExportMapper = {
  columns: [
    "id", "created_at", "teacher_name", "teacher_email", "teacher_phone",
    "template_title", "version", "status", "price", "wallet_credit_applied",
    "final_payable_price", "currency", "payment_method", "payment_reference",
    "access_expires_at", "admin_notes",
  ],
  headers: [
    "ID", "Created At", "Teacher Name", "Teacher Email", "Teacher Phone",
    "Template", "Version", "Status", "Price", "Wallet Credit Applied",
    "Final Payable Price", "Currency", "Payment Method", "Payment Reference",
    "Access Expires At", "Admin Notes",
  ],
  toRow(r: any) {
    return {
      id: r.id,
      created_at: iso(r.created_at),
      teacher_name: r.teacher?.name ?? "",
      teacher_email: r.teacher?.email ?? "",
      teacher_phone: r.teacher?.phone ?? "",
      template_title: r.template?.title ?? "",
      version: r.template_version?.version_number ? `v${r.template_version.version_number}` : "",
      status: r.status ?? "",
      price: r.price != null ? Number(r.price) : "",
      wallet_credit_applied: r.wallet_credit_applied != null ? Number(r.wallet_credit_applied) : "",
      final_payable_price: r.final_payable_price != null ? Number(r.final_payable_price) : "",
      currency: r.currency ?? "",
      payment_method: r.payment_methods?.name ?? r.payment_method ?? "",
      payment_reference: r.payment_reference ?? "",
      access_expires_at: iso(r.access_expires_at),
      admin_notes: r.admin_notes ?? "",
    };
  },
};

// ─── E-booklet Teacher Access ─────────────────────────────────────────

export const eBookletAccessMapper: ExportMapper = {
  columns: [
    "teacher_id", "teacher_name", "teacher_email", "teacher_phone",
    "instance_id", "instance_status", "e_booklet_title", "template_title",
    "version", "purchase_id", "purchase_status", "teacher_price",
    "student_marketing_price", "internal_price", "currency", "payment_method",
    "payment_reference", "invite_quota", "used_student_seats",
    "active_instance_devices", "access_expires_at", "instance_created_at",
    "student_access_id", "student_id", "student_name", "student_email",
    "student_phone", "student_access_status", "student_access_source",
    "student_granted_at", "student_revoked_at", "student_terms_accepted_at",
    "allowed_devices", "active_student_devices", "total_student_devices",
    "student_last_seen_at", "viewer_opens", "pages_viewed", "device_binds",
    "invite_redemption_id", "access_code_redemption_id", "redemption_source",
    "redemption_purchase_id", "redemption_counted_for_progress",
    "redemption_redeemed_at", "active_invites", "total_invites",
    "invite_uses", "active_access_codes", "total_access_codes",
    "paid_access_codes", "free_access_codes", "access_code_redemptions",
    "access_code_hints", "required_fields", "admin_notes",
  ],
  headers: [
    "Teacher ID", "Teacher Name", "Teacher Email", "Teacher Phone",
    "Instance ID", "Instance Status", "E-booklet Title", "Template Title",
    "Version", "Purchase ID", "Purchase Status", "Teacher Price",
    "Student Marketing Price", "Internal Price", "Currency", "Payment Method",
    "Payment Reference", "Invite Quota", "Used Student Seats",
    "Active Instance Devices", "Access Expires At", "Instance Created At",
    "Student Access ID", "Student ID", "Student Name", "Student Email",
    "Student Phone", "Student Access Status", "Student Access Source",
    "Student Granted At", "Student Revoked At", "Student Terms Accepted At",
    "Allowed Devices", "Active Student Devices", "Total Student Devices",
    "Student Last Seen At", "Viewer Opens", "Pages Viewed", "Device Binds",
    "Invite Redemption ID", "Access Code Redemption ID", "Redemption Source",
    "Redemption Purchase ID", "Redemption Counted For Progress",
    "Redemption Redeemed At", "Active Invites", "Total Invites",
    "Invite Uses", "Active Access Codes", "Total Access Codes",
    "Paid Access Codes", "Free Access Codes", "Access Code Redemptions",
    "Access Code Hints", "Required Fields", "Admin Notes",
  ],
  headersByLocale: {
    ar: [
      "معرف المعلم", "اسم المعلم", "بريد المعلم", "هاتف المعلم",
      "معرف النسخة", "حالة النسخة", "عنوان المذكرة", "عنوان القالب",
      "الإصدار", "معرف الطلب", "حالة الطلب", "سعر المعلم",
      "سعر الطالب التسويقي", "السعر الداخلي", "العملة", "طريقة الدفع",
      "مرجع الدفع", "حصة الدعوات", "مقاعد الطلاب المستخدمة",
      "أجهزة النسخة النشطة", "انتهاء الوصول", "تاريخ إنشاء النسخة",
      "معرف وصول الطالب", "معرف الطالب", "اسم الطالب", "بريد الطالب",
      "هاتف الطالب", "حالة وصول الطالب", "مصدر وصول الطالب",
      "تاريخ منح الوصول", "تاريخ إلغاء الوصول", "تاريخ قبول الشروط",
      "الأجهزة المسموحة", "أجهزة الطالب النشطة", "إجمالي أجهزة الطالب",
      "آخر ظهور للطالب", "مرات فتح العارض", "الصفحات المعروضة", "مرات ربط الجهاز",
      "معرف استرداد الدعوة", "معرف استرداد كود الوصول", "مصدر الاسترداد",
      "معرف طلب الاسترداد", "محسوب للتقدم",
      "تاريخ الاسترداد", "الدعوات النشطة", "إجمالي الدعوات",
      "استخدامات الدعوات", "أكواد الوصول النشطة", "إجمالي أكواد الوصول",
      "أكواد مدفوعة", "أكواد مجانية", "استردادات أكواد الوصول",
      "تلميحات الأكواد", "الحقول المطلوبة", "ملاحظات الإدارة",
    ],
    en: [
      "Teacher ID", "Teacher Name", "Teacher Email", "Teacher Phone",
      "Instance ID", "Instance Status", "E-booklet Title", "Template Title",
      "Version", "Purchase ID", "Purchase Status", "Teacher Price",
      "Student Marketing Price", "Internal Price", "Currency", "Payment Method",
      "Payment Reference", "Invite Quota", "Used Student Seats",
      "Active Instance Devices", "Access Expires At", "Instance Created At",
      "Student Access ID", "Student ID", "Student Name", "Student Email",
      "Student Phone", "Student Access Status", "Student Access Source",
      "Student Granted At", "Student Revoked At", "Student Terms Accepted At",
      "Allowed Devices", "Active Student Devices", "Total Student Devices",
      "Student Last Seen At", "Viewer Opens", "Pages Viewed", "Device Binds",
      "Invite Redemption ID", "Access Code Redemption ID", "Redemption Source",
      "Redemption Purchase ID", "Redemption Counted For Progress",
      "Redemption Redeemed At", "Active Invites", "Total Invites",
      "Invite Uses", "Active Access Codes", "Total Access Codes",
      "Paid Access Codes", "Free Access Codes", "Access Code Redemptions",
      "Access Code Hints", "Required Fields", "Admin Notes",
    ],
  },
  toRow(r: any) {
    return r;
  },
  localizeRow(row, locale) {
    if (locale?.toLowerCase().split("-")[0] !== "ar") return row;
    const yesNo = (value: unknown) => {
      if (value === "Yes") return "نعم";
      if (value === "No") return "لا";
      return value;
    };
    return {
      ...row,
      redemption_counted_for_progress: yesNo(row.redemption_counted_for_progress),
    };
  },
};

// ─── Samples ───────────────────────────────────────────────────────────

export const sampleMapper: ExportMapper = {
  columns: [
    "id", "title", "section_id", "section_title", "section_active",
    "product_id", "product_title", "product_serial", "product_type",
    "media_type", "original_name", "mime_type", "size_bytes",
    "is_archived", "is_displayable", "thumbnail_url", "high_quality_url",
    "low_quality_url", "created_at", "updated_at",
  ],
  headers: [
    "ID", "Title", "Section ID", "Section Title", "Section Active",
    "Product ID", "Product Title", "Product Serial", "Product Type",
    "Media Type", "Original Name", "MIME Type", "Size (bytes)",
    "Archived", "Displayable", "Thumbnail URL", "High Quality URL",
    "Low Quality URL", "Created At", "Updated At",
  ],
  headersByLocale: {
    ar: [
      "المعرف", "عنوان العينة", "معرف القسم", "اسم القسم", "القسم نشط",
      "معرف المنتج", "اسم المنتج", "كود المنتج", "نوع المنتج",
      "نوع الوسائط", "اسم الملف الأصلي", "نوع MIME", "الحجم بالبايت",
      "مؤرشف", "قابل للعرض", "رابط الصورة المصغرة", "رابط الجودة العالية",
      "رابط الجودة المنخفضة", "تاريخ الإنشاء", "تاريخ التحديث",
    ],
    en: [
      "ID", "Title", "Section ID", "Section Title", "Section Active",
      "Product ID", "Product Title", "Product Serial", "Product Type",
      "Media Type", "Original Name", "MIME Type", "Size (bytes)",
      "Archived", "Displayable", "Thumbnail URL", "High Quality URL",
      "Low Quality URL", "Created At", "Updated At",
    ],
  },
  toRow(r: any) {
    const displayableTypes = new Set(["pdf", "image", "video"]);
    const mediaType = r.media_type ?? "";
    return {
      id: r.id,
      title: r.title ?? "",
      section_id: r.section_id ?? "",
      section_title: r.sample_sections?.title ?? "",
      section_active: r.sample_sections?.active ? "Yes" : "No",
      product_id: r.product_id ?? "",
      product_title: r.products?.title ?? "",
      product_serial: r.products?.serial ?? "",
      product_type: r.products?.type ?? "",
      media_type: mediaType,
      original_name: r.original_name ?? "",
      mime_type: r.mime_type ?? "",
      size_bytes: r.size ?? "",
      is_archived: r.is_archived ? "Yes" : "No",
      is_displayable: displayableTypes.has(mediaType) ? "Yes" : "No",
      thumbnail_url: r.thumbnail_url ?? "",
      high_quality_url: r.high_quality_url ?? "",
      low_quality_url: r.low_quality_url ?? "",
      created_at: iso(r.created_at),
      updated_at: iso(r.updated_at),
    };
  },
  localizeRow(row, locale) {
    if (locale?.toLowerCase().split("-")[0] !== "ar") return row;

    const yesNo = (value: unknown) => {
      if (value === "Yes") return "نعم";
      if (value === "No") return "لا";
      return value;
    };

    const mediaTypes: Record<string, string> = {
      pdf: "ملف PDF",
      image: "صورة",
      video: "فيديو",
      word: "ملف Word",
      powerpoint: "ملف PowerPoint",
      audio: "ملف صوتي",
    };

    return {
      ...row,
      section_active: yesNo(row.section_active),
      media_type: typeof row.media_type === "string"
        ? mediaTypes[row.media_type] ?? row.media_type
        : row.media_type,
      is_archived: yesNo(row.is_archived),
      is_displayable: yesNo(row.is_displayable),
    };
  },
};

// ─── Governments ───────────────────────────────────────────────────────

export const governmentMapper: ExportMapper = {
  columns: ["id", "title", "active", "created_at"],
  headers: ["ID", "Title", "Active", "Created At"],
  toRow(r: any) {
    return {
      id: r.id,
      title: r.title ?? "",
      active: r.active ? "Yes" : "No",
      created_at: iso(r.created_at),
    };
  },
};

// ─── Zones ─────────────────────────────────────────────────────────────

export const zoneMapper: ExportMapper = {
  columns: ["id", "title", "government_id", "active", "created_at"],
  headers: ["ID", "Title", "Government ID", "Active", "Created At"],
  toRow(r: any) {
    return {
      id: r.id,
      title: r.title ?? "",
      government_id: r.government_id ?? "",
      active: r.active ? "Yes" : "No",
      created_at: iso(r.created_at),
    };
  },
};

// ─── Sites ─────────────────────────────────────────────────────────────

export const siteMapper: ExportMapper = {
  columns: ["id", "title", "active", "created_at"],
  headers: ["ID", "Title", "Active", "Created At"],
  toRow(r: any) {
    return {
      id: r.id,
      title: r.title ?? "",
      active: r.active ? "Yes" : "No",
      created_at: iso(r.created_at),
    };
  },
};

// ─── Levels ────────────────────────────────────────────────────────────

export const levelMapper: ExportMapper = {
  columns: ["id", "title", "active", "created_at"],
  headers: ["ID", "Title", "Active", "Created At"],
  toRow(r: any) {
    return {
      id: r.id,
      title: r.title ?? "",
      active: r.active ? "Yes" : "No",
      created_at: iso(r.created_at),
    };
  },
};

// ─── Subjects ──────────────────────────────────────────────────────────

export const subjectMapper: ExportMapper = {
  columns: ["id", "title", "active", "created_at"],
  headers: ["ID", "Title", "Active", "Created At"],
  toRow(r: any) {
    return {
      id: r.id,
      title: r.title ?? "",
      active: r.active ? "Yes" : "No",
      created_at: iso(r.created_at),
    };
  },
};

// ─── Required Field Definitions ────────────────────────────────────────

export const requiredFieldMapper: ExportMapper = {
  columns: ["id", "label", "field_type", "active", "created_at"],
  headers: ["ID", "Label", "Field Type", "Active", "Created At"],
  toRow(r: any) {
    return {
      id: r.id,
      label: r.label ?? "",
      field_type: r.field_type ?? "",
      active: r.active ? "Yes" : "No",
      created_at: iso(r.created_at),
    };
  },
};

// ─── Users (Admin) ─────────────────────────────────────────────────────

export const userMapper: ExportMapper = {
  columns: [
    "id", "name", "email", "phone", "secondary_phone", "gender",
    "roles", "is_email_verified", "confirmed", "created_at",
  ],
  headers: [
    "ID", "Name", "Email", "Phone", "Secondary Phone", "Gender",
    "Roles", "Email Verified", "Confirmed", "Created At",
  ],
  toRow(r: any) {
    const roles = (r.user_roles ?? [])
      .map((ur: any) => `${ur.role}${ur.portal ? ` (${ur.portal})` : ""}`)
      .join("; ");
    return {
      id: r.id,
      name: r.name ?? "",
      email: r.email ?? "",
      phone: r.phone ?? "",
      secondary_phone: r.secondary_phone ?? "",
      gender: r.gender ?? "",
      roles,
      is_email_verified: r.is_email_verified ? "Yes" : "No",
      confirmed: r.confirmed ? "Yes" : "No",
      created_at: iso(r.created_at),
    };
  },
};

// ─── Payment Methods ───────────────────────────────────────────────────

export const paymentMethodMapper: ExportMapper = {
  columns: ["id", "name", "phone_number", "status", "created_at"],
  headers: ["ID", "Name", "Phone Number", "Active", "Created At"],
  toRow(r: any) {
    return {
      id: r.id,
      name: r.name ?? "",
      phone_number: r.phone_number ?? "",
      status: r.status ? "Yes" : "No",
      created_at: iso(r.created_at),
    };
  },
};
