import {useEffect,useRef,useState} from 'react';
import {useCaptainContinuity} from '../hooks/useCaptainContinuity.js';
import '../styles/persistentMapShell.css';
const destinations=[['today','Top Opportunities'],['intelligence','Opportunity Analysis'],['reports','My Reports'],['profile','Profile']];
function DockIcon({type}){const paths={today:'M12 3v3m0 12v3M3 12h3m12 0h3M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10',intelligence:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6M7 10h6m-3-3v6',reports:'M5 3h14v18H5zM8 7h8M8 11h8M8 15h5',profile:'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M4 21v-2a8 8 0 0 1 16 0v2',up:'m5 15 7-7 7 7',down:'m5 9 7 7 7-7'};return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[type]}/></svg>;}
const validateShell=value=>value && Object.keys(value).length===1 && typeof value.dockExpanded==='boolean' ? value : null;

export function ShellOverlay({open,label,onClose,modal=false,blocked=false,children,showClose=true}) {
  const panel=useRef(null),opener=useRef(null),close=useRef(onClose);
  useEffect(()=>{close.current=onClose;},[onClose]);
  useEffect(()=>{
    if(!open || blocked) return;
    opener.current=document.activeElement;
    panel.current?.querySelector?.('[data-shell-heading]')?.focus?.();
    const key=event=>{
      if(event.key==='Escape' && close.current){event.preventDefault();event.stopImmediatePropagation?.();close.current();}
      if(event.key==='Tab' && modal){
        const nodes=[...(panel.current?.querySelectorAll?.('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')??[]),...(document.querySelectorAll?.('.pelora-universal-dock button')??[])].filter(n=>!n.closest('[hidden],[inert]'));
        const first=nodes[0],last=nodes.at(-1);
        if(event.shiftKey && (document.activeElement===first || !nodes.includes(document.activeElement))){event.preventDefault();last?.focus();}
        else if(!event.shiftKey && (document.activeElement===last || !nodes.includes(document.activeElement))){event.preventDefault();first?.focus();}
      }
    };
    document.addEventListener('keydown',key);
    return()=>{document.removeEventListener('keydown',key);const previous=opener.current;
      if(previous?.isConnected && !previous.closest?.('[hidden],[inert]'))previous.focus?.();
      else document.querySelector?.('.pelora-dock-toggle')?.focus?.();
    };
  },[open,blocked,modal,label]);
  return <section ref={panel} hidden={!open} inert={blocked || undefined} className={'pelora-shell-overlay '+(modal?'pelora-shell-editor':'')} role={modal?'dialog':'region'} aria-modal={modal?true:undefined} aria-label={label}>
    <header className="pelora-overlay-heading"><h1 className="pelora-sr-only" tabIndex={-1} data-shell-heading>{label}</h1>{showClose&&onClose&&<button type="button" onClick={onClose} aria-label={'Close '+label}>Close</button>}</header>{children}
  </section>;
}
function PersistentMapShell({user,activeTab,onNavigate,map,overlay,mission,warnings,brand,reportOpen=false,report,onReportClose,missionEditor=null,onMissionClose}){
  const {value:ui,setValue:setUI,error}=useCaptainContinuity(user,'shell-ui',()=>({dockExpanded:true}),validateShell);
  const [mobile,setMobile]=useState(()=>window.matchMedia?.('(max-width: 700px)').matches??false);
  useEffect(()=>{const media=window.matchMedia?.('(max-width: 700px)');if(!media)return;const update=()=>setMobile(media.matches);media.addEventListener?.('change',update);return()=>media.removeEventListener?.('change',update);},[]);
  const frame=useRef(null),chrome=useRef(null),dock=useRef(null);
  useEffect(()=>{const measure=()=>{const root=frame.current;root?.style?.setProperty?.('--pelora-chrome-height',(chrome.current?.getBoundingClientRect?.().height??0)+'px');root?.style?.setProperty?.('--pelora-dock-height',(dock.current?.getBoundingClientRect?.().height??0)+'px');root?.style?.setProperty?.('--pelora-dock-width',(dock.current?.getBoundingClientRect?.().width??0)+'px');};measure();const observer=window.ResizeObserver?new window.ResizeObserver(measure):null;[chrome.current,dock.current].filter(Boolean).forEach(n=>observer?.observe(n));window.addEventListener?.('resize',measure);return()=>{observer?.disconnect();window.removeEventListener?.('resize',measure);};},[ui.dockExpanded,mobile,warnings]);
  const editor=Boolean(missionEditor)||reportOpen;
  const closeOverlay=()=>onNavigate('map');
  return <div ref={frame} className="dashboard dashboard-map-mode pelora-persistent-shell">
    <div className="pelora-map-surface" inert={(mobile&&activeTab!=='map')||editor||undefined} aria-hidden={(mobile&&activeTab!=='map')||editor||undefined}>{map}</div>
    <div ref={chrome} className="pelora-shell-chrome"><div className="pelora-floating-mark">{brand}</div>
    <div className="pelora-existing-mission">{mission}</div>
    <div className="pelora-shell-warnings" role="status">{warnings}{error&&<p>{error}</p>}</div></div>
    <ShellOverlay open={activeTab!=='map'} label={destinations.find(([id])=>id===activeTab)?.[1]??'Top Opportunities'} onClose={closeOverlay} modal={mobile} blocked={editor}>{overlay}</ShellOverlay>
    <ShellOverlay open={reportOpen} label="Log fishing day" onClose={onReportClose} modal blocked={Boolean(missionEditor)} showClose={false}>{report}</ShellOverlay>
    <ShellOverlay open={Boolean(missionEditor)} label="Current Trip" onClose={onMissionClose} modal>{missionEditor}</ShellOverlay>
    <nav ref={dock} className="pelora-universal-dock" aria-label="Pelora navigation">
      <button className="pelora-dock-toggle" type="button" aria-expanded={ui.dockExpanded} aria-controls="pelora-dock-destinations" onClick={()=>setUI({dockExpanded:!ui.dockExpanded})}><DockIcon type={ui.dockExpanded?'up':'down'}/><span>{ui.dockExpanded?'Collapse':'Expand'}</span></button>
      <div id="pelora-dock-destinations" hidden={!ui.dockExpanded}>{destinations.map(([id,label])=><button key={id} type="button" title={label} aria-label={label} aria-current={activeTab===id?'page':undefined} onClick={()=>onNavigate(id)}><DockIcon type={id}/><span>{label}</span></button>)}</div>
    </nav>
  </div>;
}

export default PersistentMapShell;
