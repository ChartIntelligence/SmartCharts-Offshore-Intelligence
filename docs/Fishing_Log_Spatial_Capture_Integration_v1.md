# Fishing Log Spatial Capture Integration v1

Manual source capture remains species-neutral. The coordinate editor uses existing
responsive report-form-grid styling (one column at 700px and below), text inputs
with a text keyboard hint for signed decimal degrees, and separate Add Location.
No map, device permissions, accuracy radius or location time is introduced.

The lexical adapter accepts signed integers or decimals (including .5); trims only
surrounding whitespace; rejects exponent/hex syntax, coordinate pairs, trailing
junk and unfinished decimals such as -87. Draft strings are preserved until Add.
Task 7C alone determines geographic validity. Zero and inclusive boundaries remain
valid, longitude is never wrapped, and duplicates are separate entries.

Manual entry establishes source=manual, not the original measurement instrument.
Position as recorded means exact-as-reported, not verified physical accuracy.
Approximate location means approximate with no invented radius. Not sure and no
selection mean unknown. Unknown does not invalidate a coordinate or the report.
Labels preserve nonblank supplied text and are descriptive only. Accuracy is absent.

UUID creation occurs once after successful validation, outside rendering/state
updaters. Missing/throwing crypto.randomUUID leaves locationEntryId absent. HTTP LAN
preview may lack this secure-context API. React's index fallback for an ID-less
stateless card is presentation-only; removal selects the actual entry object,
not a coordinate or persisted array-index identity. Remove/readd creates a new entry.

Task 8B constructs evidence_capture from temporal facts plus enriched locations.
The legacy fishing_locations field deliberately receives latitude/longitude only.
One atomic INSERT remains; there is no second update or retry without the envelope.
Task 7C quality/readiness and Task 7D conclusions are never persisted or displayed.
Locked Tasks 7B/7C/7D/8B, legacy readers and temporal semantics remain unchanged.

## Unadded draft on save

Nonblank latitude, longitude, name, or an explicit characterization triggers an
in-application, nonmodal alert dialog before INSERT. Whitespace alone does not.
Return to location preserves all draft fields and focuses latitude. Save without
this location omits only the unadded editor; existing entries remain in both
representations. The editor is disabled during the decision/write. Consent applies
only to the immediate attempt and is cleared before awaiting the INSERT. Failure
preserves the draft and requires a new decision next time. Successful save uses the
normal reset. A changed editor object invalidates an outstanding decision.
No omitted text is converted into negative evidence or automatically added.

Coordinates have no native required/number/pattern constraints that block report
submission. Add validation uses inline field-associated errors and focus. Radio
controls communicate selection without color alone; addition has a live status.
Added cards wrap and omit route numbering. Bottom scroll/form clearance accounts
for the sticky footer and safe area without replacing the footer architecture.

## Verification and deployment boundary

Pure helper tests cover parsing, Task 7C interpretation, identity fallbacks,
projection and source-only atomic payloads. Component regressions run actual React
DOM reconciliation with the actual report panel and spatial controls, mocked storage
and a minimal DOM host; they do not claim layout, real keyboard or VoiceOver tests.
The auth lifecycle harness stubs the new spatial presentation; auth runtime is unchanged.
Physical-iPhone testing is pending a safe non-production authenticated environment.
Verify minus/decimal/paste, portrait/landscape, large text, long labels, keyboard-open
scrolling, focus and footer clearance there. No production access or database writes
were used to implement or test this task.

DO NOT DEPLOY this runtime until 20260923_fishing_log_evidence_capture_v1.sql has
been deliberately applied and verified in the intended Supabase environment.
No migration is executed by this task. No silent schema downgrade is available.
