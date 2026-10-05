import {acquireCurrentProviderPoint, currentProviderRequest, CURRENTS_DATASET} from '../currentProviderAdapter.mjs';
import {encodeNormalizedCurrentHandoff} from '../normalizedEvidenceCapture.mjs';
import {SOURCE_NORMALIZATION_VERSION} from '../sourceNormalization.mjs';
import {requireScientificAssessmentV1, SCIENTIFIC_ASSESSMENT_V1} from '../scientificAssessment.mjs';
import {readCurrentEvidenceCaptureV3, validateCurrentCaptureReferenceV3} from '../currentEvidenceCaptureV3.mjs';
import {authorizeJob} from './jobs.mjs';
import {EXECUTION, createExecution, createBinding, validateBinding} from './provenance.mjs';
import {check, keys, same, utc, freeze} from './canonical.mjs';
import {snapshot, responseBytes, responseReference} from './workerData.mjs';
import {types} from 'node:util';

// Isolated one-attempt API. All ports, clocks and timers are privileged composition inputs.
// run accepts only an opaque control-port handle and optional cancellation signal.
export function createCurrentObservationWorker({control, policy, transport, responses, results, clock, timers}) {
  return Object.freeze({async run(handle, signal = null) {
    let owned = false, live = true, state, attempt, stopTimer, abortListener;
    const abort = new AbortController();
    let lastTime = -Infinity;
    const now = () => { const value = clock.now(), instant = utc(value); check(instant >= lastTime,'clock-regression'); lastTime = instant; return value; };
    async function guard() { check(live && !abort.signal.aborted, 'attempt-stopped'); const fresh = snapshot(await control.check(handle,now()));
      check(live && !abort.signal.aborted, 'attempt-stopped'); check(same(fresh,state), 'authorization-changed'); return fresh; }
    async function bounded(operation, milliseconds) {
      await guard(); let timer, listener;
      const cancelled = new Promise((_,reject) => {
        listener = () => reject(new Error('attempt-stopped'));
        abort.signal.addEventListener('abort',listener,{once:true});
        timer = timers.arm(milliseconds,() => { abort.abort('timeout'); });
      });
      try { const value = await Promise.race([Promise.resolve().then(async () => { await guard(); return operation(); }),cancelled]); await guard(); return value; }
      finally { timers.clear(timer); abort.signal.removeEventListener('abort',listener); }
    }
    try {
      check(signal === null || signal instanceof AbortSignal, 'cancellation-signal');
      check(!signal?.aborted, 'cancelled-before-start');
      const startedAt = now(); state = snapshot(await control.claim(handle,startedAt)); owned = true;
      const {context} = state; attempt = state.attempt;
      const {manifest,job} = context;
      authorizeJob(manifest,context.activation,context.trustedState,job,startedAt);
      check(manifest.product.dataset === CURRENTS_DATASET && manifest.product.provider === 'NOAA CoastWatch', 'adapter-product');
      abortListener = () => abort.abort('cancelled'); signal?.addEventListener('abort',abortListener,{once:true});
      if (signal?.aborted) abort.abort('cancelled');
      stopTimer = timers.arm(Math.max(0,utc(job.deadline)-utc(startedAt)),() => abort.abort('deadline'));
      const policyStartedAt = now();
      const selected = snapshot(await bounded(() => policy.select(manifest.providerTime.policyReference,job,abort.signal),manifest.providerTime.maxWaitMs));
      keys(selected,['policyReference','selectedProviderTime']);
      check(same(selected.policyReference,manifest.providerTime.policyReference),'time-policy-binding'); utc(selected.selectedProviderTime);
      const requestedAt = now(), assessment = requireScientificAssessmentV1({contractVersion:SCIENTIFIC_ASSESSMENT_V1,assessmentAt:requestedAt});
      check(utc(requestedAt)-utc(policyStartedAt) <= manifest.providerTime.maxWaitMs,'provider-time-wait-budget');
      const {latitude,longitude} = job.cell.coordinates, selector = freeze({mode:'TIME',time:selected.selectedProviderTime});
      const requestUrl = currentProviderRequest(latitude,longitude,selector).href;
      check(Buffer.byteLength(requestUrl) <= manifest.limits.maxRequestBytes,'request-size');
      let receivedAt, responseRetainedAt, rawReference;
      const point = await bounded(() => acquireCurrentProviderPoint(latitude,longitude,assessment,async url => {
        await guard(); check(url.href === requestUrl,'actual-request-mismatch');
        const envelope = await transport(Object.freeze({url:url.href,signal:abort.signal})); await guard();
        // Bytes cannot go through the ordinary JSON data snapshot. Inspect descriptors first.
        check(envelope && !types.isProxy(envelope) && Object.getPrototypeOf(envelope) === Object.prototype,'transport-envelope');
        const descriptors = Object.getOwnPropertyDescriptors(envelope);
        check(Reflect.ownKeys(descriptors).length === 4 && ['bytes','status','provider','dataset'].every(k => descriptors[k]?.enumerable && Object.hasOwn(descriptors[k],'value')), 'transport-envelope');
        check(descriptors.status.value === 200 && descriptors.provider.value === manifest.product.provider && descriptors.dataset.value === manifest.product.dataset,'transport-source');
        const bytes = responseBytes(descriptors.bytes.value,manifest.limits.maxResponseBytes); receivedAt = now();
        const expected = responseReference(bytes), ack = snapshot(await responses.retain(Buffer.from(bytes))); await guard();
        keys(ack,['status','reference']); check(['ACKNOWLEDGED','UNCERTAIN'].includes(ack.status) && same(ack.reference,expected),'response-retention');
        const back = await responses.read(expected); await guard();
        check(back && !types.isProxy(back) && Object.getPrototypeOf(back) === Object.prototype,'response-readback');
        const bd = Object.getOwnPropertyDescriptors(back);
        check(bd.status?.value === 'FOUND' && bd.bytes && Object.hasOwn(bd.bytes,'value'),'response-readback');
        const retained = responseBytes(bd.bytes.value,manifest.limits.maxResponseBytes);
        check(retained.equals(bytes) && same(responseReference(retained),expected),'response-readback-integrity');
        rawReference = expected; responseRetainedAt = now();
        // Parse the retained exact bytes, never a reconstructed object serialization.
        const parsed = JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(retained));
        // Operational envelope validity only; all numeric interpretation stays in the adapter.
        const columns = parsed?.table?.columnNames, rows = parsed?.table?.rows;
        check(Array.isArray(columns) && columns.every(c => typeof c === 'string') && new Set(columns).size === columns.length &&
          ['time','latitude','longitude','u_current','v_current'].every(c => columns.includes(c)) && Array.isArray(rows) &&
          rows.every(row => Array.isArray(row) && row.length === columns.length),'malformed-provider-table');
        return parsed;
      },selector),manifest.limits.requestTimeoutMs);
      await guard();
      if (point.source.availability === 'no-valid-pixel') return freeze({status:'NO_DATA',accepted:false});
      check(point.source.availability === 'available','source-availability');
      const normalizedAt = now(), handoff = encodeNormalizedCurrentHandoff(point,SOURCE_NORMALIZATION_VERSION);
      const observationTime = typeof point.observedAt === 'string' && !point.observedAt.includes('.') ? point.observedAt.replace('Z','.000Z') : point.observedAt;
      const execution = createExecution(context,{contractVersion:EXECUTION,jobId:job.jobId,manifestDigest:manifest.digest,cellKey:job.cellKey,...attempt,
        startedAt,finishedAt:now(),outcome:'NORMALIZED',failure:null,evidenceReference:handoff.reference,normalizationVersion:SOURCE_NORMALIZATION_VERSION,
        acquisition:{requestedAt,receivedAt,normalizedAt,retainedResponseReference:rawReference,
          request:{provider:manifest.product.provider,dataset:manifest.product.dataset,adapter:manifest.product.adapter,gridReference:manifest.gridReference,
            indices:job.cell.indices,coordinates:job.cell.coordinates,selectedProviderTime:selected.selectedProviderTime},
          response:{provider:point.source.provider,dataset:point.source.dataset,gridReference:manifest.gridReference,
            coordinates:{latitude:point.resolvedLatitude,longitude:point.resolvedLongitude},observationTime}}},handoff.captureText);
      const binding = createBinding(context,execution,handoff.captureText);
      const record = freeze({execution,binding,captureText:handoff.captureText,assessment,responseRetainedAt,requestUrl,
        metadataBasis:{providerDataset:'ALLOWLISTED_REQUEST_AND_ADAPTER_NOT_PROVIDER_REPORTED',grid:'APPROVED_REQUEST_GRID_NOT_PROVIDER_REPORTED',coordinatesTime:'RETURNED_RESPONSE',revision:'NOT_REPORTED'}});
      const ack = snapshot(await bounded(async () => { const result = await results.write(record);
        if (!live || abort.signal.aborted) await results.discard(attempt.attemptId); return result;
      },Math.max(0,utc(job.deadline)-utc(now()))));
      keys(ack,['status']); check(['ACKNOWLEDGED','UNCERTAIN'].includes(ack.status),'result-write-rejected');
      const back = snapshot(await bounded(() => results.read(attempt.attemptId),Math.max(0,utc(job.deadline)-utc(now()))));
      check(JSON.stringify(back) === JSON.stringify(record),'result-readback-integrity');
      const capture = readCurrentEvidenceCaptureV3(back.captureText); validateCurrentCaptureReferenceV3(back.execution.evidenceReference,capture);
      validateBinding(context,back.execution,back.captureText,back.binding); await guard();
      const retainedAt = now(); check(utc(retainedAt) >= utc(execution.finishedAt),'retention-time-order');
      const acceptance = await results.accept(record,guard,retainedAt);
      let accepted;
      try {
        accepted = snapshot(acceptance);
        check(accepted.status === 'ACKNOWLEDGED' && accepted.retainedAt === retainedAt && JSON.stringify(accepted.record) === JSON.stringify(record),'acceptance-acknowledgment');
      } catch(error) {
        // A malformed reply cannot prove that an acceptance did not commit.
        throw Object.assign(new Error('acceptance-acknowledgment-uncertain'),{code:'ACCEPTANCE_UNCERTAIN',cause:error});
      }
      return freeze({...accepted,status:'ACCEPTED',accepted:true,reconciled:ack.status === 'UNCERTAIN'});
    } catch (error) {
      if (error.code === 'ACCEPTANCE_UNCERTAIN') return freeze({status:'INDETERMINATE',accepted:null,reason:error.message});
      return freeze({status:abort.signal.aborted ? 'STOPPED' : 'REJECTED',accepted:false,reason:abort.signal.aborted ? String(abort.signal.reason) : error.message});
    } finally {
      live = false; abort.abort('finished'); if (stopTimer !== undefined) timers.clear(stopTimer);
      if (abortListener) signal?.removeEventListener('abort',abortListener);
      if (owned) {
        // A cleanup failure cannot erase a committed acceptance or fabricate a
        // failed acceptance. Durable leases recover an unreachable release.
        try { if (attempt) await results.discard(attempt.attemptId); await control.release(handle); } catch { /* lease recovery */ }
      }
    }
  }});
}
