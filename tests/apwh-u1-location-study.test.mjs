import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

await import('../data/apwh-u1-location-study.js');

const api = globalThis.APWH_U1_LOCATION_STUDY;
const dataModuleSource = readFileSync(
  new URL('../data/apwh-u1-location-study.js', import.meta.url),
  'utf8',
);
const replaceDataSource = (label, search, replacement) => {
  const malformedSource = dataModuleSource.replace(search, replacement);
  assert.notEqual(malformedSource, dataModuleSource, `${label} fixture mutation`);
  return malformedSource;
};
const assertDataModuleError = (label, malformedSource, expectedMessage) => {
  assert.throws(
    () => runInNewContext(malformedSource, {}),
    error => {
      assert.equal(error.message, expectedMessage, `${label} diagnostic`);
      return true;
    },
  );
};
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
  'evidence', 'examConnection', 'examSkills', 'id', 'keyPeople', 'keyTerms', 'locationNumber', 'mainEventKey',
  'relatedStudyPointIds', 'significance', 'source', 'startYear', 'summary', 'themeIds', 'title',
  'topicCodes',
];
const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0;
const validExamSkills = new Set(['Causation', 'Comparison', 'CCOT', 'Contextualization']);

const expectedExamSkills = new Map([
  ['apwh-u1-hangzhou-song-commercial-revolution', ['Causation', 'CCOT']],
  ['apwh-u1-hangzhou-grand-canal-urban-market', ['Causation']],
  ['apwh-u1-hangzhou-paper-money-maritime-tools', ['Causation', 'Comparison']],
  ['apwh-u1-angkor-khmer-hydraulic-state', ['Causation', 'Comparison']],
  ['apwh-u1-angkor-hindu-buddhist-legitimation', ['Causation', 'Comparison']],
  ['apwh-u1-delhi-sultanate-state-building', ['Comparison', 'Causation']],
  ['apwh-u1-delhi-bhakti-sufi-devotion', ['Comparison', 'CCOT']],
  ['apwh-u1-baghdad-abbasid-knowledge-hub', ['Causation', 'CCOT']],
  ['apwh-u1-baghdad-merchant-ulema-network', ['Causation', 'Comparison']],
  ['apwh-u1-timbuktu-mali-gold-salt-tax', ['Causation']],
  ['apwh-u1-timbuktu-islamic-learning-griots', ['Comparison', 'CCOT']],
  ['apwh-u1-timbuktu-mansa-musa-pilgrimage', ['Causation', 'Contextualization']],
]);

const expectedUnitCards = {
  context: {
    id: 'apwh-u1-context-global-tapestry',
    kind: 'context',
    title: 'The World in c. 1200',
    summary: 'By c. 1200, regional states across Afro-Eurasia used belief systems, taxation, trade, and specialized administration to organize diverse populations.',
    examSkills: ['Contextualization', 'Comparison'],
    prompt: 'As you study Unit 1, compare the material foundations of state power with the cultural ideas rulers used to legitimize authority.',
    takeaways: [
      'Song China connected centralized administration to commercial growth and infrastructure.',
      'States in Dar al-Islam, South Asia, and Southeast Asia adapted shared religious traditions to local political needs.',
      'West African rulers converted control of trade into revenue, military capacity, and prestige.',
    ],
  },
  synthesis: {
    id: 'apwh-u1-synthesis-state-power',
    kind: 'synthesis',
    title: 'How States Built and Justified Power',
    summary: 'Across Unit 1, rulers built power by organizing resources and people, then justified that power through religion, learning, and public display.',
    examSkills: ['Comparison', 'CCOT'],
    prompt: 'Build a defensible comparison using at least two regions: which mechanisms of state building were shared, and which depended on local conditions?',
    takeaways: [
      'Material systems such as taxes, canals, trade routes, and labor produced usable state capacity.',
      'Belief systems and cultural patronage translated capacity into legitimacy among diverse populations.',
      'Political continuity often depended on adapting institutions rather than preserving them unchanged.',
    ],
  },
};

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
  assert.equal(typeof api.getUnitCard, 'function');
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
      assert.ok(record.examSkills.length >= 1 && record.examSkills.length <= 2,
        `${record.id} exam skill count`);
      assert.ok(record.examSkills.every(skill => validExamSkills.has(skill)),
        `${record.id} exam skill vocabulary`);
      assert.equal(new Set(record.examSkills).size, record.examSkills.length,
        `${record.id} duplicate exam skill`);
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

test('assigns the exact historical-thinking skills to each study point', () => {
  assert.equal(expectedExamSkills.size, api.records.length);
  for (const record of api.records) {
    assert.deepEqual(record.examSkills, expectedExamSkills.get(record.id), `${record.id} exam skills`);
  }
});

test('publishes exact, map-independent Unit 1 bookend cards', () => {
  assert.deepEqual(api.unitCards, expectedUnitCards);
  assert.equal(api.getUnitCard('context'), api.unitCards.context);
  assert.equal(api.getUnitCard('synthesis'), api.unitCards.synthesis);
  assert.equal(api.getUnitCard('missing-card'), null);
  assert.equal(api.getUnitCard(null), null);
  assert.equal(api.records.length, 12);
  for (const card of Object.values(api.unitCards)) {
    assert.ok(!api.records.includes(card), `${card.kind} not a study record`);
    assert.ok(!trialPins.some(number => api.getByLocation(number).includes(card)),
      `${card.kind} not map bound`);
  }
});

test('deeply freezes historical-thinking skills and Unit 1 bookend cards', () => {
  for (const record of api.records) {
    assert.ok(Object.isFrozen(record.examSkills), `${record.id} exam skills frozen`);
  }
  assert.ok(Object.isFrozen(api.unitCards));
  for (const card of Object.values(api.unitCards)) {
    assert.ok(Object.isFrozen(card), `${card.kind} frozen`);
    assert.ok(Object.isFrozen(card.examSkills), `${card.kind} skills frozen`);
    assert.ok(Object.isFrozen(card.takeaways), `${card.kind} takeaways frozen`);
  }
  assert.throws(() => api.unitCards.context.takeaways.push('Injected.'), TypeError);
  assert.throws(() => api.unitCards.context.examSkills.push('Causation'), TypeError);
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

test('rejects missing causal and related endpoints with descriptive connection errors', () => {
  const cases = [
    {
      relation: 'causal',
      endpoint: 'cause',
      missingId: 'apwh-u1-missing-cause',
      pattern: /(addCausalConnection\(\n\s+)'[^']+'/,
    },
    {
      relation: 'causal',
      endpoint: 'effect',
      missingId: 'apwh-u1-missing-effect',
      pattern: /(addCausalConnection\(\n\s+'[^']+',\n\s+)'[^']+'/,
    },
    {
      relation: 'related',
      endpoint: 'left',
      missingId: 'apwh-u1-missing-left',
      pattern: /(addRelatedConnection\(\n\s+)'[^']+'/,
    },
    {
      relation: 'related',
      endpoint: 'right',
      missingId: 'apwh-u1-missing-right',
      pattern: /(addRelatedConnection\(\n\s+'[^']+',\n\s+)'[^']+'/,
    },
  ];

  for (const { relation, endpoint, missingId, pattern } of cases) {
    const malformedSource = dataModuleSource.replace(pattern, `$1'${missingId}'`);
    assert.notEqual(malformedSource, dataModuleSource, `${relation} ${endpoint} fixture mutation`);
    assert.throws(
      () => runInNewContext(malformedSource, {}),
      new RegExp(`Invalid Unit 1 study connection ${relation}: missing ${endpoint} ${missingId}`),
    );
  }
});

test('names the offending record when rejecting a duplicate study id', () => {
  const duplicateId = 'apwh-u1-hangzhou-song-commercial-revolution';
  const malformedSource = dataModuleSource.replace(
    "freezeRecord({\n      id: 'apwh-u1-hangzhou-grand-canal-urban-market',",
    `freezeRecord({\n      id: '${duplicateId}',`,
  );
  assert.notEqual(malformedSource, dataModuleSource, 'duplicate fixture mutation');
  assert.throws(
    () => runInNewContext(malformedSource, {}),
    new RegExp(`Invalid Unit 1 study record ${duplicateId}: duplicate record ID`),
  );
});

const songId = 'apwh-u1-hangzhou-song-commercial-revolution';
const canalId = 'apwh-u1-hangzhou-grand-canal-urban-market';
const paperId = 'apwh-u1-hangzhou-paper-money-maritime-tools';
const songContext = `    '${songId}': [['1.1', '1.7'], ['ECN', 'GOV']],`;
const songRecordStart = `      id: '${songId}',\n      examSkills: ['Causation', 'CCOT'],\n      locationNumber: '1',`;
const validationFailureCases = [
  {
    label: 'missing topic array values',
    malformedSource: replaceDataSource(
      'missing topic array values', songContext,
      `    '${songId}': [[], ['ECN', 'GOV']],`,
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: missing topicCodes`,
  },
  {
    label: 'empty-string invalid topic',
    malformedSource: replaceDataSource(
      'empty-string invalid topic', songContext,
      `    '${songId}': [['', '1.7'], ['ECN', 'GOV']],`,
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: invalid topicCode ""`,
  },
  {
    label: 'invalid topic',
    malformedSource: replaceDataSource(
      'invalid topic', songContext,
      `    '${songId}': [['9.9', '1.7'], ['ECN', 'GOV']],`,
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: invalid topicCode 9.9`,
  },
  {
    label: 'duplicate topic',
    malformedSource: replaceDataSource(
      'duplicate topic', songContext,
      `    '${songId}': [['1.1', '1.1'], ['ECN', 'GOV']],`,
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: duplicate topicCode 1.1`,
  },
  {
    label: 'missing theme array values',
    malformedSource: replaceDataSource(
      'missing theme array values', songContext,
      `    '${songId}': [['1.1', '1.7'], []],`,
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: missing themeIds`,
  },
  {
    label: 'empty-string invalid theme',
    malformedSource: replaceDataSource(
      'empty-string invalid theme', songContext,
      `    '${songId}': [['1.1', '1.7'], ['', 'GOV']],`,
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: invalid themeId ""`,
  },
  {
    label: 'invalid theme',
    malformedSource: replaceDataSource(
      'invalid theme', songContext,
      `    '${songId}': [['1.1', '1.7'], ['BAD', 'GOV']],`,
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: invalid themeId BAD`,
  },
  {
    label: 'duplicate theme',
    malformedSource: replaceDataSource(
      'duplicate theme', songContext,
      `    '${songId}': [['1.1', '1.7'], ['ECN', 'ECN']],`,
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: duplicate themeId ECN`,
  },
  {
    label: 'configured causal self link',
    malformedSource: replaceDataSource(
      'configured causal self link',
      `addCausalConnection(\n    '${canalId}',\n    '${songId}',`,
      `addCausalConnection(\n    '${canalId}',\n    '${canalId}',`,
    ),
    expectedMessage: `Invalid Unit 1 study connection causal: self connection ${canalId}`,
  },
  {
    label: 'frozen self link',
    malformedSource: replaceDataSource(
      'frozen self link',
      '      effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds]),',
      '      effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds, record.id]),',
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: self connection in effectStudyPointIds`,
  },
  {
    label: 'duplicate within category',
    malformedSource: replaceDataSource(
      'duplicate within category',
      '    cause.effectStudyPointIds.push(effectId);',
      '    cause.effectStudyPointIds.push(effectId, effectId);',
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: duplicate connection in effectStudyPointIds to ${paperId}`,
  },
  {
    label: 'duplicate empty target within category',
    malformedSource: replaceDataSource(
      'duplicate empty target within category',
      '      effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds]),',
      "      effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds, '', '']),",
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: duplicate connection in effectStudyPointIds to ""`,
  },
  {
    label: 'cross-category target reuse',
    malformedSource: replaceDataSource(
      'cross-category target reuse',
      '    effect.causeStudyPointIds.push(causeId);',
      '    effect.causeStudyPointIds.push(causeId);\n'
        + '    cause.relatedStudyPointIds.push(effectId);\n'
        + '    effect.relatedStudyPointIds.push(causeId);',
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: cross-category connection ${canalId} in causeStudyPointIds and relatedStudyPointIds`,
  },
  {
    label: 'unresolved frozen link',
    malformedSource: replaceDataSource(
      'unresolved frozen link',
      '      effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds]),',
      "      effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds, 'apwh-u1-missing-frozen']),",
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: unresolved connection apwh-u1-missing-frozen`,
  },
  {
    label: 'nonreciprocity',
    malformedSource: replaceDataSource(
      'nonreciprocity',
      '    effect.causeStudyPointIds.push(causeId);',
      '    // Omit reverse cause for malformed test fixture.',
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: nonreciprocal effectStudyPointIds connection to ${paperId}`,
  },
  {
    label: 'missing note',
    malformedSource: replaceDataSource(
      'missing note',
      '    cause.connectionNotes[effectId] = note;\n    effect.connectionNotes[causeId] = note;',
      '    // Omit both notes for malformed test fixture.',
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: missing connection note for ${canalId}`,
  },
  {
    label: 'non-English note',
    malformedSource: replaceDataSource(
      'non-English note',
      'Canal transport integrated productive regions with Hangzhou, supporting the urban demand and market exchange associated with Song commercialization.',
      '12345.',
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: non-English connection note for ${canalId}`,
  },
  {
    label: 'reciprocal note disagreement',
    malformedSource: replaceDataSource(
      'reciprocal note disagreement',
      '    effect.connectionNotes[causeId] = note;',
      "    effect.connectionNotes[causeId] = `${note} Different.`;",
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: nonreciprocal connection note for ${canalId}`,
  },
  {
    label: 'extra note key',
    malformedSource: replaceDataSource(
      'extra note key',
      '      connectionNotes: Object.freeze({ ...connections.connectionNotes }),',
      "      connectionNotes: Object.freeze({ ...connections.connectionNotes, 'apwh-u1-extra-note': 'Extra note.' }),",
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: extra connection note key apwh-u1-extra-note`,
  },
  {
    label: 'empty extra note key',
    malformedSource: replaceDataSource(
      'empty extra note key',
      '      connectionNotes: Object.freeze({ ...connections.connectionNotes }),',
      "      connectionNotes: Object.freeze({ ...connections.connectionNotes, '': 'Extra note.' }),",
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: extra connection note key ""`,
  },
];

for (const { label, malformedSource, expectedMessage } of validationFailureCases) {
  test(`reports ${label} with the offending record and rule`, () => {
    assertDataModuleError(label, malformedSource, expectedMessage);
  });
}

const examSkillValidationFailureCases = [
  {
    label: 'missing exam skills',
    malformedSource: replaceDataSource(
      'missing exam skills', songRecordStart,
      `      id: '${songId}',\n      locationNumber: '1',`,
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: missing examSkills`,
  },
  {
    label: 'invalid exam skill',
    malformedSource: replaceDataSource(
      'invalid exam skill', songRecordStart,
      `      id: '${songId}',\n      examSkills: ['Argumentation'],\n      locationNumber: '1',`,
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: invalid examSkill Argumentation`,
  },
  {
    label: 'duplicate exam skill',
    malformedSource: replaceDataSource(
      'duplicate exam skill', songRecordStart,
      `      id: '${songId}',\n      examSkills: ['Causation', 'Causation'],\n      locationNumber: '1',`,
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: duplicate examSkill Causation`,
  },
  {
    label: 'too many exam skills',
    malformedSource: replaceDataSource(
      'too many exam skills', songRecordStart,
      `      id: '${songId}',\n      examSkills: ['Causation', 'Comparison', 'CCOT'],\n      locationNumber: '1',`,
    ),
    expectedMessage: `Invalid Unit 1 study record ${songId}: too many examSkills`,
  },
];

for (const { label, malformedSource, expectedMessage } of examSkillValidationFailureCases) {
  test(`reports ${label} with the offending study record`, () => {
    assertDataModuleError(label, malformedSource, expectedMessage);
  });
}

const unitCardValidationFailureCases = [
  {
    label: 'duplicate unit-card kind',
    search: "kind: 'synthesis',\n      title: 'How States Built and Justified Power',",
    replacement: "kind: 'context',\n      title: 'How States Built and Justified Power',",
    expectedMessage: 'Invalid Unit 1 unit card context apwh-u1-synthesis-state-power: duplicate kind context',
  },
  {
    label: 'duplicate unit-card ID',
    search: "id: 'apwh-u1-synthesis-state-power',\n      kind: 'synthesis',",
    replacement: "id: 'apwh-u1-context-global-tapestry',\n      kind: 'synthesis',",
    expectedMessage: 'Invalid Unit 1 unit card synthesis apwh-u1-context-global-tapestry: duplicate card ID',
  },
  {
    label: 'missing unit-card title',
    search: "title: 'The World in c. 1200',",
    replacement: "title: '',",
    expectedMessage: 'Invalid Unit 1 unit card context apwh-u1-context-global-tapestry: missing title',
  },
  {
    label: 'invalid unit-card exam skill',
    search: "examSkills: ['Contextualization', 'Comparison'],",
    replacement: "examSkills: ['Argumentation'],",
    expectedMessage: 'Invalid Unit 1 unit card context apwh-u1-context-global-tapestry: invalid examSkill Argumentation',
  },
  {
    label: 'empty unit-card takeaway',
    search: "'Song China connected centralized administration to commercial growth and infrastructure.',",
    replacement: "'',",
    expectedMessage: 'Invalid Unit 1 unit card context apwh-u1-context-global-tapestry: empty takeaway',
  },
];

for (const { label, search, replacement, expectedMessage } of unitCardValidationFailureCases) {
  test(`reports ${label} with its kind and ID`, () => {
    assertDataModuleError(label, replaceDataSource(label, search, replacement), expectedMessage);
  });
}

test('defensive and frozen relationship mutations cannot change canonical reads', () => {
  const originalLocationIds = api.getByLocation('1').map(record => record.id);
  const mutableRead = api.getByLocation('1');
  mutableRead.pop();
  mutableRead.reverse();
  assert.deepEqual(api.getByLocation('1').map(record => record.id), originalLocationIds);

  const canonical = api.getById(songId);
  const originalEffects = [...canonical.effectStudyPointIds];
  const originalNotes = { ...canonical.connectionNotes };
  assert.throws(() => canonical.effectStudyPointIds.push('apwh-u1-injected'), TypeError);
  assert.throws(() => { canonical.connectionNotes['apwh-u1-injected'] = 'Injected.'; }, TypeError);
  assert.deepEqual(api.getById(songId).effectStudyPointIds, originalEffects);
  assert.deepEqual(api.getById(songId).connectionNotes, originalNotes);
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
