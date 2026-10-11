# P03 Bathymetry vNEXT combined integration qualification

Disposition: P03 BATHYMETRY vNEXT INTEGRATED — READY FOR FOUNDER QA (controlled software/GPU evidence only).

Starting integration: e8820d13d9f39df40274267c12a7ac23eeff6ce1. P03 exact source: 19a9afdbacf305b616368f25b9609f675ce35891. No newer accepted integration was present locally or in verified remote integration refs. New isolated branch codex/pelora-ui-integration-bathymetry-detail-vnext. Method: binary Git delta from the starting integration to P03, checked and applied to the index without conflict or resolution. All 24 candidate paths exactly match P03 blobs. All other tracked blobs remain identical to the starting integration. This record is the only additional integration file.

Primary changes: LayerControls.jsx, useMapLibreOceanFields.js and oceanFieldPresentation.js. Other changes: six dedicated test scripts, appended P03 evidence, fourteen controlled fixture/report/image files. LayerControls removes only field disclosures. Dashboard, Opportunity/Signal/Place implementation, CSS, auth/privacy, backend science/ranking/governance and database objects remain unchanged. vNEXT necessarily supersedes the prior field disclosure presentation. No new source science, source data or admission was granted.

Commands executed from the new integration worktree, Node v24.18.0:
- node --check for eight changed JS/mjs; JSX parsed in the metadata suite.
- node frontend/src/hooks/tests/useMapLibreOceanFields.test.js
- node frontend/src/utils/tests/oceanFields.test.js
- node frontend/src/utils/tests/viewportFieldRequests.test.js
- node frontend/src/utils/tests/bathymetryContours.test.js
- node frontend/src/utils/tests/peloraMapStyle.test.js
- node frontend/src/utils/tests/mapObservationDisplay.test.js
- node frontend/src/utils/tests/mapEnvironmentalObservations.test.js
- node frontend/src/utils/tests/mapRuntimeResponse.test.js
- node frontend/src/hooks/tests/useMapLibreEnvironmentalObservations.test.js
- node frontend/src/utils/tests/opportunityEvaluationState.test.js
- node frontend/src/hooks/tests/mapMetadataCleanup.test.js C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules
- node --loader file:///C:/Users/User/Documents/Codex/pelora-integration-runtime-loader.mjs frontend/src/hooks/tests/intelligenceRecovery.test.js
- same loader and intelligenceCaptainStateRegression.test.js on candidate AND unchanged base worktree.
- PELORA_BROWSER_TEST_NODE_MODULES=C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules; PELORA_CONTOUR_BASELINE=0; node frontend/src/hooks/tests/bathymetryContoursRender.test.mjs
- same browser modules; node frontend/src/hooks/tests/bathymetryTextureRender.test.mjs
- same browser modules; node frontend/src/hooks/tests/mapIntelligenceCleanupRender.test.mjs with existing P02 frontend node_modules argument above.
- git diff --cached --check; exact index/source/base blob comparison.

All ten map/field utility scripts passed; completion assertions are not summed as counted cases. Metadata 19/19 and actual recovery 55/55 passed. Captain-state replay on BOTH baseline and candidate: 66/71, same five failures (documentary persistence developing/stable/strengthening/weakening/fading), each ERR_UNSUPPORTED_RESOLVE_REQUEST for ../../../../backend/server.js from the existing data-URL replay wrapper. The wrapper and backend files are unchanged. This independently reproduces the harness defect before builder execution; it does not qualify those five assertions or claim an all-green replay. No backend import workaround or scientific fix was made.

Actual isolated MapLibre/Edge render: broad/intermediate/close geometry, shallow levels, labels, intersecting refresh and replacement/pan continuity passed. Shallow eligible source lines at z7/9/11: 1/9/19 for 1000px and 390px viewport; close levels include 5ft. Forty pan frames per viewport had no loading flash. Contour browser reported zero network attempts. Texture regression: 512x512, NEAREST min filter 9728, useMipmap false, original five colors and nonnegative transparency, image replacement/style recreation passed; zero network/map errors. React controls: both toggles, no technical disclosure, immutable internal metadata, desktop/390px layout passed; no page errors/network attempts. These use controlled sources, empty synthetic geography, and desktop GPU phone emulation. They are not a physical-mobile performance or complete authenticated-app acceptance claim.

New execution artifacts retained locally under C:/Users/User/Documents/Codex/pelora-detail-vnext-qualification (logs, baseline/candidate replay, contour and texture reports/screenshots). Actual React layout artifacts: C:/Users/User/AppData/Local/Temp/pelora-vnext-controls-VrW4RR. P03 committed historical artifacts remain unchanged. Temporary loader only resolves existing React/React-DOM/rolldown dependencies; it does not repair relative data-URL imports. No packages/environment copied or installed.

Remaining founder/independent QA: actual ETOPO shallow/mid/deep viewports, detail/readability/interval acceptance, real geography and Opportunity/Signal/Place collision/dominance, complete authenticated Today/Map/Intelligence/Saved Reports flows and console, physical iOS/Android CPU/memory/GPU/layout, steep-source complexity guard frequency. Controlled hierarchy/recovery/state tests support these boundaries but do not replace this live QA. Increased contour detail CPU cost remains documented in P03 evidence.

No production, provider/Auth/database access, deployment, main merge, source admission or CP-10 work. Other checkouts and branches preserved. Stop after isolated candidate checkpoint.
