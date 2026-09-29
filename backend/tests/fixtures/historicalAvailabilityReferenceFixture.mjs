// TEST-ONLY conceptual availability oracle. No production selector, issuer or storage.
import {detached,exactJson} from '../../exactScientificEvidence.mjs';
import {keys,check,reference,utc,freeze,hash} from '../../../shared/oceanPublication.mjs';
import {requireScientificAssessmentV1} from '../../scientificAssessment.mjs';
export {captureFixture} from './currentEvidenceCaptureFixture.mjs';
export {at,context,frame,observation,publication} from './temporalEvidenceFixture.mjs';
export const contract='pelora-historical-availability-reference-v1';
export function witnessedFixture(evidenceReference,receivedAt,event='synthetic-event') {
 const authorityReference={kind:'captured',referenceId:event,contractVersion:'synthetic-receipt-witness-v1',sha256:hash([evidenceReference,receivedAt,event])};
 const record=freeze({contractVersion:contract,evidenceReference:detached(evidenceReference),receivedAt:utc(receivedAt),authorityReference});
 // TRUST ASSUMPTION: this map stands for an independently governed server event witness.
 // Its presence is stipulated by the test, not derived from a claimant's digest.
 const witnesses=new Map([[exactJson(authorityReference),exactJson(record)]]);
 return {record,witnesses};
}
// Precondition in these tests: expectedReference comes from the existing typed
// evidence validator. Wire-shape validation alone never resolves scientific bytes.
export function conceptualAvailability(record,expectedReference,assessment,witnesses){
 const r=detached(record),expected=detached(expectedReference),a=requireScientificAssessmentV1(assessment);
 keys(r,['contractVersion','evidenceReference','receivedAt','authorityReference']);check(r.contractVersion===contract);
 reference(r.evidenceReference);reference(r.authorityReference);reference(expected);
 check(exactJson(r.evidenceReference)===exactJson(expected));r.receivedAt=utc(r.receivedAt);
 check(witnesses.get(exactJson(r.authorityReference))===exactJson(r));
 return Date.parse(r.receivedAt)<=Date.parse(a.assessmentAt);
}
export function metadataReference(record){return freeze({kind:'captured',referenceId:'availability-'+hash(record),contractVersion:contract,sha256:hash(record)});}
