import {useEffect} from 'react';
import {createViewportFieldRequests} from '../utils/viewportFieldRequests.js';
import {enforcePeloraLayerOrder} from '../utils/peloraMapStyle.js';
import {parseSyntheticSstResponse, sstGridGeoJson, sstLayer, SST_REVIEW_LAYER, SST_REVIEW_SOURCE} from '../utils/syntheticSstDisplay.js';

export function useSyntheticSstReview({mapRef, review}) {
  useEffect(() => {
    const map = mapRef.current;
    // Only the separate review entry point supplies this trusted capability.
    if (!map || !review || review.enabled !== true ||
        typeof Object.getOwnPropertyDescriptor(review, 'request')?.value !== 'function') return;
    review.onMap?.(map);
    let disposed = false, grid = null, appliedGridKey = null;
    const sync = () => {
      if (disposed || mapRef.current !== map || !map.isStyleLoaded()) return;
      if (grid) {
        const source = map.getSource(SST_REVIEW_SOURCE);
        const key = JSON.stringify(grid);
        if (source) { if (key !== appliedGridKey) source.setData(grid); }
        else map.addSource(SST_REVIEW_SOURCE, {type: 'geojson', data: grid});
        appliedGridKey = key;
        if (!map.getLayer(SST_REVIEW_LAYER)) map.addLayer(sstLayer());
        enforcePeloraLayerOrder(map);
      }
      if (map.getLayer(SST_REVIEW_LAYER)) map.setLayoutProperty(SST_REVIEW_LAYER, 'visibility', grid ? 'visible' : 'none');
    };
    const requests = createViewportFieldRequests({
      request: async (_layer, viewport, signal) => parseSyntheticSstResponse(await review.request(viewport.bbox, signal)),
      onState: (_layer, state) => {
        if (disposed) return;
        grid = state.field ? sstGridGeoJson(state.field) : null;
        review.onState?.({...state, status: state.status ?? (state.field ? 'DELIVERED_PARTIAL' : 'unavailable'), displayArea: !!grid});
        map.off('idle', sync); if (map.isStyleLoaded()) sync(); else map.once('idle', sync);
      },
    });
    const acquire = () => {
      const b = map.getBounds();
      const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
      requests.schedule({bbox}, ['sst']);
    };
    const moving = () => { requests.cancel(); grid = null; sync(); review.onState?.({status: 'moving', field: null}); };
    const loaded = () => { sync(); acquire(); };
    map.on('movestart', moving); map.on('moveend', acquire); map.on('load', loaded); map.on('style.load', loaded);
    if (map.isStyleLoaded()) acquire();
    return () => {
      disposed = true; requests.dispose(); map.off('movestart', moving); map.off('moveend', acquire);
      map.off('load', loaded); map.off('style.load', loaded); map.off('idle', sync);
      if (mapRef.current === map) {
        if (map.getLayer(SST_REVIEW_LAYER)) map.removeLayer(SST_REVIEW_LAYER);
        if (map.getSource(SST_REVIEW_SOURCE)) map.removeSource(SST_REVIEW_SOURCE);
      }
    };
  }, [mapRef, review]);
}
