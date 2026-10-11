# Pelora Real-World Validation Record

## Hurricane / Cloud-Degraded Ocean Intelligence — 2026-10-09

**Record class:** Real-world observational QA / evidence-resilience case  
**Status:** Preserved observation; not a scientific admission, production qualification, or safety certification  
**Observed surface:** `peloraoffshore.com` mobile application  
**Region:** Northern Gulf of Mexico / Florida Panhandle operating area  
**Primary context:** Hurricane Isaias and associated cloud/degraded observing conditions

## Official storm context

At 2:00 PM CDT on 2026-10-09, the National Hurricane Center reported Hurricane Isaias at 28.7°N, 87.1°W with maximum sustained winds of 120 mph and minimum central pressure of 959 mb. A 120 mph hurricane is Category 3 on the Saffir-Simpson Hurricane Wind Scale. This record uses that advisory only as external storm context; Pelora is not being validated here as a hurricane forecasting or warning system.

Official NHC advisory: https://www.nhc.noaa.gov/text/refresh/MIATCUAT4+shtml/091857.shtml

## Subcase A — Environmental evidence resilience near Okaloosa FAD 8

Founder-observed Pelora state at approximately 2:51 PM local time:

- Selected location: **Okaloosa FAD 8**.
- Pelora displayed a **partial ocean picture** rather than collapsing the entire view to unavailable.
- **Sea state:** `28 ft at 10.55 sec`.
- **Swell:** `12.3 ft at 10.9 sec`.
- **Ride context:** `A high-impact combined sea state is present.`
- **Wind:** `Unavailable`.
- **Water Color:** `Unavailable`.
- The screen also showed independently governed bathymetry/current metadata.
- Pelora's interface explicitly communicated that some supporting evidence remained unresolved.

### Validation significance

This is a real-world degraded-observation case in which some evidence channels remained usable while others were unavailable. The desired Pelora behavior is to preserve independently available evidence, accurately label unavailable/degraded evidence, and avoid converting partial observability into a blanket `Unavailable` state.

### Governance boundary

This subcase does **not** establish:

- hurricane forecast skill;
- vessel-safety guidance or safe-to-go decisions;
- provider-level accuracy of the displayed wave/swell values;
- availability of wind or cloud-sensitive products where Pelora marked them unavailable;
- fish presence, catch probability, or guaranteed success.

Provider provenance and source-level accuracy of the displayed live-condition cards require separate qualification.

## Subcase B — Cloud-covered Top Opportunity continuity

Founder-observed Pelora state at approximately 2:56 PM local time:

- Mission context: **Panama City, FL · 200 NM · Blue Marlin**.
- Two ranked markers, **#1** and **#2**, were visible within the broader cloud-affected operating area.
- Pelora continued to show current-context metadata from NOAA NESDIS CoastWatch and bathymetry metadata.
- Opportunity identity/rank remained visible while cloud-sensitive supporting evidence was degraded/unavailable elsewhere in the same event.

### Validation significance

This creates a live test of Pelora's locked opportunity-continuity rule:

1. Temporary loss of a cloud-sensitive source must not automatically erase an otherwise governed Opportunity.
2. Missing or stale evidence must not be silently treated as current.
3. Opportunity identity and continuity may persist only while the currently admissible evidence remains sufficient under the Minimum Opportunity Evidence Gate.
4. Prior rank, historical strength, popularity, or repeated catch reports may not manufacture current eligibility.

### Required follow-up qualification

For both ranked Opportunities, a later controlled review should determine:

- exact opportunity identity and continuity object;
- current evidence sources supporting eligibility at the captured time;
- which cloud-sensitive evidence sources were missing, stale, degraded, or unavailable;
- whether any fallback evidence was used and under which freshness/provenance rule;
- whether the Minimum Opportunity Evidence Gate remained satisfied using only currently admissible evidence;
- whether rank was preserved for valid governed reasons rather than merely carried forward from an earlier cycle.

Until that review is performed, this record demonstrates **continuity under partial evidence loss**, not proof that either Opportunity's eligibility/rank was scientifically correct.

## Regression requirements derived from this event

1. Loss of a cloud-sensitive source must not erase unrelated valid marine/environmental evidence.
2. Missing evidence must never be displayed as current or silently inferred from nearby/older evidence.
3. A persistent Opportunity must retain identity across temporary evidence degradation when upstream governance still permits it.
4. If current evidence falls below the Minimum Opportunity Evidence Gate, the Opportunity must leave ranked delivery even if it was ranked in a prior cycle.
5. Stale/latest-available evidence must retain age and provenance and must not masquerade as direct current evidence.
6. Degraded observing conditions must not collapse independent evidence channels into a shared unavailable state.
7. Real-world severe-weather cases must remain evidence-governance tests, not safety-certification or hurricane-prediction claims.

## Evidence files

### `evidence/okaloosa-fad8-live-conditions-2026-10-09.jpeg`

Mobile capture showing Okaloosa FAD 8, partial ocean-picture language, live sea-state/swell cards, unavailable wind/water-color states, and the high-impact combined sea-state interpretation.

SHA-256: `a48a20ea083344c137ab76ceb17f6c93c457e2c72d403407d817f4b8b157b3f6`

### `evidence/cloud-covered-top-opportunities-2026-10-09.jpeg`

Mobile capture showing Panama City, FL / 200 NM / Blue Marlin context with ranked Opportunity markers #1 and #2 and independent current/bathymetry metadata during the same cloud/degraded-weather event.

SHA-256: `f4dffd8f9cdff26a1b8936ad3a8491a375cbbefae96d58a2489571ec7e06c5fb`

## Evidence interpretation rule

The screenshots are direct UI observations. Values and labels are preserved as displayed. They are not independently reclassified or corrected in this record. External NHC information is used only to establish the contemporaneous hurricane context.

## Canonical takeaway

> Pelora should preserve independently available evidence and governed opportunity continuity during cloud/degraded observing conditions, while truthfully exposing uncertainty and unavailable evidence. Continuity must never become permission for stale or missing evidence to masquerade as current evidence.
