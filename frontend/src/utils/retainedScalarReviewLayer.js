import {orderPeloraLayers} from './peloraMapStyle.js';

// Presentation capability only: these pins identify one already-qualified retained
// pilot. They neither admit a provider nor qualify another date/product/coverage.
export const RETAINED_SST = Object.freeze({
  deliveryId:'osfd-7d3e484c466a91558b51ee1940e599003ae9136febb663ad010a8aab12c81820',
  archiveId:'opf-b01cd11c68de5bab89d2ac29d44ea04302f59ff57b417bf39f8f9c65aad08286',
  receiptDigest:'08a6a4286c5e43b04f601ddf2370e5054bf35a7ccf0276ccbc1ae25d5d936bb7',
  contentDigest:'c59c222c11fb85afe32d046c3c75e81fdcaaa330ac790917d1ec77cd123c8fbf',
  frameDigest:'544ef9db863f21b1286807680967c4782a0643cad8444222763728c3a68d4790',
  sourceSha256:'26fe69f0e376322fd2e81ecb9375e5737ede4134cbd9711608ee9c2e2253a843'
});
const INVALID='Invalid retained scalar review presentation';
function snapshot(value){
  if(value===null||['string','boolean'].includes(typeof value))return value;
  if(typeof value==='number'&&Number.isFinite(value))return value;
  if(!value||typeof value!=='object'||(!Array.isArray(value)&&Object.getPrototypeOf(value)!==Object.prototype))throw Error(INVALID);
  const descriptors=Object.getOwnPropertyDescriptors(value),array=Array.isArray(value);
  if(Reflect.ownKeys(descriptors).some(k=>typeof k!=='string'||k!=='length'&&(!descriptors[k].enumerable||!Object.hasOwn(descriptors[k],'value'))))throw Error(INVALID);
  if(array&&Object.keys(descriptors).length!==value.length+1)throw Error(INVALID);
  const result=array?value.map(snapshot):Object.fromEntries(Object.keys(descriptors).map(k=>[k,snapshot(descriptors[k].value)]));
  return Object.freeze(result);
}
function exactKeys(value,keys){if(!value||Object.keys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(value,k)))throw Error(INVALID);}
export function retainedScalarArtifact(input){
  const a=snapshot(input);
  exactKeys(a,['contractVersion','deliveryId','source','product','scalar','nominalAnalysisTime','observationTime','support','freshness','bounds','nativeDegrees','dimensions','policy']);
  exactKeys(a.source,['archiveId','receiptDigest','contentDigest','frameDigest','frameId']);
  exactKeys(a.product,['providerId','productId','productVersion','datasetId','evidenceClass','processingLevel','family']);
  exactKeys(a.scalar,['variableId','unit']);
  const product={providerId:'NOAA-NESDIS-OSPO',productId:'Geo_Polar_Blended_Night-OSPO-L4-GLOB-v1.0',productVersion:'1.0',datasetId:'noaacwBLENDEDsstDaily',evidenceClass:'ANALYSIS',processingLevel:'L4',family:'SST'};
  if(a.contractVersion!=='pelora-retained-scalar-review-v1'||a.deliveryId!==RETAINED_SST.deliveryId||
    ['archiveId','receiptDigest','contentDigest','frameDigest'].some(k=>a.source[k]!==RETAINED_SST[k])||
    a.source.frameId!=='noaa-geo-polar-20260922-gulf-'+RETAINED_SST.sourceSha256||
    Object.entries(product).some(([k,v])=>a.product[k]!==v)||a.scalar.variableId!=='analysed_sst'||a.scalar.unit!=='K'||
    a.nominalAnalysisTime!=='2026-09-22T12:00:00Z'||a.observationTime!==null||a.support!=='UNKNOWN'||a.freshness!=='UNASSESSED'||
    a.nativeDegrees!==.05||JSON.stringify(a.dimensions)!=='[360,260]'||
    JSON.stringify(a.bounds)!=='[-97.97500610351562,18.024999618530273,-80.02499389648438,30.975000381469727]')throw Error(INVALID);
  const policy={renderer:'pelora-pilot-display-domain-v1',ramp:'sst-review-ramp-v1',mask:'all-missing-transparent-v1',resampling:'pixel-center-source-cell-v1',projection:'EPSG:3857',size:256,displayDomainPolicy:'full-frame-minmax-outward-whole-F-v1',displayDomainK:[300.92777777777775,304.81666666666666],completeDerivativeId:a.deliveryId};
  exactKeys(a.policy,Object.keys(policy));
  if(Object.entries(policy).some(([k,v])=>JSON.stringify(a.policy[k])!==JSON.stringify(v)))throw Error(INVALID);
  return a;
}
export const RETAINED_REVIEW_NOTICE='HISTORICAL SST ANALYSIS — REVIEW ONLY · Analysis 22 Sep 2026 · 82–89°F · Observation time/support unknown · Freshness unassessed';
let instance=0;

/** No acquisition or default transport. Ports must be explicitly supplied by a
 * trusted review host. Tile production/verification stays outside the browser:
 * existing scalePolicy/scaleTile/tileIdentity, never numeric science duplication.
 */
export function createRetainedScalarReview({map,enabled=false,layer='sst',getArtifact,readTile,verifyTile,protocolPort,
  getAuthority,subscribeAuthority,isAttached=()=>true,now=Date.now,onState=()=>{},documentPort=globalThis.document,
  setTimer=globalThis.setInterval,clearTimer=globalThis.clearInterval}={}){
  enabled=enabled===true;
  const suffix=++instance,baseId='pelora-retained-scalar-review-'+suffix,scheme='pelora-retained-'+suffix;
  let sourceId=baseId+'-0',layerId=sourceId+'-raster';
  let disposed=false,generation=0,abort=null,artifact=null,owner=null,registered=false,heartbeat=null,notice=null,unsub=null;
  const tileAborts=new Set();let currentState=Object.freeze({status:'off',field:null,historical:true,reviewOnly:true});
  const emit=(status,reason=null)=>{currentState=Object.freeze({status,reason,field:artifact,historical:true,reviewOnly:true,notice:artifact?RETAINED_REVIEW_NOTICE:null});if(isAttached())onState(currentState);};
  const authority=()=>{try{const a=getAuthority?.(),t=now();return a?.authorized===true&&typeof a.ownerKey==='string'&&a.ownerKey&&Number.isSafeInteger(a.revision)&&a.revision>=0&&Number.isFinite(a.expiresAt)&&Number.isFinite(t)&&t<a.expiresAt?{ownerKey:a.ownerKey,revision:a.revision}:null;}catch{return null;}};
  const sameOwner=()=>{const a=authority();return isAttached()&&a&&owner&&a.ownerKey===owner.ownerKey&&a.revision===owner.revision;};
  const clear=()=>{
    abort?.abort();abort=null;for(const item of tileAborts)item.abort();tileAborts.clear();
    if(registered){try{protocolPort.removeProtocol(scheme);}catch{/* protocol teardown */}registered=false;}
    try{if(map?.getLayer(layerId))map.setLayoutProperty(layerId,'visibility','none');}catch{/* teardown */}
    try{if(map?.getLayer(layerId))map.removeLayer(layerId);}catch{/* teardown */}
    try{if(map?.getSource(sourceId))map.removeSource(sourceId);}catch{/* teardown */}
    notice?.remove();notice=null;artifact=null;
  };
  const reject=(reason)=>{if(disposed)return;generation++;clear();emit('unavailable',reason);};
  const check=()=>{if(disposed)return false;if(!sameOwner()){reject('Historical review authority unavailable');return false;}return true;};
  const live=token=>!disposed&&token===generation&&sameOwner();
  const apply=()=>{
    if(!enabled||!artifact||!check()||!map.isStyleLoaded())return;
    const token=generation,accepted=artifact;
    try{
      if(!registered){
        protocolPort.addProtocol(scheme,async(params,requestAbort)=>{
          // Closed local scheme; no URLs/paths/provider fallbacks reach the port.
          const match=new RegExp('^'+scheme+'://'+token+'/([0-9]+)/([0-9]+)/([0-9]+)$').exec(params.url);
          if(!match||!live(token))throw Error('Obsolete historical review tile');
          const [z,x,y]=match.slice(1).map(Number);
          if(![z,x,y].every(Number.isSafeInteger)||z<3||z>7||x<0||y<0||x>=2**z||y>=2**z)throw Error('Invalid historical review tile coordinates');
          if(tileAborts.size>=32)throw Error('Historical review tile capacity exceeded');
          const tileAbort=new AbortController();tileAborts.add(tileAbort);
          const cancelled=()=>tileAbort.abort();requestAbort.signal.addEventListener('abort',cancelled,{once:true});
          if(requestAbort.signal.aborted)tileAbort.abort();
          try{
            if(tileAbort.signal.aborted)throw Error('Cancelled historical review tile');
            const coordinates=Object.freeze({z,x,y});
            const tile=await readTile({artifact:accepted,coordinates,signal:tileAbort.signal});
            if(tileAbort.signal.aborted||!live(token))throw Error('Obsolete historical review tile');
            if(!tile||!/^spt-[a-f0-9]{64}$/.test(tile.id)||!(tile.data instanceof ArrayBuffer||tile.data instanceof Uint8Array)||tile.data.byteLength===0||tile.data.byteLength>1048576)throw Error('Rejected historical review tile');
            // The verification port gets a separate byte copy. Neither its await
            // nor mutation of the transport buffer can change the delivered bytes.
            const bytes=(tile.data instanceof Uint8Array?tile.data:new Uint8Array(tile.data)).slice();
            const verification=Object.freeze({id:tile.id,data:bytes.slice()});
            if(await verifyTile({artifact:accepted,coordinates,tile:verification,signal:tileAbort.signal})!==true)throw Error('Rejected historical review tile');
            if(tileAbort.signal.aborted||!live(token))throw Error('Obsolete historical review tile');
            return {data:bytes.buffer};
          }catch(error){if(!tileAbort.signal.aborted&&token===generation&&!disposed)reject(sameOwner()?'Historical review tile unavailable':'Historical review authority unavailable');throw Error('Historical review tile unavailable');}
          finally{tileAborts.delete(tileAbort);requestAbort.signal.removeEventListener('abort',cancelled);}
        });registered=true;
      }
      if(!map.getSource(sourceId))map.addSource(sourceId,{type:'raster',tiles:[scheme+'://'+token+'/{z}/{x}/{y}'],tileSize:256,bounds:[...artifact.bounds],minzoom:3,maxzoom:7});
      const definition={id:layerId,type:'raster',source:sourceId,metadata:{'pelora:visualSlot':'scalar'},layout:{visibility:'visible'},paint:{'raster-opacity':.85,'raster-resampling':'nearest','raster-fade-duration':0}};
      const ordered=orderPeloraLayers([...(map.getStyle()?.layers??[]).filter(l=>l.id!==layerId),definition]);
      const before=ordered[ordered.findIndex(l=>l.id===layerId)+1]?.id;
      if(!map.getLayer(layerId))map.addLayer(definition,before);
      else if(before){const layers=map.getStyle()?.layers??[];if(layers[layers.findIndex(l=>l.id===layerId)+1]?.id!==before)map.moveLayer(layerId,before);}
      if(documentPort&&map.getContainer&&!notice){notice=documentPort.createElement('div');notice.setAttribute('role','status');notice.dataset.retainedScalarReview='historical';notice.textContent=RETAINED_REVIEW_NOTICE;
        Object.assign(notice.style,{position:'absolute',left:'8px',bottom:'8px',maxWidth:'calc(100% - 16px)',padding:'6px',font:'12px system-ui',color:'#fff',background:'#101e29',pointerEvents:'none',zIndex:'1'});map.getContainer().appendChild(notice);}
      if(!live(token)){reject('Historical review authority unavailable');return;}
      if(currentState.status!=='historical-review'||currentState.field!==artifact)emit('historical-review');
    }catch{if(token===generation)reject('Historical review application unavailable');}
  };
  const refresh=async()=>{
    if(disposed)return;generation++;clear();sourceId=baseId+'-'+generation;layerId=sourceId+'-raster';
    if(!enabled){emit('off');return;}
    if(layer!=='sst'){emit('unavailable',layer==='chlorophyll'?'No qualified retained chlorophyll presentation':'Unsupported historical review layer');return;}
    if(!map||![getArtifact,readTile,verifyTile,getAuthority,protocolPort?.addProtocol,protocolPort?.removeProtocol].every(v=>typeof v==='function')){emit('unavailable','Historical review ports unavailable');return;}
    owner=authority();if(!owner){emit('unavailable','Historical review authority unavailable');return;}
    const token=generation;abort=new AbortController();const signal=abort.signal;emit('loading');
    try{const input=await getArtifact({signal});if(signal.aborted||!live(token)){if(token===generation&&!disposed&&!signal.aborted)reject('Historical review authority unavailable');return;}
      artifact=retainedScalarArtifact(input);apply();
    }catch{if(token===generation&&!disposed&&!signal.aborted)reject('Historical review artifact unavailable');}
  };
  const authChanged=()=>{if(enabled&&!disposed&&owner)check();};
  const mapError=event=>{if(event?.sourceId===sourceId&&!disposed)reject('Historical review texture unavailable');};
  if(enabled){map?.on('style.load',apply);map?.on('idle',apply);map?.on('error',mapError);
    if(typeof subscribeAuthority==='function')unsub=subscribeAuthority(authChanged);
    if(typeof setTimer==='function')heartbeat=setTimer(authChanged,1000);}
  const ready=refresh();
  return {ready,refresh,getState:()=>currentState,get sourceId(){return sourceId;},get layerId(){return layerId;},scheme,
    dispose(){if(disposed)return;disposed=true;generation++;clear();if(heartbeat!==null)clearTimer(heartbeat);unsub?.();map?.off('style.load',apply);map?.off('idle',apply);map?.off('error',mapError);currentState=Object.freeze({status:'off',field:null,historical:true,reviewOnly:true});if(isAttached())onState(currentState);}};
}
