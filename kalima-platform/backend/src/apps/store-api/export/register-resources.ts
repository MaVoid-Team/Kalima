/**
 * Registers every Store API v2 resource for export.
 *
 * Each registration provides:
 *   - A `fetcher` that returns all records (or a filtered subset by IDs)
 *   - A `mapper` that flattens each record into a plain row
 *   - A `label` used as the file/sheet name
 *
 * Call `registerAllExportResources()` once at app startup.
 */

import { prisma } from "../../../libs/db/prisma";
import { registerExportResource } from "./export.service";
import {
  productMapper,
  categoryMapper,
  couponMapper,
  purchaseMapper,
  sampleMapper,
  governmentMapper,
  zoneMapper,
  siteMapper,
  levelMapper,
  subjectMapper,
  requiredFieldMapper,
  userMapper,
  paymentMethodMapper,
} from "./mappers";

// ─── Shared Prisma include shapes (mirrors existing services) ──────────

const PRODUCT_LIST_INCLUDE = {
  thumbnail_image: true,
  product_categories: {
    include: { categories: { select: { id: true, title: true } } },
  },
} as const;

const PURCHASE_INCLUDE = {
  purchase_items: {
    include: {
      products: {
        select: { id: true, title: true, serial: true, type: true, price: true },
      },
    },
  },
  users: { select: { id: true, name: true, email: true, phone: true } },
  received_by_user: { select: { id: true, name: true } },
  confirmed_by_user: { select: { id: true, name: true } },
  returned_by_user: { select: { id: true, name: true } },
  payment_methods: { select: { id: true, name: true, phone_number: true } },
} as const;

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  secondary_phone: true,
  gender: true,
  is_email_verified: true,
  profile_pic_url: true,
  created_at: true,
  role: true,
  confirmed: true,
  user_roles: { select: { id: true, portal: true, role: true } },
} as const;

// ─── Registration ──────────────────────────────────────────────────────

export function registerAllExportResources(): void {
  // ── Products ───────────────────────────────────────────────────────
  registerExportResource("products", {
    label: "products",
    mapper: productMapper,
    fetcher: (ids) =>
      prisma.products.findMany({
        where: {
          deleted_at: null,
          ...(ids ? { id: { in: ids } } : {}),
        },
        include: PRODUCT_LIST_INCLUDE,
        orderBy: { created_at: "desc" },
      }),
  });

  // ── Categories ─────────────────────────────────────────────────────
  registerExportResource("categories", {
    label: "categories",
    mapper: categoryMapper,
    fetcher: (ids) =>
      prisma.categories.findMany({
        where: ids ? { id: { in: ids } } : {},
        orderBy: { title: "asc" },
      }),
  });

  // ── Coupons ────────────────────────────────────────────────────────
  registerExportResource("coupons", {
    label: "coupons",
    mapper: couponMapper,
    fetcher: (ids) =>
      prisma.coupons.findMany({
        where: {
          deleted_at: null,
          ...(ids ? { id: { in: ids } } : {}),
        },
        include: { product: { select: { id: true, title: true } } },
        orderBy: { created_at: "desc" },
      }),
  });

  // ── Purchases ──────────────────────────────────────────────────────
  registerExportResource("purchases", {
    label: "purchases",
    mapper: purchaseMapper,
    fetcher: (ids) =>
      prisma.purchases.findMany({
        where: ids ? { id: { in: ids } } : {},
        include: PURCHASE_INCLUDE,
        orderBy: { created_at: "desc" },
      }),
  });

  // ── Samples ────────────────────────────────────────────────────────
  registerExportResource("samples", {
    label: "samples",
    mapper: sampleMapper,
    fetcher: (ids) =>
      prisma.samples.findMany({
        where: ids ? { id: { in: ids } } : {},
        include: { products: true },
        orderBy: { created_at: "desc" },
      }),
  });

  // ── Governments ────────────────────────────────────────────────────
  registerExportResource("governments", {
    label: "governments",
    mapper: governmentMapper,
    fetcher: (ids) =>
      prisma.government.findMany({
        where: ids ? { id: { in: ids } } : {},
        orderBy: { title: "asc" },
      }),
  });

  // ── Zones ──────────────────────────────────────────────────────────
  registerExportResource("zones", {
    label: "zones",
    mapper: zoneMapper,
    fetcher: (ids) =>
      prisma.zones.findMany({
        where: ids ? { id: { in: ids } } : {},
        orderBy: { title: "asc" },
      }),
  });

  // ── Sites ──────────────────────────────────────────────────────────
  registerExportResource("sites", {
    label: "sites",
    mapper: siteMapper,
    fetcher: (ids) =>
      prisma.sites.findMany({
        where: ids ? { id: { in: ids } } : {},
        orderBy: { title: "asc" },
      }),
  });

  // ── Levels ─────────────────────────────────────────────────────────
  registerExportResource("levels", {
    label: "levels",
    mapper: levelMapper,
    fetcher: (ids) =>
      prisma.levels.findMany({
        where: ids ? { id: { in: ids } } : {},
        orderBy: { title: "asc" },
      }),
  });

  // ── Subjects ───────────────────────────────────────────────────────
  registerExportResource("subjects", {
    label: "subjects",
    mapper: subjectMapper,
    fetcher: (ids) =>
      prisma.subjects.findMany({
        where: ids ? { id: { in: ids } } : {},
        orderBy: { title: "asc" },
      }),
  });

  // ── Required Field Definitions ─────────────────────────────────────
  registerExportResource("required-field-definitions", {
    label: "required-field-definitions",
    mapper: requiredFieldMapper,
    fetcher: (ids) =>
      prisma.required_field_definitions.findMany({
        where: {
          deleted_at: null,
          ...(ids ? { id: { in: ids } } : {}),
        },
        orderBy: { created_at: "desc" },
      }),
  });

  // ── Users (Admin) ──────────────────────────────────────────────────
  registerExportResource("users", {
    label: "users",
    mapper: userMapper,
    fetcher: (ids) =>
      prisma.users.findMany({
        where: ids ? { id: { in: ids } } : {},
        select: USER_SELECT,
        orderBy: { created_at: "desc" },
      }),
  });

  // ── Payment Methods ────────────────────────────────────────────────
  registerExportResource("payment-methods", {
    label: "payment-methods",
    mapper: paymentMethodMapper,
    fetcher: (ids) =>
      prisma.payment_methods.findMany({
        where: ids ? { id: { in: ids } } : {},
        orderBy: { created_at: "desc" },
      }),
  });
}
