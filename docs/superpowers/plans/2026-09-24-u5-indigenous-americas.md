# AP Art History U5 Indigenous Americas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the verified AP Art History map from AP #1–152 to AP #1–166 by adding all 14 Unit 5 Indigenous Americas works, all 27 ordered required views, bilingual study content, rights-safe media, and the existing map/filter/comparison experience.

**Architecture:** Treat the U5 manifest, source ledger, rights audit, canonical fixture, and browser fixture as separate reviewable authorities. Import the reviewed canonical data into the static HTML only after strict tests fail for its absence, and generalize the existing U4 private-media loader into a unit-scoped multi-bundle loader without changing public behavior. Preserve U1–U4 and `world-map.html` byte-for-byte through dedicated preservation gates.

**Tech Stack:** Static HTML/CSS/JavaScript, JSON and Markdown data contracts, Node.js test runner, JSDOM, Playwright browser verification, Git worktrees, Git-ignored local media files.

---

## Working Context

Continue in the existing isolated worktree and branch:

```text
/Users/tiffanyxu/Documents/New project/考前冲刺_地区专题_试做版/.worktrees/ap-art-history-u5
feature/ap-art-history-u5
```

The approved design is:

```text
docs/superpowers/specs/2026-09-24-u5-indigenous-americas-design.md
```

Use this Node executable for every test and validation command:

```text
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
```

The official identity authority is the current College Board AP Art History Course and Exam Description linked from:

```text
https://apcentral.collegeboard.org/courses/ap-art-history
https://apcentral.collegeboard.org/media/pdf/ap-art-history-course-and-exam-description.pdf
```

Do not use the College Board PDF as a public image host. It is an identity and required-view authority only.

## File Structure

### New tracked files

- `data/ap-art-history-unit-5-manifest.json` — exact AP 153–166 identity, ordered views, creation-context region/site, and tradition group.
- `data/ap-art-history-unit-5-rights.json` — one audited rights record for each of the 27 logical views.
- `data/ap-art-history-unit-5-placeholder-authority.json` — exact restricted keys and official identity/source explanations; omit only when the final audit has zero restricted views.
- `docs/data-sources/u5-source-ledger.md` — ordered 27-row source and rights ledger.
- `tests/fixtures/u5-canonical.json` — complete 14-work bilingual canonical dataset.
- `tests/fixtures/u5-browser.json` — browser traversal projection for all 14 works and 27 views.
- `tests/art-history-u5-canonical.test.mjs` — U5 identity, study, source, rights, and projection contract.

### Modified tracked files

- `art-history-map.html`
- `index.html`
- `docs/art-history-sources.md`
- `scripts/validate-art-history-data.mjs`
- `scripts/verify-art-history-browser.mjs`
- `scripts/verify-art-history-private-leaks.mjs`
- `scripts/verify-art-history-release.mjs`
- `tests/art-history-data.test.mjs`
- `tests/art-history-details.test.mjs`
- `tests/art-history-preservation.test.mjs`
- `tests/art-history-ui-numbering.test.mjs`
- `tests/art-history-browser-verifier.test.mjs`
- `tests/homepage-art-integration.test.mjs`

### Ignored local files

- `.private-media/u5/overrides.js`
- `.private-media/u5/*.{jpg,jpeg,png,webp}`

### Protected files

- `world-map.html`
- All U1–U4 manifests, rights audits, ledgers, canonical fixtures, and browser fixtures
- All 152 existing live artwork objects and credits, field-for-field

---

### Task 1: Freeze the Official U5 Manifest and Preservation Boundary

**Files:**
- Create: `data/ap-art-history-unit-5-manifest.json`
- Create: `tests/art-history-u5-canonical.test.mjs`
- Modify: `tests/art-history-preservation.test.mjs`

- [ ] **Step 1: Write the failing manifest test**

Create an exact expected projection in AP order:

```js
const EXPECTED_U5 = Object.freeze([
  [153, 'ap153-chavin-huantar', 'Chavín de Huántar', 'centralAndes', 'Ancient Central Andes', ['plan', 'lanzon-stela', 'relief-sculpture', 'nose-ornament']],
  [154, 'ap154-mesa-verde', 'Mesa Verde cliff dwellings', 'ancestralPueblo', 'Ancient North America', ['cliff-dwellings']],
  [155, 'ap155-yaxchilan', 'Yaxchilán', 'mesoamerica', 'Ancient Mesoamerica', ['structure-40', 'lintel-25-structure-23', 'structure-33']],
  [156, 'ap156-great-serpent-mound', 'Great Serpent Mound', 'easternWoodlands', 'Ancient North America', ['earthwork']],
  [157, 'ap157-templo-mayor', 'Templo Mayor (Main Temple)', 'mesoamerica', 'Ancient Mesoamerica', ['reconstruction', 'coyolxauhqui-stone', 'calendar-stone', 'olmec-style-mask']],
  [158, 'ap158-ruler-feather-headdress', "Ruler's feather headdress (probably of Motecuhzoma II)", 'mesoamerica', 'Ancient Mesoamerica', ['primary']],
  [159, 'ap159-city-cusco', 'City of Cusco, including Qorikancha, Santo Domingo, and Walls at Saqsa Waman', 'centralAndes', 'Ancient Central Andes', ['city-plan', 'qorikancha-santo-domingo', 'saqsa-waman-walls']],
  [160, 'ap160-maize-cobs', 'Maize cobs', 'centralAndes', 'Ancient Central Andes', ['primary']],
  [161, 'ap161-machu-picchu', 'City of Machu Picchu', 'centralAndes', 'Ancient Central Andes', ['city', 'observatory', 'intihuatana-stone']],
  [162, 'ap162-all-toqapu-tunic', "All-T'oqapu tunic", 'centralAndes', 'Ancient Central Andes', ['primary']],
  [163, 'ap163-bandolier-bag', 'Bandolier bag', 'easternWoodlands', 'Native North America', ['primary']],
  [164, 'ap164-transformation-mask', 'Transformation mask', 'northwestCoast', 'Native North America', ['closed', 'open']],
  [165, 'ap165-painted-elk-hide', 'Painted elk hide', 'plainsGreatBasin', 'Native North America', ['primary']],
  [166, 'ap166-black-on-black-vessel', 'Black-on-black ceramic vessel', 'ancestralPueblo', 'Native North America', ['primary']],
]);

function projectManifestEntry([apNumber, value]) {
  return [
    Number(apNumber), value.id, value.titleEn, value.region,
    value.traditionGroup, value.requiredViewIds,
  ];
}

test('U5 manifest freezes AP 153-166 and all 27 ordered views', async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  assert.deepEqual(Object.entries(manifest).map(projectManifestEntry), EXPECTED_U5);
  assert.equal(Object.values(manifest).flatMap((entry) => entry.requiredViewIds).length, 27);
});
```

Also require each entry to contain exactly `id`, `titleEn`, `region`, `siteName`, `provenanceQualifier`, `traditionGroup`, and `requiredViewIds`; require six reviewed region keys and four exact tradition groups.

- [ ] **Step 2: Run the test and confirm the expected RED**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-u5-canonical.test.mjs
```

Expected: FAIL because `data/ap-art-history-unit-5-manifest.json` does not exist.

- [ ] **Step 3: Create the manifest**

Write all 14 entries in numeric JSON key order. Use creation-context locations, not current museums. Include these reviewed site anchors and qualifiers:

```js
const U5_SITES = Object.freeze({
  153: ['Chavín de Huántar, Ancash, Peru', null],
  154: ['Mesa Verde, Colorado, U.S.', null],
  155: ['Yaxchilán, Chiapas, Mexico', null],
  156: ['Adams County, Ohio, U.S.', null],
  157: ['Tenochtitlan (Mexico City), Mexico', null],
  158: ['Mexica realm, Central Mexico', 'Traditionally associated with Motecuhzoma II; exact maker and original ownership remain uncertain.'],
  159: ['Cusco, Peru', null],
  160: ['Inka realm, Central Andes', 'Exact excavation and production location is not securely documented; map placement represents the Inka Central Andes.'],
  161: ['Machu Picchu, Cusco Region, Peru', null],
  162: ['Inka realm, Central Andes', 'Exact production location is unknown; map placement represents the Inka imperial heartland.'],
  163: ['Lenape homelands, northeastern North America', 'Portable work; exact maker and place of production are not securely documented.'],
  164: ["Kwakwaka'wakw territories, British Columbia, Canada", 'Portable ceremonial object; the regional anchor does not claim a precise village of manufacture.'],
  165: ['Wind River Reservation, Wyoming, U.S.', 'Attributed to Cotsiogo (Cadzi Cody), Eastern Shoshone; map placement represents the documented community context.'],
  166: ['San Ildefonso Pueblo, New Mexico, U.S.', null],
});
```

Store coordinates as canonical artwork data in Task 3, not in the manifest.

- [ ] **Step 4: Freeze U1–U4 preservation**

Extend the preservation test so the U5 work compares the live U1–U4 projection with the existing 152-work snapshot before any new data is imported:

```js
assert.deepEqual(
  liveArtworks.filter((work) => work.apNumber <= 152),
  baselineArtworks,
  'U1-U4 artwork records must remain field-for-field unchanged',
);
assert.deepEqual(
  Object.fromEntries(Object.entries(liveCredits).filter(([id]) => baselineIds.has(id))),
  baselineCredits,
  'U1-U4 credits must remain field-for-field unchanged',
);
assert.deepEqual(await readFile(WORLD_MAP_PATH), worldMapBaseline);
```

- [ ] **Step 5: Run focused tests**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-u5-canonical.test.mjs tests/art-history-preservation.test.mjs
```

Expected: manifest and preservation tests PASS; later canonical tests remain absent until Task 2 adds them.

- [ ] **Step 6: Commit**

```bash
git add data/ap-art-history-unit-5-manifest.json \
  tests/art-history-u5-canonical.test.mjs tests/art-history-preservation.test.mjs
git commit -m "test: define AP Art History Unit 5"
```

---

### Task 2: Audit All 27 Views and Build the Canonical U5 Source Bundle

**Files:**
- Create: `docs/data-sources/u5-source-ledger.md`
- Create: `data/ap-art-history-unit-5-rights.json`
- Create conditionally: `data/ap-art-history-unit-5-placeholder-authority.json`
- Create: `tests/fixtures/u5-canonical.json`
- Modify: `docs/art-history-sources.md`
- Modify: `tests/art-history-u5-canonical.test.mjs`

- [ ] **Step 1: Add source, media, study, and rights contract tests**

Use manifest order to derive the exact identity list:

```js
function mediaIdentity(workId, viewId) {
  return `${workId}::${viewId}`;
}

const expectedKeys = Object.values(manifest).flatMap((entry) =>
  entry.requiredViewIds.map((viewId) => mediaIdentity(entry.id, viewId))
);

assert.equal(expectedKeys.length, 27);
assert.deepEqual(Object.keys(rights), expectedKeys);
assert.deepEqual(ledgerRows.map((row) => row.key), expectedKeys);
assert.deepEqual(
  canonical.flatMap((work) => work.media.map((view) => mediaIdentity(work.id, view.id))),
  expectedKeys,
);
```

For every record require exact field order, `unit: 5`, `apNumber`, six-region membership, precise culture, one of the four tradition groups, `siteName`, finite coordinates, provenance qualifier parity with the manifest, English title, Chinese title, artist/community, period, date, medium, type, `function`, `form`, `content`, `context`, two to four unique anchors, at least one resolvable comparison plus comparison basis, at least three unique searchable keywords, ordered media, and matching credits.

Validate URLs structurally, not with a string prefix:

```js
function assertHttpsUrl(value, label) {
  const parsed = new URL(value);
  assert.equal(parsed.protocol, 'https:', `${label}: protocol`);
  assert.ok(parsed.hostname, `${label}: hostname`);
}
```

Add negative mutations for a missing AP number, extra AP 167, duplicate AP number, reordered view, wrong region, wrong tradition, invented exact site without a qualifier, unresolved comparison, repeated alt text, malformed pseudo-HTTPS URL, missing ledger row, rights/credit mismatch, unapproved null image, and restricted URL leakage.

- [ ] **Step 2: Run the source-contract RED**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-u5-canonical.test.mjs
```

Expected: FAIL because the ledger, rights audit, canonical fixture, and any required placeholder authority are absent.

- [ ] **Step 3: Audit exactly 27 views**

For each manifest key, record this eight-column ledger row in manifest/view order:

```markdown
| AP # | Work ID | View ID | Image | Source | Rights | Release class | Review note |
| ---: | --- | --- | --- | --- | --- | --- | --- |
```

Use only:

1. College Board CED for identity and required-view scope;
2. an owning museum, monument, tribal/community authority, preservation agency, or archive for exact identity and context;
3. Wikimedia Commons file pages or explicit institutional reuse policies for public image rights;
4. Smarthistory or peer-reviewed/museum scholarship for interpretation.

An online-visible image without a portable grant is restricted. Its Image cell is exactly:

```text
Rights-restricted public placeholder
```

The row must still contain an official HTTPS identity/source page and an HTTPS rights/permission page.

- [ ] **Step 4: Freeze the exact rights result**

Create one rights object per view with this field order. The values come directly from the reviewed ledger row, and the constructor rejects an unreviewed row:

```js
function rightsEntryFromReviewedRow(row) {
  assert.equal(row.reviewStatus, 'reviewed');
  assert.ok(row.creatorOrInstitution.trim());
  assert.ok(row.licenseName.trim());
  assertHttpsUrl(row.licenseUrl, `${row.key}.licenseUrl`);
  assert.ok(['open', 'noncommercial', 'institutionalEducational', 'restricted'].includes(row.releaseClass));
  return {
    creatorOrInstitution: row.creatorOrInstitution,
    licenseName: row.licenseName,
    licenseUrl: row.licenseUrl,
    releaseClass: row.releaseClass,
  };
}
```

Allowed release classes are `open`, `noncommercial`, `institutionalEducational`, and `restricted`. For a restricted view, use `imageUrl: null`, `mediaStatus: "rightsRestricted"`, and add its key to `data/ap-art-history-unit-5-placeholder-authority.json`. That authority contains only:

```js
function placeholderAuthorityFromReviewedRow(row) {
  assert.equal(row.releaseClass, 'restricted');
  assertHttpsUrl(row.sourceUrl, `${row.key}.sourceUrl`);
  return {
    imageSourceName: row.sourceName,
    imageSourceUrl: row.sourceUrl,
    rightsNote: 'The public build preserves identity and source information without reproducing an image for which portable public permission was not verified.',
  };
}
```

Never place a restricted direct image URL, a College Board reproduction URL, a local absolute path, or a guessed license in tracked files.

- [ ] **Step 5: Write all 14 canonical records**

Use the existing U4 canonical field order. Keep language exam-oriented and concise. For every required view, write a unique Chinese visible-content alt description that distinguishes the actual view, for example a site plan from a sculptural detail or a mask's closed state from its open state. Cultural terminology must use current community names first; historical College Board labels may appear only as secondary search terms.

Every comparison must resolve to AP 1–166 and name its basis:

```json
{
  "targetId": "ap6-anthropomorphic-stele",
  "basis": "Compare how durable material and stylized form establish sacred presence in distinct ritual landscapes."
}
```

Use cross-unit targets when they materially improve recall; do not force every U5 work to compare only within U5.

- [ ] **Step 6: Document source policy**

Append to `docs/art-history-sources.md`:

```markdown
## Unit 5 · Indigenous Americas

- Identity authority: current College Board AP Art History CED, AP 153-166.
- View-level audit: `docs/data-sources/u5-source-ledger.md`.
- Rights projection: `data/ap-art-history-unit-5-rights.json`.
- Canonical study projection: `tests/fixtures/u5-canonical.json`.
- Rights-restricted images are absent from Git and are not covered by the public release claim.
- Community terminology and culturally sensitive interpretation are reviewed against named Indigenous-community, museum, preservation, and scholarly sources recorded in the ledger.
```

- [ ] **Step 7: Run focused tests**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-u5-canonical.test.mjs tests/art-history-preservation.test.mjs
```

Expected: all U5 manifest, canonical, source, rights, media, study, and U1–U4 preservation tests PASS with 14 works and 27 views.

- [ ] **Step 8: Commit**

```bash
git add data/ap-art-history-unit-5-rights.json \
  data/ap-art-history-unit-5-placeholder-authority.json \
  docs/data-sources/u5-source-ledger.md docs/art-history-sources.md \
  tests/fixtures/u5-canonical.json tests/art-history-u5-canonical.test.mjs
git commit -m "docs: audit AP Art History Unit 5 sources"
```

If the audit has zero restricted views, omit the placeholder-authority path from `git add`; the test must assert that the file is absent and that all 27 image URLs are release-ready.

---

### Task 3: Extend Strict Data Validation from AP 1–152 to AP 1–166

**Files:**
- Modify: `scripts/validate-art-history-data.mjs`
- Modify: `tests/art-history-data.test.mjs`

- [ ] **Step 1: Write failing validator cases**

Build an in-memory AP 1–166 fixture from live AP 1–152 plus `u5-canonical.json`. Assert:

```js
assert.deepEqual(artworks.map((work) => work.apNumber),
  Array.from({ length: 166 }, (_, index) => index + 1));
assert.equal(artworks.filter((work) => work.unit === 5).length, 14);
assert.equal(artworks.filter((work) => work.unit === 5)
  .flatMap((work) => work.media).length, 27);
```

Add exact failing mutations for missing AP 153, extra AP 167, duplicate AP 166, manifest title mismatch, invalid U5 region, invalid tradition, reordered media, unknown restricted key, non-null restricted image, missing `mediaStatus`, missing rights key, credit mismatch, malformed HTTPS URL, and unresolved comparison.

- [ ] **Step 2: Run the validator tests and confirm RED**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-data.test.mjs
```

Expected: new AP 153–166 assertions FAIL because the validator still accepts only 152 works and knows no U5 manifest/rights contract.

- [ ] **Step 3: Generalize the validator**

Load all active unit authorities explicitly:

```js
const ACTIVE_MANIFESTS = Object.freeze([
  ['U1', 'data/ap-art-history-unit-1-manifest.json'],
  ['U2', 'data/ap-art-history-unit-2-manifest.json'],
  ['U3', 'data/ap-art-history-unit-3-manifest.json'],
  ['U4', 'data/ap-art-history-unit-4-manifest.json'],
  ['U5', 'data/ap-art-history-unit-5-manifest.json'],
]);

const EXPECTED_ARTWORK_COUNT = 166;
const EXPECTED_LAST_AP_NUMBER = 166;
```

Do not weaken U1–U4 exceptions. Add a U5 validator that checks manifest parity, ordered views, creation-context metadata, rights/credit/media alignment, exact placeholder authority parity, unique alt text, study completeness, and comparison resolution against the full AP 1–166 ID set.

- [ ] **Step 4: Run validator tests**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-data.test.mjs tests/art-history-u5-canonical.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/validate-art-history-data.mjs tests/art-history-data.test.mjs
git commit -m "test: validate AP Art History Units 1-5"
```

---

### Task 4: Import the 14 Canonical U5 Records into the Live Map

**Files:**
- Modify: `art-history-map.html`
- Modify: `tests/art-history-u5-canonical.test.mjs`
- Modify: `tests/art-history-preservation.test.mjs`

- [ ] **Step 1: Add the failing live-projection test**

Parse `#artwork-data` and `#image-credit-data`, then assert:

```js
const liveU5 = liveArtworks.filter((work) => work.unit === 5);
assert.deepEqual(liveU5, canonicalU5);
assert.deepEqual(
  Object.fromEntries(liveU5.map((work) => [work.id, liveCredits[work.id]])),
  canonicalCredits,
);
assert.equal(liveArtworks.length, 166);
```

Re-run the existing U1–U4 field-for-field preservation assertion in the same test process.

- [ ] **Step 2: Run RED**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-u5-canonical.test.mjs tests/art-history-preservation.test.mjs
```

Expected: FAIL because live `art-history-map.html` contains only AP 1–152.

- [ ] **Step 3: Import canonical JSON and credits**

Append the 14 canonical objects without reformatting the preceding 152 objects. Add one credit object or ordered credit array per work, matching the rights audit exactly. Do not copy test-only review fields into the runtime schema.

- [ ] **Step 4: Run focused tests and strict validator**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-u5-canonical.test.mjs tests/art-history-preservation.test.mjs
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/validate-art-history-data.mjs art-history-map.html
```

Expected: focused tests PASS and validator prints a successful 166-work validation.

- [ ] **Step 5: Commit**

```bash
git add art-history-map.html tests/art-history-u5-canonical.test.mjs \
  tests/art-history-preservation.test.mjs
git commit -m "feat: import AP Art History Unit 5"
```

---

### Task 5: Generalize Public Placeholders and Private Media into Unit-Scoped Bundles

**Files:**
- Modify: `art-history-map.html`
- Modify: `tests/art-history-details.test.mjs`
- Modify: `scripts/verify-art-history-browser.mjs`

- [ ] **Step 1: Write failing multi-bundle loader tests**

Test public mode, U4-only private mode, U5-only private mode, both bundles, invalid U5 key, U4 key in the U5 bundle, path traversal, wrong extension, malformed HTTPS rights URL, script error, timeout, and a missing local image. Freeze this bundle description shape:

```js
const PRIVATE_MEDIA_BUNDLES = Object.freeze([
  Object.freeze({
    unit: 4,
    scriptPath: '.private-media/u4/overrides.js',
    pathPattern: /^\.private-media\/u4\/[a-z0-9-]+\.(?:jpe?g|png|webp)$/,
    keys: U4_PRIVATE_MEDIA_KEYS,
  }),
  Object.freeze({
    unit: 5,
    scriptPath: '.private-media/u5/overrides.js',
    pathPattern: /^\.private-media\/u5\/[a-z0-9-]+\.(?:jpe?g|png|webp)$/,
    keys: U5_PRIVATE_MEDIA_KEYS,
  }),
]);
```

The U5 key list must equal the literal keys frozen by Task 2's placeholder authority. If no U5 views are restricted, keep no U5 script descriptor and assert that no U5 private request occurs.

- [ ] **Step 2: Run RED**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-details.test.mjs
```

Expected: new U5/multi-bundle tests FAIL because the runtime loads only `.private-media/u4/overrides.js`.

- [ ] **Step 3: Implement a backward-compatible loader**

Replace the singleton loader with unit-scoped validation and merge:

```js
function validatePrivateMediaOverrides(value, bundle) {
  if (value == null) return Object.freeze({});
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`U${bundle.unit} private media overrides must be an object`);
  }
  const result = {};
  for (const [identity, entry] of Object.entries(value)) {
    if (!bundle.keys.includes(identity)) throw new TypeError(`Unapproved U${bundle.unit} private media key: ${identity}`);
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new TypeError(`${identity}: private override must be an object`);
    assertExactPrivateFields(entry, identity);
    if (!bundle.pathPattern.test(entry.filePath)) throw new TypeError(`${identity}.filePath: invalid private path`);
    assertHttpsUrl(entry.rightsUrl, `${identity}.rightsUrl`);
    result[identity] = Object.freeze({ ...entry });
  }
  return Object.freeze(result);
}

async function loadPrivateMediaOverrides() {
  if (!PRIVATE_MEDIA_MODE) return Object.freeze({});
  const loaded = await Promise.all(PRIVATE_MEDIA_BUNDLES.map(loadPrivateBundle));
  return Object.freeze(Object.assign({}, ...loaded));
}
```

Each script writes to a unit-specific global (`AP_ART_HISTORY_PRIVATE_MEDIA_U4`, `AP_ART_HISTORY_PRIVATE_MEDIA_U5`) so one load cannot overwrite the other. Preserve U4 behavior and convert the existing U4 local file to the U4 global only inside the ignored local bundle in Task 10.

- [ ] **Step 4: Preserve placeholder presentation**

Public restricted views make no image request and keep the existing full-height exhibition placeholder. Private views use `object-fit: contain`, the normal view switcher/modal/keyboard controls, a local-use credit, and the existing focus restoration. A failed private file reverts to the public placeholder instead of a broken image.

- [ ] **Step 5: Run focused tests**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-details.test.mjs tests/art-history-u5-canonical.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add art-history-map.html tests/art-history-details.test.mjs \
  scripts/verify-art-history-browser.mjs
git commit -m "feat: support Unit 5 private media bundles"
```

---

### Task 6: Add U5 Regions, Tradition Filters, Search, and Comparisons

**Files:**
- Modify: `art-history-map.html`
- Modify: `tests/art-history-ui-numbering.test.mjs`
- Modify: `tests/art-history-details.test.mjs`

- [ ] **Step 1: Write failing hierarchy and filter tests**

Freeze these labels:

```js
const U5_REGION_LABELS = Object.freeze({
  mesoamerica: 'Mesoamerica',
  centralAndes: 'Central Andes',
  ancestralPueblo: 'Ancestral Pueblo',
  easternWoodlands: 'Eastern Woodlands',
  northwestCoast: 'Northwest Coast',
  plainsGreatBasin: 'Plains & Great Basin',
});

const U5_TRADITIONS = Object.freeze([
  'Ancient Mesoamerica',
  'Ancient Central Andes',
  'Ancient North America',
  'Native North America',
]);
```

Assert the hierarchy `U5 -> region -> creation-context site -> official AP-number marker`, compact AP ranges, English `piece/pieces`, and no current-museum grouping. Assert that selecting U5 regenerates period/type options, shows exactly four tradition pills, resets incompatible filters, and fits visible markers.

Add search cases for `153`, `Lanzón`, `Coyolxauhqui`, `Saqsa Waman`, `T'oqapu`, `Kwakwaka'wakw`, `Cotsiogo`, `Maria and Julian Martinez`, and reviewed Chinese terms. Add one within-U5 and one cross-unit comparison test, including filter clearing and focus restoration.

- [ ] **Step 2: Run RED**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
```

Expected: U5 hierarchy, labels, filters, search, and comparison assertions FAIL.

- [ ] **Step 3: Add U5 configuration**

Add the six region labels and four tradition labels to the existing shared constants; do not create a second filter implementation. Continue to use `work.traditionGroup ?? work.culture` for compatibility. Derive visible period/type options from the filtered unit data.

- [ ] **Step 4: Preserve interaction behavior**

Use the current marker visual sizes, 44px touch targets on narrow screens, keyboard activation, selected marker state, detail-panel focus, comparison focus restoration, and responsive detail layout. Do not add a timeline or new permanent toolbar row.

- [ ] **Step 5: Run focused tests**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add art-history-map.html tests/art-history-ui-numbering.test.mjs \
  tests/art-history-details.test.mjs
git commit -m "feat: add Unit 5 map hierarchy and study tools"
```

---

### Task 7: Update Homepage Copy and Private-Mode Query Propagation

**Files:**
- Modify: `index.html`
- Modify: `tests/homepage-art-integration.test.mjs`

- [ ] **Step 1: Write failing homepage tests**

Assert the art-history card and embedded state report Units 1–5 and 166 works, while the World History card, iframe geometry, fonts, and navigation remain unchanged. Assert query propagation:

```js
assert.equal(buildArtHistoryUrl(''), 'art-history-map.html');
assert.equal(buildArtHistoryUrl('?privateMedia=1'), 'art-history-map.html?privateMedia=1');
assert.equal(buildArtHistoryUrl('?privateMedia=0'), 'art-history-map.html');
```

- [ ] **Step 2: Run RED**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/homepage-art-integration.test.mjs
```

Expected: FAIL on the Units 1–5/166-work copy.

- [ ] **Step 3: Update only art-history copy**

Change the visible counts and labels to the exact approved values. Preserve the iframe `src` by default and append only `privateMedia=1` when the parent URL opts in. Do not forward unrelated query parameters.

- [ ] **Step 4: Run tests**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/homepage-art-integration.test.mjs tests/art-history-preservation.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html tests/homepage-art-integration.test.mjs
git commit -m "feat: embed AP Art History Units 1-5"
```

---

### Task 8: Add the Complete U5 Browser Fixture and Rendered Matrix

**Files:**
- Create: `tests/fixtures/u5-browser.json`
- Modify: `scripts/verify-art-history-browser.mjs`
- Modify: `tests/art-history-browser-verifier.test.mjs`

- [ ] **Step 1: Generate and freeze the browser projection**

For each AP 153–166 record include:

```json
{
  "id": "ap153-chavin-huantar",
  "apNumber": 153,
  "unit": 5,
  "region": "centralAndes",
  "siteName": "Chavín de Huántar, Ancash, Peru",
  "traditionGroup": "Ancient Central Andes",
  "viewIds": ["plan", "lanzon-stela", "relief-sculpture", "nose-ornament"]
}
```

The fixture must project directly from canonical data and contain 14 entries and 27 view IDs.

- [ ] **Step 2: Write failing verifier-unit tests**

Add assertions for U5 fixture loading, 166-work expected total, unit/region/site branches, every view control, public restricted-request suppression, optional U5 private overrides, and preservation of U4 private overrides. Add mutations for a missing work, missing view, duplicate key, invalid region branch, public restricted request, cross-unit private override, console error, horizontal overflow, and lost focus.

- [ ] **Step 3: Run RED**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-browser-verifier.test.mjs
```

Expected: new U5 verifier cases FAIL.

- [ ] **Step 4: Extend the rendered matrix**

Traverse standalone and homepage-embedded pages at desktop and narrow touch widths. For every U5 work:

1. select U5, its region, and its site;
2. open the official AP-number marker;
3. assert English title then Chinese subtitle;
4. switch through every ordered view;
5. open and close the image modal where an image exists;
6. exercise Overview, Form, Context, and Compare tabs;
7. follow a comparison and verify focus restoration;
8. assert no console/page error and no horizontal overflow.

Run public mode for all views. If Task 2 froze restricted U5 keys, run a private-mode route with mocked unit-specific scripts and local images, then assert every approved override and every missing-file fallback.

- [ ] **Step 5: Run verifier tests and rendered browser matrix**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-browser-verifier.test.mjs
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/verify-art-history-browser.mjs
```

Expected: PASS. If local sandbox policy blocks `127.0.0.1` listening, rerun the same browser command with approved local-listen escalation; do not weaken or skip the matrix.

- [ ] **Step 6: Commit**

```bash
git add tests/fixtures/u5-browser.json scripts/verify-art-history-browser.mjs \
  tests/art-history-browser-verifier.test.mjs
git commit -m "test: verify AP Art History Unit 5 in browser"
```

---

### Task 9: Extend Private-Leak Guards and Run the Full Release Gate

**Files:**
- Modify: `scripts/verify-art-history-private-leaks.mjs`
- Modify: `scripts/verify-art-history-release.mjs`
- Modify: `tests/art-history-browser-verifier.test.mjs`

- [ ] **Step 1: Write failing leak and release-order tests**

Assert that the release guard rejects:

- any tracked `.private-media/u4/` or `.private-media/u5/` file;
- any `/Users/`, `/home/`, `file://`, or Windows drive path in tracked release files;
- any restricted direct URL recorded during the U5 audit, represented in the guard only by a SHA-256 digest;
- any public `imageUrl` for a frozen U5 restricted key;
- any mismatch between U5 placeholder authority and runtime private key allowlists.

Assert release order remains:

```js
const expectedStages = [
  'Node test suite',
  'strict 166-work Units 1-5 validator',
  'private-media leak guard',
  'rendered browser matrix',
];
```

- [ ] **Step 2: Run RED**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-browser-verifier.test.mjs
```

Expected: FAIL because the guard/release labels and U5 authorities are not wired.

- [ ] **Step 3: Implement the U5 leak checks**

Load the U5 placeholder authority when present, compare its keys with the runtime/test allowlists, scan Git-tracked files, and compare URL digests without storing restricted URLs in the repository. Keep U4 hashes and checks unchanged.

- [ ] **Step 4: Run the complete release gate**

```bash
git diff --check
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/verify-art-history-release.mjs
```

Expected:

- every Node test PASS;
- strict validator reports 166 works / Units 1–5;
- private-media leak guard PASS;
- rendered standalone and embedded browser matrix PASS;
- `world-map.html` and U1–U4 preservation PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-art-history-private-leaks.mjs \
  scripts/verify-art-history-release.mjs \
  tests/art-history-browser-verifier.test.mjs
git commit -m "test: verify complete AP Art History Unit 5"
```

---

### Task 10: Build the Ignored Local U5 Bundle and Prepare Delivery

**Files:**
- Create ignored: `.private-media/u5/overrides.js`
- Create ignored: `.private-media/u5/*.{jpg,jpeg,png,webp}`
- Modify ignored when needed: `.private-media/u4/overrides.js`
- Verify tracked: all U5 delivery files

- [ ] **Step 1: Create only audited local overrides**

If Task 2 froze restricted U5 keys, create exactly one local entry per approved key:

Generate the ignored script from the frozen authority, then inspect every generated entry before using it:

```js
const localOverrides = Object.fromEntries(
  Object.entries(placeholderAuthority).map(([identity, authority]) => [
    identity,
    Object.freeze({
      filePath: `.private-media/u5/${identity.replace('::', '-')}.jpg`,
      creatorOrInstitution: authority.imageSourceName,
      rightsNote: 'Private local study use only; not included in the public release.',
      rightsUrl: authority.imageSourceUrl,
    }),
  ]),
);
```

Serialize this object as `window.AP_ART_HISTORY_PRIVATE_MEDIA_U5 = Object.freeze(...)` in the ignored script. Do not create overrides for public views. If Task 2 found zero restricted U5 views, do not create the U5 directory or script.

- [ ] **Step 2: Update the ignored U4 global for multi-bundle compatibility**

Rename only the ignored script global from `AP_ART_HISTORY_PRIVATE_MEDIA` to `AP_ART_HISTORY_PRIVATE_MEDIA_U4`. Do not modify image files or tracked U4 authorities.

- [ ] **Step 3: Verify public and private modes locally**

Run the public release gate, then open both:

```text
http://127.0.0.1:4173/art-history-map.html
http://127.0.0.1:4173/art-history-map.html?privateMedia=1
```

Confirm public restricted views are placeholders without network image requests; private mode shows only valid U4/U5 local overrides; missing files fall back; all 27 U5 view controls remain usable.

- [ ] **Step 4: Audit Git boundaries**

```bash
git status --short
git ls-files '.private-media/**'
git diff --check
```

Expected: `git ls-files` prints nothing; no private file or machine-specific path appears in the tracked diff.

- [ ] **Step 5: Perform final independent reviews**

Use a specification reviewer to compare the entire branch against the approved design and this plan. After specification compliance passes, use a code-quality reviewer. Resolve every Critical or Important finding and rerun the full release gate.

- [ ] **Step 6: Commit final tracked fixes**

If review changes tracked files:

```bash
git add -u
git commit -m "fix: finalize AP Art History Unit 5"
```

Do not commit ignored private media. Do not push, merge, or copy to the Desktop checkout until the user explicitly approves that delivery action.

---

## Final Acceptance Checklist

- [ ] AP 153–166 are present exactly once; U5 has 14 works and 27 ordered views.
- [ ] Every identity and view matches the current College Board CED.
- [ ] Every claim and image has an audited authoritative source.
- [ ] Every public image has a truthful portable rights basis; every other view is an explicit placeholder.
- [ ] English titles lead; Chinese titles are secondary; typography and component geometry remain inherited from the approved map.
- [ ] Six U5 regions, four tradition groups, AP-number search, bilingual search, and comparisons work.
- [ ] Public/private modes are isolated; no restricted URL, private file, or absolute path is tracked.
- [ ] Homepage reports Units 1–5 / 166 works and preserves World History behavior.
- [ ] U1–U4 remain field-for-field unchanged and `world-map.html` remains unchanged.
- [ ] Full Node, strict-validation, leak-guard, and rendered-browser release gates pass.
- [ ] Branch remains unpushed/unmerged until explicit user approval.
