# AP Art History U3 Early Europe and Colonial Americas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the complete AP Art History Unit 3 dataset, AP #48-98, with 51 works, 103 audited required views, eight map regions, five broad tradition filters, full study details, and Units 1-3 homepage integration.

**Architecture:** Preserve the current zero-build HTML application and its existing U1/U2 records. Add a machine-readable U3 manifest and canonical/source fixtures, extend the strict validator to AP #1-98, then project the reviewed U3 records and credits into the existing embedded artwork data. Reuse the current hierarchy, responsive marker engine, image-view switcher, detail tabs, comparison navigation, and release verifier.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js test runner, JSDOM, Playwright browser verification, JSON fixtures, Markdown source ledgers.

---

## File Structure

### New files

- `data/ap-art-history-unit-3-manifest.json` — official AP #48-98 ids, titles, region ids, creation-context sites, and ordered required view ids.
- `docs/data-sources/u3-source-ledger.md` — one audited row per media view, exactly 103 rows.
- `tests/fixtures/u3-canonical.json` — complete reviewed U3 artwork and image-credit projection.
- `tests/fixtures/u3-browser.json` — minimal immutable browser traversal projection derived from the canonical fixture.

### Modified files

- `art-history-map.html:6-184` — Units 1-3 copy and accessible map labels.
- `art-history-map.html:392-493` — append 51 U3 artwork records and corresponding image credits.
- `art-history-map.html:497-556` — activate Unit 3, add detailed traditions, broad filter configuration, and eight regions.
- `art-history-map.html:559-625` — add reviewed creation-context site coordinates.
- `art-history-map.html:627-667` — keep U3 broad and precise tradition text searchable.
- `art-history-map.html:1733-1850` — ensure the existing view switcher supports up to six required views without special-case code.
- `index.html:722` — change the Art caption to 98 works and Units 1-3.
- `scripts/validate-art-history-data.mjs:1-406` — load the U3 manifest and enforce the exact AP #1-98, region, provenance, and required-view contracts.
- `scripts/verify-art-history-browser.mjs:1-1268` — load the U3 browser fixture and traverse all 51 works and 103 views in standalone and embedded modes.
- `scripts/verify-art-history-release.mjs:1-24` — rename the strict stage to the 98-work Units 1-3 validator.
- `docs/art-history-sources.md` — document the U3 CED, APAH notes, Smarthistory volume, and source ledger.
- `tests/art-history-data.test.mjs` — exact U3 manifest, counts, schema, and validator failures.
- `tests/art-history-details.test.mjs` — exact U3 record/credit projection, multi-view behavior, search, and comparison.
- `tests/art-history-preservation.test.mjs` — freeze U1/U2 while validating the U3 ledger.
- `tests/art-history-ui-numbering.test.mjs` — Unit 3 configuration, eight-region hierarchy, broad filters, and collision behavior.
- `tests/art-history-browser-verifier.test.mjs` — prove complete U3 browser traversal and negative controls.
- `tests/homepage-art-integration.test.mjs` — Units 1-3 caption and embedded integration.

### Protected files

- `world-map.html`
- `tests/fixtures/u1-canonical.json`
- `tests/fixtures/u1-browser.json`
- All checked-in U2 canonical/preservation fixtures

---

## Required Runtime

Use the bundled Node runtime for every command:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
```

At execution time, first invoke `superpowers:using-git-worktrees` and create an isolated worktree from the current `feature/ap-art-history-map` branch. Name the branch `feature/ap-art-history-u3`.

---

### Task 1: Freeze the Official U3 Manifest and Required Views

**Files:**
- Create: `data/ap-art-history-unit-3-manifest.json`
- Modify: `tests/art-history-data.test.mjs`
- Reference: `docs/superpowers/specs/2026-07-28-u3-early-europe-colonial-americas-design.md`

- [ ] **Step 1: Write the failing manifest test**

Add constants and a test that require 51 exact entries and 103 total views:

```js
const U3_MANIFEST_PATH = new URL(
  '../data/ap-art-history-unit-3-manifest.json',
  import.meta.url,
);

test('checked-in U3 manifest matches AP 48-98 and 103 required views', async () => {
  const manifest = JSON.parse(await readFile(U3_MANIFEST_PATH, 'utf8'));
  const entries = Object.entries(manifest)
    .sort(([a], [b]) => Number(a) - Number(b));

  assert.deepEqual(
    entries.map(([apNumber]) => Number(apNumber)),
    Array.from({ length: 51 }, (_, index) => index + 48),
  );
  assert.deepEqual(
    entries.map(([apNumber, work]) => (
      `${apNumber}|${work.id}|${work.titleEn}|${work.region}|${work.requiredViewIds.length}`
    )),
    EXPECTED_U3_MANIFEST,
  );
  assert.equal(
    entries.reduce((sum, [, work]) => sum + work.requiredViewIds.length, 0),
    103,
  );
});
```

Define `EXPECTED_U3_MANIFEST` from Appendix A exactly.

- [ ] **Step 2: Run the test and confirm the missing file failure**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-data.test.mjs
```

Expected: FAIL with `ENOENT` for `data/ap-art-history-unit-3-manifest.json`.

- [ ] **Step 3: Create the complete manifest**

Use this exact object shape for all 51 entries:

```json
{
  "48": {
    "id": "ap48-catacomb-priscilla",
    "titleEn": "Catacomb of Priscilla",
    "region": "italyVatican",
    "siteName": "Rome, Italy",
    "requiredViewIds": [
      "greek-chapel",
      "orant-fresco",
      "good-shepherd-fresco"
    ]
  }
}
```

Populate every entry from Appendix A. For multi-view works, use Appendix B's ordered ids. Every single-view work uses `["primary"]`.

- [ ] **Step 4: Run the manifest test**

Run the Task 1 test command.

Expected: the new manifest test passes; existing tests may still fail because the live dataset has not yet imported U3.

- [ ] **Step 5: Commit**

```bash
git add data/ap-art-history-unit-3-manifest.json tests/art-history-data.test.mjs
git commit -m "test: define official AP Art History Unit 3"
```

---

### Task 2: Build the U3 Source Ledger and Canonical Fixture

**Files:**
- Create: `docs/data-sources/u3-source-ledger.md`
- Create: `tests/fixtures/u3-canonical.json`
- Modify: `docs/art-history-sources.md`
- Modify: `tests/art-history-preservation.test.mjs`

- [ ] **Step 1: Write the failing source-ledger contract**

Add:

```js
const U3_CANONICAL_PATH = new URL('./fixtures/u3-canonical.json', import.meta.url);
const U3_SOURCE_LEDGER_PATH = new URL(
  '../docs/data-sources/u3-source-ledger.md',
  import.meta.url,
);

test('U3 source ledger matches 51 canonical works and 103 media views', async () => {
  const [fixture, ledger] = await Promise.all([
    readFile(U3_CANONICAL_PATH, 'utf8').then(JSON.parse),
    readFile(U3_SOURCE_LEDGER_PATH, 'utf8'),
  ]);

  assert.equal(fixture.artworks.length, 51);
  assert.equal(
    fixture.artworks.reduce(
      (sum, work) => sum + (work.images?.length ?? 1),
      0,
    ),
    103,
  );

  const rows = parseSourceLedger(ledger);
  assert.equal(rows.length, 103);
  assert.deepEqual(
    rows.map(({ artworkId, viewId, imageUrl, sourceUrl }) => ({
      artworkId,
      viewId,
      imageUrl,
      sourceUrl,
    })),
    projectCanonicalMedia(fixture),
  );
});
```

Extend the existing strict ledger parser rather than adding a permissive second parser. It must reject missing cells, extra cells, duplicate `artworkId + viewId`, non-HTTPS URLs, and mismatched image/source identities.

- [ ] **Step 2: Run the test and confirm missing fixtures**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-preservation.test.mjs
```

Expected: FAIL because the U3 ledger and canonical fixture do not exist.

- [ ] **Step 3: Audit and write the 103-row ledger**

Use one Markdown row per view with this exact header:

```markdown
| AP # | Artwork id | View id | View label | Image | Source page | Creator/institution | License/rights |
| ---: | --- | --- | --- | --- | --- | --- | --- |
```

The first data row is AP 48 `ap48-catacomb-priscilla` / `greek-chapel`.
Write the audited direct HTTPS image URL, its matching HTTPS source page,
the credited creator or institution, and the verified license or rights
statement into that row. Apply the same rule to every subsequent Appendix B
view in AP-number order.

Source priority is:

1. College Board required-view identity
2. Owning church, monument, archive, library, or museum
3. Wikimedia Commons file page with a verified identity and rights trail

Do not accept a row until the image visibly matches the required view in Appendix B.

- [ ] **Step 4: Write all 51 canonical records**

Use the current artwork schema for every record and enforce it with this
fixture-local assertion before importing:

```js
function assertCanonicalU3Work(work) {
  assert.equal(work.unit, 3);
  assert.ok(Number.isInteger(work.apNumber));
  assert.ok(work.apNumber >= 48 && work.apNumber <= 98);

  for (const key of [
    'id', 'region', 'culture', 'traditionGroup', 'period',
    'titleEn', 'titleZh', 'artistCulture', 'siteName', 'date',
    'medium', 'workType', 'function', 'form', 'content', 'context',
  ]) {
    assert.equal(typeof work[key], 'string', `${work.id}: ${key}`);
    assert.ok(work[key].trim().length > 0, `${work.id}: ${key}`);
  }

  assert.ok(Number.isFinite(work.coordinates?.x));
  assert.ok(Number.isFinite(work.coordinates?.y));
  assert.ok(work.recognitionAnchors.length >= 2);
  assert.ok(work.comparisonIds.length >= 1);
  assert.ok(work.keywords.length >= 3);
  assert.equal(work.images.length, EXPECTED_U3_VIEW_COUNTS[work.apNumber]);

  for (const image of work.images) {
    for (const key of [
      'id', 'label', 'imageUrl', 'imageAlt',
      'imageSourceName', 'imageSourceUrl',
    ]) {
      assert.equal(typeof image[key], 'string', `${work.id}: image ${key}`);
      assert.ok(image[key].trim().length > 0, `${work.id}: image ${key}`);
    }
    assert.match(image.imageUrl, /^https:\/\//);
    assert.match(image.imageSourceUrl, /^https:\/\//);
  }
}
```

Write source-grounded Chinese study copy for `function`, `form`, `content`,
`context`, and `recognitionAnchors`; write audited media metadata for each
required image. Reject empty strings and any sentinel text that indicates an
unfinished value.

The fixture top level has exactly two keys: `artworks`, containing the 51
canonical records, and `credits`, keyed by artwork id.

Credits use one object per single-view work and an ordered array per multi-view work. Each credit contains `creatorOrInstitution`, `licenseName`, and `licenseUrl`.

- [ ] **Step 5: Document U3 sources**

Add a U3 section to `docs/art-history-sources.md` naming:

- College Board AP Art History Course and Exam Description, Unit 3 and image set
- `APAH notes.pdf`
- `Smarthistory guide to AP Art History, volume two: 48-98`
- `docs/data-sources/u3-source-ledger.md`

- [ ] **Step 6: Run the ledger test**

Run the Task 2 test command.

Expected: PASS with exactly 51 works and 103 media rows.

- [ ] **Step 7: Commit**

```bash
git add docs/art-history-sources.md \
  docs/data-sources/u3-source-ledger.md \
  tests/fixtures/u3-canonical.json \
  tests/art-history-preservation.test.mjs
git commit -m "docs: audit AP Art History Unit 3 sources"
```

---

### Task 3: Extend Strict Validation to AP #1-98

**Files:**
- Modify: `scripts/validate-art-history-data.mjs`
- Modify: `tests/art-history-data.test.mjs`

- [ ] **Step 1: Write the failing validator tests**

Add tests for the complete range and U3-specific failures:

```js
test('loads exactly AP 1-98 in official order', async () => {
  const { artworks } = await loadLiveArtData();
  assert.equal(artworks.length, 98);
  assert.deepEqual(
    artworks.map(({ apNumber }) => apNumber),
    Array.from({ length: 98 }, (_, index) => index + 1),
  );
});

test('validator requires exact U3 regions and required views', async () => {
  const fixture = makeCompleteUnits123Fixture();
  const missingView = structuredClone(fixture);
  missingView.artworks.find(({ apNumber }) => apNumber === 60).images.pop();

  assert.throws(
    () => validateArtworks(missingView.artworks, fixture.manifests),
    /AP 60|required views|6/i,
  );

  const wrongRegion = structuredClone(fixture);
  wrongRegion.artworks.find(({ apNumber }) => apNumber === 98).region = 'italyVatican';

  assert.throws(
    () => validateArtworks(wrongRegion.artworks, fixture.manifests),
    /AP 98|British Isles|region/i,
  );
});
```

Also add cases for:

- Missing AP 48
- Extra AP 99
- Duplicate AP number
- U3 manifest key outside 48-98
- Unknown region
- Broad provenance without `provenanceQualifier`
- Duplicate view id
- View order different from the manifest
- Missing credit array item

- [ ] **Step 2: Run and verify failure**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-data.test.mjs
```

Expected: FAIL because the validator only loads U1/U2 and expects 47 works.

- [ ] **Step 3: Load the U3 manifest**

Change:

```js
const MANIFEST_URLS = Object.freeze({
  1: new URL('../data/ap-art-history-unit-1-manifest.json', import.meta.url),
  2: new URL('../data/ap-art-history-unit-2-manifest.json', import.meta.url),
  3: new URL('../data/ap-art-history-unit-3-manifest.json', import.meta.url),
});
```

Extend the unit contract:

```js
const UNIT_CONTRACTS = Object.freeze({
  1: Object.freeze({ start: 1, end: 11, count: 11 }),
  2: Object.freeze({ start: 12, end: 47, count: 36 }),
  3: Object.freeze({ start: 48, end: 98, count: 51 }),
});

const U3_REGION_COUNTS = Object.freeze({
  italyVatican: 18,
  france: 5,
  iberianPeninsula: 5,
  britishIsles: 3,
  lowCountries: 7,
  centralEurope: 4,
  easternMediterranean: 4,
  colonialAmericas: 5,
});
```

- [ ] **Step 4: Validate exact U3 manifest metadata**

For every AP #48-98, compare live `id`, `titleEn`, `region`, `siteName`, and ordered media ids with the manifest:

```js
const media = normalizeArtworkMedia(artwork);
const expected = manifests[3][artwork.apNumber];

assertEqual(artwork.id, expected.id, `${label} id`);
assertEqual(artwork.titleEn, expected.titleEn, `${label} title`);
assertEqual(artwork.region, expected.region, `${label} region`);
assertEqual(artwork.siteName, expected.siteName, `${label} site`);
validateExactArray(
  media.map(({ id }) => id),
  expected.requiredViewIds,
  `${label} required views`,
);
```

Keep U1/U2 manifest behavior unchanged.

- [ ] **Step 5: Change the global exact key contract**

Require exact AP numbers 1 through 98 and exact credit keys for all 98 records. Do not derive success from the live array length alone.

- [ ] **Step 6: Run validator tests**

Run the Task 3 test command.

Expected: focused validator tests pass once the test fixture is complete; the live 98-work test remains red until Task 4.

- [ ] **Step 7: Commit**

```bash
git add scripts/validate-art-history-data.mjs tests/art-history-data.test.mjs
git commit -m "test: enforce complete Units 1-3 validation"
```

---

### Task 4: Import All 51 U3 Records and Credits

**Files:**
- Modify: `art-history-map.html:392-493`
- Modify: `tests/art-history-data.test.mjs`
- Modify: `tests/art-history-details.test.mjs`

- [ ] **Step 1: Write the failing canonical-projection test**

```js
test('live U3 records and credits match the reviewed canonical fixture', async () => {
  const [{ artworks, credits }, fixture] = await Promise.all([
    loadLiveArtData(),
    readFile(U3_CANONICAL_PATH, 'utf8').then(JSON.parse),
  ]);

  const liveU3 = artworks.filter(({ unit }) => unit === 3);
  assert.deepEqual(liveU3, fixture.artworks);
  assert.deepEqual(
    Object.fromEntries(liveU3.map(({ id }) => [id, credits[id]])),
    fixture.credits,
  );
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-data.test.mjs tests/art-history-details.test.mjs
```

Expected: FAIL because the live HTML contains only 47 works.

- [ ] **Step 3: Append AP #48-65**

Copy the canonical records and credits for AP #48-65 into the two embedded JSON scripts. Preserve exact canonical order and field order.

- [ ] **Step 4: Run the canonical-projection test**

Expected: still FAIL, reporting that AP #66-98 are missing. Confirm the failure names the first missing canonical record.

- [ ] **Step 5: Append AP #66-81**

Copy the canonical records and credits for AP #66-81.

- [ ] **Step 6: Run the canonical-projection test**

Expected: still FAIL, reporting that AP #82-98 are missing.

- [ ] **Step 7: Append AP #82-98**

Copy the canonical records and credits for AP #82-98.

- [ ] **Step 8: Run focused data and detail tests**

Run the Task 4 test command.

Expected: PASS with 98 total works, 51 U3 works, and 103 U3 views.

- [ ] **Step 9: Run the strict CLI**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/validate-art-history-data.mjs
```

Expected:

```text
Validated 98 AP Art History works
```

- [ ] **Step 10: Commit**

```bash
git add art-history-map.html tests/art-history-data.test.mjs tests/art-history-details.test.mjs
git commit -m "feat: import AP Art History Unit 3"
```

---

### Task 5: Add U3 Regions, Broad Filters, Sites, and Search

**Files:**
- Modify: `art-history-map.html:497-667`
- Modify: `tests/art-history-ui-numbering.test.mjs`
- Modify: `tests/art-history-details.test.mjs`

- [ ] **Step 1: Write failing configuration tests**

```js
test('Unit 3 exposes eight exact regions and five visible tradition pills', () => {
  assert.deepEqual(
    UNIT_FILTER_CONFIG[3].cultureIds,
    [
      'lateAntiqueByzantine',
      'medievalIslamic',
      'renaissanceMannerism',
      'baroqueColonial',
    ],
  );
  assert.equal(1 + UNIT_FILTER_CONFIG[3].cultureIds.length, 5);

  assert.deepEqual(
    projectRegionCounts(ARTWORKS.filter(({ unit }) => unit === 3)),
    {
      italyVatican: 18,
      france: 5,
      iberianPeninsula: 5,
      britishIsles: 3,
      lowCountries: 7,
      centralEurope: 4,
      easternMediterranean: 4,
      colonialAmericas: 5,
    },
  );
});
```

Add a search test proving `Gothic`, `哥特式`, `New Spain`, and `新西班牙` find the correct precise records even though the visible pills are broad.

- [ ] **Step 2: Run and verify failure**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
```

Expected: FAIL because Unit 3 has no filter or region configuration.

- [ ] **Step 3: Add broad and precise tradition labels**

Add broad group labels:

```js
lateAntiqueByzantine: Object.freeze({
  labelEn: 'Late Antique & Byzantine',
  labelZh: '晚期古代与拜占庭',
}),
medievalIslamic: Object.freeze({
  labelEn: 'Medieval & Islamic',
  labelZh: '中世纪与伊斯兰',
}),
renaissanceMannerism: Object.freeze({
  labelEn: 'Renaissance & Mannerism',
  labelZh: '文艺复兴与矫饰主义',
}),
baroqueColonial: Object.freeze({
  labelEn: 'Baroque & Colonial',
  labelZh: '巴洛克与殖民艺术',
}),
```

Also add every precise tradition key used by the canonical records. Do not reuse a broad key as the precise record `culture`.

- [ ] **Step 4: Activate the Unit 3 filter row**

```js
3: Object.freeze({
  showCultureFilters: true,
  cultureIds: Object.freeze([
    'lateAntiqueByzantine',
    'medievalIslamic',
    'renaissanceMannerism',
    'baroqueColonial',
  ]),
}),
```

`All traditions` remains the shared generated reset control, so the rendered row has five pills total.

- [ ] **Step 5: Add the eight map regions**

```js
italyVatican: Object.freeze({ nameEn: 'Italy & Vatican', unitIds: Object.freeze([3]) }),
france: Object.freeze({ nameEn: 'France', unitIds: Object.freeze([3]) }),
iberianPeninsula: Object.freeze({ nameEn: 'Iberian Peninsula', unitIds: Object.freeze([3]) }),
britishIsles: Object.freeze({ nameEn: 'British Isles', unitIds: Object.freeze([3]) }),
lowCountries: Object.freeze({ nameEn: 'Low Countries', unitIds: Object.freeze([3]) }),
centralEurope: Object.freeze({ nameEn: 'Central Europe', unitIds: Object.freeze([3]) }),
easternMediterranean: Object.freeze({ nameEn: 'Eastern Mediterranean', unitIds: Object.freeze([3]) }),
colonialAmericas: Object.freeze({ nameEn: 'Colonial Americas', unitIds: Object.freeze([3]) }),
```

- [ ] **Step 6: Add exact creation-context site coordinates**

Add every canonical `siteName` to `SITE_WORLD_COORDINATES`. For broad provenance, retain `provenanceQualifier` in the record and use the reviewed regional anchor.

Do not add current museum cities unless they are also the creation context.

- [ ] **Step 7: Extend filtering without changing existing controls**

When a broad pill is active, match `work.traditionGroup`; keep precise `work.culture`, labels, region, site, title, medium, type, and keywords in the bilingual search string.

```js
if (
  filters.culture
  && filters.culture !== 'all'
  && work.traditionGroup !== filters.culture
) return false;
```

Preserve the existing U2 behavior by using `work.traditionGroup ?? work.culture`.

- [ ] **Step 8: Run focused tests**

Run the Task 5 test command.

Expected: PASS for U1, U2, and U3 filters, exact region counts, and bilingual search.

- [ ] **Step 9: Commit**

```bash
git add art-history-map.html tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
git commit -m "feat: add Unit 3 map hierarchy and filters"
```

---

### Task 6: Generalize the Required-View UI to Six Views

**Files:**
- Modify: `art-history-map.html:85-87`
- Verify: `art-history-map.html:1733-1901`
- Modify: `tests/art-history-details.test.mjs`
- Modify: `tests/art-history-ui-numbering.test.mjs`

- [ ] **Step 1: Write failing six-view interaction tests**

Use Chartres Cathedral as the maximum-view fixture:

```js
test('Chartres six-view switcher synchronizes media and attribution', async () => {
  const html = await loadHtml();
  const artworks = parseJsonBlock(html, 'artwork-data');
  const credits = parseJsonBlock(html, 'image-credit-data');
  const harness = createDetailHarness(html, artworks, credits);
  const chartres = artworks.find(({ apNumber }) => apNumber === 60);
  const summary = harness.renderArtworkDetails(chartres, { works:[chartres] });
  const imageButton = summary.querySelector('.artwork-image-button');
  const creditHost = summary.querySelector('.image-credit-host');
  const buttons = summary.querySelector('.image-view-switcher').querySelectorAll('button');

  assert.equal(buttons.length, 6);
  assert.deepEqual(
    buttons.map((button) => button.getAttribute('aria-pressed')),
    ['true', 'false', 'false', 'false', 'false', 'false'],
  );

  buttons[5].click();
  const active = chartres.images[5];
  assert.equal(imageButton.children[0].src, active.imageUrl);
  assert.equal(imageButton.children[0].alt, active.imageAlt);
  assert.equal(buttons[5].getAttribute('aria-pressed'), 'true');
  const creditLinks = creditHost.querySelectorAll('a');
  assert.equal(creditLinks[1].href, active.imageSourceUrl);
  assert.equal(creditLinks[1].textContent, active.imageSourceName);
});
```

Add a style-contract test proving `.image-view-switcher` uses `flex-wrap:
wrap`, its buttons preserve the current desktop sizing, and the existing
compact-width rule retains the 44px minimum hit target.

- [ ] **Step 2: Run and verify failure**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-details.test.mjs tests/art-history-ui-numbering.test.mjs
```

Expected: FAIL because the U3 fixture and wrapping style are not present.

- [ ] **Step 3: Verify the normalized media renderer at six views**

Keep the current render-local `activeMediaIndex`; do not couple image-view
selection to `state.selectedSiteIndex`, which selects an artwork at a shared
map site. The existing structure must remain data-driven:

```js
let activeMediaIndex = 0;
const mediaItems = getArtworkImages(work);
viewButtons = mediaItems.map((media, mediaIndex) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = media.label;
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => renderActiveArtworkImage(mediaIndex));
  imageViewSwitcher.append(button);
  return button;
});
renderActiveArtworkImage(0);
```

Do not special-case Stonehenge, Chartres, or any AP number. If the current
renderer passes the six-view interaction test unchanged, modify only the CSS
and tests in this task.

- [ ] **Step 4: Add wrapping layout**

Use the existing typography and button tokens:

```css
.image-view-switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.image-view-switcher button {
  min-height: 30px;
}

@media (max-width: 666px) {
  .image-view-switcher button {
    min-height: 44px;
  }
}
```

- [ ] **Step 5: Run focused tests**

Run the Task 6 test command.

Expected: PASS for Stonehenge, single-view U2 works, and six-view Chartres.

- [ ] **Step 6: Commit**

```bash
git add art-history-map.html tests/art-history-details.test.mjs tests/art-history-ui-numbering.test.mjs
git commit -m "feat: support Unit 3 required image views"
```

---

### Task 7: Update Units 1-3 Copy and Homepage Integration

**Files:**
- Modify: `art-history-map.html:6-184`
- Modify: `index.html:722`
- Modify: `tests/homepage-art-integration.test.mjs`
- Modify: `tests/art-history-browser-verifier.test.mjs`
- Modify: `scripts/verify-art-history-release.mjs`

- [ ] **Step 1: Write failing copy tests**

```js
test('homepage and Art map describe the complete Units 1-3 scope', async () => {
  const [homepage, artMap, release] = await Promise.all([
    readFile(HOMEPAGE_PATH, 'utf8'),
    readFile(ART_MAP_PATH, 'utf8'),
    readFile(RELEASE_VERIFIER_PATH, 'utf8'),
  ]);

  assert.match(homepage, /98 AP works · Units 1-3 · filter, compare and study/);
  assert.match(artMap, /AP 艺术史互动地图 · Units 1-3/);
  assert.match(artMap, /当前显示 98 件作品/);
  assert.match(release, /strict 98-work Units 1-3 validator/);
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/homepage-art-integration.test.mjs \
  tests/art-history-browser-verifier.test.mjs
```

Expected: FAIL on the old 47-work Units 1-2 copy.

- [ ] **Step 3: Update copy and accessible labels**

Change the document title, subtitle, map region label, SVG label, and homepage caption to Units 1-3 and 98 works. Do not change iframe dimensions or World History copy.

- [ ] **Step 4: Rename the release stage**

```js
[
  'strict 98-work Units 1-3 validator',
  ['scripts/validate-art-history-data.mjs'],
],
```

- [ ] **Step 5: Run focused tests**

Run the Task 7 test command.

Expected: PASS with unchanged World History assertions.

- [ ] **Step 6: Commit**

```bash
git add art-history-map.html index.html \
  scripts/verify-art-history-release.mjs \
  tests/homepage-art-integration.test.mjs \
  tests/art-history-browser-verifier.test.mjs
git commit -m "feat: integrate Art History Units 1-3"
```

---

### Task 8: Preserve U1/U2 and Verify Cross-Unit Comparison

**Files:**
- Modify: `tests/art-history-preservation.test.mjs`
- Modify: `tests/art-history-details.test.mjs`

- [ ] **Step 1: Write preservation and comparison tests**

```js
test('U1 and U2 stay field-for-field frozen after U3 import', async () => {
  const { artworks, credits } = await loadLiveArtData();
  await assertCanonicalUnit(1, artworks, credits, U1_CANONICAL_PATH);
  await assertCanonicalUnit2Fixtures(artworks, credits);
});

test('U3 comparison clears incompatible filters and focuses a U2 target', () => {
  state.unit = '3';
  state.culture = 'baroqueColonial';
  state.selectedId = 'ap89-ecstasy-saint-teresa';

  selectComparisonTarget('ap46-pantheon');

  assert.equal(state.unit, '2');
  assert.equal(state.culture, 'all');
  assert.equal(state.selectedId, 'ap46-pantheon');
  assert.equal(document.activeElement?.id, 'detailTitle');
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-preservation.test.mjs \
  tests/art-history-details.test.mjs
```

Expected: comparison test fails until U3 target ids and Unit transitions are live; preservation must already pass.

- [ ] **Step 3: Add or correct comparison ids**

Ensure all 51 U3 records have at least one resolvable target. Include real cross-Unit links:

- AP 49 Santa Sabina -> AP 46 Pantheon
- AP 52 Hagia Sophia -> AP 46 Pantheon
- AP 58 Church of Sainte-Foy -> AP 23 Tutankhamun's tomb, innermost coffin
- AP 81 Codex Mendoza -> AP 19 Code of Hammurabi
- AP 89 Ecstasy of Saint Teresa -> AP 46 Pantheon

Comparison notes must identify the formal, functional, material, political, or religious basis and avoid unsupported equivalence.

- [ ] **Step 4: Run focused tests**

Run the Task 8 test command.

Expected: PASS with U1/U2 unchanged.

- [ ] **Step 5: Commit**

```bash
git add art-history-map.html tests/art-history-preservation.test.mjs tests/art-history-details.test.mjs
git commit -m "test: preserve Units 1-2 across Unit 3"
```

---

### Task 9: Add the Complete U3 Browser Fixture and Traversal

**Files:**
- Create: `tests/fixtures/u3-browser.json`
- Modify: `tests/art-history-browser-verifier.test.mjs`
- Modify: `scripts/verify-art-history-browser.mjs`

- [ ] **Step 1: Write the failing browser-fixture projection test**

```js
test('U3 browser fixture covers AP 48-98 and 103 audited views', async () => {
  const [fixture, canonical] = await Promise.all([
    readFile(U3_BROWSER_FIXTURE, 'utf8').then(JSON.parse),
    readFile(U3_CANONICAL_FIXTURE, 'utf8').then(JSON.parse),
  ]);

  assert.deepEqual(fixture, projectBrowserFixture(canonical));
  assert.deepEqual(
    fixture.map(({ apNumber }) => apNumber),
    Array.from({ length: 51 }, (_, index) => index + 48),
  );
  assert.equal(
    fixture.reduce((sum, work) => sum + work.images.length, 0),
    103,
  );
});
```

- [ ] **Step 2: Run and verify missing fixture**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-browser-verifier.test.mjs
```

Expected: FAIL because `tests/fixtures/u3-browser.json` is missing.

- [ ] **Step 3: Generate and review the immutable projection**

Project only:

```js
{
  id,
  apNumber,
  titleEn,
  titleZh,
  unit,
  region,
  siteName,
  images: images.map(({ id, label, imageUrl, imageAlt, imageSourceUrl }) => ({
    id,
    label,
    imageUrl,
    imageAlt,
    imageSourceUrl,
  })),
}
```

Write the resulting 51-entry JSON to `tests/fixtures/u3-browser.json`. Review that it contains 103 distinct view rows and no fields absent from the canonical fixture.

- [ ] **Step 4: Add failing traversal-source assertions**

Require:

```js
assert.match(source, /const U3_WORKS = Object\.freeze\(JSON\.parse\(/);
assert.match(source, /async function verifyU3Works\(/);
assert.match(source, /for \(const work of U3_WORKS\)/);
assert.match(source, /verifyU3Standalone/);
assert.match(source, /verifyU3Embedded/);
assert.match(source, /U3Early Europe and Colonial Americas · 51 pieces/);
```

Add negative-control tests that inject:

- A wrong required image URL
- A missing Chartres view
- A duplicate request
- A console warning
- A broken focus-restoration state

Each mutation must make the verifier fail.

- [ ] **Step 5: Implement `verifyU3Works`**

For every fixture work:

1. Reset Unit and search through visible UI controls.
2. Select Unit 3.
3. Search the exact English title.
4. Traverse Unit -> region -> site -> AP pin.
5. Assert English title, Chinese subtitle, AP number, metadata, and selected state.
6. For every view, click its unique button and assert image URL, alt, source link, pressed state, modal content, and focus restoration.
7. Assert the exact expected image request count.

- [ ] **Step 6: Add U3 study-tab and cross-Unit traversal**

Exercise all four tabs with AP 52 or AP 60, then navigate from AP 89 to AP 46 and verify Unit/filter reset and title focus. Run this in standalone and embedded modes.

- [ ] **Step 7: Add U3 responsive hierarchy checks**

Verify the eight-region layout and site expansion at:

- 375x812
- 390x844
- 667x375 embedded landscape
- 665px workspace boundary
- 1365x768 desktop

Assert no marker overlap, no horizontal overflow, and no clipped detail title or view buttons.

- [ ] **Step 8: Run browser-verifier unit tests**

Run the Task 9 test command.

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add tests/fixtures/u3-browser.json \
  tests/art-history-browser-verifier.test.mjs \
  scripts/verify-art-history-browser.mjs
git commit -m "test: verify complete Art History Unit 3"
```

---

### Task 10: Run the Full Release Gate and Final Review

**Files:**
- Modify only if a verified defect is found.

- [ ] **Step 1: Run all Node tests**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/*.test.mjs
```

Expected: all tests pass; no skipped or todo tests.

- [ ] **Step 2: Run the strict validator**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/validate-art-history-data.mjs
```

Expected:

```text
Validated 98 AP Art History works
```

- [ ] **Step 3: Run the real browser matrix**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/verify-art-history-browser.mjs
```

Expected: exit code 0 with standalone, embedded, U1, U2, U3, and responsive checks complete.

- [ ] **Step 4: Run the composed release verifier**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/verify-art-history-release.mjs
```

Expected:

```text
Release verification passed.
```

- [ ] **Step 5: Run static integrity checks**

```bash
git diff --check
git status --short
git diff --exit-code feature/ap-art-history-map...HEAD -- world-map.html
```

Expected: no whitespace errors, only intended U3 files modified, and no `world-map.html` diff.

- [ ] **Step 6: Request two-stage code review**

Use `superpowers:requesting-code-review`:

1. Spec-compliance review against the approved U3 design.
2. Code-quality and regression review after spec compliance passes.

Fix review findings with failing tests first, rerun the release gate, and commit each focused correction.

- [ ] **Step 7: Commit final verified corrections**

```bash
git add art-history-map.html index.html data docs scripts tests
git commit -m "fix: complete AP Art History Unit 3 release"
```

Skip this commit if the worktree is already clean after review.

---

### Task 11: Sync the Verified Delivery to Desktop

**Files:**
- Source: verified U3 worktree
- Destination: `/Users/tiffanyxu/Desktop/APWH/考前冲刺_地区专题_试做版`

- [ ] **Step 1: Compute the exact changed-file list**

```bash
git diff --name-only feature/ap-art-history-map...HEAD
```

Expected: only the approved U3 data, docs, HTML, scripts, tests, and fixtures.

- [ ] **Step 2: Create a recoverable Desktop backup**

Request filesystem approval before writing outside the repository workspace.
Create a timestamped directory inside:

```text
/Users/tiffanyxu/Desktop/APWH/考前冲刺_地区专题_试做版/.codex-backups/
```

Copy only destination files that will be replaced. Do not delete unrelated Desktop files.

- [ ] **Step 3: Copy the verified changed files**

Preserve repository-relative paths. Do not copy `.git`, `.worktrees`, `.superpowers`, or temporary files.

- [ ] **Step 4: Compare SHA-256 hashes**

Require every copied file to match the verified worktree source exactly. Expected mismatch count: `0`.

- [ ] **Step 5: Run the release verifier from Desktop**

Run:

```bash
cd '/Users/tiffanyxu/Desktop/APWH/考前冲刺_地区专题_试做版'
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/verify-art-history-release.mjs
```

Expected: the same 98-work release pass from the delivery directory.

- [ ] **Step 6: Open the final local preview**

Serve the Desktop directory over `127.0.0.1` and verify:

- `U1 · Global Prehistory · 11 pieces`
- `U2 · Ancient Mediterranean · 36 pieces`
- `U3 · Early Europe and Colonial Americas · 51 pieces`
- `98 AP works · Units 1-3 · filter, compare and study`

- [ ] **Step 7: Ask for explicit GitHub approval**

After the user reviews the preview, use `superpowers:finishing-a-development-branch` and present the four branch options. Push or create a pull request only after the user explicitly selects that action.

---

## Appendix A: Exact U3 Manifest Summary

Each row is `AP|id|title|region|view count`.

```text
48|ap48-catacomb-priscilla|Catacomb of Priscilla|italyVatican|3
49|ap49-santa-sabina|Santa Sabina|italyVatican|3
50|ap50-vienna-genesis|Rebecca and Eliezer at the Well and Jacob Wrestling the Angel, from the Vienna Genesis|easternMediterranean|2
51|ap51-san-vitale|San Vitale|italyVatican|5
52|ap52-hagia-sophia|Hagia Sophia|easternMediterranean|3
53|ap53-merovingian-fibulae|Merovingian looped fibulae|france|1
54|ap54-virgin-theotokos-saints|Virgin (Theotokos) and Child between Saints Theodore and George|easternMediterranean|1
55|ap55-lindisfarne-gospels|Lindisfarne Gospels: St. Matthew, cross-carpet page; St. Luke portrait page; St. Luke incipit page|britishIsles|3
56|ap56-great-mosque-cordoba|Great Mosque|iberianPeninsula|5
57|ap57-pyxis-al-mughira|Pyxis of al-Mughira|iberianPeninsula|1
58|ap58-church-sainte-foy|Church of Sainte-Foy|france|4
59|ap59-bayeux-tapestry|Bayeux Tapestry|britishIsles|2
60|ap60-chartres-cathedral|Chartres Cathedral|france|6
61|ap61-bibles-moralisees|Dedication Page with Blanche of Castile and King Louis IX of France, Scenes from the Apocalypse from Bibles moralisées|france|2
62|ap62-rottgen-pieta|Röttgen Pietà|centralEurope|1
63|ap63-arena-scrovegni-chapel|Arena (Scrovegni) Chapel, including Lamentation|italyVatican|3
64|ap64-golden-haggadah|Golden Haggadah (The Plagues of Egypt, Scenes of Liberation, and Preparation for Passover)|iberianPeninsula|3
65|ap65-alhambra|Alhambra|iberianPeninsula|4
66|ap66-merode-altarpiece|Annunciation Triptych (Merode Altarpiece)|lowCountries|1
67|ap67-pazzi-chapel|Pazzi Chapel|italyVatican|2
68|ap68-arnolfini-portrait|The Arnolfini Portrait|lowCountries|1
69|ap69-donatello-david|David|italyVatican|1
70|ap70-palazzo-rucellai|Palazzo Rucellai|italyVatican|1
71|ap71-madonna-child-two-angels|Madonna and Child with Two Angels|italyVatican|1
72|ap72-birth-venus|Birth of Venus|italyVatican|1
73|ap73-last-supper|Last Supper|italyVatican|1
74|ap74-adam-eve-durer|Adam and Eve|centralEurope|1
75|ap75-sistine-chapel-frescoes|Sistine Chapel ceiling and altar wall frescoes|italyVatican|4
76|ap76-school-athens|School of Athens|italyVatican|1
77|ap77-isenheim-altarpiece|Isenheim altarpiece|centralEurope|2
78|ap78-entombment-christ-pontormo|Entombment of Christ|italyVatican|1
79|ap79-allegory-law-grace|Allegory of Law and Grace|centralEurope|1
80|ap80-venus-urbino|Venus of Urbino|italyVatican|1
81|ap81-codex-mendoza-frontispiece|Frontispiece of the Codex Mendoza|colonialAmericas|1
82|ap82-il-gesu|Il Gesù, including Triumph of the Name of Jesus ceiling fresco|italyVatican|3
83|ap83-hunters-snow|Hunters in the Snow|lowCountries|1
84|ap84-mosque-selim-ii|Mosque of Selim II|easternMediterranean|3
85|ap85-calling-saint-matthew|Calling of Saint Matthew|italyVatican|1
86|ap86-henri-iv-marie-medici|Henri IV Receives the Portrait of Marie de’ Medici, from the Marie de’ Medici Cycle|lowCountries|1
87|ap87-self-portrait-saskia|Self-Portrait with Saskia|lowCountries|1
88|ap88-san-carlo-quattro-fontane|San Carlo alle Quattro Fontane|italyVatican|3
89|ap89-ecstasy-saint-teresa|Ecstasy of Saint Teresa|italyVatican|3
90|ap90-angel-arquebus|Angel with Arquebus, Asiel Timor Dei|colonialAmericas|1
91|ap91-las-meninas|Las Meninas|iberianPeninsula|1
92|ap92-woman-holding-balance|Woman Holding a Balance|lowCountries|1
93|ap93-palace-versailles|The Palace at Versailles|france|5
94|ap94-screen-siege-belgrade|Screen with the Siege of Belgrade and hunting scene|colonialAmericas|2
95|ap95-virgin-guadalupe|The Virgin of Guadalupe (Virgen de Guadalupe)|colonialAmericas|1
96|ap96-fruit-insects|Fruit and Insects|lowCountries|1
97|ap97-spaniard-indian-mestizo|Spaniard and Indian Produce a Mestizo|colonialAmericas|1
98|ap98-tete-a-tete|The Tête à Tête, from Marriage à la Mode|britishIsles|1
```

## Appendix B: Ordered Multi-View IDs

All unlisted works use `["primary"]`.

```js
{
  48: ['greek-chapel', 'orant-fresco', 'good-shepherd-fresco'],
  49: ['exterior', 'interior', 'plan'],
  50: ['rebecca-eliezer', 'jacob-wrestling-angel'],
  51: ['exterior', 'interior', 'justinian-panel', 'theodora-panel', 'plan'],
  52: ['exterior', 'interior', 'plan'],
  55: ['st-matthew-cross-carpet', 'st-luke-portrait', 'st-luke-incipit'],
  56: ['exterior', 'hypostyle-hall', 'mihrab-detail', 'double-tier-arches', 'plan'],
  58: ['exterior', 'last-judgment-tympanum', 'interior', 'reliquary'],
  59: ['narrative-overview', 'narrative-detail'],
  60: ['west-facade', 'nave', 'plan', 'royal-portal', 'rose-window', 'stained-glass'],
  61: ['dedication-page', 'apocalypse-scenes'],
  63: ['chapel-interior', 'lamentation', 'chapel-exterior'],
  64: ['plagues-egypt', 'scenes-liberation', 'preparation-passover'],
  65: ['exterior', 'court-lions', 'hall-sisters', 'plan'],
  67: ['exterior', 'interior'],
  75: ['ceiling-overview', 'delphic-sibyl', 'the-flood', 'last-judgment'],
  77: ['closed-state', 'open-state'],
  82: ['facade', 'nave', 'triumph-name-jesus'],
  84: ['exterior', 'interior', 'plan'],
  88: ['facade', 'interior', 'plan'],
  89: ['church-interior', 'cornaro-chapel', 'ecstasy-saint-teresa'],
  93: ['aerial-overview', 'facade', 'courtyard', 'hall-mirrors', 'gardens'],
  94: ['siege-belgrade-front', 'hunting-scene-reverse']
}
```
