import type { SwipeCellInstance } from 'vant';

// Tracks the single currently-open swipe cell across all record rows.
//
// While a cell is open, a capture-phase document click listener intercepts the
// next tap: if it lands on the open cell's own action buttons (.swipe-actions)
// it passes through; otherwise the tap is swallowed and only collapses the open
// cell. This runs before any row's own @click, so tapping another row closes
// the open one without opening that row's detail — a second tap is needed.
let current: SwipeCellInstance | null = null;

function onCaptureClick(e: MouseEvent) {
  if (!current) return;
  const target = e.target as HTMLElement | null;
  if (target?.closest('.swipe-actions')) return; // let action buttons work
  e.stopPropagation();
  e.preventDefault();
  const inst = current;
  current = null;
  document.removeEventListener('click', onCaptureClick, true);
  inst.close('outside');
}

export function registerOpen(inst: SwipeCellInstance | null) {
  if (!inst) return;
  if (current && current !== inst) current.close('outside');
  current = inst;
  document.addEventListener('click', onCaptureClick, true);
}

export function clearCurrent(inst: SwipeCellInstance | null) {
  if (current === inst) {
    current = null;
    document.removeEventListener('click', onCaptureClick, true);
  }
}
