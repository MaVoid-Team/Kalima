import fs from "fs";
import path from "path";
import { prisma } from "../libs/db/prisma";
import { resolveUploadsRoot } from "../libs/uploadsRoot";

type UploadRef = {
  area: string;
  id: string;
  url: string;
  relativePath: string;
  absolutePath: string;
};

function resolveEBookletUploadRoot(): string {
  return path.resolve(
    process.env.E_BOOKLET_UPLOAD_DIR || process.cwd(),
    process.env.E_BOOKLET_UPLOAD_DIR ? "" : "uploads/e-booklets/private",
  );
}

function getUploadRelativePath(url: string | null | undefined): string | null {
  if (!url || /^https?:\/\//i.test(url)) return null;

  const normalizedUrl = url.startsWith("/") ? url.slice(1) : url;
  const uploadIndex = normalizedUrl.indexOf("uploads/");
  if (uploadIndex === -1) return null;

  const relativePath = normalizedUrl.slice(uploadIndex + "uploads/".length);
  if (!relativePath || relativePath.includes("..")) return null;

  return relativePath;
}

function addPublicUploadRef(
  refs: UploadRef[],
  area: string,
  id: number | string,
  url: string | null | undefined,
): void {
  const relativePath = getUploadRelativePath(url);
  if (!relativePath || !url) return;

  refs.push({
    area,
    id: String(id),
    url,
    relativePath,
    absolutePath: path.join(resolveUploadsRoot(), relativePath),
  });
}

function addPrivateEBookletRef(
  refs: UploadRef[],
  id: number | string,
  storageKey: string | null | undefined,
): void {
  if (!storageKey || storageKey.includes("..")) return;
  const absolutePath = storageKey.startsWith("e-booklets/private/")
    ? path.join(resolveUploadsRoot(), storageKey)
    : path.join(resolveEBookletUploadRoot(), storageKey);

  refs.push({
    area: "e_booklet_file_assets.private",
    id: String(id),
    url: storageKey,
    relativePath: storageKey,
    absolutePath,
  });
}

function summarize(refs: UploadRef[]) {
  const missing = refs.filter((ref) => !fs.existsSync(ref.absolutePath));
  const byArea = refs.reduce<Record<string, { total: number; missing: number }>>(
    (acc, ref) => {
      acc[ref.area] ??= { total: 0, missing: 0 };
      acc[ref.area].total += 1;
      if (!fs.existsSync(ref.absolutePath)) acc[ref.area].missing += 1;
      return acc;
    },
    {},
  );

  return {
    uploadRoot: resolveUploadsRoot(),
    eBookletUploadRoot: resolveEBookletUploadRoot(),
    totalRefs: refs.length,
    missingRefs: missing.length,
    byArea,
    missingExamples: missing.slice(0, 25).map((ref) => ({
      area: ref.area,
      id: ref.id,
      url: ref.url,
      absolutePath: ref.absolutePath,
    })),
  };
}

async function main(): Promise<void> {
  const refs: UploadRef[] = [];

  const [
    images,
    products,
    productGallery,
    paymentMethods,
    purchases,
    eBookletPurchases,
    samples,
    users,
    eBookletAssets,
  ] = await Promise.all([
    prisma.images.findMany({ select: { id: true, url: true } }),
    prisma.products.findMany({
      select: { id: true, thumbnail_image: { select: { url: true } } },
      where: { deleted_at: null },
    }),
    prisma.product_gallery.findMany({
      select: { id: true, images: { select: { url: true } } },
    }),
    prisma.payment_methods.findMany({
      select: { id: true, images: { select: { url: true } } },
      where: { is_deleted: false },
    }),
    prisma.purchases.findMany({
      select: { id: true, payment_screenshot: { select: { url: true } } },
    }),
    prisma.e_booklet_purchases.findMany({
      select: { id: true, payment_screenshot: { select: { url: true } } },
    }),
    prisma.samples.findMany({
      select: {
        id: true,
        high_quality_url: true,
        low_quality_url: true,
        thumbnail_url: true,
      },
    }),
    prisma.users.findMany({
      select: { id: true, profile_pic_url: true },
      where: { profile_pic_url: { not: null } },
    }),
    prisma.e_booklet_file_assets.findMany({
      select: { id: true, storage_key: true },
    }),
  ]);

  for (const image of images) {
    addPublicUploadRef(refs, "images.table", image.id, image.url);
  }
  for (const product of products) {
    addPublicUploadRef(
      refs,
      "products.thumbnail",
      product.id,
      product.thumbnail_image?.url,
    );
  }
  for (const entry of productGallery) {
    addPublicUploadRef(refs, "products.gallery", entry.id, entry.images?.url);
  }
  for (const method of paymentMethods) {
    addPublicUploadRef(refs, "payment_methods.image", method.id, method.images?.url);
  }
  for (const purchase of purchases) {
    addPublicUploadRef(
      refs,
      "purchases.payment_screenshot",
      purchase.id,
      purchase.payment_screenshot?.url,
    );
  }
  for (const purchase of eBookletPurchases) {
    addPublicUploadRef(
      refs,
      "e_booklet_purchases.payment_screenshot",
      purchase.id,
      purchase.payment_screenshot?.url,
    );
  }
  for (const sample of samples) {
    addPublicUploadRef(refs, "samples.high_quality", sample.id, sample.high_quality_url);
    addPublicUploadRef(refs, "samples.low_quality", sample.id, sample.low_quality_url);
    addPublicUploadRef(refs, "samples.thumbnail", sample.id, sample.thumbnail_url);
  }
  for (const user of users) {
    addPublicUploadRef(refs, "users.profile_pic", user.id, user.profile_pic_url);
  }
  for (const asset of eBookletAssets) {
    addPrivateEBookletRef(refs, asset.id, asset.storage_key);
  }

  const report = summarize(refs);
  console.log(JSON.stringify(report, null, 2));
  if (report.missingRefs > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
