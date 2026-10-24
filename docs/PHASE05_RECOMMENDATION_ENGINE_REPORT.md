# Phase 05 — Smart Surprise Me recommendation engine

Implemented 20 October 2026. Public entry points: http://127.0.0.1:4184/preferences and http://127.0.0.1:4184/surprise-me. Results: `/discovery-result`.

## Outcome and scope

Guest visitors now receive real, deterministically ranked published destinations from Supabase. Both preference forms lead to the engine. The result includes a real destination photograph, bilingual content, compatibility and evidence coverage where supported, reasons and uncertainties, source/attribution access, temporary save, Place Details, Surprise Me Again and Edit Preferences.

No external LLM, model training, chatbot, itinerary planner, paid service, account authentication or Phase 06 work was introduced. No hosted tourism facts, translations, source/license records, images, publication statuses, database structure, RLS policies or permissions were changed. No destinations were published by this phase. Existing Admin functionality and both Supabase connections were preserved.

## 1. Current-system audit

The dedicated `supabase_unseen_jo` MCP server returned `https://dkhwwvoplhfjccvjegty.supabase.co`. Read-only SQL inspected publication state, category availability and policies. Genuine anonymous SDK queries independently verified the public API.

| Destination | Slug | Verified current state |
| --- | --- | --- |
| Ajloun Forest Reserve | `ajloun-forest` | Published, non-demo |
| Dana Biosphere Reserve | `dana-reserve` | Published, non-demo |
| Iraq Al-Amir | `iraq-al-amir` | Published, non-demo |
| As-Salt Historic Centre | `salt-historic` | Published, non-demo |
| Umm Qais | `umm-qais` | Published, non-demo |
| Mujib Biosphere Reserve | `wadi-mujib` | Published, non-demo |

All IDs and slugs were retained. Seven active categories exist: Nature, Food, History, Culture, Adventure, Photography and Family. Relaxation is not currently a category, so no conflicting category was created.

Before this change, Preferences displayed a local preview, Surprise Me submitted `fixed-figma-sample`, and Discovery Result always displayed the local Ajloun sample. That active flow has been replaced. Historical sample utilities remain available to historical fixtures, but the real recommendation routes no longer call them or download the demo destination JSON.

The existing public repository provides anonymous read-only access, validated destination adapters, caching, signed image delivery and nested categories/translations. Public `places` RLS permits only `status = 'published'`; categories require active status, relationships inherit visible parent/category access, and Arabic public translations require reviewed/current source versions. Reviews are private. No public recommendation query requests those private review records or Admin APIs.

Figma was inspected through the official MCP: Preferences `9:70`, Surprise Me `14:514`, Discovery Result `30:981` in file `S8JMnWut3IB6ceoACa07cJ`, including design context and screenshots. Existing React components, approved compact scale, local assets, theme, animation and layouts were reused. The original decorative Surprise hero remains; recommendation photographs come from the selected live destination. No Figma file was modified.

Reused components include `PreferenceChoice`, `PreferenceGroup`, `PreferenceField`, `DestinationCard`, `MatchingReasons`, `DestinationPreview`, `SectionHeading`, `ContentState`, `AssetImage`, button primitives and the temporary favorites context. Two in-scope visual defects found during validation were addressed: mobile result metadata now uses a content-safe auto-fitting grid, and the existing terracotta Surprise CTA retains its color with larger bold text meeting the applicable contrast target. Dynamic destination photographs use `object-fit: cover` instead of the historical fixed-sample stretch treatment.

## 2. Architecture

`src/features/recommendations/` separates the recommendation domain from React presentation:

- `engine.js`: pure normalization, feature extraction, eligibility, scoring, ranking, structured explanations and diversity selection functions.
- `preferences.js`: shared existing option composition and form validation.
- `useRecommendationData.js`: public retrieval, explicit retry, cancellation guards and catalog-change subscription.
- `RecommendationProvider.jsx` / `context.js`: app-scoped guest selection and bounded repeat history.
- `PreferenceLimits.jsx`: shared optional exact amounts and essential requirements.

The public repository adds a lightweight candidate read. It performs no recommendation calculation. React result presentation selects a ranked candidate, loads only that destination's full public content/media through the existing repository, then applies the existing locale adapter. Scoring does not inspect translated prose, images or React state.

## 3. Preferences and guest privacy

The original preference store remains the source of truth:

| Input | Normalized meaning |
| --- | --- |
| Interests | Deduplicated selected slugs from actual active Supabase categories |
| Starting location | Existing city choice; an approximate origin only where the project already has an attributed city reference |
| Available time | Minutes: 30, 120, 240 or 480 from existing choices; optional exact hours override the choice |
| Budget | Total amount available; existing presets map to an admission ceiling for comparison, not a confirmed trip total |
| Transportation | Existing car / public / walking values |
| Travel group | Existing solo / couple / friends / family values |
| Essential requirements | Optional strict interest, time, total cost, location, transport and group-tag requirements |

The existing 4 Hours / 20 JD options are retained. Optional exact budget accepts 0–1,000,000 JOD; exact hours must be positive and at most 168. Invalid values receive validation messages. Selecting a different budget/time preset clears its exact override.

“Under 10” is exclusive; “10–30” means a ceiling of 30, not a requirement to spend at least 10. “Over 30” has no known upper bound until an exact amount is supplied. Unknown admission is never converted to zero. Empty interests are supported; ranking then uses the remaining supplied preferences and says that interests were not selected.

Preferences, selection and up to 30 recent result IDs remain in memory for the mounted guest app. They survive SPA navigation, language switching and ordinary tab return; a full reload clears them. No preferences or precise location are sent to Supabase, placed in URL query strings, persisted to an account, or exported. No recommendation geolocation prompt is issued. It works without location permission; existing public map geolocation behavior is untouched.

## 4. Retrieval and validation

`RECOMMENDATION_SELECT` contains identity, publication/demo flags, coordinates, admission bounds, visit-duration bounds, group tags and category relationships. It excludes photographs, descriptions, translations, audit data and private reviews. Reads explicitly use `status = published` and `is_demo = false`, stable slug/ID ordering and 500-record server ranges until complete. See the [Supabase ordered range API](https://supabase.com/docs/reference/javascript/range).

The repository reuses the existing one-minute cache, concurrent-request coalescing and mutation invalidation. A warm full public catalog can supply candidates without another read, without extending that snapshot's cache lifetime. Category-only preference screens do not fetch the destination inventory. The selected destination uses the existing full public detail read, media rights restrictions and responsive delivery. No per-candidate media signing or detail N+1 loop was added. Explicit demo mode shows an explanatory error rather than mixing a live recommendation with demo Place Details.

Feature extraction validates finite nonnegative numeric bounds, makes invalid/reversed ranges unknown, tolerates missing category/group data, and rejects invalid identity/publication/demo/inactive records at eligibility. The current database uses publication state as its availability switch; it has no separate destination inactive flag. The pure validator also rejects an explicit inactive flag if a future adapter supplies one.

## 5. Eligibility and strict requirements

Always excluded:

- Unpublished, demo, deleted/unavailable, explicitly inactive or invalid identity records.
- A known minimum admission exceeding the amount available, including the exclusive under-10 boundary.
- A known minimum visit estimate exceeding the available minutes.

With essential requirements selected:

- All selected interests must be present in the recorded categories.
- The entire recorded visit estimate must fit; an unknown upper bound is unconfirmed. This remains an estimate, not a duration guarantee.
- A usable origin and destination location reference are required when strict location is selected. Invalid/missing coordinates are not relaxed as usable locations.
- Confirmed **total trip cost** requires more than admission. The current schema supplies no such total, so strict total cost cannot currently pass.
- Strict transport requires structured suitability evidence; the current schema supplies prose, not validated mode compatibility, so it cannot currently pass.
- A strict group requirement means a matching recorded tag, not a safety, child-age or accessibility attestation. Missing or nonmatching positive tags are unconfirmed rather than proof that the group is forbidden.

If confirmed matches are empty, the UI explains the data/constraint problem. It offers an explicit button for alternatives only when records fail because of unknown essentials. That choice does not overwrite preferences. The alternative is clearly labelled unverified. Known exclusion failures are retained, including impossible time/cost limits and missing required interests. No destinations appear when all candidates remain excluded.

## 6. Scoring formula and weights

Initial configurable weights are exported as `DEFAULT_WEIGHTS` in `engine.js`:

| Dimension | Weight | Compatibility evidence |
| --- | ---: | --- |
| Interest | 40 | Matched selected categories / selected categories |
| Visit time | 20 | Complete upper estimate fits → 1; otherwise available minutes / upper estimate, capped at 1 |
| Recorded admission | 15 | Recorded upper admission within ceiling → 1; otherwise amount / upper admission, capped below 1 |
| Geographic proximity | 15 | `1 / (1 + straightLineKm / 50)` |
| Transport / group | 10 | Split 5 / 5; positive structured suitability evidence only |

For a partial range containing only a minimum, coverage is 0.5 and compatibility is conservatively 0.5 when not excluded. Missing bounds provide no points. A group tag not matching the selected group gives no suitability evidence. Transport prose is never parsed into a positive compatibility attribute.

For each supplied dimension `i`, let `w_i` be its weight, `c_i` evidence coverage (0, 0.5 or 1) and `q_i` compatibility (0–1):

```text
activeWeight = sum(w_i for supplied dimensions)
knownWeight  = sum(w_i * c_i)
earned       = sum(w_i * c_i * q_i)
evidenceCoverage = knownWeight / activeWeight
knownEvidenceMatchQuality = earned / knownWeight
score = round(100 * earned / activeWeight)
      = round(100 * evidenceCoverage * knownEvidenceMatchQuality)
```

Zero denominators yield zero, never NaN. Missing evidence stays in the denominator of a supplied dimension. A single known Nature match cannot become a displayed 100% match merely because other facts are missing. The UI withholds a numeric score unless weighted evidence coverage is at least 50% and at least two dimensions have evidence. It still explains the recommendation and missing facts.

The score is a transparent compatibility heuristic, **not** an AI prediction, probability, statistical confidence or guarantee of a safe/open/affordable trip. Admission comparisons are explicitly admission-only. Total cost and travel time remain unverified.

Weights can be adjusted in `DEFAULT_WEIGHTS`, or passed to the pure ranking function as `options.weights`. Negative/nonfinite/all-zero configurations are rejected. The explanation panel reads the actual weight values, so it does not retain obsolete percentages after tuning. Values are normalized by their active total and do not have to sum to 100. Weight calibration needs later outcome evaluation; no user-behavior learning was added.

## 7. Distance, ranking and repeat avoidance

The engine reuses the existing Haversine helper and GeoNames-attributed city centers for Amman, Irbid and Aqaba. Ajloun, Salt and Madaba remain selectable starting cities, but the current project has no attributed city-center coordinates for those options; proximity is marked unavailable rather than guessed. Destination pins are geographic references, not surveyed entrances. Kilometres are explicitly straight-line distances. No road distance, traffic or driving time is fabricated.

Ranking sorts by score descending, coverage descending, then slug and ID for deterministic ties. Surprise Me Again selects from at most three candidates within eight score points of the leader and with at least its interest compatibility. Within that pool it avoids the last result, prefers the least frequently represented IDs in recent history, and uses rank order for ties. No uncontrolled randomness or preference-discarding selection is used.

If only one result remains in the strongest matching pool, the UI explains why it may repeat. Lower-ranked eligible records do not automatically enter the pool just to create novelty. Changing normalized preferences resets the relevant session history. Navigation back to a still-valid result does not consume another surprise.

## 8. Explanations and presentation

Reasons are structured keys and values emitted by `explain()`, then localized by the existing bilingual resource system. They include actual category matches, estimated-duration fit/partial fit, admission unknown/range comparisons, calculated approximate city distance, unverified transport/group suitability and arrival/opening/seasonal/activity cautions.

The engine never says “fits your budget” from admission alone, “open now” from missing hours, “accessible by public transport” from absent transport data, or “safe for families” from a group tag. A matching recorded group tag retains an explicit age/activity/access qualification. Photographs use the selected live media and existing responsive derivatives; original bytes, license evidence and approval status are preserved. An expandable attribution/source disclosure retains the complete stored credit text and original source link.

English and Jordanian Arabic resources cover the new controls, explanation templates, score description, missing-data and error states. Existing current/reviewed destination translations are used; unavailable or stale translations retain the existing honest English-source fallback. No translations were approved automatically.

## 9. Live integration results

The genuine anonymous hosted check returned all six published records. With Amman, full-day time, 20 JOD, solo and car:

| Interests | Leading real result | Score | Evidence coverage |
| --- | --- | ---: | ---: |
| Nature | Ajloun Forest Reserve | 67 | 75% |
| History | Iraq Al-Amir | 71 | 75% |
| Nature + Adventure | Mujib Biosphere Reserve | 52 | 60% |
| None | Iraq Al-Amir | 52 | 58.3% |

These are measurements of the current dataset/configuration, not fixed mappings. Strict total cost plus transport yielded zero confirmed results and six explicitly unverified alternatives. Selected real photography was available; anonymous private-review access returned no records. Evidence: [hosted check](validation/phase05-hosted.json), [anonymous public snapshot](validation/phase05-public-snapshot.json). A final anonymous read produced the same canonical SHA-256 for all six public record projections, including versions, publication states, public translations, linked media and attribution: [preservation check](validation/phase05-preservation.json). The snapshot contains public records only, without credentials or signed media URLs.

## 10. Performance measurements

Node 24 on this Windows workstation, 25 pure ranking runs per dataset, excluding network and rendering:

| Fixture destinations | Median | p95 |
| ---: | ---: | ---: |
| 6 | 0.077 ms | 0.133 ms |
| 1,000 | 4.082 ms | 6.004 ms |
| 10,000 | 23.445 ms | 40.474 ms |

These are machine-specific CPU observations, not mobile guarantees. Retrieval dominates the six-record live case: the initial anonymous candidate/category read measured approximately 1.54 seconds in the hosted SDK check. Final production-browser click-to-result observations were:

| Language / width | Click to rendered result |
| --- | ---: |
| English / 1440 | 5,969 ms |
| English / 820 | 2,919 ms |
| English / 390 | 1,374 ms |
| Arabic / 1440 | 2,901 ms |
| Arabic / 820 | 1,363 ms |
| Arabic / 390 | 1,359 ms |

These are individual cold-context observations, including live network and React work. Earlier runs ranged approximately 0.85–2.4 seconds, demonstrating variability rather than a guaranteed latency. They do not measure fully decoded largest-image/LCP completion or establish a before/after speedup against the old fixed demo. The result loader remains visible until the selected public detail/media metadata is available; network latency is a remaining limitation. Full observations: [browser evidence](validation/phase05-browser.json).

Preference screens made zero destination requests. Each fresh live guest journey made one lightweight candidate request for the six records. Surprise Me Again within the one-minute cache and ordinary browser-tab return did not repeat the candidate fetch. Again explicitly revalidates through the cache; after expiry it reads published candidates again and removes records no longer returned. It does not introduce focus-triggered polling. The selected full detail read is separate; already cached records and image signatures are reused. No MapLibre instance is created by the recommendation engine itself. Existing Place Details map behavior is retained.

The first retrieval still scans the available lightweight catalog in pages for global ranking. This is suitable for the measured hundreds/thousands range, not a claim of unlimited client scaling. Larger inventories or slow devices warrant an equivalent public, RLS-safe server retrieval/ranking adapter or worker after profiling; no speculative schema change was made now. The existing shared/MapLibre large-chunk build advisory remains.

## 11. Validation and reproducibility

Commands:

```powershell
npm run test:recommendations
npm run test:recommendations:hosted
npm run test:recommendations:browser
npm run validate
```

The browser runner defaults to production preview `http://127.0.0.1:4190`; set `QA_BASE_URL` to test another local server. It reads the anonymous public snapshot produced by the hosted check for expected IDs and realistic failure fixtures.

Completed checks:

- Eleven pure engine/SDK groups: normalization, actual categories, multiple interests/categories, weighted scores/coverage, missing and malformed data, strict constraints, budgets, time ranges, Haversine distance, deterministic rank/diversity, explanation integrity, published-only ordered pagination, cache coalescing, invalidation and recoverable network errors. [Model and timing evidence](validation/phase05-model.json).
- Genuine anonymous Chromium journeys in English/Arabic at desktop, tablet and mobile widths: Preferences → real result → photo/credit → temporary save → real Place Details → retained result → diverse Again → retained preferences → strict unknown → explicit unverified alternative → no result under impossible constraints. Language round trips and ordinary tab return preserve selection and avoid another candidate read. No demo dataset, private reviews or Admin APIs are used.
- Intercepted public-schema fixtures separately exercise network failure/retry, empty inventory, one eligible result, sparse information with withheld score, and cache expiry followed by removal of the stale result. These are simulated; they are not mislabeled as hosted operations.
- Twenty-nine axe WCAG A/AA scans and horizontal-overflow checks passed on the preference, result, edited Surprise form, no-match and fixture states (24 across six live journeys, five fixture cases). Screenshots were visually reviewed, including Arabic RTL and long/unavailable metadata.
- Existing regressions passed: public tourism model/database (15 groups), disposable Postgres Admin/security (12), map/geography (9), localization (6), responsive image delivery (6), auth/cache/security (7), visitor information (8), Arabic duration browser checks, Quick Edit model (4), and public/Admin logo browser (6 scenarios). Admin/security tests use a disposable local database or intercepted fixtures; they do not perform hosted mutations.
- Oxlint passed with no warnings. Asset validation passed (83 references / 48 original image hashes). Production build passed. Static localization audit reported no missing static strings.
- A final-build English desktop smoke run also passed the live journey and all five simulated failure/sparse/expiry cases after weight-display normalization: [final smoke](validation/phase05-final-smoke.json).

Historical Phase 01 source-sized/fixed-sample browser scripts describe earlier demo behavior and are not claimed as valid acceptance of the new personalized flow. The real Phase 05 journey runner replaces those obsolete demo assertions; the current applicable regression results above are distinct from historical reports.

Screenshots: [English desktop](../artifacts/phase05/live-result-en-1440.png), [English mobile](../artifacts/phase05/live-result-en-390.png), [Arabic desktop](../artifacts/phase05/live-result-ar-JO-1440.png), [Arabic mobile](../artifacts/phase05/live-result-ar-JO-390.png). These use genuine anonymous live Supabase data. No signed-in owner session was needed or impersonated: this is a guest feature.

## 12. Initial dataset limitations and Phase 06 handoff

All six admission prices are unknown; four destinations have complete visit estimates, while Dana and Mujib do not. Structured transport compatibility and complete trip totals are absent. Group tags are mostly absent; existing Mujib tags do not establish child suitability or route safety. Opening/seasonal guidance is not a machine-readable live availability schedule. Proximity is limited to the existing three attributed city references. No relaxation destination/category or suitability fact was manufactured to fill these gaps.

Consequently, budget/transport may not differentiate current results, strict total cost/transport cannot produce a confirmed match, and Nature can legitimately retain a single strongest result. Missing facts reduce evidence coverage and constrain the claims shown to visitors. New verified records improve the engine without hardcoded per-destination rules.

Phase 06 can place a validated persistence adapter around the existing preference context after authenticated user identity and per-user RLS ownership are implemented. The normalization and ranking functions already accept plain preferences independent of React, user ID or storage. Account switching must reset any future private preference/history cache. Precise geolocation would require explicit consent and a separate retention decision. None of that account functionality or its schema was started in this phase.

## Changed files

- New recommendation feature directory and `src/styles/recommendations.css`.
- `src/pages/PreferencesPage.jsx`, `SurpriseMePage.jsx`, `DiscoveryResultPage.jsx`.
- `src/components/discovery/DiscoveryResultContent.jsx`, `MatchingReasons.jsx`.
- `src/features/preferences/options.js`, `PreferencesProvider.jsx`.
- `src/features/tourism/repository.js`, `useTourism.js`; `src/App.jsx`, `src/styles/global.css`.
- New `src/i18n/locales/recommendations.ar.txt`, generated locale JSON and resource-generation input list.
- New Phase 05 model/hosted/browser scripts, npm test commands, validation JSON, public snapshot and screenshots.
- README current-scope corrections and this report. No Admin implementation file or Supabase migration was changed.
