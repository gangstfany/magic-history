# AP Art History U3 Early Europe and Colonial Americas Design

Date: 2026-07-28

## Objective

Extend the approved AP Art History interactive map from Units 1-2 to the complete College Board Unit 3 dataset: AP #48-98, 51 works.

The delivery must preserve the World History-aligned typography, compact controls, English-title/Chinese-subtitle hierarchy, AP-number markers, responsive embedded and standalone layouts, full-image display, four study tabs, keyboard behavior, comparison workflow, and all verified U1/U2 records. `world-map.html` must remain unchanged.

## Confirmed Product Decisions

- Import all 51 U3 works in one complete public delivery.
- Use the current College Board AP Art History Course and Exam Description as the official manifest and required-view authority.
- Build the source manifest and media ledger before importing live records.
- Use the existing hierarchy: `Unit -> Region -> Site -> AP work`.
- Use eight reviewed geographic regions for the U3 map.
- Locate portable works by creation place or original cultural context, not by current museum.
- Use a broad coordinate plus an explicit qualifier when exact creation provenance is uncertain.
- Use five visible tradition-filter pills, including `All traditions`.
- Preserve more precise traditions, periods, movements, and regional terms in metadata and search.
- Use one audited image for a normal single-view work.
- Use every distinct College Board-required page, component, or view for composite works through the existing accessible image-view switcher.
- Preserve the corrected U1/U2 type scale, weights, control geometry, detail spacing, and image containment.
- Update the homepage to `98 AP works · Units 1-3 · filter, compare and study`.
- Develop U3 on an isolated branch, sync the verified delivery to Desktop, and create a GitHub pull request only after user review.

## Official U3 Manifest

Unit 3 is `Early Europe and Colonial Americas, 200-1750 CE` and contains AP #48-98 exactly once.

The dedicated machine-readable U3 manifest must freeze each official AP number, stable id, official English title, reviewed map region, creation-context site, and required media-view contract before live artwork records are added.

| AP # | Official English title | Map region |
| ---: | --- | --- |
| 48 | Catacomb of Priscilla | Italy & Vatican |
| 49 | Santa Sabina | Italy & Vatican |
| 50 | Rebecca and Eliezer at the Well and Jacob Wrestling the Angel, from the Vienna Genesis | Eastern Mediterranean |
| 51 | San Vitale | Italy & Vatican |
| 52 | Hagia Sophia | Eastern Mediterranean |
| 53 | Merovingian looped fibulae | France |
| 54 | Virgin (Theotokos) and Child between Saints Theodore and George | Eastern Mediterranean |
| 55 | Lindisfarne Gospels: St. Matthew, cross-carpet page; St. Luke portrait page; St. Luke incipit page | British Isles |
| 56 | Great Mosque | Iberian Peninsula |
| 57 | Pyxis of al-Mughira | Iberian Peninsula |
| 58 | Church of Sainte-Foy | France |
| 59 | Bayeux Tapestry | British Isles |
| 60 | Chartres Cathedral | France |
| 61 | Dedication Page with Blanche of Castile and King Louis IX of France, Scenes from the Apocalypse from Bibles moralisées | France |
| 62 | Röttgen Pietà | Central Europe |
| 63 | Arena (Scrovegni) Chapel, including Lamentation | Italy & Vatican |
| 64 | Golden Haggadah (The Plagues of Egypt, Scenes of Liberation, and Preparation for Passover) | Iberian Peninsula |
| 65 | Alhambra | Iberian Peninsula |
| 66 | Annunciation Triptych (Merode Altarpiece) | Low Countries |
| 67 | Pazzi Chapel | Italy & Vatican |
| 68 | The Arnolfini Portrait | Low Countries |
| 69 | David | Italy & Vatican |
| 70 | Palazzo Rucellai | Italy & Vatican |
| 71 | Madonna and Child with Two Angels | Italy & Vatican |
| 72 | Birth of Venus | Italy & Vatican |
| 73 | Last Supper | Italy & Vatican |
| 74 | Adam and Eve | Central Europe |
| 75 | Sistine Chapel ceiling and altar wall frescoes | Italy & Vatican |
| 76 | School of Athens | Italy & Vatican |
| 77 | Isenheim altarpiece | Central Europe |
| 78 | Entombment of Christ | Italy & Vatican |
| 79 | Allegory of Law and Grace | Central Europe |
| 80 | Venus of Urbino | Italy & Vatican |
| 81 | Frontispiece of the Codex Mendoza | Colonial Americas |
| 82 | Il Gesù, including Triumph of the Name of Jesus ceiling fresco | Italy & Vatican |
| 83 | Hunters in the Snow | Low Countries |
| 84 | Mosque of Selim II | Eastern Mediterranean |
| 85 | Calling of Saint Matthew | Italy & Vatican |
| 86 | Henri IV Receives the Portrait of Marie de’ Medici, from the Marie de’ Medici Cycle | Low Countries |
| 87 | Self-Portrait with Saskia | Low Countries |
| 88 | San Carlo alle Quattro Fontane | Italy & Vatican |
| 89 | Ecstasy of Saint Teresa | Italy & Vatican |
| 90 | Angel with Arquebus, Asiel Timor Dei | Colonial Americas |
| 91 | Las Meninas | Iberian Peninsula |
| 92 | Woman Holding a Balance | Low Countries |
| 93 | The Palace at Versailles | France |
| 94 | Screen with the Siege of Belgrade and hunting scene | Colonial Americas |
| 95 | The Virgin of Guadalupe (Virgen de Guadalupe) | Colonial Americas |
| 96 | Fruit and Insects | Low Countries |
| 97 | Spaniard and Indian Produce a Mestizo | Colonial Americas |
| 98 | The Tête à Tête, from Marriage à la Mode | British Isles |

The reviewed region totals are fixed:

| Region | Required count |
| --- | ---: |
| Italy & Vatican | 18 |
| France | 5 |
| Iberian Peninsula | 5 |
| British Isles | 3 |
| Low Countries | 7 |
| Central Europe | 4 |
| Eastern Mediterranean | 4 |
| Colonial Americas | 5 |
| **Total** | **51** |

## Source Policy

Identification and study-content priority:

1. Current College Board AP Art History Course and Exam Description
2. The user's `APAH notes.pdf`
3. The user's `Smarthistory guide to AP Art History, volume two: 48-98`
4. Owning church, monument, heritage authority, archive, library, or museum
5. Smarthistory or another scholarly educational source

Image priority:

1. Owning institution, church, library, monument, or heritage authority with a stable public image
2. Wikimedia Commons file page with verified identity and a traceable rights or license statement

Search-result pages, anonymous image hosts, uncredited thumbnails, generic collection pages, and images that do not show the required object or component are not acceptable.

Every media view must record:

- Stable view id and concise English label
- Image URL
- Specific alt text describing the exam-relevant content
- Human-readable source page URL
- Source institution, creator, or photographer
- License or rights statement when available

The source ledger must contain one row per media view rather than one row per artwork. Live image metadata must project exactly from the reviewed ledger.

## Media and Required-View Contract

The U3 media model reuses the backward-compatible `getArtworkImages(work)` interface introduced for U1.

- A single-view work has exactly one audited image item.
- A composite work has an ordered `images` array.
- The required view set is defined by the College Board work entry and its official required images.
- Each separately identified manuscript page, architectural component, chapel decoration, altarpiece state, or named scene receives its own view when it is part of the official required image set.
- The machine-readable U3 manifest freezes the ordered required view ids before artwork records are accepted.
- The strict validator compares live view ids and counts against the manifest rather than accepting an arbitrary gallery.
- Supplemental decorative images that are not part of the required AP work are excluded.

Examples include the two Vienna Genesis scenes, three named Lindisfarne Gospel pages, the church/tympanum/reliquary components of Sainte-Foy, the two Bibles moralisées images, the chapel and Lamentation at the Arena Chapel, the Sistine ceiling and altar-wall fresco program, Il Gesù and its ceiling fresco, and the architectural/decorative program at Versailles.

The detail panel keeps one contained primary image frame and compact view buttons. Changing a view updates the image, alt text, credit, source link, pressed state, and modal content together. The image dialog opens only the active view and returns focus to its trigger after closing.

Every image uses `object-fit: contain`; no view may crop away a face, head, manuscript page edge, architectural plan, or required component.

## Unit, Region, and Filter Architecture

The Unit selector activates U3 with:

`U3 · Early Europe and Colonial Americas · AP 48-98`

The complete Unit overview displays:

- `U1` / `Global Prehistory · 11 pieces`
- `U2` / `Ancient Mediterranean · 36 pieces`
- `U3` / `Early Europe and Colonial Americas · 51 pieces`

Selecting U3 displays eight English region capsules using the reviewed counts. Selecting a region displays creation-context site groups. Single-work sites resolve to circular AP-number pins; multi-work sites retain capsule markers until expanded.

The U3 culture/tradition row contains five visible pills:

1. `All traditions`
2. `Late Antique & Byzantine`
3. `Medieval & Islamic`
4. `Renaissance & Mannerism`
5. `Baroque & Colonial`

These are navigation groups, not replacements for precise metadata. Each record still retains a reviewed detailed tradition, movement, and period, such as `Early Byzantine`, `Hiberno-Saxon`, `Romanesque`, `Gothic`, `Nasrid`, `Early Italian Renaissance`, `Northern Renaissance`, `Mannerism`, `Dutch Baroque`, `New Spain`, or `Andean Colonial`.

Changing Unit resets incompatible tradition, period, and work-type filters. Period and type options regenerate from the active Unit. Clearing filters restores the Unit overview transform.

Search matches:

- English and Chinese titles
- AP number
- Creation-context site and region
- Artist, workshop, dynasty, or culture
- Broad filter group and precise tradition
- Period, date, medium, and work type
- Reviewed English and Chinese keywords

## Creation-Context Mapping

Portable works are mapped to their best-supported place of creation or original cultural context, not their current museum.

- Exact documented origins use reviewed site coordinates.
- Probable origins use the best-supported broad place plus a qualifier such as `probable`, `attributed`, or `origin uncertain`.
- Works known only by a broad cultural designation use a broad-region coordinate and must not fabricate a city.
- Current collection institutions may appear in image attribution and source links, but not as the primary map site.

The validator requires a provenance qualifier whenever a record uses an intentionally broad or uncertain creation-context coordinate.

## Detail Panel and Study Content

Every U3 record uses the approved hierarchy:

1. Official English title as the large heading
2. Reviewed Chinese title as the smaller subtitle
3. AP number, precise tradition, period, and date metadata
4. Contained primary media area and optional view switcher
5. Four study tabs: Overview, Form, Context, and Compare, using the approved Chinese UI labels

Each record includes:

- Stable id and official AP number
- Unit, region, and broad tradition-filter group
- Precise tradition and period
- Official English title and reviewed Chinese title
- Artist, architect, workshop, culture, or attribution statement
- Creation-context site and optional provenance qualifier
- Map coordinates
- Date, medium, and work type
- Function, form, content, and context
- Recognition anchors
- Comparison ids and comparison notes
- Search keywords
- Audited media metadata

Study copy is written in Chinese with necessary English terminology preserved. Attribution, iconography, patronage, colonial identity, and uncertain provenance must be described with appropriate scholarly caution.

## Comparison Design

Every U3 work receives at least one defensible comparison target. Comparisons may connect:

- Works within the same U3 tradition
- Different U3 traditions or regions
- U3 works to U1 or U2 when the formal, functional, material, political, or religious relationship is useful

Cross-Unit navigation clears incompatible filters, selects the target work, moves focus to its title, and preserves the back-and-forth study flow.

Examples include:

- Santa Sabina and the Pantheon: Roman architectural inheritance and transformed ritual use
- Hagia Sophia and the Pantheon: centralized space, engineering, light, and imperial ideology
- Sainte-Foy and Egyptian or ancient Mediterranean reliquary/funerary practices: sacred presence, pilgrimage, and precious materials
- The Codex Mendoza and earlier narrative or state objects: political record, tribute, and cultural translation
- Colonial casta and devotional images: power, identity, conversion, and hybrid material traditions

## Typography and UI Inheritance

U3 introduces no independent font stack or component scale.

All controls, markers, labels, detail text, view buttons, and dialogs inherit the approved Art History tokens aligned to World History:

- Outer Art title: 15px, weight 800
- English artwork title: 19px, weight 800
- Chinese subtitle: 13px, weight 600
- Detail and study copy: 13.5px, weight 600
- Metadata and counts: 12px, weight 600-700
- Filter labels and controls: 12-13px, weight 600-700
- Study tabs: 13px, weight 600; selected 700
- Compact hierarchy labels: 10-11px, weight 600-700
- Desktop controls: existing 34px toolbar height and 30px map-control geometry
- Narrow touch layouts: minimum 44px interaction targets

The eight U3 region capsules use the existing collision-safe layout engine. Dense European labels may move away from exact geographic centers to avoid overlap, while connector lines retain the true geographic anchor.

## Page Integration

The standalone page remains the general:

`AP 艺术史互动地图`

The homepage Art History caption becomes:

`98 AP works · Units 1-3 · filter, compare and study`

The persistent Art iframe, subject switching, loading protections, iframe sizing, and World History behavior remain unchanged. `world-map.html` is protected by preservation tests.

## Error Handling

- Missing, duplicate, or extra AP numbers in #48-98 fail validation.
- A U3 record outside #48-98 fails validation.
- U3 fails unless all eight reviewed regions exist with the exact counts.
- Unknown Unit, region, broad filter group, or precise tradition fails validation.
- Missing or invalid coordinates fail validation.
- Broad provenance without a qualifier fails validation.
- Missing or unresolved comparison targets fail validation.
- Missing view ids, duplicate views, wrong view order, or incorrect required-view counts fail validation.
- Media records without unique alt, source, credit, and rights metadata fail validation.
- Image failures display the existing named accessible fallback without unsafe HTML injection.
- Empty filter results retain the resettable accessible empty state.
- A failed marker layout keeps the previous complete layer rather than rendering a partial map.

## Accessibility and Responsive Requirements

- All custom map markers retain button semantics, descriptive accessible names, keyboard activation, and visible focus.
- Region, site, and work transitions move focus to a stable child marker after rerender.
- The tradition row remains usable when it wraps at compact widths.
- View-switcher buttons expose a unique accessible label and pressed state.
- Dialog labeling identifies both the artwork and active view.
- Reduced-motion settings remain respected.
- Pan, zoom, reset, filter, and search controls retain non-gesture alternatives.
- The 375px portrait, 390px portrait, 667x375 embedded landscape, 665px boundary, and desktop layouts must not introduce horizontal overflow or clipped details.

## Validation and Browser Verification

The strict release pipeline must verify:

- Exact official manifests for U1 #1-11, U2 #12-47, and U3 #48-98
- Exactly 98 live works in official AP-number order
- Exact U1 and U2 preservation fixtures
- Exact U3 region and broad-filter group assignments
- Exact media projection from the U3 source ledger
- Complete required-view coverage for all composite works
- Unique ids, valid coordinates, resolvable comparisons, and complete study fields
- Homepage count and Units 1-3 copy

The rendered browser verifier must exercise:

- U3 standalone and embedded modes
- All 51 U3 works and every required media view
- Unit, tradition, period, type, and bilingual search filters
- Eight-region hierarchy, site expansion, and individual AP pins
- Image switching, credits, modal behavior, and focus restoration
- All four study tabs
- A real U3-to-U1 or U3-to-U2 comparison and return flow
- Required responsive viewports and collision boundaries
- Console error and warning rejection
- Image request exactness and duplicate-request detection
- Negative controls proving the verifier fails on incorrect view, source, count, or warning behavior

## Delivery Workflow

1. Sync the merged `feature/ap-art-history-map` base.
2. Create an isolated U3 feature branch and worktree.
3. Freeze the official manifest, creation-context map, required-view manifest, and source ledger.
4. Implement strict failing tests before live records and behavior changes.
5. Import all 51 records, media views, region configuration, filter groups, and page copy.
6. Run focused tests, strict 98-work validation, full release verification, and final quality review.
7. Sync only verified delivery files to the Desktop project, with a recoverable backup.
8. Run the release verifier independently from the Desktop delivery.
9. Open the final local preview for user review.
10. Push the U3 branch and create a pull request only after explicit user approval.

## Out of Scope

- U4-U10 artwork imports
- Redesigning World History
- Replacing the current map projection
- A general-purpose gallery or carousel
- Displaying current museum locations as map pins
- Adding unverified supplemental artworks or non-CED views
- Changing the approved typography or control scale
