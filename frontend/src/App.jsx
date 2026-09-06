import FoundingCaptainAccessGate
  from "./components/FoundingCaptainAccessGate";

import PublicLandingPage
  from "./components/PublicLandingPage";


function App() {
  const searchParams =
    new URLSearchParams(
      window.location.search
    );

  const captainAppRequested =
    searchParams.get("app") === "1";


  if (
    captainAppRequested
  ) {
    return (
      <FoundingCaptainAccessGate />
    );
  }


  return (
    <PublicLandingPage />
  );
}


export default App;