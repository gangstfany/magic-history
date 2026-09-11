import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const moduleUrl = new URL('../data/apwh-u6-location-study.js', import.meta.url);
const dataModuleSource = existsSync(moduleUrl) ? readFileSync(moduleUrl, 'utf8') : '';
const evaluateSandbox = (source = dataModuleSource, seed = {}) => {
  const sandbox = { ...seed };
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox);
  return sandbox;
};
const evaluate = (source = dataModuleSource, seed = {}) => evaluateSandbox(source, seed).APWH_U6_LOCATION_STUDY;

const expectedLocations = new Map([
  ['29', 'Imperial Partition · Berlin'],
  ['89', 'British West Africa · Lagos'],
  ['91', 'Congo Free State · Kinshasa'],
  ['6', 'British India · Delhi'],
  ['15', 'Opium Wars · Canton / Guangzhou'],
  ['80', 'Ethiopian Resistance · Adwa'],
  ['88', 'Suez Canal · Suez'],
  ['67', 'Indigenous Displacement · Wounded Knee'],
  ['53', 'Argentina: Export Economy & Migration · Buenos Aires'],
  ['70', 'Chinese Migration & Exclusion · San Francisco'],
]);
const expectedBindings = new Map([
  ['29','world-event-29-1'],['89','world-event-89-0'],['91','world-event-91-0'],['6','world-event-6-2'],['15','world-event-15-0'],
  ['80','world-event-80-0'],['88','world-event-88-0'],['67','world-event-67-0'],['53','world-event-53-1'],['70','world-event-70-0'],
]);

const expectedManifest = [
['apwh-u6-berlin-industrial-rivalry-rationales','29',1,'Industrial Rivalry and Imperial Rationales','1800s–1884',1800,1884,'world-event-29-1',['6.1','6.8'],['ECN','GOV','CDI'],['Contextualization','Causation']],
['apwh-u6-berlin-conference-effective-occupation','29',2,'Berlin Conference and Effective Occupation','1884–1885',1884,1885,'world-event-29-1',['6.2'],['GOV'],['Causation']],
['apwh-u6-berlin-borders-rivalry-consequences','29',3,'Artificial Borders and Imperial Rivalry','1885–1900',1885,1900,'world-event-29-1',['6.2','6.8'],['GOV','CDI'],['Causation','CCOT']],
['apwh-u6-lagos-industrial-palm-oil-demand','89',1,'Industrial Demand for Palm Oil','1800s',1800,1900,'world-event-89-0',['6.1','6.4'],['ECN','TEC'],['Causation','Contextualization']],
['apwh-u6-lagos-treaty-trade-political-control','89',2,'From Trade Treaty to Political Control','1870s–1880s',1870,1885,'world-event-89-0',['6.2','6.5'],['GOV','ECN'],['Causation']],
['apwh-u6-lagos-export-economy-dependence','89',3,'Export Economy and Colonial Dependence','1800s–1900',1800,1900,'world-event-89-0',['6.4','6.5'],['ECN'],['Causation','CCOT']],
['apwh-u6-congo-quinine-steamship-access','91',1,'Quinine, Steamships, and Inland Access','1850–1880',1850,1880,'world-event-91-0',['6.2'],['TEC','ENV'],['Causation','Contextualization']],
['apwh-u6-congo-leopold-private-colony','91',2,"Leopold's Private Colony",'1885–1908',1885,1908,'world-event-91-0',['6.1','6.2'],['GOV','ECN'],['Causation']],
['apwh-u6-congo-forced-rubber-demographic-catastrophe','91',3,'Forced Rubber Labor and Demographic Catastrophe','1885–1908',1885,1908,'world-event-91-0',['6.4','6.5'],['ECN','SIO'],['Causation','CCOT']],
['apwh-u6-delhi-company-rule-rebellion','6',1,'Company Rule and the 1857 Rebellion','1757–1858',1757,1858,'world-event-6-2',['6.2','6.3'],['GOV','CDI'],['Contextualization','Causation']],
['apwh-u6-delhi-crown-rule-economic-restructuring','6',2,'Crown Rule and Economic Restructuring','1858–1900',1858,1900,'world-event-6-2',['6.4','6.5'],['GOV','ECN'],['Causation']],
['apwh-u6-delhi-indenture-labor-migration','6',3,'Indenture and Indian Ocean Labor Migration','1830s–1900',1830,1900,'world-event-6-2',['6.6','6.7'],['ECN','SIO'],['Causation','Comparison']],
['apwh-u6-guangzhou-trade-imbalance-opium','15',1,'Trade Imbalance and the Opium System','1700s–1839',1700,1839,'world-event-15-0',['6.5'],['ECN'],['Contextualization','Causation']],
['apwh-u6-guangzhou-opium-war-unequal-treaty','15',2,'Gunboat War and Unequal Treaties','1839–1860',1839,1860,'world-event-15-0',['6.2','6.5'],['GOV','TEC','ECN'],['Causation']],
['apwh-u6-guangzhou-treaty-ports-spheres','15',3,'Treaty Ports and Spheres of Influence','1842–1900',1842,1900,'world-event-15-0',['6.5','6.8'],['GOV','ECN'],['Causation','CCOT']],
['apwh-u6-adwa-italian-expansion-pressure','80',1,'Italian Expansion and Ethiopian Pressure','1880s–1895',1880,1895,'world-event-80-0',['6.1','6.2'],['GOV','CDI'],['Contextualization','Causation']],
['apwh-u6-adwa-ethiopian-military-resistance','80',2,'Organized Ethiopian Military Resistance','1895–1896',1895,1896,'world-event-80-0',['6.3'],['GOV','CDI'],['Causation']],
['apwh-u6-adwa-independence-comparative-outcome','80',3,'Independence and Comparative Outcomes','1896–1900',1896,1900,'world-event-80-0',['6.3','6.8'],['GOV'],['Comparison','CCOT']],
['apwh-u6-suez-industrial-trade-route','88',1,'Industrial Trade and the Shorter Route','1850s–1869',1850,1869,'world-event-88-0',['6.1','6.4'],['ECN','TEC'],['Causation','Contextualization']],
['apwh-u6-suez-canal-labor-construction','88',2,'Canal Construction and Egyptian Labor','1859–1869',1859,1869,'world-event-88-0',['6.2','6.4'],['TEC','SIO','ECN'],['Causation']],
['apwh-u6-suez-debt-strategic-control','88',3,'Debt and British Strategic Control','1870s–1882',1870,1882,'world-event-88-0',['6.2','6.5'],['GOV','ECN'],['Causation','CCOT']],
['apwh-u6-wounded-knee-settler-land-expansion','67',1,'Settler Expansion and Indigenous Land Loss','1830s–1890',1830,1890,'world-event-67-0',['6.2'],['GOV','ENV'],['Contextualization','Causation']],
['apwh-u6-wounded-knee-ghost-dance-resistance','67',2,'Ghost Dance as Cultural Resistance','1889–1890',1889,1890,'world-event-67-0',['6.3'],['CDI','SIO'],['Causation']],
['apwh-u6-wounded-knee-massacre-dispossession','67',3,'Massacre and Consolidated Dispossession','1890',1890,1890,'world-event-67-0',['6.3','6.8'],['GOV','SIO'],['Causation','CCOT']],
['apwh-u6-buenos-aires-export-growth-labor-demand','53',1,'Export Growth and Labor Demand','1850s–1880s',1850,1880,'world-event-53-1',['6.4','6.6'],['ECN'],['Causation','Contextualization']],
['apwh-u6-buenos-aires-european-migration','53',2,'European Migration to Argentina','1880s–1909',1880,1909,'world-event-53-1',['6.6'],['ECN','SIO'],['Causation']],
['apwh-u6-buenos-aires-urban-growth-land-inequality','53',3,'Urban Growth and Unequal Landholding','1880s–1900s',1880,1900,'world-event-53-1',['6.7'],['ECN','SIO'],['Causation','CCOT']],
['apwh-u6-san-francisco-railroad-labor-demand','70',1,'Railroad Labor Demand in the American West','1860s–1869',1860,1869,'world-event-70-0',['6.6'],['ECN','TEC'],['Contextualization','Causation']],
['apwh-u6-san-francisco-chinese-migration-community','70',2,'Chinese Migration and Community Formation','1850s–1880s',1850,1880,'world-event-70-0',['6.6','6.7'],['SIO','ECN'],['Causation']],
['apwh-u6-san-francisco-exclusion-racialization','70',3,'Exclusion and the Racialization of Labor','1870s–1882',1870,1882,'world-event-70-0',['6.7'],['GOV','SIO'],['Causation','CCOT']],
];

const P = (id, summary, significance, person, role, term, explanation, evidence, examConnection, locator) => ({
  id, summary, significance, keyPeople:[{name:person,role}], keyTerms:[{term,explanation}], evidence, examConnection,
  source:{id:'amsco-apwh-u6',locator},
});
const expectedRecordContent = [
P('apwh-u6-berlin-industrial-rivalry-rationales','Industrial production increased demand for resources and markets while nationalism made colonies symbols of state power.','Economic pressure, national prestige, and interstate rivalry interacted; no single rationale alone explains imperial expansion.','Industrial states and imperial advocates','Linked factory needs and national competition to overseas claims.','imperialism','A policy of extending political, economic, or military control over other societies.',['Factories required recurring supplies of raw materials and dependable markets.','Newly unified and established states treated colonies as measures of national strength.'],'Build a multicausal argument connecting industrial demand, nationalism, and rivalry.','AMSCO AP World History, Unit 6, Topics 6.1 and 6.8'),
P('apwh-u6-berlin-conference-effective-occupation','Bismarck convened European powers at Berlin to regulate their competition over African claims.','The conference set rules for European recognition of occupation, but it neither included Africans nor instantly completed every conquest.','Otto von Bismarck and European delegates','Bismarck chaired negotiations among imperial powers; no African representatives participated.','effective occupation','The principle that a claimant needed actual authority in a territory for other powers to recognize its claim.',['The Berlin Conference met in 1884 and 1885.','Delegates regulated European claims and river access without inviting Africans.'],'Explain how diplomacy managed European rivalry while excluding African sovereignty.','AMSCO AP World History, Unit 6, Topic 6.2'),
P('apwh-u6-berlin-borders-rivalry-consequences','European partition drew boundaries around imperial claims with little regard for African political or cultural geography.','Artificial borders divided some communities and joined rivals, creating durable tensions while European competition continued after Berlin.','European colonial officials and African communities','Officials imposed borders; communities experienced division, forced combination, and resistance.','artificial borders','Colonial boundaries drawn without primary regard for existing communities or political relationships.',['Some colonial lines separated members of the same cultural community.','Other borders placed historically rival groups under one colonial administration.'],'Trace both continuity in imperial rivalry and long-term consequences of imposed borders.','AMSCO AP World History, Unit 6, Topics 6.2 and 6.8'),
P('apwh-u6-lagos-industrial-palm-oil-demand','British factories demanded West African palm oil to lubricate machinery and manufacture goods.','Industrial demand connected local producers and merchants to an expanding export trade rather than making Europeans the only economic actors.','West African producers and British manufacturers','Producers supplied palm oil while manufacturers created sustained industrial demand.','palm oil trade','The export exchange linking West African oil-palm production to industrial uses overseas.',['Palm oil helped keep textile machinery from rusting.','West African societies had produced and traded palm products long before colonial rule.'],'Connect factory demand to export growth while preserving African economic agency.','AMSCO AP World History, Unit 6, Topics 6.1 and 6.4'),
P('apwh-u6-lagos-treaty-trade-political-control','African rulers used treaties to manage trade, but intensifying imperial competition made negotiated protections easier for Britain to disregard.','The shift from trade agreement to political control narrowed local agency; it was not a story of passive African acceptance.','King Jaja of Opobo and British officials','Jaja negotiated favorable trade terms before British expansion undermined his authority.','treaty expansion','The use of agreements as an opening for influence that could later become territorial control.',['Britain recognized King Jaja as ruler in an 1873 trade treaty.','Lagos became a crown colony and a base for wider British expansion in present-day Nigeria.'],'Show how local diplomacy operated before coercive imperial control narrowed its options.','AMSCO AP World History, Unit 6, Topics 6.2 and 6.5'),
P('apwh-u6-lagos-export-economy-dependence','Colonial rule oriented production and transport toward a narrow range of exports such as palm products.','Export dependence exposed producers and governments to foreign demand and prices, but Africans still bargained, adapted, and resisted.','African farmers, merchants, and colonial officials','Produced and traded exports within rules increasingly shaped by colonial power.','export dependence','Reliance on a small set of commodities sold into markets whose terms are set elsewhere.',['Colonial transport favored routes carrying export crops to ports.','Changes in overseas prices could sharply affect local incomes and public revenue.'],'Explain dependence as a structure of unequal terms rather than a claim that Africans lacked agency.','AMSCO AP World History, Unit 6, Topics 6.4 and 6.5'),
P('apwh-u6-congo-quinine-steamship-access','Quinine reduced malaria risk while more efficient steamships made longer inland river travel practical.','Together these technologies lowered environmental and transport barriers that had kept most Europeans near African coasts.','European explorers, merchants, and African river communities','Used or confronted technologies that increased foreign access to the Congo interior.','quinine','A medicine used to prevent or treat malaria, reducing a major danger for outsiders in tropical regions.',['Quinine lowered the health risks Europeans faced in malaria regions.','Improved steam engines made river travel over longer distances more practical after about 1870.'],'Explain technology as an enabling condition, not a sufficient cause of conquest.','AMSCO AP World History, Unit 6, Topic 6.2'),
P('apwh-u6-congo-leopold-private-colony','Leopold II created and personally controlled the Congo Free State after Belgium declined to lead his project.','Before 1908 the territory was the king\'s private possession, not an ordinary Belgian state colony.','King Leopold II and Congolese communities','Leopold directed acquisition and extraction while Congolese people faced his private colonial regime.','Congo Free State','The central African territory personally owned and administered by Leopold II from 1885 to 1908.',['Leopold organized a private colonial claim in the Congo Basin.','Belgium took the territory from the king and made it a conventional colony in 1908.'],'Distinguish Leopold\'s personal ownership from later Belgian colonial government.','AMSCO AP World History, Unit 6, Topics 6.1 and 6.2'),
P('apwh-u6-congo-forced-rubber-demographic-catastrophe','Leopold\'s agents enforced rubber and ivory quotas through hostage-taking, beatings, mutilation, and killing.','Coercive extraction produced mass death and social disruption while transferring profits to a private royal regime.','Congolese laborers and Leopold\'s agents','Laborers resisted or endured quotas; agents used terror to compel production.','rubber quota','A required amount of rubber imposed on communities and enforced through violence.',['Agents held family members hostage to force workers to meet quotas.','Reports documented mutilated hands, killings, exhaustion, and millions of deaths.'],'Connect commodity demand to coercive labor and demographic catastrophe.','AMSCO AP World History, Unit 6, Topics 6.4 and 6.5'),
P('apwh-u6-delhi-company-rule-rebellion','East India Company expansion preceded Crown rule, and accumulated military, religious, and political grievances helped produce the 1857 rebellion.','The uprising was not caused only by rifle cartridges; it challenged Company authority through several interacting grievances.','Indian sepoys, rulers, civilians, and Company officials','Sepoys initiated mutiny while rulers and civilians joined a wider rebellion against Company power.','sepoy','An Indian soldier employed in a European-commanded colonial army.',['Cartridge rumors offended Hindu and Muslim religious practices.','Annexations, military grievances, and political displacement widened the rebellion.'],'Contextualize the transfer from Company to Crown through multiple causes of the 1857 revolt.','AMSCO AP World History, Unit 6, Topics 6.2 and 6.3'),
P('apwh-u6-delhi-crown-rule-economic-restructuring','After 1858 the British Crown expanded railways and cash-crop production under direct imperial rule.','Railways moved people as well as troops and exports, but investment priorities served imperial control and overseas markets.','British colonial officials and Indian farmers and workers','Officials directed infrastructure and revenue policy while Indians produced crops and used the new networks.','cash crop','A crop grown chiefly for sale rather than direct household consumption.',['Railways linked inland production to ports and accelerated troop movement.','Commercial cropping tied farmers more closely to taxes, credit, and global prices.'],'Evaluate infrastructure by identifying both local uses and imperial priorities.','AMSCO AP World History, Unit 6, Topics 6.4 and 6.5'),
P('apwh-u6-delhi-indenture-labor-migration','After slavery was abolished, recruiters moved Indian workers abroad under fixed-term labor contracts.','Indenture imposed severe constraints and abuse, but its legal contract and limited term were not identical to chattel slavery.','Indian indentured laborers and colonial recruiters','Workers crossed the Indian Ocean and beyond while recruiters supplied plantation labor.','indentured labor','Contract labor binding a worker to an employer for a stated period under specified terms.',['Indian workers traveled to plantations in the Caribbean, Africa, and Southeast Asia.','Contracts promised wages and an end date even when employers enforced them coercively.'],'Compare indenture with slavery without erasing differences in legal status or coercion.','AMSCO AP World History, Unit 6, Topics 6.6 and 6.7'),
P('apwh-u6-guangzhou-trade-imbalance-opium','Britain used opium produced in India to reverse the silver outflow created by British demand for Chinese goods.','The triangular trade converted imperial control in India into economic pressure on Qing China.','British merchants, Indian producers, and Qing officials','Merchants sold Indian opium while Qing officials tried to suppress the illegal trade.','trade imbalance','A persistent difference between the value of a country\'s imports and exports.',['British consumers bought tea, porcelain, and silk with silver.','Opium sales redirected silver out of China and toward British merchants.'],'Trace how Indian opium linked British imperial power to pressure on China.','AMSCO AP World History, Unit 6, Topic 6.5'),
P('apwh-u6-guangzhou-opium-war-unequal-treaty','Qing enforcement against opium prompted wars in which British industrial weapons and naval power prevailed.','Military disparity enabled Britain and other powers to impose unequal treaties and privileges on China.','Lin Zexu, Qing forces, and British forces','Lin suppressed opium imports; Qing and British forces fought over trade and sovereignty.','unequal treaty','An agreement imposed on a weaker state that grants one-sided commercial or legal privileges.',['Lin Zexu confiscated and destroyed imported opium at Canton in 1839.','British victory forced China to open ports and grant foreign advantages.'],'Connect industrial military power to coerced treaty concessions.','AMSCO AP World History, Unit 6, Topics 6.2 and 6.5'),
P('apwh-u6-guangzhou-treaty-ports-spheres','Treaty ports and spheres of influence gave foreign powers commercial and legal privileges without fully colonizing China.','Economic imperialism constrained Qing sovereignty through ports and concessions; Canton is the historical English name for Guangzhou.','Qing officials, foreign merchants, and treaty-port residents','Negotiated, imposed, or lived under the unequal rules governing foreign access.','sphere of influence','An area where an outside power claims privileged economic or political access without formal annexation.',['The Treaty of Nanjing opened designated ports to British trade.','Foreign privileges later included extraterritoriality and separate spheres of influence.'],'Distinguish indirect economic control from direct colonial rule and identify Canton as Guangzhou.','AMSCO AP World History, Unit 6, Topics 6.5 and 6.8'),
P('apwh-u6-adwa-italian-expansion-pressure','Italy sought an East African empire and treated a disputed treaty as support for a protectorate over Ethiopia.','Imperial pressure produced conflict, but Ethiopian state organization and diplomacy shaped the response.','Menelik II and Italian officials','Menelik rejected Italy\'s protectorate claim and prepared Ethiopia for war.','Treaty of Wuchale','An 1889 agreement whose Italian and Amharic versions differed over Ethiopian foreign relations.',['Italy interpreted its treaty text as establishing a protectorate.','Menelik acquired weapons and mobilized forces while pursuing diplomacy.'],'Contextualize resistance through both external pressure and Ethiopian state capacity.','AMSCO AP World History, Unit 6, Topics 6.1 and 6.2'),
P('apwh-u6-adwa-ethiopian-military-resistance','Menelik II assembled a large, supplied army that decisively defeated Italian forces at Adwa in 1896.','The battle demonstrates organized African military agency; the existing Timeline begins the campaign in 1895, but the decisive battle occurred in 1896.','Menelik II, Empress Taytu, and Ethiopian forces','Mobilized soldiers, supplies, intelligence, and leadership against the Italian invasion.','Battle of Adwa','The 1896 Ethiopian victory that halted Italy\'s attempt to conquer the country.',['Ethiopian forces outnumbered and encircled the Italian army at Adwa.','The decisive battle took place on March 1, 1896, after the 1895 campaign began.'],'Use the precise 1896 battle date while connecting it to the wider 1895–1896 war.','AMSCO AP World History, Unit 6, Topic 6.3'),
P('apwh-u6-adwa-independence-comparative-outcome','Victory at Adwa preserved Ethiopian independence and strengthened international recognition of Menelik\'s state.','Ethiopia was an exceptional successful resistance case, not proof that every African society defeated imperial conquest.','Menelik II and the Ethiopian state','Converted battlefield victory into recognized sovereignty and continued state consolidation.','retained independence','Continued political sovereignty despite attempted imperial conquest.',['Italy recognized Ethiopian independence after its defeat.','Most African territories still came under European rule by 1900.'],'Compare a successful resistance outcome with cases constrained by different military and political conditions.','AMSCO AP World History, Unit 6, Topics 6.3 and 6.8'),
P('apwh-u6-suez-industrial-trade-route','A canal across the Isthmus of Suez shortened the steamship route between Europe and Asia.','The route became valuable because industrial trade and imperial administration depended on faster, predictable transport.','Ferdinand de Lesseps, Egyptian rulers, and maritime merchants','A French-led company and Egyptian authorities developed the route used by international shipping.','Suez Canal','The waterway opened in 1869 between the Mediterranean and Red Seas.',['Ships could avoid the long voyage around southern Africa.','The canal accelerated travel between European ports and the Indian Ocean.'],'Connect transport time and industrial trade to the canal\'s strategic value.','AMSCO AP World History, Unit 6, Topics 6.1 and 6.4'),
P('apwh-u6-suez-canal-labor-construction','A French-led canal company relied heavily on Egyptian corvée labor during early construction.','The canal was not originally a British project; Egyptian labor and finance bore major costs before Britain gained control.','Egyptian corvée workers and the Suez Canal Company','Workers excavated the canal while the company directed construction.','corvée labor','Labor required by a government as a tax or public obligation.',['Large numbers of Egyptian peasants were compelled to dig sections of the canal.','The French-led Suez Canal Company opened the waterway in 1869.'],'Identify coerced Egyptian labor and avoid retroactively labeling construction British.','AMSCO AP World History, Unit 6, Topics 6.2 and 6.4'),
P('apwh-u6-suez-debt-strategic-control','Egyptian debt enabled Britain to buy canal shares and later occupy Egypt to protect the route to India.','Financial leverage and strategic occupation converted a multinational waterway into a central instrument of British imperial power.','Isma\'il Pasha, British investors, and British forces','Egyptian borrowing created vulnerability that British purchase and occupation exploited.','debt leverage','Influence gained when creditors use a borrower\'s financial dependence to shape control or policy.',['Britain purchased Egypt\'s canal shares in 1875.','British forces occupied Egypt in 1882 while emphasizing security of the route to India.'],'Explain the sequence from debt and shares to strategic military control.','AMSCO AP World History, Unit 6, Topics 6.2 and 6.5'),
P('apwh-u6-wounded-knee-settler-land-expansion','Settler expansion and federal removal, reservation, and allotment policies reduced Indigenous control of land.','Wounded Knee represents a wider continental process of dispossession rather than an isolated local dispute.','Indigenous nations, United States settlers, and federal officials','Native communities defended homelands while settlers and officials imposed territorial change.','allotment','The division of communally held Indigenous land into individual parcels, with remaining land opened to outsiders.',['Federal treaties and military campaigns confined many nations to reservations.','The Dawes Act divided reservation land and enabled further transfer to non-Native settlers.'],'Use Wounded Knee as an anchor for the broader settler-colonial process.','AMSCO AP World History, Unit 6, Topic 6.2'),
P('apwh-u6-wounded-knee-ghost-dance-resistance','The Ghost Dance promised spiritual renewal, restored relations, and the return of Indigenous lands and lifeways.','It was a religious and cultural resistance movement, not merely a military uprising, although officials treated it as a threat.','Wovoka and Indigenous Ghost Dance participants','Wovoka taught a renewal movement that communities adapted to their own circumstances.','Ghost Dance','A late nineteenth-century Indigenous religious movement centered on renewal and restoration.',['Dance and song carried the movement across a wide region.','Federal agents feared the movement as it spread among Lakota communities in 1890.'],'Explain cultural resistance on its own terms before analyzing the state response.','AMSCO AP World History, Unit 6, Topic 6.3'),
P('apwh-u6-wounded-knee-massacre-dispossession','United States troops killed Lakota men, women, and children at Wounded Knee in 1890.','The massacre violently suppressed a community amid a wider process of land loss and consolidated federal dominance.','Lakota families and the Seventh Cavalry','Lakota families were disarmed and surrounded before soldiers opened fire.','Wounded Knee Massacre','The 1890 killing of Lakota people by United States troops in South Dakota.',['Troops surrounded a Lakota camp during an attempted disarmament.','The dead included women and children as well as men.'],'Connect the massacre to broader dispossession without reducing the anchor to the whole process.','AMSCO AP World History, Unit 6, Topics 6.3 and 6.8'),
P('apwh-u6-buenos-aires-export-growth-labor-demand','Railways and overseas demand expanded Argentine exports of grain, meat, and other agricultural goods.','Export growth created labor demand in ports, cities, transport, and rural production while tying prosperity to world markets.','Argentine landowners, railway workers, and export merchants','Expanded commodity production and the networks carrying goods through Buenos Aires.','export economy','An economy organized substantially around producing commodities for sale abroad.',['Railways connected agricultural regions to the port of Buenos Aires.','Refrigerated shipping helped expand overseas meat exports.'],'Relate export infrastructure to labor demand and external market dependence.','AMSCO AP World History, Unit 6, Topics 6.4 and 6.6'),
P('apwh-u6-buenos-aires-european-migration','Argentina actively encouraged European immigration to supply labor and increase population after 1880.','Government policy and employment opportunities attracted migrants; the movement was not simply an unplanned demographic tide.','European migrants and Argentine officials','Migrants sought work while officials promoted settlement and labor recruitment.','push-pull factors','Conditions that encourage people to leave one place and attract them to another.',['Argentine policy promoted European immigration.','Many Italians and Spaniards entered through Buenos Aires and found urban or agricultural work.'],'Explain migration through interacting government, labor-demand, and migrant-choice causes.','AMSCO AP World History, Unit 6, Topic 6.6'),
P('apwh-u6-buenos-aires-urban-growth-land-inequality','Immigration and export commerce accelerated Buenos Aires urban growth while large estates remained concentrated.','Rapid growth created opportunity without universal prosperity because landholding and wealth stayed highly unequal.','Immigrant workers and latifundia owners','Workers built urban communities while large landowners retained disproportionate economic power.','latifundia','Large landed estates controlled by a small number of owners.',['Buenos Aires grew into a major immigrant and commercial metropolis.','Large estates limited broad access to rural land and its export profits.'],'Track urban change alongside continuity in unequal landholding.','AMSCO AP World History, Unit 6, Topic 6.7'),
P('apwh-u6-san-francisco-railroad-labor-demand','Western railroad construction recruited Chinese workers for dangerous and demanding jobs in the 1860s.','Industrial expansion created transpacific labor demand; Promontory provides rail evidence while San Francisco anchors the wider western process.','Chinese railroad workers and railroad companies','Workers supplied skilled labor while companies recruited a lower-paid workforce.','transcontinental railroad','A rail line linking the eastern and western United States.',['Chinese workers formed a large share of the Central Pacific workforce.','The rail lines met at Promontory, Utah, in 1869.'],'Use Promontory as supporting evidence without relocating the broader migration process from its San Francisco anchor.','AMSCO AP World History, Unit 6, Topic 6.6'),
P('apwh-u6-san-francisco-chinese-migration-community','Chinese migrants pursued work and built family, commercial, and mutual-aid networks in San Francisco and the wider West.','Migration produced durable communities rather than a temporary workforce limited to railroad camps.','Chinese migrants and community associations','Migrants established businesses, neighborhoods, and organizations for mutual support.','chain migration','Migration encouraged by information and assistance from people who moved earlier.',['San Francisco became a major center of Chinese American community life.','Associations helped newcomers find lodging, work, and social support.'],'Connect labor migration to community formation and cultural continuity.','AMSCO AP World History, Unit 6, Topics 6.6 and 6.7'),
P('apwh-u6-san-francisco-exclusion-racialization','Economic competition and racial politics turned Chinese workers into targets of violence, discrimination, and federal exclusion.','The Chinese Exclusion Act racialized labor policy and restricted a migrant group that western employers had previously recruited.','Chinese communities, anti-Chinese organizers, and federal lawmakers','Communities resisted exclusion while organizers and lawmakers converted prejudice into policy.','Chinese Exclusion Act','The 1882 United States law barring most Chinese labor immigration.',['Anti-Chinese campaigns blamed migrants for wage competition and economic insecurity.','Congress enacted the Chinese Exclusion Act in 1882.'],'Explain how economic claims and racial ideology interacted to produce exclusion.','AMSCO AP World History, Unit 6, Topic 6.7'),
];

const manifestOf = record => [record.id,record.locationNumber,record.sequence,record.title,record.dateLabel,record.startYear,record.endYear,record.mainEventKey,[...record.topicCodes],[...record.themeIds],[...record.examSkills]];
const contentOf = record => ({id:record.id,summary:record.summary,significance:record.significance,keyPeople:Array.from(record.keyPeople,value=>({...value})),keyTerms:Array.from(record.keyTerms,value=>({...value})),evidence:Array.from(record.evidence),examConnection:record.examConnection,source:{...record.source}});

test('publishes the exact ordered Unit 6 manifest and learner content', () => {
  assert.equal(existsSync(moduleUrl), true, 'Unit 6 data module must exist');
  const api=evaluate();
  assert.equal(api.unitId,'u6'); assert.equal(api.unitNumber,6); assert.equal(api.connectionTimelineMode,'main-event');
  assert.deepEqual([...api.locationNumbers],[...expectedLocations.keys()]);
  assert.equal(api.records.length,30);
  assert.deepEqual(Array.from(api.records,manifestOf),expectedManifest);
  assert.deepEqual(Array.from(api.records,contentOf),expectedRecordContent);
  for (const [number,name] of expectedLocations) assert.equal(api.locationName(number),name);
});

test('covers exact IDs, taxonomy, sequences, and canonical event bindings', () => {
  const api=evaluate();
  assert.equal(new Set(api.records.map(record=>record.id)).size,30);
  assert.ok(api.records.every(record=>/^apwh-u6-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id)));
  assert.deepEqual([...new Set(api.records.flatMap(record=>record.topicCodes))].sort(),['6.1','6.2','6.3','6.4','6.5','6.6','6.7','6.8']);
  assert.ok(api.records.flatMap(record=>record.themeIds).every(value=>['GOV','ECN','CDI','SIO','TEC','ENV'].includes(value)));
  assert.ok(api.records.flatMap(record=>record.examSkills).every(value=>['Causation','Comparison','CCOT','Contextualization'].includes(value)));
  for (const [number,event] of expectedBindings) {
    const records=api.getByLocation(number);
    assert.equal(records.length,3); assert.deepEqual(Array.from(records,record=>record.sequence),[1,2,3]);
    assert.ok(records.every(record=>record.mainEventKey===event));
  }
});

test('accepts approximate decade and century labels when numeric endpoints stay within their labeled intervals', () => {
  const api=evaluate();
  const pick=id=>api.getById(id);
  assert.deepEqual([pick('apwh-u6-lagos-industrial-palm-oil-demand').dateLabel,pick('apwh-u6-lagos-industrial-palm-oil-demand').startYear,pick('apwh-u6-lagos-industrial-palm-oil-demand').endYear],['1800s',1800,1900]);
  assert.deepEqual([pick('apwh-u6-lagos-treaty-trade-political-control').dateLabel,pick('apwh-u6-lagos-treaty-trade-political-control').startYear,pick('apwh-u6-lagos-treaty-trade-political-control').endYear],['1870s–1880s',1870,1885]);
  assert.deepEqual([pick('apwh-u6-buenos-aires-urban-growth-land-inequality').dateLabel,pick('apwh-u6-buenos-aires-urban-growth-land-inequality').startYear,pick('apwh-u6-buenos-aires-urban-growth-land-inequality').endYear],['1880s–1900s',1880,1900]);
});

test('matches the established API surface, descriptors, comparator, and lookup semantics', () => {
  const api=evaluate();
  assert.deepEqual(Object.keys(api).sort(),['compareRecords','connectionTimelineMode','getById','getByLocation','getUnitCard','locationName','locationNumbers','records','unitCards','unitId','unitNumber']);
  const rows=[{id:'z',sequence:2,startYear:1,endYear:1},{id:'z',sequence:1,startYear:3,endYear:1},{id:'z',sequence:1,startYear:2,endYear:3},{id:'z',sequence:1,startYear:2,endYear:2},{id:'a',sequence:1,startYear:2,endYear:2}];
  rows.sort(api.compareRecords);
  assert.deepEqual(rows.map(record=>[record.sequence,record.startYear,record.endYear,record.id]),[[1,2,2,'a'],[1,2,2,'z'],[1,2,3,'z'],[1,3,1,'z'],[2,1,1,'z']]);
  const first=api.records[0];
  assert.equal(api.getById(first.id),first); assert.equal(api.getById('missing'),null);
  assert.equal(api.locationName('missing'),null); assert.equal(api.getByLocation('missing').length,0);
  assert.notEqual(api.getByLocation('29'),api.getByLocation('29'));
  const copy=api.getByLocation('29'); copy.pop(); assert.equal(api.getByLocation('29').length,3);
  assert.deepEqual(JSON.parse(JSON.stringify(api.unitCards)),{}); assert.equal(api.getUnitCard('context'),null); assert.equal(api.getUnitCard(null),null);
});

test('deep-freezes all published records, graph containers, cards, and the global descriptor', () => {
  const sandbox=evaluateSandbox(); const api=sandbox.APWH_U6_LOCATION_STUDY;
  const descriptor=Object.getOwnPropertyDescriptor(sandbox,'APWH_U6_LOCATION_STUDY');
  assert.deepEqual({enumerable:descriptor.enumerable,configurable:descriptor.configurable,writable:descriptor.writable},{enumerable:true,configurable:false,writable:false});
  const seen=new Set();
  const assertDeepFrozen=value=>{ if (value===null||typeof value!=='object'||seen.has(value)) return; seen.add(value); assert.equal(Object.isFrozen(value),true); for (const key of Reflect.ownKeys(value)) assertDeepFrozen(value[key]); };
  assertDeepFrozen(api);
  for (const record of api.records) {
    assert.deepEqual([...record.causeStudyPointIds],[]); assert.deepEqual([...record.effectStudyPointIds],[]); assert.deepEqual([...record.relatedStudyPointIds],[]);
    assert.deepEqual({...record.connectionNotes},{});
  }
});

test('sorts every defensive location lookup with the shared comparator', () => {
  const malformed=dataModuleSource.replace("'apwh-u6-berlin-industrial-rivalry-rationales','29',1","'apwh-u6-berlin-industrial-rivalry-rationales','29',3").replace("'apwh-u6-berlin-borders-rivalry-consequences','29',3","'apwh-u6-berlin-borders-rivalry-consequences','29',1");
  assert.notEqual(malformed,dataModuleSource);
  assert.deepEqual(Array.from(evaluate(malformed).getByLocation('29'),record=>record.sequence),[1,2,3]);
});

test('refuses to overwrite an existing Unit 6 global', () => {
  assert.throws(()=>evaluate(dataModuleSource,{APWH_U6_LOCATION_STUDY:{sentinel:true}}),/Invalid Unit 6 global APWH_U6_LOCATION_STUDY: refusing to overwrite existing value/);
});

for (const [label,search,replacement,rule] of [
  ['extra location',"'70':'Chinese Migration & Exclusion · San Francisco',","'70':'Chinese Migration & Exclusion · San Francisco','999':'Extra Place',",/location registry must contain exactly the ordered locationNumbers/],
  ['empty location name',"'29':'Imperial Partition · Berlin'","'29':''",/location 29 must have a nonempty English name/],
  ['wrong canonical binding',"'29':'world-event-29-1'","'29':'world-event-29-9'",/location 29 has invalid main-event binding/],
]) test(`rejects ${label} in the location registry`,()=>{
  const malformed=dataModuleSource.replace(search,replacement); assert.notEqual(malformed,dataModuleSource,`${label} fixture mutation`);
  assert.throws(()=>evaluate(malformed),error=>{assert.match(error.message,/Invalid Unit 6/); assert.match(error.message,rule); return true;});
});

const mutateRecordInputs = (label, statement) => {
  const malformed=dataModuleSource.replace(/(\n\s*validateRecordInputShapes\(STUDY_MANIFEST,RAW_RECORDS\);)/,`\n  ${statement}$1`);
  assert.notEqual(malformed,dataModuleSource,`${label} fixture mutation`);
  return malformed;
};
const assertRecordInputRejected=(label,statement,message=/Invalid Unit 6/) => {
  const sandbox={}; sandbox.window=sandbox;
  assert.throws(()=>vm.runInNewContext(mutateRecordInputs(label,statement),sandbox),message);
  assert.equal(Object.hasOwn(sandbox,'APWH_U6_LOCATION_STUDY'),false);
};

const outerContainerCases=[
  ['manifest symbol',"STUDY_MANIFEST[Symbol('extra')]='English extra.';"],['manifest property',"STUDY_MANIFEST.extra='English extra.';"],['manifest hole','delete STUDY_MANIFEST[1];'],['manifest prototype','Object.setPrototypeOf(STUDY_MANIFEST,Object.create(Array.prototype));'],['manifest accessor',"{const value=STUDY_MANIFEST[0]; Object.defineProperty(STUDY_MANIFEST,'0',{enumerable:true,configurable:true,get(){return value;}});}"],
  ['raw symbol',"RAW_RECORDS[Symbol('extra')]='English extra.';"],['raw property',"RAW_RECORDS.extra='English extra.';"],['raw hole','delete RAW_RECORDS[1];'],['raw prototype','Object.setPrototypeOf(RAW_RECORDS,Object.create(Array.prototype));'],['raw accessor',"{const value=RAW_RECORDS[0]; Object.defineProperty(RAW_RECORDS,'0',{enumerable:true,configurable:true,get(){return value;}});}"],
];
for (const [label,statement] of outerContainerCases) test(`rejects ${label} outer-container shape`,()=>assertRecordInputRejected(label,statement));

for (const [label,statement] of [
  ['symbol',"STUDY_MANIFEST[0][Symbol('extra')]='English extra.';"],['property',"STUDY_MANIFEST[0].extra='English extra.';"],['accessor',"{const row=STUDY_MANIFEST[0],value=row[0]; Object.defineProperty(row,'0',{enumerable:true,configurable:true,get(){return value;}});}"],['hole','delete STUDY_MANIFEST[0][1];'],['prototype','Object.setPrototypeOf(STUDY_MANIFEST[0],Object.create(Array.prototype));'],
]) test(`rejects manifest-row ${label} shape`,()=>assertRecordInputRejected(`manifest row ${label}`,statement));

for (const [field,index] of [['topicCodes',8],['themeIds',9],['examSkills',10]]) {
  for (const [label,statement] of [['symbol',`STUDY_MANIFEST[0][${index}][Symbol('extra')]='English extra.';`],['property',`STUDY_MANIFEST[0][${index}].extra='English extra.';`],['accessor',`{const values=STUDY_MANIFEST[0][${index}],value=values[0]; Object.defineProperty(values,'0',{enumerable:true,configurable:true,get(){return value;}});}`],['hole',`delete STUDY_MANIFEST[0][${index}][0];`],['prototype',`Object.setPrototypeOf(STUDY_MANIFEST[0][${index}],Object.create(Array.prototype));`]]) {
    test(`rejects ${field} ${label} shape`,()=>assertRecordInputRejected(`${field} ${label}`,statement));
  }
}

for (const [label,statement] of [['symbol',"RAW_RECORDS[0][Symbol('extra')]={mutable:true};"],['accessor',"{const record=RAW_RECORDS[0],value=record.summary; Object.defineProperty(record,'summary',{enumerable:true,configurable:true,get(){return value;}});}"],['non-enumerable',"Object.defineProperty(RAW_RECORDS[0],'summary',{enumerable:false});"]]) {
  test(`rejects raw-record ${label} shape`,()=>assertRecordInputRejected(`raw record ${label}`,statement));
}
for (const field of ['keyPeople','keyTerms','evidence']) {
  for (const [label,statement] of [['property',`RAW_RECORDS[0].${field}.extra='English extra.';`],['symbol',`RAW_RECORDS[0].${field}[Symbol('extra')]='English extra.';`],['accessor',`{const values=RAW_RECORDS[0].${field},value=values[0]; Object.defineProperty(values,'0',{enumerable:true,configurable:true,get(){return value;}});}`],['hole',`delete RAW_RECORDS[0].${field}[0];`],['prototype',`Object.setPrototypeOf(RAW_RECORDS[0].${field},Object.create(Array.prototype));`]]) {
    test(`rejects ${field} array ${label} shape`,()=>assertRecordInputRejected(`${field} ${label}`,statement));
  }
}
for (const [field,key] of [['keyPeople','name'],['keyTerms','term'],['source','id']]) {
  const target=field==='source'?'RAW_RECORDS[0].source':`RAW_RECORDS[0].${field}[0]`;
  for (const [label,statement] of [['symbol',`${target}[Symbol('extra')]={mutable:true};`],['accessor',`{const value=${target}.${key}; Object.defineProperty(${target},'${key}',{enumerable:true,configurable:true,get(){return value;}});}`],['non-enumerable',`Object.defineProperty(${target},'${key}',{enumerable:false});`]]) {
    test(`rejects ${field} object ${label} shape`,()=>assertRecordInputRejected(`${field} object ${label}`,statement));
  }
}

const semanticMutations=[
  ['wrong location/main-event binding',"'world-event-29-1',['6.1','6.8']","'world-event-89-0',['6.1','6.8']",'apwh-u6-berlin-industrial-rivalry-rationales',/mainEventKey/],
  ['duplicate sequence',"'apwh-u6-berlin-conference-effective-occupation','29',2","'apwh-u6-berlin-conference-effective-occupation','29',1",'apwh-u6-berlin-conference-effective-occupation',/duplicate sequence/],
  ['duplicate ID',"['apwh-u6-berlin-conference-effective-occupation','29',2","['apwh-u6-berlin-industrial-rivalry-rationales','29',2",'apwh-u6-berlin-industrial-rivalry-rationales',/duplicate record ID/],
  ['malformed decade date',"'1800s–1884',1800,1884","'18000s–1884',1800,1884",'apwh-u6-berlin-industrial-rivalry-rationales',/invalid dateLabel/],
  ['malformed non-base approximate date',"'1800s–1884',1800,1884","'1801s–1884',1801,1884",'apwh-u6-berlin-industrial-rivalry-rationales',/invalid dateLabel/],
  ['date-label mismatch',"'1884–1885',1884,1885","'1884–1886',1884,1885",'apwh-u6-berlin-conference-effective-occupation',/do not match/],
  ['standalone approximate-label end mismatch',"'1800s',1800,1900","'1800s',1800,1901",'apwh-u6-lagos-industrial-palm-oil-demand',/do not match/],
  ['decade-label start mismatch',"'1850s–1869',1850,1869","'1850s–1869',1851,1869",'apwh-u6-suez-industrial-trade-route',/do not match/],
  ['decade-label end mismatch',"'1870s–1880s',1870,1885","'1870s–1880s',1870,1890",'apwh-u6-lagos-treaty-trade-political-control',/do not match/],
  ['missing topic',"['6.1','6.8'],['ECN','GOV','CDI']","[],['ECN','GOV','CDI']",'apwh-u6-berlin-industrial-rivalry-rationales',/missing topicCodes/],
  ['invalid topic',"['6.2'],['GOV'],['Causation']","['6.9'],['GOV'],['Causation']",'apwh-u6-berlin-conference-effective-occupation',/invalid topicCode/],
  ['duplicate topic',"['6.2','6.8'],['GOV','CDI']","['6.2','6.2'],['GOV','CDI']",'apwh-u6-berlin-borders-rivalry-consequences',/duplicate topicCode/],
  ['missing theme',"['ECN','GOV','CDI'],['Contextualization','Causation']","[],['Contextualization','Causation']",'apwh-u6-berlin-industrial-rivalry-rationales',/missing themeIds/],
  ['invalid theme',"['ECN','GOV','CDI'],['Contextualization','Causation']","['ECN','WAR','CDI'],['Contextualization','Causation']",'apwh-u6-berlin-industrial-rivalry-rationales',/invalid themeId/],
  ['duplicate theme',"['GOV'],['Causation']","['GOV','GOV'],['Causation']",'apwh-u6-berlin-conference-effective-occupation',/duplicate themeId/],
  ['missing skill',"['GOV'],['Causation']","['GOV'],[]",'apwh-u6-berlin-conference-effective-occupation',/missing examSkills/],
  ['invalid skill',"['ECN','GOV','CDI'],['Contextualization','Causation']","['ECN','GOV','CDI'],['Recall','Causation']",'apwh-u6-berlin-industrial-rivalry-rationales',/invalid examSkill/],
  ['duplicate skill',"['Causation','CCOT']]","['Causation','Causation']]",'apwh-u6-berlin-borders-rivalry-consequences',/duplicate examSkill/],
  ['empty content',"'Industrial production increased demand for resources and markets while nationalism made colonies symbols of state power.'","''",'apwh-u6-berlin-industrial-rivalry-rationales',/summary must be a nonempty string/],
  ['non-string content',"'Industrial production increased demand for resources and markets while nationalism made colonies symbols of state power.'",'42','apwh-u6-berlin-industrial-rivalry-rationales',/summary must be a nonempty string/],
  ['non-English content',"'Economic pressure, national prestige, and interstate rivalry interacted; no single rationale alone explains imperial expansion.'","'帝国主义'",'apwh-u6-berlin-industrial-rivalry-rationales',/non-English significance/],
  ['malformed actor',"'Industrial states and imperial advocates','Linked factory needs and national competition to overseas claims.'","'','Linked factory needs and national competition to overseas claims.'",'apwh-u6-berlin-industrial-rivalry-rationales',/keyPeople/],
  ['malformed term',"'imperialism','A policy of extending political, economic, or military control over other societies.'","'imperialism',''",'apwh-u6-berlin-industrial-rivalry-rationales',/keyTerms/],
  ['malformed evidence',"['Factories required recurring supplies of raw materials and dependable markets.','Newly unified and established states treated colonies as measures of national strength.']","['Only one statement.']",'apwh-u6-berlin-industrial-rivalry-rationales',/evidence/],
  ['malformed source',"source:{id:'amsco-apwh-u6',locator}","source:{id:'wrong-source',locator}",'apwh-u6-berlin-industrial-rivalry-rationales',/source/],
  ['fourth record',"['apwh-u6-berlin-borders-rivalry-consequences','29',3","['apwh-u6-berlin-extra-record','29',3,'Extra Record','1885',1885,1885,'world-event-29-1',['6.2'],['GOV'],['Causation']],\n['apwh-u6-berlin-borders-rivalry-consequences','29',3",'apwh-u6-berlin-borders-rivalry-consequences',/exactly three records/],
  ['null raw records','const RAW_RECORDS = [','const RAW_RECORDS = null; const UNUSED_RAW_RECORDS = [','(missing ID)',/raw records must be an array/],
];
for (const [label,search,replacement,id,rule] of semanticMutations) test(`rejects ${label}`,()=>{
  const malformed=dataModuleSource.replace(search,replacement); assert.notEqual(malformed,dataModuleSource,`${label} fixture mutation`);
  assert.throws(()=>evaluate(malformed),error=>{assert.match(error.message,/Invalid Unit 6/); assert.match(error.message,new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))); assert.match(error.message,rule); return true;});
});

const mutateConnections=(label,statement)=>{
  const malformed=dataModuleSource.replace(/(\n\s*validateConnectionShapes\(\);)/,`\n  ${statement}$1`);
  assert.notEqual(malformed,dataModuleSource,`${label} fixture mutation`); return malformed;
};
test('rejects unresolved, self, duplicate, malformed, and non-ordinary checkpoint graph data',()=>{
  const id='apwh-u6-berlin-industrial-rivalry-rationales';
  const cases=[
    [`CONNECTION_DATA.get('${id}').effectStudyPointIds.push('apwh-u6-missing');`,/unresolved connection apwh-u6-missing/],
    [`CONNECTION_DATA.get('${id}').effectStudyPointIds.push('${id}');`,/self connection/],
    [`CONNECTION_DATA.get('${id}').effectStudyPointIds.push('apwh-u6-berlin-conference-effective-occupation','apwh-u6-berlin-conference-effective-occupation');`,/duplicate connection/],
    [`CONNECTION_DATA.get('${id}').effectStudyPointIds.extra='English extra.';`,/effectStudyPointIds must be an ordinary dense array/],
    [`CONNECTION_DATA.get('${id}').effectStudyPointIds[Symbol('extra')]='English extra.';`,/effectStudyPointIds must be an ordinary dense array/],
    [`{const values=CONNECTION_DATA.get('${id}').effectStudyPointIds; Object.defineProperty(values,'0',{enumerable:true,configurable:true,get(){return 'apwh-u6-berlin-conference-effective-occupation';}});}`,/effectStudyPointIds must be an ordinary dense array/],
    [`{const values=CONNECTION_DATA.get('${id}').effectStudyPointIds; values.push('apwh-u6-berlin-conference-effective-occupation'); delete values[0];}`,/effectStudyPointIds must be an ordinary dense array/],
    [`Object.setPrototypeOf(CONNECTION_DATA.get('${id}').relatedStudyPointIds,Object.create(Array.prototype));`,/relatedStudyPointIds must be an ordinary dense array/],
    [`CONNECTION_DATA.get('${id}').connectionNotes[Symbol('extra')]='English note.';`,/extra connection note key Symbol\(extra\)/],
    [`Object.defineProperty(CONNECTION_DATA.get('${id}'),'connectionNotes',{enumerable:false});`,/malformed connection structure/],
    [`Object.setPrototypeOf(CONNECTION_DATA.get('${id}').connectionNotes,Object.create(Object.prototype));`,/connectionNotes must be a plain object/],
  ];
  for (const [statement,message] of cases) assert.throws(()=>evaluate(mutateConnections('bad graph',statement)),error=>{assert.match(error.message,/Invalid Unit 6/);assert.match(error.message,new RegExp(id));assert.match(error.message,message);return true;});
});

const mutateCards=(label,statement)=>{
  const malformed=dataModuleSource.replace(/(\n\s*validateUnitCards\(UNIT_CARD_LIST\);)/,`\n  ${statement}$1`);
  assert.notEqual(malformed,dataModuleSource,`${label} fixture mutation`); return malformed;
};
test('rejects null and non-ordinary checkpoint card containers',()=>{
  const cases=[['UNIT_CARD_LIST=null;',/cards must be an array/],["UNIT_CARD_LIST[Symbol('extra')]='English extra.';",/cards must be an ordinary dense array/],["UNIT_CARD_LIST.extra='English extra.';",/cards must be an ordinary dense array/],['Object.setPrototypeOf(UNIT_CARD_LIST,Object.create(Array.prototype));',/cards must be an ordinary dense array/],["Object.defineProperty(UNIT_CARD_LIST,'0',{enumerable:false,configurable:true,writable:true,value:{}});",/cards must be an ordinary dense array/]];
  for (const [statement,message] of cases) assert.throws(()=>evaluate(mutateCards('bad cards',statement)),error=>{assert.match(error.message,/Invalid Unit 6/);assert.match(error.message,message);return true;});
});
