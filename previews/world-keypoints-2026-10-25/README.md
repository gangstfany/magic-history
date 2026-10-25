# APWH reviewed version — 2026-10-25

Current reviewed World History entry: `index.html` in this directory. The consolidated collaboration branch is `course/apwh`.

This self-contained version includes 240 keypoints, 18 unit cards, static causal selection with map cards, and six trade/exchange networks within the causal module. The audit fixes cover historical wording, Potosí geography, first-step camera restoration and standalone navigation/reading position. The root site files retain the shared multi-course integration baseline; this directory is the current reviewed World History version, with no deployment configured by this push.

Serve this directory with `python3 -m http.server 8020 --bind 127.0.0.1` and open the local URL.

Rebuild and verify here:

```sh
python3 build.py
python3 -m unittest test_corrections.py test_preview.py
node --test test-map-layout.cjs test-causal-journey.cjs test-trade-routes.cjs test-causal-workspace.cjs test-review-regressions.cjs
node verify-content.cjs
```

`source-map-snapshot.html` and `content-audit-data.json` preserve source snapshots. `correct_content.py`, `content-corrected.json`, `correction-ledger.json` and `chain-review-revisions.json` retain correction provenance. The Chinese audit and remediation reports document scope and verification. Earlier browser verification JSON files are historical records; the latest fixes and checks are described in `整改完成_因果链与商路_2026-10-25.md`.

The pure journey clock remains for trade playback; causal-chain rendering has no moving marker or automatic playback. Original broad AMSCO locators are legacy metadata, not verbatim source verification. Added and revised prose is teacher-authored.
