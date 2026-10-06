// Actual isolated publisher process crash/competition qualification, never a service.
import fs from 'node:fs';import path from 'node:path';import {randomUUID} from 'node:crypto';import pg from 'pg';
import {createPublisherLedger,PUBLISHER_FREEZE} from '../../durableObserve/publicationScheduler.mjs';import {createLocalFourHourPublisher} from '../../durableObserve/localPublicationPublisher.mjs';import {composer} from './rankedPublicationFixture.mjs';import {cycleV2} from '../../../shared/oceanPublication.mjs';
if(process.env.PELORA_CP09_LOCAL!=='1')throw Error('local-opt-in');const c=JSON.parse(fs.readFileSync(path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification/worker-credentials.json'),'utf8'));if(c.host!=='127.0.0.1'||Number(c.port)!==55432||c.database!=='pelora_phase3_qualification')throw Error('local');
process.once('message',async({id,config,input,mode})=>{const db=new pg.Client({host:c.host,port:c.port,user:c.username,password:c.password,database:c.database});await db.connect();const ledger=createPublisherLedger({query:(...args)=>db.query(...args)});
 if(mode==='tick'){const p=createLocalFourHourPublisher({enabled:true,limits:{maxCyclesPerTick:1,maxConfigurationScan:1},createRuntime:async()=>({ledger:{...ledger,configurations:async()=>[config]},collect:async()=>input,compose:async x=>(await composer(x.artifacts[0].reference)).compose(x)})});const result=await p.tick();await p.close();await db.end();process.send({result});process.disconnect();return;}
 const cap=randomUUID(),claim=await ledger.claim(id,cap);if(claim.status!=='OWNED')throw Error('child-claim');
 if(mode!=='before-freeze')await ledger.freeze(id,cap,claim.fence,{contractVersion:PUBLISHER_FREEZE,configurationId:config.id,cycleId:cycleV2(input.cycle).cycleId,constructedAt:new Date().toISOString(),input});
 if(!['before-freeze','after-freeze'].includes(mode)){const p=await (await composer(input.artifacts[0].reference)).compose(input);if(mode!=='after-evaluate')await ledger.prepare(id,cap,claim.fence,p);}
 if(mode==='inside-finalize'){await db.query('BEGIN');await ledger.finalize(id,cap,claim.fence);}if(mode==='after-finalize')await ledger.finalize(id,cap,claim.fence);
 process.send({ready:true});setInterval(()=>{},1000);
});
