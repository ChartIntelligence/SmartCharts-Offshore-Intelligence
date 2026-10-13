import {useEffect,useRef,useState} from 'react';
import {useCaptainContinuity} from '../hooks/useCaptainContinuity.js';
import '../styles/persistentMapShell.css';
const destinations=[['today','Top Opportunities','◎'],['intelligence','Intelligence','⌁'],['reports','Reports','▤'],['profile','Profile','◉']];
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
    <header className="pelora-overlay-heading"><h1 tabIndex={-1} data-shell-heading>{label}</h1>{showClose&&onClose&&<button type="button" onClick={onClose} aria-label={'Close '+label}>Close</button>}</header>{children}
  </section>;
}
function PersistentMapShell({user,activeTab,onNavigate,map,overlay,mission,warnings,brand,reportOpen=false,report,onReportClose,missionEditor=null,onMissionClose}){
  const {value:ui,setValue:setUI,error}=useCaptainContinuity(user,'shell-ui',()=>({dockExpanded:true}),validateShell);
  const [focused,setFocused]=useState(false),[mobile,setMobile]=useState(()=>window.matchMedia?.('(max-width: 700px)').matches??false);
  useEffect(()=>{const media=window.matchMedia?.('(max-width: 700px)');if(!media)return;const update=()=>setMobile(media.matches);media.addEventListener?.('change',update);return()=>media.removeEventListener?.('change',update);},[]);
  const editor=Boolean(missionEditor)||reportOpen;
  const closeOverlay=()=>onNavigate('map');
  return <div className={'dashboard dashboard-map-mode pelora-persistent-shell'+(focused?' pelora-map-focused':'')}>
    <div className="pelora-map-surface" inert={(mobile&&activeTab!=='map')||editor||undefined} aria-hidden={(mobile&&activeTab!=='map')||editor||undefined}>{map}</div>
    <div className="pelora-floating-mark">{brand}</div>
    <div className="pelora-existing-mission">{mission}</div>
    <div className="pelora-shell-warnings" role="status">{warnings}{error&&<p>{error}</p>}</div>
    <ShellOverlay open={activeTab!=='map'} label={destinations.find(([id])=>id===activeTab)?.[1]??'Top Opportunities'} onClose={closeOverlay} modal={mobile} blocked={editor}>{overlay}</ShellOverlay>
    <ShellOverlay open={reportOpen} label="Log fishing day" onClose={onReportClose} modal blocked={Boolean(missionEditor)} showClose={false}>{report}</ShellOverlay>
    <ShellOverlay open={Boolean(missionEditor)} label="Current Trip" onClose={onMissionClose} modal>{missionEditor}</ShellOverlay>
    <nav className="pelora-universal-dock" aria-label="Pelora navigation">
      <button className="pelora-dock-toggle" type="button" aria-expanded={ui.dockExpanded&&!focused} aria-controls="pelora-dock-destinations" title="Pelora navigation" onClick={()=>{setFocused(false);setUI({dockExpanded:focused?true:!ui.dockExpanded});}}>☰<span className="pelora-dock-label">Navigation</span></button>
      <div id="pelora-dock-destinations" hidden={!ui.dockExpanded||focused}>{destinations.map(([id,label,icon])=><button key={id} type="button" title={label} aria-label={label} aria-current={activeTab===id?'page':undefined} onClick={()=>{setFocused(false);onNavigate(id);}}><span aria-hidden="true">{icon}</span><span>{label}</span></button>)}</div>
      <button type="button" className="pelora-map-focus" aria-pressed={focused} aria-label={focused?'Restore map controls':'Focus ocean'} title={focused?'Restore map controls':'Focus ocean'} onClick={()=>{if(!focused)onNavigate('map');setFocused(!focused);}}>⊙<span className="pelora-dock-label">{focused?'Restore controls':'Focus ocean'}</span></button>
    </nav>
  </div>;
}

export default PersistentMapShell;
