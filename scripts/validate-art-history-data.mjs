import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const DEFAULT_HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const REQUIRED_FIELDS = [
  'id',
  'apNumber',
  'titleEn',
  'titleZh',
  'civilization',
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
  (field) => !['apNumber', 'coordinates', 'recognitionAnchors', 'comparisonIds', 'keywords'].includes(field),
);
const CIVILIZATIONS = new Set(['egypt', 'greece', 'rome']);

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

function validateStringArray(value, field, id, { allowEmpty = false } = {}) {
  if (
    !Array.isArray(value)
    || (!allowEmpty && value.length === 0)
    || value.some((item) => typeof item !== 'string' || item.trim() === '')
  ) {
    fail(`${id}.${field} must be ${allowEmpty ? 'an' : 'a non-empty'} array of non-empty strings`);
  }
}

export function validateArtworks(artworks) {
  if (!Array.isArray(artworks)) {
    fail('top-level JSON must be an array');
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
    if (!CIVILIZATIONS.has(artwork.civilization)) {
      fail(`${label}.civilization must be egypt, greece, or rome`);
    }
    if (ids.has(artwork.id)) {
      fail(`duplicate id ${artwork.id}`);
    }
    if (apNumbers.has(artwork.apNumber)) {
      fail(`duplicate AP number ${artwork.apNumber}`);
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

export async function loadAndValidate(htmlPath = DEFAULT_HTML_PATH) {
  const html = await readFile(htmlPath, 'utf8');
  const dataScript = html.match(
    /<script\b(?=[^>]*\bid=["']artwork-data["'])(?=[^>]*\btype=["']application\/json["'])[^>]*>([\s\S]*?)<\/script>/i,
  );
  if (!dataScript) {
    fail('missing <script id="artwork-data" type="application/json">');
  }

  let artworks;
  try {
    artworks = JSON.parse(dataScript[1]);
  } catch (error) {
    fail(`artwork-data contains invalid JSON (${error.message})`);
  }
  return validateArtworks(artworks);
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === invokedPath) {
  const artworks = await loadAndValidate(process.argv[2] ?? DEFAULT_HTML_PATH);
  console.log(`Validated ${artworks.length} AP Art History works`);
}
