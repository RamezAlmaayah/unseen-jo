# Unseen Jo — Image Loading Performance Report

Date: 19 October 2026. Project: `dkhwwvoplhfjccvjegty`.

## Outcome

Responsive image delivery is implemented across tourism cards, previews, map popups, galleries, original-photo viewing, Home artwork and private Admin media previews. The approved layout, crops, branding, Arabic/English content and RTL/LTR behavior are retained.

All six destinations were **already published at the start of this task**. This work performed no publication, uploads, content edits, translation approvals, image-rights approvals, bucket changes or RLS changes. Before/after hosted fingerprints match for places, translations, image records, Storage objects, buckets and policies: [preservation evidence](validation/image-preservation.json). Phase 05 was not started.

## 1. Root causes established by measurement

- The public repository supplied one full-file signed URL for each photo. A card, popup and large gallery therefore downloaded the same large original. The live Ajloun cover is **4000 × 3000, 5,161,429 bytes**; its card can occupy approximately 225–355 CSS pixels. The sampled Dana cover is **3453 × 2474, 2,242,965 bytes**.
- Existing responsive JPEG derivatives in `docs/evidence/automated-publishing/responsive/` were preparation evidence, **not active image delivery**. No responsive `srcset` connected them to the public UI. They were not copied into public assets or uploaded during this task.
- Local presentation assets were also oversized: the shared brand logo is a 639,938-byte, 1312 × 1199 PNG displayed at 56 × 53. Large photographic PNGs and full-size Figma JPEGs likewise lacked responsive delivery.
- Large transfers dominated the slow-photo cases. Storage/signing latency also remains material: the live HTTP probe measured roughly **0.59–1.34 seconds to response headers** for the sampled transformed requests. Resizing does not eliminate that latency.
- The previous phase already reused original signed URLs within their valid lifetime. Ordinary focus-driven URL regeneration was **not newly identified as the primary cause**. That existing behavior is preserved and extended to resized variants.
- Vite development additionally transfers unbundled modules and initializes the map. Its startup timings remain much slower than production preview. Image optimization does not remove that separate development overhead.

Evidence: [original live record snapshot](../artifacts/image-performance/live-before.json), [initial actual before measurements](validation/image-loading-before.json), [hosted image GETs, headers and dimensions](validation/hosted-image-delivery.json).

## 2. Changes implemented

### Responsive delivery

Public and private images continue through the existing private `place-images` bucket and SDK authorization. Supported display widths are 320, 640, 1280 and 2400 pixels, with quality 90 and aspect-preserving `contain` resizing. The browser chooses candidates using `srcSet`, `sizes`, viewport and device pixel ratio. Existing CSS applies the approved presentation crop.

| View | Delivery |
|---|---|
| Map popup | 320 / 640 candidates |
| Destination and featured cards | 640 / 1280 candidates |
| Large result and preview | 640 / 1280 / 2400 candidates |
| Main Place Details gallery image | 640 / 1280 / 2400 candidates |
| Supporting gallery images | 640 / 1280 candidates |
| Explicit full-photo viewer | Original signed file; no responsive replacement |
| Private Admin previews/library | Signed display variants scoped to the current Admin repository |

The project’s transformation endpoint was **already enabled and returned a real image before implementation**. No plan upgrade, paid-service activation or Storage setting change was made. Use remains subject to the project’s existing transformation quota/billing. The API returns WebP to the measured Chromium image requests. Supabase documents the capability and its plan requirements in [Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations).

Local presentation assets now have **119 distinct WebP derivatives**, covering 51 original paths and 32 distinct raster originals. Identical source assets reuse outputs. Quality is 92, resizing preserves aspect ratio and never upscales local originals. Original files remain unchanged. Generated names contain the hash of the actual derivative bytes, allowing immutable caching safely. The detailed [derivative inventory](validation/local-image-derivatives.json) records dimensions, sizes and hashes; the runtime manifest carries only delivery information.

### Loading and reuse

- Near-viewport signing uses IntersectionObserver with a 400-pixel margin. Native lazy loading defers offscreen photos. On normal delivery, full-resolution gallery originals are requested only when the viewer is opened; a failed transformation can use the authorized original as a fallback.
- Home hero and the leading gallery photo use eager/high-priority loading. Supporting content stays lazy. No blanket image preloading was introduced.
- Existing fixed image areas and width/height attributes reserve layout. A lightweight background occupies pending signed-image areas. Newly arriving images fade briefly; cached arrivals avoid the fade, and reduced-motion preferences disable it.
- Identical signing requests coalesce. There are at most four concurrent variant-signing operations and bounded in-memory variant caches. Signatures use the existing 300-second lifetime and are reused for at most 270 seconds, leaving an expiry margin. Failed requests can retry; transformation failures fall back to an authorized original.
- Public mutation invalidation clears the relevant delivery cache. Private preview caches belong to an Admin repository recreated when the account changes, so a different account does not inherit cached private image data.
- No signed tokens, private image caches or editing state are written to persistent browser storage. Language changes preserve the photo sources.
- Vite development and preview set `Cache-Control: public, max-age=31536000, immutable` **only** for generated, content-addressed local derivatives. Supabase responses and draft/private media cache policies are not overridden.

### Actual Storage caching observations

Stored originals report `cacheControl: max-age=60` in object metadata. The sampled signed GET responses exposed ETag and Expires headers, with expiry corresponding approximately to the signed URL lifetime; they did not expose a Cache-Control header in the collected response. Sampled first-use CDN responses were MISS. Those observations are distinct from the object metadata setting.

Keeping the same valid URL lets the browser reuse downloaded/decoded resources. Renewal after expiration and a larger image when opening Details or the original viewer are intentional requests. No public bucket URL, persistent capability or token rewriting was introduced. See [Supabase CDN documentation](https://supabase.com/docs/guides/storage/cdn/fundamentals).

## 3. Before/after measurements

### Method

Actual headless Chromium loaded genuine anonymous hosted destinations, translations and signed Storage images. No content/API mocks were used in the loading comparison. Cold contexts used:

- Desktop: 1440 × 1000, DPR 1, 10 Mbps download, 40 ms emulated latency.
- Mobile: 390 × 844, DPR 2, 4 Mbps download, 80 ms emulated latency.

There are 12 cases per rendering path: Home, Explore and Ajloun Details, desktop/mobile, development/production preview. The controlled baseline uses the original full-file image renderer in a **measurement-only Vite configuration**, while retaining the current surrounding application and genuine hosted data. This isolates image delivery; it is not an old application release. Initial measurements taken before implementation are retained separately and corroborate the oversized transfers.

Reduced-motion mode was enabled for repeatability; these samples do not include entrance-animation delays.

The final comparison corrects visibility checks for Explore’s clipped scroll container and modal top-layer behavior. Early diagnostic `image-loading-after.json` samples that incorrectly waited for clipped offscreen cards are excluded. Final artifacts are [baseline-corrected](validation/image-loading-baseline-corrected.json) and [optimized-corrected](validation/image-loading-optimized-corrected.json). All 24 final cold cases completed with no image-wait timeout or page error.

Image bytes below are CDP-observed image transfer at the visible-image-ready checkpoint, including non-photo presentation images. Offscreen deferral intentionally changes which requests finish by that checkpoint. They are not total-session bandwidth or field averages. LCP is a navigation-level lab observation. Each cell is one sample, not a statistical percentile or a guaranteed speedup.

### Production preview

| Page/device | Image transfer before → after | LCP before → after |
|---|---:|---:|
| Home, desktop | 12.81 → **0.36 MB** | 4.42 → **0.92 s** |
| Home, mobile | 12.81 → **0.15 MB** | 15.06 → **1.11 s** |
| Explore, desktop | 13.20 → **2.21 MB** | 9.17 → **4.03 s** |
| Explore, mobile | 12.76 → **2.87 MB** | Interaction-limited; see note |
| Ajloun Details, desktop | 6.50 → **0.49 MB** | 7.46 → **4.01 s** |
| Ajloun Details, mobile | 6.50 → **0.50 MB** | 15.30 → **4.36 s** |

Mobile Explore requires selecting List. That interaction stops LCP observation; its 0.96/0.98-second values describe earlier text, not completed photo loading. They are **not evidence of faster image LCP**. Use transfer and image-ready observations instead.

### Vite development

| Page/device | Image transfer before → after | LCP before → after |
|---|---:|---:|
| Home, desktop | 3.91 → **0.36 MB** | 16.92 → **12.68 s** |
| Home, mobile | 3.91 → **0.15 MB** | 40.20 → **30.19 s** |
| Explore, desktop | 13.20 → **2.21 MB** | 27.21 → **23.35 s** |
| Explore, mobile | 12.76 → **2.87 MB** | Interaction-limited |
| Ajloun Details, desktop | 6.50 → **0.49 MB** | 25.68 → **17.80 s** |
| Ajloun Details, mobile | 6.50 → **0.50 MB** | 49.84 → **38.56 s** |

Development Home reaches its checkpoint before some catalog photos arrive, explaining its smaller baseline observed total than preview. Compare within the same build/device, not between development and preview totals.

No image-associated layout-shift sources were recorded in the final samples. Overall CLS is not zero: mobile Explore was approximately 0.105 in preview. This work does not claim to resolve all layout shifts. Cached `decode()` probes were collected, but do not measure initial decoder CPU time; no decoder-speed improvement is claimed.

### Individual hosted photo evidence

For the same Ajloun photo, the actual original is 5,161,429 bytes at 4000 × 3000. The authorized 640-pixel WebP is **95,732 bytes**, and the 1280-pixel WebP is **388,858 bytes**. The sampled unthrottled HTTP GET took 2.86 seconds for the original and approximately 1.18/1.15 seconds for those display versions. These are individual requests affected by CDN/network state, separate from the browser LCP experiment.

## 4. Quality and security preservation

- Existing photographic originals and all 83 inventoried local asset references retain their approved hashes. Full-file viewer checks confirm the original Storage endpoint is used.
- Local derivatives retain proportions without upscaling. Two sampled hosted originals and their six variants were independently decoded and inspected; none was upscaled. Pixel comparisons against a Lanczos-resized reference measured 31.16–36.96 dB PSNR. This describes sampled encoding differences, not a perceptual-quality guarantee or a claim that display compression is lossless.
- Screenshots were reviewed for identity, crop, sharpness and layout. The forest cover and supporting photograph remain correctly associated with Ajloun. Existing source URLs, photographer/attribution text and licensing records are unchanged.
- No private draft media was copied into the public asset directory. An actual anonymous transformed-signing request for the unapproved old test upload was denied.
- Hosted checks confirm six public destinations, twelve approved public image rows, reviewed current Arabic translations, hidden draft/unapproved predicates and denied private-table/CMS access. Existing RLS and short-lived authorization remain in force.
- React review checked stable delivery objects/effect dependencies, observer cleanup, stale-result suppression, bounded caches, reduced motion and account isolation. No broad memoization or authentication changes were introduced.

## 5. Validation and remaining limits

Completed validation:

- **32/32 existing regression jobs passed**, covering layout, tourism, MapLibre, Near You, CMS, invitations, localization, accessibility and bilingual review.
- **5 deterministic image-delivery groups passed**, covering coalescing, expiry, bounded concurrency, failures, private account isolation and actual derivative integrity.
- **12 genuine bilingual destination-page checks passed**: all six destinations, all twelve distinct photos, 24 photo renders. Both live WCAG A/AA accessibility audits reported zero violations.
- **4 genuine browser image-flow cases passed** across development/preview and desktop/mobile: language changes, filters, Home/Explore SPA reuse and original-photo viewing. Five-second returns were tested in all four cases; preview desktop also tested thirty seconds. Previously completed image bodies were not downloaded again during the recorded SPA navigation. Newly encountered images are reported separately.
- **1 isolated transform-failure check passed**: only the transformed GET was intentionally failed; actual anonymous signing and the authorized original GET remained genuine.
- **2 genuine map-popup return observations passed**, after five and thirty seconds, retaining the same canvas, photo source, selected marker and zoom with zero image requests.
- **24 cold loading samples completed** without image-wait timeouts or page errors.
- Oxlint, the 83-reference original asset validation and production build passed. The large-chunk warning remains documented below.

Final outcomes are recorded in [the summary](validation/image-performance-summary.json), [regression index](validation/publishing-performance-regressions.json), [browser reuse checks](validation/image-browser-tests.json), [live bilingual photo checks](validation/live-tourism-image-tests.json) and [map-popup reuse checks](validation/live-map-image-reuse.json).

Historical tests were updated for the **already-published** catalogue; explicit empty/error fixtures retain those test cases. The unavailable-image fixture now intercepts all responsive candidates for the same original. Initial parallel browser runs hit resource/provider errors; affected regression checks were rerun successfully with less competing browser work. A broader fixture visibility attempt encountered a map-error overlay during parallel execution; it is not claimed as a successful 24-observation rerun. The genuine single-context popup return checks and image-flow checks above provide the completed image-specific visibility evidence. Failed/diagnostic runs are not timing evidence.

Limitations:

1. Existing transformation/signing and network latency remain. A smaller image does not make those operations instantaneous. Signing new sizes adds first-use read-only requests, controlled by coalescing and bounded parallelism.
2. The existing transformation service’s quota/billing applies. No new service was enabled. A deployment on another static host must retain the documented immutable header for `/assets/responsive/`; localhost Vite development/preview implement it here.
3. An expired signature, newly invalidated record, higher-resolution view or newly visible photograph can legitimately require a request. Browser caching, eviction and tab discarding cannot be universally prevented.
4. There is no connected owner browser/Admin session in the computer-use tool. Public reads/media in the tests are genuine; authenticated Admin operations remain fixture-based regression checks. No owner Chrome/Memory Saver claim is made. Visibility tests use controlled standard events in Chromium.
5. A pre-existing Dana attribution processing note mentions a ≤2000-pixel preparation, while its current hosted original measured 3453 × 2474. The original record was preserved; that processing note can be reconciled separately. Photographer, source and licence metadata remain intact.
6. Production still reports the existing large-bundle warning, including MapLibre. This task did not redesign the map or remove its capabilities.

### Modified implementation files

- `src/features/tourism/imageDelivery.js`, `repository.js`, `model.js`.
- `src/components/ui/AssetImage.jsx`, `imageSources.js`; `src/data/responsive-images.json`.
- `src/components/landing/FeaturedCard.jsx`; discovery `DestinationCard.jsx`, `DestinationPreview.jsx`, `PhotoGallery.jsx`; map `DestinationPopup.jsx`; layout `SiteHeader.jsx`.
- `src/pages/LandingPage.jsx`, `SurpriseMePage.jsx`.
- Admin `repository.js`, `AdminApp.jsx`, `DraftPreview.jsx`, `Management.jsx`.
- `src/styles/images.css`, `global.css`; `vite.config.js`; generated `public/assets/responsive/*.webp`.
- Preparation, measurement, browser/cache/quality verification scripts and the measurement-only baseline config under `scripts/`; related legacy test fixtures/assertions and validation artifacts.

### Reproduction

Run the app at `http://127.0.0.1:4184` and production preview at `http://127.0.0.1:4190`. The measurement-only baseline config uses ports 4183/4192 and its own build/cache directories. `scripts/measure-image-loading.mjs` accepts `QA_IMAGE_DEV` and `QA_IMAGE_PREVIEW` to select those servers.

Relevant commands: `python scripts/prepare-local-responsive-images.py`, `node scripts/check-image-delivery.mjs`, `node scripts/measure-image-loading.mjs optimized-corrected`, `node scripts/check-image-browser.mjs`, `node scripts/check-live-tourism-images.mjs`, `node scripts/probe-hosted-image-delivery.mjs`, `python scripts/analyze-image-quality.py`, `node scripts/run-publishing-performance-regressions.mjs`, and `npm run validate`.
