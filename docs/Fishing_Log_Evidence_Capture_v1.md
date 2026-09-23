# Fishing Log Evidence Capture & Storage Contract v1

Version: `pelora-fishing-log-evidence-capture-v1`.

This pure, species-neutral wire representation captures report time and location
facts. It chooses no PostgreSQL column layout and performs no writes. Runtime UI,
save operations, Saved Reports, migrations and existing records are unchanged.

## API and source representation

`buildFishingLogEvidenceCaptureV1({temporal, locations})` accepts explicit Task 7B
temporal inputs and Task 7C location inputs. Report ID is not required. Output:

```json
{
  "contractVersion": "pelora-fishing-log-evidence-capture-v1",
  "temporal": {
    "captainInput": {
      "start": {"date": "2026-09-22", "time": "20:00"},
      "end": {"date": "2026-09-23", "time": "04:00"},
      "quality": "bounded",
      "timeBasis": {
        "type": "iana",
        "timeZone": "America/Chicago",
        "confirmation": "captain-confirmed"
      }
    }
  },
  "locations": [{
    "contractVersion": "pelora-fishing-log-evidence-capture-v1",
    "locationEntryId": "caller-supplied-entry-id",
    "latitude": 29.5,
    "longitude": -86.2,
    "label": "Recorded position",
    "source": "manual",
    "certainty": "exact-as-reported"
  }]
}
```

The envelope is the proposed persisted source representation, not a database row.
No derived interpretation is persisted in v1: it is optional in the task policy,
and source-only storage avoids duplicate inputs and stale authoritative-looking
readiness. A future requirement to retain interpretation would need an explicit
versioned storage extension, not an unversioned extra field.

Dates, clocks, whitespace in strings and supplied IDs are preserved. Only the
documented fields are projected; arbitrary objects/private payloads are not copied.
Missing scalar fields stay absent; explicit null stays null. Non-finite numbers,
negative zero and explicit undefined use tagged scalar representations for JSON
round trips. Unsupported array/object/function/etc scalar inputs retain an invalid
type marker, not arbitrary contents. Malformed endpoint containers become empty
field objects. These are not valid temporal or numeric evidence. No rounding,
numeric-string coercion, longitude wrapping, default source/certainty or ID occurs.
Call the builder with raw inputs; do not feed its tagged wire values back as raw
captain inputs. Use the reader and explicit interpreter for stored envelopes.

## Interpretation boundary

`interpretFishingLogEvidenceCaptureV1(capture)` is an explicit nonpersisted operation.
It decodes scalar representations and calls the locked Task 7B and Task 7C builders.
Its `temporalEvidence` and `spatialEvidence` outputs retain their upstream versions,
original evidence, resolved values, quality, readiness, reasons and provenance.
There is no duplicated DST, timezone, coordinate, accuracy or readiness policy.
Omitted temporal quality stays omitted in capture; Task 7B's existing bounded
default applies only during interpretation. Approximate inputs are not promoted.

IANA and fixed-offset bases require Task 7B's explicit captain confirmation.
Suggested values may be retained as suggestions; they cannot establish resolved
evidence. No device timezone, offset, end date or rollover is inferred. UTC values
exist only in the separate derived result and never replace local inputs.
Equivalent explicit inputs under the same governed temporal runtime yield equivalent
serialized results. Browser results are captured interpretations, not cryptographic
proof of backend authorship. Later validation must use an explicit supported version.

Task 7D can compose the ephemeral upstream results for one report/location pair.
Its readiness is never persisted here. Missing report ID before insert is expected;
location ID is accepted but never generated. Assessment readiness, reference
identity, ownership, environment compatibility and write permission remain separate.
Task 5B remains authoritative for environment compatibility before future writes.

## Compatibility and reading

`projectFishingLogLegacyFieldsV1(capture)` yields only:

- `trip_date`: supplied local start date string, otherwise null.
- `lines_in`: supplied local start clock string, otherwise null.
- `lines_out`: supplied local end clock string, otherwise null.

It does not validate PostgreSQL suitability or decide report saveability. Even blank
or malformed strings remain recorded strings; future save validation is separate.
The projection cannot preserve the end date, timezone or approximation. The richer
envelope is authoritative for new evidence meaning. Never reconstruct it from
these projections or infer overnight rollover from clock order.

`normalizeFishingLogEvidenceV1({captureEvidence, trip_date, lines_in, lines_out,
fishing_locations})` is a pure adapter read API. `captureEvidence` names an argument,
not a database column decision. Supported v1 envelopes are structurally checked and
copied without interpretation. Round trips preserve the canonical source envelope.
No stored interpretation is recomputed or replaced while reading.

Absent/null envelope means `legacy`. Unsupported root or location versions mean
`unsupported`; malformed v1 shapes mean `malformed`. Both fail safely to legacy facts
only. Legacy facts retain date/clocks and coordinate pairs; enriched characterization
is not claimed through that fallback. Legacy coordinates remain valid evidence when
valid, with unknown source/certainty, absent accuracy/identity. Reading neither
upgrades nor mutates records. Explicit interpretation refuses unsupported/malformed
envelopes. Unexpected envelope fields, including derived sections, are rejected.

## Location and privacy boundaries

Locations preserve supplied order, not route/visit order. Identical coordinates may
have distinct supplied IDs. Missing IDs remain absent; stable references are needed
later for association persistence. Labels are descriptive only. Source is supplied
as manual/map-selection/device-capture/unknown; certainty as exact-as-reported/
approximate/unknown. Source never proves precision; exact-as-reported is not
independent verification. Task 7C alone interprets these values.

Optional accuracy uses Task 7C's explicit `value`, `unit`, `source`, `kind` fields.
Malformed accuracy remains independently unresolved without corrupting coordinates.
No bounds, units, certainty or accuracy are inferred. No location time or capture
timestamp is included in v1; no recording time can masquerade as fishing time.

Reports remain saveable independently of evidence readiness. There is no public
output, consent decision, telemetry, logging, clock access, random identity, network,
database, map/device state, snapshot query, matching threshold or association write.
The source envelope remains sensitive private evidence. Captain-authored trip facts,
future Pelora-authored ocean evidence and future governed associations are distinct
authority classes. Species results and all other report fields stay outside this
contract. This module grants no ownership, learning eligibility or persistence trust.

## Verification

Run `node backend/tests/fishingLogEvidenceCapture.test.js` from the root.
Tests exercise round trips, upstream equivalence, projections, legacy/future readers,
invalid values, identities and privacy without any database or provider access.
