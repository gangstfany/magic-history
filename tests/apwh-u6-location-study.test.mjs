import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const moduleUrl = new URL('../data/apwh-u6-location-study.js', import.meta.url);

test('publishes the Unit 6 location-study module', () => {
  assert.equal(existsSync(moduleUrl), true, 'Unit 6 data module must exist');
  const sandbox = {};
  sandbox.window = sandbox;
  vm.runInNewContext(readFileSync(moduleUrl, 'utf8'), sandbox);
  assert.equal(sandbox.APWH_U6_LOCATION_STUDY.unitId, 'u6');
  assert.equal(sandbox.APWH_U6_LOCATION_STUDY.unitNumber, 6);
});
