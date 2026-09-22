import {useEffect} from "react";
import {observationImages} from "../utils/mapObservationDisplay.js";
import {FIELD_SOURCE,FIELD_LAYER,EMPTY_FIELD,fieldViewport,currentFieldGeoJson,bathymetryImage,
  fieldLayerDefinitions,fieldInsertBefore} from "../utils/oceanFieldPresentation.js";
import {createViewportFieldRequests} from "../utils/viewportFieldRequests.js";

export function useMapLibreOceanFields({mapRef,bathymetry,currentField,onFieldStatus}) {
  useEffect(()=>{
    const map=mapRef.current;if(!map)return;
    let disposed=false, bathyImage=null,currentData=EMPTY_FIELD;
    const active=[...(bathymetry?["bathymetry"]:[]),...(currentField?["currents"]:[])];
    const sync=()=>{
      if(disposed||mapRef.current!==map)return;
      const before=fieldInsertBefore(map);
      if(!map.hasImage("pelora-field-current-arrow"))map.addImage("pelora-field-current-arrow",observationImages()["pelora-current-arrow"]);
      const source=map.getSource(FIELD_SOURCE.currents);
      if(source)source.setData(currentData);else map.addSource(FIELD_SOURCE.currents,{type:"geojson",data:currentData});
      if(bathyImage){
        const raster=map.getSource(FIELD_SOURCE.bathymetry);
        if(raster)raster.updateImage(bathyImage);else map.addSource(FIELD_SOURCE.bathymetry,{type:"image",...bathyImage});
      }
      for(const definition of fieldLayerDefinitions()){
        const isBathy=definition.id===FIELD_LAYER.bathymetry;
        if(!map.getSource(definition.source))continue;
        if(!map.getLayer(definition.id))map.addLayer(definition,before);
        map.setLayoutProperty(definition.id,"visibility",(isBathy?bathymetry&&bathyImage:currentField&&currentData.features.length>0)?"visible":"none");
      }
      if(map.getLayer(FIELD_LAYER.bathymetry)&&map.getLayer(FIELD_LAYER.currents))map.moveLayer(FIELD_LAYER.bathymetry,FIELD_LAYER.currents);
    };
    const apply=()=>{map.off("idle",sync);if(map.isStyleLoaded())sync();else map.once("idle",sync);};
    const requests=createViewportFieldRequests({
      request:async(layer,viewport,signal)=>{
        const params=new URLSearchParams({layer,bbox:viewport.bbox.join(","),density:String(layer==="bathymetry"?viewport.bathymetryDensity:viewport.currentDensity),time:"latest-available"});
        const response=await fetch(`${import.meta.env.VITE_OCEAN_API_BASE ?? "https://velion-ocean-engine.onrender.com"}/api/ocean/field?${params}`,{signal});
        const field=await response.json();if(!response.ok)throw new Error(field.reason??`Field request ${response.status}`);
        if(field.contractVersion!=="pelora-spatial-field-v1"||field.layer!==layer)throw new Error("Unsupported field contract");
        return field;
      },
      onState:(layer,state)=>{
        if(disposed)return;
        try{
          if (!state.field && map.getLayer(FIELD_LAYER[layer])) map.setLayoutProperty(FIELD_LAYER[layer], "visibility", "none");
          if(layer==="bathymetry")bathyImage=state.field&&state.field.coverage.validCells?bathymetryImage(state.field):null;
          else currentData=currentFieldGeoJson(state.field);
          onFieldStatus(current=>({...current,[layer]:state}));apply();
        }catch(error){onFieldStatus(current=>({...current,[layer]:{status:"unavailable",reason:error.message}}));}
      }
    });
    const acquire=()=>{
      if(!active.length)return;
      try{requests.schedule(fieldViewport(map.getBounds(),map.getZoom()),active);}
      catch(error){requests.cancel();bathyImage=null;currentData=EMPTY_FIELD;apply();onFieldStatus(Object.fromEntries(active.map(layer=>[layer,{status:"unavailable",reason:error.message}])));}
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
