# PromaxCare mobile release gate

The staff mobile app is a native iOS/Android companion to Care OS. The responsive
browser experience remains the Care OS web application; this repository is not
the participant/admin web client.

## Automated gates (must pass on every candidate)

```text
npm test -- --runInBand --watch=false
npm run lint
npx tsc --noEmit
EXPO_PUBLIC_DEPLOYMENT_ENV=uat \
EXPO_PUBLIC_API_BASEURL=https://apitest.promaxcare.com.au/api \
npx expo export --platform ios
EXPO_PUBLIC_DEPLOYMENT_ENV=uat \
EXPO_PUBLIC_API_BASEURL=https://apitest.promaxcare.com.au/api \
npx expo export --platform android
```

The runtime configuration gate refuses missing environments, non-TLS hosted
APIs, production builds pointed at UAT-like hosts, and UAT builds pointed at
production-looking hosts.

## Physical-device gates (must be evidenced before production)

Run on at least one currently supported iPhone and one currently supported
Android phone, plus small and large screen sizes:

- clean install, first launch, sign in and sign out;
- expired access token refresh and revoked-session return to sign in;
- foreground/background/resume and device restart;
- allow and deny notification, location, camera and photo permissions;
- roster refresh, shift detail and notification deep-link;
- clock in/out inside the geofence;
- clock in/out outside the geofence with mandatory reason;
- poor GPS accuracy and missing participant coordinates;
- connection loss before and during attendance submission (must fail closed,
  never claim success, and never silently queue a duplicate);
- duplicate-tap/idempotency and slow-network behaviour;
- password recovery with a six-digit OTP;
- document capture/upload and image size limits;
- Dynamic Type/font scaling, keyboard, rotation policy and screen-reader labels;
- tenant A worker cannot read or mutate tenant B records.

Record device model, OS version, build identifier, tester, timestamp and result.
Any failed item blocks production release.

## Release profiles

- `development`: local development; HTTP is permitted only for localhost.
- `preview`: UAT; sets `EXPO_PUBLIC_DEPLOYMENT_ENV=uat`.
- `production`: store candidate; sets
  `EXPO_PUBLIC_DEPLOYMENT_ENV=production`.

Development and UAT use distinct display names, URL schemes and installed-app
identifiers (`.dev` / `.uat`). They can coexist with production and cannot
silently overwrite it on a tester's device. Production deliberately preserves
the existing iOS and Android identifiers so an authorised store update path is
not broken.

The API URL and platform-restricted map key must be supplied by the authorised
build environment. Android preview/production also requires the
`GOOGLE_SERVICES_JSON` EAS file secret for push notifications. Secrets and real
values are never committed.

Before store submission, the release owner must verify that the existing Apple
identifier `com.promax-app`, Android identifier `com.tobby95.pmaxapp`, Expo
project and signing credentials are controlled by Promax. Renaming an existing
store identifier without that evidence would create a different application,
not an upgrade.
