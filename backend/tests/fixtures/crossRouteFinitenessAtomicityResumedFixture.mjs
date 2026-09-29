import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getSstSpatialStructure} from '../../server.js';
import {assessment} from './sourceNormalizationFixture.mjs';
export {fields,parse,encode} from './sourceNormalizationFixture.mjs';
export {nonfinitePaths} from './crossRouteFinitenessFixture.mjs';
// Execute verbatim leaf producers, avoiding assessOceanEvidence's quarantined Ocean Physics chain.
const source=readFileSync(new URL('../../server.js',import.meta.url),'utf8');
export const extracted=[];
function body(name){const start=source.indexOf('function '+name+'(');assert(start>0);const end=source.indexOf('\n}',start)+2;assert(end>start);const code=source.slice(start,end);extracted.push({name,line:source.slice(0,start).split('\n').length,sha256:createHash('sha256').update(code).digest('hex')});return code;}
const constant=source.match(/const CHLOROPHYLL_MAX_LIVE_AGE_HOURS\s*=\s*\d+;/)?.[0];assert(constant);
const code=[constant,body('classifyChlorophyll'),body('classifySeaSurfaceTemperature'),body('buildProductivityEvidence'),body('buildClarityEvidence'),body('buildTemperatureEvidence')].join('\n');
export const leaves=new Function('"use strict";'+code+';return {buildProductivityEvidence,buildClarityEvidence,buildTemperatureEvidence};')();
let clock=Date.parse('2800-01-01');
export async function mixedSst(t,values){
 const now=t.mock.method(Date,'now',()=>clock);clock+=86400000;
 const fetch=t.mock.method(globalThis,'fetch',async input=>{const u=new URL(input);assert.equal(u.hostname,'marine-api.open-meteo.com');const lat=Number(u.searchParams.get('latitude')),lon=Number(u.searchParams.get('longitude'));const role=lat>25?'north':lat<25?'south':lon>-90?'east':'west';
 return {ok:true,json:async()=>({latitude:lat,longitude:lon,current:{time:'2026-09-24T00:00:00Z',sea_surface_temperature:values[role]}})};});
 try{return await getSstSpatialStructure(25,-90,77,assessment);}finally{fetch.mock.restore();now.mock.restore();}
}
export function historyDiagnostic(points,kind){
 // Synthetic historical container adapter only. Scientific evidence is the unchanged leaf producer output.
 // Does not claim database/publication/default history integration or history-selection qualification.
 const producer=kind==='productivity'?leaves.buildProductivityEvidence:leaves.buildClarityEvidence;
 return points.map((point,i)=>({snapshot:{available:true,identity:{snapshotId:'numeric-diagnostic-'+i},metadata:{time:{observedAt:point.observedAt}},observation:{evidence:{groups:{[kind]:producer(point)}}}}}));
}
