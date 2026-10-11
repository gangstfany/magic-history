# AP Art History U6 Africa Fast-Content Design

**Date:** 2026-10-07  
**Starting branch:** `feature/ap-art-history-u4` at `bc9a450`  
**Status:** User-approved design awaiting implementation planning

## Goal

Extend the existing AP Art History map from Units 1–5 to Unit 6, **Africa, 1100–1980 CE**, while preserving the current World History-aligned interface and bilingual study format. The release adds the official AP #167–180 sequence: 14 works and 23 College Board image-set views.

This Unit uses a deliberately lean delivery model. It prioritizes complete study content, map integration, and a reusable English edition over the full private-media and audit framework built for Unit 5.

## Confirmed Product Decisions

- Deliver all 14 official Unit 6 works in one release.
- Preserve the current map UI, typography, marker system, detail panel, responsive behavior, and four study tabs.
- Keep the live map bilingual: English work title first, Chinese subtitle second, concise Chinese study explanations with necessary English terms.
- Create a separate, complete English Markdown edition for future use.
- Use only clearly reusable public HTTPS images in the live release.
- Show the established public placeholder when a required view does not yet have a clearly reusable image.
- Do not create a Unit 6 private-media bundle.
- Do not add or change the timeline.
- Preserve Units 1–5 and `world-map.html`.
- Update the homepage and map scope from 166 to 180 works.
- Push to GitHub only after explicit user approval.

## Official Scope

College Board's Unit 6 image set defines the following ordered scope and required views:

| AP # | Work | Required views |
| ---: | --- | --- |
| 167 | Conical tower and circular wall of Great Zimbabwe | `conical-tower`, `circular-wall` |
| 168 | Great Mosque of Djenné | `mosque`, `monday-market` |
| 169 | Wall plaque, from Oba's palace | `wall-plaque`, `oba-context` |
| 170 | Sika dwa kofi (Golden Stool) | `golden-stool`, `stool-context` |
| 171 | Ndop (portrait figure) of King Mishe miShyaang maMbul | `ndop`, `ruler-context` |
| 172 | Power figure (Nkisi n'kondi) | `primary` |
| 173 | Female (Pwo) mask | `primary` |
| 174 | Portrait mask (Mblo) | `mask`, `performance-context` |
| 175 | Bundu mask | `mask`, `performance-context` |
| 176 | Ikenga (shrine figure) | `primary` |
| 177 | Lukasa (memory board) | `memory-board`, `contextual` |
| 178 | Aka elephant mask | `mask`, `performance-context` |
| 179 | Reliquary figure (byeri) | `primary` |
| 180 | Veranda post of enthroned king and senior wife (Opo Ogoga) | `primary` |

The implementation must preserve this order, contain every AP number exactly once, and represent all 23 required views even when a view uses a placeholder.

## Information Sources

Source priority is:

1. Current College Board AP Art History Course and Exam Description for official identity, date, material, culture, and required views.
2. The user's `APAH notes.pdf` and supplied textbook/notes directory for course-specific emphasis.
3. Owning museums, monuments, cultural institutions, and Smarthistory for contextual verification and comparison support.

The Unit 6 source ledger remains lightweight. It records the source page, public image URL when available, attribution, and rights statement for each required view. It does not reproduce Unit 5's restricted-hash or private-bundle machinery.

## Map and Filter Architecture

The existing hierarchy remains:

`Unit → region → creation-context site → AP work`

Unit 6 adds Africa-specific region groups derived from the actual creation contexts represented by AP #167–180. Region labels remain English and use the existing `pieces` count grammar. Each work retains a precise culture or community label rather than substituting a continental label.

Portable and performed works use a defensible cultural or regional creation-context anchor, not their present museum location. When a precise workshop or village is unknown, the record uses a regional coordinate and an explicit provenance qualifier.

Unit 6 selection resets incompatible Unit 5 filters, regenerates region/culture options, and fits the map to Unit 6 works using the existing behavior. No new control type is introduced.

## Bilingual Live Content Contract

Each live map record contains:

- stable ID, AP number, Unit number, region, precise culture/community, and broader navigation group;
- official English title and reviewed Chinese subtitle;
- artist or maker attribution when known;
- date, medium, work type, creation-context site, coordinates, and optional provenance qualifier;
- concise function, form, content, and context explanations;
- two to four visual recognition anchors;
- at least one comparison target that resolves to a real AP #1–180 record;
- an explicit comparison basis;
- English and Chinese search terms;
- all ordered required media views and matching source/credit data.

The content must distinguish objects from their use in performance, ritual, leadership, education, memory, or social relationships. It must avoid treating African cultures as interchangeable or describing living traditions as static remnants of the past.

## English Markdown Edition

Create:

`docs/content/ap-art-history-unit-6-english.md`

The file contains one ordered section per AP work with:

- AP number and official English title;
- culture/community, artist or maker, date, materials, type, and creation context;
- function, content, form, and historical context;
- recognition anchors;
- comparison targets and comparison basis;
- all required view names;
- image/source notes and credits.

The English edition is complete prose prepared for a future English map. It is not a machine translation of the Chinese text. A small structural test verifies that it contains exactly one ordered section for each AP #167–180.

## Public Media Policy

Every required view has one of two states:

- **Public image:** an HTTPS image URL with a matching source page, attribution, and clear reusable-rights statement.
- **Placeholder:** `imageUrl: null` with an accurate visible-content description, source identity, and a note that a reusable image remains to be added.

The implementation does not delay completion to locate a public image for every view. It does not hotlink a museum or commercial image merely because the image is visible online. Broken public image requests use the existing fallback and do not prevent the text, tabs, comparison link, or map controls from working.

## File Boundaries

Expected changes are limited to:

- `art-history-map.html` — Unit 6 configuration, 14 records, 23 media views, filters, and updated scope copy;
- `index.html` — updated Art History scope/count copy;
- `data/ap-art-history-unit-6-manifest.json` — exact identity, hierarchy, site, and ordered required-view authority;
- `docs/content/ap-art-history-unit-6-english.md` — complete English edition;
- `docs/data-sources/u6-source-ledger.md` — lightweight content and media evidence ledger;
- focused Unit 6 tests and the smallest necessary adjustments to existing exact-count tests.

The implementation must not modify `world-map.html`, add a build system, introduce a private-media directory, or refactor unrelated Units.

## Data Flow

1. Freeze official identities and required views in the Unit 6 manifest.
2. Draft the complete English study record from the approved sources.
3. Adapt the study record into the concise bilingual live-map format.
4. Record public image evidence or an explicit placeholder for every required view.
5. Import the 14 records into the existing embedded artwork dataset.
6. Update Unit configuration, map hierarchy, filters, comparisons, homepage count, and scope copy.
7. Verify Unit 6 independently and run the existing preservation checks against Units 1–5.

## Error Handling

- Missing or unapproved images become explicit placeholders rather than blockers.
- A failed remote image falls back to the existing unavailable-image treatment.
- Missing AP numbers, duplicate IDs, duplicate view IDs, missing study fields, invalid coordinates, unresolved comparisons, and non-HTTPS public URLs fail focused validation.
- A comparison that points outside AP #1–180 fails validation.
- Existing Unit 1–5 exact records remain protected from unintended field changes.

## Lean Verification Contract

Focused checks must prove:

- exact AP #167–180 sequence: 14 works, no missing, extra, or duplicate numbers;
- exact 23 ordered required views;
- complete titles, culture/community labels, coordinates, bilingual study fields, and comparison targets;
- every public media URL is HTTPS and every non-public view is an explicit placeholder;
- the English Markdown contains exactly one ordered complete section per Unit 6 work;
- the live dataset contains 180 works total while the first five Units remain the frozen 166-work projection;
- Unit 6 region/site hierarchy and culture filtering work;
- one desktop, one 390px mobile, and one homepage-embedded smoke traversal have no horizontal overflow or blocking console errors;
- image fallback, tab navigation, comparison navigation, and keyboard focus remain usable.

During implementation, run focused Unit 6 tests after each coherent batch. Run the complete existing regression suite once at the final release gate rather than after every small edit.

## Acceptance Criteria

The Unit is complete when:

1. AP #167–180 appear in order in the Unit 6 map and can each be selected.
2. All 23 required views are represented by a public image or explicit placeholder.
3. Every work has complete bilingual live-map study content.
4. The English Markdown edition covers all 14 works with all required fields.
5. Unit, region, site, culture, search, study-tab, image-view, and comparison interactions work at the three required presentation modes.
6. Units 1–5 and the World History map remain unchanged apart from intentional total-scope copy.
7. Focused tests and the final full regression gate pass.

