#!/usr/bin/env node

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PRIVATE_MEDIA_SEGMENT = '.private-media/';
const MAC_USER_PREFIX = ['', 'Users', ''].join('/');
const FILE_URL_PREFIX = ['file', '://'].join('');

export const RESTRICTED_ASSET_URL_HASHES = new Set([
  '0f9ce82f5ae6f07a780932ca45aa08b6c0dafb4e1ba7b6c0c8eeaee3f0d42338',
  '1b3f63857c67468c52487134ab19be80f12641be8edd774eae983af2e7ca4161',
  '48d1689e6d3ff68eb82c1bb89fef89757884ddf0c78cfb70e1a74dc57efc11f8',
  '22c73b3d78607821ee24ec1bb1bf1b5e4a368333dc4308f8405bc30c4db7a78d',
  '444f4811b4aba88301f8865a053d4153fa55d530ec2237371a62fe16eaa532ce',
  '56292334a9b12dc5aca208e02545e8e02d109ceb45cfabd6cac0946e39ede941',
  '58549ea2e384bde855c849fd15e359420db167b3646071bc7e16f5277f9755b2',
]);

export function hashAssetUrl(url) {
  return createHash('sha256').update(url).digest('hex');
}

export function assertNoTrackedPrivatePaths(paths) {
  const leaked = paths.find((path) => (
    path.startsWith(PRIVATE_MEDIA_SEGMENT)
    || path.includes(`/${PRIVATE_MEDIA_SEGMENT}`)
  ));
  assert.equal(leaked, undefined, `tracked private-media path: ${leaked}`);
}

export function assertNoAbsolutePrivatePaths(entries) {
  for (const { path, text } of entries) {
    assert.equal(
      text.includes(MAC_USER_PREFIX),
      false,
      `Public artifact ${path} contains forbidden ${MAC_USER_PREFIX} path`,
    );
    assert.equal(
      text.includes(FILE_URL_PREFIX),
      false,
      `Public artifact ${path} contains forbidden ${FILE_URL_PREFIX} URL`,
    );
  }
}

function extractHttpsUrls(text) {
  return [...text.matchAll(/https:\/\/[^\s"'<>`\\]+/g)]
    .map(([url]) => url.replace(/[),.;\]}]+$/g, ''));
}

export function assertNoRestrictedAssetUrls(
  entries,
  restrictedHashes = RESTRICTED_ASSET_URL_HASHES,
) {
  for (const { path, text } of entries) {
    for (const url of extractHttpsUrls(text)) {
      const hash = hashAssetUrl(url);
      assert.equal(
        restrictedHashes.has(hash),
        false,
        `${path} contains restricted asset URL hash ${hash}`,
      );
    }
  }
}

function isDeployablePublicArtifact(path) {
  return (
    path === 'art-history-map.html'
    || path === 'index.html'
    || path === 'docs/art-history-sources.md'
    || path.startsWith('data/')
    || path.startsWith('docs/data-sources/')
    || path.startsWith('scripts/')
    || path.startsWith('tests/fixtures/')
  );
}

async function loadTextEntries(root, paths) {
  const entries = [];
  for (const path of paths) {
    const content = await readFile(join(root, path));
    if (content.includes(0)) continue;
    entries.push({ path, text: content.toString('utf8') });
  }
  return entries;
}

export async function runPrivateLeakVerification(root = PROJECT_ROOT) {
  const trackedOutput = execFileSync('git', ['ls-files', '-z'], {
    cwd: root,
    encoding: 'utf8',
  });
  const trackedPaths = trackedOutput.split('\0').filter(Boolean);
  assertNoTrackedPrivatePaths(trackedPaths);

  const trackedText = await loadTextEntries(root, trackedPaths);
  const deployableText = trackedText.filter(({ path }) => isDeployablePublicArtifact(path));
  assertNoAbsolutePrivatePaths(deployableText);
  assertNoRestrictedAssetUrls(trackedText);
  return {
    trackedFiles: trackedPaths.length,
    trackedTextFiles: trackedText.length,
    deployableTextFiles: deployableText.length,
    restrictedHashCount: RESTRICTED_ASSET_URL_HASHES.size,
  };
}

const isMain = process.argv[1]
  && fileURLToPath(import.meta.url) === normalize(process.argv[1]);

if (isMain) {
  runPrivateLeakVerification()
    .then((result) => {
      process.stdout.write(`Private media leak verification passed: ${JSON.stringify(result)}\n`);
    })
    .catch((error) => {
      process.stderr.write(`Private media leak verification failed: ${error.message}\n`);
      process.exitCode = 1;
    });
}
