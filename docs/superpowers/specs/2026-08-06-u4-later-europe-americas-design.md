# AP Art History U4 Later Europe and Americas Design

Date: 2026-08-06

## Objective

Extend the verified AP Art History interactive map from Units 1-3 to the complete College Board Unit 4 dataset: AP #99-152, 54 works.

The delivery must preserve the approved World History-aligned typography, English-title/Chinese-subtitle hierarchy, AP-number markers, map hierarchy, contained media, four study tabs, comparison workflow, accessibility behavior, standalone and embedded layouts, and every verified U1-U3 record. `world-map.html` must remain unchanged.

## Confirmed Product Decisions

- Import all 54 U4 works in one complete delivery.
- Use the manifest-first workflow that succeeded for U3: official manifest, source and rights ledger, bilingual content, live import, strict verification.
- Complete every U4 record in bilingual form. English remains the primary title; Chinese remains the subtitle and the main language for study copy.
- Include every College Board-required image, page, component, architectural view, installation view, or series view rather than limiting each work to one image.
- Treat the timeline idea as a separate project. U4 introduces no timeline markup, state, controls, or filtering behavior.
- Preserve U1-U3 field-for-field and protect all 98 existing works with preservation fixtures.
- Develop U4 on an isolated branch based on the verified U3 delivery.
- Sync the verified result to the Desktop project for user review. Push to GitHub only after explicit user approval.

## Official U4 Scope

Unit 4 is `Later Europe and Americas, 1750-1980 CE` and contains AP #99-152 exactly once.

The implementation must create a dedicated machine-readable U4 manifest. Before live artwork records are accepted, the manifest freezes each AP number, stable id, official English title, creation-context region, creation-context site, provenance qualifier when needed, and ordered required-view ids.

The U4 work sequence is:

| AP # | Work |
| ---: | --- |
| 99 | Portrait of Sor Juana Inés de la Cruz |
| 100 | A Philosopher Giving a Lecture on the Orrery |
| 101 | The Swing |
| 102 | Monticello |
| 103 | The Oath of the Horatii |
| 104 | George Washington |
| 105 | Self-Portrait |
| 106 | Y no hai remedio (And There's Nothing to Be Done), from Los Desastres de la Guerra (The Disasters of War), plate 15 |
| 107 | La Grande Odalisque |
| 108 | Liberty Leading the People |
| 109 | View from Mount Holyoke, Northampton, Massachusetts, after a Thunderstorm - The Oxbow |
| 110 | Still Life in Studio |
| 111 | Slave Ship (Slavers Throwing Overboard the Dead and Dying, Typhoon Coming On) |
| 112 | Palace of Westminster (Houses of Parliament) |
| 113 | The Stone Breakers |
| 114 | Nadar Raising Photography to the Height of Art |
| 115 | Olympia |
| 116 | The Saint-Lazare Station |
| 117 | The Horse in Motion |
| 118 | The Valley of Mexico from the Hillside of Santa Isabel |
| 119 | The Burghers of Calais |
| 120 | The Starry Night |
| 121 | The Coiffure |
| 122 | The Scream |
| 123 | Where Do We Come From? What Are We? Where Are We Going? |
| 124 | Carson, Pirie, Scott and Company Building |
| 125 | Mont Sainte-Victoire |
| 126 | Les Demoiselles d'Avignon |
| 127 | The Steerage |
| 128 | The Kiss (Gustav Klimt) |
| 129 | The Kiss (Constantin Brancusi) |
| 130 | The Portuguese |
| 131 | The Goldfish |
| 132 | Improvisation 28 (second version) |
| 133 | Self-Portrait as a Soldier |
| 134 | Memorial Sheet of Karl Liebknecht |
| 135 | Villa Savoye |
| 136 | Composition with Red, Blue and Yellow |
| 137 | Illustration from The Results of the First Five-Year Plan |
| 138 | Object (Le Déjeuner en fourrure) |
| 139 | Fallingwater |
| 140 | The Two Fridas |
| 141 | The Migration of the Negro, Panel no. 49 |
| 142 | The Jungle |
| 143 | Dream of a Sunday Afternoon in the Alameda Central Park |
| 144 | Fountain |
| 145 | Woman, I |
| 146 | Marilyn Diptych |
| 147 | Seagram Building |
| 148 | Narcissus Garden |
| 149 | The Bay |
| 150 | Lipstick (Ascending) on Caterpillar Tracks |
| 151 | Spiral Jetty |
| 152 | House in New Castle County |

The machine-readable manifest, rather than this display table, is the release authority for exact College Board punctuation, capitalization, alternate titles, and ordered view ids.

## Source Policy

Identification and study-content priority:

1. Current College Board AP Art History Course and Exam Description
2. The user's `APAH notes.pdf`
3. The user's `Smarthistory guide to AP Art History, volume three: 99-152`
4. Owning monument, museum, archive, library, foundation, artist estate, or other authoritative institution
5. Smarthistory or another scholarly educational source

Image priority:

1. Owning institution or authoritative site with a stable public image
2. Wikimedia Commons file page with verified identity and a traceable license or rights statement

Search-result pages, anonymous image hosts, uncredited thumbnails, generic collection pages, and images that do not show the required object or component are not acceptable.

The source ledger contains one row per media view, not one row per artwork. Each row records the AP number, stable work id, ordered view id, concise English label, direct image URL, specific alt text, human-readable source page, source institution or creator, and rights or license statement. Live image metadata must project exactly from the reviewed ledger.

## Region and Creation-Context Architecture

U4 continues the existing hierarchy:

`Unit -> Region -> Creation site -> AP work`

The approved U4 region vocabulary is:

1. `france` / `France`
2. `britishIsles` / `British Isles`
3. `southernEurope` / `Southern Europe`
4. `centralNorthernEurope` / `Central & Northern Europe`
5. `russiaSoviet` / `Russia & Soviet Union`
6. `unitedStates` / `United States`
7. `mexicoCaribbean` / `Mexico & Caribbean`
8. `pacific` / `Pacific`
9. `transatlantic` / `Transatlantic`

The reviewed U4 manifest must assign every work to exactly one of these regions and must freeze the resulting exact region counts before live import. The validator derives its expected totals from the reviewed manifest and rejects unknown, missing, or mismatched region assignments.

Portable works map to their best-supported place of creation or original creation context, not the artist's nationality or current museum. Architecture and site-specific installations map to the work's physical site. Works created in an oceanic or moving context use the reviewed Pacific or Transatlantic group plus a precise qualifier instead of inventing a city.

Examples:

- *Where Do We Come From? What Are We? Where Are We Going?* maps to its Tahitian creation context.
- *The Steerage* uses a reviewed transatlantic coordinate and a voyage-context qualifier.
- A work created in Paris by a non-French artist maps to France because the map represents creation context, not nationality.

Broad, probable, disputed, or moving creation contexts require an explicit provenance qualifier. Current collection locations may appear in media credits and source links but may not replace the creation-context map site.

## Movement Filters and Precise Metadata

The U4 filter row contains five visible capsules:

1. `All movements`
2. `Enlightenment & Revolution`
3. `Realism, Industry & Photography`
4. `Post-Impressionism & Early Modernism`
5. `Avant-Garde, Architecture & Postwar`

These are broad navigation groups, not substitutes for precise scholarship. Every record retains a reviewed precise movement, period, cultural attribution, and searchable terminology. Examples include Colonial Mexican, Rococo, Neoclassicism, Romanticism, Realism, Impressionism, Symbolism, Post-Impressionism, Expressionism, Cubism, Constructivism, De Stijl, Surrealism, International Style, Mexican Modernism, Harlem Renaissance, Abstract Expressionism, Pop Art, installation art, Land Art, and Postmodern architecture.

The machine-readable U4 manifest freezes the broad movement group for every AP number before live import. Each group must contain at least one work. Search matches both broad groups and precise English and Chinese metadata.

Changing Unit resets incompatible movement, period, and work-type filters. Period and type options regenerate from the active Unit. Clearing filters restores the U4 overview transform.

## Detail Panel and Bilingual Study Content

Every U4 work uses the approved detail hierarchy:

1. Official English title as the large heading
2. Reviewed Chinese title as the smaller subtitle
3. AP number, precise movement, period, and date metadata
4. Contained primary media area with an optional ordered view switcher
5. Four study tabs using the existing Chinese labels: Overview, Form, Context, and Compare

Every record includes:

- Stable id and official AP number
- Unit, region, broad movement group, and precise movement
- Official English title and reviewed Chinese title
- Artist, architect, photographer, workshop, culture, or attribution statement
- Creation-context site and optional provenance qualifier
- Reviewed map coordinates
- Date, medium, work type, and function
- Chinese form, content, and context study copy with necessary English terminology preserved
- Two to four concise recognition anchors
- Comparison ids and comparison notes
- Reviewed English and Chinese search keywords
- Audited media metadata

Chinese text must be concise, exam-oriented, and consistent with U1-U3 terminology. Uncertain attribution, disputed interpretation, colonial identity, race, gender, class, political ideology, and provenance must be described with appropriate scholarly caution rather than as unqualified fact.

## Media and Required-View Contract

U4 reuses the existing `getArtworkImages(work)` interface and accessible image-view switcher.

- A normal single-view work has exactly one audited image item.
- A composite work has an ordered `images` array.
- College Board-required images define the minimum and exact release view set.
- Architecture includes every required exterior, interior, plan, elevation, structural, or significant-space view.
- Series, installations, and site works include every separately required panel, state, component, environmental view, or documentary view.
- Supplemental decorative images not required for identification or official coverage are excluded.

Changing views updates the displayed image, alt text, credit, source link, pressed state, and modal content together. The image dialog opens only the active view and restores focus to the trigger after closing.

Every image uses `object-fit: contain`. No image may crop a head, body, canvas edge, photographic frame, architectural plan, structural boundary, installation environment, or required component.

## Comparison Design

Every U4 work receives at least one defensible comparison target with an explicit basis. Comparisons may connect:

- Works within the same U4 movement or medium
- Different U4 movements, regions, or political contexts
- U4 works to U1-U3 when the formal, material, functional, religious, political, colonial, or social relationship is useful

Cross-Unit navigation clears incompatible filters, selects the target, updates the detail panel, and moves focus to the target title. It must preserve a usable back-and-forth study flow.

Comparison notes must name the relationship rather than merely state that the works are similar or different. Suitable bases include revolution and state power, colonial identity, the modern city, industrialization, photography and motion, gendered spectatorship, abstraction, monumentality, architectural modernism, mass media, installation, and landscape intervention.

## Typography, UI, and Page Integration

U4 introduces no independent type scale, font stack, component geometry, or color system. It inherits the exact approved Art History tokens already aligned to World History.

The Unit selector adds:

`U4 · Later Europe and Americas · AP 99-152`

The complete Unit overview displays:

- `U1` / `Global Prehistory · 11 pieces`
- `U2` / `Ancient Mediterranean · 36 pieces`
- `U3` / `Early Europe and Colonial Americas · 51 pieces`
- `U4` / `Later Europe and Americas · 54 pieces`

The standalone title becomes:

`AP 艺术史互动地图 · Units 1-4`

The homepage caption becomes:

`152 AP works · Units 1-4 · filter, compare and study`

The map and detail panel keep their current proportions. The nine U4 region capsules use the existing collision-safe layout engine and connector lines. Dense labels may move away from exact anchors while their connectors retain the reviewed geographic point.

The persistent Art iframe, subject switching, loading protection, iframe sizing, and World History page remain unchanged.

## Error Handling

- Missing, duplicate, out-of-range, or extra U4 AP numbers fail validation.
- U4 fails unless it contains exactly AP #99-152 and exactly 54 works.
- Any U1-U3 field, view, credit, or rendered behavior drift fails preservation testing.
- Unknown or mismatched U4 regions or broad movement groups fail validation.
- Invalid coordinates or broad provenance without a qualifier fail validation.
- Missing, duplicate, unordered, or extra required views fail validation.
- Media without a unique image URL, alt text, source page, credit, and rights statement fail validation.
- Missing study fields, recognition anchors, search terms, or comparison targets fail validation.
- Unresolved comparison ids fail validation.
- Image failures use the existing named accessible fallback without unsafe HTML injection.
- Empty filter results preserve the existing resettable accessible state.
- A failed marker layout keeps the previous complete layer instead of rendering a partial map.

## Accessibility and Responsive Requirements

- All Unit, region, site, and work markers retain button semantics, descriptive accessible names, keyboard activation, and visible focus.
- Region and site transitions move focus to a stable child marker after rerender.
- The five movement capsules remain usable when wrapping at compact widths.
- View buttons expose unique labels and pressed states.
- Dialog labels identify the artwork and active view.
- Reduced-motion preferences remain respected.
- Pan, zoom, reset, filter, search, view switching, and comparison navigation retain non-gesture keyboard alternatives.
- The 375px portrait, 390px portrait, 667x375 embedded landscape, 665px boundary, tablet, and desktop layouts must have no horizontal overflow, clipped controls, or inaccessible detail content.

## Validation and Browser Verification

The strict release pipeline must verify:

- Exact manifests for U1 #1-11, U2 #12-47, U3 #48-98, and U4 #99-152
- Exactly 152 live works in official AP-number order
- Exact preservation of the 98 U1-U3 works and credits
- Exact U4 region and broad movement assignments from the reviewed manifest
- Exact U4 media projection from the source ledger and rights audit
- Complete required-view coverage and order for all composite works
- Unique ids, valid coordinates, qualified broad provenance, resolvable comparisons, and complete bilingual study fields
- Updated Units 1-4 headings, accessibility labels, counts, and homepage copy
- No U4 timeline state, markup, or behavior

The browser verifier must exercise:

- U4 in standalone and embedded modes
- All 54 works and every required media view
- Unit, movement, period, type, AP-number, and bilingual search behavior
- All nine region branches, creation-site expansion, multi-work capsules, and individual AP pins
- Image switching, credits, modal behavior, error fallback, and focus restoration
- All four study tabs
- At least one real U4-to-U1/U2/U3 comparison and return flow
- Required responsive viewports and collision boundaries
- Console error and warning rejection
- Exact image requests and duplicate-request detection
- Negative controls proving that wrong ids, counts, views, sources, credits, warnings, and preservation drift are detected

## Delivery Workflow

1. Start an isolated U4 branch from the verified U3 delivery.
2. Freeze the U4 official manifest, region assignments, creation contexts, broad movement assignments, and required-view ids.
3. Build and review the per-view source ledger and rights audit.
4. Add strict failing U4 tests before adding live records or page behavior.
5. Create all 54 bilingual records, comparisons, media projections, map configuration, filters, headings, accessibility labels, and homepage copy.
6. Run focused U4 tests, full 152-work validation, preservation tests, rendered browser verification, and final quality review.
7. Sync only verified delivery files to the Desktop project using a recoverable backup.
8. Run the release verifier independently against the Desktop copy.
9. Open the final local preview for user review.
10. Push the U4 branch and create or update the GitHub pull request only after explicit user approval.

## Out of Scope

- The proposed timeline or any time-based filtering
- U5-U10 artwork imports
- Redesigning World History
- Changing the current map projection
- Changing the approved Art History typography or component scale
- A general-purpose gallery or carousel
- Current museum locations as primary map pins
- Unverified supplemental works or non-required decorative views
- Publishing or pushing to GitHub before user approval
