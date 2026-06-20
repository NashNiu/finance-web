import { ref } from 'vue';

// Id of the single record row whose swipe actions are currently open (null if
// none). Set on @open, cleared on @close. A reactive ref so each row can watch
// it and close itself when another row opens.
export const openSwipeId = ref<number | null>(null);

export function setOpen(id: number) {
  openSwipeId.value = id;
}

export function clearOpen(id: number) {
  if (openSwipeId.value === id) openSwipeId.value = null;
}

// Collapses the open row (if any). Returns true when one was open, so a row tap
// can swallow itself (collapse only) instead of opening the record.
export function closeOpen(): boolean {
  if (openSwipeId.value !== null) {
    openSwipeId.value = null;
    return true;
  }
  return false;
}
