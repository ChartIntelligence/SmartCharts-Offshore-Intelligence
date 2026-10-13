import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {resolvePeloraApiUrl} from '../peloraApi.js';
import {validateLocalQaClientConfiguration} from '../localQaStartup.js';
const qa={VITE_PELORA_LOCAL_QA_READ_ONLY:'1',VITE_SUPABASE_URL:'https://vqzskzoizpomwzgbgdwl.supabase.co',VITE_PELORA_API_BASE:'http://127.0.0.1:8787',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_SYNTHETIC'};
test('QA resolver pins exact target and /api, no hosted or dev fallback; normal compatibility',()=>{
 assert.equal(resolvePeloraApiUrl('/api/ocean/field?layer=bathymetry',qa),'http://127.0.0.1:8787/api/ocean/field?layer=bathymetry');
 for(const patch of [{VITE_PELORA_API_BASE:undefined},{VITE_PELORA_API_BASE:'https://hosted.invalid'},{VITE_SUPABASE_URL:'https://wrong.supabase.co'},{VITE_PELORA_API_BASE:'http://0.0.0.0:8787'}])assert.throws(()=>resolvePeloraApiUrl('/api/ocean',{...qa,...patch}));
 assert.equal(resolvePeloraApiUrl('/api/health',{DEV:true}),'/api/health');
});
test('actual initial Supabase module validates before createClient: target/key failures make zero SDK calls',()=>{
 const source=readFileSync(new URL('../../lib/supabase.js',import.meta.url),'utf8').replace(/^import[\s\S]*?;\s*/gm,'').replaceAll('import.meta.env','environment').replace('export const supabase','const supabase');
 let calls=0;const run=environment=>vm.runInNewContext(source,{environment,validateLocalQaClientConfiguration,createClient(){calls++;return {};}});
 for(const patch of [{VITE_PELORA_API_BASE:''},{VITE_SUPABASE_URL:'https://wrong.supabase.co'},{VITE_SUPABASE_PUBLISHABLE_KEY:''},{VITE_SUPABASE_PUBLISHABLE_KEY:'sb_secret_SYNTHETIC'}])assert.throws(()=>run({...qa,...patch}));assert.equal(calls,0);
 run(qa);assert.equal(calls,1);run({VITE_SUPABASE_URL:'https://synthetic-normal.invalid',VITE_SUPABASE_PUBLISHABLE_KEY:'SYNTHETIC'});assert.equal(calls,2);
});