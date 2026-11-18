# Company Expo configuration — 18 November 2026

Use the existing company project: https://expo.dev/accounts/promax-it-solutions-pty-ltd/projects/promaxcare

- Owner: `promax-it-solutions-pty-ltd`
- Slug: `promaxcare`
- EAS project ID: `d922d001-8858-4020-aa0d-b6f17f9139ad`
- Android package and iOS bundle: `au.com.promaxsolutions.promaxcare`

## Configuration verified in Expo

The production environment already contains `GOOGLE_SERVICES_JSON` as a sensitive file, `GOOGLE_MAPS_ANDROID_API_KEY`, `GOOGLE_MAPS_IOS_API_KEY`, both `EXPO_PUBLIC_GOOGLE_PLACES_*_API_KEY` variables, and `EXPO_PUBLIC_ANDROID_SIGNING_CERT_SHA1`.

The downloaded EAS Firebase file is identical to the file downloaded from Firebase on 17 November. It identifies project `promaxcare-mobile-au`, project number `1050348979461`, and Android app `1:1050348979461:android:a01ed8e52287df4002a36c`. Do not put these files or key values in Git or shared email.

The existing Expo Android upload certificate SHA-1 is `FE:02:D5:A4:15:7A:D7:D1:19:52:69:BA:C2:DC:D3:39:33:71:71:0D`, matching an existing Android Maps restriction. The other allowed fingerprint begins `97:9F`; its Play signing identity requires separate confirmation.

## Changes in this branch

App identity, update URL and CI identity checks point to the company project. Native Maps configuration consumes the existing separate platform variables instead of one shared key. Firebase continues to use the EAS file path. Existing bundle/package identifiers and store-release workflows are preserved.

`company-validation` is a build-only profile using the existing production environment, an internal Android APK or iOS simulator build, a separate update channel and no version increment. It does not submit or publish. The API remains the production API; do not create or modify operational data during testing.

Do not merge casually: the current main-branch push workflows automatically build and submit to Play internal testing and TestFlight. The user has not authorised store submissions for this setup task. Use build-only validation and coordinate that workflow change before merging.

## Remaining engineering / access checks

1. Damola’s approved Developer invitation was sent on 18 November to `ayobamideleadepoju@gmail.com`; acceptance is pending. Accept it and use an individual login. Any CI token must be separately configured securely; do not email Joshua’s personal token.
2. Address autocomplete still uses the legacy Places client and `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`; trip summary still uses that variable for Static Maps. These web-service usages need separate implementation and API/restriction testing. A native SDK key is not a substitute. Existing iOS Places restriction was Places API (New), so merely changing the variable name does not establish compatibility.
3. Expo shows no FCM V1 service-account credential and no Apple push key. Firebase FCM API enabled does not mean push delivery is configured. Complete least-privilege credentials through an approved secure path, and test delivery on devices.
4. Validate a fresh build, then map rendering, address selection, trip summary and push notifications on real devices. Existing September builds are expired and do not establish current readiness.

Google guidance for mobile web-service restrictions: https://developers.google.com/maps/api-security-best-practices

## Cloud build investigation

The first validation build reached the correct company project and reused `PromaxCare Android Upload 2026`, but failed before compilation because EAS selected a stale `bun.lockb`: `lockfile had changes, but lockfile is frozen`. The upload now excludes that legacy lockfile so EAS uses the same committed `package-lock.json` and npm workflow as GitHub CI. Frozen installation remains enabled.

The second build passed npm install and native prebuild, then found an undeclared `query-string` dependency imported by Expo Router. Added compatible CommonJS `query-string` 7.1.3 explicitly; the Android Hermes bundle now exports locally. This is bundle validation, not a device acceptance test.

Damola's Developer invitation was sent on 18 November after Joshua approved and completed Expo re-authentication; acceptance is pending.

Direct Places API (New) probes using the stored Android/iOS Places keys and the configured application identifiers returned HTTP 403. Invalid identifiers were also rejected. Address search therefore remains unverified and requires Google permission/billing/API restriction diagnosis as well as the legacy-client migration; do not report it working.

Both local Android and iOS Hermes bundles now export successfully. The legacy Places endpoint was also tested directly with a public Canberra query: both platform keys receive `REQUEST_DENIED` with Google's specific message that the legacy API is not enabled and the integration should switch to Places API (New). Google Cloud shows the iOS key restricted to the correct bundle and Places API (New); its value matches the saved Expo variable. Billing is linked to an existing free-trial account, with the console showing trial end on 9 December 2026; no billing changes were made.

## Successful validation build

Android build `0447ca97-cc85-45b0-91fb-f76b567b9f54` finished successfully on 18 November 2026 at 13:10:43 Sydney time (02:10:43 UTC), from code commit `b0fd1ff`.

Build and APK: https://expo.dev/accounts/promax-it-solutions-pty-ltd/projects/promaxcare/builds/0447ca97-cc85-45b0-91fb-f76b567b9f54

Downloaded APK size: 91,464,734 bytes. ZIP integrity passed; Android manifest and Hermes bundle are present. The certificate extracted from its APK v2 signing block has SHA-1 `FE:02:D5:A4:15:7A:D7:D1:19:52:69:BA:C2:DC:D3:39:33:71:71:0D`, matching the existing allowed Maps fingerprint. Certificate extraction is not independent cryptographic signature verification.

APK SHA-256: `e28a47e388649d3e95afac9dfab02ce62d466a42b03ac5b56f22db220514b393`.

This establishes a successful cloud build and intact downloadable artifact. No installation, login, map rendering, address search or notification delivery has been verified on a device. No store submission or update publication was performed.
