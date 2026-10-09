# APWH Unit 3 Comparative Empire Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Add eighteen English Unit 3 study points for Ottoman, Safavid, Mughal, Russia, Ming/Qing, and Tokugawa, plus Exam Skills, Context/Synthesis cards, responsive rendering, and clean Unit switching in both APWH surfaces.

**Architecture:** Put authored Unit 3 content in a dedicated immutable APWH_U3_LOCATION_STUDY module matching the Unit 1–2 API. Extend the two existing unit-to-global lookup maps; reuse the current renderer and styles, with one generic eyebrow formatter for Empire · Lens. Keep the Unit 3 relationship graph isolated and use sequence to preserve Expansion → Administration → Legitimation & Conflict.

**Tech Stack:** Static HTML/CSS/JavaScript, immutable browser globals, Node.js node:test and vm, Markdown source ledgers, Playwright browser verification.

---

## File Structure

- Create data/apwh-u3-location-study.js: exact content, validation, graph, immutability, and public API.
- Create tests/apwh-u3-location-study.test.mjs: exact manifest/cards/graph/ledger and malformed-source tests.
- Create docs/data-sources/apwh-u3-location-study-source-ledger.md: reproducible AMSCO Unit 3 locators.
- Modify world-map.html: load/resolve Unit 3 and format the comparative eyebrow.
- Modify index.html: resolve Unit 3 cards in the homepage mirror.
- Modify scripts/verify-world-timeline.mjs: verify both surfaces, switching, restoration, and widths.

Do not change the global frame, panel ratio, coordinates, existing causal chains, Unit 1–2 data, or Unit 4–9 behavior.

### Task 1: Specify Unit 3 data before implementation

**Files:**
- Create: tests/apwh-u3-location-study.test.mjs
- Create: docs/data-sources/apwh-u3-location-study-source-ledger.md

- [ ] **Step 1: Write the failing module harness**

~~~js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

await import('../data/apwh-u3-location-study.js');
const api = globalThis.APWH_U3_LOCATION_STUDY;
const dataModuleSource = readFileSync(new URL('../data/apwh-u3-location-study.js', import.meta.url), 'utf8');
const ledgerSource = readFileSync(new URL('../docs/data-sources/apwh-u3-location-study-source-ledger.md', import.meta.url), 'utf8');
const mutate = (search, replacement) => {
  const result = dataModuleSource.replace(search, replacement);
  assert.notEqual(result, dataModuleSource);
  return result;
};
const assertModuleError = (source, message) => assert.throws(
  () => runInNewContext(source, {}),
  error => error.message === message,
);
~~~

- [ ] **Step 2: Lock the exact eighteen-row manifest**

Use this exact tuple order:
ID, location, empire, lens, sequence, title, date label, start, end, main event, topics, themes, skills.

~~~js
const expectedManifest = [
  ['apwh-u3-ottoman-cannon-conquest-constantinople','18','Ottoman','Expansion',1,'Cannon Conquest of Constantinople','1453',1453,1453,'world-event-18-3',['3.1','3.4'],['TEC','GOV'],['Causation','Contextualization']],
  ['apwh-u3-ottoman-devshirme-janissary-system','18','Ottoman','Administration',2,'Devshirme and the Janissary System','c. 1450–1600',1450,1600,'world-event-18-3',['3.2','3.4'],['GOV','SIO'],['Causation','Comparison']],
  ['apwh-u3-ottoman-sunni-millet-imperial-architecture','18','Ottoman','Legitimation & Conflict',3,'Sunni Rule, the Millet System, and Imperial Architecture','1453–1750',1453,1750,'world-event-18-3',['3.3','3.4'],['CDI','GOV'],['Comparison','CCOT']],
  ['apwh-u3-safavid-ismail-qizilbash-conquest','19','Safavid','Expansion',1,'Ismail I and Qizilbash Conquest','1501–1514',1501,1514,'world-event-19-0',['3.1','3.4'],['GOV','TEC'],['Causation','Contextualization']],
  ['apwh-u3-safavid-shah-abbas-ghulams-centralization','19','Safavid','Administration',2,'Shah Abbas, Ghulams, and Centralization','1588–1629',1588,1629,'world-event-19-0',['3.2','3.4'],['GOV','SIO'],['Causation','Comparison']],
  ['apwh-u3-safavid-twelver-shiism-ottoman-rivalry','19','Safavid','Legitimation & Conflict',3,"Twelver Shi'ism and Ottoman Rivalry",'1501–1722',1501,1722,'world-event-19-0',['3.3','3.4'],['CDI','GOV'],['Comparison','CCOT']],
  ['apwh-u3-mughal-babur-gunpowder-panipat','6','Mughal','Expansion',1,'Babur, Gunpowder, and Panipat','1526',1526,1526,'world-event-6-1',['3.1','3.4'],['TEC','GOV'],['Causation','Contextualization']],
  ['apwh-u3-mughal-akbar-mansabdars-zamindars','6','Mughal','Administration',2,"Akbar's Mansabdars and Zamindars",'1556–1605',1556,1605,'world-event-6-1',['3.2','3.4'],['GOV','ECN'],['Causation','Comparison']],
  ['apwh-u3-mughal-akbar-tolerance-aurangzeb-orthodoxy','6','Mughal','Legitimation & Conflict',3,"From Akbar's Tolerance to Aurangzeb's Orthodoxy",'1556–1707',1556,1707,'world-event-6-1',['3.3','3.4'],['CDI','GOV'],['CCOT','Causation']],
  ['apwh-u3-russia-ivan-cossacks-siberian-expansion','25','Russia','Expansion',1,'Ivan IV, Cossacks, and Siberian Expansion','1547–1639',1547,1639,'world-event-25-0',['3.1','3.4'],['GOV','ENV'],['Causation','Contextualization']],
  ['apwh-u3-russia-peter-table-ranks','25','Russia','Administration',2,'Peter the Great and the Table of Ranks','1682–1725',1682,1725,'world-event-25-0',['3.2','3.4'],['GOV','SIO'],['CCOT','Causation']],
  ['apwh-u3-russia-orthodox-tsardom-boyars-new-capital','25','Russia','Legitimation & Conflict',3,'Orthodox Tsardom, Boyar Control, and a New Capital','1547–1725',1547,1725,'world-event-25-0',['3.3','3.4'],['CDI','GOV'],['CCOT','Contextualization']],
  ['apwh-u3-ming-qing-restoration-expansion','5','Ming/Qing','Expansion',1,'From Ming Restoration to Qing Expansion','1368–1757',1368,1757,'world-event-5-0',['3.1','3.4'],['GOV','ENV'],['CCOT','Causation']],
  ['apwh-u3-ming-qing-civil-service-continuity','5','Ming/Qing','Administration',2,'Civil-Service Continuity under Ming and Qing','1368–1750',1368,1750,'world-event-5-0',['3.2','3.4'],['GOV','SIO'],['CCOT','Comparison']],
  ['apwh-u3-ming-qing-manchu-confucian-ethnic-hierarchy','5','Ming/Qing','Legitimation & Conflict',3,'Manchu Rule, Confucian Legitimacy, and Ethnic Hierarchy','1644–1750',1644,1750,'world-event-5-0',['3.3','3.4'],['CDI','SIO'],['Comparison','Contextualization']],
  ['apwh-u3-tokugawa-firearms-unification-japan','14','Tokugawa','Expansion',1,'Firearms and the Unification of Japan','1560–1600',1560,1600,'world-event-14-0',['3.1','3.4'],['TEC','GOV'],['Causation','Contextualization']],
  ['apwh-u3-tokugawa-sankin-kotai-daimyo-control','14','Tokugawa','Administration',2,'Sankin-kotai and Daimyo Control','1635–1750',1635,1750,'world-event-14-0',['3.2','3.4'],['GOV','ECN'],['Causation','Comparison']],
  ['apwh-u3-tokugawa-confucian-sakoku-hierarchy','14','Tokugawa','Legitimation & Conflict',3,'Neo-Confucian Order, Sakoku, and Social Hierarchy','1603–1750',1603,1750,'world-event-14-0',['3.3','3.4'],['SIO','CDI'],['CCOT','Comparison']],
];
~~~

Assert unitId u3, unitNumber 3, exact locations ['5','6','14','18','19','25'], 18 records, and exactly one record for every lens/sequence pair per location.

- [ ] **Step 3: Lock the exact cards**

~~~js
const expectedUnitCards = {
  context: {
    id: 'apwh-u3-context-conditions-land-empire-building',
    kind: 'context',
    role: 'Unit 3 Context Card',
    title: 'Conditions for Land-Based Empire Building',
    summary: 'By c. 1450, gunpowder weapons, post-Mongol political openings, agrarian revenue systems, and inherited administrative traditions gave ambitious rulers the means to conquer large territories—and the institutions needed to govern them.',
    examSkills: ['Contextualization','Causation'],
    prompt: 'As you study Unit 3, distinguish the conditions rulers inherited from the new military and political changes that made rapid expansion possible.',
    takeaways: [
      'Gunpowder and artillery reduced the defensive advantage of walls and helped rulers accelerate territorial conquest.',
      'The fragmentation or weakness of earlier states created political openings for ambitious dynasties and military coalitions.',
      'Existing agrarian taxes, religious institutions, and administrative traditions gave conquerors tools for turning territory into recurring revenue.',
    ],
  },
  synthesis: {
    id: 'apwh-u3-synthesis-expansion-limits-land-power',
    kind: 'synthesis',
    role: 'Unit 3 Synthesis Card',
    title: 'How Land Empires Expanded—and Where Their Power Stopped',
    summary: 'From c. 1450 to 1750, land empires used comparable military, administrative, and legitimating strategies, but regional institutions shaped their results and their ability to compete in an increasingly oceanic world.',
    examSkills: ['Comparison','CCOT'],
    prompt: 'Compare two empires across expansion, administration, and legitimation. Which land-based strength could become a constraint as transoceanic networks expanded in Unit 4?',
    takeaways: [
      'Gunpowder conquest and frontier warfare created multiethnic territories faster than armies alone could govern them.',
      'Controlled officials, military elites, and local intermediaries converted conquest into taxes, while religion and monumental culture justified authority.',
      'Reliance on land revenue, court politics, and continental armies could limit sustained maritime investment as transoceanic trade networks grew.',
    ],
  },
};
~~~

Assert exact equality, safe lookup for toString/constructor/__proto__, separation from ordinary records, and deep freezing.

- [ ] **Step 4: Lock graph and content-quality requirements**

Within every empire author cause links Expansion → Administration → Legitimation & Conflict. Add related pairs: Ottoman expansion–Safavid expansion; Ottoman administration–Tokugawa administration; Safavid legitimacy–Mughal legitimacy; Russia expansion–Ming/Qing expansion; Ming/Qing administration–Mughal administration; Ming/Qing legitimacy–Tokugawa legitimacy.

Tests must require reciprocal categories and identical notes, no self-links, no target reused across categories, and at least one connection per record. For every record require at least one actor, two terms, two evidence statements, nonempty significance/exam connection, 1–2 exact Exam Skills, English-only nested strings, and deep immutability.

Add these chronology guards:

~~~js
assert.match(api.getById('apwh-u3-russia-ivan-cossacks-siberian-expansion').summary, /Moscow/);
assert.match(api.getById('apwh-u3-russia-ivan-cossacks-siberian-expansion').significance, /St\. Petersburg.*1703|1703.*St\. Petersburg/);
assert.match(api.getById('apwh-u3-ming-qing-restoration-expansion').summary, /Ming/);
assert.match(api.getById('apwh-u3-ming-qing-restoration-expansion').summary, /Qing/);
assert.doesNotMatch(JSON.stringify(api.records), /[\u3400-\u9fff]/);
~~~

- [ ] **Step 5: Add validation mutation tests**

Require exact Invalid Unit 3 diagnostics for invalid location, empire, lens, sequence, topic, theme, Exam Skill, main event, date, Chinese copy, source, count, duplicate ID, duplicate lens/sequence, card role/takeaways, unresolved/self/duplicate/nonreciprocal graph links, and missing notes. Reject a pre-existing APWH_U3_LOCATION_STUDY global.

- [ ] **Step 6: Create and lock the source ledger**

Create one row per manifest ID with the exact topic codes and main-event key. Use edition-neutral locators in the form AMSCO AP World History, Unit 3, Topics 3.x and 3.4. Claims must cover the named title, people, institutions, evidence, and the existing Unit 3 causal-chain material. Parse the table and assert exactly 18 unique matching IDs.

- [ ] **Step 7: Run RED and commit the contract**

~~~bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u3-location-study.test.mjs
git add tests/apwh-u3-location-study.test.mjs docs/data-sources/apwh-u3-location-study-source-ledger.md
git commit -m "test: specify Unit 3 location study data"
~~~

Expected: ERR_MODULE_NOT_FOUND before the commit; the missing module is the intended RED.

### Task 2: Implement the immutable Unit 3 data module

**Files:**
- Create: data/apwh-u3-location-study.js

- [ ] **Step 1: Define exact vocabulary and locations**

~~~js
(function publishUnit3LocationStudy(root) {
  'use strict';
  const UNIT_ID = 'u3';
  const UNIT_NUMBER = 3;
  const LOCATIONS = Object.freeze({
    '5':'Beijing','6':'Delhi','14':'Edo/Tokyo',
    '18':'Istanbul','19':'Isfahan','25':'St. Petersburg',
  });
  const EMPIRES = Object.freeze({
    '5':'Ming/Qing','6':'Mughal','14':'Tokugawa',
    '18':'Ottoman','19':'Safavid','25':'Russia',
  });
  const LENSES = Object.freeze(['Expansion','Administration','Legitimation & Conflict']);
  const VALID_TOPIC_CODES = new Set(['3.1','3.2','3.3','3.4']);
  const VALID_THEME_IDS = new Set(['GOV','ECN','TEC','CDI','SIO','ENV']);
  const VALID_EXAM_SKILLS = new Set(['Causation','Comparison','CCOT','Contextualization']);
  const VALID_MAIN_EVENTS = new Set([
    'world-event-5-0','world-event-6-1','world-event-14-0',
    'world-event-18-3','world-event-19-0','world-event-25-0',
  ]);
~~~

Insert the exact independent production manifest and cards from Task 1.

- [ ] **Step 2: Author the eighteen full English records**

Every record must implement this exact shape:

~~~js
{
  id, locationNumber, empire, lens, sequence, mainEventKey,
  title, dateLabel, startYear, endYear,
  summary, significance,
  keyPeople: [{ name, role }],
  keyTerms: [{ term, explanation }, { term, explanation }],
  evidence: [statementOne, statementTwo],
  examConnection,
  source: { id: 'amsco-apwh-u3', locator },
}
~~~

Use these exact term pairs in manifest order: gunpowder empire/Bosporus Strait; devshirme/Janissaries; millet system/imperial mosque; Qizilbash/Battle of Chaldiran; ghulam/Isfahan; Twelver Shi'ism/sectarian rivalry; Battle of Panipat/field artillery; mansabdar/zamindar; jizya/religious tolerance; Cossacks/yasak; Table of Ranks/service nobility; tsar/St. Petersburg; dynastic restoration/frontier expansion; civil-service examination/Confucian classics; banner system/queue; arquebus/Battle of Sekigahara; sankin-kotai/daimyo; sakoku/Neo-Confucian hierarchy.

Each summary explains mechanism, significance explains consequence, evidence names concrete dates/institutions, and Exam Connection tells how to deploy the record. Russia must distinguish Moscow-based expansion from St. Petersburg founded in 1703; Ming/Qing must name the acting dynasty; Tokugawa must distinguish nationwide unification from the later Edo center.

- [ ] **Step 3: Build reciprocal graph data and validation**

Author the two within-empire edges and six related pairs from Task 1. Validate the complete manifest, exact empire/lens/sequence matrix, cards, sources, English content, graph reciprocity, and nested types before freezing. Freeze nested actors, terms, evidence, skills, topics, themes, source, three link arrays, and connectionNotes.

Use sequence-first ordering:

~~~js
function compareRecords(a, b) {
  return a.sequence - b.sequence
    || a.startYear - b.startYear
    || a.endYear - b.endYear
    || a.id.localeCompare(b.id);
}
~~~

- [ ] **Step 4: Publish the locked API**

~~~js
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
Object.defineProperty(root, 'APWH_U3_LOCATION_STUDY', {
  configurable: false, enumerable: true, writable: false, value: api,
});
})(globalThis);
~~~

- [ ] **Step 5: Run GREEN and commit**

~~~bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u3-location-study.test.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
git diff --check
git add data/apwh-u3-location-study.js tests/apwh-u3-location-study.test.mjs docs/data-sources/apwh-u3-location-study-source-ledger.md
git commit -m "feat: add Unit 3 comparative study data"
~~~

Expected: all static tests pass.

### Task 3: Add Unit 3 to both renderers under browser-first tests

**Files:**
- Modify: scripts/verify-world-timeline.mjs
- Modify: world-map.html
- Modify: index.html

- [ ] **Step 1: Write exact browser fixtures and RED assertions**

Add six fixtures for Istanbul/18/world-event-18-3, Isfahan/19/world-event-19-0, Delhi/6/world-event-6-1, St. Petersburg/25/world-event-25-0, Beijing/5/world-event-5-0, and Edo/Tokyo/14/world-event-14-0. Give each its exact three manifest IDs and empire label.

For standalone and homepage views assert heading Location · Unit 3, 3 study points, Context + three events + Synthesis, exact record IDs, exact bookend copy, English-only output, one-at-a-time expansion, and these eyebrow strings:
Empire · Expansion, Empire · Administration, Empire · Legitimation & Conflict.

Verify exact topics/themes/skills for the first Istanbul record, Ottoman-to-Safavid connection navigation, Back disclosure/focus/scroll restoration, and parent/iframe parity.

- [ ] **Step 2: Add switching and responsive RED assertions**

Exercise u2 → u3 → u2 → u4 from a non-default expanded U3 record. Assert stale view/event/disclosure/focus state is cleared and Unit 4 has no study entry. At 380, 410, and 430px expand the longest card, Mughal legitimacy detail, terms, evidence, and connections in both surfaces; assert no horizontal overflow.

Run:

~~~bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
~~~

Expected: FAIL at the first missing Unit 3 study entry, not at syntax/server setup.

- [ ] **Step 3: Load and map Unit 3**

In world-map.html load the new module immediately after Unit 2:

~~~html
<script src="data/apwh-u3-location-study.js"></script>
~~~

Extend the standalone mapping with:

~~~js
u3: 'APWH_U3_LOCATION_STUDY',
~~~

Extend HOME_STUDY_GLOBAL_BY_UNIT in index.html with the same entry. Do not load the module directly in index.html; the homepage reads the iframe global.

- [ ] **Step 4: Add a width-neutral eyebrow formatter**

In world-map.html:

~~~js
function locationStudyEyebrow(record, api) {
  const empire = String(record?.empire || '').trim();
  const lens = String(record?.lens || '').trim();
  return empire && lens ? empire + ' · ' + lens : 'Unit ' + api.unitNumber + ' study point';
}
~~~

Use it only in the existing location-study-eyebrow element. Add no wrapper, column, fixed width, CSS rule, or U3 class. U1/U2 retain their existing eyebrow through fallback behavior.

- [ ] **Step 5: Run GREEN and commit**

~~~bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
git diff --check
git add world-map.html index.html scripts/verify-world-timeline.mjs
git commit -m "feat: render Unit 3 comparative studies"
~~~

Expected: browser verifier and all static tests pass.

### Task 4: Final audit and review

**Files:**
- Modify only files requiring a verified correction.

- [ ] **Step 1: Run content and source audits**

~~~bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u3-location-study.test.mjs
rg -n '[\p{Script=Han}]' data/apwh-u3-location-study.js docs/data-sources/apwh-u3-location-study-source-ledger.md
~~~

Expected: tests pass and no learner/source copy contains Han characters.

- [ ] **Step 2: Run the full suite from a clean server lifecycle**

~~~bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
git diff --check
git status --short
~~~

Expected: zero failures and no uncommitted implementation changes.

- [ ] **Step 3: Inspect scope and width safety**

~~~bash
git diff HEAD~2 --stat
git diff HEAD~2 -- world-map.html index.html
~~~

Expected: new U3 data/test/ledger, unit mappings, one eyebrow formatter, browser coverage, and no global frame/CSS layout changes.

- [ ] **Step 4: Request two-stage review**

Use superpowers:requesting-code-review for spec fidelity, historical/geographic honesty, validation, graph semantics, responsive behavior, and U1/U2 regression safety. Process findings through superpowers:receiving-code-review, reproduce them, add a failing test, apply the smallest fix, and rerun Step 2.

- [ ] **Step 5: Commit corrections only if review changed files**

~~~bash
git add data/apwh-u3-location-study.js tests/apwh-u3-location-study.test.mjs docs/data-sources/apwh-u3-location-study-source-ledger.md world-map.html index.html scripts/verify-world-timeline.mjs
git commit -m "fix: complete Unit 3 study verification"
~~~

Do not push, merge, or modify main until the user explicitly selects the integration action.

