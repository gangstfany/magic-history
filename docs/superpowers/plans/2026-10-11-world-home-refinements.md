# World History and homepage refinements

> **For agentic workers:** Use superpowers:subagent-driven-development. Execute the approved audit fixes with red/green browser regressions and independent spec/code review. Do not commit or push without the final handoff.

**Goal:** Repair the approved audit findings without redesigning the B directory or changing Art History.

**Architecture:** Keep the iframe API as the source of navigation and data. Change only homepage orchestration and World History controls/question generation. Maintain source record identities, Unit membership, study content and existing typography.

**Tech Stack:** Static HTML/CSS/JavaScript, Node tests and Playwright Chromium.

**Execution status:** Completed locally on 2026-10-11. All tasks below are verified: 957 Node tests, 16 new browser scenarios, existing desktop/mobile directory checks and the full World timeline verifier passed. No commit, push or merge. Region scope used the documented no-answer fallback: preserve existing behavior and explain it. Detailed results: `/tmp/world-home-refinements-2026-10-11.md`.

## 1. Navigation (index.html)

- [x] Create scripts/verify-world-home-refinements.mjs using the existing discoverPlaywright/discoverBrowser/startStaticServer helpers. Collect separate regression results so each failure can be demonstrated before implementation.
- [x] Today's Pick: record the entry's stable sourceId in collectEntries and pass it to openEventInMap, not simulated region/pin clicks. Regression: default chain → exact recommended event, map mode and correct Unit.
- [x] Pending search: commit hostSearch input to the API before changing learning view/Unit. Regression: fill Baghdad then immediately select directory location; query and input remain Baghdad.
- [x] Directory navigation: after syncHomeEvents, focus .location-study-title with preventScroll, then scroll it into view on phones. Regression: All Units card Enter yields visible heading focus on desktop and mobile, not BODY.
- [x] Subjects and view changes: transfer focus away from hidden source to a meaningful visible heading/control. Regression: keyboard subject selection ends on the corresponding visible subject pill.

## 2. Practice (world-map.html)

- [x] Reproduce Delhi Sultanate single-event term questions and review mode with one stored error. Ensure term options are four distinct descriptions, contain the correct answer exactly once, use unfiltered validated termParts results for distractors with same-theme priority, and never broaden the question pool.
- [x] Region scope awaits user choice. If approved, filter quiz questions by activeRegion before suspend/deactivate, retain distractor breadth, and explain the scope in the practice picker. If not answered, keep existing broad-region behavior and label it explicitly rather than assume a changed product rule.

## 3. Map accessibility (world-map.html)

- [x] Convert zoom DIVs to native labeled buttons, preserve visual styling and add visible focus. Regression: Enter/Space changes transform; reset restores it.
- [x] Replace mouse-only drag with Pointer Events; handle capture/cancel, drag-vs-click suppression and pinch without accidental pin/region activation. At unzoomed scale allow page vertical scrolling; when zoomed enable custom pan. Regression: trusted CDP touch drag moves transform, pinch changes zoom, pointercancel recovers, mouse pan and ordinary taps still work.

## 4. Precise presentation (index.html and world-map API)

- [x] Expose total source event/pin/region/route counts from the existing iframe source, and populate homepage caption on load and subject return. Regression compares caption to source/API and rules out stale 234/104 literals.
- [x] All Units uses unit/location entry count plus distinct locations, not misleading '78 places'. Explain directory follows Unit only, independent of search/theme filters.
- [x] Label EN coming soon before activation and mention World History + Art History are live in placeholder copy. Improve directory number-badge contrast without changing font sizes/layout.

## Verification and handoff

- [x] Run new regressions red, implement one fix at a time, rerun targeted cases green.
- [x] Run node --test tests/*.test.mjs, scripts/verify-world-study-directory.mjs and scripts/verify-world-timeline.mjs with ART_HISTORY_PLAYWRIGHT_PATH set to the bundled Playwright path.
- [x] Review spec compliance then code quality, resolve findings, preserve untracked prototypes/cache files. No GitHub write or merge.
