# AP Art History Ancient Mediterranean Interactive Map Design

## Status

Approved in conversation on 2026-07-25. This document is the implementation
boundary for the first art history map release.

## Goal

Create a standalone AP Art History interactive map for the Ancient
Mediterranean. The first release covers every work in the official AP Art
History 250 list associated with ancient Egypt, ancient Greece, and ancient
Rome. It must work by itself and also embed into the existing Magic History
homepage without changing the existing world history map's data or core
behavior.

The experience is a study tool, not just a geographical index. It should help
students connect each work's location with its form, function, content,
context, and useful comparison points.

## Source Material

Use the following sources in priority order:

1. The official AP Art History course and exam description and its 250-work
   list.
2. The user's `APAH notes.pdf`.
3. The five user-provided Smarthistory AP Art History volumes.
4. The user's period- and region-specific lecture notes when clarification or
   enrichment is needed.

The written cards should synthesize these sources in concise Chinese rather
than reproduce long passages. Preserve English artwork names and AP exam
vocabulary. Verify identity fields against the official list before release.

Artwork images should come from public museum collection pages, Smarthistory,
or Wikimedia Commons. Prefer openly licensed or public-domain images and
display a human-readable source link. External images are allowed to require
an internet connection.

## Scope

### Included

- All AP 250 works that belong to ancient Egypt, ancient Greece, or ancient
  Rome.
- A focused Ancient Mediterranean map.
- Civilisation, period, and artwork-type filtering.
- Search by artwork title, Chinese title, place, and keyword.
- An artwork detail panel with image enlargement.
- Multiple works at one site.
- Desktop, narrow desktop, and mobile layouts.
- Homepage subject switching between world history and art history.
- Standalone use of the art history map.

### Not Included in the First Release

- The remaining AP 250 works outside Egypt, Greece, and Rome.
- User accounts, saved progress, quizzes, annotations, or analytics.
- Full offline packaging of external artwork images.
- Editing artwork data through the browser.
- Changes to the existing world history dataset or its central interaction
  model.

The artwork data model must remain extensible so later regions can be added
without redesigning the map or detail card.

## File and Integration Architecture

Create `art-history-map.html` as a self-contained page. It owns:

- the Ancient Mediterranean SVG map;
- artwork data;
- filters and search;
- map state;
- the fixed artwork detail panel;
- the image lightbox;
- responsive rules;
- loading, empty, and error states.

Do not share JavaScript globals, CSS selectors, or data objects with
`world-map.html`.

Update `index.html` so the existing subject switcher can select:

- World History: load `world-map.html` and retain the current world-history
  layout and content.
- Art History: load `art-history-map.html` in the map module at full module
  width because the art page contains its own fixed detail panel.

When Art History is active, hide world-history-only supporting content such as
the event panel and "Today in History" content. When the user returns to World
History, restore those elements and their previous state.

Each map should retain its iframe state while switching subjects. Prefer
keeping both iframe instances mounted and toggling visibility. If that proves
unreliable in the existing page, persist each map's selected item, filters,
zoom, and pan before changing the iframe source and restore them on return.

Show a brief skeleton state during initial map loading. If the art map fails
to load, show a retry control instead of an empty region.

## Visual Design

Use layout option A:

- Left: interactive map, approximately two thirds of the content width.
- Right: fixed artwork detail panel, approximately one third.
- The panel scrolls internally when an analysis is longer than the available
  height.
- The selected marker remains visible while the user reads the panel.

Continue the existing Magic History warm paper palette and rounded-card
language. Give the three civilisations stable marker colours:

- Egypt: terracotta red.
- Greece: Aegean blue.
- Rome: ochre gold.

At widths below 520 CSS pixels, stack the map above the detail panel. Do not
stack at narrow desktop widths such as the 652-pixel in-app browser; the two
layout options must remain visually distinct there.

## Artwork Data Model

Each artwork record must contain:

- `id`: stable internal identifier.
- `apNumber`: official AP work number.
- `titleEn`: official English title.
- `titleZh`: concise Chinese title.
- `civilization`: Egypt, Greece, or Rome.
- `period`: standard historical or stylistic period.
- `date`: display date or date range.
- `artistCulture`: artist, architect, workshop, or culture.
- `siteName`: historical site used on the map.
- `siteQualifier`: optional qualifier such as "approximate" or "findspot".
- `coordinates`: map coordinates for the marker.
- `medium`: official medium summary.
- `workType`: architecture, sculpture, painting, relief, or another controlled
  value.
- `function`: concise purpose or use.
- `form`: formal and technical analysis.
- `content`: subject matter and iconography.
- `context`: religious, political, social, and patronage context.
- `recognitionAnchors`: short visual identification clues.
- `comparisonIds`: zero or more related artwork IDs.
- `imageUrl`: thumbnail and lightbox image URL.
- `imageAlt`: useful visual description.
- `imageSourceName`: human-readable source.
- `imageSourceUrl`: artwork or collection page URL.
- `keywords`: Chinese and English search terms.

Validate required identity fields during development. A missing required field
must be reported rather than silently rendering an incomplete card.

## Map Interaction

### Markers

- Colour markers by civilisation.
- Enlarge the active marker and add a high-contrast white focus ring.
- Make every marker keyboard focusable and activatable with Enter or Space.
- Provide accessible marker labels containing artwork and site names.
- When several works share a site, render one count marker. Selecting it opens
  the first matching work and exposes previous/next controls in the detail
  panel.

### Navigation

- Support zoom, pan, and reset-to-overview.
- Keep all motion bounded so the map cannot be lost entirely outside the
  viewport.
- Preserve the active selection during zoom and pan.

### Filtering and Search

Provide:

- All, Egypt, Greece, and Rome civilisation pills.
- Period filter.
- Artwork type filter.
- One search field covering English title, Chinese title, site, and keywords.

Filters combine using AND logic. Search narrows the filtered set. Always show
the current matching count.

If no works match, show an empty state with a clear-filters action. Clearing
filters returns to the complete Ancient Mediterranean set and restores the
overview map.

## Detail Panel

The panel begins with:

- artwork image;
- AP number;
- civilisation and period;
- English title;
- Chinese title;
- date;
- artist or culture;
- medium;
- site;
- function.

Below the identity block, provide four tabs:

1. Quick Review: the smallest useful exam-ready summary and recognition
   anchors.
2. Form: composition, style, material, and technique.
3. Context: religious, political, social, and patronage context, including
   content where needed for clarity.
4. Compare: linked related works and concise comparison angles.

Clicking the image opens a lightbox with an enlarged image, caption, alt text,
and source link. Escape, the close button, and clicking the backdrop close the
lightbox. Return focus to the image trigger after closing.

When an external image fails, replace it with a styled placeholder containing
the artwork name. Keep all written study content available.

## Responsive and Accessibility Behavior

- Desktop and narrow desktop: map and detail panel remain side by side.
- Below 520 CSS pixels: map first, detail panel second.
- Avoid clipped controls, horizontal page scrolling, or overlapping labels.
- Ensure visible focus styles for subject pills, filters, search, markers,
  tabs, site navigation, lightbox controls, and comparison links.
- Use semantic buttons rather than click-only generic elements.
- Provide useful image alt text and map-control labels.
- Respect reduced-motion preferences for skeletons, transitions, and marker
  animation.

## Error and Ambiguity Handling

- Image failure: show an artwork-name placeholder.
- Broken source link: do not block the detail card.
- Approximate or disputed location: use the best-supported historical site and
  display an "approximate" qualifier.
- Unknown original site: use the findspot only if the card labels it clearly;
  otherwise use a region-level marker.
- Iframe load failure: show a retry action.
- Missing required artwork field: fail validation during development and list
  the affected artwork.
- Duplicate AP number or internal ID: fail validation.

## Verification and Acceptance Criteria

### Data

- Every included artwork is in the official AP list and belongs to the agreed
  Egypt, Greece, or Rome scope.
- AP number, titles, date, site, culture or artist, and medium match the
  sources.
- Every comparison ID resolves to a real record.
- Every map coordinate resolves to a visible site.
- Every image has alt text, a source name, and a source page URL.

### Behavior

- Every marker opens the matching artwork.
- Count markers cycle through all works at that site.
- Search and all filter combinations update markers and the result count.
- No-result state and clear-filters action work.
- Zoom, pan, and overview reset work.
- Detail tabs and comparison links work.
- Image lightbox opens, closes, and restores focus correctly.
- Broken images fall back without breaking the panel.

### Integration

- `art-history-map.html` works when opened directly.
- The homepage can switch repeatedly between World History and Art History.
- Each map retains its prior state after switching.
- World-history content and behavior remain unchanged.
- Art-history mode does not show world-history-only event or daily-history
  content.

### Visual and Accessibility

- Verify at wide desktop, 652-pixel narrow desktop, and a representative
  mobile width below 520 pixels.
- At 652 pixels, option A remains side by side.
- No content is clipped, overlapped, or inaccessible by keyboard.
- Focus rings, alt text, reduced motion, and lightbox keyboard controls pass
  manual checks.

## Deliverables

- `art-history-map.html`
- Updated `index.html`
- Artwork data validation check or script
- A short source record for image and content references
- Verification notes covering data, interaction, responsive behavior, and
  regression checks for the world history map

