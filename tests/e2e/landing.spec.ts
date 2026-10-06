import { expect, test } from '@playwright/test';

test('welcome screen links to the family gallery', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Family Portal');
  await expect(page.getByTestId('explore-gallery')).toBeVisible();
  await page.getByTestId('explore-gallery').click();
  await expect(page.getByTestId('gallery-title')).toBeVisible();
});
