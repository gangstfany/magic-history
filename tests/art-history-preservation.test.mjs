import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const UNAFFECTED_FIXTURE_PATH = new URL(
  './fixtures/u2-unaffected-legacy.json',
  import.meta.url,
);
const CORRECTED_FIXTURE_PATH = new URL(
  './fixtures/u2-corrected-and-imported.json',
  import.meta.url,
);

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
  return JSON.parse(await readFile(path, 'utf8')).records;
}

function projectRecord(artwork, credit, expected) {
  return Object.fromEntries(
    Object.keys(expected).map((field) => [
      field,
      field === 'credit' ? credit : artwork[field],
    ]),
  );
}

async function assertFixtureMatches(path) {
  const [{ artworks, credits }, expectedRecords] = await Promise.all([
    loadActualData(),
    loadFixture(path),
  ]);
  const actualById = new Map(artworks.map((artwork) => [artwork.id, artwork]));
  const actualRecords = expectedRecords.map((expected) => {
    const artwork = actualById.get(expected.id);
    assert.ok(artwork, `missing fixture artwork ${expected.id}`);
    return projectRecord(artwork, credits[expected.id], expected);
  });
  assert.deepEqual(actualRecords, expectedRecords);
}

test('unaffected legacy content, sites, coordinates, images, and credits stay deeply preserved', async () => {
  await assertFixtureMatches(UNAFFECTED_FIXTURE_PATH);
});

test('corrected and imported records match exact identifying, media, coordinate, comparison, image, and credit fixtures', async () => {
  await assertFixtureMatches(CORRECTED_FIXTURE_PATH);
});

test('corrected and imported records match exact Unit 2 culture and region classifications', async () => {
  const [{ artworks }, fixtureSource] = await Promise.all([
    loadActualData(),
    readFile(CORRECTED_FIXTURE_PATH, 'utf8'),
  ]);
  const classifications = JSON.parse(fixtureSource).classifications;
  const artworkById = new Map(artworks.map((artwork) => [artwork.id, artwork]));
  const actual = Object.fromEntries(
    Object.entries(classifications).map(([id, expected]) => {
      const artwork = artworkById.get(id);
      assert.ok(artwork, `missing classified artwork ${id}`);
      return [
        id,
        Object.fromEntries(
          Object.keys(expected).map((field) => [field, artwork[field]]),
        ),
      ];
    }),
  );
  assert.deepEqual(actual, classifications);
});
