import {useEffect} from "react";
import {resolvePeloraApiUrl} from "../utils/peloraApi.js";
import {observationImages} from "../utils/mapObservationDisplay.js";
import {FIELD_SOURCE,FIELD_LAYER,EMPTY_FIELD,fieldViewport,currentFieldGeoJson,bathymetryImage,
  fieldLayerDefinitions,fieldInsertBefore,validateFieldPresentation,installBathymetryTextureSampling,
  BATHYMETRY_CONTOUR_SOURCE,BATHYMETRY_CONTOUR_LAYERS,bathymetryContours,bathymetryContourLayerDefinitions} from "../utils/oceanFieldPresentation.js";
import {createViewportFieldRequests} from "../utils/viewportFieldRequests.js";

export function useMapLibreOceanFields({mapRef,bathymetry,currentField,onFieldStatus}) {
  useOceanField({mapRef,layer:"bathymetry",enabled:bathymetry,onFieldStatus});
  useOceanField({mapRef,layer:"currents",enabled:currentField,onFieldStatus});
}

// Each layer owns its request generation, retention, events and render buffer.
function useOceanField({mapRef,layer,enabled,onFieldStatus}) {
  useEffect(()=>{
    const map=mapRef.current;if(!map)return;
    let disposed=false, bathyImage=null,currentData=EMPTY_FIELD,readyTimer=null;
    let sampledSource=null,releaseSampling=null;
    let contourData=EMPTY_FIELD;
    let displayedState=null,convertedField=null;
    let displayedImage=null,displayedContours=EMPTY_FIELD;
    const bathymetry=enabled&&layer==="bathymetry",currentField=enabled&&layer==="currents";
    const states={};
    const active=enabled?[layer]:[];
    const publish=(layer,state)=>onFieldStatus(current=>({...current,[layer]:state}));
    const clearRendered=()=>{
      releaseSampling?.();releaseSampling=null;sampledSource=null;
      if(layer==="bathymetry"){
        for(const id of BATHYMETRY_CONTOUR_LAYERS){
          try{if(map.getLayer(id))map.setLayoutProperty(id,"visibility","none");}catch{/* teardown */}
          try{if(map.getLayer(id))map.removeLayer(id);}catch{/* teardown */}
        }
        try{if(map.getSource(BATHYMETRY_CONTOUR_SOURCE))map.getSource(BATHYMETRY_CONTOUR_SOURCE).setData(EMPTY_FIELD);}catch{/* teardown */}
        try{if(map.getSource(BATHYMETRY_CONTOUR_SOURCE))map.removeSource(BATHYMETRY_CONTOUR_SOURCE);}catch{/* teardown */}
      }
      // Hide first; remove only this layer/source if the map operation fails.
      try{if(map.getLayer(FIELD_LAYER[layer]))map.setLayoutProperty(FIELD_LAYER[layer],"visibility","none");}
      catch{try{if(map.getLayer(FIELD_LAYER[layer]))map.removeLayer(FIELD_LAYER[layer]);}catch{/* map teardown */}}
      try{if(map.getSource(FIELD_SOURCE[layer])){
        if(layer==="currents")map.getSource(FIELD_SOURCE[layer]).setData(EMPTY_FIELD);
        else {if(map.getLayer(FIELD_LAYER[layer]))map.removeLayer(FIELD_LAYER[layer]);map.removeSource(FIELD_SOURCE[layer]);}
      }}catch{try{if(map.getLayer(FIELD_LAYER[layer]))map.removeLayer(FIELD_LAYER[layer]);
        if(map.getSource(FIELD_SOURCE[layer]))map.removeSource(FIELD_SOURCE[layer]);}catch{/* map teardown */}}
    };
    const reject=(layer,error)=>{
      const state=states[layer];
      requests.invalidate(layer,state?.contextKey);
      if(layer==="bathymetry"){bathyImage=null;contourData=EMPTY_FIELD;displayedState=null;convertedField=null;
        displayedImage=null;displayedContours=EMPTY_FIELD;}else currentData=EMPTY_FIELD;
      states[layer]={contextKey:state?.contextKey,status:"unavailable",field:null,reason:error.message};
      clearRendered();
      publish(layer,states[layer]);
    };
    const sync=()=>{
      if(disposed||mapRef.current!==map)return;
      try{
        const data=layer==="bathymetry"?bathyImage:currentData;
        const visible=layer==="bathymetry"?bathymetry&&data:currentField&&data.features.length>0;
        const source=map.getSource(FIELD_SOURCE[layer]);
        if(layer==="currents"){
          if(!map.hasImage("pelora-field-current-arrow"))map.addImage("pelora-field-current-arrow",observationImages()["pelora-current-arrow"]);
          if(source)source.setData(data);else map.addSource(FIELD_SOURCE[layer],{type:"geojson",data});
        }else if(data){
          if(source)source.updateImage(data);else map.addSource(FIELD_SOURCE[layer],{type:"image",...data});
          const imageSource=map.getSource(FIELD_SOURCE[layer]);
          if(imageSource!==sampledSource){
            releaseSampling?.();sampledSource=imageSource;
            releaseSampling=installBathymetryTextureSampling(imageSource,error=>{
              if(!disposed&&mapRef.current===map&&map.getSource(FIELD_SOURCE[layer])===imageSource)reject(layer,error);
            });
          }
        }
        const definition=fieldLayerDefinitions().find(d=>d.id===FIELD_LAYER[layer]);
        if(map.getSource(definition.source)&&!map.getLayer(definition.id))map.addLayer(definition,fieldInsertBefore(map));
        if(map.getLayer(definition.id))map.setLayoutProperty(definition.id,"visibility",visible?"visible":"none");
        if(layer==="bathymetry"){
          // Preserve the repaired image internally; contours are the captain view.
          if(map.getLayer(definition.id))map.setLayoutProperty(definition.id,"visibility","none");
          const contours=map.getSource(BATHYMETRY_CONTOUR_SOURCE);
          if(contours)contours.setData(contourData);
          else if(data)map.addSource(BATHYMETRY_CONTOUR_SOURCE,{type:"geojson",data:contourData});
          if(map.getSource(BATHYMETRY_CONTOUR_SOURCE))for(const line of bathymetryContourLayerDefinitions()){
            if(!map.getLayer(line.id))map.addLayer(line,fieldInsertBefore(map));
            map.setLayoutProperty(line.id,"visibility",visible?"visible":"none");
          }
          if(map.getLayer(FIELD_LAYER.currents))for(const id of BATHYMETRY_CONTOUR_LAYERS)
            if(map.getLayer(id))map.moveLayer(id,FIELD_LAYER.currents);
        }
        if(layer==="bathymetry"&&map.getLayer(FIELD_LAYER.bathymetry)&&map.getLayer(FIELD_LAYER.currents))map.moveLayer(FIELD_LAYER.bathymetry,FIELD_LAYER.currents);
        if(states[layer]){publish(layer,states[layer]);
          if(layer==="bathymetry"&&states[layer].field&&!states[layer].refreshing){
            displayedState=states[layer];displayedImage=bathyImage;displayedContours=contourData;}}
      }catch(error){reject(layer,error);}
    };
    const apply=()=>{
      if(disposed||mapRef.current!==map)return;
      map.off("idle",apply);
      if(map.isStyleLoaded()){
        if(readyTimer!==null)window.clearTimeout(readyTimer);readyTimer=null;sync();
      }else{
        map.once("idle",apply);
        // Retry readiness without movement; each layer owns its own timer.
        if(readyTimer===null)readyTimer=window.setTimeout(()=>{readyTimer=null;apply();},100);
      }
    };
    const requests=createViewportFieldRequests({
      request:async(layer,viewport,signal)=>{
        const params=new URLSearchParams({layer,bbox:viewport.bbox.join(","),density:String(layer==="bathymetry"?viewport.bathymetryDensity:viewport.currentDensity),time:"latest-available"});
        const response=await fetch(resolvePeloraApiUrl(`/api/ocean/field?${params}`),{signal});
        // Read failures remain transport failures, even if named SyntaxError.
        let body;
        try{body=await response.text();}
        catch(error){if(!response.ok)throw new Error(`Field request ${response.status}`);throw error;}
        let field;
        try{field=JSON.parse(body);}
        catch{
          if(!response.ok)throw new Error(`Field request ${response.status}`);
          // The helper classifies this unusable success after its race guards.
          return null;
        }
        if(!response.ok)throw new Error(field?.reason??`Field request ${response.status}`);
        return field;
      },
      onState:(layer,state)=>{
        if(disposed||mapRef.current!==map)return;
        // Display retention is separate from the exact-context request cache.
        // Never attach the old field to the new request context or extrapolate it.
        if(layer==="bathymetry"&&state.status==="loading"&&displayedState?.field?.status==="static"&&
          displayedState.field.validTime===null&&displayedImage){
          const field=displayedState.field,{longitudes:xs,latitudes:ys}=field.payload;
          const bbox=JSON.parse(state.contextKey).bbox;
          if(Math.max(bbox[0],field.bounds[0],xs[0])<Math.min(bbox[2],field.bounds[2],xs.at(-1))&&
            Math.max(bbox[1],field.bounds[1],ys[0])<Math.min(bbox[3],field.bounds[3],ys.at(-1))){
            states[layer]={...displayedState,refreshing:true,requestedContextKey:state.contextKey,
              displayContextKey:displayedState.contextKey,retainedForViewportTransition:true};
            // Supersede any converted-but-unapplied older replacement as well.
            bathyImage=displayedImage;contourData=displayedContours;convertedField=displayedState.field;
            publish(layer,states[layer]);return;
          }
        }
        states[layer]=state;
        try{
          if(state.status==="malformed-success")throw new Error(state.reason);
          if(state.field)validateFieldPresentation(state.field,layer);
          if(layer==="bathymetry"){
            const identity=field=>JSON.stringify([field.productId,field.provider,field.dataset,field.productVersion,
              field.validTime,field.units,field.crs,field.provenance?.providerUrl]);
            if(state.field&&displayedState?.field&&identity(state.field)!==identity(displayedState.field)){
              // A real source/edition/time change is not a camera transition.
              clearRendered();displayedState=null;displayedImage=null;displayedContours=EMPTY_FIELD;
            }
            // Build both derivatives before swapping the displayed buffers.
            if(state.field!==convertedField){
              const image=state.field&&state.field.coverage.validCells?bathymetryImage(state.field):null;
              const contours=state.field?bathymetryContours(state.field):EMPTY_FIELD;
              bathyImage=image;contourData=contours;convertedField=state.field;
            }
            if(!state.field){displayedState=null;displayedImage=null;displayedContours=EMPTY_FIELD;}
            if(state.field?.coverage.validCells&&!bathyImage)throw new Error("Bathymetry conversion produced no image");
          }else currentData=currentFieldGeoJson(state.field);
          if(!state.field&&map.getLayer(FIELD_LAYER[layer]))map.setLayoutProperty(FIELD_LAYER[layer],"visibility","none");
          if(layer==="bathymetry"&&!state.field)for(const id of BATHYMETRY_CONTOUR_LAYERS)
            if(map.getLayer(id))map.setLayoutProperty(id,"visibility","none");
          if(!map.isStyleLoaded()){
            if(layer==="bathymetry"&&displayedState?.field&&state.field?.status==="static")
              publish(layer,state.field===displayedState.field?state:{...displayedState,refreshing:true,
                requestedContextKey:state.contextKey,displayContextKey:displayedState.contextKey,retainedForViewportTransition:true});
            else publish(layer,{...state,status:state.field?"loading":state.status});
          }
          apply();
        }catch(error){reject(layer,error);}
      }
    });
    const acquire=()=>{
      if(disposed||mapRef.current!==map||!active.length)return;
      try{requests.schedule(fieldViewport(map.getBounds(),map.getZoom()),active);}
      catch(error){requests.cancel();for(const layer of active)reject(layer,error);}
    };
    const start=()=>requests.cancel();
    const loaded=()=>{apply();acquire();};
    if(!enabled){
      clearRendered();publish(layer,{status:"off",field:null});return;
    }
    apply();
    map.on("movestart",start);map.on("moveend",acquire);map.on("load",loaded);map.on("style.load",loaded);
    acquire();
    const refresh=window.setInterval(acquire,300000);
    return()=>{disposed=true;requests.dispose();window.clearInterval(refresh);if(readyTimer!==null)window.clearTimeout(readyTimer);map.off("idle",apply);
      clearRendered();
      if(layer==="bathymetry"){bathyImage=null;contourData=EMPTY_FIELD;displayedState=null;convertedField=null;displayedImage=null;displayedContours=EMPTY_FIELD;}
      map.off("movestart",start);map.off("moveend",acquire);map.off("load",loaded);map.off("style.load",loaded);};
  },[mapRef,layer,enabled,onFieldStatus]);
}
