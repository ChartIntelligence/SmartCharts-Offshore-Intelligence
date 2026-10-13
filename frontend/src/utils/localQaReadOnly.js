// P02 integration utility. Does not change production mode or persist credentials.
export function localQaReadOnly(environment=import.meta.env??{}){
 if(environment.VITE_PELORA_LOCAL_QA_READ_ONLY!=='1')return false;
 if(environment.VITE_SUPABASE_URL!=='https://vqzskzoizpomwzgbgdwl.supabase.co'||environment.VITE_PELORA_API_BASE!=='http://127.0.0.1:8787')throw new Error('Invalid local QA target');
 return true;
}
export function assertLocalQaWriteAllowed(environment){if(localQaReadOnly(environment))throw new Error('Local QA is read-only. Your draft is retained; saving is disabled.');}