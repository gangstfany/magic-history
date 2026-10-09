# APWH Map and Causal Chain Combined View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the APWH map and embedded Timeline Dock visible while the right panel switches between the selected Unit's causal chain and ordinary event details, with practice remaining a drawer.

**Architecture:** Reuse the existing `.map-study-view` and `.event-zone` as a two-column combined workspace instead of mutually exclusive views. The learning-view controller will change only the right-panel mode; Unit changes will continue to drive map and Timeline filtering and will additionally refresh the Unit-specific causal chain. Existing route-mode rendering remains the causal-chain renderer.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript, inline SVG, Node.js and Playwright browser verification.

---

### Task 1: Define the combined-view contract in browser tests

**Files:**
- Modify: `scripts/verify-world-timeline.mjs:321-350`
- Test: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Replace the obsolete hidden-map assertion with combined-view assertions**

Update `verifyLearningShell` so the initial state requires the map, Timeline Dock, and causal chain simultaneously:

```js
assert.equal(await page.locator('[data-learning-view="chain"]').getAttribute('aria-pressed'), 'true');
await expectVisible(page.locator('#mapStudyView'), 'map remains visible in causal-chain mode');
await expectVisible(page.locator('#worldTimelineDock'), 'Timeline remains embedded beneath the map');
await expectVisible(page.locator('#eventPanel .rt-stops-chain'), 'Unit 1 causal chain is visible in the right panel');

const mapBox = await page.locator('#mapStudyView').evaluate(el => el.getBoundingClientRect().toJSON());
const panelBox = await page.locator('#eventZone').evaluate(el => el.getBoundingClientRect().toJSON());
assert.ok(mapBox.right <= panelBox.left + 1, 'desktop combined view places causal chain to the right of the map');
```

- [ ] **Step 2: Assert that Map changes only the right panel**

After clicking `地图`, require the map and Timeline to remain visible while the chain renderer closes:

```js
await page.locator('[data-learning-view="map"]').click();
await expectVisible(page.locator('#mapStudyView'), 'map remains visible in map-detail mode');
await expectVisible(page.locator('#worldTimelineDock'), 'Timeline remains visible in map-detail mode');
assert.equal(await page.locator('#eventPanel .rt-stops-chain').count(), 0);
assert.equal(await page.locator('[data-learning-view="map"]').getAttribute('aria-pressed'), 'true');
```

- [ ] **Step 3: Add Unit synchronization and narrow-layout assertions**

Return to causal-chain mode, change to Unit 4, and verify the right panel updates. Then use a narrow viewport and require the panel to sit beneath the map:

```js
await page.locator('[data-learning-view="chain"]').click();
await page.locator('#periodFilter').selectOption('u4');
assert.match(await page.locator('#eventPanel').innerText(), /Unit 4|大西洋|Atlantic/i);

await page.setViewportSize({ width: 700, height: 900 });
const narrowMap = await page.locator('#mapStudyView').evaluate(el => el.getBoundingClientRect().toJSON());
const narrowPanel = await page.locator('#eventZone').evaluate(el => el.getBoundingClientRect().toJSON());
assert.ok(narrowPanel.top >= narrowMap.bottom - 1, 'narrow layout stacks the contextual panel beneath map and Timeline');
```

- [ ] **Step 4: Run the verifier and confirm the red state**

Run:

```bash
node scripts/verify-world-timeline.mjs
```

Expected: FAIL because `#mapStudyView` is hidden in the initial causal-chain mode.

- [ ] **Step 5: Commit the failing acceptance test**

```bash
git add scripts/verify-world-timeline.mjs
git commit -m "test: define APWH combined map and causal chain view"
```

### Task 2: Implement the desktop and mobile combined workspace

**Files:**
- Modify: `world-map.html:243-265`
- Modify: `world-map.html:421-850`
- Test: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Make `.split` the responsive combined-view grid**

Replace the hidden-view rule with a desktop two-column layout and narrow stacking:

```css
.split { display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(310px, .72fr); gap: 14px; align-items: start; padding: 0 18px 18px; }
.map-study-view { min-width: 0; border: 1px solid var(--line-strong); border-radius: 18px; overflow: hidden; }
.event-zone { min-width: 0; border: 1px solid var(--line-strong); border-radius: 18px; }
@media (max-width: 850px) {
  .split { grid-template-columns: minmax(0, 1fr); padding-inline: 10px; }
}
```

Remove `.map-study-view[hidden] { display: none; }`. Keep the existing map and Timeline markup grouped inside `#mapStudyView`; keep `#eventZone` as its sibling so the DOM order is map, Timeline, contextual panel.

- [ ] **Step 2: Keep the map workspace visible in both main modes**

Change `showLearningView` so only the contextual panel changes:

```js
function showLearningView(view) {
  if (view === 'practice') { openPracticeDrawer(); return; }
  closePracticeDrawer();
  activeLearningView = view;
  mapStudyView.hidden = false;
  if (view === 'chain') showCurrentUnitChain();
  else {
    if (routeMode?.route?.kind === 'chain') exitRouteMode();
    eventPanel.classList.remove('show');
    eventPanel.innerHTML = '';
    eventEmpty.style.display = 'block';
  }
  syncLearningTabs();
}
```

- [ ] **Step 3: Run the combined-view verifier**

Run:

```bash
node scripts/verify-world-timeline.mjs
```

Expected: PASS for initial combined layout, Map right-panel switching, Unit 4 synchronization, practice drawer, and narrow stacking.

- [ ] **Step 4: Commit the combined layout**

```bash
git add world-map.html scripts/verify-world-timeline.mjs
git commit -m "feat: combine APWH map timeline and causal chain"
```

### Task 3: Verify state restoration and APUSH isolation

**Files:**
- Modify: `scripts/verify-world-timeline.mjs` only if a state-restoration defect is exposed
- Modify: `world-map.html` only if required to fix that defect
- Test: `scripts/verify-world-timeline.mjs`
- Test: `tests/apush-data.test.mjs`
- Test: `scripts/verify-apush-browser.mjs`

- [ ] **Step 1: Exercise practice from causal-chain mode**

Extend the practice assertion to record Unit and main mode before opening, then verify both after closing:

```js
await page.locator('[data-learning-view="practice"]').click();
await expectVisible(page.locator('#practiceDrawer'), 'practice opens as a drawer');
await page.locator('#practiceDrawerClose').click();
assert.equal(await page.locator('#periodFilter').inputValue(), 'u4');
assert.equal(await page.locator('[data-learning-view="chain"]').getAttribute('aria-pressed'), 'true');
await expectVisible(page.locator('#eventPanel .rt-stops-chain'), 'closing practice restores the Unit causal chain');
```

- [ ] **Step 2: Run all relevant verification**

Run:

```bash
node scripts/verify-world-timeline.mjs
node --test tests/apush-data.test.mjs
node scripts/verify-apush-browser.mjs
git diff --check
```

Expected: AP World browser verification passes, all APUSH data tests pass, APUSH browser verification exits successfully, and `git diff --check` prints nothing.

- [ ] **Step 3: Commit any final verification fix**

If Task 3 required code changes:

```bash
git add world-map.html scripts/verify-world-timeline.mjs
git commit -m "fix: preserve APWH combined-view state around practice"
```

If no code changes were required, do not create an empty commit.
