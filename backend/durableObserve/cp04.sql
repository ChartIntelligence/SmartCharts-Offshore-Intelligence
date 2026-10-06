-- CP-04 additive isolated-local recovery. CP-02/03 acceptance and identities unchanged.
BEGIN;
SET LOCAL ROLE pelora_cp02_owner;
CREATE SCHEMA cp04 AUTHORIZATION pelora_cp02_owner;
REVOKE ALL ON SCHEMA cp04 FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA cp04 REVOKE ALL ON TABLES FROM PUBLIC;
CREATE TABLE cp04.raw_checkpoints (
 token uuid PRIMARY KEY REFERENCES cp02.attempts,
 raw_hash text NOT NULL REFERENCES cp02.raw,
 origin jsonb NOT NULL, first_retained_at timestamptz NOT NULL
);
CREATE TABLE cp04.replays (
 token uuid PRIMARY KEY REFERENCES cp04.raw_checkpoints,
 source_attempt_id text NOT NULL REFERENCES cp02.attempts(attempt_id),
 raw_hash text NOT NULL REFERENCES cp02.raw,
 replayed_at timestamptz NOT NULL
);
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp04.raw_checkpoints FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp04.replays FOR EACH ROW EXECUTE FUNCTION cp02.immutable();

-- Follow immutable replay ancestry (bounded by the existing attempt budget).
-- A second crash after a replayed raw checkpoint cannot lose the earlier
-- exact evidence constraint just because its immediate predecessor is raw-only.
CREATE FUNCTION cp04.staged(jid text,aid text) RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
 WITH RECURSIVE ancestry AS (
  SELECT a.token,a.attempt_id,ARRAY[a.attempt_id] AS path FROM cp02.attempts a WHERE a.job_id=jid AND a.attempt_id=aid
  UNION ALL
  SELECT a.token,a.attempt_id,prior.path||a.attempt_id FROM ancestry prior JOIN cp04.replays replay ON replay.token=prior.token
   JOIN cp02.attempts a ON a.attempt_id=replay.source_attempt_id AND a.job_id=jid
   WHERE cardinality(prior.path)<20 AND NOT a.attempt_id=ANY(prior.path)
 )
 SELECT jsonb_build_object('context',d.context,'recordText',s.record_text,'recordHash',d.record_hash,
  'captureText',c.capture_text,'captureTextHash',c.text_hash,'evidenceReference',c.reference,
  'rawHex',encode(raw.bytes,'hex'),'rawHash',raw.hash,'executionId',d.execution_id,
  'executionDigest',d.execution_digest,'bindingDigest',d.binding_digest,'evidenceId',d.evidence_id,'sourcePath',to_jsonb(ancestry.path))
 FROM ancestry JOIN cp02.results s ON s.token=ancestry.token LEFT JOIN cp03.bindings d ON d.token=s.token
 LEFT JOIN cp03.evidence c ON c.evidence_id=d.evidence_id LEFT JOIN cp02.raw raw ON raw.hash=s.raw_hash
 ORDER BY cardinality(ancestry.path) LIMIT 1
$$;

CREATE FUNCTION cp04.inspect(jid text,cap uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE j cp02.jobs; r cp02.registry; o cp02.ownership; instant timestamptz; status_value text; candidate_value jsonb;
BEGIN
 SELECT * INTO j FROM cp02.jobs WHERE job_id=jid;
 IF NOT FOUND THEN RAISE EXCEPTION 'unknown-job'; END IF;
 -- Same protected lock order as CP-02. Inspection waits out any in-flight
 -- authoritative acceptance transaction before reporting its outcome.
 SELECT * INTO r FROM cp02.registry WHERE manifest_id=j.manifest_id FOR UPDATE;
 SELECT * INTO o FROM cp02.ownership WHERE job_id=jid FOR UPDATE;
 IF EXISTS(SELECT 1 FROM cp02.accepted WHERE job_id=jid) THEN
  RETURN jsonb_build_object('status','ACCEPTED','accepted',cp03.lookup(jid));
 END IF;
 instant:=clock_timestamp();
 IF NOT r.enabled OR instant < j.window_start OR instant >= j.deadline
  OR instant < (r.context->'activation'->>'effectiveAt')::timestamptz
  OR instant < (r.context->'manifest'->>'effectiveFrom')::timestamptz
  OR instant >= (r.context->'manifest'->>'effectiveUntil')::timestamptz THEN status_value:='BLOCKED';
 ELSIF EXISTS(SELECT 1 FROM cp02.attempts WHERE token=cap AND job_id=jid) THEN
  IF o.token=cap AND NOT o.released AND instant < o.lease_until THEN status_value:='OWNED'; ELSE status_value:='FENCED'; END IF;
 ELSIF NOT o.released AND instant < o.lease_until THEN status_value:='BUSY';
 ELSE status_value:='READY'; END IF;
 -- Private capabilities are never returned. Legacy CP-03 stages supply their
 -- exact original source material; unattributed CP-02 raw orphans cannot.
 SELECT jsonb_build_object('sourceAttemptId',a.attempt_id,
  'rawHash',coalesce(q.raw_hash,s.raw_hash),'rawHex',encode(raw.bytes,'hex'),
  'origin',coalesce(q.origin,jsonb_build_object('url',s.record_text::jsonb->>'requestUrl',
    'provider',s.record_text::jsonb->'execution'->'acquisition'->'request'->>'provider',
    'dataset',s.record_text::jsonb->'execution'->'acquisition'->'request'->>'dataset')),
  'checkpointHash',q.raw_hash,
  'replaySourceAttemptId',replay.source_attempt_id,
  'stage',cp04.staged(jid,a.attempt_id))
 INTO candidate_value
 FROM cp02.attempts a LEFT JOIN cp04.raw_checkpoints q ON q.token=a.token
 LEFT JOIN cp04.replays replay ON replay.token=a.token
 LEFT JOIN cp02.results s ON s.token=a.token LEFT JOIN cp03.bindings d ON d.token=s.token
 LEFT JOIN cp03.evidence c ON c.evidence_id=d.evidence_id
 LEFT JOIN cp02.raw raw ON raw.hash=coalesce(q.raw_hash,s.raw_hash)
 LEFT JOIN cp02.raw stage_raw ON stage_raw.hash=s.raw_hash
 WHERE a.job_id=jid AND (q.token IS NOT NULL OR s.token IS NOT NULL)
 ORDER BY a.fence DESC LIMIT 1;
 RETURN jsonb_build_object('status',status_value,'context',r.context||jsonb_build_object('job',j.job),
  'candidate',candidate_value);
END $$;

-- New composition routes through this narrow wrapper. Existing CP-02 API and
-- all its locks/deferred checks remain intact; no independent accept operation.
CREATE FUNCTION cp04.worker(op text,jid text,cap uuid,payload text DEFAULT NULL,raw_bytes bytea DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result_value jsonb; p jsonb; origin_value jsonb; hash_value text; source_id text; prior_hash text; prior_origin jsonb;
 source_capture text; current_record jsonb; r cp02.registry; q cp04.raw_checkpoints;
BEGIN
 IF op='raw-write' THEN
  result_value:=cp02.worker(op,jid,cap,NULL,raw_bytes);
  p:=payload::jsonb; origin_value:=p->'origin'; source_id:=p->>'replaySourceAttemptId';
  SELECT registry.* INTO r FROM cp02.registry registry JOIN cp02.jobs j ON j.manifest_id=registry.manifest_id WHERE j.job_id=jid;
  IF NOT coalesce(p ?& ARRAY['origin','replaySourceAttemptId'] AND (SELECT count(*) FROM jsonb_object_keys(p))=2,false)
   OR NOT coalesce(origin_value ?& ARRAY['url','provider','dataset'] AND (SELECT count(*) FROM jsonb_object_keys(origin_value))=3,false)
   OR origin_value->>'provider' IS DISTINCT FROM r.context->'manifest'->'product'->>'provider'
   OR origin_value->>'dataset' IS DISTINCT FROM r.context->'manifest'->'product'->>'dataset'
   OR coalesce(length(origin_value->>'url'),0) NOT BETWEEN 1 AND 4096 THEN RAISE EXCEPTION 'recovery-origin-mismatch'; END IF;
  hash_value:=result_value->'reference'->>'sha256';
  IF source_id IS NULL AND EXISTS(
   SELECT 1 FROM cp02.attempts a LEFT JOIN cp04.raw_checkpoints prior ON prior.token=a.token
    LEFT JOIN cp02.results s ON s.token=a.token
   WHERE a.job_id=jid AND a.token<>cap AND (prior.token IS NOT NULL OR s.token IS NOT NULL)
  ) THEN RAISE EXCEPTION 'recovery-replay-source-required'; END IF;
  IF source_id IS NOT NULL THEN
   SELECT coalesce(prior.raw_hash,s.raw_hash),coalesce(prior.origin,jsonb_build_object('url',s.record_text::jsonb->>'requestUrl',
    'provider',s.record_text::jsonb->'execution'->'acquisition'->'request'->>'provider',
    'dataset',s.record_text::jsonb->'execution'->'acquisition'->'request'->>'dataset'))
   INTO prior_hash,prior_origin FROM cp02.attempts a LEFT JOIN cp04.raw_checkpoints prior ON prior.token=a.token
   LEFT JOIN cp02.results s ON s.token=a.token WHERE a.attempt_id=source_id AND a.job_id=jid;
   IF prior_hash IS DISTINCT FROM hash_value OR prior_origin IS DISTINCT FROM origin_value THEN RAISE EXCEPTION 'recovery-raw-conflict'; END IF;
  END IF;
  INSERT INTO cp04.raw_checkpoints VALUES(cap,hash_value,origin_value,clock_timestamp()) ON CONFLICT DO NOTHING;
  SELECT * INTO q FROM cp04.raw_checkpoints WHERE token=cap;
  IF q.raw_hash IS DISTINCT FROM hash_value OR q.origin IS DISTINCT FROM origin_value THEN RAISE EXCEPTION 'immutable-recovery-raw-conflict'; END IF;
  IF source_id IS NOT NULL THEN
   INSERT INTO cp04.replays VALUES(cap,source_id,hash_value,clock_timestamp()) ON CONFLICT DO NOTHING;
   IF NOT EXISTS(SELECT 1 FROM cp04.replays WHERE token=cap AND source_attempt_id=source_id AND raw_hash=hash_value) THEN RAISE EXCEPTION 'immutable-replay-conflict'; END IF;
  END IF;
  RETURN result_value;
 END IF;
 IF op='write' THEN
  PERFORM cp02.worker('check',jid,cap,NULL,NULL);
  current_record:=payload::jsonb; SELECT * INTO q FROM cp04.raw_checkpoints WHERE token=cap;
  IF q.token IS NULL OR q.raw_hash IS DISTINCT FROM current_record->'execution'->'acquisition'->'retainedResponseReference'->>'sha256'
   OR q.origin IS DISTINCT FROM jsonb_build_object('url',current_record->>'requestUrl',
    'provider',current_record->'execution'->'acquisition'->'request'->>'provider',
    'dataset',current_record->'execution'->'acquisition'->'request'->>'dataset') THEN RAISE EXCEPTION 'recovery-checkpoint-mismatch'; END IF;
  SELECT cp04.staged(jid,replay.source_attempt_id)->>'captureText' INTO source_capture FROM cp04.replays replay WHERE replay.token=cap;
  IF source_capture IS NOT NULL AND source_capture IS DISTINCT FROM current_record->>'captureText' THEN RAISE EXCEPTION 'recovery-evidence-conflict'; END IF;
 END IF;
 RETURN cp02.worker(op,jid,cap,payload,raw_bytes);
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA cp04 FROM PUBLIC,pelora_cp02_worker;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA cp04 FROM PUBLIC,pelora_cp02_worker;
GRANT USAGE ON SCHEMA cp04 TO pelora_cp02_worker;
GRANT EXECUTE ON FUNCTION cp04.inspect(text,uuid),cp04.worker(text,text,uuid,text,bytea) TO pelora_cp02_worker;
COMMIT;
