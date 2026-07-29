#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { access, readdir, readFile, stat } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, extname, join, normalize, relative } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

export const REQUIRED_VIEWPORTS = Object.freeze([
  { width: 1365, height: 768 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 667, height: 375 },
  { width: 665, height: 700 },
]);

export const BOUNDARY_VIEWPORTS = Object.freeze([
  { width: 519, height: 700 },
  { width: 520, height: 700 },
  { width: 521, height: 700 },
  { width: 519, height: 519 },
  { width: 519, height: 520 },
  { width: 519, height: 521 },
  { width: 520, height: 519 },
  { width: 520, height: 520 },
  { width: 520, height: 521 },
  { width: 521, height: 519 },
  { width: 521, height: 520 },
  { width: 521, height: 521 },
  { width: 639, height: 700 },
  { width: 640, height: 700 },
  { width: 641, height: 700 },
  { width: 664, height: 700 },
  { width: 665, height: 700 },
  { width: 639, height: 519 },
  { width: 639, height: 520 },
  { width: 639, height: 521 },
  { width: 640, height: 519 },
  { width: 640, height: 520 },
  { width: 640, height: 521 },
  { width: 641, height: 519 },
  { width: 641, height: 520 },
  { width: 641, height: 521 },
  { width: 663, height: 519 },
  { width: 663, height: 520 },
  { width: 663, height: 521 },
  { width: 664, height: 519 },
  { width: 664, height: 520 },
  { width: 664, height: 521 },
  { width: 665, height: 519 },
  { width: 665, height: 520 },
  { width: 665, height: 521 },
  { width: 667, height: 519 },
  { width: 667, height: 520 },
  { width: 667, height: 521 },
]);

export const VERIFIER_IMAGE_TIMEOUT_MS = 15_000;
export const BROWSER_VERIFICATION_TIMEOUT_MS = 10 * 60 * 1000;
export const BROWSER_CLEANUP_TIMEOUT_MS = 30_000;
export const U3_FAULT_MODES = Object.freeze([
  'wrong-rendered-url',
  'broken-focus-restoration',
  'duplicate-network-request',
]);

export function parseU3FaultMode(args) {
  const faultArguments = args.filter((argument) => argument.startsWith('--u3-fault'));
  for (const argument of faultArguments) {
    assert.match(
      argument,
      /^--u3-fault=.+$/,
      `Malformed --u3-fault argument ${JSON.stringify(argument)}`,
    );
  }
  assert.ok(
    faultArguments.length <= 1,
    'Verifier accepts exactly one --u3-fault argument',
  );
  if (!faultArguments.length) return null;
  const faultMode = faultArguments[0].slice('--u3-fault='.length);
  assert.ok(
    U3_FAULT_MODES.includes(faultMode),
    `Unknown U3 verifier fault mode ${JSON.stringify(faultMode)}`,
  );
  return faultMode;
}

const PROJECT_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

class DuplicateVerifierJsonKeyError extends Error {}

export function parseVerifierJson(source, label) {
  let index = 0;
  const skipWhitespace = () => {
    while (/\s/.test(source[index] || '')) index += 1;
  };
  const syntaxError = (message) => {
    throw new SyntaxError(`${message} at position ${index}`);
  };
  const parseString = () => {
    if (source[index] !== '"') syntaxError('Expected a JSON string');
    const start = index;
    index += 1;
    while (index < source.length) {
      if (source[index] === '\\') {
        index += 2;
      } else if (source[index] === '"') {
        index += 1;
        return JSON.parse(source.slice(start, index));
      } else {
        index += 1;
      }
    }
    syntaxError('Unterminated JSON string');
    return '';
  };
  const childPath = (path, key) => (
    /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
      ? `${path}.${key}`
      : `${path}[${JSON.stringify(key)}]`
  );
  const parseValue = (path) => {
    skipWhitespace();
    if (source[index] === '{') {
      parseObject(path);
    } else if (source[index] === '[') {
      parseArray(path);
    } else if (source[index] === '"') {
      parseString();
    } else {
      const start = index;
      while (
        index < source.length
        && ![',', ']', '}'].includes(source[index])
        && !/\s/.test(source[index])
      ) index += 1;
      if (index === start) syntaxError('Expected a JSON value');
    }
  };
  const parseObject = (path) => {
    index += 1;
    skipWhitespace();
    if (source[index] === '}') {
      index += 1;
      return;
    }
    const keys = new Set();
    while (index < source.length) {
      skipWhitespace();
      const key = parseString();
      if (keys.has(key)) {
        throw new DuplicateVerifierJsonKeyError(
          `contains duplicate object key ${JSON.stringify(key)} at ${path}`,
        );
      }
      keys.add(key);
      skipWhitespace();
      if (source[index] !== ':') syntaxError('Expected ":" after object key');
      index += 1;
      parseValue(childPath(path, key));
      skipWhitespace();
      if (source[index] === '}') {
        index += 1;
        return;
      }
      if (source[index] !== ',') syntaxError('Expected "," or "}" in object');
      index += 1;
    }
    syntaxError('Unterminated JSON object');
  };
  const parseArray = (path) => {
    index += 1;
    skipWhitespace();
    if (source[index] === ']') {
      index += 1;
      return;
    }
    let itemIndex = 0;
    while (index < source.length) {
      parseValue(`${path}[${itemIndex}]`);
      itemIndex += 1;
      skipWhitespace();
      if (source[index] === ']') {
        index += 1;
        return;
      }
      if (source[index] !== ',') syntaxError('Expected "," or "]" in array');
      index += 1;
    }
    syntaxError('Unterminated JSON array');
  };

  try {
    parseValue('$');
    skipWhitespace();
    if (index !== source.length) syntaxError('Unexpected trailing JSON content');
    return JSON.parse(source);
  } catch (error) {
    if (error instanceof DuplicateVerifierJsonKeyError) {
      throw new Error(`${label} ${error.message}`);
    }
    throw new Error(`${label} contains invalid JSON (${error.message})`);
  }
}

const U1_WORKS = Object.freeze(JSON.parse(
  await readFile(join(PROJECT_ROOT, 'tests', 'fixtures', 'u1-browser.json'), 'utf8'),
));
const NINE_IMPORTED_WORKS = Object.freeze(JSON.parse(
  await readFile(join(PROJECT_ROOT, 'tests', 'fixtures', 'u2-imported-browser.json'), 'utf8'),
));
const U3_WORK_KEYS = Object.freeze([
  'id',
  'apNumber',
  'titleEn',
  'titleZh',
  'unit',
  'region',
  'siteName',
  'images',
]);
const U3_IMAGE_KEYS = Object.freeze([
  'id',
  'label',
  'imageUrl',
  'imageAlt',
  'imageSourceUrl',
]);
const U3_CULTURE_LABELS_ZH = Object.freeze({
  earlyChristianRome: '早期基督教罗马',
  earlyByzantineManuscript: '早期拜占庭手抄本',
  byzantineRavenna: '拜占庭拉文纳',
  byzantineConstantinople: '拜占庭君士坦丁堡',
  merovingianMetalwork: '墨洛温金属工艺',
  byzantineSinai: '拜占庭西奈',
  insularHibernoSaxon: '不列颠群岛希伯诺-撒克逊',
  umayyadIberia: '伊比利亚倭马亚',
  romanesquePilgrimage: '罗马式朝圣艺术',
  normanRomanesque: '诺曼罗马式',
  frenchGothic: '法国哥特式',
  frenchGothicManuscript: '法国哥特式手抄本',
  germanGothicDevotional: '德国哥特式虔敬艺术',
  protoRenaissanceItaly: '意大利原文艺复兴',
  sephardicJewishManuscript: '塞法迪犹太手抄本',
  nasridAndalusia: '纳斯里德安达卢西亚',
  earlyNetherlandish: '早期尼德兰',
  florentineEarlyRenaissance: '佛罗伦萨早期文艺复兴',
  florentineRenaissance: '佛罗伦萨文艺复兴',
  highRenaissanceItaly: '意大利文艺复兴盛期',
  northernRenaissanceGermany: '德国北方文艺复兴',
  italianMannerism: '意大利矫饰主义',
  protestantReformationGermany: '德国宗教改革',
  venetianRenaissance: '威尼斯文艺复兴',
  colonialMexicaManuscript: '新西班牙墨西加殖民手抄本',
  romanBaroqueJesuit: '罗马耶稣会巴洛克',
  northernRenaissanceFlemish: '佛兰德斯北方文艺复兴',
  ottomanIslamic: '奥斯曼伊斯兰',
  italianBaroque: '意大利巴洛克',
  flemishBaroque: '佛兰德斯巴洛克',
  dutchBaroque: '荷兰巴洛克',
  andeanColonialBaroque: '安第斯殖民巴洛克',
  spanishBaroque: '西班牙巴洛克',
  frenchBaroqueAbsolutism: '法国绝对主义巴洛克',
  newSpainEnconchado: '新西班牙螺钿画',
  newSpainGuadalupe: '新西班牙瓜达卢佩圣母艺术',
  dutchBaroqueStillLife: '荷兰巴洛克静物画',
  newSpainCasta: '新西班牙种姓画',
  britishRococoSatire: '英国洛可可讽刺画',
});

function assertExactKeys(value, expected, label) {
  assert.deepEqual(Object.keys(value), expected, `${label} exact keyset`);
}

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `duplicate ${label}`);
}

export function projectAndFreezeU3Canonical(canonical) {
  assertExactKeys(canonical, ['artworks', 'credits'], 'U3 canonical');
  assert.equal(canonical.artworks.length, 51, 'U3 canonical work count');
  const projected = canonical.artworks.map((work, workIndex) => {
    const apNumber = 48 + workIndex;
    assert.equal(work.apNumber, apNumber, `U3 canonical AP ${apNumber} sequence`);
    const rawCredits = canonical.credits[work.id];
    const credits = Array.isArray(rawCredits) ? rawCredits : [rawCredits];
    assert.equal(
      credits.length,
      work.images.length,
      `U3 canonical AP ${apNumber} credit alignment`,
    );
    const cultureLabelZh = U3_CULTURE_LABELS_ZH[work.culture];
    assert.ok(cultureLabelZh, `U3 canonical AP ${apNumber} culture label`);
    const metadata = Object.freeze({
      titleZh: work.titleZh,
      siteName: work.siteName,
      culture: work.culture,
      cultureLabelZh,
      period: work.period,
      date: work.date,
      artistCulture: work.artistCulture,
      medium: work.medium,
      workType: work.workType,
    });
    const images = work.images.map((image, imageIndex) => {
      const canonicalCredit = credits[imageIndex];
      const credit = Object.freeze({
        creatorOrInstitution: canonicalCredit.creatorOrInstitution,
        licenseName: canonicalCredit.licenseName,
        licenseUrl: canonicalCredit.licenseUrl,
        imageSourceName: image.imageSourceName,
        imageSourceUrl: image.imageSourceUrl,
      });
      return Object.freeze({
        id: image.id,
        label: image.label,
        imageUrl: image.imageUrl,
        imageAlt: image.imageAlt,
        imageSourceName: image.imageSourceName,
        imageSourceUrl: image.imageSourceUrl,
        credit,
      });
    });
    return Object.freeze({
      id: work.id,
      apNumber: work.apNumber,
      titleEn: work.titleEn,
      titleZh: work.titleZh,
      unit: work.unit,
      region: work.region,
      siteName: work.siteName,
      metadata,
      images: Object.freeze(images),
    });
  });
  assert.equal(
    projected.reduce((total, work) => total + work.images.length, 0),
    103,
    'U3 canonical rendered credit count',
  );
  return Object.freeze(projected);
}

function projectU3CanonicalBrowser(expectedWorks) {
  return Object.freeze(expectedWorks.map((work) => Object.freeze({
    id: work.id,
    apNumber: work.apNumber,
    titleEn: work.titleEn,
    titleZh: work.titleZh,
    unit: work.unit,
    region: work.region,
    siteName: work.siteName,
    images: Object.freeze(work.images.map((image) => Object.freeze({
      id: image.id,
      label: image.label,
      imageUrl: image.imageUrl,
      imageAlt: image.imageAlt,
      imageSourceUrl: image.imageSourceUrl,
    }))),
  })));
}

function assertExactCanonicalValue(actual, expected, path) {
  if (Array.isArray(expected)) {
    const sharedLength = Math.min(actual.length, expected.length);
    for (let index = 0; index < sharedLength; index += 1) {
      assertExactCanonicalValue(actual[index], expected[index], `${path}[${index}]`);
    }
    if (actual.length > expected.length) {
      assert.fail(`${path}[${expected.length}] unexpected canonical view`);
    }
    if (actual.length < expected.length) {
      assert.fail(`${path}[${actual.length}] missing canonical view`);
    }
    return;
  }
  if (expected && typeof expected === 'object') {
    for (const key of Object.keys(expected)) {
      assertExactCanonicalValue(actual[key], expected[key], `${path}.${key}`);
    }
    return;
  }
  assert.equal(actual, expected, path);
}

const U3_CANONICAL = parseVerifierJson(
  await readFile(join(PROJECT_ROOT, 'tests', 'fixtures', 'u3-canonical.json'), 'utf8'),
  'U3 canonical fixture',
);
const U3_EXPECTED_WORKS = projectAndFreezeU3Canonical(U3_CANONICAL);
const U3_EXPECTED_BROWSER = projectU3CanonicalBrowser(U3_EXPECTED_WORKS);

export function calculateExpectedU3FitTransform(points) {
  assert.ok(points.length > 0, 'U3 expected fit requires canonical points');
  const left = Math.min(...points.map(({ x }) => x));
  const right = Math.max(...points.map(({ x }) => x));
  const top = Math.min(...points.map(({ y }) => y));
  const bottom = Math.max(...points.map(({ y }) => y));
  const padding = 160;
  const scale = Math.min(3, Math.max(1, Math.min(
    1600 / Math.max(1, right - left + padding * 2),
    800 / Math.max(1, bottom - top + padding * 2),
  )));
  const unclamped = {
    x: 800 - (left + right) / 2 * scale,
    y: 400 - (top + bottom) / 2 * scale,
    scale,
  };
  return Object.freeze({
    x: Math.min(0, Math.max(1600 * (1 - scale), unclamped.x)),
    y: Math.min(0, Math.max(800 * (1 - scale), unclamped.y)),
    scale,
  });
}

export function calculateExpectedU3ZoomTransform(transform, nextScale, point) {
  const scale = Math.min(3, Math.max(1, nextScale));
  const contentX = (point.x - transform.x) / transform.scale;
  const contentY = (point.y - transform.y) / transform.scale;
  const unclamped = {
    x: point.x - contentX * scale,
    y: point.y - contentY * scale,
  };
  return Object.freeze({
    x: Math.min(0, Math.max(1600 * (1 - scale), unclamped.x)),
    y: Math.min(0, Math.max(800 * (1 - scale), unclamped.y)),
    scale,
  });
}

const U3_EXPECTED_UNIT_TRANSFORM = calculateExpectedU3FitTransform(
  U3_CANONICAL.artworks.map(({ coordinates }) => coordinates),
);

function compactCanonicalApNumbers(apNumbers) {
  const ranges = [];
  let start = apNumbers[0];
  let end = apNumbers[0];
  for (const apNumber of apNumbers.slice(1)) {
    if (apNumber === end + 1) {
      end = apNumber;
    } else {
      ranges.push(start === end ? String(start) : `${start}–${end}`);
      start = apNumber;
      end = apNumber;
    }
  }
  ranges.push(start === end ? String(start) : `${start}–${end}`);
  return ranges.join(', ');
}

const U3_REGION_BRANCHES = Object.freeze([
  ['italyVatican', 'Italy & Vatican · 18 pieces'],
  ['france', 'France · 5 pieces'],
  ['iberianPeninsula', 'Iberian Peninsula · 5 pieces'],
  ['britishIsles', 'British Isles · 3 pieces'],
  ['lowCountries', 'Low Countries · 7 pieces'],
  ['centralEurope', 'Central Europe · 4 pieces'],
  ['easternMediterranean', 'Eastern Mediterranean · 4 pieces'],
  ['colonialAmericas', 'Colonial Americas · 5 pieces'],
].map(([id, label]) => {
  const canonicalWorks = U3_CANONICAL.artworks.filter(({ region }) => region === id);
  const siteWorks = new Map();
  for (const work of canonicalWorks) {
    if (!siteWorks.has(work.siteName)) siteWorks.set(work.siteName, []);
    siteWorks.get(work.siteName).push(work);
  }
  const siteNames = [...siteWorks.keys()];
  const siteLabels = [...siteWorks]
    .map(([siteName, works]) => (
      `${siteName} · AP ${compactCanonicalApNumbers(works.map(({ apNumber }) => apNumber))}`
      + ` · ${works.length} ${works.length === 1 ? 'piece' : 'pieces'}`
    ))
    .sort();
  return Object.freeze({
    id,
    label,
    siteNames: Object.freeze(siteNames),
    siteLabels: Object.freeze(siteLabels),
  });
}));

export function validateAndFreezeU3Works(works) {
  assert.ok(Array.isArray(works), 'U3 browser fixture must be an array');
  assert.equal(works.length, 51, 'U3 browser fixture must contain exactly 51 U3 works');
  const workIds = [];
  const viewIds = [];
  const imageUrls = [];
  const imageAlts = [];
  const sourceUrls = [];
  let viewCount = 0;

  works.forEach((work, workIndex) => {
    const expectedApNumber = 48 + workIndex;
    assertExactKeys(work, U3_WORK_KEYS, `AP ${expectedApNumber}`);
    assert.equal(work.apNumber, expectedApNumber, `AP ${expectedApNumber} sequence`);
    assert.equal(work.unit, 3, `AP ${expectedApNumber} Unit`);
    for (const key of ['id', 'titleEn', 'titleZh', 'region', 'siteName']) {
      assert.equal(typeof work[key], 'string', `AP ${expectedApNumber} ${key} type`);
      assert.ok(work[key].trim(), `AP ${expectedApNumber} ${key} value`);
    }
    assert.ok(Array.isArray(work.images), `AP ${expectedApNumber} images`);
    assert.ok(work.images.length > 0, `AP ${expectedApNumber} must retain required views`);
    workIds.push(work.id);
    work.images.forEach((image, imageIndex) => {
      assertExactKeys(
        image,
        U3_IMAGE_KEYS,
        `AP ${expectedApNumber} view ${imageIndex + 1}`,
      );
      for (const key of U3_IMAGE_KEYS) {
        assert.equal(
          typeof image[key],
          'string',
          `AP ${expectedApNumber} view ${imageIndex + 1} ${key} type`,
        );
        assert.ok(
          image[key].trim(),
          `AP ${expectedApNumber} view ${imageIndex + 1} ${key} value`,
        );
      }
      assert.match(image.imageUrl, /^https:\/\//, `AP ${expectedApNumber} image URL`);
      assert.match(
        image.imageSourceUrl,
        /^https:\/\//,
        `AP ${expectedApNumber} image source URL`,
      );
      viewIds.push(`${work.id}/${image.id}`);
      imageUrls.push(image.imageUrl);
      imageAlts.push(image.imageAlt);
      sourceUrls.push(image.imageSourceUrl);
      viewCount += 1;
      Object.freeze(image);
    });
    Object.freeze(work.images);
    Object.freeze(work);
  });
  assert.equal(viewCount, 103, 'U3 browser fixture must contain exactly 103 U3 views');
  assertUnique(workIds, 'U3 work id');
  assertUnique(viewIds, 'U3 view id');
  assertUnique(imageUrls, 'U3 image URL');
  assertUnique(imageAlts, 'U3 image alt');
  assertUnique(sourceUrls, 'U3 image source URL');
  works.forEach((work, index) => {
    assertExactCanonicalValue(
      work,
      U3_EXPECTED_BROWSER[index],
      `U3 canonical projection.AP${work.apNumber}`,
    );
  });
  return Object.freeze(works);
}

const U3_WORKS = validateAndFreezeU3Works(parseVerifierJson(
  await readFile(join(PROJECT_ROOT, 'tests', 'fixtures', 'u3-browser.json'), 'utf8'),
  'U3 browser fixture',
));
const IMAGE_FIXTURE = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="#d8c5a7"/><circle cx="320" cy="240" r="120" fill="#8f553f"/></svg>',
);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

async function isReadable(path) {
  if (!path) return false;
  try {
    await access(path, fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function newestDirectory(path) {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];
  } catch {
    return null;
  }
}

export async function discoverPlaywright() {
  const configured = process.env.ART_HISTORY_PLAYWRIGHT_PATH;
  const cacheRoot = join(homedir(), 'Library', 'Caches', 'ms-playwright-go');
  const cacheVersion = await newestDirectory(cacheRoot);
  const candidates = [
    configured,
    join(PROJECT_ROOT, 'node_modules', 'playwright', 'index.mjs'),
    join(PROJECT_ROOT, 'node_modules', 'playwright', 'index.js'),
    join(PROJECT_ROOT, 'node_modules', 'playwright-core', 'index.mjs'),
    join(PROJECT_ROOT, 'node_modules', 'playwright-core', 'index.js'),
    cacheVersion && join(cacheRoot, cacheVersion, 'package', 'index.mjs'),
    cacheVersion && join(cacheRoot, cacheVersion, 'package', 'index.js'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (!await isReadable(candidate)) continue;
    try {
      return await import(pathToFileURL(candidate).href);
    } catch {
      // Try the next discovered installation and report one actionable error below.
    }
  }
  throw new Error(
    'No supported Playwright runtime found. Install playwright locally or set ART_HISTORY_PLAYWRIGHT_PATH.',
  );
}

export async function discoverBrowser(chromium) {
  const configured = process.env.ART_HISTORY_BROWSER_PATH;
  const candidates = [
    configured,
    chromium?.executablePath?.(),
    process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : null,
    process.platform === 'darwin'
      ? '/Applications/Chromium.app/Contents/MacOS/Chromium'
      : null,
    process.platform === 'linux' ? '/usr/bin/google-chrome' : null,
    process.platform === 'linux' ? '/usr/bin/chromium' : null,
    process.platform === 'win32'
      ? join(process.env.PROGRAMFILES || '', 'Google', 'Chrome', 'Application', 'chrome.exe')
      : null,
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (await isReadable(candidate)) return candidate;
  }
  throw new Error(
    'No supported Chromium or Chrome executable found. Install Chrome/Chromium or set ART_HISTORY_BROWSER_PATH.',
  );
}

export async function startStaticServer(root = PROJECT_ROOT) {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
      if (requestUrl.pathname === '/favicon.ico') {
        response.writeHead(204);
        response.end();
        return;
      }
      const decoded = decodeURIComponent(requestUrl.pathname);
      const requested = decoded === '/' ? '/index.html' : decoded;
      const path = normalize(join(root, requested));
      if (relative(root, path).startsWith('..')) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
      }
      const info = await stat(path);
      const file = info.isDirectory() ? join(path, 'index.html') : path;
      const body = await readFile(file);
      response.writeHead(200, {
        'content-type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-store',
      });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => (
      error ? reject(error) : resolve()
    ))),
  };
}

function installErrorCollection(page, label) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(`${label} pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (
      message.type() === 'error'
      || message.type() === 'warning'
    ) {
      errors.push(`${label} console ${message.type()}: ${message.text()}`);
    }
  });
  return errors;
}

export function assertNoCollectedIssues(issues, label) {
  assert.deepEqual(issues, [], `${label}: ${issues.join('\n')}`);
}

export function assertDialogFocusRestored(restored, label) {
  assert.equal(restored, true, `${label} dialog focus restoration`);
}

export function assertU3ViewMatches(actual, expected, label) {
  assert.equal(actual.id, expected.id, `${label} view id`);
  assert.equal(actual.label, expected.label, `${label} view label`);
  assert.equal(actual.imageUrl, expected.imageUrl, `${label} image URL`);
  assert.equal(actual.imageAlt, expected.imageAlt, `${label} image alt`);
  assert.equal(actual.imageSourceUrl, expected.imageSourceUrl, `${label} image source URL`);
}

export function assertU3MetadataMatches(actual, expected, label) {
  for (const field of [
    'titleZh',
    'siteName',
    'cultureLabelZh',
    'period',
    'date',
    'artistCulture',
    'medium',
    'workType',
  ]) {
    assert.equal(actual[field], expected[field], `${label} ${field}`);
  }
}

export function assertU3CreditMatches(actual, expected, label) {
  for (const field of [
    'creatorOrInstitution',
    'licenseName',
    'licenseUrl',
    'imageSourceName',
    'imageSourceUrl',
  ]) {
    assert.equal(actual[field], expected[field], `${label} ${field}`);
  }
}

export function assertU3RegionTraversalCoverage(actualLabels, label) {
  const expectedLabels = U3_REGION_BRANCHES.map((region) => region.label);
  const length = Math.max(actualLabels.length, expectedLabels.length);
  for (let index = 0; index < length; index += 1) {
    assert.equal(
      actualLabels[index],
      expectedLabels[index],
      `${label} expected ${expectedLabels[index] || 'no extra branch'} at index ${index}`,
    );
  }
}

export function assertU3SiteTraversalCoverage(actualLabels, expectedLabels, label) {
  assert.deepEqual(
    [...actualLabels].sort(),
    [...expectedLabels].sort(),
    `${label} exact canonical site markers`,
  );
}

export function assertU3TransformMatches(actual, expected, label) {
  for (const field of ['x', 'y', 'scale']) {
    assert.ok(
      Number.isFinite(actual[field])
        && Math.abs(actual[field] - expected[field]) <= 1e-4,
      `${label} ${field}: expected ${expected[field]}, received ${actual[field]}`,
    );
  }
}

export function assertExactImageRequests(imageRequests, work, checkpoint) {
  assert.equal(
    imageRequests.size,
    work.images.length,
    `${checkpoint} AP ${work.apNumber} expected image URL count`,
  );
  for (const image of work.images) {
    assert.equal(
      imageRequests.get(image.imageUrl),
      1,
      `${checkpoint} AP ${work.apNumber} ${image.id} request count`,
    );
  }
}

export function createImageRequestObserver(imageRequests) {
  const observe = (url) => {
    imageRequests.set(url, (imageRequests.get(url) || 0) + 1);
  };
  return {
    observe,
    beginExactReload(url) {
      return {
        url,
        countBeforeReload: imageRequests.get(url) || 0,
        attempted: true,
      };
    },
    completeExactReload(url, attempt) {
      assert.equal(attempt?.attempted, true, `${url} exact reload was not attempted`);
      assert.equal(attempt?.url, url, `${url} exact reload attempt URL`);
      const routeObserved = (imageRequests.get(url) || 0) > attempt.countBeforeReload;
      if (!routeObserved) observe(url);
      return {
        attempted: true,
        routeObserved,
        fallbackObservationAdded: !routeObserved,
      };
    },
  };
}

async function mockRemoteImages(page, onImageRequest = () => {}) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, async (route) => {
    if (route.request().resourceType() === 'image') {
      onImageRequest(route.request().url());
      await route.fulfill({
        status: 200,
        contentType: 'image/svg+xml',
        body: IMAGE_FIXTURE,
      });
      return;
    }
    await route.fulfill({ status: 204, body: '' });
  });
}

async function waitForArt(frame) {
  await frame.locator('#markerLayer .site-marker').first().waitFor();
  await frame.locator('#unitFilter').waitFor();
}

async function waitForPostTransformRender(frame) {
  await frame.evaluate(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
}

export async function waitForVerifierImage(
  image,
  label,
  timeoutMs = VERIFIER_IMAGE_TIMEOUT_MS,
) {
  const deadline = Date.now() + timeoutMs;
  try {
    await image.waitFor({ state: 'attached', timeout: timeoutMs });
  } catch (error) {
    throw new Error(
      `${label} image element was not attached within ${timeoutMs} ms`,
      { cause: error },
    );
  }
  const remainingTimeoutMs = Math.max(0, deadline - Date.now());
  if (!remainingTimeoutMs) {
    throw new Error(`${label} image timed out after ${timeoutMs} ms`);
  }
  await image.evaluate((element, options) => {
    const {
      imageLabel,
      imageTimeoutMs,
      reportedTimeoutMs,
    } = options;
    const failure = (reason) => new Error(`${imageLabel} image ${reason}`);
    if (element.complete) {
      if (element.naturalWidth > 0) return;
      throw failure('already failed (complete with naturalWidth 0)');
    }
    return new Promise((resolve, reject) => {
      let settled = false;
      let timer;
      const cleanup = () => {
        element.removeEventListener('load', onLoad);
        element.removeEventListener('error', onError);
        clearTimeout(timer);
      };
      const settle = (error) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (error) reject(error);
        else resolve();
      };
      const onLoad = () => {
        settle(element.naturalWidth > 0
          ? null
          : failure('loaded without a natural width'));
      };
      const onError = () => settle(failure('emitted an error event'));
      element.addEventListener('load', onLoad, { once: true });
      element.addEventListener('error', onError, { once: true });
      timer = setTimeout(
        () => settle(failure(`timed out after ${reportedTimeoutMs} ms`)),
        imageTimeoutMs,
      );
      if (element.complete) onLoad();
    });
  }, {
    imageLabel: label,
    imageTimeoutMs: remainingTimeoutMs,
    reportedTimeoutMs: timeoutMs,
  });
}

async function geometry(frame) {
  return frame.evaluate(() => {
    const workspace = document.querySelector('.art-workspace').getBoundingClientRect();
    const map = document.querySelector('.map-panel').getBoundingClientRect();
    const detail = document.querySelector('.detail-panel').getBoundingClientRect();
    const toolbar = document.querySelector('.filter-toolbar').getBoundingClientRect();
    const bodyStyle = getComputedStyle(document.body);
    return {
      innerWidth,
      innerHeight,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      pageScroll: document.documentElement.scrollHeight - document.documentElement.clientHeight,
      bodyOverflowY: bodyStyle.overflowY,
      workspace: { width: workspace.width, height: workspace.height },
      toolbar: { top: toolbar.top, bottom: toolbar.bottom, height: toolbar.height },
      map: { x: map.x, y: map.y, width: map.width, height: map.height },
      detail: { x: detail.x, y: detail.y, width: detail.width, height: detail.height },
      contentBottom: Math.max(toolbar.bottom, map.bottom, detail.bottom),
      scrollHeight: document.documentElement.scrollHeight,
      stacked: detail.y >= map.y + map.height - 1,
      detailScroll: document.querySelector('.detail-panel').scrollHeight
        - document.querySelector('.detail-panel').clientHeight,
      horizontalOverflowElements: [...document.querySelectorAll('body *')]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            selector: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`
              + `${[...element.classList].map((name) => `.${name}`).join('')}`,
            left: rect.left,
            right: rect.right,
            width: rect.width,
          };
        })
        .filter(({ left, right }) => left < -1 || right > innerWidth + 1)
        .slice(0, 12),
    };
  });
}

function assertReachability(metrics, mode, viewport) {
  const fitsFrame = metrics.contentBottom <= metrics.innerHeight + 1;
  const childCanScroll = metrics.pageScroll > 0 && (
    mode === 'standalone'
    || ['auto', 'scroll'].includes(metrics.bodyOverflowY)
  );
  assert.ok(
    fitsFrame || childCanScroll,
    `${mode} ${viewport.width}x${viewport.height} content bottom ${metrics.contentBottom}`
      + ` is clipped by ${metrics.innerHeight}px frame with ${metrics.bodyOverflowY} overflow`,
  );
  if (metrics.bodyOverflowY === 'hidden') {
    assert.ok(
      fitsFrame,
      `${mode} ${viewport.width}x${viewport.height} hidden child clips content`,
    );
  }
  if (
    mode === 'embedded'
    && metrics.bodyOverflowY === 'hidden'
    && metrics.stacked
    && metrics.innerWidth <= 520
  ) {
    assert.ok(
      metrics.detail.height >= 220,
      `${mode} ${viewport.width}x${viewport.height} detail height ${metrics.detail.height}`,
    );
  }
}

async function assertCommonLayout(frame, mode, viewport) {
  const metrics = await geometry(frame);
  assert.ok(
    metrics.horizontalOverflow <= 1,
    `${mode} ${viewport.width} has ${metrics.horizontalOverflow}px horizontal overflow: `
      + JSON.stringify(metrics.horizontalOverflowElements),
  );
  assert.equal(
    await frame.locator('.page-header').isVisible(),
    mode === 'standalone',
    `${mode} header visibility`,
  );
  const expectedStack = metrics.innerWidth <= 664;
  assert.equal(metrics.stacked, expectedStack, `${mode} ${viewport.width} stack mode`);
  if (!expectedStack) {
    assert.ok(metrics.map.width >= 348, `${mode} ${viewport.width} map width ${metrics.map.width}`);
    assert.ok(metrics.detail.width >= 273, `${mode} ${viewport.width} detail width ${metrics.detail.width}`);
  }
  const controls = await frame.locator('.map-controls button').evaluateAll((buttons) => (
    buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    })
  ));
  assert.ok(
    controls.every(({ width, height }) => width >= 30 && height >= 30),
    `${mode} ${viewport.width} control sizes ${JSON.stringify(controls)}`,
  );
  assertReachability(metrics, mode, viewport);
  return metrics;
}

async function assertKeyboardAndFilters(page, frame) {
  const unitFilter = frame.locator('#unitFilter');
  await frame.locator('body').click({ position: { x: 2, y: 2 } });
  await frame.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press('Tab');
  assert.equal(await frame.evaluate(() => document.activeElement?.id), 'unitFilter');
  const focusStyle = await unitFilter.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth) };
  });
  assert.notEqual(focusStyle.outlineStyle, 'none');
  assert.ok(focusStyle.outlineWidth >= 2);

  await unitFilter.selectOption('1');
  await waitForPostTransformRender(frame);
  assert.equal(await unitFilter.inputValue(), '1');
  assert.equal(await frame.evaluate(() => document.activeElement?.id), 'unitFilter');
  assert.match(await frame.locator('.result-count').textContent(), /\b11\b/);
  const cultureFilters = frame.locator('#cultureFilters');
  assert.equal(await cultureFilters.isHidden(), true);
  assert.equal(await cultureFilters.locator('[data-culture]').count(), 0);
  const u1RegionLabels = await frame
    .locator('.site-marker[data-group-kind="region"]')
    .evaluateAll((markers) => markers.map((marker) => marker.getAttribute('aria-label')).sort());
  assert.deepEqual(u1RegionLabels, [
    'Africa · 2 pieces',
    'Americas · 2 pieces',
    'East Asia · 1 piece',
    'Europe · 2 pieces',
    'Middle East · 2 pieces',
    'Oceania · 2 pieces',
  ]);

  await unitFilter.selectOption('2');
  await waitForPostTransformRender(frame);
  assert.equal(await unitFilter.inputValue(), '2');
  assert.equal(await frame.evaluate(() => document.activeElement?.id), 'unitFilter');
  assert.match(await frame.locator('.result-count').textContent(), /36/);
  const cultures = frame.locator('#cultureFilters [data-culture]');
  assert.equal(await cultures.count(), 6);
  const expected = new Map([
    ['all', 36],
    ['ancientNearEast', 6],
    ['egypt', 9],
    ['greece', 10],
    ['etruscan', 3],
    ['rome', 8],
  ]);
  for (const [culture, count] of expected) {
    const button = frame.locator(`[data-culture="${culture}"]`);
    if (culture === 'ancientNearEast') {
      await frame.locator('[data-culture="all"]').focus();
      await page.keyboard.press('Tab');
      assert.equal(
        await frame.evaluate(() => document.activeElement?.dataset?.culture),
        'ancientNearEast',
      );
      const semantics = await button.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          tagName: element.tagName,
          tabIndex: element.tabIndex,
          ariaPressed: element.getAttribute('aria-pressed'),
          outlineStyle: style.outlineStyle,
          outlineWidth: parseFloat(style.outlineWidth),
        };
      });
      assert.equal(semantics.tagName, 'BUTTON');
      assert.equal(semantics.tabIndex, 0);
      assert.equal(semantics.ariaPressed, 'false');
      assert.notEqual(semantics.outlineStyle, 'none');
      assert.ok(semantics.outlineWidth >= 2);
      await page.keyboard.press('Space');
    } else {
      await button.click();
    }
    assert.match(await frame.locator('.result-count').textContent(), new RegExp(`\\b${count}\\b`));
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    assert.equal(await frame.evaluate(() => document.activeElement?.dataset?.culture), culture);
  }
  await frame.locator('[data-culture="all"]').click();

  await unitFilter.focus();
  await unitFilter.selectOption('3');
  await waitForPostTransformRender(frame);
  assert.equal(await unitFilter.inputValue(), '3');
  assert.equal(await frame.evaluate(() => document.activeElement?.id), 'unitFilter');
  assert.match(await frame.locator('.result-count').textContent(), /\b51\b/);
  const traditions = frame.locator('#cultureFilters [data-culture]');
  assert.equal(await traditions.count(), 5);
  const expectedTraditions = new Map([
    ['all', 51],
    ['lateAntiqueByzantine', 5],
    ['medievalIslamic', 14],
    ['renaissanceMannerism', 16],
    ['baroqueColonial', 16],
  ]);
  for (const [tradition, count] of expectedTraditions) {
    const button = frame.locator(`[data-culture="${tradition}"]`);
    await button.click();
    assert.match(await frame.locator('.result-count').textContent(), new RegExp(`\\b${count}\\b`));
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
  }
  await frame.locator('[data-culture="all"]').click();
  const u3RegionLabels = await frame
    .locator('.site-marker[data-group-kind="region"]')
    .evaluateAll((markers) => markers.map((marker) => marker.getAttribute('aria-label')).sort());
  assert.deepEqual(u3RegionLabels, [
    'British Isles · 3 pieces',
    'Central Europe · 4 pieces',
    'Colonial Americas · 5 pieces',
    'Eastern Mediterranean · 4 pieces',
    'France · 5 pieces',
    'Iberian Peninsula · 5 pieces',
    'Italy & Vatican · 18 pieces',
    'Low Countries · 7 pieces',
  ]);
  return unitFilter;
}

async function assertInitialHierarchy(frame) {
  const initial = await frame
    .locator('.site-marker[data-group-kind="unit"]')
    .evaluateAll((markers) => markers.map((marker) => marker.getAttribute('aria-label')));
  assert.deepEqual(initial, [
    'U1 · Global Prehistory · 11 pieces',
    'U2 · Ancient Mediterranean · 36 pieces',
    'U3 · Early Europe and Colonial Americas · 51 pieces',
  ]);
  assert.equal((await frame.locator('.result-count').textContent()).trim(), '当前显示 98 件作品');
}

async function assertHierarchyAndDialog(page, frame) {
  const region = frame.locator('.site-marker[data-group-kind="region"]').first();
  await region.focus();
  await page.keyboard.press('Enter');
  await frame.locator('.site-marker[data-group-kind="site"]').first().waitFor();
  const site = frame.locator('.site-marker[data-group-kind="site"]').first();
  await site.focus();
  await page.keyboard.press('Space');

  const workPin = frame.locator('.expanded-work-pin, .expanded-pin-list-button').first();
  if (await workPin.count()) {
    await workPin.focus();
    await page.keyboard.press('Space');
  }
  const heading = frame.locator('[data-selected-artwork-title]');
  await heading.waitFor();
  assert.ok((await heading.textContent()).trim().length > 3);

  const imageButton = frame.locator('.artwork-image-button');
  const image = imageButton.locator('img');
  await waitForVerifierImage(image, 'responsive hierarchy artwork image');
  const imageFacts = await image.evaluate((element) => ({
    alt: element.alt,
    complete: element.complete,
    naturalWidth: element.naturalWidth,
    objectFit: getComputedStyle(element).objectFit,
    height: element.getBoundingClientRect().height,
  }));
  assert.ok(imageFacts.alt.length > 5);
  assert.equal(imageFacts.complete, true);
  assert.ok(imageFacts.naturalWidth > 0);
  assert.equal(imageFacts.objectFit, 'contain');
  assert.ok(imageFacts.height > 40);

  await imageButton.focus();
  await page.keyboard.press('Enter');
  const dialog = frame.locator('#imageDialog');
  await dialog.waitFor({ state: 'visible' });
  assert.equal(await frame.evaluate(() => document.activeElement?.id), 'dialogClose');
  await page.keyboard.press('Enter');
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(await frame.evaluate(() => document.activeElement?.className), 'artwork-image-button');
}

function rectanglesOverlap(first, second) {
  return (
    first.left < second.right - 1
    && first.right > second.left + 1
    && first.top < second.bottom - 1
    && first.bottom > second.top + 1
  );
}

function assertRectangleInside(rect, bounds, label) {
  assert.ok(
    rect.left >= bounds.left - 1
      && rect.right <= bounds.right + 1
      && rect.top >= bounds.top - 1
      && rect.bottom <= bounds.bottom + 1,
    `${label} clipped: ${JSON.stringify({ rect, bounds })}`,
  );
}

export function assertMarkerGeometrySet(geometry, label) {
  assert.ok(geometry.markers.length > 0, `${label} must contain markers`);
  for (const marker of geometry.markers) {
    assert.ok(
      marker.hitSize.width >= 43.99 && marker.hitSize.height >= 43.99,
      `${label} ${marker.label} 44px hit target: ${JSON.stringify(marker.hitSize)}`,
    );
    for (const kind of ['group', 'hit', 'capsule', 'text']) {
      assertRectangleInside(
        marker.client[kind],
        geometry.map,
        `${label} ${marker.label} ${kind} client`,
      );
      assertRectangleInside(
        marker.world[kind],
        geometry.visibleWorldBounds,
        `${label} ${marker.label} ${kind} world`,
      );
    }
  }
  for (let first = 0; first < geometry.markers.length; first += 1) {
    for (let second = first + 1; second < geometry.markers.length; second += 1) {
      const firstMarker = geometry.markers[first];
      const secondMarker = geometry.markers[second];
      for (const kind of ['group', 'hit', 'capsule', 'text']) {
        assert.equal(
          rectanglesOverlap(firstMarker.client[kind], secondMarker.client[kind]),
          false,
          `${label} ${kind} overlap: ${firstMarker.label} / ${secondMarker.label}`,
        );
      }
    }
  }
}

async function captureMarkerGeometry(frame, markerKind) {
  return frame
    .locator(`.site-marker[data-group-kind="${markerKind}"]`)
    .evaluateAll((markers) => {
    const rect = (element) => {
      const bounds = element.getBoundingClientRect();
      return {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
        width: bounds.width,
        height: bounds.height,
      };
    };
    const union = (elements) => {
      const rectangles = elements.map(rect);
      return {
        left: Math.min(...rectangles.map((bounds) => bounds.left)),
        right: Math.max(...rectangles.map((bounds) => bounds.right)),
        top: Math.min(...rectangles.map((bounds) => bounds.top)),
        bottom: Math.max(...rectangles.map((bounds) => bounds.bottom)),
      };
    };
    const project = (bounds, inverse) => {
      const corners = [
        new DOMPoint(bounds.left, bounds.top),
        new DOMPoint(bounds.right, bounds.top),
        new DOMPoint(bounds.left, bounds.bottom),
        new DOMPoint(bounds.right, bounds.bottom),
      ].map((point) => point.matrixTransform(inverse));
      return {
        left: Math.min(...corners.map(({ x }) => x)),
        right: Math.max(...corners.map(({ x }) => x)),
        top: Math.min(...corners.map(({ y }) => y)),
        bottom: Math.max(...corners.map(({ y }) => y)),
      };
    };
    const map = document.querySelector('.map-svg');
    const mapViewport = document.querySelector('#mapViewport');
    const screenMatrix = mapViewport.getScreenCTM();
    if (!screenMatrix) throw new Error('Unable to project marker geometry');
    const inverse = screenMatrix.inverse();
    const mapBounds = rect(map);
    const projectedViewport = project(mapBounds, inverse);
    const transform = { ...window.ArtHistoryMap.state.transform };
    const visibleWorldBounds = {
      left: Math.max(0, projectedViewport.left),
      right: Math.min(1600, projectedViewport.right),
      top: Math.max(0, projectedViewport.top),
      bottom: Math.min(800, projectedViewport.bottom),
    };
    return {
      map: mapBounds,
      horizontalOverflow:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      activeRegion: window.ArtHistoryMap.state.activeRegion,
      activeUnit: window.ArtHistoryMap.state.activeUnit,
      stateTransform: transform,
      mapViewportTransform: mapViewport.getAttribute('transform'),
      visibleWorldBounds,
      focusedSiteLabel: document.activeElement?.matches?.(
        '.site-marker[data-group-kind="site"]',
      )
        ? document.activeElement.getAttribute('aria-label')
        : null,
      markers: markers.map((marker) => {
        const hit = marker.querySelector('.marker-hit-area');
        const capsule = marker.querySelector('.marker-label-bg');
        const texts = [
          ...marker.querySelectorAll(
            '.marker-ap-label, .marker-title-label, .marker-subtitle-label',
          ),
        ];
        const localTransform = marker.transform.baseVal.consolidate()?.matrix;
        const hitX = Number(hit.getAttribute('x'));
        const hitY = Number(hit.getAttribute('y'));
        const hitWidth = Number(hit.getAttribute('width'));
        const hitHeight = Number(hit.getAttribute('height'));
        const client = {
          group: rect(marker),
          hit: rect(hit),
          capsule: rect(capsule),
          text: union(texts),
        };
        return {
          label: marker.getAttribute('aria-label'),
          client,
          world: Object.fromEntries(
            Object.entries(client).map(([kind, bounds]) => [kind, project(bounds, inverse)]),
          ),
          hitSize: { width: client.hit.width, height: client.hit.height },
          worldHit: {
            left: localTransform.e + hitX,
            right: localTransform.e + hitX + hitWidth,
            top: localTransform.f + hitY,
            bottom: localTransform.f + hitY + hitHeight,
          },
        };
      }),
    };
  });
}

async function resetToU3Regions(frame) {
  const unitFilter = frame.locator('#unitFilter');
  await unitFilter.selectOption('all');
  await waitForPostTransformRender(frame);
  await unitFilter.selectOption('3');
  await waitForPostTransformRender(frame);
  await frame.locator('.site-marker[data-group-kind="region"]').first().waitFor();
}

async function verifyU3ResponsiveRegionBranches(page, frame, issues, mode, viewport) {
  const visited = [];
  for (const region of U3_REGION_BRANCHES) {
    const regionMarker = frame.getByRole('button', { name: region.label, exact: true });
    assert.equal(
      await regionMarker.count(),
      1,
      `${mode} ${viewport.width} ${region.label} region marker`,
    );
    const activation = await regionMarker.evaluate((marker) => {
      const localTransform = marker.transform.baseVal.consolidate()?.matrix;
      return {
        point: { x: localTransform.e, y: localTransform.f },
        transform: { ...window.ArtHistoryMap.state.transform },
      };
    });
    assertU3TransformMatches(
      activation.transform,
      U3_EXPECTED_UNIT_TRANSFORM,
      `${mode} ${viewport.width} ${region.label} canonical Unit fit`,
    );
    const expectedActivatedTransform = calculateExpectedU3ZoomTransform(
      activation.transform,
      Math.max(2.5, activation.transform.scale),
      activation.point,
    );
    await regionMarker.focus();
    assert.equal(
      await frame.evaluate(() => document.activeElement?.getAttribute('aria-label')),
      region.label,
      `${mode} ${viewport.width} ${region.label} region focus`,
    );
    await page.keyboard.press('Enter');
    await waitForPostTransformRender(frame);

    const siteMarkers = frame.locator('.site-marker[data-group-kind="site"]');
    await siteMarkers.first().waitFor();
    assert.ok(
      await siteMarkers.count() > 0,
      `${mode} ${viewport.width} ${region.label} nonempty site branch`,
    );
    const geometry = await captureMarkerGeometry(frame, 'site');
    assert.equal(
      geometry.activeRegion,
      `unit-3-region-${region.id}`,
      `${mode} ${viewport.width} ${region.label} parent branch`,
    );
    assert.equal(geometry.activeUnit, 3, `${mode} ${viewport.width} ${region.label} active Unit`);
    assert.ok(
      region.siteNames.some((siteName) => geometry.focusedSiteLabel?.startsWith(`${siteName} · `)),
      `${mode} ${viewport.width} ${region.label} focused child ${geometry.focusedSiteLabel}`,
    );
    assertU3SiteTraversalCoverage(
      geometry.markers.map(({ label }) => label),
      region.siteLabels,
      `${mode} ${viewport.width} ${region.label}`,
    );
    assertU3TransformMatches(
      geometry.stateTransform,
      expectedActivatedTransform,
      `${mode} ${viewport.width} ${region.label} canonical marker-point zoom`,
    );
    assert.equal(
      geometry.mapViewportTransform,
      `translate(${geometry.stateTransform.x} ${geometry.stateTransform.y}) `
        + `scale(${geometry.stateTransform.scale})`,
      `${mode} ${viewport.width} ${region.label} final transform`,
    );
    assert.ok(
      geometry.markers.every((marker) => (
        region.siteNames.some((siteName) => marker.label.startsWith(`${siteName} · `))
      )),
      `${mode} ${viewport.width} ${region.label} site parent membership`,
    );
    assertMarkerGeometrySet(
      geometry,
      `${mode} ${viewport.width} ${region.label} site geometry`,
    );
    assert.ok(
      geometry.horizontalOverflow <= 1,
      `${mode} ${viewport.width} ${region.label} horizontalOverflow `
        + geometry.horizontalOverflow,
    );
    assertNoCollectedIssues(
      issues,
      `${mode} ${viewport.width} ${region.label} responsive branch`,
    );
    visited.push(region.label);
    await resetToU3Regions(frame);
  }
  assertU3RegionTraversalCoverage(
    visited,
    `${mode} ${viewport.width} U3 responsive branch coverage`,
  );
  return Object.freeze(visited);
}

async function assertU3ResponsiveLayout(page, frame, issues, mode, viewport) {
  const unitFilter = frame.locator('#unitFilter');
  await unitFilter.selectOption('3');
  await waitForPostTransformRender(frame);
  assert.equal(await unitFilter.inputValue(), '3');
  assert.equal((await frame.locator('.result-count').textContent()).trim(), '当前显示 51 件作品');

  const culturePills = frame.locator('#cultureFilters [data-culture]');
  assert.equal(await culturePills.count(), 5, `${mode} ${viewport.width} U3 culture pill count`);
  const frameWidth = await frame.evaluate(() => innerWidth);
  const minimumPillHeight = frameWidth <= 520 ? 44 : 34;
  const pillRects = await culturePills.evaluateAll((buttons) => buttons.map((button) => {
    const rect = button.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
    };
  }));
  assert.ok(
    pillRects.every(({ left, right, width, height }) => (
      left >= -1
      && right <= frameWidth + 1
      && width >= minimumPillHeight
      && height >= minimumPillHeight
    )),
    `${mode} ${viewport.width} U3 culture pills must be visible ${minimumPillHeight}px targets: `
      + JSON.stringify(pillRects),
  );

  await frame.locator('.map-controls').scrollIntoViewIfNeeded();
  const mapControls = await frame.locator('.map-controls button').evaluateAll((buttons) => (
    buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      const hit = document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
      return {
        id: button.id,
        label: button.textContent.trim(),
        centerHitsControl: hit === button || button.contains(hit),
        centerHit: hit
          ? `${hit.tagName.toLowerCase()}${hit.id ? `#${hit.id}` : ''}`
            + `${[...hit.classList].map((name) => `.${name}`).join('')}`
          : null,
      };
    })
  ));
  assert.ok(
    mapControls.every(({ centerHitsControl }) => centerHitsControl),
    `${mode} ${viewport.width} map control pointer centers ${JSON.stringify(mapControls)}`,
  );

  const markerGeometry = await captureMarkerGeometry(frame, 'region');
  assert.equal(
    markerGeometry.mapViewportTransform,
    `translate(${markerGeometry.stateTransform.x} ${markerGeometry.stateTransform.y}) `
      + `scale(${markerGeometry.stateTransform.scale})`,
    `${mode} ${viewport.width} applied map transform`,
  );
  assert.equal(markerGeometry.markers.length, 8, `${mode} ${viewport.width} U3 region count`);
  assertMarkerGeometrySet(
    markerGeometry,
    `${mode} ${viewport.width} U3 region overview geometry`,
  );

  const regionBranches = await verifyU3ResponsiveRegionBranches(
    page,
    frame,
    issues,
    mode,
    viewport,
  );
  const responsiveWork = U3_WORKS.find(({ id }) => id === 'ap60-chartres-cathedral');
  await resetAndActivateWork(page, frame, responsiveWork);
  const importantDetails = frame.locator(
    '[data-selected-artwork-title], .image-view-switcher button',
  );
  for (let index = 0; index < await importantDetails.count(); index += 1) {
    const detail = importantDetails.nth(index);
    await detail.scrollIntoViewIfNeeded();
    const visible = await detail.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const panel = document.querySelector('.detail-panel').getBoundingClientRect();
      return (
        rect.width > 0
        && rect.height > 0
        && rect.left >= panel.left - 1
        && rect.right <= panel.right + 1
        && rect.top >= -1
        && rect.bottom <= innerHeight + 1
      );
    });
    assert.equal(visible, true, `${mode} ${viewport.width} clipped U3 detail control ${index}`);
  }
  return {
    count: regionBranches.length,
    labels: regionBranches,
  };
}

async function selectBoundaryFilters(frame) {
  await frame.locator('#unitFilter').selectOption('2');
  await waitForPostTransformRender(frame);
  const culture = frame.locator('[data-culture="ancientNearEast"]');
  await culture.click();
  assert.equal(await culture.getAttribute('aria-pressed'), 'true');
  assert.match(await frame.locator('.result-count').textContent(), /\b6\b/);
}

async function verifyStandalone(
  browser,
  baseUrl,
  viewport,
  full,
  { injectConsoleIssue = null } = {},
) {
  return withBrowserContext(browser, {
    viewport,
    reducedMotion: 'reduce',
  }, async (context) => {
    const page = await context.newPage();
    const errors = installErrorCollection(page, `standalone ${viewport.width}x${viewport.height}`);
    await mockRemoteImages(page);
    await page.goto(`${baseUrl}/art-history-map.html`, { waitUntil: 'load' });
    await waitForArt(page);
    assert.equal(
      (await page.locator('.page-header h1').textContent()).trim(),
      'AP 艺术史互动地图 · Units 1-3',
    );
    await assertInitialHierarchy(page);
    let metrics = await assertCommonLayout(page, 'standalone', viewport);
    let u3RegionBranches = null;
    if (full) {
      await assertKeyboardAndFilters(page, page);
      await assertHierarchyAndDialog(page, page);
      u3RegionBranches = await assertU3ResponsiveLayout(
        page,
        page,
        errors,
        'standalone',
        viewport,
      );
      assert.match(
        await page.evaluate(() => getComputedStyle(document.querySelector('.marker-visual')).transitionDuration),
        /^(?:0\.01ms|1e-05s)$/,
      );
    } else {
      await selectBoundaryFilters(page);
      metrics = await assertCommonLayout(page, 'standalone', viewport);
    }
    if (injectConsoleIssue === 'warning') {
      await page.evaluate(() => console.warn('responsive warning regression'));
    } else if (injectConsoleIssue === 'error') {
      await page.evaluate(() => console.error('responsive error regression'));
    }
    assertNoCollectedIssues(errors, `standalone ${viewport.width}x${viewport.height}`);
    return { ...metrics, u3RegionBranches };
  });
}

async function selectArtAndFrame(page, useKeyboard = false) {
  const artPill = page.locator('.subj-pill[data-subj="art"]');
  if (useKeyboard) {
    await artPill.focus();
    const semantics = await artPill.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        role: element.getAttribute('role'),
        tabIndex: element.tabIndex,
        ariaPressed: element.getAttribute('aria-pressed'),
        outlineStyle: style.outlineStyle,
        outlineWidth: parseFloat(style.outlineWidth),
      };
    });
    assert.equal(semantics.role, 'button');
    assert.equal(semantics.tabIndex, 0);
    assert.equal(semantics.ariaPressed, 'false');
    assert.notEqual(semantics.outlineStyle, 'none');
    assert.ok(semantics.outlineWidth >= 2);
    await page.keyboard.press('Enter');
    assert.equal(await artPill.getAttribute('aria-pressed'), 'true');
    assert.equal(
      await page.evaluate(() => document.activeElement?.dataset?.subj),
      'art',
    );
  } else {
    await artPill.click();
  }
  const caption = page.locator('#homeMapCaption');
  await caption.waitFor({ state: 'visible' });
  assert.equal(
    (await caption.textContent()).trim(),
    '98 AP works · Units 1-3 · filter, compare and study',
  );
  const iframe = page.locator('#artMapFrame');
  await iframe.waitFor({ state: 'visible' });
  await page.waitForFunction(() => (
    document.querySelector('#artMapFrame')?.contentDocument?.querySelector('#markerLayer .site-marker')
  ));
  const frame = page.frames().find((candidate) => candidate.url().includes('art-history-map.html'));
  assert.ok(frame, 'Art iframe was not attached');
  await waitForArt(frame);
  return { frame, iframe };
}

async function verifyEmbedded(browser, baseUrl, viewport, full) {
  return withBrowserContext(browser, {
    viewport,
    reducedMotion: 'reduce',
  }, async (context) => {
    const page = await context.newPage();
    const errors = installErrorCollection(page, `embedded ${viewport.width}x${viewport.height}`);
    await mockRemoteImages(page);
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'load' });
    await page.locator('#home-map-embed').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => (
      document.querySelector('#worldMapFrame')?.contentDocument?.querySelector('.map-zone')
    ));
    const worldFrame = page.frames().find((candidate) => candidate.url().includes('world-map.html'));
    assert.ok(worldFrame, 'World iframe was not attached');
    await worldFrame.locator('.map-zone').waitFor();
    assert.ok(await worldFrame.locator('.pin-group').count() > 0);
    const { frame, iframe } = await selectArtAndFrame(page, full);
    await assertInitialHierarchy(frame);
    let metrics = await assertCommonLayout(frame, 'embedded', viewport);
    const host = await page.evaluate(() => {
      const wrap = document.querySelector('.map-card[data-subject="art"] .home-map-wrap');
      const rect = wrap.getBoundingClientRect();
      return {
        wrapHeight: rect.height,
        pageScroll: document.documentElement.scrollHeight - document.documentElement.clientHeight,
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    assert.ok(host.horizontalOverflow <= 1);
    const shortStacked = viewport.width <= 666 && viewport.height <= 520;
    const shortTwoColumn = viewport.width >= 667
      && viewport.width <= 900
      && viewport.height <= 520;
    if (shortStacked) {
      assert.ok(Math.abs(host.wrapHeight - 960) <= 1, `stacked short host height ${host.wrapHeight}`);
      assert.ok(host.pageScroll > 0, 'homepage should own stacked short scrolling');
      assert.ok(metrics.pageScroll <= 1, 'stacked short child should not page-scroll');
      assert.equal(metrics.bodyOverflowY, 'hidden');
    } else if (shortTwoColumn) {
      assert.ok(Math.abs(host.wrapHeight - 520) <= 1, `two-column short host height ${host.wrapHeight}`);
      assert.ok(host.pageScroll > 0, 'homepage should own two-column short scrolling');
      assert.ok(metrics.pageScroll <= 1, 'two-column short child should not page-scroll');
      assert.equal(metrics.bodyOverflowY, 'hidden');
    } else if (viewport.width <= 900) {
      const approved = Math.min(720, viewport.height * 0.78);
      assert.ok(Math.abs(host.wrapHeight - approved) <= 1, `approved host height ${host.wrapHeight}`);
      if (metrics.stacked) {
        assert.ok(metrics.pageScroll > 0, 'stacked portrait content should remain reachable by child scroll');
        assert.equal(metrics.bodyOverflowY, 'auto');
      }
    }
    assert.equal(await iframe.getAttribute('aria-hidden'), 'false');
    let u3RegionBranches = null;
    if (full) {
      await assertKeyboardAndFilters(page, frame);
      await assertHierarchyAndDialog(page, frame);
      u3RegionBranches = await assertU3ResponsiveLayout(
        page,
        frame,
        errors,
        'embedded',
        viewport,
      );
    } else {
      await selectBoundaryFilters(frame);
      metrics = await assertCommonLayout(frame, 'embedded', viewport);
    }
    assertNoCollectedIssues(errors, `embedded ${viewport.width}x${viewport.height}`);
    return { ...metrics, host, u3RegionBranches };
  });
}

async function fillSearchThroughUi(searchInput, value, label) {
  let actualValue = await searchInput.inputValue();
  for (let attempt = 0; actualValue !== value && attempt < 5; attempt += 1) {
    await searchInput.fill(value);
    actualValue = await searchInput.inputValue();
  }
  assert.equal(actualValue, value, label);
}

async function resetAndActivateWork(page, frame, work, beforeActivate = () => {}) {
  const unitFilter = frame.locator('#unitFilter');
  const searchInput = frame.locator('#searchInput');
  const resultCount = frame.locator('.result-count');
  const unit = work.unit || (work.apNumber <= 11 ? 1 : work.apNumber <= 47 ? 2 : 3);
  const unitCount = new Map([[1, 11], [2, 36], [3, 51]]).get(unit);
  await fillSearchThroughUi(searchInput, '', `AP ${work.apNumber} reset search`);
  await unitFilter.selectOption('all');
  await waitForPostTransformRender(frame);
  assert.equal(await unitFilter.inputValue(), 'all', `AP ${work.apNumber} reset Unit`);
  assert.equal(await searchInput.inputValue(), '', `AP ${work.apNumber} Unit reset retains search`);
  assert.equal(
    (await resultCount.textContent()).trim(),
    '当前显示 98 件作品',
    `AP ${work.apNumber} search reset result`,
  );
  await frame.locator('#resetView').click();
  assert.equal(
    (await resultCount.textContent()).trim(),
    '当前显示 98 件作品',
    `AP ${work.apNumber} hierarchy reset result`,
  );

  await unitFilter.selectOption(String(unit));
  await waitForPostTransformRender(frame);
  assert.equal(await unitFilter.inputValue(), String(unit), `AP ${work.apNumber} Unit selection`);
  assert.equal(
    (await resultCount.textContent()).trim(),
    `当前显示 ${unitCount} 件作品`,
    `AP ${work.apNumber} Unit result`,
  );
  await fillSearchThroughUi(searchInput, work.titleEn, `AP ${work.apNumber} exact search`);
  assert.equal((await resultCount.textContent()).trim(), '当前显示 1 件作品');

  const region = frame.locator('.site-marker[data-group-kind="region"]');
  await region.waitFor();
  assert.equal(await region.count(), 1, `AP ${work.apNumber} should expose one region`);
  await region.focus();
  await page.keyboard.press('Enter');

  const site = frame.locator('.site-marker[data-group-kind="site"]');
  await site.waitFor();
  assert.equal(await site.count(), 1, `AP ${work.apNumber} should expose one site`);
  await beforeActivate();
  await site.focus();
  await page.keyboard.press('Space');

  const heading = frame.locator('[data-selected-artwork-title]');
  await heading.waitFor();
  assert.equal((await heading.textContent()).trim(), work.titleEn);
}

function assertSingleImageRequest(imageRequests, work, checkpoint) {
  assert.equal(imageRequests.length, 1,
    `${checkpoint} AP ${work.apNumber} should issue exactly one image request`,
  );
  assert.equal(imageRequests[0], work.imageUrl,
    `${checkpoint} AP ${work.apNumber} requested image URL`,
  );
}

async function verifyNineImportedWorks(page, frame, imageRequests, mode) {
  const verified = [];
  for (const work of NINE_IMPORTED_WORKS) {
    imageRequests.length = 0;
    await resetAndActivateWork(page, frame, work);

    const summary = frame.locator('.selected-summary');
    assert.equal((await summary.locator('.work-title-en').textContent()).trim(), work.titleEn);
    assert.equal((await summary.locator('.work-title-zh').textContent()).trim(), work.titleZh);
    const meta = (await summary.locator('.work-meta').textContent()).trim();
    assert.equal(meta.split(' · ')[0], `AP #${work.apNumber}`);

    const imageButtons = summary.locator('.artwork-image-button');
    assert.equal(await imageButtons.count(), 1, `${mode} AP ${work.apNumber} detail image button`);
    assert.equal(await summary.locator('img').count(), 1, `${mode} AP ${work.apNumber} detail image`);
    assert.equal(await summary.locator('[class*="gallery"]').count(), 0);
    const imageButton = imageButtons.first();
    const image = imageButton.locator('img');
    await waitForVerifierImage(
      image,
      `${mode} AP ${work.apNumber} primary ${work.imageUrl}`,
    );
    assert.equal(await image.getAttribute('alt'), work.imageAlt);

    const imageCredit = summary.locator('.image-credit');
    assert.equal(await imageCredit.isVisible(), true);
    assert.equal(
      (await imageCredit.textContent()).trim(),
      `图片：${work.credit.creatorOrInstitution} · ${work.credit.licenseName} · ${work.imageSourceName}`,
    );
    const inlineLicense = imageCredit.locator('a').nth(0);
    assert.equal(await inlineLicense.getAttribute('href'), work.credit.licenseUrl);
    assert.equal((await inlineLicense.textContent()).trim(), work.credit.licenseName);
    const inlineSource = imageCredit.locator('a').nth(1);
    assert.equal(await inlineSource.getAttribute('href'), work.imageSourceUrl);
    assert.equal((await inlineSource.textContent()).trim(), work.imageSourceName);

    assertSingleImageRequest(imageRequests, work, `${mode} detail`);

    const originalImageButton = await imageButton.elementHandle();
    assert.ok(originalImageButton, `${mode} AP ${work.apNumber} original image button handle`);
    await imageButton.focus();
    await page.keyboard.press('Enter');
    const dialog = frame.locator('#imageDialog');
    await dialog.waitFor({ state: 'visible' });
    assert.equal(await frame.evaluate(() => document.activeElement?.id), 'dialogClose');
    assert.equal((await frame.locator('#dialogTitle').textContent()).trim(), `${work.titleEn} · ${work.titleZh}`);
    assert.equal(await dialog.locator('img').count(), 1);
    const dialogImage = frame.locator('#dialogImage');
    await waitForVerifierImage(
      dialogImage,
      `${mode} AP ${work.apNumber} primary dialog ${work.imageUrl}`,
    );
    assert.equal(await dialogImage.getAttribute('alt'), work.imageAlt);
    assert.equal((await frame.locator('#dialogCredit').textContent()).trim(), `图片：${work.credit.creatorOrInstitution}`);

    const dialogLicense = frame.locator('#dialogLicense');
    assert.equal(await dialogLicense.isVisible(), true);
    assert.equal(await dialogLicense.getAttribute('href'), work.credit.licenseUrl);
    assert.equal((await dialogLicense.textContent()).trim(), work.credit.licenseName);
    const dialogSource = frame.locator('#dialogSource');
    assert.equal(await dialogSource.isVisible(), true);
    assert.equal(await dialogSource.getAttribute('href'), work.imageSourceUrl);
    assert.equal((await dialogSource.textContent()).trim(), work.imageSourceName);

    assertSingleImageRequest(imageRequests, work, `${mode} open dialog`);

    const originalViewport = page.viewportSize();
    assert.ok(originalViewport, `${mode} AP ${work.apNumber} viewport`);
    await page.setViewportSize({
      width: originalViewport.width - 1,
      height: originalViewport.height,
    });
    await frame.waitForFunction(
      (element) => !element.isConnected,
      originalImageButton,
    );
    assert.equal(await originalImageButton.evaluate((element) => element.isConnected), false);
    await frame.waitForFunction(
      (element) => (
        document.querySelector('.artwork-image-button')?.isConnected
        && document.querySelector('.artwork-image-button') !== element
      ),
      originalImageButton,
    );

    await page.keyboard.press('Enter');
    await dialog.waitFor({ state: 'hidden' });
    await frame.waitForFunction(() => (
      document.activeElement === document.querySelector('.artwork-image-button')
    ));
    assert.equal(
      await frame.evaluate(() => (
        document.activeElement === document.querySelector('.artwork-image-button')
      )),
      true,
      `${mode} AP ${work.apNumber} should restore focus to the current detail image button`,
    );
    await page.setViewportSize(originalViewport);
    await frame.waitForFunction(() => (
      document.activeElement === document.querySelector('.artwork-image-button')
    ));
    assertSingleImageRequest(imageRequests, work, `${mode} closed dialog`);
    verified.push({
      apNumber: work.apNumber,
      imageUrl: work.imageUrl,
      imageRequestCount: imageRequests.length,
    });
  }
  return verified;
}

async function verifyU1Works(page, frame, imageRequests, mode) {
  const results = [];
  for (const work of U1_WORKS) {
    imageRequests.clear();
    await resetAndActivateWork(page, frame, work);

    const summary = frame.locator('.selected-summary');
    assert.equal(
      (await summary.locator('[data-selected-artwork-title]').textContent()).trim(),
      work.titleEn,
    );
    assert.equal((await summary.locator('.work-title-zh').textContent()).trim(), work.titleZh);
    const meta = (await summary.locator('.work-meta').textContent()).trim();
    assert.equal(meta.split(' · ')[0], `AP #${work.apNumber}`);
    const viewButtons = summary.locator('.image-view-switcher button');
    assert.equal(
      await viewButtons.count(),
      work.images.length === 2 ? 2 : 0,
      `${mode} AP ${work.apNumber} view button count`,
    );
    if (work.images.length === 2) {
      assert.deepEqual(
        await viewButtons.allTextContents(),
        work.images.map(({ label }) => label),
        `${mode} AP ${work.apNumber} view button labels`,
      );
    }

    for (let imageIndex = 0; imageIndex < work.images.length; imageIndex += 1) {
      if (work.images.length === 2) {
        await viewButtons.nth(imageIndex).click();
        assert.deepEqual(
          await viewButtons.evaluateAll((buttons) => (
            buttons.map((button) => button.getAttribute('aria-pressed'))
          )),
          work.images.map((image, index) => String(index === imageIndex)),
          `${mode} AP ${work.apNumber} view ${imageIndex + 1} pressed state`,
        );
      }
      const expected = work.images[imageIndex];
      const imageButton = summary.locator('.artwork-image-button');
      const image = imageButton.locator('img');
      await waitForVerifierImage(
        image,
        `${mode} AP ${work.apNumber} view ${imageIndex + 1} ${expected.imageUrl}`,
      );
      assert.equal(await image.getAttribute('src'), expected.imageUrl);
      assert.equal(await image.getAttribute('alt'), expected.imageAlt);

      const creditHost = summary.locator('.image-credit-host');
      const imageCredit = creditHost.locator('.image-credit');
      assert.equal(
        (await imageCredit.textContent()).trim(),
        `图片：${expected.creatorOrInstitution} · ${expected.licenseName} · ${expected.imageSourceName}`,
      );
      const inlineLinks = imageCredit.locator('a');
      assert.equal(await inlineLinks.count(), 2);
      assert.equal(
        await inlineLinks.nth(0).getAttribute('href'),
        expected.licenseUrl,
      );
      assert.equal((await inlineLinks.nth(0).textContent()).trim(), expected.licenseName);
      assert.equal(
        await inlineLinks.nth(1).getAttribute('href'),
        expected.imageSourceUrl,
      );
      assert.equal((await inlineLinks.nth(1).textContent()).trim(), expected.imageSourceName);

      await imageButton.click();
      const dialog = frame.locator('#imageDialog');
      await dialog.waitFor({ state: 'visible' });
      assert.equal(await frame.evaluate(() => document.activeElement?.id), 'dialogClose');
      const dialogImage = frame.locator('#dialogImage');
      await waitForVerifierImage(
        dialogImage,
        `${mode} AP ${work.apNumber} view ${imageIndex + 1} dialog ${expected.imageUrl}`,
      );
      assert.equal(await dialogImage.getAttribute('src'), expected.imageUrl);
      assert.equal(await dialogImage.getAttribute('alt'), expected.imageAlt);
      assert.equal(
        (await frame.locator('#dialogTitle').textContent()).trim(),
        `${work.titleEn} · ${work.titleZh}`,
      );
      assert.equal((await frame.locator('#dialogCaption').textContent()).trim(), expected.imageAlt);
      assert.equal(
        (await frame.locator('#dialogCredit').textContent()).trim(),
        `图片：${expected.creatorOrInstitution}`,
      );
      const dialogLicense = frame.locator('#dialogLicense');
      assert.equal(await dialogLicense.getAttribute('href'), expected.licenseUrl);
      assert.equal((await dialogLicense.textContent()).trim(), expected.licenseName);
      const dialogSource = frame.locator('#dialogSource');
      assert.equal(await dialogSource.getAttribute('href'), expected.imageSourceUrl);
      assert.equal((await dialogSource.textContent()).trim(), expected.imageSourceName);

      await frame.locator('#dialogClose').click();
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(
        await frame.evaluate(() => (
          document.activeElement?.classList.contains('artwork-image-button')
        )),
        true,
        `${mode} AP ${work.apNumber} view ${imageIndex + 1} focus restoration`,
      );
      assert.equal(
        imageRequests.get(expected.imageUrl),
        1,
        `${mode} AP ${work.apNumber} view ${imageIndex + 1} image request count`,
      );
    }

    assert.equal(
      imageRequests.size,
      work.images.length,
      `${mode} AP ${work.apNumber} should request only its expected image URLs`,
    );
    results.push({
      apNumber: work.apNumber,
      mode,
      images: work.images.map(({ imageUrl }) => ({
        imageUrl,
        imageRequestCount: imageRequests.get(imageUrl),
      })),
    });
  }
  return results;
}

async function verifyU1StudyTabsAndComparison(page, frame, mode) {
  const sourceWork = U1_WORKS.find(({ id }) => id === 'ap2-great-hall-bulls');
  assert.ok(sourceWork, `${mode} AP 2 study-tab source fixture`);
  await resetAndActivateWork(page, frame, sourceWork);

  const expectedTabs = [
    { id: 'quick', label: '速览', headings: ['核心功能', '识别锚点'] },
    { id: 'form', label: '形式', headings: ['形式', '内容'] },
    { id: 'context', label: '语境', headings: ['历史语境', '图像内容'] },
    { id: 'compare', label: '比较', headings: [] },
  ];
  const tabs = frame.locator('.detail-tab');
  assert.equal(await tabs.count(), expectedTabs.length, `${mode} AP 2 study tab count`);
  assert.deepEqual(
    await tabs.allTextContents(),
    expectedTabs.map(({ label }) => label),
    `${mode} AP 2 study tab labels`,
  );

  let comparisonIds = [];
  for (let tabIndex = 0; tabIndex < expectedTabs.length; tabIndex += 1) {
    const expected = expectedTabs[tabIndex];
    await tabs.nth(tabIndex).click();
    assert.deepEqual(
      await tabs.evaluateAll((buttons) => buttons.map((button) => ({
        selected: button.getAttribute('aria-selected'),
        tabIndex: button.getAttribute('tabindex'),
      }))),
      expectedTabs.map((tab, index) => ({
        selected: String(index === tabIndex),
        tabIndex: index === tabIndex ? '0' : '-1',
      })),
      `${mode} AP 2 ${expected.label} tab state`,
    );

    const panel = frame.locator('#detail-tabpanel');
    assert.equal(await panel.getAttribute('aria-labelledby'), `detail-tab-${expected.id}`);
    const panelText = (await panel.textContent()).trim();
    assert.ok(panelText.length > 8, `${mode} AP 2 ${expected.label} panel content`);
    assert.deepEqual(
      await panel.locator('h3').allTextContents(),
      expected.headings,
      `${mode} AP 2 ${expected.label} panel headings`,
    );

    if (expected.id === 'compare') {
      const cards = panel.locator('.comparison-card');
      comparisonIds = await cards.evaluateAll((elements) => (
        elements.map((element) => element.dataset.comparisonId)
      ));
      assert.deepEqual(comparisonIds, [
        'ap1-apollo-11-stones',
        'ap4-running-horned-woman',
        'ap24-last-judgment-of-hunefer',
      ]);
      assert.ok(
        (await cards.allTextContents()).every((text) => text.trim().length > 20),
        `${mode} AP 2 comparison card content`,
      );
    }
  }

  const crossUnitCard = frame.locator(
    '.comparison-card[data-comparison-id="ap24-last-judgment-of-hunefer"]',
  );
  assert.equal(await crossUnitCard.count(), 1, `${mode} AP 2 cross-Unit comparison card`);
  await crossUnitCard.click();
  const targetHeading = frame.locator('[data-selected-artwork-title]');
  await targetHeading.waitFor();
  assert.equal(
    (await targetHeading.textContent()).trim(),
    'Last judgment of Hunefer, from his tomb (page from the Book of the Dead)',
  );
  assert.equal((await frame.locator('.work-title-zh').textContent()).trim(), '胡内弗《末日审判》');
  assert.equal(
    (await frame.locator('.work-meta').textContent()).trim().split(' · ')[0],
    'AP #24',
  );
  assert.equal(await frame.locator('#unitFilter').inputValue(), '2');
  assert.equal((await frame.locator('.result-count').textContent()).trim(), '当前显示 36 件作品');
  assert.equal(await frame.locator('#searchInput').inputValue(), '');
  await frame.waitForFunction(() => (
    document.activeElement === document.querySelector('[data-selected-artwork-title]')
  ));
  assert.equal(
    await frame.evaluate(() => (
      document.activeElement === document.querySelector('[data-selected-artwork-title]')
    )),
    true,
    `${mode} AP 24 comparison target focus`,
  );

  await resetAndActivateWork(page, frame, sourceWork);
  assert.equal(await frame.locator('#unitFilter').inputValue(), '1');
  assert.equal(
    (await frame.locator('[data-selected-artwork-title]').textContent()).trim(),
    sourceWork.titleEn,
  );
  assert.equal((await frame.locator('.result-count').textContent()).trim(), '当前显示 1 件作品');
  await frame.locator('#detail-tab-form').click();
  assert.equal(await frame.locator('#detail-tab-form').getAttribute('aria-selected'), 'true');
  assert.deepEqual(
    await frame.locator('#detail-tabpanel h3').allTextContents(),
    ['形式', '内容'],
  );

  return {
    sourceApNumber: sourceWork.apNumber,
    tabs: expectedTabs.map(({ id, label }) => ({ id, label })),
    comparisonIds,
    crossUnitTarget: 24,
    resetToSource: true,
  };
}

async function verifyU3Works(
  page,
  frame,
  imageRequests,
  mode,
  {
    faultMode = null,
    maxWorks = Number.POSITIVE_INFINITY,
    requestObserver = null,
  } = {},
) {
  const results = [];
  for (const work of U3_WORKS) {
    const expectedWork = U3_EXPECTED_WORKS.find(({ id }) => id === work.id);
    assert.ok(expectedWork, `${mode} AP ${work.apNumber} canonical work`);
    await resetAndActivateWork(page, frame, work, () => imageRequests.clear());

    const summary = frame.locator('.selected-summary');
    assert.equal(
      (await summary.locator('[data-selected-artwork-title]').textContent()).trim(),
      work.titleEn,
      `${mode} AP ${work.apNumber} English title`,
    );
    assert.equal(
      (await summary.locator('.work-title-zh').textContent()).trim(),
      work.titleZh,
      `${mode} AP ${work.apNumber} Chinese subtitle`,
    );
    const meta = (await summary.locator('.work-meta').textContent()).trim();
    const metaParts = meta.split(' · ');
    assert.deepEqual(
      metaParts,
      [
        `AP #${work.apNumber}`,
        expectedWork.metadata.cultureLabelZh,
        expectedWork.metadata.period,
        expectedWork.metadata.date,
      ],
      `${mode} AP ${work.apNumber} exact metadata line`,
    );
    const identity = await summary.locator('.identity-row').evaluateAll((rows) => (
      Object.fromEntries(rows.map((row) => [
        row.querySelector('dt')?.textContent?.trim(),
        row.querySelector('dd')?.textContent?.trim(),
      ]))
    ));
    assertU3MetadataMatches({
      titleZh: (await summary.locator('.work-title-zh').textContent()).trim(),
      siteName: identity['地点'],
      cultureLabelZh: metaParts[1],
      period: metaParts[2],
      date: metaParts[3],
      artistCulture: identity['艺术家／文化'],
      medium: identity['材料'],
      workType: identity['类型'],
    }, expectedWork.metadata, `${mode} AP ${work.apNumber} rendered metadata`);
    assert.equal(
      await frame.locator('.site-marker[data-group-kind="site"][aria-pressed="true"]').count(),
      1,
      `${mode} AP ${work.apNumber} selected site marker`,
    );

    const viewButtons = summary.locator('.image-view-switcher button');
    const expectedViewButtonCount = work.images.length > 1 ? work.images.length : 0;
    assert.equal(
      await viewButtons.count(),
      expectedViewButtonCount,
      `${mode} AP ${work.apNumber} view button count`,
    );
    if (expectedViewButtonCount) {
      assert.deepEqual(
        await viewButtons.allTextContents(),
        work.images.map(({ label }) => label),
        `${mode} AP ${work.apNumber} view button labels`,
      );
    }

    for (let imageIndex = 0; imageIndex < work.images.length; imageIndex += 1) {
      const expected = work.images[imageIndex];
      const expectedCanonicalView = expectedWork.images[imageIndex];
      if (expectedViewButtonCount) {
        await viewButtons.nth(imageIndex).click();
        assert.deepEqual(
          await viewButtons.evaluateAll((buttons) => (
            buttons.map((button) => button.getAttribute('aria-pressed'))
          )),
          work.images.map((image, index) => String(index === imageIndex)),
          `${mode} AP ${work.apNumber} ${expected.id} pressed state`,
        );
      }

      const imageButton = summary.locator('.artwork-image-button');
      const image = imageButton.locator('img');
      await waitForVerifierImage(
        image,
        `${mode} AP ${work.apNumber} ${expected.id} ${expected.imageUrl}`,
      );
      const injectFault = faultMode
        && work.apNumber === 48
        && imageIndex === 0;
      if (injectFault && faultMode === 'wrong-rendered-url') {
        await image.evaluate((element) => {
          element.setAttribute(
            'src',
            'https://example.invalid/verifier-wrong-rendered-url.jpg',
          );
          element.setAttribute('alt', 'Verifier wrong rendered image');
        });
      }
      const sourceLink = summary.locator('.image-credit a').nth(1);
      const actual = {
        id: expected.id,
        label: expectedViewButtonCount
          ? (await viewButtons.nth(imageIndex).textContent()).trim()
          : expected.label,
        imageUrl: await image.getAttribute('src'),
        imageAlt: await image.getAttribute('alt'),
        imageSourceUrl: await sourceLink.getAttribute('href'),
      };
      assertU3ViewMatches(
        actual,
        expected,
        `${mode} AP ${work.apNumber} ${expected.id}`,
      );
      assert.equal(
        await summary.locator('.image-credit a').count(),
        2,
        `${mode} AP ${work.apNumber} ${expected.id} inline credit links`,
      );
      const inlineCredit = await summary.locator('.image-credit').evaluate((line) => {
        const [license, source] = line.querySelectorAll('a');
        return {
          creatorOrInstitution: (line.childNodes[0]?.textContent || '')
            .replace(/^图片：/, '')
            .replace(/ · $/, ''),
          licenseName: license?.textContent?.trim(),
          licenseUrl: license?.getAttribute('href'),
          imageSourceName: source?.textContent?.trim(),
          imageSourceUrl: source?.getAttribute('href'),
        };
      });
      assertU3CreditMatches(
        inlineCredit,
        expectedCanonicalView.credit,
        `${mode} AP ${work.apNumber} ${expected.id} inline credit`,
      );

      await imageButton.click();
      const dialog = frame.locator('#imageDialog');
      await dialog.waitFor({ state: 'visible' });
      assert.equal(await frame.evaluate(() => document.activeElement?.id), 'dialogClose');
      const dialogImage = frame.locator('#dialogImage');
      await waitForVerifierImage(
        dialogImage,
        `${mode} AP ${work.apNumber} ${expected.id} dialog ${expected.imageUrl}`,
      );
      assert.equal(await dialogImage.getAttribute('src'), expected.imageUrl);
      assert.equal(await dialogImage.getAttribute('alt'), expected.imageAlt);
      assert.equal(
        (await frame.locator('#dialogTitle').textContent()).trim(),
        `${work.titleEn} · ${work.titleZh}`,
      );
      assert.equal((await frame.locator('#dialogCaption').textContent()).trim(), expected.imageAlt);
      assert.match((await frame.locator('#dialogCredit').textContent()).trim(), /^图片：\S/);
      const dialogLicense = frame.locator('#dialogLicense');
      const dialogSource = frame.locator('#dialogSource');
      assertU3CreditMatches({
        creatorOrInstitution: (await frame.locator('#dialogCredit').textContent())
          .trim()
          .replace(/^图片：/, ''),
        licenseName: (await dialogLicense.textContent()).trim(),
        licenseUrl: await dialogLicense.getAttribute('href'),
        imageSourceName: (await dialogSource.textContent()).trim(),
        imageSourceUrl: await dialogSource.getAttribute('href'),
      }, expectedCanonicalView.credit, `${mode} AP ${work.apNumber} ${expected.id} modal credit`);

      await frame.locator('#dialogClose').click();
      await dialog.waitFor({ state: 'hidden' });
      if (injectFault && faultMode === 'broken-focus-restoration') {
        await frame.locator('#unitFilter').focus();
      }
      assertDialogFocusRestored(
        await frame.evaluate(() => (
          document.activeElement?.classList.contains('artwork-image-button')
        )),
        `${mode} AP ${work.apNumber} ${expected.id}`,
      );
      if (injectFault && faultMode === 'duplicate-network-request') {
        assert.ok(requestObserver, `${mode} AP ${work.apNumber} request observer`);
        const exactReload = requestObserver.beginExactReload(expected.imageUrl);
        const exactReloadResult = await frame.evaluate((url) => new Promise((resolve, reject) => {
          const reload = new Image();
          const timer = setTimeout(
            () => reject(new Error(`Exact image reload timed out for ${url}`)),
            15_000,
          );
          const settle = (result) => {
            clearTimeout(timer);
            reload.onload = null;
            reload.onerror = null;
            resolve(result);
          };
          reload.onload = () => settle('loaded');
          reload.onerror = () => settle('errored');
          reload.src = url;
        }), expected.imageUrl);
        assert.equal(
          exactReloadResult,
          'loaded',
          `${mode} AP ${work.apNumber} ${expected.id} exact reload completion`,
        );
        const duplicateObservation = requestObserver.completeExactReload(
          expected.imageUrl,
          exactReload,
        );
        assert.equal(
          duplicateObservation.attempted,
          true,
          `${mode} AP ${work.apNumber} ${expected.id} exact reload attempted`,
        );
        assert.equal(
          duplicateObservation.routeObserved,
          false,
          `${mode} AP ${work.apNumber} ${expected.id} exact reload cache coalescing`,
        );
        assert.equal(
          duplicateObservation.fallbackObservationAdded,
          true,
          `${mode} AP ${work.apNumber} ${expected.id} fallback observation`,
        );
      }
    }
    assertExactImageRequests(imageRequests, work, mode);
    results.push({
      apNumber: work.apNumber,
      mode,
      views: work.images.map(({ id, imageUrl }) => ({
        id,
        imageUrl,
        requestCount: imageRequests.get(imageUrl),
      })),
    });
    if (faultMode && results.length >= maxWorks) break;
  }
  return results;
}

async function verifyU3StudyTabsAndComparison(page, frame, mode) {
  const studyWork = U3_WORKS.find(({ id }) => id === 'ap52-hagia-sophia');
  const comparisonWork = U3_WORKS.find(({ id }) => id === 'ap89-ecstasy-saint-teresa');
  assert.ok(studyWork, `${mode} AP 52 study fixture`);
  assert.ok(comparisonWork, `${mode} AP 89 comparison fixture`);
  await resetAndActivateWork(page, frame, studyWork);

  const expectedTabs = [
    { id: 'quick', label: '速览', headings: ['核心功能', '识别锚点'] },
    { id: 'form', label: '形式', headings: ['形式', '内容'] },
    { id: 'context', label: '语境', headings: ['历史语境', '图像内容'] },
    { id: 'compare', label: '比较', headings: [] },
  ];
  const tabs = frame.locator('.detail-tab');
  assert.equal(await tabs.count(), expectedTabs.length, `${mode} AP 52 study tab count`);
  for (let tabIndex = 0; tabIndex < expectedTabs.length; tabIndex += 1) {
    const expected = expectedTabs[tabIndex];
    await tabs.nth(tabIndex).click();
    assert.deepEqual(
      await tabs.evaluateAll((buttons) => buttons.map((button) => ({
        selected: button.getAttribute('aria-selected'),
        tabIndex: button.getAttribute('tabindex'),
      }))),
      expectedTabs.map((tab, index) => ({
        selected: String(index === tabIndex),
        tabIndex: index === tabIndex ? '0' : '-1',
      })),
      `${mode} AP 52 ${expected.label} tab state`,
    );
    const panel = frame.locator('#detail-tabpanel');
    assert.equal(await panel.getAttribute('aria-labelledby'), `detail-tab-${expected.id}`);
    assert.ok((await panel.textContent()).trim().length > 8);
    assert.deepEqual(await panel.locator('h3').allTextContents(), expected.headings);
  }

  await resetAndActivateWork(page, frame, comparisonWork);
  await frame.locator('#detail-tab-compare').click();
  const targetCard = frame.locator('.comparison-card[data-comparison-id="ap46-pantheon"]');
  assert.equal(await targetCard.count(), 1, `${mode} AP 89 to AP 46 comparison card`);
  await targetCard.click();
  const targetHeading = frame.locator('[data-selected-artwork-title]');
  await targetHeading.waitFor();
  assert.equal((await targetHeading.textContent()).trim(), 'Pantheon');
  assert.equal((await frame.locator('.work-meta').textContent()).trim().split(' · ')[0], 'AP #46');
  assert.equal(await frame.locator('#unitFilter').inputValue(), '2');
  assert.equal((await frame.locator('.result-count').textContent()).trim(), '当前显示 36 件作品');
  assert.equal(await frame.locator('#searchInput').inputValue(), '');
  await frame.waitForFunction(() => (
    document.activeElement === document.querySelector('[data-selected-artwork-title]')
  ));
  assert.equal(
    await frame.evaluate(() => (
      document.activeElement === document.querySelector('[data-selected-artwork-title]')
    )),
    true,
    `${mode} AP 46 comparison target focus`,
  );

  return {
    sourceApNumber: studyWork.apNumber,
    tabs: expectedTabs.map(({ id, label }) => ({ id, label })),
    comparisonSource: comparisonWork.apNumber,
    crossUnitTarget: 46,
  };
}

async function verifyU3Standalone(browser, baseUrl, faultOptions = null) {
  const viewport = { width: 1365, height: 768 };
  return withBrowserContext(browser, { viewport, reducedMotion: 'reduce' }, async (context) => {
    const page = await context.newPage();
    const issues = installErrorCollection(page, 'U3 fifty-one works standalone');
    const imageRequests = new Map();
    const requestObserver = createImageRequestObserver(imageRequests);
    await mockRemoteImages(page, requestObserver.observe);
    await page.goto(`${baseUrl}/art-history-map.html`, { waitUntil: 'load' });
    await waitForArt(page);
    const works = faultOptions
      ? await verifyU3Works(page, page, imageRequests, 'standalone', {
          ...faultOptions,
          requestObserver,
        })
      : await verifyU3Works(page, page, imageRequests, 'standalone');
    if (faultOptions) {
      assertNoCollectedIssues(issues, `U3 ${faultOptions.faultMode} assembled fault path`);
      return { viewport, works, faultMode: faultOptions.faultMode };
    }
    const study = await verifyU3StudyTabsAndComparison(page, page, 'standalone');
    assertNoCollectedIssues(issues, 'U3 standalone');
    return { viewport, works, study };
  });
}

async function verifyU3Embedded(browser, baseUrl) {
  const viewport = { width: 1365, height: 768 };
  return withBrowserContext(browser, { viewport, reducedMotion: 'reduce' }, async (context) => {
    const page = await context.newPage();
    const issues = installErrorCollection(page, 'U3 fifty-one works embedded');
    const imageRequests = new Map();
    await mockRemoteImages(page, (url) => {
      imageRequests.set(url, (imageRequests.get(url) || 0) + 1);
    });
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'load' });
    await page.locator('#home-map-embed').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => (
      document.querySelector('#worldMapFrame')?.contentDocument?.querySelector('.map-zone')
    ));
    const { frame } = await selectArtAndFrame(page, true);
    const works = await verifyU3Works(page, frame, imageRequests, 'embedded');
    const study = await verifyU3StudyTabsAndComparison(page, frame, 'embedded');
    assertNoCollectedIssues(issues, 'U3 embedded');
    return { viewport, works, study };
  });
}

async function verifyU1Standalone(browser, baseUrl) {
  const viewport = { width: 1440, height: 900 };
  return withBrowserContext(browser, { viewport, reducedMotion: 'reduce' }, async (context) => {
    const page = await context.newPage();
    const issues = installErrorCollection(page, 'U1 eleven works standalone');
    const imageRequests = new Map();
    await mockRemoteImages(page, (url) => {
      imageRequests.set(url, (imageRequests.get(url) || 0) + 1);
    });
    await page.goto(`${baseUrl}/art-history-map.html`, { waitUntil: 'load' });
    await waitForArt(page);
    const works = await verifyU1Works(page, page, imageRequests, 'standalone');
    const study = await verifyU1StudyTabsAndComparison(page, page, 'standalone');
    assert.deepEqual(issues, []);
    return { viewport, works, study };
  });
}

async function verifyU1Embedded(browser, baseUrl) {
  const viewport = { width: 1024, height: 768 };
  return withBrowserContext(browser, { viewport, reducedMotion: 'reduce' }, async (context) => {
    const page = await context.newPage();
    const issues = installErrorCollection(page, 'U1 eleven works embedded');
    const imageRequests = new Map();
    await mockRemoteImages(page, (url) => {
      imageRequests.set(url, (imageRequests.get(url) || 0) + 1);
    });
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'load' });
    await page.locator('#home-map-embed').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => (
      document.querySelector('#worldMapFrame')?.contentDocument?.querySelector('.map-zone')
    ));
    const { frame } = await selectArtAndFrame(page, true);
    const works = await verifyU1Works(page, frame, imageRequests, 'embedded');
    const study = await verifyU1StudyTabsAndComparison(page, frame, 'embedded');
    assert.deepEqual(issues, []);
    return { viewport, works, study };
  });
}

async function verifyImportedWorksStandalone(browser, baseUrl) {
  const viewport = { width: 1440, height: 900 };
  return withBrowserContext(browser, { viewport, reducedMotion: 'reduce' }, async (context) => {
    const page = await context.newPage();
    const issues = installErrorCollection(page, 'nine works standalone');
    const imageRequests = [];
    await mockRemoteImages(page, (url) => imageRequests.push(url));
    await page.goto(`${baseUrl}/art-history-map.html`, { waitUntil: 'load' });
    await waitForArt(page);
    assert.equal(
      (await page.locator('.page-header h1').textContent()).trim(),
      'AP 艺术史互动地图 · Units 1-3',
    );
    const works = await verifyNineImportedWorks(page, page, imageRequests, 'standalone');
    assert.deepEqual(issues, []);
    return { viewport, works };
  });
}

async function verifyImportedWorksEmbedded(browser, baseUrl) {
  const viewport = { width: 1024, height: 768 };
  return withBrowserContext(browser, { viewport, reducedMotion: 'reduce' }, async (context) => {
    const page = await context.newPage();
    const issues = installErrorCollection(page, 'nine works embedded');
    const imageRequests = [];
    await mockRemoteImages(page, (url) => imageRequests.push(url));
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'load' });
    await page.locator('#home-map-embed').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => (
      document.querySelector('#worldMapFrame')?.contentDocument?.querySelector('.map-zone')
    ));
    const { frame } = await selectArtAndFrame(page, true);
    const works = await verifyNineImportedWorks(page, frame, imageRequests, 'embedded');
    assert.deepEqual(issues, []);
    return { viewport, works };
  });
}

async function verifyResponsiveWarningRegression(browser, baseUrl) {
  const viewport = { width: 519, height: 700 };
  await assert.rejects(
    verifyStandalone(
      browser,
      baseUrl,
      viewport,
      false,
      { injectConsoleIssue: 'warning' },
    ),
    /responsive warning regression/,
  );
  await assert.rejects(
    verifyStandalone(
      browser,
      baseUrl,
      viewport,
      false,
      { injectConsoleIssue: 'error' },
    ),
    /responsive error regression/,
  );
  return { viewport, warningRejected: true, errorRejected: true };
}

export async function runFocusedImportedVerification() {
  const playwright = await discoverPlaywright();
  const executablePath = await discoverBrowser(playwright.chromium);
  return runManagedVerification({
    startServer: () => startStaticServer(),
    launchBrowser: () => playwright.chromium.launch({
      executablePath,
      headless: true,
      args: ['--disable-gpu', '--no-sandbox'],
    }),
    verify: async ({ server, browser }) => ({
      standalone: await verifyImportedWorksStandalone(browser, server.baseUrl),
      embedded: await verifyImportedWorksEmbedded(browser, server.baseUrl),
    }),
  });
}

export async function runFocusedWarningVerification() {
  const playwright = await discoverPlaywright();
  const executablePath = await discoverBrowser(playwright.chromium);
  return runManagedVerification({
    startServer: () => startStaticServer(),
    launchBrowser: () => playwright.chromium.launch({
      executablePath,
      headless: true,
      args: ['--disable-gpu', '--no-sandbox'],
    }),
    verify: async ({ server, browser }) => (
      verifyResponsiveWarningRegression(browser, server.baseUrl)
    ),
  });
}

export async function runFocusedU3FaultVerification(faultMode) {
  assert.ok(U3_FAULT_MODES.includes(faultMode), `Unknown U3 verifier fault mode ${faultMode}`);
  const playwright = await discoverPlaywright();
  const executablePath = await discoverBrowser(playwright.chromium);
  return runManagedVerification({
    startServer: () => startStaticServer(),
    launchBrowser: () => playwright.chromium.launch({
      executablePath,
      headless: true,
      args: ['--disable-gpu', '--no-sandbox'],
    }),
    verify: async ({ server, browser }) => (
      verifyU3Standalone(browser, server.baseUrl, { faultMode, maxWorks: 1 })
    ),
  });
}

export async function withBrowserContext(browser, options, verify) {
  const context = await browser.newContext(options);
  let result;
  let operationError;
  try {
    result = await verify(context);
  } catch (error) {
    operationError = error;
  }
  const [cleanup] = await Promise.allSettled([context.close()]);
  if (operationError) throw operationError;
  if (cleanup.status === 'rejected') throw cleanup.reason;
  return result;
}

export async function runManagedVerification({
  startServer,
  launchBrowser,
  verify,
  timeoutMs = BROWSER_VERIFICATION_TIMEOUT_MS,
  cleanupTimeoutMs = BROWSER_CLEANUP_TIMEOUT_MS,
}) {
  let server;
  let browser;
  let result;
  let operationError;
  let verificationTimer;
  let timedOut = false;
  const closeWithTimeout = async (resource, label) => {
    if (!resource?.close) return;
    let cleanupTimer;
    try {
      await Promise.race([
        resource.close(),
        new Promise((_, reject) => {
          cleanupTimer = setTimeout(
            () => reject(new Error(
              `Browser verification ${label} cleanup timed out after ${cleanupTimeoutMs} ms`,
            )),
            cleanupTimeoutMs,
          );
        }),
      ]);
    } finally {
      clearTimeout(cleanupTimer);
    }
  };
  const lifecycle = (async () => {
    const startedServer = await startServer();
    if (timedOut) {
      await closeWithTimeout(startedServer, 'late server');
      return undefined;
    }
    server = startedServer;
    const launchedBrowser = await launchBrowser(server);
    if (timedOut) {
      await closeWithTimeout(launchedBrowser, 'late browser');
      return undefined;
    }
    browser = launchedBrowser;
    return verify({ server, browser });
  })();
  try {
    result = await Promise.race([
      lifecycle,
      new Promise((_, reject) => {
        verificationTimer = setTimeout(
          () => {
            timedOut = true;
            reject(new Error(`Browser verification timed out after ${timeoutMs} ms`));
          },
          timeoutMs,
        );
      }),
    ]);
  } catch (error) {
    operationError = error;
  } finally {
    clearTimeout(verificationTimer);
  }
  const cleanupResults = await Promise.allSettled([
    closeWithTimeout(browser, 'browser'),
    closeWithTimeout(server, 'server'),
  ]);
  if (operationError) throw operationError;
  const cleanupErrors = cleanupResults
    .filter(({ status }) => status === 'rejected')
    .map(({ reason }) => reason);
  if (cleanupErrors.length === 1) throw cleanupErrors[0];
  if (cleanupErrors.length > 1) {
    throw new AggregateError(cleanupErrors, 'Browser verification cleanup failed');
  }
  return result;
}

export async function runVerification() {
  const playwright = await discoverPlaywright();
  const executablePath = await discoverBrowser(playwright.chromium);
  return runManagedVerification({
    startServer: () => startStaticServer(),
    launchBrowser: () => playwright.chromium.launch({
      executablePath,
      headless: true,
      args: ['--disable-gpu', '--no-sandbox'],
    }),
    verify: async ({ server, browser }) => {
      const report = [];
      const warningRegression = await verifyResponsiveWarningRegression(browser, server.baseUrl);
      report.push({ kind: 'warning-regression', ...warningRegression });
      for (const viewport of REQUIRED_VIEWPORTS) {
        const standalone = await verifyStandalone(browser, server.baseUrl, viewport, true);
        const embedded = await verifyEmbedded(browser, server.baseUrl, viewport, true);
        report.push({ viewport, kind: 'required', standalone, embedded });
      }
      for (const viewport of BOUNDARY_VIEWPORTS) {
        const standalone = await verifyStandalone(browser, server.baseUrl, viewport, false);
        const embedded = await verifyEmbedded(browser, server.baseUrl, viewport, false);
        report.push({ viewport, kind: 'boundary', standalone, embedded });
      }
      const u1Standalone = await verifyU1Standalone(browser, server.baseUrl);
      const u1Embedded = await verifyU1Embedded(browser, server.baseUrl);
      report.push({
        kind: 'u1-eleven-works',
        standalone: u1Standalone,
        embedded: u1Embedded,
      });
      const u3Standalone = await verifyU3Standalone(browser, server.baseUrl);
      const u3Embedded = await verifyU3Embedded(browser, server.baseUrl);
      report.push({
        kind: 'u3-fifty-one-works',
        standalone: u3Standalone,
        embedded: u3Embedded,
      });
      const standaloneImported = await verifyImportedWorksStandalone(browser, server.baseUrl);
      const embeddedImported = await verifyImportedWorksEmbedded(browser, server.baseUrl);
      report.push({
        kind: 'nine-imported-works',
        standalone: standaloneImported,
        embedded: embeddedImported,
      });
      return report;
    },
  });
}

const isMain = process.argv[1]
  && fileURLToPath(import.meta.url) === normalize(process.argv[1]);

if (isMain) {
  Promise.resolve()
    .then(() => {
      const faultMode = parseU3FaultMode(process.argv.slice(2));
      if (faultMode) return runFocusedU3FaultVerification(faultMode);
      if (process.argv.includes('--imported-only')) return runFocusedImportedVerification();
      if (process.argv.includes('--warning-regression-only')) {
        return runFocusedWarningVerification();
      }
      return runVerification();
    })
    .then((report) => {
      process.stdout.write(`${JSON.stringify({ ok: true, cases: report }, null, 2)}\n`);
    })
    .catch((error) => {
      process.stderr.write(`Art History browser verification failed: ${error.stack || error}\n`);
      process.exitCode = 1;
    });
}
