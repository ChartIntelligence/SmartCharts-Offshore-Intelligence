import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import profile from './sourceNormalizationRegressionProfile.v1.json' with {type:'json'};
const root=new URL('../../',import.meta.url);
const bytes=p=>readFileSync(new URL(p,root));
const sha=p=>createHash('sha256').update(bytes(p)).digest('hex');
const walk=(relative)=>readdirSync(new URL(relative+'/',root),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(relative+'/'+e.name):[relative+'/'+e.name]);

test('regression manifest accounts for every script without a catch-all failing-test exclusion',()=>{
  const all=[...walk('backend/tests'),...walk('shared')].filter(p=>p.endsWith('.test.js')).sort();
  const actual=[...profile.currentScripts,...profile.archivalScripts.map(x=>x.file),...profile.quarantine.map(x=>x.file)].sort();
  assert.deepEqual(actual,all);assert.equal(new Set(actual).size,actual.length);
  assert.equal(profile.quarantine.length,1);assert.equal(profile.archivalScripts.length,2);
  assert(!profile.currentScripts.some(p=>p.includes('candidateSemanticProjectionV3')));
});

test('all 48 historical assertions have explicit roles and selected current replacement coverage',()=>{
  assert.equal(profile.archiveAssertions.length,48);
  assert.equal(profile.archiveAssertions.filter(x=>x.role==='HISTORICAL_CHARACTERIZATION').length,38);
  assert.equal(profile.archiveAssertions.filter(x=>x.role==='FROZEN_SOURCE_INVENTORY').length,10);
  const keys=new Set();
  for(const x of profile.archiveAssertions){
    assert(x.reason&&x.historicalExpected&&x.currentResult);
    assert(profile.currentScripts.includes(x.file)||profile.archivalScripts.some(s=>s.file===x.file));
    const key=x.file+'\0'+x.title;assert(!keys.has(key));keys.add(key);
    for(const replacement of x.replacements){assert(profile.currentScripts.includes(replacement));assert(existsSync(new URL(replacement,root)));}
  }
  assert(profile.currentScripts.includes('backend/tests/currentVectorFailureLocalityContract.test.js'));
});

test('historical tests retain their exact hashes and current modules have a separate versioned inventory',()=>{
  for(const [p,h] of Object.entries(profile.protectedTestHashes))assert.equal(sha(p),h,p);
  assert.equal(profile.currentSourceInventory.version,'pelora-source-normalization-runtime-source-inventory-v1');
  for(const [p,h] of Object.entries(profile.currentSourceInventory.files))assert.equal(sha(p),h,p);
  assert.equal(Object.keys(profile.currentSourceInventory.files).length,4);
});
