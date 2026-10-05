import {fixture,time} from './continuousObserveFixture.mjs';
import {createJob} from '../../observe/jobs.mjs';
import {createCurrentObservationWorker} from '../../observe/currentObservationWorker.mjs';
import {createMemoryControl,createMemoryTimePolicy,createMemoryResponseStore,createMemoryResultStore} from '../../observe/memoryWorkerPorts.mjs';

export {time};
export const flush = async () => { for(let i=0;i<80;i++) await Promise.resolve(); };
export function deferred() { let resolve,reject; const promise=new Promise((a,b)=>{resolve=a;reject=b;}); return {promise,resolve,reject}; }
export function harness({region='synthetic-gulf',change=()=>{},payloadChange=()=>{},overrides={}}={}) {
  const context=fixture(region,change),job=createJob(context.manifest,'cell-a',time());
  let instant=Date.parse(time(0,1));const clock={now:()=>new Date(instant++).toISOString(),set:value=>{instant=Date.parse(value);}};
  const control=createMemoryControl(context),handle=control.issue(job,time(0,1));
  const policy=createMemoryTimePolicy(context.manifest.providerTime.policyReference,time());
  const responses=createMemoryResponseStore(),results=createMemoryResultStore(),requests=[];
  const payload={table:{columnNames:['time','latitude','longitude','u_current','v_current'],rows:[[time(),job.cell.coordinates.latitude,-90,0.5,0.25]]}};
  payloadChange(payload);
  let raw=Buffer.from(' \n'+JSON.stringify(payload)+'\n');
  const envelope=()=>({bytes:raw,status:200,provider:'NOAA CoastWatch',dataset:context.manifest.product.dataset});
  const scheduled=new Map();let timerId=0;
  const timers={arm(ms,fn){const id=++timerId;scheduled.set(id,{ms,fn});return id;},clear(id){scheduled.delete(id);},
    fire(ms){for(const [id,t] of [...scheduled])if(t.ms===ms){scheduled.delete(id);t.fn();}},count:()=>scheduled.size};
  const ports={control:control.port,policy:policy.port,responses,results,clock,timers,
    transport:async request=>{requests.push(request.url);return envelope();}};
  Object.assign(ports,overrides);
  return {context,job,handle,control,policy,responses,results,clock,timers,requests,payload,envelope,ports,
    get bytes(){return Buffer.from(raw);},setBytes(bytes){raw=bytes;},worker:()=>createCurrentObservationWorker(ports)};
}
