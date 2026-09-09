import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const moduleUrl = new URL('../data/apwh-u5-location-study.js', import.meta.url);
assert.equal(existsSync(moduleUrl), true, 'Unit 5 data module must exist');
const dataModuleSource = readFileSync(moduleUrl, 'utf8');
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
