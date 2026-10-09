(function publishUnit3LocationStudy(root) {
  'use strict';

  if (Object.prototype.hasOwnProperty.call(root, 'APWH_U3_LOCATION_STUDY')) {
    throw new Error('Invalid Unit 3 global APWH_U3_LOCATION_STUDY: refusing to overwrite existing value');
  }

  const UNIT_ID = 'u3';
  const UNIT_NUMBER = 3;
  const LOCATIONS = Object.freeze({
    '5': 'Beijing',
    '6': 'Delhi',
    '14': 'Edo/Tokyo',
    '18': 'Istanbul',
    '19': 'Isfahan',
    '25': 'St. Petersburg',
  });
  const VALID_EMPIRES = new Set(['Ming/Qing', 'Mughal', 'Tokugawa', 'Ottoman', 'Safavid', 'Russia']);
  const VALID_LENSES = new Set(['Expansion', 'Administration', 'Legitimation & Conflict']);
  const VALID_TOPIC_CODES = new Set(['3.1', '3.2', '3.3', '3.4']);
  const VALID_THEME_IDS = new Set(['GOV', 'ECN', 'TEC', 'CDI', 'SIO', 'ENV']);
  const VALID_EXAM_SKILLS = new Set(['Causation', 'Comparison', 'CCOT', 'Contextualization']);
  const VALID_MAIN_EVENTS = new Set([
    'world-event-5-0', 'world-event-6-1', 'world-event-14-0',
    'world-event-18-3', 'world-event-19-0', 'world-event-25-0',
  ]);
  const CANONICAL_LOCATION_BINDINGS = Object.freeze({
    '5': Object.freeze({ empire: 'Ming/Qing', mainEventKey: 'world-event-5-0' }),
    '6': Object.freeze({ empire: 'Mughal', mainEventKey: 'world-event-6-1' }),
    '14': Object.freeze({ empire: 'Tokugawa', mainEventKey: 'world-event-14-0' }),
    '18': Object.freeze({ empire: 'Ottoman', mainEventKey: 'world-event-18-3' }),
    '19': Object.freeze({ empire: 'Safavid', mainEventKey: 'world-event-19-0' }),
    '25': Object.freeze({ empire: 'Russia', mainEventKey: 'world-event-25-0' }),
  });

  const STUDY_MANIFEST = [
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

  validateManifestRows(STUDY_MANIFEST);

  const STUDY_CONTEXT = Object.freeze(Object.fromEntries(STUDY_MANIFEST.map(([
    id, locationNumber, empire, lens, sequence, title, dateLabel, startYear, endYear,
    mainEventKey, topicCodes, themeIds, examSkills,
  ]) => [id, Object.freeze({
    locationNumber, empire, lens, sequence, title, dateLabel, startYear, endYear, mainEventKey,
    topicCodes: Object.freeze([...topicCodes]),
    themeIds: Object.freeze([...themeIds]),
    examSkills: Object.freeze([...examSkills]),
  })])));

  const CONNECTION_DATA = new Map(STUDY_MANIFEST.map(([id]) => [id, {
    causeStudyPointIds: [], effectStudyPointIds: [], relatedStudyPointIds: [], connectionNotes: {},
  }]));

  function addCausalConnection(causeId, effectId, note) {
    const cause = CONNECTION_DATA.get(causeId);
    const effect = CONNECTION_DATA.get(effectId);
    if (!cause) throw new Error(`Invalid Unit 3 study connection causal: missing cause ${causeId}`);
    if (!effect) throw new Error(`Invalid Unit 3 study connection causal: missing effect ${effectId}`);
    if (causeId === effectId) throw new Error(`Invalid Unit 3 study connection causal: self connection ${causeId}`);
    cause.effectStudyPointIds.push(effectId);
    effect.causeStudyPointIds.push(causeId);
    cause.connectionNotes[effectId] = note;
    effect.connectionNotes[causeId] = note;
  }

  function addRelatedConnection(leftId, rightId, note) {
    const left = CONNECTION_DATA.get(leftId);
    const right = CONNECTION_DATA.get(rightId);
    if (!left) throw new Error(`Invalid Unit 3 study connection related: missing left ${leftId}`);
    if (!right) throw new Error(`Invalid Unit 3 study connection related: missing right ${rightId}`);
    if (leftId === rightId) throw new Error(`Invalid Unit 3 study connection related: self connection ${leftId}`);
    left.relatedStudyPointIds.push(rightId);
    right.relatedStudyPointIds.push(leftId);
    left.connectionNotes[rightId] = note;
    right.connectionNotes[leftId] = note;
  }

  addCausalConnection('apwh-u3-ottoman-cannon-conquest-constantinople', 'apwh-u3-ottoman-devshirme-janissary-system', 'Rapid Ottoman conquest created a multiethnic governing problem that devshirme-trained soldiers and officials helped the sultan administer.');
  addCausalConnection('apwh-u3-ottoman-devshirme-janissary-system', 'apwh-u3-ottoman-sunni-millet-imperial-architecture', 'A centrally loyal service elite supported taxation and order, while Sunni institutions, millets, and imperial architecture defined how diverse subjects fit within Ottoman rule.');
  addCausalConnection('apwh-u3-safavid-ismail-qizilbash-conquest', 'apwh-u3-safavid-shah-abbas-ghulams-centralization', 'Ismail I won territory through Qizilbash support, but dependence on tribal warriors later encouraged Shah Abbas to build ghulam forces and a more centralized state.');
  addCausalConnection('apwh-u3-safavid-shah-abbas-ghulams-centralization', 'apwh-u3-safavid-twelver-shiism-ottoman-rivalry', "Centralized military and administrative power helped Safavid shahs enforce Twelver Shi'ism, a policy that unified the dynasty while sharpening conflict with Sunni subjects and neighbors.");
  addCausalConnection('apwh-u3-mughal-babur-gunpowder-panipat', 'apwh-u3-mughal-akbar-mansabdars-zamindars', "Babur's battlefield victory created a large and diverse realm that Akbar stabilized by ranking imperial servants and working through local revenue intermediaries.");
  addCausalConnection('apwh-u3-mughal-akbar-mansabdars-zamindars', 'apwh-u3-mughal-akbar-tolerance-aurangzeb-orthodoxy', "Akbar's inclusive appointments and revenue system made cooperation with Hindu elites practical, while Aurangzeb's different religious policies strained that administrative settlement.");
  addCausalConnection('apwh-u3-russia-ivan-cossacks-siberian-expansion', 'apwh-u3-russia-peter-table-ranks', "Expansion across a vast frontier increased the Russian state's need for dependable soldiers and officials, which Peter tied more closely to state service through rank and reform.");
  addCausalConnection('apwh-u3-russia-peter-table-ranks', 'apwh-u3-russia-orthodox-tsardom-boyars-new-capital', "Compulsory state service weakened independent boyar power and supported Peter's effort to present an Orthodox tsardom from a new, Western-facing imperial capital.");
  addCausalConnection('apwh-u3-ming-qing-restoration-expansion', 'apwh-u3-ming-qing-civil-service-continuity', 'Ming restoration and Qing conquest both produced large territorial states whose rulers relied on the civil-service tradition to turn military control into routine administration.');
  addCausalConnection('apwh-u3-ming-qing-civil-service-continuity', 'apwh-u3-ming-qing-manchu-confucian-ethnic-hierarchy', 'Retaining Confucian officials helped Qing rulers claim Chinese dynastic legitimacy even as banner privileges and ethnic distinctions preserved a separate Manchu ruling identity.');
  addCausalConnection('apwh-u3-tokugawa-firearms-unification-japan', 'apwh-u3-tokugawa-sankin-kotai-daimyo-control', 'Military unification ended prolonged warfare in Japan, but the shogunate then had to restrain daimyo through alternate attendance, hostages, and costly obligations.');
  addCausalConnection('apwh-u3-tokugawa-sankin-kotai-daimyo-control', 'apwh-u3-tokugawa-confucian-sakoku-hierarchy', "Control of daimyo secured the shogunate, while Neo-Confucian status rules and foreign restrictions extended that ordering logic across Tokugawa society.");

  addRelatedConnection('apwh-u3-ottoman-cannon-conquest-constantinople', 'apwh-u3-safavid-ismail-qizilbash-conquest', 'Ottoman artillery and Safavid Qizilbash mobilization both exploited regional political openings, but their different military strengths became visible in their direct rivalry.');
  addRelatedConnection('apwh-u3-ottoman-devshirme-janissary-system', 'apwh-u3-tokugawa-sankin-kotai-daimyo-control', 'Ottoman devshirme and Tokugawa alternate attendance used different forms of controlled service to reduce the independence of military elites.');
  addRelatedConnection('apwh-u3-mughal-akbar-tolerance-aurangzeb-orthodoxy', 'apwh-u3-safavid-twelver-shiism-ottoman-rivalry', "Safavid enforcement of Shi'ism and changing Mughal tolerance policies show how religious choices could either recruit diverse elites or intensify resistance.");
  addRelatedConnection('apwh-u3-ming-qing-restoration-expansion', 'apwh-u3-russia-ivan-cossacks-siberian-expansion', 'Russia and Qing China incorporated vast Inner Asian frontiers through military campaigns, local intermediaries, tribute, and settlement rather than overseas conquest.');
  addRelatedConnection('apwh-u3-ming-qing-civil-service-continuity', 'apwh-u3-mughal-akbar-mansabdars-zamindars', 'Ming-Qing examinations and Mughal ranked service both connected local elites to imperial administration, although they recruited and rewarded officials differently.');
  addRelatedConnection('apwh-u3-ming-qing-manchu-confucian-ethnic-hierarchy', 'apwh-u3-tokugawa-confucian-sakoku-hierarchy', 'Qing and Tokugawa rulers both used Confucian hierarchy to stabilize rule while preserving privileged identities for Manchu bannermen or samurai.');

  const RAW_RECORDS = [
    {
      id: 'apwh-u3-ottoman-cannon-conquest-constantinople', locationNumber: '18', empire: 'Ottoman', lens: 'Expansion', mainEventKey: 'world-event-18-3',
      title: 'Cannon Conquest of Constantinople', dateLabel: '1453', startYear: 1453, endYear: 1453,
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
      id: 'apwh-u3-ottoman-devshirme-janissary-system', locationNumber: '18', empire: 'Ottoman', lens: 'Administration', mainEventKey: 'world-event-18-3',
      title: 'Devshirme and the Janissary System', dateLabel: 'c. 1450–1600', startYear: 1450, endYear: 1600,
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
      id: 'apwh-u3-ottoman-sunni-millet-imperial-architecture', locationNumber: '18', empire: 'Ottoman', lens: 'Legitimation & Conflict', mainEventKey: 'world-event-18-3',
      title: 'Sunni Rule, the Millet System, and Imperial Architecture', dateLabel: '1453–1750', startYear: 1453, endYear: 1750,
      summary: 'Ottoman sultans claimed Sunni authority, governed recognized religious communities through millets, and used converted landmarks and new mosques to display imperial power.',
      significance: "This combination made diversity administratively useful and projected legitimacy, yet Sunni leadership and frontier competition also sharpened rivalry with the Shi'a Safavid state.",
      keyPeople: [
        { name: 'Suleiman I', role: 'Expanded Ottoman power while sponsoring law, mosques, fortifications, and an image of the sultan as a defender of Sunni order.' },
      ],
      keyTerms: [
        { term: 'millet system', explanation: 'The Ottoman arrangement that let recognized religious communities manage selected legal, educational, and charitable affairs under imperial authority.' },
        { term: 'imperial mosque', explanation: "A monumental mosque commissioned to make a sultan's wealth, Sunni faith, and political authority visible." },
      ],
      evidence: [
        'Ottoman rulers converted Hagia Sophia into a mosque and built major imperial complexes such as the Suleymaniye Mosque.',
        'Millet arrangements allowed Orthodox Christian, Armenian, and Jewish leaders to supervise parts of communal life while paying taxes to the empire.',
      ],
      examConnection: 'Compare Ottoman accommodation through millets with Safavid religious enforcement, then explain how each policy addressed legitimacy and produced different patterns of cohesion or conflict.',
      source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4' },
    },
    {
      id: 'apwh-u3-safavid-ismail-qizilbash-conquest', locationNumber: '19', empire: 'Safavid', lens: 'Expansion', mainEventKey: 'world-event-19-0',
      title: 'Ismail I and Qizilbash Conquest', dateLabel: '1501–1514', startYear: 1501, endYear: 1514,
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
      id: 'apwh-u3-safavid-shah-abbas-ghulams-centralization', locationNumber: '19', empire: 'Safavid', lens: 'Administration', mainEventKey: 'world-event-19-0',
      title: 'Shah Abbas, Ghulams, and Centralization', dateLabel: '1588–1629', startYear: 1588, endYear: 1629,
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
      id: 'apwh-u3-safavid-twelver-shiism-ottoman-rivalry', locationNumber: '19', empire: 'Safavid', lens: 'Legitimation & Conflict', mainEventKey: 'world-event-19-0',
      title: "Twelver Shi'ism and Ottoman Rivalry", dateLabel: '1501–1722', startYear: 1501, endYear: 1722,
      summary: "Safavid shahs made Twelver Shi'ism a defining state religion and pressured a largely Sunni population to adopt it.",
      significance: "A shared religious identity distinguished Safavid Iran and supported dynastic authority, but coercion intensified internal resistance and made rivalry with the Sunni Ottomans more durable.",
      keyPeople: [
        { name: 'Ismail I', role: "Declared Twelver Shi'ism the state faith and used conversion policy to distinguish Safavid rule from Sunni rivals." },
      ],
      keyTerms: [
        { term: "Twelver Shi'ism", explanation: "The Shi'a tradition recognizing a line of twelve imams and awaiting the return of the hidden twelfth imam." },
        { term: 'sectarian rivalry', explanation: "Political conflict intensified by rulers defining communities through competing Sunni and Shi'a religious identities." },
      ],
      evidence: [
        "Safavid authorities required Sunni subjects to convert and used taxation and state patronage to encourage Shi'a practice.",
        'Ottoman-Safavid wars contested frontier territory and trade, while a Sunni Afghan revolt led to the seizure of Isfahan in 1722.',
      ],
      examConnection: 'Use Safavid religious policy to show both sides of legitimation: a ruler can create a stronger shared identity while also producing resistance among subjects excluded by that identity.',
      source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4' },
    },
    {
      id: 'apwh-u3-mughal-babur-gunpowder-panipat', locationNumber: '6', empire: 'Mughal', lens: 'Expansion', mainEventKey: 'world-event-6-1',
      title: 'Babur, Gunpowder, and Panipat', dateLabel: '1526', startYear: 1526, endYear: 1526,
      summary: 'Babur combined field artillery, matchlock troops, and mobile cavalry to defeat the larger Delhi Sultanate army at Panipat in 1526.',
      significance: "The battle founded Mughal rule in northern India and demonstrates how tactical coordination and an opponent's political weakness could make gunpowder decisive.",
      keyPeople: [
        { name: 'Babur', role: 'The Central Asian conqueror who defeated Ibrahim Lodi at Panipat and founded the Mughal Empire in India.' },
      ],
      keyTerms: [
        { term: 'Battle of Panipat', explanation: 'The 1526 battle in which Babur defeated Ibrahim Lodi and established a Mughal foothold in northern India.' },
        { term: 'field artillery', explanation: 'Mobile cannon positioned for use during a battle rather than only against walls.' },
      ],
      evidence: [
        'Babur placed cannon and matchlock troops behind a defensive line of carts at the first Battle of Panipat.',
        "His smaller force defeated Ibrahim Lodi's larger army, including its war elephants, on April 21, 1526.",
      ],
      examConnection: "Use Panipat to explain that military technology mattered through deployment and organization, not as an automatic advantage detached from leadership or an opponent's weakness.",
      source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4' },
    },
    {
      id: 'apwh-u3-mughal-akbar-mansabdars-zamindars', locationNumber: '6', empire: 'Mughal', lens: 'Administration', mainEventKey: 'world-event-6-1',
      title: "Akbar's Mansabdars and Zamindars", dateLabel: '1556–1605', startYear: 1556, endYear: 1605,
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
        "Mansab ranks helped determine an official's status, pay, and obligation to supply cavalry for imperial service.",
        'Zamindars collected a share of agricultural production, and Akbar appointed both Muslim and Hindu elites to government roles.',
      ],
      examConnection: "Compare mansabdars and zamindars with another empire's service elite by explaining how each institution converted local influence into revenue or military capacity for the center.",
      source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4' },
    },
    {
      id: 'apwh-u3-mughal-akbar-tolerance-aurangzeb-orthodoxy', locationNumber: '6', empire: 'Mughal', lens: 'Legitimation & Conflict', mainEventKey: 'world-event-6-1',
      title: "From Akbar's Tolerance to Aurangzeb's Orthodoxy", dateLabel: '1556–1707', startYear: 1556, endYear: 1707,
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
      id: 'apwh-u3-russia-ivan-cossacks-siberian-expansion', locationNumber: '25', empire: 'Russia', lens: 'Expansion', mainEventKey: 'world-event-25-0',
      title: 'Ivan IV, Cossacks, and Siberian Expansion', dateLabel: '1547–1639', startYear: 1547, endYear: 1639,
      summary: 'From Moscow, Ivan IV conquered Volga khanates and licensed Cossacks and merchant families to push Russian power across Siberia toward the Pacific.',
      significance: "This Moscow-centered expansion created the continental state that Peter later redirected from St. Petersburg, a city founded only in 1703, long after Ivan's reign.",
      keyPeople: [
        { name: 'Ivan IV', role: "The Moscow-based tsar who conquered Kazan and Astrakhan and encouraged eastward Russian expansion." },
        { name: 'Yermak Timofeyevich', role: 'A Cossack leader whose campaign against the Siberian Khanate opened further Russian movement eastward.' },
      ],
      keyTerms: [
        { term: 'Cossacks', explanation: 'Frontier warrior communities whose mobility and military service supported Russian expansion.' },
        { term: 'yasak', explanation: 'A fur tribute demanded by Russian authorities from Indigenous Siberian communities and used to finance frontier rule.' },
      ],
      evidence: [
        "Ivan IV captured Kazan in 1552 and Astrakhan in 1556, extending Moscow's control along the Volga.",
        'Cossack and merchant expeditions collected yasak across Siberia, and Russian parties reached the Pacific coast by 1639.',
      ],
      examConnection: 'Use Russia to compare continental frontier expansion with gunpowder conquest, while keeping the chronology clear: Ivan expanded from Moscow before St. Petersburg existed.',
      source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4' },
    },
    {
      id: 'apwh-u3-russia-peter-table-ranks', locationNumber: '25', empire: 'Russia', lens: 'Administration', mainEventKey: 'world-event-25-0',
      title: 'Peter the Great and the Table of Ranks', dateLabel: '1682–1725', startYear: 1682, endYear: 1725,
      summary: "Peter the Great reorganized Russia's military and government and used the Table of Ranks to tie elite advancement to service for the state.",
      significance: "Service-based rank weakened the assumption that old boyar ancestry alone determined status and expanded the tsar's control over officers and civil administrators.",
      keyPeople: [
        { name: 'Peter the Great', role: 'The Russian tsar who pursued military, administrative, and cultural reforms to strengthen centralized state power.' },
      ],
      keyTerms: [
        { term: 'Table of Ranks', explanation: "Peter's hierarchy of military, civil, and court offices that linked noble status and promotion to state service." },
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
      id: 'apwh-u3-russia-orthodox-tsardom-boyars-new-capital', locationNumber: '25', empire: 'Russia', lens: 'Legitimation & Conflict', mainEventKey: 'world-event-25-0',
      title: 'Orthodox Tsardom, Boyar Control, and a New Capital', dateLabel: '1547–1725', startYear: 1547, endYear: 1725,
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
      examConnection: "Use St. Petersburg as legitimation evidence only with chronology: connect Peter's new capital to Westernization and boyar control rather than to Ivan IV's earlier conquests.",
      source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4' },
    },
    {
      id: 'apwh-u3-ming-qing-restoration-expansion', locationNumber: '5', empire: 'Ming/Qing', lens: 'Expansion', mainEventKey: 'world-event-5-0',
      title: 'From Ming Restoration to Qing Expansion', dateLabel: '1368–1757', startYear: 1368, endYear: 1757,
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
        "Kangxi campaigned in Taiwan and Mongolia, while Qianlong's forces conquered Xinjiang in the 1750s and intervened in Tibet.",
      ],
      examConnection: 'Use this case for continuity and change by separating Ming restoration from Qing expansion, then compare Qing frontier incorporation with Russian movement across Siberia.',
      source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4' },
    },
    {
      id: 'apwh-u3-ming-qing-civil-service-continuity', locationNumber: '5', empire: 'Ming/Qing', lens: 'Administration', mainEventKey: 'world-event-5-0',
      title: 'Civil-Service Continuity under Ming and Qing', dateLabel: '1368–1750', startYear: 1368, endYear: 1750,
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
      id: 'apwh-u3-ming-qing-manchu-confucian-ethnic-hierarchy', locationNumber: '5', empire: 'Ming/Qing', lens: 'Legitimation & Conflict', mainEventKey: 'world-event-5-0',
      title: 'Manchu Rule, Confucian Legitimacy, and Ethnic Hierarchy', dateLabel: '1644–1750', startYear: 1644, endYear: 1750,
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
      id: 'apwh-u3-tokugawa-firearms-unification-japan', locationNumber: '14', empire: 'Tokugawa', lens: 'Expansion', mainEventKey: 'world-event-14-0',
      title: 'Firearms and the Unification of Japan', dateLabel: '1560–1600', startYear: 1560, endYear: 1600,
      summary: 'In Japan, Oda Nobunaga and Toyotomi Hideyoshi used firearms, castle warfare, alliances, and disarmament to defeat rivals before Tokugawa victory completed unification.',
      significance: 'Unification ended the prolonged competition of the warring-states era and created the territorial and military foundation for a shogunate centered at Edo.',
      keyPeople: [
        { name: 'Oda Nobunaga', role: 'A Japanese unifier who armed troops with imported muskets and defeated rival daimyo during the late sixteenth century.' },
        { name: 'Toyotomi Hideyoshi', role: 'Continued unification and ordered a sword hunt that separated armed warriors from cultivators.' },
      ],
      keyTerms: [
        { term: 'arquebus', explanation: 'An early matchlock firearm introduced to Japan through Portuguese contact and adopted by competing armies.' },
        { term: 'Battle of Sekigahara', explanation: "Tokugawa Ieyasu's decisive 1600 victory over rival coalitions, which completed the military foundation for Tokugawa rule." },
      ],
      evidence: [
        'Nobunaga equipped forces with Portuguese-style matchlocks and used organized firearm volleys against rival armies.',
        "Hideyoshi's 1588 sword hunt ordered peasants to surrender weapons, while Tokugawa Ieyasu won supremacy at Sekigahara in 1600.",
      ],
      examConnection: 'Use Japan to show that firearms aided unification through tactical adoption, then connect disarmament to the governance problem created after military victory.',
      source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.1 and 3.4' },
    },
    {
      id: 'apwh-u3-tokugawa-sankin-kotai-daimyo-control', locationNumber: '14', empire: 'Tokugawa', lens: 'Administration', mainEventKey: 'world-event-14-0',
      title: 'Sankin-kotai and Daimyo Control', dateLabel: '1635–1750', startYear: 1635, endYear: 1750,
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
      examConnection: "Compare sankin-kotai with another ruler's control of nobles by explaining how surveillance, hostages, and required spending reduced the resources available for rebellion.",
      source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.2 and 3.4' },
    },
    {
      id: 'apwh-u3-tokugawa-confucian-sakoku-hierarchy', locationNumber: '14', empire: 'Tokugawa', lens: 'Legitimation & Conflict', mainEventKey: 'world-event-14-0',
      title: 'Neo-Confucian Order, Sakoku, and Social Hierarchy', dateLabel: '1603–1750', startYear: 1603, endYear: 1750,
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
      examConnection: "Use Tokugawa policy for comparison and continuity by separating restricted diplomacy from total isolation and linking hierarchy to the shogunate's need for political order.",
      source: { id: 'amsco-apwh-u3', locator: 'AMSCO AP World History, Unit 3, Topics 3.3 and 3.4' },
    },
  ];

  function freezeUnitCard(card) {
    return Object.freeze({
      ...card,
      examSkills: Object.freeze([...card.examSkills]),
      takeaways: Object.freeze([...card.takeaways]),
    });
  }

  const UNIT_CARD_LIST = [
    {
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
    {
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
  ];

  function describeRuleValue(value) { return value === '' ? '""' : String(value); }
  function hasEnglishText(value) {
    if (typeof value !== 'string' || !value.trim()) return false;
    const letters = value.match(/\p{Letter}/gu) || [];
    return letters.length > 0 && letters.every(letter => /\p{Script=Latin}/u.test(letter));
  }
  function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      && Object.getPrototypeOf(value) === Object.prototype;
  }
  function failRecord(record, rule) {
    throw new Error(`Invalid Unit 3 study record ${record?.id || '(missing ID)'}: ${rule}`);
  }
  function failCard(card, rule) {
    throw new Error(`Invalid Unit 3 unit card ${card?.kind || '(missing kind)'} ${card?.id || '(missing ID)'}: ${rule}`);
  }
  function validateValues(record, values, validValues, field, singular) {
    if (!Array.isArray(values)) failRecord(record, `${field} must be an array`);
    if (!values.length) failRecord(record, `missing ${field}`);
    for (const value of values) {
      if (!validValues.has(value)) failRecord(record, `invalid ${singular} ${describeRuleValue(value)}`);
      if (values.indexOf(value) !== values.lastIndexOf(value)) {
        failRecord(record, `duplicate ${singular} ${describeRuleValue(value)}`);
      }
    }
  }

  function validateManifestRows(rows) {
    const seenIds = new Set();
    for (const row of rows) {
      const id = Array.isArray(row) ? row[0] : null;
      const record = { id };
      if (!Array.isArray(row) || row.length !== 13) {
        failRecord(record, 'manifest row must be a thirteen-field array');
      }
      const [manifestId, locationNumber, empire, lens, sequence, title, dateLabel, startYear,
        endYear, mainEventKey, topicCodes, themeIds, examSkills] = row;
      if (typeof manifestId !== 'string' || !manifestId.trim()) failRecord(record, 'manifest ID must be a nonempty string');
      if (!/^apwh-u3-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifestId)) {
        failRecord(record, `invalid stable ID ${describeRuleValue(manifestId)}`);
      }
      if (seenIds.has(manifestId)) failRecord(record, 'duplicate record ID');
      seenIds.add(manifestId);
      if (!Object.prototype.hasOwnProperty.call(LOCATIONS, locationNumber)) failRecord(record, `invalid locationNumber ${locationNumber}`);
      if (!VALID_EMPIRES.has(empire)) failRecord(record, `invalid empire ${empire}`);
      const canonicalBinding = CANONICAL_LOCATION_BINDINGS[locationNumber];
      if (empire !== canonicalBinding.empire) failRecord(record, `invalid empire ${empire} for location ${locationNumber}`);
      if (!VALID_LENSES.has(lens)) failRecord(record, `invalid lens ${lens}`);
      if (!Number.isInteger(sequence)) failRecord(record, 'manifest sequence must be an integer');
      if (![1, 2, 3].includes(sequence)) failRecord(record, `invalid sequence ${sequence}`);
      if (typeof title !== 'string' || !title.trim()) failRecord(record, 'manifest title must be a nonempty string');
      if (typeof dateLabel !== 'string' || !dateLabel.trim()) failRecord(record, 'manifest dateLabel must be a nonempty string');
      if (!Number.isInteger(startYear)) failRecord(record, 'startYear must be an integer');
      if (!Number.isInteger(endYear)) failRecord(record, 'endYear must be an integer');
      if (typeof mainEventKey !== 'string' || !mainEventKey.trim()) failRecord(record, 'manifest mainEventKey must be a nonempty string');
      if (!VALID_MAIN_EVENTS.has(mainEventKey)) failRecord(record, `invalid mainEventKey ${mainEventKey}`);
      if (mainEventKey !== canonicalBinding.mainEventKey) {
        failRecord(record, `invalid mainEventKey ${mainEventKey} for location ${locationNumber}`);
      }
      validateValues(record, topicCodes, VALID_TOPIC_CODES, 'topicCodes', 'topicCode');
      validateValues(record, themeIds, VALID_THEME_IDS, 'themeIds', 'themeId');
      validateValues(record, examSkills, VALID_EXAM_SKILLS, 'examSkills', 'examSkill');
      if (examSkills.length > 2) failRecord(record, 'too many examSkills');
    }
    if (rows.length > 18) failRecord({ id: rows[18]?.[0] }, 'expected exactly 18 records');
    if (rows.length < 18) failRecord({ id: '(missing record)' }, 'expected exactly 18 records');
    for (const locationNumber of Object.keys(LOCATIONS)) {
      const locationRows = rows.filter(row => row[1] === locationNumber);
      if (locationRows.length !== 3) failRecord({ id: locationRows[0]?.[0] || `(location ${locationNumber})` }, `location ${locationNumber} must contain exactly three records`);
      const empire = locationRows[0][2];
      if (locationRows.some(row => row[2] !== empire)) failRecord({ id: locationRows[0][0] }, `location ${locationNumber} must use one empire`);
      const lenses = locationRows.map(row => row[3]);
      if (new Set(lenses).size !== lenses.length) {
        const duplicate = lenses.find((value, index) => lenses.indexOf(value) !== index);
        failRecord({ id: locationRows[0][0] }, `duplicate lens ${duplicate} at location ${locationNumber}`);
      }
      const sequences = locationRows.map(row => row[4]);
      if (new Set(sequences).size !== sequences.length) {
        const duplicate = sequences.find((value, index) => sequences.indexOf(value) !== index);
        failRecord({ id: locationRows[0][0] }, `duplicate sequence ${duplicate} at location ${locationNumber}`);
      }
      if ([...sequences].sort().join(',') !== '1,2,3') failRecord({ id: locationRows[0][0] }, `location ${locationNumber} must use sequences 1,2,3`);
    }
    const empireLocations = new Map([...VALID_EMPIRES].map(empire => [empire, new Set()]));
    for (const row of rows) empireLocations.get(row[2])?.add(row[1]);
    for (const [empire, locations] of empireLocations) {
      if (locations.size !== 1) {
        throw new Error(`Invalid Unit 3 study empire ${empire}: expected exactly one location`);
      }
    }
  }

  function validateRawRecords() {
    const rawRecordKeys = [
      'dateLabel', 'empire', 'endYear', 'evidence', 'examConnection', 'id', 'keyPeople',
      'keyTerms', 'lens', 'locationNumber', 'mainEventKey', 'significance', 'source',
      'startYear', 'summary', 'title',
    ];
    const expectedLocationNumbers = ['5', '6', '14', '18', '19', '25'];
    if (Object.keys(LOCATIONS).join(',') !== expectedLocationNumbers.join(',')) {
      throw new Error('Invalid Unit 3 study locations: expected exactly 5,6,14,18,19,25');
    }
    for (const [number, name] of Object.entries(LOCATIONS)) {
      if (!hasEnglishText(name)) throw new Error(`Invalid Unit 3 study location ${number}: missing English location name`);
    }
    if (RAW_RECORDS.length > 18) failRecord(RAW_RECORDS[18], 'expected exactly 18 records');
    if (RAW_RECORDS.length < 18) failRecord({ id: '(missing record)' }, 'expected exactly 18 records');
    const ids = new Set();
    for (const record of RAW_RECORDS) {
      if (!isPlainObject(record)) failRecord(record, 'record must be a non-null plain object');
      if (Object.keys(record).sort().join(',') !== rawRecordKeys.join(',')) {
        failRecord(record, 'record must contain exactly the approved raw fields');
      }
      if (!/^apwh-u3-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id)) {
        failRecord(record, `invalid stable ID ${describeRuleValue(record.id)}`);
      }
      if (ids.has(record.id)) failRecord(record, 'duplicate record ID');
      ids.add(record.id);
      const context = STUDY_CONTEXT[record.id];
      if (!context) failRecord(record, 'not present in manifest');
      if (!Object.prototype.hasOwnProperty.call(LOCATIONS, record.locationNumber)
        || record.locationNumber !== context.locationNumber) failRecord(record, `invalid locationNumber ${record.locationNumber}`);
      if (!VALID_EMPIRES.has(record.empire)) failRecord(record, `invalid empire ${record.empire}`);
      const canonicalBinding = CANONICAL_LOCATION_BINDINGS[record.locationNumber];
      if (record.empire !== canonicalBinding.empire) {
        failRecord(record, `invalid empire ${record.empire} for location ${record.locationNumber}`);
      }
      if (record.empire !== context.empire) failRecord(record, `invalid empire ${record.empire}`);
      if (!VALID_LENSES.has(record.lens) || record.lens !== context.lens) failRecord(record, `invalid lens ${record.lens}`);
      if (!VALID_MAIN_EVENTS.has(record.mainEventKey)) failRecord(record, `invalid mainEventKey ${record.mainEventKey}`);
      if (record.mainEventKey !== canonicalBinding.mainEventKey) {
        failRecord(record, `invalid mainEventKey ${record.mainEventKey} for location ${record.locationNumber}`);
      }
      if (record.mainEventKey !== context.mainEventKey) failRecord(record, `invalid mainEventKey ${record.mainEventKey}`);
      for (const field of ['title', 'summary', 'significance', 'examConnection']) {
        if (typeof record[field] !== 'string' || !record[field].trim()) failRecord(record, `missing ${field}`);
        if (!hasEnglishText(record[field])) failRecord(record, `non-English ${field}`);
      }
      if (typeof record.dateLabel !== 'string' || !record.dateLabel.trim()) failRecord(record, 'missing dateLabel');
      if (!/^(?:c\. )?\d{3,4}(?:–(?:c\. )?\d{3,4})?$/.test(record.dateLabel)) failRecord(record, `invalid dateLabel ${describeRuleValue(record.dateLabel)}`);
      if (!Number.isInteger(record.startYear)) failRecord(record, 'startYear must be an integer');
      if (!Number.isInteger(record.endYear)) failRecord(record, 'endYear must be an integer');
      if (record.startYear > record.endYear) failRecord(record, `startYear ${record.startYear} exceeds endYear ${record.endYear}`);
      const labelYears = [...record.dateLabel.matchAll(/\d{3,4}/g)].map(match => Number(match[0]));
      const labelStartYear = labelYears[0];
      const labelEndYear = labelYears.at(-1);
      if (labelStartYear !== record.startYear || labelEndYear !== record.endYear) {
        failRecord(record, `dateLabel years ${labelStartYear}–${labelEndYear} do not match startYear ${record.startYear} and endYear ${record.endYear}`);
      }
      if (record.title !== context.title || record.dateLabel !== context.dateLabel
        || record.startYear !== context.startYear || record.endYear !== context.endYear) failRecord(record, 'manifest metadata mismatch');
      if (record.significance.length < 60) failRecord(record, 'significance is too short');
      if (record.examConnection.length < 60) failRecord(record, 'examConnection is too short');
      if (!Array.isArray(record.keyPeople) || record.keyPeople.length < 1) failRecord(record, 'missing keyPeople');
      if (!Array.isArray(record.keyTerms) || record.keyTerms.length < 2) failRecord(record, 'missing keyTerms');
      if (!Array.isArray(record.evidence) || record.evidence.length < 2) failRecord(record, 'missing evidence');
      for (const person of record.keyPeople) {
        if (!isPlainObject(person)) failRecord(record, 'invalid keyPeople entry');
        if (Object.keys(person).sort().join(',') !== 'name,role') failRecord(record, 'keyPeople entry must contain exactly name and role fields');
      }
      for (const term of record.keyTerms) {
        if (!isPlainObject(term)) failRecord(record, 'invalid keyTerms entry');
        if (Object.keys(term).sort().join(',') !== 'explanation,term') failRecord(record, 'keyTerms entry must contain exactly term and explanation fields');
      }
      if (!isPlainObject(record.source)) failRecord(record, 'invalid source structure');
      if (!record.source.id) failRecord(record, 'missing source id');
      if (!record.source.locator) failRecord(record, 'missing source locator');
      if (Object.keys(record.source).sort().join(',') !== 'id,locator') failRecord(record, 'source must contain exactly id and locator fields');
      if (record.source.id !== 'amsco-apwh-u3') failRecord(record, `invalid source id ${record.source.id}`);
      const nested = [
        ...record.keyPeople.flatMap(person => [person.name, person.role]),
        ...record.keyTerms.flatMap(term => [term.term, term.explanation]),
        ...record.evidence, record.source.id, record.source.locator,
      ];
      if (nested.some(value => typeof value !== 'string' || !value.trim())) failRecord(record, 'missing nested learner content');
      if (nested.some(value => !hasEnglishText(value))) failRecord(record, 'non-English nested learner content');
      validateValues(record, context.topicCodes, VALID_TOPIC_CODES, 'topicCodes', 'topicCode');
      validateValues(record, context.themeIds, VALID_THEME_IDS, 'themeIds', 'themeId');
      validateValues(record, context.examSkills, VALID_EXAM_SKILLS, 'examSkills', 'examSkill');
      const topics = context.topicCodes;
      const topicLabel = topics.length === 1
        ? `Topic ${topics[0]}`
        : `Topics ${topics.slice(0, -1).join(', ')}${topics.length > 2 ? ',' : ''} and ${topics.at(-1)}`;
      const expectedLocator = `AMSCO AP World History, Unit 3, ${topicLabel}`;
      if (record.source.locator !== expectedLocator) failRecord(record, `invalid source locator ${record.source.locator}`);
    }
    for (const [id] of STUDY_MANIFEST) if (!ids.has(id)) failRecord({ id }, 'missing raw record');
  }

  validateRawRecords();

  function freezeRecord(record) {
    const context = STUDY_CONTEXT[record.id];
    const connections = CONNECTION_DATA.get(record.id);
    return Object.freeze({
      ...record,
      sequence: context.sequence,
      topicCodes: Object.freeze([...context.topicCodes]),
      themeIds: Object.freeze([...context.themeIds]),
      examSkills: Object.freeze([...context.examSkills]),
      causeStudyPointIds: Object.freeze([...connections.causeStudyPointIds]),
      effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds]),
      relatedStudyPointIds: Object.freeze([...connections.relatedStudyPointIds]),
      connectionNotes: Object.freeze({ ...connections.connectionNotes }),
      keyPeople: Object.freeze(record.keyPeople.map(person => Object.freeze({ ...person }))),
      keyTerms: Object.freeze(record.keyTerms.map(term => Object.freeze({ ...term }))),
      evidence: Object.freeze([...record.evidence]),
      source: Object.freeze({ ...record.source }),
    });
  }

  const rawById = new Map(RAW_RECORDS.map(record => [record.id, record]));
  const STUDY_EVENTS = Object.freeze(STUDY_MANIFEST.map(([id]) => freezeRecord(rawById.get(id))));
  const byId = new Map(STUDY_EVENTS.map(record => [record.id, record]));

  function validateStudyGraph() {
    const categoryReciprocals = {
      causeStudyPointIds: 'effectStudyPointIds',
      effectStudyPointIds: 'causeStudyPointIds',
      relatedStudyPointIds: 'relatedStudyPointIds',
    };
    for (const record of STUDY_EVENTS) {
      const linked = [];
      const categories = new Map();
      for (const key of Object.keys(categoryReciprocals)) {
        for (const targetId of record[key]) {
          if (targetId === record.id) failRecord(record, `self connection in ${key}`);
          if (record[key].indexOf(targetId) !== record[key].lastIndexOf(targetId)) failRecord(record, `duplicate connection in ${key} to ${describeRuleValue(targetId)}`);
          if (categories.has(targetId)) failRecord(record, `cross-category connection ${targetId} in ${categories.get(targetId)} and ${key}`);
          categories.set(targetId, key);
          linked.push(targetId);
          const target = byId.get(targetId);
          if (!target) failRecord(record, `unresolved connection ${targetId}`);
          if (!target[categoryReciprocals[key]].includes(record.id)) failRecord(record, `nonreciprocal ${key} connection to ${targetId}`);
          const note = record.connectionNotes[targetId];
          if (typeof note !== 'string' || !note.trim()) failRecord(record, `missing connection note for ${targetId}`);
          if (!hasEnglishText(note)) failRecord(record, `non-English connection note for ${targetId}`);
          if (target.connectionNotes[record.id] !== note) failRecord(record, `nonreciprocal connection note for ${targetId}`);
        }
      }
      if (!linked.length) failRecord(record, 'missing connection');
      const extra = Object.keys(record.connectionNotes).find(id => !linked.includes(id));
      if (extra !== undefined) failRecord(record, `extra connection note key ${describeRuleValue(extra)}`);
    }
  }

  validateStudyGraph();

  function validateUnitCards() {
    const unitCardKeys = ['examSkills', 'id', 'kind', 'prompt', 'role', 'summary', 'takeaways', 'title'];
    const seenKinds = new Set();
    const seenIds = new Set();
    for (const card of UNIT_CARD_LIST) {
      if (!isPlainObject(card)) failCard(card, 'card must be a non-null plain object');
      if (Object.keys(card).sort().join(',') !== unitCardKeys.join(',')) {
        failCard(card, 'card must contain exactly the approved fields');
      }
      if (!['context', 'synthesis'].includes(card.kind)) failCard(card, `invalid kind ${describeRuleValue(card.kind)}`);
      if (seenKinds.has(card.kind)) failCard(card, `duplicate kind ${card.kind}`);
      seenKinds.add(card.kind);
      if (seenIds.has(card.id)) failCard(card, 'duplicate card ID');
      seenIds.add(card.id);
      if (!/^apwh-u3-(context|synthesis)-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(card.id)) failCard(card, 'invalid stable ID');
      for (const field of ['role', 'title', 'summary', 'prompt']) {
        if (typeof card[field] !== 'string' || !card[field].trim()) failCard(card, `missing ${field}`);
        if (!hasEnglishText(card[field])) failCard(card, `non-English ${field}`);
      }
      if (!Array.isArray(card.examSkills)) failCard(card, 'examSkills must be an array');
      if (!card.examSkills.length) failCard(card, 'missing examSkills');
      if (card.examSkills.length > 2) failCard(card, 'too many examSkills');
      for (const skill of card.examSkills) {
        if (typeof skill !== 'string' || !skill.trim() || !VALID_EXAM_SKILLS.has(skill)) failCard(card, `invalid examSkill ${describeRuleValue(skill)}`);
        if (card.examSkills.indexOf(skill) !== card.examSkills.lastIndexOf(skill)) failCard(card, `duplicate examSkill ${skill}`);
      }
      if (!Array.isArray(card.takeaways)) failCard(card, 'takeaways must be an array');
      if (card.takeaways.length !== 3) failCard(card, 'takeaways must contain exactly three items');
      for (const takeaway of card.takeaways) {
        if (typeof takeaway !== 'string' || !takeaway.trim()) failCard(card, 'empty takeaway');
        if (!hasEnglishText(takeaway)) failCard(card, 'non-English takeaway');
      }
    }
    if (UNIT_CARD_LIST.length !== 2 || !seenKinds.has('context') || !seenKinds.has('synthesis')) {
      throw new Error('Invalid Unit 3 unit cards: expected exactly context and synthesis');
    }
  }

  validateUnitCards();
  const UNIT_CARDS = Object.freeze(Object.fromEntries(
    UNIT_CARD_LIST.map(card => [card.kind, freezeUnitCard(card)]),
  ));

  function compareRecords(a, b) {
    return a.sequence - b.sequence
      || a.startYear - b.startYear
      || a.endYear - b.endYear
      || a.id.localeCompare(b.id);
  }

  const byLocation = new Map(Object.keys(LOCATIONS).map(number => [number, Object.freeze(
    STUDY_EVENTS.filter(record => record.locationNumber === number).sort(compareRecords),
  )]));

  const api = Object.freeze({
    unitId: UNIT_ID,
    unitNumber: UNIT_NUMBER,
    locationNumbers: Object.freeze(Object.keys(LOCATIONS)),
    locationName(number) {
      const key = String(number);
      return Object.prototype.hasOwnProperty.call(LOCATIONS, key) ? LOCATIONS[key] : null;
    },
    getByLocation(number) { return [...(byLocation.get(String(number)) || [])]; },
    getById(id) { return byId.get(String(id)) || null; },
    getUnitCard(kind) {
      const key = String(kind);
      return Object.prototype.hasOwnProperty.call(UNIT_CARDS, key) ? UNIT_CARDS[key] : null;
    },
    compareRecords,
    records: STUDY_EVENTS,
    unitCards: UNIT_CARDS,
  });

  Object.defineProperty(root, 'APWH_U3_LOCATION_STUDY', {
    configurable: false,
    enumerable: true,
    writable: false,
    value: api,
  });
})(globalThis);
