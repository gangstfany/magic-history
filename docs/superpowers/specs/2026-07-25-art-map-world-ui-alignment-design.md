# AP Art History Map — World History UI Alignment

**Date:** 2026-07-25  
**Status:** Approved for implementation  
**Reference:** `world-map.html` and the World History panel styles in `index.html`

## Goal

Make the AP Art History map feel like a native member of the existing Magic History interface. The World History map is the visual source of truth. The change covers typography, spacing, filter controls, map controls, AP-number markers, detail hierarchy, embedded layout, and responsive behavior.

The World History implementation must remain visually and behaviorally unchanged.

## Selected approach

Add an explicit embedded presentation mode for `art-history-map.html` and pass that mode from the homepage iframe. The standalone Art History page keeps its full header and explanatory copy; the homepage version removes duplicated framing and uses the compact World History scale.

Do not scale or zoom the whole iframe. Match individual design tokens and component geometry so text remains sharp, hit targets remain accessible, and responsive behavior remains predictable.

## Typography

Use the existing Magic History font stack everywhere:

```css
"PingFang SC", "Hiragino Sans GB", -apple-system, "Helvetica Neue", sans-serif
```

Embedded Art History hierarchy:

| Role | Size | Weight | Notes |
|---|---:|---:|---|
| Outer map-card title | 15px | 800 | Already supplied by `index.html` |
| English artwork title | 19px | 800 | Primary detail heading |
| Chinese artwork subtitle | 13px | 600 | Secondary title |
| Body/detail content | 13.5px | 600 | Match World History event copy |
| Metadata and counts | 12px | 600–700 | Dates, AP number, culture, result count |
| Filter and tab labels | 12–13px | 600–700 | Compact controls |
| Small category labels | 10px | 700 | Use only for tertiary labels |

Body copy uses approximately `1.55` line-height. Long English and Chinese titles must wrap without clipping.

## Embedded layout

When loaded by `index.html`:

- Hide the Art History internal page header and subtitle.
- Keep one compact filter toolbar directly below the outer `AP Art History Map` header.
- Remove the standalone page’s outer margins and duplicate card shadow.
- Let the Art workspace fill the iframe width and available height.
- Preserve the approximate `2:1` map-to-detail split used by the World History homepage.
- Use the same neutral border treatment as the World History map/detail split.
- Keep the Art detail panel inside its iframe; the existing World History event synchronization remains untouched.

When opened directly:

- Keep the full Art History header and subtitle.
- Reuse the same typography and component tokens where possible.
- Retain a comfortable standalone page margin.

## Filters

Desktop:

- Text size: 12–13px.
- Control height: approximately 32–34px.
- Compact pill padding and World History-compatible border radius.
- Selected state uses the existing dark neutral fill.
- Period, type, and search controls share one height.
- Toolbar wraps only when it cannot fit.

Touch layouts:

- Preserve at least a 44px interactive target.
- Keep at least 8px between adjacent touch targets.
- Avoid horizontal page scrolling.

## Map controls

Desktop embedded mode:

- Visual size: 30×30px.
- Arrange vertically at the upper-right: zoom in, zoom out, reset (`1:1`).
- Match World History border, radius, shadow, font weight, and hover feedback.

Touch layouts:

- Preserve a 44×44px interactive hit target.
- Keep visible focus styles and accessible labels.

## AP-number markers

Single-work markers:

- Visual diameter: 22px, matching World History pins.
- Label: 10px, weight 700.
- White outline: 2px.
- Keep the existing civilization colors.
- Preserve a minimum 44×44px transparent hit target.

Grouped-site markers:

- Use compact, content-sized pills at the same visual height.
- Keep the complete AP number/range visible.
- Preserve the existing expand-to-individual-works interaction.
- Active state may be stronger, but must not cause layout shifts.

## Detail panel

- Padding: 16–18px in embedded desktop mode.
- English artwork name is the primary heading.
- Chinese title appears immediately below as a smaller subtitle.
- AP number, date, culture, material, location, type, and function use the compact World History scale.
- Tabs use 12–13px labels and compact vertical padding.
- Study-section headings and paragraphs use the 13.5px body rhythm.
- Artwork images continue to use `object-fit: contain`, with full subjects visible.
- The panel scrolls internally without clipping its sticky or top content.

## Responsive behavior

Validate at approximately 375px, 768px, 1024px, and 1440px CSS viewport widths:

- No horizontal overflow.
- Filters wrap into sensible rows.
- Map and detail stack on narrow screens.
- Touch targets reach 44px on touch layouts.
- Long AP ranges and artwork titles wrap safely.
- The map remains usable with keyboard, pointer, and touch input.

## Accessibility

- Preserve current ARIA labels and keyboard activation.
- Keep visible focus rings.
- Do not rely on color alone for selected state.
- Maintain readable contrast.
- Respect `prefers-reduced-motion`.

## Verification

Automated checks should cover:

- Embedded mode is requested by `index.html`.
- Embedded mode hides only the Art internal header.
- Exact typography and control tokens match the approved values.
- Single marker visuals are 22px with a 44px hit target.
- Standalone mode still displays the Art header.
- Existing Art History data, filtering, marker, detail, image, and AP-number tests remain green.

Browser verification should compare the World and Art subjects in the same homepage card and inspect both desktop and mobile layouts.

## Non-goals

- Do not redesign or modify `world-map.html`.
- Do not change AP artwork content, numbering, coordinates, or images in this pass.
- Do not add the remaining AP 250 works in this pass.
- Do not replace the warm Magic History color palette.
