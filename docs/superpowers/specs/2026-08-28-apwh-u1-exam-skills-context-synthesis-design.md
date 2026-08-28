# APWH Unit 1 Exam Skills, Context Card, and Synthesis Card Design

## Goal

Add AP historical-thinking skill labels to every existing APWH Unit 1 study point and add one unit-wide Context Card plus one unit-wide Synthesis Card. The cards should strengthen the study sequence without crowding the approved `380–430px` detail panel or changing map, timeline, causal-link, or source behavior.

The learner-facing experience remains English-only.

## Scope

This release applies only to APWH Unit 1.

- Add Exam Skills metadata to all twelve existing Unit 1 study points.
- Add exactly one Context Card and one Synthesis Card to the Unit 1 data API.
- Render the Context Card at the beginning of every Unit 1 location-study list.
- Render the Synthesis Card at the end of every Unit 1 location-study list.
- Mirror the result in the homepage embed and the standalone APWH map.

The two unit cards have one canonical data record each. Rendering them in multiple location views does not duplicate their data or turn them into map events.

## Non-goals

- Do not add Unit 2–9 content in this release.
- Do not add map pins, timeline anchors, causes, effects, related-event links, people, terms, or source panels to the two unit cards.
- Do not change the twelve study-point IDs, locations, chronology, topics, themes, causal graph, evidence, or source bindings.
- Do not add SAQ, LEQ, or DBQ badges. Exam Skills represent historical-thinking skills, not question formats.
- Do not change the approved outer frame or APWH detail-panel width.

## Exam Skills Vocabulary

Use exactly these learner-facing labels:

- `Causation`
- `Comparison`
- `CCOT`
- `Contextualization`

Every Unit 1 study point must carry one or two unique values from this vocabulary. The initial assignment is:

| Study point | Exam Skills |
| --- | --- |
| Song Commercial Revolution | Causation, CCOT |
| Grand Canal and the Hangzhou Market | Causation |
| Paper Money and Maritime Technology | Causation, Comparison |
| Angkor's Hydraulic State | Causation, Comparison |
| Hindu-Buddhist Legitimation at Angkor | Causation, Comparison |
| Delhi Sultanate State Building | Comparison, Causation |
| Bhakti and Sufi Devotional Movements | Comparison, CCOT |
| Abbasid Baghdad as a Knowledge Hub | Causation, CCOT |
| Merchant and Ulema Networks | Causation, Comparison |
| Mali's Gold-Salt Trade and Taxation | Causation |
| Islamic Learning and Griot Tradition | Comparison, CCOT |
| Mansa Musa's Pilgrimage | Causation, Contextualization |

The values are stored as immutable arrays on the canonical study-point records. Validation rejects missing, invalid, duplicated, or oversized skill arrays.

## Unit Card Data Model

Publish the unit cards through the existing `APWH_U1_LOCATION_STUDY` API without adding them to `records` or `getByLocation()`.

Each unit card contains:

- a stable Unit 1 ID;
- `kind`, exactly `context` or `synthesis`;
- an English title;
- a concise English summary used in the collapsed row;
- one or two Exam Skills from the approved vocabulary;
- a short framing prompt;
- two or three English takeaway statements.

The API exposes an immutable `unitCards` object and `getUnitCard(kind)`. Unknown kinds return `null`. Returned canonical objects and their nested arrays are deeply immutable.

### Context Card

- ID: `apwh-u1-context-global-tapestry`
- Title: `The World in c. 1200`
- Skills: `Contextualization`, `Comparison`
- Purpose: establish that regional states used belief systems, taxation, trade, and specialized administration to organize diverse populations before students study individual examples.
- Prompt: guide students to compare the foundations of political authority across regions.

### Synthesis Card

- ID: `apwh-u1-synthesis-state-power`
- Title: `How States Built and Justified Power`
- Skills: `Comparison`, `CCOT`
- Purpose: connect Song China, Dar al-Islam, South and Southeast Asia, and West Africa after students study individual examples.
- Prompt: guide students to form a defensible cross-regional claim using at least two Unit 1 study points.

## Information Architecture

Use the approved bookend sequence in every Unit 1 location-study list:

1. Context Card
2. the location's existing chronological study points
3. Synthesis Card

Context and Synthesis are unit-wide learning tools, so they remain available from Hangzhou, Baghdad, Delhi, Angkor, and Timbuktu. Their summaries and prompts must not imply that they describe only the currently selected location.

The location header continues to count only actual location study points. Context and Synthesis do not increase the `study points` count.

## Interaction Design

The Context and Synthesis rows are compact and collapsed by default. Their title, card role, summary, and Exam Skills remain visible while collapsed.

Opening a unit card reveals its framing prompt and takeaway statements. Use native disclosure semantics or an equivalent keyboard-accessible control with a minimum `44px` target. Opening a unit card does not alter map selection, timeline selection, filters, relationship-navigation history, or the currently expanded study event.

Existing study-event expansion remains unchanged. Exam Skills are added to the expanded event detail header after Topics and Themes and before the event title. A visible `Exam Skills` label distinguishes them from content themes.

## Visual Design

The design must work inside the full approved detail-panel range, not only in the `410px` mock.

- Context uses a restrained blue accent consistent with the current exam-callout color.
- Synthesis uses the existing terracotta accent.
- Exam Skills use one neutral teal treatment across ordinary events and unit cards.
- Skills wrap onto additional lines rather than shrinking text or forcing horizontal scrolling.
- Context and Synthesis remain visually distinct from ordinary event cards without introducing a second navigation system.
- At `380px`, `410px`, and `430px`, all labels and card copy remain readable with no horizontal overflow.

## Rendering Boundaries

The standalone map and homepage embed currently mirror Unit 1 study-detail markup and styles. Both surfaces receive the same data, order, labels, disclosure behavior, and responsive rules.

Implementation should keep unit-card rendering separate from study-event rendering:

- unit-card rendering consumes only `unitCards`;
- event-detail rendering consumes only canonical study-point records;
- shared Exam Skills markup accepts a validated skill array and returns the same tag treatment for either component.

This separation prevents unit-wide cards from acquiring location, timeline, relationship, or source responsibilities.

## Validation and Error Handling

The data module validates before publishing its global API.

- Every study point has one or two valid, unique Exam Skills.
- Both required unit-card kinds exist exactly once.
- Unit-card IDs are unique and distinct from study-point IDs.
- Every unit-card string and takeaway is non-empty and English-only.
- Unit-card skill arrays obey the same vocabulary and cardinality rules as study points.

Invalid authored data throws a descriptive error naming the offending study point or unit card and the violated rule. Runtime rendering continues to escape every authored string.

## Verification

Automated coverage must prove:

- the exact Exam Skills assignment for all twelve existing study points;
- validation rejects missing, invalid, duplicate, and oversized skill arrays;
- both unit cards expose the exact immutable schema and English-only copy;
- defensive access cannot mutate canonical unit cards or Exam Skills;
- every location list orders Context first, chronological study points next, and Synthesis last;
- the location header count remains the real study-point count;
- unit cards start collapsed and expand without changing event, map, timeline, filter, or relationship state;
- Angkor's Hydraulic State renders `Causation` and `Comparison` in both homepage and standalone detail views;
- both surfaces fit without horizontal overflow at `380px`, `410px`, and `430px` component widths;
- all existing Node and browser verification remains green.

## Acceptance Criteria

The Unit 1 feature is complete when a learner can open any Unit 1 location, see the Context and Synthesis bookends without losing the chronological study-point sequence, expand either unit card on demand, and identify the historical-thinking skills attached to every ordinary study point. The layout must remain readable throughout the existing detail-panel width range and must not change any current map, timeline, connection, filter, or source behavior.
