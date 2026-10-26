const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const world=fs.readFileSync(path.join(__dirname,'../../world-map.html'),'utf8');
const chains=vm.runInNewContext(world.match(/const CHAINS = ([\s\S]*?\n  \]);/)[1]);
const byId=Object.fromEntries(chains.map(c=>[c.id,c]));
test('all 49 chains and 225 steps retain local source context without dangling correction references',()=>{
 assert.equal(chains.length,49);assert.equal(chains.reduce((n,c)=>n+c.stops.length,0),225);
 for(const c of chains){assert.equal(c.sourceContext?.authorship,'teacher-synthesis',c.id);assert.equal(c.stepNotes?.length,c.stops.length,c.id);for(const [i,notes]of c.stepNotes.entries()){assert.ok(notes.length,c.id+':'+i);for(const n of notes){assert.ok(n.text);assert.ok(n.sources?.length);for(const s of n.sources)if(s.url)assert.match(s.url,/^https:\/\//);}}}
 assert.doesNotMatch(JSON.stringify(chains),/见更正|详见开篇更正/);
});
test('critical dates, institutional categories and statistical populations are corrected in learner prose',()=>{
 assert.doesNotMatch(byId.u7_main.evidence[4],/自导.*纵火/);
 assert.match(byId.u7_main.evidence[6],/达豪|Dachau/);assert.match(byId.u7_main.evidence[6],/集中营/);
 assert.doesNotMatch(byId.u7_main.exam,/before any camp|早于任何|尚无任何/);
 assert.match(byId.u5_sub_reactions.evidence[3],/1927/);
 assert.doesNotMatch(byId.u6_sub_resistance.links[1],/死的那天一起散架/);
 assert.match(byId.u8_sub_pivot.evidence[1],/1947/);assert.match(byId.u8_sub_pivot.evidence[1],/1978/);assert.match(byId.u8_sub_pivot.evidence[1],/1979/);
 assert.match(byId.u8_main.links[1],/51/);assert.match(byId.u9_sub_unfrozen.links[1],/已在场|已经在场/);
 assert.match(byId.u9_main.links.at(-1),/法律约束力/);
});
test('comparative chains no longer teach the specific unsupported causal claims',()=>{
 const all=JSON.stringify(chains);
 for(const phrase of ['粮食第一次多到','海面上于是留下一块没人管的空缺','中美洲要不到瓷器','没有可以指认的具体不公','文化的流向在这个世纪里第一次双向','第三世界\"从来不是第三种力量','死的那天一起散架'])assert.ok(!all.includes(phrase),phrase);
 assert.match(byId.u4_main.evidence[0],/王子/);
 assert.doesNotMatch(byId.u4_main.evidence[0],/Omani.*Columbus/);
});
test('reviewed evidence does not contradict the qualified explanations',()=>{
 assert.doesNotMatch(byId.u2_main.evidence[1],/所有征服地行一套统一/);
 assert.doesNotMatch(byId.u2_main.evidence[7],/中国依旧只认欧洲的金银|却废科举/);
 assert.doesNotMatch(byId.u3_sub_tolerance.evidence[1],/由 Hinduism 发展而来/);
 assert.doesNotMatch(byId.u3_sub_extraction.evidence[3],/他们有时被称作 tax farmers/);
 assert.match(byId.u7_main.evidence[2],/1916/);
});
test('independent review fixes terminology and source anchors without changing geography',()=>{
 assert.doesNotMatch(byId.u1_main.evidence[0],/浮田/);
 assert.doesNotMatch(byId.u2_sub_credit.evidence[0],/存入纸币/);
 assert.doesNotMatch(byId.u3_main.evidence[2],/people of the book/);
 assert.doesNotMatch(byId.u3_main.evidence[4],/不冻港/);
 assert.doesNotMatch(byId.u1_sub_decentralization.links[1],/欧洲武装/);
 assert.ok(byId.u3_main.stepNotes[5].some(n=>n.sources.some(s=>/234.*235.*236/.test(s.locator||''))));
});
test('source remediation preserves every original chain ID, stop and unit association',()=>{
 const snapshot=fs.readFileSync(path.join(__dirname,'source-map-snapshot.html'),'utf8');
 const embedded=snapshot.match(/id="worldMapFrame"[^>]*srcdoc="([^"]*)"/)[1];
 const decoded=embedded.replace(/&#x([0-9a-f]+);/gi,(_,v)=>String.fromCodePoint(parseInt(v,16))).replace(/&#([0-9]+);/g,(_,v)=>String.fromCodePoint(+v)).replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
 const original=vm.runInNewContext(decoded.match(/const CHAINS = ([\s\S]*?\n  \]);/)[1]);
 const contract=xs=>JSON.stringify(xs.map(c=>({id:c.id,stops:c.stops,units:c.units})).sort((a,b)=>a.id.localeCompare(b.id)));
 assert.equal(contract(chains),contract(original));
});
