(function publishUnit2LocationStudy(root) {
  'use strict';

  if (Object.prototype.hasOwnProperty.call(root, 'APWH_U2_LOCATION_STUDY')) {
    throw new Error('Invalid Unit 2 global APWH_U2_LOCATION_STUDY: refusing to overwrite existing value');
  }

  const UNIT_ID = 'u2';
  const UNIT_NUMBER = 2;
  const LOCATIONS = Object.freeze({
    '2': 'Malacca',
    '8': 'Karakorum',
    '9': 'Samarkand',
    '10': 'Nanjing',
    '84': 'Cairo',
    '85': 'Kilwa',
  });
  const VALID_TOPIC_CODES = new Set(['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7']);
  const VALID_THEME_IDS = new Set(['GOV', 'ECN', 'TEC', 'CDI', 'SIO', 'ENV']);
  const VALID_EXAM_SKILLS = new Set(['Causation', 'Comparison', 'CCOT', 'Contextualization']);
  const VALID_MAIN_EVENTS = new Set([
    'world-event-2-1', 'world-event-8-0', 'world-event-9-0',
    'world-event-10-3', 'world-event-84-0', 'world-event-85-0',
  ]);

  const STUDY_MANIFEST = [
    ['apwh-u2-karakorum-mongol-unification-conquest', '8', 1, 'Mongol Unification and Conquest', '1206–1227', 1206, 1227, 'world-event-8-0', ['2.2', '2.7'], ['GOV'], ['Causation', 'CCOT']],
    ['apwh-u2-karakorum-pax-mongolica-protected-trade', '8', 2, 'Pax Mongolica and Protected Trade', 'c. 1250–c. 1350', 1250, 1350, 'world-event-8-0', ['2.1', '2.2', '2.7'], ['GOV', 'ECN'], ['Causation']],
    ['apwh-u2-karakorum-yam-relay-cross-cultural-transfer', '8', 3, 'The Yam Relay and Cross-Cultural Transfer', 'c. 1250–1368', 1250, 1368, 'world-event-8-0', ['2.2', '2.5'], ['TEC', 'CDI'], ['Causation', 'Comparison']],
    ['apwh-u2-samarkand-caravanserai-merchant-infrastructure', '9', 1, 'Caravanserai and Merchant Infrastructure', '1200–1450', 1200, 1450, 'world-event-9-0', ['2.1', '2.7'], ['ECN', 'TEC'], ['Causation']],
    ['apwh-u2-samarkand-bills-exchange-banking-houses', '9', 2, 'Bills of Exchange and Banking Houses', '1300–1450', 1300, 1450, 'world-event-9-0', ['2.1', '2.7'], ['ECN'], ['Causation', 'Comparison']],
    ['apwh-u2-samarkand-timurid-commercial-learning-hub', '9', 3, 'Timurid Samarkand as a Commercial and Learning Hub', '1370–1450', 1370, 1450, 'world-event-9-0', ['2.1', '2.5'], ['CDI', 'TEC'], ['CCOT', 'Comparison']],
    ['apwh-u2-malacca-monsoon-navigation-maritime-technology', '2', 1, 'Monsoon Navigation and Maritime Technology', '1200–1450', 1200, 1450, 'world-event-2-1', ['2.3', '2.7'], ['TEC', 'ECN'], ['Causation']],
    ['apwh-u2-malacca-strategic-port-state', '2', 2, 'Malacca as a Strategic Port State', 'c. 1400–1450', 1400, 1450, 'world-event-2-1', ['2.3', '2.7'], ['ECN', 'GOV'], ['Causation', 'Comparison']],
    ['apwh-u2-malacca-merchant-diasporas-spread-islam', '2', 3, 'Merchant Diasporas and the Spread of Islam', 'c. 1400–1450', 1400, 1450, 'world-event-2-1', ['2.3', '2.5'], ['CDI', 'SIO'], ['Causation', 'CCOT']],
    ['apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce', '85', 1, 'Swahili City-States and Indian Ocean Commerce', '1000–1450', 1000, 1450, 'world-event-85-0', ['2.3', '2.7'], ['ECN', 'GOV'], ['Causation', 'Comparison']],
    ['apwh-u2-kilwa-gold-ivory-regional-specialization', '85', 2, 'Gold, Ivory, and Regional Specialization', '1200–1450', 1200, 1450, 'world-event-85-0', ['2.3', '2.7'], ['ECN'], ['Causation']],
    ['apwh-u2-kilwa-swahili-cultural-synthesis', '85', 3, 'Swahili Cultural Synthesis', '1200–1450', 1200, 1450, 'world-event-85-0', ['2.3', '2.5'], ['CDI', 'SIO'], ['Comparison', 'CCOT']],
    ['apwh-u2-cairo-trans-saharan-gold-camel-caravans', '84', 1, 'Trans-Saharan Gold and Camel-Caravan Trade', '1200–1450', 1200, 1450, 'world-event-84-0', ['2.4', '2.7'], ['ECN', 'TEC'], ['Causation', 'Comparison']],
    ['apwh-u2-cairo-mansa-musa-gold-shock', '84', 2, "Mansa Musa's Gold Shock", '1324', 1324, 1324, 'world-event-84-0', ['2.4', '2.5'], ['GOV', 'ECN', 'CDI'], ['Causation', 'Contextualization']],
    ['apwh-u2-cairo-black-death-demographic-change', '84', 3, 'Black Death and Demographic Change', '1347–1351', 1347, 1351, 'world-event-84-0', ['2.6'], ['ENV', 'SIO'], ['Causation', 'CCOT']],
    ['apwh-u2-nanjing-treasure-fleet-technology-scale', '10', 1, 'Treasure-Fleet Technology and Scale', '1405–1433', 1405, 1433, 'world-event-10-3', ['2.3', '2.7'], ['TEC', 'GOV'], ['Causation']],
    ['apwh-u2-nanjing-zheng-he-tributary-voyages', '10', 2, "Zheng He's Tributary Voyages", '1405–1433', 1405, 1433, 'world-event-10-3', ['2.3', '2.5'], ['GOV', 'CDI'], ['Causation', 'Comparison']],
    ['apwh-u2-nanjing-ming-maritime-retrenchment', '10', 3, 'Ming Maritime Retrenchment', '1433–1450', 1433, 1450, 'world-event-10-3', ['2.3', '2.7'], ['GOV', 'ECN'], ['CCOT', 'Causation']],
  ];

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
    if (!cause) throw new Error(`Invalid Unit 2 study connection causal: missing cause ${causeId}`);
    if (!effect) throw new Error(`Invalid Unit 2 study connection causal: missing effect ${effectId}`);
    if (causeId === effectId) throw new Error(`Invalid Unit 2 study connection causal: self connection ${causeId}`);
    cause.effectStudyPointIds.push(effectId);
    effect.causeStudyPointIds.push(causeId);
    cause.connectionNotes[effectId] = note;
    effect.connectionNotes[causeId] = note;
  }

  function addRelatedConnection(leftId, rightId, note) {
    const left = CONNECTION_DATA.get(leftId);
    const right = CONNECTION_DATA.get(rightId);
    if (!left) throw new Error(`Invalid Unit 2 study connection related: missing left ${leftId}`);
    if (!right) throw new Error(`Invalid Unit 2 study connection related: missing right ${rightId}`);
    if (leftId === rightId) throw new Error(`Invalid Unit 2 study connection related: self connection ${leftId}`);
    left.relatedStudyPointIds.push(rightId);
    right.relatedStudyPointIds.push(leftId);
    left.connectionNotes[rightId] = note;
    right.connectionNotes[leftId] = note;
  }

  addCausalConnection(
    'apwh-u2-karakorum-mongol-unification-conquest',
    'apwh-u2-karakorum-pax-mongolica-protected-trade',
    'Mongol conquest brought previously divided routes under related authorities that could protect merchants and punish raiders.',
  );
  addCausalConnection(
    'apwh-u2-karakorum-pax-mongolica-protected-trade',
    'apwh-u2-karakorum-yam-relay-cross-cultural-transfer',
    'Protected routes and relay stations accelerated the movement of envoys, specialists, information, and technologies across Eurasia.',
  );
  addCausalConnection('apwh-u2-samarkand-caravanserai-merchant-infrastructure', 'apwh-u2-samarkand-timurid-commercial-learning-hub', 'Reliable lodging, storage, and market infrastructure helped Samarkand attract merchants and scholars from multiple regions.');
  addCausalConnection('apwh-u2-samarkand-bills-exchange-banking-houses', 'apwh-u2-samarkand-timurid-commercial-learning-hub', 'Credit instruments reduced the need to carry coin and supported the commercial traffic that sustained a cosmopolitan center.');
  addCausalConnection('apwh-u2-malacca-monsoon-navigation-maritime-technology', 'apwh-u2-malacca-strategic-port-state', 'Predictable monsoon sailing and improved ships concentrated recurring traffic at the Strait of Malacca.');
  addCausalConnection('apwh-u2-malacca-strategic-port-state', 'apwh-u2-malacca-merchant-diasporas-spread-islam', 'A protected and heavily visited port encouraged foreign merchants to reside, marry, and establish religious communities.');
  addCausalConnection('apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce', 'apwh-u2-kilwa-gold-ivory-regional-specialization', 'Demand from Indian Ocean merchants rewarded coastal access to inland gold, ivory, and other specialized exports.');
  addCausalConnection('apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce', 'apwh-u2-kilwa-swahili-cultural-synthesis', 'Long-term commercial contact joined Bantu-speaking coastal societies with Islamic and Arabic cultural influences.');
  addCausalConnection('apwh-u2-cairo-trans-saharan-gold-camel-caravans', 'apwh-u2-cairo-mansa-musa-gold-shock', "Trans-Saharan commerce made Mali's gold wealth visible in Cairo and supplied the resources displayed during Mansa Musa's pilgrimage.");
  addCausalConnection('apwh-u2-karakorum-pax-mongolica-protected-trade', 'apwh-u2-cairo-black-death-demographic-change', 'Denser and safer Eurasian movement also allowed plague-bearing hosts and vectors to travel farther through connected routes.');
  addCausalConnection('apwh-u2-nanjing-treasure-fleet-technology-scale', 'apwh-u2-nanjing-zheng-he-tributary-voyages', 'Large ships, navigational knowledge, and state resources made seven long-distance expeditions possible.');
  addCausalConnection('apwh-u2-nanjing-zheng-he-tributary-voyages', 'apwh-u2-nanjing-ming-maritime-retrenchment', 'The voyages demonstrated Ming reach but their cost and political purpose strengthened court arguments for ending them.');

  addRelatedConnection('apwh-u2-karakorum-yam-relay-cross-cultural-transfer', 'apwh-u2-samarkand-timurid-commercial-learning-hub', 'Both cases show that commercial routes also moved specialists and knowledge, although one was an imperial relay and the other an urban center.');
  addRelatedConnection('apwh-u2-malacca-monsoon-navigation-maritime-technology', 'apwh-u2-samarkand-bills-exchange-banking-houses', 'Maritime technology reduced transport uncertainty while financial instruments reduced payment risk; both lowered the cost of exchange.');
  addRelatedConnection('apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce', 'apwh-u2-malacca-strategic-port-state', 'Kilwa and Malacca both converted strategic access to maritime exchange into urban wealth and political power.');
  addRelatedConnection('apwh-u2-kilwa-swahili-cultural-synthesis', 'apwh-u2-malacca-merchant-diasporas-spread-islam', 'Resident Muslim merchants contributed to locally distinct forms of Islamic cultural change in Southeast Asia and the Swahili Coast.');
  addRelatedConnection('apwh-u2-cairo-mansa-musa-gold-shock', 'apwh-u2-nanjing-zheng-he-tributary-voyages', 'Mansa Musa and Zheng He used conspicuous long-distance movement to display state wealth and strengthen diplomatic or religious standing.');

  // Raw learner content follows. Manifest metadata and graph fields are injected after validation.
  const RAW_RECORDS = [
    {
      id: 'apwh-u2-karakorum-mongol-unification-conquest', locationNumber: '8', mainEventKey: 'world-event-8-0',
      title: 'Mongol Unification and Conquest', dateLabel: '1206–1227', startYear: 1206, endYear: 1227,
      summary: 'Temujin unified Mongol groups and used disciplined cavalry, mobility, and terror to build a conquest state across Eurasia.',
      significance: 'Conquest brought previously divided land routes under related Mongol authorities and created the political conditions for faster trade and communication.',
      keyPeople: [{ name: 'Genghis Khan', role: 'Unified Mongol groups in 1206 and directed conquests that connected territories from northern China toward Central and Southwest Asia.' }],
      keyTerms: [{ term: 'kurultai', explanation: 'An assembly of Mongol leaders that selected a khan and affirmed major political decisions.' }, { term: 'decimal organization', explanation: 'A military structure grouping warriors into units of tens, hundreds, thousands, and ten-thousands.' }],
      evidence: ['A 1206 kurultai recognized Temujin as Genghis Khan after he defeated rival Mongol groups.', 'Mongol forces conquered the Khwarazmian realm and linked Central Asian routes to a rapidly expanding empire.'],
      examConnection: 'Use Mongol unification as a political cause of expanded exchange, then explain the protection mechanism instead of treating conquest and trade as a simple sequence.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.2 and 2.7' },
    },
    {
      id: 'apwh-u2-karakorum-pax-mongolica-protected-trade', locationNumber: '8', mainEventKey: 'world-event-8-0',
      title: 'Pax Mongolica and Protected Trade', dateLabel: 'c. 1250–c. 1350', startYear: 1250, endYear: 1350,
      summary: 'Mongol authorities repaired routes, punished raiders, and protected merchants across a large portion of Eurasia.',
      significance: 'Lower protection costs allowed more merchants, envoys, and travelers to use overland routes and helped create a new high point in Silk Roads exchange.',
      keyPeople: [{ name: 'Mongol khans', role: 'Governed related khanates that protected routes, enforced laws, and supported movement across imperial boundaries.' }],
      keyTerms: [{ term: 'Pax Mongolica', explanation: 'The period of relative security and connectivity across Mongol-ruled Eurasia.' }, { term: 'protection cost', explanation: 'The risk and expense merchants face from robbery, war, tolls, and uncertain enforcement.' }],
      evidence: ['Mongol rulers repaired roads and used soldiers to protect commercial routes from raiders.', 'Merchants could cross territories governed by related Mongol states with more predictable rules and lower risk.'],
      examConnection: 'Use the Pax Mongolica to explain how political control caused trade growth by reducing risk, not merely by placing more territory under one empire.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.1, 2.2, and 2.7' },
    },
    {
      id: 'apwh-u2-karakorum-yam-relay-cross-cultural-transfer', locationNumber: '8', mainEventKey: 'world-event-8-0',
      title: 'The Yam Relay and Cross-Cultural Transfer', dateLabel: 'c. 1250–1368', startYear: 1250, endYear: 1368,
      summary: 'Relay stations and protected movement carried official messages, specialists, technologies, and knowledge across Mongol Eurasia.',
      significance: 'The same infrastructure used for imperial control accelerated cultural and technological transfer among China, Central Asia, the Islamic world, and Europe.',
      keyPeople: [{ name: 'Mongol relay riders', role: 'Moved messages and official travelers between staffed stations across long imperial distances.' }],
      keyTerms: [{ term: 'yam', explanation: 'The Mongol imperial relay network of stations, fresh horses, supplies, and authorized travelers.' }, { term: 'technology transfer', explanation: 'The movement and adaptation of technical knowledge between societies.' }],
      evidence: ['Relay stations provided fresh horses and supplies so official messages could move rapidly across the empire.', 'Paper, gunpowder knowledge, medical learning, and skilled workers traveled through intensified Eurasian contacts.'],
      examConnection: 'Use the yam to show that empire affected more than commerce: administrative infrastructure also changed the speed of cultural and technological exchange.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.2 and 2.5' },
    },
    {
      id: 'apwh-u2-samarkand-caravanserai-merchant-infrastructure', locationNumber: '9', mainEventKey: 'world-event-9-0',
      title: 'Caravanserai and Merchant Infrastructure', dateLabel: '1200–1450', startYear: 1200, endYear: 1450,
      summary: 'Caravanserai gave merchants recurring places to rest animals, store goods, obtain information, and conduct exchange along overland routes.',
      significance: 'A chain of predictable service nodes reduced the logistical cost of long journeys and made cities such as Samarkand more useful to interregional merchants.',
      keyPeople: [{ name: 'caravan merchants', role: 'Organized animals, guards, credit, and goods for long-distance movement between commercial cities.' }],
      keyTerms: [{ term: 'caravanserai', explanation: 'A fortified roadside lodging and commercial station serving merchants and pack animals.' }, { term: 'caravan', explanation: 'A group of travelers and pack animals moving together for security and logistical support.' }],
      evidence: ['Caravanserai supplied lodging, water, storage, and market space at recurring points along major routes.', 'Improved camel saddles allowed pack animals to carry heavier loads across arid terrain.'],
      examConnection: 'Use caravanserai as evidence that infrastructure caused network growth by lowering recurring transport and information costs for merchants.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.1 and 2.7' },
    },
    {
      id: 'apwh-u2-samarkand-bills-exchange-banking-houses', locationNumber: '9', mainEventKey: 'world-event-9-0',
      title: 'Bills of Exchange and Banking Houses', dateLabel: '1300–1450', startYear: 1300, endYear: 1450,
      summary: 'Credit instruments allowed merchants to transfer value without carrying the full payment in heavy coin across dangerous routes.',
      significance: 'Bills of exchange and banking houses reduced theft risk and connected commercial practices developed in Asia with expanding financial institutions farther west.',
      keyPeople: [{ name: 'merchant-bankers', role: 'Accepted deposits, verified written claims, extended credit, and converted commercial promises into payment.' }],
      keyTerms: [{ term: 'bill of exchange', explanation: 'A written order or promise to pay a specified person a specified amount at an agreed time.' }, { term: 'banking house', explanation: 'A commercial institution that accepted deposits, exchanged currencies, and provided credit or payment services.' }],
      evidence: ['Merchants could deposit value in one place and use written instruments to obtain payment elsewhere.', 'Banking houses expanded in European commercial cities during the 1300s as long-distance trade increased.'],
      examConnection: 'Compare bills of exchange with maritime technology: both expanded trade, but one reduced payment risk while the other reduced transport uncertainty.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.1 and 2.7' },
    },
    {
      id: 'apwh-u2-samarkand-timurid-commercial-learning-hub', locationNumber: '9', mainEventKey: 'world-event-9-0',
      title: 'Timurid Samarkand as a Commercial and Learning Hub', dateLabel: '1370–1450', startYear: 1370, endYear: 1450,
      summary: 'Timurid patronage made Samarkand a center where merchants, artisans, architects, and scholars from several regions met.',
      significance: 'The city demonstrates continuity between commercial connectivity and knowledge exchange even as conquest changed the rulers controlling Central Asian routes.',
      keyPeople: [{ name: 'Ulugh Beg', role: 'A Timurid ruler and patron of astronomy and education who sponsored a major madrasa in Samarkand.' }],
      keyTerms: [{ term: 'Timurid Empire', explanation: 'The Central Asian state founded by Timur that controlled important overland routes and cities.' }, { term: 'madrasa', explanation: 'An institution of advanced Islamic learning that could also support mathematics, astronomy, and law.' }],
      evidence: ['Timur made Samarkand his capital and drew skilled workers and cultural resources toward the city.', 'The Ulugh Beg Madrasa, built in the early 1400s, linked political patronage with scholarly activity.'],
      examConnection: 'Use Samarkand to explain continuity and change: conquest disrupted regions, yet rulers continued using trade cities to collect wealth and patronize learning.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.1 and 2.5' },
    },
    {
      id: 'apwh-u2-malacca-monsoon-navigation-maritime-technology', locationNumber: '2', mainEventKey: 'world-event-2-1',
      title: 'Monsoon Navigation and Maritime Technology', dateLabel: '1200–1450', startYear: 1200, endYear: 1450,
      summary: 'Knowledge of monsoon winds and improved sails, rudders, compasses, and astrolabes made Indian Ocean travel more predictable.',
      significance: 'Predictable seasons and better navigation allowed merchants to plan recurring voyages, carry heavier cargo, and connect distant ports at lower cost.',
      keyPeople: [{ name: 'Indian Ocean sailors', role: 'Combined seasonal wind knowledge with navigational instruments and ship designs suited to long-distance trade.' }],
      keyTerms: [{ term: 'monsoon winds', explanation: 'Seasonally reversing wind patterns that structured sailing schedules across the Indian Ocean.' }, { term: 'lateen sail', explanation: 'A triangular sail that helped ships maneuver across changing wind directions.' }],
      evidence: ['Sailors timed voyages around winds that blew from the northeast in one season and the southwest in another.', 'Compasses, astrolabes, sternpost rudders, and compartmentalized ships improved direction, control, and cargo security.'],
      examConnection: 'Use monsoon knowledge and ship technology as causal evidence for Indian Ocean growth, then distinguish predictable timing from political protection.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7' },
    },
    {
      id: 'apwh-u2-malacca-strategic-port-state', locationNumber: '2', mainEventKey: 'world-event-2-1',
      title: 'Malacca as a Strategic Port State', dateLabel: 'c. 1400–1450', startYear: 1400, endYear: 1450,
      summary: 'Malacca used its position on a narrow maritime passage to tax ships, protect traffic, and become a major commercial entrepot.',
      significance: 'The port converted predictable trade flows into public revenue and naval power, showing how states could grow from exchange rather than agricultural production.',
      keyPeople: [{ name: 'Malaccan sultans', role: 'Collected port revenue, protected the strait, and governed a commercial state serving merchants from many regions.' }],
      keyTerms: [{ term: 'entrepot', explanation: 'A port where merchants unload, store, exchange, and re-export goods from multiple regions.' }, { term: 'Strait of Malacca', explanation: 'The narrow passage linking the Indian Ocean with the South China Sea and East Asian markets.' }],
      evidence: ['Malacca charged ships using the strait and used revenue to support protection against piracy.', 'Its prosperity depended primarily on trade and services rather than farming, mining, or large-scale manufacturing.'],
      examConnection: 'Compare Malacca with Kilwa to explain how strategic ports converted maritime traffic into political authority through different local institutions.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7' },
    },
    {
      id: 'apwh-u2-malacca-merchant-diasporas-spread-islam', locationNumber: '2', mainEventKey: 'world-event-2-1',
      title: 'Merchant Diasporas and the Spread of Islam', dateLabel: 'c. 1400–1450', startYear: 1400, endYear: 1450,
      summary: 'Muslim merchants who remained in Southeast Asian ports formed communities, married locally, and helped Islam gain influence without military conquest.',
      significance: 'Diaspora settlement turned waiting time and commercial trust into long-term cultural change while local societies adapted Islam to existing traditions.',
      keyPeople: [{ name: 'Muslim merchant communities', role: 'Maintained commercial and religious ties while establishing households and institutions in Southeast Asian ports.' }],
      keyTerms: [{ term: 'diaspora', explanation: 'A community living away from its place of origin while preserving social, cultural, or commercial connections.' }, { term: 'syncretism', explanation: 'The combination or adaptation of elements drawn from different cultural and religious traditions.' }],
      evidence: ['Merchants often stayed in ports for months while waiting for monsoon winds and sometimes established permanent households.', 'Islam spread through commercial relationships, intermarriage, and local rulers rather than a single campaign of conquest.'],
      examConnection: 'Use Malacca to explain how exchange caused cultural change, while noting that adoption remained selective and local traditions continued.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.5' },
    },
    {
      id: 'apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce', locationNumber: '85', mainEventKey: 'world-event-85-0',
      title: 'Swahili City-States and Indian Ocean Commerce', dateLabel: '1000–1450', startYear: 1000, endYear: 1450,
      summary: 'Kilwa and other Swahili city-states connected East African producers with merchants from Arabia, Persia, India, and China.',
      significance: 'Commercial access supported autonomous coastal cities whose rulers and merchants accumulated wealth without controlling a single territorial empire.',
      keyPeople: [{ name: 'Swahili merchant elites', role: 'Managed coastal trade, maintained overseas relationships, and sponsored urban construction and Islamic institutions.' }],
      keyTerms: [{ term: 'city-state', explanation: 'An independent political community centered on a city and its surrounding territory.' }, { term: 'Indian Ocean network', explanation: 'The maritime exchange system connecting East Africa, Southwest Asia, South Asia, Southeast Asia, and East Asia.' }],
      evidence: ['Kilwa exported African goods and imported Indian textiles, Chinese ceramics, and products from Southwest Asia.', 'Commercial wealth supported coral-stone houses and mosques in coastal cities.'],
      examConnection: 'Compare Swahili city-states with Malacca to show how maritime exchange supported different forms of port-based political power.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7' },
    },
    {
      id: 'apwh-u2-kilwa-gold-ivory-regional-specialization', locationNumber: '85', mainEventKey: 'world-event-85-0',
      title: 'Gold, Ivory, and Regional Specialization', dateLabel: '1200–1450', startYear: 1200, endYear: 1450,
      summary: 'Kilwa linked inland supplies of gold and ivory to overseas demand and exchanged them for manufactured and luxury goods.',
      significance: 'Long-distance demand encouraged regions to specialize in goods they could supply competitively and tied coastal prosperity to inland production and transport.',
      keyPeople: [{ name: 'East African traders', role: 'Moved inland commodities toward coastal markets and distributed imported goods back through regional networks.' }],
      keyTerms: [{ term: 'regional specialization', explanation: 'The concentration of production in goods a region can supply effectively for exchange.' }, { term: 'hinterland', explanation: 'The inland zone connected economically to a port through production, transport, and markets.' }],
      evidence: ['Gold from the Great Zimbabwe region moved through ports such as Sofala and into the wider coastal trade served by Kilwa.', 'Ivory and other African exports were exchanged for textiles, ceramics, metal goods, and luxury products.'],
      examConnection: 'Use Kilwa to explain how expanding networks changed production by rewarding regional specialization and linking inland economies to maritime demand.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7' },
    },
    {
      id: 'apwh-u2-kilwa-swahili-cultural-synthesis', locationNumber: '85', mainEventKey: 'world-event-85-0',
      title: 'Swahili Cultural Synthesis', dateLabel: '1200–1450', startYear: 1200, endYear: 1450,
      summary: 'Coastal East Africans combined Bantu linguistic and social foundations with Islamic belief and vocabulary associated with overseas contact.',
      significance: 'Swahili culture shows that network expansion produced locally distinct synthesis rather than replacing African identities with a uniform imported culture.',
      keyPeople: [{ name: 'Swahili coastal communities', role: 'Adapted Islamic institutions and overseas influences within Bantu-speaking urban societies.' }],
      keyTerms: [{ term: 'Swahili', explanation: 'A Bantu language and coastal culture shaped partly by long contact with Arabic-speaking and Muslim merchants.' }, { term: 'cultural synthesis', explanation: 'A new cultural pattern formed by combining selected elements from interacting traditions.' }],
      evidence: ['Swahili vocabulary incorporated Arabic terms while retaining Bantu grammatical foundations.', 'Coastal elites built mosques and participated in Islam while local languages, kinship, and regional practices continued.'],
      examConnection: 'Compare Swahili synthesis with Islam in Malacca to explain shared merchant influence and different local cultural outcomes.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.5' },
    },
    {
      id: 'apwh-u2-nanjing-treasure-fleet-technology-scale', locationNumber: '10', mainEventKey: 'world-event-10-3',
      title: 'Treasure-Fleet Technology and Scale', dateLabel: '1405–1433', startYear: 1405, endYear: 1433,
      summary: 'Ming shipbuilding, navigational knowledge, and state logistics supported fleets far larger than ordinary merchant voyages.',
      significance: 'The fleet demonstrates how accumulated maritime technology produced exceptional reach when combined with taxation, labor, and direct imperial sponsorship.',
      keyPeople: [{ name: 'Ming shipbuilders and sailors', role: 'Built, supplied, navigated, and maintained the ships used in state-sponsored Indian Ocean expeditions.' }],
      keyTerms: [{ term: 'treasure fleet', explanation: 'The large state-sponsored Ming fleets sent through the Indian Ocean under Zheng He.' }, { term: 'watertight compartment', explanation: 'An internal ship division that limited flooding and protected cargo if part of the hull was damaged.' }],
      evidence: ['The expeditions used hundreds of vessels and tens of thousands of personnel at their greatest scale.', 'Compasses, sternpost rudders, compartmentalized hulls, and extensive provisioning supported long-distance movement.'],
      examConnection: 'Use the treasure fleets to explain how technology becomes historically significant when a state mobilizes resources to apply it at scale.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7' },
    },
    {
      id: 'apwh-u2-nanjing-zheng-he-tributary-voyages', locationNumber: '10', mainEventKey: 'world-event-10-3',
      title: "Zheng He's Tributary Voyages", dateLabel: '1405–1433', startYear: 1405, endYear: 1433,
      summary: 'Zheng He led seven Ming expeditions that exchanged gifts, received envoys, and displayed imperial power across the Indian Ocean.',
      significance: 'The voyages intensified diplomatic and commercial contact without creating a territorial maritime empire like later European ventures.',
      keyPeople: [{ name: 'Zheng He', role: 'A Muslim eunuch admiral who commanded seven Ming voyages to Southeast Asia, South Asia, Arabia, and East Africa.' }],
      keyTerms: [{ term: 'tribute system', explanation: 'A diplomatic framework in which foreign envoys offered gifts and received recognition and valuable returns from the Chinese court.' }, { term: 'maritime diplomacy', explanation: 'The use of naval travel, gifts, envoys, and displays of force to manage relationships across the sea.' }],
      evidence: ['Seven voyages reached ports in Southeast Asia, South Asia, Arabia, and the East African coast.', 'The fleets transported envoys and prestige goods and returned with tribute, including unfamiliar animals such as giraffes.'],
      examConnection: 'Compare Zheng He with Mansa Musa as examples of rulers using long-distance movement and wealth to increase prestige without pursuing identical goals.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.5' },
    },
    {
      id: 'apwh-u2-nanjing-ming-maritime-retrenchment', locationNumber: '10', mainEventKey: 'world-event-10-3',
      title: 'Ming Maritime Retrenchment', dateLabel: '1433–1450', startYear: 1433, endYear: 1450,
      summary: 'After the final voyage, Ming rulers ended the treasure-fleet program and redirected resources toward domestic and northern priorities.',
      significance: 'Retrenchment shows that network participation depended on political choices: commercial demand continued even when direct state sponsorship declined.',
      keyPeople: [{ name: 'Ming court officials', role: 'Debated the cost and social value of maritime expeditions and supported policies that limited state-sponsored sailing.' }],
      keyTerms: [{ term: 'maritime retrenchment', explanation: 'A deliberate reduction in state-sponsored overseas activity and naval investment.' }, { term: 'Confucian bureaucracy', explanation: 'The scholar-official administration whose priorities often emphasized agrarian order and restrained imperial expenditure.' }],
      evidence: ['No new treasure-fleet expedition followed the seventh voyage ending in 1433.', 'Court critics questioned the expense and value of the voyages while the state concentrated resources elsewhere.'],
      examConnection: 'Use Ming retrenchment for continuity and change: private demand and Indian Ocean exchange continued, but the Chinese state changed its level of support.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7' },
    },
    {
      id: 'apwh-u2-cairo-trans-saharan-gold-camel-caravans', locationNumber: '84', mainEventKey: 'world-event-84-0',
      title: 'Trans-Saharan Gold and Camel-Caravan Trade', dateLabel: '1200–1450', startYear: 1200, endYear: 1450,
      summary: 'Camel caravans connected West African gold producers and states with North African markets, including the commercial world represented by Cairo.',
      significance: 'Transport technology and organized caravans made desert exchange profitable and linked Mali to wider Islamic and Mediterranean demand without making Cairo the route origin.',
      keyPeople: [{ name: 'Berber and Muslim caravan merchants', role: 'Organized camel transport, commercial trust, and exchange between West Africa and North African markets.' }],
      keyTerms: [{ term: 'camel saddle', explanation: 'Equipment adapted to pack or riding camels that increased useful loads and control in desert travel.' }, { term: 'trans-Saharan trade', explanation: 'Caravan exchange connecting West Africa with North Africa across the Sahara.' }],
      evidence: ['Caravans moved West African gold northward and carried salt, textiles, horses, and other goods southward.', 'Camel transport and coordinated stopping points allowed merchants to cross long arid distances with bulk goods.'],
      examConnection: 'Compare trans-Saharan caravans with Indian Ocean shipping by explaining how different environments required different transport solutions for network growth.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.4 and 2.7' },
    },
    {
      id: 'apwh-u2-cairo-mansa-musa-gold-shock', locationNumber: '84', mainEventKey: 'world-event-84-0',
      title: "Mansa Musa's Gold Shock", dateLabel: '1324', startYear: 1324, endYear: 1324,
      summary: "Mansa Musa distributed large quantities of gold in Cairo during his hajj, making Mali's wealth visible far beyond West Africa.",
      significance: 'The episode demonstrates how a trans-Saharan network carried wealth, reputation, religious affiliation, and economic effects between distant regions.',
      keyPeople: [{ name: 'Mansa Musa', role: 'The Mali ruler whose 1324 pilgrimage displayed gold wealth and strengthened connections with the wider Islamic world.' }],
      keyTerms: [{ term: 'hajj', explanation: 'The pilgrimage to Mecca required of Muslims who are able to undertake it.' }, { term: 'gold shock', explanation: 'A sudden increase in available gold that lowers its local value relative to goods and other money.' }],
      evidence: ['Mansa Musa traveled through Cairo with a large entourage and distributed gold during the journey.', 'Contemporary and later accounts associated his spending with a prolonged decline in the local value of gold.'],
      examConnection: 'Use the Cairo episode to contextualize Mali inside Islamic and Mediterranean exchange rather than presenting West Africa as isolated.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.4 and 2.5' },
    },
    {
      id: 'apwh-u2-cairo-black-death-demographic-change', locationNumber: '84', mainEventKey: 'world-event-84-0',
      title: 'Black Death and Demographic Change', dateLabel: '1347–1351', startYear: 1347, endYear: 1351,
      summary: 'Plague traveled through commercial and military connections and caused severe mortality in Egypt and other densely connected regions.',
      significance: 'The pandemic reveals the biological cost of connectivity and changed labor supply, settlement, production, and state revenue across affected societies.',
      keyPeople: [{ name: 'Ibn Khaldun', role: 'A North African scholar who described plague-era population loss and its effects on cities, institutions, and political power.' }],
      keyTerms: [{ term: 'Black Death', explanation: 'The fourteenth-century plague pandemic that spread across much of Afro-Eurasia.' }, { term: 'demographic change', explanation: 'A major shift in population size, distribution, mortality, or age structure.' }],
      evidence: ['Plague reached Egypt through the connected Mediterranean and Red Sea commercial world during the late 1340s.', 'Mass mortality reduced the number of workers and taxpayers and disrupted production and urban life.'],
      examConnection: 'Use plague to explain an environmental consequence of exchange and trace the mechanism from network density to transmission and demographic change.',
      source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topic 2.6' },
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
      id: 'apwh-u2-context-networks-ready-to-expand', kind: 'context', role: 'Unit 2 Context Card',
      title: 'Networks Ready to Expand',
      summary: 'By c. 1200, expanding states, commercial cities, and accumulated transport technologies had created the demand and infrastructure for long-distance exchange.',
      examSkills: ['Contextualization', 'Causation'],
      prompt: 'As you study Unit 2, identify which conditions already existed by 1200 and which new political or commercial changes made exchange grow.',
      takeaways: [
        'Unit 1 states generated agricultural surpluses, commercial cities, and specialized goods sought beyond local markets.',
        'Caravan routes and monsoon seas already linked regions, but distance, insecurity, and payment remained expensive.',
        'Merchant communities and shared legal or religious practices made exchange with strangers more predictable.',
      ],
    },
    {
      id: 'apwh-u2-synthesis-network-expansion-consequences', kind: 'synthesis', role: 'Unit 2 Synthesis Card',
      title: 'Why Networks Expanded—and What They Carried',
      summary: 'From 1200 to 1450, lower transport, payment, and protection costs expanded exchange, while the same networks moved beliefs, technologies, crops, and pathogens.',
      examSkills: ['Comparison', 'CCOT'],
      prompt: 'Compare at least two networks: which mechanisms produced growth in both, and which consequences depended on geography or political control?',
      takeaways: [
        'Mongol protection and commercial instruments reduced risk across land routes.',
        'Monsoon knowledge, larger ships, and port states increased the volume and predictability of maritime exchange.',
        'Greater connectivity produced cultural synthesis and economic growth, but also disease transmission and environmental strain.',
      ],
    },
  ];

  function describeRuleValue(value) { return value === '' ? '""' : String(value); }
  function isEnglishString(value) {
    return typeof value === 'string' && value.trim().length > 0
      && /[A-Za-z]/.test(value) && !/[㐀-鿿]/.test(value);
  }
  const failRecord = (record, rule) => {
    throw new Error(`Invalid Unit 2 study record ${record?.id || '(missing ID)'}: ${rule}`);
  };
  const failCard = (card, rule) => {
    throw new Error(`Invalid Unit 2 unit card ${card?.kind || '(missing kind)'} ${card?.id || '(missing ID)'}: ${rule}`);
  };

  function validateValues(record, values, validValues, field, singular) {
    if (!Array.isArray(values) || !values.length) failRecord(record, `missing ${field}`);
    for (const value of values) {
      if (!validValues.has(value)) failRecord(record, `invalid ${singular} ${describeRuleValue(value)}`);
      if (values.indexOf(value) !== values.lastIndexOf(value)) failRecord(record, `duplicate ${singular} ${describeRuleValue(value)}`);
    }
  }

  function validateRawRecords() {
    const expectedLocationNumbers = ['2', '8', '9', '10', '84', '85'];
    if (Object.keys(LOCATIONS).join(',') !== expectedLocationNumbers.join(',')) {
      throw new Error('Invalid Unit 2 study locations: expected exactly 2,8,9,10,84,85');
    }
    for (const [number, name] of Object.entries(LOCATIONS)) {
      if (!isEnglishString(name)) {
        throw new Error(`Invalid Unit 2 study location ${number}: missing English location name`);
      }
    }
    if (RAW_RECORDS.length > 18) failRecord(RAW_RECORDS[18], 'expected exactly 18 records');
    if (RAW_RECORDS.length < 18) failRecord({ id: '(missing record)' }, 'expected exactly 18 records');
    const ids = new Set();
    for (const record of RAW_RECORDS) {
      if (!/^apwh-u2-(karakorum|samarkand|malacca|kilwa|cairo|nanjing)-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id)) {
        failRecord(record, `invalid stable ID ${describeRuleValue(record.id)}`);
      }
      if (ids.has(record.id)) failRecord(record, 'duplicate record ID');
      ids.add(record.id);
      const context = STUDY_CONTEXT[record.id];
      if (!context) failRecord(record, 'not present in manifest');
      if (!Object.prototype.hasOwnProperty.call(LOCATIONS, record.locationNumber)) failRecord(record, `invalid locationNumber ${record.locationNumber}`);
      if (record.locationNumber !== context.locationNumber) failRecord(record, `invalid locationNumber ${record.locationNumber}`);
      if (!VALID_MAIN_EVENTS.has(record.mainEventKey) || record.mainEventKey !== context.mainEventKey) failRecord(record, `invalid mainEventKey ${record.mainEventKey}`);
      for (const field of ['title', 'summary', 'significance', 'examConnection']) {
        if (typeof record[field] !== 'string' || !record[field].trim()) failRecord(record, `missing ${field}`);
        if (!isEnglishString(record[field])) failRecord(record, `non-English ${field}`);
      }
      if (typeof record.dateLabel !== 'string' || !record.dateLabel.trim()) failRecord(record, 'missing dateLabel');
      if (!/^(?:c\. )?\d{3,4}(?:–(?:c\. )?\d{3,4})?$/.test(record.dateLabel)) {
        failRecord(record, `invalid dateLabel ${describeRuleValue(record.dateLabel)}`);
      }
      if (!Number.isInteger(record.startYear)) failRecord(record, 'startYear must be an integer');
      if (!Number.isInteger(record.endYear)) failRecord(record, 'endYear must be an integer');
      if (record.startYear > record.endYear) {
        failRecord(record, `startYear ${record.startYear} exceeds endYear ${record.endYear}`);
      }
      if (record.title !== context.title || record.dateLabel !== context.dateLabel
        || record.startYear !== context.startYear || record.endYear !== context.endYear) {
        failRecord(record, 'manifest metadata mismatch');
      }
      if (record.significance.length < 60) failRecord(record, 'significance is too short');
      if (record.examConnection.length < 60) failRecord(record, 'examConnection is too short');
      if (!Array.isArray(record.keyPeople) || record.keyPeople.length < 1) failRecord(record, 'missing keyPeople');
      if (!Array.isArray(record.keyTerms) || record.keyTerms.length < 2) failRecord(record, 'missing keyTerms');
      if (!Array.isArray(record.evidence) || record.evidence.length < 2) failRecord(record, 'missing evidence');
      if (!record.source || typeof record.source !== 'object' || Array.isArray(record.source)) {
        failRecord(record, 'invalid source structure');
      }
      if (!record.source.id) failRecord(record, 'missing source id');
      if (!record.source.locator) failRecord(record, 'missing source locator');
      if (Object.keys(record.source).sort().join(',') !== 'id,locator') {
        failRecord(record, 'source must contain exactly id and locator fields');
      }
      if (record.source.id !== 'amsco-apwh-u2') failRecord(record, `invalid source id ${record.source.id}`);
      const nested = [...record.keyPeople.flatMap(Object.values), ...record.keyTerms.flatMap(Object.values), ...record.evidence, record.source.id, record.source.locator];
      if (nested.some(value => typeof value !== 'string' || !value.trim())) failRecord(record, 'missing nested learner content');
      if (nested.some(value => !isEnglishString(value))) failRecord(record, 'non-English nested learner content');
      validateValues(record, context.topicCodes, VALID_TOPIC_CODES, 'topicCodes', 'topicCode');
      validateValues(record, context.themeIds, VALID_THEME_IDS, 'themeIds', 'themeId');
      validateValues(record, context.examSkills, VALID_EXAM_SKILLS, 'examSkills', 'examSkill');
      const topics = context.topicCodes;
      const topicLabel = topics.length === 1
        ? `Topic ${topics[0]}`
        : `Topics ${topics.slice(0, -1).join(', ')}${topics.length > 2 ? ',' : ''} and ${topics.at(-1)}`;
      const expectedLocator = `AMSCO AP World History, Unit 2, ${topicLabel}`;
      if (record.source.locator !== expectedLocator) failRecord(record, `invalid source locator ${record.source.locator}`);
      if (context.examSkills.length > 2) failRecord(record, 'too many examSkills');
      if (![1, 2, 3].includes(context.sequence)) failRecord(record, `invalid sequence ${context.sequence}`);
    }
    for (const [id] of STUDY_MANIFEST) if (!ids.has(id)) failRecord({ id }, 'missing raw record');
    for (const locationNumber of Object.keys(LOCATIONS)) {
      const records = RAW_RECORDS.filter(record => record.locationNumber === locationNumber);
      if (records.length !== 3) {
        const offender = records[3] || records[0] || { id: `(location ${locationNumber})` };
        failRecord(offender, `location ${locationNumber} must contain exactly three records`);
      }
      const sequences = records.map(record => STUDY_CONTEXT[record.id].sequence);
      if (new Set(sequences).size !== sequences.length) {
        const duplicate = sequences.find((value, index) => sequences.indexOf(value) !== index);
        const offender = records.find(record => STUDY_CONTEXT[record.id].sequence === duplicate);
        failRecord(offender, `duplicate sequence ${duplicate} at location ${locationNumber}`);
      }
      if ([...sequences].sort().join(',') !== '1,2,3') failRecord(records[0], `location ${locationNumber} must use sequences 1,2,3`);
    }
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
    const categoryReciprocals = { causeStudyPointIds: 'effectStudyPointIds', effectStudyPointIds: 'causeStudyPointIds', relatedStudyPointIds: 'relatedStudyPointIds' };
    for (const record of STUDY_EVENTS) {
      const keys = Object.keys(categoryReciprocals);
      const linked = [];
      const categories = new Map();
      for (const key of keys) {
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
          if (!/[A-Za-z]/.test(note) || /[㐀-鿿]/.test(note)) failRecord(record, `non-English connection note for ${targetId}`);
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
    const seenKinds = new Set();
    const seenIds = new Set();
    for (const card of UNIT_CARD_LIST) {
      if (!['context', 'synthesis'].includes(card.kind)) failCard(card, `invalid kind ${describeRuleValue(card.kind)}`);
      if (seenKinds.has(card.kind)) failCard(card, `duplicate kind ${card.kind}`);
      seenKinds.add(card.kind);
      if (seenIds.has(card.id)) failCard(card, 'duplicate card ID');
      seenIds.add(card.id);
      if (!/^apwh-u2-(context|synthesis)-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(card.id)) failCard(card, 'invalid stable ID');
      for (const field of ['role', 'title', 'summary', 'prompt']) {
        if (typeof card[field] !== 'string' || !card[field].trim()) failCard(card, `missing ${field}`);
        if (!isEnglishString(card[field])) failCard(card, `non-English ${field}`);
      }
      if (!Array.isArray(card.examSkills)) failCard(card, 'examSkills must be an array');
      if (card.examSkills.length < 1) failCard(card, 'missing examSkills');
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
        if (!isEnglishString(takeaway)) failCard(card, 'non-English takeaway');
      }
    }
    if (UNIT_CARD_LIST.length !== 2 || !seenKinds.has('context') || !seenKinds.has('synthesis')) {
      throw new Error('Invalid Unit 2 unit cards: expected exactly context and synthesis');
    }
  }

  validateUnitCards();
  const UNIT_CARDS = Object.freeze(Object.fromEntries(
    UNIT_CARD_LIST.map(card => [card.kind, freezeUnitCard(card)]),
  ));

  function compareRecords(a, b) {
    return a.startYear - b.startYear
      || a.endYear - b.endYear
      || a.sequence - b.sequence
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

  Object.defineProperty(root, 'APWH_U2_LOCATION_STUDY', {
    configurable: false,
    enumerable: true,
    writable: false,
    value: api,
  });
})(globalThis);
