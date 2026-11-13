# Release process

Promax Care store releases are EAS cloud builds submitted by GitHub Actions. Production promotion never starts from a normal push, and it never builds a second binary. The binary that testers approved is the binary that is submitted.

This process does not mean the app is ready for a public release. Confirm all of the following before approving the production environment:

- The 22 September 2026 Google Play policy rejection has been read in Play Console and the cited policy issues are resolved.
- QA has accepted the shift, trip, document, and report behaviour on the exact build being promoted. Commit `413d421` on `main` records code changes for those areas and for Play sign-in controls. This deployment work did not retest them.
- The build application ID is `au.com.promaxsolutions.promaxcare` on both Google Play and TestFlight. That is the package and bundle identifier in `app.json`.

Setup for tokens and store credentials is in `docs/GITHUB_DEPLOYMENT_SETUP.md`.

## Version rules

EAS remote version management is already enabled (`cli.appVersionSource` is `remote`). The production build profile has `autoIncrement`. Android `versionCode` and iOS `buildNumber` therefore come from EAS, not from a local edit during CI.

1. Before the first automated build, record the current remote versions:

   ```bash
   npx eas-cli build:version:get --platform android --profile production --non-interactive
   npx eas-cli build:version:get --platform ios --profile production --non-interactive
   ```

   Do not reset those numbers to `app.json` or `package.json`.

2. A marketing-version change is a separate human step, done before a new release candidate is built:

   ```bash
   npx eas-cli build:version:set --platform android --profile production
   npx eas-cli build:version:set --platform ios --profile production
   ```

   CI never runs `build:version:set` or `build:version:sync`.

3. Every build that uses the `production` profile takes the next `versionCode` and `buildNumber`. Cancelling the GitHub job after EAS has started does not give that number back. Do not start a build for a docs-only experiment.

4. The production workflow does not call `eas build`, so promotion does not take another build number and does not produce a different binary.

5. `package.json` version `1.0.0` and `app.json` version `1.1.0` are allowed to differ. The store version is the remote EAS version. Do not treat a green Actions run as a version bump of either file.

6. If Apple or Google rejects a binary, leave its build number used. The next candidate is a new `production` profile build, then a new internal or TestFlight pass.

`app.json` has a top-level `runtimeVersion` of `1.0.0` and an iOS runtime policy of `appVersion`. These workflows do not change Expo Updates behaviour.

## Development deployment

1. A developer merges or pushes to `main`.
2. GitHub starts **Android build** and **iOS build**. A manual run is **Actions → the workflow → Run workflow**. Use `main` for any binary that might be submitted.
3. Only one Android run and one iOS run execute at a time. A newer queued run replaces an older queued run. A run that has already started is not cancelled.
4. Each job installs from `package-lock.json` with `npm ci`, then runs:
   - `npx tsc --noEmit`
   - Expo config validation
   - `node scripts/ci/validate-eas-json.mjs`
   - `npx jest --ci --watchAll=false`
   - ESLint only when `eslint` and a config file are both present
5. The job then checks `EXPO_TOKEN`, the store identifier, and the EAS production environment variable names.
6. Only after those checks does it call EAS Build. `--freeze-credentials` is set so the build cannot invent a keystore or provisioning profile.
7. The job reads the finished build, checks platform, `production` profile, store distribution, application ID, commit, and archive, then submits that UUID.

There is no separate dev-store workflow. The `development` and `preview` EAS profiles are unchanged and are not used by these workflows. `preview` still builds an APK. CI store builds are Android App Bundles.

## Android internal testing

The workflow is `.github/workflows/android-build.yml`.

1. The Expo Android package is `au.com.promaxsolutions.promaxcare`. The workflow stops before `eas build` if the resolved package is anything else. EAS Android credentials and `google-services.json` must be for that same application ID.
2. Configure the EAS keystore, Play service account, Maps key, and `GOOGLE_SERVICES_JSON` as described in the setup guide.
3. Push to `main`, or run the workflow manually from `main`.
4. The build command is:

   ```bash
   npx eas-cli build \
     --platform android \
     --profile production \
     --non-interactive \
     --wait \
     --json \
     --freeze-credentials
   ```

5. Submission uses the internal profile, which sets the Play track to `internal` and `releaseStatus` to `completed`:

   ```bash
   npx eas-cli submit \
     --platform android \
     --profile internal \
     --id <build-uuid> \
     --non-interactive \
     --wait
   ```

6. Open the Actions run. The summary lists the build UUID, application ID, version, store build number, and commit. It does not list artifact URLs or environment values.
7. In Play Console, open the app → **Test and release → Testing → Internal testing**. Confirm the version code matches `appBuildVersion` from the summary.
8. On the **Testers** tab, add the email list that should install the release. Testers open the opt-in link and install from Play.
9. Install that version code on a device and run the staff flows that are being released, including sign-in, roster day, clock-in, trips, reports, and document upload.
10. Record the EAS build UUID. Production promotion asks for that UUID, not for "the latest build".

Internal testing uses the same AAB that a later production promotion submits. Do not rebuild between those steps unless the binary itself must change. A rebuild is a new candidate and needs another internal test pass.

## iOS TestFlight

The workflow is `.github/workflows/ios-build.yml`. The runner is `macos-latest` because the workflow is the iOS orchestration job. It does not run `xcodebuild`. Compilation and signing happen in EAS.

1. The Expo iOS bundle identifier is `au.com.promaxsolutions.promaxcare`. The workflow stops before `eas build` if the resolved bundle identifier is anything else.
2. Confirm the App Store Connect app and the EAS iOS credentials use that bundle ID. EAS submit does not create the Apple app.
3. Set `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` on the EAS production environment. iOS does not currently load `GoogleService-Info.plist`.
4. Push to `main` or run the workflow from `main`.
5. The build command is:

   ```bash
   npx eas-cli build \
     --platform ios \
     --profile production \
     --non-interactive \
     --wait \
     --json \
     --freeze-credentials
   ```

6. Submission uploads that IPA and asks EAS to attach it to the internal TestFlight group. This is the CLI default `--auto-testflight-setup`. It does not submit the app for App Review:

   ```bash
   npx eas-cli submit \
     --platform ios \
     --profile testflight \
     --id <build-uuid> \
     --non-interactive \
     --wait \
     --auto-testflight-setup
   ```

7. In App Store Connect, open the app → **TestFlight**. Wait until the build finishes processing. Answer any remaining export-compliance question if Apple still asks. `app.json` sets `ITSAppUsesNonExemptEncryption` to false.
8. Under **Internal Testing**, add App Store Connect users who should install the build. Internal testers do not need a beta-app review. External groups do, and these workflows do not create an external group.
9. Install the build from the TestFlight app and run the same staff flows as on Android.
10. Keep the EAS build UUID. That is the value the production workflow accepts.

## Production deployment

The workflow is `.github/workflows/production-release.yml`. It is `workflow_dispatch` only. A push cannot start it.

1. Finish internal testing or TestFlight on one exact EAS build. The build status must be `FINISHED`, its profile must be `production`, and its distribution must be `STORE`.
2. Copy the build UUID from the Actions summary or from:

   ```bash
   npx eas-cli build:view <build-uuid> --json
   ```

   Compare `appVersion`, `appBuildVersion`, `appIdentifier`, and `gitCommitHash` with the candidate that was tested. Do not substitute a newer build that has not been tested.
3. Actions → **Production release** → **Run workflow**.
4. Choose branch `main`. Any other ref fails before submission.
5. Choose `android`, `ios`, or `both`. The two platforms can be promoted separately. One production run does not overlap another.
6. Paste `android_build_id` and/or `ios_build_id`. The value must be a UUID. `latest` is rejected.
7. Set **testing approved** to true only if that UUID passed testing.
8. GitHub waits for the `production` environment reviewers. The submit jobs do not start until a reviewer approves.
9. The job fetches that build from EAS and submits it only if the id, platform, profile, distribution, archive, expiry, project, and application ID all match. There is no `eas build` step.

Android submit:

```bash
npx eas-cli submit \
  --platform android \
  --profile production \
  --id <approved-build-uuid> \
  --non-interactive \
  --wait
```

The production submit profile sets track `production` and `releaseStatus` `draft`. In Play Console, the result is a draft on the production track. It is not available to users. A person still has to review the policy status and roll out, halt, or discard that draft.

iOS submit:

```bash
npx eas-cli submit \
  --platform ios \
  --profile production \
  --id <approved-build-uuid> \
  --non-interactive \
  --wait \
  --auto-testflight-setup
```

This uploads the same IPA again if it was not already uploaded, or EAS reports the existing submission. It does not select the build on an App Store version and it does not send the version to App Review. In App Store Connect, create or open the version, choose this build, complete the questionnaire, and submit for review only when the release is actually intended. Release to the App Store remains a separate manual action after Apple approves the version.

## Review, halt, and rollback

| Store | What CI did | How to stop it |
| --- | --- | --- |
| Play internal | Completed release on the internal track | In Play Console, open Internal testing and halt or replace that release. This does not affect production users. |
| Play production | Draft release only | Discard the draft in Play Console. If someone later rolls it out, halt the rollout there. CI cannot unpublish an already completed production release. |
| TestFlight | Build uploaded for internal testers | Expire or remove the build from the TestFlight group in App Store Connect. Installed TestFlight copies remain until testers update or the build expires. |
| App Store | Nothing is submitted for review by CI | If a person has submitted a version, reject or remove it from review in App Store Connect while review is still open. After release, use the App Store phase controls or release a subsequent binary. An already approved build number cannot be reused. |

A rollback that needs a code change is a new production-profile build, a new test pass, and a new production promotion of that new UUID.

## Troubleshooting

| What you see | What it means |
| --- | --- |
| `EXPO_TOKEN GitHub repository secret is not set` | Add the repository secret. Environment-only secrets are invisible to the build workflows. |
| Expo returns 401 or "not logged in" | The token is revoked, belongs to the wrong account, or lacks access to owner `promax`. Rotate it as in the setup guide. |
| Android package or iOS bundle is not `au.com.promaxsolutions.promaxcare` | The job stops before `eas build`. Both stores use that application ID. |
| Credential lookup uses an old application ID | Credentials saved for `com.tobby95.pmaxapp` or `com.promax-app` are not used. Assign the Play upload key and Apple profile for `au.com.promaxsolutions.promaxcare` in EAS. |
| Missing `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` or `GOOGLE_SERVICES_JSON` | Create them on the EAS production environment. The checker reports names only. |
| `google-services.json` missing during the EAS build | The file is not in git and is not uploaded. The secret file variable must exist, and `app.config.js` must keep using `GOOGLE_SERVICES_JSON`. |
| Credential or keystore error with `--freeze-credentials` | CI will not create credentials. Configure them with `npx eas-cli credentials` and run again. Do not remove `--freeze-credentials` to get past a missing key. |
| `versionCode` or `CFBundleVersion` has already been used | Remote autoincrement should prevent this. Do not reuse a number. If a manual `build:version:set` moved the counter backwards, set it forward above the last accepted store build. |
| Build status is not `FINISHED` | Submission does not start. Open the build on expo.dev and fix the compile or signing error. A new build is a new candidate. |
| Build profile or distribution does not match | A preview APK or simulator build cannot be promoted. Build with the `production` profile. |
| Build commit does not match the GitHub SHA | The internal and TestFlight jobs only submit the build created by that run. |
| Production job says the build ID is not a UUID | Paste the EAS UUID. Do not type `latest`. |
| Production job never starts after dispatch | The `production` environment is waiting for reviewers, or the guard job rejected the ref or the approval input. |
| Two production runs | The second waits. GitHub keeps the in-progress run and the newest pending run. |
| `eas submit` cannot find the Play app or App Store Connect app | The binary's application ID does not match an app the service account or API key can access, or the store app record was never created. |
| Play accepts an upload but users do not see it | Production submission is a draft. That is intentional. |
| TestFlight build missing | Apple processing can take time. Check TestFlight processing and the export-compliance answer. `--auto-testflight-setup` only covers an internal group. |
| `npm ci` fails | `package-lock.json` is the CI lockfile. Do not use `npm install` inside the workflow. `.npmrc` sets `legacy-peer-deps=true` because `react-test-renderer@18.3.1` conflicts with React 19. The repository also has `bun.lockb`; CI does not install from it. |
| `npm test` hangs locally | The npm script uses Jest watch mode. Use `npx jest --ci --watchAll=false`. |
| ESLint step says lint was not executed | `eslint` is not installed and there is no ESLint config. The step records that limitation and does not pretend lint passed. `package.json` still has `"lint": "expo lint"` for when ESLint is added. |
| TypeScript or Jest fails | The workflow stops before EAS. Fix the failure in the app repository. Do not skip the step. |
| YAML or `eas.json` rejected | Run `node scripts/ci/validate-eas-json.mjs` and `node scripts/ci/self-test.mjs`. |

Do not treat a successful Actions log as a Play review, an App Review submission, or a public rollout. Those remain manual, and only after the policy and product checks above are actually done.
