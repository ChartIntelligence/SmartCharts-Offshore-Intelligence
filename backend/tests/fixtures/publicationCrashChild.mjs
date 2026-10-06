// Explicit isolated qualification process; credentials never cross IPC.
import fs from 'node:fs';import path from 'node:path';import pg from 'pg';
if(process.env.PELORA_CP08_LOCAL!=='1')throw Error('local-opt-in');
const c=JSON.parse(fs.readFileSync(path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification/worker-credentials.json'),'utf8'));
if(c.host!=='127.0.0.1'||Number(c.port)!==55432||c.database!=='pelora_phase3_qualification'||c.username!=='pelora_cp02_worker')throw Error('isolation-mismatch');
process.once('message',async({text,commit})=>{
 const db=new pg.Client({host:c.host,port:c.port,user:c.username,password:c.password,database:c.database});await db.connect();await db.query('BEGIN');await db.query('SELECT cp08.submit($1)',[text]);if(commit)await db.query('COMMIT');process.send({ready:true});setInterval(()=>{},1000);
});
