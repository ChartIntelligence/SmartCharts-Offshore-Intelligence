import {comparePersistenceEnvironments, PERSISTENCE_PROJECT_HEADER} from "../shared/persistenceEnvironment.mjs";

// Compatibility restricts access to memory. It never authenticates the captain.
// Existing Supabase identity verification and RLS still govern every operation.
export function resolvePersistenceRequestContext({headers = {}, configuration = null} = {}) {
  const persistenceEnvironment = comparePersistenceEnvironments({
    browserProject: headers[PERSISTENCE_PROJECT_HEADER.toLowerCase()],
    backendProject: configuration?.projectUrl,
    backendAvailable: configuration?.available === true
  });
  const authorization = headers.authorization;
  const bearerToken = persistenceEnvironment.state === "matched" &&
    typeof authorization === "string" && authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim() || null : null;
  return {persistenceEnvironment, bearerToken};
}
