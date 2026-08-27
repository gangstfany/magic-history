# APWH Wide Frame and Responsive Detail Design

Date: 2026-08-27

## Goal

Improve desktop readability across the AP World History map experience by widening the overall application frame and giving the right-side detail panel enough room for event summaries, study metadata, and Key Terms. Preserve the map as the dominant surface and retain the existing stacked layout on narrower screens.

All learner-facing copy remains unchanged and English-only.

## Approved Desktop Layout

The homepage application card increases its maximum width from `1100px` to `1280px`. Its page padding becomes `clamp(14px, 2vw, 24px)` so the application can use more of the available viewport without touching the browser edges.

Within the APWH map workspace:

- the map remains the flexible primary column;
- the detail panel uses `clamp(380px, 34%, 430px)`;
- the intended visual balance is approximately 66–68% map and 32–34% detail panel on ordinary desktop displays;
- the panel width is bounded so large monitors do not turn the detail into an excessively long reading line;
- the map never receives a fixed width and continues to consume all remaining space.

This replaces the current `2.15fr / .85fr` split with a flexible map column and a bounded detail column.

## Responsive Behavior

The existing narrow-screen stacked experience remains the fallback. At viewport widths of `1050px` and below, the map and detail panel stack vertically in their existing order. This prevents the `380px` minimum detail panel from reducing the map below a useful desktop width immediately above the previous `900px` breakpoint.

No horizontal page, workspace, panel, detail, disclosure, or Key Terms overflow is permitted.

Other subject views retain their existing width and responsive behavior unless they inherit the outer application card width naturally. This change does not introduce a right-side detail panel for subjects that currently hide it.

## Key Terms Component

Key Terms continues to render one bordered row per term. At readable component widths, each row uses:

- a stable term column on the left;
- a flexible definition column on the right;
- vertical stacking between multiple term rows.

The layout responds to the width of the Key Terms component, not the browser viewport. The current `220px` threshold is too low: a real desktop detail panel leaves the component approximately `223px` wide, producing `105px` and `82px` text columns without triggering the fallback.

The component threshold increases to `300px`. At or below that width, each row switches to a single column with the term above its definition. Above it, the horizontal term-definition layout remains.

## Scope and Preservation

The implementation changes only layout CSS in the APWH homepage and its mirrored standalone map presentation where required. It preserves:

- APWH data and historical content;
- map markers, zoom, pan, filters, search, and timeline synchronization;
- event selection and location-study navigation;
- disclosure state and focus restoration;
- causal-chain, trade-route, and practice behavior;
- existing colors, typography hierarchy, borders, and interaction states;
- keyboard and touch accessibility.

The local comparison mock is a design aid only and is not production code.

## Verification

Automated and browser verification must cover:

1. The desktop application card can reach the approved wider maximum without viewport overflow.
2. At a representative large desktop viewport, the detail panel falls within the `380–430px` range and the map remains wider than the panel.
3. Event titles, summaries, metadata, and linked-event copy remain within the panel without horizontal overflow.
4. Key Terms is horizontal at a readable component width.
5. Key Terms stacks the term above its definition below the component threshold.
6. The desktop two-column layout transitions cleanly to the existing vertical layout at the verified breakpoint.
7. The homepage mirror and standalone map copy remain behaviorally consistent.
8. Existing APWH Node and browser verification suites continue to pass.

## Success Criteria

The change succeeds when the desktop page uses more of the available browser width, the right-side study detail reads comfortably without making the map secondary, Key Terms never collapses into narrow side-by-side text columns, and narrow screens retain the established vertical experience.
