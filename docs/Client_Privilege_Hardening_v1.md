# Client Privilege Hardening v1

## Scope and evidence

Migration `20260925_client_privilege_hardening_v1.sql` implements the approved existing-table ACL reset and selective grants. It is a local, uncommitted proposal until separately authorized application. Static tests do not prove live effective privileges. No SQL is executed against a database in this implementation task.

The preceding non-production audit reported PostgreSQL 17.6 and excessive direct client privileges on `fishing_day_reports` and `ocean_snapshots`: anonymous clients retained TRUNCATE, REFERENCES, TRIGGER and MAINTAIN; authenticated clients retained these in addition to their intended row operations. Historical migrations granted intended row privileges without fully resetting table ACLs. Current creator defaults are consistent with that residue, but do not prove the exact historical grant event or execution role. The observed direct ACLs establish the exposure; its precise historical origin remains unproven.

## PostgreSQL semantics and correction

PostgreSQL 17 table ALL includes SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER and MAINTAIN. Consequently REVOKE ALL removes MAINTAIN along with the other direct table grants to the two named client roles; the selective grants restore none of the four unwanted capabilities. MAINTAIN covers operations such as VACUUM, ANALYZE, CLUSTER, REINDEX and LOCK TABLE subject to PostgreSQL's operation-specific rules.

RLS constrains row access; it does not protect TRUNCATE or REFERENCES. REFERENCES enables foreign-key definition, and is not required for inserting rows into an existing foreign-key relationship. TRIGGER is a trigger-creation privilege, not a prerequisite for an existing trigger to run. Retaining RLS alone therefore does not correct excess ACLs.

Deterministic reset plus selective grants avoids depending on which surplus privileges happen to be present. RESTRICT fails if dependent grants prevent revocation rather than cascading into other roles. The transaction makes the reset and restoration atomic. It targets only six tables and only anon/authenticated; no administrative/service-role grant, ownership, schema privilege or default ACL is changed. Independent inherited or PUBLIC grants could still affect effective privileges and must be rechecked before/after future application.

Authoritative references: [PostgreSQL 17 privileges](https://www.postgresql.org/docs/17/ddl-priv.html), [row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html), [REVOKE](https://www.postgresql.org/docs/17/sql-revoke.html), [default privileges](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html).

## Runtime needs and exact intended result

| Table | anon direct privileges | authenticated direct privileges | Existing application need |
| --- | --- | --- | --- |
| fishing_day_reports | None | SELECT INSERT UPDATE DELETE | Report creation/return, saved-report reads and deletion; approved existing UPDATE contract retained |
| ocean_snapshots | None | SELECT INSERT | Snapshot save/return, duplicate recovery, retrieval |
| captain_access | None | SELECT | Read captain access state |
| early_access_signups | None | None | Signup through RPC only |
| governed_opportunity_history | None | SELECT INSERT | Append/return, ignore duplicate conflicts, retrieval |
| governed_opportunity_observation | None | SELECT INSERT | Append/return, ignore duplicate conflicts, retrieval |

Neither client receives TRUNCATE, REFERENCES, TRIGGER, MAINTAIN or grant option on any of these tables. RLS still governs allowed row operations; these grants do not bypass it or add captain_access approval to policy.

Local call sites reviewed: `insertReportWithTime` in `frontend/src/utils/fishingLogTemporalCapture.js`; saved-report reads/deletion in `frontend/src/components/SavedFishingDayReports.jsx`; snapshot functions in `frontend/src/lib/oceanMemoryStorage.js`; `frontend/src/hooks/useCaptainAccess.js`; signup RPC in `frontend/src/components/PublicLandingPage.jsx`; snapshot reads and governed history/observation persistence/retrieval functions in `backend/server.js`. Ignore-duplicate persistence is not an UPDATE path. No current report UPDATE caller was found. UPDATE remains because the historical approved report grant/policy supports it; removing that capability would require a separate decision.

## Preserved boundaries

The six existing RLS settings and all 11 policy definitions remain unchanged. All nine historical migrations remain unchanged. No function, sequence, Auth configuration, data, runtime file, ownership or public-schema privilege changes occur.

`join_early_access` remains the existing SECURITY DEFINER signup route with unchanged EXECUTE permissions and function body. Revoking table ACLs from clients does not revoke function EXECUTE or change its owner's table access. The signup sequence permissions are unchanged. This is a compatibility assessment from the approved schema/audit, not a live invocation or delivery test; no signup is submitted.

Default privileges remain unresolved as a separate governance issue. Neither postgres nor supabase_admin defaults are altered. Defaults concern future objects and are not a substitute for correcting existing ACLs. Future Pelora table-creation migrations must explicitly establish their client ACLs until default-privilege governance is separately reviewed. No assumption is made that a schema-local revoke could negate broader global defaults.

## Static verification and future Task 9D.2

The focused tests lock the complete six-statement executable inventory, six-table allowlist, recipients, RESTRICT, exact grants, transaction boundaries and excluded operations. They test PostgreSQL 17 MAINTAIN coverage through ALL semantics, and pin LF-normalized SHA-256 hashes for all nine historical migrations at checkpoint `e86f456327ccd66a4692cbd0adae74fe29b8040f`. They also require this migration to sort immediately after `20260924_ocean_snapshot_privileges_v1.sql`. These are static checks, not a PostgreSQL parser or proof of remote execution/effective grants.

Task 9D.2 requires separate authorization to apply this migration to the verified non-production target. Before applying, confirm target, migration ledger, role/grant dependencies and unchanged expected schema. If unexpected grants or dependent grants exist, stop for review rather than substituting CASCADE.

After authorized application, verify all 96 effective table-privilege combinations: two client roles times six tables times eight PostgreSQL 17 privileges, using `has_table_privilege` with SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER and MAINTAIN. Compare against the exact matrix above. Inspect table and column ACLs, PUBLIC and inherited access, and superuser/BYPASSRLS status; direct ACLs alone are insufficient.

Reconfirm six RLS-enabled tables, the same 11 policy definitions, unchanged ownership and administrative/service-role capabilities, unchanged signup function body/SECURITY DEFINER/search_path/EXECUTE permissions, unchanged signup sequence ACLs, unchanged public-schema privileges and unchanged default ACLs. Confirm the ledger contains the nine historical migrations plus this migration. Do not test TRUNCATE, create data/users, invoke signup, change Auth, repair/reset migrations or alter defaults as a verification shortcut. Record live results separately; this document makes no claim that hardening has been applied.
