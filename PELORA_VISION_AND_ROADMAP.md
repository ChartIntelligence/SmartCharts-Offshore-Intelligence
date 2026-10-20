PELORA — Vision and Long-Term Roadmap

Companion to HANDOFF.md | October 19, 2026

Purpose: Give Claude Code and future collaborators the founder’s product vision beyond the Gulf beta. This is not an implementation authorization or proof that the features described are working. Read HANDOFF.md for current engineering status and beta blockers, and the repository’s canonical product, science, privacy and release contracts before changing behavior. If sources conflict, identify the conflict and ask the founder rather than silently rewriting the vision.

1. What Pelora is

Pelora is an Ocean Intelligence platform that helps offshore captains understand the ocean and make better-informed decisions. It interprets environmental evidence, surfaces meaningful features, explains their significance and uncertainty, and lets the captain decide. It is not a catch guarantee, catch-report popularity map, generic weather dashboard or navigation chart.

Permanent mission: “The ocean is talking. Pelora helps you listen.”
Descriptor: OCEAN INTELLIGENCE.
Product principle: “The ocean speaks first. Pelora translates. The captain decides.”
Captain workflow: Understand → Discover → Investigate → Decide → Record → Learn.

Permanent production destination: PeloraOffshore.com — one evolving application. Gulf-first, global-ready. Preserve Founding Captain accounts, historical reports and lifetime access. The founder hopes to build a substantial global company and recurring revenue, but neither revenue nor adoption is guaranteed.

2. How to interpret this roadmap

• LOCKED: Deliberate founder-approved principle or product contract; changing it requires explicit founder approval and appropriate science/privacy review.
• APPROVED DIRECTION: Strategic objective, not necessarily built, scientifically qualified or approved for immediate implementation.
• PROPOSED / OPEN: Opportunity requiring evidence, prioritization, scope and founder decision.
• CURRENT STATUS: A separate question. Designed, implemented, tested, qualified, integrated, persisted, deployed, live and beta ready are not interchangeable. See HANDOFF.md and exact source/qualification evidence.

3. Locked scientific and product identity

Ocean Signals versus Opportunities

Ocean Signals (fronts, current edges, convergence, shear, mixing, upwelling, gradients and other environmental features) are distinct from governed fishing Opportunities. A strong signal can be valuable even if no Opportunity qualifies. Numeric scores alone cannot grant ranking; evidence and habitat gates must affirmatively pass. Zero eligible Opportunities is a valid result. Confidence measures strength of evidence, not fish presence or catch probability.

Pelora must explain what was observed, why it matters, what supports the interpretation, how it changed and what remains uncertain. No synthetic evidence, invented freshness, unsupported precision or silent scientific source admission. Loading, governed-zero, stale, degraded, unavailable and error states must be distinguished. Older evidence may be shown as latest available with source/age/caution, never misrepresented as current.

Three operating timescales

1. Continuous Observe: server-side acquisition, validation and durable retention of qualified environmental observations, 24/7, independent of app sessions.
2. Governed Publish: persistent governed snapshots at 00:00, 04:00, 08:00, 12:00, 16:00 and 20:00 UTC. App open/resume reads the latest publication; it must not trigger fresh discovery.
3. Nightly Learn / Daily Evidence Audit: privacy-safe pairing of eligible captain observations with immutable historical ocean evidence, and system/evidence audit. Never silently rewrite production rankings.

Multi-cycle and multi-day continuity matters. Track identifiable features’ persistence, coherence, strengthening/weakening and movement, when evidence supports it. Never reset useful history merely because a new cycle began.

The map is an explanation layer

One application-first captain workspace across mobile web/PWA and desktop. Preserve Today → Map → Intelligence continuity, selected governed Opportunity, mission, map camera and draft state where governed. Captain context includes species, origin, range in nautical miles or Entire Gulf; GPS optional.

Places, Ocean Signals and ranked Opportunities must look different. Numbered markers are reserved for governed rank. Cluster counts are not rankings. The species-neutral Places catalog is filtered for active mission relevance without deleting hidden places; avoid a hardcoded universal Blue Marlin depth cutoff. The map’s scientific hierarchy comes from environmental evidence, not catch/community density. Maintain an independent visual/product identity rather than copying GulfWire.

Bathymetry is permanent infrastructure: versioned, retained Gulf contours/grids should survive upstream outages and ordinary service restarts; do not treat stable ocean-floor data like a four-hour live layer. Disclose resolution, survey and coverage limitations. It is not a substitute for navigational charts.

Captain privacy and access

Fishing Logs are private by default, with separately optional anonymous sharing. Never expose captain identity or private fishing locations. The learning program intentionally excludes lure, bait, trolling speed, presentation and photos. Backdated logs pair to archived ocean conditions at trip time, not today’s data. Preserve immutable evidence/context identities, consent, owner isolation and session-lifetime safeguards.

Founding Captain Program: first seven captains receive Pelora Captain access free for life and a promised commemorative keepsake/challenge coin. Never dilute those rights. Founder-approved Beta Captain one-year access starts only with authoritative proof of a successful postapproval qualifying login, not inferred timestamps or refreshed sessions. February 29 anniversaries fall on February 28 in non-leap years at the same UTC time. Missing authority stays UNKNOWN.

Seven initial species

Blue Marlin, Yellowfin Tuna, Blackfin Tuna, Mahi, Sailfish, White Marlin and Wahoo. Equal explanation quality across species, but species-specific habitat, season, environment and eligibility. Blue Marlin work does not qualify the other six. Unsupported cases fail closed rather than borrowing another species’ score.

4. First milestone: full Gulf beta

Founder chose a functioning Gulf beta first (Option A), with global-ready architecture from the beginning. The Gulf is the validation region, not Pelora’s permanent boundary. The founder does not want a stripped-down beta that violates the locked product definition.

Refer to HANDOFF.md for the exact beta-complete acceptance gates. In summary, they require retained bathymetry; operationally qualified SST, chlorophyll/water color, currents, wind/waves/swell; Continuous Observe; fixed-slot publication and persistence; governed Signals/Opportunities across all seven species; private reports and Nightly Audit; safe access/enrollment; real SDK/RLS/durability; physical iPhone acceptance; rollback; and explicit Founder BETA READY approval.

Current reported status: NOT BETA READY. Controlled tests have passed in several areas, but real environmental data admission, durable bathymetry, operating workers/publishing, live storage/Auth, seven-species completeness, nightly learning, physical devices and release gates remain open. A test count is not a captain-facing feature.

Delivery approach: work on independent critical-path capabilities in parallel. Prefer qualified alternatives and resilient retention to waiting indefinitely for one provider. Never lower scientific, privacy or release standards merely to make progress look faster.

5. Geographic expansion — approved direction

|Stage|Region                                              |Intent                                                                         |
|-----|----------------------------------------------------|-------------------------------------------------------------------------------|
|1    |**Gulf of Mexico**                                  |Complete and validate the first operating beta.                                |
|2    |**U.S. Atlantic**                                   |Reuse region-agnostic architecture and qualify new local evidence.             |
|3    |**Bahamas / Caribbean, potentially Central America**|Expand fisheries, regional sources and captain reach; exact order remains open.|
|4    |**Additional offshore regions worldwide**           |Long-term global Ocean Intelligence platform.                                  |

Architecture must avoid Gulf-only assumptions in data identities, source contracts, bathymetry, species/season context, geography, time and scientific governance. Global availability of a raw dataset does not prove global scientific suitability or regional product readiness.

6. Long-term Ocean Intelligence evolution

Approved direction: improve scientifically supportable interpretation of SST/fronts, current vectors/edges/convergence/shear, water masses, mixing zones, upwelling/downwelling, productivity gradients, chlorophyll, salinity, eddies, sargassum, bathymetry, tides, moon, wind, waves and swell. Keep direct observations, blended analyses, forecasts, interpolated/gap-filled products and inferred features explicitly distinct. Publication time is not observation support.

The canonical Ocean Intelligence Dictionary includes: Ocean Front, Current Edge, Current Convergence, Current Shear, Upwelling, Downwelling, Water Mass, Mixing Zone, Productivity Gradient, Environmental Transition, Evidence, Evidence Chain, Confidence, Confidence Score, Data Quality, Explainability, Scientific Uncertainty, Hypothesis, Validation, Ocean Signal. Retrieve their approved full definitions before editing terminology; this document lists names, not replacements.

Approved direction: multi-source ocean resilience, provenance, evidence accumulation, feature continuity, environmental relationships and controlled historical learning. Captain observations may validate hypotheses only within consent and scientific gates, not as catch-density/popularity ranking authority.

Proposed future expansion: additional species and regional fisheries beyond the initial seven, each with its own qualified scientific evidence. No future species list, order or launch date is approved here. More sophisticated captain explanations, historical comparisons and product experiences should strengthen the existing one-app workflow, not fragment it. Native apps, hardware integrations, offshore navigation, predictive catch probabilities and social networks are not approved commitments.

7. Brand, community and company

Locked brand: approved blue-marlin emerging from ocean-contour flow, Discovery Orange accent, cyan accent inside the “A”, primary descriptor OCEAN INTELLIGENCE. Preserve approved logo/wordmark proportions and independent visual language; editable vector-master assets are a known production deliverable. Do not reinstate removed slogans or use “Understand More. Fish Smarter.” as a core tagline.

Canonical founder narratives: approved founder origin story begins “Pelora didn’t begin with software. It began with frustration.” Approved “Why Pelora” begins “Every offshore trip begins with a decision.” Their full authoritative text is not reproduced here; locate originals before adapting the About page, brand book, marketing or investor materials. Do not reconstruct them from these opening lines.

Approved community direction: educational community first; ocean-science education, building Pelora, captain education, ocean appreciation and community highlights. Founding Captains are trusted early collaborators. Optional anonymous sharing must never expose private tactics or fishing locations. Monitor competitors such as GulfWire to avoid strategic/visual imitation, not to copy features.

Business ambition: build a financially sustainable, globally recognized Ocean Intelligence company with recurring revenue. Open decisions: subscription pricing/tiering, paid conversion, customer acquisition economics, marketing budget, partnerships, commercial provider licenses, investor funding, global regulatory requirements and launch dates. None should be invented or committed by an AI engineer. Early business validation should measure captain return usage, usefulness of decisions, trust and willingness to pay; specific targets remain proposed.

8. Roles and engineering boundaries

• Founder: vision, priorities, commercial decisions, final product/scientific-policy changes, production and BETA READY approval.
• Claude Code: Lead AI Engineer, responsible for repository audit, implementation, integration, debugging, technical architecture, testing and release preparation. Empowered to solve engineering problems within authorized bounds; not empowered to redefine the product.
• ChatGPT: Product Architect, Founder Advisor, scientific/product governance advisor, brand strategist and independent founder-side reviewer. Not a second lead engineer, not a mandatory approver for routine commits, and not the six-agent message relay.

Start with a read-only inventory of all local worktrees, remote branches, untracked assets, exact qualified candidates and production lineage. Do not assume remote main contains the newest work. Do not reset, clean or discard existing worktrees. Preserve original test failures and qualification limitations. Differentiate designed/implemented/tested/qualified/integrated/persisted/deployed/live/beta-ready.

Use one Pelora application at PeloraOffshore.com. Stage safely and preserve Founding Captain accounts, reports, entitlements and privacy. Changes to science, private data, production, credentials, paid services and release require explicit Founder authorization. Prefer capability demonstrations over endless reports, and reduce unnecessary coordination/copy-paste.

9. Open questions and founder decisions

1. What is the true latest integrated candidate after reconciling local worktrees, remote branches and historical evidence?
2. Is Gulf bathymetry actually durably retained and provider-outage resilient? If not, what exact asset/storage/serving change closes it?
3. Which SST and other ocean providers can satisfy operational scientific claims with real retrieval, temporal support, licenses and fallback?
4. What is the smallest safe path to operational Continuous Observe, six-slot publishing, Nightly Audit and seven-species qualification?
5. How will the remaining live Supabase Auth/RLS/API, Beta entitlement authority and production restoration gates be demonstrated without depending indefinitely on vendor support?
6. Which exact staged release passes founder physical-iPhone acceptance and can safely promote to the existing PeloraOffshore.com production infrastructure?
7. After beta, what are the approved pricing, regional rollout order, customer-success measures and additional species priorities?

────────

North Star: Build the complete, scientifically trustworthy Gulf beta first, without losing the global vision or the captain’s trust. The ocean speaks first. Pelora translates. The captain decides.