import { describe, it, expect } from 'vitest';
import { taskKey, toggle, registerGroup, pageTotal, pageDone, isPageComplete, type ProgressData } from './progressLogic';

const empty: ProgressData = { completed: {}, totals: {} };

describe('progressLogic', () => {
  it('keeps groups on one page independent', () => {
    let d = registerGroup(empty, 'basic', 'inputs', 2);
    d = registerGroup(d, 'basic', 'buttons', 3);
    d = toggle(d, 'basic', taskKey('buttons', 0));
    expect(d.completed.basic).toEqual(['buttons:0']);
    expect(pageTotal(d, 'basic')).toBe(5);
    expect(pageDone(d, 'basic')).toBe(1);
  });

  it('toggle twice un-completes', () => {
    let d = registerGroup(empty, 'p', 'main', 1);
    d = toggle(d, 'p', 'main:0');
    d = toggle(d, 'p', 'main:0');
    expect(pageDone(d, 'p')).toBe(0);
  });

  it('page is complete only when every group is done', () => {
    let d = registerGroup(empty, 'p', 'a', 1);
    d = registerGroup(d, 'p', 'b', 1);
    d = toggle(d, 'p', 'a:0');
    expect(isPageComplete(d, 'p')).toBe(false);
    d = toggle(d, 'p', 'b:0');
    expect(isPageComplete(d, 'p')).toBe(true);
  });

  it('ignores stale keys when a group shrinks', () => {
    let d = registerGroup(empty, 'p', 'main', 3);
    d = toggle(d, 'p', 'main:2');
    d = registerGroup(d, 'p', 'main', 2);
    expect(pageDone(d, 'p')).toBe(0);
    expect(isPageComplete(d, 'p')).toBe(false);
  });

  it('a page with no registered tasks is never complete', () => {
    expect(isPageComplete(empty, 'nothing')).toBe(false);
  });
});
