export type Edge = readonly [number, number];
export type Pair = readonly [number, number];

export interface Puzzle {
  id: string;
  label: string;
  seed: number;
  size: number;
  pairs: Pair[];
  edges: Edge[];
  signalOrder: number[];
}

export const SIGNALS = [
  { letter: 'A', shape: 'circle', glyph: '●', color: '#c52e3d' },
  { letter: 'B', shape: 'triangle', glyph: '▲', color: '#1769aa' },
  { letter: 'C', shape: 'diamond', glyph: '◆', color: '#237a52' },
  { letter: 'D', shape: 'square', glyph: '■', color: '#7650a8' },
  { letter: 'E', shape: 'star', glyph: '★', color: '#a95313' },
] as const;

export function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [items[index], items[other]] = [items[other], items[index]];
  }
  return items;
}

export function edgeKey(edge: Edge): string {
  const [a, b] = edge;
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

export function areConnected(puzzle: Puzzle, a: number, b: number): boolean {
  const key = edgeKey([a, b]);
  return puzzle.edges.some((edge) => edgeKey(edge) === key);
}

function transformCell(cell: number, size: number, variant: number): number {
  let row = Math.floor(cell / size);
  let column = cell % size;
  if (variant >= 4) column = size - 1 - column;
  for (let turn = 0; turn < variant % 4; turn += 1) {
    [row, column] = [column, size - 1 - row];
  }
  return row * size + column;
}

function basePath(size: number): number[] {
  const path: number[] = [];
  for (let row = 0; row < size; row += 1) {
    const cells = Array.from({ length: size }, (_, column) => row * size + column);
    path.push(...(row % 2 === 0 ? cells : cells.reverse()));
  }
  return path;
}

function neighbors(cell: number, size: number): number[] {
  const row = Math.floor(cell / size);
  const column = cell % size;
  const result: number[] = [];
  if (row > 0) result.push(cell - size);
  if (column < size - 1) result.push(cell + 1);
  if (row < size - 1) result.push(cell + size);
  if (column > 0) result.push(cell - 1);
  return result;
}

export interface SolveResult {
  count: number;
  first: number[][] | null;
  visitedStates: number;
}

export function solvePuzzle(puzzle: Puzzle, limit = 2): SolveResult {
  const adjacency = Array.from({ length: puzzle.size ** 2 }, () => [] as number[]);
  for (const [a, b] of puzzle.edges) {
    adjacency[a].push(b);
    adjacency[b].push(a);
  }

  const occupied = new Int8Array(puzzle.size ** 2).fill(-1);
  const paths = puzzle.pairs.map(([source], signal) => {
    occupied[source] = signal;
    return [source];
  });
  puzzle.pairs.forEach(([, receiver], signal) => {
    occupied[receiver] = signal;
  });

  let count = 0;
  let first: number[][] | null = null;
  let visitedStates = 0;

  const search = (signal: number): void => {
    if (count >= limit) return;
    visitedStates += 1;
    if (signal === puzzle.pairs.length) {
      if (occupied.every((value) => value >= 0)) {
        count += 1;
        if (!first) first = paths.map((path) => [...path]);
      }
      return;
    }

    const path = paths[signal];
    const tip = path[path.length - 1];
    const receiver = puzzle.pairs[signal][1];
    if (tip === receiver) {
      search(signal + 1);
      return;
    }

    for (const next of adjacency[tip]) {
      if (next === receiver) {
        path.push(next);
        search(signal);
        path.pop();
      } else if (occupied[next] < 0) {
        occupied[next] = signal;
        path.push(next);
        search(signal);
        path.pop();
        occupied[next] = -1;
      }
    }
  };

  search(0);
  return { count, first, visitedStates };
}

interface GenerateOptions {
  size: number;
  signals: number;
  extraEdges: number;
  label: string;
  id: string;
}

export function generatePuzzle(seed: number, options: GenerateOptions): Puzzle {
  const random = mulberry32(seed);
  const variant = Math.floor(random() * 8);
  const path = basePath(options.size)
    .map((cell) => transformCell(cell, options.size, variant));
  if (random() < 0.5) path.reverse();

  const minimumLength = 3;
  const lengths = Array.from({ length: options.signals }, () => minimumLength);
  let remaining = options.size ** 2 - minimumLength * options.signals;
  while (remaining > 0) {
    lengths[Math.floor(random() * lengths.length)] += 1;
    remaining -= 1;
  }
  shuffle(lengths, random);

  const segments: number[][] = [];
  let offset = 0;
  for (const length of lengths) {
    segments.push(path.slice(offset, offset + length));
    offset += length;
  }
  shuffle(segments, random);

  const pairs: Pair[] = segments.map((segment) => [segment[0], segment[segment.length - 1]]);
  const edges: Edge[] = [];
  for (const segment of segments) {
    for (let index = 1; index < segment.length; index += 1) {
      edges.push([segment[index - 1], segment[index]]);
    }
  }

  const existing = new Set(edges.map(edgeKey));
  const candidates: Edge[] = [];
  for (let cell = 0; cell < options.size ** 2; cell += 1) {
    for (const next of neighbors(cell, options.size)) {
      const candidate: Edge = [cell, next];
      const key = edgeKey(candidate);
      if (cell < next && !existing.has(key)) candidates.push(candidate);
    }
  }
  shuffle(candidates, random);

  let added = 0;
  for (const candidate of candidates) {
    if (added === options.extraEdges) break;
    const trial: Puzzle = {
      id: options.id,
      label: options.label,
      seed,
      size: options.size,
      pairs,
      edges: [...edges, candidate],
      signalOrder: Array.from({ length: options.signals }, (_, index) => index),
    };
    if (solvePuzzle(trial).count === 1) {
      edges.push(candidate);
      added += 1;
    }
  }

  if (added !== options.extraEdges) {
    throw new Error(`Seed ${seed} produced only ${added} safe extra channels.`);
  }

  const signalOrder = shuffle(
    Array.from({ length: options.signals }, (_, index) => index),
    random,
  );
  const puzzle: Puzzle = { ...options, seed, pairs, edges, signalOrder };
  if (solvePuzzle(puzzle).count !== 1) {
    throw new Error(`Seed ${seed} did not produce one solution.`);
  }
  return puzzle;
}

export function getDailyPuzzle(date: string): Puzzle {
  const seed = hashSeed(`relay-logic:${date}`);
  return generatePuzzle(seed, {
    id: `daily-${date}`,
    label: `Daily board · ${date}`,
    size: 6,
    signals: 5,
    extraEdges: 10,
  });
}

export function getLearnPuzzle(step: number): Puzzle {
  const safeStep = Math.min(3, Math.max(1, step));
  return generatePuzzle(hashSeed(`relay-logic:learn:${safeStep}`), {
    id: `learn-${safeStep}`,
    label: `Learn ${safeStep} of 3`,
    size: 4,
    signals: 3,
    extraEdges: safeStep + 1,
  });
}

export function getDemoPuzzle(step: number): Puzzle {
  const puzzle = getLearnPuzzle(step);
  return { ...puzzle, id: `demo-${step}`, label: `Sample board ${step} of 3` };
}
