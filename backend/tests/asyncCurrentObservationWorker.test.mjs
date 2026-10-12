import assert from 'node:assert/strict';
import {test} from 'node:test';
import {harness,deferred,flush,time} from './fixtures/currentObservationWorkerFixture.mjs';

function asyncPorts(h) {
  const c=h.ports.control,r=h.ports.results;
  h.ports.control={claim:async(...a)=>c.claim(...a),check:async(...a)=>c.check(...a),release:async(...a)=>c.release(...a)};
  h.ports.results={...r,accept:async(...a)=>r.accept(...a),discard:async(...a)=>r.discard(...a),readAccepted:async(...a)=>r.readAccepted(...a)};
}
test('all async authority ports preserve exact sync scientific/reference output',async()=>{
 const a=harness(),b=harness();asyncPorts(b);
 assert.deepEqual(await b.worker().run(b.handle),await a.worker().run(a.handle));
});
test('claim must settle before policy or acquisition',async()=>{
 const h=harness(),d=deferred(),c=h.ports.control;let selected=0;
 h.ports.control={...c,claim:async(...a)=>{await d.promise;return c.claim(...a);}};
 const p=h.ports.policy;h.ports.policy={select:async(...a)=>{selected++;return p.select(...a);}};
 const run=h.worker().run(h.handle);await flush();assert.equal(selected,0);assert.equal(h.requests.length,0);
 d.resolve();assert.equal((await run).accepted,true);
});
test('cancellation while async ownership check is pending prevents transport',async()=>{
 const h=harness(),d=deferred(),a=new AbortController(),c=h.ports.control;
 h.ports.control={...c,check:async(...args)=>{await d.promise;return c.check(...args);}};
 const run=h.worker().run(h.handle,a.signal);await flush();a.abort();d.resolve();
 assert.equal((await run).status,'STOPPED');assert.equal(h.requests.length,0);
});
test('async stale check cannot publish',async()=>{
 const h=harness(),d=deferred(),c=h.ports.control;
 h.ports.control={...c,check:async(...args)=>{await d.promise;return c.check(...args);}};
 const run=h.worker().run(h.handle);await flush();h.control.issue(h.job,time(0,1));d.resolve();
 assert.equal((await run).accepted,false);assert.equal(h.results.counts().accepted,0);
});
for(const mode of ['throw','uncertain','cancel'])test('committed acceptance reconciles lost ACK: '+mode,async()=>{
 const h=harness(),r=h.results,a=new AbortController();
 h.ports.results={...r,accept:async(...args)=>{const result=r.accept(...args);if(mode==='cancel')a.abort();if(mode==='uncertain')return {status:'UNCERTAIN'};throw Error('lost ACK');}};
 const out=await h.worker().run(h.handle,a.signal);assert.equal(out.status,'ACCEPTED');assert.equal(out.reconciled,true);assert.equal(h.results.counts().accepted,1);
});
for(const mode of ['missing','outage','conflict'])test('ambiguous acceptance fails closed: '+mode,async()=>{
 const h=harness(),r=h.results;let calls=0;
 h.ports.results={...r,accept:async()=>{calls++;throw Error('unknown commit');},readAccepted:async()=>{
 if(mode==='outage')throw Error('offline');if(mode==='conflict')return {status:'ACKNOWLEDGED',retainedAt:time(0,1),record:{wrong:true}};return null;}};
 const out=await h.worker().run(h.handle);assert.equal(out.status,'UNKNOWN');assert.equal(out.accepted,false);assert.equal(calls,1);assert.equal(h.results.counts().pending,1);
});
test('delayed acceptance validates current claim rather than earlier guard',async()=>{
 const h=harness(),r=h.results,d=deferred();let entered=false;
 h.ports.results={...r,accept:async(...args)=>{entered=true;await d.promise;return r.accept(...args);}};
 const run=h.worker().run(h.handle);await flush();assert.equal(entered,true);h.control.issue(h.job,time(0,1));d.resolve();
 assert.equal((await run).status,'UNKNOWN');assert.equal(h.results.counts().accepted,0);
});
test('async cleanup is awaited and receives exact attempt/fence',async()=>{
 const h=harness(),d=deferred(),c=h.ports.control;let expected,finished=false;
 h.ports.control={...c,release:async(handle,attempt)=>{expected=attempt;await d.promise;return c.release(handle,attempt);}};
 const run=h.worker().run(h.handle).then(x=>{finished=true;return x;});await flush();assert(expected);assert.equal(finished,false);d.resolve();
 const out=await run;assert.equal(out.accepted,true);assert.equal(expected.attemptId,out.record.execution.attemptId);
});
test('cleanup failure cannot erase committed acceptance',async()=>{
 const h=harness(),c=h.ports.control;h.ports.control={...c,release:async()=>{throw Error('release offline');}};
 const out=await h.worker().run(h.handle);assert.equal(out.status,'ACCEPTED');assert.equal(out.cleanup,'PENDING');
});
test('async preaccept discard failure is explicit cleanup pending',async()=>{
 const h=harness(),r=h.results;h.ports.transport=async()=>{throw Error('transport');};h.ports.results={...r,discard:async()=>{throw Error('cleanup');}};
 const out=await h.worker().run(h.handle);assert.equal(out.status,'REJECTED');assert.equal(out.cleanup,'PENDING');
});
test('fake release cannot revoke a successor claim',async()=>{
 const h=harness(),old=h.control.port.claim(h.handle,time(0,1));const next=h.control.issue(h.job,time(0,1));
 h.control.port.release(h.handle,old.attempt);assert(h.control.port.claim(next,time(0,1)));
});
