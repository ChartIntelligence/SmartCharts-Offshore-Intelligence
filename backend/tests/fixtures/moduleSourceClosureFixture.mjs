import {createHash} from 'node:crypto';
import path from 'node:path';

const sha = value => createHash('sha256').update(value).digest('hex');
function check(condition, message) { if (!condition) throw new TypeError(message); }
function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (['loc','start','end'].includes(key)) continue;
    if (Array.isArray(value)) value.forEach(n => walk(n, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}
function parser() {
  const acorn = {};
  new Function('exports','module',process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'])(acorn,{exports:acorn});
  return acorn;
}

// Test analysis only. Source strings are parsed, never imported or executed.
// A fixed module allowlist bounds discovery; unsupported relevant imports fail closed.
export function discoverModuleSourceClosure({readSource, allowedFiles, roots, entry, transportRule = null}) {
  check(typeof readSource === 'function', 'Source reader required');
  const allowed = new Set(allowedFiles), modules = new Map(), units = new Map(), hashes = {}, acorn = parser();
  for (const file of allowed) check(/^backend\/[A-Za-z0-9_./-]+\.m?js$/.test(file) && !file.split('/').some(p => ['..','tests','fixtures'].includes(p)), 'Production module allowlist required');
  function load(file) {
    check(allowed.has(file), 'Module outside bounded allowlist');
    if (modules.has(file)) return modules.get(file);
    const text = readSource(file); check(typeof text === 'string', 'Unresolved module source');
    const ast = acorn.parse(text,{ecmaVersion:'latest',sourceType:'module',locations:true});
    const module = {file,text,functions:new Map(),imports:new Map(),exports:new Map()};
    modules.set(file,module); hashes[file] = sha(text);
    for (const statement of ast.body) {
      const n = statement.declaration ?? statement;
      if (n.type === 'FunctionDeclaration') {
        const id = file + '::' + n.id.name;
        check(!module.functions.has(n.id.name), 'Ambiguous function declaration');
        module.functions.set(n.id.name,id); units.set(id,{id,file,text,n});
        if (statement.type === 'ExportNamedDeclaration') module.exports.set(n.id.name,n.id.name);
      }
      if (statement.type === 'ExportNamedDeclaration' && !statement.source) {
        for (const specifier of statement.specifiers) module.exports.set(specifier.exported.name,specifier.local.name);
        if (n.type === 'VariableDeclaration') for (const declaration of n.declarations) {
          check(declaration.id.type === 'Identifier', 'Unsupported relevant export binding');
          module.exports.set(declaration.id.name,declaration.id.name);
        }
      }
      if (statement.type !== 'ImportDeclaration') continue;
      const specifier = statement.source.value;
      const target = specifier.startsWith('.') ? path.posix.normalize(path.posix.join(path.posix.dirname(file),specifier)) : null;
      for (const spec of statement.specifiers) module.imports.set(spec.local.name,{target,exported:spec.type === 'ImportSpecifier' ? spec.imported.name : null});
    }
    return module;
  }
  for (const file of roots) load(file);
  function resolve(unit, name) {
    const module = load(unit.file);
    if (module.functions.has(name)) return module.functions.get(name);
    const binding = module.imports.get(name);
    // Existing out-of-scope imports remain explicit unresolved review obligations.
    if (!binding || !allowed.has(binding.target)) return null;
    check(binding.exported !== null, 'Unsupported relevant import form');
    const target = load(binding.target), local = target.exports.get(binding.exported);
    check(local, 'Unresolved or ambiguous imported function');
    return target.functions.get(local) ?? null;
  }
  const queue = [entry], seen = new Set(), nodes = [], edges = [], callbacks = [], memberCalls = [], unresolved = [], transportEdges = [];
  const transportBindings = new Map();
  const builtin = new Set(['Number','String','Boolean','encodeURIComponent','setTimeout','clearTimeout','fetch','structuredClone','createHash']);
  while (queue.length) {
    const id = queue.shift(); if (seen.has(id)) continue;
    check(units.has(id), 'Unresolved entry/function'); seen.add(id);
    const unit = units.get(id), {file,text,n} = unit, name = n.id.name, targets = new Set(), local = new Map();
    walk(n.body,x => {
      if (x.type === 'Identifier') { const target = resolve(unit,x.name); if (target) targets.add(target); }
      if (x.type === 'VariableDeclarator' && x.id.type === 'Identifier' && ['ArrowFunctionExpression','FunctionExpression'].includes(x.init?.type)) local.set(x.id.name,x);
      if (x.type === 'FunctionDeclaration') local.set(x.id.name,x);
    });
    walk(n.body,x => {
      if (x.type !== 'CallExpression') return;
      const c = x.callee;
      if (c.type === 'Identifier') {
        const target = resolve(unit,c.name);
        if (transportRule && target === transportRule.callee) check(id === transportRule.caller, 'Unqualified protected transport invocation');
        if (transportRule && id === transportRule.caller && target === transportRule.callee) {
          const argument = x.arguments[transportRule.index], callee = units.get(target);
          check(argument?.type === 'Identifier' && argument.name === transportRule.argument && callee.n.params[transportRule.index]?.name === transportRule.parameter, 'Unsupported protected transport binding');
          let shadowed = n.params.some(p => p.type === 'Identifier' && p.name === argument.name);
          walk(n.body, node => { if (node.type === 'VariableDeclarator' && node.id.name === argument.name) shadowed = true; });
          check(!shadowed, 'Shadowed protected transport binding');
          const supplied = resolve(unit,argument.name); check(supplied, 'Unresolved supplied transport');
          const key = target + '::' + transportRule.parameter;
          check(!transportBindings.has(key) || transportBindings.get(key) === supplied, 'Ambiguous supplied transport');
          transportBindings.set(key,supplied);
          transportEdges.push({from:id,through:target,parameter:transportRule.parameter,to:supplied,line:x.loc.start.line,resolution:'ACTUAL_STATIC_ARGUMENT_BINDING'});
        }
        const port = transportBindings.get(id + '::' + c.name);
        if (port && transportRule && id === transportRule.callee && c.name === transportRule.parameter) {
          targets.add(port);
          edges.push({from:id,to:port,resolution:'INJECTED_TRANSPORT_INVOCATION'});
        } else if (!target && !builtin.has(c.name)) {
          const binding = local.get(c.name);
          const resolution = binding ? 'STATIC_KNOWN_TARGET' : c.name === 'operation' && name === 'settleWithTiming' || c.name === 'fetchImplementation' && name === 'retrieveOceanMemoryRows' ? 'CLOSED_CURRENT_CALLBACK' : 'UNRESOLVED_DYNAMIC_TARGET';
          const item = {caller:id,target:c.name,resolution,line:binding?.loc.start.line ?? x.loc.start.line,
            bindingHash:binding ? sha(text.slice(binding.start,binding.end).replace(/\r\n/g,'\n')) : null};
          if (!callbacks.some(y => y.caller === id && y.target === c.name)) callbacks.push(item);
          if (resolution === 'UNRESOLVED_DYNAMIC_TARGET') unresolved.push(item);
        }
      } else if (c.type === 'MemberExpression') memberCalls.push({caller:id,line:x.loc.start.line,expression:text.slice(c.start,c.end),callHash:sha(text.slice(x.start,x.end).replace(/\r\n/g,'\n')),inlineCallbacks:x.arguments.filter(a => ['ArrowFunctionExpression','FunctionExpression'].includes(a.type)).map(a => ({line:a.loc.start.line,sourceHash:sha(text.slice(a.start,a.end)),normalizedSourceHash:sha(text.slice(a.start,a.end).replace(/\r\n/g,'\n'))})),status:'REQUIRES_SEMANTIC_RECEIVER_AND_EFFECT_REVIEW'});
    });
    nodes.push({id,file,function:name,line:n.loc.start.line,sourceHash:sha(text.slice(n.start,n.end)),async:n.async,qualification:'DISCOVERY_ONLY'});
    for (const target of [...targets].sort()) {
      edges.push({from:id,to:target,resolution:'SOURCE_IDENTIFIER_REFERENCE'});
      if (!seen.has(target)) queue.push(target);
    }
  }
  return {version:'pelora-default-provider-transitive-discovery-v2',entry,sourceHashes:hashes,nodes:nodes.sort((a,b) => a.id.localeCompare(b.id)),edges:edges.sort((a,b) => (a.from+a.to).localeCompare(b.from+b.to)),callbacks:callbacks.sort((a,b) => (a.caller+a.target).localeCompare(b.caller+b.target)),transportEdges,memberCalls,memberCallReview:{siteCount:memberCalls.length,inlineCallbackCount:memberCalls.reduce((total,x) => total+x.inlineCallbacks.length,0),status:'NOT_A_SEMANTIC_BRANCH_UNIVERSE',remainingEffectExamples:memberCalls.filter(x => x.inlineCallbacks.length && ['::assessSstTransitionConfidence','::getOceanConditionsAtAssessment','::buildGovernedEnvironmentalFeatureObservationV1'].some(suffix => x.caller.endsWith(suffix)))},unresolvedNamedTargets:unresolved,semanticGraphComplete:false,semanticBranchUniverseEstablished:false};
}
