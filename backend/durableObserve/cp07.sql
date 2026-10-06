-- Isolated-local read-side migration. No acquisition/acceptance/receipt writes.
BEGIN;
SET LOCAL ROLE pelora_cp02_owner;
CREATE SCHEMA cp07 AUTHORIZATION pelora_cp02_owner;
REVOKE ALL ON SCHEMA cp07 FROM PUBLIC,pelora_cp02_worker;
CREATE FUNCTION cp07.read_scope(md text,ck text,assessment timestamptz,source_from timestamptz,source_until timestamptz,max_rows integer)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE m jsonb; cell jsonb; selected record; chain jsonb; receipt jsonb; rows_value jsonb:='[]'::jsonb; n integer:=0; total_bytes bigint:=0; more boolean:=false;
BEGIN
 IF md IS NULL OR md !~ '^[a-f0-9]{64}$' OR ck IS NULL OR assessment IS NULL OR source_from IS NULL OR source_until IS NULL
 OR source_from>=source_until OR max_rows IS NULL OR max_rows<1 OR max_rows>20 THEN RAISE EXCEPTION 'ocean-state-query-invalid'; END IF;
 SELECT context->'manifest' INTO m FROM cp02.registry WHERE manifest_id=md;
 IF NOT FOUND THEN RETURN NULL; END IF;
 SELECT c INTO cell FROM jsonb_array_elements(m->'sampling'->'cells') c WHERE c->>'key'=ck;
 IF cell IS NULL THEN RAISE EXCEPTION 'ocean-state-cell-not-governed'; END IF;
 -- Source time orders evidence. Neither job window nor receipt/read time refreshes it.
 -- Tie order is explicit deterministic execution order, not revision/science preference.
 FOR selected IN
  SELECT a.job_id FROM cp02.accepted a JOIN cp02.jobs j USING(job_id) JOIN cp02.results r ON r.token=a.token
  WHERE j.manifest_id=md AND j.job->>'cellKey'=ck AND a.accepted_at<=assessment
   AND (r.record_text::jsonb#>>'{execution,acquisition,response,observationTime}')::timestamptz BETWEEN source_from AND assessment
   AND (r.record_text::jsonb#>>'{execution,acquisition,response,observationTime}')::timestamptz<source_until
  ORDER BY (r.record_text::jsonb#>>'{execution,acquisition,response,observationTime}')::timestamptz DESC,
   j.window_start DESC,a.accepted_at DESC,a.job_id COLLATE "C" DESC LIMIT max_rows+1
 LOOP
  n:=n+1; IF n>max_rows THEN more:=true; EXIT; END IF;
  chain:=cp03.lookup(selected.job_id); receipt:=cp06.lookup(selected.job_id);
  IF chain IS NULL OR chain->'index' IS NULL THEN RAISE EXCEPTION 'ocean-state-chain-integrity'; END IF;
  total_bytes:=total_bytes+octet_length(chain::text)+coalesce(octet_length(receipt::text),0);
  IF total_bytes>67108864 THEN RAISE EXCEPTION 'ocean-state-page-capacity'; END IF;
  rows_value:=rows_value||jsonb_build_array(jsonb_build_object('chain',chain,'receipt',receipt));
 END LOOP;
 RETURN jsonb_build_object('manifest',m,'cell',cell,'observations',rows_value,'hasMore',more);
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA cp07 FROM PUBLIC,pelora_cp02_worker;
GRANT USAGE ON SCHEMA cp07 TO pelora_cp02_worker;
GRANT EXECUTE ON FUNCTION cp07.read_scope(text,text,timestamptz,timestamptz,timestamptz,integer) TO pelora_cp02_worker;
COMMIT;
