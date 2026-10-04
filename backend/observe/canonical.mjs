import {createHash} from 'node:crypto';

export function check(condition, code = 'invalid-contract') {
  if (!condition) throw new TypeError(code);
}

// Accept data only: no getters, custom prototypes, sparse arrays or lossy JSON values.
export function data(value) {
  const active = new Set();
  let count = 0;
  function visit(v, depth) {
    check(++count <= 500000 && depth <= 32, 'contract-size');
    if (v === null || typeof v === 'boolean') return v;
    if (typeof v === 'string') {
      check(v.length <= 4096 && !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(v), 'invalid-string');
      return v;
    }
    if (typeof v === 'number') {
      check(Number.isFinite(v) && !Object.is(v, -0) && Math.abs(v) <= Number.MAX_SAFE_INTEGER, 'ambiguous-number');
      return v;
    }
    check(v && typeof v === 'object' && !active.has(v), 'data-only');
    const array = Array.isArray(v);
    check(Object.getPrototypeOf(v) === (array ? Array.prototype : Object.prototype), 'plain-data-only');
    active.add(v);
    const names = Reflect.ownKeys(v);
    for (const name of names) {
      const d = Object.getOwnPropertyDescriptor(v, name);
      check(typeof name === 'string' && Object.hasOwn(d, 'value') && (d.enumerable || array && name === 'length'), 'data-property-only');
    }
    let result;
    if (array) {
      check(v.length <= 100000 && names.length === v.length + 1, 'dense-array-only');
      result = Array.from({length:v.length}, (_, i) => {
        check(Object.hasOwn(v, String(i)), 'dense-array-only');
        return visit(v[i], depth + 1);
      });
    } else {
      result = {};
      for (const name of names.sort()) {
        check(!['__proto__', 'constructor', 'prototype'].includes(name), 'invalid-key');
        result[name] = visit(v[name], depth + 1);
      }
    }
    active.delete(v);
    return result;
  }
  return visit(value, 0);
}

export const canonical = value => JSON.stringify(data(value));
export const digest = (domain, value) => createHash('sha256').update(domain + '\0' + canonical(value)).digest('hex');
export function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
export const same = (a, b) => canonical(a) === canonical(b);
export function keys(v, names) {
  check(v && !Array.isArray(v) && typeof v === 'object' && Object.keys(v).length === names.length && names.every(k => Object.hasOwn(v, k)), 'exact-fields');
}
export function integer(v, min = 0, max = Number.MAX_SAFE_INTEGER) {
  check(Number.isSafeInteger(v) && !Object.is(v, -0) && v >= min && v <= max, 'integer-range');
  return v;
}
export function id(v) {
  check(typeof v === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,95}$/.test(v), 'identifier');
  return v;
}
export function sha(v) { check(typeof v === 'string' && /^[a-f0-9]{64}$/.test(v), 'sha256'); return v; }
export function utc(v) {
  check(typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v), 'canonical-utc');
  const n = Date.parse(v);
  check(Number.isFinite(n) && new Date(n).toISOString() === v, 'canonical-utc');
  return n;
}
export const iso = n => { const result = new Date(n).toISOString(); utc(result); return result; };
export function reference(v) {
  keys(v, ['id', 'version', 'sha256']); id(v.id); id(v.version); sha(v.sha256);
}
export function coordinates(v) {
  keys(v, ['latitude', 'longitude']);
  for (const [key, limit] of [['latitude', 90], ['longitude', 180]]) {
    const n = v[key], micro = Math.round(n * 1e6);
    check(typeof n === 'number' && Number.isFinite(n) && !Object.is(n, -0) && n === micro / 1e6 && n >= -limit && n < limit, 'canonical-coordinate');
  }
  check(Math.abs(v.latitude) < 90, 'polar-cell-unsupported');
}

export function seal(domain, body) { return freeze({...body, digest:digest(domain, body)}); }
export function unseal(domain, input) {
  const p = data(input); check(p && typeof p === 'object' && !Array.isArray(p), 'sealed-object');
  const {digest:expected, ...body} = p; sha(expected); check(digest(domain, body) === expected, 'digest-mismatch');
  return body;
}
