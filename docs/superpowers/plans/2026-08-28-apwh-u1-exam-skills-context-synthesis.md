# APWH Unit 1 Exam Skills, Context Card, and Synthesis Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add validated historical-thinking skill tags to all twelve APWH Unit 1 study points and add collapsed Context and Synthesis bookend cards to every Unit 1 location-study list.

**Architecture:** Extend the existing immutable `APWH_U1_LOCATION_STUDY` data API with per-record `examSkills` and two separate unit-wide card records. Keep unit cards out of location records and render them through dedicated helpers in both mirrored APWH surfaces; share only the Exam Skills tag helper so unit-wide cards never acquire event, map, relationship, or source responsibilities.

**Tech Stack:** Static HTML/CSS/JavaScript, immutable browser-global data module, Node.js `node:test`, Playwright browser verification.

---

## File Structure

- `data/apwh-u1-location-study.js`: owns the Exam Skills vocabulary and assignments, immutable Unit 1 bookend-card data, validation, and public API.
- `tests/apwh-u1-location-study.test.mjs`: locks exact authored data, invalid-data diagnostics, English-only content, and deep immutability.
- `world-map.html`: renders and styles the standalone Unit 1 bookends and Exam Skills.
- `index.html`: mirrors the same presentation inside the homepage contextual panel.
- `scripts/verify-world-timeline.mjs`: verifies ordering, disclosure behavior, state isolation, exact Angkor labels, and `380/410/430px` overflow behavior in both surfaces.

Do not create a new runtime file. The existing data module is already the focused owner for Unit 1 learning content, and the two HTML files intentionally mirror their presentation contexts.

### Task 1: Specify and implement the Unit 1 data contract

**Files:**
- Modify: `tests/apwh-u1-location-study.test.mjs`
- Modify: `data/apwh-u1-location-study.js`

- [ ] **Step 1: Extend the expected study-point schema and exact assignments**

In `tests/apwh-u1-location-study.test.mjs`, add `examSkills` to `recordKeys` and define the exact vocabulary and assignment map:

```js
const validExamSkills = new Set([
  'Causation',
  'Comparison',
  'CCOT',
  'Contextualization',
]);

const expectedExamSkills = new Map([
  ['apwh-u1-hangzhou-song-commercial-revolution', ['Causation', 'CCOT']],
  ['apwh-u1-hangzhou-grand-canal-urban-market', ['Causation']],
  ['apwh-u1-hangzhou-paper-money-maritime-tools', ['Causation', 'Comparison']],
  ['apwh-u1-angkor-khmer-hydraulic-state', ['Causation', 'Comparison']],
  ['apwh-u1-angkor-hindu-buddhist-legitimation', ['Causation', 'Comparison']],
  ['apwh-u1-delhi-sultanate-state-building', ['Comparison', 'Causation']],
  ['apwh-u1-delhi-bhakti-sufi-devotion', ['Comparison', 'CCOT']],
  ['apwh-u1-baghdad-abbasid-knowledge-hub', ['Causation', 'CCOT']],
  ['apwh-u1-baghdad-merchant-ulema-network', ['Causation', 'Comparison']],
  ['apwh-u1-timbuktu-mali-gold-salt-tax', ['Causation']],
  ['apwh-u1-timbuktu-islamic-learning-griots', ['Comparison', 'CCOT']],
  ['apwh-u1-timbuktu-mansa-musa-pilgrimage', ['Causation', 'Contextualization']],
]);
```

Inside `ships the exact twelve complete English study points`, add:

```js
assert.deepEqual(record.examSkills, expectedExamSkills.get(record.id), `${record.id} exam skills`);
assert.ok(record.examSkills.length >= 1 && record.examSkills.length <= 2,
  `${record.id} exam skill count`);
assert.equal(new Set(record.examSkills).size, record.examSkills.length,
  `${record.id} unique exam skills`);
assert.ok(record.examSkills.every(skill => validExamSkills.has(skill)),
  `${record.id} valid exam skills`);
```

- [ ] **Step 2: Specify the two immutable unit cards**

Add this exact fixture and test:

```js
const expectedUnitCards = {
  context: {
    id: 'apwh-u1-context-global-tapestry',
    kind: 'context',
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
};

test('publishes the exact immutable Unit 1 context and synthesis cards', () => {
  assert.deepEqual(api.unitCards, expectedUnitCards);
  assert.equal(api.getUnitCard('context'), api.unitCards.context);
  assert.equal(api.getUnitCard('synthesis'), api.unitCards.synthesis);
  assert.equal(api.getUnitCard('missing'), null);
  assert.equal(Object.isFrozen(api.unitCards), true);
  for (const card of Object.values(api.unitCards)) {
    assert.equal(Object.isFrozen(card), true, `${card.kind} card`);
    assert.equal(Object.isFrozen(card.examSkills), true, `${card.kind} skills`);
    assert.equal(Object.isFrozen(card.takeaways), true, `${card.kind} takeaways`);
    assert.ok(card.examSkills.every(skill => validExamSkills.has(skill)));
    assert.doesNotMatch(JSON.stringify(card), /[\u3400-\u9fff]/);
  }
  assert.throws(() => { api.unitCards.context.examSkills.push('CCOT'); }, TypeError);
  assert.throws(() => { api.unitCards.synthesis.takeaways[0] = 'Changed'; }, TypeError);
  assert.deepEqual(api.unitCards, expectedUnitCards);
});

test('unit cards stay separate from map-bound study records', () => {
  assert.equal(api.records.length, 12);
  assert.ok(api.records.every(record => !Object.values(api.unitCards).includes(record)));
  for (const number of trialPins) {
    assert.ok(api.getByLocation(number).every(record => !record.kind));
  }
});
```

- [ ] **Step 3: Add failing validation fixtures**

Add source-mutation tests that replace one exact authored array or card field at a time and expect descriptive errors:

```js
test('rejects missing, invalid, duplicate, and oversized Exam Skills', () => {
  const fixtures = [
    ["['Causation', 'CCOT']", '[]', 'missing examSkills'],
    ["['Causation', 'CCOT']", "['Causation', 'Argumentation']", 'invalid examSkill Argumentation'],
    ["['Causation', 'CCOT']", "['Causation', 'Causation']", 'duplicate examSkill Causation'],
    ["['Causation', 'CCOT']", "['Causation', 'CCOT', 'Comparison']", 'more than two examSkills'],
  ];
  for (const [search, replacement, message] of fixtures) {
    assertDataModuleError(message,
      replaceDataSource(message, search, replacement),
      `Invalid Unit 1 study record apwh-u1-hangzhou-song-commercial-revolution: ${message}`);
  }
});
```

Add these exact unit-card source-mutation fixtures after the Exam Skills fixture:

```js
test('rejects malformed Unit 1 bookend cards with descriptive errors', () => {
  const fixtures = [
    ["kind: 'synthesis'", "kind: 'context'",
      'Invalid Unit 1 context card apwh-u1-synthesis-state-power: duplicate kind context'],
    ["id: 'apwh-u1-synthesis-state-power'", "id: 'apwh-u1-context-global-tapestry'",
      'Invalid Unit 1 synthesis card apwh-u1-context-global-tapestry: duplicate card ID'],
    ["title: 'The World in c. 1200'", "title: ''",
      'Invalid Unit 1 context card apwh-u1-context-global-tapestry: missing title'],
    ["examSkills: ['Contextualization', 'Comparison']",
      "examSkills: ['Contextualization', 'Argumentation']",
      'Invalid Unit 1 context card apwh-u1-context-global-tapestry: invalid examSkill Argumentation'],
    ["'Song China connected centralized administration to commercial growth and infrastructure.'", "''",
      'Invalid Unit 1 context card apwh-u1-context-global-tapestry: empty takeaway'],
  ];
  for (const [search, replacement, expectedMessage] of fixtures) {
    assertDataModuleError(expectedMessage,
      replaceDataSource(expectedMessage, search, replacement),
      expectedMessage);
  }
});
```

The authored constants in Step 6 must retain these exact literal strings so every replacement is proven to alter the module. Do not use mocks or bypass module initialization.

- [ ] **Step 4: Run the data tests and confirm RED**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u1-location-study.test.mjs
```

Expected: FAIL because canonical study records do not expose `examSkills`, and the API does not expose `unitCards` or `getUnitCard`.

- [ ] **Step 5: Implement validated Exam Skills metadata**

Near `VALID_TOPIC_CODES` and `VALID_THEME_IDS`, add:

```js
const VALID_EXAM_SKILLS = new Set([
  'Causation',
  'Comparison',
  'CCOT',
  'Contextualization',
]);

const EXAM_SKILLS = {
  'apwh-u1-hangzhou-song-commercial-revolution': ['Causation', 'CCOT'],
  'apwh-u1-hangzhou-grand-canal-urban-market': ['Causation'],
  'apwh-u1-hangzhou-paper-money-maritime-tools': ['Causation', 'Comparison'],
  'apwh-u1-angkor-khmer-hydraulic-state': ['Causation', 'Comparison'],
  'apwh-u1-angkor-hindu-buddhist-legitimation': ['Causation', 'Comparison'],
  'apwh-u1-delhi-sultanate-state-building': ['Comparison', 'Causation'],
  'apwh-u1-delhi-bhakti-sufi-devotion': ['Comparison', 'CCOT'],
  'apwh-u1-baghdad-abbasid-knowledge-hub': ['Causation', 'CCOT'],
  'apwh-u1-baghdad-merchant-ulema-network': ['Causation', 'Comparison'],
  'apwh-u1-timbuktu-mali-gold-salt-tax': ['Causation'],
  'apwh-u1-timbuktu-islamic-learning-griots': ['Comparison', 'CCOT'],
  'apwh-u1-timbuktu-mansa-musa-pilgrimage': ['Causation', 'Contextualization'],
};
```

Add a focused validator:

```js
function freezeExamSkills(ownerLabel, skills) {
  const fail = rule => { throw new Error(`${ownerLabel}: ${rule}`); };
  if (!Array.isArray(skills) || !skills.length) fail('missing examSkills');
  if (skills.length > 2) fail('more than two examSkills');
  const invalid = skills.find(skill => !VALID_EXAM_SKILLS.has(skill));
  if (invalid !== undefined) fail(`invalid examSkill ${describeRuleValue(invalid)}`);
  const duplicate = skills.find((skill, index) => skills.indexOf(skill) !== index);
  if (duplicate !== undefined) fail(`duplicate examSkill ${describeRuleValue(duplicate)}`);
  return Object.freeze([...skills]);
}
```

Because `describeRuleValue()` currently appears later, move it above `freezeRecord()` without changing its implementation. In `freezeRecord()`, add:

```js
examSkills: freezeExamSkills(
  `Invalid Unit 1 study record ${record.id}`,
  EXAM_SKILLS[record.id],
),
```

- [ ] **Step 6: Implement and publish the two unit cards**

Add a `freezeUnitCard()` helper that checks the exact kind, stable ID, non-empty English strings, two or three takeaways, and the same Exam Skills contract:

```js
function freezeUnitCard(card) {
  const label = `Invalid Unit 1 ${card.kind} card ${card.id}`;
  const fail = rule => { throw new Error(`${label}: ${rule}`); };
  if (!['context', 'synthesis'].includes(card.kind)) fail('invalid kind');
  for (const key of ['id', 'title', 'summary', 'prompt']) {
    if (typeof card[key] !== 'string' || !card[key].trim()) fail(`missing ${key}`);
    if (/[\u3400-\u9fff]/.test(card[key])) fail(`non-English ${key}`);
  }
  if (!Array.isArray(card.takeaways) || card.takeaways.length < 2 || card.takeaways.length > 3) {
    fail('takeaways must contain two or three items');
  }
  if (card.takeaways.some(item => typeof item !== 'string' || !item.trim())) fail('empty takeaway');
  if (card.takeaways.some(item => /[\u3400-\u9fff]/.test(item))) fail('non-English takeaway');
  return Object.freeze({
    ...card,
    examSkills: freezeExamSkills(label, card.examSkills),
    takeaways: Object.freeze([...card.takeaways]),
  });
}
```

Create the raw records with this exact content:

```js
const UNIT_CARD_DATA = [
  {
    id: 'apwh-u1-context-global-tapestry',
    kind: 'context',
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
  {
    id: 'apwh-u1-synthesis-state-power',
    kind: 'synthesis',
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
];
```

After creating `byId`, freeze and validate the collection:

```js
const unitCardRecords = UNIT_CARD_DATA.map(freezeUnitCard);
const unitCardKinds = new Map();
const unitCardIds = new Set();
for (const card of unitCardRecords) {
  const fail = rule => { throw new Error(`Invalid Unit 1 ${card.kind} card ${card.id}: ${rule}`); };
  if (unitCardKinds.has(card.kind)) fail(`duplicate kind ${card.kind}`);
  if (unitCardIds.has(card.id) || byId.has(card.id)) fail('duplicate card ID');
  unitCardKinds.set(card.kind, card);
  unitCardIds.add(card.id);
}
for (const kind of ['context', 'synthesis']) {
  if (!unitCardKinds.has(kind)) throw new Error(`Invalid Unit 1 unit cards: missing ${kind}`);
}
const UNIT_CARDS = Object.freeze({
  context: unitCardKinds.get('context'),
  synthesis: unitCardKinds.get('synthesis'),
});
```

Publish the validated collection:

```js
const api = Object.freeze({
  locationNumbers: Object.freeze(Object.keys(TRIAL_LOCATIONS)),
  locationName(number) { return TRIAL_LOCATIONS[String(number)] || null; },
  getByLocation(number) { return [...(byLocation.get(String(number)) || [])]; },
  getById(id) { return byId.get(String(id)) || null; },
  getUnitCard(kind) { return UNIT_CARDS[String(kind)] || null; },
  compareRecords,
  records: STUDY_EVENTS,
  unitCards: UNIT_CARDS,
});
```

- [ ] **Step 7: Run the data tests and confirm GREEN**

Run the same focused test command.

Expected: all tests in `tests/apwh-u1-location-study.test.mjs` pass.

- [ ] **Step 8: Commit the data contract**

```bash
git add data/apwh-u1-location-study.js tests/apwh-u1-location-study.test.mjs
git commit -m "feat: add Unit 1 exam skills and bookend data"
```

### Task 2: Specify the bookend UI contract in the browser verifier

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Add reusable bookend assertions**

Add a helper near the existing location-study helpers:

```js
async function assertUnitStudyBookends(page, view, label) {
  const cards = view.locator(':scope [data-study-unit-card]');
  assert.equal(await cards.count(), 2, `${label} must render exactly two unit cards`);
  assert.deepEqual(await cards.evaluateAll(nodes => nodes.map(node => node.dataset.studyUnitCard)),
    ['context', 'synthesis'], `${label} must expose the context and synthesis kinds`);

  const order = await view.locator('.location-study-list').evaluate(list =>
    [...list.children].map(child => child.dataset.studyUnitCard || child.querySelector('[data-study-event]')?.dataset.studyEvent));
  assert.equal(order[0], 'context', `${label} must start with Context`);
  assert.equal(order.at(-1), 'synthesis', `${label} must end with Synthesis`);

  const disclosures = cards.locator('details[data-study-unit-disclosure]');
  assert.deepEqual(await disclosures.evaluateAll(nodes => nodes.map(node => node.open)),
    [false, false], `${label} unit cards must start collapsed`);
  assert.deepEqual(await trimmedTexts(cards.locator('[data-study-exam-skill]')),
    ['Contextualization', 'Comparison', 'Comparison', 'CCOT'],
    `${label} unit cards must show exact skills while collapsed`);

  const eventDetailCount = await view.locator('[data-study-detail]').count();
  await disclosures.first().locator('summary').click();
  assert.equal(await disclosures.first().getAttribute('open'), '', `${label} Context must expand`);
  assert.equal(await view.locator('[data-study-detail]').count(), eventDetailCount,
    `${label} opening Context must not change event expansion`);
  assert.equal(await disclosures.first().locator('[data-study-unit-prompt]').count(), 1,
    `${label} Context must reveal its prompt`);
  assert.equal(await disclosures.first().locator('[data-study-unit-takeaway]').count(), 3,
    `${label} Context must reveal three takeaways`);
  await disclosures.first().locator('summary').click();

  for (const width of [380, 410, 430]) {
    const originalWidth = await view.evaluate(node => node.style.width);
    try {
      await view.evaluate((node, nextWidth) => { node.style.width = `${nextWidth}px`; }, width);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const overflow = await view.evaluate(node => ({ client: node.clientWidth, scroll: node.scrollWidth }));
      assert.ok(overflow.scroll <= overflow.client + 1,
        `${label} must not overflow at ${width}px: ${JSON.stringify(overflow)}`);
    } finally {
      await view.evaluate((node, original) => { node.style.width = original; }, originalWidth);
    }
  }
}
```

- [ ] **Step 2: Assert exact Exam Skills for Angkor and mirrored Hangzhou metadata**

In the standalone Hangzhou and homepage Hangzhou expanded-detail checks, assert:

```js
assert.deepEqual(await trimmedTexts(detail.locator('[data-study-exam-skill]')),
  ['Causation', 'CCOT'], `${label} must show the exact historical-thinking skills`);
assert.equal((await detail.locator('[data-study-exam-skills-label]').innerText()).trim(),
  'Exam Skills', `${label} must distinguish skills from themes`);
```

Invoke `assertUnitStudyBookends()` for both Hangzhou views while retaining the existing assertion that each view has exactly three `[data-study-event]` rows and the header says `3 study points`.

In the existing Angkor connection-navigation fixtures for standalone and homepage, assert the expanded `Angkor's Hydraulic State` detail exposes exactly:

```js
['Causation', 'Comparison']
```

- [ ] **Step 3: Verify unit-card disclosure state is isolated from map and timeline state**

Before opening the standalone Context disclosure, capture the same filter, selected event, selected anchor, selected location, and map transform fields already used by the surrounding progressive-study verification. After opening and closing the disclosure, deep-compare the snapshot. Also assert the currently expanded study-event ID and `[data-study-detail]` count remain unchanged.

Use native `summary` keyboard activation and assert:

```js
assert.ok(await summary.evaluate(node => node.getBoundingClientRect().height) >= 44);
await summary.focus();
await summary.press('Enter');
assert.equal(await summary.evaluate(node => document.activeElement === node), true);
```

- [ ] **Step 4: Run the verifier and confirm RED**

Run from an environment that permits localhost binding:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: FAIL because `[data-study-unit-card]` and `[data-study-exam-skill]` do not exist.

- [ ] **Step 5: Commit the failing UI contract**

```bash
git add scripts/verify-world-timeline.mjs
git commit -m "test: specify Unit 1 exam skills bookends"
```

### Task 3: Render Exam Skills and Unit 1 bookends in both APWH surfaces

**Files:**
- Modify: `world-map.html`
- Modify: `index.html`

- [ ] **Step 1: Add mirrored Exam Skills and unit-card styles**

In both files, extend the existing metadata row selector so Topics, Themes, and Exam Skills all wrap:

```css
.location-study-topics,
.location-study-themes,
.location-study-exam-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}
```

Use the existing `.home-events` prefix in `index.html`. Add:

```css
.location-study-exam-skills-block { display: grid; gap: 5px; min-width: 0; }
.location-study-exam-skills-label { color: #176369; font-size: 11px; font-weight: 850; }
.location-study-exam-skill {
  display: inline-flex; align-items: center; min-height: 26px; padding: 3px 8px;
  border: 1px solid #91bec1; border-radius: 999px;
  color: #176369; background: #edf6f7;
  font-size: 11px; font-weight: 800; line-height: 1.2;
}
.location-study-unit-card {
  min-width: 0; border: 1px solid var(--line); border-radius: 11px;
  background: var(--card); overflow: hidden;
}
.location-study-unit-card[data-study-unit-card="context"] { border-left: 5px solid #28708a; }
.location-study-unit-card[data-study-unit-card="synthesis"] { border-left: 5px solid #b85e3c; }
.location-study-unit-card summary {
  position: relative; display: grid; gap: 7px; min-width: 0; min-height: 44px;
  padding: 13px 46px 13px 14px;
  cursor: pointer; list-style: none;
}
.location-study-unit-card summary::-webkit-details-marker { display: none; }
.location-study-unit-card summary::after {
  content: "+"; position: absolute; top: 13px; right: 14px;
  display: grid; place-items: center; width: 24px; height: 24px;
  border: 1px solid currentColor; border-radius: 50%;
}
.location-study-unit-card details[open] summary::after { content: "−"; }
.location-study-unit-card summary:focus-visible { outline: 3px solid #28708a; outline-offset: -3px; }
.location-study-unit-role {
  color: #9a472c; font-size: 11px; font-weight: 850;
  letter-spacing: .08em; text-transform: uppercase;
}
.location-study-unit-title { color: #4b271c; font-size: 15px; line-height: 1.35; }
.location-study-unit-summary,
.location-study-unit-body p,
.location-study-unit-body li { color: var(--ink-soft); font-size: 12.5px; line-height: 1.6; }
.location-study-unit-body { display: grid; gap: 10px; padding: 2px 14px 15px; }
.location-study-unit-body ul { margin: 0; padding-left: 20px; }
```

For `index.html`, prefix selectors with `.home-events` and use its existing `var(--card)` surface. For `world-map.html`, use `var(--surface)` where the existing study card uses it. Do not introduce fixed widths; wrapping must handle the entire `380–430px` range.

- [ ] **Step 2: Add one shared-purpose Exam Skills markup helper per surface**

Near `studyDetailHTML()`, add:

```js
function studyExamSkillsHTML(skills) {
  const tags = skills.map(skill => `<span class="location-study-exam-skill" data-study-exam-skill>`
    + `${escapeTimelineText(skill)}</span>`).join('');
  return `<span class="location-study-exam-skills-block">`
    + `<span class="location-study-exam-skills-label" data-study-exam-skills-label>Exam Skills</span>`
    + `<span class="location-study-exam-skills">${tags}</span></span>`;
}
```

In `studyDetailHTML(record)`, insert `studyExamSkillsHTML(record.examSkills)` after the Themes row and before the title. Do this in `world-map.html` and in the mirrored homepage renderer in `index.html`.

- [ ] **Step 3: Add a dedicated unit-card renderer per surface**

Add:

```js
function studyUnitCardHTML(card) {
  const role = card.kind === 'context' ? 'Unit 1 Context Card' : 'Unit 1 Synthesis Card';
  const takeaways = card.takeaways.map(item =>
    `<li data-study-unit-takeaway>${escapeTimelineText(item)}</li>`).join('');
  return `<article class="location-study-unit-card" data-study-unit-card="${escapeTimelineText(card.kind)}">`
    + `<details data-study-unit-disclosure="${escapeTimelineText(card.kind)}">`
    + `<summary><span class="location-study-unit-role">${role}</span>`
    + `<strong class="location-study-unit-title">${escapeTimelineText(card.title)}</strong>`
    + `<span class="location-study-unit-summary">${escapeTimelineText(card.summary)}</span>`
    + `${studyExamSkillsHTML(card.examSkills)}</summary>`
    + `<div class="location-study-unit-body">`
    + `<p data-study-unit-prompt>${escapeTimelineText(card.prompt)}</p>`
    + `<ul>${takeaways}</ul></div></details></article>`;
}
```

This helper must not accept or read location, timeline, relationship, people, terms, evidence, or source fields.

- [ ] **Step 4: Place the bookends around the existing rows**

In each `renderLocationStudy()` implementation, read the two canonical cards:

```js
const contextCard = api.getUnitCard('context');
const synthesisCard = api.getUnitCard('synthesis');
if (!contextCard || !synthesisCard) {
  throw new Error('Invalid Unit 1 study cards: missing context or synthesis');
}
```

Change only the list content:

```js
const listHTML = studyUnitCardHTML(contextCard) + rows + studyUnitCardHTML(synthesisCard);
```

Then render `<div class="location-study-list">${listHTML}</div>`. Keep the existing `${records.length} study points` header copy unchanged so bookends do not inflate the location count.

Use native `<details>` with no `open` attribute. Do not add unit-card state to `locationStudyState`; native disclosure behavior is deliberately local and must not participate in iframe/homepage state synchronization.

- [ ] **Step 5: Run the browser verifier and confirm GREEN**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: `AP World Timeline browser verification passed`.

- [ ] **Step 6: Run the focused data tests again**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u1-location-study.test.mjs
```

Expected: all focused tests pass.

- [ ] **Step 7: Commit the mirrored UI implementation**

```bash
git add index.html world-map.html
git commit -m "feat: render Unit 1 exam skills bookends"
```

### Task 4: Run complete regression and scope verification

**Files:**
- Verify: `tests/*.test.mjs`
- Verify: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Run every Node test**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
```

Expected: all tests pass with zero failures. Record the exact final test count because Task 1 adds tests beyond the current 73.

- [ ] **Step 2: Run the full browser verifier from the final tree**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: `AP World Timeline browser verification passed`.

- [ ] **Step 3: Check whitespace and worktree state**

```bash
git diff --check
git status --short --branch
```

Expected: no whitespace errors and no uncommitted tracked changes.

- [ ] **Step 4: Review feature scope**

```bash
git log --oneline 927c1fd..HEAD
git diff --stat 927c1fd..HEAD
git diff --name-only 927c1fd..HEAD
```

Expected implementation files only:

```text
data/apwh-u1-location-study.js
index.html
scripts/verify-world-timeline.mjs
tests/apwh-u1-location-study.test.mjs
world-map.html
```

The feature must not modify APUSH data, APWH Unit 2–9 content, map coordinates, timeline datasets, causal-chain definitions, or the global frame layout.
