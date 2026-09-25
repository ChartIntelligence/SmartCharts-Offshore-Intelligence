import test from 'node:test';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import * as exact from '../currentEvidenceCaptureV2.mjs';
import * as old from '../currentEvidenceCapture.mjs';
import {captureFixture,ref} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {signedZeroProducer,assembleReplayedSst} from './fixtures/exactCurrentEvidenceFixture.mjs';
import {compareCandidateScientificSurfacesV2 as compareV2} from '../candidateSemanticProjectionV2.mjs';
import {compareCandidateScientificSurfacesV1 as compareV1} from '../candidateSemanticProjection.mjs';
import {publication,frame} from './fixtures/temporalEvidenceFixture.mjs';
import {freezeEvidenceV1,publicationV3,validatePublicationV3,reference,canonical} from '../../shared/oceanPublication.mjs';
import {oceanArchiveIdentityV1} from '../../shared/oceanProductArchive.mjs';

const {captureCurrentEvidenceV2:capture,validateCurrentEvidenceCaptureV2:validate,serializeCurrentEvidenceCaptureV2:serialize,
  readCurrentEvidenceCaptureV2:read,replayCurrentEvidenceSourceV2:replay,currentCaptureReferenceV2:referenceV2,validateCurrentCaptureReferenceV2:verifyReference}=exact;
const source = value => {const p=captureFixture();p.samples[0].point.temperatureCelsius=value;return p;};
const value = c => replay(c).samples[0].point.temperatureCelsius;
const reverse = x => Array.isArray(x)?x.map(reverse):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).reverse().map(k=>[k,reverse(x[k])])):x;
const hash = text => createHash('sha256').update(text,'utf8').digest('hex');

for(const n of [0,-0,1,-1,0.1,-0.1,Math.PI,1e-7,1e21,Number.MIN_VALUE,-Number.MIN_VALUE,Number.MAX_VALUE,-Number.MAX_VALUE,Number.MIN_SAFE_INTEGER,Number.MAX_SAFE_INTEGER,Number((-0.00001).toFixed(4)),JSON.parse('1e-100')])test('finite numeric exact round trip '+(Object.is(n,-0)?'-0':n),()=>{
  const c=capture(source(n)),r=read(serialize(c));assert(Object.is(value(r),n));assert.equal(serialize(r),serialize(c));
});

test('zero-only difference changes bytes, scientific digest, capture ID and reference digest',()=>{
  const a=capture(source(-0)),b=capture(source(0));
  assert.notEqual(serialize(a),serialize(b));assert.notEqual(a.scientificContentDigest,b.scientificContentDigest);assert.notEqual(a.captureId,b.captureId);
  assert.notEqual(referenceV2(a).referenceId,referenceV2(b).referenceId);assert.notEqual(referenceV2(a).sha256,referenceV2(b).sha256);
  assert.equal(compareV1({sst:{temperatureCelsius:value(read(serialize(a)))}},{sst:{temperatureCelsius:-0}}).classification,'EXACT_MATCH');
  assert.equal(compareV2({sst:{temperatureCelsius:value(a)}},{sst:{temperatureCelsius:value(b)}}).classification,'MISMATCH');
});

test('digest is explicit domain/version/purpose-bound, not historical JSON hashing',()=>{
  const c=capture(source(-0));
  // Independent fixed canonical preimage for this one digest. No alternate scientific formula.
  const content=serialize(c);assert(content.includes('"temperatureCelsius":-0'));
  assert.equal(c.serializationVersion,exact.EXACT_SCIENTIFIC_JSON_V1);assert.equal(c.digestVersion,exact.EXACT_SCIENTIFIC_DIGEST_V1);
  assert.notEqual(c.scientificContentDigest,hash(canonical({family:c.family,samples:c.samples})));
  const preimage=canonical({digestVersion:exact.EXACT_SCIENTIFIC_DIGEST_V1,serializationVersion:exact.EXACT_SCIENTIFIC_JSON_V1,
    captureVersion:exact.CURRENT_EVIDENCE_CAPTURE_V2,purpose:'scientific-content',content:{family:c.family,samples:c.samples}})
    .replace('"temperatureCelsius":0','"temperatureCelsius":-0');
  assert.equal(c.scientificContentDigest,hash(preimage));
  assert.notEqual(c.captureId.slice(5),c.scientificContentDigest);assert.notEqual(referenceV2(c).sha256,c.scientificContentDigest);
});

test('historical namespace and behavior coexist; neither validator upgrades records',()=>{
  for(const n of [-0,0,1]){const p=source(n),v1=old.captureCurrentEvidenceV1(p),v2=capture(p);
    assert.notEqual(v1.captureId,v2.captureId);assert.notEqual(v1.scientificContentDigest,v2.scientificContentDigest);
    assert.throws(()=>validate(v1));assert.throws(()=>old.validateCurrentEvidenceCaptureV1(v2));assert.throws(()=>read(old.serializeCurrentEvidenceCaptureV1(v1)));assert.throws(()=>old.readCurrentEvidenceCaptureV1(serialize(v2)));}
  const a=old.captureCurrentEvidenceV1(source(-0)),b=old.captureCurrentEvidenceV1(source(0));assert.equal(a.captureId,b.captureId);
  assert(Object.is(old.replayCurrentEvidenceSourceV1(old.readCurrentEvidenceCaptureV1(old.serializeCurrentEvidenceCaptureV1(a))).samples[0].point.temperatureCelsius,0));
});

test('object-key order stable; sample/lineage array order and duplicates meaningful',()=>{
  const p=source(-0);p.samples.push({...structuredClone(p.samples[0]),role:'north'});p.lineageReferences.push(ref('second-source'));
  const a=capture(p);assert.equal(serialize(a),serialize(capture(reverse(p))));
  const q=structuredClone(p);q.samples.reverse();assert.notEqual(capture(q).scientificContentDigest,a.scientificContentDigest);
  q.samples.reverse();q.lineageReferences.reverse();assert.notEqual(capture(q).captureId,a.captureId);assert.equal(capture(q).scientificContentDigest,a.scientificContentDigest);
  q.lineageReferences.push(q.lineageReferences[0]);assert.notEqual(capture(q).captureId,a.captureId);
});

test('nested source coordinates and arrays preserve zero sign without a generic-object API',()=>{
  const p=source(-0);p.samples[0].point.requestedLatitude=-0;p.samples[0].point.providerCoordinates.resolvedLongitude=-0;
  p.samples.push({...structuredClone(p.samples[0]),role:'north'});const r=replay(read(serialize(capture(p))));
  assert(Object.is(r.samples[0].point.requestedLatitude,-0));assert(Object.is(r.samples[1].point.providerCoordinates.resolvedLongitude,-0));
  assert.throws(()=>capture({payload:{arbitrary:-0}}));assert.throws(()=>capture({...p,operationalCounter:-0}));
});

for(const family of ['WIND','WAVES','SWELL','BATHYMETRY'])test('unreviewed family does not acquire exact numeric authority '+family,()=>{
  const p=source(-0);p.family=family;assert.throws(()=>capture(p));
});
test('quality/static/operational objects cannot be smuggled into the current-source schema',()=>{
  for(const field of ['quality','bathymetry','staticContext','httpMetadata']){const p=source(-0);p.samples[0].point[field]={value:-0};assert.throws(()=>capture(p));}
});

test('vector and chlorophyll source fields share schema-bound exact encoding; no candidate reconstruction',()=>{
  for(const [family,key] of [['CURRENTS','eastwardMetersPerSecond'],['CURRENTS','northwardMetersPerSecond'],['CHLOROPHYLL_DIRECT','concentrationMgM3'],['CHLOROPHYLL_GAP_FILLED','concentrationMgM3']]){
    const p=captureFixture(family);p.samples[0].point[key]=-0;assert(Object.is(replay(read(serialize(capture(p)))).samples[0].point[key],-0));}
});

test('null, required missing, optional absent and finite zero are not conflated',()=>{
  const p=source(null);p.samples[0].point.temperatureFahrenheit=null;p.samples[0].point.source.availability='unavailable';
  const n=capture(p);assert.equal(value(read(serialize(n))),null);assert.notEqual(n.scientificContentDigest,capture(source(-0)).scientificContentDigest);
  delete p.samples[0].point.temperatureCelsius;assert.throws(()=>capture(p));
  const a=source(0),b=source(0);delete a.samples[0].point.timestampProvenance;b.samples[0].point.timestampProvenance=null;
  assert.notEqual(capture(a).scientificContentDigest,capture(b).scientificContentDigest);assert(!Object.hasOwn(replay(read(serialize(capture(a)))).samples[0].point,'timestampProvenance'));
});

for(const [name,mutate] of [
 ['minus to plus',x=>x.samples[0].point.temperatureCelsius=0],['ordinary numeric',x=>x.samples[0].point.temperatureFahrenheit=99],
 ['nested',x=>x.samples[0].point.providerCoordinates.resolvedLatitude=1],['missing',x=>delete x.samples[0].point.temperatureCelsius],
 ['wrong version',x=>x.contractVersion=old.CURRENT_EVIDENCE_CAPTURE_V1],['serializer version',x=>x.serializationVersion='pelora-exact-scientific-json-v2'],
 ['digest version',x=>x.digestVersion='future-v99'],['digest',x=>x.scientificContentDigest='0'.repeat(64)],['identity',x=>x.captureId='cec2-'+ '0'.repeat(64)],
 ['array',x=>x.samples.push({...x.samples[0],role:'east'})],['unknown',x=>x.samples[0].point.unknownScience=0],
 ['tag',x=>x.samples[0].point.temperatureCelsius={type:'number',value:'-0'}],['string',x=>x.samples[0].point.temperatureCelsius='-0']
])test('validation rejects '+name,()=>{const x=structuredClone(capture(source(-0)));mutate(x);assert.throws(()=>validate(x));});
test('plus to minus substitution rejected',()=>{const x=structuredClone(capture(source(0)));x.samples[0].point.temperatureCelsius=-0;assert.throws(()=>validate(x));});

for(const n of [NaN,Infinity,-Infinity,undefined,1n,()=>-0,Symbol('number')])test('unsupported value rejected '+String(n),()=>assert.throws(()=>capture(source(n))));

for(const spelling of ['0','-0.0','-0e0','0e0','1e-9999','1e9999','NaN','Infinity','-Infinity','"-0"','{"type":"number","value":"-0"}','[-0]','null'])test('wire number tamper rejected '+spelling,()=>{
  const text=serialize(capture(source(-0))).replace('"temperatureCelsius":-0','"temperatureCelsius":'+spelling);assert.throws(()=>read(text));
});

test('noncanonical JSON, duplicate keys and version ambiguity rejected',()=>{
  const s=serialize(capture(source(-0)));
  for(const t of [' '+s,s+'\n',s.replace('"temperatureCelsius":-0','"temperatureCelsius":-0,"temperatureCelsius":-0'),s.replace('"family":"SST"','"family":"SST","family":"SST"'),s.replace('"temperatureCelsius":-0','"temperatureCelsius": -0')])assert.throws(()=>read(t));
  assert.throws(()=>read(' '.repeat(exact.MAX_EXACT_CAPTURE_BYTES+1)));assert.throws(()=>read('{"__proto__":{"polluted":true}}'));assert.equal({}.polluted,undefined);
});

test('token-looking strings are preserved literally in governed string positions',()=>{
  for(const text of ['-0','0','1e3','{"number":"-0"}','[-0]']){const p=source(-0);p.samples[0].point.observedAt=text;
    const c=read(serialize(capture(p)));assert.equal(replay(c).samples[0].point.observedAt,text);assert.equal(typeof replay(c).samples[0].point.observedAt,'string');}
  const p=source(-0);p.lineageReferences=[ref('number.-0')];assert.equal(replay(read(serialize(capture(p)))).samples[0].point.temperatureCelsius,-0);
  // This is source-text fidelity, not represented-time qualification.
});

for(const label of ['captain_id','captainId','user_id','userId','auth.uuid','email','boat','origin','range','Fishing_Log','catch','lure','bait','private-coordinates','session','token','mission','captain.identity','captainRange','captain_origin','boatName','private.trip.coordinates','captain.coordinates','missionContext','mission_state','presentation','auth','user-uuid','captain-id','550e8400-e29b-41d4-a716-446655440000_suffix'])test('private reference text rejected '+label,()=>{
  const p=source(-0);p.lineageReferences[0].referenceId='source.'+label;assert.throws(()=>capture(p));
});
test('nested private fields and tag metadata cannot bypass the closed profile',()=>{
  const p=source(-0);p.samples[0].point.source.metadata={number:'-0',captain_id:'private'};assert.throws(()=>capture(p));
  const q=source(-0);q.samples[0].point.temperatureCelsius={type:'number',value:'-0',extra:1};assert.throws(()=>capture(q));
});

for(const attack of ['getter','setter','inherited','array prototype','sparse','symbol','hidden','__proto__','constructor','prototype','cycle','oversized-string'])test('structural safety '+attack,()=>{
  let calls=0;const p=source(-0),point=p.samples[0].point;
  if(attack==='getter')Object.defineProperty(point,'temperatureCelsius',{enumerable:true,get(){calls++;return -0;}});
  if(attack==='setter')Object.defineProperty(point,'temperatureCelsius',{enumerable:true,set(){calls++;}});
  if(attack==='inherited')Object.setPrototypeOf(point,{captainId:'x'});
  if(attack==='array prototype')Object.setPrototypeOf(p.samples,Object.create(Array.prototype));
  if(attack==='sparse')delete p.samples[0];
  if(attack==='symbol')point[Symbol('x')]=-0;
  if(attack==='hidden')Object.defineProperty(point,'hidden',{value:-0});
  if(['__proto__','constructor','prototype'].includes(attack))Object.defineProperty(point,attack,{value:{polluted:true},enumerable:true});
  if(attack==='cycle')point.source=point;
  if(attack==='oversized-string')p.lineageReferences[0].referenceId='x'.repeat(100000);
  assert.throws(()=>capture(p));assert.equal(calls,0);assert.equal({}.polluted,undefined);
});

test('references bind capture, exact version and digest; generic syntax is not semantic resolution',()=>{
  const a=capture(source(-0)),b=capture(source(0)),r=referenceV2(a);assert.deepEqual(verifyReference(r,a),r);assert.doesNotThrow(()=>reference(r));
  assert.throws(()=>verifyReference(r,b));assert.throws(()=>verifyReference(old.currentCaptureReferenceV1(old.captureCurrentEvidenceV1(source(-0))),a));
  for(const field of ['contractVersion','referenceId','sha256']){const x=structuredClone(r);x[field]=field==='sha256'?'0'.repeat(64):'wrong-version';assert.throws(()=>verifyReference(x,a));}
  assert.throws(()=>verifyReference({...r,serializationVersion:exact.EXACT_SCIENTIFIC_JSON_V1},a));
});

test('V3 binds exact typed references without amendment and distinguishes sign-only captures',()=>{
  const build=n=>{const base=publication(),c=capture(source(n)),entries=structuredClone(base.evidence.entries);entries[0].reference=referenceV2(c);
    const evidence=freezeEvidenceV1(base.cycle,entries);return publicationV3({cycle:base.cycle,evidence,history:base.history,attempt:base.attempt,evaluation:{...base.evaluation,evidenceSetId:evidence.evidenceSetId}});};
  const a=build(-0),b=build(0);assert.equal(a.publicationId,b.publicationId);assert.notEqual(a.contentDigest,b.contentDigest);
  assert.deepEqual(validatePublicationV3(JSON.parse(JSON.stringify(a))),a);
  const spoof=structuredClone(a);spoof.evidence.entries[0].reference.contractVersion=old.CURRENT_EVIDENCE_CAPTURE_V1;assert.throws(()=>validatePublicationV3(spoof));
});

test('canonical archive references coexist as documentary bindings, never restore a lost sign',()=>{
  const f=frame(0,'original',-0),i=oceanArchiveIdentityV1(f);const p=source(-0);
  p.lineageReferences.push({kind:'archive',archiveId:i.archiveId,frameId:i.frameId,receiptDigest:hash('synthetic-receipt'),contentDigest:i.contentDigest});
  const c=read(serialize(capture(p)));assert(Object.is(value(c),-0));assert.deepEqual(c.lineageReferences,p.lineageReferences);
  const canonicalSource=JSON.parse(JSON.stringify(p));assert(Object.is(value(capture(canonicalSource)),0));assert.notEqual(c.captureId,capture(canonicalSource).captureId);
});

test('constructor, replay and references detached, deeply frozen and clock/network independent',t=>{
  const p=source(-0),c=capture(p),s=serialize(c);p.samples[0].point.temperatureCelsius=99;p.lineageReferences[0].referenceId='changed';
  t.mock.method(globalThis,'fetch',()=>{throw Error('No network');});t.mock.method(Date,'now',()=>{throw Error('No clock');});t.mock.method(Math,'random',()=>{throw Error('No randomness');});
  const r=replay(read(s));assert(Object.is(r.samples[0].point.temperatureCelsius,-0));assert(Object.isFrozen(r.samples[0].point.source));assert(Object.isFrozen(referenceV2(c)));
  assert.throws(()=>{r.samples[0].point.temperatureCelsius=0;});assert.throws(()=>{c.samples[0].point.temperatureCelsius=0;});
});

test('narrow SST producer baseline matches exact v2; historical v1 mismatch remains',async t=>{
  const {input,A}=await signedZeroProducer(t);const original=structuredClone(A),c=capture(input),s=serialize(c),boundReference=referenceV2(c);
  const v1=old.captureCurrentEvidenceV1(input),historical=old.serializeCurrentEvidenceCaptureV1(v1);
  assert(Object.is(input.samples[1].point.temperatureCelsius,-0));
  delete A.sst.derived;input.samples.length=0; // No borrowed derived/source working objects.
  t.mock.method(globalThis,'fetch',()=>{throw Error('No provider replay');});t.mock.method(Date,'now',()=>{throw Error('No scientific clock');});
  const restored=read(s);assert.deepEqual(verifyReference(boundReference,restored),boundReference);
  const B=await assembleReplayedSst(replay(restored));assert.equal(compareV2(original,B).classification,'EXACT_MATCH');
  const H=await assembleReplayedSst(old.replayCurrentEvidenceSourceV1(old.readCurrentEvidenceCaptureV1(historical)));
  const mismatch=compareV2(original,H);assert.equal(mismatch.classification,'MISMATCH');assert.deepEqual(mismatch.differences.map(x=>x.path),['/sst/derived/spatialStructure/samples/0/temperatureCelsius']);
});

test('locked Git source blobs unchanged from checkpoint; no runtime integration',()=>{
  // git ls-tree at 71c6c039c8d733c496c0a0c687c33a3eb45678c4; no child process needed.
  const blobs={
    'backend/currentEvidenceCapture.mjs':'49f463fd399a3113c481227612ccdf9d3ff13e90',
    'backend/weatherMarineQualityCapture.mjs':'53f5d1c44fe8842e2e715b2504720f66d3623dda',
    'backend/marineAssessorCompanionCapture.mjs':'e47f734c14c43f0327076bf88e30d557b886f071',
    'backend/candidateSemanticProjection.mjs':'1bb8aa2aa8fea93276c57506ba51f96a820bcb3c',
    'backend/candidateSemanticProjectionV2.mjs':'bdf7d44ea19f82e537841f6b25ec8ed047d4deac',
    'backend/server.js':'6094841c70d8e1c6a0062ec1e71f3704964cd6d2',
    'backend/scientificAssessment.mjs':'c353691de023a6ff4cebd758a4b0e92b6cfaeb25',
    'shared/oceanProductFrame.mjs':'21bd53d492799f758393b5068cfaa0f4cd414f49',
    'shared/oceanProductArchive.mjs':'761960d0ff811ab7393646b0283d5754a92217a8',
    'shared/oceanScalarFieldDelivery.mjs':'f97ff7d79067c486cb06d6530221a2c28db13f3b',
    'backend/temporalEvidencePrimitives.mjs':'213a16036a05639117e547f9e71929bed8902c91',
    'shared/oceanPublication.mjs':'9ab13d6c770b587ad305994f598db2e6434bfe14'};
  for(const [file,expected] of Object.entries(blobs)){
    const disk=readFileSync(new URL('../../'+file,import.meta.url),'utf8').replaceAll('\r\n','\n');
    assert.equal(createHash('sha1').update('blob '+Buffer.byteLength(disk)+'\0'+disk).digest('hex'),expected,file);}
  assert(!readFileSync(new URL('../server.js',import.meta.url),'utf8').includes('currentEvidenceCaptureV2'));
});

test('diagnostic byte size and timing, no production budget inference',()=>{
  const p=source(-0);p.samples.push({...structuredClone(p.samples[0]),role:'north'});const a=old.captureCurrentEvidenceV1(p),b=capture(p);const n=100;
  const time=fn=>{const start=performance.now();for(let i=0;i<n;i++)fn();return (performance.now()-start)/n;};
  const oldText=old.serializeCurrentEvidenceCaptureV1(a),newText=serialize(b);
  console.log('EXACT_SERIALIZATION_PERFORMANCE='+JSON.stringify({fixture:'two-point-SST-signed-zero',iterations:n,v1Bytes:Buffer.byteLength(oldText),v2Bytes:Buffer.byteLength(newText),v1SerializeMs:time(()=>old.serializeCurrentEvidenceCaptureV1(a)),v2SerializeMs:time(()=>serialize(b)),v1ReadReplayMs:time(()=>old.replayCurrentEvidenceSourceV1(old.readCurrentEvidenceCaptureV1(oldText))),v2ReadReplayMs:time(()=>replay(read(newText))),scope:'single-desktop synthetic diagnostic, not production budgets'}));
});

// Final adversarial review: acceptance is closed-schema, canonical-wire and exact-reference bound.
for(const family of ['SST','CURRENTS','CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED'])test('adversarial duplicate keys at every object boundary '+family,()=>{
  const wire=serialize(capture(captureFixture(family)));
  // Insert a duplicate first property at each object opening, including objects in arrays.
  for(const match of wire.matchAll(/\{("(?:[^"\\]|\\.)+"):/g)){
    const at=match.index+1,key=match[1];
    for(const replacement of ['null','0','-0','{}','"substituted"'])
      assert.throws(()=>read(wire.slice(0,at)+key+':'+replacement+','+wire.slice(at)),key);
  }
});
for(const token of ['-00','+0','00','-0.0','-0e0','0E+0','1e','1e+','1.','01','/*x*/-0','-0,','"-0"','"\\u002d0"'])test('adversarial noncanonical numeric wire '+token,()=>{
  const wire=serialize(capture(source(-0)));assert.throws(()=>read(wire.replace('"temperatureCelsius":-0','"temperatureCelsius":'+token)));
});
test('canonical Unicode escaping and malformed wire fail closed',()=>{
  const wire=serialize(capture(source(-0)));
  for(const changed of [wire.replace('SST','\\u0053ST'),wire.replace('SST','\\x53ST'),wire.replace('SST','\\uZZZZ'),wire+'\n',wire+'/*comment*/',wire.slice(0,-1)+',}'])assert.throws(()=>read(changed));
});
for(const [family,key] of [['SST','temperatureCelsius'],['SST','temperatureFahrenheit'],['CURRENTS','speedKnots'],['CURRENTS','directionDegrees'],['CURRENTS','eastwardMetersPerSecond'],['CURRENTS','northwardMetersPerSecond'],['CHLOROPHYLL_DIRECT','concentrationMgM3'],['CHLOROPHYLL_GAP_FILLED','concentrationMgM3']])test('every governed measurement rejects nonfinite and preserves sign '+family+'/'+key,()=>{
  const p=captureFixture(family);p.samples[0].point[key]=-0;const a=capture(p);p.samples[0].point[key]=0;const b=capture(p);
  assert.notEqual(a.captureId,b.captureId);assert.notEqual(a.scientificContentDigest,b.scientificContentDigest);assert.notEqual(referenceV2(a).sha256,referenceV2(b).sha256);
  assert(Object.is(replay(read(serialize(a))).samples[0].point[key],-0));
  for(const bad of [NaN,Infinity,-Infinity,'NaN','Infinity',{$number:'-0'}]){p.samples[0].point[key]=bad;assert.throws(()=>capture(p));}
});
for(const u of [-0,0])for(const v of [-0,0])test('independent current component signs '+(Object.is(u,-0)?'-':'+')+(Object.is(v,-0)?'-':'+'),()=>{
  const p=captureFixture('CURRENTS');Object.assign(p.samples[0].point,{eastwardMetersPerSecond:u,northwardMetersPerSecond:v});
  const r=replay(read(serialize(capture(p)))).samples[0].point;
  assert(Object.is(r.eastwardMetersPerSecond,u));assert(Object.is(r.northwardMetersPerSecond,v));assert.equal(r.directionDegrees,p.samples[0].point.directionDegrees);
});
test('ID namespaces, case, length and reference purpose cannot substitute',()=>{
  const c=capture(source(-0)),r=referenceV2(c);
  for(const id of [c.captureId.replace('cec2-','cec-'),c.captureId.toUpperCase(),c.captureId+'0',c.captureId.slice(0,-1),'scalar-'+c.captureId.slice(5)]){
    assert.throws(()=>validate({...c,captureId:id}));assert.throws(()=>verifyReference({...r,referenceId:id},c));
  }
  for(const sha of [c.scientificContentDigest,c.captureId.slice(5),r.sha256.toUpperCase(),hash(serialize(c))])assert.throws(()=>verifyReference({...r,sha256:sha},c));
  for(const version of [old.CURRENT_EVIDENCE_CAPTURE_V1,exact.EXACT_CURRENT_REFERENCE_V1,exact.EXACT_SCIENTIFIC_JSON_V1,'unrelated'])assert.throws(()=>verifyReference({...r,contractVersion:version},c));
  for(const key of Object.keys(r)){const x={...r};delete x[key];assert.throws(()=>verifyReference(x,c));}
  assert.throws(()=>verifyReference({...r,purpose:exact.EXACT_CURRENT_REFERENCE_V1},c));
});
test('domain-separated digest rejects omitted, changed and reordered domain preimages',()=>{
  const c=capture(source(0));const envelope={digestVersion:exact.EXACT_SCIENTIFIC_DIGEST_V1,serializationVersion:exact.EXACT_SCIENTIFIC_JSON_V1,captureVersion:exact.CURRENT_EVIDENCE_CAPTURE_V2,purpose:'scientific-content',content:{family:c.family,samples:c.samples}};
  assert.equal(hash(canonical(envelope)),c.scientificContentDigest);
  for(const key of ['digestVersion','serializationVersion','captureVersion','purpose']){
    const absent={...envelope};delete absent[key];assert.notEqual(hash(canonical(absent)),c.scientificContentDigest);
    assert.notEqual(hash(canonical({...envelope,[key]:'unrelated-protocol'})),c.scientificContentDigest);
  }
  assert.notEqual(hash(JSON.stringify(envelope)),c.scientificContentDigest);
});
test('all public object APIs reject accessors, inherited values and private nested references without invocation',()=>{
  const c=capture(source(-0)),r=referenceV2(c);let invoked=0;
  for(const call of [validate,serialize,replay,referenceV2]){
    const x=structuredClone(c);Object.defineProperty(x,'captureId',{get(){invoked++;return c.captureId;},enumerable:true});assert.throws(()=>call(x));
    assert.throws(()=>call(Object.assign(Object.create({hidden:'private'}),c)));
    const p=structuredClone(c);p.lineageReferences[0].referenceId='fixture.captain_id.secret';assert.throws(()=>call(p));
  }
  const x={...r};Object.defineProperty(x,'sha256',{get(){invoked++;return r.sha256;},enumerable:true});assert.throws(()=>verifyReference(x,c));
  assert.throws(()=>verifyReference(Object.assign(Object.create({hidden:1}),r),c));assert.equal(invoked,0);
});
test('pathological nested unknown input and deeply nested wire rejected',()=>{
  let p={value:0};for(let i=0;i<100;i++)p={nested:p};assert.throws(()=>capture(p));assert.throws(()=>read('['.repeat(10000)+'0'+']'.repeat(10000)));
});

import {assessOceanConditions} from '../server.js';
import {parsed as parsedMarine,inputs as marineInputs,currentSupport} from './fixtures/marineAssessorCompanionFixture.mjs';
import * as quality from '../weatherMarineQualityCapture.mjs';
import * as companion from '../marineAssessorCompanionCapture.mjs';
for(const [family,key,transport,output] of [
 ['wind','speedKnots','wind_speed_10m','assessments/wind/values/speedKnots'],
 ['wind','gustKnots','wind_gusts_10m','assessments/wind/values/gustKnots'],
 ['wind','directionDegrees','wind_direction_10m','directionalInteraction/values/windDirectionDegrees'],
 ['waves','heightFeet','wave_height','assessments/waves/values/heightFeet'],
 ['waves','directionDegrees','wave_direction','directionalInteraction/values/waveDirectionDegrees'],
 ['waves','periodSeconds','wave_period','assessments/waves/values/periodSeconds'],
 ['swell','heightFeet','swell_wave_height','assessments/swell/values/heightFeet'],
 ['swell','directionDegrees','swell_wave_direction','directionalInteraction/values/swellDirectionDegrees'],
 ['swell','periodSeconds','swell_wave_period','assessments/swell/values/periodSeconds']
])test('consumed marine sign requires separately reviewed exact successor '+family+'/'+key,async t=>{
  const m=await parsedMarine(t,{[family==='wind'?'weather':'marine']:{[transport]:-0}});
  // Controlled normalized boundary: some unit converters erase raw sign before this point.
  m[family][key]=-0;
  const {q,input}=marineInputs(m),c=companion.captureMarineAssessorCompanionV1(input,q);
  const restoredQ=quality.readWeatherMarineQualityCaptureV1(quality.serializeWeatherMarineQualityCaptureV1(q));
  const r=companion.replayMarineAssessorCompanionV1(companion.readMarineAssessorCompanionV1(companion.serializeMarineAssessorCompanionV1(c,q),restoredQ),restoredQ);
  const support=currentSupport(m),A={oceanConditions:assessOceanConditions({...m,dataQuality:support.quality(m)})};
  const B={oceanConditions:assessOceanConditions({...r,dataQuality:support.quality({...r,sst:support.replaySst})})};
  const at=o=>output.split('/').reduce((v,k)=>v[k],o.oceanConditions);
  assert(Object.is(at(A),-0));assert(Object.is(at(B),0));
  const comparison=compareV2(A,B);assert.equal(comparison.classification,'MISMATCH');
  assert(comparison.differences.some(d=>d.path==='/oceanConditions/'+output));
});
test('V3 tampering fails closed; opaque reference binding is not source resolution',()=>{
  const base=publication(),c=capture(source(-0)),entries=structuredClone(base.evidence.entries);entries[0].reference=referenceV2(c);
  const evidence=freezeEvidenceV1(base.cycle,entries),p=publicationV3({cycle:base.cycle,evidence,history:base.history,attempt:base.attempt,evaluation:{...base.evaluation,evidenceSetId:evidence.evidenceSetId}});
  for(const [key,bad] of [['contractVersion',old.CURRENT_EVIDENCE_CAPTURE_V1],['contractVersion','unrelated'],['sha256',c.scientificContentDigest],['referenceId','scalar-'+c.captureId.slice(5)]]){
    const x=structuredClone(p);x.evidence.entries[0].reference[key]=bad;assert.throws(()=>validatePublicationV3(x));assert.throws(()=>verifyReference(x.evidence.entries[0].reference,c));
  }
  // Fresh publication of an opaque reference is possible; its content hash is not provider authentication.
  // Exact source resolution additionally requires verifyReference against the actual v2 capture.
});
