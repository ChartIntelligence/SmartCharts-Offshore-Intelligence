// Final controlled integration qualification; restart is a separate explicit command.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';
if(process.env.PELORA_CP09_P4A_LOCAL!=='1')throw Error('controlled-local-opt-in-required');
const out=path.resolve('.local/ocean-quarantine/cp09b-p4a');fs.mkdirSync(out,{recursive:true});
const files=['backend/durableObserve/controlledPublicationBinding.mjs','backend/durableObserve/controlledRetainedPublication.mjs','backend/durableObserve/publicationEnvelope.mjs','backend/durableObserve/publicationScheduler.mjs','backend/durableObserve/publicationStore.mjs','backend/durableObserve/localPublicationPublisher.mjs','backend/tests/controlledRetainedPublication.test.mjs','backend/tests/fixtures/controlledRetainedPublicationFixture.mjs','backend/tests/fixtures/controlledRetainedPublicationProcess.mjs','scripts/qualifyControlledPublicationRestart.mjs','scripts/qualifyControlledPublicationP4A.mjs'];
const hash=x=>createHash('sha256').update(x).digest('hex'),fingerprints=Object.fromEntries(files.map(f=>[f,hash(fs.readFileSync(f))])),commands=[],env={...process.env,PELORA_TEST_OCEAN_CONDITIONS:'1',PELORA_CP08_LOCAL:'1',PELORA_CP09_LOCAL:'1',PELORA_CP09B_P2_LOCAL:'1',PELORA_CP09_P4A_LOCAL:'1'};
function run(name,args){const r=spawnSync(process.execPath,args,{env,encoding:'utf8',windowsHide:true,maxBuffer:24e6,timeout:900000}),log=(r.stdout??'')+'\n'+(r.stderr??'');fs.writeFileSync(path.join(out,name+'.log'),log);const count=k=>Number(log.match(new RegExp('(?:\\u2139|#)\\s+'+k+'\\s+(\\d+)'))?.[1]??0);commands.push({name,command:['node',...args],exit:r.status,tests:count('tests'),passed:count('pass'),failed:count('fail'),skipped:count('skipped'),cancelled:count('cancelled'),logSha256:hash(log)});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify({fingerprints,commands},null,2)+'\n');console.log(JSON.stringify(commands.at(-1)));assert.equal(r.status,0,name+' failed; see local log');}
for(const f of files)run('syntax-'+path.basename(f),['--check',f]);
run('integration',['--test','backend/tests/controlledRetainedPublication.test.mjs']);
run('p2-60',['--test','--test-isolation=none','backend/tests/retainedInputSupply.test.mjs','backend/tests/postgresRetainedInputSupply.test.mjs']);
run('frame-archive',['--test','backend/tests/oceanProductFrame.test.js','backend/tests/oceanProductArchive.test.js']);
run('p1-affected',['scripts/qualifyRetainedBlueMarlinP1.mjs']);
run('prior-839',['scripts/qualifyCP09Local.mjs',path.join(out,'prior-839')]);
for(const [file,digest] of Object.entries(fingerprints))assert.equal(hash(fs.readFileSync(file)),digest,'final tested source changed');
console.log('Final controlled P4-A qualification completed; tested bytes unchanged.');
