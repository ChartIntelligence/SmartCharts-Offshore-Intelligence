// Server-only, dedicated receipt authority. Importing this module opens nothing.
import {readFile} from 'node:fs/promises';
import {isIP} from 'node:net';

export const RECEIPT_POOL_POLICY = Object.freeze({max:2, connectionTimeoutMillis:4000,
  idleTimeoutMillis:30000, statement_timeout:4000, query_timeout:5000,
  lock_timeout:1000, idle_in_transaction_session_timeout:5000});
const unavailable = category => Object.freeze({ok:false, category});
const statements = Object.freeze({
  insert: `INSERT INTO pelora_receipts.receipt_envelopes
    (evidence_kind,evidence_contract_version,evidence_reference_id,evidence_sha256,
     contract_version,received_at,authority_reference_id,authority_sha256,envelope_text)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    ON CONFLICT (evidence_kind,evidence_contract_version,evidence_reference_id,evidence_sha256)
    DO NOTHING RETURNING envelope_text`,
  read: `SELECT envelope_text FROM pelora_receipts.receipt_envelopes
    WHERE evidence_kind=$1 AND evidence_contract_version=$2 AND evidence_reference_id=$3 AND evidence_sha256=$4`
});

async function configuration(env, readCA) {
  // Do not even read secret/CA/native/PG settings while disabled.
  const enabled=env.PELORA_RECEIPT_WRITER_ENABLED;
  if (enabled===undefined || enabled==='' || enabled==='false') return {disabled:true};
  if (enabled!=='true') throw new Error('configuration');
  // pg has ambient libpq-style defaults (including pgpass and PGOPTIONS). Never
  // silently borrow them for this dedicated authority, or force native loading.
  if (env.NODE_PG_FORCE_NATIVE || Object.keys(env).some(k=>/^PG/.test(k) && env[k])) throw new Error('configuration');
  const raw=env.PELORA_RECEIPT_POSTGRES_URL;
  // Apply the existing decoded-component control boundary before URL can erase controls.
  if (typeof raw!=='string' || /[\x00-\x1f\x7f]/.test(raw) || raw.trim()!==raw) throw new Error('configuration');
  const url=new URL(raw);
  if (!['postgres:','postgresql:'].includes(url.protocol) || url.search || url.hash ||
      !url.hostname || isIP(url.hostname.replace(/^\[|\]$/g,'')) ||
      !/^[a-zA-Z0-9.-]+$/.test(url.hostname) || !url.username || !url.password ||
      !/^\/[^/]+$/.test(url.pathname)) throw new Error('configuration');
  const user=decodeURIComponent(url.username),password=decodeURIComponent(url.password),database=decodeURIComponent(url.pathname.slice(1));
  if ([user,password,database].some(x=>!x || /[\x00-\x1f\x7f]/.test(x))) throw new Error('configuration');
  const port=url.port?Number(url.port):5432;
  if (!Number.isInteger(port) || port<1 || port>65535) throw new Error('configuration');
  const ssl={rejectUnauthorized:true,servername:url.hostname};
  const caFile=env.PELORA_RECEIPT_POSTGRES_CA_FILE;
  if (caFile!==undefined && caFile!=='') {
    if (typeof caFile!=='string') throw new Error('configuration');
    const ca=await readCA(caFile,'utf8');
    if (typeof ca!=='string' || !ca.includes('-----BEGIN CERTIFICATE-----')) throw new Error('configuration');
    ssl.ca=ca;
  }
  // No connectionString is passed to pg: it cannot reparse/override this TLS object.
  return {host:url.hostname,port,user,password,database,ssl,sslnegotiation:'postgres',
    application_name:'pelora-receipt-writer-v1',options:'-c synchronous_commit=on',
    ...RECEIPT_POOL_POLICY};
}

function connection({env,readCA,loadDriver}) {
  let pool,initialization,closed=false,failed=false,pending=0;
  async function initialize() {
    try {
      const config=await configuration(env,readCA);
      if (config.disabled) return unavailable('disabled');
      if (closed || failed) return unavailable('connection_unavailable');
      const {Pool}=await loadDriver();
      if (closed || failed) return unavailable('connection_unavailable');
      pool=new Pool(config);
      pool.on('error',()=>{failed=true;}); // Never log/propagate driver error objects.
      return {ok:true};
    } catch { failed=true; return unavailable('configuration_or_driver_unavailable'); }
  }
  return Object.freeze({
    async execute(operation,values) {
      if (closed || failed) return unavailable('connection_unavailable');
      if (!Object.hasOwn(statements,operation) || !Array.isArray(values) ||
          values.length!==(operation==='insert'?9:4) || values.some(v=>typeof v!=='string')) return unavailable('query_invalid');
      if (pending>=16) return unavailable('capacity_unavailable');
      pending++;
      try {
        initialization??=initialize();
        const ready=await initialization;
        if (!ready.ok) return ready;
        if (closed || failed) return unavailable('connection_unavailable');
        const result=await pool.query({text:statements[operation],values:[...values]});
        if (!result || !Array.isArray(result.rows) || result.rows.length>1 ||
            result.rowCount!==result.rows.length || result.rows.some(r=>typeof r.envelope_text!=='string')) {
          failed=true;return unavailable('response_invalid');
        }
        return {ok:true,rows:result.rows.map(r=>({envelopeText:r.envelope_text}))};
      } catch { failed=true;return unavailable('query_unavailable'); }
      finally { pending--; }
    },
    async close() {
      closed=true;
      if (!pool) return;
      let timer;
      try { await Promise.race([pool.end(),new Promise(resolve=>{timer=setTimeout(resolve,5000);timer.unref?.();})]); }
      catch { /* no secret-bearing shutdown errors */ }
      finally { clearTimeout(timer); }
    }
  });
}

export function createReceiptConnection() {
  return connection({env:process.env,readCA:readFile,loadDriver:()=>import('pg')});
}
// Explicit offline composition seam; never sourced from request data/environment.
export function createReceiptConnectionForTests(dependencies) { return connection(dependencies); }
