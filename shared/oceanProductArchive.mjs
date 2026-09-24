import {createHash} from 'node:crypto';
import {normalizeOceanProductFrameV1, serializeOceanProductFrameV1} from './oceanProductFrame.mjs';

export const OCEAN_PRODUCT_ARCHIVE_CONTRACT = 'pelora-ocean-product-archive-v1';
export const OCEAN_PRODUCT_ARCHIVE_WRITER = 'pelora-ocean-product-archive-writer-v1';
const representation = 'pelora-ocean-product-frame-canonical-json-v1';
const fail = () => { throw new TypeError('Invalid ocean archive input'); };
const hash = value => createHash('sha256').update(value, 'utf8').digest('hex');
const canonical = value => JSON.stringify(sort(value));
function sort(value) {
  return Array.isArray(value) ? value.map(sort) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, sort(value[key])])) : value;
}
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
// Serialization boundary only; scientific validation is delegated to Task 10B.
function copy(value, active = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fail();
  if (!value || typeof value !== 'object' || active.has(value)) fail();
  active.add(value);
  const array = Array.isArray(value);
  if (!array && Object.getPrototypeOf(value) !== Object.prototype) fail();
  const keys = Reflect.ownKeys(value);
  if (array && (keys.length !== value.length + 1 || !keys.includes('length'))) fail();
  const result = array ? [] : {};
  for (const key of keys) {
    if (array && key === 'length') continue;
    const d = Object.getOwnPropertyDescriptor(value, key);
    if (typeof key !== 'string' || !d.enumerable || !Object.hasOwn(d, 'value') ||
        (array && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length))) fail();
    Object.defineProperty(result, key, {value: copy(d.value, active), enumerable: true, writable: true, configurable: true});
  }
  active.delete(value);
  return result;
}
function keys(value, expected) {
  if (!value || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype ||
      Object.keys(value).length !== expected.length || expected.some(key => !Object.hasOwn(value, key))) fail();
}
// Opaque catalog references, deliberately not URLs, filesystem paths or signed locators.
function ref(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/.test(value)) fail();
  return value;
}
function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) fail();
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== (value.includes('.') ? value : value.replace('Z', '.000Z'))) fail();
  return date.toISOString();
}
function normalizeIntent(input) {
  const value = copy(input);
  keys(value, ['writeId', 'archivedAt', 'storageReference', 'sourceRevision', 'rawEvidence']);
  ref(value.writeId); ref(value.storageReference); value.archivedAt = timestamp(value.archivedAt);
  if (value.sourceRevision !== null) ref(value.sourceRevision);
  if (!Array.isArray(value.rawEvidence)) fail();
  value.rawEvidence.forEach(raw => {
    keys(raw, ['reference', 'sha256', 'availability']); ref(raw.reference);
    if (!/^[a-f0-9]{64}$/.test(raw.sha256) || typeof raw.sha256 !== 'string' ||
        !['retained', 'reference-only'].includes(raw.availability)) fail();
  });
  if (new Set(value.rawEvidence.map(raw => raw.reference)).size !== value.rawEvidence.length) fail();
  return value;
}
export function oceanArchiveIdentityV1(input) {
  const frame = normalizeOceanProductFrameV1(copy(input));
  const {frameId, ...content} = frame;
  return freeze({frameId, archiveId: `opf-${hash(frameId)}`,
    contentDigest: hash(canonical(content)), frameDigest: hash(serializeOceanProductFrameV1(frame))});
}

/** No I/O and no claim of persistence. Caller supplies every write-time value. */
export function planOceanArchiveWriteV1(input, intent) {
  const frame = normalizeOceanProductFrameV1(copy(input));
  return freeze({status: 'VALIDATED_NOT_ARCHIVED', identity: oceanArchiveIdentityV1(frame),
    frame, intent: normalizeIntent(intent)});
}
function recordFor(frame, intent) {
  const identity = oceanArchiveIdentityV1(frame);
  const frameJson = serializeOceanProductFrameV1(frame);
  const receipt = {contractVersion: OCEAN_PRODUCT_ARCHIVE_CONTRACT, ...identity,
    status: 'ARCHIVED', writerVersion: OCEAN_PRODUCT_ARCHIVE_WRITER,
    payloadRepresentation: representation, byteLength: Buffer.byteLength(frameJson, 'utf8'),
    digestAlgorithm: 'SHA-256', product: frame.product, temporal: frame.temporal,
    provenance: frame.provenance, lineage: frame.lineage, ...intent};
  return freeze({receipt: {...receipt, receiptDigest: hash(canonical(receipt))}, frameJson});
}
function validateRecord(input, archiveId, frameId) {
  const record = copy(input);
  keys(record, ['receipt', 'frameJson']);
  if (typeof record.frameJson !== 'string') fail();
  const frame = normalizeOceanProductFrameV1(JSON.parse(record.frameJson));
  const receipt = record.receipt;
  if (!receipt || receipt.archiveId !== archiveId || (frameId !== undefined && frame.frameId !== frameId)) fail();
  const intent = normalizeIntent({writeId: receipt.writeId, archivedAt: receipt.archivedAt,
    storageReference: receipt.storageReference, sourceRevision: receipt.sourceRevision, rawEvidence: receipt.rawEvidence});
  const expected = recordFor(frame, intent);
  if (canonical(expected) !== canonical(record)) fail();
  return freeze({frame, receipt: expected.receipt});
}
const result = (status, reason, extra = {}) => freeze({status, reason, ...extra});

/** Port: createIfAbsent(archiveId, immutableRecord) -> {outcome, durable, record}.
 * The port atomically retains BOTH receipt and frame bytes, returning the winner.
 * Exceptions are sanitized; neither payload nor provider errors are echoed.
 */
export async function writeOceanArchiveV1(port, input, intent) {
  const plan = planOceanArchiveWriteV1(input, intent);
  if (typeof port?.createIfAbsent !== 'function') fail();
  let acknowledgement;
  try { acknowledgement = await port.createIfAbsent(plan.identity.archiveId, recordFor(plan.frame, plan.intent)); }
  catch { return result('ARCHIVE_WRITE_FAILED', 'storage-unavailable-or-outcome-unknown'); }
  let accepted;
  try {
    acknowledgement = copy(acknowledgement);
    keys(acknowledgement, ['outcome', 'durable', 'record']);
    if (!['created', 'exists'].includes(acknowledgement.outcome) || typeof acknowledgement.durable !== 'boolean') fail();
    accepted = validateRecord(acknowledgement.record, plan.identity.archiveId, plan.frame.frameId);
  } catch { return result('ARCHIVE_INTEGRITY_FAILURE', 'invalid-write-acknowledgement'); }
  if (accepted.receipt.frameDigest !== plan.identity.frameDigest ||
      accepted.receipt.sourceRevision !== plan.intent.sourceRevision ||
      canonical(accepted.receipt.rawEvidence) !== canonical(plan.intent.rawEvidence)) {
    return result('ARCHIVE_COLLISION', 'frame-identity-already-bound');
  }
  // A new conditional create must acknowledge the exact submitted record.
  if (acknowledgement.outcome === 'created' &&
      canonical(acknowledgement.record) !== canonical(recordFor(plan.frame, plan.intent))) {
    return result('ARCHIVE_INTEGRITY_FAILURE', 'created-record-differs');
  }
  if (!acknowledgement.durable) return result('ARCHIVE_WRITE_PENDING', 'durability-not-established');
  return result('ARCHIVED', null, {...accepted, duplicate: acknowledgement.outcome === 'exists'});
}

/** Exact frame or archive key only. No nearest/latest/fallback selection. */
export async function readOceanArchiveV1(port, lookup) {
  const value = copy(lookup);
  keys(value, ['frameId', 'archiveId']);
  if ((value.frameId === null) === (value.archiveId === null)) fail();
  let archiveId = value.archiveId;
  if (value.frameId !== null) {
    if (typeof value.frameId !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._:/+-]*$/.test(value.frameId)) fail();
    archiveId = `opf-${hash(value.frameId)}`;
  } else if (typeof archiveId !== 'string' || !/^opf-[a-f0-9]{64}$/.test(archiveId)) fail();
  if (typeof port?.readExact !== 'function') fail();
  let response;
  try { response = await port.readExact(archiveId); }
  catch { return result('ARCHIVE_READ_UNAVAILABLE', 'storage-unavailable'); }
  try {
    response = copy(response);
    if (response?.status === 'not-found') {
      keys(response, ['status']); return result('ARCHIVE_NOT_FOUND', 'exact-evidence-absent');
    }
    keys(response, ['status', 'durable', 'record']);
    if (response.status !== 'found' || typeof response.durable !== 'boolean') fail();
    const accepted = validateRecord(response.record, archiveId, value.frameId ?? undefined);
    if (!response.durable) return result('ARCHIVE_READ_UNAVAILABLE', 'durability-not-established');
    return result('ARCHIVED', null, accepted);
  } catch { return result('ARCHIVE_INTEGRITY_FAILURE', 'stored-evidence-invalid'); }
}
