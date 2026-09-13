import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

test('publishes APWH Unit 7 location study metadata', () => {
  const moduleUrl = new URL('../data/apwh-u7-location-study.js', import.meta.url);
  assert.ok(existsSync(moduleUrl), `Expected ${moduleUrl.pathname} to exist`);

  const sandbox = {};
  sandbox.window = sandbox;
  vm.runInNewContext(readFileSync(moduleUrl, 'utf8'), sandbox);

  assert.equal(sandbox.APWH_U7_LOCATION_STUDY.unitId, 'u7');
  assert.equal(sandbox.APWH_U7_LOCATION_STUDY.unitNumber, 7);
});
