// Test-only projection of trusted actual parser output; no production integration.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {ref} from './currentEvidenceCaptureFixture.mjs';

export function qualityCaptureInput(marine) {
  return {
    source: {provider:'Open-Meteo', weatherProduct:'Weather Forecast API', marineProduct:'Marine Forecast API'},
    sourceAuthority: {status:'SYNTHETIC_FIXTURE', reference:ref('synthetic-weather-marine-source')},
    location: structuredClone(marine.location),
    qualityInputs: {
      wind:{speedKnots:marine.wind.speedKnots}, waves:{heightFeet:marine.waves.heightFeet},
      swell:{heightFeet:marine.swell.heightFeet}, observedAt:marine.observedAt,
      diagnostics:{providerStatus:structuredClone(marine.diagnostics.providerStatus)}
    },
    lineageReferences:[ref('synthetic-weather-response'), ref('synthetic-marine-response')]
  };
}
// Executes the SAME current inline quality block; no science copied into a new path.
// Production extraction/integration is deferred; full route also invokes Auth/history/species.
const source = readFileSync(new URL('../../server.js', import.meta.url),'utf8');
const start = source.indexOf('  const chlorophyllHasValue =', source.indexOf('async function getOceanConditionsAtAssessment'));
const end = source.indexOf('  const oceanConditions =',start);
assert(start>0 && end>start);
const constants = ['CHLOROPHYLL_MAX_LIVE_AGE_HOURS','CURRENTS_MAX_LIVE_AGE_HOURS']
  .map(name=>source.match(new RegExp(`const ${name} =\\s*\\d+;`))?.[0]);
assert(constants.every(Boolean));
const exact = new Function('marine','chlorophyll','currents','moon','chlorophyllResult','gapFilledChlorophyllResult','currentsResult',
  '"use strict";\n'+constants.join('\n')+'\n'+source.slice(start,end)+'\nreturn dataQuality;');
export function currentQuality(marine, context) {
  return exact(marine,context.chlorophyll,context.currents,context.moon,
    context.chlorophyllResult,context.gapFilledChlorophyllResult,context.currentsResult);
}
