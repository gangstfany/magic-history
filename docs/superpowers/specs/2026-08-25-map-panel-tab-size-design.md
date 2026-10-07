# Map Panel Tab Size Design

## Goal

Reduce the visual size of the `事件详情` and `商路` pill controls without changing their color, shape, labels, selected state, focus treatment, or behavior.

## Approved Direction

Use the selected **B · Balanced** proportions in both places where the controls render:

- `world-map.html` standalone map panel
- `index.html` homepage mirror panel

Each control keeps a 44-pixel interactive box for touch and keyboard accessibility. Its visible pill is inset inside that box and measures 38 pixels high. Text remains 13 pixels, with 14 pixels of horizontal padding and the existing 8-pixel gap between controls.

## Implementation Boundary

Only the two scoped `.map-panel-tabs` style blocks change. The existing HTML, event delegation, ARIA state, responsive layout, colors, border radius, and mode-switching logic remain untouched.

## Verification

Automated browser coverage must assert a 44-pixel button hit target and a 38-pixel visible pill in both the standalone map and homepage mirror. Desktop and narrow layouts must retain the current spacing and avoid horizontal overflow.
