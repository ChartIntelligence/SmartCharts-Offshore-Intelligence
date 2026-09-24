import {createHash} from 'node:crypto';
import {buildUnifiedOpportunityCandidateSourceUniverseV1,evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1,BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE,buildCurrentGradientAnalysis,buildCurrentVectorProjectionAnalysis,assessOceanEvidence} from '../../server.js';
const sourceTime='2026-09-24T00:00:00Z';
const atOneHour=Date.parse('2026-09-24T01:00:00Z');
const atSeventyThreeHours=Date.parse('2026-09-27T01:00:00Z');
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const frozen=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(frozen);Object.freeze(v);}return v;};
export function fixture(){
  const raw=buildUnifiedOpportunityCandidateSourceUniverseV1().candidates[0];
  const candidate={...raw,eligibility:evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1({candidate:raw,speciesProfile:BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE})};
  const source={provider:'SYNTHETIC-12B',availability:'available',classification:'forecast-model',observationType:'direct-satellite'};
  const [latitude,longitude]=candidate.coordinates;
  const samples=['north','east','south','west'].map((direction,i)=>({direction,
    requestedLatitude:latitude+(i===0?0.2:i===2?-0.2:0),requestedLongitude:longitude+(i===1?0.2:i===3?-0.2:0),
    resolvedLatitude:latitude,resolvedLongitude:longitude,observedAt:sourceTime,ageHours:1,source,
    temperatureFahrenheit:80,speedKnots:1,directionDegrees:90,eastwardMetersPerSecond:0.5,northwardMetersPerSecond:0}));
  const spatial={available:true,sufficientCoverage:true,coverage:'complete',validSampleCount:4,vectors:samples};
  const gradient=buildCurrentGradientAnalysis(buildCurrentVectorProjectionAnalysis(spatial));
  const ocean={observedAt:sourceTime,
    sst:{temperatureFahrenheit:80,derived:{spatialStructure:{thresholdVersion:'pelora-sst-spatial-range-v1',coverage:'sufficient',classification:'uniform-water',validNeighborCount:4,samples}}},
    currents:{...samples[0],derived:{spatialAnalysis:{available:true,spatialStructure:spatial,gradient}}},
    chlorophyll:{concentrationMgM3:0.1,ageHours:1,observedAt:sourceTime,source},
    dataQuality:{layers:{chlorophyll:{state:'live'}}}};
  ocean.oceanEvidence=assessOceanEvidence({latitude,longitude,...ocean});
  return frozen({candidate,ocean});
}
