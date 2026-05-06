# Kalima E-Booklet Launch-Scale Readiness

Date: 2026-05-06
Scope: E-Booklet backend namespace, Prisma schema, upload handling, invite access, viewer endpoints, and role-specific frontend flows.

## Verdict

- Readiness: At Risk for production launch; acceptable as an integrated MVP behind admin-controlled rollout.
- Highest-risk bottleneck: document/page rendering and file storage are still app-local and renderer-stub based.
- Top 3 launch blockers:
  1. Replace app-local e-booklet file storage with private object storage and signed, per-page/media access.
  2. Integrate a real PDF/DOCX conversion and page-rendering pipeline; current viewer page response is a secure placeholder payload.
  3. Run load tests against invite acceptance and viewer page/hotspot endpoints with realistic class-size traffic.

## Findings

### P1: E-booklet files are stored on app-local disk

- Location: `backend/src/apps/store-api/services/e-booklet.service.ts`
- Evidence: `E_BOOKLET_UPLOAD_DIR` resolves under `uploads/e-booklets/private`, and `createFileAsset` writes uploaded buffers to that directory.
- Failure mode at scale: files can disappear on container restarts, do not automatically replicate across app instances, and require sticky routing or shared volumes to work in a horizontally scaled deployment.
- Recommended fix: introduce a storage adapter backed by private S3/GCS/Cloudinary private assets, store only opaque keys in `e_booklet_file_assets`, and issue short-lived read handles through authorized endpoints.

### P1: Document conversion/page rendering is not production-complete

- Location: `backend/src/apps/store-api/services/e-booklet.service.ts`
- Evidence: `getViewerPage` returns a short-lived signed page token and a `server-page` placeholder message; DOC/DOCX conversion and PDF page rasterization are not wired to a renderer.
- Failure mode at scale: users can navigate the viewer shell, but real booklet pages will not render until a durable conversion/render worker exists.
- Recommended fix: add a background conversion pipeline, store rendered page assets per template version/teacher instance, validate page dimensions from actual render metadata, and serve only authorized page renders.

### P2: No load test evidence for viewer traffic

- Location: repository-level gap
- Evidence: targeted Jest and browser QA exist, but no k6/Artillery/JMeter or equivalent load scenario is present.
- Failure mode at scale: page-by-page viewer access, hotspot media opens, and invite redemption may reveal database or object-storage bottlenecks only after teachers invite full classes.
- Recommended fix: add load scenarios for store browse, invite acceptance, viewer metadata/page/hotspot fetches, and media opens at expected launch concurrency.

### P2: Rate limits are now route-level and memory-backed

- Location: `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts`
- Evidence: `express-rate-limit` protects invite acceptance and viewer endpoints, but defaults are process-local.
- Failure mode at scale: limits reset per app instance and do not coordinate across replicas.
- Recommended fix: use a shared Redis-backed rate-limit store before multi-instance deployment.

### P2: Audit events exist, but alerting and dashboards are not shown in repo

- Location: `backend/src/apps/store-api/prisma/schema.prisma`, `backend/src/apps/store-api/services/e-booklet.service.ts`
- Evidence: `e_booklet_audit_logs` and key writes exist, but no alerting, dashboards, or incident queries are committed.
- Failure mode at scale: abusive invite attempts or file/viewer failures may be recorded but not noticed quickly.
- Recommended fix: add operational dashboards for failed invites, page errors, high request rates, admin delivery failures, and storage/rendering failures.

## Coverage Matrix

| # | Check | Status | Evidence |
|---|---|---|---|
| 1 | Load testing | Fail | No committed load test scenarios. |
| 2 | Server memory sessions | Pass | Auth is JWT/localStorage based; e-booklet access is DB-backed. |
| 3 | App-local file uploads | Fail | E-booklet files write under `uploads/e-booklets/private`. |
| 4 | Synchronous notifications | Pass | E-booklet MVP does not send notifications inline. |
| 5 | Background queue | Fail | Conversion/rendering worker is not implemented yet. |
| 6 | Hardcoded secrets | Pass | Viewer token uses env secrets with dev fallback. |
| 7 | Single DB read scaling | Unknown | Repo shows one Prisma client; deployment topology is not included. |
| 8 | CDN/static asset strategy | Unknown | Frontend build exists; CDN deployment config not shown. |
| 9 | Startup migrations | At Risk | Docker entrypoint runs `prisma migrate deploy`; confirm one-shot deploy semantics. |
| 10 | Restore drills | Unknown | Backup/restore runbook not present. |
| 11 | Relational indexes | Pass | E-booklet access paths have Prisma indexes and migration indexes. |
| 12 | Rate limiting | Pass for MVP | Invite and viewer endpoints now use route-level `express-rate-limit`. |
| 13 | Response compression | Unknown | Compression/proxy config not shown in app server. |
| 14 | Error alerting | Unknown | No Sentry/PagerDuty/log alert config found. |
| 15 | Multi-step writes | Pass | Invite redemption and delivery use Prisma transactions. |
| 16 | Health checks | Pass | `/health`, `/api/v1/health`, and `/api/v2/health` exist. |
| 17 | Memory leaks | Pass | No e-booklet long-lived timers/listeners added. |
| 18 | Graceful shutdown | Pass | `server.ts` handles `SIGINT` and `SIGTERM`. |
| 19 | Third-party fallback | Unknown | Future storage/rendering provider not selected. |
| 20 | Log aggregation | Unknown | Audit table exists; external log sink not shown. |
| 21 | Circuit breakers | Unknown | No outbound e-booklet providers wired yet. |
| 22 | Search/filter degradation | Pass for MVP | Lists are paginated and indexed by status/owner/access paths. |
| 23 | Outbound timeouts | Unknown | No outbound e-booklet HTTP calls wired yet. |
| 24 | Realtime coupling | Pass | E-booklet MVP is HTTP-only. |
| 25 | Runbook | Fail | No e-booklet incident/runbook docs yet. |

## Launch Order

1. Before production launch: add private object storage, real page rendering/conversion, load tests, shared rate-limit store, and a minimal runbook.
2. Next stability improvements: dashboard failed invite/page/media access, delivery failures, file validation failures, and storage/rendering latency.
3. Follow-up hardening: CDN strategy for rendered pages, restore drill documentation, and alert routing for viewer or delivery error spikes.
