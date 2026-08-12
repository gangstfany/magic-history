# AP World Card Timeline Dock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the student-approved bilingual horizontal card Timeline Dock to AP World Units 1–9 inside `world-map.html` and synchronize it with map pins, filters, and event detail.

**Architecture:** Keep `world-map.html` as the owner of AP World state and add one regular-HTML Timeline region between the map and event-detail region. Adapt the existing `index` event records into stable Timeline records, route card and pin activation through the existing `openHit`/event rendering path, and expose only read-only Timeline state through `window.__mapFilter` for verification.

**Tech Stack:** Static HTML/CSS/vanilla JavaScript, inline SVG map, Node.js browser verification with Playwright.

---

### Task 1: Add AP World Timeline browser acceptance coverage

**Files:**
- Create: `scripts/verify-world-timeline.mjs`
- Modify: `tests/apush-data.test.mjs` only if a reusable static assertion belongs with the existing Node test suite; otherwise leave it unchanged

- [ ] **Step 1: Write a failing browser verifier for structure and Units 1–9**

Create `scripts/verify-world-timeline.mjs`. Follow the HTTP-server and Playwright-loading pattern in `scripts/verify-apush-browser.mjs`. The verifier must open `/world-map.html`, wait for `window.__mapFilter`, and assert:

```js
const dock = page.locator('#worldTimelineDock');
assert.equal(await dock.count(), 1);
await expectVisible(dock, 'AP World card Timeline must be visible');
assert.equal(await dock.locator('.world-timeline-track').count(), 1);

for (const period of (await page.evaluate(() => window.__mapFilter.getPeriodOptions())).filter(({ value }) => value)) {
  await page.evaluate((id) => window.__mapFilter.setPeriod(id), period.value);
  const cards = dock.locator('button.world-timeline-card[data-event-key]');
  assert.ok(await cards.count() > 0, `${period.value} must render Timeline cards`);
  assert.equal(await cards.locator('.world-timeline-date').count(), await cards.count());
  assert.equal(await cards.locator('.world-timeline-title-en').count(), await cards.count());
  assert.equal(await cards.locator('.world-timeline-title-zh').count(), await cards.count());
}
```

The helper `expectVisible(locator, message)` must throw when `locator.isVisible()` is false. Use a dynamically allocated localhost port and close the browser and server in `finally`.

- [ ] **Step 2: Add failing synchronization and accessibility assertions**

In the same verifier, select a Unit with at least two events and assert the following concrete behavior:

```js
const cards = dock.locator('button.world-timeline-card[data-event-key]');
await cards.nth(1).click();
assert.equal(await cards.nth(1).getAttribute('aria-current'), 'step');
assert.ok((await page.locator('#eventPanel').innerText()).trim().length > 0);

await cards.nth(0).focus();
await cards.nth(0).press('ArrowRight');
assert.equal(await page.evaluate(() => document.activeElement?.dataset.eventKey), await cards.nth(1).getAttribute('data-event-key'));
await cards.nth(1).press('End');
assert.equal(await page.evaluate(() => document.activeElement?.dataset.eventKey), await cards.last().getAttribute('data-event-key'));
```

Also record `window.scrollY` and `.world-timeline-track.scrollLeft`, activate an off-screen map-linked event through `window.__mapFilter.openHit`, then assert the document did not move while the Timeline track revealed the selected card. Assert each card has an accessible name, a minimum rendered height of 44px, and exactly one card has `aria-current="step"` whenever results are non-empty.

- [ ] **Step 3: Run the verifier and confirm the red state**

Run:

```bash
node scripts/verify-world-timeline.mjs
```

Expected: FAIL because `#worldTimelineDock` and `.world-timeline-card` do not exist.

- [ ] **Step 4: Commit the failing acceptance test**

```bash
git add scripts/verify-world-timeline.mjs
git commit -m "test: define AP World card timeline behavior"
```

### Task 2: Implement the embedded AP World card Timeline

**Files:**
- Modify: `world-map.html`
- Test: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Add the Timeline region and student-approved card styling**

Insert the regular-HTML region immediately after `.map-zone` and before `.event-zone`:

```html
<section id="worldTimelineDock" class="world-timeline-dock" aria-label="AP World History timeline">
  <div class="world-timeline-head">
    <strong id="worldTimelineTitle">AP World Timeline</strong>
    <span>时序导航 · Chronological navigation</span>
  </div>
  <div class="world-timeline-track" tabindex="-1">
    <ol id="worldTimelineList" class="world-timeline-list"></ol>
  </div>
</section>
```

Add scoped CSS matching the approved warm card layout. Required behavioral declarations:

```css
.world-timeline-dock { flex: 0 0 auto; padding: 12px 18px 16px; border-top: 1px solid var(--line-strong); background: var(--surface); }
.world-timeline-track { overflow-x: auto; overflow-y: hidden; overscroll-behavior-inline: contain; scrollbar-gutter: stable; }
.world-timeline-list { display: flex; gap: 12px; width: max-content; margin: 0; padding: 0 2px 6px; list-style: none; }
.world-timeline-card { width: 270px; min-height: 112px; padding: 13px 15px; text-align: left; border: 1px solid var(--line-strong); border-radius: 10px; background: var(--surface); color: var(--ink); cursor: pointer; }
.world-timeline-card[aria-current="step"] { border: 2px solid #8b3f34; background: #f4dfc1; }
.world-timeline-card:focus-visible { outline: 3px solid #28708a; outline-offset: 2px; }
@media (max-width: 720px) { .world-timeline-card { width: min(78vw, 270px); } }
```

Include readable styles for `.world-timeline-date`, `.world-timeline-title-en`, and `.world-timeline-title-zh`. Do not add Timeline markup to `index.html`.

- [ ] **Step 2: Build stable Timeline records from existing event data**

Near the existing `index` and filter setup, create one flattened record per existing event occurrence. Use a stable key composed from pin number and the event's position within that pin's array so duplicate labels cannot collide:

```js
const timelineRecords = Object.entries(index).flatMap(([pin, events]) =>
  events.map((event, eventIndex) => ({
    key: `${pin}:${eventIndex}`,
    pin,
    region: document.querySelector(`.pin-group text`) ?
      Array.from(document.querySelectorAll('.pin-group')).find(group => pinNum(group) === pin)?.dataset.region || '' : '',
    event,
  })));
```

Refine the region lookup without repeated DOM scanning by building a `Map` from the existing pin groups once. Add pure helpers:

```js
const timelineYear = record => record.event.yr || '';
const timelineEnglish = record => record.event.titleEn || record.event.en || record.event.term || stripHTML(record.event.trigHTML);
const timelineChinese = record => record.event.titleZh || record.event.zh || stripHTML(record.event.trigHTML);
const timelineSortValue = record => Number.parseInt(String(record.event.yr).match(/-?\d{1,4}/)?.[0] || '9999', 10);
```

Use the actual event fields found in `world-map.html`; do not introduce blank labels. Keep content in its existing source.

- [ ] **Step 3: Render cards from the same filter result as map pins**

Add `renderWorldTimeline(records, periodId)` that replaces `#worldTimelineList` children with semantic list items and buttons. Each button must have `data-event-key`, `data-pin`, `data-region`, a bilingual accessible name, and the three required child labels.

```js
button.type = 'button';
button.className = 'world-timeline-card';
button.dataset.eventKey = record.key;
button.dataset.pin = record.pin;
button.dataset.region = record.region;
button.setAttribute('aria-label', `${timelineYear(record)} · ${timelineEnglish(record)} · ${timelineChinese(record)}`);
```

Sort by chronological value while preserving original order for ties. Update `#worldTimelineTitle` from the active Unit label. When no records remain, render one non-button `<li class="world-timeline-empty">没有符合当前筛选的事件</li>` and clear selection.

Refactor `apply()` so its existing `passed` event occurrences also produce the exact Timeline records rendered by `renderWorldTimeline`. In the unfiltered state, the Dock shows the active/default Unit's records rather than all 100+ events. Unit, search, category, and region scope must narrow markers, results, and Timeline from the same predicate.

- [ ] **Step 4: Centralize selection and synchronize cards, pins, and detail**

Add `selectedTimelineKey` and a single selection entry point:

```js
function selectTimelineRecord(record, { moveMap = true, revealCard = true } = {}) {
  if (!record) return;
  selectedTimelineKey = record.key;
  openHit(record.pin, record.region);
  syncWorldTimelineSelection(revealCard);
}
```

`syncWorldTimelineSelection` sets `aria-current="step"` only on the selected card and calls `card.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' })` only when the card lies outside the track viewport. Preserve `window.scrollX/window.scrollY` around reveal if necessary; the intended implementation scrolls the track, never the document.

Card click and Enter/Space call `selectTimelineRecord`. Map-pin activation and the public `openHit` path look up the first visible record for that pin and call the same selection synchronization after the existing detail render. Multi-event pins retain the specific Timeline selection when it is known; otherwise select their first visible event.

On a Unit/filter change, retain selection only if the key remains visible; otherwise select the first remaining record and render its detail. Events without a map location remain selectable in the Dock and update the existing detail representation without changing map transform.

- [ ] **Step 5: Add roving keyboard navigation**

On `.world-timeline-track`, handle ArrowLeft, ArrowRight, Home, and End only when a `.world-timeline-card` owns focus:

```js
const cards = [...timelineList.querySelectorAll('.world-timeline-card')];
const current = cards.indexOf(event.target.closest('.world-timeline-card'));
const next = event.key === 'Home' ? 0
  : event.key === 'End' ? cards.length - 1
  : event.key === 'ArrowLeft' ? Math.max(0, current - 1)
  : event.key === 'ArrowRight' ? Math.min(cards.length - 1, current + 1)
  : current;
if (next !== current) { event.preventDefault(); cards[next].focus(); }
```

Do not automatically select merely from arrow-key focus movement; Enter, Space, or click performs selection.

- [ ] **Step 6: Expose verification state without duplicating ownership**

Extend `window.__mapFilter` with read-only methods:

```js
getTimelineState: () => ({
  selectedKey: selectedTimelineKey,
  visibleKeys: visibleTimelineRecords.map(record => record.key),
}),
selectTimelineEvent: key => {
  const record = visibleTimelineRecords.find(item => item.key === key);
  if (record) selectTimelineRecord(record);
},
```

Keep `setPeriod`, `setQuery`, `toggleCat`, `reset`, and `openHit` backward compatible for the parent page.

- [ ] **Step 7: Run focused verification and fix only observed failures**

Run:

```bash
node scripts/verify-world-timeline.mjs
```

Expected: PASS with a summary covering all nine Units, card content, synchronization, keyboard behavior, scrolling, and mobile hit targets.

- [ ] **Step 8: Run regression verification**

Run:

```bash
node --test tests/apush-data.test.mjs
node scripts/verify-apush-browser.mjs
```

Expected: both commands exit 0; the APUSH Timeline and datasets remain unchanged.

- [ ] **Step 9: Commit the implementation**

```bash
git add world-map.html scripts/verify-world-timeline.mjs
git commit -m "feat: add AP World card timeline dock"
```

### Task 3: Visual and integration verification

**Files:**
- Modify: `world-map.html` only if verification identifies a concrete defect
- Test: `scripts/verify-world-timeline.mjs`

- [ ] **Step 1: Inspect the direct AP World page at desktop width**

Serve the repository locally and open `world-map.html` at approximately 1440×1000. Confirm the map remains the primary surface, the Dock forms one row immediately beneath it, card typography matches the approved screenshot, and the detail area remains below without overlap.

- [ ] **Step 2: Inspect the embedded homepage integration**

Open `index.html`, activate AP World, and verify there is exactly one Timeline. Confirm the iframe includes the Dock and the parent page does not duplicate it.

- [ ] **Step 3: Inspect narrow mobile behavior**

At approximately 390×844, swipe the Dock horizontally and confirm cards remain readable, no horizontal document overflow appears, controls keep at least a 44px hit target, and selecting a card does not jump the entire page.

- [ ] **Step 4: Re-run the full acceptance suite after any visual correction**

```bash
node scripts/verify-world-timeline.mjs
node --test tests/apush-data.test.mjs
node scripts/verify-apush-browser.mjs
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit any verified correction**

If `world-map.html` changed during visual verification:

```bash
git add world-map.html scripts/verify-world-timeline.mjs
git commit -m "fix: polish AP World timeline integration"
```

If no files changed, do not create an empty commit.
