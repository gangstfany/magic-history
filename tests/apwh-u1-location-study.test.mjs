import assert from 'node:assert/strict';
import test from 'node:test';

await import('../data/apwh-u1-location-study.js');

const api = globalThis.APWH_U1_LOCATION_STUDY;
const trialPins = ['1', '3', '6', '7', '73'];
const validMainEvents = new Set([
  'world-event-1-0',
  'world-event-3-0',
  'world-event-6-0',
  'world-event-6-4',
  'world-event-7-0',
  'world-event-73-0',
  'world-event-73-2',
  'world-event-73-3',
]);
const expectedIds = [
  'apwh-u1-hangzhou-song-commercial-revolution',
  'apwh-u1-hangzhou-grand-canal-urban-market',
  'apwh-u1-hangzhou-paper-money-maritime-tools',
  'apwh-u1-angkor-khmer-hydraulic-state',
  'apwh-u1-angkor-hindu-buddhist-legitimation',
  'apwh-u1-delhi-sultanate-state-building',
  'apwh-u1-delhi-bhakti-sufi-devotion',
  'apwh-u1-baghdad-abbasid-knowledge-hub',
  'apwh-u1-baghdad-merchant-ulema-network',
  'apwh-u1-timbuktu-mali-gold-salt-tax',
  'apwh-u1-timbuktu-mansa-musa-pilgrimage',
  'apwh-u1-timbuktu-islamic-learning-griots',
];

test('publishes the Unit 1 location-study API', () => {
  assert.ok(api);
  assert.equal(typeof api.getByLocation, 'function');
  assert.deepEqual([...api.locationNumbers], trialPins);
});

test('returns a defensive chronological array', () => {
  for (const number of trialPins) {
    const first = api.getByLocation(number);
    const second = api.getByLocation(number);
    assert.notEqual(first, second);
    assert.deepEqual(first.map(item => item.id), second.map(item => item.id));
    assert.deepEqual(first.map(item => item.id), [...first]
      .sort((a, b) => a.startYear - b.startYear
        || a.endYear - b.endYear
        || a.id.localeCompare(b.id))
      .map(item => item.id));
  }
});

test('ships the exact twelve complete English study points', () => {
  assert.deepEqual(new Set(api.records.map(record => record.id)), new Set(expectedIds));
  assert.doesNotMatch(JSON.stringify(api.records), /[\u3400-\u9fff]/);

  for (const number of trialPins) {
    const records = api.getByLocation(number);
    assert.ok(records.length >= 2 && records.length <= 3, `${number} count`);
    for (const record of records) {
      assert.equal(record.locationNumber, number);
      assert.match(record.title, /[A-Za-z]/);
      assert.match(record.summary, /[A-Za-z]/);
      assert.ok(record.significance.length >= 60, `${record.id} significance`);
      assert.ok(record.examConnection.length >= 60, `${record.id} exam connection`);
      assert.ok(record.keyPeople.length >= 1, `${record.id} people`);
      assert.ok(record.keyTerms.length >= 2, `${record.id} terms`);
      assert.ok(record.evidence.length >= 2, `${record.id} evidence`);
      assert.ok(validMainEvents.has(record.mainEventKey), `${record.id} main event`);
      assert.equal(record.source.id, 'amsco-apwh-u1');
      assert.match(record.source.locator, /AMSCO.*Topic.*p\./i);
    }
  }
});

test('uses globally unique stable study identifiers', () => {
  const ids = api.records.map(record => record.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every(id => /^apwh-u1-(hangzhou|angkor|delhi|baghdad|timbuktu)-/.test(id)));
});

test('publishes deeply immutable records and a locked global', () => {
  assert.ok(Object.isFrozen(api));
  assert.ok(Object.isFrozen(api.locationNumbers));
  assert.ok(Object.isFrozen(api.records));
  for (const record of api.records) {
    assert.ok(Object.isFrozen(record));
    assert.ok(Object.isFrozen(record.keyPeople));
    assert.ok(record.keyPeople.every(Object.isFrozen));
    assert.ok(Object.isFrozen(record.keyTerms));
    assert.ok(record.keyTerms.every(Object.isFrozen));
    assert.ok(Object.isFrozen(record.evidence));
    assert.ok(Object.isFrozen(record.source));
  }

  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'APWH_U1_LOCATION_STUDY');
  assert.equal(descriptor.writable, false);
  assert.equal(descriptor.configurable, false);
});
