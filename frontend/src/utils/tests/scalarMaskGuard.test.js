import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {maskFixture} from '../../../../review/scalar-mask/fixture.mjs';
import {guardedTile,maskPolicy} from '../../../../review/scalar-mask/maskTiles.mjs';
import {rasterTile,tileIdentity,sourceIndex,lonLat} from '../../../../review/scalar-tiles/presentationTiles.mjs';
const field=await maskFixture();
test('separate synthetic fixture passes frame/archive/scalar/runtime boundaries',()=>{
  assert.match(field.source.archiveId,/^opf-/);assert.equal(field.product.providerId,'synthetic');
  assert.equal(field.product.evidenceClass,'ANALYSIS');assert.equal(field.grid.values[1],0);
  assert.equal(field.grid.missing[22],'provider-no-data');assert.equal(field.grid.missing[33],'unknown');
});
test('0/1/2 policies deterministic and monotonically suppress only presentation alpha',()=>{
  const a=guardedTile(field,7,32,54,0),b=guardedTile(field,7,32,54,1),c=guardedTile(field,7,32,54,2);
  assert.deepEqual(a.rgba,rasterTile(field,7,32,54).rgba);
  assert.deepEqual(b.png,guardedTile(field,7,32,54,1).png);
  assert.ok(b.suppressedPixels>0);assert.ok(c.suppressedPixels>b.suppressedPixels);
  for(let i=0;i<a.rgba.length;i+=4){assert.ok(c.rgba[i+3]<=b.rgba[i+3]&&b.rgba[i+3]<=a.rgba[i+3]);
    if(b.rgba[i+3])assert.deepEqual(b.rgba.slice(i,i+4),a.rgba.slice(i,i+4));}
});
test('invalid guard fails closed',()=>{for(const g of [-1,3,0.5,'1',null,NaN])assert.throws(()=>maskPolicy(g));});
test('identity binds guard, policy version, renderer, ramp, overview and derivative',()=>{
  const p=maskPolicy(1),id=tileIdentity(field.deliveryId,7,32,54,p);
  for(const g of [0,2])assert.notEqual(id,tileIdentity(field.deliveryId,7,32,54,maskPolicy(g)));
  for(const k of ['mask','renderer','ramp','overview','resampling','halo'])assert.notEqual(id,tileIdentity(field.deliveryId,7,32,54,{...p,[k]:p[k]+'-next'}));
  assert.equal(id,tileIdentity(field.deliveryId,7,32,54,Object.fromEntries(Object.entries(p).reverse())));
  assert.notEqual(id,tileIdentity('osfd-'+'b'.repeat(64),7,32,54,p));
});
test('halo equals a globally sampled mask for independent adjacent tiles',()=>{
  for(const guard of [0,1,2])for(const x of [32,33]){
    const t=guardedTile(field,7,x,54,guard);
    for(let row=0;row<256;row++)for(const col of [0,1,254,255]){
      let safe=true;
      for(let dy=-guard;dy<=guard;dy++)for(let dx=-guard;dx<=guard;dx++){
        const i=sourceIndex(field,...lonLat(7,x,54,col+dx+0.5,row+dy+0.5));
        if(i<0||field.grid.missing[i]!==null)safe=false;
      }
      assert.equal(t.rgba[(row*256+col)*4+3],safe?255:0);
    }
  }
});
test('valid seam is not independently eroded; missing context crosses seam',()=>{
  const left=guardedTile(field,7,32,54,1),right=guardedTile(field,7,33,54,1);let validRows=0,missingRows=0;
  for(let row=0;row<256;row++){
    const [,lat]=lonLat(7,32,54,256,row+0.5);
    const a=left.rgba[(row*256+255)*4+3],b=right.rgba[row*256*4+3];
    if(lat>25.1&&lat<25.5){assert.equal(a,255);assert.equal(b,255);validRows++;}
    if(lat>26.3&&lat<26.7){assert.equal(a,0);assert.equal(b,0);missingRows++;}
  }
  assert.ok(validRows>0&&missingRows>0);
});
test('land, internal hole, unknown and outside are transparent; zero retains exact display color',()=>{
  let zero=0,hole=0,land=0,unknown=0,outside=0;
  for(const x of [32,33]){
    const t=guardedTile(field,7,x,54,1);
    for(let row=0;row<256;row++)for(let col=0;col<256;col++){
      const cell=sourceIndex(field,...lonLat(7,x,54,col+0.5,row+0.5)),alpha=t.rgba[(row*256+col)*4+3];
      if(cell<0){outside++;assert.equal(alpha,0);continue;}
      const reason=field.grid.missing[cell];
      if(reason){assert.equal(alpha,0);if(reason==='land')land++;if(reason==='provider-no-data')hole++;if(reason==='unknown')unknown++;}
      if(cell===1&&alpha){zero++;assert.deepEqual([...t.rgba.slice((row*256+col)*4,(row*256+col)*4+3)],[53,75,112]);}
    }
  }
  assert.ok(zero&&hole&&land&&unknown&&outside);
});
test('fully missing tile is transparent, partial tile loses only bounded valid display area',()=>{
  for(const guard of [0,1,2]){const empty=guardedTile(field,7,34,54,guard);assert.ok(empty.rgba.every(v=>v===0));assert.equal(empty.validPixels,0);}
  const partial=guardedTile(field,7,32,54,1);assert.ok(partial.suppressedPixels>0&&partial.suppressedPixels<partial.validPixels);
});
test('per-zoom overview samples exact scientific values and does not alter evidence',()=>{
  const before=JSON.stringify(field);
  for(const z of [5,6,7]){const t=guardedTile(field,z,2**(z-2),Math.floor(54/2**(7-z)),1);assert.ok(t.id.startsWith('spt-'));}
  assert.equal(JSON.stringify(field),before);assert.ok(Object.isFrozen(field.grid.values));
});
test('review mask code has no production activation path',()=>{
  const root=new URL('../../../../',import.meta.url);
  const files=['backend/server.js','backend/fields/scalarRuntime.js','frontend/src/components/MapLibreIntelligenceMap.jsx','frontend/src/hooks/useSyntheticSstReview.js'];
  for(const file of files)assert.doesNotMatch(fs.readFileSync(new URL(file,root),'utf8'),/scalar-mask|maskFixture|guardedTile/);
});
