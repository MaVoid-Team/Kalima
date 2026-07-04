function loadRuntimeModules() {
  try {
    return {
      prisma: require("../dist/src/libs/db/prisma").prisma,
      normalizeOriginalFilename: require("../dist/src/apps/store-api/utils/filename").normalizeOriginalFilename,
    };
  } catch (distError) {
    try {
      require("ts-node/register");
      return {
        prisma: require("../src/libs/db/prisma").prisma,
        normalizeOriginalFilename: require("../src/apps/store-api/utils/filename").normalizeOriginalFilename,
      };
    } catch (sourceError) {
      sourceError.message = `Unable to load compiled repair dependencies from dist or source TypeScript. Run npm run build first, or install dev dependencies for ts-node. Last error: ${sourceError.message}`;
      throw sourceError;
    }
  }
}

function log(event, payload = {}) {
  console.log(JSON.stringify({ event, at: new Date().toISOString(), ...payload }));
}

async function repairTable({ prisma, normalizeOriginalFilename, modelName, fieldName, dryRun }) {
  const model = prisma[modelName];
  const rows = await model.findMany({
    select: { id: true, [fieldName]: true },
  });
  let changed = 0;

  for (const row of rows) {
    const current = row[fieldName];
    const normalized = normalizeOriginalFilename(current, "file");
    if (!current || normalized === current) continue;
    changed += 1;
    log("arabic_filename_repair_candidate", {
      table: modelName,
      id: row.id,
      from: current,
      to: normalized,
      dryRun,
    });
    if (!dryRun) {
      await model.update({
        where: { id: row.id },
        data: { [fieldName]: normalized },
      });
    }
  }

  return { table: modelName, changed };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run") || process.env.DRY_RUN === "true";
  const { prisma, normalizeOriginalFilename } = loadRuntimeModules();
  log("arabic_filename_repair_started", { dryRun });
  const results = [];
  results.push(await repairTable({ prisma, normalizeOriginalFilename, modelName: "e_booklet_file_assets", fieldName: "original_filename", dryRun }));
  results.push(await repairTable({ prisma, normalizeOriginalFilename, modelName: "samples", fieldName: "original_name", dryRun }));
  results.push(await repairTable({ prisma, normalizeOriginalFilename, modelName: "images", fieldName: "original_name", dryRun }));
  results.push(await repairTable({ prisma, normalizeOriginalFilename, modelName: "product_gallery_videos", fieldName: "original_name", dryRun }));
  log("arabic_filename_repair_finished", {
    dryRun,
    results,
    changed: results.reduce((sum, result) => sum + result.changed, 0),
  });
}

main()
  .catch((error) => {
    console.error(JSON.stringify({ event: "arabic_filename_repair_failed", at: new Date().toISOString(), message: error?.message, stack: error?.stack }));
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      const { prisma } = loadRuntimeModules();
      await prisma.$disconnect?.();
    } catch {
      // ignore cleanup failures
    }
  });
