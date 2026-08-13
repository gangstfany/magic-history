# APWH Chain and Map Mode Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restrict the animated first-click hint and ordinary location/event details to Map Event Details while keeping the Causal Chain panel chain-only.

**Architecture:** Add explicit mode ownership to the first-click hint lifecycle and split chain-step rendering from commercial-route stop rendering. Chain interactions continue to update geographic and Timeline selection state, but only Map Event Details may render ordinary event cards into the contextual panel.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript, inline SVG, Node.js and Playwright browser verification.

---

### Task 1: Add failing mode-isolation browser tests

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`
- Test: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Test first-click hint ownership**

On initial Causal Chain load, wait longer than the existing 1.3-second delay and assert `#firstClickHint` does not have `.show`. Enter Map Event Details, wait for the delay, and assert it becomes visible. Switch to Chain, Routes, and Practice and assert the class is removed immediately in each mode.

- [ ] **Step 2: Test chain-only contextual content**

In Unit 1 Causal Chain, activate the first and second chain steps through the visible `[data-route-step]` controls. After each step, assert `.rt-stops-chain` remains visible while `.event-head` and `.event-list` are absent from `#eventPanel`. Assert linked map pins are highlighted and the Timeline selection/highlight remains synchronized.

- [ ] **Step 3: Test Map Event Details remains functional**

Switch to Map Event Details and click a visible map pin or Timeline card. Assert ordinary `.event-head` and `.event-list` content appears in the right panel. Enter Routes and assert its current-stop event content still appears, proving the change does not remove commercial-route details.

- [ ] **Step 4: Run and confirm RED**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: FAIL because the hint appears in the initial Chain mode and chain steps append ordinary event content.

- [ ] **Step 5: Commit failing tests**

```bash
git add scripts/verify-world-timeline.mjs
git commit -m "test: define APWH chain and map mode isolation"
```

### Task 2: Implement mode-owned hint and chain-only rendering

**Files:**
- Modify: `world-map.html`
- Test: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Replace unconditional hint scheduling**

Create explicit helpers such as `scheduleFirstClickHint()` and `dismissFirstClickHint()`. Schedule only when `activeLearningView === 'map' && activeMapMode === 'events'`; every other primary or secondary mode cancels the timer and removes `.show`. Remove the unconditional startup timer.

- [ ] **Step 2: Separate chain and route stop rendering**

In `goToStop`, branch on `route.kind`. For chains, render only `itineraryHTML()`, update map spotlight/vehicle-compatible state, scroll the current chain step into view, and synchronize the linked Timeline/map selection without calling `renderEventContent`. For non-chain Routes, preserve current stop event rendering followed by itinerary controls.

- [ ] **Step 3: Guard Map and Timeline activations by mode**

When Chain is active, map pins and Timeline cards may update highlights/selections but must not call an ordinary event-panel renderer. In Map Event Details, preserve the existing detail rendering. Routes and Practice keep their existing specialized behavior.

- [ ] **Step 4: Run APWH verification and commit**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
git diff --check
git add world-map.html scripts/verify-world-timeline.mjs
git commit -m "fix: isolate APWH chain and map event content"
```

Expected: APWH browser verification passes.

### Task 3: Full regression verification

**Files:**
- Modify only when a verified defect requires a TDD fix
- Test: `scripts/verify-world-timeline.mjs`
- Test: `tests/apush-data.test.mjs`
- Test: `scripts/verify-apush-browser.mjs`

- [ ] **Step 1: Run the full matrix**

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apush-data.test.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-apush-browser.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/validate-apush-data.mjs
git diff --check
```

Expected: APWH direct/home verifier passes, 38 APUSH data tests pass, APUSH browser verifier passes, all-period validation reports 9 periods and 80 events with zero defects, and diff check is clean.

- [ ] **Step 2: Do not create an empty commit**

If no defect is found, report verification only. If a defect is found, add a failing regression first, implement the minimal correction, rerun the matrix, and commit the fix.
