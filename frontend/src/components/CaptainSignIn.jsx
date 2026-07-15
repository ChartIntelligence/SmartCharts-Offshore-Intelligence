import {
  useState
} from "react";

import { supabase } from "../lib/supabase";


function CaptainSignIn({
  user
}) {
  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  const sendMagicLink = async (
    event
  ) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const {
      error: signInError
    } =
      await supabase.auth
        .signInWithOtp({
          email,

          options: {
            emailRedirectTo:
              window.location.origin
          }
        });

    if (signInError) {
      setError(
        signInError.message
      );
    } else {
      setMessage(
        "Check your email for the secure Velion sign-in link."
      );

      setEmail("");
    }

    setLoading(false);
  };


  const signOut = async () => {
    setLoading(true);

    const {
      error: signOutError
    } =
      await supabase.auth
        .signOut();

    if (signOutError) {
      setError(
        signOutError.message
      );
    }

    setLoading(false);
  };


  if (user) {
    return (
      <section className="captain-sign-in signed-in">

        <div>
          <strong>
            Private Captain Account
          </strong>

          <p>
            Signed in as {user.email}
          </p>
        </div>

        <button
          type="button"
          onClick={signOut}
          disabled={loading}
        >
          Sign Out
        </button>

      </section>
    );
  }


  return (
    <section className="captain-sign-in">

      <div>
        <strong>
          Private Captain Account
        </strong>

        <p>
          Sign in to securely save fishing logs across devices.
        </p>
      </div>


      <form
        onSubmit={sendMagicLink}
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
          disabled={loading}
        >
          {loading
            ? "Sending..."
            : "Email Sign-In Link"}
        </button>

      </form>


      {message && (
        <p>
          {message}
        </p>
      )}

      {error && (
        <p>
          {error}
        </p>
      )}

    </section>
  );
}


export default CaptainSignIn;