import {randomUUID} from 'node:crypto';
import {snapshot, responseBytes} from '../observe/workerData.mjs';
import {check, keys, same, utc} from '../observe/canonical.mjs';
import {validateManifest} from '../observe/manifest.mjs';
import {validateActivation, resolveActivation} from '../observe/activation.mjs';
import {authorizeJob} from '../observe/jobs.mjs';
import {validateBinding} from '../observe/provenance.mjs';

// Privileged local composition. No environment, connection, transport or timers
// on import; never import this module from interactive/server entry points.
export function createPostgresAttempt({query, transaction, jobId, capability = randomUUID()}) {
  check(typeof transaction === 'function','acceptance-transaction-required');
  const handle = Object.freeze({}); let state, acceptanceQuery, accepting = false;
  const call = async (op, payload = null, bytes = null) => {
    const result = await (acceptanceQuery ?? query)('SELECT cp02.worker($1,$2,$3,$4,$5) AS value', [op,jobId,capability,payload,bytes]);
    return result.rows[0].value;
  };
  const admit = value => { check(value === handle,'opaque-handle'); };
  const ack = value => value === null ? null : snapshot({status:value.status,retainedAt:value.retainedAt,record:JSON.parse(value.recordText)});
  const uncertain = cause => Object.assign(new Error('acceptance-uncertain'),{code:'ACCEPTANCE_UNCERTAIN',cause});
  const control = Object.freeze({
    async claim(value, at) { admit(value); utc(at); state = snapshot(await call('claim')); return state; },
    async check(value, at) { admit(value); utc(at); return snapshot(await call('check')); },
    async release(value) { admit(value); await call('release'); }
  });
  const responses = Object.freeze({
    async retain(bytes) { return snapshot(await call('raw-write',null,responseBytes(bytes,16777216))); },
    async read(reference) { const value = await call('raw-read',JSON.stringify(snapshot(reference)));
      return value ? {status:'FOUND',bytes:Buffer.from(value.hex,'hex')} : {status:'MISSING'}; }
  });
  const results = Object.freeze({
    async write(record) {
      const copy = snapshot(record); check(state,'claim-required');
      validateBinding(state.context,copy.execution,copy.captureText,copy.binding);
      check(same(state.attempt,{attemptId:copy.execution.attemptId,attemptNumber:copy.execution.attemptNumber,fencingToken:copy.execution.fencingToken}),'attempt-binding');
      try { return snapshot(await call('write',JSON.stringify(copy))); }
      catch(error) { if (error.code === 'P0001' || error.code?.startsWith('23')) throw error;
        return snapshot({status:'UNCERTAIN'}); }
    },
    async read(attemptId) { check(attemptId === state?.attempt.attemptId,'attempt-binding');
      const text = await call('read'); return text === null ? null : snapshot(JSON.parse(text)); },
    async accept(record, authorize, retainedAt) {
      check(!accepting,'acceptance-in-flight'); utc(retainedAt); const copy = snapshot(record); accepting = true;
      try {
        return await transaction(async transactionQuery => {
          acceptanceQuery = transactionQuery;
          try {
            // All async guard queries now use this same transaction/connection.
            // Database locks remain held through the final local cancellation
            // check and COMMIT; an aborted callback must roll back the insert.
            await authorize();
            const value = ack(await call('accept',JSON.stringify({recordText:JSON.stringify(copy),retainedAt})));
            await authorize(); return value;
          } finally { acceptanceQuery = undefined; }
        });
      }
      catch(error) {
        if(error.acceptanceRolledBack || error.code === 'P0001' || error.code?.startsWith('23')) throw error;
        // A lost COMMIT reply is neither rejection nor a second write. Read the
        // authoritative immutable decision through a fresh query connection.
        try { const found = ack(await call('accepted'));
          if(found && JSON.stringify(found.record) === JSON.stringify(copy)) return found;
        } catch { /* Preserve indeterminate acceptance, never claim failure. */ }
        throw uncertain(error);
      } finally { accepting = false; }
    },
    async reconcile() { return ack(await call('accepted')); },
    // Staging is immutable audit history. Cleanup releases ownership only.
    discard() {}
  });
  return Object.freeze({handle,control,responses,results});
}

// CP-02 composition contract: a dedicated connection, no implicit autocommit
// fallback. Reconciliation queries use the pool after transaction completion.
export function postgresTransaction(pool) {
  return async operation => {
    const client = await pool.connect(); let commitAttempted = false;
    try {
      await client.query('BEGIN');
      const value = await operation((...args) => client.query(...args));
      commitAttempted = true; await client.query('COMMIT'); return value;
    } catch(error) {
      try { await client.query('ROLLBACK'); error.acceptanceRolledBack = !commitAttempted; } catch { /* uncertain connection */ }
      throw error;
    } finally { client.release(); }
  };
}

// Migration/registry authority only: use an owner-authorized connection, NEVER
// the worker connection. Approved artifact meaning remains a human trust root.
export async function registerLocalJob(client, contextInput, jobInput, {leaseMs = 120000} = {}) {
  const c = snapshot(contextInput); keys(c,['manifest','activation','trustedState']);
  const manifest = validateManifest(c.manifest), activation = validateActivation(c.activation);
  const at = (await client.query('SELECT clock_timestamp() AS instant')).rows[0].instant.toISOString();
  resolveActivation(manifest,activation,c.trustedState,at);
  const job = authorizeJob(manifest,activation,c.trustedState,snapshot(jobInput),at);
  check(Number.isInteger(leaseMs) && leaseMs >= 1 && leaseMs <= 120000,'lease-range');
  await client.query('BEGIN');
  try {
    await client.query('INSERT INTO cp02.registry VALUES($1,$2,$3,true) ON CONFLICT DO NOTHING',[manifest.digest,JSON.stringify(c),activation.revision]);
    const previous = (await client.query('SELECT context FROM cp02.registry WHERE manifest_id=$1 FOR UPDATE',[manifest.digest])).rows[0].context;
    check(same(previous,c),'registry-conflict');
    await client.query('INSERT INTO cp02.jobs VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING',
      [job.jobId,manifest.digest,JSON.stringify(job),job.window.start,job.deadline,
        new Date(utc(job.window.start)+manifest.schedule.permittedExecutionDelayMs).toISOString(),manifest.retry.maxAttempts,leaseMs]);
    const existing = (await client.query('SELECT job,lease_ms FROM cp02.jobs WHERE job_id=$1',[job.jobId])).rows[0];
    check(same(existing.job,job) && existing.lease_ms === leaseMs,'job-conflict');
    await client.query('INSERT INTO cp02.ownership(job_id) VALUES($1) ON CONFLICT DO NOTHING',[job.jobId]);
    await client.query('COMMIT'); return job;
  } catch(error) { await client.query('ROLLBACK'); throw error; }
}

export async function updateLocalActivation(client, manifestId, activationInput, trustedInput) {
  const activation = validateActivation(snapshot(activationInput)), trustedState = snapshot(trustedInput);
  await client.query('BEGIN');
  try {
    const row = (await client.query('SELECT context,revision FROM cp02.registry WHERE manifest_id=$1 FOR UPDATE',[manifestId])).rows[0];
    check(row && activation.revision > Number(row.revision),'activation-revision');
    // Disabled/revoked records still require exact protected trust binding.
    const {manifest} = row.context;
    check(same(activation.manifestReference,trustedState.approvedManifestReference) &&
      activation.manifestReference.sha256 === manifest.digest && trustedState.activationDigest === activation.digest &&
      trustedState.activationRevision === activation.revision,'activation-trust');
    keys(trustedState,['approvedManifestReference','activationDigest','activationRevision']);
    await client.query('UPDATE cp02.registry SET context=$2,revision=$3,enabled=$4 WHERE manifest_id=$1',
      [manifestId,JSON.stringify({manifest,activation,trustedState}),activation.revision,activation.state === 'ENABLED']);
    await client.query('COMMIT');
  } catch(error) { await client.query('ROLLBACK'); throw error; }
}
