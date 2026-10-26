const test=require('node:test'),assert=require('node:assert/strict');
const {layoutNotes,layoutNodes,overlap}=require('./map-layout.cjs');
test('callouts avoid geography, markers, controls and edges',()=>{
 const points=[{x:350,y:240,width:230,height:160},{x:430,y:280,width:230,height:140}];
 const areas=[{x:270,y:170,width:240,height:180}],controls=[{x:700,y:0,width:100,height:180}];
 const placed=layoutNotes(points,800,500,areas,controls);assert.ok(placed);
 placed.forEach((b,i)=>{assert.ok(b.x>=12&&b.y>=12&&b.x+b.width<=788&&b.y+b.height<=488);[...areas,...controls,...placed.slice(i+1)].forEach(a=>assert.ok(!overlap(a,b,8)));points.forEach(a=>assert.ok(!overlap({x:a.x-25,y:a.y-25,width:50,height:50},b,8)));});
});
test('no safe layout and narrow screens use rail',()=>{assert.equal(layoutNotes([{x:100,y:100,width:230,height:180}],400,300,[],[]),null);assert.equal(layoutNotes([{x:400,y:250,width:230,height:180}],800,500,[{x:0,y:0,width:800,height:500}],[]),null);});
test('coincident chain steps stay separate, retain order and actual anchors',()=>{
 const rows=Array.from({length:10},(_,index)=>({index,x:250,y:150}));const nodes=layoutNodes(rows,500,300,[{x:420,y:0,width:80,height:178}]);assert.equal(nodes.length,10);
 nodes.forEach((n,i)=>{assert.equal(n.index,i);assert.equal(n.anchorX,250);assert.equal(n.anchorY,150);assert.ok(n.x>=24&&n.x<=476&&n.y>=48&&n.y<=276);nodes.slice(i+1).forEach(m=>assert.ok(Math.hypot(n.x-m.x,n.y-m.y)>=48));assert.ok(!overlap({x:n.x-22,y:n.y-22,width:44,height:44},{x:420,y:0,width:80,height:178},6));});
});
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../../world-map.html'),'utf8');
test('all authored chains have collision-free nodes at mobile and desktop sizes',()=>{
 const chains=vm.runInNewContext(source.match(/const CHAINS = ([\s\S]*?\n  \]);/)[1]);
 const pins=new Map([...source.matchAll(/<g\b([^>]*class="pin-group"[^>]*)>([\s\S]*?)<\/g>/g)].map(m=>[Number(m[2].match(/<text[^>]*>(\d+)<\/text>/)?.[1]),{x:Number(m[1].match(/data-cx="([^"]+)"/)[1]),y:Number(m[1].match(/data-cy="([^"]+)"/)[1])}]));
 assert.ok(chains.length>=40);assert.ok(pins.size>=100);
 for(const [w,h]of [[319,300],[580,300],[970,500]])for(const chain of chains){
  const coords=chain.stops.map((num,index)=>({...pins.get(num),index}));assert.ok(coords.every(p=>Number.isFinite(p.x)),chain.id);
  const xs=coords.map(p=>p.x),ys=coords.map(p=>p.y),minX=Math.min(...xs),minY=Math.min(...ys),sx=Math.max(...xs)-minX,sy=Math.max(...ys)-minY;
  const scale=Math.min((w-110)/Math.max(40,sx),(h-110)/Math.max(40,sy));
  const rows=coords.map(p=>({...p,x:45+(p.x-minX)*scale,y:60+(p.y-minY)*scale}));
  const controls=[{x:w-54,y:12,width:42,height:108}],points=layoutNodes(rows,w,h,controls);assert.equal(points.length,rows.length,chain.id+' '+w);
  points.forEach((a,i)=>points.slice(i+1).forEach(b=>assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=48,chain.id)));
 }
});
test('both generated bundles parse, no eagle added, reviewed content retained',()=>{
 for(const file of ['world-map.html','index.html']){const text=fs.readFileSync(path.join(__dirname,'../..',file),'utf8');for(const m of text.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);}
 assert.ok(!source.includes('noto-eagle'));assert.ok(source.includes("activeLearningView!=='practice'||!quizMode?.answered"));assert.ok(source.includes('world-map-note-rail'));assert.ok(source.includes('world-practice-active .world-timeline-dock'));
});
