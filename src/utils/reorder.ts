/** Returns a copy of `list` with the item at `from` moved so it ends up at index `to`. */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return [...list];
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Press-and-hold sortable: the drag starts only after the pointer is held this long… */
export const HOLD_DELAY_MS = 250;
/** …without moving further than this. */
export const HOLD_TOLERANCE_PX = 5;
/** …and the drag must then report at least this many moves, as a real hand does (a one-jump move is ignored). */
export const HOLD_MIN_MOVES = 3;
