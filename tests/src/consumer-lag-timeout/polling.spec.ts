import { setTimeout as delay } from 'node:timers/promises';

import { expect, test } from '@playwright/test';

import { poll } from '../../../app/src/utils/polling';

// Exercise the real polling helper with controlled operations instead of external services.
// The callbacks simulate results, failures, and slow work; timers and cancellation are real.

test('retries transient errors and empty results before returning a value', async () => {
  let attempts = 0;
  const record = { orderId: 'order-123' };
  // Simulate a temporary failure, no matching row yet, and finally a found record.
  const result = await poll(
    async () => {
      attempts++;
      if (attempts === 1) throw new Error('Database temporarily unavailable');
      return attempts === 2 ? undefined : record;
    },
    { timeoutMs: 1_000, intervalMs: 1 },
  );

  // Return the original record and stop immediately after the third attempt succeeds.
  expect(result).toBe(record);
  expect(attempts).toBe(3);
});

test('keeps the last operation error in the timeout diagnostics', async () => {
  // Every attempt fails, so polling must retry until its 25 ms budget expires.
  // Assert rejection with a message containing the timeout, target, and last operation error.
  await expect(
    poll(
      async () => {
        throw new Error('Database temporarily unavailable');
      },
      { timeoutMs: 25, intervalMs: 1, description: 'order in PostgreSQL' },
    ),
  ).rejects.toThrow(
    'Timed out after 25ms polling for order in PostgreSQL. Last error: Database temporarily unavailable',
  );
});

test('times out an operation that never settles', async () => {
  // A separate test limit detects a broken polling timeout without hanging the suite.
  test.setTimeout(1_000);
  let attempts = 0;

  // The operation never resolves or rejects; the polling deadline must still reject the wait.
  await expect(
    poll(
      async () => {
        attempts++;
        return new Promise<boolean>(() => undefined);
      },
      { timeoutMs: 25, intervalMs: 1 },
    ),
  ).rejects.toThrow('Timed out after 25ms polling.');
  // Timing out the stalled attempt must not start another operation.
  expect(attempts).toBe(1);
});

test('rejects a successful operation that finishes after the deadline', async () => {
  // A truthy result arrives after 100 ms, beyond the 25 ms budget.
  // The caller must receive a timeout rather than that late success.
  await expect(
    poll(async () => delay(100, true), { timeoutMs: 25, intervalMs: 1 }),
  ).rejects.toThrow('Timed out after 25ms polling.');
});

test('rejects late success even when the operation blocks the timeout timer', async () => {
  // Check the deadline after the operation returns, even if the timer could not run on time.
  await expect(
    poll(
      async () => {
        // Intentionally block the event loop for 50 ms so the 10 ms timer cannot fire.
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
        return true;
      },
      { timeoutMs: 10, intervalMs: 1 },
    ),
  ).rejects.toThrow('Timed out after 10ms polling.');
});

test('aborts cooperative operations when the deadline expires', async () => {
  let operationSignal: AbortSignal | undefined;

  // This simulated work honors the signal, allowing polling to cancel its pending timer.
  await expect(
    poll(
      async (signal) => {
        operationSignal = signal;
        return delay(500, true, { signal });
      },
      { timeoutMs: 25, intervalMs: 1 },
    ),
  ).rejects.toThrow('Timed out after 25ms polling.');
  // Verify that timeout also signals cancellation with an error explaining why it stopped.
  expect(operationSignal?.aborted).toBe(true);
  expect(operationSignal?.reason).toBeInstanceOf(Error);
});

test('handles a late operation rejection without starting another attempt', async () => {
  // Keep the test bounded if polling incorrectly waits forever for the operation.
  test.setTimeout(1_000);
  let rejectOperation!: (error: Error) => void;
  let attempts = 0;
  // Capture the rejection callback so the operation can fail after polling has timed out.
  const operation = new Promise<boolean>((_resolve, reject) => {
    rejectOperation = reject;
  });

  // First verify that polling rejects while the operation is still pending.
  await expect(
    poll(
      async () => {
        attempts++;
        return operation;
      },
      { timeoutMs: 25, intervalMs: 1 },
    ),
  ).rejects.toThrow('Timed out after 25ms polling.');

  // Deliver the failure afterward and let its promise handlers run.
  // An unhandled rejection would fail this test; no retry should be started either.
  rejectOperation(new Error('Late database failure'));
  await new Promise<void>((resolve) => setImmediate(resolve));
  expect(attempts).toBe(1);
});
