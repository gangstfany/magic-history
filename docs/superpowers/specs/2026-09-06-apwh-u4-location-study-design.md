# APWH Unit 4 Location Study Design

## Goal

Add a complete AP World History: Modern Unit 4 location-study layer to the existing map without adding a new page mode or changing the Timeline Dock. The module must help a first-time learner follow the causal development of transoceanic interconnections while also giving a review learner explicit comparison paths for AP-style writing.

The approved model is **vertical causation plus horizontal comparison**:

- each location presents three study points in causal order: condition or pressure, operating mechanism, then consequence;
- causal links connect steps within a location and selected steps across locations;
- related links connect comparable institutions and systems without falsely claiming direct causation;
- every card retains College Board Topic, theme, and historical-thinking-skill metadata.

## Approved Decisions

- Use exactly eight core Unit 4 locations, aligned with the existing `u4_main` causal-chain stops.
- Publish exactly three study points at every location, for twenty-four Unit 4 records.
- Reuse existing pins, coordinates, Timeline records, and the shared location-study renderer.
- Do not add a fourth top-level mode or a second detail panel.
- Keep the Timeline Dock concise: year plus short event name. Long explanations remain in the right-side detail panel.
- Use process-first learner labels rather than unexplained city names.
- Identify the transformed colonial city as `Colonial New Spain · Tenochtitlan / Mexico City` so students see both continuity and political change.
- Add one Unit 4 Context Card and one Unit 4 Synthesis Card using the same contract as Units 1–3.
- Use AMSCO Unit 4 topic locators in a one-row-per-record source ledger.
- Preserve all existing Unit 1–3 location studies, Unit 4 Timeline assignments, causal chains, map pins, and cross-Unit seams.

## Course Coverage

The twenty-four records collectively cover all Unit 4 topics:

- 4.1 Technological Innovations from 1450 to 1750;
- 4.2 Exploration: Causes and Events from 1450 to 1750;
- 4.3 Columbian Exchange;
- 4.4 Maritime Empires Established;
- 4.5 Maritime Empires Maintained and Developed;
- 4.6 Internal and External Challenges to State Power from 1450 to 1750;
- 4.7 Changing Social Hierarchies from 1450 to 1750;
- 4.8 Continuity and Change from 1450 to 1750.

Topic 4.8 is expressed through selected record assignments, Context and Synthesis cards, and the comparison graph rather than through a detached summary page.

## Scope

- Add `data/apwh-u4-location-study.js` as the single immutable Unit 4 study-data module.
- Register that module in both `world-map.html` and `index.html` through the existing per-Unit module registry.
- Add twenty-four complete English learner records.
- Add validated, reciprocal causal and related connections.
- Add `docs/data-sources/apwh-u4-location-study-source-ledger.md` with exact one-to-one record coverage.
- Add focused Node validation tests and standalone/homepage Playwright coverage.
- Update existing assertions that currently require Unit 4 to expose no location-study entry.

## Non-goals

- Do not redesign the map, mode buttons, right drawer, causal-chain panel, or Timeline Dock.
- Do not add or move physical map pins.
- Do not create duplicate Timeline content inside the study module.
- Do not rewrite the approved Unit 4 causal-chain prose or reorder its stops.
- Do not change the Unit mapping of existing Timeline events unless a separate audited data defect is found and approved.
- Do not create cross-module study links to Unit 1–3 records in this iteration.
- Do not require students to know a city name before understanding its historical role.
- Do not imply that a representative pin is the only place where a regional process occurred.

## Canonical Location Manifest

| Pin | Learner label | Main-event binding | Learning role |
| --- | --- | --- | --- |
| `42` | `Maritime Portugal · Lisbon` | `world-event-42-0` | Atlantic constraints, navigation, and state-sponsored expansion |
| `2` | `Portuguese Trading-Post Empire · Malacca` | `world-event-2-2` | Existing Indian Ocean commerce, fortified ports, and Asian limits |
| `68` | `Caribbean Colonization · Santo Domingo` | `world-event-68-0` | Disease, conquest, encomienda, and biological exchange |
| `57` | `Spanish Silver Economy · Potosí` | `world-event-57-0` | Silver extraction, colonial mit'a, and global monetary flows |
| `60` | `Brazilian Sugar Plantations · Salvador` | `world-event-60-0` | Sugar profits, plantation organization, and enslaved labor |
| `87` | `Atlantic Slave Trade · Elmina` | `world-event-87-0` | Captive supply, Middle Passage, and consequences in Africa |
| `12` | `Manila Galleons · Manila` | `world-event-12-0` | Pacific shipping and the exchange of American silver for Asian goods |
| `49` | `Colonial New Spain · Tenochtitlan / Mexico City` | `world-event-49-7` | Colonial reconstruction, casta hierarchy, syncretism, and resistance |

The main-event binding is a stable entry point for the location-study view. Individual study records may discuss a longer process than the bound Timeline card, but their dates and claims must remain within the Unit 4 course frame and must not misrepresent the underlying map event.

## Canonical Study-Point Manifest

The stable IDs below are required. Dates may be refined during source audit only when the change improves historical accuracy without changing the approved causal role.

| Location | Stable ID | Study point | Date | Primary topics | Lens |
| --- | --- | --- | --- | --- | --- |
| Lisbon | `apwh-u4-lisbon-atlantic-constraints` | `Atlantic Constraints and Overseas Expansion` | `1400s` | 4.1, 4.2 | condition |
| Lisbon | `apwh-u4-lisbon-navigation-state-sponsorship` | `Navigation Knowledge and State Sponsorship` | `1400s` | 4.1, 4.2 | mechanism |
| Lisbon | `apwh-u4-lisbon-sea-route-indian-ocean` | `A Sea Route to the Indian Ocean` | `1488–1498` | 4.2, 4.8 | consequence |
| Malacca | `apwh-u4-malacca-existing-indian-ocean-networks` | `Indian Ocean Trade before Portuguese Arrival` | `1450–1500` | 4.2, 4.8 | condition |
| Malacca | `apwh-u4-malacca-cartaz-fortified-ports` | `Cartaz Passes and Fortified Ports` | `1511–1600` | 4.2, 4.4 | mechanism |
| Malacca | `apwh-u4-malacca-asian-responses-limits` | `Asian Responses and the Limits of Portuguese Power` | `1500–1650` | 4.5, 4.6 | consequence |
| Santo Domingo | `apwh-u4-santo-domingo-disease-demographic-collapse` | `Disease and Demographic Collapse` | `1492–1600` | 4.3, 4.8 | condition |
| Santo Domingo | `apwh-u4-santo-domingo-conquest-encomienda` | `Conquest and Encomienda` | `1503–1542` | 4.3, 4.4 | mechanism |
| Santo Domingo | `apwh-u4-santo-domingo-columbian-exchange` | `The Columbian Exchange in the Caribbean` | `1492–1600` | 4.3, 4.8 | consequence |
| Potosí | `apwh-u4-potosi-silver-mercury-boom` | `Silver Discovery and Mercury Refining` | `1545–1600` | 4.4, 4.5 | condition |
| Potosí | `apwh-u4-potosi-colonial-mita-labor` | `Colonial Mit'a and Coerced Mining Labor` | `1573–1750` | 4.4, 4.7 | mechanism |
| Potosí | `apwh-u4-potosi-global-silver-flows` | `Potosí Silver in the Global Economy` | `1570–1750` | 4.5, 4.8 | consequence |
| Salvador | `apwh-u4-salvador-sugar-plantation-expansion` | `Sugar and Plantation Expansion` | `1500–1750` | 4.4, 4.5 | condition |
| Salvador | `apwh-u4-salvador-african-chattel-slavery` | `From Indigenous Labor to African Chattel Slavery` | `1500–1750` | 4.4, 4.7 | mechanism |
| Salvador | `apwh-u4-salvador-mercantilism-atlantic-profits` | `Mercantilism and Atlantic Profits` | `1600–1750` | 4.5, 4.8 | consequence |
| Elmina | `apwh-u4-elmina-firearms-captive-cycle` | `African States and the Firearms–Captive Cycle` | `1500–1750` | 4.4, 4.6 | condition |
| Elmina | `apwh-u4-elmina-middle-passage-chattel-slavery` | `Middle Passage and Chattel Slavery` | `1500–1750` | 4.4, 4.7 | mechanism |
| Elmina | `apwh-u4-elmina-african-demographic-political-effects` | `Demographic and Political Effects in Africa` | `1500–1750` | 4.5, 4.8 | consequence |
| Manila | `apwh-u4-manila-galleon-route` | `The Manila Galleon Route` | `1565–1750` | 4.4, 4.5 | condition |
| Manila | `apwh-u4-manila-silver-asian-goods` | `American Silver for Asian Goods` | `1570–1750` | 4.5, 4.8 | mechanism |
| Manila | `apwh-u4-manila-pacific-commercial-network` | `A Pacific Commercial Network` | `1570–1750` | 4.5, 4.8 | consequence |
| New Spain | `apwh-u4-new-spain-tenochtitlan-mexico-city` | `From Tenochtitlan to Mexico City` | `1521–1600` | 4.3, 4.4 | condition |
| New Spain | `apwh-u4-new-spain-casta-colonial-governance` | `Casta and Colonial Governance` | `1600–1750` | 4.5, 4.7 | mechanism |
| New Spain | `apwh-u4-new-spain-syncretism-resistance` | `Syncretism, Resistance, and Social Change` | `1521–1750` | 4.6, 4.7, 4.8 | consequence |

Every record must also provide one or two approved Exam Skills, one or more valid AP themes, a concise summary, significance, people or institutional actors, explained key terms, at least two evidence statements, an actionable Exam Connection, and a reproducible source locator.

## Causal and Comparison Architecture

### Vertical causal paths

Each location's three records form an ordered causal path. Required cross-location causal links are:

- Lisbon's sea route enables the Portuguese fortified-port strategy represented at Malacca.
- Caribbean demographic collapse helps explain the search for new coerced-labor supplies in Brazilian plantation zones.
- Brazilian plantation demand intensifies the Atlantic captive trade represented at Elmina.
- Potosí silver supplies the American bullion carried through the Manila galleon system.
- The destruction and reconstruction of Tenochtitlan creates the colonial setting in which casta governance develops.

Causal notes must state a mechanism. Mere chronology, such as “X happened and then Y happened,” is invalid.

### Horizontal comparisons

Required related comparisons are:

- Malacca's trading-post empire versus the territorial colonial rule represented at Santo Domingo;
- Potosí's adapted mit'a labor versus chattel slavery on Brazilian plantations;
- the preexisting Indian Ocean network at Malacca versus the newer Pacific connection at Manila;
- Elmina's Atlantic social disruption versus casta hierarchy in New Spain as different consequences of imperial extraction;
- the Columbian Exchange in the Caribbean versus the commodity and bullion exchanges connecting Potosí and Manila.

Related links must be reciprocal and publish the same comparison note at both endpoints. A comparison link must not be presented as direct causation.

## Context and Synthesis Cards

The Context Card bridges Unit 3 to Unit 4: large land-based states could tax territory internally, while Portugal's geography, existing Mediterranean intermediaries, and combined maritime technologies encouraged overseas routes and fortified commercial access.

The Synthesis Card bridges Unit 4 to Unit 5: oceanic exchange created wealth and durable hierarchies based on legal status, ancestry, and coerced labor. Enlightenment and revolutionary actors later challenged who could claim rights and political legitimacy within those systems.

Both cards remain map-independent and use the existing unit-card data contract. They do not become Timeline events or causal-chain stops.

## Runtime and Interaction Flow

1. Selecting Unit 4 loads the existing Unit 4 Timeline and map anchors.
2. Selecting one of the eight approved pins or a corresponding Timeline card renders the ordinary event detail.
3. The event panel exposes `View all 3 study points` only when the selected Unit 4 pin has records.
4. Activating that button opens the Unit 4 study view with the approved process-first heading.
5. Exactly one study record is expanded at a time.
6. Activating a causal or related connection moves the map, selects the corresponding Timeline event when available, and renders the target location and record.
7. Back restores the ordinary event detail and focus.
8. Switching Units removes Unit 4 study content, open details, stale focus references, and selected study state.
9. The homepage mirror uses the existing iframe-to-host bridge and renders the same labels, record order, connection behavior, and single-open-detail state.

No new runtime renderer is permitted. Unit 4 is added to the existing module registry used by Units 1–3.

## Data Validation and Failure Handling

The module follows the established immutable API and fails validation for:

- a missing, duplicate, malformed, or non-Unit-4 stable ID;
- an unknown location number or incorrect main-event binding;
- an invalid or duplicated Topic, theme, or Exam Skill;
- malformed dates or numeric ranges that disagree with display dates;
- incomplete or non-English learner content;
- unresolved, self-referential, duplicate, cross-category, nonreciprocal, or mismatched-note connections;
- missing or extra source metadata;
- a source ledger whose IDs or locators do not exactly match the module;
- a location that does not publish exactly three canonical study points.

Unknown runtime lookups retain the existing empty-array or null behavior. Ordinary event detail remains usable when a selected Unit or pin has no location-study records.

## Accessibility and Responsive Behavior

- All study-entry, record, connection, back, and return controls remain semantic buttons with keyboard activation and visible focus.
- Process-first headings may wrap but may not introduce horizontal page scrolling.
- The single-column mobile study layout is reused without adding a new narrow column.
- Expanded details retain the existing `aria-expanded`, focus-restoration, and one-open-record behavior.
- The Timeline Dock remains horizontally scrollable within its own container and does not compete with the right-side detail panel.

## Source Ledger

Create `docs/data-sources/apwh-u4-location-study-source-ledger.md` with one exact row for every stable ID. Each row records:

- AP Topic assignments;
- main-event binding;
- edition-neutral AMSCO Unit 4 topic locator;
- supported historical claims;
- any representative-anchor or geographic caveat.

The ledger and data module must contain exactly the same twenty-four IDs. Unsupported page numbers, placeholder sources, and vague whole-book citations are prohibited.

## Testing Strategy

Implementation follows test-driven development.

### Data tests

- lock the exact eight-location and twenty-four-record manifest;
- lock every learner label, stable ID, main-event binding, date, Topic, theme, and Exam Skill;
- verify complete Topic 4.1–4.8 coverage;
- verify three records per location and stable chronological ordering;
- verify deep immutability and defensive lookup behavior;
- verify all causal and related endpoints, categories, reciprocal notes, and source-ledger rows;
- exercise every validation failure category used by the Unit 1–3 modules.

### Browser tests

- verify all eight study entries and approved headings on the standalone map;
- verify exact record order and one-open-detail behavior;
- verify at least one within-location causal jump, one cross-location causal jump, and one horizontal comparison jump;
- verify map anchor, selected Timeline event, and right-panel record remain synchronized;
- repeat the contract through the homepage iframe mirror using the existing host bridge;
- verify Unit switching clears all Unit 4 study state;
- replace the current assertions that require Unit 4 to have no study UI with positive Unit 4 contracts.

### Regression tests

- run the complete Node suite and browser verifier;
- preserve the existing Unit 4 main chain, supplementary chains, cross-Unit seams, Timeline count and mapping, map search, category filters, practice drawer, and route overlay;
- preserve every Unit 1–3 location-study manifest and interaction contract.

## Success Criteria

The work is complete when a student can select Unit 4, open any of the eight approved locations, study three causally ordered records, follow causal or comparison links without losing map and Timeline synchronization, and receive identical behavior on the standalone map and homepage mirror. Automated tests must prove exact data/source contracts, full Topic 4.1–4.8 coverage, state cleanup, accessibility behavior, and regression safety.
