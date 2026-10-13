import {useCallback,useEffect,useLayoutEffect,useRef} from 'react';
import {createShellNavigation} from '../utils/shellNavigation.js';
export function useShellNavigation(state,apply){
 const live=useRef({state,apply}),controller=useRef(null),epoch=useRef(null);
 useLayoutEffect(()=>{live.current={state,apply};},[state,apply]);
 useEffect(()=>{
  if(!epoch.current)epoch.current=globalThis.crypto?.randomUUID?.()??String(Math.random());
  controller.current=createShellNavigation(window,epoch.current,()=>live.current.state,next=>live.current.apply(next));
  return()=>{controller.current?.dispose();controller.current=null;};
 },[]);
 useEffect(()=>{controller.current?.sync();},[state.tab,state.report,state.mission]);
 const navigate=useCallback(tab=>{if(controller.current)controller.current.navigate(tab);else live.current.apply({...live.current.state,tab});},[]);
 const report=useCallback(open=>{if(controller.current)controller.current.report(open);else live.current.apply({...live.current.state,report:open});},[]);
 const mission=useCallback(open=>{if(controller.current)controller.current.mission(open);else live.current.apply({...live.current.state,mission:open});},[]);
 return {navigate,report,mission};
}
