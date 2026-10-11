# AP Art History U6 Africa Fast-Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the complete AP Art History Unit 6 Africa set (AP #167–180, 14 works, 23 required views) to the bilingual map and create a complete reusable English Markdown edition.

**Architecture:** Extend the existing embedded `artwork-data` dataset and map configuration without adding a build system. Freeze Unit 6 identity and view order in one small manifest, keep a lightweight source ledger, use public HTTPS media only when reuse rights are clear, and use explicit placeholders otherwise. Validate Unit 6 independently while preserving the frozen Unit 1–5 projection.

**Tech Stack:** Static HTML/CSS/JavaScript, embedded JSON, Node.js `node:test`, existing data validator, existing Playwright browser verifier.

---

## File Map

**Create**

- `data/ap-art-history-unit-6-manifest.json` — exact AP identity, region, site, navigation group, and ordered view IDs.
- `docs/content/ap-art-history-unit-6-english.md` — complete English study edition for all 14 works.
- `docs/data-sources/u6-source-ledger.md` — lightweight factual and media source record for all 23 views.
- `tests/art-history-u6-content.test.mjs` — focused manifest, live-data, English-edition, media, comparison, and preservation tests.

**Modify**

- `art-history-map.html` — append 14 records and credits; add Unit 6 labels, filters, regions, coordinates, and Units 1–6 copy.
- `index.html` — change Art History scope copy from 166/Units 1–5 to 180/Units 1–6.
- `scripts/validate-art-history-data.mjs` — accept and strictly validate the Unit 6 manifest and lightweight placeholders.
- `scripts/verify-art-history-browser.mjs` — add a focused three-mode Unit 6 smoke traversal.
- `scripts/verify-art-history-release.mjs` — rename the strict validator stage to the 180-work Units 1–6 release.
- `tests/art-history-data.test.mjs` — preserve exact U1–U5 projection and expect the 180-work release.
- `tests/art-history-details.test.mjs` — update map scope copy and verify Unit 6 precise culture labels resolve.
- `tests/art-history-ui-numbering.test.mjs` — extend filter, region, hierarchy, coordinate, and count expectations through Unit 6.
- `tests/art-history-browser-verifier.test.mjs` — test the focused U6 verifier contract and CLI path.
- `tests/homepage-art-integration.test.mjs` — update homepage scope/count expectations.
- `tests/art-history-preservation.test.mjs` — keep U1–U5 and `world-map.html` preservation assertions explicit.

## Fixed Unit 6 Classification

Use exactly three map regions:

```js
{
  southernAfrica: { nameEn: 'Southern Africa', unitIds: [6] },
  westAfrica: { nameEn: 'West Africa', unitIds: [6] },
  centralAfrica: { nameEn: 'Central Africa', unitIds: [6] },
}
```

Use exactly four navigation groups:

```js
[
  'African Architecture',
  'Royal & Court Arts',
  'Performance & Masquerade',
  'Power, Memory & Ancestors',
]
```

Membership is fixed:

- African Architecture: AP 167, 168
- Royal & Court Arts: AP 169, 170, 171, 180
- Performance & Masquerade: AP 173, 174, 175, 178
- Power, Memory & Ancestors: AP 172, 176, 177, 179

---

### Task 1: Freeze the Official Unit 6 Manifest

**Files:**
- Create: `data/ap-art-history-unit-6-manifest.json`
- Create: `tests/art-history-u6-content.test.mjs`

- [ ] **Step 1: Write the failing manifest contract test**

Create `tests/art-history-u6-content.test.mjs` with imports and the exact official view contract:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const HTML_URL = new URL('../art-history-map.html', import.meta.url);
const MANIFEST_URL = new URL('../data/ap-art-history-unit-6-manifest.json', import.meta.url);
const ENGLISH_URL = new URL('../docs/content/ap-art-history-unit-6-english.md', import.meta.url);

const REQUIRED_VIEWS = new Map([
  [167, ['conical-tower', 'circular-wall']],
  [168, ['mosque', 'monday-market']],
  [169, ['wall-plaque', 'oba-context']],
  [170, ['golden-stool', 'stool-context']],
  [171, ['ndop', 'ruler-context']],
  [172, ['primary']],
  [173, ['primary']],
  [174, ['mask', 'performance-context']],
  [175, ['mask', 'performance-context']],
  [176, ['primary']],
  [177, ['memory-board', 'contextual']],
  [178, ['mask', 'performance-context']],
  [179, ['primary']],
  [180, ['primary']],
]);

test('Unit 6 manifest freezes AP 167-180 and all 23 ordered views', async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_URL, 'utf8'));
  assert.deepEqual(Object.keys(manifest).map(Number), [...REQUIRED_VIEWS.keys()]);
  assert.equal(Object.values(manifest).flatMap(({ requiredViewIds }) => requiredViewIds).length, 23);
  for (const [apNumber, expected] of REQUIRED_VIEWS) {
    assert.deepEqual(manifest[apNumber].requiredViewIds, expected, `AP ${apNumber}`);
  }
});
```

- [ ] **Step 2: Run the focused test and verify the missing-file failure**

Run:

```bash
node --test tests/art-history-u6-content.test.mjs
```

Expected: FAIL with `ENOENT` for `data/ap-art-history-unit-6-manifest.json`.

- [ ] **Step 3: Create the exact manifest**

Create the 14 ordered entries using this fixed identity table:

| AP | ID | Region | Site | Navigation group |
| ---: | --- | --- | --- | --- |
| 167 | `ap167-great-zimbabwe` | `southernAfrica` | `Great Zimbabwe, Masvingo Province, Zimbabwe` | `African Architecture` |
| 168 | `ap168-great-mosque-djenne` | `westAfrica` | `Djenné, Mali` | `African Architecture` |
| 169 | `ap169-wall-plaque-obas-palace` | `westAfrica` | `Benin City, Nigeria` | `Royal & Court Arts` |
| 170 | `ap170-sika-dwa-kofi` | `westAfrica` | `Kumasi, Ghana` | `Royal & Court Arts` |
| 171 | `ap171-ndop-king-mishe` | `centralAfrica` | `Mushenge, Democratic Republic of the Congo` | `Royal & Court Arts` |
| 172 | `ap172-nkisi-nkondi` | `centralAfrica` | `Kongo cultural region, Central Africa` | `Power, Memory & Ancestors` |
| 173 | `ap173-female-pwo-mask` | `centralAfrica` | `Chokwe cultural region, Angola and Democratic Republic of the Congo` | `Performance & Masquerade` |
| 174 | `ap174-portrait-mask-mblo` | `westAfrica` | `Baule cultural region, Côte d'Ivoire` | `Performance & Masquerade` |
| 175 | `ap175-bundu-mask` | `westAfrica` | `Sierra Leone and Liberia forest region` | `Performance & Masquerade` |
| 176 | `ap176-ikenga` | `westAfrica` | `Igbo cultural region, southeastern Nigeria` | `Power, Memory & Ancestors` |
| 177 | `ap177-lukasa-memory-board` | `centralAfrica` | `Luba cultural region, Democratic Republic of the Congo` | `Power, Memory & Ancestors` |
| 178 | `ap178-aka-elephant-mask` | `centralAfrica` | `Western Grassfields, Cameroon` | `Performance & Masquerade` |
| 179 | `ap179-reliquary-figure-byeri` | `centralAfrica` | `Fang cultural region, southern Cameroon` | `Power, Memory & Ancestors` |
| 180 | `ap180-veranda-post-olowe` | `westAfrica` | `Ise, Nigeria` | `Royal & Court Arts` |

Each manifest entry must use only:

```json
{
  "id": "ap167-great-zimbabwe",
  "titleEn": "Conical tower and circular wall of Great Zimbabwe",
  "region": "southernAfrica",
  "siteName": "Great Zimbabwe, Masvingo Province, Zimbabwe",
  "provenanceQualifier": null,
  "traditionGroup": "African Architecture",
  "requiredViewIds": ["conical-tower", "circular-wall"]
}
```

Portable works with regional rather than exact production sites must use a non-empty `provenanceQualifier`; AP 167, 168, 169, 170, 171, and 180 may use `null`.

- [ ] **Step 4: Run the focused test and verify it passes**

Run `node --test tests/art-history-u6-content.test.mjs`.

Expected: 1 test, 1 pass, 0 fail.

- [ ] **Step 5: Commit the manifest contract**

```bash
git add data/ap-art-history-unit-6-manifest.json tests/art-history-u6-content.test.mjs
git commit -m "test: freeze AP Art History Unit 6 scope"
```

---

### Task 2: Write the Source Ledger and Complete English Edition

**Files:**
- Create: `docs/data-sources/u6-source-ledger.md`
- Create: `docs/content/ap-art-history-unit-6-english.md`
- Modify: `tests/art-history-u6-content.test.mjs`

- [ ] **Step 1: Load the PDF workflow before inspecting supplied notes**

Invoke the `pdf:pdf` skill, then extract the relevant Unit 6 sections from:

- `/Users/tiffanyxu/Desktop/AP ARTHIS/APAH notes.pdf`
- `/Users/tiffanyxu/Desktop/AP ARTHIS/ textbook and notes/`

Use the current College Board CED as the authority for identity and required views. Use the supplied notes for exam emphasis, then confirm interpretive claims against museum, monument, cultural-institution, or Smarthistory pages.

- [ ] **Step 2: Add a failing English-edition structure test**

Append:

```js
test('Unit 6 English edition covers every work once with complete study sections', async () => {
  const source = await readFile(ENGLISH_URL, 'utf8');
  const headings = [...source.matchAll(/^## AP #(\d+) · /gm)].map((match) => Number(match[1]));
  assert.deepEqual(headings, [...REQUIRED_VIEWS.keys()]);
  for (const apNumber of headings) {
    const section = source.split(`## AP #${apNumber} · `)[1]?.split('\n## AP #')[0] ?? '';
    for (const heading of [
      '### Identification', '### Function', '### Content', '### Form',
      '### Context', '### Recognition Anchors', '### Comparisons', '### Required Views and Sources',
    ]) assert.match(section, new RegExp(`^${heading}$`, 'm'), `AP ${apNumber} ${heading}`);
  }
});
```

- [ ] **Step 3: Run the test and verify the English file is missing**

Run `node --test tests/art-history-u6-content.test.mjs`.

Expected: manifest test passes; English-edition test fails with `ENOENT`.

- [ ] **Step 4: Write the lightweight source ledger**

Create one row per required view with this exact header:

```markdown
| AP # | Work ID | View ID | Required-view description | Factual sources | Public image URL or placeholder | Source page | Creator/institution | Rights statement |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- |
```

Timebox media research: make one primary-source/Commons sweep per view. If no explicit reusable license is found, record `PLACEHOLDER — reusable image not yet verified` and continue. Do not create a private file or copy a restricted asset.

- [ ] **Step 5: Write the complete English edition**

For each AP #167–180, use the exact heading/section structure asserted above. `Identification` must state title, culture/community, date, artist/maker when known, material, type, and creation context. `Comparisons` must name at least one real AP #1–180 work and explain the basis. `Required Views and Sources` must enumerate every view ID from the manifest and mirror the ledger's public-image/placeholder state.

- [ ] **Step 6: Run the focused tests**

Run `node --test tests/art-history-u6-content.test.mjs`.

Expected: 2 tests, 2 pass, 0 fail.

- [ ] **Step 7: Commit the research artifacts**

```bash
git add docs/content/ap-art-history-unit-6-english.md docs/data-sources/u6-source-ledger.md tests/art-history-u6-content.test.mjs
git commit -m "docs: add AP Art History Unit 6 study content"
```

---

### Task 3: Import the Bilingual Unit 6 Records and Extend Validation

**Files:**
- Modify: `art-history-map.html`
- Modify: `scripts/validate-art-history-data.mjs`
- Modify: `tests/art-history-u6-content.test.mjs`
- Modify: `tests/art-history-data.test.mjs`

- [ ] **Step 1: Add failing live-data assertions**

Add a helper that parses `artwork-data`, then assert:

```js
test('live map imports 14 complete Unit 6 works and 23 ordered views', async () => {
  const html = await readFile(HTML_URL, 'utf8');
  const raw = html.match(/<script id="artwork-data" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(raw, 'missing artwork-data');
  const allWorks = JSON.parse(raw);
  const u6 = allWorks.filter(({ unit }) => unit === 6);
  assert.equal(allWorks.length, 180);
  assert.deepEqual(u6.map(({ apNumber }) => apNumber), [...REQUIRED_VIEWS.keys()]);
  assert.equal(u6.flatMap(({ images }) => images).length, 23);
  for (const work of u6) {
    assert.deepEqual(work.images.map(({ id }) => id), REQUIRED_VIEWS.get(work.apNumber));
    for (const field of ['titleEn', 'titleZh', 'culture', 'date', 'medium', 'function', 'form', 'content', 'context']) {
      assert.equal(typeof work[field], 'string', `AP ${work.apNumber} ${field}`);
      assert.ok(work[field].trim(), `AP ${work.apNumber} ${field}`);
    }
  }
});
```

Add a second test that every U6 media item has an HTTPS `imageSourceUrl`, and either an HTTPS `imageUrl` or `imageUrl: null` plus a non-empty `mediaStatus`.

- [ ] **Step 2: Run focused tests and verify the 166-versus-180 failure**

Run `node --test tests/art-history-u6-content.test.mjs`.

Expected: live-data test fails because Unit 6 records are absent and the total remains 166.

- [ ] **Step 3: Append the 14 bilingual records and matching credit entries**

Use the current U5 record schema exactly. Derive concise Chinese live-map study text from the approved English edition; retain necessary culture, technique, ritual, and performance terminology in English. For each work:

- use the manifest ID, region, site, navigation group, and ordered view IDs;
- include precise culture/community rather than `African`;
- use an accurate Chinese subtitle;
- include 2–4 recognition anchors;
- resolve at least one comparison ID against AP #1–180;
- map every ledger public image to its matching credit;
- map every unresolved view to `imageUrl: null` and a visible `mediaStatus`.

- [ ] **Step 4: Extend the strict validator only as far as Unit 6 requires**

Make these explicit changes:

```js
const ACTIVE_MANIFESTS = Object.freeze([
  ['U1', 'data/ap-art-history-unit-1-manifest.json'],
  ['U2', 'data/ap-art-history-unit-2-manifest.json'],
  ['U3', 'data/ap-art-history-unit-3-manifest.json'],
  ['U4', 'data/ap-art-history-unit-4-manifest.json'],
  ['U5', 'data/ap-art-history-unit-5-manifest.json'],
  ['U6', 'data/ap-art-history-unit-6-manifest.json'],
]);
const EXPECTED_ARTWORK_COUNT = 180;
const EXPECTED_LAST_AP_NUMBER = 180;
```

Add Unit 6 to `UNIT_RULES` with range 167–180 and the exact three regions. Read and parse manifest 6 in `loadAndValidate`. Allow a Unit 6 media placeholder only when `imageUrl === null`, `mediaStatus` is non-empty, and `imageSourceUrl` is HTTPS. Do not add Unit 6 to `AUDITED_RIGHTS_URLS`, `PLACEHOLDER_AUTHORITY_URLS`, or the private-media system.

- [ ] **Step 5: Preserve the first 166 records independently**

Update the existing U5 release test so it asserts:

```js
assert.equal(artworks.length, 180);
assert.deepEqual(artworks.slice(0, 166).map(({ apNumber }) => apNumber),
  Array.from({ length: 166 }, (_, index) => index + 1));
assertOrderedDeepEqual(
  artworks.filter(({ unit }) => unit === 5),
  unit5.artworks,
  '$.liveU5.artworks',
);
```

Keep every existing U5 credit and media assertion unchanged.

- [ ] **Step 6: Run focused data tests and validator**

Run:

```bash
node --test tests/art-history-u6-content.test.mjs tests/art-history-data.test.mjs
node scripts/validate-art-history-data.mjs art-history-map.html
```

Expected: both commands exit 0; validator prints `Validated 180 AP Art History works`.

- [ ] **Step 7: Commit the imported content**

```bash
git add art-history-map.html scripts/validate-art-history-data.mjs tests/art-history-u6-content.test.mjs tests/art-history-data.test.mjs
git commit -m "feat: import bilingual AP Art History Unit 6 content"
```

---

### Task 4: Add Unit 6 Filters, Regions, Sites, and Map Hierarchy

**Files:**
- Modify: `art-history-map.html`
- Modify: `tests/art-history-ui-numbering.test.mjs`
- Modify: `tests/art-history-details.test.mjs`

- [ ] **Step 1: Add failing configuration and hierarchy tests**

Extend the pure-function harness assertions to require:

```js
assert.deepEqual(UNIT_FILTER_CONFIG[6].cultureIds, [
  'African Architecture',
  'Royal & Court Arts',
  'Performance & Masquerade',
  'Power, Memory & Ancestors',
]);
assert.deepEqual(
  Object.keys(MAP_REGIONS).filter((id) => MAP_REGIONS[id].unitIds.includes(6)),
  ['southernAfrica', 'westAfrica', 'centralAfrica'],
);
```

Add a hierarchy assertion that Unit 6 renders region counts `1`, `7`, and `6`, then creation-context sites, then AP pins. Add a coordinate assertion covering every distinct Unit 6 `siteName`. Add a detail test that every Unit 6 `culture` resolves through `TRADITION_LABELS` without `undefined`.

- [ ] **Step 2: Run focused UI tests and verify they fail**

Run:

```bash
node --test tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
```

Expected: FAIL because Unit 6 has no filter config, region entries, labels, or reviewed coordinates.

- [ ] **Step 3: Add the four navigation labels and Unit 6 filter config**

Add frozen English/Chinese labels:

```js
'African Architecture': { labelEn: 'African Architecture', labelZh: '非洲建筑' },
'Royal & Court Arts': { labelEn: 'Royal & Court Arts', labelZh: '王权与宫廷艺术' },
'Performance & Masquerade': { labelEn: 'Performance & Masquerade', labelZh: '表演与假面传统' },
'Power, Memory & Ancestors': { labelEn: 'Power, Memory & Ancestors', labelZh: '力量、记忆与祖先' },
```

Add `UNIT_FILTER_CONFIG[6]` with those four IDs in that order.

- [ ] **Step 4: Add the three regions and exact site projections**

Append the fixed region objects from this plan. Add one `SITE_WORLD_COORDINATES` entry for every exact manifest `siteName`; use the existing 1600×800 world projection and keep regional anchors visually separated. Regional unknown-production sites must still have distinct stable coordinates so their site capsules do not collapse into a single marker.

- [ ] **Step 5: Run focused UI tests**

Run `node --test tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs`.

Expected: all tests pass with no `undefined` culture labels and no Unit 6 marker collision assertion.

- [ ] **Step 6: Commit map classification**

```bash
git add art-history-map.html tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
git commit -m "feat: add Unit 6 Africa map hierarchy"
```

---

### Task 5: Update Main-Page Integration and Preserve Earlier Units

**Files:**
- Modify: `art-history-map.html`
- Modify: `index.html`
- Modify: `scripts/verify-art-history-release.mjs`
- Modify: `tests/homepage-art-integration.test.mjs`
- Modify: `tests/art-history-preservation.test.mjs`
- Modify: `tests/art-history-ui-numbering.test.mjs`

- [ ] **Step 1: Change tests to the approved 180-work Units 1–6 copy**

Require these exact phrases:

```text
AP 艺术史互动地图 · Units 1-6
180 AP works · Units 1-6 · filter, compare and study
Explore all 180 AP works across Units 1-6
```

Update the Chinese subtitle and both map `aria-label` values to mention Units 1–6, all 180 works, and U6 Africa without removing the global distribution description. Rename the release stage label to `strict 180-work Units 1-6 validator`.

- [ ] **Step 2: Run integration tests and verify they fail on old copy**

Run:

```bash
node --test tests/homepage-art-integration.test.mjs tests/art-history-ui-numbering.test.mjs tests/art-history-preservation.test.mjs
```

Expected: copy/count assertions fail on `166` and `Units 1-5`; preservation checks remain green.

- [ ] **Step 3: Update the two HTML documents and release label**

Change only Art History scope/count/title/subtitle/accessible copy. Preserve all World History text, World iframe dimensions, subject-switching behavior, and `world-map.html` bytes.

- [ ] **Step 4: Re-run integration and preservation tests**

Run the same test command.

Expected: all tests pass; `world-map.html` preservation assertion remains green.

- [ ] **Step 5: Commit integration copy**

```bash
git add art-history-map.html index.html scripts/verify-art-history-release.mjs tests/homepage-art-integration.test.mjs tests/art-history-preservation.test.mjs tests/art-history-ui-numbering.test.mjs
git commit -m "feat: expose the 180-work Units 1-6 map"
```

---

### Task 6: Add the Lean Three-Mode Unit 6 Browser Smoke Test

**Files:**
- Modify: `scripts/verify-art-history-browser.mjs`
- Modify: `tests/art-history-browser-verifier.test.mjs`

- [ ] **Step 1: Write failing verifier-contract tests**

Require a focused exported runner and the exact matrix:

```js
export const U6_SMOKE_VIEWPORTS = Object.freeze([
  Object.freeze({ width: 1365, height: 768, mode: 'standalone' }),
  Object.freeze({ width: 390, height: 844, mode: 'standalone' }),
  Object.freeze({ width: 1024, height: 768, mode: 'embedded' }),
]);
```

The source-contract test must require `--u6-only`, `runFocusedU6Verification`, AP #167–180 traversal, all four tabs, all 23 view buttons, comparison navigation, `horizontalOverflow === 0`, no blocking console/page errors, and trigger-focus restoration after image-dialog close.

- [ ] **Step 2: Run the verifier unit tests and verify they fail**

Run `node --test tests/art-history-browser-verifier.test.mjs`.

Expected: FAIL because the Unit 6 matrix and runner are not defined.

- [ ] **Step 3: Implement the focused runner by reusing existing lifecycle helpers**

Add `runFocusedU6Verification()` using the existing `discoverPlaywright`, `discoverBrowser`, `startStaticServer`, and `runManagedVerification` functions. Do not duplicate server or browser-discovery code. In each matrix case:

1. Open standalone `art-history-map.html` or homepage `index.html` and select Art History for embedded mode.
2. Select Unit 6.
3. Verify three region capsules and their counts.
4. Traverse every Unit 6 work in numeric AP order.
5. Open all four study tabs.
6. Activate every required view control.
7. Follow one comparison and return.
8. Open/close the image dialog where a public image exists and confirm focus restoration.
9. Assert zero horizontal overflow and no collected blocking issues.

The CLI branch must run only this matrix when invoked with `--u6-only`; the normal release path continues to run the existing complete verifier.

- [ ] **Step 4: Run unit tests and focused browser smoke**

Run:

```bash
node --test tests/art-history-browser-verifier.test.mjs
node scripts/verify-art-history-browser.mjs --u6-only
```

Expected: unit tests pass; browser result contains `"kind":"u6-fourteen-works"`, three cases, 14 works per case, and exits 0.

- [ ] **Step 5: Commit browser coverage**

```bash
git add scripts/verify-art-history-browser.mjs tests/art-history-browser-verifier.test.mjs
git commit -m "test: add lean Unit 6 browser smoke coverage"
```

---

### Task 7: Run the Final Release Gate Once

**Files:**
- Verify all changed files

- [ ] **Step 1: Run focused Unit 6 tests**

```bash
node --test tests/art-history-u6-content.test.mjs
node scripts/validate-art-history-data.mjs art-history-map.html
node scripts/verify-art-history-browser.mjs --u6-only
```

Expected: focused tests pass; validator prints `Validated 180 AP Art History works`; browser smoke exits 0.

- [ ] **Step 2: Run the complete release verifier exactly once**

```bash
node scripts/verify-art-history-release.mjs
```

Expected stages:

```text
[release] Node test suite
[release] strict 180-work Units 1-6 validator
[release] private-media leak guard
[release] rendered browser matrix
Release verification passed.
```

- [ ] **Step 3: Verify repository cleanliness and private-media exclusion**

```bash
git diff --check
git ls-files '.private-media/**'
git status --short --branch
```

Expected: `git diff --check` has no output; no private-media file is tracked; the branch has no uncommitted files.

- [ ] **Step 4: Resolve any release-gate correction in its owning task**

If the release gate caused any file change, return to the task that owns that file, rerun that task's focused command, and commit with that task's exact `git add` list. Repeat Steps 1–3 until `git status --short` is empty. Do not create an empty or catch-all verification commit.

- [ ] **Step 5: Request code review before integration**

Invoke `superpowers:requesting-code-review`, resolve any Critical or Important findings, rerun the affected focused checks, then use `superpowers:finishing-a-development-branch` to present merge/PR/keep/discard options. Do not push without explicit user approval.
