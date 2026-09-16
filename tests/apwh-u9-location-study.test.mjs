import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const moduleUrl=new URL('../data/apwh-u9-location-study.js',import.meta.url);
const source=existsSync(moduleUrl)?readFileSync(moduleUrl,'utf8'):'';
const evaluateSandbox=(code=source,seed={})=>{const sandbox={...seed};sandbox.window=sandbox;vm.runInNewContext(code,sandbox);return sandbox;};
const evaluate=(code=source,seed={})=>evaluateSandbox(code,seed).APWH_U9_LOCATION_STUDY;
const expectedLocations=new Map([
  ['11','Food Security & Unequal Inputs · India / Amritsar–Punjab'],
  ['70','Digital Infrastructure & Knowledge Economy · United States / San Francisco'],
  ['15','Special Economic Zones & Export Manufacturing · China / Guangzhou'],
  ['65','Free Trade & Maquiladoras · Mexico / Ciudad Juárez'],
  ['5','Market Reform & Political Control · China / Beijing'],
  ['54','Global Financial Governance · United States / Washington, D.C.'],
  ['112','Resistance to Globalization · United States / Seattle'],
  ['24','Human Rights & Climate Governance · France / Paris'],
  ['34','Global Health Cooperation · Switzerland / Geneva'],
  ['110','Digital Culture & Soft Power · South Korea / Seoul'],
]);
const expectedBindings=new Map([
  ['11','world-event-11-3'],['70','world-event-70-2'],['15','world-event-15-1'],['65','world-event-65-0'],['5','world-event-5-13'],['54','world-event-54-5'],['112','world-event-112-0'],['24','world-event-24-9'],['34','world-event-34-2'],['110','world-event-110-1'],
]);
const expectedManifest=[
  ['apwh-u9-amritsar-high-yield-seeds-input-package','11',1,'High-Yield Seeds and Complementary Inputs','1960s–1970s',1960,1979,'world-event-11-3',['9.1','9.3'],['TEC','ENV'],['Contextualization','Causation']],
  ['apwh-u9-amritsar-unequal-access-land-consolidation','11',2,'Unequal Access, Mechanization, and Land Consolidation','1960s–1980s',1960,1989,'world-event-11-3',['9.3','9.4'],['ECN','SIO'],['Causation','Comparison']],
  ['apwh-u9-amritsar-food-population-environmental-costs','11',3,'Food Supply, Population Growth, and Environmental Costs','1970s–2010s',1970,2019,'world-event-11-3',['9.3','9.9'],['ENV','SIO'],['Causation','CCOT']],
  ['apwh-u9-san-francisco-public-research-digital-infrastructure','70',1,'Public Research and Digital Infrastructure','1940s–1980s',1940,1989,'world-event-70-2',['9.1'],['TEC','GOV'],['Contextualization']],
  ['apwh-u9-san-francisco-computing-internet-information-costs','70',2,'Computing, Internet, and Lower Information Costs','1970s–1990s',1970,1999,'world-event-70-2',['9.1','9.4'],['TEC','ECN'],['Causation']],
  ['apwh-u9-san-francisco-knowledge-economy-distributed-production','70',3,'Knowledge Economy and Uneven Global Production','1990s–2010s',1990,2019,'world-event-70-2',['9.4','9.9'],['ECN','SIO'],['Causation','CCOT']],
  ['apwh-u9-guangzhou-market-reform-special-economic-zones','15',1,'Market Reform and Special Economic Zones','1978–1984',1978,1984,'world-event-15-1',['9.4'],['ECN','GOV'],['Contextualization','Causation']],
  ['apwh-u9-guangzhou-foreign-investment-export-manufacturing','15',2,'Foreign Investment and Export Manufacturing','1980s–2001',1980,2001,'world-event-15-1',['9.4'],['ECN','GOV'],['Causation']],
  ['apwh-u9-guangzhou-supply-chain-labor-environmental-costs','15',3,'Supply-Chain Expansion, Labor, and Environmental Costs','2001–2010s',2001,2019,'world-event-15-1',['9.3','9.4','9.9'],['ECN','SIO','ENV'],['Causation','CCOT']],
  ['apwh-u9-ciudad-juarez-border-industrialization','65',1,'Border Industrialization before NAFTA','1965–1993',1965,1993,'world-event-65-0',['9.4'],['ECN','GOV'],['Contextualization']],
  ['apwh-u9-ciudad-juarez-nafta-maquiladora-expansion','65',2,'NAFTA and Maquiladora Expansion','1994–2000s',1994,2009,'world-event-65-0',['9.4'],['ECN','GOV'],['Causation']],
  ['apwh-u9-ciudad-juarez-employment-gender-labor-environment','65',3,'Employment, Gender, Labor, and Environmental Tradeoffs','1990s–2010s',1990,2019,'world-event-65-0',['9.3','9.4','9.9'],['ECN','SIO','ENV'],['Comparison','CCOT']],
  ['apwh-u9-beijing-market-reform-political-control','5',1,'Market Reform without Political Liberalization','1978–1989',1978,1989,'world-event-5-13',['9.4','9.5'],['ECN','GOV'],['Contextualization','Causation']],
  ['apwh-u9-beijing-tiananmen-protest-repression','5',2,'Tiananmen Protest and State Repression','1989',1989,1989,'world-event-5-13',['9.5'],['GOV','SIO'],['Causation']],
  ['apwh-u9-beijing-wto-integration-information-control','5',3,'WTO Integration and Controlled Information','2001–2010s',2001,2019,'world-event-5-13',['9.4','9.5','9.9'],['GOV','ECN','TEC'],['Causation','CCOT']],
  ['apwh-u9-washington-bretton-woods-financial-institutions','54',1,'Bretton Woods and Postwar Financial Institutions','1944–1945',1944,1945,'world-event-54-5',['9.8'],['GOV','ECN'],['Contextualization']],
  ['apwh-u9-washington-development-lending-conditionality','54',2,'Development Lending and Policy Conditionality','1950s–2000s',1950,2009,'world-event-54-5',['9.4','9.8'],['ECN','GOV'],['Causation']],
  ['apwh-u9-washington-institutional-power-benefits-criticism','54',3,'Institutional Power, Development Claims, and Criticism','1990s–2010s',1990,2019,'world-event-54-5',['9.7','9.8','9.9'],['GOV','ECN'],['Causation','Comparison']],
  ['apwh-u9-seattle-wto-expansion-rulemaking-criticism','112',1,'WTO Expansion and Rule-Making Criticism','1995–1999',1995,1999,'world-event-112-0',['9.7','9.8'],['GOV','ECN'],['Contextualization','Causation']],
  ['apwh-u9-seattle-coalition-protest-digital-organization','112',2,'Coalition Protest and Digital Organization','1999',1999,1999,'world-event-112-0',['9.1','9.5','9.7'],['GOV','SIO','TEC'],['Causation']],
  ['apwh-u9-seattle-fair-trade-labor-continuing-resistance','112',3,'Fair Trade, Labor Standards, and Continuing Resistance','2000s–2010s',2000,2019,'world-event-112-0',['9.5','9.7','9.9'],['GOV','ECN','SIO'],['CCOT','Comparison']],
  ['apwh-u9-paris-universal-rights-global-norm','24',1,'Universal Rights as a Global Norm','1948',1948,1948,'world-event-24-9',['9.5','9.8'],['GOV','CDI'],['Contextualization']],
  ['apwh-u9-paris-kyoto-burden-sharing-debate','24',2,'Kyoto-to-Paris Burden-Sharing Debate','1997–2015',1997,2015,'world-event-24-9',['9.3','9.8'],['ENV','GOV'],['Causation','Comparison']],
  ['apwh-u9-paris-voluntary-climate-governance-limits','24',3,'Paris Agreement and the Limits of Voluntary Governance','2015–2019',2015,2019,'world-event-24-9',['9.3','9.8','9.9'],['ENV','GOV'],['Causation','CCOT']],
  ['apwh-u9-geneva-vaccination-smallpox-eradication','34',1,'Vaccination Networks and Smallpox Eradication','1967–1980',1967,1980,'world-event-34-2',['9.2','9.8'],['TEC','GOV'],['Contextualization','Causation']],
  ['apwh-u9-geneva-hiv-treatment-unequal-access','34',2,'HIV/AIDS Treatment and Unequal Access','1980s–2000s',1980,2009,'world-event-34-2',['9.2','9.9'],['TEC','SIO'],['Causation','Comparison']],
  ['apwh-u9-geneva-polio-ebola-coordination-limits','34',3,'Polio, Ebola, and the Limits of Health Coordination','1988–2010s',1988,2019,'world-event-34-2',['9.2','9.8','9.9'],['TEC','GOV'],['Causation','CCOT']],
  ['apwh-u9-seoul-state-supported-cultural-industries','110',1,'State Support for Cultural Industries','1990s–2000s',1990,2009,'world-event-110-1',['9.4','9.6'],['CDI','ECN','GOV'],['Contextualization','Causation']],
  ['apwh-u9-seoul-digital-platforms-transnational-audiences','110',2,'Digital Platforms and Transnational Audiences','2000s–2010s',2000,2019,'world-event-110-1',['9.1','9.6'],['CDI','TEC','ECN'],['Causation']],
  ['apwh-u9-seoul-hybrid-culture-exports-soft-power','110',3,'Hybrid Culture, Exports, and Soft Power','2000s–2010s',2000,2019,'world-event-110-1',['9.6','9.9'],['CDI','ECN'],['Comparison','CCOT']],
];
const L=topics=>`AMSCO AP World History, Unit 9, ${topics.length===1?'Topic':'Topics'} ${topics.length===1?topics[0]:topics.length===2?topics.join(' and '):`${topics.slice(0,-1).join(', ')}, and ${topics.at(-1)}`}`;
const placeholderEdge=['apwh-u9-amritsar-high-yield-seeds-input-package','apwh-u9-amritsar-unequal-access-land-consolidation','High-yield seeds raised output only when combined with costly inputs, so unequal access shaped who received the largest gains.'];
const expectedUnitCards={
  context:{id:'apwh-u9-context-accelerating-global-connections',kind:'context',role:'Unit 9 Context Card',title:'Accelerating Global Connections',examSkills:['Contextualization','Causation'],summary:'New technologies, state policies, and international institutions accelerated the movement of goods, capital, information, culture, and disease after 1900. These connections built on earlier networks while changing their speed, scale, and reach.',prompt:'Which technologies and political choices accelerated global connections after 1900?',takeaways:['Communication and transportation reduced the cost of coordinating across distance.','Governments and institutions shaped the rules under which integration occurred.','Faster connections distributed opportunities and risks unevenly.']},
  synthesis:{id:'apwh-u9-synthesis-globalization-benefits-resistance',kind:'synthesis',role:'Unit 9 Synthesis Card',title:'Globalization, Uneven Benefits, and Resistance',examSkills:['Comparison','CCOT'],summary:'Global integration expanded production, communication, cooperation, and cultural exchange while generating unequal gains, environmental pressures, political control, and organized resistance. Local actors adapted global systems rather than simply receiving them.',prompt:'How did communities preserve agency while responding to the benefits and costs of globalization?',takeaways:['Globalization produced different outcomes across places and social groups.','States remained powerful participants in markets, information, health, and culture.','Resistance and adaptation changed global institutions and cultural forms.']},
};
const clone=value=>JSON.parse(JSON.stringify(value));
const replace=(search,replacement)=>{const code=source.replace(search,replacement);assert.notEqual(code,source,`fixture mutation: ${search}`);return code;};
const assertInvalid=(code,rule)=>assert.throws(()=>evaluate(code),error=>{assert.equal(error.name,'Error');assert.match(error.message,/Invalid Unit 9/);assert.match(error.message,rule);return true;});

test('publishes the exact immutable Unit 9 manifest and complete learner contract',()=>{
  assert.ok(source,`Expected ${moduleUrl.pathname} to exist`);const api=evaluate();
  assert.deepEqual(Object.keys(api),['unitId','unitNumber','connectionTimelineMode','locationNumbers','records','unitCards','compareRecords','getById','getByLocation','locationName','getUnitCard']);
  assert.equal(api.unitId,'u9');assert.equal(api.unitNumber,9);assert.equal(api.connectionTimelineMode,'main-event');
  assert.deepEqual(Array.from(api.locationNumbers),Array.from(expectedLocations.keys()));assert.equal(api.records.length,30);
  assert.deepEqual(clone(api.records.map(({id,locationNumber,sequence,title,dateLabel,startYear,endYear,mainEventKey,topicCodes,themeIds,examSkills})=>[id,locationNumber,sequence,title,dateLabel,startYear,endYear,mainEventKey,topicCodes,themeIds,examSkills])),expectedManifest);
  assert.deepEqual([...new Set(api.records.flatMap(record=>record.topicCodes))].sort(),['9.1','9.2','9.3','9.4','9.5','9.6','9.7','9.8','9.9']);
  for(const record of api.records){assert.deepEqual(Object.keys(record),['id','summary','significance','keyPeople','keyTerms','evidence','examConnection','source','locationNumber','sequence','title','dateLabel','startYear','endYear','mainEventKey','topicCodes','themeIds','examSkills','causeStudyPointIds','effectStudyPointIds','relatedStudyPointIds','connectionNotes']);assert.match(record.id,/^apwh-u9-[a-z0-9]+(?:-[a-z0-9]+)*$/);assert.ok(record.summary);assert.ok(record.significance);assert.ok(record.keyPeople.length);assert.ok(record.keyTerms.length);assert.equal(new Set(record.keyTerms.map(term=>term.term)).size,record.keyTerms.length);assert.ok(record.keyTerms.every(term=>term.explanation));assert.ok(record.evidence.length>=2);assert.match(record.examConnection,/^(Analyze|Build|Compare|Contextualize|Evaluate|Explain|Trace)\b/);assert.equal(record.source.id,'amsco-apwh-u9');assert.equal(record.source.locator,L(record.topicCodes));}
});

test('binds exactly three ordered records to each exact location and main event',()=>{
  const api=evaluate();for(const [number,name] of expectedLocations){assert.equal(api.locationName(number),name);const records=api.getByLocation(number);assert.equal(records.length,3);assert.deepEqual(Array.from(records,record=>record.sequence),[1,2,3]);assert.ok(records.every(record=>record.mainEventKey===expectedBindings.get(number)));}
});

test('locks the required Unit 9 content fixtures and historical boundaries',()=>{
  const api=evaluate(),text=id=>JSON.stringify(api.getById(id));
  const content=api.records.map(({id,summary,significance,keyPeople,keyTerms,evidence,examConnection,source})=>({id,summary,significance,keyPeople,keyTerms,evidence,examConnection,source}));
  assert.equal(createHash('sha256').update(JSON.stringify(content)).digest('hex'),'187ab73d51d4a9ddd90c55a837b3eb36dacaf70a0b04141e7c66d74846a697d1');
  const boundaries=[
    ['apwh-u9-amritsar-high-yield-seeds-input-package',['Amritsar–Punjab is a representative anchor','seeds alone did not produce equal gains','high-yield','irrigation','fertilizer','credit','land','mechanization']],
    ['apwh-u9-amritsar-food-population-environmental-costs',['food','population','water','soil']],
    ['apwh-u9-san-francisco-public-research-digital-infrastructure',['San Francisco is a representative anchor','public','semiconductor','comput']],
    ['apwh-u9-san-francisco-computing-internet-information-costs',['internet','information costs']],
    ['apwh-u9-san-francisco-knowledge-economy-distributed-production',['knowledge','distributed production']],
    ['apwh-u9-guangzhou-market-reform-special-economic-zones',['Deng','special economic zone','state choice']],
    ['apwh-u9-guangzhou-supply-chain-labor-environmental-costs',['supply','labor','environment']],
    ['apwh-u9-ciudad-juarez-border-industrialization',['Border Industrialization Program','before NAFTA']],
    ['apwh-u9-ciudad-juarez-employment-gender-labor-environment',['maquiladora','gender','labor','pollution']],
    ['apwh-u9-beijing-market-reform-political-control',['market reform','political liberalization']],
    ['apwh-u9-beijing-tiananmen-protest-repression',['Tiananmen','repression']],
    ['apwh-u9-beijing-wto-integration-information-control',['WTO','information control','did not cause democratization']],
    ['apwh-u9-washington-bretton-woods-financial-institutions',['Washington, D.C. is a headquarters anchor','the World Bank, IMF, and WTO were distinct institutions','Bretton Woods']],
    ['apwh-u9-washington-institutional-power-benefits-criticism',['voting power','criticism']],
    ['apwh-u9-seattle-coalition-protest-digital-organization',['coalition','internet','labor','environment']],
    ['apwh-u9-seattle-fair-trade-labor-continuing-resistance',['fair trade','resistance']],
    ['apwh-u9-paris-universal-rights-global-norm',['UN','human rights','representative diplomacy anchor']],
    ['apwh-u9-paris-kyoto-burden-sharing-debate',['Kyoto','burden sharing','sovereignty']],
    ['apwh-u9-paris-voluntary-climate-governance-limits',['Paris Agreement','nationally determined contribution','enforcement']],
    ['apwh-u9-geneva-vaccination-smallpox-eradication',['Geneva is a coordination anchor','WHO','vaccination','smallpox']],
    ['apwh-u9-geneva-hiv-treatment-unequal-access',['HIV','unequal access']],
    ['apwh-u9-geneva-polio-ebola-coordination-limits',['polio','Ebola','surveillance','state capacity','resources']],
    ['apwh-u9-seoul-state-supported-cultural-industries',['Seoul is a representative anchor','state support','cultural industr']],
    ['apwh-u9-seoul-digital-platforms-transnational-audiences',['digital','transnational audiences']],
    ['apwh-u9-seoul-hybrid-culture-exports-soft-power',['hybrid','export','soft power','globalization was not synonymous with Americanization']],
  ];
  for(const [id,phrases] of boundaries){const content=text(id);for(const phrase of phrases)assert.ok(content.toLowerCase().includes(phrase.toLowerCase()),`${id}: ${phrase}`);}
  const sanFrancisco=api.getByLocation('70').map(text).join(' ');assert.doesNotMatch(sanFrancisco,/internet (?:was )?invented (?:in|at)|World Wide Web (?:was )?invented (?:in|at)/i);
});

test('provides defensive lookups, comparator tie breakers, generic Task 2 cards, and a locked global',()=>{
  const sandbox=evaluateSandbox(),api=sandbox.APWH_U9_LOCATION_STUDY,descriptor=Object.getOwnPropertyDescriptor(sandbox,'APWH_U9_LOCATION_STUDY');
  assert.deepEqual({enumerable:descriptor.enumerable,configurable:descriptor.configurable,writable:descriptor.writable},{enumerable:true,configurable:false,writable:false});
  assert.equal(api.getById(api.records[0].id),api.records[0]);assert.equal(api.getById('missing'),null);assert.equal(api.locationName('missing'),null);assert.deepEqual(Array.from(api.getByLocation('missing')),[]);
  const local=api.getByLocation('11');local.pop();assert.equal(api.getByLocation('11').length,3);
  const rows=[{sequence:2,startYear:1,endYear:1,id:'z'},{sequence:1,startYear:3,endYear:1,id:'z'},{sequence:1,startYear:2,endYear:3,id:'z'},{sequence:1,startYear:2,endYear:2,id:'z'},{sequence:1,startYear:2,endYear:2,id:'a'}];rows.sort(api.compareRecords);assert.deepEqual(rows.map(row=>[row.sequence,row.startYear,row.endYear,row.id]),[[1,2,2,'a'],[1,2,2,'z'],[1,2,3,'z'],[1,3,1,'z'],[2,1,1,'z']]);
  assert.deepEqual(clone(api.unitCards),expectedUnitCards);for(const [kind,card] of Object.entries(expectedUnitCards)){assert.equal(api.getUnitCard(kind),api.unitCards[kind]);assert.equal(api.getUnitCard(card.id),api.unitCards[kind]);}for(const key of ['missing','toString','constructor','__proto__'])assert.equal(api.getUnitCard(key),null);
  assert.throws(()=>evaluate(source,{APWH_U9_LOCATION_STUDY:{}}),/Invalid Unit 9 global APWH_U9_LOCATION_STUDY: refusing to overwrite existing value/);
});

test('deep freezes every published object and uses the minimum Task 2 graph placeholder',()=>{
  const api=evaluate(),seen=new Set();const deep=value=>{if(value===null||typeof value!=='object'||seen.has(value))return;seen.add(value);assert.equal(Object.isFrozen(value),true);for(const key of Reflect.ownKeys(value))deep(value[key]);};deep(api);
  const [sourceId,targetId,note]=placeholderEdge,sourceRecord=api.getById(sourceId),targetRecord=api.getById(targetId);
  assert.deepEqual(clone(sourceRecord.effectStudyPointIds),[targetId]);assert.deepEqual(clone(targetRecord.causeStudyPointIds),[sourceId]);assert.equal(sourceRecord.connectionNotes[targetId],note);assert.equal(targetRecord.connectionNotes[sourceId],note);
  assert.equal(api.records.reduce((sum,record)=>sum+record.effectStudyPointIds.length,0),1);assert.equal(api.records.reduce((sum,record)=>sum+record.relatedStudyPointIds.length,0),0);
});

test('rejects location, binding, identity, sequence, count, and date drift',()=>{
  assertInvalid(replace("'11':'Food Security & Unequal Inputs · India / Amritsar–Punjab'","'11':'Wrong place'"),/canonical name/);
  assertInvalid(replace("'11':'world-event-11-3'","'11':'world-event-11-4'"),/main-event binding/);
  assertInvalid(replace("'apwh-u9-amritsar-unequal-access-land-consolidation','11',2","'apwh-u9-amritsar-high-yield-seeds-input-package','11',2"),/duplicate record ID/);
  assertInvalid(replace("P('apwh-u9-amritsar-unequal-access-land-consolidation'","P('apwh-u9-amritsar-high-yield-seeds-input-package'"),/duplicate raw record ID/);
  assertInvalid(replace("'apwh-u9-amritsar-unequal-access-land-consolidation','11',2","'apwh-u9-amritsar-unequal-access-land-consolidation','11',1"),/duplicate sequence|exactly three records/);
  assertInvalid(replace("['apwh-u9-amritsar-food-population-environmental-costs'","['apwh-u9-fourth-record','11',4,'Fourth','1991',1991,1991,'world-event-11-3',['9.9'],['GOV'],['Causation']],\n['apwh-u9-amritsar-food-population-environmental-costs'"),/expected exactly 30 records|exactly three records/);
  assertInvalid(replace("'1978–1984',1978,1984","'1978-1984',1978,1984"),/invalid dateLabel/);
  assertInvalid(replace("'1978–1984',1978,1984","'1978–1985',1978,1984"),/invalid dateLabel/);
});

test('rejects missing, invalid, and duplicate taxonomy values',()=>{
  assertInvalid(replace("['9.1','9.3'],['TEC','ENV']","[],['TEC','ENV']"),/missing topicCodes/);
  assertInvalid(replace("['9.1','9.3'],['TEC','ENV']","['9.1','9.1'],['TEC','ENV']"),/duplicate topicCode/);
  assertInvalid(replace("['9.1','9.3'],['TEC','ENV']","['9.0'],['TEC','ENV']"),/invalid topicCode/);
  assertInvalid(replace("['TEC','ENV'],['Contextualization','Causation']","[],['Contextualization','Causation']"),/missing themeIds/);
  assertInvalid(replace("['TEC','ENV'],['Contextualization','Causation']","['TEC','TEC'],['Contextualization','Causation']"),/duplicate themeId/);
  assertInvalid(replace("['TEC','ENV'],['Contextualization','Causation']","['WAR'],['Contextualization','Causation']"),/invalid themeId/);
  assertInvalid(replace("['TEC','ENV'],['Contextualization','Causation']","['TEC','ENV'],[]"),/missing examSkills/);
  assertInvalid(replace("['TEC','ENV'],['Contextualization','Causation']","['TEC','ENV'],['Causation','Causation']"),/duplicate examSkill/);
  assertInvalid(replace("['TEC','ENV'],['Contextualization','Causation']","['TEC','ENV'],['Recall']"),/invalid examSkill/);
});

test('rejects incomplete, non-English, and malformed learner content',()=>{
  assertInvalid(replace("'High-yield wheat and rice varieties increased harvest potential only when farmers could combine them with irrigation, fertilizer, credit, land, and mechanization.'","''"),/summary/);
  assertInvalid(replace("'Amritsar–Punjab is a representative anchor for Green Revolution change, and seeds alone did not produce equal gains because complementary inputs were distributed unevenly.'","'全球化'"),/significance/);
  assertInvalid(replace("'Indian agricultural officials and Punjab farmers','Distributed new varieties and made choices about irrigation, fertilizer, credit, land, and machinery.'","'','Distributed new varieties and made choices about irrigation, fertilizer, credit, land, and machinery.'"),/keyPeople/);
  assertInvalid(replace("'Green Revolution','The spread of high-yield crop varieties together with the inputs and institutions needed to raise agricultural output.'","'Green Revolution',''"),/keyTerms/);
  assertInvalid(replace("['High-yield wheat varieties spread widely in Punjab during the late 1960s.','Tube wells, fertilizer purchases, rural credit, and tractors helped farmers realize higher yields.']","['Only one statement.']"),/evidence/);
  assertInvalid(replace("'Explain causation by linking new seed varieties to the irrigation, fertilizer, credit, land, and mechanization that made them productive.'","''"),/examConnection/);
  assertInvalid(replace("source:{id:'amsco-apwh-u9',locator}","source:{id:'wrong',locator}"),/source/);
  assertInvalid(replace("source:{id:'amsco-apwh-u9',locator}","source:{id:'amsco-apwh-u9',locator,extra:true}"),/source/);
  assertInvalid(replace('validate();',"Object.defineProperty(RAW_RECORDS[0].evidence,'0',{enumerable:false});validate();"),/evidence/);
});

test('rejects null or hostile raw registries, cards, and graph structures with controlled diagnostics',()=>{
  for(const [search,replacement,rule] of [
    ['const LOCATIONS=Object.freeze({','const LOCATIONS=Object.freeze(null); const UNUSED_LOCATIONS=Object.freeze({',/location registry/],
    ['const BINDINGS=Object.freeze({','const BINDINGS=Object.freeze(null); const UNUSED_BINDINGS=Object.freeze({',/location registry/],
    ['const RAW_RECORDS=[','const RAW_RECORDS=null; const UNUSED_RAW_RECORDS=[',/raw records/],
    ['const CONNECTIONS={','const CONNECTIONS=null; const UNUSED_CONNECTIONS={',/connections must contain exactly/],
    ["const CARD_KEYS=['context','synthesis'];","const CARD_KEYS=null; const UNUSED_CARD_KEYS=['context','synthesis'];",/unit cards/],
    ['const UNIT_CARD_MANIFEST={','const UNIT_CARD_MANIFEST=null; const UNUSED_UNIT_CARD_MANIFEST={',/unit cards/],
  ])assertInvalid(replace(search,replacement),rule);
  assertInvalid(replace("'11':'Food Security & Unequal Inputs · India / Amritsar–Punjab'","get '11'(){throw new Error('accessor leaked');}"),/location registry/);
});

test('rejects unresolved, self, duplicate, and malformed graph links',()=>{
  const edge=`['${placeholderEdge[0]}','${placeholderEdge[1]}','${placeholderEdge[2]}']`;
  assertInvalid(replace(edge,edge.replace(`'${placeholderEdge[0]}'`,`'missing'`)),/unresolved connection/);
  assertInvalid(replace(edge,edge.replace(`'${placeholderEdge[1]}'`,`'${placeholderEdge[0]}'`)),/self connection/);
  assertInvalid(replace('causal:[','causal:['+edge+','),/duplicate causal connection/);
  assertInvalid(replace(edge,`['${placeholderEdge[0]}','${placeholderEdge[1]}']`),/connection row/);
});

test('rejects malformed generic Task 2 cards',()=>{
  assertInvalid(replace("kind:'context'","kind:'synthesis'"),/card kind/);
  assertInvalid(replace("role:'Unit 9 Context Card'","role:''"),/malformed card/);
  assertInvalid(replace("examSkills:['Contextualization','Causation']","examSkills:['Causation','Causation']"),/card skills/);
  assertInvalid(replace("synthesis:{id:'apwh-u9-synthesis-globalization-benefits-resistance'","synthesis:{id:'apwh-u9-context-accelerating-global-connections'"),/duplicate card ID/);
});

test('validates the graph twice without mutation and never leaks a TypeError',()=>{
  const api=evaluate(replace('validate();','validate();validate();'));assert.equal(api.records.length,30);
  const graphMalformed=replace('validate();',"validate();CONNECTIONS.causal[0][0]='missing';validate();");assert.throws(()=>evaluate(graphMalformed),error=>{assert.equal(error.name,'Error');assert.match(error.message,/Invalid Unit 9/);assert.match(error.message,/unresolved connection/);return true;});
  const malformed=replace('validate();',"STUDY_MANIFEST[0][0]=Symbol('bad');validate();validate();");assert.throws(()=>evaluate(malformed),error=>{assert.equal(error.name,'Error');assert.match(error.message,/Invalid Unit 9/);assert.match(error.message,/invalid stable ID/);return true;});
});
