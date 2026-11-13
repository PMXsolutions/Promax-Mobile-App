import assert from "node:assert/strict";
import {
  PLAY_APPLICATION_ID,
  assessEasBuild,
  assessEasJson,
  assessProductionRequest,
  assessStoreIdentity,
  environmentVariableNames,
  loadEasJson,
  missingEnvironmentNames,
  redactAssignments,
} from "./lib.mjs";

const baseConfig = {
  expo: {
    owner: "promax",
    version: "1.1.0",
    extra: {
      eas: { projectId: "70d0de46-7142-4d9a-a7b5-a089e9ea2879" },
      apiBaseUrl: "https://api.promaxcare.com.au/api",
    },
    android: {
      package: "com.tobby95.pmaxapp",
      googleServicesFile: "./google-services.json",
    },
    ios: { bundleIdentifier: "com.promax-app" },
  },
};

const mismatch = assessStoreIdentity(baseConfig, { requirePlayPackage: true });
assert.equal(mismatch.errors.length, 1);
assert.match(mismatch.errors[0], /com\.tobby95\.pmaxapp/);
assert.match(mismatch.errors[0], new RegExp(PLAY_APPLICATION_ID.replace(/\./g, "\\.")));

const matchedConfig = structuredClone(baseConfig);
matchedConfig.expo.android.package = PLAY_APPLICATION_ID;
const matched = assessStoreIdentity(matchedConfig, { requirePlayPackage: true });
assert.deepEqual(matched.errors, []);

const iosBlocked = assessStoreIdentity(baseConfig, { iosConfirmation: "require" });
assert.match(iosBlocked.errors[0], /EXPECTED_IOS_BUNDLE_IDENTIFIER/);

const iosConfirmed = assessStoreIdentity(baseConfig, {
  iosConfirmation: "require",
  expectedIosBundleIdentifier: "com.promax-app",
});
assert.deepEqual(iosConfirmed.errors, []);

const iosMismatch = assessStoreIdentity(baseConfig, {
  iosConfirmation: "warn",
  expectedIosBundleIdentifier: "au.com.example.app",
});
assert.equal(iosMismatch.errors.length, 1);

const redacted = redactAssignments("EXPO_TOKEN=secret\nOK");
assert.equal(redacted.includes("secret"), false);
assert.match(redacted, /EXPO_TOKEN=\*\*\*/);

const names = environmentVariableNames(
  "\u001b[1mEXPO_PUBLIC_GOOGLE_MAPS_API_KEY\u001b[22m=secret-value\nGOOGLE_SERVICES_JSON=*****"
);
assert.deepEqual(
  [...names],
  ["EXPO_PUBLIC_GOOGLE_MAPS_API_KEY", "GOOGLE_SERVICES_JSON"]
);
assert.deepEqual(
  missingEnvironmentNames("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=***", [
    "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY",
    "GOOGLE_SERVICES_JSON",
  ]),
  ["GOOGLE_SERVICES_JSON"]
);

const finished = {
  id: "70d0de46-7142-4d9a-a7b5-a089e9ea2879",
  status: "FINISHED",
  platform: "ANDROID",
  buildProfile: "production",
  distribution: "STORE",
  appIdentifier: PLAY_APPLICATION_ID,
  appVersion: "1.1.0",
  appBuildVersion: "12",
  gitCommitHash: "abc123",
  expirationDate: "2999-01-01T00:00:00.000Z",
  artifacts: { applicationArchiveUrl: "https://example.invalid/app.aab" },
  app: { id: "70d0de46-7142-4d9a-a7b5-a089e9ea2879" },
  updateChannel: { name: "production" },
  runtime: { version: "1.1.0" },
};

assert.equal(
  assessEasBuild(finished, {
    platform: "android",
    requirePlayPackage: true,
    expectCommit: "abc123",
  }).errors.length,
  0
);

const wrongPackage = assessEasBuild(
  { ...finished, appIdentifier: "com.tobby95.pmaxapp" },
  { platform: "android", requirePlayPackage: true }
);
assert.match(wrongPackage.errors.join("\n"), /will not be submitted/);

const preview = assessEasBuild(
  { ...finished, buildProfile: "preview", distribution: "INTERNAL" },
  { platform: "android", requirePlayPackage: true }
);
assert.ok(preview.errors.length >= 2);

const expired = assessEasBuild(
  { ...finished, expirationDate: "2000-01-01T00:00:00.000Z" },
  { platform: "android", requirePlayPackage: true }
);
assert.match(expired.errors.join("\n"), /expired/);

assert.throws(() =>
  assessEasBuild([finished, finished], { platform: "android" })
);

const request = assessProductionRequest({
  ref: "refs/heads/main",
  platform: "both",
  testingApproved: "true",
  androidBuildId: finished.id,
  iosBuildId: "11111111-2222-4333-8444-555555555555",
});
assert.deepEqual(request.errors, []);

const unsafe = assessProductionRequest({
  ref: "refs/heads/feature",
  platform: "android",
  testingApproved: "false",
  androidBuildId: "latest",
});
assert.equal(unsafe.errors.length, 3);

assert.deepEqual(assessEasJson(loadEasJson()), []);

console.log("CI policy self-test passed.");
