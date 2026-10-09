# APWH Unit 6 Location Study Design

## Goal

Add a complete AP World History: Modern Unit 6 location-study layer to the existing map. The module must help students connect industrial demand, imperial expansion, economic control, indigenous responses, and migration without turning all twenty-eight Unit 6 Timeline locations into equally large lessons.

The approved model continues the Unit 5 pattern: **vertical causation plus horizontal comparison**.

- ten core locations each present three study points in causal order;
- causal links connect developments within and across locations;
- related links support comparison without claiming direct causation;
- the remaining eighteen Unit 6 Timeline locations remain available as evidence but do not receive full three-card study views.

## Approved Decisions

- Use exactly ten core locations and exactly three study points per location, for thirty records.
- Reuse the existing Unit 6 Timeline assignments, map pins, causal chains, shared renderer, and homepage iframe bridge.
- Keep all thirty-seven existing Unit 6 Timeline events and all twenty-eight existing Unit 6 locations. No event or secondary location is deleted.
- Keep the Timeline Dock concise: year plus short event name. Full explanations remain in the right-side detail panel.
- Use process-first learner labels in the form `historical process · representative map anchor`, so students do not need to recognize a city before understanding its historical role.
- Add one Unit 6 Context Card and one Unit 6 Synthesis Card.
- Do not add a new page mode, new panel, new physical pin, or duplicate Timeline dataset.

## Course Coverage

The thirty records and two unit cards collectively cover the College Board AP World History: Modern framework effective Fall 2026:

- 6.1 Rationales for Imperialism from 1750 to 1900;
- 6.2 State Expansion from 1750 to 1900;
- 6.3 Indigenous Responses to State Expansion from 1750 to 1900;
- 6.4 Global Economic Development from 1750 to 1900;
- 6.5 Economic Imperialism from 1750 to 1900;
- 6.6 Causes of Migration in an Interconnected World;
- 6.7 Effects of Migration;
- 6.8 Causation in the Imperial Age.

Unit 6 is treated as one connected system rather than three unrelated lists. Industrial production created recurring demand for raw materials, markets, labor, and strategic routes. States and companies used military, treaty, financial, and settler power to secure those inputs. The resulting structures reshaped local production, provoked different forms of resistance, and moved workers and settlers across oceans.

## Scope

- Add `data/apwh-u6-location-study.js` as the single immutable Unit 6 study-data module.
- Add thirty complete English learner records.
- Add validated reciprocal causal and related connections.
- Add `docs/data-sources/apwh-u6-location-study-source-ledger.md` with one row per stable ID.
- Register Unit 6 in the existing per-Unit module registries in `world-map.html` and `index.html`.
- Reuse `connectionTimelineMode: 'main-event'` and the tested filter, Timeline, Back, focus, and homepage synchronization behavior.
- Add focused Node validation and standalone/homepage browser contracts.

## Non-goals

- Do not rewrite the existing Unit 6 causal chains or reorder their stops.
- Do not change Unit 6 Timeline membership, event copy, map-pin coordinates, or physical markers.
- Do not make all twenty-eight Timeline locations full study views.
- Do not add cross-module study links to Units 1–5 or Unit 7.
- Do not imply that a representative city is the only location where a regional process occurred.
- Do not duplicate long explanations inside Timeline cards.

## Canonical Location Manifest

| Pin | Learner label | Main-event binding | Learning role |
| --- | --- | --- | --- |
| `29` | `Imperial Partition · Berlin` | `world-event-29-1` | Industrial rivalry, imperial rationales, the Berlin Conference, and artificial borders |
| `89` | `British West Africa · Lagos` | `world-event-89-0` | Palm-oil demand, treaty expansion, political control, and export dependence |
| `91` | `Congo Free State · Kinshasa` | `world-event-91-0` | Inland access, Leopold's private colony, forced labor, violence, and international exposure |
| `6` | `British India · Delhi` | `world-event-6-2` | Company expansion, the 1857 rebellion, Crown rule, colonial economic change, and indenture |
| `15` | `Opium Wars · Canton / Guangzhou` | `world-event-15-0` | Trade imbalance, opium, gunboat war, unequal treaties, and economic imperialism |
| `80` | `Ethiopian Resistance · Adwa` | `world-event-80-0` | Italian expansion, organized Ethiopian resistance, retained independence, and comparative outcomes |
| `88` | `Suez Canal · Suez` | `world-event-88-0` | Strategic transport, coerced construction labor, debt, and control of an imperial route |
| `67` | `Indigenous Displacement · Wounded Knee` | `world-event-67-0` | Settler expansion, cultural resistance, state violence, and indigenous dispossession |
| `53` | `Argentina: Export Economy & Migration · Buenos Aires` | `world-event-53-1` | Export-led growth, European migration, urban labor, and unequal landholding |
| `70` | `Chinese Migration & Exclusion · San Francisco` | `world-event-70-0` | Railroad labor demand, transpacific migration, community formation, and exclusion |

Main-event bindings are stable entry points. A study point may cover a broader regional process than its bound Timeline event, but every record must name the representative geography and avoid presenting the anchor city as the sole site of that process. `Canton / Guangzhou` deliberately pairs the name commonly used in nineteenth-century English-language accounts with the modern city name students see on the map.

## Canonical Study-Point Manifest

| Location | Stable ID | Study point | Date | Primary topics | Lens |
| --- | --- | --- | --- | --- | --- |
| Berlin | `apwh-u6-berlin-industrial-rivalry-rationales` | `Industrial Rivalry and Imperial Rationales` | `1800s–1884` | 6.1, 6.8 | condition |
| Berlin | `apwh-u6-berlin-conference-effective-occupation` | `Berlin Conference and Effective Occupation` | `1884–1885` | 6.2 | mechanism |
| Berlin | `apwh-u6-berlin-borders-rivalry-consequences` | `Artificial Borders and Imperial Rivalry` | `1885–1900` | 6.2, 6.8 | consequence |
| Lagos | `apwh-u6-lagos-industrial-palm-oil-demand` | `Industrial Demand for Palm Oil` | `1800s` | 6.1, 6.4 | condition |
| Lagos | `apwh-u6-lagos-treaty-trade-political-control` | `From Trade Treaty to Political Control` | `1870s–1880s` | 6.2, 6.5 | mechanism |
| Lagos | `apwh-u6-lagos-export-economy-dependence` | `Export Economy and Colonial Dependence` | `1800s–1900` | 6.4, 6.5 | consequence |
| Kinshasa | `apwh-u6-congo-quinine-steamship-access` | `Quinine, Steamships, and Inland Access` | `1850–1880` | 6.2 | condition |
| Kinshasa | `apwh-u6-congo-leopold-private-colony` | `Leopold's Private Colony` | `1885–1908` | 6.1, 6.2 | mechanism |
| Kinshasa | `apwh-u6-congo-forced-rubber-demographic-catastrophe` | `Forced Rubber Labor and Demographic Catastrophe` | `1885–1908` | 6.4, 6.5 | consequence |
| Delhi | `apwh-u6-delhi-company-rule-rebellion` | `Company Rule and the 1857 Rebellion` | `1757–1858` | 6.2, 6.3 | condition |
| Delhi | `apwh-u6-delhi-crown-rule-economic-restructuring` | `Crown Rule and Economic Restructuring` | `1858–1900` | 6.4, 6.5 | mechanism |
| Delhi | `apwh-u6-delhi-indenture-labor-migration` | `Indenture and Indian Ocean Labor Migration` | `1830s–1900` | 6.6, 6.7 | consequence |
| Guangzhou | `apwh-u6-guangzhou-trade-imbalance-opium` | `Trade Imbalance and the Opium System` | `1700s–1839` | 6.5 | condition |
| Guangzhou | `apwh-u6-guangzhou-opium-war-unequal-treaty` | `Gunboat War and Unequal Treaties` | `1839–1860` | 6.2, 6.5 | mechanism |
| Guangzhou | `apwh-u6-guangzhou-treaty-ports-spheres` | `Treaty Ports and Spheres of Influence` | `1842–1900` | 6.5, 6.8 | consequence |
| Adwa | `apwh-u6-adwa-italian-expansion-pressure` | `Italian Expansion and Ethiopian Pressure` | `1880s–1895` | 6.1, 6.2 | condition |
| Adwa | `apwh-u6-adwa-ethiopian-military-resistance` | `Organized Ethiopian Military Resistance` | `1895–1896` | 6.3 | mechanism |
| Adwa | `apwh-u6-adwa-independence-comparative-outcome` | `Independence and Comparative Outcomes` | `1896–1900` | 6.3, 6.8 | consequence |
| Suez | `apwh-u6-suez-industrial-trade-route` | `Industrial Trade and the Shorter Route` | `1850s–1869` | 6.1, 6.4 | condition |
| Suez | `apwh-u6-suez-canal-labor-construction` | `Canal Construction and Egyptian Labor` | `1859–1869` | 6.2, 6.4 | mechanism |
| Suez | `apwh-u6-suez-debt-strategic-control` | `Debt and British Strategic Control` | `1870s–1882` | 6.2, 6.5 | consequence |
| Wounded Knee | `apwh-u6-wounded-knee-settler-land-expansion` | `Settler Expansion and Indigenous Land Loss` | `1830s–1890` | 6.2 | condition |
| Wounded Knee | `apwh-u6-wounded-knee-ghost-dance-resistance` | `Ghost Dance as Cultural Resistance` | `1889–1890` | 6.3 | mechanism |
| Wounded Knee | `apwh-u6-wounded-knee-massacre-dispossession` | `Massacre and Consolidated Dispossession` | `1890` | 6.3, 6.8 | consequence |
| Buenos Aires | `apwh-u6-buenos-aires-export-growth-labor-demand` | `Export Growth and Labor Demand` | `1850s–1880s` | 6.4, 6.6 | condition |
| Buenos Aires | `apwh-u6-buenos-aires-european-migration` | `European Migration to Argentina` | `1880s–1909` | 6.6 | mechanism |
| Buenos Aires | `apwh-u6-buenos-aires-urban-growth-land-inequality` | `Urban Growth and Unequal Landholding` | `1880s–1900s` | 6.7 | consequence |
| San Francisco | `apwh-u6-san-francisco-railroad-labor-demand` | `Railroad Labor Demand in the American West` | `1860s–1869` | 6.6 | condition |
| San Francisco | `apwh-u6-san-francisco-chinese-migration-community` | `Chinese Migration and Community Formation` | `1850s–1880s` | 6.6, 6.7 | mechanism |
| San Francisco | `apwh-u6-san-francisco-exclusion-racialization` | `Exclusion and the Racialization of Labor` | `1870s–1882` | 6.7 | consequence |

Every record must provide one or two approved Exam Skills, valid AP themes, a concise summary, significance, actors, explained terms, at least two evidence statements, an actionable Exam Connection, and a reproducible source locator.

## Secondary Timeline Locations

Eighteen locations remain visible in the Unit 6 Timeline and may be cited inside evidence or comparison notes, but they do not publish three-card study views:

- Vienna supplies conservative-restoration and balance-of-power context.
- Washington D.C. supplies Monroe Doctrine and Roosevelt Corollary evidence for United States hemispheric expansion.
- Kabul supplies Great Game evidence for strategic imperial rivalry.
- Algiers supplies settler-colonial evidence for French North Africa.
- Nanjing and Beijing supply Taiping, Sino-Japanese War, and Boxer evidence for Chinese internal and external pressure.
- Havana supplies Spanish-American War evidence for United States overseas expansion.
- Santiago and Manaus supply copper and rubber evidence for export economies and commodity extraction.
- Montevideo supplies latifundium evidence for land concentration.
- Kimberley and Cape Town supply mining, Cecil Rhodes, and railway evidence for southern African extraction.
- Sokoto and Khartoum supply distinct African state-building and resistance evidence.
- Oklahoma supplies forced-removal evidence for United States settler expansion.
- Promontory supplies the transcontinental railway evidence used by San Francisco.
- Bloemfontein supplies Boer Wars and concentration-camp evidence for settler conflict and the transition toward Unit 7.

The second Berlin Conference record, second Suez Canal record, later Congo records, and later Buenos Aires migration record remain ordinary Timeline entries at already-supported pins; the study module binds one canonical main event per location without hiding those additional cards.

## Causal and Comparison Architecture

### Vertical causal paths

Each location's three records form an ordered causal path. Required cross-location causal connections are:

- industrial demand for West African palm oil at Lagos contributes to the imperial competition regulated at Berlin;
- the partition rules represented at Berlin enable the territorial claims and coercive extraction represented in the Congo;
- the shortened Suez route increases the strategic importance of British control over routes to India;
- colonial restructuring in India supports the recruitment and movement of indentured labor across the Indian Ocean and beyond;
- railroad construction and western economic expansion create demand for Chinese migrant labor represented at San Francisco;
- export-led growth in Argentina creates labor demand that attracts European migrants to Buenos Aires.

Every causal note must name a mechanism. Chronological succession or geographic proximity alone is insufficient.

### Horizontal comparisons

Required related comparisons are:

- British direct rule in India versus treaty-port and sphere-of-influence control in China;
- coerced rubber labor in the Congo versus indentured Indian labor, with an explicit warning that the legal statuses and degrees of coercion were not equivalent;
- successful Ethiopian resistance at Adwa versus the violent suppression represented at Wounded Knee;
- European migration encouraged by Argentina versus Chinese migration restricted in the United States;
- treaty-based expansion in West Africa versus Leopold's privately controlled Congo system.

Related connections must be reciprocal and share the same comparison note at both endpoints. Secondary locations may appear as cited evidence but must not become unresolved graph endpoints.

## Context and Synthesis Cards

The Context Card bridges Unit 5 to Unit 6: industrialization concentrated productive and military power while creating recurring demand for raw materials, markets, workers, and dependable transport routes. Those capabilities and pressures made imperial expansion more feasible and more economically valuable.

The Synthesis Card bridges Unit 6 to Unit 7: imperial systems placed industrial states' resources, markets, ports, and security interests outside their borders. Overlapping claims, racial hierarchies, indigenous resistance, and nationalist responses helped turn colonial rivalry into global conflict.

The cards remain map-independent and do not become Timeline events or causal-chain stops. Topic 6.8 is explicitly assessed through the synthesis card and through records requiring students to weigh industrial demand, technology, state power, ideology, and local conditions as interacting causes.

## Runtime and Interaction Flow

1. Selecting Unit 6 loads its existing Timeline and map anchors.
2. Selecting one of the ten approved pins or its bound Timeline card renders ordinary event detail.
3. The detail panel exposes `View all 3 study points` only for a supported Unit 6 location.
4. Activating the entry opens the process-first study heading and three records.
5. Exactly one record is expanded at a time.
6. Causal or related connections synchronize the study record, map pin, and exact Timeline event through the existing capability-driven navigation.
7. Connection Back and outer Back restore filters, Timeline state, ordinary detail, homepage controls, and focus.
8. Switching Units clears Unit 6 study state.
9. The homepage mirror preserves exact content and behavior parity with the standalone map.

## Validation and Failure Handling

The module follows the Unit 5 immutable API and fails validation for malformed IDs, wrong location or main-event bindings, invalid taxonomy, incomplete English content, invalid dates, malformed graph relationships, missing source metadata, ledger drift, or any location not publishing exactly three records.

Unknown runtime lookups retain the established empty-array or null behavior. Unsupported Unit 6 pins continue to show ordinary event detail without a study entry. A missing module must not break the existing map, Timeline, or causal-chain modes.

## Accessibility and Responsive Behavior

- All entries, record toggles, connections, Back controls, and return controls remain semantic buttons with keyboard activation and visible focus.
- Long process-first headings may wrap without horizontal page scrolling.
- The shared mobile single-column layout remains unchanged.
- Expanded details preserve `aria-expanded`, current-record semantics, and one-open behavior.
- Timeline cards remain horizontally scrollable and concise.

## Source Ledger

Create `docs/data-sources/apwh-u6-location-study-source-ledger.md` with one exact row for each stable ID. Each row records Topic assignments, main-event binding, an edition-neutral AMSCO Unit 6 topic locator, supported claims, and any geographic caveat. The ledger and module must contain the same thirty IDs; placeholders and whole-book citations are prohibited.

The official framework authority is the College Board AP World History: Modern Course and Exam Description effective Fall 2026. Learner explanations use the project's audited AMSCO Unit 6 material and must not silently copy known textbook errors. Where the existing map uses a representative anchor rather than a place explicitly named by AMSCO, the ledger must say so.

## Testing Strategy

Implementation follows test-driven development.

- Data tests lock the ten-location/thirty-record manifest, full learner content, Topics 6.1–6.8 coverage, stable ordering, immutability, graph integrity, unit cards, and ledger parity.
- Browser tests cover all ten locations in standalone and homepage contexts, exact record order, one-open behavior, inner and outer Back, focus, Unit switching, and representative within-location causal, cross-location causal, and related jumps.
- Filter-sensitive connection tests reuse the Unit 5 contracts for exact Timeline visibility, region/category/query restoration, outer Back, and a two-level connection stack.
- Regression runs include the full Node suite, the complete Playwright verifier, and `git diff --check`.

## Acceptance Criteria

- Unit 6 exposes exactly ten study locations and thirty validated records.
- All Topics 6.1–6.8 have explicit coverage.
- All existing Unit 1–5 study modules, all thirty-seven Unit 6 Timeline events, all twenty-eight Unit 6 locations, map pins, causal chains, and cross-Unit seams remain unchanged.
- Standalone and homepage study views have content and interaction parity.
- Cross-location navigation never leaves the Timeline, map, detail panel, filters, host controls, or focus out of sync.
- Unsupported Unit 6 locations remain fully usable as ordinary Timeline/map events.
- Focused tests, full Node tests, browser verification, and diff checks pass.
