import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {readFileSync} from 'node:fs';
import {createReceiptConnectionForTests,RECEIPT_POOL_POLICY} from '../historicalReceiptConnection.mjs';
import {createHistoricalReceiptRuntimeForTests} from '../historicalReceiptRuntime.mjs';
import {encodeNormalizedCurrentHandoff} from '../normalizedEvidenceCapture.mjs';
import {SOURCE_NORMALIZATION_VERSION} from '../sourceNormalization.mjs';
import {readCurrentEvidenceCaptureV3} from '../currentEvidenceCaptureV3.mjs';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';

const url='postgresql://synthetic:secret@example.invalid:5432/receipts';
const at='2026-09-30T12:00:00.000Z';
const lookup=['captured','version','reference','0'.repeat(64)];
function harness({raw=url,enabled='true',readCA=async()=>{throw Error('secret CA');},caFile,query,loadFailure=false,constructorFailure=false,env:specified}={}) {
  const counts={pools:0,loads:0,queries:0,connects:0,caReads:0,ends:0};let config,pool;
  class Pool extends EventEmitter {
    constructor(c){super();counts.pools++;if(constructorFailure)throw Error(url);config=c;pool=this;}
    async connect(){counts.connects++;throw Error('No connection authorized');}
    async query(q){counts.queries++;return query?query(q):{rows:[],rowCount:0};}
    async end(){counts.ends++;}
  }
  const env=specified??{PELORA_RECEIPT_WRITER_ENABLED:enabled,PELORA_RECEIPT_POSTGRES_URL:raw,...(caFile===undefined?{}:{PELORA_RECEIPT_POSTGRES_CA_FILE:caFile})};
  const connection=createReceiptConnectionForTests({env,readCA:async(...args)=>{counts.caReads++;return readCA(...args);},loadDriver:async()=>{counts.loads++;if(loadFailure)throw Error(url);return {Pool};}});
  return {connection,counts,get config(){return config;},get pool(){return pool;}};
}
async function denied(raw) {
  const h=harness({raw}),result=await h.connection.execute('read',lookup);
  assert.deepEqual(result,{ok:false,category:'configuration_or_driver_unavailable'});
  assert.deepEqual(h.counts,{pools:0,loads:0,queries:0,connects:0,caReads:0,ends:0});
  assert(!JSON.stringify(result).includes('secret'));await h.connection.close();
}
const positions={
  scheme:c=>`postgre${c}sql://synthetic:secret@example.invalid:5432/receipts`,
  username:c=>`postgresql://syn${c}thetic:secret@example.invalid:5432/receipts`,
  password:c=>`postgresql://synthetic:sec${c}ret@example.invalid:5432/receipts`,
  hostname:c=>`postgresql://synthetic:secret@exam${c}ple.invalid:5432/receipts`,
  port:c=>`postgresql://synthetic:secret@example.invalid:54${c}32/receipts`,
  database:c=>`postgresql://synthetic:secret@example.invalid:5432/rece${c}ipts`,
  query:c=>`${url}?x=val${c}ue`,fragment:c=>`${url}#frag${c}ment`
};
for(const[name,c]of [['LF','\n'],['CR','\r'],['TAB','\t']])for(const[position,make]of Object.entries(positions))
  test(`raw ${name} in ${position} fails before Pool/query`,()=>denied(make(c)));
test('all C0 and DEL raw controls follow existing decoded-component rejection boundary',async()=>{
  for(const n of [...Array(32).keys(),127])for(const make of Object.values(positions))await denied(make(String.fromCharCode(n)));
});
test('original five-case reproduction passes: valid, LF, CR, TAB, encoded LF hostname',async()=>{
  const h=harness();assert((await h.connection.execute('read',lookup)).ok);assert.equal(h.config.ssl.rejectUnauthorized,true);await h.connection.close();
  for(const c of ['\n','\r','\t','%0A'])await denied(positions.hostname(c));
});
for(const c of ['%0A','%0D','%09'])for(const p of ['hostname','username','password','database','query'])
  test(`encoded ${c} in ${p}: existing rejection preserved`,()=>denied(positions[p](c)));
test('valid encoded credentials preserve literal component values without URL reparse',async()=>{
  const h=harness({raw:'postgresql://user%40name:p%3Ass%2Fword%25@example.invalid/db%20name'});
  assert((await h.connection.execute('read',lookup)).ok);assert.equal(h.config.user,'user@name');assert.equal(h.config.password,'p:ss/word%');assert.equal(h.config.database,'db name');
  assert(!Object.hasOwn(h.config,'connectionString'));await h.connection.close();
});
test('whitespace characterization preserves prior policy, without Unicode normalization',async()=>{
  for(const w of [' ','\u00a0','\u2003','\u2028']){
    await denied(w+url);await denied(url+w);await denied(positions.hostname(w));
    const h=harness({raw:positions.password(w)});assert((await h.connection.execute('read',lookup)).ok);assert.equal(h.config.password,'sec'+w+'ret');await h.connection.close();
  }
});
test('disabled mode ignores malformed ambient URL, CA and PG settings without reads',async()=>{
  for(const enabled of [undefined,'','false']){
    const env={PELORA_RECEIPT_WRITER_ENABLED:enabled};
    for(const k of ['PELORA_RECEIPT_POSTGRES_URL','PELORA_RECEIPT_POSTGRES_CA_FILE','PGPASSWORD','NODE_PG_FORCE_NATIVE'])Object.defineProperty(env,k,{enumerable:true,get(){throw Error('secret must stay unread');}});
    const h=harness({env});assert.deepEqual(await h.connection.execute('read',lookup),{ok:false,category:'disabled'});assert.equal(h.counts.loads,0);assert.equal(h.counts.caReads,0);
  }
});
test('unexpected enabled strings do not enable receipt authority',async()=>{
  for(const enabled of ['TRUE','True','1','0','yes',' true','true ','\ntrue']){
    const h=harness({enabled});assert(!(await h.connection.execute('read',lookup)).ok);assert.equal(h.counts.pools,0);
  }
});
test('malformed URL, fragment, IPv6 and invalid encodings fail closed',async()=>{
  for(const raw of [null,'','secret','https://user:secret@example.invalid/db','postgres://user:secret@[::1]/db',url+'#fragment',url.replace('secret','%XX'),url.replace('5432','65536'),url.replace('receipts','a/b')])await denied(raw);
});
test('SSL option case, encoding and duplicates cannot replace explicit TLS',async()=>{
  for(const q of ['SSLMODE=disable','%73slmode=disable','sslmode=require&sslmode=disable','sslcert=x','sslkey=x','sslrootcert=x','sslnegotiation=direct','ssl=false','ssl=%7B%22rejectUnauthorized%22%3Afalse%7D'])await denied(url+'?'+q);
});
test('CA missing, directory, unreadable and empty inputs fail without secret exposure',async()=>{
  for(const mode of ['ENOENT','EISDIR','EACCES','empty','text']){
    const h=harness({caFile:'relative-local-ca',readCA:async()=>{if(mode==='empty')return '';if(mode==='text')return 'SECRET_NOT_A_CERT';throw Error(mode+' '+url+' CA-SECRET');}});
    const r=await h.connection.execute('read',lookup);assert(!r.ok);assert.equal(h.counts.pools,0);assert(!JSON.stringify(r).includes('SECRET'));
  }
});
test('CA marker is not certificate qualification; driver TLS error stays sanitized',async()=>{
  const ca='-----BEGIN CERTIFICATE-----\nNOT_A_CERTIFICATE\n-----END CERTIFICATE-----';
  const h=harness({caFile:'relative-ca',readCA:async()=>ca,query:async()=>{throw Error(ca+' '+url);}});
  assert.deepEqual(await h.connection.execute('read',lookup),{ok:false,category:'query_unavailable'});assert.equal(h.config.ssl.ca,ca);assert.equal(h.config.ssl.rejectUnauthorized,true);
  await h.connection.close();
});
test('pool constructor and driver initialization errors do not escape or fall back',async()=>{
  for(const opt of [{constructorFailure:true},{loadFailure:true}]){
    const h=harness(opt);assert.deepEqual(await h.connection.execute('read',lookup),{ok:false,category:'configuration_or_driver_unavailable'});assert(!(await h.connection.execute('read',lookup)).ok);assert.equal(h.counts.loads,1);
  }
});
test('parallel calls share one bounded pool; idle error poisons future authority',async()=>{
  const h=harness();assert((await Promise.all(Array.from({length:12},()=>h.connection.execute('read',lookup)))).every(x=>x.ok));assert.equal(h.counts.pools,1);
  for(const[k,v]of Object.entries(RECEIPT_POOL_POLICY))assert.equal(h.config[k],v);
  h.pool.emit('error',new Error(url+' CA-SECRET'));assert(!(await h.connection.execute('read',lookup)).ok);await h.connection.close();assert(!(await h.connection.execute('read',lookup)).ok);assert.equal(h.counts.pools,1);
});
test('secret-bearing query errors expose only fixed categories',async()=>{
  const secret=[url,'synthetic','secret','example.invalid','CA-SECRET',lookup[2]].join('|');
  const h=harness({query:async()=>{const e=new Error(secret);e.detail=secret;e.cause={secret};throw e;}});
  assert.deepEqual(await h.connection.execute('read',lookup),{ok:false,category:'query_unavailable'});await h.connection.close();
});

function input(change=()=>{}) {
  const p=captureFixture('CURRENTS').samples[0].point;change(p);
  const h=encodeNormalizedCurrentHandoff(p,SOURCE_NORMALIZATION_VERSION);
  return {family:'CURRENTS',evidenceReference:h.reference,captureText:h.captureText};
}
function composition({rows=new Map(),clock=()=>at,failure}={}) {
  const calls=[];
  const h=harness({query:async q=>{
    calls.push(q);const k=JSON.stringify(q.values.slice(0,4));
    if(q.text.startsWith('INSERT')){
      if(failure==='before-publication')throw Error('storage unavailable');
      if(rows.has(k))return {rows:[],rowCount:0};
      rows.set(k,q.values[8]);
      if(failure==='uncertain-ack')throw Error('commit acknowledgement lost');
      return {rows:[{envelope_text:q.values[8]}],rowCount:1};
    }
    return rows.has(k)?{rows:[{envelope_text:rows.get(k)}],rowCount:1}:{rows:[],rowCount:0};
  }});
  return {runtime:createHistoricalReceiptRuntimeForTests({connection:h.connection,clock}),h,rows,calls};
}
test('composed issuer/connection/SQL adapter supports before/equal/after availability only',async()=>{
  const x=input(),c=composition();assert.equal((await c.runtime.issue(x)).status,'RECEIPT_ACCEPTED');
  for(const [delta,status]of [[-1,'NOT_RECEIVED_BY_ASSESSMENT'],[0,'AVAILABLE_BY_ASSESSMENT'],[1,'AVAILABLE_BY_ASSESSMENT']]){
    const r=await c.runtime.resolve(x.evidenceReference,new Date(Date.parse(at)+delta).toISOString());assert.equal(r.status,status);assert.deepEqual(Object.keys(r).sort(),['record','status']);
  }
  assert.equal(c.rows.size,1);assert.equal(c.h.counts.pools,1);await c.runtime.close();
});
test('composed parameterized insert carries entire closure in one operation',async()=>{
  const c=composition(),x=input();await c.runtime.issue(x);assert.equal(c.calls.length,1);
  const q=c.calls[0];assert.equal(q.values.length,9);assert.match(q.text,/ON CONFLICT[\s\S]*DO NOTHING RETURNING/);
  for(const value of q.values)assert(!q.text.includes(value));
  const e=JSON.parse(q.values[8]);assert.equal(e.captureText,x.captureText);assert.equal(e.dependencies.length,2);assert.deepEqual(e.record.evidenceReference,x.evidenceReference);await c.runtime.close();
});
test('composed concurrent repeat preserves one accepted winner timestamp',async()=>{
  let ticks=0;const c=composition({clock:()=>new Date(Date.parse(at)+ticks++).toISOString()}),x=input();
  const results=await Promise.all(Array.from({length:8},()=>c.runtime.issue(x)));
  assert(results.every(r=>r.status==='RECEIPT_ACCEPTED'));assert(results.every(r=>r.record.receivedAt===at));assert.equal(c.rows.size,1);
  assert.equal((await c.runtime.issue(x)).record.receivedAt,at);await c.runtime.close();
});
test('failure before atomic insert cannot create a partial witness',async()=>{
  const c=composition({failure:'before-publication'});assert.equal((await c.runtime.issue(input())).status,'AS_OF_AUTHORITY_UNKNOWN');assert.equal(c.rows.size,0);await c.runtime.close();
});
test('uncertain acknowledgement fails closed; fresh connection retry retrieves accepted winner',async()=>{
  const rows=new Map(),x=input(),first=composition({rows,failure:'uncertain-ack'});
  assert.equal((await first.runtime.issue(x)).status,'AS_OF_AUTHORITY_UNKNOWN');assert.equal(rows.size,1);await first.runtime.close();
  const retry=composition({rows,clock:()=>new Date(Date.parse(at)+1000).toISOString()});
  assert.equal((await retry.runtime.issue(x)).record.receivedAt,at);assert.equal(rows.size,1);await retry.runtime.close();
});
test('exact reference distinguishes same-time revisions, signed zero and partial state',async()=>{
  const c=composition();const variants=[input(p=>{p.eastwardMetersPerSecond=+0;}),input(p=>{p.eastwardMetersPerSecond=-0;}),input(p=>{p.eastwardMetersPerSecond=1e200;p.speedKnots=null;})];
  for(const x of variants)assert.equal((await c.runtime.issue(x)).status,'RECEIPT_ACCEPTED');
  assert.equal(new Set(variants.map(x=>x.evidenceReference.sha256)).size,3);assert.equal(c.rows.size,3);
  const captures=[...c.rows.values()].map(text=>readCurrentEvidenceCaptureV3(JSON.parse(text).captureText));
  assert(Object.is(captures[0].samples[0].point.eastwardMetersPerSecond,+0));assert(Object.is(captures[1].samples[0].point.eastwardMetersPerSecond,-0));assert.equal(captures[2].samples[0].point.speedDerivationFailed,true);await c.runtime.close();
});
test('unsupported families/versions and caller authority never reach clock or storage',async()=>{
  let clocks=0;const c=composition({clock:()=>{clocks++;return at;}}),x=input();
  for(const bad of [{...x,receivedAt:at},{...x,authorityReference:'fake'},{...x,family:'SST'},{...x,family:'DIRECT_CHLOROPHYLL'},{...x,family:'GAP_FILLED_CHLOROPHYLL'},...['v1','v2','v4'].map(v=>({...x,evidenceReference:{...x.evidenceReference,contractVersion:'pelora-governed-current-evidence-capture-'+v}}))])assert.equal((await c.runtime.issue(bad)).status,'INVALID_REFERENCE');
  assert.equal(clocks,0);assert.equal(c.h.counts.pools,0);await c.runtime.close();
});
test('legacy and corrupt dependency closure remain unknown; SQL-like assessment cannot reach storage',async()=>{
  const c=composition(),x=input();assert.equal((await c.runtime.resolve(x.evidenceReference,at)).status,'AS_OF_AUTHORITY_UNKNOWN');
  const before=c.calls.length;assert.equal((await c.runtime.resolve(x.evidenceReference,"';DROP TABLE x;--")).status,'INVALID_REFERENCE');assert.equal(c.calls.length,before);
  await c.runtime.issue(x);const k=[...c.rows.keys()][0],original=c.rows.get(k);
  for(const mutate of [e=>{e.record.authorityReference.referenceId='fake';},e=>{e.issuerPolicy.contractVersion='wrong';},e=>{e.dependencies[0].text='{}';},e=>{e.authorityTarget.receivedAt='1900-01-01T00:00:00.000Z';}]){
    const e=JSON.parse(original);mutate(e);c.rows.set(k,JSON.stringify(e));assert.equal((await c.runtime.resolve(x.evidenceReference,at)).status,'AS_OF_AUTHORITY_UNKNOWN');
  }
  await c.runtime.close();
});
test('SQL remains single co-retained envelope, private/default-deny and unapplied',()=>{
  const sql=readFileSync(new URL('../../supabase/migrations/20260930_historical_receipt_envelope_v1.sql',import.meta.url),'utf8');
  const body=sql.split('\n').filter(x=>!x.trim().startsWith('--')).join('\n');
  assert.equal((body.match(/CREATE TABLE/g)||[]).length,1);assert.match(body,/envelope_text text NOT NULL/);assert.match(body,/isfinite\(received_at\)/);assert.match(body,/\) IS TRUE/);
  assert.match(body,/FROM PUBLIC, anon, authenticated, service_role/);assert.match(body,/FORCE ROW LEVEL SECURITY/);
  assert(!/CREATE POLICY|CREATE ROLE|GRANT |SECURITY DEFINER|CREATE SEQUENCE/i.test(body));
  assert(!/password|postgresql:\/\//i.test(body));
});
