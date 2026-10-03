export interface VirtualRow {
  id: number;
  name: string;
  email: string;
  score: number;
}

export const ROW_HEIGHT = 40;
export const VIEWPORT_HEIGHT = 400;
/** The single top scorer, placed deep in the list so it is never visible without sorting. */
export const TOP_SCORER_ID = 6481;

const FIRST = ['Ada', 'Alan', 'Grace', 'Linus', 'Margaret', 'Dennis', 'Barbara', 'Ken', 'Frances', 'John', 'Radia', 'Tim', 'Katherine', 'Edsger', 'Hedy', 'Donald', 'Annie', 'Niklaus', 'Sophie', 'Guido', 'Mary', 'Bjarne', 'Jean', 'James', 'Shafi', 'Brian', 'Lynn', 'Larry', 'Karen', 'Steve', 'Evelyn', 'Vint', 'Joan', 'Bob', 'Carol', 'Leslie', 'Ellen', 'Ward', 'Ruth', 'Yukihiro'];
const LAST = ['Lovelace', 'Turing', 'Hopper', 'Torvalds', 'Hamilton', 'Ritchie', 'Liskov', 'Thompson', 'Allen', 'McCarthy', 'Perlman', 'Berners', 'Johnson', 'Dijkstra', 'Lamarr', 'Knuth', 'Easley', 'Wirth', 'Wilson', 'Rossum', 'Keller', 'Stroustrup', 'Bartik', 'Gosling', 'Goldwasser', 'Kernighan', 'Conway', 'Page', 'Jones', 'Wozniak', 'Berezin', 'Cerf', 'Clarke', 'Kahn', 'Shaw', 'Lamport', 'Spertus', 'Cunningham', 'Teitelbaum', 'Matsumoto'];

/** Small seeded PRNG so every visitor (and every test) sees the same rows. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRows(count = 10000): VirtualRow[] {
  const rand = mulberry32(20261003);
  const rows = Array.from({ length: count }, (_, i) => {
    const id = i + 1;
    const first = FIRST[Math.floor(rand() * FIRST.length)];
    const last = LAST[Math.floor(rand() * LAST.length)];
    return {
      id,
      name: `${first} ${last}`,
      email: `${first}.${last}${id}@example.test`.toLowerCase(),
      score: Math.floor(rand() * 100000),
    };
  });
  if (count >= TOP_SCORER_ID) rows[TOP_SCORER_ID - 1].score = 100000;
  return rows;
}
