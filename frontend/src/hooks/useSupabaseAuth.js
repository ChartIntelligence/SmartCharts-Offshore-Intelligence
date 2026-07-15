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
    let mounted = true;


    async function initializeSession() {
      setLoading(true);
      setError(null);

      const {
        data: sessionData,
        error: sessionError
      } =
        await supabase.auth
          .getSession();


      if (sessionError) {
        console.error(
          "Unable to read Supabase session:",
          sessionError
        );
      }


      let nextSession =
        sessionData?.session ??
        null;


      if (!nextSession) {
        const {
          data: anonymousData,
          error: anonymousError
        } =
          await supabase.auth
            .signInAnonymously();


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
        setSession(nextSession);
        setLoading(false);
      }
    }


    initializeSession();


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

            setSession(
              nextSession
            );

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