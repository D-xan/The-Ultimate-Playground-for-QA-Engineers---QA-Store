export type WindowMessage =
  | { type: 'qa-approve'; code: string }
  | { type: 'qa-delayed' }
  | { type: 'qa-pick'; window: string };

export const SECRET_KEY = 'qa-windows-secret';

const nonEmpty = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

/** Returns the message only if it came from our own origin and has a known shape. */
export function parseWindowMessage(e: { origin: string; data: unknown }, expectedOrigin: string): WindowMessage | null {
  if (e.origin !== expectedOrigin || typeof e.data !== 'object' || e.data === null) return null;
  const d = e.data as Record<string, unknown>;
  if (d.type === 'qa-approve' && nonEmpty(d.code)) return { type: 'qa-approve', code: d.code };
  if (d.type === 'qa-delayed') return { type: 'qa-delayed' };
  if (d.type === 'qa-pick' && nonEmpty(d.window)) return { type: 'qa-pick', window: d.window };
  return null;
}
