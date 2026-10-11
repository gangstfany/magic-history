# Unit 2 Ledger and Preservation Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the live Unit 2 source ledger match the official AP 12–47 dataset and make preservation fixtures protect every artwork and credit field.

**Architecture:** Treat the embedded `artwork-data` and `image-credit-data` blocks as the runtime canonical shape, while keeping independently checked fixtures as regression baselines. Parse the Markdown ledger into structured rows and compare every row’s AP number, ID, title, civilization, image source, direct image URL, creator/credit, license name, and license URL against the runtime dataset.

**Tech Stack:** HTML-embedded JSON, Markdown, Node.js built-in test runner.

---

### Task 1: Add failing ledger and fixture-completeness regressions

**Files:**
- Modify: `tests/art-history-preservation.test.mjs`

- [ ] Replace projection-based fixture assertions with direct deep comparisons of complete canonicalized artwork objects and complete credit maps.
- [ ] Add exact expected ID lists for the 21 unaffected and 15 corrected/imported records.
- [ ] Parse `docs/art-history-sources.md` and require exactly 36 AP 12–47 rows matching runtime IDs, titles, civilizations, image sources, direct image URLs, credits, licenses, and license URLs.
- [ ] Run `node --test tests/art-history-preservation.test.mjs` and confirm failure against the old ledger and partial fixture schema.

### Task 2: Replace partial fixtures with complete canonical records

**Files:**
- Modify: `tests/fixtures/u2-unaffected-legacy.json`
- Modify: `tests/fixtures/u2-corrected-and-imported.json`

- [ ] Export the exact 21 unaffected and 15 corrected/imported complete artwork objects from `artwork-data`.
- [ ] Canonicalize absent `siteQualifier` values to `null`.
- [ ] Export the complete corresponding `image-credit-data` objects into each fixture’s `credits` map.
- [ ] Run the focused preservation tests and confirm only the ledger regression remains red.

### Task 3: Rebuild the live Unit 2 source ledger

**Files:**
- Modify: `docs/art-history-sources.md`

- [ ] Replace the obsolete 27-row Egypt/Greece/Rome-only table with 36 rows in official AP 12–47 order.
- [ ] Add explicit ID and official-title columns so AP identity is auditable.
- [ ] Match each row’s civilization, source page, direct URL, creator/institution, license name, and license URL to the embedded runtime data.
- [ ] Remove the obsolete Etruscan exclusion and all mask, Old Market Woman, and superseded AP numbering references.
- [ ] Run the focused preservation/source tests and confirm they pass.

### Task 4: Verify and commit

**Files:**
- Verify all files above plus `art-history-map.html`.

- [ ] Run the strict validator.
- [ ] Run the complete Node test suite.
- [ ] Run a headless browser startup smoke and require 36 ordered works with no page errors.
- [ ] Run `git diff --check` and confirm only focused files changed.
- [ ] Request code review and resolve all critical or important findings.
- [ ] Commit with a focused message and report the SHA and fresh evidence.
