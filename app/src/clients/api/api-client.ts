import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface ApiRequestOptions {
  data?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

export class ApiClient {
  public constructor(private readonly requestContext: APIRequestContext) {}

  public get(path: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.requestContext.get(path, options);
  }

  public post(
    path: string,
    data?: unknown,
    options?: Omit<ApiRequestOptions, 'data'>,
  ): Promise<APIResponse> {
    return this.requestContext.post(path, { ...options, data });
  }

  public put(
    path: string,
    data?: unknown,
    options?: Omit<ApiRequestOptions, 'data'>,
  ): Promise<APIResponse> {
    return this.requestContext.put(path, { ...options, data });
  }

  public patch(
    path: string,
    data?: unknown,
    options?: Omit<ApiRequestOptions, 'data'>,
  ): Promise<APIResponse> {
    return this.requestContext.patch(path, { ...options, data });
  }

  public delete(path: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.requestContext.delete(path, options);
  }

  public request(method: string, path: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.requestContext.fetch(path, { method, ...options });
  }
}
