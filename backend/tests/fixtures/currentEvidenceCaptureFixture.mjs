// Synthetic shapes from current normalized point returns; no provider qualification claim.
import {hash} from '../../../shared/oceanPublication.mjs';
export const ref=name=>({kind:'captured',referenceId:name,contractVersion:'synthetic-source-v1',sha256:hash(name)});
export function captureFixture(family='SST'){
  const common={requestedLatitude:25,requestedLongitude:-90,resolvedLatitude:25.05,resolvedLongitude:-90.05,observedAt:'2026-09-24T00:00:00Z'};
  let point;
  if(family==='SST')point={...common,temperatureCelsius:26,temperatureFahrenheit:78.8,providerCoordinates:{resolvedLatitude:25.05,resolvedLongitude:-90.05},timestampProvenance:'marine-current-block-valid-time',source:{provider:'Open-Meteo',classification:'forecast-model',availability:'available'}};
  else if(family==='CURRENTS')point={...common,speedKnots:1,directionDegrees:90,eastwardMetersPerSecond:0.5,northwardMetersPerSecond:0,source:{provider:'NOAA CoastWatch',dataset:'noaacwBLENDEDNRTcurrentsDaily',variables:['u_current','v_current'],units:'m/s',classification:'altimetry-derived-geostrophic-current',directionConvention:'degrees-toward',availability:'available'}};
  else {const gap=family==='CHLOROPHYLL_GAP_FILLED';point={...common,concentrationMgM3:0.1,waterClassification:'clear-blue-water',source:{provider:gap?'NOAA NESDIS CoastWatch':'NOAA CoastWatch',platform:gap?'S-NPP + NOAA-20 VIIRS':'Suomi-NPP VIIRS',dataset:gap?'nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily':'noaacwNPPVIIRSchlaDaily',variable:'chlor_a',units:'mg m^-3',classification:gap?'satellite-derived-reconstruction':'satellite-observation',availability:'available',...(gap?{observationType:'gap-filled-reconstruction',algorithm:'DINEOF',resolutionKilometers:9,experimental:true}:{})}};}
  return {family,sourceAuthority:{status:'SYNTHETIC_FIXTURE',reference:ref('synthetic-authority')},samples:[{role:'center',outcome:'FULFILLED',point}],lineageReferences:[ref('synthetic-as-used-source')]};
}
