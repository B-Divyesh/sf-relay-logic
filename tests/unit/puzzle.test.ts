import { describe, expect, it } from 'vitest';
import { getDailyPuzzle, getDemoPuzzle, getLearnPuzzle, solvePuzzle } from '../../src/puzzle';

describe('puzzle generator', () => {
  it('@claim:daily-seed returns the same unique board for the same UTC date', () => {
    const first = getDailyPuzzle('2026-09-05');
    const second = getDailyPuzzle('2026-09-05');

    expect(second).toEqual(first);
    expect(first.id).toBe('daily-2026-09-05');
    expect(first.pairs).toHaveLength(5);
    expect(solvePuzzle(first).count).toBe(1);
  });

  it('@claim:fresh-daily changes the board topology on the next date', () => {
    const today = getDailyPuzzle('2026-09-05');
    const tomorrow = getDailyPuzzle('2026-09-06');

    expect(tomorrow.seed).not.toBe(today.seed);
    expect(tomorrow.edges).not.toEqual(today.edges);
    expect(tomorrow.pairs).not.toEqual(today.pairs);
  });

  it('solver-checks a year of daily boards and all learn boards', () => {
    for (let day = 0; day < 366; day += 1) {
      const date = new Date(Date.UTC(2026, 0, day + 1)).toISOString().slice(0, 10);
      const puzzle = getDailyPuzzle(date);
      expect(solvePuzzle(puzzle).count, date).toBe(1);
    }
    for (let step = 1; step <= 3; step += 1) {
      expect(solvePuzzle(getLearnPuzzle(step)).count).toBe(1);
      expect(solvePuzzle(getDemoPuzzle(step)).count).toBe(1);
    }
  });
});
