import assert from 'node:assert/strict';
import test from 'node:test';

import { course } from '../data/apush-u1.mjs';
import { initialState } from '../store.mjs';

const integration = await import('../integration.mjs').catch(() => ({}));

test('marker layout deterministically separates clustered hit targets', () => {
  const resolve = integration.resolveMarkerLayout ?? (() => undefined);
  const events = course.events.slice(0, 7).map((event) => ({
    ...event,
    primarySite: { ...event.primarySite, x: 50, y: 50 },
  }));
  const first = resolve(events, { minX: 14, minY: 20 });
  const second = resolve(events, { minX: 14, minY: 20 });

  assert.deepEqual(first, second);
  assert.equal(first?.length, events.length);
  for (let left = 0; left < first.length; left += 1) {
    for (let right = left + 1; right < first.length; right += 1) {
      const separatedX = Math.abs(first[left].x - first[right].x) >= 14;
      const separatedY = Math.abs(first[left].y - first[right].y) >= 20;
      assert.ok(separatedX || separatedY, `${first[left].event.id} overlaps ${first[right].event.id}`);
    }
  }
});

test('marker layout keeps complete hit targets inside safe map bounds', () => {
  const resolve = integration.resolveMarkerLayout ?? (() => []);
  const events = [
    { ...course.events[0], primarySite: { ...course.events[0].primarySite, x: 0, y: 0 } },
    { ...course.events[1], primarySite: { ...course.events[1].primarySite, x: 100, y: 100 } },
  ];

  for (const marker of resolve(events)) {
    assert.ok(marker.x >= 8 && marker.x <= 92);
    assert.ok(marker.y >= 10 && marker.y <= 90);
  }
});

test('resolved marker targets remain independent on a 390px mobile viewport', () => {
  const resolve = integration.resolveMarkerLayout ?? (() => []);
  const markers = resolve(course.events);
  const mapSize = 334;

  for (let left = 0; left < markers.length; left += 1) {
    for (let right = left + 1; right < markers.length; right += 1) {
      const horizontalPixels = Math.abs(markers[left].x - markers[right].x) / 100 * mapSize;
      const verticalPixels = Math.abs(markers[left].y - markers[right].y) / 100 * mapSize;
      assert.ok(horizontalPixels >= 44 || verticalPixels >= 44);
    }
  }
});

test('course reconciliation repairs stale selections and filters removed progress IDs', () => {
  const reconcile = integration.reconcileProgress ?? (() => undefined);
  const reconciled = reconcile({
    version: 0,
    selectedUnitId: 'retired-unit',
    selectedEventId: 'retired-event',
    completedEventIds: ['arrival', 'retired-event'],
    masteryByEventId: { arrival: 'mastered', 'retired-event': 'needs-review' },
    statusMessage: 'Do not hydrate me.',
  }, course, initialState);

  assert.deepEqual(reconciled, {
    version: 1,
    selectedUnitId: 'u1',
    selectedEventId: 'indigenous-1491',
    completedEventIds: ['arrival'],
    masteryByEventId: { arrival: 'mastered' },
    activeThemeIds: [],
  });
});

test('course reconciliation keeps unavailable units but clears their event selection', () => {
  const reconcile = integration.reconcileProgress ?? (() => undefined);
  const reconciled = reconcile({
    version: 1,
    selectedUnitId: 'u2',
    selectedEventId: 'arrival',
    completedEventIds: [],
    masteryByEventId: {},
  }, course, initialState);

  assert.equal(reconciled?.selectedUnitId, 'u2');
  assert.equal(reconciled?.selectedEventId, null);
});

test('course reconciliation replaces a removed event in an available unit', () => {
  const reconcile = integration.reconcileProgress ?? (() => undefined);
  const reconciled = reconcile({
    selectedUnitId: 'u1',
    selectedEventId: 'removed-event',
  }, course, initialState);

  assert.equal(reconciled?.selectedEventId, 'indigenous-1491');
});

test('post-submit focus favors next event, then unit continuation', () => {
  const choose = integration.choosePostSubmitAction ?? (() => undefined);

  assert.equal(choose(['select-unit', 'next-event']), 'next-event');
  assert.equal(choose(['submit-comprehension', 'select-unit']), 'select-unit');
  assert.equal(choose(['submit-comprehension']), null);
});

test('marker focus scroll options keep compact selections visible and respect reduced motion', () => {
  const options = integration.markerFocusScrollOptions ?? (() => undefined);

  assert.deepEqual(options(false), {
    block: 'nearest',
    inline: 'nearest',
    behavior: 'smooth',
  });
  assert.deepEqual(options(true), {
    block: 'nearest',
    inline: 'nearest',
    behavior: 'auto',
  });
});

test('comprehension outcome rejects empty text and completes every non-empty attempt', () => {
  const evaluate = integration.evaluateComprehensionResponse ?? (() => undefined);

  assert.deepEqual(evaluate('   '), { response: '', complete: false });
  assert.deepEqual(evaluate('  An open response.  '), {
    response: 'An open response.',
    complete: true,
  });
});

test('initial announcement reflects the reconciled unit and event', () => {
  const describe = integration.describeInitialSelection ?? (() => undefined);

  assert.match(describe({ ...initialState, selectedEventId: 'arrival' }, course) ?? '', /U1/);
  assert.match(describe({ ...initialState, selectedEventId: 'arrival' }, course) ?? '', /European arrival/);
  assert.match(describe({ ...initialState, selectedUnitId: 'u2', selectedEventId: null }, course) ?? '', /U2/);
});

test('learning anchor restores the first event only when selection is missing or invalid', () => {
  const anchor = integration.resolveLearningAnchor ?? (() => undefined);

  assert.equal(anchor({ ...initialState, selectedEventId: null }, course), 'indigenous-1491');
  assert.equal(anchor({ ...initialState, selectedEventId: 'removed' }, course), 'indigenous-1491');
  assert.equal(anchor({ ...initialState, selectedEventId: 'arrival' }, course), 'arrival');
  assert.equal(anchor({ ...initialState, selectedUnitId: 'u2', selectedEventId: null }, course), null);
});

test('missing event resolution preserves selection and returns an actionable message', () => {
  const resolve = integration.resolveEventSelection ?? (() => undefined);
  const result = resolve(course.events, 'removed-event', 'arrival');

  assert.deepEqual(result, {
    event: null,
    eventId: 'arrival',
    message: 'That event is no longer available. Your previous selection was kept.',
  });
});

test('weak filter selection retains its anchor when the filtered set is empty', () => {
  const resolve = integration.resolveWeakFilterSelection ?? (() => undefined);

  assert.equal(resolve('arrival', []), 'arrival');
  assert.equal(resolve('arrival', [{ id: 'exchange' }]), 'exchange');
  assert.equal(resolve('arrival', [{ id: 'arrival' }]), 'arrival');
});

test('review filter transition synchronizes arrival to the first GEO event', () => {
  const transition = integration.resolveReviewFilterSelection ?? (() => undefined);
  const events = course.events;

  assert.equal(transition({
    ...initialState,
    mode: 'review',
    selectedEventId: 'arrival',
    activeThemeIds: ['GEO'],
  }, events), 'indigenous-1491');
});

test('review filter transition composes themes and weak mastery while retaining empty anchors', () => {
  const transition = integration.resolveReviewFilterSelection ?? (() => undefined);
  const combined = {
    ...initialState,
    mode: 'review',
    selectedEventId: 'arrival',
    weakOnly: true,
    activeThemeIds: ['GEO'],
    masteryByEventId: { exchange: 'needs-review' },
  };

  assert.equal(transition(combined, course.events), 'exchange');
  assert.equal(transition({ ...combined, masteryByEventId: {} }, course.events), 'arrival');
});

test('selected primary and related markers remain separated at mobile and desktop geometries', () => {
  const layout = integration.resolveRelatedMarkerLayout ?? (() => []);
  const primaryLayout = integration.resolveMarkerLayout?.(course.events) ?? [];
  const primary = primaryLayout
    .find((marker) => marker.event.id === 'arrival');
  const event = course.events.find((candidate) => candidate.id === 'arrival');

  for (const geometry of [{ width: 334, height: 334 }, { width: 800, height: 500 }]) {
    const markers = layout(primaryLayout, primary, event.relatedSites, geometry);
    assert.equal(markers.length, event.relatedSites.length + 1);
    for (let left = 0; left < markers.length; left += 1) {
      for (let right = left + 1; right < markers.length; right += 1) {
        const dx = (markers[left].x - markers[right].x) / 100 * geometry.width;
        const dy = (markers[left].y - markers[right].y) / 100 * geometry.height;
        const distance = Math.hypot(dx, dy);
        const minimum = (markers[left].size + markers[right].size) / 2 + 4;
        assert.ok(distance >= minimum, `${markers[left].id} obscures ${markers[right].id}`);
      }
    }
    const related = markers.find((marker) => marker.id === 'related-1');
    const interaction = primaryLayout.find((marker) => marker.event.id === 'interaction');
    const dx = (related.x - interaction.x) / 100 * geometry.width;
    const dy = (related.y - interaction.y) / 100 * geometry.height;
    assert.ok(Math.hypot(dx, dy) >= 35, 'arrival related-1 obscures interaction primary');
  }
});

test('successful navigation clears stale workspace notices', () => {
  const transition = integration.transitionWorkspaceNotice ?? (() => undefined);
  assert.equal(transition('That event is no longer available.', true), '');
  assert.equal(transition('That event is no longer available.', false), 'That event is no longer available.');
});

test('map focus choice prefers a geographic marker and falls back to its key', () => {
  const choose = integration.chooseMapFocusTarget ?? (() => undefined);

  assert.equal(choose([{ kind: 'key' }, { kind: 'marker' }])?.kind, 'marker');
  assert.equal(choose([{ kind: 'key' }])?.kind, 'key');
});
