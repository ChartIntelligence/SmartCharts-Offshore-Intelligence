-- Additive isolated-local migration. Existing CP-02 fencing/API remains authoritative.
BEGIN;
SET LOCAL ROLE pelora_cp02_owner;
CREATE SCHEMA cp03 AUTHORIZATION pelora_cp02_owner;
REVOKE ALL ON SCHEMA cp03 FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA cp03 REVOKE ALL ON TABLES FROM PUBLIC;
CREATE TABLE cp03.evidence (
 evidence_id text PRIMARY KEY, reference jsonb UNIQUE NOT NULL,
 capture_text text NOT NULL, text_hash text NOT NULL,
 CHECK(text_hash=encode(sha256(convert_to(capture_text,'UTF8')),'hex'))
);
CREATE TABLE cp03.bindings (
 token uuid PRIMARY KEY REFERENCES cp02.results,
 execution_id text UNIQUE NOT NULL, execution_digest text NOT NULL, binding_digest text NOT NULL,
 raw_hash text NOT NULL REFERENCES cp02.raw, evidence_id text NOT NULL REFERENCES cp03.evidence,
 context jsonb NOT NULL, record_hash text NOT NULL
);
CREATE TABLE cp03.observations (
 job_id text PRIMARY KEY REFERENCES cp02.accepted,
 token uuid UNIQUE NOT NULL REFERENCES cp03.bindings,
 manifest_digest text NOT NULL, cell_key text NOT NULL, observation_window jsonb NOT NULL,
 response_reference jsonb NOT NULL, evidence_reference jsonb NOT NULL,
 execution_digest text NOT NULL, binding_digest text NOT NULL,
 timestamps jsonb NOT NULL, source_metadata jsonb NOT NULL,
 receipt_reference jsonb CHECK(receipt_reference IS NULL)
);
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp03.evidence FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp03.bindings FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp03.observations FOR EACH ROW EXECUTE FUNCTION cp02.immutable();

-- Only operational execution/binding data uses this codec. Scientific capture
-- text is NEVER serialized through jsonb (which loses signed zero/number text).
CREATE FUNCTION cp03.canonical(v jsonb) RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path=pg_catalog AS $$
DECLARE result text;
BEGIN
 CASE jsonb_typeof(v)
 WHEN 'object' THEN SELECT '{'||coalesce(string_agg(to_jsonb(key)::text||':'||cp03.canonical(value),',' ORDER BY key COLLATE "C"),'')||'}' INTO result FROM jsonb_each(v);
 WHEN 'array' THEN SELECT '['||coalesce(string_agg(cp03.canonical(value),',' ORDER BY ord),'')||']' INTO result FROM jsonb_array_elements(v) WITH ORDINALITY AS a(value,ord);
 WHEN 'number' THEN result:=trim_scale((v::text)::numeric)::text;
 ELSE result:=v::text;
 END CASE;
 RETURN result;
END $$;
CREATE FUNCTION cp03.sealed_digest(domain text,v jsonb) RETURNS text LANGUAGE sql IMMUTABLE SET search_path=pg_catalog AS $$
 SELECT encode(sha256(convert_to(domain,'UTF8')||decode('00','hex')||convert_to(cp03.canonical(v-'digest'),'UTF8')),'hex')
$$;
CREATE FUNCTION cp03.retain_result() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE p jsonb; e jsonb; b jsonb; c jsonb; er jsonb; rr jsonb; j cp02.jobs; context_value jsonb; envelope text; hash_value text;
 request_value jsonb; response_value jsonb; point_value jsonb; source_value jsonb; source_hash text;
BEGIN
 p:=NEW.record_text::jsonb; e:=p->'execution'; b:=p->'binding'; c:=NEW.capture_text::jsonb;
 er:=e->'evidenceReference'; rr:=e->'acquisition'->'retainedResponseReference';
 SELECT jobs.* INTO j FROM cp02.jobs jobs JOIN cp02.attempts a ON a.job_id=jobs.job_id WHERE a.token=NEW.token;
 SELECT context||jsonb_build_object('job',j.job) INTO context_value FROM cp02.registry WHERE manifest_id=j.manifest_id;
 request_value:=e->'acquisition'->'request'; response_value:=e->'acquisition'->'response'; point_value:=c->'samples'->0->'point';
 source_value:=jsonb_build_object('provider',point_value->'source'->>'provider','dataset',point_value->'source'->>'dataset','classification',point_value->'source'->>'classification');
 source_hash:=encode(sha256(convert_to(cp03.canonical(source_value),'UTF8')),'hex');
 -- Closed operational provenance checks at the database boundary as well as
 -- unchanged authoritative JavaScript validators at admission/readback.
 IF NOT coalesce(p ?& ARRAY['execution','binding','captureText','assessment','responseRetainedAt','requestUrl','metadataBasis'] AND (SELECT count(*) FROM jsonb_object_keys(p))=7,false)
  OR NOT coalesce(e ?& ARRAY['contractVersion','jobId','manifestDigest','cellKey','attemptId','attemptNumber','fencingToken','startedAt','finishedAt','outcome','failure','acquisition','evidenceReference','normalizationVersion','digest'] AND (SELECT count(*) FROM jsonb_object_keys(e))=15,false)
  OR e->>'contractVersion' IS DISTINCT FROM 'pelora-observe-execution-v1'
  OR e->>'normalizationVersion' IS DISTINCT FROM 'pelora-source-normalization-v1'
  OR e->'failure' IS DISTINCT FROM 'null'::jsonb
  OR NOT coalesce(e->'acquisition' ?& ARRAY['request','response','requestedAt','receivedAt','normalizedAt','retainedResponseReference'] AND (SELECT count(*) FROM jsonb_object_keys(e->'acquisition'))=6,false)
  OR c->>'serializationVersion' IS DISTINCT FROM 'pelora-exact-scientific-json-v1'
  OR c->>'digestVersion' IS DISTINCT FROM 'pelora-exact-scientific-content-sha256-v1'
  OR request_value IS DISTINCT FROM jsonb_build_object('provider',context_value->'manifest'->'product'->>'provider',
  'dataset',context_value->'manifest'->'product'->>'dataset','adapter',context_value->'manifest'->'product'->'adapter',
  'gridReference',context_value->'manifest'->'gridReference','indices',j.job->'cell'->'indices','coordinates',j.job->'cell'->'coordinates',
  'selectedProviderTime',request_value->>'selectedProviderTime')
  OR response_value IS DISTINCT FROM jsonb_build_object('provider',request_value->>'provider','dataset',request_value->>'dataset',
   'gridReference',request_value->'gridReference','coordinates',request_value->'coordinates','observationTime',request_value->>'selectedProviderTime')
  OR b IS DISTINCT FROM jsonb_build_object('contractVersion','pelora-observe-binding-v1','manifestReference',j.job->'manifestReference',
   'activationDigest',context_value->'activation'->>'digest','jobId',j.job_id,'cellKey',j.job->>'cellKey','executionDigest',e->>'digest',
   'attemptId',e->>'attemptId','fencingToken',e->'fencingToken','retainedResponseReference',rr,'evidenceReference',er,
   'assurance','STRUCTURAL_CONSISTENCY_ONLY_REQUIRES_TRUSTED_EXECUTION_WITNESS','digest',b->>'digest')
  OR c->'sourceAuthority' IS DISTINCT FROM jsonb_build_object('status','RECORDED_NOT_REQUALIFIED','reference',
   jsonb_build_object('kind','captured','referenceId','recorded-current-source-'||source_hash,'contractVersion','pelora-recorded-current-source-metadata-v1','sha256',source_hash))
  OR jsonb_array_length(c->'samples') IS DISTINCT FROM 1 OR c->'samples'->0->>'role' IS DISTINCT FROM 'center'
  OR c->'samples'->0->>'outcome' IS DISTINCT FROM 'FULFILLED'
  OR point_value->'source'->>'provider' IS DISTINCT FROM request_value->>'provider'
  OR point_value->'source'->>'dataset' IS DISTINCT FROM request_value->>'dataset'
  OR point_value->'source'->>'classification' IS DISTINCT FROM 'altimetry-derived-geostrophic-current'
  OR point_value->'source'->>'availability' IS DISTINCT FROM 'available'
  OR point_value->'requestedLatitude' IS DISTINCT FROM request_value->'coordinates'->'latitude'
  OR point_value->'requestedLongitude' IS DISTINCT FROM request_value->'coordinates'->'longitude'
  OR point_value->'resolvedLatitude' IS DISTINCT FROM response_value->'coordinates'->'latitude'
  OR point_value->'resolvedLongitude' IS DISTINCT FROM response_value->'coordinates'->'longitude'
  OR (point_value->>'observedAt')::timestamptz IS DISTINCT FROM (request_value->>'selectedProviderTime')::timestamptz
  OR NOT coalesce((e->>'startedAt')::timestamptz >= j.window_start AND
   (e->>'startedAt')::timestamptz <= j.latest_start AND
   (e->>'startedAt')::timestamptz <= (e->'acquisition'->>'requestedAt')::timestamptz AND
   (e->'acquisition'->>'requestedAt')::timestamptz <= (e->'acquisition'->>'receivedAt')::timestamptz AND
   (e->'acquisition'->>'receivedAt')::timestamptz <= (p->>'responseRetainedAt')::timestamptz AND
   (p->>'responseRetainedAt')::timestamptz <= (e->'acquisition'->>'normalizedAt')::timestamptz AND
   (e->'acquisition'->>'normalizedAt')::timestamptz <= (e->>'finishedAt')::timestamptz AND
   (e->>'finishedAt')::timestamptz < j.deadline AND
   (e->>'finishedAt')::timestamptz < (context_value->'manifest'->>'effectiveUntil')::timestamptz AND
   (e->'acquisition'->>'receivedAt')::timestamptz-(e->'acquisition'->>'requestedAt')::timestamptz <= (context_value->'manifest'->'limits'->>'requestTimeoutMs')::integer*interval '1 millisecond' AND
   (request_value->>'selectedProviderTime')::timestamptz <= (e->'acquisition'->>'receivedAt')::timestamptz,false)
 THEN RAISE EXCEPTION 'durable-provenance-mismatch'; END IF;
 -- Reference digest wraps the ORIGINAL exact capture string, preserving all scientific numbers.
 envelope:='{"captureVersion":"pelora-governed-current-evidence-capture-v3","content":'||NEW.capture_text||',"digestVersion":"pelora-exact-scientific-content-sha256-v1","purpose":"pelora-exact-current-evidence-reference-v1","serializationVersion":"pelora-exact-scientific-json-v1"}';
 IF p->>'captureText' IS DISTINCT FROM NEW.capture_text OR c->>'family' IS DISTINCT FROM 'CURRENTS'
  OR c->>'contractVersion' IS DISTINCT FROM 'pelora-governed-current-evidence-capture-v3'
  OR er IS DISTINCT FROM jsonb_build_object('kind','captured','referenceId',c->>'captureId','contractVersion',c->>'contractVersion','sha256',encode(sha256(convert_to(envelope,'UTF8')),'hex'))
  OR rr IS DISTINCT FROM jsonb_build_object('id','current-response-'||NEW.raw_hash,'version','retained-response-v1','sha256',NEW.raw_hash)
  OR b->'evidenceReference' IS DISTINCT FROM er OR b->'retainedResponseReference' IS DISTINCT FROM rr
  OR e->>'digest' IS DISTINCT FROM cp03.sealed_digest('pelora-observe-execution-v1',e)
  OR b->>'digest' IS DISTINCT FROM cp03.sealed_digest('pelora-observe-binding-v1',b)
  OR b->>'executionDigest' IS DISTINCT FROM e->>'digest'
  OR e->>'cellKey' IS DISTINCT FROM j.job->>'cellKey' OR b->>'cellKey' IS DISTINCT FROM j.job->>'cellKey'
  OR b->'manifestReference' IS DISTINCT FROM j.job->'manifestReference'
  OR e->'acquisition'->'request'->>'provider' IS DISTINCT FROM context_value->'manifest'->'product'->>'provider'
  OR e->'acquisition'->'request'->>'dataset' IS DISTINCT FROM context_value->'manifest'->'product'->>'dataset'
 THEN RAISE EXCEPTION 'durable-reference-mismatch'; END IF;
 IF NOT EXISTS(SELECT 1 FROM cp02.raw WHERE hash=NEW.raw_hash AND hash=encode(sha256(bytes),'hex')) THEN RAISE EXCEPTION 'durable-raw-mismatch'; END IF;
 hash_value:=encode(sha256(convert_to(NEW.capture_text,'UTF8')),'hex');
 INSERT INTO cp03.evidence VALUES(c->>'captureId',er,NEW.capture_text,hash_value) ON CONFLICT DO NOTHING;
 IF NOT EXISTS(SELECT 1 FROM cp03.evidence WHERE evidence_id=c->>'captureId' AND reference=er AND capture_text=NEW.capture_text AND text_hash=hash_value) THEN RAISE EXCEPTION 'immutable-evidence-conflict'; END IF;
 INSERT INTO cp03.bindings VALUES(NEW.token,e->>'attemptId',e->>'digest',b->>'digest',NEW.raw_hash,c->>'captureId',context_value,encode(sha256(convert_to(NEW.record_text,'UTF8')),'hex'));
 RETURN NEW;
END $$;
CREATE FUNCTION cp03.index_acceptance() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE p jsonb; e jsonb; d cp03.bindings; j cp02.jobs;
BEGIN
 SELECT * INTO STRICT d FROM cp03.bindings WHERE token=NEW.token;
 SELECT record_text::jsonb INTO STRICT p FROM cp02.results WHERE token=NEW.token;
 e:=p->'execution'; SELECT * INTO STRICT j FROM cp02.jobs WHERE job_id=NEW.job_id;
 INSERT INTO cp03.observations VALUES(NEW.job_id,NEW.token,j.manifest_id,j.job->>'cellKey',j.job->'window',
 e->'acquisition'->'retainedResponseReference',e->'evidenceReference',d.execution_digest,d.binding_digest,
 jsonb_build_object('selectedProviderTime',e->'acquisition'->'request'->>'selectedProviderTime','startedAt',e->>'startedAt',
 'requestedAt',e->'acquisition'->>'requestedAt','receivedAt',e->'acquisition'->>'receivedAt','normalizedAt',e->'acquisition'->>'normalizedAt',
 'finishedAt',e->>'finishedAt','responseRetainedAt',p->>'responseRetainedAt','retainedAt',NEW.retained_at,'acceptedAt',to_char(NEW.accepted_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
 jsonb_build_object('request',e->'acquisition'->'request','response',e->'acquisition'->'response','metadataBasis',p->'metadataBasis'),NULL);
 RETURN NEW;
END $$;
CREATE TRIGGER durable_result AFTER INSERT ON cp02.results FOR EACH ROW EXECUTE FUNCTION cp03.retain_result();
CREATE TRIGGER durable_index AFTER INSERT ON cp02.accepted FOR EACH ROW EXECUTE FUNCTION cp03.index_acceptance();

-- Replay migration through exactly the same checks; retain CP-02 history unchanged.
CREATE TABLE cp03.migration_result (LIKE cp02.results);
CREATE TRIGGER replay AFTER INSERT ON cp03.migration_result FOR EACH ROW EXECUTE FUNCTION cp03.retain_result();
-- Legacy revoked/changed staging has no preserved original activation context.
-- Keep it in CP-02 audit history; never invent that context or accept it here.
INSERT INTO cp03.migration_result
 SELECT s.* FROM cp02.results s JOIN cp02.attempts a USING(token)
 JOIN cp02.jobs j ON j.job_id=a.job_id JOIN cp02.registry r ON r.manifest_id=j.manifest_id
 WHERE s.record_text::jsonb->'binding'->>'activationDigest'=r.context->'activation'->>'digest';
DROP TABLE cp03.migration_result;
CREATE TABLE cp03.migration_acceptance (LIKE cp02.accepted);
CREATE TRIGGER replay AFTER INSERT ON cp03.migration_acceptance FOR EACH ROW EXECUTE FUNCTION cp03.index_acceptance();
INSERT INTO cp03.migration_acceptance SELECT * FROM cp02.accepted;
DROP TABLE cp03.migration_acceptance;

-- Internal archival lookup: historical accepted evidence, no current/freshness claim.
CREATE FUNCTION cp03.lookup(jid text) RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT jsonb_build_object('index',to_jsonb(o),'context',d.context,'recordText',r.record_text,'recordHash',d.record_hash,
 'accepted',jsonb_build_object('jobId',a.job_id,'token',a.token,'retainedAt',a.retained_at,'acceptedAt',to_char(a.accepted_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
 'captureText',c.capture_text,'captureTextHash',c.text_hash,'evidenceReference',c.reference,
 'rawHex',encode(raw.bytes,'hex'),'rawHash',raw.hash,'binding',to_jsonb(d))
 FROM cp02.accepted a LEFT JOIN cp03.observations o ON a.job_id=o.job_id AND a.token=o.token
 LEFT JOIN cp03.bindings d ON d.token=o.token LEFT JOIN cp02.results r ON r.token=d.token
 LEFT JOIN cp03.evidence c ON c.evidence_id=d.evidence_id LEFT JOIN cp02.raw raw ON raw.hash=d.raw_hash WHERE a.job_id=jid
$$;
REVOKE ALL ON ALL TABLES IN SCHEMA cp03 FROM PUBLIC,pelora_cp02_worker;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA cp03 FROM PUBLIC,pelora_cp02_worker;
GRANT USAGE ON SCHEMA cp03 TO pelora_cp02_worker;
GRANT EXECUTE ON FUNCTION cp03.lookup(text) TO pelora_cp02_worker;
COMMIT;
