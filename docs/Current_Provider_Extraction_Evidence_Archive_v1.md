# Provider extraction durable qualification evidence

This evidence-only archive preserves the completed qualification at pre-extraction HEAD `55596290561afdeaf3681afff383ab0e339aae2d`. It does not rerun tests or alter implementation, fixtures, expectations, historical reviews, or qualification disposition. Phase 2 remains NOT QUALIFIED; worker not started.

- [Execution, receipts and original ledgers](Current_Provider_Extraction_Evidence_Archive_v1.json)
- [Retained public pilot fixture bytes](Current_Provider_Extraction_Retained_Fixtures_v1.json)
- [Qualification report](Current_Provider_Extraction_Qualification_v1.md)
- [Complete raw graphs](Current_Provider_Extraction_Graphs_v1.json)

## Recorded execution, not a newly executed recipe

The archive's command array preserves exact PowerShell commands, original working directories, start/completion times where recorded, shell executable, exit status, and bounded installation/environment outputs. Completion ordinals are not launch order: the long broad run overlapped diagnostic commands. Within run.cjs, scripts execute sequentially, baseline then candidate. The results array retains that per-script order. Command exit 0 after Get-Content is not a test PASS; individual TAP and spawn receipts are authoritative.

The original sequence was: fingerprint entering files; demonstrate pre-fix failure; apply the previously authorized TIME correction; record post-fix/focused tests; extract baseline; prepare isolated candidate/dependencies/retained fixtures; perform isolated offline installs and replay after source-copy setup corrections; run paired broad/archival suites and combined controls; replay eight missing-directory setup cases; compare exact failures and static results; reconcile final tested bytes. Runtime edits in that earlier sequence are historical, not performed by this evidence pass.

Node v24.18.0 is recorded. npm and PowerShell exact versions were not recorded in the selected execution receipts and are not inferred from today's installation. The PowerShell executable and Windows paths are recorded. Explicit non-secret environment and resource settings are in the archive and original harness source: offline guard, test startup mode, disabled Receipt Writer, 512 MiB old-space and 180-second per-script timeout. Inherited environment was not exhaustively recorded. No secrets/environment dump is included.

## Path mapping and retained preparation

These are archival mapping instructions written now, not commands claimed to have run. Original commands remain verbatim. The original scratch root is the archive's originalEvidenceDirectory; substitute one isolated scratch root consistently when replaying. The baseline tree corresponds to the preserved Git commit above; the candidate tree corresponds to the tested-byte ledger and checkpoint content. The original setup copies baseline, overlays backend/tests, server, adapter and graph, and uses the recorded package/lockfile boundaries. The original priorEvidenceDirectory supplied locked dependencies and retained .local fixtures. No dependency tree is committed here. Install commands and initial copy failures remain recorded, including offline npm ci of 42 packages and backend install/test:check. Prior interrupted qualification used registry dependency retrieval; final TIME qualification used local cache only.

Records contain original bytes as UTF-8 or gzip/base64. To recover an embedded record, decode base64 then gzip where encoding is base64+gzip, check bytes and SHA-256, and place it at the corresponding name under isolated scratch. UTF-8 records are the exact source text, not rewritten harnesses. Scripts are evidence under docs, not application modules; do not execute them from the repository documentation directory. The lint config belongs to the prior scratch-root mapping.

The retained-fixture artifact intentionally holds only the eight existing public NOAA pilot files supplied to the offline test trees. Their paths, original source provenance and exact hashes are explicit. They are not captain data, new acquisition, or new scientific authority. Decode/check each and materialize its relative .local path only inside both isolated test trees. These files support the existing NOAA pilot/display/SST tests in the broad profile. No credentials, caches, node_modules, unrelated scratch diagnostics or private captain payloads are archived. Missing diagnostic parent directories were created by the recorded replay-setup script; its initial errors and replacement receipts are retained.

## Hash scopes and audit completeness

The archive preserves the original 23-file candidate ledger and 21-file tested-byte reconciliation without changing either. Those ledgers describe completed qualification, including historical documentation hashes. This archival pass updates only the two qualification reports and adds three evidence artifacts. Their new documentation bytes are not represented as tested runtime bytes; no self-referential final hash is required.

The final tested identity includes backend/tests/currentProviderSelectorBinding.test.mjs, the unchanged currentProviderBaseline.json expectations, characterization fixture, adapter/analyzer/correspondence tests, and all qualified source/fixture adaptations. Original baseline-characterization output and all 209 retained TAP receipts are embedded alongside individual paired failure comparisons. The exact retained fixture inputs and harness source are repository-local; temporary paths are provenance, not the sole audit record.

## Qualification limits retained

EXTRACTION PREREQUISITE QUALIFIED — REVIEWED REFACTOR DELTA. This is not an all-green profile or full semantic composition equivalence. Historical assertions, four reviewed preservation-ledger mismatches, superseded source-closure assertion, and the archival timeout on both sides remain separately recorded. A timeout is not an OOM or pass. Overlapping totals are not independent coverage. Both semantic-completeness flags remain false; all nine provider-review obligations remain open. Production and Phase 2 are not qualified. No worker or Phase 3 work is authorized by archiving or checkpointing.

## Checkpoint whitespace verification

The default staged whitespace check flags the adapter's already-qualified CRLF bytes. The file has 302 CRLF and 9 bare LF endings, with no trailing spaces/tabs. The explicit check `git -c core.whitespace=blank-at-eol,blank-at-eof,space-before-tab,cr-at-eol diff --cached --check` passes. This recognizes retained CRLF, preserves trailing-space/blank-EOF checks, and changes no configuration or file bytes. The adapter SHA-256 remains the tested identity.
