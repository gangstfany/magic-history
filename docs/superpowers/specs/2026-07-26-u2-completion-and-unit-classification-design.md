# AP Art History Unit Classification and U2 Completion Design

Date: 2026-07-26

## Objective

Extend the AP Art History map from its current 27-work Ancient Mediterranean prototype to the complete 36-work College Board Unit 2 set, while introducing a classification model that will scale to all 250 required works.

The change must preserve the approved World History-aligned typography, compact controls, embedded presentation mode, AP-number markers, complete-image display, responsive behavior, and existing 27 artwork records.

## Confirmed Product Decisions

- Use College Board Units 1-10 as the primary classification.
- Use a Unit dropdown rather than ten permanent Unit pills.
- Show context-sensitive culture or artistic-tradition pills after a Unit is selected.
- Preserve official AP artwork numbers; never renumber within a Unit.
- Use hierarchical map markers so 250 works are not displayed as 250 overlapping pins.
- Use English for map cluster subtitles, region names, site names, and piece counts.
- Preserve the detail-panel title hierarchy: English artwork title as the large heading and Chinese artwork title as the smaller subtitle.
- Use one primary image per artwork. Do not add a gallery, thumbnails, or a carousel.
- Add the nine missing U2 works in the same delivery as the Unit classification.

## Official Unit Model

The map data model will reserve these official Unit ranges:

| Unit | English name | AP range | Required works |
| --- | --- | --- | ---: |
| U1 | Global Prehistory | 1-11 | 11 |
| U2 | Ancient Mediterranean | 12-47 | 36 |
| U3 | Early Europe and Colonial Americas | 48-98 | 51 |
| U4 | Later Europe and Americas | 99-152 | 54 |
| U5 | Indigenous Americas | 153-166 | 14 |
| U6 | Africa | 167-180 | 14 |
| U7 | West and Central Asia | 181-191 | 11 |
| U8 | South, East, and Southeast Asia | 192-212 | 21 |
| U9 | The Pacific | 213-223 | 11 |
| U10 | Global Contemporary | 224-250 | 27 |

The current delivery activates U2. Other Units may appear in the Unit model as future definitions, but they must not pretend to contain artwork records that have not been imported.

## Filter Architecture

### Primary toolbar

The first filter row contains:

1. Unit
2. Period
3. Work type
4. Search

The Unit selector uses English Unit names and official AP ranges. The U2 option is:

`U2 · Ancient Mediterranean · AP 12-47`

### Context-sensitive culture row

When U2 is active, the second row contains:

- All cultures
- Ancient Near East
- Egypt
- Greece
- Etruscan
- Rome

Persian works in U2 are grouped under Ancient Near East for this filter. The culture row is hidden when "All Units" is active because a global culture list would be too long and inconsistent across Units.

Future Units will define their own culture or artistic-tradition choices instead of reusing the U2 list.

### Filter behavior

- Changing Unit resets incompatible culture, period, and work-type filters.
- Period and work-type options are regenerated from the works inside the active Unit.
- Search continues to match English title, Chinese title, site, period, and keywords.
- Selecting a Unit fits the map to the visible works.
- Clearing filters restores the overview transform.
- An empty result retains the existing accessible empty-state treatment and reset action.

## Map Hierarchy and Labels

### Level 1: Unit overview

The full-world overview displays Unit clusters rather than every AP work. Only Units with imported artwork records receive map clusters; future empty Unit definitions are not rendered as if their works were available. A U2 cluster is formatted as:

`U2`

`Ancient Mediterranean · 36 pieces`

The subtitle is English. `piece` is used only for a count of one; all other counts use `pieces`.

### Level 2: Region and site groups

Selecting a Unit refines the map into region and site groups. Region and site text is English. Example site group:

`Rome`

`AP 41-47 · 7 pieces`

If multiple AP numbers are non-consecutive, the existing compact range formatter is used, for example:

`AP 26, 28, 35-36`

### Level 3: Individual works

Opening a site group reveals individual official AP-number buttons. Individual works continue to use circular markers. Multi-work sites continue to use capsule markers until expanded.

### Visual identity

- Unit overview clusters may use restrained Unit accents.
- Individual AP pins use the World History-aligned blue treatment.
- Culture is expressed by filters, selected-state emphasis, or a restrained outline rather than a new marker color for every culture.
- Visual marker sizes and 44px interaction targets remain unchanged from the approved UI alignment work.

## English Subtitle Rule

English subtitle text applies to map hierarchy labels:

- Unit names
- Region names
- Site names
- Piece counts
- AP ranges inside site-group subtitles

Examples:

- `Ancient Mediterranean · 36 pieces`
- `Europe · 54 pieces`
- `Rome · AP 41-47 · 7 pieces`

This rule does not change the artwork detail panel. The detail panel remains:

1. English artwork title, large
2. Chinese artwork title, smaller
3. AP number, culture, period, date, and study content

## Development Progress

The data model may expose an internal development-only progress string while a Unit is incomplete:

`Dataset progress · U2 27/36`

This is not a permanent public-facing control. Because this delivery completes U2 to 36/36, the U2 progress indicator will be hidden in the completed state. The same mechanism may be reused while future Units are being imported.

## U2 Data Completion

The following nine records will be added:

| AP # | English title | Culture filter | Primary map site |
| ---: | --- | --- | --- |
| 12 | White Temple and its ziggurat | Ancient Near East | Uruk, Iraq |
| 14 | Statues of votive figures, from the Square Temple at Eshnunna | Ancient Near East | Eshnunna (Tell Asmar), Iraq |
| 16 | Standard of Ur from the Royal Tombs at Ur | Ancient Near East | Ur, Iraq |
| 19 | The Code of Hammurabi | Ancient Near East | Susa, Iran |
| 25 | Lamassu from the citadel of Sargon II, Dur Sharrukin | Ancient Near East | Dur Sharrukin (Khorsabad), Iraq |
| 29 | Sarcophagus of the Spouses | Etruscan | Cerveteri, Italy |
| 30 | Audience Hall (apadana) of Darius and Xerxes | Ancient Near East | Persepolis, Iran |
| 31 | Temple of Minerva and sculpture of Apollo | Etruscan | Veii, Italy |
| 32 | Tomb of the Triclinium | Etruscan | Tarquinia, Italy |

After import, U2 must contain every AP number from 12 through 47 exactly once.

### Record requirements

Each new record must provide the same fields and study depth as an existing artwork:

- Stable id
- Official AP number
- English title
- Chinese title
- Unit id and English Unit name
- Culture filter key
- Period
- Date
- Artist or culture
- English site name and optional site qualifier
- Map coordinates
- Medium
- Work type
- Function
- Form
- Content
- Context
- Recognition anchors
- Comparison ids
- Primary image URL
- Image alt text
- Image source name
- Image source page URL
- Search keywords

Existing records receive the minimum additional Unit and normalized culture metadata needed by the new filters. Their substantive study content, image source, AP number, and coordinates remain unchanged unless a separate verified correction is required.

## Single-Image Policy

- Each new work uses one primary image with the clearest exam-relevant identification anchors.
- The complete work or monument must be visible; `object-fit: contain` remains mandatory.
- Complex works do not receive a gallery in this delivery.
- For a two-sided object, the primary image should show both sides when a suitable rights-cleared composite is available.
- For an architectural complex, the primary image should favor the most recognizable full view rather than a tightly cropped detail.
- For Temple of Minerva and Apollo, the selected image must clearly represent the combined AP work without misidentifying a reconstruction as an original surviving structure.
- Every image includes meaningful alt text and a human-readable source link.
- Image loading retains the existing named fallback and safe DOM handling.

## Source Policy

Source priority for identifying information and study content:

1. Current College Board AP Art History Course and Exam Description
2. The user's `APAH notes.pdf`
3. The user's Smarthistory AP Art History Volume One
4. Owning museum or archaeological-site authority
5. Smarthistory or another scholarly educational source

Source priority for images:

1. Owning institution open-access image
2. Wikimedia Commons file page with a verifiable object identity and license/source trail

Generic image-search result pages, unattributed images, and hotlinked thumbnails are not acceptable.

## Data and UI Boundaries

- Unit definitions live in one reusable configuration rather than being duplicated in markup and filter code.
- Artwork records remain the source of truth for available period, type, culture, site, and search values.
- Label formatting for `piece/pieces`, AP ranges, and Unit subtitles is centralized and testable.
- Map hierarchy uses the existing collision-safe Unit-to-region-to-site refinement path instead of introducing a second marker engine.
- The homepage integration and `world-map.html` remain outside the change scope.

## Error Handling

- Duplicate or missing AP numbers fail validation.
- An artwork outside its Unit's official AP range fails validation.
- A work with an unknown culture key fails validation.
- Coordinates outside the map bounds fail validation.
- Missing comparison targets fail validation.
- Missing image attribution or non-link source fields fail validation.
- Broken images use the existing accessible fallback without injecting HTML from dataset values.
- Filtering to zero works shows an accessible empty state and reset action.

## Accessibility and Responsive Requirements

- New selects, pills, groups, and markers retain accessible names and keyboard activation.
- Desktop compact controls retain their approved World History-aligned dimensions.
- Controls recover at least 44px touch targets on narrow screens.
- The Unit and culture rows wrap or stack without horizontal overflow at 375px.
- Focus restoration after marker expansion and artwork selection remains stable.
- Reduced-motion behavior remains unchanged.

## Verification

Automated verification must cover:

- Exactly 36 U2 records
- Exact AP manifest 12-47 with no duplicates or gaps
- Exact nine-record addition
- Correct Unit and culture assignments
- English Unit, region, site, and piece-count labels
- Singular and plural piece formatting
- Context-sensitive U2 culture pills
- Unit-driven period and work-type options
- Filter reset and map-fit behavior
- Search across both languages and metadata
- Single-image schema and attribution
- Complete-image rendering without cover cropping
- Comparison ids and coordinates
- Collision-safe hierarchy at desktop and mobile scales
- 44px narrow-screen interaction targets
- No regression to the existing homepage integration or World History map

Browser verification must cover:

- Standalone and embedded Art History modes
- U2 selector and all six culture choices
- Unit overview, site capsule, and individual AP-pin states
- Detail rendering for all nine added works
- Image completeness and correct subject identity
- 1440px, 1024px, 768px, and 375px layouts
- No horizontal overflow or console warnings/errors

## Out of Scope

- Importing Units 1 or 3-10
- A multi-image gallery
- Rewriting existing study notes
- Changing the World History map
- Public deployment or authentication
- User accounts, saved progress, or analytics
