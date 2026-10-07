# APWH Unit 1 Complete Location Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete APWH Unit 1 Topic 1.1–1.7 study coverage by adding three source-backed records each for the Aztec Empire, Inca Empire, and Medieval Europe with civilization-first labels.

**Architecture:** Extend the existing immutable `APWH_U1_LOCATION_STUDY` module rather than creating another renderer or dataset. Keep pin numbers, coordinates, map event keys, Unit mappings, Context/Synthesis cards, and all twelve approved records unchanged except for correcting two stale source-topic locators. Both the standalone page and homepage mirror consume the same expanded API and existing generic location-study renderer.

**Tech Stack:** Static JavaScript data module, Node.js `node:test` and `vm`, Markdown source ledger, static HTML, Playwright browser verification.

---

## File Structure

- Modify `tests/apwh-u1-location-study.test.mjs`: locks the eight-location/twenty-one-record manifest, labels, Topics 1.1–1.7, nine new records, graph, source ledger, validation, and immutability.
- Modify `data/apwh-u1-location-study.js`: owns the new location labels, authored records, metadata, connections, validation vocabulary, and immutable API.
- Modify `docs/data-sources/apwh-u1-location-study-source-ledger.md`: adds nine exact source rows and corrects stale Hangzhou/Mali topic locators.
- Modify `scripts/verify-world-timeline.mjs`: verifies the new locations on the standalone and homepage surfaces and preserves existing interaction/state behavior.

The source-ledger corrections are metadata-only: existing Hangzhou rows incorrectly include Topic 1.2, and existing Mali rows still call Africa Topic 1.4 instead of current Topic 1.5. No existing learner-facing study prose changes.

### Task 1: Lock the expanded Unit 1 data contract in failing tests

**Files:**
- Modify: `tests/apwh-u1-location-study.test.mjs:27-144`
- Modify: `tests/apwh-u1-location-study.test.mjs:146-360`

- [ ] **Step 1: Expand the canonical pin, event, and ID fixtures**

Replace `trialPins` and extend `validMainEvents`:

```js
const trialPins = ['1', '3', '6', '7', '23', '49', '50', '73'];
const validMainEvents = new Set([
  'world-event-1-0',
  'world-event-3-0',
  'world-event-6-0',
  'world-event-6-4',
  'world-event-7-0',
  'world-event-23-0',
  'world-event-49-0',
  'world-event-50-0',
  'world-event-73-0',
  'world-event-73-2',
  'world-event-73-3',
]);
```

Append these IDs to `expectedIds`:

```js
  'apwh-u1-tenochtitlan-chinampas-urban-state',
  'apwh-u1-tenochtitlan-religion-warfare-legitimacy',
  'apwh-u1-tenochtitlan-triple-alliance-tribute',
  'apwh-u1-cusco-ayllu-mita-labor',
  'apwh-u1-cusco-pachacuti-tawantinsuyu',
  'apwh-u1-cusco-roads-quipu-administration',
  'apwh-u1-london-manorial-feudal-order',
  'apwh-u1-london-towns-guilds-commerce',
  'apwh-u1-london-magna-carta-monarchy',
```

- [ ] **Step 2: Add exact new-record and display-label fixtures**

Add:

```js
const expectedNewRecords = [
  ['apwh-u1-tenochtitlan-chinampas-urban-state', '49', 'Chinampas and Urban State Capacity', '1325–1450', 1325, 1450, 'world-event-49-0', ['1.4', '1.7'], ['ENV', 'ECN', 'GOV'], ['Causation', 'Comparison']],
  ['apwh-u1-tenochtitlan-religion-warfare-legitimacy', '49', 'Religion, Warfare, and Mexica Legitimacy', '1325–1450', 1325, 1450, 'world-event-49-0', ['1.4', '1.7'], ['CDI', 'GOV'], ['Comparison', 'Contextualization']],
  ['apwh-u1-tenochtitlan-triple-alliance-tribute', '49', 'Triple Alliance and Tribute Empire', '1428–1450', 1428, 1450, 'world-event-49-0', ['1.4', '1.7'], ['GOV', 'ECN'], ['Causation', 'Comparison']],
  ['apwh-u1-cusco-ayllu-mita-labor', '50', "Ayllu, Mit'a, and State Labor", '1438–1450', 1438, 1450, 'world-event-50-0', ['1.4', '1.7'], ['SIO', 'GOV', 'ECN'], ['Causation', 'Comparison']],
  ['apwh-u1-cusco-pachacuti-tawantinsuyu', '50', 'Pachacuti and Tawantinsuyu', '1438–1450', 1438, 1450, 'world-event-50-0', ['1.4', '1.7'], ['GOV', 'ENV'], ['Causation', 'Contextualization']],
  ['apwh-u1-cusco-roads-quipu-administration', '50', 'Roads, Quipu, and Imperial Administration', '1438–1450', 1438, 1450, 'world-event-50-0', ['1.4', '1.7'], ['GOV', 'TEC'], ['Causation', 'Comparison']],
  ['apwh-u1-london-manorial-feudal-order', '23', 'Manorial Agriculture and Feudal Order', '1200–1450', 1200, 1450, 'world-event-23-0', ['1.6', '1.7'], ['SIO', 'ECN'], ['CCOT', 'Contextualization']],
  ['apwh-u1-london-towns-guilds-commerce', '23', 'Towns, Guilds, and Commercial Growth', '1200–1450', 1200, 1450, 'world-event-23-0', ['1.6', '1.7'], ['ECN', 'SIO'], ['Causation', 'CCOT']],
  ['apwh-u1-london-magna-carta-monarchy', '23', 'Magna Carta and Negotiated Monarchy', '1215', 1215, 1215, 'world-event-23-0', ['1.6', '1.7'], ['GOV'], ['Comparison', 'Contextualization']],
];

const expectedNewLocationLabels = new Map([
  ['49', 'Aztec Empire · Tenochtitlan'],
  ['50', 'Inca Empire · Cusco'],
  ['23', 'Medieval Europe · London'],
]);
```

- [ ] **Step 3: Add exact manifest, count, label, and topic-coverage assertions**

Replace the twelve-record title and count assertions with twenty-one-record assertions, retain the complete-record schema loop, and add:

```js
test('publishes the exact nine new Unit 1 records', () => {
  assert.deepEqual(api.records
    .filter(record => expectedNewLocationLabels.has(record.locationNumber))
    .map(record => [
      record.id, record.locationNumber, record.title, record.dateLabel,
      record.startYear, record.endYear, record.mainEventKey,
      [...record.topicCodes], [...record.themeIds], [...record.examSkills],
    ]), expectedNewRecords);
});

test('uses civilization-first labels for the new learner locations', () => {
  for (const [pin, label] of expectedNewLocationLabels) {
    assert.equal(api.locationName(pin), label, pin);
    assert.equal(api.getByLocation(pin).length, 3, `${label} record count`);
  }
});

test('covers every College Board Unit 1 topic', () => {
  assert.deepEqual([...new Set(api.records.flatMap(record => record.topicCodes))].sort(),
    ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7']);
});
```

Change the stable-ID pattern to:

```js
assert.ok(ids.every(id => /^apwh-u1-(hangzhou|angkor|delhi|baghdad|timbuktu|tenochtitlan|cusco|london)-/.test(id)));
```

Change valid vocabularies to:

```js
const validTopics = new Set(['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7']);
const validThemes = new Set(['GOV', 'ECN', 'CDI', 'SIO', 'TEC', 'ENV']);
```

- [ ] **Step 4: Extend exact skills and metadata fixtures**

Append to `expectedExamSkills`:

```js
  ['apwh-u1-tenochtitlan-chinampas-urban-state', ['Causation', 'Comparison']],
  ['apwh-u1-tenochtitlan-religion-warfare-legitimacy', ['Comparison', 'Contextualization']],
  ['apwh-u1-tenochtitlan-triple-alliance-tribute', ['Causation', 'Comparison']],
  ['apwh-u1-cusco-ayllu-mita-labor', ['Causation', 'Comparison']],
  ['apwh-u1-cusco-pachacuti-tawantinsuyu', ['Causation', 'Contextualization']],
  ['apwh-u1-cusco-roads-quipu-administration', ['Causation', 'Comparison']],
  ['apwh-u1-london-manorial-feudal-order', ['CCOT', 'Contextualization']],
  ['apwh-u1-london-towns-guilds-commerce', ['Causation', 'CCOT']],
  ['apwh-u1-london-magna-carta-monarchy', ['Comparison', 'Contextualization']],
```

Append the matching Topic/theme pairs to `expectedMetadata` using the exact values in `expectedNewRecords`.

- [ ] **Step 5: Lock source-ledger exact coverage and corrected locators**

Near the top of the test file load the ledger:

```js
const ledgerSource = readFileSync(
  new URL('../docs/data-sources/apwh-u1-location-study-source-ledger.md', import.meta.url),
  'utf8',
);
```

Add:

```js
test('source ledger covers every Unit 1 study ID exactly once', () => {
  for (const id of expectedIds) {
    assert.equal((ledgerSource.match(new RegExp(`\\| \\`${id}\\` \\|`, 'g')) || []).length, 1, id);
  }
  assert.equal((ledgerSource.match(/\| `apwh-u1-/g) || []).length, 21);
  assert.doesNotMatch(ledgerSource, /Timbuktu.*Topic 1\.4|Hangzhou.*Topics 1\.1 and 1\.2/i);
});
```

Update the source-locator assertion to accept exact current Unit 1 topics:

```js
assert.match(record.source.locator,
  /^AMSCO AP World History, Unit 1, Topic 1\.[1-6](?:; Topic 2\.2 trade mechanism context)?$/);
```

- [ ] **Step 6: Run the focused test and confirm RED**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u1-location-study.test.mjs
```

Expected: FAIL because pins 23/49/50, nine records, new labels, Topics 1.4/1.6, ENV, and ledger rows do not yet exist.

- [ ] **Step 7: Commit the red test**

```bash
git add tests/apwh-u1-location-study.test.mjs
git commit -m "test: lock complete Unit 1 study coverage"
```

### Task 2: Add the three new locations and nine immutable records

**Files:**
- Modify: `data/apwh-u1-location-study.js:4-35`
- Modify: `data/apwh-u1-location-study.js` inside `STUDY_EVENTS`
- Modify: `docs/data-sources/apwh-u1-location-study-source-ledger.md`

- [ ] **Step 1: Expand location labels and validation vocabulary**

Add the three locations in numeric display order:

```js
    '23': 'Medieval Europe · London',
    '49': 'Aztec Empire · Tenochtitlan',
    '50': 'Inca Empire · Cusco',
```

Change validation vocabularies to:

```js
  const VALID_TOPIC_CODES = new Set(['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7']);
  const VALID_THEME_IDS = new Set(['GOV', 'ECN', 'CDI', 'SIO', 'TEC', 'ENV']);
```

- [ ] **Step 2: Add exact Topic/theme metadata**

Append to `STUDY_CONTEXT`:

```js
    'apwh-u1-tenochtitlan-chinampas-urban-state': [['1.4', '1.7'], ['ENV', 'ECN', 'GOV']],
    'apwh-u1-tenochtitlan-religion-warfare-legitimacy': [['1.4', '1.7'], ['CDI', 'GOV']],
    'apwh-u1-tenochtitlan-triple-alliance-tribute': [['1.4', '1.7'], ['GOV', 'ECN']],
    'apwh-u1-cusco-ayllu-mita-labor': [['1.4', '1.7'], ['SIO', 'GOV', 'ECN']],
    'apwh-u1-cusco-pachacuti-tawantinsuyu': [['1.4', '1.7'], ['GOV', 'ENV']],
    'apwh-u1-cusco-roads-quipu-administration': [['1.4', '1.7'], ['GOV', 'TEC']],
    'apwh-u1-london-manorial-feudal-order': [['1.6', '1.7'], ['SIO', 'ECN']],
    'apwh-u1-london-towns-guilds-commerce': [['1.6', '1.7'], ['ECN', 'SIO']],
    'apwh-u1-london-magna-carta-monarchy': [['1.6', '1.7'], ['GOV']],
```

- [ ] **Step 3: Add exact causal and comparative connections**

Add these calls after the existing Unit 1 graph declarations:

```js
  addCausalConnection(
    'apwh-u1-tenochtitlan-chinampas-urban-state',
    'apwh-u1-tenochtitlan-triple-alliance-tribute',
    'Intensive chinampa agriculture helped sustain the large urban population and military resources from which Mexica rulers expanded tribute demands.',
  );
  addCausalConnection(
    'apwh-u1-tenochtitlan-triple-alliance-tribute',
    'apwh-u1-tenochtitlan-religion-warfare-legitimacy',
    'Tribute warfare supplied wealth and captives while public ritual presented Mexica expansion as part of a sacred political order.',
  );
  addCausalConnection(
    'apwh-u1-cusco-pachacuti-tawantinsuyu',
    'apwh-u1-cusco-ayllu-mita-labor',
    'Rapid territorial expansion required Inca rulers to organize local ayllus and rotate labor obligations across a much larger state.',
  );
  addCausalConnection(
    'apwh-u1-cusco-ayllu-mita-labor',
    'apwh-u1-cusco-roads-quipu-administration',
    'Mobilized mit\'a labor built and maintained roads, while officials used quipu records to track resources and obligations.',
  );
  addCausalConnection(
    'apwh-u1-london-manorial-feudal-order',
    'apwh-u1-london-towns-guilds-commerce',
    'Agricultural production and population recovery supported markets and towns whose merchants and guilds operated beyond individual manors.',
  );
  addRelatedConnection(
    'apwh-u1-tenochtitlan-triple-alliance-tribute',
    'apwh-u1-cusco-ayllu-mita-labor',
    'The Aztec tribute system and the Inca mit\'a system extracted resources differently: one emphasized subject payments, while the other mobilized labor through communities.',
  );
  addRelatedConnection(
    'apwh-u1-tenochtitlan-chinampas-urban-state',
    'apwh-u1-cusco-ayllu-mita-labor',
    'Both states adapted difficult environments through organized labor, although chinampas intensified lake agriculture while Inca communities managed highland production and terraces.',
  );
  addRelatedConnection(
    'apwh-u1-london-magna-carta-monarchy',
    'apwh-u1-delhi-sultanate-state-building',
    'Both cases reveal negotiations between rulers and powerful groups, but Magna Carta formalized baronial constraints while Delhi sultans balanced minority rule with military and local political accommodation.',
  );
```

- [ ] **Step 4: Append the exact Aztec records**

Add these `freezeRecord` calls to `STUDY_EVENTS`:

```js
    freezeRecord({
      id: 'apwh-u1-tenochtitlan-chinampas-urban-state',
      examSkills: ['Causation', 'Comparison'],
      locationNumber: '49',
      mainEventKey: 'world-event-49-0',
      title: 'Chinampas and Urban State Capacity',
      dateLabel: '1325–1450', startYear: 1325, endYear: 1450,
      summary: 'Mexica farmers expanded chinampa agriculture around Tenochtitlan, helping support a dense island capital and its rulers.',
      significance: 'Intensive food production and organized waterworks sustained urban growth, markets, specialists, and the political capacity of the Aztec state.',
      keyPeople: [{ name: 'Mexica farmers and engineers', role: 'Built and maintained raised fields, canals, and causeways that supported the island capital.' }],
      keyTerms: [
        { term: 'chinampas', explanation: 'Highly productive raised fields constructed in shallow lake environments.' },
        { term: 'Tenochtitlan', explanation: 'The Mexica island capital that became the political and commercial center of the Aztec Empire.' },
      ],
      evidence: [
        'Chinampas increased reliable food production near a rapidly growing city.',
        'Causeways, canals, markets, and tribute flows connected the island capital to surrounding communities.',
      ],
      examConnection: 'Use chinampas as evidence that environmental adaptation could create agricultural surplus and strengthen state capacity in the Americas.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.4' },
    }),
    freezeRecord({
      id: 'apwh-u1-tenochtitlan-religion-warfare-legitimacy',
      examSkills: ['Comparison', 'Contextualization'],
      locationNumber: '49',
      mainEventKey: 'world-event-49-0',
      title: 'Religion, Warfare, and Mexica Legitimacy',
      dateLabel: '1325–1450', startYear: 1325, endYear: 1450,
      summary: 'Mexica rulers connected military success, public ritual, and devotion to Huitzilopochtli with the legitimacy of imperial rule.',
      significance: 'Religion explained political authority and warfare, while monumental ritual displayed the capital as the sacred center of an expanding empire.',
      keyPeople: [{ name: 'Mexica rulers and priests', role: 'Presented conquest, tribute, and public ceremony as obligations within a sacred political order.' }],
      keyTerms: [
        { term: 'Huitzilopochtli', explanation: 'A Mexica patron deity associated with the sun and warfare.' },
        { term: 'human sacrifice', explanation: 'A ritual practice that Mexica elites connected to cosmic renewal, political authority, and warfare.' },
      ],
      evidence: [
        'Temples and public ceremonies linked imperial leadership to sacred obligations.',
        'Warfare produced tribute and captives while reinforcing the status of military and religious elites.',
      ],
      examConnection: 'Use Mexica ritual and warfare to compare how rulers in different regions used belief systems and public display to legitimize political power.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.4' },
    }),
    freezeRecord({
      id: 'apwh-u1-tenochtitlan-triple-alliance-tribute',
      examSkills: ['Causation', 'Comparison'],
      locationNumber: '49',
      mainEventKey: 'world-event-49-0',
      title: 'Triple Alliance and Tribute Empire',
      dateLabel: '1428–1450', startYear: 1428, endYear: 1450,
      summary: 'Tenochtitlan joined Texcoco and Tlacopan in a military alliance that expanded Mexica power and demanded tribute from conquered peoples.',
      significance: 'Tribute converted conquest into recurring food, textiles, luxury goods, and labor, but coercive extraction also generated resentment among subject communities.',
      keyPeople: [{ name: 'Itzcoatl', role: 'Mexica ruler associated with the formation of the Triple Alliance and early imperial expansion.' }],
      keyTerms: [
        { term: 'Triple Alliance', explanation: 'The political and military partnership of Tenochtitlan, Texcoco, and Tlacopan formed in 1428.' },
        { term: 'tribute', explanation: 'Regular payments of goods or labor demanded from subordinate communities.' },
      ],
      evidence: [
        'Military victories expanded the number of communities required to send tribute.',
        'Tribute lists reveal the movement of food, cloth, feathers, and luxury goods toward the imperial center.',
      ],
      examConnection: 'Use the Triple Alliance to explain how military organization and tribute extraction helped American states expand during c. 1200–1450.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.4' },
    }),
```

- [ ] **Step 5: Append the exact Inca records**

```js
    freezeRecord({
      id: 'apwh-u1-cusco-ayllu-mita-labor',
      examSkills: ['Causation', 'Comparison'],
      locationNumber: '50',
      mainEventKey: 'world-event-50-0',
      title: "Ayllu, Mit'a, and State Labor",
      dateLabel: '1438–1450', startYear: 1438, endYear: 1450,
      summary: "Inca officials worked through ayllu communities and required rotating mit'a labor for farming, roads, storehouses, armies, and public projects.",
      significance: 'Labor obligations let the state mobilize resources without a currency-based tax system and tied local communities to imperial administration.',
      keyPeople: [{ name: 'Ayllu leaders and Inca officials', role: 'Allocated communal responsibilities and organized rotating labor obligations for the state.' }],
      keyTerms: [
        { term: 'ayllu', explanation: 'An Andean kin-based community that organized land, labor, and reciprocal obligations.' },
        { term: "mit'a", explanation: 'A rotating labor obligation used by the Inca state for construction, agriculture, military service, and production.' },
      ],
      evidence: [
        "Mit'a labor maintained terraces, roads, bridges, storehouses, and state lands.",
        'State redistribution moved stored food and goods toward armies, officials, and communities facing shortages.',
      ],
      examConnection: "Compare Inca mit'a labor with Aztec tribute to show that states could extract resources through different institutions.",
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.4' },
    }),
    freezeRecord({
      id: 'apwh-u1-cusco-pachacuti-tawantinsuyu',
      examSkills: ['Causation', 'Contextualization'],
      locationNumber: '50',
      mainEventKey: 'world-event-50-0',
      title: 'Pachacuti and Tawantinsuyu',
      dateLabel: '1438–1450', startYear: 1438, endYear: 1450,
      summary: 'Pachacuti reorganized Cusco and began the rapid expansion of Tawantinsuyu, the Inca realm of four administrative regions.',
      significance: 'Military expansion combined with provincial organization and negotiated incorporation to turn a highland kingdom into a large territorial empire.',
      keyPeople: [{ name: 'Pachacuti', role: 'Inca ruler credited with reorganizing Cusco and launching major imperial expansion after 1438.' }],
      keyTerms: [
        { term: 'Tawantinsuyu', explanation: 'The Inca name for the empire, commonly translated as the Realm of Four Parts.' },
        { term: 'Sapa Inca', explanation: 'The supreme Inca ruler at the center of imperial political and religious authority.' },
      ],
      evidence: [
        'The empire divided territory into four regions connected to Cusco.',
        'Inca rulers combined conquest, resettlement, local intermediaries, and state institutions to incorporate diverse peoples.',
      ],
      examConnection: 'Use Pachacuti to explain how military leadership and administrative reorganization caused rapid state expansion in the Andes.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.4' },
    }),
    freezeRecord({
      id: 'apwh-u1-cusco-roads-quipu-administration',
      examSkills: ['Causation', 'Comparison'],
      locationNumber: '50',
      mainEventKey: 'world-event-50-0',
      title: 'Roads, Quipu, and Imperial Administration',
      dateLabel: '1438–1450', startYear: 1438, endYear: 1450,
      summary: 'An imperial road network, relay runners, storehouses, and quipu records helped Cusco administer communities across the Andes.',
      significance: 'Communication and accounting technologies allowed officials to track labor and goods across difficult terrain without alphabetic writing.',
      keyPeople: [{ name: 'Quipucamayocs', role: 'Specialists who created and interpreted knotted-cord records for the Inca state.' }],
      keyTerms: [
        { term: 'quipu', explanation: 'A system of knotted cords used to record quantities and administrative information.' },
        { term: 'chasquis', explanation: 'Relay runners who carried messages and small goods along the Inca road network.' },
      ],
      evidence: [
        'Roads and suspension bridges connected ecological zones and provincial centers to Cusco.',
        'Quipu records and state storehouses helped officials account for labor, food, and other resources.',
      ],
      examConnection: 'Use roads and quipu as evidence that communication technology can increase a state\'s ability to govern dispersed territory.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.4' },
    }),
```

- [ ] **Step 6: Append the exact Medieval Europe records**

```js
    freezeRecord({
      id: 'apwh-u1-london-manorial-feudal-order',
      examSkills: ['CCOT', 'Contextualization'],
      locationNumber: '23',
      mainEventKey: 'world-event-23-0',
      title: 'Manorial Agriculture and Feudal Order',
      dateLabel: '1200–1450', startYear: 1200, endYear: 1450,
      summary: 'London serves as a regional anchor for a Europe in which manors organized rural production and feudal ties distributed political and military obligations.',
      significance: 'Decentralized obligations helped lords govern locally, while agricultural production supported both rural elites and the gradual recovery of towns.',
      keyPeople: [{ name: 'Lords, vassals, and peasants', role: 'Represented the interdependent landholding, protection, labor, and military obligations of medieval society.' }],
      keyTerms: [
        { term: 'manorialism', explanation: 'A rural economic system centered on estates where peasants supplied labor or dues to landholding lords.' },
        { term: 'feudalism', explanation: 'A decentralized political order based on personal obligations, landholding, and military service among elites.' },
      ],
      evidence: [
        'Most Europeans lived in rural communities where land and labor obligations structured production.',
        'Political authority was divided among monarchs, nobles, church institutions, and local lords.',
      ],
      examConnection: 'Use manorial and feudal relationships to contextualize why medieval European states were often less centralized than contemporary Asian empires.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.6' },
    }),
    freezeRecord({
      id: 'apwh-u1-london-towns-guilds-commerce',
      examSkills: ['Causation', 'CCOT'],
      locationNumber: '23',
      mainEventKey: 'world-event-23-0',
      title: 'Towns, Guilds, and Commercial Growth',
      dateLabel: '1200–1450', startYear: 1200, endYear: 1450,
      summary: 'London represents the broader European growth of towns, merchant communities, and craft guilds alongside the continuing manorial countryside.',
      significance: 'Urban commerce created wealth and organized groups outside older rural hierarchies, contributing to gradual economic and social change.',
      keyPeople: [{ name: 'Merchants and craft guild members', role: 'Regulated training, quality, prices, mutual aid, and access to trades in medieval towns.' }],
      keyTerms: [
        { term: 'guild', explanation: 'An association that regulated a craft or trade and protected the interests of its members.' },
        { term: 'burghers', explanation: 'Urban residents and merchants whose wealth and legal privileges distinguished them from rural estates.' },
      ],
      evidence: [
        'Growing towns hosted markets, specialized crafts, and merchant associations.',
        'Commercial activity expanded even while most of the European population remained tied to agriculture.',
      ],
      examConnection: 'Use towns and guilds to explain continuity and change as commerce grew within a society still dominated by rural manorial production.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.6' },
    }),
    freezeRecord({
      id: 'apwh-u1-london-magna-carta-monarchy',
      examSkills: ['Comparison', 'Contextualization'],
      locationNumber: '23',
      mainEventKey: 'world-event-23-0',
      title: 'Magna Carta and Negotiated Monarchy',
      dateLabel: '1215', startYear: 1215, endYear: 1215,
      summary: 'English barons compelled King John to accept Magna Carta, recording that royal government operated within negotiated elite rights and customary law.',
      significance: 'The charter did not create modern democracy, but it became durable evidence that European monarchs could face formal constraints from powerful subjects.',
      keyPeople: [{ name: 'King John and the English barons', role: 'Represented the conflict between royal taxation and elite demands that produced Magna Carta.' }],
      keyTerms: [
        { term: 'Magna Carta', explanation: 'The 1215 charter that confirmed baronial privileges and placed stated limits on some royal actions.' },
        { term: 'negotiated monarchy', explanation: 'Rule in which a monarch must bargain with powerful elites, institutions, or representative bodies.' },
      ],
      evidence: [
        'Baronial resistance forced King John to seal the charter at Runnymede.',
        'Magna Carta protected elite privileges and legal procedures rather than granting equal political rights to all subjects.',
      ],
      examConnection: 'Use Magna Carta carefully as evidence of negotiated elite limits on monarchy, not as proof that England was already a modern democracy.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.6' },
    }),
```

- [ ] **Step 7: Correct stale source locators without changing existing study prose**

In the three Hangzhou records change:

```js
source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.1' },
```

In the three Timbuktu records use:

```js
source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.5; Topic 2.2 trade mechanism context' },
```

only where the existing record currently invokes Topic 2.2 mechanics; otherwise use:

```js
source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.5' },
```

- [ ] **Step 8: Extend and correct the source ledger**

Update the introduction to say that Topic 2.2 is supporting context for one trans-Saharan mechanics record and the Unit 1 claim remains Topic 1.5. Correct Hangzhou to Topic 1.1 and Mali to Topic 1.5. Append:

```markdown
| `apwh-u1-tenochtitlan-chinampas-urban-state` | Topics 1.4 and 1.7 | `world-event-49-0` | AMSCO AP World History, Unit 1, Topic 1.4 | Chinampas, urban food supply, canals, markets, and state capacity |
| `apwh-u1-tenochtitlan-religion-warfare-legitimacy` | Topics 1.4 and 1.7 | `world-event-49-0` | AMSCO AP World History, Unit 1, Topic 1.4 | Mexica religion, warfare, ritual, and political legitimacy |
| `apwh-u1-tenochtitlan-triple-alliance-tribute` | Topics 1.4 and 1.7 | `world-event-49-0` | AMSCO AP World History, Unit 1, Topic 1.4 | Triple Alliance, tribute extraction, military expansion, and subject resentment |
| `apwh-u1-cusco-ayllu-mita-labor` | Topics 1.4 and 1.7 | `world-event-50-0` | AMSCO AP World History, Unit 1, Topic 1.4 | Ayllu organization, mit'a labor, terraces, storehouses, and redistribution |
| `apwh-u1-cusco-pachacuti-tawantinsuyu` | Topics 1.4 and 1.7 | `world-event-50-0` | AMSCO AP World History, Unit 1, Topic 1.4 | Pachacuti, Tawantinsuyu, four-part administration, and imperial expansion |
| `apwh-u1-cusco-roads-quipu-administration` | Topics 1.4 and 1.7 | `world-event-50-0` | AMSCO AP World History, Unit 1, Topic 1.4 | Roads, chasquis, quipu, storehouses, and imperial administration |
| `apwh-u1-london-manorial-feudal-order` | Topics 1.6 and 1.7 | `world-event-23-0` | AMSCO AP World History, Unit 1, Topic 1.6 | Representative European anchor for manorialism, feudal obligations, and decentralized authority |
| `apwh-u1-london-towns-guilds-commerce` | Topics 1.6 and 1.7 | `world-event-23-0` | AMSCO AP World History, Unit 1, Topic 1.6 | Representative European anchor for towns, guilds, merchants, and commercial growth |
| `apwh-u1-london-magna-carta-monarchy` | Topics 1.6 and 1.7 | `world-event-23-0` | AMSCO AP World History, Unit 1, Topic 1.6 | Magna Carta, King John, baronial privileges, legal procedure, and negotiated monarchy |
```

- [ ] **Step 9: Run the focused test and confirm GREEN**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u1-location-study.test.mjs
```

Expected: all Unit 1 data tests pass with eight locations, twenty-one records, complete Topic 1.1–1.7 coverage, reciprocal connections, and exact ledger coverage.

- [ ] **Step 10: Commit the data and ledger**

```bash
git add data/apwh-u1-location-study.js docs/data-sources/apwh-u1-location-study-source-ledger.md
git commit -m "feat: complete APWH Unit 1 location studies"
```

### Task 3: Verify the new labels and study views on both surfaces

**Files:**
- Modify: `scripts/verify-world-timeline.mjs` near the Unit 1 study fixtures and contracts

- [ ] **Step 1: Add exact browser fixtures**

Add:

```js
const UNIT_1_NEW_STUDY_VIEWS = Object.freeze([
  Object.freeze({ number: '49', region: 'americas', label: 'Aztec Empire · Tenochtitlan', ids: Object.freeze([
    'apwh-u1-tenochtitlan-chinampas-urban-state',
    'apwh-u1-tenochtitlan-religion-warfare-legitimacy',
    'apwh-u1-tenochtitlan-triple-alliance-tribute',
  ]) }),
  Object.freeze({ number: '50', region: 'americas', label: 'Inca Empire · Cusco', ids: Object.freeze([
    'apwh-u1-cusco-ayllu-mita-labor',
    'apwh-u1-cusco-pachacuti-tawantinsuyu',
    'apwh-u1-cusco-roads-quipu-administration',
  ]) }),
  Object.freeze({ number: '23', region: 'europe', label: 'Medieval Europe · London', ids: Object.freeze([
    'apwh-u1-london-manorial-feudal-order',
    'apwh-u1-london-towns-guilds-commerce',
    'apwh-u1-london-magna-carta-monarchy',
  ]) }),
]);
```

- [ ] **Step 2: Add the failing standalone verification loop**

Inside the standalone Unit 1 study verification, add:

```js
  for (const fixture of UNIT_1_NEW_STUDY_VIEWS) {
    await page.evaluate(({ number, region }) => {
      window.__mapFilter.setPeriod('u1');
      window.__mapFilter.openHit(number, region);
    }, fixture);
    const entry = page.locator(`#eventPanel [data-location-study-open="${fixture.number}"]`);
    await expectVisible(entry, `${fixture.label} must expose its study entry`);
    assert.equal((await entry.innerText()).trim(), 'View all 3 study points');
    await entry.click();
    const view = page.locator(`#eventPanel [data-location-study-view="${fixture.number}"][data-location-study-unit="u1"]`);
    await expectVisible(view, `${fixture.label} study view must render`);
    assert.equal((await view.locator('.location-study-title').innerText()).trim(),
      `${fixture.label} · Unit 1`);
    assert.deepEqual(await view.locator('[data-study-event]').evaluateAll(nodes =>
      nodes.map(node => node.dataset.studyEvent)), fixture.ids);
    assert.equal(await view.locator('[data-study-detail]').count(), 1,
      `${fixture.label} must preserve one-at-a-time expansion`);
  }
```

- [ ] **Step 3: Add homepage parity assertions**

After the homepage iframe and mirror are ready, repeat the loop by setting `u1` on `#hostPeriod`, calling `frame.locator('body').evaluate()` to open the pin, clicking the mirrored `#home-events [data-location-study-open]`, and asserting the same label and IDs in `#home-events [data-location-study-view]`:

```js
  for (const fixture of UNIT_1_NEW_STUDY_VIEWS) {
    await page.locator('#hostPeriod').selectOption('u1');
    await frame.locator('body').evaluate(({ number, region }) =>
      window.__mapFilter.openHit(number, region), fixture);
    const entry = page.locator(`#home-events [data-location-study-open="${fixture.number}"]`);
    await expectVisible(entry, `homepage ${fixture.label} must expose its study entry`);
    await entry.click();
    const view = page.locator(`#home-events [data-location-study-view="${fixture.number}"][data-location-study-unit="u1"]`);
    await expectVisible(view, `homepage ${fixture.label} study view must render`);
    assert.equal((await view.locator('.location-study-title').innerText()).trim(),
      `${fixture.label} · Unit 1`);
    assert.deepEqual(await view.locator('[data-study-event]').evaluateAll(nodes =>
      nodes.map(node => node.dataset.studyEvent)), fixture.ids);
  }
```

- [ ] **Step 4: Run the browser verifier and confirm GREEN**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: PASS on standalone and homepage surfaces, with exact civilization-first labels and all nine IDs.

- [ ] **Step 5: Commit browser coverage**

```bash
git add scripts/verify-world-timeline.mjs
git commit -m "test: verify complete Unit 1 study views"
```

### Task 4: Run complete APWH regression and content checks

**Files:**
- No production changes expected.

- [ ] **Step 1: Run all Node data tests**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
```

Expected: all Unit 1, Unit 2, Unit 3, and APUSH data tests pass.

- [ ] **Step 2: Run the complete browser verifier from a fresh process**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: PASS, including source-ID baseline, Unit mapping, standalone/homepage parity, responsive behavior, causal chains, Timeline dock, route mode, filters, and practice mode.

- [ ] **Step 3: Check diffs and repository hygiene**

```bash
git diff --check
git status --short
git log --oneline -6
```

Expected: no whitespace errors; clean status; only the approved spec, plans, red tests, data/ledger, browser tests, and chain-fallback fix appear in the new commits.
