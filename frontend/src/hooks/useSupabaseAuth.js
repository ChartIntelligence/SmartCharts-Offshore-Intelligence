import {founderPreviewConfiguration,founderPreviewSession} from '../utils/founderHttpsPreview.js';
import {
  useEffect,
  useState
} from "react";

import { supabase } from "../lib/supabase";


export function useSupabaseAuth() {
  const [session, setSession] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  useEffect(() => {
    const preview=founderPreviewConfiguration();
    let mounted = true;
    let authRevision = 0;


    async function initializeSession() {
      const revision = authRevision;
      setLoading(true);
      setError(null);

      const {
        data: sessionData,
        error: sessionError
      } =
        await supabase.auth
          .getSession();

      if (!mounted || authRevision !== revision) return;


      if (sessionError && !preview) {
        console.error(
          "Unable to read Supabase session:",
          sessionError
        );
      }


      if(preview&&sessionError){setSession(null);setError('Pelora could not verify your preview session.');setLoading(false);return;}
      let nextSession =
        sessionData?.session ??
        null;


      if (!nextSession && !preview) {
        const {
          data: anonymousData,
          error: anonymousError
        } =
          await supabase.auth
            .signInAnonymously();

        if (!mounted || authRevision !== revision) return;


        if (anonymousError) {
          console.error(
            "Unable to create private captain session:",
            anonymousError
          );

          if (mounted) {
            setError(
              anonymousError.message
            );

            setLoading(false);
          }

          return;
        }


        nextSession =
          anonymousData?.session ??
          null;
      }


      if (mounted) {
        const accepted=preview?founderPreviewSession(nextSession,preview):nextSession;
        setSession(accepted);
        if(preview)setError(nextSession&&!accepted?'This preview session could not be verified.':null);
        setLoading(false);
      }
    }


    initializeSession().catch(() => {
      if (mounted && authRevision === 0) {
        setSession(null);
        setError("Pelora could not verify your session.");
        setLoading(false);
      }
    });


    const {
      data: authListener
    } =
      supabase.auth
        .onAuthStateChange(
          (
            _event,
            nextSession
          ) => {
            if (!mounted) {
              return;
            }

            authRevision++;

            const accepted=preview?founderPreviewSession(nextSession,preview):nextSession;
            setSession(accepted);
            if(preview)setError(nextSession&&!accepted?'This preview session could not be verified.':null);

            setLoading(false);
          }
        );


    return () => {
      mounted = false;

      authListener
        .subscription
        .unsubscribe();
    };
  }, []);


  return {
    session,

    user:
      session?.user ??
      null,

    loading,
    error
  };
}
