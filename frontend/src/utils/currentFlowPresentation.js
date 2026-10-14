import {validateFieldPresentation} from "./oceanFieldPresentation.js";
// Point-anchored direction glyph. No geographic advection, interpolation,
// trajectory coordinates, invented velocities or persistent particle trails.
export const CURRENT_TRACE_IMAGE='pelora-field-current-trace';
export const CURRENT_TRACE_FRAME_MS=80;
export function currentTraceMayAnimate(state,now){
  const field=state?.field,limit=field?.freshness?.maxFreshAgeHours;
  const time=field?.validTime?Date.parse(field.validTime):NaN,age=(now-time)/3600000;
  return state?.status==='latest-available'&&field?.status==='latest-available'&&
    Number.isFinite(limit)&&limit>=0&&Number.isFinite(age)&&age>=0&&age<=limit;
}
export function currentTracePixels(phase=0,moving=false,present=true){
  const data=new Uint8Array(32*32*4);if(!present)return data;
  // Existing map symbol rotation supplies direction. Pulse time is display time,
  // not travel time or a simulation of measured current speed.
  for(let y=5;y<=27;y++)for(let x=15;x<=17;x++){
    const offset=(y*32+x)*4,progress=(27-y)/22;
    const pulse=moving?Math.max(0,1-Math.abs(progress-phase)*5):.6;
    data.set([92,188,200,Math.round(70+150*pulse)],offset);
  }
  for(let y=4;y<=8;y++)for(let x=16-(y-4);x<=16+(y-4);x++){
    data.set([92,188,200,210],(y*32+x)*4);
  }
  return data;
}
export function createCurrentTraceImage({environment=globalThis,onFailure=()=>{}}={}){
  const media=environment.matchMedia?.('(prefers-reduced-motion: reduce)'),doc=environment.document;
  let map=null,state=null,disposed=false,timer=null,revision=0,dirty=true,lastFrame=-1;
  const now=()=>environment.Date?.now?.()??Date.now();
  const allowed=()=>!!media&&!media.matches&&!doc?.hidden&&currentTraceMayAnimate(state,now());
  const cancel=()=>{if(timer!==null)environment.clearTimeout(timer);timer=null;};
  const fail=(error,field,token)=>{if(field&&!disposed&&token===revision&&state?.field===field){cancel();onFailure(error,field);}};
  const requestFrame=()=>{
    if(disposed||!map||timer!==null||!allowed())return;
    const token=revision,field=state?.field;
    timer=environment.setTimeout(()=>{
      if(disposed||!map||token!==revision)return;timer=null;
      try{map.triggerRepaint();requestFrame();}catch(error){fail(error,field,token);}
    },CURRENT_TRACE_FRAME_MS);
  };
  const refresh=()=>{cancel();dirty=true;lastFrame=-1;
    try{map?.triggerRepaint();requestFrame();}catch(error){fail(error,state?.field,revision);}};
  const changed=()=>{if(!disposed)refresh();};
  media?.addEventListener?.('change',changed);doc?.addEventListener?.('visibilitychange',changed);
  const image={width:32,height:32,data:currentTracePixels(0,false,false),
    onAdd(attached){if(disposed)return;revision++;map=attached;refresh();},
    onRemove(){revision++;map=null;cancel();},
    render(){
      if(disposed)return false;
      const moving=allowed(),frame=moving?Math.floor(now()/CURRENT_TRACE_FRAME_MS):0;
      if(!dirty&&frame===lastFrame)return false;
      const field=state?.field,token=revision;
      try{image.data=currentTracePixels((frame%16)/15,moving,!!field);dirty=false;lastFrame=frame;return true;}
      catch(error){fail(error,field,token);return false;}
    }};
  return {image,setState(next){if(disposed||state===next)return;revision++;state=next;refresh();},
    clear(){if(disposed)return;revision++;state=null;refresh();},
    dispose(){if(disposed)return;disposed=true;revision++;state=null;map=null;cancel();
      media?.removeEventListener?.('change',changed);doc?.removeEventListener?.('visibilitychange',changed);
      image.data=currentTracePixels(0,false,false);},
    isAnimating:()=>!disposed&&!!map&&allowed()};
}

// Numeric presentation equivalent of sourceScaledNumber(value, 1.94384).
// This seam accepts already validated numeric m/s, not provider strings.
export function currentSpeedKnots(value){
  if(!Number.isFinite(value))return null;
  const knots=value*1.94384;
  if(!Number.isFinite(knots))return null;
  return Object.is(knots,-0)?-0:Number(knots.toFixed(1));
}

export function currentSampleReadout(state,selection,now=Date.now()){
  const emitted=["latest-available","stale","loading","degraded","unavailable","error","off"];
  const requestStatus=emitted.includes(state?.status)?state.status:"unavailable";
  const empty=Object.freeze({status:requestStatus,sample:null});
  const field=state?.field;
  if(!field||!selection||["off","unavailable","error"].includes(requestStatus))return empty;
  if(selection.fieldId!==field.fieldId||!Number.isSafeInteger(selection.sampleIndex)||selection.sampleIndex<0)return empty;
  try{validateFieldPresentation(field,"currents");}catch{return {status:"unavailable",sample:null};}
  const cell=field.payload.cells[selection.sampleIndex];
  if(!cell||!cell.every(Number.isFinite))return empty;
  const [lon,lat,u,v]=cell,speed=Math.hypot(u,v),knots=currentSpeedKnots(speed);
  if(knots===null)return {status:"unavailable",sample:null};
  if(!Number.isFinite(now)||!Number.isFinite(new Date(now).getTime()))return {status:"unavailable",sample:null};
  const limit=field.freshness.maxFreshAgeHours;
  if(!Number.isFinite(limit)||limit<0||!["latest-available","stale"].includes(field.status))return {status:"unavailable",sample:null};
  const ageHours=(now-Date.parse(field.validTime))/3600000;
  if(!Number.isFinite(ageHours)||ageHours<0)return {status:"unavailable",sample:null};
  const freshnessStatus=field.status==="stale"||ageHours>limit?"stale":"latest-available";
  const status=requestStatus==="latest-available"?freshnessStatus:requestStatus;
  return Object.freeze({status,sample:Object.freeze({fieldId:field.fieldId,sampleIndex:selection.sampleIndex,
    coordinates:Object.freeze([lon,lat]),validTime:field.validTime,ageAsOf:new Date(now).toISOString(),ageHours,units:"kt",speedMetersPerSecond:speed,speedKnots:knots,
    directionDegrees:speed===0?null:(Math.atan2(u,v)*180/Math.PI+360)%360,
    isZeroVector:speed===0,roundedNonzero:speed>0&&knots===0,freshnessStatus})});
}

// An invalidated selection cannot revive until the consumer clears or selects another cell.
export function createCurrentSampleSelection(){
  let selection=null,key=null,blocked=null,state={status:"unavailable",field:null};
  const identity=value=>value&&typeof value.fieldId==="string"&&Number.isSafeInteger(value.sampleIndex)&&value.sampleIndex>=0
    ?JSON.stringify([value.fieldId,value.sampleIndex]):null;
  return {
    select(value){const next=identity(value);if(next!==key)blocked=null;
      key=next;selection=next?{fieldId:value.fieldId,sampleIndex:value.sampleIndex}:null;
      if(["off","unavailable","error"].includes(state.status))blocked=key;},
    update(next){
      if(state.field&&next.field!==state.field||["off","unavailable","error","malformed-success"].includes(next.status))blocked=key;
      state=next;
      if(selection&&next.field&&selection.fieldId!==next.field.fieldId)blocked=key;
    },
    invalidate(status="unavailable"){blocked=key;state={status,field:null};},
    read(now=Date.now()){return currentSampleReadout(state,blocked!==null&&blocked===key?null:selection,now);}
  };
}
