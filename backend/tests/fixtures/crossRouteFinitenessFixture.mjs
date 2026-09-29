import assert from 'node:assert/strict';
import {getCurrentSpatialStructure, buildCurrentVectorProjectionAnalysis} from '../../server.js';
import {assessment} from './sourceNormalizationFixture.mjs';

// Faithful internal default boundary: transport -> point parser/cache -> spatial assembly
// -> its production projection consumer. Never inject convergence or Ocean Physics objects.
let clock = Date.parse('2600-01-01');
export async function currentProjection(t, u, v) {
  const requests = [];
  const time = t.mock.method(Date, 'now', () => clock);
  clock += 86400000;
  const fetch = t.mock.method(globalThis, 'fetch', async input => {
    const url = new URL(input);
    assert.equal(url.hostname, 'coastwatch.noaa.gov');
    requests.push(url.pathname);
    const wire = JSON.stringify({table:{columnNames:['time','latitude','longitude','u_current','v_current'],
      rows:[['2026-09-24T00:00:00Z',25,-90,u,v]]}});
    return {ok:true,json:async()=>JSON.parse(wire)};
  });
  try {
    const spatial = await getCurrentSpatialStructure(25, -90, assessment);
    const projection = buildCurrentVectorProjectionAnalysis(spatial);
    return {requests, spatial, projection};
  } finally {fetch.mock.restore(); time.mock.restore();}
}
export function nonfinitePaths(value, path = '') {
  if (typeof value === 'number') return Number.isFinite(value) ? [] : [{path,value:String(value)}];
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key,item]) => nonfinitePaths(item, `${path}/${key}`));
}
