import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const DEFAULT_HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const MANIFEST_URLS = Object.freeze({
  1: new URL('../data/ap-art-history-unit-1-manifest.json', import.meta.url),
  2: new URL('../data/ap-art-history-unit-2-manifest.json', import.meta.url),
  3: new URL('../data/ap-art-history-unit-3-manifest.json', import.meta.url),
});
const U3_RIGHTS_URL = new URL(
  '../data/ap-art-history-unit-3-rights.json',
  import.meta.url,
);
const UNIT_RULES = Object.freeze({
  1: Object.freeze({
    start: 1,
    end: 11,
    count: 11,
    regions: new Set(['africa', 'europe', 'americas', 'middleEast', 'eastAsia', 'oceania']),
  }),
  2: Object.freeze({
    start: 12,
    end: 47,
    count: 36,
    regions: new Set(['middleEast', 'northAfrica', 'southernEurope']),
  }),
  3: Object.freeze({
    start: 48,
    end: 98,
    count: 51,
    regions: new Set([
      'italyVatican',
      'france',
      'iberianPeninsula',
      'britishIsles',
      'lowCountries',
      'centralEurope',
      'easternMediterranean',
      'colonialAmericas',
    ]),
  }),
});
const U3_REGION_COUNTS = Object.freeze({
  italyVatican: 18,
  france: 5,
  iberianPeninsula: 5,
  britishIsles: 3,
  lowCountries: 7,
  centralEurope: 4,
  easternMediterranean: 4,
  colonialAmericas: 5,
});
const REQUIRED_FIELDS = [
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
  'coordinates',
  'medium',
  'workType',
  'function',
  'form',
  'content',
  'context',
  'recognitionAnchors',
  'comparisonIds',
  'keywords',
];
const STRING_FIELDS = REQUIRED_FIELDS.filter(
  (field) => !['apNumber', 'unit', 'coordinates', 'recognitionAnchors', 'comparisonIds', 'keywords'].includes(field),
);
const MEDIA_FIELDS = [
  'label',
  'imageUrl',
  'imageAlt',
  'imageSourceName',
  'imageSourceUrl',
];
const LEGACY_MEDIA_FIELDS = MEDIA_FIELDS.filter((field) => field !== 'label');
const U2_CULTURES = new Set(['ancientNearEast', 'egypt', 'greece', 'etruscan', 'rome']);
const U3_CULTURES = new Set([
  'andeanColonialBaroque',
  'britishRococoSatire',
  'byzantineConstantinople',
  'byzantineRavenna',
  'byzantineSinai',
  'colonialMexicaManuscript',
  'dutchBaroque',
  'dutchBaroqueStillLife',
  'earlyByzantineManuscript',
  'earlyChristianRome',
  'earlyNetherlandish',
  'flemishBaroque',
  'florentineEarlyRenaissance',
  'florentineRenaissance',
  'frenchBaroqueAbsolutism',
  'frenchGothic',
  'frenchGothicManuscript',
  'germanGothicDevotional',
  'highRenaissanceItaly',
  'insularHibernoSaxon',
  'italianBaroque',
  'italianMannerism',
  'merovingianMetalwork',
  'nasridAndalusia',
  'newSpainCasta',
  'newSpainEnconchado',
  'newSpainGuadalupe',
  'normanRomanesque',
  'northernRenaissanceFlemish',
  'northernRenaissanceGermany',
  'ottomanIslamic',
  'protestantReformationGermany',
  'protoRenaissanceItaly',
  'romanBaroqueJesuit',
  'romanesquePilgrimage',
  'sephardicJewishManuscript',
  'spanishBaroque',
  'umayyadIberia',
  'venetianRenaissance',
]);
const U3_TRADITION_GROUPS = new Set([
  'lateAntiqueByzantine',
  'medievalIslamic',
  'renaissanceMannerism',
  'baroqueColonial',
]);
const U3_CLASSIFICATIONS = new Map([
  [48, ['earlyChristianRome', 'lateAntiqueByzantine']],
  [49, ['earlyChristianRome', 'lateAntiqueByzantine']],
  [50, ['earlyByzantineManuscript', 'lateAntiqueByzantine']],
  [51, ['byzantineRavenna', 'lateAntiqueByzantine']],
  [52, ['byzantineConstantinople', 'lateAntiqueByzantine']],
  [53, ['merovingianMetalwork', 'medievalIslamic']],
  [54, ['byzantineSinai', 'medievalIslamic']],
  [55, ['insularHibernoSaxon', 'medievalIslamic']],
  [56, ['umayyadIberia', 'medievalIslamic']],
  [57, ['umayyadIberia', 'medievalIslamic']],
  [58, ['romanesquePilgrimage', 'medievalIslamic']],
  [59, ['normanRomanesque', 'medievalIslamic']],
  [60, ['frenchGothic', 'medievalIslamic']],
  [61, ['frenchGothicManuscript', 'medievalIslamic']],
  [62, ['germanGothicDevotional', 'medievalIslamic']],
  [63, ['protoRenaissanceItaly', 'medievalIslamic']],
  [64, ['sephardicJewishManuscript', 'medievalIslamic']],
  [65, ['nasridAndalusia', 'medievalIslamic']],
  [66, ['earlyNetherlandish', 'renaissanceMannerism']],
  [67, ['florentineEarlyRenaissance', 'renaissanceMannerism']],
  [68, ['earlyNetherlandish', 'renaissanceMannerism']],
  [69, ['florentineEarlyRenaissance', 'renaissanceMannerism']],
  [70, ['florentineEarlyRenaissance', 'renaissanceMannerism']],
  [71, ['florentineEarlyRenaissance', 'renaissanceMannerism']],
  [72, ['florentineRenaissance', 'renaissanceMannerism']],
  [73, ['highRenaissanceItaly', 'renaissanceMannerism']],
  [74, ['northernRenaissanceGermany', 'renaissanceMannerism']],
  [75, ['highRenaissanceItaly', 'renaissanceMannerism']],
  [76, ['highRenaissanceItaly', 'renaissanceMannerism']],
  [77, ['northernRenaissanceGermany', 'renaissanceMannerism']],
  [78, ['italianMannerism', 'renaissanceMannerism']],
  [79, ['protestantReformationGermany', 'renaissanceMannerism']],
  [80, ['venetianRenaissance', 'renaissanceMannerism']],
  [81, ['colonialMexicaManuscript', 'baroqueColonial']],
  [82, ['romanBaroqueJesuit', 'baroqueColonial']],
  [83, ['northernRenaissanceFlemish', 'renaissanceMannerism']],
  [84, ['ottomanIslamic', 'medievalIslamic']],
  [85, ['italianBaroque', 'baroqueColonial']],
  [86, ['flemishBaroque', 'baroqueColonial']],
  [87, ['dutchBaroque', 'baroqueColonial']],
  [88, ['italianBaroque', 'baroqueColonial']],
  [89, ['italianBaroque', 'baroqueColonial']],
  [90, ['andeanColonialBaroque', 'baroqueColonial']],
  [91, ['spanishBaroque', 'baroqueColonial']],
  [92, ['dutchBaroque', 'baroqueColonial']],
  [93, ['frenchBaroqueAbsolutism', 'baroqueColonial']],
  [94, ['newSpainEnconchado', 'baroqueColonial']],
  [95, ['newSpainGuadalupe', 'baroqueColonial']],
  [96, ['dutchBaroqueStillLife', 'baroqueColonial']],
  [97, ['newSpainCasta', 'baroqueColonial']],
  [98, ['britishRococoSatire', 'baroqueColonial']],
]);
const U3_PROVENANCE_QUALIFIERS = new Map([
  [
    'ap50-vienna-genesis',
    'Made in Syria or Palestine; the precise workshop is not securely localized.',
  ],
  [
    'ap53-merovingian-fibulae',
    'The Louvre records Jouy-le-Comte as the findspot; the manufacturing workshop is not securely localized, so the map uses a broad early medieval European anchor.',
  ],
  [
    'ap55-lindisfarne-gospels',
    'Made in Northumbria, probably at Lindisfarne; Eadfrith is the traditionally attributed scribe-artist.',
  ],
  [
    'ap59-bayeux-tapestry',
    'Probably embroidered in England for a Norman patron; the precise workshop and original display setting remain debated.',
  ],
  [
    'ap62-rottgen-pieta',
    'Made in the Rhineland; the precise workshop and original devotional setting are not securely localized.',
  ],
  [
    'ap68-arnolfini-portrait',
    'Made in Flanders, probably Bruges; the sitters’ identities and original domestic setting remain debated.',
  ],
]);
const BROAD_PROVENANCE_ARTWORK_IDS = Object.freeze(new Set([
  'ap6-anthropomorphic-stele',
]));
const CREDIT_FIELDS = [
  'creatorOrInstitution',
  'licenseName',
  'licenseUrl',
];
const RIGHTS_FIELDS = [...CREDIT_FIELDS, 'releaseClass'];
const U3_RELEASE_CLASSES = new Set([
  'open',
  'noncommercial',
  'institutionalEducational',
  'restricted',
]);
const U3_RELEASE_CLASS_COUNTS = Object.freeze({
  open: 99,
  noncommercial: 2,
  institutionalEducational: 2,
});
const OPEN_LICENSE_NAMES = new Set([
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

function fail(message) {
  throw new Error(`Invalid artwork data: ${message}`);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function validateStringArray(
  value,
  field,
  id,
  { minimum = 1 } = {},
) {
  if (
    !Array.isArray(value)
    || value.length < minimum
    || value.some((item) => typeof item !== 'string' || item.trim() === '')
  ) {
    const sizeContract = minimum === 0
      ? 'an'
      : `an array with at least ${minimum}`;
    fail(`${id}.${field} must be ${sizeContract} non-empty string${minimum === 1 ? '' : 's'}`);
  }
}

function validateExactKeys(actualKeys, expectedKeys, message) {
  if (
    actualKeys.length !== expectedKeys.length
    || actualKeys.some((key, index) => key !== expectedKeys[index])
  ) {
    fail(message);
  }
}

function validateManifests(manifests) {
  if (!manifests || typeof manifests !== 'object' || Array.isArray(manifests)) {
    fail('official unit manifests must be an object');
  }

  const unitKeys = Object.keys(manifests);
  const activeUnits = unitKeys.length === 2
    && unitKeys.every((key, index) => key === String(index + 1))
    ? [1, 2]
    : unitKeys.length === 3
      && unitKeys.every((key, index) => key === String(index + 1))
      ? [1, 2, 3]
      : null;
  if (!activeUnits) {
    fail('official manifests must contain exactly Units 1-2 or Units 1-3');
  }

  for (const unit of activeUnits) {
    const manifest = manifests[unit];
    const rule = UNIT_RULES[unit];
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
      fail(`official Unit ${unit} manifest must be an object`);
    }
    const expectedKeys = Array.from(
      { length: rule.count },
      (_, index) => String(rule.start + index),
    );
    validateExactKeys(
      Object.keys(manifest),
      expectedKeys,
      `official Unit ${unit} manifest must contain exactly the ${rule.count} numeric keys ${rule.start}..${rule.end}`,
    );
  }
  return activeUnits;
}

export function normalizeArtworkMedia(work) {
  if (Array.isArray(work.images)) {
    return work.images.map((media) => Object.fromEntries(
      MEDIA_FIELDS.map((field) => [field, media?.[field]]),
    ));
  }
  return [{
    label: 'Primary view',
    imageUrl: work.imageUrl,
    imageAlt: work.imageAlt,
    imageSourceName: work.imageSourceName,
    imageSourceUrl: work.imageSourceUrl,
  }];
}

function normalizedMediaIds(artwork) {
  return Array.isArray(artwork.images)
    ? artwork.images.map((media) => media?.id)
    : ['primary'];
}

function validateArtworkMedia(artwork, label, expectedManifest) {
  if (Array.isArray(artwork.images)) {
    if (artwork.images.length === 0) {
      fail(`${label}.images must not be empty`);
    }
  } else if (artwork.unit === 3) {
    fail(`${label}.images must be a non-empty array for Unit 3`);
  } else {
    for (const field of LEGACY_MEDIA_FIELDS) {
      if (typeof artwork[field] !== 'string' || artwork[field].trim() === '') {
        fail(`${label}.${field} must be a non-empty string when images is not provided`);
      }
    }
  }

  const media = normalizeArtworkMedia(artwork);
  const expectedMediaCount = artwork.unit === 3
    ? expectedManifest.requiredViewIds.length
    : artwork.unit === 1 && artwork.apNumber === 8
      ? 2
      : 1;
  if (media.length !== expectedMediaCount) {
    const prefix = artwork.unit === 3 ? `AP ${artwork.apNumber} ${label}` : label;
    fail(`${prefix} must have exactly ${expectedMediaCount} media view${expectedMediaCount === 1 ? '' : 's'}`);
  }

  const viewIds = new Set();
  const imageUrls = new Set();
  const imageAlts = new Set();
  const imageSourceUrls = new Set();
  for (const [index, item] of media.entries()) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      fail(`${label}.media[${index}] must be an object`);
    }
    for (const field of MEDIA_FIELDS) {
      if (typeof item[field] !== 'string' || item[field].trim() === '') {
        fail(`${label}.media[${index}].${field} must be a non-empty string`);
      }
    }
    if (artwork.unit === 3) {
      const viewId = artwork.images[index]?.id;
      if (typeof viewId !== 'string' || viewId.trim() === '') {
        fail(`${label}.media[${index}].id must be a non-empty string`);
      }
      if (viewIds.has(viewId)) {
        fail(`${label} contains duplicate view id ${viewId}`);
      }
      viewIds.add(viewId);
    }
    if (!(artwork.unit === 3 ? isHttpsUrl(item.imageUrl) : isHttpUrl(item.imageUrl))) {
      fail(`${label}.media[${index}].imageUrl must be an ${artwork.unit === 3 ? 'HTTPS' : 'HTTP(S)'} URL`);
    }
    if (!(artwork.unit === 3 ? isHttpsUrl(item.imageSourceUrl) : isHttpUrl(item.imageSourceUrl))) {
      fail(`${label}.media[${index}].imageSourceUrl must be an ${artwork.unit === 3 ? 'HTTPS' : 'HTTP(S)'} URL`);
    }
    if (imageUrls.has(item.imageUrl)) {
      fail(`${label} contains duplicate media imageUrl ${item.imageUrl}`);
    }
    imageUrls.add(item.imageUrl);
    if ((artwork.unit === 1 || artwork.unit === 3) && media.length > 1) {
      if (imageAlts.has(item.imageAlt)) {
        fail(`${label} contains duplicate media imageAlt ${item.imageAlt}`);
      }
      if (imageSourceUrls.has(item.imageSourceUrl)) {
        fail(`${label} contains duplicate media imageSourceUrl ${item.imageSourceUrl}`);
      }
      imageAlts.add(item.imageAlt);
      imageSourceUrls.add(item.imageSourceUrl);
    }
  }

  if (artwork.unit === 3) {
    validateExactKeys(
      normalizedMediaIds(artwork),
      expectedManifest.requiredViewIds,
      `AP ${artwork.apNumber} ${label} required views must match the Unit 3 manifest exactly`,
    );
  }

  return media;
}

export function validateArtworks(artworks, manifests) {
  const activeUnits = validateManifests(manifests);
  const expectedApNumbers = activeUnits.flatMap((unit) => {
    const rule = UNIT_RULES[unit];
    return Array.from({ length: rule.count }, (_, index) => rule.start + index);
  });
  const unitLabel = activeUnits.length === 3 ? '1-3' : '1-2';
  if (!Array.isArray(artworks)) {
    fail('top-level JSON must be an array');
  }
  if (artworks.length !== expectedApNumbers.length) {
    fail(
      `official Units ${unitLabel} manifests require exactly ${expectedApNumbers.length} works and artwork AP numbers must cover exactly 1..${expectedApNumbers.at(-1)}; received ${artworks.length}`,
    );
  }

  const ids = new Set();
  const apNumbers = new Set();
  const u3RegionCounts = Object.fromEntries(
    Object.keys(U3_REGION_COUNTS).map((region) => [region, 0]),
  );

  for (const [index, artwork] of artworks.entries()) {
    if (!artwork || typeof artwork !== 'object' || Array.isArray(artwork)) {
      fail(`entry ${index} must be an object`);
    }
    for (const field of REQUIRED_FIELDS) {
      if (!(field in artwork) || artwork[field] === null || artwork[field] === undefined) {
        fail(`entry ${index} is missing ${field}`);
      }
    }

    const label = typeof artwork.id === 'string' && artwork.id.trim() ? artwork.id : `entry ${index}`;
    for (const field of STRING_FIELDS) {
      if (typeof artwork[field] !== 'string' || artwork[field].trim() === '') {
        fail(`${label}.${field} must be a non-empty string`);
      }
    }
    if (
      BROAD_PROVENANCE_ARTWORK_IDS.has(artwork.id)
      && (typeof artwork.siteQualifier !== 'string' || artwork.siteQualifier.trim() === '')
    ) {
      fail(`${label}.siteQualifier must be a non-empty string for broad-region placement`);
    }
    if (!Number.isInteger(artwork.apNumber) || artwork.apNumber <= 0) {
      fail(`${label}.apNumber must be a positive integer`);
    }
    if (!Number.isInteger(artwork.unit) || !activeUnits.includes(artwork.unit)) {
      fail(`${label}.unit must be ${activeUnits.join(', ')}`);
    }

    const rule = UNIT_RULES[artwork.unit];
    if (artwork.apNumber < rule.start || artwork.apNumber > rule.end) {
      fail(`${label}.apNumber must be within the Unit ${artwork.unit} range (${rule.start}..${rule.end})`);
    }
    if (ids.has(artwork.id)) {
      fail(`duplicate id ${artwork.id}`);
    }
    if (apNumbers.has(artwork.apNumber)) {
      fail(`duplicate AP number ${artwork.apNumber}`);
    }
    const expectedApNumber = index + 1;
    if (artwork.apNumber !== expectedApNumber) {
      fail(
        `official Units ${unitLabel} manifest order requires AP ${expectedApNumber} at entry ${index}; received AP ${artwork.apNumber}`,
      );
    }
    if (artwork.unit === 2 && !U2_CULTURES.has(artwork.culture)) {
      fail(`${label}.culture must be a valid Unit 2 culture`);
    }
    if (artwork.unit === 3) {
      if (!U3_CULTURES.has(artwork.culture)) {
        fail(`${label}.culture must be a valid precise Unit 3 culture`);
      }
      if (
        typeof artwork.traditionGroup !== 'string'
        || !U3_TRADITION_GROUPS.has(artwork.traditionGroup)
      ) {
        fail(`${label}.traditionGroup must be a valid approved Unit 3 tradition group`);
      }
      const [expectedCulture, expectedTraditionGroup] = U3_CLASSIFICATIONS.get(
        artwork.apNumber,
      );
      if (artwork.culture !== expectedCulture) {
        fail(`AP ${artwork.apNumber} culture must match the reviewed Unit 3 assignment ${expectedCulture}`);
      }
      if (artwork.traditionGroup !== expectedTraditionGroup) {
        fail(`AP ${artwork.apNumber} traditionGroup must match the reviewed Unit 3 assignment ${expectedTraditionGroup}`);
      }
      const expectedQualifier = U3_PROVENANCE_QUALIFIERS.get(artwork.id);
      if (expectedQualifier !== undefined) {
        if (artwork.provenanceQualifier !== expectedQualifier) {
          fail(`${label}.provenanceQualifier must match the reviewed Unit 3 provenance qualifier exactly`);
        }
      } else if ('provenanceQualifier' in artwork) {
        fail(`${label}.provenanceQualifier is only allowed for the six reviewed broad-provenance Unit 3 works`);
      }
    }
    if (!rule.regions.has(artwork.region)) {
      fail(`${label}.region must be valid for Unit ${artwork.unit}`);
    }
    if (artwork.unit === 3) {
      u3RegionCounts[artwork.region] += 1;
    }

    const expected = manifests[artwork.unit][String(artwork.apNumber)];
    if (!expected) {
      fail(`${label}.apNumber is not in the official Unit ${artwork.unit} manifest`);
    }
    if (artwork.id !== expected.id) {
      fail(`AP ${artwork.apNumber} manifest id must be ${expected.id}; received ${artwork.id}`);
    }
    if (artwork.titleEn !== expected.titleEn) {
      fail(
        `AP ${artwork.apNumber} manifest title must be "${expected.titleEn}"; received "${artwork.titleEn}"`,
      );
    }
    if (artwork.unit === 3 && artwork.region !== expected.region) {
      fail(
        `AP ${artwork.apNumber} manifest region must be ${expected.region}; received ${artwork.region}`,
      );
    }
    if (artwork.unit === 3 && artwork.siteName !== expected.siteName) {
      fail(
        `AP ${artwork.apNumber} manifest siteName must be "${expected.siteName}"; received "${artwork.siteName}"`,
      );
    }
    ids.add(artwork.id);
    apNumbers.add(artwork.apNumber);

    const { coordinates } = artwork;
    if (
      !coordinates
      || typeof coordinates !== 'object'
      || Array.isArray(coordinates)
      || !Number.isFinite(coordinates.x)
      || !Number.isFinite(coordinates.y)
      || coordinates.x < 0
      || coordinates.x > 1600
      || coordinates.y < 0
      || coordinates.y > 800
    ) {
      fail(`${label}.coordinates must contain x 0..1600 and y 0..800`);
    }

    validateStringArray(
      artwork.recognitionAnchors,
      'recognitionAnchors',
      label,
      { minimum: artwork.unit === 3 ? 2 : 1 },
    );
    validateStringArray(
      artwork.comparisonIds,
      'comparisonIds',
      label,
      { minimum: artwork.unit === 2 ? 0 : 1 },
    );
    validateStringArray(
      artwork.keywords,
      'keywords',
      label,
      { minimum: artwork.unit === 3 ? 3 : 1 },
    );
    validateArtworkMedia(artwork, label, expected);
  }

  validateExactKeys(
    [...apNumbers].map(String).sort((first, second) => Number(first) - Number(second)),
    expectedApNumbers.map(String),
    `artwork AP numbers must cover exactly 1..${expectedApNumbers.at(-1)}`,
  );

  if (activeUnits.includes(3)) {
    const mismatches = Object.entries(U3_REGION_COUNTS)
      .filter(([region, expectedCount]) => u3RegionCounts[region] !== expectedCount)
      .map(
        ([region, expectedCount]) => (
          `${region} expected ${expectedCount}, received ${u3RegionCounts[region]}`
        ),
      );
    if (mismatches.length > 0) {
      fail(`Unit 3 region counts must match exactly (${mismatches.join('; ')})`);
    }
  }

  for (const artwork of artworks) {
    for (const comparisonId of artwork.comparisonIds) {
      if (!ids.has(comparisonId)) {
        fail(`${artwork.id}.comparisonIds references unknown id ${comparisonId}`);
      }
    }
  }

  return artworks;
}

function expectedReleaseClass(licenseName) {
  if (OPEN_LICENSE_NAMES.has(licenseName)) return 'open';
  if (licenseName === 'CC BY-NC-SA 4.0') return 'noncommercial';
  if (
    licenseName === 'Louvre educational-use terms; commercial permission required'
    || licenseName === 'LACMA collection image; reuse subject to museum terms'
  ) {
    return 'institutionalEducational';
  }
  return 'restricted';
}

function validateUnit3RightsAudit(rightsAudit, artworks, credits) {
  if (!rightsAudit || typeof rightsAudit !== 'object' || Array.isArray(rightsAudit)) {
    fail('Unit 3 rights audit must be an object');
  }

  const expectedEntries = artworks
    .filter(({ unit }) => unit === 3)
    .flatMap((artwork) => {
      const rawCredit = credits[artwork.id];
      const creditEntries = Array.isArray(rawCredit) ? rawCredit : [rawCredit];
      return normalizedMediaIds(artwork).map((viewId, index) => [
        `${artwork.id}::${viewId}`,
        creditEntries[index],
      ]);
    });
  if (expectedEntries.length !== 103) {
    fail(`Unit 3 rights audit requires exactly 103 media keys; received ${expectedEntries.length}`);
  }
  validateExactKeys(
    Object.keys(rightsAudit),
    expectedEntries.map(([key]) => key),
    'Unit 3 rights audit media keys must match all 103 reviewed views exactly',
  );

  const releaseClassCounts = Object.fromEntries(
    [...U3_RELEASE_CLASSES].map((releaseClass) => [releaseClass, 0]),
  );
  for (const [mediaKey, canonicalCredit] of expectedEntries) {
    const entry = rightsAudit[mediaKey];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      fail(`Unit 3 rights audit ${mediaKey} must be an object`);
    }
    validateExactKeys(
      Object.keys(entry).sort(),
      RIGHTS_FIELDS.toSorted(),
      `Unit 3 rights audit ${mediaKey} must use the exact rights schema`,
    );
    for (const field of RIGHTS_FIELDS) {
      if (typeof entry[field] !== 'string' || entry[field].trim() === '') {
        fail(`Unit 3 rights audit ${mediaKey}.${field} must be a non-empty string`);
      }
    }
    if (!isHttpsUrl(entry.licenseUrl)) {
      fail(`Unit 3 rights audit ${mediaKey}.licenseUrl must be an HTTPS URL`);
    }
    if (!U3_RELEASE_CLASSES.has(entry.releaseClass)) {
      fail(`Unit 3 rights audit ${mediaKey}.releaseClass must be an allowed release class`);
    }
    if (entry.releaseClass === 'restricted') {
      fail(`Unit 3 release is blocked by restricted media ${mediaKey}`);
    }
    for (const field of CREDIT_FIELDS) {
      if (entry[field] !== canonicalCredit[field]) {
        fail(`Unit 3 rights audit ${mediaKey}.${field} credit mismatch`);
      }
    }
    releaseClassCounts[entry.releaseClass] += 1;
  }

  const distributionMismatch = Object.entries(U3_RELEASE_CLASS_COUNTS)
    .some(([releaseClass, expectedCount]) => (
      releaseClassCounts[releaseClass] !== expectedCount
    ));
  if (distributionMismatch || releaseClassCounts.restricted !== 0) {
    fail(
      `Unit 3 release class distribution must be exactly 99 open, 2 noncommercial, 2 institutionalEducational, and 0 restricted`,
    );
  }

  for (const [mediaKey] of expectedEntries) {
    const entry = rightsAudit[mediaKey];
    const expectedClass = expectedReleaseClass(entry.licenseName);
    if (entry.releaseClass !== expectedClass) {
      fail(`Unit 3 rights audit ${mediaKey}.releaseClass does not match audited license policy`);
    }
  }
}

export function validateImageCredits(credits, artworks, rightsAudit) {
  if (!credits || typeof credits !== 'object' || Array.isArray(credits)) {
    fail('image-credit-data must be an object');
  }
  const artworkIds = artworks.map(({ id }) => id).sort();
  const creditIds = Object.keys(credits).sort();
  validateExactKeys(
    creditIds,
    artworkIds,
    'image credit ids must match artwork ids exactly',
  );

  for (const artwork of artworks) {
    const media = normalizeArtworkMedia(artwork);
    const rawCredit = credits[artwork.id];
    if (media.length === 1 && Array.isArray(rawCredit)) {
      fail(`${artwork.id} single-media image credit must be an object, not an array`);
    }
    if (media.length > 1 && !Array.isArray(rawCredit)) {
      fail(`${artwork.id} multi-media image credits must be an array`);
    }
    const creditEntries = Array.isArray(rawCredit) ? rawCredit : [rawCredit];
    if (creditEntries.length !== media.length) {
      fail(`${artwork.id} image credit count must match its ${media.length} media views`);
    }
    const creditSignatures = new Set();
    for (const [index, credit] of creditEntries.entries()) {
      if (!credit || typeof credit !== 'object' || Array.isArray(credit)) {
        fail(`${artwork.id} image credit ${index + 1} must be an object`);
      }
      if (artwork.unit === 3) {
        validateExactKeys(
          Object.keys(credit).sort(),
          CREDIT_FIELDS.toSorted(),
          `${artwork.id} image credit ${index + 1} must use the exact credit schema`,
        );
      }
      for (const field of CREDIT_FIELDS) {
        if (typeof credit[field] !== 'string' || credit[field].trim() === '') {
          fail(`${artwork.id} image credit ${index + 1} ${field} must be a non-empty string`);
        }
      }
      if (!isHttpsUrl(credit.licenseUrl)) {
        fail(`${artwork.id} image credit ${index + 1} licenseUrl must be an HTTPS URL`);
      }
      if (artwork.unit === 1 && media.length > 1) {
        const signature = JSON.stringify([
          credit.creatorOrInstitution,
          credit.licenseName,
          credit.licenseUrl,
        ]);
        if (creditSignatures.has(signature)) {
          fail(`${artwork.id} contains duplicate image credit metadata`);
        }
        creditSignatures.add(signature);
      }
    }
  }
  if (artworks.some(({ unit }) => unit === 3) && rightsAudit === undefined) {
    fail('Unit 3 reviewed rights audit is required for image credits');
  }
  if (rightsAudit !== undefined) {
    validateUnit3RightsAudit(rightsAudit, artworks, credits);
  }
  return credits;
}

function parseJson(source, label) {
  try {
    return JSON.parse(source);
  } catch (error) {
    fail(`${label} contains invalid JSON (${error.message})`);
  }
  return null;
}

export async function loadAndValidate(htmlPath = DEFAULT_HTML_PATH) {
  const [
    html,
    unit1ManifestSource,
    unit2ManifestSource,
    unit3ManifestSource,
    unit3RightsSource,
  ] = await Promise.all([
    readFile(htmlPath, 'utf8'),
    readFile(MANIFEST_URLS[1], 'utf8'),
    readFile(MANIFEST_URLS[2], 'utf8'),
    readFile(MANIFEST_URLS[3], 'utf8'),
    readFile(U3_RIGHTS_URL, 'utf8'),
  ]);
  const parseDataScript = (id) => {
    const dataScript = html.match(
      new RegExp(
        `<script\\b(?=[^>]*\\bid=["']${id}["'])(?=[^>]*\\btype=["']application/json["'])[^>]*>([\\s\\S]*?)<\\/script>`,
        'i',
      ),
    );
    if (!dataScript) {
      fail(`missing <script id="${id}" type="application/json">`);
    }
    return parseJson(dataScript[1], id);
  };
  const manifests = {
    1: parseJson(unit1ManifestSource, 'official Unit 1 manifest'),
    2: parseJson(unit2ManifestSource, 'official Unit 2 manifest'),
    3: parseJson(unit3ManifestSource, 'official Unit 3 manifest'),
  };
  const artworks = validateArtworks(parseDataScript('artwork-data'), manifests);
  validateImageCredits(
    parseDataScript('image-credit-data'),
    artworks,
    parseJson(unit3RightsSource, 'Unit 3 rights audit'),
  );
  return artworks;
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === invokedPath) {
  const artworks = await loadAndValidate(process.argv[2] ?? DEFAULT_HTML_PATH);
  console.log(`Validated ${artworks.length} AP Art History works`);
}
