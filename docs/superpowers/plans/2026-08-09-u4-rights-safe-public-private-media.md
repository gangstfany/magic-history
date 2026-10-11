# AP Art History U4 Rights-Safe Public and Private Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete AP Art History Unit 4, AP #99–152, with 54 bilingual works and 63 logical views while publishing only rights-cleared images and restoring eight restricted views through a Git-ignored private local bundle.

**Architecture:** Preserve the verified 54-work manifest from Task 1 and replace the original U4 plan's Tasks 2–10 with a public/private media split. The tracked canonical fixture contains 55 rights-cleared image views and eight explicit `rightsRestricted` placeholders; an opt-in runtime overlay merges ignored local files into an ephemeral view model when `privateMedia=1`. Public release checks fail on any restricted URL, tracked private file, absolute private path, or restricted image request.

**Tech Stack:** Static HTML/CSS/JavaScript, JSON and Markdown data contracts, Node.js test runner, JSDOM, Playwright, Git worktrees, local ignored media files.

---

## Superseded Plan Scope

This plan supersedes Tasks 2–10 in:

`docs/superpowers/plans/2026-08-06-u4-later-europe-americas.md`

Task 1 from that plan is complete at commit `5fe3b4c`. The rights-safe design is approved at:

`docs/superpowers/specs/2026-08-09-u4-rights-safe-private-media-design.md`

Continue on `feature/ap-art-history-u4`. Do not recreate the worktree or reset the two intentional uncommitted red-test files:

- `tests/art-history-u4-canonical.test.mjs`
- `tests/art-history-preservation.test.mjs`

Use this Node runtime for every command:

```text
/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
```

## File Structure

### New tracked files

- `data/ap-art-history-unit-4-public-placeholders.json` — exact eight public-placeholder keys and source/rights explanations.
- `data/ap-art-history-unit-4-rights.json` — exact 63-key rights audit, including truthful restricted placeholder entries.
- `docs/data-sources/u4-source-ledger.md` — ordered 63-row source ledger with an explicit placeholder literal for eight rows.
- `tests/fixtures/u4-canonical.json` — complete 54-work public canonical projection.
- `tests/fixtures/u4-browser.json` — public browser projection for all 54 works and 63 views.
- `scripts/verify-art-history-private-leaks.mjs` — Git/private-path/restricted-URL hash release guard.

### New ignored local files

- `.private-media/u4/overrides.js` — exact eight-key local media hook.
- `.private-media/u4/*.{jpg,jpeg,png,webp}` — eight private study images.

### Modified tracked files

- `.gitignore`
- `art-history-map.html`
- `index.html`
- `docs/art-history-sources.md`
- `scripts/validate-art-history-data.mjs`
- `scripts/verify-art-history-browser.mjs`
- `scripts/verify-art-history-release.mjs`
- `tests/art-history-u4-canonical.test.mjs`
- `tests/art-history-data.test.mjs`
- `tests/art-history-details.test.mjs`
- `tests/art-history-preservation.test.mjs`
- `tests/art-history-ui-numbering.test.mjs`
- `tests/art-history-browser-verifier.test.mjs`
- `tests/homepage-art-integration.test.mjs`

### Protected files

- `world-map.html`
- All U1/U2 canonical, browser, and preservation fixtures
- `tests/fixtures/u3-canonical.json`
- `tests/fixtures/u3-browser.json`
- `data/ap-art-history-unit-3-manifest.json`
- `data/ap-art-history-unit-3-rights.json`

---

### Task 1: Freeze the Public Placeholder and Private Overlay Contracts

**Files:**
- Create: `data/ap-art-history-unit-4-public-placeholders.json`
- Modify: `tests/art-history-u4-canonical.test.mjs`
- Modify: `tests/art-history-preservation.test.mjs`

- [ ] **Step 1: Add the exact placeholder authority**

Create the JSON object with exactly these keys in this order:

```js
const RESTRICTED_MEDIA_KEYS = Object.freeze([
  'ap140-two-fridas::primary',
  'ap143-dream-alameda-central::primary',
  'ap146-marilyn-diptych::primary',
  'ap148-narcissus-garden::primary',
  'ap149-bay::primary',
  'ap150-lipstick-caterpillar-tracks::primary',
  'ap152-house-new-castle-county::exterior',
  'ap152-house-new-castle-county::interior',
]);
```

Each value has this exact key order:

```json
{
  "imageSourceName": "Museo de Arte Moderno / INBAL",
  "imageSourceUrl": "https://inba.gob.mx/prensa/23566/el-museo-de-arte-moderno-presenta-las-dos-fridas-una-identidad-global",
  "rightsNote": "Underlying artwork remains protected; the public build provides identity and source information without reproducing the image."
}
```

Use the exact owning-institution, Smarthistory, Commons identity, or archive page already audited for each key. No direct restricted image URL is allowed in this file.

- [ ] **Step 2: Amend the red canonical media contract**

Replace the all-HTTPS assumption with an explicit conditional schema:

```js
const PUBLIC_PLACEHOLDER_LITERAL = 'Rights-restricted public placeholder';
const PUBLIC_IMAGE_FIELDS = [
  'id', 'label', 'imageUrl', 'imageAlt', 'imageSourceName', 'imageSourceUrl',
];
const PLACEHOLDER_IMAGE_FIELDS = [...PUBLIC_IMAGE_FIELDS, 'mediaStatus'];

function isRestrictedMediaKey(value) {
  return RESTRICTED_MEDIA_KEYS.includes(value);
}

function assertPublicMediaView(view, identity, placeholderAuthority) {
  if (isRestrictedMediaKey(identity)) {
    assert.deepEqual(Object.keys(view), PLACEHOLDER_IMAGE_FIELDS, `${identity}: placeholder schema`);
    assert.equal(view.imageUrl, null, `${identity}: public image must be absent`);
    assert.equal(view.mediaStatus, 'rightsRestricted', `${identity}: public status`);
    assert.equal(view.imageSourceName, placeholderAuthority[identity].imageSourceName);
    assert.equal(view.imageSourceUrl, placeholderAuthority[identity].imageSourceUrl);
    return;
  }
  assert.deepEqual(Object.keys(view), PUBLIC_IMAGE_FIELDS, `${identity}: image schema`);
  assert.match(view.imageUrl, /^https:\/\//, `${identity}: public HTTPS image`);
  assert.ok(!Object.hasOwn(view, 'mediaStatus'), `${identity}: no placeholder status`);
}
```

Count exactly 55 non-null unique image URLs, eight null URLs, and 63 unique visible-content alt strings.

- [ ] **Step 3: Amend ledger parsing without weakening normal rows**

Parse the Image cell with:

```js
function parseLedgerImageCell(value, identity) {
  if (isRestrictedMediaKey(identity)) {
    assert.equal(value, PUBLIC_PLACEHOLDER_LITERAL, `${identity}: placeholder ledger cell`);
    return null;
  }
  return markdownLink(value, identity).url;
}
```

Reject the literal for every normal key and reject an HTTPS image link for every restricted key.

- [ ] **Step 4: Amend rights validation**

Add this complete helper, build an exact media lookup at the start of `assertCanonicalRightsMatch`, add a `placeholders` parameter, and call the helper from the existing credit loop:

```js
function assertRestrictedStatus({ identity, media, rightsEntry, placeholders }) {
  const restricted = isRestrictedMediaKey(identity);
  assert.equal(
    Object.hasOwn(placeholders, identity),
    restricted,
    `${identity}: placeholder authority mismatch`,
  );
  assert.equal(
    rightsEntry.releaseClass === 'restricted',
    restricted,
    `${identity}: restricted class must match public placeholder status`,
  );
  if (restricted) assert.equal(media.imageUrl, null, `${identity}: restricted URL leak`);
}

const mediaByKey = new Map(fixture.artworks.flatMap((work) => (
  normalizeArtworkMedia(work).map((media) => [mediaKey(work.id, media.id), media])
)));

assertRestrictedStatus({
  identity,
  media: mediaByKey.get(identity),
  rightsEntry: rights[identity],
  placeholders,
});
```

All normal entries remain limited to `open`, `noncommercial`, or `institutionalEducational` and retain exact license-policy assertions.

- [ ] **Step 5: Add negative tests**

Add mutations that prove the contracts reject:

```js
const leaked = structuredClone(fixture);
const restrictedWork = leaked.artworks.find(({ id }) => id === 'ap140-two-fridas');
restrictedWork.images[0].imageUrl = 'https://invalid.test/restricted-image.jpg';
assert.throws(() => assertCanonicalMediaContract(leaked, manifest, placeholders), /public image must be absent/);

const missingStatus = structuredClone(fixture);
delete missingStatus.artworks.find(({ id }) => id === 'ap140-two-fridas').images[0].mediaStatus;
assert.throws(() => assertCanonicalMediaContract(missingStatus, manifest, placeholders), /placeholder schema/);

const falseRestriction = structuredClone(rights);
falseRestriction['ap139-fallingwater::primary'].releaseClass = 'restricted';
assert.throws(
  () => assertCanonicalRightsMatch(fixture, falseRestriction, expectedKeys, placeholders),
  /must match/,
);
```

Use `.test` only as a deliberately invalid URL inside mutation tests; it must never appear in public data.

- [ ] **Step 6: Run the intended red suite**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-u4-canonical.test.mjs tests/art-history-preservation.test.mjs
```

Expected: manifest and parser tests pass; real-data tests fail only because the canonical fixture, ledger, rights file, and placeholder authority data are not all complete.

- [ ] **Step 7: Commit the contract**

```bash
git add data/ap-art-history-unit-4-public-placeholders.json \
  tests/art-history-u4-canonical.test.mjs tests/art-history-preservation.test.mjs
git commit -m "test: define rights-safe Unit 4 media contracts"
```

---

### Task 2: Build the Complete Public Source Bundle and Canonical Fixture

**Files:**
- Create: `docs/data-sources/u4-source-ledger.md`
- Create: `data/ap-art-history-unit-4-rights.json`
- Create: `tests/fixtures/u4-canonical.json`
- Modify: `docs/art-history-sources.md`
- Modify: `tests/art-history-u4-canonical.test.mjs`
- Modify: `tests/art-history-preservation.test.mjs`

- [ ] **Step 1: Write the 63-row source ledger**

Use the exact eight-column header already frozen in the test. Rows follow AP and manifest-view order. Rights-cleared rows use an HTTPS Markdown image link. The eight restricted rows use the exact Image-cell literal:

```text
Rights-restricted public placeholder
```

Every row still contains an exact HTTPS source page and rights page. The rights page for a restricted row documents the retained rights or permission requirement; it never claims a portable license.

- [ ] **Step 2: Write the 63-key rights audit**

Keep the exact key order derived from the manifest. Use the exact schema:

```json
{
  "creatorOrInstitution": "Frida Kahlo / Museo de Arte Moderno / INBAL",
  "licenseName": "Rights retained — public reproduction unavailable",
  "licenseUrl": "https://inba.gob.mx/conoceInba/politicasapp",
  "releaseClass": "restricted"
}
```

Exactly eight values are `restricted`. All other values use their audited exact open, noncommercial, or institutional-educational policy.

- [ ] **Step 3: Write all 54 bilingual canonical records**

Use the exact manifest identity, region, creation site, qualifier, movement group, and ordered view IDs. Preserve the approved record field order and require:

- English canonical title and concise Chinese title.
- Precise culture/style distinct from the broad movement group.
- Period, date, artist/culture, medium, type, creation-context coordinates.
- Chinese function, form, content, and context with necessary English terms.
- Two to four recognition anchors.
- At least one resolvable comparison with an explicit comparison basis.
- At least three bilingual/searchable keywords.

For 55 rights-cleared views, write the exact direct HTTPS image/source pair. For the eight restricted views, write `imageUrl: null`, exact source identity, unique Chinese alt/status text, and `mediaStatus: "rightsRestricted"`.

- [ ] **Step 4: Write exact credits**

Keep one three-field credit per logical view:

```json
{
  "creatorOrInstitution": "Frida Kahlo / Museo de Arte Moderno / INBAL",
  "licenseName": "Rights retained — public reproduction unavailable",
  "licenseUrl": "https://inba.gob.mx/conoceInba/politicasapp"
}
```

Credit arrays follow view order. Single-view works keep the project's existing single-object form unless the canonical test requires an array for consistent view alignment.

- [ ] **Step 5: Document the public/private policy**

Add the current CED, local notes, Smarthistory volume 3, manifest, placeholder authority, ledger, rights audit, and private-media design spec to `docs/art-history-sources.md`. State that restricted images are absent from Git and are never covered by the public release claim.

- [ ] **Step 6: Run focused tests**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-u4-canonical.test.mjs tests/art-history-preservation.test.mjs
```

Expected: all U4 source, study, media, ledger, rights, and U1–U3 preservation tests pass; totals are 54 works, 63 views, 55 image URLs, and eight placeholders.

- [ ] **Step 7: Commit**

```bash
git add docs/art-history-sources.md docs/data-sources/u4-source-ledger.md \
  data/ap-art-history-unit-4-rights.json tests/fixtures/u4-canonical.json \
  tests/art-history-u4-canonical.test.mjs tests/art-history-preservation.test.mjs
git commit -m "docs: audit rights-safe AP Art History Unit 4 sources"
```

---

### Task 3: Extend Strict Validation to Public AP #1–152

**Files:**
- Modify: `scripts/validate-art-history-data.mjs`
- Modify: `tests/art-history-data.test.mjs`
- Modify: `tests/art-history-u4-canonical.test.mjs`

- [ ] **Step 1: Add failing complete-fixture validator tests**

Build a complete in-memory Units 1–4 fixture from live U1–U3 data plus `u4-canonical.json`. Add exact negative cases for missing AP 99, extra AP 153, duplicate AP number, U4 manifest mismatch, reordered view, placeholder URL leak, missing placeholder status, unapproved null image, wrong restricted set, rights mismatch, and unresolved comparison.

- [ ] **Step 2: Load U4 contracts**

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
const U4_PLACEHOLDERS_URL = new URL(
  '../data/ap-art-history-unit-4-public-placeholders.json',
  import.meta.url,
);
```

- [ ] **Step 3: Add the Unit 4 range and region rule**

```js
4: Object.freeze({
  start: 99,
  end: 152,
  count: 54,
  regions: new Set([
    'france', 'britishIsles', 'southernEurope', 'centralNorthernEurope',
    'russiaSoviet', 'unitedStates', 'mexicoCaribbean', 'pacific', 'transatlantic',
  ]),
}),
```

- [ ] **Step 4: Generalize audited rights validation**

Replace the U3-only validator with `validateAuditedRights({ unit, rightsAudit, artworks, credits, manifest, placeholders })`. Preserve U3's exact distribution regression. For U4, require exact manifest keys and allow `restricted` only when:

```js
const expectedPlaceholder = Object.hasOwn(placeholders, mediaKey);
const media = normalizeArtworkMedia(work)[index];
if (entry.releaseClass === 'restricted') {
  if (!expectedPlaceholder || media.imageUrl !== null || media.mediaStatus !== 'rightsRestricted') {
    fail(`Unit 4 ${mediaKey} restricted media must be a public placeholder`);
  }
} else if (expectedPlaceholder) {
  fail(`Unit 4 ${mediaKey} placeholder must retain restricted rights status`);
}
```

- [ ] **Step 5: Generalize media normalization**

`normalizeArtworkMedia` must retain `mediaStatus` and accept `imageUrl: null` only through the U4 placeholder validator. Legacy single-image U1/U2 and explicit U3 image arrays remain unchanged.

- [ ] **Step 6: Run focused validation tests**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-data.test.mjs tests/art-history-u4-canonical.test.mjs
```

Expected: complete in-memory Units 1–4 fixtures pass; all negative mutations fail with the exact AP/media key. The live HTML remains 98 works until Task 4 and must not be asserted as 152 in this task.

- [ ] **Step 7: Commit**

```bash
git add scripts/validate-art-history-data.mjs tests/art-history-data.test.mjs \
  tests/art-history-u4-canonical.test.mjs
git commit -m "test: validate rights-safe Art History Units 1-4"
```

---

### Task 4: Import the 54 Public U4 Records into the Live Map

**Files:**
- Modify: `art-history-map.html`
- Modify: `tests/art-history-u4-canonical.test.mjs`
- Modify: `tests/art-history-details.test.mjs`

- [ ] **Step 1: Add the failing live projection test**

Assert that live Unit 4 records equal `canonical.artworks` recursively and that their exact live credits equal `canonical.credits`.

- [ ] **Step 2: Append AP 99–116 and credits**

Copy the canonical JSON exactly into the existing `artwork-data` and `image-credit-data` blocks. Rerun the projection test and require AP 117 to be the first missing record.

- [ ] **Step 3: Append AP 117–134 and credits**

Rerun and require AP 135 to be the first missing record.

- [ ] **Step 4: Append AP 135–152 and credits**

Preserve exact field order, Unicode, null placeholder URLs, media status, view order, and credit shape.

- [ ] **Step 5: Add the live 152-work assertion and run strict CLI**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-u4-canonical.test.mjs tests/art-history-data.test.mjs \
  tests/art-history-details.test.mjs
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/validate-art-history-data.mjs
```

Expected: focused tests pass and CLI prints `Validated 152 AP Art History works`.

- [ ] **Step 6: Commit**

```bash
git add art-history-map.html tests/art-history-u4-canonical.test.mjs \
  tests/art-history-data.test.mjs tests/art-history-details.test.mjs
git commit -m "feat: import rights-safe AP Art History Unit 4"
```

---

### Task 5: Add the Public Placeholder UI and Private Local Overlay

**Files:**
- Modify: `.gitignore`
- Modify: `art-history-map.html`
- Modify: `tests/art-history-details.test.mjs`
- Modify: `tests/art-history-preservation.test.mjs`

- [ ] **Step 1: Ignore private media**

Add exactly:

```gitignore
.private-media/
```

Assert `git check-ignore .private-media/u4/overrides.js` succeeds.

- [ ] **Step 2: Write failing overlay-schema tests**

Freeze the exact eight keys and exact value schema:

```js
const PRIVATE_OVERRIDE_FIELDS = [
  'filePath', 'creatorOrInstitution', 'rightsNote', 'rightsUrl',
];

const PRIVATE_MEDIA_KEYS = Object.freeze([
  'ap140-two-fridas::primary',
  'ap143-dream-alameda-central::primary',
  'ap146-marilyn-diptych::primary',
  'ap148-narcissus-garden::primary',
  'ap149-bay::primary',
  'ap150-lipstick-caterpillar-tracks::primary',
  'ap152-house-new-castle-county::exterior',
  'ap152-house-new-castle-county::interior',
]);
```

Reject remote URLs, absolute paths, `..`, extra keys, missing keys, executable values, and paths outside `.private-media/u4/`. Accept only:

```js
/^\.private-media\/u4\/[a-z0-9-]+\.(?:jpe?g|png|webp)$/
```

- [ ] **Step 3: Implement bounded optional loading**

Add browser functions:

```js
const PRIVATE_OVERRIDE_FIELDS = Object.freeze([
  'filePath', 'creatorOrInstitution', 'rightsNote', 'rightsUrl',
]);
const PRIVATE_MEDIA_KEYS = Object.freeze([
  'ap140-two-fridas::primary',
  'ap143-dream-alameda-central::primary',
  'ap146-marilyn-diptych::primary',
  'ap148-narcissus-garden::primary',
  'ap149-bay::primary',
  'ap150-lipstick-caterpillar-tracks::primary',
  'ap152-house-new-castle-county::exterior',
  'ap152-house-new-castle-county::interior',
]);
const PRIVATE_MEDIA_MODE = new URLSearchParams(location.search).get('privateMedia') === '1';
let privateMediaOverrides = Object.freeze({});

function validatePrivateMediaOverrides(value) {
  if (value == null) return Object.freeze({});
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Private media overrides must be an object');
  }
  const result = {};
  for (const [identity, entry] of Object.entries(value)) {
    if (!PRIVATE_MEDIA_KEYS.includes(identity)) {
      throw new TypeError(`Unapproved private media key: ${identity}`);
    }
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new TypeError(`${identity}: private override must be an object`);
    }
    const fields = Object.keys(entry);
    if (fields.join('|') !== PRIVATE_OVERRIDE_FIELDS.join('|')) {
      throw new TypeError(`${identity}: private override schema mismatch`);
    }
    for (const field of PRIVATE_OVERRIDE_FIELDS) {
      if (typeof entry[field] !== 'string' || entry[field].trim() === '') {
        throw new TypeError(`${identity}.${field}: expected non-empty string`);
      }
    }
    if (!/^\.private-media\/u4\/[a-z0-9-]+\.(?:jpe?g|png|webp)$/.test(entry.filePath)) {
      throw new TypeError(`${identity}.filePath: invalid private path`);
    }
    if (!/^https:\/\//.test(entry.rightsUrl)) {
      throw new TypeError(`${identity}.rightsUrl: expected HTTPS URL`);
    }
    result[identity] = Object.freeze({ ...entry });
  }
  return Object.freeze(result);
}

function loadPrivateMediaOverrides(timeoutMs = 2000) {
  if (!PRIVATE_MEDIA_MODE) return Promise.resolve(Object.freeze({}));
  return new Promise((resolve) => {
    const script = document.createElement('script');
    let settled = false;
    let timer;
    const finish = (loaded) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        resolve(validatePrivateMediaOverrides(window.AP_ART_HISTORY_PRIVATE_MEDIA));
      } catch (error) {
        if (loaded) console.warn(`Private media override ignored: ${error.message}`);
        resolve(Object.freeze({}));
      }
    };
    script.src = '.private-media/u4/overrides.js';
    script.onload = () => finish(true);
    script.onerror = () => finish(false);
    timer = setTimeout(() => finish(false), timeoutMs);
    document.head.append(script);
  });
}
```

Do not log an error for an absent bundle. Log one bounded warning only for a present but invalid override in private mode.

- [ ] **Step 4: Merge into an ephemeral view model**

```js
function resolveMediaView(work, media) {
  const identity = `${work.id}::${media.id}`;
  const override = privateMediaOverrides[identity];
  if (!override) return media;
  return {
    ...media,
    imageUrl: override.filePath,
    mediaStatus: 'privateLocal',
    privateCredit: {
      creatorOrInstitution: override.creatorOrInstitution,
      licenseName: override.rightsNote,
      licenseUrl: override.rightsUrl,
    },
  };
}
```

Never mutate `ARTWORKS` or public credits.

- [ ] **Step 5: Render the approved full-height placeholder**

Add a dedicated renderer, not an image-error trick:

```js
function createRightsPlaceholder(work, media, privateMissing = false) {
  const panel = document.createElement('section');
  panel.className = 'rights-placeholder';
  panel.setAttribute('aria-label', `${work.titleEn}: public image unavailable`);

  const icon = document.createElement('span');
  icon.className = 'rights-placeholder-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '⌑';

  const title = document.createElement('h3');
  title.textContent = 'Image unavailable in the public version';

  const explanation = document.createElement('p');
  explanation.textContent = '由于作品版权限制，公开版不显示图像。本地私人学习模式可显示完整视图。';

  panel.append(icon, title, explanation);
  if (privateMissing) {
    const localStatus = document.createElement('p');
    localStatus.className = 'private-media-missing';
    localStatus.textContent = 'Private image not installed';
    panel.append(localStatus);
  }

  const source = document.createElement('a');
  source.className = 'rights-placeholder-source';
  source.href = media.imageSourceUrl;
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  source.textContent = 'View official source ↗';
  panel.append(source);
  return panel;
}
```

Add the approved warm-neutral full-height style:

```css
.rights-placeholder {
  min-height: 270px;
  margin: 0;
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: linear-gradient(145deg, #eee4d5, #faf5ec);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 10px;
  text-align: center;
}
.rights-placeholder-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #fffaf1;
  color: var(--accent);
  font-size: 24px;
}
.rights-placeholder-source {
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid #aa9b87;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  color: var(--accent);
  font-weight: 700;
}
```

Placeholder controls must not open the image dialog and must not create an `<img>` element.

- [ ] **Step 6: Preserve local image behavior and fallback**

Private local media uses the normal contain-fit image, view switcher, credits, source, dialog, and focus restoration. A local image error replaces only that view with the placeholder plus `Private image not installed`; buttons remain usable.

- [ ] **Step 7: Make startup await the optional overlay**

Replace the final synchronous render calls with:

```js
loadPrivateMediaOverrides().then((overrides) => {
  privateMediaOverrides = overrides;
  runDevelopmentAssertions();
  render();
  applyTransform();
  assertRenderedMarkerSemantics();
});
```

Export validation, resolution, and loading helpers through `window.ArtHistoryMap` for real-data tests.

- [ ] **Step 8: Run focused tests**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-details.test.mjs tests/art-history-preservation.test.mjs \
  tests/art-history-u4-canonical.test.mjs
```

Expected: public placeholder creates no image/modal, private fixture restores image behavior, missing private file falls back, and U1–U3 remain field-for-field frozen.

- [ ] **Step 9: Commit**

```bash
git add .gitignore art-history-map.html tests/art-history-details.test.mjs \
  tests/art-history-preservation.test.mjs
git commit -m "feat: add rights-safe public and private media modes"
```

---

### Task 6: Add U4 Hierarchy, Movement Filters, Search, and Comparisons

**Files:**
- Modify: `art-history-map.html`
- Modify: `tests/art-history-ui-numbering.test.mjs`
- Modify: `tests/art-history-details.test.mjs`
- Modify: `tests/art-history-preservation.test.mjs`

- [ ] **Step 1: Add failing U4 configuration tests**

Require four movement groups plus `All movements`, nine exact regions, all canonical creation sites, bilingual precise-style search, AP-number search, empty-state reset, 54 U4 pins, and collision-safe region/site branches.

- [ ] **Step 2: Add movement labels and Unit 4 filter config**

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

The reset label for Unit 4 is exactly `All movements`.

- [ ] **Step 3: Add nine regions and creation-site coordinates**

Extend France, British Isles, and Southern Europe to Unit 4. Add Central & Northern Europe, Russia & Soviet Union, United States, Mexico & Caribbean, Pacific, and Transatlantic. Site strings must exactly match the canonical fixture. AP 127 uses the reviewed North Atlantic point.

- [ ] **Step 4: Preserve broad filtering and precise bilingual search**

Search titles, AP number, exact style/culture labels, broad movement labels, artist, date, medium, site, qualifier, keywords, and Chinese equivalents. The broad filter uses `work.traditionGroup ?? work.culture`.

- [ ] **Step 5: Verify details and comparisons**

Assert every U4 detail keeps English title above Chinese subtitle, four study tabs, required view buttons including public placeholders, and at least one real U4-to-U1/U2/U3 comparison that clears incompatible filters and restores focus.

- [ ] **Step 6: Run focused tests and commit**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-ui-numbering.test.mjs tests/art-history-details.test.mjs \
  tests/art-history-preservation.test.mjs
git add art-history-map.html tests/art-history-ui-numbering.test.mjs \
  tests/art-history-details.test.mjs tests/art-history-preservation.test.mjs
git commit -m "feat: add Unit 4 map hierarchy and study tools"
```

---

### Task 7: Update Units 1–4 Copy and Propagate Private Mode

**Files:**
- Modify: `art-history-map.html`
- Modify: `index.html`
- Modify: `scripts/verify-art-history-release.mjs`
- Modify: `tests/homepage-art-integration.test.mjs`
- Modify: `tests/art-history-ui-numbering.test.mjs`

- [ ] **Step 1: Add failing copy and propagation tests**

Require 152-work Units 1–4 copy, `U4 · Later Europe and Americas · 54 pieces`, unchanged typography/iframe dimensions/World copy, and query propagation only when the top page has `privateMedia=1`.

- [ ] **Step 2: Propagate the flag without changing the public default**

```js
const hostParams = new URLSearchParams(window.location.search);
if (hostParams.get('privateMedia') === '1') {
  const artUrl = new URL(artMapFrame.getAttribute('src'), window.location.href);
  artUrl.searchParams.set('privateMedia', '1');
  artMapFrame.src = `${artUrl.pathname.split('/').pop()}?${artUrl.searchParams}`;
}
```

The static iframe source remains `art-history-map.html?embed=1`. No flag is added on GitHub/public URLs unless explicitly requested.

- [ ] **Step 3: Update Units 1–4 copy**

Update document title, heading, subtitle, map labels, hierarchy copy, homepage caption, and release-stage label to 152 works / Units 1–4. Do not add timeline markup or change iframe sizes.

- [ ] **Step 4: Run tests and commit**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/homepage-art-integration.test.mjs tests/art-history-ui-numbering.test.mjs
git add art-history-map.html index.html scripts/verify-art-history-release.mjs \
  tests/homepage-art-integration.test.mjs tests/art-history-ui-numbering.test.mjs
git commit -m "feat: integrate rights-safe Art History Units 1-4"
```

---

### Task 8: Add Public and Private U4 Browser Verification

**Files:**
- Create: `tests/fixtures/u4-browser.json`
- Modify: `tests/art-history-browser-verifier.test.mjs`
- Modify: `scripts/verify-art-history-browser.mjs`

- [ ] **Step 1: Add the failing exact browser-fixture test**

Project all 54 canonical works and 63 views. Include `imageUrl` and optional `mediaStatus`; require exactly eight null URLs with the exact frozen keys.

- [ ] **Step 2: Generate and review the immutable fixture**

Generate only from the canonical fixture, then review AP order, titles, region/site, view order, source pages, 55 public URLs, and eight placeholder statuses.

- [ ] **Step 3: Add public traversal**

For every U4 work in standalone and embedded modes, use visible Unit → region → site → AP pin interaction. For rights-cleared views, assert image/alt/source/credit/modal/focus and exact request count. For placeholder views, assert full-height status, source link, no `<img>`, no modal, and zero image requests.

- [ ] **Step 4: Add private-mode traversal with route fulfillment**

Before navigating to `?privateMedia=1`, fulfill the optional script request with an exact eight-key benign override and fulfill `.private-media/u4/*.jpg` with a tiny test image. Do not write real or synthetic files into `.private-media/`.

Assert the eight views render as `privateLocal`, support the normal modal and focus flow, and retain the public source identity. Add missing-script and missing-image negative paths that return to `Private image not installed`.

- [ ] **Step 5: Add negative controls**

Mutate wrong U4 title, missing final view, wrong placeholder key, restricted public URL, duplicate request, console warning, focus restoration, ninth region branch, and marker-layout rollback. Each mutation must fail with a named assertion.

- [ ] **Step 6: Run verifier tests and commit**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/art-history-browser-verifier.test.mjs
git add tests/fixtures/u4-browser.json tests/art-history-browser-verifier.test.mjs \
  scripts/verify-art-history-browser.mjs
git commit -m "test: verify public and private Unit 4 media"
```

---

### Task 9: Add Private-Leak Release Guards and Run the Full Gate

**Files:**
- Create: `scripts/verify-art-history-private-leaks.mjs`
- Modify: `scripts/verify-art-history-release.mjs`
- Modify: `tests/art-history-browser-verifier.test.mjs`

- [ ] **Step 1: Write failing leak-verifier tests**

Test tracked `.private-media` paths, macOS user absolute paths, `file://` URLs, forbidden restricted URL hashes, and allowed public identity/source pages.

- [ ] **Step 2: Implement Git tracking and text scans**

Use `git ls-files -z` for the tracked-private-path check. Scan deployable public artifacts (`art-history-map.html`, `index.html`, `data/`, `docs/data-sources/`, `docs/art-history-sources.md`, `scripts/`, and `tests/fixtures/`) for `/Users/` and `file://`. Scan every tracked text file for extracted HTTP(S) URLs whose SHA-256 equals one of these reviewed restricted-asset hashes:

```js
const RESTRICTED_ASSET_URL_HASHES = new Set([
  '0f9ce82f5ae6f07a780932ca45aa08b6c0dafb4e1ba7b6c0c8eeaee3f0d42338',
  '1b3f63857c67468c52487134ab19be80f12641be8edd774eae983af2e7ca4161',
  '48d1689e6d3ff68eb82c1bb89fef89757884ddf0c78cfb70e1a74dc57efc11f8',
  '22c73b3d78607821ee24ec1bb1bf1b5e4a368333dc4308f8405bc30c4db7a78d',
  '444f4811b4aba88301f8865a053d4153fa55d530ec2237371a62fe16eaa532ce',
  '56292334a9b12dc5aca208e02545e8e02d109ceb45cfabd6cac0946e39ede941',
  '58549ea2e384bde855c849fd15e359420db167b3646071bc7e16f5277f9755b2',
]);
```

Hashes intentionally prevent the restricted URLs themselves from entering the repository.

- [ ] **Step 3: Add the release stage**

Run the leak verifier before browser verification:

```js
['private-media leak guard', ['scripts/verify-art-history-private-leaks.mjs']],
```

- [ ] **Step 4: Run all gates**

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  --test tests/*.test.mjs
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/validate-art-history-data.mjs
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/verify-art-history-browser.mjs
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  scripts/verify-art-history-release.mjs
```

Expected: no skipped/todo/cancelled tests, `Validated 152 AP Art History works`, browser matrix exit 0, and `Release verification passed.`

- [ ] **Step 5: Check protected files and commit**

```bash
git diff --check
git diff --exit-code 13c64724ef1861971aa483737383b04422e4e664...HEAD -- \
  world-map.html tests/fixtures/u3-canonical.json tests/fixtures/u3-browser.json \
  data/ap-art-history-unit-3-manifest.json data/ap-art-history-unit-3-rights.json
git add scripts/verify-art-history-private-leaks.mjs \
  scripts/verify-art-history-release.mjs tests/art-history-browser-verifier.test.mjs
git commit -m "test: guard Unit 4 private media release"
```

- [ ] **Step 6: Request final two-stage review**

First request spec compliance against both approved U4 specs and this plan. After it passes, request code/data/source-rights/accessibility/regression quality review. For every Critical or Important finding, add a failing regression, make the smallest fix, rerun focused and complete gates, and re-review.

---

### Task 10: Build the Ignored Private Bundle and Sync the Verified Delivery

**Files:**
- Create locally only: `.private-media/u4/overrides.js`
- Create locally only: eight `.private-media/u4/*` image files
- Source: verified U4 worktree
- Destination: `/Users/tiffanyxu/Desktop/APWH/考前冲刺_地区专题_试做版`

- [ ] **Step 1: Resolve and save the eight exact private study images**

Use the audited exact identity/source pages for The Two Fridas, Rivera's Alameda mural, Marilyn Diptych, the College Board 2010 Narcissus Garden reference view, The Bay, Lipstick, and both House in New Castle County views. AP 148 must be extracted from the current CED reference image unless an exact 2010 Paris source is independently verified. Do not use a different installation environment.

Save filenames matching the approved lower-case key convention. Verify each image visually with `view_image`; reject crops that omit the identifying subject or architecture.

- [ ] **Step 2: Write the ignored override hook**

Use exact eight-key order and exact value schema:

```js
window.AP_ART_HISTORY_PRIVATE_MEDIA = Object.freeze({
  'ap140-two-fridas::primary': Object.freeze({
    filePath: '.private-media/u4/ap140-two-fridas-primary.jpg',
    creatorOrInstitution: 'Frida Kahlo / Museo de Arte Moderno / INBAL',
    rightsNote: 'Private local study copy — rights retained',
    rightsUrl: 'https://inba.gob.mx/conoceInba/politicasapp',
  }),
  'ap143-dream-alameda-central::primary': Object.freeze({
    filePath: '.private-media/u4/ap143-dream-alameda-central-primary.jpg',
    creatorOrInstitution: 'Diego Rivera / Museo Mural Diego Rivera / INBAL',
    rightsNote: 'Private local study copy — rights retained',
    rightsUrl: 'https://arsny.com/blog/diego-rivera-artwork-licensing/',
  }),
  'ap146-marilyn-diptych::primary': Object.freeze({
    filePath: '.private-media/u4/ap146-marilyn-diptych-primary.jpg',
    creatorOrInstitution: 'Andy Warhol / Tate',
    rightsNote: 'Private local study copy — rights retained',
    rightsUrl: 'https://warholfoundation.org/about/faq/',
  }),
  'ap148-narcissus-garden::primary': Object.freeze({
    filePath: '.private-media/u4/ap148-narcissus-garden-primary.jpg',
    creatorOrInstitution: 'Yayoi Kusama / 2010 Tuileries Gardens installation',
    rightsNote: 'Private local study copy — rights retained',
    rightsUrl: 'https://yayoi-kusama.jp/intellectual-property-policy/',
  }),
  'ap149-bay::primary': Object.freeze({
    filePath: '.private-media/u4/ap149-bay-primary.jpg',
    creatorOrInstitution: 'Helen Frankenthaler / Detroit Institute of Arts',
    rightsNote: 'Private local study copy — rights retained',
    rightsUrl: 'https://dia.org/collection/rights-reproduction',
  }),
  'ap150-lipstick-caterpillar-tracks::primary': Object.freeze({
    filePath: '.private-media/u4/ap150-lipstick-caterpillar-tracks-primary.jpg',
    creatorOrInstitution: 'Claes Oldenburg / Yale University',
    rightsNote: 'Private local study copy — rights retained',
    rightsUrl: 'https://rightsstatements.org/page/InC/1.0/?language=en',
  }),
  'ap152-house-new-castle-county::exterior': Object.freeze({
    filePath: '.private-media/u4/ap152-house-new-castle-county-exterior.jpg',
    creatorOrInstitution: 'Venturi, Rauch and Scott Brown / University of Pennsylvania Architectural Archives',
    rightsNote: 'Private local study copy — rights retained',
    rightsUrl: 'https://www.design.upenn.edu/architectural-archives/copyright-and-image-requests',
  }),
  'ap152-house-new-castle-county::interior': Object.freeze({
    filePath: '.private-media/u4/ap152-house-new-castle-county-interior.jpg',
    creatorOrInstitution: 'Venturi, Rauch and Scott Brown / University of Pennsylvania Architectural Archives',
    rightsNote: 'Private local study copy — rights retained',
    rightsUrl: 'https://www.design.upenn.edu/architectural-archives/copyright-and-image-requests',
  }),
});
```

- [ ] **Step 3: Verify local private mode**

Run a local server, open `index.html?privateMedia=1`, and verify all eight private views visually, including AP 152 view switching, modal, focus restoration, and contain-fit framing. Run the public URL without the parameter and verify all eight return to the approved placeholder.

- [ ] **Step 4: Compute the exact public delivery list**

```bash
git diff --name-only 13c64724ef1861971aa483737383b04422e4e664...HEAD
```

Require no `.private-media`, `.superpowers`, `.worktrees`, protected file, or temporary entry.

- [ ] **Step 5: Request Desktop write approval and create a recoverable backup**

Back up only files in the public delivery list under the Desktop project's `.codex-backups/` timestamped directory. Copy the verified public files and compare SHA-256 values; mismatch count must be zero.

- [ ] **Step 6: Copy the private bundle separately**

Copy `.private-media/u4/` to the Desktop project only after the public hash check. Confirm the destination Git ignore rule applies and `git status --short` does not list the bundle. Compare every private file's SHA-256 between worktree and Desktop.

- [ ] **Step 7: Verify from Desktop**

Run the complete release gate from the Desktop project in public mode, then visually verify `index.html?privateMedia=1`. Require U1 11 pieces, U2 36 pieces, U3 51 pieces, U4 54 pieces, 152-work caption, eight local images, and no timeline.

- [ ] **Step 8: Hold the GitHub gate**

Invoke `superpowers:finishing-a-development-branch`. Push or open a pull request only after explicit user approval. The GitHub operation includes only tracked public files; the private bundle remains local and ignored.

---

## Completion Evidence

Before claiming completion, invoke `superpowers:verification-before-completion` and report:

- Exact public test/pass count with zero failures/skips/todos/cancellations.
- `Validated 152 AP Art History works`.
- Browser and composed release gate results.
- Exact 54-work / 63-view / 55-public-image / 8-placeholder totals.
- Git-private leak guard result.
- Protected-file diff result.
- Desktop public and private hash comparison results.
- Final branch/commit status and whether GitHub remains unpushed.
