export const PERSISTENCE_ENVIRONMENT_CONTRACT = "pelora-persistence-environment-v1";
export const PERSISTENCE_PROJECT_HEADER = "X-Pelora-Persistence-Project";

// A canonical HTTPS origin is public project identity, never a credential.
// Custom-domain aliases are not inferred: different origins fail closed.
export function normalizePersistenceProjectIdentity(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password ||
        url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function comparePersistenceEnvironments({browserProject, backendProject, backendAvailable = false} = {}) {
  const browserProjectIdentity = normalizePersistenceProjectIdentity(browserProject);
  const backendProjectIdentity = normalizePersistenceProjectIdentity(backendProject);
  const verifiable = backendAvailable === true && browserProjectIdentity !== null && backendProjectIdentity !== null;
  const state = !verifiable ? "unknown" : browserProjectIdentity === backendProjectIdentity ? "matched" : "mismatched";
  return Object.freeze({
    contractVersion: PERSISTENCE_ENVIRONMENT_CONTRACT,
    state,
    browserProjectIdentity,
    backendProjectIdentity,
    reason: state === "matched" ? null : state === "mismatched" ? "different-persistence-projects" : "persistence-environment-unverifiable"
  });
}

export function isMatchedPersistenceEnvironment(contract, browserProject) {
  const identity = normalizePersistenceProjectIdentity(browserProject);
  return identity !== null && contract?.contractVersion === PERSISTENCE_ENVIRONMENT_CONTRACT &&
    contract.state === "matched" && contract.browserProjectIdentity === identity &&
    contract.backendProjectIdentity === identity;
}
