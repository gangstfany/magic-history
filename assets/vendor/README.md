# Vendored browser dependency

- Package: `@supabase/supabase-js`2.118.0, MIT.
- Registry package: https://registry.npmjs.org/@supabase/supabase-js/-/supabase-js-2.118.0.tgz
- Upstream: https://github.com/supabase/supabase-js
- Copied artifact: package/dist/umd/supabase.js → supabase-js-2.118.0.js
- SHA256: `ee3be8de192b97cb1d73d1e95d6b82bb1f6b658c0f97c4ef757fc331996ed3d3`
- Upstream LICENSE: SUPABASE-LICENSE, SHA256 `334dd6820e2eaeab2064e7c59001b810566728a28a41a7c1dbf69bbee17d0936`.

The exact published browser distribution is retained, not rewritten or built from a floating dependency. The account bootstrap loads this same-origin file only after valid public project configuration exists. No runtime npm/CDN import is required. API access still requires connectivity to the configured Supabase service; local vendoring is not a guarantee of mainland network availability.

To upgrade, download an explicit new npm version to an isolated temporary directory, inspect its package and license, verify checksums, update the local filename and bootstrap reference, and rerun authentication and callback/logout regression tests. Do not silently replace this file with a CDN URL.
