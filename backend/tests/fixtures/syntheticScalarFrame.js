import {OCEAN_PRODUCT_FRAME_CONTRACT} from '../../../shared/oceanProductFrame.mjs';
// SYNTHETIC TEST EVIDENCE only; never imported by the production server.
export function syntheticScalarFrame(frameId = 'synthetic-frame-a') {
  return {contractVersion: OCEAN_PRODUCT_FRAME_CONTRACT, frameId,
    product: {productId: 'synthetic-analysis', providerId: 'synthetic', datasetId: 'synthetic-nrt',
      productVersion: '1', family: 'temperature', processingLevel: null, evidenceClass: 'ANALYSIS'},
    temporal: {support: {kind: 'interval', start: '2026-09-01T00:00:00Z', end: '2026-09-02T00:00:00Z'}, observationTime: null,
      forecastIssuedAt: null, providerPublishedAt: null, acquiredAt: '2026-09-01T00:00:00Z', processedAt: null},
    spatial: {crs: 'EPSG:4326', horizontalDatum: 'WGS84', verticalDatum: null, coordinateOrder: 'x,y',
      bounds: [-90, 25, -86, 27], boundsMeaning: 'payload-extent', nativeResolution: {x: 1, y: 1, unit: 'degree'},
      deliveredResolution: {x: 2, y: 2, unit: 'degree'}, resamplingMethod: null, coverageCompleteness: 'partial',
      coverageBasis: 'synthetic', landMask: 'explicit-cell-reasons'},
    payload: {kind: 'scalar', layout: 'rectilinear-grid', coordinates: null, axes: {x: [-90, -88, -86], y: [25, 27]},
      vectorBasis: null, components: [{variableId: 'temperature', unit: 'K', axis: null,
        positiveDirection: null, values: [0, 280, null, 290, null, 292], missing: [null, null, 'provider-no-data', null, 'land', null]}]},
    quality: {providerScheme: 'synthetic-flags', flags: [{flagId: 'ice', value: false}], uncertainty: null},
    provenance: {sources: [{providerId: 'synthetic', datasetId: 'synthetic-nrt', recordId: 'source-1',
      locatorId: 'source-ref-1', checksum: null}], adapterId: 'synthetic-normalizer', adapterVersion: '1', steps: []},
    lineage: {parentFrameIds: ['synthetic-parent'], sourceRecordIds: ['source-1'], completeness: 'partial'}};
}
