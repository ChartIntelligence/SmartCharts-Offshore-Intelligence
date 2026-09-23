# Fishing Location Spatial Evidence v1

`shared/fishingLocationSpatialEvidence.mjs` exports
`buildFishingLocationSpatialEvidenceV1` and version
`pelora-fishing-location-spatial-evidence-v1`. No application integration exists.
This is a pure WHERE evidence projection, not report validation or association.

## Input

```javascript
{
  latitude: 29.5,
  longitude: -86.2,
  locationEntryId: "entry-a", // optional; supplied by the caller
  source: "manual",
  certainty: "exact-as-reported",
  label: "Morning stop",
  accuracy: { // optional, only an explicitly reported measurement
    value: 12, unit: "m", source: "explicit-device-reading",
    kind: "horizontal-accuracy-radius"
  },
  provenance: { captureRecordedAt: "opaque recording metadata" }
}
```

Coordinates must be finite numbers: latitude [-90,+90], longitude [-180,+180].
Numeric strings are rejected. Existing report storage already writes numbers;
no provider string-normalization compatibility is needed. No wrapping, rounding,
0–360 interpretation or dateline conversion occurs. Both signed dateline endpoint
representations are retained. Numeric -0 normalizes to 0 without becoming missing.
Each axis is evaluated independently; both must be valid for a usable point.

Sources: manual, map-selection, device-capture, unknown. Missing or unrecognized
source becomes unknown, never inferred from UI state or decimal places.
Certainty: exact-as-reported, approximate, unknown. Unknown is not invalid.
Exact-as-reported is not independently verified accuracy. Source is not certainty.

Accuracy requires an explicit finite nonnegative value, unit `m`, nonblank source
provenance and kind `horizontal-accuracy-radius`. No conversion or default radius
is supplied. This is a source-reported uncertainty radius, not guaranteed spatial
containment or a matching tolerance. Zero remains an explicit reported value,
not a claim of error-free measurement. Accuracy validity checks representation;
it does not authenticate the source. Malformed accuracy remains separately invalid
and cannot corrupt valid coordinates or override remaining characterization.

## Output and policy

The contract returns supplied identity, original scalar representations,
per-axis normalized values/states, overall coordinate validity, source, certainty,
label, accuracy, quality, readiness, reasons and normalization provenance.
Original scalar descriptors preserve missing/null/non-finite distinctions in JSON.
Invalid objects/arrays expose only their type, not arbitrary embedded private data.
Labels are preserved as text only; future renderers must treat them as plain text.

Quality precedence for valid coordinates:
1. Explicit approximate certainty remains approximate, even with valid accuracy.
2. Otherwise valid explicit accuracy produces bounded quality.
3. Otherwise exact-as-reported produces precise quality.
4. Otherwise quality is unknown.
Missing/invalid coordinate pairs have insufficient quality and readiness.

Valid coordinates are ready only with a recognized explicit source and either
explicit certainty or valid explicit accuracy characterizing uncertainty. The
approved device-capture + accuracy example therefore qualifies without inventing
an exact-as-reported certainty flag. Other valid points need clarification.
Accuracy errors alone do not veto otherwise characterized evidence.
Approximate + ready permits assessment, not acceptance of that approximation.

Legacy `{latitude, longitude}` remains valid, with unknown source/certainty,
unknown accuracy, unknown quality and needs-clarification readiness. No data is
discarded or upgraded. Missing identity stays absent. Identity does not affect
spatial readiness; it is a separate prerequisite for future association persistence.
Future entry creation should assign a stable opaque ID once and retain it through
edits; separate entries at identical coordinates need separate IDs. This evaluator
does not generate IDs or establish uniqueness. Array order is not route order.

## Boundaries

Only `provenance.captureRecordedAt` is optionally preserved as opaque text about
recording, never fishing time. Other temporal fields are ignored, not interpreted.
Task 7B owns temporal interpretation. Callers must retain their original report;
this projection is not a replacement record. No current time, device state,
network, logging or telemetry is used. Outputs contain no captain identity,
results or species context. Storage/presentation must continue protecting these
sensitive coordinates; this utility is not an authorization or anonymization layer.

Readiness establishes no matching distance, association, environmental condition,
visit duration or event attribution. Report validity remains independent. The
infrastructure is species-neutral. No UI, migration, persistence, timing, revision
or historical-matching behavior is introduced.

Run `node backend/tests/fishingLocationSpatialEvidence.test.js` from the root.
