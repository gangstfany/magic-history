# AP Art History U5–U6 Open-License Local Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit all 50 College Board-required U5–U6 views and replace eligible remote media or empty states with exact, repository-local, web-optimized images licensed as Public Domain, CC0, CC BY, or CC BY-SA.

**Architecture:** Keep the existing static HTML map and canonical fixtures, but add a shared media-audit contract that distinguishes release-ready local assets from unresolved rights states. U5 and U6 retain their ordered manifests; rights JSON, source ledgers, fixtures, embedded HTML data, and browser evidence must agree for every view. A small Pillow-based import tool creates bounded local derivatives, while Node and rendered-browser checks enforce paths, file size, licensing, load success, and preservation.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js ESM and `node:test`, Python 3 with Pillow for offline image optimization, Playwright/CDP through the existing browser verifier, Git.

---

## Scope and File Map

**Create:**

- `assets/art-history/u5/` — accepted optimized Unit 5 images only.
- `assets/art-history/u6/` — accepted optimized Unit 6 images only.
- `data/ap-art-history-unit-6-rights.json` — one audited rights record for each of the 23 U6 views.
- `data/ap-art-history-unit-6-placeholder-authority.json` — exact unresolved U6 keys only.
- `scripts/art-history-local-media-contract.mjs` — shared rights/path/asset contract used by tests and validation.
- `scripts/optimize-art-history-media.py` — deterministic EXIF-aware raster optimizer.
- `tests/art-history-local-media-contract.test.mjs` — synthetic contract tests and real U5/U6 integration checks.
- `tests/test_optimize_art_history_media.py` — optimizer behavior tests using generated in-memory fixtures.

**Modify:**

- `data/ap-art-history-unit-5-rights.json` — expand each of 27 records with exact source, local path, access date, identity evidence, and derivative evidence.
- `data/ap-art-history-unit-5-placeholder-authority.json` — retain only U5 views still unresolved after the exact-image audit.
- `tests/fixtures/u5-canonical.json` — replace accepted U5 remote image URLs with local asset paths.
- `tests/fixtures/u5-browser.json` — synchronize expected U5 public-media state.
- `docs/data-sources/u5-source-ledger.md` — record the complete 27-view exact-image and license audit.
- `docs/data-sources/u6-source-ledger.md` — record the complete 23-view exact-image and license audit.
- `docs/content/ap-art-history-unit-6-english.md` — synchronize required-view media/source notes without changing study prose.
- `tests/art-history-u5-canonical.test.mjs` — remove frozen 16/11 assumptions and validate the new local-media contract.
- `tests/art-history-u6-content.test.mjs` — replace the frozen two-public-image policy with the new U6 rights and local-media contract.
- `scripts/validate-art-history-data.mjs` — load U6 rights/authority and enforce the same reviewed release contract for Units 5 and 6.
- `art-history-map.html` — update U5/U6 embedded media paths and image-credit records only.
- `scripts/verify-art-history-browser.mjs` — verify all 50 U5/U6 views, natural dimensions, containment, and request behavior.
- `tests/art-history-browser-verifier.test.mjs` — lock the expanded browser evidence shape.
- `scripts/verify-art-history-release.mjs` — add the optimizer unit test stage only if Pillow is available in the release environment; otherwise keep optimizer tests as a documented authoring gate and leave the four public-release stages unchanged.

**Preserve:**

- U1–U4 records and assets.
- `world-map.html`.
- U5/U6 titles, study text, coordinates, hierarchy, markers, filters, comparisons, and timeline behavior.
- The U5 private-media loader for whatever unresolved U5 keys remain.

## Uniform Rights Record

Both U5 and U6 rights files use this exact field order:

```json
{
  "creatorOrInstitution": "Named creator and source institution",
  "sourcePageUrl": "https://authoritative.example/object-or-file-page",
  "originalFileUrl": "https://authoritative.example/original-image.jpg",
  "localAssetPath": "assets/art-history/u5/ap153-plan.webp",
  "licenseClass": "cc-by-sa",
  "licenseName": "CC BY-SA 3.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
  "releaseClass": "open",
  "accessedOn": "2026-10-08",
  "identityNote": "The source identifies Chavín de Huántar and the required site-plan view.",
  "derivativeNote": "Resized to a 2000 px long edge, converted to WebP, and stripped of nonessential metadata."
}
```

An unresolved record retains the same keys, but uses `null` for `originalFileUrl` and `localAssetPath`, `restricted` for both `licenseClass` and `releaseClass`, the most authoritative identity/source page as `sourcePageUrl`, and a concrete explanation in `derivativeNote` that no derivative was created.

Allowed `licenseClass` values are exactly:

```js
new Set(['public-domain', 'cc0', 'cc-by', 'cc-by-sa', 'restricted']);
```

---

### Task 1: Build and Test the Shared Local-Media Contract

**Files:**

- Create: `scripts/art-history-local-media-contract.mjs`
- Create: `tests/art-history-local-media-contract.test.mjs`

- [ ] **Step 1: Write synthetic RED tests for the uniform contract**

Create tests that build temporary U5/U6-like manifests, artwork records, rights records, authorities, and files. The passing fixture contains one local open image and one unresolved view. Mutation cases must reject a remote live `imageUrl`, missing local file, disallowed license class, duplicate local asset, file larger than 1.5 MB, authority/open mismatch, and noncanonical path.

Use this public API in the test:

```js
import {
  ALLOWED_OPEN_LICENSE_CLASSES,
  MAX_LOCAL_MEDIA_BYTES,
  assertLocalMediaContract,
  flattenRequiredViewKeys,
} from '../scripts/art-history-local-media-contract.mjs';

assert.deepEqual(
  [...ALLOWED_OPEN_LICENSE_CLASSES],
  ['public-domain', 'cc0', 'cc-by', 'cc-by-sa'],
);
assert.equal(MAX_LOCAL_MEDIA_BYTES, 1_572_864);
assert.doesNotThrow(() => assertLocalMediaContract(validFixture));
assert.throws(
  () => assertLocalMediaContract(withRemoteLiveImage),
  /must use a repository-local image path/,
);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-local-media-contract.test.mjs
```

Expected: FAIL because `scripts/art-history-local-media-contract.mjs` does not exist.

- [ ] **Step 3: Implement the minimal shared contract**

Export these constants and functions:

```js
export const ALLOWED_OPEN_LICENSE_CLASSES = Object.freeze([
  'public-domain', 'cc0', 'cc-by', 'cc-by-sa',
]);
export const MAX_LOCAL_MEDIA_BYTES = 1_572_864;
export const RIGHTS_FIELDS = Object.freeze([
  'creatorOrInstitution', 'sourcePageUrl', 'originalFileUrl',
  'localAssetPath', 'licenseClass', 'licenseName', 'licenseUrl',
  'releaseClass', 'accessedOn', 'identityNote', 'derivativeNote',
]);

export function flattenRequiredViewKeys(manifest) {
  return Object.values(manifest).flatMap((work) =>
    work.requiredViewIds.map((viewId) => `${work.id}::${viewId}`));
}
```

`assertLocalMediaContract()` must verify exact rights key order, exact field order, ISO access date, HTTPS evidence URLs, unique local paths, `assets/art-history/u5|u6/apNNN-view-id.(webp|jpg|jpeg|png)` naming, real file existence, nonzero size, maximum size, open/media-path alignment, restricted/authority alignment, and one live artwork view per manifest view. It must reject any `http://`, `https://`, absolute, `.private-media/`, or `file:` live image path.

- [ ] **Step 4: Run GREEN and all existing Node tests**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-local-media-contract.test.mjs
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/*.test.mjs
```

Expected: focused tests PASS; the existing suite remains green because the new module is not yet wired to production data.

- [ ] **Step 5: Commit**

```bash
git add scripts/art-history-local-media-contract.mjs \
  tests/art-history-local-media-contract.test.mjs
git commit -m "test: define AP Art History local media contract"
```

---

### Task 2: Build and Test the Offline Image Optimizer

**Files:**

- Create: `scripts/optimize-art-history-media.py`
- Create: `tests/test_optimize_art_history_media.py`

- [ ] **Step 1: Write optimizer RED tests**

Generate temporary portrait, landscape, EXIF-rotated, transparent, and noisy source images with Pillow. Assert that output orientation is correct, the long edge is at most 2000 pixels, output size is at most 1,572,864 bytes, alpha content uses lossless WebP, ordinary photographs use bounded-quality WebP, and the script refuses a destination outside `assets/art-history/u5` or `assets/art-history/u6`.

The test invokes:

```python
from scripts.optimize_art_history_media import optimize_image

result = optimize_image(source, destination, max_edge=2000, max_bytes=1_572_864)
self.assertLessEqual(max(result.width, result.height), 2000)
self.assertLessEqual(result.byte_count, 1_572_864)
self.assertEqual(result.relative_path, 'assets/art-history/u5/ap153-plan.webp')
```

- [ ] **Step 2: Run RED**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3' \
  -m unittest discover -s tests -p 'test_optimize_art_history_media.py' -v
```

Expected: FAIL because the optimizer module does not exist.

- [ ] **Step 3: Implement deterministic optimization**

The module must:

```python
image = ImageOps.exif_transpose(Image.open(source_path))
image.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
```

It saves to a temporary sibling, tries WebP qualities from 88 downward in two-point steps until the limit is met, uses lossless WebP for images with meaningful alpha, verifies the saved file by reopening it, atomically replaces the destination, and returns an immutable result containing width, height, byte count, and repository-relative path. It must never overwrite an existing output unless `--replace` is supplied.

The CLI is:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3' \
  scripts/optimize-art-history-media.py \
  --source /private/tmp/source.jpg \
  --destination assets/art-history/u5/ap153-plan.webp \
  --max-edge 2000 \
  --max-bytes 1572864
```

- [ ] **Step 4: Run GREEN and a real smoke conversion**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3' \
  -m unittest discover -s tests -p 'test_optimize_art_history_media.py' -v
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3' \
  scripts/optimize-art-history-media.py --help
```

Expected: all optimizer tests PASS and `--help` documents source, destination, maximum edge, maximum bytes, and replace behavior.

- [ ] **Step 5: Commit**

```bash
git add scripts/optimize-art-history-media.py tests/test_optimize_art_history_media.py
git commit -m "build: add AP Art History image optimizer"
```

---

### Task 3: Audit, Localize, and Synchronize All 27 Unit 5 Views

**Files:**

- Create: `assets/art-history/u5/*`
- Modify: `data/ap-art-history-unit-5-rights.json`
- Modify: `data/ap-art-history-unit-5-placeholder-authority.json`
- Modify: `tests/fixtures/u5-canonical.json`
- Modify: `tests/fixtures/u5-browser.json`
- Modify: `docs/data-sources/u5-source-ledger.md`
- Modify: `tests/art-history-u5-canonical.test.mjs`
- Modify: `tests/art-history-local-media-contract.test.mjs`

- [ ] **Step 1: Add the real U5 integration test and verify RED**

Load the U5 manifest, rights, authority, canonical fixture, and project root, then call the shared contract. Assert exactly 27 keys and zero remote live image paths. Replace frozen expectations such as 16 open / 11 restricted with a computed distribution whose sum is 27 and whose restricted keys exactly equal the authority keys.

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-local-media-contract.test.mjs \
  tests/art-history-u5-canonical.test.mjs
```

Expected: FAIL because current U5 records use the old rights schema and remote image URLs.

- [ ] **Step 2: Audit AP153–159 view by view**

Research and decide each exact key independently:

```text
ap153-chavin-huantar::plan
ap153-chavin-huantar::lanzon-stela
ap153-chavin-huantar::relief-sculpture
ap153-chavin-huantar::nose-ornament
ap154-mesa-verde::cliff-dwellings
ap155-yaxchilan::structure-40
ap155-yaxchilan::lintel-25-structure-23
ap155-yaxchilan::structure-33
ap156-great-serpent-mound::earthwork
ap157-templo-mayor::reconstruction
ap157-templo-mayor::coyolxauhqui-stone
ap157-templo-mayor::calendar-stone
ap157-templo-mayor::olmec-style-mask
ap158-ruler-feather-headdress::primary
ap159-city-cusco::city-plan
ap159-city-cusco::qorikancha-santo-domingo
ap159-city-cusco::saqsa-waman-walls
```

For each key: verify the exact required view on an authoritative source page; verify an allowed image-level license; download only an eligible original to a temporary directory; run the optimizer; visually compare the derivative with the official required view; update rights, canonical fixture, browser fixture, ledger, and authority in the same edit. If identity or license fails, set both image paths to `null`, preserve the unresolved public state, and document the exact failed criterion.

- [ ] **Step 3: Audit AP160–166 view by view**

Apply the identical evidence sequence independently to:

```text
ap160-maize-cobs::primary
ap161-machu-picchu::city
ap161-machu-picchu::observatory
ap161-machu-picchu::intihuatana-stone
ap162-all-toqapu-tunic::primary
ap163-bandolier-bag::primary
ap164-transformation-mask::closed
ap164-transformation-mask::open
ap165-painted-elk-hide::primary
ap166-black-on-black-vessel::primary
```

Do not accept a museum object from the same type, maker, culture, or collection unless it is the exact AP object and required view. Do not convert the existing private-study bundle into public assets.

- [ ] **Step 4: Make the U5 tests reflect evidence instead of old counts**

Remove `EXPECTED_RESTRICTED_KEYS` and the exact 16/11 distribution. Retain exact-key/order assertions, but derive the unresolved key set from `releaseClass === 'restricted'`. For every open row, assert canonical `imageUrl === localAssetPath`, credit fields match rights, and the ledger records the same source, license, access date, identity note, and derivative note.

- [ ] **Step 5: Run U5 GREEN and inspect Git boundaries**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3' \
  -m unittest discover -s tests -p 'test_optimize_art_history_media.py' -v
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-local-media-contract.test.mjs \
  tests/art-history-u5-canonical.test.mjs
git diff --check
git status --short
```

Expected: both test files PASS; exactly 27 U5 audit rows exist; every open U5 view has a tracked local asset; every unresolved U5 view is an authority-backed non-requesting state; no temporary original or private file appears in Git status.

- [ ] **Step 6: Commit U5 as one evidence-consistent unit**

```bash
git add assets/art-history/u5 data/ap-art-history-unit-5-rights.json \
  data/ap-art-history-unit-5-placeholder-authority.json \
  tests/fixtures/u5-canonical.json tests/fixtures/u5-browser.json \
  docs/data-sources/u5-source-ledger.md \
  tests/art-history-u5-canonical.test.mjs \
  tests/art-history-local-media-contract.test.mjs
git commit -m "feat: localize open-license AP Art History U5 media"
```

---

### Task 4: Audit, Localize, and Synchronize All 23 Unit 6 Views

**Files:**

- Create: `assets/art-history/u6/*`
- Create: `data/ap-art-history-unit-6-rights.json`
- Create: `data/ap-art-history-unit-6-placeholder-authority.json`
- Modify: `docs/data-sources/u6-source-ledger.md`
- Modify: `docs/content/ap-art-history-unit-6-english.md`
- Modify: `tests/art-history-u6-content.test.mjs`
- Modify: `tests/art-history-local-media-contract.test.mjs`

- [ ] **Step 1: Add the real U6 integration test and verify RED**

Load U6 live work records temporarily from the HTML data block, the U6 manifest, new rights file, new authority file, and project root. Call the shared contract and assert exactly 23 keys, allowed open-license classes only, and zero remote U6 live image paths after Task 5 imports the results.

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-local-media-contract.test.mjs \
  tests/art-history-u6-content.test.mjs
```

Expected: FAIL because U6 rights/authority files do not exist and the live data still contains two remote URLs.

- [ ] **Step 2: Audit AP167–173 view by view**

Research and decide each exact key independently:

```text
ap167-great-zimbabwe::conical-tower
ap167-great-zimbabwe::circular-wall
ap168-great-mosque-djenne::mosque
ap168-great-mosque-djenne::monday-market
ap169-wall-plaque-obas-palace::wall-plaque
ap169-wall-plaque-obas-palace::oba-context
ap170-sika-dwa-kofi::golden-stool
ap170-sika-dwa-kofi::stool-context
ap171-ndop-king-mishe::ndop
ap171-ndop-king-mishe::ruler-context
ap172-nkisi-nkondi::primary
ap173-female-pwo-mask::primary
```

For AP169, AP171, AP172, and AP173, match the exact museum object or named historical/context photograph in the official set. A different Benin plaque, Kuba ruler figure, Kongo power figure, or Pwo mask fails identity even if openly licensed.

- [ ] **Step 3: Audit AP174–180 view by view**

Apply the same exact-object and exact-context rule to:

```text
ap174-portrait-mask-mblo::mask
ap174-portrait-mask-mblo::performance-context
ap175-bundu-mask::mask
ap175-bundu-mask::performance-context
ap176-ikenga::primary
ap177-lukasa-memory-board::memory-board
ap177-lukasa-memory-board::contextual
ap178-aka-elephant-mask::mask
ap178-aka-elephant-mask::performance-context
ap179-reliquary-figure-byeri::primary
ap180-veranda-post-olowe::primary
```

Performance/context rows require the exact documented historical scene named by the required view. An image of a contemporary or different performance does not qualify. AP180 must remain the enthroned king and senior wife post, not another Olowe veranda post.

- [ ] **Step 4: Replace the frozen two-image U6 policy**

Remove `PUBLIC_LICENSE_BY_VIEW` and the assertion that exactly two U6 images are public. Parse `data/ap-art-history-unit-6-rights.json`; verify all 23 rows against the ledger, authority, and media records; and derive open/unresolved counts from the audit. Update the English edition's `Required Views and Sources` lines so each view reports its local release state or unresolved evidence state while leaving the study prose unchanged.

- [ ] **Step 5: Run the U6 evidence tests**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3' \
  -m unittest discover -s tests -p 'test_optimize_art_history_media.py' -v
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-local-media-contract.test.mjs \
  tests/art-history-u6-content.test.mjs
git diff --check
git status --short
```

Expected before Task 5: rights, authority, ledger, asset, and English-edition checks PASS; only the explicitly marked live-HTML import assertion remains RED.

- [ ] **Step 6: Commit the U6 evidence bundle**

```bash
git add assets/art-history/u6 data/ap-art-history-unit-6-rights.json \
  data/ap-art-history-unit-6-placeholder-authority.json \
  docs/data-sources/u6-source-ledger.md \
  docs/content/ap-art-history-unit-6-english.md \
  tests/art-history-u6-content.test.mjs \
  tests/art-history-local-media-contract.test.mjs
git commit -m "feat: audit open-license AP Art History U6 media"
```

---

### Task 5: Import the Reviewed Local Media into the Live Map and Validator

**Files:**

- Modify: `art-history-map.html`
- Modify: `scripts/validate-art-history-data.mjs`
- Modify: `tests/fixtures/u5-canonical.json` if audit review produced a final correction
- Modify: `tests/fixtures/u5-browser.json` if audit review produced a final correction
- Modify: `tests/art-history-data.test.mjs`
- Modify: `tests/art-history-u5-canonical.test.mjs`
- Modify: `tests/art-history-u6-content.test.mjs`

- [ ] **Step 1: Add failing validator assertions for both Units**

Extend validator tests so U5 and U6 rights files must use the uniform schema, authorities must equal exactly the unresolved key sets, open live records must use their audited local paths, unresolved records must make no image request, and any remote U5/U6 live image URL fails.

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-data.test.mjs \
  tests/art-history-u5-canonical.test.mjs \
  tests/art-history-u6-content.test.mjs
```

Expected: FAIL because the live HTML and strict validator still use the legacy U5/U6 media policy.

- [ ] **Step 2: Import U5 media without changing study records**

For each AP153–166 `images` member in `#artwork-data`, copy only these reviewed media fields from the U5 canonical fixture:

```js
{
  id,
  label,
  imageUrl,
  imageAlt,
  imageSourceName,
  imageSourceUrl,
  ...(mediaStatus ? { mediaStatus } : {}),
}
```

Update the matching `#image-credit-data` members from the rights audit. Do not change any nonmedia artwork field.

- [ ] **Step 3: Import U6 media and credits**

For AP167–180, preserve the existing view order, labels, and alt text; replace the two remote URLs and eligible unresolved states with audited local paths; retain unresolved states for rejected rows; and synchronize each credit from the U6 rights file.

- [ ] **Step 4: Generalize strict validation from U5-only to U5/U6**

Load:

```js
const RIGHTS_AUDIT_URLS = new Map([
  [3, new URL('../data/ap-art-history-unit-3-rights.json', import.meta.url)],
  [4, new URL('../data/ap-art-history-unit-4-rights.json', import.meta.url)],
  [5, new URL('../data/ap-art-history-unit-5-rights.json', import.meta.url)],
  [6, new URL('../data/ap-art-history-unit-6-rights.json', import.meta.url)],
]);

const PLACEHOLDER_AUTHORITY_URLS = new Map([
  [4, new URL('../data/ap-art-history-unit-4-public-placeholders.json', import.meta.url)],
  [5, new URL('../data/ap-art-history-unit-5-placeholder-authority.json', import.meta.url)],
  [6, new URL('../data/ap-art-history-unit-6-placeholder-authority.json', import.meta.url)],
]);
```

Use the shared contract for Units 5 and 6 rather than duplicating exact count rules. Keep U3/U4 legacy policies unchanged.

- [ ] **Step 5: Run focused GREEN**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-local-media-contract.test.mjs \
  tests/art-history-data.test.mjs \
  tests/art-history-u5-canonical.test.mjs \
  tests/art-history-u6-content.test.mjs
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/validate-art-history-data.mjs art-history-map.html
```

Expected: all focused tests PASS; validator reports 180 works and accepts only audited repository-local U5/U6 release media.

- [ ] **Step 6: Prove nonmedia preservation**

Run the existing preservation tests and inspect a field-filtered diff confirming that AP153–180 changes are limited to `images` and image credits:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-preservation.test.mjs \
  tests/art-history-details.test.mjs \
  tests/homepage-art-integration.test.mjs
git diff --check
```

Expected: PASS; `world-map.html`, U1–U4, homepage counts, and all U5/U6 study fields remain unchanged.

- [ ] **Step 7: Commit live import**

```bash
git add art-history-map.html scripts/validate-art-history-data.mjs \
  tests/art-history-data.test.mjs tests/art-history-u5-canonical.test.mjs \
  tests/art-history-u6-content.test.mjs \
  tests/fixtures/u5-canonical.json tests/fixtures/u5-browser.json
git commit -m "feat: serve U5 U6 media from local open assets"
```

---

### Task 6: Traverse All 50 Views in the Rendered Browser

**Files:**

- Modify: `scripts/verify-art-history-browser.mjs`
- Modify: `tests/art-history-browser-verifier.test.mjs`

- [ ] **Step 1: Write failing browser-evidence tests**

Expand the U5 and U6 reports so every work/view returns:

```js
{
  id: 'conical-tower',
  state: 'local-image',
  src: 'assets/art-history/u6/ap167-conical-tower.webp',
  naturalWidth: 1333,
  naturalHeight: 2000,
  byteCount: 412345,
  definingContentVisible: true,
}
```

An unresolved row returns `state: 'unresolved'`, `src: null`, zero image requests, and a visible status. Assert 27 U5 plus 23 U6 rows per required traversal, unique local paths, long edge at most 2000, nonzero dimensions, byte count at most 1,572,864, and exact local/unresolved state agreement with rights files.

- [ ] **Step 2: Run browser test RED**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-browser-verifier.test.mjs
```

Expected: FAIL because current browser reports do not include per-view local-media evidence.

- [ ] **Step 3: Implement per-view media evidence**

After activating each view, inspect `.artwork-image` and the network request log. For local images, wait for `complete && naturalWidth > 0`, collect dimensions and pathname, compare the rendered `object-fit`/bounding box with the full intrinsic aspect ratio, and assert no essential-content clipping. For unresolved rows, assert the `<img>` is absent or has no `src`, the status is visible, and no request was issued for that view.

- [ ] **Step 4: Run focused U5 and U6 rendered checks**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/verify-art-history-browser.mjs --u5-only
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/verify-art-history-browser.mjs --u6-only
```

Expected: desktop, 390 px mobile, and homepage-embedded cases traverse every ordered view without 404, console error, overflow, broken switcher, modal regression, or focus loss.

- [ ] **Step 5: Commit browser coverage**

```bash
git add scripts/verify-art-history-browser.mjs \
  tests/art-history-browser-verifier.test.mjs
git commit -m "test: verify all local U5 U6 media views"
```

---

### Task 7: Run the Public Release Gate and Prepare the Truthful Coverage Report

**Files:**

- Modify if required by verified behavior: `scripts/verify-art-history-release.mjs`
- Modify if required by verified behavior: `scripts/verify-art-history-private-leaks.mjs`
- Create: `docs/data-sources/u5-u6-open-media-coverage.md`

- [ ] **Step 1: Verify optimizer and static evidence**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3' \
  -m unittest discover -s tests -p 'test_optimize_art_history_media.py' -v
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/*.test.mjs
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/validate-art-history-data.mjs art-history-map.html
```

Expected: all tests PASS; validator reports 180 works and 50 audited U5/U6 views.

- [ ] **Step 2: Run leak and tracked-file checks**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/verify-art-history-private-leaks.mjs
git ls-files '.private-media/**'
git status --short
git diff --check
```

Expected: leak guard PASS; `git ls-files` prints nothing; no temporary originals, machine paths, untracked accepted assets, or unrelated changes remain.

- [ ] **Step 3: Run the complete release gate**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/verify-art-history-release.mjs
```

Expected:

- all Node tests PASS;
- strict 180-work Units 1–6 validator PASS;
- private-media leak guard PASS;
- complete rendered browser matrix PASS.

- [ ] **Step 4: Write the exact coverage report**

Generate `docs/data-sources/u5-u6-open-media-coverage.md` from the final rights files. It must state exact counts in this format and list every unresolved key with its recorded reason:

```text
U5: 27 required views — N local open-license images, M unresolved views
U6: 23 required views — N local open-license images, M unresolved views
Total: 50 required views — N local open-license images, M unresolved views
```

The report also records total committed media bytes and confirms that every accepted asset is at most 1.5 MB with a long edge at most 2000 pixels.

- [ ] **Step 5: Start the local server and perform the user-preview gate**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3' \
  -m http.server 4173 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4173/art-history-map.html
http://127.0.0.1:4173/index.html
```

Confirm U5 and U6 visually match U1–U3, important content is not cropped, multi-view controls show the correct ordered view, and unresolved states remain honest.

- [ ] **Step 6: Commit final evidence or fixes**

```bash
git add docs/data-sources/u5-u6-open-media-coverage.md \
  scripts/verify-art-history-release.mjs \
  scripts/verify-art-history-private-leaks.mjs
git commit -m "docs: report U5 U6 open media coverage"
```

If the scripts did not need changes, omit them from `git add`. Do not push until the user has reviewed the local preview and explicitly approves the push.

---

## Final Acceptance Checklist

- [ ] All 27 U5 and 23 U6 required views were independently audited.
- [ ] Every displayed image is the exact AP work and exact named required view.
- [ ] Every displayed image is Public Domain, CC0, CC BY, or CC BY-SA.
- [ ] Every displayed U5/U6 image is a committed local asset, not a remote hotlink.
- [ ] Every unresolved view has no image request and retains exact identity/source evidence.
- [ ] No similar object, alternate performance, contextual analogue, or College Board extraction is used.
- [ ] Every local asset is at most 1.5 MB and at most 2000 pixels on its long edge.
- [ ] U5/U6 image credits and ledgers contain source, creator, license, access date, identity note, and derivative note.
- [ ] U1–U4, `world-map.html`, U5/U6 study content, layout, filters, comparisons, and timeline remain unchanged.
- [ ] All Node, optimizer, strict-validator, leak-guard, and rendered-browser checks pass.
- [ ] The coverage report gives exact local-image and unresolved counts without counting unresolved views as completed images.
- [ ] The local preview is approved before GitHub push.
