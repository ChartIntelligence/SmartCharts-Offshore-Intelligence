// Existing dependency root supplied explicitly; no installation or source remapping.
import {createRequire,registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';
const runtime=process.argv[2];
if(!runtime)throw Error('Explicit existing frontend node_modules path required');
const require=createRequire(pathToFileURL(runtime.replaceAll('\\','/')+'/../package.json'));
const paths=new Map(['react','react-dom/client','rolldown/utils','@js-temporal/polyfill'].map(s=>[s,pathToFileURL(require.resolve(s)).href]));
registerHooks({resolve(s,c,next){return next(c.parentURL?.includes('/node_modules/')?s:(paths.get(s)??s),c);}});
await import('./captainProfileRead.test.js');
await import('./captainProfileHook.test.js');
