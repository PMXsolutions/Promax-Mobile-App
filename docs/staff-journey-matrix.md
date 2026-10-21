# PromaxCare staff mobile acceptance matrix

Date: 21 October 2026. This is the single acceptance record for the current staff app. The 22 October Sydney slice is in [docs/release-ledger.md](release-ledger.md). It is not a store, Play, EAS, or OTA readiness claim. Pull requests 9, 10, and 11 stay draft. They were not merged.

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
| SDK on these commits | Locked install: Expo `53.0.20`, React `19.0.0`, React Native `0.79.5`. An unlocked npm install resolved Expo `53.0.27` and is not the reproducible tree. |
| Lockfile | `bun.lockb` `799331d86a1ff0795f2302f5e64b76691564ab6f`. No `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`. Fresh `bun install --frozen-lockfile` with Bun `1.4.3` is recorded below. |
| API base variable | `EXPO_PUBLIC_API_BASEURL` (unset in this agent). Code fallback host is the public API already committed in `libs/axiosInstance.ts` and `eas.json`. |
| Maps variable | `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (unset). Name only. |
| Push file | `google-services.json` is gitignored and absent. Not requested. |
| Sign-in PR | [#9](https://github.com/PMXsolutions/Promax-Mobile-App/pull/9) `0e6c9d4065d36796d49254ad2c4d4868eb030aeb`, `de8516cdb879f37e30f3061e0545defc00ad56ad`, `c657dbea790ad9cc2534ca01279d1b32d1958c25`, `07d266bf267bfe5de8ca903a4bebb42397733900`, `93414b4` |
| Roster and drafts PR | [#10](https://github.com/PMXsolutions/Promax-Mobile-App/pull/10) `9b9bbb8d5e87ceb3b664cd236b101a0838ed032e`, `09eaddc73eff4f1d11ecbad5e8411c0349950982`, `3af36b3814675a14c0c0c644e271234f58a0cbd5`, `f5303520de14d717d420fff03c2fe0b32895b3c4` |
| Profile, documents, trip, notifications PR | [#11](https://github.com/PMXsolutions/Promax-Mobile-App/pull/11) `cb70d3baff018be936b62d06bb907e7397738e88`, `c9dc6a11dbb94e357eef2c47bee2629162571e15`, `66852ce2893eefaa7adc86f4c48760dcb1c759c2`, `7ec97f175939fec719f5108799191c460cd9302b`, `8c09eaa4a9bfeb20b7540a874b2f91ddc3beef1f` |
| Web display | Public `app.promaxcare.com.au` meta `app-release=quality-surveys-2026-09-09`. Literal `2.14.19` was not in that shell. `Promax-Web-FRONTEND` and `pmx_api_v2` were not readable with this credential. |

## Author unit runs on the follow-up commits

These are the author's runs on 21 October 2026. They are not a second-person pass and not device acceptance.

| Branch commit | Command | Result |
| --- | --- | --- |
| `de8516cdb879f37e30f3061e0545defc00ad56ad` | `CI=1 npx jest --watchAll=false --watchman=false --forceExit --testPathPattern='login-failure\|startup-session' --no-coverage` | 2 suites, 23 tests, passed |
| `c657dbea790ad9cc2534ca01279d1b32d1958c25` | same command | 2 suites, 24 tests, passed |
| `07d266bf267bfe5de8ca903a4bebb42397733900` | same command | 2 suites, 24 tests, passed |
| `93414b4` | same command | 2 suites, 26 tests, passed |
| `3af36b3814675a14c0c0c644e271234f58a0cbd5` | `CI=1 npx jest --watchAll=false --watchman=false --forceExit --testPathPattern='roster-report-reliability\|shift-service' --no-coverage` | 2 suites, 14 tests, passed |
| `f5303520de14d717d420fff03c2fe0b32895b3c4` | same command | 2 suites, 14 tests, passed |
| `c9dc6a11dbb94e357eef2c47bee2629162571e15` | `CI=1 npx jest --watchAll=false --watchman=false --forceExit --testPathPattern='profile-trip-follow-up\|shift-service' --no-coverage` | 2 suites, 10 tests, passed |
| `66852ce2893eefaa7adc86f4c48760dcb1c759c2` | same command | 2 suites, 11 tests, passed |
| `7ec97f175939fec719f5108799191c460cd9302b` | same command | 2 suites, 11 tests, passed |
| `8c09eaa4a9bfeb20b7540a874b2f91ddc3beef1f` | same command | 2 suites, 11 tests, passed |

`npx tsc --noEmit` was not re-run on these follow-ups. A previous run of `main` still had existing type errors in `hooks/usePushNotification/index.ts`. `npm run test` is `jest --watchAll` and will not exit.

## Independent retest

The first three rows are the parent reviews. The later rows retested the follow-up commits.

| Review | Parent | Jest on that parent | Result |
| --- | --- | --- | --- |
| [Retest auth session PR9](https://cursor.com/agents/bc-58b15b39-e850-573d-a3a5-bf5e2010f255) | `0e6c9d4065d36796d49254ad2c4d4868eb030aeb` | 2 suites, 20 tests, passed, 0 failed | The Play sentence starts a 60-minute device-local block and does not open OTP. The four fields `main` already displays are classified. One stored email replaced the other. A plain `Error` with that sentence was treated as a network failure, so another `auth_login` could be sent. Nested `response.message`, mixed-case `Message`, and a string body were not read. The stored record is email plus expiry, with no password. |
| [Retest auth follow-ups](https://cursor.com/agents/bc-58b15b39-e850-573d-a3a5-bf5e2010f255) | `c657dbea790ad9cc2534ca01279d1b32d1958c25` | 2 suites, 24 tests, passed, 0 failed | `de8516c` is an ancestor. The per-email book, nested and string Play readers, and a plain `Error` with the full Play sentence are closed. Still open on this commit: `Error sending mail.` without the hour sentence does not start the cooldown, and a plain `Error` with that shorter text is classified as a network failure, so another `auth_login` can be sent. Follow-up `07d266b` starts the hour for that phrase too. |
| [Retest sign-in 07d266b](https://cursor.com/agents/bc-3b7456cc-d8d7-5716-a6a2-a85e425ded83) | `07d266bf267bfe5de8ca903a4bebb42397733900` | 3 suites, 27 tests, passed, 0 failed | Bun `1.4.3` frozen install exited 0. The Play sentence, the shorter mail sentence, nested bodies, and two email rows held. An extra suite had 18 tests, 16 passed, 2 failed. An unconfirmed email could call `auth_login` and open OTP again. `loginUser` rewrote an aborted request as a network error. Follow-up `93414b4` returns the same address to the code screen without another post, and leaves `ECONNABORTED` as a timeout. This review did not re-run `93414b4`. A failed cooldown write still leaves the hour off disk for a later launch. |
| [Retest roster draft PR10](https://cursor.com/agents/bc-5139650b-176b-5fad-9e38-d1c70cdb3d8e) | `09eaddc73eff4f1d11ecbad5e8411c0349950982` | 2 suites, 14 tests, passed, 0 failed | Draft key was `promaxcare.report-draft.{create\|edit}.{rosterId}` with no staff or company id. Logout does not remove those keys. A second staff member on the same device could restore the form. `in_flight` blocks another send until the local acknowledge control. Storage is plaintext AsyncStorage. |
| [Retest roster draft follow-up](https://cursor.com/agents/bc-5139650b-176b-5fad-9e38-d1c70cdb3d8e) | `3af36b3814675a14c0c0c644e271234f58a0cbd5` | 2 suites, 14 tests, passed, 0 failed | A second staff member cannot restore the first staff member's text through the form. Staff id `0` does not read or write. `in_flight` still blocks another send until acknowledge. Still open: logout leaves the plaintext JSON, a missing company id was stored as `c0`, and a failed AsyncStorage write still allowed the send. Follow-up `f530352` refuses a non-positive company id and does not send unless the in-flight draft was stored. Logout still does not delete drafts. This review did not re-run `f530352`. |
| [Retest profile trip PR11](https://cursor.com/agents/bc-adf07140-f9ab-5759-8460-9cca76fdcb0c) | `cb70d3baff018be936b62d06bb907e7397738e88` | 2 suites, 9 tests, passed, 0 failed | Emergency and other-info edits fetched the route id with no staff check. A document id opened with no `companyId` or `userId` compare. Mileage is refused before `fill_mileage` when the odometer is blank, not finite, zero, or not greater at the end. GPS distance is not sent as the end reading. A notification opens a shift only for a positive shift id, and that shift screen did not check staff or company. |
| [Retest profile follow-ups](https://cursor.com/agents/bc-adf07140-f9ab-5759-8460-9cca76fdcb0c) | `66852ce2893eefaa7adc86f4c48760dcb1c759c2` | 2 suites, 11 tests, passed, 0 failed | `c9dc6a1` is an ancestor. Emergency, other-info, mileage, and the notification path held. Still open on this commit: a shift with no `staffId` stayed on screen and could clock in, and a document detail was fetched by id before the ownership check. A payload with no positive `userId` and no positive `companyId` was treated as owned. Follow-up `7ec97f1` requires both shift ids and requests a document only after it appears on the signed-in staff list. |
| [Retest profile 7ec97f1](https://cursor.com/agents/bc-d854589c-f749-59b9-a200-c4542b57e848) | `7ec97f175939fec719f5108799191c460cd9302b` | 2 suites, 11 tests, passed, 0 failed | Bun `1.4.3` frozen install exited 0. An extra uncommitted suite had 21 tests, 20 passed, 1 failed. Own, swapped, missing, and zero staff or company ids hide the shift actions. A document id absent from the staff list is not requested. Still open on this commit: a listed document with a matching user id and no company id stayed visible after the company changed, and `GET /ShiftRosters/{id}` ran before the roster check. Follow-up `8c09eaa` requires a positive company id and requests a shift only after that id is on this staff member's roster. This review did not re-run `8c09eaa`. |

The server is not asked to register the hour.

The six earlier explorers are idle, have no branch, and are not review capacity for these pull requests: [Roster clock-in gaps](https://cursor.com/agents/bc-a942d1fd-2454-5746-83c1-9f65ffdf86cc), [Report draft save gaps](https://cursor.com/agents/bc-bac639ad-128f-5a20-9bf8-abd8dc78c9aa), [Notification deep link gaps](https://cursor.com/agents/bc-5f87a3cf-791b-543e-acc9-9f7095c630e3), [Trip maps mileage gaps](https://cursor.com/agents/bc-cb08bea5-1f9f-5154-877a-ff2f40381344), [Documents profile gaps](https://cursor.com/agents/bc-bcc55231-93af-5142-b9e7-3dff489bda35), [Release provenance inspector](https://cursor.com/agents/bc-57d2ac8c-b8ed-584e-9f0e-c6132cb6826e).

## Environment used for this record

Team environment [`d81efd47-cd22-11f1-bec7-b2318963e0b6`](https://cursor.com/dashboard/cloud-agents/environments/e/d81efd47-cd22-11f1-bec7-b2318963e0b6). Saved config has no recognized install or start. Build [`bld-20261021-7fa3944b-ea2b-48cf-b709-0e14cfad53b8`](https://cursor.com/dashboard/cloud-agents/builds/bld-20261021-7fa3944b-ea2b-48cf-b709-0e14cfad53b8) succeeded at 2026-10-21T07:42:20Z after cloning `main` and running platform setup only. This agent booted the default image before that snapshot existed (`defaultImageFallback`). No new environment was created.

Verified on this machine: Node `v22.23.3`, npm `10.9.9`, Corepack `0.36.0`, Yarn `1.22.22`, pnpm `10.33.4`, Expo package `53.0.27`, OpenJDK `21.0.12.1`, Python `3.12.3`, git `2.43.0`, Linux `x86_64`.

This VM now has Bun `1.4.3` (`1.4.3+c6da4a4d3`) at `/usr/local/bin/bun`. The saved environment image does not, until a tested draft build is saved. Still missing: `ANDROID_HOME`, Android SDK, `adb`, `emulator`, `sdkmanager`, `xcodebuild`, `simctl`, `watchman`. iOS builds cannot run here. No Android package was produced.

Safe GET only, 21 October 2026: `https://api.promaxcare.com.au/api` 404, `/swagger/index.html` 200, `/swagger/v1/swagger.json` 404, `/health` 404, `/api/health` 404. There is no isolated disposable API. Unit tests do not need the two public variables. Maps and push still need `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` and `google-services.json`, which were not added.

## Clean install qualification

Both installs used a new directory under `/tmp`. The saved team environment and its access settings were not changed. No production request was sent.

| Install | Directory | Result |
| --- | --- | --- |
| `npm install --no-package-lock --ignore-scripts --legacy-peer-deps --no-audit --no-fund` with only `package.json` | `/tmp/promax-clean-npm` | Exit 0. 1046 packages. No lockfile written. Expo `53.0.27`, Jest `29.7.0`, TypeScript `5.9.3`. |
| That npm tree running `login-failure` and `startup-session` from commit `c657dbe` | `/tmp/promax-jest-auth` | 2 suites, 24 tests, passed. |
| Bun `1.4.3` from `/tmp/bun-qual`, then `bun install --frozen-lockfile` with `package.json` and `bun.lockb` | `/tmp/promax-clean-bun` | Exit 0. 996 packages. Expo `53.0.20`, TypeScript `5.8.3`. |
| That Bun tree running the same two suites from `c657dbe` | `/tmp/promax-jest-bun` | 2 suites, 24 tests, passed. |

The reproducible install is Bun `1.4.3` with `bun install --frozen-lockfile`. The npm command resolves version ranges, so Expo landed on `53.0.27` instead of the locked `53.0.20`. It is not the reproducible install.

A fresh checkout of `main` `de4eb2f7a7af8835700d20034fbe3fee6e43f0c9` at `/tmp/promax-env-main` used the official GitHub release `bun-v1.4.3`. `bun-linux-x64.zip` matched release checksum `3e730528d89775f03f87f05c06787c4df4099d0a37f3f252e7b829cb23816e18`. The first frozen install exited 0 and installed 996 packages in 454 ms. The second exited 0 with no changes in 24 ms. The same script exited 0 again in 21 ms. Resolved versions: Expo `53.0.20`, React `19.0.0`, React Native `0.79.5`, TypeScript `5.8.3`, Jest `29.7.0`. `package.json` count 1227. No `package-lock.json` was written. The same `bun.lockb` blob `799331d86a1ff0795f2302f5e64b76691564ab6f` is on `main` and pull requests 9, 10, and 11. Native Android and iOS builds remain blocked on this host. The saved environment was not changed.

## Acceptance

Status is Passed, Failed, Blocked, or NA. Passed means the named unit contract passed in the author run above. It does not mean a device, a hosted account, or a store build passed.

| Journey | Role | Status | Reason |
| --- | --- | --- | --- |
| Sign-in stays on the form when the Play mail sentence is returned | Staff | Passed | Independent review of `0e6c9d4` confirmed the sentence is `mail_rate_limited`, does not open OTP, and sets `allowImmediateRetry` false. Jest on that parent: 20 passed, 0 failed. `c657dbe` also classifies a plain `Error` with that sentence. The reviewer did not re-run `c657dbe`. No `auth_login` was sent. |
| One-hour block is per email, including a second address on the same device | Staff | Passed | Independent review of `0e6c9d4` found one AsyncStorage record, so saving a second address erased the first hour. Follow-up `de8516c` keeps one entry per normalized email. The reviewer did not re-run `de8516c`. Device storage and the server were not exercised. |
| Nested or string error body still matches that sentence | Staff | Passed | Independent review of `0e6c9d4` found nested `response.message`, mixed-case `Message`, and a string body were not classified. Follow-up `de8516c` reads those. `c657dbe` covers a plain `Error`. The reviewer did not re-run those commits. |
| Mail limit is enforced by the API | Staff | Blocked | Client cooldown only. API handoff: validate the password before sending mail and return a distinct limit code. `pmx_api_v2` was not readable. |
| Shorter `Error sending mail.` without the hour sentence | Staff | Passed | The follow-up review of `c657dbe` found this phrase did not start the hour, including when it arrived as a plain `Error`. `07d266b` classifies it as `mail_rate_limited` before the network check, so the form stores the hour and does not call `auth_login` again for that address. The reviewer has not re-run `07d266b`. No `auth_login` was sent. |
| Startup font hang and session hydration | Staff | Passed | Covered by `startup-session` jest on `de8516c`. No device launch. |
| HTTP 401 expires the session and HTTP 403 does not | Staff | Passed | Unit contract on PR 9. No hosted token was expired. |
| Remember me persists a session | Staff | Blocked | The checkbox does not change zustand persist. Left unchanged. |
| Invalid password and unknown user stay off OTP | Staff | Passed | Exact strings `Invalid Login Attempt` and `User Not Found` in the classifier. Not sent to the host. |
| Home roster, clock-in, and report reload on a staff device | Staff | Blocked | No emulator, no authorised disposable user, no hosted read-back. |
| Second clock-in tap while the first check runs | Staff | Passed | `canStartClockAttempt` on `3af36b3`. Server duplicate acceptance is not proven. |
| Clock-in radius stays 1000 m | Staff | Passed | `CLOCK_IN_RADIUS_METERS` is 1000. Location denial does not skip the check. No device GPS run. |
| Report draft is isolated by company and staff | Staff | Passed | The follow-up review of `3af36b3` confirmed a different staff id cannot restore the text. A missing company id was still stored as `c0`. `f530352` returns null unless both ids are positive, so that key is not read or written and the send does not start. The reviewer has not re-run `f530352`. |
| Drafts encrypted, or removed on logout | Staff | Blocked | The follow-up review of `3af36b3` confirmed logout leaves the plaintext JSON, and a second staff member cannot open it through the form. Drafts stay so the same staff member can restore them. SecureStore's 2048-byte limit was not used for draft text. |
| Uncertain in-flight submit cannot be sent again until acknowledged | Staff | Passed | The follow-up review of `3af36b3` confirmed the stored `in_flight` state blocks another send. It also found a failed AsyncStorage write still returned success. `f530352` does not send unless that write succeeds. The reviewer has not re-run `f530352`. No hosted duplicate-report check. |
| Edited report refreshes the open report query | Staff | Passed | Invalidates `["staffReport", reportId, shiftId]` in the PR 10 source. No web read-back. |
| Personal and employment profile load errors | Staff | Blocked | Source has loader and error states. Not opened on a device. |
| Emergency and other-info edit of another staff id | Staff | Passed | Independent review of `cb70d3b` found both screens fetched the route id with no staff check. Follow-up `c9dc6a1` uses `isOwnStaffRecord` and skips the fetch. The reviewer did not re-run `c9dc6a1`. Not hosted. |
| Document id from another company or user | Staff | Passed | [Retest profile 7ec97f1](https://cursor.com/agents/bc-d854589c-f749-59b9-a200-c4542b57e848) confirmed a document id absent from the staff list is not requested. A listed document with a matching user id and no company id stayed visible. `8c09eaa` denies that payload. A listed id can still be requested before the detail payload is checked. The reviewer has not re-run `8c09eaa`. The API was not called. |
| Bank, identity, and availability screens | Staff | NA | They already read the session staff id. No route-id edit was added. |
| Trip mileage refuses a missing, zero, or non-increasing odometer | Staff | Passed | Independent review of `cb70d3b` confirmed `mileageSubmitDecision` returns before `fill_mileage`, and the map distance stays an estimate. Jest on that commit: 9 passed, 0 failed. The API was not called. |
| Notification tap opens a shift only with a positive shift id | Staff | Passed | Independent review of `cb70d3b` confirmed `pathForNotificationData`. No push was sent. Universal links and `google-services.json` are absent. |
| Shift opened from a notification belongs to the signed-in staff member | Staff | Passed | [Retest profile 7ec97f1](https://cursor.com/agents/bc-d854589c-f749-59b9-a200-c4542b57e848) confirmed another staff id, another company, and missing or zero ids hide the shift actions. `GET /ShiftRosters/{id}` still ran before that check. `8c09eaa` requests the shift, and the create or edit report, only after the id is on this staff member's roster. The reviewer has not re-run `8c09eaa`. The shift API was not called. |
| Android `1.1.0` build 4 and the historical APK hash | Staff | Blocked | Historical hash is not this source. No `adb` or emulator. Joshua has no Android device. |
| iOS company-release build | Staff | Blocked | No Apple toolchain on this Linux host. Company-release commits are not on the remote. |
| Play production rollout and the ten unsubmitted changes | Release | Blocked | Not submitted. Managed publishing was not changed. |
| Health declaration | Staff | NA | Unresolved product decision. No screen was added. |
| Admin or other-role tools | Other roles | NA | Non-staff sign-in does not start a session. No admin UI was added. |

## Parked decisions

- Joshua authorised the Bun `1.4.3` frozen-lockfile install on team environment `d81efd47-cd22-11f1-bec7-b2318963e0b6`. The saved config is unchanged until he saves a tested draft. No `start` script. No Android SDK. No secrets. No new environment. The unlocked npm install is not the reproducible command.
- Whether the API should reject mail before password checks.
- Whether Remember me should persist, and whether health declaration belongs on mobile.
- Whether the Android package becomes `au.com.promaxsolutions.promaxcare`, and whether `1.0.0` / `1.1.0` / runtime / EAS remote versions are aligned.
- Whether a staff device is available for the Android candidate. This record does not authorise that test.
