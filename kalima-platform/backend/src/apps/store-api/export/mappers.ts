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
  toRow: (record: T) => Record<string, unknown>;
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
    "id", "code", "product_id", "product_title", "discount_amount",
    "discount_percentage", "active", "starts_at", "expires_at", "created_at",
  ],
  headers: [
    "ID", "Code", "Product ID", "Product Title", "Discount Amount",
    "Discount %", "Active", "Starts At", "Expires At", "Created At",
  ],
  toRow(r: any) {
    return {
      id: r.id,
      code: r.code ?? "",
      product_id: r.product_id ?? "",
      product_title: r.product?.title ?? "",
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

// ─── Samples ───────────────────────────────────────────────────────────

export const sampleMapper: ExportMapper = {
  columns: [
    "id", "product_id", "product_title", "url", "original_name",
    "mime_type", "size", "created_at",
  ],
  headers: [
    "ID", "Product ID", "Product Title", "URL", "Original Name",
    "MIME Type", "Size (bytes)", "Created At",
  ],
  toRow(r: any) {
    return {
      id: r.id,
      product_id: r.product_id ?? "",
      product_title: r.products?.title ?? "",
      url: r.url ?? "",
      original_name: r.original_name ?? "",
      mime_type: r.mime_type ?? "",
      size: r.size ?? "",
      created_at: iso(r.created_at),
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
