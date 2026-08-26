# APWH Key Terms Horizontal Rows Design

## Goal

Make expanded Unit 1 **Key Terms** easier to scan inside the narrow map-detail panel. Replace the current two-column card grid, which forces English into very narrow columns, with full-width rows that pair each term with its definition horizontally.

## Approved Layout

Each key term renders as one full-width bordered row:

- the term occupies a stable left column;
- the definition occupies the flexible right column;
- multiple terms stack vertically;
- the existing warm paper surface, border treatment, typography hierarchy, disclosure heading, count, and open/closed behavior remain unchanged.

The same layout applies in both render locations:

1. the standalone `world-map.html` event panel;
2. the mirrored APWH homepage detail panel in `index.html`.

## Responsive Behavior

The layout responds to the width of the Key Terms component rather than the width of the whole browser window. At ordinary panel widths, the term and definition remain side by side. When the component becomes too narrow for readable columns, the row changes to a single-column stack with the term above its definition.

No horizontal scrolling is introduced. Long terms may wrap within the left column, while definitions use the remaining width without causing page, panel, detail, or grid overflow.

## Implementation Boundary

Only the Key Terms presentation changes. The canonical study data, generated definition-list markup, disclosure state, connection navigation, focus restoration, keyboard behavior, and all other progressive-detail sections remain untouched.

## Verification

Automated browser coverage must verify both standalone and homepage copies:

- each expanded Key Terms list uses one full-width row per term;
- each ordinary-width row places its term and definition in separate horizontal columns;
- a deliberately narrow component stacks the term above its definition;
- the component and its containing detail, panel, and page do not overflow horizontally;
- existing disclosure accessibility and state-restoration tests continue to pass.
