# APWH Main Full-Bleed Embed Design

## Goal

Reduce visual crowding when AP World History is used inside `index.html` while preserving the full learning workflow: map, embedded Timeline Dock, causal chain, Map tools, and Practice.

The standalone `world-map.html` layout and behavior remain unchanged.

## Main-Only Layout

- The APWH module uses the available Main content width instead of behaving like a smaller application nested inside a padded course card.
- Remove redundant outer padding and duplicate visual framing around the embedded APWH workspace.
- Keep one module title, `History World Map`, with the primary controls `因果链`, `地图`, and `练习` on the same row.
- The main learning workspace uses an approximately 70/30 desktop split:
  - 70%: map with Timeline Dock directly beneath it.
  - 30%: unified contextual panel.
- The contextual panel has a readable minimum width and its own vertical scrolling when content exceeds the visible workspace height.
- The map and Timeline Dock remain visually grouped as one canvas.

## Compact Toolbar

- Unit, search, and theme filtering share one compact toolbar row on desktop.
- Unit has a stable compact width.
- Search expands into remaining space.
- Themes are collapsed behind one `主题筛选` control by default.
- The theme control shows the number of active themes and exposes the existing theme buttons in a popover or expandable row.
- Expanded theme controls do not permanently reduce the map height.
- Existing filter behavior and source-driven APWH state remain unchanged.

## Responsive Behavior

- At medium widths, the toolbar may wrap into two rows before the learning workspace stacks.
- At narrow widths, the order is:
  1. Header and primary controls
  2. Compact toolbar
  3. Map
  4. Timeline Dock
  5. Contextual panel
- No horizontal document scrolling is introduced.
- Interactive controls retain a minimum 44-pixel touch target on narrow screens.

## State and Integration Rules

- Main remains a mirror/controller of the APWH source state; it must not create a second independent learning-mode or filter state.
- The Main-specific layout must not write dimensions that leak into AP Art History, APUSH, European History, or Geography.
- Switching away from World History clears all World-only inline sizing and expanded-filter state.
- Returning to World History recalculates the Map-plus-Timeline canvas size.
- Chain, Map Event Details, Routes, and Practice behavior remain identical to the verified standalone experience.

## Verification

Browser verification must cover:

1. Desktop Main APWH uses a wider module with an approximately 70/30 canvas/panel split.
2. The Timeline Dock remains visible inside the left canvas.
3. Themes are collapsed by default and can be expanded without hiding or permanently shrinking the map.
4. Unit, search, and theme controls continue to proxy the exact source state.
5. The contextual panel scrolls independently when causal-chain content is long.
6. At narrow width, Map → Timeline → contextual panel ordering remains intact.
7. World → Art → APUSH → World transitions do not leak layout sizing or expanded-filter state.
8. Standalone `world-map.html`, APWH interactions, and all APUSH tests remain green.
