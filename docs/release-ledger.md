# Staff release ledger

Target: 22 October 2026, Australia/Sydney. Care OS is the go-live. This mobile ledger is the frontline staff catch-up record. It is not Ready to Update, a store release, an EAS build, an OTA update, or a production publication. A commit on this remote is not a pushed App Store or Play update. The date does not turn a blocked row into a pass.

## Live store lineage

Checked 21 October 2026. No IPA or APK was on this host. No store, EAS, or OTA command was run. The local Expo 54 company tree was not on this host and was not recreated.

| Listing | What the public record says | What this remote is |
| --- | --- | --- |
| Live company iPhone, [PromaxCare](https://apps.apple.com/au/app/promaxcare/id6810018262) | Apple lookup `bundleId=au.com.promaxsolutions.promaxcare`, country `au`. Version `1.1.0`. Seller PROMAX IT SOLUTIONS PTY LTD. Track `6810018262`. Released 2026-09-25. Current version 2026-09-25T20:34:03Z. Size 56,905,728 bytes. Minimum iOS 15.1. No release notes. | That bundle id is not in this git remote. Binary-to-commit lineage is Blocked. |
| Other live iPhone, [Promax Care](https://apps.apple.com/au/app/promax-care/id6748918123) | Apple lookup `bundleId=com.promax-app`. Version `1.2.0`. Seller Aermeans Global Services Limited. Track `6748918123`. First release 2025-08-07. Current version 2025-09-11T18:46:32Z. Size 45,891,584 bytes. Notes mention multi-client reports and per-client kilometres. | `app.json` on `main` `de4eb2f` and on Care OS `981bea5` is version `1.1.0` with the same bundle. Neither commit is the live `1.2.0` binary. Care OS is not the company listing. |
| Play `com.tobby95.pmaxapp` | `https://play.google.com/store/apps/details?id=com.tobby95.pmaxapp&hl=en&gl=au` returned HTTP 404. | This remote's package name. `app.json` version `1.1.0`. No APK. Not a public listing today. |
| Play `au.com.promaxsolutions.promaxcare` | The same Play URL pattern returned HTTP 404. | Not a public listing today. |

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
| Company Expo 54 tree | Not on this remote and not recreated. The live company iPhone bundle `au.com.promaxsolutions.promaxcare` was not applied to these commits. |

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

The release target remains the company iPhone [PromaxCare](https://apps.apple.com/au/app/promaxcare/id6810018262), bundle `au.com.promaxsolutions.promaxcare`, App Store track `6810018262`, version `1.1.0`. These rows are Expo 53 source fixes. They do not complete that company app. None of these rows is a device, hosted, or store pass.

## Prerequisites for the company app

These items are missing. They were not recreated from this remote.

| Needed | Why |
| --- | --- |
| The local company source tree that built `au.com.promaxsolutions.promaxcare` | It is not on this host or this git remote. Expo 54 / React 19.1 / React Native 0.81.5 must stay that tree. |
| The build manifest for App Store version `1.1.0`, track `6810018262` | Need the commit, SDK, and build id that produced the live binary. `main` and Care OS are `com.promax-app` `1.1.0` and are not that manifest. |
| The IPA for that build | No IPA is on this host, so binary lineage stays Blocked. |
| An isolated disposable API | Server tenant and assignment checks stay Blocked until tests can run there. Client gates are not that proof. |

| Pull request | Latest commit | What it holds | Independent review |
| --- | --- | --- | --- |
| [#9](https://github.com/PMXsolutions/Promax-Mobile-App/pull/9) | `ff0881301a4de6e9a04cc4707708e62b124151e7` | A sign-in intent is reserved before `auth_login`. If no store retains it, the request is withheld and can be tried again. No password is stored | [Retest sign-in ff08813](https://cursor.com/agents/bc-a2063c0d-dcc9-5e21-9e92-b9f02d3f8f9a) retested `ff08813`: 3 suites, 41 tests, passed. No assertion was weakened. All three writes failing withholds the send. A retained intent blocks a restart, a duplicate, and an interrupted send until the hour ends. This is not another storage fallback. |
| [#10](https://github.com/PMXsolutions/Promax-Mobile-App/pull/10) | `1095c75e654f00067e2d04db1d1073587b324738` | A submitted attempt is tombstoned and read back before that attempt's copies are removed. The AsyncStorage prefix is a mask, not encryption. Plaintext and that mask are not protected-draft acceptance | [Retest draft tombstone 1095c75](https://cursor.com/agents/bc-6203ec83-dda9-5cc7-9079-99ed54257f86) retested `1095c75`: 3 suites, 33 tests, passed. No assertion was weakened. Restart and a restored SecureStore copy do not bring back that attempt. A lost response, an unsent attempt, and another company or staff key stay. Cleanup failure leaves the bodies. If the tombstone cannot be stored, nothing is deleted. |
| [#11](https://github.com/PMXsolutions/Promax-Mobile-App/pull/11) | `bc3ec9b200e094b8dfbd4b7edc24b22ced51c082` | Cancel, mileage, report, and notification requests wait for this sign-in's roster or message list | [Retest profile 8c09eaa](https://cursor.com/agents/bc-d9a774a5-988d-549d-9394-4f52b41b33f9) retested `bc3ec9b`: 2 suites, 12 tests, passed. The server was not asked to reject another tenant. |
| [#12](https://github.com/PMXsolutions/Promax-Mobile-App/pull/12) | this file | Acceptance matrix and this ledger | Record only. Not a store update. |

The independent rows above re-ran the latest commits in existing checkouts. They are unit and source checks. They are not a device, hosted, or store pass.

## Still blocked

| Item | Why it stays blocked |
| --- | --- |
| Android and iOS builds | No Android SDK, `adb`, emulator, or Apple toolchain. No package was produced. |
| Hosted sign-in, clock-in, report save, and document read | No disposable API and no authorised account. No production request was sent. |
| Remember me and logout deletion | Remember me is unchanged. Logout still keeps the draft. The AsyncStorage prefix on `1095c75` is a mask, not encryption. SecureStore holds the draft in items of at most 2048 bytes. A new draft whose secure key cannot be stored is plain text. Removal on logout was not added. Confidentiality versus retention for that device key and those plaintext chunks is parked. |
| Server tenant and assignment enforcement | Blocked until an isolated disposable API can run those tests. Client gates on pull request 11 are not that proof. `pmx_api_v2` was not readable. |
| Live company iPhone binary | Bundle `au.com.promaxsolutions.promaxcare` version `1.1.0` is on the App Store. Its source tree and IPA are not on this host. |
| Live `com.promax-app` binary | Store version is `1.2.0` from Aermeans. This remote is `1.1.0`. |
| Play listing | Public Play URLs for both packages returned HTTP 404. No APK. |
| Store, EAS, and OTA | Not run. Managed publishing was not changed. |
| Production destination | Not chosen. |
| Company Expo 54 delta | Not on this remote. |

## Environment

Team environment [`d81efd47-cd22-11f1-bec7-b2318963e0b6`](https://cursor.com/dashboard/cloud-agents/environments/e/d81efd47-cd22-11f1-bec7-b2318963e0b6). No secrets, egress entries, or access settings were changed. No new environment was created.

Draft build [`bld-20261021-f5d587f9-3d47-4943-a508-635dc272e47d`](https://cursor.com/dashboard/cloud-agents/builds/bld-20261021-f5d587f9-3d47-4943-a508-635dc272e47d) succeeded. It cloned `main`, ran `bun install v1.4.3 (c6da4a4d3)`, resolved `expo@53.0.20`, and the install command exited 0. [Verify fresh Bun install build](https://cursor.com/agents/bc-9280e4bb-a455-508b-845f-becb4fa5a9f4) booted from that build on `main` `de4eb2f` and found Bun `1.4.3` revision `1.4.3+c6da4a4d3`, Expo `53.0.20`, React `19.0.0`, React Native `0.79.5`, TypeScript `5.8.3`, Jest `29.7.0`, and no `package-lock.json`. `/tmp/cursor/start-user/` was absent, which matches the empty start script. The saved install script stays empty until that draft is saved. This is not a device or hosted pass.
