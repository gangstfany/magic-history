import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, initialState, reducer } from '../store.mjs';

test('initialState matches the prototype defaults exactly', () => {
  assert.deepEqual(initialState, {
    mode: 'learn',
    selectedUnitId: 'u1',
    selectedEventId: 'indigenous-1491',
    completedEventIds: [],
    masteryByEventId: {},
    activeThemeIds: [],
    weakOnly: false,
    statusMessage: '',
  });
});

test('SET_MODE preserves the selection and clears weakOnly in learning mode', () => {
  const reviewState = reducer(
    { ...initialState, selectedUnitId: 'u1', selectedEventId: 'arrival', weakOnly: true },
    { type: 'SET_MODE', mode: 'review' },
  );
  const learnState = reducer(reviewState, { type: 'SET_MODE', mode: 'learn' });

  assert.equal(learnState.mode, 'learn');
  assert.equal(learnState.selectedUnitId, 'u1');
  assert.equal(learnState.selectedEventId, 'arrival');
  assert.equal(learnState.weakOnly, false);
});

test('SET_MODE preserves weakOnly when switching to review', () => {
  const nextState = reducer(
    { ...initialState, weakOnly: true },
    { type: 'SET_MODE', mode: 'review' },
  );

  assert.equal(nextState.mode, 'review');
  assert.equal(nextState.weakOnly, true);
});

test('SELECT_UNIT selects the supplied first event for available units', () => {
  const nextState = reducer(initialState, {
    type: 'SELECT_UNIT',
    unitId: 'u1',
    available: true,
    firstEventId: 'arrival',
  });

  assert.equal(nextState.selectedUnitId, 'u1');
  assert.equal(nextState.selectedEventId, 'arrival');
  assert.equal(nextState.statusMessage, '');
});

test('SELECT_UNIT clears the event and reports unavailable units', () => {
  const nextState = reducer(initialState, {
    type: 'SELECT_UNIT',
    unitId: 'u2',
    available: false,
  });

  assert.equal(nextState.selectedUnitId, 'u2');
  assert.equal(nextState.selectedEventId, null);
  assert.equal(nextState.statusMessage, 'This unit is not included in the prototype.');
});

test('SELECT_EVENT uses its message and clears stale messages by default', () => {
  const withMessage = reducer(initialState, {
    type: 'SELECT_EVENT',
    eventId: 'arrival',
    message: 'Event selected.',
  });
  const withoutMessage = reducer(
    { ...withMessage, statusMessage: 'Stale message.' },
    { type: 'SELECT_EVENT', eventId: 'exchange' },
  );

  assert.equal(withMessage.statusMessage, 'Event selected.');
  assert.equal(withoutMessage.selectedEventId, 'exchange');
  assert.equal(withoutMessage.statusMessage, '');
});

test('completion is idempotent and mastery is independently tracked', () => {
  const completed = reducer(initialState, { type: 'COMPLETE_EVENT', eventId: 'arrival' });
  const repeated = reducer(completed, { type: 'COMPLETE_EVENT', eventId: 'arrival' });
  const mastered = reducer(repeated, {
    type: 'SET_MASTERY',
    eventId: 'arrival',
    mastery: 'mastered',
  });

  assert.deepEqual(mastered.completedEventIds, ['arrival']);
  assert.deepEqual(mastered.masteryByEventId, { arrival: 'mastered' });
  assert.notEqual(completed, initialState);
  assert.notEqual(completed.completedEventIds, initialState.completedEventIds);
  assert.equal(repeated, completed);
  assert.notEqual(mastered, repeated);
  assert.notEqual(mastered.masteryByEventId, repeated.masteryByEventId);
});

test('unknown action returns the same state object', () => {
  assert.equal(reducer(initialState, { type: 'NOT_A_REAL_ACTION' }), initialState);
});

test('TOGGLE_WEAK_ONLY switches the weak-only filter', () => {
  const enabled = reducer(initialState, { type: 'TOGGLE_WEAK_ONLY' });
  const disabled = reducer(enabled, { type: 'TOGGLE_WEAK_ONLY' });

  assert.equal(enabled.weakOnly, true);
  assert.equal(disabled.weakOnly, false);
});

test('theme actions toggle and clear review themes while learning mode clears all review filters', () => {
  const first = reducer(initialState, { type: 'TOGGLE_THEME', themeId: 'GEO' });
  const second = reducer(first, { type: 'TOGGLE_THEME', themeId: 'WOR' });
  const removed = reducer(second, { type: 'TOGGLE_THEME', themeId: 'GEO' });
  const cleared = reducer(removed, { type: 'CLEAR_THEMES' });
  const learn = reducer(
    { ...second, mode: 'review', weakOnly: true },
    { type: 'SET_MODE', mode: 'learn' },
  );

  assert.deepEqual(second.activeThemeIds, ['GEO', 'WOR']);
  assert.deepEqual(removed.activeThemeIds, ['WOR']);
  assert.deepEqual(cleared.activeThemeIds, []);
  assert.deepEqual(learn.activeThemeIds, []);
  assert.equal(learn.weakOnly, false);
});

test('course-scoped envelopes prevent cross-course and legacy hydration', () => {
  const requestedKeys = [];
  const values = new Map([
    ['history-timeline-progress:apush', JSON.stringify({
      courseId: 'apworld',
      schemaVersion: 1,
      progress: { selectedEventId: 'arrival' },
    })],
  ]);
  const storage = {
    getItem: (key) => {
      requestedKeys.push(key);
      return values.get(key) ?? null;
    },
    setItem: (key, value) => values.set(key, value),
  };
  const mismatched = createStore(
    reducer, initialState, storage, (progress) => progress, () => {},
    { courseId: 'apush', schemaVersion: 1 },
  );
  values.set('history-timeline-progress:apush', JSON.stringify({ selectedEventId: 'arrival' }));
  const legacy = createStore(
    reducer, initialState, storage, (progress) => progress, () => {},
    { courseId: 'apush', schemaVersion: 1 },
  );

  assert.equal(mismatched.getState().selectedEventId, initialState.selectedEventId);
  assert.equal(legacy.getState().selectedEventId, initialState.selectedEventId);
  assert.deepEqual(requestedKeys, ['history-timeline-progress:apush', 'history-timeline-progress:apush']);
});

test('subscribers are notified and can unsubscribe', () => {
  const store = createStore(reducer, initialState);
  const observed = [];
  const unsubscribe = store.subscribe((state) => observed.push(state.mode));

  store.dispatch({ type: 'SET_MODE', mode: 'review' });
  unsubscribe();
  store.dispatch({ type: 'SET_MODE', mode: 'learn' });

  assert.deepEqual(observed, ['review']);
});

test('subscriber changes during dispatch do not change the current notification', () => {
  const store = createStore(reducer, initialState);
  const observed = [];
  const second = () => observed.push('second');
  store.subscribe(() => {
    observed.push('first');
    store.subscribe(() => observed.push('third'));
  });
  store.subscribe(second);

  store.dispatch({ type: 'SET_MODE', mode: 'review' });

  assert.deepEqual(observed, ['first', 'second']);
});

test('hydrates from valid stored progress', () => {
  let requestedKey;
  const storage = {
    getItem: (key) => {
      requestedKey = key;
      return JSON.stringify({
        courseId: 'default',
        schemaVersion: 1,
        progress: {
          selectedEventId: 'arrival',
          completedEventIds: ['indigenous-1491'],
          masteryByEventId: { 'indigenous-1491': 'mastered' },
          activeThemeIds: ['GEO'],
        },
      });
    },
    setItem: () => {},
  };
  const store = createStore(reducer, initialState, storage);

  assert.equal(requestedKey, 'history-timeline-progress:default');
  assert.equal(store.getState().selectedEventId, 'arrival');
  assert.deepEqual(store.getState().completedEventIds, ['indigenous-1491']);
  assert.deepEqual(store.getState().masteryByEventId, { 'indigenous-1491': 'mastered' });
  assert.deepEqual(store.getState().activeThemeIds, ['GEO']);
});

test('invalid fields in valid stored JSON fall back to safe seed defaults', () => {
  const store = createStore(reducer, initialState, {
    getItem: () => JSON.stringify({
      courseId: 'default', schemaVersion: 1, progress: {
        mode: 'invalid',
        selectedUnitId: 2,
        selectedEventId: {},
        completedEventIds: null,
        masteryByEventId: [],
        activeThemeIds: null,
        weakOnly: 'yes',
        statusMessage: 1,
      },
    }),
    setItem: () => {},
  });

  assert.deepEqual(store.getState(), initialState);
  assert.doesNotThrow(() => store.dispatch({ type: 'COMPLETE_EVENT', eventId: 'arrival' }));
  assert.deepEqual(store.getState().completedEventIds, ['arrival']);
});

test('persists the updated state under the progress key after dispatch', () => {
  const writes = [];
  const store = createStore(reducer, initialState, {
    getItem: () => null,
    setItem: (key, value) => writes.push([key, value]),
  });

  store.dispatch({ type: 'SELECT_EVENT', eventId: 'arrival' });

  assert.deepEqual(writes, [[
    'history-timeline-progress:default',
    JSON.stringify({
      courseId: 'default',
      schemaVersion: 1,
      progress: {
        version: 1,
        mode: 'learn',
        selectedUnitId: 'u1',
        selectedEventId: 'arrival',
        completedEventIds: [],
        masteryByEventId: {},
        activeThemeIds: [],
        weakOnly: false,
      },
    }),
  ]]);
});

test('does not persist transient status messages', () => {
  const writes = [];
  const store = createStore(reducer, initialState, {
    getItem: () => null,
    setItem: (key, value) => writes.push([key, JSON.parse(value)]),
  });

  store.dispatch({ type: 'SELECT_EVENT', eventId: 'arrival', message: 'Transient announcement.' });

  assert.equal(writes[0][1].schemaVersion, 1);
  assert.equal('statusMessage' in writes[0][1].progress, false);
});

test('reconciles stored progress before hydration sanitizes it', () => {
  const store = createStore(
    reducer,
    initialState,
    {
      getItem: () => JSON.stringify({
        courseId: 'default',
        schemaVersion: 1,
        progress: { selectedEventId: 'removed-event' },
      }),
      setItem: () => {},
    },
    (progress) => ({ ...progress, selectedEventId: 'arrival' }),
  );

  assert.equal(store.getState().selectedEventId, 'arrival');
});

test('malformed storage and storage failures leave usable state with separate save health', () => {
  const malformed = createStore(reducer, initialState, {
    getItem: () => '{bad json',
    setItem: () => {},
  });
  assert.deepEqual(malformed.getState(), initialState);

  const failing = createStore(reducer, initialState, {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('blocked'); },
  });
  assert.equal(failing.getState().statusMessage, '');
  assert.equal(failing.getSaveStatus?.(), 'Progress cannot be saved in this browser.');
  assert.doesNotThrow(() => failing.dispatch({ type: 'SET_MODE', mode: 'review' }));
  assert.equal(failing.getState().statusMessage, '');
  assert.equal(failing.getSaveStatus?.(), 'Progress cannot be saved in this browser.');
});

test('save health callback reports a failed write and clears after recovery', () => {
  let shouldFail = true;
  const observed = [];
  const store = createStore(
    reducer,
    initialState,
    {
      getItem: () => null,
      setItem: () => {
        if (shouldFail) throw new Error('blocked');
      },
    },
    (progress) => progress,
    (message) => observed.push(message),
  );

  store.dispatch({ type: 'SET_MODE', mode: 'review' });
  assert.equal(store.getSaveStatus?.(), 'Progress cannot be saved in this browser.');
  shouldFail = false;
  store.dispatch({ type: 'SET_MODE', mode: 'learn' });

  assert.equal(store.getSaveStatus?.(), '');
  assert.deepEqual(observed, ['Progress cannot be saved in this browser.', '']);
});

test('save health callback stays silent for ordinary successful writes', () => {
  const observed = [];
  const store = createStore(
    reducer,
    initialState,
    { getItem: () => null, setItem: () => {} },
    (progress) => progress,
    (message) => observed.push(message),
  );

  store.dispatch({ type: 'SET_MODE', mode: 'review' });

  assert.deepEqual(observed, []);
});
