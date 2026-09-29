import assert from 'node:assert/strict';
import {test} from 'node:test';
import {writeFileSync} from 'node:fs';
import {fields,parse,encode} from './fixtures/sourceNormalizationFixture.mjs';
import {currentProjection,nonfinitePaths} from './fixtures/crossRouteFinitenessFixture.mjs';
import {assessOceanConditions} from '../server.js';
import {exactJson} from '../exactScientificEvidence.mjs';

const evidence = {routes:[],knownOverflow:[],current:null};
test('all 25 routes: targeted extreme finite, underflow and zero arithmetic states', async t => {
  assert.equal(fields.length,25);
  for(const field of fields) {
    const states=[];
    for(const input of [1e308,-1e308,Number.MIN_VALUE,-Number.MIN_VALUE,0,-0]) {
      const {result,value}=await parse(t,field,Object.is(input,-0)?'negative-zero':'positive',input);
      states.push({input:encode(input),primary:encode(value),nonfinite:nonfinitePaths(result)});
    }
    evidence.routes.push({id:field.id,transport:field.transportPath,parser:field.parser,
      primary:field.path,converter:field.conversion,states});
  }
});

test('six known escaping routes remain distinct from malformed-input defects',async t=>{
  for(const id of ['marine:sea_surface_temperature','sst:directional','marine:wind_speed_10m',
    'marine:wind_gusts_10m','marine:wave_height','marine:swell_wave_height']) {
    const field=fields.find(f=>f.id===id);
    const {result}=await parse(t,field,'positive',1e308);
    const paths=nonfinitePaths(result);
    assert.ok(paths.length>0);
    assert.ok(paths.every(p=>p.value==='Infinity'));
    evidence.knownOverflow.push({id,nonfinite:paths});
  }
});

test('current speed guard does not imply finite downstream vector projection',async t=>{
  const result=await currentProjection(t,Number.MAX_VALUE,Number.MAX_VALUE);
  assert.equal(result.requests.length,4);
  assert.equal(result.spatial.vectors.length,4);
  for(const vector of result.spatial.vectors) {
    assert.equal(vector.eastwardMetersPerSecond,Number.MAX_VALUE);
    assert.equal(vector.northwardMetersPerSecond,Number.MAX_VALUE);
    assert.equal(vector.speedKnots,null);
    assert.equal(vector.directionDegrees,45);
    assert.equal(vector.source.availability,'available');
  }
  const bad=nonfinitePaths(result.projection);
  assert.equal(result.projection.available,true);
  assert.equal(result.projection.coverage,'complete');
  assert.equal(result.projection.validProjectionCount,4);
  assert.equal(result.projection.failedProjectionCount,0);
  assert.ok(bad.some(p=>p.path.endsWith('/vectorMagnitudeMetersPerSecond')&&p.value==='Infinity'));
  assert.throws(()=>exactJson(result.projection));
  evidence.current={...result,nonfinite:bad};
});

test('marine assessor filters known overflow while independent valid measurements survive',async t=>{
  for(const id of ['marine:wind_speed_10m','marine:wind_gusts_10m','marine:wave_height','marine:swell_wave_height']) {
    const {result}=await parse(t,fields.find(f=>f.id===id),'positive',1e308);
    assert.equal(nonfinitePaths(assessOceanConditions(result)).length,0);
  }
});

test('large directions and periods stay finite through actual marine assessor',async t=>{
  for(const field of fields.filter(f=>f.parser==='marine'&&f.conversion==='safe')) {
    for(const input of [Number.MAX_VALUE,-Number.MAX_VALUE]) {
      const {result}=await parse(t,field,'positive',input);
      assert.equal(nonfinitePaths(assessOceanConditions(result)).length,0);
    }
  }
});

test('current signed-zero controls preserve existing behavior without claiming a fix',async t=>{
  const field=fields.find(f=>f.id==='current:u_current');
  for(const u of [0,-0])for(const v of [0,-0]) {
    const {result}=await parse(t,field,'negative-zero',u,{rowOverrides:{u_current:u,v_current:v}});
    assert.equal(result.source.availability,'available');
    assert.equal(nonfinitePaths(result).length,0);
    assert.ok(Object.is(result.eastwardMetersPerSecond,0));
    assert.ok(Object.is(result.northwardMetersPerSecond,0));
  }
});

test('save numeric scope STOP evidence in ignored task directory',()=>{
  writeFileSync('.local/ocean-quarantine/task12b7d/evidence.json',JSON.stringify(evidence,(_key,value)=>
    typeof value==='number'&&!Number.isFinite(value)?{nonfinite:String(value)}:
      Object.is(value,-0)?{signedZero:'-0'}:value,2)+'\n');
});
