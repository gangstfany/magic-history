# AP Art History U8–U10 integration specification

Date: 2026-10-14

Status: Sequential delivery approach and written specification approved by the user; U8–U10 content and native integration completed with independent specification/quality approvals and final verification on 2026-10-14. Public-image coverage is separately qualified in each release ledger. Local branch retained; no push, merge or Desktop synchronization.

Workspace: reuse the existing linked worktree. Keep branch `feature/ap-art-history-u6` unless the user requests a different name. Preserve the uncommitted U7 implementation; do not reset or overwrite it.

## Scope and delivery sequence

Complete the remaining 59 required Art History records using the existing map and homepage:

| Stage | Unit | AP numbers | Works | Release total |
|---|---|---|---:|---:|
| 1 | U8 · South, East, and Southeast Asia | 192–212 | 21 | 212 |
| 2 | U9 · The Pacific | 213–223 | 11 | 223 |
| 3 | U10 · Global Contemporary | 224–250 | 27 | 250 |

Deliver and verify each stage before integrating the next. This is an extension of the approved U7 workflow, not a new UI design. Rejected alternatives: simultaneously editing all three live projections, or postponing all media review until after all text is imported. Independent research may be organized separately, but live integration remains sequential.

## Existing behavior to preserve

- World History data, Key Points/Study Points cards, timeline, filters, learning modes and homepage interactions.
- All previously imported Art History records and credits, including U7. Hash parsed legacy records and credits at each stage before append-only integration.
- Shared font family, font sizes and weights, card/pill sizing, map colors, responsive heights, automatic padded fitting, selected-work focus, manual zoom/pan and 1:1 reset.
- English artwork heading with a smaller Chinese subtitle; the existing four study tabs.
- English navigation labels and singular/plural `piece`/`pieces` counts.

No new timeline interaction, English-language toggle, private-image bundle, unrelated refactor or design changes are included.

## Identity and content contract

Before integrating each Unit, freeze its ordered AP identities and exact required-view list against the current official College Board CED. The work count does not imply the view count; the latter must be derived from the official references and recorded explicitly in that Unit's manifest.

Use the supplied `APAH notes.pdf` and Smarthistory volume five (AP192–250), corroborated with authoritative object, institution, monument and artist sources. Reconcile disagreements in a source ledger; independently summarize rather than reproducing long source passages.

Each record retains the established schema: stable ID, AP number, Unit, official English title, Chinese subtitle, precise culture/artist, dates, materials, work type, original site or qualified production context, coordinates, function, form, content, context, recognition anchors, comparisons with explanatory notes and bilingual search keywords.

Each comparison must resolve to a work actually present at that stage: AP1–212 for U8, AP1–223 for U9, AP1–250 for U10. Do not leave forward references to unimported Units. Uncertain attribution, oral traditions, dates and production sites must be qualified rather than asserted as established facts.

Create a complete, separate English Markdown edition for each Unit at `docs/content/ap-art-history-unit-N-english.md`. Exactly one ordered section per required AP number, with identification, all study fields, recognition anchors, comparisons, required views, sources, image credits and public-image status. These files support a future English version; no language-switch functionality is added now.

## Geography and navigation

Keep `Unit → region → site → AP work`, extending the existing registry and controls. Define regions and tradition/movement groups from the represented works after source review, using English labels. Add direct world-coordinate anchors and visible provenance qualifiers without changing earlier site projections.

For portable, dispersed or relocated objects, do not substitute the current museum for original context. For contemporary installations and performances, distinguish the documented original presentation, site-specific setting, later installation and artist's origin; place the map anchor at the relevant documented context. Distinguish an original object from a later reconstruction, cast, replica or performance photograph.

Switching Units continues to reset incompatible filters. Extend total-count and accessible scope copy at each stage without blanket replacement of AP numbers in earlier works.

## Images and public release

Represent every required view, using either a verified matching local image or an honest source-linked placeholder. Prioritize institution open-access images and explicit image-level Commons grants; record checked candidates and stop unsuccessful searches without blocking complete content delivery.

For each accepted image verify exact artwork identity, specified component/view, essential identifying content, source, creator, license and attribution. A correct building with its essential subject obscured, a generic related object or a different scene is not sufficient. Do not crop away important content or use AI-generated reconstructions as documentary artwork images.

Accepted policy remains Public Domain, CC0, CC BY and CC BY-SA. For contemporary works, an eligible photographer license alone does not establish permission to publicly reproduce the underlying artwork. Where underlying artwork rights, photographic rights or source restrictions are unresolved, use a placeholder; do not describe an unverified permission as a proven copyright restriction or promise an installed private image.

Local derivatives: `assets/art-history/uN/apNUMBER-VIEW.webp`; preserve full identifying content and orientation, maximum edge 2000 pixels, maximum file size 1,572,864 bytes. Do not ship archival originals, CED/textbook/notes extractions, noncommercial-only images, remote hotlinks or private bundles. Preserve source attribution and applicable share-alike terms; disclose derivative processing in the ledger.

Report work completion and image coverage separately. Completing AP1–250 records does not mean 250 images or complete open-image coverage. U10 may require substantially more placeholders under this policy.

## Architecture and evidence

Extend the native inline data projection, Unit/tradition/region/site registries and existing validators rather than introducing a parallel application. Maintain separately reviewable content and media evidence per Unit:

- Ordered manifest, content source, media source, rights ledger and placeholder authority.
- Local public assets and complete English Markdown.
- Integrated source ledger and frozen canonical fixture after review.
- Structural, preservation, rights and focused browser tests.

Validate and review content and media separately before joining by stable work/view IDs. Then review the integrated stage and verify actual UI navigation. Preserve existing negative validations when adding supported Units and paths.

## Acceptance checks per stage

1. Exact consecutive AP range and release total, with no duplicates or omitted identities. Earlier parsed records and credits unchanged.
2. Exact ordered required views matching the reviewed manifest. Complete bilingual fields and ordered English sections; all comparisons resolve.
3. Valid, qualified original-context coordinates and English navigation labels/counts; no false precision for uncertain sites.
4. Every open image local, decodable, within size limits, correctly credited and matched to accepted rights evidence. Every placeholder aligned with its authority record and requesting no image.
5. Standalone and homepage-embedded desktop/mobile traversal of each new work/view through actual Unit/region/site controls; study tabs, comparison jumps, filters, search and cross-Unit resets.
6. Image modal/focus restoration, load-failure fallback, camera fitting, manual zoom/pan/reset, subject round-trip, no horizontal overflow or blocking console errors.
7. Full Node/strict data validation, private-media leak checks and relevant legacy Art/World/Home browser regressions. Expected geometry follows the previously approved shared-height and content-fitting contract.

Deliver the fixed local homepage URL, each English file and exact verified-image/placeholder counts. GitHub push, merge and Desktop synchronization require separate user requests.

## Self-review

The three stages share one existing integration architecture but have separate manifests, evidence and acceptance checkpoints. The ranges are consecutive and sum to59;191+59=250. View counts and region assignments are explicit research outputs before live integration, not invented promises. UI preservation, underlying contemporary artwork rights, honest placeholders, staged comparison resolution and external-write boundaries are specified without incomplete implementation placeholders.
