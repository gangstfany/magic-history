import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const steps = [
  ['Node tests', ['--test', 'tests/apush-data.test.mjs']],
  ['strict Period 1 validator', ['scripts/validate-apush-data.mjs']],
  ['browser matrix', ['scripts/verify-apush-browser.mjs']],
];

for (const [name, args] of steps) {
  console.log(`\n== ${name} ==`);
  const result = spawnSync(process.execPath, args, { cwd: PROJECT_ROOT, stdio: 'inherit' });
  if (result.error) {
    console.error(`${name} could not start: ${result.error.message}`);
    process.exit(result.error.code === 'ENOENT' ? 1 : 1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('\nAPUSH Period 1 release verification passed');
