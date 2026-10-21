# Staff release ledger

Target: 22 October 2026, Australia/Sydney. This is the qualified slice that can be demonstrated from the remote staff app. It is not a store release, an EAS build, an OTA update, or a production publication. The production destination is still being chosen. The date does not turn a blocked row into a pass.

## Identity

| Item | Value |
| --- | --- |
| Android package | `com.tobby95.pmaxapp` |
| Remote app | Expo `53.0.20`, React `19.0.0`, React Native `0.79.5` |
| Lockfile | `bun.lockb` `799331d86a1ff0795f2302f5e64b76691564ab6f` |
| Company Expo 54 tree | Not on this remote. Package name `au.com.promaxsolutions.promaxcare` was not applied. This ledger does not replace that tree. |

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

These rows are the staff-app changes under review. Independent review of the latest commits is still running, so none of these rows is accepted as a device or hosted pass.

| Pull request | Latest commit | What it holds | Independent review |
| --- | --- | --- | --- |
| [#9](https://github.com/PMXsolutions/Promax-Mobile-App/pull/9) | `07d266bf267bfe5de8ca903a4bebb42397733900` | Sign-in mail failures stay on the form for one hour per email, including `Error sending mail.` | [Retest sign-in 07d266b](https://cursor.com/agents/bc-3b7456cc-d8d7-5716-a6a2-a85e425ded83) in progress |
| [#10](https://github.com/PMXsolutions/Promax-Mobile-App/pull/10) | `f5303520de14d717d420fff03c2fe0b32895b3c4` | Report drafts require a positive company id and staff id, and do not send unless the in-flight draft is stored | [Retest drafts f530352](https://cursor.com/agents/bc-62a56eb0-3e9d-5dd3-92e3-6f771c624d9c) in progress |
| [#11](https://github.com/PMXsolutions/Promax-Mobile-App/pull/11) | `8c09eaa4a9bfeb20b7540a874b2f91ddc3beef1f` | A document needs a positive company id. A shift is requested only after it is on this staff member's roster | [Retest profile 7ec97f1](https://cursor.com/agents/bc-d854589c-f749-59b9-a200-c4542b57e848) reviewed `7ec97f1`. Author unit run on `8c09eaa`: 2 suites, 11 tests, passed. That review has not re-run `8c09eaa`. |
| [#12](https://github.com/PMXsolutions/Promax-Mobile-App/pull/12) | this file | Acceptance matrix and this ledger | Record only |

Author unit runs already recorded in `docs/staff-journey-matrix.md` stay unit runs. They are not a second acceptance.

## Still blocked

| Item | Why it stays blocked |
| --- | --- |
| Android and iOS builds | No Android SDK, `adb`, emulator, or Apple toolchain. No package was produced. |
| Hosted sign-in, clock-in, report save, and document read | No disposable API and no authorised account. No production request was sent. |
| Remember me, draft encryption, and logout deletion | Product choices left as they are. Drafts stay plaintext so the same staff member can restore them. |
| API mail-before-password | `pmx_api_v2` was not changed. The client hour is local only. |
| Store, EAS, and OTA | Not run. Managed publishing was not changed. |
| Production destination | Not chosen. |
| Company Expo 54 delta | Not on this remote. |

## Environment

Team environment [`d81efd47-cd22-11f1-bec7-b2318963e0b6`](https://cursor.com/dashboard/cloud-agents/environments/e/d81efd47-cd22-11f1-bec7-b2318963e0b6). No secrets, egress entries, or access settings were changed. No new environment was created.

Draft build [`bld-20261021-f5d587f9-3d47-4943-a508-635dc272e47d`](https://cursor.com/dashboard/cloud-agents/builds/bld-20261021-f5d587f9-3d47-4943-a508-635dc272e47d) succeeded. It cloned `main`, ran `bun install v1.4.3 (c6da4a4d3)`, resolved `expo@53.0.20`, and the install command exited 0. [Verify fresh Bun install build](https://cursor.com/agents/bc-9280e4bb-a455-508b-845f-becb4fa5a9f4) booted from that build on `main` `de4eb2f` and found Bun `1.4.3` revision `1.4.3+c6da4a4d3`, Expo `53.0.20`, React `19.0.0`, React Native `0.79.5`, TypeScript `5.8.3`, Jest `29.7.0`, and no `package-lock.json`. `/tmp/cursor/start-user/` was absent, which matches the empty start script. The saved install script stays empty until that draft is saved. This is not a device or hosted pass.
