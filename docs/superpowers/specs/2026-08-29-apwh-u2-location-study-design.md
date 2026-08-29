# APWH Unit 2 Location Study, Exam Skills, and Bookend Cards Design

## Goal

Extend the approved APWH Unit 1 location-study experience to Unit 2. Unit 2 receives six map anchors, eighteen English study points, historical-thinking Exam Skills, one unit-wide Context Card, and one unit-wide Synthesis Card. The learner should understand Unit 2 as one causal network spine rather than as three disconnected trade-route inventories.

The feature must use the already widened APWH frame and remain readable throughout the existing `380–430px` right-panel range. It must not narrow, widen, or otherwise alter the global frame.

## Approved Decisions

- Build the full Unit 2 experience, not a cards-only release.
- Use the `Network Spine` organization.
- Use six anchors: Karakorum, Samarkand, Malacca, Kilwa, Cairo, and Nanjing.
- Publish exactly three location study points at every anchor, for eighteen study points total.
- Use Cairo rather than repeating Timbuktu as the trans-Saharan anchor.
- Reuse one canonical Context Card and one canonical Synthesis Card at every Unit 2 anchor.
- Keep all learner-facing study content in English.
- Preserve the already widened outer frame and validate the component at `380px`, `410px`, and `430px` CSS widths.

## Learning Architecture

The eighteen study points follow one causal sequence:

1. transport and payment costs fall;
2. political protection lowers risk;
3. exchange networks grow in scale and predictability;
4. port states and merchant communities benefit from recurring traffic;
5. beliefs, technologies, and cultural practices move with goods;
6. pathogens and environmental pressures move through the same connections;
7. states either extend, redirect, or restrict network participation.

This sequence supports Causation while retaining explicit Comparison, Continuity and Change over Time, and Contextualization opportunities. Route names remain important evidence, but they do not become separate silos.

## Scope

- Add a dedicated immutable Unit 2 location-study data module.
- Add exactly eighteen complete Unit 2 study records across the six approved anchors.
- Add one or two approved Exam Skills to every Unit 2 record.
- Add exactly one canonical Unit 2 Context Card and one canonical Unit 2 Synthesis Card.
- Render the Unit 2 cards and records in both the standalone APWH map and the homepage mirror.
- Generalize the existing Unit 1-only study lookup so the active Unit selects the correct API.
- Preserve Unit 1 content and behavior while giving Unit 1 cards a data-provided English role label compatible with the generalized renderer.
- Add a Unit 2 source ledger that binds every study point to an edition-neutral AMSCO Unit 2 topic locator and an existing map event key.
- Add exact data, interaction, responsive, switching, and regression verification.

## Non-goals

- Do not add Unit 3–9 location-study content.
- Do not add map pins, move coordinates, or alter existing timeline event datasets.
- Do not alter the current causal-chain content or route definitions.
- Do not add SAQ, LEQ, or DBQ format badges. Exam Skills remain historical-thinking skills.
- Do not add unit cards to map-event counts, filters, relationship graphs, timelines, or source panels.
- Do not duplicate a second Unit 2 renderer or copy Unit 1 UI styles under new Unit 2 class names.
- Do not change the global frame width, map/detail ratio, or the approved Unit 1 card design.

## Anchor and Study-Point Manifest

The manifest below is canonical. Rows appear chronologically within each location. Each record uses a stable ID beginning with `apwh-u2-`, the stated topic codes, the stated themes, and the exact Exam Skills assignment.

| Location | Study point | Date | Topics | Themes | Exam Skills |
| --- | --- | --- | --- | --- | --- |
| Karakorum (`8`) | `Mongol Unification and Conquest` | `1206–1227` | 2.2, 2.7 | GOV | Causation, CCOT |
| Karakorum (`8`) | `Pax Mongolica and Protected Trade` | `c. 1250–c. 1350` | 2.1, 2.2, 2.7 | GOV, ECN | Causation |
| Karakorum (`8`) | `The Yam Relay and Cross-Cultural Transfer` | `c. 1250–1368` | 2.2, 2.5 | TEC, CDI | Causation, Comparison |
| Samarkand (`9`) | `Caravanserai and Merchant Infrastructure` | `1200–1450` | 2.1, 2.7 | ECN, TEC | Causation |
| Samarkand (`9`) | `Bills of Exchange and Banking Houses` | `1300–1450` | 2.1, 2.7 | ECN | Causation, Comparison |
| Samarkand (`9`) | `Timurid Samarkand as a Commercial and Learning Hub` | `1370–1450` | 2.1, 2.5 | CDI, TEC | CCOT, Comparison |
| Malacca (`2`) | `Monsoon Navigation and Maritime Technology` | `1200–1450` | 2.3, 2.7 | TEC, ECN | Causation |
| Malacca (`2`) | `Malacca as a Strategic Port State` | `c. 1400–1450` | 2.3, 2.7 | ECN, GOV | Causation, Comparison |
| Malacca (`2`) | `Merchant Diasporas and the Spread of Islam` | `c. 1400–1450` | 2.3, 2.5 | CDI, SIO | Causation, CCOT |
| Kilwa (`85`) | `Swahili City-States and Indian Ocean Commerce` | `1000–1450` | 2.3, 2.7 | ECN, GOV | Causation, Comparison |
| Kilwa (`85`) | `Gold, Ivory, and Regional Specialization` | `1200–1450` | 2.3, 2.7 | ECN | Causation |
| Kilwa (`85`) | `Swahili Cultural Synthesis` | `1200–1450` | 2.3, 2.5 | CDI, SIO | Comparison, CCOT |
| Cairo (`84`) | `Trans-Saharan Gold and Camel-Caravan Trade` | `1200–1450` | 2.4, 2.7 | ECN, TEC | Causation, Comparison |
| Cairo (`84`) | `Mansa Musa's Gold Shock` | `1324` | 2.4, 2.5 | GOV, ECN, CDI | Causation, Contextualization |
| Cairo (`84`) | `Black Death and Demographic Change` | `1347–1351` | 2.6 | ENV, SIO | Causation, CCOT |
| Nanjing (`10`) | `Treasure-Fleet Technology and Scale` | `1405–1433` | 2.3, 2.7 | TEC, GOV | Causation |
| Nanjing (`10`) | `Zheng He's Tributary Voyages` | `1405–1433` | 2.3, 2.5 | GOV, CDI | Causation, Comparison |
| Nanjing (`10`) | `Ming Maritime Retrenchment` | `1433–1450` | 2.3, 2.7 | GOV, ECN | CCOT, Causation |

Where two developments overlap chronologically, the stored start year, end year, and stable ID must still produce the pedagogical order shown above. If the existing comparator cannot guarantee that order without distorting dates, add a validated integer `sequence` used only as the final within-location ordering key; do not falsify chronology to force display order.

## Complete Study-Point Contract

Every Unit 2 study point uses the same complete learner-facing contract as Unit 1:

- stable ID and location number;
- linked existing main-event key;
- title, date label, start year, and end year;
- concise summary and historical significance;
- one or more key people or historically honest institutional actors;
- key terms with explanations;
- evidence statements;
- actionable Exam Connection;
- topic codes and theme IDs;
- one or two Exam Skills;
- causal and related study-point links with explanatory notes;
- reproducible source ID and locator.

Claims must remain geographically honest. A record may explain a network effect beyond the selected city, but its summary and evidence must distinguish the anchor from other locations instead of implying that every development occurred inside the city.

## Exam Skills Vocabulary

Use exactly the existing vocabulary:

- `Causation`
- `Comparison`
- `CCOT`
- `Contextualization`

Every event and unit card has one or two unique values. Validation rejects missing, invalid, duplicated, or oversized arrays. Assignment order is learner-facing and therefore exact.

## Unit 2 Context Card

- ID: `apwh-u2-context-networks-ready-to-expand`
- Kind: `context`
- Role: `Unit 2 Context Card`
- Title: `Networks Ready to Expand`
- Skills: `Contextualization`, `Causation`
- Summary: `By c. 1200, expanding states, commercial cities, and accumulated transport technologies had created the demand and infrastructure for long-distance exchange.`
- Prompt: `As you study Unit 2, identify which conditions already existed by 1200 and which new political or commercial changes made exchange grow.`
- Takeaways:
  1. `Unit 1 states generated agricultural surpluses, commercial cities, and specialized goods sought beyond local markets.`
  2. `Caravan routes and monsoon seas already linked regions, but distance, insecurity, and payment remained expensive.`
  3. `Merchant communities and shared legal or religious practices made exchange with strangers more predictable.`

## Unit 2 Synthesis Card

- ID: `apwh-u2-synthesis-network-expansion-consequences`
- Kind: `synthesis`
- Role: `Unit 2 Synthesis Card`
- Title: `Why Networks Expanded—and What They Carried`
- Skills: `Comparison`, `CCOT`
- Summary: `From 1200 to 1450, lower transport, payment, and protection costs expanded exchange, while the same networks moved beliefs, technologies, crops, and pathogens.`
- Prompt: `Compare at least two networks: which mechanisms produced growth in both, and which consequences depended on geography or political control?`
- Takeaways:
  1. `Mongol protection and commercial instruments reduced risk across land routes.`
  2. `Monsoon knowledge, larger ships, and port states increased the volume and predictability of maritime exchange.`
  3. `Greater connectivity produced cultural synthesis and economic growth, but also disease transmission and environmental strain.`

Both cards are canonical, deeply immutable records. They remain outside location records, map events, relationship graphs, filters, and study-point counts.

## Data Modules and Public APIs

Create `data/apwh-u2-location-study.js`, publishing a locked `APWH_U2_LOCATION_STUDY` browser global. Its external shape matches the Unit 1 API and adds explicit unit identity metadata needed by generic selection:

- `unitId: 'u2'`;
- `unitNumber: 2`;
- `locationNumbers`;
- `locationName(number)`;
- `getByLocation(number)`;
- `getById(id)`;
- `getUnitCard(kind)`;
- `compareRecords`;
- immutable `records`;
- immutable `unitCards`.

Unknown IDs, locations, or unit-card kinds return `null` or an empty defensive array according to the existing Unit 1 convention. Lookups must reject inherited object keys.

Migrate Unit 1 to publish `unitId: 'u1'` and `unitNumber: 1`. Add the exact English `role` field to both Unit 1 cards and validate it. The generalized renderer reads `card.role`; it must not derive a Unit label by parsing IDs or retaining a hard-coded `Unit 1` branch.

## Active-Unit Selection and Data Flow

Both rendering surfaces use a unit-keyed study API lookup:

1. read the currently selected APWH Unit;
2. resolve `u1` to `APWH_U1_LOCATION_STUDY` or `u2` to `APWH_U2_LOCATION_STUDY`;
3. show the location-study entry only when the active API owns the selected location;
4. render Context, three chronological study points, and Synthesis from that API;
5. expose no location-study entry for Unit 3–9 in this release.

The homepage mirror must read the same active-unit API from the map iframe rather than assuming Unit 1. Standalone and homepage surfaces must render identical data, order, role labels, Exam Skills, and disclosure content.

Changing the active Unit clears location-study view state, expanded event state, and focus-return references that belong to the previous Unit. It must not clear unrelated map filters or alter the selected Unit. Switching `u1 → u2 → u1` must never show stale cards, stale study events, or an old Unit's count.

## Information Architecture and Interaction

Every approved Unit 2 location displays exactly:

1. the canonical Unit 2 Context Card;
2. three chronological location study points;
3. the canonical Unit 2 Synthesis Card.

The header says `3 study points`. Context and Synthesis are collapsed by default and do not increase this count. Their role, title, summary, and Exam Skills remain visible while collapsed. Opening either card reveals its prompt and exactly three takeaways.

Exam Skills appear in every expanded ordinary event after Topics and Themes and before the title. Unit cards continue to use native `details` and `summary`, a minimum `44px` target, visible focus, and DOM-local disclosure state. Opening a card must not mutate map, timeline, filter, relationship, route, or expanded-event state.

## Connection Design

The Unit 2 relationship graph reinforces the Network Spine without turning every record into a dense web.

- Use causal links for mechanisms that genuinely produce or enable another study point.
- Use related links for comparison, parallel adaptation, or shared network consequences.
- Give each study point at least one meaningful connection and concise explanatory note.
- Keep targets within Unit 2 for this release; cross-unit handoff remains the responsibility of the existing causal-chain system.
- Store each connection once in authored setup and publish reciprocal category arrays and matching notes.
- Reject missing endpoints, self-links, duplicates, cross-category target reuse, nonreciprocity, missing notes, and note disagreement.

Expected high-value relationships include Mongol conquest to protected trade, protected trade to expanded merchant infrastructure, monsoon technology to Malacca's port power, port traffic to merchant diasporas, Kilwa commerce to cultural synthesis, trans-Saharan trade to Mansa Musa's display, network connectivity to plague transmission, and treasure-fleet capacity to Zheng He's voyages and later retrenchment.

## Source Ledger

Create `docs/data-sources/apwh-u2-location-study-source-ledger.md`.

For every stable study-point ID, record:

- the exact AMSCO AP World History Unit 2 topic locator;
- the existing `world-event-<location>-<index>` key used by the map;
- the specific claims supported by the locator;
- any existing Unit 2 causal-chain evidence reused to author the record.

Use edition-neutral Unit and Topic locators, matching the Unit 1 ledger pattern. Do not introduce a source URL or page number that the repository cannot reproduce. The module validates source structure; tests lock the ledger's complete ID coverage.

## Visual and Responsive Design

Reuse the approved Unit 1 components and palette:

- Context uses the restrained blue accent.
- Synthesis uses terracotta.
- Exam Skills use the neutral teal treatment.
- long titles, summaries, prompts, takeaways, terms, and evidence wrap instead of creating narrow internal columns;
- no Unit 2-specific fixed width is introduced;
- no global frame or map/detail ratio is changed.

The component is tested at three points within the existing widened right-panel range:

- `380px`: narrow boundary;
- `410px`: typical current width;
- `430px`: wide boundary.

These are validation widths for the same responsive panel, not three different layouts or a request to reset the panel to `380px`.

## Validation and Error Handling

Validate the full authored dataset before publishing it.

- Exactly six approved location numbers exist.
- Exactly eighteen records exist and each approved location owns exactly three.
- IDs are unique, stable, and Unit 2-prefixed.
- Location names, topic codes, theme IDs, main-event keys, dates, arrays, and source structures are valid.
- Every learner-facing nested string is non-empty and English-only.
- Exam Skills obey the exact vocabulary and cardinality rules.
- Both cards exist exactly once, have unique IDs and exact kinds, expose role labels, and contain exactly three takeaways.
- Connection graphs are resolved, reciprocal, uniquely categorized, and fully noted.
- All nested records, arrays, people, terms, evidence, connections, sources, and unit cards are deeply immutable.

Throw descriptive initialization errors naming the offending record or card and violated rule. Runtime renderers must escape every authored string and throw a focused error if the active Unit API lacks a required card.

## Verification

### Data tests

- Lock the exact eighteen-record manifest, location distribution, titles, dates, topics, themes, Exam Skills, sources, and study-point schema.
- Lock the exact Unit 2 card copy and role labels.
- Prove English-only nested content and deep immutability.
- Prove defensive arrays and own-property-safe lookups.
- Reject malformed locations, IDs, dates, topics, themes, skills, cards, sources, and connections with descriptive messages.
- Prove the source ledger covers every and only Unit 2 study-point ID.
- Preserve every existing Unit 1 test while adding exact Unit 1 unit metadata and role expectations.

### Browser verification

- Select Unit 2 and open all six approved anchors in the standalone map and homepage mirror.
- At every anchor, assert exactly two unit cards, exactly three study events, exact bookend order, and the `3 study points` header.
- Verify exact card role, title, summary, skills, prompt, and takeaway content in both surfaces.
- Verify at least one representative event at every anchor and the complete eighteen-event manifest across the six views.
- Verify exact Exam Skills for a representative event in both surfaces.
- Exercise Context and Synthesis with native keyboard activation and state-isolation snapshots.
- At `380px`, `410px`, and `430px`, expand long Unit 2 content and prove effective width plus absence of horizontal overflow.
- Switch `u1 → u2 → u1` and prove cards, event IDs, location counts, focus targets, and expanded state belong only to the current Unit.
- Select Unit 3 and prove no Unit 1 or Unit 2 location-study entry or card remains.
- Run all existing Unit 1, APUSH, map, timeline, causal-chain, and frame-layout checks unchanged.

## Acceptance Criteria

The feature is complete when a learner can select Unit 2, open any of the six approved locations, and study a consistent five-item sequence of Context, three chronological events, and Synthesis in either APWH surface. Every event exposes useful historical-thinking skills and full English study detail. Unit switching is clean, Unit 1 remains intact, Unit 3–9 remain unaffected, and expanded Unit 2 content stays readable across the already widened `380–430px` detail-panel range without changing the global frame.
