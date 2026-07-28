import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const FIXTURE_URL = new URL('./fixtures/u3-canonical.json', import.meta.url);
const MANIFEST_URL = new URL(
  '../data/ap-art-history-unit-3-manifest.json',
  import.meta.url,
);
const RIGHTS_URL = new URL(
  '../data/ap-art-history-unit-3-rights.json',
  import.meta.url,
);
const LEDGER_URL = new URL(
  '../docs/data-sources/u3-source-ledger.md',
  import.meta.url,
);

const CREDIT_FIELDS = [
  'creatorOrInstitution',
  'licenseName',
  'licenseUrl',
];
const RIGHTS_FIELDS = [...CREDIT_FIELDS, 'releaseClass'];
const RELEASE_CLASSES = new Set([
  'open',
  'noncommercial',
  'institutionalEducational',
  'restricted',
]);
const OPEN_LICENSES = new Set([
  'CC BY 2.0',
  'CC BY 4.0',
  'CC BY-SA 2.0',
  'CC BY-SA 2.5',
  'CC BY-SA 3.0',
  'CC BY-SA 4.0',
  'CC0 1.0',
  'Free Art License 1.3',
  'No known copyright restrictions',
  'Public domain (anonymous EU work)',
  'Public domain (self-dedicated)',
  'Public Domain Mark 1.0',
]);

async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}

function mediaKey(artworkId, viewId) {
  return `${artworkId}::${viewId}`;
}

function normalizedCredits(fixture) {
  return fixture.artworks.flatMap((work) => {
    const credits = Array.isArray(fixture.credits[work.id])
      ? fixture.credits[work.id]
      : [fixture.credits[work.id]];
    assert.equal(
      credits.length,
      work.images.length,
      `${work.id}: credit count must match media count`,
    );
    return work.images.map((image, index) => [
      mediaKey(work.id, image.id),
      credits[index],
    ]);
  });
}

function expectedReleaseClass(licenseName) {
  if (OPEN_LICENSES.has(licenseName)) return 'open';
  if (licenseName === 'CC BY-NC-SA 4.0') return 'noncommercial';
  if (
    licenseName === 'Louvre educational-use terms; commercial permission required'
    || licenseName === 'LACMA collection image; reuse subject to museum terms'
  ) {
    return 'institutionalEducational';
  }
  return 'restricted';
}

function assertFinishedString(value, identity, field) {
  assert.equal(typeof value, 'string', `${identity}.${field}: expected string`);
  assert.ok(value.trim(), `${identity}.${field}: expected finished string`);
}

function validateRightsAudit(audit, expectedEntries) {
  assert.deepEqual(
    Object.keys(audit),
    expectedEntries.map(([key]) => key),
    'rights audit key set and order',
  );

  expectedEntries.forEach(([identity, canonicalCredit]) => {
    const entry = audit[identity];
    assert.deepEqual(
      Object.keys(entry).sort(),
      RIGHTS_FIELDS.toSorted(),
      `${identity}: exact rights schema`,
    );
    RIGHTS_FIELDS.forEach((field) => {
      assertFinishedString(entry[field], identity, field);
    });
    assert.match(
      entry.licenseUrl,
      /^https:\/\//,
      `${identity}.licenseUrl: expected HTTPS`,
    );
    assert.ok(
      RELEASE_CLASSES.has(entry.releaseClass),
      `${identity}.releaseClass: unsupported value`,
    );
    assert.equal(
      entry.releaseClass,
      expectedReleaseClass(entry.licenseName),
      `${identity}.releaseClass: does not match audited license policy`,
    );
    CREDIT_FIELDS.forEach((field) => {
      assert.equal(
        entry[field],
        canonicalCredit[field],
        `${identity}.${field}: canonical credit differs from rights audit`,
      );
    });
  });
}

function assertCanonicalCreditSchema(expectedEntries) {
  expectedEntries.forEach(([identity, credit]) => {
    assert.deepEqual(
      Object.keys(credit).sort(),
      CREDIT_FIELDS.toSorted(),
      `${identity}: exact canonical credit schema`,
    );
    CREDIT_FIELDS.forEach((field) => {
      assertFinishedString(credit[field], identity, field);
    });
    assert.match(
      credit.licenseUrl,
      /^https:\/\//,
      `${identity}.licenseUrl: expected HTTPS`,
    );
  });
}

function markdownLink(cell) {
  const match = cell.match(/^\[([^\]]+)\]\((https:\/\/[^)]+)\)$/);
  assert.ok(match, `malformed ledger link: ${cell}`);
  return { label: match[1], url: match[2] };
}

function parseLedgerCredits(markdown) {
  return markdown
    .split('\n')
    .filter((line) => /^\|\s*\d+\s*\|/.test(line))
    .map((line) => {
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
      assert.equal(cells.length, 8, `ledger row must have 8 cells: ${line}`);
      const identity = mediaKey(cells[1].replaceAll('`', ''), cells[2]);
      const license = markdownLink(cells[7]);
      return [
        identity,
        {
          creatorOrInstitution: cells[6],
          licenseName: license.label,
          licenseUrl: license.url,
        },
      ];
    });
}

function assertLedgerMatchesAudit(ledgerEntries, audit) {
  assert.deepEqual(
    ledgerEntries.map(([key]) => key),
    Object.keys(audit),
    'ledger and rights audit key order',
  );
  ledgerEntries.forEach(([identity, credit]) => {
    CREDIT_FIELDS.forEach((field) => {
      assert.equal(
        credit[field],
        audit[identity][field],
        `${identity}.${field}: ledger credit differs from rights audit`,
      );
    });
  });
}

function assertReleaseReady(audit) {
  const restricted = Object.entries(audit)
    .filter(([, entry]) => entry.releaseClass === 'restricted')
    .map(([identity]) => identity);
  assert.deepEqual(
    restricted,
    [],
    `release blocked by restricted media: ${restricted.join(', ')}`,
  );
}

test('U3 rights audit independently freezes all 103 canonical and ledger credits', async () => {
  const [fixture, manifest, audit, ledger] = await Promise.all([
    readJson(FIXTURE_URL),
    readJson(MANIFEST_URL),
    readJson(RIGHTS_URL),
    readFile(LEDGER_URL, 'utf8'),
  ]);
  const expectedKeys = Object.values(manifest).flatMap((work) =>
    work.requiredViewIds.map((viewId) => mediaKey(work.id, viewId)));
  const credits = normalizedCredits(fixture);

  assert.equal(expectedKeys.length, 103);
  assert.deepEqual(credits.map(([key]) => key), expectedKeys);
  assertCanonicalCreditSchema(credits);
  validateRightsAudit(audit, credits);
  assertLedgerMatchesAudit(parseLedgerCredits(ledger), audit);
});

test('U3 rights validator rejects credit, schema, URL, and release downgrades', async () => {
  const [fixture, audit] = await Promise.all([
    readJson(FIXTURE_URL),
    readJson(RIGHTS_URL),
  ]);
  const credits = normalizedCredits(fixture);
  const firstKey = credits[0][0];
  const mutate = (field, value) => {
    const candidate = structuredClone(audit);
    candidate[firstKey][field] = value;
    return candidate;
  };

  assert.throws(
    () => validateRightsAudit(mutate('creatorOrInstitution', 'Altered creator'), credits),
    /canonical credit differs/,
  );
  assert.throws(
    () => validateRightsAudit(mutate('licenseName', 'Altered license'), credits),
    /releaseClass|canonical credit differs/,
  );
  assert.throws(
    () => validateRightsAudit(mutate('licenseUrl', 'https://example.com/altered'), credits),
    /canonical credit differs/,
  );
  const extraKey = structuredClone(audit);
  extraKey[firstKey].unexpected = 'extra';
  assert.throws(
    () => validateRightsAudit(extraKey, credits),
    /exact rights schema/,
  );
  assert.throws(
    () => validateRightsAudit(mutate('licenseUrl', 'http://example.com/license'), credits),
    /expected HTTPS/,
  );
  assert.throws(
    () => validateRightsAudit(mutate('releaseClass', 'institutionalEducational'), credits),
    /audited license policy/,
  );
});

test('U3 release readiness rejects every restricted media view', async () => {
  assertReleaseReady(await readJson(RIGHTS_URL));
});

test('U3 exact AP55 and AP97 OER replacements are noncommercial and release-ready', async () => {
  const [fixture, audit] = await Promise.all([
    readJson(FIXTURE_URL),
    readJson(RIGHTS_URL),
  ]);
  const byId = new Map(fixture.artworks.map((work) => [work.id, work]));
  const ap55 = byId.get('ap55-lindisfarne-gospels').images
    .find(({ id }) => id === 'st-luke-portrait');
  const ap97 = byId.get('ap97-spaniard-indian-mestizo').images[0];

  assert.equal(
    ap55.imageUrl,
    'https://human.libretexts.org/@api/deki/files/29514/luke-portrait.jpg?revision=1',
  );
  assert.equal(
    ap55.imageSourceUrl,
    'https://pressbooks.pub/pacarthistory/back-matter/image-credits/',
  );
  assert.equal(
    ap97.imageUrl,
    'https://human.libretexts.org/@api/deki/files/110949/77fccf037a0741d8859632be19bd3d6f0bd88b60.jpg?revision=1',
  );
  assert.equal(
    ap97.imageSourceUrl,
    'https://smarthistory.org/spaniard-and-indian-produce-a-mestizo-attributed-to-juan-rodriguez/',
  );
  assert.equal(
    audit[mediaKey('ap55-lindisfarne-gospels', 'st-luke-portrait')].releaseClass,
    'noncommercial',
  );
  assert.equal(
    audit[mediaKey('ap97-spaniard-indian-mestizo', 'primary')].releaseClass,
    'noncommercial',
  );
  assertReleaseReady(audit);
});
