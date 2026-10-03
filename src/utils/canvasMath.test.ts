import { describe, it, expect } from 'vitest';
import { targetAt, isHit, SALES, TARGET_W, TARGET_H, TARGET_R } from './canvasMath';

describe('canvasMath', () => {
  it('keeps the target fully inside the canvas', () => {
    for (let t = 0; t < 120; t += 0.25) {
      const { x, y } = targetAt(t);
      expect(x - TARGET_R).toBeGreaterThanOrEqual(0);
      expect(x + TARGET_R).toBeLessThanOrEqual(TARGET_W);
      expect(y - TARGET_R).toBeGreaterThanOrEqual(0);
      expect(y + TARGET_R).toBeLessThanOrEqual(TARGET_H);
    }
  });
  it('moves at most 60 px per second', () => {
    for (let t = 0; t < 60; t += 0.1) {
      const a = targetAt(t), b = targetAt(t + 0.1);
      expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeLessThanOrEqual(6.01);
    }
  });
  it('detects hits inside the radius only', () => {
    expect(isHit({ x: 10, y: 10 }, { x: 30, y: 10 }, 20)).toBe(true);
    expect(isHit({ x: 10, y: 10 }, { x: 31, y: 10 }, 20)).toBe(false);
  });
  it('has twelve months with a unique August peak', () => {
    expect(SALES).toHaveLength(12);
    const max = Math.max(...SALES.map((s) => s.value));
    expect(SALES.filter((s) => s.value === max).map((s) => s.month)).toEqual(['Aug']);
  });
});
