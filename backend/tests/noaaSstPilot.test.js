// Offline retained-evidence pilot checks; never reacquire when evidence is absent.
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodeNetcdf} from '../../review/noaa-sst-pilot/netcdf.mjs';
import {DIRECTORY, METADATA, SOURCE_SHA256, verifyMetadata, validateDecoded, normalizePilot, buildPilot} from '../../review/noaa-sst-pilot/pilot.mjs';
import {pilotTile, PILOT_POLICY} from '../../review/noaa-sst-pilot/tiles.mjs';
import {tileIdentity} from '../../review/scalar-tiles/presentationTiles.mjs';
import {sstColor} from '../../frontend/src/utils/syntheticSstDisplay.js';
const json = p => JSON.parse(readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
assert.ok(existsSync(`${DIRECTORY}source.nc`), 'Retained pilot evidence required; tests never use network');
const bytes = readFileSync(`${DIRECTORY}source.nc`), n = decodeNetcdf(bytes), receipt = json(`${DIRECTORY}acquisition.receipt.json`);
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`PASS ${name}`); };
test('raw checksum and bounded transfer', () => {assert.equal(createHash('sha256').update(bytes).digest('hex'), SOURCE_SHA256); assert.equal(bytes.length, receipt.bodyBytes); assert.ok(receipt.receivedTlsBytes < 4194304); assert.equal(receipt.retries, 0); assert.equal(receipt.redirects, 0);});
const cmr = json(`${METADATA}cmr.json`), das = readFileSync(`${METADATA}current.das`, 'utf8'), time = json(`${METADATA}selected-time.json`);
test('source identity and explicit WGS84 datum', () => assert.equal(verifyMetadata(cmr, das, time), true));
test('ellipsoid alone is insufficient', () => {const c = structuredClone(cmr); delete c.SpatialExtent.HorizontalSpatialDomain.ResolutionAndCoordinateSystem.GeodeticModel.HorizontalDatumName; assert.throws(()=>verifyMetadata(c,das,time));});
test('actual coordinate required', () => {const t = structuredClone(time); t.table.rows[0][0]='2026-09-23T12:00:00Z'; assert.throws(()=>verifyMetadata(cmr,das,t));});
test('exact dimensions and native physical encoding', () => assert.equal(validateDecoded(n), n));
for (const [name, mutate] of [
  ['wrong dimensions', c => c.dimensions[1].length--],
  ['reversed latitude', c => c.variables.latitude.values.reverse()],
  ['wrong longitude', c => c.variables.longitude.values[0] = -98],
  ['unexpected packing', c => c.variables.analysed_sst.attributes.scale_factor = 0.01],
  ['unexpected fill', c => c.variables.analysed_sst.attributes._FillValue = -999],
  ['Celsius instead of Kelvin', c => c.variables.analysed_sst.attributes.units = 'degree_C'],
  ['uncertainty semantic mismatch', c => c.variables.analysis_error.attributes.long_name = 'confidence'],
  ['unknown combined mask', c => c.variables.mask.values[0] = 3],
  ['non-numeric science', c => c.variables.analysed_sst.values[0] = '301'],
  ['finite SST on land', c => c.variables.analysed_sst.values[0] = 301],
]) test(`reject ${name}`, () => {const c = structuredClone(n); mutate(c); assert.throws(()=>validateDecoded(c));});
test('truncated and unsupported NetCDF fail',()=>{assert.throws(()=>decodeNetcdf(bytes.subarray(0,200)));const b=Buffer.from(bytes);b[3]=5;assert.throws(()=>decodeNetcdf(b));});
const before = createHash('sha256').update(JSON.stringify(n)).digest('hex');
const {frame} = normalizePilot(n,receipt), components = frame.payload.components;
test('adapter preserves values/uncertainty/mask and land',()=>{
  components[0].values.forEach((value,i)=>{if(n.variables.mask.values[i]===2){assert.equal(value,null);assert.equal(components[0].missing[i],'land');}else assert.equal(value,n.variables.analysed_sst.values[i]);});
  const i=n.variables.mask.values.indexOf(1);assert.equal(components[1].values[i],n.variables.analysis_error.values[i]);assert.equal(components[1].unit,'K');assert.equal(components[2].values[i],1);
});
test('longitude mapping preserves source order',()=>{assert.deepEqual(frame.payload.axes.x,n.variables.longitude.values.map(x=>x-360));assert.deepEqual(frame.payload.axes.y,n.variables.latitude.values);});
test('no source mutation and immutable frame',()=>{assert.equal(createHash('sha256').update(JSON.stringify(n)).digest('hex'),before);assert.throws(()=>{frame.payload.components[0].values[0]=0;});});
test('nominal time is not observation/publication or invented support',()=>{assert.equal(frame.temporal.observationTime,null);assert.equal(frame.temporal.providerPublishedAt,null);assert.equal(frame.temporal.support.kind,'unknown');assert.equal(frame.product.evidenceClass,'ANALYSIS');});
const pilot=await buildPilot('2026-09-24T16:10:00.000Z');
test('real archive and scalar contract chain',()=>{assert.equal(pilot.summary.receipt.status,'ARCHIVED');assert.equal(pilot.field.source.frameId,frame.frameId);assert.equal(pilot.field.grid.width,360);assert.equal(pilot.field.grid.height,260);assert.deepEqual(pilot.field.grid.values,components[0].values);assert.deepEqual(pilot.field.grid.missing,components[0].missing);});
test('native nominal resolution separated from exact float-axis spacing',()=>{assert.equal(pilot.field.spatial.nativeResolution.x,0.05);assert.equal(pilot.field.spatial.deliveredResolution.x,null);});
test('raw and normalized identities separated',()=>{assert.notEqual(pilot.summary.receipt.contentDigest,SOURCE_SHA256);assert.equal(pilot.summary.receipt.rawEvidence[0].sha256,SOURCE_SHA256);});
test('tile identity deterministic and policy-sensitive',()=>{const args=[pilot.field.deliveryId,5,8,13];assert.equal(tileIdentity(...args,PILOT_POLICY),tileIdentity(...args,PILOT_POLICY));assert.notEqual(tileIdentity(...args,PILOT_POLICY),tileIdentity(...args,{...PILOT_POLICY,ramp:'other'}));});
test('source PNG alpha follows exact governed missingness',()=>{const t=pilotTile(pilot.field,5,8,13);for(let i=0;i<t.indices.length;i++){const cell=t.indices[i];assert.equal(t.rgba[i*4+3],cell<0||pilot.field.grid.missing[cell]!==null?0:255);}assert.ok(t.png.length>0);});
test('numeric zero maps to color; missing never maps to zero',()=>{assert.equal(sstColor(null),null);assert.ok(sstColor(0));});
test('pilot isolated from runtime and no guard selected',()=>{assert.equal(PILOT_POLICY.mask,'all-missing-transparent-v1');for(const file of ['../../backend/server.js','../../frontend/src/App.jsx']){const text=readFileSync(new URL(file,import.meta.url),'utf8');assert.ok(!text.includes('noaa-sst-pilot'));}const launch=readFileSync(new URL('../../review/noaa-sst-pilot/serve.mjs',import.meta.url),'utf8');assert.ok(launch.includes("server.listen(port, '127.0.0.1'"));});
console.log(`${passed} passed — retained NOAA pilot, offline only`);
