#!/usr/bin/env node

import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RELEASE_STAGE_TIMEOUT_MS,
  runReleaseStage,
} from './art-history-release-stage.mjs';

const PROJECT_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const tests = readdirSync(join(PROJECT_ROOT, 'tests'))
  .filter((name) => name.endsWith('.test.mjs'))
  .sort()
  .map((name) => join('tests', name));

const steps = [
  ['Node test suite', ['--test', ...tests]],
  [
    'strict 152-work Units 1-4 validator',
    ['scripts/validate-art-history-data.mjs', 'art-history-map.html'],
  ],
  ['rendered browser matrix', ['scripts/verify-art-history-browser.mjs']],
];

export async function runReleaseVerification() {
  for (const [label, args] of steps) {
    process.stdout.write(`\n[release] ${label}\n`);
    await runReleaseStage({
      label,
      args,
      cwd: PROJECT_ROOT,
      timeoutMs: RELEASE_STAGE_TIMEOUT_MS,
    });
  }
  process.stdout.write('\nRelease verification passed.\n');
}

const isMain = process.argv[1]
  && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  runReleaseVerification().catch((error) => {
    process.stderr.write(`Release verification failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
