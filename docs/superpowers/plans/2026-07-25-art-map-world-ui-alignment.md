# AP Art History Map World UI Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the AP Art History map’s embedded typography, component scale, map controls, AP-number pins, detail panel, and responsive behavior with the existing World History homepage map without changing World History itself.

**Architecture:** Keep the existing single-file Art History application and add a query-driven embedded presentation class. The homepage requests `?embed=1`; embedded CSS removes duplicated framing and applies exact World History-derived tokens, while standalone mode keeps its header. Pure marker-metric helpers continue to separate 22px visual pins from 44px interaction targets.

**Tech Stack:** HTML, CSS, vanilla JavaScript, inline SVG, Node.js `node:test`, local browser verification.

---

## File map

- Modify: `index.html` — request Art History embedded mode and keep the Art iframe sized for the compact map/detail layout.
- Modify: `art-history-map.html` — embedded-mode detection, typography, spacing, filters, controls, marker metrics, detail hierarchy, and responsive rules.
- Modify: `tests/homepage-art-integration.test.mjs` — homepage-to-iframe embedded-mode contract.
- Modify: `tests/art-history-ui-numbering.test.mjs` — exact typography, control, marker-visual, and hit-target regressions.
- Reference only: `world-map.html` — source of truth for the approved visual scale; do not edit.
- Reference only: `docs/superpowers/specs/2026-07-25-art-map-world-ui-alignment-design.md`.

## Task 1: Add an explicit Art History embedded mode

**Files:**
- Modify: `tests/homepage-art-integration.test.mjs:11-18`
- Modify: `index.html:338-340`
- Modify: `art-history-map.html:23-42`
- Modify: `art-history-map.html:143-148`

- [ ] **Step 1: Write the failing homepage embedded-mode contract**

Update the first homepage integration test and add an Art-page assertion:

```js
test('homepage keeps persistent, independently labelled world and embedded art frames', async () => {
  const html = await loadHtml();

  assert.match(html, /<iframe[^>]+id="worldMapFrame"[^>]+src="world-map\.html"/s);
  assert.match(
    html,
    /<iframe[^>]+id="artMapFrame"[^>]+src="art-history-map\.html\?embed=1"/s,
  );
  assert.equal((html.match(/src="world-map\.html"/g) || []).length, 1);
  assert.equal((html.match(/src="art-history-map\.html\?embed=1"/g) || []).length, 1);
});
```

Add this to `tests/art-history-ui-numbering.test.mjs`:

```js
test('art map exposes a query-driven embedded presentation mode', async () => {
  const html = await loadHtml();
  assert.match(
    html,
    /new URLSearchParams\(window\.location\.search\)\.get\('embed'\) === '1'/,
  );
  assert.match(html, /document\.body\.classList\.toggle\('is-embedded', isEmbedded\)/);
  assert.match(html, /body\.is-embedded \.page-header\s*\{[^}]*display:\s*none/s);
  assert.match(
    html,
    /body\.is-embedded \.art-workspace\s*\{[^}]*width:\s*100%[^}]*max-width:\s*none/s,
  );
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --test tests/homepage-art-integration.test.mjs tests/art-history-ui-numbering.test.mjs
```

Expected: FAIL because the iframe has no `embed=1` query and the Art page has no embedded class or layout rules.

- [ ] **Step 3: Request embedded mode from the homepage**

Change only the Art iframe source:

```html
<iframe id="artMapFrame" class="subject-map-frame" src="art-history-map.html?embed=1" title="Interactive AP art history map" loading="lazy" hidden aria-hidden="true"></iframe>
```

The existing `isExpectedFrameReady()` URL comparison already includes the iframe’s query through `frame.getAttribute('src')`; no loading-flow rewrite is needed.

- [ ] **Step 4: Add embedded-mode detection before page content**

Immediately after `<body>` in `art-history-map.html`, add:

```html
<script>
  const isEmbedded = new URLSearchParams(window.location.search).get('embed') === '1';
  document.body.classList.toggle('is-embedded', isEmbedded);
</script>
```

- [ ] **Step 5: Add the desktop embedded shell**

Add these rules before the existing responsive media query:

```css
body.is-embedded {
  display:flex;
  flex-direction:column;
  height:100vh;
  overflow:hidden;
}
body.is-embedded .page-header { display:none; }
body.is-embedded .filter-toolbar {
  flex:0 0 auto;
  width:100%;
  max-width:none;
  margin:0;
  padding:8px 12px;
  border-bottom:1px solid var(--line);
  background:var(--card);
}
body.is-embedded .art-workspace {
  flex:1 1 auto;
  width:100%;
  max-width:none;
  height:auto;
  min-height:0;
  margin:0;
  border:0;
  border-radius:0;
  box-shadow:none;
}
```

- [ ] **Step 6: Run the focused tests and verify GREEN**

Run the same two test files. Expected: all tests PASS.

- [ ] **Step 7: Commit Task 1**

```bash
git add index.html art-history-map.html tests/homepage-art-integration.test.mjs tests/art-history-ui-numbering.test.mjs
git commit -m "feat: add compact embedded art map mode"
```

## Task 2: Apply the World History typography and component scale

**Files:**
- Modify: `tests/art-history-ui-numbering.test.mjs:71-126`
- Modify: `art-history-map.html:29-41`
- Modify: `art-history-map.html:82-118`

- [ ] **Step 1: Update the typography regression to the approved values**

Replace the old `22px`/`14px` assertions and append exact component assertions:

```js
const englishTitleCss = getCssDeclarations(html, '.work-title-en');
assert.match(englishTitleCss, /font-size:\s*19px/);
assert.match(englishTitleCss, /font-weight:\s*800/);

const chineseTitleCss = getCssDeclarations(html, '.work-title-zh');
assert.match(chineseTitleCss, /font-size:\s*13px/);
assert.match(chineseTitleCss, /font-weight:\s*600/);

const detailPanelCss = getCssDeclarations(html, '.detail-panel');
assert.match(detailPanelCss, /font-size:\s*13\.5px/);
assert.match(detailPanelCss, /font-weight:\s*600/);
assert.match(detailPanelCss, /line-height:\s*1\.55/);
assert.match(detailPanelCss, /padding:\s*18px/);

const detailTabCss = getCssDeclarations(html, '.detail-tab');
assert.match(detailTabCss, /font-size:\s*13px/);
assert.match(detailTabCss, /font-weight:\s*600/);

const filterPillCss = getCssDeclarations(html, '.filter-pill, .clear-button');
assert.match(filterPillCss, /font-size:\s*13px/);
assert.match(filterPillCss, /font-weight:\s*600/);
assert.match(filterPillCss, /min-height:\s*34px/);
```

- [ ] **Step 2: Run the typography test and verify RED**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --test --test-name-pattern="typography|font stack" tests/art-history-ui-numbering.test.mjs
```

Expected: FAIL on the old 22px English title, 14px Chinese title, 16px inherited detail body, and 40px controls.

- [ ] **Step 3: Implement compact filters and form controls**

Replace the filter sizing rules with:

```css
.filter-toolbar {
  max-width:1180px;
  margin:0 auto 16px;
  padding:0 20px;
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  align-items:end;
}
.civilization-filters { display:flex; flex-wrap:wrap; gap:6px; }
.filter-label {
  display:grid;
  gap:3px;
  color:var(--ink-soft);
  font-size:12px;
  font-weight:600;
}
.filter-pill, .clear-button {
  min-height:34px;
  padding:6px 12px;
  border:1px solid var(--line);
  border-radius:999px;
  color:var(--ink);
  background:var(--card);
  font-size:13px;
  font-weight:600;
  cursor:pointer;
}
select, input[type="search"] {
  min-height:34px;
  max-width:100%;
  padding:5px 9px;
  border:1px solid var(--line);
  border-radius:8px;
  color:var(--ink);
  background:var(--card);
  font-size:13px;
  font-weight:600;
}
```

- [ ] **Step 4: Implement the compact detail hierarchy**

Use:

```css
.selected-summary { display:grid; gap:8px; }
.work-title-en {
  margin:0;
  font-size:19px;
  line-height:1.25;
  font-weight:800;
  letter-spacing:-.01em;
}
.work-title-zh {
  margin:0;
  color:var(--ink-soft);
  font-size:13px;
  line-height:1.5;
  font-weight:600;
}
.work-meta { font-size:12px; font-weight:600; }
.identity-list { display:grid; gap:5px; margin:0; }
.identity-row {
  display:grid;
  grid-template-columns:5.3em minmax(0,1fr);
  gap:7px;
  line-height:1.5;
}
.detail-panel {
  min-width:0;
  overflow:auto;
  padding:18px;
  border-left:1px solid var(--line);
  background:#fffaf2;
  font-size:13.5px;
  font-weight:600;
  line-height:1.55;
}
.detail-tab {
  min-height:34px;
  padding:6px 4px;
  border:0;
  border-radius:7px 7px 0 0;
  color:var(--ink-soft);
  background:transparent;
  font-size:13px;
  font-weight:600;
  cursor:pointer;
}
.detail-tabpanel { display:grid; gap:10px; padding:12px 0 2px; line-height:1.55; }
.study-block h3 { color:#765438; font-size:13.5px; font-weight:700; }
.instruction h2, .empty-state h2 { margin:0; font-size:19px; }
.instruction p, .empty-state p { margin:0; color:var(--ink-soft); line-height:1.55; }
.legend { display:flex; flex-wrap:wrap; gap:10px; margin-top:20px; font-size:12px; }
```

Keep `.result-count` at `12px`/`700`. Do not change the artwork image’s `object-fit:contain` behavior.

- [ ] **Step 5: Run focused and detail tests**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --test tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 6: Commit Task 2**

```bash
git add art-history-map.html tests/art-history-ui-numbering.test.mjs
git commit -m "style: match art detail typography to world history"
```

## Task 3: Match World History map controls and AP-number pins

**Files:**
- Modify: `tests/art-history-ui-numbering.test.mjs:163-210`
- Modify: `art-history-map.html:47-81`
- Modify: `art-history-map.html:348-352`
- Modify: `art-history-map.html:701-728`

- [ ] **Step 1: Add exact marker and control regressions**

Extend the marker-metric test:

```js
test('marker visuals match World pins while hit targets stay touchable', async () => {
  const html = await loadHtml();
  const { getMarkerMetrics, getExpandedPinMetrics } = loadPureFunctions(
    html,
    ['getMarkerMetrics', 'getExpandedPinMetrics'],
  );

  const site = getMarkerMetrics('13', true, 1);
  assert.equal(site.fontSize, 10);
  assert.equal(site.visualWidth, 22);
  assert.equal(site.visualHeight, 22);
  assert.equal(site.hitWidth, 44);
  assert.equal(site.hitHeight, 44);

  const child = getExpandedPinMetrics(1);
  assert.equal(child.fontSize, 10);
  assert.equal(child.visualDiameter, 22);
  assert.equal(child.hitWidth, 44);
  assert.equal(child.hitHeight, 44);

  assert.match(
    getCssDeclarations(html, '.site-marker .marker-label-bg'),
    /stroke-width:\s*2/,
  );
  assert.match(
    getCssDeclarations(html, '.expanded-work-pin .expanded-pin-bg'),
    /stroke-width:\s*2/,
  );
});

test('desktop map controls use the World History 30px vertical stack', async () => {
  const html = await loadHtml();
  const controlsCss = getCssDeclarations(html, '.map-controls');
  assert.match(controlsCss, /flex-direction:\s*column/);
  const buttonCss = getCssDeclarations(html, '.map-controls button');
  assert.match(buttonCss, /width:\s*30px/);
  assert.match(buttonCss, /height:\s*30px/);
  assert.match(buttonCss, /border-radius:\s*6px/);
  assert.match(html, /<button id="resetView"[^>]*aria-label="还原地图">1:1<\/button>/);
});
```

Update the existing 390px marker assertion from `>= 11.5` to `>= 9.5`, matching the approved 10px pin text.

- [ ] **Step 2: Run the marker tests and verify RED**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --test --test-name-pattern="marker|controls|expanded pins" tests/art-history-ui-numbering.test.mjs
```

Expected: FAIL because visuals are 30px with 12px labels, 5px outlines, and horizontal 40px controls.

- [ ] **Step 3: Implement World-sized marker metrics**

Change the pure helpers to:

```js
function getMarkerMetrics(apLabel, isSingle, screenScale) {
  const scale = Math.max(0.05, screenScale);
  const fontSize = 10 / scale;
  const visualHeight = 22 / scale;
  const visualWidthPx = isSingle
    ? 22
    : Math.max(38, Math.min(108, apLabel.length * 6.4 + 16));
  const visualWidth = visualWidthPx / scale;
  return {
    fontSize,
    visualWidth,
    visualHeight,
    cornerRadius: visualHeight / 2,
    hitWidth: Math.max(44 / scale, visualWidth * 1.12),
    hitHeight: 44 / scale
  };
}

function getExpandedPinMetrics(screenScale) {
  const scale = Math.max(0.05, screenScale);
  return {
    fontSize: 10 / scale,
    visualDiameter: 22 / scale,
    hitWidth: 44 / scale,
    hitHeight: 44 / scale
  };
}
```

- [ ] **Step 4: Implement compact marker outlines and controls**

Use:

```css
.site-marker .marker-label-bg {
  stroke:#fff;
  stroke-width:2;
  filter:drop-shadow(0 2px 3px rgba(40,30,20,.32));
  transition:stroke-width .15s ease,filter .15s ease;
}
.site-marker.is-active .marker-label-bg {
  stroke-width:3;
  filter:drop-shadow(0 3px 5px rgba(40,30,20,.45));
}
.site-marker[data-civilization="mixed"] .marker-label-bg {
  fill:var(--greece);
  stroke:var(--rome);
  stroke-width:3;
}
.expanded-work-pin .expanded-pin-bg {
  stroke:#fff;
  stroke-width:2;
  filter:drop-shadow(0 2px 3px rgba(40,30,20,.32));
  vector-effect:non-scaling-stroke;
}
.expanded-work-pin.is-active .expanded-pin-bg {
  stroke:var(--ink);
  stroke-width:3;
}
.map-controls {
  position:absolute;
  z-index:2;
  top:12px;
  right:12px;
  display:flex;
  flex-direction:column;
  gap:6px;
}
.map-controls button {
  width:30px;
  height:30px;
  min-width:30px;
  min-height:30px;
  padding:0;
  border:1.5px solid #ccc;
  border-radius:6px;
  color:#333;
  background:#fff;
  font-size:20px;
  font-weight:700;
  line-height:1;
  box-shadow:0 2px 6px rgba(0,0,0,.15);
  cursor:pointer;
}
.map-controls .overview-button { font-size:11px; }
```

Keep `.site-cycle button` in its own rule so the detail-navigation buttons are not forced to 30px.

- [ ] **Step 5: Rename the reset control visibly**

Use:

```html
<button id="resetView" class="overview-button" type="button" aria-label="还原地图">1:1</button>
```

- [ ] **Step 6: Run marker, layout, and full Art tests**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --test tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
```

Expected: all tests PASS, including collision-safe marker and spider-layout tests.

- [ ] **Step 7: Commit Task 3**

```bash
git add art-history-map.html tests/art-history-ui-numbering.test.mjs
git commit -m "style: match art pins and controls to world map"
```

## Task 4: Preserve responsive touch behavior and verify the finished UI

**Files:**
- Modify: `tests/homepage-art-integration.test.mjs:76-85`
- Modify: `tests/art-history-ui-numbering.test.mjs`
- Modify: `index.html:215-220`
- Modify: `art-history-map.html:129-140`

- [ ] **Step 1: Write the responsive regressions**

Add to the Art test:

```js
test('compact desktop controls recover 44px touch targets on narrow screens', async () => {
  const html = await loadHtml();
  assert.match(
    html,
    /@media \(max-width:520px\)[\s\S]*?\.map-controls button\s*\{[^}]*width:\s*44px[^}]*height:\s*44px/s,
  );
  assert.match(
    html,
    /@media \(max-width:520px\)[\s\S]*?\.filter-pill,[\s\S]*?select,[\s\S]*?input\[type="search"\][\s\S]*?min-height:\s*44px/s,
  );
  assert.match(
    html,
    /body\.is-embedded[\s\S]*?overflow:\s*hidden/,
    'desktop iframe must not create a second outer scrollbar',
  );
});
```

Update the homepage responsive assertion to require a useful Art iframe height instead of the old 300px:

```js
assert.match(
  html,
  /@media \(max-width: 900px\)[\s\S]*?\.map-card\[data-subject="art"\] \.home-map-wrap\s*\{[^}]*height:\s*min\(720px,\s*78vh\)/,
);
```

- [ ] **Step 2: Run responsive tests and verify RED**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --test tests/homepage-art-integration.test.mjs tests/art-history-ui-numbering.test.mjs
```

Expected: FAIL because mobile Art still uses a 300px wrapper and compact controls do not restore 44px touch geometry.

- [ ] **Step 3: Give the embedded Art map useful mobile height**

In the homepage `@media (max-width: 900px)` block, use:

```css
.map-card[data-subject="art"] .home-map-wrap {
  flex:0 0 auto;
  height:min(720px, 78vh);
}
```

Leave World History’s 300px mobile map height unchanged.

- [ ] **Step 4: Add narrow-screen Art rules**

Inside `@media (max-width:520px)`, keep the existing stacked map/detail layout and add:

```css
body.is-embedded {
  height:auto;
  min-height:100vh;
  overflow:auto;
}
body.is-embedded .filter-toolbar { padding:8px 12px; }
body.is-embedded .art-workspace {
  width:100%;
  max-width:none;
  height:auto;
  min-height:0;
  margin:0;
  border:0;
  border-radius:0;
}
.filter-pill,
.clear-button,
select,
input[type="search"] {
  min-height:44px;
}
.map-controls button {
  width:44px;
  height:44px;
  min-width:44px;
  min-height:44px;
}
```

Preserve the existing 330px map minimum, stacked detail border, and no-horizontal-overflow rules.

- [ ] **Step 5: Run every automated check**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --test tests/*.test.mjs
```

Expected: 48 or more tests PASS with zero failures.

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  scripts/validate-art-history-data.mjs art-history-map.html
```

Expected: the approved 27-work dataset validates successfully.

- [ ] **Step 6: Run the UI/UX pre-delivery review**

Read `/Users/tiffanyxu/.codex/skills/ui-ux-pro-max/references/pro-rules.md` and verify:

- visible keyboard focus;
- readable light-theme contrast;
- no emoji used as newly introduced action icons;
- hover transitions stay within 150–300ms;
- `prefers-reduced-motion` remains present;
- desktop controls are compact while narrow touch targets remain 44px;
- no horizontal overflow.

- [ ] **Step 7: Verify World and Art in the same homepage**

Serve the development copy locally, then inspect the homepage at approximately 1440px, 1024px, 768px, and 375px CSS viewport widths.

At each size:

- World History remains visually unchanged.
- Art History hides its duplicate internal header.
- Art filters use compact consistent geometry.
- Map controls are a 30px vertical stack on desktop and 44px on narrow screens.
- AP pins visually match World’s 22px circles.
- English titles are 19px; body copy is 13.5px; tabs are 13px.
- The Art detail panel is readable and scrollable.
- No content overlaps or produces horizontal page scrolling.

- [ ] **Step 8: Commit Task 4**

```bash
git add index.html art-history-map.html tests/homepage-art-integration.test.mjs tests/art-history-ui-numbering.test.mjs
git commit -m "test: verify responsive world-aligned art UI"
```

- [ ] **Step 9: Sync the verified files to the Desktop live project**

After all tests and browser checks pass, copy only the verified changed runtime files and tests to:

```text
/Users/tiffanyxu/Desktop/APWH/考前冲刺_地区专题_试做版/
```

Create recoverable backups before overwriting Desktop files. Reload `http://127.0.0.1:4173/` and repeat the Art/World comparison on the live copy.

## Self-review

- Spec coverage: embedded/standalone modes, typography, filters, controls, pins, detail panel, responsive behavior, accessibility, automated checks, and browser comparison are each assigned to a task.
- Placeholder scan: no TBD/TODO or undefined implementation step remains.
- Type consistency: the plan retains the existing `getMarkerMetrics(apLabel, isSingle, screenScale)` and `getExpandedPinMetrics(screenScale)` signatures used by the current renderer and tests.
- Scope control: `world-map.html`, artwork data, numbering, coordinates, and images remain unchanged.
