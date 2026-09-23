import {normalizePersistenceProjectIdentity, isMatchedPersistenceEnvironment, PERSISTENCE_PROJECT_HEADER} from "../../../shared/persistenceEnvironment.mjs";

export function browserPersistenceProject(environment = import.meta.env ?? {}) {
  return normalizePersistenceProjectIdentity(environment.VITE_SUPABASE_URL);
}

export function persistenceRequestHeaders(environment = import.meta.env ?? {}) {
  const identity = browserPersistenceProject(environment);
  return identity ? {[PERSISTENCE_PROJECT_HEADER]: identity} : {};
}

// Validate the acknowledgement attached to this ocean response, not a cached
// global flag that could authorize a snapshot from a different backend.
export function canPersistOceanResponse(contract, environment = import.meta.env ?? {}) {
  return isMatchedPersistenceEnvironment(contract, browserPersistenceProject(environment));
}
