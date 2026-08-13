# APWH Main Full-Bleed Embed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the APWH module more usable space inside `index.html` through a Main-only full-width layout, compact filter toolbar, 70/30 workspace, and independently scrolling contextual panel.

**Architecture:** Keep `world-map.html` as the state owner and leave its standalone layout unchanged. Add World-subject layout classes and a collapsible theme-filter controller in `index.html`; continue proxying every filter and learning action to `window.__mapFilter`. Scope every dimension and expanded state to the World subject and clear it when switching courses.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript, iframe state mirroring, Node.js and Playwright browser verification.

---

### Task 1: Define Main full-width embed behavior with failing tests

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`
- Test: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Add desktop geometry assertions**

In the existing homepage verifier, load `index.html` at 1440×900 and select World. Assert the World map module uses at least 90% of the available main content width, the map canvas is wider than the contextual panel, and their width ratio is within an accessible approximation of 70/30:

```js
const moduleBox = await page.locator('.map-card[data-subject="world"]').boundingBox();
const canvasBox = await page.locator('.home-map-wrap').boundingBox();
const panelBox = await page.locator('#home-events').boundingBox();
assert.ok(canvasBox.width / (canvasBox.width + panelBox.width) >= 0.64);
assert.ok(canvasBox.width / (canvasBox.width + panelBox.width) <= 0.74);
```

Also assert the Timeline Dock remains within the visible iframe viewport.

- [ ] **Step 2: Define compact theme behavior**

Assert a `主题筛选` button exists, has a 44-pixel touch target, reports `aria-expanded="false"` initially, and the theme-chip container is hidden. Click it, require `aria-expanded="true"` and visible existing theme controls, toggle a theme, and assert source filter state changes. Collapse and assert map canvas height does not remain reduced.

- [ ] **Step 3: Define independent panel scrolling and narrow order**

At desktop, assert the contextual panel has bounded height and `overflow-y: auto` when its content exceeds the workspace. At 700×900, assert Map → Timeline Dock → contextual panel order and no horizontal document overflow.

- [ ] **Step 4: Define cross-subject cleanup**

Expand themes in World, switch to Art and APUSH, resize, and assert World-only layout classes, inline dimensions, and expanded-filter state are cleared. Return to World and assert themes are collapsed by default and Timeline remains visible.

- [ ] **Step 5: Run and confirm RED, then commit**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
git add scripts/verify-world-timeline.mjs
git commit -m "test: define APWH Main full-width embed"
```

Expected: FAIL because the compact theme control and full-width layout do not exist.

### Task 2: Implement the Main-only full-width and compact toolbar

**Files:**
- Modify: `index.html`
- Test: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Add World-only layout styling**

Use a World-specific class or `data-subject="world"` selectors to reduce redundant padding and give the module the available Main width. On desktop set the split to approximately `minmax(0, 2.15fr) minmax(330px, .85fr)`. Bound `#home-events` to the canvas height and enable `overflow-y:auto`. Do not modify standalone `world-map.html` layout.

- [ ] **Step 2: Compact the toolbar**

On desktop, make Unit, search, and the theme disclosure share one row. Add a labeled `主题筛选` button with `aria-expanded`, `aria-controls`, and a live active-theme count. Keep the existing theme buttons inside a collapsible container. On medium widths allow wrapping; on narrow widths use 44-pixel controls and no horizontal overflow.

- [ ] **Step 3: Keep source-driven filter behavior**

The disclosure button controls presentation only. Existing Unit/search/theme interactions continue to call the iframe’s `__mapFilter` APIs. Do not duplicate filter values in Main state.

- [ ] **Step 4: Scope and clear World layout state**

When leaving World, collapse the theme disclosure, remove World-only layout classes, and clear World-only inline sizing. Resize handlers must not reapply World dimensions to other subjects. Returning to World recalculates the iframe to include Map plus Timeline Dock.

- [ ] **Step 5: Run APWH verification and commit**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
git diff --check
git add index.html scripts/verify-world-timeline.mjs
git commit -m "feat: add APWH Main full-width embed layout"
```

Expected: APWH direct and homepage verification passes.

### Task 3: Full regression verification

**Files:**
- Modify only if a verified defect requires a TDD correction
- Test: `scripts/verify-world-timeline.mjs`
- Test: `tests/apush-data.test.mjs`
- Test: `scripts/verify-apush-browser.mjs`

- [ ] **Step 1: Run the complete matrix**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apush-data.test.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-apush-browser.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/validate-apush-data.mjs
git diff --check
```

Expected: APWH verifier passes; 38 APUSH data tests pass; APUSH browser verifier passes; all-period validation reports 9 periods and 80 events with zero defects; diff check is clean.

- [ ] **Step 2: Do not create an empty commit**

If no defect is found, report verification only. For a defect, add a failing regression, implement the minimal fix, rerun the matrix, and commit.
