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
    warmupState: undefined,
    scenariosProgress: { masteredIds: [], history: {} },
    clozeProgress: { completedIds: [] },
    proofProgress: { masteredIds: [] },
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

// Custom event to sync state across tabs and trigger real-time updates
const STATE_CHANGE_EVENT = 'sta3032_state_changed';

export function saveAppState(s: AppState): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent(STATE_CHANGE_EVENT, { detail: s }));
  } catch {
    // ignore write errors (private mode / quota exceeded)
  }
}

export function subscribeToAppState(callback: (state: AppState) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (event: Event) => {
    const custom = event as CustomEvent<AppState>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getAppState());
    }
  };
  const storageHandler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback(getAppState());
    }
  };
  window.addEventListener(STATE_CHANGE_EVENT, handler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(STATE_CHANGE_EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
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

export function saveScenarioResult(id: string, isCorrect: boolean): void {
  try {
    const state = getAppState();
    if (!state.scenariosProgress) {
      state.scenariosProgress = { masteredIds: [], history: {} };
    }
    state.scenariosProgress.history[id] = {
      correct: isCorrect,
      timestamp: new Date().toISOString(),
    };
    if (isCorrect && !state.scenariosProgress.masteredIds.includes(id)) {
      state.scenariosProgress.masteredIds.push(id);
    }
    saveAppState(state);
  } catch {
    // noop
  }
}

export function saveProofMastery(id: string): void {
  try {
    const state = getAppState();
    if (!state.proofProgress) state.proofProgress = { masteredIds: [] };
    if (!state.proofProgress.masteredIds.includes(id)) {
      state.proofProgress.masteredIds.push(id);
      saveAppState(state);
    }
  } catch {
    // noop
  }
}

export function saveClozeCompletion(id: string): void {
  try {
    const state = getAppState();
    if (!state.clozeProgress) state.clozeProgress = { completedIds: [] };
    if (!state.clozeProgress.completedIds.includes(id)) {
      state.clozeProgress.completedIds.push(id);
      saveAppState(state);
    }
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
