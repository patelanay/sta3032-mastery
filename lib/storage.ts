import type { AppState, NoteSheetEntry, MistakeEntry } from '@/types';

const STORAGE_KEY = 'sta3032_app_state';

function defaultState(): AppState {
  return {
    noteSheet: [],
    mistakes: [],
    flashcardProgress: {},
    walkthroughProgress: {},
    moduleProgress: {},
    examSessions: [],
    lastWarmupDate: undefined,
  };
}

export function getAppState(): AppState {
  try {
    if (typeof window === 'undefined') return defaultState();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

export function saveAppState(s: AppState): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore write errors (private mode / quota exceeded)
  }
}

export function addNoteSheetEntry(e: NoteSheetEntry): void {
  try {
    const state = getAppState();
    const existing = state.noteSheet.findIndex((n) => n.itemId === e.itemId);
    if (existing !== -1) {
      state.noteSheet[existing] = e;
    } else {
      state.noteSheet.push(e);
    }
    saveAppState(state);
  } catch {
    // noop
  }
}

export function removeNoteSheetEntry(itemId: string): void {
  try {
    const state = getAppState();
    state.noteSheet = state.noteSheet.filter((n) => n.itemId !== itemId);
    saveAppState(state);
  } catch {
    // noop
  }
}

export function addMistake(e: MistakeEntry): void {
  try {
    const state = getAppState();
    state.mistakes.unshift(e);
    saveAppState(state);
  } catch {
    // noop
  }
}

export function updateFlashcardProgress(
  id: string,
  data: Partial<AppState['flashcardProgress'][string]>,
): void {
  try {
    const state = getAppState();
    state.flashcardProgress[id] = {
      ...state.flashcardProgress[id],
      ...data,
    };
    saveAppState(state);
  } catch {
    // noop
  }
}

export function exportStateJSON(): string {
  try {
    return JSON.stringify(getAppState(), null, 2);
  } catch {
    return '{}';
  }
}

export function importStateJSON(json: string): void {
  try {
    const parsed = JSON.parse(json) as AppState;
    saveAppState({ ...defaultState(), ...parsed });
  } catch {
    throw new Error('Invalid JSON — could not import state.');
  }
}
