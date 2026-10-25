# World History keypoints — audited local preview

This standalone preview contains 240 keypoints (all original 231 IDs retained, plus nine teacher-authored additions) and 18 unit context/synthesis cards. It includes the approved American History-style reader and the 2026-10-25 content corrections.

Open `index.html` directly in a browser, or serve this directory with `python3 -m http.server 8020 --bind 127.0.0.1`. This is an archived, reviewable preview; it does not replace the repository root website. No deployment is configured.

Rebuild and verify from this directory:

```sh
python3 correct_content.py
python3 build.py
python3 test_corrections.py
python3 test_preview.py
node verify-content.cjs
```

`source-map-snapshot.html` and `content-audit-data.json` are the read-only source snapshots. `content-corrected.json` and `correction-ledger.json` record revised content and provenance. The Chinese audit and correction reports document every finding and its disposition. `browser-verification.json` records the nine new entry points, relation return checks, and nine-unit narrow-screen checks.

Original broad AMSCO locators are legacy metadata, not a claim of verbatim verification. Added and revised text is teacher-authored; primary/official references are retained per card.
