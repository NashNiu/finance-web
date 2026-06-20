import { ref } from 'vue';

// Id of the single record row whose swipe actions are currently open (null if
// none). A reactive ref so each row can watch it and close itself when another
// row opens or the open row is dismissed.
export const openSwipeId = ref<number | null>(null);

export function setOpen(id: number) {
  openSwipeId.value = id;
}

export function clearOpen(id: number) {
  if (openSwipeId.value === id) openSwipeId.value = null;
}

export function closeOpen(): boolean {
  if (openSwipeId.value !== null) {
    openSwipeId.value = null;
    return true;
  }
  return false;
}

// Vant SwipeCell auto-closes on `touchstart` (via useClickAway), which fires
// before the click — so by click time openSwipeId is already cleared and the
// tap falls through to open the row's detail. To make "first tap only
// collapses": at touchstart (capture phase, before Vant's handler) record
// whether a row was open and the touch landed outside it; if so, swallow the
// resulting click and collapse the open row instead of opening anything. A
// second tap (nothing open) behaves normally; swiping another row open still
// works because a drag produces no click.
//
// We deliberately do NOT listen on mousedown: on touch the browser fires a
// synthesized mousedown AFTER touchstart (by which point Vant already closed
// the row), which would wrongly disarm the flag. Swipe-open only works via
// touch anyway, so touchstart is the right (and only) signal.
if (typeof document !== 'undefined') {
  let armed = false;

  const onTouchStart = (e: Event) => {
    const target = e.target as HTMLElement | null;
    const onOpenRow = !!target?.closest('.swipe-cell--open');
    armed = openSwipeId.value !== null && !onOpenRow;
  };

  const onClickCapture = (e: MouseEvent) => {
    if (!armed) return;
    armed = false;
    e.stopPropagation();
    e.preventDefault();
    openSwipeId.value = null; // collapse the open row (rows watch this)
  };

  document.addEventListener('touchstart', onTouchStart, true);
  document.addEventListener('click', onClickCapture, true);

  // avoid stacking stale listeners across Vite HMR updates
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      document.removeEventListener('touchstart', onTouchStart, true);
      document.removeEventListener('click', onClickCapture, true);
    });
  }
}
