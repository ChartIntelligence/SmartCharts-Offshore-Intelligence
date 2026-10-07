-- pelora-captain-entitlement-v1. Candidate only; deployed catalog reconciliation required.
BEGIN;
-- Refuse missing baseline or unexpected permissive policy surface.
DO $$
DECLARE t text; n integer;
BEGIN
  IF to_regclass('public.captain_access') IS NULL OR to_regclass('auth.users') IS NULL THEN RAISE EXCEPTION 'access-baseline-required'; END IF;
  IF EXISTS(SELECT 1 FROM pg_catalog.pg_trigger WHERE tgrelid='public.captain_access'::regclass AND NOT tgisinternal) THEN RAISE EXCEPTION 'legacy-trigger-reconciliation-required'; END IF;
  IF EXISTS(SELECT 1 FROM public.captain_access WHERE access_role NOT IN ('founder','founding_captain') OR access_status NOT IN ('approved','pending','revoked')) THEN RAISE EXCEPTION 'unsupported-legacy-access'; END IF;
  FOREACH t IN ARRAY ARRAY['captain_access','fishing_day_reports','ocean_snapshots','governed_opportunity_history','governed_opportunity_observation'] LOOP
    IF to_regclass('public.'||t) IS NULL THEN RAISE EXCEPTION 'owner-table-baseline-required: %',t; END IF;
    IF EXISTS(SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_roles r ON r.oid=c.relowner WHERE c.oid=to_regclass('public.'||t) AND (NOT c.relrowsecurity OR r.rolname IN ('anon','authenticated'))) THEN RAISE EXCEPTION 'protected-owner-rls-required: %',t; END IF;
    SELECT count(*) INTO n FROM pg_catalog.pg_policy p WHERE p.polrelid=to_regclass('public.'||t);
    IF n<>(CASE WHEN t='fishing_day_reports' THEN 4 WHEN t='captain_access' THEN 1 ELSE 2 END) THEN RAISE EXCEPTION 'policy-catalog-reconciliation-required: %',t; END IF;
    IF EXISTS(SELECT 1 FROM pg_catalog.pg_policy p WHERE p.polrelid=to_regclass('public.'||t) AND (NOT p.polpermissive OR p.polroles<>ARRAY[(SELECT oid FROM pg_catalog.pg_roles WHERE rolname='authenticated')])) THEN RAISE EXCEPTION 'unexpected-policy-roles: %',t; END IF;
  END LOOP;
END $$;
CREATE SCHEMA pelora_access;
REVOKE ALL ON SCHEMA pelora_access FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA pelora_access TO authenticated;
ALTER TABLE public.captain_access DROP CONSTRAINT captain_access_access_role_check;
ALTER TABLE public.captain_access ALTER COLUMN access_role DROP DEFAULT;
ALTER TABLE public.captain_access ADD CONSTRAINT captain_access_access_role_check CHECK(access_role IN ('founder','founding_captain','beta_captain'));
ALTER TABLE public.captain_access
 ADD COLUMN entitlement_type text,
 ADD COLUMN activated_at timestamptz,
 ADD COLUMN starts_at timestamptz,
 ADD COLUMN expires_at timestamptz,
 ADD COLUMN start_policy_version text,
 ADD COLUMN approved_at timestamptz,
 ADD COLUMN approved_by uuid REFERENCES auth.users(id),
 ADD COLUMN revoked_at timestamptz,
 ADD COLUMN revoked_by uuid REFERENCES auth.users(id),
 ADD COLUMN revision bigint NOT NULL DEFAULT 0 CHECK(revision>=0),
 ADD COLUMN paid_grant_reference text;
UPDATE public.captain_access SET entitlement_type=CASE access_role WHEN 'founder' THEN 'founder_lifetime' ELSE 'founding_lifetime' END;
ALTER TABLE public.captain_access ALTER COLUMN entitlement_type SET NOT NULL;
CREATE FUNCTION pelora_access.anniversary(t timestamptz) RETURNS timestamptz LANGUAGE sql IMMUTABLE STRICT SET search_path=pg_catalog AS $$ SELECT ((t AT TIME ZONE 'UTC')+interval '1 year') AT TIME ZONE 'UTC' $$;
ALTER TABLE public.captain_access ADD CONSTRAINT captain_entitlement_v1 CHECK (
 (access_role='founder' AND entitlement_type='founder_lifetime' OR access_role='founding_captain' AND entitlement_type='founding_lifetime') AND activated_at IS NULL AND starts_at IS NULL AND expires_at IS NULL AND start_policy_version IS NULL AND paid_grant_reference IS NULL
 OR access_role='beta_captain' AND entitlement_type IN ('beta_trial','paid_subscription') AND (
   activated_at IS NULL AND starts_at IS NULL AND expires_at IS NULL AND start_policy_version IS NULL AND entitlement_type='beta_trial' AND paid_grant_reference IS NULL
   OR activated_at IS NOT NULL AND isfinite(activated_at) AND starts_at=activated_at AND starts_at IS NOT NULL AND expires_at IS NOT NULL AND isfinite(expires_at) AND expires_at=pelora_access.anniversary(activated_at) AND start_policy_version IS NOT NULL AND start_policy_version='first-redemption-utc-calendar-year-v1' AND (entitlement_type='beta_trial' AND paid_grant_reference IS NULL OR entitlement_type='paid_subscription' AND paid_grant_reference IS NOT NULL AND length(paid_grant_reference)>0)
 ));
CREATE TABLE pelora_access.invitations(
 invitation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), recipient_email text NOT NULL CHECK(recipient_email=lower(btrim(recipient_email)) AND recipient_email ~ '^[^[:space:]@]+@[^[:space:]@]+$'),
 invited_by uuid NOT NULL REFERENCES auth.users(id), created_at timestamptz NOT NULL, expires_at timestamptz NOT NULL CHECK(expires_at>created_at),
 state text NOT NULL CHECK(state IN ('approved','redeemed')), redeemed_user_id uuid REFERENCES auth.users(id), redeemed_at timestamptz,
 request_id uuid NOT NULL, UNIQUE(invited_by,request_id), CHECK((state='approved' AND redeemed_user_id IS NULL AND redeemed_at IS NULL) OR (state='redeemed' AND redeemed_user_id IS NOT NULL AND redeemed_at IS NOT NULL))
);
CREATE TABLE pelora_access.events(
 event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid REFERENCES auth.users(id), target_id uuid REFERENCES auth.users(id), invitation_id uuid REFERENCES pelora_access.invitations(invitation_id),
 action text NOT NULL CHECK(action IN ('migrate','invite','resend','approve','revoke','restore','redeem')),
 occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(), request_id uuid NOT NULL,
 previous_revision bigint, new_revision bigint, request_args jsonb NOT NULL, result jsonb NOT NULL,
 UNIQUE(actor_id,request_id)
);
ALTER TABLE pelora_access.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelora_access.events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA pelora_access FROM PUBLIC, anon, authenticated;
INSERT INTO pelora_access.events(target_id,action,request_id,new_revision,request_args,result)
 SELECT user_id,'migrate',gen_random_uuid(),0,'{}',jsonb_build_object('entitlement_type',entitlement_type,'access_status',access_status) FROM public.captain_access;
CREATE FUNCTION pelora_access.immutable_event() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN RAISE EXCEPTION 'access-event-immutable'; END $$;
CREATE TRIGGER access_event_immutable BEFORE UPDATE OR DELETE ON pelora_access.events FOR EACH ROW EXECUTE FUNCTION pelora_access.immutable_event();
CREATE FUNCTION pelora_access.preserve_grant() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 IF NEW.user_id<>OLD.user_id OR NEW.access_role<>OLD.access_role OR (OLD.access_role IN ('founder','founding_captain') AND NEW.entitlement_type<>OLD.entitlement_type) OR (OLD.activated_at IS NOT NULL AND (NEW.activated_at IS DISTINCT FROM OLD.activated_at OR NEW.starts_at IS DISTINCT FROM OLD.starts_at OR NEW.expires_at IS DISTINCT FROM OLD.expires_at OR NEW.start_policy_version IS DISTINCT FROM OLD.start_policy_version)) THEN RAISE EXCEPTION 'original-entitlement-immutable'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER preserve_original_entitlement BEFORE UPDATE ON public.captain_access FOR EACH ROW EXECUTE FUNCTION pelora_access.preserve_grant();
CREATE FUNCTION pelora_access.owner_is_authenticated(target uuid) RETURNS boolean LANGUAGE sql STABLE SET search_path=pg_catalog AS $$ SELECT coalesce(auth.uid()=target AND (auth.jwt()->>'is_anonymous')='false',false) $$;
CREATE FUNCTION pelora_access.has_current_access() RETURNS boolean LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT coalesce((SELECT a.access_status='approved' AND (a.entitlement_type IN ('founder_lifetime','founding_lifetime') OR a.entitlement_type='beta_trial' AND a.activated_at IS NOT NULL AND a.starts_at<=clock_timestamp() AND clock_timestamp()<a.expires_at AND a.start_policy_version='first-redemption-utc-calendar-year-v1') FROM public.captain_access a WHERE a.user_id=auth.uid() AND pelora_access.owner_is_authenticated(a.user_id)),false)
$$;
CREATE FUNCTION pelora_access.actor() RETURNS uuid LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN IF NOT pelora_access.owner_is_authenticated(auth.uid()) THEN RAISE EXCEPTION 'authenticated-nonanonymous-required'; END IF; RETURN auth.uid(); END $$;
CREATE FUNCTION pelora_access.require_founder() RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE actor uuid:=pelora_access.actor(); BEGIN PERFORM 1 FROM public.captain_access WHERE user_id=actor AND access_role='founder' AND entitlement_type='founder_lifetime' AND access_status='approved' FOR SHARE; IF NOT FOUND THEN RAISE EXCEPTION 'founder-required'; END IF; RETURN actor; END $$;
CREATE FUNCTION pelora_access.replay(actor uuid,key uuid,args jsonb) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE e pelora_access.events; BEGIN IF key IS NULL THEN RAISE EXCEPTION 'request-id-required'; END IF; PERFORM pg_advisory_xact_lock(hashtextextended(actor::text||key::text,0)); SELECT * INTO e FROM pelora_access.events WHERE actor_id=actor AND request_id=key; IF FOUND THEN IF e.request_args<>args THEN RAISE EXCEPTION 'idempotency-conflict'; END IF; RETURN e.result; END IF; RETURN NULL; END $$;
CREATE FUNCTION pelora_access.invite_beta(email text,key uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE actor uuid:=pelora_access.require_founder(); recipient text:=lower(btrim(email)); args jsonb:=jsonb_build_object('action','invite','email',recipient); result jsonb; i pelora_access.invitations; t timestamptz:=clock_timestamp(); BEGIN
 result:=pelora_access.replay(actor,key,args); IF result IS NOT NULL THEN RETURN result; END IF;
 INSERT INTO pelora_access.invitations(recipient_email,invited_by,created_at,expires_at,state,request_id) VALUES(recipient,actor,t,((t AT TIME ZONE 'UTC')+interval '7 days') AT TIME ZONE 'UTC','approved',key) RETURNING * INTO i;
 result:=jsonb_build_object('invitation_id',i.invitation_id,'expires_at',i.expires_at);
 INSERT INTO pelora_access.events(actor_id,invitation_id,action,request_id,request_args,result) VALUES(actor,i.invitation_id,'invite',key,args,result); RETURN result;
END $$;
CREATE FUNCTION pelora_access.resend_beta(id uuid,key uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE actor uuid:=pelora_access.require_founder(); args jsonb:=jsonb_build_object('action','resend','invitation_id',id); result jsonb; i pelora_access.invitations; BEGIN
 result:=pelora_access.replay(actor,key,args); IF result IS NOT NULL THEN RETURN result; END IF;
 SELECT * INTO STRICT i FROM pelora_access.invitations WHERE invitation_id=id FOR UPDATE;
 IF i.state<>'approved' THEN RAISE EXCEPTION 'invitation-already-redeemed'; END IF;
 -- Resend is an audited delivery request, not a renewal of the seven-day window.
 result:=jsonb_build_object('invitation_id',i.invitation_id,'expires_at',i.expires_at);
 INSERT INTO pelora_access.events(actor_id,invitation_id,action,request_id,request_args,result) VALUES(actor,id,'resend',key,args,result); RETURN result;
END $$;
CREATE FUNCTION pelora_access.manage_beta(target uuid,operation text,key uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE actor uuid:=pelora_access.require_founder(); args jsonb:=jsonb_build_object('action',operation,'target',target); result jsonb; a public.captain_access; old_revision bigint; t timestamptz:=clock_timestamp(); BEGIN
 IF operation NOT IN ('approve','revoke','restore') OR operation IS NULL THEN RAISE EXCEPTION 'unsupported-beta-operation'; END IF;
 result:=pelora_access.replay(actor,key,args); IF result IS NOT NULL THEN RETURN result; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(target::text,1)); SELECT * INTO STRICT a FROM public.captain_access WHERE user_id=target FOR UPDATE;
 IF a.access_role<>'beta_captain' OR a.entitlement_type<>'beta_trial' THEN RAISE EXCEPTION 'beta-only-operation'; END IF;
 old_revision:=a.revision;
 UPDATE public.captain_access SET access_status=CASE WHEN operation='revoke' THEN 'revoked' ELSE 'approved' END,
 approved_at=CASE WHEN operation IN ('approve','restore') THEN t ELSE approved_at END, approved_by=CASE WHEN operation IN ('approve','restore') THEN actor ELSE approved_by END,
 revoked_at=CASE WHEN operation='revoke' THEN t ELSE revoked_at END,revoked_by=CASE WHEN operation='revoke' THEN actor ELSE revoked_by END,updated_at=t,revision=revision+1 WHERE user_id=target RETURNING * INTO a;
 result:=jsonb_build_object('user_id',target,'revision',a.revision,'access_status',a.access_status);
 INSERT INTO pelora_access.events(actor_id,target_id,action,request_id,previous_revision,new_revision,request_args,result) VALUES(actor,target,operation,key,old_revision,a.revision,args,result); RETURN result;
END $$;
CREATE FUNCTION pelora_access.redeem_beta(id uuid,key uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE actor uuid:=pelora_access.actor(); args jsonb:=jsonb_build_object('action','redeem','invitation_id',id); result jsonb; recipient text; i pelora_access.invitations; a public.captain_access; old_revision bigint; t timestamptz; BEGIN
 result:=pelora_access.replay(actor,key,args); IF result IS NOT NULL THEN RETURN result; END IF;
 SELECT lower(btrim(email)) INTO recipient FROM auth.users WHERE auth.users.id=actor AND email_confirmed_at IS NOT NULL;
 IF recipient IS NULL THEN RAISE EXCEPTION 'verified-recipient-required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(recipient,2));
 IF EXISTS(SELECT 1 FROM pelora_access.invitations WHERE recipient_email=recipient AND state='redeemed' AND redeemed_user_id<>actor) THEN RAISE EXCEPTION 'recipient-already-bound'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(actor::text,1)); SELECT * INTO STRICT i FROM pelora_access.invitations WHERE invitation_id=id FOR UPDATE; t:=clock_timestamp();
 IF i.recipient_email<>recipient THEN RAISE EXCEPTION 'recipient-mismatch'; END IF;
 IF i.state='redeemed' THEN IF i.redeemed_user_id<>actor THEN RAISE EXCEPTION 'recipient-mismatch'; END IF; ELSE IF t>=i.expires_at THEN RAISE EXCEPTION 'invitation-expired'; END IF; END IF;
 SELECT * INTO a FROM public.captain_access WHERE user_id=actor FOR UPDATE;
 IF FOUND THEN
  IF a.access_role<>'beta_captain' OR a.entitlement_type<>'beta_trial' THEN RAISE EXCEPTION 'existing-nonbeta-entitlement'; END IF;
  IF a.access_status='revoked' THEN RAISE EXCEPTION 'beta-revoked'; END IF;
 ELSE
  INSERT INTO public.captain_access(user_id,access_role,access_status,entitlement_type,approved_at,approved_by) VALUES(actor,'beta_captain','approved','beta_trial',t,i.invited_by) RETURNING * INTO a;
 END IF;
 old_revision:=a.revision;
 IF a.activated_at IS NULL THEN
  UPDATE public.captain_access SET access_status='approved',approved_at=coalesce(approved_at,t),approved_by=coalesce(approved_by,i.invited_by),activated_at=t,starts_at=t,expires_at=pelora_access.anniversary(t),start_policy_version='first-redemption-utc-calendar-year-v1',revision=revision+1,updated_at=t WHERE user_id=actor RETURNING * INTO a;
 END IF;
 IF i.state='approved' THEN UPDATE pelora_access.invitations SET state='redeemed',redeemed_user_id=actor,redeemed_at=t WHERE invitation_id=id; END IF;
 result:=jsonb_build_object('user_id',actor,'revision',a.revision,'activated_at',a.activated_at,'expires_at',a.expires_at);
 INSERT INTO pelora_access.events(actor_id,target_id,invitation_id,action,request_id,previous_revision,new_revision,request_args,result) VALUES(actor,actor,id,'redeem',key,old_revision,a.revision,args,result); RETURN result;
END $$;
-- Rebuild only the reviewed owner policies; unknown counts/roles fail before mutation.
DROP POLICY "captains can read own access" ON public.captain_access;
CREATE POLICY "captains can read own access" ON public.captain_access FOR SELECT TO authenticated USING(pelora_access.owner_is_authenticated(user_id));
DROP POLICY "Captains can create their own reports" ON public.fishing_day_reports;
DROP POLICY "Captains can read their own reports" ON public.fishing_day_reports;
DROP POLICY "Captains can update their own reports" ON public.fishing_day_reports;
DROP POLICY "Captains can delete their own reports" ON public.fishing_day_reports;
CREATE POLICY "Captains can read their own reports" ON public.fishing_day_reports FOR SELECT TO authenticated USING(pelora_access.owner_is_authenticated(user_id));
CREATE POLICY "Captains can create their own reports" ON public.fishing_day_reports FOR INSERT TO authenticated WITH CHECK(pelora_access.owner_is_authenticated(user_id) AND pelora_access.has_current_access());
CREATE POLICY "Captains can update their own reports" ON public.fishing_day_reports FOR UPDATE TO authenticated USING(pelora_access.owner_is_authenticated(user_id) AND pelora_access.has_current_access()) WITH CHECK(pelora_access.owner_is_authenticated(user_id) AND pelora_access.has_current_access());
CREATE POLICY "Captains can delete their own reports" ON public.fishing_day_reports FOR DELETE TO authenticated USING(pelora_access.owner_is_authenticated(user_id) AND pelora_access.has_current_access());
DO $$
DECLARE t text; prefix text;
BEGIN
 FOREACH t IN ARRAY ARRAY['ocean_snapshots','governed_opportunity_history','governed_opportunity_observation'] LOOP
  prefix:=CASE t WHEN 'ocean_snapshots' THEN 'ocean snapshots' WHEN 'governed_opportunity_history' THEN 'governed opportunity history' ELSE 'governed opportunity observations' END;
  EXECUTE format('DROP POLICY %I ON public.%I','Captains can read private '||prefix,t);
  EXECUTE format('DROP POLICY %I ON public.%I','Captains can create private '||prefix,t);
  EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING(pelora_access.owner_is_authenticated(user_id))','Captains can read private '||prefix,t);
  EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK(pelora_access.owner_is_authenticated(user_id) AND pelora_access.has_current_access())','Captains can create private '||prefix,t);
 END LOOP;
END $$;
REVOKE ALL ON public.fishing_day_reports,public.ocean_snapshots,public.governed_opportunity_history,public.governed_opportunity_observation FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.fishing_day_reports TO authenticated;
GRANT SELECT,INSERT ON public.ocean_snapshots,public.governed_opportunity_history,public.governed_opportunity_observation TO authenticated;
REVOKE ALL ON public.captain_access FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.captain_access TO authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA pelora_access FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION pelora_access.owner_is_authenticated(uuid),pelora_access.has_current_access(),pelora_access.invite_beta(text,uuid),pelora_access.resend_beta(uuid,uuid),pelora_access.manage_beta(uuid,text,uuid),pelora_access.redeem_beta(uuid,uuid) TO authenticated;
COMMENT ON SCHEMA pelora_access IS 'pelora-captain-entitlement-v1; no email delivery, payment admission or production qualification';
COMMIT;
