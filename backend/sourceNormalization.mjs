import {createHash} from 'node:crypto';

// Processing semantics, not provider/scientific authority or a deployment ID.
export const SOURCE_NORMALIZATION_VERSION = 'pelora-source-normalization-v1';

export function normalizationCacheKey(latitude, longitude, version = SOURCE_NORMALIZATION_VERSION) {
  if (typeof version !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(version)) {
    throw new TypeError('A normalization semantics version is required');
  }
  return `${version}:${Number(latitude).toFixed(4)},${Number(longitude).toFixed(4)}`;
}

// Keep each route's existing string compatibility, including its empty-string rule.
// Null/missing and malformed structures are never measured numeric zero.
export function sourceNumber(value, emptyStringIsMissing = true) {
  if (value === null || value === undefined || (emptyStringIsMissing && value === '')) return null;
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function roundFinite(value, digits) {
  if (!Number.isFinite(value)) return null;
  if (Object.is(value, -0)) return -0;
  const result = Number(value.toFixed(digits));
  return Number.isFinite(result) ? result : null;
}

export function sourceScaledNumber(value, factor) {
  const number = sourceNumber(value, false);
  return number === null ? null : roundFinite(number * factor, 1);
}

// Existing capture lineage references bind this descriptor, not an extra source field.
// Do not attach it to historical captures or evidence produced by other semantics.
export const SOURCE_NORMALIZATION_DESCRIPTOR = Object.freeze({
  contractVersion: SOURCE_NORMALIZATION_VERSION,
  missingness: 'null-and-undefined-remain-unavailable',
  numericStrings: 'preserve-route-specific-existing-compatibility',
  malformedStructures: 'reject-nonnumeric-nonstring-values',
  arithmetic: 'finite-required-intermediates-and-results-unchanged-formulas',
  signedZero: 'preserve-in-sign-preserving-conversion-and-rounding',
  currents: 'qualified-consumer-specific-failure-locality',
  excluded: 'provider-fill-legacy-coordinate-history-temporal-convergence-policy'
});

export const SOURCE_NORMALIZATION_REFERENCE = Object.freeze({
  kind: 'captured',
  referenceId: SOURCE_NORMALIZATION_VERSION,
  contractVersion: SOURCE_NORMALIZATION_VERSION,
  sha256: createHash('sha256').update(JSON.stringify(SOURCE_NORMALIZATION_DESCRIPTOR)).digest('hex')
});
