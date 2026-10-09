# World Map Ten-Event Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current dense decade timeline in `world-map.html` with a compact, map-internal pilot containing 10 representative, clickable historical events.

**Architecture:** Keep the timeline inside `.map-zone` as a sibling overlay to `.mapstage`, so timeline gestures never enter the map pan/zoom listeners. A small `TIMELINE_EVENTS` configuration drives rendering; activation reuses the existing Period setter and `openHit()` map-location path instead of creating a second detail system.

**Tech Stack:** Single-file HTML/CSS/vanilla JavaScript, Node.js built-in `node:test`, existing APWH map event index and filter API.

---

## File structure

- Modify `world-map.html`: replace the current density timeline CSS, renderer, exact-decade state, and click/scrub behavior with the ten-event overlay.
- Create `tests/world-map-event-timeline.test.mjs`: static integration tests for event configuration, embedded placement, accessible activation, and mode isolation.
- Preserve the pre-existing unstaged `exitQuiz()` filter-restoration ordering fix; it is not part of this feature commit.

### Task 1: Lock the pilot contract with failing tests

**Files:**
- Create: `tests/world-map-event-timeline.test.mjs`
- Test: `tests/world-map-event-timeline.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const WORLD_HTML_PATH = new URL('../world-map.html', import.meta.url);

async function loadHtml() {
  return readFile(WORLD_HTML_PATH, 'utf8');
}

test('map timeline is a ten-event pilot in chronological order', async () => {
  const html = await loadHtml();
  const config = html.match(/const TIMELINE_EVENTS = \[([\s\S]*?)\n\s*\];/)?.[1] || '';
  const pins = [...config.matchAll(/pin:\s*(\d+)/g)].map((match) => Number(match[1]));
  const years = [...config.matchAll(/year:\s*(\d+)/g)].map((match) => Number(match[1]));

  assert.deepEqual(pins, [8, 23, 18, 45, 26, 36, 63, 30, 81, 56]);
  assert.deepEqual(years, [1200, 1347, 1453, 1492, 1648, 1780, 1839, 1914, 1957, 1979]);
  assert.equal((config.match(/eventLabel:/g) || []).length, 10);
});

test('timeline is embedded as a compact overlay inside the map zone', async () => {
  const html = await loadHtml();
  const mapZone = html.match(/<div class="map-zone">([\s\S]*?)<div class="event-zone"/)?.[1] || '';

  assert.match(mapZone, /<div class="mapstage">/);
  assert.match(mapZone, /<div class="map-timeline" id="mapTimeline"/);
  assert.match(html, /\.mapstage\s*\{[^}]*inset:\s*0;/s);
  assert.match(html, /\.map-timeline\s*\{[^}]*position:\s*absolute;[^}]*bottom:\s*(?:10|12)px;[^}]*height:\s*50px;/s);
  assert.match(html, /\.tl-rail\s*\{[^}]*grid-template-columns:\s*repeat\(10,/s);
});

test('timeline reuses period and map-hit activation with accessible buttons', async () => {
  const html = await loadHtml();

  assert.match(html, /function renderEventTimeline\(\)/);
  assert.match(html, /function activateTimelineEvent\(item\)/);
  assert.match(html, /setPeriod\(period\.id\)/);
  assert.match(html, /openHit\(String\(item\.pin\),\s*group\.dataset\.region\)/);
  assert.match(html, /class="tl-event\$\{inPeriodClass\}\$\{activeClass\}"[^>]*data-timeline-pin=/);
  assert.match(html, /type="button"/);
  assert.match(html, /aria-label=/);
  assert.doesNotMatch(html, /class="tl-cell"/);
  assert.doesNotMatch(html, /activeSpan/);
});

test('route, chain and quiz modes isolate the timeline', async () => {
  const html = await loadHtml();

  assert.match(html, /function enterRouteMode\(id\)[\s\S]*?setTimelineHidden\(true\)/);
  assert.match(html, /function exitRouteMode\(quiet\)[\s\S]*?if \(!quiet\) setTimelineHidden\(false\)/);
  assert.match(html, /function startQuiz\(mode\)[\s\S]*?setTimelineHidden\(true\)/);
  assert.match(html, /function exitQuiz\(\)[\s\S]*?setTimelineHidden\(false\)/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/world-map-event-timeline.test.mjs
```

Expected: FAIL because `TIMELINE_EVENTS`, `renderEventTimeline()`, and the compact overlay styles do not exist yet.

### Task 2: Replace the density timeline with ten event nodes

**Files:**
- Modify: `world-map.html` timeline CSS near the top of the file
- Modify: `world-map.html` timeline markup immediately after `.mapstage`
- Modify: `world-map.html` timeline JavaScript inside `initSearchFilter()`
- Test: `tests/world-map-event-timeline.test.mjs`

- [ ] **Step 1: Replace the timeline layout CSS**

Use this compact overlay contract; retain the existing warm palette variables:

```css
.map-zone { flex: 0 0 auto; height: 500px; position: relative; background: var(--ocean); }
.mapstage { position: absolute; inset: 0; overflow: hidden; }
.map-timeline {
  position: absolute; z-index: 60; left: 14px; right: 14px; bottom: 12px; height: 50px;
  border: 1px solid rgba(216,201,168,.95); border-radius: 10px;
  background: rgba(255,253,248,.90); box-shadow: 0 5px 18px rgba(33,31,28,.14);
  backdrop-filter: blur(5px); overflow-x: auto; overflow-y: hidden;
  overscroll-behavior-x: contain; touch-action: pan-x; user-select: none;
}
.map-zone.tl-off .map-timeline { display: none; }
.tl-rail {
  position: relative; display: grid; grid-template-columns: repeat(10, minmax(72px, 1fr));
  align-items: stretch; min-width: 720px; height: 100%; padding: 0 8px;
}
.tl-rail::before {
  content: ""; position: absolute; left: 40px; right: 40px; top: 17px;
  height: 2px; background: var(--line-strong);
}
.tl-event {
  position: relative; z-index: 1; min-width: 0; padding: 25px 3px 3px;
  border: 0; background: transparent; color: var(--ink-soft);
  font: inherit; font-size: 9px; font-weight: 700; cursor: pointer;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.tl-event::before {
  content: ""; position: absolute; left: 50%; top: 12px; width: 9px; height: 9px;
  transform: translateX(-50%); border: 1px solid var(--surface); border-radius: 2px;
  background: #b98a6a; box-shadow: 0 0 0 1px var(--line-strong);
}
.tl-event.in-period { color: var(--accent); background: rgba(139,26,26,.05); }
.tl-event.in-period::before, .tl-event.active::before { background: var(--accent); }
.tl-event.active { box-shadow: inset 0 -2px var(--accent); }
.tl-event:focus-visible { outline: 2px solid #28708a; outline-offset: -2px; }
@media (max-width: 720px) {
  .map-timeline { left: 8px; right: 8px; bottom: 8px; }
}
```

- [ ] **Step 2: Keep minimal map-internal markup**

```html
<div class="map-timeline" id="mapTimeline" role="region" aria-label="十个代表事件时间轴">
  <div class="tl-rail" id="tlRail"></div>
</div>
```

- [ ] **Step 3: Add the exact ten-event configuration and renderer**

Place this inside `initSearchFilter()` after `PERIODS` and after helpers needed by activation are available:

```js
const TIMELINE_EVENTS = [
  { year:1200, yearLabel:'1200', pin:8, eventLabel:'Pax Mongolica' },
  { year:1347, yearLabel:'1347', pin:23, eventLabel:'Black Death' },
  { year:1453, yearLabel:'1453', pin:18, eventLabel:'Ottoman conquest of Constantinople' },
  { year:1492, yearLabel:'1492', pin:45, eventLabel:'Columbian Exchange' },
  { year:1648, yearLabel:'1648', pin:26, eventLabel:'Peace of Westphalia' },
  { year:1780, yearLabel:'1780s', pin:36, eventLabel:'Industrial Revolution' },
  { year:1839, yearLabel:'1839', pin:63, eventLabel:'Amazon rubber boom' },
  { year:1914, yearLabel:'1914', pin:30, eventLabel:'World War I' },
  { year:1957, yearLabel:'1957', pin:81, eventLabel:'Ghana independence and Nkrumah' },
  { year:1979, yearLabel:'1979', pin:56, eventLabel:'Sandinistas and Contras' },
];

const tlRail = document.getElementById('tlRail');
let activeTimelinePin = null;
const timelinePeriod = item => PERIODS.find(period => item.year >= period.from && item.year < period.to);

function validTimelineEvents() {
  return TIMELINE_EVENTS.filter(item => {
    const exists = !!index[String(item.pin)] && pinGroups().some(group => pinNum(group) === String(item.pin));
    if (!exists) console.warn(`Timeline event skipped: missing pin ${item.pin} (${item.eventLabel})`);
    return exists;
  });
}

function renderEventTimeline() {
  if (!tlRail) return;
  const items = validTimelineEvents();
  const timeline = document.getElementById('mapTimeline');
  if (timeline) timeline.hidden = items.length === 0;
  tlRail.innerHTML = items.map(item => {
    const period = timelinePeriod(item);
    const inPeriodClass = period && period.id === activePeriod ? ' in-period' : '';
    const activeClass = item.pin === activeTimelinePin ? ' active' : '';
    const aria = `${item.yearLabel} · ${item.eventLabel} · 地图标点 ${item.pin}`;
    return `<button type="button" class="tl-event${inPeriodClass}${activeClass}" data-timeline-pin="${item.pin}" aria-label="${aria}" title="${aria}">${item.yearLabel}</button>`;
  }).join('');
}

function activateTimelineEvent(item) {
  if (routeMode || quizMode) return;
  const group = pinGroups().find(candidate => pinNum(candidate) === String(item.pin));
  if (!group) return;
  const period = timelinePeriod(item);
  if (period) setPeriod(period.id);
  activeTimelinePin = item.pin;
  renderEventTimeline();
  openHit(String(item.pin), group.dataset.region);
}

if (tlRail) tlRail.addEventListener('click', event => {
  const button = event.target.closest('[data-timeline-pin]');
  if (!button) return;
  const item = TIMELINE_EVENTS.find(candidate => candidate.pin === Number(button.dataset.timelinePin));
  if (item) activateTimelineEvent(item);
});

renderEventTimeline();
```

- [ ] **Step 4: Synchronize visual state after existing filters apply**

Add one call at the end of `apply()`:

```js
renderEventTimeline();
```

Remove the old `activeSpan`, `setSpan`, decade-density builder, scrub-preview listeners, wheel-to-horizontal conversion, and `tl-cell` rendering. Keep the existing `setTimelineHidden()` helper because quiz and route isolation use it.

- [ ] **Step 5: Run the focused test**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/world-map-event-timeline.test.mjs
```

Expected: all four tests PASS except the route-mode isolation test if Task 3 is not yet applied.

### Task 3: Isolate route, chain, and quiz modes

**Files:**
- Modify: `world-map.html` route and quiz entry/exit functions
- Test: `tests/world-map-event-timeline.test.mjs`

- [ ] **Step 1: Hide the timeline while a route or causal chain owns the map**

In `enterRouteMode(id)`, immediately after confirming a route exists:

```js
setTimelineHidden(true);
```

In `exitRouteMode(quiet)`, restore the timeline only for a real user exit:

```js
if (!quiet) setTimelineHidden(false);
```

The existing `startQuiz()` and `exitQuiz()` calls to `setTimelineHidden(true/false)` remain unchanged.

- [ ] **Step 2: Keep focused pins above the overlay safe area**

In `fitToPins()`, reserve 96 SVG viewBox units at the bottom (about 60 CSS pixels in the 500px-high default map):

```js
const TIMELINE_SAFE_VB = 96;
const fitHeight = VB_H - TIMELINE_SAFE_VB;
const targetZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(VB_W / boxW, fitHeight / boxH)));
const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
const targetPanX = VB_W / 2 - cx * targetZoom;
const targetPanY = fitHeight / 2 - cy * targetZoom;
```

This changes only programmatic `fitToPins()` framing. Manual panning and pointer-coordinate conversion remain unchanged.

- [ ] **Step 3: Run the focused test again**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/world-map-event-timeline.test.mjs
```

Expected: 4 tests PASS.

### Task 4: Regression verification and scoped commit

**Files:**
- Modify: `world-map.html`
- Create: `tests/world-map-event-timeline.test.mjs`

- [ ] **Step 1: Run every Node test**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 2: Run release verification if its prerequisites are available**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify-art-history-release.mjs
```

Expected: verifier exits 0. If browser dependencies are unavailable, report that separately; do not weaken the timeline tests.

- [ ] **Step 3: Inspect the final diff and verify the prior quiz fix remains unstaged**

Run:

```bash
git diff --check
git diff -- world-map.html tests/world-map-event-timeline.test.mjs
```

Expected: no whitespace errors; the `exitQuiz()` restoration-order hunk is preserved.

- [ ] **Step 4: Stage only the timeline hunks and exact test file**

Run interactively:

```bash
git add tests/world-map-event-timeline.test.mjs
git add -p world-map.html
```

Accept timeline CSS, markup, renderer, and route-isolation hunks. Decline the pre-existing `exitQuiz()` hunk that moves `restoreFilters()` below pin clearing.

- [ ] **Step 5: Commit the prototype**

```bash
git commit -m "Add ten-event world map timeline prototype"
```

Expected: commit contains only the timeline implementation and its test; the earlier `exitQuiz()` fix remains visible in `git status` as an unstaged modification.
