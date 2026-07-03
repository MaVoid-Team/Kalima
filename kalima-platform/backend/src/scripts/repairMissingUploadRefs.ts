import fs from "fs";
import path from "path";
import { prisma } from "../libs/db/prisma";
import {
  resolveEBookletStoragePath,
  resolveEBookletUploadRoot,
  resolveUploadsRoot,
} from "../libs/uploadsRoot";

function uploadPathExists(url: string | null | undefined): boolean {
  if (!url || /^https?:\/\//i.test(url)) return true;
  const normalizedUrl = url.startsWith("/") ? url.slice(1) : url;
  const uploadIndex = normalizedUrl.indexOf("uploads/");
  if (uploadIndex === -1) return true;
  const relativePath = normalizedUrl.slice(uploadIndex + "uploads/".length);
  if (!relativePath || relativePath.includes("..")) return false;
  return fs.existsSync(path.join(resolveUploadsRoot(), relativePath));
}

function eBookletStoragePathExists(storageKey: string | null | undefined): boolean {
  if (!storageKey || storageKey.includes("..")) return false;
  return fs.existsSync(resolveEBookletStoragePath(storageKey));
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const now = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = path.join(
    resolveUploadsRoot(),
    `upload-repair-report-${now}.json`,
  );

  const images = await prisma.images.findMany({ select: { id: true, url: true } });
  const missingImageIds = images
    .filter((image) => !uploadPathExists(image.url))
    .map((image) => image.id);

  const users = await prisma.users.findMany({
    select: { id: true, profile_pic_url: true },
    where: { profile_pic_url: { not: null } },
  });
  const usersWithMissingProfilePics = users.filter(
    (user) => !uploadPathExists(user.profile_pic_url),
  );

  const samples = await prisma.samples.findMany({
    select: {
      id: true,
      high_quality_url: true,
      low_quality_url: true,
      thumbnail_url: true,
    },
  });
  const sampleUpdates = samples
    .map((sample) => ({
      id: sample.id,
      high_quality_url: uploadPathExists(sample.high_quality_url)
        ? undefined
        : null,
      low_quality_url: uploadPathExists(sample.low_quality_url)
        ? undefined
        : null,
      thumbnail_url: uploadPathExists(sample.thumbnail_url) ? undefined : null,
    }))
    .filter(
      (sample) =>
        sample.high_quality_url === null ||
        sample.low_quality_url === null ||
        sample.thumbnail_url === null,
    );

  const eBookletAssets = await prisma.e_booklet_file_assets.findMany({
    select: { id: true, storage_key: true },
  });
  const missingEBookletAssetIds = eBookletAssets
    .filter((asset) => !eBookletStoragePathExists(asset.storage_key))
    .map((asset) => asset.id);

  const report = {
    apply,
    uploadRoot: resolveUploadsRoot(),
    eBookletUploadRoot: resolveEBookletUploadRoot(),
    missingImageIds,
    missingEBookletAssetIds,
    usersWithMissingProfilePics: usersWithMissingProfilePics.map((user) => ({
      id: user.id,
      profile_pic_url: user.profile_pic_url,
    })),
    sampleUpdates,
  };

  await fs.promises.mkdir(resolveUploadsRoot(), { recursive: true });
  await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));

  if (!apply) {
    console.log(JSON.stringify({ ...report, reportPath }, null, 2));
    return;
  }

  await prisma.$transaction(async (tx) => {
    if (usersWithMissingProfilePics.length) {
      await tx.users.updateMany({
        where: { id: { in: usersWithMissingProfilePics.map((user) => user.id) } },
        data: { profile_pic_url: null },
      });
    }

    for (const sample of sampleUpdates) {
      await tx.samples.update({
        where: { id: sample.id },
        data: {
          ...(sample.high_quality_url === null ? { high_quality_url: null } : {}),
          ...(sample.low_quality_url === null ? { low_quality_url: null } : {}),
          ...(sample.thumbnail_url === null ? { thumbnail_url: null } : {}),
        },
      });
    }

    if (missingImageIds.length) {
      await tx.images.deleteMany({ where: { id: { in: missingImageIds } } });
    }

    if (missingEBookletAssetIds.length) {
      await tx.e_booklet_file_assets.deleteMany({
        where: { id: { in: missingEBookletAssetIds } },
      });
    }
  });

  console.log(JSON.stringify({ ...report, reportPath }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
