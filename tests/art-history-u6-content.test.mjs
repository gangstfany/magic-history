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
  const expectedIds = [...REQUIRED_VIEWS.keys()].map(String);

  assert.deepEqual(Object.keys(manifest), expectedIds);
  assert.equal([...REQUIRED_VIEWS.values()].flat().length, 23);
  for (const [id, requiredViewIds] of REQUIRED_VIEWS) {
    assert.deepEqual(manifest[id].requiredViewIds, requiredViewIds, `AP ${id} view order`);
  }
});
