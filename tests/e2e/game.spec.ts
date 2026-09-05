import { expect, test, type Page } from '@playwright/test';
import { getDemoPuzzle, solvePuzzle, type Puzzle } from '../../src/puzzle';

async function solveBoard(page: Page, puzzle: Puzzle): Promise<void> {
  const solution = solvePuzzle(puzzle, 1).first;
  expect(solution).not.toBeNull();
  for (let signal = 0; signal < solution!.length; signal += 1) {
    await page.locator(`[data-cell="${puzzle.pairs[signal][0]}"]`).click();
    for (const cell of solution![signal].slice(1)) {
      await page.locator(`[data-cell="${cell}"]`).click();
    }
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('@claim:complete-run @claim:free-no-account completes all sample boards and reaches today without setup', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();

  for (let step = 1; step <= 3; step += 1) {
    await expect(page.getByText(`Sample board ${step} of 3`)).toBeVisible();
    await solveBoard(page, getDemoPuzzle(step));
    const dialog = page.locator('[data-end-dialog]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Every signal is connected' })).toBeVisible();
    await dialog.getByRole('button', {
      name: step < 3 ? 'Open next sample board' : 'Play today’s board',
    }).click();
  }

  await expect(page.getByText(/Daily board/)).toBeVisible();
  await expect(page.locator('form')).toHaveCount(0);
});

test('@claim:loss-end reaches a loss screen and restarts the same board', async ({ page }) => {
  await page.goto('/demo');
  const seed = await page.locator('.seed code').textContent();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.getByRole('button', { name: 'Test circuit' }).click();
  }
  const dialog = page.locator('[data-end-dialog]');
  await expect(dialog.getByRole('heading', { name: 'This run ended' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Try the same board' }).click();
  await expect(page.locator('.seed code')).toHaveText(seed!);
  await expect(page.locator('.relay')).toHaveCount(0);
  await expect(page.locator('.fuse.spent')).toHaveCount(0);
});

test('@claim:invalid-recovery rejects a bad socket and accepts the next valid relay', async ({ page }) => {
  const puzzle = getDemoPuzzle(1);
  const solution = solvePuzzle(puzzle, 1).first!;
  await page.goto('/demo');
  await page.locator(`[data-cell="${puzzle.pairs[0][0]}"]`).click();

  const validNext = solution[0][1];
  const invalid = Array.from({ length: puzzle.size ** 2 }, (_, cell) => cell).find((cell) =>
    cell !== validNext && !puzzle.edges.some(([a, b]) =>
      (a === puzzle.pairs[0][0] && b === cell) || (b === puzzle.pairs[0][0] && a === cell),
    ),
  )!;
  await page.locator(`[data-cell="${invalid}"]`).click();
  await expect(page.getByText('No etched channel joins those sockets. Your board was not changed.')).toBeVisible();
  await expect(page.locator('.relay')).toHaveCount(0);

  await page.locator(`[data-cell="${validNext}"]`).click();
  await expect(page.locator(`[data-cell="${validNext}"]`)).toHaveClass(/relay/);
});

test('@claim:rule-hint explains a rule without changing paths or naming a cell', async ({ page }) => {
  await page.goto('/demo');
  const before = await page.locator('[data-cell][aria-pressed="true"]').count();
  await page.getByRole('button', { name: 'Explain one rule' }).click();
  const text = await page.locator('.game-message').textContent();
  expect(text).toMatch(/relay|signals|board/i);
  expect(text).not.toMatch(/row|column|left|right|above|below|\d+,\d+/i);
  await expect(page.locator('[data-cell][aria-pressed="true"]')).toHaveCount(before);
});

test('@claim:reset-scope clears the run and preserves the seed and sound setting', async ({ page }) => {
  const puzzle = getDemoPuzzle(1);
  const solution = solvePuzzle(puzzle, 1).first!;
  await page.goto('/demo');
  const seed = await page.locator('.seed code').textContent();
  await page.getByText('Settings').click();
  await page.getByLabel('Sound after a move').check();
  await page.locator(`[data-cell="${puzzle.pairs[0][0]}"]`).click();
  await page.locator(`[data-cell="${solution[0][1]}"]`).click();
  await page.getByRole('button', { name: 'Test circuit' }).click();
  await page.getByRole('button', { name: 'Reset board' }).click();

  const dialog = page.locator('[data-reset-dialog]');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Reset board' }).click();
  await expect(page.locator('.relay')).toHaveCount(0);
  await expect(page.locator('.seed code')).toHaveText(seed!);
  await page.getByText('Settings').click();
  await expect(page.getByLabel('Sound after a move')).toBeChecked();
  await expect(page.locator('.fuse.spent')).toHaveCount(0);
  await expect(page.locator('#timer')).toHaveText('0:00');
});

test('@claim:local-save restores paths and settings after reload', async ({ page }) => {
  const puzzle = getDemoPuzzle(1);
  const next = solvePuzzle(puzzle, 1).first![0][1];
  await page.goto('/demo');
  await page.getByText('Settings').click();
  await page.getByLabel('Sound after a move').check();
  await page.locator(`[data-cell="${puzzle.pairs[0][0]}"]`).click();
  await page.locator(`[data-cell="${next}"]`).click();
  await page.reload();
  await expect(page.locator(`[data-cell="${next}"]`)).toHaveClass(/relay/);
  await page.getByText('Settings').click();
  await expect(page.getByLabel('Sound after a move')).toBeChecked();
});

test('@claim:demo-isolation changes demo storage without changing real progress', async ({ page }) => {
  const puzzle = getDemoPuzzle(1);
  const next = solvePuzzle(puzzle, 1).first![0][1];
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('relay-logic:progress', '{"marker":"real-progress"}'));
  await page.goto('/demo');
  await page.locator(`[data-cell="${puzzle.pairs[0][0]}"]`).click();
  await page.locator(`[data-cell="${next}"]`).click();
  const stored = await page.evaluate(() => ({
    real: localStorage.getItem('relay-logic:progress'),
    demo: localStorage.getItem('demo:relay-logic:progress'),
  }));
  expect(stored.real).toBe('{"marker":"real-progress"}');
  expect(stored.demo).toContain('demo-1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
});

test('@claim:privacy-local sends no play data to another origin', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Explain one rule' }).click();
  await page.getByRole('button', { name: 'Test circuit' }).click();
  const productOrigin = await page.evaluate(() => window.location.origin);
  expect([...origins]).toEqual([productOrigin]);
});

test('@claim:keyboard-play operates the board with arrows and Enter', async ({ page }) => {
  const puzzle = getDemoPuzzle(1);
  const solution = solvePuzzle(puzzle, 1).first![0];
  const source = solution[0];
  const next = solution[1];
  await page.goto('/demo');
  const leftBoundary = page.locator('[data-cell="0"]');
  await leftBoundary.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(leftBoundary).toBeFocused();
  await page.locator(`[data-cell="${source}"]`).focus();
  await page.keyboard.press('Enter');

  const sourceRow = Math.floor(source / puzzle.size);
  const sourceColumn = source % puzzle.size;
  const nextRow = Math.floor(next / puzzle.size);
  const nextColumn = next % puzzle.size;
  const key = nextRow < sourceRow ? 'ArrowUp' : nextRow > sourceRow ? 'ArrowDown' : nextColumn < sourceColumn ? 'ArrowLeft' : 'ArrowRight';
  await page.keyboard.press(key);
  await expect(page.locator(`[data-cell="${next}"]`)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator(`[data-cell="${next}"]`)).toHaveClass(/relay/);
});
