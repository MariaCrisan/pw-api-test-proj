import { performance } from 'node:perf_hooks';
import { setTimeout as delay } from 'node:timers/promises';

export interface PollOptions {
  timeoutMs: number;
  intervalMs: number;
  description?: string;
}

export async function poll<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  options: PollOptions,
): Promise<T> {
  const deadline = performance.now() + options.timeoutMs;
  const controller = new AbortController();
  let lastError: unknown;

  function expire(): Error {
    if (controller.signal.aborted) return controller.signal.reason as Error;
    const reason = lastError instanceof Error ? ` Last error: ${lastError.message}` : '';
    const error = new Error(
      `Timed out after ${options.timeoutMs}ms polling${options.description ? ` for ${options.description}` : ''}.${reason}`,
    );
    controller.abort(error);
    return error;
  }

  async function run(): Promise<T> {
    while (performance.now() < deadline) {
      let result: T | undefined;
      try {
        result = await operation(controller.signal);
      } catch (error) {
        if (!controller.signal.aborted) lastError = error;
      }
      if (controller.signal.aborted || performance.now() >= deadline) throw expire();
      if (result) return result;

      try {
        await delay(
          Math.min(options.intervalMs, Math.max(0, deadline - performance.now())),
          undefined,
          {
            signal: controller.signal,
          },
        );
      } catch (error) {
        if (controller.signal.aborted) throw expire();
        throw error;
      }
    }
    throw expire();
  }

  let timeout!: ReturnType<typeof setTimeout>;
  const timedOut = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(
      () => reject(expire()),
      Math.ceil(Math.max(0, deadline - performance.now())),
    );
  });

  try {
    return await Promise.race([run(), timedOut]);
  } finally {
    clearTimeout(timeout);
  }
}
