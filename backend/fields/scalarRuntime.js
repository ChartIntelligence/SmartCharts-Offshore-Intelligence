import {deliverOceanScalarFieldV1} from '../../shared/oceanScalarFieldDelivery.mjs';

export const SCALAR_RUNTIME_CONTRACT = 'pelora-scalar-field-runtime-v1';
export const SCALAR_RUNTIME_ADAPTER = 'pelora-scalar-field-runtime-adapter-v1';
function freeze(v) {
  if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); }
  return v;
}
export function scalarRuntimeResult(status, reason, field = null) {
  const codes = {DELIVERED: 200, DELIVERED_PARTIAL: 200, INVALID_REQUEST: 400, INVALID_BOUNDS: 400,
    UNSUPPORTED_SCALAR_COMPONENT: 400, UNSUPPORTED_SCALAR_LAYER: 400, UNKNOWN_EVIDENCE_SELECTOR: 400,
    SCALAR_RUNTIME_DISABLED: 404, ARCHIVE_NOT_FOUND: 404, SOURCE_UNAVAILABLE: 503,
    SOURCE_INTEGRITY_FAILURE: 502, NO_DELIVERED_CELLS: 422, DELIVERY_LIMIT_EXCEEDED: 413,
    SOURCE_LIMIT_EXCEEDED: 413, HTTP_PAYLOAD_LIMIT_EXCEEDED: 413, DELIVERY_CANCELLED: 499,
    UNSUPPORTED_GRID: 422, DELIVERY_TRANSFORMATION_FAILURE: 500};
  return freeze({statusCode: codes[status] ?? 500, body: {contractVersion: SCALAR_RUNTIME_CONTRACT,
    adapterVersion: SCALAR_RUNTIME_ADAPTER, synthetic: true, evidenceNotice: 'SYNTHETIC TEST EVIDENCE', status, reason, field}});
}
const integer = n => Number.isSafeInteger(n) && n > 0;
const exactKeys = (o, keys) => o && Object.getPrototypeOf(o) === Object.prototype &&
  Object.keys(o).length === keys.length && keys.every(k => Object.hasOwn(o, k));

/** Explicit test-only dependency injection. No default registry, provider, clock or storage.
 * Limits are test budgets, not production/mobile policy. Port must itself bound I/O.
 */
export function createSyntheticScalarRuntimeV1({port, selection, limits, generatedAt}) {
  if (typeof port?.readExact !== 'function' ||
      !exactKeys(selection, ['selector', 'layer', 'variableId', 'archiveId', 'receiptDigest']) ||
      !/^synthetic-[a-z0-9-]+$/.test(selection.selector) || !/^synthetic-[a-z0-9-]+$/.test(selection.layer) ||
      typeof selection.variableId !== 'string' || !selection.variableId ||
      !/^opf-[a-f0-9]{64}$/.test(selection.archiveId) || !/^[a-f0-9]{64}$/.test(selection.receiptDigest) ||
      !exactKeys(limits, ['maxSourceBytes', 'maxSourceCells', 'maxCells', 'maxPayloadBytes', 'maxHttpBytes']) ||
      !Object.values(limits).every(integer) || limits.maxHttpBytes < 1024 ||
      typeof generatedAt !== 'string' || !Number.isFinite(Date.parse(generatedAt))) {
    throw new TypeError('Invalid synthetic scalar runtime configuration');
  }
  const selected = freeze({...selection}), budgets = freeze({...limits});
  return async (params, signal = null) => {
    let request;
    try {
      if (!(params instanceof URLSearchParams) || params.toString().length > 1024) throw Error();
      const allowed = ['mode', 'layer', 'evidence', 'component', 'bbox', 'strideX', 'strideY'];
      if ([...params.keys()].some(k => !allowed.includes(k)) || allowed.some(k => params.getAll(k).length !== 1)) throw Error();
      if (params.get('mode') !== 'scalar') throw Error();
      if (params.get('layer') !== selected.layer) return scalarRuntimeResult('UNSUPPORTED_SCALAR_LAYER', 'unregistered-layer');
      if (params.get('evidence') !== selected.selector) return scalarRuntimeResult('UNKNOWN_EVIDENCE_SELECTOR', 'exact-test-selector-required');
      if (params.get('component') !== selected.variableId) return scalarRuntimeResult('UNSUPPORTED_SCALAR_COMPONENT', 'unregistered-component');
      // Parse only explicit decimal URL coordinates, never environmental values.
      const parts = params.get('bbox').split(',');
      if (parts.length !== 4 || parts.some(p => !/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(p))) {
        return scalarRuntimeResult('INVALID_BOUNDS', 'decimal-geographic-bounds-required');
      }
      const stride = {};
      for (const [axis, key] of [['x', 'strideX'], ['y', 'strideY']]) {
        if (!/^[1-9]\d*$/.test(params.get(key))) throw Error();
        stride[axis] = Number(params.get(key)); if (!integer(stride[axis])) throw Error();
      }
      request = {source: {archiveId: selected.archiveId, receiptDigest: selected.receiptDigest},
        variableId: selected.variableId, bounds: parts.map(Number), stride,
        limits: {maxCells: budgets.maxCells, maxPayloadBytes: budgets.maxPayloadBytes}, generatedAt};
    } catch { return scalarRuntimeResult('INVALID_REQUEST', 'invalid-query'); }
    let sourceLimit = false;
    // This caps processing after the port returns, NOT network bytes or its allocation.
    const boundedPort = {readExact: async id => {
      const result = await port.readExact(id);
      if (result?.status === 'found' && typeof result.record?.frameJson === 'string') {
        if (Buffer.byteLength(result.record.frameJson, 'utf8') > budgets.maxSourceBytes) {
          sourceLimit = true; throw Error('source-limit');
        }
        // Size inspection only. Scientific/structural validation remains in the archive reader.
        try {
          const payload = JSON.parse(result.record.frameJson)?.payload;
          if (Array.isArray(payload?.components) && payload.components.some(c => Array.isArray(c?.values) && c.values.length > budgets.maxSourceCells)) {
            sourceLimit = true; throw Error('source-limit');
          }
        } catch { if (sourceLimit) throw Error('source-limit'); }
      }
      return result;
    }};
    const delivery = await deliverOceanScalarFieldV1(boundedPort, request, signal);
    if (delivery.status === 'DELIVERY_CANCELLED') return scalarRuntimeResult(delivery.status, delivery.reason);
    if (sourceLimit) return scalarRuntimeResult('SOURCE_LIMIT_EXCEEDED', 'source-processing-budget');
    let status = delivery.status;
    if (status === 'SOURCE_UNAVAILABLE' && delivery.reason === 'ARCHIVE_NOT_FOUND') status = 'ARCHIVE_NOT_FOUND';
    // An injected test runtime must not label a real-provider frame as synthetic evidence.
    if (delivery.field && (delivery.field.product.providerId !== 'synthetic' ||
        !delivery.field.product.productId.startsWith('synthetic-') ||
        !delivery.field.product.datasetId?.startsWith('synthetic-'))) {
      return scalarRuntimeResult('SOURCE_INTEGRITY_FAILURE', 'synthetic-source-required');
    }
    const output = scalarRuntimeResult(status, delivery.reason, delivery.field);
    if (Buffer.byteLength(JSON.stringify(output.body), 'utf8') > budgets.maxHttpBytes) {
      return scalarRuntimeResult('HTTP_PAYLOAD_LIMIT_EXCEEDED', 'json-response-body-budget');
    }
    return output;
  };
}
