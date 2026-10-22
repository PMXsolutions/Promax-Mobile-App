# PromaxCare mobile company source handoff

Product: PromaxCare mobile. This is not Care OS and not a Care OS UAT change. Codex on Joshua's Mac prepares this handoff. The cloud agent cannot see the Mac. No signing key, token, `.env`, or production data is requested.

Original tree, leave it dirty and uncommitted:

`/Users/alukojoshfx/.codex/.chatgpt-projects/g-p-6937926449a88191b260dcf079c5ee33/engineering/promax-mobile-ios-company-release`

Branch reported there: `codex/ios-company-release`. Expo 54 / React Native 0.81.5 changes are uncommitted. Do not run `git reset`, `git checkout --`, `git clean`, or a prebuild that rewrites that directory.

## Owners

| Task | Owner | Evidence required |
| --- | --- | --- |
| Preserve the original company checkout | Codex on the Mac | `git status --porcelain=v1` and `git rev-parse HEAD` of the original, taken before the copy. The original stays dirty. |
| Sanitised copy and presence check | Codex on the Mac | A commit on an isolated branch in the existing private company repository, plus the marker table below. |
| Reliability port where a marker is absent | Codex on the Mac, in the copy only | A file-level note: present, absent and ported, or different and left untouched. |
| Independent mocked retest of that copy | A reviewer who did not make the copy | Jest counts. Not a device or store pass. |
| Staff read contract `ff174a6` | PromaxCare mobile lead, retested by `bc-da4e9ddd-23d0-5a05-9155-cd0145b0d3ad` | 6 tests passed. The reviewer changed no file. Not native acceptance. |
| Play Console identity and policy text | Joshua, with Codex reading the console | Version code, SHA256, the ten unsubmitted change names, and the current policy wording. Do not submit. |
| Store upload, EAS, TestFlight, rollout | Nobody until a separate approval names the artifact | Not authorised by the implementation instruction. |

This cloud credential's visible `PMXsolutions` repositories do not include a private company mobile repository, `Promax-Web-FRONTEND`, or `pmx_api_v2`. Pushing the company tree to public `PMXsolutions/Promax-Mobile-App` is not the handoff.

## What to copy

Make a filesystem copy or a git worktree. In the copy only, create `codex/company-expo54-preserve-20261022` and commit the previously uncommitted source. Do not stash the original.

Include source and project files: `app/`, `components/`, `hooks/`, `libs/`, `modules/`, `services/`, `store/`, `types/`, `constants/`, `utils/`, `__tests__/`, `package.json`, the lockfile, `app.json`, `babel.config.js`, `tsconfig.json`, `metro.config.js`, and the `android/` and `ios/` projects.

Exclude, and do not paste into chat or the private repository:

`.env`, `.env.*`, `*.jks`, `*.keystore`, `*.p8`, `*.p12`, `*.pem`, `*.mobileprovision`, `google-services.json`, `GoogleService-Info.plist`, `credentials.json`, `local.properties`, `node_modules/`, `ios/Pods/`, `android/.gradle/`, and any file whose name contains `secret` or `credential`.

Redact `app.config.js` and `eas.json` before they leave the Mac. Replace values for keys, tokens, passwords, and private material with `REDACTED`. Keep the bundle id `au.com.promaxsolutions.promaxcare`, scheme `promaxcare-company`, EAS project `d922d001-8858-4020-aa0d-b6f17f9139ad`, version name, Android version code, iOS build number, and the API hostname. Official Xcode, Android Studio, and JDK installs on the Mac are authorised outside this checkout. Do not change the original lockfile to install them.

## Where it goes

Use the remote already configured in that checkout. Record only its host and repository name. If that remote is `PMXsolutions/Promax-Mobile-App`, do not push. Report the remote and stop. This cloud agent still cannot pull a private repository until that repository is visible to this credential.

## Presence check before any port

Compare. Do not apply a remote patch because the file names match. For each marker, record `present`, `absent`, or `different`. Port only an `absent` marker, and only in the copy. Leave a `different` company file unchanged and record the function name that differs.

| Marker | Remote commit | How to recognise it |
| --- | --- | --- |
| Mail sentence classified before a generic 401 | `2fa074d` on pull request 9 | `libs/login-failure.ts` treats `email not confirmed` and a message that starts with `email not confirmed.` as `email_unconfirmed`. A 401 without that sentence does not open the code screen. |
| Session and single-flight sign-in | `2fa074d` | `libs/session-status.ts`, `libs/single-flight.ts`, `libs/auth-hydration.ts`, `libs/startup-fonts.ts`, `libs/login-mail-guard.ts` exist and are used by sign-in. |
| Report keyboard contract | `926d28d` on pull request 10 | Report forms keep the first tap. `libs/report-validation.ts` and `libs/attendance-error.ts` exist. |
| Profile, document, and mileage gates | `8c1e1cb` on pull request 11 | `libs/staff-record.ts` `isOwnStaffRecord`, `libs/trip-mileage.ts` `mileageSubmitDecision`, `libs/document-name.ts`, `libs/notification-route.ts`. |
| Protected draft, no plaintext fallback | `113442f` on pull request 13. This supersedes the draft store in `926d28d` and the plaintext path in `0d73f38`. | `libs/report-draft-store.ts` writes a generation slot and sets `sec.current` only after that slot reads back. `SECURE_DRAFT_SAVE_FAILURE` is visible. The file still says the XOR prefix is not encryption. A failed secure write returns false and does not replace an existing draft. |
| Other-info Save inside the keyboard scroll | `d925a1a` on pull request 14 | In `modules/profile/edit-otherinfo-form.tsx`, Save Changes is inside the `ScrollView` whose `keyboardShouldPersistTaps` is `handled`. |
| User and company device token | Behavior `1eaf047`. Comments `775b8d7`. Pull request 15. | Stored registration is JSON `{token, userId, companyId}`. A legacy bare string does not count as registered. A failed post does not write storage. |
| Company FCM-only guard | Preserved company source. Not pull request 15. | The company function must refuse to post an iOS APNs token to `DeviceTokens/add_token`. Do not copy `deviceTokenForPlatform`'s iOS return from `1eaf047` over that guard. |

Keep `au.com.promaxsolutions.promaxcare`. Do not rebuild the Expo 53 remote over the Expo 54 tree.

## Return these texts

No secret values.

1. Original `git status --porcelain=v1`, `git rev-parse HEAD`, `git log -15 --oneline`, `git diff --stat`, and `git diff --name-only`.
2. The copy's branch name and commit.
3. The marker table.
4. The function that decides an iOS push post, with secrets removed.
5. `package.json` version and the `expo`, `react`, and `react-native` versions.
6. Redacted bundle id, version name, Android version code, iOS build number, and API hostname.
7. Jest command names and pass counts on the copy. State that the run was mocked.
8. Play Console internal-testing version code and SHA256 for package `au.com.promaxsolutions.promaxcare`, compared with `c186cdb620838a505a34504271827c37abd173791f0aa47b1885a1e45ffd900f`. Do not read a hash from the phone's App info screen.
9. The names of the ten unsubmitted Play changes, and the current text of the unresponsive-controls item and the health declaration. Leave them unsubmitted. Managed publishing stays off. Do not create a tester link, change testers, or notify anyone.
10. App Store Connect build number currently live on track `6810018262`. Do not upload a replacement.

## Milestones

Milestone A is an integrated reliability build for the existing private Play route `https://play.google.com/apps/internaltest/4700932305942754285` and a TestFlight build on the existing company iOS app `6810018262`. It does not include attendance writes, progress notes, daily reports, incident writes, timesheet generation, PBS, training completion, ticket creation, knowledge-base editing, or SIMA chat. Those gaps must be written on the test notes. Milestone A is not full parity, and it is not complete until the mocked suites pass on the company copy and a later device run is recorded against the artifact hash.

Milestone B is the remaining staff alignment and polish. The first slice is remote commit `ff174a6` on `cursor/mobile-staff-read-workflows-65b8`: read-only My Attendance, My Progress Note, My Timesheet, Training, My Tickets, Knowledge Base, and My Incident Report, scoped to the signed-in staff member. Author Jest was 6 passed. Independent reviewer `bc-da4e9ddd-23d0-5a05-9155-cd0145b0d3ad` reran those 6 on that commit and changed nothing. That is not a device pass and not Milestone B complete.

Neither milestone authorises a production write, a hosted database change, a password change, a purchase, an external notification, or a store publication.

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

No company-package artifact is identified. The installed Android version name `1.1.0` and the working iPhone release stay as they are. The next device build is the first `au.com.promaxsolutions.promaxcare` artifact from the preserved Expo 54 copy after the marker table is applied, a different reviewer has run the mocked suites, and the commit, version code or build number, checksum, and API hostname are written down. Do not install it over the current phone until that checksum is the one Play or TestFlight shows.
