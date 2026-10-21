# PromaxCare staff mobile acceptance matrix

Date: 21 October 2026. This is the single acceptance record for the current staff app. It is not a store, Play, EAS, or OTA readiness claim. Pull requests 9, 10, and 11 stay draft. They were not merged.

Care OS was not edited. `origin/cursor/care-os-mobile-test-target-466d` is `981bea5ca495dc8a091590e3fe4d004f9571d6f5`. No production login, email, SMS, push, invite, clock-in, report, document write, or access change was performed.

## Provenance

| Item | Value |
| --- | --- |
| Repository | `PMXsolutions/Promax-Mobile-App` |
| GitHub `main` | `de4eb2f` Merge PR #7: prod API, login fix, DeviceTokens |
| Company-release delta | `engineering/promax-mobile-ios-company-release` and `codex/ios-company-release` are absent from this remote. The local Expo 54 / React 19.1 / React Native 0.81.5 tree was not recreated. |
| Intended company id | `au.com.promaxsolutions.promaxcare` is not in any remote. It was not applied. |
| Android package on these commits | `com.tobby95.pmaxapp` |
| iOS bundle on these commits | `com.promax-app` |
| Versions | `package.json` `1.0.0`. `app.json` `1.1.0`. Root `runtimeVersion` `1.0.0`. iOS runtime policy `appVersion`. `eas.json` `appVersionSource` `remote`. |
| SDK on these commits | Expo `^53.0.20` (installed `53.0.27`), React `19.0.0`, React Native `0.79.5` |
| Lockfile | `bun.lockb` only. No `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`. `bun` is not installed here, so `bun install --frozen-lockfile` was not run. |
| API base variable | `EXPO_PUBLIC_API_BASEURL` (unset in this agent). Code fallback host is the public API already committed in `libs/axiosInstance.ts` and `eas.json`. |
| Maps variable | `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (unset). Name only. |
| Push file | `google-services.json` is gitignored and absent. Not requested. |
| Sign-in PR | [#9](https://github.com/PMXsolutions/Promax-Mobile-App/pull/9) `0e6c9d4065d36796d49254ad2c4d4868eb030aeb`, follow-up `de8516cdb879f37e30f3061e0545defc00ad56ad` |
| Roster and drafts PR | [#10](https://github.com/PMXsolutions/Promax-Mobile-App/pull/10) `9b9bbb8d5e87ceb3b664cd236b101a0838ed032e`, `09eaddc73eff4f1d11ecbad5e8411c0349950982`, follow-up `3af36b3814675a14c0c0c644e271234f58a0cbd5` |
| Profile, documents, trip, notifications PR | [#11](https://github.com/PMXsolutions/Promax-Mobile-App/pull/11) `cb70d3baff018be936b62d06bb907e7397738e88`, follow-up `c9dc6a11dbb94e357eef2c47bee2629162571e15` |
| Web display | Public `app.promaxcare.com.au` meta `app-release=quality-surveys-2026-09-09`. Literal `2.14.19` was not in that shell. `Promax-Web-FRONTEND` and `pmx_api_v2` were not readable with this credential. |

## Author unit runs on the follow-up commits

These are the author's runs on 21 October 2026. They are not a second-person pass and not device acceptance.

| Branch commit | Command | Result |
| --- | --- | --- |
| `de8516cdb879f37e30f3061e0545defc00ad56ad` | `CI=1 npx jest --watchAll=false --watchman=false --forceExit --testPathPattern='login-failure\|startup-session' --no-coverage` | 2 suites, 23 tests, passed |
| `3af36b3814675a14c0c0c644e271234f58a0cbd5` | `CI=1 npx jest --watchAll=false --watchman=false --forceExit --testPathPattern='roster-report-reliability\|shift-service' --no-coverage` | 2 suites, 14 tests, passed |
| `c9dc6a11dbb94e357eef2c47bee2629162571e15` | `CI=1 npx jest --watchAll=false --watchman=false --forceExit --testPathPattern='profile-trip-follow-up\|shift-service' --no-coverage` | 2 suites, 10 tests, passed |

`npx tsc --noEmit` was not re-run on these follow-ups. A previous run of `main` still had existing type errors in `hooks/usePushNotification/index.ts`. `npm run test` is `jest --watchAll` and will not exit.

## Independent retest

Three reviewers were started in isolated git worktrees on this VM, against the parent commits `0e6c9d4`, `09eaddc`, and `cb70d3b`, not against the follow-ups above. Their reports were not back when this file was written. Until those reports are folded in, no row below is a second-person pass.

The six earlier explorers are idle, have no branch, and are not review capacity for these pull requests: [Roster clock-in gaps](https://cursor.com/agents/bc-a942d1fd-2454-5746-83c1-9f65ffdf86cc), [Report draft save gaps](https://cursor.com/agents/bc-bac639ad-128f-5a20-9bf8-abd8dc78c9aa), [Notification deep link gaps](https://cursor.com/agents/bc-5f87a3cf-791b-543e-acc9-9f7095c630e3), [Trip maps mileage gaps](https://cursor.com/agents/bc-cb08bea5-1f9f-5154-877a-ff2f40381344), [Documents profile gaps](https://cursor.com/agents/bc-bcc55231-93af-5142-b9e7-3dff489bda35), [Release provenance inspector](https://cursor.com/agents/bc-57d2ac8c-b8ed-584e-9f0e-c6132cb6826e).

## Environment used for this record

Team environment [`d81efd47-cd22-11f1-bec7-b2318963e0b6`](https://cursor.com/dashboard/cloud-agents/environments/e/d81efd47-cd22-11f1-bec7-b2318963e0b6). Saved config has no recognized install or start. Build [`bld-20261021-7fa3944b-ea2b-48cf-b709-0e14cfad53b8`](https://cursor.com/dashboard/cloud-agents/builds/bld-20261021-7fa3944b-ea2b-48cf-b709-0e14cfad53b8) succeeded at 2026-10-21T07:42:20Z after cloning `main` and running platform setup only. This agent booted the default image before that snapshot existed (`defaultImageFallback`). No new environment was created.

Verified on this machine: Node `v22.23.3`, npm `10.9.9`, Corepack `0.36.0`, Yarn `1.22.22`, pnpm `10.33.4`, Expo package `53.0.27`, OpenJDK `21.0.12.1`, Python `3.12.3`, git `2.43.0`, Linux `x86_64`.

Missing: `bun`, `ANDROID_HOME`, Android SDK, `adb`, `emulator`, `sdkmanager`, `xcodebuild`, `simctl`, `watchman`. iOS builds cannot run here. No Android package was produced.

Safe GET only, 21 October 2026: `https://api.promaxcare.com.au/api` 404, `/swagger/index.html` 200, `/swagger/v1/swagger.json` 404, `/health` 404, `/api/health` 404. There is no isolated disposable API. Unit tests do not need the two public variables. Maps and push still need `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` and `google-services.json`, which were not added.

## Acceptance

Status is Passed, Failed, Blocked, or NA. Passed means the named unit contract passed in the author run above. It does not mean a device, a hosted account, or a store build passed.

| Journey | Role | Status | Reason |
| --- | --- | --- | --- |
| Sign-in stays on the form when the Play mail sentence is returned | Staff | Passed | `de8516c` classifies `Error sending mail. Too many mails sent. Retry in One hour time.` as `mail_rate_limited`, does not open OTP, and sets `allowImmediateRetry` false. Author jest only. |
| One-hour block is per email, including a second address on the same device | Staff | Passed | `upsertMailCooldown` keeps both entries. Device AsyncStorage was not exercised. The server was not called. |
| Nested or string error body still matches that sentence | Staff | Passed | `messageFromLoginPayload` covers `response.message`, `Response.Message`, and a string `response.data`, which are the fields `main` already displayed plus the nested wrapper. |
| Mail limit is enforced by the API | Staff | Blocked | Client cooldown only. API handoff: validate the password before sending mail and return a distinct limit code. `pmx_api_v2` was not readable. |
| Shorter `Error sending mail.` without the hour sentence | Staff | Blocked | Classified as `mail_send_failed` with retry still allowed. The hosted body was not captured. |
| Startup font hang and session hydration | Staff | Passed | Covered by `startup-session` jest on `de8516c`. No device launch. |
| HTTP 401 expires the session and HTTP 403 does not | Staff | Passed | Unit contract on PR 9. No hosted token was expired. |
| Remember me persists a session | Staff | Blocked | The checkbox does not change zustand persist. Left unchanged. |
| Invalid password and unknown user stay off OTP | Staff | Passed | Exact strings `Invalid Login Attempt` and `User Not Found` in the classifier. Not sent to the host. |
| Home roster, clock-in, and report reload on a staff device | Staff | Blocked | No emulator, no authorised disposable user, no hosted read-back. |
| Second clock-in tap while the first check runs | Staff | Passed | `canStartClockAttempt` on `3af36b3`. Server duplicate acceptance is not proven. |
| Clock-in radius stays 1000 m | Staff | Passed | `CLOCK_IN_RADIUS_METERS` is 1000. Location denial does not skip the check. No device GPS run. |
| Report draft is isolated by company and staff | Staff | Passed | Key `promaxcare.report-draft.c{company}.s{staff}.{kind}.{roster}`. Staff id `0` returns null and the hook does not read storage. |
| Drafts encrypted, or removed on logout | Staff | Blocked | AsyncStorage plaintext. Logout does not delete them, so the same staff member can restore them. Another account does not use that key. SecureStore's 2048-byte limit was not used for draft text. |
| Uncertain in-flight submit cannot be sent again until acknowledged | Staff | Passed | `beginDraftSubmit` returns `in_flight` and `acknowledgeUncertainSubmit` moves it to `failed`. No hosted duplicate-report check. |
| Edited report refreshes the open report query | Staff | Passed | Invalidates `["staffReport", reportId, shiftId]` in the PR 10 source. No web read-back. |
| Personal and employment profile load errors | Staff | Blocked | Source has loader and error states. Not opened on a device. |
| Emergency and other-info edit of another staff id | Staff | Passed | `c9dc6a1` uses `isOwnStaffRecord` and does not fetch when the route id differs. Not hosted. |
| Document id from another company or user | Staff | Passed | `documentOwnedBySession` denies a different company id, or a user id that matches neither staff id nor session user id. A payload with no owner id is only company-checked. The detail API was not called. |
| Bank, identity, and availability screens | Staff | NA | They already read the session staff id. No route-id edit was added. |
| Trip mileage refuses a missing, zero, or non-increasing odometer | Staff | Passed | `mileageSubmitDecision` on `c9dc6a1`. GPS distance is not the saved end reading. `GET /ShiftRosters/fill_mileage` was not called. |
| Notification tap opens a shift only with a positive shift id | Staff | Passed | `pathForNotificationData`. No push was sent. Universal links and `google-services.json` are absent. |
| Android `1.1.0` build 4 and the historical APK hash | Staff | Blocked | Historical hash is not this source. No `adb` or emulator. Joshua has no Android device. |
| iOS company-release build | Staff | Blocked | No Apple toolchain on this Linux host. Company-release commits are not on the remote. |
| Play production rollout and the ten unsubmitted changes | Release | Blocked | Not submitted. Managed publishing was not changed. |
| Health declaration | Staff | NA | Unresolved product decision. No screen was added. |
| Admin or other-role tools | Other roles | NA | Non-staff sign-in does not start a session. No admin UI was added. |

## Parked decisions

- Whether to save an install script on team environment `d81efd47-cd22-11f1-bec7-b2318963e0b6`. Recommended command, not applied: `npm install --no-package-lock --ignore-scripts --legacy-peer-deps`. No `start` script. No Android SDK. No secrets.
- Whether the API should reject mail before password checks.
- Whether Remember me should persist, and whether health declaration belongs on mobile.
- Whether the Android package becomes `au.com.promaxsolutions.promaxcare`, and whether `1.0.0` / `1.1.0` / runtime / EAS remote versions are aligned.
- Whether a staff device is available for the Android candidate. This record does not authorise that test.
