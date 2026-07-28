# AP Art History U1 Global Prehistory Design

Date: 2026-07-27

## Objective

Extend the approved AP Art History map from the complete 36-work Unit 2 dataset to Units 1-2 by importing all 11 official College Board Unit 1 works, AP #1-11.

The delivery must preserve the approved World History-aligned typography, compact controls, embedded and standalone layouts, English-title/Chinese-subtitle hierarchy, collision-safe map navigation, AP-number markers, accessible study tabs, and the complete verified U2 dataset. `world-map.html` must remain unchanged.

## Confirmed Product Decisions

- Import all 11 U1 works in one delivery.
- Use the current College Board AP Art History Course and Exam Description as the official manifest authority.
- Organize the map as `Unit -> Region -> Site -> AP work`.
- Use English for Unit, region, site, AP-range, and piece-count hierarchy labels.
- Do not show culture-filter pills for U1 because many prehistoric makers and cultures are unidentified or known only through broad archaeological descriptions.
- Preserve the existing U2 culture filters.
- Use one audited image for every U1 work except Stonehenge.
- Use two College Board-required views for Stonehenge: aerial overview and ground-level monument view.
- Allow comparison links within U1 and across U1 and U2.
- Preserve the U2 detail-panel typography, four study tabs, image containment, modal behavior, and keyboard focus restoration.
- Use the hierarchy and marker engine that already scales to the future 250-work dataset.

## Official U1 Manifest

U1 is `Global Prehistory, 30,000-500 BCE` and contains AP #1-11 exactly once.

| AP # | Official English title | Official provenance | Official date | Official medium | Required images |
| ---: | --- | --- | --- | --- | ---: |
| 1 | Apollo 11 stones | Namibia | c. 25,500-25,300 BCE | Charcoal on stone | 1 |
| 2 | Great Hall of the Bulls | Lascaux, France | 15,000-13,000 BCE | Rock painting | 1 |
| 3 | Camelid sacrum in the shape of a canine | Tequixquiac, central Mexico | 14,000-7000 BCE | Bone | 1 |
| 4 | Running horned woman | Tassili n'Ajjer, Algeria | 6000-4000 BCE | Pigment on rock | 1 |
| 5 | Beaker with ibex motifs | Susa, Iran | 4200-3500 BCE | Painted terra cotta | 1 |
| 6 | Anthropomorphic stele | Arabian Peninsula | Fourth millennium BCE | Sandstone | 1 |
| 7 | Jade cong | Liangzhu, China | 3300-2200 BCE | Carved jade | 1 |
| 8 | Stonehenge | Wiltshire, UK | c. 2500-1600 BCE | Sandstone | 2 |
| 9 | The Ambum stone | Ambum Valley, Enga Province, Papua New Guinea | c. 1500 BCE | Greywacke | 1 |
| 10 | Tlatilco female figurine | Central Mexico, site of Tlatilco | 1200-900 BCE | Ceramic | 1 |
| 11 | Terra cotta fragment | Lapita; Reef Islands, Solomon Islands | 1000 BCE | Terra cotta (incised) | 1 |

The manifest must live in a dedicated machine-readable U1 file and be validated independently from the embedded artwork records.

## Source Policy

Identification and study-content priority:

1. Current College Board AP Art History Course and Exam Description
2. The user's `APAH notes.pdf`
3. The user's `1.Prehistoric Art.pdf`
4. The user's Smarthistory AP Art History Volume One
5. Owning museum, archaeological authority, or heritage-site authority
6. Smarthistory or another scholarly educational source

Image priority:

1. Owning institution or heritage authority with a stable public image
2. Wikimedia Commons file page with verified object identity and source or license trail

Search-result pages, anonymous image hosts, uncredited thumbnails, and links that do not identify the represented object are not acceptable.

Every image must record:

- Image URL
- Human-readable source page URL
- Source institution or author
- License or rights statement when available
- Specific alt text describing the exam-relevant view

## Unit and Filter Architecture

The Unit selector activates U1 with:

`U1 · Global Prehistory · AP 1-11`

The active U1 dataset contains 11 works. When U1 is selected:

- The culture-filter row remains hidden.
- Period options are generated only from U1 records.
- Work-type options are generated only from U1 records.
- Search matches English title, Chinese title, site, region, date, medium, type, and keywords.
- Changing Unit clears incompatible period and type selections.
- Clearing filters restores the Unit overview transform.

U1 records still carry defensible tradition metadata for search, display, and comparison. These labels describe known archaeological context, such as `Paleolithic Europe`, `Liangzhu`, `Tlatilco`, or `Lapita`, rather than inventing named cultures where the record does not support one. The labels do not become U1 filter pills.

Culture or tradition label resolution is separated from filter availability:

- A shared label registry resolves each record's English and Chinese tradition labels for detail metadata, search, and comparison.
- Per-Unit filter configuration decides whether those labels become visible pills.
- U1 defines reviewed labels but sets `showCultureFilters: false`.
- U2 retains its existing reviewed labels and sets `showCultureFilters: true`.

When All Units is selected, culture filters remain hidden, matching the existing behavior.

## Map Hierarchy

### Level 1: Unit overview

The complete map initially displays:

- `U1` / `Global Prehistory · 11 pieces`
- `U2` / `Ancient Mediterranean · 36 pieces`

The full dataset count is 47.

### Level 2: U1 regions

Selecting U1 displays six English region capsules:

| Region label | Count | AP works |
| --- | ---: | --- |
| Africa | 2 pieces | 1, 4 |
| Europe | 2 pieces | 2, 8 |
| Americas | 2 pieces | 3, 10 |
| Middle East | 2 pieces | 5, 6 |
| East Asia | 1 piece | 7 |
| Oceania | 2 pieces | 9, 11 |

The singular count must render as `1 piece`; all other counts use `pieces`.

### Level 3: Sites and works

Selecting a region displays site-level groups. Because every U1 site contains one AP work, each visible site resolves to an individual circular AP-number pin under the current hierarchy rules.

Site labels use the best-supported English provenance:

- Namibia or Apollo 11 Cave when a verified source supports the specific cave attribution
- Lascaux, France
- Tequixquiac, central Mexico
- Tassili n'Ajjer, Algeria
- Susa, Iran
- Arabian Peninsula
- Liangzhu, China
- Wiltshire, UK
- Ambum Valley, Papua New Guinea
- Tlatilco, central Mexico
- Reef Islands, Solomon Islands

Coordinates must express the documented level of geographic precision. A broad provenance such as `Arabian Peninsula` receives an explicitly approximate broad-region coordinate and qualifier; the implementation must not fabricate a precise excavation site.

### Collision and focus behavior

- U1 uses the existing configured Unit-to-region-to-site layout.
- Region capsules and AP pins must remain non-overlapping across tested mobile and landscape sizes.
- Keyboard activation of a Unit or region moves focus to a stable child marker after rerender.
- Filtering and resizing recompute marker layout without leaving stale markers.
- Map zoom, pan, reset, and touch ownership remain unchanged.

## Detail Panel

Every U1 work uses the current U2 hierarchy:

1. English artwork title as the large heading
2. Chinese artwork title as the smaller subtitle
3. AP number, defensible region or tradition, period, and date metadata
4. Primary image area
5. Four study tabs: Overview, Form, Context, and Compare, using the approved Chinese UI labels

Study records must include:

- Stable id
- Official AP number and English title
- Reviewed Chinese title
- Unit and region
- Defensible tradition or archaeological-context label
- Period and date
- Artist or culture statement
- Site and optional qualifier
- Map coordinates
- Medium
- Work type
- Function
- Form
- Content
- Context
- Recognition anchors
- Comparison ids
- Search keywords
- Audited image metadata

Study copy is written in Chinese with necessary English art-history terminology preserved. It must distinguish verified interpretation from uncertainty, especially for prehistoric function and meaning.

## Image Model and Stonehenge

The existing U2 records use one set of image fields. U1 introduces a backward-compatible normalized media interface:

- `getArtworkImages(work)` returns `work.images` when an audited image array exists.
- Otherwise it returns one normalized item built from the existing `imageUrl`, `imageAlt`, `imageSourceName`, and `imageSourceUrl` fields.
- U2 records do not require a bulk schema rewrite.

Stonehenge provides exactly two audited image items:

1. Aerial overview showing the circular plan and landscape context
2. Ground-level view showing stones, trilithons, and lintel construction

The Stonehenge detail panel:

- Keeps one full-size contained image frame.
- Adds two compact, accessible view buttons.
- Updates image, alt text, credit, source link, and modal content together.
- Preserves the current detail-panel dimensions.
- Opens only the active view in the image dialog.
- Returns focus to the active view trigger after dialog close.

All other U1 and U2 works retain a single-image presentation.

Every image uses `object-fit: contain`; the implementation must not crop away identifying features. Loading failure uses the existing named accessible fallback and safe DOM handling.

## Comparison Design

Each U1 work receives at least one comparison target where a defensible formal, functional, contextual, or material relationship exists.

Comparisons may link:

- U1 to U1
- U1 to U2
- U2 back to U1 when a reciprocal link improves study usefulness

Examples of eligible relationships include:

- Stonehenge and Great Pyramids: monumentality, ritual landscape, labor, and celestial or cosmological interpretation
- Great Hall of the Bulls and Egyptian narrative images: image-making, composite representation, and ritual interpretation
- Jade cong and Ancient Mediterranean funerary or ritual objects: precious material, labor, status, and uncertain ritual function

Comparison copy must not state uncertain prehistoric meanings as settled facts.

## Page Integration and Copy

The standalone Art History page title becomes general rather than U2-specific:

`AP 艺术史互动地图`

The supporting copy identifies the currently available scope as Units 1-2 without implying that all 250 works are already imported.

The homepage Art History caption becomes:

`47 AP works · Units 1-2 · filter, compare and study`

The homepage keeps the same persistent Art iframe, subject-switching behavior, frame loading protections, typography, and dimensions. `world-map.html` and World History interactions remain unchanged.

## Error Handling

- Missing, duplicate, or extra AP numbers in the U1 manifest fail validation.
- A U1 record outside AP #1-11 fails validation.
- A U2 preservation fixture detects any unintended change to the verified 36-work dataset and credits.
- Unknown Unit or region ids fail validation.
- Coordinates outside map bounds fail validation.
- A broad-provenance record without a qualifier fails validation.
- Missing or unresolved comparison targets fail validation.
- U1 image records without unique source, alt, and credit metadata fail validation.
- Stonehenge fails validation unless it has exactly two distinct audited views.
- Every other U1 work fails validation unless it has exactly one audited view.
- Image loading failures display the accessible fallback without unsafe HTML injection.
- Empty filter results keep the existing resettable accessible empty state.

## Accessibility and Responsive Requirements

- Typography, weights, control heights, detail spacing, and marker geometry inherit the approved World History-aligned Art History tokens.
- Controls retain meaningful labels and visible focus.
- Map markers retain button semantics and descriptive accessible names.
- Stonehenge view controls expose selected state and specific accessible names.
- The image dialog remains labelled and restores focus.
- Touch targets recover at least 44 by 44 CSS pixels on narrow layouts.
- No tested viewport has horizontal page overflow.
- The 664/665px stacked-to-two-column boundary remains stable.
- Short embedded hosts coordinate scrolling between iframe and parent without trapping content.
- Reduced-motion preferences remain respected.

## Verification Strategy

### Data tests

- Match the exact official U1 AP #1-11 id and title manifest.
- Confirm 11 U1 records and 36 preserved U2 records.
- Confirm the complete AP #1-47 keyset with no duplicates.
- Confirm exact U1 region counts: 2, 2, 2, 2, 1, 2.
- Confirm every site and comparison id resolves.
- Confirm U1 source ledger and artwork records agree.
- Confirm image count and credit rules, including Stonehenge's two views.

### UI and interaction tests

- Confirm U1 appears in the Unit selector and All Units shows both Unit capsules.
- Confirm U1 hides culture pills while U2 still shows its existing culture filters.
- Confirm Unit, period, type, and search filters compose correctly.
- Confirm six English region capsules and exact piece counts.
- Confirm region activation reveals the correct circular AP pins.
- Confirm the detail panel uses English title, Chinese subtitle, four tabs, and audited media.
- Confirm Stonehenge switches both image and attribution and opens the active view in the modal.
- Confirm cross-Unit comparison navigation updates Unit state and focuses the selected title.
- Confirm homepage caption and standalone title use the new 47-work scope.

### Browser release gate

The release verifier must:

- Run all Node tests.
- Run strict U1 and U2 manifest and credit validation.
- Test standalone and embedded modes at required desktop, tablet, mobile, and landscape sizes.
- Exercise breakpoint boundaries already protected by the U2 release gate.
- Traverse all 11 U1 works in both standalone and embedded modes.
- Verify exact image requests, titles, subtitles, alt text, source, credit, license data, study tabs, comparison links, modal rerender, and focus restoration.
- Exercise both Stonehenge views.
- Reject console warnings and errors.
- Confirm no horizontal overflow or marker collisions.

## Delivery and Safety

- Implementation occurs on an isolated feature branch or worktree.
- The verified development result is synced to the Desktop delivery copy only after the full release gate passes.
- The Desktop copy is backed up before overwrite.
- Synced runtime and verification files are compared by SHA-256.
- The final homepage preview is opened with Art History selected.
- The feature branch is merged and pushed only after the user chooses the branch-finish option.

## Out of Scope

- Importing Units 3-10
- Redesigning the approved typography or detail-panel layout
- Adding multi-image galleries to works other than Stonehenge
- Reclassifying or rewriting the verified U2 dataset without a separate sourced correction
- Changing World History data or interactions
- Deploying the project to a production hosting service
