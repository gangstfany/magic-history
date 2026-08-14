# APWH Cross-Unit Mainline Design

Date: 2026-08-14

Branch: `feature/apwh-cross-unit-mainline`

Base: `61bcf28`

## Goal

Connect the approved AP World main causal chains into one continuous course-level narrative without changing the meaning or numbering of any chain step.

Students keep learning one Unit at a time. A seam at the beginning or end of a main chain explains what causal condition arrived from the previous Unit and what consequence is handed to the next Unit. A separate course mainline view lets students review those handoffs as one vertical sequence before an exam.

## Scope

This increment covers the three approved main chains already present:

- `u1_main` — Unit 1 · Surplus → Exchange
- `u23_empires` — Unit 2→3 · Empires from Ruins
- `u4_atlantic` — Unit 4 · Atlantic System

Unit 5 is shown as the next pending destination. Units 5–9 do not receive invented chain content in this increment. Supplementary chains remain Unit-local and do not appear as course-mainline segments.

## Data Contract

Each main chain receives explicit seam metadata:

```js
{
  id: 'u23_empires',
  units: ['u2', 'u3'],
  entryUnit: 'u2',
  from: 'u1_main',
  to: {
    unit: 'u4',
    chain: 'u4_atlantic',
    summary: '帝国秩序稳定 → 奥斯曼坐收陆路过路费 → 欧洲商人被迫改走海路'
  }
}
```

Rules:

1. `entryUnit` is the Unit selected when a student enters that segment from the course mainline.
2. `from` is either `null` or the previous main chain ID.
3. `to` is either `null` or an object containing the destination Unit, optional destination chain ID, and the handoff summary.
4. Incoming seam copy is derived from the previous chain's `to`; it is not stored twice.
5. If `to.chain` names an implemented chain, that target must reciprocally name the source in `from`.
6. If the destination is not implemented yet, `to.chain` is omitted and the destination is rendered as pending.
7. Existing `stops`, `labels`, `links`, and `evidence` remain unchanged. Seams are not stops and never affect the ring count or progress value.

Initial links:

- `u1_main.from = null`; `u1_main.to → u23_empires`
- `u23_empires.from = u1_main`; `u23_empires.to → u4_atlantic`
- `u4_atlantic.from = u23_empires`; `u4_atlantic.to → Unit 5 (pending)`

## Unit Chain View

The right-side causal-chain panel keeps its current title, explanatory copy, chain switcher, steps, evidence, and controls.

For main chains only:

- An incoming teal seam card appears immediately before the numbered steps when `from` exists.
- An outgoing teal seam card appears immediately after the final numbered step when `to` exists.
- The incoming card says `承自 UNIT …`, explains the previous chain's handoff, and links to the previous chain's final step.
- An implemented outgoing card says `交棒 UNIT …` and links to the next chain's first step.
- A pending outgoing card identifies the destination Unit but is not interactive.
- Teal is reserved for cross-Unit causation. Purple remains the within-Unit arrow color.

Clicking a working seam link updates the Unit selector, enters the destination main chain, selects its boundary step, and synchronizes the map anchor. It does not add a new browser page or duplicate the chain in another module.

## Course Mainline View

A two-state control is placed in the causal-chain panel header:

- `当前单元`
- `九单元主线`

`当前单元` preserves the existing learning view. `九单元主线` replaces only the right-side panel content; the map remains in place.

The mainline is a vertical sequence derived from main-chain data:

1. One segment card per implemented main chain.
2. The segment label, ring count, and active state come from that chain.
3. The connector beneath a segment comes from that chain's `to.summary`.
4. Implemented segments are keyboard-accessible buttons.
5. Clicking an implemented segment selects its `entryUnit`, enters that chain, and returns to `当前单元` at its first step.
6. A destination with no implemented chain is shown as a disabled `待建` segment.
7. No separate mainline narrative dataset is created.

The initial rendered sequence is:

`Unit 1 → Unit 2→3 → Unit 4 → Unit 5 待建`

Later Unit chains extend this sequence by filling the current pending target and adding their own `to` metadata.

## State and API

The existing `__mapFilter` API remains the integration boundary. It will expose enough read-only metadata for the embedded Main page and browser verifier to inspect:

- main chain ID, Units, entry Unit, ring count
- resolved `from` chain ID
- `to` destination Unit, optional chain ID, and summary
- whether the course-mainline panel is active

Primary Unit selection remains the source of truth. Opening the course mainline does not alter the active Unit. Entering a segment does.

## Accessibility and Responsive Behavior

- Both view controls use native buttons with `aria-pressed`.
- Seam links and implemented segment cards use native buttons.
- Pending segments are non-interactive and exposed as unavailable.
- Focus order follows visual order.
- At narrow widths, labels wrap vertically; no horizontal scrolling is introduced.
- Existing map/panel stacking behavior at the 700px verification viewport is preserved.

## Verification

Browser tests will prove:

1. The three current main chains expose valid, reciprocal `from/to` metadata.
2. Incoming and outgoing seams render only for main chains and do not change ring counts.
3. U1 → U2→3 and U2→3 → U4 seam actions switch Unit, chain, boundary step, and map anchor together.
4. Unit 4 → Unit 5 is visible as pending and cannot navigate to fabricated content.
5. The course mainline contains the three implemented segments in order plus Unit 5 pending.
6. Its connector text is derived from `to.summary` rather than a duplicate dataset.
7. Clicking a mainline segment returns to Unit view at the correct chain and first step.
8. Supplementary chains are absent from the course mainline.
9. Existing APWH Timeline, map, practice, trade-route, Main embed, and responsive tests remain green.
10. The complete APUSH regression suite remains green.

## Out of Scope

- Writing or approving Unit 2–9 educational content
- Creating Unit 5–9 main chains
- Changing existing chain evidence or causal wording beyond the seam summaries already present at chain boundaries
- Adding a new standalone module or route
- Merging APWH work into `main`
