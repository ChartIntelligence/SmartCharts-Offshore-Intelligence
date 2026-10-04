import {digest} from '../../observe/canonical.mjs';
import {MANIFEST, createManifest, gridReference, samplingReference, manifestReference} from '../../observe/manifest.mjs';
import {ACTIVATION, createActivation} from '../../observe/activation.mjs';
import {EXECUTION, createExecution, attemptIdFor} from '../../observe/provenance.mjs';
import {createJob} from '../../observe/jobs.mjs';
import {encodeNormalizedCurrentHandoff} from '../../normalizedEvidenceCapture.mjs';
import {SOURCE_NORMALIZATION_VERSION} from '../../sourceNormalization.mjs';

export const ref = name => ({id:name,version:'fixture-v1',sha256:digest('synthetic-observe-reference',name)});
export const time = (hour = 0, minute = 0, ms = 0) => new Date(Date.UTC(2026,9,1,hour,minute,0,ms)).toISOString();
export function manifestBody(region = 'synthetic-gulf') {
  const latitude = region === 'synthetic-gulf' ? 25 : 35;
  const grid = {id:'synthetic-native-grid',version:'v1',revision:null,
    coordinateConvention:'WGS84_LAT_LON_DEGREES_LON_NEG180_INCLUSIVE_POS180_EXCLUSIVE',
    originMicrodegrees:{latitude:latitude*1e6,longitude:-90000000},stepMicrodegrees:{latitude:250000,longitude:250000},dimensions:{latitude:3,longitude:3}};
  const sampling = {id:'synthetic-samples',version:'v1',inclusionRule:'EXPLICIT_NATIVE_CELLS_V1',cells:[
    {key:'cell-a',indices:{latitude:0,longitude:0},coordinates:{latitude,longitude:-90}},
    {key:'cell-b',indices:{latitude:1,longitude:0},coordinates:{latitude:latitude+0.25,longitude:-90}}
  ]};
  return {contractVersion:MANIFEST,id:'observe-'+region,version:'v1',region:{id:region,version:'v1'},
    product:{family:'CURRENTS',provider:'NOAA CoastWatch',dataset:'noaacwBLENDEDNRTcurrentsDaily',productId:'synthetic-currents',adapter:ref('synthetic-adapter')},
    grid,gridReference:gridReference(grid),sampling,samplingReference:samplingReference(sampling,grid),
    coverage:{coverageReference:ref(region+'-coverage'),maskReference:ref(region+'-mask')},
    schedule:{anchor:time(),intervalMs:3600000,permittedExecutionDelayMs:5400000,deadlineMs:7200000,catchUpMaxWindows:3,catchUpMaxAgeMs:7200000},
    providerTime:{policyReference:ref('synthetic-provider-time'),expectedPublicationLagMs:86400000,maxWaitMs:60000},
    limits:{maxCells:10,maxJobsPerPlan:100,maxRequestBytes:4096,maxResponseBytes:2097152,requestTimeoutMs:20000,concurrency:2,queueCapacity:100,rateLimit:{requests:10,periodMs:60000}},
    retry:{retryableFailures:['PROVIDER_TIMEOUT','PROVIDER_UNAVAILABLE'],maxAttempts:3,initialBackoffMs:1000,maxBackoffMs:10000},
    effectiveFrom:time(),effectiveUntil:time(24)};
}
export function fixture(region = 'synthetic-gulf', change = () => {}) {
  const raw = manifestBody(region); change(raw);
  const manifest = createManifest(raw);
  const activation = createActivation({contractVersion:ACTIVATION,manifestReference:manifestReference(manifest),revision:1,state:'ENABLED',approvedAt:time(0,0,-1),effectiveAt:time(),stoppedAt:null});
  const trustedState = {approvedManifestReference:manifestReference(manifest),activationDigest:activation.digest,activationRevision:activation.revision};
  return {manifest,activation,trustedState};
}
export function plannerInput(f = fixture(), asOf = time(1)) { return {...f,range:{from:time(),until:time(24)},asOf}; }
export function executionFixture() {
  const f = fixture(), job = createJob(f.manifest,'cell-a',time());
  const point = {requestedLatitude:25,requestedLongitude:-90,resolvedLatitude:25,resolvedLongitude:-90,
    observedAt:time(),speedKnots:1,directionDegrees:90,eastwardMetersPerSecond:0.5,northwardMetersPerSecond:0,
    source:{provider:'NOAA CoastWatch',dataset:'noaacwBLENDEDNRTcurrentsDaily',variables:['u_current','v_current'],units:'m/s',classification:'altimetry-derived-geostrophic-current',directionConvention:'degrees-toward',availability:'available'}};
  const handoff = encodeNormalizedCurrentHandoff(point,SOURCE_NORMALIZATION_VERSION);
  const context = {...f,job};
  const input = {contractVersion:EXECUTION,jobId:job.jobId,manifestDigest:f.manifest.digest,cellKey:job.cellKey,
    attemptId:attemptIdFor(job.jobId,1,1),attemptNumber:1,fencingToken:1,startedAt:time(0,1),finishedAt:time(0,1,3000),
    outcome:'NORMALIZED',failure:null,normalizationVersion:SOURCE_NORMALIZATION_VERSION,evidenceReference:handoff.reference,
    acquisition:{requestedAt:time(0,1,1000),receivedAt:time(0,1,2000),normalizedAt:time(0,1,3000),
      request:{provider:f.manifest.product.provider,dataset:f.manifest.product.dataset,adapter:f.manifest.product.adapter,gridReference:f.manifest.gridReference,
        indices:job.cell.indices,coordinates:job.cell.coordinates,selectedProviderTime:time()},
      response:{provider:f.manifest.product.provider,dataset:f.manifest.product.dataset,gridReference:f.manifest.gridReference,coordinates:job.cell.coordinates,observationTime:time()},
      retainedResponseReference:ref('synthetic-response')}};
  return {context,input:structuredClone(input),captureText:handoff.captureText,execution:createExecution(context,input,handoff.captureText)};
}
