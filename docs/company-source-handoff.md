# PromaxCare mobile company source handoff

Product: PromaxCare mobile. This is not Care OS and not a Care OS UAT change. Codex on Joshua's Mac prepares this handoff. The cloud agent cannot see the Mac. No signing key, token, `.env`, or production data is requested.

Original tree, leave it dirty and uncommitted:

`/Users/alukojoshfx/.codex/.chatgpt-projects/g-p-6937926449a88191b260dcf079c5ee33/engineering/promax-mobile-ios-company-release`

Branch reported there: `codex/ios-company-release`. Expo 54 / React Native 0.81.5 changes are uncommitted. Do not run `git reset`, `git checkout --`, `git clean`, or a prebuild that rewrites that directory.

## Owners

| Task | Owner | Evidence required |
| --- | --- | --- |
| Preserve the original company checkout | Codex on the Mac | Original `promax-mobile-ios-company-release` stays untouched. No new source folder. |
| Existing integration copy | Codex on the Mac | Reuse `engineering/promax-mobile-company-integration-20261022`. It already reconciles pull requests 9, 10, and 11 with Expo 54, company identity, and the Android-only FCM guard. Prior lab result: 162 tests and 20 config checks. Not native acceptance. |
| Pull requests 13 and 14 on that copy | Codex on the Mac | Joshua reports `4daa0f0` and `571576e` reconciled in the existing copy at 6:26pm Australia/Sydney on 22 October 2026. The Mac diff was not supplied. Do not push. |
| Pull request 15 on that copy | Codex on the Mac | Joshua reports `db49319` integrated, with the company hook keeping the Android-only return and `fcmTokenForAndroid`. The Mac diff was not supplied. Do not copy `deviceTokenForPlatform`'s iOS return. |
| Evidence review of the pasted Mac results | `bc-d9a774a5-988d-549d-9394-4f52b41b33f9` | Reviewed public commits `4daa0f0`, `571576e`, and `db49319` by read-only `git show`. Did not run the Mac tree. Not native acceptance. |
| Staff reads and accessibility | PromaxCare mobile lead | `1e48d37`. Blocked writes stay blocked. |
| Play Console identity and policy text | Joshua, with Codex reading the console | Version code, SHA256, the ten unsubmitted change names, and the current policy wording. Do not submit. |
| Store upload, EAS, TestFlight, rollout | Nobody until a separate approval names the artifact | Not authorised by the implementation instruction. |

GitHub API for `PMXsolutions/Promax-Mobile-App` reports `private: false` and `visibility: public`. Both configured GitHub remotes lead there. The company checkout's origin is the local Documents checkout. No other private destination is known to this credential. Do not create a repository, do not change visibility, and do not grant access. Do not push company source.

## What to copy

Do not create a new source folder. Keep using `engineering/promax-mobile-company-integration-20261022`. Leave `promax-mobile-ios-company-release` untouched. Do not stash the original.

Include source and project files: `app/`, `components/`, `hooks/`, `libs/`, `modules/`, `services/`, `store/`, `types/`, `constants/`, `utils/`, `__tests__/`, `package.json`, the lockfile, `app.json`, `babel.config.js`, `tsconfig.json`, `metro.config.js`, and the `android/` and `ios/` projects.

Exclude, and do not paste into chat or the private repository:

`.env`, `.env.*`, `*.jks`, `*.keystore`, `*.p8`, `*.p12`, `*.pem`, `*.mobileprovision`, `google-services.json`, `GoogleService-Info.plist`, `credentials.json`, `local.properties`, `node_modules/`, `ios/Pods/`, `android/.gradle/`, and any file whose name contains `secret` or `credential`.

Redact `app.config.js` and `eas.json` before they leave the Mac. Replace values for keys, tokens, passwords, and private material with `REDACTED`. Keep the bundle id `au.com.promaxsolutions.promaxcare`, scheme `promaxcare-company`, EAS project `d922d001-8858-4020-aa0d-b6f17f9139ad`, version name, Android version code, iOS build number, and the API hostname. Official Xcode, Android Studio, and JDK installs on the Mac are authorised outside this checkout. Do not change the original lockfile to install them.

## Where it goes

There is no private GitHub destination to name. The existing local integration copy is the working tree. Do not push it to `PMXsolutions/Promax-Mobile-App`. A sanitised marker table, with secrets removed, can be pasted into this mobile ledger. The company tree itself stays on the Mac.

## Presence check before any port

Compare. Do not apply a remote patch because the file names match. For each marker, record `present`, `absent`, or `different`. Port only an `absent` marker, and only in the copy. Leave a `different` company file unchanged and record the function name that differs.

| Marker | Remote commit | How to recognise it |
| --- | --- | --- |
| Mail sentence classified before a generic 401 | `2fa074d` on pull request 9 | `libs/login-failure.ts` treats `email not confirmed` and a message that starts with `email not confirmed.` as `email_unconfirmed`. A 401 without that sentence does not open the code screen. |
| Session and single-flight sign-in | `2fa074d` | `libs/session-status.ts`, `libs/single-flight.ts`, `libs/auth-hydration.ts`, `libs/startup-fonts.ts`, `libs/login-mail-guard.ts` exist and are used by sign-in. |
| Report keyboard contract | `926d28d` on pull request 10 | Report forms keep the first tap. `libs/report-validation.ts` and `libs/attendance-error.ts` exist. |
| Profile, document, and mileage gates | `8c1e1cb` on pull request 11 | `libs/staff-record.ts` `isOwnStaffRecord`, `libs/trip-mileage.ts` `mileageSubmitDecision`, `libs/document-name.ts`, `libs/notification-route.ts`. |
| Protected draft, no plaintext fallback | `4daa0f0` on pull request 13. Joshua reports the four files are reconciled and `sec.current` plus serialized per-key saves are present. The Mac diff was not supplied. | Writes for one key are serialized. `sec.current` moves only after the new generation reads back. A stale writer does not point `sec.current` at an older stamp. |
| Other-info Save inside the keyboard scroll | `571576e` on pull request 14. Joshua reports the semantic Save test and custom button are reconciled, Save stays inside the ScrollView, and a local test-only namespace annotation left the assertions unchanged. The Mac diff of that annotation was not supplied. The earlier imported `d925a1a` test failed with no `Pressable`. | Save Changes is inside the `ScrollView` with `keyboardShouldPersistTaps="handled"`. `571576e` finds the control labelled Save Changes and still requires the scroll ancestor. A Save outside that scroll fails. |
| User and company device token | `db49319` on pull request 15. Joshua reports the helper, the portable test, and a company hook with scoped cache, stale-effect checks, serialized cache writes, the Android-only early return, and `fcmTokenForAndroid` are integrated. The Mac diff was not supplied. | The company hook calls `fcmTokenForAndroid`. An iOS token is not posted. Do not replace the company guard with `deviceTokenForPlatform`. |
| Company FCM-only guard | Already present on the integration copy. | `fcmTokenForAndroid` returns null for iOS, including an APNs device token. `deviceTokenForPlatform` still returns that APNs token for this public remote hook. Do not copy that iOS return onto the company guard. |

Keep `au.com.promaxsolutions.promaxcare`. Do not rebuild the Expo 53 remote over the Expo 54 tree.

## Return these texts

No secret values.

1. Original checkout. Recorded at 8:19pm Australia/Sydney on 22 October 2026: the dirty company checkout was retained, and only a public ref fetch was performed there. No reset, clean, or replacement. Do not request that status again.
2. Integration copy identity. The directory is not a Git repository. Do not invent a branch name or commit. The recorded identity is the four `4daa0f0` content hashes in the file-identity table.
3. The marker table.
4. The function that decides an iOS push post, with secrets removed.
5. `package.json` version and the `expo`, `react`, and `react-native` versions.
6. Redacted bundle id, version name, Android version code, iOS build number, and API hostname.
7. Jest command names and pass counts on the copy. Supplied at 6:26pm Australia/Sydney on 22 October 2026 and not requested again: Jest `--runInBand --watchAll=false --watchman=false`, 17 suites and 186 tests passed; `tsc --noEmit` passed; `node --test scripts/company-android-config.test.cjs scripts/company-ios-config.test.cjs`, 20 passed. An initial 180-test pass had TypeScript test-annotation failures, corrected before the final run. State that the run was mocked. The copy is not a Git repository, so those results are not tied to a commit.
8. Play Console internal-testing version code and SHA256 for package `au.com.promaxsolutions.promaxcare`, compared with `c186cdb620838a505a34504271827c37abd173791f0aa47b1885a1e45ffd900f`. Do not read a hash from the phone's App info screen.
9. The names of the ten unsubmitted Play changes, and the current text of the unresponsive-controls item and the health declaration. Leave them unsubmitted. Managed publishing stays off. Do not create a tester link, change testers, or notify anyone.
10. App Store Connect build number currently live on track `6810018262`. Do not upload a replacement.

## Milestones

Milestone A is an integrated reliability build for the existing private Play route `https://play.google.com/apps/internaltest/4700932305942754285` and a TestFlight build on the existing company iOS app `6810018262`. It does not include attendance writes, progress notes, daily reports, incident writes, timesheet generation, PBS, training completion, ticket creation, knowledge-base editing, or SIMA chat. Those gaps must be written on the test notes. Milestone A is not full parity, and it is not complete until the mocked suites pass on the company copy and a later device run is recorded against the artifact hash.

Milestone B is the remaining staff alignment and polish. The current slice is `1e48d37` on `cursor/mobile-staff-read-workflows-65b8`: the same read-only staff lists, with reads exposed as buttons and daily report, PBS, SIMA, and policies exposed as unavailable text that includes the recommended next step. Reviewer `bc-257aef1b-301e-5bf0-b469-e0cb14fccf8e` passed 7 tests on that commit and changed nothing. Missing write contracts stay blocked. That is not a device pass and not Milestone B complete.

Neither milestone authorises a production write, a hosted database change, a password change, a purchase, an external notification, or a store publication.

## Mac checklist for the existing integration copy

This host has not run `engineering/promax-mobile-company-integration-20261022`. A remote reviewer must not claim that run. Joshua fetched the public pull-request heads onto the Mac and did not upload company source. The repository stays public. Do not convert it and do not create another repository. Do not push the company tree.

The commands below are the record of what was asked. Joshua supplied the full-suite results at 6:26pm Australia/Sydney on 22 October 2026. Do not request those counts again. Leave secrets out. Reviewers on this host reran the public files only: `bc-30617101-4611-51cc-b077-4d34b2d80590` passed 2 tests at `571576e`, `bc-daa29958-4b19-5481-b123-04d72d23f74a` passed 2 tests at `db49319`, and `bc-257aef1b-301e-5bf0-b469-e0cb14fccf8e` passed 7 tests at `1e48d37`. None of them ran the Mac copy. `bc-d9a774a5-988d-549d-9394-4f52b41b33f9` reviewed the pasted results against those public commits and did not execute the Mac tree.

### Pull request 13, commit `4daa0f0`

`4daa0f0` itself changes only:

- `__tests__/report-draft-store.test.ts`
- `libs/report-draft-store.ts`

Joshua reports these four files are reconciled and that `sec.current` and serialized per-key saves are present. Public `4daa0f0` itself changes only the store and its test; the four-file tree at that commit is the source he says he copied. The evidence review did not see the Mac diff. The four files are:

- `libs/report-draft-store.ts`
- `libs/report-draft.ts`
- `hooks/use-report-draft.ts`
- `__tests__/report-draft-store.test.ts`

```bash
npx jest __tests__/report-draft-store.test.ts --watchAll=false --watchman=false
```

The public-remote run of that file was 32 passed. On the Mac, record the count you actually get. Then:

```bash
rg -n "sec\\.current|draftWrites|SECURE_DRAFT_SAVE_FAILURE|This is not encryption" libs/report-draft-store.ts libs/report-draft.ts
```

A pass is not Keychain, Keystore, or device acceptance.

### Pull request 14, commit `571576e`

The Mac layout already has Save Changes inside the ScrollView in `modules/profile/edit-otherinfo-form.tsx`. The imported `d925a1a` test failed with `No instances found with node type: Pressable`. That search does not match `TouchableOpacity`, which is what `components/shared/custom-button.tsx` renders. It can also miss a wrapped Pressable export on React Native 0.81.

Copy from `571576e`:

- `__tests__/other-info-save-tap.test.tsx`
- `components/shared/custom-button.tsx`

Keep the form's Save inside the ScrollView. The test finds the control by the label Save Changes and `onPress`. `firstTapReachesPress` is unchanged: the first tap counts only when an ancestor has `keyboardShouldPersistTaps` of `handled` or `always`. The fixture test expects that result to be false when Save sits outside the scroll view. Do not delete that expect.

```bash
npx jest __tests__/other-info-save-tap.test.tsx --watchAll=false --watchman=false
```

Use the renderer already selected in the test file: Jest Expo's React 19 renderer when the top-level `react-test-renderer` is 18. Joshua reports this semantic test is in the 186-test pass. He then applied a test-only annotation, `import("react-test-renderer").ReactTestRenderer`, and says the assertions were unchanged. Public `571576e` types `TestRenderer.ReactTestRenderer` and does not contain that import form. The evidence review did not see the Mac annotation diff. A falsifier is an `expect()` or `firstTapReachesPress` change in that local edit, or an outside-scroll case that no longer expects false. A pass is not a device keyboard pass.

### Pull request 15, commit `db49319`

`2b3f43f` changed:

- `libs/push-registration.ts`
- `__tests__/push-registration.test.tsx`

`db49319` adds the portable file `__tests__/fcm-token-for-android.test.ts`. Copy these two files from `db49319`:

- `libs/push-registration.ts`
- `__tests__/fcm-token-for-android.test.ts`

Do not copy `hooks/usePushNotification/index.ts` over the company hook. Joshua reports the company hook now has a scoped token, user, and company cache, stale-effect checks, serialized cache writes, the Android-only early return, and `fcmTokenForAndroid`, plus Expo 54 banner and list fields, safe redacted logging, and the notification routes. He added six rendered tests from `2b3f43f` under a distinct filename and changed only the iOS post expectation to forbidden. The evidence review confirmed the public helper and that the public hook still posts an iOS token. It did not see the company hook or the distinct file. A falsifier is any expectation in that copy that differs from `2b3f43f` other than the forbidden iOS post, an early return that skips listener setup or retry, a combined gate that rejects a valid Android FCM token, or a banner, list, or logging edit that changes a notification route. In the company hook, pass the device token through `fcmTokenForAndroid(Platform.OS, device)` before `DeviceTokens/add_token`. Leave the existing Android-only FCM guard in place.

```bash
npx jest __tests__/fcm-token-for-android.test.ts --watchAll=false --watchman=false
```

Expect the Android FCM string to be returned and every Apple token to be null. Do not post a token. The rendered `__tests__/push-registration.test.tsx` file checks the public remote hook, including its iOS post. That file is not the company acceptance test.

### Milestone A without the open staff writes

Milestone A can be prepared from this copy before daily report, PBS, SIMA, and policy writes exist. Its test note must list those workflows as absent. The route stays `https://play.google.com/apps/internaltest/4700932305942754285` for Android and the existing company iOS app `6810018262` for TestFlight. No upload is included in this checklist. The integration directory is a working copy, not a Git repository, so the source identity is the four file hashes below rather than a commit.

## File identities recorded at 8:19pm Australia/Sydney on 22 October 2026

`engineering/promax-mobile-company-integration-20261022` is not a Git repository. No integration commit will be invented, and this tree will not be pushed to the public repository. [Mac lab evidence review](https://cursor.com/agents/bc-d9a774a5-988d-549d-9394-4f52b41b33f9) hashed the raw public blobs and matched Joshua's read-only git-show comparison. The reviewer did not run the Mac tree.

| Path equal to `4daa0f0` | Content SHA256 |
| --- | --- |
| `libs/report-draft-store.ts` | `0f331cd3a58457fd1ed2a239cc33bb7a7e5a70a64da209dee0f6748642107377` |
| `libs/report-draft.ts` | `15d9b9bb3b8715c0c6e537f090d7ab4d7078bf3890e99f0e09d0a6cfefff6eff` |
| `hooks/use-report-draft.ts` | `13fed590df22733bd6d0e5b0c9c3119c81075dd7f31a52dbdea9a17fda024700` |
| `__tests__/report-draft-store.test.ts` | `2c89eb437eb0454b3f733b36ce18cc7f0a7edd53950944eb175cc274c866482a` |

Public baselines, for a later comparison of the working copy. These Mac files were not hashed here.

| Public file | Commit | Content SHA256 |
| --- | --- | --- |
| `__tests__/other-info-save-tap.test.tsx` | `571576e` | `2c029e4888ee87af9794eddc6317a41f161c5777381fa4911a96ed787302606d` |
| `components/shared/custom-button.tsx` | `571576e` | `24bb08e20d2c7c56dd795f547e364aa5edb53cd54b285e384ae821ed02a89c75` |
| `__tests__/push-registration.test.tsx` | `2b3f43f` | `ae6433512c9d8ebc4129f8d79dde9a0b768a70e868655828f69b99c99ffc6132` |
| `libs/push-registration.ts` | `db49319` | `500a1ac1bed9824388e9150183cbeab450bd4359ba75ce5f4c63e969d5951495` |
| `__tests__/fcm-token-for-android.test.ts` | `db49319` | `ba5e56e947e532425b21e4d8b733ea4c14d0e8e845def507784281c9e5c7068b` |

The public Save test has exactly three `TestRenderer.ReactTestRenderer` annotations: the `renderer` binding, the `inside` binding, and the `outside` binding. Joshua says the Mac test adds `type ReactTestRenderer = import("react-test-renderer").ReactTestRenderer` and replaces those three annotations. Expectations and `firstTapReachesPress` stay as they are. The Mac test hash will differ from `2c029e48…` because of that alias. That difference is the recorded type-only edit.

The company rendered registration file is `scoped-push-registration.test.tsx`. Joshua says it was copied from `2b3f43f`, the existing company suite was preserved, and the only platform expectation changed denies the iOS post. The public expectation to deny is inside `it("keeps Android FCM and iOS APNs on their own platforms")`: `post` called with `/DeviceTokens/add_token`, `Device_Token` `apns-token`, `UserId` `user-1`, and `CompanyId` `9`. The following expects, that the Android channel helpers were not called, stay. The later `fcm-on-ios` case already expects no post. The company file was not read here.

Joshua says the original dirty checkout was retained and only a public ref fetch was performed there. No reset, clean, or replacement. The 17 suites, 186 tests, TypeScript pass, and 20 config checks stay his lab results and are not requested again.

## Remaining Milestone A build prerequisites

Nothing in this list authorises signing, EAS, an upload, a store submission, a tester change, a production write, or a production push. An integration commit is not one of these items. The installed Honor X9d 5G / MTN-NX1 app stays as it is.

1. Isolated test profile, specified in the next section. `development`, `preview`, and `production` stay on production. They are not safe UAT. A write-capable test build uses the fixture host.
2. Toolchain and signing approval, given separately. This host has no Android SDK, `adb`, emulator, or Apple toolchain. Do not send a signing key, token, or `.env` into chat.
3. One `au.com.promaxsolutions.promaxcare` artifact from the working copy after the profile exists. Record package id, version name, Android version code, iOS build number, artifact SHA256, and baked API hostname. The source identity is the working copy plus the four matched draft-file hashes. Do not invent a source commit. Do not build the artifact from the production API profile.
4. A separate publication approval that names that artifact, the existing Play internal-test track `https://play.google.com/apps/internaltest/4700932305942754285`, TestFlight on existing app `6810018262`, the change list, and rollback. Rollback leaves the current phone install and the working iOS release in place until the store artifact hash matches the recorded candidate. Do not submit the ten Play changes. Do not create a tester link. Do not start the Production 4 full rollout. Managed publishing stays off.
5. Installed version name `1.1.0` still needs its version code and SHA256 from the Play Console internal-testing release or the downloaded artifact. Compare any hash with build 4 SHA256 `c186cdb620838a505a34504271827c37abd173791f0aa47b1885a1e45ffd900f`. App info does not show that hash.
6. Device cases after a lab pass: a keyboard tap on device, a secure-store restart, an account or company switch that registers without a production push, and a failed save that keeps the typed text on device. Jest is not that pass.
7. Milestone A test notes list the absent workflows: attendance writes beyond clock-in and clock-out, progress notes, daily reports, incident writes, timesheet generation, PBS, training completion, ticket creation, knowledge-base editing, and SIMA chat.

The one further file identity that would close the Save-test byte claim is the content SHA256 of the working copy's `__tests__/other-info-save-tap.test.tsx`. It is not a commit, and it is not required before the profile proposal. The company hook file has no public blob to match. Its recorded contract is the Android-only early return, `fcmTokenForAndroid`, and no iOS post.

## Isolated test-profile proposal

This profile is a proposal for the working copy. It has not been created. It is not in the public `eas.json`. It does not require a Git commit. Creating it locally, building it, and uploading it are not authorised by this record. The existing Play route and the public repository stay as they are. The current phone install stays as it is.

On the public remote, `eas.json` sets `EXPO_PUBLIC_API_BASEURL` to `https://api.promaxcare.com.au/api` for `development`, `preview`, and `production`. The production Android submit track in that file is `internal`. Public `app.config.js` and `libs/axiosInstance.ts` fall back to that same host when the variable is unset. Joshua states that the existing company configuration is production-only and cannot be treated as safe UAT. The company Expo 54 `app.config.js` was not opened on this host.

Add a fourth profile beside the three production profiles. Leave those three on the production host. The example host below is `fixture.invalid`, which cannot receive a request. Replace it with the company-controlled fixture host only inside `company-isolated`, and only when that host exists. Refuse the profile when the host is `api.promaxcare.com.au` or the variable is empty, because an empty value falls back to production.

```json
{
  "build": {
    "company-isolated": {
      "channel": "company-isolated",
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_BASEURL": "https://fixture.invalid/api"
      }
    }
  }
}
```

No token, password, key, or account secret goes in this profile. No production sign-in, clock-in, save, mail, or `add_token` is sent while it is prepared.

Reusable fictional session, not an account that has been created:

| Field | Value |
| --- | --- |
| Email | `fixture.staff@example.invalid` |
| User id | `fixture-user` |
| Staff id | `900001` |
| Company id | `900001` |
| Shift id | `900001` |
| Report id | `900001` |
| Document id | `900001` |
| Message id | `900001` |

These paths are the public client contract in `services/auth.ts`, `services/shift.ts`, `services/report.ts`, `services/profile.ts`, `services/notification.ts`, and `hooks/usePushNotification/index.ts`. The company service files were not hashed. Where the working copy uses these paths, the fixture answers them. A company-only path that differs stays on the working copy's spelling. The availability path uses the public client's spelling `StaffAvailibilities`.

| Call | Fixture behaviour |
| --- | --- |
| `POST /Account/auth_login?medium=Mobile` | One response has HTTP 401 and a message that is `email not confirmed` or starts with `email not confirmed.`. A later success returns the fictional user, staff, and company. A generic 401 does not use that sentence. |
| `GET /Account/forgot_password` and `POST /Account/reset_password` | Answer locally. Send no mail. |
| `GET /ShiftRosters/get_shifts_by_user` and `GET /ShiftRosters/900001` | Return the fictional shift, or an empty list. Never return another company's shift. |
| `POST /Attendances/clock_in` and `POST /Attendances/clock_out` | Accept only `fixture-user` and shift `900001`. A second clock-in of that shift is rejected. |
| `GET /ShiftReports/get_staff_shiftreports` and `GET /ShiftReports/get_shiftreport_details` | Return the fictional report for staff `900001`. |
| `POST /ShiftReports/add_shiftreport` and `POST /ShiftReports/edit/900001` | Accept one save. A duplicate after the local tombstone is rejected. |
| `POST /ShiftRosters/fill_mileage` | Accept only an end reading greater than the start, and reject a missing or zero start. |
| `GET /Documents/get_all_staff_documents` and `GET /Documents/get_document/900001` | Return the fictional document for staff `900001`. |
| `POST /Documents/add_document`, `POST /Documents/edit/900001`, `POST /Documents/delete/900001` | Accept only that fictional document. |
| `GET /Staffs/900001` and `GET /Companies/get_company/900001` | Return the fictional staff and company. |
| `POST /Staffs/edit/900001` | The failure case keeps the typed text on the device. A success case accepts only this staff id. |
| `GET /StaffAvailibilities/get_staff_availabilities` and the add, edit, and delete posts | Accept only staff `900001` and company `900001`. |
| `GET /Messages/inbox` and `GET /Messages/900001` | Return one fictional message for `fixture-user`. |
| `POST /DeviceTokens/add_token` | Accept one Android FCM token for `fixture-user` and company `900001`. Store no iOS token. Send no push. |
| Any other company id or staff id | HTTP 403. |
| Daily report, progress note, incident write, timesheet generation, PBS, training completion, ticket creation, knowledge-base editing, SIMA, policy acknowledge | No success response. These workflows are absent from Milestone A. |

Secure draft save and the visible secure-save failure notice stay on the device. They do not call this fixture. An offline read stores nothing and shows the list as unavailable.

## Falsifiers for the Mac lab report

1. Closed for the current bytes. The four draft files match the `4daa0f0` content hashes above. A later edit to those files reopens this item.
2. The Mac Save test changes an `expect()` or `firstTapReachesPress`, or replaces something other than the three `TestRenderer.ReactTestRenderer` annotations plus the one type alias.
3. `scoped-push-registration.test.tsx` differs from `2b3f43f` in any expectation other than denying the `apns-token` post. Also falsified if the company early return skips listener setup or retry, if a valid Android FCM token is rejected by the combined gates, or if banner, list, or logging edits change a notification route. Replacing the company guard with public `deviceTokenForPlatform` would falsify the company contract.
4. A test list showing the 180-to-186 increase is not those six rendered tests, or a diff showing the annotation edit changed an assertion.
5. A log, proxy capture, or binary trace showing a live API or push during that Jest run.
6. Closed as Joshua's report at 8:19pm Australia/Sydney: the original checkout had a public ref fetch only, with no reset, clean, or replacement. A later working-tree edit beyond that fetch reopens this item. The status was not displayed on this host.

## Staff questions that stay open

These come from the public shell `/assets/index-BV83UWOU.js` (last-modified 4:50am Australia/Sydney on 12 October 2026, meta `quality-surveys-2026-09-09`). The string `2.14.19` is not in that file.

| Workflow | Question | Recommended option while the answer is open |
| --- | --- | --- |
| Daily report | Which request does `/app/staff/daily-report` send? | Do not label `/StaffAttendances/get_staff_attendances` as a daily report. The helper named `fetchStaffDailyReport` in this file calls that attendance URL. |
| PBS | Does a frontline Staff role have My PBS? | Leave PBS out. My PBS / Assigned PBS in this file is Support Coordinator, and the client menu has its own My PBS. |
| SIMA | Which request does `/app/communication/chat-with-sima` send? | Do not call the roster-explain, auto-shift-report, or PBS summary endpoints for that row. No `/Sima` post was in this file. |
| Policies and care plan | Is the staff read `get_user_policies` or `my-policies`? | Leave `codex/care-plan-intelligence-r1` at `b773e1d` unmerged. Its acknowledge and clarification calls are writes, and `/client-care-plans/my-shift` was not in this file's HTTP calls. |

Admin surveys, policy administration, and invoices stay out of the staff app.

## Next testable build

No company-package artifact is identified. The installed Android version name `1.1.0` and the working iPhone release stay as they are. The integration directory is a working copy, not a Git repository. The four draft-file hashes match `4daa0f0`. The next device build is the first `au.com.promaxsolutions.promaxcare` artifact from that copy after the isolated fixture profile is in use and the version code or build number, checksum, and baked API hostname are written down. Do not invent a source commit. Do not install the artifact over the current phone until that checksum is the one Play or TestFlight shows. Do not build that artifact from the production API profile for write testing.
