// Current-runtime controls alongside immutable historical source inventories.
import test from 'node:test';
import assert from 'node:assert/strict';
import {scenarios} from './fixtures/snapshotProducerQualificationV2Fixture.mjs';
import {extensionHarness,additionalScenarios} from './fixtures/snapshotBranchReachabilityReview.mjs';
import {semanticLeaves,buildInventory,auditDigest} from './fixtures/snapshotProducerInventoryV2.mjs';
import {startSourceCoverage,coverageMatrix,sourceHash} from './fixtures/snapshotProducerBranchAuditV2.mjs';
import {fields,parse} from './fixtures/sourceNormalizationFixture.mjs';

// Fixture-only transport stubs without retaining every response/promise in mock
// call history. No production injection; restoration always reinstates denial.
function boundedMocks(){
  const restores=[];
  return {mock:{method(object,key,implementation){const previous=object[key];
    function wrapper(...args){return implementation.apply(this,args);}
    wrapper.mock={restore(){if(object[key]===wrapper)object[key]=previous;}};
    restores.push(wrapper.mock.restore);object[key]=wrapper;return wrapper;
  }},close(){for(const restore of restores.reverse())restore();}};
}

test('current 25-route coordinate and numeric boundaries retain literal routing and open policies',async t=>{
  assert.equal(fields.length,25);
  for(const f of fields){
    const normal=await parse(t,f,'positive',2);assert(Number.isFinite(normal.value),f.id);
    if(f.conversion==='coordinate')for(const [state,value] of [['null',null],['array',[]],['numeric-string','25']]){
      const result=await parse(t,f,state,value);assert.equal(result.value,null,f.id+state);
    }
  }
});

test('current producer order, duplication, cold/warm and coordinate fallbacks use independent bounded setup',async()=>{
  const mocks=boundedMocks(),h=await extensionHarness(mocks),all=[...scenarios,...additionalScenarios];
  const expected=new Map(),baseline=[];const profiler=await startSourceCoverage();
  try{
    await profiler.discardSetup();
    for(const s of all){const rows=await h.run(s);assert.equal(rows.length,2);
      const digest=auditDigest(semanticLeaves(rows[0].snapshot));
      assert.equal(auditDigest(semanticLeaves(rows[1].snapshot)),digest,s.id);
      expected.set(s.id,digest);baseline.push(rows[0]);await profiler.collect(s.id);
    }
    const matrix=coverageMatrix(await profiler.stop());
    assert(matrix.some(x=>x.producer==='getSeaSurfaceTemperaturePoint'&&x.status==='EXECUTED'));
    assert.equal(sourceHash.length,64);
    const inventory=buildInventory(baseline);assert(inventory.length>0);
    assert.equal(auditDigest(buildInventory([...baseline,baseline[0],baseline.at(-1)])),auditDigest(inventory));
    for(const order of [[...all].reverse(),... [1,7,42,1729,65537].map(seed=>{
      let state=seed;const result=[...all];for(let i=result.length-1;i>0;i--){state=(Math.imul(state,1664525)+1013904223)>>>0;const j=state%(i+1);[result[i],result[j]]=[result[j],result[i]];}return result;
    }),[...all,all[0],all.at(-1),all[0]]]){
      for(const s of order)for(const row of await h.run(s,{mode:'cold'}))assert.equal(auditDigest(semanticLeaves(row.snapshot)),expected.get(s.id),s.id);
    }
    for(const mode of ['warm-first','warm','cold'])for(const s of all)for(const row of await h.run(s,{mode}))assert.equal(auditDigest(semanticLeaves(row.snapshot)),expected.get(s.id),mode+s.id);
    console.log('CURRENT_PRODUCER',JSON.stringify({scenarios:all.length,paths:inventory.length,sourceHash,inventoryDigest:auditDigest(inventory),heapUsed:process.memoryUsage().heapUsed}));
  }finally{h.close();mocks.close();}
});
