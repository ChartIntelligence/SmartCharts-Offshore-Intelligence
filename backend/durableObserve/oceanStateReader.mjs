import {check,data,keys,utc,iso,integer,same,freeze} from '../observe/canonical.mjs';
import {validateManifest} from '../observe/manifest.mjs';
import {validateStoredObservation} from './observationStorage.mjs';
import {readCurrentEvidenceCaptureV3} from '../currentEvidenceCaptureV3.mjs';
import {validateHistoricalReceiptEnvelope} from '../historicalReceiptRuntime.mjs';

export const OCEAN_STATE_READER='pelora-ocean-state-reader-v1';
// Explicit CP-07 governance decision: independent presentation and live-age dimensions.
export const CURRENTS_READER_POLICY=freeze({id:'pelora-currents-ocean-state-age-policy-v1',freshThroughMs:72*3600000,liveThroughMs:96*3600000,
 historical:'EXPLICIT_QUERY_CONTEXT_ONLY',ageBasis:'SOURCE_OBSERVATION_TIME',quality:'CONSUMER_REQUIRED_GROUPS_REMAIN_INDEPENDENT'});

function request(input,clock){
 const q=data(input);keys(q,['scope','queryContext','sourceTime','maxObservations',...(q.queryContext==='historical'?['targetTime']:[])]);
 keys(q.scope,['manifestDigest','region','product','cellKey']);keys(q.scope.region,['id','version']);keys(q.scope.product,['family','provider','dataset','productId']);
 check(typeof q.scope.manifestDigest==='string'&&/^[a-f0-9]{64}$/.test(q.scope.manifestDigest),'reader-manifest-digest');
 check(typeof q.scope.cellKey==='string'&&/^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/.test(q.scope.cellKey),'reader-cell-key');
 check(['live','historical'].includes(q.queryContext),'reader-query-context');q.readAt=iso(utc(clock.now()));
 q.assessmentAt=q.queryContext==='live'?q.readAt:iso(utc(q.targetTime));
 check(q.assessmentAt<=q.readAt,'reader-future-history-target');
 keys(q.sourceTime,['from','until']);q.sourceTime.from=iso(utc(q.sourceTime.from));q.sourceTime.until=iso(utc(q.sourceTime.until));
 check(q.sourceTime.from<q.sourceTime.until,'reader-source-range');integer(q.maxObservations,1,20);
 check(q.queryContext==='historical'||q.maxObservations===1,'reader-live-single-head');return q;
}
function observation(q,m,cell,row){
 const jobId=row.chain?.accepted?.jobId,accepted=validateStoredObservation(jobId,row.chain),index=accepted.index,e=accepted.record.execution;
 check(index.manifest_digest===m.digest&&index.cell_key===cell.key&&same(row.chain.context.manifest,m),'reader-scope-binding');
 const capture=readCurrentEvidenceCaptureV3(accepted.record.captureText),point=capture.samples.find(s=>s.role==='center').point;
 const observationTime=iso(utc(point.observedAt.includes('.')?point.observedAt:point.observedAt.replace('Z','.000Z'))),ageMs=Date.parse(q.assessmentAt)-Date.parse(observationTime);
 check(ageMs>=0&&observationTime>=q.sourceTime.from&&observationTime<q.sourceTime.until&&index.timestamps.acceptedAt<=q.assessmentAt,'reader-time-binding');
 check(observationTime===index.timestamps.selectedProviderTime&&same(row.chain.context.job.cell,cell),'reader-governed-cell');
 const freshnessState=ageMs<=CURRENTS_READER_POLICY.freshThroughMs?'fresh':'stale';
 const sourceAvailability=point.source.availability;
 // Current CP-03 acceptance admits available CURRENTS only. Never reinterpret
 // an impossible accepted no-data row produced by bypassing that invariant.
 check(sourceAvailability==='available','reader-accepted-source-invariant');
 const componentsAvailable=sourceAvailability==='available'&&Number.isFinite(point.eastwardMetersPerSecond)&&Number.isFinite(point.northwardMetersPerSecond);
 const completeVectorAvailable=componentsAvailable&&Number.isFinite(point.speedKnots)&&Number.isFinite(point.directionDegrees)&&!point.speedDerivationFailed;
 const dataState=sourceAvailability==='no-valid-pixel'?'accepted-no-data':componentsAvailable?'available':'accepted-unavailable';
 const withinLiveAge=ageMs<=CURRENTS_READER_POLICY.liveThroughMs;
 const liveAuthorityState=!withinLiveAge?'not-current':componentsAvailable?'eligible':'unavailable';
 let receipt={status:'AS_OF_AUTHORITY_UNKNOWN',record:null,linkage:null};
 if(row.receipt!==null){
  check(row.receipt&&same(row.receipt.linkage,index),'reader-receipt-linkage');
  const env=validateHistoricalReceiptEnvelope(row.receipt.envelopeText,index.evidence_reference);
  check(env.captureText===accepted.record.captureText,'reader-receipt-capture');
  // Validate the entire private storage index, then expose provenance without
  // the process-private CP-02 capability token or storage placeholder fields.
  const {token,receipt_reference,...publicLinkage}=row.receipt.linkage;
  receipt={status:env.record.receivedAt<=q.assessmentAt?'AVAILABLE_BY_ASSESSMENT':'NOT_RECEIVED_BY_ASSESSMENT',record:env.record,linkage:publicLinkage};
 }
 return freeze({observationId:jobId,queryContext:q.queryContext,observationState:q.queryContext==='historical'?'historical-accepted':'accepted',
  provider:m.product.provider,dataset:m.product.dataset,product:m.product,manifestReference:row.chain.context.job.manifestReference,region:m.region,
  cell:{key:cell.key,indices:cell.indices,coordinates:cell.coordinates,gridReference:m.gridReference,samplingReference:m.samplingReference},
  observationWindow:index.observation_window,observationTime,providerSelectedTime:index.timestamps.selectedProviderTime,
  acquisition:{requestedAt:index.timestamps.requestedAt,receivedAt:index.timestamps.receivedAt,normalizedAt:index.timestamps.normalizedAt},
  acceptance:{retainedAt:index.timestamps.retainedAt,acceptedAt:index.timestamps.acceptedAt},timestamps:index.timestamps,
  age:{milliseconds:ageMs,hours:ageMs/3600000,assessedAt:q.assessmentAt,basis:'SOURCE_OBSERVATION_TIME'},freshnessState,liveAuthorityState,withinLiveAge,
  dataState,quality:{sourceAvailability,componentsAvailable,completeVectorAvailable,speedDerivationFailed:point.speedDerivationFailed,consumerUsability:'REQUIRES_CONSUMER_REQUIRED_GROUPS'},
  evidence:{reference:index.evidence_reference,captureText:accepted.record.captureText,point},rawResponseReference:index.response_reference,
  execution:{attemptId:e.attemptId,digest:index.execution_digest,attemptNumber:e.attemptNumber,fencingToken:e.fencingToken,finishedAt:e.finishedAt},
  binding:{digest:index.binding_digest,activationDigest:accepted.record.binding.activationDigest},sourceMetadata:index.source_metadata,
  provenance:{acceptedChain:'VERIFIED_EXACT_IMMUTABLE_CHAIN',sourceAuthority:capture.sourceAuthority,receipt},
  currentLive:q.queryContext==='live'&&liveAuthorityState==='eligible'});
}

// One bounded SELECT; no acquisition, writes, receipt enabling, cache or identity minting.
// Trusted internal query port only. Future publishers consume this contract.
export function createOceanStateReader({query,clock={now:()=>new Date().toISOString()}}){
 check(typeof query==='function','reader-query-port');
 check(typeof clock?.now==='function','reader-clock-port');
 return Object.freeze({async read(input){
  let q;try{q=request(input,clock);}catch{return freeze({contractVersion:OCEAN_STATE_READER,status:'INVALID_QUERY',observations:[]});}
  let value;try{value=(await query('SELECT cp07.read_scope($1,$2,$3,$4,$5,$6) AS value',[q.scope.manifestDigest,q.scope.cellKey,q.assessmentAt,q.sourceTime.from,q.sourceTime.until,q.maxObservations])).rows[0].value;}
  catch{return freeze({contractVersion:OCEAN_STATE_READER,status:'READ_UNAVAILABLE',observations:[]});}
  try{
   if(value===null)return freeze({contractVersion:OCEAN_STATE_READER,status:'UNKNOWN_SCOPE',observations:[]});
   keys(value,['manifest','cell','observations','hasMore']);const m=validateManifest(value.manifest),cell=value.cell;
   check(m.digest===q.scope.manifestDigest&&same(m.region,q.scope.region),'reader-region');
   check(same({family:m.product.family,provider:m.product.provider,dataset:m.product.dataset,productId:m.product.productId},q.scope.product),'reader-product');
   check(same(m.sampling.cells.find(c=>c.key===q.scope.cellKey),cell),'reader-cell');
   check(Array.isArray(value.observations)&&value.observations.length<=q.maxObservations&&typeof value.hasMore==='boolean','reader-page');
   const observations=value.observations.map(row=>observation(q,m,cell,row));
   check(new Set(observations.map(o=>o.observationId)).size===observations.length,'reader-duplicate');
   for(let i=1;i<observations.length;i++)check(observations[i].observationTime<=observations[i-1].observationTime,'reader-source-order');
   return freeze({contractVersion:OCEAN_STATE_READER,status:observations.length?'OK':'MISSING',scope:q.scope,queryContext:q.queryContext,assessmentAt:q.assessmentAt,readAt:q.readAt,
    policy:CURRENTS_READER_POLICY,observations,hasMore:value.hasMore,missingReason:observations.length?null:'NO_ACCEPTED_OBSERVATION_IN_SCOPE_AT_TARGET',
    acceptedNoDataSupport:'NOT_SUPPORTED_BY_QUALIFIED_CURRENTS_ACCEPTANCE',currentLiveAvailable:observations.some(o=>o.currentLive)});
  }catch{return freeze({contractVersion:OCEAN_STATE_READER,status:'INTEGRITY_FAILED',observations:[]});}
 }});
}
