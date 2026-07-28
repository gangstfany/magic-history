#!/usr/bin/env node

import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const tests = readdirSync(join(PROJECT_ROOT, 'tests'))
  .filter((name) => name.endsWith('.test.mjs'))
  .sort()
  .map((name) => join('tests', name));

const steps = [
  ['Node test suite', ['--test', ...tests]],
  [
    'strict 47-work Units 1-2 validator',
    ['scripts/validate-art-history-data.mjs', 'art-history-map.html'],
  ],
  ['rendered browser matrix', ['scripts/verify-art-history-browser.mjs']],
];

for (const [label, args] of steps) {
  process.stdout.write(`\n[release] ${label}\n`);
  const result = spawnSync(process.execPath, args, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });
  if (result.error || result.status !== 0) {
    const detail = result.error?.message || `exit code ${result.status}`;
    process.stderr.write(`Release verification failed during ${label}: ${detail}\n`);
    process.exit(result.status || 1);
  }
}

process.stdout.write('\nRelease verification passed.\n');
