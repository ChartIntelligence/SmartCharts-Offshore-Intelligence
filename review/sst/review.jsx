import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import MapLibreIntelligenceMap from '../../frontend/src/components/MapLibreIntelligenceMap.jsx';
import {SST_RAMP, kelvinToFahrenheit} from '../../frontend/src/utils/syntheticSstDisplay.js';
import '../../frontend/src/styles/dashboard.css';
import './review.css';

const layers = {locations: true, bathymetry: false, currentField: false, temperatureTransition: false};
const noop = () => {};
const observations = {geoJson: {type: 'FeatureCollection', features: []}, counts: {}};
// Marker contrast fixture only: no evaluation, eligibility, score or real opportunity.
const markerFixtures = [{id: 'synthetic-marker-only', name: 'SYNTHETIC marker contrast fixture', coordinates: [-89.5, 26.5], dynamicOpportunity: {rank: 1}}];
function Review() {
  const [enabled, setEnabled] = useState(true), [state, setState] = useState({status: 'loading'});
  const [spot, setSpot] = useState(null);
  const review = useMemo(() => ({enabled, onMap: map => { window.sstReviewMap = map; }, onState: setState, request: async (bbox, signal) => {
    const q = new URLSearchParams({mode: 'scalar', layer: 'synthetic-sst', evidence: 'synthetic-day-v1', component: 'temperature', bbox: bbox.join(','), strideX: '1', strideY: '1'});
    const r = await fetch(`/review-api/scalar?${q}`, {signal});
    const body = await r.json(); if (!r.ok) throw Error(body.status); return body;
  }}), [enabled]);
  const f = enabled ? state.field : null;
  return <main className="sst-review">
    <MapLibreIntelligenceMap layers={layers} selectedSpot={spot} setSelectedSpot={setSpot} onFieldStatus={noop} observationDisplay={observations}
      setSelectedOpportunity={noop} openWaterOpportunities={markerFixtures} syntheticSstReview={review}/>
    <header><strong>PELORA · Living Ocean</strong><span>SYNTHETIC SST — TEST EVIDENCE</span>
      <label><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)}/> SST review</label></header>
    <aside aria-label="Synthetic SST legend"><h1>SST <small>ANALYSIS</small></h1>
      <p>SYNTHETIC TEST EVIDENCE · Not Gulf conditions</p>
      <div className="sst-ramp" style={{background: `linear-gradient(to right,${SST_RAMP.map(s => s.color).join(',')})`}}/>
      <div className="sst-ticks">{SST_RAMP.map(s => <span key={s.k}>{kelvinToFahrenheit(s.k).toFixed(0)}°F</span>)}</div>
      <p>Display scale clipped below 32°F / above 86°F. No fishing-value meaning.</p>
      <p>{enabled ? (state.status === 'degraded' ? 'Degraded — retained exact field' : state.field ? 'Partial synthetic coverage' : state.status) : 'OFF'} · Source-cell display, no smoothing</p>
      {f && <><p>Represented Sep 1–2, 2026 UTC · Synthetic interval</p>
        <p>{f.grid.values.filter(v => v !== null).length}/{f.grid.values.length} numeric samples · land / no-data transparent</p>
        <p>Native 1° · source-delivered 2° · display spacing {f.spatial.deliveredResolution.x ?? 'singleton' }° × {f.spatial.deliveredResolution.y ?? 'singleton'}°</p>
        {!state.displayArea && <p>Selected samples have no two-dimensional display extent.</p>}
        <details><summary>Exact governed cells & evidence</summary>
          <p className="identity">{f.deliveryId}<br/>{f.source.frameId}</p>
          <table><thead><tr><th>Lon / Lat</th><th>Source K</th><th>Display °F / missing</th></tr></thead><tbody>
            {f.grid.values.map((v, i) => <tr key={i}><td>{f.grid.axes.x[i % f.grid.width]} / {f.grid.axes.y[Math.floor(i / f.grid.width)]}</td><td>{v ?? '—'}</td><td>{v === null ? f.grid.missing[i] : kelvinToFahrenheit(v).toFixed(2)}</td></tr>)}
          </tbody></table><p>0 K is an artificial numeric-integrity fixture, not a plausible ocean temperature.</p>
        </details></>}
      {state.reason && enabled && <p>{state.reason}</p>}
    </aside>
    <footer>VISUAL HARNESS ONLY · Real generalized geography · Existing Places · Rank marker is a synthetic contrast fixture</footer>
  </main>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><Review/></React.StrictMode>);
