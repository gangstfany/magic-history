import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {COURSES,courseFromHash,courseURL,acceptCourseMessage} from '../assets/site/modules.mjs';
const source=readFileSync(new URL('../assets/site/shell.mjs',import.meta.url),'utf8').replace(/^import[^\n]+\n/,'');
function harness(){
 const listeners={},timers=new Map();let clock=0;
 function element(tag='div'){
  const handlers={};return {tag,dataset:{},children:[],attrs:{},style:{setProperty(){}},contentWindow:{},hidden:false,textContent:'',
   setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},getAttribute(k){return this.attrs[k]||null;},
   append(...children){this.children.push(...children);},addEventListener(k,fn){handlers[k]=fn;},
   querySelectorAll(){return this.children.filter(c=>c.tag==='button');},
   emit(k,arg={}){handlers[k]?.(arg);},scrollIntoView(){this.scrolled=true;},focus(){this.focused=true;}};
 }
 const ids=Object.fromEntries(['courseChoices','courseFrames','moduleStatus','moduleRetry','courseStandalone','courseUnavailable','returnToWorld','courseTitle','courseEnglish','courses','about'].map(id=>[id,element()]));
 const document={getElementById:id=>ids[id],createElement:element,addEventListener:(k,fn)=>listeners['document:'+k]=fn};
 const location={href:'https://example.test/site/',origin:'https://example.test',hash:''};
 runInNewContext(source,{document,location,URL,Map,COURSES,courseFromHash,courseURL,acceptCourseMessage,window:{addEventListener:(k,fn)=>listeners[k]=fn},setTimeout:fn=>{const id=++clock;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id)});
 const choose=id=>{location.hash='#course='+id;listeners.hashchange();};
 return {ids,listeners,timers,location,choose};
}
test('shell lazily mounts modules, caches state, and shows one active frame',()=>{
 const h=harness();assert.equal(h.ids.courseFrames.children.length,1);
 const world=h.ids.courseFrames.children[0];
 h.choose('us');assert.equal(h.ids.courseFrames.children.length,2);assert.equal(world.hidden,true);
 h.choose('world');assert.equal(h.ids.courseFrames.children[0],world);assert.equal(world.hidden,false);
 h.choose('euro');assert.equal(h.ids.courseUnavailable.hidden,false);assert.equal(h.ids.courseStandalone.hidden,true);
 assert.ok(h.ids.courseFrames.children.every(f=>f.hidden));
});
test('a document load is not success; validated messages clear only their own timeout',()=>{
 const h=harness(),world=h.ids.courseFrames.children[0];
 assert.match(h.ids.moduleStatus.textContent,/载入/);
 h.listeners.message({origin:'https://attacker.test',source:world.contentWindow,data:{type:'magic-history:module',course:'world',height:900}});
 assert.match(h.ids.moduleStatus.textContent,/载入/);
 h.listeners.message({origin:h.location.origin,source:world.contentWindow,data:{type:'magic-history:module',course:'world',height:900}});
 assert.equal(h.ids.moduleStatus.textContent,'');assert.equal(world.style.height,'900px');assert.equal(h.timers.size,0);
});
test('bounded timeout exposes retry and retry reuses the selected frame',()=>{
 const h=harness(),world=h.ids.courseFrames.children[0];
 [...h.timers.values()][0]();assert.equal(h.ids.moduleRetry.hidden,false);
 h.ids.moduleRetry.emit('click');assert.equal(h.ids.moduleRetry.hidden,true);
 assert.equal(h.ids.courseFrames.children.length,1);assert.match(world.src,/apwh.html/);
});
test('page-section navigation scrolls without discarding the active course deep link',()=>{
 const h=harness();h.choose('us');let prevented=false;
 h.listeners['document:click']?.({target:{closest:()=>({getAttribute:()=> '#about'})},preventDefault(){prevented=true;}});
 assert.equal(prevented,true);assert.equal(h.ids.about.scrolled,true);assert.equal(h.ids.about.focused,true);assert.equal(h.location.hash,'#course=us');
});
