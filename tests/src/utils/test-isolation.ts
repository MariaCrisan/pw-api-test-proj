import { createTestMarker } from './faker';

export interface TestIsolationContext {
  marker: string;
  correlationId: string;
}

export function createTestIsolationContext(prefix = 'pw-test'): TestIsolationContext {
  const marker = createTestMarker(prefix);
  return {
    marker,
    correlationId: `${marker}-correlation`,
  };
}

export async function cleanupTestData(
  cleanup: (marker: string) => Promise<void>,
  context: TestIsolationContext,
): Promise<void> {
  await cleanup(context.marker);
}
