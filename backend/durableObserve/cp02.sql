-- CP-02 isolated qualification only. Apply as migration authority, never worker.
BEGIN;
SET LOCAL ROLE pelora_cp02_owner;
CREATE SCHEMA cp02 AUTHORIZATION pelora_cp02_owner;
REVOKE ALL ON SCHEMA cp02 FROM PUBLIC;
-- Function EXECUTE is a global PUBLIC default; a schema-only REVOKE would
-- not remove it for future functions. This owner is dedicated to CP-02.
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA cp02 REVOKE ALL ON TABLES FROM PUBLIC;
CREATE TABLE cp02.registry (
 manifest_id text PRIMARY KEY, context jsonb NOT NULL,
 revision bigint NOT NULL CHECK(revision > 0), enabled boolean NOT NULL
);
CREATE TABLE cp02.jobs (
 job_id text PRIMARY KEY, manifest_id text NOT NULL REFERENCES cp02.registry,
 job jsonb NOT NULL, window_start timestamptz NOT NULL, deadline timestamptz NOT NULL,
 latest_start timestamptz NOT NULL, max_attempts integer NOT NULL CHECK(max_attempts BETWEEN 1 AND 20),
 lease_ms integer NOT NULL CHECK(lease_ms BETWEEN 1 AND 120000)
);
CREATE TABLE cp02.ownership (
 job_id text PRIMARY KEY REFERENCES cp02.jobs, fence bigint NOT NULL DEFAULT 0 CHECK(fence BETWEEN 0 AND 9007199254740991),
 token uuid, lease_until timestamptz, released boolean NOT NULL DEFAULT true
);
CREATE TABLE cp02.attempts (
 token uuid PRIMARY KEY, job_id text NOT NULL REFERENCES cp02.jobs,
 fence bigint NOT NULL, attempt_id text UNIQUE NOT NULL, started_at timestamptz NOT NULL,
 UNIQUE(job_id,fence)
);
CREATE TABLE cp02.raw (
 hash text PRIMARY KEY, bytes bytea NOT NULL,
 CHECK(hash = encode(sha256(bytes),'hex')), CHECK(octet_length(bytes) BETWEEN 1 AND 16777216)
);
CREATE TABLE cp02.results (
 token uuid PRIMARY KEY REFERENCES cp02.attempts,
 record_text text NOT NULL, capture_text text NOT NULL, raw_hash text NOT NULL REFERENCES cp02.raw
);
CREATE TABLE cp02.accepted (
 job_id text PRIMARY KEY REFERENCES cp02.jobs, token uuid UNIQUE NOT NULL REFERENCES cp02.results,
 retained_at text NOT NULL, accepted_at timestamptz NOT NULL
);
CREATE FUNCTION cp02.immutable() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN RAISE EXCEPTION 'immutable-record'; END $$;
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp02.jobs FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp02.attempts FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp02.raw FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp02.results FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp02.accepted FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE FUNCTION cp02.fenced_commit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE j cp02.jobs; r cp02.registry; o cp02.ownership; a cp02.attempts; instant timestamptz;
BEGIN
 SELECT * INTO j FROM cp02.jobs WHERE job_id=NEW.job_id;
 SELECT * INTO r FROM cp02.registry WHERE manifest_id=j.manifest_id FOR UPDATE;
 SELECT * INTO o FROM cp02.ownership WHERE job_id=NEW.job_id FOR UPDATE;
 SELECT * INTO a FROM cp02.attempts WHERE token=NEW.token;
 instant := clock_timestamp();
 IF NOT r.enabled OR o.token IS DISTINCT FROM NEW.token OR o.fence IS DISTINCT FROM a.fence
  OR o.released OR instant >= o.lease_until OR instant >= j.deadline
  OR instant < (r.context->'activation'->>'effectiveAt')::timestamptz
  OR (SELECT record_text::jsonb->'binding'->>'activationDigest' FROM cp02.results WHERE token=NEW.token)
   IS DISTINCT FROM (r.context->'activation'->>'digest') THEN RAISE EXCEPTION 'acceptance-not-owned-at-commit'; END IF;
 RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER fenced_acceptance AFTER INSERT ON cp02.accepted
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION cp02.fenced_commit();

-- One narrowly granted API; all object references qualified, fixed search_path.
-- Capabilities are private process-issued UUIDs, never job/manifest payloads.
CREATE FUNCTION cp02.worker(op text, jid text, cap uuid, payload text DEFAULT NULL, raw_bytes bytea DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE j cp02.jobs; r cp02.registry; o cp02.ownership; a cp02.attempts;
 s cp02.results; accepted cp02.accepted; instant timestamptz; e jsonb; b jsonb; p jsonb;
 raw_digest text; ref jsonb; aid text; state jsonb;
BEGIN
 IF op NOT IN ('claim','check','release','raw-write','raw-read','write','read','accept','accepted') THEN
  RAISE EXCEPTION 'unknown-operation';
 END IF;
 SELECT * INTO j FROM cp02.jobs WHERE job_id=jid;
 IF NOT FOUND THEN RAISE EXCEPTION 'unknown-job'; END IF;
 -- Global lock order: protected registry then job ownership. Admin revocation
 -- and reclaim must serialize against acceptance using these same rows.
 SELECT * INTO r FROM cp02.registry WHERE manifest_id=j.manifest_id FOR UPDATE;
 SELECT * INTO o FROM cp02.ownership WHERE job_id=jid FOR UPDATE;
 instant := clock_timestamp(); -- AFTER lock waits, never transaction-start time.
 SELECT * INTO a FROM cp02.attempts WHERE token=cap AND job_id=jid;
 SELECT * INTO accepted FROM cp02.accepted WHERE job_id=jid;
 IF op IN ('accepted','accept') AND accepted.job_id IS NOT NULL THEN
  IF accepted.token IS DISTINCT FROM cap THEN RAISE EXCEPTION 'job-already-accepted'; END IF;
  SELECT * INTO s FROM cp02.results WHERE token=cap;
  IF op='accept' AND s.record_text IS DISTINCT FROM (payload::jsonb->>'recordText') THEN
   RAISE EXCEPTION 'accepted-retry-conflict';
  END IF;
  -- Reconciliation of an already committed decision, never a new acceptance.
  RETURN jsonb_build_object('status','ACKNOWLEDGED','retainedAt',accepted.retained_at,'recordText',s.record_text);
 END IF;
 IF op='accepted' THEN RETURN NULL; END IF;
 IF op='release' THEN
  IF o.token=cap THEN UPDATE cp02.ownership SET released=true WHERE job_id=jid; END IF;
  RETURN '{}'::jsonb;
 END IF;
 IF accepted.job_id IS NOT NULL AND op <> 'check' THEN RAISE EXCEPTION 'job-already-accepted'; END IF;
 IF NOT r.enabled OR instant < j.window_start OR instant >= j.deadline
  OR instant < (r.context->'activation'->>'effectiveAt')::timestamptz
  OR instant < (r.context->'manifest'->>'effectiveFrom')::timestamptz
  OR instant >= (r.context->'manifest'->>'effectiveUntil')::timestamptz THEN RAISE EXCEPTION 'inactive-or-expired'; END IF;
 IF op='claim' THEN
  IF accepted.job_id IS NOT NULL THEN RAISE EXCEPTION 'job-already-accepted'; END IF;
  IF a.token IS NULL THEN
   IF NOT o.released AND o.lease_until > instant THEN RAISE EXCEPTION 'job-busy'; END IF;
   IF instant > j.latest_start OR o.fence >= j.max_attempts THEN RAISE EXCEPTION 'attempt-budget-or-delay'; END IF;
   o.fence := o.fence+1;
   aid := 'coat1-' || encode(sha256(convert_to('pelora-observe-execution-v1/attempt','UTF8') || decode('00','hex') ||
    convert_to(format('{"attemptNumber":%s,"fencingToken":%s,"jobId":"%s"}',o.fence,o.fence,jid),'UTF8')),'hex');
   INSERT INTO cp02.attempts VALUES(cap,jid,o.fence,aid,instant) RETURNING * INTO a;
   UPDATE cp02.ownership SET fence=o.fence, token=cap,
    lease_until=least(j.deadline,instant + j.lease_ms*interval '1 millisecond'),released=false
    WHERE job_id=jid RETURNING * INTO o;
  END IF;
 END IF;
 IF a.token IS NULL OR o.token IS DISTINCT FROM cap OR o.fence IS DISTINCT FROM a.fence
  OR o.released OR instant >= o.lease_until THEN RAISE EXCEPTION 'attempt-not-owned'; END IF;
 state := jsonb_build_object('context',r.context || jsonb_build_object('job',j.job),
  'attempt',jsonb_build_object('attemptId',a.attempt_id,'attemptNumber',a.fence,'fencingToken',a.fence));
 IF op IN ('claim','check') THEN RETURN state; END IF;
 IF op='raw-write' THEN
  IF raw_bytes IS NULL OR octet_length(raw_bytes) > (r.context->'manifest'->'limits'->>'maxResponseBytes')::integer THEN RAISE EXCEPTION 'raw-size'; END IF;
  raw_digest := encode(sha256(raw_bytes),'hex');
  INSERT INTO cp02.raw VALUES(raw_digest,raw_bytes) ON CONFLICT DO NOTHING;
  IF (SELECT bytes FROM cp02.raw WHERE cp02.raw.hash=raw_digest) IS DISTINCT FROM raw_bytes THEN RAISE EXCEPTION 'raw-conflict'; END IF;
  ref := jsonb_build_object('id','current-response-'||raw_digest,'version','retained-response-v1','sha256',raw_digest);
  RETURN jsonb_build_object('status','ACKNOWLEDGED','reference',ref);
 END IF;
 IF op='raw-read' THEN
  p := payload::jsonb; raw_digest := p->>'sha256';
  IF p IS DISTINCT FROM jsonb_build_object('id','current-response-'||raw_digest,'version','retained-response-v1','sha256',raw_digest) THEN RAISE EXCEPTION 'raw-reference'; END IF;
  RETURN (SELECT jsonb_build_object('status','FOUND','hex',encode(bytes,'hex')) FROM cp02.raw WHERE cp02.raw.hash=raw_digest);
 END IF;
 IF op='write' THEN
  p := payload::jsonb; e := p->'execution'; b := p->'binding';
  IF e->>'jobId' IS DISTINCT FROM jid OR e->>'attemptId' IS DISTINCT FROM a.attempt_id
   OR (e->>'fencingToken')::bigint IS DISTINCT FROM a.fence OR (e->>'attemptNumber')::bigint IS DISTINCT FROM a.fence
   OR e->>'manifestDigest' IS DISTINCT FROM j.manifest_id OR e->>'outcome' IS DISTINCT FROM 'NORMALIZED'
   OR b->>'attemptId' IS DISTINCT FROM a.attempt_id OR b->>'jobId' IS DISTINCT FROM jid
   OR (b->>'fencingToken')::bigint IS DISTINCT FROM a.fence
   OR b->>'executionDigest' IS DISTINCT FROM (e->>'digest')
   OR b->'retainedResponseReference' IS DISTINCT FROM e->'acquisition'->'retainedResponseReference'
   OR b->'evidenceReference' IS DISTINCT FROM e->'evidenceReference'
   OR b->>'activationDigest' IS DISTINCT FROM (r.context->'activation'->>'digest')
   OR p->>'captureText' IS NULL THEN RAISE EXCEPTION 'result-binding'; END IF;
  raw_digest := e->'acquisition'->'retainedResponseReference'->>'sha256';
  INSERT INTO cp02.results VALUES(cap,payload,p->>'captureText',raw_digest) ON CONFLICT DO NOTHING;
  IF (SELECT record_text FROM cp02.results WHERE token=cap) IS DISTINCT FROM payload THEN RAISE EXCEPTION 'immutable-result-conflict'; END IF;
  RETURN jsonb_build_object('status','ACKNOWLEDGED');
 END IF;
 SELECT * INTO s FROM cp02.results WHERE token=cap;
 IF op='read' THEN RETURN to_jsonb(s.record_text); END IF;
 IF op='accept' THEN
  p := payload::jsonb;
  IF s.token IS NULL OR s.record_text IS DISTINCT FROM (p->>'recordText') THEN RAISE EXCEPTION 'pending-readback-mismatch'; END IF;
  e := s.record_text::jsonb;
  IF e->'binding'->>'activationDigest' IS DISTINCT FROM (r.context->'activation'->>'digest') THEN RAISE EXCEPTION 'authorization-changed'; END IF;
  IF (p->>'retainedAt')::timestamptz < (e->'execution'->>'finishedAt')::timestamptz
   OR (p->>'retainedAt')::timestamptz > instant OR (p->>'retainedAt')::timestamptz >= j.deadline THEN RAISE EXCEPTION 'retention-time-order'; END IF;
  -- Repeat the live clock check immediately before the unique insertion.
  instant := clock_timestamp();
  IF instant >= o.lease_until OR instant >= j.deadline THEN RAISE EXCEPTION 'attempt-expired-at-accept'; END IF;
  INSERT INTO cp02.accepted VALUES(jid,cap,p->>'retainedAt',instant);
  RETURN jsonb_build_object('status','ACKNOWLEDGED','retainedAt',p->>'retainedAt','recordText',s.record_text);
 END IF;
 RAISE EXCEPTION 'unknown-operation';
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA cp02 FROM PUBLIC,pelora_cp02_worker;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA cp02 FROM PUBLIC,pelora_cp02_worker;
GRANT USAGE ON SCHEMA cp02 TO pelora_cp02_worker;
GRANT EXECUTE ON FUNCTION cp02.worker(text,text,uuid,text,bytea) TO pelora_cp02_worker;
COMMIT;
