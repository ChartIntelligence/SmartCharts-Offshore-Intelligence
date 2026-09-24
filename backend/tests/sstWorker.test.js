// Network-free: retained bytes and explicitly synthetic mutations in memory only.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {decodeNetcdf} from '../oceanState/noaaNetcdf.mjs';
import {PRODUCT, DATASET, QUALIFICATION_DIGEST, candidateOf, candidateKey, discoveryManifest, parseDiscovery,
  acquisitionManifest, acquireBounded, sha256, digest, normalizeNoaaSst, validateDecoded} from '../oceanState/noaaSstSource.mjs';
import {createSstWorkerV1, compareCandidate, freshnessInputs, completeFrameDomain, revisionRelationship} from '../oceanState/sstWorker.mjs';
import {writeOceanArchiveV1, readOceanArchiveV1, oceanArchiveIdentityV1} from '../../shared/oceanProductArchive.mjs';
const bytes = readFileSync(new URL('../../.local/ocean-quarantine/sst/noaa-geo-polar/task11d-20260922T120000Z-gulf/source.nc', import.meta.url));
const decoded = decodeNetcdf(bytes);
const candidate = candidateOf({product: PRODUCT, dataset: DATASET, nominalTime: '2026-09-22T12:00:00Z', revision: null});
const clock = {iterationId:'test-iteration', discoveredAt:'2026-09-24T16:00:00Z', acquiredAt:'2026-09-24T16:01:00Z',
  processedAt:'2026-09-24T16:02:00Z', assessedAt:'2026-09-24T16:03:00Z'};
const timeBody = c => Buffer.from(JSON.stringify({table:{columnNames:['time'],columnTypes:['String'],columnUnits:['UTC'],rows:c ? [[c.nominalTime]] : []}}));
function setup({body=bytes, advertised=candidate, admissible=false}={}) {
  const ledger=new Map(), records=new Map(), rawRecords=new Map(); let snapshot={version:0,value:null}, requests=0, discoveries=0;
  const clone = v => structuredClone(v);
  const state={
    async readPointer(){return clone(snapshot);},
    async readCandidate(key){return clone(ledger.get(key) ?? null);},
    async claim(key,owner){if(ledger.has(key))return false;ledger.set(key,{status:'CLAIMED',owner});return true;},
    async complete(key,owner,accepted){if(ledger.get(key)?.owner!==owner)return false;ledger.set(key,{status:'COMPLETE',accepted:clone(accepted)});return true;},
    async compareAndSet(version,value){if(snapshot.version!==version)return {status:'CONFLICT'};snapshot={version:version+1,value:clone(value)};return {status:'UPDATED',durable:true,...clone(snapshot)};},
  };
  const archive={
    async createIfAbsent(id,record){const exists=records.has(id);if(!exists)records.set(id,clone(record));return {outcome:exists?'exists':'created',durable:true,record:clone(records.get(id))};},
    async readExact(id){return records.has(id)?{status:'found',durable:true,record:clone(records.get(id))}:{status:'not-found'};},
  };
  const raw={async retain(receipt,b){rawRecords.set(receipt.sha256,Buffer.from(b));return {durable:true,reference:receipt.reference,sha256:sha256(b),bodyBytes:b.length,receipt:clone(receipt)};}};
  const transport={
    async discover(manifest){discoveries++;assert.equal(manifest,discoveryManifest);return {bytes:timeBody(advertised),url:manifest.url,status:200,responseValidator:null,redirects:0,retries:0};},
    async open(manifest){requests++;let offset=0;return {status:200,finalUrl:manifest.url,encoding:'identity',redirects:0,retries:0,contentLength:body.length,complete:false,
      async readUpTo(n){if(offset===body.length){this.complete=true;return null;}const chunk=body.subarray(offset,offset+Math.min(n,65536));offset+=chunk.length;if(offset===body.length)this.complete=true;return chunk;},async close(){}};},
  };
  const authorize=async()=>({acquisitionAuthorized:true,qualificationDigest:QUALIFICATION_DIGEST});
  const assess=async({accepted,assessedAt})=>({status:admissible?'ADMISSIBLE':'THRESHOLD_DECISION_REQUIRED',policyId:admissible?'synthetic-test-admission-only-v1':null,evidenceReceiptDigest:accepted.receiptDigest,assessedAt});
  const ports={state,archive,raw,transport,authorize,assess};
  return {ports,ledger,records,rawRecords,run:i=>createSstWorkerV1(ports)(i??clock),requests:()=>requests,discoveries:()=>discoveries};
}
const discovery = c => ({status:c?'ADVERTISED':'NO_CANDIDATE',candidate:c});
const changed = (time, value) => {const b=Buffer.from(bytes);b.writeDoubleBE(Date.parse(time)/1000,decoded.variables.time.offset);if(value!==undefined){const i=decoded.variables.mask.values.indexOf(1);b.writeFloatBE(value,decoded.variables.analysed_sst.offset+i*4);}return b;};

test('discovery is pure, bounded, actual coordinate and no publication-time fabrication',()=>{
  const b=timeBody(candidate), r=parseDiscovery(b,{url:discoveryManifest.url,status:200,discoveredAt:clock.discoveredAt,responseValidator:'response-only'});
  assert.deepEqual(r.candidate,candidate);assert.equal(r.sha256,sha256(b));assert.equal(r.bodyBytes,b.length);
  assert.equal(r.providerPublishedAt,null);assert.equal(r.candidate.revision,null);assert.ok(Object.isFrozen(r));
});
test('no candidate; malformed/oversized/mirrored discovery fails closed',()=>{
  const args={url:discoveryManifest.url,status:200,discoveredAt:clock.discoveredAt,responseValidator:null};
  assert.equal(parseDiscovery(timeBody(null),args).status,'NO_CANDIDATE');
  for(const b of [Buffer.alloc(4097),Buffer.from('{}'),timeBody({...candidate,nominalTime:'yesterday'})])assert.throws(()=>parseDiscovery(b,args));
  assert.throws(()=>parseDiscovery(timeBody(candidate),{...args,url:'https://example.org'}));
});
test('candidate decisions preserve gaps, regression and uncertain revisions',()=>{
  const latest={candidate:{...candidate,revision:'r1'}};
  assert.equal(compareCandidate(null,discovery(candidate)),'NEW_CANDIDATE');
  assert.equal(compareCandidate(latest,discovery(latest.candidate)),'SAME_AS_QUALIFIED');
  assert.equal(compareCandidate(latest,discovery({...candidate,revision:'r2'})),'AMBIGUOUS_REVISION');
  assert.equal(compareCandidate({candidate},discovery(candidate)),'AMBIGUOUS_REVISION');
  assert.equal(compareCandidate(latest,discovery({...candidate,nominalTime:'2026-09-25T12:00:00Z'})),'NEW_CANDIDATE');
  assert.equal(compareCandidate(latest,discovery({...candidate,nominalTime:'2026-09-20T12:00:00Z'})),'SOURCE_REGRESSION');
  assert.equal(compareCandidate(latest,discovery(null)),'NO_CANDIDATE');
  assert.equal(compareCandidate(latest,{status:'DISCOVERY_FAILURE'}),'DISCOVERY_FAILURE');
});
test('source identity and private/unknown fields rejected',()=>{
  assert.throws(()=>candidateOf({...candidate,dataset:'other'}));assert.throws(()=>candidateOf({...candidate,email:'private'}));
  assert.throws(()=>candidateOf({...candidate,nominalTime:'2026-02-30T12:00:00Z'}));
});
test('manifest exact variables, geometry, returned-time selector; no arithmetic index',()=>{
  const m=acquisitionManifest(candidate);assert.deepEqual(m.variables,['analysed_sst','analysis_error','mask']);
  assert.deepEqual(m.bounds,[-98,18,-80,31]);assert.deepEqual(m.sourceBounds,[262,18,280,31]);
  assert.ok(decodeURI(m.url).includes(candidate.nominalTime));assert.equal(m.maxTransferBytes,4194304);assert.equal(m.retries,0);assert.equal(m.redirects,0);
});
test('bounded pull receipt and SHA; no value mutation',async()=>{
  const s=setup(), r=await acquireBounded(s.ports.transport,candidate,clock.acquiredAt);
  assert.deepEqual(r.bytes,bytes);assert.equal(r.receipt.sha256,'26fe69f0e376322fd2e81ecb9375e5737ede4134cbd9711608ee9c2e2253a843');
  assert.equal(r.receipt.bodyBytes,853144);assert.equal(r.receipt.providerPublishedAt,null);
});
test('oversized advertised body refused before reading',async()=>{
  let reads=0,closed=false;const t={open:async m=>({status:200,finalUrl:m.url,encoding:'identity',redirects:0,retries:0,contentLength:4194305,readUpTo(){reads++;},close(){closed=true;}})};
  await assert.rejects(()=>acquireBounded(t,candidate,clock.acquiredAt));assert.equal(reads,0);assert.equal(closed,true);
});
test('observed over-budget, incomplete body and redirect rejected',async()=>{
  for(const variant of ['chunk','incomplete','redirect']){
    const t={open:async m=>({status:200,finalUrl:variant==='redirect'?'https://other':m.url,encoding:'identity',redirects:0,retries:0,contentLength:null,complete:false,
      readUpTo:async()=>variant==='chunk'?Buffer.alloc(4194305):null,close:async()=>{}})};
    await assert.rejects(()=>acquireBounded(t,candidate,clock.acquiredAt));
  }
});
test('normalizer calls locked SST adapter, preserves numeric mask/error/CRS',async()=>{
  const s=setup(),a=await acquireBounded(s.ports.transport,candidate,clock.acquiredAt), before=sha256(a.bytes);
  const f=normalizeNoaaSst(a.bytes,a.receipt,candidate,QUALIFICATION_DIGEST);
  assert.equal(f.product.evidenceClass,'ANALYSIS');assert.equal(f.spatial.horizontalDatum,'WGS84');
  assert.equal(f.payload.components[1].unit,'K');assert.equal(f.payload.components[0].missing[0],'land');
  assert.equal(f.temporal.observationTime,null);assert.equal(f.temporal.providerPublishedAt,null);assert.equal(f.temporal.support.kind,'unknown');
  assert.equal(f.provenance.adapterId,'pelora-sst-product-adapter-v1');assert.equal(sha256(a.bytes),before);
  assert.deepEqual(normalizeNoaaSst(a.bytes,a.receipt,candidate,QUALIFICATION_DIGEST),f);
  const revisionCandidate={...candidate,revision:'synthetic-revision-2'};
  const revised=normalizeNoaaSst(a.bytes,{...a.receipt,candidate:revisionCandidate},revisionCandidate,QUALIFICATION_DIGEST);
  assert.notEqual(revised.frameId,f.frameId);assert.notEqual(oceanArchiveIdentityV1(revised).contentDigest,oceanArchiveIdentityV1(f).contentDigest);
  assert.throws(()=>normalizeNoaaSst(a.bytes,{...a.receipt,sha256:'0'.repeat(64)},candidate,QUALIFICATION_DIGEST));
  assert.throws(()=>normalizeNoaaSst(a.bytes,a.receipt,candidate,'unreviewed'));
});
for(const [name,mutate] of [
  ['SST string',n=>n.variables.analysed_sst.values[0]='300'],
  ['range drift',n=>n.variables.analysed_sst.attributes.valid_max=1000],
  ['mask mismatch',n=>n.variables.mask.values[1]=3],
  ['uncertainty alignment',n=>n.variables.analysis_error.values.pop()],
  ['axis drift',n=>n.variables.longitude.values[0]+=.01],
  ['unexpected time',n=>n.variables.time.values[0]+=86400],
  ['fill drift',n=>n.variables.analysed_sst.attributes._FillValue=-999],
  ['dimensions',n=>n.dimensions[1].length--],
])test(`validation rejects ${name}`,()=>{const n=structuredClone(decoded);mutate(n);assert.throws(()=>validateDecoded(n,candidate.nominalTime));});
test('threshold undecided archives but does not advance pointer; repeated iteration reuses archive',async()=>{
  const s=setup();const a=await s.run(),b=await s.run({...clock,iterationId:'again'});
  assert.equal(a.status,'THRESHOLD_DECISION_REQUIRED');assert.equal(b.status,a.status);assert.equal(s.requests(),1);
  assert.deepEqual(a.accepted,b.accepted);assert.equal((await s.ports.state.readPointer()).value,null);
});
test('explicit assessment permits CAS; same uncertain coordinate never reacquired',async()=>{
  const s=setup({admissible:true});const a=await s.run(),b=await s.run({...clock,iterationId:'later',assessedAt:'2026-09-24T20:03:00Z'});
  assert.equal(a.status,'POINTER_ADVANCED');assert.equal(b.status,'REVISION_REVIEW_REQUIRED');assert.equal(s.requests(),1);
  assert.equal(b.age.evidenceAgeHours-a.age.evidenceAgeHours,4);assert.deepEqual(b.lastQualified,a.lastQualified);
  // Two four-hour publication manifests may pin the identical exact receipt. No publication implementation.
  assert.equal({at:clock.assessedAt,sst:a.lastQualified.receiptDigest}.sst,{at:'2026-09-24T20:03:00Z',sst:b.lastQualified.receiptDigest}.sst);
  s.ports.transport.discover=async()=>({bytes:timeBody({...candidate,nominalTime:'2026-09-20T12:00:00Z'}),url:discoveryManifest.url,status:200,responseValidator:null,redirects:0,retries:0});
  assert.equal((await s.run()).status,'SOURCE_REGRESSION');assert.equal(s.requests(),1);
  s.ports.transport.discover=async()=>({bytes:timeBody(null),url:discoveryManifest.url,status:200,responseValidator:null,redirects:0,retries:0});
  const none=await s.run();assert.equal(none.status,'NO_CANDIDATE');assert.deepEqual(none.lastQualified,a.lastQualified);
});
test('no candidate/discovery failure preserves old pointer and reports increasing age',async()=>{
  const s=setup({admissible:true});const a=await s.run();s.ports.transport.discover=async()=>{throw Error('secret path');};
  const r=await s.run({...clock,assessedAt:'2026-09-25T16:03:00Z'});assert.equal(r.status,'DISCOVERY_FAILURE');
  assert.deepEqual(r.lastQualified,a.lastQualified);assert.equal(r.age.evidenceAgeHours-a.age.evidenceAgeHours,24);assert.ok(!JSON.stringify(r).includes('secret'));
});
test('unapproved acquisition/qualification causes no claim/download',async()=>{
  const s=setup();s.ports.authorize=async()=>({acquisitionAuthorized:false,qualificationDigest:QUALIFICATION_DIGEST});
  assert.equal((await s.run()).status,'QUALIFICATION_OR_ACQUISITION_APPROVAL_REQUIRED');assert.equal(s.requests(),0);assert.equal(s.ledger.size,0);
});
test('invalid normalization never advances; attempted download not automatically retried',async()=>{
  const s=setup({body:Buffer.from('not netcdf'),admissible:true});assert.equal((await s.run()).status,'VALIDATION_FAILED');
  assert.equal((await s.run()).status,'ACQUISITION_ALREADY_ATTEMPTED');assert.equal(s.requests(),1);assert.equal(s.records.size,0);
});
test('failed new candidate preserves old evidence',async()=>{
  const s=setup({admissible:true});const old=await s.run();const next={...candidate,nominalTime:'2026-09-23T12:00:00.000Z'};
  s.ports.transport.discover=async()=>({bytes:timeBody(next),url:discoveryManifest.url,status:200,responseValidator:null,redirects:0,retries:0});
  s.ports.transport.open=async()=>{throw Error('unavailable');};
  const r=await s.run();assert.equal(r.status,'ACQUISITION_FAILED');assert.deepEqual(r.lastQualified,old.lastQualified);
});
test('atomic claim suppresses equivalent racing acquisitions',async()=>{
  const s=setup({admissible:true});const r=await Promise.all([s.run(),s.run({...clock,iterationId:'other'})]);
  assert.equal(s.requests(),1);assert.equal(r.filter(x=>x.status==='POINTER_ADVANCED').length,1);
  assert.equal(r.filter(x=>x.status==='ACQUISITION_ALREADY_ATTEMPTED').length,1);
});
test('CAS conflict cannot claim advancement',async()=>{
  const s=setup({admissible:true});s.ports.state.compareAndSet=async()=>({status:'CONFLICT'});
  assert.equal((await s.run()).status,'POINTER_CONFLICT');assert.equal((await s.ports.state.readPointer()).value,null);
});
test('non-durable archive and raw acknowledgements fail closed',async()=>{
  const s=setup({admissible:true});const create=s.ports.archive.createIfAbsent;
  s.ports.archive.createIfAbsent=async(...args)=>({...await create(...args),durable:false});
  assert.equal((await s.run()).status,'ARCHIVE_WRITE_PENDING');assert.equal((await s.ports.state.readPointer()).value,null);
  const t=setup();t.ports.raw.retain=async()=>({durable:false});assert.equal((await t.run()).status,'WORKER_FAILED');
});
test('corrupt retained archive cannot advance pointer on retry',async()=>{
  const s=setup();await s.run();const record=[...s.records.values()][0];record.receipt.contentDigest='0'.repeat(64);
  assert.equal((await s.run()).status,'WORKER_FAILED');assert.equal(s.requests(),1);
});
test('archive identity idempotent; changed bytes preserve original revision',async()=>{
  const s=setup(),a=await acquireBounded(s.ports.transport,candidate,clock.acquiredAt),f=normalizeNoaaSst(a.bytes,a.receipt,candidate,QUALIFICATION_DIGEST);
  const intent={writeId:'test-write',archivedAt:clock.processedAt,storageReference:'test-only',sourceRevision:null,
    rawEvidence:[{reference:a.receipt.reference,sha256:a.receipt.sha256,availability:'retained'}]};
  const first=await writeOceanArchiveV1(s.ports.archive,f,intent),again=await writeOceanArchiveV1(s.ports.archive,f,intent);
  assert.equal(first.status,'ARCHIVED');assert.equal(again.duplicate,true);assert.deepEqual(first.receipt,again.receipt);
  const t=setup({body:changed(candidate.nominalTime,305)}),b=await acquireBounded(t.ports.transport,candidate,clock.acquiredAt);
  const g=normalizeNoaaSst(b.bytes,b.receipt,candidate,QUALIFICATION_DIGEST);
  const second=await writeOceanArchiveV1(s.ports.archive,g,{...intent,rawEvidence:[{reference:b.receipt.reference,sha256:b.receipt.sha256,availability:'retained'}]});
  assert.equal(second.status,'ARCHIVED');assert.notEqual(first.receipt.contentDigest,second.receipt.contentDigest);
  assert.equal((await readOceanArchiveV1(s.ports.archive,{archiveId:first.receipt.archiveId,frameId:null})).receipt.receiptDigest,first.receipt.receiptDigest);
  assert.equal(revisionRelationship({candidate,rawSha256:a.receipt.sha256,frameId:f.frameId},{candidate,rawSha256:b.receipt.sha256,frameId:g.frameId}).kind,'CHANGED_EVIDENCE_REVIEW_REQUIRED');
});
test('future synthetic time/temperature passes full validation without rewriting retained bytes',async()=>{
  const c={...candidate,nominalTime:'2026-09-23T12:00:00.000Z'},s=setup({advertised:c,body:changed(c.nominalTime,307),admissible:true});
  const r=await s.run();assert.equal(r.status,'POINTER_ADVANCED');assert.equal(r.lastQualified.candidate.nominalTime,c.nominalTime);
  assert.ok(r.lastQualified.presentation.domainF[1]>89);assert.equal(sha256(bytes),'26fe69f0e376322fd2e81ecb9375e5737ede4134cbd9711608ee9c2e2253a843');
});
test('full-frame domain hotter/cooler, missing, zero, exact source and immutable identity',async()=>{
  const s=setup(),a=await acquireBounded(s.ports.transport,candidate,clock.acquiredAt),f=normalizeNoaaSst(a.bytes,a.receipt,candidate,QUALIFICATION_DIGEST);
  const before=oceanArchiveIdentityV1(f);assert.deepEqual(completeFrameDomain(f).domainF,[82,89]);
  for(const [values,expected] of [[[299,308],[78,95]],[[290,295],[62,72]],[[0,300],[-460,81]]]){
    const testFrame={frameId:'synthetic-only',payload:{components:[{variableId:'analysed_sst',unit:'K',values:[...values,null],missing:[null,null,'land']}]}};
    assert.deepEqual(completeFrameDomain(testFrame).domainF,expected);
  }
  assert.deepEqual(oceanArchiveIdentityV1(f),before);assert.ok(Object.isFrozen(completeFrameDomain(f).domainK));
  assert.equal(digest(completeFrameDomain(f)),digest(completeFrameDomain(f))); // No viewport or clock argument exists.
});
test('freshness inputs retain publication unknown and unknown thresholds',()=>{
  const a=freshnessInputs(candidate,{discoveredAt:clock.discoveredAt,acquiredAt:clock.acquiredAt,assessedAt:clock.assessedAt});
  assert.equal(a.discoveryLagHours,52);assert.equal(a.freshness,'UNASSESSED');assert.equal(a.policyDecision,'THRESHOLD_DECISION_REQUIRED');
  assert.equal(a.providerPublicationLatencyHours,null);
});
test('future coordinates never trigger acquisition',async()=>{
  const s=setup({advertised:{...candidate,nominalTime:'2030-01-01T12:00:00Z'}});
  assert.equal((await s.run()).status,'DISCOVERY_FAILURE');assert.equal(s.requests(),0);
});
test('pointer CAS port serializes conflicting writes without a mutex',async()=>{
  const s=setup();const result=await Promise.all([s.ports.state.compareAndSet(0,{test:'a'}),s.ports.state.compareAndSet(0,{test:'b'})]);
  assert.deepEqual(result.map(r=>r.status),['UPDATED','CONFLICT']);assert.equal((await s.ports.state.readPointer()).version,1);
});
test('inherited port methods cannot enable worker',()=>{
  const s=setup();assert.throws(()=>createSstWorkerV1({...s.ports,state:Object.create(s.ports.state)}));
});
test('decoder rejects record/interleaved representation',()=>{
  const b=Buffer.from(bytes);b.writeUInt32BE(1,4);assert.throws(()=>decodeNetcdf(b));
});
test('worker output detached/immutable and no normal runtime import',async()=>{
  const s=setup({admissible:true}),r=await s.run();assert.throws(()=>{r.lastQualified.presentation.domainF[0]=0;});
  assert.throws(()=>{r.lastQualified.candidate.nominalTime='now';});
  for(const file of ['../server.js','../../frontend/src/App.jsx'])assert.ok(!readFileSync(new URL(file,import.meta.url),'utf8').includes('sstWorker'));
  for(const key of ['captainId','email','species','rank','confidence','catch'])assert.ok(!JSON.stringify(r).includes(`"${key}":`));
  await assert.rejects(()=>s.run({...clock,species:'none'}));
});

test('adversarial unknown or contradictory candidate state cannot become new',()=>{
  for(const d of [{status:'BROKEN',candidate},{status:'NO_CANDIDATE',candidate},{status:'ADVERTISED',candidate:null},{candidate}])
    assert.equal(compareCandidate(null,d),'DISCOVERY_FAILURE');
});
test('adversarial negative ages and submillisecond coordinate truncation fail',()=>{
  for(const key of ['assessedAt','discoveredAt','acquiredAt']){
    const t={discoveredAt:clock.discoveredAt,acquiredAt:clock.acquiredAt,assessedAt:clock.assessedAt};
    t[key]='2026-09-21T12:00:00Z';assert.throws(()=>freshnessInputs(candidate,t));
  }
  assert.throws(()=>candidateOf({...candidate,nominalTime:'2026-09-22T12:00:00.0000001Z'}));
});
test('adversarial inherited configuration and accessor authority rejected without executing getters',()=>{
  const s=setup();assert.throws(()=>createSstWorkerV1(Object.create(s.ports)));
  let calls=0;const p={...s.ports};Object.defineProperty(p,'authorize',{enumerable:true,get(){calls++;return s.ports.authorize;}});
  assert.throws(()=>createSstWorkerV1(p));assert.equal(calls,0);
});
test('adversarial discovery future and extra scientific fields rejected in pure parser',()=>{
  const r={url:discoveryManifest.url,status:200,discoveredAt:clock.discoveredAt,responseValidator:null};
  assert.throws(()=>parseDiscovery(timeBody({...candidate,nominalTime:'2030-01-01T00:00:00Z'}),r));
  const b=JSON.parse(timeBody(candidate));b.analysed_sst=[300];assert.throws(()=>parseDiscovery(Buffer.from(JSON.stringify(b)),r));
});
test('adversarial time and coordinate declarations required',()=>{
  for(const mutate of [n=>n.variables.latitude.attributes.units='radians',n=>n.variables.time.dimensions=[],n=>n.variables.longitude.dimensions=[1]]){
    const n=structuredClone(decoded);mutate(n);assert.throws(()=>validateDecoded(n,candidate.nominalTime));
  }
});
test('adversarial acquisition manifest exposes profile and body-budget authority',()=>{
  const m=acquisitionManifest(candidate);assert.equal(m.providerId,'NOAA-NESDIS-OSPO');
  assert.equal(m.qualification.digest,QUALIFICATION_DIGEST);assert.equal(m.qualification.version,'1');
  assert.equal(m.bodyAcceptanceCeiling,4194304);assert.equal(m.longitudeConvention,'0:360');
});
test('adversarial pointer must contain explicit admission and exact snapshot fields',async()=>{
  const s=setup({admissible:true});const original=await s.run();assert.equal(original.status,'POINTER_ADVANCED');
  const value=structuredClone(original.lastQualified);delete value.assessment;
  s.ports.state.readPointer=async()=>({version:1,value});
  assert.equal((await s.run()).status,'STATE_UNAVAILABLE');
  s.ports.state.readPointer=async()=>({version:0});
  assert.equal((await s.run()).status,'STATE_UNAVAILABLE');
});
test('adversarial corrupt readback before pointer advancement fails',async()=>{
  const s=setup({admissible:true});s.ports.archive.readExact=async()=>({status:'not-found'});
  const r=await s.run();assert.notEqual(r.status,'POINTER_ADVANCED');assert.equal((await s.ports.state.readPointer()).value,null);
});
test('adversarial discovery locator/status/coordinate matrix rejects substitution',()=>{
  const meta={url:discoveryManifest.url,status:200,discoveredAt:clock.discoveredAt,responseValidator:null};
  for(const url of [meta.url.replace('oceanwatch.pifsc.noaa.gov','example.org'),meta.url.replace(DATASET,'other'),`${meta.url},analysed_sst`,meta.url.replace('https:','http:')])
    assert.throws(()=>parseDiscovery(timeBody(candidate),{...meta,url}));
  for(const status of [301,302,307,500])assert.throws(()=>parseDiscovery(timeBody(candidate),{...meta,status}));
  for(const rows of [[[candidate.nominalTime],[candidate.nominalTime]],[['2026-09-23T12:00:00Z'],[candidate.nominalTime]],[['invalid']]]){
    const body=JSON.parse(timeBody(candidate));body.table.rows=rows;assert.throws(()=>parseDiscovery(Buffer.from(JSON.stringify(body)),meta));
  }
  assert.equal(parseDiscovery(timeBody(candidate),meta).candidate.nominalTime,candidate.nominalTime);
});
test('adversarial authorization response matrix never acquires',async()=>{
  for(const make of [()=>Object.create({acquisitionAuthorized:true,qualificationDigest:QUALIFICATION_DIGEST}),
    ()=>({get acquisitionAuthorized(){throw Error('getter');},qualificationDigest:QUALIFICATION_DIGEST}),
    ()=>({acquisitionAuthorized:'true',qualificationDigest:QUALIFICATION_DIGEST}),()=>null,
    ()=>discovery(candidate),()=>({acquisitionAuthorized:true,qualificationDigest:'unreviewed'})]){
    const s=setup();s.ports.authorize=async()=>make();const r=await s.run();assert.notEqual(r.status,'POINTER_ADVANCED');assert.equal(s.requests(),0);assert.equal(s.ledger.size,0);
  }
  const s=setup();for(const authorize of [true,'true',null,{}])assert.throws(()=>createSstWorkerV1({...s.ports,authorize}));
});
test('adversarial claim failure and held claim suppress acquisition',async()=>{
  for(const claim of [async()=>false,async()=>{throw Error('claim failed');}]){
    const s=setup();s.ports.state.claim=claim;assert.notEqual((await s.run()).status,'POINTER_ADVANCED');assert.equal(s.requests(),0);
  }
  const s=setup();await s.ports.state.claim(candidateKey(candidate),'crashed-owner');
  assert.equal((await s.run()).status,'ACQUISITION_ALREADY_ATTEMPTED');assert.equal(s.requests(),0);
});
test('adversarial UTC leap boundary and equal ages have no freshness inference',()=>{
  const c={...candidate,nominalTime:'2024-02-29T23:00:00Z'};
  const equal=freshnessInputs(c,{discoveredAt:c.nominalTime,acquiredAt:c.nominalTime,assessedAt:c.nominalTime});
  assert.equal(equal.evidenceAgeHours,0);assert.equal(equal.discoveryLagHours,0);assert.equal(equal.acquisitionLagHours,0);
  const later=freshnessInputs(c,{discoveredAt:'2024-03-01T00:00:00Z',acquiredAt:'2024-03-01T01:00:00Z',assessedAt:'2024-03-01T03:00:00Z'});
  assert.deepEqual([later.discoveryLagHours,later.acquisitionLagHours,later.evidenceAgeHours],[1,2,4]);
  for(const assessedAt of ['2025-02-29T00:00:00Z','now','2024-03-01T00:00:00-05:00',null])assert.throws(()=>freshnessInputs(c,{discoveredAt:null,acquiredAt:null,assessedAt}));
});
test('adversarial NetCDF truncation, unsupported version/endian and huge dimensions',()=>{
  for(const length of [0,3,7,20,64,decoded.variables.time.offset-1,bytes.length-1])assert.throws(()=>decodeNetcdf(bytes.subarray(0,length)));
  for(const version of [0,3,5,255]){const b=Buffer.from(bytes);b[3]=version;assert.throws(()=>decodeNetcdf(b));}
  const endian=Buffer.from(bytes);endian.writeUInt32LE(10,8);assert.throws(()=>decodeNetcdf(endian));
  const huge=Buffer.from(bytes);const name=huge.indexOf(Buffer.from('latitude'));huge.writeUInt32BE(0xffffffff,name+8);assert.throws(()=>decodeNetcdf(huge));
});
test('adversarial NetCDF wrong offsets, duplicate variables and wrong type',()=>{
  // Locate inspected declaration names with length prefixes, not scientific payload.
  const declaration=name=>{const prefix=Buffer.alloc(4);prefix.writeUInt32BE(name.length);return bytes.indexOf(Buffer.concat([prefix,Buffer.from(name)]));};
  const time=declaration('time'), lat=declaration('latitude');assert.ok(time>=0&&lat>=0);
  // Find all exact declarations; final occurrence is the variable rather than dimension.
  const prefix=Buffer.alloc(4);prefix.writeUInt32BE(4);const needle=Buffer.concat([prefix,Buffer.from('time')]);const variable=bytes.lastIndexOf(needle,decoded.variables.time.offset-1);
  assert.ok(variable>time);
  const offsetNeedle=Buffer.alloc(4);offsetNeedle.writeUInt32BE(decoded.variables.time.offset);
  const offsetField=bytes.indexOf(offsetNeedle,variable);assert.ok(offsetField>variable&&offsetField<decoded.variables.time.offset);
  for(const offset of [0,bytes.length+4]){const b=Buffer.from(bytes);b.writeUInt32BE(offset,offsetField);assert.throws(()=>decodeNetcdf(b));}
  const wrongType=Buffer.from(bytes);wrongType.writeUInt32BE(99,offsetField-8);assert.throws(()=>decodeNetcdf(wrongType));
  // Two same-width declarations become duplicates while their scientific values stay untouched.
  const dup=Buffer.from(bytes);const maskPrefix=Buffer.alloc(4);maskPrefix.writeUInt32BE(4);const maskName=bytes.lastIndexOf(Buffer.concat([maskPrefix,Buffer.from('mask')]),decoded.variables.time.offset-1);
  assert.ok(maskName>0);dup.write('time',maskName+4,'ascii');assert.throws(()=>decodeNetcdf(dup));
});
test('adversarial scientific NaN/Infinity, missing/extra variable and wrong shape fail',()=>{
  for(const mutate of [n=>delete n.variables.mask,n=>n.variables.extra=n.variables.mask,
    n=>n.variables.analysed_sst.type=6,n=>n.variables.analysed_sst.dimensions=[0,2,1],
    n=>n.variables.analysed_sst.values[1]=NaN,n=>n.variables.analysis_error.values[1]=Infinity,
    n=>n.variables.mask.values[1]=0,n=>n.variables.mask.values[1]=4]){
    const n=structuredClone(decoded);mutate(n);assert.throws(()=>validateDecoded(n,candidate.nominalTime));
  }
});
test('adversarial archive acknowledgements cannot advance pointer',async()=>{
  for(const [name,mutate] of [['missing',()=>null],['false',()=>false],['wrong-id',a=>({...a,record:{...a.record,receipt:{...a.record.receipt,archiveId:'opf-'+'0'.repeat(64)}}})],
    ['wrong-digest',a=>({...a,record:{...a.record,receipt:{...a.record.receipt,receiptDigest:'0'.repeat(64)}}})],
    ['wrong-frame',a=>({...a,record:{...a.record,frameJson:a.record.frameJson.replace('noaa-geo-polar-gulf','other-frame')}})],
    ['throw',()=>{throw Error('storage failure');}]]){
    const s=setup({admissible:true}),create=s.ports.archive.createIfAbsent;s.ports.archive.createIfAbsent=async(...args)=>mutate(await create(...args));
    const r=await s.run();assert.notEqual(r.status,'POINTER_ADVANCED',name);assert.equal((await s.ports.state.readPointer()).value,null,name);
  }
});
test('adversarial CAS acknowledgements and admission mismatch never claim success',async()=>{
  const s=setup();const first=await s.run();assert.equal(first.status,'THRESHOLD_DECISION_REQUIRED');
  s.ports.assess=async({accepted,assessedAt})=>({status:'ADMISSIBLE',policyId:'synthetic-test-only',evidenceReceiptDigest:accepted.receiptDigest,assessedAt});
  for(const ack of [null,false,{status:'UPDATED',durable:false,version:1,value:first.accepted},{status:'UPDATED',durable:true,version:99,value:first.accepted},{status:'CONFLICT'}]){
    s.ports.state.compareAndSet=async()=>ack;assert.notEqual((await s.run()).status,'POINTER_ADVANCED');
  }
  s.ports.assess=async({assessedAt})=>({status:'ADMISSIBLE',policyId:'synthetic-test-only',evidenceReceiptDigest:'0'.repeat(64),assessedAt});
  assert.equal((await s.run()).status,'WORKER_FAILED');assert.equal(s.requests(),1);
});
test('adversarial three four-hour cycles and failures retain exact old evidence',async()=>{
  const s=setup({admissible:true});const original=await s.run(), ids=[];
  for(const assessedAt of ['2026-09-24T16:03:00Z','2026-09-24T20:03:00Z','2026-09-25T00:03:00Z']){
    const r=await s.run({...clock,assessedAt});ids.push(r.lastQualified.receiptDigest);
    assert.equal(r.lastQualified.candidate.nominalTime,candidate.nominalTime);
    assert.equal(r.age.evidenceAgeHours,(Date.parse(assessedAt)-Date.parse(candidate.nominalTime))/3600000);
  }
  assert.deepEqual(ids,Array(3).fill(original.lastQualified.receiptDigest));assert.equal(s.requests(),1);assert.equal(s.records.size,1);
  const originalDiscover=s.ports.transport.discover;
  for(const discover of [async()=>{throw Error('private internal path');},async()=>({...await originalDiscover(),url:'https://other'}),async()=>({...await originalDiscover(),bytes:Buffer.from('{}')})]){
    s.ports.transport.discover=discover;const r=await s.run({...clock,assessedAt:'2026-09-25T00:03:00Z'});
    assert.deepEqual(r.lastQualified,original.lastQualified);assert.equal(r.age.evidenceAgeHours,60.05);assert.equal(r.status,'DISCOVERY_FAILURE');
  }
  const before=await s.run({iterationId:'before-evidence',discoveredAt:'2026-09-21T00:00:00Z',acquiredAt:'2026-09-21T00:00:00Z',processedAt:'2026-09-21T00:00:00Z',assessedAt:'2026-09-21T00:00:00Z'});
  assert.equal(before.status,'INVALID_ASSESSMENT_TIME');assert.equal(before.age,null);assert.deepEqual(before.lastQualified,original.lastQualified);
});
test('adversarial reported transport retry/redirect cannot be silently accepted',async()=>{
  const s=setup(),open=s.ports.transport.open;
  s.ports.transport.open=async m=>({...await open(m),retries:1,redirects:0});
  await assert.rejects(()=>acquireBounded(s.ports.transport,candidate,clock.acquiredAt));
});
test('adversarial discovery transport redirect never reaches acquisition',async()=>{
  const s=setup(),discover=s.ports.transport.discover;let opened=0;
  s.ports.transport.discover=async()=>({...await discover(discoveryManifest),redirects:1,retries:0});
  s.ports.transport.open=async()=>{opened++;throw Error('must not acquire');};
  assert.equal((await s.run()).status,'DISCOVERY_FAILURE');assert.equal(opened,0);
});
