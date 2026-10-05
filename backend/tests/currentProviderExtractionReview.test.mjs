import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {discoverModuleSourceClosure} from './fixtures/moduleSourceClosureFixture.mjs';
import {verifyExtractionGraph,extractionContract} from './fixtures/currentProviderExtractionReview.mjs';
import {currentProviderRequest,acquireCurrentProviderPoint} from '../currentProviderAdapter.mjs';
import {assessment,payload} from './fixtures/currentProviderCharacterization.mjs';
const sources=Object.fromEntries(['backend/server.js','backend/scientificAssessment.mjs','backend/currentProviderAdapter.mjs'].map(p=>[p,readFileSync(new URL('../../'+p,import.meta.url),'utf8')]));
function graph(input=sources){return discoverModuleSourceClosure({readSource:p=>input[p],allowedFiles:Object.keys(input),roots:['backend/server.js','backend/scientificAssessment.mjs'],entry:'backend/server.js::getOceanConditions',transportRule:{caller:'backend/server.js::getCurrentConditionsPointAtAssessment',callee:'backend/currentProviderAdapter.mjs::acquireCurrentProviderPoint',parameter:'transport',index:3,argument:'fetchJson'}});}
test('reviewed extraction correspondence is deterministic and bounded',()=>{const g=graph();assert.deepEqual(g,graph());verifyExtractionGraph(g,sources);assert.equal(extractionContract.correspondence.relocated.length,5);assert.equal(extractionContract.correspondence.additional.length,4);});
for(const [label,change] of [
 ['missing relocated helper',s=>s.replace('export function currentDirectionDegrees','export function removedDirection')],
 ['additional dependency',s=>s.replace('return parseCurrentProviderResponse(payload,','unexpected(); return parseCurrentProviderResponse(payload,')+'\nfunction unexpected(){return 1;}'],
 ['additional callback',s=>s.replace('const payload = await transport','[1].map(x=>x); const payload = await transport')],
 ['lost no-valid-pixel handling',s=>s.replaceAll('"no-valid-pixel"','"available"')],
 ['downstream availability inversion',s=>s.replace('? "available"','? "unavailable"')]
])test('negative control rejects '+label,()=>{const altered={...sources,'backend/currentProviderAdapter.mjs':change(sources['backend/currentProviderAdapter.mjs'])};assert.throws(()=>verifyExtractionGraph(graph(altered),altered));});
test('negative control rejects redirected transport',()=>{const altered={...sources,'backend/server.js':sources['backend/server.js'].replace('assessment, fetchJson','assessment, fetch')};assert.notEqual(altered['backend/server.js'],sources['backend/server.js']);assert.throws(()=>verifyExtractionGraph(graph(altered),altered));});
test('negative control rejects interactive selector change',()=>{const altered={...sources,'backend/server.js':sources['backend/server.js'].replace("{mode:'LATEST'}","{mode:'TIME',time:'2026-10-01T00:00:00.000Z'}")};assert.notEqual(altered['backend/server.js'],sources['backend/server.js']);assert.throws(()=>verifyExtractionGraph(graph(altered),altered));});
test('negative control rejects callback target substitution with unchanged totals',()=>{const g=graph();g.callbacks[0].target='differentTarget';assert.throws(()=>verifyExtractionGraph(g,sources));});
test('new explicit TIME selector accepts exact UTC seconds/milliseconds without changing payload authority',async()=>{for(const time of ['2026-10-01T00:00:00Z','2026-10-01T00:00:00.123Z']){let calls=0;const point=await acquireCurrentProviderPoint(25,-90,assessment,async url=>{calls++;assert.equal(decodeURIComponent(url.search.slice(1)),`u_current[(${time})][(25)][(-90)],v_current[(${time})][(25)][(-90)]`);return payload();},{mode:'TIME',time});assert.equal(calls,1);assert.equal(point.observedAt,'2026-10-01T00:00:00.000Z');assert.equal(point.source.availability,'available');}});
test('new explicit selector rejects unsupported forms before transport',async()=>{for(const selector of [{mode:'TIME',time:'2026-10-01'},{mode:'TIME',time:'2026-10-01T00:00:00+00:00'},{mode:'TIME',time:'2026-10-01T00:00:00.12Z'},{mode:'TIME',time:'2026-13-01T00:00:00Z'},{mode:'TIME',time:'2026-10-01T00:00:00Z',extra:1},'LATEST',{},42]){let calls=0;await assert.rejects(()=>acquireCurrentProviderPoint(25,-90,assessment,async()=>{calls++;return payload();},selector));assert.equal(calls,0);}});
test('LATEST remains explicit last-coordinate selection',()=>{assert.match(decodeURIComponent(currentProviderRequest(25,-90).search),/u_current\[\(last\)\]/);});
