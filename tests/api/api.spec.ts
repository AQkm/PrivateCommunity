import { expect, test } from '@playwright/test';
import PocketBase from 'pocketbase';

const pocketBaseUrl =
  process.env.POCKETBASE_URL ?? process.env.VITE_POCKETBASE_URL ?? 'http://127.0.0.1:8090';

test('PocketBase health API is available', async () => {
  const pb = new PocketBase(pocketBaseUrl);

  const health = await pb.health.check();

  expect(health.code).toBe(200);
});
