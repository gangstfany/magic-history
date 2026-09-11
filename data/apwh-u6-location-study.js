(function publishUnit6LocationStudy(root) {
  'use strict';
  if (Object.prototype.hasOwnProperty.call(root, 'APWH_U6_LOCATION_STUDY')) {
    throw new Error('Invalid Unit 6 global APWH_U6_LOCATION_STUDY: refusing to overwrite existing value');
  }
  const UNIT_ID='u6';
  const UNIT_NUMBER=6;
  const VALID_TOPIC_CODES=new Set(['6.1','6.2','6.3','6.4','6.5','6.6','6.7','6.8']);
  const VALID_THEME_IDS=new Set(['GOV','ECN','CDI','SIO','TEC','ENV']);
  const VALID_EXAM_SKILLS=new Set(['Causation','Comparison','CCOT','Contextualization']);
  const LOCATION_NUMBERS=Object.freeze(['29','89','91','6','15','80','88','67','53','70']);
  const LOCATIONS=Object.freeze({
    '29':'Imperial Partition · Berlin','89':'British West Africa · Lagos','91':'Congo Free State · Kinshasa','6':'British India · Delhi',
    '15':'Opium Wars · Canton / Guangzhou','80':'Ethiopian Resistance · Adwa','88':'Suez Canal · Suez','67':'Indigenous Displacement · Wounded Knee',
    '53':'Argentina: Export Economy & Migration · Buenos Aires','70':'Chinese Migration & Exclusion · San Francisco',
  });
  const LOCATION_BINDINGS=Object.freeze({'29':'world-event-29-1','89':'world-event-89-0','91':'world-event-91-0','6':'world-event-6-2','15':'world-event-15-0','80':'world-event-80-0','88':'world-event-88-0','67':'world-event-67-0','53':'world-event-53-1','70':'world-event-70-0'});
  const CANONICAL_LOCATIONS=Object.freeze([
    ['29','Imperial Partition · Berlin','world-event-29-1'],['89','British West Africa · Lagos','world-event-89-0'],['91','Congo Free State · Kinshasa','world-event-91-0'],['6','British India · Delhi','world-event-6-2'],['15','Opium Wars · Canton / Guangzhou','world-event-15-0'],
    ['80','Ethiopian Resistance · Adwa','world-event-80-0'],['88','Suez Canal · Suez','world-event-88-0'],['67','Indigenous Displacement · Wounded Knee','world-event-67-0'],['53','Argentina: Export Economy & Migration · Buenos Aires','world-event-53-1'],['70','Chinese Migration & Exclusion · San Francisco','world-event-70-0'],
  ]);
  const STUDY_MANIFEST = [
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

  const P=(id,summary,significance,person,role,term,explanation,evidence,examConnection,locator)=>({
    id,summary,significance,keyPeople:[{name:person,role}],keyTerms:[{term,explanation}],evidence,examConnection,source:{id:'amsco-apwh-u6',locator},
  });
  const RAW_RECORDS = [
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

  let UNIT_CARD_LIST=[];
  let CONNECTION_DATA=new Map(STUDY_MANIFEST.map(([id])=>[id,{causeStudyPointIds:[],effectStudyPointIds:[],relatedStudyPointIds:[],connectionNotes:{}}]));

  const describe=value=>value===''?'""':String(value);
  const fail=(id,rule)=>{throw new Error(`Invalid Unit 6 study record ${id||'(missing ID)'}: ${rule}`);};
  const failCards=rule=>{throw new Error(`Invalid Unit 6 unit cards: ${rule}`);};
  const english=value=>{
    if (typeof value!=='string'||!value.trim()) return false;
    const letters=value.match(/\p{Letter}/gu)||[];
    return letters.length>0&&letters.every(letter=>/\p{Script=Latin}/u.test(letter));
  };
  const plainObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.getPrototypeOf(value)===Object.prototype;
  const ordinaryDataDescriptor=(descriptor,{enumerable,configurable,writable})=>descriptor!==undefined
    &&Object.prototype.hasOwnProperty.call(descriptor,'value')
    &&descriptor.enumerable===enumerable&&descriptor.configurable===configurable&&descriptor.writable===writable;
  const hasExactOwnEnumerableDataFields=(value,expectedKeys)=>{
    const descriptors=Object.getOwnPropertyDescriptors(value); const keys=Reflect.ownKeys(descriptors); const sorted=[...expectedKeys].sort();
    return keys.length===expectedKeys.length&&keys.every(key=>typeof key==='string')
      &&[...keys].sort().every((key,index)=>key===sorted[index])
      &&expectedKeys.every(key=>ordinaryDataDescriptor(descriptors[key],{enumerable:true,configurable:true,writable:true}));
  };
  const ordinaryDenseArray=value=>{
    if (!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype) return false;
    const descriptors=Object.getOwnPropertyDescriptors(value); const keys=Reflect.ownKeys(descriptors); const lengthDescriptor=descriptors.length;
    if (!ordinaryDataDescriptor(lengthDescriptor,{enumerable:false,configurable:false,writable:true})||!Number.isSafeInteger(lengthDescriptor.value)||lengthDescriptor.value<0) return false;
    const indexKeys=Array.from({length:lengthDescriptor.value},(_,index)=>String(index)); const expectedKeys=indexKeys.concat('length');
    return keys.length===expectedKeys.length&&keys.every(key=>typeof key==='string')&&expectedKeys.every(key=>Object.prototype.hasOwnProperty.call(descriptors,key))
      &&indexKeys.every(key=>ordinaryDataDescriptor(descriptors[key],{enumerable:true,configurable:true,writable:true}));
  };
  const ordinaryArrayValues=value=>{
    const descriptors=Object.getOwnPropertyDescriptors(value);
    return Array.from({length:descriptors.length.value},(_,index)=>descriptors[index].value);
  };
  const validateRecordInputShapes=(manifest,rawRecords)=>{
    if (!ordinaryDenseArray(manifest)) fail('(manifest)','manifest must be an ordinary dense array');
    const rows=ordinaryArrayValues(manifest);
    for (let index=0;index<rows.length;index+=1) {
      const row=rows[index];
      if (!ordinaryDenseArray(row)||Object.getOwnPropertyDescriptor(row,'length').value!==11) fail(`(manifest row ${index+1})`,'manifest row must be an ordinary dense eleven-field array');
      const rowValues=ordinaryArrayValues(row); const id=typeof rowValues[0]==='string'&&rowValues[0]?rowValues[0]:`(manifest row ${index+1})`;
      for (const [field,fieldIndex] of [['topicCodes',8],['themeIds',9],['examSkills',10]]) if (!ordinaryDenseArray(rowValues[fieldIndex])) fail(id,`${field} must be an ordinary dense array`);
    }
    if (!Array.isArray(rawRecords)) fail('(missing ID)','raw records must be an array');
    if (!ordinaryDenseArray(rawRecords)) fail('(missing ID)','raw records must be an ordinary dense array');
    const records=ordinaryArrayValues(rawRecords); const rawKeys=['evidence','examConnection','id','keyPeople','keyTerms','significance','source','summary'];
    for (let index=0;index<records.length;index+=1) {
      const record=records[index];
      if (!plainObject(record)||!hasExactOwnEnumerableDataFields(record,rawKeys)) fail(`(raw record ${index+1})`,'record must contain exactly the approved ordinary data fields');
      const descriptors=Object.getOwnPropertyDescriptors(record); const id=typeof descriptors.id.value==='string'&&descriptors.id.value?descriptors.id.value:`(raw record ${index+1})`;
      for (const field of ['keyPeople','keyTerms','evidence']) if (!ordinaryDenseArray(descriptors[field].value)) fail(id,`${field} must be an ordinary dense array`);
      for (const person of ordinaryArrayValues(descriptors.keyPeople.value)) {
        if (!plainObject(person)) fail(id,'keyPeople entry must be a plain object');
        if (!hasExactOwnEnumerableDataFields(person,['name','role'])) fail(id,'keyPeople entry must contain exactly name and role');
      }
      for (const term of ordinaryArrayValues(descriptors.keyTerms.value)) {
        if (!plainObject(term)) fail(id,'keyTerms entry must be a plain object');
        if (!hasExactOwnEnumerableDataFields(term,['term','explanation'])) fail(id,'keyTerms entry must contain exactly explanation and term');
      }
      const source=descriptors.source.value;
      if (!plainObject(source)) fail(id,'source must be a plain object');
      if (!hasExactOwnEnumerableDataFields(source,['id','locator'])) fail(id,'source must contain exactly id and locator');
    }
  };
  const validateLocations=()=>{
    const numbers=CANONICAL_LOCATIONS.map(entry=>entry[0]);
    if (LOCATION_NUMBERS.length!==numbers.length||LOCATION_NUMBERS.some((number,index)=>number!==numbers[index])) throw new Error('Invalid Unit 6 locations (locations): location registry must contain exactly the ordered locationNumbers');
    if (Object.keys(LOCATIONS).length!==numbers.length||Object.keys(LOCATION_BINDINGS).length!==numbers.length||numbers.some(number=>!Object.prototype.hasOwnProperty.call(LOCATIONS,number)||!Object.prototype.hasOwnProperty.call(LOCATION_BINDINGS,number))) throw new Error('Invalid Unit 6 locations (locations): location registry must contain exactly the ordered locationNumbers');
    for (const [number,name,binding] of CANONICAL_LOCATIONS) {
      if (!english(LOCATIONS[number])) throw new Error(`Invalid Unit 6 locations (locations): location ${number} must have a nonempty English name`);
      if (LOCATIONS[number]!==name) throw new Error(`Invalid Unit 6 locations (locations): location ${number} does not match its canonical name`);
      if (LOCATION_BINDINGS[number]!==binding) throw new Error(`Invalid Unit 6 locations (locations): location ${number} has invalid main-event binding`);
    }
  };
  const validateValues=(id,values,allowed,field,singular)=>{
    if (!Array.isArray(values)) fail(id,`${field} must be an array`);
    if (!values.length) fail(id,`missing ${field}`);
    const seen=new Set();
    for (const value of values) {
      if (!allowed.has(value)) fail(id,`invalid ${singular} ${describe(value)}`);
      if (seen.has(value)) fail(id,`duplicate ${singular} ${describe(value)}`);
      seen.add(value);
    }
  };
  const parseDateToken=token=>{
    const match=token.match(/^(\d{4})(s?)$/);
    if (!match||(match[2]==='s'&&!match[1].endsWith('0'))) return null;
    return {base:Number(match[1]),approximate:match[2]==='s'};
  };
  const validateDate=(id,label,start,end)=>{
    if (typeof label!=='string'||!/^(?:\d{4}|\d{3}0s)(?:–(?:\d{4}|\d{3}0s))?$/.test(label)) fail(id,`invalid dateLabel ${describe(label)}`);
    if (!Number.isInteger(start)||!Number.isInteger(end)||start>end) fail(id,'invalid startYear or endYear');
    const tokens=label.split('–').map(parseDateToken); const first=tokens[0]; const last=tokens.at(-1);
    let endMatches;
    if (tokens.length===1) {
      // Standalone Xs labels allow the conventional exclusive boundary after their natural decade or century.
      const conventionalExclusiveBoundary=first.base+(first.base%100===0?100:10);
      endMatches=first.approximate?end>=first.base&&end<=conventionalExclusiveBoundary:end===first.base;
    } else if (!last.approximate) {
      endMatches=end===last.base;
    } else {
      // In a range, matching hundred-based Xs endpoints use century scale; otherwise Xs denotes its decade.
      const firstUsesCenturyScale=first.approximate&&first.base%100===0&&last.base%100===0;
      const naturalIntervalEnd=last.base+(firstUsesCenturyScale?99:9);
      endMatches=end>=last.base&&end<=naturalIntervalEnd;
    }
    if (first.base!==start||!endMatches) fail(id,`dateLabel tokens ${label} do not match startYear ${start} and endYear ${end} under the approximate interval rule`);
  };
  const validateManifest=rows=>{
    if (!Array.isArray(rows)) fail('(missing ID)','manifest must be an array');
    for (const location of LOCATION_NUMBERS) {
      const local=rows.filter(row=>Array.isArray(row)&&row[1]===location);
      if (local.length!==3) fail(local.at(-1)?.[0]||`(location ${location})`,`location ${location} must contain exactly three records`);
    }
    const seen=new Set();
    for (const row of rows) {
      const id=Array.isArray(row)?row[0]:'(missing ID)';
      if (!Array.isArray(row)||row.length!==11) fail(id,'manifest row must contain eleven fields');
      const [recordId,location,sequence,title,label,start,end,event,topics,themes,skills]=row;
      if (typeof recordId!=='string'||!/^apwh-u6-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(recordId)) fail(recordId,'invalid stable ID');
      if (seen.has(recordId)) fail(recordId,'duplicate record ID'); seen.add(recordId);
      if (!LOCATION_NUMBERS.includes(location)) fail(recordId,`invalid locationNumber ${describe(location)}`);
      if (!Number.isInteger(sequence)||![1,2,3].includes(sequence)) fail(recordId,`invalid sequence ${describe(sequence)}`);
      if (!english(title)) fail(recordId,'invalid title');
      validateDate(recordId,label,start,end);
      if (event!==LOCATION_BINDINGS[location]) fail(recordId,`invalid mainEventKey ${describe(event)} for location ${location}`);
      validateValues(recordId,topics,VALID_TOPIC_CODES,'topicCodes','topicCode'); validateValues(recordId,themes,VALID_THEME_IDS,'themeIds','themeId'); validateValues(recordId,skills,VALID_EXAM_SKILLS,'examSkills','examSkill');
    }
    for (const location of LOCATION_NUMBERS) {
      const local=rows.filter(row=>row[1]===location); const sequences=local.map(row=>row[2]);
      const duplicate=sequences.findIndex((value,index)=>sequences.indexOf(value)!==index);
      if (duplicate!==-1) fail(local[duplicate][0],`duplicate sequence ${sequences[duplicate]} at location ${location}`);
    }
    if (rows.length!==30) fail(rows[30]?.[0]||'(missing ID)','expected exactly 30 records');
    const covered=new Set(rows.flatMap(row=>row[8]));
    if ([...VALID_TOPIC_CODES].some(topic=>!covered.has(topic))||covered.size!==VALID_TOPIC_CODES.size) fail('(manifest)','topicCodes must cover exactly 6.1 through 6.8');
  };
  const expectedLocator=topics=>`AMSCO AP World History, Unit 6, ${topics.length===1?'Topic':'Topics'} ${topics.length===1?topics[0]:topics.length===2?topics.join(' and '):`${topics.slice(0,-1).join(', ')}, and ${topics.at(-1)}`}`;
  const validateRaw=records=>{
    if (!Array.isArray(records)) fail('(missing ID)','raw records must be an array');
    if (records.length!==30) fail(records[30]?.id||'(missing ID)','expected exactly 30 raw records');
    const manifestById=new Map(STUDY_MANIFEST.map(row=>[row[0],row])); const seen=new Set();
    for (const record of records) {
      const id=record?.id; if (!id) fail('(missing ID)','missing raw record ID');
      if (seen.has(id)) fail(id,'duplicate raw record ID'); seen.add(id);
      const row=manifestById.get(id); if (!row) fail(id,'raw record is absent from manifest');
      for (const field of ['summary','significance','examConnection']) {
        if (typeof record[field]!=='string'||!record[field].trim()) fail(id,`${field} must be a nonempty string`);
        if (!english(record[field])) fail(id,`non-English ${field}`);
      }
      if (!record.keyPeople.length) fail(id,'malformed keyPeople');
      for (const person of record.keyPeople) if (!english(person.name)||!english(person.role)) fail(id,'malformed keyPeople');
      if (!record.keyTerms.length) fail(id,'malformed keyTerms');
      for (const term of record.keyTerms) if (!english(term.term)||!english(term.explanation)) fail(id,'malformed keyTerms');
      if (record.evidence.length<2||record.evidence.some(statement=>!english(statement))) fail(id,'malformed evidence');
      if (record.source.id!=='amsco-apwh-u6'||record.source.locator!==expectedLocator(row[8])) fail(id,'malformed source');
    }
    for (const [id] of manifestById) if (!seen.has(id)) fail(id,'missing raw record');
  };
  const validateConnectionShapes=()=>{
    const keys=['causeStudyPointIds','connectionNotes','effectStudyPointIds','relatedStudyPointIds'];
    for (const [id,connections] of CONNECTION_DATA) {
      if (!plainObject(connections)||!hasExactOwnEnumerableDataFields(connections,keys)) fail(id,'malformed connection structure');
      for (const category of ['causeStudyPointIds','effectStudyPointIds','relatedStudyPointIds']) if (!ordinaryDenseArray(connections[category])) fail(id,`${category} must be an ordinary dense array`);
      if (!plainObject(connections.connectionNotes)) fail(id,'connectionNotes must be a plain object');
      const categories=new Map(); const linked=[];
      for (const category of ['causeStudyPointIds','effectStudyPointIds','relatedStudyPointIds']) {
        for (const targetId of connections[category]) {
          if (targetId===id) fail(id,`self connection in ${category}`);
          if (connections[category].indexOf(targetId)!==connections[category].lastIndexOf(targetId)) fail(id,`duplicate connection in ${category} to ${describe(targetId)}`);
          if (categories.has(targetId)) fail(id,`cross-category connection ${targetId}`);
          categories.set(targetId,category); linked.push(targetId);
          if (!CONNECTION_DATA.has(targetId)) fail(id,`unresolved connection ${targetId}`);
        }
      }
      const noteKeys=Reflect.ownKeys(connections.connectionNotes);
      const extra=noteKeys.find(key=>typeof key!=='string'||!linked.includes(key));
      if (extra!==undefined) fail(id,`extra connection note key ${describe(extra)}`);
      if (!hasExactOwnEnumerableDataFields(connections.connectionNotes,[...new Set(linked)])) fail(id,'connectionNotes must contain ordinary enumerable data fields');
    }
  };
  const validateUnitCards=cards=>{
    if (!Array.isArray(cards)) failCards('cards must be an array');
    if (!ordinaryDenseArray(cards)) failCards('cards must be an ordinary dense array');
    if (cards.length!==0) failCards('cards must be empty for the Task 2 checkpoint');
  };

  validateRecordInputShapes(STUDY_MANIFEST,RAW_RECORDS);
  validateLocations();
  validateManifest(STUDY_MANIFEST);
  validateRaw(RAW_RECORDS);
  validateConnectionShapes();
  validateUnitCards(UNIT_CARD_LIST);

  const contextById=new Map(STUDY_MANIFEST.map(row=>[row[0],row]));
  const freezeRecord=raw=>{
    const [id,locationNumber,sequence,title,dateLabel,startYear,endYear,mainEventKey,topicCodes,themeIds,examSkills]=contextById.get(raw.id);
    const connections=CONNECTION_DATA.get(raw.id);
    return Object.freeze({
      ...raw,id,locationNumber,sequence,title,dateLabel,startYear,endYear,mainEventKey,
      topicCodes:Object.freeze([...topicCodes]),themeIds:Object.freeze([...themeIds]),examSkills:Object.freeze([...examSkills]),
      causeStudyPointIds:Object.freeze([...connections.causeStudyPointIds]),effectStudyPointIds:Object.freeze([...connections.effectStudyPointIds]),
      relatedStudyPointIds:Object.freeze([...connections.relatedStudyPointIds]),connectionNotes:Object.freeze({...connections.connectionNotes}),
      keyPeople:Object.freeze(raw.keyPeople.map(person=>Object.freeze({...person}))),keyTerms:Object.freeze(raw.keyTerms.map(term=>Object.freeze({...term}))),
      evidence:Object.freeze([...raw.evidence]),source:Object.freeze({...raw.source}),
    });
  };
  const RECORDS=Object.freeze(STUDY_MANIFEST.map(row=>freezeRecord(RAW_RECORDS.find(record=>record.id===row[0]))));
  const UNIT_CARDS=Object.freeze({});
  const byId=new Map(RECORDS.map(record=>[record.id,record]));
  function compareRecords(a,b) {
    return a.sequence-b.sequence||a.startYear-b.startYear||a.endYear-b.endYear||String(a.id).localeCompare(String(b.id));
  }
  const byLocation=new Map(LOCATION_NUMBERS.map(number=>[number,RECORDS.filter(record=>record.locationNumber===number).sort(compareRecords)]));
  const api=Object.freeze({
    unitId:UNIT_ID,unitNumber:UNIT_NUMBER,connectionTimelineMode:'main-event',locationNumbers:LOCATION_NUMBERS,records:RECORDS,unitCards:UNIT_CARDS,compareRecords,
    getById(id){return byId.get(String(id))||null;},
    getByLocation(number){return [...(byLocation.get(String(number))||[])];},
    locationName(number){const key=String(number);return Object.prototype.hasOwnProperty.call(LOCATIONS,key)?LOCATIONS[key]:null;},
    getUnitCard(kind){const key=String(kind);return Object.prototype.hasOwnProperty.call(UNIT_CARDS,key)?UNIT_CARDS[key]:null;},
  });
  Object.defineProperty(root,'APWH_U6_LOCATION_STUDY',{value:api,enumerable:true,configurable:false,writable:false});
})(typeof window!=='undefined'?window:globalThis);
