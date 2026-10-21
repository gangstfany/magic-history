# Unit-aware Art Map Colors Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for inline execution with review checkpoints. Preserve the existing isolated worktree and branch.

**Goal:** Apply the approved B prototype to standalone and embedded Art maps without changing layout, content, or interaction.

**Architecture:** Add a bounded inline configuration and pure scope calculation to the existing HTML runtime. Cache path references and painted region signatures; invoke painting from render using filtered works and active Unit. Explicitly identify the seven reviewed Pacific shapes by index plus geometry-prefix guard, never geographic bounding-box inference.

**Tech Stack:** Existing HTML/CSS/vanilla JavaScript, node:test, Playwright.

### Task 1: Scope and palette contracts

- [x] Create `tests/art-history-region-colors.test.mjs`: extract the bounded region-color runtime, verify fixed palette, World opacity constants, all 250 region keys, all ten Unit scopes, cross-region labels, unmapped AP230/241, zero results and unknown-label reporting.
- [x] Run `node --test tests/art-history-region-colors.test.mjs`; observed missing runtime assertion.
- [x] Add `REGION_COLOR_PALETTE`, `REGION_COLOR_GROUPS`, `getRegionColorScope(works, filters)` inside `art-history-map.html`; active scope is `filters.activeUnit || filters.unit`, unknown labels never guess.
- [x] Rerun the scope tests; all 13 pass.

### Task 2: Native rendering and browser checks

- [x] Create `scripts/verify-art-history-region-colors.mjs`: test 1440/390 standalone and embedded, computed fills/opacities, Unit2/8/9, every native filter, empty results, unknown sites, Unit bubble navigation, zoom preservation, map height and no overflow/errors.
- [x] Run the browser script; observed missing colored paths.
- [x] Add cached `renderRegionColors(visibleWorks, state)` to native render. Set only fill/fill-opacity, leaving the existing SVG geometry and pointer-events untouched. Guard explicit Pacific path indexes with their exact coordinate prefixes.
- [x] Rerun browser checks; four passing cases. Saved and visually inspected desktop standalone and mobile embedded screenshots.

### Task 3: Verification and handoff

- [x] Run all Node tests (1,015 pass), strict 250-work validator, World/home regression, and embedded image-dialog regression (all exit 0).
- [x] Review diff and request independent read-only review; no actionable findings.
- [x] Check styles, artwork/credit JSON, SVG, World and homepage files remain byte-for-byte unchanged using git HEAD comparison.
- [x] Mark checklist complete and provide the existing local homepage and Art URLs. No push, merge, Desktop copy, or worktree removal.
