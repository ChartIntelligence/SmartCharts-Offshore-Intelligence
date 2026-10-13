# PELORA-04 deferred field application successor review

Exact P03 successor `e818e612beb70902856223607dd928d5480c818a`, direct parent `a7835851fb69b68ef4a1881633296347e5ad3595`. Prior independent finding/checkpoint `151359d358abe684edcf3bc8dd076a64646aacd0` remains preserved. Separate P02 caller `bfbf65df803dc57ed04305b1d190dcf9c882c037` remains source-cleared with two independently passing caller tests, not final transport composition qualification.

SOURCE REVIEW — CHANGES REQUIRED.

INDEPENDENT CONTROLLED EXECUTION — FAIL: original logout/style defect corrected, but a same-object principal roundtrip bypasses the new owner revision. No integration/launch clearance.

## Original P1 correction independently confirmed

Replayed the preserved P04 harness byte-for-byte against successor application source. Original harness SHA256 remains `fa6eda1577275851db5a18f909404363ff0cac1aa0c01eead895fcdeda218423`. The old current-application failure is gone: after render-null/idle, both statuses unavailable, both field references null, current layer hidden and rendered current features zero. Contour layer was removed. The unchanged probe exits 1 only because its second assertion demands a retained layer with visibility none instead of accepting absence. This is a harness-shape limitation, not the original candidate failure.

A separate QA-only corrected probe accepts absent OR hidden contours, additionally requires both fields null and zero current features, and passes exit 0. The original probe/log is retained unchanged; no committed test or application assertion was modified. Candidate's supplied focused hook tests also independently cover idle/style.load/readiness timers crossed with logout, different-object principal change, owner roundtrip and same-owner renewal; queued owner-bound updaters and layer toggles pass.

## Residual P1: previous principal identity aliases the mutable session object

Exact hook lines13–15 compare `sessionRef.current.user.id/is_anonymous` with the incoming session to advance principalRevision. Both references can alias the same caller-supplied object. In-place mutation changes the supposedly previous identity before comparison, so a rendered owner transition can go unrecorded. Transport application/publication guards rely on that revision (helper lines44–66). Their separately copied observed identity cannot distinguish an A-to-B-to-A roundtrip once the live identity again matches A and the hook revision never advanced.

Independent additional sequence, same actual hook/map/effect host as the preserved probe:

1. Supply a synthetic session object for A, enable both layers, leave style not ready and acquire/convert valid responses.
2. Mutate that same session object's user ID and access token to a structurally valid synthetic B session; render the hook, withholding passive effects.
3. Mutate the same object back to its original A identity/token and render again before passive effects.
4. Make style ready and fire pending idle callbacks.

Observed:

```json
{"bathymetryFieldPresent":true,"currentFieldPresent":true,"bathymetryStatus":"static","currentStatus":"stale","contourVisible":"visible","currentVisible":"visible","currentRenderedFeatures":1}
```

Exit 1: `rendered A-to-B-to-A principal boundary must obsolete old current even when session object is reused`, actual 1 versus expected 0. Old bathymetry/current buffers are reused across a rendered principal boundary contrary to the packet's owner-roundtrip/mutation guard. This is controlled defensive-contract evidence, not a claim that the live Auth SDK mutates objects this way or that private data was exfiltrated. Existing fixtures expressly cover same-object mutation and owner roundtrips, but not their combination through the actual hook revision producer.

Narrow repair boundary: P03 should compare a copied previous principal identity/anonymous flag rather than the previous mutable session alias, recording every rendered owner transition independently of object reuse. Retain same-owner renewal display, exact viewport/generation/disposal containment, disabled-layer truth, backend authority, normal-mode behavior and science/presentation contracts. P04 does not implement repair.

## Independent commands and actual evidence

Exact exported snapshot `C:/Users/User/AppData/Local/Temp/pelora04-field-auth-e818e612`; Node v24.18.0. No dependency install/copy, SDK retrieval, real session/storage, external provider/Auth/database or connected launch.

| Command from snapshot root | Result |
|---|---|
| `node frontend/src/utils/tests/qaFieldTransport.test.js` | Exit 0, nine grouped PASS sections |
| `node frontend/src/hooks/tests/useMapLibreOceanFields.test.js` | Exit 0, twenty-two grouped PASS sections |
| `node frontend/src/utils/tests/viewportFieldRequests.test.js` | Exit 0, three grouped PASS sections |
| `node frontend/src/hooks/tests/useMapLibreOceanFields.idleProbe.qa.js` | Exit 1, retained-hidden-layer shape assertion only; original unsafe application no longer observed |
| `node frontend/src/hooks/tests/useMapLibreOceanFields.idleProbe.corrected.qa.js` | Exit 0, equivalent clearing contract plus strict field-null/zero-feature assertions |
| `node frontend/src/hooks/tests/useMapLibreOceanFields.ownerRoundtrip.qa.js` | Exit 1, additional actual-hook mutable-session roundtrip assertion |
| Exact delta `git diff a7835851 e818e612 --check` | Exit 0 |

Grouped output sections are not unique-case counts or a full-suite PASS. Focused suites exercise both authenticated layer GETs through the real QA HTTP boundary with synthetic authority/access/handlers, destination/method/query restrictions, cookie omission, redirect/auth rejection, expiration, cancellation/disposal, same-owner renewal, layer isolation, malformed/obsolete responses, exact context, queued owner publication and the original pending-style race. Synthetic accepted layer pair records four authority/access reads and two handlers; missing-header and authoritative-rejection controls remain fail-closed. No backend scientific/provider execution is inferred.

Additional probes reuse original VM map/canvas/effect scaffolding, actual candidate hook/helper/request cache/presentation, and synthetic responses. Only map/GPU primitives, canvas fixture, effect scheduling and external response ports are controlled. No application logic reimplemented. Original probe body includes the previously passing focused assertions; replay is justified by this exact regression request. Qualification stops at the residual P1: GPU scripts, broader unchanged suites, final composed actual-caller execution and P01 exact combined candidate review are NOT TESTED here.

Five scoped successor paths verified: hook/helper, their two focused tests, P03 evidence. Backend policy, Auth/SDK/resolver, components/P02, scientific values/geometry/presentation, request-cache helper, shared/RLS/schema and manifest/lockfile paths are unchanged. No source edit in any candidate or P01 staged worktree.

Exact Git blobs: hook `3ff46813fcc7c1896457770543a506aea1c317be`; transport `5bb95d39931fd0392d008ad63316bdca237dc49e`; hook tests `f344b2b799766f76c68147ddb3f51de7b42f8b0f`; transport tests `7dda3875211f3e70dc19b8f6a3a1a848e48ffddc`.

Logs in snapshot: `transport.qa.log`, `hook.qa.log`, `viewport.qa.log`, `exact-probe.qa.log`, `corrected-probe.qa.log`, `owner-roundtrip.qa.log`. Corrected harness SHA256 `4afe8928d2bfcf8e315506711c80fc3140cefee49a560da99c95fabb01bb08d9`; residual failing harness `174af941d317ec51e2e15a1ccef4298e09cfe665d46ee3c884c0faec8db03ba0`; failure log `15fc18b66d6a56e8e4758854e13dbefcb8c377317a2e0df3fb1bcdafda25e5b7`. Real output retained, not reconstructed; temporary evidence persistence is not guaranteed indefinitely. All owned synthetic listeners/effects cleaned up.

Prior scoped startup/API/shell/frontend/caller results remain separate; temporal/routing/root-dependency/documentary harness exclusions remain excluded, not passed. Founder/device, live Auth, provider/GPU/operational-source, permanent preview, production/deployment and CP-10 remain pending. Preserve prior unstaged matrix and untracked safety checklist. No source repair, database change, integration, deployment or data-connected launch.
