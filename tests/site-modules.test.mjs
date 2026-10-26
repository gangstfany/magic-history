import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { COURSES, courseFromHash, courseURL, acceptCourseMessage } from '../assets/site/modules.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('four independent course entries include an honest unavailable Euro module',()=>{
 assert.deepEqual(COURSES.map(c=>c.id),['world','us','euro','art']);
 assert.equal(COURSES.find(c=>c.id==='euro').entry,null);
 for(const c of COURSES.filter(c=>c.entry)) assert.ok(existsSync(new URL('../'+c.entry.split('?')[0],import.meta.url)));
});
test('course links are deterministic, validate fallback and preserve explicit Art private-media opt-in',()=>{
 assert.equal(courseFromHash('#course=us').id,'us');
 assert.equal(courseFromHash('#course=unknown').id,'world');
 assert.equal(courseFromHash('#%broken').id,'world');
 assert.match(courseURL(COURSES[0],new URL('https://example.test/site/')),/\/site\/apwh.html\?moduleRelease=20261026-2&embed=1$/);
 assert.match(courseURL(COURSES[3],new URL('https://example.test/site/?privateMedia=1')),/privateMedia=1/);
 assert.doesNotMatch(courseURL(COURSES[0],new URL('https://example.test/site/?privateMedia=1')),/privateMedia/);
});
test('course messages require the expected window, origin, course and finite bounded height',()=>{
 const frame={}, other={};
 const accept=(data,extra={})=>acceptCourseMessage({origin:'https://example.test',source:frame,data,...extra},{origin:'https://example.test',source:frame,id:'world'});
 const message={type:'magic-history:module',course:'world',height:920};
 assert.equal(accept(message),920);
 for(const height of [NaN,Infinity,-1,0,100000,'920']) assert.equal(accept({...message,height}),null);
 assert.equal(accept(message,{source:other}),null);
 assert.equal(accept(message,{origin:'https://other.test'}),null);
 assert.equal(accept({...message,course:'art'}),null);
 assert.equal(accept({...message,type:'other'}),null);
 assert.equal(accept(null),null);
});
test('public shell owns no World internals and the independent World workspace retains its features',()=>{
 const shell=read('index.html'),world=read('apwh.html');
 assert.doesNotMatch(shell,/__mapFilter|syncHomeEvents|APWH_U[1-9]|world-card-styles/);
 assert.match(shell,/data-account-trigger/);
 assert.match(shell,/assets\/site\/shell.mjs/);
 assert.match(world,/function renderTodayPick\(/);
 assert.match(world,/openRelatedTrade\(/);
 assert.match(world,/hostStudyDirectory/);
 assert.doesNotMatch(world,/artMapFrame|account-bootstrap|subjectSwitcher|selectSubject/);
});
test('World and shell build inputs and outputs are independent',()=>{
 const world=read('src/apwh/build.py'),shell=read('scripts/build-shell.py');
 assert.doesNotMatch(world,/src\/site\/index.template.html|ROOT \/ 'index.html'/);
 assert.match(world,/workspace.template.html/);
 assert.match(world,/'apwh.html'/);
 assert.doesNotMatch(shell,/content-corrected|src\/apwh/);
});
test('module navigation versions the HTML so old standalone caches cannot omit the shell bridge',()=>{
 for(const course of COURSES.filter(c=>c.entry)){
  const url=new URL(courseURL(course,new URL('https://example.test/')));
  assert.equal(url.searchParams.get('moduleRelease'),'20261026-2');
 }
});
test('Art adapter reports its natural toolbar and workspace height instead of a viewport floor',()=>{
 assert.equal(COURSES.find(c=>c.id==='art').sizing,'content');
 const html=read('art-history-map.html');
 assert.match(html,/assets\/site\/art-embed.css/);
 const css=read('assets/site/art-embed.css');
 assert.match(css,/height:\s*auto/);
 assert.match(css,/min-height:\s*0/);
});
test('World embedded card can shrink after switching from a longer learning panel',()=>{
 const template=read('src/apwh/workspace.template.html');
 assert.match(template,/\.card\s*\{[^}]*min-height:0/);
});
