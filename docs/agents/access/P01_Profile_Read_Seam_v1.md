# P01 owner-bound Profile read seam v1

CONTROLLED READ-SEAM CANDIDATE ONLY. Independent P04 review and separately assigned P02 UI wiring remain required; no combined candidate or preview change.

Baseline1a011d1450a77893c5f02151b4f109e0cd0120a0, branch codex/pelora-profile-read-contract-v1, worktree C:/Projects/Pelora-Agent-Worktrees/pelora-profile-read-contract-v1. Direct human Profile-purpose communication authorization verified in Coordinator; P02 explicitly acknowledged P01-exclusive hook/helper/test ownership and no competing hook edits. P02 components/caller/UI remain P02-owned.

## Exact contract and changes

useCaptainAccess adds only import and profileRead return; original approval/principal/loading/revalidation/error logic, SELECT string/owner predicate, request lifecycle and cancellation remain source-identical after removing the additive seam. captainProfileRead is a pure private display projection, not an authorization evaluator or a writable object. No new SDK query, Auth operation, direct DML or permission.

Version pelora-private-account-profile-read-v1: frozen {contractVersion,resolution,profile,entitlementState:'NOT_SUPPLIED'}. Resolution: NO_AUTHORIZED_OWNER, LOADING, REVALIDATING, RESOLVED, MISSING, READ_UNAVAILABLE, INVALID_BINDING. Profile null or frozen {ownerId,email,displayName,boatName,accessRole,accessStatus}. Names/email are exact strings or null; malformed values/accessors rejected, no arbitrary object stringification or user_metadata role. Role/status are exact existing founder/founding_captain and approved/pending/revoked values, informational only. Unknown/Beta role invalid for this legacy seam; no activation/expiry/lifetime inference. Revalidating same-owner snapshot is visibly last-confirmed, not a new authority decision. Prior owner immediately masks on principal loss/change; actual hook suppresses late responses.

Sign-out contract remains existing Auth callback/owner lifecycle: fake tests demonstrate session removal masks Profile; no real signOut or component wiring performed. Failure must remain truthful in future P02 UI. Save is unsupported and must not claim success. Access type remains readonly inside Profile only.

## Qualification actually executed

Node24.18.0; existing dependency root C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules used read-only, no install/copy. Reproducible command:

    node frontend/src/hooks/tests/captainProfileQualification.mjs C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules

21/21 PASS:20 pure projection cases plus1 actual React reconciliation scenario with existing hook, controlled owner-filtered fake SDK read, initial/loading/approved state, same-owner revalidation, account switch, stale response, missing email and sign-out masking. Cases cover exact founder/founding status preservation, null fields, missing/error distinction, wrong-owner/anonymous/unsupported values, frozen detached inputs, accessor rejection and no arbitrary metadata authority. Counts are test cases, not independent browser/device coverage.

node --check ran on hook/helper and both test files: PASS. Existing ESLint Linter with @eslint/js recommended rules and es2021/browser globals on the two changed production modules: zero findings. git diff --check PASS. Exact existing hook source comparison after removal of additive import/return: PASS. Original captainAccessLifecycle.test.js unchanged.

Historical baseline suite was attempted before runtime edits:14/14 FAIL at VM missing useRef binding. Temporary one-binding test exploration then exposed useCaptainContinuity absence; exploratory changes were undone by restoring its exact HEAD bytes, without changing application/expectations. Final unchanged historical suite remains14/14 FAIL at same useRef harness boundary; not counted as passes or blamed on candidate. Earlier dependency-loader path/recursive resolution/missing dependency failures happened before application evaluation and are not test passes. New qualification runner maps only external dependencies; candidate source comes from this worktree. No broad harness repair or historical evidence rewrite.

## Tested file byte fingerprints (SHA-256)

| File | Hash |
|---|---|
| frontend/src/hooks/useCaptainAccess.js | 848123f216200883c777d1d0d48295cff3418edb82271be98fd3f78c5cc2afeb |
| frontend/src/utils/captainProfileRead.js | 51b4c3e7dcc46733c9a2d80fce235272aeb1b52bc28169be3724a6cb0ca4af8c |
| frontend/src/hooks/tests/captainProfileRead.test.js | 9f28c2d53d30f51d3dc73c03d7b9c5a6bd803dbfd12e5b0f846bd29eab1ff9e9 |
| frontend/src/hooks/tests/captainProfileHook.test.js | 1574ebf04739c56798b1bf425a10aa3620b832ec75abcf1f6c99e9b82b07b6d0 |
| frontend/src/hooks/tests/captainProfileQualification.mjs | e23756d9add3165fe0b914e9e46d8ae2da9d8ce1e8afe4b8709e64e485952dc6 |

Working-file fingerprints distinguish tested bytes from Git newline conversion. Evidence-document hashes are not implementation identities. Fixtures contain only explicitly controlled identities/example.invalid addresses, not real credentials/captain data.

Limits: no live Auth/Supabase/browser/mobile/sign-out execution, no deployed schema proof, no Save, no Beta entitlement, no component integration, no owner-private data into shared stores. Existing science, source/history/ranking, access/RLS and frozen preview remain untouched. P04 must independently review exact candidate before dependent wiring or integration.
