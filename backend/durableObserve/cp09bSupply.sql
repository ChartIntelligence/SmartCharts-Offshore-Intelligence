BEGIN;
SET LOCAL ROLE pelora_cp02_owner;
CREATE SCHEMA cp09b_supply AUTHORIZATION pelora_cp02_owner;
REVOKE ALL ON SCHEMA cp09b_supply FROM PUBLIC,pelora_cp02_worker;
CREATE TABLE cp09b_supply.artifacts (
 identity text PRIMARY KEY,
 record_text text NOT NULL,
 digest text NOT NULL,
 retained_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK(octet_length(record_text)<=4194304),
 CHECK(digest=encode(sha256(convert_to(record_text,'UTF8')),'hex'))
);
CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON cp09b_supply.artifacts FOR EACH ROW EXECUTE FUNCTION cp02.immutable();
CREATE FUNCTION cp09b_supply.retain(identity_arg text,txt text,digest_arg text) RETURNS jsonb
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE r cp09b_supply.artifacts; p jsonb;
BEGIN
 IF current_database()<>'pelora_phase3_qualification' OR current_setting('listen_addresses')<>'127.0.0.1' OR inet_server_port()<>55432 THEN RAISE EXCEPTION 'supply-local-only'; END IF;
 IF identity_arg IS NULL OR identity_arg !~ '^supply1-[a-f0-9]{64}$' OR txt IS NULL OR octet_length(txt)>4194304 OR digest_arg IS DISTINCT FROM encode(sha256(convert_to(txt,'UTF8')),'hex') THEN RAISE EXCEPTION 'supply-invalid-record';END IF;
 p:=txt::jsonb;
 IF p->>'contractVersion' IS DISTINCT FROM 'pelora-retained-input-record-v1' OR p->>'admission' IS DISTINCT FROM 'NOT_SCIENTIFICALLY_ADMITTED' OR p->>'identity' IS DISTINCT FROM identity_arg THEN RAISE EXCEPTION 'supply-unadmitted-contract';END IF;
 INSERT INTO cp09b_supply.artifacts(identity,record_text,digest) VALUES(identity_arg,txt,digest_arg) ON CONFLICT DO NOTHING;
 SELECT * INTO STRICT r FROM cp09b_supply.artifacts WHERE identity=identity_arg;
 IF r.record_text IS DISTINCT FROM txt OR r.digest IS DISTINCT FROM digest_arg THEN RAISE EXCEPTION 'supply-identity-conflict';END IF;
 RETURN jsonb_build_object('recordText',r.record_text,'digest',r.digest,'retainedAt',r.retained_at);
END $$;
CREATE FUNCTION cp09b_supply.read_exact(identity_arg text) RETURNS jsonb
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF current_database()<>'pelora_phase3_qualification' OR current_setting('listen_addresses')<>'127.0.0.1' OR inet_server_port()<>55432 THEN RAISE EXCEPTION 'supply-local-only'; END IF;
 RETURN (SELECT jsonb_build_object('recordText',record_text,'digest',digest,'retainedAt',retained_at) FROM cp09b_supply.artifacts WHERE identity=identity_arg);
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA cp09b_supply FROM PUBLIC,pelora_cp02_worker;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA cp09b_supply FROM PUBLIC,pelora_cp02_worker;
GRANT USAGE ON SCHEMA cp09b_supply TO pelora_cp02_worker;
GRANT EXECUTE ON FUNCTION cp09b_supply.retain(text,text,text),cp09b_supply.read_exact(text) TO pelora_cp02_worker;
COMMIT;
