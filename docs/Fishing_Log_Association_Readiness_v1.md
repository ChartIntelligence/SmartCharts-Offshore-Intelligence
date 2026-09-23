# Fishing Log Association Readiness v1

`shared/fishingLogAssociationReadiness.mjs` exports
`buildFishingLogAssociationReadinessV1({reportId, temporalEvidence, spatialEvidence})`.
The version is `pelora-fishing-log-association-readiness-v1`.
Input is one pair of already evaluated Task 7B/7C outputs, never raw report data.
The caller supplies the correct report/location pairing; this utility cannot
authenticate that relationship or source records. There are no application callers.

## Composition

Only upstream readiness is composed: insufficient dominates needs-clarification,
which dominates ready. Quality is preserved, never recalculated. Approximate or
bounded spatial evidence that Task 7C declares ready remains ready when temporal
evidence is ready. No scientific tolerance is applied.

Missing contracts, unsupported versions, malformed envelopes, missing required
containers or inconsistent ready-container shape fail closed as insufficient.
This is structural validation of supported evaluator outputs, not authentication
or revalidation of the underlying dates/coordinates. Callers must use the governed
evaluators, not fabricate readiness flags. No evaluator or Temporal import occurs.

`assessmentScope` is `report-interval-at-reported-location` only for ready pairs;
otherwise null. It permits future investigation of archived conditions at the
reported point during the reported interval. It establishes neither continuous
occupancy nor an exact visit time. No midpoint, endpoint, array order, priority or
record timestamp is assigned to a location. No snapshot is an input or selected.

## Output and persistence boundary

The output carries assessment state/scope, a minimal upstream version/state/quality
summary, domain-coded assessment reasons and supplied report/location references.
It does not copy coordinates, local times, private notes or full report payloads.
Rejected upstream contracts yield an unaccepted insufficient summary rather than
echoing arbitrary version strings or diagnostics.

Report ID comes from `reportId`; location ID comes only from an accepted spatial
contract. Nonblank strings are preserved; absent/invalid IDs remain null. Both
present means `persistenceReferenceReadiness: ready`; either/both missing means
needs-clarification, with separate missing-ID reasons. This is an identity-presence
prerequisite only, not proof of revision integrity, ownership, association validity
or permission to write. No IDs, revision policy or source records are created.

Identity absence never changes assessment readiness. Future persisted associations
must reference the exact evidence used under a separately governed revision/write
contract; Task 7D does not claim to solve that future requirement.

Environment compatibility is always `not-evaluated`. A separate prerequisite
requires compatible persistence environment before an association write. Task 5B
remains authoritative; unknown/mismatched compatibility must fail closed in that
future write contract. Even all-present references never authorize a write here.

## Boundaries and verification

The contract is species-neutral, deterministic and serializable, with no I/O,
logging, clock, randomness or external dependency. It performs no time/distance
calculation, matching, provider acquisition, UI, persistence or orchestration.
Task 7B owns temporal interpretation; Task 7C owns spatial interpretation.
Captain-authored facts remain distinct from Pelora-authored ocean evidence and a
future governed association. Readiness implies neither learning eligibility nor
consent, catch verification or report validity. Saving a Fishing Log is unaffected.

Run `node backend/tests/fishingLogAssociationReadiness.test.js`. Tests compose real
upstream fixtures and exercise the nine-state table, malformed inputs, identity
separation, environment prerequisites and privacy without any database access.
