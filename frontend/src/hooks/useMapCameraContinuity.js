import {useEffect,useLayoutEffect,useRef} from 'react';
import {validateCamera} from '../utils/captainContinuity.js';

// Camera UI only. No field lifecycle, source, contour or scientific changes.
export function useMapCameraContinuity({mapRef,camera,onCameraChange,selectedIdentity,restoredSelectionId}) {
  const initial = useRef({camera,selection:restoredSelectionId,restored:false});
  const callback = useRef(onCameraChange);
  useLayoutEffect(()=>{callback.current=onCameraChange;},[onCameraChange]);
  const enabled = typeof onCameraChange === 'function';
  useEffect(()=>{
    const map=mapRef.current;if(!map || !callback.current)return;
    const saved=initial.current.camera;
    if(saved && validateCamera(saved)) {map.jumpTo(saved);initial.current.restored=true;}
    const capture=()=>{
      if(mapRef.current!==map)return;
      const center=map.getCenter();
      const value={center:[((center.lng+180)%360+360)%360-180,center.lat],zoom:map.getZoom(),bearing:map.getBearing()};
      if(validateCamera(value))callback.current?.(value);
    };
    map.on('moveend',capture);
    window.addEventListener('pagehide',capture);
    document.addEventListener('visibilitychange',capture);
    return()=>{map.off('moveend',capture);window.removeEventListener('pagehide',capture);document.removeEventListener('visibilitychange',capture);};
  },[mapRef,enabled]);
  useEffect(()=>{
    const pending=initial.current;
    // A governed selection may resolve after the map mounts. Restore its saved
    // camera once, then explicit selections retain their ordinary recentering.
    if(callback.current && pending.restored && pending.selection && selectedIdentity===pending.selection){
      mapRef.current?.jumpTo(pending.camera);pending.selection=null;
    }
  },[mapRef,selectedIdentity]);
}
