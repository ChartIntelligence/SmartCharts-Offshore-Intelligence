// Presentation only. Never a scientific/coverage API. Reuses checkpointed pixel policy.
import {POLICY, rasterTile, tileIdentity} from '../scalar-tiles/presentationTiles.mjs';
export const PILOT_POLICY = Object.freeze({...POLICY, renderer: 'pelora-noaa-pilot-scalar-xyz-v1'});
export function pilotTile(field, z, x, y) {
  if (field.product.providerId !== 'NOAA-NESDIS-OSPO' || field.product.evidenceClass !== 'ANALYSIS' ||
      field.scalar.variableId !== 'analysed_sst' || field.scalar.unit !== 'K') throw Error('Unsupported pilot scalar');
  const tile = rasterTile(field, z, x, y);
  return {...tile, id: tileIdentity(field.deliveryId, z, x, y, PILOT_POLICY)};
}
