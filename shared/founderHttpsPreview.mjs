// Exact isolated preview identities. No science or source-admission authority.
export const FOUNDER_HTTPS_PROFILE='founder-https-preview-v1';
export const PREVIEW_FRONTEND='https://pelora-release-build-validation.onrender.com';
export const PREVIEW_API='https://pelora-backend-build-validation.onrender.com';
export const PREVIEW_PROJECT='https://vqzskzoizpomwzgbgdwl.supabase.co';
export function founderHttpsProfile(environment={},origin){
 const mode=environment.VITE_PELORA_FOUNDER_HTTPS_PREVIEW;
 if(mode===undefined&&origin!==PREVIEW_FRONTEND)return null;
 if(mode!=='1'||origin!==PREVIEW_FRONTEND||environment.VITE_PELORA_LOCAL_QA_READ_ONLY!=='1'||environment.VITE_SUPABASE_URL!==PREVIEW_PROJECT||environment.VITE_PELORA_API_BASE!==PREVIEW_API)throw new Error('Founder preview configuration denied');
 return Object.freeze({name:FOUNDER_HTTPS_PROFILE,frontend:PREVIEW_FRONTEND,api:PREVIEW_API,project:PREVIEW_PROJECT});
}
export function validatePreviewPublicKey(key,decode){
 if(typeof key!=='string'||!key.trim())throw new Error('Preview public key required');
 if(/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))return true;
 let claims;try{claims=JSON.parse(decode(key.split('.')[1]));}catch{throw new Error('Preview public key denied');}
 if(claims.role!=='anon'||claims.ref!=='vqzskzoizpomwzgbgdwl')throw new Error('Preview public key denied');
 return true;
}
