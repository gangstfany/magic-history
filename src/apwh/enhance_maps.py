from pathlib import Path
import json
HERE=Path(__file__).resolve().parent

def enhance_maps(world):
    from revise_chain_content import revise_chain_content
    world=revise_chain_content(world)
    def once(old,new):
        nonlocal world
        assert world.count(old)==1,old[:100]
        world=world.replace(old,new,1)
    once('  function applyTransform() {','  function applyTransform() {\n    window.dispatchEvent(new Event("world-map-transform"));')
    profiles=json.dumps(json.loads((HERE/'trade-routes.json').read_text()),ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    once('  // ============ 因果链 ============', '  const TRADE_PROFILES = '+profiles+';\n  ROUTES.forEach(route => { const p=TRADE_PROFILES.find(p=>p.id===route.id); Object.assign(route,{name:p.name,path:p.sites.map(s=>s.label).join(" → "),blurb:p.summary,exam:p.exam,stops:p.sites.map(s=>s.pin)}); });\n\n  // ============ 因果链 ============')
    # Causal steps use ordinals consistently in the map and mirrored itinerary.
    once('<span class="rt-num">${num}</span>', '<span class="rt-num">${route.kind === "chain" ? k + 1 : num}</span>')
    once('    placeVehicleAt(route, num);','    // Route vehicles are drawn in the screen-space learning overlay.')
    once('    if (v) v.classList.add(\'on\');\n    fitToPins(stopGroups);','    if (v && route.kind !== "chain") v.classList.add(\'on\');\n    fitToPins(stopGroups);')
    once('    zoom = 1; panX = 0; panY = 0;\n    applyTransform();','    if (routeMode?.route.kind === "chain") { setCausalOverview(true); return; }\n    if (routeMode && routeMode.route.kind !== "chain") { setTradeView(true); return; }\n    zoom = 1; panX = 0; panY = 0;\n    applyTransform();')
    once('    if (answered) {\n      eventPanel.insertAdjacentHTML', '    if (answered) {\n      spotlightPin(q.num);\n      eventPanel.insertAdjacentHTML')
    once('      route.stopWindows[k].passThrough.forEach(p => visited.add(p));', '      // Do not infer visited countries from straight-line geometry.')
    once('  function startQuiz(mode) {', '  function startQuiz(mode) {\n    stopFitAnimation(); zoom = 1; panX = 0; panY = 0; applyTransform();')
    once("    p.addEventListener('mouseenter', (e) => {", "    p.addEventListener('mouseenter', (e) => {\n      if (activeLearningView === 'practice' || routeMode?.route.kind === 'chain') return;")
    once("    p.addEventListener('mouseleave', () => {", "    p.addEventListener('mouseleave', () => {\n      if (activeLearningView === 'practice' || routeMode?.route.kind === 'chain') return;")
    world=world.replace("if (quizMode) { answerRegion(region); return; }", "if (quizMode) { answerRegion(region); return; }\n      if (activeLearningView === 'practice') return;")
    once('  function goToStop(i) {\n    if (!routeMode) return;', '  function goToStop(i) {\n    if (!routeMode) return;\n    const previousChainStep = routeMode.i;')
    once('    if (routeStepCb) routeStepCb();\n  }\n\n  function renderChainItinerary()', '    if (routeStepCb) routeStepCb();\n    if (route.kind === "chain") scheduleCausalJourney(route, previousChainStep, routeMode.i);\n    else scheduleTradeJourney(route, previousChainStep, routeMode.i);\n  }\n\n  function renderChainItinerary()')
    once('  function toggleAutoPlay() {\n    if (!routeMode) return;', '  function toggleAutoPlay() {\n    if (!routeMode) return;\n    if (routeMode.route.kind === "chain") { toggleCausalPlayback(); return; }\n    toggleTradePlayback(); return;')
    world=world.replace("${playing ? '⏸ 暂停' : '▶ 自动播放'}", "${playing ? '⏸ 暂停' : (isChain ? '▶ 播放因果链' : '▶ 自动播放')}")
    once("      renderEventContent(num, pinBadgeColor(num));\n      eventPanel.insertAdjacentHTML('afterbegin', itineraryHTML());", "      renderTradeItinerary(route);")
    once('    spotlightTrail(route, visited);\n    const num = route.stops[routeMode.i];', '    if (route.kind === \"chain\") spotlightTrail(route, visited);\n    const num = route.stops[routeMode.i];')
    once('  function exitRouteMode(quiet) {\n    if (!routeMode) return;', '  function exitRouteMode(quiet) {\n    if (!routeMode) return;\n    if (routeMode.route.kind !== \"chain\") { resetTradeJourney(); stopFitAnimation(); }')
    once("  function showRoutesFor(num) {", "  function showRoutesFor(num) {\n    if (activeLearningView !== 'map' || activeMapMode !== 'routes') return;")
    # Prevent hover repainting of the selected geographical context in either tour.
    world=world.replace("activeLearningView === 'practice' || routeMode?.route.kind === 'chain'", "activeLearningView === 'practice' || routeMode")
    begin=world.index("    } else if (kind === 'route') {")
    end=world.index("    } else {\n      const st = quizStats();",begin)
    world=world[:begin]+"    } else if (kind === 'route') {\n      body = tradePickerHTML();\n"+world[end:]
    from integrate_causal_workspace import integrate_causal_workspace
    world = integrate_causal_workspace(world)
    code=(HERE/'map-layout.cjs').read_text()+'\n'+(HERE/'causal-card-dock.cjs').read_text()+'\n'+(HERE/'causal-journey.cjs').read_text()+'\n'+(HERE/'map-enhancements.js').read_text()+'\n'+(HERE/'causal-links.cjs').read_text()+'\n'+(HERE/'causal-workspace.js').read_text()+'\n'+(HERE/'causal-map.js').read_text()+'\n'+(HERE/'trade-geometry.cjs').read_text()+'\n'+(HERE/'trade-map.js').read_text()
    marker='\n})();\n</script>\n</body>'
    once(marker,'\n'+code+marker)
    once('</head>','<style>\n'+(HERE/'map-enhancements.css').read_text()+'\n</style></head>')
    return world
