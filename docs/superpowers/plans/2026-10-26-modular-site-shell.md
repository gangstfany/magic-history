# Modular Site Shell Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task in the current isolated workspace.

**Goal:** Separate the shared homepage from independently loadable course workspaces while preserving reviewed World History features.

**Architecture:** A static shell renders a course registry and caches isolated iframe entries. A small validated postMessage contract handles readiness and content sizing; course data and learning UI remain inside their course pages.

**Tech Stack:** HTML, CSS, native ES modules, Python build scripts, Node test runner.

### Task 1: Define and test the shared contract
- [x] Create tests/site-modules.test.mjs covering four entries, unavailable Euro, URL selection, origin/source/message validation, bounded height, and course-independent builds.
- [x] Run `node --test tests/site-modules.test.mjs`; confirm failure before implementation.
- [x] Create assets/site/modules.mjs with immutable registry and pure validation helpers.

### Task 2: Extract the World workspace
- [x] Move src/site/index.template.html to src/apwh/workspace.template.html. Remove public navigation, account boot, other course frames and subject-switch logic. Keep World workspace and daily recommendation.
- [x] Update src/apwh/build.py to read its own template and write apwh.html plus world-map.html; retain all content transformations.
- [x] Move World host assertions to apwh.html; replace obsolete cross-course sizing assertions with module isolation coverage.

### Task 3: Build the shared shell
- [x] Create a small src/site/index.template.html, assets/site/shell.css and shell.mjs for public navigation, account trigger, persistent lazy course frames, hash navigation, accessible status, failure/retry and standalone links.
- [x] Add module-bridge.mjs to course entries; validate message source and origin in shell. Content-size World/US/Art; Art uses an embed-only natural-body-height adapter.
- [x] Add scripts/build-shell.py, update scripts/build-site.py to compose independent shell and World builds.

### Task 4: Verify and document
- [x] Run module, account, World and source content tests; run browser checks at desktop/mobile sizes, switch and return to a selected World learning card, and check all live modules.
- [x] Document per-module entry/source/build ownership in README.md and BRANCHES.md, plus deployment instructions.
- [x] Request code review, resolve substantive findings, run final checks and commit the reviewed implementation on its own branch.
