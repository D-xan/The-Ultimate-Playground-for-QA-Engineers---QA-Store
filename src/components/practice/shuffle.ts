/** A shuffled copy (Fisher-Yates), so practice data comes in a new order on every visit. */
export function shuffled<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Drops later items whose key repeats, so a name found on the page points to one item. */
export function uniqueBy<T>(items: readonly T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => !seen.has(key(item)) && !!seen.add(key(item)));
}
