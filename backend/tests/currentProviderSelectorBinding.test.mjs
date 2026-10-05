import test from 'node:test';
import assert from 'node:assert/strict';
import {currentProviderRequest, acquireCurrentProviderPoint} from '../currentProviderAdapter.mjs';
import {assessment, payload} from './fixtures/currentProviderCharacterization.mjs';

const timestamp = '2026-10-01T00:00:00.000Z';
const query = time => `u_current[(${time})][(25)][(-90)],v_current[(${time})][(25)][(-90)]`;
const decoded = url => decodeURIComponent(url.search.slice(1));

test('reported TIME getter cannot replace validated timestamp with last in request or transport', async () => {
  for (const acquire of [false, true]) {
    let reads = 0;
    const selector = {mode:'TIME', get time() { return ++reads <= 6 ? timestamp : 'last'; }};
    let url;
    if (acquire) {
      await acquireCurrentProviderPoint(25, -90, assessment, async argument => {
        url = argument;
        return payload();
      }, selector);
    } else url = currentProviderRequest(25, -90, selector);
    assert.equal(decoded(url), query(timestamp));
    assert.equal(reads, 1);
  }
});

async function transmitted(selector, expected) {
  let calls = 0;
  const point = await acquireCurrentProviderPoint(25, -90, assessment, async url => {
    calls++;
    assert.equal(decoded(url), query(expected));
    return payload();
  }, selector);
  assert.equal(calls, 1);
  assert.equal(point.source.availability, 'available');
  assert.equal(point.observedAt, timestamp);
  return point;
}

for (const mode of ['TIME', 'LATEST']) test(`changing ${mode} mode is read once at request and acquisition boundaries`, async () => {
  for (const acquire of [false, true]) {
    let reads = 0;
    const selector = {get mode() { return ++reads === 1 ? mode : 'INVALID'; }};
    if (mode === 'TIME') selector.time = timestamp;
    const expected = mode === 'TIME' ? timestamp : 'last';
    if (acquire) await transmitted(selector, expected);
    else assert.equal(decoded(currentProviderRequest(25, -90, selector)), query(expected));
    assert.equal(reads, 1);
  }
});

test('time changing immediately after its first read cannot alter either variable selector', async () => {
  let reads = 0;
  await transmitted({mode:'TIME', get time() { return ++reads === 1 ? timestamp : 'last'; }}, timestamp);
  assert.equal(reads, 1);
});

test('throwing second mode/time reads are never reached', async () => {
  let modes = 0, times = 0;
  await transmitted({get mode() { if (++modes > 1) throw Error('mode reread'); return 'TIME'; },
    get time() { if (++times > 1) throw Error('time reread'); return timestamp; }}, timestamp);
  assert.deepEqual([modes, times], [1, 1]);
});

for (const value of ['last', '2026-02-30T00:00:00Z', '2026-10-01', '', null, undefined, 0, new String(timestamp),
  {toString() { throw Error('coercion forbidden'); }}]) {
  test(`invalid first time fails before transport (${typeof value}: ${typeof value === 'string' ? value : ''})`, async () => {
    let reads = 0, calls = 0;
    await assert.rejects(acquireCurrentProviderPoint(25, -90, assessment, async () => { calls++; return payload(); },
      {mode:'TIME', get time() { return ++reads === 1 ? value : timestamp; }}), TypeError);
    assert.equal(calls, 0);
    assert.equal(reads, 1);
  });
}

for (const mode of ['INVALID', null, undefined, new String('TIME')]) test('invalid first mode cannot recover on a later read', async () => {
  let modes = 0, times = 0, calls = 0;
  await assert.rejects(acquireCurrentProviderPoint(25, -90, assessment, async () => { calls++; return payload(); },
    {get mode() { return ++modes === 1 ? mode : 'TIME'; }, get time() { times++; return timestamp; }}), TypeError);
  assert.deepEqual([modes, times, calls], [1, 0, 0]);
});

for (const field of ['mode', 'time']) test(`throwing first ${field} accessor propagates without transport`, async () => {
  const error = new Error('selector access failed');
  const selector = {mode:'TIME', time:timestamp};
  Object.defineProperty(selector, field, {enumerable:true, get() { throw error; }});
  let calls = 0;
  await assert.rejects(acquireCurrentProviderPoint(25, -90, assessment, async () => { calls++; }, selector), e => e === error);
  assert.equal(calls, 0);
});

test('proxy values are retained before shape traps mutate the source', async () => {
  const target = {mode:'TIME', time:timestamp};
  const reads = [];
  const selector = new Proxy(target, {
    get(object, key) { reads.push(key); return object[key]; },
    ownKeys(object) { object.mode = 'LATEST'; object.time = 'last'; return Reflect.ownKeys(object); }
  });
  await transmitted(selector, timestamp);
  assert.deepEqual(reads, ['mode', 'time']);
  assert.equal(target.time, 'last');
});

for (const trap of ['get', 'ownKeys', 'getOwnPropertyDescriptor']) test(`throwing proxy ${trap} fails without transport`, async () => {
  const error = new Error(trap);
  const selector = new Proxy({mode:'TIME', time:timestamp}, {[trap]() { throw error; }});
  let calls = 0;
  await assert.rejects(acquireCurrentProviderPoint(25, -90, assessment, async () => { calls++; }, selector), e => e === error);
  assert.equal(calls, 0);
});

test('later caller mutation cannot alter transmitted URL or response metadata', async () => {
  const selector = {mode:'TIME', time:timestamp};
  let release, url;
  const pending = acquireCurrentProviderPoint(25, -90, assessment, argument => {
    url = argument;
    return new Promise(resolve => { release = resolve; });
  }, selector);
  selector.mode = 'LATEST'; selector.time = 'last';
  assert.equal(decoded(url), query(timestamp));
  release(payload());
  const result = await pending;
  assert.equal(decoded(url), query(timestamp));
  assert.equal(result.observedAt, timestamp);
  assert.equal(result.source.availability, 'available');
  assert.equal(Object.isFrozen(selector), false);
});

for (const time of ['2026-10-01T00:00:00Z', timestamp, '2026-10-01T00:00:00.123Z']) test('ordinary strict TIME preserved: '+time, async () => {
  const selector = Object.freeze({mode:'TIME', time});
  await transmitted(selector, time);
  assert.deepEqual(selector, {mode:'TIME', time});
});

test('ordinary frozen LATEST and default LATEST preserve last without reading time', async () => {
  await transmitted(Object.freeze({mode:'LATEST'}), 'last');
  await transmitted(undefined, 'last');
  let timeReads = 0;
  const selector = {mode:'LATEST'};
  Object.defineProperty(selector, 'time', {get() { timeReads++; throw Error('not required'); }});
  await transmitted(selector, 'last');
  assert.equal(timeReads, 0);
});
