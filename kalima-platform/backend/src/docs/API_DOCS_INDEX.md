# API documentation index

This file lists the current API documentation pages for the Store API (v2).

- `AUTH_API_DOCUMENTATION.md` — Authentication endpoints (login, register, refresh tokens)
- `ADMIN_API_DOCUMENTATION.md` — Admin-only endpoints and user management
- `GOVERNMENT_API_DOCUMENTATION.md` — CRUD for governments; cross-reference to zones
- `ZONES_API_DOCUMENTATION.md` — CRUD for zones and listing by government
- `SITES_API_DOCUMENTATION.md` — Sites (physical centers) CRUD + constraints
- `SOCIAL_MEDIA_API_DOCUMENTATION.md` — Teacher social media links (create/update/delete)
- `TEACHES_AT_API_DOCUMENTATION.md` — Teacher location entries (create/update/delete)
- `PARENT_CHILDREN_API_DOCUMENTATION.md` — Parent ↔ student relations
- `LEVELS_API_DOCUMENTATION.md` — Education levels CRUD
- `SUBJECTS_API_DOCUMENTATION.md` — Subjects CRUD
- `COUPON_API_DOCUMENTATION.md` — Coupon usage & admin endpoints
- `REQUIRED_FIELDS_API_DOCUMENTATION.md` — Product-required checkout fields
- `PRODUCT_SAMPLE_API_DOCUMENTATION.md` — Product sample files (read endpoints, creation via products)
- `EXPORT_API_DOCUMENTATION.md` — CSV/XLSX export for all list resources

Notes

- The `teachers` and `parents` controllers consolidate related resources (`social-media`, `teaches-at`, `parent-children`). See the resource-specific docs above for endpoints and examples.
- The Postman collection `Kalima_Platform_V2_Store_API.postman_collection.json` has been updated with example requests for the new admin/resource endpoints.

If you want a single OpenAPI/Swagger spec generated from these docs, tell me which format you prefer (OpenAPI v3 / Postman / Markdown site) and I will produce it.
