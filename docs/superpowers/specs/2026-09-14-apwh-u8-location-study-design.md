# APWH Unit 8 Location Study Design

## Goal

Add a complete AP World History: Modern Unit 8 location-study layer to the existing map. The module must help students understand the Cold War and decolonization as interacting processes: wartime occupation produced a bipolar security order; nuclear danger displaced conflict into divided and newly independent states; anticolonial movements used negotiation, armed struggle, and nonalignment; communist revolutions produced different domestic programs; external intervention changed the legitimacy of postcolonial governments; and reform inside the Soviet bloc helped end the Cold War.

The approved model continues the Unit 1–7 pattern: **ten core locations, three study points per location, vertical causation, and horizontal comparison**.

- ten core locations each present three study points in causal order;
- causal links connect developments within and across locations;
- related links support comparison without claiming that different cases were identical or that chronology alone proves causation;
- the remaining nineteen Unit 8 Timeline locations remain available as evidence but do not receive full three-card study views.

## Approved Decisions

- Use exactly ten core locations and exactly three study points per location, for thirty records.
- Select locations by Topic 8.1–8.9 coverage, causal importance, comparison value, and geographic balance rather than raw event count.
- Use the course-coverage-first location set: Berlin, Moscow, Beijing, Saigon, Delhi, Algiers, Accra, Havana, Tehran, and Johannesburg.
- Use student-facing labels that pair the country or region with the city, so a learner is never expected to infer the historical setting from a city name alone.
- Reuse all forty-three existing Unit 8 Timeline assignments, all twenty-nine existing Unit 8 map pins, the complete Unit 8 causal-chain dataset, the shared renderer, and the homepage iframe bridge.
- Keep the Timeline Dock concise: year plus short event name. Full explanations remain in the right-side detail panel.
- Keep Jerusalem, Seoul, Bandung, Suez, and every other non-core Unit 8 pin fully usable as an ordinary map and Timeline event.
- Add one Unit 8 Context Card and one Unit 8 Synthesis Card.
- Do not add a new page mode, new panel, new physical pin, or duplicate Timeline dataset.

## Course Coverage

The thirty records and two unit cards collectively cover the College Board AP World History: Modern Course and Exam Description effective Fall 2026:

- 8.1 Setting the Stage for the Cold War and Decolonization;
- 8.2 The Cold War;
- 8.3 Effects of the Cold War;
- 8.4 Spread of Communism After 1900;
- 8.5 Decolonization After 1900;
- 8.6 Newly Independent States;
- 8.7 Global Resistance to Established Power Structures After 1900;
- 8.8 End of the Cold War;
- 8.9 Causation in the Age of the Cold War and Decolonization.

Unit 8 is treated as one connected problem rather than separate lists of Cold War crises and independence dates. World War II weakened European empires and left United States and Soviet forces occupying strategic regions. Nuclear weapons limited direct superpower war, so competition moved into alliances, revolutions, divided states, and newly independent countries. Decolonization gave new governments formal sovereignty while leaving them to choose development strategies, manage inherited borders, and respond to outside intervention. Communist systems produced distinct national programs rather than one uniform outcome. The Soviet system ended when economic strain, military commitments, reform, and withdrawal of coercive support combined; no single factor is presented as sufficient by itself.

## Scope

- Add `data/apwh-u8-location-study.js` as the single immutable Unit 8 study-data module.
- Add thirty complete English learner records.
- Add validated reciprocal causal and related connections.
- Add `docs/data-sources/apwh-u8-location-study-source-ledger.md` with one row per stable ID.
- Register Unit 8 in the existing per-Unit module registries in `world-map.html` and `index.html`.
- Reuse `connectionTimelineMode: 'main-event'` and the tested filter, Timeline, Back, focus, and homepage synchronization behavior.
- Add focused Node validation and standalone/homepage browser contracts.

## Non-goals

- Do not rewrite the existing Unit 8 causal chains or reorder their stops.
- Do not change Unit 8 Timeline membership, event copy, map-pin coordinates, or physical markers.
- Do not make all twenty-nine Timeline locations full study views.
- Do not add cross-module study links to Units 1–7 or Unit 9.
- Do not present Delhi as the sole site of Partition, Johannesburg as the sole site of apartheid resistance, or any representative city as the only location where a national or regional process occurred.
- Do not duplicate long explanations inside Timeline cards.
- Do not describe nonalignment as neutrality, decolonization as a single peaceful or violent path, or communist governments as interchangeable.

## Canonical Location Manifest

| Pin | Learner label | Main-event binding | Learning role |
| --- | --- | --- | --- |
| `29` | `Cold War Division · Germany / Berlin` | `world-event-29-8` | occupation zones, ideological division, the Berlin Blockade and Airlift, the Berlin Wall, and reunification |
| `40` | `Soviet Power & Collapse · Soviet Union / Moscow` | `world-event-40-3` | the security buffer, Soviet-bloc commitments, détente, Afghanistan, reform, and dissolution |
| `5` | `Communist Revolution & Transformation · China / Beijing` | `world-event-5-5` | communist victory, land and state legitimacy, the Great Leap Forward, and the Cultural Revolution |
| `16` | `Decolonization & Proxy War · Vietnam / Saigon` | `world-event-16-0` | anti-French war, partition, containment, United States escalation, withdrawal, and reunification |
| `6` | `Independence, Nonalignment & Development · India / Delhi` | `world-event-6-3` | independence and Partition, nonalignment, Five-Year Plans, and mixed-economy state building |
| `79` | `Settler Colonialism & Armed Decolonization · Algeria / Algiers` | `world-event-79-1` | settler colonial structures, FLN war, French counterinsurgency, negotiated independence, and war legacies |
| `81` | `Negotiated Independence & Pan-Africanism · Ghana / Accra` | `world-event-81-0` | mass nationalism, negotiated independence, Pan-Africanism, nonalignment, and postcolonial state building |
| `55` | `Revolution & Nuclear Brinkmanship · Cuba / Havana` | `world-event-55-2` | the Cuban Revolution, Bay of Pigs, Soviet alignment, and the Cuban Missile Crisis |
| `21` | `Oil, Intervention & Revolution · Iran / Tehran` | `world-event-21-1` | oil nationalism, the 1953 coup, shah-led reform and repression, and the 1979 revolution |
| `82` | `Apartheid & Democratic Transition · South Africa / Johannesburg` | `world-event-82-0` | apartheid law, organized resistance, state repression, international pressure, negotiation, and democratic transition |

Main-event bindings are stable entry points. A study point may cover a national or regional process broader than its bound Timeline event, but every record must name the representative geography and avoid implying that all developments occurred at the anchor city. Delhi is the national-state anchor for a study that must identify Punjab and Bengal as principal Partition regions. Johannesburg represents a nationwide apartheid system and resistance movement. Saigon is the map's existing label; learner copy may also identify the city as Ho Chi Minh City when discussing the post-1975 period.

## Canonical Study-Point Manifest

| Location | Stable ID | Study point | Date | Primary topics | Lens |
| --- | --- | --- | --- | --- | --- |
| Germany / Berlin | `apwh-u8-berlin-occupation-ideological-division` | `Occupation Zones and Ideological Division` | `1945–1948` | 8.1, 8.2 | condition |
| Germany / Berlin | `apwh-u8-berlin-blockade-airlift-two-germanies` | `Blockade, Airlift, and Two Germanies` | `1948–1949` | 8.2, 8.3 | mechanism |
| Germany / Berlin | `apwh-u8-berlin-wall-nonintervention-reunification` | `Berlin Wall, Soviet Nonintervention, and Reunification` | `1961–1990` | 8.2, 8.8, 8.9 | consequence |
| Soviet Union / Moscow | `apwh-u8-moscow-security-buffer-soviet-bloc` | `Security Buffer and the Soviet Bloc` | `1945–1955` | 8.1, 8.2 | condition |
| Soviet Union / Moscow | `apwh-u8-moscow-detente-arms-afghanistan-strain` | `Détente, Arms, Afghanistan, and Structural Strain` | `1972–1985` | 8.2, 8.3, 8.8 | mechanism |
| Soviet Union / Moscow | `apwh-u8-moscow-gorbachev-reform-soviet-dissolution` | `Gorbachev's Reforms and Soviet Dissolution` | `1985–1991` | 8.8, 8.9 | consequence |
| China / Beijing | `apwh-u8-beijing-civil-war-land-communist-victory` | `Civil War, Land, and Communist Victory` | `1945–1949` | 8.4 | condition |
| China / Beijing | `apwh-u8-beijing-great-leap-state-mobilization-famine` | `Great Leap Forward, State Mobilization, and Famine` | `1958–1962` | 8.4 | mechanism |
| China / Beijing | `apwh-u8-beijing-cultural-revolution-social-upheaval` | `Cultural Revolution and Social Upheaval` | `1966–1976` | 8.4, 8.7, 8.9 | consequence |
| Vietnam / Saigon | `apwh-u8-saigon-french-return-anticolonial-war` | `French Return and Anticolonial War` | `1946–1954` | 8.5 | condition |
| Vietnam / Saigon | `apwh-u8-saigon-partition-containment-escalation` | `Partition, Containment, and Escalation` | `1954–1968` | 8.2, 8.3 | mechanism |
| Vietnam / Saigon | `apwh-u8-saigon-withdrawal-reunification-war-costs` | `Withdrawal, Reunification, and War Costs` | `1968–1975` | 8.3, 8.9 | consequence |
| India / Delhi | `apwh-u8-delhi-independence-partition-displacement` | `Independence, Partition, and Displacement` | `1947` | 8.5, 8.6 | condition |
| India / Delhi | `apwh-u8-delhi-nonalignment-foreign-policy-autonomy` | `Nonalignment and Foreign-Policy Autonomy` | `1955–1961` | 8.2, 8.6 | mechanism |
| India / Delhi | `apwh-u8-delhi-five-year-plans-mixed-economy` | `Five-Year Plans and a Mixed Economy` | `1951–1991` | 8.6, 8.9 | consequence |
| Algeria / Algiers | `apwh-u8-algiers-settler-colonialism-blocked-reform` | `Settler Colonialism and Blocked Reform` | `1945–1954` | 8.5 | condition |
| Algeria / Algiers | `apwh-u8-algiers-fln-war-counterinsurgency` | `FLN War and French Counterinsurgency` | `1954–1962` | 8.5, 8.7 | mechanism |
| Algeria / Algiers | `apwh-u8-algiers-independence-exodus-new-state` | `Independence, Exodus, and the New State` | `1962 onward` | 8.6, 8.9 | consequence |
| Ghana / Accra | `apwh-u8-accra-mass-nationalism-colonial-pressure` | `Mass Nationalism and Colonial Pressure` | `1947–1951` | 8.5 | condition |
| Ghana / Accra | `apwh-u8-accra-negotiated-independence` | `Negotiated Independence` | `1951–1957` | 8.5 | mechanism |
| Ghana / Accra | `apwh-u8-accra-panafricanism-nonaligned-state-building` | `Pan-Africanism, Nonalignment, and State Building` | `1957–1966` | 8.6, 8.9 | consequence |
| Cuba / Havana | `apwh-u8-havana-batista-inequality-revolution` | `Batista, Inequality, and Revolution` | `1952–1959` | 8.4, 8.7 | condition |
| Cuba / Havana | `apwh-u8-havana-bay-of-pigs-soviet-alignment` | `Bay of Pigs and Soviet Alignment` | `1959–1961` | 8.2, 8.3, 8.4 | mechanism |
| Cuba / Havana | `apwh-u8-havana-missile-crisis-nuclear-limits` | `Missile Crisis and the Limits of Nuclear Competition` | `1962` | 8.2, 8.3, 8.9 | consequence |
| Iran / Tehran | `apwh-u8-tehran-oil-nationalism-mosaddegh` | `Oil Nationalism and Mosaddegh` | `1941–1953` | 8.6, 8.7 | condition |
| Iran / Tehran | `apwh-u8-tehran-coup-shah-authoritarian-alignment` | `The 1953 Coup and the Shah's Alignment` | `1953–1963` | 8.2, 8.6 | mechanism |
| Iran / Tehran | `apwh-u8-tehran-white-revolution-islamic-revolution` | `White Revolution and the 1979 Islamic Revolution` | `1963–1979` | 8.6, 8.7, 8.9 | consequence |
| South Africa / Johannesburg | `apwh-u8-johannesburg-apartheid-legal-order` | `Apartheid as a Legal Order` | `1948–1960` | 8.7 | condition |
| South Africa / Johannesburg | `apwh-u8-johannesburg-resistance-repression` | `Organized Resistance and State Repression` | `1950s–1980s` | 8.7 | mechanism |
| South Africa / Johannesburg | `apwh-u8-johannesburg-pressure-negotiation-democratic-transition` | `International Pressure, Negotiation, and Democratic Transition` | `1985–1994` | 8.7, 8.9 | consequence |

Every record must provide one or two approved Exam Skills, valid AP themes, a concise summary, significance, actors, explained terms, at least two evidence statements, an actionable Exam Connection, and a reproducible source locator. Date ranges may overlap when the study point distinguishes a mechanism from its broader conditions or consequences.

## Secondary Timeline Locations

Nineteen locations remain visible in the Unit 8 Timeline and may be cited inside evidence or comparison notes, but they do not publish three-card study views:

- Luanda supplies Angola's decolonization, proxy-war, and resource-conflict evidence.
- Amritsar/Punjab supplies direct Partition geography and displacement evidence used by the Delhi study.
- Jerusalem supplies Israel/Palestine, territorial conflict, and postwar-state evidence.
- Seoul supplies the Korean War and divided-state comparison.
- Warsaw supplies Warsaw Pact and Brezhnev Doctrine evidence.
- Bandung supplies the 1955 Asian-African Conference and nonalignment evidence.
- Kabul supplies the Soviet-Afghan War and Soviet-strain evidence.
- Managua supplies Sandinista, Contra, and external-intervention evidence.
- Brussels supplies Marshall Plan and NATO evidence.
- Guatemala City supplies land reform, United Fruit, and the 1954 coup.
- Port Harcourt supplies Nigerian oil, regional grievance, and resource-conflict evidence.
- Santiago supplies the Chilean coup and Chicago Boys evidence.
- Dakar supplies Négritude and Francophone African nationalism.
- Washington, D.C. supplies civil-rights, Sputnik, arms-race, and propaganda evidence.
- San Francisco supplies the founding of the United Nations.
- Kampala supplies Idi Amin and postcolonial authoritarianism.
- Phnom Penh supplies Khmer Rouge and mass-violence evidence.
- Nairobi supplies Wangari Maathai and the Green Belt Movement.
- Suez supplies Nasser, nationalization, and the Suez Crisis.

Bandung is the required unsupported-location browser contract: its pin and Timeline card must continue to open ordinary event detail, with no `View all 3 study points` entry. Additional events at supported pins remain ordinary Timeline cards alongside the one canonical main-event binding used to enter each location study.

## Causal and Comparison Architecture

### Vertical causal paths

Each location's three records form an ordered causal path. Required cross-location causal connections are:

- Moscow's security-buffer policy shapes the Soviet occupation and ideological division represented at Berlin;
- communist victory in Beijing intensifies containment policy and material support around the conflict represented at Saigon, while not making United States escalation inevitable;
- Gorbachev's reforms and withdrawal of coercive support from Eastern European governments enable the political opening in which the Berlin Wall falls;
- the diplomatic and organizational pressure of newly independent African states, represented at Accra, contributes to the international isolation confronting apartheid South Africa at Johannesburg.

Every causal note must name a mechanism and preserve agency at the receiving location. Chronological succession, geographic proximity, ideological similarity, or superpower involvement is insufficient by itself.

### Horizontal comparisons

Required reciprocal related comparisons are:

- Berlin Blockade and Cuban Missile Crisis at Havana: compare escalation, risk, and restraint under the ceiling imposed by direct superpower and nuclear war;
- communist victory at Beijing and revolution at Havana: compare land, nationalism, political coalitions, relations with the United States, and subsequent Soviet alignment without treating both revolutions as the same process;
- independence at Delhi and Accra: compare negotiated imperial withdrawal, mass nationalism, inherited colonial institutions, and early state-building choices;
- independence at Accra and Algiers: compare negotiated and armed paths to sovereignty and how the mode of exit shaped immediate political costs;
- settler colonialism at Algiers and apartheid at Johannesburg: compare minority rule, land and citizenship restrictions, resistance, and international pressure while distinguishing Algeria's independence struggle from South Africa's transition within an existing state.

Related connections must be reciprocal and share the same comparison note at both endpoints. Secondary locations may appear as cited evidence but must not become unresolved graph endpoints.

## Context and Synthesis Cards

The Unit 8 Context Card is titled `From Allied Victory to a Bipolar and Decolonizing World`. It bridges Unit 7 to Unit 8: World War II weakened European imperial capacity, elevated the United States and Soviet Union, left armies occupying strategic regions, strengthened anticolonial demands, and created the United Nations alongside a Security Council whose veto structure could freeze conflicts important to either superpower.

The Unit 8 Synthesis Card is titled `From Bipolar Competition to a Globalized Order`. It bridges Unit 8 to Unit 9: Soviet collapse ended the second superpower system without ending proxy-war legacies, contested borders, uneven development, or demands for political autonomy. Former socialist states, newly independent states, and market-reforming communist governments entered a more integrated system of trade, finance, production, communication, and migration under unequal conditions.

The cards remain map-independent and do not become Timeline events or causal-chain stops. Topic 8.9 is explicitly assessed through both cards and through records that distinguish long-term conditions, policy choices, enabling mechanisms, and consequences.

## Runtime and Interaction Flow

1. Selecting Unit 8 loads its existing Timeline and map anchors.
2. Selecting one of the ten approved pins or its bound Timeline card renders ordinary event detail.
3. The detail panel exposes `View all 3 study points` only for a supported Unit 8 location.
4. Activating the entry opens the country/region-plus-city study heading and three records.
5. Exactly one record is expanded at a time.
6. Causal or related connections synchronize the study record, map pin, and exact Timeline event through the existing capability-driven navigation.
7. Connection Back and outer Back restore filters, Timeline state, ordinary detail, homepage controls, disclosures, and focus.
8. Switching Units clears Unit 8 study state.
9. The homepage mirror preserves exact content and behavior parity with the standalone map.
10. Timeline cards remain concise; selecting one places the complete explanation in the right-side panel rather than expanding the dock vertically.

## Validation and Failure Handling

The module follows the Unit 5–7 immutable API and fails validation for malformed IDs, wrong location or main-event bindings, invalid taxonomy, incomplete English content, invalid dates, malformed graph relationships, missing source metadata, ledger drift, or any location not publishing exactly three records.

Graph validation remains two-pass: first validate and index every local record; only then resolve causal and related endpoints. A malformed target must produce the module's intended validation error rather than a native property-access exception. Unknown runtime lookups retain the established empty-array or null behavior. Unsupported Unit 8 pins continue to show ordinary event detail without a study entry. A missing module must not break the existing map, Timeline, causal-chain mode, or Units 1–7 study layers.

## Accessibility and Responsive Behavior

- All entries, record toggles, connections, Back controls, and return controls remain semantic buttons with keyboard activation and visible focus.
- Long country/region-plus-city headings may wrap without horizontal page scrolling.
- The shared mobile single-column layout remains unchanged.
- Expanded details preserve `aria-expanded`, current-record semantics, and one-open behavior.
- Timeline cards remain horizontally scrollable and concise.
- Sensitive material involving war, repression, displacement, famine, and political violence uses factual, mechanism-centered language without unnecessary graphic detail.

## Source Ledger

Create `docs/data-sources/apwh-u8-location-study-source-ledger.md` with one exact row for each stable ID. Each row records Topic assignments, main-event binding, an edition-neutral AMSCO Unit 8 topic locator, supported claims, and any geographic or comparison caveat. The ledger and module must contain the same thirty IDs; placeholders and whole-book citations are prohibited.

The official framework authority is the College Board AP World History: Modern Course and Exam Description effective Fall 2026: <https://apcentral.collegeboard.org/media/pdf/ap-world-history-modern-course-and-exam-description-effective-fall-2026.pdf>. Learner explanations use the project's audited AMSCO Unit 8 material and must not silently copy known textbook errors. The ledger must distinguish sourced facts from project-authored causal analysis. Representative anchors, renamed cities, broad national processes, and cross-case comparisons require explicit caveats.

## Testing Strategy

Implementation follows test-driven development.

- Data tests lock the ten-location/thirty-record manifest, full learner content, Topics 8.1–8.9 coverage, stable ordering, immutability, graph integrity, unit cards, and ledger parity.
- Browser tests cover all ten locations in standalone and homepage contexts, exact record order, one-open behavior, inner and outer Back, focus, Unit switching, disclosure restoration, and representative within-location causal, cross-location causal, and related jumps.
- Filter-sensitive connection tests reuse the Unit 5–7 contracts for exact Timeline visibility, region/category/query restoration, outer Back, and a two-level connection stack.
- A standalone and homepage contract confirms that Bandung remains an ordinary Unit 8 event with no study entry.
- Regression runs include all Unit 1–7 location-study tests, the full Node suite, the complete Playwright verifier, and `git diff --check`.

## Acceptance Criteria

- Unit 8 exposes exactly ten study locations and thirty validated records.
- All Topics 8.1–8.9 have explicit coverage.
- All existing Unit 1–7 study modules, all forty-three Unit 8 Timeline events, all twenty-nine Unit 8 locations, map pins, causal chains, and cross-Unit seams remain unchanged.
- Every learner label identifies the country or region as well as the city.
- Delhi, Johannesburg, Saigon, and all other representative anchors include the required geographic caveats.
- Standalone and homepage study views have content and interaction parity.
- Cross-location navigation never leaves the Timeline, map, detail panel, filters, host controls, disclosures, or focus out of sync.
- Unsupported Unit 8 locations remain fully usable as ordinary Timeline/map events.
- Focused tests, full Node tests, browser verification, and diff checks pass.
