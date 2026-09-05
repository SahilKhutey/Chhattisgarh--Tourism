import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const exists = (file) =>
  fs.existsSync(path.join(root, file));

test("repository has GitHub governance directory", () => {
  assert.equal(exists(".github"), true);
});

test("repository has pull request template", () => {
  assert.equal(
    exists(".github/pull_request_template.md"),
    true,
  );
});

test("repository has CODEOWNERS", () => {
  assert.equal(
    exists(".github/CODEOWNERS"),
    true,
  );
});

test("repository has issue templates", () => {
  assert.equal(
    exists(".github/ISSUE_TEMPLATE"),
    true,
  );
});

test("repository has scripts directory", () => {
  assert.equal(
    exists("scripts"),
    true,
  );
});

test("repository has gitignore", () => {
  assert.equal(
    exists(".gitignore"),
    true,
  );
});

test("Playwright reports are not present in working tree", () => {
  assert.equal(
    exists("playwright-report"),
    false,
  );
});

test("Playwright test results are not present in working tree", () => {
  assert.equal(
    exists("test-results"),
    false,
  );
});
