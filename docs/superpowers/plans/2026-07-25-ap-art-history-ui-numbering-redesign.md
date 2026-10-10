# AP Art History UI and AP Numbering Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the Art History map to the existing World History UI, show complete artwork images with English-first titles, and replace count-based site markers with expandable AP-number markers that can scale to the 250-work curriculum.

**Architecture:** Keep the existing single-file, data-driven `art-history-map.html` structure and its immutable 27-work JSON. Add presentation classes for World History typography and image containment, then introduce pure AP-label and expansion helpers on top of the existing site grouping and collision layout. Site groups display compact AP number ranges; activating a multi-work group expands deterministic individual AP pins that select exact artworks.

**Tech Stack:** HTML, CSS, vanilla JavaScript, inline SVG, Node.js `node:test`, local browser verification.

---

## File map

- Modify: `art-history-map.html` — typography, detail hierarchy, image fitting, AP-number group markers, expanded individual pins, selection state.
- Create: `tests/art-history-ui-numbering.test.mjs` — UI-token, title-order, image-fit, AP-label, expansion, and exact-selection regressions.
- Modify: `docs/superpowers/specs/2026-07-25-ap-art-history-ui-numbering-redesign.md` only if implementation reveals a contradiction; otherwise leave the approved spec unchanged.
- Do not modify: `world-map.html` or the embedded `artwork-data` JSON.

### Task 1: Match World History typography and artwork detail hierarchy

**Files:**
- Modify: `art-history-map.html:7-100`
- Modify: `art-history-map.html:770-820`
- Create: `tests/art-history-ui-numbering.test.mjs`

- [ ] **Step 1: Write the failing typography and title-order test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const loadHtml = () => readFile(HTML_PATH, 'utf8');

test('art map reuses World History typography and compact detail hierarchy', async () => {
  const html = await loadHtml();
  assert.match(
    html,
    /font-family:\s*"PingFang SC",\s*"Hiragino Sans GB",\s*-apple-system,\s*"Helvetica Neue",\s*sans-serif/,
  );
  assert.match(html, /heading\.className = 'work-title-en'/);
  assert.match(html, /heading\.textContent = work\.titleEn/);
  assert.match(html, /chineseTitle\.className = 'work-title-zh'/);
  assert.match(html, /chineseTitle\.textContent = work\.titleZh/);
  assert.ok(
    html.indexOf("heading.textContent = work.titleEn")
      < html.indexOf("chineseTitle.textContent = work.titleZh"),
    'English title must be created before the Chinese subtitle',
  );
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --test tests/art-history-ui-numbering.test.mjs
```

Expected: FAIL because the page still uses serif typography and assigns `titleZh` to the `h2`.

- [ ] **Step 3: Implement the World History visual tokens**

Replace the body typography and add compact detail classes:

```css
html, body {
  font-family: "PingFang SC", "Hiragino Sans GB", -apple-system, "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
}
.page-header h1 { font-size:19px; font-weight:800; letter-spacing:-.01em; }
.subtitle { font-size:12px; line-height:1.6; }
.result-count { font-size:12px; color:var(--ink-soft); }
.work-title-en { margin:0; font-size:22px; line-height:1.2; font-weight:800; letter-spacing:-.01em; }
.work-title-zh { margin:0; font-size:14px; line-height:1.5; font-weight:600; color:var(--ink-soft); }
.work-meta { font-size:12px; font-weight:600; }
```

Use the same warm variables as `world-map.html`:

```css
:root {
  --ink:#211f1c;
  --ink-soft:#6b6558;
  --ink-faint:#9b9382;
  --paper:#f9f4e8;
  --card:#fffdf8;
  --line:#e7dcc6;
  --line-strong:#d8c9a8;
  --accent:#8b1a1a;
}
```

- [ ] **Step 4: Reverse the title hierarchy in `renderArtworkDetails()`**

```js
const heading = document.createElement('h2');
heading.className = 'work-title-en';
heading.tabIndex = -1;
heading.dataset.selectedArtworkTitle = '';
heading.textContent = work.titleEn;

const chineseTitle = document.createElement('p');
chineseTitle.className = 'work-title-zh';
chineseTitle.textContent = work.titleZh;

summary.append(heading, chineseTitle, meta, imageButton, imageCredit, identity);
```

Update image-button and dialog accessible labels to include the English title first:

```js
imageButton.setAttribute('aria-label', `Open ${work.titleEn}（${work.titleZh}）大图`);
```

- [ ] **Step 5: Run the new test and the existing detail suite**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --test tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add art-history-map.html tests/art-history-ui-numbering.test.mjs
git commit -m "style: align art map with world history UI"
```

### Task 2: Show the complete artwork image

**Files:**
- Modify: `art-history-map.html:40-50`
- Modify: `tests/art-history-ui-numbering.test.mjs`

- [ ] **Step 1: Write the failing image-containment regression**

Append:

```js
test('detail images show the complete artwork without cover cropping', async () => {
  const html = await loadHtml();
  assert.match(
    html,
    /\.artwork-image-button img\s*\{[^}]*object-fit:\s*contain/s,
  );
  assert.doesNotMatch(
    html,
    /\.artwork-image-button img\s*\{[^}]*object-fit:\s*cover/s,
  );
  assert.match(html, /\.artwork-image-button\s*\{[^}]*background:\s*var\(--surface-sunken\)/s);
});
```

- [ ] **Step 2: Run the image test and verify RED**

Run the new test file. Expected: FAIL because the detail image still uses `object-fit:cover`.

- [ ] **Step 3: Implement complete-image presentation**

```css
.artwork-image-button {
  display:grid;
  place-items:center;
  width:100%;
  min-height:180px;
  max-height:300px;
  padding:10px;
  overflow:hidden;
  border:1px solid var(--line-strong);
  border-radius:10px;
  background:var(--surface-sunken);
}
.artwork-image-button img {
  display:block;
  width:100%;
  height:280px;
  object-fit:contain;
  object-position:center;
}
```

Add `--surface-sunken:#f2e9d8` to the root variables. Keep the dialog image on `contain`.

- [ ] **Step 4: Run tests and inspect Old Market Woman**

Run the new test and existing image-dialog tests. Then select AP #41 in the browser and verify that the head and full vertical sculpture visible in the source are visible in the detail image.

- [ ] **Step 5: Commit Task 2**

```bash
git add art-history-map.html tests/art-history-ui-numbering.test.mjs
git commit -m "fix: show complete artwork images"
```

### Task 3: Replace count markers with AP-number group labels

**Files:**
- Modify: `art-history-map.html:390-930`
- Modify: `tests/art-history-ui-numbering.test.mjs`

- [ ] **Step 1: Write failing pure-label and marker-identity tests**

Append:

```js
test('map labels groups with compact AP number ranges instead of work counts', async () => {
  const html = await loadHtml();
  assert.match(html, /function compactApNumbers\(numbers\)/);
  assert.match(html, /function formatApGroupLabel\(works\)/);
  assert.match(html, /works\.map\(\(work\) => work\.apNumber\)/);
  assert.match(html, /marker-label-bg/);
  assert.match(html, /marker-ap-label/);
  assert.doesNotMatch(html, /count\.textContent = group\.works\.length/);
});

test('multi-work sites expand to exact AP-number pins', async () => {
  const html = await loadHtml();
  assert.match(html, /expandedSiteKey:/);
  assert.match(html, /function expandSiteGroup\(/);
  assert.match(html, /function renderExpandedWorkPins\(/);
  assert.match(html, /work\.apNumber/);
  assert.match(html, /selectArtwork\(work\.id/);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Expected: FAIL because markers still render `group.works.length` and site selection cycles ambiguously.

- [ ] **Step 3: Add AP-number range helpers**

```js
function compactApNumbers(numbers) {
  const sorted = [...new Set(numbers)].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let previous = sorted[0];
  for (const value of sorted.slice(1)) {
    if (value === previous + 1) {
      previous = value;
      continue;
    }
    ranges.push(start === previous ? `${start}` : `${start}–${previous}`);
    start = previous = value;
  }
  if (start !== undefined) ranges.push(start === previous ? `${start}` : `${start}–${previous}`);
  return ranges.join(', ');
}

function formatApGroupLabel(works) {
  return `AP ${compactApNumbers(works.map((work) => work.apNumber))}`;
}
```

Development assertions:

```js
assert(compactApNumbers([35, 39, 40]) === '35, 39–40', 'non-contiguous AP ranges');
assert(compactApNumbers([41, 42, 43, 44, 45, 46, 47]) === '41–47', 'contiguous AP range');
```

- [ ] **Step 4: Render group labels as AP-number capsules**

For each site group, render a rounded SVG label whose text is `formatApGroupLabel(group.works)`. Single-work groups may remain circular but must display the AP number, never `1`.

```js
const label = document.createElementNS(SVG_NS, 'text');
label.classList.add('marker-ap-label');
label.textContent = group.works.length === 1
  ? `${group.works[0].apNumber}`
  : compactApNumbers(group.works.map((work) => work.apNumber));
```

The accessible name must include the site, compact AP ranges, and English titles:

```js
const titles = group.works.map((work) => work.titleEn).join('、');
marker.setAttribute(
  'aria-label',
  `${group.siteName}；${formatApGroupLabel(group.works)}；${titles}`,
);
```

- [ ] **Step 5: Run the tests and existing marker tests**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --test tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
```

Expected: all tests PASS after updating the former count-label assertion to require AP numbers and English titles.

- [ ] **Step 6: Commit AP group labels**

```bash
git add art-history-map.html tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
git commit -m "feat: label art map groups with AP numbers"
```

### Task 4: Expand multi-work sites into individual AP pins

**Files:**
- Modify: `art-history-map.html:390-1010`
- Modify: `tests/art-history-ui-numbering.test.mjs`

- [ ] **Step 1: Add expansion state and deterministic radial layout**

Extend state:

```js
expandedSiteKey: null,
```

Add:

```js
function expandedPinPositions(group, center, radius = 56) {
  return group.works.map((work, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index / group.works.length);
    return {
      work,
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  });
}
```

- [ ] **Step 2: Implement group activation and exact selection**

```js
function expandSiteGroup(group) {
  if (group.works.length === 1) {
    selectArtwork(group.works[0].id, group.key);
    return;
  }
  state.expandedSiteKey = state.expandedSiteKey === group.key ? null : group.key;
  render();
}

function selectArtwork(workId, siteKey) {
  state.selectedId = workId;
  state.selectedSiteIndex = 0;
  state.expandedSiteKey = siteKey;
  state.activeDetailTab = 'quick';
  render();
}
```

Group click and Enter/Space call `expandSiteGroup(group)`. An individual pin calls `selectArtwork(work.id, group.key)` and uses:

```js
pin.setAttribute('aria-label', `AP ${work.apNumber} · ${work.titleEn} · ${group.siteName}`);
```

- [ ] **Step 3: Render leader lines and individual numbered pins**

`renderExpandedWorkPins(group, center)` draws:

1. A leader line from each radial pin to the geographic/group center.
2. A circular button pin.
3. A centered text label containing `work.apNumber`.
4. Active styling if `state.selectedId === work.id`.

Use `vector-effect:non-scaling-stroke`, preserve keyboard activation, and keep the radial positions deterministic across renders.

- [ ] **Step 4: Close incompatible expansions**

Clear `expandedSiteKey` when:

- filters remove the expanded site,
- search returns no works at that site,
- the user activates a different group,
- “清除筛选” restores overview.

Preserve it during zoom and pan. At `scale >= 2`, the renderer may show expanded pins for the selected group, but must not automatically expand every site.

- [ ] **Step 5: Run all tests**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --test tests/*.test.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  scripts/validate-art-history-data.mjs art-history-map.html
```

Expected: all tests PASS and validator prints `Validated 27 AP Art History works`.

- [ ] **Step 6: Commit expansion behavior**

```bash
git add art-history-map.html tests/art-history-ui-numbering.test.mjs
git commit -m "feat: expand art sites into AP-number pins"
```

### Task 5: Responsive, browser, and homepage regression verification

**Files:**
- Modify only if verification reveals a regression:
  - `art-history-map.html`
  - `tests/art-history-ui-numbering.test.mjs`

- [ ] **Step 1: Verify desktop behavior**

At `http://localhost:4173/art-history-map.html`:

- typography matches `world-map.html`,
- English title is larger than Chinese title,
- AP #41 image includes the head,
- all filters still report 27 / 9 / 10 / 8,
- Athens, Pompeii, Giza, and Rome show AP-number ranges rather than counts,
- activating Rome expands pins AP 41–47,
- selecting AP 41 opens Old Market Woman directly,
- zoom, pan, comparison, tabs, lightbox, credits, and clear-filter overview still work.

- [ ] **Step 2: Verify 390 px behavior**

Set a 390 × 844 viewport:

- no horizontal overflow,
- image uses `contain`,
- detail panel remains below the map,
- expanded AP pins remain selectable by touch and keyboard,
- group labels do not overlap the zoom controls.

- [ ] **Step 3: Verify homepage embedding**

At `http://localhost:4173/index.html`:

- World and Art iframe sources remain unchanged,
- switching subjects preserves both maps’ state,
- Art caption remains accurate,
- the embedded Art map uses the updated typography and AP labels,
- `world-map.html` has no diff.

- [ ] **Step 4: Run final automated verification**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --test tests/*.test.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  scripts/validate-art-history-data.mjs art-history-map.html
git diff --check
git diff --name-only 74db500..HEAD -- world-map.html
```

Expected: all tests PASS, 27 works validate, diff check is empty, and `world-map.html` is absent from the changed-file output.

- [ ] **Step 5: Commit any verification-only correction**

If browser verification required a correction:

```bash
git add art-history-map.html tests/art-history-ui-numbering.test.mjs
git commit -m "fix: polish AP-number map presentation"
```

If no correction was required, do not create an empty commit.

### Task 6: Sync the approved result to the Desktop project

**Files:**
- Source: `/Users/tiffanyxu/Documents/New project/考前冲刺_地区专题_试做版/`
- Destination: `/Users/tiffanyxu/Desktop/APWH/考前冲刺_地区专题_试做版/`

- [ ] **Step 1: Confirm the Desktop baseline has not diverged**

Compare `index.html`, `art-history-map.html`, and `world-map.html` with the last synchronized state. Stop if Desktop contains new overlapping edits.

- [ ] **Step 2: Back up the current Desktop Art map**

Copy `art-history-map.html` to:

```text
.codex-backups/art-history-map.before-ui-numbering-redesign.html
```

- [ ] **Step 3: Sync only changed redesign files**

Sync:

- `art-history-map.html`
- `tests/art-history-ui-numbering.test.mjs`
- the approved redesign spec and plan

Do not copy or rewrite `world-map.html`.

- [ ] **Step 4: Verify from the Desktop directory**

Run all tests and the validator from the Desktop project. Point the local preview server at the Desktop directory and repeat the AP #41 and 390 px checks.
