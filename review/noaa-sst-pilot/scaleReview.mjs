// Read-only retained archive/derivative qualification + explicit local review server.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {DIRECTORY,SOURCE_SHA256} from './pilot.mjs';
import {readOceanArchiveV1} from '../../shared/oceanProductArchive.mjs';
import {deliverOceanScalarFieldV1} from '../../shared/oceanScalarFieldDelivery.mjs';
import {distribution,candidateScales,scaleTile} from './scales.mjs';
export async function retainedField() {
  const json=name=>JSON.parse(readFileSync(`${DIRECTORY}${name}`,'utf8'));
  const summary=json('summary.json'),saved=json('field.json');
  if(createHash('sha256').update(readFileSync(`${DIRECTORY}source.nc`)).digest('hex')!==SOURCE_SHA256)throw Error('Source integrity');
  const id=summary.receipt.archiveId;
  const port={readExact:async requested=>{if(requested!==id)throw Error('Unregistered archive');return {status:'found',durable:true,record:json(`archive/${id}.json`)};}};
  const archive=await readOceanArchiveV1(port,{archiveId:id,frameId:null});
  if(archive.status!=='ARCHIVED'||archive.receipt.receiptDigest!==summary.receipt.receiptDigest)throw Error('Archive integrity');
  const delivered=await deliverOceanScalarFieldV1(port,{source:{archiveId:id,receiptDigest:summary.receipt.receiptDigest},variableId:'analysed_sst',bounds:[-98,18,-80,31],stride:{x:1,y:1},limits:{maxCells:93600,maxPayloadBytes:8388608},generatedAt:saved.generatedAt});
  if(!delivered.field||JSON.stringify(delivered.field)!==JSON.stringify(saved))throw Error('Retained scalar mismatch');
  return {field:delivered.field,summary};
}
export async function startScaleReview(port=5192) {
  const {field,summary}=await retainedField(),scales=candidateScales(field),stats=distribution(field),cache=new Map();
  const assets=new Map([
    ['/',[new URL('./scale.html',import.meta.url),'text/html']],
    ['/maplibre.js',[new URL('../../frontend/node_modules/maplibre-gl/dist/maplibre-gl.js',import.meta.url),'text/javascript']],
    ['/maplibre.css',[new URL('../../frontend/node_modules/maplibre-gl/dist/maplibre-gl.css',import.meta.url),'text/css']],
    ['/style.mjs',[new URL('../../frontend/src/utils/peloraMapStyle.js',import.meta.url),'text/javascript']],
  ]);
  const server=createServer((req,res)=>{
    const path=new URL(req.url,'http://127.0.0.1').pathname;
    if(req.method!=='GET'){res.writeHead(405);return res.end();}
    const asset=assets.get(path);
    if(asset){res.writeHead(200,{'Content-Type':asset[1]});return res.end(readFileSync(asset[0]));}
    if(path==='/presentation') {res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({scales,stats,nominalTime:summary.nominalTime,deliveryId:field.deliveryId}));}
    const m=/^\/tiles\/(control|fixed|frame|robust)\/(osfd-[a-f0-9]{64})\/(\d+)\/(\d+)\/(\d+)\.png$/.exec(path);
    if(m&&m[2]===field.deliveryId){
      const [z,x,y]=m.slice(3).map(Number);
      if(z<3||z>7||x>=2**z||y>=2**z){res.writeHead(400);return res.end();}
      try {
        if(!cache.has(path)){if(cache.size>=128)cache.delete(cache.keys().next().value);const t=scaleTile(field,scales.find(c=>c.id===m[1]),z,x,y);cache.set(path,{png:t.png,id:t.id});}
        const t=cache.get(path);res.writeHead(200,{'Content-Type':'image/png','Cache-Control':'no-store',ETag:`"${t.id}"`});return res.end(t.png);
      }catch{res.writeHead(500);return res.end('Presentation unavailable');}
    }
    res.writeHead(404);res.end();
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  return {server,field,scales,stats};
}
if(process.argv[1]&&import.meta.url===new URL(`file:///${process.argv[1].replaceAll('\\','/')}`).href){await startScaleReview();console.log('RETAINED SST SCALE REVIEW ONLY: http://127.0.0.1:5192');}
