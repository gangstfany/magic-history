import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

await import('../data/apwh-u2-location-study.js');

const api = globalThis.APWH_U2_LOCATION_STUDY;
const dataModuleSource = readFileSync(new URL('../data/apwh-u2-location-study.js', import.meta.url), 'utf8');
const ledgerSource = readFileSync(new URL('../docs/data-sources/apwh-u2-location-study-source-ledger.md', import.meta.url), 'utf8');
const replaceDataSource = (label, search, replacement) => {
  const malformedSource = dataModuleSource.replace(search, replacement);
  assert.notEqual(malformedSource, dataModuleSource, `${label} fixture mutation`);
  return malformedSource;
};
const replaceDataSources = (label, replacements) => {
  let malformedSource = dataModuleSource;
  for (const [search, replacement] of replacements) {
    const nextSource = malformedSource.replace(search, replacement);
    assert.notEqual(nextSource, malformedSource, `${label} fixture mutation for ${search}`);
    malformedSource = nextSource;
  }
  return malformedSource;
};
const replaceAllDataSource = (label, search, replacement) => {
  const malformedSource = dataModuleSource.replaceAll(search, replacement);
  assert.notEqual(malformedSource, dataModuleSource, `${label} fixture mutation`);
  return malformedSource;
};
const assertDataModuleError = (label, malformedSource, expectedMessage) => {
  assert.throws(() => runInNewContext(malformedSource, {}), error => {
    assert.equal(error.message, expectedMessage, `${label} diagnostic`);
    return true;
  });
};

const expectedManifest = [
  ['apwh-u2-karakorum-mongol-unification-conquest', '8', 1, 'Mongol Unification and Conquest', '1206–1227', 1206, 1227, 'world-event-8-0', ['2.2', '2.7'], ['GOV'], ['Causation', 'CCOT']],
  ['apwh-u2-karakorum-pax-mongolica-protected-trade', '8', 2, 'Pax Mongolica and Protected Trade', 'c. 1250–c. 1350', 1250, 1350, 'world-event-8-0', ['2.1', '2.2', '2.7'], ['GOV', 'ECN'], ['Causation']],
  ['apwh-u2-karakorum-yam-relay-cross-cultural-transfer', '8', 3, 'The Yam Relay and Cross-Cultural Transfer', 'c. 1250–1368', 1250, 1368, 'world-event-8-0', ['2.2', '2.5'], ['TEC', 'CDI'], ['Causation', 'Comparison']],
  ['apwh-u2-samarkand-caravanserai-merchant-infrastructure', '9', 1, 'Caravanserai and Merchant Infrastructure', '1200–1450', 1200, 1450, 'world-event-9-0', ['2.1', '2.7'], ['ECN', 'TEC'], ['Causation']],
  ['apwh-u2-samarkand-bills-exchange-banking-houses', '9', 2, 'Bills of Exchange and Banking Houses', '1300–1450', 1300, 1450, 'world-event-9-0', ['2.1', '2.7'], ['ECN'], ['Causation', 'Comparison']],
  ['apwh-u2-samarkand-timurid-commercial-learning-hub', '9', 3, 'Timurid Samarkand as a Commercial and Learning Hub', '1370–1450', 1370, 1450, 'world-event-9-0', ['2.1', '2.5'], ['CDI', 'TEC'], ['CCOT', 'Comparison']],
  ['apwh-u2-malacca-monsoon-navigation-maritime-technology', '2', 1, 'Monsoon Navigation and Maritime Technology', '1200–1450', 1200, 1450, 'world-event-2-1', ['2.3', '2.7'], ['TEC', 'ECN'], ['Causation']],
  ['apwh-u2-malacca-strategic-port-state', '2', 2, 'Malacca as a Strategic Port State', 'c. 1400–1450', 1400, 1450, 'world-event-2-1', ['2.3', '2.7'], ['ECN', 'GOV'], ['Causation', 'Comparison']],
  ['apwh-u2-malacca-merchant-diasporas-spread-islam', '2', 3, 'Merchant Diasporas and the Spread of Islam', 'c. 1400–1450', 1400, 1450, 'world-event-2-1', ['2.3', '2.5'], ['CDI', 'SIO'], ['Causation', 'CCOT']],
  ['apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce', '85', 1, 'Swahili City-States and Indian Ocean Commerce', '1000–1450', 1000, 1450, 'world-event-85-0', ['2.3', '2.7'], ['ECN', 'GOV'], ['Causation', 'Comparison']],
  ['apwh-u2-kilwa-gold-ivory-regional-specialization', '85', 2, 'Gold, Ivory, and Regional Specialization', '1200–1450', 1200, 1450, 'world-event-85-0', ['2.3', '2.7'], ['ECN'], ['Causation']],
  ['apwh-u2-kilwa-swahili-cultural-synthesis', '85', 3, 'Swahili Cultural Synthesis', '1200–1450', 1200, 1450, 'world-event-85-0', ['2.3', '2.5'], ['CDI', 'SIO'], ['Comparison', 'CCOT']],
  ['apwh-u2-cairo-trans-saharan-gold-camel-caravans', '84', 1, 'Trans-Saharan Gold and Camel-Caravan Trade', '1200–1450', 1200, 1450, 'world-event-84-0', ['2.4', '2.7'], ['ECN', 'TEC'], ['Causation', 'Comparison']],
  ['apwh-u2-cairo-mansa-musa-gold-shock', '84', 2, "Mansa Musa's Gold Shock", '1324', 1324, 1324, 'world-event-84-0', ['2.4', '2.5'], ['GOV', 'ECN', 'CDI'], ['Causation', 'Contextualization']],
  ['apwh-u2-cairo-black-death-demographic-change', '84', 3, 'Black Death and Demographic Change', '1347–1351', 1347, 1351, 'world-event-84-0', ['2.6'], ['ENV', 'SIO'], ['Causation', 'CCOT']],
  ['apwh-u2-nanjing-treasure-fleet-technology-scale', '10', 1, 'Treasure-Fleet Technology and Scale', '1405–1433', 1405, 1433, 'world-event-10-3', ['2.3', '2.7'], ['TEC', 'GOV'], ['Causation']],
  ['apwh-u2-nanjing-zheng-he-tributary-voyages', '10', 2, "Zheng He's Tributary Voyages", '1405–1433', 1405, 1433, 'world-event-10-3', ['2.3', '2.5'], ['GOV', 'CDI'], ['Causation', 'Comparison']],
  ['apwh-u2-nanjing-ming-maritime-retrenchment', '10', 3, 'Ming Maritime Retrenchment', '1433–1450', 1433, 1450, 'world-event-10-3', ['2.3', '2.7'], ['GOV', 'ECN'], ['CCOT', 'Causation']],
];

const recordKeys = [
  'causeStudyPointIds', 'connectionNotes', 'dateLabel', 'effectStudyPointIds', 'endYear',
  'evidence', 'examConnection', 'examSkills', 'id', 'keyPeople', 'keyTerms', 'locationNumber',
  'mainEventKey', 'relatedStudyPointIds', 'sequence', 'significance', 'source', 'startYear',
  'summary', 'themeIds', 'title', 'topicCodes',
];

const expectedUnitCards = {
  context: {
    id: 'apwh-u2-context-networks-ready-to-expand', kind: 'context', role: 'Unit 2 Context Card',
    title: 'Networks Ready to Expand',
    summary: 'By c. 1200, expanding states, commercial cities, and accumulated transport technologies had created the demand and infrastructure for long-distance exchange.',
    examSkills: ['Contextualization', 'Causation'],
    prompt: 'As you study Unit 2, identify which conditions already existed by 1200 and which new political or commercial changes made exchange grow.',
    takeaways: [
      'Unit 1 states generated agricultural surpluses, commercial cities, and specialized goods sought beyond local markets.',
      'Caravan routes and monsoon seas already linked regions, but distance, insecurity, and payment remained expensive.',
      'Merchant communities and shared legal or religious practices made exchange with strangers more predictable.',
    ],
  },
  synthesis: {
    id: 'apwh-u2-synthesis-network-expansion-consequences', kind: 'synthesis', role: 'Unit 2 Synthesis Card',
    title: 'Why Networks Expanded—and What They Carried',
    summary: 'From 1200 to 1450, lower transport, payment, and protection costs expanded exchange, while the same networks moved beliefs, technologies, crops, and pathogens.',
    examSkills: ['Comparison', 'CCOT'],
    prompt: 'Compare at least two networks: which mechanisms produced growth in both, and which consequences depended on geography or political control?',
    takeaways: [
      'Mongol protection and commercial instruments reduced risk across land routes.',
      'Monsoon knowledge, larger ships, and port states increased the volume and predictability of maritime exchange.',
      'Greater connectivity produced cultural synthesis and economic growth, but also disease transmission and environmental strain.',
    ],
  },
};

const expectedCausalEdges = new Map([
  ['apwh-u2-karakorum-mongol-unification-conquest->apwh-u2-karakorum-pax-mongolica-protected-trade', 'Mongol conquest brought previously divided routes under related authorities that could protect merchants and punish raiders.'],
  ['apwh-u2-karakorum-pax-mongolica-protected-trade->apwh-u2-karakorum-yam-relay-cross-cultural-transfer', 'Protected routes and relay stations accelerated the movement of envoys, specialists, information, and technologies across Eurasia.'],
  ['apwh-u2-samarkand-caravanserai-merchant-infrastructure->apwh-u2-samarkand-timurid-commercial-learning-hub', 'Reliable lodging, storage, and market infrastructure helped Samarkand attract merchants and scholars from multiple regions.'],
  ['apwh-u2-samarkand-bills-exchange-banking-houses->apwh-u2-samarkand-timurid-commercial-learning-hub', 'Credit instruments reduced the need to carry coin and supported the commercial traffic that sustained a cosmopolitan center.'],
  ['apwh-u2-malacca-monsoon-navigation-maritime-technology->apwh-u2-malacca-strategic-port-state', 'Predictable monsoon sailing and improved ships concentrated recurring traffic at the Strait of Malacca.'],
  ['apwh-u2-malacca-strategic-port-state->apwh-u2-malacca-merchant-diasporas-spread-islam', 'A protected and heavily visited port encouraged foreign merchants to reside, marry, and establish religious communities.'],
  ['apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce->apwh-u2-kilwa-gold-ivory-regional-specialization', 'Demand from Indian Ocean merchants rewarded coastal access to inland gold, ivory, and other specialized exports.'],
  ['apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce->apwh-u2-kilwa-swahili-cultural-synthesis', 'Long-term commercial contact joined Bantu-speaking coastal societies with Islamic and Arabic cultural influences.'],
  ['apwh-u2-cairo-trans-saharan-gold-camel-caravans->apwh-u2-cairo-mansa-musa-gold-shock', "Trans-Saharan commerce made Mali's gold wealth visible in Cairo and supplied the resources displayed during Mansa Musa's pilgrimage."],
  ['apwh-u2-karakorum-pax-mongolica-protected-trade->apwh-u2-cairo-black-death-demographic-change', 'Denser and safer Eurasian movement also allowed plague-bearing hosts and vectors to travel farther through connected routes.'],
  ['apwh-u2-nanjing-treasure-fleet-technology-scale->apwh-u2-nanjing-zheng-he-tributary-voyages', 'Large ships, navigational knowledge, and state resources made seven long-distance expeditions possible.'],
  ['apwh-u2-nanjing-zheng-he-tributary-voyages->apwh-u2-nanjing-ming-maritime-retrenchment', 'The voyages demonstrated Ming reach but their cost and political purpose strengthened court arguments for ending them.'],
]);

const expectedRelatedPairs = new Map([
  ['apwh-u2-karakorum-yam-relay-cross-cultural-transfer|apwh-u2-samarkand-timurid-commercial-learning-hub', 'Both cases show that commercial routes also moved specialists and knowledge, although one was an imperial relay and the other an urban center.'],
  ['apwh-u2-malacca-monsoon-navigation-maritime-technology|apwh-u2-samarkand-bills-exchange-banking-houses', 'Maritime technology reduced transport uncertainty while financial instruments reduced payment risk; both lowered the cost of exchange.'],
  ['apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce|apwh-u2-malacca-strategic-port-state', 'Kilwa and Malacca both converted strategic access to maritime exchange into urban wealth and political power.'],
  ['apwh-u2-kilwa-swahili-cultural-synthesis|apwh-u2-malacca-merchant-diasporas-spread-islam', 'Resident Muslim merchants contributed to locally distinct forms of Islamic cultural change in Southeast Asia and the Swahili Coast.'],
  ['apwh-u2-cairo-mansa-musa-gold-shock|apwh-u2-nanjing-zheng-he-tributary-voyages', 'Mansa Musa and Zheng He used conspicuous long-distance movement to display state wealth and strengthen diplomatic or religious standing.'],
]);

test('publishes the exact Unit 2 location-study manifest', () => {
  assert.equal(api.unitId, 'u2');
  assert.equal(api.unitNumber, 2);
  assert.deepEqual([...api.locationNumbers], ['2', '8', '9', '10', '84', '85']);
  assert.equal(api.records.length, 18);
  for (const number of api.locationNumbers) assert.equal(api.getByLocation(number).length, 3, number);
  assert.deepEqual(api.records.map(record => [record.id, record.locationNumber, record.sequence,
    record.title, record.dateLabel, record.startYear, record.endYear, record.mainEventKey,
    [...record.topicCodes], [...record.themeIds], [...record.examSkills]]), expectedManifest);
  for (const record of api.records) assert.deepEqual(Object.keys(record).sort(), recordKeys);
});

test('publishes exact immutable Unit 2 cards outside map records', () => {
  assert.deepEqual(api.unitCards, expectedUnitCards);
  for (const kind of ['toString', 'constructor', '__proto__', 'missing']) assert.equal(api.getUnitCard(kind), null);
  for (const card of Object.values(api.unitCards)) {
    assert.ok(Object.isFrozen(card));
    assert.ok(Object.isFrozen(card.examSkills));
    assert.ok(Object.isFrozen(card.takeaways));
    assert.ok(!api.records.includes(card));
    assert.ok(!api.locationNumbers.some(number => api.getByLocation(number).includes(card)));
  }
});

test('ships rich English learner content and deeply immutable records', () => {
  for (const record of api.records) {
    assert.doesNotMatch(JSON.stringify(record), /[\u3400-\u9fff]/);
    assert.ok(record.significance.length >= 60);
    assert.ok(record.examConnection.length >= 60);
    assert.ok(record.keyPeople.length >= 1);
    assert.ok(record.keyTerms.length >= 2);
    assert.ok(record.evidence.length >= 2);
    assert.equal(new Set(record.examSkills).size, record.examSkills.length);
    assert.ok(record.examSkills.length >= 1 && record.examSkills.length <= 2);
    assert.ok(Object.isFrozen(record) && Object.isFrozen(record.keyPeople)
      && record.keyPeople.every(Object.isFrozen) && Object.isFrozen(record.keyTerms)
      && record.keyTerms.every(Object.isFrozen) && Object.isFrozen(record.evidence)
      && Object.isFrozen(record.source) && Object.isFrozen(record.topicCodes)
      && Object.isFrozen(record.themeIds) && Object.isFrozen(record.examSkills)
      && Object.isFrozen(record.causeStudyPointIds) && Object.isFrozen(record.effectStudyPointIds)
      && Object.isFrozen(record.relatedStudyPointIds) && Object.isFrozen(record.connectionNotes));
  }
});

test('publishes exact reciprocal causal and related graphs', () => {
  const causal = new Map();
  const related = new Map();
  for (const record of api.records) {
    for (const targetId of record.effectStudyPointIds) causal.set(`${record.id}->${targetId}`, record.connectionNotes[targetId]);
    for (const targetId of record.relatedStudyPointIds) related.set([record.id, targetId].sort().join('|'), record.connectionNotes[targetId]);
    assert.ok(record.causeStudyPointIds.length + record.effectStudyPointIds.length + record.relatedStudyPointIds.length >= 1);
  }
  assert.deepEqual(causal, expectedCausalEdges);
  assert.deepEqual(related, expectedRelatedPairs);
});

test('source ledger covers every Unit 2 study ID exactly once', () => {
  const ledgerIds = [...ledgerSource.matchAll(/^\| `(apwh-u2-[^`]+)` \|/gm)].map(match => match[1]);
  assert.deepEqual(new Set(ledgerIds), new Set(expectedManifest.map(([id]) => id)));
  assert.equal(ledgerIds.length, 18);
});

test('returns defensive location arrays, stable lookup identity, and a locked global', () => {
  for (const record of api.records) assert.equal(api.getById(record.id), record);
  const first = api.getByLocation('8');
  first.pop();
  assert.equal(api.getByLocation('8').length, 3);
  assert.equal(api.locationName('8'), 'Karakorum');
  assert.equal(api.locationName('toString'), null);
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'APWH_U2_LOCATION_STUDY');
  assert.equal(descriptor.writable, false);
  assert.equal(descriptor.configurable, false);
});

test('refuses to overwrite an existing Unit 2 browser global', () => {
  assert.throws(
    () => runInNewContext(dataModuleSource, { APWH_U2_LOCATION_STUDY: { existing: true } }),
    /Invalid Unit 2 global APWH_U2_LOCATION_STUDY: refusing to overwrite existing value/,
  );
});

test('comparator uses start, end, sequence, and id tie breakers', () => {
  const records = [
    { id: 'z', startYear: 1200, endYear: 1300, sequence: 2 },
    { id: 'a', startYear: 1200, endYear: 1300, sequence: 2 },
    { id: 'sequence', startYear: 1200, endYear: 1300, sequence: 1 },
    { id: 'end', startYear: 1200, endYear: 1201, sequence: 3 },
    { id: 'early', startYear: 1100, endYear: 1450, sequence: 3 },
  ];
  assert.deepEqual([...records].sort(api.compareRecords).map(record => record.id),
    ['early', 'end', 'sequence', 'a', 'z']);
});

const invalidFixtures = [
  ["locationNumber: '8'", "locationNumber: '999'", 'apwh-u2-karakorum-mongol-unification-conquest', 'invalid locationNumber 999'],
  ["'apwh-u2-karakorum-mongol-unification-conquest', '8', 1,", "'apwh-u2-karakorum-mongol-unification-conquest', '8', 4,", 'apwh-u2-karakorum-mongol-unification-conquest', 'invalid sequence 4'],
  ["['GOV'], ['Causation', 'CCOT']]", "['GOV'], ['Causation', 'Argumentation']]", 'apwh-u2-karakorum-mongol-unification-conquest', 'invalid examSkill Argumentation'],
  ["mainEventKey: 'world-event-8-0'", "mainEventKey: 'world-event-8-99'", 'apwh-u2-karakorum-mongol-unification-conquest', 'invalid mainEventKey world-event-8-99'],
];
for (const [search, replacement, id, rule] of invalidFixtures) {
  test(`rejects ${rule}`, () => assertDataModuleError(rule,
    replaceDataSource(rule, search, replacement), `Invalid Unit 2 study record ${id}: ${rule}`));
}

const mutationCases = [
  ['missing topic', "['2.2', '2.7'], ['GOV']", "[], ['GOV']", 'apwh-u2-karakorum-mongol-unification-conquest', 'missing topicCodes'],
  ['invalid topic', "['2.2', '2.7'], ['GOV']", "['9.9', '2.7'], ['GOV']", 'apwh-u2-karakorum-mongol-unification-conquest', 'invalid topicCode 9.9'],
  ['missing theme', "['2.2', '2.7'], ['GOV']", "['2.2', '2.7'], []", 'apwh-u2-karakorum-mongol-unification-conquest', 'missing themeIds'],
  ['invalid theme', "['2.2', '2.7'], ['GOV']", "['2.2', '2.7'], ['BAD']", 'apwh-u2-karakorum-mongol-unification-conquest', 'invalid themeId BAD'],
  ['Chinese summary', "summary: 'Temujin unified", "summary: '中文 Temujin unified", 'apwh-u2-karakorum-mongol-unification-conquest', 'non-English summary'],
  ['missing source ID', "source: { id: 'amsco-apwh-u2', locator:", "source: { id: '', locator:", 'apwh-u2-karakorum-mongol-unification-conquest', 'missing source id'],
  ['missing source locator', "locator: 'AMSCO AP World History, Unit 2, Topics 2.2 and 2.7'", "locator: ''", 'apwh-u2-karakorum-mongol-unification-conquest', 'missing source locator'],
  ['non-English nested learner content', "'A 1206 kurultai recognized Temujin", "'中文 A 1206 kurultai recognized Temujin", 'apwh-u2-karakorum-mongol-unification-conquest', 'non-English nested learner content'],
  ['numeric-only evidence', "'A 1206 kurultai recognized Temujin as Genghis Khan after he defeated rival Mongol groups.'", "'12345.'", 'apwh-u2-karakorum-mongol-unification-conquest', 'non-English nested learner content'],
  ['extra source field', "source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.2 and 2.7' }", "source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.2 and 2.7', edition: 'extra' }", 'apwh-u2-karakorum-mongol-unification-conquest', 'source must contain exactly id and locator fields'],
];
for (const [label, search, replacement, id, rule] of mutationCases) {
  test(`rejects ${label}`, () => assertDataModuleError(label,
    replaceDataSource(label, search, replacement), `Invalid Unit 2 study record ${id}: ${rule}`));
}

test('rejects a duplicate raw record ID', () => {
  const malformed = replaceDataSource(
    'duplicate raw record ID',
    "id: 'apwh-u2-karakorum-pax-mongolica-protected-trade', locationNumber: '8',",
    "id: 'apwh-u2-karakorum-mongol-unification-conquest', locationNumber: '8',",
  );
  assertDataModuleError('duplicate raw record ID', malformed,
    'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: duplicate record ID');
});

test('rejects a fourth record at one location', () => {
  const malformed = replaceDataSources('four at 8 and two at 10', [
    ["'apwh-u2-nanjing-treasure-fleet-technology-scale', '10', 1,", "'apwh-u2-nanjing-treasure-fleet-technology-scale', '8', 1,"],
    ["id: 'apwh-u2-nanjing-treasure-fleet-technology-scale', locationNumber: '10',", "id: 'apwh-u2-nanjing-treasure-fleet-technology-scale', locationNumber: '8',"],
  ]);
  assertDataModuleError('four at 8 and two at 10', malformed,
    'Invalid Unit 2 study record apwh-u2-nanjing-treasure-fleet-technology-scale: location 8 must contain exactly three records');
});

test('rejects malformed and non-Unit-2 stable study IDs independently of the manifest', () => {
  for (const [replacement, rule] of [
    ['apwh-u1-karakorum-mongol-unification-conquest', 'invalid stable ID apwh-u1-karakorum-mongol-unification-conquest'],
    ['apwh-u2-Karakorum bad id', 'invalid stable ID apwh-u2-Karakorum bad id'],
  ]) {
    const malformed = replaceAllDataSource(
      rule,
      'apwh-u2-karakorum-mongol-unification-conquest',
      replacement,
    );
    assertDataModuleError(rule, malformed,
      `Invalid Unit 2 study record ${replacement}: ${rule}`);
  }
});

test('rejects malformed date labels and invalid date ranges independently of the manifest', () => {
  const id = 'apwh-u2-karakorum-mongol-unification-conquest';
  const cases = [
    ['malformed date label', [["'1206–1227', 1206, 1227", "'1206/1227', 1206, 1227"], ["dateLabel: '1206–1227'", "dateLabel: '1206/1227'"]], 'invalid dateLabel 1206/1227'],
    ['non-integer start year', [["'1206–1227', 1206, 1227", "'1206–1227', '1206', 1227"], ['startYear: 1206', "startYear: '1206'"]], 'startYear must be an integer'],
    ['non-integer end year', [["'1206–1227', 1206, 1227", "'1206–1227', 1206, '1227'"], ['endYear: 1227', "endYear: '1227'"]], 'endYear must be an integer'],
    ['reversed date range', [["'1206–1227', 1206, 1227", "'1206–1227', 1228, 1227"], ['startYear: 1206', 'startYear: 1228']], 'startYear 1228 exceeds endYear 1227'],
  ];
  for (const [label, replacements, rule] of cases) {
    assertDataModuleError(label, replaceDataSources(label, replacements),
      `Invalid Unit 2 study record ${id}: ${rule}`);
  }
});

test('rejects empty and non-English location names', () => {
  for (const [replacement, rule] of [
    ["'8': ''", 'missing English location name'],
    ["'8': '12345'", 'missing English location name'],
  ]) {
    assertDataModuleError(rule, replaceDataSource(rule, "'8': 'Karakorum'", replacement),
      `Invalid Unit 2 study location 8: ${rule}`);
  }
});

test('rejects a duplicate sequence at one location', () => {
  const malformed = replaceDataSource(
    'duplicate sequence',
    "'apwh-u2-karakorum-pax-mongolica-protected-trade', '8', 2,",
    "'apwh-u2-karakorum-pax-mongolica-protected-trade', '8', 1,",
  );
  assertDataModuleError('duplicate sequence', malformed,
    'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: duplicate sequence 1 at location 8');
});

test('rejects missing causal and related endpoints immediately', () => {
  const cases = [
    ["    'apwh-u2-karakorum-mongol-unification-conquest',\n    'apwh-u2-karakorum-pax-mongolica-protected-trade',", "    'apwh-u2-missing-cause',\n    'apwh-u2-karakorum-pax-mongolica-protected-trade',", 'Invalid Unit 2 study connection causal: missing cause apwh-u2-missing-cause'],
    ["    'apwh-u2-karakorum-mongol-unification-conquest',\n    'apwh-u2-karakorum-pax-mongolica-protected-trade',", "    'apwh-u2-karakorum-mongol-unification-conquest',\n    'apwh-u2-missing-effect',", 'Invalid Unit 2 study connection causal: missing effect apwh-u2-missing-effect'],
    ["addRelatedConnection('apwh-u2-karakorum-yam-relay-cross-cultural-transfer', 'apwh-u2-samarkand-timurid-commercial-learning-hub'", "addRelatedConnection('apwh-u2-missing-left', 'apwh-u2-samarkand-timurid-commercial-learning-hub'", 'Invalid Unit 2 study connection related: missing left apwh-u2-missing-left'],
    ["addRelatedConnection('apwh-u2-karakorum-yam-relay-cross-cultural-transfer', 'apwh-u2-samarkand-timurid-commercial-learning-hub'", "addRelatedConnection('apwh-u2-karakorum-yam-relay-cross-cultural-transfer', 'apwh-u2-missing-right'", 'Invalid Unit 2 study connection related: missing right apwh-u2-missing-right'],
  ];
  for (const [search, replacement, message] of cases) {
    assertDataModuleError(message, replaceDataSource(message, search, replacement), message);
  }
});

const graphCases = [
  ['causal self', "'apwh-u2-karakorum-mongol-unification-conquest',\n    'apwh-u2-karakorum-pax-mongolica-protected-trade',", "'apwh-u2-karakorum-mongol-unification-conquest',\n    'apwh-u2-karakorum-mongol-unification-conquest',", 'Invalid Unit 2 study connection causal: self connection apwh-u2-karakorum-mongol-unification-conquest'],
  ['duplicate connection', 'cause.effectStudyPointIds.push(effectId);', 'cause.effectStudyPointIds.push(effectId, effectId);', 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: duplicate connection in effectStudyPointIds to apwh-u2-karakorum-pax-mongolica-protected-trade'],
  ['cross category', 'effect.causeStudyPointIds.push(causeId);', 'effect.causeStudyPointIds.push(causeId);\n    cause.relatedStudyPointIds.push(effectId);\n    effect.relatedStudyPointIds.push(causeId);', 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: cross-category connection apwh-u2-karakorum-pax-mongolica-protected-trade in effectStudyPointIds and relatedStudyPointIds'],
  ['nonreciprocal', 'effect.causeStudyPointIds.push(causeId);', '// omit reverse fixture', 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: nonreciprocal effectStudyPointIds connection to apwh-u2-karakorum-pax-mongolica-protected-trade'],
  ['missing note', 'cause.connectionNotes[effectId] = note;\n    effect.connectionNotes[causeId] = note;', '// omit notes fixture', 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: missing connection note for apwh-u2-karakorum-pax-mongolica-protected-trade'],
  ['non-English note', 'Mongol conquest brought previously divided routes under related authorities that could protect merchants and punish raiders.', '12345.', 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: non-English connection note for apwh-u2-karakorum-pax-mongolica-protected-trade'],
  ['mismatched note', 'effect.connectionNotes[causeId] = note;', 'effect.connectionNotes[causeId] = `${note} Different.`;', 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: nonreciprocal connection note for apwh-u2-karakorum-pax-mongolica-protected-trade'],
  ['extra note', 'connectionNotes: Object.freeze({ ...connections.connectionNotes }),', "connectionNotes: Object.freeze({ ...connections.connectionNotes, 'apwh-u2-extra': 'Extra note.' }),", 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: extra connection note key apwh-u2-extra'],
  ['unresolved link', 'effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds]),', "effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds, 'apwh-u2-missing-link']),", 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: unresolved connection apwh-u2-missing-link'],
];
for (const [label, search, replacement, message] of graphCases) {
  test(`rejects ${label}`, () => assertDataModuleError(label, replaceDataSource(label, search, replacement), message));
}

const cardCases = [
  ['missing role', "role: 'Unit 2 Context Card'", "role: ''", 'context', 'apwh-u2-context-networks-ready-to-expand', 'missing role'],
  ['two takeaways', "        'Merchant communities and shared legal or religious practices made exchange with strangers more predictable.',\n      ],", '      ],', 'context', 'apwh-u2-context-networks-ready-to-expand', 'takeaways must contain exactly three items'],
  ['duplicate kind', "kind: 'synthesis', role: 'Unit 2 Synthesis Card'", "kind: 'context', role: 'Unit 2 Synthesis Card'", 'context', 'apwh-u2-synthesis-network-expansion-consequences', 'duplicate kind context'],
  ['duplicate ID', "id: 'apwh-u2-synthesis-network-expansion-consequences', kind: 'synthesis'", "id: 'apwh-u2-context-networks-ready-to-expand', kind: 'synthesis'", 'synthesis', 'apwh-u2-context-networks-ready-to-expand', 'duplicate card ID'],
  ['non-array exam skills', "examSkills: ['Contextualization', 'Causation']", "examSkills: 'Causation'", 'context', 'apwh-u2-context-networks-ready-to-expand', 'examSkills must be an array'],
  ['empty exam skills', "examSkills: ['Contextualization', 'Causation']", 'examSkills: []', 'context', 'apwh-u2-context-networks-ready-to-expand', 'missing examSkills'],
  ['invalid exam skill item type', "examSkills: ['Contextualization', 'Causation']", "examSkills: [123, 'Causation']", 'context', 'apwh-u2-context-networks-ready-to-expand', 'invalid examSkill 123'],
  ['empty exam skill item', "examSkills: ['Contextualization', 'Causation']", "examSkills: ['', 'Causation']", 'context', 'apwh-u2-context-networks-ready-to-expand', 'invalid examSkill ""'],
  ['duplicate exam skills', "examSkills: ['Contextualization', 'Causation']", "examSkills: ['Causation', 'Causation']", 'context', 'apwh-u2-context-networks-ready-to-expand', 'duplicate examSkill Causation'],
  ['oversized exam skills', "examSkills: ['Contextualization', 'Causation']", "examSkills: ['Contextualization', 'Causation', 'Comparison']", 'context', 'apwh-u2-context-networks-ready-to-expand', 'too many examSkills'],
];
for (const [label, search, replacement, kind, id, rule] of cardCases) {
  test(`rejects card ${label}`, () => assertDataModuleError(label, replaceDataSource(label, search, replacement),
    `Invalid Unit 2 unit card ${kind} ${id}: ${rule}`));
}
