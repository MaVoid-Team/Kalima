# Phase 8 Remaining Proof Rerun Report
Status: PASS

## Browser backend reachability
- PASS: from browser origin `http://127.0.0.1:5173`, `fetch('http://127.0.0.1:5001/api/v2/health')` returned HTTP 200 with `{ status: "ok", version: "v2 new" }`.
- Evidence JSON: `kalima-platform/.hermes/reviews/phase-8-remaining-proof-rerun/evidence.json`.

## Teacher authenticated UI/share proof
- Result: PASS
- Evidence: Authenticated browser route `http://127.0.0.1:5173/teacher/e-booklets/33/invites` rendered the delivered e-booklet access-code UI with `E-booklet access codes`, fixture title, expiry/wallet/student cards, `Create paid WhatsApp message`, `Create paid code only`, `Create free shared access code`, `Generated this session`, and active student list.
- Evidence: Browser click opened the code-generation terms modal (`Accept code-generation terms`), accepted terms, generated a paid WhatsApp-message code, and rendered a generated-session entry with `Paid unique`, a redacted code value, redacted Arabic WhatsApp message, redeem route text, Arabic code label, `Copy code`, and `Copy WhatsApp message` controls.
- Redaction: generated access-code/passcode/token/password values are omitted from this report and evidence.

## Viewer/hotspot browser proof
- Result: PASS
- Evidence: Authenticated delivered viewer route `http://127.0.0.1:5173/teacher/e-booklets/33` rendered `No download`, `Page 1 of 1`, `Render mode: server-page`, `Hotspots`, and all 8 hotspot entries/buttons: text, image, audio, video, file, link, question_answer, and multi-card text.
- Evidence: Browser-origin API calls from the rendered app returned HTTP 200 for the hotspot list and every hotspot content endpoint. Content block types were: text, image, audio, video, file, link, question_answer, and multi-card text+link.
- Evidence: Browser click on `QA Video Hotspot` opened the video hotspot panel; the private asset fallback was visible rather than a playable video element, and browser-origin content API proved one video block with no `autoplay=true` metadata. Browser click on `QA Multi Card Hotspot` rendered non-video multi-card content with `Block 1`, `Block 2`, and link text `QA second card`.
- Note: Direct student viewer route reached backend but was device-bound to the earlier fixture fingerprint (`This device is not allowed...`). That matches the previously passed device-binding proof, so the teacher delivered-viewer route was used for browser-visible hotspot rendering.

## Admin view mode browser proof
- Result: PASS
- Evidence: Authenticated admin browser route `http://127.0.0.1:5173/admin/e-booklet-instances/33/view` rendered `Admin View Mode`, `No download`, `Page 1 of 1`, the admin preview explanation, `Render mode: server-page`, `Hotspots`, and the same 8 hotspot entries/buttons.
- Evidence: Browser-origin admin view API calls returned metadata HTTP 200 with `admin_view_mode: true`, page HTTP 200, and hotspots HTTP 200 with 8 hotspots of types text, image, audio, video, file, link, question_answer, and text.

## Required fixes / blockers
- None.
