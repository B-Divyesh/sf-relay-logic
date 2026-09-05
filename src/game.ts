import { areConnected, type Puzzle } from './puzzle';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  puzzleId: string;
  paths: number[][];
  activeSignal: number | null;
  moves: number;
  failedTests: number;
  status: GameStatus;
  elapsedMs: number;
}

export interface GameResult {
  state: GameState;
  changed: boolean;
  message: string;
}

export function createGameState(puzzle: Puzzle): GameState {
  return {
    puzzleId: puzzle.id,
    paths: puzzle.pairs.map(([source]) => [source]),
    activeSignal: null,
    moves: 0,
    failedTests: 0,
    status: 'playing',
    elapsedMs: 0,
  };
}

export function cloneGameState(state: GameState): GameState {
  return { ...state, paths: state.paths.map((path) => [...path]) };
}

export function occupiedCells(state: GameState, puzzle: Puzzle): Map<number, number> {
  const result = new Map<number, number>();
  puzzle.pairs.forEach(([source, receiver], signal) => {
    result.set(source, signal);
    result.set(receiver, signal);
  });
  state.paths.forEach((path, signal) => {
    path.forEach((cell) => result.set(cell, signal));
  });
  return result;
}

export function isSolved(state: GameState, puzzle: Puzzle): boolean {
  if (occupiedCells(state, puzzle).size !== puzzle.size ** 2) return false;
  return state.paths.every(
    (path, signal) => path[path.length - 1] === puzzle.pairs[signal][1],
  );
}

function finishIfNeeded(state: GameState, puzzle: Puzzle): GameState {
  if (isSolved(state, puzzle)) return { ...state, status: 'won', activeSignal: null };
  return state;
}

export function applyCell(state: GameState, puzzle: Puzzle, cell: number): GameResult {
  if (state.status !== 'playing') {
    return { state, changed: false, message: 'Restart this board to place relays.' };
  }

  const sourceSignal = puzzle.pairs.findIndex(([source]) => source === cell);
  if (sourceSignal >= 0) {
    const next = cloneGameState(state);
    if (state.activeSignal === sourceSignal && next.paths[sourceSignal].length > 1) {
      next.paths[sourceSignal] = [cell];
      next.moves += 1;
      return {
        state: next,
        changed: true,
        message: `Signal ${sourceSignal + 1} path cleared to its source.`,
      };
    }
    next.activeSignal = sourceSignal;
    return {
      state: next,
      changed: true,
      message: `Signal ${sourceSignal + 1} selected. Choose a linked socket.`,
    };
  }

  if (state.activeSignal === null) {
    return { state, changed: false, message: 'Select a labeled source before placing a relay.' };
  }

  const signal = state.activeSignal;
  const path = state.paths[signal];
  const tip = path[path.length - 1];
  const receiver = puzzle.pairs[signal][1];
  const ownIndex = path.indexOf(cell);
  if (ownIndex >= 0) {
    if (ownIndex === path.length - 1) {
      return { state, changed: false, message: 'Choose the next linked socket.' };
    }
    const next = cloneGameState(state);
    next.paths[signal] = next.paths[signal].slice(0, ownIndex + 1);
    next.moves += 1;
    return { state: next, changed: true, message: 'Path stepped back. The cleared relays can be used again.' };
  }

  if (tip === receiver) {
    return {
      state,
      changed: false,
      message: 'That signal is connected. Select another source or step back along its path.',
    };
  }

  if (!areConnected(puzzle, tip, cell)) {
    return {
      state,
      changed: false,
      message: 'No etched channel joins those sockets. Your board was not changed.',
    };
  }

  const occupied = occupiedCells(state, puzzle);
  const occupant = occupied.get(cell);
  if (occupant !== undefined && !(cell === receiver && occupant === signal)) {
    return {
      state,
      changed: false,
      message: 'That socket belongs to another signal. Your board was not changed.',
    };
  }

  const next = cloneGameState(state);
  next.paths[signal].push(cell);
  next.moves += 1;
  const finished = finishIfNeeded(next, puzzle);
  if (finished.status === 'won') {
    return { state: finished, changed: true, message: 'Circuit complete. Every signal reached its receiver.' };
  }
  if (cell === receiver) {
    return { state: finished, changed: true, message: `Signal ${signal + 1} connected.` };
  }
  return { state: finished, changed: true, message: 'Relay placed.' };
}

export function testCircuit(state: GameState, puzzle: Puzzle): GameResult {
  if (state.status !== 'playing') {
    return { state, changed: false, message: 'Restart this board before testing again.' };
  }
  if (isSolved(state, puzzle)) {
    return {
      state: { ...cloneGameState(state), status: 'won', activeSignal: null },
      changed: true,
      message: 'Circuit complete. Every signal reached its receiver.',
    };
  }
  const next = cloneGameState(state);
  next.failedTests += 1;
  if (next.failedTests >= 3) {
    next.status = 'lost';
    next.activeSignal = null;
    return {
      state: next,
      changed: true,
      message: 'The third test failed. Restart the same board and try a different route.',
    };
  }
  const empty = puzzle.size ** 2 - occupiedCells(next, puzzle).size;
  return {
    state: next,
    changed: true,
    message: `Test ${next.failedTests} of 3 failed. ${empty} ${empty === 1 ? 'socket is' : 'sockets are'} still empty.`,
  };
}

export function resetGame(_state: GameState, puzzle: Puzzle): GameState {
  return createGameState(puzzle);
}
