import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { loadAndValidate } from '../scripts/validate-art-history-data.mjs';

const execFileAsync = promisify(execFile);
const VALIDATOR_PATH = fileURLToPath(new URL('../scripts/validate-art-history-data.mjs', import.meta.url));
const EXPECTED_AP_NUMBERS = Array.from({ length: 36 }, (_, index) => index + 12);
const EXPECTED_NEW_WORKS = [
  {
    apNumber: 12,
    id: 'ap12-white-temple-ziggurat',
    title: 'White Temple and its ziggurat',
    site: 'Uruk, Iraq',
    culture: 'ancientNearEast',
    region: 'middleEast',
  },
  {
    apNumber: 14,
    id: 'ap14-statues-votive-figures',
    title: 'Statues of votive figures, from the Square Temple at Eshnunna (modern Tell Asmar, Iraq)',
    site: 'Eshnunna (Tell Asmar), Iraq',
    culture: 'ancientNearEast',
    region: 'middleEast',
  },
  {
    apNumber: 16,
    id: 'ap16-standard-of-ur',
    title: 'Standard of Ur from the Royal Tombs at Ur (modern Tell el-Muqayyar, Iraq)',
    site: 'Ur, Iraq',
    culture: 'ancientNearEast',
    region: 'middleEast',
  },
  {
    apNumber: 19,
    id: 'ap19-code-of-hammurabi',
    title: 'The Code of Hammurabi',
    site: 'Susa, Iran',
    culture: 'ancientNearEast',
    region: 'middleEast',
  },
  {
    apNumber: 25,
    id: 'ap25-lamassu-sargon-ii',
    title: 'Lamassu from the citadel of Sargon II, Dur Sharrukin (modern Khorsabad, Iraq)',
    site: 'Dur Sharrukin (Khorsabad), Iraq',
    culture: 'ancientNearEast',
    region: 'middleEast',
  },
  {
    apNumber: 29,
    id: 'ap29-sarcophagus-of-the-spouses',
    title: 'Sarcophagus of the Spouses',
    site: 'Cerveteri, Italy',
    culture: 'etruscan',
    region: 'southernEurope',
  },
  {
    apNumber: 30,
    id: 'ap30-apadana-darius-xerxes',
    title: 'Audience Hall (apadana) of Darius and Xerxes',
    site: 'Persepolis, Iran',
    culture: 'ancientNearEast',
    region: 'middleEast',
  },
  {
    apNumber: 31,
    id: 'ap31-temple-minerva-apollo',
    title: 'Temple of Minerva (Veii, near Rome, Italy) and sculpture of Apollo',
    site: 'Veii, Italy',
    culture: 'etruscan',
    region: 'southernEurope',
  },
  {
    apNumber: 32,
    id: 'ap32-tomb-of-the-triclinium',
    title: 'Tomb of the Triclinium',
    site: 'Tarquinia, Italy',
    culture: 'etruscan',
    region: 'southernEurope',
  },
];

test('CLI validates the supplied HTML path', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'art-history-validator-'));
  const htmlPath = join(directory, 'fixture.html');
  await writeFile(
    htmlPath,
    '<script id="artwork-data" type="application/json">[]</script>',
    'utf8',
  );

  try {
    const { stdout } = await execFileAsync(process.execPath, [VALIDATOR_PATH, htmlPath]);
    assert.equal(stdout, 'Validated 0 AP Art History works\n');
  } finally {
    await rm(directory, { recursive: true });
  }
});

test('contains the complete AP 12–47 Unit 2 manifest', async () => {
  const artworks = await loadAndValidate();
  const apNumbers = artworks.map(({ apNumber }) => apNumber).sort((a, b) => a - b);

  assert.equal(artworks.length, 36);
  assert.deepEqual(apNumbers, EXPECTED_AP_NUMBERS);
});

test('imports the exact nine missing works with approved classification metadata', async () => {
  const artworks = await loadAndValidate();

  for (const expected of EXPECTED_NEW_WORKS) {
    const artwork = artworks.find(({ id }) => id === expected.id);
    assert.ok(artwork, `missing ${expected.id}`);
    assert.equal(artwork.apNumber, expected.apNumber, `${expected.id} AP number`);
    assert.equal(artwork.titleEn, expected.title, `${expected.id} title`);
    assert.equal(artwork.siteName, expected.site, `${expected.id} site`);
    assert.equal(artwork.culture, expected.culture, `${expected.id} culture`);
    assert.equal(artwork.region, expected.region, `${expected.id} region`);
    assert.equal(artwork.unit, 2, `${expected.id} unit`);
  }
});

test('assigns every current work to Unit 2 with culture and region metadata', async () => {
  const artworks = await loadAndValidate();

  for (const artwork of artworks) {
    assert.equal(artwork.unit, 2, `${artwork.id} must be in Unit 2`);
    assert.equal(typeof artwork.culture, 'string', `${artwork.id} must have a culture`);
    assert.ok(artwork.culture.trim(), `${artwork.id} must have a non-empty culture`);
    assert.equal(typeof artwork.region, 'string', `${artwork.id} must have a region`);
    assert.ok(artwork.region.trim(), `${artwork.id} must have a non-empty region`);
  }
});

test('uses unique artwork ids and AP numbers', async () => {
  const artworks = await loadAndValidate();
  const ids = artworks.map(({ id }) => id);
  const apNumbers = artworks.map(({ apNumber }) => apNumber);

  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(apNumbers).size, apNumbers.length);
});

test('resolves comparison ids and keeps coordinates inside the map', async () => {
  const artworks = await loadAndValidate();
  const ids = new Set(artworks.map(({ id }) => id));

  for (const artwork of artworks) {
    assert.ok(artwork.coordinates.x >= 0 && artwork.coordinates.x <= 1200);
    assert.ok(artwork.coordinates.y >= 0 && artwork.coordinates.y <= 700);
    for (const comparisonId of artwork.comparisonIds) {
      assert.ok(ids.has(comparisonId), `${artwork.id} references unknown ${comparisonId}`);
    }
  }
});

test('keeps the approved AP 27 source coordinates', async () => {
  const artworks = await loadAndValidate();
  const kouros = artworks.find(({ id }) => id === 'ap27-anavysos-kouros');

  assert.deepEqual(kouros?.coordinates, { x: 405, y: 285 });
});
