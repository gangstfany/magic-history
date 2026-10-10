# AP Art History U1 Global Prehistory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add all 11 official AP Art History Unit 1 works to the existing map, producing a verified 47-work Units 1-2 experience with six-region map hierarchy, Stonehenge's two required views, and preserved U2 and World History behavior.

**Architecture:** Keep the current single-file Art History runtime and add a separate U1 manifest, source ledger, fixtures, and validation rules. Extend the existing Unit-to-region-to-site engine rather than creating a second map path. Normalize single- and multi-image records at the rendering boundary so all verified U2 records remain structurally unchanged while Stonehenge can expose two audited views.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js built-in test runner, JSON manifests and fixtures, Playwright-based local browser release verification.

---

## File Structure

### Create

- `data/ap-art-history-unit-1-manifest.json` - exact College Board AP #1-11 id/title contract.
- `docs/data-sources/u1-source-ledger.md` - 11 artwork research rows plus 12 audited media rows.
- `tests/fixtures/u1-canonical.json` - complete expected U1 artwork and credit snapshot.
- `tests/fixtures/u1-browser.json` - exact browser traversal contract for all 11 U1 works and 12 views.

### Modify

- `art-history-map.html` - U1 records, credits, Unit/filter configuration, six regions, site projections, media normalization, Stonehenge view selector, cross-Unit navigation, and general Units 1-2 copy.
- `index.html` - 47-work homepage caption.
- `scripts/validate-art-history-data.mjs` - combined U1/U2 manifests, exact AP #1-47 validation, per-Unit rules, and normalized media-credit validation.
- `scripts/verify-art-history-browser.mjs` - two-Unit hierarchy, U1 traversal, Stonehenge view switching, updated copy, and existing responsive matrix.
- `scripts/verify-art-history-release.mjs` - 47-work validator label.
- `tests/art-history-data.test.mjs` - exact U1 manifest, source ledger, media, comparison, and combined-dataset tests.
- `tests/art-history-details.test.mjs` - normalized media and Stonehenge interaction contracts.
- `tests/art-history-preservation.test.mjs` - keep every U2 record and credit field-for-field unchanged.
- `tests/art-history-ui-numbering.test.mjs` - U1 filter visibility, region counts, hierarchy labels, focus, and collision tests.
- `tests/art-history-browser-verifier.test.mjs` - U1 fixture and browser-gate structure tests.
- `tests/homepage-art-integration.test.mjs` - general standalone title and 47-work homepage caption.
- `docs/art-history-sources.md` - register the U1 official manifest and source ledger.

### Must not modify

- `world-map.html`
- `tests/fixtures/u2-corrected-and-imported.json`
- `tests/fixtures/u2-unaffected-legacy.json`
- `tests/fixtures/u2-imported-browser.json`

## Approved U1 Identity Table

| AP # | Stable id | Internal tradition id | Region id | Site label | World coordinate | Work type | Initial comparison targets |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | `ap1-apollo-11-stones` | `prehistoricNamibia` | `africa` | `Apollo 11 Cave, Namibia` | `{ "x": 875, "y": 500 }` | `portable rock art` | AP 2, 4 |
| 2 | `ap2-great-hall-bulls` | `paleolithicEurope` | `europe` | `Lascaux, France` | `{ "x": 829, "y": 246 }` | `cave painting` | AP 1, 4, 24 |
| 3 | `ap3-camelid-sacrum-canine` | `prehistoricCentralMexico` | `americas` | `Tequixquiac, central Mexico` | `{ "x": 405, "y": 380 }` | `carved bone` | AP 9, 10 |
| 4 | `ap4-running-horned-woman` | `saharanPrehistory` | `africa` | `Tassili n'Ajjer, Algeria` | `{ "x": 850, "y": 360 }` | `rock painting` | AP 1, 2, 24 |
| 5 | `ap5-beaker-ibex-motifs` | `prehistoricSusa` | `middleEast` | `Susa, Iran` | `{ "x": 1018, "y": 333 }` | `painted vessel` | AP 7, 16 |
| 6 | `ap6-anthropomorphic-stele` | `arabianPrehistory` | `middleEast` | `Arabian Peninsula` | `{ "x": 1010, "y": 410 }` | `anthropomorphic stele` | AP 7, 14 |
| 7 | `ap7-jade-cong` | `liangzhu` | `eastAsia` | `Liangzhu, China` | `{ "x": 1250, "y": 345 }` | `ritual jade` | AP 5, 16 |
| 8 | `ap8-stonehenge` | `neolithicEurope` | `europe` | `Wiltshire, UK` | `{ "x": 812, "y": 218 }` | `megalithic monument` | AP 17, 35 |
| 9 | `ap9-ambum-stone` | `papuaNewGuineaHighlands` | `oceania` | `Ambum Valley, Papua New Guinea` | `{ "x": 1410, "y": 515 }` | `carved stone object` | AP 3, 7 |
| 10 | `ap10-tlatilco-female-figurine` | `tlatilco` | `americas` | `Tlatilco, central Mexico` | `{ "x": 405, "y": 382 }` | `ceramic figurine` | AP 3, 14 |
| 11 | `ap11-terra-cotta-fragment` | `lapita` | `oceania` | `Reef Islands, Solomon Islands` | `{ "x": 1510, "y": 560 }` | `incised ceramic fragment` | AP 5, 10 |

Use these approved Chinese titles:

| AP # | Chinese title |
| ---: | --- |
| 1 | 阿波罗11号洞石板 |
| 2 | 公牛大厅 |
| 3 | 犬形骆驼科动物骶骨 |
| 4 | 奔跑的有角女性 |
| 5 | 羱羊纹饰杯 |
| 6 | 人形石碑 |
| 7 | 玉琮 |
| 8 | 巨石阵 |
| 9 | 安布姆石 |
| 10 | 特拉特尔科女性雕像 |
| 11 | 陶土残片 |

The implementation may refine a coordinate after checking it against the rendered map, but it must remain within the documented site or broad provenance and retain the exact region assignment above. AP #6 must include a qualifier explaining that the College Board provenance is broad and that the marker is approximate.

### Task 1: Freeze the Official U1 Manifest and Audited Source Ledger

**Files:**
- Create: `data/ap-art-history-unit-1-manifest.json`
- Create: `docs/data-sources/u1-source-ledger.md`
- Modify: `docs/art-history-sources.md`
- Modify: `tests/art-history-data.test.mjs`

- [ ] **Step 1: Write the failing exact-manifest test**

Add these constants and test to `tests/art-history-data.test.mjs`:

```js
const U1_MANIFEST_PATH = new URL('../data/ap-art-history-unit-1-manifest.json', import.meta.url);
const EXPECTED_U1_MANIFEST = [
  '1|ap1-apollo-11-stones|Apollo 11 stones',
  '2|ap2-great-hall-bulls|Great Hall of the Bulls',
  '3|ap3-camelid-sacrum-canine|Camelid sacrum in the shape of a canine',
  '4|ap4-running-horned-woman|Running horned woman',
  '5|ap5-beaker-ibex-motifs|Beaker with ibex motifs',
  '6|ap6-anthropomorphic-stele|Anthropomorphic stele',
  '7|ap7-jade-cong|Jade cong',
  '8|ap8-stonehenge|Stonehenge',
  '9|ap9-ambum-stone|The Ambum stone',
  '10|ap10-tlatilco-female-figurine|Tlatilco female figurine',
  '11|ap11-terra-cotta-fragment|Terra cotta fragment',
];

test('checked-in U1 manifest matches the official AP 1-11 sequence', async () => {
  const manifest = JSON.parse(await readFile(U1_MANIFEST_PATH, 'utf8'));
  assert.deepEqual(
    Object.entries(manifest).map(
      ([apNumber, { id, titleEn }]) => `${apNumber}|${id}|${titleEn}`,
    ),
    EXPECTED_U1_MANIFEST,
  );
});
```

- [ ] **Step 2: Run the test and verify it fails because the U1 manifest is absent**

Run:

```bash
node --test tests/art-history-data.test.mjs
```

Expected: FAIL with `ENOENT` for `data/ap-art-history-unit-1-manifest.json`.

- [ ] **Step 3: Create the exact U1 manifest**

Create `data/ap-art-history-unit-1-manifest.json`:

```json
{
  "1": { "id": "ap1-apollo-11-stones", "titleEn": "Apollo 11 stones" },
  "2": { "id": "ap2-great-hall-bulls", "titleEn": "Great Hall of the Bulls" },
  "3": { "id": "ap3-camelid-sacrum-canine", "titleEn": "Camelid sacrum in the shape of a canine" },
  "4": { "id": "ap4-running-horned-woman", "titleEn": "Running horned woman" },
  "5": { "id": "ap5-beaker-ibex-motifs", "titleEn": "Beaker with ibex motifs" },
  "6": { "id": "ap6-anthropomorphic-stele", "titleEn": "Anthropomorphic stele" },
  "7": { "id": "ap7-jade-cong", "titleEn": "Jade cong" },
  "8": { "id": "ap8-stonehenge", "titleEn": "Stonehenge" },
  "9": { "id": "ap9-ambum-stone", "titleEn": "The Ambum stone" },
  "10": { "id": "ap10-tlatilco-female-figurine", "titleEn": "Tlatilco female figurine" },
  "11": { "id": "ap11-terra-cotta-fragment", "titleEn": "Terra cotta fragment" }
}
```

- [ ] **Step 4: Research and complete the source ledger**

Create `docs/data-sources/u1-source-ledger.md` with:

1. One official identification row for each AP #1-11.
2. One media row for every single-image work.
3. Two media rows for AP #8, labelled `Aerial overview` and `Ground-level view`.
4. Exactly 12 media rows total.
5. Columns:

```markdown
| AP # | View | Official title | Identification source | Study source | Image URL | Source page | Creator/institution | License | License URL | Identity check |
```

For each row:

- Confirm the title, provenance, date, and medium against the current College Board CED.
- Use the user's `APAH notes.pdf`, `1.Prehistoric Art.pdf`, and Smarthistory Volume One for study content.
- Prefer the owning institution or heritage authority for the image.
- Otherwise use a Wikimedia Commons file page with an explicit source or license trail.
- Open the direct image and source page; confirm that the media shows the exact AP work and required view.
- Write a concrete `Identity check` such as `aerial view shows full circular bank, ditch, and trilithon plan`; do not write `verified`, `looks correct`, or another non-specific statement.
- Finish all 12 rows before proceeding. Do not leave blank cells or provisional links.

Use the runtime labels `Primary view` for AP #1-7 and #9-11, `Aerial overview` for the first AP #8 row, and `Ground-level view` for the second AP #8 row.

- [ ] **Step 5: Register the U1 sources**

Add to `docs/art-history-sources.md`:

```markdown
## Unit 1: Global Prehistory

- Official AP #1-11 contract: `data/ap-art-history-unit-1-manifest.json`
- Audited identification, study, image, creator, and license ledger:
  `docs/data-sources/u1-source-ledger.md`
- College Board authority: current AP Art History Course and Exam Description,
  Unit 1, Global Prehistory, AP #1-11
```

- [ ] **Step 6: Run the manifest test**

Run:

```bash
node --test tests/art-history-data.test.mjs
```

Expected: the new U1 manifest test passes; existing U2 tests remain unchanged.

- [ ] **Step 7: Commit the manifest and source contract**

```bash
git add data/ap-art-history-unit-1-manifest.json docs/data-sources/u1-source-ledger.md docs/art-history-sources.md tests/art-history-data.test.mjs
git commit -m "docs: audit AP Art History Unit 1 sources"
```

### Task 2: Generalize Strict Validation from U2 to Units 1-2

**Files:**
- Modify: `scripts/validate-art-history-data.mjs`
- Modify: `tests/art-history-data.test.mjs`

- [ ] **Step 1: Write failing combined-manifest and media-count tests**

Add `normalizeArtworkMedia` to the existing validator import in `tests/art-history-data.test.mjs`, then add:

```js
import {
  loadAndValidate,
  normalizeArtworkMedia,
  validateArtworks,
} from '../scripts/validate-art-history-data.mjs';

test('validator requires the exact AP 1-47 combined keyset', async () => {
  const artworks = await loadAndValidate();
  assert.equal(artworks.length, 47);
  assert.deepEqual(
    artworks.map(({ apNumber }) => apNumber),
    Array.from({ length: 47 }, (_, index) => index + 1),
  );
});

test('U1 requires one image per work except two Stonehenge views', async () => {
  const { artworks, credits } = await loadDocumentData();
  const u1 = artworks.filter(({ unit }) => unit === 1);
  assert.equal(u1.length, 11);

  for (const work of u1) {
    const media = normalizeArtworkMedia(work);
    assert.equal(media.length, work.apNumber === 8 ? 2 : 1);
    const workCredits = Array.isArray(credits[work.id]) ? credits[work.id] : [credits[work.id]];
    assert.equal(workCredits.length, media.length);
  }
});
```

Export `normalizeArtworkMedia` from the validator in the implementation step below.

- [ ] **Step 2: Run the tests and verify the old 36-work validator fails**

Run:

```bash
node --test tests/art-history-data.test.mjs
```

Expected: FAIL because the validator still loads only the U2 manifest and requires exactly 36 works.

- [ ] **Step 3: Replace the single-manifest constants with per-Unit contracts**

Use:

```js
const MANIFEST_PATHS = Object.freeze({
  1: new URL('../data/ap-art-history-unit-1-manifest.json', import.meta.url),
  2: new URL('../data/ap-art-history-unit-2-manifest.json', import.meta.url),
});

const UNIT_RULES = Object.freeze({
  1: Object.freeze({
    start: 1,
    end: 11,
    count: 11,
    regions: new Set(['africa', 'europe', 'americas', 'middleEast', 'eastAsia', 'oceania']),
  }),
  2: Object.freeze({
    start: 12,
    end: 47,
    count: 36,
    regions: new Set(['middleEast', 'northAfrica', 'southernEurope']),
  }),
});

const OFFICIAL_AP_NUMBERS = Array.from({ length: 47 }, (_, index) => index + 1);
```

- [ ] **Step 4: Update test manifest helpers before changing validator signatures**

In `tests/art-history-data.test.mjs`, keep the existing U2-specific helper for exact U2 manifest assertions and add a combined helper:

```js
const U2_MANIFEST_PATH = new URL('../data/ap-art-history-unit-2-manifest.json', import.meta.url);

async function loadManifests() {
  const [u1, u2] = await Promise.all([
    readFile(U1_MANIFEST_PATH, 'utf8').then(JSON.parse),
    readFile(U2_MANIFEST_PATH, 'utf8').then(JSON.parse),
  ]);
  return { 1: u1, 2: u2 };
}
```

Update every direct `validateArtworks(artworks, manifest)` negative-control call to pass `{ 1: u1Manifest, 2: modifiedU2Manifest }` or `{ 1: modifiedU1Manifest, 2: u2Manifest }`, depending on the case being tested. Preserve exact U2 keyset tests, and add equivalent missing/extra/non-numeric U1 keyset cases.

- [ ] **Step 5: Add one media normalizer shared by validation tests**

Implement and export:

```js
export function normalizeArtworkMedia(work) {
  if (Array.isArray(work.images)) {
    return work.images.map((image) => ({
      label: image.label,
      imageUrl: image.imageUrl,
      imageAlt: image.imageAlt,
      imageSourceName: image.imageSourceName,
      imageSourceUrl: image.imageSourceUrl,
    }));
  }
  return [{
    label: 'Primary view',
    imageUrl: work.imageUrl,
    imageAlt: work.imageAlt,
    imageSourceName: work.imageSourceName,
    imageSourceUrl: work.imageSourceUrl,
  }];
}
```

Remove the four legacy image fields from the unconditional `REQUIRED_FIELDS` list and validate the media shape separately:

```js
const LEGACY_IMAGE_FIELDS = [
  'imageUrl',
  'imageAlt',
  'imageSourceName',
  'imageSourceUrl',
];

function validateArtworkMediaShape(artwork, label) {
  if (Array.isArray(artwork.images)) {
    if (artwork.images.length === 0) fail(`${label}.images must not be empty`);
    return;
  }
  for (const field of LEGACY_IMAGE_FIELDS) {
    if (typeof artwork[field] !== 'string' || artwork[field].trim() === '') {
      fail(`${label}.${field} must be a non-empty string`);
    }
  }
}
```

Call `validateArtworkMediaShape` before `normalizeArtworkMedia`. Keep every other current required field unchanged.

- [ ] **Step 6: Validate the exact two-Unit sequence and per-Unit rules**

Refactor `validateArtworks` to:

```js
export function validateArtworks(artworks, manifests) {
  if (!Array.isArray(artworks)) fail('top-level JSON must be an array');
  for (const [unitId, rule] of Object.entries(UNIT_RULES)) {
    const expectedKeys = Array.from(
      { length: rule.count },
      (_, index) => String(rule.start + index),
    );
    const actualKeys = Object.keys(manifests?.[unitId] || {});
    if (
      actualKeys.length !== expectedKeys.length
      || actualKeys.some((key, index) => key !== expectedKeys[index])
    ) {
      fail(`official Unit ${unitId} manifest must contain exactly ${expectedKeys.join(', ')}`);
    }
  }
  if (artworks.length !== 47) {
    fail(`official Units 1-2 manifests require exactly 47 works; received ${artworks.length}`);
  }

  const ids = new Set();
  const apNumbers = new Set();
  artworks.forEach((artwork, index) => {
    const expectedApNumber = index + 1;
    if (artwork.apNumber !== expectedApNumber) {
      fail(`official manifest order requires AP ${expectedApNumber} at entry ${index}`);
    }
    const rule = UNIT_RULES[artwork.unit];
    if (!rule) fail(`${artwork.id}.unit must be 1 or 2`);
    if (artwork.apNumber < rule.start || artwork.apNumber > rule.end) {
      fail(`${artwork.id}.apNumber is outside Unit ${artwork.unit}`);
    }
    if (!rule.regions.has(artwork.region)) {
      fail(`${artwork.id}.region is invalid for Unit ${artwork.unit}`);
    }
    const expected = manifests[artwork.unit][String(artwork.apNumber)];
    if (!expected) fail(`${artwork.id}.apNumber is absent from its official manifest`);
    if (artwork.id !== expected.id || artwork.titleEn !== expected.titleEn) {
      fail(`AP ${artwork.apNumber} does not match its official id and title`);
    }
    if (ids.has(artwork.id)) fail(`duplicate id ${artwork.id}`);
    if (apNumbers.has(artwork.apNumber)) fail(`duplicate AP number ${artwork.apNumber}`);
    ids.add(artwork.id);
    apNumbers.add(artwork.apNumber);
    const media = normalizeArtworkMedia(artwork);
    const expectedMediaCount = artwork.unit === 1 && artwork.apNumber === 8 ? 2 : 1;
    if (media.length !== expectedMediaCount) {
      fail(`${artwork.id} requires exactly ${expectedMediaCount} image view(s)`);
    }
    if (new Set(media.map(({ imageUrl }) => imageUrl)).size !== media.length) {
      fail(`${artwork.id} image views must use distinct URLs`);
    }
    media.forEach((image, imageIndex) => {
      for (const field of ['label', 'imageUrl', 'imageAlt', 'imageSourceName', 'imageSourceUrl']) {
        if (typeof image[field] !== 'string' || image[field].trim() === '') {
          fail(`${artwork.id} image ${imageIndex + 1}.${field} must be a non-empty string`);
        }
      }
      if (!isHttpUrl(image.imageUrl) || !isHttpUrl(image.imageSourceUrl)) {
        fail(`${artwork.id} image ${imageIndex + 1} URLs must be HTTP(S)`);
      }
    });
  });

  if (!OFFICIAL_AP_NUMBERS.every((apNumber) => apNumbers.has(apNumber))) {
    fail('artwork data must contain every AP number 1..47 exactly once');
  }
  for (const artwork of artworks) {
    for (const comparisonId of artwork.comparisonIds) {
      if (!ids.has(comparisonId)) fail(`${artwork.id} comparison target ${comparisonId} is unknown`);
    }
  }
  return artworks;
}
```

Retain the current required-field, string, array, coordinate, and URL checks around this logic. Expand coordinate bounds to the actual SVG viewBox: x `0..1600`, y `0..800`.

- [ ] **Step 7: Normalize image credit validation**

Keep U2 credit objects valid. Permit an image-credit array only when a work has multiple media items:

```js
function normalizeImageCredits(credit) {
  return Array.isArray(credit) ? credit : [credit];
}

function assertExactKeys(object, expectedKeys, label) {
  const actualKeys = Object.keys(object || {}).sort();
  const sortedExpected = [...expectedKeys].sort();
  if (
    actualKeys.length !== sortedExpected.length
    || actualKeys.some((key, index) => key !== sortedExpected[index])
  ) {
    fail(`${label} must match artwork ids exactly`);
  }
}

export function validateImageCredits(credits, artworks) {
  const artworkIds = artworks.map(({ id }) => id).sort();
  assertExactKeys(credits, artworkIds, 'image credit ids');

  for (const work of artworks) {
    const media = normalizeArtworkMedia(work);
    const workCredits = normalizeImageCredits(credits[work.id]);
    if (workCredits.length !== media.length) {
      fail(`${work.id} must have one credit for each image`);
    }
    workCredits.forEach((credit, index) => {
      for (const field of ['creatorOrInstitution', 'licenseName', 'licenseUrl']) {
        if (typeof credit[field] !== 'string' || credit[field].trim() === '') {
          fail(`${work.id} image credit ${index + 1}.${field} must be non-empty`);
        }
      }
      if (!isHttpsUrl(credit.licenseUrl)) {
        fail(`${work.id} image credit ${index + 1}.licenseUrl must be HTTPS`);
      }
    });
  }
  return credits;
}
```

Use this internal key-comparison helper instead of importing `assert`, so CLI failures retain the current `Invalid artwork data:` prefix.

- [ ] **Step 8: Load both manifests and preserve CLI behavior**

Update `loadAndValidate`:

```js
const [html, u1Source, u2Source] = await Promise.all([
  readFile(htmlPath, 'utf8'),
  readFile(MANIFEST_PATHS[1], 'utf8'),
  readFile(MANIFEST_PATHS[2], 'utf8'),
]);
const manifests = {
  1: JSON.parse(u1Source),
  2: JSON.parse(u2Source),
};
const artworks = validateArtworks(parseDataScript('artwork-data'), manifests);
validateImageCredits(parseDataScript('image-credit-data'), artworks);
return artworks;
```

- [ ] **Step 9: Run focused validator tests**

Run:

```bash
node --test tests/art-history-data.test.mjs
```

Expected: manifest-shape negative controls pass; dataset-count tests still fail only because the 11 U1 records are not imported yet.

- [ ] **Step 10: Commit the validator generalization**

```bash
git add scripts/validate-art-history-data.mjs tests/art-history-data.test.mjs
git commit -m "test: define strict Units 1-2 validation"
```

### Task 3: Import the 11 Complete U1 Study Records and Credits

**Files:**
- Create: `tests/fixtures/u1-canonical.json`
- Modify: `art-history-map.html:388-468`
- Modify: `tests/art-history-data.test.mjs`
- Modify: `tests/art-history-preservation.test.mjs`

- [ ] **Step 1: Create a failing canonical U1 fixture test**

Add:

```js
const U1_CANONICAL_PATH = new URL('./fixtures/u1-canonical.json', import.meta.url);

test('live U1 records and credits match the reviewed canonical fixture', async () => {
  const [{ artworks, credits }, fixture] = await Promise.all([
    loadDocumentData(),
    readFile(U1_CANONICAL_PATH, 'utf8').then(JSON.parse),
  ]);
  assert.deepEqual(
    artworks.filter(({ unit }) => unit === 1),
    fixture.artworks,
  );
  assert.deepEqual(
    Object.fromEntries(fixture.artworks.map(({ id }) => [id, credits[id]])),
    fixture.credits,
  );
});
```

- [ ] **Step 2: Run the test and verify the fixture is absent**

Run:

```bash
node --test tests/art-history-data.test.mjs
```

Expected: FAIL with `ENOENT` for `tests/fixtures/u1-canonical.json`.

- [ ] **Step 3: Build the complete canonical fixture from the completed source ledger**

Create `tests/fixtures/u1-canonical.json` in one patch containing all 11 completed artwork objects and all 11 credit keys. Do not create or commit an empty scaffold.

Every artwork object must include the exact approved id, AP number, Unit `1`, tradition id, region, site, and coordinate from the Approved U1 Identity Table, plus:

- The exact Chinese title from the reviewed title table above
- Official period, date, and medium from the U1 manifest/source ledger
- A concrete `artistCulture` statement that does not invent an unknown maker
- A precise work type
- Chinese `function`, `form`, `content`, and `context`
- Three exam-useful recognition anchors
- The exact initial comparison targets from the table
- At least four bilingual search keywords
- The audited image metadata from the ledger

For AP #8, use the known identity fields below and copy the five media fields for each view directly from the completed `AP 8 / aerial` and `AP 8 / ground` ledger rows:

```json
{
  "id": "ap8-stonehenge",
  "apNumber": 8,
  "titleEn": "Stonehenge",
  "titleZh": "巨石阵",
  "unit": 1,
  "culture": "neolithicEurope",
  "region": "europe",
  "period": "Neolithic Europe",
  "date": "c. 2500-1600 B.C.E.",
  "artistCulture": "Neolithic communities in southern Britain",
  "siteName": "Wiltshire, UK",
  "coordinates": { "x": 812, "y": 218 },
  "medium": "Sandstone",
  "workType": "megalithic monument",
  "comparisonIds": ["ap17-great-pyramids-giza", "ap35-athenian-acropolis"]
}
```

The AP #8 `images` array must contain, in order:

1. `label: "Aerial overview"` plus `imageUrl`, `imageAlt`, `imageSourceName`, and `imageSourceUrl` copied exactly from the completed aerial ledger row. Use the approved alt text `巨石阵圆形土堤、沟渠与石构遗迹的完整空中视图`.
2. `label: "Ground-level view"` plus the same four fields copied exactly from the completed ground ledger row. Use the approved alt text `巨石阵立石、横梁与三石门结构的完整地面视图`.

The two AP #8 credit objects are copied in the same order from the corresponding ledger rows.

AP #6 must use:

```json
{
  "siteName": "Arabian Peninsula",
  "siteQualifier": "College Board provides a broad regional provenance; marker location is approximate",
  "coordinates": { "x": 1010, "y": 410 }
}
```

- [ ] **Step 4: Insert the canonical records and credits into the live HTML**

Insert the 11 fixture artwork objects before AP #12 in `artwork-data`, preserving AP #1-47 numeric order.

Insert the 11 fixture credit entries before AP #12 in `image-credit-data`. AP #8's value is a two-element array in the same order as its `images`; every other U1 value is one credit object.

Do not edit any AP #12-47 record or credit.

- [ ] **Step 5: Strengthen U2 preservation**

In `tests/art-history-preservation.test.mjs`, make the current U2 fixtures compare against:

```js
const liveU2 = artworks.filter(({ unit }) => unit === 2);
assert.equal(liveU2.length, 36);
assert.deepEqual(
  liveU2.map(({ apNumber }) => apNumber),
  Array.from({ length: 36 }, (_, index) => index + 12),
);
```

Retain the field-for-field legacy and corrected-record assertions, including all U2 credit objects.

- [ ] **Step 6: Match every U1 media item to the checked-in source ledger**

In `tests/art-history-preservation.test.mjs`, add:

```js
const U1_SOURCE_LEDGER_PATH = new URL(
  '../docs/data-sources/u1-source-ledger.md',
  import.meta.url,
);

test('U1 source ledger matches all 11 records and 12 media views', async () => {
  const [{ artworks, credits }, ledger] = await Promise.all([
    loadActualData(),
    readFile(U1_SOURCE_LEDGER_PATH, 'utf8'),
  ]);
  const u1 = artworks.filter(({ unit }) => unit === 1);
  const rows = parseLedger(ledger);
  assert.equal(u1.length, 11);
  assert.equal(rows.length, 12);
  assert.ok(rows.every((cells) => cells.length === 11));

  const expected = u1.flatMap((work) => {
    const media = Array.isArray(work.images)
      ? work.images
      : [{
          label: 'Primary view',
          imageUrl: work.imageUrl,
          imageAlt: work.imageAlt,
          imageSourceName: work.imageSourceName,
          imageSourceUrl: work.imageSourceUrl,
        }];
    const workCredits = Array.isArray(credits[work.id]) ? credits[work.id] : [credits[work.id]];
    return media.map((image, index) => ({
      work,
      image,
      credit: workCredits[index],
    }));
  });

  rows.forEach((cells, index) => {
    const { work, image, credit } = expected[index];
    const [
      apNumber,
      view,
      officialTitle,
      identificationSource,
      studySource,
      imageUrl,
      sourcePage,
      creator,
      license,
      licenseUrl,
      identityCheck,
    ] = cells;
    assert.equal(Number(apNumber), work.apNumber);
    assert.equal(view, image.label);
    assert.equal(officialTitle, work.titleEn);
    assert.match(identificationSource, /College Board.*CED/);
    assert.ok(studySource.length > 10);
    assert.equal(markdownLinkUrl(imageUrl), image.imageUrl);
    assert.equal(markdownLinkUrl(sourcePage), image.imageSourceUrl);
    assert.match(creator, new RegExp(credit.creatorOrInstitution.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.equal(license, credit.licenseName);
    assert.equal(markdownLinkUrl(licenseUrl), credit.licenseUrl);
    assert.ok(identityCheck.length > 20);
  });
});
```

Keep the ledger sorted by AP number and, for AP #8, `Aerial overview` before `Ground-level view`.

- [ ] **Step 7: Run data and preservation tests**

Run:

```bash
node --test tests/art-history-data.test.mjs tests/art-history-preservation.test.mjs
```

Expected: PASS, 47 works validated, and all U2 snapshots unchanged.

- [ ] **Step 8: Run the strict CLI validator**

Run:

```bash
node scripts/validate-art-history-data.mjs art-history-map.html
```

Expected:

```text
Validated 47 AP Art History works
```

- [ ] **Step 9: Commit the U1 records**

```bash
git add art-history-map.html tests/fixtures/u1-canonical.json tests/art-history-data.test.mjs tests/art-history-preservation.test.mjs
git commit -m "feat: import AP Art History Unit 1"
```

### Task 4: Add U1 Filter Configuration and Six-Region Hierarchy

**Files:**
- Modify: `art-history-map.html:471-760`
- Modify: `tests/art-history-ui-numbering.test.mjs`
- Modify: `tests/art-history-details.test.mjs`

- [ ] **Step 1: Write failing tradition-label and filter-visibility tests**

Add assertions:

```js
test('U1 defines labels without rendering culture pills', async () => {
  assert.match(html, /1:\s*Object\.freeze\(\{\s*showCultureFilters:\s*false/);
  assert.match(html, /2:\s*Object\.freeze\(\{\s*showCultureFilters:\s*true/);
  assert.match(html, /prehistoricNamibia:\s*Object\.freeze\(\{\s*labelEn:/);
  assert.match(html, /lapita:\s*Object\.freeze\(\{\s*labelEn:/);
  assert.match(
    html,
    /container\.hidden\s*=\s*!unitConfig\?\.showCultureFilters/,
  );
});

test('U1 region hierarchy has exact six-region counts', () => {
  const u1 = ARTWORKS.filter(({ unit }) => unit === 1);
  assert.deepEqual(
    Object.fromEntries(
      groupByConfiguredRegion(u1, 1).map((group) => [group.regionId, group.works.length]),
    ),
    { africa: 2, europe: 2, americas: 2, middleEast: 2, eastAsia: 1, oceania: 2 },
  );
});
```

- [ ] **Step 2: Run the tests and verify the current U2-only config fails**

Run:

```bash
node --test tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
```

Expected: FAIL because `CULTURES_BY_UNIT` conflates labels and visible filters and `MAP_REGIONS` contains only U2 regions.

- [ ] **Step 3: Separate tradition labels from visible filter configuration**

Replace `CULTURES_BY_UNIT` with:

```js
const TRADITION_LABELS = Object.freeze({
  prehistoricNamibia: Object.freeze({ labelEn: 'Prehistoric Namibia', labelZh: '史前纳米比亚' }),
  paleolithicEurope: Object.freeze({ labelEn: 'Paleolithic Europe', labelZh: '旧石器时代欧洲' }),
  prehistoricCentralMexico: Object.freeze({ labelEn: 'Prehistoric Central Mexico', labelZh: '史前墨西哥中部' }),
  saharanPrehistory: Object.freeze({ labelEn: 'Saharan Prehistory', labelZh: '史前撒哈拉' }),
  prehistoricSusa: Object.freeze({ labelEn: 'Prehistoric Susa', labelZh: '史前苏萨' }),
  arabianPrehistory: Object.freeze({ labelEn: 'Arabian Prehistory', labelZh: '史前阿拉伯半岛' }),
  liangzhu: Object.freeze({ labelEn: 'Liangzhu', labelZh: '良渚' }),
  neolithicEurope: Object.freeze({ labelEn: 'Neolithic Europe', labelZh: '新石器时代欧洲' }),
  papuaNewGuineaHighlands: Object.freeze({ labelEn: 'Papua New Guinea Highlands', labelZh: '巴布亚新几内亚高地' }),
  tlatilco: Object.freeze({ labelEn: 'Tlatilco', labelZh: '特拉特尔科' }),
  lapita: Object.freeze({ labelEn: 'Lapita', labelZh: '拉皮塔' }),
  ancientNearEast: Object.freeze({ labelEn: 'Ancient Near East', labelZh: '古代近东' }),
  egypt: Object.freeze({ labelEn: 'Egypt', labelZh: '埃及' }),
  greece: Object.freeze({ labelEn: 'Greece', labelZh: '希腊' }),
  etruscan: Object.freeze({ labelEn: 'Etruscan', labelZh: '伊特鲁里亚' }),
  rome: Object.freeze({ labelEn: 'Rome', labelZh: '罗马' }),
});

const UNIT_FILTER_CONFIG = Object.freeze({
  1: Object.freeze({ showCultureFilters: false, cultureIds: Object.freeze([]) }),
  2: Object.freeze({
    showCultureFilters: true,
    cultureIds: Object.freeze(['ancientNearEast', 'egypt', 'greece', 'etruscan', 'rome']),
  }),
});
```

Generate the `All cultures` button only for a Unit whose `showCultureFilters` is true.

Update `getCultureLabel`:

```js
function getCultureLabel(cultureId, locale = 'zh') {
  const tradition = TRADITION_LABELS[cultureId];
  if (!tradition) return cultureId;
  return locale === 'en' ? tradition.labelEn : tradition.labelZh;
}
```

- [ ] **Step 4: Add six U1 region definitions**

Extend `MAP_REGIONS`:

```js
const MAP_REGIONS = Object.freeze({
  africa: Object.freeze({ nameEn: 'Africa', unitIds: Object.freeze([1]) }),
  europe: Object.freeze({ nameEn: 'Europe', unitIds: Object.freeze([1]) }),
  americas: Object.freeze({ nameEn: 'Americas', unitIds: Object.freeze([1]) }),
  middleEast: Object.freeze({ nameEn: 'Middle East', unitIds: Object.freeze([1, 2]) }),
  eastAsia: Object.freeze({ nameEn: 'East Asia', unitIds: Object.freeze([1]) }),
  oceania: Object.freeze({ nameEn: 'Oceania', unitIds: Object.freeze([1]) }),
  northAfrica: Object.freeze({ nameEn: 'North Africa', unitIds: Object.freeze([2]) }),
  southernEurope: Object.freeze({ nameEn: 'Southern Europe', unitIds: Object.freeze([2]) }),
});
```

In `groupByConfiguredRegion`, reject regions not configured for the active Unit:

```js
const region = MAP_REGIONS[work.region];
if (work.unit !== unitId || !region?.unitIds.includes(unitId)) return;
```

When returning groups, filter `Object.keys(MAP_REGIONS)` using the same `unitIds.includes(unitId)` rule so U1 and U2 never show each other's empty region definitions.

- [ ] **Step 5: Add the 11 site world coordinates**

Add the exact site labels and coordinates from the Approved U1 Identity Table to `SITE_WORLD_COORDINATES`.

- [ ] **Step 6: Hide U1 culture filters without removing their labels**

Update `renderCultureFilters`:

```js
const unitId = state.unit === 'all' ? null : Number(state.unit);
const unitConfig = unitId ? UNIT_FILTER_CONFIG[unitId] : null;
container.hidden = !unitConfig?.showCultureFilters;
container.replaceChildren();
if (!unitConfig?.showCultureFilters) return;

const ids = ['all', ...unitConfig.cultureIds];
ids.forEach((cultureId) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'filter-pill';
  button.dataset.culture = cultureId;
  button.textContent = cultureId === 'all'
    ? 'All cultures'
    : TRADITION_LABELS[cultureId].labelEn;
  // Retain the current aria-pressed, focus-preserving click, and render behavior.
});
```

Copy the existing click-handler body without changing its focus-preserving behavior.

- [ ] **Step 7: Run hierarchy and detail tests**

Run:

```bash
node --test tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
```

Expected: PASS with U1 counts `2/2/2/2/1/2`, U1 culture filters hidden, and all six U2 culture buttons preserved.

- [ ] **Step 8: Commit the hierarchy**

```bash
git add art-history-map.html tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
git commit -m "feat: add Unit 1 map hierarchy"
```

### Task 5: Implement Stonehenge's Two-View Media Interface

**Files:**
- Modify: `art-history-map.html:1-160`
- Modify: `art-history-map.html:1600-1865`
- Modify: `tests/art-history-details.test.mjs`
- Modify: `tests/art-history-ui-numbering.test.mjs`

- [ ] **Step 1: Write failing media-normalization and view-switch tests**

Add:

```js
test('media normalization preserves legacy images and exposes Stonehenge views', () => {
  const legacy = { imageUrl: 'https://fixtures.invalid/a.jpg', imageAlt: 'A', imageSourceName: 'S', imageSourceUrl: 'https://fixtures.invalid/source' };
  assert.equal(getArtworkImages(legacy).length, 1);
  assert.equal(getArtworkImages({ images: [{ label: 'Aerial overview' }, { label: 'Ground-level view' }] }).length, 2);
});

test('Stonehenge view buttons update image and attribution together', async () => {
  assert.match(html, /className\s*=\s*'image-view-switcher'/);
  assert.match(html, /button\.setAttribute\('aria-pressed',\s*String\(active\)\)/);
  assert.match(html, /renderActiveArtworkImage\(mediaIndex\)/);
  assert.match(html, /openImageDialog\(work,\s*media,\s*credit,\s*imageButton\)/);
});
```

- [ ] **Step 2: Run focused tests and verify they fail**

Run:

```bash
node --test tests/art-history-details.test.mjs tests/art-history-ui-numbering.test.mjs
```

Expected: FAIL because the runtime still reads only `work.imageUrl` and one credit object.

- [ ] **Step 3: Add runtime media and credit normalizers**

Implement:

```js
function getArtworkImages(work) {
  if (Array.isArray(work.images)) return work.images;
  return [{
    label: 'Primary view',
    imageUrl: work.imageUrl,
    imageAlt: work.imageAlt,
    imageSourceName: work.imageSourceName,
    imageSourceUrl: work.imageSourceUrl,
  }];
}

function getArtworkImageCredits(work) {
  const credit = IMAGE_CREDITS[work.id];
  return Array.isArray(credit) ? credit : [credit];
}
```

- [ ] **Step 4: Make credit and dialog functions accept the active media item**

Use:

```js
function createImageCredit(media, credit) {
  const line = document.createElement('p');
  line.className = 'image-credit';
  line.append(document.createTextNode(`图片：${credit.creatorOrInstitution} · `));
  const license = document.createElement('a');
  license.href = credit.licenseUrl;
  license.target = '_blank';
  license.rel = 'noopener noreferrer';
  license.textContent = credit.licenseName;
  const source = document.createElement('a');
  source.href = media.imageSourceUrl;
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  source.textContent = ` · ${media.imageSourceName}`;
  line.append(license, source);
  return line;
}

function openImageDialog(work, media, credit, trigger) {
  imageDialogTrigger = trigger;
  const image = document.createElement('img');
  image.id = 'dialogImage';
  image.src = media.imageUrl;
  image.alt = media.imageAlt;
  installImageFallback(image, work);
  document.getElementById('dialogMedia').replaceChildren(image);
  document.getElementById('dialogTitle').textContent = `${work.titleEn} · ${work.titleZh}`;
  document.getElementById('dialogCaption').textContent = media.imageAlt;
  document.getElementById('dialogCredit').textContent = `图片：${credit.creatorOrInstitution}`;
  const license = document.getElementById('dialogLicense');
  license.href = credit.licenseUrl;
  license.textContent = `许可：${credit.licenseName}`;
  const source = document.getElementById('dialogSource');
  source.href = media.imageSourceUrl;
  source.textContent = `来源页：${media.imageSourceName}（查看原始文件）`;
  imageDialog.showModal();
  document.getElementById('dialogClose').focus();
}
```

- [ ] **Step 5: Render one image frame and optional view controls**

Inside `renderArtworkDetails`:

```js
const mediaItems = getArtworkImages(work);
const mediaCredits = getArtworkImageCredits(work);
let activeMediaIndex = 0;

const imageButton = document.createElement('button');
imageButton.type = 'button';
imageButton.className = 'artwork-image-button';
const imageCreditHost = document.createElement('div');
imageCreditHost.className = 'image-credit-host';

function renderActiveArtworkImage(mediaIndex) {
  activeMediaIndex = mediaIndex;
  const media = mediaItems[mediaIndex];
  const credit = mediaCredits[mediaIndex];
  const image = document.createElement('img');
  image.src = media.imageUrl;
  image.alt = media.imageAlt;
  installImageFallback(image, work);
  imageButton.setAttribute(
    'aria-label',
    `Open ${work.titleEn} ${media.label}（${work.titleZh}）大图`,
  );
  imageButton.replaceChildren(image);
  imageButton.onclick = () => openImageDialog(work, media, credit, imageButton);
  imageCreditHost.replaceChildren(createImageCredit(media, credit));
  viewSwitcher?.querySelectorAll('button').forEach((button, index) => {
    const active = index === mediaIndex;
    button.setAttribute('aria-pressed', String(active));
  });
}

let viewSwitcher = null;
if (mediaItems.length > 1) {
  viewSwitcher = document.createElement('div');
  viewSwitcher.className = 'image-view-switcher';
  viewSwitcher.setAttribute('role', 'group');
  viewSwitcher.setAttribute('aria-label', `${work.titleEn} image views`);
  mediaItems.forEach((media, mediaIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = media.label;
    button.addEventListener('click', () => renderActiveArtworkImage(mediaIndex));
    viewSwitcher.append(button);
  });
}
renderActiveArtworkImage(0);
```

Append `imageButton`, then `viewSwitcher` when present, then `imageCreditHost`. Every other work therefore keeps the existing one-frame presentation without empty controls.

- [ ] **Step 6: Add compact World History-aligned view-control styles**

Add:

```css
.image-view-switcher {
  display:flex;
  gap:6px;
  margin:8px 0 0;
}
.image-view-switcher button {
  min-height:30px;
  padding:5px 10px;
  border:1px solid var(--line);
  border-radius:999px;
  background:var(--paper);
  color:var(--ink-soft);
  font:inherit;
  font-size:12px;
  font-weight:600;
}
.image-view-switcher button[aria-pressed="true"] {
  background:var(--ink);
  border-color:var(--ink);
  color:white;
}
@media (max-width:520px) {
  .image-view-switcher button { min-height:44px; }
}
```

Reuse the existing `--paper`, `--ink-soft`, `--ink`, and `--line` custom properties so the control stays in the current World History-aligned palette.

- [ ] **Step 7: Run details and accessibility tests**

Run:

```bash
node --test tests/art-history-details.test.mjs tests/art-history-ui-numbering.test.mjs
```

Expected: PASS, including single-image U2 behavior, Stonehenge selected state, active media dialog, and trigger focus restoration.

- [ ] **Step 8: Commit the media interface**

```bash
git add art-history-map.html tests/art-history-details.test.mjs tests/art-history-ui-numbering.test.mjs
git commit -m "feat: add Stonehenge image views"
```

### Task 6: Generalize Page Copy and Cross-Unit Comparison Navigation

**Files:**
- Modify: `art-history-map.html:160-180`
- Modify: `art-history-map.html:1721-1742`
- Modify: `index.html`
- Modify: `tests/homepage-art-integration.test.mjs`
- Modify: `tests/art-history-details.test.mjs`

- [ ] **Step 1: Write failing copy and navigation tests**

Add:

```js
test('standalone Art copy describes the available Units 1-2 dataset', async () => {
  assert.match(artHtml, /<h1>AP 艺术史互动地图<\/h1>/);
  assert.doesNotMatch(artHtml, /Unit 2 古代地中海/);
  assert.match(artHtml, /Units 1-2/);
});

test('homepage caption reports 47 works across Units 1-2', async () => {
  const html = await loadHtml();
  assert.match(
    html,
    /\? '47 AP works · Units 1-2 · filter, compare and study'/,
  );
});

test('comparison navigation activates the target Unit', async () => {
  assert.match(html, /unit:\s*String\(target\.unit\)/);
  assert.match(html, /activeUnit:\s*target\.unit/);
  assert.match(html, /focusSelectedArtworkHeading\(\)/);
});
```

- [ ] **Step 2: Run focused tests and verify the U2-specific copy fails**

Run:

```bash
node --test tests/homepage-art-integration.test.mjs tests/art-history-details.test.mjs
```

Expected: FAIL on the old U2 heading, 36-work caption, and `unit:'all'` comparison state.

- [ ] **Step 3: Update standalone and map accessibility copy**

Use:

```html
<header class="page-header">
  <h1>AP 艺术史互动地图</h1>
  <p class="subtitle">Units 1-2：从全球史前艺术到古代地中海，以地点连接作品、传统与历史语境。</p>
</header>
```

Change the map section and SVG accessible labels from U2-specific geography to a complete-world label covering the current U1-U2 distribution.

- [ ] **Step 4: Update comparison state to the target Unit**

In `selectComparison`:

```js
Object.assign(state, {
  unit: String(target.unit),
  culture: 'all',
  period: '',
  workType: '',
  search: '',
  selectedId: target.id,
  selectedSiteIndex: 0,
  expandedSiteToken: null,
  activeUnit: target.unit,
  activeRegion: null,
  pendingFocusParentKey: null,
  activeDetailTab: 'quick',
});
```

Keep `syncFilterControls()`, `render()`, `focusSelectedArtworkHeading()`, and detail scroll behavior.

- [ ] **Step 5: Update the homepage caption**

Replace the Art caption with:

```js
'47 AP works · Units 1-2 · filter, compare and study'
```

- [ ] **Step 6: Run copy, integration, and detail tests**

Run:

```bash
node --test tests/homepage-art-integration.test.mjs tests/art-history-details.test.mjs
```

Expected: PASS; World History integration assertions remain unchanged.

- [ ] **Step 7: Commit the Units 1-2 integration**

```bash
git add art-history-map.html index.html tests/homepage-art-integration.test.mjs tests/art-history-details.test.mjs
git commit -m "feat: integrate Units 1-2 Art map"
```

### Task 7: Extend Browser Verification to All U1 Works and Both Stonehenge Views

**Files:**
- Create: `tests/fixtures/u1-browser.json`
- Modify: `scripts/verify-art-history-browser.mjs`
- Modify: `scripts/verify-art-history-release.mjs`
- Modify: `tests/art-history-browser-verifier.test.mjs`

- [ ] **Step 1: Write a failing browser-fixture contract test**

Add:

```js
const U1_BROWSER_FIXTURE = new URL('./fixtures/u1-browser.json', import.meta.url);

test('U1 browser fixture covers AP 1-11 and exactly 12 audited views', async () => {
  const works = JSON.parse(await readFile(U1_BROWSER_FIXTURE, 'utf8'));
  assert.deepEqual(works.map(({ apNumber }) => apNumber), Array.from({ length: 11 }, (_, i) => i + 1));
  assert.equal(
    works.reduce((total, work) => total + work.images.length, 0),
    12,
  );
  assert.equal(works.find(({ apNumber }) => apNumber === 8).images.length, 2);
  assert.ok(works.filter(({ apNumber }) => apNumber !== 8).every(({ images }) => images.length === 1));
});
```

- [ ] **Step 2: Run the test and verify the fixture is absent**

Run:

```bash
node --test tests/art-history-browser-verifier.test.mjs
```

Expected: FAIL with `ENOENT` for `tests/fixtures/u1-browser.json`.

- [ ] **Step 3: Create the exact U1 browser fixture**

Derive every value in `tests/fixtures/u1-browser.json` from `tests/fixtures/u1-canonical.json`. Add this independent projection to `tests/art-history-browser-verifier.test.mjs` and require the checked-in browser fixture to equal it:

```js
function projectBrowserFixture(canonical) {
  return canonical.artworks.map((work) => {
    const media = Array.isArray(work.images)
      ? work.images
      : [{
          label: 'Primary view',
          imageUrl: work.imageUrl,
          imageAlt: work.imageAlt,
          imageSourceName: work.imageSourceName,
          imageSourceUrl: work.imageSourceUrl,
        }];
    const credits = Array.isArray(canonical.credits[work.id])
      ? canonical.credits[work.id]
      : [canonical.credits[work.id]];
    return {
      apNumber: work.apNumber,
      id: work.id,
      titleEn: work.titleEn,
      titleZh: work.titleZh,
      images: media.map((image, index) => ({
        ...image,
        ...credits[index],
      })),
    };
  });
}

assert.deepEqual(browserFixture, projectBrowserFixture(canonical));
```

Create the JSON fixture in one patch with the projection's complete output. Do not hand-edit titles, URLs, alt text, sources, or credits independently.

- [ ] **Step 4: Load both U1 and existing U2 traversal fixtures**

Add:

```js
const U1_WORKS = Object.freeze(JSON.parse(
  await readFile(join(PROJECT_ROOT, 'tests', 'fixtures', 'u1-browser.json'), 'utf8'),
));
const NINE_IMPORTED_WORKS = Object.freeze(JSON.parse(
  await readFile(join(PROJECT_ROOT, 'tests', 'fixtures', 'u2-imported-browser.json'), 'utf8'),
));
```

Keep the existing U2 nine-work traversal unchanged.

- [ ] **Step 5: Update initial hierarchy and filter verification**

In standalone and embedded verification:

```js
const initial = await frame.locator('.site-marker[data-group-kind="unit"]').allTextContents();
assert.equal(initial.length, 2);
assert.ok(initial.some((text) => /U1Global Prehistory · 11 pieces/.test(text)));
assert.ok(initial.some((text) => /U2Ancient Mediterranean · 36 pieces/.test(text)));
```

In `assertKeyboardAndFilters`:

1. Select U1.
2. Assert result count `11`.
3. Assert `#cultureFilters` is hidden and contains zero buttons.
4. Activate U1 and assert the exact six region names and counts.
5. Select U2.
6. Run the existing six-culture checks unchanged.

- [ ] **Step 6: Add a deterministic U1 traversal**

Generalize the existing `resetAndActivateImportedWork` into `resetAndActivateWork`. The only dataset-count change is the reset assertion:

```js
async function resetAndActivateWork(page, frame, work) {
  const unitFilter = frame.locator('#unitFilter');
  const searchInput = frame.locator('#searchInput');
  const resultCount = frame.locator('.result-count');
  await fillSearchThroughUi(searchInput, '', `AP ${work.apNumber} reset search`);
  await unitFilter.selectOption('all');
  assert.equal((await resultCount.textContent()).trim(), '当前显示 47 件作品');
  await frame.locator('#resetView').click();
  assert.equal((await resultCount.textContent()).trim(), '当前显示 47 件作品');

  await fillSearchThroughUi(searchInput, work.titleEn, `AP ${work.apNumber} exact search`);
  assert.equal((await resultCount.textContent()).trim(), '当前显示 1 件作品');

  const unit = frame.locator('.site-marker[data-group-kind="unit"]');
  assert.equal(await unit.count(), 1);
  await unit.focus();
  await page.keyboard.press('Enter');

  const region = frame.locator('.site-marker[data-group-kind="region"]');
  await region.waitFor();
  assert.equal(await region.count(), 1);
  await region.focus();
  await page.keyboard.press('Enter');

  const site = frame.locator('.site-marker[data-group-kind="site"]');
  await site.waitFor();
  assert.equal(await site.count(), 1);
  await site.focus();
  await page.keyboard.press('Space');

  const heading = frame.locator('[data-selected-artwork-title]');
  await heading.waitFor();
  assert.equal((await heading.textContent()).trim(), work.titleEn);
}
```

Use this helper for the existing U2 nine-work traversal as well as the new U1 traversal. Then implement `verifyU1Works`:

```js
async function verifyU1Works(page, frame, imageRequests, mode) {
  const results = [];
  for (const work of U1_WORKS) {
    imageRequests.clear();
    await resetAndActivateWork(page, frame, work);

    const heading = frame.locator('[data-selected-artwork-title]');
    assert.equal((await heading.textContent()).trim(), work.titleEn);
    assert.equal(
      (await frame.locator('.work-title-zh').textContent()).trim(),
      work.titleZh,
    );

    const viewButtons = frame.locator('.image-view-switcher button');
    assert.equal(await viewButtons.count(), work.images.length === 2 ? 2 : 0);
    for (let imageIndex = 0; imageIndex < work.images.length; imageIndex += 1) {
      if (work.images.length === 2) await viewButtons.nth(imageIndex).click();
      const expected = work.images[imageIndex];
      const image = frame.locator('.artwork-image-button img');
      await image.waitFor();
      assert.equal(await image.getAttribute('src'), expected.imageUrl);
      assert.equal(await image.getAttribute('alt'), expected.imageAlt);
      assert.match(await frame.locator('.image-credit-host').textContent(), expected.licenseName);
      await frame.locator('.artwork-image-button').click();
      assert.equal(await frame.locator('#dialogImage').getAttribute('src'), expected.imageUrl);
      assert.equal(await frame.locator('#dialogImage').getAttribute('alt'), expected.imageAlt);
      assert.equal(await frame.locator('#dialogSource').getAttribute('href'), expected.imageSourceUrl);
      await frame.locator('#dialogClose').click();
      assert.equal(
        await frame.evaluate(() => document.activeElement?.className),
        'artwork-image-button',
      );
      assert.equal(imageRequests.get(expected.imageUrl), 1);
    }
    results.push({ apNumber: work.apNumber, mode });
  }
  return results;
}
```

Use a `Map<string, number>` for U1 image request counts. Increment it in the existing remote-image route callback.

- [ ] **Step 7: Run U1 traversal in standalone and embedded modes**

Add two cases to `runVerification`:

```js
const u1Standalone = await verifyU1Standalone(browser, server.baseUrl);
const u1Embedded = await verifyU1Embedded(browser, server.baseUrl);
cases.push({
  kind: 'u1-eleven-works',
  standalone: u1Standalone,
  embedded: u1Embedded,
});
```

Both helpers install remote-image mocks, collect warnings/errors, call `verifyU1Works`, and assert an empty error list, following the existing U2 traversal lifecycle.

- [ ] **Step 8: Update general copy assertions and release label**

Use:

```js
assert.equal(
  (await page.locator('.page-header h1').textContent()).trim(),
  'AP 艺术史互动地图',
);
```

Use the exact 47-work homepage caption. In `scripts/verify-art-history-release.mjs`, rename the validation step:

```js
[
  'strict 47-work Units 1-2 validator',
  ['scripts/validate-art-history-data.mjs', 'art-history-map.html'],
],
```

- [ ] **Step 9: Run browser-verifier structure tests**

Run:

```bash
node --test tests/art-history-browser-verifier.test.mjs
```

Expected: PASS with exact U1 fixture coverage, two-view Stonehenge checks, warning rejection, and lifecycle cleanup.

- [ ] **Step 10: Run the real browser verifier**

Run:

```bash
node scripts/verify-art-history-browser.mjs
```

Expected:

- `"ok": true`
- all required and boundary viewport cases
- no console warnings or errors
- `u1-eleven-works` with 11 standalone and 11 embedded results
- 12 exact U1 image URLs requested once per traversal context
- existing U2 nine-work traversal still passing

- [ ] **Step 11: Commit browser verification**

```bash
git add tests/fixtures/u1-browser.json scripts/verify-art-history-browser.mjs scripts/verify-art-history-release.mjs tests/art-history-browser-verifier.test.mjs
git commit -m "test: verify complete Art History Unit 1"
```

### Task 8: Full Release Gate, Review, Desktop Sync, and Branch Finish

**Files:**
- Modify only if a test exposes a defect: files already listed in Tasks 1-7
- Sync after verification: `index.html`, `art-history-map.html`, `data/`, `docs/art-history-sources.md`, `docs/data-sources/`, `scripts/`, and `tests/`
- Do not sync: `.git`, `.superpowers`, `.worktrees`, or temporary PDF renders

- [ ] **Step 1: Run the entire Node test suite**

Run:

```bash
node --test tests/*.test.mjs
```

Expected: all tests pass with zero failures, skips, or cancellations.

- [ ] **Step 2: Run the strict combined validator**

Run:

```bash
node scripts/validate-art-history-data.mjs art-history-map.html
```

Expected:

```text
Validated 47 AP Art History works
```

- [ ] **Step 3: Run the complete release verifier**

Run:

```bash
node scripts/verify-art-history-release.mjs
```

Expected final line:

```text
Release verification passed.
```

- [ ] **Step 4: Run a placeholder and source-ledger audit**

Run:

```bash
rg -n "TBD|TODO|FIXME|PLACEHOLDER|PENDING_SOURCE|example\\.com|insert URL|source needed" \
  art-history-map.html \
  data/ap-art-history-unit-1-manifest.json \
  docs/data-sources/u1-source-ledger.md \
  tests/fixtures/u1-canonical.json \
  tests/fixtures/u1-browser.json
```

Expected: no output.

Run:

```bash
git diff --check
```

Expected: no output and exit code 0.

- [ ] **Step 5: Request two-stage code review**

Use `superpowers:requesting-code-review`:

1. Review spec compliance against `docs/superpowers/specs/2026-07-27-u1-global-prehistory-design.md`.
2. Review code quality, data accuracy, source consistency, accessibility, and responsive behavior.
3. Fix every Critical or Important issue with a failing regression test first.
4. Re-run Steps 1-4 after any fix.

- [ ] **Step 6: Verify the branch is clean and record the final commit**

Run:

```bash
git status --short
git rev-parse HEAD
```

Expected: no status output followed by one commit SHA.

- [ ] **Step 7: Back up and sync the Desktop delivery copy**

Before overwriting `/Users/tiffanyxu/Desktop/APWH/考前冲刺_地区专题_试做版`, create:

```text
/Users/tiffanyxu/Desktop/APWH/考前冲刺_地区专题_试做版/.codex-backups/u1-sync-YYYYMMDD-HHMMSS/
```

Copy every existing destination file that will be overwritten into the backup using the same relative path. Then copy only the verified runtime, data, source, script, and test files. Do not delete unrelated Desktop files.

- [ ] **Step 8: Verify the Desktop copy independently**

From the Desktop delivery directory run:

```bash
node scripts/verify-art-history-release.mjs
```

Expected final line:

```text
Release verification passed.
```

- [ ] **Step 9: Compare development and Desktop hashes**

Compute SHA-256 for every synced file in both locations. Expected: zero mismatches.

- [ ] **Step 10: Open the final homepage preview**

Serve the Desktop delivery directory at `http://127.0.0.1:4173/`, open:

```text
http://127.0.0.1:4173/index.html
```

Select Art History and confirm the visible default map contains:

- `U1 · Global Prehistory · 11 pieces`
- `U2 · Ancient Mediterranean · 36 pieces`
- `47 AP works · Units 1-2 · filter, compare and study`

Leave only the final deliverable preview marked for handoff.

- [ ] **Step 11: Finish the development branch**

Use `superpowers:finishing-a-development-branch`. Present the four branch choices before merge, push, retention, or discard. Do not infer the user's choice.

## Plan Self-Review Results

- Spec coverage: every approved requirement maps to Tasks 1-8.
- Isolation: U1 manifest, source ledger, and fixtures are independent from U2 preservation fixtures.
- Schema consistency: runtime and validator both normalize `images` and credit arrays while preserving legacy single-image fields and credit objects.
- Filter consistency: tradition label resolution and culture-pill visibility are separate.
- Hierarchy consistency: U1 and U2 share one Unit-to-region-to-site engine with per-Unit region membership.
- Responsive coverage: the current required and boundary viewport matrices remain mandatory.
- Safety: Desktop backup, independent verification, hash comparison, and user-selected branch finish remain required.
- Placeholder policy: temporary quoted ledger references are explicitly rejected by the final placeholder audit and cannot be committed in the completed implementation.
