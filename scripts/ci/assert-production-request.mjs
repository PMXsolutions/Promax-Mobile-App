import { assessProductionRequest } from "./lib.mjs";

const result = assessProductionRequest({
  ref: process.env.GIT_REF,
  platform: process.env.PLATFORM,
  testingApproved: process.env.TESTING_APPROVED,
  androidBuildId: process.env.ANDROID_BUILD_ID,
  iosBuildId: process.env.IOS_BUILD_ID,
});

if (result.errors.length > 0) {
  for (const message of result.errors) {
    console.error(message);
  }
  process.exit(1);
}

console.log("Production request is limited to main and names an approved build ID.");
if (result.androidBuildId) {
  console.log(`Android build: ${result.androidBuildId}`);
}
if (result.iosBuildId) {
  console.log(`iOS build: ${result.iosBuildId}`);
}
