import { execFileSync } from "node:child_process";
import fs from "node:fs";
import {
  assessStoreIdentity,
  formatIdentity,
  parseJsonFromOutput,
  repoRoot,
} from "./lib.mjs";

const args = new Set(process.argv.slice(2));
const requirePlayPackage = args.has("--require-play-package");
const iosConfirmation = args.has("--require-ios-confirmation")
  ? "require"
  : args.has("--warn-ios-confirmation")
    ? "warn"
    : "none";

let stdout = "";
try {
  stdout = execFileSync("npx", ["expo", "config", "--json", "--type", "public"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (error) {
  const stderr = error.stderr ? String(error.stderr) : "";
  console.error("Expo configuration validation failed.");
  if (stderr.trim()) {
    console.error(stderr.trim());
  }
  process.exit(1);
}

let config;
try {
  config = parseJsonFromOutput(stdout);
} catch (error) {
  console.error(`Could not parse Expo config JSON: ${error.message}`);
  process.exit(1);
}

const result = assessStoreIdentity(config, {
  requirePlayPackage,
  iosConfirmation,
  expectedIosBundleIdentifier: process.env.EXPECTED_IOS_BUNDLE_IDENTIFIER,
  googleServicesFromEnv: Boolean(process.env.GOOGLE_SERVICES_JSON),
});

const report = [
  "Store identity",
  formatIdentity(result.identity),
  ...result.warnings.map((warning) => `Warning: ${warning}`),
  ...result.errors.map((message) => `Error: ${message}`),
].join("\n");

console.log(report);

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### Store identity\n\n\`\`\`\n${report}\n\`\`\`\n`
  );
}

if (result.errors.length > 0) {
  process.exit(1);
}
