import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getCurrentConditionsPoint} from '../server.js';
import {encodeNormalizedCurrentHandoff} from '../normalizedEvidenceCapture.mjs';
import {SOURCE_NORMALIZATION_VERSION} from '../sourceNormalization.mjs';
import {acquireCurrentProviderPoint,currentProviderRequest,parseCurrentProviderResponse} from '../currentProviderAdapter.mjs';
import {cases,characterize,assessment,payload} from './fixtures/currentProviderCharacterization.mjs';
const baseline=JSON.parse(readFileSync(new URL('./fixtures/currentProviderBaseline.json',import.meta.url)));
for(const fixture of cases)test('baseline exact interactive parity: '+fixture.name,async()=>{
  const actual=await characterize(getCurrentConditionsPoint,encodeNormalizedCurrentHandoff,SOURCE_NORMALIZATION_VERSION,fixture);
  assert.deepEqual(actual,baseline.results.find(r=>r.name===fixture.name).result);
});
test('explicit time requests both vectors from selected coordinate',()=>{
 const url=currentProviderRequest(25,-90,{mode:'TIME',time:'2026-10-01T00:00:00.000Z'});
 assert.equal(decodeURIComponent(url.search.slice(1)),'u_current[(2026-10-01T00:00:00.000Z)][(25)][(-90)],v_current[(2026-10-01T00:00:00.000Z)][(25)][(-90)]');
});
for(const selector of [{mode:'TIME',time:'last'}, {mode:'TIME',time:'2026-02-30T00:00:00.000Z'}, {mode:'INDEX',index:0},{mode:'LATEST',time:'bad'},null])test('invalid selector fails closed '+JSON.stringify(selector),()=>assert.throws(()=>currentProviderRequest(25,-90,selector)));
test('injected transport has no global fallback',async()=>{
 const saved=globalThis.fetch;globalThis.fetch=()=>{throw new Error('forbidden global network');};
 try {
  let called=0;
  const actual=await acquireCurrentProviderPoint(25,-90,assessment,async url=>{called++;assert.equal(url.hostname,'coastwatch.noaa.gov');return payload();});
  assert.deepEqual(actual,parseCurrentProviderResponse(payload(),25,-90,assessment));assert.equal(called,1);
  await assert.rejects(()=>acquireCurrentProviderPoint(25,-90,assessment),/Explicit current provider transport/);
 } finally {globalThis.fetch=saved;}
});
test('adapter static isolation and single server parser',()=>{
 const source=readFileSync(new URL('../currentProviderAdapter.mjs',import.meta.url),'utf8');
 assert(!/from\s+['"](?:.*server|.*receipt|.*opportunity|.*persistence)/i.test(source));
 assert(!/\b(?:setTimeout|setInterval|process\.env|globalThis|new Map)\b/.test(source));
 const server=readFileSync(new URL('../server.js',import.meta.url),'utf8');
 const path=server.slice(server.indexOf('async function getCurrentConditionsPointAtAssessment'),server.indexOf('async function getCachedCurrentConditionsPointAtAssessment'));
 assert(path.includes('acquireCurrentProviderPoint'));assert(!path.includes('u_current'));assert(!path.includes('rows[0]'));
});
