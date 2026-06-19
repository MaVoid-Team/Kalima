# E-booklet remaining browser proof handoff

## Scope
Finish remaining e-booklet tracker proof items after admin editor proof:
- Public store card expiry visibility
- Mobile store/detail/invite proof
- Admin manual delivery proof with quota, expiry, student marketing price, internal price
- Zero-price invite + terms grants access without payment proof/passcode
- Student viewer all-hotspot interaction proof, including video solo/no-autoplay behavior

## Changed files
- `frontend/src/pages/e-booklets/EBookletStorePage.jsx`
  - Adds `CalendarDays` import.
  - Adds safe `formatDate` helper.
  - Shows expiry/no-expiry metadata on public e-booklet store cards using `template.accessExpiresAt`.
- `frontend/src/locales/en/eBooklets.json`
  - Adds `store.accessExpires` and `store.noExpiry`.
- `frontend/src/locales/ar/eBooklets.json`
  - Adds Arabic `store.accessExpires` and `store.noExpiry`.

## Browser proof performed
Against local frontend `http://127.0.0.1:5173` and store API `http://127.0.0.1:5001/api/v2`.

### Store expiry
- Public `/e-booklets` card text includes expiry labels, e.g.:
  - `Expires Jul 20, 2026`
  - `Expires Jun 19, 2026`
- No `/api/` errors observed on store page.

### Mobile proof
- Used same-origin 388px iframe viewports for:
  - `/e-booklets`
  - `/e-booklets/instances/5`
  - `/e-booklet-invite/<token>`
- Iframe `innerWidth` confirmed 388px for all three.
- Visual proof via browser screenshot showed narrow/mobile layouts with readable content and no desktop table overflow.

### Admin delivery proof
- Admin created purchase deal id 9 for teacher id 8/template id 2/version id 2.
- Uploaded teacher delivery PDF asset id 22.
- Delivered instance id 5 with:
  - title `E2E Delivered Manual Browser Proof`
  - invite quota `7`
  - expiry `2026-07-20T00:00:00.000Z`
  - student marketing price `33`
  - internal price `12`
- Admin instances page showed `E2E Delivered Manual Browser Proof`, status `Active`, expiry `Jul 20, 2026`.

### Zero-price access proof
- Teacher created free invite token for instance 3.
- Student accepted via browser UI with terms only using `Continue if free`.
- Page redirected after success and toast text included `E-booklet access granted`.
- No payment proof/passcode was used.

### Viewer all-hotspot proof
- Student accepted passcode invite for instance 5.
- `/student/e-booklets/5` showed markers and list for `101` through `108`.
- Clicked each hotspot and verified:
  - 101 text content displayed
  - 102 image rendered (`img` count 1)
  - 103 audio rendered (`audio` count 1)
  - 104 uploaded video rendered (`video` count 1), `controls=true`, `autoplay=false`, `paused=true`
  - 105 YouTube video rendered (`iframe` count 1)
  - 106 protected file content displayed inline as `attachment.txt`
  - 107 link displayed with target `_blank`
  - 108 Q&A content displayed
- No `/api/` errors observed during hotspot interactions.

## Validation commands
- `backend npm test -- --runInBand tests/e-booklet` passed: 2 suites, 67 tests.
- `backend npm run build` passed.
- `frontend npm run build` passed.

## Review focus
Please inspect the changed store card code for correctness, localization safety, regression risk, and whether this slice is acceptable with the proof above.

Verdict required: `APPROVED` or `REQUIRED_FIXES`.
