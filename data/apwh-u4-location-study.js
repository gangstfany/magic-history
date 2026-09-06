(function publishUnit4LocationStudy(root) {
  'use strict';

  if (Object.prototype.hasOwnProperty.call(root, 'APWH_U4_LOCATION_STUDY')) {
    throw new Error('Invalid Unit 4 global APWH_U4_LOCATION_STUDY: refusing to overwrite existing value');
  }

  const UNIT_ID = 'u4';
  const UNIT_NUMBER = 4;
  const LOCATION_NUMBERS = Object.freeze(['42', '2', '68', '57', '60', '87', '12', '49']);
  const LOCATIONS = Object.freeze({
    '42': 'Maritime Portugal · Lisbon',
    '2': 'Portuguese Trading-Post Empire · Malacca',
    '68': 'Caribbean Colonization · Santo Domingo',
    '57': 'Spanish Silver Economy · Potosí',
    '60': 'Brazilian Sugar Plantations · Salvador',
    '87': 'Atlantic Slave Trade · Elmina',
    '12': 'Manila Galleons · Manila',
    '49': 'Colonial New Spain · Tenochtitlan / Mexico City',
  });
  const VALID_TOPIC_CODES = new Set(['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8']);
  const VALID_THEME_IDS = new Set(['GOV', 'ECN', 'CDI', 'SIO', 'TEC', 'ENV']);
  const VALID_EXAM_SKILLS = new Set(['Causation', 'Comparison', 'CCOT', 'Contextualization']);
  const VALID_MAIN_EVENTS = new Set([
    'world-event-42-0', 'world-event-2-2', 'world-event-68-0', 'world-event-57-0',
    'world-event-60-0', 'world-event-87-0', 'world-event-12-0', 'world-event-49-7',
  ]);
  const CANONICAL_LOCATION_BINDINGS = Object.freeze({
    '42': 'world-event-42-0',
    '2': 'world-event-2-2',
    '68': 'world-event-68-0',
    '57': 'world-event-57-0',
    '60': 'world-event-60-0',
    '87': 'world-event-87-0',
    '12': 'world-event-12-0',
    '49': 'world-event-49-7',
  });

  function describeRuleValue(value) {
    if (value === '') return '""';
    try {
      return String(value);
    } catch {
      return '(unprintable value)';
    }
  }
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
    let id;
    try {
      id = record?.id;
    } catch {
      id = '(unprintable value)';
    }
    const diagnosticId = id === undefined || id === null
      || (typeof id === 'string' && !id.trim())
      ? '(missing ID)'
      : describeRuleValue(id);
    throw new Error(`Invalid Unit 4 study record ${diagnosticId}: ${rule}`);
  }
  function failCard(card, rule) {
    let kind;
    let id;
    try {
      kind = card?.kind;
      id = card?.id;
    } catch {
      kind = '(unprintable value)';
      id = '(unprintable value)';
    }
    const diagnosticKind = kind === undefined || kind === null
      || (typeof kind === 'string' && !kind.trim())
      ? '(missing kind)'
      : describeRuleValue(kind);
    const diagnosticId = id === undefined || id === null
      || (typeof id === 'string' && !id.trim())
      ? '(missing ID)'
      : describeRuleValue(id);
    throw new Error(`Invalid Unit 4 unit card ${diagnosticKind} ${diagnosticId}: ${rule}`);
  }
  function validateValues(record, values, allowed, field, singular) {
    if (!Array.isArray(values)) failRecord(record, `${field} must be an array`);
    if (!values.length) failRecord(record, `missing ${field}`);
    for (const value of values) {
      if (!allowed.has(value)) failRecord(record, `invalid ${singular} ${describeRuleValue(value)}`);
      if (values.indexOf(value) !== values.lastIndexOf(value)) {
        failRecord(record, `duplicate ${singular} ${describeRuleValue(value)}`);
      }
    }
  }
  function validateDate(record, dateLabel, startYear, endYear) {
    if (typeof dateLabel !== 'string' || !dateLabel.trim()) failRecord(record, 'missing dateLabel');
    if (!/^(?:\d{4}s|\d{3,4}(?:–\d{3,4})?)$/.test(dateLabel)) {
      failRecord(record, `invalid dateLabel ${describeRuleValue(dateLabel)}`);
    }
    if (!Number.isInteger(startYear)) failRecord(record, 'startYear must be an integer');
    if (!Number.isInteger(endYear)) failRecord(record, 'endYear must be an integer');
    if (startYear > endYear) failRecord(record, `startYear ${startYear} exceeds endYear ${endYear}`);
    const decade = dateLabel.match(/^(\d{4})s$/);
    const labelYears = decade
      ? [Number(decade[1]), Number(decade[1]) + 99]
      : [...dateLabel.matchAll(/\d{3,4}/g)].map(match => Number(match[0]));
    const labelStartYear = labelYears[0];
    const labelEndYear = labelYears.at(-1);
    if (labelStartYear !== startYear || labelEndYear !== endYear) {
      failRecord(record, `dateLabel years ${labelStartYear}–${labelEndYear} do not match startYear ${startYear} and endYear ${endYear}`);
    }
  }

  const STUDY_MANIFEST = [
    ['apwh-u4-lisbon-atlantic-constraints', '42', 1, 'Atlantic Constraints and Overseas Expansion', '1400s', 1400, 1499, 'world-event-42-0', ['4.1', '4.2'], ['ENV', 'ECN', 'GOV'], ['Causation', 'Contextualization']],
    ['apwh-u4-lisbon-navigation-state-sponsorship', '42', 2, 'Navigation Knowledge and State Sponsorship', '1400s', 1400, 1499, 'world-event-42-0', ['4.1', '4.2'], ['TEC', 'GOV'], ['Causation']],
    ['apwh-u4-lisbon-sea-route-indian-ocean', '42', 3, 'A Sea Route to the Indian Ocean', '1488–1498', 1488, 1498, 'world-event-42-0', ['4.2', '4.8'], ['ECN', 'GOV'], ['Causation', 'CCOT']],
    ['apwh-u4-malacca-existing-indian-ocean-networks', '2', 1, 'Indian Ocean Trade before Portuguese Arrival', '1450–1500', 1450, 1500, 'world-event-2-2', ['4.2', '4.8'], ['ECN', 'CDI'], ['Comparison', 'CCOT']],
    ['apwh-u4-malacca-cartaz-fortified-ports', '2', 2, 'Cartaz Passes and Fortified Ports', '1511–1600', 1511, 1600, 'world-event-2-2', ['4.2', '4.4'], ['GOV', 'ECN', 'TEC'], ['Causation']],
    ['apwh-u4-malacca-asian-responses-limits', '2', 3, 'Asian Responses and the Limits of Portuguese Power', '1500–1650', 1500, 1650, 'world-event-2-2', ['4.5', '4.6'], ['GOV', 'ECN'], ['Causation', 'Comparison']],
    ['apwh-u4-santo-domingo-columbian-exchange', '68', 1, 'The Columbian Exchange in the Caribbean', '1492–1600', 1492, 1600, 'world-event-68-0', ['4.3', '4.8'], ['ENV', 'ECN', 'SIO'], ['Comparison', 'CCOT']],
    ['apwh-u4-santo-domingo-disease-demographic-collapse', '68', 2, 'Disease and Demographic Collapse', '1492–1600', 1492, 1600, 'world-event-68-0', ['4.3', '4.8'], ['ENV', 'SIO'], ['Causation', 'CCOT']],
    ['apwh-u4-santo-domingo-conquest-encomienda', '68', 3, 'Conquest and Encomienda', '1503–1542', 1503, 1542, 'world-event-68-0', ['4.3', '4.4'], ['GOV', 'ECN', 'SIO'], ['Causation', 'Contextualization']],
    ['apwh-u4-potosi-silver-mercury-boom', '57', 1, 'Silver Discovery and Mercury Refining', '1545–1600', 1545, 1600, 'world-event-57-0', ['4.4', '4.5'], ['ECN', 'TEC'], ['Causation']],
    ['apwh-u4-potosi-colonial-mita-labor', '57', 2, "Colonial Mit'a and Coerced Mining Labor", '1573–1750', 1573, 1750, 'world-event-57-0', ['4.4', '4.7'], ['SIO', 'GOV', 'ECN'], ['Comparison', 'CCOT']],
    ['apwh-u4-potosi-global-silver-flows', '57', 3, 'Potosí Silver in the Global Economy', '1570–1750', 1570, 1750, 'world-event-57-0', ['4.5', '4.8'], ['ECN'], ['Causation', 'Contextualization']],
    ['apwh-u4-salvador-sugar-plantation-expansion', '60', 1, 'Sugar and Plantation Expansion', '1500–1750', 1500, 1750, 'world-event-60-0', ['4.4', '4.5'], ['ECN', 'ENV'], ['Causation']],
    ['apwh-u4-salvador-african-chattel-slavery', '60', 2, 'From Indigenous Labor to African Chattel Slavery', '1500–1750', 1500, 1750, 'world-event-60-0', ['4.4', '4.7'], ['SIO', 'ECN', 'GOV'], ['Causation', 'Comparison']],
    ['apwh-u4-salvador-mercantilism-atlantic-profits', '60', 3, 'Mercantilism and Atlantic Profits', '1600–1750', 1600, 1750, 'world-event-60-0', ['4.5', '4.8'], ['ECN', 'GOV'], ['Causation', 'CCOT']],
    ['apwh-u4-elmina-firearms-captive-cycle', '87', 1, 'African States and the Firearms–Captive Cycle', '1500–1750', 1500, 1750, 'world-event-87-0', ['4.4', '4.6'], ['GOV', 'ECN'], ['Causation']],
    ['apwh-u4-elmina-middle-passage-chattel-slavery', '87', 2, 'Middle Passage and Chattel Slavery', '1500–1750', 1500, 1750, 'world-event-87-0', ['4.4', '4.7'], ['SIO', 'ECN'], ['Causation', 'Contextualization']],
    ['apwh-u4-elmina-african-demographic-political-effects', '87', 3, 'Demographic and Political Effects in Africa', '1500–1750', 1500, 1750, 'world-event-87-0', ['4.5', '4.8'], ['SIO', 'GOV', 'ECN'], ['Causation', 'CCOT']],
    ['apwh-u4-manila-galleon-route', '12', 1, 'The Manila Galleon Route', '1565–1750', 1565, 1750, 'world-event-12-0', ['4.4', '4.5'], ['ECN', 'TEC', 'GOV'], ['Causation']],
    ['apwh-u4-manila-silver-asian-goods', '12', 2, 'American Silver for Asian Goods', '1570–1750', 1570, 1750, 'world-event-12-0', ['4.5', '4.8'], ['ECN'], ['Causation', 'Comparison']],
    ['apwh-u4-manila-pacific-commercial-network', '12', 3, 'A Pacific Commercial Network', '1570–1750', 1570, 1750, 'world-event-12-0', ['4.5', '4.8'], ['ECN', 'CDI'], ['CCOT', 'Contextualization']],
    ['apwh-u4-new-spain-tenochtitlan-mexico-city', '49', 1, 'From Tenochtitlan to Mexico City', '1521–1600', 1521, 1600, 'world-event-49-7', ['4.3', '4.4'], ['GOV', 'CDI'], ['Causation', 'CCOT']],
    ['apwh-u4-new-spain-casta-colonial-governance', '49', 2, 'Casta and Colonial Governance', '1600–1750', 1600, 1750, 'world-event-49-7', ['4.5', '4.7'], ['SIO', 'GOV'], ['Comparison', 'Contextualization']],
    ['apwh-u4-new-spain-syncretism-resistance', '49', 3, 'Syncretism, Resistance, and Social Change', '1521–1750', 1521, 1750, 'world-event-49-7', ['4.6', '4.7', '4.8'], ['CDI', 'SIO'], ['Causation', 'CCOT']],
  ];

  validateManifestRows(STUDY_MANIFEST);

  function validateManifestRows(rows) {
    const seenIds = new Set();
    for (const row of rows) {
      const record = { id: Array.isArray(row) ? row[0] : null };
      if (!Array.isArray(row) || row.length !== 11) failRecord(record, 'manifest row must be an eleven-field array');
      const [id, locationNumber, sequence, title, dateLabel, startYear, endYear,
        mainEventKey, topicCodes, themeIds, examSkills] = row;
      if (typeof id !== 'string' || !id.trim()) failRecord(record, 'manifest ID must be a nonempty string');
      if (!/^apwh-u4-(?:lisbon|malacca|santo-domingo|potosi|salvador|elmina|manila|new-spain)-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
        failRecord(record, `invalid stable ID ${describeRuleValue(id)}`);
      }
      if (seenIds.has(id)) failRecord(record, 'duplicate record ID');
      seenIds.add(id);
      if (!LOCATION_NUMBERS.includes(locationNumber)) failRecord(record, `invalid locationNumber ${locationNumber}`);
      if (!Number.isInteger(sequence)) failRecord(record, 'manifest sequence must be an integer');
      if (![1, 2, 3].includes(sequence)) failRecord(record, `invalid sequence ${sequence}`);
      if (typeof title !== 'string' || !title.trim()) failRecord(record, 'manifest title must be a nonempty string');
      validateDate(record, dateLabel, startYear, endYear);
      if (!VALID_MAIN_EVENTS.has(mainEventKey)) failRecord(record, `invalid mainEventKey ${mainEventKey}`);
      if (mainEventKey !== CANONICAL_LOCATION_BINDINGS[locationNumber]) {
        failRecord(record, `invalid mainEventKey ${mainEventKey} for location ${locationNumber}`);
      }
      validateValues(record, topicCodes, VALID_TOPIC_CODES, 'topicCodes', 'topicCode');
      validateValues(record, themeIds, VALID_THEME_IDS, 'themeIds', 'themeId');
      validateValues(record, examSkills, VALID_EXAM_SKILLS, 'examSkills', 'examSkill');
      if (examSkills.length > 2) failRecord(record, 'too many examSkills');
    }
    if (rows.length > 24) failRecord({ id: rows[24]?.[0] }, 'expected exactly 24 records');
    if (rows.length < 24) failRecord({ id: '(missing record)' }, 'expected exactly 24 records');
    for (const locationNumber of LOCATION_NUMBERS) {
      const locationRows = rows.filter(row => row[1] === locationNumber);
      if (locationRows.length !== 3) {
        failRecord({ id: locationRows[0]?.[0] || `(location ${locationNumber})` },
          `location ${locationNumber} must contain exactly three records`);
      }
      const sequences = locationRows.map(row => row[2]);
      if (new Set(sequences).size !== sequences.length) {
        const duplicate = sequences.find((value, index) => sequences.indexOf(value) !== index);
        failRecord({ id: locationRows[0][0] }, `duplicate sequence ${duplicate} at location ${locationNumber}`);
      }
      if ([...sequences].sort().join(',') !== '1,2,3') {
        failRecord({ id: locationRows[0][0] }, `location ${locationNumber} must use sequences 1,2,3`);
      }
    }
    const coveredTopics = new Set(rows.flatMap(row => row[8]));
    if ([...VALID_TOPIC_CODES].some(topic => !coveredTopics.has(topic))) {
      failRecord({ id: '(manifest)' }, 'topicCodes must cover 4.1 through 4.8');
    }
  }

  const STUDY_CONTEXT = Object.freeze(Object.fromEntries(STUDY_MANIFEST.map(([
    id, locationNumber, sequence, title, dateLabel, startYear, endYear,
    mainEventKey, topicCodes, themeIds, examSkills,
  ]) => [id, Object.freeze({
    locationNumber, sequence, title, dateLabel, startYear, endYear, mainEventKey,
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
    if (!cause) throw new Error(`Invalid Unit 4 study connection causal: missing cause ${causeId}`);
    if (!effect) throw new Error(`Invalid Unit 4 study connection causal: missing effect ${effectId}`);
    if (causeId === effectId) throw new Error(`Invalid Unit 4 study connection causal: self connection ${causeId}`);
    cause.effectStudyPointIds.push(effectId);
    effect.causeStudyPointIds.push(causeId);
    cause.connectionNotes[effectId] = note;
    effect.connectionNotes[causeId] = note;
  }

  function addRelatedConnection(leftId, rightId, note) {
    const left = CONNECTION_DATA.get(leftId);
    const right = CONNECTION_DATA.get(rightId);
    if (!left) throw new Error(`Invalid Unit 4 study connection related: missing left ${leftId}`);
    if (!right) throw new Error(`Invalid Unit 4 study connection related: missing right ${rightId}`);
    if (leftId === rightId) throw new Error(`Invalid Unit 4 study connection related: self connection ${leftId}`);
    left.relatedStudyPointIds.push(rightId);
    right.relatedStudyPointIds.push(leftId);
    left.connectionNotes[rightId] = note;
    right.connectionNotes[leftId] = note;
  }

  addCausalConnection('apwh-u4-lisbon-atlantic-constraints', 'apwh-u4-lisbon-navigation-state-sponsorship', 'Atlantic geography and restricted overland access increased Portuguese incentives to seek an ocean route.');
  addCausalConnection('apwh-u4-lisbon-navigation-state-sponsorship', 'apwh-u4-lisbon-sea-route-indian-ocean', 'State sponsorship combined navigational knowledge, ship design, and accumulated sailing experience into longer voyages.');
  addCausalConnection('apwh-u4-malacca-existing-indian-ocean-networks', 'apwh-u4-malacca-cartaz-fortified-ports', 'Existing monsoon commerce made Malacca valuable to Portuguese officials seeking to redirect and tax trade.');
  addCausalConnection('apwh-u4-malacca-cartaz-fortified-ports', 'apwh-u4-malacca-asian-responses-limits', 'Fortified ports and cartaz passes provoked resistance and competition that limited Portuguese control.');
  addCausalConnection('apwh-u4-santo-domingo-columbian-exchange', 'apwh-u4-santo-domingo-disease-demographic-collapse', 'Transoceanic transfers brought unfamiliar pathogens into Caribbean populations.');
  addCausalConnection('apwh-u4-santo-domingo-disease-demographic-collapse', 'apwh-u4-santo-domingo-conquest-encomienda', 'Demographic collapse weakened Indigenous communities and helped Spanish conquerors impose labor and tribute demands.');
  addCausalConnection('apwh-u4-potosi-silver-mercury-boom', 'apwh-u4-potosi-colonial-mita-labor', 'Rich silver deposits became far more profitable when mercury amalgamation raised usable output.');
  addCausalConnection('apwh-u4-potosi-colonial-mita-labor', 'apwh-u4-potosi-global-silver-flows', "Colonial officials expanded the mit'a to supply the labor needed for sustained silver production.");
  addCausalConnection('apwh-u4-salvador-sugar-plantation-expansion', 'apwh-u4-salvador-african-chattel-slavery', 'Profitable sugar cultivation created a large and continuing demand for coerced plantation labor.');
  addCausalConnection('apwh-u4-salvador-african-chattel-slavery', 'apwh-u4-salvador-mercantilism-atlantic-profits', 'Hereditary chattel slavery supported plantation output whose sale enriched merchants and imperial treasuries.');
  addCausalConnection('apwh-u4-elmina-firearms-captive-cycle', 'apwh-u4-elmina-middle-passage-chattel-slavery', 'European demand and firearms exchanges encouraged some states and merchants to intensify captive-taking.');
  addCausalConnection('apwh-u4-elmina-middle-passage-chattel-slavery', 'apwh-u4-elmina-african-demographic-political-effects', 'Atlantic shipment converted captives into hereditary property while producing resistance and lethal human loss.');
  addCausalConnection('apwh-u4-manila-galleon-route', 'apwh-u4-manila-silver-asian-goods', 'Spanish rule in the Philippines established a regular transpacific shipping route.');
  addCausalConnection('apwh-u4-manila-silver-asian-goods', 'apwh-u4-manila-pacific-commercial-network', 'Chinese demand for silver and American demand for Asian goods sustained a Pacific commercial network.');
  addCausalConnection('apwh-u4-new-spain-tenochtitlan-mexico-city', 'apwh-u4-new-spain-casta-colonial-governance', 'Spanish conquest rebuilt the Mexica capital as the administrative center of New Spain.');
  addCausalConnection('apwh-u4-new-spain-casta-colonial-governance', 'apwh-u4-new-spain-syncretism-resistance', 'Colonial ancestry hierarchies generated both cultural adaptation and resistance among Indigenous, African, and mixed communities.');
  addCausalConnection('apwh-u4-lisbon-sea-route-indian-ocean', 'apwh-u4-malacca-cartaz-fortified-ports', 'Portuguese ocean access enabled officials to seize Malacca and enforce cartaz passes at a strategic port.');
  addCausalConnection('apwh-u4-santo-domingo-disease-demographic-collapse', 'apwh-u4-salvador-african-chattel-slavery', 'Caribbean population collapse pushed colonists toward the forced migration and enslavement of Africans in Atlantic plantations.');
  addCausalConnection('apwh-u4-salvador-sugar-plantation-expansion', 'apwh-u4-elmina-firearms-captive-cycle', 'Expanding Brazilian sugar production increased demand for captives supplied through West African coastal trade.');
  addCausalConnection('apwh-u4-potosi-global-silver-flows', 'apwh-u4-manila-silver-asian-goods', 'American silver carried through Pacific routes paid for Asian goods and linked Potosí to Manila and Chinese markets.');

  addRelatedConnection('apwh-u4-malacca-cartaz-fortified-ports', 'apwh-u4-santo-domingo-conquest-encomienda', 'Compare a maritime trading-post empire that controlled strategic routes with a territorial colony that controlled land, labor, and tribute.');
  addRelatedConnection('apwh-u4-potosi-colonial-mita-labor', 'apwh-u4-salvador-african-chattel-slavery', "Compare the colonial mit'a, adapted from an earlier Andean obligation, with racialized hereditary chattel slavery on Atlantic plantations.");
  addRelatedConnection('apwh-u4-malacca-existing-indian-ocean-networks', 'apwh-u4-manila-pacific-commercial-network', 'Compare the older monsoon-based Indian Ocean network with the newer transpacific network centered on Manila and Acapulco.');
  addRelatedConnection('apwh-u4-elmina-african-demographic-political-effects', 'apwh-u4-new-spain-casta-colonial-governance', 'Compare political and demographic disruption in West Africa with ancestry-based social ranking inside colonial New Spain.');
  addRelatedConnection('apwh-u4-santo-domingo-columbian-exchange', 'apwh-u4-manila-silver-asian-goods', 'Compare the multidirectional Columbian Exchange with the silver-for-goods circuit that tied the Americas to Asian markets.');

  const RAW_RECORDS = [
    {
      id: 'apwh-u4-lisbon-atlantic-constraints',
      locationNumber: '42',
      mainEventKey: 'world-event-42-0',
      title: 'Atlantic Constraints and Overseas Expansion',
      dateLabel: '1400s',
      startYear: 1400,
      endYear: 1499,
      summary: 'Portugal faced Atlantic opportunities and Iberian limits while Castile and Aragon constrained easy territorial expansion on the peninsula.',
      significance: "Portugal's Atlantic position, Iberian limits, and primogeniture encouraged overseas routes, but geography created incentives rather than making expansion inevitable.",
      keyPeople: [{ name: 'Portuguese nobles and merchants', role: 'Backed voyages offering traders, the crown, and younger noble sons new paths to wealth and status.' }],
      keyTerms: [{ term: 'primogeniture', explanation: 'Inheritance favoring the eldest son, which could push younger nobles to seek advancement elsewhere.' }, { term: 'Atlantic position', explanation: "Portugal's access to Atlantic islands, winds, and coastal routes." }],
      evidence: ['Castile and Aragon occupied much of the neighboring Iberian land frontier available to Portuguese expansion.', 'Portuguese sailors used Atlantic islands and the African coast as stages for increasingly ambitious voyages.'],
      examConnection: 'Use these constraints as contextual causes, while qualifying the claim: political choices, finance, and technology were also necessary.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.1 and 4.2' },
    },
    {
      id: 'apwh-u4-lisbon-navigation-state-sponsorship',
      locationNumber: '42',
      mainEventKey: 'world-event-42-0',
      title: 'Navigation Knowledge and State Sponsorship',
      dateLabel: '1400s',
      startYear: 1400,
      endYear: 1499,
      summary: 'Portuguese voyages combined compass and astrolabe use with lateen and square sails, shipbuilding experience, and royal finance.',
      significance: 'Knowledge from multiple Afro-Eurasian traditions became more powerful when the Portuguese state financed voyages and sustained repeated experimentation.',
      keyPeople: [{ name: 'Prince Henry the Navigator', role: 'Sponsored Portuguese exploration and concentrated navigators, mapmakers, and royal resources on Atlantic and African routes.' }],
      keyTerms: [{ term: 'astrolabe', explanation: 'An instrument sailors adapted to estimate latitude by observing celestial bodies.' }, { term: 'caravel rig', explanation: 'A later mixed Portuguese sail plan combining triangular lateen sails with square sails.' }],
      evidence: ['Portuguese navigators used the compass and astrolabe alongside accumulated Mediterranean, African, and Asian knowledge.', 'Royal sponsorship paid for ships, crews, information gathering, and repeated voyages along the African coast.'],
      examConnection: 'Link borrowed navigational knowledge to state capacity; neither technology alone nor royal ambition alone explains sustained exploration.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.1 and 4.2' },
    },
    {
      id: 'apwh-u4-lisbon-sea-route-indian-ocean',
      locationNumber: '42',
      mainEventKey: 'world-event-42-0',
      title: 'A Sea Route to the Indian Ocean',
      dateLabel: '1488–1498',
      startYear: 1488,
      endYear: 1498,
      summary: 'Bartolomeu Dias rounded southern Africa in 1488, and Vasco da Gama reached India by sea in 1498.',
      significance: 'The route around the Cape of Good Hope connected Portugal directly to Indian Ocean commerce and redirected some exchange through Atlantic-facing ports.',
      keyPeople: [{ name: 'Bartolomeu Dias and Vasco da Gama', role: 'Dias rounded the cape in 1488; da Gama used that route to reach India in 1498.' }],
      keyTerms: [{ term: 'Cape of Good Hope', explanation: 'The southern African cape whose rounding opened a sea route toward the Indian Ocean.' }, { term: 'sea route to India', explanation: 'The oceanic passage around Africa that let Portuguese ships reach Indian Ocean ports.' }],
      evidence: ['Dias rounded the southern tip of Africa in 1488 and demonstrated that the Atlantic connected to waters leading east.', 'Da Gama arrived at Calicut in India in 1498 after sailing around the Cape of Good Hope.'],
      examConnection: 'Use the voyages as a causal sequence in Atlantic-to-Indian Ocean expansion, without mislabeling this route as Pacific.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.2 and 4.8' },
    },
    {
      id: 'apwh-u4-malacca-existing-indian-ocean-networks',
      locationNumber: '2',
      mainEventKey: 'world-event-2-2',
      title: 'Indian Ocean Trade before Portuguese Arrival',
      dateLabel: '1450–1500',
      startYear: 1450,
      endYear: 1500,
      summary: 'Muslim, Hindu, and Southeast Asian merchants used monsoon winds to exchange goods through Malacca long before Portuguese conquest.',
      significance: 'Portuguese sailors entered a mature commercial system they did not create, changing control at strategic ports without originating Indian Ocean trade.',
      keyPeople: [{ name: 'Muslim, Hindu, and Southeast Asian merchants', role: 'Sustained commercial communities and seasonal voyages linking Malacca to wider maritime networks.' }],
      keyTerms: [{ term: 'monsoon winds', explanation: 'Seasonally reversing winds that structured Indian Ocean sailing schedules.' }, { term: 'entrepot', explanation: 'A port where merchants store, exchange, and re-export goods from several regions.' }],
      evidence: ['Merchants timed voyages to predictable monsoon cycles before any Portuguese ship reached Malacca.', 'Malacca already linked textiles, spices, ceramics, and other goods moving among Asian markets.'],
      examConnection: 'Use Malacca for CCOT: Portuguese coercion changed parts of the network while Asian merchants, monsoons, and older routes continued.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.2 and 4.8' },
    },
    {
      id: 'apwh-u4-malacca-cartaz-fortified-ports',
      locationNumber: '2',
      mainEventKey: 'world-event-2-2',
      title: 'Cartaz Passes and Fortified Ports',
      dateLabel: '1511–1600',
      startYear: 1511,
      endYear: 1600,
      summary: 'After conquering Malacca in 1511, Portuguese forces used forts, cannon, and cartaz passes to tax and redirect maritime traffic.',
      significance: "Afonso de Albuquerque's strategy built a trading-post empire controlling selected sea lanes and ports rather than most inland territory.",
      keyPeople: [{ name: 'Afonso de Albuquerque', role: 'Directed the 1511 conquest of Malacca and strengthened Portuguese control through fortified ports.' }],
      keyTerms: [{ term: 'cartaz', explanation: 'A Portuguese naval pass ships were pressured to buy and display in controlled waters.' }, { term: 'trading-post empire', explanation: 'An empire based on fortified ports and sea-lane control instead of broad inland conquest.' }],
      evidence: ['Portuguese forces captured Malacca in 1511 and fortified the port with cannon.', 'Officials demanded passes, collected duties, and threatened ships trading outside Portuguese rules.'],
      examConnection: 'Explain how cannon, forts, and passes taxed routes, then distinguish coastal leverage from inland territorial rule.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.2 and 4.4' },
    },
    {
      id: 'apwh-u4-malacca-asian-responses-limits',
      locationNumber: '2',
      mainEventKey: 'world-event-2-2',
      title: 'Asian Responses and the Limits of Portuguese Power',
      dateLabel: '1500–1650',
      startYear: 1500,
      endYear: 1650,
      summary: 'Asian states and merchants resisted, negotiated with, or redirected trade around Portuguese pressure in ways that varied by place and time.',
      significance: 'Aceh and other rivals challenged Portuguese influence, the Dutch VOC later displaced it, and Nagasaki restrictions show that Asian responses were not uniform or passive.',
      keyPeople: [{ name: 'Dutch VOC and the rulers of Aceh', role: 'Competed with Portuguese shipping and fortifications through different commercial and military strategies.' }],
      keyTerms: [{ term: 'Dutch VOC', explanation: 'A chartered Dutch company combining trade, armed force, and state-backed privileges in Asia.' }, { term: 'Nagasaki restriction', explanation: 'Japanese policies confining and regulating selected European trade.' }],
      evidence: ['Aceh and other powers fought or competed with Portuguese Malacca and supported alternative routes.', 'The Dutch VOC captured Malacca in 1641, while Japanese rulers restricted European access through Nagasaki.'],
      examConnection: 'Compare Acehnese, Dutch, and Japanese responses to show how local political capacity limited European trading-post power.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.5 and 4.6' },
    },
    {
      id: 'apwh-u4-santo-domingo-columbian-exchange',
      locationNumber: '68',
      mainEventKey: 'world-event-68-0',
      title: 'The Columbian Exchange in the Caribbean',
      dateLabel: '1492–1600',
      startYear: 1492,
      endYear: 1600,
      summary: 'Contact joined Caribbean, American, African, and Eurasian ecologies through transfers of crops, animals, people, and pathogens.',
      significance: 'The Columbian Exchange was bidirectional, but unequal power and biological vulnerability made its effects especially destructive for Taíno communities.',
      keyPeople: [{ name: 'Taíno communities', role: 'Experienced new animals, crops, diseases, labor demands, and colonial settlement after sustained Atlantic contact.' }],
      keyTerms: [{ term: 'Columbian Exchange', explanation: 'The transfer of plants, animals, pathogens, and people between the Americas and Afro-Eurasia after 1492.' }, { term: 'ecological transfer', explanation: 'The movement of organisms and environmental practices between separated ecosystems.' }],
      evidence: ['Europeans brought horses, cattle, pigs, wheat, and pathogens to Caribbean islands.', 'American crops moved eastward while forced African migration added people and foodways to Atlantic societies.'],
      examConnection: 'Compare transfers in both directions, then explain why bidirectional exchange did not mean equal effects on participating populations.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.3 and 4.8' },
    },
    {
      id: 'apwh-u4-santo-domingo-disease-demographic-collapse',
      locationNumber: '68',
      mainEventKey: 'world-event-68-0',
      title: 'Disease and Demographic Collapse',
      dateLabel: '1492–1600',
      startYear: 1492,
      endYear: 1600,
      summary: 'Smallpox and other Afro-Eurasian diseases caused catastrophic mortality among Indigenous Caribbean peoples who lacked prior exposure.',
      significance: 'Epidemics weakened communities and aided Spanish conquest, but conquest was not automatic because warfare, alliances, labor, and policy also shaped outcomes.',
      keyPeople: [{ name: 'Indigenous Caribbean communities', role: 'Faced repeated epidemics alongside displacement, violence, and colonial labor demands.' }],
      keyTerms: [{ term: 'smallpox', explanation: 'A contagious disease that caused devastating mortality in populations without previous exposure.' }, { term: 'demographic collapse', explanation: 'A severe population decline produced by interacting disease, violence, hunger, and exploitation.' }],
      evidence: ['Smallpox and other diseases spread through Caribbean populations after sustained European contact.', 'Mortality combined with warfare, displacement, and forced labor to reduce Indigenous populations sharply.'],
      examConnection: 'Use disease as a major cause aiding conquest, while rejecting automatic explanations by adding warfare, alliance, and labor evidence.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.3 and 4.8' },
    },
    {
      id: 'apwh-u4-santo-domingo-conquest-encomienda',
      locationNumber: '68',
      mainEventKey: 'world-event-68-0',
      title: 'Conquest and Encomienda',
      dateLabel: '1503–1542',
      startYear: 1503,
      endYear: 1542,
      summary: 'Spanish encomenderos claimed rights to Indigenous labor and tribute in Santo Domingo as conquest became colonial administration.',
      significance: 'Encomienda organized coercive labor and tribute without automatically granting Indigenous land or making workers identical to enslaved African chattel.',
      keyPeople: [{ name: 'Bartolomé de las Casas', role: 'Condemned abuses of Indigenous people and pressed the Spanish crown to reform colonial labor practices.' }],
      keyTerms: [{ term: 'encomienda', explanation: 'A crown grant authorizing a colonist to demand labor or tribute from designated Indigenous communities.' }, { term: 'New Laws', explanation: 'The 1542 reforms intended to restrict Indigenous enslavement and curb hereditary encomienda power.' }],
      evidence: ['The crown established encomienda arrangements in Hispaniola during the early sixteenth century.', 'Las Casas publicized abuses, and the New Laws of 1542 attempted to limit colonists\' control.'],
      examConnection: 'Distinguish encomienda labor and tribute from land ownership and hereditary African chattel slavery when comparing labor systems.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.3 and 4.4' },
    },
    {
      id: 'apwh-u4-potosi-silver-mercury-boom',
      locationNumber: '57',
      mainEventKey: 'world-event-57-0',
      title: 'Silver Discovery and Mercury Refining',
      dateLabel: '1545–1600',
      startYear: 1545,
      endYear: 1600,
      summary: 'After silver was discovered at Potosí in 1545, mercury amalgamation increased the lower-grade ore that refiners could process.',
      significance: 'Like Zacatecas in New Spain, Potosí generated extraordinary output and profit, while mercury exposure, dangerous shafts, and harsh labor made the boom deadly.',
      keyPeople: [{ name: 'Potosí mine owners and refiners', role: 'Combined capital, coerced labor, and mercury processing to expand colonial silver production.' }],
      keyTerms: [{ term: 'mercury amalgamation', explanation: 'A refining process using mercury to separate silver from crushed ore.' }, { term: 'Zacatecas', explanation: 'A major silver-mining center in New Spain useful for comparison with Potosí.' }],
      evidence: ['The 1545 Potosí discovery produced one of the Spanish Empire\'s largest silver centers.', 'Mercury processing raised output from lower-grade ore but exposed workers and communities to poison.'],
      examConnection: 'Compare Potosí and Zacatecas for technology-driven output and profit while treating danger and coerced labor as part of the system.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.4 and 4.5' },
    },
    {
      id: 'apwh-u4-potosi-colonial-mita-labor',
      locationNumber: '57',
      mainEventKey: 'world-event-57-0',
      title: "Colonial Mit'a and Coerced Mining Labor",
      dateLabel: '1573–1750',
      startYear: 1573,
      endYear: 1750,
      summary: "Viceroy Francisco de Toledo reorganized a colonial mit'a in 1573 to draft Andean communities for labor at Potosí and Huancavelica.",
      significance: "Colonial officials adapted an Inca labor obligation to Spanish mining, but the colonial mit'a was not identical to reciprocal service under Inca rule.",
      keyPeople: [{ name: 'Viceroy Francisco de Toledo', role: "Reorganized communities and the colonial mit'a to supply workers to Potosí and Huancavelica." }],
      keyTerms: [{ term: "mit'a", explanation: 'A rotating labor obligation adapted into a coercive colonial mining draft.' }, { term: 'Huancavelica', explanation: 'The Andean mercury center supplying material essential to silver amalgamation.' }],
      evidence: ["Toledo's 1573 reforms required selected Andean communities to send rotating workers to Potosí.", 'Workers also faced dangerous mercury production at Huancavelica and separation from households.'],
      examConnection: "Compare the colonial mit'a with its Inca precedent by identifying continuity in obligation and change in purpose, coercion, and benefit.",
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.4 and 4.7' },
    },
    {
      id: 'apwh-u4-potosi-global-silver-flows',
      locationNumber: '57',
      mainEventKey: 'world-event-57-0',
      title: 'Potosí Silver in the Global Economy',
      dateLabel: '1570–1750',
      startYear: 1570,
      endYear: 1750,
      summary: 'The Spanish crown taxed American bullion as merchants carried silver into Europe and across the Pacific toward Asian markets.',
      significance: 'Potosí silver financed imperial exchange, contributed to the European Price Revolution, and met Asian demand, linking Atlantic and Pacific systems.',
      keyPeople: [{ name: 'Spanish crown officials', role: 'Taxed, registered, and directed bullion flows supporting imperial spending and long-distance trade.' }],
      keyTerms: [{ term: 'bullion', explanation: 'Precious metal valued by weight and transported for payment or reserves.' }, { term: 'Price Revolution', explanation: 'Early modern European inflation associated partly with population growth and increased silver supplies.' }],
      evidence: ['The Spanish crown collected a royal share of silver and shipped large quantities toward Europe.', 'American silver also crossed the Pacific through Manila and entered Chinese and other Asian markets.'],
      examConnection: 'Connect American production with European inflation and Asian demand to show that Potosí belonged to a global economy.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.5 and 4.8' },
    },
    {
      id: 'apwh-u4-salvador-sugar-plantation-expansion',
      locationNumber: '60',
      mainEventKey: 'world-event-60-0',
      title: 'Sugar and Plantation Expansion',
      dateLabel: '1500–1750',
      startYear: 1500,
      endYear: 1750,
      summary: 'Portuguese planters expanded sugar around Salvador through engenhos combining land, mills, capital, and coerced labor.',
      significance: 'Suitable ecology mattered, but plantation growth also depended on investment, Atlantic demand, processing infrastructure, and coercion rather than climate alone.',
      keyPeople: [{ name: 'Portuguese planters', role: 'Organized land, credit, mills, and coerced workforces to produce sugar for Atlantic markets.' }],
      keyTerms: [{ term: 'engenho', explanation: 'A Brazilian sugar-mill complex including processing equipment and often a plantation.' }, { term: 'sugar plantation', explanation: 'A large commercial estate specializing in labor-intensive cane cultivation and processing.' }],
      evidence: ['Warm coastal conditions and fertile soils supported cane cultivation near Salvador.', 'Mills required expensive machinery, coordinated labor, fuel, transport, and overseas consumers.'],
      examConnection: 'Explain plantation expansion through environmental and economic causes, with coerced labor as a central production mechanism.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.4 and 4.5' },
    },
    {
      id: 'apwh-u4-salvador-african-chattel-slavery',
      locationNumber: '60',
      mainEventKey: 'world-event-60-0',
      title: 'From Indigenous Labor to African Chattel Slavery',
      dateLabel: '1500–1750',
      startYear: 1500,
      endYear: 1750,
      summary: 'Portuguese colonists increasingly forced enslaved Africans to labor on plantations as Indigenous-only labor systems weakened.',
      significance: 'Disease, escape, resistance, and policy limited Indigenous-only labor while racialized hereditary chattel slavery became central to plantation production.',
      keyPeople: [{ name: 'Enslaved Africans', role: 'Performed skilled and exhausting plantation labor while preserving communities and resisting bondage.' }],
      keyTerms: [{ term: 'chattel slavery', explanation: 'A hereditary system treating enslaved people as legally transferable property.' }, { term: 'plantation', explanation: 'A large estate producing a commercial crop through tightly controlled labor.' }],
      evidence: ['Epidemics, flight, and resistance made a stable Indigenous-only plantation workforce difficult to maintain.', 'Atlantic traders transported growing numbers of enslaved Africans to Brazil for sugar production.'],
      examConnection: "Compare Indigenous coercion with African chattel slavery, emphasizing the later system's racialization, heredity, and property status.",
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.4 and 4.7' },
    },
    {
      id: 'apwh-u4-salvador-mercantilism-atlantic-profits',
      locationNumber: '60',
      mainEventKey: 'world-event-60-0',
      title: 'Mercantilism and Atlantic Profits',
      dateLabel: '1600–1750',
      startYear: 1600,
      endYear: 1750,
      summary: 'The Portuguese crown used monopoly rules, taxes, and regulated shipping to direct Brazilian sugar revenue through imperial channels.',
      significance: 'Mercantilist controls sought to enrich Portugal, yet merchants, planters, creditors, shippers, and foreign refiners ensured that not all gains stayed there.',
      keyPeople: [{ name: 'Portuguese crown officials', role: 'Enforced trade rules, collected taxes, and reserved colonial commerce for approved channels.' }],
      keyTerms: [{ term: 'mercantilism', explanation: 'Policies intended to increase state power by regulating trade and accumulating revenue.' }, { term: 'monopoly', explanation: 'Exclusive control over a trade, commodity, or route enforced by political authority.' }],
      evidence: ['The crown taxed sugar and regulated ships carrying colonial products across the Atlantic.', 'Planters, merchants, financiers, shippers, and northern European refiners also captured profits.'],
      examConnection: 'Use sugar to explain how mercantilism directed revenue, while qualifying any claim that every gain stayed in Portugal.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.5 and 4.8' },
    },
    {
      id: 'apwh-u4-elmina-firearms-captive-cycle',
      locationNumber: '87',
      mainEventKey: 'world-event-87-0',
      title: 'African States and the Firearms–Captive Cycle',
      dateLabel: '1500–1750',
      startYear: 1500,
      endYear: 1750,
      summary: 'Some African rulers and merchants exchanged captives for imported firearms, which could intensify warfare and generate additional captives.',
      significance: 'African intermediaries shaped the trade, but their participation does not erase the decisive force of European demand, shipping, and coercion.',
      keyPeople: [{ name: 'African rulers and merchants', role: 'Negotiated exchanges, pursued political strategies, and in some regions supplied captives to Atlantic traders.' }],
      keyTerms: [{ term: 'firearms–captive cycle', explanation: 'A reinforcing pattern in which guns aided warfare producing captives exchanged for more weapons.' }, { term: 'captive trade', explanation: 'The seizure, sale, and forced transfer of people through political and commercial networks.' }],
      evidence: ['Some states used imported guns to strengthen armies or intensify raids against rivals.', 'European plantation demand and Atlantic shipping created a large external market for captives.'],
      examConnection: 'Explain reciprocal incentives without assigning uniform responsibility: African choices mattered, and European demand and coercion remained essential.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.4 and 4.6' },
    },
    {
      id: 'apwh-u4-elmina-middle-passage-chattel-slavery',
      locationNumber: '87',
      mainEventKey: 'world-event-87-0',
      title: 'Middle Passage and Chattel Slavery',
      dateLabel: '1500–1750',
      startYear: 1500,
      endYear: 1750,
      summary: 'Captive Africans were confined in barracoons, forced onto ships, and carried through lethal Middle Passage conditions into hereditary slavery.',
      significance: 'The voyage transformed violent capture into racialized property, while resistance aboard ships showed that captives never accepted enslavement passively.',
      keyPeople: [{ name: 'Captive Africans', role: 'Endured forced embarkation and confinement while resisting through refusal, revolt, communication, and survival.' }],
      keyTerms: [{ term: 'Middle Passage', explanation: 'The forced Atlantic voyage carrying enslaved Africans to the Americas.' }, { term: 'barracoon', explanation: 'A fortified enclosure where captives could be imprisoned before forced embarkation.' }],
      evidence: ['Traders confined captives at coastal forts and barracoons before forcing them aboard ships.', 'Crowding, disease, hunger, violence, and suicide caused deaths, while captives also organized resistance.'],
      examConnection: 'Use the sequence from barracoon to ship to hereditary property to explain the construction of racialized chattel slavery.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.4 and 4.7' },
    },
    {
      id: 'apwh-u4-elmina-african-demographic-political-effects',
      locationNumber: '87',
      mainEventKey: 'world-event-87-0',
      title: 'Demographic and Political Effects in Africa',
      dateLabel: '1500–1750',
      startYear: 1500,
      endYear: 1750,
      summary: 'Atlantic enslavement removed millions and altered household, gender, military, and political relationships in affected West African regions.',
      significance: 'Gender imbalance, insecurity, and fragmentation could intensify where exports concentrated, but effects varied and were not uniform across Africa.',
      keyPeople: [{ name: 'West African communities', role: 'Adapted to population loss, insecurity, changing gender ratios, and political pressures in distinct ways.' }],
      keyTerms: [{ term: 'gender imbalance', explanation: 'An unequal ratio of men and women produced partly by selective patterns of enslavement.' }, { term: 'political fragmentation', explanation: 'The weakening or division of authority amid warfare, raids, migration, and competition.' }],
      evidence: ['Export of many working-age people changed family formation and labor burdens in heavily affected communities.', 'Warfare strengthened some states and destabilized others, with outcomes differing across regions.'],
      examConnection: 'Make a qualified causal claim naming a region and mechanism instead of treating every African society as one case.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.5 and 4.8' },
    },
    {
      id: 'apwh-u4-manila-galleon-route',
      locationNumber: '12',
      mainEventKey: 'world-event-12-0',
      title: 'The Manila Galleon Route',
      dateLabel: '1565–1750',
      startYear: 1565,
      endYear: 1750,
      summary: 'Beginning in 1565, Spanish galleons linked Manila in the Spanish Philippines with Acapulco in New Spain across the Pacific.',
      significance: 'The route created a regular cross-Pacific connection between American bullion and Asian markets, with Manila a representative port rather than the whole network.',
      keyPeople: [{ name: 'Spanish officials in the Philippines', role: 'Regulated and protected the galleon route connecting Manila to Acapulco.' }],
      keyTerms: [{ term: 'Manila galleon', explanation: 'A large Spanish vessel used on the regular Manila–Acapulco route.' }, { term: 'Acapulco', explanation: 'The New Spanish Pacific port where cargo entered American and Atlantic distribution routes.' }],
      evidence: ['The regular Manila–Acapulco route began in 1565 under Spanish imperial rule.', 'Galleons carried American silver west and Asian luxury goods east across the Pacific.'],
      examConnection: 'Use Manila as evidence that exchange was cross-Pacific as well as Atlantic, while treating the city as one representative node.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.4 and 4.5' },
    },
    {
      id: 'apwh-u4-manila-silver-asian-goods',
      locationNumber: '12',
      mainEventKey: 'world-event-12-0',
      title: 'American Silver for Asian Goods',
      dateLabel: '1570–1750',
      startYear: 1570,
      endYear: 1750,
      summary: 'Chinese merchants exchanged silk, porcelain, and other Asian goods for American silver brought to Manila by Spanish ships.',
      significance: 'Chinese silver demand pulled bullion across the Pacific and shaped galleon commerce rather than leaving Europeans as its sole drivers.',
      keyPeople: [{ name: 'Chinese merchants', role: 'Supplied silk, porcelain, and other goods in exchange for silver circulating through Manila.' }],
      keyTerms: [{ term: 'silver demand', explanation: 'Strong demand for bullion, reinforced in China by taxes and commercial payments made in silver.' }, { term: 'silk and porcelain', explanation: 'High-value Chinese manufactures sought by American and European consumers.' }],
      evidence: ['Merchants carried large quantities of American silver into Manila and onward to Chinese markets.', 'Chinese silk and porcelain formed major return cargoes shipped toward Acapulco.'],
      examConnection: 'Explain both supply and demand: American mines supplied bullion, while Chinese demand pulled it toward Asian goods markets.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.5 and 4.8' },
    },
    {
      id: 'apwh-u4-manila-pacific-commercial-network',
      locationNumber: '12',
      mainEventKey: 'world-event-12-0',
      title: 'A Pacific Commercial Network',
      dateLabel: '1570–1750',
      startYear: 1570,
      endYear: 1750,
      summary: "Merchants in the Americas, the Philippines, and China connected regional production and exchange through Manila's entrepot markets.",
      significance: 'The galleon trade linked existing networks into a wider Pacific system, but it did not erase local Asian commerce or reduce exchange to Spanish control.',
      keyPeople: [{ name: 'American, Philippine, and Chinese merchants', role: 'Moved silver, provisions, manufactures, and information among overlapping local and long-distance markets.' }],
      keyTerms: [{ term: 'entrepot', explanation: 'A port where goods from different regions are stored, exchanged, and re-exported.' }, { term: 'Pacific commercial network', explanation: 'Linked routes and markets connecting American and Asian producers and consumers.' }],
      evidence: ['Manila joined American silver with Chinese goods and Philippine labor and provisioning systems.', 'Regional Asian merchants and markets continued operating alongside the Spanish-regulated route.'],
      examConnection: 'Contextualize early globalization as the linking of existing networks, not the replacement of Asian commerce by one European system.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.5 and 4.8' },
    },
    {
      id: 'apwh-u4-new-spain-tenochtitlan-mexico-city',
      locationNumber: '49',
      mainEventKey: 'world-event-49-7',
      title: 'From Tenochtitlan to Mexico City',
      dateLabel: '1521–1600',
      startYear: 1521,
      endYear: 1600,
      summary: 'After the 1521 fall of Tenochtitlan, Spaniards destroyed and rebuilt much of the Mexica capital as colonial Mexico City.',
      significance: 'Continuity of place and Indigenous labor accompanied a major change in political power as Spain remade a Mexica center for colonial government.',
      keyPeople: [{ name: 'Hernán Cortés, Mexica defenders, and Indigenous allies', role: 'Fought over Tenochtitlan in a conflict shaped by Spanish forces and Indigenous enemies of Mexica rule.' }],
      keyTerms: [{ term: 'Tenochtitlan', explanation: 'The Mexica island capital conquered after siege in 1521.' }, { term: 'Mexico City', explanation: 'The Spanish colonial capital built over and through conquered Tenochtitlan.' }],
      evidence: ['Cortés relied on numerous Indigenous allies as well as Spanish soldiers during the 1521 siege.', 'Colonizers dismantled temples and rebuilt institutions while retaining the site as a capital.'],
      examConnection: 'Use the city for CCOT: rule and landscape changed after 1521, while location and urban importance continued.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.3 and 4.4' },
    },
    {
      id: 'apwh-u4-new-spain-casta-colonial-governance',
      locationNumber: '49',
      mainEventKey: 'world-event-49-7',
      title: 'Casta and Colonial Governance',
      dateLabel: '1600–1750',
      startYear: 1600,
      endYear: 1750,
      summary: 'Colonial institutions distinguished peninsulares, criollos, Indigenous people, Africans, and mixed communities through ranked but negotiable categories.',
      significance: 'Casta labels influenced privilege and office, yet lived identities were more flexible than a perfectly fixed official diagram suggests.',
      keyPeople: [{ name: 'Peninsulares and criollos', role: 'Competed for status and office in an order generally favoring people born in Iberia.' }],
      keyTerms: [{ term: 'peninsulares', explanation: 'Iberian-born residents often preferred for high colonial offices.' }, { term: 'criollos', explanation: 'American-born people of Spanish ancestry who could possess wealth but resent peninsular preference.' }, { term: 'casta', explanation: 'Flexible colonial labels ranking ancestry and status in Spanish America.' }],
      evidence: ['High royal and church offices often favored peninsulares over wealthy criollos.', 'Casta labels appeared in records, but wealth, family, locality, and legal action could alter status.'],
      examConnection: 'Compare formal hierarchy with lived practice: casta shaped privilege without functioning as a single perfectly fixed racial chart.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.5 and 4.7' },
    },
    {
      id: 'apwh-u4-new-spain-syncretism-resistance',
      locationNumber: '49',
      mainEventKey: 'world-event-49-7',
      title: 'Syncretism, Resistance, and Social Change',
      dateLabel: '1521–1750',
      startYear: 1521,
      endYear: 1750,
      summary: 'Indigenous and African communities adapted Christianity and colonial institutions while preserving traditions and resisting domination.',
      significance: 'The Virgin of Guadalupe illustrates syncretism, while the Pueblo Revolt comparison shows that adaptation and resistance coexisted rather than simple erasure.',
      keyPeople: [{ name: 'Indigenous and African communities', role: 'Preserved, combined, and defended cultural practices under colonial rule across New Spain.' }],
      keyTerms: [{ term: 'syncretism', explanation: 'Selective blending of beliefs and practices from interacting traditions.' }, { term: 'Virgin of Guadalupe', explanation: 'A Mexican Catholic devotion interpreted through Christian and Indigenous meanings.' }, { term: 'Pueblo Revolt', explanation: 'The 1680 uprising in New Mexico that expelled Spanish rulers for more than a decade.' }],
      evidence: ['Guadalupe devotion joined Catholic forms with meanings rooted in Indigenous experience.', 'The Pueblo Revolt of 1680 shows organized resistance to colonial labor and religious pressure.'],
      examConnection: 'Use Mexico City as a representative anchor, then compare syncretic adaptation with revolt to reject total cultural erasure.',
      source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.6, 4.7, and 4.8' },
    },
  ];

  validateRawRecords();

  function validateRawRecords() {
    const expectedLocationNumbers = ['42', '2', '68', '57', '60', '87', '12', '49'];
    if (Object.keys(LOCATIONS).length !== expectedLocationNumbers.length
      || expectedLocationNumbers.some(number => !Object.prototype.hasOwnProperty.call(LOCATIONS, number))) {
      throw new Error('Invalid Unit 4 study locations: expected exactly 42,2,68,57,60,87,12,49');
    }
    for (const number of expectedLocationNumbers) {
      if (!hasEnglishText(LOCATIONS[number])) {
        throw new Error(`Invalid Unit 4 study location ${number}: missing English location name`);
      }
    }
    if (RAW_RECORDS.length > 24) failRecord(RAW_RECORDS[24], 'expected exactly 24 records');
    if (RAW_RECORDS.length < 24) failRecord({ id: '(missing record)' }, 'expected exactly 24 records');
    const rawKeys = ['dateLabel', 'endYear', 'evidence', 'examConnection', 'id', 'keyPeople',
      'keyTerms', 'locationNumber', 'mainEventKey', 'significance', 'source', 'startYear', 'summary', 'title'];
    const ids = new Set();
    for (const record of RAW_RECORDS) {
      if (!isPlainObject(record)) failRecord(record, 'record must be a non-null plain object');
      if (Object.keys(record).sort().join(',') !== rawKeys.join(',')) {
        failRecord(record, 'record must contain exactly the approved raw fields');
      }
      if (typeof record.id !== 'string' || !record.id.trim()) {
        failRecord(record, 'record ID must be a nonempty string');
      }
      if (!/^apwh-u4-(?:lisbon|malacca|santo-domingo|potosi|salvador|elmina|manila|new-spain)-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id)) {
        failRecord(record, `invalid stable ID ${describeRuleValue(record.id)}`);
      }
      if (ids.has(record.id)) failRecord(record, 'duplicate record ID');
      ids.add(record.id);
      const context = STUDY_CONTEXT[record.id];
      if (!context) failRecord(record, 'not present in manifest');
      if (!LOCATION_NUMBERS.includes(record.locationNumber)
        || record.locationNumber !== context.locationNumber) failRecord(record, `invalid locationNumber ${record.locationNumber}`);
      if (!VALID_MAIN_EVENTS.has(record.mainEventKey)) failRecord(record, `invalid mainEventKey ${record.mainEventKey}`);
      if (record.mainEventKey !== CANONICAL_LOCATION_BINDINGS[record.locationNumber]) {
        failRecord(record, `invalid mainEventKey ${record.mainEventKey} for location ${record.locationNumber}`);
      }
      if (record.mainEventKey !== context.mainEventKey) failRecord(record, `invalid mainEventKey ${record.mainEventKey}`);
      for (const field of ['title', 'summary', 'significance', 'examConnection']) {
        if (typeof record[field] !== 'string' || !record[field].trim()) failRecord(record, `missing ${field}`);
        if (!hasEnglishText(record[field])) failRecord(record, `non-English ${field}`);
      }
      validateDate(record, record.dateLabel, record.startYear, record.endYear);
      if (record.title !== context.title || record.dateLabel !== context.dateLabel
        || record.startYear !== context.startYear || record.endYear !== context.endYear) {
        failRecord(record, 'manifest metadata mismatch');
      }
      if (record.significance.length < 60) failRecord(record, 'significance is too short');
      if (record.examConnection.length < 60) failRecord(record, 'examConnection is too short');
      if (!Array.isArray(record.keyPeople) || record.keyPeople.length < 1) failRecord(record, 'missing keyPeople');
      if (!Array.isArray(record.keyTerms) || record.keyTerms.length < 2) failRecord(record, 'missing keyTerms');
      if (!Array.isArray(record.evidence) || record.evidence.length < 2) failRecord(record, 'missing evidence');
      for (const person of record.keyPeople) {
        if (!isPlainObject(person)) failRecord(record, 'invalid keyPeople entry');
        if (Object.keys(person).sort().join(',') !== 'name,role') {
          failRecord(record, 'keyPeople entry must contain exactly name and role fields');
        }
      }
      for (const term of record.keyTerms) {
        if (!isPlainObject(term)) failRecord(record, 'invalid keyTerms entry');
        if (Object.keys(term).sort().join(',') !== 'explanation,term') {
          failRecord(record, 'keyTerms entry must contain exactly term and explanation fields');
        }
      }
      if (!isPlainObject(record.source)) failRecord(record, 'invalid source structure');
      if (!record.source.id) failRecord(record, 'missing source id');
      if (!record.source.locator) failRecord(record, 'missing source locator');
      if (Object.keys(record.source).sort().join(',') !== 'id,locator') {
        failRecord(record, 'source must contain exactly id and locator fields');
      }
      if (record.source.id !== 'amsco-apwh-u4') failRecord(record, `invalid source id ${record.source.id}`);
      const nested = [
        ...record.keyPeople.flatMap(person => [person.name, person.role]),
        ...record.keyTerms.flatMap(term => [term.term, term.explanation]),
        ...record.evidence, record.source.id, record.source.locator,
      ];
      if (nested.some(value => typeof value !== 'string' || !value.trim())) {
        failRecord(record, 'missing nested learner content');
      }
      if (nested.some(value => !hasEnglishText(value))) failRecord(record, 'non-English nested learner content');
      const topics = context.topicCodes;
      const topicLabel = topics.length === 1
        ? `Topic ${topics[0]}`
        : `Topics ${topics.slice(0, -1).join(', ')}${topics.length > 2 ? ',' : ''} and ${topics.at(-1)}`;
      const expectedLocator = `AMSCO AP World History, Unit 4, ${topicLabel}`;
      if (record.source.locator !== expectedLocator) {
        failRecord(record, `invalid source locator ${record.source.locator}`);
      }
    }
    for (const [id] of STUDY_MANIFEST) if (!ids.has(id)) failRecord({ id }, 'missing raw record');
  }

  const UNIT_CARD_LIST = [
    {
      id: 'apwh-u4-context-land-to-oceanic-empires', kind: 'context', role: 'Unit 4 Context Card',
      title: 'Why Oceanic Expansion Became Profitable',
      examSkills: ['Contextualization', 'Causation'],
      summary: 'Unit 3 states drew revenue from land, labor, and established Afro-Eurasian commerce. In Unit 4, Iberian rulers used borrowed and adapted navigational knowledge, state financing, and Atlantic ports to reach those older markets by sea. Oceanic expansion became profitable when armed ships and colonial institutions let empires redirect trade, seize labor, and tax extraction; geography and technology created opportunities, but political choices determined how they were used.',
      prompt: 'How did inherited commercial knowledge and new state-backed ocean routes change the methods—not simply the scale—of imperial expansion after 1450?',
      takeaways: [
        'Oceanic expansion built on Afro-Eurasian knowledge and preexisting trade networks.',
        'State finance and naval force helped rulers convert maritime access into revenue.',
        'Trading-post control and territorial colonization were different imperial strategies.',
      ],
    },
    {
      id: 'apwh-u4-synthesis-extraction-hierarchy-revolution', kind: 'synthesis', role: 'Unit 4 Synthesis Card',
      title: 'From Imperial Extraction to Revolutionary Challenge',
      examSkills: ['CCOT', 'Causation'],
      summary: 'Unit 4 empires generated wealth through silver, plantation commodities, monopoly trade, and coerced labor while organizing colonial societies through legal and ancestry-based hierarchies. These systems strengthened states and merchants, but they also spread rights language, sharpened inequalities, and created groups with reasons to challenge imperial legitimacy. Unit 5 revolutions would contest who possessed sovereignty and rights without immediately eliminating the economic and social structures built before 1750.',
      prompt: 'Which Unit 4 institutions created both the resources for stronger empires and the grievances that later revolutionary movements could mobilize?',
      takeaways: [
        'Colonial extraction strengthened imperial states and commercial elites.',
        'Coerced labor and ancestry-based hierarchy produced durable inequality and resistance.',
        'Revolutionary rights claims challenged imperial legitimacy more quickly than they dismantled older social structures.',
      ],
    },
  ];

  function freezeUnitCard(card) {
    return Object.freeze({
      ...card,
      examSkills: Object.freeze([...card.examSkills]),
      takeaways: Object.freeze([...card.takeaways]),
    });
  }

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
  function compareRecords(a, b) {
    return a.sequence - b.sequence
      || a.startYear - b.startYear
      || a.endYear - b.endYear
      || String(a.id).localeCompare(String(b.id));
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
          if (record[key].indexOf(targetId) !== record[key].lastIndexOf(targetId)) {
            failRecord(record, `duplicate connection in ${key} to ${describeRuleValue(targetId)}`);
          }
          if (categories.has(targetId)) {
            failRecord(record, `cross-category connection ${targetId} in ${categories.get(targetId)} and ${key}`);
          }
          categories.set(targetId, key);
          linked.push(targetId);
          const target = byId.get(targetId);
          if (!target) failRecord(record, `unresolved connection ${targetId}`);
          if (!target[categoryReciprocals[key]].includes(record.id)) {
            failRecord(record, `nonreciprocal ${key} connection to ${targetId}`);
          }
          const note = record.connectionNotes[targetId];
          if (typeof note !== 'string' || !note.trim()) {
            failRecord(record, `missing connection note for ${targetId}`);
          }
          if (!hasEnglishText(note)) failRecord(record, `non-English connection note for ${targetId}`);
          if (target.connectionNotes[record.id] !== note) {
            failRecord(record, `nonreciprocal connection note for ${targetId}`);
          }
        }
      }
      if (!linked.length) failRecord(record, 'missing connection');
      const extra = Object.keys(record.connectionNotes).find(id => !linked.includes(id));
      if (extra !== undefined) failRecord(record, `extra connection note key ${describeRuleValue(extra)}`);
    }
  }

  validateStudyGraph();

  const byLocation = new Map(LOCATION_NUMBERS.map(number => [number,
    STUDY_EVENTS.filter(record => record.locationNumber === number).sort(compareRecords)]));

  function validateUnitCards() {
    const unitCardKeys = ['examSkills', 'id', 'kind', 'prompt', 'role', 'summary', 'takeaways', 'title'];
    const seenKinds = new Set();
    const seenIds = new Set();
    for (const card of UNIT_CARD_LIST) {
      if (!isPlainObject(card)) failCard(card, 'card must be a non-null plain object');
      if (Object.keys(card).sort().join(',') !== unitCardKeys.join(',')) {
        failCard(card, 'card must contain exactly the approved fields');
      }
      if (!['context', 'synthesis'].includes(card.kind)) {
        failCard(card, `invalid kind ${describeRuleValue(card.kind)}`);
      }
      if (seenKinds.has(card.kind)) failCard(card, `duplicate kind ${card.kind}`);
      seenKinds.add(card.kind);
      if (typeof card.id !== 'string' || !card.id.trim()) {
        failCard(card, 'card ID must be a nonempty string');
      }
      if (seenIds.has(card.id)) failCard(card, 'duplicate card ID');
      seenIds.add(card.id);
      const stableIdPattern = new RegExp(`^apwh-u4-${card.kind}-[a-z0-9]+(?:-[a-z0-9]+)*$`);
      if (!stableIdPattern.test(card.id)) {
        failCard(card, 'invalid stable ID');
      }
      for (const field of ['role', 'title', 'summary', 'prompt']) {
        if (typeof card[field] !== 'string' || !card[field].trim()) failCard(card, `missing ${field}`);
        if (!hasEnglishText(card[field])) failCard(card, `non-English ${field}`);
      }
      if (!Array.isArray(card.examSkills)) failCard(card, 'examSkills must be an array');
      if (!card.examSkills.length) failCard(card, 'missing examSkills');
      if (card.examSkills.length > 2) failCard(card, 'too many examSkills');
      for (const skill of card.examSkills) {
        if (typeof skill !== 'string' || !skill.trim() || !VALID_EXAM_SKILLS.has(skill)) {
          failCard(card, `invalid examSkill ${describeRuleValue(skill)}`);
        }
        if (card.examSkills.indexOf(skill) !== card.examSkills.lastIndexOf(skill)) {
          failCard(card, `duplicate examSkill ${skill}`);
        }
      }
      if (!Array.isArray(card.takeaways)) failCard(card, 'takeaways must be an array');
      if (card.takeaways.length !== 3) failCard(card, 'takeaways must contain exactly three items');
      for (const takeaway of card.takeaways) {
        if (typeof takeaway !== 'string' || !takeaway.trim()) failCard(card, 'empty takeaway');
        if (!hasEnglishText(takeaway)) failCard(card, 'non-English takeaway');
      }
    }
    if (UNIT_CARD_LIST.length !== 2 || !seenKinds.has('context') || !seenKinds.has('synthesis')) {
      failCard(null, 'expected exactly context and synthesis');
    }
  }

  validateUnitCards();
  const UNIT_CARDS = Object.freeze(Object.fromEntries(
    UNIT_CARD_LIST.map(card => [card.kind, freezeUnitCard(card)]),
  ));

  const api = Object.freeze({
    unitId: UNIT_ID,
    unitNumber: UNIT_NUMBER,
    locationNumbers: LOCATION_NUMBERS,
    records: STUDY_EVENTS,
    unitCards: UNIT_CARDS,
    compareRecords,
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
  });

  Object.defineProperty(root, 'APWH_U4_LOCATION_STUDY', {
    value: api,
    enumerable: true,
    configurable: false,
    writable: false,
  });
})(typeof window !== 'undefined' ? window : globalThis);
