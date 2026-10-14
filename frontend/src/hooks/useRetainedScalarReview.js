import {useEffect,useRef} from 'react';
import {createRetainedScalarReview} from '../utils/retainedScalarReviewLayer.js';

// Default-off, historical review only. No application mounting or acquisition.
export function useRetainedScalarReview({mapRef,review=null}){
  const bindingRef=useRef({revision:0,identity:null});
  const enabled=review?.enabled===true,layer=review?.layer??'sst';
  let authority=null;
  if(enabled&&typeof review?.getAuthority==='function'){try{authority=review.getAuthority();}catch{/* denied review capability */}}
  // Copy primitive owner identity and capability inputs, even when the caller
  // mutates an object in place or batches A -> B -> A before passive effects.
  const identity=[mapRef.current,review,enabled,layer,review?.getArtifact,review?.readTile,review?.verifyTile,
    review?.protocolPort,review?.getAuthority,authority?.authorized,authority?.ownerKey,authority?.revision];
  const previous=bindingRef.current.identity;
  if(previous&&identity.some((value,index)=>value!==previous[index]))bindingRef.current.revision++;
  bindingRef.current.identity=identity;
  const revision=bindingRef.current.revision;
  useEffect(()=>{
    if(!enabled){review?.onState?.(Object.freeze({status:'off',field:null,historical:true,reviewOnly:true}));return;}
    if(!mapRef.current)return;
    const map=mapRef.current;
    const controller=createRetainedScalarReview({...review,map,
      isAttached:()=>mapRef.current===map&&bindingRef.current.revision===revision});
    try{review.onController?.(controller);}catch(error){controller.dispose();throw error;}
    return()=>controller.dispose();
  },[mapRef,review,enabled,layer,revision]);
}
