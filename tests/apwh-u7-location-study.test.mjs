import assert from 'node:assert/strict';
import nodeTest from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const moduleUrl=new URL('../data/apwh-u7-location-study.js',import.meta.url);
const ledgerUrl=new URL('../docs/data-sources/apwh-u7-location-study-source-ledger.md',import.meta.url);
const source=existsSync(moduleUrl)?readFileSync(moduleUrl,'utf8'):'';
const ledger=existsSync(ledgerUrl)?readFileSync(ledgerUrl,'utf8'):'';
const evaluateSandbox=(code=source,seed={})=>{const sandbox={...seed};sandbox.window=sandbox;vm.runInNewContext(code,sandbox);return sandbox;};
const evaluate=(code=source,seed={})=>evaluateSandbox(code,seed).APWH_U7_LOCATION_STUDY;
const checks=[];
const test=(name,fn)=>checks.push([name,fn]);
const locations=[
['108','Imperial Rivalry in East Asia · Mukden / Shenyang','world-event-108-0'],['30','World War I Origins · Sarajevo','world-event-30-0'],['46','Industrialized Total War · Verdun','world-event-46-0'],['25','Russian Revolution · St. Petersburg / Petrograd','world-event-25-1'],['24','Postwar Settlement · Paris','world-event-24-7'],['18','Ottoman Nationalism & Genocide · Istanbul','world-event-18-2'],['29','Nazi Rule & Holocaust · Berlin','world-event-29-5'],['10','War in China & Mass Violence · Nanjing','world-event-10-2'],['84','Colonial Resources & North African War · Cairo / El Alamein','world-event-84-1'],['106','Pacific War · Pearl Harbor','world-event-106-0'],
];
const records=[
['apwh-u7-mukden-russo-japanese-war-shifting-power','108',1,'Russo-Japanese War and Shifting Power','1904–1905',1904,1905,['7.1','7.9'],['GOV','CDI'],['Causation','CCOT']],['apwh-u7-mukden-incident-resource-expansion','108',2,'Manchurian Incident and Resource Expansion','1931',1931,1931,['7.6'],['GOV','ECN'],['Causation']],['apwh-u7-mukden-league-failure-further-expansion','108',3,'Collective-Security Failure and Further Expansion','1931–1937',1931,1937,['7.5','7.6','7.9'],['GOV'],['Causation','CCOT']],
['apwh-u7-sarajevo-balkan-nationalism-imperial-rivalry','30',1,'Balkan Nationalism and Imperial Rivalry','1878–1914',1878,1914,['7.2'],['GOV','CDI'],['Contextualization','Causation']],['apwh-u7-sarajevo-assassination-july-crisis','30',2,'Assassination and the July Crisis','1914',1914,1914,['7.2'],['GOV'],['Causation']],['apwh-u7-sarajevo-alliances-mobilization-global-war','30',3,'Alliances, Mobilization, and Global War','1914',1914,1914,['7.2','7.9'],['GOV'],['Causation','CCOT']],
['apwh-u7-verdun-industrial-weapons-mass-production','46',1,'Industrial Weapons and Mass Production','1914–1916',1914,1916,['7.3'],['TEC','ECN'],['Causation']],['apwh-u7-verdun-trench-warfare-attrition','46',2,'Trench Warfare and Attrition','1916',1916,1916,['7.3'],['TEC','SIO'],['Causation']],['apwh-u7-verdun-total-war-mobilization','46',3,'Total War and Whole-Society Mobilization','1914–1918',1914,1918,['7.3','7.9'],['ECN','SIO','GOV'],['Causation','CCOT']],
['apwh-u7-petrograd-wartime-shortages-tsarist-failure','25',1,'Wartime Shortages and Tsarist Failure','1914–1917',1914,1917,['7.1','7.4'],['SIO','ECN','GOV'],['Contextualization','Causation']],['apwh-u7-petrograd-february-october-revolutions','25',2,'February and October Revolutions','1917',1917,1917,['7.1'],['GOV','SIO'],['Causation']],['apwh-u7-petrograd-bolshevik-regime-war-exit','25',3,'Bolshevik Rule and Exit from the War','1917–1922',1917,1922,['7.1','7.4'],['GOV','ECN'],['Causation','CCOT']],
['apwh-u7-paris-self-determination-promises','24',1,'Promises of Self-Determination','1918–1919',1918,1919,['7.5'],['GOV','CDI'],['Contextualization','Comparison']],['apwh-u7-paris-versailles-punitive-settlement','24',2,'Versailles and the Punitive Settlement','1919',1919,1919,['7.5','7.9'],['GOV'],['Causation']],['apwh-u7-paris-mandates-unresolved-contradictions','24',3,'Mandates and Unresolved Contradictions','1919–1939',1919,1939,['7.5','7.6'],['GOV','CDI'],['Causation','CCOT']],
['apwh-u7-istanbul-young-turks-turkification','18',1,'Young Turks and Turkification','1908–1914',1908,1914,['7.1','7.8'],['CDI','GOV'],['Contextualization','Causation']],['apwh-u7-istanbul-wartime-accusations-deportation','18',2,'Wartime Accusations and Deportation','1915',1915,1915,['7.8'],['GOV','SIO'],['Causation']],['apwh-u7-istanbul-armenian-genocide','18',3,'Armenian Genocide','1915–1920',1915,1920,['7.8','7.9'],['GOV','SIO'],['Causation','Comparison']],
['apwh-u7-berlin-depression-weimar-crisis','29',1,'Depression and the Weimar Crisis','1929–1933',1929,1933,['7.4','7.6'],['ECN','GOV'],['Causation']],['apwh-u7-berlin-nazi-takeover-citizenship-stripping','29',2,'Nazi Takeover and Citizenship Stripping','1933–1935',1933,1935,['7.6','7.8'],['GOV','SIO'],['Causation']],['apwh-u7-berlin-holocaust-bureaucratic-genocide','29',3,'Holocaust and Bureaucratic Genocide','1941–1945',1941,1945,['7.8','7.9'],['GOV','SIO','TEC'],['Causation','Comparison']],
['apwh-u7-nanjing-revolution-state-fragmentation','10',1,'Revolution and State Fragmentation','1912–1927',1912,1927,['7.1'],['GOV'],['Causation','CCOT']],['apwh-u7-nanjing-full-scale-japanese-invasion','10',2,'Full-Scale Japanese Invasion','1937',1937,1937,['7.6','7.7'],['GOV'],['Causation']],['apwh-u7-nanjing-massacre-civilian-violence','10',3,'Nanjing Massacre and Civilian Violence','1937–1938',1937,1938,['7.8'],['GOV','SIO'],['Causation','Comparison']],
['apwh-u7-cairo-cotton-suez-strategic-resources','84',1,'Cotton, Suez, and Strategic Resources','1869–1939',1869,1939,['7.2','7.7'],['ECN','GOV','TEC'],['Contextualization','Causation']],['apwh-u7-cairo-colonial-mobilization-total-war','84',2,'Colonial Mobilization in Total War','1914–1945',1914,1945,['7.3','7.7'],['GOV','ECN','SIO'],['Causation']],['apwh-u7-cairo-el-alamein-global-routes','84',3,'El Alamein and the Defense of Global Routes','1942',1942,1942,['7.7','7.9'],['GOV','TEC'],['Causation','CCOT']],
['apwh-u7-pearl-harbor-resource-dependence-sanctions','106',1,'Resource Dependence and Sanctions','1937–1941',1937,1941,['7.6'],['ECN','GOV'],['Causation']],['apwh-u7-pearl-harbor-attack-global-war','106',2,'Pearl Harbor and a Truly Global War','1941',1941,1941,['7.6','7.7'],['GOV'],['Causation']],['apwh-u7-pearl-harbor-pacific-war-surrender','106',3,'Pacific War, Atomic Bombs, and Surrender','1941–1945',1941,1945,['7.7','7.9'],['GOV','TEC','SIO'],['Causation','CCOT']],
];

test('publishes the exact frozen Unit 7 record manifest, digest, and Task 3 graph containers',()=>{
  assert.ok(source,`Expected ${moduleUrl.pathname} to exist`); const api=evaluate();
  assert.deepEqual(Object.keys(api),['unitId','unitNumber','connectionTimelineMode','locationNumbers','records','unitCards','compareRecords','getById','getByLocation','locationName','getUnitCard']);
  assert.equal(api.unitId,'u7');assert.equal(api.unitNumber,7);assert.equal(api.connectionTimelineMode,'main-event');assert.equal(Object.isFrozen(api),true);assert.equal(Object.isFrozen(api.records),true);
  assert.deepEqual(Array.from(api.locationNumbers),locations.map(location=>location[0]));
  assert.deepEqual(JSON.parse(JSON.stringify(api.records.map(record=>[record.id,record.locationNumber,record.sequence,record.title,record.dateLabel,record.startYear,record.endYear,record.topicCodes,record.themeIds,record.examSkills]))),records);
  assert.deepEqual(Array.from(api.records,record=>record.mainEventKey),records.map(record=>locations.find(location=>location[0]===record[1])[2]));
  const learnerContent=api.records.map(({id,summary,significance,keyPeople,keyTerms,evidence,examConnection,source})=>({id,summary,significance,keyPeople,keyTerms,evidence,examConnection,source}));
  assert.equal(createHash('sha256').update(JSON.stringify(learnerContent)).digest('hex'),'6ae75dabdb34986af2925b5e11576109ec6c0b772d19c7a63181e91bdd2b4165');
  for(const record of api.records){assert.ok(record.summary);assert.ok(record.significance);assert.ok(record.keyPeople.length);assert.ok(record.keyTerms.length);assert.ok(record.evidence.length>=2);assert.ok(record.examConnection);assert.equal(record.source.id,'amsco-apwh-u7');assert.match(record.source.locator,/AMSCO AP World History, Unit 7, Topic/);assert.equal(Object.isFrozen(record),true);}
});
test('provides defensive lookups and refuses duplicate globals',()=>{const api=evaluate();for(const [number,name,binding] of locations){assert.equal(api.locationName(number),name);const local=api.getByLocation(number);assert.equal(local.length,3);assert.ok(local.every(record=>record.mainEventKey===binding));local.pop();assert.equal(api.getByLocation(number).length,3);}assert.equal(api.getById('nope'),null);assert.equal(api.locationName('nope'),null);assert.deepEqual(Array.from(api.getByLocation('nope')),[]);assert.throws(()=>evaluate(source,{APWH_U7_LOCATION_STUDY:{}}),/Invalid Unit 7 global APWH_U7_LOCATION_STUDY: refusing to overwrite existing value/);});

const assertInvalid=(code,rule)=>assert.throws(()=>evaluate(code),error=>{assert.match(error.message,/Invalid Unit 7/);assert.match(error.message,rule);return true;});
const replace=(search,replacement)=>{const code=source.replace(search,replacement);assert.notEqual(code,source,`fixture mutation: ${search}`);return code;};
test('rejects manifest taxonomy, identity, sequence, event, and date drift with controlled diagnostics',()=>{
  assertInvalid(replace("'world-event-108-0',['7.1','7.9']","'world-event-108-9',['7.1','7.9']"),/mainEventKey/);
  assertInvalid(replace("'apwh-u7-mukden-incident-resource-expansion','108',2","'apwh-u7-mukden-incident-resource-expansion','108',1"),/exactly three records|duplicate sequence/);
  assertInvalid(replace("'apwh-u7-mukden-incident-resource-expansion','108',2","'apwh-u7-mukden-russo-japanese-war-shifting-power','108',2"),/duplicate record ID/);
  assertInvalid(replace("'1931',1931,1931","'19310',1931,1931"),/invalid dateLabel/);
  assertInvalid(replace("'1931',1931,1931","'1932',1931,1931"),/invalid dateLabel/);
  assertInvalid(replace("['7.6'],['GOV','ECN']","[],['GOV','ECN']"),/missing topicCodes/);
  assertInvalid(replace("['7.6'],['GOV','ECN']","['7.0'],['GOV','ECN']"),/invalid topicCode/);
  assertInvalid(replace("['7.6'],['GOV','ECN']","['7.6','7.6'],['GOV','ECN']"),/duplicate topicCode/);
  assertInvalid(replace("['GOV','ECN'],['Causation']","[],['Causation']"),/missing themeIds/);
  assertInvalid(replace("['GOV','ECN'],['Causation']","['WAR'],['Causation']"),/invalid themeId/);
  assertInvalid(replace("['GOV','ECN'],['Causation']","['GOV','GOV'],['Causation']"),/duplicate themeId/);
  assertInvalid(replace("['GOV','ECN'],['Causation']","['GOV','ECN'],[]"),/missing examSkills/);
  assertInvalid(replace("['GOV','ECN'],['Causation']","['GOV','ECN'],['Recall']"),/invalid examSkill/);
  assertInvalid(replace("['GOV','ECN'],['Causation']","['GOV','ECN'],['Causation','Causation']"),/duplicate examSkill/);
});
test('rejects malformed learner content and raw record shapes before publication',()=>{
  assertInvalid(replace("'Japan defeated Russia in a 1904–1905 war over influence in Manchuria and Korea.'","''"),/summary/);
  assertInvalid(replace("'Japan defeated Russia in a 1904–1905 war over influence in Manchuria and Korea.'",'42'),/summary/);
  assertInvalid(replace("'The result shifted regional power and challenged assumptions that European empires would always prevail.'","'帝国主义'"),/significance/);
  assertInvalid(replace("'Japanese and Russian governments','Competed for influence in Manchuria and Korea.'","'','Competed for influence in Manchuria and Korea.'"),/keyPeople/);
  assertInvalid(replace("'Russo-Japanese War','A 1904–1905 conflict in which Japan defeated Russia over imperial interests in Northeast Asia.'","'Russo-Japanese War',''"),/keyTerms/);
  assertInvalid(replace("['Japanese forces defeated Russian forces in 1905.','The Treaty of Portsmouth ended the war and recognized Japanese gains.']","['Only one statement.']"),/evidence/);
  assertInvalid(replace("source:{id:'amsco-apwh-u7',locator}","source:{id:'wrong',locator}"),/source/);
  assertInvalid(replace("const RAW_RECORDS=[","const RAW_RECORDS=null; const UNUSED_RAW_RECORDS=["),/raw records must be an ordinary dense array/);
  assertInvalid(replace("source:{id:'amsco-apwh-u7',locator}","source:{id:'amsco-apwh-u7',locator,extra:true}"),/source/);
  assertInvalid(replace("source:{id:'amsco-apwh-u7',locator}});","source:{id:'amsco-apwh-u7',locator},extra:true});"),/raw record must contain exactly/);
  assertInvalid(replace("'Japan defeated Russia in a 1904–1905 war over influence in Manchuria and Korea.'","'Japan 帝国主义'"),/summary/);
  assertInvalid(replace('validate();',"Object.defineProperty(RAW_RECORDS[0].evidence,'0',{enumerable:false});validate();"),/malformed evidence/);
  assertInvalid(replace('validate();',"STUDY_MANIFEST[0][10].push('Comparison');validate();"),/too many examSkills/);
  assertInvalid(replace('validate();',"STUDY_MANIFEST[0][4]=Symbol('bad');validate();"),/invalid dateLabel/);
  assertInvalid(replace('validate();',"STUDY_MANIFEST[0][5]=Symbol('bad');validate();"),/invalid dateLabel/);
  assertInvalid(replace('validate();',"STUDY_MANIFEST[0][6]=Symbol('bad');validate();"),/invalid dateLabel/);
  assertInvalid(replace('validate();',"STUDY_MANIFEST[0][0]=Symbol('bad');validate();"),/invalid stable ID/);
  assertInvalid(replace('validate();',"Object.defineProperty(RAW_RECORDS[0],'id',{get(){throw new Error('id accessor leaked');},enumerable:true,configurable:true});validate();"),/raw record must contain exactly/);
  for(const id of ['apwh-u7-invalid_raw_id','apush-u7-wrong-prefix']){
    const malformed=replace('validate();',`RAW_RECORDS[0].id='${id}';validate();`);
    assert.throws(()=>evaluate(malformed),error=>{assert.match(error.message,/Invalid Unit 7/);assert.match(error.message,new RegExp(id));assert.match(error.message,/invalid stable ID/);return true;});
  }
});
test('rejects registry drift and preserves immutable descriptors and comparator behavior',()=>{
  assertInvalid(replace("'106':'Pacific War · Pearl Harbor'","'106':'Pacific War · Pearl Harbor','999':'Extra'"),/location registry/);
  assertInvalid(replace("'108':'Imperial Rivalry in East Asia · Mukden / Shenyang'","'108':''"),/nonempty English name/);
  assertInvalid(replace("'108':'world-event-108-0'","'108':'world-event-108-9'"),/invalid main-event binding/);
  assertInvalid(replace("['apwh-u7-mukden-league-failure-further-expansion'","['apwh-u7-extra','108',3,'Extra','1931',1931,1931,'world-event-108-0',['7.6'],['GOV'],['Causation']],\n['apwh-u7-mukden-league-failure-further-expansion'"),/expected exactly 30 records|exactly three records/);
  const api=evaluate();const descriptor=Object.getOwnPropertyDescriptor(evaluateSandbox(source),'APWH_U7_LOCATION_STUDY');assert.deepEqual({enumerable:descriptor.enumerable,configurable:descriptor.configurable,writable:descriptor.writable},{enumerable:true,configurable:false,writable:false});assert.equal(api.compareRecords({sequence:1,startYear:1900,endYear:1901,id:'b'},{sequence:1,startYear:1900,endYear:1901,id:'a'})>0,true);
});
test('deep-freezes the complete Unit 7 API graph and exercises comparator tie-breakers',()=>{
  const sandbox=evaluateSandbox();const api=sandbox.APWH_U7_LOCATION_STUDY;const descriptor=Object.getOwnPropertyDescriptor(sandbox,'APWH_U7_LOCATION_STUDY');
  assert.deepEqual({enumerable:descriptor.enumerable,configurable:descriptor.configurable,writable:descriptor.writable},{enumerable:true,configurable:false,writable:false});
  assert.equal(api.getById(api.records[0].id),api.records[0]);
  const rows=[{sequence:2,startYear:1,endYear:1,id:'z'},{sequence:1,startYear:3,endYear:1,id:'z'},{sequence:1,startYear:2,endYear:3,id:'z'},{sequence:1,startYear:2,endYear:2,id:'z'},{sequence:1,startYear:2,endYear:2,id:'a'}];rows.sort(api.compareRecords);assert.deepEqual(rows.map(record=>[record.sequence,record.startYear,record.endYear,record.id]),[[1,2,2,'a'],[1,2,2,'z'],[1,2,3,'z'],[1,3,1,'z'],[2,1,1,'z']]);
  const seen=new Set();const assertDeepFrozen=value=>{if(value===null||typeof value!=='object'||seen.has(value))return;seen.add(value);assert.equal(Object.isFrozen(value),true);for(const key of Reflect.ownKeys(value))assertDeepFrozen(value[key]);};assertDeepFrozen(api);
});
for(const [label,search,replacement] of [
  ['null locations',"const LOCATIONS=Object.freeze({","const LOCATIONS=Object.freeze(null); const UNUSED_LOCATIONS=Object.freeze({"],
  ['null bindings',"const BINDINGS=Object.freeze({","const BINDINGS=Object.freeze(null); const UNUSED_BINDINGS=Object.freeze({"],
  ['accessor locations',"'108':'Imperial Rivalry in East Asia · Mukden / Shenyang'","get '108'(){throw new Error('location accessor leaked');}"],
  ['accessor bindings',"'108':'world-event-108-0'","get '108'(){throw new Error('binding accessor leaked');}"],
]) test(`rejects ${label} registry shape with controlled diagnostics`,()=>{const malformed=replace(search,replacement);assert.throws(()=>evaluate(malformed),error=>{assert.match(error.message,/Invalid Unit 7/);assert.match(error.message,/location registry/);return true;});});
const localCausalPairs=locations.flatMap(([location])=>records.filter(record=>record[1]===location).sort((a,b)=>a[2]-b[2]).slice(0,2).map((record,index)=>[record[0],records.filter(candidate=>candidate[1]===location).sort((a,b)=>a[2]-b[2])[index+1][0]]));
const crossCausalPairs=[
  ['apwh-u7-sarajevo-alliances-mobilization-global-war','apwh-u7-verdun-industrial-weapons-mass-production'],
  ['apwh-u7-verdun-total-war-mobilization','apwh-u7-petrograd-wartime-shortages-tsarist-failure'],
  ['apwh-u7-paris-versailles-punitive-settlement','apwh-u7-berlin-depression-weimar-crisis'],
  ['apwh-u7-mukden-league-failure-further-expansion','apwh-u7-nanjing-full-scale-japanese-invasion'],
  ['apwh-u7-nanjing-full-scale-japanese-invasion','apwh-u7-pearl-harbor-resource-dependence-sanctions'],
];
const relatedPairs=[
  ['apwh-u7-istanbul-armenian-genocide','apwh-u7-berlin-holocaust-bureaucratic-genocide','Both were state-directed mass atrocities, but they differed in targets, chronology, institutions, and wartime setting; this comparison does not treat the Armenian Genocide and Holocaust as equivalent.'],
  ['apwh-u7-nanjing-massacre-civilian-violence','apwh-u7-berlin-holocaust-bureaucratic-genocide','Both involved mass violence against civilians, but they differed in purposes, organization, duration, and mechanisms; this comparison does not treat the Nanjing Massacre and Holocaust as equivalent.'],
  ['apwh-u7-verdun-total-war-mobilization','apwh-u7-cairo-colonial-mobilization-total-war','Compare metropolitan total-war mobilization with colonial mobilization, including how imperial states drew labor, resources, and people from unequal settings.'],
  ['apwh-u7-mukden-league-failure-further-expansion','apwh-u7-paris-mandates-unresolved-contradictions','Compare collective-security design with enforcement failure: League mandates preserved imperial oversight while the League failed to stop aggression in Manchuria.'],
  ['apwh-u7-petrograd-february-october-revolutions','apwh-u7-berlin-nazi-takeover-citizenship-stripping','Compare a communist revolution with a fascist takeover by examining their different ideologies, political coalitions, and changes to citizenship.'],
  ['apwh-u7-sarajevo-alliances-mobilization-global-war','apwh-u7-pearl-harbor-attack-global-war','Compare two limited attacks that became global wars through pre-existing international structures: alliances and empires in 1914, and alliance commitments and global conflict in 1941.'],
];
const causalNotes={
  'apwh-u7-mukden-russo-japanese-war-shifting-power|apwh-u7-mukden-incident-resource-expansion':'Japan’s earlier regional victory strengthened military confidence and strategic interest in Manchuria, helping create conditions officers used to justify expansion in 1931.',
  'apwh-u7-mukden-incident-resource-expansion|apwh-u7-mukden-league-failure-further-expansion':'The occupation tested collective security; the League’s ineffective response weakened deterrence and enabled further Japanese expansion.',
  'apwh-u7-sarajevo-balkan-nationalism-imperial-rivalry|apwh-u7-sarajevo-assassination-july-crisis':'Balkan nationalism and imperial rivalry created the political tensions through which the Sarajevo assassination became an international crisis.',
  'apwh-u7-sarajevo-assassination-july-crisis|apwh-u7-sarajevo-alliances-mobilization-global-war':'Ultimatums and the July Crisis activated alliance commitments and mobilization plans, widening a regional assassination into global war.',
  'apwh-u7-verdun-industrial-weapons-mass-production|apwh-u7-verdun-trench-warfare-attrition':'Mass-produced artillery and rapid-fire weapons made defensive positions lethal, producing trench stalemate and attrition at Verdun.',
  'apwh-u7-verdun-trench-warfare-attrition|apwh-u7-verdun-total-war-mobilization':'Attritional warfare consumed soldiers and supplies at a scale that required states to mobilize labor, finance, food, and colonial resources.',
  'apwh-u7-petrograd-wartime-shortages-tsarist-failure|apwh-u7-petrograd-february-october-revolutions':'Food and fuel shortages, military losses, and declining legitimacy mobilized Petrograd protest and helped bring down tsarist rule.',
  'apwh-u7-petrograd-february-october-revolutions|apwh-u7-petrograd-bolshevik-regime-war-exit':'The October seizure of power gave Bolshevik leaders the authority to restructure the state and negotiate Russia’s exit from the war.',
  'apwh-u7-paris-self-determination-promises|apwh-u7-paris-versailles-punitive-settlement':'The gap between self-determination rhetoric and Allied security priorities shaped a settlement that imposed punitive terms on Germany.',
  'apwh-u7-paris-versailles-punitive-settlement|apwh-u7-paris-mandates-unresolved-contradictions':'Versailles and the wider peace framework institutionalized Allied control, enabling mandate arrangements that left nationalist claims unresolved.',
  'apwh-u7-istanbul-young-turks-turkification|apwh-u7-istanbul-wartime-accusations-deportation':'Nationalist state-building and wartime suspicion supplied the political logic Ottoman authorities used to accuse Armenians and order deportations.',
  'apwh-u7-istanbul-wartime-accusations-deportation|apwh-u7-istanbul-armenian-genocide':'State deportation orders and wartime coercive institutions enabled dispossession, death marches, and mass violence against Armenians.',
  'apwh-u7-berlin-depression-weimar-crisis|apwh-u7-berlin-nazi-takeover-citizenship-stripping':'Depression intensified unemployment and political instability, enabling Nazi electoral gains and the dismantling of constitutional protections.',
  'apwh-u7-berlin-nazi-takeover-citizenship-stripping|apwh-u7-berlin-holocaust-bureaucratic-genocide':'Citizenship stripping and dictatorship created legal exclusion and administrative capacity that enabled the Holocaust’s bureaucratic genocide.',
  'apwh-u7-nanjing-revolution-state-fragmentation|apwh-u7-nanjing-full-scale-japanese-invasion':'Political fragmentation and competing Chinese authorities weakened coordinated resistance, creating opportunities for Japanese escalation in 1937.',
  'apwh-u7-nanjing-full-scale-japanese-invasion|apwh-u7-nanjing-massacre-civilian-violence':'The invasion’s capture of Nanjing placed civilians under Japanese military occupation, enabling the massacre and widespread violence.',
  'apwh-u7-cairo-cotton-suez-strategic-resources|apwh-u7-cairo-colonial-mobilization-total-war':'Imperial control over Suez, cotton, and regional routes made Egypt a strategic resource base that Britain mobilized during total war.',
  'apwh-u7-cairo-colonial-mobilization-total-war|apwh-u7-cairo-el-alamein-global-routes':'Colonial labor, supplies, and logistics sustained Allied forces defending the Suez corridor and global routes at El Alamein.',
  'apwh-u7-pearl-harbor-resource-dependence-sanctions|apwh-u7-pearl-harbor-attack-global-war':'Resource dependence and U.S. sanctions narrowed Japanese options and helped drive the decision to attack Pearl Harbor.',
  'apwh-u7-pearl-harbor-attack-global-war|apwh-u7-pearl-harbor-pacific-war-surrender':'Pearl Harbor brought the United States into the conflict, enabling the sustained Pacific campaigns and pressure that preceded Japanese surrender.',
  'apwh-u7-sarajevo-alliances-mobilization-global-war|apwh-u7-verdun-industrial-weapons-mass-production':'Global war mobilization linked alliance commitments to industrial production, expanding demand for the weapons and munitions used at Verdun.',
  'apwh-u7-verdun-total-war-mobilization|apwh-u7-petrograd-wartime-shortages-tsarist-failure':'Total-war demands strained Russian transport, food, fuel, and labor systems, contributing to shortages and tsarist failure in Petrograd.',
  'apwh-u7-paris-versailles-punitive-settlement|apwh-u7-berlin-depression-weimar-crisis':'Reparations, territorial losses, and political grievance compounded economic vulnerability, contributing to the Weimar crisis during the Depression.',
  'apwh-u7-mukden-league-failure-further-expansion|apwh-u7-nanjing-full-scale-japanese-invasion':'The League’s failure to enforce collective security weakened international deterrence, enabling Japan’s further escalation into full-scale invasion.',
  'apwh-u7-nanjing-full-scale-japanese-invasion|apwh-u7-pearl-harbor-resource-dependence-sanctions':'War in China increased Japan’s resource needs and intensified conflict with sanctions powers, contributing to the pressure behind Pearl Harbor.',
};
test('builds the exact directed causal graph and reciprocal comparison graph',()=>{
  const api=evaluate(),byId=new Map(api.records.map(record=>[record.id,record]));
  const causalPairs=api.records.flatMap(record=>record.effectStudyPointIds.map(target=>[record.id,target]));
  assert.deepEqual(JSON.parse(JSON.stringify(causalPairs.map(pair=>pair.join('|')).sort())),[...localCausalPairs,...crossCausalPairs].map(pair=>pair.join('|')).sort());
  assert.equal(causalPairs.length,25);assert.equal(new Set(causalPairs.map(pair=>pair.join('|'))).size,25);
  assert.deepEqual(JSON.parse(JSON.stringify(Object.fromEntries(causalPairs.map(([sourceId,targetId])=>[`${sourceId}|${targetId}`,byId.get(sourceId).connectionNotes[targetId]])))),causalNotes);
  for(const [sourceId,targetId] of causalPairs){const sourceRecord=byId.get(sourceId),targetRecord=byId.get(targetId);assert.ok(sourceRecord&&targetRecord);assert.notEqual(sourceId,targetId);assert.ok(sourceRecord.connectionNotes[targetId].length>20);assert.ok(targetRecord.causeStudyPointIds.includes(sourceId));}
  for(const [left,right,note] of relatedPairs){const leftRecord=byId.get(left),rightRecord=byId.get(right);assert.ok(leftRecord.relatedStudyPointIds.includes(right));assert.ok(rightRecord.relatedStudyPointIds.includes(left));assert.equal(leftRecord.connectionNotes[right],note);assert.equal(rightRecord.connectionNotes[left],note);}
  assert.equal(api.records.reduce((total,record)=>total+record.relatedStudyPointIds.length,0),12);
});
test('validates graph connections before publication and resists ordinary-shape attacks',()=>{
  const firstPair="['apwh-u7-mukden-russo-japanese-war-shifting-power','apwh-u7-mukden-incident-resource-expansion'";
  assertInvalid(replace('const CONNECTIONS={','const CONNECTIONS=null; const UNUSED_CONNECTIONS={'),/connections must contain exactly/);
  assertInvalid(replace(firstPair,"['missing','apwh-u7-mukden-incident-resource-expansion'"),/unresolved connection/);
  assertInvalid(replace(firstPair,"['apwh-u7-mukden-russo-japanese-war-shifting-power','apwh-u7-mukden-russo-japanese-war-shifting-power'"),/self connection/);
  assertInvalid(replace('causal:[',"causal:[['apwh-u7-mukden-russo-japanese-war-shifting-power','apwh-u7-mukden-incident-resource-expansion'],"),/connection row/);
  assertInvalid(replace('causal:[',"causal:[['apwh-u7-mukden-russo-japanese-war-shifting-power','apwh-u7-mukden-incident-resource-expansion','note','extra'],"),/connection row/);
  assertInvalid(replace('causal:[',"causal:[['apwh-u7-mukden-russo-japanese-war-shifting-power','apwh-u7-mukden-incident-resource-expansion','The mechanism enabled duplication.'],"),/duplicate causal connection/);
  assertInvalid(replace('related:[',"related:[['apwh-u7-mukden-russo-japanese-war-shifting-power','apwh-u7-mukden-incident-resource-expansion','cross category'],"),/cross-category connection/);
  assertInvalid(replace('Japan’s earlier regional victory strengthened military confidence and strategic interest in Manchuria, helping create conditions officers used to justify expansion in 1931.',''),/connection note/);
  assertInvalid(replace('Both were state-directed mass atrocities, but they differed in targets, chronology, institutions, and wartime setting; this comparison does not treat the Armenian Genocide and Holocaust as equivalent.','mismatched note'),/nonreciprocal related connection/);
  assertInvalid(replace('Japan’s earlier regional victory strengthened military confidence and strategic interest in Manchuria, helping create conditions officers used to justify expansion in 1931.','This happened before the next event and shaped its chronology.'),/causal connection does not match/);
  assertInvalid(replace("['apwh-u7-istanbul-armenian-genocide','apwh-u7-berlin-holocaust-bureaucratic-genocide'","['apwh-u7-istanbul-armenian-genocide','apwh-u7-paris-mandates-unresolved-contradictions'"),/related connection does not match/);
  assertInvalid(replace('validate();',"Object.defineProperty(CONNECTIONS.causal,'0',{enumerable:false});validate();"),/connections must be an ordinary dense array/);
});
test('can validate the complete graph and card manifests twice without mutating them',()=>{
  const twice=replace('validate();','validate();validate();');assert.equal(evaluate(twice).records.length,30);
});
const expectedCards={
  context:{id:'apwh-u7-context-imperial-rivalry-global-war',kind:'context',role:'Unit 7 Context Card',title:'From Imperial Rivalry to Global War',examSkills:['Contextualization','Causation'],summary:'Unit 6 imperial expansion gave industrial states overlapping claims, overseas commitments, strategic routes, and recurring security disputes. Nationalism and military planning turned those rivalries into a system in which a regional crisis could mobilize empires, colonial resources, and populations across the world.',prompt:'Which Unit 6 structures made a regional crisis capable of becoming a global war?',takeaways:['Industrial states defended distant routes, markets, and colonies as national security interests.','Alliance commitments and mobilization plans converted diplomatic delay into military risk.','Empires drew colonial soldiers, labor, materials, and territories into wars begun elsewhere.']},
  synthesis:{id:'apwh-u7-synthesis-allied-victory-bipolar-world',kind:'synthesis',role:'Unit 7 Synthesis Card',title:'From Allied Victory to a Bipolar World',examSkills:['Causation','CCOT'],summary:'The defeat of the Axis powers weakened European empires, elevated the United States and Soviet Union, encouraged anticolonial demands, and created institutions intended to manage a world divided by ideology and nuclear power. Unit 8 follows how wartime cooperation gave way to Cold War rivalry and decolonization.',prompt:'How did the outcomes of World War II create both superpower rivalry and new opportunities for decolonization?',takeaways:['The United States and Soviet Union emerged with unmatched military and political influence.','European imperial states survived the war with reduced resources and legitimacy.','The United Nations and nuclear weapons changed how states pursued security after 1945.']},
};
test('publishes exact immutable Unit 7 context and synthesis cards',()=>{
  const api=evaluate();assert.deepEqual(JSON.parse(JSON.stringify(api.unitCards)),expectedCards);for(const [kind,card] of Object.entries(expectedCards)){assert.equal(api.getUnitCard(kind),api.unitCards[kind]);assert.equal(api.getUnitCard(card.id),api.unitCards[kind]);assert.deepEqual(Array.from(api.unitCards[kind].examSkills),card.examSkills);assert.equal(Object.hasOwn(api.unitCards[kind],'skills'),false);}for(const inherited of ['toString','constructor','__proto__'])assert.equal(api.getUnitCard(inherited),null);assert.equal(api.getUnitCard('missing'),null);assert.equal(Object.isFrozen(api.unitCards),true);
});
test('rejects malformed Unit 7 cards before publishing them',()=>{
  assertInvalid(replace("const CARD_KEYS=['context','synthesis']","const CARD_KEYS=['context']"),/unit cards must contain exactly/);
  assertInvalid(replace("kind:'context'","kind:'synthesis'"),/card kind/);
  assertInvalid(replace("role:'Unit 7 Context Card'","role:''"),/card role/);
  assertInvalid(replace("examSkills:['Contextualization','Causation']","examSkills:['Causation','Causation']"),/card skills/);
  assertInvalid(replace("synthesis:{id:'apwh-u7-synthesis-allied-victory-bipolar-world'","synthesis:{id:'apwh-u7-context-imperial-rivalry-global-war'"),/duplicate card ID/);
  assertInvalid(replace("title:'From Imperial Rivalry to Global War'","title:'Arbitrary English Title'"),/card contract/);
  assertInvalid(replace('validate();',"Object.defineProperty(UNIT_CARD_MANIFEST.context.takeaways,'0',{enumerable:false});validate();"),/card takeaways/);
});
test('keeps the ordered source ledger structurally complete and locator-specific',()=>{
  const intro='# APWH Unit 7 Location Study Source Ledger\n\nThe learner records use edition-neutral locators in AMSCO AP World History Unit 7 and the College Board framework effective Fall 2026. Map pins are representative anchors; a named city does not imply that every regional process occurred only there. Comparisons among mass atrocities identify mechanisms without treating distinct cases as equivalent.\n\n';
  const locatorForTopics=topics=>`AMSCO AP World History, Unit 7, ${topics.length===1?'Topic':'Topics'} ${topics.length===1?topics[0]:topics.length===2?topics.join(' and '):`${topics.slice(0,-1).join(', ')}, and ${topics.at(-1)}`}`;
  assert.ok(ledger.startsWith(intro));const lines=ledger.trimEnd().split('\n');assert.equal(lines[4],'| Stable ID | AP topic assignment | Main event | Source locator | Claims covered |');assert.equal(lines[5],'| --- | --- | --- | --- | --- |');const rows=lines.slice(6).map(row=>row.split('|').slice(1,-1).map(cell=>cell.trim()));assert.equal(rows.length,30);assert.deepEqual(rows.map(row=>row[0]),records.map(record=>record[0]));assert.deepEqual(rows.map(row=>row[1]),records.map(record=>record[7].join(', ')));assert.deepEqual(rows.map(row=>row[2]),records.map(record=>locations.find(location=>location[0]===record[1])[2]));assert.deepEqual(rows.map(row=>row[3]),records.map(record=>locatorForTopics(record[7])));for(const cells of rows){assert.equal(cells.length,5);assert.match(cells[1],/^7\.[1-9](, 7\.[1-9])*$/);assert.match(cells[3],/^AMSCO AP World History, Unit 7, Topics? 7\.[1-9]/);assert.doesNotMatch(cells[3],/(page|p\.\s*\d|whole book|chapter)/i);assert.ok(cells[4].length>=45);}
  assert.ok(ledger.includes('does not treat the Armenian Genocide and Holocaust as equivalent'));
});
test('keeps required Unit 7 map-anchor and atrocity-comparison caveats in the ledger',()=>{
  const claimsById=new Map(ledger.trimEnd().split('\n').slice(6).map(row=>{const cells=row.split('|').slice(1,-1).map(cell=>cell.trim());return [cells[0],cells[4]];}));
  for(const id of records.filter(record=>record[1]==='108').map(record=>record[0]))assert.match(claimsById.get(id),/historical Mukden \/ modern Shenyang/);
  for(const id of records.filter(record=>record[1]==='25').map(record=>record[0]))assert.match(claimsById.get(id),/St\. Petersburg was called Petrograd in 1917/);
  for(const id of records.filter(record=>record[1]==='84').map(record=>record[0])){assert.match(claimsById.get(id),/El Alamein is west of Alexandria/);assert.match(claimsById.get(id),/Cairo is representative, not the battle site/);}
  assert.match(claimsById.get('apwh-u7-istanbul-armenian-genocide'),/targets, chronology, institutions, and setting/);assert.match(claimsById.get('apwh-u7-istanbul-armenian-genocide'),/does not treat the Armenian Genocide and Holocaust as equivalent/);
  assert.match(claimsById.get('apwh-u7-nanjing-massacre-civilian-violence'),/purposes, organization, duration, and mechanisms/);assert.match(claimsById.get('apwh-u7-nanjing-massacre-civilian-violence'),/does not treat the Nanjing Massacre and Holocaust as equivalent/);
  assert.match(claimsById.get('apwh-u7-berlin-holocaust-bureaucratic-genocide'),/not treat the Holocaust as equivalent to the Armenian Genocide or Nanjing Massacre/);
});
test('rejects source-ledger structural, vague-locator, page-number, and trailing-garbage regressions',()=>{
  const valid=ledger.trimEnd(),locatorForTopics=topics=>`AMSCO AP World History, Unit 7, ${topics.length===1?'Topic':'Topics'} ${topics.length===1?topics[0]:topics.length===2?topics.join(' and '):`${topics.slice(0,-1).join(', ')}, and ${topics.at(-1)}`}`,isValid=candidate=>{const lines=candidate.split('\n'),rows=lines.slice(6);return lines.length===36&&lines[4]==='| Stable ID | AP topic assignment | Main event | Source locator | Claims covered |'&&lines[5]==='| --- | --- | --- | --- | --- |'&&rows.length===30&&rows.every((row,index)=>{if(!row.endsWith('|'))return false;const cells=row.split('|').slice(1,-1).map(cell=>cell.trim());return cells.length===5&&cells[0]===records[index][0]&&cells[1]===records[index][7].join(', ')&&cells[2]===locations.find(location=>location[0]===records[index][1])[2]&&cells[3]===locatorForTopics(records[index][7])&&cells[4].length>=45;});};
  assert.equal(isValid(valid),true);const invalid=[valid.replace('| Main event |','| Event |'),valid.replace('AMSCO AP World History, Unit 7, Topics','AMSCO'),valid.replace('AMSCO AP World History, Unit 7, Topics','AMSCO AP World History, Unit 7, Topics p. 12'),valid.replace('Topics 7.1 and 7.9','Topic 7.1'),valid.replace('Topic 7.6','Topic 7.6 extra'),`${valid}\ntrailing garbage`,valid.replace(/\|$/,'|junk')];for(const candidate of invalid){assert.notEqual(candidate,valid);assert.equal(isValid(candidate),false);}
});
let asyncCheckComplete=false;
test('supports asynchronous checks',()=>new Promise(resolve=>setTimeout(()=>{asyncCheckComplete=true;resolve();},0)));
test('runs checks sequentially after awaiting thenables',()=>assert.equal(asyncCheckComplete,true));
nodeTest('APWH Unit 7 location-study contract',async()=>{for(const [name,check] of checks){try{const result=check();if(result&&typeof result.then==='function')await result;}catch(error){error.message=`${name}: ${error.message}`;throw error;}}});
