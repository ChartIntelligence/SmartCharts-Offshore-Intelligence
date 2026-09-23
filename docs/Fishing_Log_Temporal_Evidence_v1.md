# Fishing Log Temporal Evidence v1

`shared/fishingLogTemporalEvidence.mjs` exports
`buildFishingLogTemporalEvidenceV1(input)` and contract identifier
`pelora-fishing-log-temporal-evidence-v1`. It has no application call sites yet.
It neither determines report validity nor stores, associates or matches records.

## Input

```javascript
{
  start: { date: "2024-01-15", time: "08:00" },
  end: { date: "2024-01-15", time: "16:00" },
  timeBasis: {
    type: "iana",
    confirmation: "captain-confirmed",
    timeZone: "America/Chicago"
  },
  quality: "bounded"
}
```

Dates are ISO `YYYY-MM-DD`; clocks are `HH:mm`, optionally seconds and up to nine
fractional second digits. Offset/calendar annotations and normalized overflow
(including leap seconds and 24:00) are rejected. Original accepted string fields
are retained without trimming or rewriting. Non-string fields project to null
and cannot supply temporal evidence. Only temporal fields are projected: do not
pass whole records as a replacement for retaining their original report data.

Alternative basis: `{type: "fixed-offset", confirmation: "captain-confirmed",
offset: "-06:00"}`. Offsets require signed `HH:mm` with hours 00–23 and minutes
00–59; `-00:00` is rejected as an unknown-offset representation. Use `+00:00`
for an explicitly confirmed zero offset. A named zone and fixed offset cannot
both be supplied. No device, location or preference inference occurs.
`confirmation: "suggested"` never authorizes resolution.

`quality` defaults to `bounded`: the explicitly entered endpoints bound the
reported fishing envelope, not proof of continuous fishing. `precise` means the
endpoints are specifically reported, not independently verified. `approximate`
remains approximate and does not emit nominal exact instants or inferred bounds.
An unknown quality is rejected. Output quality may also be `insufficient`.

Legacy `{trip_date, lines_in, lines_out}` input is recognized when neither modern
endpoint is supplied. Its fields are preserved in `original.legacy`; the start
date is the reported date and the end date remains null. No rollover is inferred.
Mixed modern/legacy input uses modern endpoints only, never legacy fallbacks.

## Output and safety

- `original`: projected local inputs, basis, declared quality and legacy fields.
- `resolved`: each independently resolvable endpoint's instant and offset.
- `interval`: absolute endpoints only when the entire interval is ready;
  otherwise null. Consumers must not use a surviving endpoint as a ready trip.
- `quality`: precise, bounded, approximate or insufficient.
- `readiness`: ready, needs-clarification or insufficient.
- `reasons`: internal endpoint/code/kind diagnostics, not captain-facing prose.
- `derivation`: contract and implementation versions, validated confirmed basis,
  resolved-time policy and available runtime/timezone-data provenance.

Missing required information takes precedence as `insufficient` readiness.
Otherwise invalid, unconfirmed, ambiguous, approximate or contradictory evidence
is `needs-clarification`. Only fully resolved, strictly positive intervals are
`ready`. Equal endpoints are an empty trip interval, not an overnight trip or a
point-event contract. No maximum duration is imposed. Approximate quality is
preserved even when other information is missing; all reasons remain available.
Reported fishing effort is not read, derived or modified.

Named-zone resolution always uses Temporal's `disambiguation: "reject"`.
Repeated times return `local-time-ambiguous`; nonexistent times return
`local-time-nonexistent`. Earlier/later library results are used only after
rejection to distinguish these diagnostics and are never returned as evidence.

## Implementation and reproducibility

The root manifest pins `@js-temporal/polyfill` to exactly `0.5.1`. Only the shared
implementation imports it; there is no global Temporal patch. Consumers use
Pelora's contract, not Temporal objects. All output consists of JSON values.

The polyfill relies on runtime Intl timezone data, not its own authoritative
timezone database. Node runtime/ICU/tz versions are recorded when exposed;
otherwise they are null, including browsers without this metadata. Output is
deterministic for the same evidence and runtime timezone data, not guaranteed
byte-identical across different timezone-database versions. Preserve the output
used by any future revision/association rather than silently re-deriving history.

No frontend/backend runtime imports this module yet, so it adds no reachable
production frontend code in this task. Future integration must measure bundle
impact; tree-shaking of an imported Temporal implementation is not assumed.

Run `node backend/tests/fishingLogTemporalEvidence.test.js` from the repository
root. Tests use local fixtures only; no database or provider requests occur.
