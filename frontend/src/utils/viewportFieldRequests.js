// Retention is scoped to an exact viewport/request context, independently per layer.
export function createViewportFieldRequests({request,onState,setTimer=setTimeout,clearTimer=clearTimeout,delay=350}) {
  let timer=null,controller=null,generation=0,disposed=false;
  const successful = new Map();
  function cancel(){generation++;if(timer!==null)clearTimer(timer);timer=null;controller?.abort();}
  return {
    cancel,
    schedule(viewport,active){
      if (disposed) return;
      cancel();
      const identity=generation;
      // Snapshot the request: a caller mutating its viewport cannot change an in-flight context.
      const contextKey=JSON.stringify(viewport);
      const requestedViewport=JSON.parse(contextKey);
      for (const layer of active) {
        if (successful.get(layer)?.contextKey !== contextKey) successful.delete(layer);
        const retained=successful.get(layer);
        // Publish the context boundary immediately, before the debounce expires.
        onState(layer,{contextKey,status:"loading",field:retained?.field ?? null,reason:retained?.reason ?? null});
      }
      timer=setTimer(async()=>{
        timer=null;
        if (disposed || identity!==generation) return;
        const requestController=new AbortController();
        controller=requestController;
        await Promise.all(active.map(async layer=>{
          try {
            const field=await request(layer,requestedViewport,requestController.signal);
            if (disposed || identity!==generation) return;
            if (field.status === "unavailable") throw new Error(field.reason ?? "Provider returned no available field");
            successful.set(layer,{contextKey,field});
            onState(layer,{contextKey,status:field.status,field});
          }catch(error){
            if (disposed || identity!==generation || error.name==="AbortError") return;
            const retained=successful.get(layer);
            const reason=error.message || "Field refresh failed";
            if (retained) retained.reason=reason;
            onState(layer,{contextKey,status:retained ? "degraded" : "unavailable",field:retained?.field ?? null,reason});
          }
        }));
      },delay);
    },
    dispose(){disposed=true;cancel();successful.clear();}
  };
}
