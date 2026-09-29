import test from 'node:test';
import assert from 'node:assert/strict';
import {probe,inputFor,frame,observation,at,context,sstQualificationView,witnessedFixture,conceptualAvailability} from './fixtures/sstChlorophyllTemporalSupportFixture.mjs';
import {captureCurrentEvidenceV2,currentCaptureReferenceV2} from '../currentEvidenceCaptureV2.mjs';

for(const route of ['sst','marine'])test(`${route}: actual Marine API request leaves model/run unpinned`,async t=>{
  const {point,requests}=await probe(t,route,{model:'SYNTHETIC_MODEL',run:'SYNTHETIC_RUN',support:{kind:'instant'}});
  const url=requests.find(x=>x.hostname==='marine-api.open-meteo.com');
  assert.equal(url.pathname,'/v1/marine');assert.equal(url.searchParams.get('timezone'),'UTC');
  assert.equal(url.searchParams.get('cell_selection'),'sea');
  assert(url.searchParams.get('current').split(',').includes('sea_surface_temperature'));
  assert.equal(url.searchParams.has('models'),false);assert.equal(url.searchParams.has('run'),false);
  const p=route==='sst'?point:point.sst;
  assert.equal(p.observedAt,'2026-09-24T12:00:00Z');
  for(const k of ['model','run','support','interval'])assert.equal(Object.hasOwn(p,k),false);
});
for(const [family,dataset] of [['direct','noaacwNPPVIIRSchlaDaily'],['gap','nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily']]){
  test(`${family}: actual parser retains product row time, not synthetic pixel time/bounds`,async t=>{
    const {point,requests}=await probe(t,family,{date_created:'2026-09-25T12:00:00Z',processing_version:'synthetic-only'});
    assert(requests[0].pathname.endsWith(dataset+'.json'));
    assert(requests[0].search.includes('chlor_a'));assert(requests[0].search.includes('last'));
    assert.equal(point.source.dataset,dataset);assert.equal(point.observedAt,'2026-09-24T12:00:00Z');
    for(const k of ['pixel_time','support_start','support_end','date_created','processing_version'])assert.equal(Object.hasOwn(point,k),false);
  });
  test(`${family}: extra transport metadata cannot silently change exact captured support`,async t=>{
    const a=(await probe(t,family,{provider_support:'synthetic-A'})).point;
    const b=(await probe(t,family,{provider_support:'synthetic-B'})).point;
    const ca=captureCurrentEvidenceV2(inputFor(a,family)),cb=captureCurrentEvidenceV2(inputFor(b,family));
    assert.deepEqual(ca,cb);assert.equal(Object.hasOwn(ca.samples[0].point,'support'),false);
  });
}
test('DIRECT and GAP_FILLED equal concentrations/times remain distinct exact evidence',async t=>{
  const a=(await probe(t,'direct')).point,b=(await probe(t,'gap')).point;
  assert.equal(a.observedAt,b.observedAt);assert.equal(a.concentrationMgM3,b.concentrationMgM3);
  assert.notEqual(captureCurrentEvidenceV2(inputFor(a,'direct')).captureId,captureCurrentEvidenceV2(inputFor(b,'gap')).captureId);
});
test('model-valid instant is representable without calling it direct observation',()=>{
  const f=frame();f.product.evidenceClass='FORECAST';f.temporal.forecastIssuedAt=at(-1);
  const o=observation(f);assert.equal(o.temporal.support.kind,'instant');assert.equal(o.product.evidenceClass,'FORECAST');
});
test('locked direct-observation SST view does not admit model output by timestamp alone',()=>{
  const f=frame();f.product.evidenceClass='FORECAST';f.temporal.forecastIssuedAt=at(-1);
  assert.throws(()=>sstQualificationView([{frame:f,observation:observation(f)}],context(1)));
});
test('conditional composite support is representable only with explicitly supplied bounds',()=>{
  const f=frame();f.temporal.support={kind:'composite-window',start:at(0),end:at(24)};
  assert.equal(observation(f).temporal.support.end,at(24));
  delete f.temporal.support.end;assert.throws(()=>observation(f));
});
test('nominal noon does not force support inference at the Frame boundary',()=>{
  const f=frame(12);f.temporal.support={kind:'unknown',reason:'unresolved-product-bounds'};
  assert.equal(observation(f).temporal.support.kind,'unknown');
});
test('late receipt of a reconstructed endpoint fails availability independently of target',async t=>{
  const p=(await probe(t,'gap')).point,ref=currentCaptureReferenceV2(captureCurrentEvidenceV2(inputFor(p,'gap')));
  const receipt=witnessedFixture(ref,at(25));assert.equal(conceptualAvailability(receipt.record,ref,context(14),receipt.witnesses),false);
});
test('same target reconstructed revision cannot inherit an earlier contents receipt',async t=>{
  const a=(await probe(t,'gap',{},.1)).point,b=(await probe(t,'gap',{},.2)).point;
  const ar=currentCaptureReferenceV2(captureCurrentEvidenceV2(inputFor(a,'gap'))),br=currentCaptureReferenceV2(captureCurrentEvidenceV2(inputFor(b,'gap')));
  const receipt=witnessedFixture(ar,at(13));
  assert(conceptualAvailability(receipt.record,ar,context(14),receipt.witnesses));
  assert.throws(()=>conceptualAvailability(receipt.record,br,context(14),receipt.witnesses));
});
