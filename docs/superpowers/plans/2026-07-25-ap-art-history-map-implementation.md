# AP Art History Ancient Mediterranean Study Map — Full World Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone AP Art History study map for the 27 in-scope Egypt, Greece, and Rome works on the same detailed full-world layout as the original map, then expose it through the existing homepage subject switcher without regressing the world history map.

**Architecture:** Keep `art-history-map.html` independent from `world-map.html` at runtime. Copy only the original map's detailed world-geography layer into an SVG with `viewBox="0 0 1600 800"`; do not copy its pins, routes, event overlays, or scripts. The art page owns its data, 15-site projection and collision-avoidance layers, filters, state, detail panel, and lightbox; a Node validation script extracts the embedded JSON before browser testing. `index.html` keeps one mounted iframe per live subject so world-history and art-history state survive repeated switching.

**Tech Stack:** HTML5, CSS, inline SVG, vanilla JavaScript, Node.js validation scripts, local HTTP server, in-app browser verification.

---

## Implementation Status

The option-A world layout, 15-site marker aggregation and leader-line
placement, filters, selection, zoom and pan, site cycling, study panel,
comparisons, lightbox, and persistent two-iframe homepage switching are
implemented. The task sequence below remains the verification and maintenance
record for that implementation.

## File Structure

- Create `art-history-map.html`: standalone art map UI, embedded artwork JSON,
  copied world-geography layer, 15-site projection and marker layout, state,
  rendering, interaction, and accessibility behavior.
- Create `scripts/validate-art-history-data.mjs`: extract and validate the
  artwork JSON from the HTML.
- Create `tests/art-history-data.test.mjs`: regression tests for the exact AP
  manifest, required fields, coordinates, relationships, and sources.
- Create `docs/art-history-sources.md`: record the official list, notes,
  Smarthistory, and image source page used for every work.
- Modify `index.html:145-208`: add art-mode sizing and visibility rules.
- Modify `index.html:307-336`: make Art History live and add the persistent art
  iframe.
- Modify `index.html:500-648`: isolate world-only logic and implement
  state-preserving subject switching.
- Do not modify `world-map.html`.

## Confirmed Option-A Map Contract

- Copy the complete detailed geography layer from `world-map.html` into the
  standalone art page and keep its `0 0 1600 800` coordinate system.
- Exclude every world-history pin, route, event panel, overlay, and legacy
  interaction script.
- Resolve the 27 artwork records to 15 historical sites. Aggregate works at
  the same site into count markers.
- Use deterministic marker collision avoidance. Draw a leader line from every
  displaced marker back to its world-coordinate anchor.
- Keep the complete art interaction inside `art-history-map.html`; keep both
  homepage iframes mounted and toggle their visibility so subject state
  persists.

## Exact First-Release Manifest

The expected 27 AP numbers are:

```text
Egypt: 13, 15, 17, 18, 20, 21, 22, 23, 24
Greece: 26, 27, 28, 33, 34, 35, 36, 37, 38, 41
Rome: 39, 40, 42, 43, 44, 45, 46, 47
```

Mesopotamian, Persian, and Etruscan works remain outside this release. If
source review shows that an AP number or cultural assignment above is wrong,
stop and amend the approved design/spec with the user before changing the
manifest.

### Task 1: Lock the Artwork Manifest and Validation Contract

**Files:**
- Create: `tests/art-history-data.test.mjs`
- Create: `scripts/validate-art-history-data.mjs`

- [ ] **Step 1: Write the failing manifest test**

Create `tests/art-history-data.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAndValidate } from '../scripts/validate-art-history-data.mjs';

const expected = [
  13, 15, 17, 18, 20, 21, 22, 23, 24,
  26, 27, 28, 33, 34, 35, 36, 37, 38, 41,
  39, 40, 42, 43, 44, 45, 46, 47,
].sort((a, b) => a - b);

test('contains the exact approved AP manifest', () => {
  const works = loadAndValidate('art-history-map.html');
  assert.deepEqual(
    works.map(work => work.apNumber).sort((a, b) => a - b),
    expected,
  );
});

test('uses unique ids and AP numbers', () => {
  const works = loadAndValidate('art-history-map.html');
  assert.equal(new Set(works.map(work => work.id)).size, works.length);
  assert.equal(new Set(works.map(work => work.apNumber)).size, works.length);
});

test('resolves comparisons and keeps coordinates in the world-map contract', () => {
  const works = loadAndValidate('art-history-map.html');
  const ids = new Set(works.map(work => work.id));
  for (const work of works) {
    assert.ok(work.coordinates.x >= 0 && work.coordinates.x <= 1600);
    assert.ok(work.coordinates.y >= 0 && work.coordinates.y <= 800);
    for (const id of work.comparisonIds) assert.ok(ids.has(id), `${work.id}: ${id}`);
  }
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
node --test tests/art-history-data.test.mjs
```

Expected: FAIL because `scripts/validate-art-history-data.mjs` does not exist.

- [ ] **Step 3: Add the HTML JSON extractor and field validator**

Create `scripts/validate-art-history-data.mjs`:

```js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED = [
  'id', 'apNumber', 'titleEn', 'titleZh', 'civilization', 'period', 'date',
  'artistCulture', 'siteName', 'coordinates', 'medium', 'workType', 'function',
  'form', 'content', 'context', 'recognitionAnchors', 'comparisonIds',
  'imageUrl', 'imageAlt', 'imageSourceName', 'imageSourceUrl', 'keywords',
];
const CIVILIZATIONS = new Set(['egypt', 'greece', 'rome']);

export function loadAndValidate(file) {
  const html = fs.readFileSync(file, 'utf8');
  const match = html.match(
    /<script id="artwork-data" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!match) throw new Error('Missing #artwork-data JSON block');
  const works = JSON.parse(match[1]);
  if (!Array.isArray(works)) throw new Error('Artwork data must be an array');

  const ids = new Set();
  const apNumbers = new Set();
  for (const work of works) {
    for (const field of REQUIRED) {
      const value = work[field];
      if (value === undefined || value === null || value === '') {
        throw new Error(`${work.id || 'unknown'} missing ${field}`);
      }
    }
    if (!CIVILIZATIONS.has(work.civilization)) {
      throw new Error(`${work.id} has invalid civilization`);
    }
    if (ids.has(work.id)) throw new Error(`Duplicate id ${work.id}`);
    if (apNumbers.has(work.apNumber)) throw new Error(`Duplicate AP #${work.apNumber}`);
    ids.add(work.id);
    apNumbers.add(work.apNumber);
    if (!Array.isArray(work.recognitionAnchors) || !work.recognitionAnchors.length) {
      throw new Error(`${work.id} needs recognition anchors`);
    }
    if (!Array.isArray(work.comparisonIds) || !Array.isArray(work.keywords)) {
      throw new Error(`${work.id} has invalid array fields`);
    }
    new URL(work.imageUrl);
    new URL(work.imageSourceUrl);
  }
  for (const work of works) {
    for (const target of work.comparisonIds) {
      if (!ids.has(target)) throw new Error(`${work.id} links missing ${target}`);
    }
  }
  return works;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const target = path.resolve(process.argv[2] || 'art-history-map.html');
  const works = loadAndValidate(target);
  console.log(`Validated ${works.length} AP Art History works`);
}
```

- [ ] **Step 4: Commit the validation contract**

```bash
git add tests/art-history-data.test.mjs scripts/validate-art-history-data.mjs
git commit -m "test: define ancient Mediterranean artwork manifest"
```

### Task 2: Build the Standalone Page Shell and Complete Dataset

**Files:**
- Create: `art-history-map.html`
- Create: `docs/art-history-sources.md`

- [ ] **Step 1: Add a minimal page and embedded JSON block**

Create `art-history-map.html` with semantic regions:

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>AP Art History — 古代地中海互动地图</title>
  <style>/* Task 3 adds the complete visual system. */</style>
</head>
<body>
  <main class="art-app">
    <header class="art-toolbar">
      <p class="eyebrow">AP ART HISTORY · UNIT 2</p>
      <h1>古代地中海艺术地图</h1>
      <p>从尼罗河到爱琴海，再到罗马。</p>
      <div id="filters" aria-label="作品筛选"></div>
    </header>
    <section class="art-workspace">
      <div id="mapPanel" class="map-panel" aria-label="世界地图上的古代地中海艺术地点"></div>
      <aside id="detailPanel" class="detail-panel" aria-live="polite"></aside>
    </section>
  </main>
  <dialog id="imageDialog" aria-labelledby="dialogTitle"></dialog>
  <script id="artwork-data" type="application/json">[]</script>
  <script>
    // Tasks 3–5 add behavior here.
  </script>
</body>
</html>
```

- [ ] **Step 2: Run the manifest test and verify the expected failure**

Run:

```bash
node --test tests/art-history-data.test.mjs
```

Expected: one manifest test FAIL because the JSON array is empty; extractor
and structural tests load successfully.

- [ ] **Step 3: Build the complete source ledger**

Create `docs/art-history-sources.md` with columns for AP number,
civilization, official identity source, user-note source, public image page,
direct image URL, and license/status. Add exactly one complete row for each
number in the approved 27-work manifest. Use the museum or Wikimedia artwork
page, not an opaque CDN URL, as the public image page. Do not proceed while a
cell is empty or marked pending.

- [ ] **Step 4: Transcribe and synthesize the 27 records**

Populate `#artwork-data` in the exact manifest order. For every record:

- verify official identity fields against AP CED;
- use the user's notes and relevant Smarthistory volume for synthesis;
- write original concise Chinese for `function`, `form`, `content`, and
  `context`;
- retain English AP terms in parentheses when pedagogically useful;
- give two or more `recognitionAnchors`;
- add one or more `comparisonIds` unless no in-scope comparison is honest;
- set the site qualifier to `"approximate"` or `"findspot"` when needed;
- use museum, Smarthistory, or Wikimedia image and source-page URLs;
- retain a stable source coordinate with each record and resolve its
  `siteName` through the 15-site world-coordinate table when rendering in the
  `0 0 1600 800` viewBox.

Use the validator's exact field names. AP #27 must use the stable ID
`ap27-anavysos-kouros`, coordinates `{ "x": 405, "y": 285 }`, and comparison
IDs `ap28-peplos-kore` and `ap34-doryphoros`. Resolve its image and source URLs
from the completed AP #27 source-ledger row. Apply the same stable
`ap<NUMBER>-<slug>` ID convention and ledger lookup to the other 26 works.

- [ ] **Step 5: Run the data tests and validator**

```bash
node --test tests/art-history-data.test.mjs
node scripts/validate-art-history-data.mjs art-history-map.html
```

Expected:

```text
tests 3
pass 3
fail 0
Validated 27 AP Art History works
```

- [ ] **Step 6: Commit the dataset**

```bash
git add art-history-map.html docs/art-history-sources.md
git commit -m "feat: add verified ancient Mediterranean artwork data"
```

### Task 3: Implement Layout, Map Rendering, Search, and Filters

**Files:**
- Modify: `art-history-map.html`

- [ ] **Step 1: Add pure filter assertions before DOM initialization**

Expose a test surface and run assertions in development:

```js
function normalize(value) {
  return String(value || '').normalize('NFKC').toLocaleLowerCase();
}

function filterWorks(works, state) {
  const query = normalize(state.query);
  return works.filter(work =>
    (state.civilization === 'all' || work.civilization === state.civilization) &&
    (state.period === 'all' || work.period === state.period) &&
    (state.workType === 'all' || work.workType === state.workType) &&
    (!query || [
      work.titleEn, work.titleZh, work.siteName, ...work.keywords,
    ].some(value => normalize(value).includes(query)))
  );
}

console.assert(filterWorks(ARTWORKS, {
  civilization: 'egypt', period: 'all', workType: 'all', query: '',
}).length === 9);
console.assert(filterWorks(ARTWORKS, {
  civilization: 'greece', period: 'all', workType: 'all', query: '',
}).length === 10);
console.assert(filterWorks(ARTWORKS, {
  civilization: 'rome', period: 'all', workType: 'all', query: '',
}).length === 8);
```

- [ ] **Step 2: Add the approved option-A visual system**

Implement:

```css
.art-workspace {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(275px, 1fr);
  height: min(620px, 78vh);
}
.map-panel { min-width: 0; overflow: hidden; }
.detail-panel { overflow-y: auto; border-left: 1px solid var(--line); }
@media (max-width: 520px) {
  .art-workspace { grid-template-columns: 1fr; height: auto; }
  .map-panel { height: 360px; }
  .detail-panel { border-left: 0; border-top: 1px solid var(--line); }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
```

Use the project palette and the approved marker colours:
Egypt `#b85d44`, Greece `#597f8b`, Rome `#c8943d`.

- [ ] **Step 3: Render the original detailed world geography and 15 site markers**

Create one inline SVG with `viewBox="0 0 1600 800"`. Copy the complete detailed
geography paths from `world-map.html` without its pins, routes, event overlays,
or scripts. Render the 27 works as 15 site groups resolved through
`SITE_WORLD_COORDINATES`. A group with multiple works displays its count;
otherwise display a dot. Use focusable SVG groups with `role="button"`,
`tabindex="0"`, and an `aria-label` listing the site and work count.

Run the grouped sites through a deterministic collision-avoidance layout.
When a displayed marker differs from its world-coordinate anchor, draw a
non-interactive leader line from the anchor to the displayed marker.

Keep rendering deterministic:

```js
function groupBySite(works) {
  return Object.values(works.reduce((groups, work) => {
    const key = `${work.siteName}:${work.coordinates.x}:${work.coordinates.y}`;
    (groups[key] ||= {
      siteName: work.siteName,
      coordinates: work.coordinates,
      works: [],
    }).works.push(work);
    return groups;
  }, {}));
}
```

Keep world placement explicit:

```js
function toWorldCoordinates(workOrGroup) {
  const projected = SITE_WORLD_COORDINATES[workOrGroup.siteName];
  if (projected) return { ...projected };
  return {
    x: Math.max(0, Math.min(1600, 807 + workOrGroup.x * 0.28)),
    y: Math.max(0, Math.min(800, 230 + workOrGroup.y * 0.3)),
  };
}
```

- [ ] **Step 4: Wire filters, search, result count, and empty state**

Use native `<button>`, `<select>`, and `<input type="search">`. Every input
updates one state field and calls `render()`. `render()` must:

1. compute `visibleWorks`;
2. clear the selected ID if the selected work is no longer visible;
3. render site markers;
4. update `当前显示 N 件作品`;
5. show the empty state and clear button when `N === 0`;
6. otherwise render the selected work or the instructional empty panel.

- [ ] **Step 5: Serve and verify the filter matrix**

Run:

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173/art-history-map.html` and verify:

```text
All = 27
Egypt = 9
Greece = 10
Rome = 8
Impossible query = 0 + clear-filters button
Clear filters = 27 + overview state
```

- [ ] **Step 6: Commit the layout and discovery interactions**

```bash
git add art-history-map.html
git commit -m "feat: render and filter art history map"
```

### Task 4: Implement Map Selection, Zoom, Pan, and Site Cycling

**Files:**
- Modify: `art-history-map.html`

- [ ] **Step 1: Define bounded transform tests**

Add development assertions:

```js
function clampTransform({ x, y, scale }) {
  const boundedScale = Math.min(3, Math.max(1, scale));
  const minimumX = 1600 * (1 - boundedScale);
  const minimumY = 800 * (1 - boundedScale);
  return {
    scale: boundedScale,
    x: Math.min(0, Math.max(minimumX, x)),
    y: Math.min(0, Math.max(minimumY, y)),
  };
}
console.assert(clampTransform({ x: 0, y: 0, scale: 9 }).scale === 3);
console.assert(clampTransform({ x: 0, y: 0, scale: 0 }).scale === 1);
```

- [ ] **Step 2: Implement marker selection and site cycling**

Store:

```js
const state = {
  civilization: 'all',
  period: 'all',
  workType: 'all',
  query: '',
  selectedId: null,
  selectedSiteIndex: 0,
  transform: { x: 0, y: 0, scale: 1 },
};
```

Clicking or pressing Enter/Space on a marker sets the site's first work unless
that marker is already active. Previous/next buttons wrap within the site's
visible works. Active marker styling uses both size and a white focus ring,
not colour alone.

- [ ] **Step 3: Implement zoom, pointer pan, and overview reset**

Use buttons for `+`, `−`, and `全景`. Apply transform only to a dedicated SVG
`<g id="mapViewport">`. Pointer pan starts only on the map background, uses
pointer capture, clamps after every move, and does not steal marker clicks.
Overview reset sets `{x: 0, y: 0, scale: 1}`.

- [ ] **Step 4: Verify selection and navigation**

In the browser:

- activate a single-work marker by mouse and keyboard;
- activate a multi-work site and cycle through all works;
- zoom to 3x, pan to every edge, and confirm land remains reachable;
- reset to overview;
- filter out the selected work and confirm selection clears;
- confirm the active marker remains visible while the detail panel scrolls.

- [ ] **Step 5: Commit map interaction**

```bash
git add art-history-map.html
git commit -m "feat: add art map navigation and site selection"
```

### Task 5: Implement the Detail Panel, Comparisons, and Image Lightbox

**Files:**
- Modify: `art-history-map.html`

- [ ] **Step 1: Add safe text and fallback helpers**

Do not inject source content as HTML. Use `textContent` for all dataset fields:

```js
function setText(parent, selector, value) {
  const node = parent.querySelector(selector);
  node.textContent = value;
}

function installImageFallback(image, work) {
  image.addEventListener('error', () => {
    const fallback = document.createElement('div');
    fallback.className = 'image-fallback';
    fallback.textContent = work.titleEn;
    image.replaceWith(fallback);
  }, { once: true });
}
```

- [ ] **Step 2: Render identity content and four tabs**

Render image, AP number, civilisation, period, titles, date, artist/culture,
medium, site qualifier, and function. Tabs are buttons with:

```html
role="tab"
aria-selected="true|false"
aria-controls="detail-tabpanel"
```

The four panels are:

- Quick Review: function plus recognition anchors.
- Form: form plus content.
- Context: context plus content when it aids comprehension.
- Compare: linked cards from `comparisonIds`; clicking a card selects that
  work and its marker.

- [ ] **Step 3: Implement the accessible image dialog**

Use the native `<dialog>`. Opening fills the image, `#dialogTitle`, alt text,
caption, and source link, then calls `showModal()`. Close on:

- explicit close button;
- Escape via native dialog behavior;
- click where `event.target === imageDialog`.

Save the image trigger before opening and focus it after `close`.

- [ ] **Step 4: Verify failure and keyboard paths**

Temporarily set one image URL to `https://invalid.example/not-found.jpg` and
verify the named fallback appears while text remains usable. Revert before
commit. Verify Tab order, tab activation, dialog Escape, backdrop close,
source-link accessibility, and focus restoration.

- [ ] **Step 5: Commit the study panel**

```bash
git add art-history-map.html
git commit -m "feat: add artwork study panel and image viewer"
```

### Task 6: Integrate Art History into the Homepage

**Files:**
- Modify: `index.html:145-208`
- Modify: `index.html:307-336`
- Modify: `index.html:500-648`

- [ ] **Step 1: Record the current world-history baseline**

Before changing `index.html`, serve the project and record:

- world iframe loads;
- clicking a world marker updates `#home-events`;
- Today's Pick appears and navigates to a world marker;
- World subject pill is active;
- Art subject currently shows coming-soon.

This is the regression baseline.

- [ ] **Step 2: Add persistent world and art iframe containers**

Replace the single anonymous iframe with:

```html
<iframe
  id="worldMapFrame"
  class="subject-map-frame active"
  src="world-map.html"
  title="Interactive world history map"
  loading="lazy"></iframe>
<iframe
  id="artMapFrame"
  class="subject-map-frame"
  src="art-history-map.html"
  title="Interactive AP art history map"
  loading="lazy"></iframe>
```

Remove the `soon` badge from the Art History pill only. Keep the other three
coming-soon subjects unchanged.

- [ ] **Step 3: Isolate world-only DOM hooks**

Replace the generic iframe query with:

```js
const worldMapFrame = document.getElementById('worldMapFrame');
const artMapFrame = document.getElementById('artMapFrame');
const mapCard = document.querySelector('.map-card');
const mapCardHead = document.querySelector('.map-card-head');
```

Use `worldMapFrame` only in `collectEntries`, `renderTodayPick`,
`styleEmbeddedMap`, `syncHomeEvents`, and Today's Pick navigation. Do not run
world iframe DOM manipulation against `artMapFrame`.

- [ ] **Step 4: Make Art History a live subject**

Use:

```js
const SUBJECTS = {
  world: { label: 'World History', live: true, frame: worldMapFrame },
  art:   { label: 'Art History', live: true, frame: artMapFrame },
  euro:  { label: 'Euro History', soft: '#dbe4d2', ink: '#3f5230' },
  us:    { label: 'US History', soft: '#f7e0e1', ink: '#8a3540' },
  geo:   { label: 'Human Geography', soft: '#dbe7f0', ink: '#2f5678' },
};
```

In `selectSubject(key)`:

- toggle `.active` on both persistent iframes;
- set `mapCard.dataset.subject = key`;
- show `homeEvents` and Today's Pick only for World;
- hide `homeEvents` for Art and allow the art iframe to occupy full width;
- set heading to `History World Map` or `AP Art History Map`;
- retain coming-soon behavior for Euro, US, and Human Geo;
- show the skeleton until the selected live frame has fired `load`, with a
  bounded timeout that reveals a retry button if it does not.

- [ ] **Step 5: Add art-mode CSS**

```css
.subject-map-frame { display: none; width: 100%; height: 100%; border: 0; }
.subject-map-frame.active { display: block; }
.map-card[data-subject="art"] .home-map-wrap {
  flex-basis: 100%;
  border-right: 0;
}
.map-card[data-subject="art"] .home-events { display: none; }
```

On mobile, retain the art iframe's internal 520px breakpoint; do not add a
second homepage rule that moves its detail panel.

- [ ] **Step 6: Verify repeated switching and iframe state**

Select a world marker, switch to Art, select and filter an artwork, switch back
to World, and then back to Art. Both iframes remain mounted throughout.
Confirm:

- world event selection remains;
- art selection and filters remain;
- each iframe keeps its independent zoom and pan state;
- Today's Pick is hidden only in Art mode;
- Art never receives world iframe style mutations;
- Euro, US, and Human Geo still show coming-soon;
- no console errors appear.

- [ ] **Step 7: Commit integration**

```bash
git add index.html
git commit -m "feat: add art history subject to homepage"
```

### Task 7: Full Verification and Handoff

**Files:**
- Modify if needed: `art-history-map.html`
- Modify if needed: `index.html`
- Modify: `docs/art-history-sources.md`

- [ ] **Step 1: Run automated validation**

```bash
git diff --check
node --test tests/art-history-data.test.mjs
node scripts/validate-art-history-data.mjs art-history-map.html
```

Expected: no whitespace errors, all tests pass, and 27 works validate.

- [ ] **Step 2: Verify responsive layout at exact widths**

Using browser viewport overrides, verify:

```text
1200px: side-by-side map/detail
652px: side-by-side map/detail
519px: stacked map/detail
390px: stacked, no horizontal overflow
```

At each width, verify filters, a marker, a detail tab, and the lightbox. At
652px assert the detail panel's x-coordinate is greater than the map panel's
x-coordinate.

- [ ] **Step 3: Verify accessibility and degraded states**

- keyboard-only path from filters to marker, detail tabs, comparison, image,
  dialog, and source link;
- visible focus at every step;
- reduced-motion override removes meaningful animation;
- invalid image produces the named fallback;
- no-results state clears correctly;
- iframe load failure presents Retry.

- [ ] **Step 4: Verify source ledger completeness**

Search:

```bash
rg -n 'TBD|TODO|FIXME|pending|example.invalid' \
  art-history-map.html docs/art-history-sources.md
```

Expected: no output.

- [ ] **Step 5: Run the world-history regression**

Repeat the Task 6 baseline. Confirm `world-map.html` has no diff:

```bash
git diff --exit-code HEAD -- world-map.html
```

Expected: exit code 0 relative to the execution branch's starting snapshot.
If the branch began with the user's uncommitted `world-map.html` changes,
compare against that saved starting blob instead of `HEAD`; do not revert or
commit the user's pre-existing edits.

- [ ] **Step 6: Review final status and commit verification-only fixes**

```bash
git status --short
git diff --check
```

If verification required code changes, commit only the files changed for this
feature:

```bash
git add art-history-map.html index.html scripts/validate-art-history-data.mjs \
  tests/art-history-data.test.mjs docs/art-history-sources.md
git commit -m "fix: complete art history map verification"
```

- [ ] **Step 7: Prepare the user handoff**

Report:

- files created and modified;
- exact 27-work validation result;
- automated test output;
- tested viewport widths;
- world-history regression result;
- any external image-source limitations;
- the local entry pages for `index.html` and `art-history-map.html`.
