# Study points directory B implementation plan

Goal: integrate the approved location-card prototype into the World History homepage without changing the map data or the Art History UI.

Architecture: a native collapsed details element inside the World History toolbar. Read the existing U1–U9 study APIs from the map iframe; selected Unit displays its locations, All Units displays unit-labelled groups. Use existing map navigation and study APIs, then mirror the result through syncHomeEvents. No new map markers or independent copy of study data.

Tech stack: existing static HTML/CSS/JavaScript; Node tests and Playwright browser verification.

- [ ] Add failing homepage semantics and browser checks for collapsed directory, real counts, all units, direct study navigation, keyboard support, subject switching, responsive overflow and map/chain/practice switching.
- [ ] Add B card CSS and native details markup in index.html. Keep inherited fonts and the existing palette; four desktop columns, two tablet columns, one phone column; bound catalogue height with internal scrolling.
- [ ] Implement renderHostStudyDirectory and openHostStudyLocation within the existing homepage closure. Hook into buildHostToolbar and its existing onCountChange callback. Select the target unit and events view, resolve the actual pin region and use openEventInMap/openLocationStudy; show a status error if unavailable. Preserve query and category filters.
- [ ] Run the new checks, all Node tests, and the existing World History verification. Preserve prototypes and untracked Python caches. Do not push or merge without approval.
