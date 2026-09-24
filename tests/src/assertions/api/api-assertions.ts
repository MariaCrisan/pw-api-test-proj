import { expect, type APIResponse } from '@playwright/test';

export async function expectApiSuccess(response: APIResponse): Promise<void> {
  await expect(response).toBeOK();
}

export async function expectApiStatus(response: APIResponse, status: number): Promise<void> {
  expect(response.status(), `Unexpected response from ${response.url()}`).toBe(status);
}
