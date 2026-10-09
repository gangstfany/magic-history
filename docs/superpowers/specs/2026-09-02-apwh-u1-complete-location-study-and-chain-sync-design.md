# APWH Unit 1 Complete Location Study and Chain Synchronization Design

## Goal

Complete the APWH Unit 1 location-study layer by adding the two missing College Board content areas—Topic 1.4, State Building in the Americas, and Topic 1.6, Developments in Europe—and repair causal-chain navigation so every selected chain stop highlights its intended map anchor even when that stop has no Unit 1 Timeline card.

The learner-facing location-study labels must identify the civilization or region before the city. A beginning student should see `Aztec Empire · Tenochtitlan`, not an unexplained city name.

## Approved Decisions

- Use the medium-scope expansion: preserve the five approved Unit 1 study locations and add three new locations.
- Add both major Topic 1.4 cases: the Aztec Empire at Tenochtitlan and the Inca Empire at Cusco.
- Add Medieval Europe at London for Topic 1.6.
- Publish exactly three study points at each new location, adding nine records and bringing Unit 1 from five locations and twelve records to eight locations and twenty-one records.
- Keep the map's physical pin names, numbers, coordinates, and source events unchanged.
- Use civilization-first learner labels for the new study locations:
  - `Aztec Empire · Tenochtitlan`
  - `Inca Empire · Cusco`
  - `Medieval Europe · London`
- Preserve all existing Unit 1 study records and their approved order.
- Do not refactor existing locations merely to force every location to contain three records.
- When causal-chain navigation cannot select a Timeline card, fall back to the chain stop's declared map anchor automatically.
- Do not alter Unit 2 or Unit 3 study content, mappings, or causal-chain data.

## Course Coverage

The completed Unit 1 study layer covers the current College Board AP World History: Modern Unit 1 topics:

- 1.1 Developments in East Asia — Hangzhou;
- 1.2 Developments in Dar al-Islam — Baghdad;
- 1.3 Developments in South and Southeast Asia — Delhi and Angkor;
- 1.4 State Building in the Americas — Aztec Empire at Tenochtitlan and Inca Empire at Cusco;
- 1.5 State Building in Africa — Timbuktu;
- 1.6 Developments in Europe — Medieval Europe at London;
- 1.7 Comparison in the Period from c. 1200 to c. 1450 — expressed through record topic assignments, connections, Context, and Synthesis.

The three new locations are representative map anchors. Their copy must not imply that every regional development occurred inside the named city. The Europe records must explicitly describe London as an anchor for developments across medieval Europe.

## Scope

- Extend the immutable Unit 1 location-study data module from five to eight locations.
- Add nine complete English study records, three per new location.
- Add Topic 1.4 and 1.6 to the allowed and validated Unit 1 topic vocabulary.
- Add learner-facing civilization-first display labels without renaming map pins or changing coordinates.
- Add meaningful causal or comparative connections for every new record and publish reciprocal connection metadata.
- Extend the Unit 1 source ledger with exact entries for all nine records.
- Repair chain-stop selection fallback in the shared causal-chain controller.
- Add exact data, interaction, standalone-page, homepage-mirror, and regression verification.

## Non-goals

- Do not add or move map pins.
- Do not create new map timeline events for Tenochtitlan, Cusco, or London; use the existing Unit 1 events.
- Do not rewrite the twelve existing Unit 1 study records.
- Do not change Unit 2 or Unit 3 location-study modules.
- Do not change causal-chain prose, chain order, stop definitions, or cross-Unit seams.
- Do not force a Timeline card to exist for every causal-chain stop.
- Do not redesign the map, Timeline dock, causal-chain panel, or outer frame.
- Do not turn the location-study layer into a new top-level mode.

## New Location and Study-Point Manifest

The manifest below is canonical. Each new location publishes exactly three records through the module's existing chronological comparator. Stable IDs break equal-date ties deterministically. IDs, titles, dates, topics, themes, learner labels, and main-event bindings are validated as authored data.

| Pin | Learner label | Stable ID | Study point | Date | Topics | Themes | Main event |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `49` | Aztec Empire · Tenochtitlan | `apwh-u1-tenochtitlan-chinampas-urban-state` | `Chinampas and Urban State Capacity` | `1325–1450` | 1.4, 1.7 | ENV, ECN, GOV | `world-event-49-0` |
| `49` | Aztec Empire · Tenochtitlan | `apwh-u1-tenochtitlan-religion-warfare-legitimacy` | `Religion, Warfare, and Mexica Legitimacy` | `1325–1450` | 1.4, 1.7 | CDI, GOV | `world-event-49-0` |
| `49` | Aztec Empire · Tenochtitlan | `apwh-u1-tenochtitlan-triple-alliance-tribute` | `Triple Alliance and Tribute Empire` | `1428–1450` | 1.4, 1.7 | GOV, ECN | `world-event-49-0` |
| `50` | Inca Empire · Cusco | `apwh-u1-cusco-ayllu-mita-labor` | `Ayllu, Mit'a, and State Labor` | `1438–1450` | 1.4, 1.7 | SIO, GOV, ECN | `world-event-50-0` |
| `50` | Inca Empire · Cusco | `apwh-u1-cusco-pachacuti-tawantinsuyu` | `Pachacuti and Tawantinsuyu` | `1438–1450` | 1.4, 1.7 | GOV, ENV | `world-event-50-0` |
| `50` | Inca Empire · Cusco | `apwh-u1-cusco-roads-quipu-administration` | `Roads, Quipu, and Imperial Administration` | `1438–1450` | 1.4, 1.7 | GOV, TEC | `world-event-50-0` |
| `23` | Medieval Europe · London | `apwh-u1-london-manorial-feudal-order` | `Manorial Agriculture and Feudal Order` | `1200–1450` | 1.6, 1.7 | SIO, ECN | `world-event-23-0` |
| `23` | Medieval Europe · London | `apwh-u1-london-towns-guilds-commerce` | `Towns, Guilds, and Commercial Growth` | `1200–1450` | 1.6, 1.7 | ECN, SIO | `world-event-23-0` |
| `23` | Medieval Europe · London | `apwh-u1-london-magna-carta-monarchy` | `Magna Carta and Negotiated Monarchy` | `1215` | 1.6, 1.7 | GOV | `world-event-23-0` |

The final implementation may refine punctuation or learner-friendly English phrasing during source-ledger review, but it may not change the historical claim, pin, event binding, topic assignment, or three-record structure without a design amendment.

## Complete Study-Point Contract

Every new record follows the existing Unit 1 data contract:

- stable ID beginning with `apwh-u1-`;
- location number and learner-facing location label;
- linked existing main-event key;
- English title, display date, integer start year, and integer end year;
- concise summary and historical significance;
- one or more historically honest people or institutional actors;
- key terms with explanations;
- at least two evidence statements;
- actionable Exam Connection;
- Topic 1.4 or 1.6 plus Topic 1.7;
- one or more valid theme IDs;
- one or two valid Exam Skills;
- causal or related study-point connections with reciprocal metadata and matching notes;
- reproducible AMSCO Unit 1 source locator.

Claims must distinguish evidence from geographic anchoring. London may represent European manorialism, feudal political relationships, and urban-commercial development, but the text must state that these were regional European patterns. Tenochtitlan and Cusco must remain distinct cases rather than being collapsed into a generic American empire.

## Display-Label Architecture

Map geometry continues to use pin numbers and the map's city labels. The study module owns a separate learner-facing label for its location-study heading and entry action.

For the three new locations:

- the first phrase names the civilization or region;
- the city follows after a centered dot;
- screen-reader text includes both parts;
- the standalone APWH page and homepage mirror render the same label;
- filters, map tooltips, source IDs, event keys, and coordinates remain unchanged.

This separation prevents a content label improvement from mutating map identity or breaking existing source bindings.

## Connection Design

Connections make the Unit 1 comparison structure visible while preserving historical distinctions.

### Within the Aztec case

- Chinampa productivity and urban organization support state capacity.
- The Triple Alliance converts military power into tribute.
- Tribute, warfare, and religion reinforce imperial legitimacy and coercion.

### Within the Inca case

- Pachacuti's expansion creates an administrative problem across difficult terrain.
- Roads and quipu support communication, accounting, and redistribution.
- Ayllu organization and mit'a labor allow the state to mobilize people and resources.

### Within the Europe case

- Manorial agriculture and decentralized feudal relationships frame medieval political order.
- Magna Carta supplies a specific case of elite negotiation limiting royal action.
- Towns and guilds show commercial and urban growth within, and gradually beyond, the manorial order.

### Across cases

Use related links for analytical comparison rather than false direct causation. Required comparisons include:

- Aztec tribute and Inca labor/redistribution as different methods of extracting imperial resources;
- Aztec chinampas and Inca terrace or highland adaptation as environment-state comparisons;
- negotiated European monarchy compared with the more centralized administrative strategies represented elsewhere in Unit 1.

## Causal-Chain Synchronization Repair

### Existing failure

Normal chain navigation attempts to select a declared Timeline event or a Timeline card matching the stop's pin. When neither is available, the controller currently falls back to the chain's map anchor only in a special synchronization path. Ordinary next/previous and direct stop selection can therefore leave the map highlighting a previous location.

The verified Unit 1 failures are:

- `u1_main`, stop 8: expected Karakorum (`8`), stale Kilwa (`85`);
- `u1_sub_syncretism`, stop 1: expected Malacca (`2`), stale Angkor (`7`);
- `u1_sub_labor`, stop 4: expected Cairo (`84`), stale Tenochtitlan (`49`);
- `u1_sub_gender`, stop 2: expected Cairo (`84`), stale Mississippi (`47`).

### Approved behavior

For every active causal-chain stop:

1. prefer the stop's exact declared Timeline event when present;
2. otherwise select a Unit Timeline card at the stop's pin when present;
3. otherwise select and highlight the stop's declared map anchor;
4. never retain the previous stop's map highlight merely because a Timeline card is absent.

The fallback must operate for direct stop clicks, previous/next controls, autoplay, cross-Unit seam navigation, and any existing synchronization entry point that routes through the shared stop controller. It must not create a fabricated Timeline card or add a missing event to a Unit.

## Data and Runtime Failure Handling

- Unknown location, study-point, and unit-card lookups retain the existing null or empty-array behavior.
- A new study record with an invalid pin, main-event key, topic, theme, Exam Skill, connection, or source locator fails automated validation.
- If a runtime-linked main event cannot be resolved, the affected study entry is not rendered with a broken link.
- A chain stop with an invalid map pin must fail verification; the controller must not silently highlight an arbitrary pin.
- The existing location-event panel remains usable when no study data is available.

## Accessibility and Responsive Behavior

- Civilization-first labels wrap naturally and do not create a new narrow column.
- Study-entry and return controls retain semantic button behavior, minimum hit area, focus restoration, and keyboard activation.
- The new records reuse the existing single-column responsive study layout.
- Map-anchor fallback updates the same active styling and accessible state used by ordinary Timeline selection.
- No horizontal page scrolling is introduced at the existing narrow and wide panel widths.

## Source Ledger

Extend `docs/data-sources/apwh-u1-location-study-source-ledger.md` with one exact row for every new stable ID. Each row records:

- the AMSCO AP World History Unit 1 topic locator;
- the existing `world-event-49-0`, `world-event-50-0`, or `world-event-23-0` binding;
- the claims supported by that locator;
- any representative-anchor caveat needed for geographic accuracy.

The ledger and data module must expose exactly the same twenty-one record IDs. Unsupported page numbers, placeholder sources, and uncited new claims are prohibited.

## Testing Strategy

Implementation follows test-driven development. Failing tests are added before production changes.

### Data tests

- Unit 1 exposes exactly eight locations and twenty-one records.
- Pins 49, 50, and 23 each expose exactly three records.
- The three learner-facing labels match the approved civilization-first names.
- All Unit 1 Topic codes from 1.1 through 1.7 are represented.
- Every new record has the exact approved pin, main-event binding, Topic codes, themes, complete data contract, and valid source entry.
- All connection endpoints exist, use a single category, are reciprocal, and publish matching notes.
- The source ledger has exact one-to-one ID coverage.

### Interaction tests

- The three new study locations expose the existing `View all 3 study points` entry.
- Their learner-facing headings use the approved labels on both standalone and homepage surfaces.
- Entry, expansion, back navigation, focus restoration, and Unit switching behave exactly like the existing Unit 1 locations.
- The four known chain-stop failures now highlight Karakorum, Malacca, Cairo, and Cairo respectively.
- Direct clicks, previous/next, and the existing route used by autoplay exercise the same fallback.
- A stop with an available Timeline card still selects that card rather than using map-only fallback.

### Regression tests

- Existing Unit 1 records, cards, counts, and connections remain unchanged except for the approved additive totals.
- Dedicated Unit 1, Unit 2, and Unit 3 location-study suites pass.
- The full APWH verification suite passes.
- Homepage embedding, Timeline dock selection, causal-chain navigation, route mode, practice mode, and map filters remain functional.

## Success Criteria

The work is complete when a beginning student can identify the Aztec, Inca, and medieval European cases without already knowing the city names; open three source-backed study points at each new anchor; see complete Unit 1 Topic 1.1–1.7 coverage; and navigate every Unit 1 causal-chain stop without stale map highlighting, whether or not that stop owns a Timeline card.
