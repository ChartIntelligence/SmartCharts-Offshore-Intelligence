function CaptainProfile({ownerId,profileRead,onSignOut,qaReadOnly=false,ui,onUiChange}){
  const messages={NO_AUTHORIZED_OWNER:'No authorized account is available.',LOADING:'Loading account details…',REVALIDATING:'Refreshing account details · showing last-confirmed information.',RESOLVED:'Account details confirmed.',MISSING:'Account details have not been supplied.',READ_UNAVAILABLE:'Account details could not be read.',INVALID_BINDING:'Account details could not be verified.'};
  const supplied=profileRead?.profile;
  const profile=typeof ownerId==='string' && ownerId.trim() &&
    profileRead?.contractVersion==='pelora-private-account-profile-read-v1' &&
    ['RESOLVED','REVALIDATING'].includes(profileRead.resolution) && supplied?.ownerId===ownerId &&
    ['email','displayName','boatName'].every(key=>supplied[key]===null || typeof supplied[key]==='string') &&
    ['founder','founding_captain'].includes(supplied.accessRole) && ['approved','pending','revoked'].includes(supplied.accessStatus) ? supplied : null;
  const text=value=>value===null || value===''?'Not supplied':value;
  const editing=Boolean(profile && ui?.owner===ownerId && ui.editing);
  const signOut=async()=>{
    if(!ownerId || typeof onSignOut!=='function' || ['busy','awaiting'].includes(ui?.signOutPhase))return;
    onUiChange({signOutPhase:'busy',signOutMessage:'Signing out…'});
    try{const result=await onSignOut();
      const failures={SIGN_OUT_FAILED:'Could not sign out. Please try again.',STALE_OWNER:'Your account changed. Please try again.',NO_AUTHORIZED_OWNER:'Sign-out is not available for this session.',IN_PROGRESS:'Sign-out is already in progress.'};
      onUiChange(result?.ok===true && result.reason==='SIGN_OUT_REQUESTED'?{signOutPhase:'awaiting',signOutMessage:'Sign-out requested. Waiting for the session to close.'}:{signOutPhase:'error',signOutMessage:result?.ok===false && typeof result.reason==='string' && Object.hasOwn(failures,result.reason)?failures[result.reason]:failures.SIGN_OUT_FAILED});
    }catch{onUiChange({signOutPhase:'error',signOutMessage:'Could not sign out. Please try again.'});}
  };
  return <main className="dashboard-tab-content" style={{overflowWrap:'anywhere'}}>
    <section className="captain-dashboard-card"><h2>Profile</h2>
      <p role="status">{!profile && ['RESOLVED','REVALIDATING'].includes(profileRead?.resolution)?messages.INVALID_BINDING:(typeof profileRead?.resolution==='string' && Object.hasOwn(messages,profileRead.resolution)?messages[profileRead.resolution]:null)??'Account details are not connected.'}</p>
      {profile?<dl>
        <dt>Captain name</dt><dd>{text(profile.displayName)}</dd>
        <dt>Boat name</dt><dd>{text(profile.boatName)}</dd>
        <dt>Email</dt><dd>{text(profile.email)}</dd>
        <dt>Access type</dt><dd>{profile.accessRole==='founder'?'Founder':'Founding captain'}</dd>
        <dt>Access status</dt><dd>{profile.accessStatus}</dd>
      </dl>:null}
      <p>Subscription, activation and expiry details are not supplied.</p>
    </section>
    {profile&&<section className="profile-information-card">
      <h3>Captain information</h3>
      {editing?<form onSubmit={event=>event.preventDefault()}>
        <label>Captain name<input style={{width:'100%',boxSizing:'border-box',minHeight:44}} type="text" value={ui.draftName??''} onChange={event=>onUiChange({draftName:event.target.value})}/></label>
        <label>Boat name<input type="text" value={ui.draftBoat??''} onChange={event=>onUiChange({draftBoat:event.target.value})}/></label>
        <p>{qaReadOnly?'Local QA is read-only. Changes have not been saved.':'Profile saving is not available. Changes have not been saved.'} Drafts remain while this workspace is open.</p>
        <button style={{minHeight:44}} type="submit" disabled>Save</button>
        <button type="button" onClick={()=>onUiChange({editing:false,draftName:null,draftBoat:null})}>Cancel</button>
      </form>:<button type="button" onClick={()=>onUiChange({editing:true,draftName:profile.displayName??'',draftBoat:profile.boatName??''})}>Edit captain details</button>}
    </section>}
    <section className="profile-information-card"><h3>Session</h3>
      <button type="button" onClick={signOut} disabled={!ownerId || typeof onSignOut!=='function' || ['busy','awaiting'].includes(ui?.signOutPhase)}>{ui?.signOutPhase==='busy'?'Signing out…':'Sign out'}</button>
      {ui?.signOutMessage&&<p role="status">{ui.signOutMessage}</p>}
    </section>
  </main>;
}
export default CaptainProfile;
