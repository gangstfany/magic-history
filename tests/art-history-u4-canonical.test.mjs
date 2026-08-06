import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const MANIFEST_URL = new URL(
  '../data/ap-art-history-unit-4-manifest.json',
  import.meta.url,
);

const EXPECTED_TITLES = [
  'Portrait of Sor Juana Inés de la Cruz',
  'A Philosopher Giving a Lecture on the Orrery',
  'The Swing',
  'Monticello',
  'The Oath of the Horatii',
  'George Washington',
  'Self-Portrait',
  "Y no hai remedio (And There's Nothing to Be Done), from Los Desastres de la Guerra (The Disasters of War), plate 15",
  'La Grande Odalisque',
  'Liberty Leading the People',
  'View from Mount Holyoke, Northampton, Massachusetts, after a Thunderstorm - The Oxbow',
  'Still Life in Studio',
  'Slave Ship (Slavers Throwing Overboard the Dead and Dying, Typhoon Coming On)',
  'Palace of Westminster (Houses of Parliament)',
  'The Stone Breakers',
  'Nadar Raising Photography to the Height of Art',
  'Olympia',
  'The Saint-Lazare Station',
  'The Horse in Motion',
  'The Valley of Mexico from the Hillside of Santa Isabel',
  'The Burghers of Calais',
  'The Starry Night',
  'The Coiffure',
  'The Scream',
  'Where Do We Come From? What Are We? Where Are We Going?',
  'Carson, Pirie, Scott and Company Building',
  'Mont Sainte-Victoire',
  "Les Demoiselles d'Avignon",
  'The Steerage',
  'The Kiss',
  'The Kiss',
  'The Portuguese',
  'The Goldfish',
  'Improvisation 28 (second version)',
  'Self-Portrait as a Soldier',
  'Memorial Sheet of Karl Liebknecht',
  'Villa Savoye',
  'Composition with Red, Blue and Yellow',
  'Illustration from The Results of the First Five-Year Plan',
  'Object (Le Déjeuner en fourrure)',
  'Fallingwater',
  'The Two Fridas',
  'The Migration of the Negro, Panel no. 49',
  'The Jungle',
  'Dream of a Sunday Afternoon in the Alameda Central Park',
  'Fountain',
  'Woman, I',
  'Marilyn Diptych',
  'Seagram Building',
  'Narcissus Garden',
  'The Bay',
  'Lipstick (Ascending) on Caterpillar Tracks',
  'Spiral Jetty',
  'House in New Castle County',
];
const ENTRY_FIELDS = [
  'id',
  'titleEn',
  'region',
  'siteName',
  'provenanceQualifier',
  'traditionGroup',
  'requiredViewIds',
];
const STABLE_FIELDS = [
  'id',
  'region',
  'siteName',
  'provenanceQualifier',
  'traditionGroup',
];

function stable(id, region, siteName, provenanceQualifier, traditionGroup) {
  return { id, region, siteName, provenanceQualifier, traditionGroup };
}

const EXPECTED_STABLE_PROJECTION = {
  '99': stable(
    'ap99-portrait-sor-juana',
    'mexicoCaribbean',
    'Mexico City, New Spain (Mexico)',
    null,
    'enlightenmentRevolution',
  ),
  '100': stable('ap100-philosopher-lecture-orrery', 'britishIsles', 'Derby, England', null, 'enlightenmentRevolution'),
  '101': stable('ap101-swing', 'france', 'Paris, France', null, 'enlightenmentRevolution'),
  '102': stable('ap102-monticello', 'unitedStates', 'Charlottesville, Virginia, U.S.', null, 'enlightenmentRevolution'),
  '103': stable('ap103-oath-horatii', 'southernEurope', 'Rome, Italy', null, 'enlightenmentRevolution'),
  '104': stable(
    'ap104-george-washington',
    'france',
    'Paris, France',
    'Modeled from life at Mount Vernon in 1785 and carved in Paris for installation at the Virginia State Capitol in Richmond.',
    'enlightenmentRevolution',
  ),
  '105': stable('ap105-self-portrait-vigee-le-brun', 'southernEurope', 'Rome, Italy', null, 'enlightenmentRevolution'),
  '106': stable(
    'ap106-y-no-hai-remedio',
    'southernEurope',
    'Spain',
    'Made during the Peninsular War; the precise place where Goya produced this plate is not securely localized.',
    'enlightenmentRevolution',
  ),
  '107': stable('ap107-grande-odalisque', 'france', 'Paris, France', null, 'enlightenmentRevolution'),
  '108': stable('ap108-liberty-leading-people', 'france', 'Paris, France', null, 'enlightenmentRevolution'),
  '109': stable(
    'ap109-oxbow',
    'unitedStates',
    'New York City, New York, U.S.',
    "Painted in Cole's New York studio from sketches made at Mount Holyoke, Massachusetts.",
    'enlightenmentRevolution',
  ),
  '110': stable('ap110-still-life-studio', 'france', 'Paris, France', null, 'realismIndustryPhotography'),
  '111': stable('ap111-slave-ship', 'britishIsles', 'London, England', null, 'realismIndustryPhotography'),
  '112': stable('ap112-palace-westminster', 'britishIsles', 'London, England', null, 'realismIndustryPhotography'),
  '113': stable('ap113-stone-breakers', 'france', 'Ornans, France', null, 'realismIndustryPhotography'),
  '114': stable('ap114-nadar-raising-photography', 'france', 'Paris, France', null, 'realismIndustryPhotography'),
  '115': stable('ap115-olympia', 'france', 'Paris, France', null, 'realismIndustryPhotography'),
  '116': stable('ap116-saint-lazare-station', 'france', 'Paris, France', null, 'realismIndustryPhotography'),
  '117': stable('ap117-horse-motion', 'unitedStates', 'Palo Alto, California, U.S.', null, 'realismIndustryPhotography'),
  '118': stable(
    'ap118-valley-mexico',
    'mexicoCaribbean',
    'Mexico City, Mexico',
    "Painted from studies of the Valley of Mexico made at the hillside of Santa Isabel; the manifest maps Velasco's Mexico City creation context.",
    'realismIndustryPhotography',
  ),
  '119': stable(
    'ap119-burghers-calais',
    'france',
    'Paris, France',
    "Modeled in Rodin's Paris studio for the city of Calais; later casts exist at multiple sites.",
    'realismIndustryPhotography',
  ),
  '120': stable('ap120-starry-night', 'france', 'Saint-Rémy-de-Provence, France', null, 'postImpressionismEarlyModernism'),
  '121': stable('ap121-coiffure', 'france', 'Paris, France', null, 'postImpressionismEarlyModernism'),
  '122': stable(
    'ap122-scream',
    'centralNorthernEurope',
    'Berlin, Germany',
    'Painted while Munch was based in Berlin from a remembered experience and landscape near Kristiania (Oslo).',
    'postImpressionismEarlyModernism',
  ),
  '123': stable('ap123-where-do-we-come-from', 'pacific', 'Punaauia, Tahiti, French Polynesia', null, 'postImpressionismEarlyModernism'),
  '124': stable('ap124-carson-pirie-scott', 'unitedStates', 'Chicago, Illinois, U.S.', null, 'postImpressionismEarlyModernism'),
  '125': stable('ap125-mont-sainte-victoire', 'france', 'Aix-en-Provence, France', null, 'postImpressionismEarlyModernism'),
  '126': stable('ap126-demoiselles-avignon', 'france', 'Paris, France', null, 'postImpressionismEarlyModernism'),
  '127': stable(
    'ap127-steerage',
    'transatlantic',
    'North Atlantic Ocean, aboard SS Kaiser Wilhelm II',
    "Photographed aboard the SS Kaiser Wilhelm II during Stieglitz's 1907 voyage from New York to Europe; the map anchor represents the transatlantic voyage rather than a fixed city.",
    'postImpressionismEarlyModernism',
  ),
  '128': stable('ap128-kiss-klimt', 'centralNorthernEurope', 'Vienna, Austria', null, 'postImpressionismEarlyModernism'),
  '129': stable(
    'ap129-kiss-brancusi',
    'france',
    'Paris, France',
    "Maps the Paris creation context of Brancusi's original 1907-1908 conception; the College Board reference image shows the 1916 version.",
    'postImpressionismEarlyModernism',
  ),
  '130': stable('ap130-portuguese', 'france', 'Paris, France', null, 'postImpressionismEarlyModernism'),
  '131': stable('ap131-goldfish', 'france', 'Issy-les-Moulineaux, France', null, 'postImpressionismEarlyModernism'),
  '132': stable('ap132-improvisation-28', 'centralNorthernEurope', 'Munich, Germany', null, 'postImpressionismEarlyModernism'),
  '133': stable('ap133-self-portrait-soldier', 'centralNorthernEurope', 'Berlin, Germany', null, 'postImpressionismEarlyModernism'),
  '134': stable('ap134-memorial-sheet-karl-liebknecht', 'centralNorthernEurope', 'Berlin, Germany', null, 'postImpressionismEarlyModernism'),
  '135': stable('ap135-villa-savoye', 'france', 'Poissy-sur-Seine, France', null, 'avantGardeArchitecturePostwar'),
  '136': stable('ap136-composition-red-blue-yellow', 'france', 'Paris, France', null, 'avantGardeArchitecturePostwar'),
  '137': stable('ap137-first-five-year-plan', 'russiaSoviet', 'Moscow, Soviet Union (Russia)', null, 'avantGardeArchitecturePostwar'),
  '138': stable('ap138-object-dejeuner-fourrure', 'france', 'Paris, France', null, 'avantGardeArchitecturePostwar'),
  '139': stable('ap139-fallingwater', 'unitedStates', 'Mill Run, Pennsylvania, U.S.', null, 'avantGardeArchitecturePostwar'),
  '140': stable('ap140-two-fridas', 'mexicoCaribbean', 'Mexico City, Mexico', null, 'avantGardeArchitecturePostwar'),
  '141': stable('ap141-migration-negro-panel-49', 'unitedStates', 'New York City, New York, U.S.', null, 'avantGardeArchitecturePostwar'),
  '142': stable('ap142-jungle', 'mexicoCaribbean', 'Havana, Cuba', null, 'avantGardeArchitecturePostwar'),
  '143': stable('ap143-dream-alameda-central', 'mexicoCaribbean', 'Mexico City, Mexico', null, 'avantGardeArchitecturePostwar'),
  '144': stable(
    'ap144-fountain',
    'unitedStates',
    'New York City, New York, U.S.',
    'Maps the New York context of the lost 1917 original and the 1950 second version shown by College Board; multiple authorized replicas exist.',
    'avantGardeArchitecturePostwar',
  ),
  '145': stable('ap145-woman-i', 'unitedStates', 'New York City, New York, U.S.', null, 'avantGardeArchitecturePostwar'),
  '146': stable('ap146-marilyn-diptych', 'unitedStates', 'New York City, New York, U.S.', null, 'avantGardeArchitecturePostwar'),
  '147': stable('ap147-seagram-building', 'unitedStates', 'New York City, New York, U.S.', null, 'avantGardeArchitecturePostwar'),
  '148': stable(
    'ap148-narcissus-garden',
    'southernEurope',
    'Venice, Italy',
    "Maps Kusama's original 1966 Venice Biennale installation and performance; the College Board reference image documents a 2010 Paris installation.",
    'avantGardeArchitecturePostwar',
  ),
  '149': stable('ap149-bay', 'unitedStates', 'New York City, New York, U.S.', null, 'avantGardeArchitecturePostwar'),
  '150': stable('ap150-lipstick-caterpillar-tracks', 'unitedStates', 'New Haven, Connecticut, U.S.', null, 'avantGardeArchitecturePostwar'),
  '151': stable('ap151-spiral-jetty', 'unitedStates', 'Rozel Point, Great Salt Lake, Utah, U.S.', null, 'avantGardeArchitecturePostwar'),
  '152': stable(
    'ap152-house-new-castle-county',
    'unitedStates',
    'New Castle County, Delaware, U.S.',
    'Private residence; the manifest uses the county-level location published by College Board.',
    'avantGardeArchitecturePostwar',
  ),
};
const REGIONS = new Set([
  'france',
  'britishIsles',
  'southernEurope',
  'centralNorthernEurope',
  'russiaSoviet',
  'unitedStates',
  'mexicoCaribbean',
  'pacific',
  'transatlantic',
]);
const TRADITION_GROUPS = new Set([
  'enlightenmentRevolution',
  'realismIndustryPhotography',
  'postImpressionismEarlyModernism',
  'avantGardeArchitecturePostwar',
]);
const MULTI_VIEW_CONTRACT = new Map([
  ['102', ['exterior', 'plan']],
  ['112', ['exterior', 'central-lobby', 'westminster-hall']],
  ['124', ['exterior', 'detail', 'plan']],
  ['135', ['exterior', 'interior-ramp']],
  ['139', ['exterior', 'living-room', 'site-plan']],
  ['152', ['exterior', 'interior']],
]);
const STEERAGE_QUALIFIER = "Photographed aboard the SS Kaiser Wilhelm II during Stieglitz's 1907 voyage from New York to Europe; the map anchor represents the transatlantic voyage rather than a fixed city.";

async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}

test('U4 manifest freezes the official AP 99-152 identity and view contract', async () => {
  const manifest = await readJson(MANIFEST_URL);
  const expectedNumbers = Array.from({ length: 54 }, (_, index) => String(index + 99));

  assert.deepEqual(Object.keys(manifest), expectedNumbers, 'AP keys and order');
  assert.deepEqual(
    Object.values(manifest).map(({ titleEn }) => titleEn),
    EXPECTED_TITLES,
    'official titles and order',
  );
  assert.deepEqual(
    Object.fromEntries(expectedNumbers.map((apNumber) => [
      apNumber,
      Object.fromEntries(STABLE_FIELDS.map((field) => [field, manifest[apNumber][field]])),
    ])),
    EXPECTED_STABLE_PROJECTION,
    'stable per-work identity and classification projection',
  );
  assert.equal(
    Object.values(manifest).reduce((total, entry) => total + entry.requiredViewIds.length, 0),
    63,
    'total College Board required views',
  );

  const representedRegions = new Set();
  const representedTraditionGroups = new Set();

  for (const apNumber of expectedNumbers) {
    const entry = manifest[apNumber];
    assert.deepEqual(Object.keys(entry), ENTRY_FIELDS, `AP ${apNumber}: field schema and order`);
    assert.match(entry.id, new RegExp(`^ap${apNumber}-[a-z0-9-]+$`), `AP ${apNumber}: id`);
    assert.ok(REGIONS.has(entry.region), `AP ${apNumber}: region`);
    assert.equal(typeof entry.siteName, 'string', `AP ${apNumber}: siteName type`);
    assert.ok(entry.siteName.trim(), `AP ${apNumber}: siteName`);
    assert.ok(
      entry.provenanceQualifier === null
        || (typeof entry.provenanceQualifier === 'string' && entry.provenanceQualifier.trim()),
      `AP ${apNumber}: provenanceQualifier`,
    );
    assert.ok(TRADITION_GROUPS.has(entry.traditionGroup), `AP ${apNumber}: traditionGroup`);
    assert.ok(Array.isArray(entry.requiredViewIds), `AP ${apNumber}: requiredViewIds type`);
    assert.ok(entry.requiredViewIds.length >= 1, `AP ${apNumber}: requiredViewIds`);
    assert.deepEqual(
      entry.requiredViewIds,
      MULTI_VIEW_CONTRACT.get(apNumber) ?? ['primary'],
      `AP ${apNumber}: exact College Board required views`,
    );
    assert.equal(
      new Set(entry.requiredViewIds).size,
      entry.requiredViewIds.length,
      `AP ${apNumber}: duplicate required view ids`,
    );
    for (const viewId of entry.requiredViewIds) {
      assert.equal(typeof viewId, 'string', `AP ${apNumber}: view id type`);
      assert.match(viewId, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `AP ${apNumber}: view id format`);
    }

    representedRegions.add(entry.region);
    representedTraditionGroups.add(entry.traditionGroup);
  }

  assert.deepEqual(representedRegions, REGIONS, 'all nine U4 regions represented');
  assert.deepEqual(
    representedTraditionGroups,
    TRADITION_GROUPS,
    'all four U4 movement groups represented',
  );
  assert.equal(manifest['127'].region, 'transatlantic', 'AP 127: voyage region');
  assert.equal(
    manifest['127'].siteName,
    'North Atlantic Ocean, aboard SS Kaiser Wilhelm II',
    'AP 127: voyage site',
  );
  assert.equal(
    manifest['127'].provenanceQualifier,
    STEERAGE_QUALIFIER,
    'AP 127: voyage qualifier',
  );
});
