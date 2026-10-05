import test from 'node:test';
import assert from 'node:assert/strict';
import {discoverModuleSourceClosure} from './fixtures/moduleSourceClosureFixture.mjs';

function analyze(sources, transportRule = null) {
 return discoverModuleSourceClosure({readSource:file=>sources[file],allowedFiles:Object.keys(sources),roots:['backend/server.js'],entry:'backend/server.js::entry',transportRule});
}
test('static imported function and alias resolve through actual module path',()=>{
 const g=analyze({'backend/server.js':"import {measure as alias} from './provider.mjs'; function entry(){return alias();}",'backend/provider.mjs':'export function measure(){return 1;}'});
 assert(g.nodes.some(n=>n.id==='backend/provider.mjs::measure'));assert.equal(g.unresolvedNamedTargets.length,0);
});
test('same function name in separate modules retains distinct identities',()=>{
 const g=analyze({'backend/server.js':"import {same as remote} from './provider.mjs'; function same(){return 1;} function entry(){return [same(),remote()];}",'backend/provider.mjs':'export function same(){return 2;}'});
 assert(g.nodes.some(n=>n.id==='backend/server.js::same'));assert(g.nodes.some(n=>n.id==='backend/provider.mjs::same'));
});
test('missing export fails closed rather than resolving by matching name elsewhere',()=>{
 assert.throws(()=>analyze({'backend/server.js':"import {absent} from './provider.mjs'; function entry(){return absent();}",'backend/provider.mjs':'function absent(){return 1;}'}),/Unresolved or ambiguous/);
});
test('relevant missing source fails closed',()=>{
 assert.throws(()=>analyze({'backend/server.js':"import {measure} from './provider.mjs'; function entry(){return measure();}",'backend/provider.mjs':undefined}),/Unresolved module source/);
});
test('unrelated imports are not loaded or included',()=>{
 const g=analyze({'backend/server.js':"import {unused} from './unused.mjs'; function entry(){return 1;}",'backend/unused.mjs':'not valid JavaScript'});
 assert.equal(g.nodes.length,1);assert(!Object.hasOwn(g.sourceHashes,'backend/unused.mjs'));
});
test('out-of-scope import remains an unresolved obligation',()=>{
 const g=analyze({'backend/server.js':"import {run} from './outside.mjs'; function entry(){return run();}"});
 assert.equal(g.unresolvedNamedTargets[0].target,'run');assert.equal(g.semanticGraphComplete,false);
});
test('test and fixture modules cannot enter production allowlist',()=>{
 assert.throws(()=>analyze({'backend/server.js':'function entry(){return 1;}','backend/tests/spy.mjs':'export function spy(){}'}),/Production module allowlist/);
});
test('cyclic named imports are bounded and retain both functions',()=>{
 const g=analyze({'backend/server.js':"import {loop} from './provider.mjs'; export function entry(){return loop();}",'backend/provider.mjs':"import {entry} from './server.js'; export function loop(){return entry();}"});
 assert.equal(g.nodes.length,2);
});
const rule={caller:'backend/server.js::entry',callee:'backend/provider.mjs::acquire',parameter:'transport',index:0,argument:'fetchJson'};
test('injected transport follows the qualified actual call path',()=>{
 const g=analyze({'backend/server.js':"import {acquire} from './provider.mjs'; function fetchJson(){return 1;} function entry(){return acquire(fetchJson);}",'backend/provider.mjs':'export function acquire(transport){return transport();}'},rule);
 assert.equal(g.transportEdges[0].to,'backend/server.js::fetchJson');
 assert(g.edges.some(e=>e.from==='backend/provider.mjs::acquire'&&e.to==='backend/server.js::fetchJson'&&e.resolution==='INJECTED_TRANSPORT_INVOCATION'));
 assert(!g.unresolvedNamedTargets.some(x=>x.target==='transport'));
});
test('arbitrary callback injection is not treated as protected transport',()=>{
 const g=analyze({'backend/server.js':"import {acquire} from './provider.mjs'; function arbitrary(){return 1;} function entry(){return acquire(arbitrary);}",'backend/provider.mjs':'export function acquire(transport){return transport();}'});
 assert.equal(g.transportEdges.length,0);assert(g.unresolvedNamedTargets.some(x=>x.target==='transport'));
});
test('mismatched protected transport argument fails closed',()=>{
 assert.throws(()=>analyze({'backend/server.js':"import {acquire} from './provider.mjs'; function arbitrary(){return 1;} function entry(){return acquire(arbitrary);}",'backend/provider.mjs':'export function acquire(transport){return transport();}'},rule),/Unsupported protected transport/);
});
test('unsupported namespace import fails closed when relevant',()=>{
 assert.throws(()=>analyze({'backend/server.js':"import * as provider from './provider.mjs'; function entry(){return provider();}",'backend/provider.mjs':'export function run(){return 1;}'}),/Unsupported relevant import form/);
});
test('a second caller cannot inherit a protected transport edge',()=>{
 assert.throws(()=>analyze({'backend/server.js':"import {acquire} from './provider.mjs'; function fetchJson(){return 1;} function other(){return acquire(fetchJson);} function entry(){return [acquire(fetchJson),other()];}",'backend/provider.mjs':'export function acquire(transport){return transport();}'},rule),/Unqualified protected transport/);
});
test('shadowed supplied transport is rejected',()=>{
 assert.throws(()=>analyze({'backend/server.js':"import {acquire} from './provider.mjs'; function fetchJson(){return 1;} function entry(fetchJson){return acquire(fetchJson);}",'backend/provider.mjs':'export function acquire(transport){return transport();}'},rule),/Shadowed protected transport/);
});
test('imported data constant is not reported as a function',()=>{
 const g=analyze({'backend/server.js':"import {value} from './provider.mjs'; function entry(){return value;}",'backend/provider.mjs':'export const value=1;'});
 assert.equal(g.nodes.length,1);
});
test('re-export-only binding is outside supported narrow resolution',()=>{
 assert.throws(()=>analyze({'backend/server.js':"import {run} from './provider.mjs'; function entry(){return run();}",'backend/provider.mjs':"export {run} from './other.mjs';",'backend/other.mjs':'export function run(){return 1;}'}),/Unresolved or ambiguous/);
});
test('a moved function is recognized by declaration content with its new module identity',()=>{
 const declaration='function measure(){return 1;}';
 const baseline=analyze({'backend/server.js':declaration+' function entry(){return measure();}'});
 const candidate=analyze({'backend/server.js':"import {measure} from './provider.mjs'; function entry(){return measure();}",'backend/provider.mjs':'export '+declaration});
 const before=baseline.nodes.find(n=>n.function==='measure'),after=candidate.nodes.find(n=>n.function==='measure');
 assert.equal(before.sourceHash,after.sourceHash);assert.notEqual(before.id,after.id);
 assert(candidate.edges.some(e=>e.to===after.id));
});
