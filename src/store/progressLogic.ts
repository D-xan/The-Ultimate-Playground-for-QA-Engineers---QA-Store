export interface ProgressData {
  completed: Record<string, string[]>;
  totals: Record<string, Record<string, number>>;
}

export const taskKey = (groupId: string, index: number) => `${groupId}:${index}`;

export const toggle = (d: ProgressData, pageId: string, key: string): ProgressData => {
  const current = d.completed[pageId] ?? [];
  const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
  return { ...d, completed: { ...d.completed, [pageId]: next } };
};

/** Marks a task done (never un-marks it), for challenges that detect a pass on their own. */
export const complete = (d: ProgressData, pageId: string, key: string): ProgressData =>
  (d.completed[pageId] ?? []).includes(key) ? d : { ...d, completed: { ...d.completed, [pageId]: [...(d.completed[pageId] ?? []), key] } };

export const registerGroup = (d: ProgressData, pageId: string, groupId: string, count: number): ProgressData => {
  if (d.totals[pageId]?.[groupId] === count) return d;
  return { ...d, totals: { ...d.totals, [pageId]: { ...d.totals[pageId], [groupId]: count } } };
};

export const pageTotal = (d: ProgressData, pageId: string) =>
  Object.values(d.totals[pageId] ?? {}).reduce((a, b) => a + b, 0);

const isLiveKey = (d: ProgressData, pageId: string, key: string) => {
  const sep = key.lastIndexOf(':');
  const count = d.totals[pageId]?.[key.slice(0, sep)];
  return count !== undefined && Number(key.slice(sep + 1)) < count;
};

export const pageDone = (d: ProgressData, pageId: string) =>
  (d.completed[pageId] ?? []).filter((k) => isLiveKey(d, pageId, k)).length;

export const isPageComplete = (d: ProgressData, pageId: string) => {
  const total = pageTotal(d, pageId);
  return total > 0 && pageDone(d, pageId) >= total;
};
