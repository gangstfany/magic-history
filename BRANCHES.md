# Course Branch Guide

This repository uses short-lived subject development branches and one integrated production branch.

| Course / purpose | Canonical branch | Current role |
| --- | --- | --- |
| Production website | `main` | Integrated, deployable site; update through reviewed pull requests |
| AP United States History | `feature/apush-all-periods-timeline-dock` | APUSH map, Units/Periods 1–9, and APUSH Timeline Dock development |
| AP World History: Modern | `feature/apwh-all-units-card-timeline-dock` | APWH map, explicit Units 1–9 mapping, and card Timeline development |
| AP Art History | `feature/ap-art-history-map` | AP Art History map and unit development |

## Historical and prototype branches

- `feature/ap-art-history-u1` has already been merged into `feature/ap-art-history-map`. Do not merge it separately into `main`.
- `feature/history-timeline-module-prototype` is an optional standalone learning-module prototype. It is not a production subject branch.
- `temporary-apush-period1-c-preview` is a historical preview/integration branch. New APUSH work belongs on the canonical APUSH branch above.

## Collaboration rules

1. Work on the branch for the course being changed.
2. Do not use subject branches as permanent production branches; `main` is the integrated website.
3. Open one pull request per subject so reviewers can see which course changed.
4. Start future feature branches from the latest integrated `main` unless the work explicitly depends on an unfinished subject branch.
5. Do not merge the same historical branch twice under different names.

## Recommended integration order

AP Art History and APUSH can be reviewed in either order because they are independent. APUSH must be merged before APWH because the APWH branch contains the APUSH foundation in its history.

1. `feature/ap-art-history-map` → `main` (may also be step 2)
2. `feature/apush-all-periods-timeline-dock` → `main`
3. `feature/apwh-all-units-card-timeline-dock` → `main`

Run each subject's validation and browser checks in its own pull request before merging.
