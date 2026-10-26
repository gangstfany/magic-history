  function isTradeWorkspace(){return activeLearningView==='chain'&&causalWorkspacePanel==='routes';}
  function causalWorkspaceNavHTML(){return`<div class="causal-workspace-tabs" role="group" aria-label="因果链模块"><button type="button" data-causal-workspace="chain" aria-pressed="${causalWorkspacePanel==='chain'}">因果推演</button><button type="button" data-causal-workspace="routes" aria-pressed="${causalWorkspacePanel==='routes'}">商路与交流</button></div>`;}
  function hostChainScroll(){try{return window.frameElement?window.parent.document.getElementById('home-events')?.scrollTop||eventZone.scrollTop:eventZone.scrollTop;}catch{return eventZone.scrollTop;}}
  function captureCausalBookmark(scrollTop){if(routeMode?.route.kind!=='chain')return chainRouteContext;const c=routeMode.route;return makeCausalBookmark({chainId:c.id,step:routeMode.i,unit:getActivePeriod()||c.entryUnit||c.units?.[0]||'u1',camera:{zoom,panX,panY},scrollTop:scrollTop??hostChainScroll(),pageScrollTop:window.frameElement?null:window.scrollY,overview:causalOverview});}
  function causalTradeContextHTML(){if(!chainRouteContext)return'';const c=chainById.get(chainRouteContext.chainId);if(!c)return'';const activeRoute=routeMode?.route.kind!=='chain'?routeMode?.route.id:null,link=activeRoute?linksForStep(CAUSAL_TRADE_LINKS,c.id,chainRouteContext.step).find(l=>l.routeId===activeRoute):null;
    const prefix=link?'来自':activeRoute?'自由浏览 · 返回位置':'已保留';
    return`<div class="causal-trade-context" data-causal-origin-scroll="${chainRouteContext.pageScrollTop??''}"><span>${prefix} Unit ${escapeTimelineText(chainRouteContext.unit.slice(1))} · 第 ${chainRouteContext.step+1} 环</span><strong>${escapeTimelineText(c.labels[chainRouteContext.step])}</strong>${link?`<p>${escapeTimelineText(link.reason)}</p>`:''}<button type="button" data-causal-return>← 返回第 ${chainRouteContext.step+1} 环</button></div>`;
  }
  function causalRelatedRoutesHTML(route,step){const links=linksForStep(CAUSAL_TRADE_LINKS,route.id,step);if(!links.length)return'';return`<div class="causal-related-routes"><div class="causal-related-label">用地图理解这一环</div>${links.map(link=>{const p=TRADE_PROFILES.find(p=>p.id===link.routeId);return`<button type="button" data-related-route="${p.id}"><span>${escapeTimelineText(link.kind)}</span><strong>展开${escapeTimelineText(p.name.split(' · ')[0])} · ${p.sites.length}站 ↗</strong><small>${escapeTimelineText(link.reason)}</small></button>`;}).join('')}</div>`;}
  function openRelatedTrade(routeId,options={}){
    const route=ROUTES.find(r=>r.id===routeId);if(!route)return false;
    const bookmark=captureCausalBookmark(options.scrollTop);if(!bookmark)return false;
    if(!linksForStep(CAUSAL_TRADE_LINKS,bookmark.chainId,bookmark.step).some(l=>l.routeId===routeId))return false;
    chainRouteContext=bookmark;causalWorkspacePanel='routes';activeLearningView='chain';activeChainPanel='unit';
    enterRouteMode(routeId);eventZone.setAttribute('aria-label','因果链 · 商路与交流');syncLearningTabs();syncMapModeTabs();if(routeStepCb)routeStepCb();return true;
  }
  function openTradeLibrary(options={}){
    const bookmark=captureCausalBookmark(options.scrollTop);if(bookmark)chainRouteContext=bookmark;
    if(routeMode)exitRouteMode(true);causalWorkspacePanel='routes';activeLearningView='chain';activeChainPanel='unit';
    mapStudyView.hidden=false;eventZone.setAttribute('aria-label','因果链 · 商路与交流');renderPicker('route');applyCausalCamera({zoom:1,panX:0,panY:0});syncLearningTabs();syncMapModeTabs();queueMapAnnotations();if(routeStepCb)routeStepCb();
  }
  function returnToCausal(){const bookmark=chainRouteContext;causalWorkspacePanel='chain';activeLearningView='chain';activeChainPanel='unit';
    if(!bookmark){showCurrentUnitChain();syncLearningTabs();syncMapModeTabs();return null;}
    if(routeMode)exitRouteMode(true);chainRouteContext=null;
    if(typeof setPeriodFilter==='function')setPeriodFilter(bookmark.unit);
    causalMapRestore=bookmark;enterRouteMode(bookmark.chainId);goToStop(bookmark.step);eventZone.scrollTop=bookmark.scrollTop;causalScrollRestore=bookmark.scrollTop;
    eventZone.setAttribute('aria-label','Unit 因果链');syncLearningTabs();syncMapModeTabs();if(routeStepCb)routeStepCb();if(!window.frameElement&&bookmark.pageScrollTop!==null)requestAnimationFrame(()=>requestAnimationFrame(()=>{if(routeMode?.route.id===bookmark.chainId&&routeMode.i===bookmark.step&&causalWorkspacePanel==='chain')window.scrollTo({top:bookmark.pageScrollTop,behavior:'instant'});}));return bookmark;
  }
  function setCausalWorkspace(panel,options={}){if(panel==='routes')openTradeLibrary(options);else returnToCausal();}
  function handleCausalWorkspaceClick(e){const tab=e.target.closest('[data-causal-workspace]');if(tab){setCausalWorkspace(tab.dataset.causalWorkspace);return true;}const related=e.target.closest('[data-related-route]');if(related){openRelatedTrade(related.dataset.relatedRoute);return true;}if(e.target.closest('[data-causal-return]')){returnToCausal();return true;}return false;}
  function staticChainItineraryHTML(route,i){const esc=escapeTimelineText;
    return`<div class="route-panel causal-static-panel">${causalWorkspaceNavHTML()}<div class="rt-top">${chainPanelToggleHTML(false)}<div class="rt-head"><div class="rt-name">${esc(route.name)}</div><div class="rt-progress">第 ${i+1} / ${route.stops.length} 环</div></div>${chainSwitcherHTML(route)}</div><p class="causal-click-hint">点击任意一环，在地图上查看地点、证据与因果解释。</p><div class="rt-stops rt-stops-chain">${route.stops.map((num,k)=>`<button type="button" class="rt-stop ${k<i?'done':k===i?'now':'todo'}" data-route-step="${k}" ${k===i?'aria-current="step"':''}><span class="rt-num">${k+1}</span><span class="rt-city">${esc(route.labels[k])}<span class="rt-sub">${esc(index[num]?.[0]?.city||'')}</span></span></button>${k===i?causalRelatedRoutesHTML(route,i):''}`).join('')}</div>${chainSeamHTML(route,'from')}${chainSeamHTML(route,'to')}<details class="causal-chain-background"><summary>本链背景与考试提示</summary><p>${esc(route.blurb)}</p><p>${esc(route.exam)}</p></details><div class="rt-ctrl"><button type="button" class="rt-btn" data-route-action="prev" ${i<=0?'disabled':''}>← 上一环</button><button type="button" class="rt-btn primary" data-route-action="next" ${i>=route.stops.length-1?'disabled':''}>下一环 →</button></div></div>`;
  }
