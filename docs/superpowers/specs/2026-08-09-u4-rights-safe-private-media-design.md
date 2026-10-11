# AP Art History U4 Rights-Safe Public and Private Media Design

**Date:** 2026-08-09  
**Branch:** `feature/ap-art-history-u4`  
**Status:** Approved design, pending implementation plan

## Goal

Complete all 54 Unit 4 works while keeping the GitHub version safe for public distribution. Rights-cleared media remains visible everywhere. Eight required views whose exact artwork or photograph lacks portable public-web permission use a stable public placeholder. A separate ignored local media bundle restores the complete images for the developer's private study copy.

This design amends the media and release-policy portions of the approved U4 specification. The official AP sequence, 54-work scope, 63 required-view scope, bilingual study content, map hierarchy, filters, comparisons, typography, and no-timeline constraint remain unchanged.

## Rights Boundary

The following required media keys are local-only unless future permission is obtained:

- `ap140-two-fridas::primary`
- `ap143-dream-alameda-central::primary`
- `ap146-marilyn-diptych::primary`
- `ap148-narcissus-garden::primary`
- `ap149-bay::primary`
- `ap150-lipstick-caterpillar-tracks::primary`
- `ap152-house-new-castle-county::exterior`
- `ap152-house-new-castle-county::interior`

The tracked repository must not contain their image files, remote image URLs, machine-specific absolute paths, or an assertion that the images are openly licensed. The public record may retain a human-readable official identity/source page and an accurate rights explanation.

## Chosen Architecture

### Public canonical data

All 54 U4 works and all 63 required view IDs remain present in the tracked canonical fixture. Rights-cleared views retain the existing normalized media schema. Each rights-restricted view instead uses the explicit public representation:

```json
{
  "id": "primary",
  "label": "Primary view",
  "imageUrl": null,
  "imageAlt": "The Two Fridas — public image unavailable because of rights restrictions",
  "imageSourceName": "Museo de Arte Moderno / INBAL",
  "imageSourceUrl": "https://inba.gob.mx/prensa/23566/el-museo-de-arte-moderno-presenta-las-dos-fridas-una-identidad-global",
  "mediaStatus": "rightsRestricted"
}
```

`imageSourceUrl` must identify the exact work or required view. It is not an image URL. The validator accepts `imageUrl: null` only when `mediaStatus` is exactly `rightsRestricted` and the media key is one of the eight frozen keys above. A normal media view may not use this exception.

The public rights audit keeps one entry for every manifest-derived media key. A restricted public placeholder uses `releaseClass: "restricted"` truthfully. Release validation permits a restricted entry only when the corresponding public media record has no image URL and uses the exact placeholder contract. Any restricted entry paired with a shippable image URL remains a release-blocking error.

### Private local bundle

Private media is stored under:

```text
.private-media/
└── u4/
    ├── overrides.js
    ├── ap140-two-fridas-primary.jpg
    ├── ...
    └── ap152-house-new-castle-county-interior.jpg
```

The entire `.private-media/` directory is ignored by Git. `overrides.js` maps only the eight exact media keys to relative local files and private-study attribution metadata. It contains no application code beyond assigning a frozen data object to the documented private-media hook.

The tracked repository contains a schema validator and test fixture for the hook, but no real private file, remote restricted image URL, or local absolute path.

### Activation and propagation

Private media is opt-in through the query parameter:

```text
index.html?privateMedia=1
art-history-map.html?privateMedia=1
```

The homepage propagates the flag to the Art History iframe only. The World History iframe and other subjects are unchanged. Without the flag, the application never attempts to load the private override.

With the flag, the Art History page attempts to load `.private-media/u4/overrides.js`. A valid entry replaces only the matching view-model image URL and private attribution; it never rewrites the tracked canonical data object. Missing or invalid entries remain public placeholders.

Adding `privateMedia=1` to a GitHub URL does not expose private media because the private directory is absent. The failed optional load is handled as a normal unavailable state, not as an application error.

## Public Placeholder UI

The selected design is the full-height exhibition-style placeholder.

- It occupies the same media area and approximate height as a normal artwork image, preventing detail-panel layout jumps.
- It uses the existing warm neutral background, border radius, typography, spacing, and 44-pixel touch-target rules.
- It shows an understated rights icon, the English line `Image unavailable in the public version`, a concise Chinese explanation, and a `View official source` link.
- It is a normal content state rather than an image-load error.
- It does not open the image dialog and does not create an image request.
- For AP 152, both required view buttons remain visible and accessible. Selecting either view updates the label, explanation, and official source for that exact view.

The existing generic image-error fallback remains separate. A rights placeholder must never be rendered by deliberately causing an image request to fail.

## Private Mode Behavior

When a valid local override is present:

- The image, view switcher, credit, source, modal, keyboard behavior, and focus restoration match rights-cleared media.
- The complete image uses the shared `object-fit: contain` rule.
- The public canonical title, AP number, study tabs, comparisons, and source identity remain authoritative.

When the private bundle, override entry, or local image is missing:

- The exact view falls back to the public placeholder.
- The placeholder adds the local-only status `Private image not installed` without exposing a filesystem path.
- Other views and works remain usable.
- No unhandled exception, broken image icon, partial marker render, or focus loss is allowed.

## Data and Source Flow

1. The U4 manifest freezes the 54 identities and 63 ordered required views.
2. The public ledger records all 63 view identities, source pages, attribution, and truthful rights status. The `Image` cell remains an HTTPS Markdown image link for a rights-cleared view. For one of the eight frozen restricted keys it is exactly the literal `Rights-restricted public placeholder`; the parser accepts that literal only when the canonical view has `imageUrl: null` and `mediaStatus: "rightsRestricted"`.
3. The public rights audit records the exact release class for every media key, including eight restricted placeholders.
4. The canonical fixture projects 55 rights-cleared image views plus eight public placeholders.
5. Live HTML later receives that public canonical projection unchanged.
6. Private mode merges the ignored override into an ephemeral runtime view model for the eight keys only.
7. Public and private browser verification exercise the same work/view ordering and study behavior.

## Validation and Test Contracts

### Public data

- Exact AP 99–152 order, 54 works, and 63 view IDs.
- Exact frozen set of eight restricted placeholder keys.
- `imageUrl: null` is allowed only for those keys and only with `mediaStatus: "rightsRestricted"`.
- Every placeholder retains a nonempty alt/status description and an exact HTTPS identity/source page.
- No restricted remote image URL or local absolute path appears in tracked source, data, docs, fixtures, or generated HTML.
- Normal media retains HTTPS, uniqueness, alt-text, source, credit, and release-policy checks.
- The public browser verifier observes zero image requests for the eight restricted keys.

### Private overlay

- The hook accepts only the eight exact keys, relative `.private-media/u4/` file paths, and the approved field schema.
- Absolute paths, `..` traversal, remote URLs, extra keys, duplicate paths, and executable values are rejected.
- Tests use temporary benign image fixtures or request interception; real restricted files never enter the repository.
- Private-mode tests verify view switching, attribution, modal content, keyboard focus, and missing-file fallback.

### Release and Git safety

- `.gitignore` includes `.private-media/`.
- Release verification fails if Git tracks anything below `.private-media/`.
- Release verification scans the U4 diff for the reviewed restricted remote image URLs and machine-specific absolute paths.
- Desktop hash verification treats the private bundle as a separate local-only delivery, outside the Git delivery list.
- GitHub push and pull-request steps include only the public delivery list.

## Desktop Delivery

The verified public U4 files are copied from the U4 worktree to the Desktop project using the existing backup-and-hash workflow. The local private bundle is then copied separately to the Desktop project's ignored `.private-media/u4/` directory and hash-checked against its workspace-local private bundle.

The final local preview uses `index.html?privateMedia=1`. The final public preview uses the same page without the parameter. Both previews must show 152 works and identical non-media study behavior.

## Error Handling

- Missing private bundle: public placeholder, no fatal error.
- Invalid private override schema: ignore the invalid entry, retain public placeholder, record a bounded developer warning in private mode only.
- Missing/corrupt local image: switch that view to `Private image not installed`; keep controls usable.
- Restricted public record with a non-null image URL: validator and release gate fail.
- Unapproved restricted key: validator fails.
- Source-page or rights mismatch: canonical/source/rights tests fail with the exact media key.

## Out of Scope

- Uploading private images to GitHub, GitHub Pages, or another public host.
- Claiming fair use, open licensing, or permission for the eight restricted images.
- A user-facing account, entitlement, or authentication system.
- A general media download manager.
- Changes to World History UI, typography, iframe sizing, or data.
- Timeline functionality.

## Success Criteria

1. The public GitHub-ready build contains all 54 U4 works and 63 logical views while making no image request for the eight restricted views.
2. The public placeholder matches the established visual system and preserves detail-panel layout.
3. The ignored private bundle restores all eight images locally through `?privateMedia=1`.
4. No restricted image, restricted remote image URL, or machine-specific private path is committed.
5. U1–U3 remain field-for-field preserved, and the complete public and private release tests pass.
