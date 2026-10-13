const routes={map:'',today:'/top-opportunities',intelligence:'/intelligence',reports:'/reports',profile:'/profile'};
export function shellRoute(hash){return Object.keys(routes).find(tab=>'#pelora'+routes[tab]===hash)??null;}
export function createShellNavigation(browser,epoch,read,apply){
 const available=Boolean(browser?.history?.replaceState&&browser?.location);
 const clean=value=>({tab:Object.hasOwn(routes,value?.tab)?value.tab:'map',report:value?.report===true,mission:value?.mission===true});
 const current=()=>clean(read());
 const write=(value,mode='replace')=>{if(!available)return;const next=clean(value),url=new URL(browser.location.href);url.hash='pelora'+routes[next.tab];browser.history[mode+'State']({peloraShell:{epoch,...next}},'',url.href);};
 const change=(value,mode)=>{const next=clean(value);apply(next);write(next,mode);};
 const initial=current();const route=available?shellRoute(browser.location.hash):null;
 // Only route is public URL intent; dialog/private workspace restoration is owned storage.
 if(route)initial.tab=route;
 if(available){apply(initial);write(initial);}
 const pop=()=>{
  const state=browser.history.state?.peloraShell;
  const route=shellRoute(browser.location.hash)??'map';
  const next=state?.epoch===epoch?clean(state):{tab:route,report:false,mission:false};
  apply(next); // Existing mission admission guard decides whether its editor may close.
 };
 if(available)browser.addEventListener('popstate',pop);
 return {
  navigate(tab){const previous=current();if(!Object.hasOwn(routes,tab)||previous.tab===tab)return;change({...previous,tab},previous.tab==='map'&&tab!=='map'?'push':'replace');},
  report(open){const previous=current();if(previous.report===open)return;change({...previous,report:open},open?'push':'replace');},
  mission(open){const previous=current();if(previous.mission===open)return;change({...previous,mission:open},open?'push':'replace');},
  sync(){if(!available)return;const previous=browser.history.state?.peloraShell,next=current();if(previous?.epoch!==epoch||previous.tab!==next.tab||previous.report!==next.report||previous.mission!==next.mission)write(next);},
  dispose(){if(available)browser.removeEventListener('popstate',pop);}
 };
}
