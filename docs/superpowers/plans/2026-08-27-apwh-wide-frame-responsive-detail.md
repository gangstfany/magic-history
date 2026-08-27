# APWH Wide Frame and Responsive Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Widen the APWH desktop application frame and contextual panel while making Key Terms stack before their two-column text becomes unreadable.

**Architecture:** Keep the existing single-page HTML/CSS architecture and change only responsive layout rules. `index.html` owns the outer application and homepage split; `world-map.html` mirrors the Key Terms component rule; `scripts/verify-world-timeline.mjs` remains the executable layout contract for both render locations.

**Tech Stack:** HTML, CSS Grid, CSS container queries, vanilla JavaScript, Node.js test runner, Playwright-based browser verification.

---

## File Structure

- Modify `scripts/verify-world-timeline.mjs`: specify the wider shell, bounded detail width, `1050px` stacking breakpoint, and `300px` Key Terms container threshold.
- Modify `index.html`: widen the application card, reduce outer padding, change the APWH desktop split, add the intermediate APWH-only stacking query, and raise the homepage Key Terms threshold.
- Modify `world-map.html`: raise the standalone Key Terms container threshold to match the homepage copy.

No data file, rendering function, markup structure, or learner-facing copy changes.

### Task 1: Specify the responsive layout contract

**Files:**
- Modify: `scripts/verify-world-timeline.mjs:180-350`
- Modify: `scripts/verify-world-timeline.mjs:2670-2920`
- Modify: `scripts/verify-world-timeline.mjs:3190-3280`

- [ ] **Step 1: Update the component-width test helper**

Replace the two forced widths in `assertComponentAwareKeyTermLayout` so the test expresses the approved `300px` threshold:

```js
async function assertComponentAwareKeyTermLayout(page, locator, label) {
  const originalInlineWidth = await locator.evaluate(grid => grid.style.width);
  try {
    await locator.evaluate(grid => { grid.style.width = '320px'; });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assertHorizontalKeyTermLayout(await keyTermLayout(locator), `320px ${label}`);

    await locator.evaluate(grid => { grid.style.width = '300px'; });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assertStackedKeyTermLayout(await keyTermLayout(locator), `300px ${label}`);
  } finally {
    await locator.evaluate((grid, width) => { grid.style.width = width; }, originalInlineWidth);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
}
```

- [ ] **Step 2: Make embedded-layout settling use the new host breakpoint**

Inside `waitForEmbeddedWorldLayout`, replace the host adjacency condition:

```js
const narrow = options.expectedViewportWidth <= 1050;
```

Do not change the separately supplied `expectedMapZoneHeight`; it describes the iframe's internal map height, not the homepage column breakpoint.

- [ ] **Step 3: Strengthen the 1440px desktop geometry assertion**

Extend `desktopWorkspace` in `verifyHomeLearningShell` to return exact shell, frame, map, and panel geometry:

```js
const desktopWorkspace = await page.locator('.map-card[data-subject="world"]').evaluate(card => {
  const frameStyle = getComputedStyle(document.querySelector('.frame'));
  const shell = card.closest('.card').getBoundingClientRect();
  const module = card.getBoundingClientRect();
  const canvas = card.querySelector('.home-map-wrap').getBoundingClientRect();
  const panel = card.querySelector('#home-events').getBoundingClientRect();
  const panelStyle = getComputedStyle(card.querySelector('#home-events'));
  return {
    shellWidth: shell.width,
    framePaddingInline: parseFloat(frameStyle.paddingLeft) + parseFloat(frameStyle.paddingRight),
    moduleShare: module.width / shell.width,
    canvasWidth: canvas.width,
    panelWidth: panel.width,
    canvasShare: canvas.width / (canvas.width + panel.width),
    equalHeight: Math.abs(canvas.height - panel.height) <= 1,
    panelOverflowY: panelStyle.overflowY,
  };
});
assert.ok(desktopWorkspace.shellWidth >= 1279 && desktopWorkspace.shellWidth <= 1281,
  `desktop application shell must honor the 1280px maximum: ${JSON.stringify(desktopWorkspace)}`);
assert.ok(desktopWorkspace.framePaddingInline >= 40 && desktopWorkspace.framePaddingInline <= 48,
  `desktop frame must retain 20-24px padding per side: ${JSON.stringify(desktopWorkspace)}`);
assert.ok(desktopWorkspace.moduleShare >= 0.96,
  `desktop APWH module must use the available Main width: ${JSON.stringify(desktopWorkspace)}`);
assert.ok(desktopWorkspace.panelWidth >= 380 && desktopWorkspace.panelWidth <= 430,
  `desktop APWH detail panel must remain within its readable bounds: ${JSON.stringify(desktopWorkspace)}`);
assert.ok(desktopWorkspace.canvasWidth > desktopWorkspace.panelWidth,
  `desktop APWH map must remain wider than its detail panel: ${JSON.stringify(desktopWorkspace)}`);
assert.ok(desktopWorkspace.canvasShare >= 0.64 && desktopWorkspace.canvasShare <= 0.68,
  `desktop APWH workspace must reserve about 66/34 for map and context: ${JSON.stringify(desktopWorkspace)}`);
assert.equal(desktopWorkspace.equalHeight, true,
  'desktop APWH map and contextual panel must share a bounded height');
assert.equal(desktopWorkspace.panelOverflowY, 'auto',
  'desktop APWH contextual panel must scroll independently');
```

- [ ] **Step 4: Add an exact breakpoint probe**

Immediately after the 1440px geometry assertions, verify both sides of the boundary and restore the desktop viewport:

```js
for (const probe of [
  { width: 1051, stacked: false },
  { width: 1050, stacked: true },
]) {
  await page.setViewportSize({ width: probe.width, height: 850 });
  await waitForEmbeddedWorldLayout(page, {
    viewportWidth: probe.width,
    mapZoneHeight: 500,
    timeout: 4_000,
  });
  const geometry = await page.evaluate(() => {
    const map = document.querySelector('.home-map-wrap').getBoundingClientRect();
    const panel = document.querySelector('#home-events').getBoundingClientRect();
    return {
      sideBySide: panel.x >= map.right - 1,
      stacked: panel.y >= map.bottom - 1,
      pageClient: document.documentElement.clientWidth,
      pageScroll: document.documentElement.scrollWidth,
    };
  });
  assert.equal(geometry.stacked, probe.stacked,
    `${probe.width}px host must ${probe.stacked ? '' : 'not '}stack map and detail: ${JSON.stringify(geometry)}`);
  assert.equal(geometry.sideBySide, !probe.stacked,
    `${probe.width}px host must ${probe.stacked ? 'not ' : ''}place detail beside the map: ${JSON.stringify(geometry)}`);
  assert.ok(geometry.pageScroll <= geometry.pageClient + 1,
    `${probe.width}px host must not overflow horizontally: ${JSON.stringify(geometry)}`);
}
await page.setViewportSize({ width: 1440, height: 900 });
await waitForEmbeddedWorldLayout(page, { viewportWidth: 1440, mapZoneHeight: 500 });
```

- [ ] **Step 5: Update later host-order expectations**

In the viewport loop near the end of `verifyHomeLearningShell`, change only the homepage adjacency comparison:

```js
assert.ok(iframeBox && panelBox && (viewport.width > 1050
  ? panelBox.x >= iframeBox.x + iframeBox.width - 1
  : panelBox.y >= iframeBox.y + iframeBox.height - 1),
`${viewport.width}px host: contextual panel must follow the Map and Timeline region`);
```

Keep the existing `mapZoneHeight: viewport.width <= 900 ? 300 : 500` expression because it verifies the iframe's own internal breakpoint.

- [ ] **Step 6: Run the browser verifier and confirm the new contract fails**

Run from an environment that permits binding `127.0.0.1`:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: FAIL before implementation, first reporting either that `300px` Key Terms remain horizontal or that the desktop shell is not `1280px` / the detail panel is outside `380–430px`.

- [ ] **Step 7: Commit the failing specification**

```bash
git add scripts/verify-world-timeline.mjs
git commit -m "test: specify wider APWH responsive frame"
```

### Task 2: Implement the approved CSS layout

**Files:**
- Modify: `index.html:51-57`
- Modify: `index.html:243-247`
- Modify: `index.html:504-513`
- Modify: `index.html:546-568`
- Modify: `world-map.html:429-438`

- [ ] **Step 1: Widen the outer application frame**

Replace the frame padding and card maximum in `index.html`:

```css
.frame {
  min-height: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: clamp(14px, 2vw, 24px);
}
.card {
  width: 100%; max-width: 1280px;
```

Leave the remainder of `.card` unchanged.

- [ ] **Step 2: Give APWH a bounded responsive detail column**

Replace the APWH desktop grid definition in `index.html`:

```css
.map-card[data-subject="world"] .map-events-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(380px, 34%, 430px);
}
```

- [ ] **Step 3: Add the APWH-only intermediate stacking range**

Insert this block immediately before the existing `@media (max-width: 900px)` block:

```css
/* At intermediate widths, preserve a readable APWH detail panel by stacking it below the map. */
@media (min-width: 901px) and (max-width: 1050px) {
  .map-card[data-subject="world"] .map-events-split {
    display: flex;
    flex-direction: column;
    height: auto;
    grid-template-columns: none;
  }
  .map-card[data-subject="world"] .home-map-wrap {
    flex: none;
    height: 300px;
    border-right: none;
    border-bottom: 1px solid var(--line);
  }
  .map-card[data-subject="world"] .home-events {
    flex: none;
    height: 46vh;
    overflow-y: auto;
  }
}
```

Leave the existing `@media (max-width: 900px)` rules intact so other subject layouts retain their current behavior.

- [ ] **Step 4: Raise the Key Terms container threshold in both render locations**

Change only the query width in `index.html` and `world-map.html`:

```css
@container study-terms (max-width: 300px) {
  .home-events .location-study-term-grid > div { grid-template-columns: minmax(0, 1fr); gap: 4px; }
}
```

```css
@container study-terms (max-width: 300px) {
  .location-study-term-grid > div { grid-template-columns: minmax(0, 1fr); gap: 4px; }
}
```

- [ ] **Step 5: Run the browser verifier and confirm the implementation passes**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: `AP World Timeline browser verification passed`.

- [ ] **Step 6: Commit the CSS implementation**

```bash
git add index.html world-map.html
git commit -m "style: widen APWH detail workspace"
```

### Task 3: Run full regression verification

**Files:**
- Verify: `tests/apush-data.test.mjs`
- Verify: `tests/apwh-u1-location-study.test.mjs`
- Verify: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Run all Node tests**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
```

Expected: `tests 73`, `pass 73`, `fail 0`.

- [ ] **Step 2: Run the full APWH browser verifier again from the final tree**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: `AP World Timeline browser verification passed`.

- [ ] **Step 3: Check whitespace and repository state**

```bash
git diff --check
git status --short --branch
```

Expected: no whitespace errors and no uncommitted tracked changes.

- [ ] **Step 4: Review the final commit range**

```bash
git log --oneline cab04ad..HEAD
git diff --stat cab04ad..HEAD
```

Expected: the design, test, and implementation commits are present; production changes are limited to `index.html`, `world-map.html`, and the APWH browser verifier.
