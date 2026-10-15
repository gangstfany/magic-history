# AP Art History U7 Implementation Plan

> Use subagent-driven-development for isolated research and integration tasks, with spec review followed by quality review. Continue through the tasks without another approval checkpoint unless a material blocker requires a user choice.

**Goal:** Add all AP 181–191 works and 20 required views, bilingual study content, a complete English Markdown edition, verified local open-license media or honest placeholders, and a tested homepage integration.

**Architecture:** Extend the existing inline JSON data and map configuration. Freeze a U7 manifest first, then assemble separately owned content and media research outputs into the live projection. Extend existing validators and browser tests without changing U1–U6 records, World data, shared typography or camera behavior.

**Tech Stack:** Static HTML/CSS/JS, Node node:test, existing validators, Playwright, PDF text/visual review and WebP assets.

## Task 1 — frozen scope and baseline

Files: `data/ap-art-history-unit-7-manifest.json`, `tests/art-history-u7-content.test.mjs`, `tests/fixtures/u1-u6-pre-u7-hashes.json`.

- [ ] Confirm linked worktree and run the existing 957-test baseline.
- [ ] Add a missing-manifest test before creating data:
  ```js
  const manifest = JSON.parse(await readFile(new URL('../data/ap-art-history-unit-7-manifest.json',import.meta.url)));
  assert.deepEqual(Object.keys(manifest).map(Number),Array.from({length:11},(_,i)=>181+i));
  assert.equal(Object.values(manifest).flatMap(w=>w.requiredViewIds).length,20);
  ```
- [ ] Freeze the ordered IDs below and each work's title, region, site, provenance qualifier and traditionGroup. Cross-check the current official CED and user notes before freezing detailed content.
- [ ] Hash `JSON.stringify(oldWorks)` and `JSON.stringify(oldCredits)` before integration; verify AP<=180 remains equal after integration.

Official view/ID contract:

```js
[
 [181,'ap181-petra',['petra-context','treasury','great-temple']],
 [182,'ap182-bamiyan-buddha',['buddha-front','buddha-context']],
 [183,'ap183-kaaba',['circumambulation','exterior','gathering-context']],
 [184,'ap184-jowo-rinpoche',['primary']],
 [185,'ap185-dome-of-rock',['exterior','interior']],
 [186,'ap186-great-mosque-isfahan',['iwan','iwan-detail','courtyard','mihrab']],
 [187,'ap187-quran-folio',['primary']],
 [188,'ap188-basin-saint-louis',['primary']],
 [189,'ap189-bahram-gur-karg',['primary']],
 [190,'ap190-court-gayumars',['primary']],
 [191,'ap191-ardabil-carpet',['primary']]
]
```

Navigation groups: `Architecture & Sacred Sites` (181,183,185,186), `Buddhist Devotion` (182,184), `Manuscripts & Calligraphy` (187,189,190), `Metalwork & Textiles` (188,191).

Regions: `levant` (181,185), `arabianPeninsula` (183), `iran` (186,189,190,191), `afghanCentralAsia` (182), `tibetanHimalaya` (184), `northAfricaNearEast` (187,188). These are navigation bounds, not proof of a precise workshop; preserve uncertainty qualifiers.

## Task 2 — independently researched content

Research output owner: content worker. Files: `data/ap-art-history-unit-7-content.json`, `docs/content/ap-art-history-unit-7-english.md`, `docs/data-sources/u7-content-sources.md`.

- [ ] Read the supplied notes and Smarthistory volume four, check official identities, and corroborate uncertain claims with institution/monument sources.
- [ ] Produce the 11 records using the existing schema (identification, precise culture, creation-context coordinates, function/form/content/context, 2–4 recognition anchors, valid comparisons with notes, bilingual search terms). Do not embed placeholder images or duplicate media fields here; media worker owns that separate artifact.
- [ ] Write the complete ordered English edition with identification, function, form, content, context, anchors, comparisons and source notes.
- [ ] Assert 11 consecutive AP numbers, nonempty bilingual fields, finite in-range coordinates, valid comparison targets, and 11 ordered Markdown headings.
- [ ] Spec review actual records and sources; quality review language, uncertain provenance and comparisons before integration.

## Task 3 — independent exact-view/rights research

Research output owner: media worker. Files: `data/ap-art-history-unit-7-media.json`, `data/ap-art-history-unit-7-rights.json`, `data/ap-art-history-unit-7-placeholder-authority.json`, `assets/art-history/u7/`, `docs/data-sources/u7-media-sources.md`.

- [ ] Audit each of the 20 view IDs against the official image-set reference. Accept exact named work/view only; AP182 must show documented sculpture before destruction, not an empty niche.
- [ ] Verify image-level Public Domain/CC0/CC BY/CC BY-SA grant and attribution from authoritative sources. Keep an explicit null-image placeholder when not verified; do not copy CED/textbook photographs.
- [ ] Download only eligible files into temporary storage. Correct orientation, preserve full identifying content, use WebP with long edge<=2000 and bytes<=1572864; inspect images visually.
- [ ] Produce ordered media arrays and live credit objects matching the existing schema. Produce ordered rights rows using RIGHTS_FIELDS in scripts/art-history-local-media-contract.mjs; placeholders have exact authoritative source fields and no public asset.
- [ ] Record identity notes, source URLs, rights evidence, access dates, derivative notes and sources checked. Report coverage precisely.
- [ ] Spec review identity/rights; quality review local assets and schema before integration.

## Task 4 — native integration and release tests

Owner: integration worker/controller. Modify `art-history-map.html`, `index.html`, `scripts/validate-art-history-data.mjs`, `scripts/art-history-local-media-contract.mjs`, release/browser scripts, and legacy tests whose release-total assertions legitimately change. Create `docs/data-sources/u7-source-ledger.md`, U7 canonical fixture/tests and focused U7 browser verifier.

- [ ] Add failing live tests for total191, U7 11/20, exact legacy hashes, resolvable comparisons and local media/rights alignment.
- [ ] Join content and media by stable work ID; append records and credits to the existing JSON blocks only. Keep AP1–180 byte-equivalent after JSON parsing. Add precise labels, Unit7 navigation groups, six regions and direct world-coordinate site anchors.
- [ ] Update scope/count/a11y copy to Units1–7/191 without global replacements of AP180 identity or Unit6 range.
- [ ] Extend validator manifest/right/authority registry and unit range181–191. Generalize local-media contract's allowed-unit/path checks from5/6 to5/6/7, retaining every old negative validation.
- [ ] Update only release-wide count/hierarchy expectations in existing tests; retain Unit6 count14, views23, and preserved legacy fixture checks.
- [ ] Focused browser traversal must activate all11 works and20 views in standalone and embedded desktop/mobile, check local natural dimensions/no404 or null placeholders/noimage request, study tabs, comparisons, modal focus, search/filters, auto-focus and manual1:1, and no blocking console errors.
- [ ] Run all Node tests, strict191-work validation, U7 media/browser checks and World/Home/production-map-UI regression. Inspect screenshots and cross-check final coverage ledger/English edition.
- [ ] Final spec review then quality review. Deliver local homepage URL, exact view coverage and complete English file. Keep branch and worktree; no push/merge/Desktop copy without a new request.
