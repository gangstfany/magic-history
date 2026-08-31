# APWH Unit 3 Comparative Empire Study Design

## Goal

Extend the approved APWH Unit 1 and Unit 2 location-study experience to Unit 3. Unit 3 receives six empire anchors, eighteen English study points, historical-thinking Exam Skills, one unit-wide Context Card, and one unit-wide Synthesis Card. The learner should understand land-based empire building through a consistent comparative matrix: expansion, administration, and legitimation or conflict.

The feature must use the already widened APWH frame and remain readable throughout the existing `380–430px` right-panel range. It must not narrow, widen, or otherwise alter the global frame.

## Approved Decisions

- Build the full Unit 3 experience, not a cards-only release.
- Use the `Comparative Empire Matrix` organization.
- Use exactly six learner-facing empire labels: Ottoman, Safavid, Mughal, Russia, Ming/Qing, and Tokugawa.
- Anchor them at Istanbul, Isfahan, Delhi, St. Petersburg, Beijing, and Edo/Tokyo respectively.
- Publish exactly three location study points at every anchor, for eighteen study points total.
- Organize every empire through the same lenses: `Expansion`, `Administration`, and `Legitimation & Conflict`.
- Treat Ming/Qing as one explicit continuity-and-change case rather than a Qing-only profile.
- Reuse one canonical Context Card and one canonical Synthesis Card at every Unit 3 anchor.
- End the Synthesis Card with an explicit conceptual handoff to Unit 4, Transoceanic Interconnections.
- Keep all learner-facing study content in English.
- Preserve the already widened outer frame and validate the component at `380px`, `410px`, and `430px` CSS widths.

## Learning Architecture

Each empire follows the same three-part reasoning sequence:

1. military technology, political opportunity, or frontier institutions enable territorial expansion;
2. rulers convert conquest into recurring revenue through officials, military households, local intermediaries, or controlled elites;
3. rulers use religion, social hierarchy, ritual, and monumental culture to justify authority, while those same choices can sharpen conflict.

The repeated lenses make Comparison visible without flattening regional difference. Ottoman devshirme is not treated as interchangeable with Mughal mansabdars, Qing civil-service continuity, Tokugawa daimyo control, Safavid ghulams, or Russia's service nobility. The learner compares the political problem each institution solved, the mechanism it used, and the consequences it produced.

The unit-level arc ends by distinguishing continental strength from maritime capacity. Dependence on land revenue, court politics, and large territorial armies helped these states dominate connected land regions, but often limited sustained investment in the oceanic systems that become central in Unit 4.

## Scope

- Add a dedicated immutable Unit 3 location-study data module.
- Add exactly eighteen complete Unit 3 study records across the six approved anchors.
- Add one or two approved Exam Skills to every Unit 3 record.
- Add exactly one canonical Unit 3 Context Card and one canonical Unit 3 Synthesis Card.
- Render the Unit 3 cards and records in both the standalone APWH map and the homepage mirror.
- Extend the existing unit-keyed study lookup from Unit 1–2 to Unit 1–3 without creating a Unit 3-only renderer.
- Add a Unit 3 source ledger that binds every study point to an edition-neutral AMSCO Unit 3 topic locator and an existing map event key.
- Add exact data, interaction, responsive, switching, and regression verification.

## Non-goals

- Do not add Unit 4–9 location-study content.
- Do not add map pins, move coordinates, rename existing map locations, or alter timeline event datasets.
- Do not change existing Unit 3 causal-chain content.
- Do not add SAQ, LEQ, or DBQ format badges. Exam Skills remain historical-thinking skills.
- Do not add unit cards to map-event counts, filters, relationship graphs, timelines, or source panels.
- Do not duplicate a Unit 3 renderer or create Unit 3-specific copies of the existing card styles.
- Do not change the global frame width, map/detail ratio, or approved right-panel behavior.
- Do not imply that Ivan IV's expansion occurred in St. Petersburg, which did not yet exist; the Russia anchor represents the imperial state, and learner copy must state the chronology honestly.

## Anchor and Study-Point Manifest

The manifest below is canonical. Rows display in the approved lens order, not simply by start year. Every record uses a stable ID beginning with `apwh-u3-`, an integer `sequence` from 1 through 3 within its location, the stated topic codes, the stated themes, and the exact Exam Skills assignment.

| Location | Empire | Lens | Study point | Date | Topics | Themes | Exam Skills | Main event |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Istanbul (`18`) | Ottoman | Expansion | `Cannon Conquest of Constantinople` | `1453` | 3.1, 3.4 | TEC, GOV | Causation, Contextualization | `world-event-18-3` |
| Istanbul (`18`) | Ottoman | Administration | `Devshirme and the Janissary System` | `c. 1450–1600` | 3.2, 3.4 | GOV, SIO | Causation, Comparison | `world-event-18-3` |
| Istanbul (`18`) | Ottoman | Legitimation & Conflict | `Sunni Rule, the Millet System, and Imperial Architecture` | `1453–1750` | 3.3, 3.4 | CDI, GOV | Comparison, CCOT | `world-event-18-3` |
| Isfahan (`19`) | Safavid | Expansion | `Ismail I and Qizilbash Conquest` | `1501–1514` | 3.1, 3.4 | GOV, TEC | Causation, Contextualization | `world-event-19-0` |
| Isfahan (`19`) | Safavid | Administration | `Shah Abbas, Ghulams, and Centralization` | `1588–1629` | 3.2, 3.4 | GOV, SIO | Causation, Comparison | `world-event-19-0` |
| Isfahan (`19`) | Safavid | Legitimation & Conflict | `Twelver Shi'ism and Ottoman Rivalry` | `1501–1722` | 3.3, 3.4 | CDI, GOV | Comparison, CCOT | `world-event-19-0` |
| Delhi (`6`) | Mughal | Expansion | `Babur, Gunpowder, and Panipat` | `1526` | 3.1, 3.4 | TEC, GOV | Causation, Contextualization | `world-event-6-1` |
| Delhi (`6`) | Mughal | Administration | `Akbar's Mansabdars and Zamindars` | `1556–1605` | 3.2, 3.4 | GOV, ECN | Causation, Comparison | `world-event-6-1` |
| Delhi (`6`) | Mughal | Legitimation & Conflict | `From Akbar's Tolerance to Aurangzeb's Orthodoxy` | `1556–1707` | 3.3, 3.4 | CDI, GOV | CCOT, Causation | `world-event-6-1` |
| St. Petersburg (`25`) | Russia | Expansion | `Ivan IV, Cossacks, and Siberian Expansion` | `1547–1639` | 3.1, 3.4 | GOV, ENV | Causation, Contextualization | `world-event-25-0` |
| St. Petersburg (`25`) | Russia | Administration | `Peter the Great and the Table of Ranks` | `1682–1725` | 3.2, 3.4 | GOV, SIO | CCOT, Causation | `world-event-25-0` |
| St. Petersburg (`25`) | Russia | Legitimation & Conflict | `Orthodox Tsardom, Boyar Control, and a New Capital` | `1547–1725` | 3.3, 3.4 | CDI, GOV | CCOT, Contextualization | `world-event-25-0` |
| Beijing (`5`) | Ming/Qing | Expansion | `From Ming Restoration to Qing Expansion` | `1368–1757` | 3.1, 3.4 | GOV, ENV | CCOT, Causation | `world-event-5-0` |
| Beijing (`5`) | Ming/Qing | Administration | `Civil-Service Continuity under Ming and Qing` | `1368–1750` | 3.2, 3.4 | GOV, SIO | CCOT, Comparison | `world-event-5-0` |
| Beijing (`5`) | Ming/Qing | Legitimation & Conflict | `Manchu Rule, Confucian Legitimacy, and Ethnic Hierarchy` | `1644–1750` | 3.3, 3.4 | CDI, SIO | Comparison, Contextualization | `world-event-5-0` |
| Edo/Tokyo (`14`) | Tokugawa | Expansion | `Firearms and the Unification of Japan` | `1560–1600` | 3.1, 3.4 | TEC, GOV | Causation, Contextualization | `world-event-14-0` |
| Edo/Tokyo (`14`) | Tokugawa | Administration | `Sankin-kotai and Daimyo Control` | `1635–1750` | 3.2, 3.4 | GOV, ECN | Causation, Comparison | `world-event-14-0` |
| Edo/Tokyo (`14`) | Tokugawa | Legitimation & Conflict | `Neo-Confucian Order, Sakoku, and Social Hierarchy` | `1603–1750` | 3.3, 3.4 | SIO, CDI | CCOT, Comparison | `world-event-14-0` |

## Complete Study-Point Contract

Every Unit 3 study point uses the complete learner-facing contract established by Unit 1 and Unit 2:

- stable ID, location number, empire label, lens, and display sequence;
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

The `empire` and `lens` fields are authored data and exact validated vocabulary. The existing single-line study-point eyebrow renders them as `{EMPIRE} · {LENS}`; they must not create a new row, side column, or duplicated card section. The renderer must never derive them from IDs or titles.

Claims must remain geographically and chronologically honest. The Russia records must explain that Ivan IV's expansion began from Moscow before Peter founded St. Petersburg in 1703. The Ming/Qing records must identify which dynasty performed an action and may not describe a shared continuity as if both dynasties used identical policies in every respect. Edo/Tokyo represents the Tokugawa political center; unification evidence may refer to developments elsewhere in Japan while naming that distinction.

## Exam Skills Vocabulary

Use exactly the existing vocabulary:

- `Causation`
- `Comparison`
- `CCOT`
- `Contextualization`

Every event and unit card has one or two unique values. Validation rejects missing, invalid, duplicated, or oversized arrays. Assignment order is learner-facing and therefore exact.

## Unit 3 Context Card

- ID: `apwh-u3-context-conditions-land-empire-building`
- Kind: `context`
- Role: `Unit 3 Context Card`
- Title: `Conditions for Land-Based Empire Building`
- Skills: `Contextualization`, `Causation`
- Summary: `By c. 1450, gunpowder weapons, post-Mongol political openings, agrarian revenue systems, and inherited administrative traditions gave ambitious rulers the means to conquer large territories—and the institutions needed to govern them.`
- Prompt: `As you study Unit 3, distinguish the conditions rulers inherited from the new military and political changes that made rapid expansion possible.`
- Takeaways:
  1. `Gunpowder and artillery reduced the defensive advantage of walls and helped rulers accelerate territorial conquest.`
  2. `The fragmentation or weakness of earlier states created political openings for ambitious dynasties and military coalitions.`
  3. `Existing agrarian taxes, religious institutions, and administrative traditions gave conquerors tools for turning territory into recurring revenue.`

## Unit 3 Synthesis Card

- ID: `apwh-u3-synthesis-expansion-limits-land-power`
- Kind: `synthesis`
- Role: `Unit 3 Synthesis Card`
- Title: `How Land Empires Expanded—and Where Their Power Stopped`
- Skills: `Comparison`, `CCOT`
- Summary: `From c. 1450 to 1750, land empires used comparable military, administrative, and legitimating strategies, but regional institutions shaped their results and their ability to compete in an increasingly oceanic world.`
- Prompt: `Compare two empires across expansion, administration, and legitimation. Which land-based strength could become a constraint as transoceanic networks expanded in Unit 4?`
- Takeaways:
  1. `Gunpowder conquest and frontier warfare created multiethnic territories faster than armies alone could govern them.`
  2. `Controlled officials, military elites, and local intermediaries converted conquest into taxes, while religion and monumental culture justified authority.`
  3. `Reliance on land revenue, court politics, and continental armies could limit sustained maritime investment as transoceanic trade networks grew.`

Both cards are canonical, deeply immutable records. They remain outside location records, map events, relationship graphs, filters, and study-point counts.

## Data Module and Public API

Create `data/apwh-u3-location-study.js`, publishing a locked `APWH_U3_LOCATION_STUDY` browser global. Its external shape matches the current Unit 1 and Unit 2 API:

- `unitId: 'u3'`;
- `unitNumber: 3`;
- `locationNumbers`;
- `locationName(number)`;
- `getByLocation(number)`;
- `getById(id)`;
- `getUnitCard(kind)`;
- `compareRecords`;
- immutable `records`;
- immutable `unitCards`.

Unknown IDs, locations, or unit-card kinds return `null` or an empty defensive array according to the existing convention. Lookups must reject inherited object keys.

Both rendering surfaces extend their unit-keyed API map with `u3: APWH_U3_LOCATION_STUDY`. No conditional Unit 3 renderer, duplicate template, or copied CSS is permitted. Unit 1 and Unit 2 APIs and data remain unchanged unless a minimal generic compatibility correction is required and covered by regression tests.

## Active-Unit Selection and Data Flow

Both rendering surfaces follow the current generic flow:

1. read the selected APWH Unit;
2. resolve `u1`, `u2`, or `u3` to its matching location-study API;
3. show the location-study entry only when the active API owns the selected location;
4. render Context, three study points in lens sequence, and Synthesis from that API;
5. expose no location-study entry for Unit 4–9 in this release.

The homepage mirror reads the same active-unit API from the map iframe. Standalone and homepage surfaces render identical data, order, role labels, Exam Skills, and disclosure content.

Changing the active Unit clears location-study state, expanded-event state, and focus-return references belonging to the prior Unit. Switching `u2 → u3 → u2 → u4` must never show stale cards, stale study events, old counts, or a previous Unit's focus target. Selecting Unit 4 must expose no location-study entry.

## Information Architecture and Interaction

Every approved Unit 3 location displays exactly:

1. the canonical Unit 3 Context Card;
2. the Expansion study point;
3. the Administration study point;
4. the Legitimation & Conflict study point;
5. the canonical Unit 3 Synthesis Card.

The header says `3 study points`. Context and Synthesis are collapsed by default and do not increase this count. Their role, title, summary, and Exam Skills remain visible while collapsed. Opening either card reveals its prompt and exactly three takeaways.

Only one ordinary study event is expanded at a time, matching the existing interaction. Exam Skills appear after Topics and Themes and before the title. Back navigation restores disclosure state, focus, and scroll according to the existing Unit 1–2 behavior. Unit cards use native `details` and `summary`, a minimum `44px` target, visible focus, and DOM-local disclosure state.

The ordinary-card eyebrow uses the exact empire and lens values, for example `OTTOMAN · ADMINISTRATION`. It occupies the existing eyebrow position so the comparative orientation is visible without consuming horizontal content width.

## Connection Design

The Unit 3 graph separates real causation from analytical comparison.

### Within each empire

- Use causal links from Expansion to Administration when new territory creates a governance problem.
- Use causal links from Administration to Legitimation & Conflict when institutions shape social, political, or religious outcomes.
- Provide a reciprocal effect link and matching explanatory note for every authored cause.

### Across empires

Use related links, not causal links, for comparable responses to a shared imperial problem. High-value comparisons include:

- Ottoman and Safavid expansion and their direct geopolitical rivalry;
- Safavid and Mughal religious policy;
- Russia and Ming/Qing frontier incorporation;
- Ottoman and Tokugawa control of military elites;
- Ming/Qing and Tokugawa uses of Confucian social hierarchy;
- administrative comparison among Ottoman devshirme, Safavid ghulams, Mughal mansabdars, Russia's service nobility, Ming/Qing civil service, and Tokugawa daimyo controls.

Every record receives at least one meaningful connection and a concise learner-facing note. Targets remain inside Unit 3. Store authored links once and publish reciprocal category arrays and matching notes. Validation rejects missing endpoints, self-links, duplicates, cross-category reuse, nonreciprocity, missing notes, and note disagreement.

## Source Ledger

Create `docs/data-sources/apwh-u3-location-study-source-ledger.md`.

For every stable study-point ID, record:

- the exact edition-neutral AMSCO AP World History Unit 3 topic locator;
- the existing `world-event-<location>-<index>` key used by the map;
- the specific claims supported by the locator;
- any existing Unit 3 causal-chain evidence reused to author the record.

Do not introduce a source URL or page number the repository cannot reproduce. The module validates source structure; tests lock the ledger's complete and exact ID coverage.

## Visual and Responsive Design

Reuse the approved Unit 1–2 components and palette:

- Context uses the restrained blue accent.
- Synthesis uses terracotta.
- Exam Skills use the neutral teal treatment.
- long empire labels, lens labels, titles, summaries, prompts, takeaways, terms, and evidence wrap without creating narrow internal columns;
- no Unit 3-specific fixed width is introduced;
- no global frame, map/detail ratio, or right-panel width is changed.

Validate the same responsive panel at:

- `380px`: narrow boundary;
- `410px`: typical current width;
- `430px`: wide boundary.

These are test points within the already widened right-panel range, not three layouts and not width values to apply to the global frame.

## Validation and Error Handling

Validate the complete authored dataset before publishing it.

- Exactly six approved location numbers and empire labels exist.
- Exactly eighteen records exist and each approved location owns exactly three.
- Each location has exactly one record for each exact lens value: `Expansion`, `Administration`, and `Legitimation & Conflict`.
- Every location uses sequences 1, 2, and 3 exactly once.
- IDs are unique, stable, and Unit 3-prefixed.
- Location names, topic codes, theme IDs, main-event keys, dates, arrays, source structures, empire labels, and lenses are valid.
- Every learner-facing nested string is nonempty and English-only.
- Exam Skills obey the exact vocabulary and cardinality rules.
- Both cards exist exactly once, have unique IDs and exact kinds, expose role labels, and contain exactly three takeaways.
- Connection graphs are resolved, reciprocal, uniquely categorized, and fully noted.
- All nested records, arrays, people, terms, evidence, connections, sources, and unit cards are deeply immutable.

Throw descriptive initialization errors naming the offending record or card and violated rule. Runtime renderers escape every authored string and throw a focused error if the active Unit API lacks a required card.

## Verification

### Data tests

- Lock the exact eighteen-record manifest, six empire labels, three-lens distribution, display order, titles, dates, topics, themes, Exam Skills, main-event keys, and sources.
- Lock the exact Unit 3 card copy and role labels.
- Prove English-only nested content and deep immutability.
- Prove defensive arrays and own-property-safe lookups.
- Reject malformed locations, empires, lenses, sequences, IDs, dates, topics, themes, skills, cards, sources, and connections with descriptive messages.
- Prove the source ledger covers every and only Unit 3 study-point ID.
- Preserve all existing Unit 1 and Unit 2 tests.

### Browser verification

- Select Unit 3 and open all six approved anchors in the standalone map and homepage mirror.
- At every anchor, assert exactly two unit cards, exactly three study events, exact bookend order, exact lens order, and the `3 study points` header.
- Verify exact card role, title, summary, skills, prompt, and takeaway content in both surfaces.
- Verify at least one representative event at every anchor and the full eighteen-event manifest across the six views.
- Verify exact Exam Skills for representative records in both surfaces.
- Exercise Context and Synthesis with native keyboard activation and state-isolation snapshots.
- Exercise ordinary event expansion, one-at-a-time behavior, Back restoration, focus return, and scroll restoration.
- At `380px`, `410px`, and `430px`, expand the longest Unit 3 content and prove effective width plus absence of horizontal overflow.
- Switch `u2 → u3 → u2 → u4` and prove cards, event IDs, location counts, focus targets, and expanded state belong only to the active Unit.
- Run all existing Unit 1, Unit 2, APUSH, map, timeline, causal-chain, and frame-layout checks unchanged.

## Acceptance Criteria

The feature is complete when a learner can select Unit 3, open any of the six approved empire anchors, and study a consistent five-item sequence of Context, Expansion, Administration, Legitimation & Conflict, and Synthesis in either APWH surface. Every event exposes useful historical-thinking skills and complete English study detail. The repeated matrix makes comparison easy while preserving regional distinctions, Ming/Qing visibly supports continuity-and-change reasoning, and the Synthesis Card hands the learner into Unit 4. Unit switching is clean, Unit 1–2 remain intact, Unit 4–9 remain unaffected, and expanded Unit 3 content stays readable across the already widened `380–430px` detail-panel range without changing the global frame.
