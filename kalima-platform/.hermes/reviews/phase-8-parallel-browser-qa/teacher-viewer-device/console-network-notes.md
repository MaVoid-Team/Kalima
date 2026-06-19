# Console/network notes

Scope: Phase 8 teacher/viewer/device QA lane. No source/test/package/tracker/git edits were made.

Environment probes:
- Frontend listener: 127.0.0.1:5173, PID 34877, HTTP 200 for `/`.
- Backend listener: no process on 127.0.0.1:5001; `curl http://127.0.0.1:5001/api/v2/` failed with connection refused / HTTP 000.
- Backend env probe from `backend/`: `DATABASE_URL_PRESENT=false`, `PORT=`.
- Repo env-file discovery found only `frontend/.env.local`; no backend `.env` file was present. `frontend/.env.local` declares `VITE_API_URL` with origin `http://localhost:5001` and path `/api/v2`.

Browser probes:
- `http://127.0.0.1:5173/` loaded document title `منصة كلمة التعليمية | طريقك للتميز والنجاح`, but `#root` stayed empty and body text stayed empty.
- Visual page was a blank white screen.
- Browser viewport during desktop probe: 1280px wide.
- Direct import probe returned: `ReferenceError: $RefreshReg$ is not defined` at `http://127.0.0.1:5173/src/components/ui/loading-spinner.jsx:12:1`.
- Teacher-route probe used local-only placeholder storage:
  - user id/email: `qa-teacher-local` / `qa.teacher.local@example.test`
  - access/refresh tokens: placeholder strings only
  - portalAccess: store Teacher role
  - URL: `http://127.0.0.1:5173/teacher/e-booklets`
  - Result: `#root` still empty; same `$RefreshReg$ is not defined` import error.
- Browser-context backend fetch to `http://localhost:5001/api/v2/teacher/e-booklets` returned `TypeError: Failed to fetch`.

Static source/API discovery used for non-executed checklist classification:
- Routes exist in `frontend/src/App.jsx`:
  - `/teacher/e-booklets`
  - `/teacher/e-booklets/:instanceId`
  - `/teacher/e-booklets/:instanceId/invites`
  - `/student/e-booklets`
  - `/student/e-booklets/:instanceId`
  - `/e-booklet-invite/:token`
  - `/e-booklet-code`
  - `/admin/e-booklet-instances/:instanceId/view`
  - `/admin/e-booklet-instances/:instanceId/devices`
- API hooks discovered in `frontend/src/hooks/useEBookletAccess.js`:
  - teacher list: `GET /teacher/e-booklets`
  - teacher students: `GET /teacher/e-booklets/:instanceId/students`
  - terms: `GET /teacher/e-booklet-terms/current`
  - code creation: `POST /teacher/e-booklets/:instanceId/access-codes`
  - student list: `GET /student/e-booklets`
  - viewer metadata/pages/hotspots/assets: `/e-booklet-viewer` and `/admin/e-booklet-viewer`
  - device bind: `POST /e-booklet-viewer/:instanceId/devices/bind`
- Viewer source includes static support for text/image/audio/video/file/link/question_answer blocks, no autoplay attribute on uploaded video, and YouTube iframe without autoplay query. These were not executed because the app shell and backend were unavailable.

Screenshots:
- No durable screenshot path was produced by the browser tool in this lane; visual observation was a blank white page.
