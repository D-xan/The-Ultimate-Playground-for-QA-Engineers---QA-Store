export const DEMO_USER = { email: 'tester@qa.test', password: 'Passw0rd!' };
export const SESSION_KEY = 'qa-auth-session';
export const SESSION_COOKIE = 'qa_session';
/** How long the wizard's elevated session lasts. */
export const ELEVATED_MS = 8000;
/** How long wizard step 2 "processes" — longer than ELEVATED_MS, so the session always expires. */
export const PROCESSING_MS = 9000;
export const INBOX_DELAY_MS = 1500;

export function checkCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === DEMO_USER.email && password === DEMO_USER.password;
}

export function makeOtp(rand: () => number = Math.random): string {
  return String(Math.floor(rand() * 1_000_000)).padStart(6, '0');
}

export function otpValid(issuedAt: number, now: number, ttlMs = 60_000): boolean {
  return now - issuedAt <= ttlMs;
}

export function encodeSession(user: string, now: number, ttlMs = 3_600_000): string {
  return btoa(JSON.stringify({ user, exp: now + ttlMs }));
}

/** Returns the session, or null for a missing, malformed or expired token. */
export function decodeSession(token: string | null | undefined, now: number): { user: string; exp: number } | null {
  if (!token) return null;
  try {
    const { user, exp } = JSON.parse(atob(token));
    return typeof user === 'string' && typeof exp === 'number' && exp > now ? { user, exp } : null;
  } catch {
    return null;
  }
}
