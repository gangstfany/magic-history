# APWH Unit 8 Location Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ten Unit 8 location studies with thirty causally ordered records, cross-location comparisons, and identical standalone/homepage behavior without changing the existing Unit 8 Timeline, pins, or causal chains.

**Architecture:** Publish one immutable `APWH_U8_LOCATION_STUDY` IIFE module matching the established Unit 5–7 API and opt it into the shared capability-driven renderer. Keep the other nineteen Unit 8 locations as ordinary evidence, use the existing main-event Timeline synchronization, and add no new mode, panel, pin, event dataset, or U8-specific renderer branch.

**Tech Stack:** Static JavaScript IIFE modules, HTML registries, Node.js `node:test` and `vm`, Markdown source ledger, Playwright browser verification.

---

## File Structure

- Create `data/apwh-u8-location-study.js`: canonical records, validation, graph, cards, and frozen API.
- Create `tests/apwh-u8-location-study.test.mjs`: exact metadata, content, API, graph, card, and ledger validation.
- Create `docs/data-sources/apwh-u8-location-study-source-ledger.md`: one exact row per record.
- Modify `world-map.html:2295,5000`: load and register `APWH_U8_LOCATION_STUDY` only.
- Modify `index.html:856,976`: load and register the same global for the homepage mirror only.
- Modify `scripts/verify-world-timeline.mjs:441-562,3849-4350`: U8 fixtures, standalone/homepage contracts, unsupported-location coverage, and registry assertions.

Use this runtime:

```bash
NODE=/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
```

The design authority is `docs/superpowers/specs/2026-09-14-apwh-u8-location-study-design.md`. Its representative-anchor caveats, country/region-plus-city labels, and non-goals are acceptance requirements.

## Canonical Runtime Contract

Use this exact location order and binding map:

```js
const expectedLocations = new Map([
  ['29', 'Cold War Division · Germany / Berlin'],
  ['40', 'Soviet Power & Collapse · Soviet Union / Moscow'],
  ['5', 'Communist Revolution & Transformation · China / Beijing'],
  ['16', 'Decolonization & Proxy War · Vietnam / Saigon'],
  ['6', 'Independence, Nonalignment & Development · India / Delhi'],
  ['79', 'Settler Colonialism & Armed Decolonization · Algeria / Algiers'],
  ['81', 'Negotiated Independence & Pan-Africanism · Ghana / Accra'],
  ['55', 'Revolution & Nuclear Brinkmanship · Cuba / Havana'],
  ['21', 'Oil, Intervention & Revolution · Iran / Tehran'],
  ['82', 'Apartheid & Democratic Transition · South Africa / Johannesburg'],
]);

const expectedBindings = new Map([
  ['29','world-event-29-8'], ['40','world-event-40-3'],
  ['5','world-event-5-5'], ['16','world-event-16-0'],
  ['6','world-event-6-3'], ['79','world-event-79-1'],
  ['81','world-event-81-0'], ['55','world-event-55-2'],
  ['21','world-event-21-1'], ['82','world-event-82-0'],
]);
```

Use this exact record metadata. Tuple order is:

```text
id, locationNumber, sequence, title, dateLabel, startYear, endYear,
mainEventKey, topicCodes, themeIds, examSkills
```

```js
const expectedManifest = [
  ['apwh-u8-berlin-occupation-ideological-division','29',1,'Occupation Zones and Ideological Division','1945–1948',1945,1948,'world-event-29-8',['8.1','8.2'],['GOV','CDI'],['Contextualization','Causation']],
  ['apwh-u8-berlin-blockade-airlift-two-germanies','29',2,'Blockade, Airlift, and Two Germanies','1948–1949',1948,1949,'world-event-29-8',['8.2','8.3'],['GOV','TEC'],['Causation']],
  ['apwh-u8-berlin-wall-nonintervention-reunification','29',3,'Berlin Wall, Soviet Nonintervention, and Reunification','1961–1990',1961,1990,'world-event-29-8',['8.2','8.8','8.9'],['GOV','CDI'],['Causation','CCOT']],

  ['apwh-u8-moscow-security-buffer-soviet-bloc','40',1,'Security Buffer and the Soviet Bloc','1945–1955',1945,1955,'world-event-40-3',['8.1','8.2'],['GOV'],['Contextualization','Causation']],
  ['apwh-u8-moscow-detente-arms-afghanistan-strain','40',2,'Détente, Arms, Afghanistan, and Structural Strain','1972–1985',1972,1985,'world-event-40-3',['8.2','8.3','8.8'],['GOV','ECN','TEC'],['Causation','CCOT']],
  ['apwh-u8-moscow-gorbachev-reform-soviet-dissolution','40',3,"Gorbachev's Reforms and Soviet Dissolution",'1985–1991',1985,1991,'world-event-40-3',['8.8','8.9'],['GOV','ECN'],['Causation']],

  ['apwh-u8-beijing-civil-war-land-communist-victory','5',1,'Civil War, Land, and Communist Victory','1945–1949',1945,1949,'world-event-5-5',['8.4'],['GOV','SIO'],['Causation']],
  ['apwh-u8-beijing-great-leap-state-mobilization-famine','5',2,'Great Leap Forward, State Mobilization, and Famine','1958–1962',1958,1962,'world-event-5-5',['8.4'],['GOV','ECN','SIO'],['Causation']],
  ['apwh-u8-beijing-cultural-revolution-social-upheaval','5',3,'Cultural Revolution and Social Upheaval','1966–1976',1966,1976,'world-event-5-5',['8.4','8.7','8.9'],['GOV','CDI','SIO'],['Causation','CCOT']],

  ['apwh-u8-saigon-french-return-anticolonial-war','16',1,'French Return and Anticolonial War','1946–1954',1946,1954,'world-event-16-0',['8.5'],['GOV','CDI'],['Contextualization','Causation']],
  ['apwh-u8-saigon-partition-containment-escalation','16',2,'Partition, Containment, and Escalation','1954–1968',1954,1968,'world-event-16-0',['8.2','8.3'],['GOV'],['Causation']],
  ['apwh-u8-saigon-withdrawal-reunification-war-costs','16',3,'Withdrawal, Reunification, and War Costs','1968–1975',1968,1975,'world-event-16-0',['8.3','8.9'],['GOV','SIO'],['Causation','CCOT']],

  ['apwh-u8-delhi-independence-partition-displacement','6',1,'Independence, Partition, and Displacement','1947',1947,1947,'world-event-6-3',['8.5','8.6'],['GOV','CDI','SIO'],['Causation','Comparison']],
  ['apwh-u8-delhi-nonalignment-foreign-policy-autonomy','6',2,'Nonalignment and Foreign-Policy Autonomy','1955–1961',1955,1961,'world-event-6-3',['8.2','8.6'],['GOV'],['Causation','Comparison']],
  ['apwh-u8-delhi-five-year-plans-mixed-economy','6',3,'Five-Year Plans and a Mixed Economy','1951–1991',1951,1991,'world-event-6-3',['8.6','8.9'],['ECN','GOV'],['CCOT','Comparison']],

  ['apwh-u8-algiers-settler-colonialism-blocked-reform','79',1,'Settler Colonialism and Blocked Reform','1945–1954',1945,1954,'world-event-79-1',['8.5'],['GOV','SIO'],['Contextualization','Causation']],
  ['apwh-u8-algiers-fln-war-counterinsurgency','79',2,'FLN War and French Counterinsurgency','1954–1962',1954,1962,'world-event-79-1',['8.5','8.7'],['GOV','SIO'],['Causation']],
  ['apwh-u8-algiers-independence-exodus-new-state','79',3,'Independence, Exodus, and the New State','1962',1962,1962,'world-event-79-1',['8.6','8.9'],['GOV','SIO'],['Causation','CCOT']],

  ['apwh-u8-accra-mass-nationalism-colonial-pressure','81',1,'Mass Nationalism and Colonial Pressure','1947–1951',1947,1951,'world-event-81-0',['8.5'],['GOV','CDI','SIO'],['Contextualization','Causation']],
  ['apwh-u8-accra-negotiated-independence','81',2,'Negotiated Independence','1951–1957',1951,1957,'world-event-81-0',['8.5'],['GOV'],['Causation','Comparison']],
  ['apwh-u8-accra-panafricanism-nonaligned-state-building','81',3,'Pan-Africanism, Nonalignment, and State Building','1957–1966',1957,1966,'world-event-81-0',['8.6','8.9'],['GOV','CDI','ECN'],['CCOT','Comparison']],

  ['apwh-u8-havana-batista-inequality-revolution','55',1,'Batista, Inequality, and Revolution','1952–1959',1952,1959,'world-event-55-2',['8.4','8.7'],['GOV','ECN','SIO'],['Contextualization','Causation']],
  ['apwh-u8-havana-bay-of-pigs-soviet-alignment','55',2,'Bay of Pigs and Soviet Alignment','1959–1961',1959,1961,'world-event-55-2',['8.2','8.3','8.4'],['GOV'],['Causation']],
  ['apwh-u8-havana-missile-crisis-nuclear-limits','55',3,'Missile Crisis and the Limits of Nuclear Competition','1962',1962,1962,'world-event-55-2',['8.2','8.3','8.9'],['GOV','TEC'],['Causation','Comparison']],

  ['apwh-u8-tehran-oil-nationalism-mosaddegh','21',1,'Oil Nationalism and Mosaddegh','1941–1953',1941,1953,'world-event-21-1',['8.6','8.7'],['ECN','GOV'],['Contextualization','Causation']],
  ['apwh-u8-tehran-coup-shah-authoritarian-alignment','21',2,"The 1953 Coup and the Shah's Alignment",'1953–1963',1953,1963,'world-event-21-1',['8.2','8.6'],['GOV','ECN'],['Causation']],
  ['apwh-u8-tehran-white-revolution-islamic-revolution','21',3,'White Revolution and the 1979 Islamic Revolution','1963–1979',1963,1979,'world-event-21-1',['8.6','8.7','8.9'],['GOV','CDI','SIO'],['Causation','CCOT']],

  ['apwh-u8-johannesburg-apartheid-legal-order','82',1,'Apartheid as a Legal Order','1948–1960',1948,1960,'world-event-82-0',['8.7'],['GOV','SIO'],['Contextualization','Causation']],
  ['apwh-u8-johannesburg-resistance-repression','82',2,'Organized Resistance and State Repression','1950–1989',1950,1989,'world-event-82-0',['8.7'],['GOV','SIO'],['Causation']],
  ['apwh-u8-johannesburg-pressure-negotiation-democratic-transition','82',3,'International Pressure, Negotiation, and Democratic Transition','1985–1994',1985,1994,'world-event-82-0',['8.7','8.9'],['GOV','SIO'],['Causation','CCOT']],
];
```

## Learner-Content Contract

Every record contains English-only `summary`, `significance`, `keyPeople`, `keyTerms`, at least two concrete `evidence` statements, `examConnection`, and `source: { id: 'amsco-apwh-u8', locator }`.

| Location | Required content and boundary |
| --- | --- |
| Germany / Berlin | Explain occupation zones, currency reform, blockade, airlift, two German states, the Wall, Soviet nonintervention, and reunification. Separate Soviet security aims from the specific decisions that caused the blockade; do not say ideology alone caused every crisis. |
| Soviet Union / Moscow | Explain the Eastern European buffer, Warsaw Pact commitments, détente, arms costs, Afghanistan, economic stagnation, glasnost, perestroika, and the withdrawal of coercive support. Treat these as interacting strains and choices, not one automatic cause of collapse. |
| China / Beijing | Connect communist victory to land policy, nationalism, Nationalist weakness, and civil-war choices; explain the Great Leap's mobilization and famine; explain Cultural Revolution political and social upheaval. Do not present communism as one uniform program shared by all states. |
| Vietnam / Saigon | Distinguish anticolonial war against France from later superpower proxy war; explain Geneva partition, containment, escalation, Vietnamese agency, withdrawal, and reunification. Saigon is representative; fighting and political organization occurred across Vietnam. |
| India / Delhi | Name Punjab and Bengal when explaining Partition and displacement; distinguish nonalignment from neutrality; connect sovereignty to Five-Year Plans and a mixed economy. Delhi is the national-state anchor, not the sole site of Partition. |
| Algeria / Algiers | Explain settler colonialism, blocked reform, FLN organization, French counterinsurgency, torture, the Evian settlement, settler exodus, and post-independence state formation factually. Do not reduce armed decolonization to ethnic inevitability. |
| Ghana / Accra | Explain mass nationalism, strikes/elections, negotiation, Nkrumah, independence, Pan-Africanism, nonalignment, infrastructure, and state-building tensions. Do not imply negotiated independence was cost-free or purely granted by Britain. |
| Cuba / Havana | Explain Batista-era inequality and repression, revolutionary coalition, Bay of Pigs, Soviet alignment, missiles, quarantine, bargaining, and nuclear restraint. Distinguish the 1959 revolution from the later superpower crisis. |
| Iran / Tehran | Explain oil nationalism, Mosaddegh, Anglo-American intervention, the shah's authoritarian alignment, White Revolution reforms and exclusions, and the 1979 revolution. Do not reduce the revolution to religious reaction against modernization. |
| South Africa / Johannesburg | Explain apartheid as law and administration; identify ANC resistance, repression, labor/civic action, sanctions, negotiation, Mandela, and the 1994 election. Johannesburg represents a national process; resistance did not occur only there. |

## Exact Graph Contract

Every location contains the directed pairs `sequence 1 → 2` and `sequence 2 → 3`. Add these exact cross-location causal pairs:

```js
const crossLocationCausalPairs = [
  ['apwh-u8-moscow-security-buffer-soviet-bloc','apwh-u8-berlin-occupation-ideological-division'],
  ['apwh-u8-beijing-civil-war-land-communist-victory','apwh-u8-saigon-partition-containment-escalation'],
  ['apwh-u8-moscow-gorbachev-reform-soviet-dissolution','apwh-u8-berlin-wall-nonintervention-reunification'],
  ['apwh-u8-accra-panafricanism-nonaligned-state-building','apwh-u8-johannesburg-pressure-negotiation-democratic-transition'],
];
```

Use these exact reciprocal related pairs:

```js
const expectedRelatedPairs = [
  ['apwh-u8-berlin-blockade-airlift-two-germanies','apwh-u8-havana-missile-crisis-nuclear-limits'],
  ['apwh-u8-beijing-civil-war-land-communist-victory','apwh-u8-havana-batista-inequality-revolution'],
  ['apwh-u8-delhi-independence-partition-displacement','apwh-u8-accra-negotiated-independence'],
  ['apwh-u8-accra-negotiated-independence','apwh-u8-algiers-fln-war-counterinsurgency'],
  ['apwh-u8-algiers-settler-colonialism-blocked-reform','apwh-u8-johannesburg-apartheid-legal-order'],
];
```

Every causal note names a mechanism and preserves agency at the target. Related notes are reciprocal and distinguish nonalignment from neutrality, negotiated from armed decolonization, and Algeria's independence war from South Africa's transition within an existing state.

## Exact Unit Cards

```js
const expectedUnitCards = {
  context: {
    id: 'apwh-u8-context-allied-victory-bipolar-decolonizing-world',
    kind: 'context',
    role: 'Unit 8 Context Card',
    title: 'From Allied Victory to a Bipolar and Decolonizing World',
    examSkills: ['Contextualization','Causation'],
    summary: 'World War II weakened European imperial capacity, elevated the United States and Soviet Union, left armies occupying strategic regions, strengthened anticolonial demands, and created the United Nations alongside a Security Council whose veto structure could freeze conflicts important to either superpower.',
    prompt: 'How did the outcomes of World War II create both superpower rivalry and new opportunities for decolonization?',
    takeaways: [
      'The United States and Soviet Union emerged with unmatched military and political influence.',
      'European empires survived the war with reduced resources and legitimacy.',
      'Nuclear weapons and the United Nations changed how states pursued conflict and sovereignty.',
    ],
  },
  synthesis: {
    id: 'apwh-u8-synthesis-bipolar-competition-globalized-order',
    kind: 'synthesis',
    role: 'Unit 8 Synthesis Card',
    title: 'From Bipolar Competition to a Globalized Order',
    examSkills: ['Causation','CCOT'],
    summary: 'Soviet collapse ended the second superpower system without ending proxy-war legacies, contested borders, uneven development, or demands for political autonomy. Former socialist states, newly independent states, and market-reforming communist governments entered a more integrated system of trade, finance, production, communication, and migration under unequal conditions.',
    prompt: 'Which Cold War and decolonization outcomes shaped who benefited from globalization after 1991?',
    takeaways: [
      'The Soviet bloc ended, but borders, alliances, military institutions, and conflict legacies persisted.',
      'New states entered global markets with unequal infrastructure, debt, and commodity dependence.',
      'Market reform changed socialist economies without producing identical political systems.',
    ],
  },
};
```

---

### Task 1: Create an isolated U8 worktree and lock publication in RED

**Files:**
- Create: `tests/apwh-u8-location-study.test.mjs`
- Expected missing file: `data/apwh-u8-location-study.js`

- [ ] **Step 1: Create an isolated branch**

Use `superpowers:using-git-worktrees` from the clean latest `agent/apwh-integration` containing this committed plan. Create branch `feature/apwh-u8-location-study` and record its absolute worktree path.

- [ ] **Step 2: Write the publication test**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const moduleUrl = new URL('../data/apwh-u8-location-study.js', import.meta.url);

test('publishes the Unit 8 location-study module', () => {
  assert.equal(existsSync(moduleUrl), true, 'Unit 8 data module must exist');
  const sandbox = {};
  sandbox.window = sandbox;
  vm.runInNewContext(readFileSync(moduleUrl, 'utf8'), sandbox);
  assert.equal(sandbox.APWH_U8_LOCATION_STUDY.unitId, 'u8');
  assert.equal(sandbox.APWH_U8_LOCATION_STUDY.unitNumber, 8);
});
```

- [ ] **Step 3: Verify RED and commit**

```bash
$NODE --test tests/apwh-u8-location-study.test.mjs
git add tests/apwh-u8-location-study.test.mjs
git commit -m "test: require APWH Unit 8 location study"
```

Expected: the test fails only because `data/apwh-u8-location-study.js` does not exist; the RED test commit succeeds.

### Task 2: Publish the exact immutable record contract

**Files:**
- Modify: `tests/apwh-u8-location-study.test.mjs`
- Create: `data/apwh-u8-location-study.js`

- [ ] **Step 1: Add exact manifest and API assertions**

Insert `expectedLocations`, `expectedBindings`, and `expectedManifest` from this plan. Assert:

```js
assert.equal(api.unitId, 'u8');
assert.equal(api.unitNumber, 8);
assert.equal(api.connectionTimelineMode, 'main-event');
assert.deepEqual([...api.locationNumbers], [...expectedLocations.keys()]);
assert.equal(api.records.length, 30);
assert.deepEqual(api.records.map(record => [
  record.id, record.locationNumber, record.sequence, record.title,
  record.dateLabel, record.startYear, record.endYear, record.mainEventKey,
  [...record.topicCodes], [...record.themeIds], [...record.examSkills],
]), expectedManifest);
assert.deepEqual([...new Set(api.records.flatMap(record => record.topicCodes))].sort(),
  ['8.1','8.2','8.3','8.4','8.5','8.6','8.7','8.8','8.9']);
```

Also lock three records per location, sequence order, defensive arrays, deep freezing, `getById`, `getByLocation`, `locationName`, unknown lookup behavior, exact `apwh-u8-` prefix, approved themes/skills, and refusal to overwrite the global.

- [ ] **Step 2: Write exact learner-content fixtures before implementation**

Create a `P(...)` helper matching `tests/apwh-u7-location-study.test.mjs` and add one literal fixture for every ID in `expectedManifest`. Each fixture must satisfy its row in the Learner-Content Contract, use a distinct explained key term, contain at least two concrete evidence statements, and end with the exact source locator derived from its Topic list:

```js
const expectedLocator = topics => `AMSCO AP World History, Unit 8, ${topics.length === 1 ? 'Topic' : 'Topics'} ${topics.length === 1 ? topics[0] : topics.length === 2 ? topics.join(' and ') : `${topics.slice(0, -1).join(', ')}, and ${topics.at(-1)}`}`;
```

Require these exact boundary strings somewhere in the relevant fixtures: `nonalignment was not neutrality`; `Punjab and Bengal were principal Partition regions`; `Delhi is a representative national anchor`; `Johannesburg is a representative national anchor`; `Saigon was renamed Ho Chi Minh City after reunification`; `interacting strains rather than a single automatic cause`.

- [ ] **Step 3: Implement the immutable IIFE using the established API**

Copy the validated structural implementation from `data/apwh-u7-location-study.js`, then make these exact substitutions before inserting the literal U8 manifest and learner records:

```js
(function publishUnit8LocationStudy(root) {
  'use strict';
  if (Object.prototype.hasOwnProperty.call(root, 'APWH_U8_LOCATION_STUDY')) {
    throw new Error('Invalid Unit 8 global APWH_U8_LOCATION_STUDY: refusing to overwrite existing value');
  }
  const UNIT_ID = 'u8';
  const UNIT_NUMBER = 8;
  const VALID_TOPIC_CODES = new Set(['8.1','8.2','8.3','8.4','8.5','8.6','8.7','8.8','8.9']);
  const VALID_THEME_IDS = new Set(['GOV','ECN','CDI','SIO','TEC','ENV']);
  const VALID_EXAM_SKILLS = new Set(['Causation','Comparison','CCOT','Contextualization']);
  const SOURCE_ID = 'amsco-apwh-u8';
})(typeof window !== 'undefined' ? window : globalThis);
```

The published object contains exactly `unitId`, `unitNumber`, `connectionTimelineMode`, `locationNumbers`, `records`, `unitCards`, `compareRecords`, `getById`, `getByLocation`, `locationName`, and `getUnitCard`, with the same descriptors and defensive-copy behavior as U7.

- [ ] **Step 4: Add focused negative validation tests**

Use fresh VM evaluations with source substitutions to reject wrong location or main-event binding, duplicate sequence or ID, malformed date or label mismatch, missing/invalid/duplicate Topic/theme/skill, incomplete/non-English content, malformed actor/term/evidence/source, a fourth record at a location, null raw records/cards, unresolved graph IDs, self-links, duplicate links, and global overwrite. Diagnostics must name `Invalid Unit 8` and the affected ID when available. Include the two-pass graph regression: a malformed referenced target must report the intended U8 validation error, not `TypeError`.

- [ ] **Step 5: Run focused tests and commit**

```bash
$NODE --test tests/apwh-u8-location-study.test.mjs
git diff --check
git add data/apwh-u8-location-study.js tests/apwh-u8-location-study.test.mjs
git commit -m "feat: add APWH Unit 8 location study data"
```

Expected: all U8 data and validation tests pass.

### Task 3: Add causal graph, unit cards, and source ledger

**Files:**
- Modify: `data/apwh-u8-location-study.js`
- Modify: `tests/apwh-u8-location-study.test.mjs`
- Create: `docs/data-sources/apwh-u8-location-study-source-ledger.md`

- [ ] **Step 1: Add failing exact graph fixtures**

Assert every location has reciprocal cause/effect navigation for `1 → 2 → 3`, all four declared cross-location causal pairs resolve with unique edges, and all five related pairs are reciprocal with identical notes. Reject chronology-only causal notes, self-links, unresolved IDs, duplicate edges, and reuse of one ordered pair across causal and related categories.

- [ ] **Step 2: Add failing exact card fixtures**

Insert `expectedUnitCards` from this plan and compare every card field, Exam Skill, prompt, and takeaway. Reject missing, extra, duplicated, non-English, non-frozen, or malformed cards.

- [ ] **Step 3: Add the failing ledger contract**

Require exactly thirty five-column rows:

```text
Stable ID | AP topic assignment | Main event | Source locator | Claims covered
```

Require this exact introduction:

```markdown
# APWH Unit 8 Location Study Source Ledger

The learner records use edition-neutral locators in AMSCO AP World History Unit 8 and the College Board framework effective Fall 2026. Map pins are representative anchors; a named city does not imply that every national or regional process occurred only there. Causal and comparison notes distinguish mechanisms from chronology and preserve the agency and differences of each case.
```

Reject missing/extra IDs, wrong main-event bindings, malformed columns, trailing content, vague whole-book citations, unverified page numbers, and missing caveats for Delhi/Partition, Johannesburg, Saigon/Ho Chi Minh City, Algiers, or cross-case comparisons.

- [ ] **Step 4: Implement graph, cards, and ledger**

Use the exact causal and related pairs printed above. Each causal note must name the concrete mechanism connecting source to target. Each comparison note must name both a shared analytical dimension and a meaningful difference. Deep-freeze graph arrays, reciprocal note maps, cards, takeaway arrays, and source objects.

Write one ledger row for every stable ID in manifest order, using edition-neutral locators such as `AMSCO AP World History, Unit 8, Topic 8.5`.

- [ ] **Step 5: Run tests and commit**

```bash
$NODE --test tests/apwh-u8-location-study.test.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add data/apwh-u8-location-study.js tests/apwh-u8-location-study.test.mjs docs/data-sources/apwh-u8-location-study-source-ledger.md
git commit -m "feat: connect APWH Unit 8 location studies"
```

Expected: focused and complete Node suites pass.

### Task 4: Register Unit 8 in the shared renderer

**Files:**
- Modify: `scripts/verify-world-timeline.mjs:519-565`
- Modify: `world-map.html:2295,5000`
- Modify: `index.html:856,976`

- [ ] **Step 1: Add failing loader and registry assertions**

Require each HTML file to load exactly once, after U7 and before page logic:

```html
<script src="data/apwh-u8-location-study.js"></script>
```

Require both registries to end with:

```js
u7: 'APWH_U7_LOCATION_STUDY',
u8: 'APWH_U8_LOCATION_STUDY',
```

Add a positive Berlin smoke test:

```js
await page.evaluate(() => {
  window.__mapFilter.setPeriod('u8');
  window.__mapFilter.openHit('29', 'europe', 'world-event-29-8');
});
await expectVisible(page.locator('#eventPanel [data-location-study-open="29"]'),
  'Unit 8 Berlin must expose a location-study entry');
```

Expected: browser verification fails because U8 is not loaded or registered.

- [ ] **Step 2: Add only loader and registry entries**

Append the script tag and registry entry in `world-map.html` and `index.html`. Do not copy renderer functions, introduce a U8 conditional, or alter causal chains, Timeline membership, event copy, pins, or coordinates.

- [ ] **Step 3: Verify and commit**

```bash
$NODE scripts/verify-world-timeline.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add world-map.html index.html scripts/verify-world-timeline.mjs
git commit -m "feat: render APWH Unit 8 location studies"
```

Expected: the U8 registration smoke test and all U1–U7 contracts pass.

### Task 5: Lock all ten standalone and homepage interactions

**Files:**
- Modify: `scripts/verify-world-timeline.mjs:441-565,3849-4350`

- [ ] **Step 1: Add the exact browser fixture**

```js
const UNIT_8_STUDY_VIEWS = Object.freeze([
  Object.freeze({ number:'29', region:'europe', label:'Cold War Division · Germany / Berlin', mainEventKey:'world-event-29-8', ids:Object.freeze(['apwh-u8-berlin-occupation-ideological-division','apwh-u8-berlin-blockade-airlift-two-germanies','apwh-u8-berlin-wall-nonintervention-reunification']) }),
  Object.freeze({ number:'40', region:'europe', label:'Soviet Power & Collapse · Soviet Union / Moscow', mainEventKey:'world-event-40-3', ids:Object.freeze(['apwh-u8-moscow-security-buffer-soviet-bloc','apwh-u8-moscow-detente-arms-afghanistan-strain','apwh-u8-moscow-gorbachev-reform-soviet-dissolution']) }),
  Object.freeze({ number:'5', region:'asia', label:'Communist Revolution & Transformation · China / Beijing', mainEventKey:'world-event-5-5', ids:Object.freeze(['apwh-u8-beijing-civil-war-land-communist-victory','apwh-u8-beijing-great-leap-state-mobilization-famine','apwh-u8-beijing-cultural-revolution-social-upheaval']) }),
  Object.freeze({ number:'16', region:'asia', label:'Decolonization & Proxy War · Vietnam / Saigon', mainEventKey:'world-event-16-0', ids:Object.freeze(['apwh-u8-saigon-french-return-anticolonial-war','apwh-u8-saigon-partition-containment-escalation','apwh-u8-saigon-withdrawal-reunification-war-costs']) }),
  Object.freeze({ number:'6', region:'asia', label:'Independence, Nonalignment & Development · India / Delhi', mainEventKey:'world-event-6-3', ids:Object.freeze(['apwh-u8-delhi-independence-partition-displacement','apwh-u8-delhi-nonalignment-foreign-policy-autonomy','apwh-u8-delhi-five-year-plans-mixed-economy']) }),
  Object.freeze({ number:'79', region:'mideast', label:'Settler Colonialism & Armed Decolonization · Algeria / Algiers', mainEventKey:'world-event-79-1', ids:Object.freeze(['apwh-u8-algiers-settler-colonialism-blocked-reform','apwh-u8-algiers-fln-war-counterinsurgency','apwh-u8-algiers-independence-exodus-new-state']) }),
  Object.freeze({ number:'81', region:'africa', label:'Negotiated Independence & Pan-Africanism · Ghana / Accra', mainEventKey:'world-event-81-0', ids:Object.freeze(['apwh-u8-accra-mass-nationalism-colonial-pressure','apwh-u8-accra-negotiated-independence','apwh-u8-accra-panafricanism-nonaligned-state-building']) }),
  Object.freeze({ number:'55', region:'americas', label:'Revolution & Nuclear Brinkmanship · Cuba / Havana', mainEventKey:'world-event-55-2', ids:Object.freeze(['apwh-u8-havana-batista-inequality-revolution','apwh-u8-havana-bay-of-pigs-soviet-alignment','apwh-u8-havana-missile-crisis-nuclear-limits']) }),
  Object.freeze({ number:'21', region:'mideast', label:'Oil, Intervention & Revolution · Iran / Tehran', mainEventKey:'world-event-21-1', ids:Object.freeze(['apwh-u8-tehran-oil-nationalism-mosaddegh','apwh-u8-tehran-coup-shah-authoritarian-alignment','apwh-u8-tehran-white-revolution-islamic-revolution']) }),
  Object.freeze({ number:'82', region:'africa', label:'Apartheid & Democratic Transition · South Africa / Johannesburg', mainEventKey:'world-event-82-0', ids:Object.freeze(['apwh-u8-johannesburg-apartheid-legal-order','apwh-u8-johannesburg-resistance-repression','apwh-u8-johannesburg-pressure-negotiation-democratic-transition']) }),
]);

const UNIT_8_BANDUNG = Object.freeze({
  number:'109', region:'asia', mainEventKey:'world-event-109-0',
  city:'Bandung', title:'Bandung Conference', date:'1955',
});
```

Assert ten unique supported locations, thirty unique IDs, three ordered IDs per location, and real page-metadata regions for all supported locations plus Bandung.

- [ ] **Step 2: Verify every standalone view**

For each fixture: select U8, open the exact event, assert Timeline/map selection, open `View all 3 study points`, check the country/region-plus-city heading and stable-ID order, click all rows, and verify exactly one expanded/current detail. Outer Back restores ordinary event detail and focus.

- [ ] **Step 3: Verify every homepage view**

Repeat the ten-location contract through `#worldMapFrame` and `#home-events`. Wait on iframe filter state rather than fixed timeouts. Assert canonical/mirror parity and homepage control synchronization.

- [ ] **Step 4: Verify navigation edges and cleanup**

Cover these representative paths:

- within-location causal: Berlin occupation → blockade and airlift;
- cross-location causal: Beijing communist victory → Saigon containment and escalation;
- cross-location causal: Moscow reform → Berlin Wall fall and reunification;
- cross-region causal: Accra Pan-African diplomacy → Johannesburg international pressure;
- related crisis comparison: Berlin Blockade ↔ Cuban Missile Crisis;
- related decolonization comparison: Accra negotiated independence ↔ Algiers armed struggle;
- related structural comparison: Algiers settler colonialism ↔ Johannesburg apartheid;
- two-level connection stack with query, category, and region filters;
- connection Back and target outer Back restoring Timeline/current card, filters, homepage controls, disclosures, and source-entry focus;
- keyboard activation and visible focus for entry, record, connection, and Back controls;
- a narrow viewport opening the longest India/Delhi heading with no document-level horizontal overflow, while Timeline cards remain horizontally scrollable;
- U8 → U7 and U8 → U9 cleanup with no stale study state;
- unsupported U8 pin `109` Bandung retains ordinary detail and has no study entry.

- [ ] **Step 5: Fix only demonstrated shared-renderer defects**

Run the verifier after adding contracts. If a failure exposes shared behavior, first add the smallest failing assertion, then repair the generic capability-driven code. No literal U8 conditional is permitted.

- [ ] **Step 6: Verify and commit browser contracts**

```bash
$NODE scripts/verify-world-timeline.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add scripts/verify-world-timeline.mjs world-map.html index.html
git commit -m "test: verify APWH Unit 8 study interactions"
```

Expected: all ten locations pass on both surfaces, Bandung stays ordinary-only, and U1–U7 remain green.

### Task 6: Final regression and integration readiness

**Files:**
- Review every file changed since the merge base with `agent/apwh-integration`.

- [ ] **Step 1: Run the focused U8 suite**

```bash
$NODE --test tests/apwh-u8-location-study.test.mjs
```

Expected: all U8 tests pass.

- [ ] **Step 2: Run complete verification once**

```bash
$NODE --test tests/*.test.mjs
$NODE scripts/verify-world-timeline.mjs
U8_BASE_COMMIT=$(git merge-base agent/apwh-integration HEAD)
git diff --check "$U8_BASE_COMMIT"..HEAD
git status --short
```

Expected: all Node tests and browser verification pass, diff check succeeds, and the worktree is clean.

- [ ] **Step 3: Audit scope and immutable existing content**

Confirm the branch adds only the U8 module, U8 ledger/tests, two loader/registry entries, and U8 browser contracts beyond `U8_BASE_COMMIT`. Verify the exact forty-three-item `WORLD_TIMELINE_UNIT_MEMBERS.u8` list, twenty-nine U8 map locations, all pin coordinates, every U8 chain object, and existing Timeline event copy are byte-for-byte unchanged from the base.

- [ ] **Step 4: Request final code review**

Review `U8_BASE_COMMIT..HEAD` for Critical and Important issues. Fix only verified blockers, rerun the affected focused test, then run the complete verification once.

- [ ] **Step 5: Finish the branch**

Use `superpowers:finishing-a-development-branch`. Do not merge into `agent/apwh-integration`, push, create a PR, or remove the worktree until the user chooses.
