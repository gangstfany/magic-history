import assert from 'node:assert/strict';
import test from 'node:test';

await import('../data/apwh-u1-location-study.js');

const api = globalThis.APWH_U1_LOCATION_STUDY;
const trialPins = ['1', '2', '3', '9', '73'];

test('publishes the Unit 1 location-study API', () => {
  assert.ok(api);
  assert.equal(typeof api.getByLocation, 'function');
  assert.deepEqual([...api.locationNumbers], trialPins);
});

test('returns a defensive chronological array', () => {
  const first = api.getByLocation('1');
  const second = api.getByLocation('1');
  assert.notEqual(first, second);
  assert.deepEqual(first.map(item => item.id), second.map(item => item.id));
  assert.deepEqual(first.map(item => item.startYear),
    [...first].sort((a, b) => a.startYear - b.startYear || a.id.localeCompare(b.id)).map(item => item.startYear));
});
