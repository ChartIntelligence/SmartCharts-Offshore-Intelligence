# Pelora frontend API environment

All Pelora backend requests use `src/utils/peloraApi.js` (`resolvePeloraApiUrl`). Species and captain context are request parameters; they do not select the backend.

- Development default: same-origin `/api/*`. The existing Vite development proxy forwards these requests to `http://localhost:8787/api/*`.
- Production default: `https://velion-ocean-engine.onrender.com/api/*`.
- Optional `VITE_PELORA_API_BASE`: overrides the backend for opportunities, live ocean conditions and spatial ocean fields together. An empty or whitespace-only value uses the mode's default.

For example, configure `VITE_PELORA_API_BASE=https://your-pelora-backend.example` in your local Vite environment. HTTP(S) bases and root-relative bases (such as `/gateway`) are supported; `/` explicitly selects same-origin routing. A trailing slash or terminal `/api` is accepted. Do not include credentials, a query or a fragment in the base. Relative production routing requires the deployment host to route `/api/*` to the intended backend; Vite's development proxy is not a production proxy.

Callers pass paths such as `/api/ocean`, with optional query strings. The resolver normalizes the base/path boundary and preserves query strings. Future Pelora backend requests must use this resolver rather than select a hostname independently.

`VITE_OCEAN_API_BASE` is no longer read. Migrate any existing field-only configuration to `VITE_PELORA_API_BASE`; the new override intentionally applies to every Pelora backend request. Restart the development server or rebuild the production frontend after changing Vite environment configuration.

Browser Supabase configuration (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) remains separate and unchanged. Basemap resources and other intentional external services also remain separate. Selecting one backend does not guarantee that independent requests share an analysis cycle.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
