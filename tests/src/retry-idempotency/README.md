# Retry and idempotency tests

Run with `npm run test:retry-idempotency`.

The self-hosted order API examples cover sequential and concurrent duplicate requests. With
idempotency enabled, overlapping requests share one acceptance operation and receive the same
response. Failed operations are removed so a later retry can succeed. With idempotency disabled,
duplicates are processed independently.
