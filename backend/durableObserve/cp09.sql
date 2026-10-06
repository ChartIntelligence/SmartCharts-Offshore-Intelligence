BEGIN;
SET LOCAL ROLE pelora_cp02_owner;
CREATE SCHEMA cp09 AUTHORIZATION pelora_cp02_owner;
REVOKE ALL ON SCHEMA cp09 FROM PUBLIC,pelora_cp02_worker;
CREATE TABLE cp09.configurations(id text PRIMARY KEY, cycle_template_text text NOT NULL, record_text text NOT NULL, digest text NOT NULL, context_key text NOT NULL REFERENCES cp08.contexts, effective_at timestamptz NOT NULL, approved_at timestamptz NOT NULL, clock_mode text NOT NULL CHECK(clock_mode IN ('DATABASE','CONTROLLED_FIXTURE')), created_at timestamptz NOT NULL DEFAULT clock_timestamp(), CHECK(effective_at>=approved_at),CHECK(digest=encode(sha256(convert_to(record_text,'UTF8')),'hex')));
CREATE TABLE cp09.disables(config_id text PRIMARY KEY REFERENCES cp09.configurations, disabled_at timestamptz NOT NULL, recorded_at timestamptz NOT NULL DEFAULT clock_timestamp());
CREATE TABLE cp09.jobs(job_id text PRIMARY KEY,config_id text NOT NULL REFERENCES cp09.configurations,context_key text NOT NULL,cycle_at timestamptz NOT NULL,cycle_id text NOT NULL,cycle_text text NOT NULL,state text NOT NULL DEFAULT 'pending',fence integer NOT NULL DEFAULT 0,capability uuid,lease_until timestamptz,started_at timestamptz,terminal_at timestamptz,UNIQUE(context_key,cycle_at));
CREATE TABLE cp09.attempts(attempt_id text PRIMARY KEY,job_id text NOT NULL REFERENCES cp09.jobs,fence integer NOT NULL,capability uuid NOT NULL UNIQUE,started_at timestamptz NOT NULL,lease_until timestamptz NOT NULL,UNIQUE(job_id,fence));
CREATE TABLE cp09.freezes(job_id text PRIMARY KEY REFERENCES cp09.jobs,record_text text NOT NULL,digest text NOT NULL,constructed_at timestamptz NOT NULL,attempt_id text NOT NULL REFERENCES cp09.attempts,CHECK(digest=encode(sha256(convert_to(record_text,'UTF8')),'hex')));
CREATE TABLE cp09.submissions(job_id text PRIMARY KEY REFERENCES cp09.jobs,record_text text NOT NULL,digest text NOT NULL,prepared_at timestamptz NOT NULL DEFAULT clock_timestamp(),attempt_id text NOT NULL REFERENCES cp09.attempts,CHECK(digest=encode(sha256(convert_to(record_text,'UTF8')),'hex')));
CREATE TABLE cp09.completions(job_id text PRIMARY KEY REFERENCES cp09.jobs,version_id text NOT NULL REFERENCES cp08.versions,digest text NOT NULL,attempt_id text NOT NULL REFERENCES cp09.attempts,finished_at timestamptz NOT NULL);
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp09.configurations FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp09.disables FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp09.attempts FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp09.freezes FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp09.submissions FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp09.completions FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE FUNCTION cp09.terminal_immutable() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN IF OLD.terminal_at IS NOT NULL THEN RAISE EXCEPTION 'immutable-publisher-terminal'; END IF;RETURN NEW;END $$;
CREATE TRIGGER terminal_immutable BEFORE UPDATE OR DELETE ON cp09.jobs FOR EACH ROW EXECUTE FUNCTION cp09.terminal_immutable();
-- Separate trusted internal CP-08 transition from unmanaged/manual worker submissions.
ALTER FUNCTION cp08.submit(text) RENAME TO submit_internal;
REVOKE ALL ON FUNCTION cp08.submit_internal(text) FROM PUBLIC,pelora_cp02_worker;
CREATE FUNCTION cp08.submit(txt text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE p jsonb;
BEGIN
 p:=txt::jsonb;
 -- Lock the same context before testing managed ownership; enumeration locks it too.
 PERFORM 1 FROM cp08.contexts WHERE context_key=p->>'contextKey' FOR UPDATE;
 IF EXISTS(SELECT 1 FROM cp09.jobs WHERE context_key=p->>'contextKey' AND cycle_at=(p->'cycle'->>'scheduledAt')::timestamptz) THEN RAISE EXCEPTION 'publication-managed-cycle-use-fenced-publisher'; END IF;
 RETURN cp08.submit_internal(txt);
END $$;
CREATE FUNCTION cp09.worker(op text,key text,cap uuid,payload text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c cp09.configurations;j cp09.jobs; a cp09.attempts;f cp09.freezes;s cp09.submissions;d cp09.completions;p jsonb; cfg jsonb;t timestamptz;slot timestamptz;start_at timestamptz;actual timestamptz;cy jsonb;ct text;jid text;v jsonb;amount integer;result jsonb:='[]'::jsonb;
BEGIN
 IF current_database()<>'pelora_phase3_qualification' OR current_setting('listen_addresses')<>'127.0.0.1' OR inet_server_port()<>55432 THEN RAISE EXCEPTION 'publisher-local-only'; END IF;
 IF payload IS NOT NULL AND octet_length(payload)>16777216 THEN RAISE EXCEPTION 'publisher-capacity';END IF;
 IF op='configurations' THEN RETURN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'recordText',record_text,'digest',digest) ORDER BY id),'[]'::jsonb) FROM cp09.configurations WHERE NOT EXISTS(SELECT 1 FROM cp09.disables WHERE config_id=id));END IF;
 IF op='enumerate' THEN
  SELECT * INTO c FROM cp09.configurations WHERE id=key FOR UPDATE;IF NOT FOUND THEN RAISE EXCEPTION 'publisher-unapproved-config';END IF;cfg:=c.record_text::jsonb;
  IF EXISTS(SELECT 1 FROM cp09.disables WHERE config_id=key) THEN RETURN result;END IF;
  actual:=clock_timestamp();t:=actual;IF c.clock_mode='CONTROLLED_FIXTURE' THEN t:=payload::timestamptz;END IF;IF t<c.approved_at THEN RAISE EXCEPTION 'publisher-before-authorization';END IF;
  PERFORM 1 FROM cp08.contexts WHERE context_key=c.context_key FOR UPDATE;
  start_at:=date_trunc('day',c.effective_at)+(ceil(extract(epoch FROM (c.effective_at-date_trunc('day',c.effective_at)))/14400)*interval '4 hours');
  SELECT coalesce(max(cycle_at)+interval '4 hours',start_at) INTO start_at FROM cp09.jobs WHERE config_id=key;
  amount:=(cfg->'settings'->>'catchUpCycles')::int;
  FOR slot IN SELECT x FROM generate_series(start_at,t,interval '4 hours') x ORDER BY x LIMIT amount LOOP
   -- Cycle identity is supplied by the validated server configuration's deterministic template.
   ct:=replace(c.cycle_template_text,'__SCHEDULED_AT__',to_char(slot AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'));cy:=ct::jsonb;
   jid:='pjob1-'||encode(sha256(convert_to(c.context_key||chr(10)||to_char(slot AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'UTF8')),'hex');
   INSERT INTO cp09.jobs(job_id,config_id,context_key,cycle_at,cycle_id,cycle_text) VALUES(jid,key,c.context_key,slot,'ocycle-'||encode(sha256(convert_to(cp03.canonical(jsonb_build_object('contractVersion','pelora-governed-ocean-publication-v2','scheduledAt',cy->>'scheduledAt','region',cy->'region','configuration',(cy->'configuration')-'candidateUniverse')),'UTF8')),'hex'),ct) ON CONFLICT DO NOTHING;
   IF EXISTS(SELECT 1 FROM cp09.jobs WHERE job_id=jid AND config_id<>key) THEN RAISE EXCEPTION 'publisher-config-cycle-conflict';END IF;
   result:=result||jsonb_build_array(jid);
  END LOOP;RETURN result;
 END IF;
 IF op='pending' THEN RETURN (SELECT coalesce(jsonb_agg(x.job_id ORDER BY x.cycle_at),'[]'::jsonb) FROM (SELECT job_id,cycle_at FROM cp09.jobs WHERE config_id=key AND terminal_at IS NULL ORDER BY cycle_at LIMIT 12) x);END IF;
 SELECT * INTO j FROM cp09.jobs WHERE job_id=key FOR UPDATE;IF NOT FOUND THEN RAISE EXCEPTION 'publisher-unknown-job';END IF;
 SELECT * INTO c FROM cp09.configurations WHERE id=j.config_id FOR UPDATE;cfg:=c.record_text::jsonb;actual:=clock_timestamp();
 SELECT * INTO f FROM cp09.freezes WHERE job_id=key;SELECT * INTO s FROM cp09.submissions WHERE job_id=key;SELECT * INTO d FROM cp09.completions WHERE job_id=key;
 IF op='inspect' THEN RETURN jsonb_build_object('job',to_jsonb(j)-'capability','configuration',c.record_text,'freezeText',f.record_text,'freezeDigest',f.digest,'submissionText',s.record_text,'submissionDigest',s.digest,'completion',CASE WHEN d.job_id IS NULL THEN NULL ELSE to_jsonb(d) END);END IF;
 IF j.terminal_at IS NOT NULL THEN RETURN jsonb_build_object('status','TERMINAL','completion',CASE WHEN d.job_id IS NULL THEN NULL ELSE to_jsonb(d) END,'state',j.state);END IF;
 IF EXISTS(SELECT 1 FROM cp09.disables WHERE config_id=j.config_id) THEN UPDATE cp09.jobs SET state='disabled',terminal_at=actual,capability=NULL,lease_until=NULL WHERE job_id=key;RETURN jsonb_build_object('status','DISABLED');END IF;
 IF op='claim' THEN
  IF cap IS NULL THEN RAISE EXCEPTION 'publisher-capability-required';END IF;
  IF j.capability IS NOT NULL AND j.lease_until>actual THEN
   IF j.capability<>cap THEN RETURN jsonb_build_object('status','HELD');END IF;
   SELECT * INTO a FROM cp09.attempts WHERE job_id=key AND fence=j.fence;
  ELSE
   IF j.fence>=(cfg->'settings'->>'maxAttempts')::int THEN UPDATE cp09.jobs SET state='failed',terminal_at=actual,capability=NULL,lease_until=NULL WHERE job_id=key;RETURN jsonb_build_object('status','RETRY_EXHAUSTED');END IF;
   IF (SELECT count(*) FROM cp09.jobs WHERE config_id=j.config_id AND terminal_at IS NULL AND lease_until>actual)>=(cfg->'settings'->>'maxConcurrent')::int THEN RETURN jsonb_build_object('status','CONCURRENCY_BOUND');END IF;
   j.fence:=j.fence+1;j.capability:=cap;j.started_at:=actual;j.lease_until:=actual+((cfg->'settings'->>'leaseMs')::int*interval '1 millisecond');
   INSERT INTO cp09.attempts VALUES('pat1-'||encode(sha256(convert_to(key||chr(10)||j.fence::text,'UTF8')),'hex'),key,j.fence,cap,actual,j.lease_until) RETURNING * INTO a;
   UPDATE cp09.jobs SET state='owned',fence=j.fence,capability=cap,started_at=actual,lease_until=j.lease_until WHERE job_id=key;
  END IF;
  RETURN jsonb_build_object('status','OWNED','fence',j.fence,'attemptId',a.attempt_id,'startedAt',a.started_at,'leaseUntil',a.lease_until,'late',actual>j.cycle_at+((cfg->'settings'->>'deadlineMs')::bigint*interval '1 millisecond'));
 END IF;
 IF cap IS NULL OR j.capability IS DISTINCT FROM cap OR j.lease_until<=actual THEN RAISE EXCEPTION 'publisher-not-owned';END IF;
 SELECT * INTO a FROM cp09.attempts WHERE job_id=key AND fence=j.fence;
 IF op='release' THEN UPDATE cp09.jobs SET capability=NULL,lease_until=NULL,state='pending' WHERE job_id=key;RETURN jsonb_build_object('status','RELEASED');END IF;
 p:=payload::jsonb;
 IF (p->>'fence')::int IS DISTINCT FROM j.fence THEN RAISE EXCEPTION 'publisher-stale-fence';END IF;
 IF op='freeze' THEN
  IF f.job_id IS NOT NULL THEN IF f.record_text IS DISTINCT FROM p->>'recordText' THEN RAISE EXCEPTION 'publisher-freeze-conflict';END IF;
  ELSE
   v:=(p->>'recordText')::jsonb;
   IF v->'input'->'context' IS DISTINCT FROM cfg->'context' OR v->'input'->'candidates' IS DISTINCT FROM cfg->'candidates' OR v->'input'->'cycle'->>'scheduledAt' IS DISTINCT FROM to_char(j.cycle_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') OR v->'input'->'cycle'->'configuration' IS DISTINCT FROM cfg->'cycleConfiguration' OR v->>'cycleId' IS DISTINCT FROM j.cycle_id OR v->'input'->'cycle'->'region' IS DISTINCT FROM cfg->'context'->'region' OR (v->>'constructedAt')::timestamptz>actual OR (v->>'constructedAt')::timestamptz<j.cycle_at THEN RAISE EXCEPTION 'publisher-freeze-binding';END IF;
   INSERT INTO cp09.freezes VALUES(key,p->>'recordText',encode(sha256(convert_to(p->>'recordText','UTF8')),'hex'),(v->>'constructedAt')::timestamptz,a.attempt_id);
  END IF;RETURN jsonb_build_object('status','FROZEN');
 ELSIF op='prepare' THEN
  v:=(p->>'recordText')::jsonb;
  IF v->>'contextKey' IS DISTINCT FROM j.context_key OR v->'context' IS DISTINCT FROM cfg->'context' OR v->'cycle'->>'scheduledAt' IS DISTINCT FROM to_char(j.cycle_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') OR v->'cycle'->'configuration' IS DISTINCT FROM cfg->'cycleConfiguration' OR v->>'action' IS DISTINCT FROM 'ORIGINAL' OR v->>'revision' IS DISTINCT FROM '1' OR v->>'parentId' IS NOT NULL OR v->>'lifecycle' NOT IN ('completed','failed','delayed') THEN RAISE EXCEPTION 'publisher-submission-binding';END IF;
  IF v->>'lifecycle'='completed' AND (f.job_id IS NULL OR v->'producerBundle'->'candidates' IS DISTINCT FROM cfg->'candidates' OR v->'producerBundle'->'evidenceFreeze' IS DISTINCT FROM f.record_text::jsonb->'input'->'evidenceFreeze') THEN RAISE EXCEPTION 'publisher-submission-freeze';END IF;
  IF s.job_id IS NOT NULL THEN IF s.record_text IS DISTINCT FROM p->>'recordText' THEN RAISE EXCEPTION 'publisher-submission-conflict';END IF;
  ELSE INSERT INTO cp09.submissions(job_id,record_text,digest,attempt_id) VALUES(key,p->>'recordText',encode(sha256(convert_to(p->>'recordText','UTF8')),'hex'),a.attempt_id);END IF;RETURN jsonb_build_object('status','PREPARED');
 ELSIF op='finalize' THEN
  PERFORM 1 FROM cp08.contexts WHERE context_key=j.context_key FOR UPDATE;actual:=clock_timestamp();
  IF j.capability IS DISTINCT FROM cap OR j.lease_until<=actual THEN RAISE EXCEPTION 'publisher-not-owned';END IF;
  IF s.job_id IS NULL THEN RAISE EXCEPTION 'publisher-no-persisted-submission';END IF;
  IF s.record_text::jsonb->>'lifecycle'='completed' AND actual>j.cycle_at+((cfg->'settings'->>'deadlineMs')::bigint*interval '1 millisecond') THEN RAISE EXCEPTION 'publisher-deadline-expired';END IF;
  v:=cp08.submit_internal(s.record_text);
  IF v->>'recordText' IS DISTINCT FROM s.record_text THEN RAISE EXCEPTION 'publisher-final-readback';END IF;
  INSERT INTO cp09.completions VALUES(key,s.record_text::jsonb->>'versionId',s.digest,a.attempt_id,actual);
  UPDATE cp09.jobs SET state=s.record_text::jsonb->>'lifecycle',terminal_at=actual,capability=NULL,lease_until=NULL WHERE job_id=key;
  RETURN jsonb_build_object('status','COMMITTED','recordText',s.record_text,'digest',s.digest);
 ELSE RAISE EXCEPTION 'publisher-operation';END IF;
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA cp09 FROM PUBLIC,pelora_cp02_worker;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA cp09 FROM PUBLIC,pelora_cp02_worker;
REVOKE ALL ON FUNCTION cp08.submit(text) FROM PUBLIC,pelora_cp02_worker;
GRANT EXECUTE ON FUNCTION cp08.submit(text) TO pelora_cp02_worker;
GRANT USAGE ON SCHEMA cp09 TO pelora_cp02_worker;
GRANT EXECUTE ON FUNCTION cp09.worker(text,text,uuid,text) TO pelora_cp02_worker;
COMMIT;
