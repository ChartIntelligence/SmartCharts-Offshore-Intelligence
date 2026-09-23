import assert from "node:assert/strict";
import {comparePersistenceEnvironments, normalizePersistenceProjectIdentity, PERSISTENCE_PROJECT_HEADER} from "../../shared/persistenceEnvironment.mjs";
import {resolvePersistenceRequestContext} from "../persistenceEnvironment.js";
import {createPeloraServer, buildBackendSupabaseConfiguration, getDynamicBlueMarlinOpportunities,
  buildUnifiedSpeciesOpportunityInterpretationV1, buildUnifiedCaptainOpportunityDeliveryV1,
  retrieveOceanMemoryRows, retrieveGovernedOpportunityObservationRowsV1} from "../server.js";
import {buildGovernedOpportunityEvaluationStateV1, translateOpportunityEvaluationNarrativeV1} from "../opportunityEvaluationState.js";

const project = "https://persistence-test.invalid";
const environment = {SUPABASE_URL:project,SUPABASE_PUBLISHABLE_KEY:"test-public-key",SUPABASE_SERVICE_ROLE_KEY:""};
const configuration = buildBackendSupabaseConfiguration({environment});
const header = PERSISTENCE_PROJECT_HEADER.toLowerCase();
for (const input of [project, `${project}/`, " HTTPS://PERSISTENCE-TEST.INVALID:443/ "]) {
  assert.equal(normalizePersistenceProjectIdentity(input),project);
  assert.equal(resolvePersistenceRequestContext({configuration,headers:{[header]:input,authorization:"Bearer test-captain"}}).bearerToken,"test-captain");
}
for (const input of [null,undefined,"", "matched",[project],"https://other.invalid","https://user:secret@persistence-test.invalid","https://persistence-test.invalid/?token=secret"]) {
  const context = resolvePersistenceRequestContext({configuration,headers:{[header]:input,authorization:"Bearer test-captain"}});
  assert.equal(context.bearerToken,null,"Client assertion cannot establish compatibility");
  assert.notEqual(context.persistenceEnvironment.state,"matched");
}
assert.equal(resolvePersistenceRequestContext({configuration,headers:{[header]:project}}).bearerToken,null,"Matching identity does not authenticate");
assert.equal(resolvePersistenceRequestContext({configuration:{...configuration,available:false},headers:{[header]:project,authorization:"Bearer test-captain"}}).bearerToken,null);
const contract = comparePersistenceEnvironments({browserProject:project,backendProject:project,backendAvailable:true});
assert.deepEqual(Object.keys(contract).sort(),["backendProjectIdentity","browserProjectIdentity","contractVersion","reason","state"].sort());
assert.doesNotMatch(JSON.stringify(contract),/test-public-key|test-captain|user_id|credentials/);

const interpretation = buildUnifiedSpeciesOpportunityInterpretationV1({
  species:"blue-marlin",candidate:{id:"governed-test",coordinates:[28,-88]},
  oceanConditions:{observedAt:"2026-09-22T12:00:00Z",blueMarlinHabitat:{
    summary:{classification:"limited-preliminary-habitat-support"},
    confidence:{score:60,level:"Moderate",components:{confidenceAdjustedSuitability:{score:45}}},
    opportunityTypes:["environmental-transition-zone"],
    relationshipGroups:{thermalStructure:{score:22,classification:"moderate-temperature-transition-supported"},waterCharacter:{score:8,classification:"clear-blue-surface-water-observed"}}
  }}
});
const delivery = buildUnifiedCaptainOpportunityDeliveryV1({species:"blue-marlin",speciesInterpretations:[interpretation]});
assert.equal(delivery.available,true);
const evaluationState = buildGovernedOpportunityEvaluationStateV1({candidates:[interpretation.candidate],results:[{candidate:interpretation.candidate,status:"fulfilled",value:interpretation}],delivery});
const controlled = {
  available:true, evaluatedAt:"2026-09-22T12:00:00Z",search:{selection:"test",totalMarineCandidateCount:1},
  evaluation:{evaluatedCandidateCount:1,successfulCandidateCount:1,failedCandidateCount:0},
  observationSource:{speciesInterpretations:[interpretation]},opportunities:delivery.opportunities,delivery,
  evaluationState,evaluationNarrative:translateOpportunityEvaluationNarrativeV1(evaluationState),reason:"controlled-gulf-evaluation-complete"
};

// Exercise real HTTP handlers and real history/observation storage orchestration.
// No socket is opened and all outbound requests are intercepted before any IO.
const originalFetch = globalThis.fetch;
const previousEnvironment = Object.fromEntries(Object.keys(environment).map(key=>[key,process.env[key]]));
const calls=[];
let mode="positive", authAccepted=true;
const fakeFetch=async (url,options)=>{
  assert.equal(new URL(url).origin,project,"No provider or real database request is permitted");
  calls.push({url,options});
  if (url.endsWith("/auth/v1/user")) return {ok:authAccepted,status:authAccepted?200:401,json:async()=>({id:"test-owner"})};
  assert.equal(options.headers.Authorization,"Bearer test-captain");
  assert.equal(options.headers.apikey,"test-public-key");
  return {ok:true,status:200,json:async()=>[]};
};
function dispatch(server,url,headers={},method="GET") {
  return new Promise(resolve=>{
    let status, responseHeaders;
    server.emit("request",{method,url,headers:{host:"test.invalid",...headers}},{
      writeHead(code,values){status=code;responseHeaders=values;},
      end(body){resolve({status,headers:responseHeaders,body:JSON.parse(body)});}
    });
  });
}
try {
  Object.assign(process.env,environment);
  globalThis.fetch=fakeFetch;
  const server=createPeloraServer({
    opportunityProvider:options=>getDynamicBlueMarlinOpportunities(options,{controlledEvaluator:async()=>{
      if (mode==="exception") throw new Error("controlled test failure");
      return mode==="positive" ? controlled : {...controlled,available:false,delivery:{available:false,opportunities:[]},opportunities:[],observationSource:{speciesInterpretations:[]},reason:"controlled-gulf-evaluation-produced-no-governed-opportunities",evaluationState:{...evaluationState,state:"governed-zero"}};
    }}),
    oceanConditionsProvider:async (latitude,longitude,{bearerToken})=>({
      location:{latitude,longitude},currentEvidence:{sst:27,source:"test-observation"},
      memory:await retrieveOceanMemoryRows({configuration,bearerToken,latitude,longitude})
    })
  });
  for (const [identity, expected] of [[project,"matched"],["https://other.invalid","mismatched"],[undefined,"unknown"]]) {
    calls.length=0;
    mode="positive";
    const headers={authorization:"Bearer test-captain",...(identity?{[header]:identity}:{})};
    const result=await dispatch(server,"/api/opportunities?species=blue-marlin",headers);
    assert.equal(result.status,200);
    assert.equal(result.body.persistenceEnvironment.state,expected);
    assert.deepEqual(result.body.delivery,delivery,"Compatibility cannot change scoring, confidence, ranking or delivery");
    assert.deepEqual(result.body.evaluationState,evaluationState,"Mismatch does not become governed zero");
    const writes=calls.filter(call=>call.options.method==="POST");
    assert.equal(writes.length,expected==="matched"?2:0);
    if (writes.length) {
      assert.ok(writes.some(call=>call.url.includes("/governed_opportunity_observation?")));
      assert.ok(writes.some(call=>call.url.includes("/governed_opportunity_history?")));
      assert.ok(writes.every(call=>JSON.parse(call.options.body).user_id==="test-owner"));
    } else assert.equal(calls.length,0,"Blocked requests must not even resolve identity or retrieve history");

    calls.length=0;
    const ocean=await dispatch(server,"/api/ocean?lat=29&lon=-86",headers);
    assert.equal(ocean.status,200);
    assert.deepEqual(ocean.body.currentEvidence,{sst:27,source:"test-observation"});
    assert.equal(ocean.body.memory.requestPerformed,expected==="matched");
    assert.equal(calls.length,expected==="matched"?1:0);

    calls.length=0;
    mode="zero";
    const zero=await dispatch(server,"/api/opportunities?species=blue-marlin",headers);
    assert.equal(zero.body.evaluationState.state,"governed-zero","An existing zero is not reclassified by memory availability");
    assert.equal(calls.some(call=>call.url.includes("/governed_opportunity_history?")),expected==="matched");
    if (expected!=="matched") assert.notEqual(zero.body.historicalFallback?.available,true);

    calls.length=0;
    const context=resolvePersistenceRequestContext({configuration,headers});
    const observations=await retrieveGovernedOpportunityObservationRowsV1({configuration,bearerToken:context.bearerToken});
    assert.equal(observations.requestPerformed,expected==="matched");
  }
  mode="positive";authAccepted=false;calls.length=0;
  const invalidAuth=await dispatch(server,"/api/opportunities?species=blue-marlin",{[header]:project,authorization:"Bearer test-captain"});
  assert.equal(invalidAuth.status,200);
  assert.equal(calls.filter(call=>call.options.method==="POST").length,0,"Compatibility cannot replace authentication");
  calls.length=0;
  await dispatch(server,"/api/opportunities?species=blue-marlin",{[header]:project});
  assert.equal(calls.length,0,"No bearer means no authenticated persistence");
  for (const unavailable of [
    {...environment,SUPABASE_PUBLISHABLE_KEY:""},
    {...environment,SUPABASE_URL:"invalid"},
    {...environment,SUPABASE_SERVICE_ROLE_KEY:"test-prohibited-key"}
  ]) {
    Object.assign(process.env,unavailable);
    calls.length=0;
    const result=await dispatch(server,"/api/opportunities?species=blue-marlin",{[header]:project,authorization:"Bearer test-captain"});
    assert.equal(result.status,200);
    assert.equal(result.body.persistenceEnvironment.state,"unknown");
    assert.deepEqual(result.body.delivery,delivery);
    assert.equal(calls.length,0);
    assert.doesNotMatch(JSON.stringify(result.body.persistenceEnvironment),/test-prohibited-key|test-public-key|test-captain/);
  }
  Object.assign(process.env,environment);
  mode="exception";
  const warn=console.warn;console.warn=()=>{};
  try {
    const failure=await dispatch(server,"/api/opportunities?species=blue-marlin",{[header]:project,authorization:"Bearer test-captain"});
    assert.equal(failure.status,502);
    assert.equal(failure.body.evaluationState.state,"unavailable");
    assert.deepEqual(failure.body.opportunities,[]);
    assert.equal(calls.length,0);
  } finally {console.warn=warn;}
  const options=await dispatch(server,"/api/ocean",{},"OPTIONS");
  assert.equal(options.status,204);
  assert.ok(options.headers["Access-Control-Allow-Headers"].includes(PERSISTENCE_PROJECT_HEADER));
} finally {
  globalThis.fetch=originalFetch;
  for (const [key,value] of Object.entries(previousEnvironment)) {
    if (value===undefined) delete process.env[key]; else process.env[key]=value;
  }
}
console.log("PASS persistence compatibility gates actual HTTP bearer forwarding, observation/history writes, snapshot/history reads, preserves current results and 502; auth remains separate");
