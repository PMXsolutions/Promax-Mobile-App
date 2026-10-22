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

1. Original `git status --porcelain=v1`, `git rev-parse HEAD`, `git log -15 --oneline`, `git diff --stat`, and `git diff --name-only`.
2. The copy's branch name and commit.
3. The marker table.
4. The function that decides an iOS push post, with secrets removed.
5. `package.json` version and the `expo`, `react`, and `react-native` versions.
6. Redacted bundle id, version name, Android version code, iOS build number, and API hostname.
7. Jest command names and pass counts on the copy. Supplied at 6:26pm Australia/Sydney on 22 October 2026 and not requested again: Jest `--runInBand --watchAll=false --watchman=false`, 17 suites and 186 tests passed; `tsc --noEmit` passed; `node --test scripts/company-android-config.test.cjs scripts/company-ios-config.test.cjs`, 20 passed. An initial 180-test pass had TypeScript test-annotation failures, corrected before the final run. State that the run was mocked. The copy's commit from item 2 is still missing.
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

Milestone A can be prepared from this copy before daily report, PBS, SIMA, and policy writes exist. Its test note must list those workflows as absent. The route stays `https://play.google.com/apps/internaltest/4700932305942754285` for Android and the existing company iOS app `6810018262` for TestFlight. No upload is included in this checklist. Joshua's full-suite lab results are recorded above. The evidence review of those results is recorded. The next missing records are the integration-copy commit, a Mac diff for the three reconciliation risks, the isolated test profile below, and then version code or build number, artifact checksum, and fixture API hostname.

## Remaining Milestone A build prerequisites

The evidence review is recorded. [Mac lab evidence review](https://cursor.com/agents/bc-d9a774a5-988d-549d-9394-4f52b41b33f9) compared the pasted results with public `4daa0f0`, `571576e`, and `db49319`. That reviewer did not execute the Mac tree. The 17 suites, 186 tests, TypeScript pass, and 20 config checks are not requested again. What follows is still required before a test build is identified. Nothing in this list authorises signing, EAS, an upload, a store submission, a tester change, or a production write.

1. Integration-copy commit. Run `git rev-parse HEAD` and `git status --porcelain=v1` inside `engineering/promax-mobile-company-integration-20261022` and paste the SHA and the status. That SHA was not supplied.
2. Draft-file identity. Show that the four pull request 13 files match `4daa0f0` for `sec.current`, `draftWrites`, a `stillCurrent` path that does not write an older stamp into `sec.current`, `SECURE_DRAFT_SAVE_FAILURE`, and the comment "This is not encryption." A company-only draft behavior present before the copy and absent from `4daa0f0` falsifies a clean replace. The evidence review did not see this diff.
3. Save-test annotation. Show that the local TypeScript edit is the type `import("react-test-renderer").ReactTestRenderer` and that no `expect()` and no `firstTapReachesPress` changed. The outside-scroll case must still expect false. Save Changes stays inside the `ScrollView` with `keyboardShouldPersistTaps="handled"`.
4. Company registration file. Show that the distinct rendered test differs from `2b3f43f` only by forbidding the iOS post. The company hook calls `fcmTokenForAndroid`, keeps the Android-only early return, does not post an iOS token, keeps `setNotificationChannelAsync("default")` Android-only, and still uses the notification routes. Banner, list, and redacted logging must leave those routes in place.
5. Original checkout status. `git status --porcelain=v1` on `promax-mobile-ios-company-release` showing a working tree whose edits are the pre-existing dirty Expo 54 tree. Fetched public refs may update remote-tracking names. Do not reset, clean, or stash that tree, and do not copy it again.
6. Isolated test profile, specified in the next section. Development, preview, and production stay pointed at production. They are not safe UAT. Do not test writes against production. Do not retarget those three profiles.
7. Toolchain and signing approval, given separately. This host has no Android SDK, `adb`, emulator, or Apple toolchain. Do not send a signing key, token, or `.env` into chat.
8. One `au.com.promaxsolutions.promaxcare` artifact from the integration copy after items 1 to 6. Record the commit, package id, version name, Android version code, iOS build number, SHA256, and baked API hostname. A write-capable test build uses the fixture hostname. Do not build it from the production API profile.
9. A separate publication approval that names that artifact, the existing Play internal-test track `https://play.google.com/apps/internaltest/4700932305942754285`, TestFlight on existing app `6810018262`, the change list, and rollback. Rollback leaves the current phone install and the working iOS release in place until the store artifact hash matches the recorded candidate. Do not submit the ten Play changes. Do not create a tester link. Do not start the Production 4 full rollout. Managed publishing stays off.
10. Installed version name `1.1.0` still needs its version code and SHA256 from the Play Console internal-testing release or the downloaded artifact. Compare any hash with build 4 SHA256 `c186cdb620838a505a34504271827c37abd173791f0aa47b1885a1e45ffd900f`. App info does not show that hash. Leave the Honor X9d 5G / MTN-NX1 install in place.
11. Device cases after a lab pass: a keyboard tap on device, a secure-store restart, an account or company switch that registers without a production push, and a failed save that keeps the typed text on device. Jest is not that pass.
12. Milestone A test notes list the absent workflows: attendance writes, progress notes, daily reports, incident writes, timesheet generation, PBS, training completion, ticket creation, knowledge-base editing, and SIMA chat.

## Isolated test-profile proposal

This profile is a proposal. It has not been created. Do not write it into the company tree from this host. Do not add it to the public repository as a production change.

On the public remote, `eas.json` sets `EXPO_PUBLIC_API_BASEURL` to `https://api.promaxcare.com.au/api` for `development`, `preview`, and `production`. The production Android submit track in that file is `internal`. `app.config.js` and `libs/axiosInstance.ts` on that public remote fall back to the same host when the variable is unset. Joshua states that the existing company configuration is production-only and cannot be treated as safe UAT. The company Expo 54 `app.config.js` was not opened on this host, so its baked URL is Joshua's report, not a file read here.

- Name the profile something other than `development`, `preview`, or `production`. `company-isolated` is a name only. Leave the three existing profiles on the production host.
- Set `EXPO_PUBLIC_API_BASEURL` to a disposable fixture base the company controls. Do not put `https://api.promaxcare.com.au/api` in this profile. Do not put a token, password, key, or account secret in the profile file.
- Fixture rows: one fictional staff id, one fictional user id, one fictional company id, one fictional shift, and one fictional document. No real participant names. No production mail. No live push. No production `add_token`, sign-in, clock-in, or save.
- The profile has to be able to show these cases before Milestone A write testing: the `email not confirmed` sentence classified before a generic HTTP 401; a roster read; a clock accepted only on the fixture; a local secure draft save and a failed secure save that keeps the previous draft and shows the visible notice; an other-info save failure that keeps the typed text; a push registration that posts only to the fixture and only an Android FCM token; a tenant or role denial; a duplicate submit blocked by the tombstone; an offline read that shows unavailable and stores nothing.
- Building or uploading this profile is not authorised. The existing Play route and the public repository stay as they are.

## Falsifiers for the Mac lab report

1. A Mac copy of one of the four draft files differs from `4daa0f0` in `sec.current`, `draftWrites`, a `stillCurrent` path that writes an older stamp into `sec.current`, `SECURE_DRAFT_SAVE_FAILURE`, or the "This is not encryption." comment. Also falsified if a company-only draft behavior present before the copy is gone afterward and is absent from `4daa0f0`.
2. The local TypeScript edit changes an `expect()` or `firstTapReachesPress`.
3. The distinct registration file differs from `2b3f43f` in any expectation other than the iOS post being forbidden. Also falsified if the company early return skips listener setup or retry, if a valid Android FCM token is rejected by the combined gates, or if banner, list, or logging edits change a notification route. Replacing the company guard with public `deviceTokenForPlatform` would falsify the company contract.
4. A test list showing the 180-to-186 increase is not those six rendered tests, or a diff showing the annotation edit changed an assertion.
5. A log, proxy capture, or binary trace showing a live API or push during that Jest run.
6. A status or diff of the original checkout showing working-tree edits beyond fetched remote-tracking refs.

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

No company-package artifact is identified. The installed Android version name `1.1.0` and the working iPhone release stay as they are. Joshua reports the marker table is applied on `engineering/promax-mobile-company-integration-20261022`, and the evidence review of that report did not run the Mac tree. The next device build is the first `au.com.promaxsolutions.promaxcare` artifact from that copy after the remaining prerequisites in this file are recorded, including the integration-copy commit, the isolated fixture profile, the version code or build number, the checksum, and the baked API hostname. Do not install it over the current phone until that checksum is the one Play or TestFlight shows. Do not build that artifact from the production API profile for write testing.
