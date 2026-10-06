// Replay the unchanged captain-state regression suite with the new actual
// recovery dependency supplied to its existing import-stripping VM harness.
// No fixture/assertion edits and no provider access.
import {readFileSync} from 'node:fs';
const original=new URL('./betaSafetyCaptainState.test.js',import.meta.url);
let source=readFileSync(original,'utf8')
 .replace('const scope={interpretOpportunityEvaluation,', "const scope={IntelligenceRecovery:compile('../../components/IntelligenceRecovery.jsx','IntelligenceRecovery',{Component:React.Component}),interpretOpportunityEvaluation,")
 .replaceAll('import.meta.url',JSON.stringify(original.href))
 .replace(/from (['"])([^'"]+)\1/g,(_,quote,path)=>'from '+JSON.stringify(path.startsWith('.')?new URL(path,original).href:import.meta.resolve(path)));
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
