(function publishUnit1LocationStudy(root) {
  'use strict';

  const TRIAL_LOCATIONS = Object.freeze({
    '1': 'Hangzhou',
    '3': 'Baghdad',
    '6': 'Delhi',
    '7': 'Angkor',
    '23': 'Medieval Europe · London',
    '49': 'Aztec Empire · Tenochtitlan',
    '50': 'Inca Empire · Cusco',
    '73': 'Timbuktu',
  });

  const VALID_TOPIC_CODES = new Set(['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7']);
  const VALID_THEME_IDS = new Set(['GOV', 'ECN', 'CDI', 'SIO', 'TEC', 'ENV']);
  const VALID_EXAM_SKILLS = new Set(['Causation', 'Comparison', 'CCOT', 'Contextualization']);
  const STUDY_CONTEXT = {
    'apwh-u1-hangzhou-song-commercial-revolution': [['1.1', '1.7'], ['ECN', 'GOV']],
    'apwh-u1-hangzhou-grand-canal-urban-market': [['1.1', '1.7'], ['ECN', 'GOV', 'TEC']],
    'apwh-u1-hangzhou-paper-money-maritime-tools': [['1.1', '1.7'], ['ECN', 'TEC']],
    'apwh-u1-angkor-khmer-hydraulic-state': [['1.3', '1.7'], ['GOV', 'ECN', 'TEC']],
    'apwh-u1-angkor-hindu-buddhist-legitimation': [['1.3', '1.7'], ['GOV', 'CDI']],
    'apwh-u1-delhi-sultanate-state-building': [['1.3', '1.7'], ['GOV', 'CDI']],
    'apwh-u1-delhi-bhakti-sufi-devotion': [['1.3', '1.7'], ['CDI', 'SIO']],
    'apwh-u1-baghdad-abbasid-knowledge-hub': [['1.2', '1.7'], ['CDI', 'TEC']],
    'apwh-u1-baghdad-merchant-ulema-network': [['1.2', '1.7'], ['ECN', 'CDI']],
    'apwh-u1-timbuktu-mali-gold-salt-tax': [['1.5', '1.7'], ['ECN', 'GOV']],
    'apwh-u1-timbuktu-islamic-learning-griots': [['1.5', '1.7'], ['CDI', 'SIO']],
    'apwh-u1-timbuktu-mansa-musa-pilgrimage': [['1.5', '1.7'], ['GOV', 'ECN', 'CDI']],
    'apwh-u1-tenochtitlan-chinampas-urban-state': [['1.4', '1.7'], ['ENV', 'ECN', 'GOV']],
    'apwh-u1-tenochtitlan-religion-warfare-legitimacy': [['1.4', '1.7'], ['CDI', 'GOV']],
    'apwh-u1-tenochtitlan-triple-alliance-tribute': [['1.4', '1.7'], ['GOV', 'ECN']],
    'apwh-u1-cusco-ayllu-mita-labor': [['1.4', '1.7'], ['SIO', 'GOV', 'ECN']],
    'apwh-u1-cusco-pachacuti-tawantinsuyu': [['1.4', '1.7'], ['GOV', 'ENV']],
    'apwh-u1-cusco-roads-quipu-administration': [['1.4', '1.7'], ['GOV', 'TEC']],
    'apwh-u1-london-manorial-feudal-order': [['1.6', '1.7'], ['SIO', 'ECN']],
    'apwh-u1-london-towns-guilds-commerce': [['1.6', '1.7'], ['ECN', 'SIO']],
    'apwh-u1-london-magna-carta-monarchy': [['1.6', '1.7'], ['GOV']],
  };

  const CONNECTION_DATA = new Map(Object.keys(STUDY_CONTEXT).map(id => [id, {
    causeStudyPointIds: [],
    effectStudyPointIds: [],
    relatedStudyPointIds: [],
    connectionNotes: {},
  }]));

  function addCausalConnection(causeId, effectId, note) {
    const cause = CONNECTION_DATA.get(causeId);
    const effect = CONNECTION_DATA.get(effectId);
    if (!cause) {
      throw new Error(`Invalid Unit 1 study connection causal: missing cause ${causeId}`);
    }
    if (!effect) {
      throw new Error(`Invalid Unit 1 study connection causal: missing effect ${effectId}`);
    }
    if (causeId === effectId) {
      throw new Error(`Invalid Unit 1 study connection causal: self connection ${causeId}`);
    }
    cause.effectStudyPointIds.push(effectId);
    effect.causeStudyPointIds.push(causeId);
    cause.connectionNotes[effectId] = note;
    effect.connectionNotes[causeId] = note;
  }

  function addRelatedConnection(leftId, rightId, note) {
    const left = CONNECTION_DATA.get(leftId);
    const right = CONNECTION_DATA.get(rightId);
    if (!left) {
      throw new Error(`Invalid Unit 1 study connection related: missing left ${leftId}`);
    }
    if (!right) {
      throw new Error(`Invalid Unit 1 study connection related: missing right ${rightId}`);
    }
    if (leftId === rightId) {
      throw new Error(`Invalid Unit 1 study connection related: self connection ${leftId}`);
    }
    left.relatedStudyPointIds.push(rightId);
    right.relatedStudyPointIds.push(leftId);
    left.connectionNotes[rightId] = note;
    right.connectionNotes[leftId] = note;
  }

  addCausalConnection(
    'apwh-u1-hangzhou-grand-canal-urban-market',
    'apwh-u1-hangzhou-song-commercial-revolution',
    'Canal transport integrated productive regions with Hangzhou, supporting the urban demand and market exchange associated with Song commercialization.',
  );
  addCausalConnection(
    'apwh-u1-hangzhou-song-commercial-revolution',
    'apwh-u1-hangzhou-paper-money-maritime-tools',
    'Expanding markets increased demand for scalable currency and safer long-distance navigation.',
  );
  addCausalConnection(
    'apwh-u1-angkor-khmer-hydraulic-state',
    'apwh-u1-angkor-hindu-buddhist-legitimation',
    'Agricultural surplus and organized labor helped Khmer rulers finance monumental religious patronage.',
  );
  addCausalConnection(
    'apwh-u1-timbuktu-mali-gold-salt-tax',
    'apwh-u1-timbuktu-mansa-musa-pilgrimage',
    "Revenue from Mali's control of trade helped finance Mansa Musa's pilgrimage and public display of wealth.",
  );
  addCausalConnection(
    'apwh-u1-timbuktu-mansa-musa-pilgrimage',
    'apwh-u1-timbuktu-islamic-learning-griots',
    "Mansa Musa's post-pilgrimage patronage strengthened mosques, schools, and scholarly connections in Mali.",
  );
  addCausalConnection(
    'apwh-u1-tenochtitlan-chinampas-urban-state',
    'apwh-u1-tenochtitlan-triple-alliance-tribute',
    'Intensive chinampa agriculture helped sustain the large urban population and military resources from which Mexica rulers expanded tribute demands.',
  );
  addCausalConnection(
    'apwh-u1-tenochtitlan-triple-alliance-tribute',
    'apwh-u1-tenochtitlan-religion-warfare-legitimacy',
    'Tribute warfare supplied wealth and captives while public ritual presented Mexica expansion as part of a sacred political order.',
  );
  addCausalConnection(
    'apwh-u1-cusco-pachacuti-tawantinsuyu',
    'apwh-u1-cusco-ayllu-mita-labor',
    'Rapid territorial expansion required Inca rulers to organize local ayllus and rotate labor obligations across a much larger state.',
  );
  addCausalConnection(
    'apwh-u1-cusco-ayllu-mita-labor',
    'apwh-u1-cusco-roads-quipu-administration',
    "Mobilized mit'a labor built and maintained roads, while officials used quipu records to track resources and obligations.",
  );
  addCausalConnection(
    'apwh-u1-london-manorial-feudal-order',
    'apwh-u1-london-towns-guilds-commerce',
    'Agricultural production and population recovery supported markets and towns whose merchants and guilds operated beyond individual manors.',
  );

  addRelatedConnection(
    'apwh-u1-delhi-sultanate-state-building',
    'apwh-u1-delhi-bhakti-sufi-devotion',
    'Both developments show how Islamic institutions interacted with a predominantly Hindu South Asian society without erasing religious distinctions.',
  );
  addRelatedConnection(
    'apwh-u1-baghdad-abbasid-knowledge-hub',
    'apwh-u1-baghdad-merchant-ulema-network',
    "Scholarship, religious learning, and trusted urban networks reinforced Baghdad's wider role in the Islamic world.",
  );
  addRelatedConnection(
    'apwh-u1-baghdad-merchant-ulema-network',
    'apwh-u1-delhi-bhakti-sufi-devotion',
    'Mobile Muslim teachers and shared religious networks help compare the spread and local adaptation of Islam across regions.',
  );
  addRelatedConnection(
    'apwh-u1-baghdad-merchant-ulema-network',
    'apwh-u1-timbuktu-islamic-learning-griots',
    'Commercial and scholarly networks carried Islamic institutions while local societies retained distinct cultural practices.',
  );
  addRelatedConnection(
    'apwh-u1-tenochtitlan-triple-alliance-tribute',
    'apwh-u1-cusco-ayllu-mita-labor',
    "The Aztec tribute system and the Inca mit'a system extracted resources differently: one emphasized subject payments, while the other mobilized labor through communities.",
  );
  addRelatedConnection(
    'apwh-u1-tenochtitlan-chinampas-urban-state',
    'apwh-u1-cusco-ayllu-mita-labor',
    'Both states adapted difficult environments through organized labor, although chinampas intensified lake agriculture while Inca communities managed highland production and terraces.',
  );
  addRelatedConnection(
    'apwh-u1-london-magna-carta-monarchy',
    'apwh-u1-delhi-sultanate-state-building',
    'Both cases reveal negotiations between rulers and powerful groups, but Magna Carta formalized baronial constraints while Delhi sultans balanced minority rule with military and local political accommodation.',
  );

  function freezeRecord(record) {
    const [topicCodes, themeIds] = STUDY_CONTEXT[record.id] || [[], []];
    const connections = CONNECTION_DATA.get(record.id) || {
      causeStudyPointIds: [],
      effectStudyPointIds: [],
      relatedStudyPointIds: [],
      connectionNotes: {},
    };
    return Object.freeze({
      ...record,
      examSkills: Object.freeze(Array.isArray(record.examSkills) ? [...record.examSkills] : []),
      topicCodes: Object.freeze([...topicCodes]),
      themeIds: Object.freeze([...themeIds]),
      causeStudyPointIds: Object.freeze([...connections.causeStudyPointIds]),
      effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds]),
      relatedStudyPointIds: Object.freeze([...connections.relatedStudyPointIds]),
      connectionNotes: Object.freeze({ ...connections.connectionNotes }),
      keyPeople: Object.freeze(record.keyPeople.map(person => Object.freeze({ ...person }))),
      keyTerms: Object.freeze(record.keyTerms.map(item => Object.freeze({ ...item }))),
      evidence: Object.freeze([...record.evidence]),
      source: Object.freeze({ ...record.source }),
    });
  }

  function freezeUnitCard(card) {
    return Object.freeze({
      ...card,
      examSkills: Object.freeze(Array.isArray(card.examSkills) ? [...card.examSkills] : []),
      takeaways: Object.freeze(Array.isArray(card.takeaways) ? [...card.takeaways] : []),
    });
  }

  function compareRecords(a, b) {
    return a.startYear - b.startYear
      || a.endYear - b.endYear
      || a.id.localeCompare(b.id);
  }

  const STUDY_EVENTS = Object.freeze([
    freezeRecord({
      id: 'apwh-u1-hangzhou-song-commercial-revolution',
      examSkills: ['Causation', 'CCOT'],
      locationNumber: '1',
      mainEventKey: 'world-event-1-0',
      title: 'Song Commercial Revolution',
      dateLabel: '960–1279',
      startYear: 960,
      endYear: 1279,
      summary: 'Song rule encouraged production for markets, expanded cities, and connected regional exchange to Hangzhou.',
      significance: 'Commercialization made urban demand, specialized production, and long-distance exchange central features of Song prosperity and state revenue.',
      keyPeople: [{ name: 'Emperor Taizu', role: 'Founded the Song dynasty and established the political order in which commercial expansion developed.' }],
      keyTerms: [
        { term: 'commercialization', explanation: 'The growing production of goods for sale through markets rather than only for local subsistence.' },
        { term: 'tribute system', explanation: 'A diplomatic framework that also supported regulated exchange between China and neighboring states.' },
      ],
      evidence: [
        'Song China supported a large urban population whose demand encouraged specialized craft and agricultural production.',
        'Hangzhou became a major political and commercial center linked to both inland and maritime exchange.',
      ],
      examConnection: 'Use this case to explain how state stability and expanding markets changed economic life in East Asia during the period c. 1200–1450.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.1' },
    }),
    freezeRecord({
      id: 'apwh-u1-hangzhou-grand-canal-urban-market',
      examSkills: ['Causation'],
      locationNumber: '1',
      mainEventKey: 'world-event-1-0',
      title: 'Grand Canal and the Hangzhou Market',
      dateLabel: '1000–1279',
      startYear: 1000,
      endYear: 1279,
      summary: 'The Grand Canal carried grain and goods toward Hangzhou and helped sustain a large southern urban market.',
      significance: 'Canal transport joined productive regions to consumers and officials, allowing the Song state to provision cities and collect resources across its territory.',
      keyPeople: [{ name: 'Song transport officials', role: 'Managed canal shipments and the movement of tax grain toward administrative and urban centers.' }],
      keyTerms: [
        { term: 'Grand Canal', explanation: 'The inland waterway that linked northern and southern Chinese economic regions.' },
        { term: 'urbanization', explanation: 'The growth of cities as centers of administration, consumption, production, and exchange.' },
      ],
      evidence: [
        'Hangzhou stood near the southern end of the Grand Canal and received goods from a broad internal market.',
        'Reliable water transport moved bulky grain more efficiently than overland shipment and supported large cities.',
      ],
      examConnection: 'Use the Grand Canal as evidence that government infrastructure could integrate regional economies and support urban growth in Song China.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.1' },
    }),
    freezeRecord({
      id: 'apwh-u1-hangzhou-paper-money-maritime-tools',
      examSkills: ['Causation', 'Comparison'],
      locationNumber: '1',
      mainEventKey: 'world-event-1-0',
      title: 'Paper Money and Maritime Technology',
      dateLabel: '1100–1279',
      startYear: 1100,
      endYear: 1279,
      summary: 'Paper money and improved navigation reduced transaction costs and helped Hangzhou connect with maritime Asia.',
      significance: 'Financial and navigational tools made trade easier to finance and safer to conduct, extending Song commercial influence beyond its internal market.',
      keyPeople: [{ name: 'Song merchants', role: 'Used paper currency, credit practices, and maritime knowledge to conduct exchange over longer distances.' }],
      keyTerms: [
        { term: 'paper money', explanation: 'Government-backed currency that reduced reliance on heavy strings of copper coins.' },
        { term: 'magnetic compass', explanation: 'A navigational instrument that helped mariners maintain direction beyond sight of land.' },
      ],
      evidence: [
        'Song China expanded the use of paper currency in a highly monetized commercial economy.',
        'Chinese mariners used the compass and improved ship design to navigate regional sea routes.',
      ],
      examConnection: 'Use these innovations to explain how financial practices and navigation technologies increased the scale of exchange in and beyond East Asia.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.1' },
    }),
    freezeRecord({
      id: 'apwh-u1-angkor-khmer-hydraulic-state',
      examSkills: ['Causation', 'Comparison'],
      locationNumber: '7',
      mainEventKey: 'world-event-7-0',
      title: "Angkor's Hydraulic State",
      dateLabel: '802–1431',
      startYear: 802,
      endYear: 1431,
      summary: 'Khmer rulers organized reservoirs, canals, and labor around Angkor to manage water and support intensive rice agriculture.',
      significance: 'Control of water and labor produced agricultural surpluses that sustained Angkor, financed monumental building, and strengthened royal authority.',
      keyPeople: [{ name: 'Jayavarman II', role: 'Established the Khmer imperial tradition that later rulers expanded around Angkor.' }],
      keyTerms: [
        { term: 'baray', explanation: 'A large Khmer reservoir used within Angkorian systems of water storage and management.' },
        { term: 'hydraulic state', explanation: 'A state whose authority and resources are closely connected to organizing large water-control works.' },
      ],
      evidence: [
        'Angkor contained extensive reservoirs and canals associated with managing seasonal water supplies.',
        'Rice surpluses supported a dense capital and the labor required for temples and public works.',
      ],
      examConnection: 'Use Angkor to explain how rulers in South and Southeast Asia connected environmental management, agricultural surplus, and state building.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.3' },
    }),
    freezeRecord({
      id: 'apwh-u1-angkor-hindu-buddhist-legitimation',
      examSkills: ['Causation', 'Comparison'],
      locationNumber: '7',
      mainEventKey: 'world-event-7-0',
      title: 'Hindu and Buddhist Legitimation at Angkor',
      dateLabel: '1113–1431',
      startYear: 1113,
      endYear: 1431,
      summary: 'Khmer rulers used Hindu and later Buddhist institutions and monuments to present kingship as sacred and protective.',
      significance: 'Religious adaptation let successive rulers claim continuity while changing traditions, tying political loyalty to temples, ritual, and royal patronage.',
      keyPeople: [{ name: 'Suryavarman II', role: 'Sponsored Angkor Wat and used monumental Hindu architecture to express royal authority.' }],
      keyTerms: [
        { term: 'Angkor Wat', explanation: 'A monumental temple complex first dedicated to Vishnu and associated with Khmer royal power.' },
        { term: 'Theravada Buddhism', explanation: 'A Buddhist tradition that became increasingly influential in mainland Southeast Asia.' },
      ],
      evidence: [
        'Angkor Wat joined religious symbolism, royal patronage, and monumental labor in one political landscape.',
        'Khmer religious life shifted from strongly Hindu court traditions toward Buddhism without erasing Angkor as a sacred center.',
      ],
      examConnection: 'Use this transition to explain how Southeast Asian states adapted imported religions to legitimize rulers and maintain political continuity.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.3' },
    }),
    freezeRecord({
      id: 'apwh-u1-delhi-sultanate-state-building',
      examSkills: ['Comparison', 'Causation'],
      locationNumber: '6',
      mainEventKey: 'world-event-6-0',
      title: 'Delhi Sultanate State Building',
      dateLabel: '1206–1450',
      startYear: 1206,
      endYear: 1450,
      summary: 'Turkic Muslim rulers governed from Delhi while ruling a large population that remained mainly Hindu.',
      significance: 'The sultanate created a durable Islamic state in northern India while relying on accommodation, military power, and existing local institutions.',
      keyPeople: [{ name: 'Raziyya', role: 'Ruled the Delhi Sultanate from 1236 to 1240 and demonstrated both the reach and limits of female sovereignty.' }],
      keyTerms: [
        { term: 'Delhi Sultanate', explanation: 'A sequence of Muslim-ruled dynasties governing much of northern India from Delhi.' },
        { term: 'jizya', explanation: 'A tax historically imposed by some Muslim governments on non-Muslim subjects.' },
      ],
      evidence: [
        'A Muslim political minority governed territories whose population remained predominantly Hindu.',
        'The sultanate preserved many local social practices even as it introduced Persianate and Islamic political traditions.',
      ],
      examConnection: 'Use Delhi to explain how a religious minority could build a state by combining conquest with selective accommodation of local society.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.3' },
    }),
    freezeRecord({
      id: 'apwh-u1-delhi-bhakti-sufi-devotion',
      examSkills: ['Comparison', 'CCOT'],
      locationNumber: '6',
      mainEventKey: 'world-event-6-4',
      title: 'Bhakti and Sufi Devotional Traditions',
      dateLabel: '1100–1450',
      startYear: 1100,
      endYear: 1450,
      summary: 'Bhakti teachers and Sufi mystics emphasized personal devotion and reached communities beyond formal religious elites.',
      significance: 'Devotional movements created shared practices and cultural exchange without eliminating the distinct institutions of Hinduism and Islam.',
      keyPeople: [{ name: 'Nizamuddin Auliya', role: 'A prominent Chishti Sufi teacher in Delhi whose community emphasized devotion, service, and spiritual instruction.' }],
      keyTerms: [
        { term: 'Bhakti', explanation: 'A Hindu devotional tradition emphasizing a direct and loving relationship with a chosen deity.' },
        { term: 'Sufism', explanation: 'Mystical Islamic practices that emphasized personal experience, discipline, and closeness to God.' },
      ],
      evidence: [
        "Bhakti devotion could bypass some ritual and social barriers by stressing an individual's relationship with a deity.",
        'Sufi teachers formed communities that helped Islam take root through teaching and personal example.',
      ],
      examConnection: 'Use Bhakti and Sufism to explain cultural interaction in South Asia while avoiding the claim that the two religions simply merged.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.3' },
    }),
    freezeRecord({
      id: 'apwh-u1-baghdad-abbasid-knowledge-hub',
      examSkills: ['Causation', 'CCOT'],
      locationNumber: '3',
      mainEventKey: 'world-event-3-0',
      title: 'Baghdad as an Abbasid Knowledge Hub',
      dateLabel: '750–1258',
      startYear: 750,
      endYear: 1258,
      summary: 'Abbasid Baghdad connected scholars who preserved and developed Greek, Persian, and Indian learning.',
      significance: 'Translation, scholarship, and urban patronage made Baghdad a major center for knowledge that circulated across the Islamic world and beyond.',
      keyPeople: [{ name: 'al-Khwarizmi', role: 'A Baghdad-based scholar whose mathematical work helped develop algebra and transmit numerical methods.' }],
      keyTerms: [
        { term: 'House of Wisdom', explanation: 'The name associated with Abbasid scholarly and translation activity in Baghdad.' },
        { term: 'ulama', explanation: 'Learned Muslim scholars who interpreted and taught Islamic religious and legal traditions.' },
      ],
      evidence: [
        'Baghdad scholars translated and studied works drawn from Greek, Persian, and Indian traditions.',
        'Abbasid patronage supported advances in mathematics, medicine, astronomy, and philosophy.',
      ],
      examConnection: 'Use Baghdad to explain how states and cities preserved, combined, and transmitted knowledge across regional and religious boundaries.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.2' },
    }),
    freezeRecord({
      id: 'apwh-u1-baghdad-merchant-ulema-network',
      examSkills: ['Causation', 'Comparison'],
      locationNumber: '3',
      mainEventKey: 'world-event-3-0',
      title: 'Merchants, Ulama, and Islamic Trade',
      dateLabel: '1000–1450',
      startYear: 1000,
      endYear: 1450,
      summary: 'Merchants and religious scholars linked commercial practice, law, and trust across the Islamic world.',
      significance: 'Shared legal ideas and respect for commerce helped strangers transact across long distances despite political fragmentation after Abbasid decline.',
      keyPeople: [{ name: 'Muslim merchants', role: 'Carried goods, commercial practices, and religious traditions through interconnected cities and ports.' }],
      keyTerms: [
        { term: 'sharia', explanation: 'Islamic moral and legal traditions that included rules relevant to contracts, property, and exchange.' },
        { term: 'diaspora', explanation: 'A community living away from its place of origin while maintaining social and commercial connections.' },
      ],
      evidence: [
        'Merchants held respected positions in many Muslim societies and supported mosques, schools, and charitable institutions.',
        'Ulama provided teaching and legal interpretation across states whose rulers and dynasties changed over time.',
      ],
      examConnection: 'Use this network to explain how a shared religious and legal culture maintained continuity across politically divided Islamic states.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.2' },
    }),
    freezeRecord({
      id: 'apwh-u1-timbuktu-mali-gold-salt-tax',
      examSkills: ['Causation'],
      locationNumber: '73',
      mainEventKey: 'world-event-73-0',
      title: 'Mali, Gold, Salt, and Transit Taxation',
      dateLabel: '1235–1450',
      startYear: 1235,
      endYear: 1450,
      summary: 'Mali taxed commerce in gold, salt, and other goods moving between West Africa and trans-Saharan markets.',
      significance: "Transit revenue funded cavalry and state authority, linking Mali's political strength to control of trade routes and productive regions.",
      keyPeople: [{ name: 'Sundiata Keita', role: 'Founded the Mali Empire and established the dynasty that controlled important West African trade corridors.' }],
      keyTerms: [
        { term: 'transit tax', explanation: "A levy placed on goods entering, leaving, or passing through a ruler's territory." },
        { term: 'trans-Saharan trade', explanation: 'Caravan exchange connecting West Africa with North Africa across the Sahara.' },
      ],
      evidence: [
        'Mali controlled access to important West African gold-producing regions and taxed goods moving through its territory.',
        'Caravans exchanged West African gold for salt, textiles, horses, and other North African goods.',
      ],
      examConnection: 'Use Mali to explain how African states converted control of trade routes and commodities into military and political power.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.5; Topic 2.2 trade mechanism context' },
    }),
    freezeRecord({
      id: 'apwh-u1-timbuktu-islamic-learning-griots',
      examSkills: ['Comparison', 'CCOT'],
      locationNumber: '73',
      mainEventKey: 'world-event-73-2',
      title: 'Islamic Learning and Griot Memory',
      dateLabel: '1300–1450',
      startYear: 1300,
      endYear: 1450,
      summary: 'Timbuktu combined Islamic schools and manuscript learning with West African traditions of oral historical memory.',
      significance: 'Written scholarship and griot performance coexisted, showing that expanding Islam added institutions without erasing local ways of preserving history.',
      keyPeople: [{ name: 'griots', role: 'Specialists who preserved genealogies, political memory, and community histories through oral performance.' }],
      keyTerms: [
        { term: 'madrasa', explanation: 'An institution for advanced study in Islamic subjects and related fields of learning.' },
        { term: 'griot', explanation: 'A West African oral historian and performer who preserves genealogies and accounts of rulers.' },
      ],
      evidence: [
        'Timbuktu developed a reputation for Islamic scholarship, schools, and manuscript culture.',
        'Griots continued to preserve dynastic and community memory through recitation and music.',
      ],
      examConnection: 'Use Timbuktu to explain cultural continuity and change: Islamic learning expanded while oral specialists retained important social roles.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.5' },
    }),
    freezeRecord({
      id: 'apwh-u1-timbuktu-mansa-musa-pilgrimage',
      examSkills: ['Causation', 'Contextualization'],
      locationNumber: '73',
      mainEventKey: 'world-event-73-3',
      title: "Mansa Musa's Pilgrimage",
      dateLabel: '1324',
      startYear: 1324,
      endYear: 1324,
      summary: "Mansa Musa traveled to Mecca, displayed Mali's wealth, and returned with stronger ties to Islamic learning.",
      significance: "The pilgrimage advertised Mali's resources abroad and helped its ruler use Islamic patronage to reinforce authority and scholarly life at home.",
      keyPeople: [{ name: 'Mansa Musa', role: 'Mali ruler whose pilgrimage connected his empire more visibly to North Africa and the wider Islamic world.' }],
      keyTerms: [
        { term: 'hajj', explanation: 'The pilgrimage to Mecca required of Muslims who are able to undertake it.' },
        { term: 'patronage', explanation: 'Political and financial support given to religious institutions, scholars, artists, or builders.' },
      ],
      evidence: [
        "Mansa Musa distributed enough gold during his journey to make Mali's wealth famous in the Mediterranean world.",
        'After the pilgrimage, he sponsored mosques, religious schools, and scholars in Mali.',
      ],
      examConnection: 'Use the pilgrimage to explain how an African ruler employed religion and wealth to build legitimacy and strengthen interregional connections.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.5' },
    }),
    freezeRecord({
      id: 'apwh-u1-tenochtitlan-chinampas-urban-state',
      examSkills: ['Causation', 'Comparison'],
      locationNumber: '49',
      mainEventKey: 'world-event-49-0',
      title: 'Chinampas and Urban State Capacity',
      dateLabel: '1325–1450',
      startYear: 1325,
      endYear: 1450,
      summary: 'Mexica farmers expanded chinampa agriculture around Tenochtitlan to support a dense island capital and its growing political power.',
      significance: 'Intensive lake agriculture generated reliable food surpluses that sustained urban specialists, armies, rulers, and the institutions of an expanding state.',
      keyPeople: [{ name: 'Mexica farmers', role: 'Built and maintained raised agricultural plots that supplied maize, vegetables, and flowers to the capital.' }],
      keyTerms: [
        { term: 'chinampa', explanation: 'A raised, highly productive agricultural plot constructed in the shallow waters of the Valley of Mexico.' },
        { term: 'Tenochtitlan', explanation: 'The Mexica island capital that became the center of the Aztec Empire.' },
      ],
      evidence: [
        'Chinampas used fertile lake mud and carefully managed waterways to produce repeated harvests close to Tenochtitlan.',
        'Agricultural surplus helped feed a large urban population that included artisans, merchants, priests, soldiers, and officials.',
      ],
      examConnection: 'Use chinampas to explain how societies adapted environments and converted agricultural productivity into urban growth and state capacity.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.4' },
    }),
    freezeRecord({
      id: 'apwh-u1-tenochtitlan-religion-warfare-legitimacy',
      examSkills: ['Comparison', 'Contextualization'],
      locationNumber: '49',
      mainEventKey: 'world-event-49-0',
      title: 'Religion, Warfare, and Mexica Legitimacy',
      dateLabel: '1325–1450',
      startYear: 1325,
      endYear: 1450,
      summary: 'Mexica rulers linked warfare, tribute, and public religious ritual to a sacred story of their capital and empire.',
      significance: 'Religious ceremonies presented conquest and sacrifice as obligations within a cosmic order, helping rulers justify expansion and mobilize society.',
      keyPeople: [{ name: 'Mexica priests', role: 'Conducted state rituals that connected military success and royal authority to the gods.' }],
      keyTerms: [
        { term: 'Huitzilopochtli', explanation: 'The Mexica patron deity associated with the sun, warfare, and the sacred identity of Tenochtitlan.' },
        { term: 'human sacrifice', explanation: 'A state ritual that Mexica leaders connected to sustaining cosmic order and displaying political power.' },
      ],
      evidence: [
        'The Templo Mayor placed state ceremony at the physical and symbolic center of Tenochtitlan.',
        'Military campaigns supplied captives for ritual and demonstrated the ruler’s ability to defend and expand the sacred community.',
      ],
      examConnection: 'Use Mexica ritual and warfare to compare how rulers in different regions used belief systems and public display to legitimate political authority.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.4' },
    }),
    freezeRecord({
      id: 'apwh-u1-tenochtitlan-triple-alliance-tribute',
      examSkills: ['Causation', 'Comparison'],
      locationNumber: '49',
      mainEventKey: 'world-event-49-0',
      title: 'Triple Alliance and Tribute Empire',
      dateLabel: '1428–1450',
      startYear: 1428,
      endYear: 1450,
      summary: 'Tenochtitlan joined Texcoco and Tlacopan in the Triple Alliance and used conquest to collect tribute from subject communities.',
      significance: 'Tribute moved food, textiles, labor, and luxury goods toward the imperial center, strengthening rulers while creating resentment among subject peoples.',
      keyPeople: [{ name: 'Itzcoatl', role: 'Led Tenochtitlan during the formation of the Triple Alliance and the early expansion of its tribute power.' }],
      keyTerms: [
        { term: 'Triple Alliance', explanation: 'The political and military alliance of Tenochtitlan, Texcoco, and Tlacopan formed in 1428.' },
        { term: 'tribute empire', explanation: 'An empire that leaves many conquered communities locally governed while requiring regular payments and obedience.' },
      ],
      evidence: [
        'Conquered communities delivered specified goods such as maize, cloth, cacao, feathers, and military equipment.',
        'The alliance concentrated an increasing share of tribute and influence in Tenochtitlan.',
      ],
      examConnection: 'Use the Triple Alliance to compare tribute-based imperial rule with other systems that extracted taxes, goods, or labor from subject populations.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.4' },
    }),
    freezeRecord({
      id: 'apwh-u1-cusco-ayllu-mita-labor',
      examSkills: ['Causation', 'Comparison'],
      locationNumber: '50',
      mainEventKey: 'world-event-50-0',
      title: "Ayllu, Mit'a, and State Labor",
      dateLabel: '1438–1450',
      startYear: 1438,
      endYear: 1450,
      summary: "Inca rulers organized ayllu communities through rotating mit'a labor obligations rather than relying on a money tax.",
      significance: "The mit'a converted community labor into roads, terraces, armies, storehouses, and public works that expanded imperial capacity across the Andes.",
      keyPeople: [{ name: 'ayllu leaders', role: 'Coordinated kin-based communities and helped allocate households for rotating state labor obligations.' }],
      keyTerms: [
        { term: 'ayllu', explanation: 'An Andean kin-based community that shared land, obligations, and mutual support.' },
        { term: "mit'a", explanation: 'A rotating labor obligation through which communities supplied workers to the Inca state.' },
      ],
      evidence: [
        'Households supplied labor for farming state lands, military service, construction, and transport.',
        'The state redistributed stored goods during campaigns, ceremonies, and periods of local need.',
      ],
      examConnection: "Use ayllu and mit'a to explain how the Inca mobilized labor and compare their system with tribute or tax collection in other empires.",
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.4' },
    }),
    freezeRecord({
      id: 'apwh-u1-cusco-pachacuti-tawantinsuyu',
      examSkills: ['Causation', 'Contextualization'],
      locationNumber: '50',
      mainEventKey: 'world-event-50-0',
      title: 'Pachacuti and Tawantinsuyu',
      dateLabel: '1438–1450',
      startYear: 1438,
      endYear: 1450,
      summary: 'Pachacuti transformed the kingdom centered on Cusco into the expanding Inca state called Tawantinsuyu.',
      significance: 'Expansion joined contrasting highland and coastal environments under a ruler who reorganized territory, labor, and political relationships from Cusco.',
      keyPeople: [{ name: 'Pachacuti', role: 'Inca ruler credited with reorganizing Cusco and beginning the rapid imperial expansion of Tawantinsuyu.' }],
      keyTerms: [
        { term: 'Tawantinsuyu', explanation: 'The Inca name for their empire, often translated as the Land of the Four Quarters.' },
        { term: 'vertical economy', explanation: 'Andean access to products from different elevations through communities, colonies, and exchange.' },
      ],
      evidence: [
        'Pachacuti organized conquered territory into four broad regions connected to the capital at Cusco.',
        'Inca expansion linked ecological zones that produced different crops, animals, and raw materials.',
      ],
      examConnection: 'Use Pachacuti to explain how military expansion and environmental diversity shaped the administrative needs of the Inca state.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.4' },
    }),
    freezeRecord({
      id: 'apwh-u1-cusco-roads-quipu-administration',
      examSkills: ['Causation', 'Comparison'],
      locationNumber: '50',
      mainEventKey: 'world-event-50-0',
      title: 'Roads, Quipu, and Imperial Administration',
      dateLabel: '1438–1450',
      startYear: 1438,
      endYear: 1450,
      summary: 'Inca roads, runners, storehouses, and quipu records connected distant Andean communities to administrators centered on Cusco.',
      significance: 'Transport and recordkeeping allowed officials to mobilize workers, count resources, move armies, and redistribute supplies without alphabetic writing.',
      keyPeople: [{ name: 'quipucamayocs', role: 'Specialists who made and interpreted knotted-cord records for administrators.' }],
      keyTerms: [
        { term: 'quipu', explanation: 'A system of knotted cords used to record numerical and administrative information.' },
        { term: 'chasqui', explanation: 'A relay runner who carried messages and goods along the Inca road system.' },
      ],
      evidence: [
        'A wide road network connected provincial centers, state storehouses, and military routes through difficult terrain.',
        'Quipu records helped officials track population, tribute obligations, labor, and stored resources.',
      ],
      examConnection: 'Use roads and quipu to compare how large states solved the shared problems of communication, recordkeeping, and resource mobilization.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.4' },
    }),
    freezeRecord({
      id: 'apwh-u1-london-manorial-feudal-order',
      examSkills: ['CCOT', 'Contextualization'],
      locationNumber: '23',
      mainEventKey: 'world-event-23-0',
      title: 'Manorial Agriculture and Feudal Order',
      dateLabel: '1200–1450',
      startYear: 1200,
      endYear: 1450,
      summary: 'London serves as a regional anchor for a Europe in which manors organized rural production and feudal ties distributed political and military obligations.',
      significance: 'These overlapping local institutions shaped political fragmentation and agricultural life even as monarchies, towns, and commerce gradually expanded.',
      keyPeople: [{ name: 'manorial lords and peasants', role: 'Negotiated rents, labor services, protection, and access to land within local agricultural communities.' }],
      keyTerms: [
        { term: 'manorialism', explanation: 'A rural economic and social system organized around an estate, its lord, and dependent peasant labor.' },
        { term: 'feudalism', explanation: 'A broad label for decentralized political relationships based on landholding, loyalty, and military obligation.' },
      ],
      evidence: [
        'Most Europeans lived in agricultural communities where peasants owed rents or labor to landholding elites.',
        'Kings often depended on nobles whose local land, castles, and armed followers limited centralized authority.',
      ],
      examConnection: 'Use manorial and feudal relationships to contextualize Europe’s decentralized order and trace continuity alongside the later growth of towns and monarchies.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.6' },
    }),
    freezeRecord({
      id: 'apwh-u1-london-towns-guilds-commerce',
      examSkills: ['Causation', 'CCOT'],
      locationNumber: '23',
      mainEventKey: 'world-event-23-0',
      title: 'Towns, Guilds, and Commercial Growth',
      dateLabel: '1200–1450',
      startYear: 1200,
      endYear: 1450,
      summary: 'London serves as a representative map anchor for the broader European growth of towns and merchant and craft guilds that regulated economic life.',
      significance: 'Urban and commercial growth created institutions and social groups with interests extending beyond manorial agriculture and local noble authority.',
      keyPeople: [{ name: 'guild members', role: 'Merchants and artisans who regulated occupations, trained apprentices, and defended collective privileges.' }],
      keyTerms: [
        { term: 'guild', explanation: 'An association of merchants or craftspeople that regulated standards, training, prices, and market access.' },
        { term: 'commercial growth', explanation: 'The expansion of markets, specialized production, money exchange, and long-distance trade.' },
      ],
      evidence: [
        'Merchant guilds protected trade privileges, while craft guilds supervised apprenticeship and product standards.',
        'London connected regional agricultural production with wider North Sea and European commercial networks.',
      ],
      examConnection: 'Use guilds and towns to explain how expanding commerce changed European social organization while many rural manorial practices continued.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.6' },
    }),
    freezeRecord({
      id: 'apwh-u1-london-magna-carta-monarchy',
      examSkills: ['Comparison', 'Contextualization'],
      locationNumber: '23',
      mainEventKey: 'world-event-23-0',
      title: 'Magna Carta and Negotiated Monarchy',
      dateLabel: '1215',
      startYear: 1215,
      endYear: 1215,
      summary: 'London and England anchor a European case of negotiated monarchy in which barons compelled King John to accept Magna Carta during political conflict.',
      significance: 'The charter expressed medieval elite bargaining and the principle that a monarch faced established legal constraints, not a system of modern democracy.',
      keyPeople: [{ name: 'King John', role: 'Accepted Magna Carta after conflict with English barons over failed wars, taxation, and arbitrary royal actions.' }],
      keyTerms: [
        { term: 'Magna Carta', explanation: 'A 1215 charter protecting specific baronial and ecclesiastical privileges and limiting some royal actions.' },
        { term: 'negotiated monarchy', explanation: 'Rule shaped by bargaining between a monarch and powerful groups whose cooperation the ruler needed.' },
      ],
      evidence: [
        'The charter arose from a baronial revolt and chiefly protected the interests of nobles, the church, and other privileged groups.',
        'Clauses required the king to observe inherited customs and forms of lawful judgment in specified disputes.',
      ],
      examConnection: 'Use Magna Carta to compare constraints on rulers while avoiding anachronism: it limited some royal behavior but did not create modern democracy.',
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.6' },
    }),
  ]);

  const UNIT_CARDS = Object.freeze({
    context: freezeUnitCard({
      id: 'apwh-u1-context-global-tapestry',
      kind: 'context',
      role: 'Unit 1 Context Card',
      title: 'The World in c. 1200',
      summary: 'By c. 1200, regional states across Afro-Eurasia used belief systems, taxation, trade, and specialized administration to organize diverse populations.',
      examSkills: ['Contextualization', 'Comparison'],
      prompt: 'As you study Unit 1, compare the material foundations of state power with the cultural ideas rulers used to legitimize authority.',
      takeaways: [
        'Song China connected centralized administration to commercial growth and infrastructure.',
        'States in Dar al-Islam, South Asia, and Southeast Asia adapted shared religious traditions to local political needs.',
        'West African rulers converted control of trade into revenue, military capacity, and prestige.',
      ],
    }),
    synthesis: freezeUnitCard({
      id: 'apwh-u1-synthesis-state-power',
      kind: 'synthesis',
      role: 'Unit 1 Synthesis Card',
      title: 'How States Built and Justified Power',
      summary: 'Across Unit 1, rulers built power by organizing resources and people, then justified that power through religion, learning, and public display.',
      examSkills: ['Comparison', 'CCOT'],
      prompt: 'Build a defensible comparison using at least two regions: which mechanisms of state building were shared, and which depended on local conditions?',
      takeaways: [
        'Material systems such as taxes, canals, trade routes, and labor produced usable state capacity.',
        'Belief systems and cultural patronage translated capacity into legitimacy among diverse populations.',
        'Political continuity often depended on adapting institutions rather than preserving them unchanged.',
      ],
    }),
  });

  const byId = new Map(STUDY_EVENTS.map(record => [record.id, record]));

  function describeRuleValue(value) {
    return value === '' ? '""' : String(value);
  }

  function validateExamSkills(examSkills, fail) {
    if (examSkills.length < 1) fail('missing examSkills');
    if (examSkills.length > 2) fail('too many examSkills');
    const invalidSkillIndex = examSkills.findIndex(skill => !VALID_EXAM_SKILLS.has(skill));
    if (invalidSkillIndex !== -1) {
      fail(`invalid examSkill ${describeRuleValue(examSkills[invalidSkillIndex])}`);
    }
    const duplicateSkillIndex = examSkills.findIndex(
      (skill, index) => examSkills.indexOf(skill) !== index,
    );
    if (duplicateSkillIndex !== -1) {
      fail(`duplicate examSkill ${describeRuleValue(examSkills[duplicateSkillIndex])}`);
    }
  }

  function validateStudyGraph() {
    const seenIds = new Set();
    for (const record of STUDY_EVENTS) {
      if (seenIds.has(record.id)) {
        throw new Error(`Invalid Unit 1 study record ${record.id}: duplicate record ID`);
      }
      seenIds.add(record.id);
    }

    const categoryReciprocals = {
      causeStudyPointIds: 'effectStudyPointIds',
      effectStudyPointIds: 'causeStudyPointIds',
      relatedStudyPointIds: 'relatedStudyPointIds',
    };

    for (const record of STUDY_EVENTS) {
      const fail = rule => { throw new Error(`Invalid Unit 1 study record ${record.id}: ${rule}`); };
      validateExamSkills(record.examSkills, fail);
      if (!record.topicCodes.length) fail('missing topicCodes');
      const invalidTopicIndex = record.topicCodes.findIndex(code => !VALID_TOPIC_CODES.has(code));
      if (invalidTopicIndex !== -1) {
        fail(`invalid topicCode ${describeRuleValue(record.topicCodes[invalidTopicIndex])}`);
      }
      const duplicateTopicIndex = record.topicCodes.findIndex(
        (code, index) => record.topicCodes.indexOf(code) !== index,
      );
      if (duplicateTopicIndex !== -1) {
        fail(`duplicate topicCode ${describeRuleValue(record.topicCodes[duplicateTopicIndex])}`);
      }

      if (!record.themeIds.length) fail('missing themeIds');
      const invalidThemeIndex = record.themeIds.findIndex(id => !VALID_THEME_IDS.has(id));
      if (invalidThemeIndex !== -1) {
        fail(`invalid themeId ${describeRuleValue(record.themeIds[invalidThemeIndex])}`);
      }
      const duplicateThemeIndex = record.themeIds.findIndex(
        (id, index) => record.themeIds.indexOf(id) !== index,
      );
      if (duplicateThemeIndex !== -1) {
        fail(`duplicate themeId ${describeRuleValue(record.themeIds[duplicateThemeIndex])}`);
      }

      const categoryKeys = Object.keys(categoryReciprocals);
      for (const key of categoryKeys) {
        if (record[key].some(targetId => targetId === record.id)) {
          fail(`self connection in ${key}`);
        }
        const duplicateTargetIndex = record[key].findIndex(
          (targetId, index) => record[key].indexOf(targetId) !== index,
        );
        if (duplicateTargetIndex !== -1) {
          const duplicateTarget = describeRuleValue(record[key][duplicateTargetIndex]);
          fail(`duplicate connection in ${key} to ${duplicateTarget}`);
        }
      }

      const targetCategories = new Map();
      for (const key of categoryKeys) {
        for (const targetId of record[key]) {
          const previousCategory = targetCategories.get(targetId);
          if (previousCategory) {
            fail(`cross-category connection ${targetId} in ${previousCategory} and ${key}`);
          }
          targetCategories.set(targetId, key);
        }
      }

      const linkedIds = categoryKeys.flatMap(key => record[key]);

      for (const key of categoryKeys) {
        for (const targetId of record[key]) {
          const target = byId.get(targetId);
          if (!target) fail(`unresolved connection ${targetId}`);
          if (!target[categoryReciprocals[key]].includes(record.id)) {
            fail(`nonreciprocal ${key} connection to ${targetId}`);
          }
          const note = record.connectionNotes[targetId];
          if (typeof note !== 'string' || !note.trim()) {
            fail(`missing connection note for ${targetId}`);
          }
          if (!/[A-Za-z]/.test(note) || /[\u3400-\u9fff]/.test(note)) {
            fail(`non-English connection note for ${targetId}`);
          }
          if (target.connectionNotes[record.id] !== note) {
            fail(`nonreciprocal connection note for ${targetId}`);
          }
        }
      }

      const noteIds = Object.keys(record.connectionNotes);
      const extraNoteIndex = noteIds.findIndex(id => !linkedIds.includes(id));
      if (extraNoteIndex !== -1) {
        fail(`extra connection note key ${describeRuleValue(noteIds[extraNoteIndex])}`);
      }
    }
  }

  validateStudyGraph();

  function validateUnitCards() {
    const expectedKinds = ['context', 'synthesis'];
    const cardKeys = Object.keys(UNIT_CARDS).sort();
    if (cardKeys.length !== expectedKinds.length
      || cardKeys.some((key, index) => key !== expectedKinds[index])) {
      throw new Error('Invalid Unit 1 unit cards: expected exactly context and synthesis keys');
    }

    const studyIds = new Set(STUDY_EVENTS.map(record => record.id));
    const seenKinds = new Set();
    const seenIds = new Set();
    for (const [slot, card] of Object.entries(UNIT_CARDS)) {
      const kind = typeof card.kind === 'string' ? card.kind : slot;
      const id = typeof card.id === 'string' && card.id ? card.id : '(missing ID)';
      const fail = rule => {
        throw new Error(`Invalid Unit 1 unit card ${kind} ${id}: ${rule}`);
      };
      if (!expectedKinds.includes(card.kind)) fail(`invalid kind ${describeRuleValue(card.kind)}`);
      if (seenKinds.has(card.kind)) fail(`duplicate kind ${card.kind}`);
      seenKinds.add(card.kind);
      if (card.kind !== slot) fail(`kind does not match ${slot} key`);
      if (!/^apwh-u1-(context|synthesis)-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(card.id)) {
        fail('invalid stable ID');
      }
      if (studyIds.has(card.id)) fail('ID collides with study record');
      if (seenIds.has(card.id)) fail('duplicate card ID');
      seenIds.add(card.id);
      for (const field of ['role', 'title', 'summary', 'prompt']) {
        if (typeof card[field] !== 'string' || !card[field].trim()) fail(`missing ${field}`);
        if (!/[A-Za-z]/.test(card[field]) || /[\u3400-\u9fff]/.test(card[field])) {
          fail(`non-English ${field}`);
        }
      }
      validateExamSkills(card.examSkills, fail);
      if (card.takeaways.length !== 3) fail('takeaways must contain exactly three items');
      for (const takeaway of card.takeaways) {
        if (typeof takeaway !== 'string' || !takeaway.trim()) fail('empty takeaway');
        if (!/[A-Za-z]/.test(takeaway) || /[\u3400-\u9fff]/.test(takeaway)) {
          fail('non-English takeaway');
        }
      }
    }
  }

  validateUnitCards();

  const byLocation = new Map(Object.keys(TRIAL_LOCATIONS).map(number => [number, Object.freeze([])]));
  for (const number of Object.keys(TRIAL_LOCATIONS)) {
    const records = STUDY_EVENTS
      .filter(record => record.locationNumber === number)
      .sort(compareRecords);
    byLocation.set(number, Object.freeze(records));
  }

  const api = Object.freeze({
    unitId: 'u1',
    unitNumber: 1,
    locationNumbers: Object.freeze(Object.keys(TRIAL_LOCATIONS)),
    locationName(number) { return TRIAL_LOCATIONS[String(number)] || null; },
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

  Object.defineProperty(root, 'APWH_U1_LOCATION_STUDY', {
    configurable: false,
    enumerable: true,
    writable: false,
    value: api,
  });
})(globalThis);
