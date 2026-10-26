import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('shell never measures or rewrites another course document',()=>{
 const script=read('assets/site/shell.mjs');
 assert.doesNotMatch(script,/contentDocument|contentWindow\.__|styleEmbedded|__mapFilter/);
 assert.match(script,/acceptCourseMessage/);
 assert.match(script,/item\.course\.sizing==='content'/);
});
test('course switching preserves loaded nodes, selected state and a single visible iframe',()=>{
 const script=read('assets/site/shell.mjs');
 assert.match(script,/if\(!cache.has\(active.id\)\)mount\(active\)/);
 assert.match(script,/item.frame.hidden=hidden/);
 assert.match(script,/setAttribute\('aria-hidden',String\(hidden\)\)/);
 assert.match(script,/button.type = 'button'/);
 assert.match(script,/setAttribute\('aria-pressed'/);
 assert.match(script,/addEventListener\('hashchange',select\)/);
});
test('loading failures are bounded and retry works independently of course internals',()=>{
 const script=read('assets/site/shell.mjs');
 assert.match(script,/12000/); assert.match(script,/retry.addEventListener\('click'/);
 assert.match(script,/markReady/);assert.match(script,/clearTimeout\(item.timer\)/);
});
test('responsive course layout stays inside each independent module',()=>{
 const css=read('assets/site/shell.css'),world=read('apwh.html');
 assert.match(read('assets/site/art-embed.css'),/body\.is-embedded/);
 assert.match(css,/@media\(max-width:700px\)/);
 assert.match(world,/function styleEmbeddedMap\(/);
 assert.doesNotMatch(world,/styleEmbeddedArt|artMapFrame/);
 const sync=world.split('function syncHomeEvents()')[1].split('// 右侧面板是')[0];
 assert.doesNotMatch(sync,/scrollIntoView/,'background World sync must not scroll the public homepage');
});
