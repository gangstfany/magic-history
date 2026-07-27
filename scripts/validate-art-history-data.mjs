import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const DEFAULT_HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const MANIFEST_PATH = new URL('../data/ap-art-history-unit-2-manifest.json', import.meta.url);
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
  'imageUrl',
  'imageAlt',
  'imageSourceName',
  'imageSourceUrl',
  'keywords',
];
const STRING_FIELDS = REQUIRED_FIELDS.filter(
  (field) => !['apNumber', 'unit', 'coordinates', 'recognitionAnchors', 'comparisonIds', 'keywords'].includes(field),
);
const U2_CULTURES = new Set(['ancientNearEast', 'egypt', 'greece', 'etruscan', 'rome']);
const MAP_REGIONS = new Set(['middleEast', 'northAfrica', 'southernEurope']);

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

export function validateArtworks(artworks, manifest) {
  if (!Array.isArray(artworks)) {
    fail('top-level JSON must be an array');
  }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    fail('official Unit 2 manifest must be an object');
  }
  if (artworks.length !== 36) {
    fail(`official Unit 2 manifest requires exactly 36 works; received ${artworks.length}`);
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
    if (artwork.unit !== 2) {
      fail(`${label}.unit must be 2`);
    }
    if (artwork.apNumber < 12 || artwork.apNumber > 47) {
      fail(`${label}.apNumber must be within the current Unit 2 range (12..47)`);
    }
    if (artwork.apNumber !== index + 12) {
      fail(
        `official Unit 2 manifest order requires AP ${index + 12} at entry ${index}; received AP ${artwork.apNumber}`,
      );
    }
    if (!U2_CULTURES.has(artwork.culture)) {
      fail(`${label}.culture must be a valid Unit 2 culture`);
    }
    if (!MAP_REGIONS.has(artwork.region)) {
      fail(`${label}.region must be middleEast, northAfrica, or southernEurope`);
    }
    if (ids.has(artwork.id)) {
      fail(`duplicate id ${artwork.id}`);
    }
    if (apNumbers.has(artwork.apNumber)) {
      fail(`duplicate AP number ${artwork.apNumber}`);
    }
    const expected = manifest[String(artwork.apNumber)];
    if (!expected) {
      fail(`${label}.apNumber is not in the official Unit 2 manifest`);
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
      || coordinates.x > 1200
      || coordinates.y < 0
      || coordinates.y > 700
    ) {
      fail(`${label}.coordinates must contain x 0..1200 and y 0..700`);
    }

    validateStringArray(artwork.recognitionAnchors, 'recognitionAnchors', label);
    validateStringArray(artwork.comparisonIds, 'comparisonIds', label, { allowEmpty: true });
    validateStringArray(artwork.keywords, 'keywords', label);

    if (!isHttpUrl(artwork.imageUrl)) {
      fail(`${label}.imageUrl must be an HTTP(S) URL`);
    }
    if (!isHttpUrl(artwork.imageSourceUrl)) {
      fail(`${label}.imageSourceUrl must be an HTTP(S) URL`);
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

export function validateImageCredits(credits, artworks) {
  if (!credits || typeof credits !== 'object' || Array.isArray(credits)) {
    fail('image-credit-data must be an object');
  }
  const artworkIds = artworks.map(({ id }) => id).sort();
  const creditIds = Object.keys(credits).sort();
  if (
    artworkIds.length !== creditIds.length
    || artworkIds.some((id, index) => id !== creditIds[index])
  ) {
    fail('image credit ids must match artwork ids exactly');
  }
  for (const id of artworkIds) {
    const credit = credits[id];
    if (!credit || typeof credit !== 'object' || Array.isArray(credit)) {
      fail(`${id} image credit must be an object`);
    }
    for (const field of ['creatorOrInstitution', 'licenseName', 'licenseUrl']) {
      if (typeof credit[field] !== 'string' || credit[field].trim() === '') {
        fail(`${id} image credit ${field} must be a non-empty string`);
      }
    }
    if (!isHttpsUrl(credit.licenseUrl)) {
      fail(`${id} image credit licenseUrl must be an HTTPS URL`);
    }
  }
  return credits;
}

export async function loadAndValidate(htmlPath = DEFAULT_HTML_PATH) {
  const [html, manifestSource] = await Promise.all([
    readFile(htmlPath, 'utf8'),
    readFile(MANIFEST_PATH, 'utf8'),
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
    try {
      return JSON.parse(dataScript[1]);
    } catch (error) {
      fail(`${id} contains invalid JSON (${error.message})`);
    }
    return null;
  };
  const manifest = JSON.parse(manifestSource);
  const artworks = validateArtworks(parseDataScript('artwork-data'), manifest);
  validateImageCredits(parseDataScript('image-credit-data'), artworks);
  return artworks;
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === invokedPath) {
  const artworks = await loadAndValidate(process.argv[2] ?? DEFAULT_HTML_PATH);
  console.log(`Validated ${artworks.length} AP Art History works`);
}
