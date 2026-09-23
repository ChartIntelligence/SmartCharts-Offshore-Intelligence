# Fishing Log temporal capture integration v1

Task 8D is local implementation only. Do not deploy this runtime until the separately
reviewed evidence_capture migration has been applied and verified in the intended
environment. Production has not been verified to contain the column. This task
executes no migration and uses no live database. There is no schema-error fallback.

The existing Fishing Effort section retains optional Lines in/out. Ending date has
no default choice: Same day follows Fishing date; Next day adds one calendar day;
Choose date preserves the explicit ending date even after the starting date changes.
Clock order never selects an ending date. Contradictions receive optional guidance.

New/reset reports use device-local calendar date as a convenience, not provenance.
The device zone is a suggestion only. An explicit button confirms the chosen IANA
zone or fixed-offset vessel clock. Changing start date, ending-date choice/date or
basis type/value clears confirmation; changing only a clock does not. Not sure
passes an unresolved empty basis. Reset never carries confirmation to the next trip.
The fixed-offset option is an explicit vessel-clock fact, not an ambiguity resolver.

Times approximate maps to approximate; otherwise the existing bounded interval
quality is used. Task 8B builds the source envelope; its explicit interpretation
helper delegates guidance to Task 7B. No scientific time rules are duplicated.
Missing or unresolved times do not block report saving. No internal reason codes
or readiness badges are shown. Existing required Captain, Boat Name and Fishing
date inputs remain. Close/draft behavior is unchanged; no persistent drafts exist.

insertReportWithTime performs exactly one INSERT containing existing report fields,
Task 8B's intentionally lossy legacy projections and the source evidence_capture.
Errors propagate to the panel's existing visible error path; no retry omits evidence.
Success uses the existing reset/refresh flow. No derived interpretation is stored.

Coordinates retain their existing workflow and database representation. The envelope
contains only their supplied coordinate facts plus Task 8B's entry version, with no
invented source, certainty, accuracy, identity or visit time. Saved Reports is unchanged.
Task 7C/7D, spatial enrichment, matching, associations, persistence compatibility and
species interpretation are untouched. New helper/component infrastructure is species-neutral.
