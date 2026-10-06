-- Local CP-05 upgrade; function bodies are taken from the reviewed cp02.sql
-- by applyCP05Local.mjs inside this SAME migration transaction.
BEGIN;
SET LOCAL ROLE pelora_cp02_owner;
DROP TRIGGER fenced_acceptance ON cp02.accepted;
DROP FUNCTION cp02.fenced_commit();
ALTER TABLE cp02.ownership ADD COLUMN consumed_at timestamptz;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM cp02.accepted d LEFT JOIN cp02.ownership o USING(job_id)
  LEFT JOIN cp02.attempts a ON a.token=d.token
  WHERE o.job_id IS NULL OR a.job_id IS DISTINCT FROM d.job_id OR o.token IS DISTINCT FROM d.token OR o.fence IS DISTINCT FROM a.fence)
 THEN RAISE EXCEPTION 'legacy-terminal-authority-mismatch'; END IF;
END $$;
-- Preserve every raw/evidence/binding/index byte. Bootstrap terminal claim
-- state from the original recorded acceptance decision, not invented COMMIT time.
UPDATE cp02.ownership o SET consumed_at=d.accepted_at,released=true FROM cp02.accepted d WHERE d.job_id=o.job_id;
ALTER TABLE cp02.ownership ADD CONSTRAINT consumed_claim_shape CHECK(consumed_at IS NULL OR (released AND token IS NOT NULL));

REVOKE ALL ON SCHEMA cp02,cp03,cp04 FROM PUBLIC,pelora_cp02_worker;
GRANT USAGE ON SCHEMA cp02,cp03,cp04 TO pelora_cp02_worker;
REVOKE ALL ON SCHEMA public FROM PUBLIC,pelora_cp02_worker;
REVOKE ALL ON ALL TABLES IN SCHEMA cp02,cp03,cp04,public FROM PUBLIC,pelora_cp02_worker;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA cp02,cp03,cp04,public FROM PUBLIC,pelora_cp02_worker;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA cp02,cp03,cp04,public FROM PUBLIC,pelora_cp02_worker;
ALTER DEFAULT PRIVILEGES REVOKE ALL ON TABLES FROM PUBLIC,pelora_cp02_worker;
ALTER DEFAULT PRIVILEGES REVOKE ALL ON SEQUENCES FROM PUBLIC,pelora_cp02_worker;
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC,pelora_cp02_worker;
ALTER DEFAULT PRIVILEGES IN SCHEMA cp02,cp03,cp04,public REVOKE ALL ON TABLES FROM PUBLIC,pelora_cp02_worker;
ALTER DEFAULT PRIVILEGES IN SCHEMA cp02,cp03,cp04,public REVOKE ALL ON SEQUENCES FROM PUBLIC,pelora_cp02_worker;
ALTER DEFAULT PRIVILEGES IN SCHEMA cp02,cp03,cp04,public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC,pelora_cp02_worker;
COMMIT;
