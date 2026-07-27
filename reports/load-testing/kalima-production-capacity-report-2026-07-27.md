# Kalima production load-test report

Date: 2026-07-27 UTC

Target: `https://kalima-edu.com`

Tool: K6 v2.1.0

## Executive result

Kalima sustained **15 campaign visitor journeys per second for 15 continuous minutes** with no failed requests, no dropped journeys, no container restart, and no health-check failure.

That measured load equals:

- **900 visitor journeys per minute**
- **54,000 visitor journeys per hour**, if the same arrival rate is maintained
- **44.51 HTTP requests per second** under the tested visitor mix
- Approximately **160,000 HTTP requests per hour**
- Up to **30 simultaneously active K6 users** under this journey timing

A short two-minute stage also passed at **20 journeys per second**, equal to 58.06 HTTP requests per second.

The target stage of 40 journeys per second failed sharply.

K6 achieved 27.38 journeys per second and 93.22 requests per second before timeouts appeared, the host stopped accepting SSH connections, 6.71% of HTTP requests failed, and 35 journeys were dropped.

K6 automatically aborted the stage.

🔹 **Recommended campaign operating limit: 10 new visitor journeys per second, or about 36,000 visitor journeys per hour, until the 40-stage connection cliff is investigated.**

This recommendation keeps roughly 33% headroom below the confirmed 15-journey sustained load and 50% below the short 20-journey passing stage.

## What was tested

The workload modeled anonymous, read-only campaign traffic.

It included:

- Landing-page visits
- Market-page visits
- Product-list requests
- Product-detail requests
- Level and subject filters
- E-booklet store visits
- E-booklet detail requests
- Sample-directory requests
- Public contact settings
- Health checks

The test did not:

- Sign users in
- Create accounts
- Modify carts
- Place orders
- Trigger payments
- Send email or WhatsApp messages
- Write application data

Every generated request carried an identifiable load-test user agent and header.

## Test stages

| Stage | Duration | Completed journeys | Achieved journeys/s | HTTP requests/s | p50 | p95 | p99 | Max | HTTP failures | Dropped journeys | Result |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Baseline | 60 s | 121 | 1.95 | 5.62 | 66.08 ms | 178.87 ms | 238.87 ms | 297.99 ms | 0% | 0 | Pass |
| Low | 2 min | 600 | 4.92 | 14.54 | 65.67 ms | 168.86 ms | 208.50 ms | 294.17 ms | 0% | 0 | Pass |
| Medium | 2 min | 1,201 | 9.83 | 29.05 | 64.07 ms | 164.78 ms | 210.78 ms | 411.42 ms | 0% | 0 | Pass |
| High | 2 min | 2,401 | 19.62 | 58.06 | 62.28 ms | 149.66 ms | 192.21 ms | 364.68 ms | 0% | 0 | Pass |
| Failure probe | Aborted after about 16 s | 438 | 27.38 | 93.22 | 62.15 ms | 160.56 ms | 199.31 ms | 273.54 ms before cliff | 6.71% | 35 | Fail |
| Sustained soak | 15 min | 13,501 | 14.97 | 44.51 | 62.37 ms | 149.39 ms | 195.36 ms | 590.83 ms | 0% | 0 | Pass |

## Sustained-soak details

The complete 15-minute soak generated:

- 13,501 visitor journeys
- 40,147 HTTP requests
- 424.18 MB received by the K6 generator
- 0 failed HTTP requests
- 0 dropped journeys
- 100% successful K6 checks
- 30 maximum simultaneously active K6 users
- 308 ms p95 complete-journey request time, excluding simulated user think time

External production-health monitoring recorded:

- 37 health samples
- 37 HTTP 200 responses
- 0 availability failures
- 248 ms p95 public health latency
- 490 ms maximum public health latency

## Infrastructure observations

Production currently runs one instance of each service on one VPS:

- Nginx frontend
- Node.js backend
- PostgreSQL 17
- Redis 8.6

No container has a CPU or memory limit.

The VPS has approximately 8 GB RAM and 2 GB swap.

Peak resource use during the complete 15-journey soak was:

| Service | Peak CPU | Peak memory |
| --- | ---: | ---: |
| Frontend Nginx | 2.92% | 3.93 MiB |
| Node backend | 45.06% | 265.6 MiB |
| PostgreSQL | 19.88% | 45.52 MiB |
| Redis | 0.28% | 12.25 MiB |

The 40-stage failure did not resemble gradual CPU or memory exhaustion.

Immediately before connectivity disappeared, sampled backend CPU was below 1%, PostgreSQL CPU was approximately 1%, and memory was healthy.

The failure was a sharp connection cliff affecting both HTTPS traffic and SSH.

The most likely investigation areas are:

1. VPS or hosting-provider connection-rate protection
2. Firewall, connection-tracking, or SYN-flood limits
3. Reverse-proxy or Coolify proxy connection limits
4. Per-source-IP anti-abuse behavior, because K6 generated traffic from one public IP
5. File-descriptor or socket backlog limits outside the application containers

The test does not prove which layer caused the cliff.

## Deployment interference handled during testing

Two early stages overlapped with real Coolify deployments.

The first preflight received a 502 and generated no load.

A later 10-journey stage was invalidated because all containers were replaced by a deployment.

Coolify deployment records confirmed these were deployments, not load-induced crashes.

Those invalid attempts were excluded and rerun after stabilization.

## Capacity interpretation

### Confirmed sustained capacity

**15 visitor journeys per second for 15 continuous measured minutes**.

This corresponds to about 54,000 visitor journeys per hour if traffic and user behavior remain similar.

### Confirmed short-burst capacity

**20 visitor journeys per second for 2 minutes**, corresponding to about 72,000 journeys per hour if it could be sustained.

It was not soaked long enough to claim 72,000 per hour as sustained capacity.

### Observed failure boundary

The system became unreachable while attempting 40 journeys per second.

The achieved rate before abort was approximately:

- 27.38 journeys per second
- 93.22 HTTP requests per second
- 164 active K6 users at the failure point

This is a cliff, not a safe operating point.

### Recommended campaign budget

Use **10 new visitor journeys per second** as the initial production campaign budget.

That equals:

- 600 journeys per minute
- 36,000 journeys per hour
- Approximately 29 HTTP requests per second under this mix

Increase beyond that only with live monitoring and after diagnosing the connection cliff.

## Important limitations

This is an HTTP-level K6 test, not a full browser test.

It does not execute React, measure Core Web Vitals, open WebSockets as a browser would, or automatically download every JavaScript, CSS, font, and image asset.

Static assets are configured with one-year immutable caching, so repeat visitors should normally produce less static traffic than first-time uncached browsers.

The test originated from one machine and one public IP.

The 40-stage failure may therefore represent per-source-IP protection rather than aggregate capacity across many geographically distributed visitors.

The workload was anonymous and read-only.

Authenticated dashboards, login, checkout, purchase creation, PDF or e-booklet page rendering, uploads, and WebSocket concurrency require separate controlled tests with dedicated test accounts and test data.

“Users” in this report means generated visitor journeys under the defined timing model.

Real concurrent-user capacity varies with session duration, number of open tabs, browser caching, user actions, geography, and campaign landing-page behavior.

## Recommended actions before a major campaign

1. Put the public frontend and static assets behind a CDN such as Cloudflare.
2. Inspect host firewall, connection-tracking, SYN backlog, file-descriptor, reverse-proxy, and hosting-provider anti-DDoS limits.
3. Add CPU and memory limits or reservations so one service cannot starve the entire VPS.
4. Avoid restarting PostgreSQL and Redis during normal application deployments.
5. Add Prometheus-compatible infrastructure monitoring for CPU, memory, event-loop lag, PostgreSQL connections, query latency, Redis latency, network packets, connection tracking, and proxy status codes.
6. Repeat the capacity test from distributed load generators to separate per-IP throttling from true aggregate capacity.
7. Run a dedicated authenticated test for the exact campaign conversion path.
8. Run a browser performance test separately for uncached first visits and Core Web Vitals.

## Artifacts

- K6 scenario: `tests/performance/k6/production-capacity.js`
- Usage guide: `tests/performance/k6/README.md`
- Raw K6 summaries: `reports/load-testing/raw/`
- Infrastructure samples: `reports/load-testing/infra/`
- K6 logs: `reports/load-testing/logs/`

## Final conclusion

Kalima is healthy and fast at the tested 15-journey sustained level for the full 15-minute proof window.

Latency remained excellent, failures stayed at zero, and application containers retained substantial CPU and memory headroom.

The immediate production risk is not ordinary application saturation.

It is the abrupt network or connection-handling failure observed near 93 requests per second from one source.

Until that cliff is explained, plan campaigns around **10 new visitor journeys per second**, treat **15 per second as confirmed tested capacity**, treat **20 per second as short-burst-only capacity**, and do not target the observed 27-plus journeys-per-second failure region.
