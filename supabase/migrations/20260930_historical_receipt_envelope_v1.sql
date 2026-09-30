-- UNAPPLIED CANDIDATE. Runtime role/endpoint provisioning is a separate gate.
-- Administrator owns these objects; the dedicated runtime login must NOT.
-- No application table, captain snapshot, historical capture or role is changed.
BEGIN;
CREATE SCHEMA pelora_receipts;
REVOKE ALL ON SCHEMA pelora_receipts FROM PUBLIC, anon, authenticated, service_role;

CREATE TABLE pelora_receipts.receipt_envelopes (
  evidence_kind text NOT NULL CHECK (evidence_kind = 'captured'),
  evidence_contract_version text NOT NULL,
  evidence_reference_id text NOT NULL,
  evidence_sha256 text NOT NULL CHECK (evidence_sha256 ~ '^[a-f0-9]{64}$'),
  contract_version text NOT NULL CHECK (contract_version = 'pelora-historical-availability-reference-v1'),
  received_at timestamptz NOT NULL CHECK (isfinite(received_at)),
  authority_reference_id text NOT NULL,
  authority_sha256 text NOT NULL CHECK (authority_sha256 ~ '^[a-f0-9]{64}$'),
  envelope_text text NOT NULL CHECK (octet_length(envelope_text) <= 2097152),
  PRIMARY KEY (evidence_kind,evidence_contract_version,evidence_reference_id,evidence_sha256),
  UNIQUE (authority_reference_id,authority_sha256),
  -- JSONB is used only to check mechanical projections; exact bytes remain text.
  CONSTRAINT receipt_projection_matches CHECK ((
    jsonb_typeof(envelope_text::jsonb) = 'object' AND
    envelope_text::jsonb #>> '{record,contractVersion}' = contract_version AND
    envelope_text::jsonb #>> '{record,evidenceReference,kind}' = evidence_kind AND
    envelope_text::jsonb #>> '{record,evidenceReference,contractVersion}' = evidence_contract_version AND
    envelope_text::jsonb #>> '{record,evidenceReference,referenceId}' = evidence_reference_id AND
    envelope_text::jsonb #>> '{record,evidenceReference,sha256}' = evidence_sha256 AND
    (envelope_text::jsonb #>> '{record,receivedAt}')::timestamptz = received_at AND
    envelope_text::jsonb #>> '{record,authorityReference,referenceId}' = authority_reference_id AND
    envelope_text::jsonb #>> '{record,authorityReference,sha256}' = authority_sha256 AND
    envelope_text::jsonb #>> '{record,authorityReference,contractVersion}' = 'pelora-historical-receipt-witness-v1' AND
    envelope_text::jsonb #>> '{issuerPolicy,contractVersion}' = 'pelora-receipt-writer-v1' AND
    jsonb_typeof(envelope_text::jsonb -> 'captureText') = 'string' AND
    jsonb_typeof(envelope_text::jsonb -> 'dependencies') = 'array' AND
    jsonb_typeof(envelope_text::jsonb -> 'authorityTarget') = 'object'
  ) IS TRUE)
);
REVOKE ALL ON TABLE pelora_receipts.receipt_envelopes FROM PUBLIC, anon, authenticated, service_role;
ALTER TABLE pelora_receipts.receipt_envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelora_receipts.receipt_envelopes FORCE ROW LEVEL SECURITY;
-- Deliberately NO policy/grant to PUBLIC or a guessed deployment principal.
-- Default deny until separately authorized bootstrap grants private schema USAGE
-- and this table's INSERT/SELECT, with only role-targeted INSERT/SELECT policies.
-- No UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES/DDL or sequence privileges.
-- The primary key supplies exact-reference resolution; one witness per reference
-- needs no time-ordering index or revision-selection query.
-- Closure and witness share one row. No user FK/cascade. Only separately
-- authorized administration may delete the ENTIRE envelope, never its closure.
-- Backend validates canonical exact capture, digests and full dependency closure;
-- SQL does not pretend to implement the scientific capture validator.
COMMIT;
