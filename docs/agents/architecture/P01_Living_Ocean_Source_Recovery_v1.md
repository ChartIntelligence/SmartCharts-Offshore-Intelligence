# Living Ocean source-contract recovery v1

READ-ONLY RECOVERY — NO LAYER ACTIVATION / SOURCE ADMISSION / ACQUISITION. Exact application baseline4e1b49ba52c26089e24dd94f377109c13d8586b6 remains unchanged. Existing backend/renderer tests and source/science reviews reused; no suites rerun, application imports or new provider requests. New packets must preserve independent currents/bathymetry/Profile/UI ownership.

## Recovered exact NOAA pilot

| Identity | Actual retained / recorded value |
|---|---|
| Source checkpoint | b5f07dffa6bdedb1b0b6d1bfd804e72bd4c67144; NOAA_Geo_Polar_Bounded_Gulf_SST_Pilot_v1.md and Real_SST_Visual_Scale_Qualification_v1.md |
| Product | NOAA/NESDIS/OSPO Geo_Polar_Blended_Night-OSPO-L4-GLOB-v1.0 version1.0/GDS2.0, ANALYSIS/L4; ERDDAPnoaacwBLENDEDsstDaily |
| Nominal analysis reference | 2026-09-22T12:00:00Z; NOT individual observation time; observation/support unknown |
| Raw exact SHA256 | 26fe69f0e376322fd2e81ecb9375e5737ede4134cbd9711608ee9c2e2253a843; actual retained source.nc hash independently matches |
| Frame ID | noaa-geo-polar-20260922-gulf-26fe69f0e376322fd2e81ecb9375e5737ede4134cbd9711608ee9c2e2253a843 |
| Archive ID | opf-b01cd11c68de5bab89d2ac29d44ea04302f59ff57b417bf39f8f9c65aad08286 |
| Content / full-frame digest | c59c222c11fb85afe32d046c3c75e81fdcaaa330ac790917d1ec77cd123c8fbf / 544ef9db863f21b1286807680967c4782a0643cad8444222763728c3a68d4790 |
| Receipt / scalar delivery ID | 08a6a4286c5e43b04f601ddf2370e5054bf35a7ccf0276ccbc1ae25d5d936bb7 / osfd-7d3e484c466a91558b51ee1940e599003ae9136febb663ad010a8aab12c81820 |
| Coverage |360 columns x260rows;93600 samples; nominal0.05degree, native axes/Float32/masks retained; subset Gulf bounds-98/18/-80/31, no inferred surrounding coverage |
| Admission | task11d-pilot-only, not operational current; freshnessUNASSESSED / temporal supportUNKNOWN |

Actual ignored public-evidence directory exists in critical-path e89 worktree: .local/ocean-quarantine/sst/noaa-geo-polar/task11d-20260922T120000Z-gulf. source.nc, field.json and matching archive file retained; no bytes copied/uploaded. Native JSON parsed as data only, no Pelora decoder/execution. field.json SHA2564d8aeaa3d060d11351678ccefb195dcaa0ce20fc61f63b4f2cb77f6e20614228; archive fileSHAff8b3395b525877b86f64285e488c53ff87432468217b8dfb851d3b0ee1682ee. field.source exact frame/archive/content/receipt IDs match recorded values. This verifies retained identity, not scientific readmission, current freshness or operational durability. Existing tests must not recollect it.

## Reusable source / time / storage closure

| Exact producer/contract | Reuse / authority limit |
|---|---|
| backend/oceanState/noaaSstSource.mjs: candidateOf,parseDiscovery,acquisitionManifest,validateDecoded | Exact product/version/coordinates/dimensions/raw metadata; real returned selected time, no date arithmetic; discovery bytes/hash separate from acquisition; unknown revision/published time stays unknown. No default transport |
| backend/oceanState/sstWorker.mjs: createSstWorkerV1,compareCandidate,freshnessInputs,completeFrameDomain | Worker checkpointaac0adfd57f5a39d32ca7c758308549585be7bef. Explicit injected state/archive/raw/transport plus authorize/assess. Claim/complete/read/CAS exact references, uncertain outcome reconciliation; no default timer/startup/live transport/automatic admitted pointer. freshnessUNASSESSED/THRESHOLD_DECISION_REQUIRED, no approved72hSST rule |
| shared/sstProductAdapter.mjs → oceanProductFrame.mjs → oceanProductArchive.mjs | Existing product-specific qualification/native numeric/mask/error and immutable exact archive chain. Pilot admission does not qualify every date/product; local fsync/readback is not general operational durability |
| shared/oceanScalarFieldDelivery.mjs: deliverOceanScalarFieldV1 | Exact archive/receipt/frame/content/lineage and source-index sampling; original axes/numeric values/missingness/units/coverage. deliveryId/generatedAt separate from source temporal meaning |
| review/noaa-sst-pilot/pilot.mjs,scales.mjs and review scripts | Existing retained-source review, not normal authenticated consumer. No imports/serve/acquire executed during recovery |
| backend/fields/scalarRuntime.js and Governed_Scalar_Field_Runtime_v1.md | Existing explicit synthetic-only DI boundary, disabled by default. Not an operational NOAA/chlorophyll latest selector; do not relabel synthetic registry/response as real |
| backend/fields/datasetRegistry.js and useMapLibreOceanFields | Normal registry only bathymetry/currents; no live scalar SST/chlorophyll layer. Keep unlike envelopes separate, no extension through current/bathymetry lifecycle by convenience |
| backend/scalarEvidenceHandoff.mjs and49c241b6223844c8cedac0151ec69ee90ebe46e4 | Exact point/scalar capture/reference handoffs and signed-zero/source tuple protection; not production acquisition, map coverage or new receipt-family authority |

## Display policy recovered — do not redesign

Existing founder-reviewed CandidateC: all valid cells of COMPLETE retained governed frame → min/max → outward whole-F endpoints → zero valid-cell clipping.82–89F is this old frame result, not fixed SST science or permanently approved operational ramp. Same frame retains same domain/color through pan/zoom. Multi-frame comparisons need shared absolute domain; no viewport percentile rescale. A32–86F clipped85.189718%, rejected; B70–95F broad valid comparison but flat; Dp02–p98 approximately84.811982–87.998018F clipped3.845833%, NOTdefault. Palette provisional; scale contrast never declares good fishing, gradients/fronts, habitat, rank or confidence. Raw numeric grid/mask remain scientific authority; raster is presentation. Rectangular acquisition edges are coverage, not environmental structure.

The coordinator's existing P02/P03 recovery readouts agree these identities and meanings. Actual optional presentation DTO is NOT yet qualified/implemented: preserve native scalar contract source/product/temporal/scalar/spatial/grid/providerEvidence/derivation/deliveryId fields directly or by validated immutable references. Later display metadata has separate construction identity and supplied source class/nominal analysis time versus observationTime/null, age-as-of/freshnessUnknown, native coverage, numeric units and complete-frame domain policy. No time, source admission, quality or eligibility inferred from a hash or pixels; generatedAt cannot become observedAt. No force-fit into pelora-spatial-field-v1.

## Chlorophyll existing path versus locked operational requirement

Current backend/server.js functions getChlorophyllConditionsAtAssessment and getGapFilledChlorophyllConditionsAtAssessment read separate NOAA products noaa cwNPPVIIRSchlaDaily (actual dataset string noaacwNPPVIIRSchlaDaily) and nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily. Requested/provider-resolved coordinates preserved, chlor_a finite numeric mgm^-3 and provider time/availability retained, explicit scientific assessment supplies age. resolveChlorophyllObservation ranks current direct, current gap-filled, stale direct, stale reconstruction under existing72h rule; no averaging. No valid pixel/failed source/missing row must not become zero concentration or governed-zero. DIRECT/GAP_FILLED retain different scientific class/identity/lineage. Existing fallback checkpoint8bb02b7304e968f77a69c524817ca4e794a028dd reused, not reimplemented.

Locked future multi-source requirement NOAA VIIRS NRT / Sentinel3 OLCI NRT / Copernicus Marine NRT is broader than these two implemented NOAA point adapters. Relevant operational backend/field source review found no matching OLCI/Copernicus acquisition adapter or normal SST/chl scalar field registry. Provider names in tests do not implement one. Missing exact product/run/revision/support/coverage/quality/service authority remains unresolved; no automatic interchangeable pooling or latest-source selection policy. Chlorophyll72h governance is not an SST freshness policy or proof of satellite observation support/cutoff possession. Real retained no-data differs from absent input and point sample differs from neighborhood/full-frame coverage.

Reusable frontend mapObservationDisplay/model-SST/direct-or-reconstruction chlorophyll QA samples and useSyntheticSstReview are review/discrete-point mechanisms, not qualified NOAA L4 or multi-source operational raster lifecycle. Existing responsive LayerControls/MapLegend may be reused only after typed source interface/path agreement. No layer activation or silent replacement.

## Separate external scientific dependencies

Copernicus DUACS SEALEVEL_GLO_PHY_L4_NRT_008_046 ticket142135495: founder reports acknowledgment, substantive derivative-scale/time/revision/uncertainty-covariance/geostrophic divergence/convergence answers pending. No new email/contact/authenticated query; not independently checked through inbox here. Product-specific QUID facts cannot qualify NOAAnoaacwBLENDEDNRTcurrentsDaily. Derivative/Convergence quarantine not reopened.

OSTIA NRT/reprocessed temporal support, vintage/provenance, revision, service/redistribution metadata remain incomplete in existing product review. NOAA Geo-Polar pilot is a different product; neither metadata nor methodology is transplanted. No external scientific research or PDF reading performed/claimed in this recovery. Existing product reviews are reused at their exact recorded scope.

## Smallest next bounded delta / ownership

Recovery complete as evidence inventory, not runtime authorization. Next implementable candidate requires explicit P01 exact readonly retained selector/admission/freshness contract, P05 product-meaning/unknown-support decision and dedicated P03 scalar producer/render path reservation; no edits to current field hook by P02. Prefer reusing existing exact archive reader/scalar delivery/presentation domain for an explicitly retained REVIEW ONLY source inspection seam. It may never return LIVE/qualifiedOceanState, enqueue work, fetch or relabel the Sep22 frame; existing qualified pilot rendering must not be rebuilt needlessly. Operational beta needs separately approved actual fresh source supply, coverage, time/admission, failure/recovery and independent mobile/render QA; a pretty static pilot is insufficient.

Proposed P02 paths only LayerControls.jsx/MapLegend.jsx+dedicated presentation tests; Dashboard/MapLibre forwarding needs separately acknowledged scope. They are proposed reservations, not edit release. New-purpose P01 acknowledgment message automatically rejected; destination-specific permission requested, no retry/indirect route. No P02/P03 conflict or broader authorization inferred from peer readouts. CurrentProfile/frozenpreview sources unchanged. Existing source-push/preview gates remain independent.
