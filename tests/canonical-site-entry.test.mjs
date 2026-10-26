import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const shell=read('index.html'),home=read('apwh.html'),world=read('world-map.html');
test('complete homepage connects the reviewed causal workspace and its shared styles',()=>{
 assert.match(home,/openRelatedTrade\(/);
 assert.match(home,/id="world-panel-styles"/);
 assert.match(world,/function staticChainItineraryHTML\(/);
 assert.match(world,/今玻利维亚安第斯山中的 Potosí/);
});
test('Today’s Pick is retained and the source map loads eagerly',()=>{
 assert.match(home,/id="todayPick"/);
 const frame=home.match(/<iframe\b[^>]*id="worldMapFrame"[^>]*>/)?.[0];
 assert.ok(frame);assert.match(frame,/src="world-map.html"/);assert.doesNotMatch(frame,/loading="lazy"/);
 assert.doesNotMatch(home,/\.topnav,\.hero-copy,\.today-pick[^}]*display:none!important/);
 assert.match(home,/function renderTodayPick\(/);
 assert.match(shell,/data-account-trigger/);
});
test('legacy preview URLs resolve to the one complete homepage',()=>{
 for(const p of ['previews/world-keypoints-2026-10-25/index.html','magic-history-map-keypoints.html']){
  const html=read(p);assert.ok(html.length<4000,p+' remains a duplicate app');
  assert.match(html,/http-equiv="refresh"/i);assert.match(html,/index\.html/);
 }
});
test('the canonical source and build entry are explicit',()=>{
 for(const p of ['src/site/index.template.html','src/apwh/build.py','scripts/build-site.py'])assert.ok(fs.existsSync(new URL('../'+p,import.meta.url)),p);
});
test('the existing standalone US History module has a homepage entry',()=>{
 assert.match(shell,/href="apush-map\.html"/);
});
