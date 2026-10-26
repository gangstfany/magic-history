from pathlib import Path
import json
HERE=Path(__file__).resolve().parent

def integrate_causal_workspace(world):
    def once(old,new):
        nonlocal world
        assert world.count(old)==1, old[:110]
        world=world.replace(old,new,1)
    def function(name,new):
        nonlocal world
        start=world.index('  function '+name+'(')
        end=world.index('\n  function ',start+5)
        world=world[:start]+new+'\n'+world[end:]
    payload=json.dumps(json.loads((HERE/'causal-trade-links.json').read_text()),ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    once('  const TRADE_PROFILES = ', '  const CAUSAL_TRADE_LINKS = '+payload+';\n  const TRADE_PROFILES = ')
    once("  let activeChainPanel = 'unit';", "  let activeChainPanel = 'unit';\n  let causalWorkspacePanel = 'chain', chainRouteContext = null, causalMapRestore = null, causalScrollRestore = null, causalSelectionRevision = 0;")
    once('  function chainPanelToggleHTML() {', '  function chainPanelToggleHTML(includeWorkspace = true) {')
    once('    return `<div class="chain-panel-toggle"', '    return (includeWorkspace ? causalWorkspaceNavHTML() : "") + `<div class="chain-panel-toggle"')
    once('    const previousChainStep = routeMode.i;', '    const previousChainStep = routeMode.i;\n    causalScrollRestore = null;')
    once('scheduleCausalJourney(route, previousChainStep, routeMode.i);','selectCausalMapStep(route, routeMode.i);')
    function('toggleAutoPlay', '''  function toggleAutoPlay() {
    if (!routeMode || routeMode.route.kind === 'chain') return;
    toggleTradePlayback();
  }
''')
    once("    const isChain = route.kind === 'chain';", "    const isChain = route.kind === 'chain';\n    if (isChain) return staticChainItineraryHTML(route, i);")
    once('    clearLocationStudyState();\n    const restoreTradeContext = route.kind', '''    clearLocationStudyState();
    causalWorkspacePanel = route.kind === 'chain' ? 'chain' : 'routes';
    if (route.kind !== 'chain') { activeLearningView = 'chain'; activeChainPanel = 'unit'; eventZone.setAttribute('aria-label', '因果链 · 商路与交流'); }
    else chainRouteContext = null;
    const restoreTradeContext = route.kind''')
    once("    if (route.kind !== 'chain' && typeof suspendFilters === 'function') suspendFilters();", '    // Trade exploration keeps the enclosing Unit context.')
    once("    if (route.kind !== 'chain' && typeof restoreFilters === 'function') restoreFilters();", '    // No filter suspension was introduced by embedded trade exploration.')
    once('    fitToPins(stopGroups);', "    if (route.kind !== 'chain') fitToPins(stopGroups);")
    once("  function showMapMode(mode) {", "  function showMapMode(mode) {\n    if (mode === 'routes') { openTradeLibrary(); return; }")
    function('returnToRoutePicker', "  function returnToRoutePicker() { openTradeLibrary(); }\n")
    once("  function showCurrentUnitChain() {", "  function showCurrentUnitChain() {\n    causalWorkspacePanel = 'chain'; chainRouteContext = null;")
    once("  function renderCourseMainline() {", "  function renderCourseMainline() {\n    causalWorkspacePanel = 'chain'; chainRouteContext = null;")
    once("  function openChainBoundary(chainId, boundary) {", "  function openChainBoundary(chainId, boundary) {\n    causalWorkspacePanel = 'chain'; chainRouteContext = null;")
    once("  function showPracticeView() {", "  function showPracticeView() {\n    chainRouteContext = null; causalWorkspacePanel = 'chain';")
    once("  function showLearningView(view) {", "  function showLearningView(view) {\n    if (view !== 'chain') { chainRouteContext = null; causalWorkspacePanel = 'chain'; }")
    once("  eventPanel.addEventListener('click', e => {\n    const studyOpen", "  eventPanel.addEventListener('click', e => {\n    if (handleCausalWorkspaceClick(e)) return;\n    const studyOpen")
    world=world.replace("activeLearningView === 'map' && activeMapMode === 'routes' && routeMode?.route?.kind !== 'chain'", "isTradeWorkspace() && routeMode?.route?.kind !== 'chain'")
    once("activeLearningView === 'map' && activeMapMode === 'routes' && routeMode.route.kind !== 'chain'", "isTradeWorkspace() && routeMode.route.kind !== 'chain'")
    once('      const offset = nowStop.getBoundingClientRect().top - eventZone.getBoundingClientRect().top;\n      eventZone.scrollTop = Math.max(0, eventZone.scrollTop + offset - 140);', '      const offset = nowStop.getBoundingClientRect().top - eventZone.getBoundingClientRect().top;\n      const reserved = (eventPanel.querySelector(".causal-workspace-tabs")?.getBoundingClientRect().height || 50) + 14;\n      eventZone.scrollTop = Math.max(0, eventZone.scrollTop + offset - reserved);')
    once("const title = { chain: '因果链', route: '商路', quiz: '随堂练习' }[kind];", "const title = { chain: '因果链', route: '商路与交流', quiz: '随堂练习' }[kind];")
    once('? `<button type="button" class="rt-btn ghost" data-route-picker-action="events">返回</button>`', '? `<button type="button" class="rt-btn ghost" data-causal-return>返回因果推演</button>`')
    once('eventPanel.innerHTML = `<div class="quiz-panel"><div class="qz-head"><div class="qz-title">${title}</div></div>`', 'eventPanel.innerHTML = `<div class="quiz-panel">${kind === "route" ? causalWorkspaceNavHTML() + causalTradeContextHTML() : ""}<div class="qz-head"><div class="qz-title">${title}</div></div>`')
    once('      chainPanel: activeChainPanel,', '''      chainPanel: activeChainPanel,
        workspacePanel: causalWorkspacePanel,
        tradeId: routeMode && routeMode.route.kind !== 'chain' ? routeMode.route.id : null,
        tradeStep: routeMode && routeMode.route.kind !== 'chain' ? routeMode.i : null,''')
    once("chainId: routeMode?.route?.kind === 'chain' ? routeMode.route.id : null,", "chainId: routeMode?.route?.kind === 'chain' ? routeMode.route.id : chainRouteContext?.chainId || null,")
    once("chainStep: routeMode?.route?.kind === 'chain' ? routeMode.i : null,", "chainStep: routeMode?.route?.kind === 'chain' ? routeMode.i : chainRouteContext?.step ?? null,")
    once('      setChainPanelView,', '''      setChainPanelView,
      setCausalWorkspace,
      openRelatedTrade,
      returnToCausal,
      takeCausalScrollRestore: () => { const value = causalScrollRestore; causalScrollRestore = null; return value; },''')
    return world

def integrate_causal_host(result):
    def once(old,new):
        nonlocal result
        assert result.count(old)==1,old[:100]
        result=result.replace(old,new,1)
    once("      const chainPanelView = e.target.closest('[data-chain-panel-view]');", '''      const workspace = e.target.closest('[data-causal-workspace]');
      if (workspace) { win.__mapFilter.setCausalWorkspace(workspace.dataset.causalWorkspace, {scrollTop: homeEvents.scrollTop}); syncHomeEvents(); return; }
      const relatedRoute = e.target.closest('[data-related-route]');
      if (relatedRoute) { win.__mapFilter.openRelatedTrade(relatedRoute.dataset.relatedRoute, {scrollTop: homeEvents.scrollTop}); syncHomeEvents(); return; }
      if (e.target.closest('[data-causal-return]')) { win.__mapFilter.returnToCausal(); syncHomeEvents(); return; }
      const chainPanelView = e.target.closest('[data-chain-panel-view]');''')
    start=result.index('  function syncHomeEvents() {')
    end=result.index('  // 右侧面板是',start)
    chunk=result[start:end]
    def local(old,new):
        nonlocal chunk
        assert chunk.count(old)==1,old[:100]
        chunk=chunk.replace(old,new,1)
    local("    const state = api?.getLearningState?.();", '''    const state = api?.getLearningState?.();
    const causalKey = state?.view === 'chain' ? JSON.stringify([state.workspacePanel, state.chainId, state.chainStep, state.tradeId, state.tradeStep, state.chainPanel]) : '';
    const keepCausalScroll = !!causalKey && homeEvents.dataset.causalRenderKey === causalKey;
    const savedCausalScroll = homeEvents.scrollTop;
    const causalScroll = state?.view === 'chain' ? api.takeCausalScrollRestore?.() ?? null : null;
    homeEvents.dataset.causalRenderKey = causalKey;''')
    local('homeEvents.scrollTop = studyRestore ? studyRestore.scrollTop : 0;', 'homeEvents.scrollTop = causalScroll !== null ? causalScroll : keepCausalScroll ? savedCausalScroll : studyRestore ? studyRestore.scrollTop : 0;')
    local('const nowStop = !studyRestore && homeEvents.querySelector', 'const nowStop = !studyRestore && causalScroll === null && !keepCausalScroll && homeEvents.querySelector')
    local('homeEvents.scrollTop = Math.max(0, offset - 140);', 'homeEvents.scrollTop = Math.max(0, offset - (homeEvents.querySelector(".causal-workspace-tabs")?.getBoundingClientRect().height || 50) - 14);')
    result=result[:start]+chunk+result[end:]
    return result
