# PromaxCare staff mobile journey matrix

Date of this inspection: 21 October 2026.

Owner: mobile integration lead for `PMXsolutions/Promax-Mobile-App`. Care OS branches were not checked out and were not edited.

This file is the working matrix. It separates inspected code, unit tests run in this workspace, and device or hosted proof. Unit tests are not native acceptance and are not a Play-readiness claim.

## Baseline that was actually present

| Item | Evidence |
| --- | --- |
| GitHub `main` | `de4eb2f` Merge PR #7: prod API, login fix, DeviceTokens. This checkout started there. |
| Remote branches present | `main`, `codex/care-plan-intelligence-r1`, `codex/mobile-uat-qualification`, `cursor/care-os-mobile-test-target-466d`, `cursor/care-os-uat-app-id-466d`, `cursor/mobile-prod-sync-notify-cf4e`, `cursor/project-scope-document-dca7`, `cursor/promaxcare-mobile-app-audit-0111`, `cursor/promaxcare-mobile-app-audit-bb3f`, `cursor/promaxcare-mobile-audit-02fd`, `cursor/promaxcare-mobile-audit-25c7`. |
| Company-release branches | `engineering/promax-mobile-ios-company-release` and `codex/ios-company-release` are not on this remote. |
| Missing local delta | The described local company-release tree (uncommitted Expo 54, React 19.1, React Native 0.81.5, bootstrap, maps/places, push registration, trip tracking, reports/documents/file handling, company release config) is not in this workspace and is not on the remote. It was not recreated. |
| This tree's runtime | `package.json` on `de4eb2f`: Expo `^53.0.20`, React `19.0.0`, React Native `0.79.5`. Unchanged by the sign-in branch. |
| Android package on GitHub `main` | `com.tobby95.pmaxapp` in `app.json`. This is the legacy identity. |
| Intended company identity | `au.com.promaxsolutions.promaxcare` does not appear in any remote branch. The package id was not changed, because changing it here would invent a store identity without the missing local release files. |
| iOS bundle on GitHub `main` | `com.promax-app`. |
| API base compiled into config | `app.config.js` defaults to `https://api.promaxcare.com.au/api` when `EXPO_PUBLIC_API_BASEURL` is unset. `eas.json` sets that same URL for development, preview, and production. |
| Historical APK | Hash `c186cdb620838a505a34504271827c37abd173791f0aa47b1885a1e45ffd900f` was not reproduced. GitHub `main` is not evidence that the current source matches that file. |
| Exact Android 1.1.0 build 4 | `app.json` `version` is `1.1.0`. No build number or artifact for build 4 is in this checkout. Device test is Blocked. |
| Play publishing | Not submitted. Managed publishing and the ten unsubmitted Play changes were not touched. |

`codex/mobile-uat-qualification` is a separate remote line (Expo 57 qualification, still `com.tobby95.pmaxapp`). It was not merged. Care OS lines `cursor/care-os-mobile-test-target-466d`, `cursor/care-os-uat-app-id-466d`, and `codex/care-plan-intelligence-r1` were not merged and were not edited.

## Deployed web and API evidence

Private repositories `PMXsolutions/Promax-Web-FRONTEND` and `pmx_api_v2` are not visible to this GitHub credential (`Could not resolve to a Repository`). No API schema was copied into this branch.

Public read of `https://app.promaxcare.com.au` on 21 October 2026, with no login:

- HTML meta `app-release` is `quality-surveys-2026-09-09`.
- The shell script is `/assets/index-BV83UWOU.js`.
- A search of that bundle found no literal `2.14.19`.
- `/version` and `/assets/version.json` return the same HTML shell, not a version document.

Displayed web `v2.14.19` is therefore not confirmed from the public shell. It is not assumed from a Care OS branch. Endpoint compatibility below is the mobile client's current contract, not a hosted schema diff.

Public `https://api.promaxcare.com.au/swagger/index.html` returned HTTP 200. The swagger JSON URL tried (`/swagger/v1/swagger.json`) returned HTTP 404. No login, password reset, or email request was sent.

## API coordination handoff

Do not change `auth_login` from this mobile branch.

Task evidence, not re-checked against a hosted account: the API sends a verification email when `EmailConfirmed` is false before it validates the password, and it maps a send exception to `Error sending mail. Too many mails sent. Retry in One hour time.` The hosted account that produced the Play screenshot was not inspected. This branch does not call production login and does not send mail.

Mobile behavior added here: after that mail-limit text, the client stores a one-hour cooldown for that email and does not call `POST /Account/auth_login` again for it. A different email is not blocked. A genuine `Email Not Confirmed...` response still opens the existing code screen. Password rules, geofence distance, and report length rules are unchanged.

API follow-up, for the API owners: validate the password before sending mail, return a distinct error code for a mail-provider limit, and do not send mail for a wrong password. Health declaration remains unresolved and was not implemented.

## Worker roster

One working tree. Inspectors are read-only and are not approvers of these fixes. Android and iOS device seats are Blocked in this environment, so they were not filled with a badge.

| Seat | Who | Ownership | Writes code |
| --- | --- | --- | --- |
| Mobile integration lead | This agent | Sign-in, startup, session, matrix, branch `cursor/mobile-signin-session-states-65b8` | Yes |
| Documents and profile | Inspector `bc-bcc55231-93af-5142-b9e7-3dff489bda35` | Read documents and profile flows | No |
| Trip, mileage, maps | Inspector `bc-cb08bea5-1f9f-5154-877a-ff2f40381344` | Read trip and map flows. Must not edit Care OS trip commits | No |
| Notifications and deep links | Inspector `bc-5f87a3cf-791b-543e-acc9-9f7095c630e3` | Read push and linking | No |
| Release provenance | Inspector `bc-57d2ac8c-b8ed-584e-9f0e-c6132cb6826e` | Read identity and version files | No |
| Roster and clock | Inspector `bc-a942d1fd-2454-5746-83c1-9f65ffdf86cc` | Read roster and clock | No |
| Shift notes and report drafts | Inspector `bc-bac639ad-128f-5a20-9bf8-abd8dc78c9aa` | Read report save and reload | No |
| Android QA | Not run | Needs an authorised staff device. Joshua has no Android. | No |
| iOS QA | Not run | No simulator or signed device in this workspace | No |
| Independent retest | Not the author of the fix | Required before any Passed status moves from unit to acceptance | No |

## Journey matrix

Status words: Passed, Failed, Blocked, NA. "Lab" means a Jest assertion in this workspace. It is not a device or hosted pass.

| Journey | Role | Status | Why | Identifiers |
| --- | --- | --- | --- | --- |
| App leaves the splash when fonts fail or hang | Staff | Lab, device Blocked | `shouldBlockStartupForFonts` opens the UI on error or after 8 seconds. `fontFamilyForStartup` drops the custom family so text is not blank. Not installed on a device. | `libs/startup-fonts.ts`, `app/_layout.tsx`, `__tests__/startup-session.test.ts` |
| Startup does not stick on Loading when auth storage already hydrated | Staff | Lab, device Blocked | `bindAuthHydration` checks `hasHydrated()` and still subscribes. | `libs/auth-hydration.ts`, `app/index.tsx`, `components/wrapper/auth-wrapper.tsx` |
| Sign-in fields and button receive taps with the keyboard open | Staff | Failed on device, source contract added | Email and password inputs no longer sit inside `TouchableWithoutFeedback` that dismisses the keyboard. Sign-in `ScrollView` sets `keyboardShouldPersistTaps="handled"`. Play's unresponsive sign-in is the reported symptom. No device retest. | `components/shared/input.tsx`, `components/shared/password-input.tsx`, `app/(auth)/sign-in.tsx` |
| Sign-in shows a persistent error for the Play mail toast | Staff | Lab, hosted Blocked | The exact text `Error sending mail. Too many mails sent. Retry in One hour time.` is classified as `mail_rate_limited`, shown inline, and not sent to the OTP screen. A second request for that email is not made for one hour. Production login was not attempted. | `libs/login-failure.ts`, `libs/login-mail-guard.ts`, `modules/auth/sign-in-form.tsx` |
| Wrong password | Staff | Lab for the message `Invalid Login Attempt` | Shown as incorrect email or password. Live account not used. | `libs/login-failure.ts` |
| Email not confirmed | Staff | Lab for the existing message only | OTP navigation remains for that message. No OTP email was triggered. | `modules/auth/sign-in-form.tsx` |
| Offline or timeout during sign-in | Staff | Lab | No response and `ECONNABORTED` get distinct copy. The button returns to Sign in. | `readLoginErrorInput` |
| Double tap sign-in | Staff | Lab | `acquireSingleFlight` drops the second tap while the first is running. | `libs/single-flight.ts` |
| Non-staff role | Other role | Lab for the denial copy | No session is stored. Website is the other-role path. No new approval policy. | `roleDeniedFailure` |
| Expired access token | Staff | Lab for the status rule, UI Blocked | HTTP 401 calls `expireSession()`. HTTP 403 does not. Sign-in renders the session-expired notice from `sessionNotice`. Profile logout stays a no-argument press handler. No expired hosted token was used. | `libs/session-status.ts`, `libs/axiosInstance.ts`, `store/use-auth-store.ts` |
| Password length message | Staff | Lab not required | The schema already required 2 characters while the message said 4. The message now matches the existing rule. The rule was not tightened. | `modules/auth/validation/index.ts` |
| Remember me | Staff | Blocked, product decision | The checkbox is still stored only in component state and does not change persistence. Left unchanged so sessions are not silently dropped. | `modules/auth/sign-in-form.tsx` |
| Home, assigned roster | Staff | Failed inspection | `app/(root)/(tabs)/index.tsx` reads `shift.staff.fullName` without a null guard. Fetch errors collapse to "Unable to load shift." A missing `staffId` disables the query and shows an empty calendar. | `services/shift.ts` `GET /ShiftRosters/get_shifts_by_user` |
| Shift detail | Staff | Failed inspection | `shift.activities.split` throws when `activities` is null (`app/(root)/shift/index.tsx` and `modules/shift/shift-details.tsx`). Detail query has no error state. | `GET /ShiftRosters/{id}` |
| Clock in, geofence, location denied | Staff | Failed inspection, rule preserved | Location denial is a toast. Non-Axios clock errors are swallowed. Threshold stays 1000 metres in `hooks/queries/shift/clock-in.tsx`. Not bypassed. | `GET /Attendances/clock_in` |
| Clock out | Staff | Failed inspection | `hooks/queries/shift/clock-out.ts` only surfaces Axios errors. No offline copy. | `GET /Attendances/clock_out` |
| Shift report draft, reload, duplicate submit | Staff | Failed inspection | `modules/report/add-report-form.tsx` keeps the form in memory only. A reload loses it. Submit disables via `isPending` but a killed in-flight request can be sent again. 100-character goal rule and incident-detail rule stay. | `POST /ShiftReports/add_shiftreport` |
| Downstream web visibility of a report | Staff | Blocked | No disposable user, no hosted read-back, web repo unavailable. | — |
| Documents upload failure | Staff | Blocked pending inspector | Client contract is `POST /Documents/add_document`. Device file failures were not run. | — |
| Profile, bank, emergency | Staff | Blocked pending inspector | Screens exist. Permission and save/reload were not device-tested. Bank data must not be copied into logs. | — |
| Trip mileage and maps | Staff | Blocked pending inspector | Care OS branch `cursor/care-os-uat-app-id-466d` already contains trip odometer commits. This lead will not edit that branch. | `GET /ShiftRosters/fill_mileage` |
| Push and deep links | Staff | Blocked pending inspector | No push was sent. Scheme in `app.json` is `myapp`. | `POST /DeviceTokens/add_token` |
| Cross-tenant and unassigned denial | Staff | Blocked | Client does not show a dedicated denial state for another tenant or an unassigned shift. Server enforcement was not verified. Do not invent an approval policy. | — |
| Health declaration | Staff | NA for this branch | Called out as separately unresolved. No screen was added. | — |
| Small-screen, keyboard, touch | Staff | Partial source change, device Blocked | Sign-in controls are at least 44–48 px and expose labels. No screenshot from a device or emulator. | — |
| Google Play review login | Reviewer | Blocked on purpose | Not attempted. | — |
| Play production rollout | Release | NA | Not submitted. | — |

## What this branch changes

Branch: `cursor/mobile-signin-session-states-65b8`, based on `de4eb2f`.

Implemented, not packaged, not deployed, not device-verified:

- Startup continues when fonts fail or take longer than 8 seconds, and text falls back to the platform font.
- Auth hydration cannot leave the first screen on an endless loader if persist already finished.
- Sign-in errors stay on the form, including the known mail-limit text.
- The mail-limit path does not open OTP and does not call login again for that email for one hour.
- A second sign-in tap during the request is ignored.
- The signing-in button keeps its label.
- 401 clears the session and the sign-in screen can say the session expired. 403 does not clear it.
- Email and password fields are no longer wrapped in a control that dismisses the keyboard.

## Verification log

| Check | Result | Date |
| --- | --- | --- |
| Jest `npx jest --watchAll=false --forceExit --testPathPattern='login-failure\|startup-session\|shift-service'` | Passed. 3 suites, 23 tests, 21 October 2026. This is a unit run, not a device or hosted pass. | 21 October 2026 |
| Android emulator or device | Blocked. No authorised staff device in this workspace. | 21 October 2026 |
| iOS simulator or device | Blocked. | 21 October 2026 |
| Disposable user save, reload, and web read-back | Blocked. No disposable account was used. | 21 October 2026 |
| Production email, SMS, push, Play submit, EAS, OTA | Not done. | 21 October 2026 |

Screenshots: none. A passing unit test is not a screenshot of the sign-in screen.
