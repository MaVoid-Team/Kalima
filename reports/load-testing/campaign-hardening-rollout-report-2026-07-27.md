# Kalima campaign hardening rollout report

Date: 2026-07-27 UTC

Production target: `https://kalima-edu.com`

## Executive status

The production hardening rollout is live for host networking, application resource isolation, independent data services, protected application metrics, infrastructure monitoring, dashboards, alerts, and authenticated campaign-path validation.

The post-cutover regression sustained **15 visitor journeys per second for two minutes** with **1,801 completed journeys**, **43.47 HTTP requests per second**, **157.59 ms p95 latency**, **0% request failures**, and **100% successful checks**.

This closely matches the earlier 15-minute proof at 15 journeys per second, which recorded 149.39 ms p95 latency and 0% request failures.

The safe initial campaign budget remains **10 new visitor journeys per second**, which is about **36,000 journeys per hour** under the tested traffic mix.

The confirmed sustained proof remains **15 journeys per second for 15 minutes**, which is about **54,000 journeys per hour**.

A short two-minute proof passed at **20 journeys per second**, but it is not a sustained-capacity claim.

## Implemented production changes

### Host connection handling

Nginx now uses a 65,535 file-descriptor limit, 16,384 worker connections, multi-accept, and a 16,384 HTTPS listen backlog.

The host now uses a 16,384 socket accept backlog, a 16,384 TCP SYN backlog, and a 262,144 connection-tracking table limit.

Nginx configuration validation, reload, and public health checks passed.

### Application resource isolation

Frontend, backend, PostgreSQL, and Redis services now have restart policies, health checks, memory limits, memory reservations, and safe process and file-descriptor limits.

The application waits for healthy dependencies instead of relying only on container start order.

### Independent PostgreSQL and Redis services

PostgreSQL and Redis now run in a separate Compose project on persistent named volumes and the external `kalima-data-network`.

Normal application deployments no longer replace or restart the database and cache containers.

A verified pre-cutover backup, restore test, final cutover snapshot, database table-count comparison, and Redis key-count comparison were completed.

The application connected successfully to the independent PostgreSQL and Redis services after cutover.

### Monitoring and alerting

Prometheus, Grafana, node-exporter, cAdvisor, PostgreSQL exporter, Redis exporter, and Alertmanager are live with resource limits.

Prometheus retains 15 days of metrics and currently reports all five scrape targets healthy.

The backend metrics endpoint is protected by a bearer token and exports Node.js runtime and low-cardinality HTTP metrics.

Six alerts cover target availability, host CPU, host memory, disk capacity, backend 5xx rate, and backend p95 latency.

Alertmanager configuration passed `amtool` validation, its readiness endpoint is healthy, and Prometheus discovers one active Alertmanager.

Grafana and Prometheus listen only on loopback and are not directly exposed to the public internet.

### Reproducible operations

Secret-free production data and monitoring templates are stored in `ops/production`.

The templates include Compose definitions, environment examples, protected configuration rendering, Grafana provisioning, dashboards, Prometheus rules, Alertmanager routing, and deployment verification.

Prometheus configuration passed `promtool` validation with six alert rules.

Alertmanager configuration passed `amtool` validation.

### Authenticated campaign-path validation

A dedicated verified student test account was created for controlled performance validation.

The authenticated test sustained approximately five journeys per second for two minutes with 601 completed journeys, 146.06 ms p95 latency, 0% request failures, and 100% successful checks.

The account credential is stored only in a root-readable production file and is not present in the repository.

## Capacity interpretation

| Capacity level | Result | Meaning |
| --- | --- | --- |
| 10 journeys/s | Recommended operating budget | Approximately 36,000 journeys/hour with headroom |
| 15 journeys/s | Confirmed sustained | Passed for 15 continuous minutes with 0% failures |
| 20 journeys/s | Confirmed short burst | Passed for two minutes but not soaked |
| 40 journeys/s target | Failed from one source | Sharp connection cliff near 105 HTTP requests/s |

The repeated 40-journey probe did not show gradual CPU, memory, application, database, or Redis saturation.

The sharp loss of HTTPS and SSH connectivity remains consistent with a per-source-IP, hosting-provider, firewall, or anti-DDoS connection-rate limit.

Distributed load generation is required before treating that cliff as the aggregate capacity of real visitors arriving from many networks.

## Remaining access-dependent work

### Cloudflare proxy and caching

The domain already uses Cloudflare nameservers, but the production A record is not proxied.

Completing this item requires either an active built-in Browser bridge with an authenticated Cloudflare session or a Cloudflare API token scoped to the zone with DNS and cache-rule editing permissions.

The desired rollout is to proxy the production record, preserve origin TLS, cache static hashed assets, bypass API and authenticated traffic, enable compression and HTTP/3, and verify WebSocket and cache behavior.

### Distributed K6 test

Completing the multi-region test requires a Grafana Cloud k6 project token or another approved distributed K6 execution account.

The test should repeat 15, 20, 30, and 40 journey-per-second stages from at least three regions while monitoring the production host.

### Browser Core Web Vitals

The Playwright campaign performance specification is implemented and discoverable.

Execution is blocked because the built-in Browser bridge is installed but not responding.

The browser test should measure an uncached first visit and cached repeat visit on the campaign landing path, including Largest Contentful Paint, Interaction to Next Paint, Cumulative Layout Shift, transfer size, and failed resources.

## Campaign operating guidance

Start campaigns at no more than **10 new visitor journeys per second**.

Keep Prometheus alerts and the Grafana dashboard visible during launch.

Pause traffic expansion if backend 5xx exceeds 1%, p95 latency exceeds 1.5 seconds for five minutes, any target is down, or host memory or disk alerts fire.

Increase traffic only in measured steps after Cloudflare proxying and distributed testing are complete.

Do not use the failed 40-journey single-source stage as a campaign target.

## Evidence and artifacts

- Original capacity report: `reports/load-testing/kalima-production-capacity-report-2026-07-27.md`
- Anonymous K6 scenario: `tests/performance/k6/production-capacity.js`
- Authenticated K6 scenario: `tests/performance/k6/campaign-authenticated-validation.js`
- Browser performance scenario: `kalima-platform/frontend/e2e/campaign-performance.spec.js`
- Production operations templates: `ops/production/`
- Raw K6 results: `reports/load-testing/raw/`

## Final conclusion

Kalima is materially safer for a campaign than it was before this rollout.

The database and cache are deployment-independent, service starvation is constrained, host connection queues are raised, live metrics and alerts are available, and both anonymous and authenticated campaign traffic passed with low latency and no failures at their validated rates.

The current evidence supports a conservative launch budget of **10 journeys per second**, a confirmed sustained capacity of **15 journeys per second**, and a short-burst proof of **20 journeys per second**.

Cloudflare proxying, distributed load generation, and browser Core Web Vitals remain blocked only on external account or Browser bridge access.
