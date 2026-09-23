import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {buildVerificationQueue as queue, buildReviewedCatalog as build, serializePlaceArtifact as serialize} from '../../scripts/places/pipeline.mjs';

function fixture() {
  const source={sourceId:'test-source',authorityId:'test-authority',datasetId:'test-data',snapshot:'test-snapshot',
    regionIds:['test-region'],featureTypes:['ARTIFICIAL_REEF','WRECK','OBSERVATION_STATION'],crs:'EPSG:4326',horizontalDatum:'WGS84',
    updateCadence:null,statusSemantics:'Synthetic site/deployment metadata, not measurements',adapterId:'synthetic',adapterVersion:'1',qualificationRef:'test-qualification'};
  const empty=()=>({status:'not-assessed',decisionRef:null,policyRef:null});
  const place={contractVersion:'pelora-governed-place-v1',placeId:'test:site',revisionId:'r1',canonicalName:'Synthetic reef',aliases:[],placeType:'ARTIFICIAL_REEF',regionIds:['test-region'],
    geometry:{type:'Point',coordinates:[-87,29]},geometryMeaning:'feature-location',
    coordinateReferenceSystem:{crs:'EPSG:4326',horizontalDatum:'WGS84',verticalDatum:null,coordinateOrder:'x,y',unit:'degree'},representativePoint:null,
    provenance:[{sourceId:source.sourceId,authorityId:source.authorityId,datasetId:source.datasetId,featureId:'site-1',sourceSnapshot:source.snapshot,sourceDate:null,retrievedAt:null,locatorId:'test-record'}],
    transformation:null,verification:{state:'UNVERIFIED',assessmentRef:null,assessedAt:null,evidenceSourceIds:[]},
    temporal:{nature:'FIXED_STRUCTURE',status:'present',observedAt:null,validFrom:null,validTo:null},contextRefs:[],
    eligibility:{display:empty(),candidateContext:empty(),learningContext:empty()}};
  return {registry:{registryVersion:'test-registry-1',sources:[source]},existing:[],records:[{proposalId:'p1',sourceId:source.sourceId,sourceRecordRef:'test-record',entityKind:'deployment',
    rawRecord:{deploymentId:'deployment-1',siteId:'site-1',latitude:29,longitude:-87,depthFeet:30},proposedPlace:place,
    reviews:{datumRef:'test-datum',statusRef:'test-status',identityRef:'test-site-reconciliation'}}]};
}
function approve(input) {
  const q=queue(input);
  return {catalogVersion:'test-catalog-1',queueDigest:q.queueDigest,decisions:q.rows.map(r=>({proposalId:r.proposalId,proposalDigest:r.proposalDigest,decisionRef:'test-approval',
    conflictReviews:r.conflictIds.map(conflictId=>({conflictId,decisionRef:'test-conflict-review'})),
    approvedPlace:{...r.proposedPlace,verification:{state:'VERIFIED',assessmentRef:'test-verification',assessedAt:'2026-01-01T00:00:00Z',evidenceSourceIds:['test-source']}}}))};
}
test('raw record remains detached and proposed never means verified',()=>{
  const input=fixture(), before=structuredClone(input),q=queue(input);
  assert.deepEqual(input,before);assert.deepEqual(q.rows[0].rawRecord,input.records[0].rawRecord);
  assert.equal(q.rows[0].state,'READY_FOR_VERIFICATION');assert.equal(q.rows[0].proposedPlace.verification.state,'UNVERIFIED');
  input.records[0].rawRecord.depthFeet=60;assert.equal(q.rows[0].rawRecord.depthFeet,30);assert.ok(Object.isFrozen(q.rows[0].rawRecord));
});
test('depth-neutral ingestion preserves shallow, deep, unknown and absent depth without admission rules',()=>{
  for(const depth of [30,60,100,10000,null,undefined]) {const i=fixture();if(depth===undefined)delete i.records[0].rawRecord.depthFeet;else i.records[0].rawRecord.depthFeet=depth;
    assert.equal(queue(i).rows[0].state,'READY_FOR_VERIFICATION');assert.equal(Object.hasOwn(queue(i).rows[0].proposedPlace,'depth'),false);}
});
test('unresolved datum, status, identity and qualification block offline catalog build',()=>{
  for(const key of ['datumRef','statusRef','identityRef']) {const i=fixture();i.records[0].reviews[key]=null;assert.ok(queue(i).rows[0].issues.length);assert.throws(()=>build(i,approve(i)));}
  const i=fixture();i.registry.sources[0].qualificationRef=null;assert.throws(()=>build(i,approve(i)));
});
test('unknown CRS and NAD27 source preserved without transformation',()=>{
  for(const crs of [null,'EPSG:4267']) {const i=fixture();i.registry.sources[0].crs=crs;i.registry.sources[0].horizontalDatum='NAD27';
    Object.assign(i.records[0].proposedPlace.coordinateReferenceSystem,{crs,horizontalDatum:'NAD27'});
    const r=queue(i).rows[0];assert.deepEqual(r.proposedPlace.geometry.coordinates,[-87,29]);assert.equal(r.proposedPlace.transformation,null);
    if(crs===null)assert.throws(()=>build(i,approve(i)));}
});
test('adapters cannot grant verification or permission and source lineage must agree',()=>{
  for(const mutate of [i=>i.records[0].proposedPlace.verification=approve(i).decisions[0].approvedPlace.verification,
    i=>i.records[0].proposedPlace.eligibility.display={status:'withheld',decisionRef:'review',policyRef:'policy'},
    i=>i.records[0].proposedPlace.provenance[0].sourceSnapshot='other',i=>i.records[0].sourceId='unknown',
    i=>i.records[0].proposedPlace.coordinateReferenceSystem.crs='EPSG:4267',i=>i.records[0].proposedPlace.species='test']) {
    const i=fixture();mutate(i);assert.throws(()=>queue(i));}
});
test('deployment without reviewed site identity is retained for reconciliation',()=>{
  const i=fixture();i.records[0].reviews.identityRef=null;const r=queue(i).rows[0];
  assert.equal(r.entityKind,'deployment');assert.ok(r.issues.includes('NEEDS_IDENTITY_RECONCILIATION'));assert.equal(r.rawRecord.deploymentId,'deployment-1');
});
test('reef and wreck overlap preserves both sides and never automatically merges',()=>{
  const i=fixture(),b=structuredClone(i.records[0]);b.proposalId='p2';b.proposedPlace.placeId='test:other';b.proposedPlace.placeType='WRECK';i.records.push(b);
  const q=queue(i);assert.equal(q.rows.length,2);assert.ok(q.conflicts[0].reasons.includes('AUTHORITY_ID_CONFLICT'));
  assert.equal(q.conflicts[0].left.place.placeType,'ARTIFICIAL_REEF');assert.equal(q.conflicts[0].right.place.placeType,'WRECK');
  assert.throws(()=>build(i,approve(i))); // Review references alone cannot bypass duplicate authority identity.
});
test('same name or exact location is a review lead, never an identity match',()=>{
  const i=fixture(),b=structuredClone(i.records[0]);b.proposalId='p2';b.proposedPlace.placeId='test:other';b.proposedPlace.provenance[0].featureId='site-2';
  b.proposedPlace.geometry.coordinates=[-88,28];i.records.push(b);
  assert.ok(queue(i).conflicts[0].reasons.includes('POSSIBLE_IDENTITY_OVERLAP'));
  const approval=approve(i);approval.decisions[0].conflictReviews=[];assert.throws(()=>build(i,approval));
});
test('source refresh preserves prior revision and requires review of changed status/geometry',()=>{
  const i=fixture();i.existing=[approve(i).decisions[0].approvedPlace];i.records[0].proposedPlace.revisionId='r2';
  i.records[0].proposedPlace.temporal.status='removed';i.records[0].proposedPlace.geometry.coordinates=[-88,28];
  const q=queue(i);assert.equal(q.rows[0].previous.revisionId,'r1');assert.equal(q.rows[0].previous.temporal.status,'present');
  assert.ok(q.conflicts[0].reasons.includes('DIFFERENT_temporal'));
  const built=build(i,approve(i));assert.equal(built.places.length,1);assert.equal(built.places[0].revisionId,'r2');assert.equal(i.existing[0].revisionId,'r1');
});
test('station identity does not carry environmental observations and mobile positions require time',()=>{
  const i=fixture();i.records[0].proposedPlace.placeType='OBSERVATION_STATION';i.records[0].entityKind='station-position';
  i.records[0].proposedPlace.temporal.nature='TIME_VARYING_STRUCTURE';assert.ok(queue(i).rows[0].issues.includes('NEEDS_STATUS_VERIFICATION'));
  i.records[0].proposedPlace.temporal.observedAt='2026-01-01T00:00:00Z';assert.equal(queue(i).rows[0].state,'READY_FOR_VERIFICATION');
  i.records[0].proposedPlace.measurements={sst:25};assert.throws(()=>queue(i));
});
test('queue/catalog deterministic and approval bound to full source and review state',()=>{
  const i=fixture(),a=approve(i);assert.equal(serialize(build(i,a)),serialize(build(structuredClone(i),structuredClone(a))));
  assert.equal(build(i,a).places[0].eligibility.candidateContext.status,'not-assessed');
  i.records[0].rawRecord.depthFeet=60;assert.throws(()=>build(i,a));
  const b=approve(i);b.decisions[0].approvedPlace.canonicalName='changed after approval';assert.throws(()=>build(i,b));
});
test('malformed JSON, duplicate records and unknown registry fields fail closed',()=>{
  for(const mutate of [i=>i.records.push(structuredClone(i.records[0])),i=>i.records[0].rawRecord.x=NaN,
    i=>i.registry.sources[0].score=1,i=>i.records[0].reviews.distance=100,i=>i.records[0].proposedPlace.revisionId=null]) {
    const i=fixture();mutate(i);assert.throws(()=>queue(i));}
});
test('offline tooling has no provider or active catalog output path',()=>{
  for(const file of ['pipeline.mjs','cli.mjs']) {const source=readFileSync(new URL(`../../scripts/places/${file}`,import.meta.url),'utf8');
    assert.doesNotMatch(source,/writeFile|fetch\(|https?:\/\/|supabase|frontend\/src\/data|backend\/data|Date\.now|Math\.random/);}
});
test('record order and object insertion order do not change deterministic artifacts',()=>{
  const i=fixture(), b=structuredClone(i.records[0]);b.proposalId='p2';b.proposedPlace.placeId='test:second';
  b.proposedPlace.canonicalName='Other site';b.proposedPlace.geometry.coordinates=[-85,27];b.proposedPlace.provenance[0].featureId='site-2';
  i.records.push(b);const before=queue(i);i.records.reverse();assert.equal(queue(i).queueDigest,before.queueDigest);
  const reverse=v=>Array.isArray(v)?v.map(reverse):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).reverse().map(([k,x])=>[k,reverse(x)])):v;
  assert.equal(queue(reverse(i)).queueDigest,before.queueDigest);
});
test('supplied transformation requires its own review and preserves original source geometry',()=>{
  const i=fixture(),p=i.records[0].proposedPlace;
  i.registry.sources[0].crs='EPSG:4267';i.registry.sources[0].horizontalDatum='NAD27';
  p.transformation={sourceGeometry:structuredClone(p.geometry),sourceReferenceSystem:{...p.coordinateReferenceSystem,crs:'EPSG:4267',horizontalDatum:'NAD27'},
    sourceRef:'test-source',method:'synthetic supplied result',implementation:'synthetic',implementationVersion:'1',verificationRef:null};
  assert.ok(queue(i).rows[0].issues.includes('NEEDS_DATUM_RECONCILIATION'));assert.throws(()=>build(i,approve(i)));
  p.transformation.verificationRef='separate-transform-approval';
  assert.equal(build(i,approve(i)).places[0].transformation.sourceReferenceSystem.horizontalDatum,'NAD27');
  assert.deepEqual(p.transformation.sourceGeometry.coordinates,[-87,29]);
});

test('known transformation target cannot hide unresolved source CRS, datum or units',()=>{
  for(const field of ['crs','horizontalDatum','unit']) {
    const i=fixture(),p=i.records[0].proposedPlace;
    p.transformation={sourceGeometry:structuredClone(p.geometry),sourceReferenceSystem:{...p.coordinateReferenceSystem,[field]:null},
      sourceRef:'test-source',method:'synthetic supplied result',implementation:'synthetic',implementationVersion:'1',verificationRef:'review'};
    if(field!=='unit')i.registry.sources[0][field]=null;
    assert.ok(queue(i).rows[0].issues.includes('NEEDS_DATUM_RECONCILIATION'),field);
    assert.throws(()=>build(i,approve(i)));
  }
});

test('approval rejects changed proposal, source, blocker, conflict and prior representation',()=>{
  const mutations=[
    i=>i.records[0].proposedPlace.aliases.push('Revised name'),
    i=>i.records[0].rawRecord.sourceDate='2026-02-01',
    i=>i.records[0].reviews.statusRef=null,
    i=>i.registry.sources[0].adapterVersion='2',
    i=>{const b=structuredClone(i.records[0]);b.proposalId='p2';b.proposedPlace.placeId='test:other';i.records.push(b);}
  ];
  for(const mutate of mutations) {const i=fixture(),a=approve(i);assert.equal(build(i,a).places.length,1);mutate(i);assert.throws(()=>build(i,a),/stale/);}
  const i=fixture();i.existing=[approve(i).decisions[0].approvedPlace];i.records[0].proposedPlace.revisionId='r2';
  const a=approve(i);i.existing[0].canonicalName='Corrected prior name';assert.throws(()=>build(i,a),/stale/);
});

test('changed existing conflict evidence invalidates its previous approval',()=>{
  const i=fixture(),b=structuredClone(i.records[0]);b.proposalId='p2';b.proposedPlace.placeId='test:other';
  b.proposedPlace.provenance[0].featureId='site-2';i.records.push(b);
  const a=approve(i),before=queue(i).conflicts[0].conflictId;
  b.proposedPlace.geometry.coordinates=[-86,28];assert.notEqual(queue(i).conflicts[0].conflictId,before);
  assert.throws(()=>build(i,a),/stale/);
});

test('multiple deployment proposals for one site cannot build duplicate Places',()=>{
  const i=fixture(),b=structuredClone(i.records[0]);b.proposalId='p2';b.rawRecord.deploymentId='deployment-2';i.records.push(b);
  const q=queue(i);assert.ok(q.conflicts[0].reasons.includes('MULTIPLE_PROPOSALS_ONE_PLACE'));
  assert.deepEqual(q.rows.map(r=>r.rawRecord.deploymentId),['deployment-1','deployment-2']);
  assert.throws(()=>build(i,approve(i)),/duplicatePlaceId/);
});

test('linked geometry, datum, status and name disagreements retain both sides',()=>{
  const i=fixture();i.existing=[approve(i).decisions[0].approvedPlace];const p=i.records[0].proposedPlace;p.revisionId='r2';
  p.canonicalName='Revised site';p.geometry.coordinates=[-88,28];p.temporal.status='removed';
  p.coordinateReferenceSystem.verticalDatum='source-specific';const before=structuredClone(i.existing);
  const q=queue(i),c=q.conflicts[0];
  for(const field of ['geometry','coordinateReferenceSystem','canonicalName','temporal'])assert.ok(c.reasons.includes(`DIFFERENT_${field}`));
  assert.deepEqual(i.existing,before);assert.equal(c.left.place.revisionId,'r1');assert.equal(c.right.place.revisionId,'r2');
  assert.ok(Object.isFrozen(c.left.place.geometry.coordinates));
});

test('raw JSON rejects unsupported values and preserves meaningful array order',()=>{
  for(const value of [undefined,NaN,Infinity,1n,()=>0,new Date('2026-01-01'),new Array(2)]) {
    const i=fixture();i.records[0].rawRecord.extra=value;assert.throws(()=>queue(i));
  }
  const i=fixture();i.records[0].rawRecord.events=['first','second'];const q=queue(i);
  i.records[0].rawRecord.events.reverse();assert.notEqual(queue(i).queueDigest,q.queueDigest);
  assert.deepEqual(q.rows[0].rawRecord.events,['first','second']);assert.ok(Object.isFrozen(q.rows[0].rawRecord.events));
});

test('missing approval, forged proposal digest, unverified and malformed approved records fail',()=>{
  const i=fixture();assert.throws(()=>build(i,undefined));
  for(const mutate of [a=>a.decisions[0].proposalDigest='wrong',
    a=>a.decisions[0].approvedPlace.verification=structuredClone(i.records[0].proposedPlace.verification),
    a=>a.decisions[0].approvedPlace.contractVersion='unsupported',
    a=>a.decisions[0].approvedPlace.geometry.coordinates=['-87',29],
    a=>a.decisions[0].approvedPlace.popularity=100]) {const a=structuredClone(approve(i));mutate(a);assert.throws(()=>build(i,a));}
});
