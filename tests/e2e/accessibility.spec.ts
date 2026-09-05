import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

for (const path of ['/', '/demo', '/privacy', '/terms', '/not-a-page']) {
  test(`@a11y ${path} has a clear document structure and no serious axe findings`, async ({ page }) => {
    const errors: string[] = [];
    const failedResponses: Array<{ url: string; status: number }> = [];
    page.on('console', (message) => {
      const isExpectedMissingPage = path === '/not-a-page' && /status of 404/i.test(message.text());
      if (message.type() === 'error' && !isExpectedMissingPage) errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400) failedResponses.push({ url: response.url(), status: response.status() });
    });
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Relay Logic/);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
    expect(serious).toEqual([]);
    expect(errors).toEqual([]);
    if (path === '/not-a-page' && failedResponses.length > 0) {
      expect(failedResponses).toEqual([{ url: `${new URL(page.url()).origin}/not-a-page`, status: 404 }]);
    } else {
      expect(failedResponses).toEqual([]);
    }
  });
}

test('@a11y phone layout keeps the board and controls usable at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await expect(page.getByTestId('board')).toBeVisible();
  const bodyWidth = await page.locator('body').evaluate((body) => body.scrollWidth);
  expect(bodyWidth).toBeLessThanOrEqual(390);
  const smallestSocket = await page.locator('[data-cell]').evaluateAll((cells) =>
    Math.min(...cells.map((cell) => (cell as HTMLElement).getBoundingClientRect().width)),
  );
  expect(smallestSocket).toBeGreaterThanOrEqual(44);
  const board = await page.getByTestId('board').boundingBox();
  expect(board?.y).toBeLessThan(844);
});

test('@a11y reduced motion removes visible transition duration', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/demo');
  const duration = await page.locator('[data-cell]').first().evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.001);
  await context.close();
});

test('route navigation updates title and moves focus to the page heading', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page).toHaveURL('/privacy');
  await expect(page).toHaveTitle('Privacy — Relay Logic');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

test('the home sample action enters the labeled demo in one click', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByTestId('board')).toBeVisible();
});

test('all internal links open a designed page', async ({ page, request }) => {
  await page.goto('/');
  const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) =>
    [...new Set(links.map((link) => (link as HTMLAnchorElement).getAttribute('href')!))],
  );
  for (const href of hrefs) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
  }
  await page.goto('/not-a-page');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page is not connected');
});

test('privacy control deletes real and demo storage', async ({ page }) => {
  await page.goto('/privacy');
  await page.evaluate(() => {
    localStorage.setItem('relay-logic:progress', 'real');
    localStorage.setItem('demo:relay-logic:progress', 'demo');
  });
  await page.getByRole('button', { name: 'Clear saved game data' }).click();
  await expect(page.getByText('Saved game data was cleared from this browser.')).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});
