// Task 11D.1: presentation-only statistics/domains. Never a scientific transform.
import {SST_RAMP} from '../../frontend/src/utils/syntheticSstDisplay.js';
import {POLICY, sourceIndex, lonLat, encodePng, tileIdentity} from '../scalar-tiles/presentationTiles.mjs';
const freeze = v => { if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
const finite = v => typeof v === 'number' && Number.isFinite(v);
export const fahrenheit = k => { if (!finite(k)) throw Error('Numeric temperature required'); return (k - 273.15) * 1.8 + 32; };
export const kelvin = f => { if (!finite(f)) throw Error('Numeric temperature required'); return (f - 32) / 1.8 + 273.15; };
// Hyndman–Fan type 7: linear rank interpolation, h=(n-1)*p. Statistics only.
export function percentile(sorted, p) {
  if (!sorted.length || !finite(p) || p < 0 || p > 1 || sorted.some((v,i)=>!finite(v)||(i && v < sorted[i-1]))) throw Error('Invalid quantile input');
  const h=(sorted.length-1)*p, lo=Math.floor(h), hi=Math.ceil(h);
  return sorted[lo]+(sorted[hi]-sorted[lo])*(h-lo);
}
export function distribution(field) {
  const {values,missing}=field.grid;
  if (values.length!==missing.length) throw Error('Mask alignment');
  values.forEach((v,i)=>{if(missing[i]===null?!finite(v):v!==null)throw Error('Invalid numeric/missing evidence');});
  const a=values.filter((_,i)=>missing[i]===null).sort((a,b)=>a-b);
  if(!a.length)throw Error('No valid evidence');
  const mean=a.reduce((s,x)=>s+x,0)/a.length;
  const statistics={min:a[0],max:a.at(-1),mean,median:percentile(a,.5),standardDeviation:Math.sqrt(a.reduce((s,x)=>s+(x-mean)**2,0)/a.length)};
  for(const p of [1,2,5,10,25,50,75,90,95,98,99])statistics[`p${String(p).padStart(2,'0')}`]=percentile(a,p/100);
  const stats=Object.fromEntries(Object.entries(statistics).map(([k,v])=>[k,{K:v,F:k==='standardDeviation'?v*1.8:fahrenheit(v)}]));
  const bins=Array.from({length:Math.ceil((Math.ceil(fahrenheit(a.at(-1))))-Math.floor(fahrenheit(a[0])))},(_,i)=>({lowF:Math.floor(fahrenheit(a[0]))+i,highF:Math.floor(fahrenheit(a[0]))+i+1,count:0}));
  for(const v of a)bins[Math.min(bins.length-1,Math.floor(fahrenheit(v))-bins[0].lowF)].count++;
  return freeze({count:a.length,missing:values.length-a.length,statistics:stats,histogram:bins,quantile:'Hyndman-Fan-type-7',stddev:'population',weighting:'equal-valid-cell'});
}
export function candidateScales(field) {
  const d=distribution(field), s=d.statistics;
  const candidates=[
    {id:'control',label:'A · Current provisional',kind:'ABSOLUTE SCALE',domainF:[32,86],domainPolicy:'fixed-32-86F-v1'},
    {id:'fixed',label:'B · Broad fixed absolute',kind:'ABSOLUTE SCALE',domainF:[70,95],domainPolicy:'fixed-70-95F-candidate-v1'},
    {id:'frame',label:'C · Full-frame min/max',kind:'FRAME-ADAPTIVE SCALE',domainF:[Math.floor(s.min.F),Math.ceil(s.max.F)],domainPolicy:'full-frame-minmax-outward-whole-F-v1'},
    {id:'robust',label:'D · Full-frame p02–p98',kind:'FRAME-ADAPTIVE SCALE',domainF:[s.p02.F,s.p98.F],domainPolicy:'full-frame-type7-p02-p98-v1'},
  ];
  return freeze(candidates.map(c=>{
    // Retain percentile source K exactly; don't round-trip it through Fahrenheit.
    const domainK=c.id==='robust'?[s.p02.K,s.p98.K]:c.domainF.map(kelvin);
    const valid=field.grid.values.filter((_,i)=>field.grid.missing[i]===null);
    const low=valid.filter(v=>v<domainK[0]).length, high=valid.filter(v=>v>domainK[1]).length;
    return {...c,domainK,completeDerivativeId:field.deliveryId,clipping:{low,high,total:low+high,percent:100*(low+high)/valid.length,
      atOrAboveUpper:valid.filter(v=>v>=domainK[1]).length}};
  }));
}
export function scaleColor(k,scale) {
  if(!finite(k))return null;
  const [lo,hi]=scale.domainK;
  if(!finite(lo)||!finite(hi)||lo>=hi)throw Error('Invalid display domain');
  const t=Math.max(0,Math.min(1,(k-lo)/(hi-lo)))*3, i=Math.min(2,Math.floor(t)), f=t-i;
  const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const a=rgb(SST_RAMP[i].color),b=rgb(SST_RAMP[i+1].color);
  return a.map((v,j)=>Math.round(v+(b[j]-v)*f));
}
export function scalePolicy(scale) {
  return freeze({...POLICY,renderer:'pelora-pilot-display-domain-v1',ramp:'sst-review-ramp-v1',
    displayDomainPolicy:scale.domainPolicy,displayDomainK:[...scale.domainK],completeDerivativeId:scale.completeDerivativeId});
}
export function scaleTile(field,scale,z,x,y) {
  if(scale.completeDerivativeId!==field.deliveryId)throw Error('Scale/derivative mismatch');
  const policy=scalePolicy(scale),id=tileIdentity(field.deliveryId,z,x,y,policy),size=policy.size;
  const rgba=new Uint8Array(size*size*4);
  for(let row=0;row<size;row++)for(let col=0;col<size;col++){
    const cell=sourceIndex(field,...lonLat(z,x,y,col+.5,row+.5,size));
    if(cell<0||field.grid.missing[cell]!==null)continue;
    const color=scaleColor(field.grid.values[cell],scale);
    if(!color)throw Error('Invalid source value');
    rgba.set([...color,255],(row*size+col)*4);
  }
  return {id,rgba,png:encodePng(size,size,rgba)};
}
// Numeric cell inspection bypasses the display policy entirely. No color inversion.
export function inspectCell(field,index) {
  if(!Number.isSafeInteger(index)||index<0||index>=field.grid.values.length)throw Error('Invalid cell index');
  const K=field.grid.values[index],missing=field.grid.missing[index];
  return freeze({K,F:K===null?null:fahrenheit(K),missing});
}
