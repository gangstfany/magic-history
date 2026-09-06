import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const moduleUrl = new URL('../data/apwh-u4-location-study.js', import.meta.url);

test('publishes the Unit 4 location-study module', () => {
  assert.equal(existsSync(moduleUrl), true, 'Unit 4 data module must exist');
  const sandbox = {};
  sandbox.window = sandbox;
  vm.runInNewContext(readFileSync(moduleUrl, 'utf8'), sandbox);
  assert.equal(sandbox.APWH_U4_LOCATION_STUDY.unitId, 'u4');
  assert.equal(sandbox.APWH_U4_LOCATION_STUDY.unitNumber, 4);
});
