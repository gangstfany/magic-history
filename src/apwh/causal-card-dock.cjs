// Shared in-map card docking for all APWH causal chains. Trade and practice remain independent.
function isCausalDockRoute(route){return Boolean(route?.kind==='chain'&&Array.isArray(route.units)&&route.units.length&&route.units.every(unit=>/^u[1-9]$/.test(unit)));}
function keepCausalDockPopup(route,step,overview,cachedKey){return isCausalDockRoute(route)&&!overview&&cachedKey===route.id+':'+step;}
function causalAnchorFitsDock(point,width,height,card,controls=[]){
 const collides=typeof module!=='undefined'?require('./map-layout.cjs').overlap:overlap;
 if(!point||point.x<24||point.y<24||point.x>width-24||point.y>height-24)return false;
 const marker={x:point.x-22,y:point.y-22,width:44,height:44};
 return !collides(marker,card,12)&&controls.every(control=>!collides(marker,control,8));
}
function layoutCausalDock(width,height,controls=[],preferredSide='left'){
 const collides=typeof module!=='undefined'?require('./map-layout.cjs').overlap:overlap;
 if(preferredSide!=='right')preferredSide='left';
 const gap=12,mode=width>=560?'side':'bottom';
 let card,side=preferredSide;
 if(mode==='side'){
  const cardWidth=Math.min(292,Math.floor(width*.42));
  const candidates=[preferredSide,preferredSide==='left'?'right':'left'].map(candidate=>{
   const x=candidate==='left'?gap:width-gap-cardWidth;
   const blocking=controls.filter(c=>c.x<x+cardWidth+8&&c.x+c.width+8>x);
   const y=Math.max(gap,...blocking.map(c=>c.y+c.height+gap));
   return {x,y,width:cardWidth,height:Math.min(340,height-y-gap),side:candidate};
  });
  const selected=candidates.find(c=>c.height>=220)||candidates[0];
  side=selected.side;card={x:selected.x,y:selected.y,width:selected.width,height:selected.height};
 }else{
  const cardHeight=Math.min(200,Math.floor(height*.48));
  card={x:gap,y:height-gap-cardHeight,width:width-gap*2,height:cardHeight};side='bottom';
 }
 const ideal=mode==='bottom'?{x:width/2,y:card.y/2}:{x:side==='left'?(card.x+card.width+24+width-gap)/2:(gap+card.x-24)/2,y:height/2};
 const candidates=[ideal];
 for(let y=36;y<=height-36;y+=8)for(let x=36;x<=width-36;x+=8)candidates.push({x,y});
 const focus=candidates.filter(p=>{
  const marker={x:p.x-22,y:p.y-22,width:44,height:44};
  return !collides(marker,card,12)&&controls.every(c=>!collides(marker,c,8));
 }).sort((a,b)=>Math.hypot(a.x-ideal.x,a.y-ideal.y)-Math.hypot(b.x-ideal.x,b.y-ideal.y))[0]||ideal;
 return {mode,side,card,focus};
}
if(typeof module!=='undefined')module.exports={isCausalDockRoute,keepCausalDockPopup,layoutCausalDock,causalAnchorFitsDock};
