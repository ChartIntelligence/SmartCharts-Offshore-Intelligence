import {buildFishingLocationSpatialEvidenceV1} from '../../../shared/fishingLocationSpatialEvidence.mjs';

export const emptyLocationDraft = () => ({latitude:'', longitude:'', label:'', certainty:''});
export const hasLocationDraft = draft => ['latitude','longitude','label'].some(key => draft[key].trim() !== '') || draft.certainty !== '';

// Lexical UI boundary only. Geographic validity belongs to Task 7C.
export function parseCoordinateText(text) {
  if (typeof text !== 'string' || !/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(text.trim())) return null;
  const value = Number(text.trim());
  return Number.isFinite(value) ? value : null;
}

export function addManualLocation(draft, uuid = () => globalThis.crypto?.randomUUID?.()) {
  const errors = {};
  if (!draft.latitude.trim() && !draft.longitude.trim()) return {location:null, errors};
  for (const field of ['latitude','longitude']) {
    if (!draft[field].trim()) errors[field] = 'Enter both latitude and longitude.';
    else if (parseCoordinateText(draft[field]) === null) errors[field] = `Enter ${field} in decimal degrees.`;
  }
  if (Object.keys(errors).length) return {location:null, errors};
  const location = {latitude:parseCoordinateText(draft.latitude), longitude:parseCoordinateText(draft.longitude),
    source:'manual', certainty:draft.certainty || 'unknown'};
  const evidence = buildFishingLocationSpatialEvidenceV1(location);
  for (const [field, limit] of [['latitude',90],['longitude',180]]) {
    if (evidence.coordinates[field].state !== 'valid') errors[field] = `${field === 'latitude' ? 'Latitude' : 'Longitude'} must be between -${limit} and ${limit}.`;
  }
  if (Object.keys(errors).length) return {location:null, errors};
  if (draft.label.trim()) location.label = draft.label;
  try {
    const id = uuid();
    if (typeof id === 'string' && id.trim()) location.locationEntryId = id;
  } catch { /* Missing identity is preferable to fabricated identity. */ }
  return {location, errors};
}

export const legacyFishingLocations = locations => locations.map(({latitude, longitude}) => ({latitude, longitude}));
// Object identity selects the exact in-memory entry, including when UUID is absent.
export const removeLocation = (locations, entry) => locations.filter(location => location !== entry);
