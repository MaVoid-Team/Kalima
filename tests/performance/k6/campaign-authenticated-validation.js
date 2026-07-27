import http from "k6/http";
import { check, fail, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

const BASE_URL = (__ENV.BASE_URL || "http://127.0.0.1:5001").replace(/\/$/, "");
const AUTH_PATH = __ENV.CAMPAIGN_AUTH_PATH || "/api/v1/auth/login";
const EMAIL = __ENV.CAMPAIGN_TEST_EMAIL;
const PASSWORD = __ENV.CAMPAIGN_TEST_PASSWORD;
const VISIT_PATHS = (__ENV.CAMPAIGN_VISIT_PATHS || "/,/market,/e-booklets")
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean);
const RATE = Number(__ENV.RATE || 1);
const DURATION = __ENV.DURATION || "1m";
const PRE_ALLOCATED_VUS = Number(__ENV.PRE_ALLOCATED_VUS || Math.max(2, RATE * 2));
const MAX_VUS = Number(__ENV.MAX_VUS || Math.max(5, RATE * 5));

const blockedUnsafeRequests = new Counter("blocked_unsafe_requests");
const authenticatedJourneyFailures = new Counter("authenticated_journey_failures");
const authenticatedJourneyDuration = new Trend("authenticated_journey_duration", true);
const authenticatedServerErrors = new Rate("authenticated_server_error_rate");

const unsafePathPattern = /(?:checkout|payment|purchase|cart-purchases|confirm|paymob|stripe|invoice)/i;

export const options = {
  discardResponseBodies: false,
  scenarios: {
    authenticated_campaign_visitors: {
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
    http_req_failed: ["rate<0.02"],
    authenticated_server_error_rate: ["rate<0.02"],
    authenticated_journey_failures: ["count==0"],
    blocked_unsafe_requests: ["count==0"],
    checks: ["rate>0.98"],
  },
  userAgent: "Kalima-Repository-Only-Campaign-Validation/1.0",
  summaryTrendStats: ["avg", "min", "med", "p(90)", "p(95)", "p(99)", "max"],
};

const defaultHeaders = {
  Accept: "application/json, text/html;q=0.9, */*;q=0.8",
  "X-Kalima-Load-Test": "repository-only-campaign-validation",
};

function requireEnv(name, value) {
  if (!value) {
    fail(`${name} is required. Use dedicated non-production campaign validation credentials.`);
  }
}

function assertSafePath(path) {
  if (unsafePathPattern.test(path)) {
    blockedUnsafeRequests.add(1, { path });
    fail(`Refusing unsafe campaign validation path: ${path}`);
  }
}

function extractAccessToken(response) {
  try {
    const payload = response.json();
    return payload?.data?.tokens?.accessToken || payload?.accessToken || payload?.token || null;
  } catch (_) {
    return null;
  }
}

function recordResponse(response, name, expectedStatuses = [200]) {
  const ok = check(response, {
    [`${name}: expected status`]: (r) => expectedStatuses.includes(r.status),
    [`${name}: no server error`]: (r) => r.status < 500,
  });

  authenticatedServerErrors.add(response.status >= 500, { name });
  if (!ok) authenticatedJourneyFailures.add(1, { name });
  return ok;
}

export function setup() {
  requireEnv("CAMPAIGN_TEST_EMAIL", EMAIL);
  requireEnv("CAMPAIGN_TEST_PASSWORD", PASSWORD);
  assertSafePath(AUTH_PATH);
  VISIT_PATHS.forEach(assertSafePath);

  const loginResponse = http.post(
    `${BASE_URL}${AUTH_PATH}`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    {
      timeout: "10s",
      headers: {
        ...defaultHeaders,
        "Content-Type": "application/json",
      },
      tags: { name: "campaign_auth_login", test_type: "repository_only_campaign_validation" },
    },
  );

  const loginOk = check(loginResponse, {
    "login: status 200": (r) => r.status === 200,
    "login: access token returned": (r) => Boolean(extractAccessToken(r)),
  });

  if (!loginOk) {
    fail(`Campaign validation login failed with status ${loginResponse.status}. Use dedicated test credentials only.`);
  }

  return {
    accessToken: extractAccessToken(loginResponse),
    visitPaths: VISIT_PATHS,
  };
}

export default function (state) {
  const started = Date.now();
  const path = state.visitPaths[(__ITER + __VU) % state.visitPaths.length];
  assertSafePath(path);

  const response = http.get(`${BASE_URL}${path}`, {
    timeout: "10s",
    headers: {
      ...defaultHeaders,
      Authorization: `Bearer ${state.accessToken}`,
    },
    tags: {
      name: `campaign_authenticated_visit:${path}`,
      test_type: "repository_only_campaign_validation",
    },
  });

  recordResponse(response, `authenticated visit ${path}`, [200, 204, 301, 302, 304]);
  authenticatedJourneyDuration.add(Date.now() - started);
  sleep(Math.random() * 0.75 + 0.25);
}

export function handleSummary(data) {
  const output = __ENV.SUMMARY_PATH || "reports/load-testing/raw/campaign-authenticated-validation.json";
  return {
    [output]: JSON.stringify(data, null, 2),
    stdout: `\nKalima repository-only authenticated campaign validation complete. Payment and checkout paths are blocked by the script.\n`,
  };
}
