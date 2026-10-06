export const FIELD_CONTROLS = [
  {key:"bathymetry",label:"Bathymetry · ETOPO"},
  {key:"currentField",label:"Geostrophic Surface Currents"}
];
export const FIELD_SOURCE = {bathymetry:"pelora-bathymetry-field",currents:"pelora-geostrophic-field"};
export const FIELD_LAYER = {bathymetry:"pelora-bathymetry-shading",currents:"pelora-geostrophic-arrows"};
export const EMPTY_FIELD = {type:"FeatureCollection",features:[]};
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
      paint:{"raster-opacity":0.65,"raster-resampling":"nearest","raster-fade-duration":0}},
    {id:FIELD_LAYER.currents,type:"symbol",source:FIELD_SOURCE.currents,
      layout:{"icon-image":"pelora-field-current-arrow","icon-rotate":["get","directionDegrees"],
        "icon-rotation-alignment":"map","icon-pitch-alignment":"map","icon-allow-overlap":true,
        "icon-ignore-placement":true,"icon-size":["step",["get","speedMetersPerSecond"],0.7,0.5,0.9,1,1.1]}}
  ];
}
// Insert below existing context layers; never move raw fields above ranked targets.
export function fieldInsertBefore(map) {
  const layers=map.getStyle()?.layers ?? [];
  return layers.find(l=>l.id.startsWith("pelora-")&&!Object.values(FIELD_LAYER).includes(l.id) ||
    l.id.startsWith("structure-") || l.id.startsWith("fad-") || l.type==="symbol")?.id;
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
      color:z< -4000?"#102737":z< -2000?"#173747":z< -1000?"#204757":z< -200?"#315b68":"#477781"});
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
