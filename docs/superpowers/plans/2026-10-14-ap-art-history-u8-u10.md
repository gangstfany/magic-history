# AP Art History U8–U10 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Preserve the approved sequential integration order and perform spec review before quality review. Continue without additional user approval gates.

**Goal:** Complete AP1–250 in the existing bilingual map, with complete English editions and honest exact-view public-image coverage.

**Architecture:** Reuse separately reviewed content/media sources joined into the inline artwork and credit JSON. Freeze each official manifest before authoring that Unit's content. Preserve prior parsed records/credits with hash guards; extend registries, native controls, validators and browser checks without changing shared CSS or World features.

**Tech Stack:** Static HTML/JS, Node node:test, Playwright, pypdf/Poppler read-only source review, verified local WebP media.

## Task 1 — baseline and official U8 scope

Files: `tests/art-history-u8-content.test.mjs`, `data/ap-art-history-unit-8-manifest.json`, `docs/data-sources/u8-official-views.md`, `tests/fixtures/u1-u7-pre-u8-hashes.json`.

- [x] Verify existing linked non-submodule worktree and keep `feature/ap-art-history-u6`.
- [x] Run `node --test tests/*.test.mjs` with bundled Playwright configured; baseline must pass before live integration.
- [x] Add and run the missing-manifest test below before creating the manifest.

```js
assert.ok(existsSync(manifestPath), 'reviewed U8 manifest is required');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
assert.deepEqual(Object.keys(manifest).map(Number), Array.from({length:21}, (_,i)=>192+i));
for (const row of Object.values(manifest)) {
  assert.deepEqual(Object.keys(row), ['id','titleEn','region','siteName','provenanceQualifier','traditionGroup','requiredViewIds']);
  assert.ok(row.requiredViewIds.length > 0);
}
```

- [x] Research current official CED/AP192–212; render and inspect all relevant image-set pages. Record precise object/component/view descriptions, ordered IDs, total view count and six identification fields in the manifest/official ledger. Read user notes and Smarthistory volume five for cross-checks, not image reuse.
- [x] Spec review identity/view scope, then quality review geography and ID stability.
- [x] Save SHA256 of `JSON.stringify(legacyWorks)` and `JSON.stringify(legacyCredits)` before append-only integration; test AP<=191 and their credits against them.

## Task 2 — U8 complete content and English edition

Files: `data/ap-art-history-unit-8-content.json`, `docs/content/ap-art-history-unit-8-english.md`, `docs/data-sources/u8-content-sources.md`.

- [x] Add red tests requiring21 records/AP192–212, exact manifest identity/qualifiers, all existing study fields, valid comparisons to AP<=212, finite0..1600/0..800 coordinates,2–4 anchors, and21 ordered English headings.
- [x] Author independently summarized bilingual records using the U7 schema, excluding images. Add `provenanceQualifier` only for nonnull manifest values; keep qualified historical creation contexts and distinguish original monuments from reconstructions/museum holdings.
- [x] Write one full English section per work with identification, function/form/content/context, anchors, comparisons, view IDs and sources. Add credit/status notes after media joins.
- [x] Run focused tests, conduct independent spec review, repair discrepancies, then quality review.

## Task 3 — U8 exact-view local media

Files: `data/ap-art-history-unit-8-media.json`, `data/ap-art-history-unit-8-rights.json`, `data/ap-art-history-unit-8-placeholder-authority.json`, `assets/art-history/u8/`, `docs/data-sources/u8-media-sources.md`.

- [x] Add red contract tests requiring each manifest view, exact ordered credit/rights/authority alignment, canonical local paths, allowed rights classes and negative remote-path/license checks.
- [x] Verify named objects and specified components against rendered official views; prioritize primary open-access/explicit Commons grants. Keep the full identifying subject; use a source-linked null image when eligible exact-view media cannot be verified. Do not substitute generic related subjects.
- [x] Store local WebP derivatives with edge<=2000 and bytes<=1572864. Record image-level grant, creator, original/source URLs, access date, identity and derivative notes. Open media omits `mediaStatus`; null media includes nonempty honest status. Single-view credits are objects; multiview credits are ordered arrays.
- [x] Review actual files visually and independently verify rights. Spec review first, then quality review; report open/placeholder counts separately.

## Task 4 — U8 native integration and checkpoint

Files: `art-history-map.html`, `index.html`, native validator/local-media/release/browser scripts, release-wide legacy test expectations, `scripts/verify-art-history-u8-browser.mjs`, `tests/fixtures/u8-canonical.json`, `docs/data-sources/u8-source-ledger.md`.

- [x] Run the red live-release assertion `assert.equal(works.length,212)` and the frozen legacy hashes before joining.
- [x] Join sources by stable IDs, preserving old parsed records and credits. Add Unit8 groups/English region names/direct site anchors. Extend manifest/rights/authority registries, allowed Unit/path8, AP192–212 rules, exact view/credit checks and honest placeholder semantics. Keep previous negative policies intact.
- [x] Update only release-total copy and assertions to212/Units1–8; preserve earlier AP range boundaries and record content.
- [x] Freeze reviewed canonical artwork/credit projection and assert deep equality against live U8.
- [x] Traverse all new works/views via actual Unit→region→site UI in standalone/embedded desktop/mobile; assert labels/counts, filters/reset/search, comparison-button navigation, all study tabs, local decoding/null placeholders, modal focus, camera/manual pan/1:1, subject switching, image-failure fallback, frame/host overflow and console errors. Wait for render frames and close events before assertions.
- [x] Run all Node tests, strict validator, private leak check, focused U8 verifier, full Art browser matrix, production-map-UI and World/Home regression. Inspect screenshots.
- [x] Spec review then quality review final integration; preserve the existing branch. Deliver U8 preview and coverage while continuing Task5.

## Task 5 — U9 staged integration

Files: Unit9 manifest/content/media/rights/authority under `data/`, `assets/art-history/u9/`, English and source ledgers under `docs/`, U9 canonical/hash fixtures and content/browser tests; native registries and release-wide expectations.

- [x] Create/run missing-manifest and live223-work red tests. Freeze official AP213–223 identities and all specified views after CED visual review; document Pacific original contexts, relocated objects and provenance limits.
- [x] Write11 complete bilingual records and11 English sections; comparisons resolve only to AP<=223. Review content against official/curatorial evidence.
- [x] Verify exact-view local PD/CC0/CC BY/CC BY-SA media or honest placeholders, with ordered evidence, attributes and derivative notes. Respect explicit source/cultural access restrictions rather than copying available imagery.
- [x] Extend native Unit9 navigation/path/range/rights validation; append reviewed records and credits. Assert total223 and AP<=212 hashes unchanged.
- [x] Freeze U9 canonical projection; test all11works/all required views and filters/camera/accessibility on desktop/mobile standalone/homepage. Run full regression and two-stage review before Task6.

## Task 6 — U10 staged integration and final250-work release

Files: Unit10 manifest/content/media/rights/authority under `data/`, `assets/art-history/u10/`, English and source ledgers under `docs/`, U10 canonical/hash fixtures and content/browser tests; native registries and release-wide expectations.

- [x] Create/run missing-manifest and live250-work red tests. Freeze official AP224–250 identities and all specified views; distinguish documented performances, original installations, later presentations and artists' origins.
- [x] Write27 complete bilingual records and27 English sections, with comparisons resolving to AP<=250; independent content/spec and quality review.
- [x] Verify both underlying artwork reproduction permission and image-level grant for contemporary works. Do not treat a CC photographer license as sufficient for protected artwork. Ship only eligible exact-view local assets; otherwise use documented honest placeholders. Report27 work records separately from image coverage.
- [x] Extend native Unit10/path/range/evidence validation; append records/credits and assert total250 with AP<=223 hashes unchanged. Freeze canonical projection after review.
- [x] Test every new work/view and all controls/modal/focus/fallback/camera/subject/overflow checks across four browser cases. Run full structural/rights/private-leak/Art/World/Home regressions and screenshot review.
- [x] Final independent spec review then quality review; update stage ledgers with actual verification evidence and exact coverage. Deliver local homepage, three English editions, completed250-record scope and unresolved image views. No push, merge or Desktop copy without a new request.
