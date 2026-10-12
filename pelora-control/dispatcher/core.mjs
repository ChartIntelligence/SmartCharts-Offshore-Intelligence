import { randomUUID } from 'node:crypto';
import { BASELINE,GOVERNANCE,SENSITIVE,ACTIONS,TYPES,STATES,HELD,CONTRACTS,assert,digest,safeScope,covers,conflicts } from './policy.mjs';
const strings=['id','owner','title','goal','baseline','repository','worktree','branch','environment','type','commitPolicy','pushPolicy','mergePolicy','expectedDisposition'];
const arrays=['dependencies','allowedFiles','protectedFiles','protectedContracts','governance','permittedActions','blockedActions','requiredTests','approvalRequirements','stopConditions'];
export function validateTask(t,registry,baseline=BASELINE) {
  assert(t&&typeof t==='object'&&!Array.isArray(t),'task must be an object');
  const fields=['version',...strings,...arrays];
  assert(Object.keys(t).length===fields.length&&fields.every(k=>Object.hasOwn(t,k)),'unknown or missing task field');
  assert(t.version===1,'unsupported version');
  strings.forEach(k=>assert(typeof t[k]==='string'&&t[k].length>0&&t[k].length<=8000,`invalid ${k}`));
  arrays.forEach(k=>assert(Array.isArray(t[k])&&t[k].every(v=>typeof v==='string'&&v.length>0)&&new Set(t[k]).size===t[k].length,`invalid ${k}`));
  assert(/^[a-z][a-z0-9-]{1,79}$/.test(t.id)&&!['constructor','prototype','__proto__'].includes(t.id),'invalid ID');
  assert(t.baseline===baseline&&/^[a-f0-9]{40}$/.test(t.baseline),'wrong baseline');
  assert(t.repository==='ChartIntelligence/SmartCharts-Offshore-Intelligence','wrong repository');
  assert(/^[a-z][a-z0-9-]{1,79}$/.test(t.worktree),'unsafe worktree name');
  assert(/^codex\/pelora-[a-z0-9-]+$/.test(t.branch),'unsafe branch');
  assert(['local','cloud'].includes(t.environment)&&TYPES.includes(t.type),'invalid environment/type');
  const agent=registry.agents.find(a=>a.id===t.owner);assert(agent,'unknown agent');
  assert(agent.types.includes(t.type),'owner/type mismatch');
  [...t.allowedFiles,...t.protectedFiles].forEach(s=>assert(safeScope(s),'unsafe scope'));
  assert(t.allowedFiles.every(s=>agent.scopes.some(a=>covers(a,s.replace(/\/\*\*$/,'/_')))),'outside owner scope');
  assert(t.protectedContracts.every(k=>Object.hasOwn(CONTRACTS,k)),'unknown contract');
  assert(t.governance.every(k=>Object.hasOwn(GOVERNANCE,k)),'unknown governance category');
  assert(['release','ownership','decisions'].every(k=>t.governance.includes(k)),'mandatory governance missing');
  assert([...t.permittedActions,...t.blockedActions,...t.approvalRequirements].every(a=>ACTIONS.includes(a)),'unknown action');
  assert(t.permittedActions.every(a=>!t.blockedActions.includes(a)),'permitted/blocked contradiction');
  assert(t.permittedActions.includes('read'),'read permission required');
  assert(!t.permittedActions.includes('write')||t.allowedFiles.length>0,'writer needs scope');
  assert(!['analysis','QA'].includes(t.type)||!t.permittedActions.includes('write'),'analysis/QA must be read-only');
  assert(t.permittedActions.every(a=>!SENSITIVE.includes(a)||t.approvalRequirements.includes(a)),'sensitive action lacks human gate');
  if(t.permittedActions.includes('write')&&t.allowedFiles.some(s=>['AGENTS.md',...Object.values(GOVERNANCE)].some(p=>covers(s,p))))
    assert(t.approvalRequirements.includes('locked-governance-change'),'canonical governance writes need human review');
  assert(t.approvalRequirements.every(a=>t.permittedActions.includes(a)||a==='locked-governance-change'),'approval for an unpermitted action');
  assert(['forbid','allow'].includes(t.commitPolicy)&&['forbid','allow'].includes(t.pushPolicy)&&['forbid','human'].includes(t.mergePolicy),'invalid Git policy');
  assert((t.commitPolicy==='allow')===t.permittedActions.includes('commit'),'commit policy mismatch');
  assert((t.pushPolicy==='allow')===t.permittedActions.includes('push'),'push policy mismatch');
  assert(!t.permittedActions.includes('commit')||t.permittedActions.includes('write'),'commit needs write');
  assert(!t.permittedActions.includes('push')||t.permittedActions.includes('commit'),'push needs commit');
  assert(!t.permittedActions.includes('merge')||(t.mergePolicy==='human'&&t.approvalRequirements.includes('merge')),'merge needs human gate');
  assert(['COMPLETE','READY_FOR_INTEGRATION','READY_FOR_FOUNDER_QA'].includes(t.expectedDisposition),'invalid disposition');
  assert(t.stopConditions.length>0,'stop conditions required');return t;
}
export function validateQueue(q,registry) {
  assert(q.version===1&&q.baseline===BASELINE&&Array.isArray(q.tasks),'invalid queue/baseline');
  assert(registry.version===1&&Array.isArray(registry.agents),'invalid registry');
  assert(new Set(registry.agents.map(a=>a.id)).size===registry.agents.length,'duplicate agent');
  const ids=new Set(),branches=new Set(),trees=new Set();
  for(const t of q.tasks){validateTask(t,registry,q.baseline);assert(!ids.has(t.id)&&!branches.has(t.branch)&&!trees.has(t.worktree),'duplicate task/branch/worktree');ids.add(t.id);branches.add(t.branch);trees.add(t.worktree);}
  for(const t of q.tasks)assert(t.dependencies.every(d=>ids.has(d)&&d!==t.id),'unknown/self dependency');
  const visit=(id,stack=new Set())=>{assert(!stack.has(id),'dependency cycle');for(const d of q.tasks.find(t=>t.id===id).dependencies)visit(d,new Set([...stack,id]));};
  q.tasks.forEach(t=>visit(t.id));return q;
}
export function initialState(){return {version:1,revision:0,tasks:{},history:[]};}
export function reload(q,registry,s){
  validateQueue(q,registry);assert(s.version===1&&Number.isSafeInteger(s.revision)&&s.tasks&&Array.isArray(s.history),'invalid status');
  for(const [id,r] of Object.entries(s.tasks)){const t=q.tasks.find(x=>x.id===id);assert(t&&r.taskDigest===digest(t),'retained task changed/removed; use new ID');assert(STATES.includes(r.state),'unknown status');}
  for(const t of q.tasks)if(!Object.hasOwn(s.tasks,t.id))s.tasks[t.id]={taskDigest:digest(t),state:'QUEUED',attempt:null,threadId:null,evidence:{},reason:null};return s;
}
function event(s,id,next,reason,now){const r=s.tasks[id];s.history.push({revision:++s.revision,id,from:r.state,to:next,reason,at:now});r.state=next;r.reason=reason;}
export function readiness(t,q,s){
  const r=s.tasks[t.id];if(!['QUEUED','READY','BLOCKED'].includes(r.state))return {state:r.state,reason:'retained disposition'};
  if(!t.dependencies.every(id=>s.tasks[id]?.state==='COMPLETE'))return {state:'BLOCKED',reason:'unmet dependency'};
  if(q.tasks.some(x=>x.id!==t.id&&HELD.has(s.tasks[x.id].state)&&conflicts(t,x)))return {state:'BLOCKED',reason:'write scope or protected contract locked'};
  if(t.approvalRequirements.length||t.permittedActions.some(a=>SENSITIVE.includes(a)))return {state:'WAITING_FOR_APPROVAL',reason:'human gate; sensitive execution unsupported in v1'};
  return {state:'READY',reason:'dependencies and ownership satisfied'};
}
export function refresh(q,s,now=new Date().toISOString()){for(const t of q.tasks){const n=readiness(t,q,s);if(n.state!==s.tasks[t.id].state)event(s,t.id,n.state,n.reason,now);}return s;}
export function begin(id,q,s,now=new Date().toISOString()){
  const t=q.tasks.find(x=>x.id===id);assert(t,'unknown task');const n=readiness(t,q,s);assert(n.state==='READY',n.reason);
  const r=s.tasks[id];r.attempt=randomUUID();r.threadId=null;event(s,id,'RUNNING','persist intent before dispatch',now);return r.attempt;
}
export function pause(id,s,reason,now=new Date().toISOString()){assert(s.tasks[id]?.state==='RUNNING','only running task can pause');event(s,id,'WAITING_FOR_APPROVAL',reason,now);}
export function fail(id,s,reason,now=new Date().toISOString()){assert(HELD.has(s.tasks[id]?.state),'no active attempt');event(s,id,'QUALIFICATION_FAILED',reason,now);}
export function ingest(t,s,result,meta,now=new Date().toISOString()){
  const r=s.tasks[t.id];assert(r.state==='RUNNING','result requires running attempt');
  assert(result.version===1&&result.id===t.id&&result.attempt===r.attempt&&result.taskDigest===r.taskDigest&&result.baseline===t.baseline,'stale/mismatched result');
  assert(result.threadId===r.threadId&&typeof result.threadId==='string','thread mismatch');
  assert(result.branch===t.branch&&meta.branch===t.branch,'branch mismatch');
  assert(/^[a-f0-9]{40}$/.test(result.commit)&&result.commit===meta.head&&meta.baseline===t.baseline&&meta.baselineAncestor===true,'SHA/baseline mismatch');
  assert(meta.clean===true,'dirty worktree; lock retained');
  assert(Array.isArray(meta.changedFiles)&&meta.changedFiles.every(f=>safeScope(f)&&t.permittedActions.includes('write')&&t.allowedFiles.some(x=>covers(x,f))),'out-of-scope changes');
  assert(meta.head===t.baseline||t.commitPolicy==='allow','unauthorized commit');
  assert(result.disposition==='SUBMITTED','agent cannot mint qualification/deployment');
  assert(Array.isArray(result.tests)&&result.tests.every(x=>x&&typeof x.name==='string'&&['PASS','FAIL','NOT_RUN'].includes(x.outcome)&&typeof x.evidence==='string'),'invalid test receipts');
  assert(t.requiredTests.every(name=>result.tests.some(x=>x.name===name&&x.outcome==='PASS')),'required test missing/failed');
  r.evidence.submitted={commit:meta.head,tests:result.tests.map(({name,outcome,evidence})=>({name,outcome,evidence})),at:now};
  s.history.push({revision:++s.revision,id:t.id,from:r.state,to:r.state,reason:'submitted; independent qualification pending',at:now});
}
export function qualify(t,s,review,meta,now=new Date().toISOString()){
  const r=s.tasks[t.id];assert(r.state==='RUNNING'&&r.evidence.submitted,'submission required');
  assert(review.attempt===r.attempt&&review.commit===r.evidence.submitted.commit&&meta.head===review.commit&&meta.branch===t.branch&&meta.clean,'stale qualification');
  assert(typeof review.reviewer==='string'&&review.reviewer.length>0&&review.reviewer!==t.owner&&typeof review.evidence==='string'&&review.evidence.length>0&&review.passed===true,'independent review receipt required');
  r.evidence.qualified={attempt:review.attempt,commit:review.commit,reviewer:review.reviewer,evidence:review.evidence,passed:true,at:now};event(s,t.id,'QUALIFIED','trusted operator supplied independent review receipt',now);
  if(meta.head!==t.baseline){r.evidence.committed={commit:meta.head,at:now};event(s,t.id,'COMMITTED','local Git identity verified',now);}
}
export function recordPush(t,s,remoteHead,now=new Date().toISOString()){
  const r=s.tasks[t.id];assert(t.pushPolicy==='allow'&&r.state==='COMMITTED'&&remoteHead===r.evidence.committed.commit,'push denied or remote SHA mismatch');
  r.evidence.pushed={commit:remoteHead,at:now};event(s,t.id,'PUSHED','remote identity read back',now);
}
export function finish(t,s,next,receipt,now=new Date().toISOString()){
  const r=s.tasks[t.id];assert(['QUALIFIED','COMMITTED','PUSHED','READY_FOR_INTEGRATION','INTEGRATED','READY_FOR_FOUNDER_QA'].includes(r.state),'cannot finish unqualified work');
  if(next==='READY_FOR_INTEGRATION')assert(['COMMITTED','PUSHED'].includes(r.state),'commit required');
  else if(next==='INTEGRATED')assert(r.state==='READY_FOR_INTEGRATION'&&t.mergePolicy==='human'&&receipt?.humanApprovalRef&&/^[a-f0-9]{40}$/.test(receipt.commit),'human approval and integration receipt required');
  else if(next==='READY_FOR_FOUNDER_QA')assert(r.state==='INTEGRATED','integration required');
  else assert(next==='COMPLETE'&&(r.state===t.expectedDisposition||(t.expectedDisposition==='COMPLETE'&&['QUALIFIED','COMMITTED','PUSHED'].includes(r.state))),'unexpected disposition');
  r.evidence[next.toLowerCase()]={receipt:next==='INTEGRATED'?{humanApprovalRef:receipt.humanApprovalRef,commit:receipt.commit}:null,at:now};event(s,t.id,next,'bounded disposition; no deployment/live inference',now);
}
export function reconcile(t,s,receipt,meta,now=new Date().toISOString()){
  const r=s.tasks[t.id];assert(HELD.has(r.state)&&receipt.attempt===r.attempt&&receipt.executorStopped===true&&receipt.operatorRef&&meta.clean&&meta.branch===t.branch&&meta.head===t.baseline,'need stopped executor and pristine baseline');
  event(s,t.id,'QUEUED','operator reconciled uncertain execution; old attempt fenced',now);r.attempt=null;r.threadId=null;r.evidence={};
}
export function executionPackage(t,attempt,governance){
  const paths=['AGENTS.md',...t.governance.map(k=>GOVERNANCE[k])];assert(paths.every(p=>typeof governance[p]==='string'),'missing governance');
  return {version:1,id:t.id,attempt,taskDigest:digest(t),task:structuredClone(t),governance:paths.map(p=>({path:p,sha256:digest(governance[p])})),
    instruction:`PELORA bounded mission ${t.id}\nRead AGENTS.md first, then ${paths.slice(1).join(', ')}.\nVerify exact baseline ${t.baseline}, branch ${t.branch}, assigned worktree and entering changes.\nGoal: ${t.goal}\nContract:\n${JSON.stringify(t,null,2)}\nStop on governance conflict, private evidence, secrets, production or approval-required actions. Record conflicts for human review. Do not edit other worktrees, install dependencies without approval, merge, deploy, reopen paused science, enable Receipt Writer or grant beta/launch authorization.\nReturn a version 1 SUBMITTED result with id=${t.id}, attempt=${attempt}, taskDigest=${digest(t)}, baseline, threadId, branch, exact commit and tests [{name,outcome,evidence}]. Synthetic evidence/references only; independent qualification is recorded by the controller.`};
}
