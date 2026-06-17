require("ts-node/register");

function log(event, payload = {}) {
  console.log(JSON.stringify({ event, at: new Date().toISOString(), ...payload }));
}

async function main() {
  const dryRun = process.argv.includes("--dry-run") || process.env.DRY_RUN === "true";
  const { getEBookletService } = require("../src/apps/store-api/services/e-booklet.service");
  const service = getEBookletService();
  const now = new Date();
  log("e_booklet_archive_expired_started", { dryRun, now: now.toISOString() });
  const result = await service.archiveExpiredInstances(now, { dryRun });
  log("e_booklet_archive_expired_finished", { dryRun, archived: result?.count ?? 0 });
}

main()
  .catch((error) => {
    console.error(JSON.stringify({ event: "e_booklet_archive_expired_failed", at: new Date().toISOString(), message: error?.message, stack: error?.stack }));
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      const { prisma } = require("../src/libs/db/prisma");
      await prisma.$disconnect?.();
    } catch {
      // ignore cleanup failures
    }
  });
