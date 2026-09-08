import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const moduleUrl = new URL('../data/apwh-u5-location-study.js', import.meta.url);

test('publishes the Unit 5 location-study module', () => {
  assert.equal(existsSync(moduleUrl), true, 'Unit 5 data module must exist');
  const sandbox = {};
  sandbox.window = sandbox;
  vm.runInNewContext(readFileSync(moduleUrl, 'utf8'), sandbox);
  assert.equal(sandbox.APWH_U5_LOCATION_STUDY.unitId, 'u5');
  assert.equal(sandbox.APWH_U5_LOCATION_STUDY.unitNumber, 5);
});
