# Pelora privacy and evidence rules

Canonical privacy guardrails. Detailed ownership, provenance and association contracts retain their existing limits.

## Locked captain boundaries

Captain logs/private reports are private by default. Captain identity must never be exposed through shared learning/output. Global learning requires the approved anonymous-sharing boundary; a stored consent preference alone does not establish an approved anonymization pipeline.

Owner/RLS boundaries remain authoritative. No cross-user workspace, draft or report leakage is permitted, including logout, principal changes, late asynchronous completions and shared-device recovery. Application owner filters do not prove deployed RLS or effective least privilege.

Captain request locations must not indirectly create shared historical authority through Receipt Writer or observation acquisition. Shared observation scope must follow [science governance](PELORA_SCIENCE_GOVERNANCE.md), independently of captain requests.

Historical evidence association must preserve provenance and owner/privacy rules. Captain-authored facts remain distinct from Pelora-authored environmental evidence. Readiness is not consent, catch verification, revision integrity, ownership proof or permission to persist/share.

## Existing contracts and gates

- [Captain workspace Auth revalidation](Captain_Workspace_Auth_Revalidation_v1.md) and [beta captain safety](Beta_Safety_Captain_State_v1.md): lifecycle, owner isolation and draft limits.
- [Fishing log evidence capture](Fishing_Log_Evidence_Capture_v1.md), [temporal capture](Fishing_Log_Temporal_Capture_Integration_v1.md), [spatial capture](Fishing_Log_Spatial_Capture_Integration_v1.md), [association readiness](Fishing_Log_Association_Readiness_v1.md): exact capture and future association limits.
- [P3-A private history boundary](CP09B_P3A_Explicit_Cutoff_As_Used_History_v1.md): cutoff, as-used references and unresolved historical authority.
- [Client privilege hardening](Client_Privilege_Hardening_v1.md): least-privilege proposal and effective-policy verification limits.
- [CP-06 receipts](../backend/durableObserve/CP06-RECEIPTS.md) and [CP-07 reader](../backend/durableObserve/CP07-OCEAN-STATE.md): bounded retained authority; these do not authorize captain-driven shared acquisition.

No secrets, private captain examples or identifiable report content belong in governance documents, shared fixtures or control-plane results. Use references and synthetic evidence. Receipt Writer remains disabled and its migration unapplied per retained release evidence; any enablement or production DB action follows [release gates](PELORA_RELEASE_GATES.md).
