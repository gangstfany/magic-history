import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const SOURCE_LEDGER_PATH = new URL(
  '../docs/art-history-sources.md',
  import.meta.url,
);
const U1_SOURCE_LEDGER_PATH = new URL(
  '../docs/data-sources/u1-source-ledger.md',
  import.meta.url,
);
const U3_SOURCE_LEDGER_PATH = new URL(
  '../docs/data-sources/u3-source-ledger.md',
  import.meta.url,
);
const U3_CANONICAL_PATH = new URL(
  './fixtures/u3-canonical.json',
  import.meta.url,
);
const U3_MANIFEST_PATH = new URL(
  '../data/ap-art-history-unit-3-manifest.json',
  import.meta.url,
);
const UNAFFECTED_FIXTURE_PATH = new URL(
  './fixtures/u2-unaffected-legacy.json',
  import.meta.url,
);
const CORRECTED_FIXTURE_PATH = new URL(
  './fixtures/u2-corrected-and-imported.json',
  import.meta.url,
);

const UNAFFECTED_IDS = [
  'ap13-palette-of-king-narmer',
  'ap15-seated-scribe',
  'ap17-great-pyramids-giza',
  'ap18-king-menkaura-and-queen',
  'ap20-temple-of-amun-re-karnak',
  'ap21-mortuary-temple-hatshepsut',
  'ap22-akhenaten-nefertiti-daughters',
  'ap24-last-judgment-of-hunefer',
  'ap27-anavysos-kouros',
  'ap28-peplos-kore',
  'ap33-niobides-krater',
  'ap34-doryphoros',
  'ap36-grave-stele-hegeso',
  'ap37-winged-victory-samothrace',
  'ap38-great-altar-pergamon',
  'ap39-house-of-the-vettii',
  'ap40-alexander-mosaic',
  'ap44-colosseum',
  'ap45-forum-of-trajan',
  'ap46-pantheon',
  'ap47-ludovisi-battle-sarcophagus',
];

const CORRECTED_AND_IMPORTED_IDS = [
  'ap12-white-temple-ziggurat',
  'ap14-statues-votive-figures',
  'ap16-standard-of-ur',
  'ap19-code-of-hammurabi',
  'ap23-tutankhamun-innermost-coffin',
  'ap25-lamassu-sargon-ii',
  'ap26-athenian-agora',
  'ap29-sarcophagus-of-the-spouses',
  'ap30-apadana-darius-xerxes',
  'ap31-temple-minerva-apollo',
  'ap32-tomb-of-the-triclinium',
  'ap35-athenian-acropolis',
  'ap41-seated-boxer',
  'ap42-head-of-a-roman-patrician',
  'ap43-augustus-prima-porta',
];

const COMPLETE_ARTWORK_FIELDS = [
  'id',
  'apNumber',
  'titleEn',
  'titleZh',
  'unit',
  'culture',
  'region',
  'period',
  'date',
  'artistCulture',
  'siteName',
  'siteQualifier',
  'coordinates',
  'medium',
  'workType',
  'function',
  'form',
  'content',
  'context',
  'recognitionAnchors',
  'comparisonIds',
  'imageUrl',
  'imageAlt',
  'imageSourceName',
  'imageSourceUrl',
  'keywords',
].sort();

const EXPECTED_NOTES_REFERENCES = [
  'APAH notes.pdf, p. 6',
  'APAH notes.pdf, pp. 6–7',
  'APAH notes.pdf, p. 7',
  'APAH notes.pdf, pp. 7–8',
  'APAH notes.pdf, pp. 8–9',
  'APAH notes.pdf, pp. 8–9',
  'APAH notes.pdf, pp. 9–10',
  'APAH notes.pdf, pp. 10–11',
  'APAH notes.pdf, pp. 10–11',
  'APAH notes.pdf, pp. 11–12',
  'APAH notes.pdf, pp. 12–13',
  'APAH notes.pdf, pp. 13–14',
  'APAH notes.pdf, pp. 14–15',
  'APAH notes.pdf, pp. 14–15',
  'APAH notes.pdf, pp. 20–21',
  'APAH notes.pdf, pp. 16–17',
  'APAH notes.pdf, pp. 17–18',
  'APAH notes.pdf, p. 16',
  'APAH notes.pdf, p. 17',
  'APAH notes.pdf, pp. 17–18',
  'APAH notes.pdf, pp. 18–19',
  'APAH notes.pdf, pp. 18–19',
  'APAH notes.pdf, pp. 19–20',
  'APAH notes.pdf, pp. 15–16',
  'APAH notes.pdf, pp. 21–22',
  'APAH notes.pdf, pp. 22–23',
  'APAH notes.pdf, pp. 23–24',
  'APAH notes.pdf, pp. 24–25',
  'APAH notes.pdf, pp. 25–26',
  'APAH notes.pdf, pp. 25–26',
  'APAH notes.pdf, pp. 26–27',
  'APAH notes.pdf, pp. 26–27',
  'APAH notes.pdf, pp. 26–27',
  'APAH notes.pdf, pp. 27–28',
  'APAH notes.pdf, pp. 28–29',
  'APAH notes.pdf, p. 29',
];

const U3_LEDGER_HEADER = [
  'AP #',
  'Artwork id',
  'View id',
  'View label',
  'Image',
  'Source page',
  'Creator/institution',
  'License/rights',
];

const U3_REQUIRED_ARTWORK_FIELDS = [
  'id',
  'apNumber',
  'unit',
  'region',
  'culture',
  'traditionGroup',
  'period',
  'titleEn',
  'titleZh',
  'artistCulture',
  'siteName',
  'coordinates',
  'date',
  'medium',
  'workType',
  'function',
  'form',
  'content',
  'context',
  'recognitionAnchors',
  'comparisonIds',
  'keywords',
  'images',
].sort();

const U3_TRADITION_GROUPS = new Set([
  'lateAntiqueByzantine',
  'medievalIslamic',
  'renaissanceMannerism',
  'baroqueColonial',
]);

const UNFINISHED_VALUE = /\b(?:tbd|todo|placeholder|n\/a|not available)\b|待补|待定|占位/i;

function expectedU3TraditionGroup(apNumber) {
  if (apNumber <= 52) return 'lateAntiqueByzantine';
  if (apNumber <= 65 || apNumber === 84) return 'medievalIslamic';
  if (apNumber <= 80 || apNumber === 83) return 'renaissanceMannerism';
  return 'baroqueColonial';
}

function parseJsonBlock(html, id) {
  const match = html.match(new RegExp(
    `<script id="${id}" type="application/json">([\\s\\S]*?)<\\/script>`,
  ));
  assert.ok(match, `missing ${id}`);
  return JSON.parse(match[1]);
}

async function loadActualData() {
  const html = await readFile(HTML_PATH, 'utf8');
  return {
    artworks: parseJsonBlock(html, 'artwork-data'),
    credits: parseJsonBlock(html, 'image-credit-data'),
  };
}

async function loadFixture(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function canonicalizeArtwork(artwork) {
  return {
    ...artwork,
    siteQualifier: artwork.siteQualifier ?? null,
  };
}

async function assertFixtureMatches(path, expectedIds) {
  const [{ artworks, credits }, fixture] = await Promise.all([
    loadActualData(),
    loadFixture(path),
  ]);
  const actualById = new Map(artworks.map((artwork) => [artwork.id, artwork]));
  const actualArtworks = expectedIds.map((id) => {
    const artwork = actualById.get(id);
    assert.ok(artwork, `missing fixture artwork ${id}`);
    return canonicalizeArtwork(artwork);
  });
  const actualCredits = Object.fromEntries(
    expectedIds.map((id) => [id, credits[id]]),
  );

  assert.deepEqual(
    fixture.artworks.map(({ id }) => id),
    expectedIds,
    'fixture must contain the exact intended artwork set in canonical order',
  );
  for (const artwork of fixture.artworks) {
    assert.deepEqual(
      Object.keys(artwork).sort(),
      COMPLETE_ARTWORK_FIELDS,
      `${artwork.id} fixture must contain every canonical artwork field`,
    );
  }
  assert.deepEqual(fixture.artworks, actualArtworks);
  assert.deepEqual(fixture.credits, actualCredits);
  assert.deepEqual(
    Object.keys(fixture.credits),
    expectedIds,
    'fixture must contain one complete credit record per intended artwork',
  );
}

function splitLedgerRow(line) {
  assert.match(line, /^\|.*\|$/, `malformed ledger row: ${line}`);
  return line.split('|').slice(1, -1).map((cell) => cell.trim());
}

function parseLedger(markdown, contract = {}) {
  const rows = markdown
    .split('\n')
    .filter((line) => /^\|\s*\d+\s*\|/.test(line))
    .map(splitLedgerRow);

  if (contract.header) {
    const headerLine = markdown
      .split('\n')
      .find((line) => line.startsWith('| AP # |'));
    assert.ok(headerLine, 'missing exact ledger header');
    assert.deepEqual(splitLedgerRow(headerLine), contract.header);
  }

  if (contract.cellCount) {
    rows.forEach((cells, index) => {
      assert.equal(
        cells.length,
        contract.cellCount,
        `ledger row ${index + 1} must have exactly ${contract.cellCount} cells`,
      );
    });
  }

  if (contract.uniqueKey) {
    const seen = new Set();
    rows.forEach((cells, index) => {
      const key = contract.uniqueKey(cells);
      assert.ok(key, `ledger row ${index + 1} has an empty identity`);
      assert.ok(!seen.has(key), `duplicate ledger identity ${key}`);
      seen.add(key);
    });
  }

  return rows;
}

function markdownLinkUrl(cell) {
  return cell.match(/\]\((https:\/\/.*)\)$/)?.[1] ?? '';
}

function markdownLink(cell) {
  const match = cell.match(/^\[([^\]]+)\]\((https:\/\/[^)]+)\)$/);
  assert.ok(match, `expected one HTTPS Markdown link, received: ${cell}`);
  return { label: match[1], url: match[2] };
}

function assertFinishedString(value, label) {
  assert.equal(typeof value, 'string', `${label} must be a string`);
  assert.ok(value.trim().length > 0, `${label} must not be blank`);
  assert.doesNotMatch(value, UNFINISHED_VALUE, `${label} is unfinished`);
}

function projectCanonicalMedia(fixture) {
  return fixture.artworks.flatMap((work) => work.images.map((image) => ({
    apNumber: work.apNumber,
    artworkId: work.id,
    viewId: image.id,
    viewLabel: image.label,
    imageUrl: image.imageUrl,
    sourceName: image.imageSourceName,
    sourceUrl: image.imageSourceUrl,
  })));
}

function projectCanonicalCredits(fixture) {
  return fixture.artworks.flatMap((work) => {
    const credits = Array.isArray(fixture.credits[work.id])
      ? fixture.credits[work.id]
      : [fixture.credits[work.id]];
    return credits.map((credit, index) => ({
      artworkId: work.id,
      viewId: work.images[index].id,
      creatorOrInstitution: credit.creatorOrInstitution,
      licenseName: credit.licenseName,
      licenseUrl: credit.licenseUrl,
    }));
  });
}

test('live Unit 2 remains the exact AP 12–47 sequence', async () => {
  const { artworks } = await loadActualData();
  const liveU2 = artworks.filter(({ unit }) => unit === 2);

  assert.equal(liveU2.length, 36);
  assert.deepEqual(
    liveU2.map(({ apNumber }) => apNumber),
    Array.from({ length: 36 }, (_, index) => index + 12),
  );
});

test('unaffected legacy records and credits stay field-for-field preserved', async () => {
  await assertFixtureMatches(UNAFFECTED_FIXTURE_PATH, UNAFFECTED_IDS);
});

test('corrected and imported records and credits stay field-for-field preserved', async () => {
  await assertFixtureMatches(
    CORRECTED_FIXTURE_PATH,
    CORRECTED_AND_IMPORTED_IDS,
  );
});

test('live source ledger matches all 36 canonical AP 12–47 records', async () => {
  const [{ artworks, credits }, ledger] = await Promise.all([
    loadActualData(),
    readFile(SOURCE_LEDGER_PATH, 'utf8'),
  ]);
  const u2 = artworks.filter(({ unit }) => unit === 2);
  const rows = parseLedger(ledger);

  assert.equal(u2.length, 36);
  assert.equal(rows.length, 36);
  assert.doesNotMatch(
    ledger,
    /Golden mask|Tutankhamun mask|Old Market Woman|明确排除/,
  );
  assert.doesNotMatch(
    ledger,
    /\]\(\.\.\/APAH%20notes\.pdf\)/,
    'ledger must not link to a PDF that is not in the repository',
  );
  rows.forEach((cells, index) => {
    assert.equal(cells.length, 9, `ledger row ${index + 1} must have 9 cells`);
    const artwork = u2[index];
    const credit = credits[artwork.id];
    const [
      apNumber,
      id,
      title,
      culture,
      officialSource,
      notesSource,
      imageSource,
      directImage,
      creditAndLicense,
    ] = cells;

    assert.equal(Number(apNumber), artwork.apNumber);
    assert.equal(id, `\`${artwork.id}\``);
    assert.equal(title, artwork.titleEn);
    assert.equal(culture, artwork.culture);
    assert.match(officialSource, /College Board.*CED/);
    assert.equal(notesSource, EXPECTED_NOTES_REFERENCES[index]);
    assert.equal(markdownLinkUrl(imageSource), artwork.imageSourceUrl);
    assert.equal(markdownLinkUrl(directImage), artwork.imageUrl);
    assert.match(creditAndLicense, new RegExp(
      credit.creatorOrInstitution.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    ));
    assert.match(creditAndLicense, new RegExp(
      credit.licenseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    ));
    assert.equal(markdownLinkUrl(creditAndLicense), credit.licenseUrl);
  });
});

test('U1 source ledger matches all 11 records and 12 media views', async () => {
  const [{ artworks, credits }, ledger] = await Promise.all([
    loadActualData(),
    readFile(U1_SOURCE_LEDGER_PATH, 'utf8'),
  ]);
  const u1 = artworks.filter(({ unit }) => unit === 1);
  const rows = parseLedger(ledger);
  assert.equal(u1.length, 11);
  assert.equal(rows.length, 12);
  assert.ok(rows.every((cells) => cells.length === 11));

  const expected = u1.flatMap((work) => {
    const media = Array.isArray(work.images)
      ? work.images
      : [{
          label: 'Primary view',
          imageUrl: work.imageUrl,
          imageAlt: work.imageAlt,
          imageSourceName: work.imageSourceName,
          imageSourceUrl: work.imageSourceUrl,
        }];
    const workCredits = Array.isArray(credits[work.id])
      ? credits[work.id]
      : [credits[work.id]];
    return media.map((image, index) => ({
      work,
      image,
      credit: workCredits[index],
    }));
  });

  assert.equal(expected.length, 12);
  rows.forEach((cells, index) => {
    const { work, image, credit } = expected[index];
    const [
      apNumber,
      view,
      officialTitle,
      identificationSource,
      studySource,
      imageUrl,
      sourcePage,
      creator,
      license,
      licenseUrl,
      identityCheck,
    ] = cells;
    assert.equal(Number(apNumber), work.apNumber);
    assert.equal(view, image.label);
    assert.equal(officialTitle, work.titleEn);
    assert.match(identificationSource, /College Board.*CED/);
    assert.ok(studySource.length > 10);
    assert.equal(markdownLinkUrl(imageUrl), image.imageUrl);
    assert.equal(markdownLinkUrl(sourcePage), image.imageSourceUrl);
    assert.match(creator, new RegExp(
      credit.creatorOrInstitution.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    ));
    assert.equal(license, credit.licenseName);
    assert.equal(markdownLinkUrl(licenseUrl), credit.licenseUrl);
    assert.ok(identityCheck.length > 20);
  });

  const stonehengeRows = rows.filter(([apNumber]) => Number(apNumber) === 8);
  assert.deepEqual(
    stonehengeRows.map(([, view]) => view),
    ['Aerial overview', 'Ground-level view'],
  );
});

test('strict ledger parser rejects missing cells, extra cells, and duplicate view identities', () => {
  const row = '| 48 | `ap48-catacomb-priscilla` | greek-chapel | Greek Chapel | [direct image](https://example.com/image.jpg) | [Example](https://example.com/source) | Example institution | [Public domain](https://creativecommons.org/publicdomain/mark/1.0/) |';
  const options = {
    header: U3_LEDGER_HEADER,
    cellCount: 8,
    uniqueKey: ([, artworkId, viewId]) => `${artworkId}\u0000${viewId}`,
  };
  const table = [
    `| ${U3_LEDGER_HEADER.join(' | ')} |`,
    '| ---: | --- | --- | --- | --- | --- | --- | --- |',
  ];

  assert.throws(
    () => parseLedger([...table, row.replace(' | Example institution', '')].join('\n'), options),
    /exactly 8 cells/,
  );
  assert.throws(
    () => parseLedger([...table, row.replace(' | Example institution', ' | unexpected | Example institution')].join('\n'), options),
    /exactly 8 cells/,
  );
  assert.throws(
    () => parseLedger([...table, row, row].join('\n'), options),
    /duplicate ledger identity/,
  );
});

test('U3 source ledger matches 51 canonical works and 103 media views', async () => {
  const [fixture, manifest, ledger, { artworks: liveArtworks }] = await Promise.all([
    loadFixture(U3_CANONICAL_PATH),
    loadFixture(U3_MANIFEST_PATH),
    readFile(U3_SOURCE_LEDGER_PATH, 'utf8'),
    loadActualData(),
  ]);
  const manifestEntries = Object.entries(manifest);
  const expectedIds = manifestEntries.map(([, work]) => work.id);
  const expectedViewCount = manifestEntries.reduce(
    (sum, [, work]) => sum + work.requiredViewIds.length,
    0,
  );

  assert.deepEqual(Object.keys(fixture).sort(), ['artworks', 'credits']);
  assert.equal(fixture.artworks.length, 51);
  assert.equal(expectedViewCount, 103);
  assert.deepEqual(
    fixture.artworks.map(({ apNumber }) => apNumber),
    Array.from({ length: 51 }, (_, index) => index + 48),
  );
  assert.deepEqual(fixture.artworks.map(({ id }) => id), expectedIds);

  const allResolvableIds = new Set([
    ...liveArtworks.map(({ id }) => id),
    ...expectedIds,
  ]);
  const broadProvenanceIds = new Set([
    'ap50-vienna-genesis',
    'ap53-merovingian-fibulae',
    'ap59-bayeux-tapestry',
  ]);

  fixture.artworks.forEach((work, index) => {
    const manifestWork = manifestEntries[index][1];
    const allowedFields = work.provenanceQualifier === undefined
      ? U3_REQUIRED_ARTWORK_FIELDS
      : [...U3_REQUIRED_ARTWORK_FIELDS, 'provenanceQualifier'].sort();
    assert.deepEqual(
      Object.keys(work).sort(),
      allowedFields,
      `${work.id} canonical field schema`,
    );
    assert.equal(work.unit, 3);
    assert.equal(work.apNumber, index + 48);
    assert.equal(work.id, manifestWork.id);
    assert.equal(work.titleEn, manifestWork.titleEn);
    assert.equal(work.region, manifestWork.region);
    assert.equal(work.siteName, manifestWork.siteName);

    for (const key of [
      'id',
      'region',
      'culture',
      'traditionGroup',
      'period',
      'titleEn',
      'titleZh',
      'artistCulture',
      'siteName',
      'date',
      'medium',
      'workType',
      'function',
      'form',
      'content',
      'context',
    ]) {
      assertFinishedString(work[key], `${work.id}.${key}`);
    }
    if (broadProvenanceIds.has(work.id)) {
      assertFinishedString(
        work.provenanceQualifier,
        `${work.id}.provenanceQualifier`,
      );
    }
    assert.ok(U3_TRADITION_GROUPS.has(work.traditionGroup));
    assert.equal(
      work.traditionGroup,
      expectedU3TraditionGroup(work.apNumber),
      `${work.id}: broad tradition grouping`,
    );
    assert.ok(!U3_TRADITION_GROUPS.has(work.culture));
    assert.deepEqual(Object.keys(work.coordinates).sort(), ['x', 'y']);
    assert.ok(Number.isFinite(work.coordinates.x));
    assert.ok(Number.isFinite(work.coordinates.y));
    assert.ok(work.coordinates.x >= 0 && work.coordinates.x <= 1600);
    assert.ok(work.coordinates.y >= 0 && work.coordinates.y <= 800);

    for (const [key, minimum] of [
      ['recognitionAnchors', 2],
      ['comparisonIds', 1],
      ['keywords', 3],
    ]) {
      assert.ok(Array.isArray(work[key]), `${work.id}.${key} must be an array`);
      assert.ok(work[key].length >= minimum, `${work.id}.${key} minimum`);
      work[key].forEach((value, itemIndex) => {
        assertFinishedString(value, `${work.id}.${key}[${itemIndex}]`);
      });
    }
    work.comparisonIds.forEach((id) => {
      assert.ok(allResolvableIds.has(id), `${work.id}: unresolved comparison ${id}`);
    });

    assert.deepEqual(
      work.images.map(({ id }) => id),
      manifestWork.requiredViewIds,
      `${work.id}: exact manifest view order`,
    );
    const imageAlts = new Set();
    work.images.forEach((image) => {
      assert.deepEqual(
        Object.keys(image).sort(),
        [
          'id',
          'imageAlt',
          'imageSourceName',
          'imageSourceUrl',
          'imageUrl',
          'label',
        ],
      );
      for (const key of [
        'id',
        'label',
        'imageUrl',
        'imageAlt',
        'imageSourceName',
        'imageSourceUrl',
      ]) {
        assertFinishedString(image[key], `${work.id}.${image.id}.${key}`);
      }
      assert.match(image.imageUrl, /^https:\/\//);
      assert.match(image.imageSourceUrl, /^https:\/\//);
      assert.ok(
        !imageAlts.has(image.imageAlt),
        `${work.id}: imageAlt must be view-specific`,
      );
      imageAlts.add(image.imageAlt);
    });
  });

  assert.equal(projectCanonicalMedia(fixture).length, 103);
  assert.deepEqual(Object.keys(fixture.credits), expectedIds);
  fixture.artworks.forEach((work) => {
    const credit = fixture.credits[work.id];
    if (work.images.length === 1) {
      assert.ok(!Array.isArray(credit), `${work.id}: single-view credit object`);
    } else {
      assert.ok(Array.isArray(credit), `${work.id}: multi-view credit array`);
      assert.equal(credit.length, work.images.length);
    }
  });

  const rows = parseLedger(ledger, {
    header: U3_LEDGER_HEADER,
    cellCount: 8,
    uniqueKey: ([, artworkId, viewId]) => `${artworkId}\u0000${viewId}`,
  });
  assert.equal(rows.length, 103);
  const ledgerMedia = rows.map((cells) => {
    const [
      apNumber,
      artworkId,
      viewId,
      viewLabel,
      imageCell,
      sourceCell,
    ] = cells;
    const image = markdownLink(imageCell);
    const source = markdownLink(sourceCell);
    return {
      apNumber: Number(apNumber),
      artworkId: artworkId.replace(/^`|`$/g, ''),
      viewId,
      viewLabel,
      imageUrl: image.url,
      sourceName: source.label,
      sourceUrl: source.url,
    };
  });
  assert.deepEqual(ledgerMedia, projectCanonicalMedia(fixture));

  const ledgerCredits = rows.map((cells) => {
    const [, artworkId, viewId, , , , creatorOrInstitution, licenseCell] = cells;
    const license = markdownLink(licenseCell);
    return {
      artworkId: artworkId.replace(/^`|`$/g, ''),
      viewId,
      creatorOrInstitution,
      licenseName: license.label,
      licenseUrl: license.url,
    };
  });
  assert.deepEqual(ledgerCredits, projectCanonicalCredits(fixture));
  rows.forEach((cells, index) => {
    cells.forEach((value, cellIndex) => {
      assertFinishedString(value, `ledger row ${index + 1} cell ${cellIndex + 1}`);
    });
    assert.match(markdownLinkUrl(cells[4]), /^https:\/\//);
    assert.match(markdownLinkUrl(cells[5]), /^https:\/\//);
    assert.match(markdownLinkUrl(cells[7]), /^https:\/\//);
  });
});
