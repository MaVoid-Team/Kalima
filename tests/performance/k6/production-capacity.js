import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

const BASE_URL = (__ENV.BASE_URL || "https://kalima-edu.com").replace(/\/$/, "");
const RATE = Number(__ENV.RATE || 5);
const DURATION = __ENV.DURATION || "2m";
const PRE_ALLOCATED_VUS = Number(__ENV.PRE_ALLOCATED_VUS || Math.max(20, RATE * 2));
const MAX_VUS = Number(__ENV.MAX_VUS || Math.max(100, RATE * 5));

const serverErrors = new Rate("server_error_rate");
const timeouts = new Rate("timeout_rate");
const journeyFailures = new Counter("journey_failures");
const journeyDuration = new Trend("journey_duration", true);

export const options = {
  discardResponseBodies: false,
  scenarios: {
    campaign_visitors: {
      executor: "constant-arrival-rate",
      rate: RATE,
      timeUnit: "1s",
      duration: DURATION,
      preAllocatedVUs: PRE_ALLOCATED_VUS,
      maxVUs: MAX_VUS,
      gracefulStop: "10s",
    },
  },
  thresholds: {
    http_req_failed: [
      { threshold: "rate<0.01", abortOnFail: true, delayAbortEval: "20s" },
    ],
    server_error_rate: [
      { threshold: "rate<0.02", abortOnFail: true, delayAbortEval: "10s" },
    ],
    timeout_rate: [
      { threshold: "rate<0.005", abortOnFail: true, delayAbortEval: "15s" },
    ],
    http_req_duration: [
      { threshold: "p(95)<3000", abortOnFail: true, delayAbortEval: "30s" },
    ],
    checks: ["rate>0.99"],
    dropped_iterations: ["count==0"],
  },
  userAgent: "Kalima-Authorized-Capacity-Test/1.0",
  summaryTrendStats: ["avg", "min", "med", "p(90)", "p(95)", "p(99)", "max"],
};

const defaultParams = {
  timeout: "10s",
  headers: {
    Accept: "application/json, text/html;q=0.9, */*;q=0.8",
    "X-Kalima-Load-Test": "authorized-production-capacity-test",
  },
  tags: { test_type: "authorized_capacity" },
};

function recordResponse(response, name, expectedContentType) {
  const successful = check(response, {
    [`${name}: status 200`]: (r) => r.status === 200,
    [`${name}: expected content type`]: (r) =>
      String(r.headers["Content-Type"] || "").includes(expectedContentType),
    [`${name}: non-empty response`]: (r) => Boolean(r.body && r.body.length > 0),
  });

  serverErrors.add(response.status >= 500, { name });
  timeouts.add(response.error_code === 1050, { name });
  if (!successful) journeyFailures.add(1, { name });
  return successful;
}

function get(path, name, expectedContentType = "application/json") {
  const response = http.get(`${BASE_URL}${path}`, {
    ...defaultParams,
    tags: { ...defaultParams.tags, name },
  });
  recordResponse(response, name, expectedContentType);
  return response;
}

function firstId(response) {
  try {
    const payload = response.json();
    const data = Array.isArray(payload) ? payload : payload.data;
    return Array.isArray(data) && data.length ? data[0].id : null;
  } catch (_) {
    return null;
  }
}

export function setup() {
  const health = http.get(`${BASE_URL}/api/v2/health`, defaultParams);
  if (health.status !== 200) {
    throw new Error(`Preflight failed: health returned ${health.status}`);
  }
  return { startedAt: new Date().toISOString() };
}

export default function () {
  const started = Date.now();
  const journey = Math.random();

  if (journey < 0.45) {
    get("/", "landing_html", "text/html");
    const products = get("/api/v2/products", "products_list");
    const productId = firstId(products);
    if (productId && Math.random() < 0.45) {
      get(`/api/v2/products/${productId}`, "product_detail");
    }
  } else if (journey < 0.75) {
    get("/market", "market_html", "text/html");
    http.batch([
      ["GET", `${BASE_URL}/api/v2/products`, null, { ...defaultParams, tags: { name: "products_list" } }],
      ["GET", `${BASE_URL}/api/v2/levels`, null, { ...defaultParams, tags: { name: "levels_list" } }],
      ["GET", `${BASE_URL}/api/v2/subjects`, null, { ...defaultParams, tags: { name: "subjects_list" } }],
    ]).forEach((response, index) =>
      recordResponse(response, ["products_list", "levels_list", "subjects_list"][index], "application/json"),
    );
  } else if (journey < 0.92) {
    get("/e-booklets", "ebooklet_html", "text/html");
    const templates = get("/api/v2/e-booklet-store", "ebooklet_store");
    const templateId = firstId(templates);
    if (templateId && Math.random() < 0.5) {
      get(`/api/v2/e-booklet-store/${templateId}`, "ebooklet_detail");
    }
  } else {
    http.batch([
      ["GET", `${BASE_URL}/api/v2/sample-sections`, null, { ...defaultParams, tags: { name: "sample_sections" } }],
      ["GET", `${BASE_URL}/api/v2/settings/contact`, null, { ...defaultParams, tags: { name: "contact_settings" } }],
      ["GET", `${BASE_URL}/api/v2/health`, null, { ...defaultParams, tags: { name: "health" } }],
    ]).forEach((response, index) =>
      recordResponse(response, ["sample_sections", "contact_settings", "health"][index], "application/json"),
    );
  }

  journeyDuration.add(Date.now() - started);
  sleep(Math.random() * 1.5 + 0.5);
}

export function handleSummary(data) {
  const output = __ENV.SUMMARY_PATH || "summary.json";
  return {
    [output]: JSON.stringify(data, null, 2),
    stdout: `\nKalima production capacity stage complete: ${RATE} journeys/s for ${DURATION}\n`,
  };
}
