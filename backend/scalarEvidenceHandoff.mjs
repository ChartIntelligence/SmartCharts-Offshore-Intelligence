// Live scalar identity only. No receipt, scientific admission, or historical upgrade.
import {createHash} from 'node:crypto';
import {SOURCE_NORMALIZATION_VERSION, SOURCE_NORMALIZATION_REFERENCE} from './sourceNormalization.mjs';
import {captureCurrentEvidenceV2, currentCaptureReferenceV2, serializeCurrentEvidenceCaptureV2,
  readCurrentEvidenceCaptureV2, validateCurrentCaptureReferenceV2} from './currentEvidenceCaptureV2.mjs';
import {exactJson, MAX_EXACT_CAPTURE_BYTES} from './exactScientificEvidence.mjs';
import {copy, freeze, check, keys, hash} from '../shared/oceanPublication.mjs';

const spatialBindings = new WeakMap(), publications = new WeakMap();
const centerFields = ['temperatureCelsius','temperatureFahrenheit','observedAt','timestampProvenance',
  'requestedLatitude','requestedLongitude','resolvedLatitude','resolvedLongitude'];
const scalarFields = [...centerFields,'providerCoordinates','source','concentrationMgM3','waterClassification'];
const same = (a,b) => exactJson(a) === exactJson(b);
const sha = value => createHash('sha256').update(exactJson(value)).digest('hex');
// Snapshot own descriptors before invoking any authorized field getter. Critical
// fields are materialized once; arbitrary runtime context still rejects getters.
function descriptors(input) {
  check(input && Object.getPrototypeOf(input) === Object.prototype);
  const result = Object.getOwnPropertyDescriptors(input);
  check(Reflect.ownKeys(result).every(k=>typeof k==='string' && result[k].enumerable));
  return result;
}
function readOwn(input, fields, key) {
  const d=fields[key];
  return Object.hasOwn(d,'value') ? d.value : d.get?.call(input);
}
function primitive(value) {
  check(value===null || value===undefined || ['number','string','boolean'].includes(typeof value));
  return value;
}
function retainFields(input, fields, names) {
  const result = {};
  for (const key of names) if (Object.hasOwn(fields,key)) {
    result[key] = primitive(readOwn(input,fields,key));
  }
  return result;
}
function retainRecord(input,names) {
  const fields=descriptors(input);
  check(Object.keys(fields).every(k=>names.includes(k)));
  return retainFields(input,fields,names);
}
function contextRemainder(fields,omitted) {
  const result={};
  for(const [key,d] of Object.entries(fields)) if(!omitted.includes(key)) {
    check(Object.hasOwn(d,'value'));
    Object.defineProperty(result,key,{enumerable:true,configurable:true,writable:true,value:copy(d.value)});
  }
  return result;
}
function centerState(point,fields=descriptors(point)) {
  const state=retainFields(point,fields,centerFields);
  if(Object.hasOwn(fields,'providerCoordinates')) state.providerCoordinates=retainRecord(
    readOwn(point,fields,'providerCoordinates'),['resolvedLatitude','resolvedLongitude']);
  return state;
}
function retainedSpatial(spatial) {
  const fields=descriptors(spatial),names=['thresholdVersion','centerTemperatureAvailable'];
  return freeze({...contextRemainder(fields,names),...retainFields(spatial,fields,names)});
}
function retainedProcessing(refs) {
  check(Array.isArray(refs) && Object.getPrototypeOf(refs)===Array.prototype);
  const fields=Object.getOwnPropertyDescriptors(refs),length=fields.length.value;
  check(Reflect.ownKeys(fields).length===length+1);
  const result=[];
  for(let i=0;i<length;i++) {
    check(Object.hasOwn(fields,String(i)) && fields[i].enumerable);
    result.push(retainRecord(readOwn(refs,fields,String(i)),['kind','referenceId','contractVersion','sha256',
      'archiveId','frameId','receiptDigest','contentDigest']));
  }
  return freeze(result);
}
function retainedCenter(point,spatial,binding) {
  const fields=descriptors(point);
  // Reuse the materialized source tuple if the helper receives the original
  // source object. Actual snapshot projections materialize their own fields once
  // and must match it. Neither route validates and later rereads source values.
  const center=point===binding.source ? binding.state : freeze(centerState(point,fields));
  check(Object.hasOwn(fields,'source') && Object.hasOwn(fields,'derived'));
  const source=retainRecord(readOwn(point,fields,'source'),['provider','classification','availability']);
  const derived=readOwn(point,fields,'derived'),derivedFields=descriptors(derived);
  check(Object.hasOwn(derivedFields,'spatialStructure'));
  const spatialInput=readOwn(derived,derivedFields,'spatialStructure');
  // The original producer object already has an immutable retained result. A
  // snapshot clone must independently materialize and match that exact result.
  const spatialState=spatialInput===spatial ? binding.spatial : retainedSpatial(spatialInput);
  check(same(spatialState,binding.spatial));
  const retained={...contextRemainder(fields,[...centerFields,'source','derived','providerCoordinates']),...center,source,
    derived:{...contextRemainder(derivedFields,['spatialStructure']),spatialStructure:spatialState}};
  return freeze({center,point:retained,spatial:spatialState});
}
function requireNormalization(refs) {
  const versions = refs?.filter(r=>r?.contractVersion?.startsWith('pelora-source-normalization-'));
  check(versions?.length === 1 && same(versions[0],SOURCE_NORMALIZATION_REFERENCE));
}

// Internal call-path binding: snapshot the SAME input before invoking the spatial
// producer. Never construct this association from a published Boolean or history.
export async function bindCenterSstSpatial(center, normalizationVersion, produceSpatial) {
  check(normalizationVersion === SOURCE_NORMALIZATION_VERSION);
  const state = freeze(centerState(center));
  const spatial = await produceSpatial(state.temperatureFahrenheit ?? null);
  try {
    if (spatial && typeof spatial === 'object') spatialBindings.set(spatial,
      Object.freeze({state,spatial:retainedSpatial(spatial),source:center}));
  } catch { /* Publication refusal must not turn successful spatial analysis into failure. */ }
  return spatial;
}

function sourceAuthority(point) {
  // Reuse the existing recorded-current-source metadata reference convention.
  // It records metadata; it does not authenticate provider/model equivalence.
  const {provider,dataset,classification} = point.source;
  const metadata = {provider,dataset,classification};
  return {status:'RECORDED_NOT_REQUALIFIED',reference:{kind:'captured',
    referenceId:'recorded-current-source-'+hash(metadata),
    contractVersion:'pelora-recorded-current-source-metadata-v1',sha256:hash(metadata)}};
}
function envelope(point,family,processingReferences,availability) {
  const original = copy(point), captured = {}, context = copy(point);
  for(const key of scalarFields) if(Object.hasOwn(context,key)) { captured[key]=context[key];delete context[key]; }
  // Retain original center source absence without rewriting the live source object.
  const originalSource = copy(captured.source);
  if(family === 'SST') captured.source = {...captured.source,availability};
  const capture = captureCurrentEvidenceV2({family,sourceAuthority:sourceAuthority(captured),
    samples:[{role:'center',outcome:'FULFILLED',point:captured}],lineageReferences:processingReferences});
  const content = {reference:currentCaptureReferenceV2(capture),captureText:serializeCurrentEvidenceCaptureV2(capture),
    contextText:exactJson({context,originalSource})};
  check(Buffer.byteLength(content.captureText)+Buffer.byteLength(content.contextText)<=MAX_EXACT_CAPTURE_BYTES);
  const result = freeze({...content,sha256:sha(content)});
  check(same(decodeScalarHandoff(result,family),original));
  return result;
}

export function captureBoundCenterSst(point,spatial,processingReferences) {
  const binding = spatialBindings.get(spatial);
  check(binding);
  const refs=retainedProcessing(processingReferences),retained=retainedCenter(point,spatial,binding);
  requireNormalization(refs);
  check(same(retained.center,binding.state));
  check(retained.spatial.thresholdVersion === 'pelora-sst-spatial-range-v1');
  const available = retained.spatial.centerTemperatureAvailable;
  check(typeof available === 'boolean');
  // This validates the existing producer invariant; it never supplies availability.
  check(available === Number.isFinite(binding.state.temperatureFahrenheit));
  return envelope(retained.point,'SST',refs,available ? 'available' : 'unavailable');
}

export function captureLiveChlorophyll(point,processingReferences) {
  requireNormalization(processingReferences);
  const family = point.source?.classification === 'satellite-observation' ? 'CHLOROPHYLL_DIRECT' :
    point.source?.classification === 'satellite-derived-reconstruction' ? 'CHLOROPHYLL_GAP_FILLED' : null;
  check(family);
  return envelope(point,family,processingReferences);
}

// Register after the existing snapshot clones, without adding consumer-visible
// fields. A refused capture leaves ordinary publication intact, with no reference.
export function registerScalarPublication(observation,spatial) {
  const points = observation?.observations, refs = observation?.lineage?.processingReferences;
  if(!points) return;
  for(const field of ['sst','chlorophyll']) {
    try {
      const point = points[field];
      check(Object.isFrozen(point));
      const captured = field === 'sst' ? captureBoundCenterSst(point,spatial,refs) : captureLiveChlorophyll(point,refs);
      publications.set(point,captured);
    } catch { /* No exact-reference authority on refusal; no scientific fallback. */ }
  }
}

export function encodeScalarHandoff(point) {
  if(Object.hasOwn(point,'captureText')) {
    const family=readCurrentEvidenceCaptureV2(point.captureText).family;
    check(['SST','CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED'].includes(family));
    decodeScalarHandoff(point,family);
    return freeze(copy(point));
  }
  return publications.get(point) ?? point;
}
export function decodeScalarHandoff(input,expectedFamily) {
  const p=copy(input);keys(p,['reference','captureText','contextText','sha256']);
  check(typeof p.captureText==='string' && typeof p.contextText==='string');
  check(Buffer.byteLength(p.captureText)+Buffer.byteLength(p.contextText)<=MAX_EXACT_CAPTURE_BYTES);
  const {sha256,...content}=p;check(sha256===sha(content));
  const capture=readCurrentEvidenceCaptureV2(p.captureText);
  validateCurrentCaptureReferenceV2(p.reference,capture);requireNormalization(capture.lineageReferences);
  check(capture.family===expectedFamily && capture.samples.length===1);
  const sample=capture.samples[0];check(sample.role==='center'&&sample.outcome==='FULFILLED');
  const remainder=copy(JSON.parse(p.contextText));keys(remainder,['context','originalSource']);
  check(exactJson(remainder)===p.contextText && !scalarFields.some(k=>Object.hasOwn(remainder.context,k)));
  if(expectedFamily==='SST') {
    check(!Object.hasOwn(remainder.originalSource,'availability'));
    const {availability,...source}=sample.point.source;check(same(source,remainder.originalSource));
    const spatial=remainder.context.derived?.spatialStructure;
    check(spatial?.thresholdVersion==='pelora-sst-spatial-range-v1' && typeof spatial.centerTemperatureAvailable==='boolean');
    check(availability===(spatial.centerTemperatureAvailable?'available':'unavailable'));
    check(spatial.centerTemperatureAvailable===Number.isFinite(sample.point.temperatureFahrenheit));
  } else check(same(sample.point.source,remainder.originalSource));
  const result=freeze({...remainder.context,...sample.point,source:remainder.originalSource});
  publications.set(result,freeze(p));
  return result;
}
export function scalarObservationHandoff(observation,encode) {
  if(!observation?.observations) return observation;
  const points={...observation.observations};
  for(const field of ['sst','chlorophyll']) {
    const point=points[field];
    if(encode) { if(point && typeof point==='object') points[field]=encodeScalarHandoff(point); }
    else if(point && Object.hasOwn(point,'captureText')) {
      requireNormalization(observation.lineage?.processingReferences);
      const capture=readCurrentEvidenceCaptureV2(point.captureText);
      check(same(capture.lineageReferences,observation.lineage.processingReferences));
      const family=field==='sst'?'SST':capture.family;
      check(field==='sst'||['CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED'].includes(family));
      points[field]=decodeScalarHandoff(point,family);
    }
  }
  return {...observation,observations:points};
}
