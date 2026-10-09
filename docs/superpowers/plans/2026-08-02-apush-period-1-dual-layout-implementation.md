# APUSH Period 1 Dual-Layout Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one verified APUSH Period 1 study map that exposes a map-led A prototype and a map-plus-timeline C prototype through query parameters.

**Architecture:** `apush-map.html` is a static browser application that loads one normalized Period 1 JSON dataset and renders either layout A or C from a shared state model. A separate manifest freezes the approved nine-event scope; Node tests, a strict validator, and a Playwright browser matrix enforce content completeness, cross-layout parity, responsive behavior, and accessibility contracts.

**Tech Stack:** Static HTML/CSS/vanilla JavaScript, SVG copied from the existing static geography layer, JSON, Node.js built-in test runner, Playwright/Chromium discovery without new project dependencies.

## Global Constraints

- Scope is APUSH Period 1 only: `1491-1607` and exactly nine approved learning nodes.
- Expose `apush-map.html?layout=a` and `apush-map.html?layout=c`; missing or invalid layout falls back to A.
- Layouts A and C must share the same data, search, filters, selection, map behavior, detail content, and colors.
- Layout A must not retain an interactive hidden timeline; layout C must render the timeline below the map.
- Do not modify `index.html` or `world-map.html` in this release.
- Do not merge the divergent Art History feature branch.
- Do not add package-manager files or network dependencies.
- Use concise Chinese study copy while preserving standard English APUSH vocabulary; do not reproduce long copyrighted passages.
- Use the official eight APUSH themes: `NAT`, `WXT`, `GEO`, `MIG`, `PCE`, `WOR`, `ARC`, and `SOC`.
- Theme filters use OR logic with one another; search combines with themes using AND logic.
- All coordinates use the inherited `1600 x 800` SVG viewBox.
- Interactive controls and marker targets must be at least 44 CSS pixels.
- Verify at `1440 x 900`, `1024 x 768`, `375 x 812`, and `667 x 375`.

---

## File Structure and Ownership

The three implementation agents must use these non-overlapping boundaries:

- Verification agent owns only:
  - `scripts/validate-apush-data.mjs`
  - `scripts/verify-apush-browser.mjs`
  - `scripts/verify-apush-release.mjs`
  - `tests/apush-data.test.mjs`
- Data agent owns only:
  - `data/apush-period-1.json`
  - `data/apush-period-1-manifest.json`
  - `docs/data-sources/apush-period-1-source-ledger.md`
- Page agent owns only:
  - `apush-map.html`

The primary agent owns integration review, cross-boundary fixes, full release
verification, visual inspection, and final commits. Agents must not edit
`index.html`, `world-map.html`, or each other's files.

### Runtime interfaces

`data/apush-period-1.json` exports this JSON shape:

```js
{
  schemaVersion: 1,
  periods: [{ id, number, labelEn, labelZh, startYear, endYear }],
  themes: [{ id, labelEn, labelZh, color }],
  sources: [{ id, title, kind, locator }],
  sites: [{ id, nameEn, nameZh, x, y, region, qualifier }],
  events: [{
    id, titleEn, titleZh, periodId, dateLabel, startYear, endYear,
    siteIds, primarySiteId, themeIds, summary, significance,
    examConnection, causeIds, effectIds, relatedIds, keywords, sourceIds
  }]
}
```

`data/apush-period-1-manifest.json` exports:

```js
{
  schemaVersion: 1,
  periodId: "p1",
  eventIds: [
    "indigenous-north-america-1491",
    "european-exploration",
    "columbus-caribbean-1492",
    "columbian-exchange",
    "conquest-mexica",
    "conquest-inca",
    "spanish-labor-caste",
    "cultural-interactions",
    "st-augustine-borderlands"
  ]
}
```

The page must expose a test-only frozen API after initialization:

```js
window.__apushMap = Object.freeze({
  getState: () => ({
    layout,
    query,
    activeThemes: [...activeThemes],
    visibleEventIds: [...visibleEventIds],
    selectedEventId,
    mapTransform: { ...mapTransform }
  }),
  selectEvent: (eventId) => void 0,
  setQuery: (query) => void 0,
  toggleTheme: (themeId) => void 0,
  clearFilters: () => void 0,
  resetMap: () => void 0
});
```

---

### Task 1: Verification Contracts and Release Harness

**Files:**
- Create: `scripts/validate-apush-data.mjs`
- Create: `scripts/verify-apush-browser.mjs`
- Create: `scripts/verify-apush-release.mjs`
- Create: `tests/apush-data.test.mjs`

**Interfaces:**
- Consumes: the exact dataset, manifest, ledger, page DOM, and `window.__apushMap` contracts defined above.
- Produces: `validateDataset(dataset, manifest, ledgerText): string[]`, a strict CLI, data-focused Node tests, browser behavior verification, and one release command.

- [ ] **Step 1: Write strict dataset tests before the data files exist**

Create `tests/apush-data.test.mjs` with built-in `node:test`. Load the dataset,
manifest, and ledger from project-relative paths, call `validateDataset`, and
assert the independent identity baseline:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateDataset } from '../scripts/validate-apush-data.mjs';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));

test('Period 1 data matches the approved nine-event manifest', async () => {
  const [data, manifest, ledger] = await Promise.all([
    readJson('../data/apush-period-1.json'),
    readJson('../data/apush-period-1-manifest.json'),
    readFile(new URL('../docs/data-sources/apush-period-1-source-ledger.md', import.meta.url), 'utf8'),
  ]);
  assert.deepEqual(data.events.map((event) => event.id), manifest.eventIds);
  assert.deepEqual(validateDataset(data, manifest, ledger), []);
});

test('the dataset exposes the official eight APUSH themes exactly once', async () => {
  const data = await readJson('../data/apush-period-1.json');
  assert.deepEqual(data.themes.map(({ id }) => id).sort(),
    ['ARC', 'GEO', 'MIG', 'NAT', 'PCE', 'SOC', 'WOR', 'WXT']);
});
```

Add focused mutation tests that deep-clone valid fixtures after they exist and
assert error messages for duplicate IDs, unknown site/theme/source/relationship
references, invalid date order, coordinates outside `0..1600` and `0..800`,
events outside `p1`, missing bilingual fields, and an event absent from the
ledger.

- [ ] **Step 2: Implement the validator module and CLI**

Create `scripts/validate-apush-data.mjs`. Export pure validation and make CLI
execution load the default three files. Return all errors in one run, one
human-readable string per error:

```js
export function validateDataset(data, manifest, ledgerText) {
  const errors = [];
  const ids = (rows, kind) => {
    const seen = new Set();
    for (const row of rows || []) {
      if (!row?.id) errors.push(`${kind} is missing id`);
      else if (seen.has(row.id)) errors.push(`duplicate ${kind} id: ${row.id}`);
      else seen.add(row.id);
    }
    return seen;
  };
  const requiredString = (row, field, kind) => {
    if (typeof row?.[field] !== 'string' || !row[field].trim()) {
      errors.push(`${kind} ${row?.id || '(unknown)'} missing ${field}`);
    }
  };
  const periodIds = ids(data?.periods, 'period');
  const themeIds = ids(data?.themes, 'theme');
  const siteIds = ids(data?.sites, 'site');
  const sourceIds = ids(data?.sources, 'source');
  const eventIds = ids(data?.events, 'event');
  if (data?.schemaVersion !== 1) errors.push('dataset schemaVersion must be 1');
  if (manifest?.schemaVersion !== 1) errors.push('manifest schemaVersion must be 1');
  if (manifest?.periodId !== 'p1') errors.push('manifest periodId must be p1');
  if (JSON.stringify((data?.events || []).map(({ id }) => id)) !== JSON.stringify(manifest?.eventIds || [])) {
    errors.push('dataset event order must exactly match manifest eventIds');
  }
  for (const site of data?.sites || []) {
    requiredString(site, 'nameEn', 'site'); requiredString(site, 'nameZh', 'site');
    if (!Number.isFinite(site.x) || site.x < 0 || site.x > 1600) errors.push(`site ${site.id} x out of bounds`);
    if (!Number.isFinite(site.y) || site.y < 0 || site.y > 800) errors.push(`site ${site.id} y out of bounds`);
  }
  for (const event of data?.events || []) {
    for (const field of ['titleEn', 'titleZh', 'dateLabel', 'summary', 'significance', 'examConnection']) {
      requiredString(event, field, 'event');
    }
    if (!periodIds.has(event.periodId) || event.periodId !== 'p1') errors.push(`event ${event.id} has invalid periodId`);
    if (!Number.isFinite(event.startYear) || !Number.isFinite(event.endYear) || event.startYear > event.endYear) {
      errors.push(`event ${event.id} has invalid date range`);
    }
    for (const siteId of event.siteIds || []) if (!siteIds.has(siteId)) errors.push(`event ${event.id} unknown site: ${siteId}`);
    if (event.primarySiteId && !siteIds.has(event.primarySiteId)) errors.push(`event ${event.id} unknown primary site`);
    for (const themeId of event.themeIds || []) if (!themeIds.has(themeId)) errors.push(`event ${event.id} unknown theme: ${themeId}`);
    for (const sourceId of event.sourceIds || []) if (!sourceIds.has(sourceId)) errors.push(`event ${event.id} unknown source: ${sourceId}`);
    for (const field of ['causeIds', 'effectIds', 'relatedIds']) {
      for (const relatedId of event[field] || []) if (!eventIds.has(relatedId)) errors.push(`event ${event.id} unknown ${field}: ${relatedId}`);
    }
    if (!ledgerText.includes(`\`${event.id}\``)) errors.push(`ledger missing event: ${event.id}`);
  }
  return errors;
}
```

Use `fileURLToPath(import.meta.url) === process.argv[1]` to detect CLI mode.
Print each defect to stderr and exit `1`; print a count summary and exit `0`
when valid. The validator must not depend on browser code.

- [ ] **Step 3: Write the browser verifier before `apush-map.html` exists**

Create `scripts/verify-apush-browser.mjs` with:

```js
export const REQUIRED_VIEWPORTS = Object.freeze([
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 375, height: 812 },
  { width: 667, height: 375 },
]);
export const LAYOUTS = Object.freeze(['a', 'c']);
```

Implement a no-store static server rooted at the repository. Discover
Playwright in this order: `APUSH_PLAYWRIGHT_PATH`, local `node_modules`, the
Codex primary runtime path when readable, then common cached locations.
Discover Chromium from `APUSH_BROWSER_PATH`, Playwright's executable, Google
Chrome, or Chromium.

For every layout and viewport, load
`/apush-map.html?layout=${layout}`, wait for `window.__apushMap`, capture page
errors and console errors, and assert:

- the prototype label is A or C;
- `visibleEventIds` equals the nine manifest IDs initially;
- only C has a connected, interactive timeline region;
- clicking `[data-event-id="columbus-caribbean-1492"]` selects that event;
- clicking a theme changes the result set and clearing restores nine;
- searching `Columbian Exchange` returns and selects the expected event;
- zoom changes `mapTransform` and reset restores the overview;
- every manifest event can be selected and yields matching bilingual detail;
- `document.documentElement.scrollWidth <= window.innerWidth`;
- no interactive element has a computed hit box below 44 pixels when it uses
  the marker/control hit-target contract.

Also exercise malformed data by serving a controlled invalid dataset response
for one request. Assert the real page shows a visible retry action and that
retrying after restoring the valid response initializes `window.__apushMap`.
This replaces source-code grep tests with observable browser behavior.

Compare A and C initial `visibleEventIds` and detail text to prove content
parity. At desktop size, assert C's map panel height is at least 80 pixels less
than A's because the timeline consumes visible space.

- [ ] **Step 4: Write the release aggregator**

Create `scripts/verify-apush-release.mjs` to run, in order:

```js
const steps = [
  ['Node tests', ['--test', 'tests/apush-data.test.mjs']],
  ['strict Period 1 validator', ['scripts/validate-apush-data.mjs']],
  ['browser matrix', ['scripts/verify-apush-browser.mjs']],
];
```

Use `spawnSync(process.execPath, args, { cwd: PROJECT_ROOT, stdio: 'inherit' })`
and exit immediately on the first nonzero result.

- [ ] **Step 5: Run the contracts and record the expected red state**

Run:

```bash
node --test tests/apush-data.test.mjs
node scripts/validate-apush-data.mjs
node scripts/verify-apush-browser.mjs
```

Expected: failures identify missing `data/apush-period-1.json`, manifest,
ledger, and `apush-map.html`; the browser verifier reaches the intended missing
page/data assertion rather than failing from a syntax error in the harness.

- [ ] **Step 6: Commit the verification contracts**

```bash
git add scripts/validate-apush-data.mjs scripts/verify-apush-browser.mjs scripts/verify-apush-release.mjs tests/apush-data.test.mjs
git commit -m "test: define APUSH Period 1 prototype contracts"
```

---

### Task 2: Period 1 Dataset, Manifest, and Source Ledger

**Files:**
- Create: `data/apush-period-1.json`
- Create: `data/apush-period-1-manifest.json`
- Create: `docs/data-sources/apush-period-1-source-ledger.md`
- Test: `tests/apush-data.test.mjs`

**Interfaces:**
- Consumes: the dataset and manifest shapes and approved IDs in this plan; validator messages from Task 1.
- Produces: a valid nine-event Period 1 package used directly by the page and browser verifier.

- [ ] **Step 1: Create the independent manifest first**

Create `data/apush-period-1-manifest.json` with `schemaVersion: 1`,
`periodId: "p1"`, and the exact ordered nine IDs from the runtime-interface
section. Do not derive this file from the dataset.

- [ ] **Step 2: Build the normalized identity tables**

Create `data/apush-period-1.json` with:

```json
{
  "schemaVersion": 1,
  "periods": [{
    "id": "p1", "number": 1,
    "labelEn": "Period 1: 1491-1607",
    "labelZh": "时期一：1491-1607",
    "startYear": 1491, "endYear": 1607
  }],
  "themes": [
    { "id": "NAT", "labelEn": "American and National Identity", "labelZh": "美国与国家身份", "color": "#7b4f88" },
    { "id": "WXT", "labelEn": "Work, Exchange, and Technology", "labelZh": "劳动、交换与技术", "color": "#b4663b" },
    { "id": "GEO", "labelEn": "Geography and the Environment", "labelZh": "地理与环境", "color": "#557c68" },
    { "id": "MIG", "labelEn": "Migration and Settlement", "labelZh": "迁移与定居", "color": "#b04f59" },
    { "id": "PCE", "labelEn": "Politics and Power", "labelZh": "政治与权力", "color": "#4f6994" },
    { "id": "WOR", "labelEn": "America in the World", "labelZh": "美国与世界", "color": "#8a6a2f" },
    { "id": "ARC", "labelEn": "American and Regional Culture", "labelZh": "美国与区域文化", "color": "#86614a" },
    { "id": "SOC", "labelEn": "Social Structures", "labelZh": "社会结构", "color": "#6d6775" }
  ]
}
```

Add source records for the College Board CED, AMSCO 4th edition, and each
Period 1 review-note topic used. Add site records for all geographic anchors,
including the four Indigenous-region anchors, Iberia/Atlantic route anchors,
the Caribbean, Tenochtitlan, the Andes/Cusco region, Spanish colonial America,
and St. Augustine. Every site must have a stable qualifier when its point is
representative rather than exact.

- [ ] **Step 3: Write the nine complete event records in manifest order**

For every record, provide all fields in the interface. Use these date anchors:

- `indigenous-north-america-1491`: `1491-1491` with four regional anchors.
- `european-exploration`: `1491-1607` as a process, not a single voyage.
- `columbus-caribbean-1492`: `1492-1492`.
- `columbian-exchange`: `1492-1607` in this release boundary.
- `conquest-mexica`: `1519-1521`.
- `conquest-inca`: `1532-1533`.
- `spanish-labor-caste`: `1500-1607` with an approximate qualifier.
- `cultural-interactions`: `1492-1607` with transregional anchors.
- `st-augustine-borderlands`: `1565-1565`.

Write 2-4 sentence Chinese summaries and shorter significance/exam-connection
fields. Preserve terms such as `Columbian Exchange`, `encomienda`, `casta`,
`joint-stock company`, `conquistador`, and `mestizo` where relevant. Assign at
least two themes to every event and use reciprocal related/cause/effect links
where the historical direction is explicit.

- [ ] **Step 4: Write the source ledger**

Create `docs/data-sources/apush-period-1-source-ledger.md` with one source
table and one event-coverage table. Record these verified local ranges:

- AMSCO PDF pages `6-11`, `34-37`, and `59-89`.
- Period 1 note `1.1`: PDF pages `4-14`.
- Period 1 note `1.2`: PDF pages `2-8`.
- Period 1 note `1.3`: PDF pages `2-5`.
- Period 1 note `1.4`: PDF pages `2-3`.
- Period 1 note `1.5`: PDF pages `2-5`.

State that the CED is the identity authority, AMSCO is the primary narrative
cross-check, the notes are enrichment only, 1619 material is excluded as
Period 2, and known Hudson/Northwest Passage inaccuracies are excluded.

- [ ] **Step 5: Run data validation and tests**

```bash
node scripts/validate-apush-data.mjs
node --test tests/apush-data.test.mjs
```

Expected: validator exits `0`; every data test passes with exactly nine events
and all references and ledger coverage resolved.

- [ ] **Step 6: Commit the data package**

```bash
git add data/apush-period-1.json data/apush-period-1-manifest.json docs/data-sources/apush-period-1-source-ledger.md
git commit -m "feat: add APUSH Period 1 study data"
```

---

### Task 3: Shared A/C Browser Application

**Files:**
- Create: `apush-map.html`
- Test: `scripts/verify-apush-browser.mjs`
- Verify: `scripts/verify-apush-browser.mjs`

**Interfaces:**
- Consumes: `data/apush-period-1.json`, the normalized model above, and the page/test API from Task 1.
- Produces: the two functional prototype URLs and `window.__apushMap`.

- [ ] **Step 1: Create the semantic page shell and shared visual tokens**

Create one HTML file with this durable structure:

```html
<header class="page-header">
  <div><p class="eyebrow">AP U.S. History · Period 1</p><h1>American History Map</h1></div>
  <span id="prototypeLabel" class="prototype-label"></span>
</header>
<section id="filterToolbar" class="filter-toolbar" aria-label="筛选美国史事件">
  <label>时期<select id="periodFilter"><option value="p1">Period 1 · 1491-1607</option></select></label>
  <label class="search-field">搜索<input id="searchInput" type="search" autocomplete="off"></label>
  <div id="themeFilters" role="group" aria-label="APUSH 主题"></div>
  <span id="resultCount" role="status"></span>
  <button id="clearFilters" type="button">清除筛选</button>
</section>
<main id="workspace" class="workspace">
  <section class="map-column">
    <section id="mapPanel" class="map-panel" aria-label="Period 1 互动地图"></section>
    <div id="timelineMount"></div>
  </section>
  <aside id="detailPanel" class="detail-panel" aria-live="polite"></aside>
</main>
<section id="loadError" class="load-error" hidden>
  <p>Period 1 资料暂时没有载入。</p><button id="retryLoad" type="button">重试</button>
</section>
```

Use Magic History warm-paper variables and separate A/C sizing. Choose one
mobile breakpoint at `700px`; below it, stack map, C timeline, and detail in
that order. At desktop, give A a `min-height: 620px` map; give C a
`min-height: 480px` map plus a `120px` timeline. In the `667 x 375` landscape
case, preserve usable internal scrolling instead of clipping controls.

- [ ] **Step 2: Copy only the static geography layer**

Copy the `1600 x 800` SVG land/country path layer from `world-map.html` into
the map panel. Do not copy `.pin-group`, `#routes-layer`, event panels, route
vehicles, filters, quizzes, data scripts, or World History event scripts.

Append dedicated empty layers:

```html
<g id="apushMarkerLayer" aria-label="美国史地点"></g>
```

Add zoom-in, zoom-out, and reset semantic buttons outside the SVG. Apply map
transforms only to a wrapper group containing geography and APUSH markers.

- [ ] **Step 3: Implement loading, layout selection, filtering, and safe text rendering**

Use `fetch('data/apush-period-1.json', { cache: 'no-store' })`. Validate the
minimum top-level shape before rendering. On failure, hide the workspace,
show `#loadError`, and let `#retryLoad` call the loader again.

Implement these exact helpers:

```js
const normalize = (value) => String(value || '').normalize('NFKC').toLowerCase().trim();
function getLayout(params = new URLSearchParams(location.search)) {
  return params.get('layout') === 'c' ? 'c' : 'a';
}
function eventSearchText(event, sitesById, themesById) {
  return normalize([
    event.titleEn, event.titleZh, event.dateLabel, event.summary,
    ...(event.keywords || []),
    ...(event.siteIds || []).flatMap((id) => [sitesById.get(id)?.nameEn, sitesById.get(id)?.nameZh]),
    ...(event.themeIds || []).flatMap((id) => [themesById.get(id)?.labelEn, themesById.get(id)?.labelZh]),
  ].filter(Boolean).join(' '));
}
function filterEvents(events, query, activeThemes, sitesById, themesById) {
  const token = normalize(query);
  return events.filter((event) => {
    const themePass = activeThemes.size === 0 || event.themeIds.some((id) => activeThemes.has(id));
    return themePass && (!token || eventSearchText(event, sitesById, themesById).includes(token));
  });
}
function text(tag, className, value) { const node = document.createElement(tag); node.className = className; node.textContent = value; return node; }
```

Never interpolate dataset study copy into `innerHTML`. Static icon markup may
be created once in the source, but event titles, summaries, keywords, and
source labels must use `textContent`.

- [ ] **Step 4: Implement marker rendering and bounded map controls**

Render one marker per event/site pair. Each marker is an SVG `g` with
`role="button"`, `tabindex="0"`, an accessible bilingual label, a transparent
`r="22"` hit circle, an `r="11"` visible circle, and a compact number. Offset
same-site markers deterministically by event order.

Use one state transform `{ scale, x, y }`, clamp scale to `1..4`, clamp pan so
at least 25% of the map remains visible, and implement pointer drag without
capturing clicks that moved less than four pixels. Reset restores the initial
Atlantic/Americas overview.

Click, Enter, and Space call `selectEvent(eventId)`. If an event has several
anchors, give all its markers the selected ring and bring its primary marker
into view without losing the bounded transform.

- [ ] **Step 5: Implement the shared detail panel and linked navigation**

The empty panel explains how to choose a marker. A selected record renders
bilingual title, date, place list, Period/theme chips, summary, significance,
exam connection, causes, effects, related events, and source titles/page
locators. Relationship chips are semantic buttons and call the same
`selectEvent` function.

If a linked event is filtered out, keep the filter unchanged and show a short
status message explaining that the related record is outside the current
filter; do not silently clear user filters.

- [ ] **Step 6: Implement C's timeline from the shared event state**

Only when `layout === 'c'`, create a labelled timeline region with stops in
manifest/data order. Each stop shows `dateLabel` and a short bilingual title,
is at least 44 pixels high, and calls `selectEvent`. Search and theme filters
remove nonmatching stops. Selection updates `aria-current="true"` and scrolls
the active stop into view.

When layout is A, remove `#timelineMount` from the DOM before publishing
`window.__apushMap`; do not hide focusable timeline controls with CSS.

- [ ] **Step 7: Publish the frozen test API and initialize**

Publish the exact `window.__apushMap` interface from the file-structure
section after data loads. `getState()` must return copies of arrays and the map
transform so tests cannot mutate internal state.

Initialize in this order: resolve layout, set prototype label/body dataset,
load data, render theme controls, set initial visible IDs, fit map, render
markers/timeline/detail empty state, publish API.

- [ ] **Step 8: Run data and browser verification**

```bash
node --test tests/apush-data.test.mjs
node scripts/verify-apush-browser.mjs
```

Expected: data contracts and both A/C browser behavior matrices pass with no
console errors or viewport overflow.

- [ ] **Step 9: Commit the browser application**

```bash
git add apush-map.html
git commit -m "feat: add APUSH Period 1 A and C prototypes"
```

---

### Task 4: Integrated Review, Visual QA, and Release Gate

**Files:**
- Modify only if verification finds a defect: files created in Tasks 1-3.
- Do not modify: `index.html`, `world-map.html`.

**Interfaces:**
- Consumes: all Task 1-3 deliverables.
- Produces: a verified comparison-ready Period 1 prototype and final commit.

- [ ] **Step 1: Run the complete automated release gate from a clean state**

```bash
node scripts/verify-apush-release.mjs
git status --short
```

Expected: release script prints success after Node tests, validator, and
browser matrix. Git status contains no unexpected tracked changes;
`.superpowers/` may remain untracked and must not be staged.

- [ ] **Step 2: Render representative A and C screenshots for inspection**

Use the browser verifier or in-app browser at `1440 x 900` and `375 x 812`.
Capture A and C after selecting `columbian-exchange`, then inspect:

- map/detail proportions and A/C timeline trade-off;
- marker collisions and readable labels;
- toolbar wrapping and 44px targets;
- detail scroll behavior;
- C timeline scrolling and active state;
- zero clipping, overlap, or broken typography.

- [ ] **Step 3: Perform content spot checks against the ledger**

Check one Indigenous node, one conquest node, and one Spanish-colonial node.
Confirm dates, terminology, APUSH themes, source locator, and relationship
direction. Confirm the page excludes 1619 and the known Hudson inaccuracies.

- [ ] **Step 4: Fix defects with the smallest scoped patch and rerun gates**

For any defect, first add or tighten a failing automated assertion when the
behavior is machine-checkable, apply the minimal implementation/data fix, and
rerun:

```bash
node scripts/verify-apush-release.mjs
```

Expected: full pass after every correction.

- [ ] **Step 5: Commit integrated corrections if any**

```bash
git add apush-map.html data/apush-period-1.json data/apush-period-1-manifest.json docs/data-sources/apush-period-1-source-ledger.md scripts tests
git commit -m "fix: complete APUSH Period 1 prototype verification"
```

Skip this commit when the review required no changes.

- [ ] **Step 6: Hand off both comparison URLs**

Serve the repository locally and provide both complete URLs:

```text
/apush-map.html?layout=a
/apush-map.html?layout=c
```

Tell the user that homepage integration and Periods 2-3 remain intentionally
deferred until they choose A or C.
