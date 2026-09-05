import './styles.css';
import {
  SIGNALS,
  getDailyPuzzle,
  getDemoPuzzle,
  getLearnPuzzle,
  type Puzzle,
} from './puzzle';
import {
  applyCell,
  cloneGameState,
  createGameState,
  occupiedCells,
  resetGame,
  testCircuit,
  type GameState,
} from './game';

type View = 'learn' | 'daily';

interface Progress {
  view: View;
  learnStep: number;
  tutorialComplete: boolean;
  game: GameState;
}

interface Settings {
  sound: boolean;
}

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root is missing.');
const app: HTMLDivElement = root;

const REAL_PROGRESS_KEY = 'relay-logic:progress';
const REAL_SETTINGS_KEY = 'relay-logic:settings';
const DEMO_PROGRESS_KEY = 'demo:relay-logic:progress';
const DEMO_SETTINGS_KEY = 'demo:relay-logic:settings';
const today = new Date().toISOString().slice(0, 10);

let puzzle!: Puzzle;
let game!: GameState;
let progress!: Progress;
let settings!: Settings;
let undoStack: GameState[] = [];
let message = '';
let initializedRoute = '';
let lastFrame = performance.now();
let accumulator = 0;
let lastSavedSecond = -1;
let audioContext: AudioContext | null = null;

function isDemo(): boolean {
  return window.location.pathname === '/demo';
}

function progressKey(): string {
  return isDemo() ? DEMO_PROGRESS_KEY : REAL_PROGRESS_KEY;
}

function settingsKey(): string {
  return isDemo() ? DEMO_SETTINGS_KEY : REAL_SETTINGS_KEY;
}

function safeParse<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function puzzleFor(saved: Pick<Progress, 'view' | 'learnStep'>, demo: boolean): Puzzle {
  if (demo) return getDemoPuzzle(saved.learnStep);
  return saved.view === 'daily' ? getDailyPuzzle(today) : getLearnPuzzle(saved.learnStep);
}

function isValidState(candidate: GameState | undefined, expected: Puzzle): candidate is GameState {
  return Boolean(
    candidate &&
      candidate.puzzleId === expected.id &&
      Array.isArray(candidate.paths) &&
      candidate.paths.length === expected.pairs.length &&
      candidate.paths.every((path, signal) =>
        Array.isArray(path) && path[0] === expected.pairs[signal][0] && path.every(Number.isInteger),
      ) &&
      ['playing', 'won', 'lost'].includes(candidate.status),
  );
}

function loadPlayState(): void {
  const demo = isDemo();
  const fallback: Omit<Progress, 'game'> = {
    view: 'learn',
    learnStep: 1,
    tutorialComplete: false,
  };
  const saved = safeParse<Progress>(progressKey());
  const base = saved
    ? {
        view: saved.view === 'daily' ? ('daily' as const) : ('learn' as const),
        learnStep: Math.min(3, Math.max(1, Number(saved.learnStep) || 1)),
        tutorialComplete: Boolean(saved.tutorialComplete),
      }
    : fallback;
  puzzle = puzzleFor(base, demo);
  game = isValidState(saved?.game, puzzle) ? cloneGameState(saved.game) : createGameState(puzzle);
  progress = { ...base, game };
  settings = safeParse<Settings>(settingsKey()) ?? { sound: false };
  undoStack = [];
  message = game.status === 'playing'
    ? 'Select a labeled source, then choose a linked socket.'
    : game.status === 'won'
      ? 'Circuit complete. Every signal reached its receiver.'
      : 'The circuit tripped. Restart the same board to try again.';
}

function saveProgress(): void {
  progress.game = game;
  try {
    localStorage.setItem(progressKey(), JSON.stringify(progress));
  } catch {
    message = 'This browser blocked storage. You can still finish the current board.';
  }
}

function saveSettings(): void {
  try {
    localStorage.setItem(settingsKey(), JSON.stringify(settings));
  } catch {
    message = 'This browser blocked storage. The sound setting will last for this visit.';
  }
}

function setMeta(title: string, description: string, path: string): void {
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute(
    'href',
    `https://relay-logic.sociobot.in${path}`,
  );
}

function header(): string {
  return `
    <a class="skip-link" href="#main">Skip to game</a>
    <header class="site-header">
      <a class="wordmark" href="/" data-link aria-label="Relay Logic home">
        <span class="wordmark-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        <span>Relay Logic</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="/" data-link>Play</a>
        <a href="/demo" data-link>Demo</a>
        <a href="/privacy" data-link>Privacy</a>
      </nav>
    </header>`;
}

function footer(): string {
  return `
    <footer class="site-footer">
      <p>Relay Logic is a free daily circuit-routing game.</p>
      <nav aria-label="Footer navigation">
        <a href="/privacy" data-link>Privacy</a>
        <a href="/terms" data-link>Terms</a>
        <a href="https://sociobot.in" rel="noreferrer">Built by Param Factory <span class="sr-only">(external site)</span></a>
      </nav>
      <p class="build">Build ${__BUILD_ID__} · Original code-native artwork</p>
    </footer>`;
}

function demoBanner(): string {
  if (!isDemo()) return '';
  return `
    <aside class="demo-banner" aria-label="Demo status">
      <strong>Demo — sample data, nothing is saved</strong>
      <span class="demo-actions">
        <button class="text-button" type="button" data-action="reset-demo">Reset demo</button>
        <button class="text-button" type="button" data-action="start-real">Start for real</button>
      </span>
    </aside>`;
}

function signalClass(signal: number): string {
  return `signal-${signal}`;
}

function pathEdges(paths: number[][]): Array<{ signal: number; a: number; b: number }> {
  return paths.flatMap((path, signal) =>
    path.slice(1).map((cell, index) => ({ signal, a: path[index], b: cell })),
  );
}

function line(edge: readonly [number, number], size: number, className: string): string {
  const [a, b] = edge;
  return `<line x1="${(a % size) + 0.5}" y1="${Math.floor(a / size) + 0.5}" x2="${
    (b % size) + 0.5
  }" y2="${Math.floor(b / size) + 0.5}" class="${className}" />`;
}

function cellLabel(cell: number, occupancy: Map<number, number>): string {
  const row = Math.floor(cell / puzzle.size) + 1;
  const column = (cell % puzzle.size) + 1;
  const source = puzzle.pairs.findIndex(([value]) => value === cell);
  const receiver = puzzle.pairs.findIndex(([, value]) => value === cell);
  if (source >= 0) {
    const signal = SIGNALS[source];
    return `${signal.letter} ${signal.shape} source, row ${row}, column ${column}`;
  }
  if (receiver >= 0) {
    const signal = SIGNALS[receiver];
    return `${signal.letter} ${signal.shape} receiver, row ${row}, column ${column}`;
  }
  const owner = occupancy.get(cell);
  if (owner !== undefined) {
    return `${SIGNALS[owner].letter} relay, row ${row}, column ${column}`;
  }
  return `Empty socket, row ${row}, column ${column}`;
}

function boardHtml(): string {
  const occupancy = occupiedCells(game, puzzle);
  const relays = new Map<number, number>();
  game.paths.forEach((path, signal) => path.slice(1).forEach((cell) => {
    if (cell !== puzzle.pairs[signal][1]) relays.set(cell, signal);
  }));
  const sourceMap = new Map(puzzle.pairs.map(([source], signal) => [source, signal]));
  const receiverMap = new Map(puzzle.pairs.map(([, receiver], signal) => [receiver, signal]));
  const traces = puzzle.edges.map((edge) => line(edge, puzzle.size, 'channel')).join('');
  const filledTraces = pathEdges(game.paths)
    .map(({ signal, a, b }) => line([a, b], puzzle.size, `path-line ${signalClass(signal)}`))
    .join('');
  const cells = Array.from({ length: puzzle.size ** 2 }, (_, cell) => {
    const source = sourceMap.get(cell);
    const receiver = receiverMap.get(cell);
    const relay = relays.get(cell);
    const signal = source ?? receiver ?? relay;
    const classes = [
      'socket',
      source !== undefined ? 'source' : '',
      receiver !== undefined ? 'receiver' : '',
      relay !== undefined ? 'relay' : '',
      signal !== undefined ? signalClass(signal) : '',
      source !== undefined && game.activeSignal === source ? 'active' : '',
    ].filter(Boolean).join(' ');
    const face = signal === undefined
      ? '<span class="socket-core" aria-hidden="true"></span>'
      : `<span class="signal-glyph" aria-hidden="true">${SIGNALS[signal].glyph}</span><span class="signal-letter" aria-hidden="true">${SIGNALS[signal].letter}</span>`;
    return `<button class="${classes}" type="button" data-cell="${cell}" aria-label="${cellLabel(cell, occupancy)}" aria-pressed="${
      source !== undefined ? game.activeSignal === source : relay !== undefined
    }">${face}</button>`;
  }).join('');

  return `
    <div class="board-wrap" aria-label="Circuit board">
      <div class="board size-${puzzle.size}" data-testid="board">
        <svg class="traces" viewBox="0 0 ${puzzle.size} ${puzzle.size}" aria-hidden="true">
          <g>${traces}</g>
          <g>${filledTraces}</g>
        </svg>
        <div class="socket-grid">${cells}</div>
      </div>
    </div>`;
}

function signalLegend(): string {
  return puzzle.pairs.map((_, signal) => {
    const data = SIGNALS[signal];
    const connected = game.paths[signal].at(-1) === puzzle.pairs[signal][1];
    return `<li class="legend-item ${signalClass(signal)}">
      <span class="legend-glyph" aria-hidden="true">${data.glyph}</span>
      <span>${data.letter} · ${data.shape}</span>
      <span class="legend-state">${connected ? 'connected' : 'open'}</span>
    </li>`;
  }).join('');
}

function gamePanel(): string {
  const filled = occupiedCells(game, puzzle).size;
  const signalCount = puzzle.pairs.length;
  const seedLabel = puzzle.id.startsWith('daily-') ? `${today} · ${puzzle.seed}` : String(puzzle.seed);
  return `
    <section class="game-shell" aria-labelledby="board-title">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${puzzle.label}</p>
          <h2 id="board-title">Connect ${signalCount} signal pairs</h2>
        </div>
        <div class="board-readout" aria-label="Board status">
          <span><b>${filled}</b> / ${puzzle.size ** 2} sockets</span>
          <span><b id="timer">${formatTime(game.elapsedMs)}</b></span>
        </div>
      </div>
      <p class="rule">Select a source. Place relays on etched channels. Connect each pair and use every socket.</p>
      <div class="game-layout">
        ${boardHtml()}
        <aside class="control-panel" aria-label="Game controls">
          <div>
            <h3>Signals</h3>
            <ul class="signal-legend">${signalLegend()}</ul>
          </div>
          <div>
            <h3>Board test</h3>
            <p class="fuses" role="img" aria-label="${3 - game.failedTests} of 3 test fuses remain">
              ${Array.from({ length: 3 }, (_, index) => `<span class="fuse ${index < game.failedTests ? 'spent' : ''}" aria-hidden="true"></span>`).join('')}
            </p>
            <button class="secondary-button" type="button" data-action="test">Test circuit</button>
          </div>
          <div class="control-row">
            <button class="secondary-button" type="button" data-action="undo" ${undoStack.length === 0 ? 'disabled' : ''}>Undo</button>
            <button class="secondary-button" type="button" data-action="reset">Reset board</button>
          </div>
          <button class="hint-button" type="button" data-action="hint">Explain one rule</button>
          <details class="settings">
            <summary>Settings</summary>
            <label class="toggle-row"><input type="checkbox" data-setting="sound" ${settings.sound ? 'checked' : ''} /> Sound after a move</label>
          </details>
          ${!isDemo() ? `<button class="text-button mode-switch" type="button" data-action="switch-view">${progress.view === 'learn' ? 'Play today’s board' : 'Open learn boards'}</button>` : ''}
          <p class="seed">Seed <code>${seedLabel}</code></p>
        </aside>
      </div>
      <p class="game-message" role="status" aria-live="polite">${message}</p>
      <p class="keyboard-note">Keyboard: Tab selects a socket. Arrow keys move. Enter or Space places a relay.</p>
    </section>`;
}

function endDialog(): string {
  if (game.status === 'playing') return '';
  const won = game.status === 'won';
  const isLearn = progress.view === 'learn';
  let action = 'Play this board again';
  if (won && isDemo() && progress.learnStep < 3) action = 'Open next sample board';
  else if (won && !isDemo() && isLearn && progress.learnStep < 3) action = 'Open next learn board';
  else if (won && isLearn) action = 'Play today’s board';
  return `
    <dialog class="end-dialog" data-end-dialog aria-labelledby="end-title">
      <div class="end-mark ${won ? 'success' : 'failure'}" aria-hidden="true">${won ? '✓' : '×'}</div>
      <p class="eyebrow">${won ? 'Solved board' : 'Circuit tripped'}</p>
      <h2 id="end-title">${won ? 'Every signal is connected' : 'This run ended'}</h2>
      <p>${won ? `You filled ${puzzle.size ** 2} sockets in ${game.moves} moves and ${formatTime(game.elapsedMs)}.` : 'Three board tests failed. The same circuit is ready for another try.'}</p>
      <div class="dialog-actions">
        <button class="primary-button" type="button" data-action="end-primary">${won ? action : 'Try the same board'}</button>
        ${won && progress.view === 'daily' ? '<button class="secondary-button" type="button" data-action="close-end">Review solved board</button>' : ''}
      </div>
    </dialog>`;
}

function resetDialog(): string {
  return `
    <dialog class="reset-dialog" data-reset-dialog aria-labelledby="reset-title">
      <h2 id="reset-title">Reset this board?</h2>
      <p>Your paths, moves, timer, and failed tests will clear. The seed and sound setting will stay.</p>
      <div class="dialog-actions">
        <button class="primary-button danger-button" type="button" data-action="confirm-reset">Reset board</button>
        <button class="secondary-button" type="button" data-action="cancel-reset">Keep playing</button>
      </div>
    </dialog>`;
}

function playPage(): string {
  const demo = isDemo();
  setMeta(
    demo ? 'Demo — Relay Logic' : 'Relay Logic — route a daily circuit',
    'Route labeled signals across a new, solver-checked circuit board each day.',
    demo ? '/demo' : '/',
  );
  return `${header()}${demoBanner()}
    <main id="main">
      <div class="play-stage">
        <section class="intro" aria-labelledby="page-title">
          <div>
          <p class="product-kicker">Free daily logic game</p>
          <h1 id="page-title" tabindex="-1">Route colored signals through a circuit.</h1>
          <p class="audience">For solo puzzle players who want one fresh board without reading a long rule sheet.</p>
          </div>
          <div class="intro-actions">
          ${demo ? '<strong>Sample ready.</strong><span>Select a source on the board.</span>' : '<a class="primary-button" href="/demo" data-link>Try it with sample data</a><span>Three short boards teach the rule.</span>'}
          </div>
          <ul class="plain-facts" aria-label="Game facts">
          <li>Free to play</li>
          <li>No account or ads</li>
          <li>Progress stays in this browser</li>
          </ul>
        </section>
        ${gamePanel()}
      </div>
      <section class="below-board" aria-labelledby="how-title">
        <div class="section-heading">
          <p class="eyebrow">How it works</p>
          <h2 id="how-title">Finish a board in three steps</h2>
        </div>
        <ol class="steps">
          <li><strong>Select a source.</strong><span>Match its letter and shape with the receiver.</span></li>
          <li><strong>Place each relay.</strong><span>Use etched channels. Two signals cannot share a socket.</span></li>
          <li><strong>Fill the board.</strong><span>Connect every pair and leave no socket empty.</span></li>
        </ol>
      </section>
      <section class="privacy-note" aria-labelledby="privacy-title">
        <div>
          <p class="eyebrow">Data and limits</p>
          <h2 id="privacy-title">Your game stays on this device</h2>
        </div>
        <p>Relay Logic stores your current board and sound setting in this browser. It sends no play data and uses no tracking.</p>
        <p>It does not teach electrical work, keep an account streak, or sell extra puzzles.</p>
      </section>
    </main>
    ${endDialog()}${resetDialog()}${footer()}
    <div class="route-announcer sr-only" aria-live="polite"></div>`;
}

function privacyPage(): string {
  setMeta('Privacy — Relay Logic', 'How Relay Logic stores game progress in your browser without accounts or tracking.', '/privacy');
  return `${header()}
    <main id="main" class="text-page">
      <p class="eyebrow">Privacy</p>
      <h1 tabindex="-1">Control your saved game data</h1>
      <p>Relay Logic has no account, analytics, advertising, or tracking scripts.</p>
      <h2>What this browser stores</h2>
      <p>Your current paths, learn-board step, timer, and sound setting use local storage. Demo progress uses separate keys.</p>
      <h2>What leaves this browser</h2>
      <p>Game actions do not leave your browser. The host receives standard web requests needed to send these static files.</p>
      <h2>Delete saved data</h2>
      <p>This clears real and demo progress plus settings from this browser. It cannot affect another device.</p>
      <button class="primary-button" type="button" data-action="clear-data">Clear saved game data</button>
      <p class="page-message" role="status" aria-live="polite"></p>
    </main>${footer()}<div class="route-announcer sr-only" aria-live="polite"></div>`;
}

function termsPage(): string {
  setMeta('Terms — Relay Logic', 'Terms for playing the free Relay Logic browser game.', '/terms');
  return `${header()}
    <main id="main" class="text-page">
      <p class="eyebrow">Terms</p>
      <h1 tabindex="-1">Terms for playing Relay Logic</h1>
      <p>Relay Logic is a free browser game for personal use.</p>
      <h2>No account or purchase</h2>
      <p>You do not need an account. The game does not offer paid features.</p>
      <h2>Availability</h2>
      <p>The game is provided as available. A saved board may be lost if you clear browser storage.</p>
      <h2>Not electrical guidance</h2>
      <p>The circuits are logic puzzles. They are not instructions for electrical systems.</p>
      <h2>License and contact</h2>
      <p>The source code uses the MIT License. Questions can be sent through the Param Factory website.</p>
      <a class="primary-button" href="/" data-link>Return to the game</a>
    </main>${footer()}<div class="route-announcer sr-only" aria-live="polite"></div>`;
}

function notFoundPage(): string {
  setMeta('Page not found — Relay Logic', 'Return to the Relay Logic daily circuit game.', window.location.pathname);
  return `${header()}
    <main id="main" class="not-found">
      <div class="broken-trace" aria-hidden="true"><span>A</span><i></i><span>?</span></div>
      <p class="eyebrow">404</p>
      <h1 tabindex="-1">This page is not connected</h1>
      <p>The address does not match a Relay Logic page.</p>
      <a class="primary-button" href="/" data-link>Return to the game</a>
    </main>${footer()}<div class="route-announcer sr-only" aria-live="polite"></div>`;
}

function render(options: { focusHeading?: boolean } = {}): void {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const isPlayRoute = path === '/' || path === '/demo';
  if (isPlayRoute && initializedRoute !== path) {
    loadPlayState();
    initializedRoute = path;
  }
  if (!isPlayRoute) initializedRoute = '';
  app.innerHTML = path === '/' || path === '/demo'
    ? playPage()
    : path === '/privacy'
      ? privacyPage()
      : path === '/terms'
        ? termsPage()
        : notFoundPage();
  bindEvents();
  if (options.focusHeading) {
    const heading = app.querySelector<HTMLElement>('h1');
    heading?.focus();
    app.querySelector<HTMLElement>('.route-announcer')!.textContent = document.title;
  }
  const dialog = app.querySelector<HTMLDialogElement>('[data-end-dialog]');
  if (dialog && !dialog.open) requestAnimationFrame(() => dialog.showModal());
}

function formatTime(milliseconds: number): string {
  const total = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function navigate(path: string): void {
  if (window.location.pathname === path) return;
  history.pushState({}, '', path);
  render({ focusHeading: true });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function playSound(kind: 'move' | 'error' | 'win'): void {
  if (!settings.sound) return;
  try {
    audioContext ??= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = kind === 'win' ? 660 : kind === 'error' ? 150 : 330;
    gain.gain.setValueAtTime(0.035, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.08);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.08);
  } catch {
    // Sound is optional; a blocked audio context must not block play.
  }
}

function applyMove(cell: number): void {
  const before = cloneGameState(game);
  const result = applyCell(game, puzzle, cell);
  game = result.state;
  message = result.message;
  if (result.changed) {
    undoStack.push(before);
    saveProgress();
    playSound(game.status === 'won' ? 'win' : 'move');
  } else {
    playSound('error');
  }
  render();
  app.querySelector<HTMLElement>(`[data-cell="${cell}"]`)?.focus();
}

function showHint(): void {
  const unfinished = game.paths.findIndex(
    (path, signal) => path.at(-1) !== puzzle.pairs[signal][1],
  );
  const rules = [
    'A relay can use only an etched channel from the current path end.',
    'Two signals cannot share a socket. Step back before changing a blocked route.',
    'A complete board connects every matching letter and leaves no socket empty.',
  ];
  message = unfinished >= 0 ? `${SIGNALS[unfinished].glyph} ${rules[game.failedTests % rules.length]}` : rules[2];
  render();
}

function resetCurrent(): void {
  game = resetGame(game, puzzle);
  undoStack = [];
  message = 'Board reset. Select a labeled source to begin again.';
  saveProgress();
  render();
}

function resetDemo(): void {
  localStorage.removeItem(DEMO_PROGRESS_KEY);
  localStorage.removeItem(DEMO_SETTINGS_KEY);
  initializedRoute = '';
  render({ focusHeading: true });
}

function startDaily(): void {
  progress.view = 'daily';
  puzzle = getDailyPuzzle(today);
  game = createGameState(puzzle);
  progress.game = game;
  undoStack = [];
  message = 'Today’s board is ready. Select a labeled source.';
  saveProgress();
  render();
}

function nextBoard(): void {
  if (game.status !== 'won') {
    resetCurrent();
    return;
  }
  if (progress.view === 'daily') {
    resetCurrent();
    return;
  }
  if (progress.learnStep < 3) {
    progress.learnStep += 1;
    puzzle = isDemo() ? getDemoPuzzle(progress.learnStep) : getLearnPuzzle(progress.learnStep);
    game = createGameState(puzzle);
    progress.game = game;
    undoStack = [];
    message = 'Next board ready. The extra branch adds one more choice.';
    saveProgress();
    render();
    return;
  }
  progress.tutorialComplete = true;
  startDaily();
}

function moveFocus(cell: HTMLElement, key: string): void {
  const current = Number(cell.dataset.cell);
  const offsets: Record<string, number> = {
    ArrowUp: -puzzle.size,
    ArrowRight: 1,
    ArrowDown: puzzle.size,
    ArrowLeft: -1,
  };
  const next = current + offsets[key];
  const sameRow = Math.floor(current / puzzle.size) === Math.floor(next / puzzle.size);
  if ((key === 'ArrowLeft' || key === 'ArrowRight') && !sameRow) return;
  app.querySelector<HTMLElement>(`[data-cell="${next}"]`)?.focus();
}

function bindEvents(): void {
  app.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(new URL(link.href).pathname);
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-cell]').forEach((cell) => {
    cell.addEventListener('click', () => applyMove(Number(cell.dataset.cell)));
    cell.addEventListener('keydown', (event) => {
      if (event.key.startsWith('Arrow')) {
        event.preventDefault();
        moveFocus(cell, event.key);
      }
    });
  });
  app.querySelectorAll<HTMLInputElement>('[data-setting="sound"]').forEach((input) => {
    input.addEventListener('change', () => {
      settings.sound = input.checked;
      saveSettings();
      message = `Sound is ${settings.sound ? 'on' : 'off'}.`;
      render();
    });
  });
  app.querySelectorAll<HTMLElement>('[data-action]').forEach((control) => {
    control.addEventListener('click', () => {
      const action = control.dataset.action;
      if (action === 'test') {
        const before = cloneGameState(game);
        const result = testCircuit(game, puzzle);
        game = result.state;
        message = result.message;
        if (result.changed) undoStack.push(before);
        saveProgress();
        playSound(game.status === 'lost' ? 'error' : 'move');
        render();
      } else if (action === 'undo' && undoStack.length > 0) {
        game = undoStack.pop()!;
        message = 'Last action undone.';
        saveProgress();
        render();
      } else if (action === 'reset') {
        app.querySelector<HTMLDialogElement>('[data-reset-dialog]')?.showModal();
      } else if (action === 'confirm-reset') {
        resetCurrent();
      } else if (action === 'cancel-reset') {
        app.querySelector<HTMLDialogElement>('[data-reset-dialog]')?.close();
      } else if (action === 'hint') {
        showHint();
      } else if (action === 'reset-demo') {
        resetDemo();
      } else if (action === 'start-real') {
        localStorage.removeItem(DEMO_PROGRESS_KEY);
        localStorage.removeItem(DEMO_SETTINGS_KEY);
        navigate('/');
      } else if (action === 'switch-view') {
        if (progress.view === 'learn') {
          startDaily();
        } else {
          progress.view = 'learn';
          puzzle = getLearnPuzzle(progress.learnStep);
          game = createGameState(puzzle);
          progress.game = game;
          undoStack = [];
          message = 'Learn board ready. Select a labeled source.';
          saveProgress();
          render();
        }
      } else if (action === 'end-primary') {
        nextBoard();
      } else if (action === 'close-end') {
        app.querySelector<HTMLDialogElement>('[data-end-dialog]')?.close();
      } else if (action === 'clear-data') {
        [REAL_PROGRESS_KEY, REAL_SETTINGS_KEY, DEMO_PROGRESS_KEY, DEMO_SETTINGS_KEY].forEach((key) => localStorage.removeItem(key));
        const status = app.querySelector<HTMLElement>('.page-message');
        if (status) status.textContent = 'Saved game data was cleared from this browser.';
      }
    });
  });
}

function gameLoop(time: number): void {
  const delta = Math.min(250, time - lastFrame);
  lastFrame = time;
  if (!document.hidden && initializedRoute && game?.status === 'playing') {
    accumulator += delta;
    const step = 1000 / 60;
    while (accumulator >= step) {
      game.elapsedMs += step;
      accumulator -= step;
    }
    const timer = document.querySelector<HTMLElement>('#timer');
    if (timer) timer.textContent = formatTime(game.elapsedMs);
    const second = Math.floor(game.elapsedMs / 1000);
    if (second > 0 && second % 5 === 0 && second !== lastSavedSecond) {
      lastSavedSecond = second;
      saveProgress();
    }
  }
  requestAnimationFrame(gameLoop);
}

window.addEventListener('popstate', () => render({ focusHeading: true }));
document.addEventListener('visibilitychange', () => {
  lastFrame = performance.now();
  accumulator = 0;
});

render();
requestAnimationFrame(gameLoop);
