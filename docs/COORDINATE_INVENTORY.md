# Coordinate verification inventory — Phase 03

Reviewed 18 October 2026. **No database updates or publication actions were performed.** The last privileged database verification (Phase 02B, 16 October) recorded all six destinations with NULL coordinates. On 18 October the public API again returned seven categories and zero published places. The dedicated MCP OAuth refresh failed, so current private draft/coordinate counts could not be independently refreshed.

Coordinates below are reference points, not surveyed entrances. Five supported points enrich the explicitly labeled local demo in `src/features/map/geography.js`. They do not change the starter import, database or publication safeguards. Production uses only published rows readable under existing RLS.

| Destination / slug | City or region | Current DB status last verified | Geographic evidence | Proposed latitude, longitude | Precision and unresolved questions |
| --- | --- | --- | --- | --- | --- |
| Ajloun Forest Reserve / `ajloun-forest` | Ajloun | Draft; NULL coordinates (last privileged check) | [Jordan Tourism Board reserve Location link](https://international.visitjordan.com/wheretogo/ajloun/) | 32.3835625, 35.7604375 | Official reference pin 9QM6+C5. Not independently surveyed or confirmed as an entrance. Demo only. |
| As-Salt Historic Centre / `salt-historic` | As-Salt, Balqa | Draft; NULL coordinates | [UNESCO property 689](https://whc.unesco.org/en/list/689/) explicitly lists N32 2 33.4 E35 43 41.9 | 32.0426111111, 35.7283055556 | Heritage-property reference point converted from DMS. Not a car park, entrance or route endpoint verified for access. Used only in local demo. |
| Dana Biosphere Reserve / `dana-reserve` | Tafilah | Draft; NULL coordinates (last privileged check) | [Jordan Tourism Board Dana Location link](https://international.visitjordan.com/wheretogo/dana-feynan/) | 30.6743125, 35.6083125 | Official Dana reference pin MJF5+P8. Not a reserve boundary or verified arrival point. Demo only. |
| Mujib Biosphere Reserve / `wadi-mujib` | Dead Sea region | Draft; NULL coordinates (last privileged check) | [Jordan Tourism Board Siq Trail Location link](https://international.visitjordan.com/wheretogo/wadi-mujib/) | 31.4670625, 35.5731875 | Official reference pin FH8F+R7. Not a surveyed trail entrance or access guarantee. Demo only. |
| Umm Qais Archaeological Site / `umm-qais` | Irbid | Draft; NULL coordinates | [Jordan Tourism Board](https://international.visitjordan.com/wheretogo/umm-qais/) | None | Destination identity supported; linked map could not be independently retrieved to confirm a visitor pin. |
| Iraq Al-Amir / `iraq-al-amir` | Amman region | Draft; NULL coordinates | [Jordan Tourism Board Amman page](https://international.visitjordan.com/wheretogo/amman/), Iraq Al-Amir Location link | 31.9195625, 35.7533125 | Official feature pin, not independently surveyed. Arrival/access suitability unconfirmed. Google link contains a different camera longitude after `@`; use the feature `!3d31.9195625!4d35.7533125` values. Used only in local demo Details. |

Draft slugs are as recorded in the starter manifest; the source manifest remains the import authority. No inference is made about hours, price, road access, travel time, rights-cleared media or publication readiness from coordinates alone.

## Manual location reference points

The browser offers three populated-place reference points from GeoNames, under [CC BY 4.0](https://www.geonames.org/about.html). They are approximate city centres, expressly distinct from the user's GPS location. No geocoding request or user location is sent to GeoNames.

| City | Latitude | Longitude | Independently opened source |
| --- | --- | --- | --- |
| Amman | 31.95522 | 35.94503 | [GeoNames 250441](https://www.geonames.org/250441/amman.html) |
| Irbid | 32.55556 | 35.85000 | [GeoNames 248946](https://www.geonames.org/248946/irbid.html) |
| Aqaba | 29.52667 | 35.00778 | [GeoNames 250774](https://www.geonames.org/250774/aqaba.html) |

Browser automation uses explicitly synthetic positions to exercise permission handling and distance filtering. It does not verify physical GPS accuracy. WGS84 latitude/longitude are validated as finite numbers within the renderer's Mercator range. NULL, strings, out-of-range and non-finite values never become destination markers or directions.

Final demo quality pass: primary HTML location links were retrieved on 18 October 2026 and archived in `artifacts/phase03-quality/official-location-links.json`. Coordinates come from feature `!3d`/`!4d` fields, never the offset `@` camera longitude. Google consent prevented independent visual inspection of some linked map pages; these remain explicitly qualified tourism-board reference pins.
