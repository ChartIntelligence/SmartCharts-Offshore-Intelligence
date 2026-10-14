// Reuse exact consumer browser assertions against this assembled producer, not a snapshot.
import fs from 'node:fs';
const original=new URL('./currentSampleConsumerEpoch.browser.test.mjs',import.meta.url);
let source=fs.readFileSync(original,'utf8');
const producer="const producer='d7e8ba0e6cff5291e63fd02d9be96072340de3cb'";
if(!source.includes(producer))throw Error('Expected controlled browser producer seam');
source=source.replace(producer,"const producer=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()");
let changes=0;
source=source.replace(/^const source=p=>[^\n]+;/m,()=>{changes++;return "const source=p=>fs.readFileSync(root+'/frontend/src/'+p,'utf8');";});
if(changes!==1)throw Error('Expected exact source seam');
source=source.replaceAll('import.meta.url',JSON.stringify(original.href));
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
