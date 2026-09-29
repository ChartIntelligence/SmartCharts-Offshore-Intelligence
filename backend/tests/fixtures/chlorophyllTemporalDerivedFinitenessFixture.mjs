// Qualification-only synthetic transport/history. No production history selector.
import {fields,parse,leaves,historyDiagnostic,extracted} from './crossRouteFinitenessAtomicityResumedFixture.mjs';
import {captureFixture} from './currentEvidenceCaptureFixture.mjs';
import {buildProductivityPersistence,buildClarityPersistence} from '../../server.js';
export {leaves,extracted};
export const consumers={productivity:buildProductivityPersistence,clarity:buildClarityPersistence};
export const times=['2026-09-23T00:00:00Z','2026-09-24T00:00:00Z'];
export async function endpoints(t,family='direct',values=[1e308,-1e308],represented=times){
 const points=[];
 for(let i=0;i<values.length;i++)points.push((await parse(t,fields.find(f=>f.id===family+':chlor_a'),'positive',values[i],{rowOverrides:{time:represented[i]}})).result);
 return points;
}
export function captureInput(point,family){const input=captureFixture(family==='direct'?'CHLOROPHYLL_DIRECT':'CHLOROPHYLL_GAP_FILLED');input.samples[0].point=Object.fromEntries(Object.keys(input.samples[0].point).map(k=>[k,point[k]]));return input;}
export const history=(points,kind)=>historyDiagnostic(points,kind);
export function run(points,kind){return consumers[kind]({historicalSnapshots:history(points,kind)});}
export const encoded=value=>JSON.parse(JSON.stringify(value,(_k,v)=>typeof v==='number'&&!Number.isFinite(v)?{nonfinite:String(v)}:Object.is(v,-0)?{signedZero:'-0'}:v));
