# APWH Unit 7 Location Study Design

## Goal

Add a complete AP World History: Modern Unit 7 location-study layer to the existing map. The module must help students connect shifting power, the causes and conduct of both world wars, interwar instability, mass atrocities, and the transition to the postwar order without turning every Unit 7 Timeline location into an equally large lesson.

The approved model continues the Unit 5 and Unit 6 pattern: **vertical causation plus horizontal comparison**.

- ten core locations each present three study points in causal order;
- causal links connect developments within and across locations;
- related links support comparison without claiming direct causation or equivalence;
- the remaining eleven Unit 7 Timeline locations remain available as evidence but do not receive full three-card study views.

## Approved Decisions

- Use exactly ten core locations and exactly three study points per location, for thirty records.
- Select locations by causal importance and geographic balance, not simply by event count or battlefield fame.
- Reuse all twenty-eight existing Unit 7 Timeline assignments, all twenty-one existing map pins, the complete Unit 7 causal-chain dataset, the shared renderer, and the homepage iframe bridge.
- Keep Armenian Genocide, Holocaust, and Nanjing Massacre as three separate location studies. Compare mechanisms where instructionally useful while explicitly rejecting equivalence among distinct cases.
- Keep the Timeline Dock concise: year plus short event name. Full explanations remain in the right-side detail panel.
- Use process-first learner labels in the form `historical process · representative map anchor`, so students understand the historical role before they must recognize a city.
- Add one Unit 7 Context Card and one Unit 7 Synthesis Card.
- Do not add a new page mode, new panel, new physical pin, or duplicate Timeline dataset.

## Course Coverage

The thirty records and two unit cards collectively cover the College Board AP World History: Modern framework effective Fall 2026:

- 7.1 Shifting Power After 1900;
- 7.2 Causes of World War I;
- 7.3 Conducting World War I;
- 7.4 Economy in the Interwar Period;
- 7.5 Unresolved Tensions After World War I;
- 7.6 Causes of World War II;
- 7.7 Conducting World War II;
- 7.8 Mass Atrocities After 1900;
- 7.9 Causation in Global Conflict.

Unit 7 is treated as a connected sequence rather than two isolated wars. Industrial and imperial competition created fragile security relationships; alliances and mobilization transformed a regional crisis into world war; industrialized total war weakened states and empires; the peace settlement left political and territorial contradictions; economic collapse and failures of collective security enabled aggressive regimes; renewed total war mobilized colonies and civilians while creating the conditions and machinery for mass atrocities; and wartime sacrifice redistributed postwar power.

## Scope

- Add `data/apwh-u7-location-study.js` as the single immutable Unit 7 study-data module.
- Add thirty complete English learner records.
- Add validated reciprocal causal and related connections.
- Add `docs/data-sources/apwh-u7-location-study-source-ledger.md` with one row per stable ID.
- Register Unit 7 in the existing per-Unit module registries in `world-map.html` and `index.html`.
- Reuse `connectionTimelineMode: 'main-event'` and the tested filter, Timeline, Back, focus, and homepage synchronization behavior.
- Add focused Node validation and standalone/homepage browser contracts.

## Non-goals

- Do not rewrite the existing Unit 7 causal chains or reorder their stops.
- Do not change Unit 7 Timeline membership, event copy, map-pin coordinates, or physical markers.
- Do not make all twenty-one Timeline locations full study views.
- Do not add cross-module study links to Units 1–6 or Unit 8.
- Do not present a representative city as the only location where a regional process occurred.
- Do not duplicate long explanations inside Timeline cards.
- Do not turn atrocity comparison into a claim that the Armenian Genocide, Holocaust, and Nanjing Massacre had identical causes, targets, scale, chronology, or implementation.

## Canonical Location Manifest

| Pin | Learner label | Main-event binding | Learning role |
| --- | --- | --- | --- |
| `108` | `Imperial Rivalry in East Asia · Mukden / Shenyang` | `world-event-108-0` | Russo-Japanese War, shifting power, Japanese expansion, the Manchurian Incident, and collective-security failure |
| `30` | `World War I Origins · Sarajevo` | `world-event-30-0` | Balkan nationalism, imperial rivalry, assassination, the July Crisis, alliances, and mobilization |
| `46` | `Industrialized Total War · Verdun` | `world-event-46-0` | Mass-produced weapons, trench warfare, attrition, and whole-society mobilization |
| `25` | `Russian Revolution · St. Petersburg / Petrograd` | `world-event-25-1` | Wartime shortages, tsarist collapse, the 1917 revolutions, and Bolshevik rule |
| `24` | `Postwar Settlement · Paris` | `world-event-24-7` | Self-determination promises, Versailles, mandates, and unresolved postwar contradictions |
| `18` | `Ottoman Nationalism & Genocide · Istanbul` | `world-event-18-2` | Young Turk rule, Turkification, wartime deportation, and the Armenian Genocide |
| `29` | `Nazi Rule & Holocaust · Berlin` | `world-event-29-5` | Depression-era crisis, Nazi legal takeover, citizenship stripping, and bureaucratic genocide |
| `10` | `War in China & Mass Violence · Nanjing` | `world-event-10-2` | Republican revolution, state fragmentation, Japanese invasion, and the Nanjing Massacre |
| `84` | `Colonial Resources & North African War · Cairo / El Alamein` | `world-event-84-1` | Cotton, Suez, colonial mobilization, and defense of global routes in North Africa |
| `106` | `Pacific War · Pearl Harbor` | `world-event-106-0` | Resource dependence, sanctions, attack, island warfare, atomic bombs, and Japanese surrender |

Main-event bindings are stable entry points. A study point may cover a broader regional process than its bound Timeline event, but every record must name the representative geography and avoid presenting the anchor city as the sole site of that process. `St. Petersburg / Petrograd` pairs the current map label with the city's wartime name. `Cairo / El Alamein` is explicitly a representative Egyptian anchor: the battle occurred at El Alamein, west of Alexandria, not in Cairo. `Mukden / Shenyang` pairs the historical English name used in the event with the modern city name.

## Canonical Study-Point Manifest

| Location | Stable ID | Study point | Date | Primary topics | Lens |
| --- | --- | --- | --- | --- | --- |
| Mukden / Shenyang | `apwh-u7-mukden-russo-japanese-war-shifting-power` | `Russo-Japanese War and Shifting Power` | `1904–1905` | 7.1, 7.9 | condition |
| Mukden / Shenyang | `apwh-u7-mukden-incident-resource-expansion` | `Manchurian Incident and Resource Expansion` | `1931` | 7.6 | mechanism |
| Mukden / Shenyang | `apwh-u7-mukden-league-failure-further-expansion` | `Collective-Security Failure and Further Expansion` | `1931–1937` | 7.5, 7.6, 7.9 | consequence |
| Sarajevo | `apwh-u7-sarajevo-balkan-nationalism-imperial-rivalry` | `Balkan Nationalism and Imperial Rivalry` | `1878–1914` | 7.2 | condition |
| Sarajevo | `apwh-u7-sarajevo-assassination-july-crisis` | `Assassination and the July Crisis` | `1914` | 7.2 | mechanism |
| Sarajevo | `apwh-u7-sarajevo-alliances-mobilization-global-war` | `Alliances, Mobilization, and Global War` | `1914` | 7.2, 7.9 | consequence |
| Verdun | `apwh-u7-verdun-industrial-weapons-mass-production` | `Industrial Weapons and Mass Production` | `1914–1916` | 7.3 | condition |
| Verdun | `apwh-u7-verdun-trench-warfare-attrition` | `Trench Warfare and Attrition` | `1916` | 7.3 | mechanism |
| Verdun | `apwh-u7-verdun-total-war-mobilization` | `Total War and Whole-Society Mobilization` | `1914–1918` | 7.3, 7.9 | consequence |
| St. Petersburg / Petrograd | `apwh-u7-petrograd-wartime-shortages-tsarist-failure` | `Wartime Shortages and Tsarist Failure` | `1914–1917` | 7.1, 7.4 | condition |
| St. Petersburg / Petrograd | `apwh-u7-petrograd-february-october-revolutions` | `February and October Revolutions` | `1917` | 7.1 | mechanism |
| St. Petersburg / Petrograd | `apwh-u7-petrograd-bolshevik-regime-war-exit` | `Bolshevik Rule and Exit from the War` | `1917–1922` | 7.1, 7.4 | consequence |
| Paris | `apwh-u7-paris-self-determination-promises` | `Promises of Self-Determination` | `1918–1919` | 7.5 | condition |
| Paris | `apwh-u7-paris-versailles-punitive-settlement` | `Versailles and the Punitive Settlement` | `1919` | 7.5, 7.9 | mechanism |
| Paris | `apwh-u7-paris-mandates-unresolved-contradictions` | `Mandates and Unresolved Contradictions` | `1919–1939` | 7.5, 7.6 | consequence |
| Istanbul | `apwh-u7-istanbul-young-turks-turkification` | `Young Turks and Turkification` | `1908–1914` | 7.1, 7.8 | condition |
| Istanbul | `apwh-u7-istanbul-wartime-accusations-deportation` | `Wartime Accusations and Deportation` | `1915` | 7.8 | mechanism |
| Istanbul | `apwh-u7-istanbul-armenian-genocide` | `Armenian Genocide` | `1915–1920` | 7.8, 7.9 | consequence |
| Berlin | `apwh-u7-berlin-depression-weimar-crisis` | `Depression and the Weimar Crisis` | `1929–1933` | 7.4, 7.6 | condition |
| Berlin | `apwh-u7-berlin-nazi-takeover-citizenship-stripping` | `Nazi Takeover and Citizenship Stripping` | `1933–1935` | 7.6, 7.8 | mechanism |
| Berlin | `apwh-u7-berlin-holocaust-bureaucratic-genocide` | `Holocaust and Bureaucratic Genocide` | `1941–1945` | 7.8, 7.9 | consequence |
| Nanjing | `apwh-u7-nanjing-revolution-state-fragmentation` | `Revolution and State Fragmentation` | `1912–1927` | 7.1 | condition |
| Nanjing | `apwh-u7-nanjing-full-scale-japanese-invasion` | `Full-Scale Japanese Invasion` | `1937` | 7.6, 7.7 | mechanism |
| Nanjing | `apwh-u7-nanjing-massacre-civilian-violence` | `Nanjing Massacre and Civilian Violence` | `1937–1938` | 7.8 | consequence |
| Cairo / El Alamein | `apwh-u7-cairo-cotton-suez-strategic-resources` | `Cotton, Suez, and Strategic Resources` | `1869–1939` | 7.2, 7.7 | condition |
| Cairo / El Alamein | `apwh-u7-cairo-colonial-mobilization-total-war` | `Colonial Mobilization in Total War` | `1914–1945` | 7.3, 7.7 | mechanism |
| Cairo / El Alamein | `apwh-u7-cairo-el-alamein-global-routes` | `El Alamein and the Defense of Global Routes` | `1942` | 7.7, 7.9 | consequence |
| Pearl Harbor | `apwh-u7-pearl-harbor-resource-dependence-sanctions` | `Resource Dependence and Sanctions` | `1937–1941` | 7.6 | condition |
| Pearl Harbor | `apwh-u7-pearl-harbor-attack-global-war` | `Pearl Harbor and a Truly Global War` | `1941` | 7.6, 7.7 | mechanism |
| Pearl Harbor | `apwh-u7-pearl-harbor-pacific-war-surrender` | `Pacific War, Atomic Bombs, and Surrender` | `1941–1945` | 7.7, 7.9 | consequence |

Every record must provide one or two approved Exam Skills, valid AP themes, a concise summary, significance, actors, explained terms, at least two evidence statements, an actionable Exam Connection, and a reproducible source locator.

## Secondary Timeline Locations

Eleven locations remain visible in the Unit 7 Timeline and may be cited inside evidence or comparison notes, but they do not publish three-card study views:

- Tenochtitlan supplies Mexican Revolution and state-reform evidence.
- Amritsar/Punjab supplies Indian nationalism, the Amritsar Massacre, and nonviolent noncooperation evidence.
- Jerusalem supplies Balfour Declaration and mandate evidence.
- Beijing supplies Japanese occupation and Co-Prosperity Sphere evidence.
- Moscow supplies Five-Year Plans and collectivization.
- Rome supplies fascism and Mussolini's rule.
- Geneva supplies League of Nations design and enforcement failure.
- Madrid supplies Spanish Civil War evidence as a prewar ideological and military rehearsal.
- London supplies the Battle of Britain and civilian total-war evidence.
- Buenos Aires supplies import-substitution industrialization evidence.
- Stalingrad supplies the eastern-front turning point.

Stalingrad is the required unsupported-location browser contract: its pin and Timeline card must continue to open ordinary event detail, with no `View all 3 study points` entry. Additional events at supported pins remain ordinary Timeline cards alongside the one canonical main-event binding used to enter each location study.

## Causal and Comparison Architecture

### Vertical causal paths

Each location's three records form an ordered causal path. Required cross-location causal connections are:

- Sarajevo's alliance obligations and mobilization timetables help transform a regional crisis into the industrialized total war represented at Verdun;
- prolonged total war and shortages represented at Verdun intensify the state failure that culminates in revolution at Petrograd;
- the punitive and unresolved postwar settlement represented at Paris contributes to the political grievances and Weimar crisis exploited in Berlin;
- collective-security failure after the Manchurian Incident at Mukden enables further Japanese expansion culminating in full-scale war represented at Nanjing;
- expansion of the war in China and United States economic sanctions sharpen Japan's resource crisis, contributing to the decision represented at Pearl Harbor.

Every causal note must name a mechanism. Chronological succession, geographic proximity, or shared participation in a war is insufficient by itself.

### Horizontal comparisons

Required reciprocal related comparisons are:

- Armenian Genocide at Istanbul and Holocaust at Berlin: compare exclusionary nationalism, wartime security claims, deportation, state administration, and technology while explicitly distinguishing targets, chronology, institutions, and historical setting;
- Nanjing Massacre and Holocaust at Berlin: compare violence against civilians and wartime impunity while explicitly distinguishing the events' purposes, organization, duration, and mechanisms;
- industrial total war at Verdun and colonial mobilization at Cairo: compare metropolitan weapons production with the movement of colonial labor, soldiers, materials, and transport resources;
- League failure at Mukden and postwar international-order design at Paris: compare the promises of collective security with the enforcement structure that failed to restrain aggression;
- communist revolution at Petrograd and fascist takeover at Berlin: compare crises of liberal or monarchical government and mass political mobilization without treating communist and fascist goals as interchangeable;
- Sarajevo and Pearl Harbor: compare how attacks that began as geographically limited crises became global through pre-existing alliances, empires, resource networks, and state commitments.

Related connections must be reciprocal and share the same comparison note at both endpoints. Secondary locations may appear as cited evidence but must not become unresolved graph endpoints.

## Context and Synthesis Cards

The Unit 7 Context Card is titled `From Imperial Rivalry to Global War`. It bridges Unit 6 to Unit 7: imperial expansion gave industrial states overlapping claims, overseas commitments, strategic routes, and recurring security disputes. Nationalism and military planning turned those rivalries into a system in which a regional crisis could mobilize empires and their colonies.

The Unit 7 Synthesis Card is titled `From Allied Victory to a Bipolar World`. It bridges Unit 7 to Unit 8: the defeat of the Axis powers weakened European empires, elevated the United States and Soviet Union, encouraged anticolonial demands, and created institutions intended to manage a world now divided by ideology and nuclear power.

The cards remain map-independent and do not become Timeline events or causal-chain stops. Topic 7.9 is explicitly assessed through both cards and through records requiring students to weigh long-term conditions, immediate triggers, enabling mechanisms, and consequences.

## Runtime and Interaction Flow

1. Selecting Unit 7 loads its existing Timeline and map anchors.
2. Selecting one of the ten approved pins or its bound Timeline card renders ordinary event detail.
3. The detail panel exposes `View all 3 study points` only for a supported Unit 7 location.
4. Activating the entry opens the process-first study heading and three records.
5. Exactly one record is expanded at a time.
6. Causal or related connections synchronize the study record, map pin, and exact Timeline event through the existing capability-driven navigation.
7. Connection Back and outer Back restore filters, Timeline state, ordinary detail, homepage controls, and focus.
8. Switching Units clears Unit 7 study state.
9. The homepage mirror preserves exact content and behavior parity with the standalone map.

## Validation and Failure Handling

The module follows the Unit 5 and Unit 6 immutable API and fails validation for malformed IDs, wrong location or main-event bindings, invalid taxonomy, incomplete English content, invalid dates, malformed graph relationships, missing source metadata, ledger drift, or any location not publishing exactly three records.

Graph validation remains two-pass: first validate and index every local record; only then resolve causal and related endpoints. A malformed target must produce the module's intended validation error rather than a native property-access exception. Unknown runtime lookups retain the established empty-array or null behavior. Unsupported Unit 7 pins continue to show ordinary event detail without a study entry. A missing module must not break the existing map, Timeline, or causal-chain modes.

## Accessibility and Responsive Behavior

- All entries, record toggles, connections, Back controls, and return controls remain semantic buttons with keyboard activation and visible focus.
- Long process-first headings may wrap without horizontal page scrolling.
- The shared mobile single-column layout remains unchanged.
- Expanded details preserve `aria-expanded`, current-record semantics, and one-open behavior.
- Timeline cards remain horizontally scrollable and concise.
- Sensitive-content records use factual, mechanism-centered language without unnecessary graphic detail.

## Source Ledger

Create `docs/data-sources/apwh-u7-location-study-source-ledger.md` with one exact row for each stable ID. Each row records Topic assignments, main-event binding, an edition-neutral AMSCO Unit 7 topic locator, supported claims, and any geographic or comparison caveat. The ledger and module must contain the same thirty IDs; placeholders and whole-book citations are prohibited.

The official framework authority is the College Board AP World History: Modern Course and Exam Description effective Fall 2026. Learner explanations use the project's audited AMSCO Unit 7 material and must not silently copy known textbook errors. The ledger must distinguish what the source establishes from project-authored causal analysis. Representative anchors, renamed cities, atrocity comparisons, and records combining a battle with wider regional mobilization require explicit caveats.

## Testing Strategy

Implementation follows test-driven development.

- Data tests lock the ten-location/thirty-record manifest, full learner content, Topics 7.1–7.9 coverage, stable ordering, immutability, graph integrity, unit cards, and ledger parity.
- Browser tests cover all ten locations in standalone and homepage contexts, exact record order, one-open behavior, inner and outer Back, focus, Unit switching, and representative within-location causal, cross-location causal, and related jumps.
- Filter-sensitive connection tests reuse the Unit 5 and Unit 6 contracts for exact Timeline visibility, region/category/query restoration, outer Back, and a two-level connection stack.
- A standalone and homepage contract confirms that Stalingrad remains an ordinary Unit 7 event with no study entry.
- Regression runs include all Unit 1–6 location-study tests, the full Node suite, the complete Playwright verifier, and `git diff --check`.

## Acceptance Criteria

- Unit 7 exposes exactly ten study locations and thirty validated records.
- All Topics 7.1–7.9 have explicit coverage.
- All existing Unit 1–6 study modules, all twenty-eight Unit 7 Timeline events, all twenty-one Unit 7 locations, map pins, causal chains, and cross-Unit seams remain unchanged.
- Armenian Genocide, Holocaust, and Nanjing Massacre remain separate studies, and every cross-case comparison states both the useful mechanism comparison and the non-equivalence boundary.
- Standalone and homepage study views have content and interaction parity.
- Cross-location navigation never leaves the Timeline, map, detail panel, filters, host controls, or focus out of sync.
- Unsupported Unit 7 locations remain fully usable as ordinary Timeline/map events.
- Focused tests, full Node tests, browser verification, and diff checks pass.
