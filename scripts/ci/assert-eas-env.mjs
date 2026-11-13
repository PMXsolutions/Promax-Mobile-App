import { spawnSync } from "node:child_process";
import {
  ANDROID_EAS_ENV_NAMES,
  IOS_EAS_ENV_NAMES,
  missingEnvironmentNames,
  redactAssignments,
  repoRoot,
} from "./lib.mjs";

const platform = process.argv[2];
const environment = process.argv[3] || "production";
const required =
  platform === "android"
    ? ANDROID_EAS_ENV_NAMES
    : platform === "ios"
      ? IOS_EAS_ENV_NAMES
      : null;

if (!required) {
  console.error("Usage: assert-eas-env.mjs android|ios [environment]");
  process.exit(1);
}

const result = spawnSync(
  "npx",
  [
    "eas-cli",
    "env:list",
    environment,
    "--format",
    "short",
    "--scope",
    "project",
  ],
  {
    cwd: repoRoot,
    encoding: "utf8",
    env: process.env,
  }
);

if (result.error) {
  console.error(`Could not run eas-cli: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(
    `Could not list EAS ${environment} environment variable names. Confirm EXPO_TOKEN and that the ${environment} environment exists.`
  );
  const redacted = redactAssignments(`${result.stdout ?? ""}\n${result.stderr ?? ""}`).trim();
  if (redacted) {
    console.error(redacted);
  }
  process.exit(result.status || 1);
}

const missing = missingEnvironmentNames(`${result.stdout ?? ""}\n${result.stderr ?? ""}`, required);
if (missing.length > 0) {
  console.error(
    `EAS ${environment} environment is missing: ${missing.join(", ")}.`
  );
  console.error(
    "Create these names in EAS for this project. Do not store the values in GitHub or print them in the workflow log. See docs/GITHUB_DEPLOYMENT_SETUP.md."
  );
  process.exit(1);
}

console.log(
  `EAS ${environment} environment has the required ${platform} variable names: ${required.join(", ")}.`
);
