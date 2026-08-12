# Subject Branch Organization Design

## Goal

Make the three course workstreams easy to identify without changing any existing website, course data, media, or feature implementation.

## Canonical Branches

- `main`: integrated production website only.
- `feature/apush-all-periods-timeline-dock`: AP United States History development; points to the last reviewed APUSH-only commit, `448cf70`.
- `feature/apwh-all-units-card-timeline-dock`: AP World History: Modern development; preserves the current branch and all APWH work.
- `feature/ap-art-history-map`: AP Art History development; preserves the existing remote branch.

`feature/ap-art-history-u1` remains historical because it has already been merged into `feature/ap-art-history-map`. It is not deleted or merged again.

## Safety Boundaries

This organization does not:

- rewrite or rebase any branch;
- change any existing commit;
- modify website code, course content, data, images, or tests;
- merge anything into `main`;
- delete any AP Art History branch;
- rename the current APWH branch.

The only Git ref change is recreating the APUSH branch at the existing APUSH release commit and pushing that branch name to GitHub. A separate branch guide documents ownership and merge order.

## Future Merge Order

AP Art History and APUSH can be reviewed independently. APUSH must merge before APWH because the APWH branch contains the APUSH commits in its ancestry. The recommended production sequence is:

1. `feature/ap-art-history-map` to `main` (or APUSH first; these are independent);
2. `feature/apush-all-periods-timeline-dock` to `main`;
3. `feature/apwh-all-units-card-timeline-dock` to `main`.

Every merge should happen through a separate pull request with its subject-specific tests passing.
