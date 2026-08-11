# APUSH U1–U9 Timeline Dock Design

**Date:** 2026-08-11  
**Status:** Approved for implementation planning  
**Target branch:** `temporary-apush-period1-c-preview`

## Goal

Extend the lightweight Timeline Dock embedded below the APUSH map from Period 1 to all nine APUSH units. Students select a period from one page, then use the map and Dock together to orient themselves in time and space. The Dock remains a navigation aid; it does not gain learning progress, quizzes, mastery controls, or the behavior of the separate Timeline learning module.

This phase covers APUSH only. AP World History will reuse the resulting loader and data schema in a later, separately specified phase.

## Product Boundary

The map remains the dominant surface. The Dock stays in normal flow below it and shows only:

- a period-specific heading;
- a horizontally ordered sequence of dates and short Chinese event names;
- one visually and semantically current node.

The map summary card remains lightweight: date, place when applicable, Chinese title, and one-sentence Chinese summary. The page must not add course progress, comprehension questions, mastery ratings, review filters, or a second event-detail surface.

## Information Architecture

`apush-map.html` remains the single shared page. Its existing period selector becomes the entry point for Periods 1–9 and displays the College Board date band for each period.

Each period owns an independent data file and manifest:

```text
data/apush-period-1.json
data/apush-period-1-manifest.json
...
data/apush-period-9.json
data/apush-period-9-manifest.json
```

The page, map renderer, summary card, and Timeline Dock are shared. No per-period HTML copies are created. Independent data files keep review and collaboration scoped, and provide the reusable boundary needed for a later AP World History implementation.

## Period Registry and Loading

A small APUSH period registry is the source of truth for:

- period ID and number;
- English and Chinese label;
- start and end year;
- data and manifest paths.

On period selection, the controller:

1. records the requested period;
2. clears the previous period's query, theme filters, visible IDs, and selected event;
3. loads the matching dataset;
4. ignores any stale response if the student has already selected another period;
5. rebuilds the model and updates page copy, accessible names, result count, map, card, and Dock;
6. leaves the new period initially unselected so students first see its overall spatial distribution.

The currently active period is the only source of visible events and selection state. An event ID from a prior period must never remain selected after a switch.

If loading fails, the page retains the period selector, identifies the period that failed, and offers a retry for that period. A stale failure must not replace a newer successful selection.

## Event Content and Data Schema

Each period contains 7–10 chronological anchor events selected from the College Board AP U.S. History Course and Exam Description's period scope, topics, and themes. The event set should help a student see causation, continuity and change, and spatial relationships rather than attempting to reproduce every CED topic as a node.

Each event contains:

- stable globally unique ID;
- period ID and chronological order;
- start year, optional end year, and display date;
- English title, Chinese title, and concise Chinese Timeline title;
- one-sentence Chinese summary for the map card;
- one or more APUSH theme IDs;
- one or more source references;
- optional primary site and optional related sites.

Geographic coordinates are optional. National, institutional, legal, economic, or cultural developments that do not have one honest primary location remain in the Dock but do not create a fabricated map marker. Selecting one updates the summary card, leaves the current map viewport unchanged, and identifies it as a national or institutional development.

Period 1 retains its approved event content and is migrated only as needed to satisfy the shared loader/schema contract.

## Interaction Model

The map marker, existing summary card, and Timeline node share one `selectedEventId` within the active period.

### Marker selection

- update the shared selection;
- update the summary card;
- mark the matching Dock node with `aria-current="step"` and a visible non-color current cue;
- horizontally reveal that node by scrolling only the Dock track, never the page.

### Dock selection with a geographic site

- update the shared selection and summary card;
- select the matching marker;
- preserve existing map gesture and focus behavior.

### Dock selection without a geographic site

- update the shared selection and summary card;
- show no invented marker;
- keep the map viewport stable;
- show a concise national/institutional-location cue in the card.

Keyboard activation, focus visibility, and reduced-motion behavior use the same state transition as pointer selection. Reduced motion changes smooth Dock positioning to immediate positioning.

## Visual and Responsive Behavior

The approved Period 1 Dock appearance becomes the shared pattern:

- date above a short Chinese event title;
- a continuous chronological axis;
- compact current-state styling;
- map card and Dock selection synchronized;
- map visibly larger and more prominent than the Dock.

The Dock stays below the map at desktop, tablet, portrait mobile, and landscape mobile sizes. Only the Dock track scrolls horizontally. The document must not gain horizontal overflow, and the Dock must not cover or replace the map.

Long labels truncate visually while their complete date and event title remain available in the button's accessible name.

## Content Sources

The content baseline is the official [College Board AP U.S. History Course and Exam Description](https://apcentral.collegeboard.org/media/pdf/ap-us-history-course-and-exam-description.pdf) and its unit guides. Source ledgers record the CED topic or page locator used to justify each selected anchor, plus any supplemental authoritative reference needed for dates or geographic placement.

The period boundaries are:

| Unit | Period | Dates |
| --- | --- | --- |
| U1 | Period 1 | 1491–1607 |
| U2 | Period 2 | 1607–1754 |
| U3 | Period 3 | 1754–1800 |
| U4 | Period 4 | 1800–1848 |
| U5 | Period 5 | 1844–1877 |
| U6 | Period 6 | 1865–1898 |
| U7 | Period 7 | 1890–1945 |
| U8 | Period 8 | 1945–1980 |
| U9 | Period 9 | 1980–Present |

Overlapping College Board period boundaries are valid and must not be "corrected" into non-overlapping ranges.

## Validation

Each period manifest locks its event IDs and display order. Static validation requires:

- exactly one dataset and manifest for every Period 1–9 registry entry;
- 7–10 events per period;
- unique period and event IDs;
- exact dataset/manifest event-order agreement;
- event dates within the active College Board period band;
- complete English title, Chinese title, short Chinese title, and Chinese summary;
- at least one valid APUSH theme and source per event;
- valid optional coordinates and bilingual place labels;
- no partial or fabricated coordinate objects.

Browser verification covers:

- selecting every Period 1–9 and updating all period-specific labels;
- matching manifest order and event counts in the Dock;
- marker-to-Dock and Dock-to-marker synchronization;
- Dock-only events without fabricated markers;
- selection and filters resetting across period switches;
- stale-request protection during rapid switching;
- load failure and retry for the requested period;
- keyboard activation, focus visibility, and reduced motion;
- map drag/zoom behavior after period switches;
- Dock-local scrolling and no document overflow across existing desktop, tablet, portrait-mobile, and landscape-mobile viewports;
- an empty browser console during the complete period matrix.

Existing Period 1 acceptance behavior remains a regression requirement.

## Delivery Boundary

This work ships the APUSH data, loader, validation, and shared U1–U9 Timeline Dock experience on the APUSH branch. It does not merge or modify `feature/history-timeline-module-prototype`.

AP World History follows as a separate data implementation after the APUSH loader and schema are stable. It may reuse the loader and validation architecture but will have its own course registry, period labels, datasets, manifests, source ledgers, and content review.

## Success Criteria

The design is successful when:

1. A student can switch among all nine APUSH periods on one page.
2. Every period displays 7–10 chronological anchor nodes from its own validated dataset.
3. The map, summary card, and Dock share one selection without creating false geography.
4. Period changes cannot leak old selection, filters, content, or failed network responses.
5. The Dock remains subordinate, accessible, responsive, and isolated from page scrolling.
6. Period 1 behavior remains intact.
7. The implementation exposes a clean course-data boundary that can later support AP World History without duplicating the page.
