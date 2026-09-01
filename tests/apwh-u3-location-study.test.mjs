import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

await import('../data/apwh-u3-location-study.js');

const api = globalThis.APWH_U3_LOCATION_STUDY;
const dataModuleSource = readFileSync(new URL('../data/apwh-u3-location-study.js', import.meta.url), 'utf8');
const ledgerSource = readFileSync(new URL('../docs/data-sources/apwh-u3-location-study-source-ledger.md', import.meta.url), 'utf8');
const prohibitedNonEnglishScripts = /[\u0400-\u052f\u0600-\u06ff\u0750-\u077f\u3400-\u9fff]/;

const replaceSource = (label, source, search, replacement) => {
  const malformedSource = source.replace(search, replacement);
  assert.notEqual(malformedSource, source, `${label} fixture mutation`);
  return malformedSource;
};
const replaceDataSource = (label, search, replacement) => replaceSource(
  label, dataModuleSource, search, replacement,
);
const replaceDataSources = (label, replacements) => {
  let malformedSource = dataModuleSource;
  for (const [search, replacement] of replacements) {
    malformedSource = replaceSource(`${label} for ${search}`, malformedSource, search, replacement);
  }
  return malformedSource;
};
const replaceAllDataSource = (label, search, replacement) => {
  const malformedSource = dataModuleSource.replaceAll(search, replacement);
  assert.notEqual(malformedSource, dataModuleSource, `${label} fixture mutation`);
  return malformedSource;
};
const parseLedgerRows = source => source.split('\n')
  .filter(line => /^\| `apwh-u3-/.test(line))
  .map(line => line.split('|').slice(1, -1)
    .map(cell => cell.trim().replace(/^`|`$/g, '')));
const assertDataModuleError = (label, malformedSource, expectedMessage) => {
  assert.throws(() => runInNewContext(malformedSource, {}), error => {
    assert.equal(error.message, expectedMessage, `${label} diagnostic`);
    return true;
  });
};

const expectedManifest = [
  ['apwh-u3-ottoman-cannon-conquest-constantinople', '18', 'Ottoman', 'Expansion', 1, 'Cannon Conquest of Constantinople', '1453', 1453, 1453, 'world-event-18-3', ['3.1', '3.4'], ['TEC', 'GOV'], ['Causation', 'Contextualization']],
  ['apwh-u3-ottoman-devshirme-janissary-system', '18', 'Ottoman', 'Administration', 2, 'Devshirme and the Janissary System', 'c. 1450–1600', 1450, 1600, 'world-event-18-3', ['3.2', '3.4'], ['GOV', 'SIO'], ['Causation', 'Comparison']],
  ['apwh-u3-ottoman-sunni-millet-imperial-architecture', '18', 'Ottoman', 'Legitimation & Conflict', 3, 'Sunni Rule, the Millet System, and Imperial Architecture', '1453–1750', 1453, 1750, 'world-event-18-3', ['3.3', '3.4'], ['CDI', 'GOV'], ['Comparison', 'CCOT']],
  ['apwh-u3-safavid-ismail-qizilbash-conquest', '19', 'Safavid', 'Expansion', 1, 'Ismail I and Qizilbash Conquest', '1501–1514', 1501, 1514, 'world-event-19-0', ['3.1', '3.4'], ['GOV', 'TEC'], ['Causation', 'Contextualization']],
  ['apwh-u3-safavid-shah-abbas-ghulams-centralization', '19', 'Safavid', 'Administration', 2, 'Shah Abbas, Ghulams, and Centralization', '1588–1629', 1588, 1629, 'world-event-19-0', ['3.2', '3.4'], ['GOV', 'SIO'], ['Causation', 'Comparison']],
  ['apwh-u3-safavid-twelver-shiism-ottoman-rivalry', '19', 'Safavid', 'Legitimation & Conflict', 3, "Twelver Shi'ism and Ottoman Rivalry", '1501–1722', 1501, 1722, 'world-event-19-0', ['3.3', '3.4'], ['CDI', 'GOV'], ['Comparison', 'CCOT']],
  ['apwh-u3-mughal-babur-gunpowder-panipat', '6', 'Mughal', 'Expansion', 1, 'Babur, Gunpowder, and Panipat', '1526', 1526, 1526, 'world-event-6-1', ['3.1', '3.4'], ['TEC', 'GOV'], ['Causation', 'Contextualization']],
  ['apwh-u3-mughal-akbar-mansabdars-zamindars', '6', 'Mughal', 'Administration', 2, "Akbar's Mansabdars and Zamindars", '1556–1605', 1556, 1605, 'world-event-6-1', ['3.2', '3.4'], ['GOV', 'ECN'], ['Causation', 'Comparison']],
  ['apwh-u3-mughal-akbar-tolerance-aurangzeb-orthodoxy', '6', 'Mughal', 'Legitimation & Conflict', 3, "From Akbar's Tolerance to Aurangzeb's Orthodoxy", '1556–1707', 1556, 1707, 'world-event-6-1', ['3.3', '3.4'], ['CDI', 'GOV'], ['CCOT', 'Causation']],
  ['apwh-u3-russia-ivan-cossacks-siberian-expansion', '25', 'Russia', 'Expansion', 1, 'Ivan IV, Cossacks, and Siberian Expansion', '1547–1639', 1547, 1639, 'world-event-25-0', ['3.1', '3.4'], ['GOV', 'ENV'], ['Causation', 'Contextualization']],
  ['apwh-u3-russia-peter-table-ranks', '25', 'Russia', 'Administration', 2, 'Peter the Great and the Table of Ranks', '1682–1725', 1682, 1725, 'world-event-25-0', ['3.2', '3.4'], ['GOV', 'SIO'], ['CCOT', 'Causation']],
  ['apwh-u3-russia-orthodox-tsardom-boyars-new-capital', '25', 'Russia', 'Legitimation & Conflict', 3, 'Orthodox Tsardom, Boyar Control, and a New Capital', '1547–1725', 1547, 1725, 'world-event-25-0', ['3.3', '3.4'], ['CDI', 'GOV'], ['CCOT', 'Contextualization']],
  ['apwh-u3-ming-qing-restoration-expansion', '5', 'Ming/Qing', 'Expansion', 1, 'From Ming Restoration to Qing Expansion', '1368–1757', 1368, 1757, 'world-event-5-0', ['3.1', '3.4'], ['GOV', 'ENV'], ['CCOT', 'Causation']],
  ['apwh-u3-ming-qing-civil-service-continuity', '5', 'Ming/Qing', 'Administration', 2, 'Civil-Service Continuity under Ming and Qing', '1368–1750', 1368, 1750, 'world-event-5-0', ['3.2', '3.4'], ['GOV', 'SIO'], ['CCOT', 'Comparison']],
  ['apwh-u3-ming-qing-manchu-confucian-ethnic-hierarchy', '5', 'Ming/Qing', 'Legitimation & Conflict', 3, 'Manchu Rule, Confucian Legitimacy, and Ethnic Hierarchy', '1644–1750', 1644, 1750, 'world-event-5-0', ['3.3', '3.4'], ['CDI', 'SIO'], ['Comparison', 'Contextualization']],
  ['apwh-u3-tokugawa-firearms-unification-japan', '14', 'Tokugawa', 'Expansion', 1, 'Firearms and the Unification of Japan', '1560–1600', 1560, 1600, 'world-event-14-0', ['3.1', '3.4'], ['TEC', 'GOV'], ['Causation', 'Contextualization']],
  ['apwh-u3-tokugawa-sankin-kotai-daimyo-control', '14', 'Tokugawa', 'Administration', 2, 'Sankin-kotai and Daimyo Control', '1635–1750', 1635, 1750, 'world-event-14-0', ['3.2', '3.4'], ['GOV', 'ECN'], ['Causation', 'Comparison']],
  ['apwh-u3-tokugawa-confucian-sakoku-hierarchy', '14', 'Tokugawa', 'Legitimation & Conflict', 3, 'Neo-Confucian Order, Sakoku, and Social Hierarchy', '1603–1750', 1603, 1750, 'world-event-14-0', ['3.3', '3.4'], ['SIO', 'CDI'], ['CCOT', 'Comparison']],
];

const recordKeys = [
  'causeStudyPointIds', 'connectionNotes', 'dateLabel', 'effectStudyPointIds', 'empire',
  'endYear', 'evidence', 'examConnection', 'examSkills', 'id', 'keyPeople', 'keyTerms',
  'lens', 'locationNumber', 'mainEventKey', 'relatedStudyPointIds', 'sequence',
  'significance', 'source', 'startYear', 'summary', 'themeIds', 'title', 'topicCodes',
];

const expectedUnitCards = {
  context: {
    id: 'apwh-u3-context-conditions-land-empire-building', kind: 'context', role: 'Unit 3 Context Card',
    title: 'Conditions for Land-Based Empire Building',
    summary: 'By c. 1450, gunpowder weapons, post-Mongol political openings, agrarian revenue systems, and inherited administrative traditions gave ambitious rulers the means to conquer large territories—and the institutions needed to govern them.',
    examSkills: ['Contextualization', 'Causation'],
    prompt: 'As you study Unit 3, distinguish the conditions rulers inherited from the new military and political changes that made rapid expansion possible.',
    takeaways: [
      'Gunpowder and artillery reduced the defensive advantage of walls and helped rulers accelerate territorial conquest.',
      'The fragmentation or weakness of earlier states created political openings for ambitious dynasties and military coalitions.',
      'Existing agrarian taxes, religious institutions, and administrative traditions gave conquerors tools for turning territory into recurring revenue.',
    ],
  },
  synthesis: {
    id: 'apwh-u3-synthesis-expansion-limits-land-power', kind: 'synthesis', role: 'Unit 3 Synthesis Card',
    title: 'How Land Empires Expanded—and Where Their Power Stopped',
    summary: 'From c. 1450 to 1750, land empires used comparable military, administrative, and legitimating strategies, but regional institutions shaped their results and their ability to compete in an increasingly oceanic world.',
    examSkills: ['Comparison', 'CCOT'],
    prompt: 'Compare two empires across expansion, administration, and legitimation. Which land-based strength could become a constraint as transoceanic networks expanded in Unit 4?',
    takeaways: [
      'Gunpowder conquest and frontier warfare created multiethnic territories faster than armies alone could govern them.',
      'Controlled officials, military elites, and local intermediaries converted conquest into taxes, while religion and monumental culture justified authority.',
      'Reliance on land revenue, court politics, and continental armies could limit sustained maritime investment as transoceanic trade networks grew.',
    ],
  },
};

const expectedCausalEdges = new Map([
  ['apwh-u3-ottoman-cannon-conquest-constantinople->apwh-u3-ottoman-devshirme-janissary-system', 'Rapid Ottoman conquest created a multiethnic governing problem that devshirme-trained soldiers and officials helped the sultan administer.'],
  ['apwh-u3-ottoman-devshirme-janissary-system->apwh-u3-ottoman-sunni-millet-imperial-architecture', 'A centrally loyal service elite supported taxation and order, while Sunni institutions, millets, and imperial architecture defined how diverse subjects fit within Ottoman rule.'],
  ['apwh-u3-safavid-ismail-qizilbash-conquest->apwh-u3-safavid-shah-abbas-ghulams-centralization', 'Ismail I won territory through Qizilbash support, but dependence on tribal warriors later encouraged Shah Abbas to build ghulam forces and a more centralized state.'],
  ['apwh-u3-safavid-shah-abbas-ghulams-centralization->apwh-u3-safavid-twelver-shiism-ottoman-rivalry', 'Centralized military and administrative power helped Safavid shahs enforce Twelver Shi\'ism, a policy that unified the dynasty while sharpening conflict with Sunni subjects and neighbors.'],
  ['apwh-u3-mughal-babur-gunpowder-panipat->apwh-u3-mughal-akbar-mansabdars-zamindars', 'Babur\'s battlefield victory created a large and diverse realm that Akbar stabilized by ranking imperial servants and working through local revenue intermediaries.'],
  ['apwh-u3-mughal-akbar-mansabdars-zamindars->apwh-u3-mughal-akbar-tolerance-aurangzeb-orthodoxy', 'Akbar\'s inclusive appointments and revenue system made cooperation with Hindu elites practical, while Aurangzeb\'s different religious policies strained that administrative settlement.'],
  ['apwh-u3-russia-ivan-cossacks-siberian-expansion->apwh-u3-russia-peter-table-ranks', 'Expansion across a vast frontier increased the Russian state\'s need for dependable soldiers and officials, which Peter tied more closely to state service through rank and reform.'],
  ['apwh-u3-russia-peter-table-ranks->apwh-u3-russia-orthodox-tsardom-boyars-new-capital', 'Compulsory state service weakened independent boyar power and supported Peter\'s effort to present an Orthodox tsardom from a new, Western-facing imperial capital.'],
  ['apwh-u3-ming-qing-restoration-expansion->apwh-u3-ming-qing-civil-service-continuity', 'Ming restoration and Qing conquest both produced large territorial states whose rulers relied on the civil-service tradition to turn military control into routine administration.'],
  ['apwh-u3-ming-qing-civil-service-continuity->apwh-u3-ming-qing-manchu-confucian-ethnic-hierarchy', 'Retaining Confucian officials helped Qing rulers claim Chinese dynastic legitimacy even as banner privileges and ethnic distinctions preserved a separate Manchu ruling identity.'],
  ['apwh-u3-tokugawa-firearms-unification-japan->apwh-u3-tokugawa-sankin-kotai-daimyo-control', 'Military unification ended prolonged warfare in Japan, but the shogunate then had to restrain daimyo through alternate attendance, hostages, and costly obligations.'],
  ['apwh-u3-tokugawa-sankin-kotai-daimyo-control->apwh-u3-tokugawa-confucian-sakoku-hierarchy', 'Control of daimyo secured the shogunate, while Neo-Confucian status rules and foreign restrictions extended that ordering logic across Tokugawa society.'],
]);

const expectedRelatedPairs = new Map([
  ['apwh-u3-ottoman-cannon-conquest-constantinople|apwh-u3-safavid-ismail-qizilbash-conquest', 'Ottoman artillery and Safavid Qizilbash mobilization both exploited regional political openings, but their different military strengths became visible in their direct rivalry.'],
  ['apwh-u3-ottoman-devshirme-janissary-system|apwh-u3-tokugawa-sankin-kotai-daimyo-control', 'Ottoman devshirme and Tokugawa alternate attendance used different forms of controlled service to reduce the independence of military elites.'],
  ['apwh-u3-mughal-akbar-tolerance-aurangzeb-orthodoxy|apwh-u3-safavid-twelver-shiism-ottoman-rivalry', 'Safavid enforcement of Shi\'ism and changing Mughal tolerance policies show how religious choices could either recruit diverse elites or intensify resistance.'],
  ['apwh-u3-ming-qing-restoration-expansion|apwh-u3-russia-ivan-cossacks-siberian-expansion', 'Russia and Qing China incorporated vast Inner Asian frontiers through military campaigns, local intermediaries, tribute, and settlement rather than overseas conquest.'],
  ['apwh-u3-ming-qing-civil-service-continuity|apwh-u3-mughal-akbar-mansabdars-zamindars', 'Ming-Qing examinations and Mughal ranked service both connected local elites to imperial administration, although they recruited and rewarded officials differently.'],
  ['apwh-u3-ming-qing-manchu-confucian-ethnic-hierarchy|apwh-u3-tokugawa-confucian-sakoku-hierarchy', 'Qing and Tokugawa rulers both used Confucian hierarchy to stabilize rule while preserving privileged identities for Manchu bannermen or samurai.'],
]);

const expectedRecordContent = [
  {
    id: 'apwh-u3-ottoman-cannon-conquest-constantinople',
    title: 'Cannon Conquest of Constantinople',
    summary: 'Mehmed II used massive cannon and a coordinated land-and-sea siege to make the Ottoman state a leading gunpowder empire by capturing Constantinople in 1453.',
    significance: 'The victory removed the Byzantine capital, secured the Bosporus, and showed how gunpowder artillery could help an ambitious dynasty break fortified political centers.',
    keyPeople: [
      { name: 'Mehmed II', role: 'The Ottoman sultan who organized the 1453 siege and made conquered Constantinople an imperial capital.' },
    ],
    keyTerms: [
      { term: 'gunpowder empire', explanation: 'A large land-based state whose rulers used firearms and artillery to conquer and hold territory.' },
      { term: 'Bosporus Strait', explanation: 'The strategic waterway at Constantinople linking the Black Sea with the Mediterranean through the Sea of Marmara.' },
    ],
    evidence: [
      'Ottoman cannon repeatedly struck the land walls during the fifty-three-day siege of 1453.',
      'After taking the city, Mehmed II made it an Ottoman capital controlling movement through the Bosporus.',
    ],
    examConnection: 'Use the siege to explain how gunpowder changed the balance between mobile rulers and fortified cities, while also identifying Byzantine weakness and Ottoman organization as conditions.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4' },
  },
  {
    id: 'apwh-u3-ottoman-devshirme-janissary-system',
    title: 'Devshirme and the Janissary System',
    summary: 'Ottoman officials recruited Christian boys through devshirme, converted and educated them, and directed the most capable into military or administrative service.',
    significance: 'Because these servants owed position and training to the sultan, they gave the central government a disciplined counterweight to hereditary nobles and provincial power holders.',
    keyPeople: [
      { name: 'Ottoman recruiting officials', role: 'Selected boys from conquered Christian communities and assigned them to education, palace service, administration, or the Janissaries.' },
    ],
    keyTerms: [
      { term: 'devshirme', explanation: 'The Ottoman levy that recruited boys from Christian communities for conversion, education, and state service.' },
      { term: 'Janissaries', explanation: 'Elite infantry trained through the devshirme system and paid to serve the Ottoman sultan.' },
    ],
    evidence: [
      'The levy drew especially from Balkan Christian communities during the fifteenth and sixteenth centuries.',
      'Some recruits became Janissaries, while others served as scribes, tax officials, administrators, or diplomats.',
    ],
    examConnection: 'Use devshirme to explain the mechanism of Ottoman centralization: controlled recruitment and training produced officials whose careers depended more on the ruler than on local kinship.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4' },
  },
  {
    id: 'apwh-u3-ottoman-sunni-millet-imperial-architecture',
    title: 'Sunni Rule, the Millet System, and Imperial Architecture',
    summary: 'Ottoman sultans claimed Sunni authority, governed recognized religious communities through millets, and used converted landmarks and new mosques to display imperial power.',
    significance: 'This combination made diversity administratively useful and projected legitimacy, yet Sunni leadership and frontier competition also sharpened rivalry with the Shi\'a Safavid state.',
    keyPeople: [
      { name: 'Suleiman I', role: 'Expanded Ottoman power while sponsoring law, mosques, fortifications, and an image of the sultan as a defender of Sunni order.' },
    ],
    keyTerms: [
      { term: 'millet system', explanation: 'The Ottoman arrangement that let recognized religious communities manage selected legal, educational, and charitable affairs under imperial authority.' },
      { term: 'imperial mosque', explanation: 'A monumental mosque commissioned to make a sultan\'s wealth, Sunni faith, and political authority visible.' },
    ],
    evidence: [
      'Ottoman rulers converted Hagia Sophia into a mosque and built major imperial complexes such as the Suleymaniye Mosque.',
      'Millet arrangements allowed Orthodox Christian, Armenian, and Jewish leaders to supervise parts of communal life while paying taxes to the empire.',
    ],
    examConnection: 'Compare Ottoman accommodation through millets with Safavid religious enforcement, then explain how each policy addressed legitimacy and produced different patterns of cohesion or conflict.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4' },
  },
  {
    id: 'apwh-u3-safavid-ismail-qizilbash-conquest',
    title: 'Ismail I and Qizilbash Conquest',
    summary: 'Ismail I used the militant loyalty of Qizilbash followers to conquer Persia and establish himself as shah in 1501.',
    significance: 'Qizilbash mobilization let a young ruler exploit post-Timurid political fragmentation, but defeat by Ottoman firearms at Chaldiran exposed the limits of cavalry-centered conquest.',
    keyPeople: [
      { name: 'Ismail I', role: 'The Safavid founder who led Qizilbash forces, conquered Persia, and proclaimed himself shah in 1501.' },
    ],
    keyTerms: [
      { term: 'Qizilbash', explanation: 'Turkic tribal warriors whose militant religious loyalty supplied the early Safavid state with its main fighting force.' },
      { term: 'Battle of Chaldiran', explanation: 'The 1514 Ottoman victory in which artillery and firearms helped defeat Safavid cavalry.' },
    ],
    evidence: [
      'Qizilbash forces helped Ismail seize Tabriz and claim the title of shah in 1501.',
      'At Chaldiran in 1514, Ottoman cannon and Janissary firearms defeated Safavid forces that relied heavily on mounted warriors.',
    ],
    examConnection: 'Use Ismail to connect political opportunity and charismatic military support to state formation, then use Chaldiran to qualify any claim that all gunpowder empires adopted firearms equally.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4' },
  },
  {
    id: 'apwh-u3-safavid-shah-abbas-ghulams-centralization',
    title: 'Shah Abbas, Ghulams, and Centralization',
    summary: 'Shah Abbas I reduced dependence on Qizilbash chiefs by expanding ghulam service, strengthening firearm units, and drawing administrators from Persian society.',
    significance: 'The reforms gave the shah a more centrally loyal military and bureaucracy, allowing Safavid rulers to collect revenue and govern without surrendering as much power to tribal commanders.',
    keyPeople: [
      { name: 'Shah Abbas I', role: 'The Safavid ruler who reorganized the army, expanded ghulam service, imported weapons, and strengthened central authority.' },
    ],
    keyTerms: [
      { term: 'ghulam', explanation: 'A military or court servant, often recruited from converted Caucasian populations, whose career depended on the Safavid shah.' },
      { term: 'Isfahan', explanation: 'The Safavid capital developed by Shah Abbas into an administrative, commercial, and monumental center of imperial rule.' },
    ],
    evidence: [
      'Abbas recruited Georgian, Armenian, and Circassian ghulams to serve in forces loyal to the crown.',
      'He made Isfahan his capital and imported firearms with European assistance to train artillery and musket units.',
    ],
    examConnection: 'Compare Safavid ghulams with Ottoman Janissaries by naming the shared centralizing problem and the different recruitment systems used to create loyal military households.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4' },
  },
  {
    id: 'apwh-u3-safavid-twelver-shiism-ottoman-rivalry',
    title: "Twelver Shi'ism and Ottoman Rivalry",
    summary: 'Safavid shahs made Twelver Shi\'ism a defining state religion and pressured a largely Sunni population to adopt it.',
    significance: 'A shared religious identity distinguished Safavid Iran and supported dynastic authority, but coercion intensified internal resistance and made rivalry with the Sunni Ottomans more durable.',
    keyPeople: [
      { name: 'Ismail I', role: 'Declared Twelver Shi\'ism the state faith and used conversion policy to distinguish Safavid rule from Sunni rivals.' },
    ],
    keyTerms: [
      { term: 'Twelver Shi\'ism', explanation: 'The Shi\'a tradition recognizing a line of twelve imams and awaiting the return of the hidden twelfth imam.' },
      { term: 'sectarian rivalry', explanation: 'Political conflict intensified by rulers defining communities through competing Sunni and Shi\'a religious identities.' },
    ],
    evidence: [
      'Safavid authorities required Sunni subjects to convert and used taxation and state patronage to encourage Shi\'a practice.',
      'Ottoman-Safavid wars contested frontier territory and trade, while a Sunni Afghan revolt led to the seizure of Isfahan in 1722.',
    ],
    examConnection: 'Use Safavid religious policy to show both sides of legitimation: a ruler can create a stronger shared identity while also producing resistance among subjects excluded by that identity.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4' },
  },
  {
    id: 'apwh-u3-mughal-babur-gunpowder-panipat',
    title: 'Babur, Gunpowder, and Panipat',
    summary: 'Babur combined field artillery, matchlock troops, and mobile cavalry to defeat the larger Delhi Sultanate army at Panipat in 1526.',
    significance: 'The battle founded Mughal rule in northern India and demonstrates how tactical coordination and an opponent\'s political weakness could make gunpowder decisive.',
    keyPeople: [
      { name: 'Babur', role: 'The Central Asian conqueror who defeated Ibrahim Lodi at Panipat and founded the Mughal Empire in India.' },
    ],
    keyTerms: [
      { term: 'Battle of Panipat', explanation: 'The 1526 battle in which Babur defeated Ibrahim Lodi and established a Mughal foothold in northern India.' },
      { term: 'field artillery', explanation: 'Mobile cannon positioned for use during a battle rather than only against walls.' },
    ],
    evidence: [
      'Babur placed cannon and matchlock troops behind a defensive line of carts at the first Battle of Panipat.',
      'His smaller force defeated Ibrahim Lodi\'s larger army, including its war elephants, on April 21, 1526.',
    ],
    examConnection: 'Use Panipat to explain that military technology mattered through deployment and organization, not as an automatic advantage detached from leadership or an opponent\'s weakness.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4' },
  },
  {
    id: 'apwh-u3-mughal-akbar-mansabdars-zamindars',
    title: "Akbar's Mansabdars and Zamindars",
    summary: 'Akbar ranked imperial servants through the mansabdar system and used zamindars to collect revenue and connect local elites to Mughal government.',
    significance: 'These institutions converted conquest into taxes and service across a diverse empire, although revenue rights could later let local officials accumulate wealth and armed independence.',
    keyPeople: [
      { name: 'Akbar', role: 'The Mughal emperor who expanded ranked imperial service, incorporated Hindu elites, and reorganized revenue administration.' },
    ],
    keyTerms: [
      { term: 'mansabdar', explanation: 'A ranked Mughal official expected to provide military or civil service according to an assigned status.' },
      { term: 'zamindar', explanation: 'A local revenue intermediary who collected taxes and connected rural producers to the Mughal state.' },
    ],
    evidence: [
      'Mansab ranks helped determine an official\'s status, pay, and obligation to supply cavalry for imperial service.',
      'Zamindars collected a share of agricultural production, and Akbar appointed both Muslim and Hindu elites to government roles.',
    ],
    examConnection: 'Compare mansabdars and zamindars with another empire\'s service elite by explaining how each institution converted local influence into revenue or military capacity for the center.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4' },
  },
  {
    id: 'apwh-u3-mughal-akbar-tolerance-aurangzeb-orthodoxy',
    title: "From Akbar's Tolerance to Aurangzeb's Orthodoxy",
    summary: 'Akbar recruited Hindu elites and reduced religious burdens, while Aurangzeb later promoted stricter Islamic policies and restored the jizya.',
    significance: 'The shift shows how religious policy altered cooperation in a Hindu-majority empire: inclusion strengthened alliances, while orthodoxy and long wars contributed to resistance and fiscal strain.',
    keyPeople: [
      { name: 'Akbar', role: 'Practiced broad religious tolerance and recruited Hindu officials to strengthen cooperation within the Mughal Empire.' },
      { name: 'Aurangzeb', role: 'Expanded Mughal territory while enforcing stricter Islamic policies that increased conflict with Hindu and Sikh communities.' },
    ],
    keyTerms: [
      { term: 'jizya', explanation: 'A tax historically imposed on non-Muslim subjects in many Islamic states, abolished by Akbar and restored by Aurangzeb.' },
      { term: 'religious tolerance', explanation: 'A policy of permitting multiple faiths to practice and participate in public life without uniform religious coercion.' },
    ],
    evidence: [
      'Akbar abolished the jizya, funded multiple religious communities, married Hindu women, and appointed Hindu zamindars.',
      'Aurangzeb restored the jizya and pursued policies and wars that provoked resistance among Marathas, Sikhs, and other subjects.',
    ],
    examConnection: 'Use the Akbar-Aurangzeb contrast for continuity and change by tracing how a change in religious legitimation affected elite cooperation, rebellion, and the cost of imperial rule.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4' },
  },
  {
    id: 'apwh-u3-russia-ivan-cossacks-siberian-expansion',
    title: 'Ivan IV, Cossacks, and Siberian Expansion',
    summary: 'From Moscow, Ivan IV conquered Volga khanates and licensed Cossacks and merchant families to push Russian power across Siberia toward the Pacific.',
    significance: 'This Moscow-centered expansion created the continental state that Peter later redirected from St. Petersburg, a city founded only in 1703, long after Ivan\'s reign.',
    keyPeople: [
      { name: 'Ivan IV', role: 'The Moscow-based tsar who conquered Kazan and Astrakhan and encouraged eastward Russian expansion.' },
      { name: 'Yermak Timofeyevich', role: 'A Cossack leader whose campaign against the Siberian Khanate opened further Russian movement eastward.' },
    ],
    keyTerms: [
      { term: 'Cossacks', explanation: 'Frontier warrior communities whose mobility and military service supported Russian expansion.' },
      { term: 'yasak', explanation: 'A fur tribute demanded by Russian authorities from Indigenous Siberian communities and used to finance frontier rule.' },
    ],
    evidence: [
      'Ivan IV captured Kazan in 1552 and Astrakhan in 1556, extending Moscow\'s control along the Volga.',
      'Cossack and merchant expeditions collected yasak across Siberia, and Russian parties reached the Pacific coast by 1639.',
    ],
    examConnection: 'Use Russia to compare continental frontier expansion with gunpowder conquest, while keeping the chronology clear: Ivan expanded from Moscow before St. Petersburg existed.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4' },
  },
  {
    id: 'apwh-u3-russia-peter-table-ranks',
    title: 'Peter the Great and the Table of Ranks',
    summary: 'Peter the Great reorganized Russia\'s military and government and used the Table of Ranks to tie elite advancement to service for the state.',
    significance: 'Service-based rank weakened the assumption that old boyar ancestry alone determined status and expanded the tsar\'s control over officers and civil administrators.',
    keyPeople: [
      { name: 'Peter the Great', role: 'The Russian tsar who pursued military, administrative, and cultural reforms to strengthen centralized state power.' },
    ],
    keyTerms: [
      { term: 'Table of Ranks', explanation: 'Peter\'s hierarchy of military, civil, and court offices that linked noble status and promotion to state service.' },
      { term: 'service nobility', explanation: 'Elites whose privileges and advancement depended on performing military or administrative duties for the ruler.' },
    ],
    evidence: [
      'Peter reorganized the army, expanded state industries, and required nobles to prepare for government or military service.',
      'The 1722 Table of Ranks arranged offices into grades through which service and promotion could confer status.',
    ],
    examConnection: 'Use the Table of Ranks as evidence of centralization by explaining how a formal promotion system redirected noble ambition into institutions controlled by the tsar.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4' },
  },
  {
    id: 'apwh-u3-russia-orthodox-tsardom-boyars-new-capital',
    title: 'Orthodox Tsardom, Boyar Control, and a New Capital',
    summary: 'Russian rulers joined Orthodox tsarist claims with coercion of boyars, while Peter founded St. Petersburg as a Western-facing capital and center of court service.',
    significance: 'Religious title, compulsory service, and capital relocation made imperial authority visible, but they also imposed heavy labor, tax, and cultural demands on Russian society.',
    keyPeople: [
      { name: 'Peter the Great', role: 'Founded St. Petersburg, moved the court toward the Baltic, and compelled nobles to serve within his reformed state.' },
    ],
    keyTerms: [
      { term: 'tsar', explanation: 'The Russian imperial title derived from Caesar and associated with autocratic and Orthodox authority.' },
      { term: 'St. Petersburg', explanation: 'The Baltic city Peter founded in 1703 and developed as a Western-facing capital and center for court service.' },
    ],
    evidence: [
      'Ivan IV was crowned tsar in 1547 and confiscated land from boyars who resisted his authority.',
      'Peter founded St. Petersburg in 1703 on Baltic territory and later moved the capital there, requiring nobles to maintain a presence near his court.',
    ],
    examConnection: 'Use St. Petersburg as legitimation evidence only with chronology: connect Peter\'s new capital to Westernization and boyar control rather than to Ivan IV\'s earlier conquests.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4' },
  },
  {
    id: 'apwh-u3-ming-qing-restoration-expansion',
    title: 'From Ming Restoration to Qing Expansion',
    summary: 'The Ming restored Chinese rule after the Yuan in 1368, while the Manchu Qing conquered the Ming realm and later expanded into Taiwan, Mongolia, Tibet, and Xinjiang.',
    significance: 'The sequence combines dynastic change with territorial growth: Ming restoration rebuilt a Chinese state, whereas Qing campaigns created a larger multiethnic Inner Asian empire.',
    keyPeople: [
      { name: 'Zhu Yuanzhang', role: 'Overthrew Yuan rule and founded the Ming dynasty as the Hongwu Emperor in 1368.' },
      { name: 'Qianlong Emperor', role: 'Directed eighteenth-century Qing campaigns that incorporated Xinjiang and extended influence across Inner Asia.' },
    ],
    keyTerms: [
      { term: 'dynastic restoration', explanation: 'The reestablishment of Chinese dynastic rule and institutions after the fall of the Mongol-led Yuan dynasty.' },
      { term: 'frontier expansion', explanation: 'The extension of imperial control into borderlands through war, alliances, garrisons, tribute, or administration.' },
    ],
    evidence: [
      'Zhu Yuanzhang defeated the Yuan and established the Ming dynasty in 1368.',
      'Kangxi campaigned in Taiwan and Mongolia, while Qianlong\'s forces conquered Xinjiang in the 1750s and intervened in Tibet.',
    ],
    examConnection: 'Use this case for continuity and change by separating Ming restoration from Qing expansion, then compare Qing frontier incorporation with Russian movement across Siberia.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4' },
  },
  {
    id: 'apwh-u3-ming-qing-civil-service-continuity',
    title: 'Civil-Service Continuity under Ming and Qing',
    summary: 'Ming rulers restored schools, examinations, and scholar-official government after Yuan rule, and Qing emperors retained those institutions to administer China.',
    significance: 'Civil-service continuity supplied trained officials and linked both dynasties to Confucian political expectations, even though Manchu rulers also preserved separate conquest institutions.',
    keyPeople: [
      { name: 'scholar-gentry', role: 'Educated elites who prepared for examinations, staffed government offices, and connected imperial policy with local society.' },
    ],
    keyTerms: [
      { term: 'civil-service examination', explanation: 'A competitive test centered on Confucian learning that selected candidates for imperial office.' },
      { term: 'Confucian classics', explanation: 'Canonical texts studied by examination candidates and used to define the moral and political learning expected of officials.' },
    ],
    evidence: [
      'The Ming restored examination schools and rebuilt a Confucian bureaucracy weakened under the Yuan.',
      'Qing emperors continued the examination system and employed Chinese scholar-officials across the civil administration.',
    ],
    examConnection: 'Use the examination system as continuity evidence while qualifying the claim: Qing rulers kept Chinese civil administration alongside Manchu banners and ethnic privileges.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4' },
  },
  {
    id: 'apwh-u3-ming-qing-manchu-confucian-ethnic-hierarchy',
    title: 'Manchu Rule, Confucian Legitimacy, and Ethnic Hierarchy',
    summary: 'Qing rulers performed Confucian emperorship and preserved Chinese institutions while maintaining Manchu banners, marriage boundaries, and visible signs of conquest.',
    significance: 'This dual strategy made Manchu rulers legible as Chinese emperors without dissolving the privileged identity that supported their military and political dominance.',
    keyPeople: [
      { name: 'Kangxi Emperor', role: 'A Qing ruler who patronized Confucian learning and governed through Chinese institutions while preserving Manchu imperial power.' },
    ],
    keyTerms: [
      { term: 'banner system', explanation: 'The Manchu military and social organization that grouped households into hereditary units with privileged service roles.' },
      { term: 'queue', explanation: 'The hairstyle Qing authorities required male subjects to adopt as a visible sign of submission to Manchu rule.' },
    ],
    evidence: [
      'Qing emperors sponsored Confucian scholarship, performed Chinese imperial rituals, and continued civil-service examinations.',
      'Manchu bannermen held protected status, and the queue order made political obedience visible among conquered male subjects.',
    ],
    examConnection: 'Explain Qing legitimacy as a both-and strategy: Confucian continuity recruited Chinese elites, while ethnic hierarchy preserved the ruling group produced by conquest.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4' },
  },
  {
    id: 'apwh-u3-tokugawa-firearms-unification-japan',
    title: 'Firearms and the Unification of Japan',
    summary: 'In Japan, Oda Nobunaga and Toyotomi Hideyoshi used firearms, castle warfare, alliances, and disarmament to defeat rivals before Tokugawa victory completed unification.',
    significance: 'Unification ended the prolonged competition of the warring-states era and created the territorial and military foundation for a shogunate centered at Edo.',
    keyPeople: [
      { name: 'Oda Nobunaga', role: 'A Japanese unifier who armed troops with imported muskets and defeated rival daimyo during the late sixteenth century.' },
      { name: 'Toyotomi Hideyoshi', role: 'Continued unification and ordered a sword hunt that separated armed warriors from cultivators.' },
    ],
    keyTerms: [
      { term: 'arquebus', explanation: 'An early matchlock firearm introduced to Japan through Portuguese contact and adopted by competing armies.' },
      { term: 'Battle of Sekigahara', explanation: 'Tokugawa Ieyasu\'s decisive 1600 victory over rival coalitions, which completed the military foundation for Tokugawa rule.' },
    ],
    evidence: [
      'Nobunaga equipped forces with Portuguese-style matchlocks and used organized firearm volleys against rival armies.',
      'Hideyoshi\'s 1588 sword hunt ordered peasants to surrender weapons, while Tokugawa Ieyasu won supremacy at Sekigahara in 1600.',
    ],
    examConnection: 'Use Japan to show that firearms aided unification through tactical adoption, then connect disarmament to the governance problem created after military victory.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4' },
  },
  {
    id: 'apwh-u3-tokugawa-sankin-kotai-daimyo-control',
    title: 'Sankin-kotai and Daimyo Control',
    summary: 'The Tokugawa shogunate required daimyo to alternate residence between their domains and Edo while their families remained near the shogun.',
    significance: 'Alternate attendance limited rebellion by keeping lords under observation and forcing them to spend resources on travel and duplicate households instead of independent armies.',
    keyPeople: [
      { name: 'Tokugawa Iemitsu', role: 'The shogun whose government formalized alternate-attendance obligations for daimyo in the 1630s.' },
    ],
    keyTerms: [
      { term: 'sankin-kotai', explanation: 'The alternate-attendance system requiring daimyo to divide their time between Edo and their domains.' },
      { term: 'daimyo', explanation: 'A Japanese domain lord who retained local authority but remained subordinate to the Tokugawa shogunate.' },
    ],
    evidence: [
      'A 1635 regulation formalized regular daimyo residence at Edo and recurring travel to their domains.',
      'Daimyo maintained two residences, while wives and heirs commonly remained in Edo as guarantees of loyalty.',
    ],
    examConnection: 'Compare sankin-kotai with another ruler\'s control of nobles by explaining how surveillance, hostages, and required spending reduced the resources available for rebellion.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4' },
  },
  {
    id: 'apwh-u3-tokugawa-confucian-sakoku-hierarchy',
    title: 'Neo-Confucian Order, Sakoku, and Social Hierarchy',
    summary: 'Tokugawa rulers promoted a Neo-Confucian status order and restricted most foreign contact while permitting tightly supervised exchange through selected ports.',
    significance: 'Hierarchy and maritime restriction supported domestic stability and shogunal authority, but they fixed inherited status distinctions and narrowed channels for external exchange.',
    keyPeople: [
      { name: 'Tokugawa shoguns', role: 'Enforced social distinctions, suppressed Christianity, and regulated foreign merchants to protect the political order.' },
    ],
    keyTerms: [
      { term: 'sakoku', explanation: 'The Tokugawa system of restricted foreign relations, controlled travel, and tightly limited overseas trade.' },
      { term: 'Neo-Confucian hierarchy', explanation: 'A social ordering that emphasized duty and ranked samurai, peasants, artisans, and merchants in an idealized status system.' },
    ],
    evidence: [
      'Tokugawa policies fixed samurai as a privileged warrior status and organized other occupations within an official hierarchy.',
      'In the 1630s the shogunate expelled most Europeans, suppressed Christianity, and confined Dutch trade to a controlled site at Nagasaki.',
    ],
    examConnection: 'Use Tokugawa policy for comparison and continuity by separating restricted diplomacy from total isolation and linking hierarchy to the shogunate\'s need for political order.',
    source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4' },
  },
];

const expectedTermPairs = [
  ['gunpowder empire', 'Bosporus Strait'],
  ['devshirme', 'Janissaries'],
  ['millet system', 'imperial mosque'],
  ['Qizilbash', 'Battle of Chaldiran'],
  ['ghulam', 'Isfahan'],
  ["Twelver Shi'ism", 'sectarian rivalry'],
  ['Battle of Panipat', 'field artillery'],
  ['mansabdar', 'zamindar'],
  ['jizya', 'religious tolerance'],
  ['Cossacks', 'yasak'],
  ['Table of Ranks', 'service nobility'],
  ['tsar', 'St. Petersburg'],
  ['dynastic restoration', 'frontier expansion'],
  ['civil-service examination', 'Confucian classics'],
  ['banner system', 'queue'],
  ['arquebus', 'Battle of Sekigahara'],
  ['sankin-kotai', 'daimyo'],
  ['sakoku', 'Neo-Confucian hierarchy'],
];

const expectedLedgerRows = [
  ['apwh-u3-ottoman-cannon-conquest-constantinople', 'Topics 3.1 and 3.4', 'world-event-18-3', 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4', 'Mehmed II; gunpowder empire and Bosporus Strait; massive cannon, the fifty-three-day 1453 siege, Constantinople as capital, and rapid conquest creating an Ottoman administration problem'],
  ['apwh-u3-ottoman-devshirme-janissary-system', 'Topics 3.2 and 3.4', 'world-event-18-3', 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4', 'Ottoman recruiting officials; devshirme and Janissaries; recruitment of Christian boys, military and civil training, salaried loyalty to the sultan, and controlled service answering the governance problem created by conquest'],
  ['apwh-u3-ottoman-sunni-millet-imperial-architecture', 'Topics 3.3 and 3.4', 'world-event-18-3', 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4', 'Suleiman I; millet system and imperial mosque; Hagia Sophia, the Suleymaniye Mosque, communal self-government, Sunni legitimacy, and centralized service shaping diversity and Ottoman-Safavid conflict'],
  ['apwh-u3-safavid-ismail-qizilbash-conquest', 'Topics 3.1 and 3.4', 'world-event-19-0', 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4', 'Ismail I; Qizilbash and Battle of Chaldiran; the 1501 seizure of Tabriz, the shah title, the 1514 defeat by Ottoman firearms, and dependence on tribal warriors prompting later centralization'],
  ['apwh-u3-safavid-shah-abbas-ghulams-centralization', 'Topics 3.2 and 3.4', 'world-event-19-0', 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4', 'Shah Abbas I; ghulam and Isfahan; Caucasian recruitment, firearm and artillery training, the imperial capital, reduced Qizilbash power, and centralization enabling stronger religious enforcement'],
  ['apwh-u3-safavid-twelver-shiism-ottoman-rivalry', 'Topics 3.3 and 3.4', 'world-event-19-0', 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4', "Ismail I; Twelver Shi'ism and sectarian rivalry; coerced Sunni conversion, Ottoman border and trade conflict, the 1722 Afghan seizure of Isfahan, and centralized religious policy producing identity and resistance"],
  ['apwh-u3-mughal-babur-gunpowder-panipat', 'Topics 3.1 and 3.4', 'world-event-6-1', 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4', "Babur; Battle of Panipat and field artillery; cart defenses, cannon, matchlocks, Ibrahim Lodi's larger army and war elephants, the 1526 Mughal victory, and conquest creating a diverse realm requiring administration"],
  ['apwh-u3-mughal-akbar-mansabdars-zamindars', 'Topics 3.2 and 3.4', 'world-event-6-1', 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4', 'Akbar; mansabdar and zamindar; ranked pay and cavalry obligations, agricultural tax collection, Hindu appointments, conquest converted into revenue, and inclusive administration supporting religious cooperation'],
  ['apwh-u3-mughal-akbar-tolerance-aurangzeb-orthodoxy', 'Topics 3.3 and 3.4', 'world-event-6-1', 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4', "Akbar and Aurangzeb; jizya and religious tolerance; abolition and restoration of the tax, Hindu appointments, support for multiple faiths, Maratha and Sikh resistance, and changing legitimation straining Akbar's administrative settlement"],
  ['apwh-u3-russia-ivan-cossacks-siberian-expansion', 'Topics 3.1 and 3.4', 'world-event-25-0', 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4', 'Ivan IV and Yermak Timofeyevich; Cossacks and yasak; Moscow, Kazan, Astrakhan, Siberian fur tribute, the 1639 Pacific advance, and vast frontier growth increasing the need for dependable state servants'],
  ['apwh-u3-russia-peter-table-ranks', 'Topics 3.2 and 3.4', 'world-event-25-0', 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4', 'Peter the Great; Table of Ranks and service nobility; army and state-industry reform, the 1722 hierarchy of offices, promotion through service, weakened hereditary boyar independence, and administration supporting a new capital'],
  ['apwh-u3-russia-orthodox-tsardom-boyars-new-capital', 'Topics 3.3 and 3.4', 'world-event-25-0', 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4', "Peter the Great; tsar and St. Petersburg; Ivan IV's 1547 coronation and boyar confiscations, Peter's 1703 Baltic foundation and later capital move, Orthodox autocracy, Westernization, and compulsory service reinforcing court control"],
  ['apwh-u3-ming-qing-restoration-expansion', 'Topics 3.1 and 3.4', 'world-event-5-0', 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4', "Zhu Yuanzhang and Qianlong Emperor; dynastic restoration and frontier expansion; the 1368 fall of Yuan rule, Manchu conquest, Kangxi campaigns, Qianlong's Xinjiang conquest and Tibetan intervention, and territorial growth requiring civil administration"],
  ['apwh-u3-ming-qing-civil-service-continuity', 'Topics 3.2 and 3.4', 'world-event-5-0', 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4', 'Scholar-gentry; civil-service examination and Confucian classics; Ming restoration of schools and bureaucracy, Qing retention of Chinese officials, administrative continuity, and examination government supporting Qing Confucian legitimacy'],
  ['apwh-u3-ming-qing-manchu-confucian-ethnic-hierarchy', 'Topics 3.3 and 3.4', 'world-event-5-0', 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4', 'Kangxi Emperor; banner system and queue; Confucian scholarship, Chinese imperial ritual, civil-service continuity, bannerman privilege, visible submission, and administration enabling combined Confucian legitimacy and Manchu hierarchy'],
  ['apwh-u3-tokugawa-firearms-unification-japan', 'Topics 3.1 and 3.4', 'world-event-14-0', 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4', "Oda Nobunaga, Toyotomi Hideyoshi, and Tokugawa Ieyasu; arquebus and Battle of Sekigahara; firearm volleys, the 1588 sword hunt, Ieyasu's decisive 1600 victory, Japan's unification, and victory creating the daimyo-control problem"],
  ['apwh-u3-tokugawa-sankin-kotai-daimyo-control', 'Topics 3.2 and 3.4', 'world-event-14-0', 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4', 'Tokugawa Iemitsu; sankin-kotai and daimyo; the 1635 alternate-attendance rule, Edo residences, family hostages, travel and household expense, reduced military independence, and elite control supporting wider social ordering'],
  ['apwh-u3-tokugawa-confucian-sakoku-hierarchy', 'Topics 3.3 and 3.4', 'world-event-14-0', 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4', 'Tokugawa shoguns; sakoku and Neo-Confucian hierarchy; samurai privilege, occupational ranks, 1630s expulsions, Christian suppression, controlled Dutch trade at Nagasaki, and daimyo control extending into social and foreign policy'],
];

test('publishes the exact Unit 3 empire-by-lens manifest', () => {
  assert.equal(api.unitId, 'u3');
  assert.equal(api.unitNumber, 3);
  assert.deepEqual([...api.locationNumbers], ['5', '6', '14', '18', '19', '25']);
  assert.equal(api.records.length, 18);
  for (const number of api.locationNumbers) assert.equal(api.getByLocation(number).length, 3, number);
  assert.deepEqual(api.records.map(record => [
    record.id, record.locationNumber, record.empire, record.lens, record.sequence,
    record.title, record.dateLabel, record.startYear, record.endYear, record.mainEventKey,
    [...record.topicCodes], [...record.themeIds], [...record.examSkills],
  ]), expectedManifest);
  for (const record of api.records) assert.deepEqual(Object.keys(record).sort(), recordKeys);
});

test('locks the complete learner copy and source metadata for all eighteen Unit 3 records', () => {
  const contentKeys = [
    'id', 'title', 'summary', 'significance', 'keyPeople', 'keyTerms',
    'evidence', 'examConnection', 'source',
  ];
  assert.deepEqual(api.records.map(record => Object.fromEntries(
    contentKeys.map(key => [key, record[key]]),
  )), expectedRecordContent);
  assert.deepEqual(api.records.map(record => record.keyTerms.map(entry => entry.term)), expectedTermPairs);
});

test('publishes one exact Expansion, Administration, and Legitimation & Conflict sequence per empire', () => {
  const expectedEmpires = ['Ming/Qing', 'Mughal', 'Tokugawa', 'Ottoman', 'Safavid', 'Russia'];
  assert.deepEqual(api.locationNumbers.map(number => api.getByLocation(number)[0].empire), expectedEmpires);
  for (const locationNumber of api.locationNumbers) {
    const records = [...api.getByLocation(locationNumber)].sort((a, b) => a.sequence - b.sequence);
    assert.deepEqual(records.map(record => [record.lens, record.sequence]), [
      ['Expansion', 1], ['Administration', 2], ['Legitimation & Conflict', 3],
    ]);
    assert.equal(new Set(records.map(record => record.empire)).size, 1);
  }
});

test('publishes exact immutable Unit 3 cards outside map records', () => {
  assert.deepEqual(api.unitCards, expectedUnitCards);
  for (const kind of ['toString', 'constructor', '__proto__', 'missing']) assert.equal(api.getUnitCard(kind), null);
  for (const card of Object.values(api.unitCards)) {
    assert.ok(Object.isFrozen(card));
    assert.ok(Object.isFrozen(card.examSkills));
    assert.ok(Object.isFrozen(card.takeaways));
    assert.ok(!api.records.includes(card));
    assert.ok(!api.locationNumbers.some(number => api.getByLocation(number).includes(card)));
  }
});

test('ships complete rich English learner records with exact skills and deep immutability', () => {
  for (const [index, record] of api.records.entries()) {
    assert.doesNotMatch(JSON.stringify(record), prohibitedNonEnglishScripts);
    assert.match(record.summary, /[A-Za-z]/);
    assert.ok(record.significance.length >= 60, `${record.id} significance`);
    assert.ok(record.examConnection.length >= 60, `${record.id} examConnection`);
    assert.ok(record.keyPeople.length >= 1, `${record.id} keyPeople`);
    assert.ok(record.keyTerms.length >= 2, `${record.id} keyTerms`);
    assert.ok(record.evidence.length >= 2, `${record.id} evidence`);
    assert.deepEqual(record.examSkills, expectedManifest[index][12], `${record.id} skills`);
    assert.ok(record.keyPeople.every(person => Object.keys(person).sort().join(',') === 'name,role'));
    assert.ok(record.keyTerms.every(term => Object.keys(term).sort().join(',') === 'explanation,term'));
    assert.deepEqual(Object.keys(record.source).sort(), ['id', 'locator']);
    assert.equal(record.source.id, 'amsco-apwh-u3');
    const topicLabel = record.topicCodes.length === 1
      ? `Topic ${record.topicCodes[0]}`
      : `Topics ${record.topicCodes.slice(0, -1).join(', ')}${record.topicCodes.length > 2 ? ',' : ''} and ${record.topicCodes.at(-1)}`;
    assert.equal(record.source.locator, `AMSCO AP World History, Unit 3, ${topicLabel}`);
    const learnerStrings = [
      record.title, record.summary, record.significance, record.examConnection,
      ...record.keyPeople.flatMap(person => [person.name, person.role]),
      ...record.keyTerms.flatMap(term => [term.term, term.explanation]),
      ...record.evidence, record.source.locator,
    ];
    assert.ok(learnerStrings.every(value => typeof value === 'string' && /[A-Za-z]/.test(value)),
      `${record.id} English learner strings`);
    assert.ok(Object.isFrozen(record) && Object.isFrozen(record.keyPeople)
      && record.keyPeople.every(Object.isFrozen) && Object.isFrozen(record.keyTerms)
      && record.keyTerms.every(Object.isFrozen) && Object.isFrozen(record.evidence)
      && Object.isFrozen(record.source) && Object.isFrozen(record.topicCodes)
      && Object.isFrozen(record.themeIds) && Object.isFrozen(record.examSkills)
      && Object.isFrozen(record.causeStudyPointIds) && Object.isFrozen(record.effectStudyPointIds)
      && Object.isFrozen(record.relatedStudyPointIds) && Object.isFrozen(record.connectionNotes));
  }
  assert.ok(Object.isFrozen(api));
  assert.ok(Object.isFrozen(api.records));
  assert.ok(Object.isFrozen(api.locationNumbers));
  assert.ok(Object.isFrozen(api.unitCards));
});

test('keeps chronology and map geography explicit in the learner copy', () => {
  const russia = api.getById('apwh-u3-russia-ivan-cossacks-siberian-expansion');
  assert.match(russia.summary, /Moscow/i);
  assert.match(russia.significance, /St\. Petersburg/);
  assert.match(russia.significance, /1703/);
  const mingQing = api.getById('apwh-u3-ming-qing-restoration-expansion');
  assert.match(mingQing.summary, /Ming/);
  assert.match(mingQing.summary, /Qing/);
  assert.match(api.getById('apwh-u3-tokugawa-firearms-unification-japan').summary, /Japan/);
});

test('publishes exact causal chains and related comparison pairs with reciprocal English notes', () => {
  const causal = new Map();
  const related = new Map();
  const categoryReciprocals = {
    causeStudyPointIds: 'effectStudyPointIds',
    effectStudyPointIds: 'causeStudyPointIds',
    relatedStudyPointIds: 'relatedStudyPointIds',
  };
  for (const record of api.records) {
    const seen = new Set();
    for (const [category, reciprocal] of Object.entries(categoryReciprocals)) {
      assert.equal(new Set(record[category]).size, record[category].length, `${record.id} ${category} duplicate`);
      for (const targetId of record[category]) {
        assert.notEqual(targetId, record.id, `${record.id} self link`);
        assert.ok(!seen.has(targetId), `${record.id} cross-category ${targetId}`);
        seen.add(targetId);
        const target = api.getById(targetId);
        assert.ok(target, `${record.id} unresolved ${targetId}`);
        assert.ok(target[reciprocal].includes(record.id), `${record.id} nonreciprocal ${targetId}`);
        assert.match(record.connectionNotes[targetId], /[A-Za-z]/);
        assert.doesNotMatch(record.connectionNotes[targetId], prohibitedNonEnglishScripts);
        assert.equal(target.connectionNotes[record.id], record.connectionNotes[targetId]);
        if (category === 'effectStudyPointIds') {
          causal.set(`${record.id}->${targetId}`, record.connectionNotes[targetId]);
        }
        if (category === 'relatedStudyPointIds') {
          related.set([record.id, targetId].sort().join('|'), record.connectionNotes[targetId]);
        }
      }
    }
    assert.ok(seen.size >= 1, `${record.id} must have a connection`);
    assert.deepEqual(Object.keys(record.connectionNotes).sort(), [...seen].sort());
  }
  assert.deepEqual(causal, expectedCausalEdges);
  assert.deepEqual(related, expectedRelatedPairs);
});

test('locks all five English source-ledger columns for exactly eighteen Unit 3 records', () => {
  assert.doesNotMatch(ledgerSource, prohibitedNonEnglishScripts);
  const rows = parseLedgerRows(ledgerSource);
  assert.equal(rows.length, 18);
  assert.ok(rows.every(row => row.length === 5 && row.every(cell => /[A-Za-z0-9]/.test(cell))));
  assert.deepEqual(rows, expectedLedgerRows);
  const ledgerById = new Map(rows.map(row => [row[0], row]));
  for (const [index, content] of expectedRecordContent.entries()) {
    const ledgerRow = ledgerById.get(content.id);
    assert.equal(ledgerRow[2], expectedManifest[index][9], `${content.id} ledger main event`);
    assert.equal(ledgerRow[3], content.source.locator, `${content.id} ledger source locator`);
  }
});

test('returns defensive lookup arrays, stable identities, map names, and a locked global', () => {
  const expectedNames = {
    5: 'Beijing', 6: 'Delhi', 14: 'Edo/Tokyo', 18: 'Istanbul', 19: 'Isfahan', 25: 'St. Petersburg',
  };
  for (const record of api.records) assert.equal(api.getById(record.id), record);
  for (const [number, name] of Object.entries(expectedNames)) assert.equal(api.locationName(number), name);
  const first = api.getByLocation('18');
  first.pop();
  assert.equal(api.getByLocation('18').length, 3);
  for (const invalid of ['toString', 'constructor', '__proto__', 'missing']) {
    assert.equal(api.getById(invalid), null);
    assert.deepEqual(api.getByLocation(invalid), []);
    assert.equal(api.locationName(invalid), null);
  }
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'APWH_U3_LOCATION_STUDY');
  assert.equal(descriptor.writable, false);
  assert.equal(descriptor.configurable, false);
});

test('refuses to overwrite an existing Unit 3 browser global', () => {
  assert.throws(
    () => runInNewContext(dataModuleSource, { APWH_U3_LOCATION_STUDY: { existing: true } }),
    /Invalid Unit 3 global APWH_U3_LOCATION_STUDY: refusing to overwrite existing value/,
  );
});

test('comparator uses sequence, start, end, and id tie breakers', () => {
  const records = [
    { id: 'z', sequence: 2, startYear: 1450, endYear: 1600 },
    { id: 'a', sequence: 2, startYear: 1450, endYear: 1600 },
    { id: 'end', sequence: 2, startYear: 1450, endYear: 1500 },
    { id: 'start', sequence: 2, startYear: 1368, endYear: 1750 },
    { id: 'sequence', sequence: 1, startYear: 2000, endYear: 2000 },
  ];
  assert.deepEqual([...records].sort(api.compareRecords).map(record => record.id),
    ['sequence', 'start', 'end', 'a', 'z']);
});

const mutateManifest = (label, statement) => replaceDataSource(
  label,
  /(\n\s*validateManifestRows\(STUDY_MANIFEST\);)/,
  `\n  ${statement}$1`,
);
const mutateRawRecord = (label, statement) => replaceDataSource(
  label,
  /(\n\s*function freezeUnitCard\(card\)\s*\{)/,
  `\n  ${statement}$1`,
);
const mutateCoherentLocationBinding = (label, manifestStatement, rawStatement) => replaceDataSources(
  label,
  [
    [/(\n\s*validateManifestRows\(STUDY_MANIFEST\);)/, `\n  ${manifestStatement}$1`],
    [/(\n\s*function freezeUnitCard\(card\)\s*\{)/, `\n  ${rawStatement}$1`],
  ],
);
const mutateUnitCards = (label, statement) => replaceDataSource(
  label,
  /(\n\s*function describeRuleValue\(value\)\s*\{)/,
  `\n  ${statement}$1`,
);

const firstId = 'apwh-u3-ottoman-cannon-conquest-constantinople';

const invalidManifestCases = [
  ['invalid sequence', 'STUDY_MANIFEST[0][4] = 4;', 'invalid sequence 4'],
  ['missing topic', 'STUDY_MANIFEST[0][10] = [];', 'missing topicCodes'],
  ['invalid topic', "STUDY_MANIFEST[0][10] = ['9.9', '3.4'];", 'invalid topicCode 9.9'],
  ['duplicate topic', "STUDY_MANIFEST[0][10] = ['3.1', '3.1'];", 'duplicate topicCode 3.1'],
  ['missing theme', 'STUDY_MANIFEST[0][11] = [];', 'missing themeIds'],
  ['invalid theme', "STUDY_MANIFEST[0][11] = ['BAD'];", 'invalid themeId BAD'],
  ['duplicate theme', "STUDY_MANIFEST[0][11] = ['TEC', 'TEC'];", 'duplicate themeId TEC'],
  ['missing skill', 'STUDY_MANIFEST[0][12] = [];', 'missing examSkills'],
  ['invalid skill', "STUDY_MANIFEST[0][12] = ['Causation', 'Argumentation'];", 'invalid examSkill Argumentation'],
  ['duplicate skill', "STUDY_MANIFEST[0][12] = ['Causation', 'Causation'];", 'duplicate examSkill Causation'],
  ['oversized skills', "STUDY_MANIFEST[0][12] = ['Causation', 'Contextualization', 'Comparison'];", 'too many examSkills'],
];
for (const [label, statement, rule] of invalidManifestCases) {
  test(`rejects ${label} with a descriptive Unit 3 diagnostic`, () => {
    assertDataModuleError(label, mutateManifest(label, statement), `Invalid Unit 3 study record ${firstId}: ${rule}`);
  });
}

test('rejects malformed manifest rows before deriving study context', () => {
  const cases = [
    ['null manifest row', 'STUDY_MANIFEST[0] = null;', '(missing ID)', 'manifest row must be a thirteen-field array'],
    ['short manifest row', `STUDY_MANIFEST[0] = ['${firstId}'];`, firstId, 'manifest row must be a thirteen-field array'],
    ['non-array topicCodes', "STUDY_MANIFEST[0][10] = '3.1';", firstId, 'topicCodes must be an array'],
    ['non-array themeIds', "STUDY_MANIFEST[0][11] = 'GOV';", firstId, 'themeIds must be an array'],
    ['non-array examSkills', "STUDY_MANIFEST[0][12] = 'Causation';", firstId, 'examSkills must be an array'],
  ];
  for (const [label, statement, diagnosticId, rule] of cases) {
    assertDataModuleError(label, mutateManifest(label, statement),
      `Invalid Unit 3 study record ${diagnosticId}: ${rule}`);
  }
});

test('rejects raw location, empire, lens, and main-event mutations independently of the manifest', () => {
  const cases = [
    ['raw location', "RAW_RECORDS[0].locationNumber = '999';", 'invalid locationNumber 999'],
    ['raw empire', "RAW_RECORDS[0].empire = 'Roman';", 'invalid empire Roman'],
    ['raw lens', "RAW_RECORDS[0].lens = 'Economy';", 'invalid lens Economy'],
    ['raw main event', "RAW_RECORDS[0].mainEventKey = 'world-event-18-99';", 'invalid mainEventKey world-event-18-99'],
  ];
  for (const [label, statement, rule] of cases) {
    assertDataModuleError(label, mutateRawRecord(label, statement),
      `Invalid Unit 3 study record ${firstId}: ${rule}`);
  }
});

const rawCanonicalBindingCases = [
  ['empire', "RAW_RECORDS[0].empire = 'Safavid';", 'invalid empire Safavid for location 18'],
  ['main event', "RAW_RECORDS[0].mainEventKey = 'world-event-19-0';", 'invalid mainEventKey world-event-19-0 for location 18'],
];
for (const [binding, statement, rule] of rawCanonicalBindingCases) {
  test(`rejects a valid-but-wrong raw ${binding} binding independently of the manifest`, () => {
    const label = `raw canonical ${binding}`;
    assertDataModuleError(label, mutateRawRecord(label, statement),
      `Invalid Unit 3 study record ${firstId}: ${rule}`);
  });
}

const coherentBindingCases = [
  [
    'empire',
    "for (const index of [0, 1, 2]) STUDY_MANIFEST[index][2] = 'Safavid';",
    "for (const record of RAW_RECORDS.filter(item => item.locationNumber === '18')) record.empire = 'Safavid';",
    'invalid empire Safavid for location 18',
  ],
  [
    'main event',
    "for (const index of [0, 1, 2]) STUDY_MANIFEST[index][9] = 'world-event-19-0';",
    "for (const record of RAW_RECORDS.filter(item => item.locationNumber === '18')) record.mainEventKey = 'world-event-19-0';",
    'invalid mainEventKey world-event-19-0 for location 18',
  ],
];
for (const [binding, manifestStatement, rawStatement, rule] of coherentBindingCases) {
  test(`rejects a coherent valid-but-wrong ${binding} substitution for a location`, () => {
    const label = `coherent wrong ${binding}`;
    assertDataModuleError(
      label,
      mutateCoherentLocationBinding(label, manifestStatement, rawStatement),
      `Invalid Unit 3 study record ${firstId}: ${rule}`,
    );
  });
}

test('rejects malformed date labels, ranges, and label-year disagreement', () => {
  const cases = [
    ['malformed date', "RAW_RECORDS[0].dateLabel = '1453/1453';", 'invalid dateLabel 1453/1453'],
    ['non-integer start', "RAW_RECORDS[0].startYear = '1453';", 'startYear must be an integer'],
    ['reversed range', 'RAW_RECORDS[0].startYear = 1454;', 'startYear 1454 exceeds endYear 1453'],
    ['label-year mismatch', "RAW_RECORDS[0].dateLabel = '1454';", 'dateLabel years 1454–1454 do not match startYear 1453 and endYear 1453'],
  ];
  for (const [label, statement, rule] of cases) {
    assertDataModuleError(label, mutateRawRecord(label, statement),
      `Invalid Unit 3 study record ${firstId}: ${rule}`);
  }
});

test('rejects non-English scripts, numeric-only text, and structurally malformed learner copy', () => {
  const cases = [
    ['Chinese copy', "RAW_RECORDS[0].summary = `中文 ${RAW_RECORDS[0].summary}`;", 'non-English summary'],
    ['Cyrillic copy', "RAW_RECORDS[0].summary = `Москва ${RAW_RECORDS[0].summary}`;", 'non-English summary'],
    ['Arabic copy', "RAW_RECORDS[0].summary = `الدولة ${RAW_RECORDS[0].summary}`;", 'non-English summary'],
    ['numeric evidence', "RAW_RECORDS[0].evidence[0] = '12345.';", 'non-English nested learner content'],
    ['missing actor', 'RAW_RECORDS[0].keyPeople = [];', 'missing keyPeople'],
    ['missing terms', 'RAW_RECORDS[0].keyTerms = [];', 'missing keyTerms'],
    ['missing evidence', 'RAW_RECORDS[0].evidence = [];', 'missing evidence'],
    ['bad actor shape', "RAW_RECORDS[0].keyPeople = [{ role: 'English role' }];", 'keyPeople entry must contain exactly name and role fields'],
    ['bad term shape', "RAW_RECORDS[0].keyTerms = [{ term: 'one', explanation: 'English explanation' }, { term: 'two', extra: 'English text' }];", 'keyTerms entry must contain exactly term and explanation fields'],
    ['short significance', "RAW_RECORDS[0].significance = 'Too short.';", 'significance is too short'],
    ['short exam connection', "RAW_RECORDS[0].examConnection = 'Too short.';", 'examConnection is too short'],
  ];
  for (const [label, statement, rule] of cases) {
    assertDataModuleError(label, mutateRawRecord(label, statement),
      `Invalid Unit 3 study record ${firstId}: ${rule}`);
  }
});

const mixedScriptCases = [
  [
    'Hiragana in an ordinary record field',
    () => mutateRawRecord('Hiragana summary', "RAW_RECORDS[0].summary = `English かな ${RAW_RECORDS[0].summary}`;"),
    `Invalid Unit 3 study record ${firstId}: non-English summary`,
  ],
  [
    'Katakana in an ordinary record field',
    () => mutateRawRecord('Katakana significance', "RAW_RECORDS[0].significance = `English カタカナ ${RAW_RECORDS[0].significance}`;"),
    `Invalid Unit 3 study record ${firstId}: non-English significance`,
  ],
  [
    'Hangul in nested learner content',
    () => mutateRawRecord('Hangul evidence', "RAW_RECORDS[0].evidence[0] = `English 한국어 ${RAW_RECORDS[0].evidence[0]}`;"),
    `Invalid Unit 3 study record ${firstId}: non-English nested learner content`,
  ],
  [
    'Hebrew in a unit card',
    () => mutateUnitCards('Hebrew card prompt', "UNIT_CARD_LIST[0].prompt = `English שלום ${UNIT_CARD_LIST[0].prompt}`;"),
    'Invalid Unit 3 unit card context apwh-u3-context-conditions-land-empire-building: non-English prompt',
  ],
  [
    'Greek in a reciprocal connection note',
    () => replaceDataSource(
      'Greek reciprocal connection note',
      /cause\.connectionNotes\[effectId\]\s*=\s*note;\s*effect\.connectionNotes\[causeId\]\s*=\s*note;/,
      "cause.connectionNotes[effectId] = 'English Ελληνικά note.'; effect.connectionNotes[causeId] = 'English Ελληνικά note.';",
    ),
    `Invalid Unit 3 study record ${firstId}: non-English connection note for apwh-u3-ottoman-devshirme-janissary-system`,
  ],
];
for (const [label, makeSource, message] of mixedScriptCases) {
  test(`rejects ${label}`, () => {
    assertDataModuleError(label, makeSource(), message);
  });
}

test('rejects missing, invalid, and extra source metadata', () => {
  const cases = [
    ['missing source id', "RAW_RECORDS[0].source.id = '';", 'missing source id'],
    ['invalid source id', "RAW_RECORDS[0].source.id = 'other';", 'invalid source id other'],
    ['missing source locator', "RAW_RECORDS[0].source.locator = '';", 'missing source locator'],
    ['extra source field', "RAW_RECORDS[0].source.edition = 'extra';", 'source must contain exactly id and locator fields'],
  ];
  for (const [label, statement, rule] of cases) {
    assertDataModuleError(label, mutateRawRecord(label, statement),
      `Invalid Unit 3 study record ${firstId}: ${rule}`);
  }
});

test('rejects record count drift and duplicate raw record IDs', () => {
  assertDataModuleError('seventeen records', mutateRawRecord('seventeen records', 'RAW_RECORDS.pop();'),
    'Invalid Unit 3 study record (missing record): expected exactly 18 records');
  assertDataModuleError('nineteen records', mutateRawRecord('nineteen records', 'RAW_RECORDS.push({ ...RAW_RECORDS[0], id: \'apwh-u3-extra-record\' });'),
    'Invalid Unit 3 study record apwh-u3-extra-record: expected exactly 18 records');
  assertDataModuleError('duplicate record ID', mutateRawRecord(
    'duplicate record ID', 'RAW_RECORDS[1].id = RAW_RECORDS[0].id;',
  ), `Invalid Unit 3 study record ${firstId}: duplicate record ID`);
});

test('rejects duplicate lenses and sequences within an empire location', () => {
  const duplicateLensManifest = mutateManifest('duplicate lens manifest', "STUDY_MANIFEST[1][3] = 'Expansion';");
  const duplicateLensSource = replaceSource(
    'duplicate lens raw',
    duplicateLensManifest,
    /(\n\s*function freezeUnitCard\(card\)\s*\{)/,
    "\n  RAW_RECORDS[1].lens = 'Expansion';$1",
  );
  assertDataModuleError('duplicate lens', duplicateLensSource,
    `Invalid Unit 3 study record ${firstId}: duplicate lens Expansion at location 18`);
  assertDataModuleError('duplicate sequence', mutateManifest(
    'duplicate sequence', 'STUDY_MANIFEST[1][4] = 1;',
  ), `Invalid Unit 3 study record ${firstId}: duplicate sequence 1 at location 18`);
});

test('rejects malformed and non-Unit-3 stable IDs', () => {
  for (const [replacement, rule] of [
    ['apwh-u2-ottoman-cannon-conquest-constantinople', 'invalid stable ID apwh-u2-ottoman-cannon-conquest-constantinople'],
    ['apwh-u3-Ottoman bad id', 'invalid stable ID apwh-u3-Ottoman bad id'],
  ]) {
    const malformed = replaceAllDataSource(rule, firstId, replacement);
    assertDataModuleError(rule, malformed, `Invalid Unit 3 study record ${replacement}: ${rule}`);
  }
});

test('rejects malformed Unit 3 cards', () => {
  const cases = [
    ['missing role', "UNIT_CARD_LIST[0].role = '';", 'context', 'apwh-u3-context-conditions-land-empire-building', 'missing role'],
    ['two takeaways', 'UNIT_CARD_LIST[0].takeaways.pop();', 'context', 'apwh-u3-context-conditions-land-empire-building', 'takeaways must contain exactly three items'],
    ['duplicate kind', "UNIT_CARD_LIST[1].kind = 'context';", 'context', 'apwh-u3-synthesis-expansion-limits-land-power', 'duplicate kind context'],
    ['duplicate ID', 'UNIT_CARD_LIST[1].id = UNIT_CARD_LIST[0].id;', 'synthesis', 'apwh-u3-context-conditions-land-empire-building', 'duplicate card ID'],
    ['missing exam skills', 'UNIT_CARD_LIST[0].examSkills = [];', 'context', 'apwh-u3-context-conditions-land-empire-building', 'missing examSkills'],
    ['invalid exam skill item', "UNIT_CARD_LIST[0].examSkills = [123, 'Causation'];", 'context', 'apwh-u3-context-conditions-land-empire-building', 'invalid examSkill 123'],
    ['duplicate exam skill', "UNIT_CARD_LIST[0].examSkills = ['Causation', 'Causation'];", 'context', 'apwh-u3-context-conditions-land-empire-building', 'duplicate examSkill Causation'],
    ['oversized exam skills', "UNIT_CARD_LIST[0].examSkills = ['Contextualization', 'Causation', 'Comparison'];", 'context', 'apwh-u3-context-conditions-land-empire-building', 'too many examSkills'],
    ['Chinese prompt', "UNIT_CARD_LIST[0].prompt = `中文 ${UNIT_CARD_LIST[0].prompt}`;", 'context', 'apwh-u3-context-conditions-land-empire-building', 'non-English prompt'],
  ];
  for (const [label, statement, kind, id, rule] of cases) {
    assertDataModuleError(label, mutateUnitCards(label, statement),
      `Invalid Unit 3 unit card ${kind} ${id}: ${rule}`);
  }
});

test('rejects null and non-object raw records and unit cards before dereferencing', () => {
  assertDataModuleError('null raw record', mutateRawRecord('null raw record', 'RAW_RECORDS[0] = null;'),
    'Invalid Unit 3 study record (missing ID): record must be a non-null plain object');
  assertDataModuleError('null card', mutateUnitCards('null card', 'UNIT_CARD_LIST[0] = null;'),
    'Invalid Unit 3 unit card (missing kind) (missing ID): card must be a non-null plain object');
});

const mutateConnections = (label, statement) => replaceDataSource(
  label,
  /(\n\s*const RAW_RECORDS\s*=\s*\[)/,
  `\n  ${statement}$1`,
);

test('rejects missing graph endpoints immediately', () => {
  const cases = [
    [
      'missing causal cause',
      "addCausalConnection('apwh-u3-missing-cause', 'apwh-u3-ottoman-devshirme-janissary-system', 'English comparison note.');",
      'Invalid Unit 3 study connection causal: missing cause apwh-u3-missing-cause',
    ],
    [
      'missing causal effect',
      "addCausalConnection('apwh-u3-ottoman-cannon-conquest-constantinople', 'apwh-u3-missing-effect', 'English comparison note.');",
      'Invalid Unit 3 study connection causal: missing effect apwh-u3-missing-effect',
    ],
    [
      'missing related left',
      "addRelatedConnection('apwh-u3-missing-left', 'apwh-u3-safavid-ismail-qizilbash-conquest', 'English comparison note.');",
      'Invalid Unit 3 study connection related: missing left apwh-u3-missing-left',
    ],
    [
      'missing related right',
      "addRelatedConnection('apwh-u3-ottoman-cannon-conquest-constantinople', 'apwh-u3-missing-right', 'English comparison note.');",
      'Invalid Unit 3 study connection related: missing right apwh-u3-missing-right',
    ],
  ];
  for (const [label, statement, message] of cases) {
    assertDataModuleError(label, mutateConnections(label, statement), message);
  }
});

test('rejects causal and related self-connections', () => {
  assertDataModuleError('causal self', mutateConnections(
    'causal self',
    `addCausalConnection('${firstId}', '${firstId}', 'English causal note.');`,
  ), `Invalid Unit 3 study connection causal: self connection ${firstId}`);
  assertDataModuleError('related self', mutateConnections(
    'related self',
    `addRelatedConnection('${firstId}', '${firstId}', 'English related note.');`,
  ), `Invalid Unit 3 study connection related: self connection ${firstId}`);
});

const graphMutationCases = [
  [
    'duplicate connection',
    /cause\.effectStudyPointIds\.push\(\s*effectId\s*\);/,
    'cause.effectStudyPointIds.push(effectId, effectId);',
    `Invalid Unit 3 study record ${firstId}: duplicate connection in effectStudyPointIds to apwh-u3-ottoman-devshirme-janissary-system`,
  ],
  [
    'cross-category connection',
    /effect\.causeStudyPointIds\.push\(\s*causeId\s*\);/,
    'effect.causeStudyPointIds.push(causeId);\n    cause.relatedStudyPointIds.push(effectId);\n    effect.relatedStudyPointIds.push(causeId);',
    `Invalid Unit 3 study record ${firstId}: cross-category connection apwh-u3-ottoman-devshirme-janissary-system in effectStudyPointIds and relatedStudyPointIds`,
  ],
  [
    'nonreciprocal category',
    /effect\.causeStudyPointIds\.push\(\s*causeId\s*\);/,
    '// omit reverse fixture',
    `Invalid Unit 3 study record ${firstId}: nonreciprocal effectStudyPointIds connection to apwh-u3-ottoman-devshirme-janissary-system`,
  ],
  [
    'missing reciprocal notes',
    /cause\.connectionNotes\[effectId\]\s*=\s*note;\s*effect\.connectionNotes\[causeId\]\s*=\s*note;/,
    '// omit notes fixture',
    `Invalid Unit 3 study record ${firstId}: missing connection note for apwh-u3-ottoman-devshirme-janissary-system`,
  ],
  [
    'non-English note',
    /cause\.connectionNotes\[effectId\]\s*=\s*note;/,
    "cause.connectionNotes[effectId] = '12345.';",
    `Invalid Unit 3 study record ${firstId}: non-English connection note for apwh-u3-ottoman-devshirme-janissary-system`,
  ],
  [
    'mismatched reciprocal note',
    /effect\.connectionNotes\[causeId\]\s*=\s*note;/,
    'effect.connectionNotes[causeId] = `${note} Different.`;',
    `Invalid Unit 3 study record ${firstId}: nonreciprocal connection note for apwh-u3-ottoman-devshirme-janissary-system`,
  ],
  [
    'extra note',
    /connectionNotes:\s*Object\.freeze\(\{\s*\.\.\.connections\.connectionNotes\s*\}\),/,
    "connectionNotes: Object.freeze({ ...connections.connectionNotes, 'apwh-u3-extra': 'Extra note.' }),",
    `Invalid Unit 3 study record ${firstId}: extra connection note key apwh-u3-extra`,
  ],
  [
    'unresolved link',
    /effectStudyPointIds:\s*Object\.freeze\(\[\s*\.\.\.connections\.effectStudyPointIds\s*\]\),/,
    "effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds, 'apwh-u3-missing-link']),",
    `Invalid Unit 3 study record ${firstId}: unresolved connection apwh-u3-missing-link`,
  ],
];
for (const [label, search, replacement, message] of graphMutationCases) {
  test(`rejects graph ${label}`, () => {
    assertDataModuleError(label, replaceDataSource(label, search, replacement), message);
  });
}
