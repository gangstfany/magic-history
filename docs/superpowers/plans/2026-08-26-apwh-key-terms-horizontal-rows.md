# APWH Key Terms Horizontal Rows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the narrow two-card Key Terms grid with full-width rows whose term and definition read horizontally, while retaining an overflow-safe stacked fallback for exceptionally narrow components.

**Architecture:** Keep the existing semantic `<dl>` renderer and disclosure behavior unchanged. Turn the outer Key Terms list into a one-column row stack, make each generated `<div>` a two-column term/definition row, and use a named inline-size container query on the list so only genuinely narrow components stack their row contents.

**Tech Stack:** Static HTML/CSS, Node.js test runner, Playwright browser verification, CSS container queries.

---

### Task 1: Specify horizontal rows in the browser verifier

**Files:**
- Modify: `scripts/verify-world-timeline.mjs:551-556`
- Modify: `scripts/verify-world-timeline.mjs:2749-2806`

- [ ] **Step 1: Add a reusable layout reader**

Add this helper near the existing browser-metric helpers in `scripts/verify-world-timeline.mjs`:

```js
async function keyTermLayout(locator) {
  return locator.evaluate(grid => {
    const row = grid.querySelector(':scope > div');
    const term = row.querySelector('dt');
    const definition = row.querySelector('dd');
    const rowStyle = getComputedStyle(row);
    const termBox = term.getBoundingClientRect();
    const definitionBox = definition.getBoundingClientRect();
    return {
      rowCount: grid.children.length,
      listColumns: getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
      rowColumns: rowStyle.gridTemplateColumns.split(/\s+/).filter(Boolean).length,
      termRight: termBox.right,
      termBottom: termBox.bottom,
      definitionLeft: definitionBox.left,
      definitionTop: definitionBox.top,
      listClient: grid.clientWidth,
      listScroll: grid.scrollWidth,
    };
  });
}
```

- [ ] **Step 2: Replace the standalone two-card assertion with the approved row contract**

After opening the standalone Key Terms disclosure, replace the existing outer-grid column assertion with:

```js
const standaloneTermGrid = firstStudyDetail.locator('.location-study-term-grid');
const standaloneTermLayout = await keyTermLayout(standaloneTermGrid);
assert.equal(standaloneTermLayout.rowCount, 2,
  'standalone Key Terms must render one row for each of the two terms');
assert.equal(standaloneTermLayout.listColumns, 1,
  'standalone Key Terms must stack full-width term rows');
assert.equal(standaloneTermLayout.rowColumns, 2,
  'standalone Key Terms rows must place term and definition in separate columns');
assert.ok(standaloneTermLayout.definitionLeft >= standaloneTermLayout.termRight,
  `standalone term definition must sit to the right of its term: ${JSON.stringify(standaloneTermLayout)}`);
assert.ok(standaloneTermLayout.listScroll <= standaloneTermLayout.listClient + 1,
  `standalone Key Terms must not overflow horizontally: ${JSON.stringify(standaloneTermLayout)}`);
```

- [ ] **Step 3: Replace homepage desktop and narrow assertions with component-aware checks**

After opening homepage Key Terms at desktop width, replace `desktopTermColumns` with:

```js
const homeTermGrid = homeProgressiveDetail.locator('.location-study-term-grid');
const desktopTermLayout = await keyTermLayout(homeTermGrid);
assert.equal(desktopTermLayout.rowCount, 2,
  'desktop homepage Key Terms must render one row for each of the two terms');
assert.equal(desktopTermLayout.listColumns, 1,
  'desktop homepage Key Terms must stack full-width term rows');
assert.equal(desktopTermLayout.rowColumns, 2,
  'desktop homepage Key Terms rows must place term and definition in separate columns');
assert.ok(desktopTermLayout.definitionLeft >= desktopTermLayout.termRight,
  `desktop homepage definition must sit to the right of its term: ${JSON.stringify(desktopTermLayout)}`);
```

At the 540-pixel viewport, replace the old `narrowTermLayout` block with row geometry plus the original four overflow boundaries:

```js
const narrowTermLayout = await keyTermLayout(homeTermGrid);
assert.equal(narrowTermLayout.listColumns, 1,
  `540px homepage Key Terms must retain full-width rows: ${JSON.stringify(narrowTermLayout)}`);
assert.equal(narrowTermLayout.rowColumns, 2,
  `540px homepage rows must remain horizontal when the component has room: ${JSON.stringify(narrowTermLayout)}`);
assert.ok(narrowTermLayout.definitionLeft >= narrowTermLayout.termRight,
  `540px homepage definition must remain to the right: ${JSON.stringify(narrowTermLayout)}`);
const narrowOverflow = await homeProgressiveDetail.locator('.location-study-term-grid').evaluate(grid => ({
  gridClient: grid.clientWidth,
  gridScroll: grid.scrollWidth,
  detailClient: grid.closest('[data-study-detail]').clientWidth,
  detailScroll: grid.closest('[data-study-detail]').scrollWidth,
  panelClient: document.querySelector('#home-events').clientWidth,
  panelScroll: document.querySelector('#home-events').scrollWidth,
  pageClient: document.documentElement.clientWidth,
  pageScroll: document.documentElement.scrollWidth,
}));
assert.ok(narrowOverflow.gridScroll <= narrowOverflow.gridClient + 1
    && narrowOverflow.detailScroll <= narrowOverflow.detailClient + 1
    && narrowOverflow.panelScroll <= narrowOverflow.panelClient + 1
    && narrowOverflow.pageScroll <= narrowOverflow.pageClient + 1,
  `540px homepage progressive detail must not overflow: ${JSON.stringify(narrowOverflow)}`);
```

- [ ] **Step 4: Add a deliberately narrow component-query assertion**

After the 540-pixel assertions, first constrain the component to the screenshot-like 260-pixel width and confirm it remains horizontal; then reduce it below the fallback threshold:

```js
await homeTermGrid.evaluate(grid => { grid.style.width = '260px'; });
await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const compactHorizontalLayout = await keyTermLayout(homeTermGrid);
assert.equal(compactHorizontalLayout.rowColumns, 2,
  `a 260px Key Terms component must keep term and definition horizontal: ${JSON.stringify(compactHorizontalLayout)}`);
assert.ok(compactHorizontalLayout.definitionLeft >= compactHorizontalLayout.termRight,
  `a compact definition must remain to the right of its term: ${JSON.stringify(compactHorizontalLayout)}`);
await homeTermGrid.evaluate(grid => { grid.style.width = '220px'; });
await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const constrainedTermLayout = await keyTermLayout(homeTermGrid);
assert.equal(constrainedTermLayout.rowColumns, 1,
  `a 220px Key Terms component must stack term above definition: ${JSON.stringify(constrainedTermLayout)}`);
assert.ok(constrainedTermLayout.definitionTop >= constrainedTermLayout.termBottom,
  `a constrained definition must render below its term: ${JSON.stringify(constrainedTermLayout)}`);
assert.ok(constrainedTermLayout.listScroll <= constrainedTermLayout.listClient + 1,
  `a constrained Key Terms component must not overflow: ${JSON.stringify(constrainedTermLayout)}`);
await homeTermGrid.evaluate(grid => { grid.style.width = ''; });
```

- [ ] **Step 5: Run the browser verifier and confirm RED**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: FAIL at the first new horizontal-row assertion because the shipped outer Key Terms list still renders two columns and its child rows are not CSS grids.

### Task 2: Implement the row layout in both render surfaces

**Files:**
- Modify: `world-map.html:429-445`
- Modify: `index.html:504-520`
- Test: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Replace the standalone Key Terms layout rules**

In `world-map.html`, replace the current `.location-study-term-grid` rule and add row-specific rules:

```css
.location-study-term-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; min-width: 0; container: study-terms / inline-size; }
.location-study-term-grid > div { display: grid; grid-template-columns: minmax(105px, .42fr) minmax(0, 1fr); gap: 14px; align-items: start; }
.location-study-term-grid > div, .location-study-people > div { min-width: 0; padding: 9px 10px; border: 1px solid #e2d4c4; border-radius: 7px; background: #fffdf8; }
.location-study-term-grid dt { min-width: 0; overflow-wrap: anywhere; }
.location-study-term-grid dd { margin-top: 0; }
@container study-terms (max-width: 230px) {
  .location-study-term-grid > div { grid-template-columns: minmax(0, 1fr); gap: 4px; }
}
```

Remove `.location-study-term-grid { grid-template-columns: minmax(0, 1fr); }` from the existing `@media (max-width: 560px)` block because the named container query now owns the fallback.

- [ ] **Step 2: Mirror the exact row contract on the homepage**

In `index.html`, apply the same structure with the existing `.home-events` scope:

```css
.home-events .location-study-term-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; min-width: 0; container: study-terms / inline-size; }
.home-events .location-study-term-grid > div { display: grid; grid-template-columns: minmax(105px, .42fr) minmax(0, 1fr); gap: 14px; align-items: start; }
.home-events .location-study-term-grid > div, .home-events .location-study-people > div { min-width: 0; padding: 9px 10px; border: 1px solid #e2d4c4; border-radius: 7px; background: #fffdf8; }
.home-events .location-study-term-grid dt { min-width: 0; overflow-wrap: anywhere; }
.home-events .location-study-term-grid dd { margin-top: 0; }
@container study-terms (max-width: 230px) {
  .home-events .location-study-term-grid > div { grid-template-columns: minmax(0, 1fr); gap: 4px; }
}
```

Remove the homepage `.location-study-term-grid` override from its existing `@media (max-width: 560px)` block.

- [ ] **Step 3: Run the targeted browser verifier and confirm GREEN**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: `AP World Timeline browser verification passed` with exit code 0.

- [ ] **Step 4: Commit the tested layout change**

```bash
git add scripts/verify-world-timeline.mjs world-map.html index.html
git commit -m "style: lay out APWH key terms horizontally"
```

### Task 3: Complete regression and visual verification

**Files:**
- Verify: `world-map.html`
- Verify: `index.html`
- Verify: `scripts/verify-world-timeline.mjs`
- Verify: `tests/apwh-u1-location-study.test.mjs`
- Verify: `tests/apush-data.test.mjs`

- [ ] **Step 1: Run the complete automated suite**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u1-location-study.test.mjs tests/apush-data.test.mjs
git diff --check
```

Expected: browser verification passes; all 73 Node tests pass with 0 failures; `git diff --check` prints nothing.

- [ ] **Step 2: Visually inspect both render surfaces**

Reload `http://127.0.0.1:8765/`, select Unit 1, open a location study detail, and expand **Key Terms**. Confirm that the homepage mirror shows full-width rows with the term on the left and definition on the right, with no clipped or one-word-per-line definition text.

Open `http://127.0.0.1:8765/world-map.html`, repeat the same check in the standalone event panel, and temporarily narrow the browser until the component fallback places the term above the definition without horizontal overflow.

- [ ] **Step 3: Record any verification-only adjustment**

If visual inspection requires a CSS correction within the approved design, first add an assertion reproducing that exact defect to `scripts/verify-world-timeline.mjs`, run it to confirm RED, make the smallest CSS correction in both `world-map.html` and `index.html`, rerun the complete suite, and commit with:

```bash
git add scripts/verify-world-timeline.mjs world-map.html index.html
git commit -m "fix: preserve readable key term rows"
```

If no correction is required, leave the working tree unchanged after Task 2.
