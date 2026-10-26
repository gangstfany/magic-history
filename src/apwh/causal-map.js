  // Static selection only: no causal playback, moving marker or automatic advance.
  const causalHud=document.createElement('div');causalHud.className='world-causal-hud';causalHud.hidden=true;
  const causalStatus=document.createElement('span');causalStatus.setAttribute('role','status');
  const causalOverviewBtn=document.createElement('button');causalOverviewBtn.type='button';causalHud.append(causalStatus,causalOverviewBtn);stage.append(causalHud);
  let causalOverview=false;
  let causalDockSide='left',causalPopupCache=null;
  function rememberCausalDockScroll(){
    if(causalPopupCache?.note.isConnected)causalPopupCache.scrollTop=causalPopupCache.note.querySelector('.world-causal-dock-body').scrollTop;
  }
  let causalDockViewport='';
  function retainCausalDockPopup(){return activeLearningView==='chain'&&causalWorkspacePanel==='chain'&&keepCausalDockPopup(routeMode?.route,routeMode?.i,causalOverview,causalPopupCache?.key);}
  function refocusCausalDockAfterResize(width,height){
    if(!isCausalDockRoute(routeMode?.route)||activeLearningView!=='chain'||causalWorkspacePanel!=='chain'||causalOverview)return;
    const key=width+'x'+height;
    if(key===causalDockViewport)return;
    causalDockViewport=key;focusCausalPlace(routeMode.route.stops[routeMode.i]);
  }
  function causalPopup(route,step){
    const key=route.id+':'+step;
    if(causalPopupCache?.key===key)return causalPopupCache.note;
    const data=causalStopData(route,step,index),note=document.createElement('article');
    note.className='world-map-note world-causal-popup world-causal-dock-popup';note.dataset.step=step;note.setAttribute('aria-label',`第 ${step+1} 环地点与事件`);
    const header=document.createElement('header'),heading=document.createElement('strong'),title=document.createElement('h3');
    heading.textContent=`第 ${step+1} 环 · ${plainMapText(data.city)}`;title.textContent=plainMapText(data.label);header.append(heading,title);
    const body=document.createElement('div');body.className='world-causal-dock-body';body.tabIndex=0;body.setAttribute('role','region');body.setAttribute('aria-label',`第 ${step+1} 环解释与证据`);
    const preview=document.createElement('div');preview.className='world-causal-dock-preview';body.append(preview);
    const full=[];
    for(const [label,value]of [['事件与证据 · ',data.evidence],[`${step} → ${step+1} · 联系与解释：`,data.incomingCause]]){
      const text=plainMapText(value);if(!text)continue;
      const p=document.createElement('p'),b=document.createElement('b');b.textContent=label;p.append(b,document.createTextNode(text.length>90?text.slice(0,90)+'…':text));preview.append(p);
      full.push([label,text]);
    }
    if(full.length){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='展开完整解释与证据';details.append(summary);
      for(const [label,text]of full){const p=document.createElement('p'),b=document.createElement('b');b.textContent=label;p.append(b,document.createTextNode(text));details.append(p);}details.addEventListener('toggle',()=>{summary.textContent=details.open?'收起完整解释与证据':'展开完整解释与证据';});body.prepend(details);}
    const links=linksForStep(CAUSAL_TRADE_LINKS,route.id,step);
    if(links.length){const box=document.createElement('div');box.className='causal-popup-routes';
      const label=document.createElement('div');label.className='causal-related-label';label.textContent='相关商路与交流';box.append(label);
      for(const link of links){const profile=TRADE_PROFILES.find(p=>p.id===link.routeId);if(!profile)continue;const button=document.createElement('button');button.type='button';button.textContent=`${profile.name.split(' · ')[0]} · ${profile.sites.length}站 ↗`;button.title=link.reason;button.addEventListener('click',()=>openRelatedTrade(profile.id));box.append(button);}body.append(box);}
    const footer=document.createElement('footer'),next=document.createElement('button');next.type='button';next.className='world-causal-continue';next.textContent=step<route.stops.length-1?'下一环 →':'返回第一环';next.addEventListener('click',()=>goToStop(step<route.stops.length-1?step+1:0));footer.append(next);note.append(header,body,footer);
    note.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});note.addEventListener('pointerdown',e=>e.stopPropagation());
    causalPopupCache={key,note,scrollTop:0};return note;
  }
  function applyCausalCamera(camera){stopFitAnimation();zoom=camera.zoom;panX=camera.panX;panY=camera.panY;clampPan();applyTransform();}
  function focusCausalPlace(num){const pin=pinPos(num);if(!pin)return;let b;try{b=findCountryPathForPin(num)?.getBBox();}catch{}const z=Math.min(3.8,Math.max(1,Math.min(VB_W/Math.max(380,Math.min(900,(b?.width||200)*1.45)),VB_H/Math.max(250,Math.min(650,(b?.height||120)*1.45)))));let target={x:VB_W/2,y:VB_H/2},dock=null;
    if(isCausalDockRoute(routeMode?.route)){
      dock=layoutCausalDock(stage.clientWidth,stage.clientHeight,mapControls(),causalDockSide);
      const rect=stage.getBoundingClientRect(),point=svg.createSVGPoint();
      point.x=rect.left+dock.focus.x;point.y=rect.top+dock.focus.y;
      target=point.matrixTransform(svg.getScreenCTM().inverse());
    }
    let fittedZoom=z;
    for(;;){
      applyCausalCamera({zoom:fittedZoom,panX:target.x-pin.x*fittedZoom,panY:target.y-pin.y*fittedZoom});
      // World-edge pan clamping can leave the actual place beneath the dock.
      // Increase zoom only until both the place and its number have safe space.
      if(!dock||causalAnchorFitsDock(mapPoint(num),stage.clientWidth,stage.clientHeight,dock.card,mapControls())||fittedZoom>=MAX_ZOOM)break;
      fittedZoom=Math.min(MAX_ZOOM,fittedZoom*1.25);
    }
  }
  function fitCausalOverview(route){const ps=route.stops.map(pinPos).filter(Boolean);if(!ps.length)return;const xs=ps.map(p=>p.x),ys=ps.map(p=>p.y),l=Math.min(...xs),r=Math.max(...xs),t=Math.min(...ys),b=Math.max(...ys),z=Math.min(8,Math.max(1,Math.min(VB_W/(Math.max(40,r-l)+140),VB_H/(Math.max(40,b-t)+140))));applyCausalCamera({zoom:z,panX:VB_W/2-(l+r)/2*z,panY:VB_H/2-(t+b)/2*z});}
  function selectCausalMapStep(route,step){const revision=++causalSelectionRevision;requestAnimationFrame(()=>{if(revision!==causalSelectionRevision||activeLearningView!=='chain'||causalWorkspacePanel!=='chain'||routeMode?.route!==route||routeMode.i!==step)return;stopAutoPlay();if(causalMapRestore&&(causalMapRestore.chainId!==route.id||causalMapRestore.step!==step))causalMapRestore=null;if(causalMapRestore?.chainId===route.id&&causalMapRestore.step===step){causalOverview=causalMapRestore.overview;applyCausalCamera(causalMapRestore.camera);causalMapRestore=null;}else{causalOverview=false;focusCausalPlace(route.stops[step]);}queueMapAnnotations();});}
  function resetCausalJourney(){causalHud.hidden=true;delete mapOverlay.dataset.causalView;}
  function setCausalOverview(value){if(routeMode?.route.kind!=='chain')return;causalOverview=!!value;if(causalOverview)fitCausalOverview(routeMode.route);else focusCausalPlace(routeMode.route.stops[routeMode.i]);queueMapAnnotations();}
  causalOverviewBtn.addEventListener('click',()=>setCausalOverview(!causalOverview));
  function drawCausalJourney(route,width,height){stage.classList.add('focused-causal');setMapOverlayVisible(true);causalHud.hidden=false;mapOverlay.dataset.chainId=route.id;mapOverlay.dataset.causalView=causalOverview?'overview':'selected';causalStatus.textContent=causalOverview?`全链 · ${route.stops.length} 环`:`第 ${routeMode.i+1} / ${route.stops.length} 环`;causalOverviewBtn.textContent=causalOverview?'聚焦当前环':'查看全链';
    const dock=isCausalDockRoute(route)&&!causalOverview?layoutCausalDock(width,height,mapControls(),causalDockSide):null;
    if(dock?.mode==='side')causalDockSide=dock.side;
    const nodeControls=dock?[...mapControls(),dock.card]:mapControls();
    const rows=route.stops.map((num,index)=>{const p=mapPoint(num);return p?{...p,index,num,label:route.labels[index]}:null;}).filter(Boolean),points=layoutNodes(causalOverview?rows:rows.filter(p=>p.index===routeMode.i),width,height,nodeControls),byIndex=new Map(points.map(p=>[p.index,p]));
    if(causalOverview){const defs=mapSvg('defs'),a=mapSvg('marker',{id:'worldCausalArrow',viewBox:'0 0 8 8',refX:7,refY:4,markerWidth:6,markerHeight:6,orient:'auto'});a.append(mapSvg('path',{d:'M1 1 L7 4 L1 7',fill:'none',stroke:'#496f72','stroke-width':1.5}));defs.append(a);mapOverlay.append(defs);for(const p of points){const n=byIndex.get(p.index+1);if(!n)continue;const dx=n.x-p.x,dy=n.y-p.y,d=Math.hypot(dx,dy)||1;mapOverlay.append(mapSvg('path',{d:`M${p.x+dx/d*24},${p.y+dy/d*24} L${n.x-dx/d*27},${n.y-dy/d*27}`,class:'world-causal-link','marker-end':'url(#worldCausalArrow)'}));}}
    for(const p of points){if(Math.hypot(p.x-p.anchorX,p.y-p.anchorY)>8)mapOverlay.append(mapSvg('line',{x1:p.x,y1:p.y,x2:p.anchorX,y2:p.anchorY,class:'world-geography-tether'}));const g=mapSvg('g',{class:`world-causal-node${p.index===routeMode.i?' is-current':''}`,transform:`translate(${p.x} ${p.y})`,role:'button',tabindex:0,'aria-label':`第 ${p.index+1} 环：${plainMapText(p.label)}`,'aria-pressed':String(p.index===routeMode.i),'data-causal-step':p.index});const activate=()=>goToStop(p.index);g.addEventListener('click',activate);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});g.append(mapSvg('circle',{r:22,class:'world-node-ring'}),mapSvg('circle',{r:17,class:'world-node-face'}),mapSvg('text',{y:5,'text-anchor':'middle'},p.index+1));mapOverlay.append(g);}
    const current=byIndex.get(routeMode.i);
    if(current&&dock){
      const note=causalPopup(route,routeMode.i),b=dock.card;
      note.style.width=b.width+'px';note.style.height=b.height+'px';note.style.maxHeight=b.height+'px';note.style.left=b.x+'px';note.style.top=b.y+'px';note.dataset.dock=dock.mode;
      if(note.parentNode!==noteLayer)noteLayer.append(note);
      note.querySelector('.world-causal-dock-body').scrollTop=causalPopupCache.scrollTop;
      mapOverlay.append(mapSvg('line',{x1:current.anchorX,y1:current.anchorY,x2:Math.max(b.x,Math.min(current.x,b.x+b.width)),y2:Math.max(b.y,Math.min(current.y,b.y+b.height)),class:'world-geography-tether'}));
      return;
    }

  }
