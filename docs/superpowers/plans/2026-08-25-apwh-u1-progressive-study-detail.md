# APWH Unit 1 Progressive Study Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace each expanded APWH Unit 1 study-point body with the approved English-first progressive detail, including compact AP context, always-visible exam-ready core content, collapsed supporting evidence, and defensible navigable connections.

**Architecture:** Keep `data/apwh-u1-location-study.js` as the immutable content authority, extend it with validated topics, themes, and reciprocal relationships, and add a `getById` lookup. Keep `world-map.html` as the canonical renderer and state owner; it renders native disclosures, tracks connection-return frames, and exposes narrow public bridge methods. `index.html` continues to mirror the canonical iframe HTML, forwarding disclosure and connection actions while preserving its own visible scroll and focus. Node tests prove the data graph, and the existing Playwright verifier proves both render contexts and regressions.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js ESM tests, native `<details>/<summary>`, and Playwright assertions in `scripts/verify-world-timeline.mjs`.

---

## File Map

- Modify `data/apwh-u1-location-study.js`: add AP topic/theme metadata, reciprocal relationships, connection notes, deep freezing, validation, and `getById`.
- Modify `tests/apwh-u1-location-study.test.mjs`: enforce the exact schema, topic/theme vocabulary, relationship integrity, English-only notes, and deep immutability.
- Modify `world-map.html`: replace the current flat detail renderer, style progressive sections, manage disclosure/connection state, and expose safe bridge methods.
- Modify `index.html`: mirror the new styles and proxy disclosure, connection, Back, scroll, and focus behavior to the iframe state owner.
- Modify `scripts/verify-world-timeline.mjs`: verify the progressive detail and exact round trips in standalone and homepage contexts at desktop and narrow widths.
- Modify `docs/superpowers/specs/2026-08-25-apwh-u1-progressive-study-detail-design.md`: change status from approved-for-review to implemented only after all checks pass.

## Fixed Content Decisions

Use official Unit 1 topic codes and the existing map category identifiers (`GOV`, `ECN`, `CDI`, `SIO`, `TEC`). Do not change the twelve titles or existing historical paragraphs.

| Study-point ID | `topicCodes` | `themeIds` |
|---|---|---|
| `apwh-u1-hangzhou-song-commercial-revolution` | `1.1`, `1.7` | `ECN`, `GOV` |
| `apwh-u1-hangzhou-grand-canal-urban-market` | `1.1`, `1.7` | `ECN`, `GOV`, `TEC` |
| `apwh-u1-hangzhou-paper-money-maritime-tools` | `1.1`, `1.7` | `ECN`, `TEC` |
| `apwh-u1-angkor-khmer-hydraulic-state` | `1.3`, `1.7` | `GOV`, `ECN`, `TEC` |
| `apwh-u1-angkor-hindu-buddhist-legitimation` | `1.3`, `1.7` | `GOV`, `CDI` |
| `apwh-u1-delhi-sultanate-state-building` | `1.3`, `1.7` | `GOV`, `CDI` |
| `apwh-u1-delhi-bhakti-sufi-devotion` | `1.3`, `1.7` | `CDI`, `SIO` |
| `apwh-u1-baghdad-abbasid-knowledge-hub` | `1.2`, `1.7` | `CDI`, `TEC` |
| `apwh-u1-baghdad-merchant-ulema-network` | `1.2`, `1.7` | `ECN`, `CDI` |
| `apwh-u1-timbuktu-mali-gold-salt-tax` | `1.5`, `1.7` | `ECN`, `GOV` |
| `apwh-u1-timbuktu-islamic-learning-griots` | `1.5`, `1.7` | `CDI`, `SIO` |
| `apwh-u1-timbuktu-mansa-musa-pilgrimage` | `1.5`, `1.7` | `GOV`, `ECN`, `CDI` |

Ship only the following direct causal edges. The reverse record must list the source under `causeStudyPointIds`.

| Cause | Effect | Shared mechanism note keyed by the other record ID |
|---|---|---|
| `apwh-u1-hangzhou-grand-canal-urban-market` | `apwh-u1-hangzhou-song-commercial-revolution` | `Canal transport integrated productive regions with Hangzhou, supporting the urban demand and market exchange associated with Song commercialization.` |
| `apwh-u1-hangzhou-song-commercial-revolution` | `apwh-u1-hangzhou-paper-money-maritime-tools` | `Expanding markets increased demand for scalable currency and safer long-distance navigation.` |
| `apwh-u1-angkor-khmer-hydraulic-state` | `apwh-u1-angkor-hindu-buddhist-legitimation` | `Agricultural surplus and organized labor helped Khmer rulers finance monumental religious patronage.` |
| `apwh-u1-timbuktu-mali-gold-salt-tax` | `apwh-u1-timbuktu-mansa-musa-pilgrimage` | `Revenue from Mali's control of trade helped finance Mansa Musa's pilgrimage and public display of wealth.` |
| `apwh-u1-timbuktu-mansa-musa-pilgrimage` | `apwh-u1-timbuktu-islamic-learning-griots` | `Mansa Musa's post-pilgrimage patronage strengthened mosques, schools, and scholarly connections in Mali.` |

Ship these non-causal reciprocal comparisons:

| Pair | Shared mechanism note keyed by the other record ID |
|---|---|
| Delhi state building ↔ Delhi Bhakti/Sufi devotion | `Both developments show how Islamic institutions interacted with a predominantly Hindu South Asian society without erasing religious distinctions.` |
| Baghdad knowledge hub ↔ Baghdad merchant/ulama network | `Scholarship, religious learning, and trusted urban networks reinforced Baghdad's wider role in the Islamic world.` |
| Baghdad merchant/ulama network ↔ Delhi Bhakti/Sufi devotion | `Mobile Muslim teachers and shared religious networks help compare the spread and local adaptation of Islam across regions.` |
| Baghdad merchant/ulama network ↔ Timbuktu Islamic learning/griot memory | `Commercial and scholarly networks carried Islamic institutions while local societies retained distinct cultural practices.` |

Do not infer additional cause/effect links at render time. A record may legitimately have an empty category.

### Task 1: Extend and validate the immutable study-data graph

**Files:**
- Modify: `tests/apwh-u1-location-study.test.mjs`
- Modify: `data/apwh-u1-location-study.js`

- [ ] **Step 1: Write failing schema and lookup tests**

Extend `recordKeys` with the six approved fields, then add assertions for `getById` and the fixed vocabularies:

```js
const validTopicCodes = new Set(['1.1', '1.2', '1.3', '1.5', '1.7']);
const validThemeIds = new Set(['GOV', 'ECN', 'CDI', 'SIO', 'TEC']);

test('publishes AP context and stable id lookup', () => {
  assert.equal(typeof api.getById, 'function');
  for (const record of api.records) {
    assert.equal(api.getById(record.id), record);
    assert.ok(record.topicCodes.length >= 1);
    assert.ok(record.topicCodes.every(code => validTopicCodes.has(code)));
    assert.ok(record.themeIds.length >= 1);
    assert.ok(record.themeIds.every(id => validThemeIds.has(id)));
    for (const key of ['causeStudyPointIds', 'effectStudyPointIds', 'relatedStudyPointIds']) {
      assert.ok(Array.isArray(record[key]), `${record.id} ${key}`);
    }
    assert.equal(typeof record.connectionNotes, 'object');
  }
  assert.equal(api.getById('not-a-study-point'), null);
});
```

- [ ] **Step 2: Write failing relationship-integrity tests**

Add one test that iterates every record and checks: no self-link; no duplicates; every target resolves; a target appears in only one category; `cause(A,B)` is reciprocated by `effect(B,A)`; `effect(A,B)` is reciprocated by `cause(B,A)`; `related(A,B)` is reciprocated by `related(B,A)`; every linked target has a nonempty English mechanism note.

```js
const categoryKeys = ['causeStudyPointIds', 'effectStudyPointIds', 'relatedStudyPointIds'];
for (const record of api.records) {
  const categorizedTargets = categoryKeys.flatMap(key => record[key]);
  assert.equal(new Set(categorizedTargets).size, categorizedTargets.length, `${record.id} categories`);
  for (const targetId of categorizedTargets) {
    const target = api.getById(targetId);
    assert.ok(target, `${record.id} unresolved ${targetId}`);
    assert.notEqual(targetId, record.id);
    assert.match(record.connectionNotes[targetId], /[A-Za-z]/);
    assert.doesNotMatch(record.connectionNotes[targetId], /[\u3400-\u9fff]/);
  }
}
```

Assert the exact five causal edges and four related pairs from **Fixed Content Decisions**, not merely their counts.

- [ ] **Step 3: Write failing deep-immutability tests**

Require every new array and `connectionNotes` object to be frozen. Also verify duplicate reads cannot mutate canonical relationship values.

- [ ] **Step 4: Run the Node test and verify RED**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u1-location-study.test.mjs
```

Expected: FAIL because the new keys and `getById` are absent.

- [ ] **Step 5: Implement the schema and exact graph**

Update `freezeRecord` to freeze every new collection:

```js
function freezeRecord(record) {
  return Object.freeze({
    ...record,
    topicCodes: Object.freeze([...record.topicCodes]),
    themeIds: Object.freeze([...record.themeIds]),
    causeStudyPointIds: Object.freeze([...record.causeStudyPointIds]),
    effectStudyPointIds: Object.freeze([...record.effectStudyPointIds]),
    relatedStudyPointIds: Object.freeze([...record.relatedStudyPointIds]),
    connectionNotes: Object.freeze({ ...record.connectionNotes }),
    keyPeople: Object.freeze(record.keyPeople.map(person => Object.freeze({ ...person }))),
    keyTerms: Object.freeze(record.keyTerms.map(item => Object.freeze({ ...item }))),
    evidence: Object.freeze([...record.evidence]),
    source: Object.freeze({ ...record.source }),
  });
}
```

Add the topic/theme values and exact relationships listed above to all twelve records. Build `byId` after `STUDY_EVENTS`, and publish:

```js
getById(id) { return byId.get(String(id)) || null; },
```

Do not alter existing `summary`, `significance`, `examConnection`, `keyPeople`, `keyTerms`, `evidence`, or `source` prose in this task.

- [ ] **Step 6: Add fail-fast module validation**

Before publishing the API, run a validator over `STUDY_EVENTS` using the same rules as the test. Throw an `Error` naming the record and violated rule for unresolved, duplicate, self, cross-category, nonreciprocal, missing-note, or invalid-topic/theme data. This ensures the plain browser build cannot silently ship an invalid graph.

- [ ] **Step 7: Run the Node test and verify GREEN**

Run the command from Step 4.

Expected: all `apwh-u1-location-study` tests pass.

- [ ] **Step 8: Commit the data graph**

```bash
git add data/apwh-u1-location-study.js tests/apwh-u1-location-study.test.mjs
git commit -m "feat: connect Unit 1 study points"
```

### Task 2: Render the approved progressive detail in the canonical map

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`
- Modify: `world-map.html`

- [ ] **Step 1: Replace the old browser expectations with failing hierarchy tests**

In `verifyTimeline`, keep the existing location list and exact-origin tests, but replace the expanded-body heading loop. For the selected Hangzhou point assert:

```js
for (const heading of ['Region', 'Summary', 'Why It Matters', 'Use It on the Exam']) {
  await expectVisible(hangzhouStudyView.getByRole('heading', { name: heading }), `${heading} is core content`);
}
assert.equal(await hangzhouStudyView.locator('details[data-study-disclosure]').count(), 5);
assert.equal(await hangzhouStudyView.locator('details[data-study-disclosure][open]').count(), 0);
assert.deepEqual(
  await trimmedTexts(hangzhouStudyView.locator('summary[data-study-disclosure-toggle]')),
  ['Key Terms (2)', 'Evidence (2)', 'Connections (2)', 'People (1)', 'Source (1)'],
);
```

Also assert the header exposes `Topic 1.1 · Topic 1.7` and the correct theme chips, and that the derived Region copy contains `Hangzhou` plus the existing `Asia` pin region. Counts must come from record content; do not hard-code counts in markup.

- [ ] **Step 2: Run the browser verifier and verify RED**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: FAIL on the missing `Region`, `Why It Matters`, native disclosure, topic, or theme selectors.

- [ ] **Step 3: Replace `studyDetailHTML(record)` with small render helpers**

Add helpers with single responsibilities:

```js
function studyRegionLabel(record) {
  const name = window.APWH_U1_LOCATION_STUDY.locationName(record.locationNumber);
  const region = regionNames[pinRegion(record.locationNumber)];
  if (!name || !region) throw new Error(`Missing location metadata for ${record.id}`);
  return `${name} · ${region}`;
}

function studyDisclosureHTML(record, key, label, bodyHTML, count) {
  if (!count) return '';
  const open = locationStudyState.openDisclosures.has(`${record.id}:${key}`);
  return `<details class="location-study-disclosure" data-study-disclosure="${escapeTimelineText(key)}"${open ? ' open' : ''}>`
    + `<summary data-study-disclosure-toggle="${escapeTimelineText(key)}"><span>${escapeTimelineText(label)} (${count})</span><span class="location-study-indicator" aria-hidden="true"></span></summary>`
    + `<div class="location-study-disclosure-body">${bodyHTML}</div></details>`;
}
```

Keep `regionNames` in one shared constant near the renderer so `studyRegionLabel` and the location context line use the same existing `pinRegion` result.

- [ ] **Step 4: Render the approved information hierarchy**

For the expanded record, render:

1. eyebrow with `Unit 1`, topic codes, and theme chips;
2. title and date;
3. always-visible `Region`, `Summary`, `Why It Matters`, and a blue-accented `Use It on the Exam` block;
4. native disclosures in the exact order Key Terms, Evidence, Connections, People, Source;
5. omit any supporting disclosure whose count is zero.

The Source count is `1` when `source.id` and `source.locator` are present. The People count is `record.keyPeople.length`. Connections count is the unique total across the three relationship arrays.

Inside Connections, render only nonempty groups in this order and with these singular labels: `Cause`, `Effect`, `Related Event`. Each connection is a `<button type="button" data-study-connection="TARGET_ID" data-study-connection-from="SOURCE_ID">` containing the resolved target title and the source record's `connectionNotes[TARGET_ID]`. Never derive a relationship from chronology or matching themes.

- [ ] **Step 5: Add canonical progressive-detail styles**

Replace the old flat `.location-study-detail section` rules near `world-map.html:385` with styles matching the approved mock:

- warm paper surface, terracotta title/accent, blue exam block;
- compact bordered Region card;
- thin disclosure dividers rather than nested heavy boxes;
- native marker hidden only after a visible CSS plus/minus indicator is supplied;
- summary and connection button `min-height: 44px`;
- `:focus-visible` outline of at least 2px;
- term grid uses two columns when space allows and one column under `560px`;
- all text wraps and every grid child has `min-width: 0`.

- [ ] **Step 6: Track disclosure state without moving focus**

Extend `locationStudyState`:

```js
const locationStudyState = {
  locationNumber: null,
  expandedStudyId: null,
  returnContext: null,
  openDisclosures: new Set(),
  connectionStack: [],
  pendingRestore: null,
};
```

Clear these additions in `clearLocationStudyState`. Add `setLocationStudyDisclosure(studyId, key, open)` that validates the active record and one of `terms`, `evidence`, `connections`, `people`, `source`, updates the Set, synchronizes the canonical `<details>.open` property, and returns `false` without mutation for invalid input. Listen for `toggle` on `eventPanel` in capture phase so native standalone interaction updates canonical state without rerendering or focus movement.

- [ ] **Step 7: Run the browser verifier and verify the hierarchy is GREEN**

Run the command from Step 2.

Expected: the updated standalone hierarchy assertions pass; later connection assertions may still be absent.

- [ ] **Step 8: Commit the canonical progressive renderer**

```bash
git add world-map.html scripts/verify-world-timeline.mjs
git commit -m "feat: render progressive Unit 1 study details"
```

### Task 3: Add exact connection navigation and restoration

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`
- Modify: `world-map.html`

- [ ] **Step 1: Add failing standalone connection round-trip tests**

Use Angkor's causal pair because it is short and historically direct:

1. open Angkor;
2. select `apwh-u1-angkor-khmer-hydraulic-state`;
3. open Key Terms and Connections;
4. set `eventZone.scrollTop` to a nonzero value and record it;
5. focus/click the Hindu/Buddhist effect button;
6. assert target title, heading focus, and a connection-specific Back button;
7. activate Back;
8. assert the hydraulic record, both open disclosures, prior scroll (±1px), and focus on the invoking connection button are restored.

Add a state-snapshot assertion around:

```js
window.__mapFilter.openLocationStudyConnection('not-a-study-point')
```

Expected result: `false`, with identical detail ID, disclosure state, stack depth, and panel HTML.

- [ ] **Step 2: Run the verifier and verify RED**

Expected: FAIL because connection bridge methods and navigation controls do not exist.

- [ ] **Step 3: Implement a validated connection-frame stack**

Add helpers:

```js
function activeStudyRecord() {
  return window.APWH_U1_LOCATION_STUDY.getById(locationStudyState.expandedStudyId);
}

function isDirectStudyConnection(source, targetId) {
  return ['causeStudyPointIds', 'effectStudyPointIds', 'relatedStudyPointIds']
    .some(key => source[key].includes(targetId));
}
```

`openLocationStudyConnection(targetId, { scrollTop = eventZone.scrollTop, focusHeading = false } = {})` must validate ordinary Unit 1 context, active source, resolved target, and a declared direct edge before any mutation. Push a frozen plain frame containing source location, source study ID, a copied disclosure-key array, numeric scroll position, and invoker target ID. Then clear current disclosures, switch location and expanded ID to the target, render, and optionally focus its title.

Render a `Back to [source title]` button with `data-study-connection-back` whenever the stack is nonempty. `backLocationStudyConnection({ focusInvoker = false })` pops one frame, restores its location/study/disclosures, rerenders, restores the canonical scroll synchronously after layout, and focuses `[data-study-connection="INVOKER_TARGET_ID"]` when requested.

Keep the existing `Back to location events` behavior when the connection stack is empty. If the user chooses that outer Back from a connected target, clear the full connection stack before returning to the original location/timeline context.

- [ ] **Step 4: Wire standalone delegation and safe public methods**

Handle `[data-study-connection]` and `[data-study-connection-back]` before the generic study-row handler. Export:

```js
openLocationStudyConnection: targetId => openLocationStudyConnection(targetId),
backLocationStudyConnection: () => backLocationStudyConnection(),
setLocationStudyDisclosure: (studyId, key, open) => setLocationStudyDisclosure(studyId, key, open),
getLocationStudyUiState: () => Object.freeze({
  studyId: locationStudyState.expandedStudyId,
  openDisclosures: Object.freeze([...locationStudyState.openDisclosures]),
  connectionDepth: locationStudyState.connectionStack.length,
  pendingRestore: locationStudyState.pendingRestore && Object.freeze({ ...locationStudyState.pendingRestore }),
}),
```

The exported snapshot must not expose mutable internal Sets, arrays, or frame objects.

- [ ] **Step 5: Clear stale navigation on every existing study-state reset path**

Use only `clearLocationStudyState()` as the clearing authority. Confirm it is reached when Unit, learning view, map mode, location, timeline event, route, query/filter result, quiz/practice state, or ordinary event content replaces the study view. Add browser assertions for at least Unit change, learning-view change, route entry, and a different location; the existing broader regression tests cover the rest.

- [ ] **Step 6: Run the verifier and verify GREEN**

Expected: standalone connection, invalid-input, focus, disclosure, scroll, and previous location/timeline round-trip assertions all pass.

- [ ] **Step 7: Commit connection navigation**

```bash
git add world-map.html scripts/verify-world-timeline.mjs
git commit -m "feat: navigate Unit 1 study connections"
```

### Task 4: Mirror progressive interactions on the homepage

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`
- Modify: `index.html`

- [ ] **Step 1: Add failing homepage parity tests**

Extend the existing homepage Hangzhou fixture to assert the same core labels, topic/theme chips, disclosure order/counts, and initial collapsed state as the iframe. Then reproduce the Angkor round trip in `#home-events`:

- open Key Terms and Connections in the visible clone;
- set a nonzero `homeEvents.scrollTop`;
- follow the effect connection;
- verify target title and cloned heading focus;
- Back and verify the exact open disclosures, scroll position, and cloned invoking-button focus.

Add invalid bridge calls for bad disclosure keys and unlinked-but-real study IDs; assert `false` and unchanged visible/canonical state.

- [ ] **Step 2: Run the verifier and verify RED**

Expected: FAIL because cloned native toggles and connection buttons are not yet forwarded to the iframe state owner.

- [ ] **Step 3: Mirror the progressive CSS**

Update `.home-events .location-study-*` rules near `index.html:460` to match the canonical hierarchy, disclosure indicators, connection buttons, 44px targets, focus treatment, two-column term grid, and narrow one-column layout. Keep parent-page color variables (`--card`, `--terracotta`, `--ink`) where they are the homepage equivalents of iframe tokens.

- [ ] **Step 4: Preserve homepage disclosure state without replacing the focused DOM**

Add a capture-phase `toggle` listener to `homeEvents`. For a visible `details[data-study-disclosure]`, call `setLocationStudyDisclosure(activeStudyId, key, details.open)`. Do not call `syncHomeEvents()` for this action: the visible native disclosure has already changed, and avoiding replacement preserves focus. The bridge updates canonical state for the next mirror sync.

- [ ] **Step 5: Proxy connection navigation with visible scroll context**

In homepage click delegation, handle a connection button before `[data-study-event]`:

```js
if (connection && win.__mapFilter.openLocationStudyConnection) {
  if (win.__mapFilter.openLocationStudyConnection(
    connection.dataset.studyConnection,
    { scrollTop: homeEvents.scrollTop }
  )) {
    syncHomeEvents();
    homeEvents.querySelector('.location-study-title')?.focus();
  }
  return;
}
```

Adjust the exported canonical wrapper to pass the optional safe `scrollTop` number while ignoring other caller-controlled fields.

For cloned connection Back, call the canonical back method, sync, read `getLocationStudyUiState().pendingRestore`, set `homeEvents.scrollTop`, focus the matching cloned connection button, and acknowledge/clear the pending restore with a dedicated `completeLocationStudyRestore()` method. The standalone handler must use and clear the same pending restore so stale instructions cannot leak between contexts.

- [ ] **Step 6: Stop unconditional scroll reset during study restoration**

In `syncHomeEvents()`, retain the current `scrollTop = 0` behavior for normal panel replacements and route navigation. When canonical UI state contains a pending study restore, apply its saved scroll after `innerHTML` cloning and skip the zero reset. This exception must be limited to the progressive-detail Back path.

- [ ] **Step 7: Run the verifier and verify GREEN**

Expected: homepage parity, native disclosure, connection, focus, and scroll tests pass at desktop width.

- [ ] **Step 8: Commit homepage parity**

```bash
git add index.html scripts/verify-world-timeline.mjs
git commit -m "feat: mirror Unit 1 progressive study details"
```

### Task 5: Complete responsive, accessibility, and regression verification

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`
- Modify: `world-map.html`
- Modify: `index.html`

- [ ] **Step 1: Add narrow-layout and interaction-target assertions**

At `390×844` for standalone and `700×900` for homepage, assert:

- no page, panel, detail, term grid, or connection-button horizontal overflow;
- term cards render in one column;
- every disclosure summary and connection button is at least 44px high;
- long titles and mechanism notes wrap normally;
- each visible focus ring has non-`none` outline and at least 2px width;
- the indicator changes from plus to minus when opened and remains visible with computed `content` or an equivalent text-independent DOM marker;
- English-only copy across the full visible study view.

Use keyboard `Enter` for one disclosure and `Space` for one connection control, and assert focus remains on a disclosure summary after toggling and moves/restores correctly for connection navigation.

- [ ] **Step 2: Run the verifier and verify RED if any layout rule is missing**

Run the full browser command. Treat overflow, target-size, focus, or indicator failures as RED; do not relax assertions to match the implementation.

- [ ] **Step 3: Make the smallest responsive/accessibility corrections**

Adjust only the progressive-detail selectors in `world-map.html` and `index.html`. Do not change global event cards, map sizing, route cards, or existing compact top tabs.

- [ ] **Step 4: Run focused and combined Node tests**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u1-location-study.test.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u1-location-study.test.mjs tests/apush-data.test.mjs
```

Expected: all tests pass; the current combined baseline is 45 tests before the new assertions are added.

- [ ] **Step 5: Run the full browser verifier**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: exit code 0 with standalone and homepage verification complete.

- [ ] **Step 6: Perform a placeholder and language scan**

```bash
rg -n "TODO|TBD|placeholder|lorem|原因|结果|相关事件|概述|历史意义|考试连接|关键术语" data/apwh-u1-location-study.js world-map.html index.html tests/apwh-u1-location-study.test.mjs scripts/verify-world-timeline.mjs
```

Expected: no new progressive-detail learner copy in Chinese and no placeholders. Existing unrelated Chinese interface strings may appear; inspect every match and confirm it is outside the changed study-detail selectors.

- [ ] **Step 7: Review the diff for scope and type consistency**

```bash
git diff --check
git diff -- data/apwh-u1-location-study.js tests/apwh-u1-location-study.test.mjs world-map.html index.html scripts/verify-world-timeline.mjs docs/superpowers/specs/2026-08-25-apwh-u1-progressive-study-detail-design.md
```

Confirm:

- relationship IDs are strings everywhere;
- disclosure keys are the same five lowercase identifiers in renderer, state, bridge, and tests;
- scroll values are finite nonnegative numbers before storing;
- `getLocationStudyUiState()` returns defensive frozen copies;
- no changes reach Units 2–9, APUSH, route mode, chain mode, or practice content;
- both standalone and homepage selectors use the same `data-*` contract.

- [ ] **Step 8: Mark the approved spec implemented**

Change its status line to:

```md
Status: Implemented and verified
```

Do this only after Steps 4–7 pass.

- [ ] **Step 9: Commit final verification and documentation**

```bash
git add world-map.html index.html scripts/verify-world-timeline.mjs docs/superpowers/specs/2026-08-25-apwh-u1-progressive-study-detail-design.md
git commit -m "test: verify progressive Unit 1 study details"
```

## Final Review Gate

- [ ] Re-run both Node commands and the full Playwright verifier from Task 5.
- [ ] Run `git status --short --branch`; confirm only intentional files are changed and the worktree is clean after the final commit.
- [ ] Compare Angkor in `world-map.html` and `index.html` side by side: core content, counts, relationship labels, open state, scroll restoration, and focus target must agree.
- [ ] Confirm the final rendered detail contains no bilingual APUSH labels and no extra tab strip.
- [ ] Confirm every visible connection mechanism matches the fixed content decisions in this plan and no renderer-created edges exist.
