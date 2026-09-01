import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

await import('../data/apwh-u3-location-study.js');

const api = globalThis.APWH_U3_LOCATION_STUDY;
const dataModuleSource = readFileSync(new URL('../data/apwh-u3-location-study.js', import.meta.url), 'utf8');
const ledgerSource = readFileSync(new URL('../docs/data-sources/apwh-u3-location-study-source-ledger.md', import.meta.url), 'utf8');

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
const parseLedgerRows = source => source.split('\n')
  .filter(line => /^\| `apwh-u3-/.test(line))
  .map(line => line.split('|').slice(1, -1)
    .map(cell => cell.trim().replace(/^`|`$/g, '')));
const assertDataModuleError = (label, malformedSource, expectedMessage) => {
  assert.throws(() => runInNewContext(malformedSource, {}), error => {
    assert.equal(error.message, expectedMessage, `${label} diagnostic`);
    return true;
  });
};

const expectedManifest = [
  ['apwh-u3-ottoman-cannon-conquest-constantinople', '18', 'Ottoman', 'Expansion', 1, 'Cannon Conquest of Constantinople', '1453', 1453, 1453, 'world-event-18-3', ['3.1', '3.4'], ['TEC', 'GOV'], ['Causation', 'Contextualization']],
  ['apwh-u3-ottoman-devshirme-janissary-system', '18', 'Ottoman', 'Administration', 2, 'Devshirme and the Janissary System', 'c. 1450–1600', 1450, 1600, 'world-event-18-3', ['3.2', '3.4'], ['GOV', 'SIO'], ['Causation', 'Comparison']],
  ['apwh-u3-ottoman-sunni-millet-imperial-architecture', '18', 'Ottoman', 'Legitimation & Conflict', 3, 'Sunni Rule, the Millet System, and Imperial Architecture', '1453–1750', 1453, 1750, 'world-event-18-3', ['3.3', '3.4'], ['CDI', 'GOV'], ['Comparison', 'CCOT']],
  ['apwh-u3-safavid-ismail-qizilbash-conquest', '19', 'Safavid', 'Expansion', 1, 'Ismail I and Qizilbash Conquest', '1501–1514', 1501, 1514, 'world-event-19-0', ['3.1', '3.4'], ['GOV', 'TEC'], ['Causation', 'Contextualization']],
  ['apwh-u3-safavid-shah-abbas-ghulams-centralization', '19', 'Safavid', 'Administration', 2, 'Shah Abbas, Ghulams, and Centralization', '1588–1629', 1588, 1629, 'world-event-19-0', ['3.2', '3.4'], ['GOV', 'SIO'], ['Causation', 'Comparison']],
  ['apwh-u3-safavid-twelver-shiism-ottoman-rivalry', '19', 'Safavid', 'Legitimation & Conflict', 3, "Twelver Shi'ism and Ottoman Rivalry", '1501–1722', 1501, 1722, 'world-event-19-0', ['3.3', '3.4'], ['CDI', 'GOV'], ['Comparison', 'CCOT']],
  ['apwh-u3-mughal-babur-gunpowder-panipat', '6', 'Mughal', 'Expansion', 1, 'Babur, Gunpowder, and Panipat', '1526', 1526, 1526, 'world-event-6-1', ['3.1', '3.4'], ['TEC', 'GOV'], ['Causation', 'Contextualization']],
  ['apwh-u3-mughal-akbar-mansabdars-zamindars', '6', 'Mughal', 'Administration', 2, "Akbar's Mansabdars and Zamindars", '1556–1605', 1556, 1605, 'world-event-6-1', ['3.2', '3.4'], ['GOV', 'ECN'], ['Causation', 'Comparison']],
  ['apwh-u3-mughal-akbar-tolerance-aurangzeb-orthodoxy', '6', 'Mughal', 'Legitimation & Conflict', 3, "From Akbar's Tolerance to Aurangzeb's Orthodoxy", '1556–1707', 1556, 1707, 'world-event-6-1', ['3.3', '3.4'], ['CDI', 'GOV'], ['CCOT', 'Causation']],
  ['apwh-u3-russia-ivan-cossacks-siberian-expansion', '25', 'Russia', 'Expansion', 1, 'Ivan IV, Cossacks, and Siberian Expansion', '1547–1639', 1547, 1639, 'world-event-25-0', ['3.1', '3.4'], ['GOV', 'ENV'], ['Causation', 'Contextualization']],
  ['apwh-u3-russia-peter-table-ranks', '25', 'Russia', 'Administration', 2, 'Peter the Great and the Table of Ranks', '1682–1725', 1682, 1725, 'world-event-25-0', ['3.2', '3.4'], ['GOV', 'SIO'], ['CCOT', 'Causation']],
  ['apwh-u3-russia-orthodox-tsardom-boyars-new-capital', '25', 'Russia', 'Legitimation & Conflict', 3, 'Orthodox Tsardom, Boyar Control, and a New Capital', '1547–1725', 1547, 1725, 'world-event-25-0', ['3.3', '3.4'], ['CDI', 'GOV'], ['CCOT', 'Contextualization']],
  ['apwh-u3-ming-qing-restoration-expansion', '5', 'Ming/Qing', 'Expansion', 1, 'From Ming Restoration to Qing Expansion', '1368–1757', 1368, 1757, 'world-event-5-0', ['3.1', '3.4'], ['GOV', 'ENV'], ['CCOT', 'Causation']],
  ['apwh-u3-ming-qing-civil-service-continuity', '5', 'Ming/Qing', 'Administration', 2, 'Civil-Service Continuity under Ming and Qing', '1368–1750', 1368, 1750, 'world-event-5-0', ['3.2', '3.4'], ['GOV', 'SIO'], ['CCOT', 'Comparison']],
  ['apwh-u3-ming-qing-manchu-confucian-ethnic-hierarchy', '5', 'Ming/Qing', 'Legitimation & Conflict', 3, 'Manchu Rule, Confucian Legitimacy, and Ethnic Hierarchy', '1644–1750', 1644, 1750, 'world-event-5-0', ['3.3', '3.4'], ['CDI', 'SIO'], ['Comparison', 'Contextualization']],
  ['apwh-u3-tokugawa-firearms-unification-japan', '14', 'Tokugawa', 'Expansion', 1, 'Firearms and the Unification of Japan', '1560–1600', 1560, 1600, 'world-event-14-0', ['3.1', '3.4'], ['TEC', 'GOV'], ['Causation', 'Contextualization']],
  ['apwh-u3-tokugawa-sankin-kotai-daimyo-control', '14', 'Tokugawa', 'Administration', 2, 'Sankin-kotai and Daimyo Control', '1635–1750', 1635, 1750, 'world-event-14-0', ['3.2', '3.4'], ['GOV', 'ECN'], ['Causation', 'Comparison']],
  ['apwh-u3-tokugawa-confucian-sakoku-hierarchy', '14', 'Tokugawa', 'Legitimation & Conflict', 3, 'Neo-Confucian Order, Sakoku, and Social Hierarchy', '1603–1750', 1603, 1750, 'world-event-14-0', ['3.3', '3.4'], ['SIO', 'CDI'], ['CCOT', 'Comparison']],
];

const recordKeys = [
  'causeStudyPointIds', 'connectionNotes', 'dateLabel', 'effectStudyPointIds', 'empire',
  'endYear', 'evidence', 'examConnection', 'examSkills', 'id', 'keyPeople', 'keyTerms',
  'lens', 'locationNumber', 'mainEventKey', 'relatedStudyPointIds', 'sequence',
  'significance', 'source', 'startYear', 'summary', 'themeIds', 'title', 'topicCodes',
];

const expectedUnitCards = {
  context: {
    id: 'apwh-u3-context-conditions-land-empire-building', kind: 'context', role: 'Unit 3 Context Card',
    title: 'Conditions for Land-Based Empire Building',
    summary: 'By c. 1450, gunpowder weapons, post-Mongol political openings, agrarian revenue systems, and inherited administrative traditions gave ambitious rulers the means to conquer large territories—and the institutions needed to govern them.',
    examSkills: ['Contextualization', 'Causation'],
    prompt: 'As you study Unit 3, distinguish the conditions rulers inherited from the new military and political changes that made rapid expansion possible.',
    takeaways: [
      'Gunpowder and artillery reduced the defensive advantage of walls and helped rulers accelerate territorial conquest.',
      'The fragmentation or weakness of earlier states created political openings for ambitious dynasties and military coalitions.',
      'Existing agrarian taxes, religious institutions, and administrative traditions gave conquerors tools for turning territory into recurring revenue.',
    ],
  },
  synthesis: {
    id: 'apwh-u3-synthesis-expansion-limits-land-power', kind: 'synthesis', role: 'Unit 3 Synthesis Card',
    title: 'How Land Empires Expanded—and Where Their Power Stopped',
    summary: 'From c. 1450 to 1750, land empires used comparable military, administrative, and legitimating strategies, but regional institutions shaped their results and their ability to compete in an increasingly oceanic world.',
    examSkills: ['Comparison', 'CCOT'],
    prompt: 'Compare two empires across expansion, administration, and legitimation. Which land-based strength could become a constraint as transoceanic networks expanded in Unit 4?',
    takeaways: [
      'Gunpowder conquest and frontier warfare created multiethnic territories faster than armies alone could govern them.',
      'Controlled officials, military elites, and local intermediaries converted conquest into taxes, while religion and monumental culture justified authority.',
      'Reliance on land revenue, court politics, and continental armies could limit sustained maritime investment as transoceanic trade networks grew.',
    ],
  },
};

const expectedCausalEdges = new Set([
  'apwh-u3-ottoman-cannon-conquest-constantinople->apwh-u3-ottoman-devshirme-janissary-system',
  'apwh-u3-ottoman-devshirme-janissary-system->apwh-u3-ottoman-sunni-millet-imperial-architecture',
  'apwh-u3-safavid-ismail-qizilbash-conquest->apwh-u3-safavid-shah-abbas-ghulams-centralization',
  'apwh-u3-safavid-shah-abbas-ghulams-centralization->apwh-u3-safavid-twelver-shiism-ottoman-rivalry',
  'apwh-u3-mughal-babur-gunpowder-panipat->apwh-u3-mughal-akbar-mansabdars-zamindars',
  'apwh-u3-mughal-akbar-mansabdars-zamindars->apwh-u3-mughal-akbar-tolerance-aurangzeb-orthodoxy',
  'apwh-u3-russia-ivan-cossacks-siberian-expansion->apwh-u3-russia-peter-table-ranks',
  'apwh-u3-russia-peter-table-ranks->apwh-u3-russia-orthodox-tsardom-boyars-new-capital',
  'apwh-u3-ming-qing-restoration-expansion->apwh-u3-ming-qing-civil-service-continuity',
  'apwh-u3-ming-qing-civil-service-continuity->apwh-u3-ming-qing-manchu-confucian-ethnic-hierarchy',
  'apwh-u3-tokugawa-firearms-unification-japan->apwh-u3-tokugawa-sankin-kotai-daimyo-control',
  'apwh-u3-tokugawa-sankin-kotai-daimyo-control->apwh-u3-tokugawa-confucian-sakoku-hierarchy',
]);

const expectedRelatedPairs = new Set([
  'apwh-u3-ottoman-cannon-conquest-constantinople|apwh-u3-safavid-ismail-qizilbash-conquest',
  'apwh-u3-ottoman-devshirme-janissary-system|apwh-u3-tokugawa-sankin-kotai-daimyo-control',
  'apwh-u3-mughal-akbar-tolerance-aurangzeb-orthodoxy|apwh-u3-safavid-twelver-shiism-ottoman-rivalry',
  'apwh-u3-ming-qing-restoration-expansion|apwh-u3-russia-ivan-cossacks-siberian-expansion',
  'apwh-u3-ming-qing-civil-service-continuity|apwh-u3-mughal-akbar-mansabdars-zamindars',
  'apwh-u3-ming-qing-manchu-confucian-ethnic-hierarchy|apwh-u3-tokugawa-confucian-sakoku-hierarchy',
]);

const expectedLedgerRows = [
  ['apwh-u3-ottoman-cannon-conquest-constantinople', 'Topics 3.1 and 3.4', 'world-event-18-3', 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4', 'Mehmed II, the 1453 siege, large cannon, the fall of Constantinople, and Ottoman control of the Bosporus'],
  ['apwh-u3-ottoman-devshirme-janissary-system', 'Topics 3.2 and 3.4', 'world-event-18-3', 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4', 'Devshirme recruitment, Christian boys, Janissary training, salaried service, and loyalty to the sultan'],
  ['apwh-u3-ottoman-sunni-millet-imperial-architecture', 'Topics 3.3 and 3.4', 'world-event-18-3', 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4', 'Sunni legitimacy, the millet system, Hagia Sophia, imperial mosques, and Ottoman-Safavid conflict'],
  ['apwh-u3-safavid-ismail-qizilbash-conquest', 'Topics 3.1 and 3.4', 'world-event-19-0', 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4', 'Ismail I, Qizilbash military support, the conquest of Persia, the shah title, and the Battle of Chaldiran'],
  ['apwh-u3-safavid-shah-abbas-ghulams-centralization', 'Topics 3.2 and 3.4', 'world-event-19-0', 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4', 'Shah Abbas I, ghulam forces, imported firearms, European military training, and centralization against Qizilbash power'],
  ['apwh-u3-safavid-twelver-shiism-ottoman-rivalry', 'Topics 3.3 and 3.4', 'world-event-19-0', 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4', "Twelver Shi'ism, coerced conversion, Sunni-Shi'a rivalry, Ottoman border wars, and the 1722 Afghan seizure of Isfahan"],
  ['apwh-u3-mughal-babur-gunpowder-panipat', 'Topics 3.1 and 3.4', 'world-event-6-1', 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4', 'Babur, field artillery, matchlock troops, the 1526 Battle of Panipat, and the foundation of Mughal rule'],
  ['apwh-u3-mughal-akbar-mansabdars-zamindars', 'Topics 3.2 and 3.4', 'world-event-6-1', 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4', 'Akbar, mansabdar ranking, zamindar tax collection, Hindu participation, and the conversion of conquest into revenue'],
  ['apwh-u3-mughal-akbar-tolerance-aurangzeb-orthodoxy', 'Topics 3.3 and 3.4', 'world-event-6-1', 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4', "Akbar's religious tolerance, abolition of the jizya, Din-i Ilahi, Aurangzeb's orthodoxy, and Hindu and Sikh resistance"],
  ['apwh-u3-russia-ivan-cossacks-siberian-expansion', 'Topics 3.1 and 3.4', 'world-event-25-0', 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4', 'Ivan IV, Moscow, Cossack forces, the conquest of Siberian khanates, fur tribute, and the 1639 Pacific advance'],
  ['apwh-u3-russia-peter-table-ranks', 'Topics 3.2 and 3.4', 'world-event-25-0', 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4', 'Peter the Great, the Table of Ranks, state service, control of boyars, military reform, and centralized administration'],
  ['apwh-u3-russia-orthodox-tsardom-boyars-new-capital', 'Topics 3.3 and 3.4', 'world-event-25-0', 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4', 'Orthodox tsardom, coercion of boyars, Westernization, the 1703 founding of St. Petersburg, and capital relocation'],
  ['apwh-u3-ming-qing-restoration-expansion', 'Topics 3.1 and 3.4', 'world-event-5-0', 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4', 'Ming restoration after Yuan rule, Manchu conquest, Qing consolidation, Kangxi and Qianlong campaigns, and expansion into Inner Asia'],
  ['apwh-u3-ming-qing-civil-service-continuity', 'Topics 3.2 and 3.4', 'world-event-5-0', 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4', 'Restoration of civil-service examinations, scholar-gentry administration, Confucian education, bureaucratic continuity, and agrarian taxation'],
  ['apwh-u3-ming-qing-manchu-confucian-ethnic-hierarchy', 'Topics 3.3 and 3.4', 'world-event-5-0', 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4', 'Manchu adoption of Confucian legitimacy, preservation of ethnic identity, queue requirements, banner privilege, and hierarchy under Qing rule'],
  ['apwh-u3-tokugawa-firearms-unification-japan', 'Topics 3.1 and 3.4', 'world-event-14-0', 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4', 'Portuguese muskets, Oda Nobunaga, Toyotomi Hideyoshi, disarmament of peasants, and the military unification of Japan'],
  ['apwh-u3-tokugawa-sankin-kotai-daimyo-control', 'Topics 3.2 and 3.4', 'world-event-14-0', 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4', 'Sankin-kotai, alternate attendance, daimyo families as hostages, domain expenses, and shogunal control from Edo'],
  ['apwh-u3-tokugawa-confucian-sakoku-hierarchy', 'Topics 3.3 and 3.4', 'world-event-14-0', 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4', 'Neo-Confucian hierarchy, samurai status, sakoku restrictions, Nagasaki trade, and the suppression of Christianity'],
];

test('publishes the exact Unit 3 empire-by-lens manifest', () => {
  assert.equal(api.unitId, 'u3');
  assert.equal(api.unitNumber, 3);
  assert.deepEqual([...api.locationNumbers], ['5', '6', '14', '18', '19', '25']);
  assert.equal(api.records.length, 18);
  for (const number of api.locationNumbers) assert.equal(api.getByLocation(number).length, 3, number);
  assert.deepEqual(api.records.map(record => [
    record.id, record.locationNumber, record.empire, record.lens, record.sequence,
    record.title, record.dateLabel, record.startYear, record.endYear, record.mainEventKey,
    [...record.topicCodes], [...record.themeIds], [...record.examSkills],
  ]), expectedManifest);
  for (const record of api.records) assert.deepEqual(Object.keys(record).sort(), recordKeys);
});

test('publishes one exact Expansion, Administration, and Legitimation & Conflict sequence per empire', () => {
  const expectedEmpires = ['Ming/Qing', 'Mughal', 'Tokugawa', 'Ottoman', 'Safavid', 'Russia'];
  assert.deepEqual(api.locationNumbers.map(number => api.getByLocation(number)[0].empire), expectedEmpires);
  for (const locationNumber of api.locationNumbers) {
    const records = [...api.getByLocation(locationNumber)].sort((a, b) => a.sequence - b.sequence);
    assert.deepEqual(records.map(record => [record.lens, record.sequence]), [
      ['Expansion', 1], ['Administration', 2], ['Legitimation & Conflict', 3],
    ]);
    assert.equal(new Set(records.map(record => record.empire)).size, 1);
  }
});

test('publishes exact immutable Unit 3 cards outside map records', () => {
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

test('ships complete rich English learner records with exact skills and deep immutability', () => {
  for (const [index, record] of api.records.entries()) {
    assert.doesNotMatch(JSON.stringify(record), /[\u3400-\u9fff]/);
    assert.match(record.summary, /[A-Za-z]/);
    assert.ok(record.significance.length >= 60, `${record.id} significance`);
    assert.ok(record.examConnection.length >= 60, `${record.id} examConnection`);
    assert.ok(record.keyPeople.length >= 1, `${record.id} keyPeople`);
    assert.ok(record.keyTerms.length >= 2, `${record.id} keyTerms`);
    assert.ok(record.evidence.length >= 2, `${record.id} evidence`);
    assert.deepEqual(record.examSkills, expectedManifest[index][12], `${record.id} skills`);
    assert.ok(record.keyPeople.every(person => Object.keys(person).sort().join(',') === 'name,role'));
    assert.ok(record.keyTerms.every(term => Object.keys(term).sort().join(',') === 'explanation,term'));
    assert.deepEqual(Object.keys(record.source).sort(), ['id', 'locator']);
    assert.equal(record.source.id, 'amsco-apwh-u3');
    const topicLabel = record.topicCodes.length === 1
      ? `Topic ${record.topicCodes[0]}`
      : `Topics ${record.topicCodes.slice(0, -1).join(', ')}${record.topicCodes.length > 2 ? ',' : ''} and ${record.topicCodes.at(-1)}`;
    assert.equal(record.source.locator, `AMSCO AP World History, Unit 3, ${topicLabel}`);
    const learnerStrings = [
      record.title, record.summary, record.significance, record.examConnection,
      ...record.keyPeople.flatMap(person => [person.name, person.role]),
      ...record.keyTerms.flatMap(term => [term.term, term.explanation]),
      ...record.evidence, record.source.locator,
    ];
    assert.ok(learnerStrings.every(value => typeof value === 'string' && /[A-Za-z]/.test(value)),
      `${record.id} English learner strings`);
    assert.ok(Object.isFrozen(record) && Object.isFrozen(record.keyPeople)
      && record.keyPeople.every(Object.isFrozen) && Object.isFrozen(record.keyTerms)
      && record.keyTerms.every(Object.isFrozen) && Object.isFrozen(record.evidence)
      && Object.isFrozen(record.source) && Object.isFrozen(record.topicCodes)
      && Object.isFrozen(record.themeIds) && Object.isFrozen(record.examSkills)
      && Object.isFrozen(record.causeStudyPointIds) && Object.isFrozen(record.effectStudyPointIds)
      && Object.isFrozen(record.relatedStudyPointIds) && Object.isFrozen(record.connectionNotes));
  }
  assert.ok(Object.isFrozen(api));
  assert.ok(Object.isFrozen(api.records));
  assert.ok(Object.isFrozen(api.locationNumbers));
  assert.ok(Object.isFrozen(api.unitCards));
});

test('keeps chronology and map geography explicit in the learner copy', () => {
  const russia = api.getById('apwh-u3-russia-ivan-cossacks-siberian-expansion');
  assert.match(russia.summary, /Moscow/i);
  assert.match(russia.significance, /St\. Petersburg/);
  assert.match(russia.significance, /1703/);
  const mingQing = api.getById('apwh-u3-ming-qing-restoration-expansion');
  assert.match(mingQing.summary, /Ming/);
  assert.match(mingQing.summary, /Qing/);
  assert.match(api.getById('apwh-u3-tokugawa-firearms-unification-japan').summary, /Japan/);
});

test('publishes exact causal chains and related comparison pairs with reciprocal English notes', () => {
  const causal = new Set();
  const related = new Set();
  const categoryReciprocals = {
    causeStudyPointIds: 'effectStudyPointIds',
    effectStudyPointIds: 'causeStudyPointIds',
    relatedStudyPointIds: 'relatedStudyPointIds',
  };
  for (const record of api.records) {
    const seen = new Set();
    for (const [category, reciprocal] of Object.entries(categoryReciprocals)) {
      assert.equal(new Set(record[category]).size, record[category].length, `${record.id} ${category} duplicate`);
      for (const targetId of record[category]) {
        assert.notEqual(targetId, record.id, `${record.id} self link`);
        assert.ok(!seen.has(targetId), `${record.id} cross-category ${targetId}`);
        seen.add(targetId);
        const target = api.getById(targetId);
        assert.ok(target, `${record.id} unresolved ${targetId}`);
        assert.ok(target[reciprocal].includes(record.id), `${record.id} nonreciprocal ${targetId}`);
        assert.match(record.connectionNotes[targetId], /[A-Za-z]/);
        assert.equal(target.connectionNotes[record.id], record.connectionNotes[targetId]);
        if (category === 'effectStudyPointIds') causal.add(`${record.id}->${targetId}`);
        if (category === 'relatedStudyPointIds') related.add([record.id, targetId].sort().join('|'));
      }
    }
    assert.ok(seen.size >= 1, `${record.id} must have a connection`);
    assert.deepEqual(Object.keys(record.connectionNotes).sort(), [...seen].sort());
  }
  assert.deepEqual(causal, expectedCausalEdges);
  assert.deepEqual(related, expectedRelatedPairs);
});

test('locks all five English source-ledger columns for exactly eighteen Unit 3 records', () => {
  assert.doesNotMatch(ledgerSource, /[\u3400-\u9fff]/);
  const rows = parseLedgerRows(ledgerSource);
  assert.equal(rows.length, 18);
  assert.ok(rows.every(row => row.length === 5 && row.every(cell => /[A-Za-z0-9]/.test(cell))));
  assert.deepEqual(rows, expectedLedgerRows);
});

test('returns defensive lookup arrays, stable identities, map names, and a locked global', () => {
  const expectedNames = {
    5: 'Beijing', 6: 'Delhi', 14: 'Edo/Tokyo', 18: 'Istanbul', 19: 'Isfahan', 25: 'St. Petersburg',
  };
  for (const record of api.records) assert.equal(api.getById(record.id), record);
  for (const [number, name] of Object.entries(expectedNames)) assert.equal(api.locationName(number), name);
  const first = api.getByLocation('18');
  first.pop();
  assert.equal(api.getByLocation('18').length, 3);
  for (const invalid of ['toString', 'constructor', '__proto__', 'missing']) {
    assert.equal(api.getById(invalid), null);
    assert.deepEqual(api.getByLocation(invalid), []);
    assert.equal(api.locationName(invalid), null);
  }
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'APWH_U3_LOCATION_STUDY');
  assert.equal(descriptor.writable, false);
  assert.equal(descriptor.configurable, false);
});

test('refuses to overwrite an existing Unit 3 browser global', () => {
  assert.throws(
    () => runInNewContext(dataModuleSource, { APWH_U3_LOCATION_STUDY: { existing: true } }),
    /Invalid Unit 3 global APWH_U3_LOCATION_STUDY: refusing to overwrite existing value/,
  );
});

test('comparator uses start, end, sequence, and id tie breakers', () => {
  const records = [
    { id: 'z', startYear: 1450, endYear: 1600, sequence: 2 },
    { id: 'a', startYear: 1450, endYear: 1600, sequence: 2 },
    { id: 'sequence', startYear: 1450, endYear: 1600, sequence: 1 },
    { id: 'end', startYear: 1450, endYear: 1500, sequence: 3 },
    { id: 'early', startYear: 1368, endYear: 1750, sequence: 3 },
  ];
  assert.deepEqual([...records].sort(api.compareRecords).map(record => record.id),
    ['early', 'end', 'sequence', 'a', 'z']);
});

const mutateManifest = (label, statement) => replaceDataSource(
  label,
  '  ];\n\n  validateManifestRows(STUDY_MANIFEST);',
  `  ];\n  ${statement}\n\n  validateManifestRows(STUDY_MANIFEST);`,
);
const mutateRawRecord = (label, statement) => replaceDataSource(
  label,
  '  ];\n\n  function freezeUnitCard(card) {',
  `  ];\n  ${statement}\n\n  function freezeUnitCard(card) {`,
);
const mutateUnitCards = (label, statement) => replaceDataSource(
  label,
  '  ];\n\n  function describeRuleValue(value) {',
  `  ];\n  ${statement}\n\n  function describeRuleValue(value) {`,
);

const firstId = 'apwh-u3-ottoman-cannon-conquest-constantinople';

const invalidManifestCases = [
  ['invalid sequence', 'STUDY_MANIFEST[0][4] = 4;', 'invalid sequence 4'],
  ['missing topic', 'STUDY_MANIFEST[0][10] = [];', 'missing topicCodes'],
  ['invalid topic', "STUDY_MANIFEST[0][10] = ['9.9', '3.4'];", 'invalid topicCode 9.9'],
  ['missing theme', 'STUDY_MANIFEST[0][11] = [];', 'missing themeIds'],
  ['invalid theme', "STUDY_MANIFEST[0][11] = ['BAD'];", 'invalid themeId BAD'],
  ['invalid skill', "STUDY_MANIFEST[0][12] = ['Causation', 'Argumentation'];", 'invalid examSkill Argumentation'],
];
for (const [label, statement, rule] of invalidManifestCases) {
  test(`rejects ${label} with a descriptive Unit 3 diagnostic`, () => {
    assertDataModuleError(label, mutateManifest(label, statement), `Invalid Unit 3 study record ${firstId}: ${rule}`);
  });
}

test('rejects malformed manifest rows before deriving study context', () => {
  const cases = [
    ['null manifest row', 'STUDY_MANIFEST[0] = null;', '(missing ID)', 'manifest row must be a thirteen-field array'],
    ['short manifest row', `STUDY_MANIFEST[0] = ['${firstId}'];`, firstId, 'manifest row must be a thirteen-field array'],
    ['non-array topicCodes', "STUDY_MANIFEST[0][10] = '3.1';", firstId, 'topicCodes must be an array'],
    ['non-array themeIds', "STUDY_MANIFEST[0][11] = 'GOV';", firstId, 'themeIds must be an array'],
    ['non-array examSkills', "STUDY_MANIFEST[0][12] = 'Causation';", firstId, 'examSkills must be an array'],
  ];
  for (const [label, statement, diagnosticId, rule] of cases) {
    assertDataModuleError(label, mutateManifest(label, statement),
      `Invalid Unit 3 study record ${diagnosticId}: ${rule}`);
  }
});

test('rejects raw location, empire, lens, and main-event mutations independently of the manifest', () => {
  const cases = [
    ['raw location', "RAW_RECORDS[0].locationNumber = '999';", 'invalid locationNumber 999'],
    ['raw empire', "RAW_RECORDS[0].empire = 'Roman';", 'invalid empire Roman'],
    ['raw lens', "RAW_RECORDS[0].lens = 'Economy';", 'invalid lens Economy'],
    ['raw main event', "RAW_RECORDS[0].mainEventKey = 'world-event-18-99';", 'invalid mainEventKey world-event-18-99'],
  ];
  for (const [label, statement, rule] of cases) {
    assertDataModuleError(label, mutateRawRecord(label, statement),
      `Invalid Unit 3 study record ${firstId}: ${rule}`);
  }
});

test('rejects malformed date labels, ranges, and label-year disagreement', () => {
  const cases = [
    ['malformed date', "RAW_RECORDS[0].dateLabel = '1453/1453';", 'invalid dateLabel 1453/1453'],
    ['non-integer start', "RAW_RECORDS[0].startYear = '1453';", 'startYear must be an integer'],
    ['reversed range', 'RAW_RECORDS[0].startYear = 1454;', 'startYear 1454 exceeds endYear 1453'],
    ['label-year mismatch', "RAW_RECORDS[0].dateLabel = '1454';", 'dateLabel years 1454–1454 do not match startYear 1453 and endYear 1453'],
  ];
  for (const [label, statement, rule] of cases) {
    assertDataModuleError(label, mutateRawRecord(label, statement),
      `Invalid Unit 3 study record ${firstId}: ${rule}`);
  }
});

test('rejects Chinese, numeric-only, and structurally malformed learner copy', () => {
  const cases = [
    ['Chinese copy', "RAW_RECORDS[0].summary = `中文 ${RAW_RECORDS[0].summary}`;", 'non-English summary'],
    ['numeric evidence', "RAW_RECORDS[0].evidence[0] = '12345.';", 'non-English nested learner content'],
    ['missing actor', 'RAW_RECORDS[0].keyPeople = [];', 'missing keyPeople'],
    ['missing terms', 'RAW_RECORDS[0].keyTerms = [];', 'missing keyTerms'],
    ['missing evidence', 'RAW_RECORDS[0].evidence = [];', 'missing evidence'],
    ['bad actor shape', "RAW_RECORDS[0].keyPeople = [{ role: 'English role' }];", 'keyPeople entry must contain exactly name and role fields'],
    ['bad term shape', "RAW_RECORDS[0].keyTerms = [{ term: 'one', explanation: 'English explanation' }, { term: 'two', extra: 'English text' }];", 'keyTerms entry must contain exactly term and explanation fields'],
    ['short significance', "RAW_RECORDS[0].significance = 'Too short.';", 'significance is too short'],
    ['short exam connection', "RAW_RECORDS[0].examConnection = 'Too short.';", 'examConnection is too short'],
  ];
  for (const [label, statement, rule] of cases) {
    assertDataModuleError(label, mutateRawRecord(label, statement),
      `Invalid Unit 3 study record ${firstId}: ${rule}`);
  }
});

test('rejects missing, invalid, and extra source metadata', () => {
  const cases = [
    ['missing source id', "RAW_RECORDS[0].source.id = '';", 'missing source id'],
    ['invalid source id', "RAW_RECORDS[0].source.id = 'other';", 'invalid source id other'],
    ['missing source locator', "RAW_RECORDS[0].source.locator = '';", 'missing source locator'],
    ['extra source field', "RAW_RECORDS[0].source.edition = 'extra';", 'source must contain exactly id and locator fields'],
  ];
  for (const [label, statement, rule] of cases) {
    assertDataModuleError(label, mutateRawRecord(label, statement),
      `Invalid Unit 3 study record ${firstId}: ${rule}`);
  }
});

test('rejects record count drift and duplicate raw record IDs', () => {
  assertDataModuleError('seventeen records', mutateRawRecord('seventeen records', 'RAW_RECORDS.pop();'),
    'Invalid Unit 3 study record (missing record): expected exactly 18 records');
  assertDataModuleError('nineteen records', mutateRawRecord('nineteen records', 'RAW_RECORDS.push({ ...RAW_RECORDS[0], id: \'apwh-u3-extra-record\' });'),
    'Invalid Unit 3 study record apwh-u3-extra-record: expected exactly 18 records');
  assertDataModuleError('duplicate record ID', mutateRawRecord(
    'duplicate record ID', 'RAW_RECORDS[1].id = RAW_RECORDS[0].id;',
  ), `Invalid Unit 3 study record ${firstId}: duplicate record ID`);
});

test('rejects duplicate lenses and sequences within an empire location', () => {
  const duplicateLensManifest = mutateManifest('duplicate lens manifest', "STUDY_MANIFEST[1][3] = 'Expansion';");
  const duplicateLensSource = duplicateLensManifest.replace(
    '  ];\n\n  function freezeUnitCard(card) {',
    "  ];\n  RAW_RECORDS[1].lens = 'Expansion';\n\n  function freezeUnitCard(card) {",
  );
  assert.notEqual(duplicateLensSource, duplicateLensManifest, 'duplicate lens raw fixture mutation');
  assertDataModuleError('duplicate lens', duplicateLensSource,
    `Invalid Unit 3 study record ${firstId}: duplicate lens Expansion at location 18`);
  assertDataModuleError('duplicate sequence', mutateManifest(
    'duplicate sequence', 'STUDY_MANIFEST[1][4] = 1;',
  ), `Invalid Unit 3 study record ${firstId}: duplicate sequence 1 at location 18`);
});

test('rejects malformed and non-Unit-3 stable IDs', () => {
  for (const [replacement, rule] of [
    ['apwh-u2-ottoman-cannon-conquest-constantinople', 'invalid stable ID apwh-u2-ottoman-cannon-conquest-constantinople'],
    ['apwh-u3-Ottoman bad id', 'invalid stable ID apwh-u3-Ottoman bad id'],
  ]) {
    const malformed = replaceAllDataSource(rule, firstId, replacement);
    assertDataModuleError(rule, malformed, `Invalid Unit 3 study record ${replacement}: ${rule}`);
  }
});

test('rejects malformed Unit 3 cards', () => {
  const cases = [
    ['missing role', "UNIT_CARD_LIST[0].role = '';", 'context', 'apwh-u3-context-conditions-land-empire-building', 'missing role'],
    ['two takeaways', 'UNIT_CARD_LIST[0].takeaways.pop();', 'context', 'apwh-u3-context-conditions-land-empire-building', 'takeaways must contain exactly three items'],
    ['duplicate kind', "UNIT_CARD_LIST[1].kind = 'context';", 'context', 'apwh-u3-synthesis-expansion-limits-land-power', 'duplicate kind context'],
    ['duplicate ID', 'UNIT_CARD_LIST[1].id = UNIT_CARD_LIST[0].id;', 'synthesis', 'apwh-u3-context-conditions-land-empire-building', 'duplicate card ID'],
    ['Chinese prompt', "UNIT_CARD_LIST[0].prompt = `中文 ${UNIT_CARD_LIST[0].prompt}`;", 'context', 'apwh-u3-context-conditions-land-empire-building', 'non-English prompt'],
  ];
  for (const [label, statement, kind, id, rule] of cases) {
    assertDataModuleError(label, mutateUnitCards(label, statement),
      `Invalid Unit 3 unit card ${kind} ${id}: ${rule}`);
  }
});

test('rejects null and non-object raw records and unit cards before dereferencing', () => {
  assertDataModuleError('null raw record', mutateRawRecord('null raw record', 'RAW_RECORDS[0] = null;'),
    'Invalid Unit 3 study record (missing ID): record must be a non-null plain object');
  assertDataModuleError('null card', mutateUnitCards('null card', 'UNIT_CARD_LIST[0] = null;'),
    'Invalid Unit 3 unit card (missing kind) (missing ID): card must be a non-null plain object');
});

const mutateConnections = (label, statement) => replaceDataSource(
  label,
  '  // Raw learner content follows. Manifest metadata and graph fields are injected after validation.',
  `  ${statement}\n\n  // Raw learner content follows. Manifest metadata and graph fields are injected after validation.`,
);

test('rejects missing graph endpoints immediately', () => {
  const cases = [
    [
      'missing causal cause',
      "addCausalConnection('apwh-u3-missing-cause', 'apwh-u3-ottoman-devshirme-janissary-system', 'English comparison note.');",
      'Invalid Unit 3 study connection causal: missing cause apwh-u3-missing-cause',
    ],
    [
      'missing causal effect',
      "addCausalConnection('apwh-u3-ottoman-cannon-conquest-constantinople', 'apwh-u3-missing-effect', 'English comparison note.');",
      'Invalid Unit 3 study connection causal: missing effect apwh-u3-missing-effect',
    ],
    [
      'missing related left',
      "addRelatedConnection('apwh-u3-missing-left', 'apwh-u3-safavid-ismail-qizilbash-conquest', 'English comparison note.');",
      'Invalid Unit 3 study connection related: missing left apwh-u3-missing-left',
    ],
    [
      'missing related right',
      "addRelatedConnection('apwh-u3-ottoman-cannon-conquest-constantinople', 'apwh-u3-missing-right', 'English comparison note.');",
      'Invalid Unit 3 study connection related: missing right apwh-u3-missing-right',
    ],
  ];
  for (const [label, statement, message] of cases) {
    assertDataModuleError(label, mutateConnections(label, statement), message);
  }
});

test('rejects causal and related self-connections', () => {
  assertDataModuleError('causal self', mutateConnections(
    'causal self',
    `addCausalConnection('${firstId}', '${firstId}', 'English causal note.');`,
  ), `Invalid Unit 3 study connection causal: self connection ${firstId}`);
  assertDataModuleError('related self', mutateConnections(
    'related self',
    `addRelatedConnection('${firstId}', '${firstId}', 'English related note.');`,
  ), `Invalid Unit 3 study connection related: self connection ${firstId}`);
});

const graphMutationCases = [
  [
    'duplicate connection',
    'cause.effectStudyPointIds.push(effectId);',
    'cause.effectStudyPointIds.push(effectId, effectId);',
    `Invalid Unit 3 study record ${firstId}: duplicate connection in effectStudyPointIds to apwh-u3-ottoman-devshirme-janissary-system`,
  ],
  [
    'cross-category connection',
    'effect.causeStudyPointIds.push(causeId);',
    'effect.causeStudyPointIds.push(causeId);\n    cause.relatedStudyPointIds.push(effectId);\n    effect.relatedStudyPointIds.push(causeId);',
    `Invalid Unit 3 study record ${firstId}: cross-category connection apwh-u3-ottoman-devshirme-janissary-system in effectStudyPointIds and relatedStudyPointIds`,
  ],
  [
    'nonreciprocal category',
    'effect.causeStudyPointIds.push(causeId);',
    '// omit reverse fixture',
    `Invalid Unit 3 study record ${firstId}: nonreciprocal effectStudyPointIds connection to apwh-u3-ottoman-devshirme-janissary-system`,
  ],
  [
    'missing reciprocal notes',
    'cause.connectionNotes[effectId] = note;\n    effect.connectionNotes[causeId] = note;',
    '// omit notes fixture',
    `Invalid Unit 3 study record ${firstId}: missing connection note for apwh-u3-ottoman-devshirme-janissary-system`,
  ],
  [
    'non-English note',
    'cause.connectionNotes[effectId] = note;',
    "cause.connectionNotes[effectId] = '12345.';",
    `Invalid Unit 3 study record ${firstId}: non-English connection note for apwh-u3-ottoman-devshirme-janissary-system`,
  ],
  [
    'mismatched reciprocal note',
    'effect.connectionNotes[causeId] = note;',
    'effect.connectionNotes[causeId] = `${note} Different.`;',
    `Invalid Unit 3 study record ${firstId}: nonreciprocal connection note for apwh-u3-ottoman-devshirme-janissary-system`,
  ],
  [
    'extra note',
    'connectionNotes: Object.freeze({ ...connections.connectionNotes }),',
    "connectionNotes: Object.freeze({ ...connections.connectionNotes, 'apwh-u3-extra': 'Extra note.' }),",
    `Invalid Unit 3 study record ${firstId}: extra connection note key apwh-u3-extra`,
  ],
  [
    'unresolved link',
    'effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds]),',
    "effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds, 'apwh-u3-missing-link']),",
    `Invalid Unit 3 study record ${firstId}: unresolved connection apwh-u3-missing-link`,
  ],
];
for (const [label, search, replacement, message] of graphMutationCases) {
  test(`rejects graph ${label}`, () => {
    assertDataModuleError(label, replaceDataSource(label, search, replacement), message);
  });
}
