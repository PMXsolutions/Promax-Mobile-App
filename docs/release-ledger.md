# Staff release ledger

Target: 22 October 2026, Australia/Sydney. Care OS is the go-live. This mobile ledger is the frontline staff catch-up record. It is not Ready to Update, a store release, an EAS build, an OTA update, or a production publication. A commit on this remote is not a pushed App Store or Play update. The date does not turn a blocked row into a pass.

## Live store lineage

Checked 21 October 2026, with the 22 October account clarification below. No IPA or APK was on this host. No store, EAS, or OTA command was run. The 22 October afternoon inspection (Australia/Sydney) records Joshua's MTN-NX1, Android 15, MagicOS 9. That phone is not an approved install target: no installable approved APK, and Android-tools approval was asked and not granted. A preserved Expo 54 checkout was later reported on Joshua's Mac. This cloud host did not open, copy, rebuild, or submit it. Joshua confirmed on 22 October 2026 that the restored company iPhone app works. That confirms the existing release. It does not accept these pull requests.

| Listing | What the public record says | What this remote is |
| --- | --- | --- |
| Live company iPhone, [PromaxCare](https://apps.apple.com/au/app/promaxcare/id6810018262) | Apple lookup `bundleId=au.com.promaxsolutions.promaxcare`, country `au`. Version `1.1.0`. Seller PROMAX IT SOLUTIONS PTY LTD. Track `6810018262`. Released 2026-09-25. Current version 2026-09-25T20:34:03Z. Size 56,905,728 bytes. Minimum iOS 15.1. No release notes. Joshua confirmed on 22 October 2026 that this restored app works on iPhone. | That bundle id is not in this git remote. A reported Mac checkout overrides legacy `app.json` ids to that bundle through `app.config.js`. Binary-to-commit lineage for the current store artifact stays Blocked. The confirmation is the existing release, not acceptance of these pull requests. |
| Other live iPhone, [Promax Care](https://apps.apple.com/au/app/promax-care/id6748918123) | Apple lookup `bundleId=com.promax-app`. Version `1.2.0`. Seller Aermeans Global Services Limited. Track `6748918123`. First release 2025-08-07. Current version 2025-09-11T18:46:32Z. Size 45,891,584 bytes. Notes mention multi-client reports and per-client kilometres. | `app.json` on `main` `de4eb2f` and on Care OS `981bea5` is version `1.1.0` with the same bundle. Neither commit is the live `1.2.0` binary. Care OS is not the company listing. |
| Play `com.tobby95.pmaxapp` | `https://play.google.com/store/apps/details?id=com.tobby95.pmaxapp&hl=en&gl=au` returned HTTP 404. | This remote's package name. `app.json` version `1.1.0`. No APK. Not a public listing today. |
| Play `au.com.promaxsolutions.promaxcare` | The public Play URL pattern returned HTTP 404. Company console identity, from the reported checkpoints and not opened on this host: package `au.com.promaxsolutions.promaxcare`, Play app `4975822694822650269`, developer `7848143770069177658`. | Not a public listing from the 21 October GET. Review and rollout state is in the Play review section below. |

AppBrain, a third-party page, records `com.tobby95.pmaxapp` at version `1.2.1`, last update 12 September 2025, and says the public Play listing was removed. That page is not the Play store and not a binary on this host. Its `1.2.1` is not this remote's `1.1.0`.

## Scope

PromaxCare mobile stays staff-only. Admin, auditor, and company-admin menus were not added. No new staff screen was added. No production write, notification, store action, or VM operation was run. Client gates now skip a cancel, mileage save, report fetch, and notification fetch unless the id is on this sign-in. `pmx_api_v2` was not readable, so server-side tenant enforcement stays Blocked.

The deployed web shell at `https://app.promaxcare.com.au/` returned HTTP 200 on 21 October 2026. `last-modified` was Sun, 11 Oct 2026 17:50:30 GMT. The meta tag `app-release` is `quality-surveys-2026-09-09`. The staff menu in `/assets/index-BV83UWOU.js` was read with a public GET. The web repository was not readable with this credential.

| Deployed web staff item | Mobile source on these branches | Status |
| --- | --- | --- |
| My Dashboard, My Shift Roster, My Shift Report | Home, shift detail, shift report | Present in source. Device and hosted save/reload are Blocked. |
| My Availabilities | Availability tab | Present in source. Hosted save is Blocked. |
| My Documents | Documents tab | Present in source. Hosted read is Blocked. |
| My Attendance, My Progress Note, My Daily Report, My Incident Report, My Timesheet | No matching screen | Gap. Not built in this pass. API proof is Blocked. |
| PBS, Training, tickets, knowledge base, Chat with SIMA | No matching screen | Gap. Not built in this pass. |
| Policies for me, care plan and handover | Present on `codex/care-plan-intelligence-r1` at `b773e1d`, same iPhone bundle id | Not merged. Acknowledge and clarification are writes. Downstream web result is Blocked. |
| Surveys & Feedback, Policy & Compliance admin, invoices | Admin or other-role menus | Out of scope. No admin access was added. |

## Identity

| Item | Value |
| --- | --- |
| Android package | `com.tobby95.pmaxapp` |
| Remote app | Expo `53.0.20`, React `19.0.0`, React Native `0.79.5` |
| Lockfile | `bun.lockb` `799331d86a1ff0795f2302f5e64b76691564ab6f` |
| Company Expo 54 tree | Reported on Joshua's Mac at `/Users/alukojoshfx/.codex/.chatgpt-projects/g-p-6937926449a88191b260dcf079c5ee33/engineering/promax-mobile-ios-company-release`, branch `codex/ios-company-release`, with uncommitted Expo 54 / React Native 0.81.5 changes. Absent from this git remote and this cloud host. Not copied. |

## Reproducible install

Verified on 21 October 2026 from the official release [bun-v1.4.3](https://github.com/oven-sh/bun/releases/tag/bun-v1.4.3), published 2026-10-10. The install script at `bun.sh` does not check a checksum, so the zip was checked against `SHASUMS256.txt` from that release before the binary was installed.

| Check | Result |
| --- | --- |
| Host | Linux x86_64, AVX2 present, Node `v22.23.3` |
| Asset | `bun-linux-x64.zip` |
| sha256 | `3e730528d89775f03f87f05c06787c4df4099d0a37f3f252e7b829cb23816e18` matched |
| Binary | `/usr/local/bin/bun` `1.4.3` revision `1.4.3+c6da4a4d3` |
| Tree | Clean checkout of `main` `de4eb2f7a7af8835700d20034fbe3fee6e43f0c9` at `/tmp/promax-env-main` |
| First `bun install --frozen-lockfile` | Exit 0. 996 packages installed in 454 ms |
| Second run | Exit 0. No changes in 24 ms |
| Script run | Exit 0. No changes in 21 ms |
| Resolved | Expo `53.0.20`, React `19.0.0`, React Native `0.79.5`, TypeScript `5.8.3`, Jest `29.7.0`, 1227 `package.json` files |
| Lockfile drift | No `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, or `bun.lock` written |

The same lockfile blob is on `main` and on pull requests 9, 10, and 11. An unlocked `npm install` is a different tree (Expo `53.0.27`) and is not this install.

## Slice for 22 October

The release target remains the company iPhone [PromaxCare](https://apps.apple.com/au/app/promaxcare/id6810018262), bundle `au.com.promaxsolutions.promaxcare`, App Store track `6810018262`, version `1.1.0`. Joshua confirmed that restored app works. Staff access from both stores is the priority, with the Play review first and the working iOS release left in place. Former distribution used Timi friend accounts. The company now owns the Apple and Google accounts. These rows are Expo 53 source fixes. They do not complete that company app. None of these rows is a new device, hosted, or store pass. Reconcile the company Expo 54 checkout before any release candidate. Do not rebuild this Expo 53 tree over that dirty checkout.

## Pending provenance checklist

Read-only discovery. This cloud host did not open the Mac path. No secret was copied. The checkout was not uploaded, published, rebuilt, submitted, or overwritten. Feature ports and production API changes stay unauthorised.

| Check | Record | Status |
| --- | --- | --- |
| Source location | `/Users/alukojoshfx/.codex/.chatgpt-projects/g-p-6937926449a88191b260dcf079c5ee33/engineering/promax-mobile-ios-company-release` on Joshua's Mac. Branch `codex/ios-company-release`. Uncommitted Expo 54 / React Native 0.81.5 changes. | Reported. Leave those local changes in place. |
| Override versus legacy ids | `app.config.js` with profiles `ios-company-release` and `android-company-release` sets `au.com.promaxsolutions.promaxcare`, scheme `promaxcare-company`, and EAS project `d922d001-8858-4020-aa0d-b6f17f9139ad`. Legacy `app.json` on this remote stays `com.promax-app`, `com.tobby95.pmaxapp`, scheme `myapp`, EAS project `70d0de46-7142-4d9a-a7b5-a089e9ea2879`. | Distinction recorded. The override was not applied to these pull requests. |
| Historical September release-status document | Links that tree to company app `6810018262` and build `2e5bbafd-8c84-4427-8b67-d1eb2f0ef3c5`. | Historical link. It does not prove the current App Store binary. |
| Installed and store artifact mapping | Current track `6810018262` version `1.1.0` binary, its IPA, and the uncommitted checkout that produced it. | Blocked. |
| Native and isolated-API acceptance | Device proof and a disposable API. | Blocked. |

## Play review

Reported checkpoints `google-play-recovery-2026-10-21.json` and `google-play-release-checkpoint-2026-10-04.txt` were not opened from this host. A console browser-control timeout is not a product failure. No credential was changed and no login was sent.

| Check | Record | Status |
| --- | --- | --- |
| Rejection on 22 September | Unresponsive UI controls / broken functionality, and an inaccurate health declaration under Others. With console access restored, the current policy detail still says unresponsive buttons and icons, and that the app is unavailable. | Recorded. The ten changes and the full rollout were not touched. |
| Health categories on 21 October | Healthcare services and management; Medication and treatment management; Other, with a care-workforce explanation. | Already set in the console. Unsubmitted. No in-app screen was added. |
| Unsubmitted changes | Ten, including Production 4 (`1.1.0`) Start full rollout. Managed publishing OFF. | Do not submit all. Publication needs a separate approval. |
| Build 4 APK | SHA256 `c186cdb620838a505a34504271827c37abd173791f0aa47b1885a1e45ffd900f`. | Downloaded hash recorded. Source mapping unresolved. |
| Screenshot sentence | Same text as the local AccountController unconfirmed-email catch, which labels any mail exception as too many mails. | Match recorded. Hosted reviewer account and cause were not verified. |

| Review issue | Fix | Next action |
| --- | --- | --- |
| App controls | `246c1b2` removes the nested sign-in `ScrollView`. | Android tester steps are in `docs/staff-journey-matrix.md`. Device run stays Blocked here. |
| Reviewer account or mail delivery | `246c1b2` withholds another sign-in, disables Sign in for that address, and does not call `resend_otp` from the existing-code path. | Stop on that sentence. Hand the account to the Care OS lead. |
| Declaration | Console categories above. | Leave them unsubmitted. |
| API catch | No mobile edit. Care OS lead is assigned `cb079dbc` on `cursor/account-mail-order-466d` for a local fake-mail sign-in error and order fix. That branch is not on this mobile remote. Hosted cause remains unverified. | Keep the current client contract until that owner supplies an exact independently retested API contract. A message that is `email not confirmed` or starts with `email not confirmed.` stays `email_unconfirmed` and is classified before the generic HTTP 401 sign-in branch. A 401 without that sentence does not open the code screen. Do not edit the API or the company release. Do not send mail or login. |

[Retest sign-in 246c1b2](https://cursor.com/agents/bc-a2063c0d-dcc9-5e21-9e92-b9f02d3f8f9a) retested `246c1b2`: 3 suites, 44 tests, passed. That worker did not write the commit. No assertion was weakened.

## Prerequisites for the company app

The reported checkout is a source location. These acceptance items are still missing. They were not recreated from this remote.

| Needed | Why |
| --- | --- |
| Exact mapping from the current App Store binary to the reported Mac checkout, including its uncommitted files | The path and the `app.config.js` override identify a source tree. They do not identify the installed artifact. |
| The build manifest for the current App Store version `1.1.0`, track `6810018262` | Build `2e5bbafd-8c84-4427-8b67-d1eb2f0ef3c5` is a historical September link. `main` and Care OS remain `com.promax-app` `1.1.0`. |
| The IPA for that current binary | No IPA is on this host, so binary lineage stays Blocked. |
| An isolated disposable API | Server tenant and assignment checks stay Blocked until tests can run there. Client gates are not that proof. |

| Pull request | Latest commit | What it holds | Independent review |
| --- | --- | --- | --- |
| [#9](https://github.com/PMXsolutions/Promax-Mobile-App/pull/9) | `2fa074d758ae6c598be4277c10c8e9e257fac03e` | A 401 query is not retried. Forgot-password and reset take the single-flight lock first. The reset screen keeps keyboard taps. `246c1b2` remains the mail-sentence lab record and was not re-run. | [Retest session retry 2fa074d](https://cursor.com/agents/bc-6203ec83-dda9-5cc7-9079-99ed54257f86) retested `session-retry-tap` only: 1 suite, 6 tests, passed. Not a device pass. |
| [#10](https://github.com/PMXsolutions/Promax-Mobile-App/pull/10) | `926d28d37b66dd42627cb93e471960362eb087de` | Report screens keep keyboard taps. `0d73f38` remains the draft lab record and was not re-run. The mask is still not protected-draft acceptance. | [Retest report taps 926d28d](https://cursor.com/agents/bc-a2063c0d-dcc9-5e21-9e92-b9f02d3f8f9a) retested `keyboard-tap-contract` only: 1 suite, 1 test, passed. Draft send functions were not changed. |
| [#11](https://github.com/PMXsolutions/Promax-Mobile-App/pull/11) | `8c1e1cbe90a7a60247215cdcd122a669703e8b84` | Profile and document screens keep keyboard taps. `bc3ec9b` remains the ownership lab record and was not re-run. | [Retest profile taps 8c1e1cb](https://cursor.com/agents/bc-d9a774a5-988d-549d-9394-4f52b41b33f9) retested `keyboard-tap-contract` only: 1 suite, 1 test, passed. The other-info Save button is outside that scroll view. |
| [#12](https://github.com/PMXsolutions/Promax-Mobile-App/pull/12) | this file | Acceptance matrix and this ledger | Record only. Not a store update. |
| [#13](https://github.com/PMXsolutions/Promax-Mobile-App/pull/13) | `113442f` | New drafts go to a secure generation. The current pointer is set only after that copy reads back. No plaintext AsyncStorage fallback. | [Draft storage review](https://cursor.com/agents/bc-ef905f1c-7c4a-5b3c-9794-47f13d3ee47c) failed `749406a` on a torn write and an in-flight overwrite, then retested `113442f`: 31 passed, 0 failed, no edits. Both failures stay recorded. Device gate stays: the Jest double is not Keychain or Keystore. |
| [#14](https://github.com/PMXsolutions/Promax-Mobile-App/pull/14) | `d925a1a` | Other-info Save is inside the keyboard scroll view. A failed save keeps the typed text. Branched from `8c1e1cb`. | [Retest profile 7ec97f1](https://cursor.com/agents/bc-d854589c-f749-59b9-a200-c4542b57e848) did not write it. 3 suites, 11 tests, passed. The source-attribute check is not this acceptance. A device tap is still unproven. |
| [#15](https://github.com/PMXsolutions/Promax-Mobile-App/pull/15) | `1eaf047` | The cached device token includes the signed-in user and company. A legacy bare `fcmToken` does not skip registration. A write that finishes after logout does not stay stored. Android stays FCM. iOS stays APNs. Branched from `8c1e1cb`. | [Retest session retry 2fa074d](https://cursor.com/agents/bc-6203ec83-dda9-5cc7-9079-99ed54257f86) did not write it. `__tests__/push-registration.test.tsx`: 1 suite, 6 tests, passed. Axios was mocked. No push was sent. Not a device pass. |

The independent rows above re-ran the latest commits in existing checkouts. They are unit and source checks. They are not a device, hosted, or store pass.

## Local draft storage

These are separate facts. The retention choice stays in the parked list.

### Platform secure storage

This is the installed package `expo-secure-store` `14.2.4`, read from that package on this host. The draft Jest double is a `Map`. It does not run this native code, so the unit tests are not Keychain or Keystore proof.

- iOS `ios/SecureStoreModule.swift` stores a generic-password Keychain item. `ios/SecureStoreOptions.swift` defaults `keychainAccessible` to `whenUnlocked`, mapped to `kSecAttrAccessibleWhenUnlocked`. This app calls `setItemAsync` with no options, so that default stands, and `requireAuthentication` is not set.
- Android `encryptors/AESEncryptor.kt` generates an AES key in Android Keystore and encrypts with AES/GCM. The ciphertext goes to SharedPreferences. This app does not set `requireAuthentication`, so user authentication is not required. API 22 and below in that package uses `HybridAESEncryptor`.
- `writeSecureBody` passes the report JSON into that API. On a device, the native module encrypts that string. The unit tests store the same string in the mock map.

### AsyncStorage draft bytes

This is this repository, not the platform module.

- `libs/report-draft.ts` writes AsyncStorage with the prefix `promaxcare.draft.v1.` and XORs the bytes. That file says this is not encryption.
- If the SecureStore mask key cannot be created, a new draft is plaintext JSON. An existing masked draft is not replaced.
- Plaintext fallback and the mask remain the record of the source through `0d73f38`. That record is not deleted.
- Pull request 13 `113442f` is later source. Its first independent review of `749406a` failed on a torn secure write and on a rejected edit replacing an in-flight draft. The retest passed 31 draft-store tests. Those failures stay recorded. The device gate stays: Jest is not Keychain, Keystore, an APK, or release acceptance.

## Checkpoint

`246c1b2` and `efee15f` stay lab evidence, not device acceptance. `2fa074d`, `926d28d`, and `8c1e1cb` are further lab contracts. No background write queue was added. The draft suite was not repeated. The app is not Ready to Update. The company Expo 54 checkout and the working iOS release stay in place.

| Still required | Class | Next action |
| --- | --- | --- |
| Current App Store artifact mapped to the reported Mac checkout, plus that IPA | Company tree | Leave `/Users/alukojoshfx/.codex/.chatgpt-projects/g-p-6937926449a88191b260dcf079c5ee33/engineering/promax-mobile-ios-company-release` and its uncommitted changes in place. Map track `6810018262` separately from historical build `2e5bbafd-8c84-4427-8b67-d1eb2f0ef3c5`. Do not copy, rebuild, or submit from this host. |
| Emulator or staff device, location permission, and `google-services.json` for a push test | Native | Run the existing roster, clock, document, profile, and trip screens. Do not send a push or a production clock-in. |
| Disposable API for tenant rejection, duplicate clock-in, document company, mileage, and the mail limit | Isolated API | Run those checks off production. Client gates are not that proof. |
| Remember me, and whether draft copies stay for recovery | User policy | Leave the current screens unchanged until a decision is recorded. Play health categories are already set and stay unsubmitted. |
| Web screens that this source does not have, care-plan branch `b773e1d`, and admin menus | Out of scope | Do not add them. |
| Play, App Store, EAS, and OTA | Publication | Do not submit or publish. Managed publishing stays OFF. The ten changes, including Production 4 Start full rollout, stay unsubmitted until a separate approval. |

## Still blocked

| Item | Why it stays blocked |
| --- | --- |
| Android and iOS builds | No Android SDK, `adb`, emulator, or Apple toolchain on this host. No package was produced. On 22 October 2026 Joshua has an MTN-NX1, Android 15, MagicOS 9. No installable approved APK exists. Android-tools approval was asked and not granted. The phone was not used. Phone availability is not native acceptance. Pull request 13 `113442f` and pull request 14 `d925a1a` stay recorded, and that device gate stays. |
| Hosted sign-in, clock-in, report save, and document read | No disposable API and no authorised account. No production request was sent. |
| Remember me and logout deletion | Remember me is unchanged. Logout still keeps the draft. The AsyncStorage prefix on `0d73f38` is a mask, not encryption. SecureStore values are capped at 2048 bytes. On that commit, a new draft whose secure key cannot be stored is plain text. Removal on logout was not added. Pull request 13 `113442f` changes the later write path. Its `749406a` review failed on a torn write and an in-flight overwrite, and the `113442f` retest passed 31 tests. The platform Keychain and Keystore notes above are not a protected-draft pass. Confidentiality versus retention stays parked. |
| Server tenant and assignment enforcement | Blocked until an isolated disposable API can run those tests. Client gates on pull request 11 are not that proof. `pmx_api_v2` was not readable. |
| Live company iPhone binary | Joshua confirmed the restored company app works on iPhone. Bundle `au.com.promaxsolutions.promaxcare` version `1.1.0` is that existing release. The reported Mac checkout and historical build `2e5bbafd-8c84-4427-8b67-d1eb2f0ef3c5` do not prove the binary's commit. The IPA is not on this host. New pull requests are not accepted by that confirmation. |
| Live `com.promax-app` binary | Store version is `1.2.0` from Aermeans. This remote is `1.1.0`. |
| Play listing | Public Play URLs for both packages returned HTTP 404. Console identity is package `au.com.promaxsolutions.promaxcare`, app `4975822694822650269`, developer `7848143770069177658`. Build 4 SHA256 `c186cdb620838a505a34504271827c37abd173791f0aa47b1885a1e45ffd900f` is not mapped to a commit. No APK is on this host. |
| Store, EAS, and OTA | Not run. Managed publishing was not changed. |
| Production destination | Not chosen. |
| Company Expo 54 delta | Reported on Joshua's Mac with uncommitted changes. Absent from this remote and this cloud host. Not copied. Reconcile `246c1b2` there before any release candidate. Do not rebuild Expo 53 over that tree. Current store mapping stays Blocked. |

## Environment

Team environment [`d81efd47-cd22-11f1-bec7-b2318963e0b6`](https://cursor.com/dashboard/cloud-agents/environments/e/d81efd47-cd22-11f1-bec7-b2318963e0b6). No secrets, egress entries, or access settings were changed. No new environment was created.

Draft build [`bld-20261021-f5d587f9-3d47-4943-a508-635dc272e47d`](https://cursor.com/dashboard/cloud-agents/builds/bld-20261021-f5d587f9-3d47-4943-a508-635dc272e47d) succeeded. It cloned `main`, ran `bun install v1.4.3 (c6da4a4d3)`, resolved `expo@53.0.20`, and the install command exited 0. [Verify fresh Bun install build](https://cursor.com/agents/bc-9280e4bb-a455-508b-845f-becb4fa5a9f4) booted from that build on `main` `de4eb2f` and found Bun `1.4.3` revision `1.4.3+c6da4a4d3`, Expo `53.0.20`, React `19.0.0`, React Native `0.79.5`, TypeScript `5.8.3`, Jest `29.7.0`, and no `package-lock.json`. `/tmp/cursor/start-user/` was absent, which matches the empty start script. The saved install script stays empty until that draft is saved. This is not a device or hosted pass.
