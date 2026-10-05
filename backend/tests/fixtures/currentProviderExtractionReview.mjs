import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {declarationSource} from './sourceDeclarationFixture.mjs';

export const extractionContract = JSON.parse(readFileSync(new URL('../../../docs/Current_Provider_Extraction_Graphs_v1.json',import.meta.url)));
const sha = s => createHash('sha256').update(s).digest('hex');
const lf = s => s.replace(/\r\n/g,'\n');
const sorted = xs => xs.map(x=>JSON.stringify(x)).sort();
export function verifyExtractionGraph(graph, sources) {
  const {baseline, candidate, correspondence, sourceProofs} = extractionContract;
  assert.equal(graph.semanticGraphComplete,false);
  assert.equal(graph.semanticBranchUniverseEstablished,false);
  for (const name of ['getOceanConditionsAtAssessment','getSstSpatialStructureAtAssessment','getChlorophyllConditionsAtAssessment','getCurrentConditionsPointAtAssessment','getMarineConditions','buildObservationSnapshot']) assert(graph.nodes.some(n=>n.function===name));
  assert(graph.memberCallReview.remainingEffectExamples.some(x=>x.inlineCallbacks.length));
  // This version is deliberately exact to the reviewed extraction, not a general
  // semantic equivalence oracle. New source/edges/effects require fresh review.
  assert.deepEqual(graph,candidate,'Unreviewed source, node, edge, callback, transport or member-effect delta');
  const relocated = new Map(correspondence.relocated.map(x=>[x.before.id,x.after.id]));
  const map = id => relocated.get(id) ?? id;
  for (const node of baseline.nodes) {
    const after=graph.nodes.find(x=>x.id===map(node.id));
    assert(after,'Missing baseline declaration');
    if (!relocated.has(node.id) && node.id!==correspondence.replaced) assert.equal(after.sourceHash,node.sourceHash);
  }
  const beforeEdges=baseline.edges.map(e=>({...e,from:map(e.from),to:map(e.to)}));
  const beforeSet=new Set(sorted(beforeEdges)),afterSet=new Set(sorted(graph.edges));
  assert.deepEqual([...beforeSet].filter(x=>!afterSet.has(x)).sort(),sorted(correspondence.removedEdges));
  assert.deepEqual([...afterSet].filter(x=>!beforeSet.has(x)).sort(),sorted(correspondence.addedEdges));
  const callback = (x, before) => ({caller:before && x.caller===correspondence.replaced ? 'backend/currentProviderAdapter.mjs::parseCurrentProviderResponse' : before ? map(x.caller) : x.caller,target:x.target,resolution:x.resolution,bindingHash:x.bindingHash});
  assert.deepEqual(sorted(baseline.callbacks.map(x=>callback(x,true))),sorted(graph.callbacks.map(x=>callback(x,false))));
  assert.deepEqual(sorted(baseline.unresolvedNamedTargets.map(x=>callback(x,true))),sorted(graph.unresolvedNamedTargets.map(x=>callback(x,false))),'No new unresolved target may become baseline debt');
  for(const proof of sourceProofs.relocatedAndAge){
    assert.equal(sha(lf(declarationSource(sources['backend/currentProviderAdapter.mjs'],proof.name))),proof.baselineNormalizedHash,'Relocated helper body changed');
  }
  const parser=lf(declarationSource(sources['backend/currentProviderAdapter.mjs'],'parseCurrentProviderResponse'));
  assert.equal(sha(parser.slice(parser.indexOf('  const columns ='))),sourceProofs.parserTailHash,'Parser/no-valid-pixel/availability block changed');
  const delegate=lf(declarationSource(sources['backend/server.js'],'getCurrentConditionsPointAtAssessment'));
  assert.equal(delegate,sourceProofs.delegate,'Interactive LATEST/delegation changed');
  assert.deepEqual(graph.transportEdges.map(({line: _line,...x})=>x),[{
    from:correspondence.replaced,through:'backend/currentProviderAdapter.mjs::acquireCurrentProviderPoint',parameter:'transport',to:'backend/server.js::fetchJson',resolution:'ACTUAL_STATIC_ARGUMENT_BINDING'
  }]);
  return {scope:'BOUNDED_BASELINE_RELATIVE_EXTRACTION_ONLY',unresolvedObligations:graph.unresolvedNamedTargets.length};
}
