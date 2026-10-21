# Canonical branches and ownership

`main` is protected integration / release history. Do not automatically merge this reorganization into main.

| Branch | Responsibility |
| --- | --- |
| `shared/site` | Shared site shell, account UI/service, callback, vendor SDK, `assets/map-ui.css`, global navigation and iframe sizing coordination |
| `course/world-history` | `world-map.html`, World study directory / host behavior, `data/apwh-u1-location-study.js` through U9, World tests and verification |
| `course/art-history` | `art-history-map.html`, Art assets/data/content/source ledgers, Art tests and verification |

Both course branches start at the same shared/site commit; they are siblings, not ancestors of each other. Open the shared PR first. After it is reviewed and integrated, open independent course PRs against the appropriate updated main. Resolve shared changes once, and coordinate the course-specific `index.html` hunks (World host behavior versus Art 250-work caption). Preserve both assertion sets in any integrated tests; do not skip tests to resolve conflicts.

`index.html` is a shared host: coordinate edits across courses instead of copying the whole file. `assets/map-ui.css` is shared; a course needing a changed selector must review its impact on the other embedded and standalone pages. Do not merge whole course branches into each other merely to obtain a shared fix. Prefer a reviewed shared change and propagate it deliberately.

Key Terms is not a separate page: its renderer is `studyDetailHTML` in `world-map.html`, and its content is in the APWH U1–U9 location-study data. The UI handoff document records a historical `4756151` extraction; course features described there do not all ship on shared/site by itself.

All old local and remote refs remain retained as historical references, not canonical collaboration targets. In particular `feature/ap-art-history-u6` retains its dirty working tree and pending/private images; those uncommitted files and `.private-media` are not published by this extraction. No source working tree or real index is staged or reset.

APUSH's existing `feature/apush-all-periods-timeline-dock` remains unchanged. Do not overwrite or cross-merge its implementation as part of this work. APUSH may reference shared UI patterns through a separately reviewed adaptation.
