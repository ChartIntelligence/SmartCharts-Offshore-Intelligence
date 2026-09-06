import {
  useState
} from "react";

import {
  supabase
} from "../lib/supabase";

import "../styles/publicLandingPage.css";


const resolveSignupSource = () => {
  const searchParams =
    new URLSearchParams(
      window.location.search
    );

  const requestedSource =
    (
      searchParams.get(
        "source"
      ) ??
      searchParams.get(
        "utm_source"
      ) ??
      ""
    )
      .trim()
      .toLowerCase();

  if (
    requestedSource ===
      "instagram" ||
    requestedSource ===
      "facebook" ||
    requestedSource ===
      "referral"
  ) {
    return requestedSource;
  }

  if (
    requestedSource
  ) {
    return "other";
  }

  return "direct";
};


function PublicLandingPage() {
  const [
    email,
    setEmail
  ] =
    useState("");

  const [
    signupState,
    setSignupState
  ] =
    useState("idle");


  const handleEarlyAccessSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        signupState ===
          "submitting"
      ) {
        return;
      }


      const normalizedEmail =
        email
          .trim()
          .toLowerCase();


      if (
        !normalizedEmail
      ) {
        return;
      }


      setSignupState(
        "submitting"
      );


      const {
        error
      } =
        await supabase.rpc(
          "join_early_access",
          {
            signup_email:
              normalizedEmail,

            signup_source:
              resolveSignupSource()
          }
        );


      if (
        error
      ) {
        setSignupState(
          "error"
        );

        return;
      }


      setEmail("");

      setSignupState(
        "success"
      );
    };


  const signupMessage =
    signupState ===
      "success"
      ? "You're on the Pelora Early Access list."
      : signupState ===
          "error"
        ? "We couldn't add you right now. Please try again."
        : "No spam. No selling your email.";


  return (
    <main className="pelora-public-page">

      <header className="pelora-public-header">

        <a
          aria-label="Pelora home"
          className="pelora-public-brand"
          href="/"
        >
          <img
            alt="Pelora - Ocean Intelligence"
            className="pelora-public-logo"
            src="/logos/pelora-wordmark-horrizon-descriptor.svg"
          />
        </a>

        <a
          className="pelora-captain-link"
          href="/?app=1"
        >
          Founding Captain Sign In
        </a>

      </header>


      <section className="pelora-public-hero">

        <div className="pelora-public-hero-inner">

          <p className="pelora-public-eyebrow">
            OCEAN INTELLIGENCE
          </p>

          <h1 className="pelora-public-title">
            The ocean is talking.
            <span>
              Pelora helps you listen.
            </span>
          </h1>

          <p className="pelora-public-intro">
            Pelora is being built to help
            offshore captains better understand
            the ocean before making the run.
          </p>

          <form
            className="pelora-early-access-form"
            onSubmit={
              handleEarlyAccessSubmit
            }
          >

            <label
              className="pelora-early-access-label"
              htmlFor="pelora-early-access-email"
            >
              Get Early Access
            </label>

            <p className="pelora-early-access-copy">
              Join the Pelora list for development
              updates, early-access announcements,
              and the opportunity to be among the
              first captains to experience Pelora.
            </p>

            <div className="pelora-early-access-fields">

              <input
                autoComplete="email"
                disabled={
                  signupState ===
                    "submitting"
                }
                id="pelora-early-access-email"
                maxLength={254}
                name="email"
                onChange={
                  event => {
                    setEmail(
                      event.target.value
                    );

                    if (
                      signupState ===
                        "error"
                    ) {
                      setSignupState(
                        "idle"
                      );
                    }
                  }
                }
                placeholder="Email address"
                required
                type="email"
                value={email}
              />

              <button
                disabled={
                  signupState ===
                    "submitting"
                }
                type="submit"
              >
                {
                  signupState ===
                    "submitting"
                    ? "Joining..."
                    : "Join Early Access"
                }
              </button>

            </div>

            <p
              aria-live="polite"
              className="pelora-early-access-privacy"
            >
              {signupMessage}
            </p>

          </form>

        </div>

      </section>


      <section className="pelora-public-principles">

        <article>
          <p className="pelora-principle-number">
            01
          </p>

          <h2>
            Understand the ocean,
            not just the layers.
          </h2>

          <p>
            Temperature. Current. Water character.
            Productivity. Structure. Pelora is being
            built to help captains understand how
            ocean conditions fit together.
          </p>
        </article>


        <article>
          <p className="pelora-principle-number">
            02
          </p>

          <h2>
            Built for the
            captain&apos;s decision.
          </h2>

          <p>
            Pelora provides context for the
            decision without pretending to replace
            experience on the water. The captain
            still makes the call.
          </p>
        </article>


        <article>
          <p className="pelora-principle-number">
            03
          </p>

          <h2>
            Built on evidence.
          </h2>

          <p>
            The ocean changes. Data ages.
            Evidence can be incomplete. Pelora
            is being designed to communicate
            those realities rather than hide them.
          </p>
        </article>

      </section>


      <section className="pelora-public-closing">

        <p>
          PELORA
        </p>

        <h2>
          See the ocean differently.
        </h2>

        <p className="pelora-public-closing-copy">
          Early access is coming.
        </p>

      </section>


      <footer className="pelora-public-footer">

        <span>
          {"\u00A9 2026 Pelora"}
        </span>

        <span>
          Ocean Intelligence
        </span>

      </footer>

    </main>
  );
}


export default PublicLandingPage;