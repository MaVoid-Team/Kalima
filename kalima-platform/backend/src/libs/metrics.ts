import type { NextFunction, Request, Response } from "express";
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from "prom-client";

const METRICS_ROUTE = "/metrics";
const UNKNOWN_ROUTE = "unmatched";

export const metricsRegistry = new Registry();

collectDefaultMetrics({
  prefix: "kalima_",
  register: metricsRegistry,
});

export const httpRequestDurationSeconds = new Histogram({
  name: "kalima_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds.",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [metricsRegistry],
});

export const httpRequestsTotal = new Counter({
  name: "kalima_http_requests_total",
  help: "Total number of completed HTTP requests.",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [metricsRegistry],
});

export const httpRequestsInFlight = new Gauge({
  name: "kalima_http_requests_in_flight",
  help: "Number of HTTP requests currently in flight.",
  labelNames: ["method"] as const,
  registers: [metricsRegistry],
});

function normalizeMethod(method: string): string {
  return method.toUpperCase();
}

function routePath(req: Request): string {
  const route = req.route?.path;
  const routePattern = Array.isArray(route) ? route[0] : route;

  if (typeof routePattern === "string" && routePattern.length > 0) {
    return `${req.baseUrl || ""}${routePattern}` || "/";
  }

  if (req.baseUrl) {
    return req.baseUrl;
  }

  return UNKNOWN_ROUTE;
}

function isMetricsRequest(req: Request): boolean {
  return req.path === METRICS_ROUTE || req.originalUrl.split("?")[0] === METRICS_ROUTE;
}

export function httpMetricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (isMetricsRequest(req)) {
    next();
    return;
  }

  const method = normalizeMethod(req.method);
  const start = process.hrtime.bigint();
  let completed = false;

  httpRequestsInFlight.inc({ method });

  const finish = () => {
    if (completed) {
      return;
    }

    completed = true;
    const route = routePath(req);
    const statusCode = String(res.statusCode || 0);
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1_000_000_000;

    httpRequestsInFlight.dec({ method });
    httpRequestsTotal.inc({ method, route, status_code: statusCode });
    httpRequestDurationSeconds.observe({ method, route, status_code: statusCode }, durationSeconds);
  };

  res.once("finish", finish);
  res.once("close", finish);

  next();
}

function isLoopbackAddress(ip: string | undefined): boolean {
  if (!ip) {
    return false;
  }

  return ip === "127.0.0.1"
    || ip === "::1"
    || ip === "::ffff:127.0.0.1"
    || ip.startsWith("127.");
}

function hasValidMetricsToken(req: Request): boolean {
  const expectedToken = process.env.METRICS_TOKEN;

  if (!expectedToken) {
    return false;
  }

  const authHeader = req.header("authorization") || "";
  const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7)
    : undefined;
  const headerToken = req.header("x-metrics-token");

  return bearerToken === expectedToken || headerToken === expectedToken;
}

function isLocalMetricsAccessAllowed(req: Request): boolean {
  return process.env.METRICS_ALLOW_LOCALHOST === "true" && isLoopbackAddress(req.ip);
}

export function metricsAccessMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (hasValidMetricsToken(req) || isLocalMetricsAccessAllowed(req)) {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    message: "Metrics endpoint is not available from this client",
  });
}

export async function metricsHandler(_req: Request, res: Response): Promise<void> {
  res.set("Content-Type", metricsRegistry.contentType);
  res.end(await metricsRegistry.metrics());
}
