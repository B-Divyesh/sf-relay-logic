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

test('@a11y phone footer links have 44px hit areas', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  const sizes = await page.locator('.site-footer nav a').evaluateAll((links) =>
    links.map((link) => {
      const rect = (link as HTMLElement).getBoundingClientRect();
      return { name: link.textContent?.trim(), width: rect.width, height: rect.height };
    }),
  );
  expect(sizes).toHaveLength(3);
  for (const link of sizes) {
    expect(link.width, `${link.name} width`).toBeGreaterThanOrEqual(44);
    expect(link.height, `${link.name} height`).toBeGreaterThanOrEqual(44);
  }
});

test('@a11y demo-banner actions keep a 3:1 focus outline on desktop and phone', async ({ page }) => {
  const contrast = (foreground: string, background: string): number => {
    const channels = (color: string) => color.match(/\d+(?:\.\d+)?/g)!.slice(0, 3).map(Number);
    const luminance = (color: string) => {
      const [red, green, blue] = channels(color).map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    };
    const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (lighter + 0.05) / (darker + 0.05);
  };

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/demo');
    for (const name of ['Reset demo', 'Start for real']) {
      const button = page.getByRole('button', { name });
      await button.focus();
      await expect(button).toBeFocused();
      const focus = await button.evaluate((element) => {
        const buttonStyle = getComputedStyle(element);
        const bannerStyle = getComputedStyle(element.closest('.demo-banner')!);
        return {
          color: buttonStyle.outlineColor,
          style: buttonStyle.outlineStyle,
          width: Number.parseFloat(buttonStyle.outlineWidth),
          background: bannerStyle.backgroundColor,
        };
      });
      expect(focus.style).not.toBe('none');
      expect(focus.width).toBeGreaterThanOrEqual(3);
      expect(contrast(focus.color, focus.background)).toBeGreaterThanOrEqual(3);
    }
  }
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

test('@claim:clear-saved-data privacy control deletes real and demo progress plus sound settings', async ({ page }) => {
  await page.goto('/privacy');
  await page.evaluate(() => {
    localStorage.setItem('relay-logic:progress', 'real');
    localStorage.setItem('relay-logic:settings', '{"sound":true}');
    localStorage.setItem('demo:relay-logic:progress', 'demo');
    localStorage.setItem('demo:relay-logic:settings', '{"sound":false}');
  });
  await page.getByRole('button', { name: 'Clear saved game data' }).click();
  await expect(page.getByText('Saved game data was cleared from this browser.')).toBeVisible();
  expect(await page.evaluate(() => ({
    realProgress: localStorage.getItem('relay-logic:progress'),
    realSettings: localStorage.getItem('relay-logic:settings'),
    demoProgress: localStorage.getItem('demo:relay-logic:progress'),
    demoSettings: localStorage.getItem('demo:relay-logic:settings'),
  }))).toEqual({
    realProgress: null,
    realSettings: null,
    demoProgress: null,
    demoSettings: null,
  });
});
