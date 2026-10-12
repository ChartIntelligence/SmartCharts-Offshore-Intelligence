import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {continuityOwner, readContinuity, writeContinuity, clearContinuityRevision} from '../utils/captainContinuity.js';
const deviceStorage = () => {try {return window.localStorage;} catch {return null;}};

export function useCaptainContinuity(user, kind, initial, validate) {
  const owner = continuityOwner(user);
  const load = () => {
    const restored = readContinuity(deviceStorage(),owner,kind,validate);
    return {owner, value:restored.value ?? initial(), revision:restored.revision, error:restored.error};
  };
  const [state, setState] = useState(load);
  // Guarded owner change rerenders before children can commit former-owner data.
  if (state.owner !== owner) setState(load());
  const live = useRef(state); const active = useRef(true);
  useLayoutEffect(()=>{live.current=state;},[state]);
  useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
  const setValue = useCallback(update => {
    if (!owner || !active.current || live.current.owner !== owner) return;
    const value = typeof update === 'function' ? update(live.current.value) : update;
    const saved = writeContinuity(deviceStorage(),owner,kind,value);
    live.current = {owner,value,...saved,revision:saved.revision ?? live.current.revision}; setState(live.current);
  },[owner,kind]);
  const capture = () => ({...live.current});
  const isActive = snapshot => active.current && live.current.owner === snapshot.owner;
  const isCurrent = snapshot => isActive(snapshot) && live.current.value === snapshot.value;
  const complete = snapshot => {
    // A late completion must not delete a newer edit or a newer mounted draft.
    if (!isCurrent(snapshot)) return false;
    const cleared = snapshot.owner && clearContinuityRevision(deviceStorage(),snapshot.owner,kind,snapshot.revision);
    if (!cleared && snapshot.revision) return false;
    live.current = {owner,value:initial(),revision:null,error:null};setState(live.current);return true;
  };
  return {value:state.value,setValue,error:state.error,capture,isActive,isCurrent,complete};
}
