import express from "express";
import request from "supertest";
import {
  httpMetricsMiddleware,
  metricsAccessMiddleware,
  metricsHandler,
  metricsRegistry,
} from "./metrics";

function buildApp() {
  const app = express();

  app.use(httpMetricsMiddleware);
  app.get("/metrics", metricsAccessMiddleware, metricsHandler);
  app.get("/api/v2/users/:userId/orders/:orderId", (_req, res) => {
    res.json({ ok: true });
  });
  app.get("/api/v2/fail/:id", (_req, res) => {
    res.status(500).json({ ok: false });
  });

  return app;
}

describe("Prometheus metrics", () => {
  const originalMetricsToken = process.env.METRICS_TOKEN;
  const originalAllowLocalhost = process.env.METRICS_ALLOW_LOCALHOST;

  beforeEach(() => {
    delete process.env.METRICS_TOKEN;
    delete process.env.METRICS_ALLOW_LOCALHOST;
    metricsRegistry.resetMetrics();
  });

  afterAll(() => {
    if (originalMetricsToken === undefined) {
      delete process.env.METRICS_TOKEN;
    } else {
      process.env.METRICS_TOKEN = originalMetricsToken;
    }

    if (originalAllowLocalhost === undefined) {
      delete process.env.METRICS_ALLOW_LOCALHOST;
    } else {
      process.env.METRICS_ALLOW_LOCALHOST = originalAllowLocalhost;
    }
  });

  it("denies /metrics by default", async () => {
    const app = buildApp();

    const response = await request(app).get("/metrics");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      success: false,
      message: "Metrics endpoint is not available from this client",
    });
  });

  it("allows /metrics with the configured bearer token and exposes default metrics", async () => {
    process.env.METRICS_TOKEN = "test-metrics-token";
    const app = buildApp();

    const response = await request(app)
      .get("/metrics")
      .set("Authorization", "Bearer test-metrics-token");

    expect(response.status).toBe(200);
    expect(response.header["content-type"]).toContain("text/plain");
    expect(response.text).toContain("# HELP kalima_process_cpu_user_seconds_total");
    expect(response.text).toContain("# HELP kalima_http_requests_total");
  });

  it("allows /metrics from localhost only when explicitly enabled", async () => {
    process.env.METRICS_ALLOW_LOCALHOST = "true";
    const app = buildApp();

    const response = await request(app).get("/metrics");

    expect(response.status).toBe(200);
    expect(response.text).toContain("# HELP kalima_http_request_duration_seconds");
  });

  it("records HTTP metrics with low-cardinality route labels instead of raw URLs", async () => {
    process.env.METRICS_TOKEN = "test-metrics-token";
    const app = buildApp();

    await request(app).get("/api/v2/users/alice-secret/orders/order-123?token=hidden").expect(200);
    await request(app).get("/api/v2/fail/private-id").expect(500);

    const response = await request(app)
      .get("/metrics")
      .set("x-metrics-token", "test-metrics-token")
      .expect(200);

    expect(response.text).toContain(
      'kalima_http_requests_total{method="GET",route="/api/v2/users/:userId/orders/:orderId",status_code="200"} 1',
    );
    expect(response.text).toContain(
      'kalima_http_requests_total{method="GET",route="/api/v2/fail/:id",status_code="500"} 1',
    );
    expect(response.text).not.toContain("alice-secret");
    expect(response.text).not.toContain("order-123");
    expect(response.text).not.toContain("hidden");
    expect(response.text).not.toContain("/metrics");
  });
});
