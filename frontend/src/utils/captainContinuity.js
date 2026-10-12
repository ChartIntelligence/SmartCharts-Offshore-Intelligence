// Browser-device continuity only; never an authentication or evidence source.
export const CONTINUITY_VERSION = 'pelora-captain-continuity-v1';
export function continuityOwner(user) {
  return user?.is_anonymous !== true && typeof user?.id === 'string' && user.id.trim() ? user.id : null;
}
export const continuityKey = (owner, kind) => owner ? 'pelora.continuity.v1:' + encodeURIComponent(owner) + ':' + kind : null;
export function readContinuity(storage, owner, kind, validate) {
  const key = continuityKey(owner, kind);
  if (!key) return {value:null, revision:null, error:null};
  try {
    const raw = storage?.getItem(key);
    if (!storage) throw Error('Device storage unavailable');
    if (!raw) return {value:null, revision:null, error:null};
    if (raw.length > 1048576) throw Error('Stored state too large');
    const record = JSON.parse(raw);
    if (record.version !== CONTINUITY_VERSION || record.owner !== owner || typeof record.revision !== 'string' || !validate(record.value)) throw Error('Invalid stored state');
    return {value:record.value, revision:record.revision, error:null};
  } catch { return {value:null, revision:null, error:'Device recovery was unavailable or damaged. Your current work can still be edited.'}; }
}
let sequence = 0;
export function writeContinuity(storage, owner, kind, value) {
  if (!owner) return {revision:null, error:null};
  try {
    const revision = globalThis.crypto?.randomUUID?.() ?? Date.now() + ':' + (++sequence);
    const raw = JSON.stringify({version:CONTINUITY_VERSION, owner, revision, value});
    if (raw.length > 1048576) throw Error('Draft too large');
    if (!storage) throw Error('Device storage unavailable');
    storage.setItem(continuityKey(owner,kind),raw);
    return {revision, error:null};
  } catch {return {revision:null, error:'Could not save on this device. Keep this page open until your work is saved.'};}
}
export function clearContinuityRevision(storage, owner, kind, revision) {
  try {
    const key = continuityKey(owner,kind);
    const record = JSON.parse(storage.getItem(key));
    if (!revision || record?.owner !== owner || record.revision !== revision) return false;
    storage.removeItem(key); return true;
  } catch { return false; }
}
export function invalidateStoredSelection(storage, owner) {
  const saved = readContinuity(storage,owner,'workspace',validateWorkspace);
  if (saved.value) return writeContinuity(storage,owner,'workspace',{...saved.value,opportunitySelection:null,selectedSpotId:null,sheetExpanded:false});
}
export const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const identity = value => typeof value === 'string' && value.length > 0 && value.length <= 512;
export function validateCamera(value) {
  return value === null || isRecord(value) && Object.keys(value).length === 3 && Array.isArray(value.center) && value.center.length === 2 &&
    value.center.every(Number.isFinite) && Math.abs(value.center[0]) <= 180 && Math.abs(value.center[1]) <= 85 &&
    Number.isFinite(value.zoom) && value.zoom >= 0 && value.zoom <= 24 && Number.isFinite(value.bearing) && Math.abs(value.bearing) <= 360;
}
export function validateWorkspace(value) {
  return isRecord(value) && Object.keys(value).every(key=>['activeTab','layers','selectedSpotId','opportunitySelection','mapCamera','sheetExpanded','reportPanelOpen'].includes(key)) && ['today','map','intelligence','reports','profile'].includes(value.activeTab) &&
    isRecord(value.layers) && Object.keys(value.layers).length === 11 && ['marlin','yellowfin','blackfin','locations','bathymetry','currentField','temperatureSamples','chlorophyll','currents','temperatureTransition','baitProbability'].every(key=>typeof value.layers[key]==='boolean') && validateCamera(value.mapCamera) &&
    (value.selectedSpotId === null || identity(value.selectedSpotId)) && typeof value.sheetExpanded === 'boolean' &&
    typeof value.reportPanelOpen === 'boolean' && !(value.selectedSpotId && value.opportunitySelection) && (value.opportunitySelection === null ||
      isRecord(value.opportunitySelection) && Object.keys(value.opportunitySelection).length === 2 && typeof value.opportunitySelection.context === 'string' &&
      isRecord(value.opportunitySelection.opportunity) && identity(value.opportunitySelection.opportunity.id) &&
      Object.keys(value.opportunitySelection.opportunity).length === 1);
}
// Form shape validation, not scientific validation. Incomplete text stays text;
// the existing submit-time temporal/spatial contracts remain the authority.
export function validateFishingDraft(value, initial) {
  if (!isRecord(value) || Object.keys(value).length !== 3 || !isRecord(value.report) || !isRecord(value.fishingLocationDraft) || typeof value.areaSearch !== 'string') return false;
  const report = value.report;
  if (Object.keys(report).some(key=>!Object.hasOwn(initial,key))) return false;
  for (const [key, template] of Object.entries(initial)) {
    const entry = report[key];
    if (Array.isArray(template)) {
      if (!Array.isArray(entry)) return false;
      if (key === 'areasFished') {if (!entry.every(area=>isRecord(area) && typeof area.name==='string' && (area.id == null || typeof area.id==='string'))) return false;}
      else if (key === 'fishingLocations') {if (!entry.every(location=>isRecord(location) && Number.isFinite(location.latitude) && Number.isFinite(location.longitude) &&
        ['label','certainty','source','locationEntryId'].every(k=>location[k] == null || typeof location[k]==='string'))) return false;}
      else if (!entry.every(item=>typeof item==='string')) return false;
    } else if (isRecord(template)) {
      if (!isRecord(entry) || Object.keys(entry).some(key=>!Object.hasOwn(template,key))) return false;
      for (const [species, results] of Object.entries(template)) {
        if (!isRecord(entry[species]) || Object.keys(entry[species]).some(key=>!Object.hasOwn(results,key))) return false;
        for (const counter of Object.keys(results)) if (!Number.isFinite(entry[species][counter]) || entry[species][counter] < 0) return false;
      }
    } else if (typeof entry !== typeof template) return false;
  }
  return Object.keys(value.fishingLocationDraft).length === 4 && ['latitude','longitude','label','certainty'].every(key=>typeof value.fishingLocationDraft[key]==='string');
}
