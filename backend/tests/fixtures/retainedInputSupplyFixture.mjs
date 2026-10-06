// Existing Frame/archive fixture shape only; no provider qualification or scalar reconstruction.
import {OCEAN_PRODUCT_FRAME_CONTRACT} from '../../../shared/oceanProductFrame.mjs';
import {writeOceanArchiveV1} from '../../../shared/oceanProductArchive.mjs';
export async function retainedArchiveFixture(id){
 const frame={contractVersion:OCEAN_PRODUCT_FRAME_CONTRACT,frameId:id,
 product:{productId:'synthetic-analysis',providerId:'synthetic',datasetId:'synthetic-nrt',productVersion:'1',family:'temperature',processingLevel:null,evidenceClass:'ANALYSIS'},
 temporal:{support:{kind:'unknown',reason:'synthetic-unknown'},observationTime:null,forecastIssuedAt:null,providerPublishedAt:null,acquiredAt:'2026-09-01T00:00:00Z',processedAt:null},
 spatial:{crs:'EPSG:4326',horizontalDatum:'WGS84',verticalDatum:null,coordinateOrder:'x,y',bounds:[-90,25,-89,25],boundsMeaning:'payload-extent',nativeResolution:null,deliveredResolution:null,resamplingMethod:null,coverageCompleteness:'partial',coverageBasis:'synthetic',landMask:'explicit-cell-reasons'},
 payload:{kind:'scalar',layout:'rectilinear-grid',coordinates:null,axes:{x:[-90,-89],y:[25]},vectorBasis:null,components:[{variableId:'temperature',unit:'K',axis:null,positiveDirection:null,values:[0,null],missing:[null,'land']}]},
 quality:{providerScheme:'synthetic-flags',flags:[{flagId:'ice',value:false}],uncertainty:null},
 provenance:{sources:[{providerId:'synthetic',datasetId:'synthetic-nrt',recordId:'source-1',locatorId:'source-ref-1',checksum:null}],adapterId:'synthetic-normalizer',adapterVersion:'1',steps:[]},
 lineage:{parentFrameIds:['synthetic-parent'],sourceRecordIds:['source-1'],completeness:'partial'}};
 let record;const result=await writeOceanArchiveV1({createIfAbsent:async(_,r)=>{record=r;return {outcome:'created',durable:true,record:r};}},frame,
 {writeId:'controlled-write',archivedAt:'2026-09-02T00:00:00Z',storageReference:'controlled-storage',sourceRevision:'revision-1',rawEvidence:[]});
 if(result.status!=='ARCHIVED')throw Error('controlled-archive-fixture');return record;
}
