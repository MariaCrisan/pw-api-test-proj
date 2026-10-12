# Consumer lag and timeout tests

Run with `npm run test:consumer-lag-timeout`.

Verify delayed delivery, explicit deadlines, consumer cleanup, and useful timeout diagnostics. Avoid fixed waits in production test flows.

Polling tests cover retries, stalled operations, late results, and deadline cancellation. Polling
operations receive an `AbortSignal`; honor it to stop underlying work when the deadline expires.
Operations that ignore the signal can continue running after the polling promise rejects.
