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
const EXPECTED_AP_NUMBERS = [
  13, 15, 17, 18, 20, 21, 22, 23, 24, 26, 27, 28, 33, 34,
  35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
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

test('contains the exact approved 27-work manifest', async () => {
  const artworks = await loadAndValidate();
  const apNumbers = artworks.map(({ apNumber }) => apNumber).sort((a, b) => a - b);

  assert.deepEqual(apNumbers, EXPECTED_AP_NUMBERS);
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
