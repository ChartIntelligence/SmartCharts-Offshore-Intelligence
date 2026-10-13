// Actual caller reconciliation, synthetic sessions, no transport implementation.
test('Dashboard forwards exact current session reference on renewal/principal/logout',async()=>{
 const store=new Storage(),h=await workspace(store);const initial=h.props.session;
 try{assert.strictEqual(seen.MapLibreIntelligenceMap.session,initial);
  const renewed=Object.freeze({user:principal('A'),access_token:'SYNTHETIC-CALLER-RENEWAL'});await h.render({...h.props,session:renewed});assert.strictEqual(seen.MapLibreIntelligenceMap.session,renewed);
  const other=Object.freeze({user:principal('B'),access_token:'SYNTHETIC-CALLER-B'});await h.render({...h.props,user:other.user,session:other});assert.strictEqual(seen.MapLibreIntelligenceMap.session,other);
  await h.render({...h.props,user:null,session:null});assert.strictEqual(seen.MapLibreIntelligenceMap.session,null);
  const bytes=[...store.data.values()].join('');assert(!bytes.includes('SYNTHETIC-CALLER-RENEWAL'));assert(!bytes.includes('SYNTHETIC-CALLER-B'));assert(!h.container.textContent.includes('SYNTHETIC-CALLER'));assert.equal(h.errors.length,0);
 }finally{await h.close();}
});
test('actual map forwards same reference to field hook; changed owner/null do not retain old session or rebuild map',async()=>{
 const received=[],map={};let mounted=0,disposed=0,requests=0,logs=0,retrievals=0;const previousFetch=globalThis.fetch;globalThis.fetch=()=>{requests++;throw Error('No network allowed');};
 const forbidden=()=>{retrievals++;throw Error('No retrieval allowed');};const synthetic=id=>Object.freeze({user:principal(id),access_token:'SYNTHETIC-'+id,getSession:forbidden,refreshSession:forbidden,toJSON:forbidden});
 const noop=()=>{};const C=compile('../../components/MapLibreIntelligenceMap.jsx','MapLibreIntelligenceMap',{...common,console:{log(){logs++;},info(){logs++;},warn(){logs++;},error(){logs++;}},structures:[],buildMapGeoJson:()=>({type:'FeatureCollection',features:[]}),sampleLayersForMode:x=>x,useMapLibreSetup:({mapRef})=>{useEffect(()=>{mounted++;mapRef.current=map;return()=>{disposed++;mapRef.current=null;};},[mapRef]);},useMapLibreOceanFields:props=>received.push(props),useMapCameraContinuity:noop,useMapLibreLayers:noop,useMapLibreOceanFeatures:noop,useMapLibreEnvironmentalObservations:noop,useSyntheticSstReview:noop,useMapLibreOpenWaterOpportunities:noop,useMapLibreOpportunitySelection:noop,useMapLibreMarkers:noop,useMapLibreSelection:noop});
 const layers={locations:true,bathymetry:true,currentField:true},onFieldStatus=noop;const h=await mount(C,{layers,onFieldStatus});
 try{assert.strictEqual(received.at(-1).session,null);const ref=received.at(-1).mapRef;
  for(const session of [synthetic('A'),synthetic('A-renewed'),synthetic('B'),null]){await h.render({layers,onFieldStatus,session});assert.strictEqual(received.at(-1).session,session);assert.strictEqual(received.at(-1).mapRef,ref);assert.strictEqual(received.at(-1).onFieldStatus,onFieldStatus);assert.equal(received.at(-1).bathymetry,true);assert.equal(received.at(-1).currentField,true);}
  assert.equal(mounted,1);assert.equal(disposed,0);assert.equal(requests,0);assert.equal(retrievals,0);assert.equal(logs,0);assert(!h.container.textContent.includes('SYNTHETIC-'));assert.equal(h.errors.length,0);
 }finally{await h.close();globalThis.fetch=previousFetch;}assert.equal(disposed,1);
});
