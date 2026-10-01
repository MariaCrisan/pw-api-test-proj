export interface WireMockRequestPattern {
  method: string;
  urlPath?: string;
  headers?: Record<string, { equalTo: string }>;
}

export interface WireMockResponseDefinition {
  status: number;
  headers?: Record<string, string>;
  jsonBody?: unknown;
  bodyFileName?: string;
}

export interface WireMockStub {
  id?: string;
  request: WireMockRequestPattern;
  response: WireMockResponseDefinition;
}

export class WireMockClient {
  public constructor(private readonly baseUrl: string) {}

  public async resetToDefaults(): Promise<void> {
    await this.send('/__admin/mappings/reset', { method: 'POST' });
  }

  public createStub(stub: WireMockStub): Promise<WireMockStub> {
    return this.send<WireMockStub>('/__admin/mappings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(stub),
    });
  }

  public async verifyRequest(pattern: WireMockRequestPattern, expectedCount = 1): Promise<void> {
    const result = await this.send<{ count: number }>('/__admin/requests/count', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(pattern),
    });

    if (result.count !== expectedCount) {
      throw new Error(
        `Expected WireMock request ${pattern.method} ${pattern.urlPath ?? ''} ${expectedCount} time(s), received ${result.count}.`,
      );
    }
  }

  private async send<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), init);
    if (!response.ok) {
      throw new Error(
        `WireMock ${init.method ?? 'GET'} ${path} failed with HTTP ${response.status}.`,
      );
    }

    const text = await response.text();
    return text ? (JSON.parse(text) as T) : (undefined as T);
  }
}
