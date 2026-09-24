import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeOceanProductFrameV1} from '../../../../shared/oceanProductFrame.mjs';
import {deliverOceanScalarFieldV1} from '../../../../shared/oceanScalarFieldDelivery.mjs';
import {governedFixture} from '../../../../review/scalar-tiles/fixture.mjs';
import {rasterTile,POLICY} from '../../../../review/scalar-tiles/presentationTiles.mjs';
import {parseSyntheticSstResponse} from '../syntheticSstDisplay.js';
import {orderPeloraLayers} from '../peloraMapStyle.js';
const root=fileURLToPath(new URL('../../../../',import.meta.url));
const field=await governedFixture();
test('raster PNG/RGBA and presentation identity cannot enter governed scientific contracts',async()=>{
  const tile=rasterTile(field,7,32,54);let reads=0;
  for(const input of [tile,tile.png,{id:tile.id,rgba:[...tile.rgba.slice(0,16)]}]){
    assert.throws(()=>normalizeOceanProductFrameV1(input));
    assert.throws(()=>parseSyntheticSstResponse(input));
    const result=await deliverOceanScalarFieldV1({readExact:async()=>{reads++;throw Error('Unexpected archive access');}},input);
    assert.notEqual(result.status,'DELIVERED');assert.notEqual(result.status,'DELIVERED_PARTIAL');assert.equal(result.field,null);
  }
  assert.equal(reads,0);
});
test('raster generation preserves numeric missing reasons independently of display bytes',()=>{
  const before=JSON.stringify(field),tile=rasterTile(field,7,32,54);
  // A presentation consumer can alter a buffer; that must not alter numeric authority.
  tile.rgba.fill(255);
  assert.equal(JSON.stringify(field),before);assert.equal(field.grid.values[0],0);
  assert.equal(field.grid.values[2],null);assert.equal(field.grid.missing[2],'provider-no-data');
  assert.equal(field.grid.values[4],null);assert.equal(field.grid.missing[4],'land');
});
test('selected raster proof policy contains no rejected guard',()=>{
  assert.equal(POLICY.mask,'all-missing-transparent-v1');assert.equal(Object.hasOwn(POLICY,'guard'),false);
  const code=fs.readFileSync(path.join(root,'review/scalar-tiles/presentationTiles.mjs'),'utf8');
  assert.doesNotMatch(code,/scalar-mask|guardedTile|maskPolicy|texParameteri/);
});
test('runtime source excludes raster experiments, rejected guards and private diagnostics',()=>{
  function walk(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(e=>
    e.isDirectory()?(['tests','node_modules','dist'].includes(e.name)?[]:walk(path.join(directory,e.name))):/\.(mjs|js|jsx)$/.test(e.name)?[path.join(directory,e.name)]:[]);}
  for(const file of [...walk(path.join(root,'frontend/src')),...walk(path.join(root,'backend'))]){
    assert.doesNotMatch(fs.readFileSync(file,'utf8'),/scalar-mask|scalar-tiles|imageSourceProbe|scalingProbe|texParameteri/,path.relative(root,file));
  }
});
test('ordinary application does not supply synthetic capability or load review entry',()=>{
  const read=p=>fs.readFileSync(path.join(root,p),'utf8');
  assert.doesNotMatch(read('frontend/src/components/Dashboard.jsx'),/syntheticSstReview/);
  assert.doesNotMatch(read('frontend/src/main.jsx'),/review\/|syntheticSstReview/);
  assert.match(read('frontend/src/components/MapLibreIntelligenceMap.jsx'),/syntheticSstReview\s*=\s*null/);
  assert.match(read('frontend/src/hooks/useSyntheticSstReview.js'),/Object\.getOwnPropertyDescriptor\(review, 'request'\)/);
});
test('public raster scalar slot stays below opaque land, coastline and intelligence',()=>{
  const raster={id:'review-raster-boundary',type:'raster',source:'review',metadata:{'pelora:visualSlot':'scalar'},paint:{'raster-resampling':'nearest'}};
  const layers=[{id:'opportunity',metadata:{'pelora:visualSlot':'opportunities'}},{id:'signal',metadata:{'pelora:visualSlot':'signals'}},
    {id:'structure-clusters'},{id:'pelora-geostrophic-arrows'},{id:'countries-fill'},{id:'coastline'},raster,{id:'pelora-bathymetry-shading'},{id:'background'}];
  assert.deepEqual(orderPeloraLayers(layers).map(l=>l.id),['background','pelora-bathymetry-shading','review-raster-boundary','coastline','countries-fill','pelora-geostrophic-arrows','structure-clusters','signal','opportunity']);
});
