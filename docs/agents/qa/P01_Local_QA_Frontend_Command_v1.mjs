// Controlled build utility; preview requires separately approved launch, never inferred from a build.
import {createRequire} from 'node:module';import {pathToFileURL,fileURLToPath} from 'node:url';import path from 'node:path';
import {validateLocalQaClientConfiguration} from '../../../frontend/src/utils/localQaStartup.js';
const [mode,runtimeRoot,output]=process.argv.slice(2);
if(!['build','preview'].includes(mode)||!runtimeRoot||!output)throw new Error('Use build|preview <existing frontend node_modules> <fresh build directory>');
if(process.env.VITE_PELORA_LOCAL_QA_READ_ONLY!=='1'||!validateLocalQaClientConfiguration(process.env))throw new Error('Explicit validated QA client config required');
if(mode==='preview'&&process.env.PELORA_LOCAL_QA_PREVIEW_APPROVED!=='1')throw new Error('Separate founder launch approval required before preview');
const root=fileURLToPath(new URL('../../../frontend',import.meta.url));const require=createRequire(path.resolve(runtimeRoot,'package.json'));
const {build,preview}=await import(pathToFileURL(require.resolve('vite')));const {default:react}=await import(pathToFileURL(require.resolve('@vitejs/plugin-react')));
const packages=['react','react-dom','@supabase/supabase-js','maplibre-gl','leaflet','react-leaflet','leaflet.heat','@js-temporal/polyfill'];
const config={root,configFile:false,envDir:false,plugins:[react()],resolve:{dedupe:['@js-temporal/polyfill'],alias:packages.map(name=>({find:new RegExp('^'+name.replaceAll('.','\\.')+'(?=/|$)'),replacement:path.resolve(runtimeRoot,name)}))},build:{outDir:path.resolve(output),emptyOutDir:true},preview:{host:'127.0.0.1',port:4173,strictPort:true}};
if(mode==='build')await build(config);else{
 const server=await preview(config);let stopped=false;const stop=()=>{if(stopped)return;stopped=true;server.httpServer.closeAllConnections?.();server.httpServer.close();};process.once('SIGINT',stop);process.once('SIGTERM',stop);console.log('Local QA frontend listening on 127.0.0.1:4173');
}