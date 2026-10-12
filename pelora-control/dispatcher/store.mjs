import { mkdirSync,readFileSync,writeFileSync,renameSync,rmSync,existsSync,openSync,fsyncSync,closeSync,lstatSync } from 'node:fs';
import { join,resolve } from 'node:path';
import { initialState } from './core.mjs';
import { assert } from './policy.mjs';
export class Store {
  constructor(directory){this.directory=resolve(directory);}
  transaction(fn){
    mkdirSync(this.directory,{recursive:true});assert(!lstatSync(this.directory).isSymbolicLink(),'symlink status directory refused');
    const lock=join(this.directory,'controller.lock');try{mkdirSync(lock);}catch{throw new Error('controller busy/interrupted; reconcile lock manually');}
    try{
      writeFileSync(join(lock,'owner.json'),JSON.stringify({pid:process.pid,at:new Date().toISOString()}));
      const path=join(this.directory,'status.json'),s=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):initialState();
      const result=fn(s);assert(!(result instanceof Promise),'synchronous transactions only');
      const tmp=join(this.directory,'status.json.tmp'),fd=openSync(tmp,'w');
      try{writeFileSync(fd,JSON.stringify(s,null,2)+'\n');fsyncSync(fd);}finally{closeSync(fd);}renameSync(tmp,path);return result;
    }finally{rmSync(lock,{recursive:true});}
  }
}
