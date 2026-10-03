import { describe, it, expect } from 'vitest';
import { PLANTED_BUGS, DECOY_SYMPTOMS } from '../data/bugCatalog';
import { matchReport } from './bugHunt';

describe('bug hunt catalog', () => {
  it('has six bugs with unique ids and no decoy that matches a bug', () => {
    expect(PLANTED_BUGS).toHaveLength(6);
    expect(new Set(PLANTED_BUGS.map((b) => b.id)).size).toBe(6);
    for (const d of DECOY_SYMPTOMS) expect(matchReport(d.area, d.symptom)).toBeUndefined();
  });
  it('matches a planted bug by area and symptom', () => {
    const b = PLANTED_BUGS[0];
    expect(matchReport(b.area, b.symptom)?.id).toBe(b.id);
  });
});
