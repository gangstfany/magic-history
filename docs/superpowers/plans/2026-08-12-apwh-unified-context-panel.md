# APWH Unified Context Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed Practice drawer and legacy empty-state launchers with one persistent right panel that switches among causal chain, map event/route tools, and practice.

**Architecture:** Keep `#eventZone` permanently beside the map and Timeline Dock. A primary learning-view controller renders Chain, Map, or Practice into that shared region; Map owns an internal Event Details / Routes submode. Existing chain, route, quiz, filter, pin, and Timeline renderers remain the source of content and are coordinated through explicit mode-exit helpers.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript, inline SVG, Node.js and Playwright browser verification.

---

### Task 1: Define shared-panel behavior with failing browser tests

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`
- Test: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Replace drawer expectations with shared-panel assertions**

In `verifyLearningShell`, require `练习` to leave `#eventZone` inside `.split`, display quiz controls there, and never display a fixed drawer:

```js
await page.locator('[data-learning-view="practice"]').click();
assert.equal(await page.locator('.split > #eventZone').count(), 1);
await expectVisible(page.locator('#eventZone .quiz-panel'), 'practice renders in the shared panel');
assert.equal(await page.locator('#practiceDrawer').count(), 0, 'obsolete practice drawer is removed');
assert.equal(await page.locator('[data-learning-view="practice"]').getAttribute('aria-pressed'), 'true');
```

- [ ] **Step 2: Add Map secondary-mode acceptance coverage**

After selecting `地图`, assert two secondary controls exist and only Event Details is active. Confirm the map empty state contains no `Practice` or `随堂练习` text:

```js
const secondary = page.locator('[data-map-mode]');
assert.deepEqual(await secondary.allTextContents(), ['事件详情', '商路']);
assert.equal(await page.locator('[data-map-mode="events"]').getAttribute('aria-pressed'), 'true');
assert.doesNotMatch(await page.locator('#eventZone').innerText(), /Practice|随堂练习/);
```

Click `商路`, require `地图商路` as the contextual label and an existing non-chain route choice. Select one and assert route mode becomes active through the existing debug state or visible route class. Return to Event Details and assert the original Unit is restored and route visualization is cleared.

- [ ] **Step 3: Add quiz-state restoration coverage**

Select Unit 4, enter Practice, begin the existing quiz, then select `因果链`. Assert Unit 4 remains selected, Chain is the only pressed primary mode, and the Unit 4 chain is visible. Repeat Practice → Map and assert the Map secondary controls return.

- [ ] **Step 4: Run and confirm RED**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: FAIL because Practice still moves `#eventZone` into `#practiceDrawer` and Map secondary controls do not exist.

- [ ] **Step 5: Commit the failing tests**

```bash
git add scripts/verify-world-timeline.mjs
git commit -m "test: define APWH unified contextual panel"
```

### Task 2: Replace the drawer with primary shared-panel modes

**Files:**
- Modify: `world-map.html`
- Test: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Remove obsolete Practice drawer markup and CSS**

Delete `#practiceDrawer`, its header/body/close button, fixed-position CSS, mobile drawer CSS, focus-launcher state, Escape-only drawer handler, and drawer-specific DOM movement. Keep `#eventZone` as a permanent direct child of `.split`.

- [ ] **Step 2: Render Practice inside the shared panel**

Replace `openPracticeDrawer` / `closePracticeDrawer` with explicit mode cleanup:

```js
function leaveActiveLearningContent() {
  if (quizMode || eventPanel.querySelector('.quiz-panel')) exitQuiz();
  if (routeMode) exitRouteMode();
}

function showPracticeView() {
  leaveActiveLearningContent();
  activeLearningView = 'practice';
  eventZone.setAttribute('aria-label', '练习');
  renderPicker('quiz');
  syncLearningTabs();
}
```

Update `showLearningView` so exactly one of Chain, Map, or Practice is active and all use the same `#eventZone`. Preserve Unit and filter state while leaving quiz or route modes.

- [ ] **Step 3: Remove the legacy empty-state launcher**

Split `routePickerHTML()` / `remountRoutePicker()` responsibilities so the map event-detail empty state renders only concise map instructions. Do not append Practice, Routes, or Chain launch chips into `#eventEmpty`; primary and Map secondary navigation own those entries.

- [ ] **Step 4: Run the verifier**

Run the APWH browser verifier. Expected: Practice shared-panel assertions pass; Map secondary assertions may remain RED until Task 3.

- [ ] **Step 5: Commit shared Practice panel**

```bash
git add world-map.html scripts/verify-world-timeline.mjs
git commit -m "feat: move APWH practice into the contextual panel"
```

### Task 3: Add Event Details and Routes inside Map mode

**Files:**
- Modify: `world-map.html`
- Test: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Add accessible secondary navigation**

Render a compact Map-only control group at the top of `#eventZone`:

```html
<div class="map-panel-tabs" role="group" aria-label="地图内容">
  <button type="button" data-map-mode="events" aria-pressed="true">事件详情</button>
  <button type="button" data-map-mode="routes" aria-pressed="false">商路</button>
</div>
```

Style it within the shared panel using the existing warm palette, 44-pixel minimum touch targets, visible focus, and no nested oversized card.

- [ ] **Step 2: Implement Map secondary-mode state**

Track `activeMapMode = 'events'`. Event Details clears active non-chain routes with restoration, sets `aria-label="地图事件详情"`, and renders the clean map prompt. Routes sets `aria-label="地图商路"` and calls `renderPicker('route')` beneath the persistent secondary navigation.

Because existing renderers replace `eventPanel.innerHTML`, either render the secondary controls in a stable sibling container inside `eventZone`, or use a helper that reliably reinserts them after every map-panel render. Prefer a stable sibling to avoid duplication.

- [ ] **Step 3: Preserve state across route transitions**

When leaving Routes for Event Details, Chain, or Practice, call non-quiet `exitRouteMode()` so suspended Unit/query/category filters are restored before rendering the destination. Returning to Map defaults to the last Map secondary mode only if its state remains valid; otherwise default to Event Details.

- [ ] **Step 4: Run APWH browser verification and commit**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
git diff --check
git add world-map.html scripts/verify-world-timeline.mjs
git commit -m "feat: add APWH map event and route submodes"
```

Expected: all unified-panel assertions pass.

### Task 4: Full regression and responsive verification

**Files:**
- Modify: `world-map.html` or `scripts/verify-world-timeline.mjs` only if a verified defect requires a TDD fix
- Test: `scripts/verify-world-timeline.mjs`
- Test: `tests/apush-data.test.mjs`
- Test: `scripts/verify-apush-browser.mjs`

- [ ] **Step 1: Verify narrow layout and primary mode exclusivity**

At 700×900, assert map and Timeline precede the shared panel. For Chain, Map, and Practice, assert exactly one `.learning-view-tab[aria-pressed="true"]` and verify the correct contextual accessible label.

- [ ] **Step 2: Run the full matrix**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apush-data.test.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-apush-browser.mjs
git diff --check
```

Expected: APWH verifier passes; 38 APUSH data tests pass; APUSH browser verifier passes; diff check prints nothing.

- [ ] **Step 3: Commit only if final defects required changes**

```bash
git add world-map.html scripts/verify-world-timeline.mjs
git commit -m "fix: preserve APWH contextual panel state"
```

Do not create an empty commit when no changes are needed.
