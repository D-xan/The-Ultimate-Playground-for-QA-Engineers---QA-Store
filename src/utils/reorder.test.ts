import { describe, it, expect } from 'vitest';
import { moveItem } from './reorder';

describe('moveItem', () => {
  it('moves up and down, landing at the target index', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  });
  it('is a no-op for same or out-of-range indexes and never mutates', () => {
    const list = ['a', 'b'];
    expect(moveItem(list, 1, 1)).toEqual(['a', 'b']);
    expect(moveItem(list, 5, 0)).toEqual(['a', 'b']);
    expect(list).toEqual(['a', 'b']);
  });
});
