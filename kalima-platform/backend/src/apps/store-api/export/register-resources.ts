/**
 * Registers every Store API v2 resource for export.
 *
 * Each registration provides:
 *   - A `fetcher` that returns all records (or a filtered subset by IDs / filters)
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
  eBookletPurchaseMapper,
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
import {
  E_BOOKLET_ADMIN_PURCHASE_INCLUDE,
  EBookletService,
} from "../services/e-booklet.service";

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
        select: {
          id: true,
          title: true,
          serial: true,
          type: true,
          price: true,
        },
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
  // Filters: is_archived (bool), category_id (int), search (string)
  registerExportResource("products", {
    label: "products",
    mapper: productMapper,
    fetcher: (ids, filters) => {
      const where: any = {
        deleted_at: null,
        ...(ids ? { id: { in: ids } } : {}),
      };

      if (filters?.is_archived !== undefined) {
        where.is_archived = filters.is_archived as boolean;
      }

      if (filters?.search) {
        where.OR = [
          {
            title: { contains: filters.search as string, mode: "insensitive" },
          },
          {
            description: {
              contains: filters.search as string,
              mode: "insensitive",
            },
          },
        ];
      }

      if (filters?.category_id) {
        where.product_categories = {
          some: { category_id: filters.category_id as number },
        };
      }

      return prisma.products.findMany({
        where,
        include: PRODUCT_LIST_INCLUDE,
        orderBy: { created_at: "desc" },
      });
    },
  });

  // ── Categories ─────────────────────────────────────────────────────
  // Filters: active (bool)
  registerExportResource("categories", {
    label: "categories",
    mapper: categoryMapper,
    fetcher: (ids, filters) => {
      const where: any = {
        ...(ids ? { id: { in: ids } } : {}),
      };

      if (filters?.active !== undefined) {
        where.active = filters.active as boolean;
      }

      return prisma.categories.findMany({
        where,
        orderBy: { title: "asc" },
      });
    },
  });

  // ── Coupons ────────────────────────────────────────────────────────
  // Filters: active (bool), product_id (int), startDate (ISO), endDate (ISO), isAmount (bool)
  registerExportResource("coupons", {
    label: "coupons",
    mapper: couponMapper,
    fetcher: (ids, filters) => {
      const where: any = {
        deleted_at: null,
        ...(ids ? { id: { in: ids } } : {}),
      };

      if (filters?.active !== undefined) {
        where.active = filters.active as boolean;
      }

      if (filters?.product_id !== undefined) {
        where.product_id = filters.product_id as number;
      }

      if (filters?.startDate || filters?.endDate) {
        where.created_at = {};
        if (filters.startDate) {
          where.created_at.gte = new Date(filters.startDate as string);
        }
        if (filters.endDate) {
          const endOfDay = new Date(filters.endDate as string);
          endOfDay.setUTCHours(23, 59, 59, 999);
          where.created_at.lte = endOfDay;
        }
      }

      if (filters?.isAmount !== undefined) {
        where.type = (filters.isAmount as boolean) ? "fixed" : "percentage";
      }

      return prisma.coupons.findMany({
        where,
        include: { product: { select: { id: true, title: true } } },
        orderBy: { created_at: "desc" },
      });
    },
  });

  // ── Purchases ──────────────────────────────────────────────────────
  // Filters: status (string), search (string), startDate (ISO), endDate (ISO),
  //          minTotal (number), maxTotal (number)
  registerExportResource("purchases", {
    label: "purchases",
    mapper: purchaseMapper,
    fetcher: (ids, filters) => {
      const where: any = {
        ...(ids ? { id: { in: ids } } : {}),
      };

      if (filters?.status) {
        where.status = filters.status as string;
      }

      if (filters?.startDate || filters?.endDate) {
        where.created_at = {};
        if (filters.startDate) {
          where.created_at.gte = new Date(filters.startDate as string);
        }
        if (filters.endDate) {
          where.created_at.lte = new Date(filters.endDate as string);
        }
      }

      if (filters?.minTotal !== undefined || filters?.maxTotal !== undefined) {
        where.total = {};
        if (filters.minTotal !== undefined)
          where.total.gte = filters.minTotal as number;
        if (filters.maxTotal !== undefined)
          where.total.lte = filters.maxTotal as number;
      }

      if (filters?.search) {
        const s = (filters.search as string).trim();
        where.OR = [
          { purchase_serial: { contains: s, mode: "insensitive" } },
          { number_transferred_from: { contains: s, mode: "insensitive" } },
          { users: { name: { contains: s, mode: "insensitive" } } },
          { users: { email: { contains: s, mode: "insensitive" } } },
          { users: { phone: { contains: s, mode: "insensitive" } } },
          {
            purchase_items: {
              some: {
                products: { title: { contains: s, mode: "insensitive" } },
              },
            },
          },
          {
            purchase_items: {
              some: {
                products: { serial: { contains: s, mode: "insensitive" } },
              },
            },
          },
        ];
      }

      return prisma.purchases.findMany({
        where,
        include: PURCHASE_INCLUDE,
        orderBy: { created_at: "desc" },
      });
    },
  });

  // ── E-booklet Purchases ─────────────────────────────────────────────
  // Filters: status (string), search (string), startDate (ISO), endDate (ISO),
  //          minTotal (number), maxTotal (number)
  registerExportResource("admin/e-booklet-purchases", {
    label: "e-booklet-purchases",
    mapper: eBookletPurchaseMapper,
    fetcher: (ids, filters) => {
      const service = new EBookletService(prisma as any);
      const where: any = service.buildAdminPurchaseWhere(filters || {});
      if (ids) where.id = { in: ids };

      return prisma.e_booklet_purchases.findMany({
        where,
        include: E_BOOKLET_ADMIN_PURCHASE_INCLUDE,
        orderBy: { created_at: "desc" },
      });
    },
  });

  // ── Samples ────────────────────────────────────────────────────────
  // Filters: search (string)
  registerExportResource("samples", {
    label: "samples",
    mapper: sampleMapper,
    fetcher: (ids, filters) => {
      const where: any = {
        ...(ids ? { id: { in: ids } } : {}),
      };

      if (filters?.search) {
        where.OR = [
          {
            title: { contains: filters.search as string, mode: "insensitive" },
          },
          {
            description: {
              contains: filters.search as string,
              mode: "insensitive",
            },
          },
        ];
      }

      return prisma.samples.findMany({
        where,
        include: { products: true },
        orderBy: { created_at: "desc" },
      });
    },
  });

  // ── Governments ────────────────────────────────────────────────────
  // Filters: active (bool)
  registerExportResource("governments", {
    label: "governments",
    mapper: governmentMapper,
    fetcher: (ids, filters) => {
      const where: any = {
        ...(ids ? { id: { in: ids } } : {}),
      };

      if (filters?.active !== undefined) {
        where.active = filters.active as boolean;
      }

      return prisma.government.findMany({
        where,
        orderBy: { title: "asc" },
      });
    },
  });

  // ── Zones ──────────────────────────────────────────────────────────
  // Filters: government_id (int), active (bool)
  registerExportResource("zones", {
    label: "zones",
    mapper: zoneMapper,
    fetcher: (ids, filters) => {
      const where: any = {
        ...(ids ? { id: { in: ids } } : {}),
      };

      if (filters?.government_id !== undefined) {
        where.government_id = filters.government_id as number;
      }

      if (filters?.active !== undefined) {
        where.active = filters.active as boolean;
      }

      return prisma.zones.findMany({
        where,
        orderBy: { title: "asc" },
      });
    },
  });

  // ── Sites ──────────────────────────────────────────────────────────
  // Filters: active (bool)
  registerExportResource("sites", {
    label: "sites",
    mapper: siteMapper,
    fetcher: (ids, filters) => {
      const where: any = {
        ...(ids ? { id: { in: ids } } : {}),
      };

      if (filters?.active !== undefined) {
        where.active = filters.active as boolean;
      }

      return prisma.sites.findMany({
        where,
        orderBy: { title: "asc" },
      });
    },
  });

  // ── Levels ─────────────────────────────────────────────────────────
  // Filters: active (bool)
  registerExportResource("levels", {
    label: "levels",
    mapper: levelMapper,
    fetcher: (ids, filters) => {
      const where: any = {
        ...(ids ? { id: { in: ids } } : {}),
      };

      if (filters?.active !== undefined) {
        where.active = filters.active as boolean;
      }

      return prisma.levels.findMany({
        where,
        orderBy: { title: "asc" },
      });
    },
  });

  // ── Subjects ───────────────────────────────────────────────────────
  // Filters: active (bool)
  registerExportResource("subjects", {
    label: "subjects",
    mapper: subjectMapper,
    fetcher: (ids, filters) => {
      const where: any = {
        ...(ids ? { id: { in: ids } } : {}),
      };

      if (filters?.active !== undefined) {
        where.active = filters.active as boolean;
      }

      return prisma.subjects.findMany({
        where,
        orderBy: { title: "asc" },
      });
    },
  });

  // ── Required Field Definitions ─────────────────────────────────────
  // Filters: active (bool)
  registerExportResource("required-field-definitions", {
    label: "required-field-definitions",
    mapper: requiredFieldMapper,
    fetcher: (ids, filters) => {
      const where: any = {
        deleted_at: null,
        ...(ids ? { id: { in: ids } } : {}),
      };

      if (filters?.active !== undefined) {
        where.active = filters.active as boolean;
      }

      return prisma.required_field_definitions.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
    },
  });

  // ── Users (Admin) ──────────────────────────────────────────────────
  // Filters: search (string), role (string), portal (string)
  registerExportResource("users", {
    label: "users",
    mapper: userMapper,
    fetcher: (ids, filters) => {
      const where: any = {
        ...(ids ? { id: { in: ids } } : {}),
      };

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search as string, mode: "insensitive" } },
          {
            email: { contains: filters.search as string, mode: "insensitive" },
          },
          { phone: { contains: filters.search as string } },
        ];
      }

      if (filters?.role || filters?.portal) {
        where.user_roles = {
          some: {
            ...(filters.role ? { role: filters.role as string } : {}),
            ...(filters.portal ? { portal: filters.portal as string } : {}),
          },
        };
      }

      return prisma.users.findMany({
        where,
        select: USER_SELECT,
        orderBy: { created_at: "desc" },
      });
    },
  });

  // ── Payment Methods ────────────────────────────────────────────────
  // Filters: status (bool), search (string)
  registerExportResource("payment-methods", {
    label: "payment-methods",
    mapper: paymentMethodMapper,
    fetcher: (ids, filters) => {
      const where: any = {
        ...(ids ? { id: { in: ids } } : {}),
      };

      if (filters?.status !== undefined) {
        where.status = filters.status as boolean;
      }

      if (filters?.search) {
        where.name = {
          contains: filters.search as string,
          mode: "insensitive",
        };
      }

      return prisma.payment_methods.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
    },
  });
}
