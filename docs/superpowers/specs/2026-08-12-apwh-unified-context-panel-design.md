# APWH Unified Context Panel Design

## Goal

Make the APWH learning workspace visually and conceptually consistent. The map and embedded Timeline Dock remain the permanent learning canvas, while one right-side contextual panel switches among causal chains, map tools, and practice.

## Page Structure

- The header contains three parallel controls: `因果链`, `地图`, and `练习`.
- The Unit selector remains the only Unit navigation control.
- The desktop workspace has two columns:
  - Left: world map with the Timeline Dock embedded beneath it.
  - Right: one persistent contextual panel.
- At narrow widths, the contextual panel stacks beneath the map and Timeline Dock.

## Contextual Panel Modes

### Causal Chain

- APWH opens with `因果链` selected.
- The right panel displays the approved causal chain for the selected Unit.
- Unit changes update map events, Timeline cards, and the causal chain together.
- Chain steps, map pins, and Timeline cards retain their synchronization behavior.

### Map

- Selecting `地图` changes the right panel to a map-specific workspace.
- The map workspace contains two secondary modes: `事件详情` and `商路`.
- `事件详情` is the default secondary mode.
- Before a map pin is selected, the panel shows only concise instructions to select a region or pin.
- The legacy `Practice / 随堂练习` entry is removed from the map empty state.
- `商路` displays the existing route choices in the right panel. Selecting a route renders its path and stations on the left map.
- Leaving `商路` restores the selected Unit, search query, theme filters, map state, and Timeline state.

### Practice

- Selecting `练习` renders the existing practice picker and quiz flow inside the same right contextual panel.
- Practice no longer opens a fixed or overlay drawer.
- The obsolete drawer header, close button, fixed positioning, focus-restoration behavior, Escape handling, and drawer-only semantics are removed.
- Switching from Practice to `因果链` or `地图` restores any filters temporarily suspended by an active quiz.
- The selected Unit remains unchanged when entering or leaving Practice.

## Navigation State

- Exactly one header control has `aria-pressed="true"` at a time.
- The contextual region receives a mode-specific accessible name:
  - `Unit 因果链`
  - `地图事件详情` or `地图商路`
  - `练习`
- The `事件详情｜商路` controls appear only in Map mode and expose their selected state.
- Switching the primary mode exits incompatible route or quiz state before rendering the destination panel.

## Visual Rules

- All three primary modes use the same right-panel width, border, background, and internal spacing.
- The right panel does not cover the map.
- Map and Timeline Dock never disappear during a primary-mode switch.
- Practice content should use the existing quiz-card visual language within the shared panel; it must not introduce a nested oversized card or duplicate outer border.

## Verification

Browser verification must cover:

1. Initial combined view shows map, Timeline Dock, and Unit 1 causal chain.
2. `地图` shows the right-panel secondary controls and a clean event-detail empty state with no Practice entry.
3. `商路` opens the existing route picker and selecting a route updates the map.
4. Returning to `事件详情` restores filters and clears route visualization.
5. `练习` stays inside the shared right panel; no practice drawer is visible or present.
6. Switching out of an active quiz restores Unit and filters.
7. Exactly one primary header control is selected in every mode.
8. Narrow layouts preserve map, Timeline Dock, then contextual-panel order.
9. Existing AP World Timeline behavior and APUSH tests remain green.
