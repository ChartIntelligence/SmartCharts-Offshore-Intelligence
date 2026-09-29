# NOAA current product: provider clarification packet v1

Prepared 2026-09-28 for Task 12B.6Z. **NOT SENT.** Exact dataset: `noaacwBLENDEDNRTcurrentsDaily`. Initial official target: **coastwatch.info@noaa.gov**, NOAA CoastWatch Help Desk; request routing to the Laboratory for Satellite Altimetry and RADS specialists. [Official contact](https://coastwatch.noaa.gov/cwn/processing-algorithms/rads.html).

Purpose: determine support for interpreting spatial derivatives of the mapped geostrophic field. We are not asking for environmental values, an endorsement of total-current detection, a new threshold or software changes. The [qualification report](NOAA_Geostrophic_Current_Metadata_Qualification_v2.md) records what is already known. Questions consolidate overlapping issues from the prior seven into four independent scientific decisions; subparts are retained so a partial answer cannot silently close a group.

## Q1 — Construction and release identity

**Primary priority: BLOCKS_QUANTITATIVE_INTERPRETATION. Recipient: NOAA LSA product science team; RADS for upstream reference/correction details.**

For this exact endpoint/release, are u/v computed from SLA+CNES-CLS13 MDT, from SLA-derived anomalies plus a mean-velocity field, or another construction? Which SLA mean reference and MDT realization are used, how are they aligned, and is the MDT contribution fixed across daily fields? Which processing revision is deployed, including whether the update proposed for 2025 occurred? How is f evaluated spatially outside the equatorial treatment, and what coordinate/operator convention is used?

These facts determine the physical target and contribution of background gradients to a diagnostic. MDT metadata alone does not establish the complete equation. **Documentary subpart:** please reconcile Level-3 prose and Level-4 listing and identify the applicable label. A level-label answer alone does not close the scientific question.

## Q2 — Field time and support

**Priority: BLOCKS_ANY_DERIVATIVE (a governed same-field interpretation, not mere arithmetic). Recipient: NOAA LSA/CoastWatch data service team.**

What exactly do `time`, `time_bnds` and the filename start/end dates mean for this endpoint: analysis instant, average/composite interval, or other support? Please supply a metadata-only header or specification, including bound dimensions/units and endpoint convention. What input observation window/temporal weighting underlies a field? Can the same represented timestamp be revised, and how is the revision identified?

This determines whether separately requested spatial samples belong to one coherent field. Daily production and individual freshness do not settle it. Please distinguish input latency, output publication cadence and represented support. No u/v/SLA arrays are requested.

## Q3 — OI spatial support and masks

**Priority: BLOCKS_QUANTITATIVE_INTERPRETATION. Recipient: NOAA LSA mapping-algorithm team.**

For the deployed NRT mapping, what covariance/background model, spatial and temporal correlation scales, influence radius/weighting and documented effective resolution apply? Are nearby cells supported by overlapping track observations, and is a support/source-count diagnostic available? How are coastal boundaries, land, ice and missing cells handled, particularly in the Gulf? Please distinguish these parameters from the 0.25-degree output grid and from MDT construction scales.

These facts determine resolved scale and whether a directional stencil is meaningful. We do not assume adjacent mapped cells are independent. No new sample spacing or coastal exclusion is proposed.

## Q4 — NRT vector and derivative uncertainty

**Priority: BLOCKS_QUANTITATIVE_INTERPRETATION; significance/detection subpart also BLOCKS_DETECTION_ONLY. Recipient: NOAA LSA validation team; CoastWatch QM maintainers; experimental eddy team for derivative precedent.**

Are NRT `u_current`/`v_current` uncertainties or validation statistics available for this release, separated from SLA, MDT and delayed-time errors? Are neighboring/component error covariances or mapping-error outputs available, including Gulf/coastal applicability? Please provide the current SSH QM-report index or replacement; the linked page could not be retrieved during this review. Which reports concern missions/SLA versus mapped velocity?

Does validation exist for divergence, strain or vorticity from this exact field? NOAA's experimental eddy page lists divergence: what operator, metric/time support and validation status apply, and is that the same current-field revision? Experimental use alone does not establish derivative error bounds. These answers block interpreting a small nonzero derivative as evidence above error; no requested numeric threshold is implied.

## Review closure and blocked gates

Each answer must identify a current authoritative document/revision, applicability and remaining limitations. Unknown or unpublished is a useful explicit answer. Restore accessible metadata/QM routes before treating an access failure as an unpublished fact. Public-document exhaustion remains incomplete because those routes failed.

Until these questions are resolved sufficiently for the claimed use: no numeric pilot, estimator, threshold, detection Boolean, consumer amendment or Ocean Physics resumption. Existing inward-geometry candidate remains the supported claim. Tasks 12B.6C/9E-D remain paused; upstream normalization remains open. No contact has been made.
