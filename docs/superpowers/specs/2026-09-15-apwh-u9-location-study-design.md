# APWH Unit 9 Location Study Design

## Goal

Add a complete AP World History: Modern Unit 9 location-study layer to the existing map. The module must help students understand globalization as a set of connected mechanisms rather than a list of modern inventions: technology lowers the cost of moving food, goods, capital, information, and culture; states and institutions write rules for those flows; gains depend on access to complementary inputs and bargaining power; excluded groups organize across the same networks; and environmental, health, labor, and sovereignty costs cross borders even when political authority does not.

The approved model continues the Unit 5–8 pattern: **ten core locations, three study points per location, vertical causation, and horizontal comparison**.

- ten core locations each present three study points in causal order;
- causal links connect developments within and across locations;
- related links support comparison without claiming that chronology alone proves causation or that distinct institutions and political systems were interchangeable;
- the remaining twelve Unit 9 Timeline locations remain available as ordinary evidence but do not receive full three-card study views.

## Approved Decisions

- Use exactly ten core locations and exactly three study points per location, for thirty records.
- Prioritize the eight locations in the existing `u9_main` chain, then add Geneva for global health and Seoul for globalized culture.
- Use the core set: Amritsar/Punjab, San Francisco, Guangzhou, Ciudad Juárez, Beijing, Washington, D.C., Seattle, Paris, Geneva, and Seoul.
- Use student-facing labels that pair the country or region with the city, so learners do not need to infer the setting from a city name alone.
- The user permits new events or pins if a verified course gap requires them, but the approved ten-location set already exists in the map. This design therefore adds no physical pin or Timeline event.
- Reuse all twenty-five existing Unit 9 Timeline assignments, all twenty-two existing Unit 9 map locations, the complete Unit 9 causal-chain dataset, the shared renderer, and the homepage iframe bridge.
- Keep the Timeline Dock concise: year plus short event name. Full explanations remain in the right-side detail panel.
- Keep Maastricht, Kigali, Cairo, Kyoto, Salvador, Cape Town, Khartoum, Sarajevo, Kinshasa, Manaus, Dhaka, London, and every other non-core Unit 9 event fully usable as ordinary map and Timeline evidence.
- Add one Unit 9 Context Card and one Unit 9 Synthesis Card.
- Do not add a new page mode, panel, or U9-specific renderer branch.

## Course Coverage

The thirty records and two unit cards collectively cover the College Board AP World History: Modern Course and Exam Description effective Fall 2026:

- 9.1 Advances in Technology and Exchange After 1900;
- 9.2 Technological Advances and Limitations After 1900: Disease;
- 9.3 Technological Advances: Debates About the Environment After 1900;
- 9.4 Economics in the Global Age;
- 9.5 Calls for Reform and Responses After 1900;
- 9.6 Globalized Culture After 1900;
- 9.7 Resistance to Globalization After 1900;
- 9.8 Institutions Developing in a Globalized World;
- 9.9 Continuity and Change in a Globalized World.

Unit 9 is treated as a connected historical problem. Scientific research and complementary agricultural inputs raised food output but distributed gains unevenly. Computing, telecommunications, standardized transport, and digital platforms reduced distance and information costs. Market reforms and trade agreements let production move toward lower wages, taxes, and regulation. Institutions such as the World Bank, IMF, WTO, WHO, and United Nations coordinated action while reflecting unequal voting power, enforcement capacity, and national interests. Workers, reformers, cultural producers, and anti-globalization movements used the same networks that states and firms used. Human rights, epidemic disease, and climate change exposed the difficulty of governing problems that cross borders without a world government.

## Scope

- Add `data/apwh-u9-location-study.js` as the single immutable Unit 9 study-data module.
- Add thirty complete English learner records.
- Add validated reciprocal causal and related connections.
- Add `docs/data-sources/apwh-u9-location-study-source-ledger.md` with one row per stable ID.
- Register Unit 9 in the existing per-Unit module registries in `world-map.html` and `index.html`.
- Reuse `connectionTimelineMode: 'main-event'` and the tested filter, Timeline, Back, focus, disclosure, and homepage synchronization behavior.
- Add focused Node validation and standalone/homepage browser contracts.

## Non-goals

- Do not rewrite the existing Unit 9 main or supplemental causal chains or reorder their stops.
- Do not change Unit 9 Timeline membership, event copy, map-pin coordinates, or physical markers.
- Do not make all twenty-two Timeline locations full study views.
- Do not add cross-module study links to Units 1–8.
- Do not duplicate long explanations inside Timeline cards.
- Do not present globalization as uniformly beneficial, uniformly harmful, inevitable, synonymous with Americanization, or controlled by a single institution.
- Do not identify San Francisco as the place where the internet or World Wide Web was invented, Paris as the sole site of climate diplomacy, Geneva as the sole site of disease control, or any representative city as the only location where a national or global process occurred.
- Do not treat the World Bank, IMF, WTO, WHO, United Nations, GATT, NAFTA, or European Union as interchangeable organizations.

## Canonical Location Manifest

| Pin | Learner label | Main-event binding | Learning role |
| --- | --- | --- | --- |
| `11` | `Food Security & Unequal Inputs · India / Amritsar–Punjab` | `world-event-11-3` | Green Revolution technology, complementary inputs, unequal access, land consolidation, food supply, population, and environmental costs |
| `70` | `Digital Infrastructure & Knowledge Economy · United States / San Francisco` | `world-event-70-2` | public research, computing and internet infrastructure, reduced information costs, knowledge work, and globally distributed production |
| `15` | `Special Economic Zones & Export Manufacturing · China / Guangzhou` | `world-event-15-1` | Deng-era reform, special economic zones, foreign investment, export manufacturing, labor, environmental costs, and supply-chain relocation |
| `65` | `Free Trade & Maquiladoras · Mexico / Ciudad Juárez` | `world-event-65-0` | border industrialization, NAFTA, maquiladoras, employment, gender, labor standards, and environmental tradeoffs |
| `5` | `Market Reform & Political Control · China / Beijing` | `world-event-5-13` | market reform without political liberalization, Tiananmen, WTO entry, economic integration, and information control |
| `54` | `Global Financial Governance · United States / Washington, D.C.` | `world-event-54-5` | Bretton Woods institutions, development lending, conditionality, unequal institutional power, claimed benefits, and criticism |
| `112` | `Resistance to Globalization · United States / Seattle` | `world-event-112-0` | WTO rule-making criticism, cross-movement protest, internet coordination, fair trade, labor standards, and continued resistance |
| `24` | `Human Rights & Climate Governance · France / Paris` | `world-event-24-9` | Universal Declaration of Human Rights, climate burden sharing from Kyoto to Paris, voluntary commitments, sovereignty, and enforcement limits |
| `34` | `Global Health Cooperation · Switzerland / Geneva` | `world-event-34-2` | WHO vaccination networks, smallpox eradication, HIV/AIDS treatment access, polio, Ebola, state capacity, and coordination limits |
| `110` | `Digital Culture & Soft Power · South Korea / Seoul` | `world-event-110-1` | state-supported cultural industry, digital distribution, transnational audiences, cultural hybridity, exports, and soft power |

Main-event bindings are stable entry points. A study point may cover a process broader than its bound Timeline event, but every record must identify the representative geography and avoid implying that all developments occurred at the anchor city. Amritsar/Punjab represents a wider Indian and global Green Revolution; San Francisco represents a wider public-private knowledge ecosystem; Washington, D.C. represents institutions headquartered there but governed by member states; Geneva represents global health coordination rather than the sites of every outbreak; and Seoul represents the South Korean cultural industry rather than every audience or platform.

## Canonical Study-Point Manifest

| Location | Stable ID | Study point | Date | Primary topics | Lens |
| --- | --- | --- | --- | --- | --- |
| India / Amritsar–Punjab | `apwh-u9-amritsar-high-yield-seeds-input-package` | `High-Yield Seeds and Complementary Inputs` | `1960s–1970s` | 9.1, 9.3 | condition |
| India / Amritsar–Punjab | `apwh-u9-amritsar-unequal-access-land-consolidation` | `Unequal Access, Mechanization, and Land Consolidation` | `1960s–1980s` | 9.3, 9.4 | mechanism |
| India / Amritsar–Punjab | `apwh-u9-amritsar-food-population-environmental-costs` | `Food Supply, Population Growth, and Environmental Costs` | `1970s–2010s` | 9.3, 9.9 | consequence |
| United States / San Francisco | `apwh-u9-san-francisco-public-research-digital-infrastructure` | `Public Research and Digital Infrastructure` | `1940s–1980s` | 9.1 | condition |
| United States / San Francisco | `apwh-u9-san-francisco-computing-internet-information-costs` | `Computing, Internet, and Lower Information Costs` | `1970s–1990s` | 9.1, 9.4 | mechanism |
| United States / San Francisco | `apwh-u9-san-francisco-knowledge-economy-distributed-production` | `Knowledge Economy and Uneven Global Production` | `1990s–2010s` | 9.4, 9.9 | consequence |
| China / Guangzhou | `apwh-u9-guangzhou-market-reform-special-economic-zones` | `Market Reform and Special Economic Zones` | `1978–1984` | 9.4 | condition |
| China / Guangzhou | `apwh-u9-guangzhou-foreign-investment-export-manufacturing` | `Foreign Investment and Export Manufacturing` | `1980s–2001` | 9.4 | mechanism |
| China / Guangzhou | `apwh-u9-guangzhou-supply-chain-labor-environmental-costs` | `Supply-Chain Expansion, Labor, and Environmental Costs` | `2001–2010s` | 9.3, 9.4, 9.9 | consequence |
| Mexico / Ciudad Juárez | `apwh-u9-ciudad-juarez-border-industrialization` | `Border Industrialization before NAFTA` | `1965–1993` | 9.4 | condition |
| Mexico / Ciudad Juárez | `apwh-u9-ciudad-juarez-nafta-maquiladora-expansion` | `NAFTA and Maquiladora Expansion` | `1994–2000s` | 9.4 | mechanism |
| Mexico / Ciudad Juárez | `apwh-u9-ciudad-juarez-employment-gender-labor-environment` | `Employment, Gender, Labor, and Environmental Tradeoffs` | `1990s–2010s` | 9.3, 9.4, 9.9 | consequence |
| China / Beijing | `apwh-u9-beijing-market-reform-political-control` | `Market Reform without Political Liberalization` | `1978–1989` | 9.4, 9.5 | condition |
| China / Beijing | `apwh-u9-beijing-tiananmen-protest-repression` | `Tiananmen Protest and State Repression` | `1989` | 9.5 | mechanism |
| China / Beijing | `apwh-u9-beijing-wto-integration-information-control` | `WTO Integration and Controlled Information` | `2001–2010s` | 9.4, 9.5, 9.9 | consequence |
| United States / Washington, D.C. | `apwh-u9-washington-bretton-woods-financial-institutions` | `Bretton Woods and Postwar Financial Institutions` | `1944–1945` | 9.8 | condition |
| United States / Washington, D.C. | `apwh-u9-washington-development-lending-conditionality` | `Development Lending and Policy Conditionality` | `1950s–2000s` | 9.4, 9.8 | mechanism |
| United States / Washington, D.C. | `apwh-u9-washington-institutional-power-benefits-criticism` | `Institutional Power, Development Claims, and Criticism` | `1990s–2010s` | 9.7, 9.8, 9.9 | consequence |
| United States / Seattle | `apwh-u9-seattle-wto-expansion-rulemaking-criticism` | `WTO Expansion and Rule-Making Criticism` | `1995–1999` | 9.7, 9.8 | condition |
| United States / Seattle | `apwh-u9-seattle-coalition-protest-digital-organization` | `Coalition Protest and Digital Organization` | `1999` | 9.1, 9.5, 9.7 | mechanism |
| United States / Seattle | `apwh-u9-seattle-fair-trade-labor-continuing-resistance` | `Fair Trade, Labor Standards, and Continuing Resistance` | `2000s–2010s` | 9.5, 9.7, 9.9 | consequence |
| France / Paris | `apwh-u9-paris-universal-rights-global-norm` | `Universal Rights as a Global Norm` | `1948` | 9.5, 9.8 | condition |
| France / Paris | `apwh-u9-paris-kyoto-burden-sharing-debate` | `Kyoto-to-Paris Burden-Sharing Debate` | `1997–2015` | 9.3, 9.8 | mechanism |
| France / Paris | `apwh-u9-paris-voluntary-climate-governance-limits` | `Paris Agreement and the Limits of Voluntary Governance` | `2015–2019` | 9.3, 9.8, 9.9 | consequence |
| Switzerland / Geneva | `apwh-u9-geneva-vaccination-smallpox-eradication` | `Vaccination Networks and Smallpox Eradication` | `1967–1980` | 9.2, 9.8 | condition |
| Switzerland / Geneva | `apwh-u9-geneva-hiv-treatment-unequal-access` | `HIV/AIDS Treatment and Unequal Access` | `1980s–2000s` | 9.2, 9.9 | mechanism |
| Switzerland / Geneva | `apwh-u9-geneva-polio-ebola-coordination-limits` | `Polio, Ebola, and the Limits of Health Coordination` | `1988–2010s` | 9.2, 9.8, 9.9 | consequence |
| South Korea / Seoul | `apwh-u9-seoul-state-supported-cultural-industries` | `State Support for Cultural Industries` | `1990s–2000s` | 9.4, 9.6 | condition |
| South Korea / Seoul | `apwh-u9-seoul-digital-platforms-transnational-audiences` | `Digital Platforms and Transnational Audiences` | `2000s–2010s` | 9.1, 9.6 | mechanism |
| South Korea / Seoul | `apwh-u9-seoul-hybrid-culture-exports-soft-power` | `Hybrid Culture, Exports, and Soft Power` | `2000s–2010s` | 9.6, 9.9 | consequence |

Every record must provide one or two approved Exam Skills, valid AP themes, a concise English summary, significance, actors, explained terms, at least two evidence statements, an actionable Exam Connection, and a reproducible source locator. Approximate decade labels must resolve to numeric start and end years that stay inside the stated intervals. Overlapping dates are allowed only when the records distinguish conditions, mechanisms, and consequences.

## Secondary Timeline Locations

Twelve locations remain visible in the Unit 9 Timeline and may be cited inside evidence or comparison notes, but they do not publish three-card study views:

- Maastricht supplies European integration and supranational governance evidence.
- Kigali supplies the Rwandan genocide and limits of United Nations peacekeeping.
- Cairo supplies Arab Spring, social-media mobilization, and state-response evidence.
- Kyoto supplies the 1997 climate protocol and burden-sharing dispute.
- Salvador supplies Brazil's free antiretroviral treatment and unequal access to medicine.
- Cape Town supplies truth and reconciliation and responses to established power structures.
- Khartoum supplies Darfur, displacement, and humanitarian-response evidence.
- Sarajevo supplies Yugoslav dissolution and post-Cold War peacekeeping evidence.
- Kinshasa supplies Ebola and cross-border epidemic-response evidence.
- Manaus supplies deforestation, commodity exports, and environmental externalities.
- Dhaka supplies Rana Plaza, garment supply chains, gendered labor, and safety evidence.
- London supplies Brexit, sovereignty, migration, and resistance to regional integration.

Dhaka is the required unsupported-location browser contract: its pin and Timeline card must continue to open ordinary Rana Plaza event detail, with no `View all 3 study points` entry. Additional events at Beijing, Paris, or Geneva remain ordinary Timeline cards alongside the one canonical main-event binding used to enter each location study.

## Causal and Comparison Architecture

### Vertical causal paths

Each location's three records form an ordered causal path. Required cross-location causal connections are:

- San Francisco's computing and internet infrastructure lowers distribution costs and enables the platform-mediated transnational audiences represented at Seoul;
- export growth in Guangzhou's special economic zones increases the incentive for China's government in Beijing to seek WTO entry, without making that political choice automatic;
- documented labor and environmental tradeoffs in Ciudad Juárez's maquiladora economy supply concrete grievances used by the cross-movement anti-globalization coalition represented at Seattle;
- criticism of development lending and policy conditionality centered on the Washington institutions contributes to a broader critique of closed global economic rule-making represented at Seattle, while keeping the World Bank, IMF, and WTO institutionally distinct.

Use these exact directed pairs:

```js
const crossLocationCausalPairs = [
  ['apwh-u9-san-francisco-computing-internet-information-costs','apwh-u9-seoul-digital-platforms-transnational-audiences'],
  ['apwh-u9-guangzhou-foreign-investment-export-manufacturing','apwh-u9-beijing-wto-integration-information-control'],
  ['apwh-u9-ciudad-juarez-employment-gender-labor-environment','apwh-u9-seattle-coalition-protest-digital-organization'],
  ['apwh-u9-washington-development-lending-conditionality','apwh-u9-seattle-wto-expansion-rulemaking-criticism'],
];
```

Every causal note must name a mechanism and preserve agency at the target. Chronological succession, geographic proximity, technological similarity, or participation in globalization is insufficient by itself.

### Horizontal comparisons

Required reciprocal related comparisons are:

- Amritsar/Punjab and Guangzhou: compare output growth that depends on complementary inputs, unequal access to capital, state policy, and social or environmental costs, while distinguishing agriculture from export manufacturing;
- Guangzhou and Ciudad Juárez: compare special economic zones and maquiladoras as export-production strategies, while distinguishing unilateral Chinese reform from a North American trade-agreement framework;
- Beijing and Seattle: compare collective calls for reform and responses to protest, while distinguishing a one-party state's coercive response from protest around an international meeting in a pluralist political system;
- Washington, D.C. and Paris: compare global institutions and national sovereignty, while distinguishing financial conditionality from largely voluntary human-rights and climate commitments;
- Geneva and Paris: compare cross-border collective action, monitoring, state capacity, and unequal burdens, while distinguishing targeted disease campaigns from long-term climate mitigation.

Use these exact reciprocal pairs:

```js
const relatedPairs = [
  ['apwh-u9-amritsar-unequal-access-land-consolidation','apwh-u9-guangzhou-supply-chain-labor-environmental-costs'],
  ['apwh-u9-guangzhou-foreign-investment-export-manufacturing','apwh-u9-ciudad-juarez-nafta-maquiladora-expansion'],
  ['apwh-u9-beijing-tiananmen-protest-repression','apwh-u9-seattle-coalition-protest-digital-organization'],
  ['apwh-u9-washington-institutional-power-benefits-criticism','apwh-u9-paris-voluntary-climate-governance-limits'],
  ['apwh-u9-geneva-polio-ebola-coordination-limits','apwh-u9-paris-voluntary-climate-governance-limits'],
];
```

Related connections must be reciprocal and share the same comparison note at both endpoints. Secondary locations may appear as cited evidence but must not become unresolved graph endpoints.

## Context and Synthesis Cards

The Unit 9 Context Card is titled `From the End of the Cold War to a Globalized System`.

```js
{
  id: 'apwh-u9-context-post-cold-war-globalized-system',
  kind: 'context',
  role: 'Unit 9 Context Card',
  title: 'From the End of the Cold War to a Globalized System',
  examSkills: ['Contextualization','Causation'],
  summary: 'The end of the Cold War removed a rival superpower system just as market reforms, trade agreements, container shipping, air travel, and digital communications accelerated the movement of goods, capital, information, and people. Institutions created after World War II gained wider reach, but newly integrated states entered with unequal bargaining power, infrastructure, debt, and access to technology.',
  prompt: 'How did the end of the Cold War and falling transportation and information costs change the scale and rules of global interaction?',
  takeaways: [
    'The collapse of the Soviet bloc widened participation in a predominantly market-oriented global economy.',
    'Technology reduced the cost of connection without distributing the gains or risks equally.',
    'Postwar institutions expanded their reach while retaining unequal voting power and limited enforcement.',
  ],
}
```

The Unit 9 Synthesis Card is titled `From Regional Networks to Planetary Interdependence`.

```js
{
  id: 'apwh-u9-synthesis-regional-networks-planetary-interdependence',
  kind: 'synthesis',
  role: 'Unit 9 Synthesis Card',
  title: 'From Regional Networks to Planetary Interdependence',
  examSkills: ['CCOT','Causation'],
  summary: 'Since c. 1200, exchange networks repeatedly widened as states, merchants, empires, industries, and institutions reduced the cost of moving goods, labor, capital, and ideas. By the late twentieth century those networks connected production, communication, health, culture, human rights, and the environment at planetary scale, but no world government acquired matching authority to distribute gains, enforce rules, or assign responsibility for shared costs.',
  prompt: 'Across Units 1–9, how did expanding networks change who wrote the rules, captured the gains, and bore the costs of interdependence?',
  takeaways: [
    'Technologies changed the speed and scale of exchange, while political institutions determined access and rules.',
    'Expanding networks created recurring inequalities between centers, intermediaries, workers, and environments.',
    'Global problems became harder to contain within states even though enforcement still depended on state cooperation.',
  ],
}
```

The cards remain map-independent and do not become Timeline events or causal-chain stops. The synthesis card closes the course rather than pointing to a nonexistent Unit 10.

## Runtime and Interaction Flow

1. Selecting Unit 9 loads its existing Timeline and map anchors.
2. Selecting one of the ten approved pins or its bound Timeline card renders ordinary event detail.
3. The detail panel exposes `View all 3 study points` only for a supported Unit 9 location.
4. Activating the entry opens the country/region-plus-city study heading and three records.
5. Exactly one record is expanded at a time.
6. Causal or related connections synchronize the study record, representative map pin, and exact Timeline event through the existing capability-driven navigation.
7. Connection Back and outer Back restore filters, Timeline state, ordinary detail, homepage controls, disclosures, and focus.
8. Switching Units clears Unit 9 study state.
9. The homepage mirror preserves exact content and behavior parity with the standalone map.
10. Timeline cards remain concise; selecting one places the complete explanation in the right-side panel rather than expanding the dock vertically.

## Validation and Failure Handling

The module follows the Unit 5–8 immutable API and fails validation for malformed IDs, wrong location or main-event bindings, invalid taxonomy, incomplete English content, invalid dates, malformed graph relationships, missing source metadata, ledger drift, or any supported location not publishing exactly three records.

Graph validation remains two-pass: first validate and index every local record; only then resolve causal and related endpoints. A malformed target must produce the module's intended `Invalid Unit 9` diagnostic rather than a native property-access exception. Unknown runtime lookups retain the established empty-array or null behavior. Unsupported Unit 9 pins continue to show ordinary event detail without a study entry. A missing module must not break the existing map, Timeline, causal-chain mode, or Units 1–8 study layers.

Canonical causal notes and all five source-ledger columns are exact contracts rather than minimum-length heuristics. Chronology-only causal prose, institution conflation, vague whole-book citations, unverified page numbers, and claims that erase representative-anchor boundaries are rejected.

## Accessibility and Responsive Behavior

- All entries, record toggles, connections, Back controls, and return controls remain semantic buttons with keyboard activation and visible focus.
- Long country/region-plus-city headings may wrap without horizontal page scrolling.
- The shared mobile single-column layout remains unchanged.
- Expanded details preserve `aria-expanded`, current-record semantics, and one-open behavior.
- Timeline cards remain horizontally scrollable and concise.
- Sensitive material involving repression, disease, labor exploitation, displacement, and environmental harm uses factual, mechanism-centered language without unnecessary graphic detail.

## Source Ledger

Create `docs/data-sources/apwh-u9-location-study-source-ledger.md` with one exact row for each stable ID. Each row records Topic assignments, main-event binding, an edition-neutral AMSCO Unit 9 topic locator, supported claims, and any geographic, institutional, or comparison caveat. The ledger and module must contain the same thirty IDs; placeholders and whole-book citations are prohibited.

The official framework authority is the College Board AP World History: Modern Course and Exam Description effective Fall 2026: <https://apcentral.collegeboard.org/media/pdf/ap-world-history-modern-course-and-exam-description-effective-fall-2026.pdf>. Learner explanations use the project's audited AMSCO Unit 9 material and must not silently reproduce known textbook errors. The ledger must distinguish sourced facts from project-authored causal analysis. Representative anchors, institution headquarters, broad global processes, and cross-case comparisons require explicit caveats.

## Testing Strategy

Implementation follows test-driven development.

- Data tests lock the ten-location/thirty-record manifest, full learner content, Topics 9.1–9.9 coverage, stable ordering, immutability, graph integrity, unit cards, and ledger parity.
- Browser tests cover all ten locations in standalone and homepage contexts, exact record order, one-open behavior, inner and outer Back, focus, Unit switching, disclosure restoration, and representative within-location causal, cross-location causal, and related jumps.
- Filter-sensitive connection tests reuse the Unit 5–8 contracts for exact Timeline visibility, region/category/query restoration, outer Back, and a two-level connection stack.
- A standalone and homepage contract confirms that Dhaka remains an ordinary Unit 9 event with no study entry.
- Regression runs include all Unit 1–8 location-study tests, the full Node suite, the complete Playwright verifier, and `git diff --check`.
- Final scope audit verifies that the exact twenty-five-item Unit 9 membership list, twenty-two map locations, pin coordinates, existing event copy, all Unit 9 chain objects, and all Unit 1–8 study modules remain byte-for-byte unchanged.

## Acceptance Criteria

- Unit 9 exposes exactly ten study locations and thirty validated records.
- All Topics 9.1–9.9 have explicit coverage.
- All existing Unit 1–8 study modules, all twenty-five Unit 9 Timeline events, all twenty-two Unit 9 locations, map pins, causal chains, and the incoming Unit 8 seam remain unchanged.
- Every learner label identifies the country or region as well as the city.
- Amritsar/Punjab, San Francisco, Washington, D.C., Geneva, Seoul, and all other representative anchors include the required geographic or institutional caveats.
- Standalone and homepage study views have content and interaction parity.
- Cross-location navigation never leaves the Timeline, map, detail panel, filters, host controls, disclosures, or focus out of sync.
- Unsupported Unit 9 locations remain fully usable as ordinary Timeline/map events.
- Focused tests, full Node tests, browser verification, and diff checks pass.
