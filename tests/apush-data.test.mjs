import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateDataset } from '../scripts/validate-apush-data.mjs';
import { startServer } from '../scripts/verify-apush-browser.mjs';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));

async function loadFixtures() {
  const [data, manifest, ledger, registry] = await Promise.all([
    readJson('../data/apush-period-1.json'),
    readJson('../data/apush-period-1-manifest.json'),
    readFile(new URL('../docs/data-sources/apush-period-1-source-ledger.md', import.meta.url), 'utf8'),
    readJson('../data/apush-period-registry.json'),
  ]);
  return { data, manifest, ledger, expectedPeriod: registry.periods[0] };
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
const EXPECTED_PERIODS = Object.freeze([
  { id: 'p1', number: 1, labelEn: 'Period 1', labelZh: '时期一', dates: '1491–1607', startYear: 1491, endYear: 1607, dataPath: 'data/apush-period-1.json', manifestPath: 'data/apush-period-1-manifest.json' },
  { id: 'p2', number: 2, labelEn: 'Period 2', labelZh: '时期二', dates: '1607–1754', startYear: 1607, endYear: 1754, dataPath: 'data/apush-period-2.json', manifestPath: 'data/apush-period-2-manifest.json' },
  { id: 'p3', number: 3, labelEn: 'Period 3', labelZh: '时期三', dates: '1754–1800', startYear: 1754, endYear: 1800, dataPath: 'data/apush-period-3.json', manifestPath: 'data/apush-period-3-manifest.json' },
  { id: 'p4', number: 4, labelEn: 'Period 4', labelZh: '时期四', dates: '1800–1848', startYear: 1800, endYear: 1848, dataPath: 'data/apush-period-4.json', manifestPath: 'data/apush-period-4-manifest.json' },
  { id: 'p5', number: 5, labelEn: 'Period 5', labelZh: '时期五', dates: '1844–1877', startYear: 1844, endYear: 1877, dataPath: 'data/apush-period-5.json', manifestPath: 'data/apush-period-5-manifest.json' },
  { id: 'p6', number: 6, labelEn: 'Period 6', labelZh: '时期六', dates: '1865–1898', startYear: 1865, endYear: 1898, dataPath: 'data/apush-period-6.json', manifestPath: 'data/apush-period-6-manifest.json' },
  { id: 'p7', number: 7, labelEn: 'Period 7', labelZh: '时期七', dates: '1890–1945', startYear: 1890, endYear: 1945, dataPath: 'data/apush-period-7.json', manifestPath: 'data/apush-period-7-manifest.json' },
  { id: 'p8', number: 8, labelEn: 'Period 8', labelZh: '时期八', dates: '1945–1980', startYear: 1945, endYear: 1980, dataPath: 'data/apush-period-8.json', manifestPath: 'data/apush-period-8-manifest.json' },
  { id: 'p9', number: 9, labelEn: 'Period 9', labelZh: '时期九', dates: '1980–Present', startYear: 1980, endYear: 2026, dataPath: 'data/apush-period-9.json', manifestPath: 'data/apush-period-9-manifest.json' },
]);
const PERIOD_ONE = EXPECTED_PERIODS[0];
const EXPECTED_EVENT_IDS_2_TO_4 = Object.freeze({
  p2: [
    'jamestown-1607', 'virginia-tobacco-headright-1618', 'house-of-burgesses-1619',
    'atlantic-slavery-expands-1619-1754', 'plymouth-mayflower-1620', 'puritan-great-migration-1630',
    'imperial-mercantilism-salutary-neglect-1651-1754', 'bacon-rebellion-1676', 'first-great-awakening-1730s',
  ],
  p3: [
    'french-indian-war-1754-1763', 'stamp-act-resistance-1765', 'boston-tea-intolerable-1773-1774',
    'declaration-independence-1776', 'saratoga-french-alliance-1777-1778', 'yorktown-1781',
    'articles-shays-1781-1787', 'constitution-ratification-1787-1788', 'new-republic-parties-1789-1800',
  ],
  p4: [
    'louisiana-purchase-1803', 'market-revolution-1815-1848', 'missouri-compromise-1820',
    'second-great-awakening-reform-1820-1848', 'jacksonian-democracy-1828', 'indian-removal-1830-1838',
    'nullification-crisis-1832-1833', 'texas-mexican-war-1845-1848', 'seneca-falls-1848',
  ],
});
const EXPECTED_CED_LOCATORS_2_TO_4 = Object.freeze({
  p2: 'PDF pp. 68–103; Course Framework pp. 61–96 (Unit 2, Topics 2.1–2.8)',
  p3: 'PDF pp. 104–155; Course Framework pp. 97–148 (Unit 3, Topics 3.1–3.13)',
  p4: 'PDF pp. 156–211; Course Framework pp. 149–204 (Unit 4, Topics 4.1–4.14)',
});
const EXPECTED_EVENT_IDS_5_TO_7 = Object.freeze({
  p5: [
    'manifest-destiny-mexican-war-1844-1848', 'compromise-1850', 'kansas-nebraska-bleeding-kansas-1854-1856',
    'dred-scott-1857', 'election-secession-1860-1861', 'emancipation-gettysburg-1863',
    'appomattox-1865', 'reconstruction-amendments-1865-1870', 'compromise-1877',
  ],
  p6: [
    'transcontinental-railroad-western-settlement-1869-1890', 'industrial-capitalism-1870-1898',
    'gilded-age-reform-1870-1898', 'labor-conflict-1877-1894', 'new-immigration-urbanization-1880-1898',
    'dawes-ghost-dance-1887-1890', 'jim-crow-plessy-1890-1896', 'populist-movement-1892-1896',
  ],
  p7: [
    'spanish-american-war-1898', 'progressive-reform-1901-1917', 'great-migration-1910-1945', 'world-war-one-us-1917-1918',
    'red-scare-immigration-restriction-1919-1924', 'harlem-mass-culture-1920s', 'crash-great-depression-1929',
    'new-deal-1933-1939', 'world-war-two-homefront-victory-1941-1945', 'japanese-incarceration-1942',
  ],
});
const EXPECTED_CED_LOCATORS_5_TO_7 = Object.freeze({
  p5: 'PDF pp. 211–259; Course Framework pp. 205–252 (Unit 5, Topics 5.1–5.12)',
  p6: 'PDF pp. 261–316; Course Framework pp. 255–310 (Unit 6, Topics 6.1–6.14)',
  p7: 'PDF pp. 317–378; Course Framework pp. 311–372 (Unit 7, Topics 7.1–7.15)',
});
const EXPECTED_EVENT_IDS_8_TO_9 = Object.freeze({
  p8: [
    'postwar-suburbs-baby-boom-1945-1960', 'truman-doctrine-containment-1947', 'brown-board-1954',
    'civil-rights-movement-1955-1965', 'rights-counterculture-1960s-1970s', 'great-society-1964-1965',
    'vietnam-escalation-withdrawal-1964-1973', 'nixon-watergate-1968-1974', 'conservative-resurgence-1970s-1980',
  ],
  p9: [
    'immigration-globalization-1980-2001', 'reaganomics-new-right-1981-1988', 'cold-war-ends-1989-1991',
    'clinton-new-economy-1993-2000', 'september-eleven-2001', 'war-on-terror-2001-2011',
    'great-recession-2008', 'demographic-digital-polarization-2008-2026',
  ],
});
const EXPECTED_CED_LOCATORS_8_TO_9 = Object.freeze({
  p8: 'PDF pp. 386–447; Course Framework pp. 379–440 (Unit 8, Topics 8.1–8.15)',
  p9: 'PDF pp. 454–478; Course Framework pp. 447–471 (Unit 9, Topics 9.1–9.7)',
});
const EXPECTED_SOURCE_LOCATORS_8_TO_9 = Object.freeze({
  'archives-brown': 'https://www.archives.gov/milestone-documents/brown-v-board-of-education',
  'nps-civil-rights': 'https://www.nps.gov/subjects/civilrights/index.htm',
  'archives-watergate': 'https://www.archives.gov/education/lessons/watergate-constitution',
  'reagan-library-economy': 'https://www.reaganlibrary.gov/sites/default/files/archives/textual/topics/econpolicy.pdf',
  'state-cold-war-end': 'https://history.state.gov/milestones/1989-1992/collapse-soviet-union',
  'nine-eleven-memorial-timeline': 'https://www.911memorial.org/learn/resources/911-primer',
  'fed-great-recession': 'https://www.federalreservehistory.org/essays/great-recession-and-its-aftermath',
  'census-diversity-2020': 'https://www.census.gov/newsroom/press-releases/2021/population-changes-nations-diversity.html',
  'census-internet-2021': 'https://www.census.gov/newsroom/press-releases/2024/computer-internet-use-2021.html',
  'pew-internet-election-2008': 'https://www.pewresearch.org/internet/2009/04/15/the-internets-role-in-campaign-2008/',
  'pew-partisan-hostility-2022': 'https://www.pewresearch.org/politics/2022/08/09/as-partisan-hostility-grows-signs-of-frustration-with-the-two-party-system/',
});

for (const periodId of ['p2', 'p3', 'p4']) {
  test(`${periodId.toUpperCase()} data validates and preserves the approved Timeline Dock order`, async () => {
    const number = Number(periodId.slice(1));
    const [data, manifest, ledger, registry] = await Promise.all([
      readJson(`../data/apush-period-${number}.json`),
      readJson(`../data/apush-period-${number}-manifest.json`),
      readFile(new URL(`../docs/data-sources/apush-period-${number}-source-ledger.md`, import.meta.url), 'utf8'),
      readJson('../data/apush-period-registry.json'),
    ]);
    const expectedPeriod = registry.periods.find((period) => period.id === periodId);
    assert.deepEqual(manifest.eventIds, EXPECTED_EVENT_IDS_2_TO_4[periodId]);
    assert.deepEqual(data.events.map(({ id }) => id), EXPECTED_EVENT_IDS_2_TO_4[periodId]);
    assert.deepEqual(validateDataset(data, manifest, ledger, expectedPeriod), []);
    assert.ok(data.events.every((event) => event.themeIds.length >= 1 && event.themeIds.length <= 3));
    assert.ok(data.events.every((event) => event.sourceIds.length >= 1));
    assert.ok(data.events.some((event) => event.siteIds.length === 0 && event.primarySiteId === null));
    assert.match(ledger, /^\| Event ID \| CED unit topic\(s\) \| Dataset source ID \| Locator \| Geography rationale \|$/m);
    assert.equal(data.sources.find(({ id }) => id === `ced-2026-${periodId}`)?.locator,
      EXPECTED_CED_LOCATORS_2_TO_4[periodId]);
    assert.ok(ledger.includes(EXPECTED_CED_LOCATORS_2_TO_4[periodId]),
      `${periodId} ledger must include the reproducible CED locator`);
    if (periodId === 'p4') {
      assert.equal(data.sources.find(({ id }) => id === 'ced-2026-p5-topics-5-2-5-3')?.locator,
        'PDF pp. 219–226; Course Framework pp. 212–219 (Unit 5, Topics 5.2–5.3)');
      assert.ok(ledger.includes('PDF pp. 219–226; Course Framework pp. 212–219 (Unit 5, Topics 5.2–5.3)'));
      assert.ok(data.events.find(({ id }) => id === 'texas-mexican-war-1845-1848').sourceIds
        .includes('ced-2026-p5-topics-5-2-5-3'));
    }
    for (const event of data.events) {
      const chineseSummaryLength = (event.summary.match(/[\u3400-\u9fff]/g) || []).length;
      const chineseTimelineTitleLength = (event.timelineTitleZh.match(/[\u3400-\u9fff]/g) || []).length;
      assert.ok(chineseSummaryLength >= 35 && chineseSummaryLength <= 90,
        `${event.id} summary must contain 35–90 Chinese characters, got ${chineseSummaryLength}`);
      assert.ok(chineseTimelineTitleLength <= 10,
        `${event.id} timelineTitleZh must contain at most 10 Chinese characters, got ${chineseTimelineTitleLength}`);
      const ledgerRows = ledger.split('\n').filter((line) => line.startsWith(`| \`${event.id}\` |`));
      assert.equal(ledgerRows.length, 1,
        `${event.id} must have exactly one ledger data row`);
      for (const sourceId of event.sourceIds) {
        assert.ok(ledgerRows[0].includes(`\`${sourceId}\``),
          `${event.id} source ${sourceId} must appear in its own ledger row`);
      }
      for (const effectId of event.effectIds) {
        assert.ok(data.events.find(({ id }) => id === effectId).causeIds.includes(event.id),
          `${event.id} -> ${effectId} must be reciprocal`);
      }
      for (const causeId of event.causeIds) {
        assert.ok(data.events.find(({ id }) => id === causeId).effectIds.includes(event.id),
          `${causeId} -> ${event.id} must be reciprocal`);
      }
    }
    for (let index = 1; index < data.events.length; index += 1) {
      assert.ok(data.events[index - 1].startYear <= data.events[index].startYear,
        `${periodId} Timeline order must be monotonic by startYear at index ${index}`);
    }
    if (periodId === 'p2') {
      const burgesses = data.events.find(({ id }) => id === 'house-of-burgesses-1619');
      const mercantilism = data.events.find(({ id }) => id === 'imperial-mercantilism-salutary-neglect-1651-1754');
      assert.ok(burgesses.relatedIds.includes(mercantilism.id));
      assert.ok(mercantilism.relatedIds.includes(burgesses.id));
    }
  });
}

for (const periodId of ['p5', 'p6', 'p7']) {
  test(`${periodId.toUpperCase()} data validates and preserves chronological Timeline Dock order`, async () => {
    const number = Number(periodId.slice(1));
    const [data, manifest, ledger, registry] = await Promise.all([
      readJson(`../data/apush-period-${number}.json`),
      readJson(`../data/apush-period-${number}-manifest.json`),
      readFile(new URL(`../docs/data-sources/apush-period-${number}-source-ledger.md`, import.meta.url), 'utf8'),
      readJson('../data/apush-period-registry.json'),
    ]);
    const expectedPeriod = registry.periods.find((period) => period.id === periodId);
    const expectedIds = EXPECTED_EVENT_IDS_5_TO_7[periodId];
    assert.deepEqual(manifest.eventIds, expectedIds);
    assert.deepEqual(data.events.map(({ id }) => id), expectedIds);
    assert.equal(data.events.length, { p5: 9, p6: 8, p7: 10 }[periodId]);
    assert.deepEqual(validateDataset(data, manifest, ledger, expectedPeriod), []);
    assert.ok(data.events.every((event) => event.themeIds.length >= 1 && event.themeIds.length <= 3));
    assert.ok(data.events.every((event) => event.sourceIds.length >= 1));
    assert.ok(data.events.some((event) => event.siteIds.length === 0 && event.primarySiteId === null));
    const referencedSourceIds = new Set(data.events.flatMap((event) => event.sourceIds));
    const referencedSiteIds = new Set(data.events.flatMap((event) => event.siteIds));
    assert.deepEqual(data.sources.filter(({ id }) => !referencedSourceIds.has(id)).map(({ id }) => id), [],
      `${periodId} must not retain orphan sources`);
    assert.deepEqual(data.sites.filter(({ id }) => !referencedSiteIds.has(id)).map(({ id }) => id), [],
      `${periodId} must not retain orphan sites`);
    const supplementalSources = data.sources.filter(({ kind }) => kind !== 'course-and-exam-description');
    const allowedOfficialHosts = new Set(['www.archives.gov', 'www.nps.gov', 'www.loc.gov', 'guides.loc.gov', 'www.fdrlibrary.org']);
    for (const source of supplementalSources) {
      const locator = new URL(source.locator);
      assert.equal(locator.protocol, 'https:', `${source.id} must use an HTTPS locator`);
      assert.ok(allowedOfficialHosts.has(locator.hostname), `${source.id} must use an approved authoritative host`);
    }
    assert.ok(data.events.some((event) => event.effectIds.length > 0),
      `${periodId} must preserve at least one explicitly explained cause/effect mechanism`);
    assert.equal(data.sources.find(({ id }) => id === `ced-2026-${periodId}`)?.locator,
      EXPECTED_CED_LOCATORS_5_TO_7[periodId]);
    assert.ok(ledger.includes(EXPECTED_CED_LOCATORS_5_TO_7[periodId]));
    assert.match(ledger, /^\| Event ID \| CED unit topic\(s\) \| Dataset source ID \| Locator \| Geography rationale \|$/m);

    for (const event of data.events) {
      const chineseSummaryLength = (event.summary.match(/[\u3400-\u9fff]/g) || []).length;
      const chineseTimelineTitleLength = (event.timelineTitleZh.match(/[\u3400-\u9fff]/g) || []).length;
      assert.ok(chineseSummaryLength >= 35 && chineseSummaryLength <= 90,
        `${event.id} summary must contain 35–90 Chinese characters, got ${chineseSummaryLength}`);
      assert.ok(chineseTimelineTitleLength <= 10,
        `${event.id} timelineTitleZh must contain at most 10 Chinese characters, got ${chineseTimelineTitleLength}`);
      const ledgerRows = ledger.split('\n').filter((line) => line.startsWith(`| \`${event.id}\` |`));
      assert.equal(ledgerRows.length, 1, `${event.id} must have exactly one ledger data row`);
      for (const sourceId of event.sourceIds) {
        assert.ok(ledgerRows[0].includes(`\`${sourceId}\``),
          `${event.id} source ${sourceId} must appear in its own ledger row`);
      }
      for (const effectId of event.effectIds) {
        assert.ok(data.events.find(({ id }) => id === effectId).causeIds.includes(event.id),
          `${event.id} -> ${effectId} must be reciprocal`);
      }
      for (const causeId of event.causeIds) {
        assert.ok(data.events.find(({ id }) => id === causeId).effectIds.includes(event.id),
          `${causeId} -> ${event.id} must be reciprocal`);
      }
      for (const relatedId of event.relatedIds) {
        assert.ok(data.events.find(({ id }) => id === relatedId).relatedIds.includes(event.id),
          `${event.id} <-> ${relatedId} must be reciprocal`);
      }
    }
    for (let index = 1; index < data.events.length; index += 1) {
      assert.ok(data.events[index - 1].startYear <= data.events[index].startYear,
        `${periodId} Timeline order must be monotonic by startYear at index ${index}`);
    }
    if (periodId === 'p6') {
      assert.deepEqual(data.events.filter(({ startYear }) => startYear === 1870).map(({ id }) => id),
        ['industrial-capitalism-1870-1898', 'gilded-age-reform-1870-1898']);
    }
    const namedCausalLink = {
      p5: ['manifest-destiny-mexican-war-1844-1848', 'compromise-1850'],
      p6: ['industrial-capitalism-1870-1898', 'labor-conflict-1877-1894'],
      p7: ['crash-great-depression-1929', 'new-deal-1933-1939'],
    }[periodId];
    const [causeId, effectId] = namedCausalLink;
    assert.ok(data.events.find(({ id }) => id === causeId).effectIds.includes(effectId));
    assert.ok(data.events.find(({ id }) => id === effectId).causeIds.includes(causeId));
  });
}

for (const periodId of ['p8', 'p9']) {
  test(`${periodId.toUpperCase()} data validates and preserves chronological Timeline Dock order`, async () => {
    const number = Number(periodId.slice(1));
    const [data, manifest, ledger, registry] = await Promise.all([
      readJson(`../data/apush-period-${number}.json`),
      readJson(`../data/apush-period-${number}-manifest.json`),
      readFile(new URL(`../docs/data-sources/apush-period-${number}-source-ledger.md`, import.meta.url), 'utf8'),
      readJson('../data/apush-period-registry.json'),
    ]);
    const expectedPeriod = registry.periods.find((period) => period.id === periodId);
    const expectedIds = EXPECTED_EVENT_IDS_8_TO_9[periodId];
    assert.deepEqual(manifest.eventIds, expectedIds);
    assert.deepEqual(data.events.map(({ id }) => id), expectedIds);
    assert.equal(data.events.length, { p8: 9, p9: 8 }[periodId]);
    assert.deepEqual(validateDataset(data, manifest, ledger, expectedPeriod), []);
    assert.ok(data.events.every((event) => event.themeIds.length >= 1 && event.themeIds.length <= 3));
    assert.ok(data.events.every((event) => event.sourceIds.length >= 1));
    assert.ok(data.events.some((event) => event.siteIds.length === 0 && event.primarySiteId === null));
    const referencedSourceIds = new Set(data.events.flatMap((event) => event.sourceIds));
    const referencedSiteIds = new Set(data.events.flatMap((event) => event.siteIds));
    assert.deepEqual(data.sources.filter(({ id }) => !referencedSourceIds.has(id)).map(({ id }) => id), []);
    assert.deepEqual(data.sites.filter(({ id }) => !referencedSiteIds.has(id)).map(({ id }) => id), []);
    const allowedAuthoritativeHosts = new Set([
      'www.archives.gov', 'www.nps.gov', 'www.loc.gov', 'guides.loc.gov',
      'www.reaganlibrary.gov', 'history.state.gov', 'www.911memorial.org', 'www.federalreservehistory.org',
      'www.census.gov', 'www.pewresearch.org',
    ]);
    for (const source of data.sources.filter(({ kind }) => kind !== 'course-and-exam-description')) {
      const locator = new URL(source.locator);
      assert.equal(locator.protocol, 'https:', `${source.id} must use an HTTPS locator`);
      assert.ok(allowedAuthoritativeHosts.has(locator.hostname), `${source.id} must use an approved authoritative host`);
      assert.equal(source.locator, EXPECTED_SOURCE_LOCATORS_8_TO_9[source.id],
        `${source.id} must retain its reviewed immutable locator`);
    }
    assert.equal(data.sources.find(({ id }) => id === `ced-2026-${periodId}`)?.locator,
      EXPECTED_CED_LOCATORS_8_TO_9[periodId]);
    assert.ok(ledger.includes(EXPECTED_CED_LOCATORS_8_TO_9[periodId]));
    assert.match(ledger, /^\| Event ID \| CED unit topic\(s\) \| Dataset source ID \| Locator \| Geography rationale \|$/m);
    for (const event of data.events) {
      const chineseSummaryLength = (event.summary.match(/[\u3400-\u9fff]/g) || []).length;
      const chineseTimelineTitleLength = (event.timelineTitleZh.match(/[\u3400-\u9fff]/g) || []).length;
      assert.ok(chineseSummaryLength >= 35 && chineseSummaryLength <= 90,
        `${event.id} summary must contain 35–90 Chinese characters, got ${chineseSummaryLength}`);
      assert.ok(chineseTimelineTitleLength <= 10,
        `${event.id} timelineTitleZh must contain at most 10 Chinese characters, got ${chineseTimelineTitleLength}`);
      const ledgerRows = ledger.split('\n').filter((line) => line.startsWith(`| \`${event.id}\` |`));
      assert.equal(ledgerRows.length, 1, `${event.id} must have exactly one ledger data row`);
      for (const sourceId of event.sourceIds) assert.ok(ledgerRows[0].includes(`\`${sourceId}\``));
      for (const effectId of event.effectIds) {
        assert.ok(data.events.find(({ id }) => id === effectId).causeIds.includes(event.id));
      }
      for (const causeId of event.causeIds) {
        assert.ok(data.events.find(({ id }) => id === causeId).effectIds.includes(event.id));
      }
      for (const relatedId of event.relatedIds) {
        assert.ok(data.events.find(({ id }) => id === relatedId).relatedIds.includes(event.id));
      }
    }
    for (let index = 1; index < data.events.length; index += 1) {
      assert.ok(data.events[index - 1].startYear <= data.events[index].startYear);
    }
    if (periodId === 'p9') {
      const warOnTerror = data.events.find(({ id }) => id === 'war-on-terror-2001-2011');
      assert.deepEqual(warOnTerror.siteIds, []);
      assert.equal(warOnTerror.primarySiteId, null);
      assert.equal(warOnTerror.titleEn, 'War on Terror: First Decade');
      assert.equal(warOnTerror.timelineTitleZh, '反恐战争首个十年');
      assert.match(`${warOnTerror.summary}${warOnTerror.significance}${warOnTerror.examConnection}`, /2011.*选定|选定.*2011/);
      assert.match(`${warOnTerror.summary}${warOnTerror.significance}${warOnTerror.examConnection}`, /并非.*结束|未.*结束/);
      const recent = data.events.at(-1);
      assert.equal(recent.id, 'demographic-digital-polarization-2008-2026');
      assert.equal(recent.dateLabel, '2008–Present');
      assert.equal(recent.endYear, 2026);
      assert.doesNotMatch(`${recent.summary}${recent.significance}${recent.examConnection}`, /验证上限|2026/);
      assert.deepEqual(recent.causeIds, []);
      assert.deepEqual(data.events.find(({ id }) => id === 'great-recession-2008').effectIds, []);
      assert.deepEqual(recent.sourceIds,
        ['ced-2026-p9', 'pew-internet-election-2008', 'census-diversity-2020', 'census-internet-2021', 'pew-partisan-hostility-2022']);
      const recentLedgerRow = ledger.split('\n').find((line) => line.startsWith('| `demographic-digital-polarization-2008-2026` |'));
      const recessionLedgerRow = ledger.split('\n').find((line) => line.startsWith('| `great-recession-2008` |'));
      assert.match(recessionLedgerRow, /\| 9\.4 A Changing Economy \|/);
      assert.doesNotMatch(recessionLedgerRow, /9\.6/);
      assert.match(recentLedgerRow, /9\.4 A Changing Economy/);
      assert.match(recentLedgerRow, /9\.5 Migration and Immigration in the 1990s and 2000s/);
      assert.doesNotMatch(recentLedgerRow, /9\.6/);
      assert.match(recentLedgerRow, /2020 Census/);
      assert.match(recentLedgerRow, /2021 American Community Survey/);
      assert.match(recentLedgerRow, /August 9, 2022/);
      assert.match(recentLedgerRow, /April 15, 2009.*2008 election/);
      assert.match(ledger, /2026 is a fixed validation ceiling/);
    } else {
      const brownRow = ledger.split('\n').find((line) => line.startsWith('| `brown-board-1954` |'));
      const movementRow = ledger.split('\n').find((line) => line.startsWith('| `civil-rights-movement-1955-1965` |'));
      const nixonRow = ledger.split('\n').find((line) => line.startsWith('| `nixon-watergate-1968-1974` |'));
      const nixon = data.events.find(({ id }) => id === 'nixon-watergate-1968-1974');
      assert.match(brownRow, /8\.6 Early Steps in the Civil Rights Movement \(1940s and 1950s\)/);
      assert.match(movementRow, /8\.6 Early Steps in the Civil Rights Movement \(1940s and 1950s\); 8\.10 The African American Civil Rights Movement \(1960s\)/);
      assert.match(nixonRow, /8\.7 America as a World Power; 8\.14 Society in Transition/);
      assert.equal(nixon.titleEn, "Nixon's Election, Presidency, and Watergate");
      assert.match(nixon.titleZh, /当选.*水门/);
    }
  });
}

function validPeriodOneFixture() {
  const events = APPROVED_EVENT_IDS.map((id) => ({
    id,
    titleEn: `English ${id}`,
    titleZh: `中文 ${id}`,
    timelineTitleZh: `短标题 ${id}`,
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

test('registry exposes the exact nine APUSH periods with unique paths', async () => {
  const registry = await readJson('../data/apush-period-registry.json');
  assert.equal(registry.schemaVersion, 1);
  assert.deepEqual(registry.periods, EXPECTED_PERIODS);
  assert.equal(new Set(registry.periods.map((period) => period.dataPath)).size, 9);
  assert.equal(new Set(registry.periods.map((period) => period.manifestPath)).size, 9);
});

test('Period 1 data matches the approved nine-event manifest', async () => {
  const { data, manifest, ledger, expectedPeriod } = await loadFixtures();
  assert.deepEqual(data.events.map((event) => event.id), manifest.eventIds);
  assert.deepEqual(validateDataset(data, manifest, ledger, expectedPeriod), []);
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
  assert.ok(validateDataset(invalid, manifest, ledger, PERIOD_ONE).includes(
    `duplicate event id: ${invalid.events[0].id}`,
  ));
});

test('validation rejects whitespace-only and non-string row identifiers', () => {
  const collections = [
    ['periods', 'period'],
    ['themes', 'theme'],
    ['sites', 'site'],
    ['sources', 'source'],
    ['events', 'event'],
  ];
  for (const invalidId of ['   ', 42]) {
    for (const [collection, kind] of collections) {
      const { data, manifest, ledger } = validPeriodOneFixture();
      data[collection][0].id = invalidId;
      assert.ok(
        validateDataset(data, manifest, ledger, PERIOD_ONE).includes(`${kind} is missing id`),
        `${kind} should reject ${JSON.stringify(invalidId)}`,
      );
    }
  }
});

test('validation rejects unknown site, theme, source, and relationship references', async () => {
  const { data, manifest, ledger } = await loadFixtures();
  const invalid = clone(data);
  const event = invalid.events[0];
  event.siteIds = ['missing-site'];
  event.themeIds = ['missing-theme'];
  event.sourceIds = ['missing-source'];
  event.relatedIds = ['missing-event'];
  assert.deepEqual(validateDataset(invalid, manifest, ledger, PERIOD_ONE).filter((error) => error.includes(event.id)), [
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
  assert.deepEqual(validateDataset(invalid, manifest, ledger, PERIOD_ONE).filter((error) =>
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
  assert.deepEqual(validateDataset(data, manifest, ledger, PERIOD_ONE).filter((error) => error.startsWith('period p1')), [
    'period p1 missing labelEn',
    'period p1 missing labelZh',
    'period p1 number must be 1',
    'period p1 startYear must be 1491',
    'period p1 endYear must be 1607',
  ]);
});

test('validation binds manifest and dataset metadata to the selected registry period', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  manifest.periodId = 'p2';
  data.periods[0].id = 'p2';
  const errors = validateDataset(data, manifest, ledger, PERIOD_ONE);
  assert.ok(errors.includes('manifest periodId must be p1'));
  assert.ok(errors.includes('period p2 id must be p1'));
});

test('validation requires between seven and ten events', () => {
  for (const count of [6, 11]) {
    const { data, manifest, ledger } = validPeriodOneFixture();
    data.events = Array.from({ length: count }, (_, index) => ({
      ...clone(data.events[index % data.events.length]),
      id: `event-${index}`,
      causeIds: [], effectIds: [], relatedIds: [],
    }));
    manifest.eventIds = data.events.map(({ id }) => id);
    const errors = validateDataset(data, manifest, ledger, { ...PERIOD_ONE, id: 'fixture' });
    assert.ok(errors.includes('dataset must contain between 7 and 10 events'));
  }
});

test('validation requires timeline and summary copy plus every event collection', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  const event = data.events[0];
  delete event.timelineTitleZh;
  delete event.summary;
  for (const field of ['siteIds', 'themeIds', 'sourceIds', 'causeIds', 'effectIds', 'relatedIds', 'keywords']) {
    delete event[field];
  }
  const errors = validateDataset(data, manifest, ledger, PERIOD_ONE);
  assert.ok(errors.includes(`event ${event.id} missing timelineTitleZh`));
  assert.ok(errors.includes(`event ${event.id} missing summary`));
  for (const field of ['siteIds', 'themeIds', 'sourceIds', 'causeIds', 'effectIds', 'relatedIds', 'keywords']) {
    assert.ok(errors.includes(`event ${event.id} ${field} must be an array`));
  }
});

test('validation rejects partial coordinates and permits honest non-geographic events', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  delete data.sites[0].y;
  assert.ok(validateDataset(data, manifest, ledger, PERIOD_ONE).includes('site site-1 y out of bounds'));

  data.sites[0].y = 0;
  data.events[0].siteIds = [];
  data.events[0].primarySiteId = null;
  assert.deepEqual(validateDataset(data, manifest, ledger, PERIOD_ONE), []);
});

test('validation rejects event years outside 1491-1607 even when ordered', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  data.events[0].startYear = 1490;
  data.events[0].endYear = 1491;
  data.events[1].startYear = 1607;
  data.events[1].endYear = 1608;
  const errors = validateDataset(data, manifest, ledger, PERIOD_ONE);
  assert.ok(errors.includes(`event ${data.events[0].id} outside Period 1: 1491-1607`));
  assert.ok(errors.includes(`event ${data.events[1].id} outside Period 1: 1491-1607`));
});

test('validation requires source title, kind, and locator strings', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  data.sources[0].title = '';
  data.sources[0].kind = ' ';
  delete data.sources[0].locator;
  assert.deepEqual(validateDataset(data, manifest, ledger, PERIOD_ONE).filter((error) => error.startsWith('source source-1')), [
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
  const errors = validateDataset(invalid, manifest, ledger, PERIOD_ONE);
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
  assert.ok(validateDataset(data, manifest, ledger.replaceAll(`\`${target}\``, ''), PERIOD_ONE).includes(
    `ledger missing event: ${target}`,
  ));
});

test('validation anchors synchronized dataset and manifest IDs to the approved literal baseline', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  data.events = [];
  manifest.eventIds = [];
  const errors = validateDataset(data, manifest, ledger, PERIOD_ONE);
  assert.ok(errors.includes('dataset event order must exactly match approved Period 1 event IDs'));
  assert.ok(errors.includes('manifest eventIds must exactly match approved Period 1 event IDs'));
});

test('validation anchors themes to the official eight-theme literal baseline', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  data.themes = [];
  assert.ok(validateDataset(data, manifest, ledger, PERIOD_ONE).includes(
    'dataset themes must exactly match official APUSH theme IDs',
  ));
});

test('validation requires every event reference collection to be an array', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  const event = data.events[0];
  for (const field of ['siteIds', 'themeIds', 'causeIds', 'effectIds', 'relatedIds', 'keywords', 'sourceIds']) {
    event[field] = 'not-an-array';
  }
  const errors = validateDataset(data, manifest, ledger, PERIOD_ONE);
  for (const field of ['siteIds', 'themeIds', 'causeIds', 'effectIds', 'relatedIds', 'keywords', 'sourceIds']) {
    assert.ok(errors.includes(`event ${event.id} ${field} must be an array`));
  }
});

test('validation requires populated theme/source references and consistent primary geography', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  const event = data.events[0];
  event.siteIds = [];
  event.themeIds = [];
  event.sourceIds = [];
  event.primarySiteId = '';
  const errors = validateDataset(data, manifest, ledger, PERIOD_ONE);
  assert.ok(errors.includes(`event ${event.id} themeIds must contain at least one item`));
  assert.ok(errors.includes(`event ${event.id} sourceIds must contain at least one item`));
  assert.ok(errors.includes(`event ${event.id} primarySiteId must be null when siteIds is empty`));

  event.siteIds = ['site-1'];
  event.primarySiteId = 'other-site';
  assert.ok(validateDataset(data, manifest, ledger, PERIOD_ONE).includes(
    `event ${event.id} primarySiteId must reference an item in siteIds`,
  ));
});

test('validation accumulates defects for a null event without throwing', () => {
  const { data, manifest, ledger } = validPeriodOneFixture();
  data.events[0] = null;
  let errors;
  assert.doesNotThrow(() => { errors = validateDataset(data, manifest, ledger, PERIOD_ONE); });
  assert.ok(errors.includes('event is missing id'));
  assert.ok(errors.includes('event (unknown) missing titleEn'));
  assert.ok(errors.includes('event (unknown) siteIds must be an array'));
});

test('browser verifier server cleanup is idempotent before listen and when repeated', async () => {
  const server = startServer();
  await assert.doesNotReject(server.close());
  await assert.doesNotReject(server.close());
});
