import {AsyncLocalStorage} from 'node:async_hooks';
// Guard only: context is still explicitly passed; this store never supplies missing time.
const activeAssessment = new AsyncLocalStorage();
// Trusted internal context only. No HTTP/environment parsing and no scientific policy.
export const SCIENTIFIC_ASSESSMENT_V1='pelora-scientific-assessment-v1';
export const SCHEDULED_ASSESSMENT_V1='pelora-scheduled-scientific-assessment-v1';
export const BLUE_MARLIN_ASSESSMENT_EVALUATOR_V1='pelora-blue-marlin-explicit-assessment-v1';
export function requireScientificAssessmentV1(value){
 if(!value||Object.getPrototypeOf(value)!==Object.prototype||Reflect.ownKeys(value).length!==2)throw new TypeError('Invalid scientific assessment');
 const fields={};for(const key of ['contractVersion','assessmentAt']){const d=Object.getOwnPropertyDescriptor(value,key);if(!d?.enumerable||!Object.hasOwn(d,'value'))throw new TypeError('Invalid scientific assessment');fields[key]=d.value;}
 if(![SCIENTIFIC_ASSESSMENT_V1,SCHEDULED_ASSESSMENT_V1].includes(fields.contractVersion))throw new TypeError('Unsupported scientific assessment');
 const t=fields.assessmentAt;
 if(typeof t!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(t))throw new TypeError('Invalid assessment instant');
 const ms=Date.parse(t);if(!Number.isFinite(ms)||new Date(ms).toISOString()!==(t.includes('.')?t:t.replace('Z','.000Z')))throw new TypeError('Invalid assessment instant');
 const result=Object.freeze({...fields,assessmentAt:new Date(ms).toISOString()});
 const active=activeAssessment.getStore();
 if(active && (active.assessmentAt!==result.assessmentAt || active.contractVersion!==result.contractVersion))throw new TypeError('Inconsistent nested scientific assessment');
 return result;
}
// Only independently callable outer boundaries may default to one clock capture.
export function resolveScientificAssessmentV1(value){if(value===undefined&&activeAssessment.getStore())throw new TypeError("Missing nested scientific assessment");return requireScientificAssessmentV1(value===undefined?{contractVersion:SCIENTIFIC_ASSESSMENT_V1,assessmentAt:new Date(Date.now()).toISOString()}:value);}
export function scientificAgeHoursV1(timestamp,assessment){
 const context=requireScientificAssessmentV1(assessment);
 if(typeof timestamp!=='string'||!Number.isFinite(Date.parse(timestamp)))return null;
 const elapsed=Date.parse(context.assessmentAt)-Date.parse(timestamp);
 if(elapsed<0)throw new TypeError('Evidence timestamp after scientific assessment');
 return Number((elapsed/3600000).toFixed(1));
}
export function reassessCurrentAgeV1(value,assessment){
 // Cache values retain their provider timestamp. Never reuse a request-derived age.
 const context=requireScientificAssessmentV1(assessment);
 if(value?.source?.availability==='available'&&!Number.isFinite(Date.parse(value.observedAt??'')))throw new TypeError('Current evidence timestamp unavailable for assessment');
 return {...value,ageHours:scientificAgeHoursV1(value?.observedAt,context)};
}

export function withScientificAssessmentV1(assessment,evaluate){const validated=requireScientificAssessmentV1(assessment);return activeAssessment.run(validated,evaluate);}

export function assertScientificInstantV1(timestamp){const active=activeAssessment.getStore();if(active)requireScientificAssessmentV1({...active,assessmentAt:timestamp});}
