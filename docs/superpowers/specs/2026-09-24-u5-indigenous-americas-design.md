# AP Art History U5 Indigenous Americas Design

**Date:** 2026-09-24
**Branch:** `feature/ap-art-history-u5`
**Status:** Approved product direction; reviewed implementation specification

## Goal

Extend the verified AP Art History map from Units 1-4 to the complete College Board Unit 5 dataset, `Indigenous Americas, 1000 BCE-1980 CE`: AP #153-166, 14 works and 27 ordered required views.

The delivery preserves the existing World History-aligned interface, bilingual study hierarchy, accessible map interactions, comparison workflow, public/private media boundary, and every verified U1-U4 record. `world-map.html` remains unchanged. Unit 5 introduces no timeline.

## Confirmed Product Decisions

- Deliver all 14 official U5 works in one complete release.
- Use the current College Board CED, updated September 2026, as the identity and required-view authority.
- Preserve U1-U4 field-for-field. Any newly discovered earlier-unit CED change is logged separately and is not silently folded into U5.
- Provide concise, exam-oriented bilingual study content for every work: identification, form, content, function, context, recognition anchors, comparisons, and searchable terminology.
- Audit each factual claim independently against the CED plus authoritative museum, monument, preservation, scholarly, or Indigenous-community sources.
- Represent all 27 College Board-required views. A rights-cleared view ships publicly; a view without portable public permission becomes an explicit public placeholder and may be restored only through an ignored local U5 private-media bundle.
- Use respectful current community names and distinguish a work's creation context, findspot, current collection, and later colonial interpretation.
- Push to GitHub only after explicit user approval.

## Official Scope and Required Views

The manifest freezes every work and required view in this exact order:

| AP # | Work | Ordered required views |
| ---: | --- | --- |
| 153 | Chavín de Huántar | `plan`, `lanzon-stela`, `relief-sculpture`, `nose-ornament` |
| 154 | Mesa Verde cliff dwellings | `cliff-dwellings` |
| 155 | Yaxchilán | `structure-40`, `lintel-25-structure-23`, `structure-33` |
| 156 | Great Serpent Mound | `earthwork` |
| 157 | Templo Mayor (Main Temple) | `reconstruction`, `coyolxauhqui-stone`, `calendar-stone`, `olmec-style-mask` |
| 158 | Ruler's feather headdress (probably of Motecuhzoma II) | `primary` |
| 159 | City of Cusco, including Qorikancha, Santo Domingo, and Walls at Saqsa Waman | `city-plan`, `qorikancha-santo-domingo`, `saqsa-waman-walls` |
| 160 | Maize cobs | `primary` |
| 161 | City of Machu Picchu | `city`, `observatory`, `intihuatana-stone` |
| 162 | All-T'oqapu tunic | `primary` |
| 163 | Bandolier bag | `primary` |
| 164 | Transformation mask | `closed`, `open` |
| 165 | Painted elk hide | `primary` |
| 166 | Black-on-black ceramic vessel | `primary` |

The machine-readable manifest is the release authority for exact titles, identifying information, stable IDs, ordered view IDs, map classifications, and creation-context locations. The source ledger records one row per required view, so composite works cannot pass with only a representative image.

## Source and Content-Audit Policy

Identification priority:

1. Current College Board AP Art History Course and Exam Description
2. Owning monument, museum, archive, preservation agency, or artist/community authority
3. Smarthistory and peer-reviewed or museum-authored scholarship

For living or descendant Indigenous communities, a relevant tribal nation, community museum, cultural center, or named Indigenous scholar is preferred when it directly addresses terminology, function, cultural sensitivity, continuity, or reception. Older labels such as `Anasazi` may appear only as historical College Board wording after the current term `Ancestral Puebloan`.

Every canonical record receives a claim-level review for:

- official identification, date, materials, and attribution;
- visual description tied to the exact required view;
- function and audience without treating interpretation as certainty;
- political, ritual, spatial, and colonial context;
- culturally sensitive display, ownership, repatriation, excavation, or reception issues when relevant;
- comparison language that names a defensible formal or contextual relationship.

The content review must not reduce diverse Indigenous cultures to a single aesthetic tradition or describe living communities only in the past tense. It must distinguish evidence from interpretation and avoid unsupported claims about sacred meaning, artist intent, or ownership.

## Map and Filter Architecture

U5 continues the hierarchy:

`Unit -> creation-context region -> creation-context site -> AP work`

The six U5 map regions are:

1. `mesoamerica` / `Mesoamerica` - AP 155, 157, 158
2. `centralAndes` / `Central Andes` - AP 153, 159, 160, 161, 162
3. `ancestralPueblo` / `Ancestral Pueblo` - AP 154, 166
4. `easternWoodlands` / `Eastern Woodlands` - AP 156, 163
5. `northwestCoast` / `Northwest Coast` - AP 164
6. `plainsGreatBasin` / `Plains & Great Basin` - AP 165

The Unit 5 tradition filter exposes four broad College Board-aligned groups:

- `Ancient Mesoamerica`
- `Ancient Central Andes`
- `Ancient North America`
- `Native North America`

These are navigation groups, not interchangeable cultural labels. Every record retains a precise culture or community name such as Chavín, Maya, Mexica, Inka, Lenape, Kwakwaka'wakw, Eastern Shoshone, or Tewa.

Portable works use the best-supported creation context, not the present museum. When an exact place of creation is unknown, the manifest uses a reviewed regional coordinate plus an explicit provenance qualifier rather than inventing a city. The feather headdress, maize cobs, tunic, bandolier bag, and transformation mask require this qualifier.

## Detail and Study Contract

Each work retains the established detail hierarchy:

1. Official English title
2. Reviewed Chinese subtitle
3. AP number, culture/community, period, date, and materials
4. Contained active image or rights placeholder with ordered view controls
5. Four existing study tabs: Overview, Form, Context, and Compare

Each canonical record includes:

- stable ID, AP number, unit, region, precise culture, and tradition group;
- creation-context site, coordinates, and optional provenance qualifier;
- official title, Chinese title, artist/community attribution, date, medium, and work type;
- concise Chinese function, form, content, and context text with necessary English terminology;
- two to four recognition anchors;
- one or more comparison targets and an explicit comparison basis;
- English and Chinese search terms;
- all ordered media records and matching credits.

At least one comparison per work must resolve to a real AP 1-166 record. Cross-unit comparisons clear incompatible filters, select the target, update the panel, and restore focus correctly. Suitable bases include sacred architecture and landscape, royal legitimacy, urban planning, astronomical orientation, luxury materials, textile status systems, transformation/performance, colonial encounter, Indigenous continuity, and technical revival.

## Public and Private Media

The public release never treats a College Board or museum reproduction as reusable merely because it is visible online. Every required view receives an independent source-page and rights review.

A public view is one of two explicit states:

- **release-ready:** an HTTPS image URL with matching source, creator/institution, and approved rights statement;
- **rights-restricted:** `imageUrl: null`, a precise visible-content alt/status description, and an exact official identity/source page.

The final restricted-key set is frozen by the reviewed U5 rights audit before live import. The validator rejects unreviewed placeholders, remote restricted-image URLs, local absolute paths, and mismatches among the manifest, canonical fixture, source ledger, rights audit, live page, and browser fixture.

Private U5 media lives only under:

```text
.private-media/u5/
  overrides.js
  <approved local image files>
```

The directory remains Git-ignored. `?privateMedia=1` loads both the existing U4 bundle and the optional U5 bundle through a backward-compatible multi-bundle loader. Each bundle may override only its frozen unit-specific restricted keys with relative paths inside its own directory. Missing or invalid files retain the public placeholder without exposing a filesystem path or breaking other works.

Public placeholders keep the established full-height exhibition treatment. Private images use `object-fit: contain`, the normal view switcher, synchronized credit/source data, modal behavior, keyboard operation, and focus restoration.

## Data and File Boundaries

U5 adds dedicated, independently reviewable files:

- `data/ap-art-history-unit-5-manifest.json`
- `data/ap-art-history-unit-5-rights.json`
- `data/ap-art-history-unit-5-placeholder-authority.json` when the rights audit contains restricted views
- `tests/fixtures/u5-canonical.json`
- `tests/fixtures/u5-browser.json`
- `docs/data-sources/u5-source-ledger.md`

The live `art-history-map.html` remains a generated projection of the reviewed canonical fixture. Tests must fail before production data is imported. U1-U4 fixtures and `world-map.html` are protected by exact preservation checks.

## Validation Contract

The implementation is accepted only when all of the following are proven:

- exact AP 153-166 sequence: 14 works, no missing/extra/duplicate AP number;
- exact 27 required views and ordered view IDs;
- exact region and tradition-group memberships;
- complete bilingual content and claim-review source coverage;
- valid coordinates, creation-context qualifiers, search data, and resolvable comparisons;
- exact one-to-one alignment among canonical media, ledger rows, rights entries, credits, live rendering, and browser fixtures;
- public mode makes no image request for a restricted view;
- private mode loads only approved local U4/U5 overrides and preserves placeholder fallback;
- all U5 works, views, study tabs, comparisons, marker branches, responsive modes, and keyboard/focus behaviors are traversed in standalone and homepage-embedded contexts;
- homepage counts and labels update to 166 works / Units 1-5 without changing World History behavior or iframe geometry;
- U1-U4 remain field-for-field unchanged;
- no private media, restricted URL, or machine-specific path enters the Git diff.

## Error Handling

- Missing/invalid manifest, canonical, ledger, or rights entry: fail with AP number and view key.
- Missing or nonportable public rights: render an explicit placeholder; never force a broken-image request.
- Missing private bundle or file: retain the public placeholder and usable controls.
- Unknown creation site: require a regional coordinate and provenance qualifier.
- Unresolved comparison: validation failure before live import.
- Duplicate media URL or mismatched view identity: validation failure unless the source audit explicitly records a justified shared view.
- Browser console error, duplicate request, inaccessible control, lost focus, clipped marker, or horizontal overflow: release failure.

## Out of Scope

- Reworking U1-U4 content or renumbering earlier units in the U5 branch.
- Publishing private or rights-restricted images to GitHub or another public host.
- Downloading or republishing images from the College Board CED as public assets.
- A generalized digital-rights or authentication system.
- Timeline, causal-chain, or quiz functionality.
- Unit 6 and later artworks.

## Success Criteria

1. The map contains exactly AP 1-166, with all 14 U5 works and 27 official U5 views.
2. Every U5 study record has passed both structural validation and a source-backed factual review.
3. Public and private modes truthfully represent image rights and remain usable for every required view.
4. U5 map hierarchy, filters, comparisons, accessibility, and responsive behavior match the approved U1-U4 experience.
5. U1-U4 and World History remain unchanged, the complete automated/browser/release gates pass, and the work remains on the isolated U5 branch until the user chooses integration.
