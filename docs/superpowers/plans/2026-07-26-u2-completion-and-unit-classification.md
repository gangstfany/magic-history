# U2 Completion and Unit Classification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete AP Art History Unit 2 to all 36 required works and add a scalable College Board Unit/culture filtering and map hierarchy without changing the approved typography or World History integration.

**Architecture:** Keep the self-contained `art-history-map.html` architecture. Add centralized Unit, culture, and region configuration beside the existing artwork JSON; migrate the legacy `civilization` filter to a normalized `culture` field; reuse the existing collision-safe marker layout for Unit-to-region-to-site refinement. Extend the validator and Node tests before each implementation slice, then browser-verify the embedded and standalone pages.

**Tech Stack:** Static HTML/CSS/JavaScript, inline JSON datasets, SVG map markers, Node.js built-in test runner, local HTTP preview.

---

## File Structure

- Modify `art-history-map.html`
  - Add nine artwork records and image credits.
  - Add Unit/culture/region configuration.
  - Replace civilization-only controls with Unit and dynamic culture controls.
  - Add English hierarchy labels and scalable Unit/region/site rendering.
  - Preserve the approved typography and responsive CSS.
- Modify `scripts/validate-art-history-data.mjs`
  - Validate Unit, culture, region, exact U2 range, images, comparisons, and coordinates.
- Modify `tests/art-history-data.test.mjs`
  - Lock the complete AP 12-47 manifest and exact nine-record addition.
- Modify `tests/art-history-details.test.mjs`
  - Lock single-image attribution and preserve the original 27 works.
- Modify `tests/art-history-ui-numbering.test.mjs`
  - Test Unit configuration, dynamic filtering, English labels, hierarchy, typography, and responsive behavior.
- Modify `tests/homepage-art-integration.test.mjs`
  - Confirm the expanded toolbar still embeds without changing World History.
- Create `docs/data-sources/u2-missing-works.md`
  - Record the identifying-information and image source used for each added work.

Use this Node executable in all commands:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
```

### Task 1: Lock the official Unit and culture model

**Files:**
- Modify: `tests/art-history-data.test.mjs`
- Modify: `tests/art-history-ui-numbering.test.mjs`
- Modify: `scripts/validate-art-history-data.mjs`
- Modify: `art-history-map.html`

- [ ] **Step 1: Add a failing schema-migration test for the existing 27 works**

Keep the existing exact 27-work manifest until Task 3 imports the missing records. Add:

```js
test('existing records are normalized to the U2 culture and region model', async () => {
  const artworks = await loadAndValidate();
  assert.ok(artworks.every(({ unit }) => unit === 2));
  assert.ok(artworks.every(({ culture }) => typeof culture === 'string'));
  assert.ok(artworks.every(({ region }) => typeof region === 'string'));
});
```

- [ ] **Step 2: Add failing pure-function tests for official Unit boundaries**

In `tests/art-history-ui-numbering.test.mjs`, add:

```js
test('official AP Unit definitions preserve all 250 number boundaries', async () => {
  const html = await loadHtml();
  const { getApUnitNumber, getUnitById } = loadPureFunctions(
    html,
    ['getApUnitNumber', 'getUnitById'],
    ['const AP_UNITS ='],
  );

  const boundaries = [
    [1, 1], [11, 1], [12, 2], [47, 2], [48, 3], [98, 3],
    [99, 4], [152, 4], [153, 5], [166, 5], [167, 6], [180, 6],
    [181, 7], [191, 7], [192, 8], [212, 8], [213, 9], [223, 9],
    [224, 10], [250, 10],
  ];
  for (const [apNumber, expectedUnit] of boundaries) {
    assert.equal(getApUnitNumber(apNumber), expectedUnit);
  }
  assert.equal(getUnitById(2).nameEn, 'Ancient Mediterranean');
  assert.equal(getUnitById(2).requiredCount, 36);
});
```

- [ ] **Step 3: Run the focused tests and verify they fail**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/art-history-data.test.mjs tests/art-history-ui-numbering.test.mjs
```

Expected: failure because normalized Unit/culture/region metadata, `AP_UNITS`, `getUnitById()`, and the corrected Unit 6-9 boundaries are not implemented.

- [ ] **Step 4: Add centralized Unit, culture, and region configuration**

In `art-history-map.html`, add before `state`:

```js
const AP_UNITS = Object.freeze([
  { id:1, nameEn:'Global Prehistory', start:1, end:11, requiredCount:11 },
  { id:2, nameEn:'Ancient Mediterranean', start:12, end:47, requiredCount:36 },
  { id:3, nameEn:'Early Europe and Colonial Americas', start:48, end:98, requiredCount:51 },
  { id:4, nameEn:'Later Europe and Americas', start:99, end:152, requiredCount:54 },
  { id:5, nameEn:'Indigenous Americas', start:153, end:166, requiredCount:14 },
  { id:6, nameEn:'Africa', start:167, end:180, requiredCount:14 },
  { id:7, nameEn:'West and Central Asia', start:181, end:191, requiredCount:11 },
  { id:8, nameEn:'South, East, and Southeast Asia', start:192, end:212, requiredCount:21 },
  { id:9, nameEn:'The Pacific', start:213, end:223, requiredCount:11 },
  { id:10, nameEn:'Global Contemporary', start:224, end:250, requiredCount:27 },
]);

const CULTURES_BY_UNIT = Object.freeze({
  2: [
    { id:'all', labelEn:'All cultures' },
    { id:'ancientNearEast', labelEn:'Ancient Near East' },
    { id:'egypt', labelEn:'Egypt' },
    { id:'greece', labelEn:'Greece' },
    { id:'etruscan', labelEn:'Etruscan' },
    { id:'rome', labelEn:'Rome' },
  ],
});

const MAP_REGIONS = Object.freeze({
  middleEast: { nameEn:'Middle East' },
  northAfrica: { nameEn:'North Africa' },
  southernEurope: { nameEn:'Southern Europe' },
});

function getUnitById(unitId) {
  return AP_UNITS.find((unit) => unit.id === unitId) || null;
}

function getApUnitNumber(apNumber) {
  return AP_UNITS.find((unit) => (
    apNumber >= unit.start && apNumber <= unit.end
  ))?.id ?? null;
}
```

Remove the old hard-coded `limits` array from `getApUnitNumber()`.

- [ ] **Step 5: Extend the validator schema**

In `scripts/validate-art-history-data.mjs`:

```js
const REQUIRED_FIELDS = [
  'id', 'apNumber', 'titleEn', 'titleZh', 'unit', 'culture', 'region',
  'period', 'date', 'artistCulture', 'siteName', 'coordinates', 'medium',
  'workType', 'function', 'form', 'content', 'context', 'recognitionAnchors',
  'comparisonIds', 'imageUrl', 'imageAlt', 'imageSourceName',
  'imageSourceUrl', 'keywords',
];

const CULTURES = new Set([
  'ancientNearEast', 'egypt', 'greece', 'etruscan', 'rome',
]);
const REGIONS = new Set(['middleEast', 'northAfrica', 'southernEurope']);
```

Add validations:

```js
if (artwork.unit !== 2) {
  fail(`${label}.unit must be 2 for the current U2 dataset`);
}
if (artwork.apNumber < 12 || artwork.apNumber > 47) {
  fail(`${label}.apNumber must be inside the U2 range 12..47`);
}
if (!CULTURES.has(artwork.culture)) {
  fail(`${label}.culture is not a configured U2 culture`);
}
if (!REGIONS.has(artwork.region)) {
  fail(`${label}.region is not a configured map region`);
}
```

Remove `civilization` from required/string fields and remove `CIVILIZATIONS`.

- [ ] **Step 6: Add migration metadata to the existing 27 records**

For every existing artwork object in `artwork-data`:

```json
"unit": 2,
"culture": "egypt",
"region": "northAfrica"
```

Use these mappings:

- Existing Egypt works: `culture:"egypt"`, `region:"northAfrica"`.
- Existing Greece works: `culture:"greece"`, `region:"southernEurope"`.
- Existing Rome works: `culture:"rome"`, `region:"southernEurope"`.
- Remove the old `civilization` property only after all runtime references and tests migrate in Tasks 2-4.

- [ ] **Step 7: Run validator-focused tests**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/art-history-data.test.mjs
```

Expected: all Task 1 tests pass; the existing exact 27-work manifest remains locked until Task 3.

- [ ] **Step 8: Commit the model and validator slice**

```bash
git add art-history-map.html scripts/validate-art-history-data.mjs tests/art-history-data.test.mjs tests/art-history-ui-numbering.test.mjs
git commit -m "refactor: add official AP unit metadata"
```

### Task 2: Add the Unit toolbar and dynamic culture filters

**Files:**
- Modify: `art-history-map.html`
- Modify: `tests/art-history-ui-numbering.test.mjs`
- Modify: `tests/homepage-art-integration.test.mjs`

- [ ] **Step 1: Add failing toolbar and filter behavior tests**

Add to `tests/art-history-ui-numbering.test.mjs`:

```js
test('toolbar exposes one Unit selector and dynamic U2 culture choices', async () => {
  const html = await loadHtml();
  assert.match(html, /<select id="unitFilter"/);
  assert.match(html, /<div id="cultureFilters"[^>]*role="group"[^>]*aria-label="Culture"/);
  for (const label of [
    'All cultures', 'Ancient Near East', 'Egypt', 'Greece', 'Etruscan', 'Rome',
  ]) {
    assert.ok(html.includes(label), `missing ${label}`);
  }
  assert.doesNotMatch(html, /aria-label="文明"/);
  assert.doesNotMatch(html, />Dataset progress · U2 36\/36</);
});

test('Unit and culture filters combine with period type and bilingual search', async () => {
  const html = await loadHtml();
  const { normalize, filterWorks } = loadPureFunctions(
    html,
    ['normalize', 'filterWorks'],
  );
  const works = [
    {
      unit:2, culture:'ancientNearEast', period:'Sumerian', workType:'temple',
      titleEn:'White Temple', titleZh:'白庙', siteName:'Uruk',
      artistCulture:'Sumerian', keywords:['ziggurat'],
    },
    {
      unit:2, culture:'etruscan', period:'Archaic Etruscan', workType:'tomb',
      titleEn:'Tomb of the Triclinium', titleZh:'宴饮墓',
      siteName:'Tarquinia', artistCulture:'Etruscan', keywords:['fresco'],
    },
  ];
  const base = { unit:'2', culture:'all', period:'', workType:'', search:'' };
  assert.equal(filterWorks(works, base).length, 2);
  assert.equal(filterWorks(works, { ...base, culture:'etruscan' }).length, 1);
  assert.equal(filterWorks(works, { ...base, search:'白庙' }).length, 1);
  assert.equal(filterWorks(works, { ...base, search:'Sumerian' }).length, 1);
});
```

Extend the existing typography test:

```js
const unitSelectCss = getCssDeclarations(html, '#unitFilter');
assert.match(unitSelectCss, /font-size:\s*13px/);
assert.match(unitSelectCss, /font-weight:\s*600/);
assert.match(unitSelectCss, /min-height:\s*34px/);
assert.match(getCssDeclarations(html, '.culture-filters'), /gap:\s*6px/);
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/art-history-ui-numbering.test.mjs tests/homepage-art-integration.test.mjs
```

Expected: failure because the toolbar still contains civilization buttons and no `unitFilter`.

- [ ] **Step 3: Replace the toolbar markup**

Use:

```html
<label class="filter-label">Unit
  <select id="unitFilter" aria-label="Unit">
    <option value="all">All Units</option>
  </select>
</label>
<div id="cultureFilters" class="culture-filters" role="group" aria-label="Culture"></div>
<label class="filter-label">时期
  <select id="periodFilter"><option value="">全部时期</option></select>
</label>
<label class="filter-label">作品类型
  <select id="typeFilter"><option value="">全部类型</option></select>
</label>
<label class="filter-label">搜索
  <input id="searchInput" type="search" placeholder="标题、地点或关键词">
</label>
```

Populate Unit options only for Units with imported works. The current completed dataset produces `All Units` and:

```text
U2 · Ancient Mediterranean · AP 12-47
```

- [ ] **Step 4: Implement state and filter helpers**

Replace the legacy filter state with:

```js
const state = {
  unit:'all',
  culture:'all',
  period:'',
  workType:'',
  search:'',
  selectedId:null,
  selectedSiteIndex:0,
  expandedSiteToken:null,
  activeUnit:null,
  activeRegion:null,
  pendingFocusParentKey:null,
  activeDetailTab:'quick',
  transform:{ x:0, y:0, scale:1 },
};
```

Update `filterWorks()`:

```js
function filterWorks(works, filters) {
  const query = normalize(filters.search);
  return works.filter((work) => {
    if (filters.unit !== 'all' && work.unit !== Number(filters.unit)) return false;
    if (filters.culture !== 'all' && work.culture !== filters.culture) return false;
    if (filters.period && work.period !== filters.period) return false;
    if (filters.workType && work.workType !== filters.workType) return false;
    if (!query) return true;
    return [
      work.titleEn, work.titleZh, work.siteName, work.artistCulture,
      work.period, ...(work.keywords || []),
    ].map(normalize).join(' ').includes(query);
  });
}
```

Add:

```js
function replaceSelectOptions(select, placeholder, values) {
  select.replaceChildren();
  const initial = document.createElement('option');
  initial.value = '';
  initial.textContent = placeholder;
  select.append(initial);
  [...new Set(values)].sort((a, b) => a.localeCompare(b)).forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function renderCultureFilters() {
  const container = document.getElementById('cultureFilters');
  const unit = state.unit === 'all' ? null : Number(state.unit);
  container.hidden = !unit;
  container.replaceChildren();
  if (!unit) return;
  for (const culture of CULTURES_BY_UNIT[unit] || []) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-pill';
    button.dataset.culture = culture.id;
    button.textContent = culture.labelEn;
    button.setAttribute('aria-pressed', String(culture.id === state.culture));
    button.addEventListener('click', () => {
      state.culture = culture.id;
      clearHierarchyBranch();
      renderCultureFilters();
      render();
    });
    container.append(button);
  }
}

function syncDependentFilterOptions() {
  const unitWorks = ARTWORKS.filter((work) => (
    state.unit === 'all' || work.unit === Number(state.unit)
  ));
  replaceSelectOptions(
    document.getElementById('periodFilter'),
    '全部时期',
    unitWorks.map((work) => work.period),
  );
  replaceSelectOptions(
    document.getElementById('typeFilter'),
    '全部类型',
    unitWorks.map((work) => work.workType),
  );
}
```

On Unit change, reset incompatible filters, set `activeUnit`, reset the transform, rerender filter controls, and call `fitMapToWorks()` for the active Unit.

- [ ] **Step 5: Preserve the approved styling**

Use the existing shared control rules. Add only:

```css
.culture-filters { display:flex; flex-wrap:wrap; gap:6px; }
#unitFilter { font-size:13px; font-weight:600; min-height:34px; }
```

At `max-width:520px`:

```css
.culture-filters { gap:8px; }
#unitFilter, .culture-filters .filter-pill { min-height:44px; }
```

Do not add another `font-family` declaration.

- [ ] **Step 6: Run the focused tests**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/art-history-ui-numbering.test.mjs tests/homepage-art-integration.test.mjs
```

Expected: all focused tests pass except data-count assertions that await Task 3.

- [ ] **Step 7: Commit the toolbar slice**

```bash
git add art-history-map.html tests/art-history-ui-numbering.test.mjs tests/homepage-art-integration.test.mjs
git commit -m "feat: add AP Unit and culture filters"
```

### Task 3: Import the nine missing U2 works with one verified image each

**Files:**
- Create: `docs/data-sources/u2-missing-works.md`
- Modify: `art-history-map.html`
- Modify: `tests/art-history-data.test.mjs`
- Modify: `tests/art-history-details.test.mjs`

- [ ] **Step 1: Research and complete the source worksheet before editing artwork data**

For AP 12, 14, 16, 19, 25, 29, 30, 31, and 32:

1. Confirm the official English title, identifying information, and AP number against the current College Board AP Art History image set.
2. Use the user's `APAH notes.pdf` pages 6-10 and 14-18 plus `Smarthistory-guide-to-AP®-Art-History-volume-one.pdf` for the study fields.
3. Open an owning-institution image page when available. Start with the British Museum for AP 16, the Louvre for AP 19 and 25, and the relevant Italian archaeological museum or official site for AP 29, 31, and 32. If the owning page does not expose a reusable full-subject image, use a verified Wikimedia Commons file page whose object identity matches the official work.
4. Reject any image that crops out an essential part of the work, depicts a replica without disclosure, or lacks a traceable credit/license page.
5. Create `docs/data-sources/u2-missing-works.md` only after all nine rows are complete. Use these columns: `AP`, `ID`, `Identifying information source`, `Study-content source`, `Image file/source page`, `Creator/institution`, `License`, and `Visual check`.
6. Record `complete subject visible` in `Visual check` only after opening the full-size image and inspecting it.

Before proceeding, run:

```bash
rg -n "TODO|TBD|FIXME|placeholder|example\\.com" docs/data-sources/u2-missing-works.md
```

Expected: no matches.

- [ ] **Step 2: Replace the manifest test and add failing tests for exact identifiers, sites, and single-image credits**

In `tests/art-history-data.test.mjs`:

```js
const EXPECTED_AP_NUMBERS = Array.from({ length: 36 }, (_, index) => index + 12);
const EXPECTED_NEW_IDS = [
  'ap12-white-temple-ziggurat',
  'ap14-statues-votive-figures',
  'ap16-standard-of-ur',
  'ap19-code-of-hammurabi',
  'ap25-lamassu-sargon-ii',
  'ap29-sarcophagus-of-the-spouses',
  'ap30-apadana-darius-xerxes',
  'ap31-temple-minerva-apollo',
  'ap32-tomb-of-the-triclinium',
];

test('contains the complete official U2 AP 12-47 manifest', async () => {
  const artworks = await loadAndValidate();
  const apNumbers = artworks.map(({ apNumber }) => apNumber).sort((a, b) => a - b);
  assert.deepEqual(apNumbers, EXPECTED_AP_NUMBERS);
  assert.equal(artworks.length, 36);
  assert.ok(artworks.every(({ unit }) => unit === 2));
});

test('adds exactly the nine previously missing U2 works', async () => {
  const artworks = await loadAndValidate();
  const actual = artworks
    .filter(({ id }) => EXPECTED_NEW_IDS.includes(id))
    .map(({ id }) => id)
    .sort();
  assert.deepEqual(actual, EXPECTED_NEW_IDS.slice().sort());
});

const EXPECTED_NEW_WORKS = new Map([
  [12, ['ap12-white-temple-ziggurat', 'Uruk, Iraq', 'ancientNearEast']],
  [14, ['ap14-statues-votive-figures', 'Eshnunna (Tell Asmar), Iraq', 'ancientNearEast']],
  [16, ['ap16-standard-of-ur', 'Ur, Iraq', 'ancientNearEast']],
  [19, ['ap19-code-of-hammurabi', 'Susa, Iran', 'ancientNearEast']],
  [25, ['ap25-lamassu-sargon-ii', 'Dur Sharrukin (Khorsabad), Iraq', 'ancientNearEast']],
  [29, ['ap29-sarcophagus-of-the-spouses', 'Cerveteri, Italy', 'etruscan']],
  [30, ['ap30-apadana-darius-xerxes', 'Persepolis, Iran', 'ancientNearEast']],
  [31, ['ap31-temple-minerva-apollo', 'Veii, Italy', 'etruscan']],
  [32, ['ap32-tomb-of-the-triclinium', 'Tarquinia, Italy', 'etruscan']],
]);

test('new U2 works use approved ids sites and cultures', async () => {
  const artworks = await loadAndValidate();
  for (const [apNumber, [id, siteName, culture]] of EXPECTED_NEW_WORKS) {
    const work = artworks.find((entry) => entry.apNumber === apNumber);
    assert.equal(work?.id, id);
    assert.equal(work?.siteName, siteName);
    assert.equal(work?.culture, culture);
    assert.equal(work?.unit, 2);
  }
});
```

In `tests/art-history-details.test.mjs`, replace the old aggregate artwork JSON hash with explicit preservation of the original 27 ids and exact credit coverage:

```js
const ORIGINAL_27_IDS = [
  'ap13-palette-of-king-narmer', 'ap15-seated-scribe',
  'ap17-great-pyramids-giza', 'ap18-king-menkaura-and-queen',
  'ap20-temple-of-amun-re-karnak', 'ap21-mortuary-temple-hatshepsut',
  'ap22-akhenaten-nefertiti-daughters', 'ap23-tutankhamun-funerary-mask',
  'ap24-last-judgment-of-hunefer', 'ap26-athenian-acropolis',
  'ap27-anavysos-kouros', 'ap28-peplos-kore', 'ap33-niobides-krater',
  'ap34-doryphoros', 'ap35-athenian-agora', 'ap36-grave-stele-hegeso',
  'ap37-winged-victory-samothrace', 'ap38-great-altar-pergamon',
  'ap39-house-of-the-vettii', 'ap40-alexander-mosaic',
  'ap41-old-market-woman', 'ap42-seated-boxer',
  'ap43-head-of-a-roman-patrician', 'ap44-colosseum',
  'ap45-forum-of-trajan', 'ap46-pantheon',
  'ap47-ludovisi-battle-sarcophagus',
];

assert.ok(ORIGINAL_27_IDS.every((id) => artworks.some((work) => work.id === id)));
assert.deepEqual(Object.keys(credits).sort(), artworks.map(({ id }) => id).sort());
assert.ok(artworks.every((work) => typeof work.imageUrl === 'string'));
assert.ok(artworks.every((work) => !Array.isArray(work.images)));
```

- [ ] **Step 3: Run the data and detail tests and verify they fail**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/art-history-data.test.mjs tests/art-history-details.test.mjs
```

Expected: nine ids and credits are missing.

- [ ] **Step 4: Add the nine complete artwork records**

Insert records in numeric AP order. Every record must satisfy the validator's full required-field list, use `unit:2`, contain exactly three non-empty recognition anchors, contain at least four search keywords, and use exactly two existing comparison ids from the mapping below. Copy the final image URL, alt text, source name, and source-page URL from the completed worksheet; do not enter temporary values.

Use these comparison targets so every link resolves:

```js
const comparisonTargets = {
  12:['ap17-great-pyramids-giza', 'ap20-temple-of-amun-re-karnak'],
  14:['ap15-seated-scribe', 'ap28-peplos-kore'],
  16:['ap24-last-judgment-of-hunefer', 'ap40-alexander-mosaic'],
  19:['ap13-palette-of-king-narmer', 'ap45-forum-of-trajan'],
  25:['ap38-great-altar-pergamon', 'ap44-colosseum'],
  29:['ap18-king-menkaura-and-queen', 'ap36-grave-stele-hegeso'],
  30:['ap26-athenian-acropolis', 'ap45-forum-of-trajan'],
  31:['ap26-athenian-acropolis', 'ap46-pantheon'],
  32:['ap24-last-judgment-of-hunefer', 'ap39-house-of-the-vettii'],
};
```

Use one image URL and one image-source page per record. Do not add `images`, thumbnails, or carousel data.

- [ ] **Step 5: Add site projection coordinates**

Add these English site keys to `SITE_WORLD_COORDINATES`, using verified placement inside the 1600 by 800 world view:

```js
'Uruk, Iraq'
'Eshnunna (Tell Asmar), Iraq'
'Ur, Iraq'
'Susa, Iran'
'Dur Sharrukin (Khorsabad), Iraq'
'Cerveteri, Italy'
'Persepolis, Iran'
'Veii, Italy'
'Tarquinia, Italy'
```

Use `region:"middleEast"` for AP 12, 14, 16, 19, 25, and 30. Use `region:"southernEurope"` for AP 29, 31, and 32.

- [ ] **Step 6: Add matching image credits**

Add one `IMAGE_CREDITS` entry for each of the nine exact ids. Copy `creatorOrInstitution`, `licenseName`, and `licenseUrl` from the completed worksheet. All nine keys must match their artwork ids exactly, and the validator must reject missing or empty credit fields.

- [ ] **Step 7: Run validation and focused tests**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/validate-art-history-data.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/art-history-data.test.mjs tests/art-history-details.test.mjs
```

Expected:

```text
Validated 36 AP Art History works
```

All focused tests pass.

- [ ] **Step 8: Commit the completed U2 dataset**

```bash
git add art-history-map.html docs/data-sources/u2-missing-works.md tests/art-history-data.test.mjs tests/art-history-details.test.mjs
git commit -m "feat: complete AP Art History Unit 2"
```

### Task 4: Add English Unit, region, and site hierarchy labels

**Files:**
- Modify: `art-history-map.html`
- Modify: `tests/art-history-ui-numbering.test.mjs`

- [ ] **Step 1: Add failing label and hierarchy tests**

Add:

```js
test('piece labels and hierarchy subtitles are English', async () => {
  const html = await loadHtml();
  const {
    formatPieceCount, getMapGroupText, getUnitById,
  } = loadPureFunctions(
    html,
    ['formatPieceCount', 'getMapGroupText', 'getUnitById'],
    ['const AP_UNITS =', 'const MAP_REGIONS ='],
  );
  assert.equal(formatPieceCount(1), '1 piece');
  assert.equal(formatPieceCount(36), '36 pieces');
  assert.deepEqual(
    getMapGroupText({ kind:'unit', apUnits:[2], works:Array(36) }),
    { title:'U2', subtitle:'Ancient Mediterranean · 36 pieces' },
  );
  assert.deepEqual(
    getMapGroupText({
      kind:'region', region:'middleEast', works:Array(6),
    }),
    { title:'Middle East', subtitle:'6 pieces' },
  );
  assert.deepEqual(
    getMapGroupText({
      kind:'site', siteName:'Rome', apGroupLabel:'AP 41-47',
      works:Array(7),
    }),
    { title:'Rome', subtitle:'AP 41-47 · 7 pieces' },
  );
});
```

Add assertions for `.marker-title-label` at 11px/700 and `.marker-subtitle-label` at 10px/600.

- [ ] **Step 2: Verify the focused test fails**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/art-history-ui-numbering.test.mjs
```

Expected: missing label helpers and label CSS.

- [ ] **Step 3: Implement label helpers**

Add:

```js
function formatPieceCount(count) {
  return `${count} ${count === 1 ? 'piece' : 'pieces'}`;
}

function getMapGroupText(group) {
  if (group.kind === 'unit') {
    const unit = getUnitById(group.apUnits[0]);
    return {
      title:`U${unit.id}`,
      subtitle:`${unit.nameEn} · ${formatPieceCount(group.works.length)}`,
    };
  }
  if (group.kind === 'region') {
    return {
      title:MAP_REGIONS[group.region]?.nameEn || 'Region',
      subtitle:formatPieceCount(group.works.length),
    };
  }
  return {
    title:group.siteName,
    subtitle:`${group.apGroupLabel} · ${formatPieceCount(group.works.length)}`,
  };
}
```

For a single-work site, continue to render only the circular AP number pin. Use two-line text only for Unit, region, or multi-work site groups.

- [ ] **Step 4: Prefer configured real regions over anonymous grids**

Add `groupByConfiguredRegion(works, unit)`:

```js
function groupByConfiguredRegion(works, unit) {
  const groups = new Map();
  for (const work of works) {
    const key = `unit-${unit}-region-${work.region}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        kind:'region',
        region:work.region,
        parentKey:`unit-${unit}`,
        worldXTotal:0,
        worldYTotal:0,
        works:[],
      });
    }
    const point = toWorldCoordinates(work);
    const group = groups.get(key);
    group.works.push(work);
    group.worldXTotal += point.x;
    group.worldYTotal += point.y;
  }
  return [...groups.values()].map((group) => ({
    ...group,
    worldX:group.worldXTotal / group.works.length,
    worldY:group.worldYTotal / group.works.length,
    apUnits:[unit],
    siteToken:createSiteToken([{ id:group.key }]),
    apGroupLabel:formatApGroupLabel(group.works),
  }));
}
```

Use configured regions for real artwork records. Keep the existing grid fallback for synthetic 250-work collision tests that omit `region`.

When `state.unit === 'all'`, render Unit overview groups even if the current site count is below 40. When `state.unit === '2'`, render configured U2 regions; selecting a region renders its sites.

- [ ] **Step 5: Render hierarchical two-line SVG labels**

For Unit, region, and multi-work site groups:

- use a content-sized capsule,
- render a title `<text class="marker-title-label">`,
- render a subtitle `<text class="marker-subtitle-label">`,
- include both strings in the accessible name,
- keep the transparent 44px minimum hit target,
- preserve individual 22px AP circles.

CSS:

```css
.marker-title-label {
  fill:#fff;
  font-size:11px;
  font-weight:700;
  text-anchor:middle;
  pointer-events:none;
}
.marker-subtitle-label {
  fill:#fff;
  font-size:10px;
  font-weight:600;
  text-anchor:middle;
  pointer-events:none;
}
```

Unit clusters may use a restrained Unit accent. Region and site capsules use the approved World History-aligned blue. Remove civilization-specific marker fills and use `data-culture` only for semantic/filter state.

- [ ] **Step 6: Update detail metadata and legend**

Use:

```js
const CULTURE_LABELS_ZH = {
  ancientNearEast:'古代近东',
  egypt:'埃及',
  greece:'希腊',
  etruscan:'伊特鲁里亚',
  rome:'罗马',
};
meta.textContent =
  `AP #${work.apNumber} · ${CULTURE_LABELS_ZH[work.culture]} · ${work.period} · ${work.date}`;
```

Replace the old three-color civilization legend with a short English hierarchy instruction. Do not create five culture colors.

- [ ] **Step 7: Run hierarchy and marker tests**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
```

Expected: all hierarchy, marker collision, typography, and detail tests pass.

- [ ] **Step 8: Commit the hierarchy slice**

```bash
git add art-history-map.html tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs
git commit -m "feat: add English AP map hierarchy labels"
```

### Task 5: Complete responsive, accessibility, and regression verification

**Files:**
- Modify: `art-history-map.html`
- Modify: `tests/art-history-ui-numbering.test.mjs`
- Modify: `tests/homepage-art-integration.test.mjs`

- [ ] **Step 1: Add responsive contract tests**

Extend the narrow-screen tests to assert:

```js
const narrowCss = getMediaQuerySource(html, '(max-width:520px)');
assert.match(getCssDeclarations(narrowCss, '#unitFilter'), /min-height:\s*44px/);
assert.match(
  getCssDeclarations(narrowCss, '.culture-filters .filter-pill'),
  /min-height:\s*44px/,
);
assert.match(getCssDeclarations(narrowCss, '.culture-filters'), /gap:\s*8px/);
```

Add a homepage assertion that `world-map.html` and its wrapper rules remain unchanged while Art retains `min(720px, 78vh)` under 900px.

- [ ] **Step 2: Run the full suite before final CSS adjustments**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
```

Expected: any failure is limited to an explicit responsive or integration contract added in Step 1.

- [ ] **Step 3: Make the smallest responsive fixes**

At `max-width:520px`:

- Unit, period, type, and search fields stack without horizontal overflow.
- Culture pills wrap with 8px gaps.
- All filter and map controls expose 44px minimum interaction targets.
- The map and detail panel keep their current stacked layout.
- Embedded body scrolling remains enabled.

Do not change the approved desktop type sizes.

- [ ] **Step 4: Run all automated checks**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/validate-art-history-data.mjs
git diff --check
git status --short
```

Expected:

- zero test failures,
- `Validated 36 AP Art History works`,
- no whitespace errors,
- only intended files modified.

- [ ] **Step 5: Start a local preview**

Run:

```bash
python3 -m http.server 4174 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4174/index.html
http://127.0.0.1:4174/art-history-map.html
```

- [ ] **Step 6: Browser-verify desktop and mobile**

At 1440, 1024, 768, and 375 CSS pixels verify:

- embedded Art hides its internal header;
- standalone Art shows its header;
- Unit selector lists U2 and its AP range;
- U2 shows all six culture choices;
- every culture filter returns the correct works;
- all nine added AP numbers can be selected;
- Unit, region, and site subtitles are English;
- English artwork titles remain 19px/800;
- Chinese subtitles remain 13px/600;
- detail body remains 13.5px/600;
- Unit select and culture pills remain 13px/600 and 34px tall on desktop;
- touch targets become 44px on mobile;
- images show the correct complete subject with no cover crop;
- no horizontal overflow;
- no console warnings/errors;
- World History remains visually and functionally unchanged.

- [ ] **Step 7: Commit responsive and verification changes**

```bash
git add art-history-map.html tests/art-history-ui-numbering.test.mjs tests/homepage-art-integration.test.mjs
git commit -m "test: verify complete U2 map across viewports"
```

### Task 6: Review and sync the verified delivery

**Files:**
- Review all files changed since `b5e777f`
- Sync verified runtime/test files to `/Users/tiffanyxu/Desktop/APWH/考前冲刺_地区专题_试做版`

- [ ] **Step 1: Request a final read-only review**

Review `b5e777f..HEAD` against:

```text
docs/superpowers/specs/2026-07-26-u2-completion-and-unit-classification-design.md
```

Block delivery on any Critical or Important finding. Fix findings with a failing regression test first.

- [ ] **Step 2: Re-run fresh completion evidence**

Run:

```bash
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/validate-art-history-data.mjs
git diff --check
git status --short
```

Expected: all tests pass, 36 works validate, diff check is clean, and the working tree is clean.

- [ ] **Step 3: Back up the Desktop runtime files**

Create a dated backup directory under:

```text
/Users/tiffanyxu/Desktop/APWH/考前冲刺_地区专题_试做版/.codex-backups/
```

Back up `index.html`, `art-history-map.html`, the four test files, and `scripts/validate-art-history-data.mjs` before copying.

- [ ] **Step 4: Sync only the verified files**

Copy:

```text
index.html
art-history-map.html
tests/art-history-data.test.mjs
tests/art-history-details.test.mjs
tests/art-history-ui-numbering.test.mjs
tests/homepage-art-integration.test.mjs
scripts/validate-art-history-data.mjs
```

Do not copy `.git`, `.superpowers`, temporary PDF renders, or development-server files.

- [ ] **Step 5: Verify the Desktop copy**

Run the full Node suite and validator from the Desktop project. Compare SHA-256 hashes for `index.html` and `art-history-map.html` between the development and Desktop copies.

Expected: identical hashes, zero test failures, and `Validated 36 AP Art History works`.

- [ ] **Step 6: Keep the final Desktop preview open**

Serve the Desktop project at:

```text
http://127.0.0.1:4173/index.html
```

Leave the Art History subject selected and keep only the final deliverable preview tab.
