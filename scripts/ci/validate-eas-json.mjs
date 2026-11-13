import { assessEasJson, loadEasJson } from "./lib.mjs";

const errors = assessEasJson(loadEasJson());
if (errors.length > 0) {
  for (const message of errors) {
    console.error(message);
  }
  process.exit(1);
}

console.log(
  "eas.json keeps remote versions, the production API, the app bundle, and separate internal, TestFlight, and draft production submit profiles."
);
