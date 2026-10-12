import { createHash } from 'node:crypto';
export const BASELINE = '10150d5a8187e4ba52f62c0c747d919b30345b7d';
export const GOVERNANCE = Object.freeze({product:'docs/PELORA_PRODUCT_CONSTITUTION.md',science:'docs/PELORA_SCIENCE_GOVERNANCE.md',privacy:'docs/PELORA_PRIVACY_AND_EVIDENCE_RULES.md',release:'docs/PELORA_RELEASE_GATES.md',beta:'docs/Beta_Command_Board_Current_State_v1.md',decisions:'docs/PELORA_DECISION_LOG.md',ownership:'docs/agents/EXECUTION_BOARD_v1.md'});
export const SENSITIVE = ['production-deploy','production-migration','production-schema','production-grants','production-rls','credentials','secrets','paid-services','system-install','elevation','render-production','supabase-production','locked-governance-change','beta-ready','launch-ready'];
export const ACTIONS = ['read','write','test','worktree','commit','push','merge',...SENSITIVE];
export const TYPES = ['implementation','analysis','documentation','QA','integration'];
export const STATES = ['QUEUED','BLOCKED','READY','RUNNING','WAITING_FOR_APPROVAL','QUALIFICATION_FAILED','QUALIFIED','COMMITTED','PUSHED','READY_FOR_INTEGRATION','INTEGRATED','READY_FOR_FOUNDER_QA','COMPLETE'];
export const HELD = new Set(['RUNNING','WAITING_FOR_APPROVAL','QUALIFICATION_FAILED']);
export const CONTRACTS = {
  observe:['backend/observe/','backend/durableObserve/','docs/Continuous_Observe'],
  opportunity:['backend/','docs/Governed_'],
  'map-intelligence':['frontend/src/'],
  'captain-logging':['frontend/src/','docs/Fishing_Log','docs/Captain_'],
  migrations:['supabase/'],release:['render.yaml','.github/','frontend/package','backend/package'],
  governance:['AGENTS.md','docs/PELORA_','docs/Beta_Command_Board','docs/agents/'],
};
export function assert(ok,message) { if(!ok) throw new Error(message); }
export function digest(value) {
  const sort=x=>Array.isArray(x)?x.map(sort):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])])):x;
  return createHash('sha256').update(JSON.stringify(sort(value))).digest('hex');
}
export function safeScope(s) {
  return typeof s==='string' && /^[A-Za-z0-9_.\/-]+(?:\/\*\*)?$/.test(s) && !s.startsWith('/')
    && !s.split('/').some(p=>p==='..'||p==='.') && !s.includes('//') && !s.endsWith('/')
    && !/(^|\/)(\.git|\.env(?:\.[^/]*)?|\.aws|\.codex|node_modules)(\/|$)/i.test(s);
}
export function covers(scope,file) { scope=scope.toLowerCase();file=file.toLowerCase();return scope.endsWith('/**')?file.startsWith(scope.slice(0,-2)):scope===file; }
export function overlap(a,b) { return covers(a,b.replace(/\/\*\*$/,'/_'))||covers(b,a.replace(/\/\*\*$/,'/_')); }
export function locks(t) {
  if(!t.permittedActions.includes('write')) return [];
  const inferred=Object.entries(CONTRACTS).filter(([,prefixes])=>t.allowedFiles.some(s=>prefixes.some(p=>{
    s=s.toLowerCase();p=p.toLowerCase();return s.startsWith(p)||(s.endsWith('/**')&&p.startsWith(s.slice(0,-2)));
  }))).map(([key])=>key);
  return [...new Set([...t.protectedContracts,...inferred])];
}
export function conflicts(a,b) {
  if(!a.permittedActions.includes('write')||!b.permittedActions.includes('write')) return false;
  return a.allowedFiles.some(x=>b.allowedFiles.some(y=>overlap(x,y)))||locks(a).some(x=>locks(b).includes(x))
    ||a.protectedFiles.some(x=>b.allowedFiles.some(y=>overlap(x,y)))||b.protectedFiles.some(x=>a.allowedFiles.some(y=>overlap(x,y)));
}
