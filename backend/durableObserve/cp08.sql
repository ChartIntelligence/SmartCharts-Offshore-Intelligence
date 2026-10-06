BEGIN;
SET LOCAL ROLE pelora_cp02_owner;
CREATE SCHEMA cp08 AUTHORIZATION pelora_cp02_owner;
REVOKE ALL ON SCHEMA cp08 FROM PUBLIC,pelora_cp02_worker;
CREATE TABLE cp08.contexts(context_key text PRIMARY KEY,descriptor jsonb NOT NULL);
CREATE TABLE cp08.versions(version_id text PRIMARY KEY,context_key text NOT NULL REFERENCES cp08.contexts,cycle_at timestamptz NOT NULL,revision integer NOT NULL CHECK(revision>0),parent_id text REFERENCES cp08.versions,
 action text NOT NULL,lifecycle text NOT NULL,scientific_state text,record_text text NOT NULL,digest text NOT NULL,
 UNIQUE(context_key,cycle_at,revision),CHECK(digest=encode(sha256(convert_to(record_text,'UTF8')),'hex')),CHECK(octet_length(record_text)<=16777216));
CREATE TABLE cp08.heads(context_key text REFERENCES cp08.contexts,cycle_at timestamptz NOT NULL,version_id text NOT NULL UNIQUE REFERENCES cp08.versions,PRIMARY KEY(context_key,cycle_at));
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp08.contexts FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp08.versions FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE FUNCTION cp08.submit(txt text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE p jsonb; ctx cp08.contexts; prior cp08.versions; existing cp08.versions; slot timestamptz; n integer; state text; dig text;
BEGIN
 IF current_database()<>'pelora_phase3_qualification' OR current_setting('listen_addresses')<>'127.0.0.1' OR inet_server_port()<>55432 THEN RAISE EXCEPTION 'publication-local-only'; END IF;
 IF txt IS NULL OR octet_length(txt)>16777216 THEN RAISE EXCEPTION 'publication-capacity'; END IF;
 p:=txt::jsonb;dig:=encode(sha256(convert_to(txt,'UTF8')),'hex');
 IF p->>'contentDigest' IS DISTINCT FROM encode(sha256(convert_to(regexp_replace(txt,',"contentDigest":"[0-9a-f]{64}"',''),'UTF8')),'hex') THEN RAISE EXCEPTION 'publication-content-digest'; END IF;
 IF p->>'contractVersion' IS DISTINCT FROM 'pelora-ranked-opportunity-publication-envelope-v1' THEN RAISE EXCEPTION 'publication-contract'; END IF;
 SELECT * INTO ctx FROM cp08.contexts WHERE context_key=p->>'contextKey' FOR UPDATE;
 IF NOT FOUND OR ctx.descriptor IS DISTINCT FROM p->'context' THEN RAISE EXCEPTION 'publication-context-authority'; END IF;
 slot:=(p->'cycle'->>'scheduledAt')::timestamptz;n:=(p->>'revision')::integer;
 IF n IS NULL OR n<1 OR NOT isfinite(slot) OR date_trunc('hour',slot)<>slot OR mod(extract(hour FROM slot AT TIME ZONE 'UTC')::integer,4)<>0
 OR p->>'assessmentCutoff' IS DISTINCT FROM p->'cycle'->>'scheduledAt'
 OR (p->>'publicationAt')::timestamptz>clock_timestamp() OR (p->>'publicationAt')::timestamptz<slot
 OR p->'context'->>'species' IS DISTINCT FROM 'blue-marlin' OR p->'cycle'->'region' IS DISTINCT FROM ctx.descriptor->'region'
 OR p->'cycle'->'configuration'->'species' IS DISTINCT FROM jsonb_build_array('blue-marlin') THEN RAISE EXCEPTION 'publication-identity-time'; END IF;
 IF p->>'versionId' IS DISTINCT FROM 'rpv1-'||encode(sha256(convert_to((p->>'contextKey')||chr(10)||to_char(slot AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')||chr(10)||n::text,'UTF8')),'hex') THEN RAISE EXCEPTION 'publication-version-identity'; END IF;
 SELECT * INTO existing FROM cp08.versions WHERE version_id=p->>'versionId';
 IF FOUND THEN IF existing.record_text IS DISTINCT FROM txt THEN RAISE EXCEPTION 'publication-version-conflict'; END IF;
 RETURN jsonb_build_object('recordText',existing.record_text,'digest',existing.digest); END IF;
 SELECT v.* INTO prior FROM cp08.heads h JOIN cp08.versions v USING(version_id) WHERE h.context_key=ctx.context_key AND h.cycle_at=slot;
 IF prior.version_id IS NULL THEN
  IF n<>1 OR p->>'parentId' IS NOT NULL OR p->>'action'<>'ORIGINAL' THEN RAISE EXCEPTION 'publication-initial-revision'; END IF;
 ELSE IF n<>prior.revision+1 OR p->>'parentId' IS DISTINCT FROM prior.version_id THEN RAISE EXCEPTION 'publication-revision-conflict'; END IF;
 END IF;
 IF p->>'lifecycle' NOT IN ('running','delayed','completed','failed','withdrawn') OR p->>'action' NOT IN ('ORIGINAL','STATUS','CORRECTION','WITHDRAWAL')
 OR (p->>'action'='WITHDRAWAL') IS DISTINCT FROM (p->>'lifecycle'='withdrawn') OR (n>1 AND p->>'action'='ORIGINAL')
 OR (p->>'action'='CORRECTION' AND p->>'lifecycle'<>'completed') THEN RAISE EXCEPTION 'publication-lifecycle'; END IF;
 IF p->>'action'='STATUS' AND prior.lifecycle IN ('completed','withdrawn') THEN RAISE EXCEPTION 'publication-explicit-correction-required'; END IF;
 state:=p->'producerBundle'->'evaluationState'->>'state';
 IF p->>'lifecycle'='completed' THEN
  IF state IS NULL OR state NOT IN ('available','governed-zero','partial','unavailable') OR p->'producerBundle'->'evaluationState'->>'scope' IS DISTINCT FROM 'selected-analysis-cohort'
  OR p->'producerBundle'->'evaluationState'->>'contractVersion' IS DISTINCT FROM 'pelora-governed-opportunity-evaluation-state-v1' THEN RAISE EXCEPTION 'publication-evaluation-state'; END IF;
  IF state='governed-zero' AND (jsonb_array_length(p->'producerBundle'->'delivery'->'opportunities')<>0 OR (p->'producerBundle'->'evaluationState'->'counts'->>'selectedCandidates')::int<=0 OR (p->'producerBundle'->'evaluationState'->'counts'->>'unresolvedCandidates')::int<>0) THEN RAISE EXCEPTION 'publication-zero-inconsistent'; END IF;
 ELSE IF p->'producerBundle'<>'null'::jsonb THEN RAISE EXCEPTION 'publication-no-invented-result'; END IF; END IF;
 INSERT INTO cp08.versions VALUES(p->>'versionId',ctx.context_key,slot,n,p->>'parentId',p->>'action',p->>'lifecycle',state,txt,dig);
 INSERT INTO cp08.heads VALUES(ctx.context_key,slot,p->>'versionId') ON CONFLICT(context_key,cycle_at) DO UPDATE SET version_id=EXCLUDED.version_id;
 RETURN jsonb_build_object('recordText',txt,'digest',dig);
END $$;
CREATE FUNCTION cp08.lookup(ck text,slot timestamptz,mode text) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v cp08.versions; ctx jsonb;
BEGIN
 SELECT descriptor INTO ctx FROM cp08.contexts WHERE context_key=ck; IF NOT FOUND THEN RETURN NULL; END IF;
 IF mode='cycle' THEN SELECT x.* INTO v FROM cp08.heads h JOIN cp08.versions x USING(version_id) WHERE h.context_key=ck AND h.cycle_at=slot;
 ELSIF mode='successful-history' THEN SELECT x.* INTO v FROM cp08.heads h JOIN cp08.versions x USING(version_id) WHERE h.context_key=ck AND h.cycle_at<=slot AND x.lifecycle='completed' AND x.scientific_state IN ('available','governed-zero') ORDER BY h.cycle_at DESC LIMIT 1;
 ELSE RAISE EXCEPTION 'publication-read-mode'; END IF;
 RETURN jsonb_build_object('context',ctx,'recordText',v.record_text,'digest',v.digest);
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA cp08 FROM PUBLIC,pelora_cp02_worker;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA cp08 FROM PUBLIC,pelora_cp02_worker;
GRANT USAGE ON SCHEMA cp08 TO pelora_cp02_worker;
GRANT EXECUTE ON FUNCTION cp08.submit(text),cp08.lookup(text,timestamptz,text) TO pelora_cp02_worker;
COMMIT;
