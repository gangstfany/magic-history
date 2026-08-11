# APUSH U1–U9 Timeline Dock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing lightweight APUSH map Timeline Dock from Period 1 to validated, dynamically switchable Periods 1–9 on one shared page.

**Architecture:** Add a registry that maps each APUSH period to an independent dataset and manifest, then generalize the existing validator and browser loader around the active registry entry. The map, summary card, and Dock continue to share one selection state; events without honest geography render in the Dock and card without fabricated markers. Period content is delivered in reviewable batches before the UI loader is switched over.

**Tech Stack:** Dependency-free HTML/CSS/JavaScript, JSON course data, Node.js `node:test`, Playwright-based browser verifier, official College Board AP U.S. History CED.

---

## Repository and Source Prerequisites

Work from `temporary-apush-period1-c-preview` in an isolated worktree created with `superpowers:using-git-worktrees`. Before implementation:

```bash
git fetch origin
git status --short
git rev-parse --abbrev-ref HEAD
```

The worktree must be clean and based on the latest remote branch. Do not modify or merge `feature/history-timeline-module-prototype`.

Use the official College Board AP U.S. History CED as the content baseline:

```text
https://apcentral.collegeboard.org/media/pdf/ap-us-history-course-and-exam-description.pdf
```

Every new content source must appear both in its dataset `sources` array and in the matching `docs/data-sources/apush-period-N-source-ledger.md`.

## File Structure

- Create: `data/apush-period-registry.json` — canonical P1–P9 labels, date bands, and data/manifest URLs.
- Create: `data/apush-period-2.json` through `data/apush-period-9.json` — self-contained themes, sources, sites, and events for one period.
- Create: `data/apush-period-2-manifest.json` through `data/apush-period-9-manifest.json` — locked event order per period.
- Create: `docs/data-sources/apush-period-2-source-ledger.md` through `docs/data-sources/apush-period-9-source-ledger.md` — reproducible source locators.
- Modify: `data/apush-period-1.json` — add the required concise Timeline title without changing approved event order or meaning.
- Modify: `data/apush-period-1-manifest.json` — retain the approved IDs; add no new P1 event.
- Modify: `scripts/validate-apush-data.mjs` — validate a registry entry and any period dataset, not only P1.
- Modify: `tests/apush-data.test.mjs` — all-period registry, schema, manifest, content, coordinate, and regression tests.
- Modify: `apush-map.html` — P1–P9 selector, race-safe loader, dynamic copy, no-coordinate event behavior.
- Modify: `scripts/verify-apush-browser.mjs` — all-period interaction and responsive matrix.
- Modify: `scripts/verify-apush-release.mjs` — run general data and browser verification with all nine periods.

### Task 1: Define the All-Period Registry and General Data Contract

**Files:**
- Create: `data/apush-period-registry.json`
- Modify: `scripts/validate-apush-data.mjs`
- Modify: `tests/apush-data.test.mjs`
- Modify: `data/apush-period-1.json`

- [ ] **Step 1: Write failing registry and generalized-validator tests**

Add a registry fixture loader and require these exact entries:

```js
const EXPECTED_PERIODS = Object.freeze([
  { id: 'p1', number: 1, dates: '1491–1607', startYear: 1491, endYear: 1607 },
  { id: 'p2', number: 2, dates: '1607–1754', startYear: 1607, endYear: 1754 },
  { id: 'p3', number: 3, dates: '1754–1800', startYear: 1754, endYear: 1800 },
  { id: 'p4', number: 4, dates: '1800–1848', startYear: 1800, endYear: 1848 },
  { id: 'p5', number: 5, dates: '1844–1877', startYear: 1844, endYear: 1877 },
  { id: 'p6', number: 6, dates: '1865–1898', startYear: 1865, endYear: 1898 },
  { id: 'p7', number: 7, dates: '1890–1945', startYear: 1890, endYear: 1945 },
  { id: 'p8', number: 8, dates: '1945–1980', startYear: 1945, endYear: 1980 },
  { id: 'p9', number: 9, dates: '1980–Present', startYear: 1980, endYear: 2026 },
]);

test('registry exposes the exact nine APUSH periods', async () => {
  const registry = await readJson('../data/apush-period-registry.json');
  assert.deepEqual(
    registry.periods.map(({ id, number, dates, startYear, endYear }) => ({ id, number, dates, startYear, endYear })),
    EXPECTED_PERIODS,
  );
  assert.equal(new Set(registry.periods.map((period) => period.dataPath)).size, 9);
  assert.equal(new Set(registry.periods.map((period) => period.manifestPath)).size, 9);
});
```

Add tests that call `validateDataset(data, manifest, ledger, registryEntry)` for P1 and prove the validator rejects: wrong manifest period ID, wrong period metadata, 6 or 11 events, missing `timelineTitleZh`, missing summary, missing theme/source arrays, and partial coordinates. Preserve the existing literal P1 ID regression.

- [ ] **Step 2: Run the data tests and verify the new contract fails**

```bash
node --test tests/apush-data.test.mjs
```

Expected: FAIL because the registry does not exist and `validateDataset` does not accept a registry entry.

- [ ] **Step 3: Create the canonical registry**

Create `data/apush-period-registry.json` with schema version 1 and nine entries. Each entry must use this complete shape:

```json
{
  "id": "p2",
  "number": 2,
  "labelEn": "Period 2",
  "labelZh": "时期二",
  "dates": "1607–1754",
  "startYear": 1607,
  "endYear": 1754,
  "dataPath": "data/apush-period-2.json",
  "manifestPath": "data/apush-period-2-manifest.json"
}
```

Use `1980–Present` as P9 display copy and `2026` only as the current validation ceiling. Do not rewrite College Board's overlapping P4–P8 boundaries.

- [ ] **Step 4: Generalize `validateDataset`**

Change the signature to:

```js
export function validateDataset(data, manifest, ledgerText, expectedPeriod) {
```

Replace P1 literals with `expectedPeriod.id`, `number`, `startYear`, and `endYear`. Require 7–10 events, exact manifest order, official theme IDs, globally nonempty IDs, `titleEn`, `titleZh`, `timelineTitleZh`, `summary`, `significance`, `examConnection`, `keywords`, `themeIds`, `sourceIds`, `causeIds`, `effectIds`, `relatedIds`, and `siteIds`. Permit `primarySiteId: null` only when `siteIds` is empty. When `siteIds` is nonempty, require a referenced primary site.

Keep `APPROVED_EVENT_IDS` as `APPROVED_PERIOD_1_EVENT_IDS` and apply that literal comparison only when `expectedPeriod.id === 'p1'`.

- [ ] **Step 5: Bring P1 onto the shared schema without changing its nine anchors**

Add `timelineTitleZh` to all nine P1 events using these exact values in manifest order:

```js
[
  '北美原住民社会', '欧洲探索', '哥伦布抵达', '哥伦布大交换',
  '征服墨西加', '征服印加', '劳役与种姓', '文化互动', '西班牙边疆',
]
```

Do not alter P1 event IDs, dates, coordinates, relationships, summaries, or source IDs.

- [ ] **Step 6: Run tests and commit**

```bash
node --test tests/apush-data.test.mjs
git add data/apush-period-registry.json data/apush-period-1.json scripts/validate-apush-data.mjs tests/apush-data.test.mjs
git commit -m "refactor: define shared APUSH period data contract"
```

Expected: all P1 and registry tests PASS; all pre-existing P1 tests remain green.

### Task 2: Add Periods 2–4 Content

**Files:**
- Create: `data/apush-period-2.json`
- Create: `data/apush-period-2-manifest.json`
- Create: `data/apush-period-3.json`
- Create: `data/apush-period-3-manifest.json`
- Create: `data/apush-period-4.json`
- Create: `data/apush-period-4-manifest.json`
- Create: `docs/data-sources/apush-period-2-source-ledger.md`
- Create: `docs/data-sources/apush-period-3-source-ledger.md`
- Create: `docs/data-sources/apush-period-4-source-ledger.md`
- Modify: `tests/apush-data.test.mjs`

- [ ] **Step 1: Add failing manifest-order tests for P2–P4**

Lock these anchors and orders:

```js
const EXPECTED_EVENT_IDS = {
  p2: [
    'jamestown-1607', 'virginia-tobacco-headright-1618', 'house-of-burgesses-1619',
    'plymouth-mayflower-1620', 'puritan-great-migration-1630', 'atlantic-slavery-expands-1619-1754',
    'bacon-rebellion-1676', 'imperial-mercantilism-salutary-neglect-1651-1754', 'first-great-awakening-1730s',
  ],
  p3: [
    'french-indian-war-1754-1763', 'stamp-act-resistance-1765', 'boston-tea-intolerable-1773-1774',
    'declaration-independence-1776', 'saratoga-french-alliance-1777-1778', 'yorktown-1781',
    'articles-shays-1781-1787', 'constitution-ratification-1787-1788', 'new-republic-parties-1789-1800',
  ],
  p4: [
    'louisiana-purchase-1803', 'market-revolution-1815-1848', 'missouri-compromise-1820',
    'second-great-awakening-reform-1820-1848', 'jacksonian-democracy-1828', 'indian-removal-1830-1838',
    'nullification-crisis-1832-1833', 'texas-mexican-war-1845-1848', 'seneca-falls-1848',
  ],
};
```

For each period, assert `validateDataset(...)` returns `[]`, manifest order matches the literal array, every event has 1–3 themes and at least one source, and at least one event intentionally has no site.

- [ ] **Step 2: Run tests and verify missing-file failures**

```bash
node --test tests/apush-data.test.mjs
```

Expected: FAIL with missing P2, P3, and P4 datasets/manifests.

- [ ] **Step 3: Author P2–P4 datasets and ledgers**

Use the exact IDs and chronological display order above. Each event must have a concise Chinese Timeline title of at most 10 Chinese characters when practical and a one-sentence Chinese summary of 35–90 Chinese characters. Use `primarySiteId: null` and `siteIds: []` for broad processes such as mercantilism, the Market Revolution, or party formation unless one honest geographic anchor is central.

Every ledger must list:

```markdown
| Event ID | CED unit topic(s) | Dataset source ID | Locator | Geography rationale |
```

Use the CED unit guide for every row. Add authoritative supplemental sources only when the CED does not provide a sufficiently precise date or geographic rationale; record the exact page or stable URL.

- [ ] **Step 4: Validate cross-event relationships**

Require every `causeIds`, `effectIds`, and `relatedIds` target to exist in the same period dataset. Use causal links only where the content summary explicitly explains the link. Do not create cross-period IDs in this phase.

- [ ] **Step 5: Run tests and commit**

```bash
node --test tests/apush-data.test.mjs
node scripts/validate-apush-data.mjs
git add data/apush-period-{2,3,4}.json data/apush-period-{2,3,4}-manifest.json docs/data-sources/apush-period-{2,3,4}-source-ledger.md tests/apush-data.test.mjs
git commit -m "feat: add APUSH periods 2 through 4 timeline data"
```

Expected: P1–P4 validation PASS with 7–10 ordered anchors per period.

### Task 3: Add Periods 5–7 Content

**Files:**
- Create: `data/apush-period-5.json`
- Create: `data/apush-period-5-manifest.json`
- Create: `data/apush-period-6.json`
- Create: `data/apush-period-6-manifest.json`
- Create: `data/apush-period-7.json`
- Create: `data/apush-period-7-manifest.json`
- Create: `docs/data-sources/apush-period-5-source-ledger.md`
- Create: `docs/data-sources/apush-period-6-source-ledger.md`
- Create: `docs/data-sources/apush-period-7-source-ledger.md`
- Modify: `tests/apush-data.test.mjs`

- [ ] **Step 1: Add failing literal-order tests**

Use these exact anchors:

```js
const EXPECTED_EVENT_IDS_5_TO_7 = {
  p5: [
    'manifest-destiny-mexican-war-1844-1848', 'compromise-1850', 'kansas-nebraska-bleeding-kansas-1854-1856',
    'dred-scott-1857', 'election-secession-1860-1861', 'emancipation-gettysburg-1863',
    'appomattox-1865', 'reconstruction-amendments-1865-1870', 'compromise-1877',
  ],
  p6: [
    'transcontinental-railroad-western-settlement-1869-1890', 'industrial-capitalism-1870-1898',
    'labor-conflict-1877-1894', 'new-immigration-urbanization-1880-1898',
    'dawes-ghost-dance-1887-1890', 'populist-movement-1892-1896',
    'jim-crow-plessy-1890-1896', 'spanish-american-war-1898', 'gilded-age-reform-1870-1898',
  ],
  p7: [
    'progressive-reform-1901-1917', 'great-migration-1910-1945', 'world-war-one-us-1917-1918',
    'red-scare-immigration-restriction-1919-1924', 'harlem-mass-culture-1920s', 'crash-great-depression-1929',
    'new-deal-1933-1939', 'japanese-incarceration-1942', 'world-war-two-homefront-victory-1941-1945',
  ],
};
```

Assert valid schemas, exact order, 7–10 events, at least one Dock-only event per period, and date containment including valid overlaps with adjacent periods.

- [ ] **Step 2: Run tests and confirm red state**

```bash
node --test tests/apush-data.test.mjs
```

Expected: FAIL because P5–P7 files do not exist.

- [ ] **Step 3: Author P5–P7 data and source ledgers**

Encode the anchors above using the shared schema. Keep Civil War and Reconstruction as distinct spatial/causal phases; do not collapse all industrialization or Progressive reform onto one city. Use transregional or no-coordinate records when the development is national.

For World War II, keep Japanese American incarceration as its own node rather than hiding it inside a general home-front summary. For P6, distinguish western Indigenous dispossession from urban/industrial labor history.

- [ ] **Step 4: Run validation and commit**

```bash
node --test tests/apush-data.test.mjs
node scripts/validate-apush-data.mjs
git add data/apush-period-{5,6,7}.json data/apush-period-{5,6,7}-manifest.json docs/data-sources/apush-period-{5,6,7}-source-ledger.md tests/apush-data.test.mjs
git commit -m "feat: add APUSH periods 5 through 7 timeline data"
```

Expected: P1–P7 validation PASS.

### Task 4: Add Periods 8–9 Content

**Files:**
- Create: `data/apush-period-8.json`
- Create: `data/apush-period-8-manifest.json`
- Create: `data/apush-period-9.json`
- Create: `data/apush-period-9-manifest.json`
- Create: `docs/data-sources/apush-period-8-source-ledger.md`
- Create: `docs/data-sources/apush-period-9-source-ledger.md`
- Modify: `tests/apush-data.test.mjs`

- [ ] **Step 1: Add failing literal-order tests**

Use these exact anchors:

```js
const EXPECTED_EVENT_IDS_8_TO_9 = {
  p8: [
    'truman-doctrine-containment-1947', 'postwar-suburbs-baby-boom-1945-1960', 'brown-board-1954',
    'civil-rights-movement-1955-1965', 'great-society-1964-1965', 'vietnam-escalation-withdrawal-1964-1973',
    'rights-counterculture-1960s-1970s', 'nixon-watergate-1968-1974', 'conservative-resurgence-1970s-1980',
  ],
  p9: [
    'reaganomics-new-right-1981-1988', 'cold-war-ends-1989-1991', 'immigration-globalization-1980-2001',
    'clinton-new-economy-1993-2000', 'september-eleven-2001', 'war-on-terror-2001-2011',
    'great-recession-2008', 'demographic-digital-polarization-2008-2026',
  ],
};
```

P9's last event may end at the registry validation ceiling, but its display label must use `2008–Present`, not `2008–2026`.

- [ ] **Step 2: Run tests and confirm red state**

```bash
node --test tests/apush-data.test.mjs
```

Expected: FAIL because P8–P9 files do not exist.

- [ ] **Step 3: Author P8–P9 data and source ledgers**

Encode the exact anchors above. Treat broad demographic, digital, and political developments as Dock-only when no single honest location represents them. Use neutral, descriptive summaries for recent political history and ground claims in the CED plus authoritative statistical or archival sources. Do not add events after the project's 2026 validation ceiling.

- [ ] **Step 4: Run all static data validation and commit**

```bash
node --test tests/apush-data.test.mjs
node scripts/validate-apush-data.mjs
git add data/apush-period-{8,9}.json data/apush-period-{8,9}-manifest.json docs/data-sources/apush-period-{8,9}-source-ledger.md tests/apush-data.test.mjs
git commit -m "feat: add APUSH periods 8 and 9 timeline data"
```

Expected: all nine period datasets validate and every manifest literal passes.

### Task 5: Add Race-Safe Period Switching to the Shared Page

**Files:**
- Modify: `apush-map.html`
- Modify: `scripts/verify-apush-browser.mjs`

- [ ] **Step 1: Add failing browser tests for selector population and period copy**

Load the registry in the verifier, then for every entry select its ID and assert:

```js
await page.selectOption('#periodFilter', period.id);
await page.waitForFunction((periodId) => window.__apushMap?.getState().periodId === periodId, period.id);
assert.equal(await page.locator('#periodFilter option').count(), 9);
assert.match(await page.locator('.eyebrow').innerText(), new RegExp(`Period ${period.number}`));
assert.equal(await page.locator('#timelineMount').getAttribute('aria-label'), `Period ${period.number} timeline`);
assert.match(await page.locator('.timeline-dock-head strong').innerText(), new RegExp(`Period ${period.number} Timeline`));
```

Also assert selection, query, themes, map transform, and relation status reset on every successful period change.

- [ ] **Step 2: Add a failing stale-request test**

Intercept P2 and P3 data requests, delay P2, select P2 then P3, release P2 last, and require state/content to remain P3:

```js
assert.equal((await stateOf(page)).periodId, 'p3');
assert.equal(await page.locator('#periodFilter').inputValue(), 'p3');
assert.deepEqual(await dockIds(page), manifests.p3.eventIds);
```

- [ ] **Step 3: Run the browser verifier and confirm red state**

```bash
node scripts/verify-apush-browser.mjs
```

Expected: FAIL because the selector contains only P1 and the loader fetches a hard-coded P1 URL.

- [ ] **Step 4: Implement registry-driven loading**

Populate `#periodFilter` from the registry. Track:

```js
let loadSequence = 0;
state.periodId = 'p1';

async function loadPeriod(periodId = elements.periodFilter.value) {
  const requestId = ++loadSequence;
  const period = periodRegistry.get(periodId);
  if (!period) return false;
  resetPeriodState(periodId);
  setToolbarDisabled(true);
  try {
    const response = await fetch(period.dataPath, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (requestId !== loadSequence) return false;
    if (!validDataset(data, periodId)) throw new Error(`Invalid APUSH ${period.id} dataset`);
    activatePeriod(period, data);
    return true;
  } catch (error) {
    if (requestId !== loadSequence) return false;
    showPeriodLoadError(period);
    return false;
  }
}
```

`resetPeriodState` clears query, themes, visible IDs, selection, relation status, and transform. `activatePeriod` rebuilds the model and updates all period-dependent text and accessible labels. Add `periodId` to `window.__apushMap.getState()`.

- [ ] **Step 5: Make visible copy period-specific**

Replace all hard-coded Period 1 strings in title, eyebrow, map label, empty detail, detail kicker, Dock label/head, and load error with the active registry entry. The selector itself must remain enabled during a failed load so another period can be chosen.

- [ ] **Step 6: Run verifier and commit**

```bash
node --test tests/apush-data.test.mjs
node scripts/verify-apush-browser.mjs
git add apush-map.html scripts/verify-apush-browser.mjs
git commit -m "feat: switch APUSH timeline dock across all periods"
```

Expected: selector, copy, state reset, and stale-request tests PASS.

### Task 6: Support Honest Dock-Only Events

**Files:**
- Modify: `apush-map.html`
- Modify: `scripts/verify-apush-browser.mjs`

- [ ] **Step 1: Add failing no-coordinate interaction tests**

For every period, identify an event with `siteIds.length === 0`, click its Dock button, and assert:

```js
assert.equal((await stateOf(page)).selectedEventId, event.id);
assert.equal(await page.locator(`.event-marker[data-event-id="${event.id}"]`).count(), 0);
assert.equal(await page.locator(`#timelineMount [data-event-id="${event.id}"]`).getAttribute('aria-current'), 'step');
assert.match(await page.locator('#detailPanel').innerText(), /全国性|制度性|National|Institutional/);
assert.deepEqual((await stateOf(page)).mapTransform, transformBefore);
```

Also assert all geographic events still expose their primary marker and marker selection still selects the Dock node.

For one selected event in each representative period, require the card to contain the date, Chinese title, one-sentence summary, and place/scope cue, while excluding the learning-module and long-form-detail surfaces:

```js
const card = page.locator('#detailPanel');
assert.match(await card.innerText(), new RegExp(escapeRegExp(event.dateLabel)));
assert.match(await card.innerText(), new RegExp(escapeRegExp(event.titleZh)));
assert.match(await card.innerText(), new RegExp(escapeRegExp(event.summary)));
assert.equal(await card.locator('.relationship-list, .source-list, [data-learning-progress], textarea').count(), 0);
```

- [ ] **Step 2: Run browser tests and confirm failure**

```bash
node scripts/verify-apush-browser.mjs
```

Expected: FAIL because the existing detail renderer assumes a populated place list, does not display the Dock-only cue, and still renders a long-form detail surface.

- [ ] **Step 3: Render location semantics without fabricated geography**

In `renderDetail`, branch on `event.siteIds.length`:

```js
if (places.length) {
  renderPlaceList(panel, places);
} else {
  panel.append(text('p', 'detail-location-scope', '全国性或制度性发展 · National / institutional development'));
}
```

Keep `focusPrimary(event)` as a no-op when `primarySiteId` is null. Do not add a center-of-country fallback marker. Ensure marker numbering reflects event order, so missing marker numbers may create intentional gaps that still correspond to Dock order.

Replace the long-form detail body with the approved compact card structure:

```js
panel.append(
  text('p', 'detail-kicker', `${event.dateLabel}${primaryPlace ? ` · ${primaryPlace.nameZh}` : ''}`),
  text('h2', 'detail-title-zh', event.titleZh),
  text('p', 'detail-summary', event.summary),
);
```

Append the national/institutional cue only when there is no primary place. Remove significance, exam connection, relationship navigation, source lists, and their headings from this map card; those fields remain in the dataset for validation and future surfaces. Do not add progress, questions, mastery controls, or a live region.

Update the existing P1 browser assertions that expected long-form relationship/source sections. Preserve map gestures, search/theme filters, marker/Dock synchronization, keyboard behavior, and responsive assertions; only the approved card content changes.

- [ ] **Step 4: Run tests and commit**

```bash
node --test tests/apush-data.test.mjs
node scripts/verify-apush-browser.mjs
git add apush-map.html scripts/verify-apush-browser.mjs
git commit -m "feat: represent nongeographic APUSH timeline events honestly"
```

Expected: no-coordinate and geographic synchronization tests PASS.

### Task 7: Complete the Nine-Period Responsive and Accessibility Matrix

**Files:**
- Modify: `scripts/verify-apush-browser.mjs`
- Modify: `apush-map.html` only if a verified regression requires it

- [ ] **Step 1: Replace P1-only verifier constants with registry fixtures**

Load every registry dataset and manifest before launching the browser. For each required viewport (`1440x900`, `1024x768`, `375x812`, `667x375`), verify P1, P5, and P9 completely; verify selector/copy/count/manifest order for the remaining periods. This keeps the runtime bounded while sampling early, middle, and recent-history map densities at every size.

- [ ] **Step 2: Verify each interaction boundary**

Add assertions for:

- Enter and Space activate Dock nodes after a period switch;
- selected nodes expose `aria-current="step"` and the visible `当前` cue;
- every Dock button accessible name contains its date and full event title;
- Dock scrolling changes only `.timeline-track.scrollLeft` and never `window.scrollY`;
- reduced motion uses `behavior: 'auto'`;
- document width never exceeds viewport width;
- every marker and Dock button is at least 44×44 CSS pixels;
- map pointer drag, zoom buttons, reset, and marker keyboard activation still work after switching P1 → P5 → P9;
- browser console errors remain empty.

- [ ] **Step 3: Verify filter and transient-state reset behavior**

Select an event, set a query and theme, then switch periods. Require:

```js
assert.deepEqual(await stateOf(page), {
  ...stateAfterLoad,
  periodId: target.id,
  query: '',
  activeThemes: [],
  visibleEventIds: targetManifest.eventIds,
  selectedEventId: null,
  relationStatus: '',
  mapTransform: INITIAL_TRANSFORM,
});
```

Compare the relevant fields rather than relying on object property order.

- [ ] **Step 4: Run the full verifier and fix only evidenced regressions**

```bash
node --test tests/apush-data.test.mjs
node scripts/verify-apush-browser.mjs
```

Expected terminal output:

```text
APUSH browser verification passed
```

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-apush-browser.mjs apush-map.html
git commit -m "test: verify APUSH timeline dock across nine periods"
```

### Task 8: Generalize Release Verification and Perform Visual QA

**Files:**
- Modify: `scripts/verify-apush-release.mjs`
- Modify: `README.md` only if it already documents preview commands; otherwise do not create unrelated documentation

- [ ] **Step 1: Make the validator CLI cover the registry**

Update `scripts/validate-apush-data.mjs` main execution path to load the registry, then each dataset, manifest, and source ledger. On success print one line per period and a final total:

```text
APUSH Period 1 dataset valid: 9 events, 0 defects
...
APUSH Period 9 dataset valid: 8 events, 0 defects
APUSH all-period data valid: 9 periods, 80 events, 0 defects
```

The exact total must be computed, not hard-coded.

- [ ] **Step 2: Run the release command**

```bash
node scripts/verify-apush-release.mjs
```

Expected: data tests, registry validator, and browser verifier all exit 0; the release script prints `APUSH all-period release verification passed`.

- [ ] **Step 3: Manually inspect representative periods**

Serve the repository and inspect P1, P5, and P9 at desktop and `375x812`. Confirm:

- the map remains visually dominant;
- Period labels and date bands are correct;
- Dock titles truncate without hiding accessible names;
- no-coordinate events appear in the Dock but not on the map;
- geographic events select map markers;
- the summary card is concise and contains no learning-module controls;
- the page and Dock do not jump vertically when synchronizing selection.

Save screenshots under `/private/tmp` for review; do not commit generated screenshots.

- [ ] **Step 4: Final verification and commit**

```bash
node --test tests/apush-data.test.mjs
node scripts/validate-apush-data.mjs
node scripts/verify-apush-browser.mjs
node scripts/verify-apush-release.mjs
git diff --check
git status --short
git add scripts/validate-apush-data.mjs scripts/verify-apush-release.mjs README.md
git commit -m "chore: verify APUSH all-period timeline release"
```

If `README.md` was not changed, omit it from `git add`. Expected: every verification command exits 0 and the worktree is clean after commit.

## Final Review Gate

After Task 8:

1. Request a holistic review of the full feature range against `docs/superpowers/specs/2026-08-11-apush-all-periods-timeline-dock-design.md`.
2. Fix every Critical and Important finding, then re-run the complete release verifier.
3. Use `superpowers:verification-before-completion` before claiming success.
4. Use `superpowers:finishing-a-development-branch` to offer merge, PR, keep, or discard options.
5. Do not push, merge, or open a PR without the user's explicit choice.
