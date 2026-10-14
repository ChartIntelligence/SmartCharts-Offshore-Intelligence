import assert from 'node:assert/strict';
import {createRetainedScalarReview,retainedScalarArtifact,RETAINED_SST,RETAINED_REVIEW_NOTICE} from '../retainedScalarReviewLayer.js';
// Synthetic presentation envelope uses pinned pilot identity, never fabricated NOAA values.
const fixture=()=>({contractVersion:'pelora-retained-scalar-review-v1',deliveryId:RETAINED_SST.deliveryId,
 source:{archiveId:RETAINED_SST.archiveId,receiptDigest:RETAINED_SST.receiptDigest,contentDigest:RETAINED_SST.contentDigest,frameDigest:RETAINED_SST.frameDigest,frameId:'noaa-geo-polar-20260922-gulf-'+RETAINED_SST.sourceSha256},
 product:{providerId:'NOAA-NESDIS-OSPO',productId:'Geo_Polar_Blended_Night-OSPO-L4-GLOB-v1.0',productVersion:'1.0',datasetId:'noaacwBLENDEDsstDaily',evidenceClass:'ANALYSIS',processingLevel:'L4',family:'SST'},scalar:{variableId:'analysed_sst',unit:'K'},nominalAnalysisTime:'2026-09-22T12:00:00Z',observationTime:null,support:'UNKNOWN',freshness:'UNASSESSED',bounds:[-97.97500610351562,18.024999618530273,-80.02499389648438,30.975000381469727],nativeDegrees:.05,dimensions:[360,260],
 policy:{renderer:'pelora-pilot-display-domain-v1',ramp:'sst-review-ramp-v1',mask:'all-missing-transparent-v1',resampling:'pixel-center-source-cell-v1',projection:'EPSG:3857',size:256,displayDomainPolicy:'full-frame-minmax-outward-whole-F-v1',displayDomainK:[300.92777777777775,304.81666666666666],completeDerivativeId:RETAINED_SST.deliveryId}});
function harness(extra={}){
 let clock=1000,owner={authorized:true,ownerKey:'SYNTHETIC-OWNER-A',revision:1,expiresAt:20000},artifactReads=0,tileReads=0,updates=0,style=true;
 const sources=new Map(),protocols=new Map(),timers=new Map(),events=new Map(),states=[];
 const layers=[{id:'background',type:'background'},{id:'pelora-bathymetry-shading',type:'raster'},{id:'coastline',type:'line'},{id:'pelora-geostrophic-arrows',type:'symbol'},{id:'ranked-opportunity',type:'symbol'}];
 const sibling=layers[3];let observer=null;
 const map={isStyleLoaded:()=>style,getStyle:()=>({layers}),getSource:id=>sources.get(id),getLayer:id=>layers.find(l=>l.id===id),
 addSource(id,data){sources.set(id,data);updates++;},removeSource:id=>sources.delete(id),addLayer(data,before){const i=layers.findIndex(l=>l.id===before);layers.splice(i<0?layers.length:i,0,data);updates++;},
 removeLayer(id){const i=layers.findIndex(l=>l.id===id);if(i>=0)layers.splice(i,1);},setLayoutProperty(id,k,v){map.getLayer(id).layout={...map.getLayer(id).layout,[k]:v};},
 moveLayer(id,before){const i=layers.findIndex(l=>l.id===id),[l]=layers.splice(i,1);layers.splice(layers.findIndex(l=>l.id===before),0,l);updates++;},
 on(n,fn){if(!events.has(n))events.set(n,new Set());events.get(n).add(fn);},off(n,fn){events.get(n)?.delete(fn);}};
 const options={map,enabled:true,getArtifact:async()=>{artifactReads++;return fixture();},readTile:async()=>{tileReads++;return {id:'spt-'+'a'.repeat(64),data:new Uint8Array([137,80,78,71])};},verifyTile:async()=>true,
 protocolPort:{addProtocol:(s,fn)=>protocols.set(s,fn),removeProtocol:s=>protocols.delete(s)},getAuthority:()=>owner,subscribeAuthority:fn=>{observer=fn;return()=>observer=null;},now:()=>clock,onState:s=>states.push(s),documentPort:null,setTimer:fn=>{timers.set(1,fn);return 1;},clearTimer:id=>timers.delete(id),...extra};
 const c=createRetainedScalarReview(options);
 return {c,options,map,sources,protocols,timers,events,states,sibling,get counts(){return {artifactReads,tileReads,updates};},setClock:t=>clock=t,setOwner:a=>owner=a,notify:()=>observer?.(),setStyle:value=>style=value,
 fire:n=>{for(const fn of [...events.get(n)??[]])fn();},tile:()=>protocols.get(c.scheme)({url:c.scheme+'://'+sources.get(c.sourceId).tiles[0].split('://')[1].split('/')[0]+'/5/8/13'},new AbortController())};
}
const raw=fixture(),before=JSON.stringify(raw),accepted=retainedScalarArtifact(raw);assert(Object.isFrozen(accepted.policy));assert.equal(JSON.stringify(raw),before);assert.equal(accepted.observationTime,null);assert.equal(accepted.freshness,'UNASSESSED');assert.equal(accepted.support,'UNKNOWN');
for(const mutate of [a=>a.deliveryId='osfd-'+'0'.repeat(64),a=>a.source.receiptDigest='0'.repeat(64),a=>a.product.datasetId='OTHER',a=>a.nominalAnalysisTime='2026-10-14T00:00:00Z',a=>a.observationTime=a.nominalAnalysisTime,a=>a.freshness='current',a=>a.policy.displayDomainK=[273.15,303.15],a=>a.policy.mask='filled',a=>a.bounds.reverse(),a=>a.dimensions=[2,2],a=>a.extra=true]){const value=fixture();mutate(value);assert.throws(()=>retainedScalarArtifact(value));}
const accessor=fixture();Object.defineProperty(accessor,'deliveryId',{get(){throw Error('must not execute accessor');},enumerable:true});assert.throws(()=>retainedScalarArtifact(accessor),/Invalid retained/);
console.log('PASS pinned exact retained metadata/policy/mask/geometry/time, immutable snapshot, malformed/cross-source/current claims and accessor rejection');
let h=harness({enabled:false});await h.c.ready;assert.equal(h.counts.artifactReads,0);assert.equal(h.protocols.size,0);assert.equal(h.timers.size,0);assert.equal(h.c.getState().status,'off');h.c.dispose();
h=harness({layer:'chlorophyll'});await h.c.ready;assert.equal(h.counts.artifactReads,0);assert.equal(h.c.getState().status,'unavailable');assert.match(h.c.getState().reason,/No qualified retained chlorophyll/);h.c.dispose();
console.log('PASS default OFF has no transport/map resources; unsupported chlorophyll cannot fabricate or pool source frames');
h=harness();await h.c.ready;assert.equal(h.c.getState().status,'historical-review');assert.equal(h.c.getState().notice,RETAINED_REVIEW_NOTICE);
assert(h.map.getStyle().layers.findIndex(l=>l.id===h.c.layerId)<h.map.getStyle().layers.findIndex(l=>l.id==='coastline'));
assert.equal(h.map.getLayer('pelora-geostrophic-arrows'),h.sibling);const source=h.sources.get(h.c.sourceId),count=h.counts.updates,field=h.c.getState().field;
for(let i=0;i<30;i++){h.fire('movestart');h.fire('moveend');h.fire('idle');}assert.equal(h.counts.artifactReads,1);assert.equal(h.counts.updates,count);assert.equal(h.c.getState().field,field);assert.equal(h.sources.get(h.c.sourceId),source);await h.tile();
h.sources.delete(h.c.sourceId);h.map.removeLayer(h.c.layerId);h.fire('style.load');assert(h.sources.has(h.c.sourceId));assert.equal(h.c.getState().field,field);h.c.dispose();assert.equal(h.protocols.size,0);assert.equal(h.timers.size,0);assert.equal(h.map.getLayer('pelora-geostrophic-arrows'),h.sibling);
console.log('PASS camera continuity/no artifact refresh, stable domain/identity, local protocol, scalar hierarchy, style reload, sibling preservation and resource disposal');
h=harness();await h.c.ready;h.setClock(20001);[...h.timers.values()][0]();assert.equal(h.c.getState().status,'unavailable');assert.equal(h.c.getState().field,null);assert.equal(h.protocols.size,0);assert(!h.sources.has(h.c.sourceId));h.fire('idle');h.fire('style.load');assert.equal(h.c.getState().field,null);h.c.dispose();
h=harness();await h.c.ready;h.setOwner({authorized:true,ownerKey:'SYNTHETIC-OWNER-A',revision:3,expiresAt:20000});h.notify();assert.equal(h.c.getState().field,null);h.c.dispose();
console.log('PASS no-movement expiry, immutable owner revision/roundtrip revocation and idle/style non-resurrection');
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
for(const end of ['dispose','expired','owner']){const d=deferred();h=harness({getArtifact:()=>d.promise});if(end==='dispose')h.c.dispose();if(end==='expired')h.setClock(20001);if(end==='owner')h.setOwner({authorized:true,ownerKey:'SYNTHETIC-B',revision:2,expiresAt:20000});d.resolve(fixture());await h.c.ready;assert.equal(h.c.getState().field,null);h.c.dispose();}
const oldArtifact=deferred();let artifactCall=0;h=harness({getArtifact:()=>++artifactCall===1?oldArtifact.promise:Promise.resolve(fixture())});await h.c.refresh();const newest=h.c.getState();oldArtifact.resolve(null);await h.c.ready;assert.equal(h.c.getState(),newest);h.c.dispose();
console.log('PASS obsolete/disposed/expired/owner artifact completion cannot publish or resurrect historical display');
for(const ending of ['dispose','expiry','cancel','verify-reject','read-fail']){const d=deferred();h=harness({readTile:()=>d.promise,verifyTile:async()=>ending!=='verify-reject'});await h.c.ready;const fn=h.protocols.get(h.c.scheme),cancel=new AbortController(),url=h.sources.get(h.c.sourceId).tiles[0].replace('{z}','5').replace('{x}','8').replace('{y}','13');const result=fn({url},cancel).catch(e=>e);if(ending==='dispose')h.c.dispose();if(ending==='expiry')h.setClock(20001);if(ending==='cancel')cancel.abort();if(ending==='read-fail')d.reject(Error('private raw body must not be state'));else d.resolve({id:'spt-'+'a'.repeat(64),data:new Uint8Array([137,80,78,71])});assert((await result) instanceof Error);if(['expiry','verify-reject','read-fail'].includes(ending)){assert.equal(h.c.getState().field,null);assert(!h.c.getState().reason.includes('private'));}if(ending==='cancel')assert(h.c.getState().field);h.c.dispose();}
console.log('PASS tile read/verification stage cancellation, expiry, disposal, fail-closed rejection and safe public reason');
h=harness({getArtifact:async()=>null});await h.c.ready;assert.equal(h.c.getState().status,'unavailable');h.c.dispose();
h=harness();h.map.addLayer=()=>{throw Error('synthetic addLayer failure');};await h.c.ready;assert.equal(h.c.getState().field,null);assert.equal(h.protocols.size,0);assert.equal(h.map.getLayer('pelora-geostrophic-arrows'),h.sibling);h.c.dispose();
console.log('PASS malformed artifact and map application failure remain local, cleared and unavailable');

// Verification and transport cannot mutate the bytes delivered after an await.
const verifying=deferred(),verifyStarted=deferred(),transportBytes=new Uint8Array([137,80,78,71]);
h=harness({readTile:async()=>({id:'spt-'+'a'.repeat(64),data:transportBytes}),verifyTile:async({tile})=>{verifyStarted.resolve();tile.data.fill(0);return verifying.promise;}});await h.c.ready;const immutableTile=h.tile();await verifyStarted.promise;transportBytes.fill(0);verifying.resolve(true);assert.deepEqual([...new Uint8Array((await immutableTile).data)],[137,80,78,71]);h.c.dispose();
const obsoleteTile=deferred(),tileStarted=deferred();h=harness({readTile:()=>{tileStarted.resolve();return obsoleteTile.promise;}});await h.c.ready;const oldSourceId=h.c.sourceId,lateTile=h.tile().catch(e=>e);await tileStarted.promise;await h.c.refresh();const currentArtifact=h.c.getState();obsoleteTile.reject(Error('old failure'));await lateTile;assert.equal(h.c.getState(),currentArtifact);assert.notEqual(h.c.sourceId,oldSourceId);h.c.dispose();
let attached=true;h=harness({isAttached:()=>attached});await h.c.ready;const publications=h.states.length;attached=false;h.fire('idle');assert.equal(h.c.getState().field,null);assert.equal(h.states.length,publications);assert.equal(h.protocols.size,0);h.c.dispose();
console.log('PASS immutable tile verification/transport bytes, obsolete tile failure locality, generation-specific sources and detached-map non-publication');

for(const enabled of ['true',1,null]){h=harness({enabled});await h.c.ready;assert.equal(h.c.getState().status,'off');assert.equal(h.counts.artifactReads,0);h.c.dispose();}
h=harness();h.setStyle(false);await h.c.ready;assert.equal(h.c.getState().status,'loading');assert.equal(h.protocols.size,0);h.setStyle(true);h.fire('idle');assert.equal(h.c.getState().status,'historical-review');assert.equal(h.counts.artifactReads,1);h.c.dispose();
console.log('PASS exact boolean activation and style-not-ready startup applies on idle without movement or artifact reacquisition');
