-- ISOLATED LOCAL ONLY. No deployment/production receipt schema is applied.
BEGIN;
SET LOCAL ROLE pelora_cp02_owner;
CREATE SCHEMA cp06 AUTHORIZATION pelora_cp02_owner;
REVOKE ALL ON SCHEMA cp06 FROM PUBLIC,pelora_cp02_worker;
CREATE TABLE cp06.policy (id boolean PRIMARY KEY CHECK(id), policy jsonb NOT NULL, normalization_reference jsonb NOT NULL, normalization_text text NOT NULL);
CREATE TABLE cp06.envelopes (evidence_id text PRIMARY KEY REFERENCES cp03.evidence, envelope_text text NOT NULL);
CREATE TABLE cp06.links (job_id text PRIMARY KEY REFERENCES cp02.accepted,token uuid NOT NULL REFERENCES cp02.results,linkage jsonb NOT NULL,evidence_id text NOT NULL REFERENCES cp06.envelopes);
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp06.policy FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp06.envelopes FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp06.links FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE FUNCTION cp06.lookup(jid text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE l cp06.links; e cp06.envelopes; v jsonb; o cp02.ownership;
BEGIN
 SELECT * INTO l FROM cp06.links WHERE job_id=jid; IF NOT FOUND THEN RETURN NULL; END IF;
 SELECT * INTO e FROM cp06.envelopes WHERE evidence_id=l.evidence_id;
 v:=cp03.lookup(jid); SELECT * INTO o FROM cp02.ownership WHERE job_id=jid;
 IF v IS NULL OR l.linkage IS DISTINCT FROM v->'index' OR l.token::text IS DISTINCT FROM v->'accepted'->>'token'
 OR o.token IS DISTINCT FROM l.token OR o.consumed_at IS NULL OR NOT o.released
 OR e.envelope_text::jsonb->'record'->'evidenceReference' IS DISTINCT FROM v->'evidenceReference'
 OR e.envelope_text::jsonb->>'captureText' IS DISTINCT FROM v->>'captureText'
 THEN RAISE EXCEPTION 'receipt-linkage-integrity'; END IF;
 RETURN jsonb_build_object('linkage',l.linkage,'envelopeText',e.envelope_text);
END $$;
CREATE FUNCTION cp06.worker(jid text,cap uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE d cp02.accepted; o cp02.ownership; c cp03.evidence; v jsonb; cfg cp06.policy; source jsonb; sr jsonb;
 polref jsonb; target jsonb; ar jsonb; record jsonb; env jsonb; txt text; received text; existing jsonb;
BEGIN
 IF current_setting('pelora.cp06_local',true) IS DISTINCT FROM 'on' OR current_database()<>'pelora_phase3_qualification'
 OR current_setting('listen_addresses')<>'127.0.0.1' OR inet_server_port()<>55432 THEN RAISE EXCEPTION 'receipt-local-opt-in-required'; END IF;
 -- A committed terminal chain is the ONLY admission. No claim or acceptance writes.
 SELECT * INTO d FROM cp02.accepted WHERE job_id=jid;
 SELECT * INTO o FROM cp02.ownership WHERE job_id=jid;
 IF d.job_id IS NULL OR d.token IS DISTINCT FROM cap OR o.token IS DISTINCT FROM cap OR o.consumed_at IS DISTINCT FROM d.accepted_at OR NOT o.released
 THEN RAISE EXCEPTION 'receipt-accepted-attempt-required'; END IF;
 v:=cp03.lookup(jid);
 IF v->'index' IS NULL OR v->'binding'->>'token' IS DISTINCT FROM cap::text
 OR v->'binding'->>'record_hash' IS DISTINCT FROM encode(sha256(convert_to(v->>'recordText','UTF8')),'hex')
 OR v->>'captureTextHash' IS DISTINCT FROM encode(sha256(convert_to(v->>'captureText','UTF8')),'hex')
 OR v->>'rawHash' IS DISTINCT FROM encode(sha256(decode(v->>'rawHex','hex')),'hex')
 OR v->'index'->'evidence_reference' IS DISTINCT FROM v->'evidenceReference'
 OR v->'index'->>'binding_digest' IS DISTINCT FROM v->'binding'->>'binding_digest'
 THEN RAISE EXCEPTION 'receipt-chain-integrity'; END IF;
 SELECT * INTO c FROM cp03.evidence WHERE evidence_id=v->'binding'->>'evidence_id' FOR UPDATE;
 existing:=cp06.lookup(jid); IF existing IS NOT NULL THEN RETURN existing; END IF;
 SELECT envelope_text INTO txt FROM cp06.envelopes WHERE evidence_id=c.evidence_id;
 IF txt IS NULL THEN
  SELECT * INTO cfg FROM cp06.policy WHERE id; IF NOT FOUND THEN RAISE EXCEPTION 'receipt-policy-missing'; END IF;
  SELECT jsonb_build_object('provider',s->'point'->'source'->'provider','dataset',s->'point'->'source'->'dataset','classification',s->'point'->'source'->'classification') INTO source
   FROM jsonb_array_elements(c.capture_text::jsonb->'samples') s WHERE s->>'role'='center' AND s->>'outcome'='FULFILLED';
  sr:=jsonb_build_object('kind','captured','referenceId','recorded-current-source-'||encode(sha256(convert_to(cp03.canonical(source),'UTF8')),'hex'),
   'contractVersion','pelora-recorded-current-source-metadata-v1','sha256',encode(sha256(convert_to(cp03.canonical(source),'UTF8')),'hex'));
  IF sr IS DISTINCT FROM c.capture_text::jsonb->'sourceAuthority'->'reference' OR c.capture_text::jsonb->'lineageReferences' IS DISTINCT FROM jsonb_build_array(cfg.normalization_reference)
  THEN RAISE EXCEPTION 'receipt-source-closure'; END IF;
  received:=to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
  polref:=jsonb_build_object('kind','captured','contractVersion','pelora-receipt-writer-v1','referenceId','pelora-receipt-writer-v1','sha256',encode(sha256(convert_to(cp03.canonical(cfg.policy),'UTF8')),'hex'));
  target:=jsonb_build_object('contractVersion','pelora-historical-receipt-witness-v1','evidenceReference',c.reference,'receivedAt',received,'issuerPolicyReference',polref);
  ar:=jsonb_build_object('kind','captured','contractVersion','pelora-historical-receipt-witness-v1','referenceId','receipt-'||encode(sha256(convert_to(cp03.canonical(target),'UTF8')),'hex'),'sha256',encode(sha256(convert_to(cp03.canonical(target),'UTF8')),'hex'));
  record:=jsonb_build_object('contractVersion','pelora-historical-availability-reference-v1','evidenceReference',c.reference,'receivedAt',received,'authorityReference',ar);
  env:=jsonb_build_object('record',record,'captureText',c.capture_text,'dependencies',jsonb_build_array(jsonb_build_object('reference',cfg.normalization_reference,'text',cfg.normalization_text),jsonb_build_object('reference',sr,'text',cp03.canonical(source))),'authorityTarget',target,'issuerPolicy',cfg.policy);
  txt:=cp03.canonical(env); INSERT INTO cp06.envelopes VALUES(c.evidence_id,txt);
 END IF;
 INSERT INTO cp06.links VALUES(jid,cap,v->'index',c.evidence_id);
 RETURN cp06.lookup(jid);
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA cp06 FROM PUBLIC,pelora_cp02_worker;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA cp06 FROM PUBLIC,pelora_cp02_worker;
GRANT USAGE ON SCHEMA cp06 TO pelora_cp02_worker;
GRANT EXECUTE ON FUNCTION cp06.worker(text,uuid),cp06.lookup(text) TO pelora_cp02_worker;
COMMIT;
