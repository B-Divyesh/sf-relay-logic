import { describe, expect, it } from 'vitest';
import { applyCell, createGameState, resetGame, testCircuit } from '../../src/game';
import { getDemoPuzzle, solvePuzzle } from '../../src/puzzle';

describe('game rules', () => {
  it('rejects an invalid placement without changing state, then accepts a valid relay', () => {
    const puzzle = getDemoPuzzle(1);
    const initial = createGameState(puzzle);
    const selected = applyCell(initial, puzzle, puzzle.pairs[0][0]).state;
    const solution = solvePuzzle(puzzle, 1).first!;
    const validNext = solution[0][1];
    const invalidCell = Array.from({ length: puzzle.size ** 2 }, (_, cell) => cell)
      .find((cell) => cell !== validNext && !puzzle.edges.some(([a, b]) =>
        (a === puzzle.pairs[0][0] && b === cell) || (b === puzzle.pairs[0][0] && a === cell),
      ))!;

    const invalid = applyCell(selected, puzzle, invalidCell);
    expect(invalid.changed).toBe(false);
    expect(invalid.state).toEqual(selected);

    const recovered = applyCell(invalid.state, puzzle, validNext);
    expect(recovered.changed).toBe(true);
    expect(recovered.state.paths[0]).toEqual(solution[0].slice(0, 2));
  });

  it('reaches a solved end state by following the solver result', () => {
    const puzzle = getDemoPuzzle(1);
    const solution = solvePuzzle(puzzle, 1).first!;
    let state = createGameState(puzzle);
    for (let signal = 0; signal < solution.length; signal += 1) {
      state = applyCell(state, puzzle, puzzle.pairs[signal][0]).state;
      for (const cell of solution[signal].slice(1)) state = applyCell(state, puzzle, cell).state;
    }
    expect(state.status).toBe('won');
  });

  it('ends a run after three failed board tests', () => {
    const puzzle = getDemoPuzzle(1);
    let state = createGameState(puzzle);
    state = testCircuit(state, puzzle).state;
    state = testCircuit(state, puzzle).state;
    state = testCircuit(state, puzzle).state;
    expect(state.status).toBe('lost');
  });

  it('can step back from a connected receiver and recover its relays', () => {
    const puzzle = getDemoPuzzle(1);
    const solution = solvePuzzle(puzzle, 1).first!;
    let state = createGameState(puzzle);
    state = applyCell(state, puzzle, puzzle.pairs[0][0]).state;
    for (const cell of solution[0].slice(1)) state = applyCell(state, puzzle, cell).state;
    expect(state.paths[0].at(-1)).toBe(puzzle.pairs[0][1]);

    const earlier = solution[0][solution[0].length - 2];
    state = applyCell(state, puzzle, earlier).state;
    expect(state.paths[0].at(-1)).toBe(earlier);
    expect(state.paths[0]).not.toContain(puzzle.pairs[0][1]);
  });

  it('reset clears only per-run state', () => {
    const puzzle = getDemoPuzzle(1);
    const solution = solvePuzzle(puzzle, 1).first!;
    let state = createGameState(puzzle);
    state = applyCell(state, puzzle, puzzle.pairs[0][0]).state;
    state = applyCell(state, puzzle, solution[0][1]).state;
    state = testCircuit(state, puzzle).state;
    state.elapsedMs = 3200;

    expect(resetGame(state, puzzle)).toEqual(createGameState(puzzle));
    expect(puzzle.id).toBe('demo-1');
  });
});
