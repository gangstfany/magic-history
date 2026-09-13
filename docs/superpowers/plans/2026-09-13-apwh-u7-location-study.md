# APWH Unit 7 Location Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ten Unit 7 location studies with thirty causally ordered records, responsible atrocity comparisons, and identical standalone/homepage behavior.

**Architecture:** Publish one immutable `APWH_U7_LOCATION_STUDY` module matching the established Unit 5–6 API and opt it into the existing capability-driven Timeline synchronization. Register it in the shared renderer; do not create another mode, panel, renderer, map pin, Timeline dataset, or literal U7 rendering branch. Keep the other eleven Unit 7 locations and all twenty-eight Timeline events as ordinary evidence.

**Tech Stack:** Static JavaScript IIFE modules, HTML registries, Node.js `node:test` and `vm`, Markdown source ledger, Playwright browser verification.

---

## File Structure

- Create `data/apwh-u7-location-study.js`: canonical records, validation, graph, cards, and frozen API.
- Create `tests/apwh-u7-location-study.test.mjs`: exact metadata, content, API, graph, card, and ledger validation.
- Create `docs/data-sources/apwh-u7-location-study-source-ledger.md`: one exact row per record.
- Modify `world-map.html`: load and register `APWH_U7_LOCATION_STUDY` only.
- Modify `index.html`: load and register the same global for the homepage mirror only.
- Modify `scripts/verify-world-timeline.mjs`: positive U7 standalone/homepage contracts and unsupported-location coverage.

Use this runtime:

```bash
NODE=/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
```

The design authority is `docs/superpowers/specs/2026-09-13-apwh-u7-location-study-design.md`. Its non-goals, renamed-place notes, and atrocity-comparison boundaries are acceptance requirements.

## Canonical Runtime Contract

Use this exact location order and binding map:

```js
const expectedLocations = new Map([
  ['108', 'Imperial Rivalry in East Asia · Mukden / Shenyang'],
  ['30', 'World War I Origins · Sarajevo'],
  ['46', 'Industrialized Total War · Verdun'],
  ['25', 'Russian Revolution · St. Petersburg / Petrograd'],
  ['24', 'Postwar Settlement · Paris'],
  ['18', 'Ottoman Nationalism & Genocide · Istanbul'],
  ['29', 'Nazi Rule & Holocaust · Berlin'],
  ['10', 'War in China & Mass Violence · Nanjing'],
  ['84', 'Colonial Resources & North African War · Cairo / El Alamein'],
  ['106', 'Pacific War · Pearl Harbor'],
]);

const expectedBindings = new Map([
  ['108','world-event-108-0'], ['30','world-event-30-0'],
  ['46','world-event-46-0'], ['25','world-event-25-1'],
  ['24','world-event-24-7'], ['18','world-event-18-2'],
  ['29','world-event-29-5'], ['10','world-event-10-2'],
  ['84','world-event-84-1'], ['106','world-event-106-0'],
]);
```

Use this exact record metadata. Tuple order is:

```text
id, locationNumber, sequence, title, dateLabel, startYear, endYear,
mainEventKey, topicCodes, themeIds, examSkills
```

```js
const expectedManifest = [
  ['apwh-u7-mukden-russo-japanese-war-shifting-power','108',1,'Russo-Japanese War and Shifting Power','1904–1905',1904,1905,'world-event-108-0',['7.1','7.9'],['GOV','CDI'],['Causation','CCOT']],
  ['apwh-u7-mukden-incident-resource-expansion','108',2,'Manchurian Incident and Resource Expansion','1931',1931,1931,'world-event-108-0',['7.6'],['GOV','ECN'],['Causation']],
  ['apwh-u7-mukden-league-failure-further-expansion','108',3,'Collective-Security Failure and Further Expansion','1931–1937',1931,1937,'world-event-108-0',['7.5','7.6','7.9'],['GOV'],['Causation','CCOT']],

  ['apwh-u7-sarajevo-balkan-nationalism-imperial-rivalry','30',1,'Balkan Nationalism and Imperial Rivalry','1878–1914',1878,1914,'world-event-30-0',['7.2'],['GOV','CDI'],['Contextualization','Causation']],
  ['apwh-u7-sarajevo-assassination-july-crisis','30',2,'Assassination and the July Crisis','1914',1914,1914,'world-event-30-0',['7.2'],['GOV'],['Causation']],
  ['apwh-u7-sarajevo-alliances-mobilization-global-war','30',3,'Alliances, Mobilization, and Global War','1914',1914,1914,'world-event-30-0',['7.2','7.9'],['GOV'],['Causation','CCOT']],

  ['apwh-u7-verdun-industrial-weapons-mass-production','46',1,'Industrial Weapons and Mass Production','1914–1916',1914,1916,'world-event-46-0',['7.3'],['TEC','ECN'],['Causation']],
  ['apwh-u7-verdun-trench-warfare-attrition','46',2,'Trench Warfare and Attrition','1916',1916,1916,'world-event-46-0',['7.3'],['TEC','SIO'],['Causation']],
  ['apwh-u7-verdun-total-war-mobilization','46',3,'Total War and Whole-Society Mobilization','1914–1918',1914,1918,'world-event-46-0',['7.3','7.9'],['ECN','SIO','GOV'],['Causation','CCOT']],

  ['apwh-u7-petrograd-wartime-shortages-tsarist-failure','25',1,'Wartime Shortages and Tsarist Failure','1914–1917',1914,1917,'world-event-25-1',['7.1','7.4'],['SIO','ECN','GOV'],['Contextualization','Causation']],
  ['apwh-u7-petrograd-february-october-revolutions','25',2,'February and October Revolutions','1917',1917,1917,'world-event-25-1',['7.1'],['GOV','SIO'],['Causation']],
  ['apwh-u7-petrograd-bolshevik-regime-war-exit','25',3,'Bolshevik Rule and Exit from the War','1917–1922',1917,1922,'world-event-25-1',['7.1','7.4'],['GOV','ECN'],['Causation','CCOT']],

  ['apwh-u7-paris-self-determination-promises','24',1,'Promises of Self-Determination','1918–1919',1918,1919,'world-event-24-7',['7.5'],['GOV','CDI'],['Contextualization','Comparison']],
  ['apwh-u7-paris-versailles-punitive-settlement','24',2,'Versailles and the Punitive Settlement','1919',1919,1919,'world-event-24-7',['7.5','7.9'],['GOV'],['Causation']],
  ['apwh-u7-paris-mandates-unresolved-contradictions','24',3,'Mandates and Unresolved Contradictions','1919–1939',1919,1939,'world-event-24-7',['7.5','7.6'],['GOV','CDI'],['Causation','CCOT']],

  ['apwh-u7-istanbul-young-turks-turkification','18',1,'Young Turks and Turkification','1908–1914',1908,1914,'world-event-18-2',['7.1','7.8'],['CDI','GOV'],['Contextualization','Causation']],
  ['apwh-u7-istanbul-wartime-accusations-deportation','18',2,'Wartime Accusations and Deportation','1915',1915,1915,'world-event-18-2',['7.8'],['GOV','SIO'],['Causation']],
  ['apwh-u7-istanbul-armenian-genocide','18',3,'Armenian Genocide','1915–1920',1915,1920,'world-event-18-2',['7.8','7.9'],['GOV','SIO'],['Causation','Comparison']],

  ['apwh-u7-berlin-depression-weimar-crisis','29',1,'Depression and the Weimar Crisis','1929–1933',1929,1933,'world-event-29-5',['7.4','7.6'],['ECN','GOV'],['Causation']],
  ['apwh-u7-berlin-nazi-takeover-citizenship-stripping','29',2,'Nazi Takeover and Citizenship Stripping','1933–1935',1933,1935,'world-event-29-5',['7.6','7.8'],['GOV','SIO'],['Causation']],
  ['apwh-u7-berlin-holocaust-bureaucratic-genocide','29',3,'Holocaust and Bureaucratic Genocide','1941–1945',1941,1945,'world-event-29-5',['7.8','7.9'],['GOV','SIO','TEC'],['Causation','Comparison']],

  ['apwh-u7-nanjing-revolution-state-fragmentation','10',1,'Revolution and State Fragmentation','1912–1927',1912,1927,'world-event-10-2',['7.1'],['GOV'],['Causation','CCOT']],
  ['apwh-u7-nanjing-full-scale-japanese-invasion','10',2,'Full-Scale Japanese Invasion','1937',1937,1937,'world-event-10-2',['7.6','7.7'],['GOV'],['Causation']],
  ['apwh-u7-nanjing-massacre-civilian-violence','10',3,'Nanjing Massacre and Civilian Violence','1937–1938',1937,1938,'world-event-10-2',['7.8'],['GOV','SIO'],['Causation','Comparison']],

  ['apwh-u7-cairo-cotton-suez-strategic-resources','84',1,'Cotton, Suez, and Strategic Resources','1869–1939',1869,1939,'world-event-84-1',['7.2','7.7'],['ECN','GOV','TEC'],['Contextualization','Causation']],
  ['apwh-u7-cairo-colonial-mobilization-total-war','84',2,'Colonial Mobilization in Total War','1914–1945',1914,1945,'world-event-84-1',['7.3','7.7'],['GOV','ECN','SIO'],['Causation']],
  ['apwh-u7-cairo-el-alamein-global-routes','84',3,'El Alamein and the Defense of Global Routes','1942',1942,1942,'world-event-84-1',['7.7','7.9'],['GOV','TEC'],['Causation','CCOT']],

  ['apwh-u7-pearl-harbor-resource-dependence-sanctions','106',1,'Resource Dependence and Sanctions','1937–1941',1937,1941,'world-event-106-0',['7.6'],['ECN','GOV'],['Causation']],
  ['apwh-u7-pearl-harbor-attack-global-war','106',2,'Pearl Harbor and a Truly Global War','1941',1941,1941,'world-event-106-0',['7.6','7.7'],['GOV'],['Causation']],
  ['apwh-u7-pearl-harbor-pacific-war-surrender','106',3,'Pacific War, Atomic Bombs, and Surrender','1941–1945',1941,1945,'world-event-106-0',['7.7','7.9'],['GOV','TEC','SIO'],['Causation','CCOT']],
];
```

## Learner-Content Contract

Every record contains English-only `summary`, `significance`, `keyPeople`, `keyTerms`, at least two `evidence` statements, `examConnection`, and `source: { id: 'amsco-apwh-u7', locator }`. Tests lock the finished prose field-for-field before GREEN.

| Location | Required content and boundary |
| --- | --- |
| Mukden / Shenyang | Explain the Russo-Japanese War as evidence of shifting power; identify Japan's resource and security aims in Manchuria; explain the staged railway incident and occupation; connect cost-free League condemnation to later aggression. Do not imply League inaction alone caused all later expansion. |
| Sarajevo | Separate long-term nationalism, imperial rivalry, militarism, and alliances from the assassination trigger; explain the July Crisis; make mobilization timetables and alliance obligations the mechanism that widened war. Do not write that one assassination automatically caused world war. |
| Verdun | Connect industrial mass production to weapons and supply; explain trench stalemate and attrition; show how states mobilized economies, civilians, women, and colonies. Do not reduce total war to battlefield technology alone. |
| St. Petersburg / Petrograd | State that the city was called Petrograd in 1917; connect war losses, food/fuel shortages, and tsarist weakness to February; distinguish February from the Bolshevik October seizure of power; connect Brest-Litovsk and civil war to consolidation. |
| Paris | Distinguish Wilsonian promises from selective application; state the major Versailles burdens and exclusions; explain mandates as imperial control under international supervision; connect contradictions to later grievance without claiming Versailles mechanically caused Hitler. |
| Istanbul | Explain Young Turk constitutionalism and Turkification; identify wartime accusations, deportation, and state power as mechanisms; describe the Armenian Genocide factually without graphic detail. Do not imply all Ottoman Muslims or all Turks shared equal responsibility. |
| Berlin | Connect Depression and Weimar vulnerability without treating unemployment as sufficient cause; explain legal capture of institutions and the Nuremberg Laws before mass killing; show the Holocaust as a wartime, bureaucratic, technological process centered on the murder of six million Jews and including persecution of other targeted groups. Auschwitz must be identified as located in occupied Poland, not Berlin. |
| Nanjing | Connect the 1912 revolution and fragmented authority to vulnerability without denying Chinese resistance; place full-scale Japanese invasion in 1937; describe the Nanjing Massacre and sexual violence factually without graphic elaboration. Do not equate it with the Holocaust. |
| Cairo / El Alamein | Explain why cotton, Suez, and regional routes mattered to industrial war; identify colonial soldiers, labor, and materials as active inputs; place El Alamein west of Alexandria and state that Cairo is the representative map anchor, not the battle site. |
| Pearl Harbor | Connect Japanese resource dependence, expansion in China, and U.S. sanctions to strategic choice without calling attack inevitable; explain how entry of the United States and German declaration made war global; cover island-hopping, atomic bombs, Soviet entry, and Japanese surrender with civilian consequences and historical debate. |

Sensitive-content prose must remain factual and mechanism-centered. Cross-case notes must identify useful comparison dimensions and an explicit non-equivalence boundary.

## Exact Graph Contract

Every location contains the directed pairs `sequence 1 → 2` and `sequence 2 → 3`. Add these exact cross-location causal pairs:

```js
const crossLocationCausalPairs = [
  ['apwh-u7-sarajevo-alliances-mobilization-global-war','apwh-u7-verdun-industrial-weapons-mass-production'],
  ['apwh-u7-verdun-total-war-mobilization','apwh-u7-petrograd-wartime-shortages-tsarist-failure'],
  ['apwh-u7-paris-versailles-punitive-settlement','apwh-u7-berlin-depression-weimar-crisis'],
  ['apwh-u7-mukden-league-failure-further-expansion','apwh-u7-nanjing-full-scale-japanese-invasion'],
  ['apwh-u7-nanjing-full-scale-japanese-invasion','apwh-u7-pearl-harbor-resource-dependence-sanctions'],
];
```

Use these exact reciprocal related pairs:

```js
const expectedRelatedPairs = [
  ['apwh-u7-istanbul-armenian-genocide','apwh-u7-berlin-holocaust-bureaucratic-genocide'],
  ['apwh-u7-nanjing-massacre-civilian-violence','apwh-u7-berlin-holocaust-bureaucratic-genocide'],
  ['apwh-u7-verdun-total-war-mobilization','apwh-u7-cairo-colonial-mobilization-total-war'],
  ['apwh-u7-mukden-league-failure-further-expansion','apwh-u7-paris-mandates-unresolved-contradictions'],
  ['apwh-u7-petrograd-february-october-revolutions','apwh-u7-berlin-nazi-takeover-citizenship-stripping'],
  ['apwh-u7-sarajevo-alliances-mobilization-global-war','apwh-u7-pearl-harbor-attack-global-war'],
];
```

Every causal note names a mechanism. Related notes are reciprocal and distinguish genocide from massacre, communist revolution from fascist takeover, and metropolitan from colonial mobilization.

## Exact Unit Cards

```js
const expectedUnitCards = {
  context: {
    id: 'apwh-u7-context-imperial-rivalry-global-war',
    kind: 'context',
    role: 'Unit 7 Context Card',
    title: 'From Imperial Rivalry to Global War',
    examSkills: ['Contextualization','Causation'],
    summary: 'Unit 6 imperial expansion gave industrial states overlapping claims, overseas commitments, strategic routes, and recurring security disputes. Nationalism and military planning turned those rivalries into a system in which a regional crisis could mobilize empires, colonial resources, and populations across the world.',
    prompt: 'Which Unit 6 structures made a regional crisis capable of becoming a global war?',
    takeaways: [
      'Industrial states defended distant routes, markets, and colonies as national security interests.',
      'Alliance commitments and mobilization plans converted diplomatic delay into military risk.',
      'Empires drew colonial soldiers, labor, materials, and territories into wars begun elsewhere.',
    ],
  },
  synthesis: {
    id: 'apwh-u7-synthesis-allied-victory-bipolar-world',
    kind: 'synthesis',
    role: 'Unit 7 Synthesis Card',
    title: 'From Allied Victory to a Bipolar World',
    examSkills: ['Causation','CCOT'],
    summary: 'The defeat of the Axis powers weakened European empires, elevated the United States and Soviet Union, encouraged anticolonial demands, and created institutions intended to manage a world divided by ideology and nuclear power. Unit 8 follows how wartime cooperation gave way to Cold War rivalry and decolonization.',
    prompt: 'How did the outcomes of World War II create both superpower rivalry and new opportunities for decolonization?',
    takeaways: [
      'The United States and Soviet Union emerged with unmatched military and political influence.',
      'European imperial states survived the war with reduced resources and legitimacy.',
      'The United Nations and nuclear weapons changed how states pursued security after 1945.',
    ],
  },
};
```

---

### Task 1: Create an isolated U7 worktree and lock publication in RED

**Files:**
- Create: `tests/apwh-u7-location-study.test.mjs`
- Expected missing file: `data/apwh-u7-location-study.js`

- [ ] **Step 1: Create an isolated branch**

Use `superpowers:using-git-worktrees` from the clean latest `agent/apwh-integration` containing this committed plan. Create branch `feature/apwh-u7-location-study` and record its absolute worktree path.

- [ ] **Step 2: Write the publication test**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const moduleUrl = new URL('../data/apwh-u7-location-study.js', import.meta.url);

test('publishes the Unit 7 location-study module', () => {
  assert.equal(existsSync(moduleUrl), true, 'Unit 7 data module must exist');
  const sandbox = {};
  sandbox.window = sandbox;
  vm.runInNewContext(readFileSync(moduleUrl, 'utf8'), sandbox);
  assert.equal(sandbox.APWH_U7_LOCATION_STUDY.unitId, 'u7');
  assert.equal(sandbox.APWH_U7_LOCATION_STUDY.unitNumber, 7);
});
```

- [ ] **Step 3: Verify RED and commit**

```bash
$NODE --test tests/apwh-u7-location-study.test.mjs
git add tests/apwh-u7-location-study.test.mjs
git commit -m "test: require APWH Unit 7 location study"
```

Expected: the test fails only because `data/apwh-u7-location-study.js` does not exist; the RED test commit succeeds.

### Task 2: Publish the exact immutable record contract

**Files:**
- Modify: `tests/apwh-u7-location-study.test.mjs`
- Create: `data/apwh-u7-location-study.js`

- [ ] **Step 1: Add exact manifest and API assertions**

Insert `expectedLocations`, `expectedBindings`, and `expectedManifest` from this plan. Assert:

```js
assert.equal(api.unitId, 'u7');
assert.equal(api.unitNumber, 7);
assert.equal(api.connectionTimelineMode, 'main-event');
assert.deepEqual([...api.locationNumbers], [...expectedLocations.keys()]);
assert.equal(api.records.length, 30);
assert.deepEqual(api.records.map(record => [
  record.id, record.locationNumber, record.sequence, record.title,
  record.dateLabel, record.startYear, record.endYear, record.mainEventKey,
  [...record.topicCodes], [...record.themeIds], [...record.examSkills],
]), expectedManifest);
assert.deepEqual([...new Set(api.records.flatMap(record => record.topicCodes))].sort(),
  ['7.1','7.2','7.3','7.4','7.5','7.6','7.7','7.8','7.9']);
```

Also lock three records per location, sequence order, defensive arrays, deep freezing, `getById`, `getByLocation`, `locationName`, unknown lookup behavior, exact `apwh-u7-` prefix, approved themes/skills, and refusal to overwrite the global.

- [ ] **Step 2: Write exact learner-content fixtures before implementation**

Create a `P(...)` helper matching the Unit 6 test and add one literal fixture for every ID in `expectedManifest`. Each fixture must satisfy its row in the Learner-Content Contract, use a distinct explained key term, contain at least two concrete evidence statements, and end with the exact source locator derived from its Topic list:

```js
const expectedLocator = topics => `AMSCO AP World History, Unit 7, ${topics.length === 1 ? 'Topic' : 'Topics'} ${topics.length === 1 ? topics[0] : topics.length === 2 ? topics.join(' and ') : `${topics.slice(0, -1).join(', ')}, and ${topics.at(-1)}`}`;
```

Atrocity fixtures must include these exact boundary ideas in `examConnection` or `significance`: `comparison does not imply equivalence`; Auschwitz was in `occupied Poland`; the Armenian Genocide, Holocaust, and Nanjing Massacre remain distinct historical cases.

- [ ] **Step 3: Implement the immutable IIFE using the established API**

Copy the validated structural implementation from `data/apwh-u6-location-study.js`, then make these exact substitutions before inserting the literal U7 manifest and learner records:

```js
(function publishUnit7LocationStudy(root) {
  'use strict';
  if (Object.prototype.hasOwnProperty.call(root, 'APWH_U7_LOCATION_STUDY')) {
    throw new Error('Invalid Unit 7 global APWH_U7_LOCATION_STUDY: refusing to overwrite existing value');
  }
  const UNIT_ID = 'u7';
  const UNIT_NUMBER = 7;
  const VALID_TOPIC_CODES = new Set(['7.1','7.2','7.3','7.4','7.5','7.6','7.7','7.8','7.9']);
  const VALID_THEME_IDS = new Set(['GOV','ECN','CDI','SIO','TEC','ENV']);
  const VALID_EXAM_SKILLS = new Set(['Causation','Comparison','CCOT','Contextualization']);
  const SOURCE_ID = 'amsco-apwh-u7';
})(typeof window !== 'undefined' ? window : globalThis);
```

The published object contains exactly `unitId`, `unitNumber`, `connectionTimelineMode`, `locationNumbers`, `records`, `unitCards`, `compareRecords`, `getById`, `getByLocation`, `locationName`, and `getUnitCard`, with the same descriptors and defensive-copy behavior as U6.

- [ ] **Step 4: Add focused negative validation tests**

Use fresh VM evaluations with source substitutions to reject wrong location or main-event binding, duplicate sequence or ID, malformed date or label mismatch, missing/invalid/duplicate Topic/theme/skill, incomplete/non-English content, malformed actor/term/evidence/source, a fourth record at a location, null raw records/cards, unresolved graph IDs, self-links, duplicate links, and global overwrite. Diagnostics must name `Invalid Unit 7` and the affected ID when available. Include the U6 two-pass graph regression: a malformed referenced target must report the intended U7 validation error, not `TypeError`.

- [ ] **Step 5: Run focused tests and commit**

```bash
$NODE --test tests/apwh-u7-location-study.test.mjs
git diff --check
git add data/apwh-u7-location-study.js tests/apwh-u7-location-study.test.mjs
git commit -m "feat: add APWH Unit 7 location study data"
```

Expected: all U7 data and validation tests pass.

### Task 3: Add causal graph, unit cards, and source ledger

**Files:**
- Modify: `data/apwh-u7-location-study.js`
- Modify: `tests/apwh-u7-location-study.test.mjs`
- Create: `docs/data-sources/apwh-u7-location-study-source-ledger.md`

- [ ] **Step 1: Add failing exact graph fixtures**

Assert every location has reciprocal cause/effect navigation for `1 → 2 → 3`, all five declared cross-location causal pairs resolve with unique edges, and all six related pairs are reciprocal with identical notes. Reject chronology-only causal notes, self-links, unresolved IDs, duplicate edges, and reuse of one target across causal and related categories.

- [ ] **Step 2: Add failing exact card fixtures**

Insert `expectedUnitCards` from this plan and compare every card field, Exam Skill, prompt, and takeaway. Reject missing, extra, duplicated, non-English, non-frozen, or malformed cards.

- [ ] **Step 3: Add the failing ledger contract**

Require exactly thirty five-column rows:

```text
Stable ID | AP topic assignment | Main event | Source locator | Claims covered
```

Require this exact introduction:

```markdown
# APWH Unit 7 Location Study Source Ledger

The learner records use edition-neutral locators in AMSCO AP World History Unit 7 and the College Board framework effective Fall 2026. Map pins are representative anchors; a named city does not imply that every regional process occurred only there. Comparisons among mass atrocities identify mechanisms without treating distinct cases as equivalent.
```

Reject missing/extra IDs, wrong main-event bindings, malformed columns, trailing content, vague whole-book citations, unverified page numbers, and missing caveats for renamed cities, representative battle anchors, or atrocity comparisons.

- [ ] **Step 4: Implement graph, cards, and ledger**

Use the exact causal and related pairs printed above. Each causal note must name the concrete mechanism connecting source to target. Each atrocity-comparison note must name at least one shared analytical dimension and one difference. Deep-freeze graph arrays, reciprocal note maps, cards, takeaway arrays, and source objects.

Write one ledger row for every stable ID in manifest order, with edition-neutral locators such as `AMSCO AP World History, Unit 7, Topic 7.8`.

- [ ] **Step 5: Run tests and commit**

```bash
$NODE --test tests/apwh-u7-location-study.test.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add data/apwh-u7-location-study.js tests/apwh-u7-location-study.test.mjs docs/data-sources/apwh-u7-location-study-source-ledger.md
git commit -m "feat: connect APWH Unit 7 location studies"
```

Expected: focused and complete Node suites pass.

### Task 4: Register Unit 7 in the shared renderer

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`
- Modify: `world-map.html`
- Modify: `index.html`

- [ ] **Step 1: Add failing loader and registry assertions**

Require each HTML file to load exactly once, after U6 and before page logic:

```html
<script src="data/apwh-u7-location-study.js"></script>
```

Require both registries to end with:

```js
u6: 'APWH_U6_LOCATION_STUDY',
u7: 'APWH_U7_LOCATION_STUDY',
```

Add a positive Sarajevo smoke test:

```js
await page.evaluate(() => {
  window.__mapFilter.setPeriod('u7');
  window.__mapFilter.openHit('30', 'europe', 'world-event-30-0');
});
await expectVisible(page.locator('#eventPanel [data-location-study-open="30"]'),
  'Unit 7 Sarajevo must expose a location-study entry');
```

Expected: browser verification fails because U7 is not loaded or registered.

- [ ] **Step 2: Add only loader and registry entries**

Append the script tag and registry entry in `world-map.html` and `index.html`. Do not copy renderer functions, introduce a U7 conditional, or alter causal chains, Timeline membership, event copy, pins, or coordinates.

- [ ] **Step 3: Verify and commit**

```bash
$NODE scripts/verify-world-timeline.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add world-map.html index.html scripts/verify-world-timeline.mjs
git commit -m "feat: render APWH Unit 7 location studies"
```

Expected: the U7 registration smoke test and all U1–U6 contracts pass.

### Task 5: Lock all ten standalone and homepage interactions

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Add the exact browser fixture**

```js
const UNIT_7_STUDY_VIEWS = Object.freeze([
  Object.freeze({ number:'108', region:'asia', label:'Imperial Rivalry in East Asia · Mukden / Shenyang', mainEventKey:'world-event-108-0', ids:Object.freeze(['apwh-u7-mukden-russo-japanese-war-shifting-power','apwh-u7-mukden-incident-resource-expansion','apwh-u7-mukden-league-failure-further-expansion']) }),
  Object.freeze({ number:'30', region:'europe', label:'World War I Origins · Sarajevo', mainEventKey:'world-event-30-0', ids:Object.freeze(['apwh-u7-sarajevo-balkan-nationalism-imperial-rivalry','apwh-u7-sarajevo-assassination-july-crisis','apwh-u7-sarajevo-alliances-mobilization-global-war']) }),
  Object.freeze({ number:'46', region:'europe', label:'Industrialized Total War · Verdun', mainEventKey:'world-event-46-0', ids:Object.freeze(['apwh-u7-verdun-industrial-weapons-mass-production','apwh-u7-verdun-trench-warfare-attrition','apwh-u7-verdun-total-war-mobilization']) }),
  Object.freeze({ number:'25', region:'europe', label:'Russian Revolution · St. Petersburg / Petrograd', mainEventKey:'world-event-25-1', ids:Object.freeze(['apwh-u7-petrograd-wartime-shortages-tsarist-failure','apwh-u7-petrograd-february-october-revolutions','apwh-u7-petrograd-bolshevik-regime-war-exit']) }),
  Object.freeze({ number:'24', region:'europe', label:'Postwar Settlement · Paris', mainEventKey:'world-event-24-7', ids:Object.freeze(['apwh-u7-paris-self-determination-promises','apwh-u7-paris-versailles-punitive-settlement','apwh-u7-paris-mandates-unresolved-contradictions']) }),
  Object.freeze({ number:'18', region:'mideast', label:'Ottoman Nationalism & Genocide · Istanbul', mainEventKey:'world-event-18-2', ids:Object.freeze(['apwh-u7-istanbul-young-turks-turkification','apwh-u7-istanbul-wartime-accusations-deportation','apwh-u7-istanbul-armenian-genocide']) }),
  Object.freeze({ number:'29', region:'europe', label:'Nazi Rule & Holocaust · Berlin', mainEventKey:'world-event-29-5', ids:Object.freeze(['apwh-u7-berlin-depression-weimar-crisis','apwh-u7-berlin-nazi-takeover-citizenship-stripping','apwh-u7-berlin-holocaust-bureaucratic-genocide']) }),
  Object.freeze({ number:'10', region:'asia', label:'War in China & Mass Violence · Nanjing', mainEventKey:'world-event-10-2', ids:Object.freeze(['apwh-u7-nanjing-revolution-state-fragmentation','apwh-u7-nanjing-full-scale-japanese-invasion','apwh-u7-nanjing-massacre-civilian-violence']) }),
  Object.freeze({ number:'84', region:'mideast', label:'Colonial Resources & North African War · Cairo / El Alamein', mainEventKey:'world-event-84-1', ids:Object.freeze(['apwh-u7-cairo-cotton-suez-strategic-resources','apwh-u7-cairo-colonial-mobilization-total-war','apwh-u7-cairo-el-alamein-global-routes']) }),
  Object.freeze({ number:'106', region:'americas', label:'Pacific War · Pearl Harbor', mainEventKey:'world-event-106-0', ids:Object.freeze(['apwh-u7-pearl-harbor-resource-dependence-sanctions','apwh-u7-pearl-harbor-attack-global-war','apwh-u7-pearl-harbor-pacific-war-surrender']) }),
]);

const UNIT_7_STALINGRAD = Object.freeze({
  number:'107', region:'europe', mainEventKey:'world-event-107-0',
  city:'Stalingrad', title:'Stalingrad', date:'1942–1943',
});
```

Assert ten unique supported locations, thirty unique IDs, three ordered IDs per location, and real page-metadata regions for all supported locations plus Stalingrad.

- [ ] **Step 2: Verify every standalone view**

For each fixture: select U7, open the exact event, assert Timeline/map selection, open `View all 3 study points`, check the process-first heading and stable-ID order, click all rows, and verify exactly one expanded/current detail. Outer Back restores ordinary event detail and focus.

- [ ] **Step 3: Verify every homepage view**

Repeat the ten-location contract through `#worldMapFrame` and `#home-events`. Wait on iframe filter state rather than fixed timeouts. Assert canonical/mirror parity and homepage control synchronization.

- [ ] **Step 4: Verify navigation edges and cleanup**

Cover these representative paths:

- within-location causal: Sarajevo long-term conditions → assassination;
- cross-location causal: Sarajevo mobilization → Verdun industrialized war;
- cross-region causal: Nanjing invasion → Pearl Harbor resource crisis;
- related non-equivalence comparison: Istanbul Armenian Genocide ↔ Berlin Holocaust;
- related non-equivalence comparison: Nanjing Massacre ↔ Berlin Holocaust;
- related political comparison: Petrograd communist revolution ↔ Berlin fascist takeover;
- two-level connection stack with query, category, and region filters;
- connection Back and target outer Back restoring Timeline/current card, filters, homepage controls, and source-entry focus;
- keyboard activation and visible focus for entry, record, connection, and Back controls;
- a narrow viewport opening the longest Cairo heading with no document-level horizontal overflow, while Timeline cards remain horizontally scrollable;
- U7 → U6 and U7 → U8 cleanup with no stale study state;
- unsupported U7 pin `107` Stalingrad retains ordinary detail and has no study entry.

- [ ] **Step 5: Fix only demonstrated shared-renderer defects**

Run the verifier after adding contracts. If a failure exposes shared behavior, first add the smallest failing assertion, then repair the generic capability-driven code. No literal U7 conditional is permitted.

- [ ] **Step 6: Verify and commit browser contracts**

```bash
$NODE scripts/verify-world-timeline.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add scripts/verify-world-timeline.mjs world-map.html index.html
git commit -m "test: verify APWH Unit 7 study interactions"
```

Expected: all ten locations pass on both surfaces, Stalingrad stays ordinary-only, and U1–U6 remain green.

### Task 6: Final regression and integration readiness

**Files:**
- Review every file changed since the merge base with `agent/apwh-integration`.

- [ ] **Step 1: Run the focused U7 suite**

```bash
$NODE --test tests/apwh-u7-location-study.test.mjs
```

Expected: all U7 tests pass.

- [ ] **Step 2: Run complete verification once**

```bash
$NODE --test tests/*.test.mjs
$NODE scripts/verify-world-timeline.mjs
U7_BASE_COMMIT=$(git merge-base agent/apwh-integration HEAD)
git diff --check "$U7_BASE_COMMIT"..HEAD
git status --short
```

Expected: all Node tests and browser verification pass, diff check succeeds, and the worktree is clean.

- [ ] **Step 3: Audit scope and immutable existing content**

Confirm the branch adds only the U7 module, U7 ledger/tests, two loader/registry entries, and U7 browser contracts beyond `U7_BASE_COMMIT`. Verify the exact twenty-eight-item `WORLD_TIMELINE_UNIT_MEMBERS.u7` list, twenty-one U7 map locations, all pin coordinates, every U7 chain object, and existing Timeline event copy are byte-for-byte unchanged from the base.

- [ ] **Step 4: Request final code review**

Review `U7_BASE_COMMIT..HEAD` for Critical and Important issues. Fix only verified blockers, rerun the affected focused test, then run the complete verification once.

- [ ] **Step 5: Finish the branch**

Use `superpowers:finishing-a-development-branch`. Do not merge into `agent/apwh-integration`, push, create a PR, or remove the worktree until the user chooses.
