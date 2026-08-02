import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateDataset } from '../scripts/validate-apush-data.mjs';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));

async function loadFixtures() {
  const [data, manifest, ledger] = await Promise.all([
    readJson('../data/apush-period-1.json'),
    readJson('../data/apush-period-1-manifest.json'),
    readFile(new URL('../docs/data-sources/apush-period-1-source-ledger.md', import.meta.url), 'utf8'),
  ]);
  return { data, manifest, ledger };
}

const clone = (value) => structuredClone(value);

test('Period 1 data matches the approved nine-event manifest', async () => {
  const { data, manifest, ledger } = await loadFixtures();
  assert.deepEqual(data.events.map((event) => event.id), manifest.eventIds);
  assert.deepEqual(validateDataset(data, manifest, ledger), []);
});

test('the dataset exposes the official eight APUSH themes exactly once', async () => {
  const { data } = await loadFixtures();
  assert.deepEqual(data.themes.map(({ id }) => id).sort(),
    ['ARC', 'GEO', 'MIG', 'NAT', 'PCE', 'SOC', 'WOR', 'WXT']);
});

test('validation rejects duplicate identifiers', async () => {
  const { data, manifest, ledger } = await loadFixtures();
  const invalid = clone(data);
  invalid.events.push(clone(invalid.events[0]));
  assert.ok(validateDataset(invalid, manifest, ledger).includes(
    `duplicate event id: ${invalid.events[0].id}`,
  ));
});

test('validation rejects unknown site, theme, source, and relationship references', async () => {
  const { data, manifest, ledger } = await loadFixtures();
  const invalid = clone(data);
  const event = invalid.events[0];
  event.siteIds = ['missing-site'];
  event.themeIds = ['missing-theme'];
  event.sourceIds = ['missing-source'];
  event.relatedIds = ['missing-event'];
  assert.deepEqual(validateDataset(invalid, manifest, ledger).filter((error) => error.includes(event.id)), [
    `event ${event.id} unknown site: missing-site`,
    `event ${event.id} unknown theme: missing-theme`,
    `event ${event.id} unknown source: missing-source`,
    `event ${event.id} unknown relatedIds: missing-event`,
  ]);
});

test('validation rejects invalid date order and out-of-bounds coordinates', async () => {
  const { data, manifest, ledger } = await loadFixtures();
  const invalid = clone(data);
  invalid.events[0].startYear = 1607;
  invalid.events[0].endYear = 1491;
  invalid.sites[0].x = 1601;
  invalid.sites[0].y = -1;
  assert.deepEqual(validateDataset(invalid, manifest, ledger).filter((error) =>
    error === `event ${invalid.events[0].id} has invalid date range`
      || error === `site ${invalid.sites[0].id} x out of bounds`
      || error === `site ${invalid.sites[0].id} y out of bounds`,
  ), [
    `site ${invalid.sites[0].id} x out of bounds`,
    `site ${invalid.sites[0].id} y out of bounds`,
    `event ${invalid.events[0].id} has invalid date range`,
  ]);
});

test('validation rejects events outside Period 1 and missing bilingual fields', async () => {
  const { data, manifest, ledger } = await loadFixtures();
  const invalid = clone(data);
  invalid.events[0].periodId = 'p2';
  invalid.events[0].titleEn = '';
  invalid.events[0].titleZh = '   ';
  invalid.sites[0].nameEn = '';
  invalid.sites[0].nameZh = '   ';
  const errors = validateDataset(invalid, manifest, ledger);
  assert.deepEqual(errors.filter((error) => error.includes(invalid.events[0].id)), [
    `event ${invalid.events[0].id} missing titleEn`,
    `event ${invalid.events[0].id} missing titleZh`,
    `event ${invalid.events[0].id} has invalid periodId`,
  ]);
  assert.ok(errors.includes(`site ${invalid.sites[0].id} missing nameEn`));
  assert.ok(errors.includes(`site ${invalid.sites[0].id} missing nameZh`));
});

test('validation rejects an event absent from the source ledger', async () => {
  const { data, manifest, ledger } = await loadFixtures();
  const target = data.events[0].id;
  assert.ok(validateDataset(data, manifest, ledger.replaceAll(`\`${target}\``, '')).includes(
    `ledger missing event: ${target}`,
  ));
});
