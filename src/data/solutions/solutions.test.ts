import { describe, it, expect } from 'vitest';
import { solutions } from './index';

const cases = [
  { key: 'seleniumJava' as const, get: /driver\.get\(/g, find: /findElements?\(/, anchor: /visibilityOfElementLocated\(By\.cssSelector\("main h1"\)\)/ },
  { key: 'seleniumPython' as const, get: /driver\.get\(/g, find: /find_elements?\(/, anchor: /visibility_of_element_located\(\(By\.CSS_SELECTOR, "main h1"\)\)/ },
];

describe('selenium solutions wait for the lazy-loaded page', () => {
  for (const [id, solution] of Object.entries(solutions)) {
    for (const c of cases) {
      it(`${id} ${c.key}: waits for "main h1" between driver.get and the first find`, () => {
        const code = solution[c.key];
        const starts = [...code.matchAll(c.get)].map((m) => m.index! + m[0].length);
        expect(starts.length).toBeGreaterThan(0);
        for (const start of starts) {
          const rest = code.slice(start);
          const anchorAt = rest.search(c.anchor);
          const findAt = rest.search(c.find);
          expect(anchorAt).toBeGreaterThanOrEqual(0);
          expect(anchorAt).toBeLessThan(findAt);
        }
      });
    }
  }

  it('NBSP xpath uses an escape, not the literal character', () => {
    for (const key of ['seleniumJava', 'seleniumPython'] as const) {
      expect(solutions['locator-traps'][key]).not.toContain(' ');
    }
  });
});
