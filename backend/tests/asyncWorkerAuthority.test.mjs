import test from 'node:test';
import assert from 'node:assert/strict';
import {harness,deferred,flush} from './fixtures/currentObservationWorkerFixture.mjs';

test('async claim and check are awaited; no transport before the claim resolves',async()=>{
 const h=harness(),gate=deferred(); let checks=0;
 h.ports.control={async claim(handle,at){await gate.promise;return h.control.port.claim(handle,at);},
  async check(handle,at){checks++;await Promise.resolve();return h.control.port.check(handle,at);},
  async release(handle){h.control.port.release(handle);}};
 const running=h.worker().run(h.handle);await flush();assert.equal(h.requests.length,0);
 gate.resolve();const result=await running;assert.equal(result.accepted,true);assert(checks>10);assert.equal(h.timers.count(),0);
});
test('async ownership rejection prevents provider acquisition',async()=>{
 const h=harness();h.ports.control={...h.control.port,async check(){await Promise.resolve();throw Error('database-owner-rejected');}};
 const result=await h.worker().run(h.handle);assert.equal(result.accepted,false);assert.equal(h.requests.length,0);
});
test('async final acceptance is awaited and authoritative refusal propagates',async()=>{
 const h=harness(),gate=deferred(),entered=deferred();
 h.ports.results={...h.results,async accept(record,authorize,at){await authorize();entered.resolve();await gate.promise;throw Error('database-stale-fence');}};
 const running=h.worker().run(h.handle);await entered.promise;let done=false;running.then(()=>{done=true;});await flush();assert.equal(done,false);
 gate.resolve();const result=await running;assert.equal(result.accepted,false);assert.equal(result.reason,'database-stale-fence');assert.equal(h.results.counts().accepted,0);
});
test('unreconciled acceptance is indeterminate rather than a false rejection',async()=>{
 const h=harness();h.ports.results={...h.results,async accept(){throw Object.assign(Error('acceptance-uncertain'),{code:'ACCEPTANCE_UNCERTAIN'});}};
 const result=await h.worker().run(h.handle);assert.equal(result.status,'INDETERMINATE');assert.equal(result.accepted,null);
});
test('cancellation during async claim stops work and releases the claim',async()=>{
 const h=harness(),gate=deferred(),c=new AbortController();let releases=0;
 h.ports.control={...h.control.port,async claim(handle,at){await gate.promise;return h.control.port.claim(handle,at);},async release(handle){releases++;h.control.port.release(handle);}};
 const running=h.worker().run(h.handle,c.signal);c.abort();gate.resolve();const result=await running;
 assert.equal(result.accepted,false);assert.equal(result.status,'STOPPED');assert.equal(h.requests.length,0);assert.equal(releases,1);
});
test('cleanup failure cannot erase a committed acceptance',async()=>{
 const h=harness();h.ports.control={...h.control.port,async release(){throw Error('disconnected-release');}};
 const result=await h.worker().run(h.handle);assert.equal(result.accepted,true);assert.equal(h.results.counts().accepted,1);
});
test('async acceptance cancellation check rejects before fake store insertion',async()=>{
 const h=harness(),gate=deferred(),entered=deferred(),c=new AbortController();
 h.ports.results={...h.results,async accept(record,authorize,at){entered.resolve();await gate.promise;return h.results.accept(record,authorize,at);}};
 const running=h.worker().run(h.handle,c.signal);await entered.promise;c.abort();gate.resolve();
 assert.equal((await running).accepted,false);assert.equal(h.results.counts().accepted,0);
});
test('corrupt acceptance acknowledgment cannot masquerade as a failed database decision',async()=>{
 const h=harness();h.ports.results={...h.results,async accept(record,authorize,at){await h.results.accept(record,authorize,at);return {status:'ACKNOWLEDGED',retainedAt:'corrupt',record};}};
 const result=await h.worker().run(h.handle);assert.equal(result.status,'INDETERMINATE');assert.equal(result.accepted,null);assert.equal(h.results.counts().accepted,1);
});
