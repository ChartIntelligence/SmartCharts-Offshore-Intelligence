import {endingDate, temporalGuidance} from '../utils/fishingLogTemporalCapture';

const zoneLabel = zone => ({'America/Chicago':'Central time — Chicago','America/New_York':'Eastern time — New York',
  'America/Denver':'Mountain time — Denver','America/Los_Angeles':'Pacific time — Los Angeles',
  'UTC':'UTC'}[zone] || zone.replaceAll('_',' '));

export default function FishingLogTemporalControls({report, onChange}) {
  const guidance = temporalGuidance(report);
  return <div className="report-temporal-controls">
    <fieldset>
      <legend>Ending date — optional</legend>
      <div className="report-temporal-choices">
        {[['same','Same day'],['next','Next day'],['choose','Choose date']].map(([value,label]) =>
          <button type="button" key={value} aria-pressed={report.endMode === value}
            onClick={() => onChange('endMode',value)}>{label}</button>)}
      </div>
      {report.endMode === 'choose' ? <label className="report-field"><span>Ending date</span>
        <input type="date" value={report.endDate} onChange={e => onChange('endDate',e.target.value)} /></label>
        : report.endMode && <p>Ending date: {endingDate(report)}</p>}
    </fieldset>
    <fieldset>
      <legend>Time kept aboard</legend>
      <p>Use the local time you kept aboard.</p>
      {report.basisType !== 'unknown' && <>
        <p>{report.basisConfirmed ? 'Confirmed: ' : 'Not confirmed: '}
          {report.basisType === 'iana' ? zoneLabel(report.timeZone) : `Vessel clock — UTC ${report.fixedOffset || '(offset not entered)'}`}</p>
        {!report.basisConfirmed && <button type="button"
          disabled={!(report.basisType === 'iana' ? report.timeZone : report.fixedOffset).trim()}
          onClick={() => onChange('basisConfirmed',true)}>
          {report.basisType === 'iana' ? 'Use this time zone' : 'Use this vessel clock'}</button>}
      </>}
      <details><summary>Change time kept aboard</summary>
        <label className="report-field"><span>Clock used</span>
          <select value={report.basisType} onChange={e => onChange('basisType',e.target.value)}>
            <option value="iana">Local time zone</option><option value="fixed-offset">Vessel clock — fixed UTC offset</option>
            <option value="unknown">Not sure</option>
          </select></label>
        {report.basisType === 'iana' && <label className="report-field"><span>Time zone — region/city</span>
          <input type="text" list="fishing-time-zones" value={report.timeZone} onChange={e => onChange('timeZone',e.target.value)} />
          <datalist id="fishing-time-zones">{['America/Chicago','America/New_York','America/Denver','America/Los_Angeles','UTC'].map(zone => <option key={zone} value={zone}>{zoneLabel(zone)}</option>)}</datalist>
        </label>}
        {report.basisType === 'fixed-offset' && <label className="report-field"><span>Recorded UTC offset, for example -06:00</span>
          <input type="text" value={report.fixedOffset} onChange={e => onChange('fixedOffset',e.target.value)} />
        </label>}
      </details>
      {report.basisType === 'unknown' && <p>Time kept aboard not recorded.</p>}
    </fieldset>
    <label><input type="checkbox" checked={report.timesApproximate} onChange={e => onChange('timesApproximate',e.target.checked)} /> Times approximate</label>
    {guidance && <p role="status">{guidance}</p>}
  </div>;
}
