import assert from 'node:assert/strict';
import {test} from 'node:test';
import {inflateSync} from 'node:zlib';
import {governedFixture} from '../../../../review/scalar-tiles/fixture.mjs';
import {rasterTile,tileIdentity,sourceIndex,lonLat,POLICY} from '../../../../review/scalar-tiles/presentationTiles.mjs';
const field=await governedFixture();
test('fixture retains exact governed archive and delivery chain',()=>{
  assert.match(field.source.archiveId,/^opf-/);assert.match(field.deliveryId,/^osfd-/);
  assert.equal(field.product.evidenceClass,'ANALYSIS');assert.equal(field.grid.values[0],0);
});
test('tile identity binds every declared presentation input, excluding time',()=>{
  const id=tileIdentity(field.deliveryId,7,32,54);
  for(const [key,value] of Object.entries(POLICY))assert.notEqual(id,tileIdentity(field.deliveryId,7,32,54,{...POLICY,[key]:typeof value==='number'?value+1:value+'-changed'}));
  for(const coords of [[8,32,54],[7,33,54],[7,32,55]])assert.notEqual(id,tileIdentity(field.deliveryId,...coords));
  assert.notEqual(id,tileIdentity('osfd-'+'a'.repeat(64),7,32,54));
  assert.equal(id,tileIdentity(field.deliveryId,7,32,54,Object.fromEntries(Object.entries(POLICY).reverse())));
});
test('unregistered names and malformed tile addresses rejected',()=>{
  for(const id of ['latest-sst','../',''])assert.throws(()=>tileIdentity(id,7,32,54));
  for(const coords of [[-1,0,0],[7,128,0],[7,0,-1],[7.5,0,0]])assert.throws(()=>tileIdentity(field.deliveryId,...coords));
});
test('asymmetric six cell footprints preserve source offsets and boundary ownership',()=>{
  assert.deepEqual([[-89.5,25.5],[-88,25.5],[-86.5,25.5],[-89.5,26.5],[-88,26.5],[-86.5,26.5]].map(p=>sourceIndex(field,...p)),[0,1,2,3,4,5]);
  assert.equal(sourceIndex(field,-89,26),4);assert.equal(sourceIndex(field,-91,26),-1);
});
test('adjacent tile edges coincide exactly; samples have one source index',()=>{
  assert.deepEqual(lonLat(7,32,54,256,0),lonLat(7,33,54,0,0));
  const left=rasterTile(field,7,32,54),right=rasterTile(field,7,33,54);
  let compared=0;
  for(let row=0;row<256;row++){
    const a=row*256+255,b=row*256;
    if(left.indices[a]>=0&&left.indices[a]===right.indices[b]){assert.deepEqual(left.rgba.slice(a*4,a*4+4),right.rgba.slice(b*4,b*4+4));compared++;}
  }
  assert.ok(compared>10);
});
test('all source cells encountered; zero opaque; land/no-data and uncovered pixels transparent',()=>{
  const seen=new Set();let uncovered=0;
  for(const x of [32,33])for(const y of [53,54]){
    const t=rasterTile(field,7,x,y);
    t.indices.forEach((cell,i)=>{
      if(cell>=0)seen.add(cell);else uncovered++;
      const missing=cell<0||field.grid.missing[cell]!==null;
      assert.equal(t.rgba[i*4+3],missing?0:255);
      if(missing)assert.deepEqual([...t.rgba.slice(i*4,i*4+4)],[0,0,0,0]);
    });
  }
  assert.deepEqual([...seen].sort(),[0,1,2,3,4,5]);assert.ok(uncovered>0);
});
test('fully empty tile is a valid transparent PNG; encoding round-trips exact RGBA',()=>{
  for(const coords of [[7,34,54],[7,32,54]]){
    const t=rasterTile(field,...coords),chunks=[];
    for(let o=8;o<t.png.length;){const n=t.png.readUInt32BE(o);if(t.png.toString('ascii',o+4,o+8)==='IDAT')chunks.push(t.png.subarray(o+8,o+8+n));o+=n+12;}
    const raw=inflateSync(Buffer.concat(chunks));
    for(let row=0;row<256;row++)assert.deepEqual([...raw.subarray(row*1025+1,(row+1)*1025)],[...t.rgba.slice(row*1024,(row+1)*1024)]);
    if(coords[1]===34)assert.ok(t.rgba.every(v=>v===0));
  }
});
test('deterministic detached presentation buffers never mutate governed evidence',()=>{
  const before=JSON.stringify(field),a=rasterTile(field,7,32,54),b=rasterTile(field,7,32,54);
  assert.deepEqual(a.png,b.png);a.rgba.fill(255);a.indices.fill(0);
  assert.equal(JSON.stringify(field),before);assert.notDeepEqual(a.rgba,b.rgba);assert.ok(Object.isFrozen(field.grid.values));
});
