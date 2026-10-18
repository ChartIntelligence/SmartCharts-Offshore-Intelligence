import {founderPreviewConfiguration,founderPreviewSession,founderPreviewSignInOptions} from '../utils/founderHttpsPreview.js';
import {invalidateStoredSelection} from '../utils/captainContinuity.js';
import {
  useEffect,
  useLayoutEffect,
  useCallback,
  useState,
  useRef
} from "react";

import PeloraStartupFlow from "./PeloraStartupFlow";

import peloraWordmark
  from "../assets/branding/pelora-wordmark-web-cropped.png";

import {
  useSupabaseAuth
} from "../hooks/useSupabaseAuth";

import {
  supabase
} from "../lib/supabase";

import "../styles/dashboard.css";
import {useCaptainAccess} from "../hooks/useCaptainAccess";


function FoundingCaptainAccessGate() {
  const preview=founderPreviewConfiguration();
  const previewEnabled=Boolean(preview);
  const auth=useSupabaseAuth();
  const session=preview?founderPreviewSession(auth.session,preview):auth.session;
  const user=preview?session?.user??null:auth.user;
  const authLoading=auth.loading;
  const [previewEvent,setPreviewEvent]=useState(0);
  const previewEpoch=useRef(0);
  useLayoutEffect(()=>{
    if(!previewEnabled)return;
    let listening=true;
    const {data}=supabase.auth.onAuthStateChange(()=>{
      if(!listening)return;
      previewEpoch.current++;
      setPreviewEvent(previewEpoch.current);
    });
    return()=>{listening=false;data.subscription.unsubscribe();};
  },[previewEnabled]);

  const {principalId, approved, initialLoading, accessError, profileRead} =
    useCaptainAccess({session, authLoading, client:supabase});

  const signOutOwner=!authLoading && approved && typeof principalId==='string' && principalId.trim() &&
    user?.is_anonymous===false && session?.user?.is_anonymous===false &&
    user.id===principalId && session.user.id===principalId ? principalId : null;
  const [actionLifetime,setActionLifetime]=useState(()=>({owner:signOutOwner,generation:0}));
  if(actionLifetime.owner!==signOutOwner)setActionLifetime({owner:signOutOwner,generation:actionLifetime.generation+1});
  const actionGeneration=actionLifetime.generation;
  const actionBinding=useRef({owner:signOutOwner,generation:actionGeneration,pending:false});
  useLayoutEffect(()=>{
    if(actionBinding.current.owner!==signOutOwner || actionBinding.current.generation!==actionGeneration ||
      (previewEnabled&&actionBinding.current.event!==previewEvent))
      actionBinding.current={owner:signOutOwner,generation:actionGeneration,pending:false};
    const frame=actionBinding.current;frame.active=true;frame.event=previewEvent;
    return()=>{frame.active=false;};
  },[signOutOwner,actionGeneration,previewEnabled,previewEvent]);
  const onSignOut=useCallback(async()=>{
    const bound=actionBinding.current;
    if(!signOutOwner)return {ok:false,reason:'NO_AUTHORIZED_OWNER',message:'Sign-out is not available for this session.'};
    if((previewEnabled&&(!bound.active||bound.event!==previewEvent||previewEpoch.current!==previewEvent)) || bound.owner!==signOutOwner || bound.generation!==actionGeneration)return {ok:false,reason:'STALE_OWNER',message:'Your account changed. Please try again.'};
    if(bound.pending)return {ok:false,reason:'IN_PROGRESS',message:'Sign-out is already in progress.'};
    bound.pending=true;
    try{
      const {error}=await supabase.auth.signOut(...(previewEnabled?[{scope:'local'}]:[]));
      if(actionBinding.current!==bound || (previewEnabled&&(!bound.active||previewEpoch.current!==previewEvent)))return {ok:false,reason:'STALE_OWNER',message:'Your account changed. Please try again.'};
      return error?{ok:false,reason:'SIGN_OUT_FAILED',message:'Could not sign out. Please try again.'}:{ok:true,reason:'SIGN_OUT_REQUESTED'};
    }catch{
      return actionBinding.current!==bound || (previewEnabled&&(!bound.active||previewEpoch.current!==previewEvent))?{ok:false,reason:'STALE_OWNER',message:'Your account changed. Please try again.'}:{ok:false,reason:'SIGN_OUT_FAILED',message:'Could not sign out. Please try again.'};
    }finally{if(actionBinding.current===bound&&(!previewEnabled||bound.active))bound.pending=false;}
  },[signOutOwner,actionGeneration,previewEnabled,previewEvent]);

  const lastCaptain = useRef(null);
  useEffect(() => {
    if (authLoading) return;
    const owner = user?.is_anonymous !== true && session?.access_token ? user?.id ?? null : null;
    if (lastCaptain.current && (lastCaptain.current !== owner || (owner && !approved && !initialLoading))) {
      try {invalidateStoredSelection(window.localStorage,lastCaptain.current);} catch { /* Storage may be disabled. */ }
    }
    lastCaptain.current = owner;
  },[user?.id,user?.is_anonymous,authLoading,session?.access_token,approved,initialLoading]);

  const [email, setEmail] =
    useState("");

  const [signInLoading, setSignInLoading] =
    useState(false);

  const [signInMessage, setSignInMessage] =
    useState("");

  const [signInError, setSignInError] =
    useState("");

  const [
    openingComplete,
    setOpeningComplete
  ] = useState(false);


  const isAnonymous =
    user?.is_anonymous === true;


  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setOpeningComplete(true);
        },
        4000
      );


    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, []);


  const previewPrincipal=preview?session?.user?.id??null:null;
  const [previewIntent,setPreviewIntent]=useState(()=>({principal:previewPrincipal,event:previewEvent,generation:0}));
  if(previewIntent.principal!==previewPrincipal||previewIntent.event!==previewEvent){
    setPreviewIntent({principal:previewPrincipal,event:previewEvent,generation:previewIntent.generation+1});
    if(preview){setSignInLoading(false);setSignInMessage('');setSignInError('');setEmail('');}
  }
  const previewGeneration=previewIntent.generation;
  const previewAttempt=useRef(null);
  useLayoutEffect(()=>{
    const frame={principal:previewPrincipal,event:previewEvent,active:true,pending:false};
    previewAttempt.current=frame;
    return()=>{frame.active=false;};
  },[previewPrincipal,previewEvent,previewGeneration]);
  const sendPreviewLink=async()=>{
    const frame=previewAttempt.current;
    if(!frame?.active||frame.pending||frame.principal||frame.event!==previewEpoch.current)return;
    frame.pending=true;setSignInLoading(true);setSignInMessage('');setSignInError('');
    const current=()=>frame.active&&previewAttempt.current===frame&&frame.event===previewEpoch.current;
    try{
      const options=await founderPreviewSignInOptions(email,preview);
      if(!current())return;
      const {error}=await supabase.auth.signInWithOtp(options);
      if(!current())return;
      if(error)setSignInError('Preview sign-in could not be requested.');
      else{setSignInMessage('Sign-in link requested. Delivery and captain access are not yet verified.');setEmail('');}
    }catch{if(current())setSignInError('Preview sign-in could not be requested.');}
    finally{if(current()){frame.pending=false;setSignInLoading(false);}}
  };

  const sendMagicLink = async (
    event
  ) => {
    event.preventDefault();
    if(preview){await sendPreviewLink();return;}

    setSignInLoading(true);
    setSignInMessage("");
    setSignInError("");


    const {
      error
    } =
      await supabase.auth
        .signInWithOtp({
          email,

          options: {
            emailRedirectTo:
              `${window.location.origin}/?app=1`
          }
        });


    if (error) {
      setSignInError(
        error.message
      );
    } else {
      setSignInMessage(
        "Check your email for your secure Pelora sign-in link."
      );

      setEmail("");
    }


    setSignInLoading(false);
  };


  if (
    !openingComplete ||
    authLoading ||
    initialLoading
  ) {
    return (
      <main className="pelora-startup-screen">

        <section className="pelora-startup-splash">

          <img
            src={peloraWordmark}
            alt="Pelora"
            className="pelora-startup-wordmark"
          />

          <div
            className="pelora-startup-horizon"
            aria-hidden="true"
          >
            <span />
          </div>

          <p>
            OCEAN INTELLIGENCE
          </p>

          <p>
            The ocean is talking.
            Pelora helps you listen.
          </p>

        </section>

      </main>
    );
  }


  if (
    user &&
    !isAnonymous &&
    approved
  ) {
    return (
      <PeloraStartupFlow
        key={principalId}
        session={session}
        user={user}
        authLoading={authLoading}
        profileRead={profileRead}
        onSignOut={onSignOut}
      />
    );
  }


  return (
    <main>

      <section>

        <p>
          OCEAN INTELLIGENCE
        </p>

        <h1>
          Pelora
        </h1>

        <p>
          The ocean is talking.
          Pelora helps you listen.
        </p>

        <p>
          Pelora is currently in private
          Founding Captain testing.
        </p>

      </section>


      {user &&
       !isAnonymous &&
       !approved && (

        <section>

          <h2>
            Private Access
          </h2>

          <p>
            This captain account is not
            currently approved for Pelora
            Founding Captain access.
          </p>

          {accessError && (
            <p>
              {accessError}
            </p>
          )}

        </section>
      )}


      {(
        !user ||
        isAnonymous
      ) && (

        <section>

          <h2>
            Founding Captain Sign In
          </h2>

          <p>
            Approved captains can sign in
            with their private Pelora
            account.
          </p>


          <form
            onSubmit={
              sendMagicLink
            }
          >

            <input
              type="email"
              required
              value={email}
              placeholder="Captain email"
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
            />

            <button
              type="submit"
              disabled={
                signInLoading
              }
            >
              {signInLoading
                ? "Sending..."
                : "Email Sign-In Link"}
            </button>

          </form>


          {signInMessage && (
            <p>
              {signInMessage}
            </p>
          )}


          {signInError && (
            <p>
              {signInError}
            </p>
          )}

        </section>
      )}

    </main>
  );
}


export default FoundingCaptainAccessGate;
