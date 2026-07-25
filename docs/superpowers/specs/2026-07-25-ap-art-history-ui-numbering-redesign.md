# AP Art History UI and AP Numbering Redesign

**Date:** 2026-07-25  
**Status:** Approved direction; awaiting written-spec review

## Goal

Make `art-history-map.html` feel like the existing `world-map.html`, correct artwork-image cropping, and define a map-marker system that can grow from the current 27 works to the full AP Art History set of 250 while preserving official AP work numbers.

## Visual system

- Reuse the World History map’s typography:
  - `"PingFang SC", "Hiragino Sans GB", -apple-system, "Helvetica Neue", sans-serif`
  - antialiased rendering
  - compact, high-weight headings and smaller muted metadata
- Align the Art History palette, borders, radii, controls, shadows, and spacing with the warm paper/surface system used by `world-map.html`.
- Reduce oversized detail typography. The detail hierarchy is:
  1. English artwork title as the primary heading.
  2. Chinese title immediately below as a smaller subtitle.
  3. AP number, civilization, period, and date as compact muted metadata.
- Keep the existing accessible focus rings, keyboard controls, tabs, comparison cards, credits, and dialog behavior.

## Artwork images

- The normal detail image must show the complete artwork by default using `object-fit: contain`.
- The image container uses the World History warm neutral surface instead of stretching or cropping the source.
- No artwork-specific crop is applied unless a later image has unavoidable empty margins and a reviewed focal-point override is explicitly added.
- The lightbox continues to use `contain`.
- The Old Market Woman image is the regression example: the head and full vertical extent visible in the source must remain visible in the detail card.
- Loading failure, alt text, source attribution, and license presentation remain unchanged.

## AP-number marker model

AP numbers, not work counts, are the primary marker identity.

### Full-world overview

- Dense works are grouped geographically.
- A group label displays the included AP number range or compact ranges, for example `AP 12–47` or `AP 26–28, 33–38`.
- Group labels never substitute an unlabeled work count for the AP numbers.

### Intermediate zoom

- Large groups split into smaller geographic/site groups.
- Each group continues to expose its included AP numbers in its visible label and accessible name.

### Close zoom and expanded sites

- Every artwork becomes an individual circular pin labeled with its AP number, such as `41`.
- Works sharing one site expand into a deterministic radial/spider layout around the real geographic anchor.
- Short leader lines connect displaced pins to the real site.
- Selecting a pin opens that exact artwork rather than cycling an ambiguous site-level selection.

### Current 27-work version

- Convert site-count markers into AP-number-aware markers using the same data model intended for 250 works.
- Default rendering may aggregate very dense nearby pins, but the visible label and accessible name must enumerate AP numbers.
- Zooming or activating a group must expose individual AP-number pins.
- Filters, search, selection, comparisons, zoom/pan, responsive behavior, and homepage embedding must keep working.

## Full 250-work organization

- The first organizational layer follows the official ten AP Art History course units.
- Geography controls placement and clustering; the AP unit controls filtering, color/legend grouping, and AP-range summaries.
- The hierarchy is:
  1. AP unit
  2. geographic region
  3. site
  4. individual AP-numbered work
- AP catalog numbers remain stable identifiers across the map, filters, detail view, comparisons, and search.

## Responsive and accessibility behavior

- Marker labels must remain readable without horizontal page overflow.
- Keyboard users can activate groups and individual AP pins with Enter or Space.
- Accessible labels include the geographic label and all represented AP numbers; individual pins also include the English artwork title.
- On small screens, expanded pin groups may use a compact list immediately below the map if the radial layout would be illegible.
- Reduced-motion preferences continue to disable nonessential animation.

## Verification

- Add regression tests for typography tokens and English-first title order.
- Add an image test ensuring detail thumbnails use `contain`.
- Add marker tests confirming visible labels use AP numbers rather than work counts.
- Verify group expansion selects the correct individual work.
- Re-run the complete data, detail, homepage, accessibility, and responsive test suite.
- Live-check desktop and 390 px layouts, including Old Market Woman, a multi-work site, zoom transitions, and homepage embedding.

## Out of scope

- Adding the remaining 223 artwork records in this change.
- Changing official AP numbers or the existing 27-work core data.
- Replacing the approved full-world geography or modifying `world-map.html`.
