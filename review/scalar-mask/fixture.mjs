// Separate computational mask fixture. No real geography or operational values.
import {syntheticScalarFrame} from '../../backend/tests/fixtures/syntheticScalarFrame.js';
import {writeOceanArchiveV1} from '../../shared/oceanProductArchive.mjs';
import {createSyntheticScalarRuntimeV1} from '../../backend/fields/scalarRuntime.js';
import {parseSyntheticSstResponse} from '../../frontend/src/utils/syntheticSstDisplay.js';
export async function maskFixture() {
  const frame=syntheticScalarFrame('synthetic-mask-guard-frame');
  frame.product.productId='synthetic-mask-guard-analysis';
  frame.product.datasetId='synthetic-mask-review';
  frame.spatial.nativeResolution={x:0.5,y:0.5,unit:'degree'};
  frame.spatial.deliveredResolution={x:0.5,y:0.5,unit:'degree'};
  frame.provenance.sources=[{providerId:'synthetic',datasetId:'synthetic-mask-review',recordId:'synthetic-mask-source-v1',locatorId:'synthetic-mask-reference-v1',checksum:null}];
  frame.lineage={parentFrameIds:[],sourceRecordIds:['synthetic-mask-source-v1'],completeness:'complete'};
  frame.payload.axes={x:Array.from({length:9},(_,i)=>-90+i*0.5),y:Array.from({length:5},(_,j)=>25+j*0.5)};
  const component=frame.payload.components[0];component.values=[];component.missing=[];
  for(let j=0;j<5;j++)for(let i=0;i<9;i++) {
    const reason=i<=1&&j>=2?'land':i===4&&j===2?'provider-no-data':i===6&&j===3?'unknown':null;
    component.values.push(reason?null:i===1&&j===0?0:280+i+j);
    component.missing.push(reason);
  }
  const records=new Map();
  const port={async createIfAbsent(id,record){const outcome=records.has(id)?'exists':'created';if(!records.has(id))records.set(id,structuredClone(record));return {outcome,durable:true,record:records.get(id)};},
    async readExact(id){return records.has(id)?{status:'found',durable:true,record:records.get(id)}:{status:'not-found'};}};
  const archived=await writeOceanArchiveV1(port,frame,{writeId:'synthetic-mask-write',archivedAt:'2026-09-03T00:00:00Z',storageReference:'synthetic-mask-memory',sourceRevision:'synthetic-mask-v1',rawEvidence:[]});
  if(archived.status!=='ARCHIVED')throw Error('Synthetic mask archive failed'); // TEST acknowledgement only
  const runtime=createSyntheticScalarRuntimeV1({port,selection:{selector:'synthetic-mask-v1',layer:'synthetic-sst',variableId:'temperature',archiveId:archived.receipt.archiveId,receiptDigest:archived.receipt.receiptDigest},
    limits:{maxSourceBytes:50000,maxSourceCells:45,maxCells:45,maxPayloadBytes:30000,maxHttpBytes:35000},generatedAt:'2026-09-03T01:00:00Z'});
  const response=await runtime(new URLSearchParams({mode:'scalar',layer:'synthetic-sst',evidence:'synthetic-mask-v1',component:'temperature',bbox:'-90,25,-86,27',strideX:'1',strideY:'1'}));
  return parseSyntheticSstResponse(response.body);
}
