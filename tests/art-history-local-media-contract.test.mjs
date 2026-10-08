import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ALLOWED_OPEN_LICENSE_CLASSES, MAX_LOCAL_MEDIA_BYTES,
  assertLocalMediaContract, flattenRequiredViewKeys,
} from '../scripts/art-history-local-media-contract.mjs';

function fixture(t, unit = 6) {
  const rootDir = mkdtempSync(join(tmpdir(), 'art-history-contract-'));
  t.after(() => rmSync(rootDir, { recursive: true, force: true }));
  const id = unit === 5 ? 'ap153-example' : 'ap167-example';
  const ap = id.slice(0, 5);
  const localAssetPath = `assets/art-history/u${unit}/${ap}-primary.webp`;
  mkdirSync(join(rootDir, `assets/art-history/u${unit}`), { recursive: true });
  writeFileSync(join(rootDir, localAssetPath), Buffer.from('image'));
  const row = (open) => ({
    creatorOrInstitution: 'Museum', sourcePageUrl: 'https://example.org/source',
    originalFileUrl: open ? 'https://example.org/image.webp' : null,
    localAssetPath: open ? localAssetPath : null,
    licenseClass: open ? 'cc-by' : 'unresolved', licenseName: open ? 'CC BY 4.0' : 'Unverified',
    licenseUrl: open ? 'https://creativecommons.org/licenses/by/4.0/' : null,
    releaseClass: open ? 'open' : 'restricted', accessedOn: '2026-10-08',
    identityNote: 'Verified identity', derivativeNote: 'No changes',
  });
  return { rootDir, manifest: { [ap.slice(2)]: { id, requiredViewIds: ['primary', 'context'] } },
    artworks: [{ id, unit, images: [{ id: 'primary', imageUrl: localAssetPath }, { id: 'context', imageUrl: null, imageSourceName: 'Museum', imageSourceUrl: 'https://example.org/source' }] }],
    rights: { [`${id}::primary`]: row(true), [`${id}::context`]: row(false) },
    authority: { [`${id}::context`]: { imageSourceName: 'Museum', imageSourceUrl: 'https://example.org/source', rightsNote: 'Permission unverified' } } };
}

test('exports the uniform limits and flattens manifest view order', (t) => {
  const data = fixture(t);
  assert.deepEqual(ALLOWED_OPEN_LICENSE_CLASSES, ['public-domain', 'cc0', 'cc-by', 'cc-by-sa']);
  assert.equal(MAX_LOCAL_MEDIA_BYTES, 1_572_864);
  assert.deepEqual(flattenRequiredViewKeys(data.manifest), Object.keys(data.rights));
});
for (const unit of [5, 6]) test(`accepts local open and unresolved U${unit} views`, (t) => {
  assert.doesNotThrow(() => assertLocalMediaContract(fixture(t, unit)));
});

const mutations = [
  ['remote live image', (d) => { d.artworks[0].images[0].imageUrl = 'https://example.org/live.jpg'; }, /must use a repository-local image path/],
  ['missing local file', (d) => rmSync(join(d.rootDir, Object.values(d.rights)[0].localAssetPath)), /file/],
  ['disallowed license', (d) => { Object.values(d.rights)[0].licenseClass = 'cc-by-nc'; }, /license/],
  ['duplicate local asset', (d) => { Object.assign(Object.values(d.rights)[1], Object.values(d.rights)[0]); d.artworks[0].images[1].imageUrl = d.artworks[0].images[0].imageUrl; }, /duplicate/],
  ['oversize file', (d) => writeFileSync(join(d.rootDir, Object.values(d.rights)[0].localAssetPath), Buffer.alloc(1_572_865)), /size/],
  ['authority on open view', (d) => { d.authority[Object.keys(d.rights)[0]] = {}; }, /authority/],
  ['noncanonical path', (d) => { Object.values(d.rights)[0].localAssetPath = 'assets/art-history/u6/other.webp'; }, /canonical/],
  ['rights key order', (d) => { d.rights = Object.fromEntries(Object.entries(d.rights).reverse()); }, /order/],
  ['field order', (d) => { const row = Object.values(d.rights)[0]; const value = row.creatorOrInstitution; delete row.creatorOrInstitution; row.creatorOrInstitution = value; }, /field order/],
  ['invalid access date', (d) => { Object.values(d.rights)[0].accessedOn = '2026-02-30'; }, /date/],
  ['insecure evidence', (d) => { Object.values(d.rights)[0].sourcePageUrl = 'http://example.org'; }, /HTTPS/],
  ['zero size file', (d) => writeFileSync(join(d.rootDir, Object.values(d.rights)[0].localAssetPath), ''), /size/],
  ['open media mismatch', (d) => { d.artworks[0].images[0].imageUrl = null; }, /alignment/],
  ['restricted without authority', (d) => { d.authority = {}; }, /authority/],
  ['restricted authority mismatch', (d) => { Object.values(d.authority)[0].imageSourceName = 'Other'; }, /authority/],
  ['insecure authority URL', (d) => { Object.values(d.authority)[0].imageSourceUrl = 'http://example.org'; }, /HTTPS/],
  ['missing live view', (d) => { d.artworks[0].images.pop(); }, /view/],
  ['duplicate live work', (d) => { d.artworks.push(structuredClone(d.artworks[0])); }, /view/],
];
for (const path of ['http://example.org/a.jpg', '/tmp/a.jpg', '.private-media/a.jpg', 'file:///tmp/a.jpg']) {
  mutations.push([`unsafe live path ${path}`, (d) => { d.artworks[0].images[0].imageUrl = path; }, /must use a repository-local image path/]);
}
for (const [name, mutate, error] of mutations) test(`rejects ${name}`, (t) => {
  const data = fixture(t); mutate(data);
  assert.throws(() => assertLocalMediaContract(data), error);
});
