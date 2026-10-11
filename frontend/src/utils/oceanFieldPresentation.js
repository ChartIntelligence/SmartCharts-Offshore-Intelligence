export const FIELD_CONTROLS = [
  {key:"bathymetry",label:"Bathymetry · ETOPO"},
  {key:"currentField",label:"Geostrophic Surface Currents"}
];
export const FIELD_SOURCE = {bathymetry:"pelora-bathymetry-field",currents:"pelora-geostrophic-field"};
export const FIELD_LAYER = {bathymetry:"pelora-bathymetry-shading",currents:"pelora-geostrophic-arrows"};
export const EMPTY_FIELD = {type:"FeatureCollection",features:[]};
export const BATHYMETRY_CONTOUR_SOURCE="pelora-bathymetry-contours";
export const BATHYMETRY_CONTOUR_LAYERS=["pelora-bathymetry-minor","pelora-bathymetry-major","pelora-bathymetry-depth-labels"];
// Display intervals in source meters; these are not source/science thresholds.
export const BATHYMETRY_CONTOUR_LEVELS=Object.freeze([100,200,500,1000,1500,2000,2500,3000,3500,4000,4500,5000,5500,6000]);
// Presentation allocation guard, not scientific/source admission. Reject a
// pathological display rather than flood the map with ambiguous tiny segments.
export const BATHYMETRY_CONTOUR_MAX_FEATURES=6000;
export function bathymetryContourLabel(depthMeters,unit="feet") {
  return unit==="feet"?`${Math.round(depthMeters/0.3048).toLocaleString("en-US")} ft`:
    unit==="fathoms"?`${Math.round(depthMeters/1.8288).toLocaleString("en-US")} fm`:`${depthMeters.toLocaleString("en-US")} m`;
}
// Marching squares: interpolate only threshold-crossing LOCATION on a valid
// sample edge. No new depths, smoothing, extrapolation or missing-cell bridges.
export function bathymetryContours(field,unit="feet") {
  validateFieldPresentation(field,"bathymetry");
  const {longitudes:xs,latitudes:ys,values}=field.payload;
  const [west,south,east,north]=field.bounds;
  const features=[];let generatedSegments=0;
  const quads=[];
  for(let j=0;j+1<ys.length;j++)for(let i=0;i+1<xs.length;i++){
    // Do not bridge an absent source row/column beyond the delivered spacing.
    const support=field.resolution.deliveredDegrees*(1+1e-8);
    if(xs[i+1]-xs[i]>support||ys[j+1]-ys[j]>support)continue;
    const z=[values[j*xs.length+i],values[j*xs.length+i+1],values[(j+1)*xs.length+i+1],values[(j+1)*xs.length+i]];
    if(!z.every(v=>Number.isFinite(v)&&v<0)||xs[i]<west||xs[i+1]>east||ys[j]<south||ys[j+1]>north)continue;
    quads.push({z,min:Math.min(...z),max:Math.max(...z),points:[[xs[i],ys[j]],[xs[i+1],ys[j]],[xs[i+1],ys[j+1]],[xs[i],ys[j+1]]]});
  }
  const append=feature=>{if(features.length>=BATHYMETRY_CONTOUR_MAX_FEATURES)throw new Error("Bathymetry contour presentation exceeds complexity limit");features.push(feature);};
  for(const depthMeters of BATHYMETRY_CONTOUR_LEVELS){
    const segments=[],segmentKeys=new Set();
    const level=-depthMeters;
    for(const {z,points,min,max} of quads){
      if(level<min||level>=max)continue;
      // Canonical ascending edge direction makes shared endpoints byte-identical.
      const edgePairs=[[0,1],[1,2],[3,2],[0,3]],crossings=new Map();
      edgePairs.forEach(([a,b],edge)=>{
        if((z[a]<=level)===(z[b]<=level))return;
        const t=(level-z[a])/(z[b]-z[a]);
        if(!Number.isFinite(t)||!Number.isFinite(z[b]-z[a]))throw new Error("Invalid bathymetry contour arithmetic");
        crossings.set(edge,t===0?points[a]:t===1?points[b]:[points[a][0]+t*(points[b][0]-points[a][0]),points[a][1]+t*(points[b][1]-points[a][1])]);
      });
      let pairs=[];
      if(crossings.size===2)pairs=[[...crossings.keys()]];
      else if(crossings.size===4){
        // Asymptotic saddle decision from source corner differences only.
        // Exact ties keep the deep diagonal regions disconnected.
        const d=z.map(v=>v-level),q=d[0]*d[2]-d[1]*d[3];
        if(!Number.isFinite(q))throw new Error("Invalid bathymetry contour arithmetic");
        const connect02=q>0||(q===0&&z[0]>level);
        pairs=connect02?[[0,1],[2,3]]:[[0,3],[1,2]];
      }
      for(const [a,b] of pairs){const p=crossings.get(a),q=crossings.get(b);
        if(p[0]!==q[0]||p[1]!==q[1]){
          const pk=JSON.stringify(p),qk=JSON.stringify(q),segmentKey=pk<qk?`${pk}|${qk}`:`${qk}|${pk}`;
          // A threshold exactly on a shared sample edge can be emitted twice.
          // Deduplicate it without coordinate rounding/snap or tiny closed loops.
          if(segmentKeys.has(segmentKey))continue;segmentKeys.add(segmentKey);
          if(++generatedSegments>BATHYMETRY_CONTOUR_MAX_FEATURES)throw new Error("Bathymetry contour presentation exceeds complexity limit");
          segments.push([p,q]);}}
    }
    // Join degree-two vertices only. Ambiguous junctions stay separate rather
    // than inventing a connection between diagonal sample regions.
    const adjacency=new Map(),key=p=>JSON.stringify(p);
    segments.forEach((s,index)=>s.forEach(p=>{const k=key(p);if(!adjacency.has(k))adjacency.set(k,[]);adjacency.get(k).push(index);}));
    const used=new Set(),lines=[];
    const walk=(index,start)=>{const line=[start];let point=start;
      while(!used.has(index)){used.add(index);const s=segments[index];point=key(s[0])===key(point)?s[1]:s[0];line.push(point);
        const next=adjacency.get(key(point));if(next.length!==2)break;const candidate=next.find(n=>!used.has(n));if(candidate===undefined)break;index=candidate;}
      return line;};
    segments.forEach((s,index)=>{if(used.has(index))return;const start=s.find(p=>adjacency.get(key(p)).length!==2);if(start)lines.push(walk(index,start));});
    segments.forEach((s,index)=>{if(!used.has(index))lines.push(walk(index,s[0]));});
    const major=depthMeters===200||depthMeters%1000===0;
    // Smaller display intervals appear only regionally; no extra levels at
    // close zoom because magnification does not improve source resolution.
    const minZoom=major?0:depthMeters===100?8:6;
    lines.forEach((coordinates,index)=>{
      const properties={fieldId:field.fieldId,depthMeters,major,minZoom,
        label:bathymetryContourLabel(depthMeters,unit),representation:"marching-squares-linear-crossing"};
      const id=`${field.fieldId}:${depthMeters}:${index}`;
      append({type:"Feature",id,geometry:{type:"LineString",coordinates},properties});
      // One associated label per sufficiently long joined major line, never
      // every cell edge. Anchor on an existing vertex; do not smooth the line.
      const length=coordinates.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-coordinates[i][0],p[1]-coordinates[i][1]),0);
      if(major&&length>=field.resolution.deliveredDegrees*4)append({type:"Feature",id:`${id}:label`,
        geometry:{type:"Point",coordinates:coordinates[Math.floor(coordinates.length/2)]},properties});
    });
  }
  return {type:"FeatureCollection",features};
}
export function bathymetryContourLayerDefinitions(){
  const common={source:BATHYMETRY_CONTOUR_SOURCE,metadata:{"pelora:visualSlot":"relief"}};
  return [
    {...common,id:BATHYMETRY_CONTOUR_LAYERS[0],type:"line",filter:["all",["==",["geometry-type"],"LineString"],["==",["get","major"],false]],
      paint:{"line-color":"#668992","line-width":0.65,"line-opacity":["step",["zoom"],0,6,["case",["<=",["get","minZoom"],6],0.45,0],8,0.45]}},
    {...common,id:BATHYMETRY_CONTOUR_LAYERS[1],type:"line",filter:["all",["==",["geometry-type"],"LineString"],["==",["get","major"],true]],
      paint:{"line-color":"#8eaeb4","line-width":1.1,"line-opacity":0.65}},
    {...common,id:BATHYMETRY_CONTOUR_LAYERS[2],type:"symbol",minzoom:5,filter:["==",["geometry-type"],"Point"],
      layout:{"symbol-placement":"point","text-offset":[0,0.8],"text-anchor":"top","text-field":["get","label"],"text-font":["Open Sans Regular"],
        "text-size":11,"text-padding":8,"text-allow-overlap":false,"text-ignore-placement":false},
      paint:{"text-color":"#a6bfc3","text-halo-color":"#101e29","text-halo-width":1.5}}
  ];
}
// MapLibre 5.24 image textures have no mipmaps, but raster drawing requests a
// mipmap min filter. Scope this compatibility adapter to one bathymetry source;
// keep nearest sampling and let MapLibre own texture creation/binding/disposal.
export function installBathymetryTextureSampling(source,onFailure) {
  if(source?.type!=="image"||typeof source.prepare!=="function")throw new Error("Bathymetry texture API unavailable");
  const originalPrepare=source.prepare;
  let texture=null,originalBind=null,wrappedBind=null,disposed=false;
  const restoreTexture=()=>{
    if(texture?.bind===wrappedBind)texture.bind=originalBind;
    texture=null;originalBind=null;wrappedBind=null;
  };
  const prepare=function(...args){
    if(disposed)return originalPrepare.apply(this,args);
    try{
      const result=originalPrepare.apply(this,args);
      if(this.texture&&this.texture!==texture){
        restoreTexture();texture=this.texture;originalBind=texture.bind;
        const bind=originalBind;
        const gl=texture.context?.gl;
        if(typeof originalBind!=="function"||typeof gl?.texParameteri!=="function"||
          ![gl.NEAREST,gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER].every(Number.isFinite)||
          typeof texture.useMipmap!=="boolean")throw new Error("Bathymetry texture API unavailable");
        wrappedBind=function(filter,wrap,minFilter){
          try{
            if(disposed||this!==texture||source.texture!==texture)return bind.call(this,filter,wrap,minFilter);
            const nearest=filter===gl.NEAREST&&this.useMipmap===false;
            const result=bind.call(this,filter,wrap,nearest?gl.NEAREST:minFilter);
            // Also correct an existing texture whose cached filter already matches.
            if(nearest)gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
            return result;
          }catch(error){if(!disposed&&this===texture&&source.texture===texture)onFailure(error);}
        };
        texture.bind=wrappedBind;
      }
      return result;
    }catch(error){onFailure(error);}
  };
  source.prepare=prepare;
  return()=>{disposed=true;if(source.prepare===prepare)source.prepare=originalPrepare;restoreTexture();};
}
export function sampleLayersForMode(layers, qaEnabled=false) {
  return qaEnabled ? layers : {...layers,temperatureSamples:false,chlorophyll:false,currents:false};
}
export function fieldViewport(bounds,zoom) {
  let west=bounds.getWest(), east=bounds.getEast();
  if (east-west>=360) {west=-180;east=180;}
  else {const offset=360*Math.floor((west+180)/360);west-=offset;east-=offset;}
  if (east>180 || west>=east) throw new Error("Dateline view: split viewport support is not yet available");
  const south=Math.max(-85,bounds.getSouth()), north=Math.min(85,bounds.getNorth());
  return {bbox:[Math.floor(west*100)/100,Math.floor(south*100)/100,Math.ceil(east*100)/100,Math.ceil(north*100)/100],
    currentDensity:zoom<4?8:zoom<6?12:20,bathymetryDensity:48};
}
export function currentFieldGeoJson(field) {
  if (!field) return EMPTY_FIELD;
  validateFieldPresentation(field,"currents");
  return {type:"FeatureCollection",features:field.payload.cells.flatMap(([lon,lat,u,v])=>{
    if (![lon,lat,u,v].every(Number.isFinite) || Math.hypot(u,v)===0) return [];
    return [{type:"Feature",geometry:{type:"Point",coordinates:[lon,lat]},properties:{
      directionDegrees:(Math.atan2(u,v)*180/Math.PI+360)%360,speedMetersPerSecond:Math.hypot(u,v),
      validTime:field.validTime,fieldId:field.fieldId}}];
  })};
}
export function fieldStatusText(layer,state,now=Date.now()) {
  const defaultLabel=layer==="bathymetry"?"Bathymetry · ETOPO":"Geostrophic surface currents · NOAA";
  if (!state?.field) return `${defaultLabel} · ${state?.status ?? "loading"}${state?.reason ? `: ${state.reason}` : ""}`;
  const field=state.field;
  const label = field.displayName && field.provider ? `${field.displayName} · ${field.provider}` : defaultLabel;
  const age=field.validTime?Math.max(0,(now-Date.parse(field.validTime))/3600000):null;
  const status=state.status==="degraded"?"degraded; retained field":field.freshness.maxFreshAgeHours!==null && age>field.freshness.maxFreshAgeHours?"stale · latest available":field.status;
  const time=field.validTime?`valid ${new Date(field.validTime).toISOString().slice(0,16).replace("T"," ")} UTC · ${Math.floor(age)}h old`:`edition ${field.productVersion ?? "2022"}`;
  return `${label} · ${time} · ${status} · ${field.coverage.validCells}/${field.coverage.returnedCells} valid cells · ${field.resolution.deliveredDegrees.toFixed(3)}° grid${state.status==="loading"?" · updating":""}${state.reason ? ` · Refresh failed: ${state.reason}` : ""}`;
}
export function fieldLayerDefinitions() {
  return [
    {id:FIELD_LAYER.bathymetry,type:"raster",source:FIELD_SOURCE.bathymetry,
      paint:{"raster-opacity":0.85,"raster-resampling":"nearest","raster-fade-duration":0}},
    {id:FIELD_LAYER.currents,type:"symbol",source:FIELD_SOURCE.currents,
      layout:{"icon-image":"pelora-field-current-arrow","icon-rotate":["get","directionDegrees"],
        "icon-rotation-alignment":"map","icon-pitch-alignment":"map","icon-allow-overlap":true,
        "icon-ignore-placement":true,"icon-size":["step",["get","speedMetersPerSecond"],0.7,0.5,0.9,1,1.1]}}
  ];
}
// Insert below existing context layers; never move raw fields above ranked targets.
export function fieldInsertBefore(map) {
  const layers=map.getStyle()?.layers ?? [];
  return layers.find(l=>!Object.values(FIELD_LAYER).includes(l.id)&&!BATHYMETRY_CONTOUR_LAYERS.includes(l.id)&&
    (l.id.startsWith("pelora-")||l.id.startsWith("structure-")||l.id.startsWith("fad-")||l.type==="symbol"))?.id;
}
const mercator = latitude => Math.log(Math.tan(Math.PI/4+latitude*Math.PI/360));
// Validate the legacy spatial presentation contract, not source admission/science.
export function validateFieldPresentation(field,layer) {
  const fail=()=>{throw new Error(`Invalid ${layer} field presentation`);};
  const finiteOrMissing=value=>value===null||Number.isFinite(value);
  const {payload:p,bounds:b,resolution:r,coverage:c}=field;
  if(field.contractVersion!=="pelora-spatial-field-v1"||field.layer!==layer||
    typeof field.fieldId!=="string"||!field.fieldId||
    !["static","stale","latest-available"].includes(field.status)||
    !(field.validTime===null||typeof field.validTime==="string"&&Number.isFinite(Date.parse(field.validTime)))||
    !field.freshness||!(field.freshness.maxFreshAgeHours===null||
      Number.isFinite(field.freshness.maxFreshAgeHours)&&field.freshness.maxFreshAgeHours>=0)||
    !Array.isArray(b)||b.length!==4||!b.every(Number.isFinite)||
    b[0]<-180||b[2]>180||b[1]<-90||b[3]>90||b[0]>=b[2]||b[1]>=b[3]||
    !r||!Number.isFinite(r.deliveredDegrees)||r.deliveredDegrees<=0||
    !c||!Number.isSafeInteger(c.validCells)||!Number.isSafeInteger(c.returnedCells)||
    c.validCells<0||c.returnedCells<c.validCells||!p)fail();
  if(layer==="bathymetry") {
    const axis=(a,min,max)=>Array.isArray(a)&&a.length>0&&a.every((v,i)=>Number.isFinite(v)&&v>=min&&v<=max&&(i===0||v>a[i-1]));
    if(field.payloadType!=="rectilinear-elevation-grid"||p.type!==field.payloadType||
      p.order!=="latitude-ascending-rows,longitude-ascending-columns"||p.positive!=="up"||
      !axis(p.longitudes,-180,180)||!axis(p.latitudes,-90,90)||
      !Array.isArray(p.values)||p.values.length!==p.longitudes.length*p.latitudes.length||
      !p.values.every(finiteOrMissing))fail();
  } else if(layer==="currents") {
    if(field.payloadType!=="geostrophic-vector-grid"||p.type!==field.payloadType||
      p.coordinateOrder!=="longitude,latitude,u,v"||p.directionConvention!=="degrees-toward"||
      p.interpolation!=="none"||!Array.isArray(p.cells)||p.cells.length!==c.returnedCells||
      !p.cells.every(cell=>Array.isArray(cell)&&cell.length===4&&
        Number.isFinite(cell[0])&&cell[0]>=-180&&cell[0]<=180&&
        Number.isFinite(cell[1])&&cell[1]>=-90&&cell[1]<=90&&
        cell.slice(2).every(finiteOrMissing)&&
        (!cell.slice(2).every(Number.isFinite)||Number.isFinite(Math.hypot(cell[2],cell[3])))))fail();
  } else fail();
  const valid=layer==="currents"?p.cells.filter(cell=>cell.slice(2).every(Number.isFinite)).length:
    p.values.filter(Number.isFinite).length;
  if(valid!==c.validCells)fail();
}
export function bathymetryRasterPlan(field) {
  validateFieldPresentation(field,"bathymetry");
  const {longitudes:xs,latitudes:ys,values}=field.payload;
  if (!xs.length||!ys.length) return null;
  const half=field.resolution.deliveredDegrees/2;
  const west=Math.max(-180,field.bounds[0],xs[0]-half), east=Math.min(180,field.bounds[2],xs.at(-1)+half);
  const south=Math.max(-85,field.bounds[1],ys[0]-half), north=Math.min(85,field.bounds[3],ys.at(-1)+half);
  if(west>=east||south>=north)return null;
  const width=512,height=512,top=mercator(north),bottom=mercator(south);
  const pixelX=x=>(x-west)/(east-west)*width;
  const pixelY=y=>(top-mercator(Math.max(south,Math.min(north,y))))/(top-bottom)*height;
  const rectangles=[];
  ys.forEach((lat,j)=>xs.forEach((lon,i)=>{
    const z=values[j*xs.length+i];
    if(!Number.isFinite(z)||z>=0)return;
    const left=i? (xs[i-1]+lon)/2:lon-half, right=i<xs.length-1?(lon+xs[i+1])/2:lon+half;
    const low=j?(ys[j-1]+lat)/2:lat-half,high=j<ys.length-1?(lat+ys[j+1])/2:lat+half;
    rectangles.push({x:pixelX(left),y:pixelY(high),width:pixelX(right)-pixelX(left),height:pixelY(low)-pixelY(high),
      color:z< -4000?"#204e72":z< -2000?"#39849a":z< -1000?"#60a6ad":z< -200?"#89c5bd":"#c9d9bd"});
  }));
  return {width,height,coordinates:[[west,north],[east,north],[east,south],[west,south]],rectangles};
}
export function bathymetryImage(field,documentImpl=document) {
  const plan=bathymetryRasterPlan(field); if(!plan)return null;
  const canvas=documentImpl.createElement("canvas");canvas.width=plan.width;canvas.height=plan.height;
  const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Bathymetry canvas unavailable");
  for(const r of plan.rectangles){ctx.fillStyle=r.color;ctx.fillRect(r.x,r.y,r.width,r.height);}
  return {url:canvas.toDataURL("image/png"),coordinates:plan.coordinates};
}
