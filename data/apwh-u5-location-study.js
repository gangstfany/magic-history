(function publishUnit5LocationStudy(root) {
  'use strict';
  if (Object.prototype.hasOwnProperty.call(root, 'APWH_U5_LOCATION_STUDY')) {
    throw new Error('Invalid Unit 5 global APWH_U5_LOCATION_STUDY: refusing to overwrite existing value');
  }
  const UNIT_ID = 'u5';
  const UNIT_NUMBER = 5;
  const VALID_TOPIC_CODES = new Set(['5.1','5.2','5.3','5.4','5.5','5.6','5.7','5.8','5.9','5.10']);
  const VALID_THEME_IDS = new Set(['GOV','ECN','CDI','SIO','TEC','ENV']);
  const VALID_EXAM_SKILLS = new Set(['Causation','Comparison','CCOT','Contextualization']);
  const LOCATION_NUMBERS = Object.freeze(['23','51','24','66','52','36','29','14','84','105']);
  const LOCATIONS = Object.freeze({
    '23':'Enlightenment Foundations · London',
    '51':'American Revolution · Philadelphia',
    '24':'French Revolution · Paris',
    '66':'Haitian Revolution · Saint-Domingue / Port-au-Prince',
    '52':'Latin American Independence · Caracas',
    '36':'Industrial Revolution · Manchester',
    '29':'Nationalism and Industrial Power · Berlin',
    '14':'Meiji State-Led Industrialization · Edo / Tokyo',
    '84':"Muhammad Ali's Egypt · Cairo",
    '105':"Women's Rights · Seneca Falls",
  });
  const LOCATION_BINDINGS = Object.freeze({'23':'world-event-23-2','51':'world-event-51-0','24':'world-event-24-1','66':'world-event-66-1','52':'world-event-52-0','36':'world-event-36-0','29':'world-event-29-0','14':'world-event-14-1','84':'world-event-84-2','105':'world-event-105-0'});
  const CANONICAL_LOCATIONS = Object.freeze([
    ['23','Enlightenment Foundations · London','world-event-23-2'],
    ['51','American Revolution · Philadelphia','world-event-51-0'],
    ['24','French Revolution · Paris','world-event-24-1'],
    ['66','Haitian Revolution · Saint-Domingue / Port-au-Prince','world-event-66-1'],
    ['52','Latin American Independence · Caracas','world-event-52-0'],
    ['36','Industrial Revolution · Manchester','world-event-36-0'],
    ['29','Nationalism and Industrial Power · Berlin','world-event-29-0'],
    ['14','Meiji State-Led Industrialization · Edo / Tokyo','world-event-14-1'],
    ['84',"Muhammad Ali's Egypt · Cairo",'world-event-84-2'],
    ['105',"Women's Rights · Seneca Falls",'world-event-105-0'],
  ]);
  const STUDY_MANIFEST = [
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

  let CONNECTION_DATA;
  function addCausalConnection(causeId,effectId,note) {
    const cause=CONNECTION_DATA.get(causeId); const effect=CONNECTION_DATA.get(effectId);
    if (!cause) throw new Error(`Invalid Unit 5 study connection causal: missing cause ${causeId}`);
    if (!effect) throw new Error(`Invalid Unit 5 study connection causal: missing effect ${effectId}`);
    if (causeId===effectId) throw new Error(`Invalid Unit 5 study connection causal: self connection ${causeId}`);
    cause.effectStudyPointIds.push(effectId); effect.causeStudyPointIds.push(causeId);
    cause.connectionNotes[effectId]=note; effect.connectionNotes[causeId]=note;
  }
  function addRelatedConnection(leftId,rightId,note) {
    const left=CONNECTION_DATA.get(leftId); const right=CONNECTION_DATA.get(rightId);
    if (!left) throw new Error(`Invalid Unit 5 study connection related: missing left ${leftId}`);
    if (!right) throw new Error(`Invalid Unit 5 study connection related: missing right ${rightId}`);
    if (leftId===rightId) throw new Error(`Invalid Unit 5 study connection related: self connection ${leftId}`);
    left.relatedStudyPointIds.push(rightId); right.relatedStudyPointIds.push(leftId);
    left.connectionNotes[rightId]=note; right.connectionNotes[leftId]=note;
  }

  const configureConnections = () => {
  CONNECTION_DATA = new Map(STUDY_MANIFEST.map(([id]) => [id, {
    causeStudyPointIds: [], effectStudyPointIds: [], relatedStudyPointIds: [], connectionNotes: {},
  }]));
  addCausalConnection('apwh-u5-london-natural-law-empiricism','apwh-u5-london-social-contract-natural-rights','Empirical and natural-law reasoning encouraged Enlightenment thinkers to seek discoverable principles for society and government.');
  addCausalConnection('apwh-u5-london-social-contract-natural-rights','apwh-u5-london-rights-language-atlantic','Debates over consent, natural rights, and popular sovereignty supplied a reusable political vocabulary that print and correspondence carried across the Atlantic.');
  addCausalConnection('apwh-u5-philadelphia-colonial-self-government','apwh-u5-philadelphia-declaration-independence','Colonial assemblies and disputes over taxation turned competing claims to sovereignty into organized resistance and a war for independence.');
  addCausalConnection('apwh-u5-philadelphia-declaration-independence','apwh-u5-philadelphia-republican-rights-limits','Independence enabled republican government to expand political participation for many white men while slavery and legal exclusions limited revolutionary rights.');
  addCausalConnection('apwh-u5-paris-old-regime-fiscal-crisis','apwh-u5-paris-popular-sovereignty-rights','War debt, unequal taxation, and estate privilege forced an institutional crisis in which Third Estate deputies and popular crowds relocated sovereignty toward the nation.');
  addCausalConnection('apwh-u5-paris-popular-sovereignty-rights','apwh-u5-paris-radicalization-napoleonic-diffusion','Foreign war and counterrevolution destabilized early constitutional reform, contributing to emergency radicalization before Napoleon centralized selected revolutionary changes.');
  addCausalConnection('apwh-u5-haiti-plantation-slavery','apwh-u5-haiti-enslaved-revolt-toussaint','Violent plantation exploitation and racial chattel slavery gave enslaved people compelling grievances while their own resistance networks enabled mass revolt.');
  addCausalConnection('apwh-u5-haiti-enslaved-revolt-toussaint','apwh-u5-haiti-emancipation-independence','Enslaved-led military resistance forced emancipation and defeated France’s attempt to restore control, enabling Dessalines to declare independence.');
  addCausalConnection('apwh-u5-caracas-creole-grievances-imperial-crisis','apwh-u5-caracas-bolivar-independence-wars','Creole grievances became revolutionary when Spain’s 1808 legitimacy crisis opened space for juntas and Bolívar’s military campaigns.');
  addCausalConnection('apwh-u5-caracas-bolivar-independence-wars','apwh-u5-caracas-fragmentation-caudillo-limits','Independence wars ended Spanish rule without resolving regional rivalries or social hierarchy, helping caudillos gain power as Gran Colombia fragmented.');
  addCausalConnection('apwh-u5-manchester-coal-capital-agriculture','apwh-u5-manchester-steam-factory-system','Coal, capital, transport, agricultural change, labor, and overseas resources jointly enabled steam-powered machinery and factory production.');
  addCausalConnection('apwh-u5-manchester-steam-factory-system','apwh-u5-manchester-urban-class-labor-response','Factories concentrated wage workers under dangerous, disciplined, and unequal conditions, prompting class formation, unions, strikes, and reform campaigns.');
  addCausalConnection('apwh-u5-berlin-napoleonic-occupation-nationalism','apwh-u5-berlin-bismarck-wars-unification','Occupation provoked nationalism and Prussian reform, but Bismarck later used those institutions and limited wars to convert national sentiment into unification.');
  addCausalConnection('apwh-u5-berlin-bismarck-wars-unification','apwh-u5-berlin-second-industrial-revolution-power','Prussian-led unification joined larger markets and state capacity that supported railways, finance, research, heavy industry, and military demand.');
  addCausalConnection('apwh-u5-tokyo-tokugawa-order-foreign-pressure','apwh-u5-tokyo-meiji-political-fiscal-reform','Foreign coercion exposed military weakness while Tokugawa-era markets and literacy provided capacities that Meiji leaders redirected through central reform.');
  addCausalConnection('apwh-u5-tokyo-meiji-political-fiscal-reform','apwh-u5-tokyo-state-industry-military-power','Centralized prefectures, land-tax revenue, conscription, and schools supplied the fiscal and institutional capacity for state-backed industry and military growth.');
  addCausalConnection('apwh-u5-cairo-military-pressure-reform','apwh-u5-cairo-cotton-conscription-factories','Foreign military pressure and Muhammad Ali’s consolidation of power motivated Egyptian officials to link cotton monopolies, conscription, schools, and factories to army reform.');
  addCausalConnection('apwh-u5-cairo-cotton-conscription-factories','apwh-u5-cairo-debt-intervention-limits','A coercive export-and-military reform program built capacity but exposed Egypt to Ottoman and European intervention, while later borrowing increased foreign financial control.');
  addCausalConnection('apwh-u5-seneca-rights-language-exclusion','apwh-u5-seneca-declaration-sentiments','The contradiction between universal equality claims and women’s legal exclusion, sharpened by abolitionist experience, encouraged activists to adapt revolutionary language at Seneca Falls.');
  addCausalConnection('apwh-u5-seneca-declaration-sentiments','apwh-u5-seneca-organized-feminism-limits','The convention’s grievance list and suffrage resolution gave women’s-rights organizers a shared program for later conventions, petitions, and associations.');
  addCausalConnection('apwh-u5-london-rights-language-atlantic','apwh-u5-philadelphia-declaration-independence','Portable natural-rights and consent language helped colonists frame resistance as a legitimate claim to independence.');
  addCausalConnection('apwh-u5-philadelphia-declaration-independence','apwh-u5-paris-popular-sovereignty-rights','French participation and financing in the American war worsened existing fiscal strain, while American constitutional precedent made rights-based political reordering more imaginable.');
  addCausalConnection('apwh-u5-paris-popular-sovereignty-rights','apwh-u5-haiti-enslaved-revolt-toussaint','Revolutionary universal-rights claims and metropolitan upheaval opened political space that enslaved people applied more radically through their own decisive collective action.');
  addCausalConnection('apwh-u5-paris-radicalization-napoleonic-diffusion','apwh-u5-caracas-bolivar-independence-wars','Napoleon’s invasion of Iberia weakened Spanish royal authority and produced the legitimacy crisis in which Bolívar’s wars developed, while Atlantic precedents supplied political language.');
  addCausalConnection('apwh-u5-paris-radicalization-napoleonic-diffusion','apwh-u5-berlin-napoleonic-occupation-nationalism','Napoleonic occupation and reorganization provoked German nationalism that was later mobilized through Prussian institutions.');
  addCausalConnection('apwh-u5-manchester-steam-factory-system','apwh-u5-cairo-military-pressure-reform','Industrial military and productive disparity created pressure for state-led reform under Muhammad Ali, while Egyptian officials retained agency in choosing and directing reforms.');
  addCausalConnection('apwh-u5-manchester-steam-factory-system','apwh-u5-tokyo-tokugawa-order-foreign-pressure','Industrial military disparity exposed through foreign pressure helped motivate Meiji state reform, which adapted domestic capacities rather than simply imitating Britain.');
  addCausalConnection('apwh-u5-philadelphia-republican-rights-limits','apwh-u5-seneca-rights-language-exclusion','The contradiction between universal revolutionary claims and women’s exclusion supplied both the language and the target for the Declaration of Sentiments.');

  addRelatedConnection('apwh-u5-philadelphia-republican-rights-limits','apwh-u5-haiti-emancipation-independence','Compare American political independence, which retained slavery and major exclusions, with Haitian independence joined to emancipation.');
  addRelatedConnection('apwh-u5-haiti-emancipation-independence','apwh-u5-caracas-fragmentation-caudillo-limits','Compare Haiti’s enslaved-led social revolution with creole-led Latin American independence, where political separation preserved more of the existing hierarchy.');
  addRelatedConnection('apwh-u5-paris-radicalization-napoleonic-diffusion','apwh-u5-berlin-bismarck-wars-unification','Compare French revolutionary and occupational diffusion with Bismarck’s state-directed wars and institution-led German unification.');
  addRelatedConnection('apwh-u5-cairo-cotton-conscription-factories','apwh-u5-tokyo-meiji-political-fiscal-reform','Compare Egyptian and Japanese state-led reform: both mobilized taxes and coercion, but Japan retained greater fiscal sovereignty and achieved more durable autonomy under weaker foreign constraint.');
  addRelatedConnection('apwh-u5-manchester-urban-class-labor-response','apwh-u5-seneca-organized-feminism-limits','Compare labor organizing by an industrial class constituency with Seneca Falls feminism’s rights-based challenge to gender exclusion; both answered exclusion through different constituencies and methods.');
  };


  const P = (id, summary, significance, person, role, term, explanation, evidence, examConnection, locator) => ({
  id, summary, significance, keyPeople: [{ name: person, role }], keyTerms: [{ term, explanation }],
  evidence, examConnection, source: { id: 'amsco-apwh-u5', locator },
});
  const RAW_RECORDS = [
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

  const UNIT_CARD_LIST = [
    {
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
    {
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
  ];


  const describe = value => value === '' ? '""' : String(value);
  const fail = (id, rule) => { throw new Error(`Invalid Unit 5 study record ${id || '(missing ID)'}: ${rule}`); };
  const failCard = (card,rule) => {
    const kind=card&&typeof card.kind==='string'&&card.kind?card.kind:'(missing kind)';
    const id=card&&typeof card.id==='string'&&card.id.trim()?card.id:card?.id===undefined||card?.id===null?'(missing ID)':String(card.id);
    throw new Error(`Invalid Unit 5 unit card ${kind} ${id}: ${rule}`);
  };
  const english = value => {
    if (typeof value !== 'string' || !value.trim()) return false;
    const letters=value.match(/\p{Letter}/gu)||[];
    return letters.length>0 && letters.every(letter=>/\p{Script=Latin}/u.test(letter));
  };
  const plainObject = value => value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.getPrototypeOf(value)===Object.prototype;
  const ordinaryDataDescriptor = (descriptor,{enumerable,configurable,writable}) => descriptor!==undefined
    && Object.prototype.hasOwnProperty.call(descriptor,'value')
    && descriptor.enumerable===enumerable
    && descriptor.configurable===configurable
    && descriptor.writable===writable;
  const hasExactOwnEnumerableDataFields = (value,expectedKeys) => {
    const descriptors=Object.getOwnPropertyDescriptors(value);
    const keys=Reflect.ownKeys(descriptors);
    return keys.length===expectedKeys.length
      && keys.every(key=>typeof key==='string')
      && [...keys].sort().every((key,index)=>key===[...expectedKeys].sort()[index])
      && expectedKeys.every(key=>ordinaryDataDescriptor(descriptors[key],{enumerable:true,configurable:true,writable:true}));
  };
  const ordinaryDenseArray = value => {
    if (!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype) return false;
    const descriptors=Object.getOwnPropertyDescriptors(value);
    const keys=Reflect.ownKeys(descriptors);
    const lengthDescriptor=descriptors.length;
    if (!ordinaryDataDescriptor(lengthDescriptor,{enumerable:false,configurable:false,writable:true})||!Number.isSafeInteger(lengthDescriptor.value)||lengthDescriptor.value<0) return false;
    const indexKeys=Array.from({length:lengthDescriptor.value},(_,index)=>String(index));
    const expectedKeys=indexKeys.concat('length');
    return keys.length===expectedKeys.length
      && keys.every(key=>typeof key==='string')
      && expectedKeys.every(key=>Object.prototype.hasOwnProperty.call(descriptors,key))
      && indexKeys.every(key=>ordinaryDataDescriptor(descriptors[key],{enumerable:true,configurable:true,writable:true}));
  };
  const validateLocations = () => {
    const canonicalNumbers=CANONICAL_LOCATIONS.map(entry=>entry[0]);
    if (LOCATION_NUMBERS.length!==canonicalNumbers.length||LOCATION_NUMBERS.some((number,index)=>number!==canonicalNumbers[index])) {
      throw new Error('Invalid Unit 5 locations (locations): location registry must contain exactly the ordered locationNumbers');
    }
    const keys=Object.keys(LOCATIONS);
    if (keys.length!==canonicalNumbers.length||canonicalNumbers.some(number=>!Object.prototype.hasOwnProperty.call(LOCATIONS,number))) {
      throw new Error('Invalid Unit 5 locations (locations): location registry must contain exactly the ordered locationNumbers');
    }
    for (const [number,name,binding] of CANONICAL_LOCATIONS) {
      if (!english(LOCATIONS[number])) throw new Error(`Invalid Unit 5 locations (locations): location ${number} must have a nonempty English name`);
      if (LOCATIONS[number]!==name) throw new Error(`Invalid Unit 5 locations (locations): location ${number} does not match its canonical name`);
      if (LOCATION_BINDINGS[number]!==binding) throw new Error(`Invalid Unit 5 locations (locations): location ${number} has invalid main-event binding`);
    }
    if (Object.keys(LOCATION_BINDINGS).length!==canonicalNumbers.length) throw new Error('Invalid Unit 5 locations (locations): location registry must contain exactly the ordered locationNumbers');
  };
  const validateValues = (id,values,allowed,field,singular) => {
    if (!Array.isArray(values)) fail(id,`${field} must be an array`);
    if (!values.length) fail(id,`missing ${field}`);
    const seen=new Set();
    for (const value of values) {
      if (!allowed.has(value)) fail(id,`invalid ${singular} ${describe(value)}`);
      if (seen.has(value)) fail(id,`duplicate ${singular} ${describe(value)}`);
      seen.add(value);
    }
  };
  const validateDate = (id,label,start,end) => {
    if (typeof label!=='string'||!/^(?:\d{4}|\d{4}–\d{4})$/.test(label)) fail(id,`invalid dateLabel ${describe(label)}`);
    if (!Number.isInteger(start)||!Number.isInteger(end)||start>end) fail(id,'invalid startYear or endYear');
    const years=label.match(/\d{4}/g).map(Number);
    if (years[0]!==start||years.at(-1)!==end) fail(id,`dateLabel years ${years[0]}–${years.at(-1)} do not match startYear ${start} and endYear ${end}`);
  };
  const validateManifest = rows => {
    if (!Array.isArray(rows)) fail('(missing ID)','manifest must be an array');
    const seen=new Set();
    for (const row of rows) {
      const id=Array.isArray(row)?row[0]:'(missing ID)';
      if (!Array.isArray(row)||row.length!==11) fail(id,'manifest row must contain eleven fields');
      const [recordId,location,sequence,title,label,start,end,event,topics,themes,skills]=row;
      if (typeof recordId!=='string'||!/^apwh-u5-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(recordId)) fail(recordId,'invalid stable ID');
      if (seen.has(recordId)) fail(recordId,'duplicate record ID'); seen.add(recordId);
      if (!LOCATION_NUMBERS.includes(location)) fail(recordId,`invalid locationNumber ${describe(location)}`);
      if (!Number.isInteger(sequence)||![1,2,3].includes(sequence)) fail(recordId,`invalid sequence ${describe(sequence)}`);
      if (!english(title)) fail(recordId,'invalid title');
      validateDate(recordId,label,start,end);
      if (event!==LOCATION_BINDINGS[location]) fail(recordId,`invalid mainEventKey ${describe(event)} for location ${location}`);
      validateValues(recordId,topics,VALID_TOPIC_CODES,'topicCodes','topicCode');
      validateValues(recordId,themes,VALID_THEME_IDS,'themeIds','themeId');
      validateValues(recordId,skills,VALID_EXAM_SKILLS,'examSkills','examSkill');
    }
    for (const location of LOCATION_NUMBERS) {
      const local=rows.filter(row=>row[1]===location);
      if (local.length!==3) fail(local.at(-1)?.[0]||`(location ${location})`,`location ${location} must contain exactly three records`);
      const sequences=local.map(row=>row[2]);
      const duplicateIndex=sequences.findIndex((value,index)=>sequences.indexOf(value)!==index);
      if (duplicateIndex!==-1) fail(local[duplicateIndex][0],`duplicate sequence ${sequences[duplicateIndex]} at location ${location}`);
    }
    if (rows.length!==30) fail(rows[30]?.[0]||'(missing ID)','expected exactly 30 records');
    const covered=new Set(rows.flatMap(row=>row[8]));
    if ([...VALID_TOPIC_CODES].some(topic=>!covered.has(topic))) fail('(manifest)','topicCodes must cover 5.1 through 5.10');
  };
  const expectedLocator = topics => `AMSCO AP World History, Unit 5, ${topics.length===1?'Topic':'Topics'} ${topics.length===1?topics[0]:topics.length===2?topics.join(' and '):`${topics.slice(0,-1).join(', ')}, and ${topics.at(-1)}`}`;
  const validateRaw = records => {
    if (!Array.isArray(records)) fail('(missing ID)','raw records must be an array');
    if (records.length!==30) fail(records[30]?.id||'(missing ID)','expected exactly 30 raw records');
    const manifestById=new Map(STUDY_MANIFEST.map(row=>[row[0],row])); const seen=new Set();
    for (const record of records) {
      const id=record?.id;
      if (!id) fail('(missing ID)','missing raw record ID');
      if (seen.has(id)) fail(id,'duplicate raw record ID'); seen.add(id);
      const row=manifestById.get(id); if (!row) fail(id,'raw record is absent from manifest');
      if (Object.getPrototypeOf(record)!==Object.prototype||Object.keys(record).sort().join(',')!=='evidence,examConnection,id,keyPeople,keyTerms,significance,source,summary') fail(id,'malformed raw record shape');
      for (const field of ['summary','significance','examConnection']) {
        if (typeof record[field]!=='string'||!record[field].trim()) fail(id,`${field} must be a nonempty string`);
        if (!english(record[field])) fail(id,`non-English ${field}`);
      }
      if (!Array.isArray(record.keyPeople)||!record.keyPeople.length) fail(id,'malformed keyPeople');
      for (const person of record.keyPeople) {
        if (!plainObject(person)) fail(id,'keyPeople entry must be a plain object');
        if (Object.keys(person).sort().join(',')!=='name,role') fail(id,'keyPeople entry must contain exactly name and role');
        if (!english(person.name)||!english(person.role)) fail(id,'malformed keyPeople');
      }
      if (!Array.isArray(record.keyTerms)||!record.keyTerms.length) fail(id,'malformed keyTerms');
      for (const term of record.keyTerms) {
        if (!plainObject(term)) fail(id,'keyTerms entry must be a plain object');
        if (Object.keys(term).sort().join(',')!=='explanation,term') fail(id,'keyTerms entry must contain exactly explanation and term');
        if (!english(term.term)||!english(term.explanation)) fail(id,'malformed keyTerms');
      }
      if (!Array.isArray(record.evidence)||record.evidence.length<2||record.evidence.some(statement=>!english(statement))) fail(id,'malformed evidence');
      if (!plainObject(record.source)) fail(id,'source must be a plain object');
      if (Object.keys(record.source).sort().join(',')!=='id,locator') fail(id,'source must contain exactly id and locator');
      if (!record.source||record.source.id!=='amsco-apwh-u5'||record.source.locator!==expectedLocator(row[8])) fail(id,'malformed source');
    }
    for (const [id] of manifestById) if (!seen.has(id)) fail(id,'missing raw record');
  };
  const validateUnitCards = cards => {
    if (!Array.isArray(cards)) failCard(null,'cards must be an array');
    if (!ordinaryDenseArray(cards)) failCard(null,'cards must be an ordinary dense array');
    const keys=['examSkills','id','kind','prompt','role','summary','takeaways','title'];
    const kinds=new Set(); const ids=new Set();
    for (const card of cards) {
      if (!plainObject(card)) failCard(card,'card must be a non-null plain object');
      if (!hasExactOwnEnumerableDataFields(card,keys)) failCard(card,'card must contain exactly the approved fields');
      if (!['context','synthesis'].includes(card.kind)) failCard(card,`invalid kind ${describe(card.kind)}`);
      if (kinds.has(card.kind)) failCard(card,`duplicate kind ${card.kind}`); kinds.add(card.kind);
      if (typeof card.id!=='string'||!card.id.trim()) failCard(card,'card ID must be a nonempty string');
      if (ids.has(card.id)) failCard(card,'duplicate card ID'); ids.add(card.id);
      if (!new RegExp(`^apwh-u5-${card.kind}-[a-z0-9]+(?:-[a-z0-9]+)*$`).test(card.id)) failCard(card,'invalid stable ID');
      for (const field of ['role','title','summary','prompt']) {
        if (typeof card[field]!=='string'||!card[field].trim()) failCard(card,`missing ${field}`);
        if (!english(card[field])) failCard(card,`non-English ${field}`);
      }
      if (!Array.isArray(card.examSkills)) failCard(card,'examSkills must be an array');
      if (!ordinaryDenseArray(card.examSkills)) failCard(card,'examSkills must be an ordinary dense array');
      if (!card.examSkills.length) failCard(card,'missing examSkills');
      if (card.examSkills.length>2) failCard(card,'too many examSkills');
      const seenSkills=new Set();
      for (const skill of card.examSkills) {
        if (typeof skill!=='string'||!skill.trim()||!VALID_EXAM_SKILLS.has(skill)) failCard(card,`invalid examSkill ${describe(skill)}`);
        if (seenSkills.has(skill)) failCard(card,`duplicate examSkill ${skill}`); seenSkills.add(skill);
      }
      if (!Array.isArray(card.takeaways)) failCard(card,'takeaways must be an array');
      if (!ordinaryDenseArray(card.takeaways)) failCard(card,'takeaways must be an ordinary dense array');
      if (card.takeaways.length!==3) failCard(card,'takeaways must contain exactly three items');
      for (const takeaway of card.takeaways) {
        if (typeof takeaway!=='string'||!takeaway.trim()) failCard(card,'empty takeaway');
        if (!english(takeaway)) failCard(card,'non-English takeaway');
      }
    }
    if (cards.length!==2||!kinds.has('context')||!kinds.has('synthesis')) failCard(null,'expected exactly context and synthesis');
  };
  const freezeUnitCard = card => Object.freeze({...card,examSkills:Object.freeze([...card.examSkills]),takeaways:Object.freeze([...card.takeaways])});
  validateLocations();
  validateManifest(STUDY_MANIFEST);
  validateRaw(RAW_RECORDS);
  configureConnections();
  const contextById = new Map(STUDY_MANIFEST.map(row => [row[0], row]));
  const validateConnectionShapes = () => {
    const connectionKeys=['causeStudyPointIds','connectionNotes','effectStudyPointIds','relatedStudyPointIds'];
    for (const [id,connections] of CONNECTION_DATA) {
      if (!plainObject(connections)||!hasExactOwnEnumerableDataFields(connections,connectionKeys)) fail(id,'malformed connection structure');
      for (const category of ['causeStudyPointIds','effectStudyPointIds','relatedStudyPointIds']) {
        if (!ordinaryDenseArray(connections[category])) fail(id,`${category} must be an ordinary dense array`);
      }
      if (!plainObject(connections.connectionNotes)) fail(id,'connectionNotes must be a plain object');
    }
    const reciprocals={causeStudyPointIds:'effectStudyPointIds',effectStudyPointIds:'causeStudyPointIds',relatedStudyPointIds:'relatedStudyPointIds'};
    for (const [id,connections] of CONNECTION_DATA) {
      for (const [category,reciprocal] of Object.entries(reciprocals)) {
        for (const targetId of connections[category]) {
          const target=CONNECTION_DATA.get(targetId);
          if (target&&!target[reciprocal].includes(id)) fail(id,`nonreciprocal ${category} connection to ${targetId}`);
        }
      }
      const linkedIds=[...connections.causeStudyPointIds,...connections.effectStudyPointIds,...connections.relatedStudyPointIds];
      const noteKeys=Reflect.ownKeys(connections.connectionNotes);
      const extraNoteKey=noteKeys.find(key=>typeof key!=='string'||!linkedIds.includes(key));
      if (extraNoteKey!==undefined) fail(id,`extra connection note key ${describe(extraNoteKey)}`);
      const missingNoteKey=linkedIds.find(key=>!noteKeys.includes(key));
      if (missingNoteKey!==undefined) fail(id,`missing connection note for ${missingNoteKey}`);
      if (!hasExactOwnEnumerableDataFields(connections.connectionNotes,[...new Set(linkedIds)])) fail(id,'connectionNotes must contain ordinary enumerable data fields');
    }
  };
  validateConnectionShapes();
  validateUnitCards(UNIT_CARD_LIST);
  const UNIT_CARDS=Object.freeze(Object.fromEntries(UNIT_CARD_LIST.map(card=>[card.kind,freezeUnitCard(card)])));
  const freezeRecord = raw => {
    const [id,locationNumber,sequence,title,dateLabel,startYear,endYear,mainEventKey,topicCodes,themeIds,examSkills]=contextById.get(raw.id);
    const connections=CONNECTION_DATA.get(raw.id);
    return Object.freeze({
      ...raw,id,locationNumber,sequence,title,dateLabel,startYear,endYear,mainEventKey,
      topicCodes:Object.freeze([...topicCodes]),themeIds:Object.freeze([...themeIds]),examSkills:Object.freeze([...examSkills]),
      causeStudyPointIds:Object.freeze([...connections.causeStudyPointIds]),effectStudyPointIds:Object.freeze([...connections.effectStudyPointIds]),
      relatedStudyPointIds:Object.freeze([...connections.relatedStudyPointIds]),connectionNotes:Object.freeze({...connections.connectionNotes}),
      keyPeople:Object.freeze(raw.keyPeople.map(value=>Object.freeze({...value}))),
      keyTerms:Object.freeze(raw.keyTerms.map(value=>Object.freeze({...value}))),
      evidence:Object.freeze([...raw.evidence]),source:Object.freeze({...raw.source}),
    });
  };
  const RECORDS=Object.freeze(STUDY_MANIFEST.map(row=>freezeRecord(RAW_RECORDS.find(record=>record.id===row[0]))));
  const byId=new Map(RECORDS.map(record=>[record.id,record]));
  const validateStudyGraph = () => {
    const reciprocals={causeStudyPointIds:'effectStudyPointIds',effectStudyPointIds:'causeStudyPointIds',relatedStudyPointIds:'relatedStudyPointIds'};
    for (const record of RECORDS) {
      const categories=new Map(); const linked=[];
      for (const [category,reciprocal] of Object.entries(reciprocals)) {
        for (const targetId of record[category]) {
          if (targetId===record.id) fail(record.id,`self connection in ${category}`);
          if (record[category].indexOf(targetId)!==record[category].lastIndexOf(targetId)) fail(record.id,`duplicate connection in ${category} to ${describe(targetId)}`);
          if (categories.has(targetId)) fail(record.id,`cross-category connection ${targetId} in ${categories.get(targetId)} and ${category}`);
          categories.set(targetId,category); linked.push(targetId);
          const target=byId.get(targetId); if (!target) fail(record.id,`unresolved connection ${targetId}`);
          if (!target[reciprocal].includes(record.id)) fail(record.id,`nonreciprocal ${category} connection to ${targetId}`);
          const note=record.connectionNotes[targetId];
          if (typeof note!=='string'||!note.trim()) fail(record.id,`missing connection note for ${targetId}`);
          if (!english(note)) fail(record.id,`non-English connection note for ${targetId}`);
          if (target.connectionNotes[record.id]!==note) fail(record.id,`nonreciprocal connection note for ${targetId}`);
        }
      }
      if (!linked.length) fail(record.id,'missing connection');
      const extra=Reflect.ownKeys(record.connectionNotes).find(id=>typeof id!=='string'||!linked.includes(id));
      if (extra!==undefined) fail(record.id,`extra connection note key ${describe(extra)}`);
    }
  };
  validateStudyGraph();
  const byLocation=new Map(LOCATION_NUMBERS.map(number=>[number,RECORDS.filter(record=>record.locationNumber===number)]));
  const api=Object.freeze({
    unitId:UNIT_ID,unitNumber:UNIT_NUMBER,connectionTimelineMode:'main-event',
    locationNumbers:LOCATION_NUMBERS,records:RECORDS,unitCards:UNIT_CARDS,
    getById(id){return byId.get(String(id))||null;},
    getByLocation(number){return [...(byLocation.get(String(number))||[])];},
    locationName(number){const key=String(number);return Object.prototype.hasOwnProperty.call(LOCATIONS,key)?LOCATIONS[key]:null;},
    getUnitCard(kind){const key=String(kind);return Object.prototype.hasOwnProperty.call(UNIT_CARDS,key)?UNIT_CARDS[key]:null;},
  });
  Object.defineProperty(root,'APWH_U5_LOCATION_STUDY',{value:api,enumerable:true,configurable:false,writable:false});
})(typeof window !== 'undefined' ? window : globalThis);
