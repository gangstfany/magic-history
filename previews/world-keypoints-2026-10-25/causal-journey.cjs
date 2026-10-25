// Clock is independent of DOM/camera; cancellation prevents stale arrival cards.
function createJourneyPlayer({now=()=>performance.now(),request=cb=>requestAnimationFrame(cb),cancel=id=>cancelAnimationFrame(id),onFrame=()=>{},onPhase=()=>{},onArrive=()=>{}}={}){
 let state={phase:'idle',paused:false,progress:0},frame=null,started=0,elapsed=0,token=0;
 const snapshot=()=>({...state});
 function advance(){const total=state.travelMs+state.focusMs;elapsed=Math.min(total,Math.max(0,now()-started));const phase=elapsed<state.travelMs?'travel':elapsed<total?'focus':'arrived';const changed=phase!==state.phase;
  state={...state,phase,progress:state.travelMs?Math.min(1,elapsed/state.travelMs):1,remainingFocus:Math.max(0,total-elapsed)};
  if(changed)onPhase(snapshot());onFrame(snapshot());if(phase==='arrived'){onArrive(snapshot());return;}
  const mine=token;frame=request(()=>{frame=null;if(mine===token&&!state.paused)advance();});
 }
 function stopFrame(){++token;if(frame!==null)cancel(frame);frame=null;}
 return{snapshot,start(options){stopFrame();elapsed=0;started=now();state={...options,travelMs:Math.max(0,options.travelMs||0),focusMs:Math.max(0,options.focusMs||0),phase:'pending',paused:false,progress:0};advance();},
  pause(){if(state.phase==='idle'||state.phase==='arrived'||state.paused)return false;elapsed=Math.max(0,now()-started);stopFrame();state={...state,paused:true};onFrame(snapshot());return true;},
  resume(){if(!state.paused)return false;started=now()-elapsed;state={...state,paused:false};onPhase(snapshot());advance();return true;},
  cancel(){stopFrame();state={phase:'idle',paused:false,progress:0};}
 };
}
function causalStopData(route,step,index){const num=route.stops[step],items=index[num]||[],declared=route.stopEvents?.[step];return{step,num,city:items[0]?.city||String(num),label:route.labels?.[step]||'',evidence:route.evidence?.[step]||'',incomingCause:step>0?route.links?.[step-1]||'':'',event:declared?items.find(it=>it.sourceId===declared)||null:items.length===1?items[0]:null};}
if(typeof module!=='undefined')module.exports={createJourneyPlayer,causalStopData};
