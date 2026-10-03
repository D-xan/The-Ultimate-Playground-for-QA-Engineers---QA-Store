import { describe, it, expect } from 'vitest';
import { certificateId, linkedInUrl, localDateISO } from './certificate';

describe('certificate', () => {
  it('id is 12 upper-case hex chars and independent of challenge order', async () => {
    const a = await certificateId('Ada', '2026-10-03', ['b', 'a']);
    expect(a).toMatch(/^[0-9A-F]{12}$/);
    expect(await certificateId(' Ada ', '2026-10-03', ['a', 'b'])).toBe(a);
    expect(await certificateId('Bob', '2026-10-03', ['a', 'b'])).not.toBe(a);
  });
  it('builds the LinkedIn add-to-profile URL', () => {
    const url = new URL(linkedInUrl({ certId: 'ABC', issued: new Date('2026-10-03T00:00:00Z') }));
    expect(url.searchParams.get('certId')).toBe('ABC');
    expect(url.searchParams.get('issueYear')).toBe('2026');
    expect(url.searchParams.get('certUrl')).toBe('https://qa.randomly.online/');
  });
  it('localDateISO uses the local calendar day', () => {
    expect(localDateISO(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(localDateISO(new Date(2026, 0, 5, 0, 30))).toBe('2026-01-05');
  });
  it('issueMonth is 1-based and local', () => {
    const url = new URL(linkedInUrl({ certId: 'ABC', issued: new Date(2026, 9, 3) }));
    expect(url.searchParams.get('issueMonth')).toBe('10');
  });
});
