# Map Panel Tab Size Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the visible `事件详情` and `商路` pills to the approved 38-pixel balanced size while retaining a 44-pixel interactive target.

**Architecture:** Keep the existing buttons and event delegation unchanged. Use a positioned `::before` surface inset by 3 pixels inside each 44-pixel button, so the painted pill is 38 pixels high while the semantic button remains accessible; mirror the same scoped rule in the homepage clone.

**Tech Stack:** Static HTML/CSS, Node.js test runner, Playwright browser verification.

---

### Task 1: Apply and verify the balanced pill dimensions

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`
- Modify: `world-map.html:350-355`
- Modify: `index.html:501-504`

- [ ] **Step 1: Add failing standalone and homepage dimension assertions**

Add a helper inside `scripts/verify-world-timeline.mjs` that reads the actual button box and painted `::before` inset:

```js
async function mapPanelTabMetrics(locator) {
  return locator.evaluate(button => {
    const buttonStyle = getComputedStyle(button);
    const surfaceStyle = getComputedStyle(button, '::before');
    return {
      hitHeight: Math.round(button.getBoundingClientRect().height),
      fontSize: buttonStyle.fontSize,
      paddingLeft: buttonStyle.paddingLeft,
      paddingRight: buttonStyle.paddingRight,
      surfaceTop: surfaceStyle.top,
      surfaceBottom: surfaceStyle.bottom,
    };
  });
}

function assertBalancedMapPanelTab(metrics, label) {
  assert.equal(metrics.hitHeight, 44, `${label} must keep a 44px hit target`);
  assert.equal(metrics.fontSize, '13px', `${label} must keep 13px labels`);
  assert.equal(metrics.paddingLeft, '14px', `${label} must use balanced horizontal padding`);
  assert.equal(metrics.paddingRight, '14px', `${label} must use balanced horizontal padding`);
  assert.equal(metrics.surfaceTop, '3px', `${label} visible pill must start 3px inside the hit target`);
  assert.equal(metrics.surfaceBottom, '3px', `${label} visible pill must end 3px inside the hit target`);
}
```

After Map Event Details is visible, call it for both standalone controls:

```js
const standaloneTabs = page.locator('#mapPanelTabs [data-map-mode]');
assertBalancedMapPanelTab(await mapPanelTabMetrics(standaloneTabs.nth(0)), 'standalone Event Details tab');
assertBalancedMapPanelTab(await mapPanelTabMetrics(standaloneTabs.nth(1)), 'standalone Trade Routes tab');
```

In the existing homepage verification, call the same assertions for the cloned controls:

```js
const homeTabs = homePage.locator('#home-events [data-map-mode]');
assertBalancedMapPanelTab(await mapPanelTabMetrics(homeTabs.nth(0)), 'homepage Event Details tab');
assertBalancedMapPanelTab(await mapPanelTabMetrics(homeTabs.nth(1)), 'homepage Trade Routes tab');
```

- [ ] **Step 2: Run the browser verifier and confirm RED**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
```

Expected: FAIL because the current buttons use 16-pixel horizontal padding and have no 3-pixel inset painted surface.

- [ ] **Step 3: Implement the balanced visible surface in both scoped style blocks**

Replace the standalone rules with:

```css
.map-panel-tabs button { position: relative; isolation: isolate; min-height: 44px; padding: 0 14px; border: 0; background: transparent; color: var(--ink); font: inherit; font-size: 13px; font-weight: 800; cursor: pointer; }
.map-panel-tabs button::before { content: ""; position: absolute; inset: 3px 0; z-index: -1; border: 1px solid var(--line); border-radius: 999px; background: var(--paper, #f5efe3); }
.map-panel-tabs button:hover::before { border-color: var(--terracotta, #a8552f); }
.map-panel-tabs button[aria-pressed="true"] { color: #fff; }
.map-panel-tabs button[aria-pressed="true"]::before { border-color: var(--terracotta, #a8552f); background: var(--terracotta, #a8552f); }
.map-panel-tabs button:focus-visible { outline: 3px solid #28708a; outline-offset: 2px; }
```

Apply the same structure to the `.home-events .map-panel-tabs button` rules in `index.html`, using the existing homepage tokens `var(--line)`, `var(--paper)`, and `var(--terracotta)`.

- [ ] **Step 4: Run complete verification and confirm GREEN**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-world-timeline.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/apwh-u1-location-study.test.mjs tests/apush-data.test.mjs
git diff --check
```

Expected: AP World browser verification passes; 45 Node tests pass with 0 failures; `git diff --check` prints nothing.

- [ ] **Step 5: Visually inspect and commit**

Reload `http://127.0.0.1:8765/` at desktop and narrow widths. Confirm the two visible pills are smaller, centered, readable, and still show a visible keyboard focus ring.

```bash
git add world-map.html index.html scripts/verify-world-timeline.mjs
git commit -m "style: reduce map panel tab size"
```
