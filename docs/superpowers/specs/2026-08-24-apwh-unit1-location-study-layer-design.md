# APWH Unit 1 Location Study Layer Design

## Goal

Add a small, production-shaped Unit 1 trial that separates existing map events from finer exam study events and lets a student enter a chronological location study view without disrupting the current map, causal-chain, route, or practice workflows.

## Scope

The trial covers five representative Unit 1 locations:

- Hangzhou
- Samarkand
- Baghdad
- Timbuktu
- Malacca

Each location receives two or three study events, for approximately twelve to fifteen study events in total. No other Unit receives study-event data or a location-study entry point in this iteration.

The trial does not add a new global mode, redesign the map, replace existing event cards, alter causal-chain content, or change the quiz and mistake-book data model.

## Chosen Interaction

The existing location click remains the first step. It continues to render the current location event cards exactly as it does today.

For the five trial locations only, the event panel adds a secondary action labeled `View all N study points`. Activating it replaces the event-card content inside the existing event zone with a location study view. This is the approved “B” interaction: ordinary location behavior stays intact, while the deeper study layer is one explicit action away.

The location study view contains:

1. A heading with the location name, region, and `Unit 1` context.
2. A chronological list of the location's study events.
3. Compact study-event rows showing date, English title, summary, and the linked main event.
4. One expanded study event at a time, revealing significance, key people, key terms, evidence, exam connection, and source locator.
5. A `Back to location events` control that restores the original event cards for the same map location.

All newly introduced interface copy and study content is displayed in English. The trial does not add bilingual labels to the location-study layer.

Entering or leaving the location study view must preserve the current period, theme filters, search query, selected location, map zoom, and pan. It must not start or exit a causal chain, trade route, quiz, or mistake-book workflow.

## Architecture

### Data boundary

Unit 1 study content lives in a focused data module separate from `world-map.html`. The module exports a validated collection of location study records. `world-map.html` remains responsible for rendering and interaction orchestration.

Each study event contains:

- Stable identifier
- Location number matching an existing APWH map location
- Linked main-event identifier or stable event key
- English title
- Start year, optional end year, and display date
- Short summary
- Historical significance
- Key people with roles
- Key terms with explanations
- Two or more usable evidence statements
- Exam connection for SAQ, LEQ, or DBQ use
- Source identifier and locator, using existing AMSCO-backed source conventions

The data module also exposes query helpers that return a location's study events in chronological order. Rendering code must not sort or repair malformed records at display time.

### UI boundary

The existing location event renderer gains one conditional study-entry action. A focused location-study renderer owns the study heading, chronological list, expansion state, and return action.

The trial should follow existing visual tokens and event-zone layout. It must not introduce a new top-level navigation item. Controls must use visible focus states, accessible names, and at least 44-by-44-pixel hit areas.

### State boundary

Location study state is local and minimal:

- Active study location number, or `null`
- Expanded study-event identifier, or `null`

It does not duplicate map filter, map transform, route, chain, or quiz state. Returning to ordinary events clears only the two study-state values and re-renders the existing location event cards.

## Content Rules

Study events are exam-oriented refinements, not duplicates of the main event card. Each record must add at least one concrete person, term, evidence item, or exam-use explanation beyond the main event summary.

The chronological list is organized around the selected location. A study event may link to an existing main event, causal chain, or route, but this trial does not add cross-navigation from the study view into those modes.

Sources must resolve to existing project source records or an explicitly added AMSCO source locator. No unsupported factual claims or placeholder citations are allowed.

## Failure Handling

Malformed study records fail validation in automated tests. At runtime, a location with no valid study events behaves exactly like an ordinary location and does not display the study-entry action.

If an expected linked main event cannot be resolved, the study entry is excluded rather than shown with a broken link. The existing location event panel remains usable.

## Accessibility and Responsive Behavior

- The study-entry, study-event, and return controls are semantic buttons.
- Expanded state uses `aria-expanded` and the active study item uses `aria-current` where appropriate.
- Moving from an event card into the study view places focus on the location-study heading.
- Returning places focus on the restored study-entry action.
- Keyboard activation supports Enter and Space through native button behavior.
- The layout remains single-column inside the event panel at narrow widths and must not introduce horizontal page scrolling.
- Motion is limited to the project's existing panel transition and respects reduced-motion behavior already present in the site.

## Testing Strategy

Automated tests must prove:

1. Only the five trial locations expose study events.
2. Every study record resolves to a valid existing location, linked main event, and source locator.
3. Each location returns two or three study events sorted chronologically.
4. Each study record contains the required people, terms, evidence, significance, and exam connection fields.
5. The five trial location panels render `View all N study points`; other Unit 1 and non-Unit-1 locations do not.
6. Entering, expanding, and returning work through semantic controls.
7. Map filters, search, zoom, pan, and selected location remain unchanged across the round trip.
8. Existing causal-chain, route, quiz, mistake-book, and APWH verification suites continue to pass.

Browser verification will cover desktop and narrow viewport behavior, keyboard focus, content overflow, and the complete location-event → study-view → location-event round trip.

## Success Criteria

The trial succeeds when a student can click any of the five selected Unit 1 locations, keep the familiar event-card view, deliberately open a chronological exam-focused study list, inspect one detailed study event, and return without losing map context or disrupting any existing APWH learning mode.
