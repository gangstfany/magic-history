import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const DEFAULT_HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const MANIFEST_PATHS = Object.freeze({
  1: new URL('../data/ap-art-history-unit-1-manifest.json', import.meta.url),
  2: new URL('../data/ap-art-history-unit-2-manifest.json', import.meta.url),
});
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
const OFFICIAL_AP_NUMBERS = Array.from({ length: 47 }, (_, index) => index + 1);

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

function validateStringArray(value, field, id, { allowEmpty = false } = {}) {
  if (
    !Array.isArray(value)
    || (!allowEmpty && value.length === 0)
    || value.some((item) => typeof item !== 'string' || item.trim() === '')
  ) {
    fail(`${id}.${field} must be ${allowEmpty ? 'an' : 'a non-empty'} array of non-empty strings`);
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
    fail('official Units 1-2 manifests must be an object');
  }

  for (const unit of [1, 2]) {
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

function validateArtworkMedia(artwork, label) {
  if (Array.isArray(artwork.images)) {
    if (artwork.images.length === 0) {
      fail(`${label}.images must not be empty`);
    }
  } else {
    for (const field of LEGACY_MEDIA_FIELDS) {
      if (typeof artwork[field] !== 'string' || artwork[field].trim() === '') {
        fail(`${label}.${field} must be a non-empty string when images is not provided`);
      }
    }
  }

  const media = normalizeArtworkMedia(artwork);
  const expectedMediaCount = artwork.unit === 1 && artwork.apNumber === 8 ? 2 : 1;
  if (media.length !== expectedMediaCount) {
    fail(`${label} must have exactly ${expectedMediaCount} media view${expectedMediaCount === 1 ? '' : 's'}`);
  }

  const imageUrls = new Set();
  for (const [index, item] of media.entries()) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      fail(`${label}.media[${index}] must be an object`);
    }
    for (const field of MEDIA_FIELDS) {
      if (typeof item[field] !== 'string' || item[field].trim() === '') {
        fail(`${label}.media[${index}].${field} must be a non-empty string`);
      }
    }
    if (!isHttpUrl(item.imageUrl)) {
      fail(`${label}.media[${index}].imageUrl must be an HTTP(S) URL`);
    }
    if (!isHttpUrl(item.imageSourceUrl)) {
      fail(`${label}.media[${index}].imageSourceUrl must be an HTTP(S) URL`);
    }
    if (imageUrls.has(item.imageUrl)) {
      fail(`${label} contains duplicate media imageUrl ${item.imageUrl}`);
    }
    imageUrls.add(item.imageUrl);
  }

  return media;
}

export function validateArtworks(artworks, manifests) {
  validateManifests(manifests);
  if (!Array.isArray(artworks)) {
    fail('top-level JSON must be an array');
  }
  if (artworks.length !== OFFICIAL_AP_NUMBERS.length) {
    fail(`official Units 1-2 manifests require exactly 47 works; received ${artworks.length}`);
  }

  const ids = new Set();
  const apNumbers = new Set();

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
    if (!Number.isInteger(artwork.apNumber) || artwork.apNumber <= 0) {
      fail(`${label}.apNumber must be a positive integer`);
    }
    if (!Number.isInteger(artwork.unit) || !UNIT_RULES[artwork.unit]) {
      fail(`${label}.unit must be 1 or 2`);
    }

    const rule = UNIT_RULES[artwork.unit];
    if (artwork.apNumber < rule.start || artwork.apNumber > rule.end) {
      fail(`${label}.apNumber must be within the Unit ${artwork.unit} range (${rule.start}..${rule.end})`);
    }
    const expectedApNumber = index + 1;
    if (artwork.apNumber !== expectedApNumber) {
      fail(
        `official Units 1-2 manifest order requires AP ${expectedApNumber} at entry ${index}; received AP ${artwork.apNumber}`,
      );
    }
    if (artwork.unit === 2 && !U2_CULTURES.has(artwork.culture)) {
      fail(`${label}.culture must be a valid Unit 2 culture`);
    }
    if (!rule.regions.has(artwork.region)) {
      fail(`${label}.region must be valid for Unit ${artwork.unit}`);
    }
    if (ids.has(artwork.id)) {
      fail(`duplicate id ${artwork.id}`);
    }
    if (apNumbers.has(artwork.apNumber)) {
      fail(`duplicate AP number ${artwork.apNumber}`);
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

    validateStringArray(artwork.recognitionAnchors, 'recognitionAnchors', label);
    validateStringArray(artwork.comparisonIds, 'comparisonIds', label, { allowEmpty: true });
    validateStringArray(artwork.keywords, 'keywords', label);
    validateArtworkMedia(artwork, label);
  }

  validateExactKeys(
    [...apNumbers].map(String).sort((first, second) => Number(first) - Number(second)),
    OFFICIAL_AP_NUMBERS.map(String),
    'artwork AP numbers must cover exactly 1..47',
  );

  for (const artwork of artworks) {
    for (const comparisonId of artwork.comparisonIds) {
      if (!ids.has(comparisonId)) {
        fail(`${artwork.id}.comparisonIds references unknown id ${comparisonId}`);
      }
    }
  }

  return artworks;
}

export function validateImageCredits(credits, artworks) {
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
    const creditEntries = Array.isArray(rawCredit) ? rawCredit : [rawCredit];
    if (creditEntries.length !== media.length) {
      fail(`${artwork.id} image credit count must match its ${media.length} media views`);
    }
    for (const [index, credit] of creditEntries.entries()) {
      if (!credit || typeof credit !== 'object' || Array.isArray(credit)) {
        fail(`${artwork.id} image credit ${index + 1} must be an object`);
      }
      for (const field of ['creatorOrInstitution', 'licenseName', 'licenseUrl']) {
        if (typeof credit[field] !== 'string' || credit[field].trim() === '') {
          fail(`${artwork.id} image credit ${index + 1} ${field} must be a non-empty string`);
        }
      }
      if (!isHttpsUrl(credit.licenseUrl)) {
        fail(`${artwork.id} image credit ${index + 1} licenseUrl must be an HTTPS URL`);
      }
    }
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
  const [html, unit1ManifestSource, unit2ManifestSource] = await Promise.all([
    readFile(htmlPath, 'utf8'),
    readFile(MANIFEST_PATHS[1], 'utf8'),
    readFile(MANIFEST_PATHS[2], 'utf8'),
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
  };
  const artworks = validateArtworks(parseDataScript('artwork-data'), manifests);
  validateImageCredits(parseDataScript('image-credit-data'), artworks);
  return artworks;
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === invokedPath) {
  const artworks = await loadAndValidate(process.argv[2] ?? DEFAULT_HTML_PATH);
  console.log(`Validated ${artworks.length} AP Art History works`);
}
