# APWH Unit 6 Location Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ten Unit 6 location studies with thirty causally ordered records, reciprocal comparison links, and identical standalone/homepage behavior.

**Architecture:** Publish one immutable `APWH_U6_LOCATION_STUDY` module matching the established Unit 5 API and opt it into the existing capability-driven Timeline synchronization. Register it in the current shared renderer; do not create another mode, panel, renderer, map pin, or Timeline dataset. Keep the other eighteen Unit 6 locations and all thirty-seven Timeline events as ordinary evidence.

**Tech Stack:** Static JavaScript IIFE modules, HTML registries, Node.js `node:test` and `vm`, Markdown source ledger, Playwright browser verification.

---

## File Structure

- Create `data/apwh-u6-location-study.js`: canonical records, validation, graph, cards, and frozen API.
- Create `tests/apwh-u6-location-study.test.mjs`: exact metadata, content, API, graph, and ledger validation.
- Create `docs/data-sources/apwh-u6-location-study-source-ledger.md`: one exact row per record.
- Modify `world-map.html`: load and register `APWH_U6_LOCATION_STUDY` only.
- Modify `index.html`: register the same global for the homepage mirror only.
- Modify `scripts/verify-world-timeline.mjs`: positive U6 standalone/homepage contracts.

Use this runtime:

```bash
NODE=/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
```

The design authority is `docs/superpowers/specs/2026-09-11-apwh-u6-location-study-design.md`. Its non-goals and geography caveats are acceptance requirements.

## Canonical Runtime Contract

Use this exact location order:

```js
const expectedLocations = new Map([
  ['29', 'Imperial Partition · Berlin'],
  ['89', 'British West Africa · Lagos'],
  ['91', 'Congo Free State · Kinshasa'],
  ['6', 'British India · Delhi'],
  ['15', 'Opium Wars · Canton / Guangzhou'],
  ['80', 'Ethiopian Resistance · Adwa'],
  ['88', 'Suez Canal · Suez'],
  ['67', 'Indigenous Displacement · Wounded Knee'],
  ['53', 'Argentina: Export Economy & Migration · Buenos Aires'],
  ['70', 'Chinese Migration & Exclusion · San Francisco'],
]);
```

Use this exact record metadata. Tuple order is:

```text
id, locationNumber, sequence, title, dateLabel, startYear, endYear,
mainEventKey, topicCodes, themeIds, examSkills
```

```js
const expectedManifest = [
  ['apwh-u6-berlin-industrial-rivalry-rationales','29',1,'Industrial Rivalry and Imperial Rationales','1800–1884',1800,1884,'world-event-29-1',['6.1','6.8'],['ECN','GOV','CDI'],['Contextualization','Causation']],
  ['apwh-u6-berlin-conference-effective-occupation','29',2,'Berlin Conference and Effective Occupation','1884–1885',1884,1885,'world-event-29-1',['6.2'],['GOV'],['Causation']],
  ['apwh-u6-berlin-borders-rivalry-consequences','29',3,'Artificial Borders and Imperial Rivalry','1885–1900',1885,1900,'world-event-29-1',['6.2','6.8'],['GOV','CDI'],['Causation','CCOT']],

  ['apwh-u6-lagos-industrial-palm-oil-demand','89',1,'Industrial Demand for Palm Oil','1800–1900',1800,1900,'world-event-89-0',['6.1','6.4'],['ECN','TEC'],['Causation','Contextualization']],
  ['apwh-u6-lagos-treaty-trade-political-control','89',2,'From Trade Treaty to Political Control','1870–1885',1870,1885,'world-event-89-0',['6.2','6.5'],['GOV','ECN'],['Causation']],
  ['apwh-u6-lagos-export-economy-dependence','89',3,'Export Economy and Colonial Dependence','1800–1900',1800,1900,'world-event-89-0',['6.4','6.5'],['ECN'],['Causation','CCOT']],

  ['apwh-u6-congo-quinine-steamship-access','91',1,'Quinine, Steamships, and Inland Access','1850–1880',1850,1880,'world-event-91-0',['6.2'],['TEC','ENV'],['Causation','Contextualization']],
  ['apwh-u6-congo-leopold-private-colony','91',2,"Leopold's Private Colony",'1885–1908',1885,1908,'world-event-91-0',['6.1','6.2'],['GOV','ECN'],['Causation']],
  ['apwh-u6-congo-forced-rubber-demographic-catastrophe','91',3,'Forced Rubber Labor and Demographic Catastrophe','1885–1908',1885,1908,'world-event-91-0',['6.4','6.5'],['ECN','SIO'],['Causation','CCOT']],

  ['apwh-u6-delhi-company-rule-rebellion','6',1,'Company Rule and the 1857 Rebellion','1757–1858',1757,1858,'world-event-6-2',['6.2','6.3'],['GOV','CDI'],['Contextualization','Causation']],
  ['apwh-u6-delhi-crown-rule-economic-restructuring','6',2,'Crown Rule and Economic Restructuring','1858–1900',1858,1900,'world-event-6-2',['6.4','6.5'],['GOV','ECN'],['Causation']],
  ['apwh-u6-delhi-indenture-labor-migration','6',3,'Indenture and Indian Ocean Labor Migration','1830–1900',1830,1900,'world-event-6-2',['6.6','6.7'],['ECN','SIO'],['Causation','Comparison']],

  ['apwh-u6-guangzhou-trade-imbalance-opium','15',1,'Trade Imbalance and the Opium System','1700–1839',1700,1839,'world-event-15-0',['6.5'],['ECN'],['Contextualization','Causation']],
  ['apwh-u6-guangzhou-opium-war-unequal-treaty','15',2,'Gunboat War and Unequal Treaties','1839–1860',1839,1860,'world-event-15-0',['6.2','6.5'],['GOV','TEC','ECN'],['Causation']],
  ['apwh-u6-guangzhou-treaty-ports-spheres','15',3,'Treaty Ports and Spheres of Influence','1842–1900',1842,1900,'world-event-15-0',['6.5','6.8'],['GOV','ECN'],['Causation','CCOT']],

  ['apwh-u6-adwa-italian-expansion-pressure','80',1,'Italian Expansion and Ethiopian Pressure','1880–1895',1880,1895,'world-event-80-0',['6.1','6.2'],['GOV','CDI'],['Contextualization','Causation']],
  ['apwh-u6-adwa-ethiopian-military-resistance','80',2,'Organized Ethiopian Military Resistance','1895–1896',1895,1896,'world-event-80-0',['6.3'],['GOV','CDI'],['Causation']],
  ['apwh-u6-adwa-independence-comparative-outcome','80',3,'Independence and Comparative Outcomes','1896–1900',1896,1900,'world-event-80-0',['6.3','6.8'],['GOV'],['Comparison','CCOT']],

  ['apwh-u6-suez-industrial-trade-route','88',1,'Industrial Trade and the Shorter Route','1850–1869',1850,1869,'world-event-88-0',['6.1','6.4'],['ECN','TEC'],['Causation','Contextualization']],
  ['apwh-u6-suez-canal-labor-construction','88',2,'Canal Construction and Egyptian Labor','1859–1869',1859,1869,'world-event-88-0',['6.2','6.4'],['TEC','SIO','ECN'],['Causation']],
  ['apwh-u6-suez-debt-strategic-control','88',3,'Debt and British Strategic Control','1870–1882',1870,1882,'world-event-88-0',['6.2','6.5'],['GOV','ECN'],['Causation','CCOT']],

  ['apwh-u6-wounded-knee-settler-land-expansion','67',1,'Settler Expansion and Indigenous Land Loss','1830–1890',1830,1890,'world-event-67-0',['6.2'],['GOV','ENV'],['Contextualization','Causation']],
  ['apwh-u6-wounded-knee-ghost-dance-resistance','67',2,'Ghost Dance as Cultural Resistance','1889–1890',1889,1890,'world-event-67-0',['6.3'],['CDI','SIO'],['Causation']],
  ['apwh-u6-wounded-knee-massacre-dispossession','67',3,'Massacre and Consolidated Dispossession','1890',1890,1890,'world-event-67-0',['6.3','6.8'],['GOV','SIO'],['Causation','CCOT']],

  ['apwh-u6-buenos-aires-export-growth-labor-demand','53',1,'Export Growth and Labor Demand','1850–1880',1850,1880,'world-event-53-1',['6.4','6.6'],['ECN'],['Causation','Contextualization']],
  ['apwh-u6-buenos-aires-european-migration','53',2,'European Migration to Argentina','1880–1909',1880,1909,'world-event-53-1',['6.6'],['ECN','SIO'],['Causation']],
  ['apwh-u6-buenos-aires-urban-growth-land-inequality','53',3,'Urban Growth and Unequal Landholding','1880–1900',1880,1900,'world-event-53-1',['6.7'],['ECN','SIO'],['Causation','CCOT']],

  ['apwh-u6-san-francisco-railroad-labor-demand','70',1,'Railroad Labor Demand in the American West','1860–1869',1860,1869,'world-event-70-0',['6.6'],['ECN','TEC'],['Contextualization','Causation']],
  ['apwh-u6-san-francisco-chinese-migration-community','70',2,'Chinese Migration and Community Formation','1850–1880',1850,1880,'world-event-70-0',['6.6','6.7'],['SIO','ECN'],['Causation']],
  ['apwh-u6-san-francisco-exclusion-racialization','70',3,'Exclusion and the Racialization of Labor','1870–1882',1870,1882,'world-event-70-0',['6.7'],['GOV','SIO'],['Causation','CCOT']],
];
```

## Learner-Content Contract

Every record contains English-only `summary`, `significance`, `keyPeople`, `keyTerms`, at least two `evidence` statements, `examConnection`, and `source: { id: 'amsco-apwh-u6', locator }`. Tests lock the finished prose field-for-field before GREEN.

Required factual boundaries:

| Location | Required content and caveat |
| --- | --- |
| Berlin | Industrial production, nationalism, and rivalry are interacting rationales; Bismarck convened the conference to regulate European competition; no Africans participated; artificial borders divided communities and joined rivals. Do not claim the conference itself completed every conquest. |
| Lagos | British demand for palm oil connected factories to West African exports; King Jaja initially used treaty trade and local agency; political control narrowed that agency; export dependence did not mean Africans were passive. |
| Kinshasa | Quinine and more efficient steamships lowered barriers to inland penetration; Leopold personally controlled the Congo Free State; rubber and ivory quotas used hostage-taking and mutilation; distinguish private royal ownership from an ordinary Belgian colony before 1908. |
| Delhi | East India Company rule precedes Crown rule; the 1857 rebellion had military, religious, and political causes; colonial railways and cash crops served imperial priorities as well as local movement; indenture followed slavery's abolition but was not legally identical to slavery. |
| Guangzhou | Britain used Indian opium to reverse a trade imbalance; the Opium Wars exposed industrial military disparity; unequal treaties opened ports and privileges; use `Canton / Guangzhou` and explain that Canton is the historical English name. |
| Adwa | Italian pressure met organized Ethiopian resistance; the decisive battle occurred in 1896 although the existing Timeline card begins in 1895; retained independence was exceptional but not evidence that all African resistance succeeded. Do not silently repeat the existing AMSCO date simplification. |
| Suez | The canal shortened Europe–Asia travel and used large-scale Egyptian corvée labor; debt and share purchases increased foreign leverage; British occupation protected a route to India. Do not describe the canal as originally a British project. |
| Wounded Knee | Settler expansion and federal policy drove land loss; the Ghost Dance was a religious and cultural resistance movement, not simply a military uprising; the 1890 massacre consolidated dispossession. Treat Wounded Knee as a representative anchor for a wider process. |
| Buenos Aires | Export agriculture and rail connections increased labor demand; Argentina actively encouraged European immigration; migrants contributed to urban growth while large estates and inequality persisted. Do not treat every migrant as permanently prosperous. |
| San Francisco | Western rail construction recruited Chinese labor; migrants formed durable communities; economic competition and racial politics produced exclusion. Promontory supplies railway evidence, while San Francisco is the representative anchor for the wider western process. |

## Exact Graph Contract

Every location contains the directed pairs `sequence 1 → 2` and `sequence 2 → 3`. Those local paths already cover Delhi restructuring → indenture, San Francisco labor demand → migration, and Buenos Aires export growth → migration. Add these three genuinely cross-location causal pairs with exact mechanism notes locked in tests:

```js
const crossLocationCausalPairs = [
  ['apwh-u6-lagos-industrial-palm-oil-demand','apwh-u6-berlin-industrial-rivalry-rationales'],
  ['apwh-u6-berlin-conference-effective-occupation','apwh-u6-congo-leopold-private-colony'],
  ['apwh-u6-suez-industrial-trade-route','apwh-u6-delhi-crown-rule-economic-restructuring'],
];
```

Use these exact reciprocal related pairs:

```js
const expectedRelatedPairs = [
  ['apwh-u6-delhi-crown-rule-economic-restructuring','apwh-u6-guangzhou-treaty-ports-spheres'],
  ['apwh-u6-congo-forced-rubber-demographic-catastrophe','apwh-u6-delhi-indenture-labor-migration'],
  ['apwh-u6-adwa-independence-comparative-outcome','apwh-u6-wounded-knee-massacre-dispossession'],
  ['apwh-u6-buenos-aires-european-migration','apwh-u6-san-francisco-exclusion-racialization'],
  ['apwh-u6-lagos-treaty-trade-political-control','apwh-u6-congo-leopold-private-colony'],
];
```

Comparison notes explicitly distinguish direct rule from spheres of influence, forced labor from indenture, successful from suppressed resistance, encouraged from excluded migration, and treaty expansion from private-colony rule.

---

### Task 1: Create an isolated U6 worktree and lock publication in RED

**Files:**
- Create: `tests/apwh-u6-location-study.test.mjs`
- Expected missing file: `data/apwh-u6-location-study.js`

- [ ] **Step 1: Create an isolated branch**

Use `superpowers:using-git-worktrees` from the clean latest `agent/apwh-integration` containing this committed plan. Create branch `feature/apwh-u6-location-study` and record its absolute worktree path.

- [ ] **Step 2: Write the publication test**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const moduleUrl = new URL('../data/apwh-u6-location-study.js', import.meta.url);

test('publishes the Unit 6 location-study module', () => {
  assert.equal(existsSync(moduleUrl), true, 'Unit 6 data module must exist');
  const sandbox = {};
  sandbox.window = sandbox;
  vm.runInNewContext(readFileSync(moduleUrl, 'utf8'), sandbox);
  assert.equal(sandbox.APWH_U6_LOCATION_STUDY.unitId, 'u6');
  assert.equal(sandbox.APWH_U6_LOCATION_STUDY.unitNumber, 6);
});
```

- [ ] **Step 3: Verify RED and commit**

```bash
$NODE --test tests/apwh-u6-location-study.test.mjs
git add tests/apwh-u6-location-study.test.mjs
git commit -m "test: require APWH Unit 6 location study"
```

Expected: the test fails only because `data/apwh-u6-location-study.js` does not exist; the RED test commit succeeds.

### Task 2: Publish the exact immutable record contract

**Files:**
- Modify: `tests/apwh-u6-location-study.test.mjs`
- Create: `data/apwh-u6-location-study.js`

- [ ] **Step 1: Add the exact manifest and API assertions**

Insert `expectedLocations` and `expectedManifest` from this plan. Assert:

```js
assert.equal(api.unitId, 'u6');
assert.equal(api.unitNumber, 6);
assert.equal(api.connectionTimelineMode, 'main-event');
assert.deepEqual([...api.locationNumbers], [...expectedLocations.keys()]);
assert.equal(api.records.length, 30);
assert.deepEqual(api.records.map(record => [
  record.id, record.locationNumber, record.sequence, record.title,
  record.dateLabel, record.startYear, record.endYear, record.mainEventKey,
  [...record.topicCodes], [...record.themeIds], [...record.examSkills],
]), expectedManifest);
assert.deepEqual([...new Set(api.records.flatMap(record => record.topicCodes))].sort(),
  ['6.1','6.2','6.3','6.4','6.5','6.6','6.7','6.8']);
```

Also lock three records per location, sequence order, defensive arrays, deep freezing, `getById`, `getByLocation`, `locationName`, unknown lookup behavior, exact `apwh-u6-` prefix, approved themes/skills, and refusal to overwrite the global.

- [ ] **Step 2: Write exact learner-content fixtures before implementation**

For all thirty records, test exact `summary`, `significance`, `keyPeople`, `keyTerms`, `evidence`, `examConnection`, and source locator. Use the Learner-Content Contract above as the factual boundary. Every summary and significance must state a mechanism or comparison, not merely restate the title.

- [ ] **Step 3: Implement the minimal immutable module**

```js
(function publishUnit6LocationStudy(root) {
  'use strict';
  if (Object.prototype.hasOwnProperty.call(root, 'APWH_U6_LOCATION_STUDY')) {
    throw new Error('Invalid Unit 6 global APWH_U6_LOCATION_STUDY: refusing to overwrite existing value');
  }
  const UNIT_ID = 'u6';
  const UNIT_NUMBER = 6;
  const VALID_TOPIC_CODES = new Set(['6.1','6.2','6.3','6.4','6.5','6.6','6.7','6.8']);
  const VALID_THEME_IDS = new Set(['GOV','ECN','CDI','SIO','TEC','ENV']);
  const VALID_EXAM_SKILLS = new Set(['Causation','Comparison','CCOT','Contextualization']);
  // Define the ten literal locations and thirty literal records from this plan.
  // Validate before publishing; deep-freeze every nested value and public result.
})(typeof window !== 'undefined' ? window : globalThis);
```

Publish exactly `unitId`, `unitNumber`, `connectionTimelineMode`, `locationNumbers`, `records`, `unitCards`, `compareRecords`, `getById`, `getByLocation`, `locationName`, and `getUnitCard` with the same descriptors as the Unit 5 API.

- [ ] **Step 4: Add focused negative validation tests**

Use fresh VM evaluations with source substitutions to reject: wrong location or main-event binding, duplicate sequence or ID, malformed date or label mismatch, missing/invalid/duplicate Topic/theme/skill, incomplete/non-English content, malformed actor/term/evidence/source, fourth record at a location, null raw records/cards, unresolved graph IDs, self-links, duplicate links, and global overwrite. Diagnostics must name `Invalid Unit 6` and the affected ID when available.

- [ ] **Step 5: Run focused tests and commit**

```bash
$NODE --test tests/apwh-u6-location-study.test.mjs
git diff --check
git add data/apwh-u6-location-study.js tests/apwh-u6-location-study.test.mjs
git commit -m "feat: add APWH Unit 6 location study data"
```

Expected: all U6 data and validation tests pass.

### Task 3: Add graph, cards, and source ledger

**Files:**
- Modify: `data/apwh-u6-location-study.js`
- Modify: `tests/apwh-u6-location-study.test.mjs`
- Create: `docs/data-sources/apwh-u6-location-study-source-ledger.md`

- [ ] **Step 1: Add failing exact graph fixtures**

Assert every location has reciprocal cause/effect navigation for `1 → 2 → 3`, the six declared cross-location causal inputs resolve without duplicate edges, and all five related pairs are reciprocal with identical notes. Reject chronology-only causal notes, self-links, unresolved IDs, and target reuse across causal/related categories.

- [ ] **Step 2: Add failing exact card fixtures**

Lock these two cards field-for-field:

```js
const expectedUnitCards = {
  context: {
    id: 'apwh-u6-context-industry-imperial-pressure',
    kind: 'context', role: 'Unit 6 Context Card',
    title: 'From Industrial Capacity to Imperial Pressure',
    examSkills: ['Contextualization','Causation'],
    summary: 'Unit 5 industrialization concentrated productive and military power while creating recurring demand for raw materials, markets, workers, and dependable transport routes. Unit 6 examines how states and firms converted those capabilities and pressures into territorial, treaty, financial, and settler control, while local communities retained agency and resisted in different ways.',
    prompt: 'Which Unit 5 changes made overseas control more feasible and more valuable to industrial states?',
    takeaways: [
      'Industrial weapons, steam transport, and medicine increased the reach of states and firms.',
      'Factories required recurring supplies and markets rather than occasional luxury trade.',
      'Expansion depended on local conditions and choices as well as European capabilities.',
    ],
  },
  synthesis: {
    id: 'apwh-u6-synthesis-imperial-systems-global-conflict',
    kind: 'synthesis', role: 'Unit 6 Synthesis Card',
    title: 'From Imperial Systems to Global Conflict',
    examSkills: ['Causation','CCOT'],
    summary: 'Imperial systems placed industrial states\' resources, markets, routes, labor supplies, and security interests outside their borders. Competing claims increasingly overlapped, while colonial boundaries, racial hierarchies, indigenous resistance, and nationalist organization created unresolved pressures. Unit 7 follows how those structures contributed to global wars, mass mobilization, and mass violence.',
    prompt: 'How did Unit 6 make a conflict in one region capable of activating states, resources, and populations across the world?',
    takeaways: [
      'Industrial states treated distant ports, mines, and routes as national security interests.',
      'Imperial rivalry and artificial borders carried unresolved conflicts into the twentieth century.',
      'Colonized peoples developed resistance and nationalist organizations that outlasted imperial rule.',
    ],
  },
};
```

- [ ] **Step 3: Add the failing ledger contract**

Require exactly thirty five-column rows:

```text
Stable ID | AP topic assignment | Main event | Source locator | Claims covered
```

Use edition-neutral locators such as `AMSCO AP World History, Unit 6, Topic 6.3`. Each claims cell must name the actors, mechanism, and geographic caveat required by the Learner-Content Contract. Reject missing/extra IDs, wrong main-event bindings, malformed columns, trailing content, vague whole-book citations, and unverified page numbers.

- [ ] **Step 4: Implement graph, cards, and ledger**

Use validated graph helpers that store unique reciprocal links and identical reciprocal notes. Deep-freeze graph arrays, note maps, cards, takeaway arrays, and source objects. Publish `unitCards`, `compareRecords`, and `getUnitCard(kind)`.

Create the ledger with this exact introduction:

```markdown
# APWH Unit 6 Location Study Source Ledger

The learner records use edition-neutral locators in AMSCO AP World History Unit 6 and the College Board framework effective Fall 2026. Map pins are representative anchors; a named city does not imply that every regional process occurred only there.
```

- [ ] **Step 5: Run tests and commit**

```bash
$NODE --test tests/apwh-u6-location-study.test.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add data/apwh-u6-location-study.js tests/apwh-u6-location-study.test.mjs docs/data-sources/apwh-u6-location-study-source-ledger.md
git commit -m "feat: connect APWH Unit 6 location studies"
```

Expected: focused and complete Node suites pass.

### Task 4: Register Unit 6 in the shared renderer

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`
- Modify: `world-map.html`
- Modify: `index.html`

- [ ] **Step 1: Add failing registration assertions**

Require both HTML files to load exactly once before page logic:

```html
<script src="data/apwh-u6-location-study.js"></script>
```

Require both registries to append:

```js
u6: 'APWH_U6_LOCATION_STUDY'
```

Add a positive Congo smoke test:

```js
await page.evaluate(() => {
  window.__mapFilter.setPeriod('u6');
  window.__mapFilter.openHit('91', 'africa', 'world-event-91-0');
});
await expectVisible(page.locator('#eventPanel [data-location-study-open="91"]'),
  'Unit 6 Congo must expose a location-study entry');
```

Expected: browser verifier fails because U6 is not yet loaded or registered.

- [ ] **Step 2: Add only loader and registry entries**

Place the U6 loader after the U5 loader in each HTML file. Append U6 to `LOCATION_STUDY_GLOBAL_BY_UNIT` and `HOME_STUDY_GLOBAL_BY_UNIT`. Do not copy renderer functions, add U6 branches, or alter the capability logic.

- [ ] **Step 3: Verify and commit**

```bash
$NODE scripts/verify-world-timeline.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add world-map.html index.html scripts/verify-world-timeline.mjs
git commit -m "feat: render APWH Unit 6 location studies"
```

Expected: the U6 registration smoke test and all U1–U5 contracts pass.

### Task 5: Lock all ten standalone and homepage interactions

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Add the exact browser fixture**

Create `UNIT_6_STUDY_VIEWS` with these region identifiers:

```js
const UNIT_6_STUDY_VIEWS = Object.freeze([
  ['29','europe','Imperial Partition · Berlin','world-event-29-1'],
  ['89','africa','British West Africa · Lagos','world-event-89-0'],
  ['91','africa','Congo Free State · Kinshasa','world-event-91-0'],
  ['6','asia','British India · Delhi','world-event-6-2'],
  ['15','asia','Opium Wars · Canton / Guangzhou','world-event-15-0'],
  ['80','africa','Ethiopian Resistance · Adwa','world-event-80-0'],
  ['88','mideast','Suez Canal · Suez','world-event-88-0'],
  ['67','americas','Indigenous Displacement · Wounded Knee','world-event-67-0'],
  ['53','americas','Argentina: Export Economy & Migration · Buenos Aires','world-event-53-1'],
  ['70','americas','Chinese Migration & Exclusion · San Francisco','world-event-70-0'],
]);
```

Convert each tuple to the established frozen fixture shape and attach the ordered three IDs from `expectedManifest`. Assert ten unique locations, thirty unique IDs, and three IDs per location.

- [ ] **Step 2: Verify every standalone view**

For each fixture: select U6, open the exact event, assert Timeline/map selection, open `View all 3 study points`, check the process-first heading and stable-ID order, click all rows, and verify exactly one expanded/current detail. Outer Back restores the ordinary event and focus.

- [ ] **Step 3: Verify every homepage view**

Repeat the ten-location contract through `#worldMapFrame` and `#home-events`. Wait on iframe filter state rather than fixed timeouts. Assert canonical/mirror parity and homepage control synchronization.

- [ ] **Step 4: Verify navigation edges and cleanup**

Cover exactly these representative paths:

- within-location causal: Berlin rationale → conference;
- cross-location causal: Lagos palm-oil demand → Berlin rationale;
- cross-region causal: Suez trade route → Delhi economic restructuring;
- related comparison: Delhi direct rule ↔ Guangzhou spheres of influence;
- related comparison: Buenos Aires encouraged migration ↔ San Francisco exclusion;
- two-level navigation stack with query, category, and region filters;
- connection Back and target outer Back restoring Timeline/current card, filters, homepage controls, and source-entry focus;
- U6 → U5 and U6 → U7 cleanup with no stale study state;
- unsupported U6 pin `20` Kabul retains ordinary detail and has no study entry.

- [ ] **Step 5: Fix only demonstrated shared-renderer defects**

Run the verifier after adding contracts. If a failure exposes shared behavior, add the smallest failing assertion and repair the generic capability-driven code. Do not add a literal U6 conditional.

- [ ] **Step 6: Verify and commit browser contracts**

```bash
$NODE scripts/verify-world-timeline.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add scripts/verify-world-timeline.mjs world-map.html index.html
git commit -m "test: verify APWH Unit 6 study interactions"
```

Expected: all ten locations pass on both surfaces and U1–U5 remain green.

### Task 6: Final regression and integration readiness

**Files:**
- Review all files changed since the merge base with `agent/apwh-integration`.

- [ ] **Step 1: Run the focused U6 suite**

```bash
$NODE --test tests/apwh-u6-location-study.test.mjs
```

Expected: all U6 tests pass.

- [ ] **Step 2: Run complete verification once**

```bash
$NODE --test tests/*.test.mjs
$NODE scripts/verify-world-timeline.mjs
U6_BASE_COMMIT=$(git merge-base agent/apwh-integration HEAD)
git diff --check "$U6_BASE_COMMIT"..HEAD
git status --short
```

Expected: all Node tests and browser verification pass, diff check succeeds, and the worktree is clean.

- [ ] **Step 3: Audit scope**

Confirm the branch adds only the U6 module, U6 ledger/tests, two loader/registry entries, and U6 browser contracts beyond `U6_BASE_COMMIT`. Verify the exact thirty-seven-item `WORLD_TIMELINE_UNIT_MEMBERS.u6` list, the twenty-eight U6 locations, all map coordinates, and every U6 chain object are byte-for-byte unchanged from that base.

- [ ] **Step 4: Request final code review**

Review `U6_BASE_COMMIT..HEAD` for Critical and Important issues. Fix only verified blockers, rerun the affected focused test, then run the complete verification once.

- [ ] **Step 5: Finish the branch**

Use `superpowers:finishing-a-development-branch`. Do not merge into `agent/apwh-integration`, push, create a PR, or remove the worktree until the user chooses.
