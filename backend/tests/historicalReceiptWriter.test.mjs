import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {EventEmitter} from 'node:events';
import {createReceiptConnection,createReceiptConnectionForTests,RECEIPT_POOL_POLICY} from '../historicalReceiptConnection.mjs';
import {createHistoricalReceiptRuntime,createHistoricalReceiptRuntimeForTests,HISTORICAL_AVAILABILITY_CONTRACT,RECEIPT_AUTHORITY} from '../historicalReceiptRuntime.mjs';
import {encodeNormalizedCurrentHandoff} from '../normalizedEvidenceCapture.mjs';
import {readCurrentEvidenceCaptureV3,currentCaptureReferenceV3,captureCurrentEvidenceV3,serializeCurrentEvidenceCaptureV3} from '../currentEvidenceCaptureV3.mjs';
import {SOURCE_NORMALIZATION_VERSION} from '../sourceNormalization.mjs';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';

const at='2026-09-30T12:00:00.000Z';
const env={PELORA_RECEIPT_WRITER_ENABLED:'true',PELORA_RECEIPT_POSTGRES_URL:'postgresql://writer:test-secret@example.invalid:5432/receipts'};
function driverHarness(settings=env,{throwQuery=false,badResponse=false,idleError=false}={}) {
  const calls=[],configs=[];let loads=0,caReads=0;
  class Pool extends EventEmitter {
    constructor(config){super();configs.push(config);}
    async query(q){calls.push(q);if(idleError)this.emit('error',new Error('test-secret'));if(throwQuery)throw new Error('postgresql://writer:test-secret@example.invalid CA-SECRET');return badResponse?{}:{rows:[],rowCount:0};}
    async end(){}
  }
  const connection=createReceiptConnectionForTests({env:settings,readCA:async()=>{caReads++;throw Error('CA-SECRET');},loadDriver:async()=>{loads++;return {Pool};}});
  return {connection,calls,configs,counts:()=>({loads,caReads})};
}
const lookup=['captured','capture-version','reference','a'.repeat(64)];
function input(change=()=>{}) {
  const p=captureFixture('CURRENTS').samples[0].point;change(p);
  const h=encodeNormalizedCurrentHandoff(p,SOURCE_NORMALIZATION_VERSION);
  return {family:'CURRENTS',evidenceReference:h.reference,captureText:h.captureText};
}
function store({failInsert=false,failRead=false,uncertain=false}={}) {
  const rows=new Map();let writes=0;
  return {rows,get writes(){return writes;},close:async()=>{},async execute(op,values){
    const k=JSON.stringify(values.slice(0,4));
    if(op==='insert'){
      writes++;if(failInsert)return {ok:false};
      if(rows.has(k))return {ok:true,rows:[]};
      rows.set(k,values[8]);if(uncertain)return {ok:false};
      return {ok:true,rows:[{envelopeText:values[8]}]};
    }
    if(failRead)return {ok:false};
    return {ok:true,rows:rows.has(k)?[{envelopeText:rows.get(k)}]:[]};
  }};
}
const runtime=(s=store(),clock=()=>at)=>createHistoricalReceiptRuntimeForTests({connection:s,clock});

test('pinned pure JS pg resolves; installed optional metadata is accurately classified',async()=>{
  const require=createRequire(import.meta.url),pkg=require('pg/package.json'),lock=JSON.parse(readFileSync(new URL('../../package-lock.json',import.meta.url)));
  assert.equal(pkg.version,'8.23.0');assert.equal(lock.packages['node_modules/pg'].version,'8.23.0');
  assert.equal(pkg.optionalDependencies['pg-cloudflare'],'^1.4.0');
  assert(!lock.packages['node_modules/pg-native']);assert(!existsSync(new URL('../../node_modules/pg-native',import.meta.url)));
  const pg=await import('pg');assert.equal(typeof pg.Pool,'function');
  assert(!Object.keys(require.cache).some(p=>/[\\/]pg[\\/]lib[\\/]native[\\/]|[\\/]pg-native[\\/]/.test(p)));
});

for(const enabled of [undefined,'','false'])test('disabled without credential reads or driver/pool creation: '+String(enabled),async()=>{
  const e={PELORA_RECEIPT_WRITER_ENABLED:enabled};
  Object.defineProperty(e,'PELORA_RECEIPT_POSTGRES_URL',{get(){throw Error('secret should not be read');}});
  const h=driverHarness(e);assert.equal((await h.connection.execute('read',lookup)).category,'disabled');
  assert.deepEqual(h.counts(),{loads:0,caReads:0});assert.equal(h.configs.length,0);await h.connection.close();
});
test('default production factories do not connect or manufacture authority',async()=>{
  assert(!process.env.PELORA_RECEIPT_WRITER_ENABLED);
  const c=createReceiptConnection(),r=createHistoricalReceiptRuntime();
  assert.equal((await c.execute('read',lookup)).category,'disabled');
  assert.equal((await r.issue(input())).status,'AS_OF_AUTHORITY_UNKNOWN');await c.close();await r.close();
});
for(const overrides of [
  {PELORA_RECEIPT_WRITER_ENABLED:'yes'},
  {PELORA_RECEIPT_POSTGRES_URL:undefined},
  {PELORA_RECEIPT_POSTGRES_URL:'not a URL test-secret'},
  {PELORA_RECEIPT_POSTGRES_URL:'https://writer:test-secret@example.invalid/db'},
  {PELORA_RECEIPT_POSTGRES_URL:'postgres://writer@example.invalid/db'},
  {PELORA_RECEIPT_POSTGRES_URL:'postgres://writer:test-secret@example.invalid/'},
  {NODE_PG_FORCE_NATIVE:'1'}, {PGPASSWORD:'other-secret'}, {PGOPTIONS:'-c role=admin'},
  {PGSSLNEGOTIATION:'direct'}, {PGSSLMODE:'disable'}, {PGPASSFILE:'secret-file'}
])test('configuration rejection '+Object.keys(overrides).join(','),async()=>{
  const h=driverHarness({...env,...overrides}),result=await h.connection.execute('read',lookup);
  assert.equal(result.ok,false);assert.equal(h.configs.length,0);assert(!JSON.stringify(result).includes('secret'));
});
for(const parameter of ['sslmode=disable','sslcert=file','sslkey=file','sslrootcert=file','ssl=no-verify','sslnegotiation=direct','options=x','host=other','application_name=x'])test('URL options cannot override explicit policy: '+parameter,async()=>{
  const h=driverHarness({...env,PELORA_RECEIPT_POSTGRES_URL:env.PELORA_RECEIPT_POSTGRES_URL+'?'+parameter});
  assert.equal((await h.connection.execute('read',lookup)).ok,false);assert.equal(h.configs.length,0);
});
test('CA read failure fails closed without secret exposure',async()=>{
  const h=driverHarness({...env,PELORA_RECEIPT_POSTGRES_CA_FILE:'private-ca'}),result=await h.connection.execute('read',lookup);
  assert.equal(result.ok,false);assert.equal(h.counts().caReads,1);assert.equal(h.configs.length,0);assert(!JSON.stringify(result).includes('CA-SECRET'));
});
test('actual pg Pool config explicitly verifies TLS and bounded settings without connecting',async()=>{
  const {Pool,Client}=await import('pg');let actual,config;
  const c=createReceiptConnectionForTests({env,readCA:async()=>{throw Error('unneeded');},loadDriver:async()=>({Pool:class extends Pool{
    constructor(x){super(x);actual=this;config=x;}
    async query(){return {rows:[],rowCount:0};}
  }})});
  assert.equal((await c.execute('read',lookup)).ok,true);
  assert.equal(actual.totalCount,0);assert.equal(config.ssl.rejectUnauthorized,true);assert.equal(config.ssl.servername,'example.invalid');
  assert(!Object.hasOwn(config,'connectionString'));assert.equal(config.sslnegotiation,'postgres');
  for(const [k,v] of Object.entries(RECEIPT_POOL_POLICY))assert.equal(config[k],v);
  const client=new Client(config);assert.equal(client.connectionParameters.ssl.rejectUnauthorized,true);
  assert.equal(client.connectionParameters.sslnegotiation,'postgres');assert.equal(client.connectionParameters.options,'-c synchronous_commit=on');await c.close();
});
test('supplied CA is passed only to explicit TLS configuration',async()=>{
  let conf;const c=createReceiptConnectionForTests({env:{...env,PELORA_RECEIPT_POSTGRES_CA_FILE:'local-only'},readCA:async f=>{assert.equal(f,'local-only');return '-----BEGIN CERTIFICATE-----\nTEST\n-----END CERTIFICATE-----';},loadDriver:async()=>({Pool:class extends EventEmitter{constructor(x){super();conf=x;}async query(){return {rows:[],rowCount:0};}async end(){}}})});
  assert((await c.execute('read',lookup)).ok);assert(conf.ssl.ca.includes('TEST'));assert.equal(conf.ssl.rejectUnauthorized,true);await c.close();
});
for(const category of ['TLS','authentication','connection','query'])test('sanitized '+category+' failure poisons authority with no fallback',async()=>{
  const h=driverHarness(env,{throwQuery:true});const first=await h.connection.execute('read',lookup),second=await h.connection.execute('read',lookup);
  assert.deepEqual(first,{ok:false,category:'query_unavailable'});assert.equal(second.ok,false);assert.equal(h.calls.length,1);assert(!JSON.stringify([first,second]).includes('secret'));await h.connection.close();
});
test('driver initialization and unexpected response fail closed',async()=>{
  const c=createReceiptConnectionForTests({env,readCA:async()=>'',loadDriver:async()=>{throw Error('test-secret');}});
  assert.deepEqual(await c.execute('read',lookup),{ok:false,category:'configuration_or_driver_unavailable'});
  const h=driverHarness(env,{badResponse:true});assert.equal((await h.connection.execute('read',lookup)).category,'response_invalid');
});
test('fixed parameterized operations reject arbitrary SQL and preserve values as parameters',async()=>{
  const h=driverHarness();assert.equal((await h.connection.execute('DROP TABLE x',lookup)).ok,false);
  const injected=[...lookup];injected[2]="x'; DROP TABLE x; --";
  assert((await h.connection.execute('read',injected)).ok);assert(!h.calls[0].text.includes(injected[2]));assert.equal(h.calls[0].values[2],injected[2]);assert(h.calls[0].text.includes('$4'));await h.connection.close();
});
test('bounded operation queue and close prevent later pool creation',async()=>{
  let release,loads=0;const loading=new Promise(r=>{release=r;});
  const c=createReceiptConnectionForTests({env,readCA:async()=>'',loadDriver:async()=>{loads++;await loading;return {Pool:class{constructor(){throw Error('must not create after close');}}};}});
  const work=Array.from({length:16},()=>c.execute('read',lookup));
  assert.equal((await c.execute('read',lookup)).category,'capacity_unavailable');await c.close();release();
  assert((await Promise.all(work)).every(r=>!r.ok));assert(loads<=1);
});

for(const delta of [-1,0,1])test('trusted receipt as-of comparison '+delta,async()=>{
  const x=input(),r=runtime();assert.equal((await r.issue(x)).status,'RECEIPT_ACCEPTED');
  const result=await r.resolve(x.evidenceReference,new Date(Date.parse(at)+delta).toISOString());
  assert.equal(result.status,delta>=0?'AVAILABLE_BY_ASSESSMENT':'NOT_RECEIVED_BY_ASSESSMENT');
  assert.deepEqual(Object.keys(result).sort(),['record','status']);
});
test('current exact envelope retains normalization, signed zero and partial state',async()=>{
  for(const value of [+0,-0,1e200]){
    const x=input(p=>{p.eastwardMetersPerSecond=value;p.speedKnots=value===1e200?null:value;});const s=store(),r=runtime(s);
    const accepted=await r.issue(x);assert.equal(accepted.status,'RECEIPT_ACCEPTED');
    const e=JSON.parse([...s.rows.values()][0]),capture=readCurrentEvidenceCaptureV3(e.captureText);
    assert(Object.is(capture.samples[0].point.eastwardMetersPerSecond,value));
    assert.equal(capture.samples[0].point.speedDerivationFailed,value===1e200);
    assert.equal(e.dependencies[0].reference.contractVersion,SOURCE_NORMALIZATION_VERSION);
    assert.equal(e.issuerPolicy.contractVersion,RECEIPT_AUTHORITY);assert.equal(e.record.contractVersion,HISTORICAL_AVAILABILITY_CONTRACT);
    assert(Object.isFrozen(accepted.record));
  }
});
test('unavailable source diagnostics remain unavailable after retained capture replay',async()=>{
  const x=input(p=>{p.source.availability='unavailable';p.speedKnots=null;p.directionDegrees=null;});const s=store();
  assert.equal((await runtime(s).issue(x)).status,'RECEIPT_ACCEPTED');
  const c=readCurrentEvidenceCaptureV3(JSON.parse([...s.rows.values()][0]).captureText);
  assert.equal(c.samples[0].point.source.availability,'unavailable');assert.equal(c.samples[0].point.speedKnots,null);
});
for(const family of ['SST','DIRECT_CHLOROPHYLL','GAP_FILLED_CHLOROPHYLL','CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED'])test('family denied: '+family,async()=>{
  const s=store();assert.equal((await runtime(s).issue({...input(),family})).status,'INVALID_REFERENCE');assert.equal(s.writes,0);
});
for(const name of ['receivedAt','authorityReference','contractVersion','created_at','assessmentAt','generatedAt'])test('caller authority field rejected: '+name,async()=>{
  const s=store();let clocks=0;assert.equal((await runtime(s,()=>{clocks++;return at;}).issue({...input(),[name]:at})).status,'INVALID_REFERENCE');assert.equal(clocks,0);assert.equal(s.writes,0);
});
test('old/future represented timestamps do not control receipt time',async()=>{
  for(const observedAt of ['1900-01-01T00:00:00Z','2200-01-01T00:00:00Z']){
    let clocks=0;const result=await runtime(store(),()=>{clocks++;return at;}).issue(input(p=>{p.observedAt=observedAt;}));
    assert.equal(result.record.receivedAt,at);assert.equal(clocks,1);
  }
});
test('same-time revision identity remains distinct; repeat/concurrent receipt preserves winner',async()=>{
  const s=store(),x=input(),y=input(p=>{p.eastwardMetersPerSecond=0.75;});let i=0;
  const r=runtime(s,()=>new Date(Date.parse(at)+i++).toISOString());
  const accepted=await Promise.all(Array.from({length:8},()=>r.issue(x)));assert(accepted.every(a=>a.status==='RECEIPT_ACCEPTED'));
  assert(accepted.every(a=>a.record.receivedAt===accepted[0].record.receivedAt));assert.equal(s.rows.size,1);
  assert.equal((await r.issue(y)).status,'RECEIPT_ACCEPTED');assert.equal(s.rows.size,2);assert.notDeepEqual(x.evidenceReference,y.evidenceReference);
});
test('legacy absent witness, corrupt closure and wrong authority cannot pass resolver',async()=>{
  const x=input(),s=store(),r=runtime(s);assert.equal((await r.resolve(x.evidenceReference,at)).status,'AS_OF_AUTHORITY_UNKNOWN');
  await r.issue(x);const k=[...s.rows.keys()][0],original=s.rows.get(k);
  for(const mutate of [e=>{e.record.receivedAt='invalid';},e=>{e.record.contractVersion='wrong';},e=>{e.issuerPolicy.contractVersion='lookalike';},e=>{e.record.authorityReference.sha256='0'.repeat(64);},e=>{e.dependencies=[];},e=>{e.captureText='{}';},e=>{e.record.evidenceReference.sha256='0'.repeat(64);}]){
    const e=JSON.parse(original);mutate(e);s.rows.set(k,JSON.stringify(e));assert.equal((await r.resolve(x.evidenceReference,at)).status,'AS_OF_AUTHORITY_UNKNOWN');
  }
});
test('invalid assessment or wrong version/reference fails closed',async()=>{
  const r=runtime(),x=input();for(const t of [undefined,null,'bad','2026-09-30',Infinity])assert.equal((await r.resolve(x.evidenceReference,t)).status,'INVALID_REFERENCE');
  assert.equal((await r.resolve({...x.evidenceReference,contractVersion:'legacy'},at)).status,'INVALID_REFERENCE');
  assert.equal((await r.issue({...x,evidenceReference:{...x.evidenceReference,sha256:'0'.repeat(64)}})).status,'INVALID_REFERENCE');
});
test('missing normalization or unresolved lineage/source reference is not silently upgraded',async()=>{
  const base=readCurrentEvidenceCaptureV3(input().captureText);
  for(const lineageReferences of [[],[{...base.lineageReferences[0],contractVersion:'wrong'}],[...base.lineageReferences,base.sourceAuthority.reference]]){
    const c=captureCurrentEvidenceV3({family:base.family,sourceAuthority:base.sourceAuthority,samples:base.samples,lineageReferences});
    assert.equal((await runtime().issue({family:'CURRENTS',evidenceReference:currentCaptureReferenceV3(c),captureText:serializeCurrentEvidenceCaptureV3(c)})).status,'INVALID_REFERENCE');
  }
});
test('failed durable publication and uncertain acknowledgement never report success',async()=>{
  const x=input();for(const opts of [{failInsert:true},{uncertain:true}]){
    const s=store(opts),r=runtime(s);assert.equal((await r.issue(x)).status,'AS_OF_AUTHORITY_UNKNOWN');
    assert.equal((await r.resolve(x.evidenceReference,at)).status,opts.uncertain?'AVAILABLE_BY_ASSESSMENT':'AS_OF_AUTHORITY_UNKNOWN');
  }
  const s=store({failRead:true}),r=runtime(s);await r.issue(x);assert.equal((await r.issue(x)).status,'AS_OF_AUTHORITY_UNKNOWN');
});
test('detached input, inherited/accessor authority and invalid clock attacks',async()=>{
  let reads=0;const x=input();Object.defineProperty(x,'captureText',{get(){reads++;return '{}';},enumerable:true});
  assert.equal((await runtime().issue(x)).status,'INVALID_REFERENCE');assert.equal(reads,0);
  assert.equal((await runtime().issue(Object.assign(Object.create({receivedAt:at}),input()))).status,'INVALID_REFERENCE');
  const s=store();assert.equal((await runtime(s,()=>NaN).issue(input())).status,'INVALID_REFERENCE');assert.equal(s.writes,0);
});
test('unapplied SQL candidate denies clients and leaves deployment role/policies unprovisioned',()=>{
  const sql=readFileSync(new URL('../../supabase/migrations/20260930_historical_receipt_envelope_v1.sql',import.meta.url),'utf8');
  const executable=sql.split('\n').filter(l=>!l.trim().startsWith('--')).join('\n');
  assert.match(executable,/ENABLE ROW LEVEL SECURITY/);assert.match(executable,/FORCE ROW LEVEL SECURITY/);
  assert.match(executable,/FROM PUBLIC, anon, authenticated, service_role/);
  assert.match(executable,/PRIMARY KEY \(evidence_kind,evidence_contract_version,evidence_reference_id,evidence_sha256\)/);
  assert.match(executable,/\) IS TRUE/);assert(!/CREATE ROLE|CREATE POLICY|GRANT |SECURITY DEFINER|UPDATE |DELETE /i.test(executable));
  assert(!/REFERENCES public\.|REFERENCES auth\./i.test(executable));
});
