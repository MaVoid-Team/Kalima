# Kalima production capacity test

This K6 suite models anonymous, read-only campaign traffic against the landing page, store, product catalog, e-booklet store, samples, and health endpoint.

It never signs in, creates accounts, modifies carts, checks out, sends messages, or writes application data.

Run one controlled stage:

```sh
mkdir -p reports/load-testing/raw
RATE=5 DURATION=2m SUMMARY_PATH=reports/load-testing/raw/stage-005.json \
  k6 run tests/performance/k6/production-capacity.js
```

Every request includes `User-Agent: Kalima-Authorized-Capacity-Test/1.0` and `X-Kalima-Load-Test: authorized-production-capacity-test` so test traffic can be identified in logs.

The test aborts when HTTP failures exceed 1%, server errors exceed 2%, timeouts exceed 0.5%, or p95 latency exceeds 3 seconds.

## Repository-only authenticated campaign validation

`campaign-authenticated-validation.js` validates a signed-in campaign journey with dedicated credentials provided through environment variables.

It refuses to start unless `CAMPAIGN_TEST_EMAIL` and `CAMPAIGN_TEST_PASSWORD` are set.

Use a dedicated non-production account.

The script blocks paths containing payment, checkout, purchase, confirmation, Paymob, Stripe, or invoice terms before any request is sent.

It does not add cart items, create purchases, confirm purchases, submit payment forms, or call payment endpoints.

Run locally or against an approved staging host:

```sh
mkdir -p reports/load-testing/raw
BASE_URL=http://127.0.0.1:5001 \
CAMPAIGN_TEST_EMAIL=campaign-validation@example.com \
CAMPAIGN_TEST_PASSWORD='replace-with-dedicated-test-password' \
CAMPAIGN_VISIT_PATHS='/,/market,/e-booklets' \
RATE=1 DURATION=1m \
SUMMARY_PATH=reports/load-testing/raw/campaign-authenticated-validation.json \
  k6 run tests/performance/k6/campaign-authenticated-validation.js
```

Optional variables:

- `CAMPAIGN_AUTH_PATH`, default `/api/v1/auth/login`.
- `CAMPAIGN_VISIT_PATHS`, comma-separated safe page paths, default `/,/market,/e-booklets`.
- `RATE`, `DURATION`, `PRE_ALLOCATED_VUS`, and `MAX_VUS`, using the same K6 arrival-rate controls as the capacity test.
