import {check, data, keys, integer, reference, utc, seal, unseal, same, freeze} from './canonical.mjs';
import {manifestReference} from './manifest.mjs';

export const ACTIVATION = 'pelora-observe-activation-v1';
function body(input) {
  const a = data(input);
  keys(a, ['contractVersion','manifestReference','revision','state','approvedAt','effectiveAt','stoppedAt']);
  check(a.contractVersion === ACTIVATION, 'activation-version'); reference(a.manifestReference); integer(a.revision, 1);
  check(['ENABLED','DISABLED','REVOKED'].includes(a.state), 'activation-state');
  check(utc(a.approvedAt) <= utc(a.effectiveAt), 'retroactive-activation');
  if (a.state === 'ENABLED') check(a.stoppedAt === null, 'enabled-stop');
  else check(utc(a.stoppedAt) >= utc(a.effectiveAt), 'activation-stop');
  return a;
}
export const createActivation = input => seal(ACTIVATION, body(input));
export const validateActivation = input => seal(ACTIVATION, body(unseal(ACTIVATION, input)));

// trustedState is a future protected-registry snapshot, never request input.
// Matching digests validate a supplied trust root; they do NOT establish its authority.
export function resolveActivation(manifest, activation, trustedState, at) {
  const a = validateActivation(activation), t = data(trustedState);
  keys(t, ['approvedManifestReference','activationDigest','activationRevision']); reference(t.approvedManifestReference);
  integer(t.activationRevision, 1);
  check(same(a.manifestReference, manifestReference(manifest)) && same(t.approvedManifestReference, a.manifestReference), 'unapproved-manifest');
  check(t.activationRevision === a.revision && t.activationDigest === a.digest, 'stale-activation');
  const time = utc(at);
  check(a.state === 'ENABLED', 'manifest-inactive');
  check(time >= utc(a.effectiveAt) && time >= utc(manifest.effectiveFrom) && time < utc(manifest.effectiveUntil), 'inactive-time');
  return freeze(a);
}
