# APWH Unit 1 Location Study Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an English-only Unit 1 trial in which five existing APWH locations retain their normal event cards and expose a secondary chronological study-point view.

**Architecture:** A browser-safe data module owns validated study records and chronological location queries. `world-map.html` consumes that module and adds a small location-study state machine inside the existing event zone; the map, filters, timeline, causal-chain, route, quiz, and mistake-book state remain authoritative and unchanged.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js ESM tests, Playwright verification through `scripts/verify-world-timeline.mjs`.

---

## File Map

- Create `data/apwh-u1-location-study.js`: English study records, immutable query API, and runtime validation.
- Create `tests/apwh-u1-location-study.test.mjs`: Node-level contract, reference, ordering, and scope tests.
- Modify `world-map.html`: load the module, add study-view styles, conditional entry action, renderer, focus handling, and local state.
- Modify `scripts/verify-world-timeline.mjs`: browser-level round-trip and regression checks.
- Modify `docs/data-sources/apwh-u1-location-study-source-ledger.md`: exact AMSCO/source trace for the trial content.

### Task 1: Define the browser-safe study data contract

**Files:**
- Create: `data/apwh-u1-location-study.js`
- Create: `tests/apwh-u1-location-study.test.mjs`

- [ ] **Step 1: Write the failing contract test**

Create `tests/apwh-u1-location-study.test.mjs` with Node's test runner. Load the script as a side effect and assert the public API and five-location scope:

```js
import assert from 'node:assert/strict';
import test from 'node:test';

await import('../data/apwh-u1-location-study.js');

const api = globalThis.APWH_U1_LOCATION_STUDY;
const trialPins = ['1', '2', '3', '9', '73'];

test('publishes the Unit 1 location-study API', () => {
  assert.ok(api);
  assert.equal(typeof api.getByLocation, 'function');
  assert.deepEqual([...api.locationNumbers], trialPins);
});

test('returns a defensive chronological array', () => {
  const first = api.getByLocation('1');
  const second = api.getByLocation('1');
  assert.notEqual(first, second);
  assert.deepEqual(first.map(item => item.id), second.map(item => item.id));
  assert.deepEqual(first.map(item => item.startYear),
    [...first].sort((a, b) => a.startYear - b.startYear || a.id.localeCompare(b.id)).map(item => item.startYear));
});
```

- [ ] **Step 2: Run the contract test and verify RED**

Run:

```bash
node --test tests/apwh-u1-location-study.test.mjs
```

Expected: FAIL because `data/apwh-u1-location-study.js` does not exist or `APWH_U1_LOCATION_STUDY` is undefined.

- [ ] **Step 3: Implement the minimal immutable API**

Create `data/apwh-u1-location-study.js` with a global API that works in a plain browser script and in Node ESM:

```js
(function publishUnit1LocationStudy(root) {
  'use strict';

  const TRIAL_LOCATIONS = Object.freeze({
    '1': 'Hangzhou',
    '3': 'Baghdad',
    '6': 'Delhi',
    '7': 'Angkor',
    '73': 'Timbuktu',
  });
  const STUDY_EVENTS = Object.freeze([]);
  const byLocation = new Map(Object.keys(TRIAL_LOCATIONS).map(number => [number, []]));

  const api = Object.freeze({
    locationNumbers: Object.freeze(Object.keys(TRIAL_LOCATIONS)),
    locationName(number) {
      return TRIAL_LOCATIONS[String(number)] || null;
    },
    getByLocation(number) {
      return [...(byLocation.get(String(number)) || [])];
    },
    records: STUDY_EVENTS,
  });

  Object.defineProperty(root, 'APWH_U1_LOCATION_STUDY', {
    configurable: false,
    enumerable: true,
    writable: false,
    value: api,
  });
})(globalThis);
```

- [ ] **Step 4: Run the contract test and verify GREEN**

Run `node --test tests/apwh-u1-location-study.test.mjs`.

Expected: 2 tests pass, 0 fail.

- [ ] **Step 5: Commit the contract**

```bash
git add data/apwh-u1-location-study.js tests/apwh-u1-location-study.test.mjs
git commit -m "test: define Unit 1 location study contract"
```

### Task 2: Add and validate the five-location English study content

**Files:**
- Modify: `data/apwh-u1-location-study.js`
- Modify: `tests/apwh-u1-location-study.test.mjs`
- Create: `docs/data-sources/apwh-u1-location-study-source-ledger.md`

- [ ] **Step 1: Add failing content and reference tests**

Append tests that require two or three records at every trial location, English-only visible text, complete study fields, valid Unit 1 main-event keys, and AMSCO locators:

```js
const validMainEvents = new Set([
  'world-event-1-0', 'world-event-3-0', 'world-event-6-0',
  'world-event-6-4', 'world-event-7-0', 'world-event-73-0',
  'world-event-73-2', 'world-event-73-3',
]);

test('ships two or three complete English study points per trial location', () => {
  for (const number of trialPins) {
    const records = api.getByLocation(number);
    assert.ok(records.length >= 2 && records.length <= 3, `${number} count`);
    for (const record of records) {
      assert.match(record.title, /[A-Za-z]/);
      assert.doesNotMatch(record.title, /[\u3400-\u9fff]/);
      assert.match(record.summary, /[A-Za-z]/);
      assert.ok(record.significance.length >= 60);
      assert.ok(record.examConnection.length >= 60);
      assert.ok(record.keyPeople.length >= 1);
      assert.ok(record.keyTerms.length >= 2);
      assert.ok(record.evidence.length >= 2);
      assert.ok(validMainEvents.has(record.mainEventKey));
      assert.match(record.source.locator, /AMSCO|Topic|p\./i);
    }
  }
});

test('uses globally unique stable study identifiers', () => {
  const ids = api.records.map(item => item.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every(id => /^apwh-u1-(hangzhou|angkor|delhi|baghdad|timbuktu)-/.test(id)));
});
```

- [ ] **Step 2: Run tests and verify RED**

Run `node --test tests/apwh-u1-location-study.test.mjs`.

Expected: FAIL because every location currently returns zero records.

- [ ] **Step 3: Add the exact trial record set**

Populate `STUDY_EVENTS` with the following twelve records, all visible prose in English:

| Location | Stable ID suffix | Date | Title | Main event |
|---|---|---:|---|---|
| Hangzhou | `song-commercial-revolution` | 960–1279 | Song Commercial Revolution | `world-event-1-0` |
| Hangzhou | `grand-canal-urban-market` | 1000–1279 | Grand Canal and the Hangzhou Market | `world-event-1-0` |
| Hangzhou | `paper-money-maritime-tools` | 1100–1279 | Paper Money and Maritime Technology | `world-event-1-0` |
| Angkor | `khmer-hydraulic-state` | 802–1431 | Angkor's Hydraulic State | `world-event-7-0` |
| Angkor | `hindu-buddhist-legitimation` | 1113–1431 | Hindu and Buddhist Legitimation at Angkor | `world-event-7-0` |
| Delhi | `sultanate-state-building` | 1206–1450 | Delhi Sultanate State Building | `world-event-6-0` |
| Delhi | `bhakti-sufi-devotion` | 1100–1450 | Bhakti and Sufi Devotional Traditions | `world-event-6-4` |
| Baghdad | `abbasid-knowledge-hub` | 750–1258 | Baghdad as an Abbasid Knowledge Hub | `world-event-3-0` |
| Baghdad | `merchant-ulema-network` | 1000–1450 | Merchants, Ulama, and Islamic Trade | `world-event-3-0` |
| Timbuktu | `mali-gold-salt-tax` | 1235–1450 | Mali, Gold, Salt, and Transit Taxation | `world-event-73-0` |
| Timbuktu | `mansa-musa-pilgrimage` | 1324 | Mansa Musa's Pilgrimage | `world-event-73-3` |
| Timbuktu | `islamic-learning-griots` | 1300–1450 | Islamic Learning and Griot Memory | `world-event-73-2` |

Use this complete record shape for every row, replacing values with the named event's AMSCO-backed facts:

```js
Object.freeze({
  id: 'apwh-u1-hangzhou-song-commercial-revolution',
  locationNumber: '1',
  mainEventKey: 'world-event-1-0',
  title: 'Song Commercial Revolution',
  dateLabel: '960–1279',
  startYear: 960,
  endYear: 1279,
  summary: 'Song policies, urban demand, and transport networks expanded production and exchange around Hangzhou.',
  significance: 'The commercial revolution connected a large internal market to maritime Asia and made cities, credit, and specialized production central to Song prosperity.',
  keyPeople: Object.freeze([{ name: 'Emperor Taizu', role: 'Founded the Song dynasty and began the political order in which the commercial expansion developed.' }]),
  keyTerms: Object.freeze([
    { term: 'commercialization', explanation: 'Production increasingly organized for sale through markets rather than only local subsistence.' },
    { term: 'flying cash', explanation: 'A transferable credit instrument that reduced the need to carry heavy strings of copper coins.' },
  ]),
  evidence: Object.freeze([
    'Hangzhou stood at the southern end of the Grand Canal and served a large urban market.',
    'Song China used paper money and expanded maritime navigation with the compass and printed charts.',
  ]),
  examConnection: 'Use Hangzhou to explain how state infrastructure and financial innovation increased interregional trade in the period c. 1200–1450.',
  source: Object.freeze({ id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topics 1.1 and 1.2.' }),
})
```

Build `byLocation` after the records are declared, sort by `startYear`, `endYear`, and `id`, and freeze each stored array.

- [ ] **Step 4: Write the source ledger**

Create `docs/data-sources/apwh-u1-location-study-source-ledger.md` with one row per record and these columns:

```markdown
| Study ID | AP topic | Main event | Source locator | Claims covered |
|---|---|---|---|---|
| `apwh-u1-hangzhou-song-commercial-revolution` | 1.1–1.2 | `world-event-1-0` | AMSCO Unit 1, Topics 1.1–1.2 | Song commercialization, Grand Canal, Hangzhou market, paper money |
```

Assign ledger topics explicitly: Hangzhou records use Topics 1.1 and 1.2; Angkor records use Topic 1.3; Delhi records use Topic 1.3; Baghdad records use Topic 1.2; Timbuktu records use Topic 1.4, with Topic 2.2 used only where a trans-Saharan trade mechanism needs that supporting context. Each row names its linked `world-event-*` key and lists the particular claim covered by that locator.

- [ ] **Step 5: Run tests and verify GREEN**

Run `node --test tests/apwh-u1-location-study.test.mjs`.

Expected: 4 tests pass, 0 fail.

- [ ] **Step 6: Commit the content layer**

```bash
git add data/apwh-u1-location-study.js tests/apwh-u1-location-study.test.mjs docs/data-sources/apwh-u1-location-study-source-ledger.md
git commit -m "feat: add Unit 1 location study content"
```

### Task 3: Add the secondary entry action without changing normal location cards

**Files:**
- Modify: `world-map.html`
- Modify: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Add a failing browser assertion for the approved B interaction**

After the verifier opens Map Event Details and Unit 1, add:

```js
await page.locator('[data-learning-view="map"]').click();
await page.locator('#periodFilter').selectOption('u1');
await page.evaluate(() => window.__mapFilter.openHit('1', 'asia'));
await expectVisible(page.locator('#eventPanel .event-list'), 'Hangzhou must keep its ordinary event cards');
await expectVisible(page.locator('#eventPanel [data-location-study-open="1"]'),
  'Hangzhou must offer the secondary location-study action');
assert.equal(await page.locator('#eventPanel [data-location-study-open]').count(), 1,
  'an ordinary location panel must expose one study entry action');

await page.evaluate(() => window.__mapFilter.openHit('23', 'europe'));
assert.equal(await page.locator('#eventPanel [data-location-study-open]').count(), 0,
  'a non-trial location must retain the original event-card UI');
```

- [ ] **Step 2: Run the browser verifier and verify RED**

Run `node scripts/verify-world-timeline.mjs`.

Expected: FAIL because the study data script and `data-location-study-open` control are absent.

- [ ] **Step 3: Load the data module and render the conditional action**

Add this before the main `world-map.html` interaction script:

```html
<script src="data/apwh-u1-location-study.js"></script>
```

Inside `renderEventContent`, after the existing `.event-list`, append the action only when Unit 1 is selected and the API returns records:

```js
function locationStudyRecords(num) {
  if (window.__mapFilter?.getState().period !== 'u1') return [];
  return window.APWH_U1_LOCATION_STUDY?.getByLocation(String(num)) || [];
}

function locationStudyEntryHTML(num) {
  const records = locationStudyRecords(num);
  if (!records.length) return '';
  return `<div class="location-study-entry">
    <button type="button" class="rt-btn location-study-open"
      data-location-study-open="${num}">View all ${records.length} study points</button>
  </div>`;
}
```

Concatenate `locationStudyEntryHTML(num)` after the event list and before assigning `eventPanel.innerHTML`. Add styles that preserve the existing event-zone layout and give the button a minimum 44-pixel height and visible focus state.

- [ ] **Step 4: Run the browser verifier and verify GREEN**

Run `node scripts/verify-world-timeline.mjs`.

Expected: PASS, including the new Hangzhou and non-trial-location assertions.

- [ ] **Step 5: Commit the entry action**

```bash
git add world-map.html scripts/verify-world-timeline.mjs
git commit -m "feat: link Unit 1 locations to study points"
```

### Task 4: Implement the English chronological study view and round trip

**Files:**
- Modify: `world-map.html`
- Modify: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Add failing round-trip, expansion, and state-preservation checks**

Capture filter and map state, open Hangzhou study points, expand a record, return, and compare state:

```js
const beforeStudy = await page.evaluate(() => ({
  filter: window.__mapFilter.getState(),
  timeline: window.getTimelineState(),
  mapTransform: document.querySelector('#map-root')?.getAttribute('transform'),
}));
await page.locator('[data-location-study-open="1"]').click();
await expectVisible(page.locator('#eventPanel [data-location-study-view="1"]'),
  'Hangzhou study view must open in the event panel');
assert.match(await page.locator('#eventPanel').innerText(), /Hangzhou · Unit 1/);
assert.equal(await page.locator('#eventPanel [data-study-event]').count(), 3);
await page.locator('#eventPanel [data-study-event]').nth(1).click();
assert.equal(await page.locator('#eventPanel [data-study-detail]').count(), 1);
assert.match(await page.locator('#eventPanel [data-study-detail]').innerText(), /Key terms|Evidence|Exam connection/);
await page.locator('#eventPanel [data-location-study-back="1"]').click();
await expectVisible(page.locator('#eventPanel .event-list'), 'Back must restore Hangzhou event cards');
const afterStudy = await page.evaluate(() => ({
  filter: window.__mapFilter.getState(),
  timeline: window.getTimelineState(),
  mapTransform: document.querySelector('#map-root')?.getAttribute('transform'),
}));
assert.deepEqual(afterStudy.filter, beforeStudy.filter);
assert.equal(afterStudy.timeline.selectedAnchor?.num, beforeStudy.timeline.selectedAnchor?.num);
assert.equal(afterStudy.mapTransform, beforeStudy.mapTransform);
```

- [ ] **Step 2: Run the browser verifier and verify RED**

Run `node scripts/verify-world-timeline.mjs`.

Expected: FAIL because clicking the entry action has no handler and no study view exists.

- [ ] **Step 3: Add minimal study state and renderers**

Add local state beside `activeNum`:

```js
const locationStudyState = {
  locationNumber: null,
  expandedStudyId: null,
};
```

Add escaped, English-only render helpers:

```js
function studyDetailHTML(record) {
  return `<div class="location-study-detail" data-study-detail="${record.id}">
    <section><h4>Significance</h4><p>${record.significance}</p></section>
    <section><h4>Key people</h4><dl>${record.keyPeople.map(person =>
      `<dt>${person.name}</dt><dd>${person.role}</dd>`).join('')}</dl></section>
    <section><h4>Key terms</h4><dl>${record.keyTerms.map(item =>
      `<dt>${item.term}</dt><dd>${item.explanation}</dd>`).join('')}</dl></section>
    <section><h4>Evidence</h4><ul>${record.evidence.map(item => `<li>${item}</li>`).join('')}</ul></section>
    <section><h4>Exam connection</h4><p>${record.examConnection}</p></section>
    <section><h4>Source</h4><p>${record.source.locator}</p></section>
  </div>`;
}

function renderLocationStudy(number) {
  const records = locationStudyRecords(number);
  if (!records.length) return renderEventContent(number);
  locationStudyState.locationNumber = String(number);
  if (!records.some(record => record.id === locationStudyState.expandedStudyId)) {
    locationStudyState.expandedStudyId = records[0].id;
  }
  const locationName = window.APWH_U1_LOCATION_STUDY.locationName(number);
  eventPanel.innerHTML = `<div class="location-study-view" data-location-study-view="${number}">
    <button type="button" class="rt-btn ghost" data-location-study-back="${number}">Back to location events</button>
    <h2 class="location-study-title" tabindex="-1">${locationName} · Unit 1</h2>
    <p>${records.length} study points · chronological order</p>
    <div class="location-study-list">${records.map(record => `
      <article class="location-study-item">
        <button type="button" data-study-event="${record.id}"
          aria-expanded="${record.id === locationStudyState.expandedStudyId}">
          <span>${record.dateLabel}</span><strong>${record.title}</strong><span>${record.summary}</span>
        </button>
        ${record.id === locationStudyState.expandedStudyId ? studyDetailHTML(record) : ''}
      </article>`).join('')}</div>
  </div>`;
  eventEmpty.style.display = 'none';
  eventPanel.classList.add('show');
  eventPanel.querySelector('.location-study-title')?.focus();
}
```

Use the project's existing HTML-escaping helper if present; otherwise introduce one and pass every record string through it before interpolation.

- [ ] **Step 4: Wire delegated events and focus restoration**

In the existing event-panel click delegation:

```js
const studyOpen = event.target.closest('[data-location-study-open]');
if (studyOpen) {
  renderLocationStudy(studyOpen.dataset.locationStudyOpen);
  return;
}
const studyItem = event.target.closest('[data-study-event]');
if (studyItem && locationStudyState.locationNumber) {
  locationStudyState.expandedStudyId = studyItem.dataset.studyEvent;
  renderLocationStudy(locationStudyState.locationNumber);
  return;
}
const studyBack = event.target.closest('[data-location-study-back]');
if (studyBack) {
  const number = studyBack.dataset.locationStudyBack;
  locationStudyState.locationNumber = null;
  locationStudyState.expandedStudyId = null;
  renderEventContent(number);
  eventPanel.querySelector(`[data-location-study-open="${CSS.escape(number)}"]`)?.focus();
}
```

Add responsive styles for `.location-study-view`, `.location-study-list`, `.location-study-item`, and `.location-study-detail`. Buttons have a 44-pixel minimum hit area; content stays one column and wraps without horizontal overflow.

- [ ] **Step 5: Run the browser verifier and verify GREEN**

Run `node scripts/verify-world-timeline.mjs`.

Expected: PASS with the new round-trip, expansion, content, and state checks.

- [ ] **Step 6: Commit the study view**

```bash
git add world-map.html scripts/verify-world-timeline.mjs
git commit -m "feat: add Unit 1 location study view"
```

### Task 5: Verify isolation, accessibility, and full regression coverage

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`
- Modify: `tests/apwh-u1-location-study.test.mjs`

- [ ] **Step 1: Add failing isolation and accessibility assertions**

Extend the browser verifier to check all five location entry counts, English copy, focus, non-Unit-1 exclusion, and existing learning modes:

```js
for (const [number, region, expected] of [
  ['1', 'asia', 3], ['2', 'asia', 2], ['3', 'mideast', 2],
  ['9', 'mideast', 2], ['73', 'africa', 3],
]) {
  await page.evaluate(({ number, region }) => window.__mapFilter.openHit(number, region), { number, region });
  const button = page.locator(`#eventPanel [data-location-study-open="${number}"]`);
  await expectVisible(button, `pin ${number} must expose its study action`);
  assert.equal(await button.innerText(), `View all ${expected} study points`);
}
await page.locator('[data-learning-view="chain"]').click();
await expectVisible(page.locator('#eventPanel .rt-stops-chain'), 'Chain must still open after location study use');
assert.equal(await page.locator('#eventPanel [data-location-study-view]').count(), 0);
await page.locator('[data-learning-view="quiz"]').click();
await expectVisible(page.locator('#eventPanel .quiz-panel'), 'Practice must still open after location study use');
```

Add a Node test that recursively examines every visible data string and rejects Chinese characters:

```js
test('keeps all trial study copy English-only', () => {
  const text = JSON.stringify(api.records);
  assert.doesNotMatch(text, /[\u3400-\u9fff]/);
});
```

- [ ] **Step 2: Run targeted suites and verify RED if any requirement is missing**

Run:

```bash
node --test tests/apwh-u1-location-study.test.mjs
node scripts/verify-world-timeline.mjs
```

Expected before final polish: any missing English-only, focus, location-count, or mode-isolation behavior fails with its named assertion.

- [ ] **Step 3: Clear only location-study state when another learning mode opens**

Add one focused reset helper:

```js
function clearLocationStudyState() {
  locationStudyState.locationNumber = null;
  locationStudyState.expandedStudyId = null;
}
```

Call `clearLocationStudyState()` at the start of `enterRouteMode`, `startQuiz`, `renderPicker`, and ordinary `renderEventContent`. This prevents stale study markup from surviving a mode transition without changing chain definitions, route definitions, quiz storage keys, Unit membership, or existing event prose.

- [ ] **Step 4: Run the complete verification set**

Run:

```bash
node --test tests/apwh-u1-location-study.test.mjs
node --test tests/apush-data.test.mjs
node scripts/validate-apush-data.mjs
node scripts/verify-world-timeline.mjs
node scripts/verify-apush-release.mjs
git diff --check
```

Expected: every command exits 0, all Node tests report 0 failures, browser verification reports success, and `git diff --check` emits no output.

- [ ] **Step 5: Perform manual browser QA**

Serve the worktree and inspect `world-map.html` at desktop and narrow widths. Verify Hangzhou and Timbuktu round trips, keyboard focus, long evidence wrapping, and the causal-chain and quiz entry points. Record the exact local URL and viewport sizes in the handoff.

- [ ] **Step 6: Commit the verified trial**

```bash
git add data/apwh-u1-location-study.js tests/apwh-u1-location-study.test.mjs world-map.html scripts/verify-world-timeline.mjs docs/data-sources/apwh-u1-location-study-source-ledger.md
git commit -m "test: verify Unit 1 location study trial"
```
