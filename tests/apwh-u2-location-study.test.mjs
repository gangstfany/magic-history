import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

await import('../data/apwh-u2-location-study.js');

const api = globalThis.APWH_U2_LOCATION_STUDY;
const dataModuleSource = readFileSync(new URL('../data/apwh-u2-location-study.js', import.meta.url), 'utf8');
const ledgerSource = readFileSync(new URL('../docs/data-sources/apwh-u2-location-study-source-ledger.md', import.meta.url), 'utf8');
const replaceDataSource = (label, search, replacement) => {
  const malformedSource = dataModuleSource.replace(search, replacement);
  assert.notEqual(malformedSource, dataModuleSource, `${label} fixture mutation`);
  return malformedSource;
};
const replaceDataSources = (label, replacements) => {
  let malformedSource = dataModuleSource;
  for (const [search, replacement] of replacements) {
    const nextSource = malformedSource.replace(search, replacement);
    assert.notEqual(nextSource, malformedSource, `${label} fixture mutation for ${search}`);
    malformedSource = nextSource;
  }
  return malformedSource;
};
const replaceAllDataSource = (label, search, replacement) => {
  const malformedSource = dataModuleSource.replaceAll(search, replacement);
  assert.notEqual(malformedSource, dataModuleSource, `${label} fixture mutation`);
  return malformedSource;
};
const parseLedgerRows = source => source.split('\n')
  .filter(line => /^\| `apwh-u2-/.test(line))
  .map(line => line.split('|').slice(1, -1)
    .map(cell => cell.trim().replace(/^`|`$/g, '')));
const assertDataModuleError = (label, malformedSource, expectedMessage) => {
  assert.throws(() => runInNewContext(malformedSource, {}), error => {
    assert.equal(error.message, expectedMessage, `${label} diagnostic`);
    return true;
  });
};

const expectedManifest = [
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

const recordKeys = [
  'causeStudyPointIds', 'connectionNotes', 'dateLabel', 'effectStudyPointIds', 'endYear',
  'evidence', 'examConnection', 'examSkills', 'id', 'keyPeople', 'keyTerms', 'locationNumber',
  'mainEventKey', 'relatedStudyPointIds', 'sequence', 'significance', 'source', 'startYear',
  'summary', 'themeIds', 'title', 'topicCodes',
];

const expectedUnitCards = {
  context: {
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
  synthesis: {
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
};

const expectedCausalEdges = new Map([
  ['apwh-u2-karakorum-mongol-unification-conquest->apwh-u2-karakorum-pax-mongolica-protected-trade', 'Mongol conquest brought previously divided routes under related authorities that could protect merchants and punish raiders.'],
  ['apwh-u2-karakorum-pax-mongolica-protected-trade->apwh-u2-karakorum-yam-relay-cross-cultural-transfer', 'Protected routes and relay stations accelerated the movement of envoys, specialists, information, and technologies across Eurasia.'],
  ['apwh-u2-samarkand-caravanserai-merchant-infrastructure->apwh-u2-samarkand-timurid-commercial-learning-hub', 'Reliable lodging, storage, and market infrastructure helped Samarkand attract merchants and scholars from multiple regions.'],
  ['apwh-u2-samarkand-bills-exchange-banking-houses->apwh-u2-samarkand-timurid-commercial-learning-hub', 'Credit instruments reduced the need to carry coin and supported the commercial traffic that sustained a cosmopolitan center.'],
  ['apwh-u2-malacca-monsoon-navigation-maritime-technology->apwh-u2-malacca-strategic-port-state', 'Predictable monsoon sailing and improved ships concentrated recurring traffic at the Strait of Malacca.'],
  ['apwh-u2-malacca-strategic-port-state->apwh-u2-malacca-merchant-diasporas-spread-islam', 'A protected and heavily visited port encouraged foreign merchants to reside, marry, and establish religious communities.'],
  ['apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce->apwh-u2-kilwa-gold-ivory-regional-specialization', 'Demand from Indian Ocean merchants rewarded coastal access to inland gold, ivory, and other specialized exports.'],
  ['apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce->apwh-u2-kilwa-swahili-cultural-synthesis', 'Long-term commercial contact joined Bantu-speaking coastal societies with Islamic and Arabic cultural influences.'],
  ['apwh-u2-cairo-trans-saharan-gold-camel-caravans->apwh-u2-cairo-mansa-musa-gold-shock', "Trans-Saharan commerce made Mali's gold wealth visible in Cairo and supplied the resources displayed during Mansa Musa's pilgrimage."],
  ['apwh-u2-karakorum-pax-mongolica-protected-trade->apwh-u2-cairo-black-death-demographic-change', 'Denser and safer Eurasian movement also allowed plague-bearing hosts and vectors to travel farther through connected routes.'],
  ['apwh-u2-nanjing-treasure-fleet-technology-scale->apwh-u2-nanjing-zheng-he-tributary-voyages', 'Large ships, navigational knowledge, and state resources made seven long-distance expeditions possible.'],
  ['apwh-u2-nanjing-zheng-he-tributary-voyages->apwh-u2-nanjing-ming-maritime-retrenchment', 'The voyages demonstrated Ming reach but their cost and political purpose strengthened court arguments for ending them.'],
]);

const expectedRelatedPairs = new Map([
  ['apwh-u2-karakorum-yam-relay-cross-cultural-transfer|apwh-u2-samarkand-timurid-commercial-learning-hub', 'Both cases show that commercial routes also moved specialists and knowledge, although one was an imperial relay and the other an urban center.'],
  ['apwh-u2-malacca-monsoon-navigation-maritime-technology|apwh-u2-samarkand-bills-exchange-banking-houses', 'Maritime technology reduced transport uncertainty while financial instruments reduced payment risk; both lowered the cost of exchange.'],
  ['apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce|apwh-u2-malacca-strategic-port-state', 'Kilwa and Malacca both converted strategic access to maritime exchange into urban wealth and political power.'],
  ['apwh-u2-kilwa-swahili-cultural-synthesis|apwh-u2-malacca-merchant-diasporas-spread-islam', 'Resident Muslim merchants contributed to locally distinct forms of Islamic cultural change in Southeast Asia and the Swahili Coast.'],
  ['apwh-u2-cairo-mansa-musa-gold-shock|apwh-u2-nanjing-zheng-he-tributary-voyages', 'Mansa Musa and Zheng He used conspicuous long-distance movement to display state wealth and strengthen diplomatic or religious standing.'],
]);

const expectedRecordContent = [
  {"id":"apwh-u2-karakorum-mongol-unification-conquest","title":"Mongol Unification and Conquest","summary":"Temujin unified Mongol groups and used disciplined cavalry, mobility, and terror to build a conquest state across Eurasia.","significance":"Conquest brought previously divided land routes under related Mongol authorities and created the political conditions for faster trade and communication.","keyPeople":[{"name":"Genghis Khan","role":"Unified Mongol groups in 1206 and directed conquests that connected territories from northern China toward Central and Southwest Asia."}],"keyTerms":[{"term":"kurultai","explanation":"An assembly of Mongol leaders that selected a khan and affirmed major political decisions."},{"term":"decimal organization","explanation":"A military structure grouping warriors into units of tens, hundreds, thousands, and ten-thousands."}],"evidence":["A 1206 kurultai recognized Temujin as Genghis Khan after he defeated rival Mongol groups.","Mongol forces conquered the Khwarazmian realm and linked Central Asian routes to a rapidly expanding empire."],"examConnection":"Use Mongol unification as a political cause of expanded exchange, then explain the protection mechanism instead of treating conquest and trade as a simple sequence.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.2 and 2.7"}},
  {"id":"apwh-u2-karakorum-pax-mongolica-protected-trade","title":"Pax Mongolica and Protected Trade","summary":"Mongol authorities repaired routes, punished raiders, and protected merchants across a large portion of Eurasia.","significance":"Lower protection costs allowed more merchants, envoys, and travelers to use overland routes and helped create a new high point in Silk Roads exchange.","keyPeople":[{"name":"Mongol khans","role":"Governed related khanates that protected routes, enforced laws, and supported movement across imperial boundaries."}],"keyTerms":[{"term":"Pax Mongolica","explanation":"The period of relative security and connectivity across Mongol-ruled Eurasia."},{"term":"protection cost","explanation":"The risk and expense merchants face from robbery, war, tolls, and uncertain enforcement."}],"evidence":["Mongol rulers repaired roads and used soldiers to protect commercial routes from raiders.","Merchants could cross territories governed by related Mongol states with more predictable rules and lower risk."],"examConnection":"Use the Pax Mongolica to explain how political control caused trade growth by reducing risk, not merely by placing more territory under one empire.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.1, 2.2, and 2.7"}},
  {"id":"apwh-u2-karakorum-yam-relay-cross-cultural-transfer","title":"The Yam Relay and Cross-Cultural Transfer","summary":"Relay stations and protected movement carried official messages, specialists, technologies, and knowledge across Mongol Eurasia.","significance":"The same infrastructure used for imperial control accelerated cultural and technological transfer among China, Central Asia, the Islamic world, and Europe.","keyPeople":[{"name":"Mongol relay riders","role":"Moved messages and official travelers between staffed stations across long imperial distances."}],"keyTerms":[{"term":"yam","explanation":"The Mongol imperial relay network of stations, fresh horses, supplies, and authorized travelers."},{"term":"technology transfer","explanation":"The movement and adaptation of technical knowledge between societies."}],"evidence":["Relay stations provided fresh horses and supplies so official messages could move rapidly across the empire.","Paper, gunpowder knowledge, medical learning, and skilled workers traveled through intensified Eurasian contacts."],"examConnection":"Use the yam to show that empire affected more than commerce: administrative infrastructure also changed the speed of cultural and technological exchange.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.2 and 2.5"}},
  {"id":"apwh-u2-samarkand-caravanserai-merchant-infrastructure","title":"Caravanserai and Merchant Infrastructure","summary":"Caravanserai gave merchants recurring places to rest animals, store goods, obtain information, and conduct exchange along overland routes.","significance":"A chain of predictable service nodes reduced the logistical cost of long journeys and made cities such as Samarkand more useful to interregional merchants.","keyPeople":[{"name":"caravan merchants","role":"Organized animals, guards, credit, and goods for long-distance movement between commercial cities."}],"keyTerms":[{"term":"caravanserai","explanation":"A fortified roadside lodging and commercial station serving merchants and pack animals."},{"term":"caravan","explanation":"A group of travelers and pack animals moving together for security and logistical support."}],"evidence":["Caravanserai supplied lodging, water, storage, and market space at recurring points along major routes.","Improved camel saddles allowed pack animals to carry heavier loads across arid terrain."],"examConnection":"Use caravanserai as evidence that infrastructure caused network growth by lowering recurring transport and information costs for merchants.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.1 and 2.7"}},
  {"id":"apwh-u2-samarkand-bills-exchange-banking-houses","title":"Bills of Exchange and Banking Houses","summary":"Credit instruments allowed merchants to transfer value without carrying the full payment in heavy coin across dangerous routes.","significance":"Bills of exchange and banking houses reduced theft risk and connected commercial practices developed in Asia with expanding financial institutions farther west.","keyPeople":[{"name":"merchant-bankers","role":"Accepted deposits, verified written claims, extended credit, and converted commercial promises into payment."}],"keyTerms":[{"term":"bill of exchange","explanation":"A written order or promise to pay a specified person a specified amount at an agreed time."},{"term":"banking house","explanation":"A commercial institution that accepted deposits, exchanged currencies, and provided credit or payment services."}],"evidence":["Merchants could deposit value in one place and use written instruments to obtain payment elsewhere.","Banking houses expanded in European commercial cities during the 1300s as long-distance trade increased."],"examConnection":"Compare bills of exchange with maritime technology: both expanded trade, but one reduced payment risk while the other reduced transport uncertainty.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.1 and 2.7"}},
  {"id":"apwh-u2-samarkand-timurid-commercial-learning-hub","title":"Timurid Samarkand as a Commercial and Learning Hub","summary":"Timurid patronage made Samarkand a center where merchants, artisans, architects, and scholars from several regions met.","significance":"The city demonstrates continuity between commercial connectivity and knowledge exchange even as conquest changed the rulers controlling Central Asian routes.","keyPeople":[{"name":"Ulugh Beg","role":"A Timurid ruler and patron of astronomy and education who sponsored a major madrasa in Samarkand."}],"keyTerms":[{"term":"Timurid Empire","explanation":"The Central Asian state founded by Timur that controlled important overland routes and cities."},{"term":"madrasa","explanation":"An institution of advanced Islamic learning that could also support mathematics, astronomy, and law."}],"evidence":["Timur made Samarkand his capital and drew skilled workers and cultural resources toward the city.","The Ulugh Beg Madrasa, built in the early 1400s, linked political patronage with scholarly activity."],"examConnection":"Use Samarkand to explain continuity and change: conquest disrupted regions, yet rulers continued using trade cities to collect wealth and patronize learning.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.1 and 2.5"}},
  {"id":"apwh-u2-malacca-monsoon-navigation-maritime-technology","title":"Monsoon Navigation and Maritime Technology","summary":"Knowledge of monsoon winds and improved sails, rudders, compasses, and astrolabes made Indian Ocean travel more predictable.","significance":"Predictable seasons and better navigation allowed merchants to plan recurring voyages, carry heavier cargo, and connect distant ports at lower cost.","keyPeople":[{"name":"Indian Ocean sailors","role":"Combined seasonal wind knowledge with navigational instruments and ship designs suited to long-distance trade."}],"keyTerms":[{"term":"monsoon winds","explanation":"Seasonally reversing wind patterns that structured sailing schedules across the Indian Ocean."},{"term":"lateen sail","explanation":"A triangular sail that helped ships maneuver across changing wind directions."}],"evidence":["Sailors timed voyages around winds that blew from the northeast in one season and the southwest in another.","Compasses, astrolabes, sternpost rudders, and compartmentalized ships improved direction, control, and cargo security."],"examConnection":"Use monsoon knowledge and ship technology as causal evidence for Indian Ocean growth, then distinguish predictable timing from political protection.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.3 and 2.7"}},
  {"id":"apwh-u2-malacca-strategic-port-state","title":"Malacca as a Strategic Port State","summary":"Malacca used its position on a narrow maritime passage to tax ships, protect traffic, and become a major commercial entrepot.","significance":"The port converted predictable trade flows into public revenue and naval power, showing how states could grow from exchange rather than agricultural production.","keyPeople":[{"name":"Malaccan sultans","role":"Collected port revenue, protected the strait, and governed a commercial state serving merchants from many regions."}],"keyTerms":[{"term":"entrepot","explanation":"A port where merchants unload, store, exchange, and re-export goods from multiple regions."},{"term":"Strait of Malacca","explanation":"The narrow passage linking the Indian Ocean with the South China Sea and East Asian markets."}],"evidence":["Malacca charged ships using the strait and used revenue to support protection against piracy.","Its prosperity depended primarily on trade and services rather than farming, mining, or large-scale manufacturing."],"examConnection":"Compare Malacca with Kilwa to explain how strategic ports converted maritime traffic into political authority through different local institutions.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.3 and 2.7"}},
  {"id":"apwh-u2-malacca-merchant-diasporas-spread-islam","title":"Merchant Diasporas and the Spread of Islam","summary":"Muslim merchants who remained in Southeast Asian ports formed communities, married locally, and helped Islam gain influence without military conquest.","significance":"Diaspora settlement turned waiting time and commercial trust into long-term cultural change while local societies adapted Islam to existing traditions.","keyPeople":[{"name":"Muslim merchant communities","role":"Maintained commercial and religious ties while establishing households and institutions in Southeast Asian ports."}],"keyTerms":[{"term":"diaspora","explanation":"A community living away from its place of origin while preserving social, cultural, or commercial connections."},{"term":"syncretism","explanation":"The combination or adaptation of elements drawn from different cultural and religious traditions."}],"evidence":["Merchants often stayed in ports for months while waiting for monsoon winds and sometimes established permanent households.","Islam spread through commercial relationships, intermarriage, and local rulers rather than a single campaign of conquest."],"examConnection":"Use Malacca to explain how exchange caused cultural change, while noting that adoption remained selective and local traditions continued.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.3 and 2.5"}},
  {"id":"apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce","title":"Swahili City-States and Indian Ocean Commerce","summary":"Kilwa and other Swahili city-states connected East African producers with merchants from Arabia, Persia, India, and China.","significance":"Commercial access supported autonomous coastal cities whose rulers and merchants accumulated wealth without controlling a single territorial empire.","keyPeople":[{"name":"Swahili merchant elites","role":"Managed coastal trade, maintained overseas relationships, and sponsored urban construction and Islamic institutions."}],"keyTerms":[{"term":"city-state","explanation":"An independent political community centered on a city and its surrounding territory."},{"term":"Indian Ocean network","explanation":"The maritime exchange system connecting East Africa, Southwest Asia, South Asia, Southeast Asia, and East Asia."}],"evidence":["Kilwa exported African goods and imported Indian textiles, Chinese ceramics, and products from Southwest Asia.","Commercial wealth supported coral-stone houses and mosques in coastal cities."],"examConnection":"Compare Swahili city-states with Malacca to show how maritime exchange supported different forms of port-based political power.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.3 and 2.7"}},
  {"id":"apwh-u2-kilwa-gold-ivory-regional-specialization","title":"Gold, Ivory, and Regional Specialization","summary":"Kilwa linked inland supplies of gold and ivory to overseas demand and exchanged them for manufactured and luxury goods.","significance":"Long-distance demand encouraged regions to specialize in goods they could supply competitively and tied coastal prosperity to inland production and transport.","keyPeople":[{"name":"East African traders","role":"Moved inland commodities toward coastal markets and distributed imported goods back through regional networks."}],"keyTerms":[{"term":"regional specialization","explanation":"The concentration of production in goods a region can supply effectively for exchange."},{"term":"hinterland","explanation":"The inland zone connected economically to a port through production, transport, and markets."}],"evidence":["Gold from the Great Zimbabwe region moved through ports such as Sofala and into the wider coastal trade served by Kilwa.","Ivory and other African exports were exchanged for textiles, ceramics, metal goods, and luxury products."],"examConnection":"Use Kilwa to explain how expanding networks changed production by rewarding regional specialization and linking inland economies to maritime demand.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.3 and 2.7"}},
  {"id":"apwh-u2-kilwa-swahili-cultural-synthesis","title":"Swahili Cultural Synthesis","summary":"Coastal East Africans combined Bantu linguistic and social foundations with Islamic belief and vocabulary associated with overseas contact.","significance":"Swahili culture shows that network expansion produced locally distinct synthesis rather than replacing African identities with a uniform imported culture.","keyPeople":[{"name":"Swahili coastal communities","role":"Adapted Islamic institutions and overseas influences within Bantu-speaking urban societies."}],"keyTerms":[{"term":"Swahili","explanation":"A Bantu language and coastal culture shaped partly by long contact with Arabic-speaking and Muslim merchants."},{"term":"cultural synthesis","explanation":"A new cultural pattern formed by combining selected elements from interacting traditions."}],"evidence":["Swahili vocabulary incorporated Arabic terms while retaining Bantu grammatical foundations.","Coastal elites built mosques and participated in Islam while local languages, kinship, and regional practices continued."],"examConnection":"Compare Swahili synthesis with Islam in Malacca to explain shared merchant influence and different local cultural outcomes.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.3 and 2.5"}},
  {"id":"apwh-u2-cairo-trans-saharan-gold-camel-caravans","title":"Trans-Saharan Gold and Camel-Caravan Trade","summary":"Camel caravans connected West African gold producers and states with North African markets, including the commercial world represented by Cairo.","significance":"Transport technology and organized caravans made desert exchange profitable and linked Mali to wider Islamic and Mediterranean demand without making Cairo the route origin.","keyPeople":[{"name":"Berber and Muslim caravan merchants","role":"Organized camel transport, commercial trust, and exchange between West Africa and North African markets."}],"keyTerms":[{"term":"camel saddle","explanation":"Equipment adapted to pack or riding camels that increased useful loads and control in desert travel."},{"term":"trans-Saharan trade","explanation":"Caravan exchange connecting West Africa with North Africa across the Sahara."}],"evidence":["Caravans moved West African gold northward and carried salt, textiles, horses, and other goods southward.","Camel transport and coordinated stopping points allowed merchants to cross long arid distances with bulk goods."],"examConnection":"Compare trans-Saharan caravans with Indian Ocean shipping by explaining how different environments required different transport solutions for network growth.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.4 and 2.7"}},
  {"id":"apwh-u2-cairo-mansa-musa-gold-shock","title":"Mansa Musa's Gold Shock","summary":"Mansa Musa distributed large quantities of gold in Cairo during his hajj, making Mali's wealth visible far beyond West Africa.","significance":"The episode demonstrates how a trans-Saharan network carried wealth, reputation, religious affiliation, and economic effects between distant regions.","keyPeople":[{"name":"Mansa Musa","role":"The Mali ruler whose 1324 pilgrimage displayed gold wealth and strengthened connections with the wider Islamic world."}],"keyTerms":[{"term":"hajj","explanation":"The pilgrimage to Mecca required of Muslims who are able to undertake it."},{"term":"gold shock","explanation":"A sudden increase in available gold that lowers its local value relative to goods and other money."}],"evidence":["Mansa Musa traveled through Cairo with a large entourage and distributed gold during the journey.","Contemporary and later accounts associated his spending with a prolonged decline in the local value of gold."],"examConnection":"Use the Cairo episode to contextualize Mali inside Islamic and Mediterranean exchange rather than presenting West Africa as isolated.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.4 and 2.5"}},
  {"id":"apwh-u2-cairo-black-death-demographic-change","title":"Black Death and Demographic Change","summary":"Plague traveled through commercial and military connections and caused severe mortality in Egypt and other densely connected regions.","significance":"The pandemic reveals the biological cost of connectivity and changed labor supply, settlement, production, and state revenue across affected societies.","keyPeople":[{"name":"Ibn Khaldun","role":"A North African scholar who described plague-era population loss and its effects on cities, institutions, and political power."}],"keyTerms":[{"term":"Black Death","explanation":"The fourteenth-century plague pandemic that spread across much of Afro-Eurasia."},{"term":"demographic change","explanation":"A major shift in population size, distribution, mortality, or age structure."}],"evidence":["Plague reached Egypt through the connected Mediterranean and Red Sea commercial world during the late 1340s.","Mass mortality reduced the number of workers and taxpayers and disrupted production and urban life."],"examConnection":"Use plague to explain an environmental consequence of exchange and trace the mechanism from network density to transmission and demographic change.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topic 2.6"}},
  {"id":"apwh-u2-nanjing-treasure-fleet-technology-scale","title":"Treasure-Fleet Technology and Scale","summary":"Ming shipbuilding, navigational knowledge, and state logistics supported fleets far larger than ordinary merchant voyages.","significance":"The fleet demonstrates how accumulated maritime technology produced exceptional reach when combined with taxation, labor, and direct imperial sponsorship.","keyPeople":[{"name":"Ming shipbuilders and sailors","role":"Built, supplied, navigated, and maintained the ships used in state-sponsored Indian Ocean expeditions."}],"keyTerms":[{"term":"treasure fleet","explanation":"The large state-sponsored Ming fleets sent through the Indian Ocean under Zheng He."},{"term":"watertight compartment","explanation":"An internal ship division that limited flooding and protected cargo if part of the hull was damaged."}],"evidence":["The expeditions used hundreds of vessels and tens of thousands of personnel at their greatest scale.","Compasses, sternpost rudders, compartmentalized hulls, and extensive provisioning supported long-distance movement."],"examConnection":"Use the treasure fleets to explain how technology becomes historically significant when a state mobilizes resources to apply it at scale.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.3 and 2.7"}},
  {"id":"apwh-u2-nanjing-zheng-he-tributary-voyages","title":"Zheng He's Tributary Voyages","summary":"Zheng He led seven Ming expeditions that exchanged gifts, received envoys, and displayed imperial power across the Indian Ocean.","significance":"The voyages intensified diplomatic and commercial contact without creating a territorial maritime empire like later European ventures.","keyPeople":[{"name":"Zheng He","role":"A Muslim eunuch admiral who commanded seven Ming voyages to Southeast Asia, South Asia, Arabia, and East Africa."}],"keyTerms":[{"term":"tribute system","explanation":"A diplomatic framework in which foreign envoys offered gifts and received recognition and valuable returns from the Chinese court."},{"term":"maritime diplomacy","explanation":"The use of naval travel, gifts, envoys, and displays of force to manage relationships across the sea."}],"evidence":["Seven voyages reached ports in Southeast Asia, South Asia, Arabia, and the East African coast.","The fleets transported envoys and prestige goods and returned with tribute, including unfamiliar animals such as giraffes."],"examConnection":"Compare Zheng He with Mansa Musa as examples of rulers using long-distance movement and wealth to increase prestige without pursuing identical goals.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.3 and 2.5"}},
  {"id":"apwh-u2-nanjing-ming-maritime-retrenchment","title":"Ming Maritime Retrenchment","summary":"After the final voyage, Ming rulers ended the treasure-fleet program and redirected resources toward domestic and northern priorities.","significance":"Retrenchment shows that network participation depended on political choices: commercial demand continued even when direct state sponsorship declined.","keyPeople":[{"name":"Ming court officials","role":"Debated the cost and social value of maritime expeditions and supported policies that limited state-sponsored sailing."}],"keyTerms":[{"term":"maritime retrenchment","explanation":"A deliberate reduction in state-sponsored overseas activity and naval investment."},{"term":"Confucian bureaucracy","explanation":"The scholar-official administration whose priorities often emphasized agrarian order and restrained imperial expenditure."}],"evidence":["No new treasure-fleet expedition followed the seventh voyage ending in 1433.","Court critics questioned the expense and value of the voyages while the state concentrated resources elsewhere."],"examConnection":"Use Ming retrenchment for continuity and change: private demand and Indian Ocean exchange continued, but the Chinese state changed its level of support.","source":{"id":"amsco-apwh-u2","locator":"AMSCO AP World History, Unit 2, Topics 2.3 and 2.7"}},
];

const expectedLedgerRows = [
  ['apwh-u2-karakorum-mongol-unification-conquest', 'Topics 2.2 and 2.7', 'world-event-8-0', 'AMSCO AP World History, Unit 2, Topics 2.2 and 2.7', "Temujin's unification, conquest, cavalry organization, and the political consolidation of Eurasian routes"],
  ['apwh-u2-karakorum-pax-mongolica-protected-trade', 'Topics 2.1, 2.2, and 2.7', 'world-event-8-0', 'AMSCO AP World History, Unit 2, Topics 2.1, 2.2, and 2.7', 'Pax Mongolica, protected trade, law enforcement, roads, and reduced commercial risk'],
  ['apwh-u2-karakorum-yam-relay-cross-cultural-transfer', 'Topics 2.2 and 2.5', 'world-event-8-0', 'AMSCO AP World History, Unit 2, Topics 2.2 and 2.5', 'Relay stations, imperial communication, specialists, technologies, and cultural exchange'],
  ['apwh-u2-samarkand-caravanserai-merchant-infrastructure', 'Topics 2.1 and 2.7', 'world-event-9-0', 'AMSCO AP World History, Unit 2, Topics 2.1 and 2.7', 'Caravanserai, camel transport, storage, lodging, and Silk Roads infrastructure'],
  ['apwh-u2-samarkand-bills-exchange-banking-houses', 'Topics 2.1 and 2.7', 'world-event-9-0', 'AMSCO AP World History, Unit 2, Topics 2.1 and 2.7', 'Bills of exchange, flying cash, banking houses, credit, and reduced payment risk'],
  ['apwh-u2-samarkand-timurid-commercial-learning-hub', 'Topics 2.1 and 2.5', 'world-event-9-0', 'AMSCO AP World History, Unit 2, Topics 2.1 and 2.5', 'Timurid Samarkand, commerce, Ulugh Beg, madrasas, scholarship, and cultural exchange'],
  ['apwh-u2-malacca-monsoon-navigation-maritime-technology', 'Topics 2.3 and 2.7', 'world-event-2-1', 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7', 'Monsoon winds, lateen sails, compasses, astrolabes, and maritime predictability'],
  ['apwh-u2-malacca-strategic-port-state', 'Topics 2.3 and 2.7', 'world-event-2-1', 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7', 'Strait of Malacca, port fees, naval protection, entrepot trade, and port-state power'],
  ['apwh-u2-malacca-merchant-diasporas-spread-islam', 'Topics 2.3 and 2.5', 'world-event-2-1', 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.5', 'Merchant residence, intermarriage, diaspora communities, Islam, and local adaptation'],
  ['apwh-u2-kilwa-swahili-city-states-indian-ocean-commerce', 'Topics 2.3 and 2.7', 'world-event-85-0', 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7', 'Swahili city-states, Indian Ocean commerce, port wealth, imported goods, and coastal authority'],
  ['apwh-u2-kilwa-gold-ivory-regional-specialization', 'Topics 2.3 and 2.7', 'world-event-85-0', 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7', 'Gold and ivory exports, Great Zimbabwe and Sofala linkages, regional specialization, and exchange'],
  ['apwh-u2-kilwa-swahili-cultural-synthesis', 'Topics 2.3 and 2.5', 'world-event-85-0', 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.5', 'Swahili language, Bantu and Arabic influences, Islam, mosques, and cultural synthesis'],
  ['apwh-u2-cairo-trans-saharan-gold-camel-caravans', 'Topics 2.4 and 2.7', 'world-event-84-0', 'AMSCO AP World History, Unit 2, Topics 2.4 and 2.7', 'Camel caravans, saddle technology, gold, salt, textiles, horses, and North African markets'],
  ['apwh-u2-cairo-mansa-musa-gold-shock', 'Topics 2.4 and 2.5', 'world-event-84-0', 'AMSCO AP World History, Unit 2, Topics 2.4 and 2.5', "Mansa Musa's 1324 hajj, gold distribution in Cairo, Mali's wealth, Islam, and prestige"],
  ['apwh-u2-cairo-black-death-demographic-change', 'Topic 2.6', 'world-event-84-0', 'AMSCO AP World History, Unit 2, Topic 2.6', 'Plague transmission through exchange networks, mortality, labor scarcity, and demographic change'],
  ['apwh-u2-nanjing-treasure-fleet-technology-scale', 'Topics 2.3 and 2.7', 'world-event-10-3', 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7', 'Treasure-fleet scale, ship compartments, rudders, compasses, logistics, and state capacity'],
  ['apwh-u2-nanjing-zheng-he-tributary-voyages', 'Topics 2.3 and 2.5', 'world-event-10-3', 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.5', "Zheng He's seven voyages, tribute diplomacy, Indian Ocean destinations, and prestige goods"],
  ['apwh-u2-nanjing-ming-maritime-retrenchment', 'Topics 2.3 and 2.7', 'world-event-10-3', 'AMSCO AP World History, Unit 2, Topics 2.3 and 2.7', 'End of the voyages, court priorities, cost, maritime restrictions, and continuity of private exchange'],
];

test('publishes the exact Unit 2 location-study manifest', () => {
  assert.equal(api.unitId, 'u2');
  assert.equal(api.unitNumber, 2);
  assert.deepEqual([...api.locationNumbers], ['2', '8', '9', '10', '84', '85']);
  assert.equal(api.records.length, 18);
  for (const number of api.locationNumbers) assert.equal(api.getByLocation(number).length, 3, number);
  assert.deepEqual(api.records.map(record => [record.id, record.locationNumber, record.sequence,
    record.title, record.dateLabel, record.startYear, record.endYear, record.mainEventKey,
    [...record.topicCodes], [...record.themeIds], [...record.examSkills]]), expectedManifest);
  for (const record of api.records) assert.deepEqual(Object.keys(record).sort(), recordKeys);
});

test('locks the complete learner copy and source metadata for all eighteen records', () => {
  const contentKeys = [
    'id', 'title', 'summary', 'significance', 'keyPeople', 'keyTerms',
    'evidence', 'examConnection', 'source',
  ];
  assert.deepEqual(api.records.map(record => Object.fromEntries(
    contentKeys.map(key => [key, record[key]]),
  )), expectedRecordContent);
});

test('publishes exact immutable Unit 2 cards outside map records', () => {
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

test('ships rich English learner content and deeply immutable records', () => {
  for (const record of api.records) {
    assert.doesNotMatch(JSON.stringify(record), /[\u3400-\u9fff]/);
    assert.ok(record.significance.length >= 60);
    assert.ok(record.examConnection.length >= 60);
    assert.ok(record.keyPeople.length >= 1);
    assert.ok(record.keyTerms.length >= 2);
    assert.ok(record.evidence.length >= 2);
    assert.equal(new Set(record.examSkills).size, record.examSkills.length);
    assert.ok(record.examSkills.length >= 1 && record.examSkills.length <= 2);
    assert.ok(Object.isFrozen(record) && Object.isFrozen(record.keyPeople)
      && record.keyPeople.every(Object.isFrozen) && Object.isFrozen(record.keyTerms)
      && record.keyTerms.every(Object.isFrozen) && Object.isFrozen(record.evidence)
      && Object.isFrozen(record.source) && Object.isFrozen(record.topicCodes)
      && Object.isFrozen(record.themeIds) && Object.isFrozen(record.examSkills)
      && Object.isFrozen(record.causeStudyPointIds) && Object.isFrozen(record.effectStudyPointIds)
      && Object.isFrozen(record.relatedStudyPointIds) && Object.isFrozen(record.connectionNotes));
  }
});

test('publishes exact reciprocal causal and related graphs', () => {
  const causal = new Map();
  const related = new Map();
  for (const record of api.records) {
    for (const targetId of record.effectStudyPointIds) causal.set(`${record.id}->${targetId}`, record.connectionNotes[targetId]);
    for (const targetId of record.relatedStudyPointIds) related.set([record.id, targetId].sort().join('|'), record.connectionNotes[targetId]);
    assert.ok(record.causeStudyPointIds.length + record.effectStudyPointIds.length + record.relatedStudyPointIds.length >= 1);
  }
  assert.deepEqual(causal, expectedCausalEdges);
  assert.deepEqual(related, expectedRelatedPairs);
});

test('locks all five source-ledger columns for every Unit 2 record', () => {
  assert.deepEqual(parseLedgerRows(ledgerSource), expectedLedgerRows);
});

test('returns defensive location arrays, stable lookup identity, and a locked global', () => {
  for (const record of api.records) assert.equal(api.getById(record.id), record);
  const first = api.getByLocation('8');
  first.pop();
  assert.equal(api.getByLocation('8').length, 3);
  assert.equal(api.locationName('8'), 'Karakorum');
  assert.equal(api.locationName('toString'), null);
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'APWH_U2_LOCATION_STUDY');
  assert.equal(descriptor.writable, false);
  assert.equal(descriptor.configurable, false);
});

test('refuses to overwrite an existing Unit 2 browser global', () => {
  assert.throws(
    () => runInNewContext(dataModuleSource, { APWH_U2_LOCATION_STUDY: { existing: true } }),
    /Invalid Unit 2 global APWH_U2_LOCATION_STUDY: refusing to overwrite existing value/,
  );
});

test('comparator uses start, end, sequence, and id tie breakers', () => {
  const records = [
    { id: 'z', startYear: 1200, endYear: 1300, sequence: 2 },
    { id: 'a', startYear: 1200, endYear: 1300, sequence: 2 },
    { id: 'sequence', startYear: 1200, endYear: 1300, sequence: 1 },
    { id: 'end', startYear: 1200, endYear: 1201, sequence: 3 },
    { id: 'early', startYear: 1100, endYear: 1450, sequence: 3 },
  ];
  assert.deepEqual([...records].sort(api.compareRecords).map(record => record.id),
    ['early', 'end', 'sequence', 'a', 'z']);
});

const invalidFixtures = [
  ["locationNumber: '8'", "locationNumber: '999'", 'apwh-u2-karakorum-mongol-unification-conquest', 'invalid locationNumber 999'],
  ["'apwh-u2-karakorum-mongol-unification-conquest', '8', 1,", "'apwh-u2-karakorum-mongol-unification-conquest', '8', 4,", 'apwh-u2-karakorum-mongol-unification-conquest', 'invalid sequence 4'],
  ["['GOV'], ['Causation', 'CCOT']]", "['GOV'], ['Causation', 'Argumentation']]", 'apwh-u2-karakorum-mongol-unification-conquest', 'invalid examSkill Argumentation'],
  ["mainEventKey: 'world-event-8-0'", "mainEventKey: 'world-event-8-99'", 'apwh-u2-karakorum-mongol-unification-conquest', 'invalid mainEventKey world-event-8-99'],
];
for (const [search, replacement, id, rule] of invalidFixtures) {
  test(`rejects ${rule}`, () => assertDataModuleError(rule,
    replaceDataSource(rule, search, replacement), `Invalid Unit 2 study record ${id}: ${rule}`));
}

const mutationCases = [
  ['missing topic', "['2.2', '2.7'], ['GOV']", "[], ['GOV']", 'apwh-u2-karakorum-mongol-unification-conquest', 'missing topicCodes'],
  ['invalid topic', "['2.2', '2.7'], ['GOV']", "['9.9', '2.7'], ['GOV']", 'apwh-u2-karakorum-mongol-unification-conquest', 'invalid topicCode 9.9'],
  ['missing theme', "['2.2', '2.7'], ['GOV']", "['2.2', '2.7'], []", 'apwh-u2-karakorum-mongol-unification-conquest', 'missing themeIds'],
  ['invalid theme', "['2.2', '2.7'], ['GOV']", "['2.2', '2.7'], ['BAD']", 'apwh-u2-karakorum-mongol-unification-conquest', 'invalid themeId BAD'],
  ['Chinese summary', "summary: 'Temujin unified", "summary: '中文 Temujin unified", 'apwh-u2-karakorum-mongol-unification-conquest', 'non-English summary'],
  ['missing source ID', "source: { id: 'amsco-apwh-u2', locator:", "source: { id: '', locator:", 'apwh-u2-karakorum-mongol-unification-conquest', 'missing source id'],
  ['missing source locator', "locator: 'AMSCO AP World History, Unit 2, Topics 2.2 and 2.7'", "locator: ''", 'apwh-u2-karakorum-mongol-unification-conquest', 'missing source locator'],
  ['non-English nested learner content', "'A 1206 kurultai recognized Temujin", "'中文 A 1206 kurultai recognized Temujin", 'apwh-u2-karakorum-mongol-unification-conquest', 'non-English nested learner content'],
  ['numeric-only evidence', "'A 1206 kurultai recognized Temujin as Genghis Khan after he defeated rival Mongol groups.'", "'12345.'", 'apwh-u2-karakorum-mongol-unification-conquest', 'non-English nested learner content'],
  ['extra source field', "source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.2 and 2.7' }", "source: { id: 'amsco-apwh-u2', locator: 'AMSCO AP World History, Unit 2, Topics 2.2 and 2.7', edition: 'extra' }", 'apwh-u2-karakorum-mongol-unification-conquest', 'source must contain exactly id and locator fields'],
];
for (const [label, search, replacement, id, rule] of mutationCases) {
  test(`rejects ${label}`, () => assertDataModuleError(label,
    replaceDataSource(label, search, replacement), `Invalid Unit 2 study record ${id}: ${rule}`));
}

test('rejects a duplicate raw record ID', () => {
  const malformed = replaceDataSource(
    'duplicate raw record ID',
    "id: 'apwh-u2-karakorum-pax-mongolica-protected-trade', locationNumber: '8',",
    "id: 'apwh-u2-karakorum-mongol-unification-conquest', locationNumber: '8',",
  );
  assertDataModuleError('duplicate raw record ID', malformed,
    'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: duplicate record ID');
});

test('rejects a fourth record at one location', () => {
  const malformed = replaceDataSources('four at 8 and two at 10', [
    ["'apwh-u2-nanjing-treasure-fleet-technology-scale', '10', 1,", "'apwh-u2-nanjing-treasure-fleet-technology-scale', '8', 1,"],
    ["id: 'apwh-u2-nanjing-treasure-fleet-technology-scale', locationNumber: '10',", "id: 'apwh-u2-nanjing-treasure-fleet-technology-scale', locationNumber: '8',"],
  ]);
  assertDataModuleError('four at 8 and two at 10', malformed,
    'Invalid Unit 2 study record apwh-u2-nanjing-treasure-fleet-technology-scale: location 8 must contain exactly three records');
});

test('rejects malformed and non-Unit-2 stable study IDs independently of the manifest', () => {
  for (const [replacement, rule] of [
    ['apwh-u1-karakorum-mongol-unification-conquest', 'invalid stable ID apwh-u1-karakorum-mongol-unification-conquest'],
    ['apwh-u2-Karakorum bad id', 'invalid stable ID apwh-u2-Karakorum bad id'],
  ]) {
    const malformed = replaceAllDataSource(
      rule,
      'apwh-u2-karakorum-mongol-unification-conquest',
      replacement,
    );
    assertDataModuleError(rule, malformed,
      `Invalid Unit 2 study record ${replacement}: ${rule}`);
  }
});

test('rejects malformed date labels and invalid date ranges independently of the manifest', () => {
  const id = 'apwh-u2-karakorum-mongol-unification-conquest';
  const cases = [
    ['malformed date label', [["'1206–1227', 1206, 1227", "'1206/1227', 1206, 1227"], ["dateLabel: '1206–1227'", "dateLabel: '1206/1227'"]], 'invalid dateLabel 1206/1227'],
    ['non-integer start year', [["'1206–1227', 1206, 1227", "'1206–1227', '1206', 1227"], ['startYear: 1206', "startYear: '1206'"]], 'startYear must be an integer'],
    ['non-integer end year', [["'1206–1227', 1206, 1227", "'1206–1227', 1206, '1227'"], ['endYear: 1227', "endYear: '1227'"]], 'endYear must be an integer'],
    ['reversed date range', [["'1206–1227', 1206, 1227", "'1206–1227', 1228, 1227"], ['startYear: 1206', 'startYear: 1228']], 'startYear 1228 exceeds endYear 1227'],
  ];
  for (const [label, replacements, rule] of cases) {
    assertDataModuleError(label, replaceDataSources(label, replacements),
      `Invalid Unit 2 study record ${id}: ${rule}`);
  }
});

test('rejects date labels whose years disagree with the numeric range', () => {
  const id = 'apwh-u2-karakorum-mongol-unification-conquest';
  for (const [label, replacements, rule] of [
    [
      'single-year label mismatch',
      [["'1206–1227', 1206, 1227", "'9999', 1206, 1227"], ["dateLabel: '1206–1227'", "dateLabel: '9999'"]],
      'dateLabel years 9999–9999 do not match startYear 1206 and endYear 1227',
    ],
    [
      'range end-year mismatch',
      [["'1206–1227', 1206, 1227", "'1206–1228', 1206, 1227"], ["dateLabel: '1206–1227'", "dateLabel: '1206–1228'"]],
      'dateLabel years 1206–1228 do not match startYear 1206 and endYear 1227',
    ],
  ]) {
    assertDataModuleError(label, replaceDataSources(label, replacements),
      `Invalid Unit 2 study record ${id}: ${rule}`);
  }
});

test('rejects malicious keyPeople and keyTerms entry shapes descriptively', () => {
  const id = 'apwh-u2-karakorum-mongol-unification-conquest';
  const insertionPoint = '  ];\n\n  function freezeUnitCard(card) {';
  const cases = [
    ['keyPeople missing field', "RAW_RECORDS[0].keyPeople = [{ role: 'English text' }];", 'keyPeople entry must contain exactly name and role fields'],
    ['keyPeople extra field', "RAW_RECORDS[0].keyPeople = [{ name: 'English name', role: 'English role', extra: 'English text' }];", 'keyPeople entry must contain exactly name and role fields'],
    ['keyPeople wrong shape', "RAW_RECORDS[0].keyPeople = [{ foo: 'English text' }];", 'keyPeople entry must contain exactly name and role fields'],
    ['keyPeople null', 'RAW_RECORDS[0].keyPeople = [null];', 'invalid keyPeople entry'],
    ['keyPeople non-object', 'RAW_RECORDS[0].keyPeople = [123];', 'invalid keyPeople entry'],
    ['keyTerms missing field', "RAW_RECORDS[0].keyTerms = [{ explanation: 'English text' }, { term: 'second', explanation: 'English text' }];", 'keyTerms entry must contain exactly term and explanation fields'],
    ['keyTerms extra field', "RAW_RECORDS[0].keyTerms = [{ term: 'term', explanation: 'English text', extra: 'English text' }, { term: 'second', explanation: 'English text' }];", 'keyTerms entry must contain exactly term and explanation fields'],
    ['keyTerms wrong shape', "RAW_RECORDS[0].keyTerms = [{ foo: 'English text' }, { term: 'second', explanation: 'English text' }];", 'keyTerms entry must contain exactly term and explanation fields'],
    ['keyTerms null', "RAW_RECORDS[0].keyTerms = [null, { term: 'second', explanation: 'English text' }];", 'invalid keyTerms entry'],
    ['keyTerms non-object', "RAW_RECORDS[0].keyTerms = [123, { term: 'second', explanation: 'English text' }];", 'invalid keyTerms entry'],
  ];
  for (const [label, injection, rule] of cases) {
    const replacement = `  ];\n  ${injection}\n\n  function freezeUnitCard(card) {`;
    assertDataModuleError(label, replaceDataSource(label, insertionPoint, replacement),
      `Invalid Unit 2 study record ${id}: ${rule}`);
  }
});

test('rejects malformed manifest rows before deriving study context', () => {
  const insertionPoint = '  ];\n\n  validateManifestRows(STUDY_MANIFEST);';
  const id = 'apwh-u2-karakorum-mongol-unification-conquest';
  const cases = [
    ['null manifest row', 'STUDY_MANIFEST[0] = null;', '(missing ID)', 'manifest row must be an eleven-field array'],
    ['short manifest row', `STUDY_MANIFEST[0] = ['${id}'];`, id, 'manifest row must be an eleven-field array'],
    ['non-array topicCodes', "STUDY_MANIFEST[0][8] = '2.2';", id, 'topicCodes must be an array'],
    ['non-array themeIds', "STUDY_MANIFEST[0][9] = 'GOV';", id, 'themeIds must be an array'],
    ['non-array examSkills', "STUDY_MANIFEST[0][10] = 'Causation';", id, 'examSkills must be an array'],
  ];
  for (const [label, injection, diagnosticId, rule] of cases) {
    const replacement = `  ];\n  ${injection}\n\n  validateManifestRows(STUDY_MANIFEST);`;
    assertDataModuleError(label, replaceDataSource(label, insertionPoint, replacement),
      `Invalid Unit 2 study record ${diagnosticId}: ${rule}`);
  }
});

test('rejects null and non-object raw records before dereferencing them', () => {
  const insertionPoint = '  ];\n\n  function freezeUnitCard(card) {';
  for (const [label, value] of [['null raw record', 'null'], ['non-object raw record', '123']]) {
    const replacement = `  ];\n  RAW_RECORDS[0] = ${value};\n\n  function freezeUnitCard(card) {`;
    assertDataModuleError(label, replaceDataSource(label, insertionPoint, replacement),
      'Invalid Unit 2 study record (missing ID): record must be a non-null plain object');
  }
});

test('rejects null and non-object unit cards before dereferencing them', () => {
  const insertionPoint = '  ];\n\n  function describeRuleValue(value) {';
  for (const [label, value] of [['null unit card', 'null'], ['non-object unit card', '123']]) {
    const replacement = `  ];\n  UNIT_CARD_LIST[0] = ${value};\n\n  function describeRuleValue(value) {`;
    assertDataModuleError(label, replaceDataSource(label, insertionPoint, replacement),
      'Invalid Unit 2 unit card (missing kind) (missing ID): card must be a non-null plain object');
  }
});

test('rejects empty and non-English location names', () => {
  for (const [replacement, rule] of [
    ["'8': ''", 'missing English location name'],
    ["'8': '12345'", 'missing English location name'],
  ]) {
    assertDataModuleError(rule, replaceDataSource(rule, "'8': 'Karakorum'", replacement),
      `Invalid Unit 2 study location 8: ${rule}`);
  }
});

test('rejects a duplicate sequence at one location', () => {
  const malformed = replaceDataSource(
    'duplicate sequence',
    "'apwh-u2-karakorum-pax-mongolica-protected-trade', '8', 2,",
    "'apwh-u2-karakorum-pax-mongolica-protected-trade', '8', 1,",
  );
  assertDataModuleError('duplicate sequence', malformed,
    'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: duplicate sequence 1 at location 8');
});

test('rejects missing causal and related endpoints immediately', () => {
  const cases = [
    ["    'apwh-u2-karakorum-mongol-unification-conquest',\n    'apwh-u2-karakorum-pax-mongolica-protected-trade',", "    'apwh-u2-missing-cause',\n    'apwh-u2-karakorum-pax-mongolica-protected-trade',", 'Invalid Unit 2 study connection causal: missing cause apwh-u2-missing-cause'],
    ["    'apwh-u2-karakorum-mongol-unification-conquest',\n    'apwh-u2-karakorum-pax-mongolica-protected-trade',", "    'apwh-u2-karakorum-mongol-unification-conquest',\n    'apwh-u2-missing-effect',", 'Invalid Unit 2 study connection causal: missing effect apwh-u2-missing-effect'],
    ["addRelatedConnection('apwh-u2-karakorum-yam-relay-cross-cultural-transfer', 'apwh-u2-samarkand-timurid-commercial-learning-hub'", "addRelatedConnection('apwh-u2-missing-left', 'apwh-u2-samarkand-timurid-commercial-learning-hub'", 'Invalid Unit 2 study connection related: missing left apwh-u2-missing-left'],
    ["addRelatedConnection('apwh-u2-karakorum-yam-relay-cross-cultural-transfer', 'apwh-u2-samarkand-timurid-commercial-learning-hub'", "addRelatedConnection('apwh-u2-karakorum-yam-relay-cross-cultural-transfer', 'apwh-u2-missing-right'", 'Invalid Unit 2 study connection related: missing right apwh-u2-missing-right'],
  ];
  for (const [search, replacement, message] of cases) {
    assertDataModuleError(message, replaceDataSource(message, search, replacement), message);
  }
});

const graphCases = [
  ['causal self', "'apwh-u2-karakorum-mongol-unification-conquest',\n    'apwh-u2-karakorum-pax-mongolica-protected-trade',", "'apwh-u2-karakorum-mongol-unification-conquest',\n    'apwh-u2-karakorum-mongol-unification-conquest',", 'Invalid Unit 2 study connection causal: self connection apwh-u2-karakorum-mongol-unification-conquest'],
  ['duplicate connection', 'cause.effectStudyPointIds.push(effectId);', 'cause.effectStudyPointIds.push(effectId, effectId);', 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: duplicate connection in effectStudyPointIds to apwh-u2-karakorum-pax-mongolica-protected-trade'],
  ['cross category', 'effect.causeStudyPointIds.push(causeId);', 'effect.causeStudyPointIds.push(causeId);\n    cause.relatedStudyPointIds.push(effectId);\n    effect.relatedStudyPointIds.push(causeId);', 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: cross-category connection apwh-u2-karakorum-pax-mongolica-protected-trade in effectStudyPointIds and relatedStudyPointIds'],
  ['nonreciprocal', 'effect.causeStudyPointIds.push(causeId);', '// omit reverse fixture', 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: nonreciprocal effectStudyPointIds connection to apwh-u2-karakorum-pax-mongolica-protected-trade'],
  ['missing note', 'cause.connectionNotes[effectId] = note;\n    effect.connectionNotes[causeId] = note;', '// omit notes fixture', 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: missing connection note for apwh-u2-karakorum-pax-mongolica-protected-trade'],
  ['non-English note', 'Mongol conquest brought previously divided routes under related authorities that could protect merchants and punish raiders.', '12345.', 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: non-English connection note for apwh-u2-karakorum-pax-mongolica-protected-trade'],
  ['mismatched note', 'effect.connectionNotes[causeId] = note;', 'effect.connectionNotes[causeId] = `${note} Different.`;', 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: nonreciprocal connection note for apwh-u2-karakorum-pax-mongolica-protected-trade'],
  ['extra note', 'connectionNotes: Object.freeze({ ...connections.connectionNotes }),', "connectionNotes: Object.freeze({ ...connections.connectionNotes, 'apwh-u2-extra': 'Extra note.' }),", 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: extra connection note key apwh-u2-extra'],
  ['unresolved link', 'effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds]),', "effectStudyPointIds: Object.freeze([...connections.effectStudyPointIds, 'apwh-u2-missing-link']),", 'Invalid Unit 2 study record apwh-u2-karakorum-mongol-unification-conquest: unresolved connection apwh-u2-missing-link'],
];
for (const [label, search, replacement, message] of graphCases) {
  test(`rejects ${label}`, () => assertDataModuleError(label, replaceDataSource(label, search, replacement), message));
}

const cardCases = [
  ['missing role', "role: 'Unit 2 Context Card'", "role: ''", 'context', 'apwh-u2-context-networks-ready-to-expand', 'missing role'],
  ['two takeaways', "        'Merchant communities and shared legal or religious practices made exchange with strangers more predictable.',\n      ],", '      ],', 'context', 'apwh-u2-context-networks-ready-to-expand', 'takeaways must contain exactly three items'],
  ['duplicate kind', "kind: 'synthesis', role: 'Unit 2 Synthesis Card'", "kind: 'context', role: 'Unit 2 Synthesis Card'", 'context', 'apwh-u2-synthesis-network-expansion-consequences', 'duplicate kind context'],
  ['duplicate ID', "id: 'apwh-u2-synthesis-network-expansion-consequences', kind: 'synthesis'", "id: 'apwh-u2-context-networks-ready-to-expand', kind: 'synthesis'", 'synthesis', 'apwh-u2-context-networks-ready-to-expand', 'duplicate card ID'],
  ['non-array exam skills', "examSkills: ['Contextualization', 'Causation']", "examSkills: 'Causation'", 'context', 'apwh-u2-context-networks-ready-to-expand', 'examSkills must be an array'],
  ['empty exam skills', "examSkills: ['Contextualization', 'Causation']", 'examSkills: []', 'context', 'apwh-u2-context-networks-ready-to-expand', 'missing examSkills'],
  ['invalid exam skill item type', "examSkills: ['Contextualization', 'Causation']", "examSkills: [123, 'Causation']", 'context', 'apwh-u2-context-networks-ready-to-expand', 'invalid examSkill 123'],
  ['empty exam skill item', "examSkills: ['Contextualization', 'Causation']", "examSkills: ['', 'Causation']", 'context', 'apwh-u2-context-networks-ready-to-expand', 'invalid examSkill ""'],
  ['duplicate exam skills', "examSkills: ['Contextualization', 'Causation']", "examSkills: ['Causation', 'Causation']", 'context', 'apwh-u2-context-networks-ready-to-expand', 'duplicate examSkill Causation'],
  ['oversized exam skills', "examSkills: ['Contextualization', 'Causation']", "examSkills: ['Contextualization', 'Causation', 'Comparison']", 'context', 'apwh-u2-context-networks-ready-to-expand', 'too many examSkills'],
];
for (const [label, search, replacement, kind, id, rule] of cardCases) {
  test(`rejects card ${label}`, () => assertDataModuleError(label, replaceDataSource(label, search, replacement),
    `Invalid Unit 2 unit card ${kind} ${id}: ${rule}`));
}
