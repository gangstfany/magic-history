const test=require('node:test'),assert=require('node:assert/strict');
const {isCausalDockRoute,layoutCausalDock}=require('./causal-card-dock.cjs');
const {overlap}=require('./map-layout.cjs');
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../../world-map.html'),'utf8');
const chains=vm.runInNewContext(source.match(/const CHAINS = ([\s\S]*?\n  \]);/)[1]);
test('all nine units and valid cross-unit chains opt into docking, excluding trade and invalid routes',()=>{
 assert.equal(chains.length,49);
 assert.deepEqual([...new Set(chains.flatMap(c=>Array.from(c.units)))].sort(),['u1','u2','u3','u4','u5','u6','u7','u8','u9']);
 for(const chain of chains)assert.equal(isCausalDockRoute(chain),true,chain.id);
 assert.equal(isCausalDockRoute({kind:'chain',units:['u1','u2']}),true);
 for(const route of [null,{}, {kind:'route',units:['u1']},{kind:'chain',units:[]},{kind:'chain',units:['u10']}])assert.equal(isCausalDockRoute(route),false);
});
test('Causal cards and the focused marker fit inside desktop and mobile maps without overlapping controls',()=>{
 for(const [width,height]of [[786,500],[605,500],[567,500],[794,420],[320,420],[280,420]]){
  const controls=[{x:width-54,y:12,width:42,height:108},{x:12,y:10,width:Math.min(180,width-78),height:44}];
  const {card,focus,mode}=layoutCausalDock(width,height,controls);
  assert.ok(card.x>=12&&card.y>=12&&card.x+card.width<=width-12&&card.y+card.height<=height-12,`${width} ${JSON.stringify(card)}`);
  for(const control of controls)assert.equal(overlap(card,control,8),false,`${width} card/control`);
  const marker={x:focus.x-22,y:focus.y-22,width:44,height:44};
  assert.equal(overlap(card,marker,12),false,`${width} marker/card`);
  for(const control of controls)assert.equal(overlap(marker,control,8),false,`${width} marker/control`);
  assert.equal(mode,width>=560?'side':'bottom');
 }
});
test('side docking stays stable at a requested side and does not depend on old country bounding boxes',()=>{
 const a=layoutCausalDock(786,500,[]),b=layoutCausalDock(786,500,[],'right');
 assert.equal(a.side,'left');assert.equal(b.side,'right');assert.ok(b.card.x>a.card.x);
 assert.equal(a.card.height,340);assert.equal(b.card.height,340);
});
test('returning from the mobile bottom dock restores a valid desktop side',()=>{
 const dock=layoutCausalDock(786,500,[],'bottom');assert.equal(dock.side,'left');
});
test('only the same active causal step retains the existing focused popup node',()=>{
 const {keepCausalDockPopup}=require('./causal-card-dock.cjs');
 const route={id:'u1_main',kind:'chain',units:['u1']};
 assert.equal(keepCausalDockPopup(route,7,false,'u1_main:7'),true);
 assert.equal(keepCausalDockPopup(route,0,false,'u1_main:7'),false);
 assert.equal(keepCausalDockPopup(route,7,true,'u1_main:7'),false);
 assert.equal(keepCausalDockPopup({...route,id:'u2_main',units:['u2']},7,false,'u1_main:7'),false);
});
test('remaining published Unit 2–9 chains also receive in-map cards',()=>{
 const remaining=chains.filter(c=>!c.units.includes('u1'));
 assert.ok(remaining.length>30);
 for(const chain of remaining)assert.equal(isCausalDockRoute(chain),true,chain.id);
 assert.equal(isCausalDockRoute({kind:'chain',units:['u1','u2']}),true);
});
test('camera validation protects the real geographic anchor, not just a relocated number',()=>{
 const {causalAnchorFitsDock}=require('./causal-card-dock.cjs');
 const dock=layoutCausalDock(786,500,[]);
 assert.equal(causalAnchorFitsDock({x:292,y:250},786,500,dock.card,[]),false,'San Francisco anchor remains under the left card');
 assert.equal(causalAnchorFitsDock({x:357,y:250},786,500,dock.card,[]),true,'extra zoom reveals a western-edge anchor');
 assert.equal(causalAnchorFitsDock({x:-1,y:250},786,500,dock.card,[]),false);
 assert.equal(causalAnchorFitsDock({x:750,y:40},786,500,dock.card,[{x:732,y:12,width:42,height:108}]),false);
});
