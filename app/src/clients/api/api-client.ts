import type { APIRequestContext, APIResponse } from '@playwright/test';

export class ApiClient {
  public constructor(private readonly request: APIRequestContext) {}

  public get(path: string): Promise<APIResponse> {
    return this.request.get(path);
  }

  public post(path: string, data: unknown): Promise<APIResponse> {
    return this.request.post(path, { data });
  }
}
