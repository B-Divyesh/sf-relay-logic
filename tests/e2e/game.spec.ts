import { devices, expect, test, type Page } from '@playwright/test';
import { SIGNALS, getDemoPuzzle, solvePuzzle, type Puzzle } from '../../src/puzzle';

declare global {
  interface Window {
    __relayLogicSoundLog?: string[];
  }
}

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

test('@claim:complete-run @claim:free-no-account @claim:ad-free @claim:demo-banner completes all sample boards without accounts or ads and keeps the demo label visible', async ({ page }, testInfo) => {
  const requestOrigins = new Set<string>();
  page.on('request', (request) => requestOrigins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();

  for (let step = 1; step <= 3; step += 1) {
    await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
    await expect(page.getByText(`Sample board ${step} of 3`)).toBeVisible();
    await expect(page.locator('iframe, [aria-label*="advertisement" i], [aria-label*="sponsored" i], [data-ad], ins.adsbygoogle')).toHaveCount(0);
    await solveBoard(page, getDemoPuzzle(step));
    const dialog = page.locator('[data-end-dialog]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Every signal is connected' })).toBeVisible();
    if (step === 3) await page.screenshot({ path: testInfo.outputPath('solved-end.png'), fullPage: true });
    await dialog.getByRole('button', {
      name: step < 3 ? 'Open next sample board' : 'Play today’s board',
    }).click();
  }

  await expect(page.getByText(/Daily board/)).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('iframe, [aria-label*="advertisement" i], [aria-label*="sponsored" i], [data-ad], ins.adsbygoogle')).toHaveCount(0);
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.locator('a[href*="checkout" i], a[href*="login" i], a[href*="signin" i], [aria-label*="payment" i]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /buy|pay|sign in|log in|subscribe/i })).toHaveCount(0);
  expect([...requestOrigins]).toEqual([await page.evaluate(() => window.location.origin)]);
});

test('@claim:loss-end reaches a loss screen and restarts the same board', async ({ page }, testInfo) => {
  await page.goto('/demo');
  const seed = await page.locator('.seed code').textContent();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.getByRole('button', { name: 'Test circuit' }).click();
  }
  const dialog = page.locator('[data-end-dialog]');
  await expect(dialog.getByRole('heading', { name: 'This run ended' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('loss-end.png'), fullPage: true });
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

test('@claim:local-save restores paths, learn step, timer, and settings after reload', async ({ page }) => {
  await page.goto('/demo');
  await page.getByText('Settings').click();
  await page.getByLabel('Sound after a move').check();

  await solveBoard(page, getDemoPuzzle(1));
  await page.locator('[data-end-dialog]').getByRole('button', { name: 'Open next sample board' }).click();
  await expect(page.getByText('Sample board 2 of 3')).toBeVisible();

  const puzzle = getDemoPuzzle(2);
  const [source, next] = solvePuzzle(puzzle, 1).first![0];
  await expect.poll(async () => {
    const [minutes, seconds] = (await page.locator('#timer').textContent())!.split(':').map(Number);
    return minutes * 60 + seconds;
  }).toBeGreaterThanOrEqual(1);
  await page.locator(`[data-cell="${source}"]`).click();
  await page.locator(`[data-cell="${next}"]`).click();

  await page.reload();
  await expect(page.getByText('Sample board 2 of 3')).toBeVisible();
  await expect(page.locator(`[data-cell="${next}"]`)).toHaveClass(/relay/);
  const restoredSeconds = await page.locator('#timer').evaluate((timer) => {
    const [minutes, seconds] = timer.textContent!.split(':').map(Number);
    return minutes * 60 + seconds;
  });
  expect(restoredSeconds).toBeGreaterThanOrEqual(1);
  await page.getByText('Settings').click();
  await expect(page.getByLabel('Sound after a move')).toBeChecked();
});

test('@claim:move-sound plays an audio cue for an accepted move only while sound is on', async ({ page }) => {
  await page.addInitScript(() => {
    const soundLog: string[] = [];
    class FixtureOscillator {
      frequency = { value: 0 };
      connect(): this { return this; }
      start(): void { soundLog.push('start'); }
      stop(): void {}
    }
    class FixtureGain {
      gain = {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      };
      connect(): this { return this; }
    }
    class FixtureAudioContext {
      currentTime = 0;
      destination = {};
      createOscillator(): FixtureOscillator { return new FixtureOscillator(); }
      createGain(): FixtureGain { return new FixtureGain(); }
    }
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      writable: true,
      value: FixtureAudioContext,
    });
    Object.defineProperty(window, '__relayLogicSoundLog', {
      configurable: true,
      value: soundLog,
    });
  });

  const puzzle = getDemoPuzzle(1);
  const path = solvePuzzle(puzzle, 1).first![0];
  await page.goto('/demo');
  await page.getByText('Settings').click();
  await page.getByLabel('Sound after a move').check();
  await page.locator(`[data-cell="${path[0]}"]`).click();
  await page.evaluate(() => {
    if (window.__relayLogicSoundLog) window.__relayLogicSoundLog.length = 0;
  });
  await page.locator(`[data-cell="${path[1]}"]`).click();
  await expect(page.locator(`[data-cell="${path[1]}"]`)).toHaveClass(/relay/);

  const startsWithSound = await page.evaluate(() => window.__relayLogicSoundLog?.length ?? 0);
  expect(startsWithSound).toBeGreaterThan(0);

  await page.getByText('Settings').click();
  await page.getByLabel('Sound after a move').uncheck();
  await page.locator(`[data-cell="${path[2]}"]`).click();
  await expect(page.locator(`[data-cell="${path[2]}"]`)).toHaveClass(/relay/);
  await expect.poll(() => page.evaluate(() => window.__relayLogicSoundLog?.length ?? 0)).toBe(startsWithSound);
});

test('@claim:demo-isolation resets both demo keys to sample board 1 without changing real data', async ({ page }) => {
  const existingReal = {
    progress: '{"marker":"real-progress"}',
    settings: '{"sound":true}',
  };
  await page.goto('/');
  await page.evaluate((real) => {
    localStorage.setItem('relay-logic:progress', real.progress);
    localStorage.setItem('relay-logic:settings', real.settings);
  }, existingReal);
  await page.goto('/demo');
  await page.getByText('Settings').click();
  await page.getByLabel('Sound after a move').check();
  await solveBoard(page, getDemoPuzzle(1));
  await page.locator('[data-end-dialog]').getByRole('button', { name: 'Open next sample board' }).click();
  await expect(page.getByText('Sample board 2 of 3')).toBeVisible();

  const stored = await page.evaluate(() => ({
    realProgress: localStorage.getItem('relay-logic:progress'),
    realSettings: localStorage.getItem('relay-logic:settings'),
    demoProgress: localStorage.getItem('demo:relay-logic:progress'),
    demoSettings: localStorage.getItem('demo:relay-logic:settings'),
  }));
  expect(stored).toEqual({
    realProgress: existingReal.progress,
    realSettings: existingReal.settings,
    demoProgress: expect.stringContaining('demo-2'),
    demoSettings: '{"sound":true}',
  });
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const afterReset = await page.evaluate(() => ({
    realProgress: localStorage.getItem('relay-logic:progress'),
    realSettings: localStorage.getItem('relay-logic:settings'),
    demoProgress: localStorage.getItem('demo:relay-logic:progress'),
    demoSettings: localStorage.getItem('demo:relay-logic:settings'),
  }));
  expect(afterReset).toEqual({
    realProgress: existingReal.progress,
    realSettings: existingReal.settings,
    demoProgress: null,
    demoSettings: null,
  });
  await expect(page.getByText('Sample board 1 of 3')).toBeVisible();
  await expect(page.locator('.relay')).toHaveCount(0);
  await expect(page.locator('#timer')).toHaveText('0:00');
  await page.getByText('Settings').click();
  await expect(page.getByLabel('Sound after a move')).not.toBeChecked();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
});

test('@claim:privacy-local sends no play data to another origin', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo');
  await page.waitForLoadState('networkidle');
  expect(new Set(requests.map((url) => new URL(url).origin))).toEqual(new Set([await page.evaluate(() => window.location.origin)]));
  requests.length = 0;
  await page.getByRole('button', { name: 'Explain one rule' }).click();
  await page.getByRole('button', { name: 'Test circuit' }).click();
  await page.waitForTimeout(100);
  expect(requests).toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
});

test('@claim:keyboard-play reaches the board with Tab and places relays with Space, arrows, and Enter', async ({ page }) => {
  const puzzle = getDemoPuzzle(1);
  const solution = solvePuzzle(puzzle, 1).first![0];
  const source = solution[0];
  const next = solution[1];
  await page.goto('/demo');

  let reachedSourceWithTab = false;
  for (let press = 0; press < 40; press += 1) {
    await page.keyboard.press('Tab');
    const focusedCell = await page.evaluate(() => (document.activeElement as HTMLElement).dataset.cell);
    if (focusedCell === String(source)) {
      reachedSourceWithTab = true;
      break;
    }
  }
  expect(reachedSourceWithTab).toBe(true);
  await page.keyboard.press('Space');
  await expect(page.locator(`[data-cell="${source}"]`)).toHaveAttribute('aria-pressed', 'true');

  const keyBetween = (from: number, to: number): string => {
    const fromRow = Math.floor(from / puzzle.size);
    const fromColumn = from % puzzle.size;
    const toRow = Math.floor(to / puzzle.size);
    const toColumn = to % puzzle.size;
    return toRow < fromRow ? 'ArrowUp' : toRow > fromRow ? 'ArrowDown' : toColumn < fromColumn ? 'ArrowLeft' : 'ArrowRight';
  };
  await page.keyboard.press(keyBetween(source, next));
  await expect(page.locator(`[data-cell="${next}"]`)).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator(`[data-cell="${next}"]`)).toHaveClass(/relay/);

  const third = solution[2];
  await page.keyboard.press(keyBetween(next, third));
  await expect(page.locator(`[data-cell="${third}"]`)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator(`[data-cell="${third}"]`)).toHaveClass(/relay/);

  const leftBoundary = page.locator('[data-cell="0"]');
  await leftBoundary.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(leftBoundary).toBeFocused();
});

test('@claim:signal-redundancy pairs every signal color with a visible letter and shape', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Play today’s board' }).click();
  await expect(page.getByText(/Daily board/)).toBeVisible();

  const sourceColors: string[] = [];
  const legendColors: string[] = [];
  for (const signal of SIGNALS) {
    const source = page.getByRole('button', { name: new RegExp(`^${signal.letter} ${signal.shape} source,`) });
    const receiver = page.getByRole('button', { name: new RegExp(`^${signal.letter} ${signal.shape} receiver,`) });
    await expect(source).toHaveCount(1);
    await expect(receiver).toHaveCount(1);
    await expect(source.locator('.signal-letter')).toHaveText(signal.letter);
    await expect(source.locator('.signal-glyph')).toHaveText(signal.glyph);
    await expect(receiver.locator('.signal-letter')).toHaveText(signal.letter);
    await expect(receiver.locator('.signal-glyph')).toHaveText(signal.glyph);
    await expect(page.locator('.legend-item', { hasText: `${signal.letter} · ${signal.shape}` })).toHaveCount(1);
    sourceColors.push(await source.evaluate((element) => getComputedStyle(element).backgroundColor));
    legendColors.push(await page.locator(`.legend-item:has-text("${signal.letter} · ${signal.shape}") .legend-glyph`).evaluate((element) => getComputedStyle(element).color));
  }
  expect(new Set(sourceColors).size).toBe(SIGNALS.length);
  expect(new Set(legendColors).size).toBe(SIGNALS.length);
});

test('@claim:count-up-timer starts at zero and counts up without ending play', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('#timer')).toHaveText('0:00');
  await expect.poll(async () => {
    const [minutes, seconds] = (await page.locator('#timer').textContent())!.split(':').map(Number);
    return minutes * 60 + seconds;
  }).toBeGreaterThanOrEqual(1);
  await expect(page.locator('[data-end-dialog]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Test circuit' })).toBeEnabled();
});

test('@claim:touch-play places a relay with touch input on a phone', async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    ...devices['Pixel 7'],
    baseURL: testInfo.project.use.baseURL as string,
  });
  const page = await context.newPage();
  const puzzle = getDemoPuzzle(1);
  const [source, next] = solvePuzzle(puzzle, 1).first![0];

  await page.goto('/demo');
  await page.locator(`[data-cell="${source}"]`).tap();
  await page.locator(`[data-cell="${next}"]`).tap();

  await expect(page.locator(`[data-cell="${source}"]`)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator(`[data-cell="${next}"]`)).toHaveClass(/relay/);
  await expect(page.getByText('Relay placed.')).toBeVisible();
  await context.close();
});

test('@claim:step-back restores the exact path ending at an earlier relay', async ({ page }) => {
  const puzzle = getDemoPuzzle(1);
  const path = solvePuzzle(puzzle, 1).first![0];
  const earlierRelay = path.at(-2)!;
  await page.goto('/demo');
  await page.locator(`[data-cell="${path[0]}"]`).click();
  for (const cell of path.slice(1)) await page.locator(`[data-cell="${cell}"]`).click();

  await expect(page.locator('.legend-item.signal-0 .legend-state')).toHaveText('connected');
  await page.locator(`[data-cell="${earlierRelay}"]`).click();

  const storedPath = await page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('demo:relay-logic:progress')!);
    return progress.game.paths[0] as number[];
  });
  expect(storedPath).toEqual(path.slice(0, -1));
  await expect(page.locator(`[data-cell="${earlierRelay}"]`)).toHaveClass(/relay/);
  await expect(page.locator('.legend-item.signal-0 .legend-state')).toHaveText('open');
  await expect(page.getByText('Path stepped back. The cleared relays can be used again.')).toBeVisible();
});

test('@claim:undo-action restores the state before the last valid action', async ({ page }) => {
  const puzzle = getDemoPuzzle(1);
  const [source, next] = solvePuzzle(puzzle, 1).first![0];
  await page.goto('/demo');
  await page.locator(`[data-cell="${source}"]`).click();
  await page.locator(`[data-cell="${next}"]`).click();
  await expect(page.locator(`[data-cell="${next}"]`)).toHaveClass(/relay/);

  await page.getByRole('button', { name: 'Undo' }).click();

  const storedGame = await page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('demo:relay-logic:progress')!);
    return { path: progress.game.paths[0] as number[], activeSignal: progress.game.activeSignal as number | null };
  });
  expect(storedGame).toEqual({ path: [source], activeSignal: 0 });
  await expect(page.locator(`[data-cell="${next}"]`)).not.toHaveClass(/relay/);
  await expect(page.locator(`[data-cell="${source}"]`)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Last action undone.')).toBeVisible();
});

test('@claim:leave-demo deletes demo data and preserves existing real data', async ({ page }) => {
  const puzzle = getDemoPuzzle(1);
  const [source, next] = solvePuzzle(puzzle, 1).first![0];
  const existingReal = {
    progress: '{"marker":"existing-real-progress"}',
    settings: '{"sound":true}',
  };
  await page.goto('/');
  await page.evaluate((real) => {
    localStorage.setItem('relay-logic:progress', real.progress);
    localStorage.setItem('relay-logic:settings', real.settings);
  }, existingReal);
  await page.goto('/demo');
  await page.getByText('Settings').click();
  await page.getByLabel('Sound after a move').check();
  await page.locator(`[data-cell="${source}"]`).click();
  await page.locator(`[data-cell="${next}"]`).click();
  expect(await page.evaluate(() => ({
    progress: localStorage.getItem('demo:relay-logic:progress'),
    settings: localStorage.getItem('demo:relay-logic:settings'),
  }))).toEqual({
    progress: expect.stringContaining('demo-1'),
    settings: '{"sound":true}',
  });

  await page.getByRole('button', { name: 'Start for real' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toHaveCount(0);
  expect(await page.evaluate(() => ({
    demoProgress: localStorage.getItem('demo:relay-logic:progress'),
    demoSettings: localStorage.getItem('demo:relay-logic:settings'),
    realProgress: localStorage.getItem('relay-logic:progress'),
    realSettings: localStorage.getItem('relay-logic:settings'),
  }))).toEqual({
    demoProgress: null,
    demoSettings: null,
    realProgress: existingReal.progress,
    realSettings: existingReal.settings,
  });
});
