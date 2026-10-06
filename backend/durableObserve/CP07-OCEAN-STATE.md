# CP-07 Ocean State Reader v1

Isolated-local qualification, read side only. No acquisition, claim, acceptance, recovery, receipt creation, provider configuration, frontend, publishing or production behavior changes.

## Governed policy

The human CP-07 governance decision preserves two independent CURRENTS dimensions, using exact source age:

- `freshnessState`: `fresh` through 72 hours inclusive; `stale` above 72 hours.
- `liveAuthorityState`: live-age `eligible` through 96 hours inclusive, subject to source/representation rules; `not-current` above 96 hours.
- `queryContext`: `live` or explicitly `historical`. Crossing 96 hours does not change context into historical.

At 80 hours evidence is stale and live-age eligible. At 96 hours it is still eligible; at 96 hours plus one millisecond it is not-current. The versioned policy is `pelora-currents-ocean-state-age-policy-v1`. No new physical/consumer threshold or species rule is introduced. Component eligibility is not blanket scientific usability: output separately exposes source availability, component availability, complete-vector availability, speed-derivation failure and the existing requirement for each consumer to satisfy its own representation/quality rules. Source authority remains `RECORDED_NOT_REQUALIFIED`.

## Contract and selection

`createOceanStateReader({query, clock?}).read(input)` returns `pelora-ocean-state-reader-v1`. The query and clock are trusted internal composition ports; neither is accepted from request data. The default clock is backend UTC time, sampled once per read. No connection opens on import.

Closed live input:

```js
{
  scope: {
    manifestDigest, region: {id, version},
    product: {family, provider, dataset, productId}, cellKey
  },
  queryContext: 'live',
  sourceTime: {from, until}, // canonical UTC; inclusive from, exclusive until
  maxObservations: 1
}
```

Historical input instead uses `queryContext:'historical'`, requires `targetTime`, and permits `maxObservations` from 1 to 20. A future historical target is invalid. Live callers cannot supply target/read/assessment time or age to rejuvenate evidence. Region/product/cell must match the protected approved manifest and native sampling cell; arbitrary coordinates or captain/user/session/viewport/mission/report/activity fields are rejected, including accessors.

The database uses committed accepted records only, accepted no later than assessment, with source time in the requested interval and no later than assessment. Source observation time orders the head; receipt, retrieval, acceptance and read time never refresh source age. Ties use descending job window, acceptance timestamp and logical job ID, explicitly an operational deterministic tie order rather than scientific revision superiority. The newest selected source can be stale or not-current. There is no fallback to pending/stale claimant artifacts, another cell/product, or an older receipted observation. Live returns one selected head; historical returns bounded ordered accepted observations. `hasMore` signals an incomplete page. No general pagination, universal lookback/retention, interpolation, fusion or revision-selection science is qualified.

States are `OK`, `MISSING`, `UNKNOWN_SCOPE`, `INVALID_QUERY`, `READ_UNAVAILABLE` and `INTEGRITY_FAILED`. An integrity failure returns no observations; no partial/fallback current claim is made. `OK` means a valid accepted chain was read, not that it is fresh/live usable. `currentLiveAvailable` and each observation's `currentLive` are false for explicit historical context and for expired live-age evidence.

## Returned evidence

The reader preserves logical observation ID, manifest/product/region and governed native cell/grid/sampling identity; source observation time and distinct provider-selected time fields; requested/received/normalized/finished/retained/accepted timestamps; exact age in integer milliseconds and unrounded hours; assessment and read instants; immutable raw/evidence references and exact V3 capture text; execution attempt/fence/digest and binding digest; source metadata and quality/authority state. Capture identity is validated with the existing V3 reader and CP-03 raw/binding/index validators. No capture is reconstructed and no new observation identity is minted.

For live reads `age = backendReadTime - sourceObservationTime`. Later reads increase age. Historical age and policy states are assessed at the explicit historical target, not publication/read time; `readAt` remains separate. `observationState:'historical-accepted'` is explicit context, while expired live reads retain `observationState:'accepted'`, `liveAuthorityState:'not-current'` and `currentLive:false`.

Private CP-02 capability tokens are used only inside storage validation and are omitted from the consumer output, including receipt linkage. Later publishers must consume this versioned reader interface rather than query protected CP tables or reach around it through lower-level storage ports without a separately authorized mission.

## Receipts and missingness

The read-only database routine joins existing CP-06 receipt lookup; it does not enable Receipt Writer or create anything. Full private linkage is validated against the exact accepted index, and the existing Receipt Writer envelope/V3/dependency validator verifies readback. Public linkage includes immutable provenance fields without the private attempt capability. Receipt availability is assessed by its first-witness `receivedAt`: `AVAILABLE_BY_ASSESSMENT`, `NOT_RECEIVED_BY_ASSESSMENT` or `AS_OF_AUTHORITY_UNKNOWN` for absence. Presence does not qualify source science or refresh age. Absence leaves accepted live evidence valid and cannot fabricate historical receipt authority. Identical evidence can reuse an earlier witness under the preserved CP-06 semantics.

The present CURRENTS worker returns `NO_DATA, accepted:false`, and CP-03 also rejects an attempted accepted no-valid-pixel chain. Thus this version explicitly reports `acceptedNoDataSupport:'NOT_SUPPORTED_BY_QUALIFIED_CURRENTS_ACCEPTANCE'`. Missing accepted acquisition and an unaccepted no-data attempt cannot be distinguished from authoritative accepted storage; neither is invented as an accepted no-data record. Tests prove both worker behavior and database rejection. A future accepted-no-data contract needs its own upstream authorization; this mission does not weaken acceptance to create one.

## Database and privilege surface

Additive schema `cp07` contains exactly one `STABLE SECURITY DEFINER` read routine, `cp07.read_scope(text,text,timestamp with time zone,timestamp with time zone,timestamp with time zone,integer)`, owned by `pelora_cp02_owner` with `search_path=pg_catalog` and qualified object resolution. It has no tables, write operations, acquisition/claim calls or receipt-write calls. Bounded output is at most 20 observations and 64 MiB of aggregate internal chain/receipt text; excess capacity fails closed. The implementation executes one parameterized SELECT and works in PostgreSQL `READ ONLY` transactions.

The existing worker receives only cp07 schema USAGE and EXECUTE on that routine, in addition to its six previously qualified entry points. No direct SELECT/DML, sequence, schema/admin, role membership or ownership privileges expand. PUBLIC execution is denied, safe owner/admin defaults remain and the private capability surface is unchanged. `readerPrivilegeManifest.v1.json` extends the unchanged CP-06 manifest with cp07 and its read routine body hash. The shared worker still has its prior write APIs for observation work; the reader is a read-only interface, not a new read-only login role.

## Qualification and limits

Tests exercise exact 72/96-hour boundaries, increasing age/idempotent identity, stale newest source despite later acceptance of older evidence, explicit historical context/as-of admission, receipt absence and later first-witness cutoffs, no-data rejection, component-specific derivation failure, pending/stale claim exclusion, native cell/product/region scope isolation, tampered raw/evidence/binding/receipt linkage, private-input rejection and read-only/minimal privilege behavior. Full prior qualification is rerun; a separate real database restart compares exact accepted/pending/receipt state and reader output at a fixed historical target.

Qualification remains isolated and synthetic. Real sampling plans/provider-time policies and source-scientific authority are not newly qualified. Admin/migration authority and approved manifest meaning remain trusted. No new credential/role/package/service is added. No cache, background reader, production endpoint, publisher, frontend, ranking, nightly learning or CP-08 implementation is started.
