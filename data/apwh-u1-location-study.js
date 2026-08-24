(function publishUnit1LocationStudy(root) {
  'use strict';

  const TRIAL_LOCATIONS = Object.freeze({
    '1': 'Hangzhou',
    '3': 'Baghdad',
    '6': 'Delhi',
    '7': 'Angkor',
    '73': 'Timbuktu',
  });

  function freezeRecord(record) {
    return Object.freeze({
      ...record,
      keyPeople: Object.freeze(record.keyPeople.map(person => Object.freeze({ ...person }))),
      keyTerms: Object.freeze(record.keyTerms.map(item => Object.freeze({ ...item }))),
      evidence: Object.freeze([...record.evidence]),
      source: Object.freeze({ ...record.source }),
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
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topics 1.1 and 1.2' },
    }),
    freezeRecord({
      id: 'apwh-u1-hangzhou-grand-canal-urban-market',
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
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topics 1.1 and 1.2' },
    }),
    freezeRecord({
      id: 'apwh-u1-hangzhou-paper-money-maritime-tools',
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
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topics 1.1 and 1.2' },
    }),
    freezeRecord({
      id: 'apwh-u1-angkor-khmer-hydraulic-state',
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
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.4; Topic 2.2 trade mechanism context' },
    }),
    freezeRecord({
      id: 'apwh-u1-timbuktu-islamic-learning-griots',
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
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.4' },
    }),
    freezeRecord({
      id: 'apwh-u1-timbuktu-mansa-musa-pilgrimage',
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
      source: { id: 'amsco-apwh-u1', locator: 'AMSCO AP World History, Unit 1, Topic 1.4' },
    }),
  ]);

  const byLocation = new Map(Object.keys(TRIAL_LOCATIONS).map(number => [number, Object.freeze([])]));
  for (const number of Object.keys(TRIAL_LOCATIONS)) {
    const records = STUDY_EVENTS
      .filter(record => record.locationNumber === number)
      .sort(compareRecords);
    byLocation.set(number, Object.freeze(records));
  }

  const api = Object.freeze({
    locationNumbers: Object.freeze(Object.keys(TRIAL_LOCATIONS)),
    locationName(number) { return TRIAL_LOCATIONS[String(number)] || null; },
    getByLocation(number) { return [...(byLocation.get(String(number)) || [])]; },
    compareRecords,
    records: STUDY_EVENTS,
  });

  Object.defineProperty(root, 'APWH_U1_LOCATION_STUDY', {
    configurable: false,
    enumerable: true,
    writable: false,
    value: api,
  });
})(globalThis);
