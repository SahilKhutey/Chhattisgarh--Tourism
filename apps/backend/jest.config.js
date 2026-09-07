/** @type {import('jest').Config} */
module.exports = {
  rootDir: ".",
  moduleFileExtensions: ["js", "json", "ts"],
  testEnvironment: "node",
  setupFiles: ["<rootDir>/test/jest.setup.ts"],
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  testRegex: [".*\\.spec\\.ts$", ".*\\.e2e-spec\\.ts$"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.module.ts",
    "!src/main.ts",
    "!src/**/*.dto.ts",
    "!src/**/index.ts",
    "!src/scripts/**",
    "!src/prisma/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "lcov", "html"],
  clearMocks: true,
  restoreMocks: true,
  passWithNoTests: false,
};
