import { describe, it, expect } from 'vitest';
import { makeRows } from './virtualRows';

describe('makeRows', () => {
  const rows = makeRows();
  it('makes 10,000 rows with ids 1..10000', () => {
    expect(rows).toHaveLength(10000);
    expect(rows[0].id).toBe(1);
    expect(rows[9999].id).toBe(10000);
  });
  it('is deterministic', () => {
    expect(makeRows()).toEqual(rows);
  });
  it('has unique emails that contain the id', () => {
    expect(new Set(rows.map((r) => r.email)).size).toBe(10000);
    expect(rows[7341].email).toMatch(/^[a-z]+\.[a-z]+7342@example\.test$/);
  });
  it('has exactly one top score, far from the top', () => {
    const max = Math.max(...rows.map((r) => r.score));
    const top = rows.filter((r) => r.score === max);
    expect(top).toHaveLength(1);
    expect(top[0].id).toBeGreaterThan(100);
  });
});
