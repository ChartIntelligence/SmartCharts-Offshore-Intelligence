// Offline compatibility build only. Synthetic public configuration, never deploy this artifact.
import {readFile,writeFile,mkdir,symlink,readdir} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import http from 'node:http';import https from 'node:https';import net from 'node:net';
import {syncBuiltinESMExports} from 'node:module';
import {PREVIEW_API,PREVIEW_PROJECT,PREVIEW_FRONTEND} from '../../shared/founderHttpsPreview.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const repo=fileURLToPath(new URL('../..',import.meta.url));
const [commit,outputRoot,dependencyRoot]=process.argv.slice(2);
if(!/^[a-f0-9]{40}$/.test(commit??'')||!outputRoot||!dependencyRoot)throw Error('Exact reviewed build arguments required');
const git=args=>execFileSync('git',args,{cwd:repo,maxBuffer:100*1024*1024});
if(git(['rev-parse','HEAD']).toString().trim()!==commit||git(['status','--porcelain']).toString().trim())throw Error('Build requires clean exact candidate');
git(['merge-base','--is-ancestor','09dfac11ccbf992b8eea7dd36dfe1cd4e8ac7972',commit]);
await mkdir(outputRoot,{recursive:false});
const source=[];
for(const entry of git(['ls-tree','-rz',commit]).toString().split('\0').filter(Boolean)){
 const [meta,name]=entry.split('\t'),[mode,type,blob]=meta.split(' ');
 if(name.split('/').includes('node_modules')||path.basename(name).startsWith('.env'))continue;
 if(type!=='blob'||mode==='120000'||name.split('/').includes('..'))throw Error('Unsupported source entry');
 const bytes=git(['cat-file','blob',blob]);const dest=path.join(outputRoot,'source',name);
 await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,bytes,{flag:'wx'});source.push({path:name,blob,sha256:sha(bytes)});
}
const lock=JSON.parse(await readFile(path.join(outputRoot,'source/frontend/package-lock.json'),'utf8'));
const installed=JSON.parse(await readFile(path.join(dependencyRoot,'.package-lock.json'),'utf8'));let dependencyRecords=0;
for(const [name,want]of Object.entries(lock.packages??{})){
 if(!name.startsWith('node_modules/'))continue;const actual=installed.packages?.[name];
 if(!actual){if(want.optional)continue;throw Error('Dependency missing');}
 if(actual.version!==want.version||(want.integrity&&want.integrity!==actual.integrity))throw Error('Dependency lock mismatch');
 const pkg=JSON.parse(await readFile(path.join(dependencyRoot,name.slice(13),'package.json'),'utf8'));if(pkg.version!==want.version)throw Error('Installed dependency mismatch');dependencyRecords++;
}
if(!dependencyRecords)throw Error('Dependency verification empty');
await symlink(dependencyRoot,path.join(outputRoot,'source/frontend/node_modules'),'junction');
await symlink(dependencyRoot,path.join(outputRoot,'source/node_modules'),'junction');
const safe=new Set(['SystemRoot','WINDIR','PATH','Path','TEMP','TMP','COMSPEC','ComSpec','SystemDrive','PATHEXT']);
for(const key of Object.keys(process.env))if(!safe.has(key))delete process.env[key];
Object.assign(process.env,{VITE_PELORA_FOUNDER_HTTPS_PREVIEW:'1',VITE_PELORA_LOCAL_QA_READ_ONLY:'1',VITE_SUPABASE_URL:PREVIEW_PROJECT,VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_SYNTHETIC_BUILD_ONLY',VITE_PELORA_API_BASE:PREVIEW_API});
let blockedNetworkCalls=0;const deny=()=>{blockedNetworkCalls++;throw Error('Offline build network denied');};
globalThis.fetch=deny;http.request=deny;http.get=deny;https.request=deny;https.get=deny;net.Socket.prototype.connect=deny;syncBuiltinESMExports();
const {build}=await import(pathToFileURL(path.join(dependencyRoot,'vite/dist/node/index.js')).href);
const warnings=[];
await build({root:path.join(outputRoot,'source/frontend'),configFile:path.join(outputRoot,'source/frontend/vite.config.js'),configLoader:'runner',envDir:false,cacheDir:path.join(outputRoot,'cache'),customLogger:{info(){},warn(message){warnings.push(message);},warnOnce(message){warnings.push(message);},error(message){throw Error(message);},clearScreen(){},hasErrorLogged(){return false;},hasWarned:false},build:{outDir:path.join(outputRoot,'dist'),emptyOutDir:false,sourcemap:false}});
for(const f of source)if(sha(await readFile(path.join(outputRoot,'source',f.path)))!==f.sha256)throw Error('Source changed');
async function artifacts(dir,prefix=''){const result=[];for(const e of await readdir(dir,{withFileTypes:true})){const name=path.posix.join(prefix,e.name);if(e.isDirectory())result.push(...await artifacts(path.join(dir,e.name),name));else if(e.isFile())result.push({path:name,sha256:sha(await readFile(path.join(dir,e.name)))});else throw Error('Unsupported artifact');}return result;}
const record={candidate:commit,base:'09dfac11ccbf992b8eea7dd36dfe1cd4e8ac7972',sourceFiles:source.length,dependencyRecords,dependencyLimit:'Versions and recorded lock integrity matched, not a complete installed-tree audit',frontend:PREVIEW_FRONTEND,api:PREVIEW_API,project:PREVIEW_PROJECT,syntheticConfiguration:true,deployable:false,realSdk:true,environmentFilesLoaded:false,blockedNetworkCalls,serviceStarted:false,buildExit:0,warnings,driverSHA256:sha(await readFile(fileURLToPath(import.meta.url))),artifacts:await artifacts(path.join(outputRoot,'dist'))};
await writeFile(path.join(outputRoot,'source-fingerprints.json'),JSON.stringify(source,null,2)+'\n',{flag:'wx'});
await writeFile(path.join(outputRoot,'build-provenance.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({...record,artifacts:record.artifacts.length}));
