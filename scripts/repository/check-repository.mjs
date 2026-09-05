import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  ".gitignore",
  ".gitattributes",
  ".editorconfig",
  ".github/CODEOWNERS",
  ".github/pull_request_template.md",
];

const requiredDirectories = [
  ".github",
  ".github/ISSUE_TEMPLATE",
  ".github/workflows",
  "scripts",
];

let failed = false;

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function check(label, relativePath) {
  const ok = exists(relativePath);

  console.log(`${ok ? "✓" : "✗"} ${label}: ${relativePath}`);

  if (!ok) {
    failed = true;
  }
}

for (const file of requiredFiles) {
  check("required file", file);
}

for (const directory of requiredDirectories) {
  check("required directory", directory);
}

const forbiddenArtifacts = [
  "playwright-report",
  "test-results",
];

for (const artifact of forbiddenArtifacts) {
  const present = exists(artifact);

  console.log(
    `${present ? "✗" : "✓"} artifact check: ${artifact}`,
  );

  if (present) {
    failed = true;
  }
}

if (failed) {
  console.error("\nRepository validation failed.");
  process.exit(1);
}

console.log("\nRepository validation passed.");
