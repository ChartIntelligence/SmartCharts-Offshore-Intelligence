import {useEffect} from "react";
import {resolvePeloraApiUrl} from "../utils/peloraApi.js";
import {observationImages} from "../utils/mapObservationDisplay.js";
import {FIELD_SOURCE,FIELD_LAYER,EMPTY_FIELD,fieldViewport,currentFieldGeoJson,bathymetryImage,
  fieldLayerDefinitions,fieldInsertBefore,validateFieldPresentation} from "../utils/oceanFieldPresentation.js";
import {createViewportFieldRequests} from "../utils/viewportFieldRequests.js";

export function useMapLibreOceanFields({mapRef,bathymetry,currentField,onFieldStatus}) {
  useEffect(()=>{
    const map=mapRef.current;if(!map)return;
    let disposed=false, bathyImage=null,currentData=EMPTY_FIELD;
    const states={};
    const active=[...(bathymetry?["bathymetry"]:[]),...(currentField?["currents"]:[])];
    const publish=(layer,state)=>onFieldStatus(current=>({...current,[layer]:state}));
    const reject=(layer,error)=>{
      const state=states[layer];
      requests.invalidate(layer,state?.contextKey);
      if(layer==="bathymetry")bathyImage=null;else currentData=EMPTY_FIELD;
      states[layer]={contextKey:state?.contextKey,status:"unavailable",field:null,reason:error.message};
      // Hide first; remove only this layer/source if the map operation fails.
      try{if(map.getLayer(FIELD_LAYER[layer]))map.setLayoutProperty(FIELD_LAYER[layer],"visibility","none");}
      catch{try{if(map.getLayer(FIELD_LAYER[layer]))map.removeLayer(FIELD_LAYER[layer]);}catch{/* map teardown */}}
      try{if(map.getSource(FIELD_SOURCE[layer])){
        if(layer==="currents")map.getSource(FIELD_SOURCE[layer]).setData(EMPTY_FIELD);
        else {if(map.getLayer(FIELD_LAYER[layer]))map.removeLayer(FIELD_LAYER[layer]);map.removeSource(FIELD_SOURCE[layer]);}
      }}catch{try{if(map.getLayer(FIELD_LAYER[layer]))map.removeLayer(FIELD_LAYER[layer]);
        if(map.getSource(FIELD_SOURCE[layer]))map.removeSource(FIELD_SOURCE[layer]);}catch{/* map teardown */}}
      publish(layer,states[layer]);
    };
    const sync=()=>{
      if(disposed||mapRef.current!==map)return;
      for(const layer of ["bathymetry","currents"]){
        try{
          const data=layer==="bathymetry"?bathyImage:currentData;
          const visible=layer==="bathymetry"?bathymetry&&data:currentField&&data.features.length>0;
          const source=map.getSource(FIELD_SOURCE[layer]);
          if(layer==="currents"){
            if(!map.hasImage("pelora-field-current-arrow"))map.addImage("pelora-field-current-arrow",observationImages()["pelora-current-arrow"]);
            if(source)source.setData(data);else map.addSource(FIELD_SOURCE[layer],{type:"geojson",data});
          }else if(data){
            if(source)source.updateImage(data);else map.addSource(FIELD_SOURCE[layer],{type:"image",...data});
          }
          const definition=fieldLayerDefinitions().find(d=>d.id===FIELD_LAYER[layer]);
          if(map.getSource(definition.source)&&!map.getLayer(definition.id))map.addLayer(definition,fieldInsertBefore(map));
          if(map.getLayer(definition.id))map.setLayoutProperty(definition.id,"visibility",visible?"visible":"none");
          if(layer==="bathymetry"&&map.getLayer(FIELD_LAYER.bathymetry)&&map.getLayer(FIELD_LAYER.currents))map.moveLayer(FIELD_LAYER.bathymetry,FIELD_LAYER.currents);
          if(states[layer])publish(layer,states[layer]);
        }catch(error){reject(layer,error);}
      }
    };
    const apply=()=>{map.off("idle",sync);if(map.isStyleLoaded())sync();else map.once("idle",sync);};
    const requests=createViewportFieldRequests({
      request:async(layer,viewport,signal)=>{
        const params=new URLSearchParams({layer,bbox:viewport.bbox.join(","),density:String(layer==="bathymetry"?viewport.bathymetryDensity:viewport.currentDensity),time:"latest-available"});
        const response=await fetch(resolvePeloraApiUrl(`/api/ocean/field?${params}`),{signal});
        const field=await response.json();if(!response.ok)throw new Error(field.reason??`Field request ${response.status}`);
        return field;
      },
      onState:(layer,state)=>{
        if(disposed||mapRef.current!==map)return;
        states[layer]=state;
        try{
          if(state.status==="malformed-success")throw new Error(state.reason);
          if(state.field)validateFieldPresentation(state.field,layer);
          if(layer==="bathymetry"){
            bathyImage=state.field&&state.field.coverage.validCells?bathymetryImage(state.field):null;
            if(state.field?.coverage.validCells&&!bathyImage)throw new Error("Bathymetry conversion produced no image");
          }else currentData=currentFieldGeoJson(state.field);
          if(!state.field&&map.getLayer(FIELD_LAYER[layer]))map.setLayoutProperty(FIELD_LAYER[layer],"visibility","none");
          if(!map.isStyleLoaded())publish(layer,{...state,status:"loading"});
          apply();
        }catch(error){reject(layer,error);}
      }
    });
    const acquire=()=>{
      if(!active.length)return;
      try{requests.schedule(fieldViewport(map.getBounds(),map.getZoom()),active);}
      catch(error){requests.cancel();for(const layer of active)reject(layer,error);}
    };
    const start=()=>requests.cancel();
    const loaded=()=>{apply();acquire();};
    onFieldStatus({});apply();
    map.on("movestart",start);map.on("moveend",acquire);map.on("load",loaded);map.on("style.load",loaded);
    if(map.isStyleLoaded())acquire();
    const refresh=window.setInterval(acquire,300000);
    return()=>{disposed=true;requests.dispose();window.clearInterval(refresh);map.off("idle",sync);
      map.off("movestart",start);map.off("moveend",acquire);map.off("load",loaded);map.off("style.load",loaded);};
  },[mapRef,bathymetry,currentField,onFieldStatus]);
}
