import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
let effect,constructed=0,disposed=0,received;
let binding;
const context=vm.createContext({useRef:value=>binding??(binding={current:value}),useEffect:fn=>effect=fn,createRetainedScalarReview:options=>{constructed++;received=options;return {dispose:()=>disposed++};}});
vm.runInContext(fs.readFileSync(new URL('../useRetainedScalarReview.js',import.meta.url),'utf8').replace(/^import[\s\S]*?;\r?\n/gm,'').replace('export function','function'),context);
const mapRef={current:{id:'SYNTHETIC-MAP-A'}};
for(const review of [undefined,null,{enabled:false}]){context.useRetainedScalarReview({mapRef,review});assert.equal(effect(),undefined);}assert.equal(constructed,0);
const review={enabled:true,getAuthority:()=>null},cleanup=(()=>{context.useRetainedScalarReview({mapRef,review});return effect();})();assert.equal(constructed,1);assert.equal(received.map,mapRef.current);assert(received.isAttached());mapRef.current={id:'SYNTHETIC-MAP-B'};assert.equal(received.isAttached(),false);cleanup();assert.equal(disposed,1);
context.useRetainedScalarReview({mapRef,review:{enabled:true,onController:()=>{throw Error('synthetic consumer failure');}}});assert.throws(()=>effect(),/synthetic consumer/);assert.equal(disposed,2);
console.log('PASS actual dedicated hook default-OFF, exact review capability/map binding, render-time detachment, cleanup and consumer initialization failure disposal');

let offState;const mutable={enabled:true,getAuthority:()=>({authorized:true,ownerKey:'SYNTHETIC-OWNER',revision:1}),onState:s=>offState=s};
context.useRetainedScalarReview({mapRef,review:mutable});const oldCleanup=effect();const oldGuard=received.isAttached;assert(oldGuard());
mutable.enabled=false;context.useRetainedScalarReview({mapRef,review:mutable});assert.equal(oldGuard(),false,'OFF render revokes old callback before effects');effect();assert.equal(offState.status,'off');oldCleanup();
mutable.enabled=true;context.useRetainedScalarReview({mapRef,review:mutable});effect();const beforeRoundtrip=received.isAttached;
mutable.enabled=false;context.useRetainedScalarReview({mapRef,review:mutable});mutable.enabled=true;context.useRetainedScalarReview({mapRef,review:mutable});assert.equal(beforeRoundtrip(),false,'same-object ON/OFF/ON does not revive old lifetime');
console.log('PASS actual hook render-time OFF/capability/owner binding revision, explicit OFF publication and same-object roundtrip guard');
