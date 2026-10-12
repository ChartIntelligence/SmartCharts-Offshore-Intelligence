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
