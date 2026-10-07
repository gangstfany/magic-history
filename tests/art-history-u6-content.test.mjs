import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const HTML_URL = new URL('../art-history-map.html', import.meta.url);
const MANIFEST_URL = new URL('../data/ap-art-history-unit-6-manifest.json', import.meta.url);
const ENGLISH_URL = new URL('../docs/content/ap-art-history-unit-6-english.md', import.meta.url);
const LEDGER_URL = new URL('../docs/data-sources/u6-source-ledger.md', import.meta.url);

const PUBLIC_LICENSE_BY_VIEW = Object.freeze({
  'ap167-great-zimbabwe::conical-tower': Object.freeze({
    licenseName: 'CC BY 3.0; credit Fanny Schertzer, link license, indicate changes',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
  }),
  'ap168-great-mosque-djenne::monday-market': Object.freeze({
    licenseName: 'CC BY 2.0; credit Emilio Labrador, link license, indicate changes',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
  }),
});

const REQUIRED_VIEWS = new Map([
  [167, ['conical-tower', 'circular-wall']],
  [168, ['mosque', 'monday-market']],
  [169, ['wall-plaque', 'oba-context']],
  [170, ['golden-stool', 'stool-context']],
  [171, ['ndop', 'ruler-context']],
  [172, ['primary']],
  [173, ['primary']],
  [174, ['mask', 'performance-context']],
  [175, ['mask', 'performance-context']],
  [176, ['primary']],
  [177, ['memory-board', 'contextual']],
  [178, ['mask', 'performance-context']],
  [179, ['primary']],
  [180, ['primary']],
]);

async function loadLiveWorks() {
  const html = await readFile(HTML_URL, 'utf8');
  const block = html.match(/<script id="artwork-data" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(block, 'live artwork-data JSON block');
  return JSON.parse(block[1]);
}

test('live map imports all 14 bilingual U6 works and 23 ordered manifest views', async () => {
  const [allWorks, manifest] = await Promise.all([
    loadLiveWorks(), readFile(MANIFEST_URL, 'utf8').then(JSON.parse),
  ]);
  assert.equal(allWorks.length, 180);
  const works = allWorks.filter(({ unit }) => unit === 6);
  assert.equal(works.length, 14);
  assert.deepEqual(works.map(({ apNumber }) => apNumber), [...REQUIRED_VIEWS.keys()]);
  assert.equal(works.flatMap(({ images }) => images).length, 23);
  const validIds = new Set(allWorks.map(({ id }) => id));
  for (const work of works) {
    const expected = manifest[work.apNumber];
    for (const field of ['id', 'titleEn', 'region', 'siteName', 'traditionGroup']) {
      assert.equal(work[field], expected[field], `AP ${work.apNumber} ${field}`);
    }
    assert.equal(work.provenanceQualifier ?? null, expected.provenanceQualifier);
    assert.deepEqual(work.images.map(({ id }) => id), expected.requiredViewIds);
    for (const field of ['titleEn', 'titleZh', 'culture', 'date', 'medium', 'function', 'form', 'content', 'context']) {
      assert.equal(typeof work[field], 'string', `AP ${work.apNumber} ${field} type`);
      assert.ok(work[field].trim(), `AP ${work.apNumber} ${field} nonempty`);
    }
    assert.match(work.titleZh, /[\u4e00-\u9fff]/);
    assert.ok(work.recognitionAnchors.length >= 2 && work.recognitionAnchors.length <= 4);
    assert.ok(work.comparisonIds.some((id) => validIds.has(id) && id !== work.id));
    for (const media of work.images) {
      assert.match(media.imageSourceUrl, /^https:\/\//);
      if (media.imageUrl === null) {
        assert.equal(typeof media.mediaStatus, 'string');
        assert.ok(media.mediaStatus.trim());
      } else {
        assert.match(media.imageUrl, /^https:\/\//);
      }
    }
  }
});

test('live U6 media and credit metadata match the frozen ledger exactly', async () => {
  const [allWorks, html, ledger] = await Promise.all([
    loadLiveWorks(), readFile(HTML_URL, 'utf8'), readFile(LEDGER_URL, 'utf8'),
  ]);
  const credits = JSON.parse(html.match(/<script id="image-credit-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  const rows = ledger.split('\n').filter((line) => /^\| \d+ \|/.test(line))
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
  const works = allWorks.filter(({ unit }) => unit === 6);
  assert.equal(works.length, 14);
  const mediaByKey = new Map(works.flatMap((work) => work.images.map((media, index) => [
    `${work.id}::${media.id}`, { media, credit: Array.isArray(credits[work.id]) ? credits[work.id][index] : credits[work.id] },
  ])));
  assert.equal(works.flatMap(({ images }) => images).filter(({ imageUrl }) => imageUrl !== null).length, 2);
  assert.equal(Object.keys(PUBLIC_LICENSE_BY_VIEW).length, 2);
  for (const row of rows) {
    const mediaKey = `${row[1]}::${row[2]}`;
    const { media, credit } = mediaByKey.get(mediaKey);
    assert.equal(media.imageUrl, row[5].startsWith('https://') ? row[5] : null);
    assert.equal(media.imageSourceUrl, row[6].match(/\((https:\/\/[^)]+)\)/)[1]);
    assert.equal(credit.creatorOrInstitution, row[7]);
    assert.ok(credit.licenseName.trim());
    assert.match(credit.licenseUrl, /^https:\/\//);
    if (media.imageUrl !== null) {
      const expectedLicense = PUBLIC_LICENSE_BY_VIEW[mediaKey];
      assert.ok(expectedLicense, `${mediaKey} public image must have a pinned license`);
      assert.equal(credit.licenseName, expectedLicense.licenseName, `${mediaKey} licenseName`);
      assert.equal(credit.licenseUrl, expectedLicense.licenseUrl, `${mediaKey} licenseUrl`);
    }
  }
});

test('Unit 6 manifest freezes AP 167-180 and all 23 ordered views', async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_URL, 'utf8'));
  const expectedIds = [...REQUIRED_VIEWS.keys()].map(String);

  assert.deepEqual(Object.keys(manifest), expectedIds);
  assert.equal([...REQUIRED_VIEWS.values()].flat().length, 23);
  for (const [id, requiredViewIds] of REQUIRED_VIEWS) {
    assert.deepEqual(manifest[id].requiredViewIds, requiredViewIds, `AP ${id} view order`);
  }
});

test('Unit 6 ledger has exactly the 23 manifest view identities in order', async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_URL, 'utf8'));
  const ledger = await readFile(LEDGER_URL, 'utf8');
  assert.ok(ledger.includes('| AP # | Work ID | View ID | Required-view description | Factual sources | Public image URL or placeholder | Source page | Creator/institution | Rights statement |'));
  const rows = ledger.split('\n').filter((line) => /^\| \d+ \|/.test(line))
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
  const expected = Object.entries(manifest).flatMap(([apNumber, work]) =>
    work.requiredViewIds.map((viewId) => [apNumber, work.id, viewId]));
  assert.equal(rows.length, 23);
  assert.deepEqual(rows.map((row) => row.slice(0, 3)), expected);
  for (const row of rows) {
    assert.equal(row.length, 9);
    assert.ok(row.every(Boolean), `Nonempty ledger fields: ${row.slice(0, 3)}`);
    assert.match(row[4], /https:\/\//);
    assert.match(row[6], /https:\/\//);
    assert.ok(row[5] === 'PLACEHOLDER — reusable image not yet verified' || /^https:\/\//.test(row[5]));
  }
});

test('Unit 6 English section and view ordering mirrors its manifest and ledger', async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_URL, 'utf8'));
  const source = await readFile(ENGLISH_URL, 'utf8');
  const ledger = await readFile(LEDGER_URL, 'utf8');
  const expectedSections = ['Identification', 'Function', 'Content', 'Form', 'Context',
    'Recognition Anchors', 'Comparisons', 'Required Views and Sources'];
  for (const [apNumber, work] of Object.entries(manifest)) {
    const section = source.split(`## AP #${apNumber} · `)[1]?.split('\n## AP #')[0] ?? '';
    assert.ok(section.startsWith(`${work.titleEn}\n`), `AP ${apNumber} exact title`);
    assert.deepEqual([...section.matchAll(/^### (.+)$/gm)].map((match) => match[1]), expectedSections);
    const views = section.split('### Required Views and Sources')[1];
    assert.deepEqual([...views.matchAll(/^- `([^`]+)`:/gm)].map((match) => match[1]), work.requiredViewIds);
    const comparisons = section.split('### Comparisons')[1].split('### Required Views and Sources')[0];
    const compared = [...comparisons.matchAll(/AP #(\d+)/g)].map((match) => Number(match[1]));
    assert.ok(compared.some((id) => id >= 1 && id <= 180 && id !== Number(apNumber)), `AP ${apNumber} comparison`);
    for (const viewId of work.requiredViewIds) {
      const row = ledger.split('\n').find((line) => line.startsWith(`| ${apNumber} | ${work.id} | ${viewId} |`));
      const state = row?.split('|')[6].trim();
      const line = views.split('\n').find((entry) => entry.startsWith(`- \`${viewId}\`:`));
      assert.ok(state && line.includes(state), `AP ${apNumber} ${viewId} media state`);
    }
  }
});

test('Unit 6 English edition covers every work once with complete study sections', async () => {
  const source = await readFile(ENGLISH_URL, 'utf8');
  const headings = [...source.matchAll(/^## AP #(\d+) · /gm)].map((match) => Number(match[1]));
  assert.deepEqual(headings, [...REQUIRED_VIEWS.keys()]);
  for (const apNumber of headings) {
    const section = source.split(`## AP #${apNumber} · `)[1]?.split('\n## AP #')[0] ?? '';
    for (const heading of [
      '### Identification', '### Function', '### Content', '### Form',
      '### Context', '### Recognition Anchors', '### Comparisons', '### Required Views and Sources',
    ]) {
      assert.match(section, new RegExp(`^${heading}$`, 'm'), `AP ${apNumber} ${heading}`);
      const body = section.split(`${heading}\n`)[1]?.split(/^### /m)[0].trim() ?? '';
      assert.ok(body, `AP ${apNumber} ${heading} must have nonempty body content`);
    }
  }
});
