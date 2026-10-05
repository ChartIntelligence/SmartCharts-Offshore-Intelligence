import {types} from 'node:util';
import {createHash} from 'node:crypto';
import {check, freeze} from './canonical.mjs';

// Port admission snapshots descriptors, never validates one accessor value and uses another.
// Proxy objects are not an authority-bearing input surface in this isolated composition.
export function snapshot(input) {
  const active = new Set(); let count = 0;
  function visit(v, depth) {
    check(++count <= 500000 && depth <= 32, 'port-data-size');
    if (v === null || ['string','number','boolean'].includes(typeof v)) return v;
    check(v && typeof v === 'object' && !types.isProxy(v) && !active.has(v), 'port-data-only');
    const array = Array.isArray(v);
    check(Object.getPrototypeOf(v) === (array ? Array.prototype : Object.prototype), 'port-plain-data');
    active.add(v);
    const descriptors = Object.getOwnPropertyDescriptors(v), names = Reflect.ownKeys(descriptors);
    for (const key of names) check(typeof key === 'string' && Object.hasOwn(descriptors[key], 'value') &&
      (descriptors[key].enumerable || array && key === 'length') && !['__proto__','constructor','prototype'].includes(key), 'port-data-property');
    const result = array ? [] : {};
    if (array) check(names.length === descriptors.length.value + 1, 'port-dense-array');
    for (const key of names) if (!(array && key === 'length')) result[key] = visit(descriptors[key].value, depth + 1);
    active.delete(v); return result;
  }
  return freeze(visit(input, 0));
}
export const bytesHash = bytes => createHash('sha256').update(bytes).digest('hex');
export function responseBytes(value, limit) {
  check(!types.isProxy(value) && value instanceof Uint8Array && [Uint8Array.prototype,Buffer.prototype].includes(Object.getPrototypeOf(value)), 'response-byte-container');
  const intrinsic = Object.getPrototypeOf(Uint8Array.prototype);
  const length = Object.getOwnPropertyDescriptor(intrinsic,'byteLength').get.call(value);
  const buffer = Object.getOwnPropertyDescriptor(intrinsic,'buffer').get.call(value);
  check(!types.isSharedArrayBuffer(buffer), 'response-shared-memory');
  check(length > 0 && length <= limit, 'response-size');
  const copy = Buffer.alloc(length); Uint8Array.prototype.set.call(copy,value); return copy;
}
export const responseReference = bytes => Object.freeze({id:'current-response-' + bytesHash(bytes), version:'retained-response-v1', sha256:bytesHash(bytes)});
