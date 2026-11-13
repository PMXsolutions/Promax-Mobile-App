import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(scriptDir, "../..");

export const EXPO_PROJECT_ID = "70d0de46-7142-4d9a-a7b5-a089e9ea2879";
export const EXPO_OWNER = "promax";
export const PRODUCTION_API_BASE_URL = "https://api.promaxcare.com.au/api";

/**
 * Application ID of the existing Google Play listing.
 * The Expo package is compared with this value and is not changed here.
 */
export const PLAY_APPLICATION_ID = "au.com.promaxsolutions.promaxcare";

export const BUILD_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const ANDROID_EAS_ENV_NAMES = [
  "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY",
  "GOOGLE_SERVICES_JSON",
];

export const IOS_EAS_ENV_NAMES = ["EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"];

export function assertUuid(value, label = "EAS build ID") {
  const id = String(value ?? "").trim();
  if (!BUILD_UUID_PATTERN.test(id)) {
    throw new Error(
      `${label} must be the UUID of one finished EAS build. Refusing an empty value or a selector such as latest.`
    );
  }
  return id;
}

export function stripAnsi(value) {
  return String(value ?? "").replace(/\u001b\[[0-9;]*m/g, "");
}

export function redactAssignments(value) {
  return stripAnsi(value)
    .split("\n")
    .map((line) => line.replace(/=.*/, "=***"))
    .join("\n");
}

export function parseJsonFromOutput(text) {
  const raw = String(text ?? "").trim();
  const start = raw.search(/[\[{]/);
  if (start < 0) {
    throw new Error("Command output did not contain JSON.");
  }
  return JSON.parse(raw.slice(start));
}

export function environmentVariableNames(output) {
  const names = new Set();
  for (const line of stripAnsi(output).split("\n")) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]+)\s*=/);
    if (match) {
      names.add(match[1]);
    }
  }
  return names;
}

export function missingEnvironmentNames(output, requiredNames) {
  const present = environmentVariableNames(output);
  return requiredNames.filter((name) => !present.has(name));
}

export function readExpoObject(config) {
  if (config && typeof config === "object" && config.expo) {
    return config.expo;
  }
  return config ?? {};
}

export function assessStoreIdentity(config, options = {}) {
  const expo = readExpoObject(config);
  const errors = [];
  const warnings = [];
  const androidPackage = expo.android?.package ?? "";
  const iosBundleIdentifier = expo.ios?.bundleIdentifier ?? "";
  const projectId = expo.extra?.eas?.projectId ?? "";
  const owner = expo.owner ?? "";
  const apiBaseUrl = expo.extra?.apiBaseUrl ?? "";
  const googleServicesFile = expo.android?.googleServicesFile ?? "";

  if (projectId !== EXPO_PROJECT_ID) {
    errors.push(
      `Expo project ID is "${projectId || "missing"}". Expected the existing project ${EXPO_PROJECT_ID}. This pipeline does not create another Expo project.`
    );
  }
  if (owner !== EXPO_OWNER) {
    errors.push(
      `Expo owner is "${owner || "missing"}". Expected ${EXPO_OWNER}.`
    );
  }
  if (apiBaseUrl !== PRODUCTION_API_BASE_URL) {
    errors.push(
      `Resolved API base URL is "${apiBaseUrl || "missing"}". Expected ${PRODUCTION_API_BASE_URL}.`
    );
  }

  const mapsKey = expo.android?.config?.googleMaps?.apiKey;
  if (typeof mapsKey === "string" && mapsKey.length > 0) {
    warnings.push(
      "The resolved Expo config contains a Google Maps API key. CI logs must not print the config JSON."
    );
  }

  if (options.requirePlayPackage && androidPackage !== PLAY_APPLICATION_ID) {
    errors.push(
      [
        `Android package in the Expo config is "${androidPackage || "missing"}".`,
        `The existing Google Play application ID is ${PLAY_APPLICATION_ID}.`,
        "These identifiers differ. Android EAS builds are not started for that Play listing, because a production-profile build would consume a remote versionCode and the resulting AAB cannot be submitted to the existing app.",
        "Confirm the application ID in Google Play Console, then update the Expo package only after that confirmation. This check does not change the package.",
      ].join(" ")
    );
  }

  const expectedIosBundle = String(options.expectedIosBundleIdentifier ?? "").trim();
  if (options.iosConfirmation === "require") {
    if (!expectedIosBundle) {
      errors.push(
        [
          "GitHub Actions variable EXPECTED_IOS_BUNDLE_IDENTIFIER is not set.",
          `The repository currently contains ${iosBundleIdentifier || "no bundle identifier"}.`,
          "That repository value has not been confirmed against Apple Developer.",
          "After verifying the identifier in Apple Developer and App Store Connect, set the variable to that confirmed value. Production iOS promotion stays blocked until it matches the Expo config.",
        ].join(" ")
      );
    } else if (expectedIosBundle !== iosBundleIdentifier) {
      errors.push(
        `EXPECTED_IOS_BUNDLE_IDENTIFIER is "${expectedIosBundle}" but the Expo bundle identifier is "${iosBundleIdentifier}". Production iOS promotion is blocked.`
      );
    }
  } else if (options.iosConfirmation === "warn") {
    if (!expectedIosBundle) {
      warnings.push(
        `Apple bundle confirmation is still outstanding. The repository bundle identifier is "${iosBundleIdentifier}". Set the GitHub variable EXPECTED_IOS_BUNDLE_IDENTIFIER after checking Apple Developer. This TestFlight workflow does not treat the repository value as confirmed.`
      );
    } else if (expectedIosBundle !== iosBundleIdentifier) {
      errors.push(
        `EXPECTED_IOS_BUNDLE_IDENTIFIER is "${expectedIosBundle}" but the Expo bundle identifier is "${iosBundleIdentifier}".`
      );
    }
  }

  if (!options.googleServicesFromEnv) {
    if (!googleServicesFile.endsWith("google-services.json")) {
      errors.push(
        `Android googleServicesFile resolved to "${googleServicesFile || "missing"}" while GOOGLE_SERVICES_JSON was unset. The local fallback must remain ./google-services.json.`
      );
    }
  }

  return {
    errors,
    warnings,
    identity: {
      projectId,
      owner,
      apiBaseUrl,
      androidPackage,
      iosBundleIdentifier,
      version: expo.version ?? "",
      googleServicesFile: options.googleServicesFromEnv
        ? "(EAS file variable path hidden)"
        : googleServicesFile,
    },
  };
}

export function coerceBuildRecord(value) {
  const record = Array.isArray(value) ? value : [value];
  const builds = record.filter(Boolean);
  if (builds.length !== 1) {
    throw new Error(
      `Expected exactly one EAS build record, received ${builds.length}.`
    );
  }
  return builds[0];
}

function sameText(left, right) {
  return String(left ?? "").toLowerCase() === String(right ?? "").toLowerCase();
}

export function assessEasBuild(record, options) {
  const build = coerceBuildRecord(record);
  const errors = [];
  const id = String(build.id ?? "").trim();

  try {
    assertUuid(id);
  } catch (error) {
    errors.push(error.message);
  }

  if (!sameText(build.status, "FINISHED")) {
    errors.push(
      `EAS build ${id || "(missing id)"} status is "${build.status ?? "missing"}". Only a FINISHED build can be submitted.`
    );
  }
  if (!sameText(build.platform, options.platform)) {
    errors.push(
      `EAS build platform is "${build.platform ?? "missing"}". Expected ${options.platform}.`
    );
  }
  if (!sameText(build.buildProfile, options.profile ?? "production")) {
    errors.push(
      `EAS build profile is "${build.buildProfile ?? "missing"}". Expected ${options.profile ?? "production"}.`
    );
  }
  if (!sameText(build.distribution, "STORE")) {
    errors.push(
      `EAS build distribution is "${build.distribution ?? "missing"}". Store submission requires a store build, not an internal or simulator binary.`
    );
  }
  if (build.isForIosSimulator === true) {
    errors.push("Refusing an iOS simulator build.");
  }

  const archive = build.artifacts?.applicationArchiveUrl || build.artifacts?.buildUrl;
  if (!archive) {
    errors.push("EAS build has no application archive URL, so there is no binary to submit.");
  }

  if (build.expirationDate) {
    const expiresAt = Date.parse(build.expirationDate);
    if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
      errors.push(
        `EAS build ${id} expired at ${build.expirationDate}. Create a new release candidate and test that binary before submitting it.`
      );
    }
  }

  const appId = build.app?.id;
  if (appId && appId !== EXPO_PROJECT_ID) {
    errors.push(
      `EAS build belongs to project "${appId}", not ${EXPO_PROJECT_ID}.`
    );
  }

  if (options.expectCommit) {
    const actual = String(build.gitCommitHash ?? "");
    const expected = options.expectCommit;
    const sameCommit =
      actual.length > 0 &&
      (expected.startsWith(actual) || actual.startsWith(expected));
    if (!sameCommit) {
      errors.push(
        `EAS build commit is "${actual || "missing"}". This job expected ${expected}.`
      );
    }
  }

  if (options.expectId && id !== options.expectId) {
    errors.push(
      `Fetched EAS build ${id} does not match the approved build ${options.expectId}.`
    );
  }

  if (!build.appIdentifier) {
    errors.push("EAS build record has no appIdentifier, so the store target cannot be verified.");
  } else if (options.requirePlayPackage && build.appIdentifier !== PLAY_APPLICATION_ID) {
    errors.push(
      `EAS build application ID is "${build.appIdentifier}". The Play listing is ${PLAY_APPLICATION_ID}. This binary will not be submitted.`
    );
  }

  if (options.requireIosIdentifier) {
    const expected = String(options.expectedIosBundleIdentifier ?? "").trim();
    if (!expected) {
      errors.push(
        "EXPECTED_IOS_BUNDLE_IDENTIFIER is required before an iOS build can be submitted."
      );
    } else if (build.appIdentifier && build.appIdentifier !== expected) {
      errors.push(
        `EAS build bundle identifier is "${build.appIdentifier}". EXPECTED_IOS_BUNDLE_IDENTIFIER is "${expected}".`
      );
    }
  }

  if (build.updateChannel?.name && build.updateChannel.name !== "production") {
    errors.push(
      `EAS build channel is "${build.updateChannel.name}". Expected production.`
    );
  }

  return {
    errors,
    id,
    summary: {
      id,
      status: build.status ?? "",
      platform: build.platform ?? "",
      buildProfile: build.buildProfile ?? "",
      distribution: build.distribution ?? "",
      appIdentifier: build.appIdentifier ?? "",
      appVersion: build.appVersion ?? "",
      appBuildVersion: build.appBuildVersion ?? "",
      runtimeVersion: build.runtime?.version ?? "",
      gitCommitHash: build.gitCommitHash ?? "",
      channel: build.updateChannel?.name ?? "",
      expirationDate: build.expirationDate ?? "",
      sdkVersion: build.sdkVersion ?? "",
      hasArchive: Boolean(archive),
    },
  };
}

export function assessProductionRequest(input) {
  const errors = [];
  const platform = input.platform;
  const testingApproved = input.testingApproved === true || input.testingApproved === "true";

  if (input.ref !== "refs/heads/main") {
    errors.push(
      `Production deployment is allowed only from refs/heads/main. Current ref: ${input.ref || "missing"}.`
    );
  }
  if (!testingApproved) {
    errors.push(
      "testing_approved must be true. That confirmation means this exact build passed internal testing or TestFlight and is approved for store submission."
    );
  }
  if (!["android", "ios", "both"].includes(platform)) {
    errors.push(`Unsupported platform "${platform ?? ""}". Use android, ios, or both.`);
  }

  let androidBuildId = "";
  let iosBuildId = "";
  if (platform === "android" || platform === "both") {
    try {
      androidBuildId = assertUuid(input.androidBuildId, "android_build_id");
    } catch (error) {
      errors.push(error.message);
    }
  }
  if (platform === "ios" || platform === "both") {
    try {
      iosBuildId = assertUuid(input.iosBuildId, "ios_build_id");
    } catch (error) {
      errors.push(error.message);
    }
  }

  return { errors, androidBuildId, iosBuildId };
}

export function assessEasJson(easJson) {
  const errors = [];
  if (easJson?.cli?.appVersionSource !== "remote") {
    errors.push("cli.appVersionSource must stay remote.");
  }

  for (const name of ["development", "preview", "production"]) {
    if (!easJson?.build?.[name]) {
      errors.push(`Missing build profile ${name}.`);
    }
  }

  const production = easJson?.build?.production;
  if (production?.environment !== "production") {
    errors.push('Production builds must use the EAS "production" environment.');
  }
  if (production?.android?.buildType !== "app-bundle") {
    errors.push("Production Android builds must remain app bundles.");
  }
  if (production?.autoIncrement !== true) {
    errors.push("Production autoIncrement must stay enabled.");
  }
  if (production?.env?.EXPO_PUBLIC_API_BASEURL !== PRODUCTION_API_BASE_URL) {
    errors.push("Production EXPO_PUBLIC_API_BASEURL must stay the production API.");
  }
  if (production?.channel !== "production") {
    errors.push('Production build channel must stay "production".');
  }

  const submit = easJson?.submit ?? {};
  if (submit.internal?.android?.track !== "internal") {
    errors.push('Submit profile "internal" must target the Play internal track.');
  }
  if (submit.internal?.android?.releaseStatus !== "completed") {
    errors.push('Submit profile "internal" must use releaseStatus completed so testers can install.');
  }
  if (!submit.testflight || typeof submit.testflight.ios !== "object") {
    errors.push('Submit profile "testflight" must define an iOS object.');
  }
  if (submit.production?.android?.track !== "production") {
    errors.push('Submit profile "production" must target the Play production track.');
  }
  if (submit.production?.android?.releaseStatus !== "draft") {
    errors.push(
      'Submit profile "production" must use releaseStatus draft so CI does not publish to Play users.'
    );
  }
  if (!submit.production || typeof submit.production.ios !== "object") {
    errors.push('Submit profile "production" must define an iOS object.');
  }

  const serialized = JSON.stringify(easJson);
  if (/"private_key"\s*:/.test(serialized) || serialized.includes("-----BEGIN")) {
    errors.push("eas.json contains key material.");
  }

  return errors;
}

export function loadEasJson() {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, "eas.json"), "utf8"));
}

export function formatIdentity(identity) {
  return [
    `Expo project: ${identity.projectId}`,
    `Owner: ${identity.owner}`,
    `API: ${identity.apiBaseUrl}`,
    `Android package: ${identity.androidPackage}`,
    `Play application: ${PLAY_APPLICATION_ID}`,
    `iOS bundle: ${identity.iosBundleIdentifier}`,
    `app.json version: ${identity.version}`,
    `Android services file: ${identity.googleServicesFile}`,
  ].join("\n");
}

export function formatBuildSummary(summary) {
  return [
    `Build: ${summary.id}`,
    `Status: ${summary.status}`,
    `Platform: ${summary.platform}`,
    `Profile: ${summary.buildProfile}`,
    `Distribution: ${summary.distribution}`,
    `Application ID: ${summary.appIdentifier}`,
    `Version: ${summary.appVersion}`,
    `Store build number: ${summary.appBuildVersion}`,
    `Runtime: ${summary.runtimeVersion}`,
    `Channel: ${summary.channel}`,
    `SDK: ${summary.sdkVersion}`,
    `Commit: ${summary.gitCommitHash}`,
    `Expires: ${summary.expirationDate}`,
    `Archive present: ${summary.hasArchive ? "yes" : "no"}`,
  ].join("\n");
}

export function publicReleaseNotice(platform) {
  if (platform === "android") {
    return "This job uploads a draft release to the Google Play production track. It does not roll the app out to users. Promote or discard the draft in Play Console after review.";
  }
  if (platform === "ios") {
    return "This job uploads an existing IPA to App Store Connect. Apple may show it in TestFlight after processing. It does not submit the app for App Review and it does not release it on the App Store.";
  }
  return "This job does not publish the app to users.";
}
