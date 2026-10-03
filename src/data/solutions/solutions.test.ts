import { describe, it, expect } from 'vitest';
import { solutions } from './index';

/** Every driver.get must be followed by the "main h1" wait before the next find (if there is one). */
const waitsBeforeFirstFind = (code: string, c: (typeof cases)[number]) => {
  const starts = [...code.matchAll(c.get)].map((m) => m.index! + m[0].length);
  return starts.length > 0 && starts.every((start) => {
    const rest = code.slice(start);
    const anchorAt = rest.search(c.anchor);
    const findAt = rest.search(c.find);
    return findAt === -1 || (anchorAt >= 0 && anchorAt < findAt);
  });
};

const cases = [
  { key: 'seleniumJava' as const, get: /driver\.get\(/g, find: /findElements?\(/, anchor: /visibilityOfElementLocated\(By\.cssSelector\("main h1"\)\)/ },
  { key: 'seleniumPython' as const, get: /driver\.get\(/g, find: /find_elements?\(/, anchor: /visibility_of_element_located\(\(By\.CSS_SELECTOR, "main h1"\)\)/ },
];

describe('selenium solutions wait for the lazy-loaded page', () => {
  for (const [id, solution] of Object.entries(solutions)) {
    for (const c of cases) {
      it(`${id} ${c.key}: waits for "main h1" between driver.get and the first find`, () => {
        expect(waitsBeforeFirstFind(solution[c.key], c)).toBe(true);
      });
    }
  }

  it('the guard still catches a missing wait, and allows a get with no find after it', () => {
    const java = cases[0];
    expect(waitsBeforeFirstFind('driver.get(u); driver.findElement(x);', java)).toBe(false);
    expect(waitsBeforeFirstFind('driver.get(u); wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("main h1"))); driver.findElement(x); driver.get(u);', java)).toBe(true);
  });

  it('NBSP xpath uses an escape, not the literal character', () => {
    for (const key of ['seleniumJava', 'seleniumPython'] as const) {
      expect(solutions['locator-traps'][key]).not.toContain(' ');
    }
  });
});
