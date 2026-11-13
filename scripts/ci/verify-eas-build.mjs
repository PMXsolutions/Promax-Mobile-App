import fs from "node:fs";
import {
  assessEasBuild,
  assertUuid,
  formatBuildSummary,
  parseJsonFromOutput,
} from "./lib.mjs";

function readOption(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return "";
  }
  return process.argv[index + 1] ?? "";
}

const uuidOnly = readOption("--assert-uuid");
if (uuidOnly) {
  try {
    process.stdout.write(`${assertUuid(uuidOnly)}\n`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  process.exit(0);
}

const file = readOption("--file");
const platform = readOption("--platform");
if (!file || !platform) {
  console.error("Usage: verify-eas-build.mjs --file <json> --platform android|ios");
  process.exit(1);
}

let record;
try {
  record = parseJsonFromOutput(fs.readFileSync(file, "utf8"));
} catch (error) {
  console.error(`Could not read the EAS build record: ${error.message}`);
  process.exit(1);
}

let result;
try {
  result = assessEasBuild(record, {
    platform,
    profile: readOption("--profile") || "production",
    expectCommit: readOption("--expect-commit"),
    expectId: readOption("--expect-id"),
    requirePlayPackage: process.argv.includes("--require-play-package"),
    requireIosIdentifier: process.argv.includes("--require-ios-identifier"),
    expectedIosBundleIdentifier: process.env.EXPECTED_IOS_BUNDLE_IDENTIFIER,
  });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const report = formatBuildSummary(result.summary);
console.error(report);
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### EAS build\n\n\`\`\`\n${report}\n\`\`\`\n`
  );
}

if (result.errors.length > 0) {
  for (const message of result.errors) {
    console.error(`Error: ${message}`);
  }
  process.exit(1);
}

process.stdout.write(`${result.id}\n`);
