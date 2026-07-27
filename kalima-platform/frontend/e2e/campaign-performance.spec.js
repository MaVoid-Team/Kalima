import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const outputDir = path.resolve(process.cwd(), "..", "..", "reports", "browser-performance");
const outputPath = path.join(outputDir, "campaign-visits.json");
const campaignPaths = (process.env.CAMPAIGN_PERF_PATHS || "/,/market,/e-booklets")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);
const unsafePathPattern = /(?:checkout|payment|purchase|cart-purchases|confirm|paymob|stripe|invoice)/i;

function assertSafePath(routePath) {
  if (unsafePathPattern.test(routePath)) {
    throw new Error(`Refusing unsafe campaign performance path: ${routePath}`);
  }
}

async function installWebVitalsObserver(page) {
  await page.addInitScript(() => {
    window.__campaignVitals = {
      cls: 0,
      fcp: null,
      lcp: null,
      longTasks: [],
    };

    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            window.__campaignVitals.fcp = entry.startTime;
          }
        }
      }).observe({ type: "paint", buffered: true });
    } catch {
      // Browser does not support this performance observer type.
    }

    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          window.__campaignVitals.lcp = entry.startTime;
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // Browser does not support this performance observer type.
    }

    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__campaignVitals.cls += entry.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {
      // Browser does not support this performance observer type.
    }

    try {
      new PerformanceObserver((entryList) => {
        window.__campaignVitals.longTasks.push(
          ...entryList.getEntries().map((entry) => ({
            duration: entry.duration,
            startTime: entry.startTime,
          })),
        );
      }).observe({ type: "longtask", buffered: true });
    } catch {
      // Browser does not support this performance observer type.
    }
  });
}

async function collectVisitMetrics(page, routePath, cacheState) {
  assertSafePath(routePath);
  await installWebVitalsObserver(page);
  const response = await page.goto(routePath, { waitUntil: "networkidle" });
  await expect(page.locator("body")).toBeVisible();
  await page.waitForTimeout(500);

  return page.evaluate(({ routePath: evaluatedPath, cacheState: evaluatedCacheState, status }) => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    const vitals = window.__campaignVitals || {};
    const transferSize = resources.reduce((total, resource) => total + (resource.transferSize || 0), 0);
    const encodedBodySize = resources.reduce((total, resource) => total + (resource.encodedBodySize || 0), 0);
    const decodedBodySize = resources.reduce((total, resource) => total + (resource.decodedBodySize || 0), 0);
    const resourceTypeCounts = resources.reduce((counts, resource) => {
      const key = resource.initiatorType || "other";
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});

    return {
      path: evaluatedPath,
      cacheState: evaluatedCacheState,
      status,
      collectedAt: new Date().toISOString(),
      navigation: navigation
        ? {
            domContentLoaded: navigation.domContentLoadedEventEnd,
            load: navigation.loadEventEnd,
            responseEnd: navigation.responseEnd,
            transferSize: navigation.transferSize,
            encodedBodySize: navigation.encodedBodySize,
            decodedBodySize: navigation.decodedBodySize,
          }
        : null,
      resources: {
        count: resources.length,
        transferSize,
        encodedBodySize,
        decodedBodySize,
        byInitiatorType: resourceTypeCounts,
      },
      webVitals: {
        fcp: vitals.fcp ?? null,
        lcp: vitals.lcp ?? null,
        cls: vitals.cls ?? null,
        longTaskCount: Array.isArray(vitals.longTasks) ? vitals.longTasks.length : null,
        longTaskTotalDuration: Array.isArray(vitals.longTasks)
          ? vitals.longTasks.reduce((total, task) => total + task.duration, 0)
          : null,
      },
    };
  }, { routePath, cacheState, status: response?.status() ?? null });
}

test.describe("campaign browser performance", () => {
  test("collects uncached and warm visit metrics without payment actions", async ({ browser }) => {
    const results = [];

    for (const routePath of campaignPaths) {
      assertSafePath(routePath);

      const coldContext = await browser.newContext();
      const coldPage = await coldContext.newPage();
      results.push(await collectVisitMetrics(coldPage, routePath, "uncached"));
      await coldContext.close();

      const warmContext = await browser.newContext();
      const warmPage = await warmContext.newPage();
      await warmPage.goto(routePath, { waitUntil: "networkidle" });
      results.push(await collectVisitMetrics(warmPage, routePath, "warm"));
      await warmContext.close();
    }

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify({ campaignPaths, results }, null, 2)}\n`);

    expect(results).toHaveLength(campaignPaths.length * 2);
    for (const result of results) {
      expect(result.status, `${result.cacheState} ${result.path}`).toBeLessThan(400);
      expect(result.navigation, `${result.cacheState} ${result.path} navigation timing`).toBeTruthy();
    }
  });
});
