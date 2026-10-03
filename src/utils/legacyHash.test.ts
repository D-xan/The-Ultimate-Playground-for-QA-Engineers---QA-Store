import { describe, it, expect } from 'vitest';
import { legacyHashTarget } from './legacyHash';

describe('legacyHashTarget', () => {
  it('turns an old hash route into a clean path under the base', () => {
    expect(legacyHashTarget('#/practice/tables', '/')).toBe('/practice/tables');
    expect(legacyHashTarget('#/popup/pick?w=B', '/repo/')).toBe('/repo/popup/pick?w=B');
    expect(legacyHashTarget('#/', '/')).toBe('/');
  });
  it('leaves normal anchors alone', () => {
    expect(legacyHashTarget('', '/')).toBeNull();
    expect(legacyHashTarget('#section-2', '/')).toBeNull();
  });
});
