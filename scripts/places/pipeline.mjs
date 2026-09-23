// Offline only: no acquisition, transformation, filesystem writes or runtime publication.
import {createHash} from 'node:crypto';
import {PLACE_TYPES, normalizeGovernedPlaceV1, normalizePlaceAliasV1,
  validateGovernedPlaceCatalogV1} from '../../shared/governedPlace.mjs';

export const INGESTION_VERSION = 'pelora-place-ingestion-v1';
const fail = message => { throw new TypeError(`Invalid place ingestion: ${message}`); };
const str = v => typeof v === 'string' && v.trim().length > 0;
function keys(v, names) {
  if (!v || Object.getPrototypeOf(v) !== Object.prototype ||
      Object.keys(v).length !== names.length || names.some(k => !Object.hasOwn(v,k))) fail('object fields');
}
function json(v) {
  if (v === null || typeof v === 'string' || typeof v === 'boolean') return v;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (Array.isArray(v)) return Array.from(v, json);
  if (v && Object.getPrototypeOf(v) === Object.prototype)
    return Object.fromEntries(Object.keys(v).sort().map(k => [k,json(v[k])]));
  return fail('non-JSON input');
}
export const serializePlaceArtifact = v => JSON.stringify(json(v));
export const digestPlaceArtifact = v => createHash('sha256').update(serializePlaceArtifact(v)).digest('hex');
function freeze(v) { if (v && typeof v === 'object') {Object.values(v).forEach(freeze);Object.freeze(v);} return v; }
const ordered = (xs, field) => [...xs].sort((a,b) => a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0);
const unique = xs => new Set(xs).size === xs.length;
const nullableText = v => v === null || str(v);

export function normalizeSourceRegistry(input) {
  keys(input,['registryVersion','sources']);
  if (!str(input.registryVersion) || !Array.isArray(input.sources)) fail('registry');
  const r = json(input);
  for (const s of r.sources) {
    keys(s,['sourceId','authorityId','datasetId','snapshot','regionIds','featureTypes','crs','horizontalDatum',
      'updateCadence','statusSemantics','adapterId','adapterVersion','qualificationRef']);
    for (const k of ['sourceId','authorityId','datasetId','snapshot','statusSemantics','adapterId','adapterVersion'])
      if (!str(s[k])) fail(`registry.${k}`);
    for (const k of ['crs','horizontalDatum','updateCadence','qualificationRef']) if (!nullableText(s[k])) fail(`registry.${k}`);
    if (!Array.isArray(s.regionIds) || !s.regionIds.length || !s.regionIds.every(str) ||
        !Array.isArray(s.featureTypes) || !s.featureTypes.length || !s.featureTypes.every(t=>PLACE_TYPES.includes(t))) fail('registry.scope');
  }
  if (!unique(r.sources.map(s=>s.sourceId))) fail('duplicate sourceId');
  r.sources = ordered(r.sources,'sourceId'); return freeze(r);
}

/** Adapter output is a proposal, never verification. Supplied IDs are reservations, not inferred identities. */
export function buildVerificationQueue(input) {
  keys(input,['registry','records','existing']);
  const registry = normalizeSourceRegistry(input.registry);
  const existing = validateGovernedPlaceCatalogV1(input.existing);
  if (!Array.isArray(input.records)) fail('records');
  const proposals = input.records.map(record => {
    keys(record,['proposalId','sourceId','sourceRecordRef','entityKind','rawRecord','proposedPlace','reviews']);
    if (!str(record.proposalId) || !str(record.sourceRecordRef) ||
        !['feature','deployment','station-position'].includes(record.entityKind)) fail('record identity');
    keys(record.reviews,['datumRef','statusRef','identityRef']);
    if (!Object.values(record.reviews).every(nullableText)) fail('reviews');
    const source = registry.sources.find(s=>s.sourceId===record.sourceId);
    if (!source) fail('unknown source');
    const p = normalizeGovernedPlaceV1(record.proposedPlace);
    if (p.verification.state !== 'UNVERIFIED' || p.verification.assessmentRef !== null ||
        p.verification.assessedAt !== null || p.verification.evidenceSourceIds.length ||
        Object.values(p.eligibility).some(d=>d.status!=='not-assessed')) fail('adapter grants governance');
    if (!source.featureTypes.includes(p.placeType) || !p.regionIds.length ||
        p.regionIds.some(r=>!source.regionIds.includes(r))) fail('outside qualified source scope');
    const evidence = p.provenance.find(s=>s.sourceId===source.sourceId && s.authorityId===source.authorityId &&
      s.datasetId===source.datasetId && s.sourceSnapshot===source.snapshot && s.locatorId===record.sourceRecordRef);
    if (!evidence) fail('source lineage mismatch');
    const originalCrs = p.transformation?.sourceReferenceSystem ?? p.coordinateReferenceSystem;
    if (originalCrs.crs !== source.crs || originalCrs.horizontalDatum !== source.horizontalDatum) fail('source CRS mismatch');
    const issues = [];
    if (!source.qualificationRef) issues.push('NEEDS_SOURCE_QUALIFICATION');
    if (!p.geometry || !p.coordinateReferenceSystem.crs || !p.coordinateReferenceSystem.horizontalDatum ||
        !p.coordinateReferenceSystem.unit || !originalCrs.crs || !originalCrs.horizontalDatum ||
        !originalCrs.unit || !record.reviews.datumRef ||
        (p.transformation && !p.transformation.verificationRef)) issues.push('NEEDS_DATUM_RECONCILIATION');
    if (p.temporal.status === 'unknown' || !record.reviews.statusRef ||
        (p.temporal.nature==='TIME_VARYING_STRUCTURE' && !p.temporal.observedAt)) issues.push('NEEDS_STATUS_VERIFICATION');
    if (!record.reviews.identityRef) issues.push('NEEDS_IDENTITY_RECONCILIATION');
    const previous = existing.find(x=>x.placeId===p.placeId) ?? null;
    if (previous && previous.revisionId===p.revisionId) fail('revision must change');
    const body = {...json(record), proposedPlace:p, rawRecord:json(record.rawRecord),
      rawRecordDigest:digestPlaceArtifact(record.rawRecord), source, previous};
    return {...body, proposalDigest:digestPlaceArtifact(body), issues};
  });
  if (!unique(proposals.map(p=>p.proposalId))) fail('duplicate proposalId');
  const conflicts=[];
  const candidates = [...proposals.map(p=>({ref:`proposal:${p.proposalId}`,place:p.proposedPlace})),
    ...existing.map(p=>({ref:`existing:${p.placeId}:${p.revisionId}`,place:p}))].sort((a,b)=>a.ref<b.ref?-1:a.ref>b.ref?1:0);
  for (let i=0;i<candidates.length;i++) for(let j=i+1;j<candidates.length;j++) {
    const a=candidates[i], b=candidates[j];
    if (a.ref.startsWith('existing:') && b.ref.startsWith('existing:')) continue;
    const authorityKeys=p=>p.provenance.filter(s=>s.featureId!==null).map(s=>serializePlaceArtifact([s.authorityId,s.datasetId,s.featureId]));
    const sharedAuthority=authorityKeys(a.place).some(k=>authorityKeys(b.place).includes(k));
    const names=p=>[p.canonicalName,...p.aliases].map(normalizePlaceAliasV1);
    const sharedName=names(a.place).some(n=>names(b.place).includes(n));
    const sameId=a.place.placeId===b.place.placeId;
    // Exact geometry is a review lead only, never proof of sameness. No proximity threshold.
    const sameGeometry=a.place.geometry!==null && serializePlaceArtifact([a.place.geometry,a.place.coordinateReferenceSystem])===
      serializePlaceArtifact([b.place.geometry,b.place.coordinateReferenceSystem]);
    if (!sharedAuthority && !sharedName && !sameId && !sameGeometry) continue;
    const reasons=[];
    if (sharedAuthority && !sameId) reasons.push('AUTHORITY_ID_CONFLICT');
    if ((sharedName || sameGeometry) && !sameId) reasons.push('POSSIBLE_IDENTITY_OVERLAP');
    if (sameId && a.ref.startsWith('proposal:') && b.ref.startsWith('proposal:')) reasons.push('MULTIPLE_PROPOSALS_ONE_PLACE');
    for(const field of ['geometry','coordinateReferenceSystem','canonicalName','placeType','temporal'])
      if ((sharedAuthority||sameId) && serializePlaceArtifact(a.place[field])!==serializePlaceArtifact(b.place[field])) reasons.push(`DIFFERENT_${field}`);
    if (reasons.length) {const body={left:a,right:b,reasons};conflicts.push({conflictId:digestPlaceArtifact(body),...body});}
  }
  const rows=ordered(proposals,'proposalId').map(p=>{
    const conflictIds=conflicts.filter(c=>[c.left.ref,c.right.ref].includes(`proposal:${p.proposalId}`)).map(c=>c.conflictId).sort();
    return {...p,conflictIds,state:conflictIds.length?'CONFLICT':p.issues.length?'PROPOSED':'READY_FOR_VERIFICATION',
      recommendedAction:conflictIds.length?'Review both sides; do not merge automatically':p.issues.length?'Resolve listed evidence gaps':'Perform verification review; no permission implied'};
  });
  const body={contractVersion:INGESTION_VERSION,registry,existing:ordered(existing,'placeId'),rows,conflicts:ordered(conflicts,'conflictId')};
  return freeze({...body,queueDigest:digestPlaceArtifact(body)});
}

/** Builds an OFFLINE candidate artifact. Approval authenticity and active publication are outside this tool. */
export function buildReviewedCatalog(input, approval) {
  const queue=buildVerificationQueue(input);
  if (queue.existing.some(p=>p.verification.state==='UNVERIFIED')) fail('existing catalog must be reviewed');
  keys(approval,['catalogVersion','queueDigest','decisions']);
  if (!str(approval.catalogVersion) || approval.queueDigest!==queue.queueDigest || !Array.isArray(approval.decisions)) fail('stale or malformed approval');
  const records=[]; const decisions=[];
  for(const d of approval.decisions) {
    keys(d,['proposalId','proposalDigest','decisionRef','conflictReviews','approvedPlace']);
    const row=queue.rows.find(r=>r.proposalId===d.proposalId);
    if (!row || d.proposalDigest!==row.proposalDigest || !str(d.decisionRef) || row.issues.length) fail('unready proposal');
    if (!Array.isArray(d.conflictReviews)) fail('conflict reviews');
    for(const r of d.conflictReviews) {keys(r,['conflictId','decisionRef']);if(!str(r.decisionRef)) fail('conflict decision');}
    if (!unique(d.conflictReviews.map(r=>r.conflictId)) || serializePlaceArtifact(d.conflictReviews.map(r=>r.conflictId).sort())!==serializePlaceArtifact(row.conflictIds)) fail('unresolved conflicts');
    const p=normalizeGovernedPlaceV1(d.approvedPlace);
    if (p.verification.state==='UNVERIFIED') fail('unverified approval');
    const facts={...p,verification:row.proposedPlace.verification,eligibility:row.proposedPlace.eligibility};
    if (serializePlaceArtifact(facts)!==serializePlaceArtifact(row.proposedPlace)) fail('changed facts require new proposal review');
    records.push(p);decisions.push(json(d));
  }
  if (!unique(decisions.map(d=>d.proposalId))) fail('duplicate approval');
  const selected=validateGovernedPlaceCatalogV1(records);
  // Include existing records unchanged; replace only explicitly approved revisions.
  const merged=validateGovernedPlaceCatalogV1([...queue.existing.filter(p=>!selected.some(s=>s.placeId===p.placeId)),...selected]);
  return freeze({contractVersion:'pelora-offline-place-catalog-v1',catalogVersion:approval.catalogVersion,
    queueDigest:queue.queueDigest,registryVersion:queue.registry.registryVersion,
    decisions:ordered(decisions,'proposalId'),places:ordered(merged,'placeId')});
}
