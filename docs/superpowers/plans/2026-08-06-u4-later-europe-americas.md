# AP Art History U4 Later Europe and Americas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the complete AP Art History Unit 4 dataset, AP #99-152, with 54 bilingual works, audited required media views, nine creation-context regions, five visible movement filters, full study details, and Units 1-4 homepage integration.

**Architecture:** Preserve the zero-build HTML application and all 98 verified U1-U3 records. Freeze a machine-readable U4 manifest and per-view rights/source contracts first, then project one canonical fixture into the embedded artwork and credit JSON. Extend the current validator, hierarchy, filters, detail renderer, comparison navigation, and browser verifier without adding timeline behavior or changing `world-map.html`.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js test runner, JSDOM, Playwright browser verification, JSON manifests and fixtures, Markdown source ledger.

---

## File Structure

### New files

- `data/ap-art-history-unit-4-manifest.json` - AP #99-152 identity, region, creation site, qualifier, broad movement, and ordered required views.
- `data/ap-art-history-unit-4-rights.json` - one reviewed rights record per media view, keyed by `artworkId::viewId`.
- `docs/data-sources/u4-source-ledger.md` - one audited source row per media view.
- `tests/fixtures/u4-canonical.json` - complete U4 artwork and credit projection.
- `tests/fixtures/u4-browser.json` - immutable U4 browser traversal projection.
- `tests/art-history-u4-canonical.test.mjs` - U4 manifest, ledger, rights, fixture, and live-data contracts.

### Modified files

- `art-history-map.html:6-188` - Units 1-4 copy and accessible map labels.
- `art-history-map.html:396-600` - append U4 artwork records and image credits.
- `art-history-map.html:603-875` - add movement labels, U4 filters, regions, sites, and searchable fields.
- `art-history-map.html:1842-1885` - render `All movements` for U4.
- `art-history-map.html:2141-2420` - verify existing media, study-tab, credit, modal, and comparison behavior.
- `index.html:722` - update the Art caption to 152 works and Units 1-4.
- `scripts/validate-art-history-data.mjs` - enforce exact AP #1-152 and U4 contracts.
- `scripts/verify-art-history-browser.mjs` - traverse every U4 work and view.
- `scripts/verify-art-history-release.mjs` - rename the strict stage to Units 1-4.
- `docs/art-history-sources.md` - document U4 source authority and audit files.
- `tests/art-history-data.test.mjs` - global AP #1-152 and negative validator cases.
- `tests/art-history-details.test.mjs` - U4 bilingual details, media, search, and comparison.
- `tests/art-history-preservation.test.mjs` - freeze U1-U3 and check U4 source projection.
- `tests/art-history-ui-numbering.test.mjs` - U4 filters, nine regions, sites, pins, and collisions.
- `tests/art-history-browser-verifier.test.mjs` - U4 traversal and negative controls.
- `tests/homepage-art-integration.test.mjs` - Units 1-4 embedded integration.

### Protected files

- `world-map.html`
- All U1/U2 canonical, browser, and preservation fixtures
- `tests/fixtures/u3-canonical.json`
- `tests/fixtures/u3-browser.json`
- `data/ap-art-history-unit-3-manifest.json`
- `data/ap-art-history-unit-3-rights.json`

## Required Runtime and Isolation

Use:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
```

At execution time, invoke `superpowers:using-git-worktrees` and create `feature/ap-art-history-u4` from the commit containing the verified U3 delivery plus the approved U4 spec and plan. Do not implement on `feature/ap-art-history-u3`.

---

### Task 1: Freeze the Official U4 Manifest and Required Views

**Files:**
- Create: `data/ap-art-history-unit-4-manifest.json`
- Create: `tests/art-history-u4-canonical.test.mjs`
- Reference: `docs/superpowers/specs/2026-08-06-u4-later-europe-americas-design.md`

- [ ] **Step 1: Write the failing manifest contract**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const U4_MANIFEST_PATH = new URL('../data/ap-art-history-unit-4-manifest.json', import.meta.url);
const U4_AP_NUMBERS = Array.from({ length: 54 }, (_, index) => index + 99);
const U4_REGION_IDS = new Set([
  'france', 'britishIsles', 'southernEurope',
  'centralNorthernEurope', 'russiaSoviet', 'unitedStates',
  'mexicoCaribbean', 'pacific', 'transatlantic',
]);
const U4_MOVEMENT_GROUP_IDS = new Set([
  'enlightenmentRevolution',
  'realismIndustryPhotography',
  'postImpressionismEarlyModernism',
  'avantGardeArchitecturePostwar',
]);
const U4_MANIFEST_KEYS = [
  'id', 'titleEn', 'region', 'siteName', 'provenanceQualifier',
  'traditionGroup', 'requiredViewIds',
];

test('U4 manifest covers AP 99-152 with exact schema and titles', async () => {
  const manifest = JSON.parse(await readFile(U4_MANIFEST_PATH, 'utf8'));
  const entries = Object.entries(manifest).sort(([a], [b]) => Number(a) - Number(b));
  assert.deepEqual(entries.map(([key]) => Number(key)), U4_AP_NUMBERS);
  assert.deepEqual(entries.map(([, entry]) => entry.titleEn), OFFICIAL_U4_TITLES);

  for (const [apNumber, entry] of entries) {
    assert.deepEqual(Object.keys(entry), U4_MANIFEST_KEYS, `AP ${apNumber} schema`);
    assert.match(entry.id, new RegExp(`^ap${apNumber}-[a-z0-9-]+$`));
    assert.ok(U4_REGION_IDS.has(entry.region), `AP ${apNumber} region`);
    assert.ok(U4_MOVEMENT_GROUP_IDS.has(entry.traditionGroup), `AP ${apNumber} group`);
    assert.ok(entry.siteName.trim().length > 0, `AP ${apNumber} site`);
    assert.ok(entry.provenanceQualifier === null
      || (typeof entry.provenanceQualifier === 'string'
        && entry.provenanceQualifier.trim().length > 0));
    assert.ok(entry.requiredViewIds.length >= 1, `AP ${apNumber} views`);
    assert.equal(new Set(entry.requiredViewIds).size, entry.requiredViewIds.length);
  }
  assert.deepEqual(new Set(entries.map(([, entry]) => entry.region)), U4_REGION_IDS);
  assert.deepEqual(
    new Set(entries.map(([, entry]) => entry.traditionGroup)),
    U4_MOVEMENT_GROUP_IDS,
  );
});
```

Define `OFFICIAL_U4_TITLES` exactly from Appendix A.

- [ ] **Step 2: Run and confirm the missing file failure**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-u4-canonical.test.mjs
```

Expected: FAIL with `ENOENT` for the U4 manifest.

- [ ] **Step 3: Audit the current College Board U4 title and image pages**

Record one ordered view id per separately required image. Single-image works use `['primary']`; architecture uses the required exterior/interior/plan/significant-space ids; series and installations use each required panel, component, object, or environmental view. Exclude decorative supplemental images.

- [ ] **Step 4: Create all 54 manifest entries**

Use this exact shape:

```json
{
  "99": {
    "id": "ap99-portrait-sor-juana",
    "titleEn": "Portrait of Sor Juana Inés de la Cruz",
    "region": "mexicoCaribbean",
    "siteName": "Mexico City, New Spain (Mexico)",
    "provenanceQualifier": null,
    "traditionGroup": "enlightenmentRevolution",
    "requiredViewIds": ["primary"]
  }
}
```

Use creation context, not nationality or current museum. Broad, moving, or disputed origins use a non-null qualifier; AP 127 uses the reviewed Transatlantic coordinate and voyage qualifier.

- [ ] **Step 5: Run and pass the manifest contract**

Expected: PASS with 54 entries, nine represented regions, four represented movement groups, and no duplicate view ids.

- [ ] **Step 6: Commit**

```bash
git add data/ap-art-history-unit-4-manifest.json tests/art-history-u4-canonical.test.mjs
git commit -m "test: define official AP Art History Unit 4"
```

---

### Task 2: Build the Source Ledger, Rights Audit, and Canonical Fixture

**Files:**
- Create: `docs/data-sources/u4-source-ledger.md`
- Create: `data/ap-art-history-unit-4-rights.json`
- Create: `tests/fixtures/u4-canonical.json`
- Modify: `docs/art-history-sources.md`
- Modify: `tests/art-history-u4-canonical.test.mjs`
- Modify: `tests/art-history-preservation.test.mjs`

- [ ] **Step 1: Write the failing source-projection contract**

```js
import { normalizeArtworkMedia } from '../scripts/validate-art-history-data.mjs';

const U4_CANONICAL_PATH = new URL('./fixtures/u4-canonical.json', import.meta.url);
const U4_LEDGER_PATH = new URL('../docs/data-sources/u4-source-ledger.md', import.meta.url);
const U4_RIGHTS_PATH = new URL('../data/ap-art-history-unit-4-rights.json', import.meta.url);

test('U4 ledger and rights project every canonical media view exactly', async () => {
  const [manifest, canonical, ledgerText, rights] = await Promise.all([
    readFile(U4_MANIFEST_PATH, 'utf8').then(JSON.parse),
    readFile(U4_CANONICAL_PATH, 'utf8').then(JSON.parse),
    readFile(U4_LEDGER_PATH, 'utf8'),
    readFile(U4_RIGHTS_PATH, 'utf8').then(JSON.parse),
  ]);
  const expectedKeys = Object.values(manifest).flatMap((entry) => (
    entry.requiredViewIds.map((viewId) => `${entry.id}::${viewId}`)
  ));
  const rows = parseSourceLedger(ledgerText);
  assert.equal(canonical.artworks.length, 54);
  assert.deepEqual(canonical.artworks.map(({ apNumber }) => apNumber), U4_AP_NUMBERS);
  assert.deepEqual(rows.map((row) => `${row.artworkId}::${row.viewId}`), expectedKeys);
  assert.deepEqual(Object.keys(rights), expectedKeys);
  assert.deepEqual(projectCanonicalMedia(canonical), projectLedgerMedia(rows));
  assertCanonicalRightsMatch(canonical, rights);
  assertLedgerRightsMatch(rows, rights);
});
```

Define these helpers in the same test file, using the existing U3 ledger assertions for malformed rows and duplicate keys:

```js
function markdownLink(value, label) {
  const match = value.match(/^\[([^\]]+)\]\((https:\/\/[^)]+)\)$/);
  assert.ok(match, `${label}: expected HTTPS Markdown link`);
  return { label: match[1], url: match[2] };
}

const HTML_PATH = new URL('../art-history-map.html', import.meta.url);

function parseJsonBlock(html, id) {
  const match = html.match(new RegExp(
    `<script id="${id}" type="application/json">([\\s\\S]*?)<\\/script>`,
  ));
  assert.ok(match, `missing ${id}`);
  return JSON.parse(match[1]);
}

async function loadLiveArtData() {
  const html = await readFile(HTML_PATH, 'utf8');
  return {
    artworks: parseJsonBlock(html, 'artwork-data'),
    credits: parseJsonBlock(html, 'image-credit-data'),
  };
}

function parseSourceLedger(text) {
  return text.split('\n')
    .filter((line) => /^\|\s*\d+\s*\|/.test(line))
    .map((line, index) => {
      const cells = line.slice(1, -1).split('|').map((cell) => cell.trim());
      assert.equal(cells.length, 8, `U4 ledger row ${index + 1}`);
      const image = markdownLink(cells[4], `row ${index + 1} image`);
      const source = markdownLink(cells[5], `row ${index + 1} source`);
      const license = markdownLink(cells[7], `row ${index + 1} license`);
      return {
        apNumber: Number(cells[0]),
        artworkId: cells[1].replaceAll('`', ''),
        viewId: cells[2].replaceAll('`', ''),
        viewLabel: cells[3],
        imageUrl: image.url,
        sourceName: source.label,
        sourceUrl: source.url,
        creatorOrInstitution: cells[6],
        licenseName: license.label,
        licenseUrl: license.url,
      };
    });
}

function projectCanonicalMedia(canonical) {
  return canonical.artworks.flatMap((work) => (
    normalizeArtworkMedia(work).map((image) => ({
      apNumber: work.apNumber,
      artworkId: work.id,
      viewId: image.id,
      viewLabel: image.label,
      imageUrl: image.imageUrl,
      sourceName: image.imageSourceName,
      sourceUrl: image.imageSourceUrl,
    }))
  ));
}

function projectLedgerMedia(rows) {
  return rows.map(({
    apNumber, artworkId, viewId, viewLabel, imageUrl, sourceName, sourceUrl,
  }) => ({ apNumber, artworkId, viewId, viewLabel, imageUrl, sourceName, sourceUrl }));
}

function assertCanonicalRightsMatch(canonical, rights) {
  for (const work of canonical.artworks) {
    const media = normalizeArtworkMedia(work);
    const rawCredits = canonical.credits[work.id];
    const credits = Array.isArray(rawCredits) ? rawCredits : [rawCredits];
    assert.equal(credits.length, media.length, `${work.id} credit count`);
    media.forEach((image, index) => {
      const key = `${work.id}::${image.id}`;
      for (const field of ['creatorOrInstitution', 'licenseName', 'licenseUrl']) {
        assert.equal(rights[key][field], credits[index][field], `${key}.${field}`);
      }
      assert.ok(RELEASE_CLASSES.has(rights[key].releaseClass), `${key}.releaseClass`);
    });
  }
}

function assertLedgerRightsMatch(rows, rights) {
  for (const row of rows) {
    const key = `${row.artworkId}::${row.viewId}`;
    assert.equal(rights[key].creatorOrInstitution, row.creatorOrInstitution, `${key}.creator`);
    assert.equal(rights[key].licenseName, row.licenseName, `${key}.licenseName`);
    assert.equal(rights[key].licenseUrl, row.licenseUrl, `${key}.licenseUrl`);
  }
}
```

Canonical and live credits keep the existing three-field schema. The separate rights audit adds `releaseClass`; the helper above proves the other three fields match exactly.

- [ ] **Step 2: Run and confirm missing artifact failures**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-u4-canonical.test.mjs tests/art-history-preservation.test.mjs
```

Expected: FAIL because the fixture, ledger, and rights audit are absent.

- [ ] **Step 3: Write the audited per-view ledger**

Use exactly:

```markdown
| AP # | Artwork id | View id | View label | Image | Source page | Creator/institution | License/rights |
| ---: | --- | --- | --- | --- | --- | --- | --- |
```

Rows follow AP-number and manifest view order. Accept only direct HTTPS images with a human-readable identity/source page. Prefer owning institutions, estates, foundations, monuments, and archives; use Wikimedia Commons only with a traceable file page and rights trail.

- [ ] **Step 4: Write the matching rights audit**

Enforce the exact schema and allowed policy values:

```js
const RIGHTS_KEYS = [
  'creatorOrInstitution', 'licenseName', 'licenseUrl', 'releaseClass',
];
const RELEASE_CLASSES = new Set([
  'open', 'noncommercial', 'institutionalEducational', 'restricted',
]);
for (const [mediaKey, entry] of Object.entries(rights)) {
  assert.deepEqual(Object.keys(entry), RIGHTS_KEYS, `${mediaKey} rights schema`);
  assert.match(entry.licenseUrl, /^https:\/\//, `${mediaKey} license URL`);
  assert.ok(RELEASE_CLASSES.has(entry.releaseClass), `${mediaKey} release class`);
  assert.notEqual(entry.releaseClass, 'restricted', `${mediaKey} cannot ship`);
}
```

Every value comes from the audited source page; no generic license name or collection homepage is accepted.

- [ ] **Step 5: Write all 54 canonical records and credits**

The top level has exactly `artworks` and `credits`. Enforce:

```js
function assertCanonicalU4Work(work, manifestEntry) {
  assert.equal(work.unit, 4);
  assert.equal(work.id, manifestEntry.id);
  assert.equal(work.titleEn, manifestEntry.titleEn);
  assert.equal(work.region, manifestEntry.region);
  assert.equal(work.siteName, manifestEntry.siteName);
  assert.equal(work.traditionGroup, manifestEntry.traditionGroup);
  assert.equal(work.provenanceQualifier ?? null, manifestEntry.provenanceQualifier);
  for (const key of [
    'titleZh', 'culture', 'period', 'date', 'artistCulture',
    'medium', 'workType', 'function', 'form', 'content', 'context',
  ]) assert.ok(typeof work[key] === 'string' && work[key].trim());
  assert.ok(Number.isFinite(work.coordinates?.x));
  assert.ok(Number.isFinite(work.coordinates?.y));
  assert.ok(work.recognitionAnchors.length >= 2 && work.recognitionAnchors.length <= 4);
  assert.ok(work.comparisonIds.length >= 1);
  assert.ok(work.keywords.length >= 3);
  assert.deepEqual(
    normalizeArtworkMedia(work).map(({ id }) => id),
    manifestEntry.requiredViewIds,
  );
}
```

Write concise Chinese function, form, content, context, recognition anchors, and comparison notes with necessary English terms preserved. Every comparison note names its formal, material, functional, political, colonial, social, or architectural basis.

- [ ] **Step 6: Document sources**

Add the current College Board CED, `APAH notes.pdf`, Smarthistory volume three 99-152, the U4 ledger, and the U4 rights audit to `docs/art-history-sources.md`.

- [ ] **Step 7: Run and pass the source contracts**

Expected: ledger rows, rights keys, and canonical media entries all equal the manifest-derived view count.

- [ ] **Step 8: Commit**

```bash
git add docs/art-history-sources.md docs/data-sources/u4-source-ledger.md \
  data/ap-art-history-unit-4-rights.json tests/fixtures/u4-canonical.json \
  tests/art-history-u4-canonical.test.mjs tests/art-history-preservation.test.mjs
git commit -m "docs: audit AP Art History Unit 4 sources"
```

---

### Task 3: Extend Strict Validation to AP #1-152

**Files:**
- Modify: `scripts/validate-art-history-data.mjs`
- Modify: `tests/art-history-data.test.mjs`
- Modify: `tests/art-history-u4-canonical.test.mjs`

- [ ] **Step 1: Write failing global and U4 validator tests**

```js
test('loads exactly AP 1-152 in official order', async () => {
  const { artworks } = await loadLiveArtData();
  assert.equal(artworks.length, 152);
  assert.deepEqual(
    artworks.map(({ apNumber }) => apNumber),
    Array.from({ length: 152 }, (_, index) => index + 1),
  );
});

test('validator enforces U4 region, movement, provenance, and views', async () => {
  const fixture = await makeCompleteUnits1234Fixture();
  const wrongRegion = structuredClone(fixture);
  wrongRegion.artworks.find(({ apNumber }) => apNumber === 99).region = 'france';
  assert.throws(() => validateArtworks(wrongRegion.artworks, fixture.manifests), /AP 99|region/i);

  const wrongMovement = structuredClone(fixture);
  wrongMovement.artworks.find(({ apNumber }) => apNumber === 120).traditionGroup = 'unknown';
  assert.throws(() => validateArtworks(wrongMovement.artworks, fixture.manifests), /AP 120|movement|traditionGroup/i);

  const missingQualifier = structuredClone(fixture);
  delete missingQualifier.artworks.find(({ apNumber }) => apNumber === 127).provenanceQualifier;
  assert.throws(() => validateArtworks(missingQualifier.artworks, fixture.manifests), /AP 127|qualifier/i);
});
```

Add exact negative cases for missing AP 99, extra AP 153, duplicate AP number, unknown region, missing group, duplicate or reordered view, missing/extra rights key, credit mismatch, non-HTTPS source, and restricted release class.

Build the complete pre-import fixture without modifying live HTML:

```js
const U4_CANONICAL_PATH = new URL('./fixtures/u4-canonical.json', import.meta.url);
MANIFEST_PATHS[4] = new URL('../data/ap-art-history-unit-4-manifest.json', import.meta.url);

async function makeCompleteUnits1234Fixture() {
  const [existing, u4, ...manifestValues] = await Promise.all([
    loadDocumentData(),
    readFile(U4_CANONICAL_PATH, 'utf8').then(JSON.parse),
    ...[1, 2, 3, 4].map((unit) => readFile(MANIFEST_PATHS[unit], 'utf8').then(JSON.parse)),
  ]);
  return {
    artworks: [...existing.artworks, ...u4.artworks],
    credits: { ...existing.credits, ...u4.credits },
    manifests: Object.fromEntries(
      manifestValues.map((manifest, index) => [index + 1, manifest]),
    ),
  };
}
```

Extend the existing `MANIFEST_PATHS` object with Unit 4 and reuse the existing `loadDocumentData()` helper.

- [ ] **Step 2: Run and verify failure**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-data.test.mjs tests/art-history-u4-canonical.test.mjs
```

Expected: FAIL because validation currently stops at AP 98.

- [ ] **Step 3: Load U4 contracts**

```js
const MANIFEST_URLS = Object.freeze({
  1: new URL('../data/ap-art-history-unit-1-manifest.json', import.meta.url),
  2: new URL('../data/ap-art-history-unit-2-manifest.json', import.meta.url),
  3: new URL('../data/ap-art-history-unit-3-manifest.json', import.meta.url),
  4: new URL('../data/ap-art-history-unit-4-manifest.json', import.meta.url),
});
const AUDITED_RIGHTS_URLS = Object.freeze({
  3: new URL('../data/ap-art-history-unit-3-rights.json', import.meta.url),
  4: new URL('../data/ap-art-history-unit-4-rights.json', import.meta.url),
});
```

- [ ] **Step 4: Add the U4 rule**

```js
const U4_REGIONS = new Set([
  'france', 'britishIsles', 'southernEurope',
  'centralNorthernEurope', 'russiaSoviet', 'unitedStates',
  'mexicoCaribbean', 'pacific', 'transatlantic',
]);
// Append to the existing UNIT_RULES object:
4: Object.freeze({ start: 99, end: 152, count: 54, regions: U4_REGIONS }),
```

- [ ] **Step 5: Generalize audited rights validation**

```js
function validateAuditedRights({ unit, rightsAudit, artworks, credits, manifest }) {
  const label = `Unit ${unit} rights audit`;
  if (!rightsAudit || typeof rightsAudit !== 'object' || Array.isArray(rightsAudit)) {
    fail(`${label} must be an object`);
  }
  const unitWorks = artworks.filter((work) => work.unit === unit);
  const expectedEntries = unitWorks.flatMap((work) => {
    const rawCredit = credits[work.id];
    const creditEntries = Array.isArray(rawCredit) ? rawCredit : [rawCredit];
    return normalizeArtworkMedia(work).map((media, index) => [
      `${work.id}::${media.id}`,
      creditEntries[index],
    ]);
  });
  validateExactKeys(
    Object.keys(rightsAudit),
    expectedEntries.map(([mediaKey]) => mediaKey),
    `${label} media keys`,
    { orderSensitive: false },
  );
  for (const [mediaKey, canonicalCredit] of expectedEntries) {
    const entry = rightsAudit[mediaKey];
    validateExactKeys(Object.keys(entry).sort(), RIGHTS_FIELDS.toSorted(), `${label} ${mediaKey}`);
    for (const field of RIGHTS_FIELDS) {
      if (typeof entry[field] !== 'string' || entry[field].trim() === '') {
        fail(`${label} ${mediaKey}.${field} must be a non-empty string`);
      }
    }
    if (!isHttpsUrl(entry.licenseUrl)) fail(`${label} ${mediaKey} requires an HTTPS license URL`);
    if (!RELEASE_CLASSES.has(entry.releaseClass)) fail(`${label} ${mediaKey} has an unknown release class`);
    if (entry.releaseClass === 'restricted') fail(`Unit ${unit} release is blocked by ${mediaKey}`);
    const policy = RELEASE_POLICY.get(entry.licenseName);
    if (!policy) fail(`${label} ${mediaKey} is outside the approved release policy`);
    if (entry.licenseUrl !== policy[0] || entry.releaseClass !== policy[1]) {
      fail(`${label} ${mediaKey} does not match its approved release policy`);
    }
    for (const field of CREDIT_FIELDS) {
      if (entry[field] !== canonicalCredit[field]) fail(`${label} ${mediaKey}.${field} credit mismatch`);
    }
  }
  const manifestKeys = Object.values(manifest).flatMap((entry) => (
    entry.requiredViewIds.map((viewId) => `${entry.id}::${viewId}`)
  ));
  validateExactKeys(manifestKeys, expectedEntries.map(([mediaKey]) => mediaKey), `${label} manifest keys`);
}
```

Rename `U3_RELEASE_CLASSES` and `U3_RELEASE_POLICY` to `RELEASE_CLASSES` and `RELEASE_POLICY`; extend the policy map only with exact U4 license name, URL, and release-class triples proven by Task 2. Keep U3's reviewed numerical distribution and limited-license map as U3-only regression checks. U4 requires exact keys and zero restricted entries without copying U3's distribution.

- [ ] **Step 6: Enforce exact U4 manifest fields and global keys**

Compare live `id`, `titleEn`, `region`, `siteName`, normalized qualifier, `traditionGroup`, and ordered media ids to the manifest. Require exact AP keys 1-152 and exact credit keys for all works.

- [ ] **Step 7: Run focused validator tests**

Expected: all validator contracts pass except the live 152-work assertion, which remains red until Task 4.

- [ ] **Step 8: Commit**

```bash
git add scripts/validate-art-history-data.mjs tests/art-history-data.test.mjs \
  tests/art-history-u4-canonical.test.mjs
git commit -m "test: enforce complete Units 1-4 validation"
```

---

### Task 4: Import All 54 U4 Records and Credits

**Files:**
- Modify: `art-history-map.html:396-600`
- Modify: `tests/art-history-u4-canonical.test.mjs`
- Modify: `tests/art-history-details.test.mjs`

- [ ] **Step 1: Write the failing live-projection test**

```js
test('live U4 records and credits match the reviewed canonical fixture', async () => {
  const [live, canonical] = await Promise.all([
    loadLiveArtData(),
    readFile(U4_CANONICAL_PATH, 'utf8').then(JSON.parse),
  ]);
  const liveU4 = live.artworks.filter(({ unit }) => unit === 4);
  assert.deepEqual(liveU4, canonical.artworks);
  assert.deepEqual(
    Object.fromEntries(liveU4.map(({ id }) => [id, live.credits[id]])),
    canonical.credits,
  );
});
```

- [ ] **Step 2: Run and verify failure**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-u4-canonical.test.mjs tests/art-history-details.test.mjs
```

Expected: FAIL because live HTML ends at AP 98.

- [ ] **Step 3: Append AP #99-116 and credits**

Copy canonical records and credits exactly, preserving AP order, field order, Unicode, view order, and credit shape.

- [ ] **Step 4: Run projection test**

Expected: AP 117 is the first missing record; AP 99-116 match exactly.

- [ ] **Step 5: Append AP #117-134 and credits, then rerun**

Expected: AP 135 is the first missing record; AP 99-134 match exactly.

- [ ] **Step 6: Append AP #135-152 and credits**

- [ ] **Step 7: Run focused tests and strict CLI**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-u4-canonical.test.mjs tests/art-history-details.test.mjs
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/validate-art-history-data.mjs
```

Expected: focused tests pass and CLI prints `Validated 152 AP Art History works`.

- [ ] **Step 8: Commit**

```bash
git add art-history-map.html tests/art-history-u4-canonical.test.mjs \
  tests/art-history-details.test.mjs
git commit -m "feat: import AP Art History Unit 4"
```

---

### Task 5: Add U4 Regions, Movement Filters, Sites, and Search

**Files:**
- Modify: `art-history-map.html:603-875`
- Modify: `art-history-map.html:1842-1885`
- Modify: `tests/art-history-ui-numbering.test.mjs`
- Modify: `tests/art-history-details.test.mjs`

- [ ] **Step 1: Write failing configuration and search tests**

```js
test('Unit 4 exposes nine regions and five movement pills', () => {
  assert.deepEqual(UNIT_FILTER_CONFIG[4].cultureIds, [
    'enlightenmentRevolution',
    'realismIndustryPhotography',
    'postImpressionismEarlyModernism',
    'avantGardeArchitecturePostwar',
  ]);
  assert.equal(1 + UNIT_FILTER_CONFIG[4].cultureIds.length, 5);
  const counts = ARTWORKS.filter(({ unit }) => unit === 4)
    .reduce((result, work) => ({
      ...result,
      [work.region]: (result[work.region] ?? 0) + 1,
    }), {});
  assert.deepEqual(Object.keys(counts).sort(), [
    'britishIsles', 'centralNorthernEurope', 'france',
    'mexicoCaribbean', 'pacific', 'russiaSoviet',
    'southernEurope', 'transatlantic', 'unitedStates',
  ]);
  assert.equal(Object.values(counts).reduce((sum, count) => sum + count, 0), 54);
});

test('Unit 4 search includes precise bilingual movement terms', () => {
  const u4Works = ARTWORKS.filter(({ unit }) => unit === 4);
  const searchU4 = (search) => filterWorks(u4Works, {
    unit: '4', culture: 'all', period: '', workType: '', search,
  }).map(({ apNumber }) => apNumber);
  assert.deepEqual(searchU4('Cubism'), [126, 130]);
  assert.deepEqual(searchU4('立体主义'), [126, 130]);
  assert.deepEqual(searchU4('Land Art'), [151]);
  assert.deepEqual(searchU4('大地艺术'), [151]);
  assert.deepEqual(searchU4('AP 106'), [106]);
});

test('Unit 4 empty results retain the shared reset action', () => {
  state.unit = '4';
  state.search = 'no-u4-work-matches-this';
  render();
  const reset = document.querySelector('.empty-state button');
  assert.ok(reset);
  reset.click();
  assert.equal(state.search, '');
  assert.equal(state.unit, 'all');
  assert.equal(filterWorks(ARTWORKS, state).length, 152);
});
```

If the reviewed canonical fixture assigns an additional Cubist work, update both exact Cubism arrays from that fixture in this commit; do not loosen them to `includes()`.

- [ ] **Step 2: Run and verify failure**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
```

Expected: FAIL because Unit 4 has no filter, region, label, or site configuration.

- [ ] **Step 3: Add broad movement labels**

```js
enlightenmentRevolution: Object.freeze({ labelEn: 'Enlightenment & Revolution', labelZh: '启蒙与革命' }),
realismIndustryPhotography: Object.freeze({ labelEn: 'Realism, Industry & Photography', labelZh: '现实主义、工业与摄影' }),
postImpressionismEarlyModernism: Object.freeze({ labelEn: 'Post-Impressionism & Early Modernism', labelZh: '后印象主义与早期现代主义' }),
avantGardeArchitecturePostwar: Object.freeze({ labelEn: 'Avant-Garde, Architecture & Postwar', labelZh: '先锋艺术、建筑与战后艺术' }),
```

Add every precise `culture` key in the U4 canonical fixture with exact English and Chinese labels. Broad ids never replace precise record metadata.

- [ ] **Step 4: Activate U4 filters and wording**

```js
4: Object.freeze({
  showCultureFilters: true,
  cultureIds: Object.freeze([
    'enlightenmentRevolution',
    'realismIndustryPhotography',
    'postImpressionismEarlyModernism',
    'avantGardeArchitecturePostwar',
  ]),
}),
```

Generate the reset label with:

```js
const allLabel = unitId === 3
  ? 'All traditions'
  : unitId === 4
    ? 'All movements'
    : 'All cultures';
```

- [ ] **Step 5: Add nine U4 regions**

Extend existing objects:

```js
france: Object.freeze({ nameEn: 'France', unitIds: Object.freeze([3, 4]) }),
britishIsles: Object.freeze({ nameEn: 'British Isles', unitIds: Object.freeze([3, 4]) }),
southernEurope: Object.freeze({ nameEn: 'Southern Europe', unitIds: Object.freeze([2, 4]) }),
```

Add:

```js
centralNorthernEurope: Object.freeze({ nameEn: 'Central & Northern Europe', unitIds: Object.freeze([4]) }),
russiaSoviet: Object.freeze({ nameEn: 'Russia & Soviet Union', unitIds: Object.freeze([4]) }),
unitedStates: Object.freeze({ nameEn: 'United States', unitIds: Object.freeze([4]) }),
mexicoCaribbean: Object.freeze({ nameEn: 'Mexico & Caribbean', unitIds: Object.freeze([4]) }),
pacific: Object.freeze({ nameEn: 'Pacific', unitIds: Object.freeze([4]) }),
transatlantic: Object.freeze({ nameEn: 'Transatlantic', unitIds: Object.freeze([4]) }),
```

- [ ] **Step 6: Add reviewed creation-context coordinates**

Add every canonical `siteName` to `SITE_WORLD_COORDINATES`. The manifest, fixture, and coordinate-table strings must match exactly. AP 127 uses a reviewed North Atlantic point and qualifier; current museum cities never substitute for creation sites.

- [ ] **Step 7: Preserve broad filtering and precise search**

```js
const broadGroup = work.traditionGroup ?? work.culture;
if (filters.culture !== 'all' && broadGroup !== filters.culture) return false;
```

Search text includes the broad and precise English/Chinese labels, region, site, qualifier, titles, artist, period, date, medium, type, keywords, raw number, and `AP ${apNumber}`.

- [ ] **Step 8: Run focused tests**

Expected: PASS for U1-U4 configuration, nine manifest-derived U4 regions, five U4 pills, and bilingual search.

- [ ] **Step 9: Commit**

```bash
git add art-history-map.html tests/art-history-ui-numbering.test.mjs \
  tests/art-history-details.test.mjs
git commit -m "feat: add Unit 4 map hierarchy and movement filters"
```

---

### Task 6: Verify Detail Media, Study Tabs, Comparisons, and Preservation

**Files:**
- Modify: `tests/art-history-details.test.mjs`
- Modify: `tests/art-history-preservation.test.mjs`
- Modify: `tests/art-history-u4-canonical.test.mjs`
- Modify: `art-history-map.html` only when a failing data-driven UI test proves a defect

- [ ] **Step 1: Write the U4 detail hierarchy test**

```js
test('every U4 detail keeps English title above Chinese subtitle', async () => {
  const html = await loadHtml();
  const artworks = parseJsonBlock(html, 'artwork-data');
  const credits = parseJsonBlock(html, 'image-credit-data');
  const harness = createDetailHarness(html, artworks, credits);
  const u4 = artworks.filter(({ unit }) => unit === 4);
  assert.equal(u4.length, 54);
  for (const work of u4) {
    const detail = harness.renderArtworkDetails(work, { works: [work] });
    assert.equal(detail.querySelector('#detailTitle').textContent, work.titleEn);
    assert.equal(detail.querySelector('.work-title-zh').textContent, work.titleZh);
    assert.match(detail.querySelector('.work-meta').textContent, new RegExp(`AP #${work.apNumber}\\b`));
    assert.equal(detail.querySelectorAll('[role="tab"]').length, 4);
  }
});
```

Use the exact current classes or ids found in the detail harness; do not add duplicate hooks solely for the test.

- [ ] **Step 2: Test the maximum-view U4 work**

```js
const maximumViewWork = canonical.artworks.reduce((current, work) => (
  normalizeArtworkMedia(work).length > normalizeArtworkMedia(current).length
    ? work
    : current
));
```

Click every view and assert image URL, alt, source link, credit, pressed state, modal content, and focus restoration. Assert the switcher wraps and compact buttons retain a 44px minimum target.

Also assert the shared artwork image rule remains `object-fit: contain`. Dispatch an image error for the selected U4 work and verify the existing accessible fallback names the work, contains no injected HTML, and leaves the view buttons usable.

- [ ] **Step 3: Freeze U1-U3**

```js
test('U1-U3 remain field-for-field frozen after U4 import', async () => {
  const { artworks, credits } = await loadLiveArtData();
  await assertCanonicalUnit(1, artworks, credits, U1_CANONICAL_PATH);
  await assertCanonicalUnit2Fixtures(artworks, credits);
  await assertCanonicalUnit(3, artworks, credits, U3_CANONICAL_PATH);
});
```

- [ ] **Step 4: Test one real cross-Unit comparison**

```js
const allWorks = artworks;
const source = canonical.artworks.find((work) => (
  work.comparisonIds.some((id) => allWorks.find((candidate) => candidate.id === id)?.unit < 4)
));
assert.ok(source, 'U4 must contain a cross-Unit comparison');
const target = allWorks.find(({ id }) => source.comparisonIds.includes(id) && id !== source.id);
assert.ok(target && target.unit < 4, 'cross-Unit target must resolve to U1-U3');
state.unit = '4';
state.culture = 'avantGardeArchitecturePostwar';
state.selectedId = source.id;
selectComparisonTarget(target.id);
assert.equal(state.unit, String(target.unit));
assert.equal(state.culture, 'all');
assert.equal(state.selectedId, target.id);
assert.equal(document.activeElement?.id, 'detailTitle');
```

The canonical note must contain a non-empty comparison basis and both ids must resolve.

- [ ] **Step 5: Run focused tests**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-details.test.mjs tests/art-history-preservation.test.mjs \
  tests/art-history-u4-canonical.test.mjs
```

Expected: U1-U3 preservation passes. U4 behavior passes if the renderer is fully data-driven; otherwise one named defect fails.

- [ ] **Step 6: Apply only the minimal proven renderer correction**

Preserve normalized media flow and reset active media index on artwork change:

```js
const mediaItems = getArtworkImages(work);
const activeMedia = mediaItems[activeMediaIndex];
renderImage(activeMedia);
renderCredit(getImageCredit(work, activeMediaIndex));
```

Never special-case an AP number.

- [ ] **Step 7: Rerun and pass focused tests**

Expected: all U4 details are bilingual, every required view is synchronized, comparisons restore focus, and U1-U3 are unchanged.

- [ ] **Step 8: Commit**

```bash
git add art-history-map.html tests/art-history-details.test.mjs \
  tests/art-history-preservation.test.mjs tests/art-history-u4-canonical.test.mjs
git commit -m "test: preserve Units 1-3 across Unit 4"
```

Omit `art-history-map.html` when no renderer correction was necessary.

---

### Task 7: Update Units 1-4 Copy and Homepage Integration

**Files:**
- Modify: `art-history-map.html:6-188`
- Modify: `art-history-map.html:2670-2690`
- Modify: `index.html:722`
- Modify: `scripts/verify-art-history-release.mjs`
- Modify: `tests/homepage-art-integration.test.mjs`
- Modify: `tests/art-history-ui-numbering.test.mjs`

- [ ] **Step 1: Write failing copy tests**

```js
test('homepage and Art map describe Units 1-4', async () => {
  const [homepage, artMap, release] = await Promise.all([
    readFile(HOMEPAGE_PATH, 'utf8'),
    readFile(ART_MAP_PATH, 'utf8'),
    readFile(RELEASE_VERIFIER_PATH, 'utf8'),
  ]);
  assert.match(homepage, /152 AP works · Units 1-4 · filter, compare and study/);
  assert.match(artMap, /AP 艺术史互动地图 · Units 1-4/);
  assert.match(artMap, /全部 152 件作品/);
  assert.match(artMap, /U4 · Later Europe and Americas · 54 pieces/);
  assert.match(release, /strict 152-work Units 1-4 validator/);
  assert.doesNotMatch(artMap, /timeline|timeRange|timelineFilter/i);
});
```

- [ ] **Step 2: Run and verify old-copy failure**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/homepage-art-integration.test.mjs tests/art-history-ui-numbering.test.mjs
```

- [ ] **Step 3: Update map and accessibility copy**

Change document title, heading, subtitle, map-panel label, SVG label, overview copy, and complete-hierarchy copy from Units 1-3 / 98 to Units 1-4 / 152. Do not change typography, iframe size, or World History copy.

- [ ] **Step 4: Update homepage and release label**

```js
'152 AP works · Units 1-4 · filter, compare and study'
```

```js
['strict 152-work Units 1-4 validator', ['scripts/validate-art-history-data.mjs', 'art-history-map.html']],
```

- [ ] **Step 5: Run and pass focused tests**

Expected: Units 1-4 copy passes with World History assertions unchanged and no timeline markup.

- [ ] **Step 6: Commit**

```bash
git add art-history-map.html index.html scripts/verify-art-history-release.mjs \
  tests/homepage-art-integration.test.mjs tests/art-history-ui-numbering.test.mjs
git commit -m "feat: integrate Art History Units 1-4"
```

---

### Task 8: Add the Complete U4 Browser Fixture and Traversal

**Files:**
- Create: `tests/fixtures/u4-browser.json`
- Modify: `tests/art-history-browser-verifier.test.mjs`
- Modify: `scripts/verify-art-history-browser.mjs`

- [ ] **Step 1: Write the failing browser fixture test**

```js
const U4_BROWSER_FIXTURE = new URL('./fixtures/u4-browser.json', import.meta.url);
const U4_CANONICAL_FIXTURE = new URL('./fixtures/u4-canonical.json', import.meta.url);
const U4_MANIFEST_FIXTURE = new URL('../data/ap-art-history-unit-4-manifest.json', import.meta.url);

test('U4 browser fixture covers AP 99-152 and all audited views', async () => {
  const [fixture, canonical, manifest] = await Promise.all([
    readFile(U4_BROWSER_FIXTURE, 'utf8').then(JSON.parse),
    readFile(U4_CANONICAL_FIXTURE, 'utf8').then(JSON.parse),
    readFile(U4_MANIFEST_FIXTURE, 'utf8').then(JSON.parse),
  ]);
  const viewCount = Object.values(manifest)
    .reduce((sum, entry) => sum + entry.requiredViewIds.length, 0);
  assert.deepEqual(fixture, projectU4BrowserFixture(canonical));
  assert.deepEqual(fixture.map(({ apNumber }) => apNumber),
    Array.from({ length: 54 }, (_, index) => index + 99));
  assert.equal(fixture.reduce((sum, work) => sum + work.images.length, 0), viewCount);
});
```

- [ ] **Step 2: Run and confirm missing fixture**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-browser-verifier.test.mjs
```

Expected: FAIL because `u4-browser.json` is absent.

- [ ] **Step 3: Generate the exact projection**

```js
{
  id, apNumber, titleEn, titleZh, unit, region, siteName,
  images: normalizeArtworkMedia(work).map(({
    id, label, imageUrl, imageAlt, imageSourceUrl,
  }) => ({ id, label, imageUrl, imageAlt, imageSourceUrl })),
}
```

Review all 54 entries against the canonical fixture; do not hand-author differences.

- [ ] **Step 4: Add verifier contracts and negative controls**

Require `verifyU4Works`, `verifyU4Standalone`, `verifyU4Embedded`, `verifyU4StudyTabsAndComparison`, and U4 responsive traversal. Mutate one wrong image URL, one missing final view, AP 106's title, one duplicate request, one console warning, modal focus restoration, and the ninth region branch. Also force one marker-layout failure and assert the previous complete marker layer remains instead of a partial replacement. Every mutation must fail with a specific message.

- [ ] **Step 5: Traverse every work visibly**

For each work in standalone and embedded modes: reset controls, select U4, search its exact English title, traverse Unit -> region -> site -> AP pin, assert bilingual heading and metadata, click every view, verify image/alt/source/credit/pressed/modal/focus, and assert exact request count. Do not substitute hidden state calls for visible interaction.

- [ ] **Step 6: Verify tabs, comparison, and responsive layouts**

Exercise all four tabs and one real U4-to-U1/U2/U3 comparison. Verify nine-region and site traversal at 375x812, 390x844, 667x375 embedded, 665px boundary, 1024x768, and 1365x768. Assert no overflow, clipping, marker overlap, or inaccessible controls.

- [ ] **Step 7: Run and pass verifier unit tests**

Expected: U4 fixture, traversal-source contracts, and all negative controls pass.

- [ ] **Step 8: Commit**

```bash
git add tests/fixtures/u4-browser.json tests/art-history-browser-verifier.test.mjs \
  scripts/verify-art-history-browser.mjs
git commit -m "test: verify complete Art History Unit 4"
```

---

### Task 9: Run the Full Release Gate and Two-Stage Review

**Files:**
- Modify only when a verified defect has a failing regression test.

- [ ] **Step 1: Run all tests**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/*.test.mjs
```

Expected: all tests pass with no skipped, todo, or cancelled tests.

- [ ] **Step 2: Run strict validation**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/validate-art-history-data.mjs
```

Expected: `Validated 152 AP Art History works`.

- [ ] **Step 3: Run browser and composed release gates**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/verify-art-history-browser.mjs
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/verify-art-history-release.mjs
```

Expected: browser matrix exits 0 and composed gate prints `Release verification passed.`

- [ ] **Step 4: Check static integrity and protected files**

```bash
git diff --check
git status --short
git diff --exit-code "$(git merge-base feature/ap-art-history-u4 feature/ap-art-history-u3)"...HEAD -- world-map.html \
  tests/fixtures/u1-canonical.json tests/fixtures/u1-browser.json \
  tests/fixtures/u3-canonical.json tests/fixtures/u3-browser.json \
  data/ap-art-history-unit-3-manifest.json data/ap-art-history-unit-3-rights.json
```

Expected: no whitespace errors and no protected-file diff from the U4 branch point.

- [ ] **Step 5: Request two-stage review**

Invoke `superpowers:requesting-code-review` for spec compliance, then code/data/source-rights/accessibility/regression quality. For each finding: add a failing regression, make the smallest correction, rerun focused and complete release gates, and commit.

- [ ] **Step 6: Commit verified corrections**

```bash
git add art-history-map.html index.html data docs scripts tests
git commit -m "fix: complete AP Art History Unit 4 release"
```

Skip when review makes no changes and the worktree is clean.

---

### Task 10: Sync to Desktop and Hold the GitHub Gate

**Files:**
- Source: verified U4 worktree
- Destination: `/Users/tiffanyxu/Desktop/APWH/考前冲刺_地区专题_试做版`

- [ ] **Step 1: Compute the exact delivery list**

```bash
git diff --name-only "$(git merge-base feature/ap-art-history-u4 feature/ap-art-history-u3)"...HEAD
```

The list may contain only approved U4 data, docs, HTML, scripts, tests, and fixtures. It must exclude protected files, `.git`, `.worktrees`, `.superpowers`, and temporary files.

- [ ] **Step 2: Create a recoverable Desktop backup**

Request filesystem approval before writing outside the workspace. Create a timestamped directory under `/Users/tiffanyxu/Desktop/APWH/考前冲刺_地区专题_试做版/.codex-backups/` and copy only files that will be replaced.

- [ ] **Step 3: Copy and hash the delivery**

Preserve repository-relative paths. Compare SHA-256 for every copied file. Expected mismatch count: `0`.

- [ ] **Step 4: Run release verification from Desktop**

```bash
cd '/Users/tiffanyxu/Desktop/APWH/考前冲刺_地区专题_试做版'
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/verify-art-history-release.mjs
```

Expected: the same 152-work release pass.

- [ ] **Step 5: Open the final preview**

Verify U1 11 pieces, U2 36 pieces, U3 51 pieces, U4 54 pieces, the 152-work homepage caption, and the absence of a timeline.

- [ ] **Step 6: Ask for explicit GitHub approval**

After user review, invoke `superpowers:finishing-a-development-branch`. Push or create a pull request only when the user explicitly selects that external action.

---

## Appendix A: Exact U4 Official Title Sequence

```js
const OFFICIAL_U4_TITLES = Object.freeze([
  'Portrait of Sor Juana Inés de la Cruz',
  'A Philosopher Giving a Lecture on the Orrery',
  'The Swing',
  'Monticello',
  'The Oath of the Horatii',
  'George Washington',
  'Self-Portrait',
  "Y no hai remedio (And There's Nothing to Be Done), from Los Desastres de la Guerra (The Disasters of War), plate 15",
  'La Grande Odalisque',
  'Liberty Leading the People',
  'View from Mount Holyoke, Northampton, Massachusetts, after a Thunderstorm - The Oxbow',
  'Still Life in Studio',
  'Slave Ship (Slavers Throwing Overboard the Dead and Dying, Typhoon Coming On)',
  'Palace of Westminster (Houses of Parliament)',
  'The Stone Breakers',
  'Nadar Raising Photography to the Height of Art',
  'Olympia',
  'The Saint-Lazare Station',
  'The Horse in Motion',
  'The Valley of Mexico from the Hillside of Santa Isabel',
  'The Burghers of Calais',
  'The Starry Night',
  'The Coiffure',
  'The Scream',
  'Where Do We Come From? What Are We? Where Are We Going?',
  'Carson, Pirie, Scott and Company Building',
  'Mont Sainte-Victoire',
  "Les Demoiselles d'Avignon",
  'The Steerage',
  'The Kiss',
  'The Kiss',
  'The Portuguese',
  'The Goldfish',
  'Improvisation 28 (second version)',
  'Self-Portrait as a Soldier',
  'Memorial Sheet of Karl Liebknecht',
  'Villa Savoye',
  'Composition with Red, Blue and Yellow',
  'Illustration from The Results of the First Five-Year Plan',
  'Object (Le Déjeuner en fourrure)',
  'Fallingwater',
  'The Two Fridas',
  'The Migration of the Negro, Panel no. 49',
  'The Jungle',
  'Dream of a Sunday Afternoon in the Alameda Central Park',
  'Fountain',
  'Woman, I',
  'Marilyn Diptych',
  'Seagram Building',
  'Narcissus Garden',
  'The Bay',
  'Lipstick (Ascending) on Caterpillar Tracks',
  'Spiral Jetty',
  'House in New Castle County',
]);
```

The current College Board CED wins when punctuation differs from Smarthistory. Store alternate wording as searchable keywords rather than changing `titleEn`.

## Appendix B: Broad Movement Groups

```js
const U4_MOVEMENT_GROUPS = Object.freeze({
  enlightenmentRevolution: Object.freeze({ labelEn: 'Enlightenment & Revolution', labelZh: '启蒙与革命' }),
  realismIndustryPhotography: Object.freeze({ labelEn: 'Realism, Industry & Photography', labelZh: '现实主义、工业与摄影' }),
  postImpressionismEarlyModernism: Object.freeze({ labelEn: 'Post-Impressionism & Early Modernism', labelZh: '后印象主义与早期现代主义' }),
  avantGardeArchitecturePostwar: Object.freeze({ labelEn: 'Avant-Garde, Architecture & Postwar', labelZh: '先锋艺术、建筑与战后艺术' }),
});
```

`All movements` is generated by the shared filter renderer and is never stored as a record value.
