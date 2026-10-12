import { execFileSync } from 'node:child_process';
import { existsSync,readdirSync,lstatSync,realpathSync } from 'node:fs';
import { join,resolve,relative,isAbsolute } from 'node:path';
import { assert,safeScope,covers } from './policy.mjs';
export function git(cwd,args){return execFileSync('git',args,{cwd,encoding:'utf8',windowsHide:true}).trim();}
function configured(repo,key){try{return git(repo,['config','--get',key]);}catch(e){if(e.status===1)return '';throw e;}}
export function checkHooks(repo){
  assert(!configured(repo,'core.hooksPath')&&!configured(repo,'core.fsmonitor'),'custom hooks/fsmonitor need review');
  const hooks=join(resolve(repo,git(repo,['rev-parse','--git-common-dir'])),'hooks');
  if(existsSync(hooks))assert(readdirSync(hooks).every(n=>n.endsWith('.sample')),'active hooks need review');
}
export class GitWorkspace {
  constructor(repositoryRoot,worktreeRoot){this.repo=realpathSync(repositoryRoot);this.root=realpathSync(worktreeRoot);assert(this.repo!==this.root,'dedicated worktree root required');}
  path(t){
    const target=resolve(this.root,t.worktree),rel=relative(this.root,target);assert(rel&&!rel.startsWith('..')&&!isAbsolute(rel),'worktree escaped root');
    const active=git(this.repo,['worktree','list','--porcelain','-z']).split('\0').filter(x=>x.startsWith('worktree ')).map(x=>resolve(x.slice(9)));
    for(const existing of active){const nested=relative(existing,target);assert(existing===target||nested.startsWith('..')||isAbsolute(nested),'target nested in an existing worktree');}
    if(existsSync(target))assert(!lstatSync(target).isSymbolicLink()&&realpathSync(target)===target,'junction/symlink refused');return target;
  }
  provision(t,resume=false){
    checkHooks(this.repo);assert(git(this.repo,['cat-file','-t',t.baseline])==='commit','baseline unavailable');const target=this.path(t);
    if(resume){
      assert(existsSync(target),'resume worktree missing');const m=this.metadata(t);assert(m.branch===t.branch&&m.baselineAncestor,'resume identity mismatch');
      assert(m.head===t.baseline||t.commitPolicy==='allow','unauthorized resume commit');
      assert([...m.changedFiles,...m.dirtyFiles].every(f=>t.permittedActions?.includes('write')&&t.allowedFiles.some(s=>covers(s,f))),'resume scope mismatch');return target;
    }
    assert(!existsSync(target),'existing worktree refused');assert(!git(this.repo,['for-each-ref','--format=%(refname)',`refs/heads/${t.branch}`]),'existing branch refused');
    git(this.repo,['worktree','add','-b',t.branch,target,t.baseline]);const m=this.metadata(t);assert(m.head===t.baseline&&m.clean&&m.branch===t.branch,'new worktree verification failed');return target;
  }
  metadata(t){
    const target=this.path(t);assert(realpathSync(git(target,['rev-parse','--show-toplevel']))===realpathSync(target),'wrong worktree');
    assert(realpathSync(resolve(target,git(target,['rev-parse','--git-common-dir'])))===realpathSync(resolve(this.repo,git(this.repo,['rev-parse','--git-common-dir']))),'wrong repository');
    let ancestor=false;try{git(target,['merge-base','--is-ancestor',t.baseline,'HEAD']);ancestor=true;}catch(e){if(e.status!==1)throw e;}
    const changed=execFileSync('git',['diff','--name-only','-z',t.baseline,'HEAD'],{cwd:target,encoding:'utf8',windowsHide:true}).split('\0').filter(Boolean);assert(changed.every(safeScope),'unsafe changed path');
    const status=execFileSync('git',['status','--porcelain=v1','-z'],{cwd:target,encoding:'utf8',windowsHide:true}).split('\0').filter(Boolean),dirty=[];
    for(let i=0;i<status.length;i++){const entry=status[i];dirty.push(entry.slice(3));if(/[RC]/.test(entry.slice(0,2)))dirty.push(status[++i]);}
    assert(dirty.every(safeScope),'unsafe dirty path');
    return {branch:git(target,['branch','--show-current']),head:git(target,['rev-parse','HEAD']),baseline:t.baseline,baselineAncestor:ancestor,clean:status.length===0,changedFiles:changed,dirtyFiles:dirty};
  }
  governance(t,paths){return Object.fromEntries(paths.map(p=>[p,git(this.path(t),['show',`${t.baseline}:${p}`])]));}
  remoteHead(t){const lines=git(this.repo,['ls-remote','--heads','origin',`refs/heads/${t.branch}`]).split(/\r?\n/).filter(Boolean);assert(lines.length===1&&lines[0].split(/\s+/)[1]===`refs/heads/${t.branch}`,'remote branch unavailable');return lines[0].split(/\s+/)[0];}
}
