// Private display projection only. It never grants access or performs an operation.
export function captainProfileRead({principalId,user,access}) {
  const result=(resolution,profile=null)=>Object.freeze({contractVersion:'pelora-private-account-profile-read-v1',resolution,profile,entitlementState:'NOT_SUPPLIED'});
  const plain=value=>value&&[Object.prototype,null].includes(Object.getPrototypeOf(value));
  const own=(value,key)=>{const d=Object.getOwnPropertyDescriptor(value,key);if(d&&!('value' in d))throw Error('accessor');return d?.value;};
  if(principalId==null)return result('NO_AUTHORIZED_OWNER');
  if(typeof principalId!=='string'||principalId.trim().length===0)return result('INVALID_BINDING');
  try {
    if(!plain(user)||own(user,'id')!==principalId||own(user,'is_anonymous')===true)return result('INVALID_BINDING');
    if(!access)return result('LOADING');
    if(!plain(access)||own(access,'principalId')!==principalId)return result('INVALID_BINDING');
    const state=own(access,'status');
    if(state==='error')return result('READ_UNAVAILABLE');
    if(!['pending','complete'].includes(state))return result('INVALID_BINDING');
    const row=own(access,'record');
    if(!row)return result(state==='pending'?'LOADING':'MISSING');
    if(!plain(row)||own(row,'user_id')!==principalId)return result('INVALID_BINDING');
    const role=own(row,'access_role'),status=own(row,'access_status');
    if(!['founder','founding_captain'].includes(role)||!['approved','pending','revoked'].includes(status))return result('INVALID_BINDING');
    const text=(obj,key)=>{const value=own(obj,key);if(value==null)return null;if(typeof value!=='string')throw Error('invalid-text');return value;};
    const profile=Object.freeze({ownerId:principalId,email:text(user,'email'),displayName:text(row,'display_name'),boatName:text(row,'boat_name'),accessRole:role,accessStatus:status});
    return result(state==='pending'?'REVALIDATING':'RESOLVED',profile);
  } catch {return result('INVALID_BINDING');}
}
