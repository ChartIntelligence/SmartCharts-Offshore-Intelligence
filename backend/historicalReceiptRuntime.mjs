// Availability prerequisite only. No scientific consumer/selection integration.
import {copy,freeze,keys,check,hash,reference,utc} from '../shared/oceanPublication.mjs';
import {exactJson,MAX_EXACT_CAPTURE_BYTES} from './exactScientificEvidence.mjs';
import {CURRENT_EVIDENCE_CAPTURE_V3,readCurrentEvidenceCaptureV3,validateCurrentCaptureReferenceV3} from './currentEvidenceCaptureV3.mjs';
import {SOURCE_NORMALIZATION_DESCRIPTOR,SOURCE_NORMALIZATION_REFERENCE} from './sourceNormalization.mjs';
import {createReceiptConnection} from './historicalReceiptConnection.mjs';

export const HISTORICAL_AVAILABILITY_CONTRACT='pelora-historical-availability-reference-v1';
export const RECEIPT_AUTHORITY='pelora-receipt-writer-v1';
const WITNESS_VERSION='pelora-historical-receipt-witness-v1';
const policy=freeze({contractVersion:RECEIPT_AUTHORITY,receiptContractVersion:HISTORICAL_AVAILABILITY_CONTRACT,
  event:'validated-exact-current-v3-and-dependency-closure-possessed',clock:'trusted-backend-utc',
  storage:'private-append-only-atomic-envelope-v1'});
const policyReference=freeze({kind:'captured',contractVersion:RECEIPT_AUTHORITY,referenceId:RECEIPT_AUTHORITY,sha256:hash(policy)});
const same=(a,b)=>exactJson(a)===exactJson(b);
const unknown=()=>Object.freeze({status:'AS_OF_AUTHORITY_UNKNOWN'});
const invalid=()=>Object.freeze({status:'INVALID_REFERENCE'});
const key=r=>[r.kind,r.contractVersion,r.referenceId,r.sha256];

function currentReference(input) {
  const r=copy(input);reference(r);
  check(r.kind==='captured' && r.contractVersion===CURRENT_EVIDENCE_CAPTURE_V3 && /^cec3-[a-f0-9]{64}$/.test(r.referenceId));
  return r;
}
function captureClosure(input) {
  const p=copy(input);keys(p,['family','evidenceReference','captureText']);
  check(p.family==='CURRENTS');
  const c=readCurrentEvidenceCaptureV3(p.captureText);
  const evidenceReference=validateCurrentCaptureReferenceV3(p.evidenceReference,c);
  check(same(c.lineageReferences,[SOURCE_NORMALIZATION_REFERENCE]));
  // Initial admission is the qualified live current boundary, not arbitrary
  // captures with unresolved source/lineage reference dependencies.
  check(c.sourceAuthority.status==='RECORDED_NOT_REQUALIFIED');
  const center=c.samples.find(s=>s.role==='center');check(center?.outcome==='FULFILLED');
  const {provider,dataset,classification}=center.point.source;
  const source={provider,dataset,classification};
  const sourceReference={kind:'captured',referenceId:'recorded-current-source-'+hash(source),
    contractVersion:'pelora-recorded-current-source-metadata-v1',sha256:hash(source)};
  check(same(sourceReference,c.sourceAuthority.reference));
  return {evidenceReference,captureText:p.captureText,dependencies:[
    {reference:SOURCE_NORMALIZATION_REFERENCE,text:JSON.stringify(SOURCE_NORMALIZATION_DESCRIPTOR)},
    {reference:sourceReference,text:exactJson(source)}
  ]};
}
function envelope(closure,receivedAt) {
  const authorityTarget={contractVersion:WITNESS_VERSION,evidenceReference:closure.evidenceReference,
    receivedAt:utc(receivedAt),issuerPolicyReference:policyReference};
  const authorityReference={kind:'captured',contractVersion:WITNESS_VERSION,
    referenceId:'receipt-'+hash(authorityTarget),sha256:hash(authorityTarget)};
  return freeze({record:{contractVersion:HISTORICAL_AVAILABILITY_CONTRACT,
    evidenceReference:closure.evidenceReference,receivedAt:authorityTarget.receivedAt,authorityReference},
    captureText:closure.captureText,dependencies:closure.dependencies,authorityTarget,issuerPolicy:policy});
}
function readEnvelope(text,expected) {
  check(typeof text==='string' && Buffer.byteLength(text)<=MAX_EXACT_CAPTURE_BYTES*2);
  const e=copy(JSON.parse(text));keys(e,['record','captureText','dependencies','authorityTarget','issuerPolicy']);
  keys(e.record,['contractVersion','evidenceReference','receivedAt','authorityReference']);
  check(same(e.record.evidenceReference,expected));
  const closure=captureClosure({family:'CURRENTS',evidenceReference:expected,captureText:e.captureText});
  const validated=envelope(closure,e.record.receivedAt);
  check(exactJson(validated)===text); // also binds policy, target, version and closure
  return validated;
}

function runtime({connection,clock}) {
  return Object.freeze({
    async issue(input) {
      let closure,candidate,text;
      try {
        closure=captureClosure(input); // no caller receipt/authority/time fields
        candidate=envelope(closure,clock()); // one trusted sample after validation
        text=exactJson(candidate);check(Buffer.byteLength(text)<=MAX_EXACT_CAPTURE_BYTES*2);
      } catch { return invalid(); }
      try {
        const r=candidate.record,a=r.authorityReference;
        const inserted=await connection.execute('insert',[...key(r.evidenceReference),r.contractVersion,r.receivedAt,a.referenceId,a.sha256,text]);
        if (!inserted.ok) return unknown();
        // Separate statement/fresh READ COMMITTED snapshot for a concurrent winner.
        const response=inserted.rows.length?inserted:await connection.execute('read',key(r.evidenceReference));
        if (!response.ok || response.rows.length!==1) return unknown();
        const accepted=readEnvelope(response.rows[0].envelopeText,r.evidenceReference);
        check(accepted.captureText===closure.captureText && same(accepted.dependencies,closure.dependencies));
        return freeze({status:'RECEIPT_ACCEPTED',record:accepted.record});
      } catch { return unknown(); } // includes uncertain commit; never fabricate success
    },
    async resolve(evidenceReference,assessmentAt) {
      let r,at;
      try {r=currentReference(evidenceReference);at=utc(assessmentAt);} catch {return invalid();}
      try {
        const result=await connection.execute('read',key(r));
        if (!result.ok || result.rows.length===0) return unknown();
        check(result.rows.length===1);
        const accepted=readEnvelope(result.rows[0].envelopeText,r);
        return freeze({status:Date.parse(accepted.record.receivedAt)<=Date.parse(at)?
          'AVAILABLE_BY_ASSESSMENT':'NOT_RECEIVED_BY_ASSESSMENT',record:accepted.record});
      } catch {return unknown();}
    },
    close:()=>connection.close()
  });
}

// Internal server composition only; no HTTP route and no captain storage adapter.
export function createHistoricalReceiptRuntime() {
  return runtime({connection:createReceiptConnection(),clock:()=>new Date().toISOString()});
}
// Explicit offline seam. This is not a production witness authority by itself.
export function createHistoricalReceiptRuntimeForTests(dependencies) {return runtime(dependencies);}
