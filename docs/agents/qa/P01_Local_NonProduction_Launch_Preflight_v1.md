# Local non-production QA launch preflight v1

Disposition: BLOCKED FOR DATA-CONNECTED LAUNCH APPROVAL. No external service connected, listener started, build served or production action performed.

Source: d5d40020b13de48838b93f4262072d7b57b13113 (accepted runtime4ea104d68c9ded93ad8b016853d42691a3b582f5). Backend and frontend both retain these exact source identities; this is a documentation/testing checkpoint, not a safe-launch runtime implementation. Branch codex/pelora-local-qa-launch-preflight-v1, isolated workspace C:/Projects/Pelora-Agent-Worktrees/pelora-local-qa-launch-preflight-v1. P02 shell files are not edited. Existing dependency directories/private environments not copied.

## Exact local route proposal

Proposed frontend process VITE_PELORA_API_BASE: `http://127.0.0.1:8787`.
Existing `frontend/src/utils/peloraApi.js:resolvePeloraApiUrl` appends exactly `/api/`; `/api` on the configured base is normalized away before re-appending. Examples: `/api/health`→`http://127.0.0.1:8787/api/health`; `/api/ocean/field?...`→same origin `/api/ocean/field?...`; `/api/opportunities?...`→same origin `/api/opportunities?...`. Hosted default is prohibited for QA. Existing frontend Vite server `host:true` and default backend `0.0.0.0` binding are NOT authorized launch commands.

Approved Supabase origin: `https://vqzskzoizpomwzgbgdwl.supabase.co`, project ref vqzskzoizpomwzgbgdwl. Required environment NAMES only: SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_PELORA_API_BASE; future explicit QA mode/bind/read-only flags must have a reviewed contract. No values/keys copied. Reject service-role configuration; public key is not permission to bypass Auth/RLS.

## Actual startup and side-effect inventory

| Actual path | Finding | Safe-launch consequence |
|---|---|---|
| backend/server.js createPeloraServer; module bottom | Constructs server; listens only direct execution unless test flag, current production bind0.0.0.0 | Preserve default production semantics; separate explicit QA entry must bind127.0.0.1 and refuse unexpected host/config. No scheduler/publisher launch observed in inspected entry. Imported field service constructs in-memory cache, not a network call until request. |
| GET /api/health | Local time/status response | Can be controlled-tested without external services; not evidence of verified Auth/backend binding. |
| GET /api/live/marine; /api/ocean/field | Provider acquisition on demand; field in-memory cache/in-flight handling | External services need bounded later approval, no background acquisition. Static/geostrophic providers do not become Supabase-bound merely because frontend Auth uses Supabase. Preserve exact provider/science contracts. |
| GET /api/opportunities → getDynamicBlueMarlinOpportunities | Live evaluation; on valid evaluatedAt + authenticated identity invokes captureGovernedOpportunityObservationsV1 and captureGovernedOpportunityHistoryV1; POST implementations persist rows | GET is NOT read-only. Must block this route or explicitly suppress ALL persistence through a narrow QA-only seam before launch; do not drop bearer token or fake mismatch to evade controls. Blocking route yields truthful unavailable, not full founder application qualification. |
| GET /api/ocean-conditions → getOceanConditionsAtAssessment | Authenticated private history retrieval; response contains persistence environment acknowledgement | Required source/binding checks remain; matched acknowledgement can enable client-side automatic insert. Read-only backend alone is insufficient. |
| frontend useOceanMemoryPersistence | Matched project acknowledgement/user/snapshot invokes saveOceanSnapshot automatically | Requires explicit reviewed QA read-only client persistence guard, coordinated with P02 before touching owned source. Do not manufacture a mismatched acknowledgement as suppression. |
| FishingDayReportPanel → insertReportWithTime | Direct insert into fishing_day_reports on submit | No report mutation authorized; frontend entry must refuse submission under QA read-only mode without clearing draft or claiming success. User promises are not enforcement. |
| frontend Supabase client/useSupabaseAuth/access gate | Missing public config throws; authenticated approved private gate remains distinct from environmental API | Startup must validate exact approved origin for both clients, deny anonymous/pending/revoked, preserve owner/RLS; no account/link creation. Auth refresh may itself contact Auth and needs later approval. |
| backend resolveAuthenticatedCaptainIdentityV1 | GET approved configured /auth/v1/user validates bearer remotely; rest operations carry user bearer/public key | Existing helper does not independently locally verify JWT issuer; misconfigured project can be accepted by normal config normalizer. QA must pin origin, reject unexpected issuer where applicable before remote Auth verification; decoding JWT alone is not verification. Never log token/user identity. |

No production schema/data/grant/RLS inspection performed. No claim that every transitive provider implementation is deployment-safe; final QA must test egress and every enabled route before launch. Direct browser Auth/read/write paths need enforcement alongside backend paths.

## Minimum repair boundary and approval gate

1. Backend-owned explicit QA config/entry: exact approved project origin, public-only credential policy, loopback-only host/port, missing/malformed config fail-closed, safe CORS/host handling, authenticated principal/access check where required, issuer/project mismatch rejection, no implicit hosted fallback. Production direct startup unchanged. No env logging.
2. QA-only read-only persistence seam for opportunity observation/history capture; suppress intended writes explicitly while leaving evaluation/source values unchanged, visible limitation. GET reads and provider paths audited. Unknown unsafe route disabled rather than evaluated. No scheduler/Receipt Writer/nightly/report/background ingestion.
3. P02-coordinated frontend QA-only write guard for automatic snapshot capture and report mutations; preserve drafts, gate/owner state and truthful disabled status. Do not change resolver or shell concurrently. No false persistence acknowledgement or auth bypass.
4. P04 independent synthetic ports/spies prove no DML/Auth mutations, pinned endpoints/issuer, loopback socket, unexpected target/config refusal, current scientific equivalence where enabled, draft retention and production-mode unchanged. Only after exact runtime candidate/clearance request ONE explicit external launch approval. This checkpoint does not grant that approval.

## Tests actually run

`node --test frontend/src/utils/tests/peloraApi.test.js frontend/src/utils/tests/persistenceEnvironment.test.js backend/tests/persistenceEnvironment.test.js`:3 reported script entries PASS, grouped assertions not inflated. Synthetic/injected transports test defaults/override/API path normalization, project mismatch fail-closed, matched bearer forwarding and persistence writes, automatic snapshot compatibility. These existing tests reproduce the prohibited-write dependency; they do NOT qualify a new QA mode or Auth issuer verification. No application source changed. Tests use existing tooling only; no packages installed.

## Launch/build/stop plan — NOT EXECUTABLE APPROVAL

A backend launch command cannot safely be supplied for current `node backend/server.js`: all-interface bind and GET persistence violate this packet. Future reviewed QA entry command must be `node backend/<reviewed-loopback-QA-entry>.mjs`, foreground, with approved process-only config; stop Ctrl+C and verify socket/listeners gone. No entry is fabricated or claimed implemented here.

After guards and P04 clearance, use exact frontend candidate + manifest/lockfile fingerprints, existing compatible installed dependency runtime explicitly, approved temporary process config, and a fresh output directory. Build via the existing Vite CLI `build --outDir <fresh-QA-directory>` from frontend with exact local API override and matching public Supabase config; do not use old dist as proof, do not install/copy dependencies/.env. Preview via same CLI `preview --host 127.0.0.1 --port 4173 --strictPort --outDir <fresh-QA-directory>` after approval. Bind backend127.0.0.1:8787; never0.0.0.0. Stop both foreground processes Ctrl+C, verify no sockets/background tasks. This is a reproducibility requirement, not a build/dependency/launch qualification result.

Current blockers are actual write suppression/QA-entry implementation and P04 clearance, not an unknown remote API URL. Founder need not supply a nonexistent endpoint. Proposed local route is exact, but not yet safe to launch against data. Preview cannot qualify authentic Opportunities/Reports until its read-only behavior and existing authority limits are explicit. No paid services/packages/secrets/migration/main/deploy/source admission.