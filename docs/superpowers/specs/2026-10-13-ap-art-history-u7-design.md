# AP Art History Unit 7 integration design

Date: 2026-10-13

Status: Product approach approved; written specification awaiting review.

Branch: Keep `feature/ap-art-history-u6`. Baseline: `f4e64e6`.

## Goal and boundaries

Add all 11 Unit 7 works, AP 181–191, to the existing Art History map and homepage. Preserve the newly approved shared typography, responsive canvas heights, content-aware camera, manual zoom/pan and 1:1 overview. Preserve Units 1–6 and World History content and functionality. Do not redesign the UI, alter the timeline, introduce private-media bundles, merge to main, push, or synchronize Desktop without a separate request.

## Official identity and view contract

The [College Board Unit 7 image set](https://secure-media.collegeboard.org/digitalServices/pdf/ap/ap-art-history-ced-content-area-7-west-and-central-asia.pdf), printed pp. 132–137, defines 11 identities and 20 views. Its age must be recorded in the ledger, and identity/view scope must be cross-checked against the current [Course and Exam Description](https://apcentral.collegeboard.org/media/pdf/ap-art-history-course-and-exam-description.pdf) before freezing the implementation manifest. The current full PDF could not be opened by the web reader because of its size; the scope is also consistent with the live site's AP_UNITS registry and current [course page](https://apcentral.collegeboard.org/courses/ap-art-history).

| AP | English title | Ordered view IDs |
| ---: | --- | --- |
| 181 | Petra, Jordan: Treasury and Great Temple | `petra-context`, `treasury`, `great-temple` |
| 182 | Buddha | `buddha-front`, `buddha-context` |
| 183 | The Kaaba | `circumambulation`, `exterior`, `gathering-context` |
| 184 | Jowo Rinpoche, enshrined in the Jokhang Temple | `primary` |
| 185 | Dome of the Rock | `exterior`, `interior` |
| 186 | Great Mosque (Masjid-e Jameh) | `iwan`, `iwan-detail`, `courtyard`, `mihrab` |
| 187 | Folio from a Qur'an | `primary` |
| 188 | Basin (Baptistère de St. Louis) | `primary` |
| 189 | Bahram Gur Fights the Karg, folio from the Great Il-Khanid Shahnama | `primary` |
| 190 | The Court of Gayumars, folio from Shah Tahmasp's Shahnama | `primary` |
| 191 | The Ardabil Carpet | `primary` |

View IDs are application identifiers, not licenses or assertions that a particular photograph qualifies. Each view must receive a precise description based on visual reference and authoritative object evidence. AP 182's reference views show the historical sculpture: a modern empty niche cannot silently replace either view. AP 186 must be the correct mosque and named architectural part. Plans or unrelated contextual photos are not substitutes.

## Live content and English edition

Use the existing record schema: stable ID, official AP number and Unit, English title, Chinese subtitle, artist/maker, precise culture/tradition, dates, materials, type, site, coordinates, provenance qualifier, recognition anchors, function/form/content/context, comparisons and search terms. Preserve concise bilingual study explanations and the four existing detail tabs. At least one comparison per work must resolve to an actual AP 1–191 record and explain a specific comparison basis.

Create `docs/content/ap-art-history-unit-7-english.md`, with exactly one ordered section per AP 181–191. Each section includes identification, function, form, content, context, recognition anchors, comparisons, ordered views, sources and credit notes. It must be a usable complete English edition, not a title-only outline.

User sources remain `APAH notes.pdf` and the supplied textbook/notes directory, especially the Smarthistory guide volume four. Consult museum, monument, conservation and Smarthistory authorities to reconcile dates, attribution and interpretation. Summarize independently; do not publish textbook or notes imagery.

## Geography and filtering

Keep `Unit → region → creation-context site → AP work`, English region/filter labels, and `pieces` counts. Unit 7 navigation groups will cover the represented Levant, Arabian Peninsula, Iranian, Afghan/Central Asian and Tibetan/Himalayan contexts, based on actual record coordinates rather than present museum locations.

Do not invent a workshop or city for uncertain portable works. AP 187's broad origin, AP 188's debated production context, and AP 191's workshop attribution require explicit provenance qualification where evidence is uncertain. A maker's geographical name is not automatic proof of a production site. Religions, dynasties and historical regions must not be collapsed into a single generic Islamic culture; include Buddhist traditions accurately.

Switching Unit resets incompatible filters. Region/culture, period, type and search use the existing controls and automatic padded camera fitting. Selecting an artwork focuses its location. 1:1 and manual navigation remain authoritative, including cancellation of pending search-focus updates. Update totals and accessibility copy from 180/Units 1–6 to 191/Units 1–7.

## Public image policy

Reuse the approved local-image workflow. Accept only verified Public Domain, CC0, CC BY or CC BY-SA image-level rights. Check exact object, named view, photographer/source, license and attribution before importing. Website availability, a search thumbnail or the object's age alone does not establish a reusable photograph license.

Eligible derivatives live under `assets/art-history/u7/` with AP number and stable view ID. Preserve essential content, correct orientation, prefer WebP, cap the long edge at 2000 pixels and file size at 1,572,864 bytes. Do not commit archival originals or CED/notes extractions. Do not hotlink accepted public media.

If an exact eligible image cannot be verified, retain the existing explicit placeholder and source link, recording sources checked and the reason. Do not substitute another object or reuse one asset for distinct required views. Report verified image versus placeholder counts honestly; all 20 views must be represented even if not all have public images.

## Data and evidence files

Add the Unit 7 manifest, rights evidence and placeholder authority using the current Unit 6 conventions. Create `docs/data-sources/u7-source-ledger.md` with official identity/view evidence, factual sources, geographical uncertainty, local media paths, exact-view identity notes, attribution, license URLs, access dates and derivative notes. Freeze canonical fixtures only after checking data against the official manifest and sources. Extend existing validation/import mechanisms rather than adding an unrelated pipeline.

## Acceptance and delivery

- Exactly AP 1–191, each number once; existing AP 1–180 records unchanged.
- Exact U7 order and 20 required-view IDs; no false completion via missing or duplicated views.
- Complete bilingual live content and 11-section English edition.
- All comparisons resolve and all coordinates are finite and honest about uncertain origins.
- Every public image is local, loads with nonzero dimensions, has accepted rights and exact-view evidence, and satisfies size limits; placeholders issue no image request.
- Test Unit switching, all U7 work/view navigation, filters, search, study tabs, comparisons, image modal/focus restoration, camera fitting, 1:1, subject switching and missing-image fallback.
- Verify standalone and homepage-embedded desktop/mobile, shared typography and canvas heights, no horizontal overflow and no blocking console errors.
- Re-run preservation, rights, structural, browser and World/Home regression checks.
- Deliver a local preview and exact image coverage. GitHub push remains a separate approval.

## Self-review

Scope is one Unit integration with existing UI and media architecture. No new controls or private-mode framework are required. Official current-CED cross-check is an explicit research prerequisite, not assumed completed. No image eligibility is promised before rights review. The 20-view table sums to 20; all 11 AP numbers are consecutive. Existing branch, bilingual and English-edition requirements are preserved.
