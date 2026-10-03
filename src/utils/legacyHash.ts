/** Maps an old hash route (#/practice/tables) to its clean URL under `base`, or null for anything else. */
export function legacyHashTarget(hash: string, base: string): string | null {
  if (!hash.startsWith('#/')) return null;
  return base.replace(/\/$/, '') + hash.slice(1);
}
