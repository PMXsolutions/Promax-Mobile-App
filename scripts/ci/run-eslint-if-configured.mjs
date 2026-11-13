import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "./lib.mjs";

const packageJson = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "package.json"), "utf8")
);
const dependencyNames = new Set([
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
]);
const configNames = [
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  "eslint.config.ts",
  ".eslintrc",
  ".eslintrc.js",
  ".eslintrc.cjs",
  ".eslintrc.json",
  ".eslintrc.yml",
  ".eslintrc.yaml",
];
const hasConfig = configNames.some((name) =>
  fs.existsSync(path.join(repoRoot, name))
);
const hasEslint = dependencyNames.has("eslint");

if (!hasConfig || !hasEslint) {
  const message = [
    "ESLint was not executed.",
    `package.json defines "lint" as "expo lint", but eslint is ${hasEslint ? "installed" : "not installed"} and an ESLint config file is ${hasConfig ? "present" : "not present"}.`,
    "This is a repository limitation, not a passed lint run.",
  ].join(" ");
  console.error(message);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `### Lint\n\n${message}\n`
    );
  }
  process.exit(0);
}

const result = spawnSync("npx", ["expo", "lint"], {
  cwd: repoRoot,
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 1);
