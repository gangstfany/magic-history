import { PROGRESS_VERSION } from './integration.mjs';

export const initialState = {
  mode: 'learn',
  selectedUnitId: 'u1',
  selectedEventId: 'indigenous-1491',
  completedEventIds: [],
  masteryByEventId: {},
  activeThemeIds: [],
  weakOnly: false,
  statusMessage: '',
};

const PROGRESS_KEY = 'history-timeline-progress';
const STORAGE_FAILURE_MESSAGE = 'Progress cannot be saved in this browser.';

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function sanitizeProgress(seed, progress) {
  const completedEventIds = Array.isArray(progress.completedEventIds)
    && progress.completedEventIds.every((eventId) => typeof eventId === 'string')
    ? progress.completedEventIds
    : seed.completedEventIds;
  const masteryByEventId = isPlainObject(progress.masteryByEventId)
    ? progress.masteryByEventId
    : seed.masteryByEventId;

  return {
    ...seed,
    mode: progress.mode === 'learn' || progress.mode === 'review' ? progress.mode : seed.mode,
    selectedUnitId: typeof progress.selectedUnitId === 'string'
      ? progress.selectedUnitId
      : seed.selectedUnitId,
    selectedEventId: typeof progress.selectedEventId === 'string' || progress.selectedEventId === null
      ? progress.selectedEventId
      : seed.selectedEventId,
    completedEventIds: [...completedEventIds],
    masteryByEventId: { ...masteryByEventId },
    activeThemeIds: Array.isArray(progress.activeThemeIds)
      && progress.activeThemeIds.every((themeId) => typeof themeId === 'string')
      ? [...new Set(progress.activeThemeIds)]
      : [...seed.activeThemeIds],
    weakOnly: typeof progress.weakOnly === 'boolean' ? progress.weakOnly : seed.weakOnly,
    statusMessage: seed.statusMessage,
  };
}

export function reducer(state, action) {
  switch (action?.type) {
    case 'SET_MODE':
      return {
        ...state,
        mode: action.mode,
        weakOnly: action.mode === 'review' ? state.weakOnly : false,
        activeThemeIds: action.mode === 'review' ? state.activeThemeIds : [],
      };

    case 'SELECT_UNIT':
      if (!action.available) {
        return {
          ...state,
          selectedUnitId: action.unitId,
          selectedEventId: null,
          statusMessage: 'This unit is not included in the prototype.',
        };
      }
      return {
        ...state,
        selectedUnitId: action.unitId,
        selectedEventId: action.firstEventId ?? null,
        statusMessage: '',
      };

    case 'SELECT_EVENT':
      return {
        ...state,
        selectedEventId: action.eventId,
        statusMessage: action.message ?? '',
      };

    case 'COMPLETE_EVENT':
      return state.completedEventIds.includes(action.eventId)
        ? state
        : { ...state, completedEventIds: [...state.completedEventIds, action.eventId] };

    case 'SET_MASTERY':
      return {
        ...state,
        masteryByEventId: { ...state.masteryByEventId, [action.eventId]: action.mastery },
      };

    case 'TOGGLE_WEAK_ONLY':
      return { ...state, weakOnly: !state.weakOnly };

    case 'TOGGLE_THEME':
      return state.activeThemeIds.includes(action.themeId)
        ? { ...state, activeThemeIds: state.activeThemeIds.filter((themeId) => themeId !== action.themeId) }
        : { ...state, activeThemeIds: [...state.activeThemeIds, action.themeId] };

    case 'CLEAR_THEMES':
      return state.activeThemeIds.length === 0 ? state : { ...state, activeThemeIds: [] };

    default:
      return state;
  }
}

function hydrate(seed, storage, reconcile, persistence) {
  if (!storage) return { state: seed, saveStatusMessage: '' };

  let stored;
  try {
    stored = storage.getItem(`${PROGRESS_KEY}:${persistence.courseId}`);
  } catch {
    return { state: seed, saveStatusMessage: STORAGE_FAILURE_MESSAGE };
  }

  if (!stored) return { state: seed, saveStatusMessage: '' };
  try {
    const envelope = JSON.parse(stored);
    if (!isPlainObject(envelope)
      || envelope.courseId !== persistence.courseId
      || envelope.schemaVersion !== persistence.schemaVersion
      || !isPlainObject(envelope.progress)) {
      return { state: seed, saveStatusMessage: '' };
    }
    const reconciled = reconcile(envelope.progress);
    return {
      state: isPlainObject(reconciled) ? sanitizeProgress(seed, reconciled) : seed,
      saveStatusMessage: '',
    };
  } catch {
    return { state: seed, saveStatusMessage: '' };
  }
}

function serializeProgress(state) {
  return {
    version: PROGRESS_VERSION,
    mode: state.mode,
    selectedUnitId: state.selectedUnitId,
    selectedEventId: state.selectedEventId,
    completedEventIds: [...state.completedEventIds],
    masteryByEventId: { ...state.masteryByEventId },
    activeThemeIds: [...state.activeThemeIds],
    weakOnly: state.weakOnly,
  };
}

export function createStore(
  reducerFn,
  seed,
  storage = null,
  reconcile = (progress) => progress,
  onSaveStatusChange = () => {},
  persistence = { courseId: 'default', schemaVersion: PROGRESS_VERSION },
) {
  const settings = {
    courseId: typeof persistence?.courseId === 'string' && persistence.courseId
      ? persistence.courseId
      : 'default',
    schemaVersion: Number.isInteger(persistence?.schemaVersion)
      ? persistence.schemaVersion
      : PROGRESS_VERSION,
  };
  const hydrated = hydrate(seed, storage, reconcile, settings);
  let state = hydrated.state;
  let saveStatusMessage = hydrated.saveStatusMessage;
  const subscribers = new Set();

  function setSaveStatus(message) {
    if (message === saveStatusMessage) return;
    saveStatusMessage = message;
    try {
      onSaveStatusChange(message);
    } catch {
      // Save-health observers must not interrupt state updates.
    }
  }

  function persist() {
    if (!storage) return;

    try {
      storage.setItem(`${PROGRESS_KEY}:${settings.courseId}`, JSON.stringify({
        courseId: settings.courseId,
        schemaVersion: settings.schemaVersion,
        progress: serializeProgress(state),
      }));
      setSaveStatus('');
    } catch {
      setSaveStatus(STORAGE_FAILURE_MESSAGE);
    }
  }

  return {
    getState: () => state,
    getSaveStatus: () => saveStatusMessage,
    subscribe(listener) {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
    dispatch(action) {
      state = reducerFn(state, action);
      persist();
      [...subscribers].forEach((listener) => listener(state));
      return action;
    },
  };
}
