const fs = require("fs");
const path = require("path");

const RETENTION_DAYS = parseInt(process.env.PAYMENT_SS_RETENTION_DAYS || "30", 10);
const TARGET_DIR = path.join(__dirname, "..", "uploads", "payment_screenshots");

function deleteOldFiles() {
  const now = Date.now();
  const cutoffMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;
  if (!fs.existsSync(TARGET_DIR)) return;

  let removed = 0;
  for (const file of fs.readdirSync(TARGET_DIR)) {
    const filePath = path.join(TARGET_DIR, file);
    try {
      const stat = fs.statSync(filePath);
      const age = now - stat.mtimeMs;
      if (age > cutoffMs) {
        fs.unlinkSync(filePath);
        removed++;
      }
    } catch (_) {}
  }
  if (removed > 0) {
    console.log(`[cleanup] Removed ${removed} old payment screenshots (> ${RETENTION_DAYS}d).`);
  }
}

function schedule() {
  // Run once at startup
  deleteOldFiles();
  // Run every 24h
  const DAY_MS = 24 * 60 * 60 * 1000;
  setInterval(deleteOldFiles, DAY_MS);
}

module.exports = { start: schedule, runOnce: deleteOldFiles };