# APWH Unit 4 Location Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add eight Unit 4 location studies with twenty-four causally ordered records, reciprocal comparison links, and identical standalone/homepage behavior.

**Architecture:** Publish one immutable `APWH_U4_LOCATION_STUDY` module that matches the established Unit 2 and Unit 3 API. Register it in the existing per-Unit renderer; do not add a new mode or duplicate Timeline data. Keep causal navigation vertical within and across locations, and use reciprocal related links for horizontal comparisons.

**Tech Stack:** Static JavaScript IIFE modules, HTML registries, Node.js `node:test` and `vm`, Markdown source ledger, Playwright browser verification.

---

## File Structure

- Create `data/apwh-u4-location-study.js`: canonical Unit 4 manifest, learner content, graph, validation, frozen API, and Context/Synthesis cards.
- Create `tests/apwh-u4-location-study.test.mjs`: exact data/content/source/graph/API and mutation validation.
- Create `docs/data-sources/apwh-u4-location-study-source-ledger.md`: one exact row per study record.
- Modify `world-map.html`: load and register `APWH_U4_LOCATION_STUDY` in the existing location-study renderer.
- Modify `index.html`: register the same global for homepage-mirror rendering.
- Modify `scripts/verify-world-timeline.mjs`: replace Unit 4 negative fixtures with positive standalone and homepage interaction contracts.

Use this runtime for every Node command:

```bash
NODE=/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
```

## Canonical Manifest

Use this exact manifest in both the test fixture and the module. `sequence` defines the learner order at each location.

```js
const expectedManifest = [
  ['apwh-u4-lisbon-atlantic-constraints', '42', 1, 'Atlantic Constraints and Overseas Expansion', '1400s', 1400, 1499, 'world-event-42-0', ['4.1', '4.2'], ['ENV', 'ECN', 'GOV'], ['Causation', 'Contextualization']],
  ['apwh-u4-lisbon-navigation-state-sponsorship', '42', 2, 'Navigation Knowledge and State Sponsorship', '1400s', 1400, 1499, 'world-event-42-0', ['4.1', '4.2'], ['TEC', 'GOV'], ['Causation']],
  ['apwh-u4-lisbon-sea-route-indian-ocean', '42', 3, 'A Sea Route to the Indian Ocean', '1488–1498', 1488, 1498, 'world-event-42-0', ['4.2', '4.8'], ['ECN', 'GOV'], ['Causation', 'CCOT']],

  ['apwh-u4-malacca-existing-indian-ocean-networks', '2', 1, 'Indian Ocean Trade before Portuguese Arrival', '1450–1500', 1450, 1500, 'world-event-2-2', ['4.2', '4.8'], ['ECN', 'CDI'], ['Comparison', 'CCOT']],
  ['apwh-u4-malacca-cartaz-fortified-ports', '2', 2, 'Cartaz Passes and Fortified Ports', '1511–1600', 1511, 1600, 'world-event-2-2', ['4.2', '4.4'], ['GOV', 'ECN', 'TEC'], ['Causation']],
  ['apwh-u4-malacca-asian-responses-limits', '2', 3, 'Asian Responses and the Limits of Portuguese Power', '1500–1650', 1500, 1650, 'world-event-2-2', ['4.5', '4.6'], ['GOV', 'ECN'], ['Causation', 'Comparison']],

  ['apwh-u4-santo-domingo-columbian-exchange', '68', 1, 'The Columbian Exchange in the Caribbean', '1492–1600', 1492, 1600, 'world-event-68-0', ['4.3', '4.8'], ['ENV', 'ECN', 'SIO'], ['Comparison', 'CCOT']],
  ['apwh-u4-santo-domingo-disease-demographic-collapse', '68', 2, 'Disease and Demographic Collapse', '1492–1600', 1492, 1600, 'world-event-68-0', ['4.3', '4.8'], ['ENV', 'SIO'], ['Causation', 'CCOT']],
  ['apwh-u4-santo-domingo-conquest-encomienda', '68', 3, 'Conquest and Encomienda', '1503–1542', 1503, 1542, 'world-event-68-0', ['4.3', '4.4'], ['GOV', 'ECN', 'SIO'], ['Causation', 'Contextualization']],

  ['apwh-u4-potosi-silver-mercury-boom', '57', 1, 'Silver Discovery and Mercury Refining', '1545–1600', 1545, 1600, 'world-event-57-0', ['4.4', '4.5'], ['ECN', 'TEC'], ['Causation']],
  ['apwh-u4-potosi-colonial-mita-labor', '57', 2, "Colonial Mit'a and Coerced Mining Labor", '1573–1750', 1573, 1750, 'world-event-57-0', ['4.4', '4.7'], ['SIO', 'GOV', 'ECN'], ['Comparison', 'CCOT']],
  ['apwh-u4-potosi-global-silver-flows', '57', 3, 'Potosí Silver in the Global Economy', '1570–1750', 1570, 1750, 'world-event-57-0', ['4.5', '4.8'], ['ECN'], ['Causation', 'Contextualization']],

  ['apwh-u4-salvador-sugar-plantation-expansion', '60', 1, 'Sugar and Plantation Expansion', '1500–1750', 1500, 1750, 'world-event-60-0', ['4.4', '4.5'], ['ECN', 'ENV'], ['Causation']],
  ['apwh-u4-salvador-african-chattel-slavery', '60', 2, 'From Indigenous Labor to African Chattel Slavery', '1500–1750', 1500, 1750, 'world-event-60-0', ['4.4', '4.7'], ['SIO', 'ECN', 'GOV'], ['Causation', 'Comparison']],
  ['apwh-u4-salvador-mercantilism-atlantic-profits', '60', 3, 'Mercantilism and Atlantic Profits', '1600–1750', 1600, 1750, 'world-event-60-0', ['4.5', '4.8'], ['ECN', 'GOV'], ['Causation', 'CCOT']],

  ['apwh-u4-elmina-firearms-captive-cycle', '87', 1, 'African States and the Firearms–Captive Cycle', '1500–1750', 1500, 1750, 'world-event-87-0', ['4.4', '4.6'], ['GOV', 'ECN'], ['Causation']],
  ['apwh-u4-elmina-middle-passage-chattel-slavery', '87', 2, 'Middle Passage and Chattel Slavery', '1500–1750', 1500, 1750, 'world-event-87-0', ['4.4', '4.7'], ['SIO', 'ECN'], ['Causation', 'Contextualization']],
  ['apwh-u4-elmina-african-demographic-political-effects', '87', 3, 'Demographic and Political Effects in Africa', '1500–1750', 1500, 1750, 'world-event-87-0', ['4.5', '4.8'], ['SIO', 'GOV', 'ECN'], ['Causation', 'CCOT']],

  ['apwh-u4-manila-galleon-route', '12', 1, 'The Manila Galleon Route', '1565–1750', 1565, 1750, 'world-event-12-0', ['4.4', '4.5'], ['ECN', 'TEC', 'GOV'], ['Causation']],
  ['apwh-u4-manila-silver-asian-goods', '12', 2, 'American Silver for Asian Goods', '1570–1750', 1570, 1750, 'world-event-12-0', ['4.5', '4.8'], ['ECN'], ['Causation', 'Comparison']],
  ['apwh-u4-manila-pacific-commercial-network', '12', 3, 'A Pacific Commercial Network', '1570–1750', 1570, 1750, 'world-event-12-0', ['4.5', '4.8'], ['ECN', 'CDI'], ['CCOT', 'Contextualization']],

  ['apwh-u4-new-spain-tenochtitlan-mexico-city', '49', 1, 'From Tenochtitlan to Mexico City', '1521–1600', 1521, 1600, 'world-event-49-7', ['4.3', '4.4'], ['GOV', 'CDI'], ['Causation', 'CCOT']],
  ['apwh-u4-new-spain-casta-colonial-governance', '49', 2, 'Casta and Colonial Governance', '1600–1750', 1600, 1750, 'world-event-49-7', ['4.5', '4.7'], ['SIO', 'GOV'], ['Comparison', 'Contextualization']],
  ['apwh-u4-new-spain-syncretism-resistance', '49', 3, 'Syncretism, Resistance, and Social Change', '1521–1750', 1521, 1750, 'world-event-49-7', ['4.6', '4.7', '4.8'], ['CDI', 'SIO'], ['Causation', 'CCOT']],
];
```

Canonical learner labels and display order:

```js
const expectedLocations = new Map([
  ['42', 'Maritime Portugal · Lisbon'],
  ['2', 'Portuguese Trading-Post Empire · Malacca'],
  ['68', 'Caribbean Colonization · Santo Domingo'],
  ['57', 'Spanish Silver Economy · Potosí'],
  ['60', 'Brazilian Sugar Plantations · Salvador'],
  ['87', 'Atlantic Slave Trade · Elmina'],
  ['12', 'Manila Galleons · Manila'],
  ['49', 'Colonial New Spain · Tenochtitlan / Mexico City'],
]);
```

## Learner-Content Contract

Every record must contain complete English-only `summary`, `significance`, `keyPeople`, `keyTerms`, `evidence`, `examConnection`, and `source` fields. The table below defines the minimum factual claims that the exact test fixture must lock. Do not add facts unsupported by the Unit 4 source material.

| Stable-ID suffix | Required actors/terms | Required evidence and caveat |
| --- | --- | --- |
| `lisbon-atlantic-constraints` | Portugal; Castile and Aragon; primogeniture | Portugal's Atlantic position and Iberian limits encouraged overseas routes; geography was a pressure, not proof of inevitable expansion. |
| `lisbon-navigation-state-sponsorship` | Prince Henry; compass; astrolabe; lateen and square sails | Technologies came from multiple Afro-Eurasian traditions; state financing combined them at oceanic scale. |
| `lisbon-sea-route-indian-ocean` | Bartolomeu Dias; Vasco da Gama; Cape of Good Hope | Dias rounded the cape in 1488; da Gama reached India in 1498; do not claim either voyage reached or crossed the Pacific. |
| `malacca-existing-indian-ocean-networks` | Muslim, Hindu, and Southeast Asian merchants; monsoon | Europeans entered an old commercial system rather than creating Indian Ocean trade. |
| `malacca-cartaz-fortified-ports` | Afonso de Albuquerque; cartaz; trading-post empire | Portugal conquered Malacca in 1511 and used forts, naval cannon, and passes to tax/control routes without conquering most inland territory. |
| `malacca-asian-responses-limits` | Dutch VOC; Aceh or other regional rivals; Nagasaki restriction | Asian states and later Dutch/English competitors limited Portuguese power; response was neither uniform nor passive. |
| `santo-domingo-columbian-exchange` | Taíno communities; Columbian Exchange; ecological transfer | Crops, animals, pathogens, and people moved in both directions, but consequences were unequal. |
| `santo-domingo-disease-demographic-collapse` | Indigenous Caribbean peoples; smallpox; demographic collapse | Lack of immunity drove catastrophic mortality; disease aided conquest but did not make conquest automatic. |
| `santo-domingo-conquest-encomienda` | encomenderos; encomienda; Bartolomé de las Casas or New Laws | Spanish rule demanded labor and tribute; distinguish encomienda from ownership of land and from African chattel slavery. |
| `potosi-silver-mercury-boom` | Potosí; mercury amalgamation; Zacatecas comparison | Silver discovery and refining increased output and profitability while exposing workers to severe danger. |
| `potosi-colonial-mita-labor` | Viceroy Toledo; mit'a; Huancavelica | Spanish authorities adapted an Inca labor obligation into coercive colonial mining; do not describe the two systems as identical. |
| `potosi-global-silver-flows` | Spanish crown; bullion; price revolution | Silver moved to Europe and through Pacific trade to Asia; taxation and demand connected distant markets. |
| `salvador-sugar-plantation-expansion` | Portuguese planters; engenho; sugar | Tropical ecology, land, capital, and European demand made sugar plantations profitable; profit depended on organized coercion. |
| `salvador-african-chattel-slavery` | enslaved Africans; chattel slavery; plantation | Disease and escape weakened attempts to rely only on Indigenous labor; racialized hereditary slavery supplied a forcibly transported workforce. |
| `salvador-mercantilism-atlantic-profits` | Portuguese crown; mercantilism; monopoly | Colonial regulation directed commodities and revenue toward imperial states and merchants; avoid claiming all gains stayed in Portugal. |
| `elmina-firearms-captive-cycle` | African rulers and merchants; firearm; captive trade | Some states exchanged captives for firearms, increasing their power to raid; African participation does not erase European demand or coercion. |
| `elmina-middle-passage-chattel-slavery` | captive Africans; Middle Passage; barracoon | Explain forced embarkation, lethal ship conditions, resistance, and legal conversion of people into hereditary property. |
| `elmina-african-demographic-political-effects` | affected West African communities; gender imbalance; political fragmentation | Losses varied by region; discuss demographic and political effects without claiming the whole continent experienced one uniform outcome. |
| `manila-galleon-route` | Spanish Philippines; Acapulco; galleon | The route crossed the Pacific between Manila and Acapulco; Manila is a representative port, not the entire network. |
| `manila-silver-asian-goods` | Chinese merchants; silver; silk and porcelain | American silver purchased Asian goods; Chinese silver demand was a major pull factor. |
| `manila-pacific-commercial-network` | merchants in the Americas, Philippines, and China; entrepôt | The route linked regional networks into sustained global exchange; local Asian commerce continued rather than disappearing. |
| `new-spain-tenochtitlan-mexico-city` | Hernán Cortés; Mexica and Indigenous allies; Mexico City | The Spanish destroyed and rebuilt the capital after 1521; explicitly identify continuity of place and change of colonial power. |
| `new-spain-casta-colonial-governance` | peninsulares; criollos; casta | Ancestry categories structured privilege and office but social practice was more complex than a perfectly fixed diagram. |
| `new-spain-syncretism-resistance` | Indigenous and African communities; syncretism; Virgin of Guadalupe or Pueblo Revolt comparison | Explain adaptation and resistance without treating conversion as simple cultural erasure; Tenochtitlan/Mexico City is a representative New Spain anchor. |

---

### Task 1: Lock the missing Unit 4 module in a failing test

**Files:**
- Create: `tests/apwh-u4-location-study.test.mjs`
- Expected missing file: `data/apwh-u4-location-study.js`

- [ ] **Step 1: Write the file-publication test**

Create a focused test that checks the intended path before evaluating it:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const moduleUrl = new URL('../data/apwh-u4-location-study.js', import.meta.url);

test('publishes the Unit 4 location-study module', () => {
  assert.equal(existsSync(moduleUrl), true, 'Unit 4 data module must exist');
  const sandbox = {};
  sandbox.window = sandbox;
  vm.runInNewContext(readFileSync(moduleUrl, 'utf8'), sandbox);
  assert.equal(sandbox.APWH_U4_LOCATION_STUDY.unitId, 'u4');
  assert.equal(sandbox.APWH_U4_LOCATION_STUDY.unitNumber, 4);
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
$NODE --test tests/apwh-u4-location-study.test.mjs
```

Expected: one failure with `Unit 4 data module must exist`; no syntax or harness error.

- [ ] **Step 3: Commit the RED test**

```bash
git add tests/apwh-u4-location-study.test.mjs
git commit -m "test: require APWH Unit 4 location study"
```

### Task 2: Publish the exact immutable Unit 4 data contract

**Files:**
- Modify: `tests/apwh-u4-location-study.test.mjs`
- Create: `data/apwh-u4-location-study.js`

- [ ] **Step 1: Extend the test with the canonical manifest and API contract**

Add the complete `expectedManifest` and `expectedLocations` fixtures from this plan. Evaluate the module in a fresh VM for every mutation test. Lock:

```js
assert.equal(api.unitId, 'u4');
assert.equal(api.unitNumber, 4);
assert.deepEqual([...api.locationNumbers], [...expectedLocations.keys()]);
assert.equal(api.records.length, 24);
for (const [number, label] of expectedLocations) {
  assert.equal(api.locationName(number), label);
  assert.equal(api.getByLocation(number).length, 3);
}
assert.deepEqual(api.records.map(record => [
  record.id, record.locationNumber, record.sequence, record.title,
  record.dateLabel, record.startYear, record.endYear, record.mainEventKey,
  [...record.topicCodes], [...record.themeIds], [...record.examSkills],
]), expectedManifest);
assert.deepEqual([...new Set(api.records.flatMap(record => record.topicCodes))].sort(),
  ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8']);
```

Also assert:

- `getById(id)` returns the canonical frozen object;
- unknown IDs/cards return `null`, and unknown locations return `[]`;
- returned location arrays are defensive and remain in `sequence` order;
- every record and nested array/object is frozen;
- record IDs match `/^apwh-u4-(lisbon|malacca|santo-domingo|potosi|salvador|elmina|manila|new-spain)-/`;
- main-event keys are exactly `42-0`, `2-2`, `68-0`, `57-0`, `60-0`, `87-0`, `12-0`, and `49-7` with the `world-event-` prefix;
- valid themes are `GOV`, `ECN`, `CDI`, `SIO`, `TEC`, `ENV`;
- valid skills are `Causation`, `Comparison`, `CCOT`, `Contextualization`;
- learner content is English-only, significance and Exam Connection are at least sixty characters, every record has at least one actor, two terms, and two evidence statements;
- the global refuses to overwrite an existing `APWH_U4_LOCATION_STUDY` value.

- [ ] **Step 2: Run the focused test and confirm RED remains specific**

```bash
$NODE --test tests/apwh-u4-location-study.test.mjs
```

Expected: failure remains the missing Unit 4 module, not malformed test fixtures.

- [ ] **Step 3: Implement the data module using the established API**

Use an IIFE with overwrite protection:

```js
(function publishUnit4LocationStudy(root) {
  'use strict';
  if (Object.prototype.hasOwnProperty.call(root, 'APWH_U4_LOCATION_STUDY')) {
    throw new Error('Invalid Unit 4 global APWH_U4_LOCATION_STUDY: refusing to overwrite existing value');
  }
  const UNIT_ID = 'u4';
  const UNIT_NUMBER = 4;
  const LOCATIONS = Object.freeze(Object.fromEntries(expectedLocationRows));
  const VALID_TOPIC_CODES = new Set(['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8']);
  const VALID_THEME_IDS = new Set(['GOV', 'ECN', 'CDI', 'SIO', 'TEC', 'ENV']);
  const VALID_EXAM_SKILLS = new Set(['Causation', 'Comparison', 'CCOT', 'Contextualization']);
  // Define the canonical manifest literally in this file; do not import test data.
})(typeof window !== 'undefined' ? window : globalThis);
```

Copy the validation, record-freezing, comparator, defensive lookup, Unit-card, graph-field, and API-publication structure from `data/apwh-u2-location-study.js`, renaming all diagnostics and globals to Unit 4. Use `sequence` as the primary location-order comparator, followed by start year, end year, and ID.

Create all twenty-four `RAW_RECORDS`. Each record must reproduce its manifest metadata literally and implement every factual requirement in the Learner-Content Contract. Write the exact learner copy into the test's `expectedRecordContent` before accepting GREEN; the test and production content must match field-for-field.

- [ ] **Step 4: Add negative mutation tests and make them pass**

Use source-string substitutions in fresh VM contexts to prove the validator rejects:

```text
invalid location 999
invalid or duplicate sequence
invalid main-event key
missing, invalid, or duplicate Topic
missing, invalid, or duplicate theme
missing, invalid, duplicate, or oversized Exam Skills
malformed date label or numeric range
date-label/range disagreement
duplicate raw ID or wrong stable-ID prefix
Chinese or other non-English learner content
malformed actor, term, evidence, or source objects
four records at one location
null raw record or Unit card
```

Every expected error must include `Invalid Unit 4`, the affected record/card ID when available, and the violated rule.

- [ ] **Step 5: Run the focused and full Node suites**

```bash
$NODE --test tests/apwh-u4-location-study.test.mjs
$NODE --test tests/*.test.mjs
```

Expected: all focused tests pass; the full existing suite remains green.

- [ ] **Step 6: Commit the immutable data module**

```bash
git add data/apwh-u4-location-study.js tests/apwh-u4-location-study.test.mjs
git commit -m "feat: add APWH Unit 4 location study data"
```

### Task 3: Add the causal graph, comparison graph, cards, and source ledger

**Files:**
- Modify: `tests/apwh-u4-location-study.test.mjs`
- Modify: `data/apwh-u4-location-study.js`
- Create: `docs/data-sources/apwh-u4-location-study-source-ledger.md`

- [ ] **Step 1: Add exact failing graph fixtures**

Lock these directed causal edges:

```js
const expectedCausalPairs = [
  // Three-step paths at each location.
  ['apwh-u4-lisbon-atlantic-constraints', 'apwh-u4-lisbon-navigation-state-sponsorship'],
  ['apwh-u4-lisbon-navigation-state-sponsorship', 'apwh-u4-lisbon-sea-route-indian-ocean'],
  ['apwh-u4-malacca-existing-indian-ocean-networks', 'apwh-u4-malacca-cartaz-fortified-ports'],
  ['apwh-u4-malacca-cartaz-fortified-ports', 'apwh-u4-malacca-asian-responses-limits'],
  ['apwh-u4-santo-domingo-columbian-exchange', 'apwh-u4-santo-domingo-disease-demographic-collapse'],
  ['apwh-u4-santo-domingo-disease-demographic-collapse', 'apwh-u4-santo-domingo-conquest-encomienda'],
  ['apwh-u4-potosi-silver-mercury-boom', 'apwh-u4-potosi-colonial-mita-labor'],
  ['apwh-u4-potosi-colonial-mita-labor', 'apwh-u4-potosi-global-silver-flows'],
  ['apwh-u4-salvador-sugar-plantation-expansion', 'apwh-u4-salvador-african-chattel-slavery'],
  ['apwh-u4-salvador-african-chattel-slavery', 'apwh-u4-salvador-mercantilism-atlantic-profits'],
  ['apwh-u4-elmina-firearms-captive-cycle', 'apwh-u4-elmina-middle-passage-chattel-slavery'],
  ['apwh-u4-elmina-middle-passage-chattel-slavery', 'apwh-u4-elmina-african-demographic-political-effects'],
  ['apwh-u4-manila-galleon-route', 'apwh-u4-manila-silver-asian-goods'],
  ['apwh-u4-manila-silver-asian-goods', 'apwh-u4-manila-pacific-commercial-network'],
  ['apwh-u4-new-spain-tenochtitlan-mexico-city', 'apwh-u4-new-spain-casta-colonial-governance'],
  ['apwh-u4-new-spain-casta-colonial-governance', 'apwh-u4-new-spain-syncretism-resistance'],
  // Cross-location mechanisms.
  ['apwh-u4-lisbon-sea-route-indian-ocean', 'apwh-u4-malacca-cartaz-fortified-ports'],
  ['apwh-u4-santo-domingo-disease-demographic-collapse', 'apwh-u4-salvador-african-chattel-slavery'],
  ['apwh-u4-salvador-sugar-plantation-expansion', 'apwh-u4-elmina-firearms-captive-cycle'],
  ['apwh-u4-potosi-global-silver-flows', 'apwh-u4-manila-silver-asian-goods'],
];
```

Lock these unordered related pairs:

```js
const expectedRelatedPairs = [
  ['apwh-u4-malacca-cartaz-fortified-ports', 'apwh-u4-santo-domingo-conquest-encomienda'],
  ['apwh-u4-potosi-colonial-mita-labor', 'apwh-u4-salvador-african-chattel-slavery'],
  ['apwh-u4-malacca-existing-indian-ocean-networks', 'apwh-u4-manila-pacific-commercial-network'],
  ['apwh-u4-elmina-african-demographic-political-effects', 'apwh-u4-new-spain-casta-colonial-governance'],
  ['apwh-u4-santo-domingo-columbian-exchange', 'apwh-u4-manila-silver-asian-goods'],
];
```

Lock these exact English mechanism notes in the same order as `expectedCausalPairs`:

```js
const expectedCausalNotes = [
  'Atlantic geography and restricted overland access increased Portuguese incentives to seek an ocean route.',
  'State sponsorship combined navigational knowledge, ship design, and accumulated sailing experience into longer voyages.',
  'Existing monsoon commerce made Malacca valuable to Portuguese officials seeking to redirect and tax trade.',
  'Fortified ports and cartaz passes provoked resistance and competition that limited Portuguese control.',
  'Transoceanic transfers brought unfamiliar pathogens into Caribbean populations.',
  'Demographic collapse weakened Indigenous communities and helped Spanish conquerors impose labor and tribute demands.',
  'Rich silver deposits became far more profitable when mercury amalgamation raised usable output.',
  "Colonial officials expanded the mit'a to supply the labor needed for sustained silver production.",
  'Profitable sugar cultivation created a large and continuing demand for coerced plantation labor.',
  'Hereditary chattel slavery supported plantation output whose sale enriched merchants and imperial treasuries.',
  'European demand and firearms exchanges encouraged some states and merchants to intensify captive-taking.',
  'Atlantic shipment converted captives into hereditary property while producing resistance and lethal human loss.',
  'Spanish rule in the Philippines established a regular transpacific shipping route.',
  'Chinese demand for silver and American demand for Asian goods sustained a Pacific commercial network.',
  'Spanish conquest rebuilt the Mexica capital as the administrative center of New Spain.',
  'Colonial ancestry hierarchies generated both cultural adaptation and resistance among Indigenous, African, and mixed communities.',
  'Portuguese ocean access enabled officials to seize Malacca and enforce cartaz passes at a strategic port.',
  'Caribbean population collapse pushed colonists toward the forced migration and enslavement of Africans in Atlantic plantations.',
  'Expanding Brazilian sugar production increased demand for captives supplied through West African coastal trade.',
  'American silver carried through Pacific routes paid for Asian goods and linked Potosí to Manila and Chinese markets.',
];
```

Lock these exact reciprocal comparison notes in the same order as `expectedRelatedPairs`:

```js
const expectedRelatedNotes = [
  'Compare a maritime trading-post empire that controlled strategic routes with a territorial colony that controlled land, labor, and tribute.',
  "Compare the colonial mit'a, adapted from an earlier Andean obligation, with racialized hereditary chattel slavery on Atlantic plantations.",
  'Compare the older monsoon-based Indian Ocean network with the newer transpacific network centered on Manila and Acapulco.',
  'Compare political and demographic disruption in West Africa with ancestry-based social ranking inside colonial New Spain.',
  'Compare the multidirectional Columbian Exchange with the silver-for-goods circuit that tied the Americas to Asian markets.',
];
```

Assert causal direction, reciprocal arrays, identical reciprocal notes, no self-links, no duplicate targets, no cross-category target reuse, and no unresolved IDs.

- [ ] **Step 2: Add exact failing Unit-card fixtures**

Lock two immutable map-independent cards:

```js
const expectedUnitCards = {
  context: {
    id: 'apwh-u4-context-land-to-oceanic-empires',
    kind: 'context',
    role: 'Unit 4 Context Card',
    title: 'Why Oceanic Expansion Became Profitable',
    examSkills: ['Contextualization', 'Causation'],
    summary: 'Unit 3 states drew revenue from land, labor, and established Afro-Eurasian commerce. In Unit 4, Iberian rulers used borrowed and adapted navigational knowledge, state financing, and Atlantic ports to reach those older markets by sea. Oceanic expansion became profitable when armed ships and colonial institutions let empires redirect trade, seize labor, and tax extraction; geography and technology created opportunities, but political choices determined how they were used.',
    prompt: 'How did inherited commercial knowledge and new state-backed ocean routes change the methods—not simply the scale—of imperial expansion after 1450?',
    takeaways: [
      'Oceanic expansion built on Afro-Eurasian knowledge and preexisting trade networks.',
      'State finance and naval force helped rulers convert maritime access into revenue.',
      'Trading-post control and territorial colonization were different imperial strategies.',
    ],
  },
  synthesis: {
    id: 'apwh-u4-synthesis-extraction-hierarchy-revolution',
    kind: 'synthesis',
    role: 'Unit 4 Synthesis Card',
    title: 'From Imperial Extraction to Revolutionary Challenge',
    examSkills: ['CCOT', 'Causation'],
    summary: 'Unit 4 empires generated wealth through silver, plantation commodities, monopoly trade, and coerced labor while organizing colonial societies through legal and ancestry-based hierarchies. These systems strengthened states and merchants, but they also spread rights language, sharpened inequalities, and created groups with reasons to challenge imperial legitimacy. Unit 5 revolutions would contest who possessed sovereignty and rights without immediately eliminating the economic and social structures built before 1750.',
    prompt: 'Which Unit 4 institutions created both the resources for stronger empires and the grievances that later revolutionary movements could mobilize?',
    takeaways: [
      'Colonial extraction strengthened imperial states and commercial elites.',
      'Coerced labor and ancestry-based hierarchy produced durable inequality and resistance.',
      'Revolutionary rights claims challenged imperial legitimacy more quickly than they dismantled older social structures.',
    ],
  },
};
```

The Context card must explain the transition from Unit 3 land-based revenue to Portuguese overseas access without claiming Europeans possessed uniquely superior knowledge. The Synthesis card must connect colonial wealth, coerced labor, and ancestry-based hierarchy to the rights and legitimacy challenges of Unit 5.

- [ ] **Step 3: Add the exact ledger fixture and confirm RED**

Create `expectedLedgerRows` with twenty-four five-column rows:

```text
Stable ID | AP topic assignment | Main-event binding | Source locator | Claims covered
```

Build the fixture deterministically from the two canonical tables above. For each manifest row, use these exact values:

```js
const topicAssignment = topicCodes.join(', ');
const mainEventBinding = mainEventKey;
const sourceLocator = `AMSCO AP World History, Unit 4, Topic${topicCodes.length === 1 ? '' : 's'} ${topicCodes.join(' and ')}`;
const claimsCovered = `${requiredActorsAndTerms}; ${requiredEvidenceAndCaveat}`;
```

`requiredActorsAndTerms` and `requiredEvidenceAndCaveat` are copied literally from that record's row in the Learner-Content Contract; punctuation and capitalization are part of the fixture. This produces the exact row tuple:

```js
[id, topicAssignment, mainEventBinding, sourceLocator, claimsCovered]
```

Do not insert page numbers, edition names, shorthand such as `same as above`, or claims not present in the contract. Assert the Markdown ledger has exactly one row for every ID, no extra `apwh-u4-` row, and exact cell equality after trimming surrounding whitespace only.

Run:

```bash
$NODE --test tests/apwh-u4-location-study.test.mjs
```

Expected: failures for absent graph links, cards, and ledger; the twenty-four record contract remains green.

- [ ] **Step 4: Implement graph links, cards, and ledger**

Use the module's `addCausalConnection(causeId, effectId, note)` and `addRelatedConnection(leftId, rightId, note)` helpers. Write notes that state the precise mechanism or comparison; do not use chronology-only notes.

Populate `UNIT_CARDS`, freeze all nested arrays, and publish `unitCards` plus `getUnitCard(kind)` through the API.

Create the ledger with this header:

```markdown
# APWH Unit 4 Location Study Source Ledger

The learner records use edition-neutral locators in AMSCO AP World History Unit 4. Map pins are representative anchors; a named port or city does not imply that every regional process occurred only there.

| Stable ID | AP topic assignment | Main event | Source locator | Claims covered |
| --- | --- | --- | --- | --- |
```

- [ ] **Step 5: Add graph/card/source mutation tests**

Prove the module rejects missing endpoints, self-links, duplicate links, target reuse across categories, nonreciprocal links, missing/mismatched/non-English notes, missing card role/title/takeaway, duplicate card kind/ID, invalid card skills, and extra/missing source fields.

- [ ] **Step 6: Run tests and commit**

```bash
$NODE --test tests/apwh-u4-location-study.test.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add data/apwh-u4-location-study.js tests/apwh-u4-location-study.test.mjs docs/data-sources/apwh-u4-location-study-source-ledger.md
git commit -m "feat: connect APWH Unit 4 location studies"
```

Expected: focused and full Node suites pass.

### Task 4: Register Unit 4 in the shared renderer

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`
- Modify: `world-map.html`
- Modify: `index.html`

- [ ] **Step 1: Add failing static and browser registration assertions**

Assert both HTML files load the new script before their page logic:

```html
<script src="data/apwh-u4-location-study.js"></script>
```

Assert the registries become:

```js
const LOCATION_STUDY_GLOBAL_BY_UNIT = Object.freeze({
  u1: 'APWH_U1_LOCATION_STUDY',
  u2: 'APWH_U2_LOCATION_STUDY',
  u3: 'APWH_U3_LOCATION_STUDY',
  u4: 'APWH_U4_LOCATION_STUDY',
});
```

and:

```js
const HOME_STUDY_GLOBAL_BY_UNIT = Object.freeze({
  u1: 'APWH_U1_LOCATION_STUDY',
  u2: 'APWH_U2_LOCATION_STUDY',
  u3: 'APWH_U3_LOCATION_STUDY',
  u4: 'APWH_U4_LOCATION_STUDY',
});
```

Replace current negative assertions such as `Unit 4 must expose no location-study entry` with an initial positive fixture at Lisbon:

```js
await page.evaluate(() => {
  window.__mapFilter.setPeriod('u4');
  window.__mapFilter.openHit('42', 'europe');
});
await expectVisible(page.locator('#eventPanel [data-location-study-open="42"]'),
  'Unit 4 Lisbon must expose a location-study entry');
```

Run the browser verifier. Expected: FAIL because the script and registry entry are absent.

- [ ] **Step 2: Add the script and registry entries**

Modify only the existing script list and the two registry objects. Do not fork renderer functions or add Unit 4 conditionals.

- [ ] **Step 3: Verify registration and commit**

```bash
$NODE scripts/verify-world-timeline.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add world-map.html index.html scripts/verify-world-timeline.mjs
git commit -m "feat: render APWH Unit 4 location studies"
```

Expected: the Lisbon positive fixture passes and all existing Unit 1–3 behavior remains green.

### Task 5: Verify all eight standalone and homepage study views

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Add the canonical browser fixture**

```js
const UNIT_4_STUDY_VIEWS = Object.freeze([
  Object.freeze({ number: '42', region: 'europe', label: 'Maritime Portugal · Lisbon', eventKey: 'world-event-42-0', ids: Object.freeze(['apwh-u4-lisbon-atlantic-constraints', 'apwh-u4-lisbon-navigation-state-sponsorship', 'apwh-u4-lisbon-sea-route-indian-ocean']) }),
  Object.freeze({ number: '2', region: 'asia', label: 'Portuguese Trading-Post Empire · Malacca', eventKey: 'world-event-2-2', ids: Object.freeze(['apwh-u4-malacca-existing-indian-ocean-networks', 'apwh-u4-malacca-cartaz-fortified-ports', 'apwh-u4-malacca-asian-responses-limits']) }),
  Object.freeze({ number: '68', region: 'americas', label: 'Caribbean Colonization · Santo Domingo', eventKey: 'world-event-68-0', ids: Object.freeze(['apwh-u4-santo-domingo-columbian-exchange', 'apwh-u4-santo-domingo-disease-demographic-collapse', 'apwh-u4-santo-domingo-conquest-encomienda']) }),
  Object.freeze({ number: '57', region: 'americas', label: 'Spanish Silver Economy · Potosí', eventKey: 'world-event-57-0', ids: Object.freeze(['apwh-u4-potosi-silver-mercury-boom', 'apwh-u4-potosi-colonial-mita-labor', 'apwh-u4-potosi-global-silver-flows']) }),
  Object.freeze({ number: '60', region: 'americas', label: 'Brazilian Sugar Plantations · Salvador', eventKey: 'world-event-60-0', ids: Object.freeze(['apwh-u4-salvador-sugar-plantation-expansion', 'apwh-u4-salvador-african-chattel-slavery', 'apwh-u4-salvador-mercantilism-atlantic-profits']) }),
  Object.freeze({ number: '87', region: 'africa', label: 'Atlantic Slave Trade · Elmina', eventKey: 'world-event-87-0', ids: Object.freeze(['apwh-u4-elmina-firearms-captive-cycle', 'apwh-u4-elmina-middle-passage-chattel-slavery', 'apwh-u4-elmina-african-demographic-political-effects']) }),
  Object.freeze({ number: '12', region: 'asia', label: 'Manila Galleons · Manila', eventKey: 'world-event-12-0', ids: Object.freeze(['apwh-u4-manila-galleon-route', 'apwh-u4-manila-silver-asian-goods', 'apwh-u4-manila-pacific-commercial-network']) }),
  Object.freeze({ number: '49', region: 'americas', label: 'Colonial New Spain · Tenochtitlan / Mexico City', eventKey: 'world-event-49-7', ids: Object.freeze(['apwh-u4-new-spain-tenochtitlan-mexico-city', 'apwh-u4-new-spain-casta-colonial-governance', 'apwh-u4-new-spain-syncretism-resistance']) }),
]);
```

- [ ] **Step 2: Verify standalone behavior**

For every fixture:

1. set Unit 4 and open the pin through `window.__mapFilter.openHit(number, region)`;
2. assert the selected anchor and event key;
3. click `View all 3 study points`;
4. assert heading `${label} · Unit 4` and exact three IDs in sequence order;
5. click each record and assert exactly one detail is open;
6. use Back and verify focus returns to the study-entry button.

Add one within-location causal jump, Lisbon navigation to Lisbon sea route; one cross-location causal jump, Potosí silver flow to Manila silver-for-goods; and one related comparison jump, Potosí mit'a to Salvador chattel slavery. For each, assert Unit 4 remains active and the selected map anchor, Timeline event, location heading, expanded record, connection stack, and Back behavior all match the target.

- [ ] **Step 3: Verify homepage parity**

Use the existing supported homepage path, not direct DOM cloning:

1. select `u4` in `#hostPeriod`;
2. search the fixture's exact Timeline title through `#hostSearch`;
3. click the unique `#home-events .event-card.is-result[data-event-key="..."]`;
4. wait on iframe `getTimelineState()` for the exact Unit, anchor, and event key;
5. click the mirrored `View all 3 study points` button;
6. assert the same label, ID order, one-open-detail rule, causal/related jumps, and Back restoration.

Do not add fixed waits. Wait for visible elements, exact iframe state, or the existing host synchronization result.

- [ ] **Step 4: Verify Unit-switch cleanup**

With a Unit 4 record open, switch to Unit 3 and assert:

```js
assert.equal(await page.locator('[data-location-study-unit="u4"]').count(), 0);
assert.equal(await page.locator('[data-study-detail]').count(), 0);
assert.equal(await page.locator('[data-location-study-back]').count(), 0);
```

Repeat on the homepage mirror. Confirm returning to Unit 4 opens ordinary event content rather than stale study state.

- [ ] **Step 5: Run the browser and Node suites, then commit**

```bash
$NODE scripts/verify-world-timeline.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add scripts/verify-world-timeline.mjs
git commit -m "test: verify APWH Unit 4 study interactions"
```

Expected: all standalone/homepage Unit 4 contracts and the full existing suite pass.

### Task 6: Run final regression and review the branch

**Files:**
- Verify only; modify files only to address a demonstrated failure.

- [ ] **Step 1: Run focused and full verification from a clean state**

```bash
$NODE --test tests/apwh-u4-location-study.test.mjs
$NODE --test tests/*.test.mjs
$NODE scripts/verify-world-timeline.mjs
git diff --check
git status --short
```

Expected: all tests pass, browser verifier prints `AP World Timeline browser verification passed`, diff check is empty, and the worktree is clean.

- [ ] **Step 2: Audit the requirements line by line**

Confirm:

- eight labels and twenty-four records match the canonical manifest;
- every Topic 4.1–4.8 appears;
- the Caribbean path is Exchange → disease → conquest/encomienda;
- Timeline cards remain concise and unchanged;
- location-study content appears only in Unit 4;
- all causal and related connections synchronize map, Timeline, and right panel;
- Tenochtitlan/Mexico City displays both names and explains continuity/change;
- representative-anchor caveats appear for regional processes;
- Context and Synthesis connect U3 → U4 → U5 without changing causal-chain seams;
- U1–U3 datasets and interactions remain unchanged.

- [ ] **Step 3: Request final code review**

Review the entire implementation range from `313a61b` through `HEAD`. Fix every P0–P2 finding, rerun the full commands above, and request re-review until approved.

No merge, push, PR, or worktree cleanup occurs until the user chooses the integration action.
