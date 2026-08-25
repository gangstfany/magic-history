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
const recordKeys = [
  'causeStudyPointIds', 'connectionNotes', 'dateLabel', 'effectStudyPointIds', 'endYear',
  'evidence', 'examConnection', 'id', 'keyPeople', 'keyTerms', 'locationNumber', 'mainEventKey',
  'relatedStudyPointIds', 'significance', 'source', 'startYear', 'summary', 'themeIds', 'title',
  'topicCodes',
];
const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0;

const expectedMetadata = new Map([
  ['apwh-u1-hangzhou-song-commercial-revolution', [['1.1', '1.7'], ['ECN', 'GOV']]],
  ['apwh-u1-hangzhou-grand-canal-urban-market', [['1.1', '1.7'], ['ECN', 'GOV', 'TEC']]],
  ['apwh-u1-hangzhou-paper-money-maritime-tools', [['1.1', '1.7'], ['ECN', 'TEC']]],
  ['apwh-u1-angkor-khmer-hydraulic-state', [['1.3', '1.7'], ['GOV', 'ECN', 'TEC']]],
  ['apwh-u1-angkor-hindu-buddhist-legitimation', [['1.3', '1.7'], ['GOV', 'CDI']]],
  ['apwh-u1-delhi-sultanate-state-building', [['1.3', '1.7'], ['GOV', 'CDI']]],
  ['apwh-u1-delhi-bhakti-sufi-devotion', [['1.3', '1.7'], ['CDI', 'SIO']]],
  ['apwh-u1-baghdad-abbasid-knowledge-hub', [['1.2', '1.7'], ['CDI', 'TEC']]],
  ['apwh-u1-baghdad-merchant-ulema-network', [['1.2', '1.7'], ['ECN', 'CDI']]],
  ['apwh-u1-timbuktu-mali-gold-salt-tax', [['1.5', '1.7'], ['ECN', 'GOV']]],
  ['apwh-u1-timbuktu-islamic-learning-griots', [['1.5', '1.7'], ['CDI', 'SIO']]],
  ['apwh-u1-timbuktu-mansa-musa-pilgrimage', [['1.5', '1.7'], ['GOV', 'ECN', 'CDI']]],
]);

const expectedCausalEdges = new Map([
  ['apwh-u1-hangzhou-grand-canal-urban-market->apwh-u1-hangzhou-song-commercial-revolution',
    'Canal transport integrated productive regions with Hangzhou, supporting the urban demand and market exchange associated with Song commercialization.'],
  ['apwh-u1-hangzhou-song-commercial-revolution->apwh-u1-hangzhou-paper-money-maritime-tools',
    'Expanding markets increased demand for scalable currency and safer long-distance navigation.'],
  ['apwh-u1-angkor-khmer-hydraulic-state->apwh-u1-angkor-hindu-buddhist-legitimation',
    'Agricultural surplus and organized labor helped Khmer rulers finance monumental religious patronage.'],
  ['apwh-u1-timbuktu-mali-gold-salt-tax->apwh-u1-timbuktu-mansa-musa-pilgrimage',
    "Revenue from Mali's control of trade helped finance Mansa Musa's pilgrimage and public display of wealth."],
  ['apwh-u1-timbuktu-mansa-musa-pilgrimage->apwh-u1-timbuktu-islamic-learning-griots',
    "Mansa Musa's post-pilgrimage patronage strengthened mosques, schools, and scholarly connections in Mali."],
]);

const expectedRelatedPairs = new Map([
  ['apwh-u1-delhi-bhakti-sufi-devotion|apwh-u1-delhi-sultanate-state-building',
    'Both developments show how Islamic institutions interacted with a predominantly Hindu South Asian society without erasing religious distinctions.'],
  ['apwh-u1-baghdad-abbasid-knowledge-hub|apwh-u1-baghdad-merchant-ulema-network',
    "Scholarship, religious learning, and trusted urban networks reinforced Baghdad's wider role in the Islamic world."],
  ['apwh-u1-baghdad-merchant-ulema-network|apwh-u1-delhi-bhakti-sufi-devotion',
    'Mobile Muslim teachers and shared religious networks help compare the spread and local adaptation of Islam across regions.'],
  ['apwh-u1-baghdad-merchant-ulema-network|apwh-u1-timbuktu-islamic-learning-griots',
    'Commercial and scholarly networks carried Islamic institutions while local societies retained distinct cultural practices.'],
]);

test('publishes the Unit 1 location-study API', () => {
  assert.ok(api);
  assert.equal(typeof api.getByLocation, 'function');
  assert.equal(typeof api.getById, 'function');
  assert.equal(typeof api.compareRecords, 'function');
  assert.deepEqual([...api.locationNumbers], trialPins);
});

test('looks up canonical records by stable id', () => {
  for (const record of api.records) assert.equal(api.getById(record.id), record);
  assert.equal(api.getById('missing-study-point'), null);
  assert.equal(api.getById(null), null);
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
      assert.deepEqual(Object.keys(record).sort(), recordKeys);
      assert.equal(record.locationNumber, number);
      assert.ok(isNonEmptyString(record.dateLabel), `${record.id} date label`);
      assert.ok(Number.isInteger(record.startYear) && Number.isFinite(record.startYear));
      assert.ok(Number.isInteger(record.endYear) && Number.isFinite(record.endYear));
      assert.ok(record.endYear >= record.startYear, `${record.id} date order`);
      for (const field of ['title', 'summary', 'significance', 'examConnection']) {
        assert.ok(isNonEmptyString(record[field]), `${record.id} ${field}`);
      }
      assert.match(record.title, /[A-Za-z]/);
      assert.match(record.summary, /[A-Za-z]/);
      assert.ok(record.significance.length >= 60, `${record.id} significance`);
      assert.ok(record.examConnection.length >= 60, `${record.id} exam connection`);
      assert.ok(record.keyPeople.length >= 1, `${record.id} people`);
      assert.ok(record.keyPeople.every(person => isNonEmptyString(person.name)
        && isNonEmptyString(person.role)), `${record.id} person schema`);
      assert.ok(record.keyTerms.length >= 2, `${record.id} terms`);
      assert.ok(record.keyTerms.every(item => isNonEmptyString(item.term)
        && isNonEmptyString(item.explanation)), `${record.id} term schema`);
      assert.ok(record.evidence.length >= 2, `${record.id} evidence`);
      assert.ok(record.evidence.every(isNonEmptyString), `${record.id} evidence schema`);
      assert.ok(validMainEvents.has(record.mainEventKey), `${record.id} main event`);
      assert.ok(isNonEmptyString(record.source.id), `${record.id} source id`);
      assert.ok(isNonEmptyString(record.source.locator), `${record.id} source locator`);
      assert.equal(record.source.id, 'amsco-apwh-u1');
      assert.match(record.source.locator,
        /^AMSCO AP World History, Unit 1, Topics? 1\.[1-4](?: and 1\.[1-4])?(?:; Topic 2\.2 trade mechanism context)?$/);
      assert.doesNotMatch(record.source.locator, /varies by edition|TBD|placeholder/i);
    }
  }
});

test('keeps every nested trial-data string English-only', () => {
  const strings = [];
  const collectStrings = value => {
    if (typeof value === 'string') {
      strings.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(collectStrings);
      return;
    }
    if (value && typeof value === 'object') Object.values(value).forEach(collectStrings);
  };

  collectStrings(api.records);
  assert.ok(strings.length > api.records.length * 10,
    'the recursive check must traverse nested people, terms, evidence, and sources');
  for (const value of strings) assert.doesNotMatch(value, /[\u3400-\u9fff]/);
});

test('record comparator exercises end-year and id tie breakers', () => {
  const records = [
    { id: 'z', startYear: 1200, endYear: 1400 },
    { id: 'b', startYear: 1200, endYear: 1300 },
    { id: 'a', startYear: 1200, endYear: 1300 },
    { id: 'early', startYear: 1100, endYear: 1450 },
  ];
  assert.deepEqual([...records].sort(api.compareRecords).map(record => record.id),
    ['early', 'a', 'b', 'z']);
});

test('uses globally unique stable study identifiers', () => {
  const ids = api.records.map(record => record.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every(id => /^apwh-u1-(hangzhou|angkor|delhi|baghdad|timbuktu)-/.test(id)));
});

test('assigns the exact APWH topics and map themes', () => {
  const validTopics = new Set(['1.1', '1.2', '1.3', '1.5', '1.7']);
  const validThemes = new Set(['GOV', 'ECN', 'CDI', 'SIO', 'TEC']);

  assert.equal(expectedMetadata.size, api.records.length);
  for (const record of api.records) {
    assert.deepEqual([record.topicCodes, record.themeIds], expectedMetadata.get(record.id));
    assert.ok(record.topicCodes.every(code => validTopics.has(code)), `${record.id} topics`);
    assert.ok(record.themeIds.every(id => validThemes.has(id)), `${record.id} themes`);
  }
});

test('ships the exact reciprocal causal graph and mechanism notes', () => {
  const actualEdges = new Map();
  for (const source of api.records) {
    for (const targetId of source.effectStudyPointIds) {
      actualEdges.set(`${source.id}->${targetId}`, source.connectionNotes[targetId]);
    }
  }
  assert.deepEqual(actualEdges, expectedCausalEdges);

  for (const [edge, note] of expectedCausalEdges) {
    const [sourceId, targetId] = edge.split('->');
    const source = api.getById(sourceId);
    const target = api.getById(targetId);
    assert.ok(target.causeStudyPointIds.includes(sourceId), `${edge} reverse cause`);
    assert.equal(source.connectionNotes[targetId], note, `${edge} source note`);
    assert.equal(target.connectionNotes[sourceId], note, `${edge} target note`);
  }
});

test('ships the exact reciprocal related graph and comparison notes', () => {
  const actualPairs = new Map();
  for (const record of api.records) {
    for (const relatedId of record.relatedStudyPointIds) {
      const pair = [record.id, relatedId].sort().join('|');
      actualPairs.set(pair, record.connectionNotes[relatedId]);
    }
  }
  assert.deepEqual(actualPairs, expectedRelatedPairs);

  for (const [pair, note] of expectedRelatedPairs) {
    const [leftId, rightId] = pair.split('|');
    const left = api.getById(leftId);
    const right = api.getById(rightId);
    assert.ok(left.relatedStudyPointIds.includes(rightId), `${pair} left relation`);
    assert.ok(right.relatedStudyPointIds.includes(leftId), `${pair} right relation`);
    assert.equal(left.connectionNotes[rightId], note, `${pair} left note`);
    assert.equal(right.connectionNotes[leftId], note, `${pair} right note`);
  }
});

test('keeps every graph link resolved, unique, categorized once, and documented', () => {
  const ids = new Set(api.records.map(record => record.id));
  for (const record of api.records) {
    const categories = [
      record.causeStudyPointIds,
      record.effectStudyPointIds,
      record.relatedStudyPointIds,
    ];
    const links = categories.flat();
    assert.equal(new Set(links).size, links.length, `${record.id} duplicate or multi-category link`);
    assert.ok(links.every(id => id !== record.id), `${record.id} self link`);
    assert.ok(links.every(id => ids.has(id)), `${record.id} unresolved link`);
    assert.deepEqual(Object.keys(record.connectionNotes).sort(), [...links].sort(),
      `${record.id} note keys`);
    assert.ok(Object.values(record.connectionNotes).every(note => isNonEmptyString(note)
      && /[A-Za-z]/.test(note)), `${record.id} English notes`);

    for (const causeId of record.causeStudyPointIds) {
      assert.ok(api.getById(causeId).effectStudyPointIds.includes(record.id),
        `${record.id} cause reciprocity`);
    }
    for (const relatedId of record.relatedStudyPointIds) {
      assert.ok(api.getById(relatedId).relatedStudyPointIds.includes(record.id),
        `${record.id} related reciprocity`);
    }
  }
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
    assert.ok(Object.isFrozen(record.topicCodes));
    assert.ok(Object.isFrozen(record.themeIds));
    assert.ok(Object.isFrozen(record.causeStudyPointIds));
    assert.ok(Object.isFrozen(record.effectStudyPointIds));
    assert.ok(Object.isFrozen(record.relatedStudyPointIds));
    assert.ok(Object.isFrozen(record.connectionNotes));
  }

  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'APWH_U1_LOCATION_STUDY');
  assert.equal(descriptor.writable, false);
  assert.equal(descriptor.configurable, false);
});
