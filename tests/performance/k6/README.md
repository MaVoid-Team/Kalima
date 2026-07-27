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
