# Account authentication foundation implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add honest, configurable email/password and Google account flows to the existing homepage without gating maps, collecting real payments or fabricating sessions.

**Architecture:** Isolate a testable Supabase auth adapter from native-dialog UI. An empty public configuration intentionally makes controls unavailable with clear setup text. A pinned locally vendored SDK loads only when configuration is valid. A single callback page handles PKCE exchange and verified recovery; only predefined same-origin return routes are permitted.

**Tech Stack:** Existing static HTML/CSS, browser ES modules, Supabase JS2.118.0 UMD distribution, Node test runner, Playwright. No new root package manager or frontend framework.

---

## Workspace and preservation

Reuse the linked worktree on feature/ap-art-history-u6. Existing public supplementation and ignored complete-study images belong to ongoing work: do not reset, stage, commit, push or copy unrelated changes. Do not edit world-map.html, art-history-map.html or their datasets for this feature. Main owns dependency vendoring and final integration/review; implementation tasks have disjoint files and run with spec/quality review checkpoints.

## Task1 — Adapter and security boundaries

Completed adapter implementation and independent spec/quality review. Fresh core run: 29/29 controlled-SDK tests passed; quality reviewer additionally exercised the pinned real SDK with mocked fetch for logout → login refresh. Live-provider validation remains pending configuration.

Files: create assets/auth/auth-service.mjs, assets/auth/auth-config.mjs, tests/account-auth-service.test.mjs.

- [x] Write tests that dynamically import the new module and assert missing configuration returns an unconfigured service without constructing a client. Run node --test tests/account-auth-service.test.mjs and observe failure before implementation.
- [x] Define these exports: validateAuthConfig(raw), validateAuthFields(mode,fields), safeReturnUrl(value,siteUrl), createAuthService({config,createClient,siteUrl}).
- [x] Configuration has supabaseUrl, publishableKey, googleEnabled. Empty values mean unconfigured; only HTTPS project URLs (or explicit loopback HTTP development URLs) are accepted. Reject secret/service-role keys. Never treat an API key's decoded claims as user authorization.
- [x] Service API: initialize(), subscribe(listener), signIn({email,password}), signUp({email,password,confirmPassword}), requestPasswordReset({email}), signInGoogle(), handleCallback({search,hash}), updatePassword({password,confirmPassword}), signOut(), dispose(). All actions resolve {ok,code,message}; UI never displays raw provider error strings or secrets. State is {status,user,recovery,message}; user contains only id/email; statuses unconfigured/loading/guest/authenticated/recovery/error. Subscribe immediately emits state and returns an unsubscribe function.
- [x] Construct SDK with PKCE, detectSessionInUrl:false, autoRefreshToken:true and persistSession:true. Verify current users with provider getUser, not an editable local identity. Listener callbacks schedule provider reads outside the auth callback lock. Reject missing/expired identities. Sign-out clears UI state even on network failure; local SDK credentials must also be removed or a failure clearly reported, never silently resurrected on reload.
- [x] Enforce password confirmation and12character minimum for signup/update (login accepts existing nonempty passwords). Only provider PASSWORD_RECOVERY events plus a verified user allow reset; an arbitrary URL query or existing regular session does not. Recovery privilege is not persisted across reload. A stale/replayed callback gives actionable retry text.
- [x] Use callback URL auth-callback.html relative to configured siteUrl. Exact same-origin allowlist contains site index.html, world-map.html, art-history-map.html; all external, protocol-relative, credential-bearing or unknown return targets resolve to index.html. No raw tokens or passwords in logs/URLs. Request reset responses do not reveal whether an email exists.
- [x] Expand tests with a controllable fake SDK for method arguments, PKCE options, callback errors, invalid config, waiting-for-email signup, valid login, forged local session, recovery proof, expiry and logout failures. Distinguish these contract tests from real Supabase integration.

## Task2 — UI and homepage integration

Files: create assets/auth/account-ui.mjs, assets/auth/account-bootstrap.mjs, assets/auth/account.css, auth-callback.html; modify only index.html's account hook and module/stylesheet tags; create tests/account-ui.test.mjs and scripts/verify-account-browser.mjs.

- [x] Write failing structural/browser assertions for a homepage account button and labelled native dialog before adding markup. Existing maps and subject controls must remain functional.
- [x] Add only the nav account button and account module/stylesheet hooks to index.html. An independent module injects the dialog; all selectors/styles are scoped. No broad nav rewriting. The offline/unconfigured default opens the UI, says the service is not connected, disables provider submissions, and never sends an auth request.
- [x] Export mountAccountUI({document,service,callbackMode:false}). Use only the Task1 API. Build email/password/confirmation fields, mode buttons, forgot-password, Google, logout and password-visibility controls. Set real labels, autocomplete, field-level errors, nonenumerating reset text, pending state and duplicate-action guard. Render user data with textContent, not HTML.
- [x] Reset passwords through the same component in callbackMode, gated by service recovery state. Bootstrap creates a validated adapter; dynamically loads the pinned local UMD only with real configuration; uses window.supabase.createClient. On callback, remove OAuth query/hash from history after exchange and display a safe success/return action. Do not auto-navigate arbitrary return URLs.
- [x] On close/Escape return focus to the account trigger, clear password inputs, and prevent late async results from reopening a closed modal. On mobile do not overflow or zoom form inputs; preserve map-ui typography variables and font family. No legal-consent checkbox linking nonexistent policies. Use a setup notice in the unconfigured development version.
- [x] Browser tests cover1440x1000,375x812 and812x375, reduced motion, keyboard, visibility toggles, validation, busy/error/success/confirmation/recovery/logout through injected test service, blocked provider with missing config and homepage map switching. No network real-account claim from fakes.

## Task3 — Vendoring and setup handoff

Files: create assets/vendor/supabase-js-2.118.0.js, assets/vendor/SUPABASE-LICENSE, assets/vendor/README.md, docs/setup/accounts-supabase.md.

- [x] Download the exact npm package from registry.npmjs.org, inspect package files, copy only its browser UMD and license, record version/source/SHA256 and no runtime CDN dependency.
- [x] Document owner-held project creation, publishable—not secret—configuration, email confirmation, local callback URLs for4173/4174, Google consent test users, provider callback vs app return URL, custom SMTP before public email signup, safe key handling, network verification and real smoke-test checklist.
- [x] Clearly mark true account/email/Google tests pending until owner credentials and provider configuration exist. Payments, paid-unit access enforcement and admin privileges are deferred by approved scope.

## Verification and review

2026-10-21 pre-push boundary: account/UI handoff changes are staged independently of the pending public-media batch. The separate media browser stress test still reproduces the previously documented Rarotonga marker-packing error; no media changes or private assets are included in this account commit. The pinned SDK is byte-for-byte upstream (checksum tested), including upstream trailing whitespace; authored-file whitespace checks exclude that immutable vendor artifact. Key Terms rendering/data were confirmed present on remote main as well as the Art branch; the latest shared typography file is on the Art branch.

Baseline before account changes: 1017 Node tests and 21 Python tests passed. Vendored SDK integrity/API test also passes. Post-integration results are recorded below.

Final evidence (2026-10-20): full Node suite 1051/1051 passed with local-browser/port permissions; Python 21/21 passed. Root reran account browser checks successfully at 1440×1000, 375×812, 812×375 with reduced motion, callback URL scrub, unproven recovery blocked, direct callback feedback, and World → Art → World smoke. Desktop/mobile screenshots visually inspected. Independent adapter and UI/vendor spec reviews and final quality/security review passed; final reviewer independently reran 34 account tests. `git diff --check` clean. Homepage adds only account button/style/module hooks; no additional map/data changes from this task. Existing localhost4174 preview is active. No staging, commits, push, merge or Desktop sync performed. True provider/email/Google flows remain pending Tiffany-owned configuration and live testing.

- [x] Run baseline full Node/Python tests before implementation, then new tests and complete regression after integration. Use the bundled Node/Python runtimes already used by this project.
- [x] Obtain independent spec-compliance review, fix findings, then quality/security review and fix findings. Read verification-before-completion before final claims.
- [x] Confirm no public/private image changes beyond the already-existing batch, no auth secrets, no paid-role bypass, no payment requests, no commits/pushes of unrelated work.
- [x] Start/verify the existing complete-study localhost4174 preview with account UI and provide its URL. Report interface/code test completion separately from real provider integration.
