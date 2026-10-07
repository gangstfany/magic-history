# APWH Cross-Unit Mainline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the approved Unit 1, Unit 2→3, and Unit 4 causal chains with navigable seams and a derived course-mainline review view.

**Architecture:** Keep the feature inside the existing `world-map.html` causal-chain subsystem. Main chains receive a small explicit `entryUnit/from/to` contract; one resolver derives both seam presentation and course-mainline presentation so handoff prose is never duplicated. Extend the existing Playwright verifier before each behavior change and preserve the current `__mapFilter` integration boundary.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js, Playwright-based browser verification in `scripts/verify-world-timeline.mjs`.

---

### Task 1: Main-chain seam data contract

**Files:**
- Modify: `world-map.html` (the `CHAINS` records and `__mapFilter` API)
- Modify: `scripts/verify-world-timeline.mjs` (mainline metadata assertions)

- [ ] **Step 1: Write the failing metadata assertions**

In `verifyLearningShell`, read a new `getCourseMainline()` API and assert the literal structure:

```js
const courseMainline = await page.evaluate(() => window.__mapFilter.getCourseMainline());
assert.deepEqual(courseMainline.map((segment) => ({
  id: segment.id,
  units: segment.units,
  entryUnit: segment.entryUnit,
  from: segment.from,
  toUnit: segment.to?.unit || null,
  toChain: segment.to?.chain || null,
  pending: segment.pending,
})), [
  { id: 'u1_main', units: ['u1'], entryUnit: 'u1', from: null, toUnit: 'u2', toChain: 'u23_empires', pending: false },
  { id: 'u23_empires', units: ['u2', 'u3'], entryUnit: 'u2', from: 'u1_main', toUnit: 'u4', toChain: 'u4_atlantic', pending: false },
  { id: 'u4_atlantic', units: ['u4'], entryUnit: 'u4', from: 'u23_empires', toUnit: 'u5', toChain: null, pending: false },
  { id: null, units: ['u5'], entryUnit: 'u5', from: 'u4_atlantic', toUnit: null, toChain: null, pending: true },
]);
assert.ok(courseMainline.slice(0, -1).every((segment) => segment.tier === 'main'),
  'course mainline must contain only main chains');
assert.ok(courseMainline.slice(0, -1).every((segment) => segment.to?.summary),
  'every implemented segment must own the prose for its outgoing seam');
```

- [ ] **Step 2: Run the APWH verifier and observe the expected failure**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: FAIL because `window.__mapFilter.getCourseMainline` is not defined.

- [ ] **Step 3: Add literal `entryUnit/from/to` metadata to the three main chains**

Use this contract and reuse the existing final-link prose where possible:

```js
// u1_main
entryUnit: 'u1',
from: null,
to: {
  unit: 'u2',
  chain: 'u23_empires',
  summary: '节点与制度就位 → 蒙古的统一才可能把交换量推上去'
},

// u23_empires
entryUnit: 'u2',
from: 'u1_main',
to: {
  unit: 'u4',
  chain: 'u4_atlantic',
  summary: '帝国秩序稳定 → 奥斯曼坐收陆路过路费 → 欧洲商人被迫改走海路'
},

// u4_atlantic
entryUnit: 'u4',
from: 'u23_empires',
to: {
  unit: 'u5',
  summary: '殖民重构的等级秩序 → 革命所要反抗的那个东西'
},
```

- [ ] **Step 4: Implement one resolver and expose it read-only**

Add helpers adjacent to `CHAINS`:

```js
const chainById = id => CHAINS.find(chain => chain.id === id) || null;

function validateCourseMainline(mains) {
  const ids = new Set(mains.map(chain => chain.id));
  mains.forEach(chain => {
    if (chain.from && !ids.has(chain.from)) {
      throw new Error(`Unknown APWH mainline predecessor: ${chain.id} <- ${chain.from}`);
    }
    if (!chain.to?.chain) return;
    const next = chainById(chain.to.chain);
    if (!next || (next.tier || 'main') !== 'main') {
      throw new Error(`Unknown APWH mainline successor: ${chain.id} -> ${chain.to.chain}`);
    }
    if (next.from !== chain.id) {
      throw new Error(`Non-reciprocal APWH mainline seam: ${chain.id} -> ${next.id}`);
    }
  });
}

function getCourseMainline() {
  const mains = CHAINS.filter(chain => (chain.tier || 'main') === 'main');
  validateCourseMainline(mains);
  const first = mains.find(chain => !chain.from);
  const ordered = [];
  const visited = new Set();
  let current = first;
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    ordered.push(Object.freeze({
      id: current.id,
      name: current.name,
      chip: current.chip,
      tier: current.tier || 'main',
      units: current.units.slice(),
      entryUnit: current.entryUnit,
      from: current.from || null,
      to: current.to ? Object.freeze({ ...current.to }) : null,
      rings: current.stops.length,
      pending: false,
    }));
    current = current.to?.chain ? chainById(current.to.chain) : null;
  }
  if (visited.size !== mains.length) {
    throw new Error('APWH course mainline is cyclic or disconnected');
  }
  const tail = ordered.at(-1);
  if (tail?.to && !tail.to.chain) {
    ordered.push(Object.freeze({
      id: null,
      name: `Unit ${tail.to.unit.slice(1)} · 待建`,
      chip: `Unit ${tail.to.unit.slice(1)} · 待建`,
      tier: 'main',
      units: [tail.to.unit],
      entryUnit: tail.to.unit,
      from: tail.id,
      to: null,
      rings: 0,
      pending: true,
    }));
  }
  return ordered;
}
```

Expose `getCourseMainline: () => getCourseMainline()` on `window.__mapFilter`. Extend `getChains()` to return `entryUnit`, `from`, and a copied `to` object.

- [ ] **Step 5: Run the APWH verifier and commit**

Expected: the new metadata assertions pass and all existing APWH assertions remain green.

```bash
git add world-map.html scripts/verify-world-timeline.mjs
git commit -m "feat: define APWH cross-unit chain handoffs"
```

### Task 2: Unit-chain seam cards and boundary navigation

**Files:**
- Modify: `world-map.html` (seam CSS, itinerary rendering, delegated click handling, navigation helper)
- Modify: `scripts/verify-world-timeline.mjs` (seam rendering and navigation assertions)

- [ ] **Step 1: Add failing seam-rendering assertions**

After selecting Unit 2 and entering `u23_empires`, assert:

```js
const unit23Seams = page.locator('#eventPanel [data-chain-seam]');
assert.equal(await unit23Seams.count(), 2, 'Unit 2→3 main chain must show incoming and outgoing seams');
assert.equal(await page.locator('#eventPanel [data-route-step]').count(), 10,
  'seam cards must not change the ten-ring count');
assert.match(await unit23Seams.nth(0).innerText(), /承自\s*UNIT 1/i);
assert.match(await unit23Seams.nth(1).innerText(), /交棒\s*UNIT 4/i);
```

Select `u1_sub_syncretism` and assert `#eventPanel [data-chain-seam]` has count zero.

- [ ] **Step 2: Add failing boundary-navigation assertions**

Click the incoming seam action and assert Unit 1, `u1_main`, final step index, selected Karakorum boundary anchor, and unchanged eight-ring count. Re-enter `u23_empires`, click the outgoing seam action, and assert Unit 4, `u4_atlantic`, first step index, selected first boundary anchor, and seven-ring count. Assert the Unit 4 pending seam has no enabled navigation button.

The observable state should come from an extended `getLearningState()` result:

```js
{
  view,
  mapMode,
  label,
  chainPanel,
  chainId: routeMode?.route?.kind === 'chain' ? routeMode.route.id : null,
  chainStep: routeMode?.route?.kind === 'chain' ? routeMode.i : null,
}
```

- [ ] **Step 3: Run the APWH verifier and observe failure**

Expected: FAIL because seam elements and boundary state do not exist.

- [ ] **Step 4: Render seams outside the numbered steps**

Add a `chainSeamHTML(route, direction)` helper. It must return an empty string for routes and supplementary chains. For an incoming seam, resolve `route.from`, then read that previous chain's `to.summary`. For an outgoing seam, read `route.to` directly. Use:

```html
<aside class="chain-seam" data-chain-seam="from|to">
  <div class="chain-seam-label">承自 UNIT 1 | 交棒 UNIT 4</div>
  <p>Derived handoff summary</p>
  <button type="button" data-chain-boundary="previousChainId|nextChainId" data-boundary-step="last|first">
    回看 … | 接着走 …
  </button>
</aside>
```

Insert the incoming seam before `.rt-stops` and the outgoing seam after `.rt-stops`. Keep `.rt-progress` based only on `route.stops.length`.

- [ ] **Step 5: Implement one boundary-navigation helper**

Add `openChainBoundary(chainId, boundary)` that:

1. resolves the implemented main chain,
2. selects `chain.entryUnit` through the same filter state used by `setPeriod`,
3. sets the learning view to `chain`,
4. enters that chain,
5. calls `goToStop(0)` for `first` or `goToStop(chain.stops.length - 1)` for `last`.

Handle `[data-chain-boundary]` in the existing delegated `eventPanel` click listener before the generic route action. Pending seams render without `data-chain-boundary`.

- [ ] **Step 6: Add the approved teal seam styling**

Use a low-contrast teal surface and teal left border, preserve the purple within-Unit arrows, permit wrapping, and avoid fixed heights. At the existing 700px viewport, the seam cards must remain inside the panel without horizontal scrolling.

- [ ] **Step 7: Run the APWH verifier and commit**

Expected: all seam and existing assertions pass.

```bash
git add world-map.html scripts/verify-world-timeline.mjs
git commit -m "feat: navigate APWH causal-chain seams"
```

### Task 3: Course-mainline panel

**Files:**
- Modify: `world-map.html` (view-toggle CSS, state, mainline rendering and interaction)
- Modify: `scripts/verify-world-timeline.mjs` (course-mainline UI and responsive assertions)

- [ ] **Step 1: Add failing course-mainline UI assertions**

In Chain view, assert two native controls exist:

```js
assert.deepEqual(await trimmedTexts(page.locator('[data-chain-panel-view]')), ['当前单元', '九单元主线']);
assert.deepEqual(await trimmedTexts(page.locator('[data-chain-panel-view][aria-pressed="true"]')), ['当前单元']);
```

Click `九单元主线` and assert:

```js
const mainline = page.locator('#eventPanel [data-course-mainline]');
await expectVisible(mainline, 'course mainline must replace the right-side chain content');
assert.deepEqual(await trimmedTexts(mainline.locator('[data-mainline-chain]')), [
  'Unit 1 · Surplus → Exchange8 环',
  'Unit 2→3 · Empires from Ruins10 环',
  'Unit 4 · Atlantic System7 环',
]);
assert.match(await mainline.locator('[data-mainline-pending]').innerText(), /Unit 5.*待建/i);
assert.equal(await page.locator('#periodFilter').inputValue(), 'u4',
  'opening course mainline must not alter the selected Unit');
assert.equal(await page.locator('#mapStudyView').isVisible(), true,
  'opening course mainline must leave the map in place');
```

Also assert each `[data-mainline-bridge]` text equals the preceding segment's `to.summary` returned by `getCourseMainline()`, and that supplementary-chain IDs never appear.

- [ ] **Step 2: Add failing segment-navigation and responsive assertions**

From the mainline, click `u23_empires`; assert Unit 2, Unit panel pressed, chain ID `u23_empires`, step zero, and Karakorum selected. Repeat for Unit 1 and Unit 4. At 700×900, assert both controls wrap without overlap, the mainline panel stacks below the map, and `document.documentElement.scrollWidth === document.documentElement.clientWidth`.

- [ ] **Step 3: Run the APWH verifier and observe failure**

Expected: FAIL because the course-mainline controls and content are absent.

- [ ] **Step 4: Add panel state and toggle rendering**

Introduce `let activeChainPanel = 'unit'`. Add `chainPanelToggleHTML()` with two native buttons carrying `data-chain-panel-view="unit|mainline"` and `aria-pressed`. Include the toggle at the top of every causal-chain panel, including the pending-Unit chain panel, but not Map or Practice views.

Switching to `mainline` must call `renderCourseMainline()` without changing `activePeriod`. Switching back to `unit` must call `showCurrentUnitChain()`.

- [ ] **Step 5: Render the vertical mainline from the resolver**

`renderCourseMainline()` must map `getCourseMainline()` into:

```html
<div data-course-mainline>
  <button type="button" data-mainline-chain="u1_main">…</button>
  <div data-mainline-bridge>u1_main.to.summary</div>
  <button type="button" data-mainline-chain="u23_empires">…</button>
  <div data-mainline-bridge>u23_empires.to.summary</div>
  <button type="button" data-mainline-chain="u4_atlantic">…</button>
  <div data-mainline-bridge>u4_atlantic.to.summary</div>
  <div data-mainline-pending aria-disabled="true">Unit 5 · 待建</div>
</div>
```

Do not store a second array of segment or connector copy. Mark the segment containing the currently selected Unit as active. Pending content must not be a button.

- [ ] **Step 6: Wire segment clicks through `openChainBoundary`**

Handle `[data-mainline-chain]` in the delegated click listener, set `activeChainPanel = 'unit'`, and call `openChainBoundary(id, 'first')`. Extend `getLearningState()` with `chainPanel`, `chainId`, and `chainStep` for deterministic tests.

- [ ] **Step 7: Add responsive vertical-mainline styling**

Match the approved preview: neutral segment cards, a thin teal vertical connector, purple segment nodes, teal handoff arrows, and subdued pending state. Reuse existing typography and panel spacing. Do not introduce horizontal scrolling, fixed heights, or a new standalone page.

- [ ] **Step 8: Run the APWH verifier and commit**

Expected: all mainline, seam, existing layout, and responsive assertions pass.

```bash
git add world-map.html scripts/verify-world-timeline.mjs
git commit -m "feat: add APWH course mainline view"
```

### Task 4: Full regression and branch readiness

**Files:**
- Verify: `world-map.html`
- Verify: `index.html`
- Verify: `scripts/verify-world-timeline.mjs`
- Verify: `scripts/verify-apush-release.mjs`
- Verify: `scripts/verify-apush-browser.mjs`
- Verify: `tests/apush-data.test.mjs`

- [ ] **Step 1: Run whitespace and repository checks**

```bash
git diff --check feature/apwh-all-units-card-timeline-dock...HEAD
git status --short --branch
```

Expected: no whitespace errors and no uncommitted files.

- [ ] **Step 2: Run the complete APWH browser verifier**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: `AP World Timeline browser verification passed`.

- [ ] **Step 3: Run the complete APUSH release verifier**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-apush-release.mjs
```

Expected: 38/38 unit tests pass, nine periods and 80 events validate with zero defects, browser matrix passes, and `APUSH all-period release verification passed`.

- [ ] **Step 4: Run the standalone APUSH browser verifier**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-apush-browser.mjs
```

Expected: `APUSH browser verification passed`.

- [ ] **Step 5: Review the complete branch diff**

Confirm that only the design/plan documents, `world-map.html`, and `scripts/verify-world-timeline.mjs` changed; no `chain-preview.html`, temporary screenshots, generated artifacts, APUSH content, or main-branch files were added.
