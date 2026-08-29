# APWH Unit 2 Location Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete Unit 2 location-study layer with eighteen English study points, historical-thinking skills, Context/Synthesis bookends, active-Unit API selection, clean Unit switching, and responsive rendering in both APWH surfaces.

**Architecture:** Keep Unit 2 authored content in a dedicated immutable `APWH_U2_LOCATION_STUDY` module whose external API matches Unit 1. Add unit identity and data-provided card roles to Unit 1, then replace Unit 1 hard-coding in the two renderers with an active-Unit API resolver. Keep bookend disclosure state DOM-local and keep Unit 1 and Unit 2 record/connection graphs isolated.

**Tech Stack:** Static HTML/CSS/JavaScript, immutable browser-global data modules, Node.js `node:test` and `vm`, Markdown source ledgers, Playwright browser verification.

---

## File Structure

- Create `data/apwh-u2-location-study.js`: owns the Unit 2 manifest, exact English content, metadata, connections, validation, immutability, and locked public API.
- Create `tests/apwh-u2-location-study.test.mjs`: locks all eighteen records, six-by-three distribution, cards, graph, source ledger, English-only content, validation errors, and deep immutability.
- Create `docs/data-sources/apwh-u2-location-study-source-ledger.md`: maps each stable Unit 2 study ID to its AMSCO topic, existing map event, and supported claims.
- Modify `data/apwh-u1-location-study.js`: adds generic unit identity and data-provided Unit 1 card roles only.
- Modify `tests/apwh-u1-location-study.test.mjs`: locks the Unit 1 compatibility additions and preserves all current behavior.
- Modify `world-map.html`: loads Unit 2 data, resolves the active study API, renders generic unit labels/cards/events, and clears cross-Unit study state.
- Modify `index.html`: resolves the cloned study view's Unit 1 or Unit 2 API and renders data-provided card roles.
- Modify `scripts/verify-world-timeline.mjs`: verifies the complete Unit 2 experience, both surfaces, Unit switching, exact content, keyboard behavior, state isolation, and `380/410/430px` width behavior.

Do not create a shared validation runtime in this release. The two authored datasets are isolated browser globals with the same external contract; extracting a third runtime would enlarge the migration without improving the learner-facing result.

### Task 1: Make the Unit 1 API and cards safe for a generic renderer

**Files:**
- Modify: `tests/apwh-u1-location-study.test.mjs`
- Modify: `data/apwh-u1-location-study.js`

- [ ] **Step 1: Write failing Unit 1 compatibility tests**

Add these assertions to `publishes the Unit 1 location-study API`:

```js
assert.equal(api.unitId, 'u1');
assert.equal(api.unitNumber, 1);
```

Add exact `role` values to the existing `expectedUnitCards` fixture:

```js
context: {
  id: 'apwh-u1-context-global-tapestry',
  kind: 'context',
  role: 'Unit 1 Context Card',
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
  role: 'Unit 1 Synthesis Card',
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
```

Inside the exact card test, add:

```js
for (const card of Object.values(api.unitCards)) {
  assert.match(card.role, /^Unit 1 (Context|Synthesis) Card$/);
}
```

Add a source-mutation test that replaces the unique literal `role: 'Unit 1 Context Card'` with `role: ''` and expects:

```text
Invalid Unit 1 unit card context apwh-u1-context-global-tapestry: missing role
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u1-location-study.test.mjs
```

Expected: FAIL because `unitId`, `unitNumber`, and card `role` do not exist.

- [ ] **Step 3: Add exact Unit 1 metadata and card roles**

In `data/apwh-u1-location-study.js`, add the two role literals to `UNIT_CARDS`:

```js
role: 'Unit 1 Context Card',
```

and:

```js
role: 'Unit 1 Synthesis Card',
```

Change the unit-card string validation loop from:

```js
for (const field of ['title', 'summary', 'prompt']) {
```

to:

```js
for (const field of ['role', 'title', 'summary', 'prompt']) {
```

Insert unit identity as the first two properties of the existing frozen API, leaving its current `locationNumbers`, lookup methods, comparator, records, and cards byte-for-byte unchanged:

```js
unitId: 'u1',
unitNumber: 1,
```

- [ ] **Step 4: Run focused and full tests and confirm GREEN**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u1-location-study.test.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
```

Expected: all tests pass; the current full baseline of 87 tests increases by the new role-rejection test.

- [ ] **Step 5: Commit the compatibility change**

```bash
git add data/apwh-u1-location-study.js tests/apwh-u1-location-study.test.mjs
git commit -m "refactor: expose generic Unit 1 study metadata"
```

### Task 2: Create the exact immutable Unit 2 data layer and source ledger

**Files:**
- Create: `tests/apwh-u2-location-study.test.mjs`
- Create: `data/apwh-u2-location-study.js`
- Create: `docs/data-sources/apwh-u2-location-study-source-ledger.md`

- [ ] **Step 1: Create the failing Unit 2 test harness and exact manifest**

Create `tests/apwh-u2-location-study.test.mjs` with the same real-module and source-mutation harness used by Unit 1, but target `APWH_U2_LOCATION_STUDY`:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

await import('../data/apwh-u2-location-study.js');

const api = globalThis.APWH_U2_LOCATION_STUDY;
const dataModuleSource = readFileSync(
  new URL('../data/apwh-u2-location-study.js', import.meta.url),
  'utf8',
);
const ledgerSource = readFileSync(
  new URL('../docs/data-sources/apwh-u2-location-study-source-ledger.md', import.meta.url),
  'utf8',
);
const replaceDataSource = (label, search, replacement) => {
  const malformedSource = dataModuleSource.replace(search, replacement);
  assert.notEqual(malformedSource, dataModuleSource, `${label} fixture mutation`);
  return malformedSource;
};
const assertDataModuleError = (label, malformedSource, expectedMessage) => {
  assert.throws(() => runInNewContext(malformedSource, {}), error => {
    assert.equal(error.message, expectedMessage, `${label} diagnostic`);
    return true;
  });
};
```

Use this exact manifest fixture:

```js
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
```

Define the complete record key contract:

```js
const recordKeys = [
  'causeStudyPointIds', 'connectionNotes', 'dateLabel', 'effectStudyPointIds', 'endYear',
  'evidence', 'examConnection', 'examSkills', 'id', 'keyPeople', 'keyTerms', 'locationNumber',
  'mainEventKey', 'relatedStudyPointIds', 'sequence', 'significance', 'source', 'startYear',
  'summary', 'themeIds', 'title', 'topicCodes',
];
```

Test exact API identity, count, six locations, and three records each:

```js
test('publishes the exact Unit 2 location-study manifest', () => {
  assert.equal(api.unitId, 'u2');
  assert.equal(api.unitNumber, 2);
  assert.deepEqual([...api.locationNumbers], ['2', '8', '9', '10', '84', '85']);
  assert.equal(api.records.length, 18);
  for (const number of api.locationNumbers) assert.equal(api.getByLocation(number).length, 3, number);
  assert.deepEqual(api.records.map(record => [
    record.id, record.locationNumber, record.sequence, record.title, record.dateLabel,
    record.startYear, record.endYear, record.mainEventKey, [...record.topicCodes],
    [...record.themeIds], [...record.examSkills],
  ]), expectedManifest);
  for (const record of api.records) assert.deepEqual(Object.keys(record).sort(), recordKeys);
});
```

- [ ] **Step 2: Lock exact Unit 2 cards and learner-content quality**

Use this exact fixture:

```js
const expectedUnitCards = {
  context: {
    id: 'apwh-u2-context-networks-ready-to-expand',
    kind: 'context',
    role: 'Unit 2 Context Card',
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
    id: 'apwh-u2-synthesis-network-expansion-consequences',
    kind: 'synthesis',
    role: 'Unit 2 Synthesis Card',
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
```

Add tests that deep-equal `api.unitCards`, prove `getUnitCard()` is own-property-safe for `toString`, `constructor`, and `__proto__`, keep cards outside `records/getByLocation`, and freeze cards, skills, and takeaways.

For every ordinary record, test:

```js
assert.doesNotMatch(JSON.stringify(record), /[\u3400-\u9fff]/);
assert.ok(record.significance.length >= 60);
assert.ok(record.examConnection.length >= 60);
assert.ok(record.keyPeople.length >= 1);
assert.ok(record.keyTerms.length >= 2);
assert.ok(record.evidence.length >= 2);
assert.equal(new Set(record.examSkills).size, record.examSkills.length);
assert.ok(record.examSkills.length >= 1 && record.examSkills.length <= 2);
```

- [ ] **Step 3: Lock the exact graph and source-ledger coverage**

Use these exact causal edges and notes:

```js
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
```

Use these exact related pairs and notes:

```js
const expectedRelatedPairs = new Map([
  ['apwh-u2-karakorum-yam-relay-cross-cultural-transfer|apwh-u2-samarkand-timurid-commercial-learning-hub', 'Both cases show that commercial routes also moved specialists and knowledge, although one was an imperial relay and the other an urban center.'],
  ['apwh-u2-malacca-monsoon-navigation-maritime-technology|apwh-u2-samarkand-bills-exchange-banking-houses', 'Maritime technology reduced transport uncertainty while financial instruments reduced payment risk; both lowered the cost of exchange.'],
  ['apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce|apwh-u2-malacca-strategic-port-state', 'Kilwa and Malacca both converted strategic access to maritime exchange into urban wealth and political power.'],
  ['apwh-u2-kilwa-swahili-cultural-synthesis|apwh-u2-malacca-merchant-diasporas-spread-islam', 'Resident Muslim merchants contributed to locally distinct forms of Islamic cultural change in Southeast Asia and the Swahili Coast.'],
  ['apwh-u2-cairo-mansa-musa-gold-shock|apwh-u2-nanjing-zheng-he-tributary-voyages', 'Mansa Musa and Zheng He used conspicuous long-distance movement to display state wealth and strengthen diplomatic or religious standing.'],
]);
```

Parse ledger IDs with:

```js
const ledgerIds = [...ledgerSource.matchAll(/^\| `(apwh-u2-[^`]+)` \|/gm)].map(match => match[1]);
assert.deepEqual(new Set(ledgerIds), new Set(expectedManifest.map(([id]) => id)));
assert.equal(ledgerIds.length, 18);
```

- [ ] **Step 4: Add failing validation fixtures**

Use source mutation to prove descriptive rejection of:

```js
const invalidFixtures = [
  ["locationNumber: '8'", "locationNumber: '999'", 'invalid locationNumber 999'],
  ["sequence: 1", "sequence: 4", 'invalid sequence 4'],
  ["examSkills: ['Causation', 'CCOT']", "examSkills: ['Causation', 'Argumentation']", 'invalid examSkill Argumentation'],
  ["mainEventKey: 'world-event-8-0'", "mainEventKey: 'world-event-8-99'", 'invalid mainEventKey world-event-8-99'],
  ["role: 'Unit 2 Context Card'", "role: ''", 'missing role'],
];
```

Add separate fixtures for duplicate record ID, a fourth record at one location, duplicate sequence at one location, missing/invalid topic and theme, Chinese text in a summary, missing source fields, two card takeaways, duplicate card kind/ID, unresolved/self/duplicate/cross-category/nonreciprocal graph links, missing/non-English/mismatched connection notes, and an extra note key. Every expected message names `Unit 2`, the offending record/card ID, and the violated rule.

- [ ] **Step 5: Run the new test and confirm RED**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u2-location-study.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `data/apwh-u2-location-study.js`. This is the correct initial RED because the public data module does not exist.

- [ ] **Step 6: Create the exact source ledger**

Create `docs/data-sources/apwh-u2-location-study-source-ledger.md` with this complete table:

```markdown
# APWH Unit 2 Location Study Source Ledger

This layer uses edition-neutral AMSCO AP World History Unit 2 topic locators and existing APWH map-event keys. The selected city is an anchor into a network; claims that concern another location identify that distinction in the study copy.

| Study ID | AP topic | Main event | Source locator | Claims covered |
|---|---|---|---|---|
| `apwh-u2-karakorum-mongol-unification-conquest` | Topics 2.2 and 2.7 | `world-event-8-0` | AMSCO AP World History, Unit 2, Topics 2.2 and 2.7 | Temujin's unification, conquest, cavalry organization, and the political consolidation of Eurasian routes |
| `apwh-u2-karakorum-pax-mongolica-protected-trade` | Topics 2.1, 2.2, and 2.7 | `world-event-8-0` | AMSCO AP World History, Unit 2, Topics 2.1, 2.2, and 2.7 | Pax Mongolica, protected trade, law enforcement, roads, and reduced commercial risk |
| `apwh-u2-karakorum-yam-relay-cross-cultural-transfer` | Topics 2.2 and 2.5 | `world-event-8-0` | AMSCO AP World History, Unit 2, Topics 2.2 and 2.5 | Relay stations, imperial communication, specialists, technologies, and cultural exchange |
| `apwh-u2-samarkand-caravanserai-merchant-infrastructure` | Topics 2.1 and 2.7 | `world-event-9-0` | AMSCO AP World History, Unit 2, Topics 2.1 and 2.7 | Caravanserai, camel transport, storage, lodging, and Silk Roads infrastructure |
| `apwh-u2-samarkand-bills-exchange-banking-houses` | Topics 2.1 and 2.7 | `world-event-9-0` | AMSCO AP World History, Unit 2, Topics 2.1 and 2.7 | Bills of exchange, flying cash, banking houses, credit, and reduced payment risk |
| `apwh-u2-samarkand-timurid-commercial-learning-hub` | Topics 2.1 and 2.5 | `world-event-9-0` | AMSCO AP World History, Unit 2, Topics 2.1 and 2.5 | Timurid Samarkand, commerce, Ulugh Beg, madrasas, scholarship, and cultural exchange |
| `apwh-u2-malacca-monsoon-navigation-maritime-technology` | Topics 2.3 and 2.7 | `world-event-2-1` | AMSCO AP World History, Unit 2, Topics 2.3 and 2.7 | Monsoon winds, lateen sails, compasses, astrolabes, and maritime predictability |
| `apwh-u2-malacca-strategic-port-state` | Topics 2.3 and 2.7 | `world-event-2-1` | AMSCO AP World History, Unit 2, Topics 2.3 and 2.7 | Strait of Malacca, port fees, naval protection, entrepot trade, and port-state power |
| `apwh-u2-malacca-merchant-diasporas-spread-islam` | Topics 2.3 and 2.5 | `world-event-2-1` | AMSCO AP World History, Unit 2, Topics 2.3 and 2.5 | Merchant residence, intermarriage, diaspora communities, Islam, and local adaptation |
| `apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce` | Topics 2.3 and 2.7 | `world-event-85-0` | AMSCO AP World History, Unit 2, Topics 2.3 and 2.7 | Swahili city-states, Indian Ocean commerce, port wealth, imported goods, and coastal authority |
| `apwh-u2-kilwa-gold-ivory-regional-specialization` | Topics 2.3 and 2.7 | `world-event-85-0` | AMSCO AP World History, Unit 2, Topics 2.3 and 2.7 | Gold and ivory exports, Great Zimbabwe and Sofala linkages, regional specialization, and exchange |
| `apwh-u2-kilwa-swahili-cultural-synthesis` | Topics 2.3 and 2.5 | `world-event-85-0` | AMSCO AP World History, Unit 2, Topics 2.3 and 2.5 | Swahili language, Bantu and Arabic influences, Islam, mosques, and cultural synthesis |
| `apwh-u2-cairo-trans-saharan-gold-camel-caravans` | Topics 2.4 and 2.7 | `world-event-84-0` | AMSCO AP World History, Unit 2, Topics 2.4 and 2.7 | Camel caravans, saddle technology, gold, salt, textiles, horses, and North African markets |
| `apwh-u2-cairo-mansa-musa-gold-shock` | Topics 2.4 and 2.5 | `world-event-84-0` | AMSCO AP World History, Unit 2, Topics 2.4 and 2.5 | Mansa Musa's 1324 hajj, gold distribution in Cairo, Mali's wealth, Islam, and prestige |
| `apwh-u2-cairo-black-death-demographic-change` | Topic 2.6 | `world-event-84-0` | AMSCO AP World History, Unit 2, Topic 2.6 | Plague transmission through exchange networks, mortality, labor scarcity, and demographic change |
| `apwh-u2-nanjing-treasure-fleet-technology-scale` | Topics 2.3 and 2.7 | `world-event-10-3` | AMSCO AP World History, Unit 2, Topics 2.3 and 2.7 | Treasure-fleet scale, ship compartments, rudders, compasses, logistics, and state capacity |
| `apwh-u2-nanjing-zheng-he-tributary-voyages` | Topics 2.3 and 2.5 | `world-event-10-3` | AMSCO AP World History, Unit 2, Topics 2.3 and 2.5 | Zheng He's seven voyages, tribute diplomacy, Indian Ocean destinations, and prestige goods |
| `apwh-u2-nanjing-ming-maritime-retrenchment` | Topics 2.3 and 2.7 | `world-event-10-3` | AMSCO AP World History, Unit 2, Topics 2.3 and 2.7 | End of the voyages, court priorities, cost, maritime restrictions, and continuity of private exchange |
```

- [ ] **Step 7: Create the Unit 2 module constants, connections, and public API**

Begin `data/apwh-u2-location-study.js` with:

```js
(function publishUnit2LocationStudy(root) {
  'use strict';

  const UNIT_ID = 'u2';
  const UNIT_NUMBER = 2;
  const LOCATIONS = Object.freeze({
    '2': 'Malacca',
    '8': 'Karakorum',
    '9': 'Samarkand',
    '10': 'Nanjing',
    '84': 'Cairo',
    '85': 'Kilwa',
  });
  const VALID_TOPIC_CODES = new Set(['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7']);
  const VALID_THEME_IDS = new Set(['GOV', 'ECN', 'TEC', 'CDI', 'SIO', 'ENV']);
  const VALID_EXAM_SKILLS = new Set(['Causation', 'Comparison', 'CCOT', 'Contextualization']);
  const VALID_MAIN_EVENTS = new Set([
    'world-event-2-1', 'world-event-8-0', 'world-event-9-0',
    'world-event-10-3', 'world-event-84-0', 'world-event-85-0',
  ]);
```

Create a module-local `STUDY_MANIFEST` literal containing the same complete eighteen rows, in the same order, as the `expectedManifest` fixture in Step 1. It is intentionally duplicated across production and test so an accidental production edit cannot rewrite the test oracle. Derive `STUDY_CONTEXT` from that module-local constant only:

```js
const STUDY_CONTEXT = Object.freeze(Object.fromEntries(STUDY_MANIFEST.map(([
  id, locationNumber, sequence, title, dateLabel, startYear, endYear,
  mainEventKey, topicCodes, themeIds, examSkills,
]) => [id, Object.freeze({
  locationNumber,
  sequence,
  title,
  dateLabel,
  startYear,
  endYear,
  mainEventKey,
  topicCodes: Object.freeze([...topicCodes]),
  themeIds: Object.freeze([...themeIds]),
  examSkills: Object.freeze([...examSkills]),
})])));
```

Initialize every manifest ID in `CONNECTION_DATA`, then use `addCausalConnection()` and `addRelatedConnection()` to author exactly the edges from Step 3. Both functions must reject missing endpoints and self-links immediately and must write reciprocal category arrays plus one identical note on both records.

After freezing and validating the exact raw records from Step 8, publish:

```js
const api = Object.freeze({
  unitId: UNIT_ID,
  unitNumber: UNIT_NUMBER,
  locationNumbers: Object.freeze(Object.keys(LOCATIONS)),
  locationName(number) {
    const key = String(number);
    return Object.prototype.hasOwnProperty.call(LOCATIONS, key) ? LOCATIONS[key] : null;
  },
  getByLocation(number) { return [...(byLocation.get(String(number)) || [])]; },
  getById(id) { return byId.get(String(id)) || null; },
  getUnitCard(kind) {
    const key = String(kind);
    return Object.prototype.hasOwnProperty.call(UNIT_CARDS, key) ? UNIT_CARDS[key] : null;
  },
  compareRecords,
  records: STUDY_EVENTS,
  unitCards: UNIT_CARDS,
});

Object.defineProperty(root, 'APWH_U2_LOCATION_STUDY', {
  configurable: false,
  enumerable: true,
  writable: false,
  value: api,
});
})(globalThis);
```

Use this exact comparator so the approved pedagogical order is stable without changing historical dates:

```js
function compareRecords(a, b) {
  return a.startYear - b.startYear
    || a.endYear - b.endYear
    || a.sequence - b.sequence
    || a.id.localeCompare(b.id);
}
```

Validation must run before publishing and enforce all rules listed in the design specification. Use exact error prefixes:

```js
const failRecord = (record, rule) => {
  throw new Error(`Invalid Unit 2 study record ${record?.id || '(missing ID)'}: ${rule}`);
};
const failCard = (card, rule) => {
  throw new Error(`Invalid Unit 2 unit card ${card?.kind || '(missing kind)'} ${card?.id || '(missing ID)'}: ${rule}`);
};
```

Require exactly eighteen records, exactly the six location keys, exactly three records and sequences `1,2,3` at each location, exactly one context/synthesis card, exactly three takeaways per card, and at least one connection per record.

- [ ] **Step 8: Author the exact eighteen complete English records**

For each manifest row, create one raw record with the exact copy below. `topicCodes`, `themeIds`, `examSkills`, `sequence`, and graph fields are injected from validated constants before freezing; do not duplicate those arrays inside the raw content objects.

```js
const RAW_RECORDS = [
  {
    id: 'apwh-u2-karakorum-mongol-unification-conquest', locationNumber: '8', mainEventKey: 'world-event-8-0',
    title: 'Mongol Unification and Conquest', dateLabel: '1206–1227', startYear: 1206, endYear: 1227,
    summary: 'Temujin unified Mongol groups and used disciplined cavalry, mobility, and terror to build a conquest state across Eurasia.',
    significance: 'Conquest brought previously divided land routes under related Mongol authorities and created the political conditions for faster trade and communication.',
    keyPeople: [{ name: 'Genghis Khan', role: 'Unified Mongol groups in 1206 and directed conquests that connected territories from northern China toward Central and Southwest Asia.' }],
    keyTerms: [{ term: 'kurultai', explanation: 'An assembly of Mongol leaders that selected a khan and affirmed major political decisions.' }, { term: 'decimal organization', explanation: 'A military structure grouping warriors into units of tens, hundreds, thousands, and ten-thousands.' }],
    evidence: ['A 1206 kurultai recognized Temujin as Genghis Khan after he defeated rival Mongol groups.', 'Mongol forces conquered the Khwarazmian realm and linked Central Asian routes to a rapidly expanding empire.'],
    examConnection: 'Use Mongol unification as a political cause of expanded exchange, then explain the protection mechanism instead of treating conquest and trade as a simple sequence.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.2 and 2.7' },
  },
  {
    id: 'apwh-u2-karakorum-pax-mongolica-protected-trade', locationNumber: '8', mainEventKey: 'world-event-8-0',
    title: 'Pax Mongolica and Protected Trade', dateLabel: 'c. 1250–c. 1350', startYear: 1250, endYear: 1350,
    summary: 'Mongol authorities repaired routes, punished raiders, and protected merchants across a large portion of Eurasia.',
    significance: 'Lower protection costs allowed more merchants, envoys, and travelers to use overland routes and helped create a new high point in Silk Roads exchange.',
    keyPeople: [{ name: 'Mongol khans', role: 'Governed related khanates that protected routes, enforced laws, and supported movement across imperial boundaries.' }],
    keyTerms: [{ term: 'Pax Mongolica', explanation: 'The period of relative security and connectivity across Mongol-ruled Eurasia.' }, { term: 'protection cost', explanation: 'The risk and expense merchants face from robbery, war, tolls, and uncertain enforcement.' }],
    evidence: ['Mongol rulers repaired roads and used soldiers to protect commercial routes from raiders.', 'Merchants could cross territories governed by related Mongol states with more predictable rules and lower risk.'],
    examConnection: 'Use the Pax Mongolica to explain how political control caused trade growth by reducing risk, not merely by placing more territory under one empire.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.1, 2.2, and 2.7' },
  },
  {
    id: 'apwh-u2-karakorum-yam-relay-cross-cultural-transfer', locationNumber: '8', mainEventKey: 'world-event-8-0',
    title: 'The Yam Relay and Cross-Cultural Transfer', dateLabel: 'c. 1250–1368', startYear: 1250, endYear: 1368,
    summary: 'Relay stations and protected movement carried official messages, specialists, technologies, and knowledge across Mongol Eurasia.',
    significance: 'The same infrastructure used for imperial control accelerated cultural and technological transfer among China, Central Asia, the Islamic world, and Europe.',
    keyPeople: [{ name: 'Mongol relay riders', role: 'Moved messages and official travelers between staffed stations across long imperial distances.' }],
    keyTerms: [{ term: 'yam', explanation: 'The Mongol imperial relay network of stations, fresh horses, supplies, and authorized travelers.' }, { term: 'technology transfer', explanation: 'The movement and adaptation of technical knowledge between societies.' }],
    evidence: ['Relay stations provided fresh horses and supplies so official messages could move rapidly across the empire.', 'Paper, gunpowder knowledge, medical learning, and skilled workers traveled through intensified Eurasian contacts.'],
    examConnection: 'Use the yam to show that empire affected more than commerce: administrative infrastructure also changed the speed of cultural and technological exchange.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.2 and 2.5' },
  },
  {
    id: 'apwh-u2-samarkand-caravanserai-merchant-infrastructure', locationNumber: '9', mainEventKey: 'world-event-9-0',
    title: 'Caravanserai and Merchant Infrastructure', dateLabel: '1200–1450', startYear: 1200, endYear: 1450,
    summary: 'Caravanserai gave merchants recurring places to rest animals, store goods, obtain information, and conduct exchange along overland routes.',
    significance: 'A chain of predictable service nodes reduced the logistical cost of long journeys and made cities such as Samarkand more useful to interregional merchants.',
    keyPeople: [{ name: 'caravan merchants', role: 'Organized animals, guards, credit, and goods for long-distance movement between commercial cities.' }],
    keyTerms: [{ term: 'caravanserai', explanation: 'A fortified roadside lodging and commercial station serving merchants and pack animals.' }, { term: 'caravan', explanation: 'A group of travelers and pack animals moving together for security and logistical support.' }],
    evidence: ['Caravanserai supplied lodging, water, storage, and market space at recurring points along major routes.', 'Improved camel saddles allowed pack animals to carry heavier loads across arid terrain.'],
    examConnection: 'Use caravanserai as evidence that infrastructure caused network growth by lowering recurring transport and information costs for merchants.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.1 and 2.7' },
  },
  {
    id: 'apwh-u2-samarkand-bills-exchange-banking-houses', locationNumber: '9', mainEventKey: 'world-event-9-0',
    title: 'Bills of Exchange and Banking Houses', dateLabel: '1300–1450', startYear: 1300, endYear: 1450,
    summary: 'Credit instruments allowed merchants to transfer value without carrying the full payment in heavy coin across dangerous routes.',
    significance: 'Bills of exchange and banking houses reduced theft risk and connected commercial practices developed in Asia with expanding financial institutions farther west.',
    keyPeople: [{ name: 'merchant-bankers', role: 'Accepted deposits, verified written claims, extended credit, and converted commercial promises into payment.' }],
    keyTerms: [{ term: 'bill of exchange', explanation: 'A written order or promise to pay a specified person a specified amount at an agreed time.' }, { term: 'banking house', explanation: 'A commercial institution that accepted deposits, exchanged currencies, and provided credit or payment services.' }],
    evidence: ['Merchants could deposit value in one place and use written instruments to obtain payment elsewhere.', 'Banking houses expanded in European commercial cities during the 1300s as long-distance trade increased.'],
    examConnection: 'Compare bills of exchange with maritime technology: both expanded trade, but one reduced payment risk while the other reduced transport uncertainty.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.1 and 2.7' },
  },
  {
    id: 'apwh-u2-samarkand-timurid-commercial-learning-hub', locationNumber: '9', mainEventKey: 'world-event-9-0',
    title: 'Timurid Samarkand as a Commercial and Learning Hub', dateLabel: '1370–1450', startYear: 1370, endYear: 1450,
    summary: 'Timurid patronage made Samarkand a center where merchants, artisans, architects, and scholars from several regions met.',
    significance: 'The city demonstrates continuity between commercial connectivity and knowledge exchange even as conquest changed the rulers controlling Central Asian routes.',
    keyPeople: [{ name: 'Ulugh Beg', role: 'A Timurid ruler and patron of astronomy and education who sponsored a major madrasa in Samarkand.' }],
    keyTerms: [{ term: 'Timurid Empire', explanation: 'The Central Asian state founded by Timur that controlled important overland routes and cities.' }, { term: 'madrasa', explanation: 'An institution of advanced Islamic learning that could also support mathematics, astronomy, and law.' }],
    evidence: ['Timur made Samarkand his capital and drew skilled workers and cultural resources toward the city.', 'The Ulugh Beg Madrasa, built in the early 1400s, linked political patronage with scholarly activity.'],
    examConnection: 'Use Samarkand to explain continuity and change: conquest disrupted regions, yet rulers continued using trade cities to collect wealth and patronize learning.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.1 and 2.5' },
  },
```

Continue the same `RAW_RECORDS` array with the exact nine maritime records in Step 9 and the exact three Cairo records in Step 10.

- [ ] **Step 9: Author the exact Malacca, Kilwa, and Nanjing records**

Append these objects to `RAW_RECORDS`:

```js
  {
    id: 'apwh-u2-malacca-monsoon-navigation-maritime-technology', locationNumber: '2', mainEventKey: 'world-event-2-1',
    title: 'Monsoon Navigation and Maritime Technology', dateLabel: '1200–1450', startYear: 1200, endYear: 1450,
    summary: 'Knowledge of monsoon winds and improved sails, rudders, compasses, and astrolabes made Indian Ocean travel more predictable.',
    significance: 'Predictable seasons and better navigation allowed merchants to plan recurring voyages, carry heavier cargo, and connect distant ports at lower cost.',
    keyPeople: [{ name: 'Indian Ocean sailors', role: 'Combined seasonal wind knowledge with navigational instruments and ship designs suited to long-distance trade.' }],
    keyTerms: [{ term: 'monsoon winds', explanation: 'Seasonally reversing wind patterns that structured sailing schedules across the Indian Ocean.' }, { term: 'lateen sail', explanation: 'A triangular sail that helped ships maneuver across changing wind directions.' }],
    evidence: ['Sailors timed voyages around winds that blew from the northeast in one season and the southwest in another.', 'Compasses, astrolabes, sternpost rudders, and compartmentalized ships improved direction, control, and cargo security.'],
    examConnection: 'Use monsoon knowledge and ship technology as causal evidence for Indian Ocean growth, then distinguish predictable timing from political protection.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7' },
  },
  {
    id: 'apwh-u2-malacca-strategic-port-state', locationNumber: '2', mainEventKey: 'world-event-2-1',
    title: 'Malacca as a Strategic Port State', dateLabel: 'c. 1400–1450', startYear: 1400, endYear: 1450,
    summary: 'Malacca used its position on a narrow maritime passage to tax ships, protect traffic, and become a major commercial entrepot.',
    significance: 'The port converted predictable trade flows into public revenue and naval power, showing how states could grow from exchange rather than agricultural production.',
    keyPeople: [{ name: 'Malaccan sultans', role: 'Collected port revenue, protected the strait, and governed a commercial state serving merchants from many regions.' }],
    keyTerms: [{ term: 'entrepot', explanation: 'A port where merchants unload, store, exchange, and re-export goods from multiple regions.' }, { term: 'Strait of Malacca', explanation: 'The narrow passage linking the Indian Ocean with the South China Sea and East Asian markets.' }],
    evidence: ['Malacca charged ships using the strait and used revenue to support protection against piracy.', 'Its prosperity depended primarily on trade and services rather than farming, mining, or large-scale manufacturing.'],
    examConnection: 'Compare Malacca with Kilwa to explain how strategic ports converted maritime traffic into political authority through different local institutions.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7' },
  },
  {
    id: 'apwh-u2-malacca-merchant-diasporas-spread-islam', locationNumber: '2', mainEventKey: 'world-event-2-1',
    title: 'Merchant Diasporas and the Spread of Islam', dateLabel: 'c. 1400–1450', startYear: 1400, endYear: 1450,
    summary: 'Muslim merchants who remained in Southeast Asian ports formed communities, married locally, and helped Islam gain influence without military conquest.',
    significance: 'Diaspora settlement turned waiting time and commercial trust into long-term cultural change while local societies adapted Islam to existing traditions.',
    keyPeople: [{ name: 'Muslim merchant communities', role: 'Maintained commercial and religious ties while establishing households and institutions in Southeast Asian ports.' }],
    keyTerms: [{ term: 'diaspora', explanation: 'A community living away from its place of origin while preserving social, cultural, or commercial connections.' }, { term: 'syncretism', explanation: 'The combination or adaptation of elements drawn from different cultural and religious traditions.' }],
    evidence: ['Merchants often stayed in ports for months while waiting for monsoon winds and sometimes established permanent households.', 'Islam spread through commercial relationships, intermarriage, and local rulers rather than a single campaign of conquest.'],
    examConnection: 'Use Malacca to explain how exchange caused cultural change, while noting that adoption remained selective and local traditions continued.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.5' },
  },
  {
    id: 'apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce', locationNumber: '85', mainEventKey: 'world-event-85-0',
    title: 'Swahili City-States and Indian Ocean Commerce', dateLabel: '1000–1450', startYear: 1000, endYear: 1450,
    summary: 'Kilwa and other Swahili city-states connected East African producers with merchants from Arabia, Persia, India, and China.',
    significance: 'Commercial access supported autonomous coastal cities whose rulers and merchants accumulated wealth without controlling a single territorial empire.',
    keyPeople: [{ name: 'Swahili merchant elites', role: 'Managed coastal trade, maintained overseas relationships, and sponsored urban construction and Islamic institutions.' }],
    keyTerms: [{ term: 'city-state', explanation: 'An independent political community centered on a city and its surrounding territory.' }, { term: 'Indian Ocean network', explanation: 'The maritime exchange system connecting East Africa, Southwest Asia, South Asia, Southeast Asia, and East Asia.' }],
    evidence: ['Kilwa exported African goods and imported Indian textiles, Chinese ceramics, and products from Southwest Asia.', 'Commercial wealth supported coral-stone houses and mosques in coastal cities.'],
    examConnection: 'Compare Swahili city-states with Malacca to show how maritime exchange supported different forms of port-based political power.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7' },
  },
  {
    id: 'apwh-u2-kilwa-gold-ivory-regional-specialization', locationNumber: '85', mainEventKey: 'world-event-85-0',
    title: 'Gold, Ivory, and Regional Specialization', dateLabel: '1200–1450', startYear: 1200, endYear: 1450,
    summary: 'Kilwa linked inland supplies of gold and ivory to overseas demand and exchanged them for manufactured and luxury goods.',
    significance: 'Long-distance demand encouraged regions to specialize in goods they could supply competitively and tied coastal prosperity to inland production and transport.',
    keyPeople: [{ name: 'East African traders', role: 'Moved inland commodities toward coastal markets and distributed imported goods back through regional networks.' }],
    keyTerms: [{ term: 'regional specialization', explanation: 'The concentration of production in goods a region can supply effectively for exchange.' }, { term: 'hinterland', explanation: 'The inland zone connected economically to a port through production, transport, and markets.' }],
    evidence: ['Gold from the Great Zimbabwe region moved through ports such as Sofala and into the wider coastal trade served by Kilwa.', 'Ivory and other African exports were exchanged for textiles, ceramics, metal goods, and luxury products.'],
    examConnection: 'Use Kilwa to explain how expanding networks changed production by rewarding regional specialization and linking inland economies to maritime demand.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7' },
  },
  {
    id: 'apwh-u2-kilwa-swahili-cultural-synthesis', locationNumber: '85', mainEventKey: 'world-event-85-0',
    title: 'Swahili Cultural Synthesis', dateLabel: '1200–1450', startYear: 1200, endYear: 1450,
    summary: 'Coastal East Africans combined Bantu linguistic and social foundations with Islamic belief and vocabulary associated with overseas contact.',
    significance: 'Swahili culture shows that network expansion produced locally distinct synthesis rather than replacing African identities with a uniform imported culture.',
    keyPeople: [{ name: 'Swahili coastal communities', role: 'Adapted Islamic institutions and overseas influences within Bantu-speaking urban societies.' }],
    keyTerms: [{ term: 'Swahili', explanation: 'A Bantu language and coastal culture shaped partly by long contact with Arabic-speaking and Muslim merchants.' }, { term: 'cultural synthesis', explanation: 'A new cultural pattern formed by combining selected elements from interacting traditions.' }],
    evidence: ['Swahili vocabulary incorporated Arabic terms while retaining Bantu grammatical foundations.', 'Coastal elites built mosques and participated in Islam while local languages, kinship, and regional practices continued.'],
    examConnection: 'Compare Swahili synthesis with Islam in Malacca to explain shared merchant influence and different local cultural outcomes.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.5' },
  },
  {
    id: 'apwh-u2-nanjing-treasure-fleet-technology-scale', locationNumber: '10', mainEventKey: 'world-event-10-3',
    title: 'Treasure-Fleet Technology and Scale', dateLabel: '1405–1433', startYear: 1405, endYear: 1433,
    summary: 'Ming shipbuilding, navigational knowledge, and state logistics supported fleets far larger than ordinary merchant voyages.',
    significance: 'The fleet demonstrates how accumulated maritime technology produced exceptional reach when combined with taxation, labor, and direct imperial sponsorship.',
    keyPeople: [{ name: 'Ming shipbuilders and sailors', role: 'Built, supplied, navigated, and maintained the ships used in state-sponsored Indian Ocean expeditions.' }],
    keyTerms: [{ term: 'treasure fleet', explanation: 'The large state-sponsored Ming fleets sent through the Indian Ocean under Zheng He.' }, { term: 'watertight compartment', explanation: 'An internal ship division that limited flooding and protected cargo if part of the hull was damaged.' }],
    evidence: ['The expeditions used hundreds of vessels and tens of thousands of personnel at their greatest scale.', 'Compasses, sternpost rudders, compartmentalized hulls, and extensive provisioning supported long-distance movement.'],
    examConnection: 'Use the treasure fleets to explain how technology becomes historically significant when a state mobilizes resources to apply it at scale.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7' },
  },
  {
    id: 'apwh-u2-nanjing-zheng-he-tributary-voyages', locationNumber: '10', mainEventKey: 'world-event-10-3',
    title: "Zheng He's Tributary Voyages", dateLabel: '1405–1433', startYear: 1405, endYear: 1433,
    summary: 'Zheng He led seven Ming expeditions that exchanged gifts, received envoys, and displayed imperial power across the Indian Ocean.',
    significance: 'The voyages intensified diplomatic and commercial contact without creating a territorial maritime empire like later European ventures.',
    keyPeople: [{ name: 'Zheng He', role: 'A Muslim eunuch admiral who commanded seven Ming voyages to Southeast Asia, South Asia, Arabia, and East Africa.' }],
    keyTerms: [{ term: 'tribute system', explanation: 'A diplomatic framework in which foreign envoys offered gifts and received recognition and valuable returns from the Chinese court.' }, { term: 'maritime diplomacy', explanation: 'The use of naval travel, gifts, envoys, and displays of force to manage relationships across the sea.' }],
    evidence: ['Seven voyages reached ports in Southeast Asia, South Asia, Arabia, and the East African coast.', 'The fleets transported envoys and prestige goods and returned with tribute, including unfamiliar animals such as giraffes.'],
    examConnection: 'Compare Zheng He with Mansa Musa as examples of rulers using long-distance movement and wealth to increase prestige without pursuing identical goals.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.5' },
  },
  {
    id: 'apwh-u2-nanjing-ming-maritime-retrenchment', locationNumber: '10', mainEventKey: 'world-event-10-3',
    title: 'Ming Maritime Retrenchment', dateLabel: '1433–1450', startYear: 1433, endYear: 1450,
    summary: 'After the final voyage, Ming rulers ended the treasure-fleet program and redirected resources toward domestic and northern priorities.',
    significance: 'Retrenchment shows that network participation depended on political choices: commercial demand continued even when direct state sponsorship declined.',
    keyPeople: [{ name: 'Ming court officials', role: 'Debated the cost and social value of maritime expeditions and supported policies that limited state-sponsored sailing.' }],
    keyTerms: [{ term: 'maritime retrenchment', explanation: 'A deliberate reduction in state-sponsored overseas activity and naval investment.' }, { term: 'Confucian bureaucracy', explanation: 'The scholar-official administration whose priorities often emphasized agrarian order and restrained imperial expenditure.' }],
    evidence: ['No new treasure-fleet expedition followed the seventh voyage ending in 1433.', 'Court critics questioned the expense and value of the voyages while the state concentrated resources elsewhere.'],
    examConnection: 'Use Ming retrenchment for continuity and change: private demand and Indian Ocean exchange continued, but the Chinese state changed its level of support.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7' },
  },
```

- [ ] **Step 10: Author the exact Cairo records and Unit 2 cards**

Append these final record objects and close `RAW_RECORDS`:

```js
  {
    id: 'apwh-u2-cairo-trans-saharan-gold-camel-caravans', locationNumber: '84', mainEventKey: 'world-event-84-0',
    title: 'Trans-Saharan Gold and Camel-Caravan Trade', dateLabel: '1200–1450', startYear: 1200, endYear: 1450,
    summary: 'Camel caravans connected West African gold producers and states with North African markets, including the commercial world represented by Cairo.',
    significance: 'Transport technology and organized caravans made desert exchange profitable and linked Mali to wider Islamic and Mediterranean demand without making Cairo the route origin.',
    keyPeople: [{ name: 'Berber and Muslim caravan merchants', role: 'Organized camel transport, commercial trust, and exchange between West Africa and North African markets.' }],
    keyTerms: [{ term: 'camel saddle', explanation: 'Equipment adapted to pack or riding camels that increased useful loads and control in desert travel.' }, { term: 'trans-Saharan trade', explanation: 'Caravan exchange connecting West Africa with North Africa across the Sahara.' }],
    evidence: ['Caravans moved West African gold northward and carried salt, textiles, horses, and other goods southward.', 'Camel transport and coordinated stopping points allowed merchants to cross long arid distances with bulk goods.'],
    examConnection: 'Compare trans-Saharan caravans with Indian Ocean shipping by explaining how different environments required different transport solutions for network growth.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.4 and 2.7' },
  },
  {
    id: 'apwh-u2-cairo-mansa-musa-gold-shock', locationNumber: '84', mainEventKey: 'world-event-84-0',
    title: "Mansa Musa's Gold Shock", dateLabel: '1324', startYear: 1324, endYear: 1324,
    summary: "Mansa Musa distributed large quantities of gold in Cairo during his hajj, making Mali's wealth visible far beyond West Africa.",
    significance: 'The episode demonstrates how a trans-Saharan network carried wealth, reputation, religious affiliation, and economic effects between distant regions.',
    keyPeople: [{ name: 'Mansa Musa', role: 'The Mali ruler whose 1324 pilgrimage displayed gold wealth and strengthened connections with the wider Islamic world.' }],
    keyTerms: [{ term: 'hajj', explanation: 'The pilgrimage to Mecca required of Muslims who are able to undertake it.' }, { term: 'gold shock', explanation: 'A sudden increase in available gold that lowers its local value relative to goods and other money.' }],
    evidence: ['Mansa Musa traveled through Cairo with a large entourage and distributed gold during the journey.', 'Contemporary and later accounts associated his spending with a prolonged decline in the local value of gold.'],
    examConnection: 'Use the Cairo episode to contextualize Mali inside Islamic and Mediterranean exchange rather than presenting West Africa as isolated.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.4 and 2.5' },
  },
  {
    id: 'apwh-u2-cairo-black-death-demographic-change', locationNumber: '84', mainEventKey: 'world-event-84-0',
    title: 'Black Death and Demographic Change', dateLabel: '1347–1351', startYear: 1347, endYear: 1351,
    summary: 'Plague traveled through commercial and military connections and caused severe mortality in Egypt and other densely connected regions.',
    significance: 'The pandemic reveals the biological cost of connectivity and changed labor supply, settlement, production, and state revenue across affected societies.',
    keyPeople: [{ name: 'Ibn Khaldun', role: 'A North African scholar who described plague-era population loss and its effects on cities, institutions, and political power.' }],
    keyTerms: [{ term: 'Black Death', explanation: 'The fourteenth-century plague pandemic that spread across much of Afro-Eurasia.' }, { term: 'demographic change', explanation: 'A major shift in population size, distribution, mortality, or age structure.' }],
    evidence: ['Plague reached Egypt through the connected Mediterranean and Red Sea commercial world during the late 1340s.', 'Mass mortality reduced the number of workers and taxpayers and disrupted production and urban life.'],
    examConnection: 'Use plague to explain an environmental consequence of exchange and trace the mechanism from network density to transmission and demographic change.',
    source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topic 2.6' },
  },
];
```

Create `UNIT_CARDS` by freezing the exact `expectedUnitCards` content from Step 2. Do not put cards in `RAW_RECORDS`, `STUDY_EVENTS`, `byId`, or `byLocation`.

- [ ] **Step 11: Freeze, validate, and index the Unit 2 data**

`freezeRecord()` must defensively copy and freeze every nested collection:

```js
return Object.freeze({
  ...record,
  sequence: context.sequence,
  topicCodes: Object.freeze([...context.topicCodes]),
  themeIds: Object.freeze([...context.themeIds]),
  examSkills: Object.freeze([...context.examSkills]),
  causeStudyPointIds: Object.freeze([...connections.causeStudyPointIds]),
  effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds]),
  relatedStudyPointIds: Object.freeze([...connections.relatedStudyPointIds]),
  connectionNotes: Object.freeze({ ...connections.connectionNotes }),
  keyPeople: Object.freeze(record.keyPeople.map(person => Object.freeze({ ...person }))),
  keyTerms: Object.freeze(record.keyTerms.map(term => Object.freeze({ ...term }))),
  evidence: Object.freeze([...record.evidence]),
  source: Object.freeze({ ...record.source }),
});
```

Create `STUDY_EVENTS` in exact manifest order even though the authoring steps append Cairo after Nanjing:

```js
const rawById = new Map(RAW_RECORDS.map(record => [record.id, record]));
const STUDY_EVENTS = Object.freeze(STUDY_MANIFEST.map(([id]) => freezeRecord(rawById.get(id))));
```

Then create `byId` and frozen `byLocation` arrays sorted by `compareRecords`. Validate raw-record uniqueness and completeness before this mapping, and validate the frozen graph/content before defining the browser global. Reject any global overwrite by using `Object.defineProperty` exactly as shown in Step 7.

- [ ] **Step 12: Run Unit 2, Unit 1, and full tests and confirm GREEN**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u2-location-study.test.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u1-location-study.test.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
git diff --check
```

Expected: all Unit 2 tests pass, all Unit 1 compatibility tests pass, and the full suite has zero failures.

- [ ] **Step 13: Commit the Unit 2 data layer**

```bash
git add data/apwh-u2-location-study.js tests/apwh-u2-location-study.test.mjs docs/data-sources/apwh-u2-location-study-source-ledger.md
git commit -m "feat: add Unit 2 location study data"
```

### Task 3: Specify the complete Unit 2 browser contract before changing UI code

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Parameterize the existing bookend verifier with exact content**

Move the current hard-coded Unit 1 `bookendContent` array to a top-level frozen constant named `UNIT_1_BOOKEND_CONTENT`. Add this exact Unit 2 constant:

```js
const UNIT_2_BOOKEND_CONTENT = Object.freeze([
  Object.freeze({
    name: 'Context',
    role: 'Unit 2 Context Card',
    title: 'Networks Ready to Expand',
    summary: 'By c. 1200, expanding states, commercial cities, and accumulated transport technologies had created the demand and infrastructure for long-distance exchange.',
    skills: Object.freeze(['Contextualization', 'Causation']),
    prompt: 'As you study Unit 2, identify which conditions already existed by 1200 and which new political or commercial changes made exchange grow.',
    takeaways: Object.freeze([
      'Unit 1 states generated agricultural surpluses, commercial cities, and specialized goods sought beyond local markets.',
      'Caravan routes and monsoon seas already linked regions, but distance, insecurity, and payment remained expensive.',
      'Merchant communities and shared legal or religious practices made exchange with strangers more predictable.',
    ]),
  }),
  Object.freeze({
    name: 'Synthesis',
    role: 'Unit 2 Synthesis Card',
    title: 'Why Networks Expanded—and What They Carried',
    summary: 'From 1200 to 1450, lower transport, payment, and protection costs expanded exchange, while the same networks moved beliefs, technologies, crops, and pathogens.',
    skills: Object.freeze(['Comparison', 'CCOT']),
    prompt: 'Compare at least two networks: which mechanisms produced growth in both, and which consequences depended on geography or political control?',
    takeaways: Object.freeze([
      'Mongol protection and commercial instruments reduced risk across land routes.',
      'Monsoon knowledge, larger ships, and port states increased the volume and predictability of maritime exchange.',
      'Greater connectivity produced cultural synthesis and economic growth, but also disease transmission and environmental strain.',
    ]),
  }),
]);
```

Change the helper signature to:

```js
async function assertUnitStudyBookends(page, view, label, {
  bookendContent = UNIT_1_BOOKEND_CONTENT,
  stateSnapshot = null,
  expectedSelectedLocation = null,
} = {}) {
```

Replace the fixed skill matrix with `bookendContent.map(content => content.skills)`. Preserve all current Unit 1 calls and behavior.

- [ ] **Step 2: Add the exact Unit 2 view manifest and reusable opener**

Add:

```js
const UNIT_2_STUDY_VIEWS = Object.freeze([
  Object.freeze({ number: '8', region: 'mideast', location: 'Karakorum', mainEventKey: 'world-event-8-0', ids: Object.freeze([
    'apwh-u2-karakorum-mongol-unification-conquest',
    'apwh-u2-karakorum-pax-mongolica-protected-trade',
    'apwh-u2-karakorum-yam-relay-cross-cultural-transfer',
  ]) }),
  Object.freeze({ number: '9', region: 'mideast', location: 'Samarkand', mainEventKey: 'world-event-9-0', ids: Object.freeze([
    'apwh-u2-samarkand-caravanserai-merchant-infrastructure',
    'apwh-u2-samarkand-bills-exchange-banking-houses',
    'apwh-u2-samarkand-timurid-commercial-learning-hub',
  ]) }),
  Object.freeze({ number: '2', region: 'asia', location: 'Malacca', mainEventKey: 'world-event-2-1', ids: Object.freeze([
    'apwh-u2-malacca-monsoon-navigation-maritime-technology',
    'apwh-u2-malacca-strategic-port-state',
    'apwh-u2-malacca-merchant-diasporas-spread-islam',
  ]) }),
  Object.freeze({ number: '85', region: 'africa', location: 'Kilwa', mainEventKey: 'world-event-85-0', ids: Object.freeze([
    'apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce',
    'apwh-u2-kilwa-gold-ivory-regional-specialization',
    'apwh-u2-kilwa-swahili-cultural-synthesis',
  ]) }),
  Object.freeze({ number: '84', region: 'mideast', location: 'Cairo', mainEventKey: 'world-event-84-0', ids: Object.freeze([
    'apwh-u2-cairo-trans-saharan-gold-camel-caravans',
    'apwh-u2-cairo-mansa-musa-gold-shock',
    'apwh-u2-cairo-black-death-demographic-change',
  ]) }),
  Object.freeze({ number: '10', region: 'asia', location: 'Nanjing', mainEventKey: 'world-event-10-3', ids: Object.freeze([
    'apwh-u2-nanjing-treasure-fleet-technology-scale',
    'apwh-u2-nanjing-zheng-he-tributary-voyages',
    'apwh-u2-nanjing-ming-maritime-retrenchment',
  ]) }),
]);
```

Add this standalone helper:

```js
async function openStandaloneUnit2Study(page, fixture) {
  await page.evaluate(({ number, region, mainEventKey }) => {
    window.__mapFilter.setLearningView('map');
    window.__mapFilter.setPeriod('u2');
    window.__mapFilter.openEventInMap(number, region, mainEventKey);
  }, fixture);
  const entry = page.locator(`#eventPanel [data-location-study-open="${fixture.number}"]`);
  await expectVisible(entry, `${fixture.location} Unit 2 event panel must expose its study entry`);
  assert.equal((await entry.innerText()).trim(), 'View all 3 study points');
  await entry.click();
  const view = page.locator(`#eventPanel [data-location-study-view="${fixture.number}"][data-location-study-unit="u2"]`);
  await expectVisible(view, `${fixture.location} Unit 2 study view must open`);
  return view;
}
```

- [ ] **Step 3: Assert all six standalone Unit 2 views**

For each fixture:

```js
const view = await openStandaloneUnit2Study(page, fixture);
assert.equal((await view.locator('.location-study-title').innerText()).trim(),
  `${fixture.location} · Unit 2`);
assert.match((await view.locator('.location-study-context').innerText()).trim(), /\b3 study points\b/);
assert.deepEqual(await view.locator('[data-study-event]').evaluateAll(nodes =>
  nodes.map(node => node.dataset.studyEvent)), fixture.ids);
assert.equal(await view.locator('[data-study-detail]').count(), 1);
assert.equal((await view.locator('.location-study-eyebrow').first().innerText()).trim(),
  'Unit 2 study point');
assert.doesNotMatch(await view.innerText(), /[\u3400-\u9fff]/);
```

For Karakorum, call:

```js
await assertUnitStudyBookends(page, view, 'standalone Karakorum Unit 2', {
  bookendContent: UNIT_2_BOOKEND_CONTENT,
  stateSnapshot: () => standaloneLocationStudyStateSnapshot(page),
  expectedSelectedLocation: '8',
});
```

Assert the first Karakorum detail exposes exact topics `Topic 2.2`, `Topic 2.7`, theme `GOV`, and skills `Causation`, `CCOT`. At every other anchor, expand each row once and collect all eighteen unique IDs; ensure every view maintains one-at-a-time expansion.

- [ ] **Step 4: Assert Unit switching and stale-state cleanup**

Starting from an open, non-default Unit 2 Samarkand record and one open supporting disclosure:

```js
await page.evaluate(() => window.__mapFilter.setPeriod('u1'));
assert.equal(await page.locator('#eventPanel [data-location-study-view]').count(), 0);
assert.equal((await page.evaluate(() => window.__mapFilter.getLocationStudyUiState().unitId)), null);
```

Open Unit 1 Hangzhou and assert its heading, `Unit 1` card roles, and default first-record expansion. Switch back to Unit 2 Karakorum and assert no Samarkand ID or open supporting disclosure remains. Switch to `u3` and assert no `[data-location-study-open]`, `[data-location-study-view]`, or `[data-study-unit-card]` remains.

- [ ] **Step 5: Assert all six homepage mirrors**

For each fixture, drive the iframe through `#hostPeriod` and `#hostSearch`, click the exact cloned result by `data-event-key`, open the cloned study entry, and assert:

```js
const view = page.locator(`#home-events [data-location-study-view="${fixture.number}"][data-location-study-unit="u2"]`);
assert.equal((await view.locator('.location-study-title').innerText()).trim(),
  `${fixture.location} · Unit 2`);
assert.deepEqual(await view.locator('[data-study-event]').evaluateAll(nodes =>
  nodes.map(node => node.dataset.studyEvent)), fixture.ids);
assert.match((await view.locator('.location-study-context').innerText()).trim(), /\b3 study points\b/);
```

Call `assertUnitStudyBookends()` with `UNIT_2_BOOKEND_CONTENT` on the homepage Karakorum view. Verify the cloned first Karakorum event's exact topics, theme, and Exam Skills. Verify the parent-page delegated click handlers still toggle events, follow a Unit 2 connection, return with focus/scroll restoration, and close back to ordinary Unit 2 events.

- [ ] **Step 6: Assert the widened-panel responsive range with long Unit 2 content**

Reuse the existing width loop for the open Karakorum Context card and add an open Cairo Black Death detail with Evidence and Connections expanded. At `380`, `410`, and `430` CSS px, assert requested/effective width within one pixel and `scrollWidth <= clientWidth + 1` for the study view, panel, every evidence item, every connection, and the page. Run this for standalone and homepage at least once each. Do not alter the outer workspace-width assertions.

- [ ] **Step 7: Run the verifier and confirm RED**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: FAIL at the first Unit 2 assertion because `world-map.html` does not load `data/apwh-u2-location-study.js` and Unit 2 exposes no location-study entry. It must not fail from syntax, server, or cleanup errors.

- [ ] **Step 8: Run static tests and commit the failing browser contract**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
git diff --check
git add scripts/verify-world-timeline.mjs
git commit -m "test: specify Unit 2 location study UI"
```

Expected: every static data test passes; the browser verifier remains intentionally RED for missing Unit 2 UI.

### Task 4: Load Unit 2 and make both renderers active-Unit aware

**Files:**
- Modify: `world-map.html`
- Modify: `index.html`

- [ ] **Step 1: Load the Unit 2 data module**

Immediately after the Unit 1 script in `world-map.html`, add:

```html
<script src="data/apwh-u2-location-study.js"></script>
```

Do not load either data module directly in `index.html`; the homepage continues to read the iframe's canonical globals.

- [ ] **Step 2: Add one active-Unit API resolver in the standalone map**

Near `locationStudyState`, add:

```js
const LOCATION_STUDY_GLOBAL_BY_UNIT = Object.freeze({
  u1: 'APWH_U1_LOCATION_STUDY',
  u2: 'APWH_U2_LOCATION_STUDY',
});

function locationStudyApiForUnit(unitId) {
  const globalName = LOCATION_STUDY_GLOBAL_BY_UNIT[String(unitId || '')];
  if (!globalName || !Object.prototype.hasOwnProperty.call(window, globalName)) return null;
  const api = window[globalName];
  return api && api.unitId === unitId && Number.isInteger(api.unitNumber) ? api : null;
}

function activeLocationStudyApi() {
  return locationStudyApiForUnit(getActivePeriod());
}
```

Add `unitId: null` to `locationStudyState`. Set it to `null` in `clearLocationStudyState()` and expose it from `getLocationStudyUiState()`.

- [ ] **Step 3: Generalize record discovery and entry rendering**

Replace `locationStudyRecords()` with:

```js
function locationStudyRecords(num) {
  if (!ordinaryLocationStudyContext()) return [];
  const api = activeLocationStudyApi();
  if (!api || typeof api.getByLocation !== 'function') return [];
  let records;
  try { records = api.getByLocation(String(num)); }
  catch { return []; }
  if (!Array.isArray(records)) return [];
  const locationNumber = String(num);
  return records.filter(record => {
    if (!record || record.locationNumber !== locationNumber || !record.mainEventKey) return false;
    return timelineEventByKey.get(record.mainEventKey)?.unit === api.unitId;
  });
}
```

Keep `locationStudyEntryHTML()` visually unchanged. Because it calls `locationStudyRecords()`, it now exposes the correct active Unit's count.

- [ ] **Step 4: Pass the active API through every detail helper**

Use these signatures:

```js
function studyRegionLabel(record, api)
function studyRelationshipGroupHTML(record, api, label, targetIds)
function studyDetailHTML(record, api)
```

Inside `studyRegionLabel()`, use `api.locationName()`. Inside `studyRelationshipGroupHTML()`, use `api.getById()`. Build errors with `Unit ${api.unitNumber}`.

In `studyDetailHTML()`, change the eyebrow to:

```js
`<div class="location-study-eyebrow">Unit ${escapeTimelineText(api.unitNumber)} study point</div>`
```

Pass `api` into every connection group and every `studyDetailHTML()` call. Do not look up a different global from inside those helpers.

- [ ] **Step 5: Render data-provided card roles and generic Unit headings**

Change `studyUnitCardHTML()` to remove the Unit 1 ternary and escape the validated role:

```js
function studyUnitCardHTML(card) {
  const takeaways = card.takeaways.map(takeaway => `<li data-study-unit-takeaway>`
    + `${escapeTimelineText(takeaway)}</li>`).join('');
  return `<article class="location-study-unit-card" data-study-unit-card="${escapeTimelineText(card.kind)}">`
    + `<details data-study-unit-disclosure="${escapeTimelineText(card.kind)}">`
    + `<summary><span class="location-study-unit-role">${escapeTimelineText(card.role)}</span>`
    + `<span class="location-study-unit-title">${escapeTimelineText(card.title)}</span>`
    + `<span class="location-study-unit-summary">${escapeTimelineText(card.summary)}</span>`
    + studyExamSkillsHTML(card.examSkills) + `</summary>`
    + `<div class="location-study-unit-body"><p data-study-unit-prompt>${escapeTimelineText(card.prompt)}</p>`
    + `<ul>${takeaways}</ul></div></details></article>`;
}
```

In `renderLocationStudy()`:

```js
const api = activeLocationStudyApi();
if (!api) {
  renderEventContent(locationNumber, pinBadgeColor(locationNumber));
  return;
}
locationStudyState.unitId = api.unitId;
const contextCard = api.getUnitCard('context');
const synthesisCard = api.getUnitCard('synthesis');
if (!contextCard || !synthesisCard) {
  throw new Error(`Invalid Unit ${api.unitNumber} study bookends: missing context or synthesis card`);
}
```

Render the view root and heading as:

```js
`<div class="location-study-view" data-location-study-view="${escapeTimelineText(locationNumber)}" data-location-study-unit="${escapeTimelineText(api.unitId)}">`
`<h2 class="location-study-title" tabindex="-1">${escapeTimelineText(locationName)} · Unit ${escapeTimelineText(api.unitNumber)}</h2>`
```

Keep the list exactly Context + three event articles + Synthesis and keep `${records.length} study points`.

- [ ] **Step 6: Make open, toggle, and connection navigation Unit-safe**

In `openLocationStudyFromEntry()`, capture `const api = activeLocationStudyApi()` and reject if absent. Change the timeline-origin check to:

```js
if (!timelineEvent || timelineEvent.unit !== api.unitId || String(anchor?.num) !== number) return false;
```

Every function currently reading `window.APWH_U1_LOCATION_STUDY` for active record, connection target, connection back, or location name must use `activeLocationStudyApi()` and verify `locationStudyState.unitId === api.unitId`. Return `null` or `false` on mismatch. Never search both Unit graphs for a connection target.

- [ ] **Step 7: Generalize the homepage bookend resolver**

Add this parent-page mapping near the homepage study helpers:

```js
const HOME_STUDY_GLOBAL_BY_UNIT = Object.freeze({
  u1: 'APWH_U1_LOCATION_STUDY',
  u2: 'APWH_U2_LOCATION_STUDY',
});
```

Change `homeStudyUnitCardHTML()` to render `escapeHomeStudyText(card.role)` instead of a Unit 1 ternary.

Replace `renderHomeStudyBookends()` with:

```js
function renderHomeStudyBookends() {
  const view = homeEvents?.querySelector('[data-location-study-view]');
  const list = view?.querySelector('.location-study-list');
  if (!view || !list) return;
  const unitId = String(view.dataset.locationStudyUnit || '');
  const globalName = HOME_STUDY_GLOBAL_BY_UNIT[unitId];
  let api;
  try { api = globalName && worldMapFrame.contentWindow[globalName]; } catch {}
  if (!api || api.unitId !== unitId) {
    throw new Error(`Invalid homepage ${unitId || 'unknown Unit'} study API`);
  }
  const contextCard = api.getUnitCard('context');
  const synthesisCard = api.getUnitCard('synthesis');
  if (!contextCard || !synthesisCard) {
    throw new Error(`Invalid homepage Unit ${api.unitNumber} study bookends: missing context or synthesis card`);
  }
  list.querySelectorAll(':scope > [data-study-unit-card]').forEach(card => card.remove());
  list.insertAdjacentHTML('afterbegin', homeStudyUnitCardHTML(contextCard));
  list.insertAdjacentHTML('beforeend', homeStudyUnitCardHTML(synthesisCard));
}
```

- [ ] **Step 8: Run the browser verifier and fix only implementation defects**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: `AP World Timeline browser verification passed`. If a new assertion fails, fix production code; do not weaken the verifier.

- [ ] **Step 9: Run focused and full tests**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u1-location-study.test.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u2-location-study.test.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
git diff --check
```

Expected: all tests pass with zero warnings or failures.

- [ ] **Step 10: Commit the generic renderer**

```bash
git add world-map.html index.html
git commit -m "feat: render Unit 2 location study"
```

### Task 5: Final regression, scope review, and handoff

**Files:**
- Verify: `data/apwh-u1-location-study.js`
- Verify: `data/apwh-u2-location-study.js`
- Verify: `docs/data-sources/apwh-u2-location-study-source-ledger.md`
- Verify: `tests/apwh-u1-location-study.test.mjs`
- Verify: `tests/apwh-u2-location-study.test.mjs`
- Verify: `scripts/verify-world-timeline.mjs`
- Verify: `world-map.html`
- Verify: `index.html`

- [ ] **Step 1: Run every Node test from the final tree**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
```

Expected: zero failures. Record the exact final count.

- [ ] **Step 2: Run the complete browser verifier from the final tree**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: `AP World Timeline browser verification passed`.

- [ ] **Step 3: Check whitespace, worktree state, and exact feature scope**

```bash
git diff --check
git status --short --branch
git log --oneline 9b3c1b9..HEAD
git diff --stat 9b3c1b9..HEAD
git diff --name-only 9b3c1b9..HEAD
```

Expected implementation files only:

```text
data/apwh-u1-location-study.js
data/apwh-u2-location-study.js
docs/data-sources/apwh-u2-location-study-source-ledger.md
index.html
scripts/verify-world-timeline.mjs
tests/apwh-u1-location-study.test.mjs
tests/apwh-u2-location-study.test.mjs
world-map.html
```

- [ ] **Step 4: Perform a final requirement audit**

Confirm all of the following from code and tests:

```text
6 Unit 2 locations
18 Unit 2 records
3 records at every location
2 canonical Unit 2 bookend cards
English-only nested learner content
exact Exam Skills assignments
exact source-ledger coverage
deep immutability and own-property-safe lookups
isolated Unit 1 and Unit 2 graphs
Unit 1 → Unit 2 → Unit 1 clean switching
Unit 3 exposes no location-study layer
standalone/homepage parity
380/410/430px expanded-content fit
no outer-frame width change
```

- [ ] **Step 5: Request final code review and use the branch-finishing workflow**

Review the cumulative implementation range beginning at `9b3c1b9`. Fix every Critical or Important issue with a failing regression test, re-run all verification, and re-review. When approved, use `superpowers:finishing-a-development-branch`; do not merge, push, create a PR, or remove the worktree without the user's explicit choice.
