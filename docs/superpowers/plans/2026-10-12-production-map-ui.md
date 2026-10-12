# Approved map UI implementation

Goal: Apply approved shared typography, equal map canvas height, and Art content-aware camera to production pages locally. No push or merge.

Architecture: A shared CSS file loaded last by index/world/art defines typography and Art canvas rules. Art native handlers fit filtered works or selected works and keep manual reset authoritative. Homepage measures the Art toolbar/workspace and adapts its iframe independently of World sizing, with same-origin guarded access and a ResizeObserver.

- [x] Add a production browser verifier for shared typography, canvas height at 1440/900/390 widths and short mobile, complete 1:1 overview, auto-focus ranges and selected artwork, empty results, subject switching, overflow and browser errors. Confirm failure before implementation.
- [x] Add assets/map-ui.css and link from all three pages; preserve existing content and SVG geometry.
- [x] Implement native padded camera fitting and call from Unit, culture, period, type, search, artwork, region and comparison actions. Cancel pending search focus on manual reset/zoom/drag; reset must remain scale 1.
- [x] Implement Art host sizing from actual toolbar/workspace heights. Do not override World timeline/Study sizing.
- [x] Run Node tests, new production browser checks and existing World/Home behavior checks. Inspect production screenshots. Record any limitations; no GitHub changes.

Verification: 957 Node tests passed; production browser checks passed at 1440×1000, 900×1000, 390×1000 and 390×500; 16 World/Home behavioral checks passed; focused nine-imported-work traversal and fourteen-work U6 smoke passed. Production screenshots inspected. Full global overview intentionally retains proportional ocean space. Existing copyright placeholders are unchanged. No commit, push, merge, or Desktop synchronization performed.
