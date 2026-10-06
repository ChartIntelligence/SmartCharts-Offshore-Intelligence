// Bounded final P2 qualification. No migration/restart occurs implicitly.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';
if(process.env.PELORA_CP09B_P2_LOCAL!=='1')throw Error('isolated-local-opt-in-required');
const out=path.resolve(process.argv[2]??'.local/ocean-quarantine/cp09b-p2');fs.mkdirSync(out,{recursive:true});
const files=['backend/durableObserve/retainedInputSupply.mjs','backend/durableObserve/cp09bSupply.sql','backend/durableObserve/retainedSupplyPrivilegeManifest.v1.json','backend/tests/retainedInputSupply.test.mjs','backend/tests/postgresRetainedInputSupply.test.mjs','backend/tests/fixtures/retainedInputSupplyFixture.mjs','backend/tests/fixtures/retainedInputSupplyImport.mjs','scripts/applyCP09BP2Local.mjs','scripts/qualifyCP09BP2Restart.mjs','scripts/qualifyRetainedInputSupplyP2.mjs'];
const hash=x=>createHash('sha256').update(x).digest('hex'),fingerprints=Object.fromEntries(files.map(f=>[f,hash(fs.readFileSync(f))])),env={...process.env,PELORA_TEST_OCEAN_CONDITIONS:'1',PELORA_CP09B_P2_LOCAL:'1',PELORA_CP09_LOCAL:'1'},commands=[];
function run(name,args){const r=spawnSync(process.execPath,args,{env,encoding:'utf8',windowsHide:true,timeout:900000,maxBuffer:24e6}),log=(r.stdout??'')+'\n'+(r.stderr??'');fs.writeFileSync(path.join(out,name+'.log'),log);commands.push({name,command:['node',...args],exit:r.status,logSha256:hash(log)});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify({commands,fingerprints},null,2)+'\n');console.log(JSON.stringify(commands.at(-1)));assert.equal(r.status,0,name+' failed; see retained log');}
for(const f of files.filter(f=>f.endsWith('.mjs')))run('syntax-'+path.basename(f),['--check',f]);
run('p2-focused',['--test','--test-isolation=none','backend/tests/retainedInputSupply.test.mjs','backend/tests/postgresRetainedInputSupply.test.mjs']);
run('affected-frame-archive',['--test','backend/tests/oceanProductFrame.test.js','backend/tests/oceanProductArchive.test.js']);
run('p1-affected',['scripts/qualifyRetainedBlueMarlinP1.mjs']);
run('prior-839',['scripts/qualifyCP09Local.mjs',path.join(out,'prior-839')]);
for(const [f,sha] of Object.entries(fingerprints))assert.equal(hash(fs.readFileSync(f)),sha,'tested bytes changed: '+f);
console.log('Final P2 candidate fingerprints unchanged; 883 baseline boundary plus focused P2 cases executed.');
