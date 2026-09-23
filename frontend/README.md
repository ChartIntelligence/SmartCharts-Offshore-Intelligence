# Pelora frontend API environment

All Pelora backend requests use `src/utils/peloraApi.js` (`resolvePeloraApiUrl`). Species and captain context are request parameters; they do not select the backend.

- Development default: same-origin `/api/*`. The existing Vite development proxy forwards these requests to `http://localhost:8787/api/*`.
- Production default: `https://velion-ocean-engine.onrender.com/api/*`.
- Optional `VITE_PELORA_API_BASE`: overrides the backend for opportunities, live ocean conditions and spatial ocean fields together. An empty or whitespace-only value uses the mode's default.

For example, configure `VITE_PELORA_API_BASE=https://your-pelora-backend.example` in your local Vite environment. HTTP(S) bases and root-relative bases (such as `/gateway`) are supported; `/` explicitly selects same-origin routing. A trailing slash or terminal `/api` is accepted. Do not include credentials, a query or a fragment in the base. Relative production routing requires the deployment host to route `/api/*` to the intended backend; Vite's development proxy is not a production proxy.

Callers pass paths such as `/api/ocean`, with optional query strings. The resolver normalizes the base/path boundary and preserves query strings. Future Pelora backend requests must use this resolver rather than select a hostname independently.

`VITE_OCEAN_API_BASE` is no longer read. Migrate any existing field-only configuration to `VITE_PELORA_API_BASE`; the new override intentionally applies to every Pelora backend request. Restart the development server or rebuild the production frontend after changing Vite environment configuration.

Browser Supabase configuration (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) remains separate and unchanged. Basemap resources and other intentional external services also remain separate. Selecting one backend does not guarantee that independent requests share an analysis cycle.

## Persistence environment compatibility

Pair frontend `VITE_SUPABASE_URL` with backend `SUPABASE_URL`: both must identify the same intended Supabase project. Keep the existing public keys configured separately; keys and bearer tokens are never part of the compatibility response. No new configuration variable selects a database.

Development/test persistence must use a non-production Supabase project. Production captain records and governed history must remain isolated from development/test records. Real public ocean providers may still be used for development. This change does not provision a project, change Supabase selection, or infer whether a project is production. Operators must establish the correct pairing; matching two production URLs is not development isolation.

The shared contract normalizes a configured HTTPS project URL to its origin (case/default port/trailing slash normalized). URLs containing credentials, paths other than `/`, queries or fragments are unverifiable. Use the same canonical project URL on both sides; custom-domain aliases are not inferred to identify the same project.

Opportunity and live-ocean requests send the non-secret identity in `X-Pelora-Persistence-Project`. The backend independently compares it to its configured identity and returns `persistenceEnvironment` with contract version `pelora-persistence-environment-v1`, state `matched`, `mismatched` or `unknown`, normalized project identities and a diagnostic reason. Backend configuration must also be available. This verifies compatibility, not captain authorization: bearer authentication and RLS remain authoritative.

For mismatched/unknown compatibility the backend withholds the bearer token from memory-consuming evaluation, disabling authenticated Ocean Memory reads, governed observation/history writes and historical fallback reads. Current provider acquisition and independently supported opportunities continue under their existing governance. Spatial fields are unchanged. The browser automatically saves an Ocean Snapshot only when that ocean response contains a valid matching acknowledgement for its active browser project. The snapshot payload itself is unchanged. Diagnostics are not captain-facing prose.

Deploy the backend before the frontend. Old frontend requests without the identity header fail closed for backend memory on the new backend; old backend responses without the acknowledgement fail closed for automatic snapshot saving in the new frontend. An old backend cannot enforce this policy on its own GET side effects, so do not deploy the new frontend against an old backend as an isolation strategy. Ensure any intermediary permits the identity header. Vite's existing proxy forwards it; the backend permits it in CORS preflight.

Fishing Day Reports, Saved Reports, access/auth and early-access operations retain their existing browser-direct behavior and configuration. They are not newly guarded here. Their development isolation still depends on correct browser project selection. No schema migration or report/snapshot association is included.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
