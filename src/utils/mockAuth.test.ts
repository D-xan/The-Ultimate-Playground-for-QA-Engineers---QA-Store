import { describe, it, expect } from 'vitest';
import { checkCredentials, makeOtp, otpValid, encodeSession, decodeSession } from './mockAuth';

describe('mockAuth', () => {
  it('checks credentials', () => {
    expect(checkCredentials(' Tester@QA.test ', 'Passw0rd!')).toBe(true);
    expect(checkCredentials('tester@qa.test', 'passw0rd!')).toBe(false);
  });
  it('makes zero-padded 6-digit codes', () => {
    expect(makeOtp(() => 0)).toBe('000000');
    expect(makeOtp(() => 0.999999)).toMatch(/^\d{6}$/);
  });
  it('expires codes after the ttl', () => {
    expect(otpValid(0, 59_999)).toBe(true);
    expect(otpValid(0, 60_001)).toBe(false);
  });
  it('round-trips a session and rejects expired or junk tokens', () => {
    const t = encodeSession('tester@qa.test', 1000);
    expect(decodeSession(t, 2000)).toEqual({ user: 'tester@qa.test', exp: 1000 + 3_600_000 });
    expect(decodeSession(t, 1000 + 3_600_001)).toBeNull();
    expect(decodeSession('%%%not-base64', 0)).toBeNull();
    expect(decodeSession(btoa('{"foo":1}'), 0)).toBeNull();
    expect(decodeSession(null, 0)).toBeNull();
  });
});
