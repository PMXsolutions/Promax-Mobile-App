import fs from "node:fs";
import { formatBuildSummary, parseJsonFromOutput, publicReleaseNotice } from "./lib.mjs";

function readJson(file) {
  if (!file || !fs.existsSync(file)) {
    return null;
  }
  try {
    return parseJsonFromOutput(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function firstBuild(value) {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? value[0] : value;
}

const build = firstBuild(readJson(process.env.BUILD_VIEW_PATH) ?? readJson(process.env.BUILD_RESULT_PATH));
const lines = [];

if (build?.id) {
  lines.push(
    formatBuildSummary({
      id: build.id,
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
      hasArchive: Boolean(
        build.artifacts?.applicationArchiveUrl || build.artifacts?.buildUrl
      ),
    })
  );
} else {
  lines.push("No EAS build record was available to summarize.");
}

const submissionFile = readJson(process.env.SUBMISSION_LIST_PATH);
const submissions = Array.isArray(submissionFile)
  ? submissionFile
  : submissionFile
    ? [submissionFile]
    : [];
const submission = submissions[0];
if (submission?.id) {
  lines.push(
    [
      `Submission: ${submission.id}`,
      `Submission status: ${submission.status ?? ""}`,
      `Submission platform: ${submission.platform ?? ""}`,
      submission.androidConfig?.track
        ? `Play track: ${submission.androidConfig.track}`
        : "",
      submission.androidConfig?.releaseStatus
        ? `Play release status: ${submission.androidConfig.releaseStatus}`
        : "",
      submission.error?.message ? `Submission error: ${submission.error.message}` : "",
    ]
      .filter(Boolean)
      .join("\n")
  );
} else if (process.env.SUBMIT_EXIT) {
  lines.push(`eas submit exit code: ${process.env.SUBMIT_EXIT}`);
}

if (process.env.RELEASE_PLATFORM) {
  lines.push(publicReleaseNotice(process.env.RELEASE_PLATFORM));
}

lines.push(
  "A green workflow is not approval for a public store release. Known product defects and the 22 September 2026 Google Play policy rejection still have to be confirmed outside this repository."
);

const report = lines.join("\n\n");
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### Deployment result\n\n\`\`\`\n${report}\n\`\`\`\n`
  );
}
