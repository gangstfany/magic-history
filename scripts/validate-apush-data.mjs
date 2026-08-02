import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export function validateDataset(data, manifest, ledgerText) {
  const errors = [];
  const ids = (rows, kind) => {
    const seen = new Set();
    for (const row of rows || []) {
      if (!row?.id) errors.push(`${kind} is missing id`);
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
  const periodIds = ids(data?.periods, 'period');
  const themeIds = ids(data?.themes, 'theme');
  const siteIds = ids(data?.sites, 'site');
  const sourceIds = ids(data?.sources, 'source');
  const eventIds = ids(data?.events, 'event');
  if (data?.schemaVersion !== 1) errors.push('dataset schemaVersion must be 1');
  if (manifest?.schemaVersion !== 1) errors.push('manifest schemaVersion must be 1');
  if (manifest?.periodId !== 'p1') errors.push('manifest periodId must be p1');
  if (JSON.stringify((data?.events || []).map(({ id }) => id)) !== JSON.stringify(manifest?.eventIds || [])) {
    errors.push('dataset event order must exactly match manifest eventIds');
  }
  for (const site of data?.sites || []) {
    requiredString(site, 'nameEn', 'site');
    requiredString(site, 'nameZh', 'site');
    if (!Number.isFinite(site.x) || site.x < 0 || site.x > 1600) errors.push(`site ${site.id} x out of bounds`);
    if (!Number.isFinite(site.y) || site.y < 0 || site.y > 800) errors.push(`site ${site.id} y out of bounds`);
  }
  for (const event of data?.events || []) {
    for (const field of ['titleEn', 'titleZh', 'dateLabel', 'summary', 'significance', 'examConnection']) {
      requiredString(event, field, 'event');
    }
    if (!periodIds.has(event.periodId) || event.periodId !== 'p1') errors.push(`event ${event.id} has invalid periodId`);
    if (!Number.isFinite(event.startYear) || !Number.isFinite(event.endYear) || event.startYear > event.endYear) {
      errors.push(`event ${event.id} has invalid date range`);
    }
    for (const siteId of event.siteIds || []) if (!siteIds.has(siteId)) errors.push(`event ${event.id} unknown site: ${siteId}`);
    if (event.primarySiteId && !siteIds.has(event.primarySiteId)) errors.push(`event ${event.id} unknown primary site`);
    for (const themeId of event.themeIds || []) if (!themeIds.has(themeId)) errors.push(`event ${event.id} unknown theme: ${themeId}`);
    for (const sourceId of event.sourceIds || []) if (!sourceIds.has(sourceId)) errors.push(`event ${event.id} unknown source: ${sourceId}`);
    for (const field of ['causeIds', 'effectIds', 'relatedIds']) {
      for (const relatedId of event[field] || []) if (!eventIds.has(relatedId)) errors.push(`event ${event.id} unknown ${field}: ${relatedId}`);
    }
    if (!ledgerText.includes(`\`${event.id}\``)) errors.push(`ledger missing event: ${event.id}`);
  }
  return errors;
}

async function runCli() {
  const [dataText, manifestText, ledgerText] = await Promise.all([
    readFile(new URL('../data/apush-period-1.json', import.meta.url), 'utf8'),
    readFile(new URL('../data/apush-period-1-manifest.json', import.meta.url), 'utf8'),
    readFile(new URL('../docs/data-sources/apush-period-1-source-ledger.md', import.meta.url), 'utf8'),
  ]);
  const data = JSON.parse(dataText);
  const errors = validateDataset(data, JSON.parse(manifestText), ledgerText);
  if (errors.length) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
    return;
  }
  console.log(`APUSH Period 1 dataset valid: ${data.events.length} events, 0 defects`);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
