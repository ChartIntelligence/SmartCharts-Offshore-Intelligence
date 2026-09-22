import { createHash } from "node:crypto";
import { FIELD_PRODUCTS, validateFieldRequest } from "./datasetRegistry.js";
import { createErddapAdapter } from "./erddapAdapter.js";

export function buildField(product, request, acquired, now = Date.now()) {
  const {cells,validTime,retrievedAt,stride} = acquired;
  const valid = cells.filter(c=>c.slice(2).every(Number.isFinite));
  const ageHours = validTime ? (now-Date.parse(validTime))/3600000 : null;
  if (validTime && (!Number.isFinite(ageHours) || ageHours < 0)) throw new Error("Invalid or future current valid time");
  const status = !valid.length ? "unavailable" : !validTime ? "static" : ageHours>product.maxFreshAgeHours ? "stale" : "latest-available";
  const resolution = {nativeDegrees:product.nativeResolutionDegrees, deliveredDegrees:product.nativeResolutionDegrees*stride,
    method:"native-grid-stride", stride, interpolation:"none"};
  let payload;
  if (product.layer === "bathymetry") {
    const longitudes = [...new Set(cells.map(c=>c[0]))].sort((a,b)=>a-b);
    const latitudes = [...new Set(cells.map(c=>c[1]))].sort((a,b)=>a-b);
    if (longitudes.length*latitudes.length > product.maxCells) throw new Error("Rectangular grid exceeds limit");
    const values = new Map(cells.map(c=>[`${c[0]},${c[1]}`,c[2]]));
    payload = {type:"rectilinear-elevation-grid", longitudes, latitudes,
      values:latitudes.flatMap(lat=>longitudes.map(lon=>values.get(`${lon},${lat}`) ?? null)),
      order:"latitude-ascending-rows,longitude-ascending-columns", positive:"up"};
  } else {
    payload = {type:"geostrophic-vector-grid", coordinateOrder:"longitude,latitude,u,v",
      cells, directionConvention:"degrees-toward", interpolation:"none"};
  }
  return {contractVersion:"pelora-spatial-field-v1", fieldId:createHash("sha256").update(JSON.stringify([product.id,product.version,request.bounds,validTime,stride,cells])).digest("hex"),
    layer:product.layer, displayName:product.displayName, productId:product.id, provider:product.provider, dataset:product.dataset,
    productVersion:product.version, productType:product.productType, processingLevel:product.processingLevel,
    depth:product.depth, units:product.units, crs:"EPSG:4326", coordinateConvention:"longitude [-180,180], latitude [-90,90]",
    bounds:request.bounds, boundsMeaning:"requested viewport; payload coordinates are provider-resolved",
    antimeridian:"split-requests-required", resolution, validTime, retrievedAt, ageHours,
    freshness:{status, maxFreshAgeHours:product.maxFreshAgeHours ?? null}, status,
    coverage:{returnedCells:cells.length,validCells:valid.length,missingCells:cells.length-valid.length,
      validFraction:cells.length ? valid.length/cells.length : 0, scope:"returned decimated grid; not unsampled native pixels"},
    noData:{value:null,meaning:"provider missing or invalid; never zero-filled",landMask:"no separate mask supplied"},
    qualityFlags:{availability:valid.length ? "available" : "no-valid-cells",providerFlags:null}, uncertainty:product.uncertainty,
    provenance:{providerUrl:product.baseUrl,dataset:product.dataset,attribution:product.attribution,
      coordinates:"provider-response",transformation:"bounded stride; missing-value normalization; no fusion",fusion:false},
    payloadType:payload.type,payload};
}

// Product evaluation is presentation-only. Every alternative is acquired and cached
// independently; explicit product selection remains available, including stale fields.
export function selectField(results, mode) {
  const available = results.filter(r=>r.field?.coverage.validCells>0);
  available.sort((a,b)=>Number(a.field.status==="stale")-Number(b.field.status==="stale") ||
    b.field.coverage.validFraction-a.field.coverage.validFraction || a.product.priority-b.product.priority || a.product.id.localeCompare(b.product.id));
  const selected = available[0] ?? results.find(r=>r.field);
  if (!selected) { const error = new Error("No field provider is available"); error.statusCode=503; error.candidates=results.map(r=>({productId:r.product.id,provider:r.product.provider,dataset:r.product.dataset,status:"unavailable",reason:r.error})); throw error; }
  return {...selected.field, selection:{mode,policyVersion:"availability-freshness-coverage-priority-v1",fusion:false,
    selectedProductId:selected.product.id,candidates:results.map(r=>({productId:r.product.id,provider:r.product.provider,dataset:r.product.dataset,
      fieldId:r.field?.fieldId ?? null,status:r.field?.status ?? "unavailable",validTime:r.field?.validTime ?? null,
      coverage:r.field?.coverage ?? null,productVersion:r.product.version,productType:r.product.productType,
      processingLevel:r.product.processingLevel,nativeResolutionDegrees:r.product.nativeResolutionDegrees,depth:r.product.depth,units:r.product.units,
      qualityFlags:r.field?.qualityFlags ?? null,uncertainty:r.field?.uncertainty ?? r.product.uncertainty,
      provenance:r.field?.provenance ?? null,reason:r.error ?? null}))}};
}

export function createFieldService({products=FIELD_PRODUCTS,adapters={"erddap-grid":createErddapAdapter()},now=Date.now}={}) {
  const cache = new Map(), inFlight = new Map();
  async function acquire(product,request) {
    const key = JSON.stringify([product.id,request.bounds,request.density]);
    const cached = cache.get(key);
    if (cached && now()-cached.at<300000) return buildField(product,request,cached.data,now());
    if (!inFlight.has(key)) {
      if (inFlight.size>=4) throw new Error("Field provider busy; retry later");
      const pending = adapters[product.adapter](product,request).then(data=>{
        if (cache.size>=32) cache.delete(cache.keys().next().value);
        cache.set(key,{data,at:now()}); return data;
      }).finally(()=>inFlight.delete(key));
      inFlight.set(key,pending);
    }
    return buildField(product,request,await inFlight.get(key),now());
  }
  return async params => {
    const request = validateFieldRequest(params,products);
    const results = await Promise.all(request.candidates.map(async product=>{
      try {return {product,field:await acquire(product,request)};}
      catch(error){return {product,error:error.message};}
    }));
    const result = selectField(results,request.selection);
    if (Buffer.byteLength(JSON.stringify(result))>500000) throw new Error("Field payload exceeds mobile limit");
    return result;
  };
}
export const getOceanField = createFieldService();
