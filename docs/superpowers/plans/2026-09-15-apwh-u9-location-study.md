# APWH Unit 9 Location Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ten Unit 9 location studies with thirty causally ordered records, cross-location comparisons, and identical standalone/homepage behavior without changing the existing Unit 9 Timeline, pins, causal chains, or Units 1–8 study modules.

**Architecture:** Publish one immutable `APWH_U9_LOCATION_STUDY` IIFE module matching the established Unit 5–8 API and register it with the shared capability-driven renderer. Keep the other twelve Unit 9 Timeline locations as ordinary evidence, synchronize connections through each supported location's canonical main event, and add no pin, Timeline event, page mode, panel, or U9-specific renderer branch.

**Tech Stack:** Static JavaScript IIFE modules, HTML registries, Node.js `node:test` and `vm`, Markdown source ledger, Playwright browser verification.

---

## File Structure

- Create `data/apwh-u9-location-study.js`: canonical records, validation, graph, unit cards, and frozen API.
- Create `tests/apwh-u9-location-study.test.mjs`: exact metadata, content, API, graph, card, and ledger validation.
- Create `docs/data-sources/apwh-u9-location-study-source-ledger.md`: one exact row per record.
- Modify `world-map.html`: load and register `APWH_U9_LOCATION_STUDY` only.
- Modify `index.html`: load and register the same global for the homepage mirror only.
- Modify `scripts/verify-world-timeline.mjs`: U9 fixtures, standalone/homepage contracts, Dhaka ordinary-detail coverage, cleanup, and registry assertions.

Use this runtime:

```bash
NODE=/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
```

The design authority is `docs/superpowers/specs/2026-09-15-apwh-u9-location-study-design.md`. Its representative-anchor caveats, institutional distinctions, concise Timeline requirement, and non-goals are acceptance requirements.

## Canonical Runtime Contract

Use this exact location order and binding map:

```js
const expectedLocations = new Map([
  ['11', 'Food Security & Unequal Inputs · India / Amritsar–Punjab'],
  ['70', 'Digital Infrastructure & Knowledge Economy · United States / San Francisco'],
  ['15', 'Special Economic Zones & Export Manufacturing · China / Guangzhou'],
  ['65', 'Free Trade & Maquiladoras · Mexico / Ciudad Juárez'],
  ['5', 'Market Reform & Political Control · China / Beijing'],
  ['54', 'Global Financial Governance · United States / Washington, D.C.'],
  ['112', 'Resistance to Globalization · United States / Seattle'],
  ['24', 'Human Rights & Climate Governance · France / Paris'],
  ['34', 'Global Health Cooperation · Switzerland / Geneva'],
  ['110', 'Digital Culture & Soft Power · South Korea / Seoul'],
]);

const expectedBindings = new Map([
  ['11','world-event-11-3'], ['70','world-event-70-2'],
  ['15','world-event-15-1'], ['65','world-event-65-0'],
  ['5','world-event-5-13'], ['54','world-event-54-5'],
  ['112','world-event-112-0'], ['24','world-event-24-9'],
  ['34','world-event-34-2'], ['110','world-event-110-1'],
]);
```

Use this exact record metadata. Tuple order is:

```text
id, locationNumber, sequence, title, dateLabel, startYear, endYear,
mainEventKey, topicCodes, themeIds, examSkills
```

```js
const expectedManifest = [
  ['apwh-u9-amritsar-high-yield-seeds-input-package','11',1,'High-Yield Seeds and Complementary Inputs','1960s–1970s',1960,1979,'world-event-11-3',['9.1','9.3'],['TEC','ENV'],['Contextualization','Causation']],
  ['apwh-u9-amritsar-unequal-access-land-consolidation','11',2,'Unequal Access, Mechanization, and Land Consolidation','1960s–1980s',1960,1989,'world-event-11-3',['9.3','9.4'],['ECN','SIO'],['Causation','Comparison']],
  ['apwh-u9-amritsar-food-population-environmental-costs','11',3,'Food Supply, Population Growth, and Environmental Costs','1970s–2010s',1970,2019,'world-event-11-3',['9.3','9.9'],['ENV','SIO'],['Causation','CCOT']],

  ['apwh-u9-san-francisco-public-research-digital-infrastructure','70',1,'Public Research and Digital Infrastructure','1940s–1980s',1940,1989,'world-event-70-2',['9.1'],['TEC','GOV'],['Contextualization']],
  ['apwh-u9-san-francisco-computing-internet-information-costs','70',2,'Computing, Internet, and Lower Information Costs','1970s–1990s',1970,1999,'world-event-70-2',['9.1','9.4'],['TEC','ECN'],['Causation']],
  ['apwh-u9-san-francisco-knowledge-economy-distributed-production','70',3,'Knowledge Economy and Uneven Global Production','1990s–2010s',1990,2019,'world-event-70-2',['9.4','9.9'],['ECN','SIO'],['Causation','CCOT']],

  ['apwh-u9-guangzhou-market-reform-special-economic-zones','15',1,'Market Reform and Special Economic Zones','1978–1984',1978,1984,'world-event-15-1',['9.4'],['ECN','GOV'],['Contextualization','Causation']],
  ['apwh-u9-guangzhou-foreign-investment-export-manufacturing','15',2,'Foreign Investment and Export Manufacturing','1980s–2001',1980,2001,'world-event-15-1',['9.4'],['ECN','GOV'],['Causation']],
  ['apwh-u9-guangzhou-supply-chain-labor-environmental-costs','15',3,'Supply-Chain Expansion, Labor, and Environmental Costs','2001–2010s',2001,2019,'world-event-15-1',['9.3','9.4','9.9'],['ECN','SIO','ENV'],['Causation','CCOT']],

  ['apwh-u9-ciudad-juarez-border-industrialization','65',1,'Border Industrialization before NAFTA','1965–1993',1965,1993,'world-event-65-0',['9.4'],['ECN','GOV'],['Contextualization']],
  ['apwh-u9-ciudad-juarez-nafta-maquiladora-expansion','65',2,'NAFTA and Maquiladora Expansion','1994–2000s',1994,2009,'world-event-65-0',['9.4'],['ECN','GOV'],['Causation']],
  ['apwh-u9-ciudad-juarez-employment-gender-labor-environment','65',3,'Employment, Gender, Labor, and Environmental Tradeoffs','1990s–2010s',1990,2019,'world-event-65-0',['9.3','9.4','9.9'],['ECN','SIO','ENV'],['Comparison','CCOT']],

  ['apwh-u9-beijing-market-reform-political-control','5',1,'Market Reform without Political Liberalization','1978–1989',1978,1989,'world-event-5-13',['9.4','9.5'],['ECN','GOV'],['Contextualization','Causation']],
  ['apwh-u9-beijing-tiananmen-protest-repression','5',2,'Tiananmen Protest and State Repression','1989',1989,1989,'world-event-5-13',['9.5'],['GOV','SIO'],['Causation']],
  ['apwh-u9-beijing-wto-integration-information-control','5',3,'WTO Integration and Controlled Information','2001–2010s',2001,2019,'world-event-5-13',['9.4','9.5','9.9'],['GOV','ECN','TEC'],['Causation','CCOT']],

  ['apwh-u9-washington-bretton-woods-financial-institutions','54',1,'Bretton Woods and Postwar Financial Institutions','1944–1945',1944,1945,'world-event-54-5',['9.8'],['GOV','ECN'],['Contextualization']],
  ['apwh-u9-washington-development-lending-conditionality','54',2,'Development Lending and Policy Conditionality','1950s–2000s',1950,2009,'world-event-54-5',['9.4','9.8'],['ECN','GOV'],['Causation']],
  ['apwh-u9-washington-institutional-power-benefits-criticism','54',3,'Institutional Power, Development Claims, and Criticism','1990s–2010s',1990,2019,'world-event-54-5',['9.7','9.8','9.9'],['GOV','ECN'],['Causation','Comparison']],

  ['apwh-u9-seattle-wto-expansion-rulemaking-criticism','112',1,'WTO Expansion and Rule-Making Criticism','1995–1999',1995,1999,'world-event-112-0',['9.7','9.8'],['GOV','ECN'],['Contextualization','Causation']],
  ['apwh-u9-seattle-coalition-protest-digital-organization','112',2,'Coalition Protest and Digital Organization','1999',1999,1999,'world-event-112-0',['9.1','9.5','9.7'],['GOV','SIO','TEC'],['Causation']],
  ['apwh-u9-seattle-fair-trade-labor-continuing-resistance','112',3,'Fair Trade, Labor Standards, and Continuing Resistance','2000s–2010s',2000,2019,'world-event-112-0',['9.5','9.7','9.9'],['GOV','ECN','SIO'],['CCOT','Comparison']],

  ['apwh-u9-paris-universal-rights-global-norm','24',1,'Universal Rights as a Global Norm','1948',1948,1948,'world-event-24-9',['9.5','9.8'],['GOV','CDI'],['Contextualization']],
  ['apwh-u9-paris-kyoto-burden-sharing-debate','24',2,'Kyoto-to-Paris Burden-Sharing Debate','1997–2015',1997,2015,'world-event-24-9',['9.3','9.8'],['ENV','GOV'],['Causation','Comparison']],
  ['apwh-u9-paris-voluntary-climate-governance-limits','24',3,'Paris Agreement and the Limits of Voluntary Governance','2015–2019',2015,2019,'world-event-24-9',['9.3','9.8','9.9'],['ENV','GOV'],['Causation','CCOT']],

  ['apwh-u9-geneva-vaccination-smallpox-eradication','34',1,'Vaccination Networks and Smallpox Eradication','1967–1980',1967,1980,'world-event-34-2',['9.2','9.8'],['TEC','GOV'],['Contextualization','Causation']],
  ['apwh-u9-geneva-hiv-treatment-unequal-access','34',2,'HIV/AIDS Treatment and Unequal Access','1980s–2000s',1980,2009,'world-event-34-2',['9.2','9.9'],['TEC','SIO'],['Causation','Comparison']],
  ['apwh-u9-geneva-polio-ebola-coordination-limits','34',3,'Polio, Ebola, and the Limits of Health Coordination','1988–2010s',1988,2019,'world-event-34-2',['9.2','9.8','9.9'],['TEC','GOV'],['Causation','CCOT']],

  ['apwh-u9-seoul-state-supported-cultural-industries','110',1,'State Support for Cultural Industries','1990s–2000s',1990,2009,'world-event-110-1',['9.4','9.6'],['CDI','ECN','GOV'],['Contextualization','Causation']],
  ['apwh-u9-seoul-digital-platforms-transnational-audiences','110',2,'Digital Platforms and Transnational Audiences','2000s–2010s',2000,2019,'world-event-110-1',['9.1','9.6'],['CDI','TEC','ECN'],['Causation']],
  ['apwh-u9-seoul-hybrid-culture-exports-soft-power','110',3,'Hybrid Culture, Exports, and Soft Power','2000s–2010s',2000,2019,'world-event-110-1',['9.6','9.9'],['CDI','ECN'],['Comparison','CCOT']],
];
```

## Learner-Content Contract

Every record contains English-only `summary`, `significance`, `keyPeople`, `keyTerms`, at least two concrete `evidence` statements, `examConnection`, and `source: { id: 'amsco-apwh-u9', locator }`.

| Location | Required content and boundary |
| --- | --- |
| India / Amritsar–Punjab | Explain high-yield varieties, irrigation, fertilizer, credit, land, mechanization, food output, population, and water/soil costs. State that Amritsar–Punjab is a representative anchor and that seeds alone did not produce equal gains. |
| United States / San Francisco | Explain public research, semiconductors, computing, internet infrastructure, reduced information costs, knowledge work, and distributed production. State that San Francisco is representative; do not call it the place where the internet or World Wide Web was invented. |
| China / Guangzhou | Explain Deng-era reform, special economic zones, foreign investment, export manufacturing, supply-chain relocation, labor, and environmental costs. Distinguish a state policy choice from an automatic effect of technology. |
| Mexico / Ciudad Juárez | Explain the Border Industrialization Program, NAFTA, maquiladoras, cross-border production, employment, gender, labor standards, and pollution. Distinguish pre-NAFTA industrialization from expansion under NAFTA. |
| China / Beijing | Explain market reform without political liberalization, Tiananmen protest and repression, WTO accession, global integration, and information control. Do not imply WTO entry caused democratic liberalization. |
| United States / Washington, D.C. | Distinguish the World Bank from the IMF and both from the WTO; explain Bretton Woods, lending, conditionality, claimed development benefits, voting power, and criticism. State that Washington is a headquarters anchor for member-state institutions. |
| United States / Seattle | Explain the WTO ministerial, coalition protest, digital organization, labor/environmental concerns, fair trade, and continued resistance. Preserve both protester agency and institutional distinctions. |
| France / Paris | Distinguish the UN human-rights framework, Kyoto Protocol, and Paris Agreement; explain burden sharing, sovereignty, nationally determined contributions, and enforcement limits. State that Paris is representative, not the sole site of diplomacy. |
| Switzerland / Geneva | Explain WHO coordination, vaccination, smallpox eradication, HIV/AIDS treatment access, polio, Ebola, surveillance, state capacity, and unequal resources. State that Geneva is a coordination anchor, not the site of every outbreak. |
| South Korea / Seoul | Explain state support, cultural industry, digital distribution, transnational audiences, hybridity, exports, and soft power. State that Seoul represents South Korean production, not every platform or audience; do not equate globalization with Americanization. |

## Exact Graph Contract

Every location contains the directed pairs `sequence 1 → 2` and `sequence 2 → 3`. Add these exact cross-location causal pairs:

```js
const crossLocationCausalPairs = [
  ['apwh-u9-san-francisco-computing-internet-information-costs','apwh-u9-seoul-digital-platforms-transnational-audiences'],
  ['apwh-u9-guangzhou-foreign-investment-export-manufacturing','apwh-u9-beijing-wto-integration-information-control'],
  ['apwh-u9-ciudad-juarez-employment-gender-labor-environment','apwh-u9-seattle-coalition-protest-digital-organization'],
  ['apwh-u9-washington-development-lending-conditionality','apwh-u9-seattle-wto-expansion-rulemaking-criticism'],
];
```

Use these exact reciprocal related pairs:

```js
const expectedRelatedPairs = [
  ['apwh-u9-amritsar-unequal-access-land-consolidation','apwh-u9-guangzhou-supply-chain-labor-environmental-costs'],
  ['apwh-u9-guangzhou-foreign-investment-export-manufacturing','apwh-u9-ciudad-juarez-nafta-maquiladora-expansion'],
  ['apwh-u9-beijing-tiananmen-protest-repression','apwh-u9-seattle-coalition-protest-digital-organization'],
  ['apwh-u9-washington-institutional-power-benefits-criticism','apwh-u9-paris-voluntary-climate-governance-limits'],
  ['apwh-u9-geneva-polio-ebola-coordination-limits','apwh-u9-paris-voluntary-climate-governance-limits'],
];
```

Every causal note names a concrete mechanism and preserves agency at the target. Related notes are reciprocal and distinguish agriculture from manufacturing, Chinese unilateral reform from NAFTA, Tiananmen repression from Seattle protest, financial conditionality from voluntary global commitments, and disease campaigns from climate mitigation.

## Exact Unit Cards

```js
const expectedUnitCards = {
  context: {
    id: 'apwh-u9-context-post-cold-war-globalized-system',
    kind: 'context',
    role: 'Unit 9 Context Card',
    title: 'From the End of the Cold War to a Globalized System',
    examSkills: ['Contextualization','Causation'],
    summary: 'The end of the Cold War removed a rival superpower system just as market reforms, trade agreements, container shipping, air travel, and digital communications accelerated the movement of goods, capital, information, and people. Institutions created after World War II gained wider reach, but newly integrated states entered with unequal bargaining power, infrastructure, debt, and access to technology.',
    prompt: 'How did the end of the Cold War and falling transportation and information costs change the scale and rules of global interaction?',
    takeaways: [
      'The collapse of the Soviet bloc widened participation in a predominantly market-oriented global economy.',
      'Technology reduced the cost of connection without distributing the gains or risks equally.',
      'Postwar institutions expanded their reach while retaining unequal voting power and limited enforcement.',
    ],
  },
  synthesis: {
    id: 'apwh-u9-synthesis-regional-networks-planetary-interdependence',
    kind: 'synthesis',
    role: 'Unit 9 Synthesis Card',
    title: 'From Regional Networks to Planetary Interdependence',
    examSkills: ['CCOT','Causation'],
    summary: 'Since c. 1200, exchange networks repeatedly widened as states, merchants, empires, industries, and institutions reduced the cost of moving goods, labor, capital, and ideas. By the late twentieth century those networks connected production, communication, health, culture, human rights, and the environment at planetary scale, but no world government acquired matching authority to distribute gains, enforce rules, or assign responsibility for shared costs.',
    prompt: 'Across Units 1–9, how did expanding networks change who wrote the rules, captured the gains, and bore the costs of interdependence?',
    takeaways: [
      'Technologies changed the speed and scale of exchange, while political institutions determined access and rules.',
      'Expanding networks created recurring inequalities between centers, intermediaries, workers, and environments.',
      'Global problems became harder to contain within states even though enforcement still depended on state cooperation.',
    ],
  },
};
```

---

### Task 1: Create an isolated U9 worktree and lock publication in RED

**Files:**
- Create: `tests/apwh-u9-location-study.test.mjs`
- Expected missing file: `data/apwh-u9-location-study.js`

- [ ] **Step 1: Create an isolated branch**

Use `superpowers:using-git-worktrees` from the clean latest `agent/apwh-integration` containing this committed plan. Create branch `feature/apwh-u9-location-study` and record its absolute worktree path.

- [ ] **Step 2: Write the publication test**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const moduleUrl = new URL('../data/apwh-u9-location-study.js', import.meta.url);

test('publishes the Unit 9 location-study module', () => {
  assert.equal(existsSync(moduleUrl), true, 'Unit 9 data module must exist');
  const sandbox = {};
  sandbox.window = sandbox;
  vm.runInNewContext(readFileSync(moduleUrl, 'utf8'), sandbox);
  assert.equal(sandbox.APWH_U9_LOCATION_STUDY.unitId, 'u9');
  assert.equal(sandbox.APWH_U9_LOCATION_STUDY.unitNumber, 9);
});
```

- [ ] **Step 3: Verify RED and commit**

```bash
$NODE --test tests/apwh-u9-location-study.test.mjs
git add tests/apwh-u9-location-study.test.mjs
git commit -m "test: require APWH Unit 9 location study"
```

Expected: the test fails only because `data/apwh-u9-location-study.js` does not exist; the RED test commit succeeds.

### Task 2: Publish the exact immutable record contract

**Files:**
- Modify: `tests/apwh-u9-location-study.test.mjs`
- Create: `data/apwh-u9-location-study.js`

- [ ] **Step 1: Add exact manifest and API assertions**

Insert `expectedLocations`, `expectedBindings`, and `expectedManifest` from this plan. Assert:

```js
assert.equal(api.unitId, 'u9');
assert.equal(api.unitNumber, 9);
assert.equal(api.connectionTimelineMode, 'main-event');
assert.deepEqual([...api.locationNumbers], [...expectedLocations.keys()]);
assert.equal(api.records.length, 30);
assert.deepEqual(api.records.map(record => [
  record.id, record.locationNumber, record.sequence, record.title,
  record.dateLabel, record.startYear, record.endYear, record.mainEventKey,
  [...record.topicCodes], [...record.themeIds], [...record.examSkills],
]), expectedManifest);
assert.deepEqual([...new Set(api.records.flatMap(record => record.topicCodes))].sort(),
  ['9.1','9.2','9.3','9.4','9.5','9.6','9.7','9.8','9.9']);
```

Also lock three records per location, sequence order, defensive arrays, deep freezing, `getById`, `getByLocation`, `locationName`, unknown lookup behavior, exact `apwh-u9-` prefix, approved themes/skills, and refusal to overwrite the global.

- [ ] **Step 2: Write exact learner-content fixtures before implementation**

Create a `P(...)` helper matching `tests/apwh-u8-location-study.test.mjs` and add one literal fixture for every ID in `expectedManifest`. Each fixture must satisfy its row in the Learner-Content Contract, use a distinct explained key term, contain at least two concrete evidence statements, and end with this exact source-locator rule:

```js
const expectedLocator = topics => `AMSCO AP World History, Unit 9, ${topics.length === 1 ? 'Topic' : 'Topics'} ${topics.length === 1 ? topics[0] : topics.length === 2 ? topics.join(' and ') : `${topics.slice(0, -1).join(', ')}, and ${topics.at(-1)}`}`;
```

Require these exact boundary strings somewhere in the relevant fixtures: `Amritsar–Punjab is a representative anchor`; `seeds alone did not produce equal gains`; `San Francisco is a representative anchor`; `Washington, D.C. is a headquarters anchor`; `Geneva is a coordination anchor`; `Seoul is a representative anchor`; `globalization was not synonymous with Americanization`; `the World Bank, IMF, and WTO were distinct institutions`.

- [ ] **Step 3: Implement the immutable IIFE using the established API**

Copy the validated structural implementation from `data/apwh-u8-location-study.js`, then make these exact substitutions before inserting the literal U9 manifest and learner records:

```js
(function publishUnit9LocationStudy(root) {
  'use strict';
  if (Object.prototype.hasOwnProperty.call(root, 'APWH_U9_LOCATION_STUDY')) {
    throw new Error('Invalid Unit 9 global APWH_U9_LOCATION_STUDY: refusing to overwrite existing value');
  }
  const UNIT_ID = 'u9';
  const UNIT_NUMBER = 9;
  const VALID_TOPIC_CODES = new Set(['9.1','9.2','9.3','9.4','9.5','9.6','9.7','9.8','9.9']);
  const VALID_THEME_IDS = new Set(['GOV','ECN','CDI','SIO','TEC','ENV']);
  const VALID_EXAM_SKILLS = new Set(['Causation','Comparison','CCOT','Contextualization']);
  const SOURCE_ID = 'amsco-apwh-u9';
})(typeof window !== 'undefined' ? window : globalThis);
```

The published object contains exactly `unitId`, `unitNumber`, `connectionTimelineMode`, `locationNumbers`, `records`, `unitCards`, `compareRecords`, `getById`, `getByLocation`, `locationName`, and `getUnitCard`, with the same descriptors and defensive-copy behavior as U8.

- [ ] **Step 4: Add focused negative validation tests**

Use fresh VM evaluations with source substitutions to reject wrong location or main-event binding, duplicate sequence or ID, malformed date or label mismatch, missing/invalid/duplicate Topic/theme/skill, incomplete/non-English content, malformed actor/term/evidence/source, a fourth record at a location, null raw records/cards, unresolved graph IDs, self-links, duplicate links, and global overwrite. Diagnostics must name `Invalid Unit 9` and the affected ID when available. Include the two-pass graph regression: a malformed referenced target must report the intended U9 validation error, not `TypeError`.

- [ ] **Step 5: Run focused tests and commit**

```bash
$NODE --test tests/apwh-u9-location-study.test.mjs
git diff --check
git add data/apwh-u9-location-study.js tests/apwh-u9-location-study.test.mjs
git commit -m "feat: add APWH Unit 9 location study data"
```

Expected: all U9 data and validation tests pass.

### Task 3: Add causal graph, course-closing cards, and source ledger

**Files:**
- Modify: `data/apwh-u9-location-study.js`
- Modify: `tests/apwh-u9-location-study.test.mjs`
- Create: `docs/data-sources/apwh-u9-location-study-source-ledger.md`

- [ ] **Step 1: Add failing exact graph fixtures**

Assert every location has reciprocal cause/effect navigation for `1 → 2 → 3`, all four declared cross-location causal pairs resolve with unique edges, and all five related pairs are reciprocal with identical notes. Reject chronology-only causal notes, self-links, unresolved IDs, duplicate edges, and reuse of one ordered pair across causal and related categories.

- [ ] **Step 2: Add failing exact card fixtures**

Insert `expectedUnitCards` from this plan and compare every card field, Exam Skill, prompt, and takeaway. Reject missing, extra, duplicated, non-English, non-frozen, or malformed cards. Assert the synthesis card has no Unit 10 link or handoff field and closes Units 1–9.

- [ ] **Step 3: Add the failing ledger contract**

Require exactly thirty five-column rows:

```text
Stable ID | AP topic assignment | Main event | Source locator | Claims covered and caveat
```

Require this exact introduction:

```markdown
# APWH Unit 9 Location Study Source Ledger

The learner records use edition-neutral locators in AMSCO AP World History Unit 9 and the College Board framework effective Fall 2026. Map pins are representative anchors; a named city does not imply that every national or global process occurred only there. Institutional labels remain distinct, and project-authored causal or comparison analysis is identified separately from sourced facts.
```

Reject missing/extra IDs, wrong main-event bindings, malformed columns, trailing content, vague whole-book citations, unverified page numbers, missing source-vs-analysis distinction, or missing caveats for Amritsar/Punjab, San Francisco, Washington, Paris, Geneva, Seoul, and all five cross-case comparisons.

- [ ] **Step 4: Implement graph, cards, and ledger**

Use the exact causal pairs, related pairs, and cards printed above. Each causal note must name the concrete mechanism connecting source to target. Each comparison note must name a shared analytical dimension and a meaningful difference. Deep-freeze graph arrays, reciprocal note maps, cards, takeaway arrays, and source objects.

Write one ledger row for every stable ID in manifest order. Use the exact `expectedLocator` output for each record. In `Claims covered and caveat`, identify project-authored analytical links and state every required representative-anchor or institutional boundary.

- [ ] **Step 5: Run tests and commit**

```bash
$NODE --test tests/apwh-u9-location-study.test.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add data/apwh-u9-location-study.js tests/apwh-u9-location-study.test.mjs docs/data-sources/apwh-u9-location-study-source-ledger.md
git commit -m "feat: connect APWH Unit 9 location studies"
```

Expected: focused and complete Node suites pass.

### Task 4: Register Unit 9 in the shared renderer

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`
- Modify: `world-map.html`
- Modify: `index.html`

- [ ] **Step 1: Add failing loader and registry assertions**

Require each HTML file to load exactly once, after U8 and before page logic:

```html
<script src="data/apwh-u9-location-study.js"></script>
```

Require both registries to end with:

```js
u8: 'APWH_U8_LOCATION_STUDY',
u9: 'APWH_U9_LOCATION_STUDY',
```

Add a positive Amritsar smoke test:

```js
await page.evaluate(() => {
  window.__mapFilter.setPeriod('u9');
  window.__mapFilter.openHit('11', 'asia', 'world-event-11-3');
});
await expectVisible(page.locator('#eventPanel [data-location-study-open="11"]'),
  'Unit 9 Amritsar–Punjab must expose a location-study entry');
```

Expected: browser verification fails because U9 is not loaded or registered.

- [ ] **Step 2: Add only loader and registry entries**

Append the script tag and registry entry in `world-map.html` and `index.html`. Do not copy renderer functions, introduce a U9 conditional, alter causal chains, Timeline membership, event copy, pins, coordinates, U8→U9 seam, or any U1–U8 module.

- [ ] **Step 3: Verify and commit**

```bash
$NODE scripts/verify-world-timeline.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add world-map.html index.html scripts/verify-world-timeline.mjs
git commit -m "feat: render APWH Unit 9 location studies"
```

Expected: the U9 registration smoke test and all U1–U8 contracts pass.

### Task 5: Lock all ten standalone and homepage interactions

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Add the exact browser fixture**

```js
const UNIT_9_STUDY_VIEWS = Object.freeze([
  Object.freeze({ number:'11', region:'asia', label:'Food Security & Unequal Inputs · India / Amritsar–Punjab', mainEventKey:'world-event-11-3', ids:Object.freeze(['apwh-u9-amritsar-high-yield-seeds-input-package','apwh-u9-amritsar-unequal-access-land-consolidation','apwh-u9-amritsar-food-population-environmental-costs']) }),
  Object.freeze({ number:'70', region:'americas', label:'Digital Infrastructure & Knowledge Economy · United States / San Francisco', mainEventKey:'world-event-70-2', ids:Object.freeze(['apwh-u9-san-francisco-public-research-digital-infrastructure','apwh-u9-san-francisco-computing-internet-information-costs','apwh-u9-san-francisco-knowledge-economy-distributed-production']) }),
  Object.freeze({ number:'15', region:'asia', label:'Special Economic Zones & Export Manufacturing · China / Guangzhou', mainEventKey:'world-event-15-1', ids:Object.freeze(['apwh-u9-guangzhou-market-reform-special-economic-zones','apwh-u9-guangzhou-foreign-investment-export-manufacturing','apwh-u9-guangzhou-supply-chain-labor-environmental-costs']) }),
  Object.freeze({ number:'65', region:'americas', label:'Free Trade & Maquiladoras · Mexico / Ciudad Juárez', mainEventKey:'world-event-65-0', ids:Object.freeze(['apwh-u9-ciudad-juarez-border-industrialization','apwh-u9-ciudad-juarez-nafta-maquiladora-expansion','apwh-u9-ciudad-juarez-employment-gender-labor-environment']) }),
  Object.freeze({ number:'5', region:'asia', label:'Market Reform & Political Control · China / Beijing', mainEventKey:'world-event-5-13', ids:Object.freeze(['apwh-u9-beijing-market-reform-political-control','apwh-u9-beijing-tiananmen-protest-repression','apwh-u9-beijing-wto-integration-information-control']) }),
  Object.freeze({ number:'54', region:'americas', label:'Global Financial Governance · United States / Washington, D.C.', mainEventKey:'world-event-54-5', ids:Object.freeze(['apwh-u9-washington-bretton-woods-financial-institutions','apwh-u9-washington-development-lending-conditionality','apwh-u9-washington-institutional-power-benefits-criticism']) }),
  Object.freeze({ number:'112', region:'americas', label:'Resistance to Globalization · United States / Seattle', mainEventKey:'world-event-112-0', ids:Object.freeze(['apwh-u9-seattle-wto-expansion-rulemaking-criticism','apwh-u9-seattle-coalition-protest-digital-organization','apwh-u9-seattle-fair-trade-labor-continuing-resistance']) }),
  Object.freeze({ number:'24', region:'europe', label:'Human Rights & Climate Governance · France / Paris', mainEventKey:'world-event-24-9', ids:Object.freeze(['apwh-u9-paris-universal-rights-global-norm','apwh-u9-paris-kyoto-burden-sharing-debate','apwh-u9-paris-voluntary-climate-governance-limits']) }),
  Object.freeze({ number:'34', region:'europe', label:'Global Health Cooperation · Switzerland / Geneva', mainEventKey:'world-event-34-2', ids:Object.freeze(['apwh-u9-geneva-vaccination-smallpox-eradication','apwh-u9-geneva-hiv-treatment-unequal-access','apwh-u9-geneva-polio-ebola-coordination-limits']) }),
  Object.freeze({ number:'110', region:'asia', label:'Digital Culture & Soft Power · South Korea / Seoul', mainEventKey:'world-event-110-1', ids:Object.freeze(['apwh-u9-seoul-state-supported-cultural-industries','apwh-u9-seoul-digital-platforms-transnational-audiences','apwh-u9-seoul-hybrid-culture-exports-soft-power']) }),
]);

const UNIT_9_DHAKA = Object.freeze({
  number:'113', region:'asia', mainEventKey:'world-event-113-0',
  city:'Dhaka', title:'Rana Plaza', date:'2013',
});
```

Assert ten unique supported locations, thirty unique IDs, three ordered IDs per location, and real page-metadata regions for all supported locations plus Dhaka.

- [ ] **Step 2: Verify every standalone view**

For each fixture: select U9, open the exact event, assert Timeline/map selection, open `View all 3 study points`, check the country/region-plus-city heading and stable-ID order, click all rows, and verify exactly one expanded/current detail. Outer Back restores ordinary event detail and focus.

- [ ] **Step 3: Verify every homepage view**

Repeat the ten-location contract through `#worldMapFrame` and `#home-events`. Wait on iframe filter state instead of fixed timeouts. Assert canonical/mirror parity and homepage control synchronization.

- [ ] **Step 4: Verify navigation edges and cleanup**

Cover these representative paths:

- within-location causal: Amritsar high-yield seeds → unequal access and consolidation;
- cross-location causal: San Francisco information costs → Seoul digital audiences;
- cross-location causal: Guangzhou export growth → Beijing WTO integration;
- cross-region causal: Ciudad Juárez labor/environmental tradeoffs → Seattle coalition protest;
- institutional causal: Washington lending conditionality → Seattle rule-making criticism;
- related production comparison: Guangzhou export manufacturing ↔ Ciudad Juárez maquiladoras;
- related protest comparison: Beijing Tiananmen ↔ Seattle coalition protest;
- related governance comparison: Washington institutional criticism ↔ Paris voluntary climate governance;
- related collective-action comparison: Geneva health coordination ↔ Paris climate governance;
- two-level connection stack with query, category, and region filters;
- connection Back and target outer Back restoring Timeline/current card, filters, homepage controls, disclosures, and source-entry focus;
- keyboard activation and visible focus for entry, record, connection, and Back controls;
- a narrow viewport opening the longest San Francisco heading with no document-level horizontal overflow while Timeline cards remain horizontally scrollable and concise;
- U9 → U8 and U9 → All Units cleanup with no stale study state and no Unit 10 handoff;
- unsupported U9 pin `113` Dhaka retains ordinary Rana Plaza detail and has no study entry on standalone or homepage.

- [ ] **Step 5: Fix only demonstrated shared-renderer defects**

Run the verifier after adding contracts. If a failure exposes shared behavior, first add the smallest failing assertion, then repair the generic capability-driven code. No literal U9 conditional is permitted.

- [ ] **Step 6: Verify and commit browser contracts**

```bash
$NODE scripts/verify-world-timeline.mjs
$NODE --test tests/*.test.mjs
git diff --check
git add scripts/verify-world-timeline.mjs world-map.html index.html
git commit -m "test: verify APWH Unit 9 study interactions"
```

Expected: all ten locations pass on both surfaces, Dhaka stays ordinary-only, Timeline cards remain concise, and U1–U8 remain green.

### Task 6: Final regression and integration readiness

**Files:**
- Review every file changed since the merge base with `agent/apwh-integration`.

- [ ] **Step 1: Run the focused U9 suite**

```bash
$NODE --test tests/apwh-u9-location-study.test.mjs
```

Expected: all U9 tests pass.

- [ ] **Step 2: Run complete verification once**

```bash
$NODE --test tests/*.test.mjs
$NODE scripts/verify-world-timeline.mjs
U9_BASE_COMMIT=$(git merge-base agent/apwh-integration HEAD)
git diff --check "$U9_BASE_COMMIT"..HEAD
git status --short
```

Expected: all Node tests and browser verification pass, diff check succeeds, and the worktree is clean.

- [ ] **Step 3: Audit scope and immutable existing content**

Confirm the branch adds only the U9 module, U9 ledger/tests, two loader/registry entries, and U9 browser contracts beyond `U9_BASE_COMMIT`. Verify the exact twenty-five-item `WORLD_TIMELINE_UNIT_MEMBERS.u9` list, twenty-two U9 Timeline locations, every U9 pin and coordinate, all U9 chain objects, incoming U8 seam, existing Timeline event copy, and all U1–U8 study modules are byte-for-byte unchanged from the base.

- [ ] **Step 4: Request final code review**

Use `superpowers:requesting-code-review` to review `U9_BASE_COMMIT..HEAD` for Critical and Important issues. Fix only verified blockers, rerun the affected focused test, then run the complete verification once.

- [ ] **Step 5: Finish the branch**

Use `superpowers:finishing-a-development-branch`. Do not merge into `agent/apwh-integration`, push, create a PR, or remove the worktree until the user chooses.
