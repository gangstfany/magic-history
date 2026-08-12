# AP World Card Timeline Dock Design

## Goal

Add the student-tested horizontal card Timeline Dock to the AP World map for Units 1–9. The Dock belongs inside `world-map.html`, directly below the map, so it remains available when the map is opened alone or embedded by `index.html`.

The Dock is a navigation aid. It must clarify chronology without replacing the map or becoming a separate learning module.

## Scope

- Cover AP World Units 1–9 using the events already available to the world map.
- Reuse the visual pattern students preferred: horizontally scrolling event cards showing a date, English event title, and Chinese event title.
- Synchronize the selected event among the map marker, Timeline Dock, and existing detail view.
- Preserve the current `index.html` page structure and its iframe integration.
- Preserve the existing APUSH implementation. A shared cross-subject component is outside this iteration.
- Content review or replacement of the existing AP World event set is outside this iteration.

## Page Structure

`world-map.html` owns the complete AP World experience:

```text
world-map.html
├── toolbar and Unit filters
├── map viewport and markers
├── horizontal card Timeline Dock
└── event detail view
```

`index.html` continues to embed `world-map.html` and does not render a second Timeline.

The Dock sits immediately below the map viewport and visually shares the map container. It is regular HTML rather than part of the SVG, which keeps card text, scrolling, focus handling, and responsive behavior accessible.

## Timeline Cards

Each visible event is represented by one card in chronological order. A card contains:

- the event date or date range;
- the English event title;
- the Chinese event title.

Cards use a stable readable width and scroll horizontally instead of compressing or wrapping into multiple rows. The selected card uses the established warm highlighted background and darker outline. Non-selected cards remain visually quiet but retain clear hover and keyboard-focus states.

The Dock header identifies the active Unit and describes the control as chronological navigation. Events without geographic markers still receive cards and can open the detail view.

## Unit Behavior

The existing Unit filter remains the source of scope. Selecting Unit 1 through Unit 9 rebuilds the Dock from that Unit's visible events in chronological order.

On a Unit change:

1. the map applies the Unit filter;
2. the Dock renders only events in that Unit;
3. the first event becomes selected when no valid selection remains;
4. its card and available map markers are highlighted;
5. the detail view displays that event.

Search and theme filters narrow the cards and markers together. If filtering removes the selected event, the first remaining event becomes selected. If nothing remains, the Dock and detail view show their existing empty state without stale selection.

## Interaction and State

The page keeps one canonical selected-event ID. Every surface reads from and writes to that value.

- Clicking or keyboard-activating a card selects its event, updates the detail view, highlights every marker for that event, and focuses the primary geographic anchor when one exists.
- Clicking or keyboard-activating a map marker selects its event, updates the detail view, highlights the matching card, and scrolls only the Dock track enough to reveal that card.
- Selecting an event from another existing event control follows the same synchronization path.
- Events with multiple geographic anchors still use one Timeline card. All of their map markers share the selected state.
- Events without a geographic anchor select normally in the Dock and detail view without forcing a map movement.

The current legacy AP World source table contains no anchorless records: every entry is nested under a numbered map location. The Dock therefore supports only the anchored records actually present today and exposes this limitation through its test state. No fictional anchorless event is added merely to exercise the interaction; acceptance coverage for anchorless selection should be enabled when the source model gains a genuine such record.

Automatic card reveal must not scroll the document or steal keyboard focus. Direct keyboard activation retains focus on the control the student used.

## Responsive and Accessibility Behavior

- Desktop keeps the Dock directly below the map with horizontal overflow contained inside the track.
- Touch devices use native horizontal swiping and retain a minimum 44-by-44-pixel interactive target.
- Card text is not reduced to unreadable sizes; cards keep their width and overflow horizontally.
- Cards are semantic buttons with descriptive accessible names and `aria-current` on the selected event.
- Left and right arrow keys move among Timeline cards. Home and End move to the first and last visible cards. Enter and Space select.
- Visible focus styling, reduced-motion preferences, and existing color contrast conventions are preserved.

## Data Flow

The Dock adapts the existing AP World event objects rather than introducing a second content source. A small rendering layer derives the date and bilingual labels already used by the world map.

Unit membership is a reviewed literal mapping keyed by each source record's stable ID. Only records dated c.1200 or later are eligible; earlier source records remain available elsewhere in the map but are intentionally absent from the AP World History: Modern Timeline. An eligible record missing from the mapping is reported by the Timeline test API and omitted rather than guessed into a Unit. The mapping uses the College Board Unit 1–9 names and permits historically justified boundary-spanning events.

The existing filter result determines the visible event IDs. The Timeline renderer consumes those IDs, looks up their event records, orders them chronologically, and creates the cards. All selection changes go through one selection function so map, Dock, and detail state cannot diverge.

If an existing event lacks one of the card labels, the renderer uses the current event display title rather than showing an empty field. Invalid or missing event references are ignored and surfaced through the existing empty/error state instead of breaking the page.

## Testing and Acceptance Criteria

Automated browser checks will cover:

- Units 1–9 each render the expected visible Timeline cards in chronological order;
- date, English title, and Chinese title appear on every card;
- card selection updates map markers and detail content;
- marker selection updates and reveals the corresponding card;
- multi-anchor events produce one card and select all matching markers;
- non-geographic events remain selectable without map movement;
- Unit, search, and theme filtering keep map and Dock results synchronized;
- keyboard navigation and activation work as specified;
- automatic reveal scrolls only the Dock track;
- desktop and narrow mobile viewports contain the Dock without clipping the page;
- opening `world-map.html` directly and through the `index.html` iframe both retain full interaction.

The feature is complete when AP World Units 1–9 use the student-approved card Timeline inside the map experience, with no duplicate Timeline added to `index.html` and no regression to existing APUSH behavior.
