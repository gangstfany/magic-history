import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const APPROVED_PERIOD_1_EVENT_IDS = Object.freeze([
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
export const OFFICIAL_THEME_IDS = Object.freeze(['NAT', 'WXT', 'GEO', 'MIG', 'PCE', 'WOR', 'ARC', 'SOC']);

export function ledgerPathForPeriod(period) {
  const number = Number(period?.number);
  if (!Number.isInteger(number) || number < 1 || period?.id !== `p${number}`) {
    throw new Error(`period number ${period?.number ?? '(missing)'} does not match id ${period?.id ?? '(missing)'}`);
  }
  return `docs/data-sources/apush-period-${number}-source-ledger.md`;
}

export function validateDataset(data, manifest, ledgerText, expectedPeriod) {
  const errors = [];
  const rows = (value, kind) => {
    if (Array.isArray(value)) return value;
    errors.push(`${kind} must be an array`);
    return [];
  };
  const ids = (rows, kind) => {
    const seen = new Set();
    for (const row of rows || []) {
      if (typeof row?.id !== 'string' || !row.id.trim()) errors.push(`${kind} is missing id`);
      else if (seen.has(row.id)) errors.push(`duplicate ${kind} id: ${row.id}`);
      else seen.add(row.id);
    }
    return seen;
  };
  const requiredString = (row, field, kind) => {
    if (typeof row?.[field] !== 'string' || !row[field].trim()) {
      errors.push(`${kind} ${row?.id || '(unknown)'} missing ${field}`);
    }
  };
  const requiredArray = (row, field, eventId) => {
    if (!Array.isArray(row?.[field])) {
      errors.push(`event ${eventId} ${field} must be an array`);
      return null;
    }
    return row[field];
  };
  const periodRows = rows(data?.periods, 'periods');
  const themeRows = rows(data?.themes, 'themes');
  const siteRows = rows(data?.sites, 'sites');
  const sourceRows = rows(data?.sources, 'sources');
  const eventRows = rows(data?.events, 'events');
  const manifestEventIds = rows(manifest?.eventIds, 'manifest eventIds');
  const periodIds = ids(periodRows, 'period');
  const themeIds = ids(themeRows, 'theme');
  const siteIds = ids(siteRows, 'site');
  const sourceIds = ids(sourceRows, 'source');
  const eventIds = ids(eventRows, 'event');
  const expectedId = expectedPeriod?.id;
  if (data?.schemaVersion !== 1) errors.push('dataset schemaVersion must be 1');
  if (manifest?.schemaVersion !== 1) errors.push('manifest schemaVersion must be 1');
  if (manifest?.periodId !== expectedId) errors.push(`manifest periodId must be ${expectedId}`);
  if (eventRows.length < 7 || eventRows.length > 10) errors.push('dataset must contain between 7 and 10 events');
  const dataEventOrder = eventRows.map((event) => event?.id);
  if (JSON.stringify(dataEventOrder) !== JSON.stringify(manifestEventIds)) {
    errors.push('dataset event order must exactly match manifest eventIds');
  }
  if (expectedId === 'p1' && JSON.stringify(dataEventOrder) !== JSON.stringify(APPROVED_PERIOD_1_EVENT_IDS)) {
    errors.push('dataset event order must exactly match approved Period 1 event IDs');
  }
  if (expectedId === 'p1' && JSON.stringify(manifestEventIds) !== JSON.stringify(APPROVED_PERIOD_1_EVENT_IDS)) {
    errors.push('manifest eventIds must exactly match approved Period 1 event IDs');
  }
  if (JSON.stringify(themeRows.map((theme) => theme?.id).sort()) !== JSON.stringify([...OFFICIAL_THEME_IDS].sort())) {
    errors.push('dataset themes must exactly match official APUSH theme IDs');
  }
  for (const period of periodRows) {
    const periodId = period?.id || '(unknown)';
    requiredString(period, 'labelEn', 'period');
    requiredString(period, 'labelZh', 'period');
    if (period?.id !== expectedId) errors.push(`period ${periodId} id must be ${expectedId}`);
    if (period?.number !== expectedPeriod?.number) errors.push(`period ${periodId} number must be ${expectedPeriod?.number}`);
    if (period?.startYear !== expectedPeriod?.startYear) errors.push(`period ${periodId} startYear must be ${expectedPeriod?.startYear}`);
    if (period?.endYear !== expectedPeriod?.endYear) errors.push(`period ${periodId} endYear must be ${expectedPeriod?.endYear}`);
  }
  for (const source of sourceRows) {
    requiredString(source, 'title', 'source');
    requiredString(source, 'kind', 'source');
    requiredString(source, 'locator', 'source');
  }
  for (const site of siteRows) {
    requiredString(site, 'nameEn', 'site');
    requiredString(site, 'nameZh', 'site');
    if (!Number.isFinite(site?.x) || site.x < 0 || site.x > 1600) errors.push(`site ${site?.id || '(unknown)'} x out of bounds`);
    if (!Number.isFinite(site?.y) || site.y < 0 || site.y > 800) errors.push(`site ${site?.id || '(unknown)'} y out of bounds`);
  }
  for (const event of eventRows) {
    const eventId = event?.id || '(unknown)';
    for (const field of ['titleEn', 'titleZh', 'timelineTitleZh', 'dateLabel', 'summary', 'significance', 'examConnection']) {
      requiredString(event, field, 'event');
    }
    if (!periodIds.has(event?.periodId) || event?.periodId !== expectedId) errors.push(`event ${eventId} has invalid periodId`);
    if (!Number.isFinite(event?.startYear) || !Number.isFinite(event?.endYear) || event.startYear > event.endYear) {
      errors.push(`event ${eventId} has invalid date range`);
    } else if (event.startYear < expectedPeriod?.startYear || event.endYear > expectedPeriod?.endYear) {
      errors.push(`event ${eventId} outside Period ${expectedPeriod?.number}: ${expectedPeriod?.startYear}-${expectedPeriod?.endYear}`);
    }
    const eventSiteIds = requiredArray(event, 'siteIds', eventId);
    const eventThemeIds = requiredArray(event, 'themeIds', eventId);
    const causeIds = requiredArray(event, 'causeIds', eventId);
    const effectIds = requiredArray(event, 'effectIds', eventId);
    const relatedIds = requiredArray(event, 'relatedIds', eventId);
    requiredArray(event, 'keywords', eventId);
    const eventSourceIds = requiredArray(event, 'sourceIds', eventId);
    if (eventThemeIds?.length === 0) errors.push(`event ${eventId} themeIds must contain at least one item`);
    if (eventSourceIds?.length === 0) errors.push(`event ${eventId} sourceIds must contain at least one item`);
    if (eventSiteIds?.length === 0) {
      if (event?.primarySiteId !== null) errors.push(`event ${eventId} primarySiteId must be null when siteIds is empty`);
    } else if (typeof event?.primarySiteId !== 'string' || !event.primarySiteId.trim()) {
      errors.push(`event ${eventId} missing primarySiteId`);
    } else {
      if (!siteIds.has(event.primarySiteId)) errors.push(`event ${eventId} unknown primary site`);
      if (eventSiteIds && !eventSiteIds.includes(event.primarySiteId)) {
        errors.push(`event ${eventId} primarySiteId must reference an item in siteIds`);
      }
    }
    for (const siteId of eventSiteIds || []) if (!siteIds.has(siteId)) errors.push(`event ${eventId} unknown site: ${siteId}`);
    for (const themeId of eventThemeIds || []) if (!themeIds.has(themeId)) errors.push(`event ${eventId} unknown theme: ${themeId}`);
    for (const sourceId of eventSourceIds || []) if (!sourceIds.has(sourceId)) errors.push(`event ${eventId} unknown source: ${sourceId}`);
    for (const [field, relationshipIds] of [['causeIds', causeIds], ['effectIds', effectIds], ['relatedIds', relatedIds]]) {
      for (const relatedId of relationshipIds || []) if (!eventIds.has(relatedId)) errors.push(`event ${eventId} unknown ${field}: ${relatedId}`);
    }
    if (!String(ledgerText || '').includes(`\`${eventId}\``)) errors.push(`ledger missing event: ${eventId}`);
  }
  return errors;
}

const PROJECT_ROOT_URL = new URL('../', import.meta.url);
const EXPECTED_REGISTRY_IDS = Object.freeze(Array.from({ length: 9 }, (_, index) => `p${index + 1}`));

function validateRegistry(registry) {
  const errors = [];
  if (registry?.schemaVersion !== 1) errors.push('Registry: schemaVersion must be 1');
  if (!Array.isArray(registry?.periods)) {
    errors.push('Registry: periods must be an array');
    return errors;
  }
  if (registry.periods.length !== EXPECTED_REGISTRY_IDS.length) {
    errors.push(`Registry: expected exactly 9 periods, found ${registry.periods.length}`);
  }
  const seenIds = new Set();
  const seenNumbers = new Set();
  const seenDataPaths = new Set();
  const seenManifestPaths = new Set();
  for (const period of registry.periods) {
    const id = period?.id;
    const number = period?.number;
    if (seenIds.has(id)) errors.push(`Registry: duplicate period id: ${id}`);
    else seenIds.add(id);
    if (seenNumbers.has(number)) errors.push(`Registry: duplicate period number: ${number}`);
    else seenNumbers.add(number);
    if (!EXPECTED_REGISTRY_IDS.includes(id)) {
      errors.push(`Registry: unexpected period id: ${id ?? '(missing)'}`);
    } else {
      const expectedNumber = Number(id.slice(1));
      if (number !== expectedNumber) errors.push(`Registry: period ${id} number must be ${expectedNumber}`);
    }
    const expectedDataPath = Number.isInteger(number) ? `data/apush-period-${number}.json` : null;
    const expectedManifestPath = Number.isInteger(number) ? `data/apush-period-${number}-manifest.json` : null;
    if (period?.dataPath !== expectedDataPath) {
      errors.push(`Registry: period ${id ?? '(missing)'} dataPath must be ${expectedDataPath ?? 'a canonical period data path'}`);
    }
    if (period?.manifestPath !== expectedManifestPath) {
      errors.push(`Registry: period ${id ?? '(missing)'} manifestPath must be ${expectedManifestPath ?? 'a canonical period manifest path'}`);
    }
    if (seenDataPaths.has(period?.dataPath)) errors.push(`Registry: duplicate dataPath: ${period?.dataPath}`);
    else seenDataPaths.add(period?.dataPath);
    if (seenManifestPaths.has(period?.manifestPath)) errors.push(`Registry: duplicate manifestPath: ${period?.manifestPath}`);
    else seenManifestPaths.add(period?.manifestPath);
  }
  for (const id of EXPECTED_REGISTRY_IDS) {
    if (!seenIds.has(id)) errors.push(`Registry: missing period id: ${id}`);
  }
  return errors;
}

async function readJsonForPeriod(readText, url, periodNumber, kind, errors) {
  try {
    return JSON.parse(await readText(url));
  } catch (error) {
    errors.push(`Period ${periodNumber}: unable to read ${kind} (${url.pathname}): ${error.message}`);
    return null;
  }
}

export async function validateAllPeriods({ rootUrl = PROJECT_ROOT_URL, readText = (url) => readFile(url, 'utf8') } = {}) {
  const errors = [];
  let registry;
  try {
    registry = JSON.parse(await readText(new URL('data/apush-period-registry.json', rootUrl)));
  } catch (error) {
    return { periods: [], periodCount: 0, eventCount: 0, errors: [`Registry: unable to read registry: ${error.message}`] };
  }
  const registryErrors = validateRegistry(registry);
  if (registryErrors.length) return { periods: [], periodCount: 0, eventCount: 0, errors: registryErrors };

  const periods = [];
  for (const expectedPeriod of registry.periods) {
    const number = expectedPeriod?.number ?? '(unknown)';
    let ledgerPath;
    try {
      ledgerPath = ledgerPathForPeriod(expectedPeriod);
    } catch (error) {
      errors.push(`Period ${number}: ${error.message}`);
      continue;
    }
    const periodErrors = [];
    const [data, manifest, ledgerText] = await Promise.all([
      readJsonForPeriod(readText, new URL(expectedPeriod.dataPath, rootUrl), number, 'dataset', periodErrors),
      readJsonForPeriod(readText, new URL(expectedPeriod.manifestPath, rootUrl), number, 'manifest', periodErrors),
      (async () => {
        const url = new URL(ledgerPath, rootUrl);
        try {
          return await readText(url);
        } catch (error) {
          periodErrors.push(`Period ${number}: unable to read source ledger (${url.pathname}): ${error.message}`);
          return null;
        }
      })(),
    ]);
    if (data && manifest && ledgerText !== null) {
      periodErrors.push(...validateDataset(data, manifest, ledgerText, expectedPeriod)
        .map((error) => `Period ${number}: ${error}`));
    }
    if (periodErrors.length) {
      errors.push(...periodErrors);
      continue;
    }
    periods.push({ id: expectedPeriod.id, number, eventCount: data.events.length });
  }

  return {
    periods,
    periodCount: periods.length,
    eventCount: periods.reduce((total, period) => total + period.eventCount, 0),
    errors,
  };
}

async function runCli() {
  const result = await validateAllPeriods();
  if (result.errors.length) {
    for (const error of result.errors) console.error(error);
    process.exitCode = 1;
    return;
  }
  for (const period of result.periods) {
    console.log(`APUSH Period ${period.number} dataset valid: ${period.eventCount} events, 0 defects`);
  }
  console.log(`APUSH all-period data valid: ${result.periodCount} periods, ${result.eventCount} events, 0 defects`);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
