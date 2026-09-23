import assert from "node:assert/strict";
import {resolvePeloraApiUrl} from "../peloraApi.js";
import {persistenceRequestHeaders} from "../persistenceEnvironment.js";
import {interpretOpportunityEvaluation,EVALUATION_MESSAGES} from "../opportunityEvaluationState.js";
const data=state=>({evaluationState:{state,contractVersion:"pelora-governed-opportunity-evaluation-state-v1"},opportunities:[]});
for(const state of ["available","governed-zero","partial","unavailable"]){
 assert.equal(interpretOpportunityEvaluation({data:data(state)}).state,state);
 assert.equal(interpretOpportunityEvaluation({data:data(state),loading:true}).state,"loading");
 assert.equal(interpretOpportunityEvaluation({data:data(state),error:"network"}).state,"unavailable");
}
assert.equal(interpretOpportunityEvaluation({data:{opportunities:[]}}).state,"unavailable");
const partial={...data("partial"),opportunities:[{id:"independently-governed"}]};
assert.deepEqual(interpretOpportunityEvaluation({data:partial}).opportunities,partial.opportunities);
assert.deepEqual(interpretOpportunityEvaluation({data:partial,loading:true}).opportunities,[]);
assert.deepEqual(interpretOpportunityEvaluation({data:{...partial,...data("unavailable")}}).opportunities,[]);
assert.equal(interpretOpportunityEvaluation({data:data("partial")}).narrative,EVALUATION_MESSAGES.partial);
console.log("PASS shared frontend state preserves partial/zero/unavailable and keeps loading separate");

// Exercise the actual hook's response handling without a browser or network.
const {readFileSync} = await import("node:fs");
const {runInNewContext} = await import("node:vm");
const hookSource = readFileSync(new URL("../../hooks/useDynamicOpportunities.js", import.meta.url), "utf8")
  .replace(/^import[\s\S]*?;\r?\n/gm, "")
  .replace("export function", "function");
for (const [status, body] of [[502,data("unavailable")],[200,data("governed-zero")],[200,partial]]) {
  const slots = [];
  let effect;
  let nextSlot = 0;
  runInNewContext(hookSource + '\nuseDynamicOpportunities();', {
    useState(initial) {const index = nextSlot++; slots[index] = initial; return [initial,value => {slots[index]=value;}];},
    useEffect(callback) {effect=callback;},
    AbortController, URLSearchParams, resolvePeloraApiUrl, persistenceRequestHeaders,
    fetch: async () => ({ok:status===200,status,json:async()=>body}),
    console
  });
  assert.equal(slots[1],true,"Initial render is loading, not unavailable");
  effect();
  await new Promise(resolve => setTimeout(resolve,0));
  assert.equal(slots[0],body,"Structured HTTP 502 unavailable metadata must be preserved");
  assert.equal(slots[1],false);
  assert.equal(slots[2],null);
  assert.equal(interpretOpportunityEvaluation({data:slots[0],loading:slots[1],error:slots[2]}).state,body.evaluationState.state);
}
console.log("PASS hook preserves structured 502, partial and zero responses with separate initial loading");
