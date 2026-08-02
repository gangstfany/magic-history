# APUSH Period 1 Dual-Layout Prototype Design

## Status

Approved in conversation on 2026-08-02. This document defines the first
American-history prototype release for Magic History.

## Goal

Create one standalone AP U.S. History interactive page that can render two
genuinely comparable Period 1 layouts:

- Layout A: map-led.
- Layout C: map plus timeline.

Both layouts must use exactly the same data, filters, map behavior, and detail
content. The user will compare the working prototypes before choosing the
layout used for Periods 2-3 and the eventual homepage integration.

## Release Boundary

### Included

- APUSH Period 1, 1491-1607.
- Nine core learning nodes covering the complete Period 1 topic arc.
- A detailed world geography layer initially fitted to the Atlantic and the
  Americas.
- Search, APUSH theme filtering, result count, map zoom/pan/reset, selectable
  map markers, and an event detail panel.
- Two URLs backed by one implementation:
  - `apush-map.html?layout=a`
  - `apush-map.html?layout=c`
- Responsive, keyboard-accessible behavior.
- A data manifest, source ledger, validator, Node tests, and browser checks.

### Deferred

- Periods 2-9.
- Homepage subject-switcher integration.
- Quizzes, mistake-book persistence, user accounts, analytics, annotations,
  or teacher packs.
- A final choice between layouts A and C.

After the user chooses a layout, the next release will extend the same data
model through Period 3 and embed the selected layout into `index.html` as a
persistent US History iframe.

## Approaches Considered

### Selected: one page with a layout parameter

`apush-map.html` reads `layout=a` or `layout=c` from the query string. It owns
one application state and one set of components. CSS and a small rendering
branch control whether the timeline is present.

This produces two directly comparable URLs without duplicating data,
interaction logic, or bug fixes. An absent or invalid layout value falls back
to layout A.

### Rejected: two HTML shells with shared assets

This would make the two entry names obvious, but it adds files and integration
checks without improving the comparison.

### Rejected: two independent pages

This provides maximum freedom but would allow content and behavior to drift,
making the visual comparison unreliable and Period 2-9 expansion expensive.

## Information Architecture

The standalone page contains:

1. A page header with the APUSH title, Period 1 date range, and a concise
   description. The structure will support a later embedded mode.
2. A filter toolbar with a fixed Period 1 control, search, APUSH theme pills,
   a result count, and a clear-filters action.
3. An interactive map and a fixed detail panel.
4. Layout C only: a horizontal timeline below the map. Layout A gives that
   space back to the map.
5. A visible prototype label identifying A or C so screenshots cannot be
   confused.

The detail panel is part of the APUSH page. The homepage will not copy or
inspect its DOM when integration happens later.

## Shared State and Data Flow

The page has one state object:

- `layout`: `a` or `c`.
- `query`: normalized search text.
- `activeThemes`: selected APUSH theme IDs.
- `visibleEventIds`: the current filtered result.
- `selectedEventId`: the active learning node.
- `mapTransform`: bounded zoom and pan state.

The data flow is:

1. Load and validate the Period 1 dataset.
2. Read the layout parameter and initialize controls.
3. Apply search and theme filters to the shared event collection.
4. Render the same visible events as map markers and, in layout C, timeline
   stops.
5. Selecting either representation updates `selectedEventId`, highlights all
   representations of that event, and renders one shared detail card.

Changing filters keeps the selected event only if it remains visible.
Otherwise, the detail panel returns to its instructional empty state. Clearing
filters restores the full set and map overview.

## Period 1 Content

The nine core learning nodes are:

1. Indigenous North America in 1491: regional environmental adaptation,
   represented through multiple geographic anchors for the Southwest,
   Great Basin/Great Plains, Mississippi Valley, and Eastern Woodlands.
2. European exploration: motives, technology, and competing imperial routes.
3. Columbus reaches the Caribbean in 1492.
4. The Columbian Exchange: crops, animals, disease, forced movement, and
   demographic transformation.
5. Cortes and the conquest of the Mexica/Aztec Empire, 1519-1521.
6. Pizarro and the conquest of the Inca Empire, 1532-1533.
7. Spanish colonial labor, slavery, and the caste system.
8. Cultural interaction, resistance, accommodation, and religious debate.
9. St. Augustine and the Spanish borderlands, 1565.

The first node is one learning record with several map anchors. Other records
may also have more than one anchor when a process is inherently transregional.
The detail content must explain that a marker is a study anchor rather than a
claim that a continent-scale process happened at only one point.

Each card uses concise Chinese synthesis while preserving standard English AP
terms. No long passages from the source material will be reproduced.

## APUSH Theme Filtering

Use the official eight-theme vocabulary:

- `NAT`: American and National Identity.
- `WXT`: Work, Exchange, and Technology.
- `GEO`: Geography and the Environment.
- `MIG`: Migration and Settlement.
- `PCE`: Politics and Power.
- `WOR`: America in the World.
- `ARC`: American and Regional Culture.
- `SOC`: Social Structures.

Theme pills are multi-select and combine using OR logic within the theme
dimension. Search combines with the selected themes using AND logic. This is
more useful for a small Period 1 set than requiring one event to match every
selected theme.

## Data Model

Use a normalized external dataset as the runtime source of truth:

- `schemaVersion`.
- `periods`.
- `themes`.
- `sites`.
- `events`.
- `sources`.

Each event contains:

- stable `id`;
- `titleEn` and `titleZh`;
- explicit `periodId`;
- `dateLabel`, `startYear`, and `endYear`;
- one or more `siteIds`, plus an optional `primarySiteId`;
- controlled `themeIds`;
- concise `summary`, `significance`, and `examConnection`;
- `causeIds`, `effectIds`, and `relatedIds`;
- Chinese and English `keywords`;
- one or more `sourceIds`.

Sites contain a stable ID, bilingual name, map coordinates in the inherited
`1600 x 800` viewBox, region, and an optional precision qualifier. A separate
manifest freezes the approved nine event IDs and their display order so data
tests can detect silent omissions or additions.

## Source Priority

Use sources in this order:

1. The College Board AP U.S. History Course and Exam Description in the
   user's materials.
2. `AMSCO Advanced Placement United States History, 4th Edition`.
3. The user's 2025 Period 1 review-note PDFs.
4. Other user-provided textbooks only when the first three do not resolve an
   ambiguity.

The source ledger records the human-readable source, file path, relevant page
range, and which event IDs it supports. Known errors in the review notes must
not be propagated, including the Henry Hudson/Northwest Passage claim and the
misplaced 1619 material.

## Visual Design

Both layouts continue Magic History's warm-paper palette, rounded panels,
serif display type, muted geography, and high-contrast numbered markers.
Markers use stable colors by APUSH theme or content group, with a separate
selected-state ring so color is not the only selection cue.

### Layout A: map-led

- Desktop: map approximately two thirds, detail panel approximately one
  third.
- The map uses the full available height beneath the filter toolbar.
- Chronology appears inside each detail card through date, causes, effects,
  and linked events, but there is no persistent timeline.

### Layout C: map plus timeline

- Desktop: the same map and detail columns.
- A compact horizontal timeline sits below the map column.
- Timeline stops show year and short title, support horizontal scrolling when
  necessary, and use the same selection state as map markers.
- The map is shorter than layout A by exactly the timeline allocation, making
  the trade-off visible rather than hiding it through a taller page.

The two layouts otherwise use identical colors, typography, content density,
controls, and detail cards.

## Map Interaction

- Preserve the detailed world SVG geography without World History pins,
  routes, event panels, or scripts.
- Fit the initial view to all visible Period 1 anchors in the Atlantic and the
  Americas.
- Support bounded zoom, pan, and reset-to-overview.
- Use a visible marker plus a separate 44 CSS-pixel interaction target.
- Make every marker keyboard focusable and activatable with Enter or Space.
- When several events share an anchor, use deterministic separation or a
  count marker with accessible event navigation.
- When one event has multiple anchors, all anchors select the same event and
  share an accessible label that explains the relationship.

## Detail Panel

The initial state explains how to select a map marker or timeline stop. A
selected card contains:

- bilingual title;
- date and location;
- Period and APUSH theme labels;
- concise narrative;
- historical significance;
- AP exam connection;
- causes, effects, and related-event links;
- source references.

Linked events update the shared selection and bring the corresponding map
marker, and timeline stop in layout C, into view.

## Responsive and Accessibility Behavior

- Wide and normal desktop: map and detail panel remain side by side.
- Mobile: map, timeline for layout C, and detail panel stack in that order.
- Controls and interactive markers have at least 44 CSS-pixel hit areas.
- No horizontal page overflow. Layout C's timeline may scroll inside its own
  labelled region.
- Visible focus styles are required for filters, search, markers, timeline
  stops, detail links, and map controls.
- Semantic buttons are used instead of click-only generic elements.
- Reduced-motion preferences disable nonessential transitions.
- Selection and filter state must be conveyed through text or ARIA state as
  well as color.

## Error Handling

- Invalid or missing `layout` parameter: fall back to layout A and show the A
  prototype label.
- Dataset load failure: show a visible retryable error state rather than an
  empty map.
- No filter results: show the query and a clear-filters action.
- Missing required fields, duplicate IDs, unknown themes/sites/sources,
  unresolved relationships, invalid date ranges, or out-of-bounds coordinates:
  fail the release validator.
- A missing optional relationship must not break the detail card.

## Verification and Acceptance Criteria

### Data

- The manifest contains exactly nine approved Period 1 event IDs.
- Every event has complete bilingual identity, dates, themes, anchors, study
  content, and sources.
- IDs are unique and all theme, site, source, and relationship references
  resolve.
- Coordinates are inside the `1600 x 800` map viewBox.
- The source ledger covers every event.

### Functional parity

- Layout A and C produce the same filtered event IDs for every search and
  theme combination.
- Every marker opens the correct shared detail record.
- Layout C timeline stops select the same records as the map.
- Layout A contains no hidden interactive timeline.
- Layout C's map allocation is visibly smaller by the timeline height.

### Browser and responsive checks

- Verify both URLs at `1440 x 900`, `1024 x 768`, `375 x 812`, and
  `667 x 375`.
- Check zoom, pan, reset, search, theme filtering, clear filters, marker
  selection, detail links, keyboard activation, and reduced motion.
- Check zero unintended horizontal overflow and zero console errors.
- Walk every manifest event at least once in each layout.

### Regression boundary

- This release does not modify `index.html` or `world-map.html`.
- Existing World History behavior remains untouched.
- The known Art History branch divergence is not merged as part of this
  prototype.

## Implementation Work Division

To reduce duplicated reading and token use, implementation will use three
agents with non-overlapping file ownership:

1. Data agent: Period 1 dataset, manifest, and source ledger only.
2. Page agent: `apush-map.html` only, consuming the agreed data contract.
3. Verification agent: validator, tests, and browser-check scripts only.

Agents will not modify one another's files. The primary agent will review the
three results, integrate them, run the complete verification set, and make any
cross-boundary fixes.

## Deliverables

- `apush-map.html`
- `data/apush-period-1.json`
- `data/apush-period-1-manifest.json`
- `docs/data-sources/apush-period-1-source-ledger.md`
- `scripts/validate-apush-data.mjs`
- `scripts/verify-apush-browser.mjs`
- `scripts/verify-apush-release.mjs`
- `tests/apush-data.test.mjs`

Homepage integration files and tests are intentionally deferred until the
user selects layout A or C.
