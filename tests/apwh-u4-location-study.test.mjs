import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

await import('../data/apwh-u4-location-study.js');

const api = globalThis.APWH_U4_LOCATION_STUDY;
const dataModuleSource = readFileSync(new URL('../data/apwh-u4-location-study.js', import.meta.url), 'utf8');
const replaceSource = (label, search, replacement) => {
  const malformed = dataModuleSource.replace(search, replacement);
  assert.notEqual(malformed, dataModuleSource, `${label} fixture mutation`);
  return malformed;
};
const replaceSources = (label, replacements) => replacements.reduce((source, [search, replacement]) => {
  const malformed = source.replace(search, replacement);
  assert.notEqual(malformed, source, `${label} fixture mutation for ${search}`);
  return malformed;
}, dataModuleSource);
const replaceAllSource = (label, search, replacement) => {
  const malformed = dataModuleSource.replaceAll(search, replacement);
  assert.notEqual(malformed, dataModuleSource, `${label} fixture mutation`);
  return malformed;
};
const assertModuleError = (label, malformedSource, expectedMessage) => {
  assert.throws(() => runInNewContext(malformedSource, {}), error => {
    assert.equal(error.message, expectedMessage, `${label} diagnostic`);
    return true;
  });
};

const expectedLocations = [
  ['42', 'Maritime Portugal · Lisbon', 'world-event-42-0'],
  ['2', 'Portuguese Trading-Post Empire · Malacca', 'world-event-2-2'],
  ['68', 'Caribbean Colonization · Santo Domingo', 'world-event-68-0'],
  ['57', 'Spanish Silver Economy · Potosí', 'world-event-57-0'],
  ['60', 'Brazilian Sugar Plantations · Salvador', 'world-event-60-0'],
  ['87', 'Atlantic Slave Trade · Elmina', 'world-event-87-0'],
  ['12', 'Manila Galleons · Manila', 'world-event-12-0'],
  ['49', 'Colonial New Spain · Tenochtitlan / Mexico City', 'world-event-49-7'],
];

const expectedManifest = [
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

const expectedRecordContent = [
  { id: 'apwh-u4-lisbon-atlantic-constraints', title: 'Atlantic Constraints and Overseas Expansion', summary: 'Portugal faced Atlantic opportunities and Iberian limits while Castile and Aragon constrained easy territorial expansion on the peninsula.', significance: "Portugal's Atlantic position, Iberian limits, and primogeniture encouraged overseas routes, but geography created incentives rather than making expansion inevitable.", keyPeople: [{ name: 'Portuguese nobles and merchants', role: 'Backed voyages offering traders, the crown, and younger noble sons new paths to wealth and status.' }], keyTerms: [{ term: 'primogeniture', explanation: 'Inheritance favoring the eldest son, which could push younger nobles to seek advancement elsewhere.' }, { term: 'Atlantic position', explanation: "Portugal's access to Atlantic islands, winds, and coastal routes." }], evidence: ['Castile and Aragon occupied much of the neighboring Iberian land frontier available to Portuguese expansion.', 'Portuguese sailors used Atlantic islands and the African coast as stages for increasingly ambitious voyages.'], examConnection: 'Use these constraints as contextual causes, while qualifying the claim: political choices, finance, and technology were also necessary.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.1 and 4.2' } },
  { id: 'apwh-u4-lisbon-navigation-state-sponsorship', title: 'Navigation Knowledge and State Sponsorship', summary: 'Portuguese voyages combined compass and astrolabe use with lateen and square sails, shipbuilding experience, and royal finance.', significance: 'Knowledge from multiple Afro-Eurasian traditions became more powerful when the Portuguese state financed voyages and sustained repeated experimentation.', keyPeople: [{ name: 'Prince Henry the Navigator', role: 'Sponsored Portuguese exploration and concentrated navigators, mapmakers, and royal resources on Atlantic and African routes.' }], keyTerms: [{ term: 'astrolabe', explanation: 'An instrument sailors adapted to estimate latitude by observing celestial bodies.' }, { term: 'caravel rig', explanation: 'A later mixed Portuguese sail plan combining triangular lateen sails with square sails.' }], evidence: ['Portuguese navigators used the compass and astrolabe alongside accumulated Mediterranean, African, and Asian knowledge.', 'Royal sponsorship paid for ships, crews, information gathering, and repeated voyages along the African coast.'], examConnection: 'Link borrowed navigational knowledge to state capacity; neither technology alone nor royal ambition alone explains sustained exploration.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.1 and 4.2' } },
  { id: 'apwh-u4-lisbon-sea-route-indian-ocean', title: 'A Sea Route to the Indian Ocean', summary: 'Bartolomeu Dias rounded southern Africa in 1488, and Vasco da Gama reached India by sea in 1498.', significance: 'The route around the Cape of Good Hope connected Portugal directly to Indian Ocean commerce and redirected some exchange through Atlantic-facing ports.', keyPeople: [{ name: 'Bartolomeu Dias and Vasco da Gama', role: 'Dias rounded the cape in 1488; da Gama used that route to reach India in 1498.' }], keyTerms: [{ term: 'Cape of Good Hope', explanation: 'The southern African cape whose rounding opened a sea route toward the Indian Ocean.' }, { term: 'sea route to India', explanation: 'The oceanic passage around Africa that let Portuguese ships reach Indian Ocean ports.' }], evidence: ['Dias rounded the southern tip of Africa in 1488 and demonstrated that the Atlantic connected to waters leading east.', 'Da Gama arrived at Calicut in India in 1498 after sailing around the Cape of Good Hope.'], examConnection: 'Use the voyages as a causal sequence in Atlantic-to-Indian Ocean expansion, without mislabeling this route as Pacific.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.2 and 4.8' } },
  { id: 'apwh-u4-malacca-existing-indian-ocean-networks', title: 'Indian Ocean Trade before Portuguese Arrival', summary: 'Muslim, Hindu, and Southeast Asian merchants used monsoon winds to exchange goods through Malacca long before Portuguese conquest.', significance: 'Portuguese sailors entered a mature commercial system they did not create, changing control at strategic ports without originating Indian Ocean trade.', keyPeople: [{ name: 'Muslim, Hindu, and Southeast Asian merchants', role: 'Sustained commercial communities and seasonal voyages linking Malacca to wider maritime networks.' }], keyTerms: [{ term: 'monsoon winds', explanation: 'Seasonally reversing winds that structured Indian Ocean sailing schedules.' }, { term: 'entrepot', explanation: 'A port where merchants store, exchange, and re-export goods from several regions.' }], evidence: ['Merchants timed voyages to predictable monsoon cycles before any Portuguese ship reached Malacca.', 'Malacca already linked textiles, spices, ceramics, and other goods moving among Asian markets.'], examConnection: 'Use Malacca for CCOT: Portuguese coercion changed parts of the network while Asian merchants, monsoons, and older routes continued.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.2 and 4.8' } },
  { id: 'apwh-u4-malacca-cartaz-fortified-ports', title: 'Cartaz Passes and Fortified Ports', summary: 'After conquering Malacca in 1511, Portuguese forces used forts, cannon, and cartaz passes to tax and redirect maritime traffic.', significance: "Afonso de Albuquerque's strategy built a trading-post empire controlling selected sea lanes and ports rather than most inland territory.", keyPeople: [{ name: 'Afonso de Albuquerque', role: 'Directed the 1511 conquest of Malacca and strengthened Portuguese control through fortified ports.' }], keyTerms: [{ term: 'cartaz', explanation: 'A Portuguese naval pass ships were pressured to buy and display in controlled waters.' }, { term: 'trading-post empire', explanation: 'An empire based on fortified ports and sea-lane control instead of broad inland conquest.' }], evidence: ['Portuguese forces captured Malacca in 1511 and fortified the port with cannon.', 'Officials demanded passes, collected duties, and threatened ships trading outside Portuguese rules.'], examConnection: 'Explain how cannon, forts, and passes taxed routes, then distinguish coastal leverage from inland territorial rule.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.2 and 4.4' } },
  { id: 'apwh-u4-malacca-asian-responses-limits', title: 'Asian Responses and the Limits of Portuguese Power', summary: 'Asian states and merchants resisted, negotiated with, or redirected trade around Portuguese pressure in ways that varied by place and time.', significance: 'Aceh and other rivals challenged Portuguese influence, the Dutch VOC later displaced it, and Nagasaki restrictions show that Asian responses were not uniform or passive.', keyPeople: [{ name: 'Dutch VOC and the rulers of Aceh', role: 'Competed with Portuguese shipping and fortifications through different commercial and military strategies.' }], keyTerms: [{ term: 'Dutch VOC', explanation: 'A chartered Dutch company combining trade, armed force, and state-backed privileges in Asia.' }, { term: 'Nagasaki restriction', explanation: 'Japanese policies confining and regulating selected European trade.' }], evidence: ['Aceh and other powers fought or competed with Portuguese Malacca and supported alternative routes.', 'The Dutch VOC captured Malacca in 1641, while Japanese rulers restricted European access through Nagasaki.'], examConnection: 'Compare Acehnese, Dutch, and Japanese responses to show how local political capacity limited European trading-post power.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.5 and 4.6' } },
  { id: 'apwh-u4-santo-domingo-columbian-exchange', title: 'The Columbian Exchange in the Caribbean', summary: 'Contact joined Caribbean, American, African, and Eurasian ecologies through transfers of crops, animals, people, and pathogens.', significance: 'The Columbian Exchange was bidirectional, but unequal power and biological vulnerability made its effects especially destructive for Taíno communities.', keyPeople: [{ name: 'Taíno communities', role: 'Experienced new animals, crops, diseases, labor demands, and colonial settlement after sustained Atlantic contact.' }], keyTerms: [{ term: 'Columbian Exchange', explanation: 'The transfer of plants, animals, pathogens, and people between the Americas and Afro-Eurasia after 1492.' }, { term: 'ecological transfer', explanation: 'The movement of organisms and environmental practices between separated ecosystems.' }], evidence: ['Europeans brought horses, cattle, pigs, wheat, and pathogens to Caribbean islands.', 'American crops moved eastward while forced African migration added people and foodways to Atlantic societies.'], examConnection: 'Compare transfers in both directions, then explain why bidirectional exchange did not mean equal effects on participating populations.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.3 and 4.8' } },
  { id: 'apwh-u4-santo-domingo-disease-demographic-collapse', title: 'Disease and Demographic Collapse', summary: 'Smallpox and other Afro-Eurasian diseases caused catastrophic mortality among Indigenous Caribbean peoples who lacked prior exposure.', significance: 'Epidemics weakened communities and aided Spanish conquest, but conquest was not automatic because warfare, alliances, labor, and policy also shaped outcomes.', keyPeople: [{ name: 'Indigenous Caribbean communities', role: 'Faced repeated epidemics alongside displacement, violence, and colonial labor demands.' }], keyTerms: [{ term: 'smallpox', explanation: 'A contagious disease that caused devastating mortality in populations without previous exposure.' }, { term: 'demographic collapse', explanation: 'A severe population decline produced by interacting disease, violence, hunger, and exploitation.' }], evidence: ['Smallpox and other diseases spread through Caribbean populations after sustained European contact.', 'Mortality combined with warfare, displacement, and forced labor to reduce Indigenous populations sharply.'], examConnection: 'Use disease as a major cause aiding conquest, while rejecting automatic explanations by adding warfare, alliance, and labor evidence.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.3 and 4.8' } },
  { id: 'apwh-u4-santo-domingo-conquest-encomienda', title: 'Conquest and Encomienda', summary: 'Spanish encomenderos claimed rights to Indigenous labor and tribute in Santo Domingo as conquest became colonial administration.', significance: 'Encomienda organized coercive labor and tribute without automatically granting Indigenous land or making workers identical to enslaved African chattel.', keyPeople: [{ name: 'Bartolomé de las Casas', role: 'Condemned abuses of Indigenous people and pressed the Spanish crown to reform colonial labor practices.' }], keyTerms: [{ term: 'encomienda', explanation: 'A crown grant authorizing a colonist to demand labor or tribute from designated Indigenous communities.' }, { term: 'New Laws', explanation: 'The 1542 reforms intended to restrict Indigenous enslavement and curb hereditary encomienda power.' }], evidence: ['The crown established encomienda arrangements in Hispaniola during the early sixteenth century.', 'Las Casas publicized abuses, and the New Laws of 1542 attempted to limit colonists\' control.'], examConnection: 'Distinguish encomienda labor and tribute from land ownership and hereditary African chattel slavery when comparing labor systems.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.3 and 4.4' } },
  { id: 'apwh-u4-potosi-silver-mercury-boom', title: 'Silver Discovery and Mercury Refining', summary: 'After silver was discovered at Potosí in 1545, mercury amalgamation increased the lower-grade ore that refiners could process.', significance: 'Like Zacatecas in New Spain, Potosí generated extraordinary output and profit, while mercury exposure, dangerous shafts, and harsh labor made the boom deadly.', keyPeople: [{ name: 'Potosí mine owners and refiners', role: 'Combined capital, coerced labor, and mercury processing to expand colonial silver production.' }], keyTerms: [{ term: 'mercury amalgamation', explanation: 'A refining process using mercury to separate silver from crushed ore.' }, { term: 'Zacatecas', explanation: 'A major silver-mining center in New Spain useful for comparison with Potosí.' }], evidence: ['The 1545 Potosí discovery produced one of the Spanish Empire\'s largest silver centers.', 'Mercury processing raised output from lower-grade ore but exposed workers and communities to poison.'], examConnection: 'Compare Potosí and Zacatecas for technology-driven output and profit while treating danger and coerced labor as part of the system.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.4 and 4.5' } },
  { id: 'apwh-u4-potosi-colonial-mita-labor', title: "Colonial Mit'a and Coerced Mining Labor", summary: "Viceroy Francisco de Toledo reorganized a colonial mit'a in 1573 to draft Andean communities for labor at Potosí and Huancavelica.", significance: "Colonial officials adapted an Inca labor obligation to Spanish mining, but the colonial mit'a was not identical to reciprocal service under Inca rule.", keyPeople: [{ name: 'Viceroy Francisco de Toledo', role: "Reorganized communities and the colonial mit'a to supply workers to Potosí and Huancavelica." }], keyTerms: [{ term: "mit'a", explanation: 'A rotating labor obligation adapted into a coercive colonial mining draft.' }, { term: 'Huancavelica', explanation: 'The Andean mercury center supplying material essential to silver amalgamation.' }], evidence: ["Toledo's 1573 reforms required selected Andean communities to send rotating workers to Potosí.", 'Workers also faced dangerous mercury production at Huancavelica and separation from households.'], examConnection: "Compare the colonial mit'a with its Inca precedent by identifying continuity in obligation and change in purpose, coercion, and benefit.", source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.4 and 4.7' } },
  { id: 'apwh-u4-potosi-global-silver-flows', title: 'Potosí Silver in the Global Economy', summary: 'The Spanish crown taxed American bullion as merchants carried silver into Europe and across the Pacific toward Asian markets.', significance: 'Potosí silver financed imperial exchange, contributed to the European Price Revolution, and met Asian demand, linking Atlantic and Pacific systems.', keyPeople: [{ name: 'Spanish crown officials', role: 'Taxed, registered, and directed bullion flows supporting imperial spending and long-distance trade.' }], keyTerms: [{ term: 'bullion', explanation: 'Precious metal valued by weight and transported for payment or reserves.' }, { term: 'Price Revolution', explanation: 'Early modern European inflation associated partly with population growth and increased silver supplies.' }], evidence: ['The Spanish crown collected a royal share of silver and shipped large quantities toward Europe.', 'American silver also crossed the Pacific through Manila and entered Chinese and other Asian markets.'], examConnection: 'Connect American production with European inflation and Asian demand to show that Potosí belonged to a global economy.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.5 and 4.8' } },
  { id: 'apwh-u4-salvador-sugar-plantation-expansion', title: 'Sugar and Plantation Expansion', summary: 'Portuguese planters expanded sugar around Salvador through engenhos combining land, mills, capital, and coerced labor.', significance: 'Suitable ecology mattered, but plantation growth also depended on investment, Atlantic demand, processing infrastructure, and coercion rather than climate alone.', keyPeople: [{ name: 'Portuguese planters', role: 'Organized land, credit, mills, and coerced workforces to produce sugar for Atlantic markets.' }], keyTerms: [{ term: 'engenho', explanation: 'A Brazilian sugar-mill complex including processing equipment and often a plantation.' }, { term: 'sugar plantation', explanation: 'A large commercial estate specializing in labor-intensive cane cultivation and processing.' }], evidence: ['Warm coastal conditions and fertile soils supported cane cultivation near Salvador.', 'Mills required expensive machinery, coordinated labor, fuel, transport, and overseas consumers.'], examConnection: 'Explain plantation expansion through environmental and economic causes, with coerced labor as a central production mechanism.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.4 and 4.5' } },
  { id: 'apwh-u4-salvador-african-chattel-slavery', title: 'From Indigenous Labor to African Chattel Slavery', summary: 'Portuguese colonists increasingly forced enslaved Africans to labor on plantations as Indigenous-only labor systems weakened.', significance: 'Disease, escape, resistance, and policy limited Indigenous-only labor while racialized hereditary chattel slavery became central to plantation production.', keyPeople: [{ name: 'Enslaved Africans', role: 'Performed skilled and exhausting plantation labor while preserving communities and resisting bondage.' }], keyTerms: [{ term: 'chattel slavery', explanation: 'A hereditary system treating enslaved people as legally transferable property.' }, { term: 'plantation', explanation: 'A large estate producing a commercial crop through tightly controlled labor.' }], evidence: ['Epidemics, flight, and resistance made a stable Indigenous-only plantation workforce difficult to maintain.', 'Atlantic traders transported growing numbers of enslaved Africans to Brazil for sugar production.'], examConnection: "Compare Indigenous coercion with African chattel slavery, emphasizing the later system's racialization, heredity, and property status.", source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.4 and 4.7' } },
  { id: 'apwh-u4-salvador-mercantilism-atlantic-profits', title: 'Mercantilism and Atlantic Profits', summary: 'The Portuguese crown used monopoly rules, taxes, and regulated shipping to direct Brazilian sugar revenue through imperial channels.', significance: 'Mercantilist controls sought to enrich Portugal, yet merchants, planters, creditors, shippers, and foreign refiners ensured that not all gains stayed there.', keyPeople: [{ name: 'Portuguese crown officials', role: 'Enforced trade rules, collected taxes, and reserved colonial commerce for approved channels.' }], keyTerms: [{ term: 'mercantilism', explanation: 'Policies intended to increase state power by regulating trade and accumulating revenue.' }, { term: 'monopoly', explanation: 'Exclusive control over a trade, commodity, or route enforced by political authority.' }], evidence: ['The crown taxed sugar and regulated ships carrying colonial products across the Atlantic.', 'Planters, merchants, financiers, shippers, and northern European refiners also captured profits.'], examConnection: 'Use sugar to explain how mercantilism directed revenue, while qualifying any claim that every gain stayed in Portugal.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.5 and 4.8' } },
  { id: 'apwh-u4-elmina-firearms-captive-cycle', title: 'African States and the Firearms–Captive Cycle', summary: 'Some African rulers and merchants exchanged captives for imported firearms, which could intensify warfare and generate additional captives.', significance: 'African intermediaries shaped the trade, but their participation does not erase the decisive force of European demand, shipping, and coercion.', keyPeople: [{ name: 'African rulers and merchants', role: 'Negotiated exchanges, pursued political strategies, and in some regions supplied captives to Atlantic traders.' }], keyTerms: [{ term: 'firearms–captive cycle', explanation: 'A reinforcing pattern in which guns aided warfare producing captives exchanged for more weapons.' }, { term: 'captive trade', explanation: 'The seizure, sale, and forced transfer of people through political and commercial networks.' }], evidence: ['Some states used imported guns to strengthen armies or intensify raids against rivals.', 'European plantation demand and Atlantic shipping created a large external market for captives.'], examConnection: 'Explain reciprocal incentives without assigning uniform responsibility: African choices mattered, and European demand and coercion remained essential.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.4 and 4.6' } },
  { id: 'apwh-u4-elmina-middle-passage-chattel-slavery', title: 'Middle Passage and Chattel Slavery', summary: 'Captive Africans were confined in barracoons, forced onto ships, and carried through lethal Middle Passage conditions into hereditary slavery.', significance: 'The voyage transformed violent capture into racialized property, while resistance aboard ships showed that captives never accepted enslavement passively.', keyPeople: [{ name: 'Captive Africans', role: 'Endured forced embarkation and confinement while resisting through refusal, revolt, communication, and survival.' }], keyTerms: [{ term: 'Middle Passage', explanation: 'The forced Atlantic voyage carrying enslaved Africans to the Americas.' }, { term: 'barracoon', explanation: 'A fortified enclosure where captives could be imprisoned before forced embarkation.' }], evidence: ['Traders confined captives at coastal forts and barracoons before forcing them aboard ships.', 'Crowding, disease, hunger, violence, and suicide caused deaths, while captives also organized resistance.'], examConnection: 'Use the sequence from barracoon to ship to hereditary property to explain the construction of racialized chattel slavery.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.4 and 4.7' } },
  { id: 'apwh-u4-elmina-african-demographic-political-effects', title: 'Demographic and Political Effects in Africa', summary: 'Atlantic enslavement removed millions and altered household, gender, military, and political relationships in affected West African regions.', significance: 'Gender imbalance, insecurity, and fragmentation could intensify where exports concentrated, but effects varied and were not uniform across Africa.', keyPeople: [{ name: 'West African communities', role: 'Adapted to population loss, insecurity, changing gender ratios, and political pressures in distinct ways.' }], keyTerms: [{ term: 'gender imbalance', explanation: 'An unequal ratio of men and women produced partly by selective patterns of enslavement.' }, { term: 'political fragmentation', explanation: 'The weakening or division of authority amid warfare, raids, migration, and competition.' }], evidence: ['Export of many working-age people changed family formation and labor burdens in heavily affected communities.', 'Warfare strengthened some states and destabilized others, with outcomes differing across regions.'], examConnection: 'Make a qualified causal claim naming a region and mechanism instead of treating every African society as one case.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.5 and 4.8' } },
  { id: 'apwh-u4-manila-galleon-route', title: 'The Manila Galleon Route', summary: 'Beginning in 1565, Spanish galleons linked Manila in the Spanish Philippines with Acapulco in New Spain across the Pacific.', significance: 'The route created a regular cross-Pacific connection between American bullion and Asian markets, with Manila a representative port rather than the whole network.', keyPeople: [{ name: 'Spanish officials in the Philippines', role: 'Regulated and protected the galleon route connecting Manila to Acapulco.' }], keyTerms: [{ term: 'Manila galleon', explanation: 'A large Spanish vessel used on the regular Manila–Acapulco route.' }, { term: 'Acapulco', explanation: 'The New Spanish Pacific port where cargo entered American and Atlantic distribution routes.' }], evidence: ['The regular Manila–Acapulco route began in 1565 under Spanish imperial rule.', 'Galleons carried American silver west and Asian luxury goods east across the Pacific.'], examConnection: 'Use Manila as evidence that exchange was cross-Pacific as well as Atlantic, while treating the city as one representative node.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.4 and 4.5' } },
  { id: 'apwh-u4-manila-silver-asian-goods', title: 'American Silver for Asian Goods', summary: 'Chinese merchants exchanged silk, porcelain, and other Asian goods for American silver brought to Manila by Spanish ships.', significance: 'Chinese silver demand pulled bullion across the Pacific and shaped galleon commerce rather than leaving Europeans as its sole drivers.', keyPeople: [{ name: 'Chinese merchants', role: 'Supplied silk, porcelain, and other goods in exchange for silver circulating through Manila.' }], keyTerms: [{ term: 'silver demand', explanation: 'Strong demand for bullion, reinforced in China by taxes and commercial payments made in silver.' }, { term: 'silk and porcelain', explanation: 'High-value Chinese manufactures sought by American and European consumers.' }], evidence: ['Merchants carried large quantities of American silver into Manila and onward to Chinese markets.', 'Chinese silk and porcelain formed major return cargoes shipped toward Acapulco.'], examConnection: 'Explain both supply and demand: American mines supplied bullion, while Chinese demand pulled it toward Asian goods markets.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.5 and 4.8' } },
  { id: 'apwh-u4-manila-pacific-commercial-network', title: 'A Pacific Commercial Network', summary: "Merchants in the Americas, the Philippines, and China connected regional production and exchange through Manila's entrepot markets.", significance: 'The galleon trade linked existing networks into a wider Pacific system, but it did not erase local Asian commerce or reduce exchange to Spanish control.', keyPeople: [{ name: 'American, Philippine, and Chinese merchants', role: 'Moved silver, provisions, manufactures, and information among overlapping local and long-distance markets.' }], keyTerms: [{ term: 'entrepot', explanation: 'A port where goods from different regions are stored, exchanged, and re-exported.' }, { term: 'Pacific commercial network', explanation: 'Linked routes and markets connecting American and Asian producers and consumers.' }], evidence: ['Manila joined American silver with Chinese goods and Philippine labor and provisioning systems.', 'Regional Asian merchants and markets continued operating alongside the Spanish-regulated route.'], examConnection: 'Contextualize early globalization as the linking of existing networks, not the replacement of Asian commerce by one European system.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.5 and 4.8' } },
  { id: 'apwh-u4-new-spain-tenochtitlan-mexico-city', title: 'From Tenochtitlan to Mexico City', summary: 'After the 1521 fall of Tenochtitlan, Spaniards destroyed and rebuilt much of the Mexica capital as colonial Mexico City.', significance: 'Continuity of place and Indigenous labor accompanied a major change in political power as Spain remade a Mexica center for colonial government.', keyPeople: [{ name: 'Hernán Cortés, Mexica defenders, and Indigenous allies', role: 'Fought over Tenochtitlan in a conflict shaped by Spanish forces and Indigenous enemies of Mexica rule.' }], keyTerms: [{ term: 'Tenochtitlan', explanation: 'The Mexica island capital conquered after siege in 1521.' }, { term: 'Mexico City', explanation: 'The Spanish colonial capital built over and through conquered Tenochtitlan.' }], evidence: ['Cortés relied on numerous Indigenous allies as well as Spanish soldiers during the 1521 siege.', 'Colonizers dismantled temples and rebuilt institutions while retaining the site as a capital.'], examConnection: 'Use the city for CCOT: rule and landscape changed after 1521, while location and urban importance continued.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.3 and 4.4' } },
  { id: 'apwh-u4-new-spain-casta-colonial-governance', title: 'Casta and Colonial Governance', summary: 'Colonial institutions distinguished peninsulares, criollos, Indigenous people, Africans, and mixed communities through ranked but negotiable categories.', significance: 'Casta labels influenced privilege and office, yet lived identities were more flexible than a perfectly fixed official diagram suggests.', keyPeople: [{ name: 'Peninsulares and criollos', role: 'Competed for status and office in an order generally favoring people born in Iberia.' }], keyTerms: [{ term: 'peninsulares', explanation: 'Iberian-born residents often preferred for high colonial offices.' }, { term: 'criollos', explanation: 'American-born people of Spanish ancestry who could possess wealth but resent peninsular preference.' }, { term: 'casta', explanation: 'Flexible colonial labels ranking ancestry and status in Spanish America.' }], evidence: ['High royal and church offices often favored peninsulares over wealthy criollos.', 'Casta labels appeared in records, but wealth, family, locality, and legal action could alter status.'], examConnection: 'Compare formal hierarchy with lived practice: casta shaped privilege without functioning as a single perfectly fixed racial chart.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.5 and 4.7' } },
  { id: 'apwh-u4-new-spain-syncretism-resistance', title: 'Syncretism, Resistance, and Social Change', summary: 'Indigenous and African communities adapted Christianity and colonial institutions while preserving traditions and resisting domination.', significance: 'The Virgin of Guadalupe illustrates syncretism, while the Pueblo Revolt comparison shows that adaptation and resistance coexisted rather than simple erasure.', keyPeople: [{ name: 'Indigenous and African communities', role: 'Preserved, combined, and defended cultural practices under colonial rule across New Spain.' }], keyTerms: [{ term: 'syncretism', explanation: 'Selective blending of beliefs and practices from interacting traditions.' }, { term: 'Virgin of Guadalupe', explanation: 'A Mexican Catholic devotion interpreted through Christian and Indigenous meanings.' }, { term: 'Pueblo Revolt', explanation: 'The 1680 uprising in New Mexico that expelled Spanish rulers for more than a decade.' }], evidence: ['Guadalupe devotion joined Catholic forms with meanings rooted in Indigenous experience.', 'The Pueblo Revolt of 1680 shows organized resistance to colonial labor and religious pressure.'], examConnection: 'Use Mexico City as a representative anchor, then compare syncretic adaptation with revolt to reject total cultural erasure.', source: { id: 'amsco-apwh-u4', locator: 'AMSCO AP World History, Unit 4, Topics 4.6, 4.7, and 4.8' } },
];

const recordKeys = [
  'causeStudyPointIds', 'connectionNotes', 'dateLabel', 'effectStudyPointIds', 'endYear',
  'evidence', 'examConnection', 'examSkills', 'id', 'keyPeople', 'keyTerms', 'locationNumber',
  'mainEventKey', 'relatedStudyPointIds', 'sequence', 'significance', 'source', 'startYear',
  'summary', 'themeIds', 'title', 'topicCodes',
];

test('publishes the exact Unit 4 manifest and canonical locations', () => {
  assert.equal(api.unitId, 'u4');
  assert.equal(api.unitNumber, 4);
  assert.deepEqual(api.locationNumbers, expectedLocations.map(([number]) => number));
  assert.deepEqual(expectedLocations.map(([number]) => [number, api.locationName(number)]),
    expectedLocations.map(([number, name]) => [number, name]));
  assert.equal(api.records.length, 24);
  assert.deepEqual(api.records.map(record => [
    record.id, record.locationNumber, record.sequence, record.title, record.dateLabel,
    record.startYear, record.endYear, record.mainEventKey, [...record.topicCodes],
    [...record.themeIds], [...record.examSkills],
  ]), expectedManifest);
});

test('locks every learner-content field exactly', () => {
  assert.deepEqual(api.records.map(record => ({
    id: record.id, title: record.title, summary: record.summary, significance: record.significance,
    keyPeople: record.keyPeople, keyTerms: record.keyTerms, evidence: record.evidence,
    examConnection: record.examConnection, source: record.source,
  })), expectedRecordContent);
});

test('enforces taxonomy, IDs, event bindings, coverage, and three records per location', () => {
  const validTopics = new Set(['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8']);
  const validThemes = new Set(['GOV', 'ECN', 'CDI', 'SIO', 'TEC', 'ENV']);
  const validSkills = new Set(['Causation', 'Comparison', 'CCOT', 'Contextualization']);
  const bindings = new Map(expectedLocations.map(([number, , event]) => [number, event]));
  const topics = new Set();
  for (const record of api.records) {
    assert.match(record.id, /^apwh-u4-(lisbon|malacca|santo-domingo|potosi|salvador|elmina|manila|new-spain)-/);
    assert.equal(record.mainEventKey, bindings.get(record.locationNumber));
    assert.ok(record.topicCodes.every(topic => validTopics.has(topic)));
    assert.ok(record.themeIds.every(theme => validThemes.has(theme)));
    assert.ok(record.examSkills.every(skill => validSkills.has(skill)));
    record.topicCodes.forEach(topic => topics.add(topic));
  }
  assert.deepEqual([...topics].sort(), [...validTopics]);
  for (const number of api.locationNumbers) {
    const records = api.getByLocation(number);
    assert.equal(records.length, 3, number);
    assert.deepEqual(records.map(record => record.sequence), [1, 2, 3]);
    assert.equal(new Set(records.map(record => record.sequence)).size, 3);
  }
});

test('ships complete English content and deeply frozen empty graph fields', () => {
  for (const record of api.records) {
    assert.deepEqual(Object.keys(record).sort(), recordKeys);
    assert.doesNotMatch(JSON.stringify(record), /[\u3400-\u9fff]/);
    assert.ok(record.significance.length >= 60);
    assert.ok(record.examConnection.length >= 60);
    assert.ok(record.keyPeople.length >= 1);
    assert.ok(record.keyTerms.length >= 2);
    assert.ok(record.evidence.length >= 2);
    for (const field of ['causeStudyPointIds', 'effectStudyPointIds', 'relatedStudyPointIds']) {
      assert.deepEqual(record[field], []);
    }
    assert.deepEqual(record.connectionNotes, {});
    assert.ok(Object.isFrozen(record));
    for (const nested of [record.topicCodes, record.themeIds, record.examSkills,
      record.causeStudyPointIds, record.effectStudyPointIds, record.relatedStudyPointIds,
      record.connectionNotes, record.keyPeople, record.keyTerms, record.evidence, record.source]) {
      assert.ok(Object.isFrozen(nested), `${record.id} nested field must be frozen`);
    }
    assert.ok(record.keyPeople.every(Object.isFrozen));
    assert.ok(record.keyTerms.every(Object.isFrozen));
  }
});

test('provides defensive lookups, canonical identity, null cards, and a locked global', () => {
  for (const record of api.records) assert.equal(api.getById(record.id), record);
  const lisbon = api.getByLocation(42);
  lisbon.pop();
  assert.equal(api.getByLocation('42').length, 3);
  for (const unknown of [null, undefined, '', '999', 'toString', '__proto__']) {
    assert.equal(api.getById(unknown), null);
    assert.deepEqual(api.getByLocation(unknown), []);
    assert.equal(api.locationName(unknown), null);
    assert.equal(api.getUnitCard(unknown), null);
  }
  assert.deepEqual(api.unitCards, {});
  assert.ok(Object.isFrozen(api) && Object.isFrozen(api.records)
    && Object.isFrozen(api.locationNumbers) && Object.isFrozen(api.unitCards));
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'APWH_U4_LOCATION_STUDY');
  assert.deepEqual({ configurable: descriptor.configurable, enumerable: descriptor.enumerable, writable: descriptor.writable },
    { configurable: false, enumerable: true, writable: false });
});

test('compareRecords orders by sequence, start, end, then ID', () => {
  const records = [
    { id: 'z', sequence: 2, startYear: 1500, endYear: 1600 },
    { id: 'a', sequence: 2, startYear: 1500, endYear: 1600 },
    { id: 'end', sequence: 2, startYear: 1500, endYear: 1550 },
    { id: 'start', sequence: 2, startYear: 1400, endYear: 1700 },
    { id: 'first', sequence: 1, startYear: 1700, endYear: 1750 },
  ];
  assert.deepEqual([...records].sort(api.compareRecords).map(record => record.id),
    ['first', 'start', 'end', 'a', 'z']);
});

test('refuses to overwrite the Unit 4 global', () => {
  assert.throws(() => runInNewContext(dataModuleSource, { APWH_U4_LOCATION_STUDY: {} }), error => {
    assert.equal(error.message,
      'Invalid Unit 4 global APWH_U4_LOCATION_STUDY: refusing to overwrite existing value');
    return true;
  });
});

const firstId = 'apwh-u4-lisbon-atlantic-constraints';
const manifestInsertion = '  ];\n\n  validateManifestRows(STUDY_MANIFEST);';
const rawInsertion = '  ];\n\n  validateRawRecords();';

test('rejects invalid locations, sequences, main events, and a fourth location record', () => {
  const cases = [
    ['invalid location', "STUDY_MANIFEST[0][1] = '999';", firstId, 'invalid locationNumber 999'],
    ['invalid sequence', 'STUDY_MANIFEST[0][2] = 4;', firstId, 'invalid sequence 4'],
    ['duplicate sequence', 'STUDY_MANIFEST[1][2] = 1;', firstId, 'duplicate sequence 1 at location 42'],
    ['invalid main event', "STUDY_MANIFEST[0][7] = 'world-event-42-9';", firstId, 'invalid mainEventKey world-event-42-9'],
    ['wrong bound main event', "STUDY_MANIFEST[0][7] = 'world-event-2-2';", firstId, 'invalid mainEventKey world-event-2-2 for location 42'],
    ['fourth record', "STUDY_MANIFEST[23][1] = '42'; STUDY_MANIFEST[23][7] = 'world-event-42-0';", firstId, 'location 42 must contain exactly three records'],
  ];
  for (const [label, injection, id, rule] of cases) {
    const malformed = replaceSource(label, manifestInsertion,
      `  ];\n  ${injection}\n\n  validateManifestRows(STUDY_MANIFEST);`);
    assertModuleError(label, malformed, `Invalid Unit 4 study record ${id}: ${rule}`);
  }
});

test('rejects missing, invalid, duplicate, and oversized taxonomy arrays', () => {
  const cases = [
    ['missing topic', 'STUDY_MANIFEST[0][8] = [];', 'missing topicCodes'],
    ['invalid topic', "STUDY_MANIFEST[0][8] = ['4.9'];", 'invalid topicCode 4.9'],
    ['duplicate topic', "STUDY_MANIFEST[0][8] = ['4.1', '4.1'];", 'duplicate topicCode 4.1'],
    ['missing theme', 'STUDY_MANIFEST[0][9] = [];', 'missing themeIds'],
    ['invalid theme', "STUDY_MANIFEST[0][9] = ['BAD'];", 'invalid themeId BAD'],
    ['duplicate theme', "STUDY_MANIFEST[0][9] = ['GOV', 'GOV'];", 'duplicate themeId GOV'],
    ['missing skill', 'STUDY_MANIFEST[0][10] = [];', 'missing examSkills'],
    ['invalid skill', "STUDY_MANIFEST[0][10] = ['Argumentation'];", 'invalid examSkill Argumentation'],
    ['duplicate skill', "STUDY_MANIFEST[0][10] = ['Causation', 'Causation'];", 'duplicate examSkill Causation'],
    ['oversized skill', "STUDY_MANIFEST[0][10] = ['Causation', 'CCOT', 'Comparison'];", 'too many examSkills'],
  ];
  for (const [label, injection, rule] of cases) {
    const malformed = replaceSource(label, manifestInsertion,
      `  ];\n  ${injection}\n\n  validateManifestRows(STUDY_MANIFEST);`);
    assertModuleError(label, malformed, `Invalid Unit 4 study record ${firstId}: ${rule}`);
  }
});

test('rejects malformed manifest rows and non-array taxonomy values', () => {
  const cases = [
    ['null manifest', 'STUDY_MANIFEST[0] = null;', '(missing ID)', 'manifest row must be an eleven-field array'],
    ['short manifest', `STUDY_MANIFEST[0] = ['${firstId}'];`, firstId, 'manifest row must be an eleven-field array'],
    ['topic scalar', "STUDY_MANIFEST[0][8] = '4.1';", firstId, 'topicCodes must be an array'],
    ['theme scalar', "STUDY_MANIFEST[0][9] = 'ENV';", firstId, 'themeIds must be an array'],
    ['skill scalar', "STUDY_MANIFEST[0][10] = 'Causation';", firstId, 'examSkills must be an array'],
  ];
  for (const [label, injection, id, rule] of cases) {
    const malformed = replaceSource(label, manifestInsertion,
      `  ];\n  ${injection}\n\n  validateManifestRows(STUDY_MANIFEST);`);
    assertModuleError(label, malformed, `Invalid Unit 4 study record ${id}: ${rule}`);
  }
});

test('rejects malformed dates, ranges, and label-range mismatches', () => {
  const cases = [
    ['bad label', [["'1400s', 1400, 1499", "'1400/1499', 1400, 1499"], ["dateLabel: '1400s'", "dateLabel: '1400/1499'"]], 'invalid dateLabel 1400/1499'],
    ['noninteger start', [["'1400s', 1400, 1499", "'1400s', '1400', 1499"], ['startYear: 1400', "startYear: '1400'"]], 'startYear must be an integer'],
    ['noninteger end', [["'1400s', 1400, 1499", "'1400s', 1400, '1499'"], ['endYear: 1499', "endYear: '1499'"]], 'endYear must be an integer'],
    ['reversed range', [["'1400s', 1400, 1499", "'1400s', 1500, 1499"], ['startYear: 1400', 'startYear: 1500']], 'startYear 1500 exceeds endYear 1499'],
    ['label mismatch', [["'1400s', 1400, 1499", "'1400s', 1401, 1499"], ['startYear: 1400', 'startYear: 1401']], 'dateLabel years 1400–1499 do not match startYear 1401 and endYear 1499'],
  ];
  for (const [label, replacements, rule] of cases) {
    assertModuleError(label, replaceSources(label, replacements),
      `Invalid Unit 4 study record ${firstId}: ${rule}`);
  }
});

test('rejects duplicate, malformed, and wrong-prefix IDs', () => {
  const duplicate = replaceSource('duplicate raw ID',
    "id: 'apwh-u4-lisbon-navigation-state-sponsorship',",
    "id: 'apwh-u4-lisbon-atlantic-constraints',");
  assertModuleError('duplicate raw ID', duplicate,
    `Invalid Unit 4 study record ${firstId}: duplicate record ID`);
  for (const [replacement, rule] of [
    ['apwh-u3-lisbon-atlantic-constraints', 'invalid stable ID apwh-u3-lisbon-atlantic-constraints'],
    ['apwh-u4-Lisbon bad', 'invalid stable ID apwh-u4-Lisbon bad'],
  ]) {
    const malformed = replaceAllSource(rule, firstId, replacement);
    assertModuleError(rule, malformed, `Invalid Unit 4 study record ${replacement}: ${rule}`);
  }
});

test('rejects non-English, incomplete, and malformed learner content', () => {
  const cases = [
    ['non-English summary', "summary: 'Portugal faced", "summary: '中文 Portugal faced", 'non-English summary'],
    ['short significance', "significance: \"Portugal's Atlantic position, Iberian limits, and primogeniture encouraged overseas routes, but geography created incentives rather than making expansion inevitable.\"", "significance: 'Too short.'", 'significance is too short'],
    ['short exam connection', "examConnection: 'Use these constraints as contextual causes, while qualifying the claim: political choices, finance, and technology were also necessary.'", "examConnection: 'Too short.'", 'examConnection is too short'],
    ['non-English evidence', "'Castile and Aragon occupied", "'中文 Castile and Aragon occupied", 'non-English nested learner content'],
    ['numeric evidence', "'Castile and Aragon occupied much of the neighboring Iberian land frontier available to Portuguese expansion.'", "'12345.'", 'non-English nested learner content'],
    ['wrong source', "id: 'amsco-apwh-u4'", "id: 'other-source'", 'invalid source id other-source'],
    ['bad source locator', "locator: 'AMSCO AP World History, Unit 4, Topics 4.1 and 4.2'", "locator: 'Unit 4'", 'invalid source locator Unit 4'],
    ['extra source field', "locator: 'AMSCO AP World History, Unit 4, Topics 4.1 and 4.2' }", "locator: 'AMSCO AP World History, Unit 4, Topics 4.1 and 4.2', edition: 'extra' }", 'source must contain exactly id and locator fields'],
  ];
  for (const [label, search, replacement, rule] of cases) {
    assertModuleError(label, replaceSource(label, search, replacement),
      `Invalid Unit 4 study record ${firstId}: ${rule}`);
  }
});

test('rejects malformed actor, term, evidence, source, and raw record structures', () => {
  const cases = [
    ['null raw', 'RAW_RECORDS[0] = null;', '(missing ID)', 'record must be a non-null plain object'],
    ['scalar raw', 'RAW_RECORDS[0] = 42;', '(missing ID)', 'record must be a non-null plain object'],
    ['bad actor', "RAW_RECORDS[0].keyPeople = [{ role: 'English role' }];", firstId, 'keyPeople entry must contain exactly name and role fields'],
    ['null actor', 'RAW_RECORDS[0].keyPeople = [null];', firstId, 'invalid keyPeople entry'],
    ['missing actors', 'RAW_RECORDS[0].keyPeople = [];', firstId, 'missing keyPeople'],
    ['one term', 'RAW_RECORDS[0].keyTerms.pop();', firstId, 'missing keyTerms'],
    ['bad term', "RAW_RECORDS[0].keyTerms = [{ term: 'one' }, { term: 'two', explanation: 'English explanation' }];", firstId, 'keyTerms entry must contain exactly term and explanation fields'],
    ['one evidence', 'RAW_RECORDS[0].evidence.pop();', firstId, 'missing evidence'],
    ['bad evidence shape', "RAW_RECORDS[0].evidence = 'English evidence';", firstId, 'missing evidence'],
    ['bad source', 'RAW_RECORDS[0].source = null;', firstId, 'invalid source structure'],
  ];
  for (const [label, injection, id, rule] of cases) {
    const malformed = replaceSource(label, rawInsertion,
      `  ];\n  ${injection}\n\n  validateRawRecords();`);
    assertModuleError(label, malformed, `Invalid Unit 4 study record ${id}: ${rule}`);
  }
});

test('rejects extra or missing records and invalid canonical locations', () => {
  for (const [label, injection, id, rule] of [
    ['missing record', 'RAW_RECORDS.pop();', '(missing record)', 'expected exactly 24 records'],
    ['extra record', "RAW_RECORDS.push({ id: 'apwh-u4-extra-record' });", 'apwh-u4-extra-record', 'expected exactly 24 records'],
  ]) {
    const malformed = replaceSource(label, rawInsertion,
      `  ];\n  ${injection}\n\n  validateRawRecords();`);
    assertModuleError(label, malformed, `Invalid Unit 4 study record ${id}: ${rule}`);
  }
  assertModuleError('invalid canonical location',
    replaceSource('invalid canonical location', "'42': 'Maritime Portugal · Lisbon'", "'999': 'Maritime Portugal · Lisbon'"),
    'Invalid Unit 4 study locations: expected exactly 42,2,68,57,60,87,12,49');
});
