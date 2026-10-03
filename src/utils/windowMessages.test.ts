import { describe, it, expect } from 'vitest';
import { parseWindowMessage } from './windowMessages';

const O = 'https://example.test';
describe('parseWindowMessage', () => {
  it('accepts known messages from our origin', () => {
    expect(parseWindowMessage({ origin: O, data: { type: 'qa-approve', code: 'AB12' } }, O)).toEqual({ type: 'qa-approve', code: 'AB12' });
    expect(parseWindowMessage({ origin: O, data: { type: 'qa-delayed' } }, O)).toEqual({ type: 'qa-delayed' });
    expect(parseWindowMessage({ origin: O, data: { type: 'qa-pick', window: 'B' } }, O)).toEqual({ type: 'qa-pick', window: 'B' });
  });
  it('ignores other origins, unknown types and malformed data', () => {
    expect(parseWindowMessage({ origin: 'https://evil.test', data: { type: 'qa-delayed' } }, O)).toBeNull();
    expect(parseWindowMessage({ origin: O, data: { type: 'other' } }, O)).toBeNull();
    expect(parseWindowMessage({ origin: O, data: 'qa-delayed' }, O)).toBeNull();
    expect(parseWindowMessage({ origin: O, data: { type: 'qa-approve' } }, O)).toBeNull();
    expect(parseWindowMessage({ origin: O, data: null }, O)).toBeNull();
  });
});
