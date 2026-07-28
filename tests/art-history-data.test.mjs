import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import {
  loadAndValidate,
  normalizeArtworkMedia,
  validateArtworks,
  validateImageCredits,
} from '../scripts/validate-art-history-data.mjs';

const execFileAsync = promisify(execFile);
const VALIDATOR_PATH = fileURLToPath(new URL('../scripts/validate-art-history-data.mjs', import.meta.url));
const HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const U1_CANONICAL_PATH = new URL('./fixtures/u1-canonical.json', import.meta.url);
const MANIFEST_PATHS = {
  1: new URL('../data/ap-art-history-unit-1-manifest.json', import.meta.url),
  2: new URL('../data/ap-art-history-unit-2-manifest.json', import.meta.url),
};
const EXPECTED_AP_NUMBERS = Array.from({ length: 47 }, (_, index) => index + 1);
const EXPECTED_U2_AP_NUMBERS = Array.from({ length: 36 }, (_, index) => index + 12);
const EXPECTED_U1_MANIFEST = [
  '1|ap1-apollo-11-stones|Apollo 11 stones',
  '2|ap2-great-hall-bulls|Great Hall of the Bulls',
  '3|ap3-camelid-sacrum-canine|Camelid sacrum in the shape of a canine',
  '4|ap4-running-horned-woman|Running horned woman',
  '5|ap5-beaker-ibex-motifs|Beaker with ibex motifs',
  '6|ap6-anthropomorphic-stele|Anthropomorphic stele',
  '7|ap7-jade-cong|Jade cong',
  '8|ap8-stonehenge|Stonehenge',
  '9|ap9-ambum-stone|The Ambum stone',
  '10|ap10-tlatilco-female-figurine|Tlatilco female figurine',
  '11|ap11-terra-cotta-fragment|Terra cotta fragment',
];
const EXPECTED_OFFICIAL_MANIFEST = [
  '12|ap12-white-temple-ziggurat|White Temple and its ziggurat',
  '13|ap13-palette-of-king-narmer|Palette of King Narmer',
  '14|ap14-statues-votive-figures|Statues of votive figures, from the Square Temple at Eshnunna (modern Tell Asmar, Iraq)',
  '15|ap15-seated-scribe|Seated scribe',
  '16|ap16-standard-of-ur|Standard of Ur from the Royal Tombs at Ur (modern Tell el-Muqayyar, Iraq)',
  '17|ap17-great-pyramids-giza|Great Pyramids (Menkaura, Khafre, Khufu) and Great Sphinx',
  '18|ap18-king-menkaura-and-queen|King Menkaura and queen',
  '19|ap19-code-of-hammurabi|The Code of Hammurabi',
  '20|ap20-temple-of-amun-re-karnak|Temple of Amun-Re and Hypostyle Hall',
  '21|ap21-mortuary-temple-hatshepsut|Mortuary temple of Hatshepsut',
  '22|ap22-akhenaten-nefertiti-daughters|Akhenaten, Nefertiti, and three daughters',
  '23|ap23-tutankhamun-innermost-coffin|Tutankhamun’s tomb, innermost coffin',
  '24|ap24-last-judgment-of-hunefer|Last judgment of Hunefer, from his tomb (page from the Book of the Dead)',
  '25|ap25-lamassu-sargon-ii|Lamassu from the citadel of Sargon II, Dur Sharrukin (modern Khorsabad, Iraq)',
  '26|ap26-athenian-agora|Athenian agora',
  '27|ap27-anavysos-kouros|Anavysos Kouros',
  '28|ap28-peplos-kore|Peplos Kore from the Acropolis',
  '29|ap29-sarcophagus-of-the-spouses|Sarcophagus of the Spouses',
  '30|ap30-apadana-darius-xerxes|Audience Hall (apadana) of Darius and Xerxes',
  '31|ap31-temple-minerva-apollo|Temple of Minerva (Veii, near Rome, Italy) and sculpture of Apollo',
  '32|ap32-tomb-of-the-triclinium|Tomb of the Triclinium',
  '33|ap33-niobides-krater|Niobides Krater',
  '34|ap34-doryphoros|Doryphoros (Spear Bearer)',
  '35|ap35-athenian-acropolis|Acropolis',
  '36|ap36-grave-stele-hegeso|Grave stele of Hegeso',
  '37|ap37-winged-victory-samothrace|Winged Victory of Samothrace',
  '38|ap38-great-altar-pergamon|Great Altar of Zeus and Athena at Pergamon',
  '39|ap39-house-of-the-vettii|House of the Vettii',
  '40|ap40-alexander-mosaic|Alexander Mosaic from the House of Faun, Pompeii',
  '41|ap41-seated-boxer|Seated boxer',
  '42|ap42-head-of-a-roman-patrician|Head of a Roman patrician',
  '43|ap43-augustus-prima-porta|Augustus of Prima Porta',
  '44|ap44-colosseum|Colosseum (Flavian Amphitheater)',
  '45|ap45-forum-of-trajan|Forum of Trajan',
  '46|ap46-pantheon|Pantheon',
  '47|ap47-ludovisi-battle-sarcophagus|Ludovisi Battle Sarcophagus',
];
const EXPECTED_NEW_WORKS = [
  {
    apNumber: 12,
    id: 'ap12-white-temple-ziggurat',
    title: 'White Temple and its ziggurat',
    site: 'Uruk, Iraq',
    culture: 'ancientNearEast',
    region: 'middleEast',
  },
  {
    apNumber: 14,
    id: 'ap14-statues-votive-figures',
    title: 'Statues of votive figures, from the Square Temple at Eshnunna (modern Tell Asmar, Iraq)',
    site: 'Eshnunna (Tell Asmar), Iraq',
    culture: 'ancientNearEast',
    region: 'middleEast',
  },
  {
    apNumber: 16,
    id: 'ap16-standard-of-ur',
    title: 'Standard of Ur from the Royal Tombs at Ur (modern Tell el-Muqayyar, Iraq)',
    site: 'Ur, Iraq',
    culture: 'ancientNearEast',
    region: 'middleEast',
  },
  {
    apNumber: 19,
    id: 'ap19-code-of-hammurabi',
    title: 'The Code of Hammurabi',
    site: 'Susa, Iran',
    culture: 'ancientNearEast',
    region: 'middleEast',
  },
  {
    apNumber: 25,
    id: 'ap25-lamassu-sargon-ii',
    title: 'Lamassu from the citadel of Sargon II, Dur Sharrukin (modern Khorsabad, Iraq)',
    site: 'Dur Sharrukin (Khorsabad), Iraq',
    culture: 'ancientNearEast',
    region: 'middleEast',
  },
  {
    apNumber: 29,
    id: 'ap29-sarcophagus-of-the-spouses',
    title: 'Sarcophagus of the Spouses',
    site: 'Cerveteri, Italy',
    culture: 'etruscan',
    region: 'southernEurope',
  },
  {
    apNumber: 30,
    id: 'ap30-apadana-darius-xerxes',
    title: 'Audience Hall (apadana) of Darius and Xerxes',
    site: 'Persepolis, Iran',
    culture: 'ancientNearEast',
    region: 'middleEast',
  },
  {
    apNumber: 31,
    id: 'ap31-temple-minerva-apollo',
    title: 'Temple of Minerva (Veii, near Rome, Italy) and sculpture of Apollo',
    site: 'Veii, Italy',
    culture: 'etruscan',
    region: 'southernEurope',
  },
  {
    apNumber: 32,
    id: 'ap32-tomb-of-the-triclinium',
    title: 'Tomb of the Triclinium',
    site: 'Tarquinia, Italy',
    culture: 'etruscan',
    region: 'southernEurope',
  },
];

async function loadManifest() {
  return JSON.parse(await readFile(MANIFEST_PATHS[2], 'utf8'));
}

async function loadManifests() {
  const [unit1, unit2] = await Promise.all(
    [1, 2].map(async (unit) => JSON.parse(await readFile(MANIFEST_PATHS[unit], 'utf8'))),
  );
  return { 1: unit1, 2: unit2 };
}

test('checked-in U1 manifest matches the official AP 1-11 sequence', async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_PATHS[1], 'utf8'));
  assert.deepEqual(
    Object.entries(manifest).map(
      ([apNumber, { id, titleEn }]) => `${apNumber}|${id}|${titleEn}`,
    ),
    EXPECTED_U1_MANIFEST,
  );
});

test('checked-in U2 manifest matches the official AP 12-47 sequence', async () => {
  const manifest = await loadManifest();
  assert.deepEqual(
    Object.entries(manifest).map(
      ([apNumber, { id, titleEn }]) => `${apNumber}|${id}|${titleEn}`,
    ),
    EXPECTED_OFFICIAL_MANIFEST,
    'checked-in manifest must match the independently transcribed CED sequence',
  );
});

async function writeFixtureHtml(directory, artworks, credits) {
  const htmlPath = join(directory, 'fixture.html');
  await writeFile(
    htmlPath,
    [
      '<script id="artwork-data" type="application/json">',
      JSON.stringify(artworks),
      '</script>',
      '<script id="image-credit-data" type="application/json">',
      JSON.stringify(credits),
      '</script>',
    ].join('\n'),
    'utf8',
  );
  return htmlPath;
}

async function loadDocumentData() {
  const html = await readFile(HTML_PATH, 'utf8');
  const parseBlock = (id) => JSON.parse(
    html.match(new RegExp(`<script id="${id}" type="application/json">([\\s\\S]*?)<\\/script>`))[1],
  );
  return {
    artworks: parseBlock('artwork-data'),
    credits: parseBlock('image-credit-data'),
  };
}

test('live U1 records and credits match the reviewed canonical fixture', async () => {
  const [{ artworks, credits }, fixture] = await Promise.all([
    loadDocumentData(),
    readFile(U1_CANONICAL_PATH, 'utf8').then(JSON.parse),
  ]);
  assert.deepEqual(
    artworks.filter(({ unit }) => unit === 1),
    fixture.artworks,
  );
  assert.deepEqual(
    Object.fromEntries(fixture.artworks.map(({ id }) => [id, credits[id]])),
    fixture.credits,
  );
});

function makeUnit1Artworks(manifest) {
  const regions = [
    'africa',
    'europe',
    'americas',
    'africa',
    'middleEast',
    'middleEast',
    'eastAsia',
    'europe',
    'oceania',
    'americas',
    'oceania',
  ];
  return Object.entries(manifest).map(([apNumberText, { id, titleEn }]) => {
    const apNumber = Number(apNumberText);
    const mediaCount = apNumber === 8 ? 2 : 1;
    return {
      id,
      apNumber,
      titleEn,
      titleZh: `作品 ${apNumber}`,
      unit: 1,
      culture: 'globalPrehistory',
      region: regions[apNumber - 1],
      period: 'Global Prehistory',
      date: 'Prehistoric',
      artistCulture: 'Unknown',
      siteName: `Site ${apNumber}`,
      ...(apNumber === 6
        ? { siteQualifier: 'Broad regional provenance; marker location is approximate' }
        : {}),
      coordinates: { x: 100 + apNumber, y: 100 + apNumber },
      medium: 'Test medium',
      workType: 'test work',
      function: 'Test function',
      form: 'Test form',
      content: 'Test content',
      context: 'Test context',
      recognitionAnchors: ['Test anchor'],
      comparisonIds: [
        apNumber === 1 ? 'ap2-great-hall-bulls' : 'ap1-apollo-11-stones',
      ],
      images: Array.from({ length: mediaCount }, (_, index) => ({
        label: mediaCount === 1 ? 'Primary view' : `View ${index + 1}`,
        imageUrl: `https://example.com/${id}-${index + 1}.jpg`,
        imageAlt: `${titleEn} view ${index + 1}`,
        imageSourceName: 'Example source',
        imageSourceUrl: `https://example.com/source/${id}-${index + 1}`,
      })),
      keywords: ['test'],
    };
  });
}

function makeUnit1Credits(artworks) {
  return Object.fromEntries(artworks.map((artwork) => {
    const entries = normalizeArtworkMedia(artwork).map((_, index) => ({
      creatorOrInstitution: `Creator ${artwork.apNumber}-${index + 1}`,
      licenseName: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    }));
    return [artwork.id, entries.length === 1 ? entries[0] : entries];
  }));
}

async function loadCompleteFixture() {
  const [{ artworks, credits }, manifests] = await Promise.all([
    loadDocumentData(),
    loadManifests(),
  ]);
  const unit2Artworks = artworks.filter(({ unit }) => unit === 2);
  const unit2Credits = Object.fromEntries(
    unit2Artworks.map(({ id }) => [id, credits[id]]),
  );
  const unit1Artworks = makeUnit1Artworks(manifests[1]);
  return {
    artworks: [...unit1Artworks, ...unit2Artworks],
    credits: { ...makeUnit1Credits(unit1Artworks), ...unit2Credits },
    manifests,
  };
}

test('normalizes both explicit image arrays and legacy single-image fields', () => {
  const explicit = {
    images: [{
      label: 'Ground-level view',
      imageUrl: 'https://example.com/ground.jpg',
      imageAlt: 'Ground view',
      imageSourceName: 'Example',
      imageSourceUrl: 'https://example.com/source',
      ignored: 'not part of normalized media',
    }],
  };
  const legacy = {
    imageUrl: 'https://example.com/primary.jpg',
    imageAlt: 'Primary view',
    imageSourceName: 'Example',
    imageSourceUrl: 'https://example.com/source',
  };

  assert.deepEqual(normalizeArtworkMedia(explicit), [{
    label: 'Ground-level view',
    imageUrl: 'https://example.com/ground.jpg',
    imageAlt: 'Ground view',
    imageSourceName: 'Example',
    imageSourceUrl: 'https://example.com/source',
  }]);
  assert.deepEqual(normalizeArtworkMedia(legacy), [{
    label: 'Primary view',
    imageUrl: 'https://example.com/primary.jpg',
    imageAlt: 'Primary view',
    imageSourceName: 'Example',
    imageSourceUrl: 'https://example.com/source',
  }]);
});

test('CLI rejects an empty Units 1-2 dataset instead of reporting success', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'art-history-validator-'));
  const htmlPath = await writeFixtureHtml(directory, [], {});

  try {
    await assert.rejects(
      execFileAsync(process.execPath, [VALIDATOR_PATH, htmlPath]),
      /exactly 47|manifest/i,
    );
  } finally {
    await rm(directory, { recursive: true });
  }
});

test('loads exactly AP 1–47 in official order while preserving the AP 12–47 manifest', async () => {
  const artworks = await loadAndValidate();
  const manifest = await loadManifest();

  assert.equal(artworks.length, 47);
  assert.deepEqual(
    artworks.map(({ apNumber }) => apNumber),
    EXPECTED_AP_NUMBERS,
    'artwork-data must remain in official AP order',
  );
  assert.deepEqual(
    artworks.filter(({ unit }) => unit === 2).map(({ apNumber }) => apNumber),
    EXPECTED_U2_AP_NUMBERS,
  );
  assert.deepEqual(
    Object.fromEntries(
      artworks
        .filter(({ unit }) => unit === 2)
        .sort((first, second) => first.apNumber - second.apNumber)
        .map(({ apNumber, id, titleEn }) => [apNumber, { id, titleEn }]),
    ),
    manifest,
  );
});

test('validator rejects an injected AP 48 manifest entry with unchanged official artworks', async () => {
  const { artworks, manifests } = await loadCompleteFixture();

  assert.throws(
    () => validateArtworks(artworks, {
      ...manifests,
      2: {
        ...manifests[2],
        48: {
          id: 'ap48-extra',
          titleEn: 'Extra',
        },
      },
    }),
    /official Unit 2 manifest.*(?:keys|12\.\.47|36)/i,
  );
});

test('validator requires the exact numeric manifest keyset 12 through 47', async () => {
  const { artworks, manifests } = await loadCompleteFixture();
  const { 12: omitted, ...missingAp12 } = manifests[2];

  for (const invalidManifest of [
    missingAp12,
    { ...manifests[2], extra: { id: 'extra', titleEn: 'Extra' } },
    { ...manifests[2], '12.0': manifests[2][12] },
  ]) {
    assert.throws(
      () => validateArtworks(artworks, { ...manifests, 2: invalidManifest }),
      /official Unit 2 manifest.*(?:keys|12\.\.47|36)/i,
    );
  }
});

test('validator requires the exact numeric manifest keyset 1 through 11', async () => {
  const { artworks, manifests } = await loadCompleteFixture();
  const { 1: omitted, ...missingAp1 } = manifests[1];

  for (const invalidManifest of [
    missingAp1,
    { ...manifests[1], extra: { id: 'extra', titleEn: 'Extra' } },
    { ...manifests[1], '1.0': manifests[1][1] },
  ]) {
    assert.throws(
      () => validateArtworks(artworks, { ...manifests, 1: invalidManifest }),
      /official Unit 1 manifest.*(?:keys|1\.\.11|11)/i,
    );
  }
});

test('validator rejects incomplete, mismatched, duplicate, and extra manifest entries', async () => {
  const { artworks, manifests } = await loadCompleteFixture();
  const cases = [
    {
      label: 'incomplete',
      artworks: artworks.slice(1),
    },
    {
      label: 'mismatched title',
      artworks: artworks.map((work) => (
        work.apNumber === 12 ? { ...work, titleEn: 'White Temple' } : work
      )),
    },
    {
      label: 'mismatched id',
      artworks: artworks.map((work) => (
        work.apNumber === 12 ? { ...work, id: 'ap12-wrong-id' } : work
      )),
    },
    {
      label: 'duplicate',
      artworks: [...artworks, { ...artworks[0] }],
    },
    {
      label: 'extra',
      artworks: [
        ...artworks,
        { ...artworks[0], id: 'ap48-extra', apNumber: 48 },
      ],
    },
  ];

  for (const fixture of cases) {
    assert.throws(
      () => validateArtworks(fixture.artworks, manifests),
      /manifest|exactly 47|duplicate|1\.\.47/i,
      fixture.label,
    );
  }
});

test('validator enforces exact media-aligned HTTPS image credit manifests', async () => {
  const { artworks, credits, manifests } = await loadCompleteFixture();
  validateArtworks(artworks, manifests);
  const stonehengeId = 'ap8-stonehenge';
  const invalidCredits = [
    Object.fromEntries(Object.entries(credits).slice(1)),
    { ...credits, extra: credits['ap12-white-temple-ziggurat'] },
    {
      ...credits,
      'ap12-white-temple-ziggurat': {
        ...credits['ap12-white-temple-ziggurat'],
        creatorOrInstitution: '',
      },
    },
    {
      ...credits,
      'ap12-white-temple-ziggurat': {
        ...credits['ap12-white-temple-ziggurat'],
        licenseUrl: 'http://creativecommons.org/licenses/by-sa/2.0/',
      },
    },
    {
      ...credits,
      [stonehengeId]: [credits[stonehengeId][0]],
    },
    {
      ...credits,
      [stonehengeId]: credits[stonehengeId][0],
    },
  ];

  for (const [index, fixtureCredits] of invalidCredits.entries()) {
    assert.throws(
      () => validateImageCredits(fixtureCredits, artworks),
      /credit|creatorOrInstitution|HTTPS|media/i,
      `invalid credit fixture ${index + 1}`,
    );
  }
});

test('validator rejects a one-element credit array for a single-media Unit 2 work', async () => {
  const { artworks, credits } = await loadCompleteFixture();
  const id = 'ap12-white-temple-ziggurat';

  assert.throws(
    () => validateImageCredits({
      ...credits,
      [id]: [credits[id]],
    }, artworks),
    /credit.*(?:single|object|array|shape)/i,
  );
});

test('validator rejects a one-element credit array for a single-media Unit 1 work', async () => {
  const { artworks, credits } = await loadCompleteFixture();
  const id = 'ap1-apollo-11-stones';

  assert.throws(
    () => validateImageCredits({
      ...credits,
      [id]: [credits[id]],
    }, artworks),
    /credit.*(?:single|object|array|shape)/i,
  );
});

test('validator accepts a complete Units 1-2 fixture with legacy and array media', async () => {
  const { artworks, credits, manifests } = await loadCompleteFixture();

  assert.equal(validateArtworks(artworks, manifests), artworks);
  assert.equal(validateImageCredits(credits, artworks), credits);
});

test('validator requires a provenance qualifier for AP6 broad-region placement', async () => {
  const { artworks, manifests } = await loadCompleteFixture();
  const copy = structuredClone(artworks);
  const ap6Index = copy.findIndex(({ id }) => id === 'ap6-anthropomorphic-stele');
  delete copy[ap6Index].siteQualifier;

  assert.throws(
    () => validateArtworks(copy, manifests),
    /Invalid artwork data:.*ap6-anthropomorphic-stele.*siteQualifier/i,
  );
});

test('validator requires every Unit 1 work to retain comparison targets', async () => {
  const { artworks, manifests } = await loadCompleteFixture();
  const copy = structuredClone(artworks);
  copy[0] = { ...copy[0], comparisonIds: [] };

  assert.throws(
    () => validateArtworks(copy, manifests),
    /Invalid artwork data:.*comparisonIds.*non-empty/i,
  );
});

test('validator rejects duplicate Stonehenge image alt text across distinct views', async () => {
  const { artworks, manifests } = await loadCompleteFixture();
  const copy = structuredClone(artworks);
  const stonehenge = copy.find(({ id }) => id === 'ap8-stonehenge');
  stonehenge.images[1].imageAlt = stonehenge.images[0].imageAlt;

  assert.throws(
    () => validateArtworks(copy, manifests),
    /Invalid artwork data:.*ap8-stonehenge.*duplicate.*imageAlt/i,
  );
});

test('validator rejects duplicate Stonehenge source URLs across distinct views', async () => {
  const { artworks, manifests } = await loadCompleteFixture();
  const copy = structuredClone(artworks);
  const stonehenge = copy.find(({ id }) => id === 'ap8-stonehenge');
  stonehenge.images[1].imageSourceUrl = stonehenge.images[0].imageSourceUrl;

  assert.throws(
    () => validateArtworks(copy, manifests),
    /Invalid artwork data:.*ap8-stonehenge.*duplicate.*imageSourceUrl/i,
  );
});

test('validator rejects duplicate Stonehenge credit metadata across distinct views', async () => {
  const { artworks, credits } = await loadCompleteFixture();
  const copy = structuredClone(credits);
  const stonehengeId = 'ap8-stonehenge';
  copy[stonehengeId][1] = {
    ...copy[stonehengeId][0],
  };

  assert.throws(
    () => validateImageCredits(copy, artworks),
    /Invalid artwork data:.*ap8-stonehenge.*duplicate.*credit/i,
  );
});

test('validator enforces Unit 1 media counts and complete media fields', async () => {
  const { artworks, manifests } = await loadCompleteFixture();
  const stonehengeIndex = artworks.findIndex(({ apNumber }) => apNumber === 8);
  const apolloIndex = artworks.findIndex(({ apNumber }) => apNumber === 1);
  const whiteTempleIndex = artworks.findIndex(({ apNumber }) => apNumber === 12);
  const cases = [
    {
      label: 'Stonehenge requires two views',
      mutate: (copy) => {
        copy[stonehengeIndex] = {
          ...copy[stonehengeIndex],
          images: copy[stonehengeIndex].images.slice(0, 1),
        };
      },
    },
    {
      label: 'other Unit 1 works require one view',
      mutate: (copy) => {
        copy[apolloIndex] = {
          ...copy[apolloIndex],
          images: [...copy[apolloIndex].images, {
            ...copy[apolloIndex].images[0],
            label: 'Extra view',
            imageUrl: 'https://example.com/extra.jpg',
          }],
        };
      },
    },
    {
      label: 'Unit 2 works require one view',
      mutate: (copy) => {
        const work = copy[whiteTempleIndex];
        const primary = normalizeArtworkMedia(work)[0];
        copy[whiteTempleIndex] = {
          ...work,
          images: [
            primary,
            {
              ...primary,
              label: 'Extra view',
              imageUrl: 'https://example.com/u2-extra.jpg',
            },
          ],
        };
      },
    },
    {
      label: 'media URL must be unique within a work',
      mutate: (copy) => {
        copy[stonehengeIndex] = {
          ...copy[stonehengeIndex],
          images: copy[stonehengeIndex].images.map((media, index) => ({
            ...media,
            imageUrl: index === 0
              ? media.imageUrl
              : copy[stonehengeIndex].images[0].imageUrl,
          })),
        };
      },
    },
    {
      label: 'images array cannot be empty',
      mutate: (copy) => {
        copy[apolloIndex] = { ...copy[apolloIndex], images: [] };
      },
    },
    {
      label: 'media fields cannot be blank',
      mutate: (copy) => {
        copy[apolloIndex] = {
          ...copy[apolloIndex],
          images: [{ ...copy[apolloIndex].images[0], imageAlt: '' }],
        };
      },
    },
    {
      label: 'media URLs must be HTTP(S)',
      mutate: (copy) => {
        copy[apolloIndex] = {
          ...copy[apolloIndex],
          images: [{ ...copy[apolloIndex].images[0], imageSourceUrl: 'file:///source' }],
        };
      },
    },
  ];

  for (const fixture of cases) {
    const copy = structuredClone(artworks);
    fixture.mutate(copy);
    assert.throws(
      () => validateArtworks(copy, manifests),
      /media|images|view|image|HTTP|duplicate/i,
      fixture.label,
    );
  }
});

test('validator enforces unit ranges, regions, AP order, coordinates, and comparisons', async () => {
  const { artworks, manifests } = await loadCompleteFixture();
  const cases = [
    {
      label: 'Unit 1 region',
      mutate: (copy) => {
        copy[0] = { ...copy[0], region: 'southernEurope' };
      },
    },
    {
      label: 'Unit 2 range',
      mutate: (copy) => {
        copy[11] = { ...copy[11], unit: 1 };
      },
    },
    {
      label: 'official order',
      mutate: (copy) => {
        [copy[0], copy[1]] = [copy[1], copy[0]];
      },
    },
    {
      label: 'SVG coordinate bounds',
      mutate: (copy) => {
        copy[0] = { ...copy[0], coordinates: { x: 1601, y: 800 } };
      },
    },
    {
      label: 'comparison resolution',
      mutate: (copy) => {
        copy[0] = { ...copy[0], comparisonIds: ['missing-work'] };
      },
    },
  ];

  for (const fixture of cases) {
    const copy = structuredClone(artworks);
    fixture.mutate(copy);
    assert.throws(
      () => validateArtworks(copy, manifests),
      /region|unit|range|order|coordinate|comparison|unknown/i,
      fixture.label,
    );
  }

  const boundaryCoordinates = structuredClone(artworks);
  boundaryCoordinates[0] = {
    ...boundaryCoordinates[0],
    coordinates: { x: 1600, y: 800 },
  };
  assert.equal(validateArtworks(boundaryCoordinates, manifests), boundaryCoordinates);
});

test('imports the exact nine missing works with approved classification metadata', async () => {
  const artworks = await loadAndValidate();

  for (const expected of EXPECTED_NEW_WORKS) {
    const artwork = artworks.find(({ id }) => id === expected.id);
    assert.ok(artwork, `missing ${expected.id}`);
    assert.equal(artwork.apNumber, expected.apNumber, `${expected.id} AP number`);
    assert.equal(artwork.titleEn, expected.title, `${expected.id} title`);
    assert.equal(artwork.siteName, expected.site, `${expected.id} site`);
    assert.equal(artwork.culture, expected.culture, `${expected.id} culture`);
    assert.equal(artwork.region, expected.region, `${expected.id} region`);
    assert.equal(artwork.unit, 2, `${expected.id} unit`);
  }
});

test('assigns exactly 11 works to Unit 1 and 36 works to Unit 2', async () => {
  const artworks = await loadAndValidate();

  assert.equal(artworks.filter(({ unit }) => unit === 1).length, 11);
  assert.equal(artworks.filter(({ unit }) => unit === 2).length, 36);
  for (const artwork of artworks) {
    assert.ok([1, 2].includes(artwork.unit), `${artwork.id} must be in Unit 1 or 2`);
    assert.equal(typeof artwork.culture, 'string', `${artwork.id} must have a culture`);
    assert.ok(artwork.culture.trim(), `${artwork.id} must have a non-empty culture`);
    assert.equal(typeof artwork.region, 'string', `${artwork.id} must have a region`);
    assert.ok(artwork.region.trim(), `${artwork.id} must have a non-empty region`);
    assert.equal('civilization' in artwork, false, `${artwork.id} must not retain civilization`);
  }
});

test('keeps one image per Unit 1 work except Stonehenge with exactly two', async () => {
  const { artworks, credits } = await loadDocumentData();
  const unit1Artworks = artworks.filter(({ unit }) => unit === 1);

  assert.equal(unit1Artworks.length, 11);
  for (const artwork of unit1Artworks) {
    const media = normalizeArtworkMedia(artwork);
    const workCredits = Array.isArray(credits[artwork.id])
      ? credits[artwork.id]
      : [credits[artwork.id]];
    assert.equal(
      media.length,
      artwork.apNumber === 8 ? 2 : 1,
      `${artwork.id} media count`,
    );
    assert.equal(workCredits.length, media.length, `${artwork.id} credit count`);
  }
});

test('uses unique artwork ids and AP numbers', async () => {
  const artworks = await loadAndValidate();
  const ids = artworks.map(({ id }) => id);
  const apNumbers = artworks.map(({ apNumber }) => apNumber);

  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(apNumbers).size, apNumbers.length);
});

test('resolves comparison ids and keeps coordinates inside the map', async () => {
  const artworks = await loadAndValidate();
  const ids = new Set(artworks.map(({ id }) => id));

  for (const artwork of artworks) {
    assert.ok(artwork.coordinates.x >= 0 && artwork.coordinates.x <= 1600);
    assert.ok(artwork.coordinates.y >= 0 && artwork.coordinates.y <= 800);
    for (const comparisonId of artwork.comparisonIds) {
      assert.ok(ids.has(comparisonId), `${artwork.id} references unknown ${comparisonId}`);
    }
  }
});

test('keeps the approved AP 27 source coordinates', async () => {
  const artworks = await loadAndValidate();
  const kouros = artworks.find(({ id }) => id === 'ap27-anavysos-kouros');

  assert.deepEqual(kouros?.coordinates, { x: 405, y: 285 });
});
