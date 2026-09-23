import {buildFishingLogEvidenceCaptureV1, projectFishingLogLegacyFieldsV1,
  interpretFishingLogEvidenceCaptureV1} from '../../../shared/fishingLogEvidenceCapture.mjs';

export function localCalendarDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function createTemporalDraft(now = new Date(), zone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  return {date:localCalendarDate(now), linesIn:'', linesOut:'', endMode:'', endDate:'',
    basisType:zone ? 'iana' : 'unknown', timeZone:zone || '', fixedOffset:'', basisConfirmed:false, timesApproximate:false};
}

export function updateTemporalDraft(current, field, value) {
  const renew = ['date','endMode','endDate','basisType','timeZone','fixedOffset'].includes(field) && current[field] !== value;
  return {...current, [field]:value, ...(renew ? {basisConfirmed:false} : {})};
}

export function endingDate(report) {
  if (report.endMode === 'same') return report.date;
  if (report.endMode === 'choose') return report.endDate;
  if (report.endMode !== 'next' || !report.date) return '';
  // Calendar arithmetic only; UTC is a neutral arithmetic carrier, not a trip basis.
  const date = new Date(`${report.date}T00:00:00Z`);
  if (!Number.isFinite(date.getTime())) return '';
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0,10);
}

export function captureReportTime(report) {
  const timeBasis = report.basisType === 'iana'
    ? {type:'iana',timeZone:report.timeZone,confirmation:report.basisConfirmed ? 'captain-confirmed' : 'suggested'}
    : report.basisType === 'fixed-offset'
      ? {type:'fixed-offset',offset:report.fixedOffset,confirmation:report.basisConfirmed ? 'captain-confirmed' : 'suggested'} : {};
  return buildFishingLogEvidenceCaptureV1({temporal:{
    start:{date:report.date,time:report.linesIn || null},
    end:{date:endingDate(report) || null,time:report.linesOut || null},
    quality:report.timesApproximate ? 'approximate' : 'bounded', timeBasis
  }, locations:report.fishingLocations || []});
}

export function temporalGuidance(report) {
  const evidence = interpretFishingLogEvidenceCaptureV1(captureReportTime(report)).temporalEvidence;
  const codes = evidence.reasons.map(reason => reason.code);
  if (codes.some(code => ['interval-empty','interval-reversed'].includes(code))) return 'Check the ending date and recorded times.';
  if (codes.some(code => ['local-time-ambiguous','local-time-nonexistent','local-time-unresolvable','local-date-or-time-invalid'].includes(code))) return 'Check the recorded time and the time kept aboard. You can still save the day as recorded.';
  if (codes.some(code => ['fixed-offset-invalid','time-basis-invalid','time-basis-conflicting-fields'].includes(code))) return 'Check the time kept aboard. You can still save the day as recorded.';
  if (!report.linesIn || !report.linesOut) return 'Time not recorded. You can save the fishing day without adding times.';
  if (!endingDate(report)) return 'Add an ending date if you know it. You can still save the day.';
  if (!report.basisConfirmed || report.basisType === 'unknown') return 'Time zone not confirmed. You can still save the day.';
  return report.timesApproximate ? 'Times will be kept as approximate.' : '';
}

export async function insertReportWithTime(client, row, report) {
  const evidence_capture = captureReportTime(report);
  const payload = {...row, ...projectFishingLogLegacyFieldsV1(evidence_capture), evidence_capture};
  const {data,error} = await client.from('fishing_day_reports').insert(payload).select().single();
  if (error) throw error; // Never retry without the source envelope.
  return data;
}
