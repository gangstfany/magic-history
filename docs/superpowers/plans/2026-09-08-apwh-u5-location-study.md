# APWH Unit 5 Location Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ten Unit 5 location studies with thirty causally ordered records, reciprocal comparison links, and identical standalone/homepage behavior.

**Architecture:** Publish one immutable `APWH_U5_LOCATION_STUDY` module matching the Unit 4 API and opt it into the existing capability-driven Timeline synchronization. Register it in the current shared renderer; do not create another mode, panel, renderer, map pin, or Timeline dataset. Keep the other nine Unit 5 locations as ordinary Timeline/map evidence.

**Tech Stack:** Static JavaScript IIFE modules, HTML registries, Node.js `node:test` and `vm`, Markdown source ledger, Playwright browser verification.

---

## File Structure

- Create `data/apwh-u5-location-study.js`: canonical records, validation, graph, cards, frozen API.
- Create `tests/apwh-u5-location-study.test.mjs`: exact metadata/content/API/graph/source validation.
- Create `docs/data-sources/apwh-u5-location-study-source-ledger.md`: one exact row per record.
- Modify `world-map.html`: load and register `APWH_U5_LOCATION_STUDY` only.
- Modify `index.html`: register the same global for the homepage mirror only.
- Modify `scripts/verify-world-timeline.mjs`: positive U5 standalone/homepage contracts.

Use this runtime:

```bash
NODE=/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
```

## Canonical Runtime Contract

Use this exact location order:

```js
const expectedLocations = new Map([
  ['23', 'Enlightenment Foundations · London'],
  ['51', 'American Revolution · Philadelphia'],
  ['24', 'French Revolution · Paris'],
  ['66', 'Haitian Revolution · Saint-Domingue / Port-au-Prince'],
  ['52', 'Latin American Independence · Caracas'],
  ['36', 'Industrial Revolution · Manchester'],
  ['29', 'Nationalism and Industrial Power · Berlin'],
  ['14', 'Meiji State-Led Industrialization · Edo / Tokyo'],
  ['84', "Muhammad Ali's Egypt · Cairo"],
  ['105', "Women's Rights · Seneca Falls"],
]);
```

Use this exact record metadata. Tuple order is:

```text
id, locationNumber, sequence, title, dateLabel, startYear, endYear,
mainEventKey, topicCodes, themeIds, examSkills
```

```js
const expectedManifest = [
  ['apwh-u5-london-natural-law-empiricism', '23', 1, 'Natural Law and Empirical Reasoning', '1600–1750', 1600, 1750, 'world-event-23-2', ['5.1'], ['CDI', 'TEC'], ['Contextualization']],
  ['apwh-u5-london-social-contract-natural-rights', '23', 2, 'Social Contract and Natural Rights', '1651–1762', 1651, 1762, 'world-event-23-2', ['5.1'], ['CDI', 'GOV'], ['Causation']],
  ['apwh-u5-london-rights-language-atlantic', '23', 3, 'Rights Language Becomes Portable', '1700–1800', 1700, 1800, 'world-event-23-2', ['5.1', '5.2'], ['CDI', 'GOV'], ['Causation', 'CCOT']],

  ['apwh-u5-philadelphia-colonial-self-government', '51', 1, 'Colonial Self-Government and Imperial Conflict', '1600–1775', 1600, 1775, 'world-event-51-0', ['5.2'], ['GOV', 'ECN'], ['Contextualization', 'Causation']],
  ['apwh-u5-philadelphia-declaration-independence', '51', 2, 'Declaration, War, and Independence', '1776–1783', 1776, 1783, 'world-event-51-0', ['5.2'], ['GOV', 'CDI'], ['Causation']],
  ['apwh-u5-philadelphia-republican-rights-limits', '51', 3, 'Republican Rights and Their Limits', '1776–1800', 1776, 1800, 'world-event-51-0', ['5.2'], ['GOV', 'SIO'], ['Comparison', 'CCOT']],

  ['apwh-u5-paris-old-regime-fiscal-crisis', '24', 1, 'Old Regime Privilege and Fiscal Crisis', '1780–1789', 1780, 1789, 'world-event-24-1', ['5.2'], ['GOV', 'ECN', 'SIO'], ['Causation', 'Contextualization']],
  ['apwh-u5-paris-popular-sovereignty-rights', '24', 2, 'Popular Sovereignty and the Rights of Man', '1789–1792', 1789, 1792, 'world-event-24-1', ['5.1', '5.2'], ['GOV', 'CDI'], ['Causation']],
  ['apwh-u5-paris-radicalization-napoleonic-diffusion', '24', 3, 'Radicalization and Napoleonic Diffusion', '1792–1815', 1792, 1815, 'world-event-24-1', ['5.2'], ['GOV', 'CDI'], ['Causation', 'CCOT']],

  ['apwh-u5-haiti-plantation-slavery', '66', 1, 'Plantation Wealth and Racial Slavery', '1700–1791', 1700, 1791, 'world-event-66-1', ['5.2'], ['ECN', 'SIO'], ['Contextualization', 'Causation']],
  ['apwh-u5-haiti-enslaved-revolt-toussaint', '66', 2, "Enslaved Revolt and Toussaint L'Ouverture", '1791–1802', 1791, 1802, 'world-event-66-1', ['5.2'], ['GOV', 'SIO'], ['Causation']],
  ['apwh-u5-haiti-emancipation-independence', '66', 3, 'Emancipation and Haitian Independence', '1793–1804', 1793, 1804, 'world-event-66-1', ['5.2'], ['GOV', 'SIO'], ['Causation', 'Comparison']],

  ['apwh-u5-caracas-creole-grievances-imperial-crisis', '52', 1, 'Creole Grievances and Imperial Crisis', '1750–1810', 1750, 1810, 'world-event-52-0', ['5.2'], ['GOV', 'ECN', 'SIO'], ['Contextualization', 'Causation']],
  ['apwh-u5-caracas-bolivar-independence-wars', '52', 2, 'Bolívar and the Wars of Independence', '1810–1825', 1810, 1825, 'world-event-52-0', ['5.2'], ['GOV', 'CDI'], ['Causation']],
  ['apwh-u5-caracas-fragmentation-caudillo-limits', '52', 3, 'Fragmentation, Caudillos, and Limited Social Change', '1820–1870', 1820, 1870, 'world-event-52-0', ['5.2'], ['GOV', 'SIO'], ['Comparison', 'CCOT']],

  ['apwh-u5-manchester-coal-capital-agriculture', '36', 1, 'Coal, Capital, and Agricultural Change', '1700–1800', 1700, 1800, 'world-event-36-0', ['5.3'], ['ENV', 'ECN'], ['Causation', 'Contextualization']],
  ['apwh-u5-manchester-steam-factory-system', '36', 2, 'Steam Power and the Factory System', '1769–1830', 1769, 1830, 'world-event-36-0', ['5.3', '5.5', '5.7'], ['TEC', 'ECN'], ['Causation']],
  ['apwh-u5-manchester-urban-class-labor-response', '36', 3, 'Urban Classes and Labor Responses', '1800–1900', 1800, 1900, 'world-event-36-0', ['5.8', '5.9', '5.10'], ['SIO', 'ECN'], ['Causation', 'CCOT']],

  ['apwh-u5-berlin-napoleonic-occupation-nationalism', '29', 1, 'Napoleonic Occupation and German Nationalism', '1800–1848', 1800, 1848, 'world-event-29-0', ['5.2'], ['GOV', 'CDI'], ['Causation', 'Contextualization']],
  ['apwh-u5-berlin-bismarck-wars-unification', '29', 2, 'Bismarck, War, and German Unification', '1862–1871', 1862, 1871, 'world-event-29-0', ['5.2'], ['GOV'], ['Causation']],
  ['apwh-u5-berlin-second-industrial-revolution-power', '29', 3, 'Second Industrial Revolution and National Power', '1870–1900', 1870, 1900, 'world-event-29-0', ['5.4', '5.5', '5.7'], ['TEC', 'ECN', 'GOV'], ['Causation', 'Comparison']],

  ['apwh-u5-tokyo-tokugawa-order-foreign-pressure', '14', 1, 'Tokugawa Order and Foreign Pressure', '1603–1868', 1603, 1868, 'world-event-14-1', ['5.4', '5.6'], ['GOV', 'ECN'], ['Contextualization', 'Causation']],
  ['apwh-u5-tokyo-meiji-political-fiscal-reform', '14', 2, 'Meiji Political and Fiscal Reform', '1868–1885', 1868, 1885, 'world-event-14-1', ['5.6'], ['GOV', 'SIO'], ['Causation']],
  ['apwh-u5-tokyo-state-industry-military-power', '14', 3, 'State Industry and Military Power', '1870–1900', 1870, 1900, 'world-event-14-1', ['5.4', '5.5', '5.6'], ['TEC', 'ECN', 'GOV'], ['Causation', 'Comparison']],

  ['apwh-u5-cairo-military-pressure-reform', '84', 1, 'Military Pressure and the Demand for Reform', '1798–1805', 1798, 1805, 'world-event-84-2', ['5.4', '5.6'], ['GOV', 'TEC'], ['Contextualization', 'Causation']],
  ['apwh-u5-cairo-cotton-conscription-factories', '84', 2, 'Cotton, Conscription, and State Factories', '1805–1848', 1805, 1848, 'world-event-84-2', ['5.4', '5.6'], ['GOV', 'ECN', 'TEC'], ['Causation']],
  ['apwh-u5-cairo-debt-intervention-limits', '84', 3, 'Debt, Foreign Intervention, and the Limits of Reform', '1840–1882', 1840, 1882, 'world-event-84-2', ['5.4', '5.6', '5.10'], ['GOV', 'ECN'], ['Causation', 'Comparison']],

  ['apwh-u5-seneca-rights-language-exclusion', '105', 1, "Revolutionary Rights and Women's Exclusion", '1776–1848', 1776, 1848, 'world-event-105-0', ['5.1', '5.8', '5.9'], ['SIO', 'GOV'], ['Contextualization', 'CCOT']],
  ['apwh-u5-seneca-declaration-sentiments', '105', 2, 'The Declaration of Sentiments', '1848', 1848, 1848, 'world-event-105-0', ['5.8', '5.9'], ['SIO', 'GOV', 'CDI'], ['Causation']],
  ['apwh-u5-seneca-organized-feminism-limits', '105', 3, 'Organized Feminism and Limited Immediate Change', '1848–1900', 1848, 1900, 'world-event-105-0', ['5.8', '5.9', '5.10'], ['SIO', 'GOV'], ['Causation', 'CCOT']],
];
```

## Learner-Content Contract

Each record must contain English-only `summary`, `significance`, `keyPeople`, `keyTerms`, at least two `evidence` statements, `examConnection`, and the shared two-field `source: { id, locator }` object. Lock the finished prose field-for-field in `expectedRecordContent` before accepting GREEN.

Required factual boundaries:

| Location | Required content and caveat |
| --- | --- |
| London | Bacon/Newton connect empirical natural law to Enlightenment reasoning; Hobbes, Locke, Montesquieu, Rousseau distinguish competing social-contract claims; do not claim British thinkers alone created Enlightenment thought. |
| Philadelphia | Colonial legislatures and imperial taxation contextualize independence; the Declaration adapts Locke; French aid matters; political independence did not immediately create universal suffrage or abolish slavery. |
| Paris | Fiscal crisis and estate privilege trigger institutional conflict; popular action and rights claims dismantle feudal privilege; distinguish early reform, Terror, and Napoleonic consolidation. |
| Port-au-Prince | Saint-Domingue's sugar wealth depended on racial chattel slavery; enslaved people and maroons drove revolt; Toussaint was central but did not personally declare the 1804 republic; Haiti uniquely joined abolition and successful independence. |
| Caracas | Creole wealth, mercantilism, office exclusion, and Spain's crisis explain revolt; Bolívar sought Gran Colombia; independence preserved substantial racial/class hierarchy and encouraged caudillo politics. |
| Manchester | Agriculture, coal, waterways, capital, property rules, and foreign resources are interacting causes; steam reorganizes production rather than merely speeding it up; class, urban, gender, and labor responses are unequal. Cite Glasgow/Adam Smith and Hangzhou/Great Divergence only as supporting comparisons. |
| Berlin | Napoleonic occupation strengthens nationalism; Bismarck uses Prussian institutions and wars; unification is not a spontaneous cultural event; steel, chemicals, electricity, finance, and state capacity support later power. Rome is supporting comparison evidence only. |
| Tokyo | Tokugawa structures and foreign pressure contextualize reform; Meiji reforms alter taxation, status, conscription, education, and ownership; industrial success is state-supported and socially costly, not simple Western imitation. Compare Beijing and Istanbul as evidence only. |
| Cairo | French/British military pressure contextualizes Muhammad Ali; cotton monopolies, conscription, schools, and factories finance reform; foreign pressure and debt constrain the project. Do not portray Egypt as simply passive or as fully independent of the Ottoman framework. |
| Seneca Falls | Revolutionary rights language excluded women; the Declaration of Sentiments deliberately adapts the Declaration of Independence; distinguish movement organization from immediate voting-rights success. Washington abolition evidence may support comparison but is not a graph endpoint. |

---

### Task 1: Lock the missing Unit 5 module in RED tests

**Files:**
- Create: `tests/apwh-u5-location-study.test.mjs`
- Expected missing file: `data/apwh-u5-location-study.js`

- [ ] **Step 1: Write the publication test**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const moduleUrl = new URL('../data/apwh-u5-location-study.js', import.meta.url);

test('publishes the Unit 5 location-study module', () => {
  assert.equal(existsSync(moduleUrl), true, 'Unit 5 data module must exist');
  const sandbox = {};
  sandbox.window = sandbox;
  vm.runInNewContext(readFileSync(moduleUrl, 'utf8'), sandbox);
  assert.equal(sandbox.APWH_U5_LOCATION_STUDY.unitId, 'u5');
  assert.equal(sandbox.APWH_U5_LOCATION_STUDY.unitNumber, 5);
});
```

- [ ] **Step 2: Confirm the intended RED**

```bash
$NODE --test tests/apwh-u5-location-study.test.mjs
```

Expected: one failure stating `Unit 5 data module must exist`, not a harness or syntax error.

- [ ] **Step 3: Commit the RED test**

```bash
git add tests/apwh-u5-location-study.test.mjs
git commit -m "test: require APWH Unit 5 location study"
```

### Task 2: Publish the exact immutable record contract

**Files:**
- Modify: `tests/apwh-u5-location-study.test.mjs`
- Create: `data/apwh-u5-location-study.js`

- [ ] **Step 1: Add the exact manifest and API assertions**

Insert `expectedLocations` and `expectedManifest` from this plan. Assert:

```js
assert.equal(api.unitId, 'u5');
assert.equal(api.unitNumber, 5);
assert.equal(api.connectionTimelineMode, 'main-event');
assert.deepEqual([...api.locationNumbers], [...expectedLocations.keys()]);
assert.equal(api.records.length, 30);
assert.deepEqual(api.records.map(record => [
  record.id, record.locationNumber, record.sequence, record.title,
  record.dateLabel, record.startYear, record.endYear, record.mainEventKey,
  [...record.topicCodes], [...record.themeIds], [...record.examSkills],
]), expectedManifest);
assert.deepEqual([...new Set(api.records.flatMap(record => record.topicCodes))].sort(),
  ['5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9', '5.10'].sort());
```

Also lock three records per location, sequence order, defensive arrays, deep freezing, `getById`, `getByLocation`, `locationName`, unknown lookup behavior, exact stable-ID prefix, approved themes/skills, and refusal to overwrite the global.

- [ ] **Step 2: Keep RED specific**

```bash
$NODE --test tests/apwh-u5-location-study.test.mjs
```

Expected: failure remains the missing module.

- [ ] **Step 3: Implement the immutable module**

Use the Unit 4 structure without copying learner data:

```js
(function publishUnit5LocationStudy(root) {
  'use strict';
  if (Object.prototype.hasOwnProperty.call(root, 'APWH_U5_LOCATION_STUDY')) {
    throw new Error('Invalid Unit 5 global APWH_U5_LOCATION_STUDY: refusing to overwrite existing value');
  }
  const UNIT_ID = 'u5';
  const UNIT_NUMBER = 5;
  const VALID_TOPIC_CODES = new Set(['5.1','5.2','5.3','5.4','5.5','5.6','5.7','5.8','5.9','5.10']);
  const VALID_THEME_IDS = new Set(['GOV','ECN','CDI','SIO','TEC','ENV']);
  const VALID_EXAM_SKILLS = new Set(['Causation','Comparison','CCOT','Contextualization']);
  // LOCATIONS and RAW_RECORDS are literal, local, validated, and deeply frozen.
})(typeof window !== 'undefined' ? window : globalThis);
```

Implement all thirty records with the exact manifest and Learner-Content Contract. Write exact content fixtures into the test before declaring GREEN.

- [ ] **Step 4: Add focused negative validation tests**

Use fresh VM evaluations with source substitutions to reject: wrong location/binding, duplicate sequence/ID, malformed date or label mismatch, missing/invalid/duplicate Topic/theme/skill, incomplete/non-English content, malformed actor/term/evidence/source, fourth record at a location, and null raw records/cards. Diagnostics must name `Invalid Unit 5` and the affected ID when available.

- [ ] **Step 5: Run focused tests and commit**

```bash
$NODE --test tests/apwh-u5-location-study.test.mjs
git diff --check
git add data/apwh-u5-location-study.js tests/apwh-u5-location-study.test.mjs
git commit -m "feat: add APWH Unit 5 location study data"
```

Expected: focused suite passes.

### Task 3: Add causal links, comparisons, cards, and source ledger

**Files:**
- Modify: `data/apwh-u5-location-study.js`
- Modify: `tests/apwh-u5-location-study.test.mjs`
- Create: `docs/data-sources/apwh-u5-location-study-source-ledger.md`

- [ ] **Step 1: Add failing exact graph fixtures**

Within each location, add `sequence 1 → 2` and `2 → 3` for twenty directed pairs. Add these eight cross-location directed pairs:

```js
const crossLocationCausalPairs = [
  ['apwh-u5-london-rights-language-atlantic', 'apwh-u5-philadelphia-declaration-independence'],
  ['apwh-u5-philadelphia-declaration-independence', 'apwh-u5-paris-popular-sovereignty-rights'],
  ['apwh-u5-paris-popular-sovereignty-rights', 'apwh-u5-haiti-enslaved-revolt-toussaint'],
  ['apwh-u5-paris-radicalization-napoleonic-diffusion', 'apwh-u5-caracas-bolivar-independence-wars'],
  ['apwh-u5-paris-radicalization-napoleonic-diffusion', 'apwh-u5-berlin-napoleonic-occupation-nationalism'],
  ['apwh-u5-manchester-steam-factory-system', 'apwh-u5-cairo-military-pressure-reform'],
  ['apwh-u5-manchester-steam-factory-system', 'apwh-u5-tokyo-tokugawa-order-foreign-pressure'],
  ['apwh-u5-philadelphia-republican-rights-limits', 'apwh-u5-seneca-rights-language-exclusion'],
];
```

Lock an explicit mechanism note for every pair: French military aid and the American constitutional precedent connect Philadelphia to Paris; Napoleon's invasion of Iberia weakens Spanish royal authority and opens the legitimacy crisis represented at Caracas; industrial military disparity creates reform pressure in Cairo and Tokyo. Do not encode chronology alone as causation.

Use these exact related pairs:

```js
const expectedRelatedPairs = [
  ['apwh-u5-philadelphia-republican-rights-limits', 'apwh-u5-haiti-emancipation-independence'],
  ['apwh-u5-haiti-emancipation-independence', 'apwh-u5-caracas-fragmentation-caudillo-limits'],
  ['apwh-u5-paris-radicalization-napoleonic-diffusion', 'apwh-u5-berlin-bismarck-wars-unification'],
  ['apwh-u5-cairo-cotton-conscription-factories', 'apwh-u5-tokyo-meiji-political-fiscal-reform'],
  ['apwh-u5-manchester-urban-class-labor-response', 'apwh-u5-seneca-organized-feminism-limits'],
];
```

Write exact English mechanism/comparison notes in test fixtures first. Assert reciprocal causal/related arrays and identical reciprocal notes, no self-links, duplicates, cross-category target reuse, or unresolved IDs.

- [ ] **Step 2: Add failing exact card fixtures**

```js
const expectedUnitCards = {
  context: {
    id: 'apwh-u5-context-empire-hierarchy-rights',
    kind: 'context',
    role: 'Unit 5 Context Card',
    title: 'How Imperial Hierarchy Produced Revolutionary Claims',
    examSkills: ['Contextualization', 'Causation'],
    summary: 'Unit 4 maritime empires accumulated wealth through trade, extraction, and coerced labor while organizing colonial societies through legal status and ancestry. Enlightenment arguments about reason, natural rights, and consent gave people excluded by those hierarchies a language they could reuse against imperial and social authority. Unit 5 follows both the spread of those political claims and the industrial transformation that changed which states could enforce power.',
    prompt: 'How did Unit 4 institutions create both the grievances and the communication networks that made Unit 5 revolutionary claims possible?',
    takeaways: [
      'Imperial extraction strengthened states while sharpening unequal legal and social positions.',
      'Rights language became reusable because it made legitimacy depend on people rather than ancestry.',
      'Different groups applied the same language to different forms of exclusion.',
    ],
  },
  synthesis: {
    id: 'apwh-u5-synthesis-industry-imperial-pressure',
    kind: 'synthesis',
    role: 'Unit 5 Synthesis Card',
    title: 'From Industrial Capacity to Imperial Expansion',
    examSkills: ['Causation', 'CCOT'],
    summary: 'Industrial production concentrated labor and capital, expanded transport and communication, and increased the military capacity of industrial states. Factories also required recurring supplies of cotton, rubber, metals, food, and fuel as well as reliable markets. Unit 6 examines how those capabilities and demands intensified imperial control, reorganized colonized economies, and moved workers across regions even as local states and communities resisted.',
    prompt: 'Which Unit 5 changes turned overseas expansion from an opportunity into a recurring economic and strategic pressure?',
    takeaways: [
      'Steam, rail, telegraphy, and industrial weapons increased the reach of states and firms.',
      'Factories created recurring demand for raw materials, labor, and consumers.',
      'Industrial power widened inequalities without eliminating resistance or local agency.',
    ],
  },
};
```

- [ ] **Step 3: Add the failing ledger contract**

Require exactly thirty five-column rows:

```text
Stable ID | AP topic assignment | Main event | Source locator | Claims covered
```

For each record, use an edition-neutral locator such as `AMSCO AP World History, Unit 5, Topic 5.2`; multiple-topic rows list each Topic explicitly. `Claims covered` must name the exact actors, mechanism, and caveat from the Learner-Content Contract. Reject missing/extra IDs, fewer or extra columns, trailing garbage, vague whole-book citations, and page numbers not independently verified.

- [ ] **Step 4: Implement graph, cards, and ledger**

Use the module's validated reciprocal graph helpers. Deep-freeze every graph array, note map, card, takeaway array, and source object. Publish `unitCards` and `getUnitCard(kind)`.

Create the ledger header:

```markdown
# APWH Unit 5 Location Study Source Ledger

The learner records use edition-neutral locators in AMSCO AP World History Unit 5 and the College Board framework effective Fall 2026. Map pins are representative anchors; a named city does not imply that every regional process occurred only there.
```

- [ ] **Step 5: Run tests and commit**

```bash
$NODE --test tests/apwh-u5-location-study.test.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add data/apwh-u5-location-study.js tests/apwh-u5-location-study.test.mjs docs/data-sources/apwh-u5-location-study-source-ledger.md
git commit -m "feat: connect APWH Unit 5 location studies"
```

Expected: focused and full Node suites pass.

### Task 4: Register Unit 5 in the shared renderer

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`
- Modify: `world-map.html`
- Modify: `index.html`

- [ ] **Step 1: Add failing registration assertions**

Require both HTML files to load:

```html
<script src="data/apwh-u5-location-study.js"></script>
```

Require the registries to include:

```js
u5: 'APWH_U5_LOCATION_STUDY'
```

Add a positive Manchester smoke test:

```js
await page.evaluate(() => {
  window.__mapFilter.setPeriod('u5');
  window.__mapFilter.openHit('36', 'europe', 'world-event-36-0');
});
await expectVisible(page.locator('#eventPanel [data-location-study-open="36"]'),
  'Unit 5 Manchester must expose a location-study entry');
```

Expected browser verifier result: FAIL because U5 is not loaded or registered.

- [ ] **Step 2: Add only the loader and registry entries**

Do not copy renderer functions, add U5 branches, or alter the U4 capability logic. The U5 API's `connectionTimelineMode: 'main-event'` must activate existing navigation behavior.

- [ ] **Step 3: Verify and commit**

```bash
$NODE scripts/verify-world-timeline.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add world-map.html index.html scripts/verify-world-timeline.mjs
git commit -m "feat: render APWH Unit 5 location studies"
```

Expected: registration smoke test and existing U1–U4 contracts pass.

### Task 5: Lock all ten standalone and homepage interactions

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Add the exact browser fixture**

Create `UNIT_5_STUDY_VIEWS` from `expectedLocations` and the thirty IDs in this plan. Include each exact `number`, map `region`, learner label, main-event key, and ordered three-ID array. Assert ten unique locations and thirty unique IDs.

- [ ] **Step 2: Verify every standalone view**

For each location: select U5, open the exact event, assert Timeline/map selection, open `View all 3 study points`, check heading and ID order, click all rows, and verify exactly one expanded/current detail. Outer Back must restore ordinary event content and focus.

- [ ] **Step 3: Verify every homepage view**

Repeat the same ten-location contract through `#worldMapFrame` and `#home-events`. Wait for iframe filter state rather than using fixed timeouts. Assert canonical/mirror parity and homepage control synchronization.

- [ ] **Step 4: Verify navigation edges and cleanup**

Cover at minimum:

- within-location causal: Manchester condition → factory mechanism;
- cross-location causal: London rights → Philadelphia declaration;
- cross-location causal with different region: Manchester factory → Tokyo pressure;
- related comparison: Cairo state factories ↔ Tokyo Meiji reform;
- two-level navigation stack with query, category, and region filters;
- connection Back and target outer Back with exact Timeline/current card, filters, homepage controls, and source-entry focus;
- U5 → U4 and U5 → U6 cleanup with no stale study state;
- a secondary U5 location such as Glasgow has ordinary event detail but no study entry.

- [ ] **Step 5: Confirm RED before expanding production behavior**

Run:

```bash
$NODE scripts/verify-world-timeline.mjs
```

If failures reveal a shared-renderer defect, add the smallest failing contract and fix the shared capability generically; do not introduce a literal U5 conditional.

- [ ] **Step 6: Verify and commit browser contracts**

```bash
$NODE scripts/verify-world-timeline.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add scripts/verify-world-timeline.mjs world-map.html index.html
git commit -m "test: verify APWH Unit 5 study interactions"
```

Expected: all ten locations pass in both surfaces and U1–U4 remain green.

### Task 6: Final regression and integration readiness

**Files:**
- Review all files changed since design commit `92e171f`.

- [ ] **Step 1: Run the focused U5 suite once**

```bash
$NODE --test tests/apwh-u5-location-study.test.mjs
```

Expected: all U5 tests pass.

- [ ] **Step 2: Run complete verification once**

```bash
$NODE --test tests/*.test.mjs
$NODE scripts/verify-world-timeline.mjs
git diff --check 92e171f..HEAD
git status --short
```

Expected: all Node tests and browser verification pass; diff check succeeds; worktree is clean.

- [ ] **Step 3: Audit scope**

Confirm the branch adds only the U5 module, U5 ledger/tests, two loader/registry entries, U5 browser contracts, design, and plan. Confirm all thirty-one existing U5 Timeline events and the nine secondary locations remain unchanged.

- [ ] **Step 4: Request one final code review**

Review base `92e171f` through HEAD for Critical/Important issues. Fix only verified blockers, rerun the affected focused test, then run the complete verification once.

- [ ] **Step 5: Finish the branch**

Use `superpowers:finishing-a-development-branch`. Do not merge into `agent/apwh-integration`, push, create a PR, or remove the worktree until the user chooses.
