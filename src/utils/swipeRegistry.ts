import type { SwipeCellInstance } from 'vant';

// Tracks the single currently-open swipe cell across all record rows, so that
// opening one closes any other, and a tap can collapse the open one first.
let current: SwipeCellInstance | null = null;

export function registerOpen(cell: SwipeCellInstance | null) {
  if (current && current !== cell) current.close('outside');
  current = cell;
}

// Closes the open cell (if any). Returns true when one was actually closed,
// so callers can swallow the triggering tap instead of acting on it.
export function closeCurrent(): boolean {
  if (current) {
    current.close('outside');
    current = null;
    return true;
  }
  return false;
}

export function clearIf(cell: SwipeCellInstance | null) {
  if (current === cell) current = null;
}
