import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const moduleUrl = new URL('../data/apwh-u5-location-study.js', import.meta.url);
assert.equal(existsSync(moduleUrl), true, 'Unit 5 data module must exist');
const dataModuleSource = readFileSync(moduleUrl, 'utf8');
const ledgerUrl = new URL('../docs/data-sources/apwh-u5-location-study-source-ledger.md', import.meta.url);
const ledgerSource = existsSync(ledgerUrl) ? readFileSync(ledgerUrl, 'utf8') : '';
const ledgerIntroduction = '# APWH Unit 5 Location Study Source Ledger\n\nThe learner records use edition-neutral locators in AMSCO AP World History Unit 5 and the College Board framework effective Fall 2026. Map pins are representative anchors; a named city does not imply that every regional process occurred only there.';
const ledgerHeader = '| Stable ID | AP topic assignment | Main event | Source locator | Claims covered |';
const ledgerSeparator = '| --- | --- | --- | --- | --- |';
const failLedger = rule => { throw new Error(`Invalid Unit 5 source ledger: ${rule}`); };
const evaluateSandbox = (source = dataModuleSource, seed = {}) => {
  const sandbox = { ...seed }; sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox);
  return sandbox;
};
const evaluate = (source = dataModuleSource, seed = {}) => evaluateSandbox(source,seed).APWH_U5_LOCATION_STUDY;

const expectedLocations = new Map([
  ['23', 'Enlightenment Foundations · London'],
  ['51', 'American Revolution · Philadelphia'],
  ['24', 'French Revolution · Paris'],
  ['66', 'Haitian Revolution · Saint-Domingue / Port-au-Prince'],
  ['52', 'Latin American Independence · Caracas'],
  ['36', 'Industrial Revolution · Manchester'],
  ['29', 'Nationalism and Industrial Power · Berlin'],
  ['14', 'Meiji State-Led Industrialization · Edo / Tokyo'],
  ['84', "Muhammad Ali's Egypt · Cairo"],
  ['105', "Women's Rights · Seneca Falls"],
]);

const expectedManifest = [
['apwh-u5-london-natural-law-empiricism','23',1,'Natural Law and Empirical Reasoning','1600–1750',1600,1750,'world-event-23-2',['5.1'],['CDI','TEC'],['Contextualization']],
['apwh-u5-london-social-contract-natural-rights','23',2,'Social Contract and Natural Rights','1651–1762',1651,1762,'world-event-23-2',['5.1'],['CDI','GOV'],['Causation']],
['apwh-u5-london-rights-language-atlantic','23',3,'Rights Language Becomes Portable','1700–1800',1700,1800,'world-event-23-2',['5.1','5.2'],['CDI','GOV'],['Causation','CCOT']],
['apwh-u5-philadelphia-colonial-self-government','51',1,'Colonial Self-Government and Imperial Conflict','1600–1775',1600,1775,'world-event-51-0',['5.2'],['GOV','ECN'],['Contextualization','Causation']],
['apwh-u5-philadelphia-declaration-independence','51',2,'Declaration, War, and Independence','1776–1783',1776,1783,'world-event-51-0',['5.2'],['GOV','CDI'],['Causation']],
['apwh-u5-philadelphia-republican-rights-limits','51',3,'Republican Rights and Their Limits','1776–1800',1776,1800,'world-event-51-0',['5.2'],['GOV','SIO'],['Comparison','CCOT']],
['apwh-u5-paris-old-regime-fiscal-crisis','24',1,'Old Regime Privilege and Fiscal Crisis','1780–1789',1780,1789,'world-event-24-1',['5.2'],['GOV','ECN','SIO'],['Causation','Contextualization']],
['apwh-u5-paris-popular-sovereignty-rights','24',2,'Popular Sovereignty and the Rights of Man','1789–1792',1789,1792,'world-event-24-1',['5.1','5.2'],['GOV','CDI'],['Causation']],
['apwh-u5-paris-radicalization-napoleonic-diffusion','24',3,'Radicalization and Napoleonic Diffusion','1792–1815',1792,1815,'world-event-24-1',['5.2'],['GOV','CDI'],['Causation','CCOT']],
['apwh-u5-haiti-plantation-slavery','66',1,'Plantation Wealth and Racial Slavery','1700–1791',1700,1791,'world-event-66-1',['5.2'],['ECN','SIO'],['Contextualization','Causation']],
['apwh-u5-haiti-enslaved-revolt-toussaint','66',2,"Enslaved Revolt and Toussaint L'Ouverture",'1791–1802',1791,1802,'world-event-66-1',['5.2'],['GOV','SIO'],['Causation']],
['apwh-u5-haiti-emancipation-independence','66',3,'Emancipation and Haitian Independence','1793–1804',1793,1804,'world-event-66-1',['5.2'],['GOV','SIO'],['Causation','Comparison']],
['apwh-u5-caracas-creole-grievances-imperial-crisis','52',1,'Creole Grievances and Imperial Crisis','1750–1810',1750,1810,'world-event-52-0',['5.2'],['GOV','ECN','SIO'],['Contextualization','Causation']],
['apwh-u5-caracas-bolivar-independence-wars','52',2,'Bolívar and the Wars of Independence','1810–1825',1810,1825,'world-event-52-0',['5.2'],['GOV','CDI'],['Causation']],
['apwh-u5-caracas-fragmentation-caudillo-limits','52',3,'Fragmentation, Caudillos, and Limited Social Change','1820–1870',1820,1870,'world-event-52-0',['5.2'],['GOV','SIO'],['Comparison','CCOT']],
['apwh-u5-manchester-coal-capital-agriculture','36',1,'Coal, Capital, and Agricultural Change','1700–1800',1700,1800,'world-event-36-0',['5.3'],['ENV','ECN'],['Causation','Contextualization']],
['apwh-u5-manchester-steam-factory-system','36',2,'Steam Power and the Factory System','1769–1830',1769,1830,'world-event-36-0',['5.3','5.5','5.7'],['TEC','ECN'],['Causation']],
['apwh-u5-manchester-urban-class-labor-response','36',3,'Urban Classes and Labor Responses','1800–1900',1800,1900,'world-event-36-0',['5.8','5.9','5.10'],['SIO','ECN'],['Causation','CCOT']],
['apwh-u5-berlin-napoleonic-occupation-nationalism','29',1,'Napoleonic Occupation and German Nationalism','1800–1848',1800,1848,'world-event-29-0',['5.2'],['GOV','CDI'],['Causation','Contextualization']],
['apwh-u5-berlin-bismarck-wars-unification','29',2,'Bismarck, War, and German Unification','1862–1871',1862,1871,'world-event-29-0',['5.2'],['GOV'],['Causation']],
['apwh-u5-berlin-second-industrial-revolution-power','29',3,'Second Industrial Revolution and National Power','1870–1900',1870,1900,'world-event-29-0',['5.4','5.5','5.7'],['TEC','ECN','GOV'],['Causation','Comparison']],
['apwh-u5-tokyo-tokugawa-order-foreign-pressure','14',1,'Tokugawa Order and Foreign Pressure','1603–1868',1603,1868,'world-event-14-1',['5.4','5.6'],['GOV','ECN'],['Contextualization','Causation']],
['apwh-u5-tokyo-meiji-political-fiscal-reform','14',2,'Meiji Political and Fiscal Reform','1868–1885',1868,1885,'world-event-14-1',['5.6'],['GOV','SIO'],['Causation']],
['apwh-u5-tokyo-state-industry-military-power','14',3,'State Industry and Military Power','1870–1900',1870,1900,'world-event-14-1',['5.4','5.5','5.6'],['TEC','ECN','GOV'],['Causation','Comparison']],
['apwh-u5-cairo-military-pressure-reform','84',1,'Military Pressure and the Demand for Reform','1798–1805',1798,1805,'world-event-84-2',['5.4','5.6'],['GOV','TEC'],['Contextualization','Causation']],
['apwh-u5-cairo-cotton-conscription-factories','84',2,'Cotton, Conscription, and State Factories','1805–1848',1805,1848,'world-event-84-2',['5.4','5.6'],['GOV','ECN','TEC'],['Causation']],
['apwh-u5-cairo-debt-intervention-limits','84',3,'Debt, Foreign Intervention, and the Limits of Reform','1840–1882',1840,1882,'world-event-84-2',['5.4','5.6','5.10'],['GOV','ECN'],['Causation','Comparison']],
['apwh-u5-seneca-rights-language-exclusion','105',1,"Revolutionary Rights and Women's Exclusion",'1776–1848',1776,1848,'world-event-105-0',['5.1','5.8','5.9'],['SIO','GOV'],['Contextualization','CCOT']],
['apwh-u5-seneca-declaration-sentiments','105',2,'The Declaration of Sentiments','1848',1848,1848,'world-event-105-0',['5.8','5.9'],['SIO','GOV','CDI'],['Causation']],
['apwh-u5-seneca-organized-feminism-limits','105',3,'Organized Feminism and Limited Immediate Change','1848–1900',1848,1900,'world-event-105-0',['5.8','5.9','5.10'],['SIO','GOV'],['Causation','CCOT']],
];

const P = (id, summary, significance, person, role, term, explanation, evidence, examConnection, locator) => ({
  id, summary, significance, keyPeople: [{ name: person, role }], keyTerms: [{ term, explanation }],
  evidence, examConnection, source: { id: 'amsco-apwh-u5', locator },
});
const expectedRecordContent = [
P('apwh-u5-london-natural-law-empiricism','Bacon used observation and Newton expressed physical motion as mathematical laws.','Their methods encouraged a wider European and Atlantic Enlightenment to seek discoverable natural laws for society.','Francis Bacon and Isaac Newton','Bacon advanced empirical inquiry; Newton demonstrated mathematical natural law.','empiricism','Knowledge built from observation and tested experience.',['Bacon argued that repeated observation could build reliable knowledge.','Newtonian physics presented a law-governed universe to later social thinkers.'],'Contextualize Enlightenment reasoning without claiming British thinkers alone created it.','AMSCO AP World History, Unit 5, Topic 5.1'),
P('apwh-u5-london-social-contract-natural-rights','Hobbes, Locke, Montesquieu, and Rousseau offered competing accounts of authority, consent, rights, and restraint.','Their disagreements made social-contract reasoning a flexible challenge to inherited rule.','Hobbes, Locke, Montesquieu, and Rousseau','Distinguished a strong sovereign, natural rights, separated powers, and popular sovereignty.','social contract','An agreement used to explain why people authorize government.',['Hobbes exchanged broad obedience for security under a strong sovereign.','Locke defended resistance, while Montesquieu and Rousseau proposed different limits and sources of authority.'],'Compare the thinkers precisely rather than treating their claims as identical.','AMSCO AP World History, Unit 5, Topic 5.1'),
P('apwh-u5-london-rights-language-atlantic','Print and correspondence carried rights and sovereignty arguments across borders.','Revolutionaries adapted portable language to different local grievances and unequal societies.','Atlantic readers and printers','Circulated and adapted arguments about rights, consent, and sovereignty.','popular sovereignty','The claim that legitimate authority originates with the people.',['Pamphlets moved political arguments beyond courts and universities.','American, French, Haitian, and Latin American actors adapted rights claims differently.'],'Trace continuity in vocabulary and change in who claimed rights.','AMSCO AP World History, Unit 5, Topics 5.1 and 5.2'),
P('apwh-u5-philadelphia-colonial-self-government','Colonial legislatures developed local authority before imperial taxation provoked disputes over representation.','Independence grew from institutional conflict and war debt as well as political ideas.','Colonial assemblies','Claimed authority over local taxation and legislation.','no taxation without representation','A protest linking taxation to political consent.',['Assemblies managed many local affairs before the imperial crisis.','The Stamp Act and later revenue measures prompted coordinated resistance.'],'Contextualize independence with legislatures, taxation, and competing sovereignty.','AMSCO AP World History, Unit 5, Topic 5.2'),
P('apwh-u5-philadelphia-declaration-independence','The Declaration adapted Locke, while French money, troops, and naval power helped win the war.','Ideas justified separation, but diplomacy and material support enabled independence.','Thomas Jefferson and French allies','Jefferson drafted the Declaration; France supplied essential military and financial aid.','Declaration of Independence','The 1776 natural-rights argument for separation from Britain.',['The Declaration adapted Locke\'s rights and resistance claims.','French intervention after Saratoga helped counter British power.'],'Explain both ideological causation and the importance of French aid.','AMSCO AP World History, Unit 5, Topic 5.2'),
P('apwh-u5-philadelphia-republican-rights-limits','Representative government expanded for many white men while slavery and exclusions persisted.','Independence did not immediately create universal suffrage or abolish slavery.','Free and enslaved Americans','Experienced sharply unequal access to revolutionary promises.','limited suffrage','Voting restricted by sex, race, property, or state law.',['States retained voting restrictions even when some lowered property requirements.','Slavery survived and received protection through political compromises.'],'Compare revolutionary claims with unequal outcomes and continuities.','AMSCO AP World History, Unit 5, Topic 5.2'),
P('apwh-u5-paris-old-regime-fiscal-crisis','War debt, unequal taxation, and estate privilege forced Louis XVI to summon the Estates-General.','A fiscal emergency became institutional conflict over representation and sovereignty.','Louis XVI and Third Estate deputies','The king summoned the estates; deputies claimed to represent the nation.','Estates-General','The assembly representing clergy, nobility, and the Third Estate.',['The monarchy could not service debt through its unequal tax system.','Disputed voting procedures transformed fiscal reform into political crisis.'],'Connect fiscal pressure to privilege and institutional conflict.','AMSCO AP World History, Unit 5, Topic 5.2'),
P('apwh-u5-paris-popular-sovereignty-rights','Popular action reinforced reforms abolishing feudal privilege and proclaiming legal equality.','The early Revolution shifted sovereignty toward the nation before the Terror.','National Assembly and popular crowds','Legislators enacted reform while urban and rural action applied pressure.','Rights of Man','The 1789 declaration of liberty, equality, and national sovereignty.',['The Bastille uprising protected and radicalized institutional change.','The August Decrees attacked estate privileges and feudal dues.'],'Distinguish early constitutional reform from later radical rule.','AMSCO AP World History, Unit 5, Topics 5.1 and 5.2'),
P('apwh-u5-paris-radicalization-napoleonic-diffusion','War and counterrevolution contributed to the Terror; Napoleon later centralized power and spread selected reforms.','France moved from reform to radical republic and authoritarian empire.','Robespierre and Napoleon Bonaparte','Robespierre led during the Terror; Napoleon consolidated rule and legal reform.','Napoleonic Code','A uniform civil code combining male legal equality with patriarchal limits.',['Foreign war intensified emergency politics and executions.','Napoleonic conquest ended privileges while subordinating representation to empire.'],'Separate early reform, the Terror, and Napoleonic consolidation.','AMSCO AP World History, Unit 5, Topic 5.2'),
P('apwh-u5-haiti-plantation-slavery','Saint-Domingue produced sugar wealth through enslaved African labor under racial chattel slavery.','Extreme exploitation made the colony profitable and violently unstable.','Enslaved Africans in Saint-Domingue','Produced plantation exports while sustaining resistance networks.','racial chattel slavery','Hereditary enslavement defined as property through racial categories.',['Sugar and coffee made Saint-Domingue an exceptionally rich colony.','Plantations relied on forced labor, violence, and continual slave imports.'],'Use plantation wealth and racial hierarchy as revolutionary context.','AMSCO AP World History, Unit 5, Topic 5.2'),
P('apwh-u5-haiti-enslaved-revolt-toussaint','Enslaved people and maroons drove revolt while Toussaint became a central military leader.','Mass resistance made the revolution; Toussaint neither began every revolt nor declared the 1804 republic.','Toussaint L\'Ouverture, enslaved rebels, and maroons','Toussaint built an army while collective resistance pursued emancipation.','maroons','People who escaped slavery and formed independent communities.',['Enslaved workers coordinated the August 1791 uprising.','Toussaint governed much of the colony before French forces captured him.'],'Center collective action while defining Toussaint\'s specific role.','AMSCO AP World History, Unit 5, Topic 5.2'),
P('apwh-u5-haiti-emancipation-independence','Emancipation began in 1793–1794, and Dessalines declared independence in 1804.','Haiti uniquely joined durable abolition with successful colonial independence.','Jean-Jacques Dessalines','Led the final war and declared Haitian independence.','emancipation','Legal abolition of enslaved status.',['Resistance pushed French authorities to abolish slavery.','Dessalines, not Toussaint, proclaimed the independent republic.'],'Compare Haiti with revolutions that retained racial slavery.','AMSCO AP World History, Unit 5, Topic 5.2'),
P('apwh-u5-caracas-creole-grievances-imperial-crisis','Creoles resented mercantilism and office exclusion before Spain\'s crisis destabilized authority.','Long-term hierarchy and the Napoleonic crisis interacted to produce revolt.','Creole elites','Led juntas while defending many existing social advantages.','peninsulares','Spanish-born officials often preferred for senior colonial offices.',['Mercantilist rules constrained legal trade.','Spain\'s 1808 crisis created rival claims to sovereignty.'],'Explain how grievances became revolutionary during imperial crisis.','AMSCO AP World History, Unit 5, Topic 5.2'),
P('apwh-u5-caracas-bolivar-independence-wars','Bolívar led campaigns across northern South America and sought union in Gran Colombia.','Military victory ended Spanish rule, but his larger union proved unstable.','Simón Bolívar','Led independence armies and promoted Gran Colombia.','Gran Colombia','The republic uniting several northern South American territories from 1819 to 1830.',['Bolívar linked Venezuelan warfare to campaigns in New Granada.','Regional conflict fractured Gran Colombia after independence.'],'Connect military causation to postwar state-building difficulty.','AMSCO AP World History, Unit 5, Topic 5.2'),
P('apwh-u5-caracas-fragmentation-caudillo-limits','New republics fragmented as caudillos gained power and social hierarchy persisted.','Independence did not automatically redistribute land, wealth, or political authority.','José Antonio Páez','Became a powerful Venezuelan caudillo after independence.','caudillo','A regional political-military strongman with personal armed support.',['Gran Colombia dissolved by 1830.','Creole landowners remained powerful over racially unequal societies.'],'Compare political independence with social and regional continuities.','AMSCO AP World History, Unit 5, Topic 5.2'),
P('apwh-u5-manchester-coal-capital-agriculture','Agriculture, coal, waterways, capital, property rules, and foreign resources jointly supported British industry.','No single factor caused industrialization; energy, markets, institutions, labor, and empire interacted.','British landowners and merchants','Combined agricultural investment and commercial capital.','agricultural revolution','Farming and landholding changes that raised output and altered labor.',['Canals connected coalfields, factories, and Manchester markets.','Overseas trade supplied capital, raw materials, and consumers.'],'Build a multicausal explanation; Glasgow or Hangzhou are supporting comparisons only.','AMSCO AP World History, Unit 5, Topic 5.3'),
P('apwh-u5-manchester-steam-factory-system','Steam concentrated machinery and workers in factories governed by specialized tasks and fixed schedules.','Steam reorganized production location, scale, discipline, and rhythm rather than merely increasing speed.','James Watt and factory workers','Watt improved steam efficiency; workers operated machines under employer control.','factory system','Centralized machine production using wage labor and supervision.',['Steam reduced dependence on fast-flowing water sites.','Mechanized textiles concentrated machines and labor in large buildings.'],'Explain how energy technology changed organization as well as output.','AMSCO AP World History, Unit 5, Topics 5.3, 5.5, and 5.7'),
P('apwh-u5-manchester-urban-class-labor-response','Industrial cities enriched owners while workers faced crowding, danger, and gendered wage differences.','Unequal class, urban, and gender effects prompted unions, protest, and reform.','Industrial workers and reformers','Organized collective action for safer and fairer conditions.','labor union','An organization through which workers bargain collectively.',['Women and children often earned less under dangerous conditions.','Workers used strikes and unions despite government restrictions.'],'Track unequal social change and causal labor responses.','AMSCO AP World History, Unit 5, Topics 5.8, 5.9, and 5.10'),
P('apwh-u5-berlin-napoleonic-occupation-nationalism','Napoleonic occupation reorganized German lands and provoked reform and nationalist resistance.','Conflict strengthened nationalism, but culture alone did not create a unified state.','German reformers and nationalists','Linked resistance to institutional renewal and national unity.','German nationalism','The claim that German-speaking peoples shared a political identity.',['Napoleon dissolved the Holy Roman Empire.','Prussian administrative and military reforms followed defeat.'],'Use occupation as a cause while distinguishing ideas from state power.','AMSCO AP World History, Unit 5, Topic 5.2'),
P('apwh-u5-berlin-bismarck-wars-unification','Bismarck used Prussian institutions and wars against Denmark, Austria, and France to unify Germany.','Unification was state-led political and military action, not spontaneous culture.','Otto von Bismarck','Directed Prussian diplomacy and limited wars toward unification.','Realpolitik','Pragmatic power politics focused on state interests.',['Prussia excluded Austria after the 1866 war.','Victory over France drew southern states into the 1871 empire.'],'Explain nationalism through identity and Prussian institutional force.','AMSCO AP World History, Unit 5, Topic 5.2'),
P('apwh-u5-berlin-second-industrial-revolution-power','Steel, chemicals, electricity, finance, research, and state capacity drove German industrial growth.','New industries strengthened national military and economic power.','German firms, banks, and researchers','Mobilized finance and applied science to industrial production.','Second Industrial Revolution','Late-century growth in steel, chemicals, and electricity.',['Chemical and electrical firms linked laboratories to factories.','Rail, banks, education, and state orders supported heavy industry.'],'Compare Germany with Britain; Rome is a supporting comparison only.','AMSCO AP World History, Unit 5, Topics 5.4, 5.5, and 5.7'),
P('apwh-u5-tokyo-tokugawa-order-foreign-pressure','Tokugawa institutions supported commercial growth until gunboat pressure exposed military weakness.','Domestic structures and foreign coercion contextualized reform, not a sudden Western embrace.','Tokugawa shogunate and Matthew Perry','The shogunate governed domains; Perry forced port negotiations.','unequal treaties','Agreements granting foreign powers trade and legal privileges.',['Markets and literacy expanded before 1868.','Perry\'s fleet and unequal treaties intensified political conflict.'],'Contextualize Meiji reform with Tokugawa capacity and foreign pressure.','AMSCO AP World History, Unit 5, Topics 5.4 and 5.6'),
P('apwh-u5-tokyo-meiji-political-fiscal-reform','Meiji leaders centralized domains and changed taxation, status, conscription, education, and ownership.','Reforms expanded state capacity while disrupting old orders and imposing obligations.','Meiji oligarchs','Directed centralization and institutional reform.','land tax reform','A monetary land-value tax providing predictable state revenue.',['Domains became centrally controlled prefectures.','Conscription and national schools extended state demands.'],'Explain how the reforms changed state-society relations.','AMSCO AP World History, Unit 5, Topic 5.6'),
P('apwh-u5-tokyo-state-industry-military-power','The state financed factories, railways, arsenals, and schools before privatizing some enterprises.','Industrial success was state-supported and socially costly, not simple Western imitation.','Meiji officials, businesses, and workers','Officials and firms built industry while workers and taxpayers bore costs.','state-led industrialization','Government direction and finance used to accelerate industry.',['Public funds supported railways, shipyards, and textile mills.','Women textile workers endured demanding factory conditions.'],'Compare industrial paths; Beijing and Istanbul are evidence only.','AMSCO AP World History, Unit 5, Topics 5.4, 5.5, and 5.6'),
P('apwh-u5-cairo-military-pressure-reform','French invasion and British intervention exposed weakness while Muhammad Ali built autonomous power inside Ottoman rule.','Foreign pressure prompted reform, but Egypt was neither passive nor fully independent.','Muhammad Ali','Used the Ottoman framework to consolidate authority and reform the military.','Ottoman framework','The imperial setting within which Egypt gained autonomy.',['France invaded Egypt in 1798.','Muhammad Ali became Ottoman governor while building his own army.'],'Balance foreign pressure, Egyptian agency, and Ottoman ties.','AMSCO AP World History, Unit 5, Topics 5.4 and 5.6'),
P('apwh-u5-cairo-cotton-conscription-factories','Cotton monopolies, peasant conscription, schools, and factories financed and supplied a modern army.','Reform tied agriculture, coercion, education, and industry to military goals.','Muhammad Ali\'s officials, peasants, and soldiers','Administered monopolies and supplied crops, labor, taxes, and troops.','cotton monopoly','State control over cotton purchase and sale to capture revenue.',['Cultivators sold cotton to the state at controlled prices.','Schools and factories trained officers and made military supplies.'],'Connect economic intervention and conscription to military reform.','AMSCO AP World History, Unit 5, Topics 5.4 and 5.6'),
P('apwh-u5-cairo-debt-intervention-limits','Ottoman and European pressure checked expansion; borrowing later enabled foreign financial control.','Reform built capacity but remained constrained by intervention, exports, and debt.','Egyptian rulers and European creditors','Pursued projects and used loans and pressure to shape policy.','debt control','Foreign oversight of state revenue after heavy borrowing.',['The 1840 settlement ended most of Muhammad Ali\'s conquests.','Debt led to foreign financial supervision before the 1882 occupation.'],'Evaluate both achievements and constraints within global inequality.','AMSCO AP World History, Unit 5, Topics 5.4, 5.6, and 5.10'),
P('apwh-u5-seneca-rights-language-exclusion','Revolutionary equality claims coexisted with women\'s legal and political exclusion.','The contradiction let advocates adapt rights language against gender hierarchy.','Women reformers','Linked abolition experience to demands for women\'s rights.','coverture','A doctrine subsuming a married woman\'s legal identity under her husband.',['Political rights remained male despite universal language.','Women abolitionists faced limits on public leadership.'],'Use the rights-exclusion gap; Washington abolition is supporting comparison only.','AMSCO AP World History, Unit 5, Topics 5.1, 5.8, and 5.9'),
P('apwh-u5-seneca-declaration-sentiments','The 1848 Declaration of Sentiments deliberately adapted the Declaration of Independence.','Familiar wording exposed specific legal, educational, economic, and political inequalities.','Elizabeth Cady Stanton and Lucretia Mott','Drafted and organized the convention\'s rights campaign.','Declaration of Sentiments','The Seneca Falls equality statement and grievance list.',['Its opening declared women and men created equal.','Delegates debated and adopted a suffrage resolution.'],'Explain the deliberate textual adaptation into organized demands.','AMSCO AP World History, Unit 5, Topics 5.8 and 5.9'),
P('apwh-u5-seneca-organized-feminism-limits','Conventions, petitions, and associations sustained feminism after 1848 without immediate voting victory.','Organization built durable networks despite delayed suffrage success.','Women\'s-rights organizers','Campaigned for legal, educational, economic, and voting rights.','organized feminism','Sustained collective advocacy for women\'s equality.',['Activists held conventions and circulated petitions.','Most American women still lacked the national vote in 1900.'],'Distinguish movement growth from immediate voting-rights success.','AMSCO AP World History, Unit 5, Topics 5.8, 5.9, and 5.10'),
];

const expectedCausalEdges = new Map([
  ['apwh-u5-london-natural-law-empiricism->apwh-u5-london-social-contract-natural-rights', 'Empirical and natural-law reasoning encouraged Enlightenment thinkers to seek discoverable principles for society and government.'],
  ['apwh-u5-london-social-contract-natural-rights->apwh-u5-london-rights-language-atlantic', 'Debates over consent, natural rights, and popular sovereignty supplied a reusable political vocabulary that print and correspondence carried across the Atlantic.'],
  ['apwh-u5-philadelphia-colonial-self-government->apwh-u5-philadelphia-declaration-independence', 'Colonial assemblies and disputes over taxation turned competing claims to sovereignty into organized resistance and a war for independence.'],
  ['apwh-u5-philadelphia-declaration-independence->apwh-u5-philadelphia-republican-rights-limits', 'Independence enabled republican government to expand political participation for many white men while slavery and legal exclusions limited revolutionary rights.'],
  ['apwh-u5-paris-old-regime-fiscal-crisis->apwh-u5-paris-popular-sovereignty-rights', 'War debt, unequal taxation, and estate privilege forced an institutional crisis in which Third Estate deputies and popular crowds relocated sovereignty toward the nation.'],
  ['apwh-u5-paris-popular-sovereignty-rights->apwh-u5-paris-radicalization-napoleonic-diffusion', 'Foreign war and counterrevolution destabilized early constitutional reform, contributing to emergency radicalization before Napoleon centralized selected revolutionary changes.'],
  ['apwh-u5-haiti-plantation-slavery->apwh-u5-haiti-enslaved-revolt-toussaint', 'Violent plantation exploitation and racial chattel slavery gave enslaved people compelling grievances while their own resistance networks enabled mass revolt.'],
  ['apwh-u5-haiti-enslaved-revolt-toussaint->apwh-u5-haiti-emancipation-independence', 'Enslaved-led military resistance forced emancipation and defeated France’s attempt to restore control, enabling Dessalines to declare independence.'],
  ['apwh-u5-caracas-creole-grievances-imperial-crisis->apwh-u5-caracas-bolivar-independence-wars', 'Creole grievances became revolutionary when Spain’s 1808 legitimacy crisis opened space for juntas and Bolívar’s military campaigns.'],
  ['apwh-u5-caracas-bolivar-independence-wars->apwh-u5-caracas-fragmentation-caudillo-limits', 'Independence wars ended Spanish rule without resolving regional rivalries or social hierarchy, helping caudillos gain power as Gran Colombia fragmented.'],
  ['apwh-u5-manchester-coal-capital-agriculture->apwh-u5-manchester-steam-factory-system', 'Coal, capital, transport, agricultural change, labor, and overseas resources jointly enabled steam-powered machinery and factory production.'],
  ['apwh-u5-manchester-steam-factory-system->apwh-u5-manchester-urban-class-labor-response', 'Factories concentrated wage workers under dangerous, disciplined, and unequal conditions, prompting class formation, unions, strikes, and reform campaigns.'],
  ['apwh-u5-berlin-napoleonic-occupation-nationalism->apwh-u5-berlin-bismarck-wars-unification', 'Occupation provoked nationalism and Prussian reform, but Bismarck later used those institutions and limited wars to convert national sentiment into unification.'],
  ['apwh-u5-berlin-bismarck-wars-unification->apwh-u5-berlin-second-industrial-revolution-power', 'Prussian-led unification joined larger markets and state capacity that supported railways, finance, research, heavy industry, and military demand.'],
  ['apwh-u5-tokyo-tokugawa-order-foreign-pressure->apwh-u5-tokyo-meiji-political-fiscal-reform', 'Foreign coercion exposed military weakness while Tokugawa-era markets and literacy provided capacities that Meiji leaders redirected through central reform.'],
  ['apwh-u5-tokyo-meiji-political-fiscal-reform->apwh-u5-tokyo-state-industry-military-power', 'Centralized prefectures, land-tax revenue, conscription, and schools supplied the fiscal and institutional capacity for state-backed industry and military growth.'],
  ['apwh-u5-cairo-military-pressure-reform->apwh-u5-cairo-cotton-conscription-factories', 'Foreign military pressure and Muhammad Ali’s consolidation of power motivated Egyptian officials to link cotton monopolies, conscription, schools, and factories to army reform.'],
  ['apwh-u5-cairo-cotton-conscription-factories->apwh-u5-cairo-debt-intervention-limits', 'A coercive export-and-military reform program built capacity but exposed Egypt to Ottoman and European intervention, while later borrowing increased foreign financial control.'],
  ['apwh-u5-seneca-rights-language-exclusion->apwh-u5-seneca-declaration-sentiments', 'The contradiction between universal equality claims and women’s legal exclusion, sharpened by abolitionist experience, encouraged activists to adapt revolutionary language at Seneca Falls.'],
  ['apwh-u5-seneca-declaration-sentiments->apwh-u5-seneca-organized-feminism-limits', 'The convention’s grievance list and suffrage resolution gave women’s-rights organizers a shared program for later conventions, petitions, and associations.'],
  ['apwh-u5-london-rights-language-atlantic->apwh-u5-philadelphia-declaration-independence', 'Portable natural-rights and consent language helped colonists frame resistance as a legitimate claim to independence.'],
  ['apwh-u5-philadelphia-declaration-independence->apwh-u5-paris-popular-sovereignty-rights', 'French participation and financing in the American war worsened existing fiscal strain, while American constitutional precedent made rights-based political reordering more imaginable.'],
  ['apwh-u5-paris-popular-sovereignty-rights->apwh-u5-haiti-enslaved-revolt-toussaint', 'Revolutionary universal-rights claims and metropolitan upheaval opened political space that enslaved people applied more radically through their own decisive collective action.'],
  ['apwh-u5-paris-radicalization-napoleonic-diffusion->apwh-u5-caracas-bolivar-independence-wars', 'Napoleon’s invasion of Iberia weakened Spanish royal authority and produced the legitimacy crisis in which Bolívar’s wars developed, while Atlantic precedents supplied political language.'],
  ['apwh-u5-paris-radicalization-napoleonic-diffusion->apwh-u5-berlin-napoleonic-occupation-nationalism', 'Napoleonic occupation and reorganization provoked German nationalism that was later mobilized through Prussian institutions.'],
  ['apwh-u5-manchester-steam-factory-system->apwh-u5-cairo-military-pressure-reform', 'Industrial military and productive disparity created pressure for state-led reform under Muhammad Ali, while Egyptian officials retained agency in choosing and directing reforms.'],
  ['apwh-u5-manchester-steam-factory-system->apwh-u5-tokyo-tokugawa-order-foreign-pressure', 'Industrial military disparity exposed through foreign pressure helped motivate Meiji state reform, which adapted domestic capacities rather than simply imitating Britain.'],
  ['apwh-u5-philadelphia-republican-rights-limits->apwh-u5-seneca-rights-language-exclusion', 'The contradiction between universal revolutionary claims and women’s exclusion supplied both the language and the target for the Declaration of Sentiments.'],
]);

const expectedRelatedPairs = new Map([
  ['apwh-u5-haiti-emancipation-independence|apwh-u5-philadelphia-republican-rights-limits', 'Compare American political independence, which retained slavery and major exclusions, with Haitian independence joined to emancipation.'],
  ['apwh-u5-caracas-fragmentation-caudillo-limits|apwh-u5-haiti-emancipation-independence', 'Compare Haiti’s enslaved-led social revolution with creole-led Latin American independence, where political separation preserved more of the existing hierarchy.'],
  ['apwh-u5-berlin-bismarck-wars-unification|apwh-u5-paris-radicalization-napoleonic-diffusion', 'Compare French revolutionary and occupational diffusion with Bismarck’s state-directed wars and institution-led German unification.'],
  ['apwh-u5-cairo-cotton-conscription-factories|apwh-u5-tokyo-meiji-political-fiscal-reform', 'Compare Egyptian and Japanese state-led reform: both mobilized taxes and coercion, but Japan retained greater fiscal sovereignty and achieved more durable autonomy under weaker foreign constraint.'],
  ['apwh-u5-manchester-urban-class-labor-response|apwh-u5-seneca-organized-feminism-limits', 'Compare labor organizing by an industrial class constituency with Seneca Falls feminism’s rights-based challenge to gender exclusion; both answered exclusion through different constituencies and methods.'],
]);

const expectedUnitCards = {
  context: {
    id:'apwh-u5-context-empire-hierarchy-rights', kind:'context', role:'Unit 5 Context Card',
    title:'How Imperial Hierarchy Produced Revolutionary Claims',
    examSkills:['Contextualization','Causation'],
    summary:'Unit 4 maritime empires accumulated wealth through trade, extraction, and coerced labor while organizing colonial societies through legal status and ancestry. Enlightenment arguments about reason, natural rights, and consent gave people excluded by those hierarchies a language they could reuse against imperial and social authority. Unit 5 follows both the spread of those political claims and the industrial transformation that changed which states could enforce power.',
    prompt:'How did Unit 4 institutions create both the grievances and the communication networks that made Unit 5 revolutionary claims possible?',
    takeaways:[
      'Imperial extraction strengthened states while sharpening unequal legal and social positions.',
      'Rights language became reusable because it made legitimacy depend on people rather than ancestry.',
      'Different groups applied the same language to different forms of exclusion.',
    ],
  },
  synthesis: {
    id:'apwh-u5-synthesis-industry-imperial-pressure', kind:'synthesis', role:'Unit 5 Synthesis Card',
    title:'From Industrial Capacity to Imperial Expansion',
    examSkills:['Causation','CCOT'],
    summary:'Industrial production concentrated labor and capital, expanded transport and communication, and increased the military capacity of industrial states. Factories also required recurring supplies of cotton, rubber, metals, food, and fuel as well as reliable markets. Unit 6 examines how those capabilities and demands intensified imperial control, reorganized colonized economies, and moved workers across regions even as local states and communities resisted.',
    prompt:'Which Unit 5 changes turned overseas expansion from an opportunity into a recurring economic and strategic pressure?',
    takeaways:[
      'Steam, rail, telegraphy, and industrial weapons increased the reach of states and firms.',
      'Factories created recurring demand for raw materials, labor, and consumers.',
      'Industrial power widened inequalities without eliminating resistance or local agency.',
    ],
  },
};

const expectedLedgerRows = [
  ['apwh-u5-london-natural-law-empiricism','5.1','world-event-23-2','AMSCO AP World History, Unit 5, Topic 5.1','Francis Bacon and Isaac Newton; observation and mathematical natural law encouraged a search for discoverable social principles; British thinkers did not create the wider Enlightenment alone.'],
  ['apwh-u5-london-social-contract-natural-rights','5.1','world-event-23-2','AMSCO AP World History, Unit 5, Topic 5.1','Hobbes, Locke, Montesquieu, and Rousseau; competing social-contract arguments made consent, rights, and restraint tools against inherited rule; their claims were not identical.'],
  ['apwh-u5-london-rights-language-atlantic','5.1, 5.2','world-event-23-2','AMSCO AP World History, Unit 5, Topics 5.1 and 5.2','Atlantic readers and printers; print and correspondence carried rights and sovereignty arguments across borders; American, French, Haitian, and Latin American actors adapted them to different grievances.'],
  ['apwh-u5-philadelphia-colonial-self-government','5.2','world-event-51-0','AMSCO AP World History, Unit 5, Topic 5.2','Colonial assemblies; local legislative authority and imperial taxes produced competing sovereignty claims; independence arose from institutions, taxation, and war debt as well as ideas.'],
  ['apwh-u5-philadelphia-declaration-independence','5.2','world-event-51-0','AMSCO AP World History, Unit 5, Topic 5.2','Thomas Jefferson and French allies; Locke-derived rights justified separation while French money, troops, and naval power enabled victory; ideology alone did not win independence.'],
  ['apwh-u5-philadelphia-republican-rights-limits','5.2','world-event-51-0','AMSCO AP World History, Unit 5, Topic 5.2','Free and enslaved Americans; republican government widened participation for many white men; slavery, sex, race, property, and state-law exclusions prevented universal rights.'],
  ['apwh-u5-paris-old-regime-fiscal-crisis','5.2','world-event-24-1','AMSCO AP World History, Unit 5, Topic 5.2','Louis XVI and Third Estate deputies; war debt, unequal taxation, and estate privilege forced the Estates-General and a sovereignty conflict; the fiscal crisis became political through disputed representation.'],
  ['apwh-u5-paris-popular-sovereignty-rights','5.1, 5.2','world-event-24-1','AMSCO AP World History, Unit 5, Topics 5.1 and 5.2','The National Assembly and popular crowds; urban and rural action reinforced legal equality and national sovereignty; early constitutional reform must be distinguished from the later Terror.'],
  ['apwh-u5-paris-radicalization-napoleonic-diffusion','5.2','world-event-24-1','AMSCO AP World History, Unit 5, Topic 5.2','Robespierre and Napoleon Bonaparte; foreign war and counterrevolution intensified the Terror before Napoleon spread selected legal reforms; centralized empire and patriarchal limits remained.'],
  ['apwh-u5-haiti-plantation-slavery','5.2','world-event-66-1','AMSCO AP World History, Unit 5, Topic 5.2','Enslaved Africans in Saint-Domingue; sugar and coffee wealth depended on violent racial chattel slavery and continual forced migration; profitability created instability rather than passive acceptance.'],
  ['apwh-u5-haiti-enslaved-revolt-toussaint','5.2','world-event-66-1','AMSCO AP World History, Unit 5, Topic 5.2',"Toussaint L'Ouverture, enslaved rebels, and maroons; collective resistance and the August 1791 uprising drove revolution; Toussaint neither began every revolt nor declared the 1804 republic."],
  ['apwh-u5-haiti-emancipation-independence','5.2','world-event-66-1','AMSCO AP World History, Unit 5, Topic 5.2','Jean-Jacques Dessalines and enslaved resistance; military pressure forced abolition before Dessalines declared independence; Dessalines, not Toussaint, proclaimed the republic.'],
  ['apwh-u5-caracas-creole-grievances-imperial-crisis','5.2','world-event-52-0','AMSCO AP World History, Unit 5, Topic 5.2',"Creole elites; mercantilism and peninsular office preference became revolutionary amid Spain's 1808 legitimacy crisis; junta leaders still defended many social advantages."],
  ['apwh-u5-caracas-bolivar-independence-wars','5.2','world-event-52-0','AMSCO AP World History, Unit 5, Topic 5.2','Simón Bolívar; linked campaigns defeated Spanish rule and pursued Gran Colombia; military independence did not make the larger union stable.'],
  ['apwh-u5-caracas-fragmentation-caudillo-limits','5.2','world-event-52-0','AMSCO AP World History, Unit 5, Topic 5.2','José Antonio Páez and creole landowners; unresolved regional conflict helped caudillos gain power after Gran Colombia dissolved; independence did not automatically redistribute land, wealth, or authority.'],
  ['apwh-u5-manchester-coal-capital-agriculture','5.3','world-event-36-0','AMSCO AP World History, Unit 5, Topic 5.3','British landowners and merchants; agriculture, coal, waterways, capital, property rules, labor, and foreign resources jointly supported industry; no single factor made industrialization inevitable.'],
  ['apwh-u5-manchester-steam-factory-system','5.3, 5.5, 5.7','world-event-36-0','AMSCO AP World History, Unit 5, Topics 5.3, 5.5, and 5.7','James Watt and factory workers; steam concentrated machinery and supervised wage labor in factories; the technology changed production location, scale, discipline, and rhythm, not merely speed.'],
  ['apwh-u5-manchester-urban-class-labor-response','5.8, 5.9, 5.10','world-event-36-0','AMSCO AP World History, Unit 5, Topics 5.8, 5.9, and 5.10','Industrial workers and reformers; crowding, danger, low wages, and gender inequality prompted unions, strikes, and reform; owners and workers experienced urban growth unequally.'],
  ['apwh-u5-berlin-napoleonic-occupation-nationalism','5.2','world-event-29-0','AMSCO AP World History, Unit 5, Topic 5.2','German reformers and nationalists; Napoleonic occupation and reorganization provoked Prussian reform and nationalist resistance; culture alone did not create a unified state.'],
  ['apwh-u5-berlin-bismarck-wars-unification','5.2','world-event-29-0','AMSCO AP World History, Unit 5, Topic 5.2','Otto von Bismarck; Prussian institutions, diplomacy, and wars against Denmark, Austria, and France produced unification; it was not a spontaneous result of shared culture.'],
  ['apwh-u5-berlin-second-industrial-revolution-power','5.4, 5.5, 5.7','world-event-29-0','AMSCO AP World History, Unit 5, Topics 5.4, 5.5, and 5.7','German firms, banks, researchers, and the state; finance, applied science, railways, education, and orders drove steel, chemical, and electrical growth; Germany followed a path distinct from Britain.'],
  ['apwh-u5-tokyo-tokugawa-order-foreign-pressure','5.4, 5.6','world-event-14-1','AMSCO AP World History, Unit 5, Topics 5.4 and 5.6','The Tokugawa shogunate and Matthew Perry; gunboat coercion and unequal treaties exposed military weakness; markets and literacy had expanded before 1868, so reform was not a sudden Western embrace.'],
  ['apwh-u5-tokyo-meiji-political-fiscal-reform','5.6','world-event-14-1','AMSCO AP World History, Unit 5, Topic 5.6','Meiji oligarchs; centralized prefectures, monetary land taxes, conscription, and schools increased state capacity; reforms also disrupted status orders and imposed new obligations.'],
  ['apwh-u5-tokyo-state-industry-military-power','5.4, 5.5, 5.6','world-event-14-1','AMSCO AP World History, Unit 5, Topics 5.4, 5.5, and 5.6','Meiji officials, businesses, and workers; public finance supported railways, arsenals, shipyards, and mills before some privatization; growth imposed costs and was not simple Western imitation.'],
  ['apwh-u5-cairo-military-pressure-reform','5.4, 5.6','world-event-84-2','AMSCO AP World History, Unit 5, Topics 5.4 and 5.6','Muhammad Ali; French invasion and British intervention exposed weakness while he built an army and autonomous authority; Egypt retained agency inside Ottoman rule but was not fully independent.'],
  ['apwh-u5-cairo-cotton-conscription-factories','5.4, 5.6','world-event-84-2','AMSCO AP World History, Unit 5, Topics 5.4 and 5.6',"Muhammad Ali's officials, peasants, and soldiers; cotton monopolies, conscription, schools, and factories supplied revenue, labor, and matériel for military reform; coercion underpinned the program."],
  ['apwh-u5-cairo-debt-intervention-limits','5.4, 5.6, 5.10','world-event-84-2','AMSCO AP World History, Unit 5, Topics 5.4, 5.6, and 5.10','Egyptian rulers and European creditors; Ottoman and European pressure checked conquest while borrowing enabled foreign financial control; reform built capacity but remained constrained by exports, debt, and intervention.'],
  ['apwh-u5-seneca-rights-language-exclusion','5.1, 5.8, 5.9','world-event-105-0','AMSCO AP World History, Unit 5, Topics 5.1, 5.8, and 5.9',"Women reformers; the contradiction between universal equality and women's exclusion, reinforced by abolitionist experience, supplied a rights-based challenge; Washington abolition is supporting comparison only."],
  ['apwh-u5-seneca-declaration-sentiments','5.8, 5.9','world-event-105-0','AMSCO AP World History, Unit 5, Topics 5.8 and 5.9','Elizabeth Cady Stanton and Lucretia Mott; deliberate adaptation of the Declaration of Independence exposed legal, educational, economic, and political inequality; delegates debated before adopting suffrage.'],
  ['apwh-u5-seneca-organized-feminism-limits','5.8, 5.9, 5.10','world-event-105-0','AMSCO AP World History, Unit 5, Topics 5.8, 5.9, and 5.10',"Women's-rights organizers; conventions, petitions, and associations sustained collective advocacy after 1848; movement growth did not produce immediate national voting rights."],
];

const backslashRunBefore=(value,index)=>{
  let backslashes=0;
  for (let cursor=index-1;cursor>=0&&value[cursor]==='\\';cursor-=1) backslashes+=1;
  return backslashes;
};
const parseMarkdownRowCells=row=>{
  if (!row.startsWith('|')||!row.endsWith('|')||backslashRunBefore(row,row.length-1)%2===1) failLedger('row must start and end with pipe delimiters');
  const cells=[]; let cell='';
  for (let index=1;index<row.length;index+=1) {
    const character=row[index];
    if (character!=='|') { cell+=character; continue; }
    const backslashes=backslashRunBefore(row,index);
    if (backslashes) cell=`${cell.slice(0,-backslashes)}${'\\'.repeat(Math.floor(backslashes/2))}`;
    if (backslashes%2===1) { cell+='|'; continue; }
    cells.push(cell.trim()); cell='';
  }
  return cells;
};
const parseLedgerRows=source=>{
  if (!source.startsWith(ledgerIntroduction)) failLedger('missing canonical introduction');
  const tablePrefix=`${ledgerIntroduction}\n\n${ledgerHeader}\n${ledgerSeparator}\n`;
  if (!source.startsWith(tablePrefix)) failLedger('table header must immediately follow canonical introduction');
  const lines=source.split('\n'); const headerIndex=ledgerIntroduction.split('\n').length+1;
  const expectedIds=new Set(expectedLedgerRows.map(row=>row[0])); const rows=[];
  let tableEnd=headerIndex+2;
  for (;tableEnd<lines.length;tableEnd+=1) {
    const raw=lines[tableEnd]; if (!raw) break;
    const cells=parseMarkdownRowCells(raw);
    if (cells.length!==5) failLedger('row must contain exactly five columns');
    const idMatch=cells[0].match(/^`(apwh-u5-[a-z0-9]+(?:-[a-z0-9]+)*)`$/);
    if (!idMatch) failLedger(`malformed Stable ID cell ${cells[0]}`);
    if (!expectedIds.has(idMatch[1])) failLedger(`unexpected Stable ID ${idMatch[1]}`);
    const eventMatch=cells[2].match(/^`([^`]+)`$/); if (!eventMatch) failLedger(`malformed Main event cell ${cells[2]}`);
    rows.push([idMatch[1],cells[1],eventMatch[1],cells[3],cells[4]]);
  }
  if (lines.slice(tableEnd).some(line=>line.trim())) failLedger('unexpected trailing content');
  const parsedOccurrences=new Map(); for (const [id] of rows) parsedOccurrences.set(id,(parsedOccurrences.get(id)||0)+1);
  for (const match of source.matchAll(/apwh-u5-[A-Za-z0-9_-]*/g)) {
    const id=match[0]; const remaining=parsedOccurrences.get(id)||0;
    if (!remaining) failLedger(`unparsed Stable ID occurrence ${id}`); parsedOccurrences.set(id,remaining-1);
  }
  if (rows.length!==expectedLedgerRows.length) failLedger(`expected exactly ${expectedLedgerRows.length} data rows`);
  for (let index=0;index<expectedLedgerRows.length;index+=1) {
    if (JSON.stringify(rows[index])!==JSON.stringify(expectedLedgerRows[index])) failLedger(`row ${index+1} does not match the canonical record order and fields`);
  }
  return rows;
};

const manifestOf = r => [r.id,r.locationNumber,r.sequence,r.title,r.dateLabel,r.startYear,r.endYear,r.mainEventKey,[...r.topicCodes],[...r.themeIds],[...r.examSkills]];
const contentOf = r => ({ id:r.id,summary:r.summary,significance:r.significance,keyPeople:Array.from(r.keyPeople,x=>({...x})),keyTerms:Array.from(r.keyTerms,x=>({...x})),evidence:Array.from(r.evidence),examConnection:r.examConnection,source:{...r.source} });

test('publishes the exact ordered Unit 5 manifest and learner content', () => {
  const api = evaluate();
  assert.equal(api.unitId,'u5'); assert.equal(api.unitNumber,5); assert.equal(api.connectionTimelineMode,'main-event');
  assert.deepEqual([...api.locationNumbers],[...expectedLocations.keys()]);
  assert.equal(api.records.length,30);
  assert.deepEqual(Array.from(api.records,manifestOf),expectedManifest);
  assert.deepEqual(Array.from(api.records,contentOf),expectedRecordContent);
  for (const [number,name] of expectedLocations) assert.equal(api.locationName(number),name);
});

test('covers exact IDs, topics, themes, skills, sequences, and event bindings', () => {
  const api=evaluate();
  assert.equal(new Set(api.records.map(r=>r.id)).size,30);
  assert.ok(api.records.every(r=>/^apwh-u5-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.id)));
  assert.deepEqual([...new Set(api.records.flatMap(r=>r.topicCodes))].sort(),['5.1','5.10','5.2','5.3','5.4','5.5','5.6','5.7','5.8','5.9']);
  assert.ok(api.records.flatMap(r=>r.themeIds).every(x=>['GOV','ECN','CDI','SIO','TEC','ENV'].includes(x)));
  assert.ok(api.records.flatMap(r=>r.examSkills).every(x=>['Causation','Comparison','CCOT','Contextualization'].includes(x)));
  for (const [number] of expectedLocations) {
    const records=api.getByLocation(number);
    assert.equal(records.length,3); assert.deepEqual(Array.from(records,r=>r.sequence),[1,2,3]);
    assert.ok(records.every(r=>r.mainEventKey.startsWith(`world-event-${number}-`)));
  }
});

test('publishes exact causal chains and related comparisons with reciprocal mechanism notes', () => {
  const api=evaluate();
  const causal=new Map(); const related=new Map();
  const reciprocals={causeStudyPointIds:'effectStudyPointIds',effectStudyPointIds:'causeStudyPointIds',relatedStudyPointIds:'relatedStudyPointIds'};
  for (const record of api.records) {
    const seen=new Set();
    for (const [category,reciprocal] of Object.entries(reciprocals)) {
      assert.equal(new Set(record[category]).size,record[category].length,`${record.id} ${category} duplicate`);
      for (const targetId of record[category]) {
        assert.notEqual(targetId,record.id,`${record.id} self link`);
        assert.equal(seen.has(targetId),false,`${record.id} cross-category ${targetId}`); seen.add(targetId);
        const target=api.getById(targetId); assert.ok(target,`${record.id} unresolved ${targetId}`);
        assert.ok(target[reciprocal].includes(record.id),`${record.id} nonreciprocal ${targetId}`);
        assert.match(record.connectionNotes[targetId],/[A-Za-z]/);
        assert.equal(target.connectionNotes[record.id],record.connectionNotes[targetId]);
        if (category==='effectStudyPointIds') causal.set(`${record.id}->${targetId}`,record.connectionNotes[targetId]);
        if (category==='relatedStudyPointIds') related.set([record.id,targetId].sort().join('|'),record.connectionNotes[targetId]);
      }
    }
    assert.deepEqual(Object.keys(record.connectionNotes).sort(),[...seen].sort());
  }
  assert.equal(causal.size,28); assert.equal(related.size,5);
  assert.deepEqual(causal,expectedCausalEdges); assert.deepEqual(related,expectedRelatedPairs);
});

const mutateConnections = (label,statement) => {
  const malformed=dataModuleSource.replace(/(\n\s*const contextById\s*=)/,`\n  ${statement}$1`);
  assert.notEqual(malformed,dataModuleSource,`${label} fixture mutation`);
  return malformed;
};

test('rejects missing causal and related endpoints immediately',()=>{
  const cases=[
    ["addCausalConnection('apwh-u5-missing','apwh-u5-london-social-contract-natural-rights','English note.');",/missing cause apwh-u5-missing/],
    ["addCausalConnection('apwh-u5-london-natural-law-empiricism','apwh-u5-missing','English note.');",/missing effect apwh-u5-missing/],
    ["addRelatedConnection('apwh-u5-missing','apwh-u5-haiti-emancipation-independence','English note.');",/missing left apwh-u5-missing/],
    ["addRelatedConnection('apwh-u5-philadelphia-republican-rights-limits','apwh-u5-missing','English note.');",/missing right apwh-u5-missing/],
  ];
  for (const [statement,message] of cases) assert.throws(()=>evaluate(mutateConnections('missing endpoint',statement)),message);
});

test('rejects graph self-links, duplicates, cross-category reuse, nonreciprocity, bad notes, and unresolved links',()=>{
  const first='apwh-u5-london-natural-law-empiricism'; const effect='apwh-u5-london-social-contract-natural-rights';
  const cases=[
    ["addCausalConnection('apwh-u5-london-natural-law-empiricism','apwh-u5-london-natural-law-empiricism','English note.');",/self connection/],
    ["addRelatedConnection('apwh-u5-london-natural-law-empiricism','apwh-u5-london-natural-law-empiricism','English note.');",/self connection/],
  ];
  for (const [statement,message] of cases) assert.throws(()=>evaluate(mutateConnections('self link',statement)),message);
  const replacements=[
    [/cause\.effectStudyPointIds\.push\(effectId\);/,'cause.effectStudyPointIds.push(effectId, effectId);',/duplicate connection/],
    [/effect\.causeStudyPointIds\.push\(causeId\);/,'effect.causeStudyPointIds.push(causeId); cause.relatedStudyPointIds.push(effectId); effect.relatedStudyPointIds.push(causeId);',/cross-category connection/],
    [/effect\.causeStudyPointIds\.push\(causeId\);/,'// omit reciprocal fixture',/nonreciprocal/],
    [/cause\.connectionNotes\[effectId\]=note; effect\.connectionNotes\[causeId\]=note;/,'// omit notes fixture',/missing connection note/],
    [/cause\.connectionNotes\[effectId\]=note;/,"cause.connectionNotes[effectId]='12345.';",/non-English connection note/],
    [/effect\.connectionNotes\[causeId\]=note;/,"effect.connectionNotes[causeId]=`${note} Different.`;",/nonreciprocal connection note/],
    [/connectionNotes:Object\.freeze\(\{\.\.\.connections\.connectionNotes\}\)/,"connectionNotes:Object.freeze({...connections.connectionNotes,'apwh-u5-extra':'Extra note.'})",/extra connection note key/],
    [/effectStudyPointIds:Object\.freeze\(\[\.\.\.connections\.effectStudyPointIds\]\)/,"effectStudyPointIds:Object.freeze([...connections.effectStudyPointIds,'apwh-u5-missing-link'])",/unresolved connection apwh-u5-missing-link/],
  ];
  for (const [search,replacement,message] of replacements) {
    const malformed=dataModuleSource.replace(search,replacement); assert.notEqual(malformed,dataModuleSource);
    assert.throws(()=>evaluate(malformed),error=>{assert.match(error.message,new RegExp(first)); assert.match(error.message,message); return true;});
  }
});

test('rejects symbol fields and non-ordinary graph arrays and note maps before freezing',()=>{
  const cases=[
    ["CONNECTION_DATA.get('apwh-u5-london-natural-law-empiricism').connectionNotes[Symbol('extra')]='English note.';",/extra connection note key Symbol\(extra\)/],
    ["{ const notes=CONNECTION_DATA.get('apwh-u5-london-natural-law-empiricism').connectionNotes; const note=notes['apwh-u5-london-social-contract-natural-rights']; notes.extra='English extra.'; Object.defineProperty(notes,'apwh-u5-london-social-contract-natural-rights',{enumerable:true,configurable:true,get(){delete notes.extra; return note;}}); }",/extra connection note key extra/],
    ["CONNECTION_DATA.get('apwh-u5-london-natural-law-empiricism').effectStudyPointIds.extra='English extra.';",/effectStudyPointIds must be an ordinary dense array/],
    ["Object.setPrototypeOf(CONNECTION_DATA.get('apwh-u5-london-natural-law-empiricism').effectStudyPointIds,Object.create(Array.prototype));",/effectStudyPointIds must be an ordinary dense array/],
    ["Object.setPrototypeOf(CONNECTION_DATA.get('apwh-u5-london-natural-law-empiricism').connectionNotes,Object.create(Object.prototype));",/connectionNotes must be a plain object/],
  ];
  for (const [statement,message] of cases) assert.throws(()=>evaluate(mutateConnections('graph exact shape',statement)),message);
});

test('publishes exact deeply frozen Unit 5 cards with defensive lookup semantics',()=>{
  const api=evaluate();
  assert.deepEqual(JSON.parse(JSON.stringify(api.unitCards)),expectedUnitCards);
  assert.equal(api.getUnitCard('context'),api.unitCards.context);
  assert.equal(api.getUnitCard('synthesis'),api.unitCards.synthesis);
  for (const kind of ['toString','constructor','__proto__','missing',null,undefined]) assert.equal(api.getUnitCard(kind),null);
  for (const card of Object.values(api.unitCards)) {
    assert.equal(Object.isFrozen(card),true); assert.equal(Object.isFrozen(card.examSkills),true); assert.equal(Object.isFrozen(card.takeaways),true);
    assert.equal(api.records.includes(card),false);
    assert.equal(api.locationNumbers.some(number=>api.getByLocation(number).includes(card)),false);
  }
  assert.throws(()=>api.getUnitCard('context').takeaways.pop());
  assert.deepEqual(JSON.parse(JSON.stringify(api.getUnitCard('context'))),expectedUnitCards.context);
});

const mutateUnitCards=(label,statement)=>{
  const malformed=dataModuleSource.replace(/(\n\s*const contextById\s*=)/,`\n  ${statement}$1`);
  assert.notEqual(malformed,dataModuleSource,`${label} fixture mutation`); return malformed;
};

test('rejects malformed, null, extra-field, and wrong-set Unit 5 cards',()=>{
  const cases=[
    ["UNIT_CARD_LIST[0].role='';",/missing role/],
    ["UNIT_CARD_LIST[0].title='';",/missing title/],
    ["UNIT_CARD_LIST[0].kind='wrong';",/invalid kind wrong/],
    ["UNIT_CARD_LIST[1].kind='context';",/duplicate kind context/],
    ["UNIT_CARD_LIST[1].id=UNIT_CARD_LIST[0].id;",/duplicate card ID/],
    ["UNIT_CARD_LIST[0].id='apwh-u4-context-wrong-unit';",/invalid stable ID/],
    ["UNIT_CARD_LIST[0].examSkills='Causation';",/examSkills must be an array/],
    ["UNIT_CARD_LIST[0].examSkills=[];",/missing examSkills/],
    ["UNIT_CARD_LIST[0].examSkills=['Recall'];",/invalid examSkill Recall/],
    ["UNIT_CARD_LIST[0].examSkills=['Causation','Causation'];",/duplicate examSkill Causation/],
    ["UNIT_CARD_LIST[0].examSkills=['Causation','CCOT','Comparison'];",/too many examSkills/],
    ["UNIT_CARD_LIST[0].takeaways[0]='';",/empty takeaway/],
    ["UNIT_CARD_LIST[0].takeaways.pop();",/takeaways must contain exactly three items/],
    ["UNIT_CARD_LIST[0].extra='field';",/exactly the approved fields/],
    ["UNIT_CARD_LIST[0]=null;",/card must be a non-null plain object/],
    ["UNIT_CARD_LIST.pop();",/expected exactly context and synthesis/],
  ];
  for (const [statement,message] of cases) assert.throws(()=>evaluate(mutateUnitCards('malformed card',statement)),message);
});

test('rejects symbol fields and non-ordinary nested Unit 5 card arrays before freezing',()=>{
  const cases=[
    ["UNIT_CARD_LIST[0][Symbol('extra')]='English extra.';",/card must contain exactly the approved fields/],
    ["UNIT_CARD_LIST[0].examSkills.extra='English extra.';",/examSkills must be an ordinary dense array/],
    ["Object.setPrototypeOf(UNIT_CARD_LIST[0].takeaways,Object.create(Array.prototype));",/takeaways must be an ordinary dense array/],
  ];
  for (const [statement,message] of cases) assert.throws(()=>evaluate(mutateUnitCards('card exact shape',statement)),message);
});

test('rejects non-enumerable required Unit 5 card fields before publication',()=>{
  const malformed=mutateUnitCards('non-enumerable card field',"Object.defineProperty(UNIT_CARD_LIST[0],'prompt',{enumerable:false});");
  assert.throws(()=>evaluate(malformed),/Invalid Unit 5 unit card .*exactly the approved fields/);
});

test('rejects nested card array accessors that mutate their parent before publication',()=>{
  const malformed=mutateUnitCards('mutating card array accessor',"{ const card=UNIT_CARD_LIST[0]; Object.defineProperty(card.examSkills,'0',{configurable:true,enumerable:true,get(){delete card.prompt; return 'Contextualization';}}); }");
  const sandbox={}; sandbox.window=sandbox;
  assert.throws(()=>vm.runInNewContext(malformed,sandbox),/Invalid Unit 5 unit card .*examSkills must be an ordinary dense array/);
  assert.equal(Object.hasOwn(sandbox,'APWH_U5_LOCATION_STUDY'),false);
});

test('rejects nested card accessors that inject symbol fields before publication',()=>{
  const malformed=mutateUnitCards('symbol-injecting card array accessor',"{ const card=UNIT_CARD_LIST[0]; Object.defineProperty(card.examSkills,'0',{configurable:true,enumerable:true,get(){card[Symbol('review-extra')]='English extra.'; return 'Contextualization';}}); }");
  const sandbox={}; sandbox.window=sandbox;
  assert.throws(()=>vm.runInNewContext(malformed,sandbox),/Invalid Unit 5 unit card .*examSkills must be an ordinary dense array/);
  assert.equal(Object.hasOwn(sandbox,'APWH_U5_LOCATION_STUDY'),false);
});

test('locks the canonical introduction and all five source-ledger columns for exactly thirty records',()=>{
  assert.equal(ledgerSource.startsWith(ledgerIntroduction),true);
  const rows=parseLedgerRows(ledgerSource);
  assert.deepEqual(rows,expectedLedgerRows);
  assert.equal(new Set(rows.map(row=>row[0])).size,30);
  for (let index=0;index<rows.length;index+=1) {
    const manifest=expectedManifest[index];
    assert.equal(rows[index][0],manifest[0]);
    assert.equal(rows[index][1],manifest[8].join(', '));
    assert.equal(rows[index][2],manifest[7]);
    assert.equal(rows[index][3],expectedRecordContent[index].source.locator);
    assert.ok(expectedLocations.has(manifest[1]),`${manifest[0]} learner location binding`);
  }
});

test('tokenizes escaped Markdown pipes without creating extra ledger columns',()=>{
  const row='| one | two \\| literal pipe | three | four | five |';
  assert.deepEqual(parseMarkdownRowCells(row),['one','two | literal pipe','three','four','five']);
  const oddRunRow=String.raw`| one | three \\\| literal pipe | three | four | five |`;
  assert.deepEqual(parseMarkdownRowCells(oddRunRow),['one',String.raw`three \| literal pipe`,'three','four','five']);
});

test('rejects source-ledger structural garbage, missing rows, extra columns, ordering, and field drift',()=>{
  const firstRow=ledgerSource.split('\n').find(line=>line.includes('`apwh-u5-london-natural-law-empiricism`'));
  const secondRow=ledgerSource.split('\n').find(line=>line.includes('`apwh-u5-london-social-contract-natural-rights`'));
  const lastRow=ledgerSource.split('\n').find(line=>line.includes('`apwh-u5-seneca-organized-feminism-limits`'));
  const fourColumnRow=`${firstRow.split('|').slice(0,-2).join('|')}|`;
  const cases=[
    [ledgerSource.replace(`${ledgerIntroduction}\n\n${ledgerHeader}`,`${ledgerIntroduction}\n\nInserted prose.\n\n${ledgerHeader}`),/table header must immediately follow canonical introduction/],
    [ledgerSource.replace(firstRow,`${firstRow} trailing garbage`),/row must start and end with pipe delimiters/],
    [ledgerSource.replace(firstRow,fourColumnRow),/row must contain exactly five columns/],
    [ledgerSource.replace(firstRow,firstRow?.replace(/ \|$/,' | extra |')),/row must contain exactly five columns/],
    [ledgerSource.replace(lastRow,''),/expected exactly 30 data rows/],
    [ledgerSource.replace(`${firstRow}\n${secondRow}`,`${secondRow}\n${firstRow}`),/row 1 does not match the canonical record order and fields/],
    [ledgerSource.replace('AMSCO AP World History, Unit 5, Topic 5.1','AMSCO AP World History, Unit 5'),/row 1 does not match the canonical record order and fields/],
    [ledgerSource.replace('`world-event-23-2`','world-event-23-2'),/malformed Main event cell/],
    [`${ledgerSource}\nTrailing garbage`,/unexpected trailing content/],
    [`${ledgerSource}\nTrailing apwh-u5-unparsed-garbage`,/unexpected trailing content/],
  ];
  for (const [source,message] of cases) {
    assert.notEqual(source,ledgerSource,'ledger fixture mutation');
    assert.throws(()=>parseLedgerRows(source),message);
  }
});

test('provides defensive Unit 4-compatible lookups and deep immutability', () => {
  const api=evaluate(); const first=api.records[0];
  assert.equal(api.getById(first.id),first); assert.equal(api.getById('missing'),null);
  assert.equal(api.locationName('missing'),null); assert.equal(api.getByLocation('missing').length,0);
  assert.notEqual(api.getByLocation('23'),api.getByLocation('23'));
  const copy=api.getByLocation('23'); copy.pop(); assert.equal(api.getByLocation('23').length,3);
  for (const value of [api,api.locationNumbers,api.records,first,first.topicCodes,first.themeIds,first.examSkills,first.keyPeople,first.keyPeople[0],first.keyTerms,first.keyTerms[0],first.evidence,first.source]) assert.equal(Object.isFrozen(value),true);
  const seen=new Set();
  const assertDeepFrozen=value=>{
    if (value===null||typeof value!=='object'||seen.has(value)) return;
    seen.add(value); assert.equal(Object.isFrozen(value),true);
    for (const key of Reflect.ownKeys(value)) assertDeepFrozen(value[key]);
  };
  assertDeepFrozen(api);
});

test('publishes the Unit 5 global with an immutable property descriptor',()=>{
  const sandbox=evaluateSandbox();
  const descriptor=Object.getOwnPropertyDescriptor(sandbox,'APWH_U5_LOCATION_STUDY');
  assert.equal(descriptor.value,sandbox.APWH_U5_LOCATION_STUDY);
  assert.equal(descriptor.enumerable,true);
  assert.equal(descriptor.configurable,false);
  assert.equal(descriptor.writable,false);
});

test('refuses to overwrite an existing Unit 5 global', () => {
  assert.throws(()=>evaluate(dataModuleSource,{APWH_U5_LOCATION_STUDY:{sentinel:true}}),/Invalid Unit 5 global APWH_U5_LOCATION_STUDY: refusing to overwrite existing value/);
});

const mutations = [
  ['wrong location/main-event binding',"'world-event-23-2',['5.1']","'world-event-51-0',['5.1']",'apwh-u5-london-natural-law-empiricism','mainEventKey'],
  ['duplicate sequence',"'apwh-u5-london-social-contract-natural-rights','23',2","'apwh-u5-london-social-contract-natural-rights','23',1",'apwh-u5-london-social-contract-natural-rights','duplicate sequence'],
  ['duplicate ID',"['apwh-u5-london-social-contract-natural-rights','23',2","['apwh-u5-london-natural-law-empiricism','23',2",'apwh-u5-london-natural-law-empiricism','duplicate record ID'],
  ['malformed date',"'1600–1750',1600,1750","'1600 to 1750',1600,1750",'apwh-u5-london-natural-law-empiricism','invalid dateLabel'],
  ['date-label mismatch',"'1651–1762',1651,1762","'1651–1763',1651,1762",'apwh-u5-london-social-contract-natural-rights','do not match'],
  ['missing Topic',"['5.1'],['CDI','TEC']","[],['CDI','TEC']",'apwh-u5-london-natural-law-empiricism','missing topicCodes'],
  ['invalid Topic',"['5.1'],['CDI','GOV']","['5.11'],['CDI','GOV']",'apwh-u5-london-social-contract-natural-rights','invalid topicCode'],
  ['duplicate Topic',"['5.1','5.2'],['CDI','GOV']","['5.1','5.1'],['CDI','GOV']",'apwh-u5-london-rights-language-atlantic','duplicate topicCode'],
  ['missing theme',"['5.1'],['CDI','TEC'],['Contextualization']","['5.1'],[],['Contextualization']",'apwh-u5-london-natural-law-empiricism','missing themeIds'],
  ['invalid theme',"['CDI','TEC'],['Contextualization']","['CDI','WAR'],['Contextualization']",'apwh-u5-london-natural-law-empiricism','invalid themeId'],
  ['duplicate theme',"['CDI','GOV'],['Causation']","['CDI','CDI'],['Causation']",'apwh-u5-london-social-contract-natural-rights','duplicate themeId'],
  ['missing skill',"['CDI','TEC'],['Contextualization']","['CDI','TEC'],[]",'apwh-u5-london-natural-law-empiricism','missing examSkills'],
  ['invalid skill',"['CDI','TEC'],['Contextualization']","['CDI','TEC'],['Recall']",'apwh-u5-london-natural-law-empiricism','invalid examSkill'],
  ['duplicate skill',"['Causation','CCOT']]","['Causation','Causation']]",'apwh-u5-london-rights-language-atlantic','duplicate examSkill'],
  ['empty content',"'Bacon used observation and Newton expressed physical motion as mathematical laws.'","''",'apwh-u5-london-natural-law-empiricism','summary must be a nonempty string'],
  ['non-string content',"'Bacon used observation and Newton expressed physical motion as mathematical laws.'",'42','apwh-u5-london-natural-law-empiricism','summary must be a nonempty string'],
  ['non-English content',"'Their methods encouraged a wider European and Atlantic Enlightenment to seek discoverable natural laws for society.'","'启蒙思想'",'apwh-u5-london-natural-law-empiricism','non-English significance'],
  ['malformed actor',"'Francis Bacon and Isaac Newton','Bacon advanced empirical inquiry; Newton demonstrated mathematical natural law.'","'', 'Bacon advanced empirical inquiry; Newton demonstrated mathematical natural law.'",'apwh-u5-london-natural-law-empiricism','keyPeople'],
  ['extra actor key','keyPeople: [{ name: person, role }]','keyPeople: [{ name: person, role, metadata: { mutable: true } }]','apwh-u5-london-natural-law-empiricism','keyPeople entry must contain exactly name and role'],
  ['non-plain actor','keyPeople: [{ name: person, role }]','keyPeople: [Object.assign(Object.create(null), { name: person, role })]','apwh-u5-london-natural-law-empiricism','keyPeople entry must be a plain object'],
  ['malformed term',"'empiricism','Knowledge built from observation and tested experience.'","'empiricism',''",'apwh-u5-london-natural-law-empiricism','keyTerms'],
  ['extra term key','keyTerms: [{ term, explanation }]','keyTerms: [{ term, explanation, metadata: { mutable: true } }]','apwh-u5-london-natural-law-empiricism','keyTerms entry must contain exactly explanation and term'],
  ['non-plain term','keyTerms: [{ term, explanation }]','keyTerms: [Object.assign(Object.create(null), { term, explanation })]','apwh-u5-london-natural-law-empiricism','keyTerms entry must be a plain object'],
  ['malformed evidence',"['Bacon argued that repeated observation could build reliable knowledge.','Newtonian physics presented a law-governed universe to later social thinkers.']","['Only one statement.']",'apwh-u5-london-natural-law-empiricism','evidence'],
  ['malformed source',"source: { id: 'amsco-apwh-u5', locator }","source: { id: 'wrong-source', locator }",'apwh-u5-london-natural-law-empiricism','source'],
  ['extra source key',"source: { id: 'amsco-apwh-u5', locator }","source: { id: 'amsco-apwh-u5', locator, metadata: { mutable: true } }",'apwh-u5-london-natural-law-empiricism','source must contain exactly id and locator'],
  ['non-plain source',"source: { id: 'amsco-apwh-u5', locator }","source: Object.assign(Object.create(null), { id: 'amsco-apwh-u5', locator })",'apwh-u5-london-natural-law-empiricism','source must be a plain object'],
  ['fourth record at a location',"['apwh-u5-london-rights-language-atlantic','23',3,'Rights Language Becomes Portable'","['apwh-u5-london-extra-record','23',3,'Extra Record','1700',1700,1700,'world-event-23-2',['5.1'],['CDI'],['Causation']],\n['apwh-u5-london-rights-language-atlantic','23',3,'Rights Language Becomes Portable'",'apwh-u5-london-rights-language-atlantic','exactly three records'],
  ['null raw records','const RAW_RECORDS = [','const RAW_RECORDS = null; const UNUSED_RAW_RECORDS = [','(missing ID)','raw records must be an array'],
];

for (const [label,search,replacement,id,rule] of mutations) {
  test(`rejects ${label}`,()=>{
    const malformed=dataModuleSource.replace(search,replacement);
    assert.notEqual(malformed,dataModuleSource,`${label} fixture mutation`);
    assert.throws(()=>evaluate(malformed),error=>{
      assert.match(error.message,/Invalid Unit 5/);
      assert.match(error.message,new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
      assert.match(error.message,new RegExp(rule));
      return true;
    });
  });
}

const locationMutations = [
  ['extra location',"'105':\"Women's Rights · Seneca Falls\",","'105':\"Women's Rights · Seneca Falls\",'999':'Extra Place',",'location registry must contain exactly the ordered locationNumbers'],
  ['empty location name',"'23':'Enlightenment Foundations · London'","'23':''",'location 23 must have a nonempty English name'],
  ['wrong canonical binding',"'23':'world-event-23-2'","'23':'world-event-23-9'",'location 23 has invalid main-event binding'],
];
for (const [label,search,replacement,rule] of locationMutations) {
  test(`rejects ${label} in the location registry`,()=>{
    const malformed=dataModuleSource.replace(search,replacement);
    assert.notEqual(malformed,dataModuleSource,`${label} fixture mutation`);
    assert.throws(()=>evaluate(malformed),error=>{
      assert.equal(error.message,`Invalid Unit 5 locations (locations): ${rule}`);
      return true;
    });
  });
}
