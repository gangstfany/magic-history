# APWH Unit 1 Progressive Study Detail Design

Date: 2026-08-25
Status: Approved visual direction; awaiting written-spec review

## Goal

Improve the APWH Unit 1 location-study detail so students can scan the essential argument immediately and reveal supporting material only when needed. The result should borrow the useful semantic grouping of the APUSH detail view without reproducing its long, fully expanded page.

All learner-facing copy introduced or changed by this feature must be English.

## Scope

This change applies to the twelve existing APWH Unit 1 study points shown from the five approved trial locations:

- Hangzhou
- Baghdad
- Delhi
- Angkor
- Timbuktu

It applies in both shipped contexts:

- the standalone `world-map.html` experience;
- the homepage mirror in `index.html`.

The separate Unit causal-chain mode, trade-route mode, practice mode, coarse timeline cards, and APUSH project are outside this feature.

## Approved Information Hierarchy

### Header

The detail begins with:

- Unit and regional context;
- study-point title;
- date range;
- AP topic;
- relevant AP themes or analytical categories.

### Always-visible core

The following blocks remain expanded:

1. **Region** — location name plus a concise English geographic or political qualifier.
2. **Summary** — what happened or how the development worked.
3. **Why It Matters** — the existing `significance` content under a more direct learner-facing label.
4. **Use It on the Exam** — the existing `examConnection` content under an action-oriented label.

This gives the student the minimum useful historical argument without requiring interaction.

### Progressive supporting sections

The following sections are collapsed by default:

- **Key Terms**
- **Evidence**
- **Connections**
- **People**
- **Source**

Each summary row includes a count. Empty sections are omitted rather than rendered as disabled or blank controls.

The sections use native disclosure semantics and must remain keyboard-operable. Each summary row retains at least a 44px interaction target and an obvious open/closed indicator that does not rely on color alone.

## Connections Model

Causes, effects, and related events are grouped under a single **Connections** disclosure to prevent the detail from turning into three consecutive stacks of boxes.

Inside the disclosure, available links are grouped under:

- **Cause**
- **Effect**
- **Related Event**

Every link displays:

- the connected study-point title;
- one concise sentence explaining the relationship mechanism.

Selecting a connection opens the target Unit 1 study-point detail. Back navigation restores the exact origin detail, scroll position, and disclosure state. Cause/effect relationships must be reciprocal in the data model, and related relationships must be reciprocal with themselves. A study point may omit any relationship category when no defensible link exists; the design must not create a mechanical chain solely to fill the interface.

## Data Contract

The existing Unit 1 study-point records remain the canonical content source. The schema is extended only where required:

- `topicCodes`: one or more official APWH topic identifiers;
- `themeIds`: AP theme or analytical-category identifiers used by the existing experience;
- `causeStudyPointIds`: IDs of direct causes;
- `effectStudyPointIds`: IDs of direct effects;
- `relatedStudyPointIds`: IDs of non-causal comparisons or thematic connections;
- `connectionNotes`: concise English mechanism copy keyed by connected study-point ID when the relationship title alone would be insufficient.

Region display data should be derived from the existing location/pin model rather than copied into all twelve records. Existing `summary`, `significance`, `examConnection`, `keyPeople`, `keyTerms`, `evidence`, and `source` fields remain authoritative.

All relationship IDs must resolve within the approved Unit 1 study inventory. Self-links, duplicate links, unresolved IDs, nonreciprocal relationships, and the same target appearing in multiple relationship categories are invalid.

## Visual Treatment

The approved mock establishes the direction:

- warm paper background consistent with the current Magic History visual system;
- serif display headings and sans-serif reading copy;
- a compact location card near the top;
- terracotta accents for hierarchy and interaction;
- a restrained blue treatment for **Use It on the Exam**;
- thin dividers for the supporting disclosures;
- bordered connection buttons with visible hover and focus feedback;
- no additional full-page navigation or tab strip.

The design must preserve readable line lengths, avoid horizontal scrolling, and stack term cards to one column on narrow screens.

## Interaction and Accessibility

- Native buttons and disclosures must be usable with keyboard and touch.
- Interactive rows and connection buttons retain a minimum 44px target.
- Focus rings remain visible.
- Open/closed state is conveyed by text structure and a plus/minus indicator, not color alone.
- Opening a disclosure must not move focus unexpectedly.
- Opening a connected detail moves focus to its heading.
- Returning restores focus to the connection that opened the target.
- The existing exact-origin return behavior remains intact for both location-origin and timeline-origin detail views.
- Homepage mirror actions continue to proxy to canonical iframe state and restore focus in the visible mirror.

## Rendering and State Flow

1. A location or timeline selection opens the existing study-point list.
2. Selecting a study point renders the progressive detail using the canonical Unit 1 record and derived location metadata.
3. Disclosure state belongs to the current detail instance and begins collapsed for every supporting section.
4. Selecting a connection records the current study point, scroll position, disclosure state, and invoking control before opening the target.
5. Back returns to that recorded state.
6. Changing Unit, learning mode, location, timeline event, route, search/filter state, or practice state clears stale progressive-detail navigation in the same situations where existing study detail state is cleared.

## Error Handling

- Invalid public relationship targets return `false` and preserve the current view.
- Missing optional supporting content omits its disclosure.
- A missing required core field is rejected by validation rather than rendered as an empty block.
- A relationship with a missing target, missing reciprocal edge, or duplicate category fails validation and does not ship.
- If derived location metadata is unavailable, validation fails before release; the UI does not invent fallback geography.

## Verification

### Data tests

- all twelve records remain present, unique, deeply immutable, and English-only;
- every record has valid topics, themes, core copy, source, and derived location metadata;
- relationship IDs resolve and satisfy reciprocal/category rules;
- connection mechanism notes are English and nonempty where present;
- mutation attempts cannot change nested relationship arrays or notes.

### Browser verification

Verify both standalone and homepage contexts at desktop and narrow viewport sizes:

- Region, Summary, Why It Matters, and Use It on the Exam are visible without interaction;
- supporting disclosures begin collapsed and show correct counts;
- empty sections are absent;
- disclosures open and close with mouse, touch-equivalent activation, and keyboard;
- connection navigation opens the correct target and restores exact origin state on Back;
- focus behavior and 44px targets remain correct;
- English-only learner-facing copy is preserved;
- no horizontal overflow or clipped content occurs;
- existing location list, timeline list, search/filter, learning-mode, route, and practice behavior remains unchanged.

## Non-goals

- Adding new Unit 1 locations or increasing the twelve-record trial inventory.
- Rewriting the existing historical prose unless a relationship requires a short mechanism note.
- Copying APUSH bilingual labels or its fully expanded vertical layout.
- Creating a new global cause-chain mode.
- Changing Units 2–9.
