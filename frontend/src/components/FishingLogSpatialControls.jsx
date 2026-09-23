import {useRef, useState} from 'react';
import {addManualLocation, emptyLocationDraft} from '../utils/fishingLogSpatialCapture';

export default function FishingLogSpatialControls({draft, setDraft, locations, onAdd, onRemove, latitudeRef, disabled}) {
  const longitudeRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const update = (field, value) => {
    setDraft({...draft, [field]:value});
    setErrors({}); setStatus('');
  };
  const add = () => {
    const result = addManualLocation(draft);
    setErrors(result.errors); setStatus('');
    if (!result.location) {
      if (result.errors.latitude) latitudeRef.current?.focus();
      else if (result.errors.longitude) longitudeRef.current?.focus();
      return;
    }
    onAdd(result.location); setDraft(emptyLocationDraft());
    setStatus('Location added.'); latitudeRef.current?.focus();
  };
  return <div className="report-spatial-controls">
    <p>Add a position where you fished or made observations.</p>
    <p id="coordinate-format">Use decimal degrees, for example 29.12345, -87.54321.</p>
    <fieldset disabled={disabled} className="report-coordinate-editor">
      <legend className="report-coordinate-legend">Add a location</legend>
      <div className="report-form-grid">
        {['latitude','longitude'].map(field => <label className="report-field" key={field}>
          <span>{field === 'latitude' ? 'Latitude' : 'Longitude'}</span>
          <input ref={field === 'latitude' ? latitudeRef : longitudeRef} type="text" inputMode="text"
            autoComplete="off" autoCapitalize="none" spellCheck={false}
            enterKeyHint={field === 'latitude' ? 'next' : 'done'}
            placeholder={field === 'latitude' ? '29.12345' : '-87.54321'}
            value={draft[field]} onChange={event => update(field,event.target.value)}
            aria-invalid={Boolean(errors[field])}
            aria-describedby={`coordinate-format${errors[field] ? ` coordinate-${field}-error` : ''}`} />
          {errors[field] && <span id={`coordinate-${field}-error`} role="alert">{errors[field]}</span>}
        </label>)}
      </div>
      <fieldset className="report-position-choices">
        <legend>Position — optional</legend>
        {[['exact-as-reported','Position as recorded'],['approximate','Approximate location'],['unknown','Not sure']].map(([value,label]) =>
          <label key={value}><input type="radio" name="location-position" value={value}
            checked={draft.certainty === value} onChange={() => update('certainty',value)} />{label}</label>)}
      </fieldset>
      <label className="report-field"><span>Location name — optional</span>
        <input type="text" value={draft.label} onChange={event => update('label',event.target.value)} />
      </label>
      <button type="button" className="report-add-location" onClick={add}>Add Location</button>
    </fieldset>
    <p role="status" aria-live="polite">{status}</p>
    {locations.length > 0 && <div className="report-location-list"><h4>Added locations</h4>
      {locations.map((location,index) => <div className="report-location-card" key={location.locationEntryId || index}>
        <div>{location.label && <strong>{location.label}</strong>}
          <div>{location.latitude}, {location.longitude}</div>
          {location.certainty === 'approximate' && <div>Approximate location</div>}
        </div>
        <button type="button" disabled={disabled} onClick={() => onRemove(location)}
          aria-label={`Remove ${location.label || 'location'}: ${location.latitude}, ${location.longitude}`}>Remove</button>
      </div>)}
    </div>}
  </div>;
}
