import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const SOURCE_LEDGER_PATH = new URL(
  '../docs/art-history-sources.md',
  import.meta.url,
);
const U1_SOURCE_LEDGER_PATH = new URL(
  '../docs/data-sources/u1-source-ledger.md',
  import.meta.url,
);
const U1_CANONICAL_PATH = new URL(
  './fixtures/u1-canonical.json',
  import.meta.url,
);
const UNAFFECTED_FIXTURE_PATH = new URL(
  './fixtures/u2-unaffected-legacy.json',
  import.meta.url,
);
const CORRECTED_FIXTURE_PATH = new URL(
  './fixtures/u2-corrected-and-imported.json',
  import.meta.url,
);
const U4_MANIFEST_PATH = new URL(
  '../data/ap-art-history-unit-4-manifest.json',
  import.meta.url,
);
const U4_CANONICAL_PATH = new URL(
  './fixtures/u4-canonical.json',
  import.meta.url,
);
const U4_RIGHTS_PATH = new URL(
  '../data/ap-art-history-unit-4-rights.json',
  import.meta.url,
);
const U4_PLACEHOLDERS_PATH = new URL(
  '../data/ap-art-history-unit-4-public-placeholders.json',
  import.meta.url,
);
const U4_LEDGER_PATH = new URL(
  '../docs/data-sources/u4-source-ledger.md',
  import.meta.url,
);

const UNAFFECTED_IDS = [
  'ap13-palette-of-king-narmer',
  'ap15-seated-scribe',
  'ap17-great-pyramids-giza',
  'ap18-king-menkaura-and-queen',
  'ap20-temple-of-amun-re-karnak',
  'ap21-mortuary-temple-hatshepsut',
  'ap22-akhenaten-nefertiti-daughters',
  'ap24-last-judgment-of-hunefer',
  'ap27-anavysos-kouros',
  'ap28-peplos-kore',
  'ap33-niobides-krater',
  'ap34-doryphoros',
  'ap36-grave-stele-hegeso',
  'ap37-winged-victory-samothrace',
  'ap38-great-altar-pergamon',
  'ap39-house-of-the-vettii',
  'ap40-alexander-mosaic',
  'ap44-colosseum',
  'ap45-forum-of-trajan',
  'ap46-pantheon',
  'ap47-ludovisi-battle-sarcophagus',
];

const CORRECTED_AND_IMPORTED_IDS = [
  'ap12-white-temple-ziggurat',
  'ap14-statues-votive-figures',
  'ap16-standard-of-ur',
  'ap19-code-of-hammurabi',
  'ap23-tutankhamun-innermost-coffin',
  'ap25-lamassu-sargon-ii',
  'ap26-athenian-agora',
  'ap29-sarcophagus-of-the-spouses',
  'ap30-apadana-darius-xerxes',
  'ap31-temple-minerva-apollo',
  'ap32-tomb-of-the-triclinium',
  'ap35-athenian-acropolis',
  'ap41-seated-boxer',
  'ap42-head-of-a-roman-patrician',
  'ap43-augustus-prima-porta',
];

const REQUIRED_U3_CROSS_UNIT_COMPARISONS = new Map([
  ['ap49-santa-sabina', 'ap46-pantheon'],
  ['ap52-hagia-sophia', 'ap46-pantheon'],
  ['ap58-church-sainte-foy', 'ap23-tutankhamun-innermost-coffin'],
  ['ap81-codex-mendoza-frontispiece', 'ap19-code-of-hammurabi'],
  ['ap89-ecstasy-saint-teresa', 'ap46-pantheon'],
]);

const U4_RESTRICTED_MEDIA_KEYS = [
  'ap140-two-fridas::primary',
  'ap143-dream-alameda-central::primary',
  'ap146-marilyn-diptych::primary',
  'ap148-narcissus-garden::primary',
  'ap149-bay::primary',
  'ap150-lipstick-caterpillar-tracks::primary',
  'ap152-house-new-castle-county::exterior',
  'ap152-house-new-castle-county::interior',
];

const COMPLETE_ARTWORK_FIELDS = [
  'id',
  'apNumber',
  'titleEn',
  'titleZh',
  'unit',
  'culture',
  'region',
  'period',
  'date',
  'artistCulture',
  'siteName',
  'siteQualifier',
  'coordinates',
  'medium',
  'workType',
  'function',
  'form',
  'content',
  'context',
  'recognitionAnchors',
  'comparisonIds',
  'imageUrl',
  'imageAlt',
  'imageSourceName',
  'imageSourceUrl',
  'keywords',
].sort();

const EXPECTED_NOTES_REFERENCES = [
  'APAH notes.pdf, p. 6',
  'APAH notes.pdf, pp. 6–7',
  'APAH notes.pdf, p. 7',
  'APAH notes.pdf, pp. 7–8',
  'APAH notes.pdf, pp. 8–9',
  'APAH notes.pdf, pp. 8–9',
  'APAH notes.pdf, pp. 9–10',
  'APAH notes.pdf, pp. 10–11',
  'APAH notes.pdf, pp. 10–11',
  'APAH notes.pdf, pp. 11–12',
  'APAH notes.pdf, pp. 12–13',
  'APAH notes.pdf, pp. 13–14',
  'APAH notes.pdf, pp. 14–15',
  'APAH notes.pdf, pp. 14–15',
  'APAH notes.pdf, pp. 20–21',
  'APAH notes.pdf, pp. 16–17',
  'APAH notes.pdf, pp. 17–18',
  'APAH notes.pdf, p. 16',
  'APAH notes.pdf, p. 17',
  'APAH notes.pdf, pp. 17–18',
  'APAH notes.pdf, pp. 18–19',
  'APAH notes.pdf, pp. 18–19',
  'APAH notes.pdf, pp. 19–20',
  'APAH notes.pdf, pp. 15–16',
  'APAH notes.pdf, pp. 21–22',
  'APAH notes.pdf, pp. 22–23',
  'APAH notes.pdf, pp. 23–24',
  'APAH notes.pdf, pp. 24–25',
  'APAH notes.pdf, pp. 25–26',
  'APAH notes.pdf, pp. 25–26',
  'APAH notes.pdf, pp. 26–27',
  'APAH notes.pdf, pp. 26–27',
  'APAH notes.pdf, pp. 26–27',
  'APAH notes.pdf, pp. 27–28',
  'APAH notes.pdf, pp. 28–29',
  'APAH notes.pdf, p. 29',
];

function parseJsonBlock(html, id) {
  const match = html.match(new RegExp(
    `<script id="${id}" type="application/json">([\\s\\S]*?)<\\/script>`,
  ));
  assert.ok(match, `missing ${id}`);
  return JSON.parse(match[1]);
}

async function loadActualData() {
  const html = await readFile(HTML_PATH, 'utf8');
  return {
    artworks: parseJsonBlock(html, 'artwork-data'),
    credits: parseJsonBlock(html, 'image-credit-data'),
  };
}

async function loadFixture(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function canonicalizeArtwork(artwork) {
  return {
    ...artwork,
    siteQualifier: artwork.siteQualifier ?? null,
  };
}

async function assertFixtureMatches(path, expectedIds) {
  const [{ artworks, credits }, fixture] = await Promise.all([
    loadActualData(),
    loadFixture(path),
  ]);
  const actualById = new Map(artworks.map((artwork) => [artwork.id, artwork]));
  const actualArtworks = expectedIds.map((id) => {
    const artwork = actualById.get(id);
    assert.ok(artwork, `missing fixture artwork ${id}`);
    return canonicalizeArtwork(artwork);
  });
  const actualCredits = Object.fromEntries(
    expectedIds.map((id) => [id, credits[id]]),
  );

  assert.deepEqual(
    fixture.artworks.map(({ id }) => id),
    expectedIds,
    'fixture must contain the exact intended artwork set in canonical order',
  );
  for (const artwork of fixture.artworks) {
    assert.deepEqual(
      Object.keys(artwork).sort(),
      COMPLETE_ARTWORK_FIELDS,
      `${artwork.id} fixture must contain every canonical artwork field`,
    );
  }
  assert.deepEqual(fixture.artworks, actualArtworks);
  assert.deepEqual(fixture.credits, actualCredits);
  assert.deepEqual(
    Object.keys(fixture.credits),
    expectedIds,
    'fixture must contain one complete credit record per intended artwork',
  );
}

function splitLedgerRow(line) {
  assert.match(line, /^\|.*\|$/, `malformed ledger row: ${line}`);
  return line.split('|').slice(1, -1).map((cell) => cell.trim());
}

function parseLedger(markdown) {
  return markdown
    .split('\n')
    .filter((line) => /^\|\s*\d+\s*\|/.test(line))
    .map(splitLedgerRow);
}

function markdownLinkUrl(cell) {
  return cell.match(/\]\((https:\/\/.*)\)$/)?.[1] ?? '';
}

test('live Unit 2 remains the exact AP 12–47 sequence', async () => {
  const { artworks } = await loadActualData();
  const liveU2 = artworks.filter(({ unit }) => unit === 2);

  assert.equal(liveU2.length, 36);
  assert.deepEqual(
    liveU2.map(({ apNumber }) => apNumber),
    Array.from({ length: 36 }, (_, index) => index + 12),
  );
});

test('U1 and U2 stay field-for-field frozen after U3 import', async () => {
  const [
    { artworks, credits },
    u1Fixture,
    unaffectedFixture,
    correctedFixture,
  ] = await Promise.all([
    loadActualData(),
    loadFixture(U1_CANONICAL_PATH),
    loadFixture(UNAFFECTED_FIXTURE_PATH),
    loadFixture(CORRECTED_FIXTURE_PATH),
  ]);
  const frozenFixtures = [
    ...u1Fixture.artworks,
    ...unaffectedFixture.artworks,
    ...correctedFixture.artworks,
  ].sort((first, second) => first.apNumber - second.apNumber);
  const expectedIds = frozenFixtures.map(({ id }) => id);
  const liveFrozenArtworks = artworks.filter(({ unit }) => unit <= 2);
  const canonicalLiveFrozenArtworks = liveFrozenArtworks.map((artwork) => (
    artwork.unit === 2 ? canonicalizeArtwork(artwork) : artwork
  ));
  const liveFrozenCredits = Object.fromEntries(
    expectedIds.map((id) => [id, credits[id]]),
  );
  const expectedCredits = {
    ...u1Fixture.credits,
    ...unaffectedFixture.credits,
    ...correctedFixture.credits,
  };

  assert.deepEqual(
    liveFrozenArtworks.map(({ apNumber }) => apNumber),
    Array.from({ length: 47 }, (_, index) => index + 1),
    'U1/U2 must remain the exact AP 1–47 sequence',
  );
  assert.deepEqual(
    liveFrozenArtworks.map(({ id }) => id),
    expectedIds,
    'U1/U2 must have no missing, extra, or reordered ids',
  );
  assert.deepEqual(
    canonicalLiveFrozenArtworks,
    frozenFixtures,
    'all U1/U2 artwork fields and media arrays must match their canonical fixtures',
  );
  assert.deepEqual(
    liveFrozenCredits,
    expectedCredits,
    'all U1/U2 image credits must match their canonical fixtures',
  );
  assert.deepEqual(
    Object.keys(credits).filter((id) => expectedIds.includes(id)).sort(),
    [...expectedIds].sort(),
    'U1/U2 credits must have the exact AP 1–47 keyset',
  );
});

test('all U3 comparisons resolve and retain the required cross-unit targets', async () => {
  const { artworks } = await loadActualData();
  const ids = new Set(artworks.map(({ id }) => id));
  const u3 = artworks.filter(({ unit }) => unit === 3);

  assert.equal(artworks.length, 152);
  assert.equal(u3.length, 51);
  for (const work of u3) {
    assert.ok(
      work.comparisonIds.length >= 1,
      `${work.id} must retain at least one comparison`,
    );
    assert.equal(
      new Set(work.comparisonIds).size,
      work.comparisonIds.length,
      `${work.id} must not repeat a comparison target`,
    );
    for (const comparisonId of work.comparisonIds) {
      assert.notEqual(comparisonId, work.id, `${work.id} must not target itself`);
      assert.ok(ids.has(comparisonId), `${work.id} target ${comparisonId} must resolve`);
    }
  }

  for (const [sourceId, targetId] of REQUIRED_U3_CROSS_UNIT_COMPARISONS) {
    const source = u3.find(({ id }) => id === sourceId);
    assert.ok(source, `missing required comparison source ${sourceId}`);
    assert.ok(
      source.comparisonIds.includes(targetId),
      `${sourceId} must retain cross-unit target ${targetId}`,
    );
    assert.equal(
      artworks.find(({ id }) => id === targetId)?.unit,
      2,
      `${targetId} must remain a Unit 2 target`,
    );
  }
});

test('unaffected legacy records and credits stay field-for-field preserved', async () => {
  await assertFixtureMatches(UNAFFECTED_FIXTURE_PATH, UNAFFECTED_IDS);
});

test('corrected and imported records and credits stay field-for-field preserved', async () => {
  await assertFixtureMatches(
    CORRECTED_FIXTURE_PATH,
    CORRECTED_AND_IMPORTED_IDS,
  );
});

test('live source ledger matches all 36 canonical AP 12–47 records', async () => {
  const [{ artworks, credits }, ledger] = await Promise.all([
    loadActualData(),
    readFile(SOURCE_LEDGER_PATH, 'utf8'),
  ]);
  const u2 = artworks.filter(({ unit }) => unit === 2);
  const rows = parseLedger(ledger);

  assert.equal(u2.length, 36);
  assert.equal(rows.length, 36);
  assert.doesNotMatch(
    ledger,
    /Golden mask|Tutankhamun mask|Old Market Woman|明确排除/,
  );
  assert.doesNotMatch(
    ledger,
    /\]\(\.\.\/APAH%20notes\.pdf\)/,
    'ledger must not link to a PDF that is not in the repository',
  );
  rows.forEach((cells, index) => {
    assert.equal(cells.length, 9, `ledger row ${index + 1} must have 9 cells`);
    const artwork = u2[index];
    const credit = credits[artwork.id];
    const [
      apNumber,
      id,
      title,
      culture,
      officialSource,
      notesSource,
      imageSource,
      directImage,
      creditAndLicense,
    ] = cells;

    assert.equal(Number(apNumber), artwork.apNumber);
    assert.equal(id, `\`${artwork.id}\``);
    assert.equal(title, artwork.titleEn);
    assert.equal(culture, artwork.culture);
    assert.match(officialSource, /College Board.*CED/);
    assert.equal(notesSource, EXPECTED_NOTES_REFERENCES[index]);
    assert.equal(markdownLinkUrl(imageSource), artwork.imageSourceUrl);
    assert.equal(markdownLinkUrl(directImage), artwork.imageUrl);
    assert.match(creditAndLicense, new RegExp(
      credit.creatorOrInstitution.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    ));
    assert.match(creditAndLicense, new RegExp(
      credit.licenseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    ));
    assert.equal(markdownLinkUrl(creditAndLicense), credit.licenseUrl);
  });
});

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
    const workCredits = Array.isArray(credits[work.id])
      ? credits[work.id]
      : [credits[work.id]];
    return media.map((image, index) => ({
      work,
      image,
      credit: workCredits[index],
    }));
  });

  assert.equal(expected.length, 12);
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
    assert.match(creator, new RegExp(
      credit.creatorOrInstitution.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    ));
    assert.equal(license, credit.licenseName);
    assert.equal(markdownLinkUrl(licenseUrl), credit.licenseUrl);
    assert.ok(identityCheck.length > 20);
  });

  const stonehengeRows = rows.filter(([apNumber]) => Number(apNumber) === 8);
  assert.deepEqual(
    stonehengeRows.map(([, view]) => view),
    ['Aerial overview', 'Ground-level view'],
  );
});

test('U4 audited source bundle exactly matches the imported live Unit 4 projection', async () => {
  const [
    { artworks, credits },
    manifest,
    fixture,
    rights,
    placeholders,
    ledger,
  ] = await Promise.all([
    loadActualData(),
    loadFixture(U4_MANIFEST_PATH),
    loadFixture(U4_CANONICAL_PATH),
    loadFixture(U4_RIGHTS_PATH),
    loadFixture(U4_PLACEHOLDERS_PATH),
    readFile(U4_LEDGER_PATH, 'utf8'),
  ]);
  const expectedWorkIds = Object.values(manifest).map(({ id }) => id);
  const expectedMediaKeys = Object.values(manifest).flatMap((work) => (
    work.requiredViewIds.map((viewId) => `${work.id}::${viewId}`)
  ));
  const ledgerKeys = parseLedger(ledger).map((cells) => (
    `${cells[1].replaceAll('`', '')}::${cells[2]}`
  ));

  const liveU4Artworks = artworks.filter(({ unit }) => unit === 4);
  const liveU4Credits = Object.fromEntries(expectedWorkIds.map((id) => [id, credits[id]]));
  assert.equal(artworks.length, 152);
  assert.deepEqual(liveU4Artworks, fixture.artworks);
  assert.deepEqual(liveU4Credits, fixture.credits);
  assert.deepEqual(fixture.artworks.map(({ id }) => id), expectedWorkIds);
  assert.deepEqual(Object.keys(fixture.credits), expectedWorkIds);
  assert.deepEqual(Object.keys(rights), expectedMediaKeys);
  assert.deepEqual(Object.keys(placeholders), U4_RESTRICTED_MEDIA_KEYS);
  assert.deepEqual(ledgerKeys, expectedMediaKeys);
});
