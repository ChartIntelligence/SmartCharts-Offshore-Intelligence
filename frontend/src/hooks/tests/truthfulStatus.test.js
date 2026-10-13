// Existing actual-child continuity assertions with the new navigation adapter.
import {readFileSync} from 'node:fs';
const original=new URL('./captainContinuity.test.js',import.meta.url);
let source=readFileSync(original,'utf8')
 .replace(".replace(/export function /g",".replace(/export async function /g,'async function ').replace(/export function /g")
 .replace("const common={...continuity","const shellNavigation=await import("+JSON.stringify(new URL('../../utils/shellNavigation.js',new URL('./captainContinuity.test.js',import.meta.url)).href)+");const common={useShellNavigation:compile('../useShellNavigation.js','useShellNavigation',{...shellNavigation,window:browserWindow}),...continuity")
 .replace('const common={useShellNavigation:',"const qaPolicy=await import("+JSON.stringify(new URL('../../utils/localQaReadOnly.js',original).href)+");let qaEnvironment={};const qaGuard={localQaReadOnly:()=>qaPolicy.localQaReadOnly(qaEnvironment),assertLocalQaWriteAllowed:()=>qaPolicy.assertLocalQaWriteAllowed(qaEnvironment)};const common={...qaGuard,useShellNavigation:")
 .replace('...scope,structures:[place]',"...scope,PersistentMapShell:compile('../../components/PersistentMapShell.jsx','PersistentMapShell',{...scope,ShellOverlay:compile('../../components/PersistentMapShell.jsx','ShellOverlay',scope)}),structures:[place]")
 .replaceAll('await act(async()=>seen.Today.setReportPanelOpen(true))',"await click('+ Log Fishing Day')")
 .replaceAll("click('Home')","click('Top Opportunities')")
 .replaceAll("click('Map')","click('Focus ocean');await click('Restore map controls')")
 .replace('seen.Today.setSelectedOpportunity(seen.Today.topOpportunities[0])','seen.MapLibreIntelligenceMap.setSelectedOpportunity(seen.MapLibreIntelligenceMap.openWaterOpportunities[0])')
 .replace('async report(){await act(async()=>seen.Today.setReportPanelOpen(true));}',"async report(){await click('+ Log Fishing Day');}")
 .replace(/import\((['"])(\.\.?\/[^'"]+)\1\)/g,(_,q,path)=>'import('+JSON.stringify(new URL(path,original).href)+')')
 .replaceAll('import.meta.url',JSON.stringify(original.href))
 .replace(/from (['"])([^'"]+)\1/g,(_,quote,path)=>'from '+JSON.stringify(path.startsWith('.')?new URL(path,original).href:path));
source+=readFileSync(new URL('./localQaReadOnlyAssertions.fixture.js',import.meta.url),'utf8');
source+=readFileSync(new URL('./fieldSessionCallerAssertions.fixture.js',import.meta.url),'utf8');
source+="for(const id of ['A','B'])test('actual Profile omits unsupported authority '+id,async()=>{qaEnvironment={};const h=await workspace(new Storage(),id);try{await click('Profile');assert.match(h.container.textContent,/Account roles, status and subscription details are not supplied/);assert.doesNotMatch(h.container.textContent,/Tournament Alpha|Alpha Captain|Founding Access/);assert.equal(h.errors.length,0);}finally{await h.close();}});";
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
