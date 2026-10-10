# AP Art History U5–U6 Open-License Local Media Design

**Date:** 2026-10-08  
**Branch:** `feature/ap-art-history-u6`  
**Status:** User-approved design pending written-spec review and implementation planning

## Goal

Replace unreliable remote media and eligible placeholders in AP Art History Units 5 and 6 with repository-local, web-optimized images that are safe to publish in the public GitHub repository.

The release covers every College Board-required media view in the two Units: 27 Unit 5 views and 23 Unit 6 views, for a 50-view audit surface. An image may be added only when it exactly depicts the required AP work and the named required view. A similar work, contextual photograph, performance analogue, reconstruction of a different site, or merely representative cultural object is not an acceptable substitute.

## Confirmed Product Decisions

- Audit all 50 required U5–U6 views, not only the current placeholders.
- Localize every accepted U5–U6 image into the repository so the page does not depend on external image hotlinks.
- Accept only Public Domain, CC0, CC BY, and CC BY-SA images.
- Require exact identity at both the AP-work and required-view level.
- Retain the established placeholder when an exact, eligible image cannot be verified.
- Do not use a close substitute, even when that would increase apparent image coverage.
- Preserve the existing map layout, typography, detail hierarchy, filters, study content, and interaction behavior.
- Keep concise credit and license information in the detail experience and full evidence in the source ledgers.
- Optimize images for the web and do not commit full-size archival masters.
- Complete the work on `feature/ap-art-history-u6`; provide a local preview before any new push.

## Current Baseline

The current public datasets contain:

| Unit | Required views | Remote public images | Placeholders |
| --- | ---: | ---: | ---: |
| U5 | 27 | 16 | 11 |
| U6 | 23 | 2 | 21 |
| **Total** | **50** | **18** | **32** |

The 18 existing remote images are not automatically grandfathered in. Each must pass the same identity and license audit before it is downloaded, optimized, and converted to a local path. A previously displayed image that fails the new rules becomes or remains an explicit placeholder.

## Allowed Rights Classes

An image is release-eligible only when its authoritative source page explicitly provides one of:

- Public Domain or Public Domain Mark;
- CC0;
- CC BY, any valid version;
- CC BY-SA, any valid version.

CC BY-NC, CC BY-ND, CC BY-NC-SA, CC BY-NC-ND, custom noncommercial terms, educational-use-only terms, permission-required statements, fair-use claims, ordinary museum terms of use, and pages that merely make an image viewable are not eligible.

College Board materials establish course identity and required views but do not provide a reusable license. Images embedded in the CED, classroom PDFs, notes, or textbooks must not be extracted and published.

For CC BY-SA media, the optimized derivative uses the same license or a license explicitly permitted by the source license's compatibility rules. The ledger records the applied license and that the repository copy was resized and/or format-converted.

## Exact-View Identity Rule

Every accepted image must satisfy all of the following:

1. The source identifies the same work as the official AP entry.
2. The depicted content matches the specific required view ID, not only the composite work.
3. Artist or maker, culture or community, date, medium, location or collection, and identifying visual details are consistent with the official entry.
4. For architectural works, labels such as plan, façade, interior, observatory, wall, structure number, or market context are verified independently.
5. For masks, stools, plaques, performance views, open/closed states, and contextual views, the image depicts the exact required object or documented performance/context named by the AP image set.
6. The ledger links to a source page that a reviewer can use to verify both identity and rights.

Search-result thumbnails, aggregators, Pinterest, blogs, unattributed reposts, and reverse-image matches are discovery aids only. They are never evidence.

If exact identity remains uncertain, the view stays a placeholder.

## Source Priority

Research follows this priority:

1. Wikimedia Commons file pages with explicit structured license and identity metadata;
2. owning museums, cultural institutions, archives, monuments, government agencies, or artist estates with explicit Open Access or accepted Creative Commons terms;
3. other authoritative repositories that explicitly identify the exact view and grant one of the allowed licenses.

The authoritative license must apply to the image file itself. A public institution's general educational mission or an object's age is not evidence that its photograph can be republished.

## Local Asset Architecture

Accepted images live under:

```text
assets/art-history/
  u5/
    ap153-relief-sculpture.webp
    ...
  u6/
    ap167-conical-tower.webp
    ...
```

Filenames use the AP number and stable view ID. The live U5/U6 media records use repository-relative paths only. No accepted U5/U6 view retains a remote `http://` or `https://` image URL.

Optimization rules:

- preserve the complete identifying content and avoid crops that remove the work's essential feature;
- correct EXIF orientation before export;
- use WebP by default and JPEG or PNG only when transparency, line clarity, or source constraints require it;
- cap the long edge at an implementation-tested web size, initially 2000 pixels unless a plan-level test justifies a different threshold;
- target no more than 1.5 MB per asset, with stricter compression when it does not harm identification;
- strip unnecessary metadata while retaining attribution and license evidence in the repository ledger;
- do not store the archival original in Git.

AP167's current multi-thousand-pixel, roughly 19 MB remote original is specifically included in this optimization pass.

## Data and Evidence Model

The implementation reuses the existing manifests, rights data, canonical/browser fixtures, and source ledgers rather than creating an unrelated media system.

Every accepted view records at least:

- AP number and stable view ID;
- exact English work and view name;
- local asset path;
- source page URL;
- original file URL when distinct from the source page;
- creator or photographer;
- owning or publishing institution;
- normalized license name and version;
- license URL;
- required attribution text;
- date accessed;
- notes proving exact-view identity;
- derivative note for resizing, cropping, or format conversion.

Every unresolved view records:

- `imageUrl: null` or the existing equivalent placeholder state;
- exact official source identity;
- a visible-content description suitable for the established placeholder;
- the reason no image qualified, normally `exact open-license image not verified`;
- the sources checked during the audit.

The source ledger remains the human-reviewable evidence surface. Machine-readable rights and fixture files remain the validator authority where they already exist.

## UI Behavior

The media change must not redesign the page.

- The current image container, ordered view controls, object containment behavior, modal behavior, and fallback remain in place.
- Images use a complete, uncropped default presentation when cropping would hide important content.
- The detail panel continues to show a concise credit/source line; the full legal and audit record remains in the ledger.
- Multi-view works receive one independently verified asset or placeholder per named view. One photograph cannot silently fill two different required views.
- A local file that fails to load falls back to the existing unavailable-image treatment without breaking study tabs, comparison navigation, filters, or map controls.

## Research and Import Workflow

1. Freeze the current 50-view list from the U5 and U6 manifests.
2. Build a row-by-row audit table for all 50 views, including the 18 currently displayed images.
3. Search authoritative sources in priority order and verify exact identity before considering rights.
4. Verify the image-level license against the allowed list.
5. Download eligible originals to temporary storage, optimize them, and add only the web derivative to the repository.
6. Update the relevant media record, rights evidence, fixtures, and source ledger together.
7. Leave unresolved or ineligible rows as explicit placeholders with audit notes.
8. Regenerate or synchronize the live `art-history-map.html` projection using the repository's existing workflow.
9. Run structural, rights, asset, browser, regression, and release checks.
10. Report exact final coverage before asking the user to review the local preview.

## Validation Contract

Automated validation must prove:

- the exact 27 U5 and 23 U6 required-view sequences are unchanged;
- every non-placeholder U5/U6 image path is repository-relative and resolves to a committed file;
- no U5/U6 live image path is a remote URL after migration;
- every accepted image has an allowed normalized license, source page, attribution, and identity note;
- no restricted key is silently converted to release-ready without new accepted evidence;
- no local absolute path, private-media path, College Board extraction, or untracked asset enters public data;
- duplicate local assets across different required view IDs are rejected;
- local assets stay within the approved dimension and file-size thresholds;
- Units 1–4 and `world-map.html` remain protected from unrelated change;
- the total artwork count remains 180 and all existing U5/U6 study content remains intact.

Browser verification must traverse all 50 views and confirm:

- accepted images load with nonzero natural dimensions and no 404 response;
- placeholders make no image request;
- essential visual content is visible and not removed by cropping;
- ordered view switching, filters, search, tabs, comparison navigation, modal behavior, and focus restoration continue to work;
- standalone and homepage-embedded desktop views work without blocking console errors;
- the established mobile smoke viewport has no new horizontal overflow or inaccessible control.

## Failure Handling

- Exact image but ineligible license: keep the placeholder.
- Allowed license but uncertain view identity: keep the placeholder.
- Source page unavailable or rights wording ambiguous: keep the placeholder.
- Asset download or conversion failure: do not commit a partial or corrupt file; keep the previous verified state.
- Image loads but hides the defining feature: adjust containment/export without changing identity; otherwise reject it.
- Rights or identity evidence conflicts across sources: use the most authoritative source only when the conflict can be resolved and documented; otherwise keep the placeholder.
- Any failed preservation, browser, or release gate blocks completion and push.

## Reporting

The final handoff reports coverage truthfully in this form:

```text
U5: 27 required views — N local open-license images, M placeholders
U6: 23 required views — N local open-license images, M placeholders
Total: 50 required views — N local open-license images, M placeholders
```

Placeholders are not counted as completed images. The handoff identifies every remaining AP/view key and why it could not be published.

## Out of Scope

- Approximate, contextual, or stylistically similar substitutes;
- images with NC, ND, custom restrictive, educational-only, fair-use, or unclear terms;
- extracting images from the College Board CED, user notes, textbooks, or paywalled resources;
- redesigning the map, changing study content, adding new functionality, or altering the timeline;
- localizing Units 1–4 in this release;
- adding private or ignored media as a substitute for the public GitHub edition;
- storing archival master images in Git.

## Acceptance Criteria

The work is ready for user preview when:

1. Every one of the 50 U5/U6 required views has been independently audited.
2. Every displayed image exactly matches the official work and required view.
3. Every displayed image uses an allowed license and has complete evidence.
4. Every displayed image is a committed, optimized local asset; U5/U6 no longer depend on remote image hotlinks.
5. Every unresolved view remains an honest, usable placeholder with documented research status.
6. Existing U5/U6 map behavior and study content are preserved.
7. Focused tests, the full regression suite, browser traversal, and public-release checks pass.
8. The final coverage report states the actual image and placeholder counts.
9. A local preview is provided to the user before any new push to GitHub.
