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
  validateArtworks,
} from '../scripts/validate-art-history-data.mjs';

const execFileAsync = promisify(execFile);
const VALIDATOR_PATH = fileURLToPath(new URL('../scripts/validate-art-history-data.mjs', import.meta.url));
const HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const MANIFEST_PATH = new URL('../data/ap-art-history-unit-2-manifest.json', import.meta.url);
const EXPECTED_AP_NUMBERS = Array.from({ length: 36 }, (_, index) => index + 12);
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
  return JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
}

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

test('CLI rejects an empty Unit 2 dataset instead of reporting success', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'art-history-validator-'));
  const htmlPath = await writeFixtureHtml(directory, [], {});

  try {
    await assert.rejects(
      execFileAsync(process.execPath, [VALIDATOR_PATH, htmlPath]),
      /exactly 36|manifest/i,
    );
  } finally {
    await rm(directory, { recursive: true });
  }
});

test('matches the exact official AP 12–47 Unit 2 id and title manifest', async () => {
  const artworks = await loadAndValidate();
  const manifest = await loadManifest();
  const apNumbers = artworks.map(({ apNumber }) => apNumber).sort((a, b) => a - b);

  assert.equal(artworks.length, 36);
  assert.deepEqual(
    Object.entries(manifest).map(
      ([apNumber, { id, titleEn }]) => `${apNumber}|${id}|${titleEn}`,
    ),
    EXPECTED_OFFICIAL_MANIFEST,
    'checked-in manifest must match the independently transcribed CED sequence',
  );
  assert.deepEqual(apNumbers, EXPECTED_AP_NUMBERS);
  assert.deepEqual(
    artworks.map(({ apNumber }) => apNumber),
    EXPECTED_AP_NUMBERS,
    'artwork-data must remain in official AP order',
  );
  assert.deepEqual(
    Object.fromEntries(
      artworks
        .sort((first, second) => first.apNumber - second.apNumber)
        .map(({ apNumber, id, titleEn }) => [apNumber, { id, titleEn }]),
    ),
    manifest,
  );
});

test('validator rejects an injected AP 48 manifest entry with unchanged official artworks', async () => {
  const [{ artworks }, manifest] = await Promise.all([
    loadDocumentData(),
    loadManifest(),
  ]);

  assert.throws(
    () => validateArtworks(artworks, {
      ...manifest,
      48: {
        id: 'ap48-extra',
        titleEn: 'Extra',
      },
    }),
    /official Unit 2 manifest.*(?:keys|12\.\.47|36)/i,
  );
});

test('validator requires the exact numeric manifest keyset 12 through 47', async () => {
  const [{ artworks }, manifest] = await Promise.all([
    loadDocumentData(),
    loadManifest(),
  ]);
  const { 12: omitted, ...missingAp12 } = manifest;

  for (const invalidManifest of [
    missingAp12,
    { ...manifest, extra: { id: 'extra', titleEn: 'Extra' } },
    { ...manifest, '12.0': manifest[12] },
  ]) {
    assert.throws(
      () => validateArtworks(artworks, invalidManifest),
      /official Unit 2 manifest.*(?:keys|12\.\.47|36)/i,
    );
  }
});

test('validator rejects incomplete, mismatched, duplicate, and extra manifest entries', async () => {
  const { artworks, credits } = await loadDocumentData();
  const directory = await mkdtemp(join(tmpdir(), 'art-history-validator-manifest-'));

  try {
    const cases = [
      {
        label: 'incomplete',
        artworks: artworks.slice(1),
        credits: Object.fromEntries(Object.entries(credits).slice(1)),
      },
      {
        label: 'mismatched title',
        artworks: artworks.map((work) => (
          work.apNumber === 12 ? { ...work, titleEn: 'White Temple' } : work
        )),
        credits,
      },
      {
        label: 'mismatched id',
        artworks: artworks.map((work) => (
          work.apNumber === 12 ? { ...work, id: 'ap12-wrong-id' } : work
        )),
        credits: {
          ...credits,
          'ap12-wrong-id': credits['ap12-white-temple-ziggurat'],
        },
      },
      {
        label: 'duplicate',
        artworks: [...artworks, { ...artworks[0] }],
        credits,
      },
      {
        label: 'extra',
        artworks: [
          ...artworks,
          { ...artworks[0], id: 'ap48-extra', apNumber: 48 },
        ],
        credits: {
          ...credits,
          'ap48-extra': credits['ap12-white-temple-ziggurat'],
        },
      },
    ];

    for (const fixture of cases) {
      const htmlPath = await writeFixtureHtml(
        directory,
        fixture.artworks,
        fixture.credits,
      );
      await assert.rejects(
        loadAndValidate(htmlPath),
        /manifest|exactly 36|duplicate|12\.\.47/i,
        fixture.label,
      );
    }
  } finally {
    await rm(directory, { recursive: true });
  }
});

test('validator enforces a complete one-to-one HTTPS image credit manifest', async () => {
  const { artworks, credits } = await loadDocumentData();
  const directory = await mkdtemp(join(tmpdir(), 'art-history-validator-credits-'));

  try {
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
    ];

    for (const [index, fixtureCredits] of invalidCredits.entries()) {
      const htmlPath = await writeFixtureHtml(directory, artworks, fixtureCredits);
      await assert.rejects(
        loadAndValidate(htmlPath),
        /credit|creatorOrInstitution|HTTPS/i,
        `invalid credit fixture ${index + 1}`,
      );
    }
  } finally {
    await rm(directory, { recursive: true });
  }
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

test('assigns every current work to Unit 2 with culture and region metadata', async () => {
  const artworks = await loadAndValidate();

  for (const artwork of artworks) {
    assert.equal(artwork.unit, 2, `${artwork.id} must be in Unit 2`);
    assert.equal(typeof artwork.culture, 'string', `${artwork.id} must have a culture`);
    assert.ok(artwork.culture.trim(), `${artwork.id} must have a non-empty culture`);
    assert.equal(typeof artwork.region, 'string', `${artwork.id} must have a region`);
    assert.ok(artwork.region.trim(), `${artwork.id} must have a non-empty region`);
    assert.equal('civilization' in artwork, false, `${artwork.id} must not retain civilization`);
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
    assert.ok(artwork.coordinates.x >= 0 && artwork.coordinates.x <= 1200);
    assert.ok(artwork.coordinates.y >= 0 && artwork.coordinates.y <= 700);
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
