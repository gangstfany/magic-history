import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const SOURCE_LEDGER_PATH = new URL(
  '../docs/art-history-sources.md',
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

function parseLedger(markdown) {
  return markdown
    .split('\n')
    .filter((line) => /^\|\s*\d+\s*\|/.test(line))
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
}

function markdownLinkUrl(cell) {
  return cell.match(/\]\((https:\/\/.*)\)$/)?.[1] ?? '';
}

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
  const rows = parseLedger(ledger);

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
    const artwork = artworks[index];
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
