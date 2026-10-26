  // Current-chain geography and independent, post-answer practice annotations.
  const mapNS='http://www.w3.org/2000/svg';
  const mapOverlay=document.createElementNS(mapNS,'svg');
  mapOverlay.classList.add('world-route-overlay');mapOverlay.setAttribute('aria-label','当前因果链路线');
  const noteLayer=document.createElement('div');noteLayer.className='world-practice-notes';
  const noteRail=document.createElement('section');noteRail.className='world-map-note-rail';noteRail.hidden=true;noteRail.setAttribute('aria-label','地图说明');
  stage.append(mapOverlay,noteLayer);stage.closest('.map-zone').after(noteRail);
  let redrawQueued=false;
  function queueMapAnnotations(){if(redrawQueued)return;redrawQueued=true;requestAnimationFrame(()=>{redrawQueued=false;renderMapAnnotations();});}
  function setMapOverlayVisible(shown){mapOverlay.style.display=shown?'block':'none';mapOverlay.setAttribute('aria-hidden',String(!shown));}
  function mapSvg(tag,attrs={},text){const el=document.createElementNS(mapNS,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text!==undefined)el.textContent=text;return el;}
  function localRect(el){const b=el.getBoundingClientRect(),s=stage.getBoundingClientRect();return{x:b.left-s.left,y:b.top-s.top,width:b.width,height:b.height};}
  function mapPoint(num){const g=stopGroupFor(num),m=zoomLayer.getScreenCTM();if(!g||!m)return null;const p=svg.createSVGPoint();p.x=Number(g.dataset.cx);p.y=Number(g.dataset.cy);const q=p.matrixTransform(m),s=stage.getBoundingClientRect();return{x:q.x-s.left,y:q.y-s.top};}
  function mapControls(){return[localRect(stage.querySelector('.zoom-controls')),...[...stage.querySelectorAll('.world-causal-hud')].filter(h=>!h.hidden).map(localRect)];}
  function mapNote(title,body,subtitle){const el=document.createElement('article');el.className='world-map-note';const h=document.createElement('strong');h.textContent=title;el.append(h);if(subtitle){const small=document.createElement('small');small.textContent=subtitle;el.append(small);}const p=document.createElement('p');p.textContent=body;el.append(p);return el;}
  function plainMapText(value){const d=document.createElement('div');d.innerHTML=value||'';return d.textContent.replace(/\s+/g,' ').trim();}
  function renderMapAnnotations(){
    document.body.classList.toggle('world-practice-active',activeLearningView==='practice');
    document.body.classList.toggle('world-causal-active',activeLearningView==='chain');
    document.body.classList.remove('world-trade-active');
    document.body.classList.toggle('world-causal-dock-active',activeLearningView==='chain'&&causalWorkspacePanel==='chain'&&isCausalDockRoute(routeMode?.route));
    rememberCausalDockScroll();
    const width=stage.clientWidth,height=stage.clientHeight;
    const focusedTradeStep=mapOverlay.contains(document.activeElement)?document.activeElement?.getAttribute('data-trade-step'):null;
    const focusedStep=mapOverlay.contains(document.activeElement)?document.activeElement?.getAttribute('data-causal-step'):null;
    delete mapOverlay.dataset.chainId;
    mapOverlay.replaceChildren();
    if(!retainCausalDockPopup())noteLayer.replaceChildren();
    noteRail.replaceChildren();noteRail.hidden=true;
    stage.classList.remove('focused-causal','focused-practice','focused-trade');setMapOverlayVisible(false);
    if(!width||!height)return;
    refocusCausalDockAfterResize(width,height);
    mapOverlay.setAttribute('viewBox',`0 0 ${width} ${height}`);
    if(activeLearningView==='chain'&&routeMode?.route.kind==='chain'){
      resetTradeJourney();
      drawCausalJourney(routeMode.route,width,height);
      if(focusedStep!==null)mapOverlay.querySelector(`[data-causal-step="${focusedStep}"]`)?.focus({preventScroll:true});
      return;
    }
    resetCausalJourney();
    if(isTradeWorkspace()&&routeMode&&routeMode.route.kind!=='chain'){drawTradeMap(routeMode.route,width,height);if(focusedTradeStep!==null)mapOverlay.querySelector(`[data-trade-step="${focusedTradeStep}"]`)?.focus({preventScroll:true});return;}
    resetTradeJourney();
    if(activeLearningView!=='practice'||!quizMode?.answered||!quizMode.q)return;
    stage.classList.add('focused-practice');
    const q=quizMode.q,point=mapPoint(q.num);if(!point)return;
    // Always show only this question's anchor, without navigating out of practice.
    svg.querySelectorAll('.pin-group').forEach(g=>g.classList.toggle('revealed',g===stopGroupFor(q.num)));
    const title=`${q.num} · ${plainMapText(q.it.city)}`,body=plainMapText(q.it.trigHTML),subtitle=`${q.it.yr} · ${q.it.catFull}`;
    const note=mapNote(title,body,subtitle);noteLayer.append(note);
    const rect=note.getBoundingClientRect();
    // Every highlighted country shape is protected, including full bounding boxes.
    const areas=[...svg.querySelectorAll('.region-path')].filter(p=>p.getAttribute('fill')!=='#cec2a4'&&Number(p.getAttribute('fill-opacity'))>0).map(localRect);
    const placed=layoutNotes([{...point,width:rect.width,height:rect.height}],width,height,areas,mapControls());
    if(!placed){noteLayer.replaceChildren();noteRail.hidden=false;const h=document.createElement('div');h.className='world-note-rail-label';h.textContent='本题地图说明';noteRail.append(h,note);return;}
    const b=placed[0];note.style.left=b.x+'px';note.style.top=b.y+'px';
    setMapOverlayVisible(true);
    const endX=Math.max(b.x,Math.min(point.x,b.x+b.width)),endY=Math.max(b.y,Math.min(point.y,b.y+b.height));
    mapOverlay.append(mapSvg('line',{x1:point.x,y1:point.y,x2:endX,y2:endY,class:'world-geography-tether'}));
  }
  new MutationObserver(queueMapAnnotations).observe(eventPanel,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  new ResizeObserver(queueMapAnnotations).observe(stage);
  window.addEventListener('world-map-transform',queueMapAnnotations);
  window.addEventListener('resize',queueMapAnnotations);
  queueMapAnnotations();
