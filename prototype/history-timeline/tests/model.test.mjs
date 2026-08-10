import test from 'node:test';
import assert from 'node:assert/strict';
import { course } from '../data/apush-u1.mjs';
import {
  filterWeakEvents,
  getNextEventId,
  getUnitEvents,
  validateCourse,
} from '../model.mjs';

test('course exposes U1 through U9 and only U1 has prototype events', () => {
  assert.deepEqual(course.units.map((unit) => unit.id), [
    'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9',
  ]);
  assert.equal(getUnitEvents(course, 'u1').length, 7);
  for (const unit of course.units.filter((unit) => unit.id !== 'u1')) {
    assert.equal(getUnitEvents(course, unit.id).length, 0);
    assert.equal(unit.available, false);
  }
  assert.equal(course.units.find((unit) => unit.id === 'u1').available, true);
});

test('course exposes reusable period bands and concrete related locations', () => {
  assert.equal(course.periodBands?.length, 9);
  assert.deepEqual(course.periodBands?.[0].unitIds, ['u1']);
  for (const event of course.events) {
    assert.ok(Array.isArray(event.relatedSites));
    assert.ok(event.relatedSites.length > 0);
    for (const site of event.relatedSites) {
      assert.equal(typeof site.label, 'string');
      assert.equal(typeof site.labelZh, 'string');
      assert.equal(Number.isFinite(site.x), Number.isFinite(site.y));
    }
  }
});

test('course data is internally valid', () => {
  assert.deepEqual(validateCourse(course), []);
});

test('every U1 event has bilingual title and primary-site labels', () => {
  for (const event of getUnitEvents(course, 'u1')) {
    assert.equal(typeof event.titleZh, 'string');
    assert.ok(event.titleZh.length > 0);
    assert.equal(typeof event.primarySite.labelZh, 'string');
    assert.ok(event.primarySite.labelZh.length > 0);
  }
});

test('validation reports missing bilingual labels', () => {
  const malformedCourse = {
    ...course,
    events: [{ ...course.events[0], titleZh: '', primarySite: { ...course.events[0].primarySite, labelZh: '' } }],
  };
  const errors = validateCourse(malformedCourse);
  assert.ok(errors.includes('Missing Chinese title for indigenous-1491'));
  assert.ok(errors.includes('Missing Chinese primary site label for indigenous-1491'));
});

test('next event follows the unit learning order', () => {
  assert.equal(getNextEventId(course, 'u1', 'arrival'), 'exchange');
  assert.equal(getNextEventId(course, 'u1', 'borderlands'), null);
});

test('next event follows order when source events are shuffled', () => {
  const shuffledCourse = { ...course, events: [...course.events].reverse() };

  assert.equal(getNextEventId(shuffledCourse, 'u1', 'arrival'), 'exchange');
});

test('validation detects an event that references an unknown unit', () => {
  const malformedCourse = {
    ...course,
    events: [...course.events, { ...course.events[0], id: 'unknown-unit', unitId: 'u10' }],
  };

  assert.ok(validateCourse(malformedCourse).includes('Unknown unit for unknown-unit'));
});

test('validation detects duplicate event IDs', () => {
  const malformedCourse = {
    ...course,
    events: [...course.events, { ...course.events[0] }],
  };

  assert.ok(validateCourse(malformedCourse).includes('Duplicate event id indigenous-1491'));
});

test('validation rejects event IDs that are not non-empty strings', () => {
  const numericId = { ...course, events: [{ ...course.events[0], id: 42 }] };
  const blankId = { ...course, events: [{ ...course.events[0], id: '   ' }] };

  assert.ok(validateCourse(numericId).includes('Missing event id'));
  assert.ok(validateCourse(blankId).includes('Missing event id'));
});

test('validation detects duplicate event order within a unit', () => {
  const malformedCourse = {
    ...course,
    events: [...course.events, { ...course.events[0], id: 'duplicate-order', order: 1 }],
  };

  assert.ok(validateCourse(malformedCourse).includes('Duplicate order 1 for u1'));
});

test('validation detects missing narrative and primary-site fields', () => {
  const malformedCourse = {
    ...course,
    events: [{ ...course.events[0], what: '', primarySite: { x: 31, y: 41, label: '' } }],
  };
  const errors = validateCourse(malformedCourse);

  assert.ok(errors.includes('Missing what for indigenous-1491'));
  assert.ok(errors.includes('Missing primary site for indigenous-1491'));
});

test('validation returns errors when unit or event collections are not arrays', () => {
  assert.deepEqual(validateCourse({ units: null, events: null }), [
    'Course units must be an array',
    'Course events must be an array',
  ]);
});

test('validation permits non-geographic events and rejects partial coordinates', () => {
  const nonGeographic = {
    ...course,
    events: [{ ...course.events[0], primarySite: null }],
  };
  const partial = {
    ...course,
    events: [{
      ...course.events[0],
      primarySite: { label: 'Atlantic', labelZh: '大西洋', x: 50 },
    }],
  };

  assert.deepEqual(validateCourse(nonGeographic), []);
  assert.ok(validateCourse(partial).includes('Invalid primary site coordinates for indigenous-1491'));
});

test('weak-event filtering returns only events marked for review', () => {
  const events = [
    { id: 'arrival' },
    { id: 'exchange' },
    { id: 'conquest' },
  ];

  assert.deepEqual(
    filterWeakEvents(events, { arrival: 'mastered', exchange: 'needs-review' }),
    [{ id: 'exchange' }],
  );
});
