# PromaxCare staff mobile journey matrix

Date: 21 October 2026.

This branch continues the matrix from pull request 9 (`cursor/mobile-signin-session-states-65b8`, commit `0e6c9d4`). Sign-in, font startup, and session expiry are implemented there and are not repeated here. This branch is roster, clock, and report drafts only. It is based on `main` at `de4eb2f`.

Care OS branches were not edited. No production login, email, clock-in, report, Play submission, or EAS build was run. Unit tests are not device acceptance.

## Rows changed by this branch

| Journey | Role | Status | Why | Identifiers |
| --- | --- | --- | --- | --- |
| Home roster with a missing staff object | Staff | Lab for the null guard, device Blocked | The agenda no longer reads `shift.staff.fullName` when `staff` is missing. | `app/(root)/(tabs)/index.tsx` |
| Home roster load error and offline | Staff | Lab not required for the copy, device Blocked | A network failure from `GET /ShiftRosters/get_shifts_by_user` now says the device appears offline. A missing staff id shows that assigned shifts cannot load. | `services/shift.ts` |
| Shift detail with empty activities | Staff | Source fix, device Blocked | `activities` is split only when it is a string, in the detail screen and the detail body. | `app/(root)/shift/index.tsx`, `modules/shift/shift-details.tsx` |
| Shift detail request failure | Staff | Source fix, device Blocked | The screen shows the fetch error and a retry instead of rendering an empty shift. | `GET /ShiftRosters/{id}` |
| Client map without a profile | Staff | Source fix, device Blocked | A missing profile shows “Client location is not available” instead of throwing. Coordinates of zero still use the existing map fallback. | `components/map/small-map.tsx` |
| Clock-in radius | Staff | Lab | 1000 metres stays the boundary. 1000 is inside. 1001 is outside. Location denial does not skip the check. | `libs/geofence.ts`, `hooks/queries/shift/clock-in.tsx` |
| Clock-in or clock-out with no response | Staff | Lab for the message | The message tells staff to check the shift before trying again, so a lost response is not treated as a clean failure. | `libs/attendance-error.ts` |
| Report length and incident details | Staff | Lab | 100 non-space characters and incident details are still required before a send. | `libs/report-validation.ts` |
| Report draft reload | Staff | Lab for the state machine, device Blocked | Create and edit forms save text on this device and restore it. A corrupt draft is ignored. | `libs/report-draft.ts`, `hooks/use-report-draft.ts` |
| Duplicate report send | Staff | Lab for the lock, hosted Blocked | An in-flight draft cannot be sent again until the user confirms they checked the report list. The API was not given a new idempotency field. Downstream web visibility was not tested. | `POST /ShiftReports/add_shiftreport`, `POST /ShiftReports/edit/{id}` |
| Disposable user save and web read-back | Staff | Blocked | No disposable account and no web repository access. | — |
| Android and iOS device pass | Staff | Blocked | No authorised device or simulator run. | — |

## Verification

`npx jest --watchAll=false --forceExit --testPathPattern='roster-report-reliability|shift-service'` on 21 October 2026: 2 suites, 13 tests, passed. That is a unit pass only.

## Still not this branch

Documents, profile, bank, trip mileage, push, deep links, health declaration, company package id `au.com.promaxsolutions.promaxcare`, and the missing local Expo 54 tree stay out of scope. The Android package remains `com.tobby95.pmaxapp`.
