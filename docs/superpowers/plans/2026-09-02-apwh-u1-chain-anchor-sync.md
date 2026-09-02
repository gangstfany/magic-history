# APWH Unit 1 Chain Anchor Synchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure every Unit 1 causal-chain stop selects its intended map anchor when no matching Timeline card exists, without changing chain content or Timeline mappings.

**Architecture:** Keep Timeline selection as the preferred path inside the existing shared `goToStop()` controller. If exact-event and same-pin Timeline selection both fail, call the existing map-only `selectChainMapAnchor()` fallback for every chain-navigation entry point. Verify the four known failures and preserve exact Timeline-card selection when a card exists.

**Tech Stack:** Static HTML/JavaScript, Node.js verification script, Playwright with Chromium.

---

## File Structure

- Modify `scripts/verify-world-timeline.mjs`: adds focused browser assertions for direct stop clicks, previous/next navigation, map-only fallback, and preferred Timeline-card selection.
- Modify `world-map.html`: makes map-anchor fallback unconditional after unsuccessful Timeline selection and removes the obsolete special-case parameter.

### Task 1: Lock the four stale-anchor failures with browser tests

**Files:**
- Modify: `scripts/verify-world-timeline.mjs:3125-3136`

- [ ] **Step 1: Add the failing fallback cases after the initial Unit 1 chain assertion**

Insert this helper and fixture immediately after the initial `#eventPanel .rt-stops-chain` visibility assertion in `verifyLearningShell()`:

```js
  const selectedChainPins = () => page.evaluate(() =>
    [...document.querySelectorAll('.pin-group.timeline-selected')]
      .map(group => group.querySelector('text')?.textContent.trim())
      .filter(Boolean)
      .sort());

  const chainAnchorFallbackCases = [
    { chainId: 'u1_main', step: 7, expectedPin: '8', label: 'Unit 1 main final ring' },
    { chainId: 'u1_sub_syncretism', step: 0, expectedPin: '2', label: 'Unit 1 syncretism first ring' },
    { chainId: 'u1_sub_labor', step: 3, expectedPin: '84', label: 'Unit 1 labor final ring' },
    { chainId: 'u1_sub_gender', step: 1, expectedPin: '84', label: 'Unit 1 gender second ring' },
  ];

  for (const fixture of chainAnchorFallbackCases) {
    await page.evaluate(chainId => window.__mapFilter.enterRoute(chainId), fixture.chainId);
    await page.locator(`#eventPanel [data-route-step="${fixture.step}"]`).click();
    assert.deepEqual(await selectedChainPins(), [fixture.expectedPin],
      `${fixture.label} must fall back to its declared map anchor when no Timeline card exists`);
  }
```

- [ ] **Step 2: Add preferred-Timeline and previous/next assertions**

Continue in the same block:

```js
  await page.evaluate(() => window.__mapFilter.enterRoute('u1_main'));
  await page.locator('#eventPanel [data-route-step="1"]').click();
  assert.equal((await page.evaluate(() => window.getTimelineState())).selectedEventKey,
    'world-event-1-0',
    'a chain stop with an exact declared Timeline event must keep using that event');
  assert.deepEqual(await selectedChainPins(), ['1'],
    'the exact Unit 1 Timeline event must still select Hangzhou');

  await page.locator('#eventPanel [data-route-action="next"]').click();
  assert.deepEqual(await selectedChainPins(), ['3'],
    'Next must route through the same chain-stop synchronization controller');
  await page.locator('#eventPanel [data-route-action="prev"]').click();
  assert.deepEqual(await selectedChainPins(), ['1'],
    'Previous must route through the same chain-stop synchronization controller');

  await page.evaluate(() => window.__mapFilter.enterRoute('u1_main'));
```

- [ ] **Step 3: Run the browser verifier and confirm RED**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: FAIL on the first or subsequent fallback fixture because the selected map pin remains the prior Timeline-backed anchor instead of `8`, `2`, or `84`.

- [ ] **Step 4: Commit the red test**

```bash
git add scripts/verify-world-timeline.mjs
git commit -m "test: lock Unit 1 chain anchor fallback"
```

### Task 2: Make map-anchor fallback part of every chain stop

**Files:**
- Modify: `world-map.html:4040-4060`
- Modify: `world-map.html:4844`

- [ ] **Step 1: Remove the obsolete special-case parameter**

Change:

```js
  function goToStop(i, syncChainAnchor = false) {
```

to:

```js
  function goToStop(i) {
```

- [ ] **Step 2: Apply the fallback whenever Timeline selection fails**

Replace:

```js
      if (!selected && syncChainAnchor) selectChainMapAnchor(num);
```

with:

```js
      if (!selected) selectChainMapAnchor(num);
```

This preserves the exact-event and same-pin Timeline branches above it. It only changes the previously stale state when both branches return false.

- [ ] **Step 3: Remove the obsolete boolean argument at the cross-Unit seam**

Change:

```js
      goToStop(boundary === 'last' ? chain.stops.length - 1 : 0, true);
```

to:

```js
      goToStop(boundary === 'last' ? chain.stops.length - 1 : 0);
```

- [ ] **Step 4: Run the browser verifier and confirm GREEN**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: PASS, including all four new fallback cases and the existing full APWH verification.

- [ ] **Step 5: Commit the production fix**

```bash
git add world-map.html
git commit -m "fix: synchronize chain stops without timeline cards"
```

### Task 3: Run the full regression set

**Files:**
- No production changes expected.

- [ ] **Step 1: Run all Node data tests**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
```

Expected: all tests pass.

- [ ] **Step 2: Run the complete browser verifier once more from a clean process**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: PASS with no unhandled page errors, stale anchors, source-ID drift, or homepage regressions.

- [ ] **Step 3: Confirm the worktree contains only the intended commits**

```bash
git status --short
git log --oneline -3
```

Expected: clean status; the red-test and production-fix commits are visible after the design/plan commits.
