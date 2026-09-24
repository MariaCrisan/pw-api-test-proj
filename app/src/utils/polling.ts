export interface PollOptions {
  timeoutMs: number;
  intervalMs: number;
  description?: string;
}

export async function poll<T>(operation: () => Promise<T>, options: PollOptions): Promise<T> {
  const deadline = Date.now() + options.timeoutMs;
  let lastError: unknown;

  while (Date.now() <= deadline) {
    try {
      const result = await operation();
      if (result) return result;
    } catch (error) {
      lastError = error;
    }
    await delay(Math.min(options.intervalMs, Math.max(0, deadline - Date.now())));
  }

  const reason = lastError instanceof Error ? ` Last error: ${lastError.message}` : '';
  throw new Error(
    `Timed out after ${options.timeoutMs}ms polling${options.description ? ` for ${options.description}` : ''}.${reason}`,
  );
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
