# APWH Map and Causal Chain Combined View Design

## Goal

Make causal reasoning the primary AP World History learning experience without separating it from geographic context. Students should see the map, the Unit-scoped Timeline Dock, and the current causal chain at the same time.

## Approved Layout

- The page header contains three parallel controls: `因果链`, `地图`, and `练习`.
- The Unit selector remains the single Unit navigation control and is labeled `Unit / 单元`.
- The main desktop workspace has two columns:
  - Left: the existing world map with the Timeline Dock embedded directly beneath it.
  - Right: a contextual panel showing either the selected Unit's causal chain or ordinary map-event details.
- On narrow screens, the two columns stack vertically. The map and Timeline Dock remain together above the contextual panel.

## View Behavior

### Causal Chain

- APWH opens in Unit 1 with `因果链` selected.
- The map and Timeline Dock remain visible.
- The right panel immediately shows the causal chain assigned to the selected Unit.
- Changing the Unit updates map events, Timeline cards, and the right-panel causal chain together.
- Selecting a causal-chain step highlights its corresponding map pin and Timeline card.
- Selecting a linked map pin or Timeline card highlights the corresponding causal-chain step when one exists.

### Map

- Selecting `地图` does not hide or replace the map.
- It changes only the right panel from the causal-chain explanation to the normal event-detail experience.
- The embedded Timeline Dock remains visible and synchronized with the selected Unit.

### Practice

- Selecting `练习` opens a right-side drawer above the current workspace.
- The selected main view remains visible behind the drawer.
- Closing the drawer restores the same Unit, filters, and main-view state.

## Unit and Content Rules

- Unit 1 is the default Unit on first load and after reset.
- Units follow the reviewed College Board AP World History: Modern U1-U9 mapping already used by the page.
- Content before 1200 remains excluded from APWH Unit views.
- If a Unit has no approved causal chain yet, the right panel must show an explicit Unit-specific empty state rather than showing a chain from another Unit.

## Interaction Boundaries

- `因果链` and `地图` are right-panel modes, not separate pages.
- `练习` is an auxiliary drawer, not a third replacement workspace.
- The Unit selector is the only Unit-switching control; no duplicate Unit icon appears in the header.
- Timeline Dock is not represented by a separate header button because it is always part of the map workspace.

## Accessibility and Responsive Behavior

- Header controls expose their selected state through `aria-pressed`.
- The contextual panel has a stable region label that changes with its content.
- Practice focus begins inside the drawer and the close button has an explicit accessible label.
- Mobile controls meet a 44-pixel minimum touch target.
- The mobile stacked layout preserves the order map, Timeline Dock, then contextual panel.

## Verification

Browser verification must cover:

1. Initial Unit 1 combined view shows map, Timeline Dock, and Unit 1 causal chain.
2. `地图` changes only the right-panel content.
3. `因果链` restores the Unit-specific chain without hiding the map.
4. Unit changes update Timeline and causal-chain content together.
5. Practice opens and closes without losing Unit or view state.
6. Desktop and narrow-screen layouts keep map and Timeline Dock together.
7. Existing APUSH Timeline Dock tests continue to pass unchanged.
