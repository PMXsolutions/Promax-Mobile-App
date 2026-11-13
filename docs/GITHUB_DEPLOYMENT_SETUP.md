# GitHub deployment setup

This repository builds and submits Promax Care with GitHub Actions and Expo Application Services (EAS). The workflows do not compile iOS on the runner. EAS Build performs Android and iOS compilation and signing.

Nothing in this setup publishes the app to users by itself. Android production submission creates a Play draft. iOS submission uploads an existing IPA to App Store Connect and does not submit it for App Review.

The app is not cleared for a public store release. `main` includes commit `413d421`, described as fixing the four open shift defects and Play sign-in controls. That work was not retested here. Google Play rejected the app on 22 September 2026. The rejection text is not in this repository and has to be read in Play Console.

## Store application ID

Google Play and TestFlight both use `au.com.promaxsolutions.promaxcare`.

| Platform | Expo field | Value |
| --- | --- | --- |
| Android | `expo.android.package` | `au.com.promaxsolutions.promaxcare` |
| iOS | `expo.ios.bundleIdentifier` | `au.com.promaxsolutions.promaxcare` |
| Expo project | `extra.eas.projectId`, owner `promax-it-solutions` | `e2e19955-9a63-4002-803a-73fee46b337f` |

The workflows compare the resolved Expo config and the finished EAS build with that application ID. A mismatch stops the job before `eas build` on the identity step, and again before submit if the binary was built with a different ID.

Earlier identifiers `com.tobby95.pmaxapp` and `com.promax-app` are not used. EAS credentials, the Play upload key, the Apple provisioning profile, `google-services.json`, and the Google Maps key restrictions must all be for `au.com.promaxsolutions.promaxcare`. Credentials stored only under the old identifiers are not selected for these builds. `--freeze-credentials` still prevents CI from creating a new keystore or profile.

## Workflows

| File | Trigger | What it does |
| --- | --- | --- |
| `.github/workflows/android-build.yml` | Push to `main`, or manual | Validates the project, then builds an Android App Bundle with the EAS `production` profile and submits that build ID to the Play internal track. |
| `.github/workflows/ios-build.yml` | Push to `main`, or manual | Same validation on a macOS runner. EAS builds the IPA. The job submits that build ID to App Store Connect for TestFlight. |
| `.github/workflows/production-release.yml` | Manual only | Requires the `production` GitHub Environment, `main`, and an exact EAS build UUID. It submits that existing binary. It does not build another one. |

`eas submit --latest` is not used. EAS CLI supports `--id`, and another finished build can become "latest" before submission. Each submit step checks the build record and then passes that UUID to `--id`.

Production Android uses `releaseStatus: draft`. Do not change that to `completed` unless the intent is to make the release available on the production track.

## GitHub configuration

Create these before the first production run. GitHub creates an environment with no required reviewers if the workflow runs first, and that first run would not wait for approval.

1. Open the repository on GitHub, then **Settings → Environments → New environment**.
2. Name it exactly `production`.
3. Add required reviewers who are allowed to approve a store submission.
4. Limit deployment branches to `main`.
5. Save the protection rules before anyone runs **Production release**.

Android and iOS promotion are separate jobs. A run that selects both waits for the `production` environment on each job.

`EXPO_TOKEN` must be a repository secret, or an organization secret available to all Actions. Do not store it only on the `production` environment. The Android and iOS build workflows are not deployment jobs, so they cannot read environment-only secrets.

No GitHub Actions variables are required. The store application ID is `au.com.promaxsolutions.promaxcare` in `app.json`.

## Where each credential belongs

Signing material and store API keys stay in EAS. GitHub only needs the Expo token that lets the runner call EAS. Duplicating keystores or API keys into GitHub secrets creates a second copy to rotate and a second place they can be logged.

| Name | Store it in | Used for |
| --- | --- | --- |
| `EXPO_TOKEN` | GitHub repository secret | Authenticate `eas-cli` in Actions |
| Android upload keystore, keystore password, key alias, key password | EAS credentials | Sign the AAB |
| Google Play service-account JSON | EAS Android submit credentials | Upload to Play |
| App Store Connect API key (`.p8`), key ID, issuer ID | EAS iOS submit credentials | Upload the IPA |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | EAS production environment, sensitive string | Maps SDK and Places requests inside the app |
| `GOOGLE_SERVICES_JSON` | EAS production environment, secret file | Android `googleServicesFile` during EAS Build |
| `GoogleService-Info.plist` | Do not commit. Not referenced by `app.json` or `app.config.js` today | Add to the iOS config only if a later change loads it |

`EXPO_PUBLIC_API_BASEURL` stays in `eas.json` as `https://api.promaxcare.com.au/api`. That committed value overrides an EAS environment variable of the same name. Do not point it at another API.

## How to obtain and configure each value

Use the Expo account `promax-it-solutions` and project `promax-care`. The account slug is the name in https://expo.dev/accounts/promax-it-solutions. Install the pinned CLI from this repository with `npx eas-cli` after `npm ci`. Run credential commands on a trusted machine, not in GitHub Actions. Prefer prompts over `--value` so the secret is not stored in shell history.

### EXPO_TOKEN

1. Sign in to https://expo.dev with access to the `promax-it-solutions` account.
2. Open https://expo.dev/accounts/promax-it-solutions/settings/access-tokens. The URL must contain `/accounts/promax-it-solutions/`. A token created on another Expo account cannot read this project.
3. Create a robot with the Admin role, then create its token.
4. GitHub repository **Settings → Secrets and variables → Actions → New repository secret**.
5. Name the secret `EXPO_TOKEN` and paste the token. Replace the existing secret if one is already stored.
6. Do not put the token in `eas.json`, a workflow file, or a `.env` file that is committed.
7. Confirm https://expo.dev/accounts/promax-it-solutions/projects/promax-care shows project ID `e2e19955-9a63-4002-803a-73fee46b337f`. The production environment variables and the Android and iOS credentials must exist on this project. The previous project `70d0de46-7142-4d9a-a7b5-a089e9ea2879` is no longer used.

### Android upload keystore

The existing Play app already has an upload key if a release was signed before. Creating a new keystore will not update that app. Give EAS the upload key that Play already has for `au.com.promaxsolutions.promaxcare`.

1. In Play Console, open the app → **Test and release → App integrity** (or **Setup → App signing**) and record the upload certificate.
2. On a trusted machine, from this repository, run `npx eas-cli credentials`.
3. Choose Android, the `production` build profile, and the keystore that matches that upload certificate.
4. Enter the keystore password, key alias, and key password when prompted. EAS stores them.
5. Leave the files on the trusted machine. `.gitignore` and `.easignore` exclude `*.jks` and `*.keystore`.

The build workflows pass `--freeze-credentials`, so CI fails if the keystore is missing instead of generating a new one.

### Google Play service account

1. In Google Cloud, create a service account for Play submissions.
2. In Play Console, open **Users and permissions**, invite the service account, and grant it permission to release to the internal and production tracks for this app.
3. Create a JSON key and download it. Do not commit it.
4. Run `npx eas-cli credentials`, choose Android submit credentials, and upload that JSON when asked. The path can also be supplied once with the EAS credential flow documented at https://docs.expo.dev/submit/android/.
5. Delete the local JSON key after EAS accepts it, or keep the only copy in the team password manager.

`eas.json` does not set `serviceAccountKeyPath`. Submit therefore uses the key stored on EAS.

### App Store Connect API key

1. In App Store Connect, open **Users and Access → Integrations → App Store Connect API**.
2. Create a team key that can manage builds and TestFlight. Record the **issuer ID** and **key ID**.
3. Download the `.p8` file once. Apple does not offer it again.
4. Run `npx eas-cli credentials`, choose iOS, and store the API key, key ID, and issuer ID. The official steps are at https://docs.expo.dev/submit/ios/.
5. Confirm the App Store Connect app record uses bundle ID `au.com.promaxsolutions.promaxcare`. EAS submit does not create the Apple app from these workflows.
6. Do not commit the `.p8` file. `.gitignore` already excludes `*.p8`.

The iOS submit profiles in `eas.json` are empty objects on purpose. They do not contain Apple IDs or key paths.

### Google Maps API key

`app.config.js` reads `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` and places it in the native Google Maps config. `constants/api-key.ts` reads the same variable for Places and static map requests. The key is embedded in the client binary. Restrict it in Google Cloud to Android package `au.com.promaxsolutions.promaxcare`, that app's signing certificate, and iOS bundle ID `au.com.promaxsolutions.promaxcare`.

From the repository, signed in to the `promax-it-solutions` Expo account:

```bash
npx eas-cli env:set production \
  --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY \
  --type string \
  --visibility sensitive
```

Let the CLI prompt for the value. Do not pass `--value` on the command line. The production build profile sets `"environment": "production"`, so EAS injects this variable on the builder. `eas.json` `env` does not contain the key.

### Firebase Android file

`app.json` sets `android.googleServicesFile` to `./google-services.json`. That file is gitignored. `.easignore` also excludes it, so a local copy is not uploaded in the project archive.

`app.config.js` uses `GOOGLE_SERVICES_JSON` when EAS provides it. EAS file variables are a path on the builder, not the JSON contents.

```bash
npx eas-cli env:set production \
  --name GOOGLE_SERVICES_JSON \
  --type file \
  --visibility secret \
  --value ./google-services.json
```

`--value` here is a local path. The JSON itself is read from that file. Download `google-services.json` for Android package `au.com.promaxsolutions.promaxcare`. A file generated for `com.tobby95.pmaxapp` will not match this build. Do not commit the file.

Push notification registration in `hooks/usePushNotification/index.ts` uses the Expo project ID with `expo-notifications`. It does not read `google-services.json` directly. The native Android build still needs that file because `googleServicesFile` is set. iOS does not reference `GoogleService-Info.plist`.

### Values that must not be GitHub secrets

Do not also create GitHub secrets for the keystore, Play JSON, Apple `.p8`, Maps key, or `google-services.json`. The workflows never read those names. Adding them would be an unused second copy.

## Validate the configuration

Local checks, with no store upload:

```bash
npm ci
npx tsc --noEmit
node scripts/ci/assert-store-identity.mjs --require-play-package --require-ios-confirmation
node scripts/ci/validate-eas-json.mjs
node scripts/ci/self-test.mjs
npx jest --ci --watchAll=false
node scripts/ci/run-eslint-if-configured.mjs
```

`npm test` is `jest --watchAll` and does not exit. CI calls Jest directly for that reason.

`.npmrc` sets `legacy-peer-deps=true`. The existing `react-test-renderer@18.3.1` declares a React 18 peer while the app uses React 19, so `npm ci` cannot build a tree without that setting. The workflows rely on it.

After `EXPO_TOKEN` is available in the shell, list names only. Do not add `--include-sensitive` or `--include-file-content`.

```bash
npx eas-cli env:list production --format short --scope project
node scripts/ci/assert-eas-env.mjs android production
node scripts/ci/assert-eas-env.mjs ios production
npx eas-cli build:version:get --platform android --profile production --non-interactive
npx eas-cli build:version:get --platform ios --profile production --non-interactive
```

These checks pass when both Expo identifiers are `au.com.promaxsolutions.promaxcare`:

```bash
node scripts/ci/assert-store-identity.mjs --require-play-package
node scripts/ci/assert-store-identity.mjs --require-ios-confirmation
```

Do not run `eas build` or `eas submit` to "see if it works" against the stores from a workstation unless you intend to create a release candidate. Those commands are what the workflows run after the gates pass.

Workflow checks that still require GitHub:

- `EXPO_TOKEN` is present and accepted by Expo.
- The `production` environment has required reviewers.
- EAS credentials exist for application ID `au.com.promaxsolutions.promaxcare` on both platforms.
- A protected production run waits for approval and then rejects a missing or mismatched build UUID.

## Rotate credentials

| Credential | Rotation |
| --- | --- |
| `EXPO_TOKEN` | Create a new Expo access token, update the GitHub secret, rerun a workflow until it passes authentication, then revoke the old token. |
| Play service account | Create a new JSON key, grant it the same Play permissions, upload it with `npx eas-cli credentials`, submit nothing until a non-production credential check succeeds, then disable the old key. |
| App Store Connect API key | Create a new key, store it with `npx eas-cli credentials`, confirm an upload to TestFlight with a release candidate, then revoke the old key in App Store Connect. |
| Maps key | Create a restricted replacement in Google Cloud, update the EAS variable with `npx eas-cli env:set`, ship a new binary through internal testing, then disable the old key. The old key remains inside already-installed binaries. |
| `google-services.json` | Download the replacement from Firebase and run `eas env:set` again for `GOOGLE_SERVICES_JSON`. The next Android build picks it up. |
| Android upload keystore | Do not rotate it as a routine step. Play App Signing must approve an upload-key reset. A new keystore in EAS will not publish to the existing app until Play accepts that reset. |

Never print `env`, `printenv`, or `eas env:list --include-sensitive` in a workflow. `scripts/ci/assert-eas-env.mjs` reads the list privately and reports only missing names.

## Version values already in the repo

| Source | Current value | Role |
| --- | --- | --- |
| `app.json` `expo.version` | `1.1.0` | Local marketing version. Remote EAS version management is enabled, so the value on EAS is authoritative for store builds. |
| `package.json` `version` | `1.0.0` | npm package version. It is not the Play `versionCode` or the iOS `buildNumber`. |
| `app.json` `runtimeVersion` | `1.0.0`, with iOS policy `appVersion` | Expo Updates runtime. Not changed by these workflows. |
| `eas.json` `cli.appVersionSource` | `remote` | `versionCode` and `buildNumber` live on EAS. |
| `eas.json` production `autoIncrement` | `true` | Each production-profile build takes the next store build number. |

Do not run `eas build:version:set` or `eas build:version:sync` from CI. Read the remote values with `eas build:version:get` before the first automated build and leave them in place. The release procedure is in `docs/RELEASE_PROCESS.md`.

## Files that must stay untracked

`.gitignore` excludes `.env`, `.env.*` except `.env.example`, `google-services.json`, `GoogleService-Info.plist`, `*.jks`, `*.keystore`, `*.p8`, `*.pem`, and `*.mobileprovision`. `.easignore` repeats the credential patterns because, when it exists, EAS uses it instead of `.gitignore`. Older lines in `.easignore` were left as they were; several use underscores where a glob would need an asterisk, so they do not match real filenames. The appended patterns are the ones that match.
