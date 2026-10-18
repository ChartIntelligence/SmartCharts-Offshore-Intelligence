import {founderHttpsProfile,validatePreviewPublicKey} from '../../../shared/founderHttpsPreview.mjs';
const environment=()=>import.meta.env??{};
const origin=()=>globalThis.window?.location?.origin;
export function founderPreviewConfiguration(env=environment(),site=origin()){
 const profile=founderHttpsProfile(env,site);
 if(!profile)return null;
 validatePreviewPublicKey(env.VITE_SUPABASE_PUBLISHABLE_KEY,value=>atob(value.replaceAll('-','+').replaceAll('_','/')));
 return profile;
}
export function founderPreviewSession(session,configuration){
 if(!configuration)return session;
 return session?.user?.is_anonymous===false&&typeof session.user.id==='string'&&session.user.id.trim()&&typeof session.access_token==='string'&&session.access_token.trim()?session:null;
}
export function founderPreviewSignInOptions(email,configuration){
 if(!configuration||typeof email!=='string'||!email.trim()||!email.includes('@'))throw new Error('Preview sign-in denied');
 return {email:email.trim().toLowerCase(),options:{shouldCreateUser:false,emailRedirectTo:configuration.frontend+'/?app=1'}};
}
