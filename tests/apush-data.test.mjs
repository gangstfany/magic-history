import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateDataset } from '../scripts/validate-apush-data.mjs';
import { startServer } from '../scripts/verify-apush-browser.mjs';

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
const APPROVED_EVENT_IDS = Object.freeze([
  'indigenous-north-america-1491',
  'european-exploration',
  'columbus-caribbean-1492',
  'columbian-exchange',
  'conquest-mexica',
  'conquest-inca',
  'spanish-labor-caste',
  'cultural-interactions',
  'st-augustine-borderlands',
]);
const OFFICIAL_THEME_IDS = Object.freeze(['NAT', 'WXT', 'GEO', 'MIG', 'PCE', 'WOR', 'ARC', 'SOC']);

function validPeriodOneFixture() {
  const events = APPROVED_EVENT_IDS.map((id) => ({
    id,
    titleEn: `English ${id}`,
    titleZh: `中文 ${id}`,
    periodId: 'p1',
    dateLabel: '1491',
    startYear: 1491,
    endYear: 1491,
    siteIds: ['site-1'],
    primarySiteId: 'site-1',
    themeIds: ['NAT'],
    summary: 'summary',
    significance: 'significance',
    examConnection: 'exam connection',
    causeIds: [],
    effectIds: [],
    relatedIds: [],
    keywords: [],
    sourceIds: ['source-1'],
  }));
  return {
    data: {
      schemaVersion: 1,
      periods: [{
        id: 'p1', number: 1,
        labelEn: 'Period 1: 1491-1607', labelZh: '时期一：1491-1607',
        startYear: 1491, endYear: 1607,
      }],
      themes: OFFICIAL_THEME_IDS.map((id) => ({ id })),
      sources: [{ id: 'source-1', title: 'Source', kind: 'course-framework', locator: 'PDF p. 1' }],
      sites: [{ id: 'site-1', nameEn: 'Site', nameZh: '地点', x: 0, y: 0 }],
      events,
    },
    manifest: { schemaVersion: 1, periodId: 'p1', eventIds: [...APPROVED_EVENT_IDS] },
    ledger: APPROVED_EVENT_IDS.map((id) => `\`${id}\``).join('\n'),
  };
}

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

test('runtime sources expose title, kind, and locator strings without the legacy type field', async () => {
  const { data } = await loadFixtures();
  for (const source of data.sources) {
    for (const field of ['title', 'kind', 'locator']) {
      assert.equal(typeof source[field], 'string', `source ${source.id} ${field} must be a string`);
      assert.ok(source[field].trim(), `source ${source.id} ${field} must not be empty`);
    }
    assert.equal(Object.hasOwn(source, 'type'), false, `source ${source.id} must not expose legacy type`);
  }
});

test('the source ledger records reproducible relative paths and a precise CED range', async () => {
  const { data, ledger } = await loadFixtures();
  assert.match(ledger, /Source root: `\/Users\/rachel\/Documents\/AP美国史资料`/);
  assert.match(ledger, /Local file path \(relative to source root\)/);
  assert.match(ledger, /教材\/AP美国历史 【考纲】2025\/2023 AP® U\.S\. History\.pdf/);
  assert.match(ledger, /PDF pp\. 42–67 \(Course Framework pp\. 35–60; Unit 1 Topics 1\.1–1\.7\)/);
  const ced = data.sources.find((source) => source.id === 'ced-2023');
  assert.equal(ced.locator, 'PDF pp. 42–67; Course Framework pp. 35–60 (Unit 1, Topics 1.1–1.7)');
  assert.doesNotMatch(JSON.stringify(data.sources), /\/Users\/rachel\/Documents/);
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
    `event ${event.id} primarySiteId must reference an item in siteIds`,
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

test('validation requires the exact Period 1 metadata contract', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  data.periods[0] = {
    id: 'p1', number: 2, labelEn: '', labelZh: ' ', startYear: 1490, endYear: 1608,
  };
  assert.deepEqual(validateDataset(data, manifest, ledger).filter((error) => error.startsWith('period p1')), [
    'period p1 missing labelEn',
    'period p1 missing labelZh',
    'period p1 number must be 1',
    'period p1 startYear must be 1491',
    'period p1 endYear must be 1607',
  ]);
});

test('validation rejects event years outside 1491-1607 even when ordered', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  data.events[0].startYear = 1490;
  data.events[0].endYear = 1491;
  data.events[1].startYear = 1607;
  data.events[1].endYear = 1608;
  const errors = validateDataset(data, manifest, ledger);
  assert.ok(errors.includes(`event ${data.events[0].id} outside Period 1: 1491-1607`));
  assert.ok(errors.includes(`event ${data.events[1].id} outside Period 1: 1491-1607`));
});

test('validation requires source title, kind, and locator strings', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  data.sources[0].title = '';
  data.sources[0].kind = ' ';
  delete data.sources[0].locator;
  assert.deepEqual(validateDataset(data, manifest, ledger).filter((error) => error.startsWith('source source-1')), [
    'source source-1 missing title',
    'source source-1 missing kind',
    'source source-1 missing locator',
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

test('validation anchors synchronized dataset and manifest IDs to the approved literal baseline', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  data.events = [];
  manifest.eventIds = [];
  const errors = validateDataset(data, manifest, ledger);
  assert.ok(errors.includes('dataset event order must exactly match approved Period 1 event IDs'));
  assert.ok(errors.includes('manifest eventIds must exactly match approved Period 1 event IDs'));
});

test('validation anchors themes to the official eight-theme literal baseline', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  data.themes = [];
  assert.ok(validateDataset(data, manifest, ledger).includes(
    'dataset themes must exactly match official APUSH theme IDs',
  ));
});

test('validation requires every event reference collection to be an array', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  const event = data.events[0];
  for (const field of ['siteIds', 'themeIds', 'causeIds', 'effectIds', 'relatedIds', 'keywords', 'sourceIds']) {
    event[field] = 'not-an-array';
  }
  const errors = validateDataset(data, manifest, ledger);
  for (const field of ['siteIds', 'themeIds', 'causeIds', 'effectIds', 'relatedIds', 'keywords', 'sourceIds']) {
    assert.ok(errors.includes(`event ${event.id} ${field} must be an array`));
  }
});

test('validation requires populated event references and a primary site from siteIds', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  const event = data.events[0];
  event.siteIds = [];
  event.themeIds = [];
  event.sourceIds = [];
  event.primarySiteId = '';
  const errors = validateDataset(data, manifest, ledger);
  assert.ok(errors.includes(`event ${event.id} siteIds must contain at least one item`));
  assert.ok(errors.includes(`event ${event.id} themeIds must contain at least one item`));
  assert.ok(errors.includes(`event ${event.id} sourceIds must contain at least one item`));
  assert.ok(errors.includes(`event ${event.id} missing primarySiteId`));

  event.siteIds = ['site-1'];
  event.primarySiteId = 'other-site';
  assert.ok(validateDataset(data, manifest, ledger).includes(
    `event ${event.id} primarySiteId must reference an item in siteIds`,
  ));
});

test('validation accumulates defects for a null event without throwing', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  data.events[0] = null;
  let errors;
  assert.doesNotThrow(() => { errors = validateDataset(data, manifest, ledger); });
  assert.ok(errors.includes('event is missing id'));
  assert.ok(errors.includes('event (unknown) missing titleEn'));
  assert.ok(errors.includes('event (unknown) siteIds must be an array'));
});

test('browser verifier server cleanup is idempotent before listen and when repeated', async () => {
  const server = startServer();
  await assert.doesNotReject(server.close());
  await assert.doesNotReject(server.close());
});
