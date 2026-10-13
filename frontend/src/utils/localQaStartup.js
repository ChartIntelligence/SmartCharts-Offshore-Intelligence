import {localQaReadOnly} from './localQaReadOnly.js';
export function validateLocalQaClientConfiguration(environment){
 if(!localQaReadOnly(environment))return false;
 const key=environment.VITE_SUPABASE_PUBLISHABLE_KEY;
 if(typeof key!=='string'||!key.trim())throw new Error('Local QA public client configuration required');
 if(!key.startsWith('sb_publishable_')){
  let role;try{role=JSON.parse(atob(key.split('.')[1].replaceAll('-','+').replaceAll('_','/'))).role;}catch{throw new Error('Invalid local QA public key format');}
  if(role!=='anon')throw new Error('Privileged local QA client key denied');
 }
 return true;
}